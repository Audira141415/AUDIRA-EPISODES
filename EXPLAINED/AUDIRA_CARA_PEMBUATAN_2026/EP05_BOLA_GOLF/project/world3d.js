// EP05 BOLA GOLF (INNERWORKS): one bright cream studio laid out as a line of stations, read left to right.
// Clean studio light (key + rim + soft strips), mint and orange accents, white precise parts, cutaway wedges with
// layer caps and leader labels like the quality-bar cover. Stations: hero cutaway ball, old gum ball, core mill + press,
// layer build + two-half dimple mould, finishing line (flash trim, paint spindle, pad print, clear coat, x-ray, robot
// hitter), wind tunnel (smooth vs dimpled wake), flight range, closing hero.
// Illustration only: own simplified machines, no brands, no real packaging. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std, stage, pts, envStrips, label } from "./lib3d.js";

const C = { bg: 0xeef1ea, floor: 0xe6e9e1, mint: 0x34d399, mintD: 0x0f9f74, teal: 0x0f766e, orange: 0xf97316, navy: 0x0f172a, steel: 0xc3ccd3, white: 0xf7f8f5 };

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };

// ---------- dimpled sphere: radius 1, spherical-cap dimples on a Fibonacci layout ----------
let _dg = null;
function dimpleGeo() {
  if (_dg) return _dg;
  const g = new THREE.SphereGeometry(1, 240, 170);
  const N = 392, cen = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), a = i * ga; cen.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
  const rd = 0.088, cosR = Math.cos(rd), depth = 0.022;
  const p = g.attributes.position;
  for (let v = 0; v < p.count; v++) {
    const x = p.getX(v), y = p.getY(v), z = p.getZ(v);
    let best = -1;
    for (let i = 0; i < N; i++) { const c = cen[i], d = c[0] * x + c[1] * y + c[2] * z; if (d > best) best = d; }
    let s = 1;
    if (best > cosR) { const a = Math.acos(Math.min(1, best)) / rd; s = 1 - depth * (1 - a * a); }
    p.setXYZ(v, x * s, y * s, z * s);
  }
  g.computeVertexNormals();
  _dg = g;
  return g;
}

