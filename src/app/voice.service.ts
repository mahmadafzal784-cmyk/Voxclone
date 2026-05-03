import { Injectable, signal, computed } from '@angular/core';

export interface VoiceSample {
  id: string;
  name: string;
  url: string;
  duration: number;
  createdAt: Date;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  url: string;
  lang: string;
  pitch: number;
  effect: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private samples = signal<VoiceSample[]>([]);
  private history = signal<GeneratedAudio[]>([]);

  readonly allSamples = computed(() => this.samples());
  readonly generationHistory = computed(() => this.history());

  readonly currentSample = signal<VoiceSample | null>(null);

  addSample(sample: VoiceSample) {
    this.samples.update(s => [sample, ...s]);
    this.currentSample.set(sample);
  }

  addToHistory(audio: GeneratedAudio) {
    this.history.update(h => [audio, ...h]);
  }

  removeSample(id: string) {
    this.samples.update(s => s.filter(item => item.id !== id));
    if (this.currentSample()?.id === id) {
      this.currentSample.set(null);
    }
  }

  clearHistory() {
    this.history.set([]);
  }
}
