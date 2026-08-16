import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllSessions, getAllParticipants, exportSessionsToCSV } from '../db'
import { Session, Participant } from '../types'

export default function Admin() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sessionsData, participantsData] = await Promise.all([
        getAllSessions(),
        getAllParticipants()
      ])
      setSessions(sessionsData)
      setParticipants(participantsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const csv = await exportSessionsToCSV()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindful-moment-data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export data')
    }
  }

  const completedSessions = sessions.filter(s => s.completed)
  const avgStressReduction = completedSessions.length > 0
    ? completedSessions.reduce((acc, s) => {
        const reduction = s.preStressRating - (s.postStressRating ?? s.preStressRating)
        return acc + reduction
      }, 0) / completedSessions.length
    : 0

  const helpfulCount = sessions.filter(s => s.wasHelpful === true).length
  const helpfulPercentage = sessions.length > 0 
    ? Math.round((helpfulCount / sessions.filter(s => s.wasHelpful !== null).length) * 100) 
    : 0

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ocean-800">Admin Panel</h1>
            <p className="text-sm text-ocean-500">Research data export</p>
          </div>
          <Link to="/" className="text-ocean-500 hover:text-ocean-700">
            ← Back to app
          </Link>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card text-center">
                <p className="text-3xl font-bold text-ocean-600">{participants.length}</p>
                <p className="text-sm text-gray-500">Participants</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-ocean-600">{sessions.length}</p>
                <p className="text-sm text-gray-500">Total Sessions</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-ocean-600">{completedSessions.length}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-green-600">
                  {avgStressReduction > 0 ? '-' : ''}{avgStressReduction.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Avg Stress Δ</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Sessions marked helpful:</span>{' '}
                  <span className="font-medium">{helpfulCount} ({helpfulPercentage}%)</span>
                </p>
                <p>
                  <span className="text-gray-500">Breathwork sessions:</span>{' '}
                  <span className="font-medium">
                    {sessions.filter(s => s.sessionType === 'breathwork').length}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Meditation sessions:</span>{' '}
                  <span className="font-medium">
                    {sessions.filter(s => s.sessionType === 'meditation').length}
                  </span>
                </p>
              </div>
            </div>

            {/* Export */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h2>
              <p className="text-sm text-gray-600 mb-4">
                Download all session data as a CSV file for analysis in Excel, SPSS, or R.
              </p>
              <button
                onClick={handleExport}
                disabled={sessions.length === 0}
                className="btn-primary"
              >
                Download CSV ({sessions.length} sessions)
              </button>
            </div>

            {/* Recent Sessions Table */}
            {sessions.length > 0 && (
              <div className="card mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Sessions
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2">Participant</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Duration</th>
                        <th className="pb-2">Pre</th>
                        <th className="pb-2">Post</th>
                        <th className="pb-2">Δ</th>
                        <th className="pb-2">Helpful</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(-10).reverse().map(session => (
                        <tr key={session.id} className="border-b border-gray-100">
                          <td className="py-2 font-mono text-xs">{session.participantId}</td>
                          <td className="py-2 capitalize">{session.sessionType}</td>
                          <td className="py-2">{session.duration}m</td>
                          <td className="py-2">{session.preStressRating}</td>
                          <td className="py-2">{session.postStressRating ?? '-'}</td>
                          <td className="py-2">
                            {session.postStressRating !== null 
                              ? (session.preStressRating - session.postStressRating > 0 ? '-' : '') + 
                                (session.preStressRating - session.postStressRating)
                              : '-'
                            }
                          </td>
                          <td className="py-2">
                            {session.wasHelpful === null ? '-' : session.wasHelpful ? '👍' : '👎'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
