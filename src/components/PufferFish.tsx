import { useState, useEffect } from 'react'

interface PufferFishProps {
  isPaused: boolean
}

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

const BREATH_CYCLE = {
  inhale: 4000,
  'hold-in': 2000,
  exhale: 4000,
  'hold-out': 2000
}

const PHASE_ORDER: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out']

export default function PufferFish({ isPaused }: PufferFishProps) {
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (isPaused) return

    const phaseIndex = PHASE_ORDER.indexOf(phase)
    const duration = BREATH_CYCLE[phase]

    const timer = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % PHASE_ORDER.length
      setPhase(PHASE_ORDER[nextIndex])
    }, duration)

    return () => clearTimeout(timer)
  }, [phase, isPaused])

  useEffect(() => {
    if (isPaused) return

    if (phase === 'inhale') {
      setScale(1.5)
    } else if (phase === 'exhale') {
      setScale(1)
    }
  }, [phase, isPaused])

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe in...'
      case 'hold-in': return 'Hold...'
      case 'exhale': return 'Breathe out...'
      case 'hold-out': return 'Hold...'
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Pufferfish */}
      <div 
        className="relative transition-transform ease-in-out"
        style={{ 
          transform: `scale(${scale})`,
          transitionDuration: phase === 'inhale' || phase === 'exhale' ? '4s' : '0s'
        }}
      >
        {/* Main body */}
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {/* Body */}
          <ellipse 
            cx="100" 
            cy="110" 
            rx="70" 
            ry="60" 
            fill="#FFD166"
            stroke="#F4A261"
            strokeWidth="3"
          />
          
          {/* Spines (show more when inflated) */}
          <g opacity={scale > 1.2 ? 1 : 0.3} className="transition-opacity duration-1000">
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180)
              const x1 = 100 + Math.cos(angle) * 55
              const y1 = 110 + Math.sin(angle) * 45
              const x2 = 100 + Math.cos(angle) * 75
              const y2 = 110 + Math.sin(angle) * 60
              return (
                <line 
                  key={i}
                  x1={x1} 
                  y1={y1} 
                  x2={x2} 
                  y2={y2}
                  stroke="#E76F51"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )
            })}
          </g>
          
          {/* Belly pattern */}
          <ellipse 
            cx="100" 
            cy="120" 
            rx="45" 
            ry="35" 
            fill="#FFF3CD"
          />
          
          {/* Left eye */}
          <circle cx="75" cy="90" r="15" fill="white" />
          <circle cx="78" cy="90" r="8" fill="#264653" />
          <circle cx="80" cy="87" r="3" fill="white" />
          
          {/* Right eye */}
          <circle cx="125" cy="90" r="15" fill="white" />
          <circle cx="128" cy="90" r="8" fill="#264653" />
          <circle cx="130" cy="87" r="3" fill="white" />
          
          {/* Mouth */}
          <path 
            d="M 90 130 Q 100 140 110 130" 
            fill="none" 
            stroke="#264653" 
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Top fin */}
          <path 
            d="M 100 50 Q 110 30 100 55 Q 90 30 100 50" 
            fill="#2A9D8F"
          />
          
          {/* Tail fin */}
          <path 
            d="M 165 110 Q 190 90 185 110 Q 190 130 165 110" 
            fill="#2A9D8F"
          />
          
          {/* Side fin */}
          <ellipse 
            cx="40" 
            cy="110" 
            rx="15" 
            ry="10" 
            fill="#2A9D8F"
          />
          
          {/* Cheek blush */}
          <ellipse cx="60" cy="110" rx="8" ry="5" fill="#FFADAD" opacity="0.6" />
          <ellipse cx="140" cy="110" rx="8" ry="5" fill="#FFADAD" opacity="0.6" />
        </svg>
      </div>

      {/* Instruction */}
      <p className="text-white text-2xl font-light mt-8 animate-pulse">
        {isPaused ? 'Paused' : getInstruction()}
      </p>
    </div>
  )
}
