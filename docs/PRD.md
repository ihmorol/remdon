# Product Requirements Document — remdon

**Version:** 1.0  
**Date:** 2026-05-11  
**Status:** Active

---

## Overview

remdon is a random 1:1 video + text chat web platform. Two anonymous visitors are paired by country and connected via a live WebRTC video and text session. Either participant can skip at any time, returning both to a waiting pool for re-pairing. The platform is a learning-oriented clone of Omegle / Ome.tv / Umingle, built to understand WebRTC, Socket.io, Redis matchmaking, and real-time peer-to-peer systems.

---

## Goals

1. **Functional clone** — reproduce the core random video chat experience of Omegle/Ome.tv at a working, deployable level.
2. **Learn the stack** — understand WebRTC signaling, NAT traversal (STUN/TURN), Socket.io rooms, Redis queue atomicity, and real-time state management end-to-end.
3. **Demonstrate AI-assisted development** — the project is fully scaffolded by AI (Claude) using the Matt Pocock PRD → Issues → TDD workflow.
4. **Clean, maintainable code** — TypeScript strict mode, no `any` types, TDD vertical slices, ADRs for every load-bearing decision.

---

## Non-Goals

- User accounts, login, or persistent identity
- AI-powered content moderation
- Interest tags beyond age gate and country
- Gender or language filters
- Recording sessions
- Group video (more than 2 participants)
- Native mobile apps (iOS / Android)
- Push notifications
- Admin ban/block enforcement (reports are logged only)
- Analytics dashboards
- Rate limiting or DDoS protection
- Legal compliance (GDPR, COPPA, etc.)
- Monetisation

---

## User Stories

### Visitor (not yet in queue)

1. As a visitor, I want to see a landing page that explains what remdon is, so that I understand what I am about to do.
2. As a visitor, I want to confirm I am 18 or older before entering the queue, so that I knowingly accept the age requirement.
3. As a visitor, I want my country to be auto-detected from my IP address, so that I do not have to select it manually.
4. As a visitor, I want to see which country was detected before joining, so that I can verify the detection is correct.
5. As a visitor, I want a single Start button to enter the queue, so that joining is frictionless.

### Participant (in queue)

6. As a participant, I want to see a waiting indicator while in the matchmaking queue, so that I know the system is working.
7. As a participant, I want to be matched with another participant from the same country first, so that I am more likely to share a language.
8. As a participant, I want to be matched globally if no same-country participant is found within 10 seconds, so that I am not stuck waiting indefinitely.

### Participant (in session)

9. As a participant, I want my camera and microphone to activate when a match is found, so that the session starts immediately.
10. As a participant, I want to see my own video feed in a small overlay, so that I can verify my camera is working.
11. As a participant, I want to see my peer's video feed in the main area, so that I can see who I am talking to.
12. As a participant, I want to send text messages during a session, so that I can communicate when audio is not working or to break the ice.
13. As a participant, I want to receive text messages from my peer in real time, so that we can have a text conversation alongside the video.
14. As a participant, I want to click Skip to end the current session and find a new stranger, so that I can move on if the conversation is not working.
15. As a participant, I want both myself and my peer to be re-queued when either of us skips, so that no one is left with a broken session.
16. As a participant, I want to click Stop to exit the platform entirely, so that I can leave without being re-queued.
17. As a participant, I want to report my current peer with a single click, so that I can flag inappropriate behaviour easily.
18. As a participant, I want to see a brief confirmation when my report is submitted, so that I know it was received.

### Participant (mobile)

19. As a participant on a mobile device, I want the video and chat layout to adapt to my screen size, so that the experience works on Android.
20. As a participant on a mobile device, I want touch-friendly Skip, Stop, and Report buttons, so that I can interact without a keyboard.

### Participant (behind NAT)

