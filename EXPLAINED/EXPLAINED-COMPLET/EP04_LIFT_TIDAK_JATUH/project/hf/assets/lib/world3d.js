// EP04 LIFT TIDAK JATUH / URBANFORGE. One plaster-white architectural maquette city on a warm-grey table in low evening sun.
// Four stations: the sectioned AUDIRA tower with an open traction shaft (origin), the 1852 factory with a primitive hoist,
// the 1854 exhibition hall with a raised demo platform, and the 1857 store with a tiny passenger lift. Everything is matte
// plaster; only the moving / critical parts (ropes, safety wedges, pawls, governor, brake shoes, sheave rim) are safety orange.
// Every value is a pure function of t (seek-safe, no accumulated state).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, clamp01, smooth, ramp, eout, back, canvasTex, track, std, box, cyl, stage, pts, envStrips, label } from "./lib3d.js";

const PI = Math.PI, HP = PI / 2;
const lerp = (a, b, u) => a + (b - a) * u;
const UP = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();

// cylinder of unit height stretched between two points
function seg(mat, r, seg = 8) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, seg), mat); m.castShadow = true; return m; }
function span(m, x1, y1, z1, x2, y2, z2) {
  _a.set(x1, y1, z1); _b.set(x2, y2, z2); _d.subVectors(_b, _a);
  const L = Math.max(0.001, _d.length());
  m.position.addVectors(_a, _b).multiplyScalar(0.5);
  m.scale.set(1, L, 1);
  m.quaternion.setFromUnitVectors(UP, _d.divideScalar(L));
}

// ---------- palette ----------
const PLASTER = 0xe8e5de, POCHE = 0x77716a, STEEL = 0x6b6d70, ORANGE = 0xff5a1f, FLOOR = 0xb0aaa0;

// ---------- scale figures (architectural model people) ----------
function person({ coat = 0x4a4c52, trou = 0x34353a, skin = 0xd9b48f, hat = false, dress = false, tails = false, s = 1 } = {}) {
  const G = new THREE.Group();
  const M = (c, r = 0.8) => std(c, r);
  const mc = M(coat), mt = M(trou), ms = M(skin, 0.7);
  const add = (geo, mat, x, y, z, p = G) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const torso = add(new THREE.CylinderGeometry(0.125, 0.085, 0.34, 12), mc, 0, 0.67, 0); torso.scale.z = 0.62;
  add(new THREE.SphereGeometry(0.05, 10, 8), mc, -0.125, 0.82, 0); add(new THREE.SphereGeometry(0.05, 10, 8), mc, 0.125, 0.82, 0);
  add(new THREE.CylinderGeometry(0.034, 0.038, 0.07, 8), ms, 0, 0.875, 0);
  const head = add(new THREE.SphereGeometry(0.074, 14, 12), ms, 0, 0.965, 0.005); head.scale.set(0.92, 1.05, 0.95);
  if (hat) { add(new THREE.CylinderGeometry(0.06, 0.064, 0.11, 14), M(0x1f1f22), 0, 1.07, 0); add(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16), M(0x1f1f22), 0, 1.018, 0); }
  else add(new THREE.SphereGeometry(0.078, 12, 8, 0, 6.3, 0, 1.4), M(0x2c2622), 0, 0.975, -0.008);
  if (tails) add(new THREE.CylinderGeometry(0.09, 0.13, 0.2, 12, 1, true), mc, 0, 0.42, -0.005).scale.z = 0.7;
  const limb = (x, y, l1, l2, r, mat, matLow, hand) => {
    const p1 = new THREE.Group(); p1.position.set(x, y, 0); G.add(p1);
    add(new THREE.CapsuleGeometry(r, l1 - 2 * r, 4, 8), mat, 0, -l1 / 2, 0, p1);
    const p2 = new THREE.Group(); p2.position.set(0, -l1, 0); p1.add(p2);
    add(new THREE.CapsuleGeometry(r * 0.9, l2 - 2 * r, 4, 8), matLow, 0, -l2 / 2, 0, p2);
    if (hand) add(new THREE.SphereGeometry(r * 1.05, 8, 6), ms, 0, -l2, 0, p2);
    else add(new THREE.BoxGeometry(r * 2.1, r * 1.3, r * 3.6), M(0x222224), 0, -l2 - r * 0.2, r * 0.9, p2);
    return [p1, p2];
  };
  const [armL, foreL] = limb(-0.15, 0.815, 0.18, 0.17, 0.033, mc, mc, true);
  const [armR, foreR] = limb(0.15, 0.815, 0.18, 0.17, 0.033, mc, mc, true);
  let legL, shinL, legR, shinR;
  if (dress) {
    add(new THREE.ConeGeometry(0.2, 0.55, 14), mc, 0, 0.36, 0).scale.z = 0.8;
    [legL, shinL] = limb(-0.05, 0.12, 0.06, 0.06, 0.03, mt, mt, false);
    [legR, shinR] = limb(0.05, 0.12, 0.06, 0.06, 0.03, mt, mt, false);
  } else {
    add(new THREE.CylinderGeometry(0.088, 0.09, 0.08, 12), mt, 0, 0.5, 0).scale.z = 0.7;
    [legL, shinL] = limb(-0.055, 0.49, 0.24, 0.23, 0.042, mt, mt, false);
    [legR, shinR] = limb(0.055, 0.49, 0.24, 0.23, 0.042, mt, mt, false);
  }
  G.scale.setScalar(s);
  const P = { G, armL, foreL, armR, foreR, legL, shinL, legR, shinR };
  pose(P, "stand", 0);
  return P;
}
// pose blends: stand / cheer / point / wave, u in 0..1 toward the named pose from stand
function pose(P, kind, u, ph = 0) {
  const S = { aL: [0.05, 0, 0.12], fL: -0.35, aR: [0.05, 0, -0.12], fR: -0.35, lL: 0.08, sL: -0.14, lR: -0.04, sR: -0.08 };
  let T = S;
  if (kind === "cheer") T = { aL: [-0.2, 0, 2.55 + 0.15 * Math.sin(ph)], fL: -0.4, aR: [-0.2, 0, -2.55 - 0.15 * Math.sin(ph + 1)], fR: -0.4, lL: 0.08, sL: -0.14, lR: -0.04, sR: -0.08 };
  if (kind === "point") T = { ...S, aR: [-1.35, 0, -0.25], fR: -0.15 };
  if (kind === "wave") T = { ...S, aR: [-0.2, 0, -2.5], fR: -0.5 + 0.35 * Math.sin(ph) };
  if (kind === "brace") T = { aL: [-0.5, 0, 0.5], fL: -1.1, aR: [-0.5, 0, -0.5], fR: -1.1, lL: 0.5, sL: -0.8, lR: 0.35, sR: -0.7 };
  const L = (a, b) => lerp(a, b, u);
  P.armL.rotation.set(L(S.aL[0], T.aL[0]), 0, L(S.aL[2], T.aL[2])); P.foreL.rotation.x = L(S.fL, T.fL);
  P.armR.rotation.set(L(S.aR[0], T.aR[0]), 0, L(S.aR[2], T.aR[2])); P.foreR.rotation.x = L(S.fR, T.fR);
  P.legL.rotation.x = -L(S.lL, T.lL); P.shinL.rotation.x = -L(S.sL, T.sL);
  P.legR.rotation.x = -L(S.lR, T.lR); P.shinR.rotation.x = -L(S.sR, T.sR);
}

