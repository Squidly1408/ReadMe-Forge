// =====================================================================
// LOGO & BANNER STUDIO
// Canvas-based generator for a project logo and a README / social banner.
// =====================================================================
import { $, $$, LS, lum, hexA, toast, openM, closeM, isOpen, saveFile, dataURLtoBlob } from "./util.js";

const PALETTES = [
  ["#6EE7B7", "#3B82F6"], ["#F97316", "#DB2777"], ["#7C3AED", "#C026D3"], ["#0EA5E9", "#1E3A8A"], ["#22D3EE", "#A3E635"],
  ["#0F172A", "#334155"], ["#14532D", "#65A30D"], ["#FDE68A", "#FCA5A5"], ["#111111", "#2B2B2B"], ["#F43F5E", "#FB923C"], ["#E0E7FF", "#C7D2FE"], ["#064E3B", "#0F766E"],
];

const ST = Object.assign({
  logoMode: "gen", upload: null, uploadType: null, pad: false, padColor: "#ffffff", padShape: "rounded",
  lgText: "", lgShape: "rounded", lgC1: PALETTES[0][0], lgC2: PALETTES[0][1], lgFg: "#ffffff", lgFont: "800 |Inter", lgShine: true,
  bnSize: "1280x640", bnLayout: "left", bnTitle: "", bnTag: "", bnC1: "#0F172A", bnC2: "#334155", bnFg: "#ffffff",
  bnBg: "linear", bnPat: "dots", bnFont: "800 |Inter", bnLogoSize: 100, bnRepo: true, bnRound: false,
}, LS.get("studio", {}));
ST.upload = LS.get("logoUpload", null);
const saveST = () => { const { upload: _u, ...rest } = ST; LS.set("studio", rest); };

let app;              // { S, persistAssets, afterLogo(), afterBanner() }
let logoImg = null;   // the image used on the banner (current project logo)
let uploadImg = null;

const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function fontStr(f, px) { const [w, fam] = f.split("|"); return `${w.trim()} ${px}px "${fam}", Inter, sans-serif`; }
async function ensureFont(f) { try { await document.fonts.load(fontStr(f, 40)); } catch { /* ignore */ } }

