    /* ==============================================================
       ★ DOSSIER MODAL LOGIC (PHÓNG TO HỒ SƠ MẬT) ★
       ============================================================== */
    function openDossierModal() {
      const g = ghostsData.find(x => x.id === selectedGhostId);
      if (!g) return;

      const currentIndex = ghostsData.findIndex(x => x.id === selectedGhostId);
      const counterEl = document.getElementById("modalGhostCounter");
      if (counterEl) {
        counterEl.textContent = `${currentIndex + 1} / ${ghostsData.length}`;
      }

      document.getElementById("modalGhostNameVi").textContent = g.name_vi;
      document.getElementById("modalGhostNameEn").textContent = `${g.name_en} • Bí danh: ${g.alias ? g.alias.join(', ') : 'Không có'}`;
      document.getElementById("modalDangerTag").textContent = g.danger_level || 'NGUY HIỂM';

      let huntText = typeof g.hunt_sanity === "number" ? `${g.hunt_sanity}% Sanity` : g.hunt_sanity;
      document.getElementById("modalHuntSanity").textContent = huntText;

      let speedText = `${g.speed.base} m/s`;
      if (g.speed.max_los !== g.speed.base) speedText += ` → ${g.speed.max_los} m/s`;
      document.getElementById("modalSpeed").textContent = speedText;

      let evsText = g.evidences.join(", ");
      if (g.fake_evidence) evsText += ` + ${g.fake_evidence} (Luôn có)`;
      document.getElementById("modalEvidences").textContent = evsText;

      selectedBpmMode = "base";
      updateFootstepControlsForGhost(g);

      document.getElementById("modalDeepStrength").textContent = g.traits.strength;
      document.getElementById("modalDeepWeakness").textContent = g.traits.weakness;
      document.getElementById("modalDeepWarning").textContent = g.deep_mechanics || g.notes;

      const instantClue = INSTANT_CLUES[g.id] || g.traits.weakness;
      document.getElementById("modalInstantClueText").textContent = instantClue;

      renderTestingChecklist(g.hidden_test);

      document.getElementById("modalLoopingGuide").textContent = g.looping_guide || "Looping tiêu chuẩn quanh chướng ngại vật kín góc (bàn ăn, đảo bếp). Chú ý cắt tầm nhìn (break LOS) để ma giảm tốc độ.";

      stopFootstepAudio();
      resetTapTempo();

      // Đồng bộ màn hình timer nhang trong modal với Master Timer
      SmudgeMasterTimer.updateDisplays();
      SmudgeMasterTimer.setButtonState(SmudgeMasterTimer.interval !== null);

      AudioEngine.onFootstepPulse = () => {
        flashPulseLight();
      };

      const backdrop = document.getElementById("dossierModalBackdrop");
      const wasOpen = backdrop.style.display === "flex";
      backdrop.style.display = "flex";
      if (!wasOpen) AudioEngine.open();
    }

    function closeDossierModal() {
      stopFootstepAudio();
      document.getElementById("dossierModalBackdrop").style.display = "none";
      AudioEngine.close();
    }

    function flashPulseLight() {
      const pulseLight = document.getElementById("footstepPulseLight");
      if (pulseLight) {
        pulseLight.classList.add("beat");
        setTimeout(() => pulseLight.classList.remove("beat"), 75);
      }
    }

    function navigateModalGhost(direction) {
      if (!ghostsData || ghostsData.length === 0) return;
      const currentIndex = ghostsData.findIndex(g => g.id === selectedGhostId);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex + direction;
      if (nextIndex < 0) nextIndex = ghostsData.length - 1;
      if (nextIndex >= ghostsData.length) nextIndex = 0;

      selectGhost(ghostsData[nextIndex].id);
      AudioEngine.pageFlip(direction < 0 ? "prev" : "next");
      openDossierModal();
    }

    function updateFootstepControlsForGhost(g) {
      const baseBpm = g.speed.bpm_base || 120;
      const maxBpm = g.speed.bpm_max || 160;

      const descEl = document.getElementById("footstepDesc");
      const btnBase = document.getElementById("btnSpeedBase");
      const btnMax = document.getElementById("btnSpeedMax");

      btnBase.classList.toggle("active", selectedBpmMode === "base");
      btnMax.classList.toggle("active", selectedBpmMode === "max");

      if (g.id === "deogen") {
        descEl.textContent = `Tần số ở xa: 210 BPM (3.0 m/s) • Tần số sát người (<2.5m): 30 BPM (0.4 m/s - Đi bộ dưỡng sinh)`;
        btnBase.textContent = `Ở xa: 3.0 m/s (210 BPM)`;
        btnMax.textContent = `Ở gần: 0.4 m/s (30 BPM)`;
      } else if (g.id === "revenant") {
        descEl.textContent = `Tần số tuần tra: 70 BPM (1.0 m/s - Rùa bò) • Tần số thấy người: 210 BPM (3.0 m/s - Tên lửa)`;
        btnBase.textContent = `Không thấy người: 1.0 m/s (70 BPM)`;
        btnMax.textContent = `Thấy người: 3.0 m/s (210 BPM)`;
      } else if (g.id === "thaye") {
        descEl.textContent = `Mới vào (Trẻ): 2.75 m/s (195 BPM) • Cuối trận (Già): 1.0 m/s (70 BPM)`;
        btnBase.textContent = `Mới vào (Trẻ): 2.75 m/s (195 BPM)`;
        btnMax.textContent = `Về sau (Già): 1.0 m/s (70 BPM)`;
      } else if (g.id === "hantu") {
        descEl.textContent = `Phòng ấm: 1.4 m/s (90 BPM) • Phòng lạnh: 2.7 m/s (190 BPM)`;
        btnBase.textContent = `Phòng ấm: 1.4 m/s (90 BPM)`;
        btnMax.textContent = `Phòng lạnh: 2.7 m/s (190 BPM)`;
      } else if (g.id === "moroi") {
        descEl.textContent = `50% Sanity: 1.5 m/s (105 BPM) • 0% Sanity + LOS: 3.71 m/s (250 BPM - Nhanh nhất game)`;
        btnBase.textContent = `Sanity 50%: 1.5 m/s (105 BPM)`;
        btnMax.textContent = `Sanity 0%: 3.71 m/s (250 BPM)`;
      } else {
        descEl.textContent = `Tần số tuần tra: ${baseBpm} BPM (${g.speed.base} m/s) • Tần số truy đuổi: ${maxBpm} BPM (${g.speed.max_los} m/s)`;
        btnBase.textContent = `Tuần tra: ${g.speed.base} m/s (${baseBpm} BPM)`;
        btnMax.textContent = `Thấy người: ${g.speed.max_los} m/s (${maxBpm} BPM)`;
      }
    }

    function renderTestingChecklist(rawProtocolText) {
      const container = document.getElementById("modalTestingChecklist");
      container.innerHTML = "";

      if (!rawProtocolText) {
        container.innerHTML = "<div>Không có quy trình kiểm tra cụ thể.</div>";
        return;
      }

      const lines = rawProtocolText.split("\n").filter(l => l.trim().length > 0);

      lines.forEach((line) => {
        const item = document.createElement("div");
        item.className = "check-step-item";
        item.innerHTML = `
          <div class="check-step-box"></div>
          <div class="check-step-text">${line}</div>
        `;

        item.addEventListener("click", () => {
          AudioEngine.pencil();
          item.classList.toggle("checked");
          const box = item.querySelector(".check-step-box");
          box.textContent = item.classList.contains("checked") ? "✔" : "";
        });

        container.appendChild(item);
      });
    }

    function resetTapTempo() {
      tapTimestamps = [];
      clearTimeout(tapResetTimer);
      const bpmVal = document.getElementById("tapBpmValue");
      const verdict = document.getElementById("tapVerdictText");
      if (bpmVal) bpmVal.textContent = "--";
      if (verdict) verdict.textContent = "Gõ ít nhất 3 nhịp theo tiếng bước chân ma...";
    }

    function handleTapTempo() {
      const now = performance.now();
      AudioEngine.pencil();

      if (tapTimestamps.length > 0 && (now - tapTimestamps[tapTimestamps.length - 1] > 3000)) {
        tapTimestamps = [];
      }

      tapTimestamps.push(now);
      if (tapTimestamps.length > 5) tapTimestamps.shift();

      if (tapTimestamps.length >= 2) {
        let diffs = [];
        for (let i = 1; i < tapTimestamps.length; i++) {
          diffs.push(tapTimestamps[i] - tapTimestamps[i - 1]);
        }
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const bpm = Math.round(60000 / avgDiff);

        document.getElementById("tapBpmValue").textContent = bpm;

        const g = ghostsData.find(x => x.id === selectedGhostId);
        if (g) {
          const baseBpm = g.speed.bpm_base || 120;
          const maxBpm = g.speed.bpm_max || 160;
          const verdictEl = document.getElementById("tapVerdictText");

          if (Math.abs(bpm - baseBpm) <= 12) {
            verdictEl.innerHTML = `<span style="color:#10b981; font-weight:bold;">✔ Khớp Chuẩn (~${bpm} BPM):</span> Tốc độ tuần tra của ${g.name_vi}!`;
          } else if (Math.abs(bpm - maxBpm) <= 15) {
            verdictEl.innerHTML = `<span style="color:#f59e0b; font-weight:bold;">⚡ Khớp LOS (~${bpm} BPM):</span> Tốc độ săn khi nhìn thấy người chơi!`;
          } else if (bpm > 200) {
            verdictEl.innerHTML = `<span style="color:#ef4444; font-weight:bold;">⚠️ CỰC KỲ NHANH (~${bpm} BPM):</span> Thaye trẻ, Revenant LOS, hoặc Deogen ở xa!`;
          } else if (bpm < 85) {
            verdictEl.innerHTML = `<span style="color:#38bdf8; font-weight:bold;">🐢 RẤT CHẬM (~${bpm} BPM):</span> Revenant không thấy người hoặc Deogen ở sát người!`;
          } else {
            verdictEl.innerHTML = `Đo được ~${bpm} BPM (Loài ma này: ${baseBpm} BPM tuần tra • ${maxBpm} BPM khi thấy người).`;
          }
        }
      } else {
        document.getElementById("tapBpmValue").textContent = "...";
        document.getElementById("tapVerdictText").textContent = "Gõ tiếp theo tiếng bước chân (cần ít nhất 3 nhịp)...";
      }

      clearTimeout(tapResetTimer);
      tapResetTimer = setTimeout(() => {
        tapTimestamps = [];
      }, 4000);
    }

    function playCurrentFootstepMode() {
      const g = ghostsData.find(x => x.id === selectedGhostId);
      if (!g) return;

      const bpm = selectedBpmMode === "base" ? (g.speed.bpm_base || 120) : (g.speed.bpm_max || 160);
      AudioEngine.startFootstepLoop(bpm);
      isFootstepPlaying = true;
      const btn = document.getElementById("btnPlayFootstep");
      if (btn) {
        btn.textContent = "DỪNG TIẾNG BƯỚC CHÂN";
        btn.classList.add("playing");
      }
    }

    function stopFootstepAudio() {
      AudioEngine.stopFootstepLoop();
      isFootstepPlaying = false;
      const btn = document.getElementById("btnPlayFootstep");
      if (btn) {
        btn.textContent = "BẬT TIẾNG BƯỚC CHÂN";
        btn.classList.remove("playing");
      }
    }

    function initModalEvents() {
      document.getElementById("modalCloseBtn").addEventListener("click", closeDossierModal);
      document.getElementById("btnZoomFromInfo").addEventListener("click", openDossierModal);

      document.getElementById("modalPrevGhostBtn").addEventListener("click", () => navigateModalGhost(-1));
      document.getElementById("modalNextGhostBtn").addEventListener("click", () => navigateModalGhost(1));

      document.getElementById("btnSpeedBase").addEventListener("click", () => {
        selectedBpmMode = "base";
        const g = ghostsData.find(x => x.id === selectedGhostId);
        if (g) updateFootstepControlsForGhost(g);
        if (isFootstepPlaying) playCurrentFootstepMode();
      });

      document.getElementById("btnSpeedMax").addEventListener("click", () => {
        selectedBpmMode = "max";
        const g = ghostsData.find(x => x.id === selectedGhostId);
        if (g) updateFootstepControlsForGhost(g);
        if (isFootstepPlaying) playCurrentFootstepMode();
      });

      document.getElementById("btnTapTempo").addEventListener("click", handleTapTempo);

      document.getElementById("dossierModalBackdrop").addEventListener("click", (e) => {
        if (e.target.id === "dossierModalBackdrop") closeDossierModal();
      });

      document.querySelectorAll(".d-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".d-tab-btn").forEach(b => b.classList.remove("active"));
          document.querySelectorAll(".dossier-tab-pane").forEach(p => p.classList.remove("active"));
          btn.classList.add("active");
          document.getElementById(btn.dataset.dtab).classList.add("active");
        });
      });

      document.getElementById("btnPlayFootstep").addEventListener("click", () => {
        if (isFootstepPlaying) {
          stopFootstepAudio();
        } else {
          playCurrentFootstepMode();
        }
      });
    }

    function initShortcuts() {
      document.addEventListener("keydown", (e) => {
        const isModalOpen = document.getElementById("dossierModalBackdrop").style.display === "flex";

        if (e.key === "/" && document.activeElement.tagName !== "INPUT" && !isModalOpen) {
          e.preventDefault();
          document.getElementById("journalSearch").focus();
        }
        if ((e.key === "h" || e.key === "H") && document.activeElement.tagName !== "INPUT" && !isModalOpen) {
          e.preventDefault();
          if (window.toggleFieldCompendium) window.toggleFieldCompendium();
        }
        if (e.key === "Escape") {
          closeDossierModal();
          document.getElementById("searchResultsDropdown").style.display = "none";
          if (window.toggleFieldCompendium) window.toggleFieldCompendium(false);
        }

        if (isModalOpen && document.activeElement.tagName !== "INPUT") {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            navigateModalGhost(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            navigateModalGhost(1);
          } else if (e.key === "t" || e.key === "T") {
            e.preventDefault();
            handleTapTempo();
          } else if (e.code === "Space") {
            e.preventDefault();
            if (isFootstepPlaying) stopFootstepAudio();
            else playCurrentFootstepMode();
          }
        }
      });
    }

