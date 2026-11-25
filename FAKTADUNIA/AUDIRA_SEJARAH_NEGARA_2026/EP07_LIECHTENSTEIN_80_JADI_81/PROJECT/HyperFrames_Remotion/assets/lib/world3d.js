// EP07 LIECHTENSTEIN, 80 JADI 81. HD2D: pixel-art billboard sprites (drawn on canvas at 24x32, nearest-neighbour, 8 fps steps)
// standing in a 3D tilt-shift Alpine diorama: Rhine valley, Vaduz Castle on its crag, a winding road up to a stylised Stilfser Joch.
// Warm 2400K lanterns against cool blue night fog. Everything is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, std, stage, pts } from "./lib3d.js";
import { X0, X1, Z0, Z1, NX, NZ, CX, CZ, CH, SQX, SQZ, CPX, CPZ, nz, riverZ, roadAt, buildGrid, sampler } from "./terrain.js";

// ---------- monotone cubic (Fritsch-Carlson) per channel: smooth velocity, never overshoots a key
function trackM(keys) {
  const n = keys.length, ch = keys[0].length - 1;
  const ms = [];
  for (let j = 1; j <= ch; j++) {
    const d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][j] - keys[i][j]) / Math.max(1e-4, keys[i + 1][0] - keys[i][0]));
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) continue;
      const h0 = keys[i][0] - keys[i - 1][0], h1 = keys[i + 1][0] - keys[i][0], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
    if (n > 1) { m[0] = d[0]; m[n - 1] = d[n - 2]; }
    ms.push(m);
  }
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0;
    while (keys[i + 1][0] < t) i++;
    const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
    const out = [];
    for (let j = 1; j <= ch; j++) {
      const m = ms[j - 1];
      out.push((2 * u3 - 3 * u2 + 1) * keys[i][j] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * keys[i + 1][j] + (u3 - u2) * h * m[i + 1]);
    }
    return out;
  };
}

