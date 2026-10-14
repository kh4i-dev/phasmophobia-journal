    /* ==============================================================
       ★ TRAINING / QUIZ — LUYỆN NHẬN DIỆN MA ★
       Tab 09: trắc nghiệm 4 đáp án để luyện phản xạ.
       2 chế độ: theo 3 Bằng Chứng, hoặc theo Dấu Hiệu Ẩn.
       ============================================================== */
    let trainMode = "evidence";       // "evidence" | "tell"
    let trainScore = 0;
    let trainTotal = 0;
    let trainStreak = 0;
    let trainBest = 0;
    let trainCurrent = null;
    let trainAnswered = false;

    function trainShuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function trainPick(n, pool) {
      return trainShuffle(pool).slice(0, n);
    }

    function setTrainMode(mode) {
      trainMode = mode;
      newTrainingQuestion();
    }

    function newTrainingQuestion() {
      if (!ghostsData || !ghostsData.length) return;
      const pool = ghostsData;
      const correct = pool[Math.floor(Math.random() * pool.length)];

      let prompt = "";
      let promptLabel = "";
      if (trainMode === "evidence") {
        prompt = (correct.evidences || []).join("  •  ");
        promptLabel = "Ba bằng chứng này thuộc con ma nào?";
      } else {
        prompt = INSTANT_CLUES[correct.id] || correct.hidden_test || "(không có dữ liệu)";
        prompt = prompt.replace(new RegExp("^" + correct.name_en + "\\s*(?:2026)?\\s*:\\s*", "i"), "").replace(new RegExp("\\b" + correct.name_en + "\\b", "gi"), "loài ma này");
        promptLabel = "Dấu hiệu nhận diện này thuộc con ma nào?";
      }

      const others = trainPick(3, pool.filter(g => g.id !== correct.id));
      const options = trainShuffle([correct, ...others]);
      trainCurrent = { correct, options, prompt, promptLabel };
      trainAnswered = false;
      renderTrainingQuestion();
    }

    function answerTraining(gid) {
      if (!trainCurrent || trainAnswered) return;
      trainAnswered = true;
      const correctId = trainCurrent.correct.id;
      const isRight = gid === correctId;
      trainTotal++;
      if (isRight) {
        trainScore++;
        trainStreak++;
        if (trainStreak > trainBest) trainBest = trainStreak;
      } else {
        trainStreak = 0;
      }
      AudioEngine && (isRight ? AudioEngine.pencil && AudioEngine.pencil() : null);

      // Tô màu các đáp án
      document.querySelectorAll("#leftTrainingContent .train-opt").forEach(btn => {
        const bid = btn.dataset.id;
        btn.style.pointerEvents = "none";
        if (bid === correctId) {
          btn.style.background = "rgba(22,128,61,0.18)";
          btn.style.borderColor = "#15803d";
        } else if (bid === gid) {
          btn.style.background = "rgba(153,27,27,0.15)";
          btn.style.borderColor = "#991b1b";
        } else {
          btn.style.opacity = "0.55";
        }
      });

      const fb = document.getElementById("trainFeedback");
      if (fb) {
        fb.style.display = "block";
        fb.style.background = isRight ? "rgba(22,128,61,0.12)" : "rgba(153,27,27,0.12)";
        fb.style.borderColor = isRight ? "#15803d" : "#991b1b";
        fb.innerHTML = isRight
          ? `✅ <strong>Đúng!</strong> ${trainCurrent.correct.name_en} — ${trainCurrent.correct.name_vi}`
          : `❌ <strong>Sai.</strong> Đáp án: <strong>${trainCurrent.correct.name_en}</strong> (${trainCurrent.correct.name_vi})`;
      }
      renderTrainingScore();
    }

    function renderTrainingQuestion() {
      const c = document.getElementById("leftTrainingContent");
      if (!c || !trainCurrent) return;
      c.innerHTML = "";

      const modeTag = document.createElement("div");
      modeTag.style.fontSize = "0.75rem";
      modeTag.style.fontWeight = "700";
      modeTag.style.letterSpacing = "0.04em";
      modeTag.style.color = "#8f2020";
      modeTag.textContent = (trainMode === "evidence" ? "CHẾ ĐỘ: 3 BẰNG CHỨNG" : "CHẾ ĐỘ: DẤU HIỆU ẨN");
      c.appendChild(modeTag);

      const q = document.createElement("div");
      q.style.fontSize = "0.85rem";
      q.style.color = "#3b2f22";
      q.style.margin = "6px 0 8px";
      q.textContent = trainCurrent.promptLabel;
      c.appendChild(q);

      const box = document.createElement("div");
      box.style.fontFamily = "var(--font-hand)";
      box.style.fontSize = trainMode === "evidence" ? "1.6rem" : "1.1rem";
      box.style.lineHeight = "1.35";
      box.style.color = "#1e3a8a";
      box.style.background = "rgba(255,255,255,0.55)";
      box.style.borderRadius = "6px";
      box.style.padding = "10px 12px";
      box.style.marginBottom = "12px";
      box.textContent = trainCurrent.prompt;
      c.appendChild(box);

      trainCurrent.options.forEach(g => {
        const btn = document.createElement("button");
        btn.className = "train-opt";
        btn.dataset.id = g.id;
        btn.style.display = "block";
        btn.style.width = "100%";
        btn.style.textAlign = "left";
        btn.style.margin = "0 0 7px";
        btn.style.padding = "8px 11px";
        btn.style.fontSize = "0.9rem";
        btn.style.cursor = "pointer";
        btn.style.background = "rgba(255,255,255,0.6)";
        btn.style.border = "1px solid rgba(120,90,55,0.5)";
        btn.style.borderRadius = "6px";
        btn.innerHTML = `<strong>${g.name_en}</strong> <span style="font-size:0.75rem;color:#7e6f54;">${g.name_vi.replace(/\s*\([^)]*\)/g, "").trim()}</span>`;
        btn.addEventListener("click", () => answerTraining(g.id));
        c.appendChild(btn);
      });

      const fb = document.createElement("div");
      fb.id = "trainFeedback";
      fb.style.display = "none";
      fb.style.marginTop = "10px";
      fb.style.padding = "8px 11px";
      fb.style.borderRadius = "6px";
      fb.style.border = "1px solid transparent";
      fb.style.fontSize = "0.86rem";
      c.appendChild(fb);
    }

    function renderTrainingScore() {
      const c = document.getElementById("rightTrainingContent");
      if (!c) return;
      c.innerHTML = "";
      const acc = trainTotal ? Math.round((trainScore / trainTotal) * 100) : 0;

      const stats = document.createElement("div");
      stats.style.display = "grid";
      stats.style.gridTemplateColumns = "1fr 1fr";
      stats.style.gap = "7px";
      stats.style.marginBottom = "12px";
      const cell = (label, val, col) =>
        `<div style="background:rgba(255,255,255,0.55);border-radius:6px;padding:8px 10px;text-align:center;">
           <div style="font-size:0.72rem;letter-spacing:0.04em;color:#7e6f54;">${label}</div>
           <div style="font-family:var(--font-hand);font-size:1.7rem;color:${col};line-height:1.1;">${val}</div>
         </div>`;
      stats.innerHTML =
        cell("ĐÚNG / TỔNG", `${trainScore}/${trainTotal}`, "#15803d") +
        cell("CHÍNH XÁC", acc + "%", "#1e3a8a") +
        cell("CHUỖI ĐÚNG", trainStreak, "#b45309") +
        cell("KỶ LỤC", trainBest, "#8f2020");
      c.appendChild(stats);

      const modeTitle = document.createElement("div");
      modeTitle.style.fontSize = "0.78rem";
      modeTitle.style.fontWeight = "700";
      modeTitle.style.color = "#8f2020";
      modeTitle.style.marginBottom = "5px";
      modeTitle.textContent = "CHỌN CHẾ ĐỘ";
      c.appendChild(modeTitle);

      const mkMode = (key, label) => {
        const b = document.createElement("button");
        b.textContent = label;
        b.style.display = "block";
        b.style.width = "100%";
        b.style.margin = "0 0 7px";
        b.style.padding = "8px 11px";
        b.style.fontSize = "0.86rem";
        b.style.cursor = "pointer";
        b.style.borderRadius = "6px";
        const on = trainMode === key;
        b.style.background = on ? "rgba(143,32,32,0.9)" : "rgba(255,255,255,0.6)";
        b.style.color = on ? "#fff" : "#3b2f22";
        b.style.border = "1px solid rgba(120,90,55,0.5)";
        b.addEventListener("click", () => setTrainMode(key));
        return b;
      };
      c.appendChild(mkMode("evidence", "Theo 3 Bằng Chứng"));
      c.appendChild(mkMode("tell", "Theo Dấu Hiệu Ẩn"));

      const next = document.createElement("button");
      next.textContent = "▶ Câu Tiếp";
      next.style.display = "block";
      next.style.width = "100%";
      next.style.margin = "10px 0 7px";
      next.style.padding = "10px 11px";
      next.style.fontSize = "0.92rem";
      next.style.fontWeight = "700";
      next.style.cursor = "pointer";
      next.style.borderRadius = "6px";
      next.style.background = "#1e3a8a";
      next.style.color = "#fff";
      next.style.border = "1px solid #16305f";
      next.addEventListener("click", () => newTrainingQuestion());
      c.appendChild(next);

      const reset = document.createElement("button");
      reset.textContent = "↺ Chơi lại từ đầu";
      reset.style.display = "block";
      reset.style.width = "100%";
      reset.style.padding = "7px 11px";
      reset.style.fontSize = "0.8rem";
      reset.style.cursor = "pointer";
      reset.style.borderRadius = "6px";
      reset.style.background = "rgba(255,255,255,0.6)";
      reset.style.border = "1px solid rgba(120,90,55,0.5)";
      reset.addEventListener("click", () => {
        trainScore = 0; trainTotal = 0; trainStreak = 0; trainBest = 0;
        newTrainingQuestion();
      });
      c.appendChild(reset);

      const tip = document.createElement("div");
      tip.style.fontSize = "0.76rem";
      tip.style.fontStyle = "italic";
      tip.style.color = "#5a4b37";
      tip.style.marginTop = "10px";
      tip.textContent = "Mẹo: luyện chế độ 'Dấu Hiệu Ẩn' để nhận ma khi chỉ có 0–1 bằng chứng (Nightmare/Insanity).";
      c.appendChild(tip);
    }

    function renderTraining() {
      if (!ghostsData || !ghostsData.length) return;
      renderTrainingScore();
      newTrainingQuestion();
    }
