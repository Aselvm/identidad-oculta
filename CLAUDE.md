# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Identidad Oculta" is a multiplayer web-based guessing game where players try to discover their assigned identity by asking yes/no questions. Built with Next.js 14, TypeScript, and Socket.IO for real-time multiplayer functionality.

## Technology Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Socket.IO** for real-time multiplayer communication  
- **Tailwind CSS** for styling
- **Vercel** for deployment

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## Game Flow

1. **Lobby**: Players create or join rooms using room codes
2. **Setup**: Players add names/identities to the pool
3. **Distribution**: Names are randomly distributed (players can't see their own assigned identity)
4. **Gameplay**: Players ask yes/no questions to discover who they are
5. **Victory**: Players can guess their identity when ready

## Key Components

- `app/page.tsx` - Home page with room creation/joining
- `app/room/[roomCode]/page.tsx` - Main game interface
- `app/api/rooms/route.ts` - Room management API
- `app/api/socket/route.ts` - Socket.IO server setup
- `lib/socket.ts` - Socket client utilities and types

## Real-time Events

Socket.IO handles:
- `join-room` - Player joins a room
- `add-name` - Add identity to the pool
- `start-game` - Begin name distribution and gameplay
- `ask-question` - Player asks a yes/no question
- `answer-question` - Other players answer questions
- `make-guess` - Player attempts to guess their identity

## Deployment Notes

- Configured for Vercel with `vercel.json`
- Socket.IO routing handled via API routes
- Memory-based storage (consider database for production scale)

## Language

User interface and content are in Spanish. Maintain Spanish conventions for user-facing text.