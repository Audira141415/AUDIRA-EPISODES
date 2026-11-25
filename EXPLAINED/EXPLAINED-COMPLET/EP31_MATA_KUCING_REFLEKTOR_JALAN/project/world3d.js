// EP31 MATA KUCING REFLEKTOR JALAN (STAINEDGLASS): a night road under a sky that is one huge leadlight window
// (sapphire, violet and emerald quarries, amber star panes, a moon rose, dark lead cames). Glass is always the
// brightest thing: the cat's-eye lenses are jewel panes ringed with lead, lit only by the car's headlights.
// Scale: 1 unit = 10 cm. Stud at the origin, road along z, the car comes from +z with its lights pointing -z.
//   s1 macro on a glowing stud        s2 row of studs down the road, Percy Shaw as a generic figure with a name plate
//   s3 cutaway: rubber dome in a cast-iron housing, two lens pairs     s4 leaded glass ball lens, rays focus behind it
//   s5 rays return; beam back to the driver's eye     s6 truck tyre presses the dome, lenses sink, wiper, rain rinse
//   s7 blackout: hooded headlights, the road fills with eyes (factory output)     s8 driver view, eyes stare back
// Generic products, no logos. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, envStrips, label } from "./lib3d.js";

const C = {
  bg: "#0b0e1a", asph: "#2a2b31", lead: "#1a1b1e", iron: "#3a3c42", rubber: "#e8e3d8", amber: "#ffb340", ruby: "#e0304a",
  sapph: "#1f4fbf", violet: "#5a2d9c", emer: "#1f9e6a", gold: "#e8b04a", brass: "#c79a3c", cream: "#f5ecd8", car: "#6b1f2a",
};
const SERIF = "Georgia, 'Times New Roman', serif", SANS = "'Arial Black', Arial, Helvetica, sans-serif";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// DOCUMENTARY_WARM over a night palette: warm highlights, deep blue lifted shadows, saturated jewels.
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(vec3(l),c,1.12);c=mix(c,c*vec3(1.06,1.0,0.9),l);c+=vec3(0.01,0.012,0.03)*(1.0-l);
  c=(c-0.5)*1.06+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function envf(P) {
  return (t) => {
    if (t <= P[0][0]) return P[0][1];
    for (let i = 1; i < P.length; i++) if (t < P[i][0]) { const [a, va] = P[i - 1], [b, vb] = P[i]; return va + (vb - va) * ramp(t, a, b); }
    return P[P.length - 1][1];
  };
}
const std = (c, r = 0.6, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...x });
const UP = new THREE.Vector3(0, 1, 0), _v = new THREE.Vector3();
function between(m, a, b) { _v.subVectors(b, a); const L = _v.length(); m.position.copy(a).addScaledVector(_v, 0.5); m.quaternion.setFromUnitVectors(UP, _v.normalize()); m.scale.set(1, Math.max(L, 1e-3), 1); }

function person(shirt, pants, skin, hat) {
  const G = new THREE.Group(), S = std(skin, 0.6), T = std(shirt, 0.75), P = std(pants, 0.8);
  const add = (geo, mat, x, y, z, p = G) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  add(new THREE.CylinderGeometry(0.21, 0.15, 0.46, 12), T, 0, 0.93, 0);
  add(new THREE.SphereGeometry(0.2, 12, 8), T, 0, 1.13, 0).scale.set(1.3, 0.45, 0.8);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8), S, 0, 1.21, 0);
  add(new THREE.SphereGeometry(0.11, 16, 12), S, 0, 1.34, 0).scale.set(0.95, 1.1, 1);
  if (hat) { add(new THREE.CylinderGeometry(0.125, 0.125, 0.06, 16), std(hat, 0.8), 0, 1.44, 0); add(new THREE.BoxGeometry(0.16, 0.02, 0.1), std(hat, 0.8), 0, 1.42, 0.11); }
  const limb = (x, y, l1, l2, w, mat, bend) => {
    const a = new THREE.Group(); a.position.set(x, y, 0); G.add(a);
    add(new THREE.CylinderGeometry(w, w * 0.85, l1, 8), mat, 0, -l1 / 2, 0, a);
    const b = new THREE.Group(); b.position.y = -l1; a.add(b); b.rotation.x = bend;
    add(new THREE.CylinderGeometry(w * 0.85, w * 0.7, l2, 8), mat === T ? S : mat, 0, -l2 / 2, 0, b);
    return { a, b };
  };
  const armL = limb(-0.26, 1.13, 0.27, 0.25, 0.045, T, -0.45), armR = limb(0.26, 1.13, 0.27, 0.25, 0.045, T, -0.45);
  const legL = limb(-0.08, 0.72, 0.36, 0.36, 0.06, P, 0.12), legR = limb(0.08, 0.72, 0.36, 0.36, 0.06, P, 0.12);
  legL.a.rotation.x = -0.1; legR.a.rotation.x = -0.1; armL.a.rotation.z = 0.12; armR.a.rotation.z = -0.12;
  return { G, armL, armR, legL, legR };
}

