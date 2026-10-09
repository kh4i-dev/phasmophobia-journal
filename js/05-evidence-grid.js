    /* ==============================================================
       ★ GIAI ĐOẠN 1: LOGIC TRANG EVIDENCE & 3 TRẠNG THÁI LOẠI TRỪ ★
       1. NORMAL: Chưa tick loại, chưa ghim
       2. RULED-OUT: Bị loại (mờ + gạch nét đỏ thẫm 2px rõ nét)
       3. PINNED: Được ghim (khoanh tròn đỏ do người dùng bấm)
       Quy tắc: Chưa tick gì => Cả 30 ma sáng bình thường!
       ============================================================== */
    function renderEvidenceList() {
      const container = document.getElementById("evidenceList");
      container.innerHTML = "";

      EVIDENCES.forEach(ev => {
        const item = document.createElement("div");
        item.className = "evidence-item";
        if (evidenceState[ev.id] === true) item.classList.add("found");
        if (evidenceState[ev.id] === false) item.classList.add("rejected");

        const mark = evidenceState[ev.id] === true ? "✔" : (evidenceState[ev.id] === false ? "✖" : "");

        item.innerHTML = `
          <div class="hand-checkbox">${mark}</div>
          <div class="evidence-text-block">
            <div class="evidence-name">${ev.label}</div>
            <div class="evidence-desc">${ev.desc}</div>
          </div>
        `;

        item.addEventListener("click", () => {
          AudioEngine.pencil();
          if (evidenceState[ev.id] === null) evidenceState[ev.id] = true;
          else if (evidenceState[ev.id] === true) evidenceState[ev.id] = false;
          else evidenceState[ev.id] = null;

          renderEvidenceList();
          updateGhostGridStates();
        });

        container.appendChild(item);
      });
    }

    // RENDER NHÓM LỌC (THUỘC TÍNH NHÓM) — hiển thị trong panel Bằng Chứng
    function renderGroupFilterList() {
      const container = document.getElementById("groupFilterList");
      if (!container) return;
      container.innerHTML = "";

      GROUP_ATTRS.forEach(ga => {
        const active = activeFilters.includes(ga.id);
        const count = ghostsData.filter(ga.test).length;
        const item = document.createElement("div");
        item.className = "evidence-item group-filter-item";
        if (active) item.classList.add("active");

        item.innerHTML = `
          <div class="hand-checkbox">${active ? "✔" : ""}</div>
          <div class="evidence-text-block">
            <div class="evidence-name">${ga.label} <span style="font-size:0.95rem;color:#8a7a63;">(${count})</span></div>
            <div class="evidence-desc">${ga.desc}</div>
          </div>
        `;

        item.addEventListener("click", () => {
          AudioEngine.pencil();
          activeFilters = active ? activeFilters.filter(f => f !== ga.id) : [...activeFilters, ga.id];
          syncGroupFilterUI();
          updateGhostGridStates();
        });

        container.appendChild(item);
      });
    }

    // ĐỒNG BỘ UI NHÓM LỌC GIỮA HUD + PANEL BẰNG CHỨNG
    function syncGroupFilterUI() {
      document.querySelectorAll(".filter-chip").forEach(c => {
        const f = c.dataset.filter;
        c.classList.toggle("active", f === "all" ? activeFilters.length === 0 : activeFilters.includes(f));
      });
      renderGroupFilterList();
    }

    document.getElementById("btnResetEvidence").addEventListener("click", () => {
      AudioEngine.pencil();
      EVIDENCES.forEach(e => evidenceState[e.id] = null);
      renderEvidenceList();
      updateGhostGridStates();
    });

    const GHOST_ROSTER_VI_NAMES = {
      "spirit": "Linh Hồn",
      "wraith": "Oan Hồn / Ma Bay",
      "phantom": "Bóng Ma Biến Hình",
      "poltergeist": "Yêu Tinh Quậy Phá",
      "banshee": "Nữ Thần Báo Tử",
      "jinn": "Thần Đèn Jinn",
      "mare": "Ác Mộng Bóng Đêm",
      "revenant": "Báo Oán / Kẻ Hủy Diệt",
      "shade": "Bóng Đen Nhút Nhát",
      "demon": "Ác Quỷ Săn Sớm",
      "yurei": "U Hồn Cửa",
      "oni": "Quỷ Mặt Đỏ Hiếu Động",
      "yokai": "Yêu Quái Ghét Tiếng Ồn",
      "hantu": "Hồn Ma Xứ Lạnh",
      "goryo": "Oan Hồn Ẩn Dật",
      "myling": "Hài Nhi Yên Lặng",
      "onryo": "Oan Hồn Sợ Lửa",
      "the_twins": "Cặp Song Sinh",
      "raiju": "Lôi Thú Hút Điện",
      "obake": "Yêu Quái Biến Hình",
      "the_mimic": "Ma Bắt Chước (Orb Giả)",
      "moroi": "Ma Nguyền Rủa",
      "deogen": "Ma Thở Dốc (Săn Đuổi)",
      "thaye": "Lão Quỷ Trẻ Hóa",
      "aswang": "Quỷ Hút Máu (2026)",
      "dayan": "Phù Thủy Chân Ngược (2026)",
      "deildegast": "Hồn Ma Ranh Giới (2026)",
      "gallu": "Quỷ Địa Ngục (2026)",
      "kormos": "Ác Thú Hắc Ám (2026)",
      "obambo": "Oan Linh Phiêu Bạt (2026)"
    };

    // THUỘC TÍNH NHẬN DIỆN NHANH — HIỂN THỊ ĐỒNG BỘ TRÊN CẢ 30 THẺ MA
    const GHOST_ROSTER_ATTRS = {
      "spirit":      { tag: "Nhang 180s",   full: "Đốt nhang khóa đi săn 180 giây — gấp đôi ma thường" },
      "wraith":      { tag: "Khoá muối",    full: "Giẫm muối không để lại dấu chân; bay xuyên tường" },
      "phantom":     { tag: "Ảnh trống",    full: "Chụp ảnh lúc biến mất ra ảnh trống; tàng hình lâu khi hunt" },
      "poltergeist": { tag: "Vứt đồ",       full: "Ném/vứt đồ dồn dập tỉ lệ cao (Polty Bomb) khi hunt" },
      "banshee":     { tag: "1 mục tiêu",   full: "Chỉ nhắm duy nhất 1 người chơi; thét trên Paramic" },
      "jinn":        { tag: "Điện nhanh",   full: "Tăng tốc khi cầu dao bật; không tự ngắt cầu dao" },
      "mare":        { tag: "Phá đèn",      full: "Hay phá/tắt đèn tức thì; săn 60% khi tối" },
      "revenant":    { tag: "Lao nhanh",    full: "Không thấy: bò 1.0 m/s — thấy: lao 3.0 m/s" },
      "shade":       { tag: "Nhút nhát",    full: "Không săn/event khi có người cùng phòng; chỉ săn khi <35%" },
      "demon":       { tag: "Săn 100%",     full: "Săn sớm ở 100% Sanity; nhang chỉ chặn 60 giây" },
      "yurei":       { tag: "Đóng cửa",     full: "Đóng sầm cửa tụt 15% Sanity; bị nhang nhốt 90 giây" },
      "oni":         { tag: "Hung hãn",     full: "Rất hung hãn, hiện hình rõ khi hunt, không air-ball" },
      "yokai":       { tag: "Săn khi ồn",   full: "Nói/đài gần sẽ kích săn ở 80% Sanity" },
      "hantu":       { tag: "Phòng lạnh",   full: "Nhanh ở phòng lạnh, chậm ở phòng ấm, không tăng tốc LOS" },
      "goryo":       { tag: "D.O.T.S cam",  full: "D.O.T.S chỉ thấy qua video camera, phòng không người" },
      "myling":      { tag: "Chân gần",     full: "Tiếng bước chân chỉ nghe khi rất gần (<10m)" },
      "onryo":       { tag: "3 nến",        full: "Thổi tắt ngọn nến thứ 3 kích đi săn ngay" },
      "the_twins":   { tag: "2 tốc độ",     full: "Hai tốc độ săn luân phiên 90% / 110%" },
      "raiju":       { tag: "Gần điện",     full: "Tăng tốc gần thiết bị điện; nhiễu từ 15m" },
      "obake":       { tag: "6 ngón",       full: "Dấu tay UV 6 ngón hoặc tự biến mất; biến hình khi hunt" },
      "the_mimic":   { tag: "Orb giả",      full: "Luôn có Ghost Orb giả (thành 4 bằng chứng); bắt chước ma khác" },
      "moroi":       { tag: "Nhanh nhất",   full: "Sanity thấp chạy nhanh nhất game (tới 3.71 m/s); nhang mù 12s" },
      "deogen":      { tag: "Thấy bạn",     full: "Luôn biết vị trí bạn; xa lao nhanh, gần <2.5m bò 0.4 m/s" },
      "thaye":       { tag: "Trẻ→già",      full: "Mới vào săn 75% chạy nhanh; càng già càng yếu/chậm" },
      "aswang":      { tag: "Số người",     full: "Tốc độ săn tăng theo số người trong phòng; sợ muối" },
      "dayan":       { tag: "Chân ngược",   full: "Dấu chân UV quay ngược 180°; nhanh khi bạn quay lưng" },
      "deildegast":  { tag: "Qua cửa",      full: "Bước qua ngưỡng cửa phòng ma là kích đi săn" },
      "gallu":       { tag: "Săn 65%",      full: "Săn sớm 65%; cắn thánh giá từ xa; ảo ảnh phân thân" },
      "kormos":      { tag: "Tối nhanh",    full: "Càng trong bóng tối chạy càng nhanh; đèn rọi thì khựng" },
      "obambo":      { tag: "Chân giả",     full: "Tạo tiếng chân giả nhiều hướng trước khi lao tới" }
    };

    // RENDER 30 GHOSTS GRID (3 CỘT X 10 HÀNG ĐỒNG BỘ CÂN ĐỐI)
    function renderGhostsGrid() {
      const grid = document.getElementById("ghostsGrid");
      grid.innerHTML = "";

      ALL_SCREENSHOT_GHOSTS.forEach((name, i) => {
        const slot = document.createElement("div");
        slot.className = "ghost-slot ghost-slot-anim";
        slot.style.animationDelay = (i * 0.02).toFixed(2) + "s";
        slot.dataset.name = name;

        const ghostObj = ghostsData.find(g => g.name_en.toLowerCase() === name.toLowerCase());
        const gid = ghostObj ? ghostObj.id : name.toLowerCase().replace(/\s+/g, '_');
        slot.dataset.id = gid;

        const viName = GHOST_ROSTER_VI_NAMES[gid] || (ghostObj ? ghostObj.name_vi.replace(/\s*\([^)]*\)/g, '').trim() : name);
        const attr = GHOST_ROSTER_ATTRS[gid];

        slot.innerHTML = `
          <div class="slot-top">
            <div class="slot-name-en-wrap">
              <span class="slot-name-en">${name}</span>
              <svg class="pencil-name-circle" viewBox="0 0 80 30" preserveAspectRatio="none">
                <path d="M 6,15 C 4,5 20,2 40,2 C 62,2 76,6 77,15 C 78,25 60,29 38,29 C 14,29 2,24 3,13 C 4,6 16,2.5 32,2"
                      fill="none" stroke="#9e1c1c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />
              </svg>
            </div>
            ${attr ? `<span class="slot-attr" title="${attr.full.replace(/"/g, '&quot;')}">${attr.tag}</span>` : ''}
          </div>
          <div class="slot-name-vi">${viName}</div>
        `;

        // Click để ghim (khoanh) hoặc bỏ ghim
        slot.addEventListener("click", () => {
          AudioEngine.pencil();
          if (!ghostObj) return;

          if (pinnedGhostId === ghostObj.id) {
            // Click lại vào ma đang ghim => Bỏ ghim (unpin)
            pinnedGhostId = null;
          } else {
            // Ghim ma này
            pinnedGhostId = ghostObj.id;
            selectedGhostId = ghostObj.id;
            selectGhost(ghostObj.id);
          }

          updateGhostGridStates();
        });

        // Double click mở ngay Hồ sơ mật phóng to
        slot.addEventListener("dblclick", () => {
          if (ghostObj) {
            pinnedGhostId = ghostObj.id;
            selectedGhostId = ghostObj.id;
            selectGhost(ghostObj.id);
            openDossierModal();
          }
        });

        grid.appendChild(slot);
      });

      updateGhostGridStates();
    }

    // TÍNH TOÁN 3 TRẠNG THÁI: NORMAL | RULED-OUT | PINNED
    function updateGhostGridStates() {
      const included = Object.keys(evidenceState).filter(k => evidenceState[k] === true);
      const excluded = Object.keys(evidenceState).filter(k => evidenceState[k] === false);

      const slots = document.querySelectorAll(".ghost-slot");
      let possibleGhosts = [];

      slots.forEach(slot => {
        const name = slot.dataset.name;
        const g = ghostsData.find(x => x.name_en.toLowerCase() === name.toLowerCase());
        if (!g) return;

        slot.style.display = "flex";

        // QUY TẮC LOẠI TRỪ BẰNG CHỨNG (CHỈ GẠCH KHI CÓ MÂU THUẪN)
        let isRuledOut = false;

        // Chưa tick bằng chứng nào thì cả 30 ma đều sáng bình thường
        if (included.length > 0 || excluded.length > 0) {
          for (const inc of included) {
            // The Mimic luôn có Fake Ghost Orb ở mọi độ khó
            if (g.id === "the_mimic" && inc === "Ghost Orb") continue;
            if (!g.evidences.includes(inc)) {
              isRuledOut = true;
              break;
            }
          }

          if (!isRuledOut) {
            for (const exc of excluded) {
              if (g.id === "the_mimic" && exc === "Ghost Orb") {
                isRuledOut = true;
                break;
              }
              if (g.evidences.includes(exc)) {
                isRuledOut = true;
                break;
              }
            }
          }
        }

        // ÁP DỤNG TRẠNG THÁI: RULED-OUT | PINNED | HIGHLIGHTED
        slot.classList.remove("ruled-out", "pinned", "highlighted");

        // THUỘC TÍNH NHÓM: tích nhiều nhóm được — chỉ giữ con đủ ĐIỀU KIỆN của tất cả nhóm đã tick
        const activeGroups = GROUP_ATTRS.filter(a => activeFilters.includes(a.id));
        if (!isRuledOut && activeGroups.length && !activeGroups.every(ga => ga.test(g))) {
          isRuledOut = true;
        }

        if (isRuledOut) {
          slot.classList.add("ruled-out");
        } else {
          possibleGhosts.push(g);
          if (activeGroups.length) {
            slot.classList.add("highlighted");
            // Trộn ≥2 nhóm: con trùng cả hai đội viền xanh kép
            if (activeGroups.length >= 2) slot.classList.add("filter-overlap");
          }
        }

        // Khoanh chỉ khi người dùng bấm
        if (pinnedGhostId === g.id) {
          slot.classList.add("pinned");
        }
      });

      updateQuickActionBar(possibleGhosts);
    }

    // CẬP NHẬT THẺ DƯỚI CÙNG (QUICK ACTION BAR)
    function updateQuickActionBar(possibleGhosts) {
      if (!possibleGhosts) {
        possibleGhosts = ghostsData.filter(g => {
          // check if not ruled out
          return true;
        });
      }

      const infoContainer = document.getElementById("actionBarGhostInfo");
      const btnZoom = document.getElementById("btnZoomDossier");

      if (pinnedGhostId) {
        // ĐANG CÓ MA ĐƯỢC GHIM (KHOANH)
        const g = ghostsData.find(x => x.id === pinnedGhostId);
        if (g) {
          let speedText = `${g.speed.base} m/s`;
          if (g.speed.max_los !== g.speed.base) speedText += ` → ${g.speed.max_los} m/s`;
          let huntText = typeof g.hunt_sanity === "number" ? `${g.hunt_sanity}% Sanity` : g.hunt_sanity;

          const cleanVi = g.name_vi.replace(/\s*\([^)]*\)/g, '').trim();
          infoContainer.innerHTML = `
            <div class="action-ghost-name">${g.name_en} <small>(${cleanVi})</small></div>
            <div class="action-ghost-meta">Đã khoanh ghim • Ngưỡng Hunt: <strong>${huntText}</strong> • Tốc độ: <strong>${speedText}</strong></div>
          `;

          btnZoom.textContent = "HỒ SƠ MẬT (DOSSIER)";
          btnZoom.className = "btn-zoom-dossier";
          btnZoom.onclick = () => {
            selectGhost(g.id);
            openDossierModal();
          };
          return;
        }
      }

      // CHƯA GHIM MA NÀO
      const count = possibleGhosts.length;
      infoContainer.innerHTML = `
        <div class="action-ghost-name" style="color: #4a3e2e;">CHƯA GHIM MA NÀO</div>
        <div class="action-ghost-meta">Còn <strong>${count} / 30</strong> loài ma khả nghi • Nhấp vào thẻ ma để khoanh ghim</div>
      `;

      if (count === 1) {
        btnZoom.textContent = `XEM ${possibleGhosts[0].name_en.toUpperCase()}`;
        btnZoom.className = "btn-zoom-dossier";
        btnZoom.onclick = () => {
          selectGhost(possibleGhosts[0].id);
          openDossierModal();
        };
      } else {
        btnZoom.textContent = "HỒ SƠ MẬT (DOSSIER)";
        btnZoom.className = "btn-zoom-dossier secondary";
        btnZoom.onclick = () => {
          if (possibleGhosts.length > 0) {
            selectGhost(possibleGhosts[0].id);
          }
          openDossierModal();
        };
      }
    }

    // SELECT GHOST FOR DEEP-DIVE (TAB 02)
    function selectGhost(ghostId) {
      selectedGhostId = ghostId;
      const g = ghostsData.find(x => x.id === ghostId);
      if (!g) return;

      document.getElementById("infoGhostNameVi").textContent = g.name_vi;
      document.getElementById("infoGhostNameEn").textContent = `${g.name_en} • Bí danh: ${g.alias ? g.alias.join(', ') : 'Không có'}`;

      let speedText = `${g.speed.base} m/s`;
      if (g.speed.max_los !== g.speed.base) speedText += ` → ${g.speed.max_los} m/s`;
      let huntText = typeof g.hunt_sanity === "number" ? `${g.hunt_sanity}% Sanity` : g.hunt_sanity;

      const attr = GHOST_ROSTER_ATTRS[ghostId];
      document.getElementById("infoMetaChips").innerHTML = `
        <div class="info-chip">Ngưỡng Sanity Hunt: <strong>${huntText}</strong></div>
        <div class="info-chip">Tốc Độ Săn: <strong>${speedText}</strong></div>
        ${attr ? `<div class="info-chip info-chip-attr" title="${attr.full.replace(/"/g, '&quot;')}">Thuộc Tính Riêng: <strong>${attr.tag}</strong></div>` : ''}
      `;

      let evsHtml = `<strong>Bằng Chứng:</strong> ${g.evidences.join(" • ")}`;
      if (g.fake_evidence) {
        evsHtml += ` • <span style="color: #c53030; font-weight: bold;">+ ${g.fake_evidence} (Luôn xuất hiện)</span>`;
      }
      document.getElementById("infoEvidencesBar").innerHTML = evsHtml;

      document.getElementById("infoStrength").textContent = g.traits.strength;
      document.getElementById("infoWeakness").textContent = g.traits.weakness;
      document.getElementById("infoHiddenTest").textContent = g.hidden_test;

      const alertBox = document.getElementById("infoSpecialAlert");
      alertBox.innerHTML = "";
      if (g.id === "deogen") {
        alertBox.innerHTML = `
          <div class="warning-badge">
            <strong>DEOGEN (MA THỞ DỐC):</strong> Luôn biết vị trí của bạn 100%! Tuyệt đối không trốn trong tủ. Chạy ra dắt bộ looping quanh bàn (ở gần nó đi siêu chậm 0.4 m/s).
          </div>
        `;
      } else if (g.id === "the_mimic") {
        alertBox.innerHTML = `
          <div class="warning-badge" style="border-color: #ec4899; color: #9d174d; background: #fdf2f8;">
            <strong>THE MIMIC (MA LỪA):</strong> Luôn có Ghost Orb giả ở mọi độ khó (kể cả 0-evidence)! Đừng nhầm lẫn với Hantu hay Onryo.
          </div>
        `;
      } else if (g.id === "demon") {
        alertBox.innerHTML = `
          <div class="warning-badge">
            <strong>DEMON (ÁC QUỶ):</strong> Có thể hunt bất ngờ ở 100% Sanity. Nhang chỉ chặn hunt được 60 giây!
          </div>
        `;
      }

      document.querySelectorAll(".dir-card").forEach(c => {
        c.classList.toggle("active", c.dataset.id === ghostId);
      });
    }

