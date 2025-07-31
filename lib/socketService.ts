'use client'

import { io, Socket } from 'socket.io-client'
import { Player, GameState, Question } from './socket'

class SocketService {
	private static instance: SocketService
	private socket: Socket | null = null
	private eventListeners: Map<string, Set<Function>> = new Map()
	private isInitialized = false
	private socketConnected = false

	constructor() {
		if (SocketService.instance) {
			return SocketService.instance
		}
		SocketService.instance = this
	}

	async initializeSocket(): Promise<Socket> {
		if (!this.socket || !this.socketConnected) {
			if (this.socket) {
				this.socket.disconnect()
			}

			await fetch('/api/socket')

			console.log('🔌 Initializing socket connection...')
			this.socket = io({
				path: '/socket.io/',
				transports: ['websocket', 'polling'],
				forceNew: true
			})

			this.socket.on('connect', () => {
				console.log('✅ Socket connected:', this.socket?.id)
				this.socketConnected = true
				this.isInitialized = true
			})

			this.socket.on('disconnect', () => {
				console.log('❌ Socket disconnected')
				this.socketConnected = false
				this.isInitialized = false
			})

			this.socket.on('connect_error', (error) => {
				console.error('🚨 Socket connection error:', error)
			})

			// 🔁 Registrar listeners ya guardados
			this.eventListeners.forEach((callbacks, event) => {
				this.socket!.on(event, (...args) => {
					callbacks.forEach(cb => cb(...args))
				})
			})
		}
		return this.socket
	}

	async joinRoom(roomCode: string, playerName: string): Promise<void> {
		const socket = await this.initializeSocket()

		if (socket.connected) {
			console.log('🏠 Joining room:', roomCode, 'as player:', playerName)
			console.log('📤 Emitting join-room event...')
			socket.emit('join-room', { roomCode, playerName })
		} else {
			socket.once('connect', () => {
				console.log('🏠 Joining room:', roomCode, 'as player:', playerName)
				console.log('📤 Emitting join-room event...')
				socket.emit('join-room', { roomCode, playerName })
			})
		}
	}

	async addName(roomCode: string, name: string): Promise<void> {
		const socket = await this.initializeSocket()
		socket.emit('add-name', { roomCode, name })
	}

	async startGame(roomCode: string): Promise<void> {
		const socket = await this.initializeSocket()
		socket.emit('start-game', { roomCode })
	}

	async askQuestion(roomCode: string, question: Omit<Question, 'id' | 'answer' | 'timestamp'>): Promise<void> {
		const socket = await this.initializeSocket()
		socket.emit('ask-question', { roomCode, question })
	}

	async answerQuestion(roomCode: string, questionId: string, answer: 'yes' | 'no'): Promise<void> {
		const socket = await this.initializeSocket()
		socket.emit('answer-question', { roomCode, questionId, answer })
	}

	async makeGuess(roomCode: string, playerId: string, guess: string): Promise<void> {
		const socket = await this.initializeSocket()
		socket.emit('make-guess', { roomCode, playerId, guess })
	}

	onGameState(callback: (state: GameState) => void): void {
		this.registerListener('game-state', callback)
	}

	onQuestionAsked(callback: (question: Question) => void): void {
		this.registerListener('question-asked', callback)
	}

	onQuestionAnswered(callback: (questionId: string, answer: 'yes' | 'no') => void): void {
		this.registerListener('question-answered', callback)
	}

	onPlayerGuessed(callback: (playerId: string, correct: boolean) => void): void {
		this.registerListener('player-guessed', callback)
	}

	onRoomNotFound(callback: () => void): void {
		this.registerListener('room-not-found', callback)
	}

	private async registerListener(event: string, callback: Function): Promise<void> {
		const socket = await this.initializeSocket()

		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set())
			socket.on(event, (...args) => {
				const callbacks = this.eventListeners.get(event)
				if (callbacks) {
					callbacks.forEach(cb => cb(...args))
				}
			})
		}

		const current = this.eventListeners.get(event)

		// ✅ Evitar duplicación del mismo callback
		if (current && ![...current].includes(callback)) {
			current.add(callback)
		}
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
			this.eventListeners.clear()
			this.socketConnected = false
			this.isInitialized = false
		}
	}
}

export const socketService = new SocketService()
