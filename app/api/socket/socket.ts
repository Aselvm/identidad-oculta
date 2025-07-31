import { Server as IOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import type { NextApiRequest } from 'next'
import type { NextApiResponseWithSocket } from '@/types'

export const config = {
	api: {
		bodyParser: false
	}
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
	if (!res.socket.server.io) {
		console.log('🔧 Inicializando servidor socket.io...')

		const httpServer: HTTPServer = res.socket.server as any
		const io = new IOServer(httpServer, {
			path: '/socket.io/',
			addTrailingSlash: false,
			cors: {
				origin: '*',
				methods: ['GET', 'POST']
			}
		})

		io.on('connection', socket => {
			console.log('✅ Cliente conectado:', socket.id)

			socket.on('join-room', ({ roomCode, playerName }) => {
				console.log(`📥 ${playerName} se unió a la sala ${roomCode}`)
				// emitir estado inicial, etc.
			})
		})

		res.socket.server.io = io
	} else {
		console.log('🟢 Socket.io ya está inicializado')
	}
	res.end()
}