function shapePath(ctx, shape, x, y, w, h) {
  ctx.beginPath();
  const cx = x + w / 2, cy = y + h / 2;
  if (shape === "circle") ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
  else if (shape === "hex") { for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; ctx[i ? "lineTo" : "moveTo"](cx + w / 2 * Math.cos(a), cy + h / 2 * Math.sin(a)); } ctx.closePath(); }
  else if (shape === "squircle") { const n = 4.5, steps = 120; for (let i = 0; i <= steps; i++) { const t = i / steps * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); ctx[i ? "lineTo" : "moveTo"](cx + w / 2 * Math.sign(c) * Math.abs(c) ** (2 / n), cy + h / 2 * Math.sign(s) * Math.abs(s) ** (2 / n)); } ctx.closePath(); }
  else if (shape === "blob") {
    const pts = 8, r = w / 2; const P = [];
    for (let i = 0; i < pts; i++) { const a = Math.PI * 2 * i / pts; const rr = r * (0.86 + 0.12 * Math.sin(i * 2.3 + 1)); P.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    ctx.moveTo((P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2);
    for (let i = 1; i <= pts; i++) { const p = P[i % pts], q = P[(i + 1) % pts]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    ctx.closePath();
  }
  else if (shape === "square") ctx.rect(x, y, w, h);
  else ctx.roundRect(x, y, w, h, w * 0.22);
}

// ---------------- logo ----------------
function swatches(box, key1, key2, onPick) {
  box.innerHTML = "";
  PALETTES.forEach(([a, b]) => {
    const s = document.createElement("button"); s.type = "button";
    s.className = "sw" + (ST[key1] === a && ST[key2] === b ? " on" : "");
    s.title = `${a} → ${b}`;
    s.style.background = `linear-gradient(135deg,${a},${b})`;
    s.onclick = () => { ST[key1] = a; ST[key2] = b; onPick(); };
    box.appendChild(s);
  });
}
function optGroup(id, key, cb) {
  const box = $("#" + id);
  $$(".opt", box).forEach(o => {
    o.classList.toggle("on", o.dataset.v === String(ST[key]));
    o.onclick = () => { ST[key] = o.dataset.v; $$(".opt", box).forEach(x => x.classList.toggle("on", x === o)); cb(); };
  });
}
function initials(n) { const w = (n || "R").trim().split(/[\s_-]+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "R").slice(0, 2)).toUpperCase(); }

function syncLogoUI() {
  $$("#logoMode .opt").forEach(o => o.classList.toggle("on", o.dataset.m === ST.logoMode));
  $("#logoUpload").style.display = ST.logoMode === "upload" ? "grid" : "none";
  $("#logoGen").style.display = ST.logoMode === "gen" ? "grid" : "none";
  $("#logoDropInner").innerHTML = ST.upload ? `<img src="${ST.upload}" alt=""><span>Replace logo</span>` : "Drop a PNG, SVG, JPG or WebP here<br>or click to choose";
  $("#logoPad").checked = ST.pad; $("#logoPadOpts").style.display = ST.pad ? "flex" : "none";
  $("#logoPadColor").value = ST.padColor; $("#logoPadShape").value = ST.padShape;
  if (!ST.lgText) ST.lgText = initials(app.S.project.name);
  $("#lgText").value = ST.lgText; $("#lgC1").value = ST.lgC1; $("#lgC2").value = ST.lgC2; $("#lgFg").value = ST.lgFg; $("#lgFont").value = ST.lgFont; $("#lgShine").checked = ST.lgShine;
  swatches($("#lgPal"), "lgC1", "lgC2", () => { syncLogoUI(); drawLogo(); });
  optGroup("lgShape", "lgShape", drawLogo);
  $("#logoPathNote").textContent = app.S.logoPath;
}

async function drawLogo() {
  saveST();
  const c = $("#logoCanvas"), ctx = c.getContext("2d"), W = 512;
  ctx.clearRect(0, 0, W, W);
  if (ST.logoMode === "upload") {
    if (!uploadImg) {
      ctx.fillStyle = "#1b1e25"; shapePath(ctx, "rounded", 56, 56, 400, 400); ctx.fill();
      ctx.fillStyle = "#6a7180"; ctx.font = "600 26px Inter"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Upload a logo", W / 2, W / 2); return;
    }
    let inset = 0;
    if (ST.pad) { ctx.fillStyle = ST.padColor; shapePath(ctx, ST.padShape, 0, 0, W, W); ctx.fill(); inset = ST.padShape === "circle" ? 110 : 76; }
    const box = W - inset * 2, r = Math.min(box / uploadImg.width, box / uploadImg.height);
    const w = uploadImg.width * r, h = uploadImg.height * r;
    ctx.drawImage(uploadImg, (W - w) / 2, (W - h) / 2, w, h);
    return;
  }
  await ensureFont(ST.lgFont);
  const g = ctx.createLinearGradient(0, 0, W, W); g.addColorStop(0, ST.lgC1); g.addColorStop(1, ST.lgC2);
  ctx.save(); shapePath(ctx, ST.lgShape, 16, 16, W - 32, W - 32); ctx.fillStyle = g; ctx.fill(); ctx.clip();
  if (ST.lgShine) { const s = ctx.createRadialGradient(W * .3, W * .2, 10, W * .3, W * .2, W * .7); s.addColorStop(0, "rgba(255,255,255,.35)"); s.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = s; ctx.fillRect(0, 0, W, W); }
  ctx.restore();
  const t = ST.lgText || "R"; let px = t.length <= 1 ? 280 : t.length === 2 ? 220 : t.length === 3 ? 160 : 124;
  ctx.font = fontStr(ST.lgFont, px); while (ctx.measureText(t).width > W * .72 && px > 40) { px -= 6; ctx.font = fontStr(ST.lgFont, px); }
  ctx.fillStyle = ST.lgFg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.18)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  const m = ctx.measureText(t); const yAdj = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  ctx.textBaseline = "alphabetic"; ctx.fillText(t, W / 2, W / 2 + yAdj);
  ctx.shadowColor = "transparent";
}

