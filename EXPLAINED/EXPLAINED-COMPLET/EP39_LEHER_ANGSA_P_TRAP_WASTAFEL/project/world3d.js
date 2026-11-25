// EP39 LEHER ANGSA / P-TRAP (STAINEDGLASS). A stone chamber lit by a tall leadlight lancet window. In front of it the
// plumbing under a cutaway sink is drawn as glowing glass held by dark lead cames:
//   sink + brass faucet (y 3.8-5.2), glass tailpiece down into the U (bottom y 0.4), the right leg up into the arm,
//   the arm into a wide stack at x=3.8 that runs down through the stone floor into the sewer (y -1.6) and up to a
//   slate roof (y 9) as the vent. Water = sapphire glass, sewer gas = olive glass blobs, old water = grey-teal.
//   x=-3.4: Alexander Cumming's S-shaped trap (1775) on a brass plaque. Ruler next to the U for the seal depth.
// Every value is a pure function of t (water level, gas front, flows are piecewise functions of word anchors).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, stage, label } from "./lib3d.js";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// DOCUMENTARY_WARM: warm lifted shadows, slight contrast, jewel saturation kept.
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(0.299,0.587,0.114));
  c=mix(c,c*vec3(1.05,1.0,0.9),0.5);c+=vec3(0.03,0.018,0.006)*(1.0-l);c=mix(vec3(l),c,1.12);c=(c-0.5)*1.06+0.5;
  vec2 d=vUv-vec2(0.5,0.45);c*=1.0-0.35*dot(d,d);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const LEAD = 0x1a1b1e, R = 0.2, RW = 0.165;
const C = { sapph: "#3d7dff", sapphL: "#9cc4ff", old: "#6f9488", gas: "#a9c23a", gasD: "#6f8a1f", amber: "#f0a52c", gold: "#f6cf5a", ruby: "#c4253f", emer: "#1f9d6a", teal: "#1b8a96", deep: "#1d3f9c", vio: "#5a3c9e" };

// trap centre-line: tail (x=0) -> U (centre 0.5,0.9, r 0.5) -> right leg (x=1) up to the weir at y 1.25
function trapPts(ox = 0, top = 3.85) {
  const p = [];
  for (let y = top; y > 0.92; y -= 0.1) p.push(V(ox, y));
  for (let i = 0; i <= 24; i++) { const a = Math.PI + (Math.PI * i) / 24; p.push(V(ox + 0.5 + 0.5 * Math.cos(a), 0.9 + 0.5 * Math.sin(a))); }
  for (let y = 0.98; y <= 1.26; y += 0.07) p.push(V(ox + 1, y));
  return p;
}
const bendPts = () => { const p = []; for (let i = 1; i <= 10; i++) { const a = Math.PI - (Math.PI / 2) * (i / 10); p.push(V(1.5 + 0.5 * Math.cos(a), 1.25 + 0.5 * Math.sin(a))); } return p; };
const armPts = () => { const p = []; for (let i = 1; i <= 12; i++) { const u = i / 12; p.push(V(1.5 + 2.3 * u, 1.75 - 0.1 * u)); } return p; };
const crv = (pts) => new THREE.CatmullRomCurve3(pts, false, "centripetal");

