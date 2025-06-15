import { Audio } from 'expo-av';

export class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private isWeb = false;

  constructor() {
    // Check if we're running on web
    this.isWeb = typeof window !== 'undefined' && typeof AudioContext !== 'undefined';
    
    if (this.isWeb) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  generateTickSound(frequency: number = 400, duration: number = 0.1): Promise<Audio.Sound | null> {
    return new Promise((resolve) => {
      if (!this.isWeb || !this.audioContext) {
        resolve(null);
        return;
      }

      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        resolve(null);
      } catch (error) {
        console.error('Error generating tick sound:', error);
        resolve(null);
      }
    });
  }

  generateVictorySound(): Promise<Audio.Sound | null> {
    return new Promise((resolve) => {
      if (!this.isWeb || !this.audioContext) {
        resolve(null);
        return;
      }

      try {
        this.playVictorySequence();
        resolve(null);
      } catch (error) {
        console.error('Error generating victory sound:', error);
        resolve(null);
      }
    });
  }

  private playVictorySequence() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.2 },
      { freq: 659.25, time: 0.2, duration: 0.2 },
      { freq: 783.99, time: 0.4, duration: 0.2 },
      { freq: 1046.50, time: 0.6, duration: 0.3 },
      { freq: 783.99, time: 0.9, duration: 0.2 },
      { freq: 1046.50, time: 1.1, duration: 0.4 },
    ];

    notes.forEach(note => {
      this.playLevelCompleteNote(note.freq, now + note.time, note.duration);
    });
  }

  private playLevelCompleteNote(frequency: number, startTime: number, duration: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private tickTimeoutId: NodeJS.Timeout | null = null;

  playSpinningTicks(initialInterval: number = 60, wheelBody?: any, frequency: number = 700) {
    if (!this.isWeb) return;

    this.stopSpinningTicks();
    
    const playTick = () => {
      if (wheelBody && Math.abs(wheelBody.angularVelocity) < 0.05) {
        this.stopSpinningTicks();
        return;
      }
      
      
      let nextInterval;
      if (wheelBody) {
        const velocity = Math.abs(wheelBody.angularVelocity);
        
  
        const minInterval = 30;
        const maxInterval = 800;
        
        if (velocity > 0.1) {
          const logVelocity = Math.log(velocity + 0.1);
          const logMax = Math.log(15.1);
          const logMin = Math.log(0.2);
          const normalizedLog = Math.max(0, Math.min(1, (logVelocity - logMin) / (logMax - logMin)));
          nextInterval = maxInterval - (maxInterval - minInterval) * normalizedLog;
          
          this.generateTickSound(frequency, 0.08);
        } else {
          nextInterval = maxInterval;
          this.generateTickSound(frequency, 0.08);
        }
        
        nextInterval = Math.max(minInterval, Math.min(maxInterval, nextInterval));
      } else {
        nextInterval = initialInterval * 1.08;
      }
      
      this.tickTimeoutId = setTimeout(playTick, nextInterval);
    };
    
    playTick();
  }

  stopSpinningTicks() {
    if (this.tickTimeoutId) {
      clearTimeout(this.tickTimeoutId);
      this.tickTimeoutId = null;
    }
  }

  createFallbackTickSound(): { play: () => void } {
    return {
      play: () => {
        console.log('Tick sound played (fallback)');
      }
    };
  }

  createFallbackVictorySound(): { play: () => void } {
    return {
      play: () => {
        console.log('Victory sound played (fallback)');
      }
    };
  }
}

export const audioGenerator = new AudioGenerator();