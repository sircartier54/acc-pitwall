import asyncio
import struct
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.models.telemetry import CarState
from app.core.connection import manager

def parse_acc_gear(gear_int: int) -> str:
    """Translates ACC's raw integer gear into a string."""
    if gear_int == 0: return "R"
    if gear_int == 1: return "N"
    return str(gear_int - 1)

class ACCTelemetryProtocol(asyncio.DatagramProtocol):
    def datagram_received(self, data: bytes, addr: tuple):
        try:
            unpacked = struct.unpack('<fiiffi', data)
            
            state = CarState(
                speed_kmh=int(unpacked[0]),
                gear=parse_acc_gear(unpacked[1]),
                rpm=unpacked[2],
                throttle=unpacked[3],
                brake=unpacked[4],
                lap_time_ms=unpacked[5]
            )
            
            asyncio.create_task(manager.broadcast(state.model_dump()))
            
        except struct.error:
            # Silently ignore packets that don't match our expected byte size
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: ACCTelemetryProtocol(),
        local_addr=('127.0.0.1', 9000)
    )
    
    yield

    transport.close()

app = FastAPI(title="ACC Pitwall API", lifespan=lifespan)

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)