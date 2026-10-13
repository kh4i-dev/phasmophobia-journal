/* ==============================================================
   ★ VIP TIPS THEO TỪNG MA — gom từ Cẩm Nang pane PRO (VIP) ★
   Mỗi ma: chot (thấy là chốt 100%), gach (thấy là gạch), speed (test tốc độ)
   ============================================================== */
const VIP_TIPS = {
  spirit: {
    chot: ["Nhang chặn đủ 180s (3 phút) không hunt → Spirit. Test chuẩn: đốt lần 1 → 2:45 không hunt → đốt lần 2 → hunt trong <60s sau đó = 100% Spirit (sanity phải <50%)."],
    gach: ["Đốt nhang đúng (gần ma) mà hunt lại <90s → gạch Spirit."],
    speed: "Chuẩn 1.7 m/s, LOS lên 2.8 m/s. Không có speed tell riêng — chốt bằng nhang 180s."
  },
  wraith: {
    chot: ["Không dẫm muối / không dấu chân UV sau khi nghe sột soạt → Wraith (nhớ loại Gallu-Enraged trước vì nó cũng không dẫm muối)."],
    gach: ["Thấy dù chỉ 1 dấu chân UV trong muối → gạch Wraith ngay."],
    speed: "Chuẩn 1.7 m/s. Dấu hiệu riêng là Teleport tới người chơi + EMF 2/5 tại điểm đến."
  },
  phantom: {
    chot: ["Chụp ảnh lúc event: ma biến mất ngay, ảnh ra TRỐNG không nhiễu điện tử → Phantom."],
    gach: [],
    speed: "Chuẩn 1.7 m/s nhưng khi hunt tàng hình rất lâu (1-2s mới chớp hiện 0.3s) — thấy là biết."
  },
  poltergeist: {
    chot: ["Ném chùm nhiều đồ cùng lúc (Polty Bomb), khi hunt ném mỗi 0.5s → Poltergeist."],
    gach: [],
    speed: "Chuẩn 1.7 m/s. Nghe đồ bay dồn dập là tell."
  },
  banshee: {
    chot: ["Tiếng hú/thét gào qua Paramic (33%) → Banshee. Chỉ nhắm 1 mục tiêu duy nhất."],
    gach: ["Thấy model/tên NAM → gạch Banshee (từ update Giáng Sinh 2025 chỉ còn nữ)."],
    speed: "Chuẩn 1.7 m/s. Không phải mục tiêu thì đứng trước mặt khi hunt cũng không chết."
  },
  jinn: {
    chot: ["Từ xa phi 2.5 về gần chậm lại + cầu dao đang BẬT → chốt Jinn (kết hợp gạch bên dưới)."],
    gach: ["Thấy ma TẮT cầu dao → gạch Jinn (Jinn không bao giờ tự tắt)."],
    speed: "2.5 m/s khi CẦU DAO BẬT + thấy bạn >3m, lại gần <3m về 1.7. Cầu dao tắt = mất khả năng."
  },
  mare: {
    chot: ["Tắt công tắc đèn ngay (0.1s) sau khi bạn vừa bật + không bao giờ bật đèn → nghi Mare nặng."],
    gach: ["Thấy ma BẬT đèn/TV/màn hình → gạch Mare (Mare không bật được)."],
    speed: "Chuẩn 1.7 m/s. Hunt 60% khi tối / 40% khi sáng — bật đèn chỗ loop để hạ ngưỡng."
  },
  revenant: {
    chot: ["Bò 1.0 (70 BPM) rồi vọt 3.0 (210 BPM) ngay khi thấy bạn → chốt Revenant."],
    gach: [],
    speed: "Bò 1.0 m/s (70 BPM) khi không thấy bạn → đột ngột 3.0 m/s (210 BPM) khi thấy → Revenant. Không loop chay, cắt LOS + trốn tủ ngay."
  },
  shade: {
    chot: ["Cả đội 0% sanity + đứng trong phòng ma mà vẫn không hunt → chốt Shade."],
    gach: ["Thấy event hát / thấy nâng & ném đồ (update Chronicle) → gạch Shade."],
    speed: "Chuẩn 1.7 m/s. Không bao giờ hunt/event khi có người cùng phòng, chỉ hunt <35%."
  },
  demon: {
    chot: ["Đốt nhang đúng (gần ma) mà hunt lại 60-89s → 100% Demon. Hunt lại chỉ 20s sau hunt trước (ma khác 25s), thánh giá +50% tầm."],
    gach: [],
    speed: "Chuẩn 1.7 m/s. Có skill cắn trộm hunt ở 100% sanity — vào nhà 10s đã có thể hunt."
  },
  yurei: {
    chot: ["Đóng sầm cửa 2 nhịp (double click) trừ 15% sanity + có thể đóng cả cửa chính ngoài event → Yurei. Nhang giam chân 90s."],
    gach: ["Thấy hé cửa (không mở/đóng hoàn toàn) → gạch Yurei (Yurei chỉ đóng/mở hoàn toàn)."],
    speed: "Chuẩn 1.7 m/s."
  },
  oni: {
    chot: ["Khi hunt hiện hình gần như liên tục, ít tàng hình → nghi Oni nặng."],
    gach: ["Thấy airball / bóng khói (mist form) → gạch Oni (Oni không bao giờ airball)."],
    speed: "Chuẩn 1.7 m/s. Siêu tăng động khi đông người."
  },
  yokai: {
    chot: ["Nói micro gần nó mà hunt ở ~80% sanity → chốt Yokai. Khi hunt dí đèn/nói to ở 3-4m nó không phản ứng → càng chắc."],
    gach: [],
    speed: "Chuẩn 1.7 m/s. Hunt 80% nếu nói micro gần nó (<2.5m). Khi hunt bị điếc: bật đèn/nói to ở 3-4m nó không phát hiện."
  },
  hantu: {
    chot: ["Khi hunt + CẦU DAO TẮT mà thấy thở hơi khói trắng từ miệng → Hantu (chốt). Bắt buộc có Freezing.", "Nightmare/Insanity: Hantu luôn cho Freezing (bằng chứng bắt buộc)."],
    gach: ["Thấy ma BẬT cầu dao ON → gạch Hantu."],
    speed: "Lạnh (<0°C) 2.7 m/s / ấm (>15°C) 1.4 m/s. Không tăng tốc LOS. Luôn BẬT cầu dao để nó thành rùa."
  },
  goryo: {
    chot: ["D.O.T.S chỉ thấy qua Video Camera khi không ai trong phòng + không đổi phòng → Goryo. Bắt buộc có D.O.T.S.", "Nightmare/Insanity: Goryo luôn cho DOTS (bằng chứng bắt buộc) — dùng để khoanh nhanh."],
    gach: ["Ma hunt ngoài phòng yêu thích / đổi phòng → gạch Goryo."],
    speed: "Chuẩn 1.7 m/s."
  },
  myling: {
    chot: ["Bước chân êm: chỉ nghe trong ~12m (ma khác ~20m), đèn pin nháy mới nghe chân → Myling."],
    gach: [],
    speed: "Chuẩn 1.7 m/s. Test ném đèn pin đang bật xuống sàn khi hunt."
  },
  onryo: {
    chot: ["Thổi tắt cùng 1 firelight 2 lần trong 20s / thổi tắt bật lửa của bạn <20s → nghi Onryo. Thổi tắt nến thứ 3 là hunt ngay."],
    gach: ["Thấy ma thắp nến nhà/campfire → gạch Onryo (Onryo không thắp được)."],
    speed: "Chuẩn 1.7 m/s. Coi nến như thánh giá trong 4m."
  },
  the_twins: {
    chot: ["2 tương tác cùng lúc ở 2 nơi xa nhau (Twinteraction) / biểu đồ xe tải 2 dốc cùng giây → Twins."],
    gach: [],
    speed: "Luân phiên 1.53 (chậm) ↔ 1.87 (nhanh) ĐỔI GIỮA CÁC HUNT. Con phụ không cho Spirit Box/Freezing."
  },
  raiju: {
    chot: ["Nhịp tim (heartbeat) to & bass hơn mọi ma, nghe cả event lẫn hunt → Raiju. Nhiễu điện tử từ 15m (ma khác 10m)."],
    gach: [],
    speed: "1.7 → 2.5 m/s khi gần đồ điện đang bật. Nghi là tắt hết đèn pin/đồ điện, dọn sàn."
  },
  obake: {
    chot: ["Dấu tay 6 ngón (16.7%) / chớp biến hình model khác khi hunt → Obake. Bắt buộc có UV.", "Nightmare/Insanity: Obake luôn cho UV (bằng chứng bắt buộc)."],
    gach: [],
    speed: "Chuẩn 1.7 m/s. Giấu vân tay 25%, vân tay mất sau 60s (ma khác 120s)."
  },
  the_mimic: {
    chot: ["Ghost Orb khi tắt HẾT bằng chứng (0-evidence/Apocalypse) → Mimic (chốt). Ở Professional đủ 4 bằng chứng = Mimic. Ở Insanity (1 bằng chứng) thì Orb CHƯA chốt được."],
    gach: [],
    speed: "Sao chép tốc độ ma khác mỗi 30-120s (lúc nhanh lúc chậm thất thường giữa các hunt)."
  },
  moroi: {
    chot: ["Dính nguyền qua Spirit Box (tụt sanity x2 trong tối) + càng thấp sanity càng nhanh → chốt Moroi. Nhang mù 12s.", "Nightmare/Insanity: Moroi luôn cho Spirit Box (bằng chứng bắt buộc)."],
    gach: [],
    speed: "Nhanh dần khi sanity tụt: 1.5 (cao) → 2.25 (0%) + LOS tới 3.71 NHANH NHẤT game. Uống thuốc để làm chậm. Bắt buộc Spirit Box, dính nguyền tụt sanity x2."
  },
  deogen: {
    chot: ["Áp Spirit Box ~1m nghe thở dốc khò khè (33%) → Deogen. Bắt buộc Spirit Box.", "Nightmare/Insanity: Deogen luôn cho Spirit Box (bằng chứng bắt buộc)."],
    gach: [],
    speed: "Xa >6m: 3.0 (210 BPM) → gần <2.5m: 0.4 (30 BPM). Luôn biết chỗ trốn — KHÔNG trốn tủ, dắt loop quanh bàn."
  },
  thaye: {
    chot: ["Hỏi tuổi Ouija 'How old are you?' lúc đầu nhỏ, vài phút sau tăng → Thaye."],
    gach: [],
    speed: "Mới vào 2.75 (195 BPM) + hunt 75% → già còn 1.0 (70 BPM) + hunt 15%. Đứng gần nó để ép già."
  },
  aswang: {
    chot: ["Đang hunt mà nó đi vào chỗ ẩn chính thức (closet/locker) thì hunt KẾT THÚC ngay → Aswang."],
    gach: [],
    speed: "Base 1.53 (chậm hơn chuẩn) nhưng tăng tốc LOS NHANH nhất game. Có thể hunt grace = 0."
  },
  dayan: {
    chot: ["Dấu chân UV ngón quay ngược 180° → chốt Dayan."],
    gach: ["Thấy model/tên NAM → gạch Dayan (Dayan chỉ nữ, giống Banshee)."],
    speed: "Trong 10m: bạn DI CHUYỂN → 2.25 + hunt 65%; bạn ĐỨNG YÊN → 1.2 + hunt 45%. Không tăng tốc LOS. Dấu chân UV ngón quay ngược 180°."
  },
  deildegast: {
    chot: ["Mới vào hunt phi 3.0 rồi chậm dần theo số đồ bị xê dịch (26 món → 0.4) → chốt Deildegast."],
    gach: [],
    speed: "Bắt đầu hunt 3.0 → mỗi đồ bị xê dịch -0.1, 26 món → còn 0.4. Không tăng tốc LOS."
  },
  gallu: {
    chot: ["Đổi tốc độ theo 3 mức 1.7/1.96/1.36 trong lúc hunt → chốt Gallu. Enraged dẫm muối KHÔNG để lại dấu chân (đừng nhầm Wraith)."],
    gach: [],
    speed: "Normal 1.7 / Enraged 1.96 / Weakened 1.36. Dẫm muối/nhang/thánh giá → đổi trạng thái. Enraged KHÔNG dẫm muối (cẩn thận khi chốt Wraith)."
  },
  kormos: {
    chot: ["Sprint gần nó → hunt sớm tới 70%; đứng yên thì nó lướt qua không phát hiện bạn → chốt Kormos."],
    gach: [],
    speed: "1.7, xa >5m lên 2.21. Gần như MÙ — đứng yên là nó đi qua không thấy. Sprint gần nó → hunt sớm 70%, nên ĐI BỘ."
  },
  obambo: {
    chot: ["Đổi tốc NGAY TRONG 1 hunt (1.45 ↔ 1.96) + tiếng chân giả phòng khác + vòi nước đen → chốt Obambo."],
    gach: [],
    speed: "Aggressive 1.96 + hunt 65% (hunt ngắn hơn) ↔ Calm 1.45 + hunt 10%. ĐỔI NGAY TRONG 1 HUNT (khác Twins đổi giữa các hunt). Đổi trạng thái mỗi ~2 phút."
  }
};

