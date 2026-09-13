import { useState, useEffect, useRef } from 'react'
import { playInhaleSound, playExhaleSound } from '../utils/audio'

interface BoxBreathingProps {
  isPaused: boolean
}

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

const PHASE_DURATION = 4000 // 4 seconds per phase
const PHASE_ORDER: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out']

export default function BoxBreathing({ isPaused }: BoxBreathingProps) {
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [progress, setProgress] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastPhaseRef = useRef<BreathPhase | null>(null)

  // Play sounds when phase changes
  useEffect(() => {
    if (isPaused) return
    if (lastPhaseRef.current === phase) return
    
    lastPhaseRef.current = phase
    
    if (phase === 'inhale') {
      playInhaleSound()
    } else if (phase === 'exhale') {
      playExhaleSound()
    }
  }, [phase, isPaused])

  useEffect(() => {
    if (isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const newProgress = Math.min(elapsed / PHASE_DURATION, 1)
      setProgress(newProgress)

      if (newProgress >= 1) {
        // Move to next phase
        const currentIndex = PHASE_ORDER.indexOf(phase)
        const nextIndex = (currentIndex + 1) % PHASE_ORDER.length
        setPhase(PHASE_ORDER[nextIndex])
        setProgress(0)
        startTimeRef.current = currentTime
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, isPaused])

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe in'
      case 'hold-in': return 'Hold'
      case 'exhale': return 'Breathe out'
      case 'hold-out': return 'Hold'
    }
  }

  const getActiveSide = () => {
    switch (phase) {
      case 'inhale': return 'top'
      case 'hold-in': return 'right'
      case 'exhale': return 'bottom'
      case 'hold-out': return 'left'
    }
  }

  const activeSide = getActiveSide()
  const boxSize = 200
  const strokeWidth = 8

  // Sage green colors
  const sageBase = '#9CAF88' // Light sage green for inactive
  const sageActive = '#5C7A4A' // Darker sage green for active/lit up

  return (
    <div className="flex flex-col items-center">
      {/* Box visualization */}
      <div className="relative" style={{ width: boxSize, height: boxSize }}>
        <svg 
          viewBox={`0 0 ${boxSize} ${boxSize}`} 
          className="w-full h-full"
        >
          {/* Background box */}
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={boxSize - strokeWidth}
            height={boxSize - strokeWidth}
            fill="none"
            stroke={sageBase}
            strokeWidth={strokeWidth}
            rx={12}
          />

          {/* Top side - Inhale */}
          <line
            x1={strokeWidth}
            y1={strokeWidth / 2}
            x2={boxSize - strokeWidth}
            y2={strokeWidth / 2}
            stroke={activeSide === 'top' ? sageActive : sageBase}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={boxSize - strokeWidth * 2}
            strokeDashoffset={activeSide === 'top' ? (1 - progress) * (boxSize - strokeWidth * 2) : 0}
            className="transition-colors duration-300"
          />

          {/* Right side - Hold in */}
          <line
            x1={boxSize - strokeWidth / 2}
            y1={strokeWidth}
            x2={boxSize - strokeWidth / 2}
            y2={boxSize - strokeWidth}
            stroke={activeSide === 'right' ? sageActive : sageBase}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={boxSize - strokeWidth * 2}
            strokeDashoffset={activeSide === 'right' ? (1 - progress) * (boxSize - strokeWidth * 2) : 0}
            className="transition-colors duration-300"
          />

          {/* Bottom side - Exhale */}
          <line
            x1={boxSize - strokeWidth}
            y1={boxSize - strokeWidth / 2}
            x2={strokeWidth}
            y2={boxSize - strokeWidth / 2}
            stroke={activeSide === 'bottom' ? sageActive : sageBase}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={boxSize - strokeWidth * 2}
            strokeDashoffset={activeSide === 'bottom' ? (1 - progress) * (boxSize - strokeWidth * 2) : 0}
            className="transition-colors duration-300"
          />

          {/* Left side - Hold out */}
          <line
            x1={strokeWidth / 2}
            y1={boxSize - strokeWidth}
            x2={strokeWidth / 2}
            y2={strokeWidth}
            stroke={activeSide === 'left' ? sageActive : sageBase}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={boxSize - strokeWidth * 2}
            strokeDashoffset={activeSide === 'left' ? (1 - progress) * (boxSize - strokeWidth * 2) : 0}
            className="transition-colors duration-300"
          />

          {/* Corner indicators */}
          {['top', 'right', 'bottom', 'left'].map((side, i) => {
            const positions = [
              { cx: strokeWidth, cy: strokeWidth }, // top-left (start of top)
              { cx: boxSize - strokeWidth, cy: strokeWidth }, // top-right (start of right)
              { cx: boxSize - strokeWidth, cy: boxSize - strokeWidth }, // bottom-right (start of bottom)
              { cx: strokeWidth, cy: boxSize - strokeWidth }, // bottom-left (start of left)
            ]
            const isActive = activeSide === side
            return (
              <circle
                key={side}
                cx={positions[i].cx}
                cy={positions[i].cy}
                r={isActive ? 10 : 6}
                fill={isActive ? sageActive : sageBase}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>

        {/* Center instruction */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 text-xl font-medium">
              {isPaused ? 'Paused' : getInstruction()}
            </p>
            {!isPaused && (
              <p className="text-gray-500 text-sm mt-1">
                {Math.ceil(4 - progress * 4)}s
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
