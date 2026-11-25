// Courtroom-sketch engine. Everything is drawn from seeded jittered strokes, so frames are deterministic and no image model or real likeness is involved.
// Figures are told apart by reported clothing, seat and a large name tag; faces are generic on purpose.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, cpSync, existsSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";

let seed = 1985;
const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const J = (a) => (R() - 0.5) * 2 * a;
export const INK = "#2B2A28";
let uid = 0;

const smooth = (p, amp, close) => {
  const q = p.map(([x, y]) => [x + J(amp), y + J(amp)]);
  if (close) q.push(q[0]);
  let d = `M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)}`;
  for (let i = 1; i < q.length - 1; i++) {
    const mx = (q[i][0] + q[i + 1][0]) / 2, my = (q[i][1] + q[i + 1][1]) / 2;
    d += `Q${q[i][0].toFixed(1)} ${q[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const l = q[q.length - 1];
  return d + `L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
};
const subdiv = (p, step = 50) => {
  const o = [];
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b] = [p[i], p[i + 1]];
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) o.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  o.push(p[p.length - 1]);
  return o;
};
/** Two loose passes of a graphite line. */
export const line = (p, w = 3, c = INK, amp = 1.6, extra = "") => {
  const s = subdiv(p);
  return `<path d="${smooth(s, amp)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity=".9" ${extra}/><path d="${smooth(s, amp * 1.3)}" fill="none" stroke="${c}" stroke-width="${w * 0.5}" stroke-linecap="round" opacity=".55"/>`;
};
const hatchLines = (x0, y0, x1, y1, ang, gap) => {
  let d = "";
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0);
  const c = Math.cos(ang), s = Math.sin(ang);
  for (let o = -L / 2; o < L / 2; o += gap) {
    const j = J(gap * 0.3);
    const ax = cx + -s * (o + j) - c * L * 0.6, ay = cy + c * (o + j) - s * L * 0.6;
    const bx = cx + -s * (o + j) + c * L * 0.6, by = cy + c * (o + j) + s * L * 0.6;
    d += `M${ax.toFixed(0)} ${ay.toFixed(0)}L${bx.toFixed(0)} ${by.toFixed(0)}`;
  }
  return d;
};
/** Closed shape: watercolor wash with a bleeding edge, optional hatching, graphite outline. */
export const shape = (p, { wash, op = 0.75, hatch, gap = 14, ang = 0.9, w = 3.2, ink = INK } = {}) => {
  const s = subdiv([...p, p[0]]);
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const id = `cp${uid++}`;
  let o = "";
  if (wash) o += `<path d="${smooth(s, 7, true)}" fill="${wash}" opacity="${op * 0.35}"/><path d="${smooth(s, 2.5, true)}" fill="${wash}" opacity="${op}"/>`;
  if (hatch) {
    o += `<clipPath id="${id}"><path d="${smooth(s, 1, true)}"/></clipPath><path clip-path="url(#${id})" d="${hatchLines(...box, ang, gap)}" stroke="${hatch === true ? ink : hatch}" stroke-width="1.8" opacity=".62" fill="none"/>`;
  }
  return o + line([...p, p[0]], w, ink);
};
export const rect = (x, y, w, h, o = {}) => shape([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o);
export const text = (x, y, s, size, { fill = INK, font = "IBM Plex Mono", weight = 700, anchor = "middle", rot = 0, op = 1 } = {}) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-weight="${weight}" font-size="${size}" text-anchor="${anchor}" opacity="${op}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ""}>${s}</text>`;
export const g = (id, body, extra = "") => `<g id="${id}" ${extra}>${body}</g>`;
/** Annotation that draws on: reveal with {fx:'draw'}. */
export const mark = (id, p, c = "#B3261E", w = 7) => `<path id="${id}" class="draw" pathLength="1" d="${smooth(subdiv(p, 30), 2)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
export const circleP = (cx, cy, rx, ry = rx) => Array.from({ length: 26 }, (_, i) => [cx + Math.cos((i / 24) * 6.283 + 0.4) * rx, cy + Math.sin((i / 24) * 6.283 + 0.4) * ry]);

const SKIN = "#D9B38C";
const headBits = (hair, id) => {
  let o = shape([[-28, -240], [28, -240], [30, -195], [-30, -195]], { wash: SKIN, w: 2.4, hatch: true, gap: 11 });
  o += shape(circleP(-73, -306, 12, 22).slice(0, 25), { wash: SKIN, w: 2.2 }) + shape(circleP(73, -306, 12, 22).slice(0, 25), { wash: SKIN, w: 2.2 });
  if (hair === "hijab") o += shape([[-150, -190], [-104, -250], [-100, -360], [-50, -420], [50, -420], [100, -360], [104, -250], [150, -190], [0, -150]], { wash: "#5C3D5E", op: 0.97, hatch: "#2a1a2b", gap: 9, w: 3.2 });
  o += shape(circleP(0, -305, 72, 90).slice(0, 25), { wash: SKIN, op: 0.85, w: 3 });
  // shade on one cheek
  const cl = `cp${uid++}`;
  o += `<clipPath id="${cl}"><path d="M46 -385 L82 -385 L82 -225 L46 -225 Z"/></clipPath><g clip-path="url(#${cl})"><path d="${hatchLines(40, -385, 82, -225, 1.1, 10)}" stroke="${INK}" stroke-width="1.6" opacity=".45"/></g>`;
  if (hair === "peci") o += shape([[-68, -350], [-60, -420], [60, -420], [68, -350]], { wash: "#1E1C1B", op: 1, hatch: "#000", gap: 7, w: 3.4 });
  else if (hair === "neat") o += shape([[-72, -330], [-66, -395], [-20, -415], [40, -410], [70, -372], [72, -332], [40, -366], [-30, -368]], { wash: "#2A2622", op: 0.95, hatch: "#000", gap: 8 });
  else if (hair === "side") o += shape([[-74, -320], [-70, -390], [-10, -420], [55, -405], [74, -350], [72, -322], [50, -372], [-40, -352]], { wash: "#3B3530", op: 0.9, hatch: "#000", gap: 9 });
  else if (hair === "hijab") o += shape([[-74, -325], [-62, -398], [0, -418], [62, -398], [74, -325], [44, -372], [-44, -372]], { wash: "#5C3D5E", op: 0.97, hatch: "#2a1a2b", gap: 9, w: 3 });
  else if (hair === "grey") o += shape([[-73, -325], [-62, -395], [0, -412], [62, -395], [73, -325], [46, -368], [-46, -368]], { wash: "#8A8580", op: 0.85, hatch: true, gap: 10 });
  else o += shape([[-76, -300], [-74, -385], [-10, -420], [62, -395], [76, -300], [56, -360], [-52, -360]], { wash: "#2F2A26", op: 0.92, hatch: "#000", gap: 8 });
  o += line([[-46, -336], [-18, -342]], 4) + line([[18, -342], [46, -336]], 4);
  o += g(`${id}-eyes`, `<ellipse cx="-31" cy="-318" rx="9" ry="5.5" fill="${INK}"/><ellipse cx="31" cy="-318" rx="9" ry="5.5" fill="${INK}"/>`);
  o += line([[0, -312], [-7, -280], [6, -276]], 2.6);
  o += g(`${id}-mc`, line([[-20, -250], [0, -247], [20, -250]], 3.2));
  o += g(`${id}-mo`, `<ellipse cx="0" cy="-246" rx="17" ry="11" fill="#5A2A22" stroke="${INK}" stroke-width="2.6"/>`, `style="display:none"`);
  return o;
};
const body = (robe) => {
  const T = [[-150, 190], [-168, -110], [-140, -180], [-48, -210], [48, -210], [140, -180], [168, -110], [150, 190]];
  if (robe === "toga") return shape(T, { wash: "#242322", op: 0.96, hatch: "#000", gap: 10, w: 3.6 }) + shape([[-34, -205], [34, -205], [18, -60], [-18, -60]], { wash: "#F4EEE0", op: 1, w: 2.6 }) + line([[0, -200], [0, -60]], 2.2);
  if (robe === "judge") return shape(T, { wash: "#231F20", op: 0.96, hatch: "#000", gap: 10, w: 3.6 }) + shape([[-150, -150], [-60, -205], [-30, 190], [-120, 190]], { wash: "#7E1F1A", op: 0.92, w: 2.4 }) + shape([[150, -150], [60, -205], [30, 190], [120, 190]], { wash: "#7E1F1A", op: 0.92, w: 2.4 }) + shape([[-30, -205], [30, -205], [16, -70], [-16, -70]], { wash: "#F4EEE0", op: 1, w: 2.4 });
  if (robe === "batik") {
    let o = shape(T, { wash: "#7A4E2A", op: 0.92, w: 3.4 });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) o += `<path d="M${-120 + c * 48 + (r % 2) * 22} ${-140 + r * 56}l14 16l-14 16l-14 -16z" fill="none" stroke="#3B2413" stroke-width="3" opacity=".8"/>`;
    return o + shape([[-44, -208], [0, -158], [44, -208], [30, -224], [-30, -224]], { wash: "#6B431F", op: 1, w: 2.6 }) + line([[0, -158], [0, 190]], 2.4);
  }
  return shape(T, { wash: "#5F6A72", op: 0.85, hatch: true, gap: 13, w: 3.4 }) + shape([[-44, -208], [0, -150], [44, -208], [24, -226], [-24, -226]], { wash: "#F4EEE0", op: 1, w: 2.4 }) + line([[0, -150], [0, 190]], 2.4);
};
const hand = (x, y) => shape(circleP(x, y, 22).slice(0, 25), { wash: SKIN, w: 2.6 });
/** A person. arms: list of named poses that can be toggled with {id-armname}. */
export const person = ({ id, x, y, s = 1, robe = "shirt", hair = "neutral", poses = {} }) => {
  const arm = (a, b, sleeve) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L; return shape([[a[0] + nx * 28, a[1] + ny * 28], [b[0] + nx * 22, b[1] + ny * 22], [b[0] - nx * 22, b[1] - ny * 22], [a[0] - nx * 28, a[1] - ny * 28]], { wash: sleeve, op: 0.95, w: 3, hatch: sleeve === "#242322" ? "#000" : false, gap: 10 }) + hand(b[0], b[1]); };
  const sleeve = robe === "batik" ? "#7A4E2A" : robe === "shirt" ? "#5F6A72" : "#242322";
  let p = g(`${id}-rest`, arm([-158, -130], [-176, 110], sleeve) + arm([158, -130], [176, 110], sleeve));
  for (const [k, [l, r]] of Object.entries(poses)) p += g(`${id}-${k}`, (l ? arm([-158, -130], l, sleeve) : arm([-158, -130], [-176, 110], sleeve)) + (r ? arm([158, -130], r, sleeve) : arm([158, -130], [176, 110], sleeve)), `style="display:none"`);
  return `<g id="${id}" data-x="${x}" data-y="${y}" data-s="${s}" transform="translate(${x} ${y}) scale(${s})">${body(robe)}${headBits(hair, id)}${p}</g>`;
};
export const nameTag = (x, y, name, role, wash = "#F7F1E2") => `<g>${rect(x - 190, y, 380, 96, { wash, op: 1, w: 3 })}${text(x, y + 46, name, 40, { weight: 700 })}${text(x, y + 80, role, 25, { weight: 500, op: 0.82 })}</g>`;
export const doc = (x, y, w, h, title, { seal = true, tag = true } = {}) => {
  let o = rect(x, y, w, h, { wash: "#F7F1E2", op: 1, w: 3 });
  o += text(x + w / 2, y + h * 0.17, title, h * 0.12, { font: "Playfair Display" });
  for (let i = 0; i < 5; i++) o += line([[x + w * 0.14, y + h * (0.3 + i * 0.09)], [x + w * (i % 2 ? 0.7 : 0.86), y + h * (0.3 + i * 0.09)]], 2.6, "#7B7263");
  if (seal) o += shape(circleP(x + w * 0.76, y + h * 0.82, w * 0.1).slice(0, 25), { wash: "#9C3B24", op: 0.8, w: 2.2 });
  if (tag) o += text(x + w * 0.3, y + h * 0.86, "ILUSTRASI", h * 0.05, { fill: "#9C3B24" });
  return o;
};

/** The shared room. Everything else in a film sits on the same paper below it. */
export const COURT = { hakim: [1080, 640], h2: [700, 660], h3: [1460, 660], jokowi: [1080, 1330], jaksa: [330, 1140], jaksa2: [620, 1140], refly: [1490, 1090], roy: [1860, 1140] };
export const court = ({ wash = "#C7A77A", poses = {}, left = ["REFLY HARUN", "kuasa hukum Roy"], right = ["ROY SURYO", "terdakwa"], leftLook = { robe: "toga", hair: "grey" }, rightLook = { robe: "shirt", hair: "side" }, witness = ["JOKOWI", "saksi"], witnessLook = { robe: "batik", hair: "peci" }, room = "PENGADILAN NEGERI JAKARTA TIMUR" } = {}) => {
  let o = rect(120, 90, 1920, 520, { wash: "#E7DCC4", op: 0.9, w: 3, hatch: true, gap: 34, ang: 1.5 });
  o += text(1080, 190, room, 54, { font: "Playfair Display" });
  o += person({ id: "h2", x: 700, y: 660, s: 0.72, robe: "judge", hair: "grey" }) + person({ id: "h3", x: 1460, y: 660, s: 0.72, robe: "judge", hair: "neat" });
  o += person({ id: "hakim", x: 1080, y: 640, s: 0.82, robe: "judge", hair: "neutral", poses: poses.hakim });
  o += rect(300, 660, 1560, 240, { wash, op: 0.85, w: 4, hatch: true, gap: 22, ang: 0.2 });
  o += nameTag(1080, 700, "HAKIM KETUA", "majelis hakim");
  o += person({ id: "jaksa", x: 330, y: 1140, s: 0.76, robe: "toga", hair: "neat", poses: poses.jaksa }) + person({ id: "jaksa2", x: 620, y: 1140, s: 0.72, robe: "toga", hair: "side" });
  o += rect(120, 1200, 660, 170, { wash, op: 0.85, w: 4, hatch: true, gap: 22, ang: 0.2 });
  o += nameTag(450, 1240, "JAKSA", "penuntut umum");
  o += person({ id: "roy", x: 1860, y: 1140, s: 0.76, ...rightLook, poses: poses.roy });
  o += person({ id: "refly", x: 1490, y: 1090, s: 0.8, ...leftLook, poses: poses.refly });
  o += rect(1280, 1200, 800, 170, { wash, op: 0.85, w: 4, hatch: true, gap: 22, ang: 0.2 });
  o += nameTag(1480, 1240, ...left) + nameTag(1880, 1240, ...right);
  o += person({ id: "jokowi", x: 1080, y: 1330, s: 1, ...witnessLook, poses: poses.jokowi });
  o += nameTag(1080, 1440, ...witness);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9 - (r % 2); i++) {
    const x = 240 + i * 210 + (r % 2) * 105, y = 1720 + r * 130;
    o += shape(circleP(x, y, 44, 50).slice(0, 25), { wash: "#3B3530", op: 0.85, hatch: "#000", gap: 9, w: 2.6 }) + shape([[x - 80, y + 120], [x - 70, y + 50], [x + 70, y + 50], [x + 80, y + 120]], { wash: "#8F8778", op: 0.7, w: 2.6 });
  }
  return o;
};

export const camera = (shots, duration) => {
  // Each shot: [t, x, y, zoom]. A short eased move, then a slow push so nothing rests dead.
  const S = shots.map((s, i) => ({ t: s[0], x: s[1], y: s[2], z: s[3], d: s[4] ?? 0.75, next: shots[i + 1] ? shots[i + 1][0] : duration }));
  return S;
};

const FX_JS = `
const ease=(x)=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(6*x-15)+10)};
const backOut=(x)=>{x=Math.max(0,Math.min(1,x))-1;return x*x*(2.2*x+1.2)+1};
function camAt(t){let i=0;while(i<CAM.length-1&&CAM[i+1].t<=t)i++;const c=CAM[i],p=CAM[Math.max(0,i-1)];const u=ease((t-c.t)/c.d);
 const push=1+Math.max(0,(t-c.t-c.d))*0.0085;const brx=Math.sin(t*.61)*5,bry=Math.sin(t*.43)*6;
 return{x:p.x+(c.x-p.x)*u+brx,y:p.y+(c.y-p.y)*u+bry,z:(p.z+(c.z-p.z)*u)*push};}
