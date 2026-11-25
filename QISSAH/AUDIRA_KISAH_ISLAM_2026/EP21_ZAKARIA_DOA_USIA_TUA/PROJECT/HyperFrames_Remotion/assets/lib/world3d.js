// EP21 ZAKARIA, DOA DI USIA TUA. STAINEDGLASS: a quiet stone prayer chamber lit only through Islamic coloured-glass
// windows (two arched qamariyya and a round shamsiyya rosette above the mihrab). Coloured light shafts slant through the
// dusty air and lay moving glass patterns on the stone floor; dust motes drift in the beams.
// Depiction: Nabi Zakaria never appears. His presence = a prayer rug, an oil lamp in the niche, a cane and white wool on a
// bench, and his whisper drawn as soft gold light ripples travelling from above the rug to the lamp. No angels. Yahya never
// appears: his presence = a second small lamp lowered and lit beside the first (s5), later a small open book on a stand (s8).
// s4: a path of floor star inlays lights up from the far end of the room to the rug (a life of answered prayers).
// s6: the rosette empties, then is re-made piece by piece ("engkau dulu belum ada"). s7: three day/night cycles through the
// glass while the lamps keep burning, then the door to a dawn courtyard opens (birds). AUDIRA is lettered in the bottom
// border band of the left glass window. World: back wall z=0 (x -6.5..6.5), niche centre x=0, windows x=+-1.85,
// rosette (0,5.05), door in right wall x=6.5 at z=5.5. Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const RUBY = "#c4243a", COBALT = "#1f45b5", EMER = "#17905c", AMBER = "#f0a92a", TURQ = "#22b0b0", ROSE = "#d8577a", PALE = "#f3e6c4";
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