21. As a participant behind a strict NAT, I want the video connection to succeed via TURN relay, so that I am not excluded from the platform.
22. As a participant, I want the connection to degrade gracefully if my peer disconnects unexpectedly, so that I am re-queued automatically.

### Admin

23. As an admin, I want to view all submitted reports at a protected route, so that I can review flagged sessions.
24. As an admin, I want the admin route to require a password, so that reports are not publicly accessible.

---

## Core Flows

### Flow 1: Visitor → Participant → Matched

```
1. Visitor loads the site
2. Server resolves visitor's IP → ISO country code (via ip-api.com)
3. Visitor sees landing page with detected country and 18+ checkbox
4. Visitor checks the 18+ box and clicks Start
5. Client emits: join { country }
6. Server enqueues participant in country queue (Redis LPUSH queue:<country>)
7. Server emits: waiting { country }
8. Client shows waiting screen
9a. [Same-country match found within 10 seconds]
    Server pairs two participants, creates Socket.io room
    Server emits: matched { roomId, isInitiator } to both
9b. [No same-country match after 10 seconds]
    Server moves participant to global queue (queue:XX)
    Server pairs with next available global participant
    Server emits: matched { roomId, isInitiator } to both
10. Client transitions: waiting → matched
```

### Flow 2: WebRTC Connection (after matched)

```
1. Both clients receive matched { roomId, isInitiator }
2. Initiator: creates RTCPeerConnection, requests camera/mic, creates SDP offer
3. Initiator emits: signal { type: 'offer', payload: SDP }
4. Server relays signal to peer in same room
5. Peer: receives offer, creates answer, emits: signal { type: 'answer', payload: SDP }
6. Server relays answer back to initiator
7. Both sides exchange ICE candidates via signal { type: 'ice-candidate', payload: candidate }
8. If direct P2P fails → TURN relay used automatically
9. Both participants see live video and hear audio
```

### Flow 3: Text Chat

```
1. Participant types a message and presses Enter or Send
2. Client emits: chat { message }
3. Server relays chat event to the other participant in the room
4. Peer's ChatPanel renders the received message
```

### Flow 4: Skip

```
1. Participant A clicks Skip
2. Client emits: skip
3. Server:
   a. Closes Socket.io room for both
   b. Cleans up Redis state for both
   c. Emits: peer-left to Participant B
   d. Re-enqueues both independently (back to Flow 1, step 6)
4. Both clients transition: matched → waiting
```

### Flow 5: Stop

```
1. Participant clicks Stop
2. Client disconnects socket
3. Server detects disconnect:
   a. Emits peer-left to the remaining participant
   b. Re-enqueues the remaining participant
   c. Transitions stopped participant to idle (no re-queue)
4. Stopped client returns to landing page (idle state)
```

### Flow 6: Unexpected Disconnect

```
1. Participant's connection drops (tab closed, network lost)
2. Server detects socket disconnect
3. Same cleanup as Flow 4 (Skip) — peer receives peer-left and is re-queued
```

### Flow 7: Report

```
1. Participant clicks Report during an active session
2. Client emits: report
3. Server writes to PostgreSQL:
   INSERT INTO reports (room_id, reporter_socket_id) VALUES (...)
4. Server emits: confirmation to reporter (or client shows optimistic confirmation)
5. Client shows a brief toast: "Report submitted"
```

### Flow 8: Admin Panel

```
1. Admin navigates to /admin
2. Client prompts for ADMIN_PASSWORD
3. Client sends GET /api/admin/reports with Authorization: Bearer <password>
4. Server validates password (constant-time comparison with ADMIN_PASSWORD env var)
5a. Valid → server returns all reports as JSON (ordered by created_at DESC)
5b. Invalid → server returns 401
6. Client renders reports in a table
```

---

## Data Model

### Redis (runtime state)

```
queue:<country>   LIST   socketIds of waiting participants (e.g. queue:BD, queue:US)
queue:XX          LIST   global fallback queue
room:<roomId>     HASH   { socketId1, socketId2, country1, country2 }
```

