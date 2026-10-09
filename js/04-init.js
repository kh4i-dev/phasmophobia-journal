    /* ==============================================================
       ★ INITIAL DATA LOADING ★
       ============================================================== */
    async function loadData() {
      try {
        const [gRes, tRes, rRes] = await Promise.all([
          fetch("phasmophobia_ghosts_vi.json"),
          fetch("phasmophobia_tools_and_cursed_vi.json"),
          fetch("phasmophobia_reference_vi.json")
        ]);
        ghostsData = await gRes.json();
        toolsAndCursedData = await tRes.json();
        referenceData = await rRes.json();

        renderEvidenceList();
        renderGroupFilterList();
        renderGhostsGrid();
        renderGhostInfoCatalog();
        renderItemsTab();
        renderCursedTab();
        renderReferenceTab();
        renderVoiceTab();
        renderFootstepPresets();
        updateQuickActionBar();

        if (ghostsData.length > 0) {
          selectGhost(ghostsData[0].id);
        }

        initSmartSearch();
        initShortcuts();
        initModalEvents();
        initSmudgeTimerBindings();
        initAudioStudioControls();
      } catch (err) {
        console.error("Error loading JSON:", err);
      }
    }

    function initSmudgeTimerBindings() {
      const topBtn = document.getElementById("btnSmudgeTimer");
      const modalBtn = document.getElementById("btnModalSmudge");
      if (topBtn) topBtn.addEventListener("click", () => SmudgeMasterTimer.toggle());
      if (modalBtn) modalBtn.addEventListener("click", () => SmudgeMasterTimer.toggle());
    }

