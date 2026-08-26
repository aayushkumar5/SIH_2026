# Project File Guide

This document describes the current contents of the SIH repository. It is an inventory of the application source code, tests, deployment files, and documentation.

## Project Overview

The project is **IBVAP (Intelligent Border Video Analytics Platform)**. It combines:

- AI-based detection, tracking, ANPR, face recognition, and behavior analytics.
- A FastAPI backend with SQLAlchemy models, REST endpoints, and WebSocket updates.
- A React and Vite frontend dashboard.
- Edge synchronization support for remote Border Out Posts.
- Tamper-evident event and audit logging through a hash chain.

## Root Files

| File | Purpose |
|---|---|
| `.env.example` | Example environment configuration for application, database, edge, storage, AI, and logging settings. Copy to `.env` and replace development values locally. |
| `.gitignore` | Excludes secrets, local databases, storage, Python caches, frontend dependencies, build output, and logs from Git. |
| `docker-compose.yml` | Defines the PostgreSQL, FastAPI backend, and frontend services for containerized development or deployment. |
| `requirements.txt` | Python dependencies for the API, database, computer vision, optional ML integrations, and tests. |
| `run_demo.py` | Local demonstration entry point for running the project pipeline. |

## AI Package: `ai/`

The AI package contains the computer-vision pipeline and its domain-specific analyzers.

| File | Purpose |
|---|---|
| `ai/__init__.py` | Marks the AI directory as a Python package. |
| `ai/config.py` | Loads AI and application inference configuration from environment variables. |
| `ai/detector.py` | Detects people, vehicles, and other objects in video frames. |
| `ai/pipeline.py` | Coordinates preprocessing, detection, tracking, behavior analysis, and event generation. |
| `ai/schemas.py` | Defines shared data structures for detections, tracks, frames, and AI events. |
| `ai/tracker.py` | Maintains object identities across video frames. |

### ANPR: `ai/anpr/`

Automatic Number Plate Recognition detects plates, reads their text, and validates the result.

| File | Purpose |
|---|---|
| `ai/anpr/__init__.py` | Marks the ANPR directory as a Python package. |
| `ai/anpr/detector.py` | Finds vehicle number-plate regions in frames. |
| `ai/anpr/ocr.py` | Extracts number-plate text using OCR functionality. |
| `ai/anpr/validator.py` | Checks recognized plate text against expected formats and normalizes results. |

### Behavior Analytics: `ai/behavior/`

Behavior modules convert tracked-object movement into security events.

| File | Purpose |
|---|---|
| `ai/behavior/__init__.py` | Marks the behavior directory as a Python package. |
| `ai/behavior/intrusion.py` | Detects crossings into protected areas or across virtual lines. |
| `ai/behavior/loitering.py` | Detects objects remaining in a zone longer than its configured threshold. |
| `ai/behavior/night_movement.py` | Detects movement during configured night hours. |
| `ai/behavior/zone.py` | Provides zone geometry and point-in-zone or line-crossing utilities. |

### Face Recognition: `ai/face/`

Face modules detect faces, create embeddings, and compare them with watchlist entries.

| File | Purpose |
|---|---|
| `ai/face/__init__.py` | Marks the face directory as a Python package. |
| `ai/face/detector.py` | Locates faces in images or video frames. |
| `ai/face/embedder.py` | Creates numerical face embeddings for matching. |
| `ai/face/matcher.py` | Compares embeddings with known watchlist identities and returns matches. |

### Preprocessing: `ai/preprocessing/`

| File | Purpose |
|---|---|
| `ai/preprocessing/__init__.py` | Marks the preprocessing directory as a Python package. |
| `ai/preprocessing/low_light.py` | Enhances low-light frames before detection and recognition. |

## Backend: `backend/`

The backend exposes the platform API, persists operational data, and broadcasts live events.

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Builds the backend container image and starts the FastAPI service. |
| `backend/app/main.py` | Creates the FastAPI application, initializes database tables and seed data, configures CORS/static files, and handles WebSockets. |

### API Routes: `backend/app/api/v1/`