### PostgreSQL (persistent)

```sql
CREATE TABLE reports (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id            TEXT        NOT NULL,
  reporter_socket_id TEXT        NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Socket.io Event Contract (shared types)

**Client → Server**

| Event     | Payload                                                              | Meaning                        |
|-----------|----------------------------------------------------------------------|--------------------------------|
| `ping`    | —                                                                    | Health check                   |
| `join`    | `{ country: string }`                                                | Enter matchmaking queue        |
| `signal`  | `{ type: 'offer' \| 'answer' \| 'ice-candidate', payload: unknown }` | Relay WebRTC signal to peer    |
| `chat`    | `{ message: string }`                                                | Send text message to peer      |
| `skip`    | —                                                                    | End session, both re-queue     |
| `report`  | —                                                                    | Log current session to DB      |

**Server → Client**

| Event       | Payload                                       | Meaning                              |
|-------------|-----------------------------------------------|--------------------------------------|
| `pong`      | `string`                                      | Health check response                |
| `waiting`   | `{ country: string }`                         | Confirmed in queue                   |
| `matched`   | `{ roomId: string, isInitiator: boolean }`    | Peer found; begin WebRTC handshake   |
| `signal`    | `{ type: string, payload: unknown }`          | Forwarded WebRTC signal from peer    |
| `chat`      | `{ message: string }`                         | Forwarded text from peer             |
| `peer-left` | —                                             | Peer disconnected or skipped         |
| `error`     | `{ code: string }`                            | e.g. `age-gate-required`             |

### Participant State Machine

```
idle
 └─(age gate + Start)──► waiting
                           └─(peer found)──► matched
                                              ├─(skip / peer-left)──► waiting
                                              └─(stop / disconnect)──► idle
