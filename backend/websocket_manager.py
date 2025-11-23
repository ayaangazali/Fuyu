"""
WebSocket Manager for Real-Time Strategy Updates
Broadcasts strategy changes to connected frontend clients
"""

from fastapi import WebSocket
from typing import List, Dict, Any
import json
from datetime import datetime

class WebSocketManager:
    """
    Manages WebSocket connections and broadcasts strategy updates
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔗 WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast_json(self, data: Dict[str, Any]):
        """Broadcast JSON data to all connected clients"""
        if not self.active_connections:
            print("📡 No WebSocket connections to broadcast to")
            return
        
        message = json.dumps(data)
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
        
        if self.active_connections:
            print(f"📡 Broadcasted to {len(self.active_connections)} clients: {data.get('type', 'unknown')}")
    
    async def broadcast_strategy_update(self, action: str, old_strategy: Dict[str, Any], new_strategy: Dict[str, Any], feedback: str):
        """Broadcast a strategy update to all connected clients"""
        update_data = {
            "type": "strategy_update",
            "timestamp": datetime.now().isoformat(),
            "action": action,  # 'keep', 'modify', or 'replace'
            "old_strategy": old_strategy,
            "new_strategy": new_strategy,
            "feedback": feedback,
            "message": f"Strategy {action.upper()}: {feedback[:100]}..."
        }
        
        await self.broadcast_json(update_data)
    
    async def broadcast_analysis_status(self, status: str, message: str):
        """Broadcast analysis status updates"""
        status_data = {
            "type": "analysis_status",
            "timestamp": datetime.now().isoformat(),
            "status": status,  # 'analyzing', 'modifying', 'replacing', 'idle'
            "message": message
        }
        
        await self.broadcast_json(status_data)
    
    async def broadcast_performance_data(self, performance_file: str, analysis_result: Dict[str, Any]):
        """Broadcast new performance analysis results"""
        performance_data = {
            "type": "performance_update",
            "timestamp": datetime.now().isoformat(),
            "performance_file": performance_file,
            "analysis_result": analysis_result
        }
        
        await self.broadcast_json(performance_data)

# Global WebSocket manager instance
websocket_manager = WebSocketManager()