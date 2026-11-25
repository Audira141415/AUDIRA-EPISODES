// EP16 VISUALINVESTIGATION: Indonesia, the only member that ever tried to leave the UN (1965-1966).
// One charcoal forensic desk under a warm lamp; evidence laid out in a 2-column grid (units ~ cm, desk top y = 0):
// A (-27,-78) General Assembly seat diorama: the INDONESIA placard lifts off (hook) and is put back (s7)
// B ( 27,-78) membership register on an "ARSIP AUDIRA" folder: row 60 / 28-09-1950 highlighted
// C (-27,-26) Konfrontasi map card (Natural Earth) + Security Council index card "MALAYSIA"
// D ( 27,-26) typed letter 20 Januari 1965 (reconstruction, labelled), clause highlighted, U THANT name card
// E (-27, 26) CONEFO clipping pinned to a cork tile, SUKARNO name card
// F ( 27, 26) telegram 19 September 1966 typed out, rubber stamp, SOEHARTO name card
// G (  0, 80) calendar pair 28 SEP 1950 / 28 SEP 1966 joined by a red thread "16 TAHUN"
// Payoff: crane up over the whole desk while a red thread links the evidence in order. Everything is a function of t.

const FONTS = ['700 80px "IBM Plex Serif"', '500 80px "IBM Plex Serif"', 'italic 500 80px "IBM Plex Serif"', '700 80px "Courier Prime"', '400 80px "Courier Prime"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "PBB 1965"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const SERIF = '"IBM Plex Serif", Georgia, serif', TYPE = '"Courier Prime", "Courier New", monospace';
const RED = "#FF4A2E", PAPER = "#E4E0D4", INK = "#1D1D1B";

function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}

