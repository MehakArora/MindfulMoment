import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, SessionType, SessionDuration } from './types'
import { saveParticipant, getParticipant, saveSession, generateSessionId } from './db'

interface AppContextType {
  participantId: string | null
  currentSession: Partial<Session> | null
  login: (id: string) => Promise<boolean>
  logout: () => void
  startSession: (type: SessionType, duration: SessionDuration, preStress: number) => void
  updateSession: (updates: Partial<Session>) => void
  completeSession: (postStress: number, wasHelpful: boolean, completionPercentage: number) => Promise<void>
  cancelSession: (completionPercentage: number, postStress?: number, wasHelpful?: boolean) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [participantId, setParticipantId] = useState<string | null>(() => {
    return localStorage.getItem('participantId')
  })
  const [currentSession, setCurrentSession] = useState<Partial<Session> | null>(null)

  useEffect(() => {
    if (participantId) {
      localStorage.setItem('participantId', participantId)
    } else {
      localStorage.removeItem('participantId')
    }
  }, [participantId])

  const login = async (id: string): Promise<boolean> => {
    const trimmedId = id.trim().toUpperCase()
    if (!trimmedId) return false
    
    let participant = await getParticipant(trimmedId)
    const now = new Date().toISOString()
    
    if (!participant) {
      participant = {
        id: trimmedId,
        createdAt: now,
        lastActiveAt: now
      }
    } else {
      participant.lastActiveAt = now
    }
    
    await saveParticipant(participant)
    setParticipantId(trimmedId)
    return true
  }

  const logout = () => {
    setParticipantId(null)
    setCurrentSession(null)
  }

  const startSession = (type: SessionType, duration: SessionDuration, preStress: number) => {
    if (!participantId) return
    
    const session: Partial<Session> = {
      id: generateSessionId(),
      participantId,
      sessionType: type,
      duration,
      startTime: new Date().toISOString(),
      preStressRating: preStress,
      completed: false,
      synced: false
    }
    
    setCurrentSession(session)
  }

  const updateSession = (updates: Partial<Session>) => {
    setCurrentSession(prev => prev ? { ...prev, ...updates } : null)
  }

  const completeSession = async (postStress: number, wasHelpful: boolean, completionPercentage: number) => {
    if (!currentSession || !currentSession.id) return
    
    const completedSession: Session = {
      ...currentSession as Session,
      endTime: new Date().toISOString(),
      completionPercentage,
      completed: true,
      postStressRating: postStress,
      wasHelpful,
      synced: false
    }
    
    await saveSession(completedSession)
    setCurrentSession(null)
  }

  const cancelSession = async (completionPercentage: number, postStress?: number, wasHelpful?: boolean) => {
    if (!currentSession || !currentSession.id) return
    
    const cancelledSession: Session = {
      ...currentSession as Session,
      endTime: new Date().toISOString(),
      completionPercentage,
      completed: false,
      postStressRating: postStress ?? null,
      wasHelpful: wasHelpful ?? null,
      synced: false
    }
    
    await saveSession(cancelledSession)
    setCurrentSession(null)
  }

  return (
    <AppContext.Provider value={{
      participantId,
      currentSession,
      login,
      logout,
      startSession,
      updateSession,
      completeSession,
      cancelSession
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
