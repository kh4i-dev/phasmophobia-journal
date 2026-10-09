    /* ==============================================================
       ★ JUMPSCARE (thỉnh thoảng, ngẫu nhiên) ★
       ============================================================== */
    function triggerJumpscare() {
      const layer = document.getElementById("jumpscareLayer");
      if (!layer) return;
      AudioEngine.scare();
      layer.classList.remove("show");
      void layer.offsetWidth;
      layer.classList.add("show");
      document.body.classList.add("quake");
      setTimeout(() => layer.classList.remove("show"), 1000);
      setTimeout(() => document.body.classList.remove("quake"), 420);
    }

    function scheduleJumpscares() {
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const delay = 50000 + Math.random() * 130000; // 50s – 180s, ngẫu nhiên
      setTimeout(() => {
        if (document.visibilityState === "visible") triggerJumpscare();
        scheduleJumpscares();
      }, delay);
    }

    loadData();