// ---------- two-half mould: extruded block with a hemispherical cavity, parting plane at local z = 0 ----------
function mouldHalf(R, mat, cavMat) {
  const G = new THREE.Group();
  const s = new THREE.Shape(); const w = 1.2 * R;
  s.moveTo(-w, -w); s.lineTo(w, -w); s.lineTo(w, w); s.lineTo(-w, w); s.lineTo(-w, -w);
  const h = new THREE.Path(); h.absarc(0, 0, R * 1.03, 0, Math.PI * 2, true); s.holes.push(h);
  const blk = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.08 * R, bevelEnabled: true, bevelSize: 0.04 * R, bevelThickness: 0.04 * R, bevelSegments: 2, curveSegments: 48 }), mat);
  blk.castShadow = blk.receiveShadow = true; G.add(blk);
  const cav = new THREE.Mesh(new THREE.SphereGeometry(R * 1.03, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), cavMat);
  cav.rotation.x = Math.PI / 2; G.add(cav);
  // bolt heads on the outer side faces and a dark rim on the parting face, so a closed mould still reads as two halves
  const bm = new THREE.MeshStandardMaterial({ color: 0x5b6670, roughness: 0.35, metalness: 0.6 });
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [0.3, 0.75]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * R, 0.07 * R, 0.06 * R, 12), bm); b.rotation.z = Math.PI / 2; b.position.set(sx * (w + 0.04 * R), sy * 0.62 * w, sz * 1.08 * R); G.add(b); }
  const rimM = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });
  for (const [bw, bh, x, y] of [[2 * w + 0.1 * R, 0.08 * R, 0, w], [2 * w + 0.1 * R, 0.08 * R, 0, -w], [0.08 * R, 2 * w, w, 0], [0.08 * R, 2 * w, -w, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.05 * R), rimM); b.position.set(x, y, 0.02 * R); G.add(b); }
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.bg, fog: 0.011, exp: 1.0, bloom: [0.12, 0.4, 0.95] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0; r.localClippingEnabled = true;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  envStrips(r, scene, [[6, 2, 0xffffff, 2.2, -4, 5, 3], [2, 6, 0xffffff, 1.4, 5, 2, 4], [8, 1, 0xdff7ec, 1.0, 0, 6, -5], [4, 4, 0xffe4cc, 0.6, -6, 1, -3]], 0xb9c2bb);
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d3cb, 1.0));
  const key = new THREE.DirectionalLight(0xfff6ea, 2.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 40 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xd9fff1, 1.3); scene.add(rim, rim.target);
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const add = (m, p = scene) => { m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return add(m, p); };

  // ---------- floor: pale studio sweep with a faint mint grid ----------
  const gridT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#e6e9e1"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(15,159,116,.10)"; g.lineWidth = 2; g.strokeRect(0, 0, w, w); g.strokeStyle = "rgba(15,23,42,.04)"; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, w); g.moveTo(0, w / 2); g.lineTo(w, w / 2); g.stroke(); }, [80, 16]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 48), std(0xffffff, 0.85, 0, { map: gridT })); floor.rotation.x = -Math.PI / 2; floor.position.set(35, 0, -6); floor.receiveShadow = true; scene.add(floor);
  const wallB = new THREE.Mesh(new THREE.PlaneGeometry(240, 30), std(0xe9ede5, 0.95)); wallB.position.set(35, 15, -24); scene.add(wallB);

  const M = {
    white: () => new THREE.MeshPhysicalMaterial({ color: C.white, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.25, side: THREE.DoubleSide }),
    core: () => new THREE.MeshPhysicalMaterial({ color: C.orange, roughness: 0.55, metalness: 0, sheen: 0.4, side: THREE.DoubleSide }),
    mantle: () => new THREE.MeshPhysicalMaterial({ color: C.mint, roughness: 0.3, metalness: 0, clearcoat: 0.6, side: THREE.DoubleSide }),
  };
  const steel = std(0xdde3e8, 0.32, 0.4), steelD = std(0x7d8a94, 0.35, 0.8), mintM = std(C.mint, 0.45, 0.05), whiteM = std(0xf4f6f1, 0.6), navyM = std(C.navy, 0.5, 0.2), orangeM = std(C.orange, 0.5);

  // ---------- cutaway ball: core / mantle / cover with an open wedge (x>0, z>0 removed) and layer caps ----------
  const LR = [0.6, 0.82, 1.0];
  function ball(R, { wedge = true, dimple = true } = {}) {
    const G = new THREE.Group(); G.scale.setScalar(R); scene.add(G);
    const local = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
    const planes = wedge ? [local[0].clone(), local[1].clone()] : [];
    const mk = (f) => { const m = f(); if (wedge) { m.clippingPlanes = planes; m.clipIntersection = true; } return m; };
    const coreM = mk(M.core), mantM = mk(M.mantle), covM = mk(M.white);
    const core = mesh(new THREE.SphereGeometry(LR[0], 64, 48), coreM, 0, 0, 0, G);
    const mantle = mesh(new THREE.SphereGeometry(LR[1], 72, 54), mantM, 0, 0, 0, G);
    const cover = mesh(dimple ? dimpleGeo() : new THREE.SphereGeometry(1, 96, 72), covM, 0, 0, 0, G);
    const caps = [];
    if (wedge) {
      const capMat = [std(C.orange, 0.6), std(C.mint, 0.5), std(0xffffff, 0.55)].map((m) => { m.side = THREE.DoubleSide; m.polygonOffset = true; m.polygonOffsetFactor = -1; return m; });
      for (let i = 0; i < 3; i++) {
        const r0 = i ? LR[i - 1] : 0, r1 = LR[i];
        const a = new THREE.Mesh(new THREE.RingGeometry(r0 + 0.002, r1 - 0.004, 72, 1, -Math.PI / 2, Math.PI), capMat[i]); // plane z=0, x>=0
        const b = a.clone(); b.rotation.y = -Math.PI / 2; // plane x=0, z>=0
        G.add(a, b); caps.push([a, b]);
      }
      // thin dark seam on the cut edges reads as a precise section line
      const edge = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.55 });
      for (const rr of LR) {
        const q = []; for (let i = 0; i <= 48; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 48; q.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0.003)); }
        const l1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(q), edge); const l2 = l1.clone(); l2.rotation.y = -Math.PI / 2; G.add(l1, l2);
      }
    }
    const sync = () => { if (!wedge) return; G.updateMatrixWorld(true); planes[0].copy(local[0]).applyMatrix4(G.matrixWorld); planes[1].copy(local[1]).applyMatrix4(G.matrixWorld); };
    return { G, core, mantle, cover, caps, coreM, mantM, covM, sync };
  }
  function print(text, size, color = "#0f172a") {
    return label(text, { w: 512, h: 160, font: "800 96px Arial", color, size });
  }
  function decal(b, text, dir, size) {
    const d = new THREE.Vector3(...dir).normalize(), m = print(text, size, "#0f766e");
    m.material.depthWrite = false; m.material.toneMapped = true;
    m.position.copy(d.clone().multiplyScalar(1.004)); m.lookAt(d.clone().multiplyScalar(3)); b.G.add(m); return m;
  }
  // billboard leader labels (white pill, mint dot, dark text) like the cover reference
  const bills = [];
  function tag(text, pos, to, parent = scene) {
    const mc = document.createElement("canvas").getContext("2d"); mc.font = "800 54px Arial"; const TW = Math.ceil(mc.measureText(text).width) + 130;
    const tx = canvasTex(TW, 120, (g, w, h) => { g.fillStyle = "rgba(236,241,237,.97)"; const rr = 56; g.beginPath(); g.moveTo(rr, 4); g.arcTo(w - 4, 4, w - 4, h - 4, rr); g.arcTo(w - 4, h - 4, 4, h - 4, rr); g.arcTo(4, h - 4, 4, 4, rr); g.arcTo(4, 4, w - 4, 4, rr); g.fill(); g.fillStyle = "#10b981"; g.beginPath(); g.arc(58, h / 2, 16, 0, 7); g.fill(); g.fillStyle = "#0f172a"; g.font = "800 54px Arial"; g.textBaseline = "middle"; g.fillText(text, 92, h / 2 + 3); });
    const s = 1.0;
    // labels draw on top (no depth test, no fog) so a pill behind a part or a glass ring never fades out
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s * TW / 120 * 0.25, 0.25), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false }));
    m.position.copy(pos); m.renderOrder = 20; parent.add(m);
    const lm = new THREE.LineBasicMaterial({ color: 0x0f766e, transparent: true, depthTest: false, fog: false });
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([to, pos]), lm); ln.renderOrder = 19; parent.add(ln);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, depthTest: false, fog: false })); dot.position.copy(to); dot.renderOrder = 19; parent.add(dot);
    const o = { m, ln, dot, set(a) { m.material.opacity = a; lm.opacity = a; dot.material.opacity = a; m.visible = ln.visible = dot.visible = a > 0.01; } };
    bills.push(m); return o;
  }
  const pedestal = (x, y, z, rr = 0.9) => { mesh(new THREE.CylinderGeometry(rr, rr * 1.08, y, 48), whiteM, x, y / 2, z); mesh(new THREE.TorusGeometry(rr * 1.02, 0.03, 8, 64), mintM, x, y, z).rotation.x = Math.PI / 2; };

  // ================= H1: hero cutaway ball (s1) =================
  const H1 = ball(1.0); H1.G.position.set(0, 1.75, 0); pedestal(0, 0.62, 0, 0.75);
  decal(H1, "AUDIRA", [-0.55, 0.22, 0.8], 0.62);
  const scanRing = mesh(new THREE.TorusGeometry(1.32, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: C.mintD, transparent: true, opacity: 0.8 }), 0, 1.75, 0);
  const tagsH1 = [tag("INTI", new THREE.Vector3(1.2, 2.85, 0.3), new THREE.Vector3(0.3, 1.85, 0.01)),
    tag("LAPISAN TENGAH", new THREE.Vector3(1.55, 2.45, 0.3), new THREE.Vector3(0.7, 1.55, 0.01)),
    tag("KULIT + DIMPLE", new THREE.Vector3(1.45, 2.05, 0.3), new THREE.Vector3(0.95, 1.55, 0.3))];

  // ================= B: old gum ball (s2) =================
  const BX = 9;
  mesh(new THREE.BoxGeometry(1.8, 0.5, 1.4), std(0x9a6b45, 0.7), BX, 0.25, 0);
  const gum = mesh(new THREE.SphereGeometry(0.62, 64, 48), new THREE.MeshPhysicalMaterial({ color: 0x5a3b26, roughness: 0.45, clearcoat: 0.3 }), BX, 1.12, 0);
  const scrT = canvasTex(1024, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const R2 = mulberry(19); g.strokeStyle = "rgba(225,196,160,.95)"; g.lineCap = "round"; for (let i = 0; i < 90; i++) { const x = R2() * w, y = 60 + R2() * (h - 120), a = (R2() - 0.5) * 0.7, l = 30 + R2() * 70; g.lineWidth = 3 + R2() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } });
  const scr = mesh(new THREE.SphereGeometry(0.625, 64, 48), new THREE.MeshStandardMaterial({ map: scrT, transparent: true, roughness: 0.6, depthWrite: false }), BX, 1.12, 0); scr.castShadow = false;
  const knife = new THREE.Group(); scene.add(knife);
  mesh(new THREE.BoxGeometry(1.1, 0.16, 0.025), std(0xdfe5ea, 0.2, 0.95), 0.55, 0, 0, knife);
  mesh(new THREE.BoxGeometry(0.6, 0.2, 0.12), std(0x3b2a1e, 0.6), -0.3, 0, 0, knife);
  const tagB = tag("BOLA GETAH", new THREE.Vector3(BX + 0.6, 1.84, 0.62), new THREE.Vector3(BX + 0.35, 1.5, 0.4));

  // ================= C: core mill + core press (s3) =================
  const CX = 17.2;
  const bev = (w, h, d, b = 0.04) => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2); const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2 }); g.translate(0, 0, -(d - 2 * b) / 2); return g; };
  const chrome = std(0xe8edf1, 0.16, 0.92), boltM = std(0x3f4a54, 0.35, 0.7), hexBolt = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6);
  const millG = new THREE.Group(); millG.position.set(CX, 0, 0); scene.add(millG);
  // two-roll mill: rolls side by side (front/back), nip on top, rubber band wrapped on the front roll
  mesh(bev(3.3, 0.3, 2.6), steelD, 0, 0.15, 0, millG);
  for (const sx of [-1.45, 1.45]) for (const sz of [-1.1, 1.1]) mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 16), navyM, sx, 0.04, sz, millG);
  const hs = new THREE.Shape(); { const a = -1.15, b = 1.15, y0 = 0.3, y1 = 2.3, cr = 0.32; hs.moveTo(a, y0); hs.lineTo(b, y0); hs.lineTo(b, y1 - cr); hs.quadraticCurveTo(b, y1, b - cr, y1); hs.lineTo(a + cr, y1); hs.quadraticCurveTo(a, y1, a, y1 - cr); hs.lineTo(a, y0); }
  const hGeo = new THREE.ExtrudeGeometry(hs, { depth: 0.2, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3, curveSegments: 12 });
  const RY = 1.55, RZ = 0.53, RR = 0.5;
  for (const sx of [-1, 1]) {
    const h = mesh(hGeo, mintM, sx > 0 ? 1.18 : -1.42, 0, 0, millG); h.rotation.y = Math.PI / 2;
    const ox = sx * 1.47;
    for (const z of [-RZ, RZ]) {
      mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.1, 32), steel, ox, RY, z, millG).rotation.z = Math.PI / 2;
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; const b = mesh(hexBolt, boltM, ox + sx * 0.06, RY + Math.cos(a) * 0.22, z + Math.sin(a) * 0.22, millG); b.rotation.z = Math.PI / 2; }
    }
    for (const [y, z] of [[0.55, -0.9], [0.55, 0.9], [2.05, -0.85], [2.05, 0.85]]) { const b = mesh(hexBolt, boltM, ox - sx * 0.02, y, z, millG); b.rotation.z = Math.PI / 2; }
  }
  // tie bar across the top + hopper with the zinc diacrylate powder
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.9, 16), chrome, 0, 2.2, -1.0, millG).rotation.z = Math.PI / 2;
  const hop = mesh(new THREE.CylinderGeometry(0.62, 0.16, 0.7, 40, 1, true), std(0xdfe5ea, 0.3, 0.6, { side: THREE.DoubleSide }), 0, 3.25, 0, millG);
  mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 48), mintM, 0, 3.6, 0, millG).rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) { const s = mesh(new THREE.BoxGeometry(0.06, 1.25, 0.06), steelD, sx * 0.85, 2.85, -0.2, millG); s.rotation.z = sx * 0.45; }
  const rollProf = [new THREE.Vector2(0, -1.15), new THREE.Vector2(RR - 0.06, -1.15), new THREE.Vector2(RR, -1.09), new THREE.Vector2(RR, 1.09), new THREE.Vector2(RR - 0.06, 1.15), new THREE.Vector2(0, 1.15)];
  const rollGeo = new THREE.LatheGeometry(rollProf, 64);
  const bandT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#ee8233"; g.fillRect(0, 0, w, h); const R2 = mulberry(41); for (let i = 0; i < 260; i++) { g.fillStyle = R2() < 0.6 ? "rgba(255,236,214,.55)" : "rgba(170,70,20,.35)"; g.beginPath(); g.ellipse(R2() * w, R2() * h, 3 + R2() * 9, 1.5 + R2() * 3, 0, 0, 7); g.fill(); } });
  const rolls = [RZ, -RZ].map((z, i) => {
    const g = new THREE.Group(); g.position.set(0, RY, z); millG.add(g);
    const inner = new THREE.Group(); inner.rotation.z = Math.PI / 2; g.add(inner);
    mesh(rollGeo, chrome, 0, 0, 0, inner);
    mesh(new THREE.CylinderGeometry(0.11, 0.11, 3.3, 16), steel, 0, 0, 0, inner);
    if (i === 0) mesh(new THREE.CylinderGeometry(RR + 0.035, RR + 0.035, 1.9, 64, 1, false), std(0xffffff, 0.7, 0, { map: bandT }), 0, 0, 0, inner);
    else for (const k of [0, 2.1, 4.2]) { const s = mesh(new THREE.BoxGeometry(0.015, 2.1, 0.015), boltM, Math.cos(k) * RR, 0, Math.sin(k) * RR, inner); s.castShadow = false; }
    // drive gear outside the left housing
    const gear = new THREE.Group(); gear.position.set(0, -1.66, 0); inner.add(gear);
    mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.1, 40), steelD, 0, 0, 0, gear);
    for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2 + i * 0.14; const tth = mesh(new THREE.BoxGeometry(0.1, 0.1, 0.08), steelD, Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5, gear); tth.rotation.y = -a; }
    return g;
  });
  const bank = mesh(new THREE.CylinderGeometry(0.19, 0.19, 1.8, 32), std(0xf08a3e, 0.65, 0, { map: bandT }), 0, RY + 0.43, 0, millG); bank.rotation.z = Math.PI / 2;
  // sheet peeling off the front roll into a tray, motor + guard rail behind
  const sheet = mesh(new THREE.BoxGeometry(1.8, 0.95, 0.035), std(0xffffff, 0.7, 0, { map: bandT }), CX, 0.92, RZ + 0.58); sheet.rotation.x = 0.18;
  mesh(bev(2.2, 0.08, 0.7, 0.02), steel, 0, 0.36, 1.0, millG);
  mesh(bev(0.8, 1.0, 0.9), navyM, 2.3, 0.5, -0.8, millG);
  for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.82, 0.04, 0.92), steelD, 2.3, 0.15 + k * 0.14, -0.8, millG).castShadow = false;
  const powder = pts(scene, 140, { color: 0x8696ad, size: 0.075, add: false, opacity: 0.95 });
  const powSeed = Array.from({ length: 140 }, (_, i) => { const R2 = mulberry(300 + i); return [R2(), R2(), R2()]; });
  // conveyor + slugs
  const CVX = CX + 2.6, CVL = 1.55;
  mesh(new THREE.BoxGeometry(CVL, 0.06, 0.62), navyM, CVX, 0.89, 0);
  for (const e of [-1, 1]) mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 20), chrome, CVX + e * CVL / 2, 0.84, 0).rotation.x = Math.PI / 2;
  for (const z of [-0.36, 0.36]) mesh(new THREE.BoxGeometry(CVL + 0.2, 0.12, 0.04), steel, CVX, 0.9, z);
  for (const e of [-0.6, 0.6]) for (const z of [-0.3, 0.3]) mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), steelD, CVX + e, 0.4, z);
  const slugs = Array.from({ length: 4 }, () => { const s = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 32), std(0xffffff, 0.7, 0, { map: bandT }), 0, 0, 0); s.rotation.z = Math.PI / 2; return s; });
  // hydraulic compression press, vertical: fixed lower half, upper half on a platen driven by the ram; front cut away (z>0)
  const PX = CX + 4.6, PR = 0.48, PY = 1.5, PD = 1.08 * PR, PW = 1.2 * PR;
  const cutP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.001);
  const hatchT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#cfd6dc"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(30,41,59,.55)"; g.lineWidth = 5; for (let i = -w; i < 2 * w; i += 26) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + w, w); g.stroke(); } g.strokeStyle = "#0f766e"; g.lineWidth = 10; g.strokeRect(0, 0, w, w); });
  function capGeo(R) {
    const w = 1.2 * R, Dd = 1.08 * R, Rc = 1.03 * R, s = new THREE.Shape();
    s.moveTo(-w, 0); s.lineTo(-Rc, 0); s.absarc(0, 0, Rc, Math.PI, 2 * Math.PI, false); s.lineTo(w, 0); s.lineTo(w, -Dd); s.lineTo(-w, -Dd); s.lineTo(-w, 0);
    const g = new THREE.ShapeGeometry(s, 32), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w) / (2 * w), (p.getY(i) + Dd) / Dd);
    return g;
  }
  const capM = new THREE.MeshStandardMaterial({ map: hatchT, roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  function clipGroup(G, extra = []) { G.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.clippingPlanes = [cutP]; o.material.side = THREE.DoubleSide; extra.push(o.material); } }); return extra; }
  const heatM = [];
  const pLo = mouldHalf(PR, steel, std(0x8a959e, 0.4, 0.8)), pUp = mouldHalf(PR, steel, std(0x8a959e, 0.4, 0.8));
  pLo.rotation.x = Math.PI / 2; pUp.rotation.x = -Math.PI / 2; scene.add(pLo, pUp);
  clipGroup(pLo, heatM); clipGroup(pUp, heatM);
  const capLo = new THREE.Mesh(capGeo(PR), capM); const capUp = new THREE.Mesh(capGeo(PR), capM); capUp.scale.y = -1; scene.add(capLo, capUp);
  mesh(bev(2.2, 0.2, 1.4), steelD, PX, 0.1, 0);
  mesh(bev(1.2, 0.66, 1.0), steel, PX, 0.53, 0);
  mesh(bev(1.7, 0.12, 1.2, 0.03), mintM, PX, PY - PD - 0.06, 0);
  const upPl = mesh(bev(1.7, 0.14, 1.2, 0.03), mintM, 0, 0, 0);
  for (const x of [-0.82, 0.82]) for (const z of [-0.5, 0.5]) { mesh(new THREE.CylinderGeometry(0.075, 0.075, 3.7, 20), chrome, PX + x, 1.95, z); mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 6), boltM, PX + x, 3.86, z); mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 6), boltM, PX + x, 0.26, z); }
  mesh(bev(2.0, 0.22, 1.3), mintM, PX, 3.7, 0);
  mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.85, 40), steelD, PX, 4.23, 0);
  for (const y of [3.86, 4.6]) mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 40), steel, PX, y, 0);
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), orangeM, PX + 0.42, 4.25, 0.1);
  const rod = mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 24), chrome, PX, 3, 0);
  const coreC = mesh(new THREE.SphereGeometry(PR * 0.98, 48, 36), std(C.orange, 0.55), PX, PY, 0);
  const steam = pts(scene, 60, { color: 0x94a3b8, size: 0.32, add: false, opacity: 0.35 });
  const tagC = tag("INTI KARET", new THREE.Vector3(PX + 1.0, 2.75, 0.5), new THREE.Vector3(PX + 0.2, PY + 0.25, 0.35));

  // ================= D: layer build + two-half dimple mould (s4) =================
  const DX = 29, DY = 1.7, DR = 0.92;
  const D = ball(DR); D.G.position.set(DX, DY, 0); pedestal(DX, 0.62, 0, 0.6);
  const cavM = new THREE.MeshStandardMaterial({ color: 0x9aa6af, roughness: 0.35, metalness: 0.85, side: THREE.BackSide, bumpMap: canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#000"; for (let j = 0; j < 12; j++) for (let i = 0; i < 28; i++) { g.beginPath(); g.arc((i + (j % 2) * 0.5) * (w / 28), j * (h / 12) + 10, 6.5, 0, 7); g.fill(); } }), bumpScale: 2.5 });
  const mL = mouldHalf(DR, steel, cavM), mR = mouldHalf(DR, steel, cavM);
  mL.rotation.y = -Math.PI / 2; mR.rotation.y = Math.PI / 2; scene.add(mL, mR);
  clipGroup(mL); clipGroup(mR); // front cut away: the dimpled cavity shows in section
  const capL = new THREE.Mesh(capGeo(DR), capM), capR = new THREE.Mesh(capGeo(DR), capM); capL.rotation.z = -Math.PI / 2; capR.rotation.z = Math.PI / 2; scene.add(capL, capR);
  const fillGlow = mesh(new THREE.SphereGeometry(DR * 1.025, 48, 36), new THREE.MeshBasicMaterial({ color: 0xbff7e2, transparent: true, opacity: 0, depthWrite: false }), DX, DY, 0); fillGlow.castShadow = false;
  const part = mesh(new THREE.BoxGeometry(0.1, DR * 2.66, DR * 2.66), new THREE.MeshBasicMaterial({ color: 0x5ff0bf, transparent: true, opacity: 0, toneMapped: false }), DX, DY, 0); part.castShadow = false;
  const tagsD = [tag("INTI", new THREE.Vector3(DX + 1.3, DY + 0.45, 0.3), new THREE.Vector3(DX + 0.28, DY + 0.1, 0.01)),
    tag("LAPISAN TENGAH", new THREE.Vector3(DX + 1.3, DY - 0.08, 0.3), new THREE.Vector3(DX + 0.65, DY - 0.2, 0.01)),
    tag("KULIT LUAR", new THREE.Vector3(DX + 1.3, DY - 0.62, 0.3), new THREE.Vector3(DX + 0.8, DY - 0.42, 0.01))];

  // ================= E: finishing line (s5) =================
  const EX = 39, EY = 1.75, ER = 0.8;
  const E = ball(ER, { wedge: false }); E.G.position.set(EX, EY, 0);
  E.covM.transparent = true; E.mantM.transparent = true;
  const spindle = mesh(new THREE.CylinderGeometry(0.05, 0.08, EY - ER + 0.02, 16), steel, EX, (EY - ER) / 2, 0);
  mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 32), steelD, EX, 0.06, 0);
  const flash = mesh(new THREE.RingGeometry(ER * 0.98, ER * 1.16, 96), new THREE.MeshStandardMaterial({ color: 0xdfe6df, roughness: 0.5, transparent: true, side: THREE.DoubleSide }), EX, EY, 0); flash.rotation.x = Math.PI / 2;
  const seam = mesh(new THREE.TorusGeometry(ER * 1.003, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true }), EX, EY, 0); seam.rotation.x = Math.PI / 2;
  // spray gun front-left of the ball, aimed at it (+z of the group points at the ball); mist = cone + two particle sizes
  const NZ = new THREE.Vector3(EX + 0.6, EY + 0.75, 1.6), NT = new THREE.Vector3(EX, EY, 0.25);
  const nozzle = new THREE.Group(); nozzle.position.copy(NZ); scene.add(nozzle); nozzle.lookAt(NT);
  mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.42, 24), mintM, 0, 0, -0.12, nozzle).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.035, 0.07, 0.16, 20), chrome, 0, 0, 0.16, nozzle).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 24), steelD, 0, 0, 0.06, nozzle).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.08, 0.32, 0.12), navyM, 0, -0.2, -0.2, nozzle);
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), navyM, 0, -0.1, -0.7, nozzle).rotation.x = Math.PI / 2 + 0.3;
  const sprayLen = NZ.distanceTo(NT) - ER * 0.9;
  const coneGeo = new THREE.ConeGeometry(0.42, sprayLen, 40, 1, true); coneGeo.rotateX(-Math.PI / 2); coneGeo.translate(0, 0, 0.24 + sprayLen / 2);
  const coneM = new THREE.MeshBasicMaterial({ color: 0x2b8ac0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, map: canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) });
  const cone = new THREE.Mesh(coneGeo, coneM); cone.renderOrder = 5; nozzle.add(cone);
  const spray = pts(scene, 220, { color: 0x1f6fa3, size: 0.1, add: false, opacity: 0.9 });
  const mist = pts(scene, 70, { color: 0x4fa3d1, size: 0.34, add: false, opacity: 0.6 });
  const spSeed = Array.from({ length: 220 }, (_, i) => { const R2 = mulberry(700 + i); return [R2(), R2(), R2(), R2()]; });
  const spDir = NT.clone().sub(NZ).normalize(), spU = new THREE.Vector3().crossVectors(spDir, new THREE.Vector3(0, 1, 0)).normalize(), spV = new THREE.Vector3().crossVectors(spU, spDir);
  const logoE = decal(E, "AUDIRA", [-0.35, 0.18, 0.92], 0.62); logoE.material.transparent = true;
  const pad = new THREE.Group(); scene.add(pad);
  mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 32), std(0xf3b17c, 0.8), 0, 0, 0, pad).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.16, 0.16, 1.4), steelD, 0, 0, -0.85, pad).rotation.x = 0;
  const xscreen = mesh(new THREE.BoxGeometry(3.4, 3.4, 0.08), new THREE.MeshStandardMaterial({ color: 0x0b1d2e, roughness: 0.5, emissive: 0x06263a, emissiveIntensity: 0.6 }), EX, EY + 0.1, -1.3);
  const xgrid = mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: canvasTex(512, 512, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(0,229,255,.35)"; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, w); g.moveTo(0, i * w / 8); g.lineTo(w, i * w / 8); g.stroke(); } g.strokeStyle = "rgba(0,229,255,.9)"; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, w / 2 - 60); g.lineTo(w / 2, w / 2 + 60); g.moveTo(w / 2 - 60, w / 2); g.lineTo(w / 2 + 60, w / 2); g.stroke(); g.beginPath(); g.arc(w / 2, w / 2, 110, 0, 7); g.stroke(); }) }), EX, EY + 0.1, -1.24);
  xgrid.castShadow = xgrid.receiveShadow = false;
  const xring = mesh(new THREE.TorusGeometry(ER * 1.18, 0.02, 8, 96), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, toneMapped: false }), EX, EY, 0); xring.rotation.x = Math.PI / 2;
  for (const o of [flash, seam, xring, fillGlow]) o.castShadow = false;
  const tagE = tag("INTI DI TENGAH", new THREE.Vector3(EX + 1.6, EY + 1.15, 0.4), new THREE.Vector3(EX + 0.05, EY + 0.05, 0.3));
  // robot hitter: column, beam, swinging arm with a club head
  mesh(new THREE.BoxGeometry(0.34, 5.3, 0.34), mintM, EX - 2.3, 2.65, -0.6);
  mesh(new THREE.BoxGeometry(2.6, 0.3, 0.3), mintM, EX - 1.1, 5.2, -0.6);
  mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 24), steelD, EX, 5.05, -0.3).rotation.x = Math.PI / 2;
  const arm = new THREE.Group(); arm.position.set(EX, 5.05, 0); scene.add(arm);
  mesh(new THREE.BoxGeometry(0.14, 3.1, 0.14), steel, 0, -1.55, 0, arm);
  mesh(new THREE.BoxGeometry(0.42, 0.22, 0.3), navyM, -0.05, -3.2, 0, arm);
  mesh(new THREE.BoxGeometry(0.6, 0.3, 0.3), orangeM, EX - 2.3, 0.15, -0.6);

  // ================= F: wind tunnel, smooth vs dimpled (s6) =================
  const FX = 50, FR = 0.7, FY = [2.9, 1.05];
  const frameM = std(0x475569, 0.4, 0.6);
  for (const y of [-0.05, 7.0]) mesh(new THREE.BoxGeometry(7.4, 0.08, 0.08), frameM, FX + 0.6, y + 0.02, -1.2);
  for (const x of [FX - 3.1, FX + 4.3]) mesh(new THREE.BoxGeometry(0.08, 7.0, 0.08), frameM, x, 3.5, -1.2);
  mesh(new THREE.BoxGeometry(7.4, 7, 0.04), new THREE.MeshStandardMaterial({ color: 0xf8fbf9, roughness: 0.9 }), FX + 0.6, 3.5, -1.3).receiveShadow = false;
  const smooth = mesh(new THREE.SphereGeometry(1, 96, 72), M.white(), FX, FY[0], 0); smooth.scale.setScalar(FR);
  const dimp = mesh(dimpleGeo(), M.white(), FX, FY[1], 0); dimp.scale.setScalar(FR);
  for (const y of FY) mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), steelD, FX, y - FR - 0.4, -0.3);
  const tagF = [tag("MULUS", new THREE.Vector3(FX - 0.9, FY[0] - 0.92, 0.5), new THREE.Vector3(FX - 0.45, FY[0] - 0.45, 0.45)),
    tag("DIMPLE", new THREE.Vector3(FX - 0.9, FY[1] - 0.98, 0.5), new THREE.Vector3(FX - 0.45, FY[1] - 0.5, 0.45))];
  // streamlines: potential flow around a circle, then a wake that stays open (smooth) or closes early (dimpled)
  const PSI = [-0.95, -0.7, -0.48, -0.3, -0.14, 0.14, 0.3, 0.48, 0.7, 0.95];
  const X0 = -3.0, X1 = 4.2;
  function stream(psi, R, xs, wEnd) {
    const P = [], s = Math.sign(psi), ps = Math.abs(psi);
    const ys = Math.sqrt(Math.max(0, R * R - xs * xs));
    for (let i = 0; i <= 120; i++) {
      const x = X0 + ((X1 - X0) * i) / 120;
      let lo = Math.sqrt(Math.max(0, R * R - x * x)) + 1e-4, hi = ps + R * 1.5;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, g = m * (1 - (R * R) / (x * x + m * m)) - ps; if (g > 0) hi = m; else lo = m; }
      let y = (lo + hi) / 2;
      if (x > xs) { const w = ys + (wEnd - ys) * (1 - Math.exp(-(x - xs) / (0.9 * R))); const k2 = 0.06; y = 0.5 * (y + w + Math.sqrt((y - w) * (y - w) + k2 * k2)); }
      P.push(new THREE.Vector3(x, s * y, 0));
    }
    return P;
  }
  const flows = [[FR * 0.08, FR * 1.25], [FR * 0.62, FR * 0.42]].map(([xs, wEnd], bi) => {
    const lines = PSI.map((p) => stream(p * FR * 1.2, FR, xs, wEnd));
    const G = new THREE.Group(); G.position.set(FX, FY[bi], 0.02); scene.add(G);
    const lm = new THREE.LineBasicMaterial({ color: 0x0f766e, transparent: true, opacity: 0.6 });
    for (const l of lines) G.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(l), lm));
    const fp = pts(scene, lines.length * 18, { color: 0x0b5f58, size: 0.11, add: false, opacity: 1 });
    const wk = pts(scene, bi ? 90 : 260, { color: 0xea580c, size: 0.15, add: false, opacity: 1 });
    const ws = Array.from({ length: bi ? 90 : 260 }, (_, i) => { const R2 = mulberry(900 + i + bi * 500); return [R2(), R2(), R2(), R2()]; });
    return { lines, lm, fp, wk, ws, xs, wEnd, y: FY[bi] };
  });

  // ================= G: flight range (s7) =================
  const GX = 60;
  for (let i = 0; i <= 11; i++) { const b = mesh(new THREE.BoxGeometry(0.05, 0.02, i % 5 ? 0.6 : 1.4), std(i % 5 ? 0x94a3b8 : C.mintD, 0.6), GX + i, 0.012, 0); b.castShadow = false; }
  mesh(new THREE.BoxGeometry(11.6, 0.015, 0.06), std(0x94a3b8, 0.6), GX + 5.5, 0.01, 0.75).castShadow = false;
  mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.25, 12), whiteM, GX, 0.12, 0);
  function arcCurve(range, apex) { const P = []; for (let i = 0; i <= 80; i++) { const s = i / 80; P.push(new THREE.Vector3(GX + range * s, 0.35 + apex * Math.sin(Math.PI * Math.pow(s, 0.82)), 0)); } return new THREE.CatmullRomCurve3(P); }
  const arcs = [[5, 2.6, 0x94a3b8, 1.8, 0.5], [10, 4.6, C.orange, 2.4, -0.5]].map(([range, apex, col, dur, z]) => {
    const cu = arcCurve(range, apex);
    const tube = mesh(new THREE.TubeGeometry(cu, 200, 0.07, 8), new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, emissive: col, emissiveIntensity: 0.25 }), 0, 0, z); tube.castShadow = false;
    const b = mesh(range > 6 ? dimpleGeo() : new THREE.SphereGeometry(1, 48, 36), M.white(), 0, 0, 0); b.scale.setScalar(0.3);
    return { cu, tube, b, dur, z, n: tube.geometry.index.count };
  });
  const tagG = [tag("MULUS", new THREE.Vector3(GX + 5, 2.0, 0.6), new THREE.Vector3(GX + 5, 0.4, 0.5)), tag("DIMPLE", new THREE.Vector3(GX + 10, 2.0, -0.4), new THREE.Vector3(GX + 10, 0.4, -0.5))];
  for (const tg of tagG) tg.m.scale.setScalar(2.4);

  // ================= H2: closing hero (s8) =================
  const H2 = ball(1.0); H2.G.position.set(76, 1.75, -1); pedestal(76, 0.62, -1, 0.75);
  decal(H2, "AUDIRA", [-0.55, 0.22, 0.8], 0.62);
  const ring2 = mesh(new THREE.TorusGeometry(1.32, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: C.mintD, transparent: true, opacity: 0.8 }), 76, 1.75, -1);
  const tagsH2 = [tag("INTI", new THREE.Vector3(77.05, 2.85, -0.7), new THREE.Vector3(76.3, 1.85, -0.99)),
    tag("LAPISAN TENGAH", new THREE.Vector3(77.3, 2.45, -0.7), new THREE.Vector3(76.7, 1.55, -0.99)),
    tag("KULIT + DIMPLE", new THREE.Vector3(77.2, 2.05, -0.7), new THREE.Vector3(76.95, 1.55, -0.7))];

  // ================= camera =================
  const cK = [
    [0, 2.6, 2.5, 9.8, 0.5, 1.95, 0], [K.s1e - 0.15, 2.2, 2.3, 8.6, 0.45, 1.9, 0],
    [K.s2 + 0.7, 9.9, 2.0, 7.4, 9.0, 1.45, 0], [A("s2:tergores"), 9.5, 1.8, 6.2, 9.0, 1.35, 0], [A("s2:dicetak"), 10.6, 2.1, 6.8, 9.7, 1.5, 0],
    [K.s3 + 0.8, 16.8, 5.0, 12.4, 17.4, 1.55, 0], [A("s3:memantul"), 17.9, 4.7, 12.2, 18.2, 1.5, 0], [A("s3:dipanggang"), 21.2, 3.6, 9.6, 21.5, 1.95, 0], [K.s3e, 22.3, 3.1, 8.8, 21.8, 1.9, 0],
    [K.s4 + 0.8, 30.3, 2.4, 6.8, 29.95, 1.95, 0], [A("s4:ditaruh"), 29.1, 3.4, 9.4, 29.0, 1.85, 0], [A("s4:rongganya"), 29.0, 3.2, 9.0, 29.0, 1.8, 0], [A("s4:Rongga") + 0.6, 28.4, 2.3, 5.4, 28.95, 1.85, 0], [K.s4e, 28.2, 2.1, 4.6, 28.9, 1.8, 0],
    [K.s5 + 0.8, 39.5, 2.4, 6.4, 39.1, 1.95, 0], [A("s5:pernis"), 39.0, 2.25, 5.5, 39.0, 1.95, 0], [A("s5:memastikan"), 38.9, 2.15, 5.3, 39.0, 1.95, 0], [A("s5:robot") - 0.3, 39.1, 2.7, 8.8, 39.0, 2.25, 0], [K.s5e, 40.6, 2.7, 9.2, 40.4, 2.3, 0],
    [K.s6 + 0.9, 50.7, 2.3, 14.2, 50.7, 1.95, 0], [A("s6:Pusarannya"), 50.75, 2.25, 13.4, 50.75, 1.9, 0], [K.s6e, 50.9, 2.25, 13.7, 50.85, 1.9, 0],
    [K.s7 + 0.8, 65.4, 3.4, 31.5, 65.4, 2.55, 0], [A("s7:kecepatan") - 0.2, 65.9, 3.2, 29.0, 65.9, 2.45, 0], [K.s7e, 72.5, 2.6, 13.0, 73.5, 1.9, -1],
    [K.s8 + 0.9, 77.6, 2.5, 8.6, 76.5, 1.95, -1], [K.end, 77.3, 2.3, 7.8, 76.45, 1.9, -1],
  ];
  const camAt = track(cK);
  const v = new THREE.Vector3(), q = new THREE.Vector3();

  function tagFade(list, a, b, t, stag = 0.25) { list.forEach((g, i) => g.set(clamp01(ramp(t, a + i * stag, a + i * stag + 0.35) * (1 - ramp(t, b - 0.3, b))))); }

  return (t) => {
    const c = camAt(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.updateMatrixWorld();
    key.target.position.set(c[3], 0, c[5]); key.position.set(c[3] + 4, 10, c[5] + 7);
    rim.target.position.set(c[3], 1.5, c[5]); rim.position.set(c[3] - 3, 5, c[5] - 7);
    for (const b of bills) b.quaternion.copy(cam.quaternion);

    // ---- H1 hero ----
    H1.G.rotation.y = 0.15 * Math.sin(t * 0.6) - 0.05;
    H1.G.position.y = 1.75 + 0.04 * Math.sin(t * 1.1);
    scanRing.position.y = 1.75 + 0.9 * Math.sin(t * 1.4); scanRing.scale.setScalar(Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.sin(t * 1.4) * 0.9 / 1.32, 2))));
    H1.sync();
    tagFade(tagsH1, -1, K.s2, t, 0);

    // ---- B old gum ball ----
    const tg = A("s2:tergores");
    scr.material.opacity = ramp(t, tg - 0.1, tg + 1.6);
    const kn = clamp01((t - tg + 0.3) / 2.2), sw = Math.sin(kn * Math.PI * 4);
    knife.visible = t > tg - 0.6 && t < K.s3;
    knife.position.set(BX - 0.9 + 0.5 * sw, 1.35 + 0.18 * Math.cos(kn * Math.PI * 4), 0.62); knife.rotation.set(0.2, -0.5, -0.35 + 0.2 * sw);
    gum.rotation.y = scr.rotation.y = 0.25 * t;
    tagB.set(ramp(t, K.s2 + 0.4, K.s2 + 0.9) * (1 - ramp(t, K.s3 - 0.3, K.s3)));

    // ---- C mill + press ----
    const spin = t * 2.4;
    rolls[0].rotation.x = spin; rolls[1].rotation.x = -spin * 1.2; bank.rotation.x = -spin * 2.5;
    const pa = A("s3:dicampur"), pz = A("s3:memantul");
    for (let i = 0; i < 140; i++) {
      const s = powSeed[i], u = (s[0] + t * 0.9) % 1, on = t > pa - 0.2 && t < pz + 0.6;
      powder.pos[i * 3] = CX + (s[1] - 0.5) * 0.3 * (1 + u * 4); powder.pos[i * 3 + 1] = on ? 2.9 - u * 0.95 : -10; powder.pos[i * 3 + 2] = (s[2] - 0.5) * 0.25;
    }
    powder.commit();
    const cut = A("s3:dipotong"), bake = A("s3:dipanggang");
    const close = ramp(t, bake + 0.15, bake + 0.75) * (1 - ramp(t, K.s3e - 0.5, K.s3e + 0.2));
    slugs.forEach((s, i) => {
      const dur = i ? 1.8 : bake + 0.1 - cut, u = clamp01((t - cut + 0.4 - i * 0.3) / dur);
      s.visible = t > cut - 0.5 + i * 0.3 && t < K.s4 && !(i === 0 && close > 0.6);
      if (i === 0) { const a = eout(u), x0 = CVX - CVL / 2 + 0.15; const lift = ramp(u, 0.6, 1); s.position.set(x0 + (PX - x0) * a, 1.12 + (PY - 0.12 - 1.12) * lift + 0.5 * Math.sin(Math.PI * lift), 0); }
      else s.position.set(CVX - CVL / 2 + 0.15 + u * (CVL - 0.3 - (i - 1) * 0.42), 1.12, 0);
    });
    const gap = 1.05 * (1 - close);
    pLo.position.set(PX, PY, 0); pUp.position.set(PX, PY + gap, 0);
    capLo.position.set(PX, PY, 0.002); capUp.position.set(PX, PY + gap, 0.002);
    const plY = PY + gap + PD + 0.11; upPl.position.set(PX, plY, 0);
    const rb = plY + 0.07, rt = 3.59; rod.scale.y = rt - rb; rod.position.y = (rt + rb) / 2;
    const heat = ramp(t, bake + 0.5, bake + 1.3) * (1 - ramp(t, K.s3e - 0.6, K.s3e));
    for (const m of heatM) { m.emissive.setHex(0xff5a1a); m.emissiveIntensity = 0.35 * heat; }
    coreC.visible = close > 0.6 && t < K.s4; coreC.material.emissive.setHex(0xff3d00); coreC.material.emissiveIntensity = 0.5 * heat;
    for (let i = 0; i < 60; i++) { const R2 = mulberry(1200 + i); const s0 = R2(), s1 = R2(), s2 = R2(); const u = (s0 + t * 0.5) % 1; steam.pos[i * 3] = PX + (s1 - 0.5) * 1.4; steam.pos[i * 3 + 1] = heat > 0.05 ? PY + PD + 0.3 + u * 1.4 : -10; steam.pos[i * 3 + 2] = 0.55 + (s2 - 0.5) * 0.5; }
    steam.m.opacity = 0.35 * heat; steam.commit();
    tagC.set(ramp(t, K.s3e - 0.5, K.s3e) * (1 - ramp(t, K.s4 + 0.3, K.s4 + 0.6)));

    // ---- D layer build + dimple mould ----
    const lap = A("s4:lapisan"), kul = A("s4:kulit"), tut = A("s4:menutup"), fil = A("s4:rongganya"), opn = A("s4:Rongga");
    const mg = eout((t - lap) / 0.9);
    D.mantle.visible = t > lap; D.mantle.scale.setScalar(0.73 + 0.27 * mg); D.caps[1].forEach((m) => { m.visible = t > lap; m.scale.setScalar(0.73 + 0.27 * mg); });
    const covOn = t > fil + 0.3;
    D.cover.visible = covOn; D.caps[2].forEach((m) => (m.visible = covOn));
    D.G.rotation.y = 0.12 * Math.sin(t * 0.5);
    D.sync();
    const inn = ramp(t, kul, tut - 0.1), cls = ramp(t, tut, tut + 0.6), out = ramp(t, opn - 0.2, opn + 0.7);
    const mgap = 4.2 - 2.6 * inn - 1.6 * cls + 2.4 * out;
    mL.position.set(DX - mgap, DY, 0); mR.position.set(DX + mgap, DY, 0);
    mL.position.y = mR.position.y = DY + 2.2 * ramp(t, opn + 0.6, opn + 1.6);
    mL.visible = mR.visible = capL.visible = capR.visible = t > kul - 0.5 && t < K.s5;
    capL.position.set(mL.position.x, mL.position.y, 0.002); capR.position.set(mR.position.x, mR.position.y, 0.002);
    part.material.opacity = 0.95 * ramp(t, fil - 0.2, fil + 0.2) * (1 - ramp(t, opn - 0.3, opn)) * cls; part.visible = part.material.opacity > 0.01;
    fillGlow.material.opacity = 0.55 * ramp(t, fil - 0.1, fil + 0.3) * (1 - ramp(t, opn - 0.1, opn + 0.5));
    tagFade(tagsD, K.s4 + 0.3, kul, t, 0.0);

    // ---- E finishing ----
    const dib = A("s5:dibuang"), cat = A("s5:dicat"), logo = A("s5:logo"), per = A("s5:pernis"), xr = A("s5:memastikan"), rob = A("s5:robot"), hit = A("s5:jaraknya");
    flash.material.opacity = 1 - ramp(t, dib - 0.3, dib + 0.4); flash.visible = flash.material.opacity > 0.01; flash.scale.setScalar(1 - 0.08 * ramp(t, dib - 0.3, dib + 0.4));
    seam.material.opacity = 0.8 * (1 - ramp(t, dib, dib + 0.6)); seam.visible = seam.material.opacity > 0.01;
    const fly = Math.max(0, t - hit - 0.02);
    E.G.position.set(EX + 9 * fly, EY + 1.4 * fly - 0.6 * fly * fly, 0);
    E.G.visible = fly < 1.8;
    const spinE = 5 * (Math.min(Math.max(t, cat), logo) - cat) + 0.4 * t;
    E.G.rotation.y = spinE;
    const spOn = ramp(t, cat - 0.35, cat) * (1 - ramp(t, logo + 0.1, logo + 0.45));
    nozzle.visible = t > K.s5 && t < logo + 0.6;
    coneM.opacity = 0.34 * spOn; cone.visible = spOn > 0.01;
    for (let i = 0; i < 220; i++) {
      const s = spSeed[i], u = (s[0] + t * 1.6) % 1, a = s[1] * Math.PI * 2, rr = Math.sqrt(s[2]) * 0.4 * u, d = 0.24 + u * sprayLen;
      const o = spOn > 0.01;
      v.copy(NZ).addScaledVector(spDir, d).addScaledVector(spU, Math.cos(a) * rr).addScaledVector(spV, Math.sin(a) * rr);
      spray.pos[i * 3] = o ? v.x : -50; spray.pos[i * 3 + 1] = v.y; spray.pos[i * 3 + 2] = v.z;
      if (i < 70) {
        const u2 = (s[3] + t * 0.7) % 1, a2 = s[0] * 6.283 + t, r2 = 0.15 + 0.5 * u2;
        v.copy(NT).addScaledVector(spDir, -ER * 0.95 + 0.25 * u2).addScaledVector(spU, Math.cos(a2) * r2).addScaledVector(spV, Math.sin(a2) * r2);
        mist.pos[i * 3] = o ? v.x : -50; mist.pos[i * 3 + 1] = v.y; mist.pos[i * 3 + 2] = v.z;
      }
    }
    spray.m.opacity = 0.9 * spOn; mist.m.opacity = 0.6 * spOn * spOn;
    spray.commit(); mist.commit();
    logoE.material.opacity = ramp(t, logo + 0.35, logo + 0.5);
    const pd = new THREE.Vector3(-0.35, 0.18, 0.92).normalize();
    const st = Math.sin(Math.PI * clamp01((t - logo + 0.1) / 0.9));
    pad.visible = t > logo - 0.3 && t < per;
    v.copy(pd).multiplyScalar(ER + 0.17 + 0.9 * (1 - st)).add(E.G.position); pad.position.copy(v); pad.lookAt(q.copy(E.G.position));
    E.covM.clearcoat = 0.5 + 0.5 * ramp(t, per, per + 0.6); E.covM.clearcoatRoughness = 0.25 - 0.2 * ramp(t, per, per + 0.6);
    const xa = ramp(t, xr - 0.4, xr + 0.2) * (1 - ramp(t, rob - 0.2, rob + 0.3));
    xscreen.scale.set(xa + 0.001, xa + 0.001, 1); xgrid.scale.copy(xscreen.scale);
    E.covM.opacity = 1 - 0.8 * xa; E.covM.depthWrite = xa < 0.5; E.mantM.opacity = 1 - 0.65 * xa; E.mantM.depthWrite = xa < 0.5;
    E.covM.color.setHex(C.white).lerp(new THREE.Color(0x7fe8ff), xa); E.coreM.emissive.setHex(0x00e5ff); E.coreM.emissiveIntensity = 0.6 * xa;
    xring.visible = xa > 0.02; xring.position.y = EY + 0.75 * Math.sin((t - xr) * 3.2);
    xring.scale.setScalar(Math.sqrt(Math.max(0.05, 1 - Math.pow((xring.position.y - EY) / (ER * 1.18), 2))));
    tagE.set(xa);
    const sw2 = ramp(t, hit - 0.45, hit + 0.15);
    arm.rotation.z = -1.6 + 2.35 * sw2;

    // ---- F wind tunnel ----
    const fA = [A("s6:mulus"), A("s6:Dimple")], wA = [A("s6:pusaran"), A("s6:bergolak")];
    flows.forEach((f, bi) => {
      const on = 0.25 + 0.75 * ramp(t, fA[bi] - 0.3, fA[bi] + 0.3);
      f.lm.opacity = 0.6 * on; f.fp.m.opacity = on;
      let n = 0;
      for (let li = 0; li < f.lines.length; li++) for (let k = 0; k < 18; k++, n++) {
        const u = (k / 18 + t * 0.16 + li * 0.037) % 1, L = f.lines[li], fi = u * 120, i0 = Math.floor(fi), w = fi - i0, a = L[i0], b = L[Math.min(120, i0 + 1)];
        f.fp.pos[n * 3] = FX + a.x + (b.x - a.x) * w; f.fp.pos[n * 3 + 1] = f.y + a.y + (b.y - a.y) * w; f.fp.pos[n * 3 + 2] = 0.03;
      }
      f.fp.commit();
      const wo = ramp(t, wA[bi] - 0.3, wA[bi] + 0.8), Lw = bi ? 1.4 : 3.6;
      f.wk.m.opacity = wo;
      f.ws.forEach((s, i) => {
        const ph = (s[0] + t * 0.22) % 1, x = f.xs + 0.05 + ph * Lw, wx = (f.wEnd * 0.9) * (bi ? 1 - 0.5 * ph : 1);
        const side = i % 2 ? 1 : -1, cy = side * wx * 0.5, ang = s[1] * 6.283 + side * t * 2.8 * (1 - 0.4 * ph), rr = s[2] * wx * 0.48;
        f.wk.pos[i * 3] = wo > 0.01 ? FX + x + Math.cos(ang) * rr * 0.9 : -99; f.wk.pos[i * 3 + 1] = f.y + cy + Math.sin(ang) * rr; f.wk.pos[i * 3 + 2] = 0.05;
      });
      f.wk.commit();
    });
    smooth.rotation.y = dimp.rotation.y = 0.3 * t;
    tagF[0].set(ramp(t, fA[0] - 0.2, fA[0] + 0.2) * (1 - ramp(t, K.s7 - 0.3, K.s7)));
    tagF[1].set(ramp(t, fA[1] - 0.2, fA[1] + 0.2) * (1 - ramp(t, K.s7 - 0.3, K.s7)));

    // ---- G flight ----
    const go = A("s7:Hasilnya") + 0.15;
    arcs.forEach((a, i) => {
      const u = eout((t - go) / a.dur);
      a.tube.geometry.setDrawRange(0, Math.floor((a.n * u) / 48) * 48);
      a.tube.visible = u > 0.002;
      a.cu.getPointAt(Math.min(1, Math.max(0, u)), v); a.b.position.set(v.x, v.y, a.z); a.b.rotation.z = -6 * u;
    });
    tagG[0].set(ramp(t, A("s7:setengah") - 0.2, A("s7:setengah") + 0.3) * (1 - ramp(t, K.s8 - 0.3, K.s8)));
    tagG[1].set(ramp(t, A("s7:berdimple") - 0.2, A("s7:berdimple") + 0.3) * (1 - ramp(t, K.s8 - 0.3, K.s8)));

    // ---- H2 closing hero ----
    H2.G.rotation.y = 0.15 * Math.sin(t * 0.6) - 0.05;
    ring2.position.y = 1.75 + 0.9 * Math.sin(t * 1.4); ring2.scale.setScalar(Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.sin(t * 1.4) * 0.9 / 1.32, 2))));
    H2.sync();
    tagFade(tagsH2, K.s8 + 0.3, K.outro + 1, t, 0.25);

    comp.render();
  };
}
