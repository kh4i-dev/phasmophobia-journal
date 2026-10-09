    /* ==============================================================
       ★ UNIFIED MASTER SMUDGE TIMER ENGINE — COUNTDOWN ★
       Đốt nhang lúc KHÔNG hunt → đếm ngược "thời gian an toàn" còn lại
       (ngược thách thức: sau khi nhang hết, ma được phép săn lại)
       Đồng bộ 100% giữa Dashboard thanh trên cùng và Dossier Modal
       ============================================================== */
    const SmudgeMasterTimer = {
      interval: null,
      remaining: 180,

      toggle() {
        if (this.interval) {
          this.stop();
        } else {
          this.start();
        }
      },

      start() {
        AudioEngine.ensureContext();
        this.remaining = 180;
        this.updateDisplays();
        this.setButtonState(true);
        AudioEngine.chime(440);

        this.interval = setInterval(() => {
          this.remaining--;
          this.updateDisplays();

          // Chuông canh theo THỜI GIAN CÒN LẠI (elapsed = 180 - remaining)
          if (this.remaining === 150) {
            AudioEngine.chime(440); // còn 30s an toàn chung, sắp vào DEMON ZONE
          } else if (this.remaining === 120) {
            AudioEngine.chime(294); // vào DEMON ZONE (elapsed 60s)
          } else if (this.remaining === 90) {
            AudioEngine.chime(523.25); // vào khu ma thường (elapsed 90s)
          } else if (this.remaining === 30) {
            AudioEngine.chime(389); // dính gần SPIRIT ZONE — sắp hết nhang, chuẩn bị nạp
          } else if (this.remaining <= 0) {
            this.remaining = 0;
            this.stop();
            this.updateDisplays();
            AudioEngine.alarm();
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

      reset() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.remaining = 180;
        this.setButtonState(false);
        const topDisp = document.getElementById("smudgeDisplay");
        const modalDisp = document.getElementById("modalSmudgeTimerDisplay");
        if (topDisp) topDisp.textContent = "03:00";
        if (modalDisp) modalDisp.textContent = "03:00";
        const topPhase = document.getElementById("smudgePhase");
        const modalStatus = document.getElementById("modalSmudgeStatus");
        if (topPhase) topPhase.innerHTML = "Đốt nhang lúc KHÔNG hunt → đếm ngược thời gian an toàn còn lại";
        if (modalStatus) modalStatus.innerHTML = "0-60s An toàn | 60-90s Demon | 90-180s Ma Thường | 180s+ Spirit";
      },

      setButtonState(isRunning) {
        const topBtn = document.getElementById("btnSmudgeTimer");
        const modalBtn = document.getElementById("btnModalSmudge");

        [topBtn, modalBtn].forEach(btn => {
          if (!btn) return;
          if (isRunning) {
            btn.classList.add("running");
            btn.innerHTML = `<span>Hết Nhang / Dừng</span>`;
          } else {
            btn.classList.remove("running");
            btn.innerHTML = `<span>Đốt Nhang</span>`;
          }
        });
      },

      updateDisplays() {
        const m = String(Math.floor(this.remaining / 60)).padStart(2, '0');
        const s = String(this.remaining % 60).padStart(2, '0');
        const timeStr = `${m}:${s}`;

        const topDisp = document.getElementById("smudgeDisplay");
        const modalDisp = document.getElementById("modalSmudgeTimerDisplay");
        if (topDisp) topDisp.textContent = timeStr;
        if (modalDisp) modalDisp.textContent = timeStr;

        // Đấu ">" (đang đếm ngược: còn nhiều = mới đốt, còn ít = sắp hết nhang)
        let phaseHtml = "";
        let modalStatusHtml = "";

        if (this.remaining <= 0) {
          phaseHtml = "0s: <strong style='color:#ef4444;'>HẾT NHANG</strong> — ma tự do săn lại! Đốt tiếp nếu cần";
          modalStatusHtml = "0s: <strong style='color:#ef4444;'>HẾT NHANG</strong> — có thể hunt lại bất cứ lúc nào";
        } else if (this.remaining > 120) {
          phaseHtml = "0-60s: <strong style='color:#10b981;'>An Toàn</strong> — không con ma nào hunt được";
          modalStatusHtml = "0-60s: <strong style='color:#10b981;'>An toàn</strong> (Không thể hunt)";
        } else if (this.remaining > 90) {
          phaseHtml = "60-90s: <strong style='color:#ef4444;'>DEMON ZONE!</strong> — hunt ở đây = 100% Demon";
          modalStatusHtml = "60-90s: <strong style='color:#ef4444;'>DEMON ZONE!</strong> (Hunt ở đây = 100% Demon)";
        } else {
          phaseHtml = "90-180s: <strong style='color:#f59e0b;'>Ma Thường</strong> — xong rồi! Chặn đủ 3p liên tục = SPIRIT";
          modalStatusHtml = "90-180s: <strong style='color:#f59e0b;'>Ma Thường</strong> (Đa số ma) — đủ 180s = SPIRIT";
        }

        const topPhase = document.getElementById("smudgePhase");
        const modalStatus = document.getElementById("modalSmudgeStatus");
        if (topPhase) topPhase.innerHTML = phaseHtml;
        if (modalStatus) modalStatus.innerHTML = modalStatusHtml;
      }
    };
