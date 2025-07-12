// Sound effects utility using Web Audio API
class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.muted = false;
    this.init();
  }

  setMuted(mute) {
    this.muted = mute;
  }

  // Initialize audio context
  init() {
    try {
      // Create audio context (needs user interaction first)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  }

  // Resume audio context (required after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Generate a beep sound
  beep(frequency = 800, duration = 200, type = 'sine') {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Fade in and out for smooth sound
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // Play success sound (ascending notes)
  success() {
    if (!this.audioContext || this.muted) return;
    
    this.beep(523, 150, 'sine'); // C
    setTimeout(() => this.beep(659, 150, 'sine'), 150); // E
    setTimeout(() => this.beep(784, 300, 'sine'), 300); // G
  }

  // Play error sound (descending notes)
  error() {
    if (!this.audioContext || this.muted) return;
    
    this.beep(784, 150, 'sawtooth'); // G
    setTimeout(() => this.beep(659, 150, 'sawtooth'), 150); // E
    setTimeout(() => this.beep(523, 300, 'sawtooth'), 300); // C
  }

  // Play click sound
  click() {
    if (this.muted) return;
    this.beep(1000, 50, 'square');
  }

  // Play pop sound (for cell selection)
  pop() {
    if (this.muted) return;
    this.beep(1200, 80, 'triangle');
  }

  // Play remove sound (for successful removal)
  remove() {
    if (this.muted) return;
    this.beep(400, 100, 'sine');
    setTimeout(() => this.beep(300, 100, 'sine'), 100);
  }

  // Play win sound (fanfare)
  win() {
    if (!this.audioContext || this.muted) return;
    
    // Play a little fanfare
    this.beep(523, 200, 'sine'); // C
    setTimeout(() => this.beep(659, 200, 'sine'), 200); // E
    setTimeout(() => this.beep(784, 200, 'sine'), 400); // G
    setTimeout(() => this.beep(1047, 400, 'sine'), 600); // C (high)
  }
}

// Create a singleton instance
const soundEffects = new SoundEffects();

export default soundEffects; 