/* Mẹo chung không gắn riêng ma nào — hiện ở mọi dossier để khỏi quên */
const VIP_GENERAL = [
  "Ouija EMF5: spam câu rẻ 'How old are you?' — mỗi lần trả lời đều nhả EMF, dễ lấy EMF5 + ảnh/media.",
  "Sách bị ném (độ khó 3 bằng chứng): ma NÉM sổ mà không viết → gạch Ghost Writing.",
  "Salt T3 + loop: mỗi đống muối làm chậm ma 2s — rải quanh bàn loop để sống cả hunt.",
  "Head Gear: phải GIỮ Special để tắt → tắt ĐẦU TIÊN khi hunt bắt đầu, không thì hút ma.",
  "Đốt nhang PHẢI gần ma (trong/sát phòng) mới tính; đốt xa = vô ích. Nhang không cộng dồn.",
  "Nightmare/Insanity chốt nhanh: Goryo=DOTS • Obake=UV • Hantu=Freezing • Moroi/Deogen=Spirit Box."
];

function getVipTips(gid) {
  return VIP_TIPS[gid] || null;
}

function renderVipTipsHtml(gid) {
  const v = getVipTips(gid);
  if (!v) return "";
  let html = "";
  if (v.chot && v.chot.length) {
    html += `<div class="vip-row vip-chot"><span class="vip-tag vip-tag-chot">CHỐT 100%</span><ul>` +
      v.chot.map(t => `<li>${t}</li>`).join("") + `</ul></div>`;
  }
  if (v.gach && v.gach.length) {
    html += `<div class="vip-row vip-gach"><span class="vip-tag vip-tag-gach">THẤY LÀ GẠCH</span><ul>` +
      v.gach.map(t => `<li>${t}</li>`).join("") + `</ul></div>`;
  }
  if (v.speed) {
    html += `<div class="vip-row vip-speed"><span class="vip-tag vip-tag-speed">SPEED TEST</span><div class="vip-speed-text">${v.speed}</div></div>`;
  }
  return html;
}

