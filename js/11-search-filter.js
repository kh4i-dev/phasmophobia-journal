    /* ==============================================================
       ★ SMART SEARCH & GROUP FILTER ENGINE ★
       ============================================================== */
    function initSmartSearch() {
      const searchInput = document.getElementById("journalSearch");
      const dropdown = document.getElementById("searchResultsDropdown");
      const clearBtn = document.getElementById("clearSearchBtn");

      searchInput.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
          dropdown.style.display = "none";
          clearBtn.style.display = "none";
          updateGhostGridStates();
          return;
        }

        clearBtn.style.display = "block";
        renderSearchResults(q);
      });

      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        dropdown.style.display = "none";
        clearBtn.style.display = "none";
        updateGhostGridStates();
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
          dropdown.style.display = "none";
        }
      });

      // CHIPS HUD — tín nhiều chip cùng lúc (đồng bộ panel Bằng Chứng)
      document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          AudioEngine.pencil();
          const f = chip.dataset.filter;
          if (f === "all") {
            activeFilters = [];
          } else {
            activeFilters = activeFilters.includes(f) ? activeFilters.filter(x => x !== f) : [...activeFilters, f];
          }
          syncGroupFilterUI();
          updateGhostGridStates();
        });
      });

      // TACTICAL COMPENDIUM TOGGLE & TABS LOGIC (GHÉP CHUNG MÂM VỚI TẤT CẢ)
      const compContainer = document.getElementById("compendiumContainer");
      const btnToggleComp = document.getElementById("btnToggleCompendium");
      const btnCloseComp = document.getElementById("btnCloseCompendium");
      const compArrow = document.getElementById("compendiumArrow");

      window.toggleFieldCompendium = function(forceState) {
        if (!compContainer) return;
        const isCurrentlyOpen = compContainer.style.display !== "none";
        const targetOpen = typeof forceState === "boolean" ? forceState : !isCurrentlyOpen;

        if (targetOpen) {
          compContainer.style.display = "block";
          compContainer.scrollTop = 0;
          document.body.style.overflow = "hidden";
          AudioEngine.open();
          if (btnToggleComp) btnToggleComp.classList.add("active");
          if (compArrow) compArrow.textContent = "▴";
        } else {
          compContainer.style.display = "none";
          document.body.style.overflow = "";
          AudioEngine.close();
          if (btnToggleComp) btnToggleComp.classList.remove("active");
          if (compArrow) compArrow.textContent = "▾";
        }
      };

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && compContainer && compContainer.style.display !== "none") {
          window.toggleFieldCompendium(false);
        }
      });

      if (btnToggleComp) {
        btnToggleComp.addEventListener("click", () => window.toggleFieldCompendium());
      }
      if (btnCloseComp) {
        btnCloseComp.addEventListener("click", () => window.toggleFieldCompendium(false));
      }

      // TAB 08: siết trạng thái highlight Manual theo cờ mở/đóng của compendium
      const jTabManual = document.getElementById("jTabCompendium");
      const prevToggle = window.toggleFieldCompendium;
      window.toggleFieldCompendium = function(forceState) {
        prevToggle(forceState);
        if (jTabManual) {
          const open = compContainer && compContainer.style.display !== "none";
          jTabManual.classList.toggle("active", !!open);
        }
      };

      // TAB 08 (JOURNAL BAR): click mở/đóng cẩm nang, không lật trang sổ
      if (jTabManual) {
        jTabManual.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          window.toggleFieldCompendium();
        });
      }

      // Compendium internal tabs
      document.querySelectorAll(".comp-tab-btn").forEach(tabBtn => {
        tabBtn.addEventListener("click", () => {
          document.querySelectorAll(".comp-tab-btn").forEach(b => b.classList.remove("active"));
          document.querySelectorAll(".comp-pane").forEach(p => p.classList.remove("active"));

          tabBtn.classList.add("active");
          const targetPane = document.getElementById(tabBtn.dataset.target);
          if (targetPane) targetPane.classList.add("active");
        });
      });
    }

    function renderSearchResults(q) {
      const dropdown = document.getElementById("searchResultsDropdown");
      dropdown.innerHTML = "";

      const matchedGhosts = ghostsData.filter(g => {
        return g.name_en.toLowerCase().includes(q)
          || g.name_vi.toLowerCase().includes(q)
          || (g.alias && g.alias.some(a => a.toLowerCase().includes(q)))
          || g.evidences.some(ev => ev.toLowerCase().includes(q))
          || g.traits.strength.toLowerCase().includes(q)
          || g.traits.weakness.toLowerCase().includes(q)
          || g.hidden_test.toLowerCase().includes(q)
          || (q === "2026" && ["aswang", "dayan", "deildegast", "gallu", "kormos", "obambo"].includes(g.id))
          || (q.includes("săn") && g.hunt_sanity >= 60)
          || (q.includes("nhanh") && (g.speed.max_los >= 2.5 || g.speed.base >= 2.0));
      });

      let matchedCursed = [];
      if (toolsAndCursedData) {
        matchedCursed = toolsAndCursedData.cursed_possessions.filter(c => {
          return c.name_en.toLowerCase().includes(q)
            || c.name_vi.toLowerCase().includes(q)
            || c.description.toLowerCase().includes(q);
        });
      }

      if (matchedGhosts.length === 0 && matchedCursed.length === 0) {
        dropdown.innerHTML = `<div style="padding: 10px; color: #94a3b8; text-align: center; font-size: 0.88rem;">Không tìm thấy kết quả phù hợp với "${q}"</div>`;
        dropdown.style.display = "block";
        return;
      }

      if (matchedGhosts.length > 0) {
        const cat = document.createElement("div");
        cat.className = "search-category-title";
        cat.textContent = `LOÀI MA PHÙ HỢP (${matchedGhosts.length}) • CLICK ĐỂ XEM HỒ SƠ`;
        dropdown.appendChild(cat);

        matchedGhosts.slice(0, 8).forEach(g => {
          const item = document.createElement("div");
          item.className = "search-result-item";
          item.innerHTML = `
            <div>
              <div class="result-name">${g.name_en} <small>(${g.name_vi})</small></div>
              <div class="result-snippet">${g.evidences.join(", ")} • Săn: ${g.hunt_sanity}% Sanity</div>
            </div>
            <div class="result-badge">${g.speed.base} m/s</div>
          `;

          item.addEventListener("click", () => {
            selectGhost(g.id);
            openDossierModal();
            dropdown.style.display = "none";
          });

          dropdown.appendChild(item);
        });
      }

      if (matchedCursed.length > 0) {
        const cat = document.createElement("div");
        cat.className = "search-category-title";
        cat.textContent = `VẬT PHẨM NGUYỀN RỦA (${matchedCursed.length})`;
        dropdown.appendChild(cat);

        matchedCursed.forEach(c => {
          const item = document.createElement("div");
          item.className = "search-result-item";
          item.innerHTML = `
            <div>
              <div class="result-name">${c.name_vi} <small>(${c.name_en})</small></div>
              <div class="result-snippet">${c.description.substring(0, 55)}...</div>
            </div>
            <div class="result-badge">Cursed</div>
          `;

          item.addEventListener("click", () => {
            switchTab("cursed-possessions");
            dropdown.style.display = "none";
          });

          dropdown.appendChild(item);
        });
      }

      dropdown.style.display = "block";
    }