// pointed arch outline in (a, y): a across, sides a0..a1, base yb, spring ys, apex top
function archTo(p, a0, a1, yb, ys, top, startAtSpring) {
  const c = (a0 + a1) / 2, k = ys + (top - ys) * 0.78;
  if (!startAtSpring) { p.moveTo(a0, yb); p.lineTo(a0, ys); } else p.lineTo(a0, ys);
  p.quadraticCurveTo(a0, k, c, top);
  p.quadraticCurveTo(a1, k, a1, ys);
  if (!startAtSpring) p.lineTo(a1, yb);
}
function star8(g, cx, cy, R, rot = 0) {
  g.beginPath();
  for (let k = 0; k < 16; k++) { const a = rot + k * Math.PI / 8 - Math.PI / 2, rr = k % 2 ? R * 0.7654 : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath();
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0b0e1a, fog: 0.022, exp: 1.0, bloom: [0.55, 0.6, 0.72], shadow: false });
  cam.near = 0.03; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2121);
  const tv = new THREE.Vector3();

  // ---------- timing
  const tNight0 = A("s7:tiga") - 0.1, NP = 1.45, tNight1 = tNight0 + 3 * NP;
  const tDoor = A("s7:keluar") - 0.1;
  const tLamp2Down = A("s5:anak") - 1.2, tLamp2 = A("s5:Yahya") - 0.05;
  const tEmpty = A("s6:dulu") - 0.1, tMake0 = A("s6:ciptakan") - 0.1, tMake1 = A("s6:sekali") + 0.2;
  const tBook = A("s8:hikmah") - 0.1;
  const tPath0 = A("s4:pengalamannya") - 0.2, tPath1 = A("s4:mengecewakannya") + 0.3;
  const tBloom = A("s5:datang") - 0.5;
  const tCut = K.s8;

  // ---------- keyed scalars
  function kf(keys) {
    return (t) => {
      let i = 0; while (i < keys.length - 2 && keys[i + 1][0] <= t) i++;
      const a = keys[i], b = keys[i + 1];
      const u = sm((t - a[0]) / Math.max(0.001, b[0] - a[0]));
      return a[1] + (b[1] - a[1]) * u;
    };
  }
  // glass glow (window brightness multiplier)
  const glassK = kf([[0, 0.55], [A("s1:berdoa"), 0.6], [K.s2, 0.7], [A("s2:kisah"), 1.0], [A("s3:belum"), 1.0], [A("s3:kecewa"), 1.3], [K.s4, 1.05],
    [tBloom, 1.05], [tBloom + 0.7, 2.4], [A("s5:gembira") + 0.6, 1.5], [K.s6, 1.25], [A("s6:mandul"), 0.75], [A("s6:hal"), 1.0], [K.s7, 1.15],
    [K.s8, 1.15], [A("s8:Tidak"), 1.35], [K.dur, 1.25]]);
  const shaftK = kf([[0, 0.45], [K.s2, 0.6], [A("s2:kisah"), 1.0], [tBloom, 1.0], [tBloom + 0.7, 1.6], [A("s5:gembira") + 0.6, 1.2], [K.s6, 1.1], [A("s6:mandul"), 0.7], [A("s6:hal"), 1.0], [K.dur, 1.0]]);
  const lamp1K = kf([[0, 0.3], [A("s1:harapannya"), 0.24], [A("s1:habis"), 0.1], [A("s1:berdoa"), 0.35], [K.s2, 0.45], [A("s2:berdoa"), 0.55], [A("s3:belum"), 0.6], [A("s3:kecewa"), 0.95], [K.s4, 0.85], [tBloom + 0.7, 1.1], [K.dur, 1.0]]);
  const bloomK = kf([[0, 0.55], [tBloom, 0.55], [tBloom + 0.7, 1.05], [A("s5:gembira") + 0.6, 0.7], [tMake1 - 1, 0.7], [tMake1, 0.85], [K.s7, 0.6], [K.dur, 0.6]]);
  // night factor through the three nights of the sign
  const nightF = (t) => {
    if (t < tNight0 - 0.4 || t > tNight1 + 0.4) return 0;
    const ph = (t - tNight0) / NP; // noon at 0
    const n = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
    return n * ramp(t, tNight0 - 0.4, tNight0) * (1 - ramp(t, tNight1, tNight1 + 0.4));
  };

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0x6c78a8, 0x2a2018, 0.4); scene.add(hemi);
  const fill = new THREE.DirectionalLight(0xe8d6be, 0.6); fill.position.set(2.5, 5, 10); scene.add(fill); scene.add(fill.target);
  const fillLow = new THREE.DirectionalLight(0x9a8a78, 0.25); fillLow.position.set(-4, 1.2, 6); scene.add(fillLow);
  const L1 = new THREE.PointLight(0xffb060, 1, 5.5, 1.6); scene.add(L1);
  const L2 = new THREE.PointLight(0x9fe8d8, 0, 4.5, 1.6); scene.add(L2);
  const WLl = new THREE.PointLight(0xe0503a, 0, 3.8, 1.5); WLl.position.set(-0.7, 0.8, 2.4); scene.add(WLl);
  const WLr = new THREE.PointLight(0x3a7ae0, 0, 3.8, 1.5); WLr.position.set(3.0, 0.8, 2.6); scene.add(WLr);
  const WLs = new THREE.PointLight(0x40c090, 0, 3.6, 1.5); WLs.position.set(2.2, 0.8, 3.9); scene.add(WLs);
  const WWl = new THREE.PointLight(0xff8a50, 0, 2.6, 1.6); WWl.position.set(-1.85, 3.1, 0.75); scene.add(WWl);
  const WWr = new THREE.PointLight(0x5aa0ff, 0, 2.6, 1.6); WWr.position.set(1.85, 3.1, 0.75); scene.add(WWr);
  const RWL = new THREE.PointLight(0xd8b890, 3.2, 9, 1.1); RWL.position.set(4.0, 3.4, 5.5); scene.add(RWL);
  const DL = new THREE.PointLight(0xffb59a, 0, 7, 1.4); DL.position.set(5.6, 1.7, 5.5); scene.add(DL);

  // ---------- textures
  const stoneTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#b19c7c"; g.fillRect(0, 0, w, h);
    const ch = 108;
    for (let y = 0, row = 0; y < h; y += ch, row++) {
      let x = row % 2 ? -90 : 0;
      while (x < w) {
        const bw = 180 + rnd() * 150, v = rnd();
        g.fillStyle = `rgb(${172 + v * 26},${152 + v * 22},${118 + v * 18})`; g.fillRect(x + 3, y + 3, bw - 6, ch - 6);
        g.fillStyle = "rgba(255,240,210,.10)"; g.fillRect(x + 3, y + 3, bw - 6, 5);
        g.fillStyle = "rgba(60,40,20,.10)"; g.fillRect(x + 3, y + ch - 8, bw - 6, 5);
        x += bw;
      }
    }
    for (let i = 0; i < 26000; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(70,50,30,.10)" : "rgba(255,245,220,.08)"; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
  }, [0.25, 0.25]);
  const floorTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#6e5f4c"; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const v = rnd(); g.fillStyle = `rgb(${142 + v * 22},${126 + v * 18},${100 + v * 14})`; g.fillRect(i * 256 + 3, j * 256 + 3, 250, 250);
    }
    for (let i = 0; i < 9000; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(50,35,20,.10)" : "rgba(255,240,210,.07)"; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    for (const [x, y] of [[0, 0], [256, 0], [0, 256], [256, 256], [512, 0], [0, 512], [512, 512], [256, 512], [512, 256]]) { g.fillStyle = "#3d3328"; star8(g, x, y, 34); g.fill(); g.fillStyle = "#a07a3a"; star8(g, x, y, 14, Math.PI / 8); g.fill(); }
  }, [6.5, 8]);
  const nicheTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#c9b693"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { const x = (i + 0.5) * w / 14, gr = g.createLinearGradient(x - 18, 0, x + 18, 0); gr.addColorStop(0, "rgba(80,60,40,.0)"); gr.addColorStop(0.5, "rgba(80,60,40,.22)"); gr.addColorStop(1, "rgba(80,60,40,0)"); g.fillStyle = gr; g.fillRect(x - 18, 0, 36, h); }
    g.fillStyle = "#b59f7a"; g.fillRect(0, h * 0.18, w, 46);
    for (let x = 18; x < w; x += 36) { g.fillStyle = "#7d6646"; star8(g, x, h * 0.18 + 23, 15); g.fill(); }
    for (let i = 0; i < 6000; i++) { g.fillStyle = "rgba(60,40,20,.08)"; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
  });
  const domeTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#cdbb98"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) { const x = i * w / 24; g.fillStyle = i % 2 ? "rgba(90,70,45,.22)" : "rgba(255,240,210,.12)"; g.fillRect(x, 0, w / 24, h); }
    for (let y = 30; y < h; y += 50) { g.fillStyle = "rgba(80,60,40,.25)"; g.fillRect(0, y, w, 4); }
  });
  // coloured glass for the arched windows; mode "glass" (seen from inside, tracery backlit dark) or "pool" (light cast on stone)
  function drawWindow(g, w, h, fs, pal, mode, label) {
    const tr = mode === "glass" ? "#3e3238" : "#000";
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    g.save();
    g.beginPath(); archTo(g, 0, w, h, h * (1 - fs), 0); g.closePath(); g.clip();
    const cw = w / 3;
    for (let j = 0; j * cw < h + cw; j++) for (let i = 0; i < 3; i++) {
      const x = i * cw, y = h - (j + 1) * cw, k = (i + j) % 2;
      g.fillStyle = pal.base[k]; g.fillRect(x, y, cw, cw);
      g.fillStyle = pal.star[(i + j * 2) % pal.star.length]; star8(g, x + cw / 2, y + cw / 2, cw * 0.42); g.fill();
      g.fillStyle = pal.inner[(i + j) % pal.inner.length]; star8(g, x + cw / 2, y + cw / 2, cw * 0.16, Math.PI / 8); g.fill();
      g.fillStyle = PALE; g.globalAlpha = 0.55; for (const [cx, cy] of [[x, y], [x + cw, y]]) { g.beginPath(); g.arc(cx, cy, cw * 0.09, 0, 7); g.fill(); } g.globalAlpha = 1;
      g.strokeStyle = tr; g.lineWidth = 7; star8(g, x + cw / 2, y + cw / 2, cw * 0.42); g.stroke(); star8(g, x + cw / 2, y + cw / 2, cw * 0.16, Math.PI / 8); g.stroke();
      g.lineWidth = 5; g.strokeRect(x, y, cw, cw);
    }
    g.restore();
    g.strokeStyle = tr; g.lineWidth = 20; g.beginPath(); archTo(g, 0, w, h, h * (1 - fs), 0); g.closePath(); g.stroke();
    // bottom border band
    const bh = h * 0.075;
    g.fillStyle = mode === "glass" ? "#2a2030" : "#000"; g.fillRect(0, h - bh, w, bh);
    if (mode === "glass") {
      g.strokeStyle = "#5a4a3a"; g.lineWidth = 3; g.strokeRect(10, h - bh + 6, w - 20, bh - 12);
      if (label) {
        g.fillStyle = "#f6d58a"; g.font = `700 ${Math.round(bh * 0.6)}px Georgia, serif`; g.textBaseline = "middle"; g.textAlign = "center";
        const L = label.split(""), sp = w * 0.13, x0 = w / 2 - sp * (L.length - 1) / 2;
        L.forEach((ch, i) => g.fillText(ch, x0 + i * sp, h - bh / 2 + 2));
      } else { g.fillStyle = "#f6d58a"; for (let i = 0; i < 5; i++) { star8(g, w * (0.18 + i * 0.16), h - bh / 2, bh * 0.22); g.fill(); } }
    }
  }
  const WIN = { w: 0.9, yb: 1.75, ys: 3.85, top: 4.55 };
  const fsW = (WIN.ys - WIN.yb) / (WIN.top - WIN.yb);
  const PALS = [
    { base: [RUBY, "#8a1a48"], star: [AMBER, "#e8702a", PALE], inner: [TURQ, EMER] },
    { base: [COBALT, "#163a86"], star: [TURQ, EMER, PALE], inner: [AMBER, ROSE] },
  ];
  const winGlass = PALS.map((pal, i) => canvasTex(360, 1120, (g, w, h) => drawWindow(g, w, h, fsW, pal, "glass", i === 0 ? "AUDIRA" : "")));
  const blurred = (W, H, draw) => canvasTex(W, H, (g, w, h) => { const c2 = document.createElement("canvas"); c2.width = w; c2.height = h; draw(c2.getContext("2d"), w, h); g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.filter = "blur(7px)"; g.drawImage(c2, 0, 0); g.filter = "none"; });
  const winPool = PALS.map((pal) => blurred(360, 1120, (g, w, h) => drawWindow(g, w, h, fsW, pal, "pool")));

  // rosette (shamsiyya) pieces, shared by meshes and the pool texture. Units of R.
  const ROS = { x: 0, y: 5.05, R: 0.68 };
  const PIECES = [];
  { const pol = (rs, as) => rs.map((rr, i) => [rr * Math.cos(as[i]), rr * Math.sin(as[i])]);
    const d = Math.PI / 180;
    const c0 = []; for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12 + Math.PI / 2, rr = k % 2 ? 0.17 : 0.26; c0.push([rr * Math.cos(a), rr * Math.sin(a)]); }
    PIECES.push({ p: c0, c: AMBER, o: 0 });
    for (let k = 0; k < 12; k++) { const th = k * 30 * d + Math.PI / 2; PIECES.push({ p: pol([0.3, 0.44, 0.58, 0.44], [th, th - 13 * d, th, th + 13 * d]), c: k % 2 ? COBALT : RUBY, o: 1 + k / 12 }); }
    for (let k = 0; k < 12; k++) { const th = k * 30 * d + 15 * d + Math.PI / 2; PIECES.push({ p: pol([0.5, 0.7, 0.95, 0.7], [th, th - 10 * d, th, th + 10 * d]), c: [EMER, TURQ, AMBER][k % 3], o: 2 + k / 12 }); }
    for (let k = 0; k < 12; k++) { const th = k * 30 * d + Math.PI / 2; PIECES.push({ p: pol([0.66, 0.78, 0.93, 0.78], [th, th - 6 * d, th, th + 6 * d]), c: k % 2 ? ROSE : PALE, o: 3 + k / 12 }); }
  }
  const rosPool = blurred(512, 512, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    for (const P of PIECES) { g.fillStyle = P.c; g.beginPath(); P.p.forEach(([x, y], i) => { const X = w / 2 + x * w / 2 * 0.97, Y = h / 2 - y * h / 2 * 0.97; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill(); }
  });
  const rugTex = canvasTex(400, 700, (g, w, h) => {
    g.fillStyle = "#6e1420"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1d2550"; g.fillRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#7a1622"; g.fillRect(44, 44, w - 88, h - 88);
    g.strokeStyle = "#d9b05a"; g.lineWidth = 3; g.strokeRect(30, 30, w - 60, h - 60); g.strokeRect(44, 44, w - 88, h - 88);
    for (let y = 40; y < h - 30; y += 34) { g.fillStyle = "#d9b05a"; star8(g, 29, y, 6); g.fill(); star8(g, w - 29, y, 6); g.fill(); }
    // mihrab arch motif toward the top (the wall end)
    g.strokeStyle = "#e8cf98"; g.lineWidth = 6; g.beginPath(); archTo(g, 90, w - 90, h - 120, 230, 90); g.stroke();
    g.fillStyle = "rgba(20,30,70,.55)"; g.beginPath(); archTo(g, 102, w - 102, h - 130, 236, 104); g.closePath(); g.fill();
    g.fillStyle = "#d9b05a"; star8(g, w / 2, 330, 46); g.fill(); g.fillStyle = "#7a1622"; star8(g, w / 2, 330, 22, Math.PI / 8); g.fill();
    for (let i = 0; i < 4000; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,.08)" : "rgba(255,220,180,.05)"; g.fillRect(rnd() * w, rnd() * h, 2, 1); }
    g.strokeStyle = "#e8dcc0"; g.lineWidth = 2; for (let x = 16; x < w - 10; x += 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 12); g.moveTo(x, h); g.lineTo(x, h - 12); g.stroke(); }
  });
  const glowTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const inlayGlow = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,220,150,1)"); gr.addColorStop(0.5, "rgba(255,190,90,.35)"); gr.addColorStop(1, "rgba(255,180,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.fillStyle = "rgba(255,240,200,1)"; star8(g, 64, 64, 26); g.fill(); });
  const pageTex = canvasTex(256, 160, (g, w, h) => {
    g.fillStyle = "#efe2c2"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#7a5a34"; g.lineWidth = 3; g.strokeRect(10, 10, w / 2 - 20, h - 20); g.strokeRect(w / 2 + 10, 10, w / 2 - 20, h - 20);
    g.fillStyle = "rgba(60,40,25,.55)"; for (let y = 26; y < h - 20; y += 13) { g.fillRect(20, y, w / 2 - 44, 3); g.fillRect(w / 2 + 24, y, w / 2 - 44, 3); }
    g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(w / 2 - 3, 0, 6, h);
  });
  const doorSpillTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,190,150,1)"); gr.addColorStop(1, "rgba(255,190,150,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const g2 = g.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, "rgba(0,0,0,1)"); g2.addColorStop(0.2, "rgba(0,0,0,0)"); g2.addColorStop(0.8, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = g2; g.fillRect(0, 0, w, h); });

  // ---------- materials
  const wallM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.92, side: THREE.DoubleSide });
  const trimM = new THREE.MeshStandardMaterial({ color: 0xd8c8a6, roughness: 0.8 });
  const nicheM = new THREE.MeshStandardMaterial({ map: nicheTex, roughness: 0.85, side: THREE.DoubleSide });
  const domeM = new THREE.MeshStandardMaterial({ map: domeTex, roughness: 0.85, side: THREE.DoubleSide });
  const floorM = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.82 });
  const woodM = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.7 });
  const woodD = new THREE.MeshStandardMaterial({ color: 0x2e1f14, roughness: 0.8 });
  const brassM = new THREE.MeshStandardMaterial({ color: 0xc89a48, roughness: 0.35, metalness: 0.85 });
  const benchM = new THREE.MeshStandardMaterial({ color: 0xa58f70, roughness: 0.9 });
  const woolM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, emissive: 0x3a3630 });
  const add = (geo, mat, x, y, z, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };

  // ---------- room
  const floor = add(new THREE.PlaneGeometry(13, 16), floorM, 0, 0, 6.3); floor.rotation.x = -Math.PI / 2;
  const NW = 1.0, NS = 2.7, NT = 3.68, WH = 9.2;
  { // back wall with the mihrab notch, two arched windows and the rosette as holes
    const s = new THREE.Shape();
    s.moveTo(-6.5, 0); s.lineTo(-NW, 0); archTo(s, -NW, NW, 0, NS, NT, true); s.lineTo(NW, 0); s.lineTo(6.5, 0); s.lineTo(6.5, WH); s.lineTo(-6.5, WH); s.lineTo(-6.5, 0);
    for (const cx of [-1.85, 1.85]) { const h = new THREE.Path(); archTo(h, cx - WIN.w / 2, cx + WIN.w / 2, WIN.yb, WIN.ys, WIN.top); h.lineTo(cx - WIN.w / 2, WIN.yb); s.holes.push(h); }
    const rh = new THREE.Path(); rh.absarc(ROS.x, ROS.y, ROS.R, 0, Math.PI * 2, false); s.holes.push(rh);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, -0.5);
    add(g, wallM, 0, 0, 0);
  }
  { // side walls (right one with the door notch), ceiling
    const DZ0 = 4.7, DZ1 = 6.3, DS = 2.65, DT = 3.45;
    const sl = new THREE.Shape(); sl.moveTo(-0.5, 0); sl.lineTo(14.5, 0); sl.lineTo(14.5, WH); sl.lineTo(-0.5, WH); sl.lineTo(-0.5, 0);
    const gl = new THREE.ExtrudeGeometry(sl, { depth: 0.5, bevelEnabled: false }); gl.translate(0, 0, -0.25);
    const lw = add(gl, wallM, -6.75, 0, 0); lw.rotation.y = -Math.PI / 2;
    const sr = new THREE.Shape(); sr.moveTo(-0.5, 0); sr.lineTo(DZ0, 0); archTo(sr, DZ0, DZ1, 0, DS, DT, true); sr.lineTo(DZ1, 0); sr.lineTo(14.5, 0); sr.lineTo(14.5, WH); sr.lineTo(-0.5, WH); sr.lineTo(-0.5, 0);
    const gr = new THREE.ExtrudeGeometry(sr, { depth: 0.5, bevelEnabled: false, curveSegments: 20 }); gr.translate(0, 0, -0.25);
    const rw = add(gr, wallM, 6.75, 0, 0); rw.rotation.y = -Math.PI / 2;
    add(new THREE.BoxGeometry(14.2, 0.3, 16.5), woodD, 0, WH + 0.15, 6.5);
    for (let z = 0.6; z < 14.5; z += 1.3) add(new THREE.BoxGeometry(13, 0.22, 0.2), woodM, 0, WH - 0.11, z);
    // door lunette glass
    const ls = new THREE.Shape(); ls.moveTo(DZ0, DS); archTo(ls, DZ0, DZ1, 0, DS, DT, true); ls.lineTo(DZ0, DS);
    const lg = new THREE.ShapeGeometry(ls, 16); const uv = lg.attributes.uv, lp = lg.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (lp.getX(i) - DZ0) / (DZ1 - DZ0), 0.75 + 0.25 * (lp.getY(i) - DS) / (DT - DS));
    const lun = add(lg, new THREE.MeshBasicMaterial({ map: winGlass[1], color: 0x9aa0b0, side: THREE.DoubleSide }), 6.72, 0, 0); lun.rotation.y = -Math.PI / 2;
  }
  // door leaves (open outward at tDoor)
  const doorP = [];
  for (const [z0, sgn] of [[4.7, 1], [6.3, -1]]) {
    const pv = new THREE.Group(); pv.position.set(6.95, 0, z0); scene.add(pv);
    add(new THREE.BoxGeometry(0.08, 2.65, 0.8), new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.7 }), 0, 1.325, 0.4 * sgn, pv);
    for (const y of [0.5, 1.3, 2.1]) add(new THREE.BoxGeometry(0.1, 0.07, 0.74), woodD, -0.01, y, 0.4 * sgn, pv);
    add(new THREE.TorusGeometry(0.06, 0.012, 8, 20), brassM, -0.06, 1.25, 0.68 * sgn, pv).rotation.y = Math.PI / 2;
    doorP.push({ pv, sgn });
  }

  // mihrab niche: half cylinder, half dome, shelf, frame, columns
  const NR = 1.03;
  add(new THREE.CylinderGeometry(NR, NR, NS, 40, 1, true, Math.PI / 2, Math.PI), nicheM, 0, NS / 2, -0.5);
  add(new THREE.SphereGeometry(NR, 40, 16, Math.PI, Math.PI, 0, Math.PI / 2), domeM, 0, NS, -0.5);
  add(new THREE.CylinderGeometry(0.72, 0.72, 0.07, 32, 1, false, Math.PI / 2, Math.PI), trimM, 0, 1.15, -0.5);
  add(new THREE.CylinderGeometry(0.98, 0.98, 0.16, 32, 1, false, Math.PI / 2, Math.PI), trimM, 0, 0.08, -0.5);
  { const s = new THREE.Shape(), F = NW + 0.16, k0 = NS + (NT + 0.2 - NS) * 0.78, k1 = NS + (NT - NS) * 0.78;
    s.moveTo(-F, 0); s.lineTo(-F, NS); s.quadraticCurveTo(-F, k0, 0, NT + 0.2); s.quadraticCurveTo(F, k0, F, NS); s.lineTo(F, 0); s.lineTo(NW, 0); s.lineTo(NW, NS);
    s.quadraticCurveTo(NW, k1, 0, NT); s.quadraticCurveTo(-NW, k1, -NW, NS); s.lineTo(-NW, 0); s.lineTo(-F, 0);
    add(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false, curveSegments: 24 }), trimM, 0, 0, 0);
    for (const sx of [-1, 1]) { add(new THREE.CylinderGeometry(0.055, 0.065, NS - 0.1, 14), trimM, sx * (NW + 0.07), NS / 2, 0.1); add(new THREE.BoxGeometry(0.17, 0.12, 0.17), trimM, sx * (NW + 0.07), NS, 0.1); }
    // window frames + rosette frame
    for (const cx of [-1.85, 1.85]) {
      const f = new THREE.Shape(); archTo(f, cx - WIN.w / 2 - 0.12, cx + WIN.w / 2 + 0.12, WIN.yb - 0.12, WIN.ys, WIN.top + 0.14); f.lineTo(cx - WIN.w / 2 - 0.12, WIN.yb - 0.12);
      const fh = new THREE.Path(); archTo(fh, cx - WIN.w / 2, cx + WIN.w / 2, WIN.yb, WIN.ys, WIN.top); fh.lineTo(cx - WIN.w / 2, WIN.yb); f.holes.push(fh);
      add(new THREE.ExtrudeGeometry(f, { depth: 0.05, bevelEnabled: false, curveSegments: 20 }), trimM, 0, 0, 0);
    }
    add(new THREE.TorusGeometry(ROS.R + 0.05, 0.07, 10, 64), trimM, ROS.x, ROS.y, 0.02);
  }
  // window glass (inside the wall thickness)
  const glassMs = [];
  [-1.85, 1.85].forEach((cx, i) => {
    const s = new THREE.Shape(); archTo(s, cx - WIN.w / 2, cx + WIN.w / 2, WIN.yb, WIN.ys, WIN.top); s.lineTo(cx - WIN.w / 2, WIN.yb);
    const g = new THREE.ShapeGeometry(s, 20); const uv = g.attributes.uv, p = g.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (p.getX(k) - (cx - WIN.w / 2)) / WIN.w, (p.getY(k) - WIN.yb) / (WIN.top - WIN.yb));
    const m = new THREE.MeshBasicMaterial({ map: winGlass[i], fog: false }); glassMs.push(m);
    add(g, m, 0, 0, -0.22);
  });
  // rosette pieces on a dark backing
  add(new THREE.CircleGeometry(ROS.R, 64), new THREE.MeshBasicMaterial({ color: 0x0c0e18 }), ROS.x, ROS.y, -0.24);
  const rosM = PIECES.map((P) => {
    const s = new THREE.Shape(); const c = P.p.reduce((a, q) => [a[0] + q[0] / P.p.length, a[1] + q[1] / P.p.length], [0, 0]);
    P.p.forEach(([x, y], i) => { const X = (c[0] + (x - c[0]) * 0.88) * ROS.R, Y = (c[1] + (y - c[1]) * 0.88) * ROS.R; i ? s.lineTo(X, Y) : s.moveTo(X, Y); });
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(P.c), fog: false, transparent: true });
    add(new THREE.ShapeGeometry(s), m, ROS.x, ROS.y, -0.22);
    return { m, base: new THREE.Color(P.c), o: P.o };
  });

  // ---------- light: projection of window apertures along the sun direction onto the floor
  const Ld = new THREE.Vector3();
  const APS = [
    { kind: "win", cx: -1.85, tex: winPool[0], rows: [] },
    { kind: "win", cx: 1.85, tex: winPool[1], rows: [] },
    { kind: "ros", cx: ROS.x, tex: rosPool, rows: [] },
  ];
  const apPoint = (ap, u, v, out) => {
    if (ap.kind === "win") return out.set(ap.cx - WIN.w / 2 + u * WIN.w, WIN.yb + v * (WIN.top - WIN.yb), 0.02);
    return out.set(ROS.x - ROS.R + u * 2 * ROS.R, ROS.y - ROS.R + v * 2 * ROS.R, 0.02);
  };
  const toFloor = (p, out, y0 = 0.012) => { const s = (p.y - y0) / -Ld.y; return out.set(p.x + Ld.x * s, y0, p.z + Ld.z * s); };
  function quadGeo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), 2));
    g.setAttribute("aL", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 1]), 1));
    g.setIndex([0, 2, 1, 1, 2, 3]);
    return g;
  }
  const SH_V = `attribute float aL;varying vec2 vUv;varying float vL;varying vec3 vW;void main(){vUv=uv;vL=aL;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
  const SH_F = `uniform sampler2D map;uniform float uRow,uOp,uT;uniform vec3 uTint;varying vec2 vUv;varying float vL;varying vec3 vW;
