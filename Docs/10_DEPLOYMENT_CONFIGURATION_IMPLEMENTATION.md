# IBVAP — Actual Deployment Specification

## Objective
Create real deployment configuration for development and edge deployment.

## Services
```text
frontend
backend
postgres
mediamtx
edge-agent
```

Add Redis/message broker only if the implementation actually needs it.

## Docker
Each service must have:
- Dockerfile
- environment configuration
- health check
- restart behavior
- logs

## GPU
Edge AI image must support NVIDIA GPU when available.

Configure:
- CUDA-compatible runtime
- NVIDIA Container Toolkit
- GPU device visibility

## Environment
Provide `.env.example` containing placeholders only.

Required categories:
- database URL
- authentication secret
- media gateway settings
- model paths
- storage paths
- camera configuration
- log level

## Production
Use:
- HTTPS/TLS
- persistent volumes
- restricted network exposure
- database backups
- log rotation
- resource limits

## Acceptance Criteria
A fresh machine can follow the documented steps and start the complete system without manually editing source code.
