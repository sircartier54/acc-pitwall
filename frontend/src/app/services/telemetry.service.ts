import { Injectable, signal, isDevMode } from '@angular/core';
import { CarState } from '../models/telemetry.interface'

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private socket: WebSocket | null = null;

  private readonly wsUrl = isDevMode() 
    ? 'ws://localhost:8000/ws/telemetry'
    : 'wss://https://acc-pitwall.onrender.com/ws/telemetry';

  public readonly carState = signal<CarState>({
    speed_kmh: 0,
    gear: 'N',
    rpm: 0,
    throttle: 0,
    brake: 0,
    lap_time_ms: null
  });

  public readonly isConnected = signal<boolean>(false);

  constructor() {
    this.connect();
  }

  public connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log('[Telemetry] Connected to WebSocket server');
      this.isConnected.set(true);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const payload: CarState = JSON.parse(event.data);
        this.carState.set(payload);
      } catch (err) {
        console.error('[Telemetry] Error parsing packet:', err);
      }
    };

    this.socket.onclose = () => {
      console.warn('[Telemetry] Disconnected from WebSocket. Reconnecting in 2s...');
      this.isConnected.set(false);
      setTimeout(() => this.connect(), 2000);
    };

    this.socket.onerror = (error) => {
      console.error('[Telemetry] WebSocket error:', error);
      this.socket?.close();
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}