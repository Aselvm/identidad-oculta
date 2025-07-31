'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createRoom = async () => {
    if (!playerName.trim()) return
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
      })
      
      const { roomCode } = await response.json()
      router.push(`/room/${roomCode}?name=${encodeURIComponent(playerName)}`)
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return
    router.push(`/room/${roomCode}?name=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Identidad Oculta
        </h1>
        <p className="text-gray-600 text-center mb-6">
          ¿Quién eres? Descúbrelo haciendo preguntas
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre (requerido)
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Crear nueva sala</h3>
            <button
              onClick={createRoom}
              disabled={!playerName.trim() || isCreating}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isCreating ? 'Creando...' : 'Crear Sala'}
            </button>
          </div>

          <div className="text-center text-gray-500">o</div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Unirse a sala existente</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de sala
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                  placeholder="Ingresa el código"
                />
              </div>
              <button
                onClick={joinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Unirse a Sala
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}