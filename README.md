# remdon

Random 1:1 video + text chat. Built to learn WebRTC, Socket.io, and Redis.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Tailwind CSS (Vite) |
| Backend | Node.js + Express + Socket.io |
| Queue | Redis |
| Database | PostgreSQL |
| STUN | Google free servers |
| TURN | Metered.ca free tier |

## Getting started

```bash
# Install all workspaces
npm install

# Copy env and fill in values
cp .env.example .env

# Run both client and server in dev mode
npm run dev
```

Client runs at `http://localhost:5173`, server at `http://localhost:3001`.

## Testing

```bash
# Run all tests (server + client)
npm test

# Run server tests only
npm test --workspace=server

# Run client tests only
npm test --workspace=client
```

## Type checking

```bash
npm run typecheck
```

## Environment variables

See `.env.example` for all required variables and descriptions.
