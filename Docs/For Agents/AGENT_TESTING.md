# IBVAP Testing / QA Agent

## Role
Verify behavior and ensure documentation matches implementation.

## Layers
### Unit
AI utilities, zone geometry, behavior rules, schemas, services.

### Integration
Video → AI → event → backend → database → WebSocket → frontend.

### End-to-End
1. camera starts
2. person appears
3. person enters restricted zone
4. intrusion generated
5. event stored
6. alert broadcast
7. dashboard displays
8. operator acknowledges

## Metrics
Detection precision/recall where ground truth exists, false positives/negatives, alert latency, FPS, resource usage, tracking stability, ANPR accuracy, face threshold behavior.

Never approve a feature from a screenshot alone.

## Regression
Run tests, lint/type checks, demo pipeline, API health after major changes.
