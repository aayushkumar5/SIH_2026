import os
import platform
import psutil
from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "bop_id": settings.BOP_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/metrics")
def system_metrics():
    cpu_percent = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    return {
        "platform": platform.platform(),
        "cpu_percent": cpu_percent,
        "memory_percent": mem.percent,
        "memory_used_mb": round(mem.used / (1024 * 1024), 1),
        "disk_percent": disk.percent,
        "disk_free_gb": round(disk.free / (1024 * 1024 * 1024), 2),
        "bop_id": settings.BOP_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
