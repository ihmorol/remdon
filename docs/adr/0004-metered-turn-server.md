# ADR-0004: Metered.ca free tier for TURN

**Status:** Accepted

## Context

~15–30% of WebRTC connections fail when both peers are behind strict NATs (mobile carriers, corporate networks). A TURN server relays media in those cases. Options are self-hosted Coturn, paid managed services (Twilio NTS), or a free managed tier.

## Decision

Use Metered.ca free tier (50 GB/month relayed, no credit card required) for the MVP. Credentials are stored as `METERED_USERNAME` and `METERED_CREDENTIAL` environment variables and injected into the `RTCPeerConnection` ICE config on the client.

When the 50 GB/month limit is outgrown, migrate to self-hosted Coturn on Oracle Cloud Always Free (2 AMD VMs, permanently free).

## Consequences

- TURN is included from day one; the MVP reflects real-world connection success rates.
- Free tier terms prohibit production traffic at scale — acceptable for a learning project.
- Static TURN credentials can theoretically be extracted from the client and abused; acceptable at MVP scale.
- Self-hosted Coturn on Oracle Cloud is the upgrade path when real traffic arrives.
