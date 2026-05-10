import { createServer } from 'http'
import { io as Client, type Socket } from 'socket.io-client'
import type { AddressInfo } from 'net'
import type { ServerToClientEvents, ClientToServerEvents } from '@remdon/types'
import { createApp } from './app'

type TestClient = Socket<ServerToClientEvents, ClientToServerEvents>

describe('Socket.io server', () => {
  let httpServer: ReturnType<typeof createServer>
  let client: TestClient

  beforeEach(async () => {
    const { app, io } = createApp()
    httpServer = createServer(app)
    io.attach(httpServer)
    await new Promise<void>((resolve) => httpServer.listen(0, resolve))
    const { port } = httpServer.address() as AddressInfo
    client = Client(`http://localhost:${port}`)
    await new Promise<void>((resolve) => client.on('connect', resolve))
  })

  afterEach(async () => {
    client.disconnect()
    await new Promise<void>((resolve, reject) =>
      httpServer.close((err) => (err ? reject(err) : resolve())),
    )
  })

  it('responds to ping with pong', async () => {
    const message = await new Promise<string>((resolve) => {
      client.emit('ping')
      client.on('pong', resolve)
    })
    expect(message).toBe('pong')
  })
})
