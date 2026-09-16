from pydantic import BaseModel

class CarState(BaseModel):
    speed_kmh: int
    gear: str
    rpm: int
    throttle: float
    brake: float
    lap_time_ms: int | None = None