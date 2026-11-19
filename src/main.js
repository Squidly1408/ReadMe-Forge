import "./styles.css";
import { marked } from "marked";
import DOMPurify from "dompurify";
import JSZip from "jszip";
import { LIB, BUILTINS } from "./library.js";
import { shieldFromURL } from "./shields.js";
import { initStudio, openStudio } from "./studio.js";
import {
  $, $$, uid, esc, clone, LS, toast, openM, closeM, isOpen, confirmBox,
  saveFile, copyText, dataURLtoBlob,
} from "./util.js";

const MOBILE = () => innerWidth <= 980;

// ---------- state ----------
const S = {
  project: Object.assign({ name: "Awesome Project", tagline: "A short, punchy description of what this project does and who it's for.", user: "your-username", repo: "awesome-project", author: "Your Name", license: "MIT" }, LS.get("project", {})),
  custom: LS.get("templates", []),          // user-created templates
  draft: LS.get("draft", null),
  assets: LS.get("assets", {}),             // path -> dataURL
  logoPath: LS.get("logoPath", "assets/logo.png"),
  view: "preview", theme: LS.get("pvTheme", "light"),
};

function draftFromTemplate(t) {
  return {
    sourceId: t.id, sourceName: t.name, dirty: false, selected: null,
    sections: t.sections.map(s => ({ id: uid(), key: s.key, title: s.title, md: s.md, base: s.md })),
  };
}
if (!S.draft) S.draft = draftFromTemplate(BUILTINS[1]);
if (S.draft.selected == null && S.draft.sections[0]) S.draft.selected = S.draft.sections[0].id;

const allTemplates = () => [...S.custom, ...BUILTINS];
const findTemplate = id => allTemplates().find(t => t.id === id);

let saveTimer;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { LS.set("draft", S.draft); LS.set("project", S.project); }, 300);
}
function persistAssets() {
  if (!LS.set("assets", S.assets)) toast("Images are too large to remember in this browser — download them before leaving.", true);
  LS.set("logoPath", S.logoPath);
}
function markDirty() { S.draft.dirty = true; renderChip(); persist(); }

// ---------- modals ----------
$$(".scrim").forEach(sc => {
  sc.addEventListener("mousedown", e => { if (e.target === sc && sc.id !== "mConfirm") sc.classList.remove("open"); });
  $$("[data-close]", sc).forEach(b => b.onclick = () => sc.classList.remove("open"));
});

