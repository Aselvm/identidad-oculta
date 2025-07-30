'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { initSocket, Player, GameState, Question } from '@/lib/socket'

export default function Room() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const roomCode = params.roomCode as string
  const playerName = searchParams.get('name') || ''
  
  const [socket, setSocket] = useState<any>(null)
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    gameState: 'waiting'
  })
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newName, setNewName] = useState('')
  const [guess, setGuess] = useState('')
  const [showGuessInput, setShowGuessInput] = useState(false)

  useEffect(() => {
    if (!playerName) {
      router.push('/')
      return
    }

    const socketInstance = initSocket()
    setSocket(socketInstance)

    socketInstance.emit('join-room', { roomCode, playerName })

    socketInstance.on('game-state', (state: GameState) => {
      setGameState(state)
      const player = state.players.find(p => p.name === playerName)
      setCurrentPlayer(player || null)
    })

    socketInstance.on('question-asked', (question: Question) => {
      setQuestions(prev => [...prev, question])
    })

    socketInstance.on('question-answered', (questionId: string, answer: 'yes' | 'no') => {
      setQuestions(prev =>
        prev.map(q => q.id === questionId ? { ...q, answer } : q)
      )
    })

    socketInstance.on('player-guessed', (playerId: string, correct: boolean) => {
      if (correct) {
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p =>
            p.id === playerId ? { ...p, hasGuessed: true } : p
          )
        }))
      }
    })

    socketInstance.on('room-not-found', () => {
      alert('Sala no encontrada')
      router.push('/')
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [roomCode, playerName, router])

  const addName = () => {
    if (!newName.trim() || !socket) return
    socket.emit('add-name', { roomCode, name: newName.trim() })
    setNewName('')
  }

  const startGame = () => {
    if (!socket) return
    socket.emit('start-game', { roomCode })
  }

  const askQuestion = () => {
    if (!newQuestion.trim() || !socket || !currentPlayer) return
    
    const question: Omit<Question, 'id' | 'answer' | 'timestamp'> = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      question: newQuestion.trim()
    }
    
    socket.emit('ask-question', { roomCode, question })
    setNewQuestion('')
  }

  const answerQuestion = (questionId: string, answer: 'yes' | 'no') => {
    if (!socket) return
    socket.emit('answer-question', { roomCode, questionId, answer })
  }

  const makeGuess = () => {
    if (!guess.trim() || !socket || !currentPlayer) return
    socket.emit('make-guess', { roomCode, playerId: currentPlayer.id, guess: guess.trim() })
    setGuess('')
    setShowGuessInput(false)
  }

  const otherPlayers = gameState.players.filter(p => p.name !== playerName)

  if (gameState.gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Sala: {roomCode}
            </h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Jugadores ({gameState.players.length})
              </h2>
              <div className="space-y-2">
                {gameState.players.map((player, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded">
                    {player.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Agregar nombres para el juego
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="Nombre de persona famosa, personaje, etc."
                  onKeyPress={(e) => e.key === 'Enter' && addName()}
                />
                <button
                  onClick={addName}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Agregar
                </button>
              </div>
            </div>

            {gameState.players.length >= 2 && (
              <button
                onClick={startGame}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 font-medium text-lg"
              >
                Iniciar Juego
              </button>
            )}
            
            {gameState.players.length < 2 && (
              <p className="text-gray-600 text-center">
                Se necesitan al menos 2 jugadores para comenzar
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Identidad Oculta - Sala: {roomCode}
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Otros jugadores y sus identidades:
              </h2>
              <div className="space-y-2 mb-4">
                {otherPlayers.map((player, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      Es: <span className="font-semibold text-blue-600">
                        {player.assignedName || 'Esperando...'}
                      </span>
                      {player.hasGuessed && (
                        <span className="ml-2 text-green-600">✓ Adivinó</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Tu identidad:</h3>
                <p className="text-gray-700">¡Es un secreto! Hazle preguntas a los demás para descubrirlo.</p>
                {currentPlayer?.hasGuessed && (
                  <p className="text-green-600 font-semibold mt-2">¡Ya adivinaste correctamente!</p>
                )}
              </div>

              {!currentPlayer?.hasGuessed && (
                <div>
                  {!showGuessInput ? (
                    <button
                      onClick={() => setShowGuessInput(true)}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 mb-4"
                    >
                      ¿Crees que sabes quién eres?
                    </button>
                  ) : (
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={guess}
                          onChange={(e) => setGuess(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                          placeholder="¿Quién crees que eres?"
                          onKeyPress={(e) => e.key === 'Enter' && makeGuess()}
                        />
                        <button
                          onClick={makeGuess}
                          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                        >
                          Adivinar
                        </button>
                        <button
                          onClick={() => setShowGuessInput(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Questions Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Preguntas y Respuestas
              </h2>
              
              {!currentPlayer?.hasGuessed && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                      placeholder="Haz una pregunta de sí/no..."
                      onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                    />
                    <button
                      onClick={askQuestion}
                      className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                    >
                      Preguntar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((question) => (
                  <div key={question.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-800">
                      {question.playerName} pregunta:
                    </div>
                    <div className="text-gray-700 mb-2">{question.question}</div>
                    
                    {question.answer ? (
                      <div className={`font-semibold ${
                        question.answer === 'yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Respuesta: {question.answer === 'yes' ? 'Sí' : 'No'}
                      </div>
                    ) : question.playerId !== currentPlayer?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => answerQuestion(question.id, 'yes')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => answerQuestion(question.id, 'no')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}