function stoneTex(seed, base, w = 512) {
  const R0 = mulberry(seed);
  return canvasTex(w, w, (g) => {
    g.fillStyle = "#15110d"; g.fillRect(0, 0, w, w);
    const rows = 8, rh = w / rows;
    for (let r = 0; r < rows; r++) {
      let x = -(r % 2) * 40;
      while (x < w) {
        const bw = 70 + R0() * 70, l = 0.82 + R0() * 0.3;
        const c = new THREE.Color(base).multiplyScalar(l);
        g.fillStyle = "#" + c.getHexString(); g.fillRect(x + 3, r * rh + 3, bw - 6, rh - 6);
        for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${R0() < 0.5 ? "0,0,0" : "255,240,220"},${0.04 + R0() * 0.05})`; g.fillRect(x + 3 + R0() * (bw - 8), r * rh + 3 + R0() * (rh - 8), 2 + R0() * 6, 2 + R0() * 4); }
        x += bw;
      }
    }
  }, [3, 3]);
}

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x1c1612, fog: 0.022, exp: 0.9, bloom: [0.55, 0.5, 0.86] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  { // soft warm environment so brass and glass have something to reflect
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x120d09);
    for (const [c, x, y, z] of [[0xffd9a0, 0, 6, -8], [0x6f9cff, -6, 3, -6], [0xffb070, 7, 4, 6]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 10), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.3;
  scene.add(new THREE.HemisphereLight(0xffe2bf, 0x2a1d14, 0.55));
  const key = new THREE.DirectionalLight(0xffe6c4, 1.7); key.position.set(-5, 9, 9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 12, bottom: -4 }); scene.add(key);
  const rim = new THREE.SpotLight(0x7fa6ff, 40, 30, 0.8, 0.6); rim.position.set(1.4, 7, -3.6); rim.target.position.set(1, 1, 0); scene.add(rim, rim.target);
  const glow = new THREE.PointLight(0x5a8cff, 2.2, 4, 1.6); glow.position.set(0.5, 0.8, 0.6); scene.add(glow);
  const gasL = new THREE.PointLight(0xa9c23a, 0, 4, 1.6); scene.add(gasL);

  // ---------- chamber: stone wall, floor slab, earth section, lancet window ----------
  const wallM = new THREE.MeshStandardMaterial({ map: stoneTex(3, "#6b5a4a"), roughness: 0.9 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), wallM); wall.position.set(1.4, 6, -4.3); wall.receiveShadow = true; scene.add(wall);
  const floorM = new THREE.MeshStandardMaterial({ map: stoneTex(11, "#7a6a58"), roughness: 0.85 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 5.2), floorM); slab.position.set(1.4, -0.15, -1.7); slab.receiveShadow = true; scene.add(slab);
  const earth = new THREE.Mesh(new THREE.PlaneGeometry(30, 3.2), new THREE.MeshStandardMaterial({ map: stoneTex(23, "#3a2c22"), roughness: 1 })); earth.position.set(1.4, -1.9, -0.9); scene.add(earth);
  // lancet: width 6, springing at y 7, apex ~12.2
  const WX = 1.4, WW = 6, WY0 = 0.6, WS = 7.0, WZ = -4.15;
  const inside = (x, y) => { if (Math.abs(x - WX) > WW / 2 || y < WY0) return false; if (y < WS) return true; return Math.hypot(x - (WX - WW / 2), y - WS) < WW && Math.hypot(x - (WX + WW / 2), y - WS) < WW; };
  const lancet = (inset) => { const s = new THREE.Shape(), w = WW / 2 - inset, ap = WS + Math.sqrt(WW * WW - (WW / 2) * (WW / 2)) - inset; s.moveTo(WX - w, WY0 + inset); s.lineTo(WX + w, WY0 + inset); s.lineTo(WX + w, WS); s.quadraticCurveTo(WX + w, WS + 3.2, WX, ap); s.quadraticCurveTo(WX - w, WS + 3.2, WX - w, WS); s.closePath(); return s; };
  const leadBack = new THREE.Mesh(new THREE.ShapeGeometry(lancet(0)), new THREE.MeshBasicMaterial({ color: 0x08080a })); leadBack.position.z = WZ - 0.02; scene.add(leadBack);
  const surround = lancet(-0.55); surround.holes.push(new THREE.Path(lancet(0).getPoints(60)));
  const sg = new THREE.ExtrudeGeometry(surround, { depth: 0.5, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }); sg.translate(0, 0, -0.25);
  const sur = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0x9c8a74, map: stoneTex(5, "#9c8a74"), roughness: 0.8 })); sur.position.z = WZ; sur.castShadow = true; scene.add(sur);
  // diamond quarries: one colour per pane, ±8% jitter, an original picture: sun, a big water drop, waves
  const pic = (u, v) => {
    const ds = Math.hypot(u - 0.5, (v - 0.86) * 1.6);
    if (ds < 0.1) return C.gold; if (ds < 0.17) return C.amber;
    const dx = (u - 0.5) / 0.2, dy = (v - 0.45) / 0.17; const tip = v > 0.45 ? 1 + (v - 0.45) * 3.2 : 1;
    if (dx * dx * tip * tip + dy * dy < 1 && v < 0.68) return v < 0.4 ? C.sapphL : C.sapph;
    if (dx * dx * tip * tip + dy * dy < 1.45 && v < 0.72) return C.ruby;
    if (v < 0.2 + 0.03 * Math.sin(u * 22)) return Math.floor(v * 30) % 2 ? C.teal : C.emer;
    return (Math.floor((u + v) * 9) % 3 === 0) ? C.vio : C.deep;
  };
  const q = 0.42, panes = [], RJ = mulberry(77);
  for (let j = 0; j < 80; j++) for (let i = -2; i < 18; i++) { const x = WX - WW / 2 + (i + (j % 2) * 0.5) * q, y = WY0 + j * q * 0.5; if (inside(x, y) && inside(x, y + q * 0.35) && inside(x - q * 0.3, y) && inside(x + q * 0.3, y)) panes.push([x, y, pic((x - (WX - WW / 2)) / WW, (y - WY0) / 12)]); }
  const pg = new THREE.PlaneGeometry(1, 1); pg.rotateZ(Math.PI / 4);
  const qm = new THREE.InstancedMesh(pg, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true }), panes.length);
  const o3 = new THREE.Object3D(), col = new THREE.Color();
  panes.forEach(([x, y, c], i) => { o3.position.set(x, y, WZ); o3.scale.setScalar((q / Math.SQRT2) * 0.84); o3.updateMatrix(); qm.setMatrixAt(i, o3.matrix); col.set(c).multiplyScalar(0.92 + RJ() * 0.16); qm.setColorAt(i, col); });
  scene.add(qm);
  for (let y = WY0 + 1.4; y < WS + 2.4; y += 1.4) { const b = new THREE.Mesh(new THREE.BoxGeometry(WW, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: LEAD, metalness: 0.7, roughness: 0.4 })); b.position.set(WX, y, WZ + 0.04); scene.add(b); }
  // signature pane at the sill: AUDIRA in lead lettering on amber glass
  const sigP = label("AUDIRA", { w: 512, h: 128, font: "700 78px Georgia, serif", color: "#1a1b1e", bg: "#f0a52c", size: 1.5 }); sigP.position.set(WX, WY0 + 0.45, WZ + 0.03); scene.add(sigP);
  // light shafts + floor pool + dust
  const shaftTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,230,190,.9)"); gr.addColorStop(1, "rgba(255,230,190,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, "rgba(0,0,0,1)"); gx.addColorStop(0.5, "rgba(0,0,0,0)"); gx.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
  const shafts = [-1.6, 0.2, 2.0].map((x, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 12), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, color: [0xffd28a, 0x9fc0ff, 0xffb0c0][i] })); m.position.set(WX + x, 5, -1.6); m.rotation.set(-0.35, 0, 0.12 - i * 0.1); scene.add(m); return m; });
  const poolTex = canvasTex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const RP = mulberry(9); for (let k = 0; k < 60; k++) { const c = new THREE.Color([C.sapph, C.ruby, C.amber, C.emer, C.deep][k % 5]); const x = w / 2 + (RP() - 0.5) * w * 0.7, y = h / 2 + (RP() - 0.5) * h * 0.5, rr = 14 + RP() * 30; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},.55)`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); } });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.5), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 })); pool.rotation.x = -Math.PI / 2; pool.position.set(WX - 0.6, 0.012, -2.1); scene.add(pool);
  const DN = 160, dust = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffe8c0, transparent: true, opacity: 0.7 }), DN); dust.frustumCulled = false; scene.add(dust);
  const RD = mulberry(31), dustS = [...Array(DN)].map(() => [RD() * 6 - 1.6, RD() * 9, RD() * 3 - 3, RD() * 6.28, 0.5 + RD()]);

  // ---------- glass plumbing ----------
  const glassM = (c, op = 0.22) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: op, roughness: 0.12, metalness: 0, emissive: new THREE.Color(c).multiplyScalar(0.25), depthWrite: false, side: THREE.DoubleSide });
  const leadM = new THREE.MeshStandardMaterial({ color: LEAD, metalness: 0.7, roughness: 0.35 });
  // a glass pipe: tube + lead rings every `step` + two lead cames tracing its profile in the side view
  function pipe(pts, rad, color, step = 0.34, parent = scene) {
    const cv = crv(pts), g = new THREE.Group(); parent.add(g);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(cv, Math.max(16, pts.length * 3), rad, 20, false), glassM(color)); tube.renderOrder = 3; g.add(tube);
    const L = cv.getLength(), tg = new THREE.Vector3();
    for (let s = 0; s <= L; s += step) { const u = s / L, ring = new THREE.Mesh(new THREE.TorusGeometry(rad * 1.04, 0.026, 8, 28), leadM); cv.getPointAt(u, ring.position); cv.getTangentAt(u, tg); ring.quaternion.setFromUnitVectors(V(0, 0, 1), tg); ring.castShadow = true; g.add(ring); }
    for (const sgn of [-1, 1]) { const off = []; for (let i = 0; i <= 120; i++) { const u = i / 120, p = cv.getPointAt(u), t = cv.getTangentAt(u); off.push(V(p.x - t.y * rad * sgn, p.y + t.x * rad * sgn, p.z)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(crv(off), 120, 0.022, 6, false), leadM)); }
    return { cv, g, tube };
  }
  const TP = trapPts(), main = [...TP, ...bendPts(), ...armPts()];
  pipe(main, R, "#f3d9a4");
  const stack = pipe([V(3.8, -1.6), V(3.8, 1.7), V(3.8, 5), V(3.8, 9.6)], 0.24, "#f3d9a4", 0.4);
  const sewer = pipe([V(3.8, -1.6), V(5.5, -1.62), V(7.5, -1.64), V(10, -1.66)], 0.42, "#8d7a5e", 0.5);
  sewer.tube.material.opacity = 0.3;
  // sink: half-lathe ceramic basin (back half, cutaway), counter (back half), brass faucet, AUDIRA plaque
  const prof = []; for (let i = 0; i <= 16; i++) { const u = i / 16; prof.push(new THREE.Vector2(0.14 + 0.86 * Math.sin(u * Math.PI / 2), 3.85 + 0.62 * (1 - Math.cos(u * Math.PI / 2)) ** 0.8)); }
  const basin = new THREE.Mesh(new THREE.LatheGeometry(prof, 48, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf2ece2, roughness: 0.25, side: THREE.DoubleSide })); basin.castShadow = basin.receiveShadow = true; scene.add(basin);
  const cnt = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 1.1), new THREE.MeshStandardMaterial({ map: stoneTex(41, "#c9b9a2"), roughness: 0.5 })); cnt.position.set(0.1, 4.56, -0.62); cnt.castShadow = cnt.receiveShadow = true; scene.add(cnt);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9953a, metalness: 0.95, roughness: 0.28 });
  const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.62, 20), brass); fc.position.set(0, 4.97, -0.8); scene.add(fc);
  const fs = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.6, 16), brass); fs.rotation.x = Math.PI / 2; fs.position.set(0, 5.24, -0.52); scene.add(fs);
  const drainRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 8, 28), brass); drainRing.rotation.x = Math.PI / 2; drainRing.position.set(0, 3.86, 0); scene.add(drainRing);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1, 12), new THREE.MeshBasicMaterial({ color: C.sapphL, transparent: true, opacity: 0.85 })); scene.add(stream);
  const plaque = new THREE.Group(); scene.add(plaque); plaque.position.set(-1.9, 2.4, -4.0);
  { const pb = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.62, 0.06), brass); plaque.add(pb); const pl = label("AUDIRA", { w: 512, h: 128, font: "700 74px Georgia, serif", color: "#2a1a08", size: 1.4 }); pl.position.set(0, 0.08, 0.035); plaque.add(pl); const pl2 = label("CARA KERJA BENDA", { w: 512, h: 64, font: "700 34px Georgia, serif", color: "#3a2510", size: 1.4 }); pl2.position.set(0, -0.2, 0.035); plaque.add(pl2); }
  // roof with the vent opening
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 2.2), new THREE.MeshStandardMaterial({ color: 0x3b3f4a, roughness: 0.7 })); roof.position.set(3.8, 9.0, -0.6); roof.castShadow = true; scene.add(roof);
  const roofLab = label("ATAP", { w: 256, h: 96, font: "700 60px Georgia, serif", color: "#f6cf5a", size: 0.9 }); roofLab.position.set(2.6, 9.4, 0.55); scene.add(roofLab);
  const capR = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 8, 24), leadM); capR.rotation.x = Math.PI / 2; capR.position.set(3.8, 9.6, 0); scene.add(capR);
  const sewLab = label("SALURAN GOT", { w: 512, h: 96, font: "700 58px Georgia, serif", color: "#a9c23a", size: 1.6 }); sewLab.position.set(6.4, -0.95, 0.5); scene.add(sewLab);

  // water seal: rebuilt each frame from the level (centre-line points below the surface + two surface discs)
  const waterM = new THREE.MeshBasicMaterial({ color: C.sapph, transparent: true, opacity: 0.9 }), waterM2 = new THREE.MeshBasicMaterial({ color: C.old, transparent: true, opacity: 0.9 });
  const wA = new THREE.Mesh(new THREE.BufferGeometry(), waterM), wB = new THREE.Mesh(new THREE.BufferGeometry(), waterM2); wA.renderOrder = wB.renderOrder = 2; scene.add(wA, wB);
  const discM = new THREE.MeshBasicMaterial({ color: C.sapphL, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
  const discs = [0, 1].map(() => { const d = new THREE.Mesh(new THREE.CircleGeometry(RW, 28), discM); d.rotation.x = -Math.PI / 2; scene.add(d); return d; });
  const yOf = (L) => 0.42 + L * (1.25 - 0.42);
  function waterPts(L) {
    const yl = yOf(L); if (L < 0.02) return null;
    const pts = TP.filter((p) => p.y < yl);
    const sx = (side) => { if (yl >= 0.9) return side < 0 ? 0 : 1; const h = Math.sqrt(Math.max(0, 0.25 - (yl - 0.9) ** 2)); return 0.5 + side * h; };
    return [V(sx(-1), yl), ...pts, V(sx(1), yl)];
  }
  function setWater(L, split, t) {
    const pts = waterPts(L);
    wA.visible = wB.visible = !!pts; discs.forEach((d) => (d.visible = !!pts));
    if (!pts) return;
    const n = pts.length, k = Math.max(2, Math.min(n, Math.round(n * split)));
    wA.geometry.dispose(); wB.geometry.dispose();
    wA.geometry = new THREE.TubeGeometry(crv(pts.slice(0, k)), 48, RW, 14, false);
    wB.geometry = k < n - 1 ? new THREE.TubeGeometry(crv(pts.slice(k - 1)), 36, RW, 14, false) : new THREE.BufferGeometry();
    discs[0].position.copy(pts[0]); discs[1].position.copy(pts[n - 1]);
    const ri = pts[0].y >= 0.9 ? 1 : 1.25; discs.forEach((d) => d.scale.set(ri, 1, 1));
    discs[0].position.y += 0.01 * Math.sin(t * 3); discs[1].position.y += 0.01 * Math.sin(t * 3 + 1);
  }

  // particle streams along curves
  function stream3(cv, n, color, size, op = 0.9) {
    const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(size, 1), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op }), n); im.frustumCulled = false; scene.add(im);
    const o = new THREE.Object3D(), RS = mulberry(n * 13 + size * 100), jit = [...Array(n)].map(() => [RS() - 0.5, RS() - 0.5, RS(), 0.7 + RS() * 0.6]);
    // pos(i,u) -> place; fn(t,amt,speed,maxU)
    return (t, amt, speed, maxU = 1, spread = 0.1) => {
      im.visible = amt > 0.01;
      if (!im.visible) return;
      for (let i = 0; i < n; i++) {
        const j = jit[i]; let u = ((i / n + t * speed + j[2] * 0.03) % 1 + 1) % 1;
        if (u > maxU) u = Math.max(0, maxU - 0.006 - 0.02 * j[2] + 0.004 * Math.sin(t * 3 + i));
        cv.getPointAt(u, o.position); o.position.x += j[0] * spread; o.position.z += j[1] * spread; o.position.y += 0.02 * Math.sin(t * 4 + i);
        o.scale.setScalar(Math.max(0.001, amt * j[3])); o.rotation.set(t + i, t * 0.7, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    };
  }
  const gasPts = [V(10, -1.66), V(7.5, -1.64), V(5.5, -1.62), V(3.8, -1.55), V(3.8, 0.4), V(3.8, 1.6), ...[...armPts()].reverse(), ...[...bendPts()].reverse(), ...[...TP].reverse(), V(0, 4.3), V(-0.15, 5.0), V(-0.6, 5.8), V(-1.2, 6.5)];
  const gasCv = crv(gasPts);
  const GS = 500, gasY = [], gasX = []; for (let i = 0; i <= GS; i++) { const p = gasCv.getPointAt(i / GS); gasY.push(p.y); gasX.push(p.x); }
  const trapStart = gasX.findIndex((x, i) => i > 50 && x < 1.05) / GS;
  const sealU = (L) => { if (L < 0.02) return 1; const yl = yOf(L); for (let i = Math.round(trapStart * GS); i <= GS; i++) if (gasY[i] <= yl + 0.04) return i / GS; return 1; };
  const gas = stream3(gasCv, 70, C.gas, 0.07, 0.85), gasBig = stream3(gasCv, 18, C.gasD, 0.14, 0.4);
  const flowCv = crv([V(0, 4.3), ...TP, ...bendPts(), ...armPts(), V(3.8, 1.2), V(3.8, -1.2), V(4.6, -1.62), V(7.5, -1.64), V(10, -1.66)]);
  const flowNew = stream3(flowCv, 60, C.sapphL, 0.06), flowOld = stream3(crv([V(1, 1.1), V(1.0, 1.25), ...bendPts(), ...armPts(), V(3.8, 1.2), V(3.8, -1.2), V(5, -1.62), V(9, -1.66)]), 26, C.old, 0.07);
  const rush = stream3(crv([V(3.8, 9.4), V(3.8, 5), V(3.8, 1.8), V(3.8, -1.3), V(5, -1.62), V(9, -1.66)]), 50, C.sapphL, 0.07);
  const air = stream3(crv([V(3.8, 10.2), V(3.8, 9.6), V(3.8, 6), V(3.8, 2.1)]), 30, "#e8f2ff", 0.05, 0.75);
  const mist = stream3(crv([V(0, 1.2), V(0, 2.4), V(0.05, 3.6), V(-0.1, 4.6)]), 24, "#dfe9ff", 0.04, 0.5);
  // ring that falls into the trap
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 10, 28), new THREE.MeshStandardMaterial({ color: 0xf6cf5a, metalness: 1, roughness: 0.2, emissive: 0x6b4a10, emissiveIntensity: 0.4 })); scene.add(ring);
  const ringCv = crv([V(0, 4.6), V(0, 3.8), ...TP.filter((p) => p.x < 0.55 && p.y < 3.8 && !(p.x === 0 && p.y > 3.8))]);
  // ruler for the seal depth + labels
  const RU = new THREE.Group(); RU.position.set(1.42, 0, 0.05); scene.add(RU);
  { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.03), brass); bar.position.y = 0.95; RU.add(bar); for (let k = 0; k <= 10; k++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(k % 5 ? 0.08 : 0.14, 0.012, 0.03), brass); tk.position.set(0.06, 0.45 + k * 0.1, 0); RU.add(tk); } }
  const band = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1), new THREE.MeshBasicMaterial({ color: C.sapphL, transparent: true, opacity: 0.6 })); band.position.set(0.16, 0, 0); RU.add(band);
  const labUS = label("5–10 cm", { w: 512, h: 128, font: "700 76px Georgia, serif", color: "#9cc4ff", size: 0.9 }); labUS.position.set(0.68, 1.12, 0); RU.add(labUS);
  const labUK = label("7,5 cm", { w: 512, h: 128, font: "700 76px Georgia, serif", color: "#f6cf5a", size: 0.9 }); labUK.position.set(0.68, 0.82, 0); RU.add(labUK);
  // Cumming's S-trap (1775): a ruby-glass S with its own seal, on a brass plaque
  const ST = new THREE.Group(); ST.position.set(-3.6, 0, 0.2); scene.add(ST);
  const sPts = [...trapPts(0, 3.0)]; for (let i = 1; i <= 16; i++) { const a = Math.PI - Math.PI * (i / 16); sPts.push(V(1.5 + 0.5 * Math.cos(a), 1.25 + 0.5 * Math.sin(a))); } for (let y = 1.15; y >= 0.05; y -= 0.12) sPts.push(V(2, y));
  const sp = pipe(sPts, R, "#ffb3b8", 0.34, ST); sp.tube.material.opacity = 0.3;
  const sW = new THREE.Mesh(new THREE.TubeGeometry(crv(waterPts(1)), 48, RW, 14, false), new THREE.MeshBasicMaterial({ color: C.ruby, transparent: true, opacity: 0.92 })); ST.add(sW);
  const sPl = new THREE.Group(); sPl.position.set(1.0, 3.05, 0.1); ST.add(sPl);
  { sPl.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.05), brass)); const a = label("ALEXANDER CUMMING", { w: 1024, h: 96, font: "700 64px Georgia, serif", color: "#2a1a08", size: 2.2 }); a.position.set(0, 0.12, 0.03); sPl.add(a); const b = label("1775 · HURUF S", { w: 1024, h: 96, font: "700 64px Georgia, serif", color: "#5a0f1c", size: 2.2 }); b.position.set(0, -0.16, 0.03); sPl.add(b); }

  // ---------- state over time ----------
  const level = (t) => {
    if (t < A("s3:Tanpa") - 0.6) return 1;
    if (t < A("s4:dibuang")) return 1 - ramp(t, A("s3:Tanpa") - 0.6, A("s3:Tanpa") + 0.2);
    if (t < K.s6) return ramp(t, A("s4:dibuang") + 0.2, A("s4:tertinggal") + 0.3);
    if (t < A("s6:udara") - 0.3) return 1 - ramp(t, A("s6:menyedot") - 0.2, A("s6:menyedot") + 0.6);
    if (t < A("s6:Wastafel")) return ramp(t, A("s6:udara") - 0.3, A("s6:tekanannya"));
    if (t < K.s7 - 0.4) return 1 - ramp(t, A("s6:Wastafel"), A("s6:menguap") + 0.4);
    if (t < K.s8 - 0.3) return ramp(t, K.s7 - 0.4, K.s7 + 0.4);
    if (t < A("s8:alirkan")) return 1 - ramp(t, K.s8 - 0.3, K.s8 + 0.3);
    return ramp(t, A("s8:alirkan"), A("s8:alirkan") + 1.2);
  };
  const OPEN = [[A("s3:Tanpa") - 0.2, A("s4:dibuang") + 0.5], [A("s6:menyedot") + 0.4, A("s6:udara") + 0.6], [A("s6:menguap") - 0.2, K.s7 - 0.3], [K.s8 + 0.1, A("s8:alirkan") + 0.6]];
  const gasMax = (t, L) => { for (const [a, b] of OPEN) if (t >= a && t < b) return Math.min(1, sealU(1) + (t - a) * 0.11); return sealU(Math.max(L, 0.25)); };
  const win = (t, a, b, f = 0.35) => ramp(t, a - f, a + f) * (1 - ramp(t, b - f, b + f));
  const faucet = (t) => Math.max(win(t, A("s4:dibuang") - 0.5, A("s4:tertinggal") + 0.4), win(t, A("s5:mencuci") - 0.3, A("s5:terisi") + 0.4), win(t, A("s8:alirkan") - 0.2, A("s8:alirkan") + 2.6), win(t, K.s7 - 0.5, K.s7 + 0.4, 0.2));

  // ---------- camera ----------
  const cvC = track([
    [0, 1.75, 1.05, 2.9, 0.75, 0.95, 0], [A("s1:genangan") - 0.2, 1.55, 1.0, 2.7, 0.7, 0.92, 0],
    [K.s2 + 0.6, 2.0, 2.4, 10.8, 1.65, 2.2, 0], [K.s2e, 2.2, 2.3, 10.2, 1.7, 2.15, 0],
    [A("s3:saluran") + 0.3, 5.2, -0.6, 6.4, 4.9, -1.0, 0], [A("s3:Tanpa") + 0.4, 2.0, 2.6, 11.2, 1.8, 2.4, 0], [A("s3:rumah"), 0.4, 4.4, 6.4, 0.1, 4.4, 0],
    [K.s4 + 0.7, 1.0, 0.95, 3.4, 0.55, 0.75, 0], [A("s4:Gas"), 1.75, 1.3, 3.4, 1.0, 1.15, 0], [K.s4e, 1.8, 1.35, 3.5, 1.05, 1.15, 0],
    [A("s5:mencuci") + 0.2, 0.7, 4.6, 5.4, 0.15, 4.3, 0], [A("s5:lama") + 0.3, 1.6, 1.8, 6.6, 1.5, 1.3, 0], [A("s5:cincin") + 0.3, 0.75, 1.0, 3.2, 0.45, 0.65, 0], [K.s5e, 0.8, 0.95, 3.1, 0.5, 0.62, 0],
    [A("s6:deras") + 0.3, 2.6, 1.6, 7.8, 2.4, 1.0, 0], [A("s6:udara") + 0.3, 4.9, 5.2, 7.2, 3.8, 5.8, 0], [A("s6:atap"), 4.9, 8.2, 6.0, 3.8, 8.9, 0], [A("s6:Wastafel") + 0.4, 0.9, 2.4, 5.6, 0.4, 2.1, 0], [K.s6e, 0.9, 2.2, 5.3, 0.4, 1.9, 0],
    [K.s7 + 0.7, 1.95, 0.95, 3.6, 1.15, 0.88, 0], [A("s7:Inggris") + 0.3, 2.05, 0.95, 3.4, 1.25, 0.9, 0], [A("s7:Alexander"), -1.9, 2.0, 6.4, -2.6, 1.6, 0], [K.s7e, -2.0, 2.0, 6.0, -2.6, 1.65, 0],
    [K.s8 + 0.8, 1.0, 3.3, 11.0, 1.2, 3.3, -1], [A("s8:alirkan") + 0.8, 0.9, 2.6, 8.0, 0.7, 2.4, 0], [A("s8:AUDIRA") + 0.6, 1.1, 3.8, 14.2, 1.3, 3.9, -1.5], [K.dur, 1.1, 4.0, 15.0, 1.3, 4.0, -1.5],
  ]);
  const look = new THREE.Vector3();

  return (t) => {
    const c = cvC(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.7), c[1] + 0.025 * Math.sin(t * 0.9 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    const L = level(t);
    // old water (grey-teal) from "diganti" until the new water has pushed through
    const oldOn = t > A("s5:diganti") - 0.3 && t < A("s5:terisi") + 0.6;
    const push = ramp(t, A("s5:baru") - 0.2, A("s5:lama") + 0.6);
    const tint = ramp(t, A("s5:diganti") - 0.3, A("s5:diganti") + 0.4);
    waterM.color.set(C.sapph); waterM2.color.set(oldOn ? C.old : C.sapph);
    if (oldOn) waterM.color.set(push > 0.02 ? C.sapph : new THREE.Color(C.sapph).lerp(new THREE.Color(C.old), tint).getStyle());
    setWater(L, oldOn ? (push > 0.02 ? push : 1) : 1, t);
    glow.intensity = 2.4 * L;
    // gas
    const gm = gasMax(t, L), gasAmt = 0.7 + 0.3 * Math.sin(t * 1.3);
    gas(t, gasAmt, 0.05, gm, 0.14); gasBig(t, gasAmt, 0.035, gm, 0.2);
    const gp = gasCv.getPointAt(Math.min(gm, 0.999)); gasL.position.set(gp.x, gp.y, 0.4); gasL.intensity = 1.4;
    // water flows
    const fa = faucet(t);
    stream.visible = fa > 0.02; stream.scale.set(fa, 1.18, fa); stream.position.set(0, 4.56, -0.22);
    flowNew(t, fa, 0.32, 1, 0.08);
    flowOld(t, win(t, A("s5:baru") - 0.2, A("s5:terisi") + 0.2), 0.3, 1, 0.08);
    rush(t, win(t, A("s6:deras") - 0.4, A("s6:menyedot") + 0.9), 0.55, 1, 0.12);
    air(t, win(t, A("s6:udara") - 0.3, A("s6:tekanannya") + 0.6), 0.4, 1, 0.1);
    mist(t, win(t, A("s6:Wastafel") + 0.4, A("s6:menguap") + 1.2), 0.12, 1, 0.12);
    stack.tube.material.emissiveIntensity = 1 + 2.5 * win(t, A("s6:udara") - 0.2, A("s6:tekanannya") + 0.4);
    // ring falls into the U and stays caught there until s6
    const rf = ramp(t, A("s5:cincin") - 0.1, A("s5:tersangkut") - 0.1);
    ring.visible = t > A("s5:cincin") - 0.2 && t < K.s6 - 0.1;
    ringCv.getPointAt(Math.min(0.999, rf), ring.position); ring.position.z = 0.02; ring.rotation.set(0.6 + rf * 4, 0.4 + t, 0);
    if (rf >= 1) { ring.position.set(0.47, 0.44, 0.02); ring.rotation.set(1.3, 0.2, 0.3 * Math.sin(t)); }
    // ruler + labels (s7)
    const ru = ramp(t, K.s7 - 0.2, K.s7 + 0.6) * (1 - ramp(t, A("s7:Alexander") + 0.5, A("s7:Alexander") + 1.2));
    RU.visible = ru > 0.01; RU.scale.set(1, Math.max(0.001, ru), 1);
    const bd = ramp(t, A("s7:lima") - 0.2, A("s7:lima") + 0.4); band.scale.y = Math.max(0.001, 0.68 * bd); band.position.y = 0.57 + 0.34 * bd;
    labUS.material.opacity = 0.25 + 0.75 * bd; labUK.material.opacity = 0.25 + 0.75 * ramp(t, A("s7:setengah") - 0.2, A("s7:setengah") + 0.3);
    const sv = back(ramp(t, A("s7:Alexander") - 0.6, A("s7:Alexander") + 0.4), 1.2);
    ST.visible = t > A("s7:Alexander") - 0.7; ST.scale.setScalar(Math.max(0.001, sv));
    sPl.scale.setScalar(Math.max(0.001, ramp(t, A("s7:seribu") - 0.3, A("s7:seribu") + 0.3)));
    // window glow swells at the payoff; dust drifts in the shafts
    const sun = 0.82 + 0.18 * ramp(t, K.s8, A("s8:AUDIRA")) + 0.03 * Math.sin(t * 0.8);
    qm.material.color.setScalar(sun); shafts.forEach((s, i) => (s.material.opacity = 0.07 + 0.05 * sun + 0.02 * Math.sin(t * 0.6 + i)));
    pool.material.opacity = 0.35 + 0.3 * (sun - 0.82) / 0.18;
    plaque.children[0].material.emissiveIntensity = 0;
    dustS.forEach((d, i) => { o3.position.set(WX + d[0] + 0.2 * Math.sin(t * 0.2 * d[4] + d[3]), ((d[1] + t * 0.08 * d[4]) % 9), -1.2 + d[2] * 0.5); o3.scale.setScalar(1); o3.rotation.set(0, 0, 0); o3.updateMatrix(); dust.setMatrixAt(i, o3.matrix); });
    dust.instanceMatrix.needsUpdate = true;
    comp.render();
  };
}
