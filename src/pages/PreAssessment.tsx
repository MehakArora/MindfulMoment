import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useApp } from '../context'
import { SessionType, SessionDuration, BreathworkType } from '../types'
import StressSlider from '../components/StressSlider'

export default function PreAssessment() {
  const [stressLevel, setStressLevel] = useState(5)
  const { startSession } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  
  const state = location.state as { 
    type: SessionType
    duration: SessionDuration
    breathworkType?: BreathworkType 
  } | null
  
  if (!state) {
    return <Navigate to="/" replace />
  }

  const handleContinue = () => {
    startSession(state.type, state.duration, stressLevel, state.breathworkType)
    navigate('/session')
  }

  const getIcon = () => {
    if (state.type === 'meditation') return '🧘'
    return state.breathworkType === 'box' ? '⬜' : '🐡'
  }

  const getLabel = () => {
    if (state.type === 'meditation') return 'Meditation'
    return state.breathworkType === 'box' ? 'Box Breathing' : 'Puffer Fish Breathing'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">
              {getIcon()}
            </span>
            <h1 className="text-2xl font-bold text-ocean-800 mb-2">
              Before we begin
            </h1>
            <p className="text-gray-600">
              {state.duration}-minute {getLabel()}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-6 text-center">
              How stressed are you feeling right now?
            </h2>
            <StressSlider value={stressLevel} onChange={setStressLevel} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="btn-primary flex-1"
            >
              Begin Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
