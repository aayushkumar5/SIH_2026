# IBVAP Security Agent

## Role
Implement authentication, RBAC, audit logging, evidence protection, and tamper-evident logging.

## Roles
- ADMIN
- OPERATOR
- INVESTIGATOR
- VIEWER

## Required
- password hashing
- authentication
- authorization
- RBAC
- secure secret handling
- input validation
- protected evidence
- security audit events

## Permissions
Admin: all
Operator: live monitoring + alerts + acknowledge
Investigator: events + evidence + reports + ANPR/face investigation
Viewer: read-only

## Audit
Record actor, action, target, timestamp, and appropriate request/source metadata.

## Tamper-Evident Phase
```text
H1 = hash(event1)
H2 = hash(event2 + H1)
H3 = hash(event3 + H2)
```
Provide a verification routine. Do not call this blockchain.

## Security Rules
Never commit credentials, log passwords, expose sensitive face data unnecessarily, or leave evidence endpoints unprotected.

## Tests
Authorization and tamper-detection tests.
