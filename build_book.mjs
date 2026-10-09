// Build sách PDF: Cẩm Nang Phasmophobia 2026 (VI)
// Đọc 3 JSON + cẩm nang MD → 1 cuốn HTML premium → Edge headless in PDF
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.dirname(url.fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "book");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ghosts = JSON.parse(fs.readFileSync(path.join(ROOT, "phasmophobia_ghosts_vi.json"), "utf8"));
const tc = JSON.parse(fs.readFileSync(path.join(ROOT, "phasmophobia_tools_and_cursed_vi.json"), "utf8"));
const ref = JSON.parse(fs.readFileSync(path.join(ROOT, "phasmophobia_reference_vi.json"), "utf8"));
const md = fs.readFileSync(path.join(ROOT, "CAM_NANG_PHASMOPHOBIA_VIET_SUB.md"), "utf8");

/* ---------- mini markdown → html ---------- */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");

function mdToHtml(src) {
  const lines = src.split(/\r?\n/);
  let out = "", para = [], listType = null, table = [];
  const flushPara = () => { if (para.length) { out += `<p>${inline(para.join(" "))}</p>`; para = []; } };
  const flushList = () => { if (listType) { out += `</${listType}>`; listType = null; } };
  const flushTable = () => {
    if (table.length) {
      const rows = table.filter(r => !/^\s*\|?[\s\-:|]+\|?\s*$/.test(r));
      const cells = rows.map(r => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim()));
      out += '<table><thead><tr>' + cells[0].map(c => `<th>${inline(c)}</th>`).join("") + '</tr></thead><tbody>';
      for (const r of cells.slice(1)) out += '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join("") + '</tr>';
      out += "</tbody></table>";
      table = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(line)) { flushPara(); flushList(); table.push(line); continue; }
    flushTable();
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      if (listType !== "ul") { flushList(); out += "<ul>"; listType = "ul"; }
      out += `<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara();
      if (listType !== "ol") { flushList(); out += "<ol>"; listType = "ol"; }
      out += `<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`;
      continue;
    }
    flushList();
    const m = line.match(/^(#{1,4})\s+(.*)/);
    if (m) { flushPara(); out += `<h${m[1].length + 1}>${inline(m[2])}</h${m[1].length + 1}>`; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { flushPara(); out += "<hr>"; continue; }
    if (/^>\s?/.test(line)) { flushPara(); out += `<blockquote><p>${inline(line.replace(/^>\s?/, ""))}</p></blockquote>`; continue; }
    if (!line.trim()) { flushPara(); continue; }
    para.push(line.trim());
  }
  flushPara(); flushList(); flushTable();
  return out;
}

function mdSections() {
  const parts = md.split(/^## /m).slice(1);
  const map = {};
  for (const p of parts) {
    const title = p.slice(0, p.indexOf("\n")).trim();
    map[title] = p.slice(p.indexOf("\n") + 1);
  }
  return map;
}
const S = mdSections();
const keyOf = (re) => Object.keys(S).find(k => re.test(k));

/* ---------- render data ---------- */
const dangerClass = { "Thấp": "d-low", "Trung Bình": "d-mid", "Cao": "d-high" };

const ghostCard = (g) => {
  const alias = (g.alias || []).length ? g.alias.join(" • ") : "—";
  const hunt = typeof g.hunt_sanity === "number" ? `${g.hunt_sanity}% Sanity` : g.hunt_sanity;
  const sp = g.speed;
  let spd = `${sp.base} m/s`;
  if (sp.max_los !== sp.base) spd += ` → ${sp.max_los} m/s`;
  const fake = g.fake_evidence ? `<div class="fake">+ ${esc(g.fake_evidence)} — luôn xuất hiện (kể cả 0-evidence)</div>` : "";
  return `<article class="dossier">
    <div class="d-head">
      <div><h3>${esc(g.name_vi)}</h3><div class="d-en">${esc(g.name_en)} • ${esc(alias)}</div></div>
      <span class="danger ${dangerClass[g.danger_level] || "d-mid"}">${esc(g.danger_level)}</span>
    </div>
    <div class="d-stats">
      <div><span>Ngưỡng săn</span><b>${esc(hunt)}</b></div>
      <div><span>Tốc độ</span><b>${esc(spd)}</b></div>
      <div><span>Nhịp chân</span><b>${sp.bpm_base || "—"} → ${sp.bpm_max || "—"} BPM</b></div>
    </div>
    <div class="d-ev">${g.evidences.map(e => `<span>${esc(e)}</span>`).join("")}${fake}</div>
    <div class="d-block"><h4>Sức mạnh &amp; hành vi</h4><p>${esc(g.traits.strength)}</p></div>
    <div class="d-block wk"><h4>Điểm yếu &amp; khắc chế</h4><p>${esc(g.traits.weakness)}</p></div>
    ${sp.description ? `<div class="d-block"><h4>Tốc độ chi tiết</h4><p>${esc(sp.description)}</p></div>` : ""}
    ${g.deep_mechanics ? `<div class="d-block deep"><h4>Cơ chế sâu — mẹo bắt thóp</h4><p>${esc(g.deep_mechanics)}</p></div>` : ""}
  </article>`;
};

const tarotGrid = (tc.cursed_possessions.find(c => c.id === "tarot_cards")?.cards || [])
  .map(c => `<div class="tarot"><img src="${esc(c.image).replace(/^assets\//, "../assets/")}" alt=""><div><b>${esc(c.name_vi)}</b><span>${esc(c.flame_color || "")}</span><p>${esc(c.effect)}</p></div></div>`)
  .join("");

const cursedList = tc.cursed_possessions.filter(c => c.id !== "tarot_cards")
  .map(c => `<div class="tool"><h3>${esc(c.name_vi)} <small>${esc(c.name_en)}</small></h3><p>${esc(c.description)}</p></div>`)
  .join("");

const toolList = (tc.tools_and_equipment || [])
  .map(t => `<div class="tool"><h3>${esc(t.name_vi)} <small>${esc(t.name_en)} — ${esc(t.type)}</small></h3>
    ${(t.tiers || []).map(x => `<div class="tier"><b>${esc(x.tier)}</b> ${esc(x.item || "")} — ${esc(x.desc || x.effect || x.description || x.note || "")}</div>`).join("")}</div>`)
  .join("");

const voice = tc.voice_commands_en || {};
const voiceHtml = Object.entries(voice).map(([k, arr]) =>
  `<div class="tool"><h3>${esc(k.replace(/_/g, " "))}</h3><ul>${(arr || []).map(v => `<li><code>${esc(v)}</code></li>`).join("")}</ul></div>`).join("");

const statKeys = ref.difficulties.length ? Object.keys(ref.difficulties[0]).filter(k => !["id", "name_en", "name_vi", "notes"].includes(k)) : [];
const diffTable = `<table><thead><tr><th>Độ khó</th>${statKeys.map(k => `<th>${esc(k)}</th>`).join("")}</tr></thead>
<tbody>${ref.difficulties.map(d => `<tr><td><b>${esc(d.name_vi)}</b></td>${statKeys.map(k => `<td>${esc(d[k])}</td>`).join("")}</tr>`).join("")}</tbody></table>
${ref.difficulties.map(d => `<p class="note"><b>${esc(d.name_vi)}:</b> ${esc(d.notes)}</p>`).join("")}`;

const mapList = (ref.maps || []).map(m => `<li><b>${esc(m.name_en || m.name_vi || "")}</b> — ${esc(m.note || m.description || "")}</li>`).join("");

const ch = (num, title, body) => `<section class="page chapter"><h2 class="ch-num">${num}</h2><h2>${title}</h2>${body}</section>`;

const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8">
<title>Cẩm Nang Điều Tra Toàn Diện Phasmophobia — 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Oswald:wght@500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0d0a07; color: #e8ddc8; font-family: "Be Vietnam Pro", system-ui, sans-serif;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 10.2pt; line-height: 1.55; }
  .page { min-height: 286mm; padding: 16mm 15mm 12mm; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3, h4 { font-family: Oswald, "Be Vietnam Pro", sans-serif; letter-spacing: .02em; }
  code { font-family: Consolas, monospace; color: #f0b357; font-size: .92em; }
  hr { border: 0; border-top: 1px solid #3a3129; margin: 10px 0; }
  ul, ol { margin: 4px 0 8px; padding-left: 20px; }
  li { margin: 2px 0; }
  blockquote { border-left: 3px solid #9e1c1c; margin: 8px 0; padding: 2px 12px; color: #d8c9ad; background: #171310; border-radius: 0 6px 6px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 8.4pt; }
  th { background: #241c14; color: #f0b357; text-transform: uppercase; font-family: Oswald; font-weight: 500; letter-spacing: .06em; }
  th, td { border: 1px solid #382d23; padding: 4px 7px; text-align: left; }
  td { vertical-align: top; }
  p { margin: 6px 0; }
  .note { font-size: 9pt; color: #b7a588; }
  .cover { display: flex; flex-direction: column; justify-content: space-between;
    background: radial-gradient(ellipse at 50% -10%, #2a1109 0%, #0d0a07 70%); padding: 20mm 18mm; }
  .cover-top { font-family: Oswald; font-size: 14pt; letter-spacing: .5em; color: #9e1c1c; }
  .cover h1 { font-size: 44pt; line-height: 1.05; margin: 6mm 0 4mm; color: #f3e9d2; }
  .cover h1 em { color: #e04b2a; font-style: normal; }
  .cover .sub { font-size: 13pt; color: #c9b289; max-width: 130mm; }
  .cover-meta { font-family: Oswald; display: flex; gap: 10px; flex-wrap: wrap; }
  .cover-meta span { border: 1px solid #4a3b28; border-radius: 999px; padding: 4px 14px; font-size: 9pt; letter-spacing: .15em; color: #d8c9ad; }
  .cover-foot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #3a3129; padding-top: 5mm; color: #8fab76; font-family: Oswald; letter-spacing: .2em; font-size: 9pt; }
  .toc h2 { color: #9e1c1c; font-size: 18pt; }
  .toc ol { columns: 2; }
  .toc li { margin: 3px 0; }
  .chapter h2 { font-size: 20pt; color: #f0b357; border-bottom: 2px solid #9e1c1c; padding-bottom: 4px; margin: 2px 0 10px; }
  .ch-num { color: #6b5b46; border: 0; font-size: 11pt; letter-spacing: .4em; margin: 0 0 2px; text-transform: uppercase; }
  .chapter h3 { color: #e8ddc8; font-size: 13pt; margin: 12px 0 4px; }
  .chapter h4 { color: #f0b357; font-size: 10.5pt; margin: 10px 0 2px; }
  .d-grid { column-count: 2; column-gap: 8mm; }
  .dossier { break-inside: avoid; background: linear-gradient(180deg, #17110b, #120d09); border: 1px solid #3a2f22; border-radius: 10px; padding: 5mm 5mm 4mm; margin: 0 0 6mm; }
  .d-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 4mm; border-bottom: 1px dashed #4a3b28; padding-bottom: 3mm; margin-bottom: 3mm; }
  .d-head h3 { margin: 0; font-size: 13.5pt; color: #f3e9d2; }
  .d-en { font-size: 8pt; color: #9b8a6e; }
  .danger { flex-shrink: 0; font-family: Oswald; font-size: 7.5pt; letter-spacing: .1em; border-radius: 999px; padding: 3px 9px; text-transform: uppercase; white-space: nowrap; }
  .d-low { color: #67d38b; background: #14251a; border: 1px solid #2c5e3e; }
  .d-mid { color: #f0b357; background: #2a2010; border: 1px solid #6b5320; }
  .d-high { color: #f87171; background: #2a1310; border: 1px solid #7a2e2e; }
  .d-stats { display: flex; gap: 3mm; }
  .d-stats div { flex: 1; background: #1e1710; border: 1px solid #32281c; border-radius: 6px; padding: 2mm 3mm; font-size: 8pt; }
  .d-stats span { display: block; color: #9b8a6e; text-transform: uppercase; font-size: 6.6pt; font-family: Oswald; letter-spacing: .1em; }
  .d-stats b { font-family: Oswald; font-size: 11pt; color: #f0b357; }
  .d-ev { margin-top: 2.5mm; display: flex; flex-wrap: wrap; gap: 1.5mm; }
  .d-ev span { border: 1px solid #2c5e5e; color: #7fd4d4; background: #0f1f20; border-radius: 4px; padding: 1.5px 7px; font-size: 8pt; }
  .d-ev .fake { border-color: #7a2e6e; color: #e08fd0; background: #200f1c; width: 100%; }
  .d-block { margin-top: 3mm; }
  .d-block h4 { margin: 0 0 1mm; font-size: 8.6pt; text-transform: uppercase; letter-spacing: .08em; color: #f0b357; }
  .d-block p { margin: 0; font-size: 9pt; color: #ddd0b8; }
  .d-block.wk h4 { color: #7fd48f; }
  .d-block.deep { border-left: 2px solid #9e1c1c; padding-left: 3mm; }
  .deep h4 { color: #e0776f; }
  .tool { break-inside: avoid; background: #151009; border: 1px solid #32281c; border-radius: 8px; padding: 3mm 4mm; margin: 4px 0; }
  .tool h3 { margin: 0 0 2px; font-size: 11pt; color: #f0b357; }
  .tool small { font-family: "Be Vietnam Pro"; font-weight: 400; font-size: 8pt; color: #9b8a6e; }
  .tier { font-size: 8.6pt; color: #cbbb9e; padding: 1px 0; }
  .tarot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm; }
  .tarot { display: flex; gap: 3mm; background: #151009; border: 1px solid #3a2f22; border-radius: 8px; padding: 3mm; break-inside: avoid; }
  .tarot img { width: 22mm; height: 30mm; object-fit: cover; border-radius: 5px; }
  .tarot b { font-family: Oswald; color: #f0b357; font-size: 10pt; }
  .tarot span { display: block; font-size: 7.5pt; color: #9b8a6e; }
  .tarot p { margin: 1px 0 0; font-size: 8.4pt; }
</style></head><body>

<section class="page cover">
  <div>
    <div class="cover-top">PHASMOPHOBIA • FIELD MANUAL</div>
    <h1>CẨM NANG<br>ĐIỀU TRA <em>TOÀN DIỆN</em></h1>
    <div class="sub">Sổ tay khoa học của thợ săn ma: 30 hồ sơ mật đầy đủ, bảng ngưỡng Sanity hunt, telemetry vận tốc bước chân, hệ thống bằng chứng &amp; kỹ năng bắt thóp 0-evidence.</div>
  </div>
  <div>
    <div class="cover-meta"><span>30 LOÀI MA</span><span>7 BẰNG CHỨNG</span><span>10 LÁ TAROT</span><span>15 BẢN ĐỒ</span><span>EDITION 2026</span></div>
    <div class="cover-foot"><span>PHASMO-INVESTIGATION ARCHIVE</span><span>VOL. 01 — VIETSUB</span></div>
  </div>
</section>

<section class="page toc">
  <h2>Mục lục</h2>
  <ol>
    <li>Hệ thống 7 loại bằng chứng</li>
    <li>Ma trận tổng hợp 30 loài ma</li>
    <li>30 hồ sơ mật (dossier đầy đủ)</li>
    ${["Chuyên đề đặc biệt", "Kỹ thuật 0-evidence", "Độ khó & bản đồ điều tra", "Vật phẩm nguyền rủa", "Trang bị & dụng cụ điều tra", "Câu thoại & thuật ngữ Anh–Việt"].map(t => `<li>${esc(t)}</li>`).join("")}
  </ol>
  <hr>
  <p class="note">Tài liệu biên tập từ dữ liệu game bản cập nhật 2026 — mọi con số đối chiếu trực tiếp với nguồn trong ứng dụng.</p>
</section>

${ch("CHƯƠNG 01", "Hệ Thống 7 Loại Bằng Chứng", mdToHtml(S[keyOf(/B[ẨA]NG CH[ỨU]NG/i)] || ""))}
${ch("CHƯƠNG 02", "Ma Trận Tổng Hợp 30 Loài Ma", mdToHtml(S[keyOf(/MA TR/i)] || ""))}
<section class="page chapter"><h2 class="ch-num">CHƯƠNG 03</h2><h2>30 Hồ Sơ Mật — Dossier Đầy Đủ</h2>
  <div class="d-grid">${ghosts.map(ghostCard).join("")}</div>
</section>
${ch("CHƯƠNG 04", "Chuyên Đề Đặc Biệt: Những Con Ma Tránh Khó Nhất", mdToHtml(S[keyOf(/D[ỘR]? BI[ỆE]?T|Y?MA L[ỘI]?A/i)] || ""))}
${ch("CHƯƠNG 05", "Kỹ Thuật Nhận Diện Ma Không Cần Bằng Chứng (0-Evidence)", mdToHtml(S[keyOf(/0-EVIDENCE/i)] || ""))}
${ch("CHƯƠNG 06", "Độ Khó &amp; Bản Đồ Điều Tra", diffTable + (ref.maps_note ? `<p class="note">${esc(ref.maps_note)}</p>` : "") + `<ul>${mapList}</ul>`)}
${ch("CHƯƠNG 07", "Vật Phẩm Nguyền Rủa (Cursed Possessions)", `<h3>Bộ Bài Tarot Ma Quái — 10 lá &amp; màu lửa</h3><div class="tarot-grid">${tarotGrid}</div><h3>Các vật phẩm nguyền rủa còn lại</h3>${cursedList}`)}
${ch("CHƯƠNG 08", "Trang Bị &amp; Dụng Cụ Điều Tra", toolList)}
${ch("CHƯƠNG 09", "Câu Thoại Nhận Diện &amp; Thuật Ngữ Anh—Việt", voiceHtml + mdToHtml((S[keyOf(/THU.R NG/i)] || "")))}

</body></html>`;

const outFile = path.join(OUT_DIR, "sach_cam_nang_phasmo.html");
fs.writeFileSync(outFile, html);
console.log("HTML:", outFile, (html.length / 1024).toFixed(0) + " KB");
