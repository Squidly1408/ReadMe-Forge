// ---------- small shared helpers ----------
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const clone = o => JSON.parse(JSON.stringify(o));

/** localStorage, best effort (private windows / full quota just fail quietly). */
export const LS = {
  get(k, d) { try { const v = localStorage.getItem("rf." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("rf." + k, JSON.stringify(v)); return true; } catch { return false; } },
};

/** Relative luminance of a hex colour (0 = black, 1 = white). */
export function lum(hex) {
  const h = hex.replace("#", ""); const f = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
  if (f.length !== 6) return 0.3;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(f.substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}

export function hexA(hex, a) {
  const h = hex.replace("#", ""); const f = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
  return `rgba(${parseInt(f.substr(0, 2), 16)},${parseInt(f.substr(2, 2), 16)},${parseInt(f.substr(4, 2), 16)},${a})`;
}

export function dataURLtoBlob(u) {
  const [h, b] = u.split(","); const mime = (h.match(/data:([^;,]+)/) || [])[1] || "application/octet-stream";
  if (/;base64/.test(h)) { const bin = atob(b); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return new Blob([arr], { type: mime }); }
  return new Blob([decodeURIComponent(b)], { type: mime });
}

/** Trigger a browser download for a string or Blob. */
export function saveFile(filename, data, type = "text/markdown;charset=utf-8") {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch { /* ignore */ }
    ta.remove(); return ok;
  }
}

// ---------- toast ----------
let toastT;
/** Show a toast. `action` = { label, run } adds a button (e.g. Undo). */
export function toast(msg, err, action) {
  const t = $("#toast"), act = $("#toastAct");
  $("#toastMsg").textContent = msg;
  t.className = "toast show" + (err ? " err" : "");
  if (action) { act.hidden = false; act.textContent = action.label; act.onclick = () => { t.className = "toast"; action.run(); }; }
  else act.hidden = true;
  clearTimeout(toastT); toastT = setTimeout(() => t.className = "toast", action ? 6000 : 3200);
}

// ---------- modals ----------
export const openM = id => $("#" + id).classList.add("open");
export const closeM = id => $("#" + id).classList.remove("open");
export const isOpen = id => $("#" + id).classList.contains("open");

export function confirmBox(title, body, buttons) {
  return new Promise(res => {
    $("#cTitle").textContent = title; $("#cBody").innerHTML = body;
    const f = $("#cFoot"); f.innerHTML = "";
    buttons.forEach(b => {
      const el = document.createElement("button"); el.className = "btn " + (b.cls || ""); el.textContent = b.label;
      el.onclick = () => { closeM("mConfirm"); res(b.value); }; f.appendChild(el);
    });
    openM("mConfirm");
    setTimeout(() => f.lastChild && f.lastChild.focus(), 30);
  });
}
