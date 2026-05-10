# Domain Context — remdon

Random video chat platform. Two strangers are paired for a live video + text session. Either party can skip at any time, returning both to the waiting pool.

## Glossary

| Term | Definition |
|------|------------|
| **Visitor** | An anonymous user who has landed on the site. Has no account. |
| **Participant** | A visitor who has passed the age gate and entered the matching pool. |
| **Session** | A live 1:1 video + text connection between two participants. |
| **Signal** | A WebRTC signaling message (offer, answer, ICE candidate) relayed by the server. |
| **Matchmaking queue** | The Redis list of waiting participants awaiting a peer. |
| **Skip** | Either participant ending the current session. Both participants re-enter the matchmaking queue. |
| **Age gate** | The 18+ confirmation checkbox a visitor must accept before becoming a participant. |
| **Country** | ISO 3166-1 alpha-2 code, auto-detected from the visitor's IP address at page load. |
| **Country fallback** | After 10 seconds without a same-country match, a participant is paired globally. |
| **Report** | A participant flagging the current session for review. Stored as a record in PostgreSQL. |
| **Admin** | A password-protected route for reviewing reports. Password is a static env var. |
| **Room** | A Socket.io room shared by two matched participants, used for signaling and chat. |
| **ICE** | Interactive Connectivity Establishment — the WebRTC protocol for finding a usable network path. |
| **STUN** | Session Traversal Utilities for NAT — tells a peer its public IP. |
| **TURN** | Traversal Using Relays around NAT — relays media when direct P2P fails. |

## System boundaries

- **Client:** Browser (React SPA). Owns the WebRTC `RTCPeerConnection`, renders video and chat UI.
- **Server:** Node.js process. Owns the matchmaking queue, Socket.io rooms, and all PostgreSQL writes.
- **Redis:** Owned by server. Stores the matchmaking queue and active room state.
- **PostgreSQL:** Owned by server. Stores reports.
- **TURN (Metered.ca):** External. Relays media between peers when direct P2P is blocked.

## Invariants

- A participant is always in exactly one state: `waiting` | `matched` | `disconnected`
- A session always has exactly two participants — never one, never three
- Skip always transitions both participants to `waiting`, never just one
- The server never touches media — all video/audio flows peer-to-peer (or via TURN)
