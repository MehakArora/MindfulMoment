import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context'
import { SessionType, SessionDuration, BreathworkType } from '../types'

const durations: SessionDuration[] = [1, 3, 5, 10]

type SelectionKey = 'pufferfish' | 'box' | 'meditation'

export default function Home() {
  const { participantId, logout } = useApp()
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState<SelectionKey | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration | null>(null)

  const handleSelect = (key: SelectionKey, duration: SessionDuration) => {
    setSelectedKey(key)
    setSelectedDuration(duration)
  }

  const handleStart = () => {
    if (selectedKey && selectedDuration) {
      const type: SessionType = selectedKey === 'meditation' ? 'meditation' : 'breathwork'
      const breathworkType: BreathworkType | undefined = 
        selectedKey === 'pufferfish' ? 'pufferfish' : 
        selectedKey === 'box' ? 'box' : undefined
      
      navigate('/pre-assessment', { 
        state: { type, breathworkType, duration: selectedDuration } 
      })
    }
  }

  const getSelectionLabel = () => {
    if (!selectedKey || !selectedDuration) return 'Select a session to begin'
    const labels: Record<SelectionKey, string> = {
      pufferfish: 'Puffer Fish Breathing',
      box: 'Box Breathing',
      meditation: 'Meditation'
    }
    return `Start ${selectedDuration}-minute ${labels[selectedKey]}`
  }

  return (
    <div className="min-h-screen p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ocean-800">MindfulMoment</h1>
          <p className="text-sm text-ocean-500">ID: {participantId}</p>
        </div>
        <button 
          onClick={logout}
          className="text-ocean-500 hover:text-ocean-700 text-sm"
        >
          Log out
        </button>
      </header>

      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Choose your session
        </h2>

        {/* Breathwork Section */}
        <div className="card mb-4">
          <h3 className="font-semibold text-lg text-ocean-800 mb-4">Breathwork</h3>
          
          {/* Puffer Fish Breathing */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🐡</span>
              <div>
                <p className="font-medium text-gray-700">Puffer Fish Breathing</p>
                <p className="text-xs text-gray-500">4s in, 2s hold, 4s out, 2s hold</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {durations.map(d => (
                <button
                  key={`pufferfish-${d}`}
                  onClick={() => handleSelect('pufferfish', d)}
                  className={`py-2 px-2 rounded-lg font-medium text-sm transition-all
                    ${selectedKey === 'pufferfish' && selectedDuration === d
                      ? 'bg-ocean-500 text-white shadow-md'
                      : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                    }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Box Breathing */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⬜</span>
              <div>
                <p className="font-medium text-gray-700">Box Breathing</p>
                <p className="text-xs text-gray-500">4s in, 4s hold, 4s out, 4s hold</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {durations.map(d => (
                <button
                  key={`box-${d}`}
                  onClick={() => handleSelect('box', d)}
                  className={`py-2 px-2 rounded-lg font-medium text-sm transition-all
                    ${selectedKey === 'box' && selectedDuration === d
                      ? 'bg-ocean-500 text-white shadow-md'
                      : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                    }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meditation Section */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🧘</span>
            <div>
              <h3 className="font-semibold text-lg text-ocean-800">Meditation</h3>
              <p className="text-sm text-gray-500">Guided meditation with calming visuals</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {durations.map(d => (
              <button
                key={`meditation-${d}`}
                onClick={() => handleSelect('meditation', d)}
                className={`py-3 px-2 rounded-lg font-medium transition-all
                  ${selectedKey === 'meditation' && selectedDuration === d
                    ? 'bg-ocean-500 text-white shadow-md'
                    : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                  }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!selectedKey || !selectedDuration}
          className="btn-primary w-full text-lg py-4"
        >
          {getSelectionLabel()}
        </button>
      </div>

      {/* Admin Link */}
      <div className="fixed bottom-4 right-4">
        <Link 
          to="/admin" 
          className="text-xs text-ocean-300 hover:text-ocean-500"
        >
          Admin
        </Link>
      </div>
    </div>
  )
}
