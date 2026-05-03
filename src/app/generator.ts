import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceService } from './voice.service';
import { MatIconModule } from '@angular/material/icon';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Component({
  selector: 'app-generator',
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="bento-card h-full gap-5">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          Input Script
        </h3>
        <div class="flex gap-4 text-[9px] text-gray-600 font-mono uppercase tracking-widest">
          <span>Characters: {{ textInput().length }}</span>
          <span>Est. Duration: {{ (textInput().length / 15).toFixed(1) }}s</span>
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-4">
        <textarea 
          [ngModel]="textInput()"
          (ngModelChange)="textInput.set($event)"
          placeholder="Enter text to synthesize neural audio..."
          class="flex-1 w-full p-5 bg-bg-deep border border-border-subtle rounded-2xl text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-primary/40 transition-colors resize-none font-sans leading-relaxed text-sm shadow-inner"
        ></textarea>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="space-y-1.5">
            <label for="lang-select" class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Output Language</label>
            <select id="lang-select" [ngModel]="selectedLang()" (ngModelChange)="selectedLang.set($event)"
                    class="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-gray-300 focus:outline-none focus:border-primary/20">
              @for (lang of languages; track lang.code) {
                <option [value]="lang.code">{{ lang.name }}</option>
              }
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="fx-select" class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Signal Processing</label>
            <select id="fx-select" [ngModel]="selectedEffect()" (ngModelChange)="selectedEffect.set($event)"
                    class="w-full bg-bg-deep border border-border-subtle rounded-xl p-2.5 text-xs text-gray-300 focus:outline-none focus:border-primary/20">
              @for (fx of effects; track fx) {
                <option [value]="fx">{{ fx }}</option>
              }
            </select>
          </div>

          <div class="flex items-end">
             <button (click)="enhanceWithAI()" 
                    [disabled]="!textInput() || isEnhancing()"
                    class="w-full h-[41px] flex items-center justify-center gap-2 bg-border-subtle hover:bg-border-active disabled:opacity-30 text-[10px] font-black text-gray-400 hover:text-white rounded-xl border border-border-active transition-all uppercase tracking-widest">
              <mat-icon class="text-sm flex items-center justify-center">auto_fix_high</mat-icon>
              {{ isEnhancing() ? 'Processing...' : 'AI Enhance' }}
            </button>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <button (click)="generate()" 
                [disabled]="isGenerating() || !textInput() || !voiceService.currentSample()"
                class="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-border-subtle disabled:text-gray-700 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 overflow-hidden relative group uppercase tracking-widest text-sm">
          @if (isGenerating()) {
            <div class="absolute inset-0 bg-primary-dark/20 animate-pulse"></div>
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Synthesizing Neural Signal...
          } @else {
            <mat-icon class="group-hover:scale-110 transition-transform flex items-center justify-center">volume_up</mat-icon>
            Synthesize & Preview
          }
        </button>
        
        @if (!voiceService.currentSample()) {
          <p class="text-[9px] text-amber-500/80 text-center font-bold mt-2 uppercase tracking-tighter animate-pulse">
            Neural model requires source sample for cloning
          </p>
        }
      </div>
    </div>
  `
})
export class GeneratorComponent {
  voiceService = inject(VoiceService);
  
  textInput = signal('');
  selectedLang = signal('en');
  selectedEffect = signal('Studio Master');
  pitch = signal(0);
  
  isGenerating = signal(false);
  isEnhancing = signal(false);

  languages = [
    { code: 'en', name: 'English (US)' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pl', name: 'Polish' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh-cn', name: 'Chinese' }
  ];

  effects = ['Studio Master', 'Deep Echo', 'Cinematic Reverb', 'Vintage Radio', 'Phone Voice'];

  async enhanceWithAI() {
    const text = this.textInput();
    if (!text) return;

    this.isEnhancing.set(true);
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Rewrite this script to sound more professional and natural for a voice-over, optimized for a deep or natural voice. Keep the length similar: "${text}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      this.textInput.set(response.text().trim());
    } catch (err) {
      console.error('AI Enhancement failed:', err);
    } finally {
      this.isEnhancing.set(false);
    }
  }

  async generate() {
    this.isGenerating.set(true);
    
    // Simulate API delay
    setTimeout(() => {
      this.voiceService.addToHistory({
        id: crypto.randomUUID(),
        text: this.textInput(),
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder for now
        lang: this.selectedLang(),
        pitch: this.pitch(),
        effect: this.selectedEffect(),
        createdAt: new Date()
      });
      this.isGenerating.set(false);
    }, 2500);
  }
}
