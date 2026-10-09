    /* ==============================================================
       ★ AUDIO ENGINE: PRO WEB AUDIO SYNTHESIS ★
       - Layered Sub-Thump (110Hz->36Hz) + Filtered Floor Noise (380Hz)
       - Auto Context Resume on User Interaction
       - Master Volume & Mute Control
       - Investigation Soundboard FX
       ============================================================== */
    const AudioEngine = {
      ctx: null,
      masterGain: null,
      footstepTimer: null,
      volume: 0.8,
      isMuted: false,
      onFootstepPulse: null,

      ensureContext() {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      },

      setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
      },

      setMute(mute) {
        this.isMuted = mute;
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
      },

      // Realistic Wooden Floor Ghost Footstep Synthesis
      playFootstepThump() {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;

          // Layer 1: Sub Bass Impact Thump (Drop from 110Hz to 36Hz)
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, t);
          osc.frequency.exponentialRampToValueAtTime(36, t + 0.08);

          oscGain.gain.setValueAtTime(0.42, t);
          oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          osc.connect(oscGain);
          oscGain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.09);

          // Layer 2: Muffled wooden floor friction texture (Low-passed noise burst)
          const noiseDuration = 0.055;
          const bufferSize = Math.floor(this.ctx.sampleRate * noiseDuration);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
          }

          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(380, t);
          filter.Q.value = 1.3;

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.24, t);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, t + noiseDuration);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.masterGain);
          noise.start(t);

          if (this.onFootstepPulse) this.onFootstepPulse();
        } catch(e) {
          console.warn("Footstep audio error:", e);
        }
      },

      startFootstepLoop(bpm) {
        this.stopFootstepLoop();
        this.ensureContext();
        const safeBpm = Math.max(25, Math.min(300, bpm || 120));
        const intervalMs = (60 / safeBpm) * 1000;
        this.playFootstepThump();
        this.footstepTimer = setInterval(() => {
          this.playFootstepThump();
        }, intervalMs);
      },

      stopFootstepLoop() {
        if (this.footstepTimer) {
          clearInterval(this.footstepTimer);
          this.footstepTimer = null;
        }
      },

      // Sound FX: Pencil Scratch on Paper
      pencil() {
        try {
          this.ensureContext();
          if (this.isMuted) return;
          const t = this.ctx.currentTime;
          const dur = 0.06;
          const bufferSize = Math.floor(this.ctx.sampleRate * dur);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2800, t);
          filter.Q.value = 2.0;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);
          noise.start(t);
        } catch(e){}
      },

      // Sound FX: Page Flip (dày, "yomost": flutter giấy + tiếng tách + đặt trang)
      pageFlip(dir = 'next') {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;
          const up = dir !== 'prev';

          // 1) Flutter giấy: noise bandpass quét tần, biên độ rung nhẹ
          const dur = 0.30;
          const bufferSize = Math.floor(this.ctx.sampleRate * dur);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            const p = i / bufferSize;
            const env = Math.sin(Math.PI * p);          // vào/ra mượt
            const flutter = 0.6 + 0.4 * Math.sin(p * 62); // rung lật trang
            data[i] = (Math.random() * 2 - 1) * env * flutter;
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.Q.value = 0.7;
          if (up) {
            bp.frequency.setValueAtTime(700, t);
            bp.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.6);
            bp.frequency.exponentialRampToValueAtTime(1200, t + dur);
          } else {
            bp.frequency.setValueAtTime(3200, t);
            bp.frequency.exponentialRampToValueAtTime(800, t + dur * 0.6);
            bp.frequency.exponentialRampToValueAtTime(500, t + dur);
          }
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.32, t + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          noise.connect(bp); bp.connect(g); g.connect(this.masterGain);
          noise.start(t);

          // 2) Tiếng tách sắc ở đầu
          const tick = this.ctx.createOscillator();
          const tg = this.ctx.createGain();
          tick.type = 'triangle';
          tick.frequency.setValueAtTime(up ? 950 : 720, t);
          tick.frequency.exponentialRampToValueAtTime(320, t + 0.05);
          tg.gain.setValueAtTime(0.12, t);
          tg.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          tick.connect(tg); tg.connect(this.masterGain);
          tick.start(t); tick.stop(t + 0.06);

          // 3) Tiếng đặt trang (thud trầm) gần cuối
          const tt = t + dur * 0.72;
          const thud = this.ctx.createOscillator();
          const hg = this.ctx.createGain();
          thud.type = 'sine';
          thud.frequency.setValueAtTime(175, tt);
          thud.frequency.exponentialRampToValueAtTime(68, tt + 0.12);
          hg.gain.setValueAtTime(0.0001, t);
          hg.gain.setValueAtTime(0.0001, tt);
          hg.gain.exponentialRampToValueAtTime(0.17, tt + 0.02);
          hg.gain.exponentialRampToValueAtTime(0.001, tt + 0.14);
          thud.connect(hg); hg.connect(this.masterGain);
          thud.start(tt); thud.stop(tt + 0.16);
        } catch(e){}
      },

      // Sound FX: Heartbeat Pulse
      heartbeat() {
        try {
          this.ensureContext();
          if (this.isMuted) return;
          const t = this.ctx.currentTime;
          [0, 0.16].forEach(offset => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(75, t + offset);
            osc.frequency.exponentialRampToValueAtTime(32, t + offset + 0.1);
            gain.gain.setValueAtTime(0.35, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.11);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + offset);
            osc.stop(t + offset + 0.11);
          });
        } catch(e){}
      },

      // Sound FX: Soft Chime for Smudge Alerts
      chime(freq = 587.33) {
        try {
          this.ensureContext();
          if (this.isMuted) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.16, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.6);
        } catch(e){}
      },

      // Sound FX: Sudden Jumpscare screech
      scare() {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;

          // Harsh high-passed noise burst
          const dur = 0.9;
          const bufferSize = Math.floor(this.ctx.sampleRate * dur);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const hp = this.ctx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = 500;
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.55, t);
          nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          noise.connect(hp); hp.connect(nGain); nGain.connect(this.masterGain);
          noise.start(t);

          // Dissonant rising detuned oscillators (the "shriek")
          [180, 191, 97].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = i === 2 ? 'sawtooth' : 'square';
            osc.frequency.setValueAtTime(f, t);
            osc.frequency.exponentialRampToValueAtTime(f * 2.6, t + 0.55);
            g.gain.setValueAtTime(0.16, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
            osc.connect(g); g.connect(this.masterGain);
            osc.start(t); osc.stop(t + 0.86);
          });
        } catch(e){}
      },

      // Sound FX: mở trang / mở sổ (whoosh đi lên)
      open() {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;
          const dur = 0.35;
          const bufferSize = Math.floor(this.ctx.sampleRate * dur);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.setValueAtTime(480, t);
          bp.frequency.exponentialRampToValueAtTime(2200, t + dur);
          bp.Q.value = 0.8;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.22, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          noise.connect(bp); bp.connect(g); g.connect(this.masterGain);
          noise.start(t);
        } catch(e){}
      },

      // Sound FX: đóng trang / gấp sổ (thud đi xuống)
      close() {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;
          const dur = 0.3;
          const bufferSize = Math.floor(this.ctx.sampleRate * dur);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const lp = this.ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(1400, t);
          lp.frequency.exponentialRampToValueAtTime(300, t + dur);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.24, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          noise.connect(lp); lp.connect(g); g.connect(this.masterGain);
          noise.start(t);

          const osc = this.ctx.createOscillator();
          const og = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.18);
          og.gain.setValueAtTime(0.28, t);
          og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.connect(og); og.connect(this.masterGain);
          osc.start(t); osc.stop(t + 0.2);
        } catch(e){}
      },

      // Sound FX: tick nhẹ khi lia chuột qua tab/chip/nút
      hover() {
        try {
          if (!this.ctx || this.isMuted || this.volume <= 0) return; // chỉ kêu sau khi đã có tương tác (context đã mở)
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1750, t);
          osc.frequency.exponentialRampToValueAtTime(2400, t + 0.03);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.connect(g); g.connect(this.masterGain);
          osc.start(t); osc.stop(t + 0.055);
        } catch(e){}
      },

      // Sound FX: chuông báo HẾT NHANG (buzzer trầm 2 nhịp)
      alarm() {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;
          [0, 0.28].forEach(off => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(196, t + off);
            osc.frequency.exponentialRampToValueAtTime(130, t + off + 0.2);
            g.gain.setValueAtTime(0.0001, t + off);
            g.gain.exponentialRampToValueAtTime(0.22, t + off + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.22);
            osc.connect(g); g.connect(this.masterGain);
            osc.start(t + off); osc.stop(t + off + 0.24);
          });
        } catch(e){}
      },

      // Sound FX: tiếng khóc than / rên rỉ ma ám (khi treo web)
      cry() {
        try {
          this.ensureContext();
          if (this.isMuted || this.volume <= 0) return;
          const t = this.ctx.currentTime;

          // Giọng rên: sóng sin trượt xuống + rung (vibrato)
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(330, t);
          osc.frequency.exponentialRampToValueAtTime(175, t + 1.6);
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.frequency.value = 6.5;
          lfoGain.gain.value = 20;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.15, t + 0.45);
          g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
          osc.connect(g); g.connect(this.masterGain);
          osc.start(t); osc.stop(t + 1.9);
          lfo.start(t); lfo.stop(t + 1.9);

          // Hơi thở / thì thầm: noise bandpass nhẹ
          const dur = 1.8;
          const bs = Math.floor(this.ctx.sampleRate * dur);
          const buf = this.ctx.createBuffer(1, bs, this.ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < bs; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bs * 0.8));
          }
          const n = this.ctx.createBufferSource();
          n.buffer = buf;
          const bp = this.ctx.createBiquadFilter();
          bp.type = "bandpass";
          bp.frequency.value = 900;
          bp.Q.value = 0.6;
          const ng = this.ctx.createGain();
          ng.gain.setValueAtTime(0.05, t);
          ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
          n.connect(bp); bp.connect(ng); ng.connect(this.masterGain);
          n.start(t);
        } catch(e){}
      }
    };

    // Unlock Web Audio Context on first user click anywhere
    window.addEventListener('click', () => {
      AudioEngine.ensureContext();
    }, { once: true });

    // Hover tick cho các phần tử tương tác (throttled, tránh kêu dồn dập)
    (function () {
      const SEL = ".j-tab, .filter-chip, .compendium-toggle-chip, .journal-btn, .btn-zoom-dossier, .page-turn, .preset-btn-play, .fx-button, .comp-tab-btn, .tarot-card, .ghost-slot, .legend-badge-item, .modal-nav-btn, .modal-close-btn, .voice-line-box";
      let lastEl = null;
      let lastTime = 0;
      document.addEventListener("mouseover", (e) => {
        const el = e.target && e.target.closest ? e.target.closest(SEL) : null;
        if (!el) { lastEl = null; return; }
        if (el === lastEl) return;
        const now = performance.now();
        if (now - lastTime < 60) return;
        lastEl = el;
        lastTime = now;
        AudioEngine.hover();
      });
    })();

