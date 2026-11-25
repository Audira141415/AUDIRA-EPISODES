// EP01 KANDIDAT PENGGANTI WAPRES (DATAPHYSICAL): one data-sculpture gallery. An empty aluminium VP chair on a walnut
// pedestal in the centre; four walnut plinths on the front arc (KABINET, KEPALA DAERAH, LEMBAGA NEGARA, KOALISI), each with
// machined aluminium columns = survey percentages (LRP, 13-14 Nov 2026) and brass name plates; behind the chair an aluminium
// arch holds a brass funnel that narrows 12 plates to 2 "MPR" slots. Curved gallery wall with light slits, a BG ring of
// blurred columns, brass stanchions with a velvet rope in the FG. Names only: no faces, no figures, no logos.
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, stage, envStrips } from "./lib3d.js";

const C = { bg: 0x1c1d20, wall: "#2B2A2E", floor: "#3A3836", walnut: "#2A1B14", alu: "#C8CCD1", brass: "#D2B07A", teal: "#9FD3D6", orange: "#D4521C" };
const ENG = "'Arial Black','Segoe UI Black','Segoe UI',Arial,sans-serif";
const MONO = "Consolas,'Courier New',monospace";
const D2R = Math.PI / 180;

const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// APPLE_STUDIO_CLEAN in display space: S-curve 0.15, vignette 0.06, grain 0.004, no aberration, no tint.
// Range is held to 0.022..0.975 so highlights never clip and the deepest walnut never crushes.
const Grade = { uniforms: { tDiffuse: { value: null }, uT: { value: 0 } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uT;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
   vec3 s=c*c*(3.0-2.0*c);c=mix(c,s,0.15);
   vec2 q=vUv-vec2(0.5,0.47);q.x*=0.5625;c*=1.0-0.06*smoothstep(0.12,0.62,length(q));
   c+=(h(floor(vUv*vec2(1080.0,1920.0))+floor(uT*30.0))-0.5)*0.004;
   c=0.022+clamp(c,0.0,1.0)*0.953;
   gl_FragColor=vec4(c,1.0);}` };

// rounded (bevelled) box, centred
function rbox(w, h, d, r = 0.03, seg = 3) {
  const W = w - 2 * r, H = h - 2 * r, s = new THREE.Shape();
  s.moveTo(-W / 2, -H / 2); s.lineTo(W / 2, -H / 2); s.lineTo(W / 2, H / 2); s.lineTo(-W / 2, H / 2); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg, curveSegments: 4 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}

export function create(canvas, K, AT) {
  const { r, scene, cam: cam_, comp } = stage(canvas, { bg: C.bg, fog: 0.012, exp: 1, bloom: [0.1, 0.3, 0.92], fov: 30 });
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
  const walnutT = canvasTex(1024, 512, (g, w, h) => { const R = mulberry(17); g.fillStyle = "#3a261b"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.strokeStyle = R() > 0.5 ? `rgba(92,60,38,${0.15 + R() * 0.25})` : `rgba(18,10,6,${0.2 + R() * 0.3})`; g.lineWidth = 1 + R() * 4; g.beginPath(); const y = R() * h, a = R() * 6;
      for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * 0.006 + a) * 14 + Math.sin(x * 0.021 + a * 2) * 4; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
    for (let i = 0; i < 9; i++) { const x = R() * w, y = R() * h; g.strokeStyle = "rgba(20,11,6,.35)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 30 + R() * 30, 6 + R() * 6, 0, 0, 7); g.stroke(); } }, [1, 1]);
  const stoneT = canvasTex(2048, 2048, (g, w, h) => { const R = mulberry(23); g.fillStyle = "#3A3836"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,248,236,.05)" : "rgba(0,0,0,.07)"; const s = 1 + R() * 5; g.fillRect(R() * w, R() * h, s, s); }
    // terrazzo chips: a gallery floor of crushed stone in muted earth, sage, slate and plum tones
    const CH = ["#9a9440", "#8a9a48", "#6e9a4a", "#5a9a68", "#4f9a8a", "#4f97a8", "#4f7aa8", "#6e6aa8", "#7f62a0", "#9a5f86", "#9a5f6e", "#9a7a3c"];
    for (let i = 0; i < 64000; i++) { const x = R() * w, y = R() * h, rr = 1.5 + R() * 3.5, n = 5 + Math.floor(R() * 3); g.fillStyle = CH[Math.floor(R() * CH.length)]; g.globalAlpha = 0.26 + R() * 0.24;
      g.beginPath(); for (let k = 0; k < n; k++) { const an = k / n * 6.283 + R() * 0.6, q = rr * (0.6 + R() * 0.5); k ? g.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q) : g.moveTo(x + Math.cos(an) * q, y + Math.sin(an) * q); } g.fill(); }
    g.globalAlpha = 1;
    g.strokeStyle = "rgba(14,13,12,.55)"; g.lineWidth = 3; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * w / 8, 0); g.lineTo(k * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, k * h / 8); g.lineTo(w, k * h / 8); g.stroke(); } }, [6, 6]);
  const grainT = canvasTex(256, 256, (g, w, h) => { const R = mulberry(31); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = R() > 0.5 ? "#9a9a9a" : "#6a6a6a"; g.fillRect(R() * w, R() * h, 2, 2); } }, [6, 6]);

  // ---------- materials ----------
  const alu = () => new THREE.MeshStandardMaterial({ color: C.alu, map: aluT, roughness: 0.28, metalness: 0.18, emissive: new THREE.Color(C.alu), emissiveIntensity: 0.03 });
  const brass = new THREE.MeshStandardMaterial({ color: C.brass, map: brassT, roughness: 0.24, metalness: 0.85 });
  const walnut = new THREE.MeshStandardMaterial({ color: 0xffffff, map: walnutT, roughness: 0.55, metalness: 0.1 });
  const acrylic = new THREE.MeshStandardMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.06, transparent: true, opacity: 0.4, roughness: 0.12, metalness: 0.2, depthWrite: false, side: THREE.DoubleSide });
  const aluM = alu();
  const darkM = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.6, metalness: 0.2 });

  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const mesh = (geo, m, x = 0, y = 0, z = 0, p = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };

  // engraved brass plate texture
  function plateTex(text, { w = 512, h = 170, ink = "#2a1d0c", font = ENG, max = 0.84, size = 0.56, face = "brass" } = {}) {
    return canvasTex(w, h, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      if (face === "alu") { gr.addColorStop(0, "#e2e5e9"); gr.addColorStop(1, "#a7adb5"); } else { gr.addColorStop(0, "#e9cf9c"); gr.addColorStop(0.5, "#cfab72"); gr.addColorStop(1, "#a6824d"); }
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const R = mulberry(text.length * 7 + 3); for (let i = 0; i < 220; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,245,220,.12)" : "rgba(60,40,10,.10)"; g.fillRect(0, R() * h, w, 1); }
      g.strokeStyle = "rgba(60,40,12,.55)"; g.lineWidth = 5; g.strokeRect(9, 9, w - 18, h - 18);
      let fs = h * size; g.font = `900 ${fs}px ${font}`; while (g.measureText(text).width > w * max && fs > 10) { fs -= 2; g.font = `900 ${fs}px ${font}`; }
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = "rgba(255,244,214,.6)"; g.fillText(text, w / 2 + 2, h / 2 + 5);
      g.fillStyle = ink; g.fillText(text, w / 2, h / 2 + 2);
    });
  }
  // a thin box whose front face carries a texture
  function faced(w, h, d, tex, side, emissive = true) {
    const fm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.48, metalness: 0.42, emissive: 0xffffff, emissiveMap: emissive ? tex : null, emissiveIntensity: 0 });
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
  const spot = (x, y, z, tx, ty, tz, color = 0xffe6c8, angle = 0.42) => { const s = new THREE.SpotLight(color, 0, 0, angle, 0.65, 2); s.position.set(x, y, z); s.target.position.set(tx, ty, tz); scene.add(s, s.target); return s; };

  // ---------- floor, wall, BG column ring, FG rope ----------
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 96), new THREE.MeshStandardMaterial({ color: 0xffffff, map: stoneT, roughness: 0.42, metalness: 0.12 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const RP = 4.2;
  const ring = mesh(new THREE.RingGeometry(RP + 1.15, RP + 1.2, 128), brass, 0, 0.004, 0); ring.rotation.x = -Math.PI / 2; ring.castShadow = false;
  const ring2 = mesh(new THREE.RingGeometry(1.5, 1.54, 96), brass, 0, 0.004, 0); ring2.rotation.x = -Math.PI / 2; ring2.castShadow = false;

  const WR = 13, WH = 10, W0 = 62 * D2R, WL = 236 * D2R;
  const wallMapT = canvasTex(4096, 800, (g, w, h) => { const R = mulberry(41); g.fillStyle = C.wall; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.05)"; g.fillRect(R() * w, R() * h, 3, 3); }
    g.fillStyle = "rgba(0,0,0,.35)"; for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 3, h); g.fillRect(0, h * 0.86, w, 4);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,0,0,.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  // light slits: warm 3400K at the floor, cooling to acrylic teal at the top
  const wallEmT = canvasTex(4096, 800, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#ffb26a"); gr.addColorStop(0.35, "#e9c79a"); gr.addColorStop(0.62, "#6fc4c8"); gr.addColorStop(0.85, "#8a86e8"); gr.addColorStop(1, "#b07ad8");
    for (let x = 64, i = 0; x < w; x += 128, i++) { const top = i % 3 === 1 ? 0.12 : 0.34; g.fillStyle = gr; g.fillRect(x - 5, h * top, 10, h * (0.86 - top)); }
    const wash = g.createLinearGradient(0, h, 0, h * 0.55); wash.addColorStop(0, "rgba(255,170,100,.22)"); wash.addColorStop(1, "rgba(255,170,100,0)"); g.fillStyle = wash; g.fillRect(0, 0, w, h); });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(WR, WR, WH, 96, 1, true, W0, WL), new THREE.MeshStandardMaterial({ color: 0xffffff, map: wallMapT, emissive: 0xffffff, emissiveMap: wallEmT, emissiveIntensity: 0.9, roughness: 0.8, side: THREE.BackSide }));
  wall.position.y = WH / 2; wall.receiveShadow = true; scene.add(wall);
  {
    const NB = 44, cg = rbox(0.36, 1, 0.36, 0.02); cg.translate(0, 0.5, 0);
    const bg = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ color: 0x80858d, map: aluT, roughness: 0.4, metalness: 0.18 }), NB), cap = new THREE.InstancedMesh(rbox(0.42, 0.06, 0.42, 0.015), brass, NB);
    const R = mulberry(77), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (let i = 0; i < NB; i++) { const a = (70 + (i + 0.5) * (220 / NB)) * D2R, rr = 10.6 + (i % 2) * 0.7, hh = 0.8 + R() * 3.6;
      v.set(rr * Math.sin(a), 0, rr * Math.cos(a)); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a); s.set(1, hh, 1); M4.compose(v, q, s); bg.setMatrixAt(i, M4);
      v.y = hh + 0.03; s.set(1, 1, 1); M4.compose(v, q, s); cap.setMatrixAt(i, M4); }
    bg.castShadow = cap.castShadow = false; bg.receiveShadow = true; scene.add(bg, cap);
  }
  // FG stanchions + velvet rope
  const ropeM = new THREE.MeshStandardMaterial({ color: 0x1f4a4c, roughness: 0.85, map: grainT });
  const postGeo = new THREE.LatheGeometry([[0, 0], [0.2, 0], [0.2, 0.04], [0.06, 0.08], [0.035, 0.12], [0.035, 0.9], [0.06, 0.94], [0.07, 1.0], [0.0, 1.04]].map(([a, b]) => new THREE.Vector2(a, b)), 28);
  const posts = [-48, -30, -12, 12, 30, 48].map((d) => { const a = d * D2R; return new THREE.Vector3(8.4 * Math.sin(a), 0, 8.4 * Math.cos(a)); });
  posts.forEach((p) => mesh(postGeo, brass, p.x, 0, p.z));
  for (let i = 0; i < posts.length - 1; i++) { const a = posts[i], b = posts[i + 1]; const pts = [];
    for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push(new THREE.Vector3(a.x + (b.x - a.x) * u, 0.92 - Math.sin(u * Math.PI) * 0.28, a.z + (b.z - a.z) * u)); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.035, 8), ropeM); }

  // ---------- centre: pedestal, AUDIRA band, empty aluminium VP chair ----------
  const ped = G(0, 0, 0);
  mesh(new THREE.LatheGeometry([[0, 0], [1.2, 0], [1.2, 0.04], [1.15, 0.06], [1.15, 0.36], [1.18, 0.38], [1.12, 0.41], [0, 0.41]].map(([a, b]) => new THREE.Vector2(a, b)), 72), walnut, 0, 0, 0, ped);
  mesh(new THREE.TorusGeometry(1.15, 0.018, 8, 96), brass, 0, 0.385, 0, ped).rotation.x = Math.PI / 2;
  const bandT = canvasTex(1024, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(210,176,122,.95)"; g.font = `900 92px ${ENG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("A U D I R A", w / 2, h / 2 + 4); });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.156, 1.156, 0.16, 48, 1, true, -0.62, 1.24), new THREE.MeshStandardMaterial({ map: bandT, transparent: true, metalness: 0.8, roughness: 0.25, emissive: 0xd2b07a, emissiveMap: bandT, emissiveIntensity: 0.25 }));
  band.position.y = 0.21; ped.add(band);
  const chair = G(0, 0.41, 0, ped);
  {
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const sp = mesh(rbox(0.07, 0.05, 0.42, 0.015), aluM, Math.sin(a) * 0.21, 0.07, Math.cos(a) * 0.21, chair); sp.rotation.y = a; mesh(new THREE.SphereGeometry(0.04, 12, 8), darkM, Math.sin(a) * 0.4, 0.04, Math.cos(a) * 0.4, chair); }
    mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 20), aluM, 0, 0.09, 0, chair);
    mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 16), aluM, 0, 0.28, 0, chair);
    mesh(rbox(0.36, 0.04, 0.34, 0.012), aluM, 0, 0.44, 0, chair);
    mesh(rbox(0.64, 0.1, 0.6, 0.045), aluM, 0, 0.51, 0, chair);
    mesh(rbox(0.56, 0.05, 0.52, 0.025), new THREE.MeshStandardMaterial({ color: 0x8d9198, map: grainT, roughness: 0.7, metalness: 0.1 }), 0, 0.575, 0.01, chair);
    const bs = new THREE.Shape(); bs.moveTo(-0.27, 0); bs.lineTo(0.27, 0); bs.lineTo(0.3, 0.62); bs.quadraticCurveTo(0.3, 0.86, 0, 0.88); bs.quadraticCurveTo(-0.3, 0.86, -0.3, 0.62); bs.closePath();
    const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3, curveSegments: 16 });
    const back = mesh(bg, aluM, 0, 0.56, -0.3, chair); back.rotation.x = -0.14;
    const bp2 = mesh(new THREE.ExtrudeGeometry(bs, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 16 }), new THREE.MeshStandardMaterial({ color: 0x8d9198, map: grainT, roughness: 0.7 }), 0, 0.6, -0.235, chair); bp2.rotation.x = -0.14; bp2.scale.set(0.86, 0.84, 1);
    for (const s of [-1, 1]) { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.3, 0.52, -0.22), new THREE.Vector3(s * 0.34, 0.78, -0.18), new THREE.Vector3(s * 0.34, 0.8, 0.12), new THREE.Vector3(s * 0.3, 0.55, 0.22)]);
      mesh(new THREE.TubeGeometry(c, 24, 0.025, 10), aluM, 0, 0, 0, chair); mesh(rbox(0.07, 0.03, 0.3, 0.012), new THREE.MeshStandardMaterial({ color: 0x8d9198, roughness: 0.6 }), s * 0.34, 0.815, -0.03, chair); }
  }
  // "12 NOV 2026" plaque (s2)
  const novT = plateTex("12 NOV 2026", { w: 768, h: 200, font: MONO, size: 0.5 });
  const nov = faced(1.0, 0.26, 0.04, novT, brass); scene.add(nov.m);
  // two blank "?" plates: the two names Prabowo will send (s1 promise, s7 out of the MPR slots, s8 in front of the chair)
  const qT = plateTex("?", { w: 340, h: 220, size: 0.8 });
  const qp = [-1, 1].map(() => { const f = faced(0.52, 0.34, 0.05, qT, brass); scene.add(f.m); return f; });

  // ---------- the four survey plinths ----------
  const CL = [
    { name: "KABINET", a: -72, cols: [["AMRAN", 19.3, "s3:Amran", "19,3"], ["YUSRIL", 14.3, "s3:Yusril", "14,3"], ["SJAFRIE", 10.2, "s3:Sjafrie", "10,2"]] },
    { name: "KEPALA DAERAH", a: -34, cols: [["DEDI", 33.7, "s4:Dedi", "33,7"], ["SHERLY", 19.4, "s4:Sherly", "19,4"], ["PRAMONO", 0, "s4:Pramono", ""]] },
    { name: "LEMBAGA NEGARA", a: 34, cols: [["PUAN", 21.4, "s5:Puan", "21,4"], ["SULTAN", 17.8, "s5:Sultan", "17,8"], ["MUZANI", 14.2, "s5:Muzani", "14,2"]] },
    { name: "KOALISI", a: 72, cols: [["SUFMI DASCO", 0, null, ""], ["AHY", 0, null, ""], ["ANIES", 0, null, ""]] },
  ];
  const HK = 0.06, PW = 2.2, PH = 0.75, PD = 1.3, TOP = PH + 0.03, XJ = [-0.66, 0, 0.66];
  const colGeo = rbox(0.42, 1, 0.42, 0.03); colGeo.translate(0, 0.5, 0);
  const capGeo = rbox(0.48, 0.06, 0.48, 0.015);
  const etchT = canvasTex(512, 640, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(235,250,250,.55)"; g.lineWidth = 2;
    for (let k = 1; k <= 7; k++) { const y = h - k * h / 8; g.beginPath(); g.moveTo(k % 2 ? 40 : 20, y); g.lineTo(w - (k % 2 ? 40 : 20), y); g.stroke(); }
    g.strokeStyle = "rgba(235,250,250,.8)"; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); });
  const plinths = CL.map((cl, c) => {
    const a = cl.a * D2R, g = G(RP * Math.sin(a), 0, RP * Math.cos(a)); g.rotation.y = a;
    mesh(rbox(PW, PH, PD, 0.04), walnut, 0, PH / 2, 0, g);
    mesh(rbox(PW + 0.04, 0.03, PD + 0.04, 0.01), brass, 0, PH + 0.015, 0, g);
    mesh(rbox(PW + 0.08, 0.05, PD + 0.08, 0.015), darkM, 0, 0.025, 0, g);
    const lab = faced(1.7, 0.2, 0.02, plateTex(cl.name, { w: 1024, h: 120, size: 0.6 }), brass); lab.m.position.set(0, 0.44, PD / 2 + 0.012); g.add(lab.m); lab.fm.emissiveIntensity = 0.12;
    // etched acrylic measuring board behind the columns (lines every 5 % of the scale)
    const brd = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), [acrylic][0]); brd.position.set(0, TOP + 1.25, -0.52); g.add(brd);
    const et = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), new THREE.MeshBasicMaterial({ map: etchT, transparent: true, depthWrite: false, opacity: 0.55 })); et.position.set(0, TOP + 1.25, -0.515); g.add(et);
    for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 12), aluM, s * 1.02, TOP + 1.3, -0.52, g);
    const cols = cl.cols.map(([nm, pct, anc, txt], j) => {
      const m = alu(); const col = mesh(colGeo, m, XJ[j], TOP, -0.1, g);
      const cap = mesh(capGeo, brass, XJ[j], TOP, -0.1, g);
      const tg = txt ? faced(0.38, 0.15, 0.015, plateTex(txt, { w: 320, h: 126, font: MONO, size: 0.72 }), brass) : null;
      if (tg) { tg.m.position.set(XJ[j], 0, -0.1 + 0.22); g.add(tg.m); tg.fm.emissiveIntensity = 0.1; }
      return { col, cap, m, tg, full: pct * HK, pct, anc, data: pct > 0 };
    });
    // KOALISI: three party blocks on the back of the plinth (they move to the President's desk in s6)
    const sl = [];
    for (let k = 0; k < 4; k++) { const s1 = spot(0, 0, 0, 0, 0, 0, k % 2 ? 0xffe9cf : 0xfff4e6, 0.36); sl.push(s1); }
    return { g, a, cols, sl, lab };
  });
  const PARTIES = ["PAN", "PKS", "DEMOKRAT"];
  const blocks = PARTIES.map((p) => { const f = faced(0.56, 0.28, 0.3, plateTex(p, { w: 512, h: 256, face: "alu", ink: "#1e2126", size: 0.5 }), walnut); scene.add(f.m); f.fm.metalness = 0.3; return f; });

  // ---------- name plates (12) ----------
  const NAMES = CL.flatMap((cl, c) => cl.cols.map(([nm], j) => ({ nm, c, j })));
  const plates = NAMES.map((n) => { const f = faced(0.6, 0.2, 0.035, plateTex(n.nm, { w: 512, h: 170 }), brass); scene.add(f.m); return { ...n, ...f }; });

  // ---------- President desk + calendar block (s6) ----------
  const desk = G(0, 0, -1.75);
  mesh(rbox(2.0, 0.8, 0.8, 0.035), walnut, 0, 0.4, 0, desk);
  mesh(rbox(2.12, 0.05, 0.9, 0.015), brass, 0, 0.825, 0, desk);
  const dpl = faced(1.1, 0.2, 0.02, plateTex("PRESIDEN", { w: 768, h: 140, size: 0.6 }), brass); dpl.m.position.set(0, 0.52, 0.41); desk.add(dpl.m); dpl.fm.emissiveIntensity = 0.15;
  const inl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.18), new THREE.MeshStandardMaterial({ map: plateTex("PRESIDEN", { w: 768, h: 140, size: 0.6 }), roughness: 0.45, metalness: 0.5 })); inl.rotation.x = -Math.PI / 2; inl.position.set(0, 0.852, 0.3); desk.add(inl);
  const cal = faced(0.62, 0.42, 0.1, plateTex("25 NOV", { w: 512, h: 340, font: MONO, size: 0.42, face: "alu", ink: "#1e2126" }), aluM); desk.add(cal.m);

  // ---------- arch, brass funnel, MPR box with two slots ----------
  const FZ = -2.2, FY = 5.7;
  for (const s of [-1, 1]) { mesh(rbox(0.22, 7.9, 0.22, 0.03), aluM, s * 2.5, 3.95, FZ); mesh(rbox(0.3, 0.06, 0.3, 0.015), brass, s * 2.5, 0.03, FZ); }
  mesh(rbox(5.24, 0.24, 0.24, 0.03), aluM, 0, 7.98, FZ);
  const funnel = mesh(new THREE.LatheGeometry([[0.3, 0], [0.34, 0.2], [0.5, 0.42], [1.0, 0.92], [1.5, 1.42], [1.62, 1.52], [1.58, 1.58], [1.46, 1.48], [0.92, 0.95], [0.42, 0.45], [0.26, 0.2], [0.24, 0]].map(([a, b]) => new THREE.Vector2(a, b)), 64), new THREE.MeshStandardMaterial({ color: C.brass, map: brassT, roughness: 0.24, metalness: 0.85, side: THREE.DoubleSide }), 0, FY, FZ);
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.5; mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 6), aluM, Math.sin(a) * 1.5, 7.6, FZ + Math.cos(a) * 1.5); }
  mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.3, 24), brass, 0, 5.55, FZ);
  const mpr = G(0, 4.95, FZ);
  mesh(rbox(2.3, 0.9, 0.9, 0.04), walnut, 0, 0, 0, mpr);
  const mprL = faced(1.0, 0.24, 0.02, plateTex("MPR", { w: 512, h: 124, size: 0.72 }), brass); mprL.m.position.set(0, 0.22, 0.455); mpr.add(mprL.m);
  for (const s of [-1, 1]) { mesh(rbox(0.74, 0.1, 0.06, 0.02), darkM, s * 0.48, -0.2, 0.43, mpr); mesh(rbox(0.86, 0.03, 0.08, 0.01), brass, s * 0.48, -0.27, 0.44, mpr); }

  // ---------- spots ----------
  const chairSpot = spot(0.8, 7, 3.2, 0, 0.9, 0, 0xfff0dc, 0.3);
  const funnelSpot = spot(0, 10.5, 4, 0, 5.2, FZ, 0xfff0dc, 0.32);
  const deskSpot = spot(0.5, 7.5, 0.5, 0, 0.8, -1.75, 0xffe6c8, 0.26);

  // ---------- camera ----------
  const PP = (c, dy) => { const a = CL[c].a * D2R; return [RP * Math.sin(a), dy, RP * Math.cos(a)]; };
  const cam = track([
    [0, -1.3, 1.3, 1.5, -4, 11, 15.5, 32],
    [A("s1:kosong"), 0, 1.25, 0.2, 2, 8, 11.5, 30],
    [A("s1:2"), 0, 1.35, 0.3, 0, 8, 11.8, 30],
    [K.s1e, 0, 1.4, 0.5, 4, 10, 13, 30],
    [A("s2:Prabowo"), 0, 1.5, 1.4, 3, 15, 22, 33],
    [A("s2:klaster"), 0, 1.6, 2.2, -4, 17, 30, 36],
    [K.s2e, -1.4, 1.4, 2.0, -16, 14, 24, 34],
    [A("s3:Amran"), ...PP(0, 1.15), -46, 8, 12.5, 30],
    [K.s3e, ...PP(0, 1.15), -32, 7, 12, 30],
    [A("s4:Dedi"), ...PP(1, 1.45), -20, 7, 14.5, 30],
    [A("s4:33,7") + 0.3, ...PP(1, 1.6), -13, 9, 14.8, 30],
    [K.s4e, ...PP(1, 1.5), -4, 8, 14.2, 30],
    [A("s5:Puan"), ...PP(2, 1.3), 40, 8, 14, 30],
    [K.s5e, ...PP(2, 1.3), 24, 7, 13.6, 30],
    [A("s6:Presiden"), 0.4, 0.8, -0.9, 10, 62, 15, 34],
    [A("s6:Demokrat"), 0.9, 0.8, -0.9, 22, 60, 15, 34],
    [K.s6e, 2.8, 0.6, 0.6, 48, 22, 12, 32],
    [A("s7:Dasco"), ...PP(3, 0.8), 48, 10, 10, 30],
    [A("s7:Gerindra"), ...PP(3, 0.85), 40, 9, 10.5, 30],
    [A("s7:2"), 0, 5.5, FZ, 8, -2, 12.5, 30],
    [K.s7e, 0, 5.35, FZ, 3, -6, 10.5, 30],
    [A("s8:nama"), 0, 1.4, 0.6, 0, 6, 13, 32],
    [K.end, 0, 1.5, 0.5, -3, 5, 21, 34],
    [K.dur, 0, 1.55, 0.5, -4, 5, 22, 34],
  ]);

  // ---------- helpers for the timeline ----------
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
  const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qL = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.26, 0, 0));
  const ORANGE = new THREE.Color(C.orange), ALU = new THREE.Color(C.alu), BR = new THREE.Color(C.brass), WHITE = new THREE.Color(0xffffff);
  const MOUTH = new THREE.Vector3(0, FY + 1.75, FZ);
  const bez = (a, c, b, u, out) => { const m = 1 - u; return out.set(m * m * a.x + 2 * m * u * c.x + u * u * b.x, m * m * a.y + 2 * m * u * c.y + u * u * b.y, m * m * a.z + 2 * m * u * c.z + u * u * b.z); };
  const hero = (c, j, t) => {
    if (c === 1 && j === 0) return Math.max(1 - ramp(t, K.s2e - 1.6, K.s2e - 0.6), ramp(t, A("s4:Dedi"), A("s4:Dedi") + 0.6) * (1 - ramp(t, K.s4e - 0.2, K.s5 + 0.4)));
    if (c === 0 && j === 0) return ramp(t, A("s3:Amran"), A("s3:Amran") + 0.6) * (1 - ramp(t, K.s3e - 0.2, K.s4 + 0.4));
    if (c === 2 && j === 0) return ramp(t, A("s5:Puan"), A("s5:Puan") + 0.6) * (1 - ramp(t, K.s5e - 0.2, K.s6 + 0.4));
    return 0;
  };
  // which plinth is "on stage": 0..3, with s2 'klaster' lighting them one after another
  const active = (c, t) => {
    const sc = [["s3", "s3e"], ["s4", "s4e"], ["s5", "s5e"], ["s7", "s7e"]][c];
    let v = ramp(t, K[sc[0]] - 0.6, K[sc[0]] + 0.3) * (1 - ramp(t, K[sc[1]] - 0.2, K[sc[1]] + 0.6));
    const p = A("s2:klaster") + c * 0.38; v = Math.max(v, ramp(t, p - 0.15, p + 0.1) * (1 - ramp(t, p + 0.5, K.s2e)) * 0.8);
    if (c === 3) v = Math.max(v, ramp(t, A("s6:PAN") - 0.8, A("s6:PAN")) * (1 - ramp(t, A("s6:kepadanya"), K.s6e)));
    return v;
  };

  return (t) => {
    grade.uniforms.uT.value = t;
    // turntable plinths, chair turns slowly
    plinths.forEach((p, c) => { p.g.rotation.y = p.a + Math.sin(0.35 * t + c * 0.9) * 0.2 * 0.6; p.g.updateMatrixWorld(true); });
    chair.rotation.y = Math.sin(0.3 * t) * 0.22;

    // ---- columns: full in the hook, sink at the end of s2, regrow on each name ----
    plinths.forEach((p, c) => {
      const act = active(c, t);
      p.cols.forEach((o, j) => {
        let h = 0.03;
        if (o.data) { const pre = 1 - ramp(t, K.s2e - 1.4, K.s3 + 0.1); const gr = eout(clamp01((t - A(o.anc) - 0.05) / 1.25)); h = Math.max(0.03, o.full * Math.max(pre, gr)); }
        else if (c === 1) h = 0.1;
        o.col.scale.set(1, h, 1); o.col.visible = c < 3; o.cap.visible = c < 3;
        o.cap.position.y = TOP + h + 0.03;
        const hk = hero(c, j, t);
        o.m.color.copy(ALU).lerp(ORANGE, hk); o.m.emissive.copy(ALU).lerp(ORANGE, hk); o.m.emissiveIntensity = 0.03 + 0.22 * hk; o.m.metalness = 0.18 - 0.05 * hk; o.m.roughness = 0.28 + 0.07 * hk;
        if (o.tg) { o.tg.m.visible = h > 0.32; o.tg.m.position.y = TOP + h - 0.12; o.tg.fm.emissiveIntensity = 0.08 + 0.25 * act; }
      });
      // two spots per plinth, from the front, brighter when the plinth is on stage
      const s6dim = 1 - 0.45 * ramp(t, K.s6, K.s6 + 0.8) * (1 - ramp(t, K.s7 - 0.4, K.s7 + 0.4));
      p.sl.forEach((s, k) => {
        const side = k % 2 ? 1 : -1, hi = k < 2;
        vA.set(side * (hi ? 1.2 : 1.6), hi ? 6.2 : 3.2, hi ? 2.8 : 4.2); p.g.localToWorld(vA); s.position.copy(vA);
        vB.set(0, hi ? 1.3 : 0.6, 0); p.g.localToWorld(vB); s.target.position.copy(vB); s.target.updateMatrixWorld();
        s.intensity = (hi ? 1 : 0.4) * (30 + 85 * act) * s6dim;
      });
      p.lab.fm.emissiveIntensity = 0.1 + 0.3 * act;
    });

    // ---- 12 name plates: on their plinths; stack beside the chair in s1; fly into the funnel in s7 ----
    plates.forEach((pl, i) => {
      const p = plinths[pl.c];
      vA.set(XJ[pl.j], TOP + 0.13, 0.36); p.g.localToWorld(vA); qA.copy(p.g.quaternion).multiply(qL);
      const side = i < 6 ? -1 : 1, row = i < 6 ? 5 - i : 11 - i;
      vB.set(side * 0.97, 0.55 + row * 0.3, 0.45); qB.setFromEuler(new THREE.Euler(0, -side * 0.2, 0));
      const k1 = ramp(t, A("s1:12") - 0.6 + i * 0.05, A("s1:12") + 0.5 + i * 0.05), k2 = ramp(t, A("s2:Gibran") + i * 0.07, A("s2:resmi") + i * 0.07);
      const ks = k1 * (1 - k2);
      vC.copy(vA).lerp(vB, ks); vC.y += Math.sin(ks * Math.PI) * 0.5;
      pl.m.quaternion.copy(qA).slerp(qB, ks);
      let sc = 1;
      const u = clamp01((t - (A("s7:Dari") - 0.4 + i * 0.1)) / 1.6);
      if (u > 0) {
        const e = smooth(u); vB.set((vC.x + MOUTH.x) / 2, Math.max(vC.y, MOUTH.y) + 1.6, (vC.z + MOUTH.z) / 2);
        bez(vC.clone(), vB, MOUTH, e, vC); pl.m.quaternion.slerp(qB.setFromEuler(new THREE.Euler(-0.3, 0, (i % 2 ? 1 : -1) * 0.4 * e)), e);
        sc = 1 - smooth((u - 0.82) / 0.18);
      }
      pl.m.position.copy(vC); pl.m.scale.setScalar(Math.max(0.001, sc)); pl.m.visible = sc > 0.01;
      // dim in the hook (only two will remain), Dasco glows orange in s7
      const dim = 1 - 0.62 * ramp(t, A("s1:2") - 0.1, A("s1:2") + 0.3) * (1 - k2);
      const dz = pl.c === 3 && pl.j === 0 ? ramp(t, A("s7:Dasco") - 0.2, A("s7:Dasco") + 0.3) : 0;
      pl.fm.color.copy(WHITE).multiplyScalar(dim).lerp(ORANGE, dz * 0.85);
      pl.fm.emissive.copy(WHITE).lerp(ORANGE, dz);
      pl.fm.emissiveIntensity = (0.06 + 0.2 * ks * (dim > 0.6 ? 1 : 0.3)) * (1 - dz) + 0.7 * dz + 0.06 * active(pl.c, t) * (1 - dz);
    });

    // ---- the two "?" plates ----
    const popA = back(ramp(t, A("s1:2") - 0.1, A("s1:2") + 0.35), 1.5) * (1 - ramp(t, K.s2 - 0.2, K.s2 + 0.4));
    const outB = ramp(t, A("s7:2") - 0.1, A("s7:MPR") + 0.4), downC = ramp(t, K.s8 - 0.2, A("s8:nama") + 0.6);
    qp.forEach((q, k) => {
      const s = k ? 1 : -1;
      if (t < K.s7) { q.m.position.set(s * 0.3, 1.32 + 0.04 * Math.sin(t * 1.3 + k), 0.98); q.m.rotation.set(0, -s * 0.12, 0); q.m.scale.setScalar(Math.max(0.001, popA)); q.m.visible = popA > 0.01; }
      else {
        vA.set(s * 0.48, 4.75, FZ + 0.05); vB.set(s * 0.48, 4.62, FZ + 1.05); vC.copy(vA).lerp(vB, eout(outB));
        vA.set(s * 0.3, 1.32 + 0.04 * Math.sin(t * 1.3 + k), 0.98); bez(vC.clone(), vB.set(s * 0.6, 4.2, 0.4), vA, smooth(downC), vC);
        q.m.position.copy(vC); q.m.rotation.set(0, -s * 0.12 * downC, 0); q.m.scale.setScalar(1); q.m.visible = t > A("s7:2") - 0.2;
      }
      q.fm.emissiveIntensity = 0.35 + 0.25 * Math.max(popA, outB);
    });

    // ---- 12 NOV plaque (s2) ----
    const nk = back(ramp(t, A("s2:November") - 0.2, A("s2:November") + 0.25), 1.4) * (1 - ramp(t, K.s3 - 0.3, K.s3 + 0.3));
    nov.m.position.set(0, 0.41 + 0.15, 0.98); nov.m.rotation.set(-0.3, 0, 0); nov.m.scale.setScalar(Math.max(0.001, nk)); nov.m.visible = nk > 0.01; nov.fm.emissiveIntensity = 0.25;

    // ---- s6: President desk rises, calendar, party blocks travel to the desk ----
    const dk = eout(ramp(t, A("s6:Presiden") - 0.4, A("s6:Presiden") + 0.8));
    desk.position.y = -0.95 * (1 - dk); desk.visible = dk > 0.01;
    const ck = back(ramp(t, A("s6:25") - 0.15, A("s6:25") + 0.3), 1.6);
    cal.m.position.set(0, 0.85 + 0.22, -0.2); cal.m.rotation.set(-0.62, 0, 0); cal.m.scale.setScalar(Math.max(0.001, ck)); cal.m.visible = ck > 0.01; cal.fm.emissiveIntensity = 0.15 + 0.2 * ck;
    blocks.forEach((b, k) => {
      const p = plinths[3]; vA.set(XJ[k], TOP + 0.14, -0.38); p.g.localToWorld(vA); qA.copy(p.g.quaternion);
      vB.set(-0.68 + k * 0.68, 0.85 + 0.14 + desk.position.y, -1.75 + 0.18); qB.identity();
      const u = smooth(clamp01((t - (A("s6:PAN") - 0.3 + k * 0.42)) / 1.4));
      vC.copy(vA).lerp(vB, u); vC.y += Math.sin(u * Math.PI) * 1.5;
      b.m.position.copy(vC); b.m.quaternion.copy(qA).slerp(qB, u); b.fm.emissiveIntensity = 0.06 + 0.25 * Math.sin(u * Math.PI);
    });

    // ---- lights ----
    chairSpot.intensity = 90 * (1 - 0.55 * ramp(t, K.s3 - 0.5, K.s3 + 0.5)) * (1 - 0.6 * ramp(t, K.s6 - 0.5, K.s6 + 0.5) * (1 - ramp(t, K.s7, K.s7 + 1))) + 50 * ramp(t, K.s8 - 0.5, K.s8 + 0.5);
    funnelSpot.intensity = 30 + 170 * ramp(t, A("s7:Gerindra") - 0.5, A("s7:2"));
    deskSpot.intensity = 32 * dk * (1 - 0.6 * ramp(t, K.s7, K.s7 + 1));
    wall.material.emissiveIntensity = 0.85 + 0.15 * Math.sin(t * 0.4);

    // ---- camera ----
    const [tx, ty, tz, yaw, pitch, dist, fov] = cam(t);
    const y = yaw * D2R, pc = pitch * D2R;
    cam_.position.set(tx + dist * Math.sin(y) * Math.cos(pc) + 0.14 * Math.sin(t * 0.5), ty + dist * Math.sin(pc) + 0.07 * Math.sin(t * 0.37), tz + dist * Math.cos(y) * Math.cos(pc));
    cam_.fov = fov; cam_.updateProjectionMatrix(); cam_.lookAt(tx, ty, tz);
    key.target.position.set(0, 0, 1); key.target.updateMatrixWorld();
    comp.render();
  };
}
