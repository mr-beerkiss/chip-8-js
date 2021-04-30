class Speaker {
  constructor() {
    const AudioContext = window.AudioContext || webkit.webkitAudioContext;

    this.audioCtx = new AudioContext();

    // create a gain, which allows us to control the volume
    this.gain = this.audioCtx.createGain();
    this.finish = this.audioCtx.destination;

    // connect the gain to the audio context
    this.gain.connect(this.finish);
  }

  mute() {
    this.gain.setValueAtTime(0, this.audioCtx.currentTime);
  }

  unmute() {
    this.gain.setValueAtTime(1, this.audioCtx.currentTime);
  }

  play() {
    if (this.audioCtx && !this.oscillator) {
      this.oscillator = this.audioCtx.createOscillator();

      // set the frequency
      this.oscillator.frequency.setValueAtTime(
        frequency || 440,
        this.audioCtx.currentTime
      );

      this.oscillator.type = "square";

      // connect the gain and start the sound
      this.oscillator.connect(this.gain);
      this.oscillator.start();
    }
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
  }
}

export default Speaker;
