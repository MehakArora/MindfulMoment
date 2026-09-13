// Audio utility for breath sounds
// Uses Web Audio API to generate calming breath-like sounds

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function playInhaleSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // Soft rising tone for inhale
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(180, ctx.currentTime)
    oscillator.frequency.linearRampToValueAtTime(220, ctx.currentTime + 2)
    
    // Fade in and sustain
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3.5)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 4)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 4)
  } catch (e) {
    console.log('Audio not available:', e)
  }
}

export function playExhaleSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // Soft falling tone for exhale
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(220, ctx.currentTime)
    oscillator.frequency.linearRampToValueAtTime(160, ctx.currentTime + 2)
    
    // Fade in and fade out
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3)
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 4)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 4)
  } catch (e) {
    console.log('Audio not available:', e)
  }
}

// Initialize audio context on user interaction (required by browsers)
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch (e) {
    console.log('Could not initialize audio:', e)
  }
}