`;

/** Writes the world composition for one film. cfg: {ep, world, shots, reveals, speak, poses, cards, chip, series, css, wash} */
export function buildFilm(cfg) {
  const epDir = "."; const P = "PROJECT/HyperFrames_Remotion";
  mkdirSync(`${P}/compositions`, { recursive: true }); mkdirSync(`${P}/assets/img`, { recursive: true }); mkdirSync(`${P}/assets/brand`, { recursive: true }); mkdirSync(`${P}/assets/audio`, { recursive: true });
  const SRC = "../EP01_SELEMBAR_KERTAS/PROJECT/HyperFrames_Remotion";
  copyFileSync(`${SRC}/assets/brand/stacked-reversed.svg`, `${P}/assets/brand/stacked-reversed.svg`);
  copyFileSync(`${SRC}/assets/img/grain.png`, `${P}/assets/img/grain.png`);
  copyFileSync(`${SRC}/hyperframes.json`, `${P}/hyperframes.json`);
  copyFileSync("../sketch/paper.jpg", `${P}/assets/img/paper.jpg`);
  copyFileSync("AUDIO/mix.wav", `${P}/assets/audio/mix.wav`);
  const TL = loadTimeline(epDir);
  const at = anchors(TL);
  const A = (s) => (typeof s === "number" ? s : at(s));
  const OUT = +(TL.speech_end + 0.25).toFixed(3);
  const K = Object.fromEntries(TL.scenes.map((s) => [s.id, s.start]));
  const data = cfg.make({ A, K, OUT, TL });
  const CAM = camera(data.shots.map((s) => [A(s[0]), ...s.slice(1)]), TL.duration);
  const ROT = (data.rot || []).map(([id, a, b, d0, d1, cx, cy]) => [id, A(a), A(b), d0, d1, cx, cy]);
  const REV = data.reveals.map((r) => ({ id: r.id, a: A(r.at), b: r.until != null ? A(r.until) : 1e9, fx: r.fx || "pop", x: r.x, y: r.y }));
  const SPK = data.speak.map(([id, a, b]) => [id, A(a), A(b)]);
  const POS = data.poses.map(([id, name, a, b]) => [id, name, A(a), b != null ? A(b) : 1e9]);
  const CARDS = data.cards.map((c, i) => ({ ...c, i, a: A(c.at), b: A(c.until) }));
  const cards = CARDS.map((c) => `<div class="card ${c.cls || ""}" id="card${c.i}" style="top:${c.top ?? 236}px"><div class="who" style="color:${c.color || cfg.accent}">${c.who || ""}</div><div class="q">${c.text}</div></div>`).join("");
  const html = `<template><style>
