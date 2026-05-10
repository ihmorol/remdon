# ADR-0009: PostgreSQL for report storage

**Status:** Accepted

## Context

Reports submitted by participants need to be persisted and queryable by the admin. Options include writing to a log file, using Redis, or using a relational database.

## Decision

Use PostgreSQL for report storage. The `reports` table schema:

```sql
CREATE TABLE reports (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id            TEXT NOT NULL,
  reporter_socket_id TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Railway provides a free PostgreSQL plugin alongside the Node.js service.

## Consequences

- Reports survive server restarts and redeploys.
- The admin panel can query reports with ordering, filtering, and pagination as the table grows.
- Railway's free PostgreSQL is sufficient for MVP — no separate database host needed.
- No ORM is used; the ReportStore module uses raw SQL via the `pg` client, keeping dependencies minimal.
