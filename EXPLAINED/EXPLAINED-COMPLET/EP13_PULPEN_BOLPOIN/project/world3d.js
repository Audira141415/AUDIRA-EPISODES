// EP13 PULPEN (MANUSCRIPT): a candlelit scriptorium. Two beeswax candles are the key light, parchment with fibres,
// walnut desk, lapis lacquer and brass. The giant ballpoint is a cutaway (front half of barrel and socket fade away)
// so the ball, its socket grooves and the ink tube are visible while the tip writes a cursive line on the parchment.
//   DESK  x=0    parchment on walnut; the giant pen writes (s1, s4b, s5, s6, s8), ink drops ride down the tube,
//                gravity + capillary arrows, an ink film coats the back of the ball, grooves glow in the socket
//   CODEX x=-16  a slanted lectern with an open codex: painted miniatures (generic figures, no likeness) for Loud 1888,
//                the journalist with a newspaper, the two brothers 1938; a crate plank with a coarse scribble and an
//                early marker; newspaper stack and a dip nib choked by thick ink; a wax seal 1938
//   NIGHT x=16   deep lapis night with stars: an ordinary pen held upside down (ink slides away, broken stroke),
//                a pressurised cartridge pen (gas chamber, seal) that writes upside down, then inside a water tank
// Pseudo-script only on pages (no readable copy except years and the AUDIRA brand). Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const P = {
  room: "#0E0906", walnut: "#3A2416", walnutL: "#5a3a24", parch: "#E8D5AC", parchE: "#C9A96E", ink: "#1d2a5c", inkD: "#121a3c", iron: "#2A1A10",
  rubric: "#B0301E", lapis: "#24418C", lapisD: "#172b5e", verd: "#3E7F6A", gold: "#E6B94C", goldD: "#A97A22", wax: "#EFE3C6", flame: "#FFD28A",
  amber: "#FFAD55", steel: "#D8DCE2", brass: "#C9A04A", skin: "#E9C09A", water: "#5aa0c8",
};
const SERIF = "Georgia, 'Times New Roman', serif", SANS = "'Arial Black', Arial, sans-serif";
const DX = 0, CX = -16, NX = 16;

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(0.299,0.587,0.114));
  c+=vec3(0.03,0.018,0.006)*(1.0-l);c=mix(c,c*vec3(1.06,1.0,0.88),0.55);c=mix(vec3(l),c,1.08);c=(c-0.5)*1.07+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- textures ----------
