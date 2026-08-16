import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context'
import { SessionType, SessionDuration } from '../types'

const durations: SessionDuration[] = [1, 3, 5, 10]

export default function Home() {
  const { participantId, logout } = useApp()
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<SessionType | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration | null>(null)

  const handleSelect = (type: SessionType, duration: SessionDuration) => {
    setSelectedType(type)
    setSelectedDuration(duration)
  }

  const handleStart = () => {
    if (selectedType && selectedDuration) {
      navigate('/pre-assessment', { 
        state: { type: selectedType, duration: selectedDuration } 
      })
    }
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
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🐡</span>
            <div>
              <h3 className="font-semibold text-lg text-ocean-800">Breathwork</h3>
              <p className="text-sm text-gray-500">Follow the pufferfish breathing guide</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {durations.map(d => (
              <button
                key={`breathwork-${d}`}
                onClick={() => handleSelect('breathwork', d)}
                className={`py-3 px-2 rounded-lg font-medium transition-all
                  ${selectedType === 'breathwork' && selectedDuration === d
                    ? 'bg-ocean-500 text-white shadow-md'
                    : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                  }`}
              >
                {d} min
              </button>
            ))}
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
                  ${selectedType === 'meditation' && selectedDuration === d
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
          disabled={!selectedType || !selectedDuration}
          className="btn-primary w-full text-lg py-4"
        >
          {selectedType && selectedDuration 
            ? `Start ${selectedDuration}-minute ${selectedType}`
            : 'Select a session to begin'
          }
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