async function handleLogoFile(file) {
  if (!file || !/^image\//.test(file.type)) { toast("Please choose an image file", true); return; }
  if (file.size > 4 * 1024 * 1024) { toast("That image is over 4 MB — try a smaller one", true); return; }
  const url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
  try { uploadImg = await loadImg(url); } catch { toast("Couldn't read that image", true); return; }
  ST.upload = url; ST.uploadType = file.type; ST.logoMode = "upload";
  LS.set("logoUpload", url); // may fail if too big to remember; that's fine
  syncLogoUI(); drawLogo();
}

function logoOutput() {
  // Keep an uploaded SVG as SVG (crisp on GitHub) unless padding was added.
  if (ST.logoMode === "upload" && ST.upload && ST.uploadType === "image/svg+xml" && !ST.pad) return { path: "assets/logo.svg", url: ST.upload };
  if (ST.logoMode === "upload" && !uploadImg) return null;
  return { path: "assets/logo.png", url: $("#logoCanvas").toDataURL("image/png") };
}

async function useLogo() {
  const o = logoOutput(); if (!o) { toast("Upload or generate a logo first", true); return false; }
  const { S } = app;
  delete S.assets["assets/logo.png"]; delete S.assets["assets/logo.svg"];
  S.assets[o.path] = o.url; S.logoPath = o.path; app.persistAssets();
  logoImg = await loadImg(o.url);
  app.afterLogo();
  $("#logoPathNote").textContent = S.logoPath;
  toast("Logo set — it's now used in your README" + (o.path.endsWith("svg") ? " (kept as SVG)" : ""));
  return true;
}

// ---------------- banner ----------------
function syncBannerUI() {
  const { S } = app;
  if (!ST.bnTitle) ST.bnTitle = S.project.name;
  if (!ST.bnTag) ST.bnTag = S.project.tagline;
  $("#bnTitle").value = ST.bnTitle; $("#bnTag").value = ST.bnTag;
  $("#bnC1").value = ST.bnC1; $("#bnC2").value = ST.bnC2; $("#bnFg").value = ST.bnFg; $("#bnFont").value = ST.bnFont;
  $("#bnLogoSize").value = ST.bnLogoSize; $("#bnRepo").checked = ST.bnRepo; $("#bnRound").checked = ST.bnRound;
  swatches($("#bnPal"), "bnC1", "bnC2", () => { ST.bnFg = lum(ST.bnC1) * .5 + lum(ST.bnC2) * .5 > .5 ? "#111111" : "#ffffff"; syncBannerUI(); drawBanner(); });
  ["bnSize", "bnLayout", "bnBg", "bnPat"].forEach(k => optGroup(k, k, drawBanner));
}
function wrapLines(ctx, text, maxW, maxLines) {
  const words = text.split(/\s+/); const lines = []; let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const keep = lines.slice(0, maxLines); let last = keep[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length) last = last.slice(0, -1);
    keep[maxLines - 1] = last + "…"; return keep;
  }
  return lines;
}
function drawPattern(ctx, W, H, kind, fg) {
  ctx.save();
  const col = lum(fg) > .5 ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.08)";
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  if (kind === "dots") { for (let y = 16; y < H; y += 28) for (let x = 16; x < W; x += 28) { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); } }
  else if (kind === "grid") { ctx.beginPath(); for (let x = 0; x < W; x += 48) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y < H; y += 48) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); }
  else if (kind === "diag") { ctx.beginPath(); for (let x = -H; x < W; x += 26) { ctx.moveTo(x, H); ctx.lineTo(x + H, 0); } ctx.stroke(); }
  else if (kind === "rings") { ctx.lineWidth = 2; for (let r = 60; r < W * 1.2; r += 60) { ctx.beginPath(); ctx.arc(W * .92, H * .1, r, 0, 7); ctx.stroke(); } }
  else if (kind === "noise") { const id = ctx.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 26; d[i] += n; d[i + 1] += n; d[i + 2] += n; } ctx.putImageData(id, 0, 0); }
  ctx.restore();
}
function drawLogoOn(ctx, cx, cy, size) {
  if (!logoImg) return;
  const r = Math.min(size / logoImg.width, size / logoImg.height); const w = logoImg.width * r, h = logoImg.height * r;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = size * .12; ctx.shadowOffsetY = size * .04;
  ctx.drawImage(logoImg, cx - w / 2, cy - h / 2, w, h); ctx.restore();
}

