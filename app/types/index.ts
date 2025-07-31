import type { Server as IOServer } from 'socket.io'
import type { Socket as NetSocket } from 'net'
import type { NextApiResponse } from 'next'

export type NextApiResponseWithSocket = NextApiResponse & {
	socket: NetSocket & {
		server: {
			io?: IOServer
		}
	}
}
