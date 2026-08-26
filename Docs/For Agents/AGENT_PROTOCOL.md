# IBVAP Multi-Agent Development Protocol

## Purpose
Prevent conflicting edits and incompatible modules when multiple AI agents work on IBVAP.

## Shared Contract First
Before a cross-module feature, confirm:
- input schema
- output schema
- event schema
- API endpoint
- database model
- error behavior

## Ownership
| Area | Owner |
|---|---|
| AI | AGENT_AI |
| Backend | AGENT_BACKEND |
| Database | AGENT_DATABASE |
| Frontend | AGENT_FRONTEND |
| Edge | AGENT_EDGE |
| Security | AGENT_SECURITY |
| QA | AGENT_TESTING |
| DevOps | AGENT_DEVOPS |
| Documentation | AGENT_DOCUMENTATION |
| Coordination | AGENT_ORCHESTRATOR |

## Cross-Agent Rule
1. Inspect public interface.
2. Do not copy internal implementation.
3. Import the interface.
4. Add integration tests.

## Handoff Format
```text
Feature:
Files:
Dependencies:
Tests:
Known limitations:
```

## No Silent Breaking Changes
For schema/API changes:
- document change
- update dependents
- update tests
- update docs