function parchTex(seed, rep, lines = false) {
  const R = mulberry(seed);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = P.parch; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h, r = 20 + R() * 80, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(160,120,60,${0.05 + R() * 0.06})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.lineCap = "round"; for (let i = 0; i < 900; i++) { const x = R() * w, y = R() * h, l = 3 + R() * 14; g.strokeStyle = `rgba(${R() < 0.5 ? "255,250,235" : "120,90,50"},${0.12 + R() * 0.15})`; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (R() - 0.5) * 4); g.stroke(); }
    if (lines) { g.strokeStyle = "rgba(42,26,16,.75)"; g.lineWidth = 3; for (let j = 0; j < 16; j++) { let x = 50; const y = 70 + j * 26; while (x < w - 50) { const k = R(); g.beginPath(); if (k < 0.6) { g.moveTo(x, y); g.lineTo(x + 2, y - 10); } else if (k < 0.8) { g.moveTo(x, y - 18); g.lineTo(x + 2, y); } else { g.moveTo(x - 3, y - 5); g.lineTo(x, y - 9); g.lineTo(x + 3, y - 5); g.lineTo(x, y - 1); g.closePath(); } g.stroke(); x += 7 + (R() < 0.15 ? 12 : 0); } } }
  }, rep);
}
function woodTex(rep, base = P.walnut) {
  const R = mulberry(4);
  return canvasTex(512, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { const y = R() * h; g.strokeStyle = `rgba(${R() < 0.5 ? "20,10,4" : "120,80,50"},${0.15 + R() * 0.2})`; g.lineWidth = 1 + R() * 3; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + 6 * Math.sin(x * 0.02 + i)); g.stroke(); } }, rep);
}
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
// illuminated miniature: gold-leaf ground, lapis/vermilion frame, generic painted figure(s) with a prop
function miniature(kind) {
  return canvasTex(512, 700, (g, w, h) => {
    g.fillStyle = P.parch; g.fillRect(0, 0, w, h);
    g.fillStyle = P.lapis; g.fillRect(24, 24, w - 48, h - 48); g.fillStyle = P.rubric; g.fillRect(40, 40, w - 80, h - 80);
    const gr = g.createLinearGradient(0, 56, w, h); gr.addColorStop(0, "#f2cf6a"); gr.addColorStop(0.5, "#c99a34"); gr.addColorStop(1, "#f0c95c"); g.fillStyle = gr; g.fillRect(56, 56, w - 112, h - 112);
    g.strokeStyle = "rgba(120,80,20,.35)"; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(w / 2, 260, 40 + i * 18, 0, 7); g.stroke(); }
    g.fillStyle = "#6b4a2a"; g.fillRect(56, h - 170, w - 112, 114);
    const fig = (cx, robe, hat, prop) => {
      // legs + shoes, robe (shoulders wider than waist), neck, head, bent arms
      g.fillStyle = "#2a1a10"; g.fillRect(cx - 34, h - 220, 26, 120); g.fillRect(cx + 8, h - 220, 26, 120); g.fillRect(cx - 44, h - 106, 40, 16); g.fillRect(cx + 4, h - 106, 40, 16);
      g.fillStyle = robe; g.beginPath(); g.moveTo(cx - 80, 330); g.lineTo(cx + 80, 330); g.lineTo(cx + 54, h - 210); g.lineTo(cx - 54, h - 210); g.closePath(); g.fill();
      g.strokeStyle = P.gold; g.lineWidth = 4; g.stroke();
      g.fillStyle = P.skin; g.fillRect(cx - 13, 296, 26, 40); g.beginPath(); g.ellipse(cx, 262, 40, 46, 0, 0, 7); g.fill();
      g.fillStyle = "#3a2414"; g.beginPath(); g.ellipse(cx, 238, 42, 26, 0, Math.PI, 0); g.fill();
      if (hat) { g.fillRect(cx - 52, 222, 104, 10); g.beginPath(); g.ellipse(cx, 222, 36, 30, 0, Math.PI, 0); g.fill(); }
      g.fillStyle = "#2a1a10"; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 14, 262, 4, 0, 7); g.fill(); }
      g.strokeStyle = robe; g.lineWidth = 26; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 70, 345); g.lineTo(cx - 92, 420); g.lineTo(cx - 52, 470); g.stroke(); g.beginPath(); g.moveTo(cx + 70, 345); g.lineTo(cx + 104, 405); g.lineTo(cx + 132, 360); g.stroke();
      g.fillStyle = P.skin; g.beginPath(); g.arc(cx - 50, 472, 13, 0, 7); g.arc(cx + 134, 356, 13, 0, 7); g.fill();
      prop(cx);
    };
    if (kind === "loud") fig(w / 2 - 20, "#3e5f3a", true, (cx) => { g.fillStyle = "#9a6a3a"; g.fillRect(cx + 70, 470, 120, 80); g.strokeStyle = "#2a1a10"; g.lineWidth = 9; g.beginPath(); g.moveTo(cx + 80, 520); g.bezierCurveTo(cx + 110, 480, cx + 140, 545, cx + 180, 500); g.stroke(); g.fillStyle = P.steel; g.fillRect(cx + 130, 330, 14, 50); });
    if (kind === "pers") fig(w / 2 - 30, "#5a3346", false, (cx) => { g.save(); g.translate(cx + 120, 400); g.rotate(-0.25); g.fillStyle = "#efe8d6"; g.fillRect(-60, -40, 120, 150); g.fillStyle = "#333"; g.fillRect(-50, -30, 100, 14); for (let i = 0; i < 9; i++) { g.fillRect(-50, -6 + i * 12, 44, 5); g.fillRect(6, -6 + i * 12, 44, 5); } g.restore(); });
    if (kind === "bros") { fig(w / 2 - 92, "#24418C", false, () => {}); fig(w / 2 + 92, "#3E7F6A", false, (cx) => { g.fillStyle = P.wax; g.fillRect(cx - 190, 440, 120, 90); g.fillStyle = P.rubric; g.beginPath(); g.arc(cx - 130, 510, 18, 0, 7); g.fill(); }); }
  });
}
function plane(tex, w, h, parent, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0, depthWrite: false, emissive: o.emi ? new THREE.Color(o.emi) : new THREE.Color(0), emissiveMap: o.emi ? tex : null, emissiveIntensity: o.ei || 0, side: o.ds ? THREE.DoubleSide : THREE.FrontSide }));
  m.position.set(x, y, z); m.renderOrder = 2; if (parent) parent.add(m); return m;
}
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const metal = (c, r = 0.25) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), metalness: 1, roughness: r });
const inkMat = () => new THREE.MeshPhysicalMaterial({ color: P.ink, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1 });
const ARROW = new THREE.ConeGeometry(0.06, 0.18, 12);

