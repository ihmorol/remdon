# ADR-0008: Static env-var password for admin panel

**Status:** Accepted

## Context

The admin panel at `/admin` displays submitted reports. It must not be publicly accessible. Options include a full auth system (JWT, sessions) or a simple static secret.

## Decision

The admin route is protected by a single static password read from the `ADMIN_PASSWORD` environment variable. The client sends it as an `Authorization: Bearer <password>` header. The server compares it with a constant-time comparison. No sessions, no JWT, no admin user table.

## Consequences

- Trivial to implement — one middleware check.
- Not suitable if multiple admins with different access levels are needed.
- Password rotation requires a server redeploy (env var change). Acceptable for MVP.
- The password is never committed to git — lives only in Railway's env var store.
