    /* ==============================================================
       ★ ITEMS, CURSED, VOICE TABS ★
       ============================================================== */
    function renderItemsTab() {
      if (!toolsAndCursedData) return;
      const leftC = document.getElementById("leftItemsContent");
      const rightC = document.getElementById("rightItemsContent");
      leftC.innerHTML = ""; rightC.innerHTML = "";

      toolsAndCursedData.tools_and_equipment.forEach(tool => {
        const target = tool.type.includes("Bằng chứng") ? leftC : rightC;
        const box = document.createElement("div");
        box.style.marginBottom = "10px";
        box.style.background = "rgba(255,255,255,0.45)";
        box.style.padding = "8px 10px";
        box.style.borderRadius = "5px";

        let tierText = tool.tiers.map(t => `<strong>${t.tier}:</strong> ${t.item} - <em>${t.desc}</em>`).join("<br>");

        box.innerHTML = `
          <div style="font-family: var(--font-hand); font-size: 1.45rem; color: #1e3a8a; font-weight: bold; line-height: 1.1;">
            ${tool.name_vi} (${tool.name_en})
          </div>
          <div style="font-size: 0.88rem; line-height: 1.35; margin-top: 4px;">${tierText}</div>
        `;
        target.appendChild(box);
      });
    }

    function renderCursedTab() {
      if (!toolsAndCursedData) return;
      const leftC = document.getElementById("leftTarotContent");
      const rightC = document.getElementById("rightCursedContent");
      leftC.innerHTML = ""; rightC.innerHTML = "";

      const tarot = toolsAndCursedData.cursed_possessions.find(c => c.id === "tarot_cards");
      const ouija = toolsAndCursedData.cursed_possessions.find(c => c.id === "ouija_board");
      const monkey = toolsAndCursedData.cursed_possessions.find(c => c.id === "monkey_paw");

      if (tarot) {
        const grid = document.createElement("div");
        grid.className = "tarot-grid";
        tarot.cards.forEach((c, i) => {
          const card = document.createElement("div");
          card.className = "tarot-card";
          card.style.setProperty("--d", (i * 0.05).toFixed(2) + "s");
          card.innerHTML = `
            <div class="tarot-card-inner">
              <div class="tarot-face tarot-front">
                <img src="${c.image}" alt="${c.name_en}" loading="lazy">
                <span class="tarot-chance">${c.chance}</span>
                <span class="tarot-front-name">${c.name_vi}</span>
              </div>
              <div class="tarot-face tarot-back">
                <div class="tarot-name">${c.name_en}</div>
                <div class="tarot-flame">Lửa: ${c.flame_color}</div>
                <div class="tarot-effect">${c.effect}</div>
              </div>
            </div>
          `;
          card.addEventListener("click", () => card.classList.toggle("flipped"));
          grid.appendChild(card);
        });
        leftC.appendChild(grid);
      }

      if (ouija) {
        const ouijaHeader = document.createElement("div");
        ouijaHeader.innerHTML = `<h3 style="font-family: var(--font-hand); font-size: 1.6rem; color: #8f2020;">Bàn Cầu Cơ (Nói 'Goodbye' trước khi đi!)</h3>`;
        rightC.appendChild(ouijaHeader);

        ouija.questions.slice(0, 5).forEach(q => {
          const row = document.createElement("div");
          row.style.marginBottom = "6px";
          row.style.fontSize = "0.88rem";
          row.innerHTML = `
            <strong>"${q.questions_en[0]}"</strong> (${q.sanity_cost})<br>
            <em>${q.meaning_vi}</em>
          `;
          rightC.appendChild(row);
        });
      }

      if (monkey) {
        const monkeyHeader = document.createElement("div");
        monkeyHeader.style.marginTop = "10px";
        monkeyHeader.innerHTML = `<h3 style="font-family: var(--font-hand); font-size: 1.6rem; color: #8f2020;">Bàn Tay Khỉ (Monkey Paw)</h3>`;
        rightC.appendChild(monkeyHeader);

        if (monkey.usage) {
          const usageEl = document.createElement("div");
          usageEl.style.marginBottom = "8px";
          usageEl.style.fontSize = "0.82rem";
          usageEl.style.lineHeight = "1.35";
          usageEl.style.fontStyle = "italic";
          usageEl.style.color = "#5a4b37";
          usageEl.style.background = "rgba(143, 32, 32, 0.06)";
          usageEl.style.padding = "6px 8px";
          usageEl.style.borderRadius = "5px";
          usageEl.textContent = monkey.usage;
          rightC.appendChild(usageEl);
        }

        monkey.wishes.forEach(w => {
          const row = document.createElement("div");
          row.style.marginBottom = "8px";
          row.style.background = "rgba(255,255,255,0.5)";
          row.style.borderRadius = "6px";
          row.style.padding = "6px 9px";
          row.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
          row.innerHTML = `
            <div style="font-weight: 700; font-size: 0.85rem; color: #1e3a8a;">"${w.wish_en}"</div>
            <div style="font-style: italic; font-size: 0.76rem; color: #5a4b37; margin: 2px 0 4px;">${w.meaning_vi}</div>
            <div style="font-size: 0.82rem; line-height: 1.35;">
              <span style="display:inline-block; background:#dcfce7; color:#166534; font-weight:700; font-size:0.68rem; padding:1px 7px; border-radius:999px; margin-right:4px;">ƯỚC</span>
              ${w.benefit}
            </div>
            <div style="font-size: 0.82rem; line-height: 1.35; margin-top: 3px;">
              <span style="display:inline-block; background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.68rem; padding:1px 7px; border-radius:999px; margin-right:4px;">PHẢN PHỆ</span>
              <span style="color: #991b1b; font-weight: 600;">${w.penalty}</span>
            </div>
          `;
          rightC.appendChild(row);
        });
      }
    }

    function renderReferenceTab() {
      if (!referenceData) return;
      const leftC = document.getElementById("leftDifficultyContent");
      const rightC = document.getElementById("rightMapsContent");
      if (leftC) leftC.innerHTML = "";
      if (rightC) rightC.innerHTML = "";

      const diffColors = {
        amateur: "#15803d",
        intermediate: "#0e7490",
        professional: "#b45309",
        nightmare: "#9a3412",
        insanity: "#8f2020"
      };

      if (leftC && referenceData.difficulties) {
        referenceData.difficulties.forEach(d => {
          const col = diffColors[d.id] || "#8f2020";
          const box = document.createElement("div");
          box.style.marginBottom = "10px";
          box.style.background = "rgba(255,255,255,0.55)";
          box.style.borderRadius = "6px";
          box.style.overflow = "hidden";
          box.style.boxShadow = "0 1px 2px rgba(0,0,0,0.08)";
          box.innerHTML = `
            <div style="background: ${col}; color: #fff; padding: 4px 9px; display: flex; justify-content: space-between; align-items: baseline; gap: 6px;">
              <span style="font-family: var(--font-hand); font-size: 1.3rem; font-weight: bold; line-height: 1.1;">
                ${d.name_en} <span style="font-size: 0.9rem; opacity: 0.9;">(${d.name_vi})</span>
              </span>
              <span style="font-size: 0.76rem; white-space: nowrap;">${d.reward} • ${d.unlock_level}</span>
            </div>
            <div style="padding: 6px 9px; font-size: 0.82rem; line-height: 1.5;">
              <div><strong>Setup:</strong> ${d.setup_time} &nbsp;•&nbsp; <strong>Grace:</strong> ${d.grace_period} &nbsp;•&nbsp; <strong>Hunt:</strong> ${d.hunt_duration}</div>
              <div><strong>Sanity đầu:</strong> ${d.starting_sanity} &nbsp;•&nbsp; <strong>Thuốc hồi:</strong> ${d.sanity_pill} &nbsp;•&nbsp; <strong>Tụt Sanity:</strong> ${d.sanity_drain}</div>
              <div><strong>Bằng chứng:</strong> ${d.evidence_given} &nbsp;•&nbsp; <strong>Chỗ ẩn:</strong> ${d.hiding_places} &nbsp;•&nbsp; <strong>Cầu dao:</strong> ${d.fuse_box}</div>
              <div><strong>Cursed:</strong> ${d.cursed_count} &nbsp;•&nbsp; ${d.monitors}</div>
              <div style="font-style: italic; color: #5a4b37; margin-top: 3px;">${d.notes}</div>
            </div>
          `;
          leftC.appendChild(box);
        });

        if (referenceData.custom_note) {
          const note = document.createElement("div");
          note.style.fontSize = "0.8rem";
          note.style.fontStyle = "italic";
          note.style.color = "#5a4b37";
          note.style.marginTop = "6px";
          note.textContent = referenceData.custom_note;
          leftC.appendChild(note);
        }
      }

      if (rightC && referenceData.maps) {
        const sizeColor = { "Nhỏ": "#15803d", "Trung bình": "#b45309", "Lớn": "#8f2020" };
        let currentSize = null;
        let rowIdx = 0;
        referenceData.maps.forEach(m => {
          const col = sizeColor[m.size] || "#8f2020";
          if (m.size !== currentSize) {
            currentSize = m.size;
            rowIdx = 0;
            const head = document.createElement("div");
            head.style.margin = "10px 0 4px";
            head.innerHTML = `<span style="display:inline-block; background:${col}; color:#fff; font-size:0.72rem; font-weight:700; padding:2px 11px; border-radius:999px; letter-spacing:0.04em;">MAP ${m.size.toUpperCase()}</span>`;
            rightC.appendChild(head);
          }
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.alignItems = "baseline";
          row.style.gap = "8px";
          row.style.fontSize = "0.8rem";
          row.style.lineHeight = "1.35";
          row.style.padding = "3px 7px";
          row.style.borderRadius = "3px";
          if (rowIdx % 2 === 1) row.style.background = "rgba(255,255,255,0.4)";
          row.innerHTML = `
            <span style="font-weight: 600;">${m.name}</span>
            <span style="color: #5a4b37; text-align: right;">${m.rooms}p • ${m.floors}t • ${m.unlock} • ${m.hunt_length}</span>
          `;
          rightC.appendChild(row);
          rowIdx++;
        });

        if (referenceData.maps_note) {
          const note = document.createElement("div");
          note.style.fontSize = "0.8rem";
          note.style.fontStyle = "italic";
          note.style.color = "#5a4b37";
          note.style.marginTop = "8px";
          note.textContent = referenceData.maps_note;
          rightC.appendChild(note);
        }
      }
    }

    function renderVoiceTab() {
      if (!toolsAndCursedData) return;
      const leftC = document.getElementById("leftVoiceContent");
      const rightC = document.getElementById("rightVoiceContent");
      leftC.innerHTML = ""; rightC.innerHTML = "";

      const v = toolsAndCursedData.voice_commands_en;

      v.spirit_box_phrases.forEach(p => {
        const box = document.createElement("div");
        box.className = "voice-line-box";
        box.innerHTML = `
          <div>
            <div class="voice-line-en">"${p.phrase}"</div>
            <div class="voice-line-vi">${p.meaning}</div>
          </div>
          <div class="copy-pill">Copy</div>
        `;
        box.addEventListener("click", () => {
          navigator.clipboard.writeText(p.phrase);
          alert(`Đã copy câu hỏi: "${p.phrase}"`);
        });
        leftC.appendChild(box);
      });

      v.trigger_anger_phrases.forEach(p => {
        const box = document.createElement("div");
        box.className = "voice-line-box";
        box.innerHTML = `
          <div>
            <div class="voice-line-en">"${p.phrase}"</div>
            <div class="voice-line-vi">${p.meaning}</div>
          </div>
          <div class="copy-pill">Copy</div>
        `;
        box.addEventListener("click", () => {
          navigator.clipboard.writeText(p.phrase);
          alert(`Đã copy câu thoại: "${p.phrase}"`);
        });
        rightC.appendChild(box);
      });
    }

