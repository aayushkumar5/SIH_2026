# Security

This system handles biometric data (faces), vehicle identification (plates), and security-sensitive location/movement data for a border security force. Treat it accordingly — this isn't a generic web app threat model.

## Threat model (what this design needs to resist)

| Threat | Mitigation |
|---|---|
| Camera feed tampering/spoofing | Frame-level sanity checks (resolution, frame-rate anomalies); camera health monitoring flags unexpected feed changes |
| Alert log tampering (an insider or attacker altering/deleting an alert after the fact) | Hash-chained event log — see below |
| Unauthorized access to watchlist or live feeds | Role-based access control (admin/operator/auditor), all access logged |
| Man-in-the-middle on edge-to-central sync | TLS for all edge-to-central traffic; mutual auth (edge box cert) rather than shared static credentials |
| Compromised edge device | Edge boxes should have minimal standing credentials — scoped tokens, not master keys; central system should be able to revoke a specific edge box's access |
| Data exfiltration of biometric watchlist | Watchlist data encrypted at rest; access requires role + logged justification for exports |

## Tamper-evident audit log

Every event (detection alert, watchlist change, login, config change) is written as a record containing:

```json
{
  "event_id": "...",
  "payload": { ... },
  "prev_hash": "<hash of previous record>",
  "hash": "<hash of (payload + prev_hash)>",
  "timestamp": "..."
}
```

Each record's hash depends on the previous record's hash, so altering or deleting any past record breaks every hash after it — the chain can be verified end-to-end at any time (`GET /audit/verify` in the API). This gives:

- **Non-repudiation:** an operator can't quietly edit an alert record after the fact.
- **Chain of custody:** relevant if alert data is ever used as evidence.
- **Tamper detection, not tamper prevention:** this design detects that tampering happened and where — it doesn't physically prevent someone with database access from attempting it. Pair with strict access control on who can write to the underlying store at all.

This is deliberately a lightweight, purpose-built hash chain — not a public blockchain, not a token, not a smart contract. That's an honest scope for this problem: the goal is verifiable log integrity, not a distributed ledger, and claiming more than that in a pitch invites exactly the kind of scrutiny that undermines the answer.

## Data protection

- **PII/biometric data (face embeddings, plate numbers):** encrypted at rest, access role-gated and logged, retention policy defined (how long does a non-matched face crop get kept before deletion?).
- **Video clips tied to alerts:** same access controls as the alert itself.
- **Raw, non-alerted video:** stays on local NVR at the BOP under existing SSB data-handling policy — this platform does not centralize footage that never triggered an event.

## Authentication & authorization

- JWT-based session tokens, short expiry, refresh flow.
- Roles: `admin` (full config + user management), `operator` (live monitoring, zone config, watchlist entry), `auditor` (read-only access to logs and audit verification, no live control).
- Every privileged action (watchlist edit, zone change, user role change) is itself logged in the hash-chained audit trail.

## Open questions to resolve with SSB/MHA before real deployment

- Formal data retention policy for biometric matches and non-matches.
- Whether centralized storage of any biometric data is permitted under existing policy, or whether matching must stay fully on-edge with only match/no-match results (not raw biometric data) sent centrally.
- Physical security requirements for edge devices deployed at remote BOPs.
