    /* ==============================================================
       ★ TAB 06: AUDIO STUDIO RENDER & CONTROLS ★
       ============================================================== */
    const FOOTSTEP_PRESETS = [
      { id: "std_patrol", name: "Standard Patrol (Tuần Tra Chuẩn)", speed: "1.7 m/s", bpm: 120, desc: "Tốc độ tuần tra mặc định của hơn 20 loài ma" },
      { id: "rev_slow", name: "Revenant Wandering (Rùa Bò)", speed: "1.0 m/s", bpm: 70, desc: "Revenant khi chưa thấy người (bước chân cực thưa)" },
      { id: "rev_fast", name: "Revenant LOS Chase (Tên Lửa)", speed: "3.0 m/s", bpm: 210, desc: "Revenant khi phát hiện người chơi (lao như tên lửa)" },
      { id: "deo_close", name: "Deogen Close (<2.5m sát người)", speed: "0.4 m/s", bpm: 30, desc: "Deogen ở cự ly sát người (bước chân dưỡng sinh)" },
      { id: "deo_far", name: "Deogen Distance (>6m ở xa)", speed: "3.0 m/s", bpm: 210, desc: "Deogen lao xuyên bản đồ từ xa đến chỗ bạn" },
      { id: "thaye_young", name: "Thaye Early Hunt (Trẻ & Hung Hăng)", speed: "2.75 m/s", bpm: 195, desc: "Thaye đầu trận khi còn trẻ tuổi" },
      { id: "thaye_old", name: "Thaye Late Game (Về Già)", speed: "1.0 m/s", bpm: 70, desc: "Thaye sau khi đã già đi 10 lần" },
      { id: "hantu_cold", name: "Hantu Cold Room (<0°C)", speed: "2.7 m/s", bpm: 190, desc: "Hantu trong phòng lạnh đóng băng" },
      { id: "moroi_0", name: "Moroi 0% Sanity (LOS Nhanh Nhất Game)", speed: "3.71 m/s", bpm: 250, desc: "Moroi cạn kiệt Sanity và có đường nhìn thẳng" }
    ];

    let activePresetId = null;

    function renderFootstepPresets() {
      const container = document.getElementById("audioFootstepPresets");
      if (!container) return;
      container.innerHTML = "";

      FOOTSTEP_PRESETS.forEach(p => {
        const card = document.createElement("div");
        card.className = "footstep-preset-card";
        card.dataset.id = p.id;

        card.innerHTML = `
          <div class="preset-info-left">
            <div class="preset-title">${p.name}</div>
            <div class="preset-desc">${p.desc} • <strong>${p.speed} (${p.bpm} BPM)</strong></div>
          </div>
          <button class="preset-btn-play">▶ Nghe Thử</button>
        `;

        card.addEventListener("click", () => {
          if (activePresetId === p.id && isFootstepPlaying) {
            AudioEngine.stopFootstepLoop();
            isFootstepPlaying = false;
            activePresetId = null;
            card.classList.remove("playing");
            card.querySelector(".preset-btn-play").textContent = "▶ Nghe Thử";
          } else {
            document.querySelectorAll(".footstep-preset-card").forEach(c => {
              c.classList.remove("playing");
              c.querySelector(".preset-btn-play").textContent = "▶ Nghe Thử";
            });

            AudioEngine.startFootstepLoop(p.bpm);
            isFootstepPlaying = true;
            activePresetId = p.id;
            card.classList.add("playing");
            card.querySelector(".preset-btn-play").textContent = "⏹ Dừng";
          }
        });

        container.appendChild(card);
      });
    }

    function initAudioStudioControls() {
      const volSlider = document.getElementById("masterVolumeSlider");
      const volText = document.getElementById("volumeValueText");
      const muteBtn = document.getElementById("btnToggleMute");

      if (volSlider) {
        volSlider.addEventListener("input", (e) => {
          const val = parseInt(e.target.value, 10);
          volText.textContent = `${val}%`;
          AudioEngine.setVolume(val / 100);
        });
      }

      if (muteBtn) {
        muteBtn.addEventListener("click", () => {
          AudioEngine.setMute(!AudioEngine.isMuted);
          muteBtn.textContent = AudioEngine.isMuted ? "Unmute" : "Mute";
          muteBtn.style.color = AudioEngine.isMuted ? "#ef4444" : "#574b39";
        });
      }

      // FX Soundboard Buttons
      const btnPencil = document.getElementById("btnFxPencil");
      const btnPageFlip = document.getElementById("btnFxPageFlip");
      const btnHeartbeat = document.getElementById("btnFxHeartbeat");
      const btnSmudgeAlert = document.getElementById("btnFxSmudgeAlert");

      if (btnPencil) btnPencil.addEventListener("click", () => AudioEngine.pencil());
      if (btnPageFlip) btnPageFlip.addEventListener("click", () => AudioEngine.pageFlip());
      if (btnHeartbeat) btnHeartbeat.addEventListener("click", () => AudioEngine.heartbeat());
      if (btnSmudgeAlert) btnSmudgeAlert.addEventListener("click", () => {
        AudioEngine.chime(440);
        setTimeout(() => AudioEngine.chime(523.25), 250);
        setTimeout(() => AudioEngine.chime(659.25), 500);
      });
    }

