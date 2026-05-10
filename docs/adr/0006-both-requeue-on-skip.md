# ADR-0006: Both participants re-queue on skip or disconnect

**Status:** Accepted

## Context

When a participant clicks Skip (or disconnects), the session ends. The question is what happens to the other participant: do they re-queue automatically, or wait with a message?

Two options:
- **Option A:** Both participants re-queue independently.
- **Option B:** Only the skipper moves forward; the skipped participant gets a "your partner left" screen before re-queuing.

## Decision

Option A — both participants re-queue immediately on any disconnect or skip. One rule, no special cases.

Server logic: on `skip` or `disconnect`, remove both from their room, emit `peer-left` to each, and re-enqueue both independently.

## Consequences

- Simpler server logic — one handler covers both skip and unexpected disconnect.
- The skipped participant re-enters the queue as if they had clicked Skip themselves; no "you were skipped" UX.
- No asymmetric state between the two participants.
