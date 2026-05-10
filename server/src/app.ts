import express from 'express'
import { Server } from 'socket.io'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@remdon/types'

export function createApp() {
  const app = express()

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>({
    cors: { origin: process.env.CLIENT_URL ?? 'http://localhost:5173' },
  })

  io.on('connection', (socket) => {
    socket.on('ping', () => {
      socket.emit('pong', 'pong')
    })
  })

  return { app, io }
}
