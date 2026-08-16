export type SessionType = 'breathwork' | 'meditation'

export type SessionDuration = 1 | 3 | 5 | 10

export interface Session {
  id: string
  participantId: string
  sessionType: SessionType
  duration: SessionDuration
  startTime: string
  endTime: string | null
  completionPercentage: number
  completed: boolean
  preStressRating: number
  postStressRating: number | null
  wasHelpful: boolean | null
  synced: boolean
}

export interface Participant {
  id: string
  createdAt: string
  lastActiveAt: string
}

export interface AppState {
  currentParticipantId: string | null
  currentSession: Partial<Session> | null
}
