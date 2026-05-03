import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService } from './voice.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-history',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bento-card h-full">
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          Synthesis History
        </h3>
        <span class="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black tracking-widest">
          {{ voiceService.generationHistory().length }} LOGS
        </span>
      </div>

      <div class="flex-1 overflow-y-auto space-y-2 pr-2 scroll-smooth">
        @for (item of voiceService.generationHistory(); track item.id; let i = $index) {
          <button class="w-full text-left group p-3 inner-box hover:bg-border-subtle/30 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50"
                  (click)="play(item.url)">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-colors">
                {{ (voiceService.generationHistory().length - i).toString().padStart(2, '0') }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] text-gray-300 truncate font-semibold leading-none mb-1 group-hover:text-white transition-colors">
                  {{ item.text.substring(0, 30) }}...
                </p>
                <div class="flex items-center gap-3">
                  <span class="text-[8px] text-gray-600 font-mono uppercase">{{ item.createdAt | date:'shortTime' }}</span>
                  <div class="w-1 h-1 rounded-full bg-gray-800"></div>
                  <span class="text-[8px] text-gray-600 font-mono uppercase">{{ item.effect }}</span>
                </div>
              </div>
              <mat-icon class="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-colors flex items-center justify-center">play_arrow</mat-icon>
            </div>
          </button>
        } @empty {
          <div class="h-full flex flex-col items-center justify-center opacity-10 py-10 scale-90">
             <mat-icon class="w-12 h-12 mb-2 flex items-center justify-center">history</mat-icon>
             <p class="text-[10px] font-bold uppercase tracking-widest">No Log Data</p>
          </div>
        }
      </div>

      <div class="pt-4 border-t border-border-subtle mt-4">
        <div class="flex justify-between items-center text-[9px] font-bold text-gray-600 uppercase tracking-widest">
          <span>Storage: 124MB / 1GB</span>
          <a href="#" class="text-primary hover:underline">Clear Logs</a>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent {
  voiceService = inject(VoiceService);

  play(url: string) {
    const audio = new Audio(url);
    audio.play();
  }
}
