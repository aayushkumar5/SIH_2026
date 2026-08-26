# IBVAP — Behavior Analytics Specification

## Objective
Implement explainable suspicious-activity detection before attempting a learned behavior model.

## MVP Behaviors
- loitering
- restricted-zone entry
- line crossing
- unusual night movement
- stationary vehicle in restricted area
- crowd threshold
- repeated zone entry

## Architecture
```text
Tracks
 ↓
Trajectory History
 ↓
Zone/Time/Duration Rules
 ↓
Behavior Event
```

## Loitering
Inputs:
- track ID
- zone
- entry time
- exit time
- configured duration

Generate an event only when the threshold is crossed.

## Suspicious Activity
Do not label generic movement as suspicious without an explicit rule.

Each rule should have:
- rule ID
- name
- enabled state
- conditions
- threshold
- severity

## Phase 2 Learned Behavior
A trained temporal model may later use:
- track trajectories
- object interactions
- temporal windows
- scene context

It must be evaluated against labelled data before deployment.

## Acceptance Criteria
Each behavior produces deterministic testable events and explains why the event was triggered.
