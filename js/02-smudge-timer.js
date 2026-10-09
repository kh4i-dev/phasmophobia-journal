    /* ==============================================================
       ★ UNIFIED MASTER SMUDGE TIMER ENGINE ★
       Đồng bộ 100% giữa Dashboard thanh trên cùng và Dossier Modal
       ============================================================== */
    const SmudgeMasterTimer = {
      interval: null,
      seconds: 0,

      toggle() {
        if (this.interval) {
          this.stop();
        } else {
          this.start();
        }
      },

      start() {
        AudioEngine.ensureContext();
        this.seconds = 0;
        this.updateDisplays();
        this.setButtonState(true);

        this.interval = setInterval(() => {
          this.seconds++;
          this.updateDisplays();

          // Audible & Tactical milestone alerts
          if (this.seconds === 60) {
            AudioEngine.chime(440); // 60s Demon alert
          } else if (this.seconds === 90) {
            AudioEngine.chime(523.25); // 90s Normal Ghost alert
          } else if (this.seconds === 180) {
            AudioEngine.chime(659.25); // 180s Spirit alert
          }
        }, 1000);
      },

      stop() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.setButtonState(false);
      },

      setButtonState(isRunning) {
        const topBtn = document.getElementById("btnSmudgeTimer");
        const modalBtn = document.getElementById("btnModalSmudge");

        [topBtn, modalBtn].forEach(btn => {
          if (!btn) return;
          if (isRunning) {
            btn.classList.add("running");
            btn.innerHTML = `<span>Dừng Timer</span>`;
          } else {
            btn.classList.remove("running");
            btn.innerHTML = `<span>Bấm Giờ Nhang</span>`;
          }
        });
      },

      updateDisplays() {
        const m = String(Math.floor(this.seconds / 60)).padStart(2, '0');
        const s = String(this.seconds % 60).padStart(2, '0');
        const timeStr = `${m}:${s}`;

        const topDisp = document.getElementById("smudgeDisplay");
        const modalDisp = document.getElementById("modalSmudgeTimerDisplay");
        if (topDisp) topDisp.textContent = timeStr;
        if (modalDisp) modalDisp.textContent = timeStr;

        let phaseHtml = "";
        let modalStatusHtml = "";

        if (this.seconds < 60) {
          phaseHtml = "0-60s: <strong style='color:#10b981;'>An Toàn</strong> (Không ma nào hunt được)";
          modalStatusHtml = "0-60s: <strong style='color:#10b981;'>An toàn</strong> (Không thể hunt)";
        } else if (this.seconds >= 60 && this.seconds < 90) {
          phaseHtml = "60-90s: <strong style='color:#ef4444;'>DEMON ZONE!</strong> (Hunt ở đây = Demon)";
          modalStatusHtml = "60-90s: <strong style='color:#ef4444;'>DEMON ZONE!</strong> (Hunt ở đây = 100% Demon)";
        } else if (this.seconds >= 90 && this.seconds < 180) {
          phaseHtml = "90-180s: <strong style='color:#f59e0b;'>Ma Thường</strong> (Đa số loài ma hunt ở đây)";
          modalStatusHtml = "90-180s: <strong style='color:#f59e0b;'>Ma Thường</strong> (Đa số ma)";
        } else {
          phaseHtml = "180s+: <strong style='color:#38bdf8;'>SPIRIT ZONE!</strong> (Chặn hunt >3p = Spirit)";
          modalStatusHtml = "180s+: <strong style='color:#38bdf8;'>SPIRIT ZONE!</strong> (Chặn hunt >3p = 100% Spirit)";
        }

        const topPhase = document.getElementById("smudgePhase");
        const modalStatus = document.getElementById("modalSmudgeStatus");
        if (topPhase) topPhase.innerHTML = phaseHtml;
        if (modalStatus) modalStatus.innerHTML = modalStatusHtml;
      }
    };

