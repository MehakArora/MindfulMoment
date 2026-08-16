# Product Requirements Document

Mindful Nurse: Guided Meditation & Breathwork App for Nursing Student Research

Status: Draft v1 Owner: [DNP Student Name] Last updated: July 9, 2026

Purpose
Support a DNP research project studying whether brief guided meditation/breathwork sessions improve nursing students' self-reported state (e.g., stress, calm, focus) immediately before vs. after use. The app delivers guided sessions, captures a pre/post self-assessment around each session, and logs usage data for research analysis.

Background
Nursing students face high academic and clinical stress. Brief, structured mindfulness interventions are low-cost and scalable. This app is the study's data collection instrument as much as it is a wellness tool — every design decision should prioritize clean, exportable research data alongside a smooth user experience.

## Goals & Success Metrics
Goal: Enable repeatable, low-friction meditation practice


Metrics:

1. Keep track of sessions completed per participant
2. Measure perceived impact of each session via pre/post rating deltas per session of stress level rated 0-10

## Quantitative research analysis:

Clean, exportable dataset (CSV) with no missing required fields

Encourage adoption during the study window

% of enrolled participants with ≥1 completed session/week

Out of scope for v1: statistical analysis, long-term behavior change, clinical outcomes.

## Target Users:
Primary: Nursing students enrolled in the study (participants)

Secondary: DNP researcher / study administrator (needs read access to aggregated data, not a full analytics dashboard)

## Core User Flow

1. Participant logs in with a study-assigned anonymous ID (no real name required, to protect anonymity per IRB).
2. Participant selects a session length: 1, 3, 5, or 10 minutes.
3. Pre-session check-in: brief rating (e.g., current stress/calm/mood, 0–10 scale).
4. Guided session plays (audio-led breathwork + meditation, matched to selected duration).
5. Post-session check-in: same rating scale, repeated.
6. Post-session: Yes/No helpfulness question ("Was this session helpful?").
7. Session and ratings data are saved automatically; no user action required to "submit" data beyond completing the check-ins.

## Feature Requirements

### Guided Sessions

**Two session types, each with 4 durations (8 total sessions):**

#### 1. Breathwork Sessions
- **Durations:** 1, 3, 5, 10 minutes
- **Visual:** Animated pufferfish that inflates on inhale and deflates on exhale
- **Audio:** Breath sounds (inhale/exhale) synced with the pufferfish animation

#### 2. Meditation Sessions
- **Durations:** 1, 3, 5, 10 minutes
- **Visual:** Calming background (water/nature imagery)
- **Audio:** Guided meditation narration (provided by researcher)

**Session selection UI:** All 8 options displayed on one page, visually grouped by type (Breathwork vs Meditation) with duration options under each.

Simple playback controls: play/pause, progress indicator, exit (exit before completion should still log a "session incomplete" record — don't discard the data point).

Content itself (scripts/audio) is assumed to be provided by the researcher or a licensed source — out of scope for engineering build, but the app must support easily swapping/updating audio files without a code change (e.g., a simple content folder or CMS reference).

### Pre/Post Assessment

**Confirmed instrument:**
- **Pre-session:** Single-item stress rating (0–10 scale)
- **Post-session:** Same stress rating (0–10 scale) + Yes/No question: "Was this session helpful?"

Same instrument shown before and after every session, timestamped.

Required field — session cannot be marked "complete" without both pre and post responses (design should gently enforce this, not silently allow skips, since missing data undermines the research).

**Early exit handling:** If a student exits mid-session, still prompt for post-assessment but mark the session as "incomplete". Log start time, end time, and completion percentage.

### Usage Tracking / Analytics

Every session interaction logged with at minimum:

- Anonymized participant/study ID
- Session type (Breathwork / Meditation)
- Session date & timestamp (start and end)
- Duration selected (1/3/5/10 min)
- Completion status (completed / exited early) + completion percentage
- Pre-session stress rating (0-10)
- Post-session stress rating (0-10)
- Post-session helpfulness (Yes/No)

### Researcher-Facing Data Access

Simple export function: CSV export of all session-level records, one row per session.

No need for in-app charts/dashboards in v1 — researcher will likely analyze in SPSS/Excel/R.

Aggregate counts (e.g., total sessions, unique active participants) as a simple summary view is a nice-to-have, not required.

Non-Functional Requirements
Privacy/IRB compliance: No PII required for app use beyond a study ID; no PHI collected. Confirm with IRB whether device-level identifiers (IP, device ID) need to be excluded from logs.

Data storage: Data should be stored securely and be exportable only by the researcher/admin role.

Reliability: Session and rating data must persist even if the app is closed mid-session (avoid data loss).

Accessibility: Legible text, adequate contrast, and audio-first design so it's usable with eyes closed/minimal screen interaction during the session itself.

Platform & Technical Considerations
**Confirmed: Progressive Web App (PWA)** — installable, works offline in clinical settings with limited connectivity.

**Offline-first architecture:**
- Session data cached locally (IndexedDB/localStorage)
- Syncs to server when internet connection is available
- Audio files cached for offline playback

Lightweight backend/database to store session records (e.g., a simple hosted database) — no complex infrastructure needed for a study of this scale.

Open question: expected number of participants and study duration, which affects whether a simple no-code/low-code build (e.g., a form + audio player + database) is sufficient or a custom app is warranted.

Assumptions (to confirm with researcher/IRB)
Participants use a study-assigned anonymous ID rather than personal login credentials.

Pre/post scale will be a short, researcher-selected instrument (not yet specified).

Audio content for guided sessions will be sourced/recorded separately from app development.

No clinical or diagnostic claims are made by the app.

Data export is CSV, pulled manually by the researcher (no live dashboard needed for v1).

Open Questions
~~What specific pre/post scale should be used?~~ **RESOLVED:** Stress 0-10 + Yes/No helpfulness

How many participants and over what study duration?

Does the study require random assignment (e.g., control group with no meditation) or is it single-arm pre/post?

~~Web app vs. native app?~~ **RESOLVED:** PWA (Progressive Web App)

Who hosts/owns the data after the study concludes?

Suggested Milestones (lightweight build)
Phase

Deliverable

1

Finalize pre/post instrument + IRB approval

2

Build session player + duration selection (1/3/5/10 min)

3

Build pre/post check-in + ratings capture

4

Build data logging + CSV export

5

Pilot test with a small group, confirm data integrity

6

Launch to full study population