import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context'
import PufferFish from '../components/PufferFish'
import MeditationBackground from '../components/MeditationBackground'

export default function Session() {
  const { currentSession, updateSession } = useApp()
  const navigate = useNavigate()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const intervalRef = useRef<number | null>(null)
  
  if (!currentSession || !currentSession.duration) {
    return <Navigate to="/" replace />
  }

  const totalSeconds = currentSession.duration * 60
  const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100)
  const isComplete = elapsedSeconds >= totalSeconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0)

  useEffect(() => {
    if (!isPaused && !isComplete) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, isComplete])

  useEffect(() => {
    if (isComplete) {
      updateSession({ completionPercentage: 100 })
      navigate('/post-assessment', { state: { completionPercentage: 100 } })
    }
  }, [isComplete, navigate, updateSession])

  const handlePauseToggle = () => {
    setIsPaused(!isPaused)
  }

  const handleExit = () => {
    setShowExitConfirm(true)
    setIsPaused(true)
  }

  const confirmExit = () => {
    const completionPercentage = Math.round((elapsedSeconds / totalSeconds) * 100)
    updateSession({ completionPercentage })
    navigate('/post-assessment', { state: { completionPercentage, incomplete: true } })
  }

  const cancelExit = () => {
    setShowExitConfirm(false)
    setIsPaused(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      {currentSession.sessionType === 'meditation' ? (
        <MeditationBackground />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-200 to-ocean-400" />
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Timer */}
        <div className="text-center mb-8">
          <p className="text-white/80 text-sm mb-1">Time remaining</p>
          <p className="text-5xl font-light text-white tabular-nums">
            {formatTime(remainingSeconds)}
          </p>
        </div>

        {/* Visual */}
        <div className="flex-1 flex items-center justify-center w-full max-w-sm">
          {currentSession.sessionType === 'breathwork' ? (
            <PufferFish isPaused={isPaused} />
          ) : (
            <div className="text-center text-white/90">
              <p className="text-xl mb-2">Breathe deeply</p>
              <p className="text-white/60">Let your thoughts settle</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-6">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-white/20 text-white rounded-xl 
                     hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            Exit
          </button>
          <button
            onClick={handlePauseToggle}
            className="px-8 py-3 bg-white text-ocean-600 rounded-xl font-medium
                     hover:bg-white/90 transition-colors shadow-lg"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Exit session?
            </h3>
            <p className="text-gray-600 mb-6">
              You've completed {Math.round(progress)}% of this session. 
              You'll still be asked a few questions before leaving.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="btn-secondary flex-1"
              >
                Continue
              </button>
              <button
                onClick={confirmExit}
                className="btn-primary flex-1"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