void main(){vec3 c=texture2D(map,vec2(vUv.x,uRow)).rgb;float e=smoothstep(0.,.14,vUv.x)*smoothstep(1.,.86,vUv.x);
float a=uOp*e*(.3+.7*(1.-vL))*smoothstep(0.,.08,vL)*smoothstep(1.,.9,vL);
a*=.72+.28*sin(vW.x*4.3+vW.y*2.7-uT*.5)*sin(vW.z*3.7+uT*.33);a*=smoothstep(.8,3.5,distance(vW,cameraPosition));
gl_FragColor=vec4(c*uTint*a,1.);}`;
  const NROW = 7;
  const tint = new THREE.Color(1, 1, 1);
  for (const ap of APS) {
    for (let j = 0; j < NROW; j++) {
      const v = (j + 0.5) / NROW;
      const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: ap.tex }, uRow: { value: v }, uOp: { value: 0 }, uT: { value: 0 }, uTint: { value: tint } }, vertexShader: SH_V, fragmentShader: SH_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const m = new THREE.Mesh(quadGeo(), mat); m.frustumCulled = false; scene.add(m);
      ap.rows.push({ m, v });
    }
    const pm = new THREE.MeshBasicMaterial({ map: ap.tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: 0xffffff, fog: false });
    ap.pool = new THREE.Mesh(quadGeo(), pm); ap.pool.frustumCulled = false; ap.pool.renderOrder = 2; scene.add(ap.pool);
  }
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3(), pd = new THREE.Vector3();
  function setQuad(mesh, a, b, c, d) { const p = mesh.geometry.attributes.position.array; [a, b, c, d].forEach((q, i) => { p[i * 3] = q.x; p[i * 3 + 1] = q.y; p[i * 3 + 2] = q.z; }); mesh.geometry.attributes.position.needsUpdate = true; }

  // ---------- objects of the aged worshipper (no figure)
  const rug = add(new THREE.PlaneGeometry(1.2, 2.1), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 }), 0, 0.008, 2.0); rug.rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(1.1, 0.4, 0.5), benchM, -2.2, 0.2, 0.32);
  { // folded white wool shawl + loose wool tuft
    const g = new THREE.BoxGeometry(0.68, 0.12, 0.42, 16, 4, 10); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); p.setXYZ(i, x * (1 - 0.06 * Math.abs(y) * 8), y + 0.012 * Math.sin(x * 40) * Math.cos(z * 37) + (y > 0 ? 0.02 * Math.cos(x * 4) : 0), z); }
    g.computeVertexNormals();
    add(g, woolM, -2.35, 0.47, 0.33).rotation.y = 0.08;
    const tg = new THREE.IcosahedronGeometry(0.13, 4); const tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) { tv.fromBufferAttribute(tp, i); const n = 1 + 0.08 * Math.sin(tv.x * 41) * Math.sin(tv.y * 37 + 1) * Math.sin(tv.z * 43 + 2); tv.multiplyScalar(n); tv.y *= 0.7; tp.setXYZ(i, tv.x, tv.y, tv.z); }
    tg.computeVertexNormals();
    add(tg, woolM, -1.92, 0.5, 0.34);
    for (let i = 0; i < 9; i++) { const m = add(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 4), woolM, -2.65 + i * 0.075, 0.39, 0.55); m.rotation.x = 0.4; }
  }
  { // cane leaning against the wall
    const foot = new THREE.Vector3(-1.42, 0, 0.32), top = new THREE.Vector3(-1.29, 1.12, 0.06);
    const len = foot.distanceTo(top);
    const cane = add(new THREE.CylinderGeometry(0.018, 0.022, len, 10), woodM, (foot.x + top.x) / 2, len / 2 * (top.y - foot.y) / len, (foot.z + top.z) / 2);
    cane.position.y = (foot.y + top.y) / 2;
    cane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tv.copy(top).sub(foot).normalize());
    const hd = add(new THREE.TorusGeometry(0.06, 0.019, 8, 18, Math.PI), woodM, top.x + 0.055, top.y, top.z + 0.01);
    hd.rotation.set(0, 0, 0.12);
    add(new THREE.CylinderGeometry(0.024, 0.024, 0.04, 10), brassM, foot.x, 0.02, foot.z);
  }

  // ---------- lamps
  const lampGeo = new THREE.LatheGeometry([[0.0, 0], [0.05, 0.0], [0.08, 0.05], [0.05, 0.13], [0.06, 0.18], [0.13, 0.28], [0.12, 0.34], [0.07, 0.38], [0.1, 0.48], [0.115, 0.5]].map(([x, y]) => new THREE.Vector2(x, y)), 28);
  function lamp(x, y, z, sc, hex) {
    const G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(sc); scene.add(G);
    const gm = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.82, emissive: new THREE.Color(hex), emissiveIntensity: 0, side: THREE.DoubleSide, depthWrite: false });
    add(lampGeo, gm, 0, 0, 0, G);
    for (let k = 0; k < 3; k++) { const a = k * 2.094; add(new THREE.TorusGeometry(0.02, 0.005, 6, 12), brassM, Math.cos(a) * 0.105, 0.49, Math.sin(a) * 0.105, G); }
    const chain = add(new THREE.CylinderGeometry(0.006, 0.006, 3, 6), brassM, 0, 0.5 + 1.5, 0, G);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd9a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    fl.position.set(0, 0.2, 0); fl.scale.set(0.09, 0.16, 1); G.add(fl);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    halo.position.set(0, 0.24, 0); halo.scale.setScalar(0.9); G.add(halo);
    return { G, gm, fl, halo, chain };
  }
  const LA = lamp(-0.32, 1.85, -0.85, 1.0, 0xe0a050);
  const LB = lamp(0.34, 1.97, -0.85, 0.8, 0x6fd0c0);
  LB.halo.material.color.set(0x9ff0d8);

  // book on a folding stand (rahle), on the niche shelf below the second lamp
  const book = new THREE.Group(); book.position.set(0.3, 1.19, -0.92); book.rotation.y = 0; scene.add(book);
  for (const s of [-1, 1]) { const b = add(new THREE.BoxGeometry(0.2, 0.012, 0.16), woodM, 0, 0.07, s * 0.04, book); b.rotation.x = s * 0.9; }
  const pg = add(new THREE.PlaneGeometry(0.26, 0.16), new THREE.MeshStandardMaterial({ map: pageTex, roughness: 0.9, emissive: 0xffe0a0, emissiveIntensity: 0, emissiveMap: pageTex }), 0, 0.14, 0.02, book);
  pg.rotation.x = -0.75;
  const bookGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe2a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  bookGlow.position.set(0, 0.16, 0.03); bookGlow.scale.setScalar(0.6); book.add(bookGlow);

  // whisper ripples
  const RIP = [];
  const ripM = () => new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < 6; i++) { const m = add(new THREE.RingGeometry(0.9, 1, 72), ripM(), 0, -9, 0); m.frustumCulled = false; RIP.push(m); }
  const RP0 = new THREE.Vector3(0, 1.0, 2.6), RP1 = new THREE.Vector3(-0.32, 2.05, -0.8);
  const RWIN = [[A("s1:berdoa"), K.s1e - 0.3], [A("s2:berdoa"), K.s3e], [A("s8:Tidak"), A("s8:Doa")]];
  const RGAP = 0.62, RLIFE = 2.6;

  // floor star inlays for the path of answered prayers (s4)
  const PATH = [];
  for (let k = 0; k < 9; k++) {
    const z = 12.4 - k * 1.05, x = 0.35 * Math.sin(k * 0.8);
    const inl = add(new THREE.CircleGeometry(0.22, 8), brassM, x, 0.006, z); inl.rotation.x = -Math.PI / 2; inl.rotation.z = Math.PI / 8;
    const gl = add(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: inlayGlow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), x, 0.02, z);
    gl.rotation.x = -Math.PI / 2;
    PATH.push({ gl, k });
  }

  // door light spill
  const spill = add(new THREE.PlaneGeometry(3.6, 2.2), new THREE.MeshBasicMaterial({ map: doorSpillTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), 4.7, 0.015, 5.5);
  spill.rotation.x = -Math.PI / 2; spill.rotation.z = Math.PI;

  // ---------- exterior courtyard at dawn (seen only through the door)
  const SKY = { top: { value: new THREE.Color(0x3b4f8a) }, hor: { value: new THREE.Color(0xf2a07a) }, sun: { value: new THREE.Vector3(1, 0.06, -0.12).normalize() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), new THREE.ShaderMaterial({ uniforms: SKY, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 top,hor,sun;varying vec3 vD;void main(){vec3 d=normalize(vD);vec3 c=mix(hor,top,smoothstep(-.02,.45,d.y));float g=max(dot(d,sun),0.);c+=vec3(1.,.72,.45)*(pow(g,6.)*.35+pow(g,300.)*.6);gl_FragColor=vec4(c,1.);}` }));
  sky.position.set(8, 0, 5.5); sky.renderOrder = -10; scene.add(sky);
  const silM = new THREE.MeshBasicMaterial({ color: 0x3a2a40 });
  const ground = add(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ color: 0x8c6a64 }), 67, -0.01, 5.5); ground.rotation.x = -Math.PI / 2;
  { const s = new THREE.Shape(); s.moveTo(-30, 0); for (let k = 0; k < 14; k++) { const z0 = -24 + k * 3.6; s.lineTo(z0, 0); archTo(s, z0, z0 + 2.4, 0, 2.6, 3.6, true); s.lineTo(z0 + 2.4, 0); } s.lineTo(30, 0); s.lineTo(30, 5.2); s.lineTo(-30, 5.2); s.lineTo(-30, 0);
    const arc = add(new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: false }), silM, 30, 0, 5.5); arc.rotation.y = -Math.PI / 2;
    add(new THREE.SphereGeometry(4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), silM, 34, 5.2, -2);
    add(new THREE.CylinderGeometry(0.5, 0.6, 12, 12), silM, 33, 6, 13); add(new THREE.ConeGeometry(0.7, 1.6, 12), silM, 33, 12.8, 13);
  }
  const palmM = new THREE.MeshBasicMaterial({ color: 0x2c2030 });
  for (const [x, z, h, lean] of [[17, 1.2, 5.5, 0.1], [21, 9.4, 6.5, -0.08], [25, 3.8, 7.2, 0.05]]) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.z = lean; scene.add(G);
    add(new THREE.CylinderGeometry(0.13, 0.2, h, 8), palmM, 0, h / 2, 0, G);
    for (let k = 0; k < 9; k++) { const fr = add(new THREE.ConeGeometry(0.12, 1.9, 4), palmM, 0, h, 0, G); const a = k * 0.7; fr.rotation.set(Math.cos(a) * 1.75, 0, Math.sin(a) * 1.75); fr.scale.set(1, 1, 0.3); fr.translateY(0.85); }
  }
  const birds = [];
  for (let i = 0; i < 9; i++) {
    const G = new THREE.Group(); scene.add(G);
    const wl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.12), new THREE.MeshBasicMaterial({ color: 0x1e1622, side: THREE.DoubleSide }));
    const wr = wl.clone(); wl.position.z = -0.2; wr.position.z = 0.2; wl.rotation.x = -Math.PI / 2; wr.rotation.x = -Math.PI / 2;
    const pl = new THREE.Group(), pr = new THREE.Group(); pl.add(wl); pr.add(wr); G.add(pl); G.add(pr);
    add(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: 0x1e1622 }), 0, 0, 0, G).scale.set(2.2, 1, 1);
    birds.push({ G, pl, pr, s: [rnd(), rnd(), rnd(), rnd()] });
  }

  // ---------- dust motes: in the beams (coloured) and in the room
  const NM = 520, beamM = pts(scene, NM, { size: 0.035, add: true, opacity: 1 });
  const mS = Array.from({ length: NM }, () => [Math.floor(rnd() * 3), rnd(), rnd(), rnd(), rnd(), rnd()]);
  const MCOL = [RUBY, COBALT, EMER, AMBER, TURQ, ROSE, PALE].map((h) => new THREE.Color(h));
  const NR2 = 300, roomM = pts(scene, NR2, { size: 0.02, add: true, opacity: 0.6 });
  const rS = Array.from({ length: NR2 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- camera (two tracks with a covered cut at s8)
  const camA = track([
    [0, -0.7, 0.85, 1.95, -1.33, 0.66, 0.2],
    [A("s1:rambutnya"), -1.2, 0.85, 2.0, -1.75, 0.55, 0.3],
    [A("s1:uban"), -1.65, 0.95, 2.1, -2.15, 0.5, 0.32],
    [A("s1:mandul") + 0.3, -1.0, 1.25, 2.9, -1.8, 0.6, 0.25],
    [A("s1:harapannya"), -0.25, 2.2, 2.3, -0.32, 2.35, -0.85],
    [A("s1:habis") + 0.4, -0.27, 2.2, 1.85, -0.32, 2.35, -0.85],
    [A("s1:berdoa") + 0.2, 0.0, 1.8, 4.4, 0, 1.6, -0.3],
    [K.s1e, 0.25, 2.1, 6.6, 0, 1.9, -0.2],
    [A("s2:kisah") + 0.3, 0.5, 2.9, 12.0, 0, 3.0, 0],
    [A("s2:berdoa"), 0.4, 2.6, 10.6, 0, 2.6, 0],
    [A("s2:berbisik"), 0.3, 1.9, 6.0, 0, 1.6, 0.2],
    [A("s2:mihrab"), 0.2, 2.0, 4.4, 0, 1.9, -0.3],
    [A("s2:tidak"), 0.35, 2.15, 2.5, 0.0, 2.05, -0.85],
    [K.s2e, 0.3, 2.2, 2.25, 0.0, 2.08, -0.85],
    [K.s3 + 0.8, -0.6, 1.2, 5.4, 0, 2.2, -0.4],
    [K.s3e, 0.5, 1.3, 4.6, 0, 2.15, -0.5],
    [A("s4:kuncinya"), 0.0, 2.25, 2.7, -0.2, 2.15, -0.85],
    [A("s4:keadaannya"), -0.9, 1.2, 2.7, -1.75, 0.6, 0.25],
    [A("s4:pengalamannya") + 0.2, 1.6, 5.4, 13.8, 0, 0.3, 6.0],
    [A("s4:mengecewakannya"), 0.8, 3.6, 8.8, 0, 0.8, 2.6],
    [K.s4e, 0.5, 3.0, 9.6, 0, 2.2, 0.5],
    [A("s5:datang") + 0.3, 0.3, 2.8, 11.8, 0, 3.0, 0],
    [A("s5:gembira"), 0.2, 2.6, 8.5, 0, 2.8, -0.2],
    [A("s5:anak"), 0.25, 2.4, 3.8, 0.0, 2.5, -0.85],
    [A("s5:Yahya"), 0.2, 2.25, 3.1, 0.0, 2.35, -0.85],
    [K.s5e, 0.15, 2.22, 2.7, 0.0, 2.32, -0.85],
    [K.s6 + 0.7, -0.55, 1.15, 3.7, -1.65, 0.9, 0.3],
    [A("s6:mandul"), -0.75, 1.1, 3.3, -1.7, 0.88, 0.3],
    [A("s6:hal"), 0.3, 3.4, 8.0, 0, 5.3, 0],
    [tMake0, 0.2, 3.7, 7.4, 0, 5.4, 0],
    [K.s6e, 0.1, 3.9, 6.9, 0, 5.4, 0],
    [A("s7:tanda"), -1.0, 2.6, 9.4, 0, 2.8, 0],
    [A("s7:manusia"), -0.5, 2.5, 7.8, 0, 2.6, 0],
    [A("s7:sehat"), 2.2, 2.0, 6.4, 6.5, 1.75, 5.5],
    [A("s7:memberi"), 4.1, 1.75, 5.9, 9.5, 2.0, 5.3],
    [A("s7:bertasbihlah"), 5.3, 1.7, 5.6, 14, 2.6, 5.2],
    [K.s8, 5.8, 1.75, 5.55, 16, 2.8, 5.0],
  ]);
  const camB = track([
    [K.s8, 0.45, 2.35, 3.3, 0.02, 2.3, -0.85],
    [A("s8:Yahya") + 2.5, 0.3, 2.25, 2.9, 0.02, 2.25, -0.85],
    [A("s8:hikmah"), 0.25, 2.0, 2.75, 0.05, 1.85, -0.9],
    [A("s8:Tidak"), 0.2, 1.9, 4.6, 0, 1.8, -0.5],
    [A("s8:Doa"), 0.1, 2.2, 7.2, 0, 2.2, 0],
    [A("s8:Kisah"), 0.05, 2.6, 11.0, 0, 2.6, 0],
    [K.end, 0.0, 2.7, 12.6, 0, 2.6, 0],
    [K.dur, 0.0, 2.7, 12.9, 0, 2.6, 0],
  ]);
  const look = new THREE.Vector3();
  const nightTint = new THREE.Color(0.38, 0.5, 1.0), white = new THREE.Color(1, 1, 1), tmpC = new THREE.Color();

  return (t) => {
    const c = t < tCut ? camA(t) : camB(t);
    const dist = Math.hypot(c[0] - c[3], c[1] - c[4], c[2] - c[5]);
    const dr = Math.min(1, dist / 5) * 0.05;
    cam.position.set(c[0] + Math.sin(t * 0.31) * dr, c[1] + Math.sin(t * 0.23) * dr * 0.6, c[2] + Math.cos(t * 0.27) * dr);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // sun direction drifts slowly: the coloured patterns move across the stone
    Ld.set(0.3 + 0.09 * Math.sin(t * 0.045) + t * 0.0012, -0.75, 0.56 + 0.05 * Math.sin(t * 0.031 + 1));
    const nf = nightF(t);
    const gk = glassK(t) * (1 - 0.82 * nf);
    tint.copy(white).lerp(nightTint, nf);
    tmpC.copy(white).lerp(nightTint, nf).multiplyScalar(gk);
    glassMs.forEach((m) => m.color.copy(tmpC));
    const sk = shaftK(t) * (1 - 0.75 * nf);

    // rosette: empties at "dulu", rebuilt piece by piece from "ciptakan"
    const empt = ramp(t, tEmpty, tEmpty + 0.45);
    let filled = 0;
    for (const P of rosM) {
      const ti = tMake0 + (P.o / 4) * (tMake1 - tMake0 - 0.5);
      const on = 1 - empt + empt * ramp(t, ti, ti + 0.35);
      const pop = empt > 0.5 ? Math.exp(-Math.max(0, t - ti) * 3) * ramp(t, ti, ti + 0.1) : 0;
      filled += on / rosM.length;
      P.m.color.copy(P.base).multiply(tmpC).multiplyScalar(on * 1.15 + pop * 1.6);
      P.m.opacity = Math.min(1, on * 1.2);
    }

    // shafts + pools
    APS.forEach((ap, i) => {
      const f = i === 2 ? filled : 1;
      const op = sk * f * (i === 2 ? 0.1 : 0.13);
      for (const row of ap.rows) {
        apPoint(ap, 0, row.v, pa); apPoint(ap, 1, row.v, pb); toFloor(pa, pc, 0.02); toFloor(pb, pd, 0.02);
        setQuad(row.m, pa, pb, pc, pd);
        row.m.material.uniforms.uOp.value = op; row.m.material.uniforms.uT.value = t;
      }
      apPoint(ap, 0, 0, pa); apPoint(ap, 1, 0, pb); apPoint(ap, 0, 1, pc); apPoint(ap, 1, 1, pd);
      toFloor(pa, pa); toFloor(pb, pb); toFloor(pc, pc); toFloor(pd, pd);
      setQuad(ap.pool, pa, pb, pc, pd);
      ap.pool.material.opacity = Math.min(1, 0.62 * sk * f);
      ap.pool.material.color.copy(tint);
    });
    WLl.intensity = 1.4 * sk; WLr.intensity = 1.4 * sk; WLs.intensity = 1.1 * sk * filled;
    WWl.intensity = 0.9 * gk; WWr.intensity = 0.9 * gk;
    WLl.color.set(0xe0503a).lerp(nightTint, nf); WLr.color.set(0x3a7ae0).lerp(nightTint, nf);

    // ambient
    const dayLow = 1 - 0.45 * nf;
    fill.intensity = 0.6 * dayLow * (0.75 + 0.25 * ramp(t, K.s1e - 1, K.s2 + 2)); fillLow.intensity = 0.25 * dayLow;
    hemi.intensity = 0.38 * dayLow;
    scene.fog.density = 0.022 - 0.016 * ramp(t, tDoor, tDoor + 1.2) * (t < tCut ? 1 : 0);

    // lamps
    const fk = 0.86 + 0.14 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
    const l1 = lamp1K(t) * (t < A("s1:berdoa") ? 0.75 + 0.25 * Math.sin(t * 5.1) * Math.sin(t * 2.3) : 1);
    LA.gm.emissiveIntensity = 0.2 * l1 * fk; LA.fl.material.opacity = Math.min(0.75, l1); LA.fl.scale.set(0.09, 0.16 * fk * (0.6 + 0.4 * l1), 1);
    LA.halo.material.opacity = 0.2 * l1 * fk; LA.halo.scale.setScalar(0.4 + 0.35 * l1);
    L1.position.set(-0.32, 2.05, -0.6); L1.intensity = 1.3 * l1 * fk;
    const down = eout(clamp01((t - tLamp2Down) / 1.6));
    const lit2 = ramp(t, tLamp2, tLamp2 + 0.6);
    LB.G.visible = t > tLamp2Down - 0.05;
    LB.G.position.y = 1.97 + (1 - down) * 1.45;
    LB.G.rotation.z = (1 - down) * 0.05 * Math.sin(t * 3);
    const fk2 = 0.88 + 0.12 * Math.sin(t * 11.3 + 2) * Math.sin(t * 6.1);
    LB.gm.emissiveIntensity = 0.14 * lit2 * fk2; LB.fl.material.opacity = 0.75 * lit2; LB.halo.material.opacity = 0.15 * lit2 * fk2 * (1 + 1.5 * Math.exp(-Math.max(0, t - tLamp2) * 2.5) * ramp(t, tLamp2, tLamp2 + 0.05)); LB.halo.scale.setScalar(0.4 + 0.3 * lit2);
    L2.position.set(0.34, LB.G.position.y + 0.2, -0.6); L2.intensity = 1.1 * lit2 * fk2;

    // close to the niche: keep the lamps from washing the frame
    const near = 1 - ramp(cam.position.distanceTo(tv.set(0, 2.1, -0.85)), 2.5, 6);
    LA.halo.material.opacity *= 1 - 0.75 * near; LB.halo.material.opacity *= 1 - 0.75 * near;
    LA.gm.emissiveIntensity *= 1 - 0.5 * near; LB.gm.emissiveIntensity *= 1 - 0.5 * near;
    L1.intensity *= 1 - 0.4 * near; L2.intensity *= 1 - 0.4 * near;
    // book (s8)
    const bk = eout(clamp01((t - tBook) / 0.8));
    book.visible = t > tBook - 0.05; book.scale.setScalar(Math.max(0.001, bk)); book.position.y = 1.19 + (1 - bk) * 0.08;
    pg.material.emissiveIntensity = 0.12 * bk; bookGlow.material.opacity = 0.18 * bk * (0.6 + 0.4 * Math.exp(-Math.max(0, t - tBook) * 1.2));

    // whisper ripples
    for (const R of RIP) R.visible = false;
    let pulse = 0;
    for (const [w0, w1] of RWIN) {
      if (t < w0 || t > w1 + RLIFE) continue;
      const nmax = Math.floor((t - w0) / RGAP);
      for (let n = nmax; n >= Math.max(0, nmax - 5); n--) {
        const e = w0 + n * RGAP; if (e > w1) continue;
        const age = t - e; if (age < 0 || age > RLIFE) continue;
        const u = age / RLIFE, R = RIP[n % 6];
        R.visible = true;
        R.position.lerpVectors(RP0, RP1, sm(u));
        R.lookAt(RP1.x, RP1.y + 0.4, RP1.z + 3);
        R.scale.setScalar(0.05 + 0.17 * Math.sin(Math.PI * Math.min(1, u * 1.1)) + 0.03 * u);
        R.material.opacity = 0.42 * Math.sin(Math.PI * u) * (n % 2 ? 0.8 : 1);
        if (u > 0.85) pulse = Math.max(pulse, (u - 0.85) / 0.15);
      }
    }
    LA.halo.material.opacity += 0.25 * pulse;

    // path of answered prayers (s4), stays as a faint glow afterwards
    for (const P of PATH) {
      const ti = tPath0 + P.k * (tPath1 - tPath0 - 0.6) / 8;
      const on = ramp(t, ti, ti + 0.3) * (1 - 0.75 * ramp(t, K.s5, K.s5 + 2));
      P.gl.material.opacity = on * (0.5 + 0.1 * Math.sin(t * 2 + P.k));
      P.gl.scale.setScalar(0.6 + 0.5 * ramp(t, ti, ti + 0.5));
    }

    // door + exterior
    const op = eout(clamp01((t - tDoor) / 1.3));
    doorP.forEach(({ pv, sgn }) => { pv.rotation.y = sgn * 1.85 * op; });
    const dawn = ramp(t, tDoor, A("s7:bertasbihlah")), dusk = ramp(t, A("s7:petang") - 0.4, A("s7:petang") + 0.8);
    SKY.top.value.set(0x2a3566).lerp(tmpC.set(0x445f9a), dawn).lerp(tmpC.set(0x3a2f6a), dusk);
    SKY.hor.value.set(0xc07a6a).lerp(tmpC.set(0xd88a68), dawn).lerp(tmpC.set(0xff7a52), dusk);
    SKY.sun.value.set(1, 0.03 + 0.07 * dawn - 0.06 * dusk, -0.15 + 0.3 * dusk).normalize();
    spill.material.opacity = 0.55 * op * (t < tCut ? 1 : 0); DL.intensity = 2.2 * op * (t < tCut ? 1 : 0);
    for (const B of birds) {
      const s = B.s, u = (t - tDoor) * (0.9 + 0.5 * s[0]) + s[1] * 30;
      B.G.visible = t > tDoor - 0.5 && t < tCut;
      B.G.position.set(18 + s[2] * 18, 4.5 + s[3] * 6 + Math.sin(u * 0.7) * 0.4, -14 + ((u * 2.2) % 34));
      B.G.rotation.y = -Math.PI / 2;
      const fl = Math.sin(t * (8 + s[0] * 4) + s[1] * 9) * 0.7;
      B.pl.rotation.x = fl; B.pr.rotation.x = -fl;
      B.G.scale.setScalar(1.4 + s[3]);
    }

    // motes in the beams (shared sun direction) and in the room
    for (let i = 0; i < NM; i++) {
      const s = mS[i], ap = APS[s[0]];
      apPoint(ap, 0.12 + s[1] * 0.76, 0.05 + s[2] * 0.85, pa);
      const len = (pa.y - 0.05) / -Ld.y, along = (s[3] * len + t * 0.05 * (s[4] - 0.3)) % len;
      pb.copy(pa).addScaledVector(Ld, Math.abs(along));
      pb.x += Math.sin(t * 0.3 + s[5] * 20) * 0.08; pb.y += Math.sin(t * 0.21 + s[4] * 17) * 0.06;
      beamM.pos[i * 3] = pb.x; beamM.pos[i * 3 + 1] = pb.y; beamM.pos[i * 3 + 2] = pb.z;
      const f = s[0] === 2 ? filled : 1;
      const tw = (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * (0.8 + s[5] * 2) + s[1] * 40), 2)) * sk * f;
      const col = MCOL[Math.floor(s[5] * 7)];
      beamM.col[i * 3] = col.r * tw * tint.r; beamM.col[i * 3 + 1] = col.g * tw * tint.g; beamM.col[i * 3 + 2] = col.b * tw * tint.b;
    }
    beamM.commit();
    const B = Math.max(0.8, Math.min(3, dist * 0.5));
    for (let i = 0; i < NR2; i++) {
      const s = rS[i];
      const wx = ((s[0] * B * 2 + t * 0.012 * (s[3] - 0.3) - look.x) % (B * 2) + B * 4) % (B * 2) - B;
      const wy = ((s[1] * B * 2 - t * 0.005 - look.y) % (B * 2) + B * 4) % (B * 2) - B;
      const wz = ((s[2] * B * 2 + t * 0.008 - look.z) % (B * 2) + B * 4) % (B * 2) - B;
      roomM.pos[i * 3] = look.x + wx; roomM.pos[i * 3 + 1] = Math.max(0.05, look.y + wy); roomM.pos[i * 3 + 2] = look.z + wz;
      const tw = 0.3 + 0.3 * Math.sin(t * (1 + s[3] * 2) + s[0] * 30);
      roomM.col[i * 3] = tw; roomM.col[i * 3 + 1] = tw * 0.85; roomM.col[i * 3 + 2] = tw * 0.65;
    }
    roomM.commit(); roomM.m.size = 0.006 + B * 0.006;

    bp.strength = (1 - 0.45 * near) * bloomK(t) * (1 - 0.4 * ramp(t, tDoor, tDoor + 1) * (t < tCut ? 1 : 0)); bp.threshold = 0.8;
    comp.render();
  };
}
