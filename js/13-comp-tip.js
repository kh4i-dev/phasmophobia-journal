    /* ==============================================================
       ★ COMPENDIUM TOOLTIP ★
       Rê chuột (desktop) hoặc chạm (mobile) vào dòng có data-detail
       -> hiện hộp chi tiết giải thích rõ.
       ============================================================== */
    (function () {
      let tip = null;

      function ensureTip() {
        if (!tip) {
          tip = document.createElement("div");
          tip.id = "compTip";
          document.body.appendChild(tip);
        }
        return tip;
      }

      function place(clientX, clientY) {
        const pad = 14;
        const rect = tip.getBoundingClientRect();
        let x = clientX + pad;
        let y = clientY + pad;
        if (x + rect.width > window.innerWidth - 8) x = window.innerWidth - rect.width - 8;
        if (y + rect.height > window.innerHeight - 8) y = clientY - rect.height - pad;
        if (x < 8) x = 8;
        if (y < 8) y = 8;
        tip.style.left = x + "px";
        tip.style.top = y + "px";
      }

      function show(li, clientX, clientY) {
        const t = ensureTip();
        const nameEl = li.querySelector("strong");
        const name = nameEl ? nameEl.textContent : "";
        t.innerHTML = (name ? '<span class="tip-name">' + name + "</span>" : "") + li.getAttribute("data-detail");
        t.style.display = "block";
        place(clientX, clientY);
      }

      function hide() {
        if (tip) tip.style.display = "none";
      }

      document.addEventListener("mouseover", (e) => {
        const li = e.target.closest && e.target.closest(".comp-card li[data-detail]");
        if (!li) return;
        show(li, e.clientX, e.clientY);
      });

      document.addEventListener("mousemove", (e) => {
        if (!tip || tip.style.display !== "block") return;
        const li = e.target.closest && e.target.closest(".comp-card li[data-detail]");
        if (!li) { hide(); return; }
        place(e.clientX, e.clientY);
      });

      document.addEventListener("mouseout", (e) => {
        const li = e.target.closest && e.target.closest(".comp-card li[data-detail]");
        if (li) hide();
      });

      // Mobile / chạm: bấm để hiện hoặc ẩn
      document.addEventListener("click", (e) => {
        const li = e.target.closest && e.target.closest(".comp-card li[data-detail]");
        if (!li) { hide(); return; }
        if (tip && tip.style.display === "block") hide();
        else show(li, e.clientX || 0, e.clientY || 0);
      });
    })();
