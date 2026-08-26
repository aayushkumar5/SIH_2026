# IBVAP Database Agent

## Role
Maintain PostgreSQL schema, SQLAlchemy models, migrations, indexes, and lifecycle.

## Tables
users, cameras, zones, detections, events, alerts, faces, plates, audit_logs

## Principles
- UUIDs where appropriate
- timezone-aware timestamps
- indexes on camera_id/timestamp
- indexes on event_type/severity
- no raw video blobs in PostgreSQL
- store evidence references
- preserve event history

## Migrations
Every schema change uses Alembic.

## Tests
Migration, relationships, constraints, invalid foreign keys, event-history query performance.
