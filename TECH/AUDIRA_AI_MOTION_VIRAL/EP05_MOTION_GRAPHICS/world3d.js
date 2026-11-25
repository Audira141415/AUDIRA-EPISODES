// LAYER STACK: the film opens as what looks like one flat slide. Four transparent sheets split apart in depth when the narration says "kode", then the film uses that space. It flattens back into the slide at the end.
// Swiss palette: paper, ink, one red. Tone mapping is off so sheet colours stay exact.
import * as THREE from "./three.module.js";
import { stage, canvasTex, track, ramp, smooth, mulberry, clamp01, back } from "./lib3d.js";

const FW = 9, FH = 16;
const INK = "#111111", RED = "#E6331F", PAPER = "#F1EFE8";
const AB = '"Archivo Black"', MONO = '"IBM Plex Mono"';

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xF1EFE8, fog: 0, exp: 1, bloom: [0, 0, 1], fov: 38, shadow: false });
  r.toneMapping = THREE.NoToneMapping; bp.enabled = false; scene.fog = null;
  const rnd = mulberry(505);
  const tex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { c, draw }; return t; };
  const paint = (t, ...a) => { const { c, draw } = t.userData; const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height); draw(x, c.width, c.height, ...a); t.needsUpdate = true; };
  const sheet = (t, w, h, z = 0) => { const G = new THREE.Group(); const sh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0, depthWrite: false })); sh.position.set(.09, -.12, -.02); G.add(sh); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide })); G.add(m); G.position.z = z; G.sh = sh; G.m = m; scene.add(G); return G; };
  // Sheets that together read as a generic presentation slide.
  const tBg = tex(720, 1280, (x, w, h) => { x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(17,17,17,.1)"; x.lineWidth = 1; for (let i = 0; i <= 12; i++) { x.beginPath(); x.moveTo(i * w / 12, 0); x.lineTo(i * w / 12, h); x.stroke(); } for (let i = 0; i <= 21; i++) { x.beginPath(); x.moveTo(0, i * h / 21.33); x.lineTo(w, i * h / 21.33); x.stroke(); } });
  const tCirc = tex(720, 1280, (x, w, h) => { x.fillStyle = RED; x.beginPath(); x.arc(w * .62, h * .58, w * .36, 0, 7); x.fill(); });
  const tType = tex(720, 1280, (x, w, h) => { x.fillStyle = INK; x.font = `72px ${AB}`; x.textBaseline = "top"; x.fillText("Judul", 60, h * .44); x.fillText("Slide", 60, h * .44 + 78); x.font = `500 26px ${MONO}`; ["- poin pertama", "- poin kedua", "- poin ketiga"].forEach((s, i) => x.fillText(s, 60, h * .6 + i * 40)); });
  const tHud = tex(720, 1280, (x, w, h) => { x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(36, h * .405, w - 72, h * .34); x.fillStyle = INK; x.font = `500 18px ${MONO}`; x.fillText("HALAMAN 1 / 1", 44, h * .74); });
  const L = [sheet(tBg, FW, FH), sheet(tCirc, FW, FH), sheet(tType, FW, FH), sheet(tHud, FW, FH)];
  // Layer name tags that only exist once the sheets are apart.
  const TN = ["LATAR", "BENTUK", "TEKS", "HUD"];
  const tags = TN.map((n) => { const t = tex(280, 70, (x, w, h) => { x.fillStyle = INK; x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; x.font = `40px ${AB}`; x.textBaseline = "middle"; x.fillText(n, 14, h / 2 + 2); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .4), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide })); scene.add(m); m.t = t; return m; });
  // Editor sheet: the arahan and the code type themselves.
  const PROMPT = ["> durasi 90 detik, 1080x1920", "> saat kata 'kode': lapisan pisah 0,6 s", "> kertas #F1EFE8, merah #E6331F"];
  const CODE = ['const tl = gsap.timeline({ paused: true });', 'tl.to(sheet.position, {', '  z: 2.4, duration: .6,', '  ease: "power3.out",', '}, AT["s1:kode"]);', 'window.__timelines["world"] = tl;'];
  let last = -1;
  const tEd = tex(900, 760, (x, w, h, n) => {
    x.fillStyle = "#111111"; x.fillRect(0, 0, w, h);
    x.fillStyle = RED; x.fillRect(0, 0, w, 10);
    x.font = `500 32px ${MONO}`; x.textBaseline = "top";
    let left = n, y = 36;
    x.fillStyle = "#FFC9BF";
    for (const l of PROMPT) { const s = l.slice(0, Math.max(0, left)); x.fillText(s, 32, y); left -= l.length; y += 52; if (left <= 0) break; }
    y = Math.max(y, 36 + 3 * 52 + 26);
    x.fillStyle = "#F4F2EC";
    if (left > 0) for (const l of CODE) { const s = l.slice(0, Math.max(0, left)); x.fillText(s, 32, y); left -= l.length; y += 52; if (left <= 0) break; }
  });
  const ED = sheet(tEd, 7.6, 6.42); ED.sh.material.opacity = 0; ED.visible = false; const TOTAL = [...PROMPT, ...CODE].join("").length;
  // Render sheet: a tag becomes frames. Two runs land as identical stacks, which is the determinism claim shown.
  const tHtml = tex(900, 420, (x, w, h) => { x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.fillStyle = INK; x.font = `500 31px ${MONO}`; x.textBaseline = "top"; ['<div class="clip"', '     data-start="2.4"', '     data-duration="3">', '</div>'].forEach((s, i) => { x.fillStyle = i === 1 || i === 2 ? RED : INK; x.fillText(s, 28, 30 + i * 52); }); });
  const HT = sheet(tHtml, 6.6, 3.08); HT.visible = false;
  const tFrame = tex(180, 320, (x, w, h) => { x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = RED; x.beginPath(); x.arc(w * .6, h * .55, w * .3, 0, 7); x.fill(); x.fillStyle = INK; x.fillRect(16, h * .4, w * .5, 18); x.fillRect(16, h * .47, w * .4, 18); x.strokeStyle = INK; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); });
  const frames = []; for (let i = 0; i < 44; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.78), new THREE.MeshBasicMaterial({ map: tFrame, transparent: true, depthWrite: false, side: THREE.DoubleSide })); scene.add(m); frames.push(m); }
  // Voice sheet: real word-length blocks from the voice timeline, with connector lines down to the sheets.
  const tTrack = tex(1000, 300, (x, w, h, u) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.fillStyle = INK; x.font = `26px ${AB}`; x.textBaseline = "top"; x.fillText("SUARA = JAM", 24, 18);
    const bars = 96;
    for (let i = 0; i < bars; i++) { const a = Math.abs(Math.sin(i * 1.7) * Math.sin(i * .37 + 1)) * 110 + 8; const on = i / bars < u; x.fillStyle = on ? RED : "#BBB"; x.fillRect(24 + i * 9.8, 180 - a / 2, 7, a); }
    x.fillStyle = INK; x.fillRect(24 + u * 950, 56, 5, 234);
  });
  const TR = sheet(tTrack, 8, 2.4); TR.visible = false;
  const conn = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6 * 7), 3)), new THREE.LineBasicMaterial({ color: 0xE6331F, transparent: true, opacity: 0 })); conn.frustumCulled = false; scene.add(conn);
  const tNum = tex(420, 240, (x, w, h) => { x.fillStyle = RED; x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; x.font = `148px ${AB}`; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText("100%", w / 2, h / 2 + 6); });
  const NUM = sheet(tNum, 3.6, 2.05); NUM.visible = false;

  [tBg, tCirc, tType, tHud, ...tags.map((m) => m.t), tHtml, tFrame, tNum].forEach((t) => paint(t));
  paint(tEd, 0); paint(tTrack, 0);
  let fontsOk = false;
  try { document.fonts.load(`40px ${AB}`); document.fonts.load(`500 30px ${MONO}`); } catch (e) {}

  const ko = AT["s1:kode"], ka = AT["s2:Kamera"], lp = AT["s2:Lapisan"], kt = AT["s2:kata"], cl = AT["s3:Claude"], ar = AT["s3:Tugasmu"], hf = AT["s4:HyperFrames"], gs = AT["s4:GSAP"], rd = AT["s4:render"], rm = AT["s5:Remotion"], sd = AT["s6:suara"], ang = AT["s6:Angka"], gt = AT["s6:Ganti"], pk = AT["s7:periksa"], sl = AT["s7:Slide"];
  const spreadAt = (t) => { let s = ramp(t, ko, ko + .6) * .55 + ramp(t, lp, lp + .8) * .45; s *= 1 - .25 * ramp(t, K.s3, K.s3 + 1) ; s *= 1 - ramp(t, sl - .2, sl + 1.2); return s; };
  const camTr = track([
    [0, 0, 0, 23.15, 0, 0, 0], [ko, 0, 0, 23.15, 0, 0, 0], [ko + 1.2, 6, 1.2, 23, 0, -.8, 2],
    [ka, 8, 2.2, 22, 0, -.8, 2], [lp, 12, 3, 19, 0, -.8, 3], [kt + .4, 15, 4, 15.5, 0, -1, 3], [K.s2e, 16, 4, 12, 0, -1, 3],
    [K.s3 + 1, 3, 1.2, 25, 0, -1.2, 8], [K.s3e, -1.4, .6, 25, 0, -1.2, 8],
    [K.s4 + 1, -2, 1.4, 25, 0, -1, 7], [gs, 2, .4, 25, 0, -1, 7], [K.s4e, 4.2, -.6, 24, 0, -1.2, 7],
    [K.s5 + 1, -12, 3, 18, 0, -1.2, 3], [K.s5e, -15, 3.5, 14, 0, -1.2, 3],
    [K.s6 + 1, 2.4, .8, 22, 0, -1, 6], [K.s6e, -1.6, 1, 21, 0, -1, 6],
    [K.s7 + 1, 7, 2, 22, 0, -.6, 2], [sl - .2, 5, 1.2, 23, 0, -.4, 1], [sl + 1.2, 0, 0, 23.15, 0, 0, 0], [K.dur, 0, 0, 23.15, 0, 0, 0],
  ]);
  const lastU = { track: -1 };
  return (t) => {
    if (!fontsOk && document.fonts.check(`40px ${AB}`) && document.fonts.check(`500 30px ${MONO}`)) { fontsOk = true; [tType, ...tags.map((m) => m.t), tHtml, tFrame, tNum, tHud].forEach((x) => paint(x)); last = -1; lastU.track = -1; }
    const s = spreadAt(t);
    L.forEach((g, i) => { g.position.z = i * 2.5 * s; g.sh.material.opacity = i ? .1 * s : 0; });
    const dim = 1 - .7 * ramp(t, K.s3, K.s3 + .8) * (1 - ramp(t, K.s5, K.s5 + .8)) - .75 * ramp(t, K.s6, K.s6 + .8) * (1 - ramp(t, K.s7, K.s7 + .8));
    L.forEach((g) => (g.m.material.opacity = dim));
    tags.forEach((m, i) => { const a = ramp(t, lp + .15 * i, lp + .4 + .15 * i) * (1 - ramp(t, K.s3, K.s3 + .4)); m.visible = a > .01; m.material.opacity = a; m.position.set(-1.4, 4.6 - i * 1.0, i * 2.5 * s + .02); });
    // Editor slides in from below at s3.
    const eIn = ramp(t, cl - .2, cl + .5) * (1 - ramp(t, K.s4 - .15, K.s4 + .25));
    ED.visible = eIn > .01; ED.scale.setScalar(.8); ED.position.set(0, -.8 - (1 - eIn) * 12, 8.6); ED.rotation.y = .08 * Math.sin(t * .5); ED.rotation.x = -.04;
    const n = Math.floor(TOTAL * clamp01((t - ar) / Math.max(1, K.s3e - ar - .6)));
    if (n !== last && ED.visible) { paint(tEd, n); last = n; }
    // HTML tag and frames at s4
    const hIn = ramp(t, hf - .2, hf + .4) * (1 - ramp(t, K.s5 - .2, K.s5 + .2));
    HT.visible = hIn > .01; HT.scale.setScalar(.8); HT.position.set(0, .2 + (1 - hIn) * 10, 8); HT.rotation.x = .05;
    const fl = ramp(t, hf + .8, hf + 3.6), split = ramp(t, rd - .2, rd + .8);
    frames.forEach((m, i) => {
      const side = i % 2, idx = (i - side) / 2;
      const u = clamp01(fl * 1.6 - idx * .025);
      const op = hIn * Math.min(1, u * 4);
      m.visible = op > .01; m.material.opacity = op;
      // single stack until the word render, then the same frames form two identical rows
      const yB = -2.2;
      const xE = -3.1 + idx * .29;
      m.scale.setScalar(.62); const rowY = split * (side ? .7 : -.7);
      m.position.set(lerpN(0, xE, smooth(u)), lerpN(.2, yB + rowY, smooth(u)), 8.3 + idx * .012);
      m.rotation.y = (1 - smooth(u)) * 1.2 + .22;
    });
    // Voice track at s6
    const tIn = ramp(t, K.s6 - .1, K.s6 + .5) * (1 - ramp(t, K.s7 - .15, K.s7 + .2));
    TR.visible = tIn > .01; TR.scale.setScalar(.7); TR.position.set(0, -1.2 - (1 - tIn) * 9, 7);
    const pu = Math.round(clamp01((t - K.s6) / (K.s6e - K.s6)) * 240) / 240;
    if (pu !== lastU.track && TR.visible) { paint(tTrack, pu); lastU.track = pu; }
    const ca = conn.geometry.attributes.position.array;
    for (let i = 0; i < 7; i++) { const x = -3.6 + i * 1.2, tgt = i % 4; ca.set([x, -2.2, 7, x * .7, -4.6, tgt * 2.5 * s], i * 6); }
    conn.geometry.attributes.position.needsUpdate = true; conn.material.opacity = ramp(t, sd, sd + .5) * .85 * (1 - ramp(t, K.s7 - .2, K.s7 + .1));
    const nA = back(clamp01((t - ang) / .22), 2.2) * (1 - ramp(t, gt - .15, gt + .05));
    NUM.visible = nA > .01; NUM.position.set(.5, 1.05, 8.2); NUM.scale.setScalar(Math.max(.01, nA) * .7);
    const c = camTr(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
const lerpN = (a, b, u) => a + (b - a) * u;