/* ==============================================================
   ★ MẸO SỐNG SÓT & LOOPING VIP THEO TỪNG MA ★
   Hiện trong tab dossier "Mẹo Sống Sót & Looping" + gộp vào tìm kiếm.
   ============================================================== */
const LOOP_TIPS = {
  spirit: "Loop chuẩn quanh bàn ăn/đảo bếp, cắt LOS là nó về 1.7. Dễ nhất game.",
  wraith: "Cẩn thận Teleport tới sát bạn rồi hunt ngay — đừng loop một mình ở phòng lạ, luôn thủ nhang.",
  phantom: "Khó nhìn khi hunt (tàng hình 1-2s). Đừng căn mắt — nghe tiếng chân + đèn pin nháy để giữ khoảng cách.",
  poltergeist: "Loop ở chỗ TRỐNG, dọn đồ quanh bàn trước. Đồ bay trúng trừ sanity — đừng loop phòng bừa bộn.",
  banshee: "Không phải mục tiêu thì đứng yên cũng an toàn. Là mục tiêu thì loop như ma thường.",
  jinn: "TẮT CẦU DAO trước khi loop — mất điện là Jinn thành ma thường 1.7. Đừng loop hành lang dài khi cầu dao bật.",
  mare: "BẬT ĐÈN khu loop/hành lang để ép hunt muộn 40%. Đừng loop trong bóng tối.",
  revenant: "TUYỆT ĐỐI không loop chay. Cắt LOS ngay + trốn tủ + tắt đồ điện. Chỉ câu giờ bằng nhang dí mặt (mù 5s).",
  shade: "Hiếm khi hunt — loop chuẩn là đủ, nó ít tăng tốc vì ít thấy người.",
  demon: "Hunt lại sau 20s (ma khác 25s) — vừa thoát là thủ đợt 2 ngay. Cắm thánh giá rộng, nhang sẵn tay.",
  yurei: "Loop chuẩn. Đừng loop phòng 1 cửa — nó hay đóng sầm cửa, dễ bị nhốt.",
  oni: "Dễ loop vì hiện hình rõ — nhìn thẳng nó mà cắt góc bàn. Không có airball.",
  yokai: "Giữ >2.5m + TẮT mic/đài. Nó điếc xa — crouch sau ghế là nó đi qua luôn.",
  hantu: "BẬT CẦU DAO + loop hành lang ẤM — nó còn 1.4 chậm hơn cả đi bộ. Tắt cầu dao là nó phi 2.7.",
  goryo: "Loop chuẩn. Nó không đổi phòng nên bàn loop cố định dùng được cả trận.",
  myling: "Nó êm — đừng chờ nghe chân xa. Đèn pin nháy (<10m) là nó đã sát — giữ vòng loop rộng.",
  onryo: "Cắm 2-3 nến quanh chỗ loop — nến như thánh giá 4m, nó phải thổi nến trước khi cắn thánh giá.",
  the_twins: "Mỗi hunt một tốc (1.53 ↔ 1.87) — đừng thuộc bài 1 tốc, nghe lại chân mỗi đợt.",
  raiju: "TẮT HẾT đèn pin/đồ điện, nhặt sạch đồ dưới sàn trước khi loop. Đồ bật trong 15m là nó phi 2.5.",
  obake: "Loop chuẩn. Liếc model khi chớp — thấy đổi hình là xác nhận Obake.",
  the_mimic: "Nguy hiểm khi loop vì có thể copy Revenant 3.0 giữa chừng — thủ nhang, đừng loop đường dài.",
  moroi: "UỐNG THUỐC sanity trước khi loop để ép chậm (1.5). Sanity 0% + LOS là 3.71 không chạy nổi. Nhang mù 12s.",
  deogen: "KHÔNG TRỐN TỦ — ra bàn ăn đi bộ dắt nó vòng quanh. Xa phi 3.0, gần <2.5m bò 0.4 — bình tĩnh đi lùi.",
  thaye: "Đầu game trốn trước (2.75 rất nhanh). Ở gần cho nó già → cuối game loop dễ như ma thường.",
  aswang: "Rải muối T3 quanh bàn — dẫm muối nó khựng 1.5s. Đề phòng hunt grace = 0 (khóa cửa là giết được ngay).",
  dayan: "Giữ >10m để ép về 1.7. Trong 10m càng chạy nó càng nhanh (2.25) — vừa lùi vừa nhìn mặt, đừng quay lưng sprint.",
  deildegast: "Trước khi loop, xê dịch/ném ~20+ đồ quanh map để ép chậm dần về 0.4. Loop ngoài phòng ma của nó.",
  gallu: "Đề phòng Enraged 1.96 — đừng loop đường thẳng dài. Sau 1 hunt nó Weakened 1.36 rất dễ. Muối/nhang/thánh giá làm đổi trạng thái nên đặt trước rồi hãy loop.",
  kormos: "ĐI BỘ, không sprint. Chiếu đèn pin thẳng mặt khi hunt để ép chậm 1.4. Đứng yên + tắt đèn là nó đi qua.",
  obambo: "Nghe đổi tốc NGAY TRONG 1 hunt (1.45 ↔ 1.96) là nó — giữ vòng ngắn + nhang trong tay. Kệ tiếng chân giả phòng khác."
};