// ---------- pixel atlas: 8 x 4 cells of 24 x 32
const CW = 24, CHT = 32, COLS = 8, ROWS = 4;
const F = { walk: 0, idle: 4, bare: 5, musket: 6, prince: 7, offWalk: 8, offPoint: 12, vA: 13, vB: 15, vC: 17, hood: 19, q: 23, pine: 24, pineS: 25, aus: 26, ita: 27, sit: 28, pineD: 29 };
function drawAtlas() {
  const cv = document.createElement("canvas");
  cv.width = CW * COLS; cv.height = CHT * ROWS;
  const G = cv.getContext("2d");
  const cell = (id, fn) => {
    const c = document.createElement("canvas"); c.width = CW; c.height = CHT;
    const x = c.getContext("2d");
    const R = (px, py, w, h, col) => { x.fillStyle = col; x.fillRect(px, py, w, h); };
    const L = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) R(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n), 1, 1, col); };
    fn(R, L);
    const im = x.getImageData(0, 0, CW, CHT), d = im.data, a = (i, j) => (i < 0 || j < 0 || i >= CW || j >= CHT ? 0 : d[(j * CW + i) * 4 + 3]);
    const mark = [];
    for (let j = 0; j < CHT; j++) for (let i = 0; i < CW; i++) if (!a(i, j) && (a(i - 1, j) || a(i + 1, j) || a(i, j - 1) || a(i, j + 1))) mark.push(i, j);
    for (let k = 0; k < mark.length; k += 2) { const o = (mark[k + 1] * CW + mark[k]) * 4; d[o] = 18; d[o + 1] = 20; d[o + 2] = 34; d[o + 3] = 255; }
    x.putImageData(im, 0, 0);
    G.drawImage(c, (id % COLS) * CW, Math.floor(id / COLS) * CHT);
  };
  const SK = "#F2C79B", SK2 = "#D69C6E", BOOT = "#24242C", GOLD = "#FFD83D", WH = "#EEF3F8", GREY = "#9AA3AD", WOOD = "#6B4425";
  const person = (R, L, o) => {
    const p = o.phase ?? -1, by = p === 1 || p === 3 ? -1 : 0;
    const tr = o.trous || "#D8DCE6", tr2 = o.trous2 || "#AEB4C2";
    // legs
    if (!o.skirt) {
      if (p === 0 || p === 2) {
        const fc = p === 0 ? tr : tr2, bc = p === 0 ? tr2 : tr;
        R(10, 23, 2, 3, bc); R(9, 26, 2, 3, bc); R(8, 29, 3, 2, BOOT);
        R(12, 23, 2, 3, fc); R(13, 26, 2, 3, fc); R(14, 29, 3, 2, BOOT);
      } else {
        const lift = p === 1 ? 1 : p === 3 ? 2 : 0;
        R(10, 23, 2, 6 - (lift === 1 ? 1 : 0), tr2); R(10, 29 - (lift === 1 ? 1 : 0), 3, 2, BOOT);
        R(12, 23, 2, 6 - (lift === 2 ? 1 : 0), tr); R(12, 29 - (lift === 2 ? 1 : 0), 3, 2, BOOT);
      }
    } else {
      for (let y = 19; y <= 28; y++) { const w = Math.floor((y - 19) / 3); R(9 - w, y + by, 6 + 2 * w, 1, o.skirt); }
      if (o.apron) R(12, 20 + by, 3, 8, o.apron);
      R(10, 29, 2, 2, BOOT); R(13, 29, 2, 2, BOOT);
    }
    // pack
    if (o.pack) { R(6, 14 + by, 3, 7, "#7A5A36"); R(6, 14 + by, 3, 1, "#5A4026"); }
    // torso
    R(9, 14 + by, 6, 9, o.coat); R(9, 14 + by, 1, 9, o.coat2 || o.coat);
    if (o.vest) R(10, 15 + by, 3, 6, o.vest);
    if (o.belt) R(9, 20 + by, 6, 1, o.belt);
    if (o.straps) L(9, 14 + by, 14, 20 + by, WH);
    if (o.sash) { L(9, 15 + by, 14, 20 + by, o.sash); L(9, 16 + by, 13, 20 + by, o.sash); }
    if (o.buttons) for (let y = 15; y < 21; y += 2) R(14, y + by, 1, 1, GOLD);
    if (o.necker) R(11, 13 + by, 4, 1, o.necker);
    // head
    R(10, 8 + by, 5, 6, SK); R(15, 11 + by, 1, 1, SK); R(13, 10 + by, 1, 1, "#1A1A22"); R(11, 11 + by, 1, 1, SK2);
    R(10, 8 + by, 2, 3, o.hair || "#5A3A22");
    if (o.braid) R(9, 11 + by, 1, 5, o.hair);
    const hc = o.hatCol || "#1C1C24";
    if (o.hat === "shako") { R(10, 3 + by, 5, 5, hc); R(9, 3 + by, 7, 1, hc); R(13, 5 + by, 1, 1, GOLD); R(14, 8 + by, 3, 1, "#111"); if (o.plume) R(11, 0 + by, 2, 3, o.plume); else R(12, 2 + by, 1, 1, WH); }
    if (o.hat === "bicorne") { R(8, 6 + by, 9, 2, hc); R(10, 4 + by, 5, 2, hc); R(8, 7 + by, 9, 1, GOLD); R(12, 5 + by, 1, 1, "#CE1126"); }
    if (o.hat === "felt") { R(9, 6 + by, 7, 2, hc); R(10, 4 + by, 5, 2, hc); R(14, 2 + by, 1, 3, "#EEF3F8"); }
    if (o.hat === "straw") { R(7, 7 + by, 11, 1, "#E2C266"); R(10, 4 + by, 5, 3, "#E2C266"); R(10, 6 + by, 5, 1, "#CE1126"); }
    if (o.hat === "scarf") { R(9, 7 + by, 6, 3, hc); R(8, 10 + by, 2, 2, hc); }
    if (o.epaul) R(11, 14 + by, 4, 1, GOLD);
    // arms and musket
    const arms = o.arms || "down";
    if (arms === "down") {
      const sw = p === 0 ? 1 : p === 2 ? -1 : 0;
      R(12 + sw, 15 + by, 2, 5, o.coat); R(12 + sw * 2, 20 + by, 2, 1, SK);
    } else if (arms === "shoulder") {
      L(11, 25 + by, 15, 2 + by, WOOD); L(13, 16 + by, 15, 3 + by, GREY); R(15, 0 + by, 1, 3, "#C9D0D8");
      R(12, 15 + by, 2, 3, o.coat); R(13, 13 + by, 2, 2, o.coat); R(14, 13 + by, 1, 1, SK);
    } else if (arms === "upright") {
      R(16, 22, 2, 7, WOOD); R(16, 5, 1, 17, GREY); R(16, 2, 1, 3, "#C9D0D8");
      R(13, 15, 3, 2, o.coat); R(15, 17, 2, 2, SK);
    } else if (arms === "up") {
      R(13, 8 + by, 2, 7, o.coat); R(13, 6 + by, 2, 2, SK); R(8, 8 + by, 2, 7, o.coat2 || o.coat); R(8, 6 + by, 2, 2, SK);
    } else if (arms === "point") {
      R(13, 15 + by, 6, 2, o.coat); R(19, 15 + by, 2, 2, SK);
      if (o.sword) L(10, 21 + by, 7, 28 + by, "#C9D0D8");
    }
  };
  const SOL = { coat: "#3E5BA8", coat2: "#2E4788", trous: "#D8DCE6", hat: "shako", belt: WH, straps: true, pack: true };
  for (let p = 0; p < 4; p++) cell(F.walk + p, (R, L) => person(R, L, { ...SOL, phase: p, arms: "shoulder" }));
  cell(F.idle, (R, L) => person(R, L, { ...SOL, arms: "upright" }));
  cell(F.bare, (R, L) => person(R, L, { ...SOL, arms: "down", pack: false }));
  cell(F.musket, (R, L) => { L(2, 30, 19, 26, GREY); L(2, 29, 7, 28, WOOD); R(2, 29, 4, 2, WOOD); R(19, 25, 2, 1, "#C9D0D8"); });
  cell(F.prince, (R, L) => person(R, L, { coat: "#22325E", coat2: "#18244A", trous: WH, trous2: "#C9D0D8", hat: "bicorne", sash: "#CE1126", epaul: true, buttons: true, arms: "point" }));
  const OFF = { coat: "#2C4C9C", coat2: "#203A7A", trous: "#D8DCE6", hat: "shako", plume: "#CE1126", epaul: true, belt: GOLD, buttons: true };
  for (let p = 0; p < 4; p++) cell(F.offWalk + p, (R, L) => person(R, L, { ...OFF, phase: p, arms: "down" }));
  cell(F.offPoint, (R, L) => person(R, L, { ...OFF, arms: "point", sword: true }));
  const VA = { coat: "#B23A3A", coat2: "#8E2A2A", skirt: "#B23A3A", apron: WH, hat: "scarf", hatCol: WH, hair: "#7A4A26" };
  const VB = { coat: "#7A5232", coat2: "#5E3E24", vest: "#3B6B48", trous: "#4A4F5A", trous2: "#3A3F4A", hat: "felt", hatCol: "#2E5E3E", hair: "#3A2A1A" };
  const VC = { coat: "#3C6FB0", coat2: "#2C5590", skirt: "#3C6FB0", apron: "#F1EFE6", hair: "#E2C266", braid: true };
  [[F.vA, VA], [F.vB, VB], [F.vC, VC]].forEach(([id, v]) => { cell(id, (R, L) => person(R, L, { ...v, arms: "down" })); cell(id + 1, (R, L) => person(R, L, { ...v, arms: "up" })); });
  for (let p = 0; p < 4; p++) cell(F.hood + p, (R) => {
    const CL = "#3A3550", CL2 = "#2A2640";
    if (p === 0 || p === 2) { R(8, 29, 3, 2, BOOT); R(14, 29, 3, 2, BOOT); } else { R(10, 29, 4, 2, BOOT); }
    for (let y = 13; y <= 28; y++) { const l = 9 - Math.floor((y - 13) / 5) - (p === 0 && y > 24 ? 1 : 0), r = 15 + Math.floor((y - 13) / 6) + (p === 2 && y > 24 ? 1 : 0); R(l, y + (p % 2 ? -1 : 0), r - l + 1, 1, y % 5 === 0 ? CL2 : CL); }
    const by = p % 2 ? -1 : 0;
    R(9, 6 + by, 7, 9, CL); R(8, 9 + by, 1, 6, CL2); R(12, 9 + by, 4, 4, "#0A0A12"); R(13, 10 + by, 1, 1, GOLD); R(15, 10 + by, 1, 1, GOLD);
  });
  cell(F.q, (R) => {
    const g = ["01110", "11011", "00011", "00110", "01100", "00000", "01100"];
    g.forEach((row, j) => [...row].forEach((c, i) => { if (c === "1") R(5 + i * 3, 4 + j * 3, 3, 3, GOLD); }));
    R(5, 4, 15, 1, "#FFF1A8");
  });
  const pine = (R, snow, dark) => {
    R(11, 26, 2, 5, "#5A3A22");
    const tiers = [[2, 11, 4], [8, 18, 6], [14, 26, 9]];
    for (const [a, b, w] of tiers) for (let y = a; y <= b; y++) {
      const hw = Math.max(1, Math.round(((y - a) / (b - a)) * w));
      R(12 - hw, y, hw * 2, 1, dark ? "#173B2D" : "#1E4D3A");
      R(12 - hw, y, Math.max(1, Math.floor(hw / 2)), 1, dark ? "#204A38" : "#2E6B4E");
      if (snow && (y - a) % 3 === 0) R(12 - hw, y, hw * 2, 1, "#EEF3F8");
    }
  };
  cell(F.pine, (R) => pine(R, false));
  cell(F.pineS, (R) => pine(R, true));
  cell(F.pineD, (R) => pine(R, false, true));
  cell(F.aus, (R, L) => person(R, L, { coat: "#F1EFE6", coat2: "#CFCBC0", trous: "#9EB6D8", trous2: "#7E96B8", hat: "shako", hatCol: "#1C1C24", belt: GOLD, epaul: true, arms: "down", sword: true }));
  cell(F.ita, (R, L) => person(R, L, { coat: "#F1EFE6", coat2: "#CFCBC0", vest: "#7A5232", trous: "#6B5A44", trous2: "#55462F", hat: "straw", necker: "#CE1126", arms: "down" }));
  cell(F.sit, (R, L) => {
    R(18, 4, 1, 22, GREY); R(18, 24, 2, 6, WOOD);
    R(9, 25, 8, 3, "#D8DCE6"); R(16, 26, 3, 4, BOOT);
    R(8, 17, 6, 9, "#3E5BA8"); R(8, 17, 1, 9, "#2E4788"); L(8, 17, 13, 23, WH);
    R(9, 11, 5, 6, SK); R(12, 13, 1, 1, "#1A1A22"); R(9, 11, 2, 3, "#5A3A22");
    R(9, 6, 5, 5, "#1C1C24"); R(8, 6, 7, 1, "#1C1C24"); R(12, 8, 1, 1, GOLD); R(11, 18, 2, 5, "#3E5BA8"); R(12, 23, 3, 1, SK);
  });
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.magFilter = tx.minFilter = THREE.NearestFilter;
  tx.generateMipmaps = false;
  return tx;
}

