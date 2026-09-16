export interface CarState {
  speed_kmh: number;
  gear: string;
  rpm: number;
  throttle: number;
  brake: number;
  lap_time_ms: number | null;
}