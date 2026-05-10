# ADR-0001: Monorepo structure

**Status:** Accepted

## Context

The project has two distinct codebases — a React client and a Node.js server — that share a Socket.io event contract. They can be organised as separate repositories or as workspaces in a single repository.

## Decision

Use a single npm workspaces monorepo with three packages: `client`, `server`, and `packages/types`.

## Consequences

- The shared `@remdon/types` package keeps the Socket.io event map in one place; both sides import it, so the compiler catches mismatches before runtime.
- A single `git push` covers the full stack.
- `npm run dev` at the root starts both processes with `concurrently`.
- Both client (Vercel) and server (Railway) are deployed independently despite living in the same repo — each platform is pointed at its subdirectory.