const pix = (w, h, draw, rep) => { const t = canvasTex(w, h, draw, rep); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; return t; };
const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp } = stage(canvas, { bg: 0x1b2440, fog: 0.006, exp: 1.0, bloom: [0.32, 0.45, 0.86] });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1866);
  bp.threshold = 0.97;

  // ---------- tilt-shift: two separable blur passes, sharp band around the subject line
  const TS = (dx, dy) => new ShaderPass({
    uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2(dx, dy) }, focus: { value: 0.46 }, band: { value: 0.1 }, amt: { value: 3.2 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 dir;uniform float focus,band,amt;varying vec2 vUv;
void main(){float d=max(0.,abs(vUv.y-focus)-band);float r=clamp(d*amt,0.,1.);vec4 s=vec4(0.);float tw=0.;
for(int i=-6;i<=6;i++){float w=exp(-float(i*i)/18.);s+=texture2D(tDiffuse,vUv+dir*float(i)*r)*w;tw+=w;}gl_FragColor=s/tw;}`,
  });
  const tsH = TS(2.6 / 1080, 0), tsV = TS(0, 2.6 / 1920);
  comp.insertPass(tsH, 2); comp.insertPass(tsV, 3);

  // ---------- sky dome and lights
  const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,hor;varying vec3 vP;void main(){float h=clamp(normalize(vP).y*1.6+.08,0.,1.);gl_FragColor=vec4(mix(hor,top,pow(h,.7)),1.);}",
  }));
  scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 400 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const lampA = new THREE.PointLight(0xffa04a, 0, 18, 1.2), lampB = new THREE.PointLight(0xffa04a, 0, 16, 1.2);
  scene.add(lampA, lampB);

  // ---------- terrain: height grid, two painted pixel maps (summer, winter)
  const { H: HG, RD } = buildGrid();
  const H = sampler(HG), RDs = sampler(RD);
  const SL = new Float32Array(NX * NZ);
  const dxg = (X1 - X0) / (NX - 1), dzg = (Z1 - Z0) / (NZ - 1);
  for (let j = 1; j < NZ - 1; j++) for (let i = 1; i < NX - 1; i++) {
    const k = j * NX + i;
    SL[k] = Math.hypot((HG[k + 1] - HG[k - 1]) / (2 * dxg), (HG[k + NX] - HG[k - NX]) / (2 * dzg));
  }
  const SLs = sampler(SL);
  const TW = 1456, TH = 992;
  const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const paint = (winter) => {
    const c = document.createElement("canvas"); c.width = TW; c.height = TH;
    const g = c.getContext("2d"), im = g.createImageData(TW, TH), d = im.data;
    for (let py = 0; py < TH; py++) for (let px = 0; px < TW; px++) {
      const x = X0 + ((px + 0.5) / TW) * (X1 - X0), z = Z0 + ((py + 0.5) / TH) * (Z1 - Z0);
      const h = H(x, z), sl = SLs(x, z), rd = RDs(x, z), n = hsh(px >> 1, py >> 1), n2 = hsh(px >> 3, py >> 3);
      const dr = Math.abs(z - riverZ(x));
      const street = (Math.abs(z - 3) < 1.25 && x > -22 && x < 32) || (Math.abs(x - SQX) < 6.2 && Math.abs(z - SQZ) < 5.2);
      let col;
      if (rd < 0.95) col = winter ? (n < 0.5 ? 0xa7a2a0 : 0x948e8a) : n < 0.3 ? 0xb8925c : n < 0.85 ? 0xc9a46a : 0xd8b87e;
      else if (rd < 1.3) col = winter ? 0xc8ccd4 : 0x8e6e44;
      else if (street) col = winter ? (n < 0.5 ? 0xdce3ea : 0xc4ccd8) : ((px >> 2) + (py >> 2)) % 2 ? 0xb7a78c : n < 0.4 ? 0x9c8c72 : 0xaa9a80;
      else if (dr < 2.1 && h < 0.05) col = winter ? (n < 0.1 ? 0x6e8aa8 : 0x2b4a6e) : n < 0.07 ? 0x8fbce8 : n < 0.5 ? 0x3a6fb0 : 0x2f5f9e;
      else if (dr < 2.8 && h < 0.2) col = winter ? 0xe4e9ef : 0xcdbb8a;
      else if (h > 25 + 3 * nz(x * 0.7, z * 0.7) || (winter && sl < 1.05)) col = sl > 0.9 ? (n < 0.5 ? 0xc9d4e3 : 0xb6c3d6) : n < 0.08 ? 0xd9e2ee : 0xeef3f8;
      else if (sl > 1.05) col = winter ? (n < 0.45 ? 0xe2e8f0 : n < 0.75 ? 0x747985 : 0x5c606b) : n < 0.33 ? 0x747985 : n < 0.66 ? 0x5c606b : 0x8c919c;
      else if (h > 14) col = n < 0.5 ? 0x6e8f55 : 0x5e7f48;
      else if (h > 1.2 || z < -6) col = n < 0.25 ? 0x2e5a3f : n < 0.8 ? 0x3a6b48 : 0x467a52;
      else {
        const fi = Math.floor((x + z * 0.3) / 6.5), fj = Math.floor(z / 4.2), f = hsh(fi, fj);
        const base = f < 0.3 ? 0x7fb04a : f < 0.55 ? 0x9cbc58 : f < 0.75 ? 0xc9b85a : f < 0.9 ? 0x6c9a44 : 0xb2c46a;
        col = (py >> 1) % 3 === 0 && f > 0.55 ? base - 0x0a0a06 : base;
        if (n < 0.06) col = 0x5f8a3c;
      }
      const [r, gg, b] = hex(col);
      const o = (py * TW + px) * 4, sh = 1 - 0.06 * n2;
      d[o] = r * sh; d[o + 1] = gg * sh; d[o + 2] = b * sh; d[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8;
    return t;
  };
  const texSummer = paint(false), texWinter = paint(true);
  const tg = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX - 1, NZ - 1);
  tg.rotateX(-Math.PI / 2);
  tg.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const tp = tg.attributes.position;
  for (let k = 0; k < tp.count; k++) tp.setY(k, HG[k]);
  tg.computeVertexNormals();
  const TER = new THREE.MeshStandardMaterial({ map: texSummer, roughness: 1 });
  const terrain = new THREE.Mesh(tg, TER);
  terrain.receiveShadow = true; terrain.castShadow = true;
  scene.add(terrain);
  // board edge, like a diorama base
  const base = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 2, 6, Z1 - Z0 + 2), std(0x3a2a1e, 0.8));
  base.position.set((X0 + X1) / 2, -3.05, (Z0 + Z1) / 2); scene.add(base);

  // ---------- buildings: pixel stone, plaster, tiles
  const stoneT = pix(32, 32, (g) => { g.fillStyle = "#B8B2A6"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#8E887C"; for (let y = 0; y < 32; y += 6) { g.fillRect(0, y, 32, 1); for (let x = (y / 6) % 2 ? 0 : 5; x < 32; x += 10) g.fillRect(x, y, 1, 6); } g.fillStyle = "#CFC9BC"; for (let k = 0; k < 14; k++) g.fillRect((k * 13) % 31, (k * 7) % 31, 2, 1); }, [3, 3]);
  const tileT = pix(32, 32, (g) => { g.fillStyle = "#9B3B2A"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#7A2C20"; for (let y = 0; y < 32; y += 4) g.fillRect(0, y, 32, 1); for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 ? 0 : 4; x < 32; x += 8) g.fillRect(x, y, 1, 4); }, [2, 2]);
  const slateT = pix(32, 32, (g) => { g.fillStyle = "#4A4F5A"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#3A3F4A"; for (let y = 0; y < 32; y += 4) g.fillRect(0, y, 32, 1); }, [2, 2]);
  const snowRoofT = pix(32, 32, (g) => { g.fillStyle = "#EEF3F8"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#C9D4E3"; for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1); }, [2, 2]);
  const facade = (wall, cols, rows, trim) => {
    const w = 16 * cols, h = 16 * rows;
    const col = pix(w, h, (g) => { g.fillStyle = wall; g.fillRect(0, 0, w, h); g.fillStyle = trim; g.fillRect(0, h - 3, w, 3); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { g.fillStyle = "#2A3044"; g.fillRect(c * 16 + 5, r * 16 + 4, 6, 7); g.fillStyle = "#6B4425"; g.fillRect(c * 16 + 4, r * 16 + 4, 1, 7); g.fillRect(c * 16 + 11, r * 16 + 4, 1, 7); } });
    const em = pix(w, h, (g) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (hsh(c * 7 + r, w + h) < 0.7) { g.fillStyle = "#FFB86A"; g.fillRect(c * 16 + 5, r * 16 + 4, 6, 7); } });
    return { col, em };
  };
  const FAC = [facade("#EDE6D6", 3, 2, "#B8B2A6"), facade("#E9D7A8", 3, 2, "#A89878"), facade("#D9C7A3", 2, 2, "#8E887C"), facade("#F1EFE6", 4, 3, "#9AA3AD")];
  const WINMATS = [];
  const facMat = (f) => { const m = new THREE.MeshStandardMaterial({ map: f.col, emissiveMap: f.em, emissive: 0xffa050, emissiveIntensity: 0, roughness: 0.9 }); WINMATS.push(m); return m; };
  const FACM = FAC.map(facMat);
  const STONE = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.95 });
  const TILE = new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.85 }), SLATE = new THREE.MeshStandardMaterial({ map: slateT, roughness: 0.8 });
  const SNOWROOF = new THREE.MeshStandardMaterial({ map: snowRoofT, roughness: 0.9 });
  const ROOFS = [];
  const prism = (w, rh, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, rh); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; };
  const add = (geo, mat, x, y, z, ry = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const house = (x, z, w, d, h, ry, v, slate) => {
    const y0 = H(x, z) - 0.2;
    add(new THREE.BoxGeometry(w, h, d), FACM[v], x, y0 + h / 2, z, ry);
    const r = add(prism(w + 0.5, w * 0.42, d + 0.5), slate ? SLATE : TILE, x, y0 + h, z, ry);
    ROOFS.push({ m: r, base: slate ? SLATE : TILE });
  };
  // north side of the main street, south side outside the square, a few toward the castle
  for (let x = -20; x < 30; x += 3.4) house(x + rnd() * 0.6, -0.9 - rnd() * 0.8, 2.8, 2.6, 2.2 + rnd() * 1.2, 0, Math.floor(rnd() * 3), rnd() < 0.25);
  for (let x = -20; x < 30; x += 3.6) if (x < -1.5) house(x + rnd() * 0.5, 7 + rnd() * 0.8, 2.9, 2.6, 2 + rnd() * 1.1, 0, Math.floor(rnd() * 3), rnd() < 0.25);
  [[-4, 13.5, 0.3], [-12, 11, 0.1], [-16, -6, 0], [4, -5.5, 0], [12, -6, 0.1]].forEach(([x, z, r], i) => house(x, z, 3, 2.7, 2.3 + (i % 3) * 0.5, r, i % 3, i % 2 === 0));
  // Landtag-ish town hall on the square, bigger, with a little tower
  add(new THREE.BoxGeometry(5.6, 4.2, 3.6), FACM[3], SQX - 9.8, 2.0, SQZ - 0.5, 0);
  ROOFS.push({ m: add(prism(6.1, 2.2, 4.1), SLATE, SQX - 9.8, 4.1, SQZ - 0.5, 0), base: SLATE });
  add(new THREE.BoxGeometry(1.2, 2.4, 1.2), STONE, SQX - 9.8, 6.6, SQZ - 0.5);
  add(new THREE.ConeGeometry(1.0, 1.8, 4), SLATE, SQX - 9.8, 8.7, SQZ - 0.5, Math.PI / 4);
  // fountain in the square
  add(new THREE.CylinderGeometry(1.1, 1.2, 0.5, 12), STONE, SQX + 1.5, 0.25, SQZ + 3.2);
  add(new THREE.CylinderGeometry(0.18, 0.2, 1.3, 8), STONE, SQX + 1.5, 0.8, SQZ + 3.2);

  // castle on the crag: keep, palace wing, round bastion, walls
  const castle = new THREE.Group(); castle.position.set(CX, CH - 0.1, CZ); scene.add(castle);
  add(new THREE.BoxGeometry(3.4, 9, 3.4), STONE, -1.4, 4.5, -1.2, 0, castle);
  add(new THREE.ConeGeometry(2.8, 3.2, 4), TILE, -1.4, 10.6, -1.2, Math.PI / 4, castle);
  add(new THREE.BoxGeometry(7.2, 4.6, 3.2), FACM[3], 1.6, 2.3, 1.6, 0, castle);
  add(prism(7.7, 2.4, 3.7), TILE, 1.6, 4.6, 1.6, 0, castle);
  add(new THREE.CylinderGeometry(2.0, 2.2, 4.4, 16), STONE, 4.6, 2.2, 3.4, 0, castle);
  add(new THREE.CylinderGeometry(2.25, 2.25, 0.5, 16), STONE, 4.6, 4.6, 3.4, 0, castle);
  add(new THREE.BoxGeometry(9.5, 1.6, 0.6), STONE, 0.6, 0.8, 4.4, 0, castle);
  add(new THREE.BoxGeometry(0.6, 1.6, 7.5), STONE, -4.6, 0.8, 0.4, 0, castle);
  const GATE = new THREE.Vector3(CX + 1.3, CH, CZ + 5.3);
  // flags: Liechtenstein blue over red with a gold crown
  const flagT = pix(30, 18, (g) => { g.fillStyle = "#002B7F"; g.fillRect(0, 0, 30, 9); g.fillStyle = "#CE1126"; g.fillRect(0, 9, 30, 9); g.fillStyle = "#FFD83D"; g.fillRect(5, 3, 6, 3); g.fillRect(5, 2, 1, 1); g.fillRect(7, 1, 2, 1); g.fillRect(10, 2, 1, 1); });
  const FLAGS = [];
  const flag = (x, y, z, s) => {
    add(new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 3.2 * s, 6), STONE, x, y + 1.6 * s, z);
    const g = new THREE.PlaneGeometry(1.9 * s, 1.15 * s, 10, 3); g.translate(0.95 * s, 0, 0);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: flagT, side: THREE.DoubleSide, roughness: 0.8 }));
    m.position.set(x, y + 2.6 * s, z); scene.add(m);
    FLAGS.push({ g, base: g.attributes.position.array.slice(), s });
  };
  flag(CX - 1.4, CH + 12.2, CZ - 1.2, 1.1);
  flag(SQX - 9.8, 9.6, SQZ - 0.5, 0.8);
  flag(CPX + 1.5, H(CPX + 1.5, CPZ - 2) , CPZ - 2, 1);

  // camp on the pass: tents, lantern posts, fire, a striped border post
  const tentT = pix(32, 16, (g) => { g.fillStyle = "#E8E0CC"; g.fillRect(0, 0, 32, 16); g.fillStyle = "#C9BFA6"; for (let x = 0; x < 32; x += 6) g.fillRect(x, 0, 2, 16); });
  const TENT = new THREE.MeshStandardMaterial({ map: tentT, roughness: 0.9 });
  const camp = [[-4, -3, 0.4], [3.5, -4, -0.3], [-5, 3, 1.2], [4.5, 2.5, -1], [0, -6.5, 0.1]];
  camp.forEach(([dx, dz, r]) => add(prism(2.4, 1.7, 2.6), TENT, CPX + dx, H(CPX + dx, CPZ + dz) - 0.05, CPZ + dz, r));
  const LANTM = new THREE.MeshStandardMaterial({ color: 0x3a2a10, emissive: 0xffa04a, emissiveIntensity: 0 });
  const LANTS = [];
  const lantern = (x, z, h = 2) => {
    const y = H(x, z);
    add(new THREE.CylinderGeometry(0.05, 0.06, h, 6), std(0x3a2a1e, 0.8), x, y + h / 2, z);
    const m = add(new THREE.BoxGeometry(0.32, 0.4, 0.32), LANTM, x, y + h + 0.1, z); m.castShadow = false;
    LANTS.push(m);
  };
  [[-2, 0.5], [2.4, -1.5], [6.5, 4.5], [-6.5, -1]].forEach(([dx, dz]) => lantern(CPX + dx, CPZ + dz));
  [[-5.8, -4.6], [5.8, -4.6], [-5.8, 4.6], [5.8, 4.6]].forEach(([dx, dz]) => lantern(SQX + dx, SQZ + dz, 2.4));
  lantern(GATE.x + 1.2, GATE.z + 0.3, 1.6); lantern(GATE.x - 1.6, GATE.z + 0.2, 1.6);
  const FIRE = new THREE.MeshStandardMaterial({ color: 0x4a1a08, emissive: 0xff7a20, emissiveIntensity: 0 });
  const fire = add(new THREE.ConeGeometry(0.45, 0.9, 6), FIRE, CPX + 0.3, H(CPX, CPZ) + 0.4, CPZ + 0.6); fire.castShadow = false;
  for (let k = 0; k < 5; k++) add(new THREE.BoxGeometry(0.9, 0.16, 0.16), std(0x5a3a22, 0.9), CPX + 0.3, H(CPX, CPZ) + 0.1, CPZ + 0.6, (k * Math.PI) / 5);
  const postT = pix(4, 16, (g) => { for (let y = 0; y < 16; y += 4) { g.fillStyle = (y / 4) % 2 ? "#EEF3F8" : "#CE1126"; g.fillRect(0, y, 4, 4); } });
  add(new THREE.BoxGeometry(0.3, 2.2, 0.3), new THREE.MeshStandardMaterial({ map: postT }), CPX + 8, H(CPX + 8, CPZ + 6) + 1.1, CPZ + 6);

  // bunting across the street and square for the return (instanced triangles)
  const BUNT = [];
  const strings = [[[9, 4.8, 0.6], [9, 4.8, 5.6]], [[13, 4.8, 0.6], [13, 4.8, 5.6]], [[17, 4.8, 0.6], [17, 4.8, 5.6]], [[21, 4.8, 0.6], [21, 4.8, 5.6]], [[25, 4.4, 0.6], [25, 4.4, 5.6]], [[0.4, 4.6, 4.2], [12, 4.6, 4.2]], [[0.4, 4.6, 4.2], [0.4, 4.6, 14]]];
  const triG = new THREE.BufferGeometry(); triG.setAttribute("position", new THREE.Float32BufferAttribute([-0.22, 0, 0, 0.22, 0, 0, 0, -0.45, 0], 3)); triG.computeVertexNormals();
  let nB = 0; strings.forEach(([a, b]) => { nB += Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.6); });
  const bunt = new THREE.InstancedMesh(triG, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 }), nB);
  { let k = 0; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), cols = [0x002b7f, 0xce1126, 0xffd83d];
    strings.forEach(([a, b]) => { const n = Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.6); const ry = Math.atan2(-(b[2] - a[2]), b[0] - a[0]); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry);
      for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; m4.compose(new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] - 0.7 * Math.sin(Math.PI * u), a[2] + (b[2] - a[2]) * u), q, new THREE.Vector3(1, 1, 1)); bunt.setMatrixAt(k, m4); bunt.setColorAt(k, new THREE.Color(cols[k % 3])); k++; } }); }
  scene.add(bunt);

  // Garibaldi threat: a red arrow over the far peaks that stops short of the pass
  const arrowG = new THREE.Group(); scene.add(arrowG);
  const ARM = new THREE.MeshBasicMaterial({ color: 0xce1126, fog: false, transparent: true, depthTest: false });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 1).translate(0, 0, 0.5), ARM); arrowG.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.6, 4).rotateX(Math.PI / 2), ARM); arrowG.add(head);
  const AR0 = new THREE.Vector3(CPX + 15, H(CPX, CPZ) + 10, CPZ + 7), AR1 = new THREE.Vector3(CPX + 6.5, H(CPX, CPZ) + 5, CPZ - 1.5), ARL = AR0.distanceTo(AR1);
  arrowG.position.copy(AR0); arrowG.lookAt(AR1); shaft.renderOrder = head.renderOrder = 5;

  // ---------- sprite system: one instanced billboard batch + ground blob shadows
  const atlas = drawAtlas();
  const N = 760;
  const IP = new Float32Array(N * 3), ID = new Float32Array(N * 4), IE = new Float32Array(N * 2);
  const sg = new THREE.InstancedBufferGeometry();
  const pg = new THREE.PlaneGeometry(0.75, 1); pg.translate(0, 0.5, 0);
  sg.index = pg.index; sg.setAttribute("position", pg.attributes.position); sg.setAttribute("uv", pg.attributes.uv);
  const aP = new THREE.InstancedBufferAttribute(IP, 3), aD = new THREE.InstancedBufferAttribute(ID, 4), aE = new THREE.InstancedBufferAttribute(IE, 2);
  aP.setUsage(THREE.DynamicDrawUsage); aD.setUsage(THREE.DynamicDrawUsage); aE.setUsage(THREE.DynamicDrawUsage);
  sg.setAttribute("iPos", aP); sg.setAttribute("iData", aD); sg.setAttribute("iExtra", aE);
  sg.instanceCount = N;
  const SU = {
    map: { value: atlas }, cells: { value: new THREE.Vector2(COLS, ROWS) }, tint: { value: new THREE.Color(1, 1, 1) },
    fogC: { value: new THREE.Color() }, fogD: { value: 0.006 }, lampPos: { value: new THREE.Vector3() }, lampCol: { value: new THREE.Color(0, 0, 0) }, lampR: { value: 9 },
  };
  const VS = `attribute vec3 iPos;attribute vec4 iData;attribute vec2 iExtra;uniform vec2 cells;uniform float flatm;
varying vec2 vUv;varying vec2 vLoc;varying float vA;varying float vGlow;varying float vDist;varying vec3 vBase;
void main(){float sc=iData.y;vA=iData.z;vGlow=iExtra.x;vBase=iPos;vLoc=uv;
 if(sc<=0.0||vA<=0.0||(flatm>0.5&&iExtra.y>0.5)){gl_Position=vec4(2.,2.,2.,1.);return;}
 vec2 cell=vec2(mod(iData.x,cells.x),floor(iData.x/cells.x));vec2 u=uv;if(iData.w>0.5)u.x=1.-u.x;
 vUv=vec2((cell.x+u.x)/cells.x,1.-(cell.y+1.-u.y)/cells.y);
 vec3 wp;
 if(flatm<0.5){vec3 r=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);r=normalize(vec3(r.x,0.,r.z));
  vec3 cu=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);vec3 up=normalize(mix(vec3(0.,1.,0.),cu,.3));
  wp=iPos+r*position.x*sc+up*position.y*sc;}
 else{wp=iPos+vec3(position.x*sc*1.05,.05,(position.y-.5)*sc*.42);}
 vec4 mv=viewMatrix*vec4(wp,1.);vDist=-mv.z;gl_Position=projectionMatrix*mv;}`;
  const spriteMat = new THREE.ShaderMaterial({
    uniforms: { ...SU, flatm: { value: 0 } }, vertexShader: VS, side: THREE.DoubleSide,
    fragmentShader: `uniform sampler2D map;uniform vec3 tint,fogC,lampPos,lampCol;uniform float fogD,lampR;
