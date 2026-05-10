# remdon

Random video chat platform — learning WebRTC, Socket.io, and Redis. A clone of Omegle/Ome.tv built to understand how real-time peer-to-peer video systems work.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub Issues in `ihmorol/remdon`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` at root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Project structure

Monorepo:

```
remdon/
├── client/       # React + TypeScript + Tailwind CSS (Vite)
├── server/       # Node.js + Socket.io signaling server
├── docs/
│   ├── adr/      # Architectural Decision Records
│   └── agents/   # Agent skill configuration
├── CONTEXT.md    # Domain glossary
└── CLAUDE.md     # This file
```

## Tech stack

- **Frontend:** React 18 + TypeScript (strict) + Tailwind CSS + Vite
- **Backend:** Node.js + Socket.io + Express
- **Queue:** Redis (matchmaking)
- **Database:** PostgreSQL (reports)
- **WebRTC:** Browser native + Metered.ca TURN + Google STUN
- **Deploy:** Vercel (client) + Railway (server + Redis + PostgreSQL)

## Code standards

- TypeScript strict mode everywhere
- No `any` types
- Tests via Vitest (client) and Jest (server)
- TDD: vertical slices — one test → one implementation → repeat
- Clean architecture: no business logic in route handlers or socket handlers
