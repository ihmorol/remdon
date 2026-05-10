# ADR-0005: No user accounts

**Status:** Accepted

## Context

Ome.tv requires a Google login; Omegle had no accounts. User accounts add authentication, session management, and identity complexity.

## Decision

remdon has no user accounts. Every visitor is anonymous. The only pre-queue step is the age gate (18+ checkbox) and IP-based country detection. There is no login, no signup, no session token, and no user table in PostgreSQL.

## Consequences

- No auth library, no JWT, no session middleware — significant complexity removed.
- No persistent identity means no per-user report history or ban list.
- The admin panel uses a single static password (see ADR-0007) rather than admin user records.
- If user accounts are added in the future, this is a greenfield addition, not a refactor.
