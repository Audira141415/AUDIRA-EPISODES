// EP01 PAX SILICA ASEAN (DATAPHYSICAL): a semiconductor geopolitics arena.
// Two rival monuments (Pax Silica alu-blue, WAICO alu-red) flank 10 ASEAN pillars on a terrazzo floor.
// A giant silicon wafer with "PAX SILICA" + "AUDIRA" engraved rotates in the hook. No faces, no logos.
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, stage, envStrips } from "./lib3d.js";

const C = { bg: 0x1c1d20, wall: "#2B2A2E", floor: "#3A3836", alu: "#C8CCD1", brass: "#D2B07A", teal: "#9FD3D6",
  usBlue: "#4A8FCC", cnRed: "#CC5A5A", cnGold: "#D4A849", amber: "#F5B54F" };
const ENG = "'Arial Black','Segoe UI Black',Arial,sans-serif";
const MONO = "Consolas,'Courier New',monospace";
const D2R = Math.PI / 180;

const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
const Grade = { uniforms: { tDiffuse: { value: null }, uT: { value: 0 } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uT;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
   vec3 s=c*c*(3.0-2.0*c);c=mix(c,s,0.15);
   vec2 q=vUv-vec2(0.5,0.47);q.x*=0.5625;c*=1.0-0.06*smoothstep(0.12,0.62,length(q));
   c+=(h(floor(vUv*vec2(1080.0,1920.0))+floor(uT*30.0))-0.5)*0.004;
   c=0.022+clamp(c,0.0,1.0)*0.953;
   gl_FragColor=vec4(c,1.0);}` };

function rbox(w, h, d, r = 0.03, seg = 3) {
  const W = w - 2 * r, H = h - 2 * r, s = new THREE.Shape();
  s.moveTo(-W / 2, -H / 2); s.lineTo(W / 2, -H / 2); s.lineTo(W / 2, H / 2); s.lineTo(-W / 2, H / 2); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg, curveSegments: 4 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}

export function create(canvas, K, AT) {
  const { r, scene, cam: cam_, comp } = stage(canvas, { bg: C.bg, fog: 0.018, exp: 1, bloom: [0.1, 0.3, 0.92], fov: 30 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const grade = new ShaderPass(Grade); comp.addPass(grade);
  envStrips(r, scene, [[9, 3, 0xffe0bc, 1.5, -6, 7, 6], [3, 9, 0xcfe0ff, 0.8, 8, 3, -5], [12, 1.2, 0xfff6ea, 0.6, 0, 10, 0], [5, 4, 0x9fd3d6, 0.45, -7, 1, -7], [4, 2, 0xffc890, 0.6, 6, 1, 7]], 0x1c1d20);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };

  // ---------- textures ----------
  const brushed = (base, lo, hi, seed) => canvasTex(512, 512, (g, w, h) => { const R = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = R() > 0.5 ? hi : lo; g.globalAlpha = 0.05 + R() * 0.1; g.fillRect(0, R() * h, w, 0.6 + R() * 1.6); } g.globalAlpha = 1; }, [1, 1]);
  const aluT = brushed("#d4d7db", "#9ea3aa", "#f2f4f6", 5);
  const brassT = brushed("#d8b882", "#a9864f", "#f1dcae", 9);
  const usAluT = brushed("#a8c4e0", "#7098c0", "#d0e0f0", 15);
  const cnAluT = brushed("#d0a8a8", "#b07070", "#e8c8c8", 19);

  const stoneT = canvasTex(2048, 2048, (g, w, h) => { const R = mulberry(23); g.fillStyle = "#3A3836"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,248,236,.05)" : "rgba(0,0,0,.07)"; const s = 1 + R() * 5; g.fillRect(R() * w, R() * h, s, s); }
    const CH = ["#9a9440", "#8a9a48", "#6e9a4a", "#5a9a68", "#4f9a8a", "#4f97a8", "#4f7aa8", "#6e6aa8"];
    for (let i = 0; i < 48000; i++) { const x = R() * w, y = R() * h, rr = 1.5 + R() * 3, n = 5 + Math.floor(R() * 3); g.fillStyle = CH[Math.floor(R() * CH.length)]; g.globalAlpha = 0.22 + R() * 0.2;
      g.beginPath(); for (let k = 0; k < n; k++) { const an = k / n * 6.283 + R() * 0.6, q = rr * (0.6 + R() * 0.5); k ? g.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q) : g.moveTo(x + Math.cos(an) * q, y + Math.sin(an) * q); } g.fill(); }
    g.globalAlpha = 1;
    g.strokeStyle = "rgba(14,13,12,.5)"; g.lineWidth = 2; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * w / 8, 0); g.lineTo(k * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, k * h / 8); g.lineTo(w, k * h / 8); g.stroke(); } }, [6, 6]);

  const circuitT = canvasTex(1024, 1024, (g, w, h) => { const R = mulberry(42); g.fillStyle = "#1a2a2a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = C.teal; g.lineWidth = 2; g.globalAlpha = 0.35;
    for (let i = 0; i < 120; i++) { let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 6; j++) { const d = Math.floor(R() * 4); if (d === 0) x += 20 + R() * 60; else if (d === 1) x -= 20 + R() * 60; else if (d === 2) y += 20 + R() * 60; else y -= 20 + R() * 60; g.lineTo(x, y); }
      g.stroke(); if (R() > 0.5) { g.fillStyle = C.teal; g.globalAlpha = 0.5; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); g.globalAlpha = 0.35; } }
    g.font = "bold 36px Consolas"; g.fillStyle = C.teal; g.globalAlpha = 0.5; g.textAlign = "center";
    g.fillText("PAX SILICA", w / 2, h * 0.42); g.fillText("AUDIRA", w / 2, h * 0.56); g.globalAlpha = 1; });

  const wallMapT = canvasTex(4096, 800, (g, w, h) => { const R = mulberry(41); g.fillStyle = C.wall; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.05)"; g.fillRect(R() * w, R() * h, 3, 3); }
    g.fillStyle = "rgba(0,0,0,.35)"; for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 3, h);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,0,0,.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  // ---------- materials ----------
  const alu = () => new THREE.MeshStandardMaterial({ color: C.alu, map: aluT, roughness: 0.28, metalness: 0.18, emissive: new THREE.Color(C.alu), emissiveIntensity: 0.03 });
  const brass = new THREE.MeshStandardMaterial({ color: C.brass, map: brassT, roughness: 0.24, metalness: 0.85 });
  const usAlu = new THREE.MeshStandardMaterial({ color: C.usBlue, map: usAluT, roughness: 0.26, metalness: 0.22, emissive: new THREE.Color(C.usBlue), emissiveIntensity: 0.04 });
  const cnAlu = new THREE.MeshStandardMaterial({ color: C.cnRed, map: cnAluT, roughness: 0.26, metalness: 0.22, emissive: new THREE.Color(C.cnRed), emissiveIntensity: 0.04 });
  const acrylic = new THREE.MeshStandardMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.06, transparent: true, opacity: 0.4, roughness: 0.12, metalness: 0.2, depthWrite: false, side: THREE.DoubleSide });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.6, metalness: 0.2 });

  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const mesh = (geo, m, x = 0, y = 0, z = 0, p = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };

  function plateTex(text, { w = 512, h = 170, ink = "#2a1d0c", face = "brass" } = {}) {
    return canvasTex(w, h, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      if (face === "alu") { gr.addColorStop(0, "#e2e5e9"); gr.addColorStop(1, "#a7adb5"); }
      else if (face === "us") { gr.addColorStop(0, "#b0cce6"); gr.addColorStop(1, "#6a9ac8"); }
      else if (face === "cn") { gr.addColorStop(0, "#e0b8b8"); gr.addColorStop(1, "#c07070"); }
      else { gr.addColorStop(0, "#e9cf9c"); gr.addColorStop(0.5, "#cfab72"); gr.addColorStop(1, "#a6824d"); }
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const R = mulberry(text.length * 7 + 3); for (let i = 0; i < 220; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,245,220,.12)" : "rgba(60,40,10,.10)"; g.fillRect(0, R() * h, w, 1); }
      g.strokeStyle = "rgba(60,40,12,.55)"; g.lineWidth = 5; g.strokeRect(9, 9, w - 18, h - 18);
      let fs = h * 0.52; g.font = `900 ${fs}px ${ENG}`; while (g.measureText(text).width > w * 0.84 && fs > 10) { fs -= 2; g.font = `900 ${fs}px ${ENG}`; }
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = "rgba(255,244,214,.6)"; g.fillText(text, w / 2 + 2, h / 2 + 5);
      g.fillStyle = ink; g.fillText(text, w / 2, h / 2 + 2);
    });
  }
  function faced(w, h, d, tex, side) {
    const fm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.48, metalness: 0.42, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, fm, side]);
    m.castShadow = true; m.receiveShadow = true;
    return { m, fm };
  }

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xfff1e0, 0x2a2622, 0.55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd6a8, 2.3); key.position.set(7, 13, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xb4ccff, 1.3); rim.position.set(-7, 8, -11); scene.add(rim, rim.target);
  const spotL = new THREE.SpotLight(0x4a8fcc, 3, 0, 0.5, 0.65, 2); spotL.position.set(-6, 9, 2); spotL.target.position.set(-3, 0, 0); scene.add(spotL, spotL.target);
  const spotR = new THREE.SpotLight(0xcc5a5a, 3, 0, 0.5, 0.65, 2); spotR.position.set(6, 9, 2); spotR.target.position.set(3, 0, 0); scene.add(spotR, spotR.target);
  const fill = new THREE.PointLight(0xfff2e0, 0.8, 30, 2); fill.position.set(0, 5, 8); scene.add(fill);
  const tealFill = new THREE.PointLight(0x9fd3d6, 0.5, 20, 2); tealFill.position.set(0, 2, -4); scene.add(tealFill);

  // ---------- floor ----------
  const floor = new THREE.Mesh(new THREE.CircleGeometry(55, 96), new THREE.MeshStandardMaterial({ color: 0xffffff, map: stoneT, roughness: 0.42, metalness: 0.12 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // ---------- wall ----------
  const WR = 13, WH = 10, W0 = 62 * D2R, WL = 236 * D2R;
  const wallG = new THREE.CylinderGeometry(WR, WR, WH, 128, 1, true, W0, WL);
  const wallM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: wallMapT, roughness: 0.5, metalness: 0.15, side: THREE.BackSide });
  const wall = mesh(wallG, wallM, 0, WH / 2 - 0.5, 0);
  wall.castShadow = false;

  // ---------- silicon wafer (hook centrepiece) ----------
  const waferG = new THREE.CylinderGeometry(2.2, 2.2, 0.08, 64);
  const waferM = new THREE.MeshStandardMaterial({ color: 0x1a2a2a, map: circuitT, roughness: 0.15, metalness: 0.3, emissive: new THREE.Color(C.teal), emissiveMap: circuitT, emissiveIntensity: 0.12, transparent: true, opacity: 0.85 });
  const wafer = mesh(waferG, waferM, 0, 3.5, 0);

  // ---------- monument Pax Silica (left, US blue) ----------
  const usG = G(-3.5, 0, 0);
  const usBase = mesh(rbox(2.4, 0.4, 1.2, 0.04), usAlu, 0, 0.2, 0, usG);
  const usB1 = mesh(rbox(1.8, 1.6, 0.8, 0.03), usAlu, 0, 1.2, 0, usG);
  const usB2 = mesh(rbox(1.2, 1.2, 0.6, 0.03), usAlu, 0, 2.6, 0, usG);
  const usB3 = mesh(rbox(0.8, 0.8, 0.4, 0.02), usAlu, 0, 3.6, 0, usG);
  // labels
  const usLabels = ["CHIP", "AI", "MINERAL"];
  usLabels.forEach((txt, i) => {
    const { m, fm } = faced(1.4 - i * 0.3, 0.26, 0.06, plateTex(txt, { w: 400, h: 120, face: "us" }), usAlu);
    m.position.set(0, 0.8 + i * 1.4, 0.4 - i * 0.1 + 0.3); usG.add(m); m._fm = fm;
  });
  const { m: usTitleM, fm: usTitleFm } = faced(2, 0.3, 0.06, plateTex("PAX SILICA", { w: 600, h: 120, face: "us" }), usAlu);
  usTitleM.position.set(0, 4.3, 0.2); usG.add(usTitleM);

  // ---------- monument WAICO (right, China red) ----------
  const cnG = G(3.5, 0, 0);
  const cnBase = mesh(rbox(2.4, 0.4, 1.2, 0.04), cnAlu, 0, 0.2, 0, cnG);
  const cnB1 = mesh(rbox(1.8, 1.6, 0.8, 0.03), cnAlu, 0, 1.2, 0, cnG);
  const cnB2 = mesh(rbox(1.2, 1.2, 0.6, 0.03), cnAlu, 0, 2.6, 0, cnG);
  const cnB3 = mesh(rbox(0.8, 0.8, 0.4, 0.02), cnAlu, 0, 3.6, 0, cnG);
  const cnLabels = ["CHIP", "AI", "MINERAL"];
  cnLabels.forEach((txt, i) => {
    const { m, fm } = faced(1.4 - i * 0.3, 0.26, 0.06, plateTex(txt, { w: 400, h: 120, face: "cn" }), cnAlu);
    m.position.set(0, 0.8 + i * 1.4, 0.4 - i * 0.1 + 0.3); cnG.add(m); m._fm = fm;
  });
  const { m: cnTitleM, fm: cnTitleFm } = faced(2, 0.3, 0.06, plateTex("WAICO", { w: 600, h: 120, face: "cn" }), cnAlu);
  cnTitleM.position.set(0, 4.3, 0.2); cnG.add(cnTitleM);

  // ---------- 10 ASEAN pillars ----------
  const COUNTRIES = [
    { name: "SINGAPURA", side: "us", angle: -40, ring: 2.8 },
    { name: "FILIPINA", side: "us", angle: -25, ring: 1.6 },
    { name: "KAMBOJA", side: "cn", angle: 15, ring: 3.6 },
    { name: "MALAYSIA", side: "cn", angle: 25, ring: 2.0 },
    { name: "LAOS", side: "cn", angle: 35, ring: 4.2 },
    { name: "MYANMAR", side: "cn", angle: 45, ring: 3.0 },
    { name: "INDONESIA", side: "mid", angle: 0, ring: 1.4 },
    { name: "THAILAND", side: "mid", angle: -10, ring: 3.2 },
    { name: "VIETNAM", side: "mid", angle: 10, ring: 2.4 },
    { name: "BRUNEI", side: "mid", angle: 55, ring: 4.6 },
  ];
  const pillarG = new THREE.CylinderGeometry(0.14, 0.16, 2.6, 16);
  const pillars = COUNTRIES.map((c) => {
    const a = c.angle * D2R;
    const dist = c.ring;
    const x = Math.sin(a) * dist, z = Math.cos(a) * dist;
    const mat = c.side === "us" ? usAlu.clone() : c.side === "cn" ? cnAlu.clone() : acrylic.clone();
    const p = mesh(pillarG, mat, x, 1.3, z);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(x, 0.01, z); scene.add(shadow);
    // name plate
    const { m: nm, fm: nfm } = faced(0.7, 0.18, 0.04, plateTex(c.name, { w: 350, h: 100, face: c.side === "us" ? "us" : c.side === "cn" ? "cn" : "brass" }), brass);
    nm.position.set(x, 0.15, z + 0.2); scene.add(nm);
    return { mesh: p, plate: nm, plateFm: nfm, data: c, x, z, leanTarget: c.side === "us" ? -0.15 : c.side === "cn" ? 0.15 : 0 };
  });

  // ---------- FG: brass stanchions ----------
  const stanchionG = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 12);
  for (let i = 0; i < 6; i++) {
    const a = (i - 2.5) * 18 * D2R;
    mesh(stanchionG, brass, Math.sin(a) * 5.5, 0.7, Math.cos(a) * 5.5);
  }

  // ---------- FG: large wafer prop (foreground depth) ----------
  const fgWaferG = new THREE.CylinderGeometry(1.2, 1.2, 0.04, 48);
  const fgWafer = mesh(fgWaferG, new THREE.MeshStandardMaterial({ color: 0x1a2a2a, map: circuitT, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.3, depthWrite: false }), -2.5, 2, 6);
  fgWafer.rotation.set(0.3, 0.4, 0.1);

  // ---------- BG: blurred column ring (varied heights for depth) ----------
  const bgColM = new THREE.MeshStandardMaterial({ color: 0x36353a, roughness: 0.6, metalness: 0.15 });
  const bgR = mulberry(77);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const h = 5 + bgR() * 4;
    const g = new THREE.CylinderGeometry(0.25 + bgR() * 0.15, 0.3 + bgR() * 0.15, h, 8);
    mesh(g, bgColM, Math.sin(a) * (9.5 + bgR() * 1.5), h / 2, Math.cos(a) * (9.5 + bgR() * 1.5));
  }

  // ---------- crystal silica (s3 centrepiece) ----------
  const crystalG = new THREE.OctahedronGeometry(0.9, 0);
  const crystalM = new THREE.MeshStandardMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.15, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.3, depthWrite: false });
  const crystal = mesh(crystalG, crystalM, 0, 2.2, 0);

  // ---------- camera ----------
  // track keys: [t, targetX, targetY, targetZ, yawDeg, pitchDeg, distance, fov]
  const cam = track([
    [0,         0,  2.2,  0,    0,  12, 14, 30],
    [K.s2,     -3,  2.0,  0,  -25,  10, 12, 30],
    [K.s3,      0,  1.5,  0,   -5,  18,  9, 30],
    [K.s4,     -1,  2.0,  0,    8,  10, 12, 30],
    [K.s5,      0,  2.5,  0,    0,  14, 15, 30],
    [K.s6,      0,  1.5,  0,    3,  12,  9, 30],
    [K.s7,      0,  2.5,  0,    0,  16, 14, 30],
    [K.s8,      0,  3.0,  0,    0,  10, 16, 30],
    [K.outro,   0,  3.0,  0,    0,  10, 18, 30],
  ]);

  // ---------- animate ----------
  return function update(t) {
    grade.uniforms.uT.value = t;

    // wafer rotation + vertical bob
    wafer.rotation.y = t * 0.3;
    wafer.position.y = 3.5 + Math.sin(t * 0.8) * 0.15;
    // wafer visibility: prominent in s1, fades for s2-s7, returns s8
    const waferOp = t < K.s2 ? 1 : t < K.s2 + 1 ? 1 - smooth((t - K.s2)) : t > K.s7 ? clamp01((t - K.s7) / 1) * 0.6 : 0.2;
    waferM.opacity = waferOp * 0.85;
    waferM.emissiveIntensity = 0.12 * waferOp;

    // FG wafer drifts
    fgWafer.rotation.y = t * 0.15;
    fgWafer.position.x = -2.5 + Math.sin(t * 0.2) * 0.4;

    // crystal: appears in s3, bobs, glows
    const crystalVis = clamp01(ramp(t, K.s3, K.s3 + 1)) * (1 - clamp01(ramp(t, K.s4, K.s4 + 1)) * 0.6);
    crystal.scale.setScalar(crystalVis * (1 + 0.05 * Math.sin(t * 2)));
    crystal.rotation.y = t * 0.5;
    crystal.rotation.x = Math.sin(t * 0.3) * 0.2;
    crystalM.emissiveIntensity = 0.15 + 0.1 * Math.sin(t * 3) * crystalVis;

    // monuments: US appears in s2, CN in s5
    const usVis = clamp01(ramp(t, K.s2 - 0.3, K.s2 + 1.5));
    usG.scale.setScalar(usVis);
    usG.position.y = -1.5 * (1 - eout(usVis));
    const cnVis = clamp01(ramp(t, K.s5 - 0.3, K.s5 + 1.5));
    cnG.scale.setScalar(cnVis);
    cnG.position.y = -1.5 * (1 - eout(cnVis));

    // monument glow in s7
    const glowS7 = clamp01(ramp(t, K.s7, K.s7 + 1));
    usAlu.emissiveIntensity = 0.04 + 0.08 * glowS7 * (0.7 + 0.3 * Math.sin(t * 4));
    cnAlu.emissiveIntensity = 0.04 + 0.08 * glowS7 * (0.7 + 0.3 * Math.sin(t * 4 + 1));

    // spotlight intensity: US spot for s2-s4, CN for s5-s6, both for s7
    spotL.intensity = 3 * clamp01(ramp(t, K.s2 - 0.5, K.s2 + 0.5)) * (t > K.s5 && t < K.s7 ? 0.5 : 1);
    spotR.intensity = 3 * clamp01(ramp(t, K.s5 - 0.5, K.s5 + 0.5));

    // ASEAN pillars: appear from s4, lean more from s5, Indonesia vibrates in s6
    pillars.forEach((p) => {
      const vis = clamp01(ramp(t, K.s4 - 0.5, K.s4 + 2));
      p.mesh.scale.setScalar(vis);
      const leanAmt = clamp01(ramp(t, K.s5, K.s5 + 2));
      p.mesh.rotation.z = p.leanTarget * leanAmt;
      // Indonesia vibrates in s6
      if (p.data.name === "INDONESIA" && t >= K.s6 && t < K.s7) {
        p.mesh.rotation.z = Math.sin(t * 12) * 0.08;
        p.mesh.position.y = 1.3 + Math.sin(t * 8) * 0.05;
      }
      // plate emissive: lights up when its anchor fires
      const plateGlow = p.data.name === "INDONESIA" ? clamp01(ramp(t, K.s5 + 1, K.s5 + 1.5)) : vis * 0.5;
      p.plateFm.emissiveIntensity = plateGlow * 0.3;
    });

    const [tx, ty, tz, yaw, pitch, dist, fov] = cam(t);
    const yr = yaw * D2R, pr = pitch * D2R;
    cam_.position.set(tx + dist * Math.sin(yr) * Math.cos(pr) + 0.12 * Math.sin(t * 0.5), ty + dist * Math.sin(pr) + 0.06 * Math.sin(t * 0.37), tz + dist * Math.cos(yr) * Math.cos(pr));
    cam_.fov = fov; cam_.updateProjectionMatrix(); cam_.lookAt(tx, ty, tz);
    comp.render();
  };
}
