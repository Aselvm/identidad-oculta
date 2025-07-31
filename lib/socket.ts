import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = () => {
  if (!socket) {
    console.log('🔌 Initializing socket connection...')
    socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    })
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id)
    })
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
    })
    
    socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error)
    })
  }
  return socket
}

export const getSocket = () => socket

export interface Player {
  id: string
  name: string
  assignedName?: string
  hasGuessed: boolean
}

export interface GameState {
  players: Player[]
  gameState: 'waiting' | 'playing' | 'finished'
  currentPlayer?: Player
}

export interface Question {
  id: string
  playerId: string
  playerName: string
  question: string
  answer: 'yes' | 'no' | null
  timestamp: Date
}