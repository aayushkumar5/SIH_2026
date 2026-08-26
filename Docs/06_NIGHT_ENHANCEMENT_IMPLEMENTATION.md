# IBVAP — Night / Low-Light Enhancement Specification

## Objective
Implement an actual low-light preprocessing pipeline to improve detection in difficult night scenes.

## Pipeline
```text
Night Frame
 ↓
Brightness/Exposure Analysis
 ↓
Optional Low-Light Enhancement
 ↓
Denoising
 ↓
Contrast Adjustment
 ↓
AI Detector
```

## Requirements
The enhancement module must be optional and configurable.

Do not automatically apply heavy enhancement to every frame.

## Modes
- disabled
- automatic
- forced night mode

## Integration
```text
camera configuration
→ night schedule
→ enhancement decision
→ preprocessing
→ detector
```

## Evaluation
Compare:
- detector confidence
- precision/recall where labels exist
- FPS
- latency
- visual quality

## Acceptance Criteria
The module can be enabled/disabled through configuration and produces measurable results on a labelled low-light test set.