// ---------- the giant cutaway ballpoint: tip at origin, axis +y ----------
function makePen(parent, { barrel = P.lapis, gas = false } = {}) {
  const G = new THREE.Group(); parent.add(G);
  const fade = [];
  const halfCyl = (rt, rb, h, y, mat, front) => { const m = mesh(new THREE.CylinderGeometry(rt, rb, h, 40, 1, true, front ? -Math.PI / 2 : Math.PI / 2, Math.PI), mat, G, 0, y, 0); return m; };
  const shell = (rt, rb, h, y, color, metalness, rough) => {
    const back = new THREE.MeshStandardMaterial({ color, metalness, roughness: rough, side: THREE.DoubleSide });
    const front = new THREE.MeshStandardMaterial({ color, metalness, roughness: rough, side: THREE.DoubleSide, transparent: true, opacity: 1 });
    halfCyl(rt, rb, h, y, back, false); halfCyl(rt, rb, h, y, front, true); fade.push(front);
  };
  shell(0.42, 0.2, 1.4, 0.95, P.brass, 1, 0.3);              // socket cone
  shell(0.5, 0.5, 7.4, 5.35, barrel, 0.1, 0.35);              // barrel
  mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.18, 40), metal(P.gold, 0.25), G, 0, 1.75, 0);
  mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.14, 40), metal(P.gold, 0.25), G, 0, 8.6, 0);
  mesh(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: barrel, roughness: 0.35 }), G, 0, 9.05, 0);
  // ball: steel with ink smears so the spin reads
  const bt = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#cfd4da"; g.fillRect(0, 0, w, h); const R = mulberry(8); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(29,42,92,${0.35 + R() * 0.5})`; g.beginPath(); g.ellipse(R() * w, R() * h, 6 + R() * 18, 3 + R() * 8, R() * 3, 0, 7); g.fill(); } });
  const ballSpin = new THREE.Group(); ballSpin.position.y = 0.17; G.add(ballSpin);
  const ball = mesh(new THREE.SphereGeometry(0.18, 40, 28), new THREE.MeshStandardMaterial({ map: bt, metalness: 0.95, roughness: 0.16 }), ballSpin);
  // ink film over the back (upper) half of the ball, fixed in the pen frame
  const film = mesh(new THREE.SphereGeometry(0.188, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshPhysicalMaterial({ color: P.ink, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 }), G, 0, 0.17, 0);
  // socket lip and grooves (channels that keep ink on the ball)
  mesh(new THREE.TorusGeometry(0.17, 0.025, 10, 40).rotateX(Math.PI / 2), metal(P.brass, 0.3), G, 0, 0.27, 0);
  const groove = new THREE.MeshStandardMaterial({ color: P.inkD, emissive: new THREE.Color(P.gold), emissiveIntensity: 0 });
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2, m = mesh(new THREE.BoxGeometry(0.035, 0.22, 0.035), groove, G, Math.cos(a) * 0.12, 0.42, Math.sin(a) * 0.12); m.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
  // feed channel + clear ink tube with an ink column (scaled along y)
  const feed = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 16), inkMat(), G, 0, 0.95, 0);
  mesh(new THREE.CylinderGeometry(0.19, 0.19, 6.0, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), G, 0, 4.6, 0);
  const colG = new THREE.CylinderGeometry(0.16, 0.16, 1, 32); colG.translate(0, 0.5, 0);
  const col = mesh(colG, inkMat(), G, 0, 1.6, 0);
  let gasC = null, seal = null, piston = null;
  if (gas) {
    gasC = mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.6, 32), new THREE.MeshStandardMaterial({ color: "#cfe7f5", transparent: true, opacity: 0.35, emissive: new THREE.Color("#7fc0e6"), emissiveIntensity: 0.2 }), G, 0, 6.9, 0);
    piston = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 32), metal(P.steel, 0.25), G, 0, 6.05, 0);
    seal = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.16, 32), new THREE.MeshStandardMaterial({ color: P.rubric, roughness: 0.4, emissive: new THREE.Color(P.rubric), emissiveIntensity: 0 }), G, 0, 7.75, 0);
  }
  // ink drops travelling down the tube + arrows
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), inkMat(), 14); drops.frustumCulled = false; G.add(drops);
  const am = new THREE.MeshStandardMaterial({ color: P.gold, emissive: new THREE.Color(P.gold), emissiveIntensity: 0.9 });
  const gArrow = mesh(ARROW, am, G, 0.36, 2.6, 0.2); gArrow.rotation.z = Math.PI; gArrow.scale.setScalar(2);
  const cArrows = [0, 1, 2].map((i) => { const m = mesh(ARROW, am, G, -0.12, 0.55 + i * 0.32, 0.1); m.rotation.z = Math.PI; return m; });
  return { G, fade, ballSpin, film, groove, col, drops, gArrow, cArrows, gasC, seal, piston, feed };
}

