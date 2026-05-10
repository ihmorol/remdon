# ADR-0003: Redis for the matchmaking queue

**Status:** Accepted

## Context

Participants waiting for a peer must be stored somewhere. Options include in-process memory (a plain JS Map or array) or an external store (Redis).

## Decision

Use Redis as the matchmaking queue. Queues are segmented by country (`queue:BD`, `queue:US`, etc.) with a global fallback key (`queue:XX`). Atomic Redis operations (`LPUSH`, `RPOP`) prevent race conditions when two server processes try to pair the same participant.

## Consequences

- Correct under horizontal scaling — multiple server instances share the same Redis, so two processes cannot pair the same participant twice.
- For this MVP there is only one server instance, but the design is correct from day one.
- Railway provides a free Redis plugin alongside the Node.js service; no separate infrastructure cost.
- In-memory state would be simpler for a single instance but would lose all queue state on server restart.
