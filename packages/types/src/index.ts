export interface ServerToClientEvents {
  pong: (message: string) => void
  waiting: (data: { country: string }) => void
  matched: (data: { roomId: string; isInitiator: boolean }) => void
  signal: (data: { type: string; payload: unknown }) => void
  chat: (data: { message: string }) => void
  'peer-left': () => void
  error: (data: { code: string }) => void
}

export interface ClientToServerEvents {
  ping: () => void
  join: (data: { country: string }) => void
  signal: (data: { type: 'offer' | 'answer' | 'ice-candidate'; payload: unknown }) => void
  chat: (data: { message: string }) => void
  skip: () => void
  report: () => void
}

export interface InterServerEvents {}
export interface SocketData {}

export type ParticipantState = 'idle' | 'waiting' | 'matched' | 'disconnected'

export interface Participant {
  socketId: string
  country: string
}
