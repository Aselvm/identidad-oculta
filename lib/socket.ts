import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
      addTrailingSlash: false,
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