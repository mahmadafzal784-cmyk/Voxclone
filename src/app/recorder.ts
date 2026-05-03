import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService } from './voice.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recorder',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bento-card h-full">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Voice Capture</h2>
        <span class="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-tighter">Live Ready</span>
      </div>

      <div class="flex-1 flex flex-col justify-center items-center inner-box mb-4 relative overflow-hidden p-6 min-h-[140px]">
        @if (isRecording()) {
          <div class="flex items-center gap-1.5 h-16">
            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
              <div class="w-1.5 bg-primary animate-bounce self-center rounded-full" 
                   [style.height.px]="15 + (math.random() * 40)"
                   [style.animationDelay.ms]="i * 100"></div>
            }
          </div>
          <div class="absolute top-3 right-4 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span class="text-[10px] font-mono text-red-500 font-bold">{{ recordingTime() }}s</span>
          </div>
        } @else {
          <div class="flex flex-col items-center gap-3 opacity-40">
             <mat-icon class="w-8 h-8 text-gray-400 flex items-center justify-center">mic</mat-icon>
             <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest">Awaiting Signal...</p>
          </div>
        }
      </div>

      <div class="space-y-3">
        @if (!isRecording()) {
          <button (click)="startRecording()" 
                  class="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-900/40 flex items-center justify-center gap-3 uppercase tracking-wider text-xs">
            <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
            Record Sample
          </button>
        } @else {
          <button (click)="stopRecording()" 
                  class="w-full py-4 bg-slate-100 hover:bg-white text-bg-deep font-black rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider text-xs">
            <mat-icon class="w-4 h-4 flex items-center justify-center">stop</mat-icon>
            Stop Capture
          </button>
        }
        
        <label class="block cursor-pointer group">
          <input type="file" class="hidden" accept="audio/*" (change)="onFileSelected($event)">
          <div class="w-full py-2.5 bg-transparent border border-border-active text-gray-500 hover:text-gray-300 text-[10px] font-bold rounded-lg transition-all text-center uppercase tracking-widest">
            Import WAV / MP3
          </div>
        </label>
      </div>

      @if (voiceService.currentSample(); as sample) {
        <div class="mt-4 pt-4 border-t border-border-subtle animate-in fade-in slide-in-from-top-2">
          <div class="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                <mat-icon class="w-4 h-4 flex items-center justify-center">check_circle</mat-icon>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold text-white truncate">{{ sample.name }}</p>
                <p class="text-[9px] text-gray-500 font-mono uppercase">{{ sample.duration.toFixed(1) }}s READY</p>
              </div>
            </div>
            <button (click)="voiceService.removeSample(sample.id)" 
                    class="p-2 text-gray-600 hover:text-red-500 transition-colors">
              <mat-icon class="w-4 h-4 flex items-center justify-center">trash</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  host: { 'class': 'block' }
})
export class RecorderComponent implements OnDestroy {
  readonly math = Math;

  voiceService = inject(VoiceService);
  
  isRecording = signal(false);
  recordingTime = signal(0);
  private timer: number | undefined;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  ngOnDestroy() {
    this.stopTimer();
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Mocking duration for now
        this.voiceService.addSample({
          id: crypto.randomUUID(),
          name: `Recording_${new Date().toLocaleTimeString()}`,
          url: audioUrl,
          duration: this.recordingTime(),
          createdAt: new Date()
        });
        
        this.stopTimer();
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.startTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording()) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }

  private startTimer() {
    this.recordingTime.set(0);
    this.timer = window.setInterval(() => {
      this.recordingTime.update(t => t + 1);
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.voiceService.addSample({
        id: crypto.randomUUID(),
        name: file.name,
        url: url,
        duration: 0, 
        createdAt: new Date()
      });
    }
  }
}
