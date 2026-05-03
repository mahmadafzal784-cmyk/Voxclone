import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecorderComponent } from './recorder';
import { GeneratorComponent } from './generator';
import { HistoryComponent } from './history';
import { VoiceService } from './voice.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, RecorderComponent, GeneratorComponent, HistoryComponent, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  voiceService = inject(VoiceService);
}
