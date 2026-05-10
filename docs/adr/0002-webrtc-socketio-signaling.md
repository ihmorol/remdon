# ADR-0002: WebRTC for media, Socket.io for signaling

**Status:** Accepted

## Context

Two participants need live video and audio. Options include a managed media service (Agora, Daily.co, Twilio Video) or building on browser-native WebRTC with a custom signaling layer.

## Decision

Use browser-native WebRTC (`RTCPeerConnection`) for all media — video and audio flow peer-to-peer (or via TURN relay) and never touch the server. Use Socket.io as the signaling channel to exchange SDP offers, SDP answers, and ICE candidates between matched participants.

The server relays signal events between the two sockets in a room without inspecting the payload.

## Consequences

- Zero media costs — the server never touches video or audio bytes.
- The server's role in a call is purely a relay for signaling messages (offer, answer, ICE candidates).
- ~15–30% of connections require TURN relay when direct P2P is blocked by NAT. See ADR-0004.
- WebRTC is the core learning objective of this project; using a managed service would defeat the purpose.
