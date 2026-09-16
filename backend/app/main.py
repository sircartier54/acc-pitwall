import asyncio
import random
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.models.telemetry import CarState
from app.core.connection import manager

# ! mock telemetry !
async def mock_telemetry_loop():
    """Generates synthetic ACC data at 10Hz and broadcasts it."""
    try:
        while True:
            mock_state = CarState(
                speed_kmh=random.randint(240, 260),
                gear=str(random.randint(4, 6)),
                rpm=random.randint(6000, 8000),
                throttle=random.uniform(0.8, 1.0),
                brake=0.0
            )
            
            await manager.broadcast(mock_state.model_dump())
            
            # 10 Hz frequency
            await asyncio.sleep(0.1)
    except asyncio.CancelledError:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    loop_task = asyncio.create_task(mock_telemetry_loop())
    yield

    loop_task.cancel()

app = FastAPI(title="ACC Pitwall API", lifespan=lifespan)

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)