async function drawBanner() {
  saveST();
  const { S } = app;
  const [W, H] = ST.bnSize.split("x").map(Number);
  const c = $("#bannerCanvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  await ensureFont(ST.bnFont);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (ST.bnRound) { ctx.beginPath(); ctx.roundRect(0, 0, W, H, Math.min(W, H) * .07); ctx.clip(); }
  // background
  if (ST.bnBg === "solid") ctx.fillStyle = ST.bnC1;
  else if (ST.bnBg === "radial") { const g = ctx.createRadialGradient(W * .25, H * .3, 0, W * .25, H * .3, W * .9); g.addColorStop(0, ST.bnC2); g.addColorStop(1, ST.bnC1); ctx.fillStyle = g; }
  else { const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, ST.bnC1); g.addColorStop(1, ST.bnC2); ctx.fillStyle = g; }
  ctx.fillRect(0, 0, W, H);
  if (ST.bnBg === "mesh") {
    [[.15, .2, ST.bnC2, .55], [.85, .85, ST.bnC2, .45], [.7, .15, ST.bnC1, .5]].forEach(([x, y, col, a]) => {
      const g = ctx.createRadialGradient(W * x, H * y, 0, W * x, H * y, W * .5); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  }
  if (ST.bnPat !== "none") drawPattern(ctx, W, H, ST.bnPat, ST.bnFg);
  // content
  const fg = ST.bnFg, hasLogo = logoImg && ST.bnLayout !== "text", scale = ST.bnLogoSize / 100;
  const short = H / W < 0.3;
  const pad = W * .07;
  ctx.fillStyle = fg; ctx.textBaseline = "alphabetic";
  const repoTxt = ST.bnRepo && S.project.user && S.project.repo ? `github.com/${S.project.user}/${S.project.repo}` : "";
  if (ST.bnLayout === "logo") {
    if (logoImg) drawLogoOn(ctx, W / 2, H / 2, H * .55 * scale);
  } else if (ST.bnLayout === "center") {
    const ls = hasLogo ? H * (short ? .42 : .26) * scale : 0;
    let titlePx = H * (short ? .2 : .12); const tagPx = titlePx * .38;
    ctx.font = fontStr(ST.bnFont, titlePx); while (ctx.measureText(ST.bnTitle).width > W * .84 && titlePx > 16) { titlePx -= 2; ctx.font = fontStr(ST.bnFont, titlePx); }
    ctx.font = `500 ${tagPx}px Inter, sans-serif`; const tagLines = short ? [] : wrapLines(ctx, ST.bnTag, W * .7, 2);
    const gap = H * .04;
    const total = (hasLogo ? ls + gap : 0) + titlePx + (tagLines.length ? gap * .7 + tagLines.length * tagPx * 1.35 : 0);
    let y = (H - total) / 2 - (repoTxt && !short ? H * .03 : 0);
    if (short && hasLogo) { // short banners: logo + title on one line
      ctx.font = fontStr(ST.bnFont, titlePx); const tw = ctx.measureText(ST.bnTitle).width; const lsz = H * .42 * scale; const tot = lsz + H * .08 + tw;
      drawLogoOn(ctx, (W - tot) / 2 + lsz / 2, H / 2, lsz);
      ctx.textAlign = "left"; ctx.fillStyle = fg; ctx.fillText(ST.bnTitle, (W - tot) / 2 + lsz + H * .08, H / 2 + titlePx * .35);
    } else {
      if (hasLogo) { drawLogoOn(ctx, W / 2, y + ls / 2, ls); y += ls + gap; }
      ctx.textAlign = "center"; ctx.fillStyle = fg; ctx.font = fontStr(ST.bnFont, titlePx); ctx.fillText(ST.bnTitle, W / 2, y + titlePx * .8); y += titlePx + gap * .7;
      ctx.font = `500 ${tagPx}px Inter, sans-serif`; ctx.globalAlpha = .82; tagLines.forEach((l, i) => ctx.fillText(l, W / 2, y + tagPx + i * tagPx * 1.35)); ctx.globalAlpha = 1;
    }
  } else { // left / text
    const ls = hasLogo ? H * (short ? .56 : .38) * scale : 0;
    const textX = pad + (hasLogo ? ls + W * .045 : 0), maxW = W - textX - pad;
    let titlePx = H * (short ? .22 : .13); const tagPx = Math.max(14, titlePx * .36);
    ctx.font = fontStr(ST.bnFont, titlePx); let tLines = wrapLines(ctx, ST.bnTitle, maxW, 2);
    while (tLines.some(l => ctx.measureText(l).width > maxW) && titlePx > 16) { titlePx -= 2; ctx.font = fontStr(ST.bnFont, titlePx); tLines = wrapLines(ctx, ST.bnTitle, maxW, 2); }
    ctx.font = `500 ${tagPx}px Inter, sans-serif`; const tagLines = wrapLines(ctx, ST.bnTag, maxW, short ? 1 : 3);
    const th = tLines.length * titlePx * 1.08, gh = tagLines.length ? H * .035 + tagLines.length * tagPx * 1.4 : 0;
    let y = (H - th - gh) / 2;
    if (hasLogo) drawLogoOn(ctx, pad + ls / 2, H / 2, ls);
    ctx.textAlign = "left"; ctx.fillStyle = fg; ctx.font = fontStr(ST.bnFont, titlePx);
    tLines.forEach((l, i) => ctx.fillText(l, textX, y + titlePx * .82 + i * titlePx * 1.08)); y += th + H * .035;
    ctx.font = `500 ${tagPx}px Inter, sans-serif`; ctx.globalAlpha = .82; tagLines.forEach((l, i) => ctx.fillText(l, textX, y + tagPx * .9 + i * tagPx * 1.4)); ctx.globalAlpha = 1;
  }
  if (repoTxt && !short) {
    const px = Math.round(H * .032); ctx.font = `600 ${px}px "JetBrains Mono", monospace`;
    const tw = ctx.measureText(repoTxt).width, ph = px * 2, pw = tw + px * 3.2;
    const x = ST.bnLayout === "center" || ST.bnLayout === "logo" ? (W - pw) / 2 : W - pad - pw, y = H - pad * .55 - ph;
    ctx.fillStyle = lum(fg) > .5 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)"; ctx.beginPath(); ctx.roundRect(x, y, pw, ph, ph / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.globalAlpha = .9; ctx.textAlign = "left"; ctx.fillText(repoTxt, x + px * 1.6, y + ph / 2 + px * .36); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// dominant colours from the logo
function logoPalette(img) {
  const c = document.createElement("canvas"); c.width = c.height = 48; const x = c.getContext("2d");
  x.drawImage(img, 0, 0, 48, 48); const d = x.getImageData(0, 0, 48, 48).data; const buckets = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue;
    const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx ? (mx - mn) / mx : 0; if (mx > 240 && sat < .1) continue; if (mx < 18) continue;
    const k = (r >> 5) + "," + (g >> 5) + "," + (b >> 5);
    const o = buckets[k] || (buckets[k] = { n: 0, r: 0, g: 0, b: 0, sat: 0 }); o.n++; o.r += r; o.g += g; o.b += b; o.sat += sat;
  }
  const list = Object.values(buckets).map(o => ({ n: o.n * (0.5 + o.sat / o.n), c: [o.r / o.n, o.g / o.n, o.b / o.n] })).sort((a, b) => b.n - a.n);
  const hex = c => "#" + c.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  if (!list.length) return null;
  const a = list[0].c; const b = (list.find(o => Math.hypot(o.c[0] - a[0], o.c[1] - a[1], o.c[2] - a[2]) > 70) || { c: a.map(v => v * .55) }).c;
  return [hex(a.map(v => v * .55)), hex(b)]; // darken the first stop a bit so text pops
}

function switchStudio(which) {
  $$("#stTabs button").forEach(b => b.classList.toggle("on", b.dataset.st === which));
  $("#stLogo").style.display = which === "logo" ? "grid" : "none";
  $("#stBanner").style.display = which === "banner" ? "grid" : "none";
  if (which === "logo") { syncLogoUI(); drawLogo(); } else { syncBannerUI(); drawBanner(); }
}

export function openStudio(which) { openM("mStudio"); switchStudio(which || "logo"); }

/** Wire up the studio. `ctx` = { S, persistAssets, afterLogo, afterBanner }. */
export async function initStudio(ctx) {
  app = ctx;
  const { S } = app;

  // logo controls
  $("#logoFile").onchange = e => handleLogoFile(e.target.files[0]);
  const drop = $("#logoDrop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => handleLogoFile(e.dataTransfer.files[0]));
  $("#logoMode").onclick = e => { const o = e.target.closest(".opt"); if (!o) return; ST.logoMode = o.dataset.m; syncLogoUI(); drawLogo(); };
  $("#logoPad").onchange = e => { ST.pad = e.target.checked; syncLogoUI(); drawLogo(); };
  $("#logoPadColor").oninput = e => { ST.padColor = e.target.value; drawLogo(); };
  $("#logoPadShape").onchange = e => { ST.padShape = e.target.value; drawLogo(); };
  $("#lgText").oninput = e => { ST.lgText = e.target.value; drawLogo(); };
  ["lgC1", "lgC2", "lgFg"].forEach(k => $("#" + k).oninput = e => { ST[k] = e.target.value; $$("#lgPal .sw").forEach(s => s.classList.remove("on")); drawLogo(); });
  $("#lgFont").onchange = e => { ST.lgFont = e.target.value; drawLogo(); };
  $("#lgShine").onchange = e => { ST.lgShine = e.target.checked; drawLogo(); };
  $("#logoUse").onclick = useLogo;
  $("#logoDl").onclick = () => { const o = logoOutput(); if (!o) { toast("Upload or generate a logo first", true); return; } saveFile(o.path.split("/")[1], dataURLtoBlob(o.url)); };
  $("#logoToBanner").onclick = async () => { if (!S.assets[S.logoPath] && !(await useLogo())) return; switchStudio("banner"); };

  // banner controls
  $("#bnMatch").onclick = () => {
    if (!logoImg) { toast("Set a project logo first (step 1)", true); return; }
    const p = logoPalette(logoImg); if (!p) { toast("Couldn't find colours in that logo", true); return; }
    ST.bnC1 = p[0]; ST.bnC2 = p[1]; ST.bnFg = (lum(p[0]) + lum(p[1])) / 2 > .45 ? "#111111" : "#ffffff"; ST.bnBg = ST.bnBg === "solid" ? "mesh" : ST.bnBg;
    syncBannerUI(); drawBanner();
  };
  $("#bnTitle").oninput = e => { ST.bnTitle = e.target.value; drawBanner(); };
  $("#bnTag").oninput = e => { ST.bnTag = e.target.value; drawBanner(); };
  ["bnC1", "bnC2", "bnFg"].forEach(k => $("#" + k).oninput = e => { ST[k] = e.target.value; $$("#bnPal .sw").forEach(s => s.classList.remove("on")); drawBanner(); });
  $("#bnFont").onchange = e => { ST.bnFont = e.target.value; drawBanner(); };
  $("#bnLogoSize").oninput = e => { ST.bnLogoSize = +e.target.value; drawBanner(); };
  $("#bnRepo").onchange = e => { ST.bnRepo = e.target.checked; drawBanner(); };
  $("#bnRound").onchange = e => { ST.bnRound = e.target.checked; drawBanner(); };
  $("#bnUse").onclick = () => {
    S.assets["assets/banner.png"] = $("#bannerCanvas").toDataURL("image/png"); app.persistAssets();
    app.afterBanner(); closeM("mStudio");
    toast("Banner added. Download the .zip to get assets/banner.png with your README.");
  };
  $("#bnDl").onclick = () => $("#bannerCanvas").toBlob(b => saveFile((S.project.repo || "banner") + "-banner.png", b), "image/png");

  $("#stTabs").onclick = e => { const b = e.target.closest("button"); if (b) switchStudio(b.dataset.st); };

  // restore images from a previous visit
  if (ST.upload) { try { uploadImg = await loadImg(ST.upload); } catch { /* ignore */ } }
  if (S.assets[S.logoPath]) { try { logoImg = await loadImg(S.assets[S.logoPath]); } catch { /* ignore */ } }
  if (document.fonts) document.fonts.ready.then(() => { if (isOpen("mStudio")) { drawLogo(); drawBanner(); } });
}