| File | Purpose |
|---|---|
| `backend/app/api/v1/__init__.py` | Marks the API version directory as a Python package. |
| `backend/app/api/v1/api.py` | Combines and prefixes the version-one API routers. |
| `backend/app/api/v1/alerts.py` | Endpoints for listing, reading, and updating security alerts. |
| `backend/app/api/v1/analytics.py` | Endpoints for analytics summaries and operational metrics. |
| `backend/app/api/v1/anpr.py` | Endpoints for number-plate detections and plate watchlist operations. |
| `backend/app/api/v1/audit.py` | Endpoints for audit records and hash-chain verification. |
| `backend/app/api/v1/auth.py` | User registration, login, bearer-token authentication, and current-user access. |
| `backend/app/api/v1/cameras.py` | Camera registration, status, and camera management endpoints. |
| `backend/app/api/v1/events.py` | Endpoints for recorded detection and security events. |
| `backend/app/api/v1/faces.py` | Endpoints for face detections, recognition, and face watchlist operations. |
| `backend/app/api/v1/system.py` | Health, status, and system-level monitoring endpoints. |
| `backend/app/api/v1/zones.py` | Endpoints for creating and managing camera security zones. |

### Core Services: `backend/app/core/`

| File | Purpose |
|---|---|
| `backend/app/core/config.py` | Defines backend settings loaded from environment variables, including database, JWT, API, and edge settings. |
| `backend/app/core/database.py` | Configures SQLAlchemy engine/session access and the declarative model base. |
| `backend/app/core/security.py` | Provides password hashing, password verification, JWT creation, and authentication helpers. |

### Database Models: `backend/app/models/`

| File | Purpose |
|---|---|
| `backend/app/models/__init__.py` | Exposes backend database model definitions as a package. |
| `backend/app/models/alert.py` | Alert persistence model for prioritized security notifications. |
| `backend/app/models/audit.py` | Audit-log model for privileged actions and integrity metadata. |
| `backend/app/models/camera.py` | Camera model containing stream, location, BOP, and online-status information. |
| `backend/app/models/event.py` | Event model for detections and behavior-analysis results. |
| `backend/app/models/user.py` | User, role, and authentication-related database model. |
| `backend/app/models/watchlist.py` | Plate and face watchlist models used for matching and alerting. |
| `backend/app/models/zone.py` | Camera zone model containing geometry, severity, and loitering settings. |

### Schemas: `backend/app/schemas/`

| File | Purpose |
|---|---|
| `backend/app/schemas/__init__.py` | Marks the schemas directory as a Python package. |
| `backend/app/schemas/schemas.py` | Pydantic request and response schemas shared by API routes. |

### Backend Services: `backend/app/services/`

| File | Purpose |
|---|---|
| `backend/app/services/alert_service.py` | Creates, prioritizes, and manages alert records. |
| `backend/app/services/analytics_service.py` | Calculates dashboard and operational analytics. |
| `backend/app/services/event_service.py` | Stores and processes incoming AI events. |
| `backend/app/services/hash_chain.py` | Builds and verifies the tamper-evident hash chain for events and audits. |

### WebSockets: `backend/app/websocket/`

| File | Purpose |
|---|---|
| `backend/app/websocket/connection_manager.py` | Tracks connected clients and broadcasts live alerts/events. |

## Edge Package: `edge/`

| File | Purpose |
|---|---|
| `edge/__init__.py` | Marks the edge directory as a Python package. |
| `edge/edge_runner.py` | Runs AI processing and local edge operations for a Border Out Post. |
| `edge/sync_client.py` | Synchronizes edge events and state with the central backend. |

## Frontend: `frontend/`

The frontend is a React single-page dashboard built with Vite, TypeScript, Tailwind CSS, and Lucide icons.

