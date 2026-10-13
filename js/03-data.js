    /* ==============================================================
       ★ EVIDENCE & GHOST DATA MATRIX ★
       ============================================================== */
    const EVIDENCES = [
      { id: "EMF 5", label: "EMF Level 5", desc: "Máy đo EMF nhảy vạch đỏ số 5 (tín hiệu mức 5)" },
      { id: "D.O.T.S Projector", label: "D.O.T.S Projector", desc: "Bóng ma lướt qua lưới tia laser xanh D.O.T.S" },
      { id: "Ultraviolet", label: "Ultraviolet", desc: "Dấu bàn tay, ngón tay hoặc bước chân huỳnh quang UV" },
      { id: "Freezing Temperatures", label: "Freezing Temperatures", desc: "Nhiệt kế dưới 0°C (32°F) hoặc thở ra hơi sương trắng" },
      { id: "Ghost Orb", label: "Ghost Orb", desc: "Đốm sáng ma lơ lửng trên màn hình Video Camera ban đêm" },
      { id: "Ghost Writing", label: "Ghost Writing", desc: "Hình vẽ ma hoặc chữ viết nguệch ngoạc trong sổ" },
      { id: "Spirit Box", label: "Spirit Box", desc: "Ma trả lời qua loa máy thu âm Spirit Box (tắt đèn)" }
    ];

    // Trạng thái của 7 bằng chứng: null (chưa tick), true (có ✔), false (không có ✖)
    const evidenceState = {};
    EVIDENCES.forEach(e => evidenceState[e.id] = null);

    // THUỘC TÍNH NHÓM — dùng chung cơ chế LOẠI với bằng chứng (bấm là gạch thẳng con không liên quan)
    const GROUP_ATTRS = [
      { id: "early_hunt", label: "Săn Sớm (>60%)", desc: "Loài săn ở ngưỡng Sanity cao (>60%)",
        test: g => (g.hunt_sanity >= 60 || g.id === "demon" || g.id === "yokai" || g.id === "thaye") },
      { id: "fast_speed", label: "Tốc Độ Cao", desc: "Loài có cơ chế tăng tốc đặc thù (LOS / điện / lạnh / bóng tối)",
        test: g => ["revenant", "moroi", "deogen", "thaye", "deildegast", "hantu", "jinn", "raiju"].includes(g.id) }
    ];

    let ghostsData = [];
    let toolsAndCursedData = null;
    let referenceData = null;
    let knowledgeData = null;
    let pinnedGhostId = null; // CHỈ KHOANH KHI NGƯỜI DÙNG BẤM
    let selectedGhostId = "the_mimic"; // Ghost active trong dossier modal
    let currentTab = "main-journal";
    let isFootstepPlaying = false;
    let selectedBpmMode = "base";
    let activeFilters = []; //Cho phép chọn nhiều nhóm cùng lúc: 'early_hunt', 'fast_speed'

    /* DÙNG CHUNG: tính ma còn lại / bị loại theo tab 01 Evidence (để Cẩm Nang lọc theo) */
    function isGhostRuledOut(g) {
      if (!g) return true;
      const included = Object.keys(evidenceState).filter(k => evidenceState[k] === true);
      const excluded = Object.keys(evidenceState).filter(k => evidenceState[k] === false);
      if (included.length === 0 && excluded.length === 0) {
        // chưa tick gì -> chỉ check nhóm lọc chiến thuật
        const ag0 = GROUP_ATTRS.filter(a => activeFilters.includes(a.id));
        if (ag0.length && !ag0.every(ga => ga.test(g))) return true;
        return false;
      }
      for (const inc of included) {
        if (g.id === "the_mimic" && inc === "Ghost Orb") continue;
        if (!g.evidences.includes(inc)) return true;
      }
      for (const exc of excluded) {
        if (g.id === "the_mimic" && exc === "Ghost Orb") return true;
        if (g.evidences.includes(exc)) return true;
      }
      const ag = GROUP_ATTRS.filter(a => activeFilters.includes(a.id));
      if (ag.length && !ag.every(ga => ga.test(g))) return true;
      return false;
    }

    function getEvidenceFilteredGhosts() {
      if (!ghostsData || !ghostsData.length) return { possible: [], ruledOut: [], included: [], excluded: [] };
      const included = Object.keys(evidenceState).filter(k => evidenceState[k] === true);
      const excluded = Object.keys(evidenceState).filter(k => evidenceState[k] === false);
      const possible = ghostsData.filter(g => !isGhostRuledOut(g));
      const ruledOut = ghostsData.filter(g => isGhostRuledOut(g));
      return { possible, ruledOut, included, excluded };
    }

    // Tap tempo variables
    let tapTimestamps = [];
    let tapResetTimer = null;

    // 30 Ghost screenshot list
    const ALL_SCREENSHOT_GHOSTS = [
      "Aswang", "Banshee", "Dayan", "Deildegast", "Demon", "Deogen", 
      "Gallu", "Goryo", "Hantu", "Jinn", "Kormos", "Mare", 
      "Moroi", "Myling", "Obake", "Obambo", "Oni", "Onryo", 
      "Phantom", "Poltergeist", "Raiju", "Revenant", "Shade", "Spirit", 
      "Thaye", "The Mimic", "The Twins", "Wraith", "Yokai", "Yurei"
    ];

    const INSTANT_CLUES = {
      spirit: "Đốt nhang (Smudge Stick / Incense) khóa khả năng đi săn trong 180 giây (3 phút) - gấp đôi mốc 90 giây của các loài ma thông thường.",
      wraith: "Dẫm vào đống muối KHÔNG BAO GIỜ để lại dấu chân huỳnh quang phát sáng dưới ánh đèn UV. Có kỹ năng Teleport đến sát lưng người chơi.",
      phantom: "Chụp ảnh lúc ghost event ma biến mất ngay lập tức và ảnh trong album hoàn toàn TRỐNG TRƠN không bị nhiễu hạt. Lúc hunt tàng hình rất lâu (1-2s mới chớp hiện 0.3s).",
      poltergeist: "Nổ tung đống 5-10 đồ vật cùng lúc (Polty Bomb). Lúc hunt ném đồ liên tục dồn dập mỗi 0.5 giây với tỷ lệ 100%.",
      banshee: "Tiếng thét rên rỉ kỳ dị độc quyền trên Parabolic Microphone (Paramic). Chỉ nhắm duy nhất 1 người chơi làm mục tiêu cho tới khi người đó chết.",
      jinn: "Tăng tốc cực nhanh khi nhìn thấy người chơi NẾU CẦU DAO ĐANG BẬT. Không bao giờ tự tay gạt tắt cầu dao điện chính.",
      mare: "Không bao giờ bật đèn. Có thể tắt công tắc đèn NGAY LẬP TỨC (0.1s) khi bạn vừa bật lên. Săn ở 60% khi tắt đèn (40% khi bật).",
      revenant: "Không thấy người: Bò lê lết (1.0 m/s - 70 BPM). Nhìn thấy người: Phóng như tên lửa (3.0 m/s - 210 BPM).",
      shade: "Siêu nhút nhát: Không bao giờ làm event hay đi săn khi có người đứng cùng phòng. Chỉ săn khi Sanity cả đội dưới 35%.",
      demon: "Có thể dùng tuyệt chiêu đi săn ở 100% Sanity. Nhang chỉ chặn đi săn trong 60 giây (thay vì 90s). Tầm ngăn chặn của thánh giá là 5m.",
      yurei: "Đóng sầm cửa 2 nhịp làm tụt 15% Sanity. Đốt nhang nhốt Yurei trong phòng hiện tại suốt 90 giây.",
      oni: "Cực kỳ hung hãn và liên tục tương tác. Không bao giờ làm event bóng khí (air-ball). Lúc hunt hầu như luôn hiện hình (ít tàng hình).",
      yokai: "Nói chuyện hoặc dùng bộ đàm gần ma sẽ kích hoạt săn ở 80% Sanity. Lúc hunt bị điếc/mù thiết bị điện xa hơn 2.5m.",
      hantu: "Cực nhanh trong phòng lạnh (<0°C lên tới 2.7 m/s), siêu chậm trong phòng ấm (1.4 m/s). Thở ra khói lúc hunt khi tắt cầu dao. Không tăng tốc theo LOS.",
      goryo: "D.O.T.S chỉ nhìn thấy qua MÀN HÌNH VIDEO CAMERA và KHÔNG ĐƯỢC CÓ NGƯỜI TRONG PHÒNG. Không bao giờ đổi phòng yêu thích.",
      myling: "Tiếng bước chân lúc hunt chỉ nghe thấy khi đèn pin bắt đầu nhấp nháy (<10m). Bình thường ma khác nghe từ 20m.",
      onryo: "Coi ngọn nến như thánh giá. Thổi tắt ngọn nến thứ 3 sẽ ép đi săn ngay lập tức bất kể Sanity (trừ khi có ngọn nến khác chặn).",
      the_twins: "Có 2 tốc độ săn luân phiên: Con chính chậm 90% (1.5 m/s) và Con phụ nhanh 110% (1.87 m/s). Tương tác đồng thời ở 2 phòng khác nhau.",
      raiju: "Tăng tốc lên tới 2.5 m/s khi ở gần thiết bị điện của người chơi (đèn pin, EMF, video cam). Làm nhiễu thiết bị từ khoảng cách 15m (ma thường 10m).",
      obake: "Dấu tay UV có 6 ngón tay (16.7% tỷ lệ) hoặc dấu tay tự biến mất sau 10s. Lúc hunt chớp biến hình thành model ma khác ít nhất 1 lần.",
      the_mimic: "LUÔN CÓ GHOST ORB GIẢ (thành 4 bằng chứng, có orb ở cả 0-evidence!). Bắt chước hành vi của loài ma khác mỗi 30-120 giây.",
      moroi: "Nghe Spirit Box bị dính nguyền tụt Sanity gấp đôi trong bóng tối. Sanity càng thấp chạy càng nhanh (0% Sanity chạy 2.25 m/s, có LOS lên tới 3.71 m/s - NHANH NHẤT GAME!). Nhang làm mù Moroi 12s lúc hunt.",
      deogen: "LUÔN BIẾT VỊ TRÍ CỦA BẠN (KHÔNG ĐƯỢC TRỐN TỦ). Ở xa lao tới cực nhanh (3.0 m/s), khi lại gần bạn (<2.5m) đi bộ dưỡng sinh cực chậm (0.4 m/s). Spirit Box ở cự ly <1m có tiếng thở dốc ồ ồ độc quyền!",
      thaye: "Mới vào game cực kỳ trẻ và hung hãn (săn ở 75% Sanity, chạy 2.75 m/s). Càng về sau càng già đi nếu người chơi ở gần nó (săn tụt xuống 15%, chạy chậm 1.0 m/s). Không tăng tốc theo LOS.",
      aswang: "Aswang 2026: Base 1.53 m/s tăng tốc theo LOS nhanh nhất game. Đang hunt mà nó bước vào chỗ ẩn chính thức (tủ/hộc) thì hunt KẾT THÚC ngay; có thể hunt với grace = 0.",
      dayan: "Dayan 2026: Chỉ NỮ. Trong 10m: bạn ĐI BỘ → 2.25 m/s (hunt 65%); bạn ĐỨNG YÊN → 1.2 m/s (hunt 45%); xa hơn 10m → 1.7 m/s (hunt 50%).",
      deildegast: "Deildegast 2026: Tốc độ 3.0 m/s (chưa xê dịch đồ) giảm dần tới 0.4 m/s khi đủ 26 món bị xê dịch; reset về max sau hunt hoặc khi bị thánh giá chặn.",
      gallu: "Gallu 2026: 3 trạng thái Normal/Enraged/Weakened — hunt 50%/60%/40%, tốc độ 1.7/1.96/1.36 m/s. Enraged đi qua muối không để lại dấu chân; tầm thánh giá −2m.",
      kormos: "Kormos 2026: Gần như MÙ nhưng cảm nhận chuyển động tới 30m; SPRINT gần nó → hunt sớm tới 70% (bình thường 50%). Nên ĐI BỘ.",
      obambo: "Obambo 2026: Đổi trạng thái mỗi 2 phút (kể cả giữa hunt): Calm (hunt 10%, 1.45 m/s) ↔ Aggressive (hunt 65%, 1.96 m/s); hunt Aggressive ngắn hơn 20%."
    };

