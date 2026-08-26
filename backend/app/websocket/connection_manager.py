import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket

logger = logging.getLogger("backend.websocket")


class ConnectionManager:
    """
    Manages active WebSocket client connections for real-time alert and telemetry broadcasting.
    """
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining clients: {len(self.active_connections)}")

    async def broadcast(self, message_type: str, payload: dict):
        """Broadcasts a typed JSON payload to all active dashboards."""
        if not self.active_connections:
            return

        message = {
            "type": message_type,
            "data": payload
        }
        encoded = json.dumps(message, default=str)
        dead_connections = []

        for conn in self.active_connections:
            try:
                await conn.send_text(encoded)
            except Exception as e:
                logger.warning(f"Error sending message to WebSocket client: {e}")
                dead_connections.append(conn)

        for dead in dead_connections:
            self.disconnect(dead)


ws_manager = ConnectionManager()
