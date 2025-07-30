import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

export const runtime = 'nodejs'

interface Player {
  id: string
  name: string
  assignedName?: string
  hasGuessed: boolean
}

interface Room {
  players: Player[]
  gameState: 'waiting' | 'playing' | 'finished'
  names: string[]
  createdAt: Date
}

const rooms = new Map<string, Room>()

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function distributeNames(room: Room) {
  if (room.players.length < 2) return
  
  const names = shuffleArray([...room.names])
  room.players.forEach((player, index) => {
    // Ensure player doesn't get their own name
    let assignedIndex = index
    if (names[assignedIndex] === player.name) {
      // Swap with next player (or previous if last)
      const swapIndex = index === names.length - 1 ? index - 1 : index + 1
      ;[names[assignedIndex], names[swapIndex]] = [names[swapIndex], names[assignedIndex]]
    }
    player.assignedName = names[assignedIndex]
    player.hasGuessed = false
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 426 })
  }

  // This would normally be handled by a WebSocket server
  // For Vercel deployment, we'll need to use a different approach
  return new Response('WebSocket endpoint - use socket.io client to connect', { status: 200 })
}