const LOOP_GENERAL = [
  "Chỉ sprint khi ma đã lấy khoảng cách; cắt góc thật gấp.",
  "Crouch sau ghế/island/xe để cắt LOS — KHÔNG crouch sau bàn ăn/sofa.",
  "Salt T3: mỗi đống làm chậm ma 2s — rải quanh bàn loop.",
  "Nhang dí mặt khi hunt: mù ~5s (T2 chậm thêm 25%, T3 đứng im 5s).",
  "Tắt Head Gear đầu tiên khi hunt bắt đầu; đã vào chỗ ẩn thì đừng tắt đồ nữa."
];

function renderLoopTipsHtml(gid) {
  const t = LOOP_TIPS[gid];
  let html = "";
  if (t) html += `<div class="vip-row vip-speed"><span class="vip-tag vip-tag-speed">LOOPING VIP</span><div class="vip-speed-text">${t}</div></div>`;
  if (typeof LOOP_GENERAL !== "undefined" && LOOP_GENERAL.length) {
    html += `<div class="vip-row vip-general"><span class="vip-tag vip-tag-general">MẸO SỐNG SÓT CHUNG</span><ul>` +
      LOOP_GENERAL.map(x => `<li>${x}</li>`).join("") + `</ul></div>`;
  }
  return html;
}

/* Tell ẩn + chốt 100% cho tab Cơ Chế Ẩn Chi Tiết (dossier) */
function renderTellHtml(gid) {
  const v = getVipTips(gid);
  if (!v) return "";
  let html = "";
  if (v.chot && v.chot.length) {
    html += `<div class="vip-row vip-chot"><span class="vip-tag vip-tag-chot">TELL ẨN — CHỐT</span><ul>` +
      v.chot.map(t => `<li>${t}</li>`).join("") + `</ul></div>`;
  }
  if (v.gach && v.gach.length) {
    html += `<div class="vip-row vip-gach"><span class="vip-tag vip-tag-gach">THẤY LÀ GẠCH</span><ul>` +
      v.gach.map(t => `<li>${t}</li>`).join("") + `</ul></div>`;
  }
  return html;
}
