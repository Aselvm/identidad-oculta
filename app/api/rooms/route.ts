import { NextRequest, NextResponse } from 'next/server'

// In a real app, you'd use a database. For now, we'll use memory storage
// Share rooms with Socket.IO server
const rooms = global.rooms || new Map()
if (!global.rooms) {
  global.rooms = rooms
}

function generateRoomCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json()
    
    if (!playerName || !playerName.trim()) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
    }

    const roomCode = generateRoomCode()
    
    // Initialize room
    rooms.set(roomCode, {
      players: [],
      gameState: 'waiting', // waiting, playing, finished
      names: [],
      createdAt: new Date()
    })

    return NextResponse.json({ roomCode })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const roomCode = url.searchParams.get('roomCode')
  
  if (!roomCode) {
    return NextResponse.json({ error: 'Room code is required' }, { status: 400 })
  }

  const room = rooms.get(roomCode)
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  return NextResponse.json({ room })
}