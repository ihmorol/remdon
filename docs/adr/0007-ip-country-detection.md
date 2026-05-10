# ADR-0007: IP-based country auto-detection, no manual override

**Status:** Accepted

## Context

Country is used to segment the matchmaking queue. Options: let the visitor select their country from a dropdown, auto-detect from IP, or both (detect and allow override).

## Decision

Auto-detect the visitor's country from their IP using ip-api.com's free JSON endpoint on the server side. Return the ISO 3166-1 alpha-2 code. No manual selection or override is offered to the visitor.

On detection failure (ip-api.com unreachable, private IP, etc.), return `XX`, which routes the participant to the global queue (`queue:XX`).

Country fallback: if no same-country participant is found within 10 seconds, the participant is moved to the global queue.

## Consequences

- Zero friction — no dropdown for the visitor to interact with.
- VPN users are placed in the wrong country queue; they fall back to global after 10 seconds.
- ip-api.com free tier has a 45 req/min limit — sufficient for MVP scale.
- The server, not the client, resolves the country, so the client cannot spoof it.
