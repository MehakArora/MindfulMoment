import { useNavigate, useLocation } from 'react-router-dom'

export default function Complete() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { incomplete?: boolean; completionPercentage?: number } | null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="card">
          <span className="text-7xl mb-6 block">
            {state?.incomplete ? '🌱' : '🎉'}
          </span>
          
          <h1 className="text-2xl font-bold text-ocean-800 mb-3">
            {state?.incomplete ? 'Thank you!' : 'Well done!'}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {state?.incomplete 
              ? 'Every moment of mindfulness counts. Come back anytime.'
              : 'You completed your session. Your data has been saved.'
            }
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="btn-primary w-full"
            >
              Start another session
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              Return home
            </button>
          </div>
        </div>

        <p className="text-sm text-ocean-400 mt-6">
          Thank you for participating in this study
        </p>
      </div>
    </div>
  )
}