varying vec2 vUv;varying float vA;varying float vGlow;varying float vDist;varying vec3 vBase;
void main(){vec4 c=texture2D(map,vUv);if(c.a<.5)discard;
 vec2 px=floor(vUv*vec2(${CW * COLS}.,${CHT * ROWS}.));float h=fract(sin(dot(px,vec2(12.9898,78.233)))*43758.5453);if(h>vA)discard;
 float ld=distance(vBase,lampPos);vec3 col=c.rgb*tint+c.rgb*lampCol*clamp(1.-ld/lampR,0.,1.);
 if(vGlow>0.)col=c.rgb*(1.+vGlow);
 float f=1.-exp(-fogD*fogD*vDist*vDist);col=mix(col,fogC,f*(vGlow>0.?.2:1.));gl_FragColor=vec4(col,1.);}`,
  });
  const blobMat = new THREE.ShaderMaterial({
    uniforms: { ...SU, flatm: { value: 1 } }, vertexShader: VS, transparent: true, depthWrite: false,
    fragmentShader: "varying vec2 vLoc;varying float vA;void main(){float r=length((vLoc-.5)*2.);gl_FragColor=vec4(0.,0.01,.04,smoothstep(1.,.35,r)*.34*min(1.,vA*1.5));}",
  });
  const sprites = new THREE.Mesh(sg, spriteMat), blobs = new THREE.Mesh(sg, blobMat);
  sprites.frustumCulled = blobs.frustumCulled = false;
  blobs.renderOrder = 1;
  scene.add(blobs, sprites);
  const setS = (i, x, y, z, frame, sc, a = 1, flip = 0, glow = 0, noBlob = 0) => {
    IP[i * 3] = x; IP[i * 3 + 1] = y; IP[i * 3 + 2] = z;
    ID[i * 4] = frame; ID[i * 4 + 1] = sc; ID[i * 4 + 2] = a; ID[i * 4 + 3] = flip;
    IE[i * 2] = glow; IE[i * 2 + 1] = noBlob;
  };
  const hide = (i) => { ID[i * 4 + 1] = 0; ID[i * 4 + 2] = 0; };

  // indices
  const SOL = 0, HOOD = 80, PRINCE = 81, OFFI = 82, SEN = 83, QM = 85, VIL = 86, NV = 40, MUS = 126, PINE = 206;
  // pines on slopes and the far bank, away from road, town, castle and camp
  const PINES = [];
  for (let k = 0; k < 9000 && PINES.length < N - PINE; k++) {
    const x = X0 + 2 + rnd() * (X1 - X0 - 4), z = Z0 + 2 + rnd() * (Z1 - Z0 - 4);
    const h = H(x, z), sl = SLs(x, z);
    if (h < 0.6 || h > 25 || sl > 1.5 || RDs(x, z) < 2.4) continue;
    if (x > -24 && x < 32 && z > -6 && z < 17) continue;
    if (Math.hypot(x - CX, z - CZ) < 9 || Math.hypot(x - CPX, z - CPZ) < 12) continue;
    if (rnd() > 0.55 + 0.4 * clamp01((h - 2) / 8)) continue;
    PINES.push({ x, y: h - 0.1, z, s: 2.8 + rnd() * 1.9, d: rnd() < 0.4 });
  }

  // soldier slots: square formation 10 x 8 facing west (toward the prince and the castle)
  const FORM = (i) => ({ x: SQX - 2.6 + (i % 10) * 0.86, z: SQZ - 2.7 + Math.floor(i / 10) * 0.74 });
  const PR = { x: SQX - 4.9, z: SQZ + 0.2 };
  const CAMPS = Array.from({ length: 80 }, (_, i) => {
    const a = (i / 80) * Math.PI * 2 * 3.7 + rnd() * 0.4, r = 2.2 + ((i * 37) % 80) / 80 * 6.5;
    return { x: CPX + Math.cos(a) * r, z: CPZ + Math.sin(a) * r * 0.85 };
  });
  const side4 = (z) => (z > 3 ? 4.35 : 1.6);
  const VSL = [];
  for (let i = 0; i < NV; i++) {
    const side = i % 2, k = i >> 1;
    VSL.push({ par: { x: 9.6 + k * 1.05 + (side ? 0.4 : 0), z: side ? 1.45 : 4.75 }, sq: { x: SQX - 5.6 + (i % 14) * 0.95, z: i < 14 ? SQZ + 4.6 : i < 26 ? SQZ + 5.4 : SQZ - 4.4 + ((i - 26) % 7) * 1.2 }, v: [F.vA, F.vB, F.vC][i % 3], ph: rnd() });
  }

  // column timing
  const T4 = A("s4:Mereka"), T5 = A("s4:Dua"), TD = A("s5:dan"), TSAT = A("s6:satu");
  const head1 = (t) => 37 + 1.45 * t;
  const head4 = (t) => 102 + 1.35 * (t - K.s4);
  const headP = (t) => 31.5 - 1.5 * (t - TD);
  const headN = (t) => 51 - 1.2 * (t - K.s6);
  const walkF = (t, i) => (Math.floor(t * 8) + i * 3) % 4;
  const camRight = new THREE.Vector3();
  const flipFor = (tx, tz, dir) => ((tx * dir) * camRight.x + (tz * dir) * camRight.z < 0 ? 1 : 0);
  const onRoad = (s, lat) => { const p = roadAt(s, lat); return { x: p.x, z: p.z, y: H(p.x, p.z) - 0.02, tx: p.tx, tz: p.tz }; };

  // ---------- particles: snow, mist, stars
  const snow = pts(scene, 1600, { color: 0xffffff, size: 0.16, add: false, opacity: 0.9 });
  const sseed = Array.from({ length: 1600 }, () => [rnd(), rnd(), rnd()]);
  const mist = pts(scene, 260, { color: 0x8fa3d0, size: 9, add: false, opacity: 0.12 });
  const mseed = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd()]);
  const stars = pts(scene, 500, { color: 0xdfe8ff, size: 1.6, add: true, opacity: 0 });
  stars.m.fog = false;
  for (let i = 0; i < 500; i++) { const a = rnd() * Math.PI * 2, e = 0.12 + rnd() * 1.2; stars.pos[i * 3] = 420 * Math.cos(a) * Math.cos(e); stars.pos[i * 3 + 1] = 420 * Math.sin(e); stars.pos[i * 3 + 2] = 420 * Math.sin(a) * Math.cos(e); }
  stars.commit();

  // ---------- light presets, switched under the pixel wipes
  const P = {
    day: { top: 0x4f86d0, hor: 0xd4e6f2, fog: 0xc6d8e8, fd: 0.0042, hemi: 1.15, hs: 0xdde8f5, hg: 0x5a6a48, sun: 2.7, sc: 0xffe9c8, el: 0.75, az: -0.55, tint: [1.05, 1.05, 1.05], win: 0, lan: 0, star: 0, mist: 0 },
    dusk: { top: 0x34477f, hor: 0xf0a468, fog: 0xb98e7e, fd: 0.006, hemi: 0.75, hs: 0xc8a0a8, hg: 0x3a3040, sun: 2.0, sc: 0xff9450, el: 0.24, az: -1.2, tint: [1.02, 0.88, 0.8], win: 0.8, lan: 0.8, star: 0, mist: 0 },
    night: { top: 0x060a1e, hor: 0x1b2440, fog: 0x1b2440, fd: 0.009, hemi: 0.5, hs: 0x5a70b8, hg: 0x101828, sun: 0.6, sc: 0x8fa8e0, el: 0.9, az: 0.8, tint: [0.56, 0.64, 0.9], win: 1.8, lan: 3.0, star: 1, mist: 0.35 },
    dawn: { top: 0x5c6fae, hor: 0xffc49a, fog: 0xd9b9ac, fd: 0.0055, hemi: 0.85, hs: 0xc9c0d8, hg: 0x403848, sun: 2.0, sc: 0xffae72, el: 0.2, az: 0.9, tint: [1.02, 0.92, 0.88], win: 0.2, lan: 0.6, star: 0.15, mist: 0.15 },
    fog: { top: 0x050816, hor: 0x1b2440, fog: 0x1b2440, fd: 0.016, hemi: 0.42, hs: 0x4a60a8, hg: 0x0c1220, sun: 0.4, sc: 0x8fa8e0, el: 0.9, az: 0.8, tint: [0.5, 0.58, 0.86], win: 1.5, lan: 3.4, star: 0.5, mist: 1 },
    winter: { top: 0x8396b4, hor: 0xe3e9f0, fog: 0xd6dee8, fd: 0.0068, hemi: 1.05, hs: 0xe6edf5, hg: 0x8c96a8, sun: 1.4, sc: 0xf2f4ff, el: 0.5, az: -0.4, tint: [0.96, 0.98, 1.04], win: 0.4, lan: 0.3, star: 0, mist: 0 },
    wdusk: { top: 0x26355f, hor: 0xe7a27a, fog: 0x8c8aa0, fd: 0.0048, hemi: 0.7, hs: 0xa8b0d0, hg: 0x40485a, sun: 1.2, sc: 0xffa070, el: 0.16, az: -1.0, tint: [0.88, 0.84, 0.92], win: 1.6, lan: 2.6, star: 0.3, mist: 0 },
  };
  const EK = [[0, "day"], [K.s4 - 0.01, "day"], [K.s4, "dusk"], [T4 - 0.01, "dusk"], [T4, "night"], [K.s5 - 0.01, "night"], [K.s5, "dawn"], [TD - 0.01, "dawn"], [TD, "day"], [K.s6 - 0.01, "day"], [K.s6, "fog"], [K.s7 - 0.01, "fog"], [K.s7, "winter"], [A("s7:Sampai"), "winter"], [K.s8 + 4, "wdusk"], [K.dur + 1, "wdusk"]];
  const cA = new THREE.Color(), cB = new THREE.Color();
  const lc = (a, b, u) => cA.set(a).lerp(cB.set(b), u).clone();
  const env = (t) => {
    let i = 0; while (i < EK.length - 2 && EK[i + 1][0] <= t) i++;
    const a = P[EK[i][1]], b = P[EK[i + 1][1]], u = clamp01((t - EK[i][0]) / Math.max(1e-3, EK[i + 1][0] - EK[i][0]));
    const o = {};
    for (const k in a) o[k] = typeof a[k] === "number" && !["top", "hor", "fog", "hs", "hg", "sc"].includes(k) ? a[k] + (b[k] - a[k]) * u : Array.isArray(a[k]) ? a[k].map((v, j) => v + (b[k][j] - v) * u) : lc(a[k], b[k], u);
    return o;
  };

  // ---------- camera: each station is a target plus an offset on a monotone curve; stations change under the wipes
  const v3 = (o) => [o.x, o.y, o.z];
  const colMid1 = (t) => { const p = onRoad(head1(t) - 7, 0); return [p.x, p.y + 0.9, p.z]; };
  const offP = (t) => { const p = onRoad(head4(t) + 1.6, 0); return [p.x, p.y + 1, p.z]; };
  const hoodS = (t) => headN(t) + 20 * 0.9 + 0.5;
  const nightT = (t) => { const a = onRoad(headN(t) + 8, 0), b = onRoad(hoodS(t), 0), u = ramp(t, TSAT - 1.2, A("s6:Siapa") + 1.2); return [a.x + (b.x - a.x) * u, a.y + 1 + 0.2 * u + (b.y - a.y) * u, a.z + (b.z - a.z) * u]; };
  const paradeT = (t) => { const p = onRoad(headP(t) + 3, 0); return [p.x, 1, p.z]; };
  const ST = [
    { t0: -1, tgt: colMid1, off: trackM([[0, 9, 7.5, 13], [K.s1e, 6.5, 6.2, 11.5], [K.s2, 6, 6, 11]]) },
    { t0: K.s2, tgt: trackM([[K.s2, 8, 4, -6], [K.s3, 4, 6, -8]]), off: trackM([[K.s2, 18, 34, 66], [A("s2:Tahun"), 10, 31, 64], [K.s3, 4, 30, 63]]) },
    { t0: K.s3, tgt: trackM([[K.s3, PR.x + 0.8, 1.3, PR.z], [A("s3:menyerahkan"), PR.x + 2, 1.2, PR.z], [A("s3:syarat"), SQX, 1.6, SQZ], [A("s3:Parlemennya"), SQX + 2, 2.2, SQZ], [K.s4, SQX + 4, 2.4, SQZ - 1]]),
      off: trackM([[K.s3, -1.2, 2.6, 8.8], [A("s3:menyerahkan"), 0, 3.8, 11], [A("s3:syarat"), 3, 7, 15.5], [A("s3:Parlemennya"), 2, 9, 18], [K.s4, 0, 10, 19]]) },
    { t0: K.s4, tgt: offP, off: trackM([[K.s4, 7.5, 4.5, 9], [T4, 6, 4, 8.5]]) },
    { t0: T4, tgt: trackM([[T4, CPX, H(CPX, CPZ) + 1.2, CPZ], [A("s4:Italia"), CPX + 4, H(CPX, CPZ) + 3, CPZ - 3], [T5, CPX + 7, H(CPX, CPZ) + 4.5, CPZ - 5]]),
      off: trackM([[T4, -8, 7, 13], [A("s4:Italia"), -15, 9, 17], [T5, -19, 10, 19]]) },
    { t0: T5, tgt: trackM([[T5, GATE.x + 0.5, CH + 1.4, GATE.z], [K.s5, GATE.x - 0.5, CH + 2.2, GATE.z - 0.5]]), off: trackM([[T5, 5, 2.6, 8], [K.s5, 3.5, 3.4, 9.5]]) },
    { t0: K.s5, tgt: trackM([[K.s5, CPX, H(CPX, CPZ) + 1, CPZ], [TD, CPX - 1, H(CPX, CPZ) + 1.2, CPZ + 1]]), off: trackM([[K.s5, 11, 6, 9], [A("s5:berakhir"), 8, 5, 11], [TD, 5, 4.6, 12]]) },
    { t0: TD, tgt: paradeT, off: trackM([[TD, -9, 9.5, 11], [K.s6, -8, 9, 10.5]]) },
    { t0: K.s6, tgt: nightT, off: trackM([[K.s6, 9, 7.5, 15], [TSAT - 0.5, 6, 6, 13.5], [A("s6:Siapa") + 1, 4.4, 2.2, 9], [A("s6:Sejarawan"), 3.8, 2, 8.4], [K.s7, 3.4, 2, 8]]) },
    { t0: K.s7, tgt: trackM([[K.s7, SQX + 0.5, 1.2, SQZ + 0.5], [A("s7:membubarkan"), SQX + 1, 1.1, SQZ + 0.2], [A("s7:Sampai"), SQX + 1, 1.2, SQZ], [K.s8, SQX, 2, SQZ - 2], [K.end, 4, 7, -10], [K.dur, 3, 8, -12]]),
      off: trackM([[K.s7, 1.5, 4.5, 11], [A("s7:membubarkan"), 1, 5.5, 12.5], [A("s7:Sampai"), 0.5, 7.5, 14.5], [K.s8, -1, 12, 22], [K.end, -6, 30, 62], [K.dur, -7, 33, 66]]) },
  ];
  const look = new THREE.Vector3(), tmp = new THREE.Vector3();
  const tags = ["tagJ", "tagR"].map((id) => document.getElementById(id));

  return (t) => {
    let si = 0; while (si < ST.length - 1 && t >= ST[si + 1].t0) si++;
    const st = ST[si], tg = st.tgt(t), of = st.off(t);
    cam.position.set(tg[0] + of[0] + Math.sin(t * 0.41) * 0.18, tg[1] + of[1] + Math.sin(t * 0.33) * 0.1, tg[2] + of[2] + Math.cos(t * 0.37) * 0.15);
    look.set(tg[0], tg[1], tg[2]);
    cam.lookAt(look);
    cam.updateMatrixWorld();
    camRight.setFromMatrixColumn(cam.matrixWorld, 0);

    // light
    const E = env(t);
    skyU.top.value.copy(E.top); skyU.hor.value.copy(E.hor);
    scene.fog.color.copy(E.fog); scene.fog.density = E.fd;
    hemi.intensity = E.hemi; hemi.color.copy(E.hs); hemi.groundColor.copy(E.hg);
    sun.intensity = E.sun; sun.color.copy(E.sc);
    sun.target.position.copy(look);
    sun.position.set(look.x + Math.cos(E.az) * Math.cos(E.el) * 160, look.y + Math.sin(E.el) * 160, look.z + Math.sin(E.az) * Math.cos(E.el) * 160);
    SU.tint.value.setRGB(...E.tint); SU.fogC.value.copy(E.fog); SU.fogD.value = E.fd;
    for (const m of WINMATS) m.emissiveIntensity = E.win;
    LANTM.emissiveIntensity = E.lan * (t >= T5 && t < K.s5 ? 0.45 : 0.9);
    for (const m of WINMATS) m.emissiveIntensity = E.win * (t >= T5 && t < K.s5 ? 0.5 : 1);
    FIRE.emissiveIntensity = E.lan * (0.8 + 0.5 * Math.sin(t * 23) * Math.sin(t * 7));
    stars.m.opacity = E.star * 0.9;
    const winter = t >= K.s7 - 0.01;
    TER.map = winter ? texWinter : texSummer;
    for (const r of ROOFS) r.m.material = winter ? SNOWROOF : r.base;
    bunt.visible = t >= TD - 0.05 && t < K.s6;
    // lamps: camp, castle gate, the column's lantern at night, the square at dusk
    let lp = null;
    if (t >= T4 && t < T5) lp = [CPX, H(CPX, CPZ) + 2.2, CPZ];
    else if (t >= T5 && t < K.s5) lp = [GATE.x, CH + 2.6, GATE.z + 3];
    else if (t >= K.s5 && t < TD) lp = [CPX, H(CPX, CPZ) + 2.2, CPZ];
    else if (t >= K.s6 && t < K.s7) { const p = onRoad(headN(t) - 0.6, 0.5); lp = [p.x, p.y + 1.6, p.z]; }
    const gate = t >= T5 && t < K.s5;
    if (lp) { lampA.position.set(...lp); lampA.intensity = E.lan * (gate ? 1.6 : 7); SU.lampPos.value.set(...lp); SU.lampCol.value.setRGB(1.0, 0.6, 0.28).multiplyScalar(Math.min(gate ? 0.35 : 1.1, E.lan * 0.4)); }
    else { lampA.intensity = 0; SU.lampCol.value.setRGB(0, 0, 0); }
    lampB.position.set(SQX, 3, SQZ); lampB.intensity = t > K.s7 ? E.lan * 18 : 0;
    if (t >= K.s7) { SU.lampPos.value.set(SQX, 2, SQZ); SU.lampCol.value.setRGB(1, 0.6, 0.3).multiplyScalar(E.lan * 0.25); SU.lampR.value = 14; } else SU.lampR.value = 9;
    // the night lantern travels with the column
    const sh = 30 + 30 * ramp(t, K.s8, K.end) + (si === 1 ? 30 : 0);
    Object.assign(sun.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh }); sun.shadow.camera.updateProjectionMatrix();
    // tilt-shift band follows the shot: wide shots blur more
    const wideShot = si === 1 || (si === 9 && t > K.s8);
    tsH.uniforms.amt.value = tsV.uniforms.amt.value = wideShot ? 4.2 : 3.2;

    // flags
    for (const f of FLAGS) { const p = f.g.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 2] = f.base[i + 2] + Math.sin(t * 3.2 + p[i] * 2.4 / f.s) * 0.1 * f.s * (p[i] / (1.9 * f.s)); f.g.attributes.position.needsUpdate = true; }
    // arrow
    const ag = ramp(t, A("s4:Italia") - 0.2, A("s4:Garibaldi") + 0.4);
    arrowG.visible = t > A("s4:Italia") - 0.3 && t < T5;
    shaft.scale.z = Math.max(0.01, ARL * ag - 2); head.position.z = Math.max(0.5, ARL * ag - 1);
    ARM.opacity = 0.92 * (Math.floor(t * 4) % 2 || ag < 1 ? 1 : 0.65);

    // ---------- sprites
    // pines
    PINES.forEach((p, k) => setS(PINE + k, p.x, p.y, p.z, winter ? F.pineS : p.d ? F.pineD : F.pine, p.s, 1, k % 2, 0, 0));
    for (let k = PINES.length; k < N - PINE; k++) hide(PINE + k);
    // soldiers
    for (let i = 0; i < 80; i++) {
      const idx = SOL + i, r = i >> 1, lat = i & 1 ? 0.34 : -0.34;
      if (t < K.s3) { const p = onRoad(head1(t) - r * 0.95, lat); setS(idx, p.x, p.y, p.z, F.walk + walkF(t, i), 1.9, 1, flipFor(p.tx, p.tz, 1)); }
      else if (t < K.s4) { const f = FORM(i); setS(idx, f.x, 0, f.z, F.idle, 1.9, 1, 1); }
      else if (t < T4) { const p = onRoad(head4(t) - r * 0.95, lat); setS(idx, p.x, p.y, p.z, F.walk + walkF(t, i), 1.9, 1, flipFor(p.tx, p.tz, 1)); }
      else if (t < T5) { const c = CAMPS[i]; setS(idx, c.x, H(c.x, c.z), c.z, i % 7 === 0 ? F.sit : F.idle, 1.9, 1, c.x < CPX ? 0 : 1); }
      else if (t < K.s5) hide(idx);
      else if (t < TD) { const c = CAMPS[i], up = t > A("s5:berakhir") + (i % 9) * 0.07; setS(idx, c.x, H(c.x, c.z), c.z, up ? F.idle : i % 3 ? F.sit : F.idle, 1.9, 1, c.x < CPX ? 0 : 1); }
      else if (t < K.s6) { const p = onRoad(headP(t) + r * 0.95, lat); setS(idx, p.x, p.y, p.z, F.walk + walkF(t, i), 1.9, 1, flipFor(p.tx, p.tz, -1)); }
      else if (t < K.s7) { const rr = i >> 2, ll = ((i & 3) - 1.5) * 0.42; const p = onRoad(headN(t) + rr * 0.9, ll); setS(idx, p.x, p.y, p.z, F.walk + walkF(t, i), 1.9, 1, flipFor(p.tx, p.tz, -1)); }
      else {
        const f = FORM(i), row = Math.floor(i / 10), lay = A("s7:membubarkan") + 0.15 + row * 0.12 + (i % 10) * 0.02;
        const gone = 1 - ramp(t, A("s7:netral") + row * 0.16 + (i % 10) * 0.03, A("s7:netral") + row * 0.16 + (i % 10) * 0.03 + 0.7);
        if (gone <= 0.001) hide(idx); else setS(idx, f.x, 0, f.z, t > lay ? F.bare : F.idle, 1.9, gone, 1);
      }
      // muskets laid down in the snow
      const m = MUS + i;
      if (t >= K.s7) { const f = FORM(i), row = Math.floor(i / 10), lay = A("s7:membubarkan") + 0.15 + row * 0.12 + (i % 10) * 0.02; if (t > lay) setS(m, f.x - 0.42, 0, f.z + 0.12, F.musket, 1.6, 1 - 0.6 * ramp(t, K.s8 + 3, K.end), 1, 0, 1); else hide(m); }
      else hide(m);
    }
    // the 81st: hooded at the tail, then the two candidate guesses, then hooded again
    const hs = hoodS(t);
    if (t >= K.s6 && t < K.s7) {
      const p = onRoad(hs, 0), a = ramp(t, TSAT - 0.15, TSAT + 0.6);
      const guess = t > A("s6:perwira") - 0.05 && t < A("s6:Ada#2") ? F.aus : t > A("s6:petani") - 0.05 && t < A("s6:Sejarawan") ? F.ita : F.hood + walkF(t, 5);
      setS(HOOD, p.x, p.y, p.z, guess, 1.9, a, flipFor(p.tx, p.tz, -1));
      const bob = Math.sin(t * 5) * 0.08;
      if (a > 0) setS(QM, p.x, p.y + 2.05 + bob, p.z, F.q, 1.25, a, 0, 0.45, 1); else hide(QM);
    } else { hide(HOOD); hide(QM); }
    // prince and commander
    if (t >= K.s3 && t < K.s4) setS(PRINCE, PR.x, 0.45, PR.z, F.prince, 2.0, 1, 0); else hide(PRINCE);
    if (t >= K.s4 && t < T4) { const p = onRoad(head4(t) + 1.6, 0); setS(OFFI, p.x, p.y, p.z, F.offWalk + walkF(t, 1), 2.0, 1, flipFor(p.tx, p.tz, 1)); }
    else if (t >= T4 && t < T5) setS(OFFI, CPX + 5.5, H(CPX + 5.5, CPZ - 3), CPZ - 3, F.offPoint, 2.0, 1, 0);
    else if (t >= TD && t < K.s6) { const p = onRoad(headP(t) - 1.4, 0); setS(OFFI, p.x, p.y, p.z, F.offWalk + walkF(t, 1), 2.0, 1, flipFor(p.tx, p.tz, -1)); }
    else hide(OFFI);
    // two sentries at the castle gate
    if (t >= T5 && t < K.s5) { setS(SEN, GATE.x - 0.9, CH, GATE.z, F.idle, 1.9, 1, 0); setS(SEN + 1, GATE.x + 0.9, CH, GATE.z, F.idle, 1.9, 1, 1); }
    else { hide(SEN); hide(SEN + 1); }
    // villagers: watching in the square, cheering the parade, back in the winter square
    for (let i = 0; i < NV; i++) {
      const v = VSL[i], idx = VIL + i;
      if (t >= K.s3 && t < K.s4 && i < 14) setS(idx, v.sq.x, 0, v.sq.z, v.v, 1.8, 1, i % 2);
      else if (t >= TD && t < K.s6) { const up = Math.floor(t * 4 + v.ph * 4) % 2; setS(idx, v.par.x, 0, side4(v.par.z), v.v + up, 1.35, 1, i % 2); }
      else if (t >= K.s7 && i < 26) { const cheer = t > K.s8 + 1 && Math.floor(t * 3 + v.ph * 3) % 2; setS(idx, v.sq.x, 0, v.sq.z, v.v + (cheer ? 1 : 0), 1.8, 1, i % 2); }
      else hide(idx);
    }
    aP.needsUpdate = aD.needsUpdate = aE.needsUpdate = true;

    // name tags follow their sprite on screen, clamped below the panels and above the captions
    const tagAt = (el, x, y, z, on) => {
      if (!el) return;
      tmp.set(x, y, z).project(cam);
      const sx = (tmp.x + 1) * 540, sy = (1 - tmp.y) * 960;
      el.style.transform = `translate(${Math.max(260, Math.min(820, sx)).toFixed(1)}px,${Math.max(840, Math.min(1215, sy)).toFixed(1)}px)`;
      el.style.opacity = on;
    };
    tagAt(tags[0], PR.x, 2.6, PR.z, t >= K.s3 + 0.3 && t < A("s3:syarat") ? 1 : 0);
    { const p = onRoad(head4(t) + 1.6, 0); tagAt(tags[1], p.x, p.y + 2.6, p.z, t >= A("s4:Peter") - 0.1 && t < T4 - 0.15 ? 1 : 0); }

    // particles
    const sOn = t >= K.s7 ? 1 : 0;
    snow.m.opacity = 0.85 * sOn;
    for (let i = 0; i < 1600; i++) {
      const s = sseed[i], fall = ((s[1] * 14 - t * (0.9 + s[2] * 0.6)) % 14 + 14) % 14;
      snow.pos[i * 3] = look.x + (s[0] - 0.5) * 34 + Math.sin(t * 0.7 + s[2] * 9) * 0.6;
      snow.pos[i * 3 + 1] = look.y - 2 + fall;
      snow.pos[i * 3 + 2] = look.z + (s[2] - 0.5) * 34 + 6;
    }
    snow.commit();
    mist.m.opacity = 0.11 * E.mist;
    for (let i = 0; i < 260; i++) {
      const s = mseed[i];
      mist.pos[i * 3] = look.x + (s[0] - 0.5) * 60 + ((t * 0.5 * (0.5 + s[2])) % 20) - 10;
      mist.pos[i * 3 + 1] = H(look.x, look.z) + 0.6 + s[1] * 3;
      mist.pos[i * 3 + 2] = look.z + (s[2] - 0.5) * 50;
    }
    mist.commit();

    bp.strength = 0.22 + 0.16 * clamp01(E.lan / 3);
    comp.render();
  };
}
