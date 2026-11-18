// ---------- offline shields.io renderer ----------
// Fallback for when a badge image can't be fetched (offline, blocked, rate-limited),
// so the preview still looks like what GitHub will show.
import { esc, lum } from "./util.js";

const SHIELD_COLORS = { brightgreen: "#44cc11", green: "#97ca00", yellowgreen: "#a4a61d", yellow: "#dfb317", orange: "#fe7d37", red: "#e05d44", blue: "#007ec6", lightgrey: "#9f9f9f", lightgray: "#9f9f9f", grey: "#555", gray: "#555", blueviolet: "#8a2be2", success: "#44cc11", important: "#fe7d37", critical: "#e05d44", informational: "#007ec6", inactive: "#9f9f9f", black: "#000", white: "#fff", pink: "#ff69b4", purple: "#800080" };

function shieldColor(c) {
  if (!c) return "#555"; c = c.toLowerCase();
  if (SHIELD_COLORS[c]) return SHIELD_COLORS[c];
  if (/^[0-9a-f]{3}([0-9a-f]{3})?$/.test(c)) return "#" + c;
  return c;
}

function badgeSVG(label, message, color, style, labelColor) {
  const big = style === "for-the-badge";
  if (big) { label = label.toUpperCase(); message = message.toUpperCase(); }
  const cw = big ? 7.4 : 6.2, pad = big ? 12 : 6, h = big ? 28 : 20, fs = big ? 10 : 11;
  const lw = label ? Math.round(label.length * cw + pad * 2) : 0;
  const mw = message ? Math.round(message.length * cw + pad * 2) : 0;
  const w = lw + mw, mc = shieldColor(color), lc = labelColor ? shieldColor(labelColor) : "#555";
  const r = (style === "flat-square" || big) ? 0 : 3;
  const mtc = lum(mc) > .55 ? "#333" : "#fff", ltc = lum(lc) > .55 ? "#333" : "#fff";
  const weight = big ? 700 : 400, ls = big ? 1 : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><clipPath id="c"><rect width="${w}" height="${h}" rx="${r}"/></clipPath><g clip-path="url(#c)"><rect width="${lw}" height="${h}" fill="${lc}"/><rect x="${lw}" width="${mw}" height="${h}" fill="${mc}"/></g><g font-family="Verdana,DejaVu Sans,sans-serif" font-size="${fs}" font-weight="${weight}" letter-spacing="${ls}" text-anchor="middle">${label ? `<text x="${lw / 2}" y="${h / 2 + fs / 2.9}" fill="${ltc}">${esc(label)}</text>` : ""}${message ? `<text x="${lw + mw / 2}" y="${h / 2 + fs / 2.9}" fill="${mtc}">${esc(message)}</text>` : ""}</g></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function decodeShieldPart(s) {
  return decodeURIComponent(s.replace(/__/g, "\u0001").replace(/_/g, " ").replace(/\u0001/g, "_").replace(/--/g, "\u0002").split("\u0002").join("-"));
}

/** Returns a data: URL rendering of a shields.io badge URL, or null if it isn't one. */
export function shieldFromURL(src, license = "MIT") {
  let u; try { u = new URL(src); } catch { return null; }
  if (!/(^|\.)shields\.io$/.test(u.hostname)) return null;
  const style = u.searchParams.get("style"), lc = u.searchParams.get("labelColor");
  const path = u.pathname.replace(/^\/+/, "");
  if (path.startsWith("badge/")) {
    const body = path.slice(6).replace(/\.svg$/, "");
    const segs = body.replace(/--/g, "\u0002").split("-").map(s => s.split("\u0002").join("--"));
    let label = "", msg = "", color = "blue";
    if (segs.length >= 3) { color = segs.pop(); msg = segs.pop(); label = segs.join("-"); }
    else if (segs.length === 2) { msg = segs[0]; color = segs[1]; }
    else msg = segs[0];
    try { return badgeSVG(decodeShieldPart(label), decodeShieldPart(msg), color, style, lc); } catch { return null; }
  }
  const p = path.split("/");
  const kind = p[0] === "github" ? p[1] : p[0];
  const fake = { stars: ["stars", "★ 1.2k", "blue"], forks: ["forks", "128", "blue"], issues: ["issues", "12 open", "yellow"], license: ["license", license, "blue"], "last-commit": ["last commit", "today", "brightgreen"], v: ["npm", "v1.0.0", "blue"], downloads: ["downloads", "10k/month", "brightgreen"], workflow: ["build", "passing", "brightgreen"], actions: ["build", "passing", "brightgreen"] }[kind] || [kind || "badge", "live", "blue"];
  return badgeSVG(fake[0], fake[1], fake[2], style, lc);
}
