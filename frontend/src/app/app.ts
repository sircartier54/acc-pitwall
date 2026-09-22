import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService } from './services/telemetry.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  host: {
    '[attr.data-theme]': 'themeService.theme()'
  }
})
export class App {
  protected telemetryService = inject(TelemetryService);
  protected themeService = inject(ThemeService);
  
  protected car = this.telemetryService.carState;
  protected connected = this.telemetryService.isConnected;

  protected formattedLapTime = computed(() => {
    const ms = this.car().lap_time_ms;
    if (!ms || ms === 0) return '--:--.---';

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;

    return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  });
}