// paper ground: base colour, fibres, faint edge darkening
function paperBase(g, w, h, base = PAPER, seed = 3) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed);
  for (let i = 0; i < w * h / 260; i++) { const v = q() < 0.5 ? "255,255,250" : "90,80,60"; g.fillStyle = `rgba(${v},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  gr.addColorStop(0, "rgba(120,100,70,0)"); gr.addColorStop(1, "rgba(120,100,70,.22)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
function evid(g, x, y, n, scale = 1) {
  g.save(); g.translate(x, y); g.scale(scale, scale);
  g.fillStyle = INK; g.fillRect(0, 0, 330, 48);
  g.fillStyle = "#fff"; g.font = `700 26px ${TYPE}`; g.textBaseline = "middle"; g.fillText(`BUKTI ${n}`, 14, 25);
  g.fillStyle = RED; g.fillRect(160, 0, 170, 48); g.fillStyle = "#fff"; g.fillText("AUDIRA", 176, 25);
  g.restore();
}
function recon(g, x, y, size = 24) {
  g.save(); g.font = `700 ${size}px ${TYPE}`; const w = g.measureText("REKONSTRUKSI, BUKAN DOKUMEN ASLI").width;
  g.strokeStyle = RED; g.lineWidth = 4; g.strokeRect(x - 10, y - size * 0.9, w + 20, size * 1.45);
  g.fillStyle = RED; g.fillText("REKONSTRUKSI, BUKAN DOKUMEN ASLI", x, y + 2); g.restore();
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0b0c0e, exp: 1.0, bloom: [0.05, 0.3, 0.97], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  cam.near = 2; cam.setViewOffset(1080, 1920, 0, -110, 1080, 1920);

  const hemi = new THREE.HemisphereLight(0xc9d2e0, 0x1a1712, 0.32);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe4c4, 1.2);
  key.position.set(-70, 150, 80); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 420 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.04; key.shadow.radius = 4;
  scene.add(key, key.target);
  const lamp = new THREE.SpotLight(0xffd9a8, 0.55, 0, 0.5, 1, 0);
  scene.add(lamp, lamp.target);
  const rim = new THREE.DirectionalLight(0x9fb6d8, 0.35); rim.position.set(90, 60, -120); scene.add(rim);

  const labels = [];
  const tex = (w, h, paint) => { const t = canvasTex(w, h, paint); labels.push([t, paint]); return t; };
  const add = (geo, mat, x, y, z, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const std = (c, ro = 0.6, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });

  // ---------- desk ----------
  const deskTex = canvasTex(2048, 2048, (g, w, h) => {
    g.fillStyle = "#1a1c20"; g.fillRect(0, 0, w, h);
    const q = mulberry(16);
    for (let i = 0; i < 60000; i++) { const v = q() < 0.5 ? "255,255,255" : "0,0,0"; g.fillStyle = `rgba(${v},${0.015 + q() * 0.03})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 2); }
    for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(200,205,215,${0.02 + q() * 0.04})`; g.lineWidth = 0.6 + q(); const x = q() * w, y = q() * h, a = q() * 6.3, L = 30 + q() * 220; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    for (const [x, y, rr] of [[1530, 1240, 70], [470, 1650, 62], [1700, 420, 58]]) { g.strokeStyle = "rgba(120,90,55,.16)"; g.lineWidth = 7; g.beginPath(); g.arc(x, y, rr, 0.3, 5.6); g.stroke(); }
  });
  const desk = B(160, 4, 268, std(0xffffff, 0.7, 0.05, { map: deskTex }), 0, -2, 0);
  desk.castShadow = false;
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(0.55, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, z, o = 0.6, p = scene, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x, 0.015, z); m.renderOrder = -1; p.add(m); return m; };

  // flat paper sheet group: page pixel (px,py) -> local (x, z). Text top faces -z.
  function sheet(W, H, pw, ph, paint, { x = 0, y = 0.06, z = 0, ry = 0, ro = 0.92, p = scene, shadow = true } = {}) {
    const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; p.add(G);
    const geo = new THREE.PlaneGeometry(pw, ph, 20, 20);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const u = Math.abs(pa.getX(i)) / (pw / 2), v = Math.abs(pa.getY(i)) / (ph / 2); const e = Math.max(0, Math.max(u, v) - 0.86) / 0.14; pa.setZ(i, 0.35 * e * e); }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, std(0xffffff, ro, 0, { map: tex(W, H, paint) }));
    m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.castShadow = false; G.add(m);
    G.userData = { W, H, pw, ph, mesh: m };
    G.at = (px, py) => [(px / W - 0.5) * pw, (py / H - 0.5) * ph];
    return G;
  }
  // translucent highlighter stroke laid on a sheet, grows from the left
  const hlMat = () => new THREE.MeshBasicMaterial({ color: 0xff4a2e, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false });
  function stroke(S, px0, px1, py, ph) {
    const [x0, z] = S.at(px0, py), [x1] = S.at(px1, py), h = ph / S.userData.H * S.userData.ph;
    const geo = new THREE.PlaneGeometry(x1 - x0, h); geo.translate((x1 - x0) / 2, 0, 0);
    const m = new THREE.Mesh(geo, hlMat()); m.rotation.x = -Math.PI / 2; m.position.set(x0, 0.06, z); m.scale.x = 0.001; m.renderOrder = 2; S.add(m);
    m.userData.x1 = x1; m.userData.x0 = x0;
    return m;
  }
  // tent card (name card / placard): two leaning panels, face text toward +z. Pivot at base for the stand-up.
  function tent(w, h, paint, x, z, ry = 0, mat) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    const H = new THREE.Group(); G.add(H);
    const a = 0.24, b = h * Math.sin(a);
    const pap = mat || std(0xf1eee6, 0.85);
    const face = std(0xffffff, 0.8, 0, { map: tex(1024, Math.round(1024 * h / w), paint) });
    const f = add(new THREE.BoxGeometry(w, h, 0.12), [pap, pap, pap, pap, face, pap], 0, (h / 2) * Math.cos(a), b - (h / 2) * Math.sin(a), H); f.rotation.x = -a;
    const k = add(new THREE.BoxGeometry(w, h, 0.12), pap, 0, (h / 2) * Math.cos(a), -b + (h / 2) * Math.sin(a), H); k.rotation.x = a;
    blob(w + 3, 2 * b + 4, 0, 0, 0.5, G);
    return { G, H };
  }
  const nameCard = (name, role) => (g, w, h) => {
    paperBase(g, w, h, "#EEEAE0", name.length);
    g.fillStyle = INK; g.fillRect(0, 0, 26, h);
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 ${name.length > 7 ? 120 : 140}px ${SERIF}`; g.fillText(name, w / 2 + 12, h * 0.42);
    g.fillStyle = "#4a463e"; g.font = `700 48px ${TYPE}`; g.fillText(role, w / 2 + 12, h * 0.8);
  };

  // ================= A: General Assembly seat diorama =================
  const XA = -27, ZA = -78;
  const wood = std(0x4a3022, 0.5, 0.0), woodDark = std(0x2b1d15, 0.55), metal = std(0x9aa0a8, 0.28, 0.9), black = std(0x15171a, 0.5, 0.2);
  B(42, 6.5, 9, wood, XA, 3.25, ZA);
  B(43, 0.6, 10, woodDark, XA, 6.8, ZA);
  const plate = tex(1024, 96, (g, w, h) => { g.fillStyle = "#b08d4a"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a1d10"; g.font = `700 54px ${TYPE}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SIDANG UMUM PBB", w / 2, h / 2 + 3); });
  const pl = add(new THREE.PlaneGeometry(22, 2.06), std(0xffffff, 0.35, 0.6, { map: plate }), XA, 3.4, ZA + 4.52); pl.castShadow = false;
  for (const dx of [-13, 0, 13]) {
    const C = new THREE.Group(); C.position.set(XA + dx, 0, ZA - 10); scene.add(C);
    B(7, 1.2, 6.5, black, 0, 4.6, 0, C); B(7, 8, 1.1, black, 0, 8.6, -3, C);
    for (const sx of [-3, 3]) for (const sz of [-2.8, 2.8]) add(new THREE.CylinderGeometry(0.22, 0.22, 4, 6), metal, sx, 2, sz, C);
    const mic = new THREE.Group(); mic.position.set(XA + dx + 4.2, 7.1, ZA - 1.5); scene.add(mic);
    add(new THREE.CylinderGeometry(0.9, 1.1, 0.4, 16), black, 0, 0.2, 0, mic);
    const st = add(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), metal, 0, 2.6, 0.6, mic); st.rotation.x = 0.25;
    add(new THREE.SphereGeometry(0.42, 10, 8), black, 0, 5.0, 1.2, mic);
  }
  const placardPaint = (txt) => (g, w, h) => { g.fillStyle = "#F3F1EA"; g.fillRect(0, 0, w, h); g.strokeStyle = "#cfc9ba"; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${txt.length > 6 ? 150 : 170}px ${SERIF}`; g.fillText(txt, w / 2, h / 2 + 8); };
  const placards = [["INDIA", -13], ["INDONESIA", 0], ["IRAN", 13]].map(([n, dx]) => {
    const T = tent(11.5, 3.4, placardPaint(n), XA + dx, ZA + 1.2);
    T.G.position.y = 7.1;
    return T;
  });
  const indo = placards[1];
  // evidence tag on the desk + archive boxes behind
  sheet(660, 96, 9.6, 1.4, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); evid(g, 6, 10, "00", 1.3); g.fillStyle = INK; g.font = `700 30px ${TYPE}`; g.fillText("1950", 470, 52); }, { x: XA + 14, z: ZA + 9.5, ry: -0.08 });
  const kraft = (lab, sub, seed) => (g, w, h) => {
    paperBase(g, w, h, "#A88654", seed);
    g.fillStyle = "#EDE8DA"; g.fillRect(w * 0.14, h * 0.24, w * 0.72, h * 0.46);
    g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(w * 0.14, h * 0.24, w * 0.72, h * 0.46);
    g.fillStyle = lab === "AUDIRA" ? RED : INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 ${lab.length > 8 ? 74 : 92}px ${SERIF}`; g.fillText(lab, w / 2, h * 0.42);
    g.fillStyle = "#3a3630"; g.font = `700 40px ${TYPE}`; g.fillText(sub, w / 2, h * 0.6);
  };
  const boxSide = std(0x9c7b4c, 0.85);
  [["ARSIP", "AUDIRA · EP 16", -44], ["AUDIRA", "BERKAS PBB", -10], ["INDONESIA", "1950 – 1966", 24]].forEach(([l, s, x], i) => {
    const face = std(0xffffff, 0.85, 0, { map: tex(1024, 640, kraft(l, s, i + 5)) });
    const bx = add(new THREE.BoxGeometry(32, 20, 24), [boxSide, boxSide, boxSide, boxSide, face, boxSide], x, 10, -120 + (i % 2) * 3);
    bx.rotation.y = (i - 1) * 0.06;
    B(33, 2.4, 25, std(0xa98a5a, 0.85), x, 20.6, -120 + (i % 2) * 3).rotation.y = (i - 1) * 0.06;
  });

  // ================= B: membership register on an ARSIP AUDIRA folder =================
  const XB = 27, ZB = -78;
  const folder = B(25, 0.5, 33, std(0xb08c58, 0.85), XB + 0.6, 0.25, ZB + 0.3); folder.rotation.y = 0.03;
  const tabT = tex(512, 120, (g, w, h) => { g.fillStyle = "#b08c58"; g.fillRect(0, 0, w, h); g.fillStyle = "#EDE8DA"; g.fillRect(14, 16, w - 28, h - 32); g.fillStyle = RED; g.font = `700 54px ${TYPE}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ARSIP AUDIRA", w / 2, h / 2 + 3); });
  const tab = add(new THREE.BoxGeometry(12, 0.5, 3.2), [std(0xb08c58), std(0xb08c58), std(0xffffff, 0.8, 0, { map: tabT }), std(0xb08c58), std(0xb08c58), std(0xb08c58)], XB - 4, 0.25, ZB - 17.8); tab.rotation.y = 0.03;
  blob(29, 38, XB + 0.6, ZB + 0.6, 0.65);
  const ROWS = [57, 58, 59, 60, 61, 62, 63], RY = (i) => 380 + i * 128;
  const reg = sheet(1024, 1448, 21, 29.7, (g, w, h) => {
    paperBase(g, w, h, PAPER, 11);
    g.fillStyle = INK; g.textAlign = "center";
    g.font = `700 52px ${SERIF}`; g.fillText("PERSERIKATAN BANGSA-BANGSA", w / 2, 120);
    g.font = `700 32px ${TYPE}`; g.fillText("DAFTAR NEGARA ANGGOTA · URUTAN MASUK", w / 2, 176);
    g.fillRect(60, 206, w - 120, 4);
    g.textAlign = "left"; g.font = `700 28px ${TYPE}`; g.fillStyle = "#5a564d";
    g.fillText("NO.", 70, 280); g.fillText("NEGARA", 220, 280); g.fillText("TANGGAL MASUK", 640, 280);
    g.fillRect(60, 300, w - 120, 2);
    ROWS.forEach((n, i) => {
      const y = RY(i);
      g.fillStyle = "rgba(29,29,27,.18)"; g.fillRect(60, y + 52, w - 120, 2);
      if (n === 60) {
        g.fillStyle = INK; g.font = `700 76px ${SERIF}`; g.fillText("60", 70, y + 28);
        g.font = `700 60px ${SERIF}`; g.fillText("INDONESIA", 220, y + 24);
        g.font = `700 44px ${TYPE}`; g.fillText("28-09-1950", 640, y + 22);
        g.font = `400 24px ${TYPE}`; g.fillStyle = "#4a463e"; g.fillText("A/RES/491 (V)", 642, y + 46);
      } else {
        g.fillStyle = "#6a665c"; g.font = `700 44px ${SERIF}`; g.fillText(String(n), 76, y + 18);
        g.fillStyle = "rgba(29,29,27,.38)"; g.fillRect(220, y - 12, 230 + ((n * 37) % 150), 26); g.fillRect(640, y - 12, 250, 26);
      }
    });
    g.fillStyle = "#5a564d"; g.font = `400 26px ${TYPE}`; g.fillText("(baris lain disamarkan)", 70, 1290);
    evid(g, 60, 1330, "01");
    recon(g, 470, 1366, 24);
  }, { x: XB, y: 0.56, z: ZB, ry: -0.02 });
  const regHL = stroke(reg, 50, 980, RY(3) + 6, 110);
  const pen = (col) => {
    const G = new THREE.Group(); scene.add(G);
    const body = add(new THREE.CylinderGeometry(0.75, 0.75, 10, 18), std(col, 0.35, 0.05), 0, 0, 0, G); body.rotation.z = Math.PI / 2;
    const cap = add(new THREE.CylinderGeometry(0.8, 0.8, 3.4, 18), std(0x1d1d1b, 0.4), -6.2, 0, 0, G); cap.rotation.z = Math.PI / 2;
    const tip = add(new THREE.CylinderGeometry(0.3, 0.6, 1.3, 4), std(0xff6a4a, 0.6), 5.6, 0, 0, G); tip.rotation.z = -Math.PI / 2;
    return G;
  };
  const penB = pen(0xff4a2e);

  // ================= C: Konfrontasi map card + Security Council card =================
  const XC = -27, ZC = -26;
  const L0 = 94, L1 = 142, B0 = -11.5, B1 = 8;
  const map = sheet(1600, 1000, 34, 21.25, (g, w, h) => {
    paperBase(g, w, h, "#E8E4D8", 21);
    const mx = 50, my = 120, mw = w - 100, mh = 760;
    const P = (lo, la) => [mx + (lo - L0) / (L1 - L0) * mw, my + (B1 - la) / (B1 - B0) * mh];
    g.fillStyle = "#d4dbe0"; g.fillRect(mx, my, mw, mh);
    g.strokeStyle = "rgba(29,29,27,.12)"; g.lineWidth = 2;
    for (let lo = 95; lo < L1; lo += 5) { const [x] = P(lo, 0); g.beginPath(); g.moveTo(x, my); g.lineTo(x, my + mh); g.stroke(); }
    for (let la = -10; la < B1; la += 5) { const [, y] = P(0, la); g.beginPath(); g.moveTo(mx, y); g.lineTo(mx + mw, y); g.stroke(); }
    g.save(); g.beginPath(); g.rect(mx, my, mw, mh); g.clip();
    for (const c of GEO) {
      const col = c.name === "Indonesia" ? INK : c.name === "Malaysia" ? RED : "#c9c3b4";
      g.fillStyle = col; g.strokeStyle = c.name === "Indonesia" || c.name === "Malaysia" ? col : "#9a9486"; g.lineWidth = 1.5;
      for (const rg of c.rings) { g.beginPath(); rg.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke(); }
    }
    // tension marks along the Borneo land border
    g.strokeStyle = "#fff"; g.lineWidth = 12; g.setLineDash([]);
    const BRD = [[109.6, 1.9], [110.6, 1.1], [112.2, 1.4], [113.9, 1.3], [114.6, 2.5], [115.5, 3.6], [116.6, 4.3], [117.8, 4.3]];
    g.beginPath(); BRD.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    g.strokeStyle = RED; g.lineWidth = 7; g.setLineDash([16, 10]); g.stroke(); g.setLineDash([]);
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(mx, my, mw, mh);
    g.textBaseline = "middle"; g.textAlign = "center";
    const lab = (txt, lo, la, col, sz) => { const [x, y] = P(lo, la); g.font = `700 ${sz}px ${SERIF}`; const tw = g.measureText(txt).width; g.fillStyle = "rgba(236,232,221,.92)"; g.fillRect(x - tw / 2 - 14, y - sz * 0.62, tw + 28, sz * 1.2); g.fillStyle = col; g.fillText(txt, x, y + 2); };
    lab("MALAYSIA", 103.5, 6.2, RED, 62);
    lab("INDONESIA", 117, -9.6, INK, 66);
    g.fillStyle = INK; g.textAlign = "left"; g.font = `700 60px ${SERIF}`; g.fillText("KONFRONTASI", 50, 62);
    g.font = `700 34px ${TYPE}`; g.fillStyle = "#4a463e"; g.fillText("INDONESIA × MALAYSIA · 1960-AN", 560, 66);
    evid(g, 50, 920, "02");
    g.font = `400 26px ${TYPE}`; g.fillStyle = "#5a564d"; g.fillText("peta: Natural Earth · garis merah = perbatasan Kalimantan", 420, 946);
  }, { x: XC, y: 0.07, z: ZC, ry: 0.025 });
  blob(38, 25, XC, ZC + 0.4, 0.6);
  const scCard = sheet(900, 520, 18, 10.4, (g, w, h) => {
    paperBase(g, w, h, "#F2EFE6", 31);
    g.fillStyle = RED; g.fillRect(0, 0, w, 14);
    g.strokeStyle = "rgba(60,110,170,.35)"; g.lineWidth = 2; for (let y = 150; y < h; y += 52) { g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke(); }
    g.fillStyle = INK; g.textAlign = "left"; g.font = `700 50px ${SERIF}`; g.fillText("DEWAN KEAMANAN PBB", 40, 92);
    g.font = `700 32px ${TYPE}`; g.fillStyle = "#4a463e"; g.fillText("anggota tidak tetap, terpilih:", 40, 190);
    g.font = `700 128px ${SERIF}`; g.fillStyle = RED; g.fillText("MALAYSIA", 40, 330);
    g.font = `700 28px ${TYPE}`; g.fillStyle = "#4a463e"; g.fillText("pertengahan 1960-an", 40, 420);
    evid(g, 520, 440, "02B", 1.0);
  }, { x: XC + 6, y: 0.5, z: ZC + 9.5, ry: -0.09 });
  const scBlob = blob(21, 13, 0, 0, 0.5, scCard);
  scBlob.position.y = -0.4;

  // ================= D: the letter of 20 January 1965 (reconstruction) =================
  const XD = 27, ZD = -26;
  const LET = [
    ["Jakarta, 20 Januari 1965", 1], ["", 0], ["Kepada Yth.", 0], ["Sekretaris Jenderal PBB", 0], ["U Thant", 1], ["New York", 0], ["", 0],
    ["Perihal: keanggotaan Indonesia", 1], ["", 0],
    ["Pemerintah Republik Indonesia dengan ini", 0], ["memberitahukan bahwa, setelah Malaysia", 0], ["terpilih sebagai anggota Dewan Keamanan,", 0],
    ["Indonesia memutuskan untuk keluar dari", 2], ["Perserikatan Bangsa-Bangsa, pada tahap", 2], ["ini dan dalam keadaan sekarang.", 2],
    ["", 0], ["Hormat kami,", 0], ["Pemerintah Republik Indonesia", 0]];
  const LY = (i) => 250 + i * 56;
  const letter = sheet(1024, 1448, 21, 29.7, (g, w, h) => {
    paperBase(g, w, h, "#E9E5D9", 41);
    recon(g, 330, 110, 26);
    g.fillStyle = INK; g.textAlign = "left";
    LET.forEach(([s, b], i) => {
      if (!s) return;
      g.font = `${b ? 700 : 400} 36px ${TYPE}`;
      const x = i === 0 ? w - 80 - g.measureText(s).width : 80;
      // slight typewriter unevenness
      g.fillStyle = `rgba(29,29,27,${0.86 + ((i * 7) % 5) * 0.03})`;
      g.fillText(s, x, LY(i) + ((i * 5) % 3) * 0.8);
    });
    evid(g, 80, 1290, "03");
    g.font = `400 24px ${TYPE}`; g.fillStyle = "#5a564d"; g.fillText("teks parafrase netral · bukan kutipan", 440, 1322);
  }, { x: XD, y: 0.07, z: ZD, ry: -0.035 });
  blob(25, 34, XD, ZD + 0.5, 0.65);
  const letHL = [12, 13, 14].map((i) => stroke(letter, 70, i === 14 ? 760 : 940, LY(i) - 12, 50));
  const penD = pen(0xff4a2e);
  const thant = tent(13, 4.4, nameCard("U THANT", "Sekjen PBB"), XD + 2, ZD + 20.5, -0.05);

  // ================= E: CONEFO clipping on a cork tile =================
  const XE = -27, ZE = 26;
  const corkT = canvasTex(512, 640, (g, w, h) => { g.fillStyle = "#a8804f"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 9000; i++) { g.fillStyle = q() < 0.5 ? `rgba(70,45,20,${0.2 + q() * 0.3})` : `rgba(220,180,120,${0.15 + q() * 0.25})`; g.beginPath(); g.arc(q() * w, q() * h, 0.6 + q() * 2.2, 0, 7); g.fill(); } });
  const cork = B(27, 1.2, 33, std(0xffffff, 0.95, 0, { map: corkT }), XE, 0.6, ZE); cork.rotation.y = 0.04;
  blob(31, 37, XE, ZE + 0.5, 0.7);
  const clip = sheet(900, 1150, 19.5, 25, (g, w, h) => {
    paperBase(g, w, h, "#DCD5C2", 51);
    g.fillStyle = "#4a463e"; g.font = `700 26px ${TYPE}`; g.textAlign = "left"; g.fillText("KLIPING · REKONSTRUKSI", 40, 60);
    g.fillRect(40, 78, w - 80, 3);
    g.fillStyle = INK; g.textAlign = "center"; g.font = `700 220px ${SERIF}`; g.fillText("CONEFO", w / 2, 300);
    g.font = `italic 500 38px ${SERIF}`; g.fillText("Conference of the New Emerging Forces", w / 2, 376);
    g.fillStyle = RED; g.font = `700 46px ${SERIF}`; g.fillText("Konferensi Kekuatan-Kekuatan Baru", w / 2, 450);
    g.fillStyle = INK; g.font = `700 34px ${TYPE}`; g.fillText("gagasan Presiden Sukarno", w / 2, 530); g.fillText("sebagai tandingan PBB", w / 2, 574);
    g.fillRect(40, 610, w - 80, 3);
    g.fillStyle = "rgba(29,29,27,.32)";
    for (let c = 0; c < 3; c++) for (let l = 0; l < 13; l++) g.fillRect(40 + c * 280, 650 + l * 28, 250 - ((l * 7 + c * 3) % 5) * 22, 11);
    evid(g, 40, 1040, "04");
  }, { x: XE, y: 1.28, z: ZE + 0.5, ry: -0.05 });
  const pinMat = std(0xff3a22, 0.3, 0.05);
  const pushpin = (x, y, z, p = scene) => { const G = new THREE.Group(); G.position.set(x, y, z); p.add(G); add(new THREE.CylinderGeometry(0.9, 1.2, 0.5, 16), pinMat, 0, 0.25, 0, G); add(new THREE.CylinderGeometry(0.5, 0.6, 1.2, 12), pinMat, 0, 1.0, 0, G); add(new THREE.CylinderGeometry(1.0, 1.0, 0.45, 16), pinMat, 0, 1.8, 0, G); return G; };
  pushpin(XE - 0.4, 1.3, ZE - 11.3);
  // red marker ring around CONEFO, drawn on its word
  const ringG = new THREE.RingGeometry(0.93, 1.0, 96, 1);
  const ring = new THREE.Mesh(ringG, hlMat()); ring.material.opacity = 0.85;
  ring.rotation.x = -Math.PI / 2; ring.scale.set(9.4, 3.4, 1);
  { const [x, z] = clip.at(450, 236); ring.position.set(x, 0.08, z); } ring.renderOrder = 3; clip.add(ring);
  const sukarno = tent(13.5, 4.4, nameCard("SUKARNO", "Presiden RI"), XE + 1, ZE + 21, 0.04);

  // ================= F: telegram of 19 September 1966 =================
  const XF = 27, ZF = 26;
  const MSG = ["INDONESIA AKAN KEMBALI", "BEKERJA SAMA PENUH", "DENGAN PBB, MULAI", "SIDANG UMUM KE-21  STOP"];
  let typed = -1, tgPaint;
  const tgTex = tex(1024, 1300, (tgPaint = (g, w, h) => {
    paperBase(g, w, h, "#E9E0C4", 61);
    g.fillStyle = INK; g.textAlign = "left"; g.font = `700 112px ${SERIF}`; g.fillText("TELEGRAM", 70, 160);
    g.fillStyle = RED; g.fillRect(70, 190, w - 140, 8); g.fillRect(70, 206, w - 140, 3);
    g.fillStyle = "#3a3630"; g.font = `700 32px ${TYPE}`;
    g.fillText("TANGGAL : 19 SEPTEMBER 1966", 70, 280);
    g.fillText("KEPADA  : SEKRETARIS JENDERAL PBB", 70, 330);
    g.fillText("DARI    : PEMERINTAH REPUBLIK INDONESIA", 70, 380);
    const n = Math.max(0, typed);
    let left = n;
    MSG.forEach((s, i) => {
      const y = 500 + i * 96;
      g.fillStyle = "#F6F3EA"; g.fillRect(60, y - 56, w - 120, 78);
      const k = Math.min(s.length, left); left -= s.length;
      if (k > 0) { g.fillStyle = INK; g.font = `700 50px ${TYPE}`; g.fillText(s.slice(0, k), 80, y); }
    });
    g.fillStyle = "#5a564d"; g.font = `400 26px ${TYPE}`; g.fillText("(teks parafrase netral)", 70, 920);
    recon(g, 80, 1000, 26);
    evid(g, 70, 1180, "05");
  }));
  const MSGN = MSG.reduce((s, x) => s + x.length, 0);
  const tg = sheet(1024, 1300, 22, 27.9, () => {}, { x: XF, y: 0.07, z: ZF, ry: 0.03 });
  tg.userData.mesh.material.map = tgTex;
  labels.pop(); // the empty painter registered by sheet()
  blob(26, 32, XF, ZF + 0.5, 0.65);
  const impT = canvasTex(512, 300, (g, w, h) => {
    g.strokeStyle = RED; g.lineWidth = 12; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 4; g.strokeRect(34, 34, w - 68, h - 68);
    g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 70px ${TYPE}`; g.fillText("19 SEP", w / 2, 112); g.fillText("1966", w / 2, 196);
    const q = mulberry(4); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.8})`; g.fillRect(q() * w, q() * h, 2 + q() * 5, 2 + q() * 3); }
  });
  const imp = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.7), new THREE.MeshBasicMaterial({ map: impT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  imp.rotation.set(-Math.PI / 2, 0, 0.12); { const [x, z] = tg.at(720, 900); imp.position.set(x, 0.09, z); } imp.renderOrder = 3; tg.add(imp);
  const stamp = new THREE.Group(); scene.add(stamp);
  B(8.4, 1.2, 5.2, std(0x2a2a2a, 0.8), 0, 0.6, 0, stamp);
  B(8.8, 1.8, 5.6, std(0x6b4a2e, 0.45), 0, 2.1, 0, stamp);
  add(new THREE.CylinderGeometry(0.9, 1.3, 4.2, 14), std(0x6b4a2e, 0.45), 0, 5.0, 0, stamp);
  add(new THREE.SphereGeometry(1.8, 16, 12), std(0x2b1d15, 0.4), 0, 7.6, 0, stamp);
  const inkPad = B(10, 1.1, 6.5, std(0x2b2d31, 0.5, 0.4), XF + 18.5, 0.55, ZF + 9); B(9, 0.2, 5.5, std(0x8a1a12, 0.7), XF + 18.5, 1.15, ZF + 9);
  blob(13, 9, XF + 18.5, ZF + 9, 0.6);
  const STAMP_REST = new THREE.Vector3(XF + 18.5, 0, ZF - 3), impW = new THREE.Vector3();
  const soeharto = tent(15, 4.4, nameCard("SOEHARTO", "Jenderal"), XF - 1, ZF + 21, -0.04);

  // ================= G: calendar pair joined by a red thread =================
  const ZG = 80;
  const calPaint = (yr, sub) => (g, w, h) => {
    paperBase(g, w, h, "#F1EEE5", +yr);
    g.fillStyle = RED; g.fillRect(0, 0, w, 170);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 86px ${SERIF}`; g.fillText("SEPTEMBER", w / 2, 92);
    g.fillStyle = INK; g.font = `700 430px ${SERIF}`; g.fillText("28", w / 2, 470);
    g.font = `700 120px ${SERIF}`; g.fillText(yr, w / 2, 760);
    g.fillStyle = "#4a463e"; g.font = `700 52px ${TYPE}`; g.fillText(sub, w / 2, 870);
    g.fillStyle = "rgba(29,29,27,.25)"; g.fillRect(60, 920, w - 120, 3);
  };
  const cals = [["1950", "masuk PBB", -17], ["1966", "duduk kembali", 17]].map(([yr, sub, x], i) => {
    const G = new THREE.Group(); G.position.set(x, 0, ZG); G.rotation.y = -x * 0.008; scene.add(G);
    const lean = new THREE.Group(); lean.rotation.x = -0.16; G.add(lean);
    const pg = std(0xffffff, 0.85, 0, { map: tex(720, 980, calPaint(yr, sub)) }), side = std(0xe9e5da, 0.9);
    add(new THREE.BoxGeometry(14, 19, 1.4), [side, side, side, side, pg, side], 0, 9.5, 0, lean);
    B(14.4, 19.4, 0.5, std(0x2b2d31, 0.6), 0, 9.6, -0.9, lean);
    for (let k = -5; k <= 5; k += 1.25) { const t = add(new THREE.TorusGeometry(0.55, 0.12, 6, 14), metal, k, 19.2, 0, lean); t.rotation.y = Math.PI / 2; }
    const leg = B(13, 0.5, 9, std(0x2b2d31, 0.6), 0, 0.25, -3.6, G);
    blob(18, 14, 0, -2, 0.7, G);
    pushpin(0, 19.4, 0.8, lean).rotation.x = Math.PI / 2 - 0.3;
    return G;
  });
  const calTop = (i) => { const v = new THREE.Vector3(0, 19.4 + 0, 2.2); cals[i].children[0].localToWorld(v); return v; };
  scene.updateMatrixWorld(true);
  const p0 = calTop(0), p1 = calTop(1);
  const thrMat = std(0xe0341c, 0.55, 0.0, { emissive: 0x3a0804, emissiveIntensity: 0.6 });
  const tube = (pts3, seg = 200) => { const c = new THREE.CatmullRomCurve3(pts3, false, "centripetal"); const m = new THREE.Mesh(new THREE.TubeGeometry(c, seg, 0.2, 6, false), thrMat); m.castShadow = true; m.geometry.setDrawRange(0, 0); scene.add(m); m.userData.n = seg * 6 * 6; return m; };
  const calThread = tube([p0, new THREE.Vector3(-8, p0.y - 4.5, p0.z + 0.6), new THREE.Vector3(0, p0.y - 5.6, p0.z + 0.8), new THREE.Vector3(8, p0.y - 4.5, p0.z + 0.6), p1], 120);
  const yrTag = new THREE.Group(); yrTag.position.set(0, p0.y - 5.6, p0.z + 0.9); scene.add(yrTag);
  const tagT = tex(700, 300, (g, w, h) => { paperBase(g, w, h, "#F1EEE5", 77); g.fillStyle = RED; g.fillRect(0, 0, w, 18); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 150px ${SERIF}`; g.fillText("16 TAHUN", w / 2, 150); g.font = `700 32px ${TYPE}`; g.fillStyle = "#4a463e"; g.fillText("tepat · hari yang sama", w / 2, 262); });
  const tagM = add(new THREE.BoxGeometry(11, 4.7, 0.1), [std(0xf1eee5), std(0xf1eee5), std(0xf1eee5), std(0xf1eee5), std(0xffffff, 0.85, 0, { map: tagT }), std(0xf1eee5)], 0, -2.7, 0, yrTag);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 4), thrMat, 0, -0.2, 0, yrTag);

  // ================= desk props =================
  { // magnifier between B and D
    const G = new THREE.Group(); G.position.set(4, 0.6, -51); G.rotation.set(0, 0.6, 0); scene.add(G);
    const rg = add(new THREE.TorusGeometry(4.2, 0.45, 12, 48), std(0x1d1d1b, 0.35, 0.6), 0, 0, 0, G); rg.rotation.x = Math.PI / 2;
    const lens = add(new THREE.CylinderGeometry(4.0, 4.0, 0.25, 48), new THREE.MeshStandardMaterial({ color: 0xdfeef2, roughness: 0.03, metalness: 0.2, transparent: true, opacity: 0.22 }), 0, 0, 0, G); lens.castShadow = false;
    const hd = add(new THREE.CylinderGeometry(0.7, 0.85, 9, 14), std(0x2b1d15, 0.45), 0, 0, 8.6, G); hd.rotation.x = Math.PI / 2;
    blob(11, 20, 4, -47, 0.45);
  }
  { // pencil and paper clips
    const G = new THREE.Group(); G.position.set(0, 0.45, 55); G.rotation.y = 0.35; scene.add(G);
    const b0 = add(new THREE.CylinderGeometry(0.45, 0.45, 15, 6), std(0x2e3238, 0.5), 0, 0, 0, G); b0.rotation.z = Math.PI / 2;
    const tp = add(new THREE.ConeGeometry(0.45, 1.6, 6), std(0xd8c39a, 0.7), 8.3, 0, 0, G); tp.rotation.z = -Math.PI / 2;
    const er = add(new THREE.CylinderGeometry(0.47, 0.47, 1.2, 10), std(0xff4a2e, 0.6), -8.1, 0, 0, G); er.rotation.z = Math.PI / 2;
    for (const [x, z, a] of [[-50, -40, 0.4], [52, 2, -0.9], [-4, -4, 1.3]]) { const c = add(new THREE.TorusGeometry(1.2, 0.12, 6, 20), metal, x, 0.15, z); c.rotation.x = Math.PI / 2; c.scale.set(1, 2.4, 1); c.rotation.z = a; }
  }
  // loose index cards near the desk edges so the overview never reads as empty
  const blank = (s) => (g, w, h) => { paperBase(g, w, h, "#E6E2D6", s); g.strokeStyle = "rgba(60,110,170,.3)"; g.lineWidth = 2; for (let y = 90; y < h; y += 40) { g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke(); } g.fillStyle = "rgba(29,29,27,.4)"; for (let l = 0; l < 4; l++) g.fillRect(30, 70 + l * 40, 200 + ((l * 53 + s) % 140), 10); };
  for (const [x, z, ry, s] of [[-62, -52, 0.3, 1], [61, -2, -0.25, 2], [-63, 62, -0.15, 3], [62, 70, 0.2, 4], [60, -104, 0.1, 5]]) { sheet(512, 320, 15, 9.4, blank(s), { x, z, ry, y: 0.2 }); blob(17, 11, x, z, 0.5, scene, ry); }

  // ================= payoff thread linking the evidence in order =================
  const CHAIN = [[XA + 14, 7.4, ZA + 2], [XB + 2, 1.5, ZB + 0.2], [XC - 4, 1.2, ZC - 2], [XD - 2, 1.2, ZD + 2.2], [XE, 2.6, ZE - 6], [XF + 3, 1.2, ZF + 4], [-17, 16, ZG + 1], [17, 16, ZG + 1]];
  const chainPts = [];
  CHAIN.forEach((p, i) => { const v = new THREE.Vector3(...p); if (i) { const a = chainPts[chainPts.length - 1]; chainPts.push(new THREE.Vector3((a.x + v.x) / 2, Math.max(a.y, v.y) + 2.5, (a.z + v.z) / 2)); } chainPts.push(v); });
  const chain = tube(chainPts, 420);
  const chainPins = CHAIN.slice(0, 6).map(([x, y, z]) => { const p = pushpin(x, y - 1.2, z); p.scale.setScalar(0.001); return p; });

  // dust in the lamp beam
  const dust = pts(scene, 220, { color: 0xffe2b8, size: 0.22, add: true, opacity: 0.45 });
  const dq = mulberry(77), dSeed = Array.from({ length: 220 }, () => [dq() - 0.5, dq(), dq() - 0.5, dq() * 6, 0.2 + dq() * 0.5]);

  // ---------- timing ----------
  const cut = (k) => A(k) - 0.01;
  const c2 = cut("s2:Indonesia"), c3 = cut("s3:Pertengahan"), c4 = cut("s4:Dalam"), c5 = cut("s5:Presiden"), c6 = cut("s6:Tapi"), c7 = cut("s7:28"), c7b = cut("s7:delegasi");
  const s8 = A("s8:Sampai"), mem = A("s4:memutuskan");
  const D2R = Math.PI / 180;
  const cv = (tx, ty, tz, d, pd, yaw = 0) => { const p = pd * D2R; return [tx + d * Math.cos(p) * Math.sin(yaw), ty + d * Math.sin(p), tz + d * Math.cos(p) * Math.cos(yaw), tx, ty, tz]; };
  const [, regZ] = reg.at(512, RY(3));
  const clauseZ = ZD + letter.at(512, LY(13))[1];
  const keys = [
    [0, ...cv(XA, 9, ZA, 64, 12, -0.3)],
    [A("s1:keluar"), ...cv(XA, 11, ZA, 58, 14, -0.12)],
    [c2 - 0.02, ...cv(XA, 12, ZA, 52, 16, 0.08)],
    [c2, ...cv(XB, 0, ZB + regZ - 2, 66, 64, -0.12)],
    [A("s2:keenam") + 1.4, ...cv(XB, 0, ZB + regZ, 54, 62, -0.03)],
    [c3 - 0.02, ...cv(XB + 1, 0, ZB + regZ + 1, 49, 60, 0.07)],
    [c3, ...cv(XC, 0, ZC + 1, 98, 66, 0.1)],
    [A("s3:terpilih") - 0.3, ...cv(XC + 1, 0, ZC + 2, 90, 64, 0.02)],
    [c4 - 0.02, ...cv(XC + 2, 0, ZC + 4, 84, 63, -0.07)],
    [c4, ...cv(XD, 0, ZD - 4, 76, 58, -0.12)],
    [A("s4:U") - 0.6, ...cv(XD + 1, 0, ZD + 1, 74, 57, -0.06)],
    [mem - 0.1, ...cv(XD, 0, clauseZ, 66, 60, -0.02)],
    [mem + 0.32, ...cv(XD, 0, clauseZ + 0.5, 50, 68, 0)],
    [c5 - 0.02, ...cv(XD, 0, clauseZ + 0.5, 47, 69, 0.03)],
    [c5, ...cv(XE, 0, ZE - 3, 76, 52, 0.14)],
    [c6 - 0.02, ...cv(XE, 0, ZE - 4, 66, 54, -0.02)],
    [c6, ...cv(XF, 0, ZF + 6, 82, 50, -0.16)],
    [A("s6:19") - 0.4, ...cv(XF + 1, 0, ZF + 4, 70, 56, -0.06)],
    [A("s6:menyatakan"), ...cv(XF, 0, ZF + 1, 62, 60, 0)],
    [c7 - 0.02, ...cv(XF, 0, ZF + 1, 56, 62, 0.05)],
    [c7, ...cv(0, 9, ZG, 142, 12, -0.1)],
    [A("s7:enam") + 0.5, ...cv(0, 8.5, ZG, 130, 11, 0.0)],
    [c7b - 0.02, ...cv(0, 8.5, ZG, 122, 11, 0.06)],
    [c7b, ...cv(XA, 7, ZA, 52, 24, 0.58)],
    [A("s7:duduk") + 0.6, ...cv(XA, 7, ZA, 46, 22, 0.42)],
    [s8 - 0.3, ...cv(XA, 7, ZA, 42, 21, 0.3)],
    [s8 + 3.8, ...cv(0, 0, -16, 326, 63, 0.0)],
    [K.dur, ...cv(0, 0, -16, 340, 64, 0.05)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const hl = (m, u) => { m.scale.x = Math.max(0.001, u); m.visible = u > 0.002; };
  const placePen = (G, S, m, u, active, rest) => {
    // pen tip rides the growing stroke while active, otherwise the pen lies at rest beside the sheet
    const tip = new THREE.Vector3(m.userData.x0 + (m.userData.x1 - m.userData.x0) * u, 0.1, m.position.z); S.localToWorld(tip);
    const k = smooth(active);
    G.position.set(rest[0] + (tip.x - 5.62 - rest[0]) * k, rest[1] + (tip.y + 2.72 - rest[1]) * k + Math.sin(Math.PI * k) * 3, rest[2] + (tip.z + 0.3 - rest[2]) * k);
    G.rotation.set(0, rest[3] + (0.06 - rest[3]) * k, -0.45 * k);
  };

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "IBM Plex Serif"`) && document.fonts.check(`700 40px "Courier Prime"`)) {
      labels.done = true; typed = -2;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.25, c[1] + Math.sin(t * 0.29) * 0.18, c[2] + Math.cos(t * 0.31) * 0.22);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    const dist = cam.position.distanceTo(tgt);
    lamp.position.set(tgt.x - 18, tgt.y + 70 + dist * 0.2, tgt.z + 16); lamp.target.position.copy(tgt);
    lamp.angle = Math.min(1.1, Math.atan((12 + dist * 0.33) / (70 + dist * 0.2)));

    // A: the INDONESIA placard lifts off on "keluar" and is set back on "duduk"
    const up = eout(clamp01((t - A("s1:keluar") + 0.1) / 1.1)) * (1 - smooth(clamp01((t - A("s7:duduk") + 0.5) / 1.3)));
    indo.G.position.y = 7.1 + 6 * up + Math.sin(t * 1.3) * 0.25 * up;
    indo.G.rotation.set(-0.18 * up, Math.sin(t * 0.7) * 0.12 * up, 0.08 * up);

    // B: highlighter sweeps row 60
    const hb0 = A("s2:keenam") - 0.25, uB = smooth(clamp01((t - hb0) / 1.1));
    hl(regHL, uB);
    const actB = clamp01((t - hb0 + 0.35) / 0.35) * (1 - clamp01((t - hb0 - 1.2) / 0.4));
    placePen(penB, reg, regHL, uB, actB, [XB + 16, 0.8, ZB + 8, 1.3]);

    // C: Security Council card slides in on "terpilih"
    const uSC = eout(clamp01((t - A("s3:terpilih") + 0.2) / 0.7));
    scCard.position.set(XC + 6 + 34 * (1 - uSC), 0.5 + 3 * Math.sin(Math.PI * uSC) * (1 - uSC), ZC + 9.5 + 6 * (1 - uSC));
    scCard.rotation.y = -0.09 - 0.5 * (1 - uSC);
    scCard.visible = uSC > 0.001;

    // D: name card stands up; the clause gets highlighted line by line on "memutuskan"
    const uT = back(clamp01((t - A("s4:U") + 0.15) / 0.55), 1.4);
    thant.H.rotation.x = -Math.PI / 2 * (1 - uT);
    const lineU = [0, 1, 2].map((i) => smooth(clamp01((t - mem + 0.05 - i * 0.55) / 0.6)));
    letHL.forEach((m, i) => hl(m, lineU[i]));
    const li = lineU[0] < 1 ? 0 : lineU[1] < 1 ? 1 : 2;
    const actD = clamp01((t - mem + 0.4) / 0.35) * (1 - clamp01((t - mem - 1.75) / 0.4));
    placePen(penD, letter, letHL[li], lineU[li], actD, [XD + 16, 0.8, ZD + 9, 1.2]);

    // E: name card; marker ring around CONEFO
    sukarno.H.rotation.x = -Math.PI / 2 * (1 - back(clamp01((t - A("s5:Sukarno") + 0.15) / 0.55), 1.4));
    const uR = smooth(clamp01((t - A("s5:CONEFO") + 0.1) / 0.8));
    ringG.setDrawRange(0, Math.floor(uR * 96) * 6); ring.visible = uR > 0.01;

    // F: name card; stamp comes down on "19"; message types out from "menyatakan"
    soeharto.H.rotation.x = -Math.PI / 2 * (1 - back(clamp01((t - A("s6:Soeharto") + 0.15) / 0.55), 1.4));
    const th = A("s6:19");
    imp.localToWorld(impW.set(0, 0, 0));
    const go = smooth(clamp01((t - th + 0.75) / 0.5)), ret = smooth(clamp01((t - th - 0.35) / 0.7));
    const ov = new THREE.Vector3().lerpVectors(STAMP_REST, impW, go * (1 - ret));
    const drop = t < th ? 1 - clamp01((t - th + 0.22) / 0.22) : clamp01((t - th - 0.12) / 0.25);
    stamp.position.set(ov.x, go * (1 - ret) * (0.12 + 7 * drop), ov.z);
    stamp.rotation.y = 0.12 * go;
    imp.material.opacity = t >= th ? 0.92 : 0;
    const want = Math.round(MSGN * clamp01((t - A("s6:menyatakan") + 0.1) / (A("s6:penuh") + 0.4 - A("s6:menyatakan"))));
    if (want !== typed) { typed = want; const cc = tgTex.image, g = cc.getContext("2d"); g.clearRect(0, 0, cc.width, cc.height); tgPaint(g, cc.width, cc.height); tgTex.needsUpdate = true; }

    // G: thread runs from 1950 to 1966 on "tepat .. enam belas"
    const uTh = smooth(clamp01((t - A("s7:tepat") + 0.2) / (A("s7:enam") - A("s7:tepat") + 0.5)));
    calThread.geometry.setDrawRange(0, Math.floor(uTh * 120) * 36);
    const tagU = back(clamp01((t - A("s7:enam") + 0.1) / 0.5), 1.6);
    yrTag.scale.setScalar(Math.max(0.001, tagU)); yrTag.rotation.z = Math.sin(t * 1.4) * 0.05 * tagU; yrTag.rotation.y = Math.sin(t * 0.9) * 0.08;

    // payoff: the case thread links every exhibit in order
    const uC = smooth(clamp01((t - s8 - 0.6) / 4.2));
    chain.geometry.setDrawRange(0, Math.floor(uC * 420) * 36);
    chainPins.forEach((p, i) => { const k = back(clamp01((uC * (CHAIN.length - 1) - i + 0.3) / 0.5), 1.6); p.scale.setScalar(Math.max(0.001, k)); });

    const d = dust.pos;
    for (let i = 0; i < 220; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 40 + Math.sin(t * q[4] + q[3]) * 1.2; d[i * 3 + 1] = 0.5 + ((q[1] * 30 + t * q[4] * 0.4) % 30); d[i * 3 + 2] = tgt.z + q[2] * 40 + 8 + Math.cos(t * q[4] + q[3]) * 1.2; }
    dust.commit();
    comp.render();
  };
}
