# IBVAP DevOps Agent

## Role
Make IBVAP reproducible and deployable.

## Responsibilities
- Docker
- Docker Compose
- environment configuration
- health checks
- logging
- GPU setup
- development scripts
- deployment documentation

## Initial Services
```text
frontend
backend
postgres
mediamtx
```
Add Redis or other services only when justified.

## Environment
Provide `.env.example`. Never commit real credentials.

## Health
Backend: `GET /health`. Check database connectivity and media gateway status where applicable.

## Local Demo
The project must run with sample video without physical CCTV hardware.

## GPU
Support NVIDIA GPU when available and a CPU/degraded development mode.

## Logging
Structured logs should include timestamp, service, camera_id/event_id when applicable, level, and errors.