// leaded-glass canvas: one flat colour per cell, dark came lines
function leadTex(w, h, cells, R) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = C.lead; g.fillRect(0, 0, w, h);
    for (const [x, y, cw, ch, col] of cells) {
      const j = 1 + (R() - 0.5) * 0.16, c = new THREE.Color(col).multiplyScalar(j);
      g.fillStyle = "#" + c.getHexString(); g.fillRect(x + 3, y + 3, cw - 6, ch - 6);
      g.fillStyle = "rgba(255,255,255,.08)"; for (let k = 0; k < 3; k++) g.fillRect(x + 3 + R() * cw * 0.7, y + 3, 2, ch - 6);
    }
  });
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.bg, fog: 0.0016, exp: 0.9, bloom: [0.55, 0.55, 0.86], fov: 38 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  envStrips(r, scene, [[30, 6, "#ffd9a0", 1.6, 0, 20, 30], [8, 30, "#7f9cff", 0.8, -30, 10, -10]], 0x05060c);
  scene.environmentIntensity = 0.3;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const R = mulberry(3101);

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight("#5a6aa8", "#141018", 0.35));
  const moon = new THREE.DirectionalLight("#a9b8ff", 0.6); moon.position.set(-40, 60, -80); scene.add(moon);
  const heads = [-1, 1].map((s) => { const L = new THREE.SpotLight("#ffd9a0", 0, 400, 0.42, 0.55, 1.2); L.castShadow = s > 0; scene.add(L); scene.add(L.target); return L; });
  heads[1].shadow.mapSize.set(1024, 1024);
  const lensLight = new THREE.PointLight(C.amber, 0, 8, 2); lensLight.position.set(0, 0.6, 1.6); scene.add(lensLight);

  // ---------- sky: one huge leadlight window ----------
  const cells = [];
  const SW = 2048, SH = 1400;
  for (let y = 0; y < SH; y += 70) for (let x = 0; x < SW; x += 70) {
    const off = (Math.floor(y / 70) % 2) * 35, q = R(), dy = 1 - y / SH;
    const col = q < 0.05 ? C.amber : q < 0.4 ? C.sapph : q < 0.7 ? "#16307a" : q < 0.88 ? C.violet : C.emer;
    cells.push([x - off, y, 70, 70, dy < 0.25 && q < 0.6 ? "#123a5a" : col]);
  }
  const skyTex = canvasTex(SW, SH, (g) => {
    g.fillStyle = C.lead; g.fillRect(0, 0, SW, SH);
    for (const [x, y, cw, ch, col] of cells) { const c = new THREE.Color(col).multiplyScalar(1 + (R() - 0.5) * 0.16); g.fillStyle = "#" + c.getHexString(); g.beginPath(); g.moveTo(x + cw / 2, y + 4); g.lineTo(x + cw - 4, y + ch / 2); g.lineTo(x + cw / 2, y + ch - 4); g.lineTo(x + 4, y + ch / 2); g.closePath(); g.fill(); }
    // moon rose
    const mx = SW * 0.68, my = SH * 0.26;
    for (let k = 0; k < 16; k++) { const a0 = (k / 16) * Math.PI * 2; g.fillStyle = k % 2 ? "#f3d27a" : "#e9b84e"; g.beginPath(); g.moveTo(mx, my); g.arc(mx, my, 150, a0 + 0.03, a0 + Math.PI / 8 - 0.03); g.closePath(); g.fill(); }
    g.strokeStyle = C.lead; g.lineWidth = 9; for (const rr of [60, 110, 150]) { g.beginPath(); g.arc(mx, my, rr, 0, 7); g.stroke(); }
    g.fillStyle = "#fff4cf"; g.beginPath(); g.arc(mx, my, 56, 0, 7); g.fill();
    // AUDIRA in amber glass letters, leaded
    g.font = `900 150px ${SANS}`; g.textAlign = "center"; g.lineWidth = 14; g.strokeStyle = C.lead; g.strokeText("AUDIRA", SW * 0.3, SH * 0.3); g.fillStyle = "#ffbe55"; g.fillText("AUDIRA", SW * 0.3, SH * 0.3);
    // vertical lancet mullions and iron saddle bars
    g.fillStyle = "#0d0d10"; for (let x = 0; x < SW; x += 340) g.fillRect(x - 9, 0, 18, SH); for (let y = 160; y < SH; y += 280) g.fillRect(0, y - 4, SW, 8);
  });
  const skyM = new THREE.MeshBasicMaterial({ map: skyTex, fog: false, toneMapped: true });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1100, 750), skyM); sky.position.set(60, 230, -560); scene.add(sky);

  // ---------- road: slabs around a hole for the housing; the near slab slides away for cutaways ----------
  const asphTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = C.asph; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { const v = 30 + R() * 50; g.fillStyle = `rgba(${v},${v},${v + 6},.6)`; g.fillRect(R() * w, R() * h, 2, 2); } }, [8, 8]);
  const strata = canvasTex(512, 256, (g, w, h) => {
    const bands = [["#2a2b31", 0.3], ["#4a4740", 0.25], ["#6b604e", 0.25], ["#3b352c", 0.2]]; let y = 0;
    for (const [c, f] of bands) { g.fillStyle = c; g.fillRect(0, y, w, f * h); for (let i = 0; i < 160; i++) { g.fillStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.arc(R() * w, y + R() * f * h, 1 + R() * 4, 0, 7); g.fill(); } y += f * h; }
  });
  const aM = std("#ffffff", 0.82, 0, { map: asphTex }), cutM = std("#ffffff", 0.9, 0, { map: strata });
  const slab = (x0, x1, z0, z1, cutFace) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 3, z1 - z0), cutFace ? [cutM, aM, aM, aM, aM, aM] : aM);
    m.position.set((x0 + x1) / 2, -1.5, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return m;
  };
  slab(-80, -1.6, -700, 300, true); slab(-1.6, 1.6, 1.3, 300, true); slab(-1.6, 1.6, -700, -1.3, true);
  const near = slab(1.6, 80, -700, 300, false);
  const lineM = new THREE.MeshStandardMaterial({ color: "#d9d2c0", roughness: 0.7 });
  for (let z = -680; z < 280; z += 30) { if (Math.abs(z) < 8) continue; const d = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 12), lineM); d.position.set(0, 0.02, z + 15); scene.add(d); }
  for (const x of [-34, 34]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 980), lineM); e.position.set(x, 0.02, -200); scene.add(e); }

  // ---------- the stud: cast-iron housing, rubber dome, two lens pairs, lead rings ----------
  const ironM = std(C.iron, 0.55, 0.7), rubM = std(C.rubber, 0.78, 0);
  const hous = new THREE.Group(); scene.add(hous);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 2.6), ironM); hb.position.y = -1.25; hous.add(hb);
  const walls = [[0.2, 1.3, 2.6, -1.5, -0.6, 0], [3.2, 1.3, 0.2, 0, -0.6, 1.2], [3.2, 1.3, 0.2, 0, -0.6, -1.2]].map(([w, h, d, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ironM); m.position.set(x, y, z); hous.add(m); return m; });
  const wallX = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 2.6), ironM); wallX.position.set(1.5, -0.6, 0); hous.add(wallX);
  const flange = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 3.0), ironM); flange.position.y = 0.02; hous.add(flange);
  const stamp = label("AUDIRA", { w: 512, h: 128, font: `900 90px ${SANS}`, color: C.brass, size: 1.5 }); stamp.rotation.x = -Math.PI / 2; stamp.position.set(0, 0.07, 1.33); hous.add(stamp);
  const water = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.18, 2.2), std("#3a78c8", 0.08, 0, { transparent: true, opacity: 0.55, emissive: new THREE.Color("#183a70"), emissiveIntensity: 0.4 })); water.position.y = -1.05; hous.add(water);
  const dome = new THREE.Group(); hous.add(dome);
  const domeM = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), rubM); domeM.scale.set(1.35, 1.15, 1.05); domeM.position.y = -0.6; domeM.castShadow = true; dome.add(domeM);
  const domeBase = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.6, 2.1), rubM); domeBase.position.y = -0.9; dome.add(domeBase);
  const lensMat = (col) => new THREE.MeshStandardMaterial({ color: col, roughness: 0.08, metalness: 0.1, emissive: new THREE.Color(col), emissiveIntensity: 0.5 });
  const lensF = lensMat(C.amber), lensB = lensMat(C.ruby);
  const lensGrp = new THREE.Group(); dome.add(lensGrp);
  const leadM = std(C.lead, 0.4, 0.7);
  for (const [zs, mat] of [[1, lensF], [-1, lensB]]) for (const xs of [-0.48, 0.48]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), mat); l.position.set(xs, -0.05, zs * 0.95); lensGrp.add(l);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.05, 8, 24), leadM); ring.position.copy(l.position); lensGrp.add(ring);
  }
  const wiper = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), std("#151515", 0.9)); wiper.position.set(0, -0.02, 1.25); hous.add(wiper);

  // distant studs down the road (glow only) + the factory field of eyes
  const NF = 900, eyeGeo = new THREE.SphereGeometry(0.32, 10, 8);
  const eyeM = new THREE.MeshBasicMaterial({ color: C.amber, toneMapped: false });
  const field = new THREE.InstancedMesh(eyeGeo, eyeM, NF); field.frustumCulled = false; scene.add(field);
  const fseed = []; for (let i = 0; i < NF; i++) {
    const row = i < 40 ? 0 : 1 + Math.floor(R() * 7), lane = [0, -34, 34, -17, 17, -51, 51, -8.5][row];
    const z = i < 40 ? -30 * (i + 1) : -20 - R() * 640;
    fseed.push([lane + (i < 40 ? 0 : (R() - 0.5) * 2), z, i < 40 ? -1 : R()]);
  }
  const fieldOn = (t) => ramp(t, A("s7:juta") - 1.2, A("s7:juta") + 0.6);
  const dum = new THREE.Object3D();

  // ---------- people, car, tyre ----------
  const shaw = person("#5b4a3a", "#2e2a26", "#e3b48e", "#3b3530"); shaw.G.scale.setScalar(12); shaw.G.position.set(12, 0, -6); shaw.G.rotation.y = -0.5; scene.add(shaw.G);
  const plate = label("PERCY SHAW · HALIFAX", { w: 1024, h: 140, font: `700 72px ${SERIF}`, color: "#2a1d10", bg: C.brass, size: 11 }); plate.position.set(12, 21, -6); scene.add(plate);
  const car = new THREE.Group(); scene.add(car);
  const carM = std(C.car, 0.32, 0.6), glassM = std("#10141c", 0.05, 0.6);
  const body = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 40), carM); body.position.set(0, 4, 20); body.castShadow = true; car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(15, 4.2, 18), glassM); cabin.position.set(0, 8.6, 24); car.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.6, 15), carM); roof.position.set(0, 10.9, 25); car.add(roof);
  for (const [x, z] of [[-8.5, 7], [8.5, 7], [-8.5, 33], [8.5, 33]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 2.2, 24), std("#151515", 0.8)); w.rotation.z = Math.PI / 2; w.position.set(x, 3.2, z); car.add(w); }
  const hlM = new THREE.MeshBasicMaterial({ color: "#fff1d0", toneMapped: false });
  const masks = [];
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.CircleGeometry(1.7, 24), hlM); h.position.set(s * 6, 4.6, -0.05); h.rotation.y = Math.PI; car.add(h);
    const mk = new THREE.Group(); mk.position.set(s * 6, 4.6, -0.2); car.add(mk);
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.6, 0.2), std("#0c0c0c", 0.9)); top.position.y = 0.95; mk.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.6, 0.2), std("#0c0c0c", 0.9)); bot.position.y = -0.95; mk.add(bot);
    masks.push(mk);
  }
  const driver = new THREE.Group(); driver.position.set(4, 7.4, 26); car.add(driver);
  const dHead = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 12), std("#d9a982", 0.6)); driver.add(dHead);
  const dEye = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshBasicMaterial({ color: "#ffe2a0", toneMapped: false })); dEye.position.set(0.5, 0.2, -1.2); driver.add(dEye);
  const tyre = new THREE.Group(); scene.add(tyre);
  const tyM = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 3.4, 40), std("#161616", 0.85)); tyM.rotation.z = Math.PI / 2; tyre.add(tyM);
  for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2, tr = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 0.9), std("#0d0d0d", 0.9)); tr.position.set(0, Math.cos(a) * 6.05, Math.sin(a) * 6.05); tr.rotation.x = -a; tyre.add(tr); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3.6, 20), std("#6c6f75", 0.4, 0.8)); hub.rotation.z = Math.PI / 2; tyre.add(hub);

  // ---------- light beams (additive cones) ----------
  const beamMat = (col, o) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const inBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 6, 1, 24, 1, true), beamMat("#ffd9a0", 0.0)); scene.add(inBeam);
  const outBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 2.6, 1, 24, 1, true), beamMat(C.amber, 0.0)); scene.add(outBeam);

  // ---------- s4/s5 station: a leaded glass ball lens with a mirror back, ray paths ----------
  const ST = new THREE.Vector3(-70, 10, 0), RL = 6;
  const st = new THREE.Group(); st.position.copy(ST); scene.add(st);
  const ballCells = []; for (let y = 0; y < 512; y += 64) for (let x = 0; x < 1024; x += 64) ballCells.push([x, y, 64, 64, R() < 0.5 ? "#f2b545" : R() < 0.5 ? "#e89a2c" : "#ffd27a"]);
  const lensBall = new THREE.Mesh(new THREE.SphereGeometry(RL, 48, 32), new THREE.MeshBasicMaterial({ map: leadTex(1024, 512, ballCells, R), transparent: true, opacity: 0.88, toneMapped: true })); st.add(lensBall);
  const mirror = new THREE.Mesh(new THREE.SphereGeometry(RL * 1.02, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std("#d9d9e0", 0.12, 1, { side: THREE.DoubleSide })); mirror.rotation.x = Math.PI / 2; st.add(mirror);
  const focus = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshBasicMaterial({ color: "#fff3c4", toneMapped: false })); focus.position.set(0, 0, -RL); st.add(focus);
  const lensLab = label("LAPISAN PEMANTUL", { w: 900, h: 120, font: `700 66px ${SANS}`, color: "#2a1d10", bg: C.brass, size: 8.5 }); lensLab.position.set(0, -RL - 2.6, -RL * 0.6); st.add(lensLab);
  const NR = 7, NS = 90, rays = [];
  for (let i = 0; i < NR; i++) {
    const h = -4.2 + (8.4 * i) / (NR - 1), zf = Math.sqrt(RL * RL - h * h);
    const pathIn = [[0, h, 30], [0, h, zf], [0, 0, -RL]], pathOut = [[0, 0, -RL], [0, -h, zf], [0, -h * 1.18, 30]];
    const mk = (path, col) => {
      const pos = new Float32Array(NS * 3), seg = [];
      let L = 0; for (let k = 1; k < path.length; k++) { const d = Math.hypot(...path[k].map((v, j) => v - path[k - 1][j])); seg.push(d); L += d; }
      for (let n = 0; n < NS; n++) { let s = (n / (NS - 1)) * L, k = 0; while (k < seg.length - 1 && s > seg[k]) { s -= seg[k]; k++; } const u = Math.min(1, s / seg[k]); for (let j = 0; j < 3; j++) pos[n * 3 + j] = path[k][j] + (path[k + 1][j] - path[k][j]) * u; }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, toneMapped: false, transparent: true })); l.frustumCulled = false; st.add(l); return l;
    };
    rays.push([mk(pathIn, "#ffe7b0"), mk(pathOut, C.amber)]);
  }

  // ---------- rain (s6), dust in the beams ----------
  const NRn = 300, rpos = new Float32Array(NRn * 6), rseed = []; for (let i = 0; i < NRn; i++) rseed.push([(R() - 0.5) * 40, (R() - 0.5) * 40, R()]);
  const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(rpos, 3));
  const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: "#9fb4ff", transparent: true, opacity: 0.0 })); rain.frustumCulled = false; scene.add(rain);
  const ND = 220, dpos = new Float32Array(ND * 3), dseed = []; for (let i = 0; i < ND; i++) dseed.push([(R() - 0.5) * 30, R() * 14, R() * 120, R()]);
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: "#ffe2b0", size: 0.18, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); dust.frustumCulled = false; scene.add(dust);

  // ---------- timing ----------
  const carZ = envf([[0, 330], [K.s2, 250], [K.s3, 170], [K.s4, 120], [A("s5:pulang") - 1, 52], [K.s6, 48], [K.dur, 48]]);
  const cut = (t) => Math.max(ramp(t, A("s3:Kubah") - 0.8, A("s3:Kubah")) * (1 - ramp(t, K.s4 - 0.2, K.s4 + 0.6)), ramp(t, K.s6 + 0.2, A("s6:Kubah") - 0.2) * (1 - ramp(t, K.s7 - 0.3, K.s7 + 0.4)));
  const tyreZ = envf([[K.s6, 22], [A("s6:dilindas"), 14], [A("s6:tertekan"), 0], [A("s6:Air"), 0], [A("s6:membersihkannya"), -14], [K.s7, -22]]);
  const tyreOn = (t) => ramp(t, K.s6, K.s6 + 0.4) * (1 - ramp(t, K.s7 - 0.3, K.s7));
  const rainOn = (t) => ramp(t, A("s6:Air") - 0.3, A("s6:Air") + 0.4) * (1 - ramp(t, A("s6:membersihkannya") + 0.4, K.s7));
  const maskOn = (t) => ramp(t, A("s7:ditutup") - 0.2, A("s7:ditutup") + 0.4) * (1 - ramp(t, K.s8, K.s8 + 0.8));
  const black = (t) => ramp(t, A("s7:pemadaman") - 0.3, A("s7:pemadaman") + 0.6) * (1 - ramp(t, A("s7:juta") - 1.0, K.s8 + 0.8));
  const rayIn = (t) => ramp(t, A("s4:membelokkan") - 0.4, A("s4:titik") + 0.3);
  const rayOut = (t) => ramp(t, A("s5:memantul") - 0.2, A("s5:sama"));
  const stOn = (t) => ramp(t, A("s4:mirip") - 0.2, A("s4:Lensanya")) * (1 - ramp(t, A("s5:pulang") - 1.0, A("s5:pulang")));
  const backBeam = (t) => Math.max(ramp(t, A("s5:pulang") - 0.6, A("s5:pulang") + 0.6) * (1 - ramp(t, K.s6 - 0.4, K.s6)), ramp(t, A("s8:menatap") - 0.6, A("s8:menatap") + 0.4) * 0.6);
  const plateOn = (t) => ramp(t, A("s2:Percy") - 0.3, A("s2:Percy") + 0.3) * (1 - ramp(t, K.s3 - 0.3, K.s3 + 0.2));

  const camT = track([
    [0, 1.7, 1.25, 6.4, 0, 0.5, 0],
    [A("s1:mobilmu"), 2.8, 2.1, 9.5, 0, 0.6, 0],
    [A("s2:paku") + 0.4, 6, 4.5, 30, 0, 0.8, -40],
    [A("s2:Inggris"), 3, 5, 34, 0, 1.2, -50],
    [A("s2:Percy") + 0.2, 26, 11, 24, 10, 9, -8],
    [K.s2e, 24, 10, 20, 10, 9.5, -8],
    [A("s3:Kubah") + 0.3, 11, 3.2, 8, 0, -0.4, 0],
    [A("s3:aspal"), 9, 2.4, 6, 0, -0.5, 0],
    [A("s3:pasang"), 7.5, 4, -5, 0, -0.2, 0],
    [K.s3e, 8.5, 4.6, 7.5, 0, -0.2, 0],
    [A("s4:mirip"), 2.2, 1.0, 4.2, 0, 0, 0.9],
    [A("s4:Lensanya") + 0.4, -40, 13, 30, -70, 10, 0],
    [A("s4:pemantul"), -38, 12, 22, -70, 9.5, -1],
    [A("s5:sama"), -40, 15, 26, -70, 10, 0],
    [A("s5:pulang") + 0.4, -26, 36, -38, 2, 4, 28],
    [A("s5:pengemudi"), -10, 22, -12, 3, 6, 36],
    [K.s5e, -6, 18, -8, 3, 6, 34],
    [A("s6:dilindas"), 15, 5, 13, 0, 1, 0],
    [A("s6:turun"), 12, 3, 8, 0, -0.3, 0],
    [A("s6:membilas"), 10, 3.4, 9, 0, -0.4, 0],
    [K.s6e, 13, 5, 12, 0, 0.5, 0],
    [A("s7:ditutup") + 0.2, 16, 8, 14, 0, 4.5, 45],
    [A("s7:juta") - 0.4, 0, 42, 70, 0, 0, -60],
    [K.s7e, 0, 36, 60, 0, 0, -80],
    [A("s8:menatap"), 2, 3.4, 26, 0, 1, -60],
    [K.dur, 0.8, 2.6, 14, 0, 0.8, -40],
  ]);
  const look = new THREE.Vector3(), a3 = new THREE.Vector3(), b3 = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    const hx = 0.15 * Math.sin(t * 0.41) + 0.08 * Math.sin(t * 0.9), hy = 0.1 * Math.sin(t * 0.33 + 1);
    cam.position.set(c[0] + hx, c[1] + hy, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // car and headlights
    const cz = carZ(t), mk = maskOn(t);
    car.position.set(0, 0, cz);
    masks.forEach((m) => { m.visible = mk > 0.01; m.scale.y = 0.3 + 0.7 * eout(mk); });
    const hlI = 2500 * (1 - 0.72 * mk) * (1 - 0.3 * black(t));
    heads.forEach((L, i) => { const s = i ? 1 : -1; L.position.set(s * 6, 4.6, cz - 0.5); L.target.position.set(s * 2, 0, cz - 140); L.intensity = hlI; L.angle = 0.42 - 0.22 * mk; });
    hlM.color.setScalar(1 - 0.5 * mk);
    // the cat's eye glows only from the borrowed light
    const dist = Math.max(20, cz), lit = clamp01((90 / dist) * (90 / dist)) * (1 - 0.6 * mk);
    const glow = 0.25 + 2.6 * lit;
    lensF.emissiveIntensity = glow; lensB.emissiveIntensity = 0.35 + 0.4 * lit;
    lensLight.intensity = 6 * lit;
    // sky dims in the blackout
    skyM.color.setScalar(0.85 - 0.6 * black(t));

    // cutaway: the near slab and the near housing wall drop away
    const cu = cut(t); near.position.y = -1.5 - 14 * eout(cu); near.visible = cu < 0.97; wallX.visible = cu < 0.5;
    // tyre presses the dome, lenses sink past the wiper
    const tz = tyreZ(t), to = tyreOn(t), press = to * clamp01(1 - Math.abs(tz) / 5.5);
    tyre.visible = to > 0.01; tyre.position.set(0, 6 - 0.4 * press + 3 * (1 - to), tz); tyre.rotation.x = -tz / 6;
    dome.position.y = -0.62 * press; dome.scale.set(1 + 0.12 * press, 1 - 0.35 * press, 1 + 0.06 * press);
    lensGrp.position.y = -0.25 * press;
    const ro = rainOn(t);
    water.position.y = -1.05 + 0.12 * ro + 0.05 * Math.sin(t * 6) * ro; water.scale.y = 1 + 1.4 * ro;
    for (let i = 0; i < NRn; i++) {
      const [x, z, q] = rseed[i], y = 30 - (((q * 30 + t * 34) % 30) + 30) % 30;
      rpos[i * 6] = x; rpos[i * 6 + 1] = y; rpos[i * 6 + 2] = z; rpos[i * 6 + 3] = x - 0.2; rpos[i * 6 + 4] = y + 1.6; rpos[i * 6 + 5] = z;
    }
    rg.attributes.position.needsUpdate = true; rain.material.opacity = 0.45 * ro; rain.visible = ro > 0.01;

    // field of eyes: the row down the centre line always, the factory flood in s7-s8
    const fo = fieldOn(t);
    for (let i = 0; i < NF; i++) {
      const [x, z, q] = fseed[i], on = q < 0 ? 1 : clamp01((fo - q * 0.85) * 6);
      dum.position.set(x, on > 0 ? 0.15 : -50, z); dum.scale.setScalar(Math.max(0.001, on)); dum.updateMatrix(); field.setMatrixAt(i, dum.matrix);
    }
    field.instanceMatrix.needsUpdate = true;
    eyeM.color.set(C.amber).multiplyScalar(0.55 + 0.9 * lit);

    // people
    const po = plateOn(t); plate.visible = po > 0.01; plate.material.opacity = po;
    shaw.armR.a.rotation.x = -0.9 * ramp(t, A("s2:Percy"), A("s2:Halifax")); shaw.G.visible = t < K.s3 + 1;

    // beams
    inBeam.visible = lit > 0.05 && t < K.s7 + 1;
    a3.set(1.5, 4.6, cz - 1); b3.set(0, 0.4, 1.0); between(inBeam, b3, a3); inBeam.material.opacity = 0.06 * lit * (1 - mk);
    const bb = backBeam(t); outBeam.visible = bb > 0.01;
    a3.set(0, 0.3, 1.2); b3.set(4, 7.6, cz + 25); between(outBeam, b3, a3); outBeam.material.opacity = 0.28 * bb;
    dEye.material.color.setScalar(0.4 + 1.2 * bb);

    // lens station
    const so = stOn(t); st.visible = so > 0.01; st.scale.setScalar(0.4 + 0.6 * back(so, 1.2));
    const ri = rayIn(t), rr = rayOut(t);
    for (const [li, lo] of rays) { li.geometry.setDrawRange(0, Math.floor(NS * ri)); lo.geometry.setDrawRange(0, Math.floor(NS * rr)); li.material.opacity = 0.9; lo.material.opacity = 0.95; }
    focus.scale.setScalar(0.2 + 1.2 * ri + 0.3 * Math.sin(t * 7) * ri);
    lensLab.material.opacity = ramp(t, A("s4:lapisan") - 0.2, A("s4:lapisan") + 0.3);

    for (let i = 0; i < ND; i++) { const [x, y, z, q] = dseed[i]; dpos[i * 3] = x + Math.sin(t * 0.3 + q * 9); dpos[i * 3 + 1] = y + Math.sin(t * 0.2 + q * 4) * 0.8; dpos[i * 3 + 2] = cz - 10 - z; }
    dg.attributes.position.needsUpdate = true; dust.material.opacity = 0.5 * lit * (1 - mk);

    bp.strength = 0.5 + 0.25 * lit;
    comp.render();
  };
}
