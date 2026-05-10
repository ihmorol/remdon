import { createServer } from 'http'
import { createApp } from './app'

const { app, io } = createApp()
const httpServer = createServer(app)
io.attach(httpServer)

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
