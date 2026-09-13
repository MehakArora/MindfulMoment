#!/usr/bin/env python3
"""Embed CXR radiology notes for ARF encounters in a time window relative to ventilation start.

Hours are measured from vent start: 0 is vent start, negative is before vent.
Example windows:
  --window-start -24 --window-end 0     notes in [-24h, 0]
  --window-start -12 --window-end -6    notes in [-12h, -6h]
  --window-start -inf --window-end 0    all notes up through vent start
  --window-start -inf --window-end -6   all history up to 6h before vent
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from transformers import AutoModel, AutoTokenizer

# ──────────────────────────────────────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────────────────────────────────────

MODEL_NAME = "microsoft/BiomedVLP-CXR-BERT-specialized"
CACHE_DIR = "/hpc/dctrl/ma618/hf_cache"
BASE_SAVE_DIR = Path("/work/ma618/arf_note_embeddings")
FEATURES_PATH = Path(
    "/hpc/group/kamaleswaranlab/Emory_Deid_Tables_Tilendra/"
    "SepsisInduced_ARF_Phenotypes/"
    "ARF_features_before_imputation_MICUemory_v4_matching_new_Latest.dsv"
)
NOTES_PATH = Path(
    "/hpc/group/kamaleswaranlab/EmoryDataset/EMR_RAW/noPHI/"
    "Combined_Radiology_Notes_with_EncounterNumber_batch_deid.dsv"
)


def window_dir_label(window_start: float, window_end: float) -> str:
    start = "hist" if math.isinf(window_start) and window_start < 0 else _fmt_hours(window_start)
    return f"{start}_to_{_fmt_hours(window_end)}"


def _fmt_hours(hours: float) -> str:
    if math.isinf(hours):
        return "inf" if hours > 0 else "hist"
    if float(hours).is_integer():
        return str(int(hours))
    return str(hours)


def save_paths_for_window(base_save_dir: Path, window_start: float, window_end: float) -> dict[str, Path]:
    label = window_dir_label(window_start, window_end)
    return {
        "most_recent": base_save_dir / f"{label}_most_recent",
        "aggregated": base_save_dir / f"{label}_aggregated",
        "concatenated": base_save_dir / f"{label}_concatenated",
    }


# ──────────────────────────────────────────────────────────────────────────────
# Model loading
# ──────────────────────────────────────────────────────────────────────────────

def load_model(cache_dir: str = CACHE_DIR):
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME, trust_remote_code=True, cache_dir=cache_dir
    )
    model = AutoModel.from_pretrained(
        MODEL_NAME, trust_remote_code=True, device_map="auto", cache_dir=cache_dir
    )
    model.eval()
    return tokenizer, model


def _model_device(model) -> torch.device:
    if hasattr(model, "device"):
        return model.device
    return next(model.parameters()).device


# ──────────────────────────────────────────────────────────────────────────────
# Embedding helpers
# ──────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def embed_text(text: str, tokenizer, model) -> np.ndarray:
    """Embed a single text string using CXR-BERT. Returns a 1-D numpy array."""
    device = _model_device(model)
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    output = model(**inputs)
    return output.last_hidden_state[:, 0, :].squeeze(0).cpu().numpy()


@torch.no_grad()
def embed_texts_batch(texts: list[str], tokenizer, model, batch_size: int = 32) -> np.ndarray:
    """Embed a list of texts. Returns array of shape (N, hidden_dim)."""
    device = _model_device(model)
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        output = model(**inputs)
        all_embeddings.append(output.last_hidden_state[:, 0, :].cpu().numpy())
    return np.vstack(all_embeddings)


# ──────────────────────────────────────────────────────────────────────────────
# Window filtering
# ──────────────────────────────────────────────────────────────────────────────

def get_notes_in_window(
    df_csn: pd.DataFrame,
    vent_start: pd.Timestamp,
    window_start: float,
    window_end: float,
) -> pd.DataFrame:
    """Return notes whose time is in [window_start, window_end] hours from vent_start.

    Both bounds are hours relative to ventilation start (0 = vent start).
    ``window_start=-inf`` includes all history up to ``window_end``.
    """
    hours_from_vent = (df_csn["timestamp"] - vent_start).dt.total_seconds() / 3600.0
    mask = hours_from_vent <= window_end
    if not (math.isinf(window_start) and window_start < 0):
        mask = mask & (hours_from_vent >= window_start)
    return df_csn.loc[mask].sort_values("timestamp").reset_index(drop=True)


# ──────────────────────────────────────────────────────────────────────────────
# Embedding strategies
# ──────────────────────────────────────────────────────────────────────────────

def compute_most_recent_embedding(notes_window: pd.DataFrame, tokenizer, model):
    """Embed the most recent note in the window."""
    if notes_window.empty:
        return None
    return embed_text(notes_window.iloc[-1]["notes"], tokenizer, model)


def compute_aggregated_embedding(
    notes_window: pd.DataFrame, vent_start: pd.Timestamp, tokenizer, model
):
    """Weighted average of note embeddings; weights = inverse time-to-vent, normalized."""
    if notes_window.empty:
        return None

    time_diffs_hrs = (vent_start - notes_window["timestamp"]).dt.total_seconds() / 3600.0
    time_diffs_hrs = time_diffs_hrs.clip(lower=1e-3)
    raw_weights = 1.0 / time_diffs_hrs
    weights = (raw_weights / raw_weights.sum()).values

    embeddings = embed_texts_batch(notes_window["notes"].tolist(), tokenizer, model)
    return np.average(embeddings, axis=0, weights=weights)


def compute_concatenated_embedding(notes_window: pd.DataFrame, tokenizer, model):
    """Concatenate all notes chronologically, then embed the combined text."""
    if notes_window.empty:
        return None
    concatenated_text = " ".join(notes_window["notes"].tolist())
    return embed_text(concatenated_text, tokenizer, model)


# ──────────────────────────────────────────────────────────────────────────────
# Save utility
# ──────────────────────────────────────────────────────────────────────────────

def save_embedding(embedding: np.ndarray, save_dir: Path, csn: str):
    save_dir.mkdir(parents=True, exist_ok=True)
    np.save(save_dir / f"{csn}.npy", embedding)


# ──────────────────────────────────────────────────────────────────────────────
# Main pipeline
# ──────────────────────────────────────────────────────────────────────────────

def process_csns(
    df: pd.DataFrame,
    tokenizer,
    model,
    window_start: float,
    window_end: float,
    base_save_dir: Path = BASE_SAVE_DIR,
):
    """Generate and save embeddings for every CSN in [window_start, window_end] hours from vent.

    ``window_start`` / ``window_end`` are hours from ventilation start (0 = vent start).
    Use ``window_start=-inf`` to include all notes in history up to ``window_end``.
    """
    if window_end < window_start and not math.isinf(window_start):
        raise ValueError(
            f"window_end ({window_end}) must be >= window_start ({window_start})"
        )

    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["vent_start"] = pd.to_datetime(df["vent_start"])

    paths = save_paths_for_window(Path(base_save_dir), window_start, window_end)
    label = window_dir_label(window_start, window_end)
    print(f"Window [{label}] hours from vent start. Saving under {base_save_dir}")

    n_saved = 0
    n_empty = 0
    for csn, group in df.groupby("csn"):
        vent_start = group["vent_start"].iloc[0]
        window = get_notes_in_window(group, vent_start, window_start, window_end)
        if window.empty:
            n_empty += 1
            print(f"Skip (empty window): CSN {csn}")
            continue

        emb = compute_most_recent_embedding(window, tokenizer, model)
        if emb is not None:
            save_embedding(emb, paths["most_recent"], str(csn))

        emb = compute_aggregated_embedding(window, vent_start, tokenizer, model)
        if emb is not None:
            save_embedding(emb, paths["aggregated"], str(csn))

        emb = compute_concatenated_embedding(window, tokenizer, model)
        if emb is not None:
            save_embedding(emb, paths["concatenated"], str(csn))

        n_saved += 1
        print(f"Done: CSN {csn} ({len(window)} notes)")

    print(f"Finished window [{label}]: saved {n_saved} CSNs, skipped {n_empty} empty")


def load_cxr_notes(features_path: Path = FEATURES_PATH, notes_path: Path = NOTES_PATH) -> pd.DataFrame:
    d1 = pd.read_csv(features_path, sep="|")
    arf_csns_to_vent_start = dict(zip(d1["csn"], d1["vent_start_time"]))

    deid_notes = pd.read_csv(notes_path, sep="|", low_memory=False)
    deid_notes["DAY_VERIFIED"] = pd.to_datetime(deid_notes["DAY_VERIFIED"])

    arf_notes = deid_notes.loc[deid_notes.ENCOUNTER_NBR.isin(arf_csns_to_vent_start.keys())]
    arf_notes_cxr = arf_notes.loc[
        arf_notes.HNAM_DOCUMENT_CLINICAL_NM.str.lower().str.contains("xr chest")
    ].copy()

    arf_notes_cxr["vent_start"] = pd.to_datetime(
        arf_notes_cxr["ENCOUNTER_NBR"].map(arf_csns_to_vent_start)
    )
    arf_notes_cxr = arf_notes_cxr.rename(
        columns={
            "ENCOUNTER_NBR": "csn",
            "DAY_VERIFIED": "timestamp",
            "notes_deid": "notes",
        }
    )
    return arf_notes_cxr


def parse_hours(value: str) -> float:
    v = value.strip().lower()
    if v in {"-inf", "-infinity", "neginf", "hist", "-float('inf')"}:
        return float("-inf")
    if v in {"inf", "+inf", "infinity"}:
        return float("inf")
    return float(value)


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--window-start",
        type=parse_hours,
        default=-24.0,
        help="Window start in hours from vent start. Use -inf for all history. Default: -24",
    )
    parser.add_argument(
        "--window-end",
        type=parse_hours,
        default=0.0,
        help="Window end in hours from vent start (e.g. 0, -6, -12, -24). Default: 0",
    )
    parser.add_argument("--base-save-dir", type=Path, default=BASE_SAVE_DIR)
    parser.add_argument("--features-path", type=Path, default=FEATURES_PATH)
    parser.add_argument("--notes-path", type=Path, default=NOTES_PATH)
    parser.add_argument("--cache-dir", type=str, default=CACHE_DIR)
    return parser.parse_args()


def main():
    args = parse_args()
    notes = load_cxr_notes(args.features_path, args.notes_path)
    tokenizer, model = load_model(args.cache_dir)
    process_csns(
        notes,
        tokenizer,
        model,
        window_start=args.window_start,
        window_end=args.window_end,
        base_save_dir=args.base_save_dir,
    )


if __name__ == "__main__":
    main()