// cursive path on the page (prolate cycloid loops, three lines, pen lifts between lines)
function cursive(lines, x0, x1, z0, dz, loops) {
  const pts = [];
  for (let L = 0; L < lines; L++) {
    const M = 260, c = (x1 - x0) / (Math.PI * 2 * loops);
    for (let i = 0; i <= M; i++) { const ph = (i / M) * Math.PI * 2 * loops; pts.push({ x: x0 + c * ph - 0.11 * Math.sin(ph), z: z0 + L * dz - 0.16 * Math.cos(ph) + 0.16, ink: i > 0 }); }
  }
  return pts;
}
function strokeMesh(parent, pts, width, y, mat) {
  const n = pts.length, pos = new Float32Array(n * 6), idx = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
    const w = pts[i].ink ? width / 2 : 0, nx = (-dz / l) * w, nz = (dx / l) * w;
    pos.set([pts[i].x + nx, y, pts[i].z + nz, pts[i].x - nx, y, pts[i].z - nz], i * 6);
    if (i < n - 1) { const k = 2 * i; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.frustumCulled = false; parent.add(m);
  return (u) => geo.setDrawRange(0, Math.max(0, Math.floor(clamp01(u) * (n - 1))) * 6);
}

function candle(parent, x, z, h) {
  const G = new THREE.Group(); G.position.set(x, 0, z); parent.add(G);
  mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.16, 28), metal(P.brass, 0.35), G, 0, 0.08, 0);
  mesh(new THREE.CylinderGeometry(0.2, 0.22, h, 24), new THREE.MeshStandardMaterial({ color: P.wax, roughness: 0.6, emissive: new THREE.Color(P.amber), emissiveIntensity: 0.06 }), G, 0, 0.16 + h / 2, 0);
  const fl = mesh(new THREE.SphereGeometry(0.07, 14, 10).scale(1, 2.2, 1), new THREE.MeshBasicMaterial({ color: P.flame }), G, 0, 0.3 + h, 0); fl.castShadow = false;
  const L = new THREE.PointLight(0xffad55, 9, 18, 1.6); L.position.set(0, 0.45 + h, 0); G.add(L);
  return { G, fl, L };
}
const noise = (t, s) => 0.5 * Math.sin(t * 7.3 + s) + 0.3 * Math.sin(t * 13.1 + s * 2) + 0.2 * Math.sin(t * 23.7 + s * 3);

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x0e0906, fog: 0.018, exp: 0.9, bloom: [0.12, 0.45, 0.92] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.92;
  comp.insertPass(new ShaderPass(NanGuard), 1); comp.addPass(new ShaderPass(Grade));
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x24180f);
    for (const [w, h, c, i, x, y, z] of [[3, 3, 0xffc27a, 2.4, -3, 3, 2], [3, 2, 0xffe2b0, 1.4, 3, 2, 2], [8, 2, 0x5a3a24, 0.6, 0, -3, 0], [4, 4, 0x8aa0d0, 0.4, 0, 2, -4]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.5;
  scene.add(cam);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  scene.add(new THREE.HemisphereLight(0xffe6c4, 0x1a0f08, 0.45));
  const key = new THREE.DirectionalLight(0xffd7a0, 1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 0.7); scene.add(rim, rim.target);

  // ============ DESK ============
  const DE = new THREE.Group(); DE.position.x = DX; scene.add(DE);
  const deskM = new THREE.MeshStandardMaterial({ map: woodTex([3, 3]), roughness: 0.55 });
  mesh(new THREE.BoxGeometry(22, 0.4, 14), deskM, DE, 0, -0.2, -1);
  mesh(new THREE.BoxGeometry(7.2, 0.02, 9.2), new THREE.MeshStandardMaterial({ map: parchTex(3, [1, 1]), roughness: 0.9 }), DE, 0, 0.01, -0.6);
  plane(canvasTex(1024, 220, (g, w, h) => { g.clearRect(0, 0, w, h); txt(g, "AUDIRA", w / 2, 110, `900 150px ${SERIF}`, P.goldD); g.strokeStyle = P.iron; g.lineWidth = 3; g.strokeText("AUDIRA", w / 2, 110); }), 3.6, 0.78, DE, 0, 0.03, -4.25, { metal: 0.6, rough: 0.3 }).rotation.x = -Math.PI / 2;
  const sealD = mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.1, 30), new THREE.MeshStandardMaterial({ color: P.rubric, roughness: 0.35 }), DE, 2.9, 0.07, 3.0);
  plane(canvasTex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#ffd9c4"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke(); txt(g, "AUDIRA", 128, 128, `900 50px ${SERIF}`, "#ffe4d4"); }), 0.74, 0.74, DE, 2.9, 0.13, 3.0).rotation.x = -Math.PI / 2;
  const C1 = candle(DE, -4.2, -4.2, 2.2), C2 = candle(DE, 4.6, -5.0, 1.5);
  mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.9, 28), new THREE.MeshPhysicalMaterial({ color: P.lapisD, roughness: 0.15, clearcoat: 1 }), DE, -4.4, 0.45, 1.6);
  mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 28), inkMat(), DE, -4.4, 0.91, 1.6);
  const books = mulberry(12); for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(2.6, 0.45, 1.9), new THREE.MeshStandardMaterial({ color: [P.rubric, P.lapisD, P.verd][i], roughness: 0.6 }), DE, 5.8, 0.22 + i * 0.46, 1.2).rotation.y = (books() - 0.5) * 0.3;
  const path = cursive(3, -2.6, 2.6, -2.3, 1.15, 13);
  const stroke = strokeMesh(DE, path, 0.07, 0.025, inkMat());
  const pen = makePen(DE);
  pen.G.rotation.set(-0.42, 0, -0.5);
  const tipAt = (u) => { const n = path.length - 1, f = clamp01(u) * n, i = Math.floor(f), a = path[Math.min(i, n)], b = path[Math.min(i + 1, n)], k = f - i; return [a.x + (b.x - a.x) * k, a.z + (b.z - a.z) * k, b.ink ? 0 : 0.25]; };

  // ============ CODEX ============
  const CO = new THREE.Group(); CO.position.x = CX; scene.add(CO);
  mesh(new THREE.BoxGeometry(22, 0.4, 14), deskM, CO, 0, -0.2, -1);
  const LE = new THREE.Group(); LE.position.set(0, 0, -2.2); LE.rotation.x = -0.55; CO.add(LE);
  mesh(new THREE.BoxGeometry(6.6, 4.4, 0.3), new THREE.MeshStandardMaterial({ map: woodTex([1, 1], P.walnutL), roughness: 0.5 }), LE, 0, 2.4, -0.2);
  const pageM = new THREE.MeshStandardMaterial({ map: parchTex(9, [1, 1], true), roughness: 0.9 });
  for (const s of [-1, 1]) { const pg = mesh(new THREE.BoxGeometry(3.0, 4.0, 0.12), pageM, LE, s * 1.55, 2.4, 0.0); pg.rotation.y = -s * 0.08; }
  const minis = ["loud", "pers", "bros"].map((k) => plane(miniature(k), 2.1, 2.9, LE, -1.55, 2.55, 0.12, { rough: 0.6 }));
  const years = ["1888", "1938"].map((y) => plane(canvasTex(512, 220, (g, w, h) => { g.clearRect(0, 0, w, h); txt(g, y, w / 2, 110, `900 170px ${SERIF}`, P.gold); g.strokeStyle = P.iron; g.lineWidth = 4; g.strokeText(y, w / 2, 110); }), 2.2, 0.95, LE, 1.55, 3.55, 0.14, { metal: 0.7, rough: 0.3, emi: P.goldD, ei: 0.15 }));
  // crate plank + coarse scribble + early marker (s2)
  const PL = new THREE.Group(); PL.position.set(1.0, 0.0, 2.0); CO.add(PL);
  mesh(new THREE.BoxGeometry(4.6, 0.35, 1.6), new THREE.MeshStandardMaterial({ map: woodTex([1, 1], "#8a6238"), roughness: 0.8 }), PL, 0, 0.18, 0);
  const sp = []; { const R = mulberry(21); for (let i = 0; i <= 120; i++) { const u = i / 120; sp.push({ x: -1.9 + 3.8 * u, z: 0.25 * Math.sin(u * 14) + (R() - 0.5) * 0.08, ink: i > 0 }); } }
  const scribble = strokeMesh(PL, sp, 0.16, 0.37, new THREE.MeshStandardMaterial({ color: P.iron, roughness: 0.95 }));
  const MK = new THREE.Group(); PL.add(MK);
  mesh(new THREE.CylinderGeometry(0.16, 0.12, 2.4, 20), metal("#7a7068", 0.45), MK, 0, 1.45, 0); mesh(new THREE.SphereGeometry(0.16, 20, 14), metal(P.steel, 0.4), MK, 0, 0.2, 0);
  MK.rotation.z = -0.35;
  // newspaper stack + dip nib choked by a thick ink blob (s3)
  const NP = new THREE.Group(); NP.position.set(-2.8, 0, 2.2); CO.add(NP);
  const newsT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#ece4cf"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.fillRect(30, 30, w - 60, 54); g.fillStyle = "#ece4cf"; g.fillRect(40, 44, 200, 26); const R = mulberry(5); for (let c = 0; c < 4; c++) for (let j = 0; j < 30; j++) { g.fillStyle = `rgba(30,30,30,${0.5 + R() * 0.3})`; g.fillRect(36 + c * 112, 110 + j * 12.5, 70 + R() * 30, 6); } });
  for (let i = 0; i < 4; i++) { const m = mesh(new THREE.BoxGeometry(2.6, 0.04, 3.2), new THREE.MeshStandardMaterial({ map: newsT, roughness: 0.95 }), NP, (i % 2) * 0.08, 0.03 + i * 0.045, 0); m.rotation.y = 0.12 * (i - 1.5); }
  const NB = new THREE.Group(); NB.position.set(0.6, 1.4, 0.6); NB.rotation.z = 0.5; NP.add(NB);
  mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.0, 16), new THREE.MeshStandardMaterial({ color: P.walnutL, roughness: 0.5 }), NB, 0, 1.0, 0);
  mesh(new THREE.ConeGeometry(0.11, 0.5, 4), metal(P.brass, 0.3), NB, 0, -0.25, 0).rotation.z = Math.PI;
  const blob = mesh(new THREE.SphereGeometry(0.22, 24, 16), inkMat(), NB, 0, -0.45, 0);
  const waxSeal = mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.1, 30), new THREE.MeshStandardMaterial({ color: P.rubric, roughness: 0.35, emissive: new THREE.Color(P.rubric), emissiveIntensity: 0.1 }), LE, 2.3, 1.2, 0.2); waxSeal.rotation.x = Math.PI / 2;

  // ============ NIGHT (upside down, space pen, under water) ============
  const NI = new THREE.Group(); NI.position.x = NX; scene.add(NI);
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute((() => { const R = mulberry(31), a = []; for (let i = 0; i < 700; i++) a.push((R() - 0.5) * 40, (R() - 0.5) * 30, -8 - R() * 10); return a; })(), 3)), new THREE.PointsMaterial({ color: 0xfff2d8, size: 0.08 }));
  NI.add(stars);
  mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshBasicMaterial({ color: "#0b1330" }), NI, 0, 0, -18);
  // board above both pens (written on from below)
  const board = mesh(new THREE.BoxGeometry(8.5, 0.12, 3.0), new THREE.MeshStandardMaterial({ map: parchTex(17, [1, 1]), roughness: 0.9 }), NI, 0, 3.2, 0);
  const pA = makePen(NI, { barrel: "#6b4a2a" }); pA.G.position.set(-2.0, 3.12, 0.4); pA.G.rotation.set(0, 0, Math.PI + 0.25);
  const pB = makePen(NI, { barrel: P.verd, gas: true }); pB.G.position.set(2.0, 3.12, 0.4); pB.G.rotation.set(0, 0, Math.PI - 0.25);
  const brokenPts = []; for (let i = 0; i <= 80; i++) brokenPts.push({ x: -3.4 + i * 0.03, z: 0.15 * Math.sin(i * 0.3), ink: i > 0 && i % 9 < 4 && i < 40 });
  const fullPts = []; for (let i = 0; i <= 80; i++) fullPts.push({ x: 0.6 + i * 0.03, z: 0.15 * Math.sin(i * 0.3), ink: i > 0 });
  const UNDER = new THREE.Group(); UNDER.rotation.x = Math.PI; UNDER.position.set(0, 3.13, 0.4); NI.add(UNDER);
  const strokeA = strokeMesh(UNDER, brokenPts, 0.07, 0.0, inkMat()), strokeB = strokeMesh(UNDER, fullPts, 0.07, 0.0, inkMat());
  // water tank (s7 end)
  const WT = new THREE.Group(); WT.position.set(0, -2.6, 0.6); NI.add(WT);
  mesh(new THREE.BoxGeometry(5.2, 3.6, 2.6), new THREE.MeshPhysicalMaterial({ color: P.water, roughness: 0.05, transmission: 0.5, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }), WT, 0, 0, 0).renderOrder = 3;
  mesh(new THREE.BoxGeometry(5.3, 0.15, 2.7), metal(P.brass, 0.35), WT, 0, -1.85, 0);
  const slate = mesh(new THREE.BoxGeometry(3.6, 0.08, 1.8), new THREE.MeshStandardMaterial({ map: parchTex(23, [1, 1]), roughness: 0.9 }), WT, 0, -1.6, 0);
  const wPts = []; for (let i = 0; i <= 80; i++) wPts.push({ x: -1.4 + i * 0.035, z: 0.15 * Math.sin(i * 0.28), ink: i > 0 });
  const strokeW = strokeMesh(WT, wPts, 0.07, -1.55, inkMat());
  const pW = makePen(WT, { barrel: P.verd, gas: true }); pW.G.scale.setScalar(0.32); pW.G.rotation.set(-0.3, 0, -0.45);
  const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transmission: 0.8, transparent: true, opacity: 0.6 }), 24); bub.frustumCulled = false; WT.add(bub);

  // ============ page-turn wipe ============
  const pt = new THREE.PlaneGeometry(0.62, 0.9); pt.translate(0.31, 0, 0);
  const page = new THREE.Mesh(pt, new THREE.MeshBasicMaterial({ map: parchTex(41, [1, 1], true), side: THREE.DoubleSide, depthTest: false, depthWrite: false }));
  page.position.set(-0.31, 0, -0.6); page.renderOrder = 999; cam.add(page);
  const cuts = [K.s2, A("s4:ujungnya"), K.s7, K.s8];

  // ---------- writing schedule (fraction of the cursive path) ----------
  const uAt = (t) => 0.2 * ramp(t, 0.3, K.s1e) + 0.4 * ramp(t, A("s6:menggeser") - 0.2, K.s6e) + 0.4 * ramp(t, K.s8, A("s8:AUDIRA"));
  const writing = (t) => (t < K.s1e) || (t > A("s6:menggeser") - 0.2 && t < K.s6e) || (t > K.s8 && t < A("s8:AUDIRA"));

  // ---------- camera ----------
  const k = (t, ox, p, l) => [t, p[0] + ox, p[1], p[2], l[0] + ox, l[1], l[2]];
  // desk shots are offsets from the pen tip
  const D1 = track([
    [0, 1.3, 1.0, 2.4, 0.15, 0.45, 0],
    [K.s1e, 1.8, 1.7, 3.6, 0.2, 0.9, 0],
  ]);
  const D4 = track([
    [A("s4:ujungnya"), 0.9, 0.55, 1.5, 0.05, 0.3, 0],
    [K.s4e, 0.8, 0.5, 1.3, 0.05, 0.3, 0],
    [A("s5:tabung"), 2.4, 3.0, 5.6, 0.9, 2.2, 0],
    [A("s5:kapiler"), 1.6, 1.4, 3.4, 0.4, 1.0, 0],
    [K.s5e, 1.1, 0.7, 2.0, 0.1, 0.35, 0],
    [A("s6:basah"), 1.0, 0.6, 1.8, 0.05, 0.3, 0],
    [A("s6:Alur"), 0.7, 0.75, 1.4, 0.0, 0.42, 0],
    [K.s7, 1.4, 1.4, 2.8, 0.1, 0.6, 0],
  ]);
  const D8 = track([
    [K.s8, 1.6, 1.6, 3.2, 0.1, 0.6, 0],
    [A("s8:menggelinding"), 2.2, 3.6, 5.4, 0.1, 0.4, -0.5],
    [A("s8:AUDIRA"), 1.0, 9.0, 8.5, -0.2, 0.0, -1.6],
    [K.dur, 0.6, 11.5, 9.5, -0.3, 0.0, -1.8],
  ]);
  const C2c = track([
    k(K.s2, CX, [1.8, 2.6, 7.5], [0.4, 1.3, -1.0]),
    k(A("s2:kayu"), CX, [2.6, 2.4, 5.6], [1.0, 0.6, 1.8]),
    k(A("s2:Goresannya"), CX, [1.9, 1.8, 4.8], [0.9, 0.4, 2.0]),
    k(K.s3, CX, [-0.6, 2.8, 6.8], [-1.2, 1.6, -0.8]),
    k(A("s3:koran"), CX, [-2.4, 2.4, 5.6], [-2.4, 0.6, 1.8]),
    k(A("s3:kental"), CX, [-1.6, 1.7, 4.0], [-2.1, 0.9, 2.6]),
    k(K.s4, CX, [-0.4, 3.0, 6.4], [-0.6, 1.8, -1.0]),
    k(A("s4:ujungnya"), CX, [0.6, 2.7, 5.4], [0.4, 1.7, -1.0]),
  ]);
  const C7 = track([
    k(K.s7, NX, [-1.2, 2.2, 7.6], [-1.4, 2.0, 0]),
    k(A("s7:menjauh"), NX, [-1.6, 1.6, 6.2], [-1.8, 1.4, 0]),
    k(A("s7:angkasa"), NX, [1.3, 1.9, 7.0], [1.6, 1.6, 0]),
    k(A("s7:disegel"), NX, [1.9, 1.3, 6.2], [1.9, 1.3, 0]),
    k(A("s7:air") - 0.8, NX, [0.4, -1.2, 7.4], [0.0, -2.4, 0.4]),
    k(K.s8 + 0.02, NX, [0.3, -1.6, 6.6], [0.0, -2.6, 0.4]),
  ]);
  const look = new THREE.Vector3(), o3 = new THREE.Object3D(), ax = new THREE.Vector3();
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
  const atDesk = (t) => t < K.s2 || (t >= A("s4:ujungnya") && t < K.s7) || t >= K.s8;
  const stX = (t) => (atDesk(t) ? DX : t < K.s7 ? CX : NX);
  const penDrops = (p, t, amt, speed, dir = 1) => {
    for (let i = 0; i < 14; i++) { const u = ((i / 14 - dir * t * speed) % 1 + 1) % 1, y = 0.4 + 5.6 * u; o3.position.set(0.03 * Math.sin(i * 2.1), y, 0.03 * Math.cos(i * 1.7)); o3.scale.setScalar(Math.max(0.0001, amt * Math.min(1, u * 8))); o3.rotation.set(0, 0, 0); o3.updateMatrix(); p.drops.setMatrixAt(i, o3.matrix); }
    p.drops.instanceMatrix.needsUpdate = true;
  };

  return (t) => {
    const u = uAt(t), tp = tipAt(u), lift = writing(t) ? tp[2] : 0.04 + 0.02 * Math.sin(t * 0.8);
    let c;
    if (atDesk(t)) { const o = t < K.s2 ? D1(t) : t < K.s8 ? D4(t) : D8(t); c = [tp[0] + o[0], lift + o[1], tp[1] + o[2], tp[0] + o[3], lift + o[4], tp[1] + o[5]]; }
    else c = t < K.s7 ? C2c(t) : C7(t);
    cam.position.set(c[0] + 0.015 * Math.sin(t * 0.37), c[1] + 0.012 * Math.sin(t * 0.53 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    { let cc = cuts[0]; for (const x of cuts) if (Math.abs(t - x) < Math.abs(t - cc)) cc = x; const v = (t - cc) / 0.45; page.visible = Math.abs(v) < 1; page.rotation.y = (Math.PI / 2) * v; }
    const sx = stX(t);
    key.position.set(sx - 6, 9, 7); key.target.position.set(sx, 0, 0);
    rim.position.set(sx + 7, 5, -7); rim.target.position.set(sx, 1, 0);
    DE.visible = sx === DX; CO.visible = sx === CX; NI.visible = sx === NX;
    for (const [cd, s] of [[C1, 1], [C2, 4]]) { const f = noise(t, s); cd.L.intensity = 9 + 1.6 * f; cd.fl.scale.set(1, 1 + 0.12 * f, 1); }

    if (DE.visible) {
      pen.G.position.set(tp[0], lift, tp[1]);
      stroke(u);
      pen.ballSpin.rotation.z = -u * 28 / 0.18 * 0.12;
      pen.ballSpin.rotation.x = u * 9;
      const cut = t < K.s2 ? 0.3 * ramp(t, A("s1:bola") - 0.3, A("s1:berputar")) : t < K.s8 ? ramp(t, A("s4:ujungnya") - 0.1, A("s4:terjepit")) : 1 - ramp(t, A("s8:menggelinding"), A("s8:menggelinding") + 0.8);
      pen.fade.forEach((m) => { m.opacity = 1 - 0.88 * cut; m.depthWrite = cut < 0.5; });
      const flow = t < K.s5 ? 0.3 * cut : ramp(t, A("s5:turun") - 0.3, A("s5:turun") + 0.3);
      penDrops(pen, t, flow * (t < K.s7 ? 1 : 0), 0.35);
      pen.col.position.y = 1.6; pen.col.scale.y = 4.4;
      pen.film.material.opacity = 0.35 + 0.5 * Math.max(ramp(t, A("s5:membasahi") - 0.3, A("s5:membasahi") + 0.4), t < K.s5 ? 1 : 0);
      const gv = win(t, A("s5:gravitasi"), K.s5e, 0.3), cv = win(t, A("s5:kapiler"), K.s5e, 0.3);
      pen.gArrow.visible = gv > 0.02; pen.gArrow.scale.setScalar(2 * Math.max(0.001, gv)); pen.gArrow.position.y = 2.6 - 0.3 * ((t * 0.8) % 1);
      pen.cArrows.forEach((a, i) => { a.visible = cv > 0.02; a.scale.setScalar(Math.max(0.001, cv)); a.position.y = 0.55 + i * 0.32 - 0.1 * ((t * 1.2 + i * 0.3) % 1); });
      pen.groove.emissiveIntensity = 1.1 * win(t, A("s6:Alur"), K.s6e, 0.3);
    }
    if (CO.visible) {
      const m0 = t < K.s3 ? 1 : 0, m1 = t >= K.s3 && t < K.s4 ? 1 : 0, m2 = t >= K.s4 ? 1 : 0;
      minis.forEach((m, i) => { const on = [m0, m1, m2][i]; m.visible = on > 0; m.material.opacity = on * ramp(t, [K.s2, K.s3, K.s4][i] - 0.1, [K.s2, K.s3, K.s4][i] + 0.4); });
      years[0].visible = t < K.s3; years[1].visible = t >= K.s4; years[1].material.opacity = ramp(t, A("s4:mematenkan") - 0.3, A("s4:mematenkan") + 0.3);
      const sc = ramp(t, A("s2:kayu") - 0.4, A("s2:Goresannya") + 0.3);
      scribble(sc); MK.position.set(-1.9 + 3.8 * sc, 0.0, 0.25 * Math.sin(sc * 14)); MK.visible = t < K.s3;
      const thick = ramp(t, A("s3:kental") - 0.4, A("s3:kental") + 0.4);
      blob.scale.set(1 + 0.4 * thick, 1 + 0.25 * thick + 0.05 * Math.sin(t * 2), 1 + 0.4 * thick); blob.position.y = -0.45 - 0.08 * thick;
      waxSeal.visible = t >= K.s4; waxSeal.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s4:mematenkan") + 0.1) / 0.35), 2.2)));
    }
    if (NI.visible) {
      const wa = ramp(t, A("s7:gravitasi"), A("s7:menjauh") + 0.4);
      pA.col.position.y = 1.6 + 1.4 * ramp(t, A("s7:terbalik") - 0.2, A("s7:menjauh") + 0.4); pA.col.scale.y = 4.4 - 1.4 * ramp(t, A("s7:terbalik") - 0.2, A("s7:menjauh") + 0.4);
      pA.film.material.opacity = 0.85 * (1 - ramp(t, A("s7:menjauh") - 0.2, A("s7:menjauh") + 0.5));
      pA.feed.visible = t < A("s7:menjauh");
      pA.fade.forEach((m) => { m.opacity = 0.15; m.depthWrite = false; }); pB.fade.forEach((m) => { m.opacity = 0.15; m.depthWrite = false; }); pW.fade.forEach((m) => { m.opacity = 0.2; m.depthWrite = false; });
      penDrops(pA, t, 0, 0.3); pA.gArrow.visible = wa > 0.02 && t < A("s7:angkasa"); pA.gArrow.scale.setScalar(2 * Math.max(0.001, wa)); pA.gArrow.rotation.z = 0; pA.cArrows.forEach((a) => (a.visible = false));
      const wA = ramp(t, K.s7 + 0.3, A("s7:menjauh") + 0.6); strokeA(wA); pA.G.position.x = -2.0 + 2.4 * (wA - 0.5) * 0.5;
      const gas = ramp(t, A("s7:gas") - 0.3, A("s7:gas") + 0.4), sealOn = ramp(t, A("s7:disegel") - 0.2, A("s7:disegel") + 0.3);
      pB.seal.material.emissiveIntensity = 0.8 * win(t, A("s7:disegel"), K.s7e, 0.3); pB.piston.position.y = 6.05 - 0.15 * gas * (0.5 + 0.5 * Math.sin(t * 3)); pB.gasC.material.emissiveIntensity = 0.2 + 0.8 * gas;
      penDrops(pB, t, gas, -0.35, -1); pB.gArrow.visible = false; pB.cArrows.forEach((a, i) => { a.visible = gas > 0.02; a.scale.setScalar(Math.max(0.001, gas)); a.position.y = 5.2 - i * 0.6 - 0.15 * ((t + i * 0.3) % 1); a.rotation.z = Math.PI; });
      const wB = ramp(t, A("s7:terbalik#2") - 0.6, A("s7:air") - 0.5); strokeB(wB); pB.G.position.x = 2.0 + 1.2 * (wB - 0.5);
      const wW = ramp(t, A("s7:air") - 0.6, K.s7e + 0.3); strokeW(wW); const wx = -1.4 + 2.8 * wW; pW.G.position.set(wx, -1.55, 0.15 * Math.sin((wx + 1.4) / 0.035 * 0.28));
      for (let i = 0; i < 24; i++) { const R = (i * 0.618) % 1, v = ((t * (0.25 + 0.2 * R) + R) % 1); o3.position.set(-2.2 + 4.4 * ((i * 0.37) % 1), -1.6 + 3.3 * v, -0.9 + 1.8 * ((i * 0.53) % 1)); o3.scale.setScalar(0.6 + R); o3.updateMatrix(); bub.setMatrixAt(i, o3.matrix); }
      bub.instanceMatrix.needsUpdate = true;
      pW.cArrows.forEach((a) => (a.visible = false)); pW.gArrow.visible = false; penDrops(pW, t, 0.6, -0.35, -1);
    }
    comp.render();
  };
}