// ---------- tokens & markdown build ----------
function tokenMap() {
  const p = S.project;
  return {
    name: p.name, tagline: p.tagline, user: p.user, repo: p.repo, author: p.author, license: p.license,
    licenseBadge: encodeURIComponent(p.license.replace(/-/g, "--").replace(/_/g, "__")),
    year: String(new Date().getFullYear()), logo: "./" + S.logoPath, banner: "./assets/banner.png",
  };
}
function applyTokens(md) {
  const m = tokenMap();
  return md.replace(/\{\{\s*(\w+)\s*\}\}/g, (all, k) => (k in m ? m[k] : all));
}
function ghSlug(t) {
  return t.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s/g, "-");
}
/** Each section's final markdown (tokens applied, auto-TOC filled in). */
function buildParts() {
  const parts = S.draft.sections.map(s => ({ id: s.id, md: applyTokens(s.md).trim() }));
  const heads = [];
  parts.forEach(({ md }) => {
    if (/<!--\s*auto-toc/.test(md)) return;
    const stripped = md.replace(/~~~[\s\S]*?~~~|```[\s\S]*?```/g, "");
    for (const m of stripped.matchAll(/^##\s+(.+?)\s*#*$/gm)) heads.push(m[1]);
  });
  const toc = heads.map(h => `- [${h.replace(/[[\]]/g, "")}](#${ghSlug(h)})`).join("\n");
  parts.forEach(p => { p.md = p.md.replace(/<!--\s*auto-toc[^>]*-->/, toc || "_Add sections with `##` headings to fill this in._"); });
  return parts;
}
const buildMarkdown = () => buildParts().map(p => p.md).join("\n\n") + "\n";

// ---------- preview ----------
let pvTimer;
function schedulePreview() { clearTimeout(pvTimer); pvTimer = setTimeout(renderPreview, 120); }

function mdToHtml(md) {
  let html;
  try { html = marked.parse(md, { gfm: true, headerIds: true, headerPrefix: "", mangle: false }); }
  catch { html = "<pre>" + esc(md) + "</pre>"; }
  return DOMPurify.sanitize(html, { ADD_ATTR: ["align", "target"] });
}

function renderPreview() {
  const wrap = $("#pvWrap");
  wrap.classList.toggle("dark", S.theme === "dark");
  if (S.view === "raw") { wrap.innerHTML = `<pre class="raw"></pre>`; wrap.firstChild.textContent = buildMarkdown(); return; }
  if (!wrap.querySelector("#preview")) wrap.innerHTML = `<div class="md" id="preview"></div>`;
  const el = $("#preview");
  const parts = buildParts();
  if (!parts.length) {
    el.innerHTML = `<div class="pv-empty">Your README is empty.<br>Add a section from the list on the left, or pick a template.</div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  parts.forEach(p => {
    const d = document.createElement("div");
    d.className = "pv-sec" + (p.id === S.draft.selected ? " cur" : "");
    d.dataset.id = p.id;
    d.innerHTML = mdToHtml(p.md);
    const tag = document.createElement("span"); tag.className = "pv-tag"; tag.textContent = "Click to edit";
    d.appendChild(tag);
    frag.appendChild(d);
  });
  el.replaceChildren(frag);

  $$("h1,h2,h3,h4", el).forEach(h => { if (!h.id) h.id = ghSlug(h.textContent); });
  $$("img", el).forEach(img => {
    const src = img.getAttribute("src") || "";
    const key = src.replace(/^\.?\//, "");
    if (S.assets[key]) { img.src = S.assets[key]; return; }
    if (/^https?:/i.test(src)) {
      // Remote images load normally; if they fail, fall back to a local badge or a placeholder.
      img.addEventListener("error", () => {
        const b = shieldFromURL(src, S.project.license);
        if (b) { img.src = b; return; }
        const ph = document.createElement("span"); ph.className = "remote-ph";
        ph.textContent = "🌐 " + (img.alt || "remote image") + " — couldn't load here";
        ph.title = src; img.replaceWith(ph);
      }, { once: true });
      return;
    }
    if (/^data:/.test(src)) return;
    const ph = document.createElement("span"); ph.className = "missing-asset";
    ph.textContent = (img.alt || "image") + " → " + key;
    ph.title = "Add this file to your repo at " + key;
    if (key === "assets/banner.png" || key === S.logoPath) {
      ph.style.cursor = "pointer"; ph.textContent += " (click to create)";
      ph.onclick = e => { e.stopPropagation(); openStudio(key === "assets/banner.png" ? "banner" : "logo"); };
    }
    img.replaceWith(ph);
  });
  $$("a", el).forEach(a => {
    const h = a.getAttribute("href") || "";
    if (!h.startsWith("#")) { a.target = "_blank"; a.rel = "noopener"; }
  });
}

// One delegated handler: in-page anchors scroll, links open, anything else selects the section.
$("#pvWrap").addEventListener("click", e => {
  const a = e.target.closest("a");
  if (a) {
    const h = a.getAttribute("href") || "";
    if (h.startsWith("#")) {
      e.preventDefault();
      const t = $("#preview").querySelector("#" + CSS.escape(decodeURIComponent(h.slice(1))));
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }
  if (e.target.closest("summary")) return; // let <details> toggle
  const sec = e.target.closest(".pv-sec");
  if (sec) { select(sec.dataset.id, { scrollPreview: false }); if (MOBILE()) showCol(1); else ed.focus(); }
});

function highlightPreview(scroll) {
  const el = $("#preview"); if (!el) return;
  let cur = null;
  $$(".pv-sec", el).forEach(d => { const on = d.dataset.id === S.draft.selected; d.classList.toggle("cur", on); if (on) cur = d; });
  if (scroll && cur) cur.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

$("#viewSeg").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.view = b.dataset.v; $$("#viewSeg button").forEach(x => x.classList.toggle("on", x === b)); renderPreview(); };
$("#themeSeg").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.theme = b.dataset.t; LS.set("pvTheme", S.theme); syncThemeSeg(); renderPreview(); };
function syncThemeSeg() { $$("#themeSeg button").forEach(x => x.classList.toggle("on", x.dataset.t === S.theme)); }

// ---------- header chip ----------
function renderChip() {
  const d = S.draft, t = findTemplate(d.sourceId);
  const kind = t ? (t.builtin ? "built-in" : "my template") : "deleted template";
  $("#srcChip").innerHTML = `<span class="dot ${d.dirty ? "on" : ""}"></span>Based on <b>${esc(d.sourceName)}</b> <span style="color:var(--dim)">(${kind})</span>${d.dirty ? " · edited" : ""}`;
}

// ---------- section list ----------
const ICON = {
  grip: '<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>',
  reset: '<svg class="i" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  del: '<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg>',
  dup: '<svg class="i" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  up: '<svg class="i" viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
  down: '<svg class="i" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24" style="width:12px;height:12px"><path d="M5 12l5 5L20 7"/></svg>',
  pencil: '<svg class="i" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
};

function renderSections() {
  const ul = $("#secList"); ul.innerHTML = "";
  const n = S.draft.sections.length;
  $("#secCount").textContent = n ? `${n} section${n === 1 ? "" : "s"}` : "";
  if (!n) ul.innerHTML = `<li class="empty" style="padding:18px">No sections yet.<br>Add some below, or pick a template.</li>`;
  S.draft.sections.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "sec" + (s.id === S.draft.selected ? " sel" : "");
    li.draggable = true; li.dataset.id = s.id; li.tabIndex = 0;
    li.setAttribute("role", "button"); li.setAttribute("aria-label", `Edit ${s.title}`);
    const changed = s.base != null && s.md !== s.base;
    li.innerHTML = `<span class="grip" title="Drag to reorder">${ICON.grip}</span><span class="num">${i + 1}</span><span class="name">${esc(s.title)}</span>${changed ? '<span class="mod" title="Edited"></span>' : ""}
      <span class="acts">
        <button class="iconbtn" data-a="up" title="Move up (Alt+↑)" ${i === 0 ? "disabled" : ""}>${ICON.up}</button>
        <button class="iconbtn" data-a="down" title="Move down (Alt+↓)" ${i === n - 1 ? "disabled" : ""}>${ICON.down}</button>
        <button class="iconbtn" data-a="dup" title="Duplicate">${ICON.dup}</button>
        <button class="iconbtn" data-a="del" title="Remove">${ICON.del}</button>
      </span>`;
    li.onclick = e => {
      const a = e.target.closest("[data-a]");
      if (a) { e.stopPropagation(); if (!a.disabled) sectionAction(a.dataset.a, s.id); return; }
      select(s.id); if (MOBILE()) showCol(1);
    };
    li.onkeydown = e => {
      if (e.target !== li) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(s.id); ed.focus(); }
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); sectionAction("del", s.id); }
    };
    li.addEventListener("dragstart", e => { li.classList.add("dragging"); e.dataTransfer.setData("text/plain", s.id); e.dataTransfer.effectAllowed = "move"; });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));
    li.addEventListener("dragover", e => { e.preventDefault(); li.classList.add("drag-over"); });
    li.addEventListener("dragleave", () => li.classList.remove("drag-over"));
    li.addEventListener("drop", e => {
      e.preventDefault(); li.classList.remove("drag-over");
      const from = S.draft.sections.findIndex(x => x.id === e.dataTransfer.getData("text/plain"));
      if (from < 0 || from === i) return;
      const [m] = S.draft.sections.splice(from, 1);
      S.draft.sections.splice(S.draft.sections.findIndex(x => x.id === s.id) + (from < i ? 1 : 0), 0, m);
      markDirty(); renderSections(); schedulePreview();
    });
    ul.appendChild(li);
  });
  renderLibrary();
}

function moveSection(id, dir) {
  const arr = S.draft.sections, i = arr.findIndex(x => x.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  markDirty(); renderSections(); schedulePreview();
  const li = $(`.sec[data-id="${id}"]`);
  if (li && document.activeElement && document.activeElement.closest(".sec-list")) li.focus();
}

function sectionAction(a, id) {
  const idx = S.draft.sections.findIndex(x => x.id === id), s = S.draft.sections[idx];
  if (!s) return;
  if (a === "up" || a === "down") return moveSection(id, a === "up" ? -1 : 1);
  if (a === "del") {
    const prevSel = S.draft.selected;
    S.draft.sections.splice(idx, 1);
    if (S.draft.selected === id) S.draft.selected = (S.draft.sections[idx] || S.draft.sections[idx - 1] || {}).id || null;
    toast(`Removed “${s.title}”`, false, {
      label: "Undo", run: () => {
        S.draft.sections.splice(idx, 0, s); S.draft.selected = prevSel;
        markDirty(); renderSections(); renderEditor(); schedulePreview();
      },
    });
  } else if (a === "reset") {
    s.md = s.base; if (S.draft.selected === id) ed.value = s.md;
  } else if (a === "dup") {
    const c = { ...s, id: uid(), title: s.title + " (copy)" }; S.draft.sections.splice(idx + 1, 0, c); S.draft.selected = c.id;
  }
  markDirty(); renderSections(); renderEditor(); schedulePreview();
}

function select(id, { scrollPreview = true } = {}) {
  S.draft.selected = id; persist(); renderSections(); renderEditor(); highlightPreview(scrollPreview);
  const li = $(`.sec[data-id="${id}"]`); if (li) li.scrollIntoView({ block: "nearest" });
}

// ---------- library ----------
function renderLibrary() {
  const q = $("#libSearch").value.trim().toLowerCase();
  const used = new Set(S.draft.sections.map(s => s.key));
  const cats = {};
  Object.entries(LIB).forEach(([k, v]) => {
    if (q && !(v.title.toLowerCase().includes(q) || v.cat.toLowerCase().includes(q) || v.md.toLowerCase().includes(q))) return;
    (cats[v.cat] = cats[v.cat] || []).push([k, v]);
  });
  const order = ["Basics", "Visuals", "Docs", "Project", "Community", "Profile"];
  const box = $("#libList"); box.innerHTML = "";
  order.filter(c => cats[c]).forEach(c => {
    box.insertAdjacentHTML("beforeend", `<div class="lib-cat">${c}</div>`);
    cats[c].forEach(([k, v]) => {
      const b = document.createElement("button");
      const inUse = used.has(k) && k !== "custom";
      b.className = "lib-item" + (inUse ? " in-use" : "");
      b.innerHTML = `<span class="plus">${ICON.plus}</span>${esc(v.title)}${inUse ? `<span class="added">${ICON.check} added</span>` : ""}`;
      b.title = inUse ? "Already in your README — click to jump to it" : "Add to README (after the selected section)";
      b.onclick = () => addSection(k);
      box.appendChild(b);
    });
  });
  if (!box.children.length) box.innerHTML = `<div class="empty" style="padding:16px">Nothing matches. Try “Custom Section”.</div>`;
}
function addSection(k) {
  const existing = S.draft.sections.find(s => s.key === k);
  if (existing && k !== "custom") { select(existing.id); if (MOBILE()) showCol(1); return; }
  const v = LIB[k], s = { id: uid(), key: k, title: v.title, md: v.md, base: null };
  const selIdx = S.draft.sections.findIndex(x => x.id === S.draft.selected);
  const top = ["title", "header-logo", "banner", "banner-title", "profile-hi"].includes(k);
  if (top) S.draft.sections.unshift(s);
  else if (k === "badges") S.draft.sections.splice(Math.min(1, S.draft.sections.length), 0, s);
  else S.draft.sections.splice(selIdx >= 0 ? selIdx + 1 : S.draft.sections.length, 0, s);
  S.draft.selected = s.id;
  markDirty(); renderSections(); renderEditor(); renderPreview(); highlightPreview(true);
  toast(`Added “${v.title}”`);
  if (MOBILE()) showCol(1);
}
$("#libSearch").oninput = renderLibrary;
$("#btnClear").onclick = () => {
  if (!S.draft.sections.length) return;
  const snap = { sections: S.draft.sections, selected: S.draft.selected };
  S.draft.sections = []; S.draft.selected = null; markDirty(); renderSections(); renderEditor(); schedulePreview();
  toast("Cleared all sections", false, { label: "Undo", run: () => { Object.assign(S.draft, snap); markDirty(); renderSections(); renderEditor(); schedulePreview(); } });
};

// ---------- editor ----------
const ed = $("#editor");
const curSection = () => S.draft.sections.find(s => s.id === S.draft.selected);
function renderEditor() {
  const s = curSection();
  const head = $("#edHead");
  if (!s) {
    head.innerHTML = "Editor"; ed.value = ""; ed.disabled = true;
    ed.placeholder = S.draft.sections.length ? "← Select a section to edit it here." : "← Add a section (or pick a template) to start writing.";
    $("#toolbar").style.opacity = .4; $("#tokens").style.opacity = .4; return;
  }
  ed.disabled = false; ed.placeholder = "Write markdown here…"; $("#toolbar").style.opacity = 1; $("#tokens").style.opacity = 1;
  head.innerHTML = `<span class="ed-wrap" title="Rename this section (the name is only used in this app)">${ICON.pencil}<input class="ed-title" id="edTitle" aria-label="Section name"></span>${s.base != null ? `<button class="btn ghost sm" id="edReset" title="Undo all your edits to this section" ${s.md === s.base ? "disabled" : ""}>${ICON.reset} Reset</button>` : ""}`;
  const ti = $("#edTitle"); ti.value = s.title;
  ti.oninput = () => { s.title = ti.value || "Untitled"; markDirty(); const n = $(`.sec[data-id="${s.id}"] .name`); if (n) n.textContent = s.title; };
  const r = $("#edReset"); if (r) r.onclick = () => sectionAction("reset", s.id);
  if (ed.value !== s.md) ed.value = s.md;
}
ed.addEventListener("input", () => {
  const s = curSection(); if (!s) return;
  s.md = ed.value; markDirty(); schedulePreview();
  const li = $(`.sec[data-id="${s.id}"]`);
  if (li) {
    const has = li.querySelector(".mod"), changed = s.base != null && s.md !== s.base;
    if (changed && !has) li.querySelector(".name").insertAdjacentHTML("afterend", '<span class="mod" title="Edited"></span>');
    if (!changed && has) has.remove();
  }
  const r = $("#edReset"); if (r) r.disabled = s.md === s.base;
});
ed.addEventListener("keydown", e => {
  const mod = e.metaKey || e.ctrlKey;
  if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); insertText("  "); }
  if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); mdAction("bold"); }
  if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); mdAction("italic"); }
  if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); mdAction("link"); }
});
function insertText(text, selFrom, selTo) {
  const s = ed.selectionStart;
  ed.focus();
  // execCommand keeps the browser's native undo stack working; fall back if unsupported.
  if (!document.execCommand("insertText", false, text)) { ed.setRangeText(text, s, ed.selectionEnd, "end"); ed.dispatchEvent(new Event("input")); }
  if (selFrom != null) ed.setSelectionRange(s + selFrom, s + (selTo ?? selFrom));
}
function wrapSel(a, b, ph) {
  const s = ed.selectionStart, e = ed.selectionEnd, sel = ed.value.slice(s, e) || ph;
  insertText(a + sel + b, a.length, a.length + sel.length);
}
function linePrefix(pre) {
  const s = ed.selectionStart, e = ed.selectionEnd, v = ed.value;
  const ls = v.lastIndexOf("\n", s - 1) + 1, le = v.indexOf("\n", e); const end = le < 0 ? v.length : le;
  const block = v.slice(ls, end).split("\n").map(l => pre + l).join("\n");
  ed.setSelectionRange(ls, end); insertText(block);
}
function mdAction(a) {
  if (ed.disabled) return;
  const nl = (ed.selectionStart > 0 && ed.value[ed.selectionStart - 1] !== "\n") ? "\n\n" : "";
  switch (a) {
    case "bold": return wrapSel("**", "**", "bold text");
    case "italic": return wrapSel("_", "_", "italic text");
    case "code": return wrapSel("`", "`", "code");
    case "link": return wrapSel("[", "](https://)", "link text");
    case "h2": return linePrefix("## ");
    case "h3": return linePrefix("### ");
    case "ul": return linePrefix("- ");
    case "task": return linePrefix("- [ ] ");
    case "quote": return linePrefix("> ");
    case "fence": return insertText(nl + "~~~bash\n\n~~~\n", nl.length + 8);
    case "table": return insertText(nl + "| Column | Column |\n| :-- | :-- |\n| Value | Value |\n");
    case "details": return insertText(nl + "<details>\n<summary><b>Click to expand</b></summary>\n\nHidden content here.\n\n</details>\n");
    case "img": return insertText(nl + "![alt text](./assets/screenshot.png)\n");
    case "badge": return insertText("![label](https://img.shields.io/badge/label-message-blue?style=flat)");
  }
}
$("#toolbar").onclick = e => { const b = e.target.closest("[data-md]"); if (b) mdAction(b.dataset.md); };
$("#tokens").onclick = e => { const t = e.target.closest(".tok"); if (t && !ed.disabled) insertText(t.textContent); };

// ---------- project fields ----------
function renderProjHint() {
  const p = S.project;
  $("#projHint").textContent = $("#projCard").open ? "" : "· " + [p.name, p.user && p.repo ? `${p.user}/${p.repo}` : ""].filter(Boolean).join(" · ");
}
$$("[data-p]").forEach(inp => {
  inp.value = S.project[inp.dataset.p] || "";
  inp.addEventListener("input", () => { S.project[inp.dataset.p] = inp.value; persist(); schedulePreview(); });
});
$("#projCard").addEventListener("toggle", renderProjHint);

// ---------- templates ----------
function tplCard(t, mine) {
  const cur = S.draft.sourceId === t.id;
  const d = document.createElement("div");
  d.className = "tcard" + (cur ? " cur" : "");
  d.innerHTML = `<h4>${esc(t.name)} ${mine ? '<span class="tag mine">Mine</span>' : ""}${cur ? '<span class="tag">Current</span>' : ""}</h4>
    <p>${esc(t.desc || "")}</p>
    <div class="mini">${t.sections.length} sections: ${t.sections.map(s => esc(s.title)).join(" · ")}</div>
    <div class="acts"><button class="btn sm${cur ? "" : " use"}" data-a="use">${cur ? "Start over" : "Use this"}</button>${mine ? '<button class="btn sm danger" data-a="del">Delete</button>' : ""}</div>`;
  d.querySelector('[data-a="use"]').onclick = () => useTemplate(t);
  const del = d.querySelector('[data-a="del"]'); if (del) del.onclick = () => deleteTemplate(t);
  return d;
}
function renderTemplates() {
  const bi = $("#builtinGrid"); bi.innerHTML = ""; BUILTINS.forEach(t => bi.appendChild(tplCard(t, false)));
  const my = $("#myGrid"); my.innerHTML = "";
  if (!S.custom.length) my.innerHTML = `<div class="note" style="grid-column:1/-1">Nothing here yet. Edit a draft, then press <b>Save as template</b> in the top bar to reuse its layout later.</div>`;
  S.custom.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).forEach(t => my.appendChild(tplCard(t, true)));
  $("#tplExport").disabled = !S.custom.length;
}
function openTemplates() { renderTemplates(); openM("mTemplates"); }
$("#btnTemplates").onclick = openTemplates;

async function useTemplate(t) {
  if (S.draft.dirty && S.draft.sections.length) {
    const r = await confirmBox("Replace your draft?", `Starting from <b>${esc(t.name)}</b> replaces your current draft and its edits.`,
      [{ label: "Cancel", value: "cancel" }, { label: "Save draft as template first", value: "save" }, { label: "Replace draft", value: "discard", cls: "primary" }]);
    if (r === "cancel") return;
    if (r === "save") { closeM("mTemplates"); openFinish(() => useTemplate(t)); return; }
  }
  const before = clone(S.draft);
  S.draft = draftFromTemplate(t);
  S.draft.selected = S.draft.sections[0] ? S.draft.sections[0].id : null;
  persist(); closeM("mTemplates"); renderAll();
  toast(`Started from “${t.name}”`, false, { label: "Undo", run: () => { S.draft = before; persist(); renderAll(); } });
}
async function deleteTemplate(t) {
  const ok = await confirmBox("Delete template?", `“${esc(t.name)}” will be removed from My templates. Your current draft is kept.`, [{ label: "Cancel", value: false }, { label: "Delete", value: true, cls: "danger" }]);
  if (!ok) return;
  S.custom = S.custom.filter(x => x.id !== t.id); LS.set("templates", S.custom);
  renderTemplates(); renderChip();
}
$("#tplExport").onclick = () => {
  saveFile("readme-forge-templates.json", JSON.stringify({ app: "readme-forge", version: 1, templates: S.custom }, null, 2), "application/json");
};
$("#tplImport").onclick = () => $("#tplImportFile").click();
$("#tplImportFile").onchange = async e => {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const list = (Array.isArray(data) ? data : data.templates || []).filter(t => t && t.name && Array.isArray(t.sections));
    if (!list.length) throw new Error("empty");
    const ids = new Set(S.custom.map(t => t.id));
    list.forEach(t => {
      S.custom.push({
        id: ids.has(t.id) || !t.id ? "tpl-" + uid() : t.id, name: String(t.name), desc: String(t.desc || ""), builtin: false, createdAt: t.createdAt || Date.now(),
        sections: t.sections.map(s => ({ key: String(s.key || "custom"), title: String(s.title || "Section"), md: String(s.md || "") })),
      });
    });
    LS.set("templates", S.custom); renderTemplates();
    toast(`Imported ${list.length} template${list.length === 1 ? "" : "s"}`);
  } catch { toast("That file doesn't contain Readme Forge templates", true); }
};

let afterFinish = null;
function openFinish(cb) {
  afterFinish = cb || null;
  const d = S.draft;
  const n = S.draft.sections.filter(s => s.md !== s.base).length;
  $("#finishNote").innerHTML = d.dirty
    ? `Saves this layout (${d.sections.length} sections, ${n} edited) so you can start new READMEs from it. “${esc(d.sourceName)}” stays as it was.`
    : `No changes since you started from “${esc(d.sourceName)}”. You can still save a copy as a new template.`;
  const base = d.sourceName.replace(/\s\((custom|v\d+)\)$/, "");
  let name = base + " (custom)", i = 2;
  while (allTemplates().some(t => t.name === name)) name = `${base} (v${i++})`;
  $("#fName").value = name; $("#fDesc").value = "";
  openM("mFinish"); setTimeout(() => $("#fName").select(), 50);
}
$("#btnFinish").onclick = () => openFinish();
$("#fName").onkeydown = e => { if (e.key === "Enter") $("#fSave").click(); };
$("#fDesc").onkeydown = e => { if (e.key === "Enter") $("#fSave").click(); };
$("#fSave").onclick = () => {
  const name = $("#fName").value.trim() || "Untitled template";
  const t = {
    id: "tpl-" + uid(), name, desc: $("#fDesc").value.trim() || `Based on ${S.draft.sourceName}`, builtin: false, createdAt: Date.now(),
    sections: S.draft.sections.map(s => ({ key: s.key, title: s.title, md: s.md })),
  };
  S.custom.push(t);
  if (!LS.set("templates", S.custom)) toast("Couldn't save — browser storage is full.", true);
  // the draft now continues from the new template
  S.draft.sourceId = t.id; S.draft.sourceName = t.name; S.draft.dirty = false;
  S.draft.sections.forEach(s => s.base = s.md);
  persist(); closeM("mFinish"); renderAll();
  toast(`Saved “${name}” to My templates`);
  if (afterFinish) { const cb = afterFinish; afterFinish = null; cb(); }
};

// ---------- copy & download ----------
$("#btnCopy").onclick = async () => toast((await copyText(buildMarkdown())) ? "README markdown copied to clipboard" : "Couldn't copy — switch to the Markdown view and select the text", false);

const usedAssets = md => Object.keys(S.assets).filter(k => md.includes(k));
function openDownload() {
  const used = usedAssets(buildMarkdown());
  $("#zipInfo").textContent = used.length ? `README.md + ${used.join(", ")}` : "README.md (no logo or banner used yet)";
  openM("mDownload");
  setTimeout(() => $("#dlMd").focus(), 30);
}
$("#btnDownload").onclick = openDownload;
$("#dlMd").onclick = () => { saveFile("README.md", buildMarkdown()); closeM("mDownload"); toast("Downloaded README.md"); };
$("#dlZip").onclick = async () => {
  const md = buildMarkdown(), z = new JSZip();
  z.file("README.md", md);
  usedAssets(md).forEach(k => z.file(k, dataURLtoBlob(S.assets[k])));
  const blob = await z.generateAsync({ type: "blob" });
  saveFile((S.project.repo || "readme") + "-readme.zip", blob);
  closeM("mDownload"); toast("Downloaded .zip");
};

// ---------- mobile tabs ----------
function showCol(i) {
  $$(".col").forEach((c, j) => c.classList.toggle("mshow", j === i));
  $$("#mtabs button").forEach((b, j) => b.classList.toggle("on", j === i));
  if (i === 2) renderPreview();
}
$("#mtabs").onclick = e => { const b = e.target.closest("button"); if (b) showCol(+b.dataset.col); };

// ---------- help / welcome ----------
$("#btnHelp").onclick = () => openM("mHelp");
$("#helpTemplates").onclick = () => { closeM("mHelp"); openTemplates(); };

// ---------- global keys ----------
document.addEventListener("keydown", e => {
  const mod = e.metaKey || e.ctrlKey;
  if (e.key === "Escape") { $$(".scrim.open").forEach(s => s.id !== "mConfirm" && s.classList.remove("open")); return; }
  if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); if (!$(".scrim.open")) openDownload(); return; }
  if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && !$(".scrim.open")) {
    const a = document.activeElement;
    const inOtherField = a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) && a !== ed;
    if (!inOtherField && S.draft.selected) { e.preventDefault(); moveSection(S.draft.selected, e.key === "ArrowUp" ? -1 : 1); }
  }
});

// ---------- render all ----------
function renderAll() { renderChip(); renderSections(); renderEditor(); renderPreview(); renderProjHint(); }

// ---------- studio ----------
initStudio({
  S, persistAssets,
  afterLogo() {
    if (!S.draft.sections.some(s => /\{\{\s*logo\s*\}\}/.test(s.md))) {
      // swap a plain title for the centred logo header, or add one at the top
      const ti = S.draft.sections.findIndex(s => s.key === "title");
      if (ti >= 0) {
        const v = LIB["header-logo"];
        S.draft.sections[ti] = { id: uid(), key: "header-logo", title: v.title, md: v.md, base: null };
        S.draft.selected = S.draft.sections[ti].id; markDirty(); renderSections(); renderEditor();
      } else addSection("header-logo");
    }
    schedulePreview();
  },
  afterBanner() {
    if (!S.draft.sections.some(s => /\{\{\s*banner\s*\}\}|assets\/banner\.png/.test(s.md))) addSection("banner");
    schedulePreview();
  },
}).then(() => renderPreview());
$("#btnStudio").onclick = () => openStudio(S.assets[S.logoPath] ? "banner" : "logo");

// ---------- boot ----------
syncThemeSeg();
if (!LS.get("seenProject", false)) { $("#projCard").open = true; LS.set("seenProject", true); }
renderAll();
if (!LS.get("seenWelcome", false)) { openM("mHelp"); LS.set("seenWelcome", true); }
