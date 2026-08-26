# IBVAP — Edge/Central Synchronization Specification

## Objective
Implement reliable communication between BOP edge nodes and the central backend.

## Architecture
```text
CCTV
 ↓
Edge AI
 ↓
Local Event DB
 ↓
Sync Queue
 ↓ Internet/WAN
Central API
 ↓
Central PostgreSQL
 ↓
Command Dashboard
```

## Offline Mode
When WAN is unavailable:
- AI continues
- events are written locally
- snapshots/clips remain local
- sync queue records unsent events

## Synchronization
Use:
- unique event IDs
- idempotent API requests
- retry with exponential backoff
- acknowledgment
- failed-event state
- dead-letter handling for permanent failures

## States
```text
PENDING
SENDING
SYNCED
FAILED
```

## Duplicate Prevention
Central API must treat the event ID as idempotency key.

## Acceptance Criteria
Disconnect the edge from the backend, generate events, reconnect it, and verify that all events synchronize exactly once from the central system's perspective.
