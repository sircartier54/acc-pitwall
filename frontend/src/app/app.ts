import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService } from './services/telemetry.service'; // Note: updated path

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected telemetryService = inject(TelemetryService);
  
  // Read signals directly from the service
  protected car = this.telemetryService.carState;
  protected connected = this.telemetryService.isConnected;
}