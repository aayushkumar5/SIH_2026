# IBVAP — Tamper-Evident Audit Hash Chain Specification

## Objective
Implement a tamper-evident audit log using a chained cryptographic hash.

## Chain
For each audit record:

```text
H1 = SHA256(event1)
H2 = SHA256(event2 + H1)
H3 = SHA256(event3 + H2)
```

Each record stores:
- event ID
- timestamp
- actor
- action
- target
- payload digest
- previous_hash
- current_hash

## Verification
Create a verifier that:
1. reads records in order
2. recalculates each hash
3. checks previous_hash linkage
4. reports the first broken record

## Security
The chain provides tamper evidence, not absolute prevention.

Protect the database and signing/verification infrastructure separately.

## Acceptance Criteria
A valid chain verifies successfully. Modify one record and the verifier must report the corruption.