#root{position:absolute;inset:0;overflow:hidden;background:#E9DFC9}
#paperworld{position:absolute;left:0;top:0;width:2160px;height:11000px;transform-origin:0 0;background:url(assets/img/paper.jpg);background-size:1024px 1024px}
#paperworld svg{position:absolute;left:0;top:0;overflow:visible}
.draw{stroke-dasharray:1;stroke-dashoffset:1}
#grain{position:absolute;left:0;top:0;width:1280px;height:2120px;background:url(assets/img/grain.png);opacity:.05;mix-blend-mode:multiply;pointer-events:none}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,rgba(60,40,20,0) 58%,rgba(60,40,20,.28) 100%);pointer-events:none}
#chip{position:absolute;left:56px;top:186px;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:24px;color:#F7F1E2;background:${INK};padding:4px 12px;z-index:11}
.card{position:absolute;left:56px;right:110px;background:#FBF6E8;border:4px solid ${INK};box-shadow:8px 9px 0 rgba(43,42,40,.28);padding:14px 24px 20px;opacity:0;z-index:10}
.who{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:30px;margin-bottom:6px}
.q{font-family:${cfg.quoteFont};font-weight:${cfg.quoteWeight || 800};font-size:${cfg.quoteSize || 62}px;line-height:1.08;color:${INK}}
.card.big .q{font-size:${(cfg.quoteSize || 62) + 34}px}
.card.head{background:${INK};border-color:${INK}}.card.head .q{color:#FBF6E8}.card.head .who{color:#E8C58A}
#sig{position:absolute;z-index:12;opacity:0;font-family:Outfit,sans-serif;color:${INK};line-height:1.05;pointer-events:none}
#sig b{display:block;font-weight:700;font-size:28px;letter-spacing:.14em}#sig i{display:block;font-style:normal;font-weight:500;font-size:17px;letter-spacing:.04em}
#outro{position:absolute;inset:0;background:#0B3D2E;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:300px;box-sizing:border-box;z-index:20;opacity:0}
#outro img{width:520px;display:block}
#outro .cr{margin-top:44px;font-family:Outfit,sans-serif;font-weight:600;font-size:46px;color:#fff}
#outro .sr{margin-top:18px;font-family:Outfit,sans-serif;font-weight:400;font-size:27px;color:#A3E635;letter-spacing:.06em}
</style>
<div id="root" data-composition-id="world" data-start="0" data-duration="${TL.duration}" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
<div id="paperworld"><svg width="2160" height="11000" viewBox="0 0 2160 11000" xmlns="http://www.w3.org/2000/svg">${data.world}</svg></div>
<div id="grain"></div><div id="vig"></div>
<div id="chip">${cfg.chip}</div>${cards}${cfg.signature ? `<div id="sig"><b>AUDIRA</b><i>${cfg.sigHandle || "audira.my.id"}</i></div>` : ""}
<div id="outro"><img src="assets/brand/stacked-reversed.svg" alt=""><div class="cr">Created by Agus Dwi R.</div><div class="sr">${cfg.series}</div></div>
</div>
<script>(function(){
const CAM=${JSON.stringify(CAM)},REV=${JSON.stringify(REV)},SPK=${JSON.stringify(SPK)},POS=${JSON.stringify(POS)},CARDS=${JSON.stringify(CARDS.map(({ i, a, b }) => ({ i, a, b })))},ROT=${JSON.stringify(ROT)},DUR=${TL.duration},OUT=${OUT};
${FX_JS}
const q=(s)=>document.getElementById(s),W=q("paperworld"),F=q('outro'),G=q('grain'),SG=q('sig');
// AUDIRA moving signature (port of AudiraSignature.tsx): 32% opacity, 4 safe-zone anchors, new spot every 18 s in a seeded order, gone at the outro.
const SA=[[1020,1150,'r'],[60,1150,'l'],[1020,640,'r'],[60,640,'l']],SO=[0,1,2,3];{let h=2166136261;const sd=${JSON.stringify(cfg.signature || "")};for(let i=0;i<sd.length;i++)h=Math.imul(h^sd.charCodeAt(i),16777619)>>>0;for(let i=3;i>0;i--){h=Math.imul(h^(h>>>15),2246822507)>>>0;const j=h%(i+1);[SO[i],SO[j]]=[SO[j],SO[i]];}}
const rev=REV.map(r=>({...r,e:q(r.id),base:(q(r.id)&&q(r.id).getAttribute('transform'))||''}));
const pos={};POS.forEach(([id,n])=>{pos[id]=pos[id]||new Set();pos[id].add(n)});
const cards=CARDS.map(c=>({...c,e:q('card'+c.i)}));
function all(t){
 const c=camAt(t);W.style.transform='translate('+(540-c.x*c.z).toFixed(2)+'px,'+(${cfg.camY||735}-c.y*c.z).toFixed(2)+'px) scale('+c.z.toFixed(4)+')';
 const act={};for(const r of rev)if(t>=r.a&&t<r.b)act[r.id]=r;
 for(const r of rev){if(!r.e)continue;if(act[r.id]&&act[r.id]!==r)continue;const on=t>=r.a&&t<r.b;
  if(r.fx==='draw'){r.e.style.display=(t>=r.a&&t<r.b)?'':'none';r.e.style.strokeDashoffset=Math.max(0,1-(t-r.a)/.55).toFixed(3);continue}
  r.e.style.display=on?'':'none';if(!on)continue;
  const u=(t-r.a)/.35;
  if(r.fx==='fade')r.e.style.opacity=Math.min(1,u).toFixed(3);
  else if(r.fx==='rise'){r.e.setAttribute('transform',r.base+' translate(0 '+((1-backOut(u))*(r.y||300)).toFixed(1)+')')}
  else{const k=backOut(u);r.e.setAttribute('transform','translate('+r.x+' '+r.y+') scale('+k.toFixed(3)+') translate('+(-r.x)+' '+(-r.y)+')')}
 }
 for(const[id,set]of Object.entries(pos)){let act='rest';for(const[i,n,a,b]of POS)if(i===id&&t>=a&&t<b)act=n;const rest=q(id+'-rest');if(rest)rest.style.display=act==='rest'?'':'none';for(const n of set){const e=q(id+'-'+n);if(e)e.style.display=act===n?'':'none'}}
 const open={};for(const[id,a,b]of SPK){if(t>=a&&t<b&&Math.sin(t*15)+Math.sin(t*23)>-.2)open[id]=1;}
 for(const id of ${JSON.stringify(data.people)}){const m=q(id+'-mo'),n=q(id+'-mc');if(m){m.style.display=open[id]?'':'none';n.style.display=open[id]?'none':''}
  const e=q(id+'-eyes');if(e){const ph=(id.length*1.7+id.charCodeAt(0)*.13);e.style.opacity=(Math.sin(t*.9+ph)>.985)?0:1}
  const f=q(id);if(f){const x=+f.dataset.x,y=+f.dataset.y,s=+f.dataset.s;const b=Math.sin(t*1.3+id.length)*2.2+(open[id]?Math.sin(t*7)*1.6:0);f.setAttribute('transform','translate('+x+' '+(y+b).toFixed(1)+') scale('+s+')')}}
 for(const k of cards){const u=(t-k.a)/.3,o=(k.b-t)/.18;const v=Math.min(Math.max(0,Math.min(1,u)),Math.max(0,Math.min(1,o)));k.e.style.opacity=v.toFixed(3);k.e.style.transform='translateY('+((1-ease(Math.min(1,Math.max(0,u))))*-34).toFixed(1)+'px) rotate(-.5deg)';k.e.style.visibility=v>0?'visible':'hidden'}
 for(const[id,a,b,d0,d1,cx,cy]of ROT){const e=q(id);if(e){const u=Math.max(0,Math.min(1,(t-a)/(b-a)));e.setAttribute('transform','rotate('+(d0+(d1-d0)*u).toFixed(2)+' '+cx+' '+cy+')')}}
 F.style.opacity=Math.max(0,Math.min(1,(t-OUT)/.35)).toFixed(3);
 if(SG){const c=Math.floor(t/18),[x,y,al]=SA[SO[c%4]],t0=c*18,t1=Math.min(t0+18,OUT-.2);SG.style.left=al==='l'?x+'px':'auto';SG.style.right=al==='r'?(1080-x)+'px':'auto';SG.style.top=y+'px';SG.style.textAlign=al==='l'?'left':'right';
  SG.style.opacity=(t>=t1?0:Math.min(1,(t-t0)/.5,(t1-t)/.4)*.32).toFixed(3);}
 const n=Math.floor(t*12);G.style.transform='translate3d('+(-((n*37)%100))+'px,'+(-((n*61)%100))+'px,0)';
}
const tl=gsap.timeline({paused:true});const c={t:0};
tl.to(c,{t:DUR,duration:DUR,ease:'none',onUpdate:()=>all(c.t)},0);
window.addEventListener('hf-seek',e=>all(e.detail.time));
all(0);window.__timelines["world"]=tl;
})();</script></template>`;
  writeFileSync(`${P}/compositions/world.html`, html);
  const n = writeCaptions(epDir, TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:58px;right:112px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;background:#FBF6E8;border:4px solid ${INK};padding:10px 16px 14px;font-family:"Archivo Black",sans-serif;font-size:50px;line-height:1.16;color:${INK};box-shadow:8px 9px 0 rgba(43,42,40,.3)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${INK}",y:0},{color:"${cfg.accent}",y:-5,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{y:0,duration:.1},${(w.start + 0.05).toFixed(3)});tl.to("#${id}",{color:"${INK}",duration:.08},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:10},{opacity:1,y:0,duration:.1,ease:"power2.out"},${s.toFixed(3)});\n`);
  writeIndex(epDir, TL, cfg.title, "#E9DFC9");
  console.log(cfg.title, "kB", Math.round(html.length / 1024), "caption groups", n, "dur", TL.duration);
}
void existsSync; void cpSync; void readFileSync;