| File | Purpose |
|---|---|
| `frontend/Dockerfile` | Builds and serves the frontend as a containerized static web application. |
| `frontend/index.html` | HTML entry document used by Vite. |
| `frontend/package.json` | Defines frontend scripts and runtime/development dependencies. |
| `frontend/package-lock.json` | Locks exact npm dependency versions for reproducible installs. |
| `frontend/postcss.config.js` | Configures PostCSS and Tailwind processing. |
| `frontend/tailwind.config.js` | Configures Tailwind content paths and theme settings. |
| `frontend/tsconfig.json` | TypeScript compiler configuration. |
| `frontend/vite.config.ts` | Vite build and development-server configuration. |

### Frontend Entry and Shared UI: `frontend/src/`

| File | Purpose |
|---|---|
| `frontend/src/main.tsx` | React application bootstrap that mounts the root component. |
| `frontend/src/App.tsx` | Defines the application shell and page routing/navigation. |
| `frontend/src/index.css` | Global styles, Tailwind layers, layout styles, and dashboard theme. |

### Frontend Components: `frontend/src/components/`

| File | Purpose |
|---|---|
| `frontend/src/components/AlertFeed.tsx` | Displays live and historical security alerts. |
| `frontend/src/components/AuditVerifier.tsx` | Presents audit-chain verification results. |
| `frontend/src/components/Navbar.tsx` | Renders the top navigation and user/session controls. |
| `frontend/src/components/Sidebar.tsx` | Renders primary dashboard navigation. |
| `frontend/src/components/VideoWall.tsx` | Displays camera feeds or camera monitoring tiles. |

### Frontend Pages: `frontend/src/pages/`

| File | Purpose |
|---|---|
| `frontend/src/pages/DashboardPage.tsx` | Main operational overview with key counts and recent activity. |
| `frontend/src/pages/LiveMonitorPage.tsx` | Live camera monitoring view. |
| `frontend/src/pages/AlertsPage.tsx` | Alert list and alert investigation view. |
| `frontend/src/pages/AnalyticsPage.tsx` | Charts and summaries for platform activity. |
| `frontend/src/pages/ANPRPage.tsx` | Number-plate recognition results and watchlist view. |
| `frontend/src/pages/FaceRecognitionPage.tsx` | Face-recognition results and watchlist view. |
| `frontend/src/pages/InvestigationPage.tsx` | Search and review workflow for historical events. |
| `frontend/src/pages/AuditPage.tsx` | Audit-log and integrity verification view. |
| `frontend/src/pages/ZonesPage.tsx` | Security-zone configuration and management view. |

### Frontend Services and Types: `frontend/src/services/` and `frontend/src/types/`

| File | Purpose |
|---|---|
| `frontend/src/services/api.ts` | HTTP client functions for backend REST endpoints. |
| `frontend/src/services/websocket.ts` | WebSocket client for live backend updates. |
| `frontend/src/types/index.ts` | Shared TypeScript types for cameras, alerts, events, users, and dashboard data. |

## Tests: `tests/`

| File | Purpose |
|---|---|
| `tests/test_ai_pipeline.py` | Tests object detection/tracking pipeline behavior and generated events. |
| `tests/test_anpr_face.py` | Tests ANPR validation and face-recognition functionality. |
| `tests/test_backend_api.py` | Tests backend API endpoints and application behavior. |
| `tests/test_edge_sync.py` | Tests edge-to-central synchronization behavior. |
| `tests/test_hash_chain.py` | Tests hash-chain creation, verification, and tamper detection. |

## Documentation: `Docs/`

