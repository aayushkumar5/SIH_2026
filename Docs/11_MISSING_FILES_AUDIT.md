# IBVAP — Missing Files Audit

This document maps the previously claimed functionality to the actual implementation that must exist.

| Claimed Area | Required Real Files/Modules |
|---|---|
| Frontend | `frontend/` React application |
| Backend | `backend/` FastAPI application |
| AI | `ai/` detector/tracker/pipeline |
| ANPR | `ai/anpr/` plate + OCR modules |
| Face | `ai/face/` detector + embedding + matcher |
| Night enhancement | `ai/preprocessing/night/` |
| Behavior | `ai/behavior/` rules/trajectory engine |
| Edge/Central sync | `edge/` sync client + local store |
| Hash chain | `backend/.../audit/` verifier + chain service |
| API | FastAPI routers/services/schemas |
| Deployment | Dockerfiles + Compose + `.env.example` |
| README claims | README must match actual code |

## Rule

A README feature list is not evidence that the feature exists.

Each item must have:
1. source code
2. configuration
3. tests
4. documentation
5. integration path
