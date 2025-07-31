const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Room management - shared with API routes
global.rooms = global.rooms || new Map()
const rooms = global.rooms

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function distributeNames(room) {
  if (room.players.length < 2) return
  
  const names = shuffleArray([...room.names])
  room.players.forEach((player, index) => {
    let assignedIndex = index
    if (names[assignedIndex] === player.name) {
      const swapIndex = index === names.length - 1 ? index - 1 : index + 1
      ;[names[assignedIndex], names[swapIndex]] = [names[swapIndex], names[assignedIndex]]
    }
    player.assignedName = names[assignedIndex]
    player.hasGuessed = false
  })
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true)
    await handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id)

    socket.on('join-room', ({ roomCode, playerName }) => {
      console.log(`🚪 ${playerName} attempting to join room ${roomCode}`)
      
      if (!rooms.has(roomCode)) {
        console.log(`❌ Room ${roomCode} not found`)
        socket.emit('room-not-found')
        return
      }

      const room = rooms.get(roomCode)
      console.log(`📋 Room ${roomCode} current state:`, { 
        players: room.players.length, 
        names: room.names.length,
        gameState: room.gameState 
      })
      
      const existingPlayer = room.players.find(p => p.name === playerName)
      
      if (!existingPlayer) {
        console.log(`➕ Adding new player: ${playerName} (${socket.id})`)
        room.players.push({
          id: socket.id,
          name: playerName,
          hasGuessed: false
        })
      } else {
        console.log(`🔄 Updating existing player: ${playerName} (${socket.id})`)
        existingPlayer.id = socket.id
      }

      socket.join(roomCode)
      console.log(`✅ Player ${playerName} joined room ${roomCode}. Total players: ${room.players.length}`)
      console.log(`📢 Emitting game-state to room ${roomCode}:`, room)
      io.to(roomCode).emit('game-state', room)
    })

    socket.on('add-name', ({ roomCode, name }) => {
      const room = rooms.get(roomCode)
      if (room && !room.names.includes(name)) {
        room.names.push(name)
        io.to(roomCode).emit('game-state', room)
      }
    })

    socket.on('start-game', ({ roomCode }) => {
      const room = rooms.get(roomCode)
      if (room && room.players.length >= 2 && room.names.length >= room.players.length) {
        room.gameState = 'playing'
        distributeNames(room)
        io.to(roomCode).emit('game-state', room)
      }
    })

    socket.on('ask-question', ({ roomCode, question }) => {
      const questionWithId = {
        ...question,
        id: Date.now().toString(),
        timestamp: new Date(),
        answer: null
      }
      io.to(roomCode).emit('question-asked', questionWithId)
    })

    socket.on('answer-question', ({ roomCode, questionId, answer }) => {
      io.to(roomCode).emit('question-answered', questionId, answer)
    })

    socket.on('make-guess', ({ roomCode, playerId, guess }) => {
      const room = rooms.get(roomCode)
      if (room) {
        const player = room.players.find(p => p.id === playerId)
        if (player && player.assignedName && player.assignedName.toLowerCase() === guess.toLowerCase()) {
          player.hasGuessed = true
          io.to(roomCode).emit('player-guessed', playerId, true)
          io.to(roomCode).emit('game-state', room)
        } else {
          io.to(roomCode).emit('player-guessed', playerId, false)
        }
      }
    })

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id)
    })
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})