| File | Purpose |
|---|---|
| `Docs/README.md` | Existing project introduction, feature summary, and documentation entry point. |
| `Docs/PROJECT_FILE_GUIDE.md` | This current file-by-file repository inventory. |
| `Docs/01_FRONTEND_IMPLEMENTATION.md` | Frontend implementation notes and planned dashboard work. |
| `Docs/02_BACKEND_IMPLEMENTATION.md` | Backend implementation notes and API/service details. |
| `Docs/03_AI_MODULES_IMPLEMENTATION.md` | AI pipeline and module implementation notes. |
| `Docs/04_ANPR_IMPLEMENTATION.md` | ANPR implementation details and integration notes. |
| `Docs/05_FACE_RECOGNITION_IMPLEMENTATION.md` | Face-recognition implementation details and limitations. |
| `Docs/06_NIGHT_ENHANCEMENT_IMPLEMENTATION.md` | Low-light and night-time enhancement implementation notes. |
| `Docs/07_BEHAVIOR_ANALYTICS_IMPLEMENTATION.md` | Intrusion, loitering, zone, and night-movement behavior notes. |
| `Docs/08_EDGE_CENTRAL_SYNC_IMPLEMENTATION.md` | Edge processing and central synchronization implementation notes. |
| `Docs/09_HASH_CHAIN_IMPLEMENTATION.md` | Hash-chain design and implementation notes. |
| `Docs/10_DEPLOYMENT_CONFIGURATION_IMPLEMENTATION.md` | Deployment, environment, and configuration implementation notes. |
| `Docs/11_MISSING_FILES_AUDIT.md` | Audit of expected versus present project files. |
| `Docs/API_REFERENCE.md` | REST and WebSocket API reference. |
| `Docs/ARCHITECTURE.md` | System architecture, layers, components, and data flow. |
| `Docs/DEPLOYMENT.md` | Deployment guidance for central and edge environments. |
| `Docs/FEASIBILITY_AND_IMPACT.md` | Feasibility, viability, expected impact, and operational considerations. |
| `Docs/IMPLEMENTATION.md` | Broad implementation plan and repository-level technical details. |
| `Docs/MODEL_CARD.md` | AI model purpose, data assumptions, limitations, and responsible-use notes. |
| `Docs/PROBLEM_STATEMENT.md` | Statement of the SIH problem and project context. |
| `Docs/REFERENCES.md` | Datasets, research papers, libraries, and related systems. |
| `Docs/ROADMAP.md` | Planned development phases and future work. |
| `Docs/SECURITY.md` | Threat model, security controls, and tamper-evident logging rationale. |
| `Docs/SOLUTION_OVERVIEW.md` | High-level solution and mapping from the problem to platform capabilities. |
| `Docs/TESTING.md` | Test strategy, validation approach, and evaluation criteria. |

### Agent Guides: `Docs/For Agents/`

These files provide role-specific instructions for contributors or AI agents working on the repository.

| File | Purpose |
|---|---|
| `Docs/For Agents/AGENT_AI.md` | Guidance for AI and computer-vision work. |
| `Docs/For Agents/AGENT_BACKEND.md` | Guidance for backend and API work. |
| `Docs/For Agents/AGENT_DATABASE.md` | Guidance for database and persistence work. |
| `Docs/For Agents/AGENT_DEVOPS.md` | Guidance for containers, deployment, and operations. |
| `Docs/For Agents/AGENT_DOCUMENTATION.md` | Guidance for maintaining project documentation. |
| `Docs/For Agents/AGENT_EDGE.md` | Guidance for edge-device and synchronization work. |
| `Docs/For Agents/AGENT_FRONTEND.md` | Guidance for React dashboard work. |
| `Docs/For Agents/AGENT_ORCHESTRATOR.md` | Guidance for coordinating work across project areas. |
| `Docs/For Agents/AGENT_PROTOCOL.md` | Shared development protocol and contribution expectations. |
| `Docs/For Agents/AGENT_SECURITY.md` | Guidance for security reviews and secure implementation. |
| `Docs/For Agents/AGENT_TESTING.md` | Guidance for test design and validation. |

## Local and Generated Items

The following items may exist during development but are intentionally excluded from Git by `.gitignore`:

- `.env` and other local environment files.
- `ibvap.db`, SQLite files, and other local databases.
- `storage/` runtime media and snapshots.
- Python bytecode and cache directories.
- `frontend/node_modules/` installed npm packages.
- `frontend/dist/` generated production frontend output.
- Test caches and log files.

## Typical Startup Paths

### Backend and tests

```powershell
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
pytest
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Docker Compose

```powershell
docker compose up --build
```

The exact environment values, ports, and production considerations are documented in `.env.example`, `docker-compose.yml`, and the deployment documents in `Docs/`.