```

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| Participant skips before WebRTC handshake completes | Server tears down room; peer is re-queued; partial RTCPeerConnection is closed on client |
| Both participants skip simultaneously | Both re-queue; no duplicate queue entries because server processes socket events serially per socket |
| Participant behind symmetric NAT with no TURN | Connection attempt times out; peer receives `peer-left`; both re-queue |
| ip-api.com is unreachable | Server returns country `XX`; participant joins global queue immediately (no 10-second wait) |
| ip-api.com returns wrong country (VPN user) | Participant waits 10 seconds in wrong-country queue, then falls back to global |
| Report submitted after skip (stale room) | Server ignores `report` event if socket is no longer in an active room |
| Single participant in global queue with no peers | Participant waits indefinitely; no timeout; Stop button is the exit |
| Two participants matched from different countries | Permitted — this is the global fallback path |
| Participant reloads page mid-session | Old socket disconnects → peer receives `peer-left` and re-queues; reloaded page starts fresh at idle |
| Admin enters wrong password | Server returns 401; client shows "Invalid password" and re-prompts |
| Metered.ca TURN quota exceeded | Direct P2P still attempted; ~15–30% of connections that require relay will silently fail |

---

## Acceptance Criteria

### Landing & Age Gate
- [ ] Landing page renders with a description of remdon, the detected country, and a disabled Start button
- [ ] Start button enables only after the 18+ checkbox is checked
- [ ] Detected country is shown as a flag + name (e.g. "🇧🇩 Bangladesh")

### Matchmaking
- [ ] Two participants from the same country are paired in under 1 second of both joining
- [ ] A participant waiting alone for 10 seconds is moved to global queue and paired with the next available participant
- [ ] Matched event carries `roomId` and exactly one participant receives `isInitiator: true`

### Video & Audio
- [ ] Both participants see each other's live video within 5 seconds of being matched (on a direct P2P connection)
- [ ] Local video appears in a self-view overlay; remote video fills the main area
- [ ] Camera and microphone permission is requested after matching, not before
- [ ] Connection succeeds for at least one simulated TURN-relayed scenario

### Text Chat
- [ ] Message sent with Enter or Send button appears in sender's panel immediately
- [ ] Message appears in recipient's panel within 200ms on a local network
- [ ] Chat panel auto-scrolls to the latest message

### Skip & Stop
- [ ] Clicking Skip transitions both participants to the waiting screen within 1 second
- [ ] Clicking Stop returns the user to the landing page; the peer is re-queued
- [ ] Unexpected disconnect (close tab) triggers peer-left for the remaining participant

### Report
- [ ] Report button is visible during an active session
- [ ] Clicking Report shows a confirmation toast within 500ms
- [ ] Report is persisted in PostgreSQL with correct `room_id`, `reporter_socket_id`, and `created_at`

### Admin Panel
- [ ] GET /api/admin/reports with valid token returns all reports as JSON
- [ ] GET /api/admin/reports with wrong/missing token returns 401
- [ ] Admin UI at /admin displays reports in a table sorted by most recent

### Mobile
- [ ] All screens render without horizontal overflow at 375px viewport width
- [ ] Skip, Stop, and Report buttons have a minimum 44px touch target
- [ ] Chat input is not obscured by the soft keyboard

---

## Testing Requirements

### Philosophy
Tests verify observable behavior through public interfaces only. A test that breaks when an internal function is renamed (but behavior is unchanged) is a failing test by definition — remove or rewrite it.

### Server — Unit / Integration

| Module | Test runner | Infrastructure | Key behaviors |
|--------|-------------|----------------|---------------|
| **GeoDetector** | Jest | Mocked HTTP client | Valid IP → correct ISO code; unreachable endpoint → `XX` |
| **Matchmaker** | Jest | Real Redis (local or Docker) | Same-country pair; global fallback after 10s; re-queue on skip; no duplicate enqueue |
| **ReportStore** | Jest | Real PostgreSQL | `createReport` persists row; `listReports` returns all rows ordered by `created_at` DESC |

### Client — Unit / Integration

| Module | Test runner | Infrastructure | Key behaviors |
|--------|-------------|----------------|---------------|
| **WebRTCConnection** | Vitest | Mocked `RTCPeerConnection` | Offer created when `isInitiator=true`; answer created when `isInitiator=false`; ICE candidates forwarded via `onSignal` |
| **MatchmakingFlow** | Vitest | Mocked Socket.io server | `idle → waiting` on join; `waiting → matched` on matched event; `matched → waiting` on skip/peer-left; `matched → idle` on stop |
| **App** | Vitest | jsdom | Renders heading without crash |

### Not unit-tested (covered by manual or E2E)
- SignalingGateway (thin relay — behavior is verified by two-client E2E)
- AdminRouter (manual verification of 401 / 200 responses)
- VideoGrid, ChatPanel, AgeGate (UI components)

---

## Open Questions

| # | Question | Impact | Current assumption |
|---|----------|--------|--------------------|
| 1 | Should the age gate remember consent across sessions (localStorage)? | UX friction on return visits | No — visitor re-confirms on every page load |
| 2 | Should the 10-second country fallback timer reset if the participant skips while waiting? | Queue logic complexity | Yes — skip while waiting re-starts the 10-second timer |
| 3 | Should the Report button be disabled after one use per session? | Prevents spam reports | No for MVP — not enforced |
| 4 | What happens if ip-api.com rate-limits us (> 45 req/min)? | Failed country detection | Falls back to `XX` (global queue) — acceptable at MVP scale |
| 5 | Should the admin panel paginate reports? | Large report volume | No — return all rows for MVP; add pagination when needed |
| 6 | Should TURN credentials be generated per-session (time-limited)? | Security | No — static Metered.ca credentials for MVP; mitigate with Coturn when self-hosting |
| 7 | Is there a maximum session duration? | Server resource usage | No limit for MVP |
| 8 | Should participants see each other's country during the session? | UX | Yes — show peer country in the matched UI |
