import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context'

export default function Login() {
  const [studyId, setStudyId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!studyId.trim()) {
      setError('Please enter your Study ID')
      return
    }
    
    setLoading(true)
    try {
      const success = await login(studyId)
      if (success) {
        navigate('/')
      } else {
        setError('Could not log in. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐡</div>
          <h1 className="text-3xl font-bold text-ocean-800 mb-2">MindfulMoment</h1>
          <p className="text-ocean-600">Guided meditation & breathwork</p>
        </div>
        
        <form onSubmit={handleSubmit} className="card">
          <label htmlFor="studyId" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your Study ID
          </label>
          <input
            id="studyId"
            type="text"
            value={studyId}
            onChange={(e) => setStudyId(e.target.value)}
            placeholder="e.g., STUDY001"
            className="w-full px-4 py-3 border-2 border-ocean-200 rounded-xl text-lg
                     focus:outline-none focus:border-ocean-500 transition-colors"
            autoComplete="off"
            autoFocus
          />
          
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
        
        <p className="text-center text-sm text-ocean-500 mt-6">
          Your Study ID was provided by the researcher
        </p>
      </div>
    </div>
  )
}
