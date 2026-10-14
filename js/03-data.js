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
        test: g => (g.hunt_sanity >= 60 || ["demon", "yokai", "thaye", "dayan", "gallu", "kormos", "the_mimic"].includes(g.id)) },
      { id: "fast_speed", label: "Tốc Độ Cao", desc: "Loài có cơ chế tăng tốc đặc thù (LOS / điện / lạnh / bóng tối)",
        test: g => ["revenant", "moroi", "deogen", "thaye", "deildegast", "hantu", "jinn", "raiju", "the_twins", "aswang", "dayan", "gallu", "kormos", "obambo", "the_mimic"].includes(g.id) }
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
      wraith: "KHÔNG BAO GIỜ dẫm lún muối (kể cả muối T3). Muối bị lún (dù có/không dấu UV) → gạch Wraith ngay. Teleport tới sát người chơi kèm EMF 2/5.",
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
      myling: "Tiếng bước chân lúc hunt chỉ nghe trong ~12m (ma khác 20m) — gần như cùng lúc đèn pin nháy ở 10m. Hay phát 2 âm siêu nhiên trong 80s qua Paramic.",
      onryo: "Coi ngọn nến như thánh giá. Thổi tắt ngọn nến thứ 3 sẽ ép đi săn ngay lập tức bất kể Sanity (trừ khi có ngọn nến khác chặn).",
      the_twins: "Tốc độ săn luân phiên mỗi hunt: 1.5 m/s hoặc 1.9 m/s (1 thực thể, 2 bán kính tương tác nên đồ xa vẫn bị đụng).",
      raiju: "Tăng tốc lên tới 2.5 m/s khi ở gần thiết bị điện của người chơi (đèn pin, EMF, video cam). Làm nhiễu thiết bị từ khoảng cách 15m (ma thường 10m).",
      obake: "Dấu tay UV 6 ngón (16.7%), 2 ngón trên công tắc, 5 ngón trên bàn phím/cửa buồng giam. Thỉnh thoảng cắt nửa thời gian tồn tại của dấu. Biến hình theo nhịp chớp cố định khi hunt.",
      the_mimic: "LUÔN CÓ GHOST ORB GIẢ (thành 4 bằng chứng, có orb ở cả 0-evidence!). Bắt chước hành vi của loài ma khác mỗi 30-120 giây.",
      moroi: "Nghe Spirit Box bị dính nguyền tụt Sanity gấp đôi trong bóng tối. Sanity càng thấp chạy càng nhanh (0% Sanity chạy 2.25 m/s, có LOS lên tới 3.71 m/s - NHANH NHẤT GAME!). Nhang làm mù Moroi 7s lúc hunt (ma thường 5s). Dính nguyền qua Spirit Box, Paramic hoặc Sound Recorder.",
      deogen: "LUÔN BIẾT VỊ TRÍ CỦA BẠN (KHÔNG ĐƯỢC TRỐN TỦ). Ở xa (trên ~5.3m đường đi) lao tới cực nhanh (3.0 m/s), khi lại gần bạn (<2.4m đường đi) đi bộ dưỡng sinh cực chậm (0.4 m/s). Spirit Box ở cự ly <1m có tiếng thở dốc ồ ồ độc quyền!",
      thaye: "Mới vào game cực kỳ trẻ và hung hãn (săn ở 75% Sanity, chạy 2.75 m/s). Càng về sau càng già đi nếu người chơi ở gần nó (săn tụt xuống 15%, chạy chậm 1.0 m/s). Không tăng tốc theo LOS.",
      aswang: "Aswang 2026: Base 1.53 m/s, tăng tốc LOS nhanh nhất game (max ~2.52 sau ~8.7 giây). Bước vào tủ/locker có người → hunt KẾT THÚC ngay; hunt sau lao tới chỗ bạn với grace ≈ 0. Chỉ chỗ ẩn CHÍNH THỨC mới miễn tử.",
      dayan: "Dayan 2026: Chỉ NỮ. Trong 10m: bạn ĐI BỘ → 2.25 m/s (hunt 65%); bạn ĐỨNG YÊN → 1.2 m/s (hunt 45%); xa hơn 10m → 1.7 m/s (hunt 50%).",
      deildegast: "Deildegast 2026: 3.0 đầu trận, mỗi món xê dịch TRƯỚC hunt −0.1 (26 món → 0.4). Ném giữa hunt VÔ ÍCH; reset về 3.0 sau hunt/crucifix. Không tính: đồ mang theo, đồ nguyền, cửa, đồ ma ném, cờ vua.",
      gallu: "Gallu 2026: 3 trạng thái Normal/Enraged/Weakened — hunt 50%/60%/40%, tốc độ 1.7/1.96/1.36 m/s. Enraged đi qua muối không để lại dấu chân; tầm thánh giá −2m.",
      kormos: "Kormos 2026: Gần như MÙ (LoS chỉ ≤5m không vật cản) nhưng nghe bước chân 30m sprint / 15m đi bộ / 10m crouch. Nghe tiếng → lao 2.21 m/s. SPRINT cùng phòng → hunt 70%. Không bao giờ event khói/Chase. Nên ĐI BỘ + im lặng.",
      obambo: "Obambo 2026: Đổi trạng thái mỗi 2 phút (kể cả giữa hunt): Calm (hunt 10%, 1.45 m/s) ↔ Aggressive (hunt 65%, 1.96 m/s); hunt Aggressive ngắn hơn 20%."
    };

