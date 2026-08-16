import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useApp } from '../context'
import StressSlider from '../components/StressSlider'

export default function PostAssessment() {
  const [stressLevel, setStressLevel] = useState(5)
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null)
  const { currentSession, completeSession, cancelSession } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  
  const state = location.state as { completionPercentage: number; incomplete?: boolean } | null

  if (!currentSession || !state) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async () => {
    if (wasHelpful === null) return
    
    if (state.incomplete) {
      await cancelSession(state.completionPercentage, stressLevel, wasHelpful)
    } else {
      await completeSession(stressLevel, wasHelpful, state.completionPercentage)
    }
    navigate('/complete', { 
      state: { 
        incomplete: state.incomplete,
        completionPercentage: state.completionPercentage 
      } 
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">
              {state.incomplete ? '🌤️' : '✨'}
            </span>
            <h1 className="text-2xl font-bold text-ocean-800 mb-2">
              {state.incomplete ? 'Before you go...' : 'Session complete!'}
            </h1>
            <p className="text-gray-600">
              {state.incomplete 
                ? `You completed ${state.completionPercentage}% of the session`
                : 'Great job taking time for yourself'
              }
            </p>
          </div>

          {/* Stress Rating */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-6 text-center">
              How stressed are you feeling now?
            </h2>
            <StressSlider value={stressLevel} onChange={setStressLevel} />
          </div>

          {/* Helpfulness Question */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Was this session helpful?
            </h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setWasHelpful(true)}
                className={`flex-1 max-w-32 py-4 rounded-xl font-medium text-lg transition-all
                  ${wasHelpful === true 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                👍 Yes
              </button>
              <button
                onClick={() => setWasHelpful(false)}
                className={`flex-1 max-w-32 py-4 rounded-xl font-medium text-lg transition-all
                  ${wasHelpful === false 
                    ? 'bg-red-400 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                👎 No
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={wasHelpful === null}
            className="btn-primary w-full"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  )
}
