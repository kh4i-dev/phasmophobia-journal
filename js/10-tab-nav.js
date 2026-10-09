    /* ==============================================================
       ★ MAIN TAB NAVIGATION (6 TABS) ★
       ============================================================== */
    const TABS_CONFIG = {
      "main-journal": { left: "leftViewEvidence", right: "rightViewGhosts", leftNum: 23, rightNum: 24 },
      "ghost-info": { left: "leftViewGhostInfo", right: "rightViewGhostInfo", leftNum: 25, rightNum: 26 },
      "items-tier": { left: "leftViewItems", right: "rightViewItems", leftNum: 27, rightNum: 28 },
      "cursed-possessions": { left: "leftViewCursed", right: "rightViewCursed", leftNum: 29, rightNum: 30 },
      "voice-commands": { left: "leftViewVoice", right: "rightViewVoice", leftNum: 31, rightNum: 32 },
      "audio-studio": { left: "leftViewAudio", right: "rightViewAudio", leftNum: 33, rightNum: 34 },
      "reference": { left: "leftViewReference", right: "rightViewReference", leftNum: 35, rightNum: 36 }
    };

    function switchTab(tabKey) {
      const prevTab = currentTab;
      const fromIdx = TAB_KEYS.indexOf(prevTab);
      const toIdx = TAB_KEYS.indexOf(tabKey);
      const dir = (fromIdx >= 0 && toIdx >= 0) ? (toIdx > fromIdx ? "next" : "prev") : "next";
      AudioEngine.pageFlip(dir);
      currentTab = tabKey;

      document.querySelectorAll(".j-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === tabKey);
      });

      const config = TABS_CONFIG[tabKey];
      if (!config) return;

      ["leftViewEvidence", "leftViewGhostInfo", "leftViewItems", "leftViewCursed", "leftViewVoice", "leftViewAudio", "leftViewReference"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });

      ["rightViewGhosts", "rightViewGhostInfo", "rightViewItems", "rightViewCursed", "rightViewVoice", "rightViewAudio", "rightViewReference"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });

      const activeLeft = document.getElementById(config.left);
      const activeRight = document.getElementById(config.right);
      if (activeLeft) activeLeft.style.display = "flex";
      if (activeRight) activeRight.style.display = "flex";

      // Lật trang sổ (page-turn) mượt khi chuyển qua lại
      const book = document.querySelector(".book");
      if (book) {
        book.classList.remove("turn-next", "turn-prev");
        void book.offsetWidth;
        book.classList.add(dir === "next" ? "turn-next" : "turn-prev");
        setTimeout(() => book.classList.remove("turn-next", "turn-prev"), 620);
      }

      const leftNum = document.getElementById("leftPageNum");
      const rightNum = document.getElementById("rightPageNum");
      if (leftNum) leftNum.textContent = config.leftNum;
      if (rightNum) rightNum.textContent = config.rightNum;
    }

    document.querySelectorAll(".j-tab").forEach(tab => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    const TAB_KEYS = ["main-journal", "ghost-info", "items-tier", "cursed-possessions", "voice-commands", "audio-studio", "reference"];
    document.getElementById("btnNextPage").addEventListener("click", () => {
      let idx = (TAB_KEYS.indexOf(currentTab) + 1) % TAB_KEYS.length;
      switchTab(TAB_KEYS[idx]);
    });
    document.getElementById("btnPrevPage").addEventListener("click", () => {
      let idx = (TAB_KEYS.indexOf(currentTab) - 1 + TAB_KEYS.length) % TAB_KEYS.length;
      switchTab(TAB_KEYS[idx]);
    });

