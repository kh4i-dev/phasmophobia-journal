    /* ==============================================================
       ★ MA ÁM KHI TREO WEB (IDLE HAUNT) ★
       Thỉnh thoảng (khi để web không tương tác một lúc) -> hiệu ứng
       sách rách + tiếng khóc than, rồi tự biến mất.
       ============================================================== */
    (function () {
      let lastActive = Date.now();

      function markActive() { lastActive = Date.now(); }
      ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel", "click"]
        .forEach(ev => window.addEventListener(ev, markActive, { passive: true }));

      function triggerHaunt() {
        const layer = document.getElementById("hauntLayer");
        if (!layer) return;
        try { AudioEngine.cry(); } catch (e) {}
        layer.classList.remove("show");
        void layer.offsetWidth;
        layer.classList.add("show");
        document.body.classList.add("haunt-shake");
        setTimeout(() => layer.classList.remove("show"), 2600);
        setTimeout(() => document.body.classList.remove("haunt-shake"), 520);
      }

      function schedule() {
        const wait = 45000 + Math.random() * 90000; // 45s – 135s, ngẫu nhiên
        setTimeout(() => {
          // chỉ hiện khi tab đang xem VÀ đã "treo" ít nhất ~35s
          if (document.visibilityState === "visible" && Date.now() - lastActive > 35000) {
            triggerHaunt();
          }
          schedule();
        }, wait);
      }

      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) schedule();

      // cho phép gọi thủ công để test
      window.triggerHaunt = triggerHaunt;
    })();