// ---------- world ----------
export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) { console.error("missing anchor " + k); return 0; } return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xc9b292, exp: 0.84, bloom: [0.16, 0.35, 0.96], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.84;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const nan = new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=max(c,vec4(0.));}" });
  comp.insertPass(nan, 1);
  envStrips(r, scene, [[14, 8, 0xfff1dc, 1.6, 0, 10, 4], [4, 8, 0xffd2a0, 1.8, 9, 2, 6], [4, 8, 0xb9c8e0, 1.0, -9, 3, -5], [16, 4, 0x8c8377, 0.6, 0, -6, 0]], 0x2a2a2e);
  scene.environmentIntensity = 0.3;
  scene.background = null;
  scene.fog = new THREE.Fog(0xcdb594, 46, 130);
  scene.add(cam);

  // camera-locked dusk sweep behind the table
  const bgU = { top: { value: new THREE.Color(0x56606d) }, bot: { value: new THREE.Color(0xd6b48c) }, dim: { value: 0 } };
  const bgM = new THREE.ShaderMaterial({ uniforms: bgU, depthWrite: false, depthTest: false, fog: false,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,bot;uniform float dim;varying vec2 vUv;void main(){vec3 c=mix(bot,top,smoothstep(0.25,0.95,vUv.y));float s=exp(-pow(length((vUv-vec2(.72,.42))*vec2(1.,1.5))/.3,2.));c+=vec3(.16,.09,.02)*s;c*=1.-.45*dim;gl_FragColor=vec4(max(c,vec3(0.)),1.);}" });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(80, 140), bgM); bg.position.z = -120; bg.renderOrder = -10; bg.frustumCulled = false; cam.add(bg);

  // table floor (darker value under the caption zone) with a faint street grid
  const gridT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#b0aaa0"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(255,255,255,.10)"; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, w - 2); g.strokeStyle = "rgba(60,50,40,.06)"; g.lineWidth = 1; for (let i = 32; i < w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, [60, 60]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(480, 480), new THREE.MeshStandardMaterial({ color: 0xffffff, map: gridT, roughness: 0.95 }));
  floor.rotation.x = -HP; floor.position.set(-10, 0, 0); floor.receiveShadow = true; scene.add(floor);

  // lights: warm low sun that follows the camera target, cool hemisphere, soft camera fill
  const hemi = new THREE.HemisphereLight(0xe6ebf3, 0x9a8f80, 0.3); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc98f, 3.4); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 120 }); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xf4f2ee, 1.15); scene.add(fill, fill.target);
  const EL = 17 * PI / 180, AZ = 0.62; // elevation 17 deg, from front-right
  const SUND = new THREE.Vector3(Math.cos(EL) * Math.sin(AZ), Math.sin(EL), Math.cos(EL) * Math.cos(AZ));

  const grainT = canvasTex(256, 256, (g, w) => { const R = mulberry(31); g.fillStyle = '#f3f3f3'; g.fillRect(0, 0, w, w); for (let i = 0; i < 9000; i++) { const v = 205 + Math.floor(R() * 50); g.fillStyle = `rgba(${v},${v - 2},${v - 6},.55)`; g.fillRect(R() * w, R() * w, 1 + R() * 1.6, 1 + R() * 1.6); } }, [2, 2]);
  const PL = (c) => std(c, 0.92, 0, { map: grainT, emissive: new THREE.Color(c), emissiveMap: grainT, emissiveIntensity: 0.16 });
  const satin = new THREE.MeshPhysicalMaterial({ color: 0xc4c7cb, metalness: 0.85, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.35 });
  const plaster = PL(0xedebe6), plaster2 = PL(0xe2dfd8), poche = std(POCHE, 0.8), steel = std(STEEL, 0.42, 0.55);
  const orange = std(ORANGE, 0.45, 0, { emissive: new THREE.Color(ORANGE), emissiveIntensity: 0.12 });
  const ropeM = std(ORANGE, 0.5, 0, { emissive: new THREE.Color(ORANGE), emissiveIntensity: 0.22 });
  const dark = std(0x2b2b2e, 0.6, 0.2);
  const tplane = (w, h, cw, ch, draw, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.basic ? new THREE.MeshBasicMaterial({ map: canvasTex(cw, ch, draw), transparent: true, toneMapped: false, depthWrite: false }) : new THREE.MeshStandardMaterial({ map: canvasTex(cw, ch, draw), roughness: 0.85, transparent: !!o.alpha }));
  const plate = (title, sub, w = 2.2) => tplane(w, w * 0.3, 720, 216, (g, W, H) => {
    g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, W, H); g.strokeStyle = "#2a2a2c"; g.lineWidth = 6; g.strokeRect(5, 5, W - 10, H - 10);
    g.fillStyle = "#ff5a1f"; g.fillRect(28, H - 46, 70, 10);
    g.fillStyle = "#1e1e20"; g.textAlign = "left"; let fs = 72; g.font = "800 72px Arial"; while (g.measureText(title).width > W - 60 && fs > 30) { fs -= 2; g.font = `800 ${fs}px Arial`; } g.fillText(title, 28, 92);
    if (sub) { g.fillStyle = "#5a5856"; g.font = "700 38px Arial"; g.fillText(sub, 116, H - 30); }
  });

  // ============ ST0: the AUDIRA tower (origin) ============
  const TW = new THREE.Group(); scene.add(TW);
  const FLOORS = 9, FH = 1.6, ROOF = FLOORS * FH - 1.2; // roof slab at 13.2
  const XL = -4.5, XR = 4.1, ZB = -2.2, ZF = 2.0, SHL = -2.7, SHR = 2.3;
  // back wall with scored panels
  const backT = canvasTex(512, 1024, (g, w, h) => { g.fillStyle = "#e8e5de"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(80,70,60,.10)"; g.lineWidth = 2; for (let y = 0; y < h; y += h / 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } });
  const backM = new THREE.MeshStandardMaterial({ map: backT, roughness: 0.92, emissive: new THREE.Color(0xe8e5de), emissiveMap: backT, emissiveIntensity: 0.16 });
  box(XR - XL, ROOF, 0.22, backM, (XL + XR) / 2, ROOF / 2, ZB, TW);
  // side walls with vertical fins
  for (const x of [XL + 0.11, XR - 0.11]) { box(0.22, ROOF, ZF - ZB, plaster, x, ROOF / 2, (ZB + ZF) / 2, TW); for (let k = 0; k < 5; k++) box(0.12, ROOF, 0.08, plaster2, x + (x < 0 ? -0.16 : 0.16), ROOF / 2, ZB + 0.4 + k * 0.85, TW); }
  // shaft walls and slabs in the wings, with dark section-cut edges facing the camera
  for (const x of [SHL, SHR]) { box(0.14, ROOF, ZF - ZB, plaster2, x, ROOF / 2, (ZB + ZF) / 2, TW); box(0.15, ROOF, 0.04, poche, x, ROOF / 2, ZF + 0.005, TW); }
  for (let i = 0; i <= FLOORS; i++) {
    const y = Math.min(i * FH, ROOF);
    for (const [a, b] of [[XL, SHL], [SHR, XR]]) { box(b - a, 0.16, ZF - ZB, plaster, (a + b) / 2, y + 0.08, (ZB + ZF) / 2, TW); box(b - a, 0.17, 0.04, poche, (a + b) / 2, y + 0.08, ZF + 0.01, TW); }
  }
  box(XR - XL, 0.24, ZF - ZB, plaster, (XL + XR) / 2, ROOF + 0.12, (ZB + ZF) / 2, TW);
  box(XR - XL, 0.25, 0.04, poche, (XL + XR) / 2, ROOF + 0.12, ZF + 0.01, TW);
  box(SHR - SHL, 0.3, ZF - ZB, plaster2, (SHL + SHR) / 2, 0.15, 0, TW); // pit floor
  // little rooms in the wings: desks and people
  const R0 = mulberry(44);
  const wingPeople = [];
  for (let i = 1; i < FLOORS; i++) for (const wx of [(XL + SHL) / 2, (SHR + XR) / 2]) {
    const y = i * FH + 0.16;
    if (R0() < 0.55) box(0.7, 0.36, 0.5, plaster2, wx + (R0() - 0.5) * 0.4, y + 0.18, ZB + 0.8, TW);
    if (R0() < 0.5) { const p = person({ coat: [0x5b6470, 0x7a5a44, 0x46484e, 0x8b8f94][Math.floor(R0() * 4)], s: 0.95 }); p.G.position.set(wx + (R0() - 0.5) * 0.6, y, 0.3 + R0() * 0.9); p.G.rotation.y = (R0() - 0.5) * 1.6; TW.add(p.G); wingPeople.push(p); }
  }
  // machine room
  const MR = ROOF + 0.24, MH = 3.0;
  box(XR - XL - 1.4, MH, 0.2, backM, (XL + XR) / 2, MR + MH / 2, ZB + 0.3, TW);
  for (const x of [XL + 0.8, XR - 0.8]) box(0.2, MH, ZF - ZB - 0.3, plaster, x, MR + MH / 2, (ZB + ZF) / 2 + 0.15, TW);
  box(XR - XL - 1.2, 0.2, ZF - ZB - 0.2, plaster, (XL + XR) / 2, MR + MH + 0.1, (ZB + ZF) / 2 + 0.1, TW);
  box(XR - XL - 1.2, 0.21, 0.04, poche, (XL + XR) / 2, MR + MH + 0.1, ZF - 0.08, TW);
  // AUDIRA fascia sign on the roof parapet (in-world brand)
  const sign = tplane(4.2, 0.62, 1024, 152, (g, w, h) => { g.fillStyle = "#efece5"; g.fillRect(0, 0, w, h); g.fillStyle = "#26262a"; g.font = "900 104px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("A U D I R A", w / 2 - 40, h / 2 + 4); g.fillStyle = "#ff5a1f"; g.beginPath(); g.arc(w - 90, h / 2, 22, 0, 7); g.fill(); });
  sign.position.set((XL + XR) / 2, MR + MH + 0.55, ZF - 0.05); TW.add(sign);
  const signBack = box(4.4, 0.72, 0.1, plaster2, (XL + XR) / 2, MR + MH + 0.55, ZF - 0.12, TW);
  const roomLamp = new THREE.PointLight(0xffe2b8, 3.5, 9, 1.6); roomLamp.position.set(0, MR + MH - 0.4, 1.0); TW.add(roomLamp);
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfff0d6, toneMapped: false });
  const lampMesh = box(1.2, 0.05, 0.25, lampM, 0, MR + MH - 0.08, 0.9, TW); lampMesh.castShadow = false;

  // rails: cabin T-rails and counterweight rails (dark steel), full height
  const CABX = -0.7, CABW = 2.0, CABD = 1.6, CABH = 1.8, CWX = 1.2, CWH = 2.0, SHEY = 14.6, SHR_ = 0.95, SHX = 0.25;
  const railM = std(0x4a4c50, 0.4, 0.6, { emissive: new THREE.Color(ORANGE), emissiveIntensity: 0 });
  for (const x of [CABX - 1.08, CABX + 1.08]) { box(0.08, MR, 0.22, railM, x, MR / 2, 0, TW); box(0.2, MR, 0.05, railM, x + (x < CABX ? -0.06 : 0.06), MR / 2, 0, TW); }
  for (const x of [CWX - 0.62, CWX + 0.62]) box(0.07, MR, 0.16, railM, x, MR / 2, -0.1, TW);
  // cabin
  const CAB = new THREE.Group(); TW.add(CAB);
  box(CABW, 0.12, CABD, plaster, 0, 0.06, 0, CAB); box(CABW, 0.12, CABD, plaster, 0, CABH - 0.06, 0, CAB);
  box(CABW, CABH, 0.08, plaster2, 0, CABH / 2, -CABD / 2 + 0.04, CAB);
  for (const s of [-1, 1]) box(0.08, CABH, CABD, plaster, s * (CABW / 2 - 0.04), CABH / 2, 0, CAB);
  for (const s of [-1, 1]) box(0.09, CABH, 0.05, orange, s * (CABW / 2 - 0.04), CABH / 2, CABD / 2 + 0.01, CAB);
  box(CABW, 0.09, 0.05, orange, 0, CABH - 0.05, CABD / 2 + 0.01, CAB);
  const cabGlow = new THREE.MeshBasicMaterial({ color: 0xfff2d8, toneMapped: false }); const cg = box(1.2, 0.03, 0.6, cabGlow, 0, CABH - 0.135, 0, CAB); cg.castShadow = false;
  const cabLamp = new THREE.PointLight(0xffe7c4, 2.2, 3.2, 1.5); cabLamp.position.set(0, CABH - 0.4, 0.3); CAB.add(cabLamp);
  // crosshead + rope hitch + safety gear (orange wedges at the rails, under the floor)
  box(CABW + 0.3, 0.16, 0.3, plaster2, 0, CABH + 0.08, 0, CAB);
  box(0.36, 0.2, 0.36, dark, 0, CABH + 0.25, 0, CAB);
  const wedges = [];
  for (const s of [-1, 1]) { box(0.3, 0.26, 0.4, dark, s * 1.08, -0.08, 0, CAB); const w = box(0.1, 0.3, 0.3, orange, s * 1.08 - s * 0.11, -0.1, 0, CAB); wedges.push([w, s]); const w2 = box(0.1, 0.3, 0.3, orange, s * 1.08 + s * 0.11, -0.1, 0, CAB); wedges.push([w2, s]); }
  box(0.16, 0.08, 0.5, orange, -1.0, CABH + 0.05, 0.55, CAB); // governor rope arm
  const rider = person({ coat: 0x5b6470, trou: 0x3a3c42, s: 1.05 }); rider.G.position.set(-0.25, 0.12, 0.05); rider.G.rotation.y = 0.35; CAB.add(rider.G);
  const rider2 = person({ coat: 0x8b6a52, dress: true, s: 1.0 }); rider2.G.position.set(0.45, 0.12, -0.2); rider2.G.rotation.y = -0.4; CAB.add(rider2.G);
  // counterweight: stacked plates
  const CW = new THREE.Group(); TW.add(CW);
  for (let i = 0; i < 9; i++) box(1.06, 0.2, 0.62, i % 2 ? std(0x55575b, 0.5, 0.3) : std(0x47494d, 0.5, 0.3), 0, 0.12 + i * 0.21, -0.1, CW);
  box(1.2, 0.12, 0.7, plaster2, 0, CWH - 0.06, -0.1, CW);
  const cwRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 8, 48), new THREE.MeshBasicMaterial({ color: 0xff7a3a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  cwRing.scale.set(0.9, 1.35, 1); CW.add(cwRing); cwRing.position.set(0, CWH / 2, 0.45);
  // sheave (grooved, orange rim), motor behind, brake in front
  const SHG = new THREE.Group(); SHG.position.set(SHX, SHEY, 0); TW.add(SHG);
  const shWheel = new THREE.Group(); SHG.add(shWheel);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(SHR_, SHR_, 0.56, 48).rotateX(HP), satin); sh.castShadow = true; shWheel.add(sh);
  for (const z of [-0.18, 0, 0.18]) { const g = new THREE.Mesh(new THREE.TorusGeometry(SHR_ + 0.005, 0.04, 8, 64), orange); g.position.z = z; shWheel.add(g); }
  for (let k = 0; k < 6; k++) { const sp = box(0.12, SHR_ * 1.7, 0.6, poche, 0, 0, 0, shWheel); sp.rotation.z = (k * PI) / 6; sp.scale.set(1, 1, 0.98); }
  cyl(0.16, 0.16, 2.6, 16, steel, 0, 0, -0.4, SHG).rotation.x = HP;
  const motor = cyl(0.62, 0.62, 1.1, 32, std(0x5a5d62, 0.5, 0.4), 0, -0.05, -1.4, SHG); motor.rotation.x = HP;
  box(1.5, 0.3, 1.2, plaster2, 0, -0.72, -1.4, SHG);
  box(1.8, 0.5, 1.5, plaster, 0, -SHEY + MR + 0.25, -0.7, SHG); // machine base
  for (const x of [-0.7, 1.2]) box(0.6, 0.06, 0.6, poche, x - SHX, MR - SHEY + 0.02, 0, SHG); // rope holes
  // friction arrows (projected light) circling the sheave
  const arrowT = canvasTex(512, 512, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(255,120,50,1)"; g.lineWidth = 16; g.lineCap = "round"; for (const a0 of [0.2, PI + 0.2]) { g.beginPath(); g.arc(w / 2, w / 2, 214, a0, a0 + 2.3); g.stroke(); const a1 = a0 + 2.3, x = w / 2 + 214 * Math.cos(a1), y = w / 2 + 214 * Math.sin(a1); g.fillStyle = "rgba(255,120,50,1)"; g.beginPath(); g.moveTo(x + 34 * Math.cos(a1 + HP), y + 34 * Math.sin(a1 + HP)); g.lineTo(x - 30 * Math.cos(a1), y - 30 * Math.sin(a1)); g.lineTo(x + 30 * Math.cos(a1), y + 30 * Math.sin(a1)); g.fill(); } });
  const arrowM = new THREE.MeshBasicMaterial({ map: arrowT, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const arrows = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), arrowM); arrows.position.set(SHX, SHEY, 1.25); TW.add(arrows);
  // brake: drum in front of the sheave, two arms with orange shoes, springs, electromagnet on top
  const BRZ = 0.95;
  const BR = new THREE.Group(); BR.position.set(SHX, SHEY, BRZ); TW.add(BR);
  const drum = new THREE.Group(); BR.add(drum);
  cyl(0.55, 0.55, 0.32, 40, satin, 0, 0, 0, drum).rotation.x = HP;
  box(0.08, 0.5, 0.34, orange, 0, 0.28, 0, drum);
  cyl(0.2, 0.2, 0.36, 20, dark, 0, 0, 0, drum).rotation.x = HP;
  const brArms = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(s * 0.82, -0.85, 0); BR.add(piv);
    box(0.14, 1.75, 0.18, plaster2, 0, 0.87, 0, piv);
    const shoe = box(0.12, 0.62, 0.3, orange, -s * 0.17, 0.85, 0, piv);
    brArms.push({ piv, s, shoe });
    // spring (coil) between the arm and a fixed post
    box(0.12, 0.6, 0.22, plaster, s * 1.42, -0.55, 0, BR);
  }
  const springs = [];
  for (const s of [-1, 1]) { const sp = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 6, 16), orange); const grp = new THREE.Group(); BR.add(grp); for (let k = 0; k < 6; k++) { const c = sp.clone(); c.rotation.y = HP; c.position.x = k / 5; grp.add(c); } springs.push({ grp, s }); }
  box(0.95, 0.36, 0.42, plaster2, 0, 1.15, 0, BR);
  const coilM = std(0xb06a3c, 0.4, 0.3, { emissive: new THREE.Color(0xff6a20), emissiveIntensity: 0 });
  cyl(0.15, 0.15, 0.6, 20, coilM, 0, 1.15, 0.23, BR).rotation.z = HP;
  const magLbl = tplane(0.9, 0.2, 360, 80, (g, w, h) => { g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, w, h); g.fillStyle = "#26262a"; g.font = "800 46px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LISTRIK", w / 2, h / 2 + 2); });
  magLbl.position.set(0, 1.47, 0.12); BR.add(magLbl);
  const links = [-1, 1].map((s) => { const m = seg(steel, 0.03); BR.add(m); return { m, s }; });
  const boltM = new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.fillStyle = "#ffb25a"; g.beginPath(); g.moveTo(74, 6); g.lineTo(30, 72); g.lineTo(60, 72); g.lineTo(48, 122); g.lineTo(98, 50); g.lineTo(66, 50); g.closePath(); g.fill(); }), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const bolt = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), boltM); bolt.position.set(0.75, 1.55, 0.3); BR.add(bolt);
  const lockT = canvasTex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = "#ff5a1f"; g.strokeStyle = "#ff5a1f"; g.lineWidth = 26; g.beginPath(); g.arc(128, 104, 52, PI, 0); g.stroke(); g.fillRect(52, 104, 152, 118); g.fillStyle = "#f4f1ea"; g.beginPath(); g.arc(128, 150, 18, 0, 7); g.fill(); g.fillRect(120, 150, 16, 40); });
  const lockM = new THREE.MeshBasicMaterial({ map: lockT, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const lock = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), lockM); lock.position.set(1.3, 0.55, 0.45); BR.add(lock);
  // governor: wheel with flyweights at the top left, rope loop to a tension pulley in the pit
  const GVX = -2.15, GVY = 15.0, GVZ = 0.55, GVR = 0.4;
  const GV = new THREE.Group(); GV.position.set(GVX, GVY, GVZ); TW.add(GV);
  box(0.9, 0.12, 0.6, plaster2, 0, -0.75, -0.1, GV); box(0.12, 0.7, 0.12, plaster2, 0, -0.38, -0.25, GV);
  const gvWheel = new THREE.Group(); GV.add(gvWheel);
  cyl(GVR, GVR, 0.12, 40, orange, 0, 0, 0, gvWheel).rotation.x = HP;
  cyl(GVR * 0.75, GVR * 0.75, 0.14, 40, satin, 0, 0, 0, gvWheel).rotation.x = HP;
  const fly = [0, PI].map((a) => { const piv = new THREE.Group(); piv.rotation.z = a; gvWheel.add(piv); const arm = new THREE.Group(); arm.position.set(0.08, 0, 0.1); piv.add(arm); box(0.26, 0.05, 0.04, steel, 0.13, 0, 0, arm); const wt = cyl(0.07, 0.07, 0.07, 16, orange, 0.27, 0, 0, arm); wt.rotation.x = HP; return arm; });
  const gvLatch = box(0.08, 0.3, 0.08, dark, 0.48, 0.12, 0.1, GV);
  const gvRopes = [seg(ropeM, 0.025), seg(ropeM, 0.025)]; gvRopes.forEach((m) => TW.add(m));
  cyl(0.3, 0.3, 0.1, 24, plaster2, GVX, 0.75, GVZ, TW).rotation.x = HP;
  const gvBeads = [...Array(16)].map(() => { const b = box(0.07, 0.04, 0.07, dark, 0, 0, 0, TW); b.castShadow = false; return b; });
  const gvGlow = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 48), new THREE.MeshBasicMaterial({ color: 0xff7a3a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  gvGlow.position.set(GVX, GVY, GVZ + 0.12); TW.add(gvGlow);
  // hoist ropes: 3 on the cabin side, 3 on the counterweight side; snapped pieces reuse the same meshes
  const RZ = [-0.18, 0, 0.18];
  const ropeUp = RZ.map(() => { const m = seg(ropeM, 0.035); TW.add(m); return m; });
  const ropeLo = RZ.map(() => { const m = seg(ropeM, 0.035); TW.add(m); return m; });
  const ropeCw = RZ.map(() => { const m = seg(ropeM, 0.035); TW.add(m); return m; });
  const ropeMarks = [...Array(12)].map(() => { const b = box(0.12, 0.05, 0.5, dark, 0, 0, 0, TW); b.castShadow = false; return b; });
  // 2007 Seattle plate on a stand by the tower base
  const seattle = plate("2007 · SEATTLE", "rumah sakit anak", 2.6); seattle.position.set(3.6, 1.5, 3.2); seattle.rotation.y = -0.25; TW.add(seattle);
  const seaStand = box(0.1, 1.1, 0.1, plaster2, 3.6, 0.55, 3.1, TW);

  // ============ hoist rig (factory 1852 and exhibition 1854) ============
  function rig(H, w, platW, platD) {
    const G = new THREE.Group();
    for (const s of [-1, 1]) box(0.2, H, 0.2, plaster, s * w / 2, H / 2, 0, G);
    box(w + 0.5, 0.24, 0.32, plaster, 0, H + 0.12, 0, G);
    const pul = cyl(0.26, 0.26, 0.16, 24, plaster2, 0, H - 0.22, 0, G); pul.rotation.x = HP;
    const pulR = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 6, 32), orange); pulR.position.set(0, H - 0.22, 0); G.add(pulR);
    // toothed rails (ratchet) on the inner faces of the posts, grown on cue
    const teeth = [];
    for (const s of [-1, 1]) { const tg = new THREE.Group(); tg.position.set(s * (w / 2 - 0.14), 0, 0); G.add(tg); box(0.06, H - 0.3, 0.16, orange, 0, (H - 0.3) / 2, 0, tg); for (let y = 0.3; y < H - 0.4; y += 0.22) { const t = box(0.11, 0.06, 0.15, orange, -s * 0.05, y, 0, tg); t.rotation.z = s * 0.6; } teeth.push(tg); }
    const P = new THREE.Group(); G.add(P);
    box(platW, 0.12, platD, plaster, 0, 0.06, 0, P);
    box(platW, 0.13, 0.04, poche, 0, 0.06, platD / 2 + 0.005, P);
    for (const s of [-1, 1]) box(0.12, 0.9, 0.12, plaster2, s * (w / 2 - 0.32), 0.45, 0, P);
    box(w - 0.5, 0.12, 0.14, plaster2, 0, 0.92, 0, P);
    // wagon spring (bow) and pawls
    const spring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 6, 32, PI * 0.7), orange); spring.rotation.z = PI * 0.15; spring.position.set(0, 0.55, 0.1); P.add(spring);
    const pawls = [];
    for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * (w / 2 - 0.36), 0.98, 0.08); P.add(piv); const pw = box(0.26, 0.08, 0.12, orange, s * 0.13, 0, 0, piv); pawls.push({ piv, s }); }
    const ropeA = seg(ropeM, 0.03), ropeB = seg(ropeM, 0.03); G.add(ropeA, ropeB);
    return { G, P, teeth, spring, pawls, ropeA, ropeB, H, w,
      set(py, snap, teethU, pawlU) {
        P.position.y = py;
        for (const tg of teeth) { tg.scale.y = Math.max(0.001, teethU); tg.visible = teethU > 0.01; }
        spring.visible = teethU > 0.01; spring.scale.set(1, lerp(1, 0.55, pawlU), 1);
        for (const p of pawls) { p.piv.visible = teethU > 0.01; p.piv.rotation.z = p.s * lerp(0, -0.55, pawlU) * -1; p.piv.position.x = p.s * (w / 2 - lerp(0.36, 0.22, pawlU)); }
        const top = H - 0.48, hitch = py + 0.98;
        if (!snap) { ropeB.visible = false; span(ropeA, 0, top, 0, 0, hitch, 0); return; }
        const dt = snap.dt, yb = snap.yb;
        const upE = yb + 0.9 * eout(dt / 0.3), sw = 0.18 * Math.sin(dt * 15) * Math.exp(-dt * 3);
        ropeA.visible = upE < top - 0.02; span(ropeA, 0, top, 0, sw, Math.min(top - 0.01, upE), 0);
        const L = Math.max(0.05, (yb - snap.hitch0) * (1 - 0.55 * eout(dt / 0.45)));
        ropeB.visible = true; span(ropeB, 0, hitch, 0, 0.45 * eout(dt / 0.45), hitch + L * 0.8, 0.05);
      } };
  }

  // ============ ST1: factory 1852 ============
  const FX = -12, FZ = -10;
  const FA = new THREE.Group(); FA.position.set(FX, 0, FZ); scene.add(FA);
  const FW = 9, FDp = 6, FHt = 5.4;
  box(FW, FHt, 0.22, backM, 0, FHt / 2, -FDp / 2, FA);
  for (const s of [-1, 1]) { box(0.22, FHt, FDp, plaster, s * FW / 2, FHt / 2, 0, FA); box(0.23, FHt, 0.04, poche, s * FW / 2, FHt / 2, FDp / 2 + 0.01, FA); }
  for (let k = 0; k < 4; k++) { // sawtooth roof
    const x0 = -FW / 2 + k * (FW / 4) + FW / 8;
    const tooth = box(FW / 4 * 1.08, 0.14, FDp, plaster, x0 - 0.1, FHt + 0.55, 0, FA); tooth.rotation.z = 0.48;
    box(0.12, 1.1, FDp, plaster2, x0 + FW / 8 - 0.06, FHt + 0.5, 0, FA);
  }
  for (let k = 0; k < 3; k++) box(0.24, FHt, 0.24, plaster2, -FW / 2 + (k + 1) * FW / 4, FHt / 2, -FDp / 2 + 0.3, FA);
  box(FW, 0.18, FDp, plaster2, 0, 0.09, 0, FA);
  // machines on the shop floor
  for (const [x, z] of [[-3.2, -1.2], [-3.0, 1.0], [2.9, -1.6]]) { box(1.0, 0.6, 0.7, plaster, x, 0.48, z, FA); cyl(0.32, 0.32, 0.12, 24, plaster2, x + 0.3, 0.95, z + 0.36, FA).rotation.x = HP; }
  const fRig = rig(5.0, 2.0, 1.8, 1.4); fRig.G.position.set(1.2, 0.18, -0.6); FA.add(fRig.G);
  // the heavy machine riding the platform
  const mach = new THREE.Group(); fRig.P.add(mach);
  box(0.9, 0.55, 0.7, plaster2, -0.15, 0.4, 0, mach); cyl(0.3, 0.3, 0.1, 24, poche, 0.42, 0.55, 0.2, mach).rotation.x = HP; cyl(0.06, 0.06, 0.5, 8, steel, 0.1, 0.8, 0, mach);
  const otis = person({ coat: 0x2f3034, trou: 0x26272a, hat: true, tails: true, s: 1.12 }); otis.G.position.set(-0.5, 0.18, 1.3); otis.G.rotation.y = 0.55; FA.add(otis.G);
  const worker = person({ coat: 0x7a5a44, trou: 0x3e3a36, s: 1.08 }); worker.G.position.set(2.9, 0.18, 1.5); worker.G.rotation.y = -0.5; FA.add(worker.G);
  const otisPlate = plate("ELISHA OTIS", "1852 · pabrik", 1.7); otisPlate.position.set(-1.5, 1.75, 2.2); otisPlate.rotation.y = 0.12; FA.add(otisPlate);
  box(0.06, 1.2, 0.06, plaster2, -1.5, 0.75, 2.15, FA);
  
  const dust = pts(scene, 70, { color: 0xd8cfc2, size: 0.18, add: false, opacity: 0 });
  const rD = mulberry(8), dustB = [...Array(70)].map(() => [rD() * 6.28, 0.6 + rD() * 1.4, 0.4 + rD() * 0.8]);

  // ============ ST2: exhibition hall 1854 (iron-and-glass vault + dome) ============
  const HX = -27, HZ = -4;
  const HA = new THREE.Group(); HA.position.set(HX, 0, HZ); scene.add(HA);
  const ribM = std(0xf2f0eb, 0.8, 0, { emissive: new THREE.Color(0xf2f0eb), emissiveIntensity: 0.06 });
  for (let k = -6; k <= 6; k++) { if (Math.abs(k) < 2) continue; const rb = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.07, 6, 24, HP), ribM); rb.rotation.y = HP; rb.position.set(k * 1.0, 3.2, 0); rb.castShadow = true; HA.add(rb); box(0.16, 3.2, 0.16, plaster, k * 1.0, 1.6, -4.2, HA); }
  for (let a = 0.25; a < PI; a += 0.35) for (const sgn of [-1, 1]) { const pr = box(12.6, 0.06, 0.06, ribM, 0, 3.2 + 4.2 * Math.sin(a), 4.2 * Math.cos(a), HA); pr.visible = Math.cos(a) < 0.15; if (sgn > 0) pr.visible = false; }
  // glazed back half (frosted panels)
  const glassM = new THREE.MeshStandardMaterial({ color: 0xf6f3ec, roughness: 0.3, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 12.6, 24, 1, true, PI, PI / 2).rotateZ(HP), glassM); vault.position.set(0, 3.2, 0); HA.add(vault);
  const dome = new THREE.Group(); dome.position.set(0, 5.6, 0); HA.add(dome);
  for (let k = 0; k <= 10; k++) { const m = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.07, 6, 18, HP), ribM); m.rotation.y = (k * PI) / 10; m.castShadow = true; dome.add(m); }
  const hDrum = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.65, 0.4, 40, 1, true, HP, PI), plaster); hDrum.position.y = -0.1; dome.add(hDrum);
  cyl(0.18, 0.3, 0.6, 12, plaster, 0, 2.85, 0, dome);
  box(14, 0.2, 9.4, plaster2, 0, 0.1, 0, HA); // hall floor
  const hRig = rig(8.2, 2.4, 2.2, 1.6); hRig.G.position.set(0, 0.2, 0); HA.add(hRig.G);
  const otis2 = person({ coat: 0x2f3034, trou: 0x26272a, hat: true, tails: true, s: 1.12 }); otis2.G.position.set(-0.3, 0.12, 0.2); otis2.G.rotation.y = 0.15; hRig.P.add(otis2.G);
  const crowd = [];
  const rC = mulberry(1854);
  for (let i = 0; i < 26; i++) {
    const a = -0.35 + rC() * (PI + 0.7), rr = 2.4 + rC() * 2.3;
    const x = Math.cos(a) * rr * 1.25, z = Math.sin(a) * rr * 0.62 + 0.9;
    if (z < -0.2) continue;
    const dress = rC() < 0.35, hat = !dress && rC() < 0.55;
    const p = person({ coat: [0x4a4c52, 0x5b6470, 0x7a5a44, 0x6f6a62, 0x8c4a3a, 0x3c4a5c][Math.floor(rC() * 6)], dress, hat, s: 1.0 + rC() * 0.12 });
    p.G.position.set(x, 0.2, z); p.G.rotation.y = Math.atan2(-x, -z) + (rC() - 0.5) * 0.3; HA.add(p.G);
    crowd.push({ p, ph: rC() * 6.28, d: rC() * 0.4 });
  }
  const hSign = plate("CRYSTAL PALACE", "New York · 1854", 2.0); hSign.position.set(-1.1, 2.3, 2.4); hSign.rotation.y = 0.2; HA.add(hSign);
  const hPost = box(0.06, 2.0, 0.06, plaster2, -1.1, 1.1, 2.35, HA);

  // ============ ST3: store 1857 with the first passenger lift ============
  const SX = -13, SZ = 8;
  const SA = new THREE.Group(); SA.position.set(SX, 0, SZ); scene.add(SA);
  const facT = canvasTex(512, 1024, (g, w, h) => { g.fillStyle = "#e8e5de"; g.fillRect(0, 0, w, h); const fh = h / 5; for (let f = 0; f < 5; f++) { g.fillStyle = "rgba(60,52,44,.10)"; g.fillRect(0, f * fh + fh - 10, w, 8); for (let c = 0; c < 2; c++) { const x = 40 + c * 250, y = f * fh + 40, ww = 180, hh = fh - 80; g.fillStyle = "#6d6a66"; g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x, y + 40); g.arc(x + ww / 2, y + 40, ww / 2, PI, 0); g.lineTo(x + ww, y + hh); g.closePath(); g.fill(); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 6; g.stroke(); } } });
  const facM = new THREE.MeshStandardMaterial({ map: facT, roughness: 0.9, emissive: new THREE.Color(0xffffff), emissiveMap: facT, emissiveIntensity: 0.14 });
  const SW = 5.2, SD = 4, SH = 9;
  for (const s of [-1, 1]) { const half = box(2.0, SH, SD, plaster, s * 1.6, SH / 2, 0, SA); const fc = new THREE.Mesh(new THREE.PlaneGeometry(2.0, SH), facM); fc.position.set(s * 1.6, SH / 2, SD / 2 + 0.005); SA.add(fc); box(0.05, SH, 0.04, poche, s * 0.6, SH / 2, SD / 2 + 0.01, SA); }
  box(1.2, SH, 0.2, plaster2, 0, SH / 2, -SD / 2 + 0.1, SA);
  box(SW + 0.4, 0.3, SD + 0.3, plaster, 0, SH + 0.15, 0, SA);
  for (let f = 1; f < 5; f++) box(1.2, 0.08, 0.5, plaster2, 0, f * 1.8, -SD / 2 + 0.4, SA);
  const sCab = new THREE.Group(); SA.add(sCab);
  box(1.0, 0.08, 0.9, plaster, 0, 0.04, 0.6, sCab); box(1.0, 0.08, 0.9, plaster, 0, 1.25, 0.6, sCab);
  for (const s of [-1, 1]) box(0.05, 1.25, 0.9, orange, s * 0.48, 0.62, 0.6, sCab);
  const sp1 = person({ coat: 0x2f3034, hat: true, s: 0.95 }); sp1.G.position.set(-0.2, 0.08, 0.6); sCab.add(sp1.G);
  const sp2 = person({ coat: 0x8c4a3a, dress: true, s: 0.9 }); sp2.G.position.set(0.22, 0.08, 0.55); sCab.add(sp2.G);
  const sRope = seg(ropeM, 0.025); SA.add(sRope);
  const sSign = plate("TOKO · NEW YORK", "1857 · lift penumpang", 1.8); sSign.position.set(-1.6, 3.95, SD / 2 + 0.06); SA.add(sSign);

  // ============ filler city: plaster blocks between the stations ============
  const STN = [[0, 0, 7], [FX, FZ, 7.5], [HX, HZ, 8.5], [SX, SZ, 5.5]];
  const rB = mulberry(1857);
  for (let i = 0; i < 230; i++) {
    const x = -48 + rB() * 64, z = -30 + rB() * 46, w = 1.2 + rB() * 2.4, d = 1.2 + rB() * 2.4, h = 0.6 + rB() * rB() * 8;
    if (STN.some(([sx, sz, rad]) => Math.hypot(x - sx, z - sz) < rad + Math.max(w, d) * 0.5 || (Math.abs(x - sx) < 6.5 && z > sz && z < sz + 30))) continue;
    box(w, h, d, rB() < 0.5 ? plaster : plaster2, x, h / 2, z, scene);
    if (rB() < 0.2) { cyl(0.04, 0.05, 0.5, 6, plaster2, x + w * 0.6, 0.25, z + d * 0.6, scene); const tr = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), plaster); tr.position.set(x + w * 0.6, 0.72, z + d * 0.6); tr.castShadow = true; scene.add(tr); }
  }

  // sparks at every catch (additive orange points, ballistic from event origin)
  const NS = 90, spk = pts(scene, NS, { color: 0xffffff, size: 0.09, add: true });
  for (let i = 0; i < NS; i++) { spk.col[i * 3] = 3.0; spk.col[i * 3 + 1] = 1.25; spk.col[i * 3 + 2] = 0.35; }
  const rS = mulberry(99), sparkB = [...Array(NS)].map(() => [(rS() - 0.5) * 2, rS() * 1.6, (rS() - 0.5) * 1.2, 0.3 + rS() * 0.5]);

  // ---------- time ----------
  const ts1 = A("s1:putus") + 0.1, tc1 = ts1 + 0.42;
  const ts2 = A("s2:putus") + 0.15;
  const tf3 = A("s3:putus") + 0.05, tc3 = tf3 + 0.25;
  const th3 = A("s3:menantang") + 0.15, thc = th3 + 0.3;
  const tj6 = A("s6:jatuh") - 0.25, tb6 = A("s6:bekerja"), tst6 = A("s6:menghentikannya");
  const ts7 = A("s7:putus") + 0.05, tb7 = A("s7:governor"), tst7 = A("s7:menghentikannya");
  const tPadam = A("s7:padam"), tTahun7 = A("s7:Tahun");
  const fallTo = (y0, g, t0, tb, tst) => { // free fall from y0 at t0 with gravity g until tb, then decelerate to stop at tst
    const vb = g * (tb - t0), yb = y0 - 0.5 * g * (tb - t0) ** 2, db = vb * (tst - tb) * 0.5;
    return (t) => { if (t <= t0) return y0; if (t <= tb) return y0 - 0.5 * g * (t - t0) ** 2; const u = clamp01((t - tb) / (tst - tb)); return yb - db * (2 * u - u * u); };
  };
  const f1 = (t) => { if (t < ts1) return 6.6 + 0.6 * smooth(t / ts1); if (t < tc1) return 7.2 - 0.5 * 9 * (t - ts1) ** 2; const d = 0.5 * 9 * (tc1 - ts1) ** 2; return 7.2 - d - 0.03 * Math.exp(-(t - tc1) * 9) * Math.sin((t - tc1) * 40); };
  const f6 = fallTo(9.2, 3.0, tj6, tb6, tst6);
  const f7 = fallTo(10.2, 2.4, ts7, tb7, tst7);
  const cabY = (t) => {
    if (t < K.s2) return f1(t);
    if (t < K.s5) return 1.6;
    if (t < K.s6) return 1.6 + 7.6 * smooth((t - A("s5:ditarik")) / (K.s5e - A("s5:ditarik")));
    if (t < K.s7) return t < tj6 ? lerp(9.2, 9.2, 0) + 0.0 * t : f6(t);
    if (t < K.s8) return t < ts7 ? 10.2 : f7(t);
    return 1.4 + 9.6 * smooth((t - K.s8 + 0.2) / (K.end - K.s8 + 0.4));
  };
  // s6 needs a visible drive before the fall: the cabin creeps down from 9.6 to 9.2
  const cabY6 = (t) => (t < tj6 ? 9.6 - 0.4 * smooth((t - K.s6) / (tj6 - K.s6)) : f6(t));
  const cabYAll = (t) => (t >= K.s6 && t < K.s7 ? cabY6(t) : cabY(t));
  const snapAt = (t) => {
    if (t >= ts1 && t < K.s2) return { t0: ts1, y0: f1(ts1) };
    if (t >= ts7 && t < K.s8 - 0.05) return { t0: ts7, y0: 10.2 };
    return null;
  };
  const wedgeAt = (t) => {
    if (t < K.s2) return ramp(t, tc1 - 0.1, tc1);
    if (t >= K.s6 && t < K.s7) return ramp(t, tb6 - 0.05, tb6 + 0.1);
    if (t >= K.s7 && t < K.s8) return ramp(t, tb7 - 0.05, tb7 + 0.1);
    return 0;
  };
  const gvTrip = (t) => (t >= K.s6 && t < K.s7 ? ramp(t, tb6 - 0.1, tb6 + 0.05) : t >= K.s7 && t < K.s8 ? ramp(t, tb7 - 0.1, tb7 + 0.05) : 0);
  // power: on, except from padam until the 2007 cut
  const powerAt = (t) => 1 - ramp(t, tPadam - 0.05, tPadam + 0.2) * (1 - ramp(t, tTahun7 - 0.3, tTahun7 + 0.3));
  // brake: open (energised) shoes during driving; s7 shows it explicitly
  const brakeOpen = (t) => {
    if (t >= K.s7 && t < tTahun7) return ramp(t, A("s7:ditahan") - 0.2, A("s7:terbuka") + 0.2) * (1 - ramp(t, tPadam, tPadam + 0.15));
    return 1;
  };
  const sparkEvents = () => [
    [tc1, (p) => p.set(CABX, f1(tc1), 0)],
    [tc3, (p) => p.set(FX + 1.2, 0.18 + 3.2 - 0.3 + 0.98, FZ - 0.6)],
    [thc, (p) => p.set(HX, 0.2 + 5.6 - 0.44 + 0.98, HZ)],
    [tb6, (p) => p.set(CABX, f6(tb6), 0)],
    [tb7, (p) => p.set(CABX, f7(tb7), 0)],
  ];
  const SE = sparkEvents();
  const _o = new THREE.Vector3();

  // factory platform: rise, crash at s2 putus, re-rise in s3, snap + catch
  const fPlat = (t) => {
    if (t < K.s3) { const up = 0.0 + 3.2 * smooth((t - A("s2:butuh")) / (A("s2:berat") + 0.6 - A("s2:butuh"))); if (t < ts2) return up; const dt = t - ts2; const y = 3.2 - 0.5 * 9.8 * dt * dt; return y > 0 ? y : 0.02 * Math.abs(Math.sin(dt * 30)) * Math.exp(-dt * 6); }
    const re = 3.2 * smooth((t - K.s3) / (A("s3:pengaman") - K.s3));
    if (t < tf3) return re;
    if (t < tc3) return 3.2 - 0.5 * 9.6 * (t - tf3) ** 2;
    return 3.2 - 0.5 * 9.6 * (tc3 - tf3) ** 2;
  };
  const fSnap = (t) => (t >= ts2 && t < K.s3 ? { dt: t - ts2, yb: 3.2 + 0.98 + 0.8, hitch0: 3.2 + 0.98 } : t >= tf3 && t < K.s4 ? { dt: t - tf3, yb: 3.2 + 0.98 + 0.7, hitch0: 3.2 + 0.98 } : null);
  const hPlat = (t) => { const up = 0.0 + 5.6 * smooth((t - A("s3:Tahun")) / (A("s3:memamerkannya") + 0.5 - A("s3:Tahun"))); if (t < th3) return up; if (t < thc) return 5.6 - 0.5 * 9.8 * (t - th3) ** 2; return 5.6 - 0.5 * 9.8 * (thc - th3) ** 2; };
  const hSnap = (t) => (t >= th3 ? { dt: t - th3, yb: 5.6 + 0.98 + 0.7, hitch0: 5.6 + 0.98 } : null);

  // ---------- camera ----------
  const camT = track([
    [0, 2.2, 8.9, 11.2, -0.6, 8.3, 0],
    [A("s1:jatuh"), 1.6, 8.4, 9.8, -0.6, 7.9, 0],
    [A("s1:dramatis"), 3.0, 8.9, 11.6, -0.6, 8.0, 0],
    [K.s1e - 0.3, 4.0, 12.5, 22.0, -2.5, 7.0, -2],
    [K.s2 + 0.9, -11.6, 4.4, 7.4, -12.1, 2.3, -9.2],
    [A("s2:pabrik"), -11.9, 4.2, 6.6, -12.1, 2.3, -9.2],
    [A("s2:mesin"), -11.4, 4.4, 5.8, -11.9, 2.5, -9.4],
    [A("s2:putus") - 0.2, -9.6, 3.8, 1.8, -10.3, 2.2, -10.4],
    [K.s2e, -9.7, 3.5, 1.6, -10.3, 1.8, -10.4],
    [A("s3:pengaman"), -9.6, 4.4, -3.2, -10.8, 3.5, -10.6],
    [A("s3:putus"), -9.9, 4.6, -3.8, -10.8, 3.6, -10.6],
    [A("s3:Tahun") - 0.35, -10.6, 5.0, -1.2, -10.9, 3.6, -10.4],
    [A("s3:Tahun") + 0.55, -23.8, 5.6, 14.0, -27.0, 3.8, -3.0],
    [A("s3:memamerkannya"), -23.6, 6.2, 13.0, -27.0, 4.6, -3.2],
    [A("s3:Crystal"), -22.8, 6.8, 11.0, -27.0, 5.4, -4.0],
    [A("s3:menantang"), -24.6, 7.0, 6.2, -27.0, 6.2, -4.0],
    [K.s3e, -24.3, 6.4, 7.4, -27.0, 5.7, -4.0],
    [K.s4 + 1.3, -11.0, 5.5, 26.0, -13.0, 4.8, 8.0],
    [A("s4:toko"), -11.6, 5.8, 24.5, -13.0, 5.6, 8.0],
    [A("s4:Prinsip"), -12.2, 7.0, 23.0, -13.0, 6.6, 8.0],
    [K.s4e, -6.0, 13.5, 18.0, -1.5, 13.0, 0],
    [A("s5:puli"), 1.0, 14.6, 15.5, -0.45, 14.7, 0.4],
    [A("s5:menggerakkan"), 0.6, 14.8, 14.8, -0.45, 14.7, 0.4],
    [A("s5:pemberat"), 3.4, 7.4, 17.0, 0.2, 6.4, 0],
    [A("s5:rel"), 4.0, 9.0, 18.5, -0.1, 7.6, 0],
    [K.s5e, 0.6, 14.9, 15.2, -0.45, 14.75, 0.4],
    [A("s6:governor"), 0.2, 15.0, 14.6, -0.55, 14.8, 0.4],
    [A("s6:temuan"), -0.1, 15.1, 14.2, -0.55, 14.8, 0.4],
    [A("s6:jatuh") - 0.1, 3.0, 11.0, 19.0, -1.2, 9.6, 0],
    [A("s6:bekerja"), 3.4, 10.0, 20.5, -1.2, 9.0, 0],
    [K.s6e, 2.2, 13.8, 12.0, 0.2, 14.4, 0.6],
    [A("s7:ditahan"), 1.6, 14.9, 8.6, 0.25, 14.7, 0.9],
    [A("s7:pegas"), 0.9, 14.8, 7.6, 0.25, 14.6, 0.9],
    [A("s7:mengunci"), 1.3, 15.0, 7.9, 0.25, 14.7, 0.9],
    [tTahun7 + 0.6, 6.0, 9.8, 20.5, -0.5, 8.6, 0],
    [A("s7:Seattle"), 5.2, 10.8, 19.5, 0.0, 10.6, 0.5],
    [A("s7:governor"), 3.2, 8.8, 18.0, -1.0, 7.4, 0],
    [K.s7e, 3.6, 8.6, 19.0, -1.0, 7.2, 0],
    [K.s8 + 1.0, 9.0, 6.0, 26.0, -0.6, 7.6, 0],
    [A("s8:salah"), 7.0, 8.5, 25.5, -0.6, 7.0, 0],
    [A("s8:Ikuti"), 4.5, 11.5, 26.5, -0.6, 9.0, 0],
    [K.end + 0.3, 3.5, 13.5, 28.0, -0.6, 10.0, 0],
  ]);
  const tg = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    const shk = 0.05 * (Math.exp(-Math.max(0, t - tc1) * 9) * (t > tc1 ? 1 : 0) + Math.exp(-Math.max(0, t - (ts2 + 0.78)) * 9) * (t > ts2 + 0.78 && t < K.s3 ? 1 : 0) + Math.exp(-Math.max(0, t - thc) * 9) * (t > thc ? 1 : 0));
    cam.position.set(c[0] + Math.sin(t * 57) * shk, c[1] + Math.sin(t * 43) * shk, c[2]);
    tg.set(c[3], c[4], c[5]); cam.lookAt(tg);
    sun.position.copy(tg).addScaledVector(SUND, 50); sun.target.position.copy(tg);
    fill.position.set(c[0], c[1] + 3, c[2]); fill.target.position.copy(tg);
    const pw = powerAt(t), dim = 1 - pw;
    sun.intensity = 3.4 * (1 - 0.55 * dim); hemi.intensity = 0.3 * (1 - 0.4 * dim); fill.intensity = 1.15 * (1 - 0.8 * dim);
    bgU.dim.value = dim;
    roomLamp.intensity = 3.5 * pw; lampM.color.setRGB(pw, 0.94 * pw, 0.84 * pw); cabLamp.intensity = 2.2 * pw; cabGlow.color.setRGB(0.2 + 0.8 * pw, 0.19 + 0.76 * pw, 0.17 + 0.68 * pw);

    // ---- tower ----
    const y = cabYAll(t), snap = snapAt(t);
    CAB.position.set(CABX, y, 0);
    const cwy = snap ? 12 - snap.y0 : 12 - y;
    CW.position.set(CWX, cwy, 0);
    const driveY = snap ? snap.y0 : y;
    shWheel.rotation.z = driveY / SHR_;
    const brU = brakeOpen(t);
    drum.rotation.z = (t >= K.s7 && t < tTahun7) ? (0.9 * (t - K.s7) - 0.9 * Math.max(0, t - tPadam - 0.15) + 0.9 * Math.max(0, t - tPadam - 0.15) * 0) * (1 - ramp(t, tPadam, tPadam + 0.2) * 0) : driveY / SHR_;
    if (t >= K.s7 && t < tTahun7) { const run = (tt) => 1.6 * tt; const tOff = tPadam + 0.15; drum.rotation.z = t < tOff ? run(t - K.s7) : run(tOff - K.s7) + 0.25 * (1 - Math.exp(-(t - tOff) * 12)); shWheel.rotation.z = drum.rotation.z; }
    for (const a of brArms) a.piv.rotation.z = a.s * 0.12 * brU;
    for (const s of springs) { const len = 0.42 + 0.1 * (1 - brU); s.grp.position.set(s.s * 1.36 - (s.s > 0 ? len : 0), -0.55 + 0.0, 0); s.grp.scale.set(len, 1, 1); s.grp.position.x = s.s > 0 ? 1.36 - len : -1.36; }
    coilM.emissiveIntensity = 1.6 * brU * pw * (t >= K.s7 && t < tTahun7 ? 1 : 0.4);
    for (const l of links) { const ax = l.s * 0.82 + l.s * 1.75 * Math.sin(l.s * 0.12 * brU), ay = -0.85 + 1.75 * Math.cos(0.12 * brU); span(l.m, l.s * 0.35, 1.15, 0.1, ax, ay, 0.1); }
    boltM.opacity = (t >= K.s7 && t < tTahun7) ? ramp(t, A("s7:listrik") - 0.2, A("s7:listrik") + 0.2) * (1 - ramp(t, tPadam - 0.05, tPadam + 0.1)) * (0.75 + 0.25 * Math.sin(t * 22)) : 0;
    lockM.opacity = (t >= K.s7 && t < tTahun7) ? back(clamp01((t - A("s7:mengunci") + 0.2) / 0.35), 2) * (1 - ramp(t, tTahun7 - 0.4, tTahun7)) : 0;
    lock.scale.setScalar(0.6 + 0.4 * clamp01((t - A("s7:mengunci") + 0.2) / 0.35));
    const sprPulse = (t >= K.s7 && t < tTahun7) ? Math.exp(-(((t - A("s7:pegas")) / 0.35) ** 2)) : 0;
    for (const s of springs) s.grp.children.forEach((ch) => ch.scale.setScalar(1 + 0.35 * sprPulse));
    // ropes
    const top = SHEY, hitchY = y + CABH + 0.35;
    if (!snap) {
      RZ.forEach((z, i) => { ropeUp[i].visible = true; span(ropeUp[i], CABX, top, z, CABX, hitchY, z); ropeLo[i].visible = false; });
    } else {
      const dt = t - snap.t0, yb = snap.y0 + CABH + 0.35 + 2.0;
      RZ.forEach((z, i) => {
        const upE = Math.min(top - 0.05, yb + 1.4 * eout(dt / 0.35) + i * 0.08), sw = 0.22 * Math.sin(dt * 14 + i) * Math.exp(-dt * 3);
        span(ropeUp[i], CABX, top, z, CABX + sw, upE, z + sw * 0.4);
        const L = 2.0 * (1 - 0.5 * eout(dt / 0.5)), tip = 0.7 * eout(dt / 0.5) * (i - 1 || 0.6);
        ropeLo[i].visible = true; span(ropeLo[i], CABX, hitchY, z, CABX + tip, hitchY + L, z + 0.1 * i);
      });
    }
    RZ.forEach((z, i) => span(ropeCw[i], CWX, top, z - 0.1, CWX, cwy + CWH + 0.05, z - 0.1));
    // moving marks on the cabin ropes show the rope travelling over the sheave
    const showMarks = !snap && t >= K.s5 && t < K.s7;
    ropeMarks.forEach((m, i) => { const side = i % 2, k = Math.floor(i / 2); const base = side ? cwy + CWH : hitchY; const off = ((k * 1.3 + (side ? -driveY : driveY) * 0) % 7.8); const yy = base + 0.4 + off; m.visible = showMarks && yy < top - 0.3; m.position.set(side ? CWX : CABX, yy, side ? -0.1 : 0); });
    arrowM.opacity = 0.55 * ((t >= K.s5 && t < K.s6) ? ramp(t, A("s5:Gesekan") - 0.2, A("s5:Gesekan") + 0.3) * (1 - ramp(t, A("s5:pemberat") - 0.6, A("s5:pemberat"))) : 0);
    arrows.rotation.z = -driveY / SHR_ * 0.5;
    const ringU = (t >= K.s5 && t < K.s6) ? ramp(t, A("s5:pemberat") - 0.1, A("s5:pemberat") + 0.3) * (1 - ramp(t, A("s5:rel") - 0.3, A("s5:rel"))) : 0;
    cwRing.material.opacity = ringU * (0.75 + 0.25 * Math.sin(t * 8)); cwRing.visible = ringU > 0.01;
    railM.emissiveIntensity = (t >= K.s5 && t < K.s6) ? 0.9 * ramp(t, A("s5:rel") - 0.2, A("s5:rel") + 0.2) * (0.7 + 0.3 * Math.sin(t * 7)) : 0;
    // safety wedges slide up and pinch the rails
    const wu = wedgeAt(t);
    for (const [w, s] of wedges) { w.position.y = -0.1 + 0.12 * wu; }
    // governor: spins with the governor rope (which moves with the cabin) until tripped, flyweights fly out with speed
    const trip = gvTrip(t);
    const v = Math.abs(cabYAll(t) - cabYAll(t - 0.04)) / 0.04;
    gvWheel.rotation.z = -cabYAll(t) / GVR;
    const spread = clamp01(v / 4) * 0.9 + 0.1 * trip;
    fly.forEach((arm, i) => { arm.rotation.z = (i ? -1 : 1) * 0 + spread * 0.8; });
    gvLatch.rotation.z = -0.9 * trip;
    gvGlow.material.opacity = 0.55 * Math.max(trip * Math.exp(-Math.max(0, t - (t < K.s7 ? tb6 : tb7)) * 1.2), (t >= K.s6 && t < K.s7) ? ramp(t, A("s6:governor") - 0.2, A("s6:governor") + 0.2) * (1 - ramp(t, A("s6:jatuh") - 0.6, A("s6:jatuh") - 0.2)) * 0.8 : 0);
    gvGlow.visible = gvGlow.material.opacity > 0.01;
    const gTop = GVY, gBot = 0.75;
    span(gvRopes[0], GVX - GVR, gTop, GVZ, GVX - 0.3, gBot, GVZ);
    span(gvRopes[1], GVX + GVR, gTop, GVZ, GVX + 0.3, gBot, GVZ);
    gvBeads.forEach((b, i) => { const side = i % 2, k = Math.floor(i / 2); const span_ = gTop - gBot; const yy = gBot + ((k * span_ / 8 + (side ? 1 : -1) * cabYAll(t)) % span_ + span_) % span_; const u = (yy - gBot) / span_; b.position.set(side ? lerp(GVX + 0.3, GVX + GVR, u) : lerp(GVX - 0.3, GVX - GVR, u), yy, GVZ); b.visible = t >= K.s5 && t < K.s8 + 0.5; });
    hSign.visible = hPost.visible = false; // name lives on the panel; the floor sign kept clipping frame edges
    otisPlate.visible = t < K.s3;
    sign.visible = signBack.visible = t < K.s4 || t >= A("s8:Ikuti") - 1.2; // close machine-room shots would crop the wide roof sign
    seattle.visible = seaStand.visible = t > tTahun7 - 0.2 && t < K.s8;
    // wing people idle
    wingPeople.forEach((p, i) => pose(p, i % 3 === 0 ? "point" : "stand", 0.4 + 0.3 * Math.sin(t * 0.7 + i)));
    pose(rider, "brace", (t < K.s2 ? ramp(t, ts1, ts1 + 0.2) * (1 - ramp(t, tc1 + 1.2, tc1 + 2.2)) : 0) + (t >= K.s7 && t < K.s8 ? ramp(t, ts7, ts7 + 0.25) * (1 - ramp(t, tst7 + 0.6, tst7 + 1.6)) : 0));
    pose(rider2, "brace", (t < K.s2 ? ramp(t, ts1 + 0.05, ts1 + 0.25) * (1 - ramp(t, tc1 + 1.2, tc1 + 2.2)) : 0));

    // ---- factory ----
    const fp = fPlat(t);
    fRig.set(fp, fSnap(t), t < K.s3 ? 0 : ramp(t, A("s3:pengaman") - 0.2, A("s3:pengaman") + 0.6), t < tf3 ? 0 : ramp(t, tf3 + 0.05, tc3));
    pose(otis, t < K.s3 ? "point" : "wave", t < K.s3 ? ramp(t, A("s2:mesin") - 0.3, A("s2:mesin") + 0.2) * (1 - ramp(t, ts2 - 0.2, ts2)) : ramp(t, tc3, tc3 + 0.3), t * 6);
    pose(worker, "brace", t < K.s3 ? ramp(t, ts2, ts2 + 0.2) * (1 - ramp(t, ts2 + 1.4, ts2 + 2.2)) : 0);
    const dU = t >= ts2 + 0.75 && t < K.s3 + 0.5 ? clamp01((t - ts2 - 0.75) / 2.2) : -1;
    dust.m.opacity = dU < 0 ? 0 : 0.55 * (1 - dU); dust.P.visible = dU >= 0;
    if (dust.P.visible) { for (let i = 0; i < 70; i++) { const b = dustB[i], rr = b[1] * eout(dU) * 1.3; dust.pos[i * 3] = FX + 1.2 + Math.cos(b[0]) * rr; dust.pos[i * 3 + 1] = 0.25 + b[2] * eout(dU) * 0.9; dust.pos[i * 3 + 2] = FZ - 0.6 + Math.sin(b[0]) * rr * 0.6; } dust.commit(); }

    // ---- hall ----
    hRig.set(hPlat(t), hSnap(t), 1, t < th3 ? 0 : ramp(t, th3 + 0.05, thc));
    pose(otis2, "wave", ramp(t, A("s3:memamerkannya"), A("s3:memamerkannya") + 0.4) * (1 - ramp(t, th3 - 0.2, th3)) + ramp(t, thc + 0.25, thc + 0.6), t * 7);
    crowd.forEach((c, i) => pose(c.p, "cheer", ramp(t, thc + 0.2 + c.d, thc + 0.6 + c.d) * (0.8 + 0.2 * Math.sin(t * 5 + c.ph)), t * 6 + c.ph));

    // ---- store lift ----
    const sy = 0.1 + 6.9 * smooth((t - A("s4:penumpang") + 0.3) / (A("s4:Prinsip") - A("s4:penumpang") + 0.3));
    sCab.position.y = sy; span(sRope, 0, SH - 0.1, 0.6, 0, sy + 1.29, 0.6);

    // ---- sparks ----
    let ev = null;
    for (const e of SE) if (t >= e[0] && t < e[0] + 0.8) ev = e;
    spk.P.visible = !!ev; spk.m.opacity = ev ? 1 - clamp01((t - ev[0]) / 0.8) : 0;
    if (ev) { ev[1](_o); const dt = t - ev[0]; for (let i = 0; i < NS; i++) { const b = sparkB[i]; const side = i % 2 ? 1 : -1; spk.pos[i * 3] = _o.x + side * 1.0 + b[0] * dt * 2.2; spk.pos[i * 3 + 1] = _o.y + b[1] * dt * 2.2 - 4.9 * dt * dt; spk.pos[i * 3 + 2] = _o.z + b[2] * dt * 2.2 + 0.4; } }
    spk.commit();

    comp.render();
  };
}
