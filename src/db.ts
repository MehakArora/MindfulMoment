import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Session, Participant } from './types'

interface MindfulMomentDB extends DBSchema {
  sessions: {
    key: string
    value: Session
    indexes: {
      'by-participant': string
      'by-synced': number
    }
  }
  participants: {
    key: string
    value: Participant
  }
}

let dbPromise: Promise<IDBPDatabase<MindfulMomentDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MindfulMomentDB>('mindful-moment', 1, {
      upgrade(db) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('by-participant', 'participantId')
        sessionStore.createIndex('by-synced', 'synced')
        
        db.createObjectStore('participants', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB()
  return db.get('sessions', id)
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB()
  return db.getAll('sessions')
}

export async function getSessionsByParticipant(participantId: string): Promise<Session[]> {
  const db = await getDB()
  return db.getAllFromIndex('sessions', 'by-participant', participantId)
}

export async function getUnsyncedSessions(): Promise<Session[]> {
  const db = await getDB()
  return db.getAllFromIndex('sessions', 'by-synced', 0)
}

export async function saveParticipant(participant: Participant): Promise<void> {
  const db = await getDB()
  await db.put('participants', participant)
}

export async function getParticipant(id: string): Promise<Participant | undefined> {
  const db = await getDB()
  return db.get('participants', id)
}

export async function getAllParticipants(): Promise<Participant[]> {
  const db = await getDB()
  return db.getAll('participants')
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function exportSessionsToCSV(): Promise<string> {
  const sessions = await getAllSessions()
  
  const headers = [
    'Session ID',
    'Participant ID',
    'Session Type',
    'Duration (min)',
    'Start Time',
    'End Time',
    'Completion %',
    'Completed',
    'Pre-Stress Rating',
    'Post-Stress Rating',
    'Was Helpful'
  ]
  
  const rows = sessions.map(s => [
    s.id,
    s.participantId,
    s.sessionType,
    s.duration,
    s.startTime,
    s.endTime || '',
    s.completionPercentage,
    s.completed ? 'Yes' : 'No',
    s.preStressRating,
    s.postStressRating ?? '',
    s.wasHelpful === null ? '' : s.wasHelpful ? 'Yes' : 'No'
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}
