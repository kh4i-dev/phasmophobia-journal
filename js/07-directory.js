    /* ==============================================================
       ★ LEFT PAGE GHOST DIRECTORY (TAB 02) ★
       ============================================================== */
    function renderGhostInfoCatalog() {
      const container = document.getElementById("ghostInfoCatalog");
      container.innerHTML = "";

      ghostsData.forEach(g => {
        const card = document.createElement("div");
        card.className = "dir-card";
        if (g.id === selectedGhostId) card.classList.add("active");
        card.dataset.id = g.id;
        card.dataset.name = (g.name_vi + " " + g.name_en + " " + (g.alias ? g.alias.join(" ") : "")).toLowerCase();

        // Làm sạch phụ đề tiếng Việt (bỏ phần lặp lại tên tiếng Anh trong ngoặc nếu có)
        const cleanVi = g.name_vi.replace(/\s*\([A-Za-z\s]+\)$/, '').trim();

        card.innerHTML = `
          <div class="dir-card-header">
            <span class="dir-name-en">${g.name_en}</span>
            <span class="dir-hunt-tag">${typeof g.hunt_sanity === "number" ? g.hunt_sanity + "% Hunt" : "??? Hunt"}</span>
          </div>
          <div class="dir-name-vi">${cleanVi}</div>
          <div class="dir-speed-tag">Tốc độ: ${g.speed.base} m/s</div>
        `;

        card.addEventListener("click", () => {
          AudioEngine.pageFlip();
          selectGhost(g.id);
        });

        card.addEventListener("dblclick", () => {
          selectGhost(g.id);
          openDossierModal();
        });

        container.appendChild(card);
      });

      document.getElementById("directoryFilter").addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase().trim();
        document.querySelectorAll(".dir-card").forEach(card => {
          const match = card.dataset.name.includes(val);
          card.style.display = match ? "flex" : "none";
        });
      });
    }

