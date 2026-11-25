// EP40 EXPANSION JOINT (BUILDFORGE). A daylight construction site over a river valley: a concrete deck on three blue
// steel girders spans x -24..0 (pinned at the west abutment, free at the east end), piers at x -16 and -8, the east
// abutment and road embankment from x 0.6. At x~0 the finger joint: two comb plates, one riding on the deck end, one
// fixed to the abutment, teeth interleaved. A tower crane lowers the abutment plate into its seat in the hook.
// Temperature drives everything: deck length (exaggerated), sun angle, sky tint, a site thermometer. s5 locks both
// ends: the deck bows up and cracks. A rounded metallic sedan crosses the joint on word anchors.
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, stage, label } from "./lib3d.js";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// neutral daylight grade with a warm/cool push from the temperature
const Grade = { uniforms: { tDiffuse: { value: null }, warm: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float warm;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(0.299,0.587,0.114));
  c*=mix(vec3(0.94,0.99,1.08),vec3(1.07,1.0,0.9),warm);c=mix(vec3(l),c,1.06);c=(c-0.5)*1.05+0.5;vec2 d=vUv-vec2(0.5,0.45);c*=1.0-0.28*dot(d,d);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const std = (c, r = 0.8, m = 0, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o });
function noiseTex(seed, base, spots, a = 0.07, rep = [4, 4], w = 256) {
  const R = mulberry(seed);
  return canvasTex(w, w, (g) => { g.fillStyle = base; g.fillRect(0, 0, w, w); for (let i = 0; i < spots; i++) { g.fillStyle = R() < 0.5 ? `rgba(0,0,0,${a * R()})` : `rgba(255,255,255,${a * R()})`; const s = 1 + R() * 5; g.fillRect(R() * w, R() * w, s, s); } }, rep);
}
// box with many x segments so it can bow; returns setter
function bowBox(w, h, d, mat, x, y, z, parent, seg = 60) {
  const geo = new THREE.BoxGeometry(w, h, d, seg, 1, 1), m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m);
  const base = geo.attributes.position.array.slice();
  return (fn) => { const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 1] = base[i + 1] + fn(base[i] + x); geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
}

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x9cc4e4, fog: 0.008, exp: 1.0, bloom: [0.25, 0.4, 0.9] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  { const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x8fb4d4);
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x6b6a52, side: THREE.DoubleSide })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -5; s.add(gnd);
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ color: 0xfff1d6, side: THREE.DoubleSide })); sun.position.set(-10, 12, 8); sun.lookAt(0, 0, 0); s.add(sun);
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose(); }
  scene.environmentIntensity = 0.55;
  // sky dome with a vertical gradient (tinted per temperature)
  const skyTex = canvasTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#4f86c6"); gr.addColorStop(0.55, "#a9cbe8"); gr.addColorStop(1, "#f3e3c6"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })); scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x6b5a40, 0.7); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xfff0d8, 2.4); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -30, right: 22, top: 22, bottom: -14, far: 120 }); sunL.shadow.bias = -0.0004; scene.add(sunL, sunL.target);

  // ---------- terrain: valley, river, hills ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 160, 80, 60), std(0x7f8a4a, 0.95, 0, { map: noiseTex(3, "#8a9150", 1600, 0.12, [30, 22]) }));
  { const p = ground.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = p[i], y = p[i + 1]; const vx = Math.abs(x + 12); p[i + 2] = Math.max(0, (vx - 9) * 0.35) + 0.8 * Math.sin(x * 0.11 + y * 0.07) * clamp01((vx - 6) / 10) + (y > 20 ? (y - 20) * 0.5 * (1 + Math.sin(x * 0.06)) : 0); } ground.geometry.computeVertexNormals(); }
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.2, 0); ground.receiveShadow = true; scene.add(ground);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(12, 160), std(0x3f7fa8, 0.15, 0.1, { envMapIntensity: 1 })); river.rotation.x = -Math.PI / 2; river.position.set(-12, 0.05, 0); scene.add(river);
  const RT = mulberry(17), trees = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std(0x4f6b2f, 0.9), 90); trees.castShadow = true; scene.add(trees);
  { const o = new THREE.Object3D(); for (let i = 0; i < 90; i++) { let x = RT() * 90 - 55, z = -10 - RT() * 50; if (i % 3 === 0) z = 8 + RT() * 30; o.position.set(x, 1 + Math.max(0, (Math.abs(x + 12) - 9) * 0.35) * 0.9, z); const s = 1.2 + RT() * 1.6; o.scale.set(s, s * 1.25, s); o.updateMatrix(); trees.setMatrixAt(i, o.matrix); } }

  // ---------- bridge ----------
  const BR = new THREE.Group(); scene.add(BR); // the free span: moves with temperature
  const concrete = std(0xbdb6a8, 0.85, 0, { map: noiseTex(5, "#c2bbad", 2600, 0.1, [8, 2]) });
  const asphalt = std(0x3a3a3d, 0.9, 0, { map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#38383b"; g.fillRect(0, 0, w, h); const R = mulberry(8); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${R() * 0.06})`; g.fillRect(R() * w, R() * h, 2, 2); } g.fillStyle = "#e9e6dc"; for (let x = 0; x < w; x += 64) g.fillRect(x, h / 2 - 3, 36, 6); g.fillStyle = "#f2c230"; g.fillRect(0, 10, w, 5); g.fillRect(0, h - 15, w, 5); }, [6, 1]) });
  const steel = std(0x2f5f8f, 0.4, 0.6);
  const bowFns = [];
  bowFns.push(bowBox(24, 0.42, 3.4, concrete, -12, 3.79, 0, BR));
  bowFns.push(bowBox(24, 0.02, 3.0, asphalt, -12, 4.01, 0, BR));
  for (const z of [-1.1, 0, 1.1]) { bowFns.push(bowBox(24, 0.9, 0.08, steel, -12, 3.13, z, BR)); bowFns.push(bowBox(24, 0.06, 0.42, steel, -12, 2.66, z, BR)); }
  for (const z of [-1.62, 1.62]) bowFns.push(bowBox(24, 0.5, 0.18, concrete, -12, 4.25, z, BR));
  // piers and west abutment (fixed)
  for (const x of [-16, -8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 2.9, 24), concrete); p.position.set(x, 1.25, 0); p.castShadow = true; scene.add(p); const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 3.3), concrete); cap.position.set(x, 2.5, 0); cap.castShadow = true; scene.add(cap); }
  const wAb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.6, 4.2), concrete); wAb.position.set(-25.2, 1.7, 0); wAb.castShadow = true; scene.add(wAb);
  // east abutment + embankment road
  const eAb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.6, 4.2), concrete); eAb.position.set(1.6, 1.7, 0); eAb.castShadow = eAb.receiveShadow = true; scene.add(eAb);
  const emb = new THREE.Mesh(new THREE.BoxGeometry(18, 4.0, 4.6), std(0x8a7558, 0.95, 0, { map: noiseTex(9, "#8d785a", 2000, 0.12, [6, 2]) })); emb.position.set(11.6, 1.8, 0); emb.receiveShadow = true; scene.add(emb);
  const road = new THREE.Mesh(new THREE.BoxGeometry(20, 0.03, 3.0), asphalt); road.position.set(10.6, 4.0, 0); road.receiveShadow = true; scene.add(road);
  for (const z of [-1.62, 1.62]) { const b = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 0.18), concrete); b.position.set(10.6, 4.25, z); b.castShadow = true; scene.add(b); }
  const voidM = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 3.4), std(0x0d0d10, 1)); voidM.position.set(0.0, 3.25, 0); scene.add(voidM);
  // finger plates: A rides the deck end, B is lowered onto the abutment by the crane
  const plateM = std(0x8c9196, 0.35, 0.9), toothN = 10;
  const PA = new THREE.Group(), PB = new THREE.Group(); scene.add(PA, PB);
  { const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 3.0), plateM); body.position.set(-0.28, 3.95, 0); body.castShadow = true; PA.add(body);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 3.0), plateM); b2.position.set(0.28, 3.95, 0); b2.castShadow = true; PB.add(b2);
    const tg = new THREE.BoxGeometry(0.95, 0.14, 0.13); tg.translate(0.475, 0, 0);
    for (let i = 0; i < toothN; i++) { const z = -1.35 + i * 0.3; const a = new THREE.Mesh(tg, plateM); a.position.set(0, 3.95, z); a.castShadow = true; PA.add(a); const b = new THREE.Mesh(tg, plateM); b.rotation.y = Math.PI; b.position.set(0, 3.95, z + 0.15); b.castShadow = true; PB.add(b); }
    for (let i = 0; i < 6; i++) for (const P of [PA, PB]) { const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), std(0x5b5f63, 0.4, 0.9)); bolt.position.set(P === PA ? -0.28 : 0.28, 4.03, -1.25 + i * 0.5); P.add(bolt); } }
  // site thermometer on the abutment
  const TH = new THREE.Group(); TH.position.set(2.3, 4.0, -2.35); scene.add(TH);
  const thBoard = new THREE.Mesh(new THREE.BoxGeometry(0.62, 2.2, 0.08), std(0xf4f1ea, 0.6)); thBoard.position.y = 1.5; TH.add(thBoard);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 10), std(0x55585c, 0.4, 0.8)); post.position.y = 0.2; TH.add(post);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.7, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 })); tube.position.set(0, 1.55, 0.06); TH.add(tube);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), std(0xd83a2c, 0.3, 0, { emissive: 0x6a1008, emissiveIntensity: 0.6 })); bulb.position.set(0, 0.62, 0.06); TH.add(bulb);
  const colGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 10); colGeo.translate(0, 0.5, 0);
  const col = new THREE.Mesh(colGeo, std(0xd83a2c, 0.3, 0, { emissive: 0x8a1408, emissiveIntensity: 0.7 })); col.position.set(0, 0.7, 0.06); TH.add(col);
  const thLab = label("SUHU", { w: 256, h: 80, font: "800 54px Arial, sans-serif", color: "#1d2733", size: 0.55 }); thLab.position.set(0, 2.45, 0.05); TH.add(thLab);
  // crane: mast, jib, trolley, hook block, cables, counterweight with AUDIRA
  const yel = std(0xf2b51c, 0.55, 0.2);
  const latTex = canvasTex(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 7; g.strokeRect(3, 0, w - 6, h); for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y + 64); g.stroke(); g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); } }, [1, 10]);
  const latM = new THREE.MeshStandardMaterial({ color: 0xf2b51c, roughness: 0.5, metalness: 0.2, map: latTex, alphaMap: latTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
  const CR = new THREE.Group(); CR.position.set(6.5, 0, -6.5); scene.add(CR);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.9, 18, 0.9), latM); mast.position.y = 9; mast.castShadow = true; CR.add(mast);
  const jibPiv = new THREE.Group(); jibPiv.position.y = 18.2; CR.add(jibPiv);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(17, 0.7, 0.7), latM); jib.position.x = -4.5; jib.castShadow = true; jibPiv.add(jib);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.0), yel); cab.position.set(0.9, -0.6, 0.6); jibPiv.add(cab);
  const cw = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 1.1), std(0x5b5f63, 0.8)); cw.position.set(3.4, -0.6, 0); jibPiv.add(cw);
  const cwLab = label("AUDIRA", { w: 512, h: 128, font: "900 96px Arial Black, Arial, sans-serif", color: "#f2b51c", size: 1.5 }); cwLab.position.set(3.4, -0.6, 0.56); jibPiv.add(cwLab);
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.8), yel); jibPiv.add(trolley);
  const hookB = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.3), yel); scene.add(hookB);
  const cableM = new THREE.LineBasicMaterial({ color: 0x222222 });
  const cables = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(30), 3)), cableM); cables.frustumCulled = false; scene.add(cables);
  // site board with the brand
  const board = new THREE.Group(); board.position.set(4.3, 4.0, 2.75); board.rotation.y = -0.35; scene.add(board);
  { for (const x of [-0.8, 0.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), std(0x55585c, 0.5, 0.7)); p.position.set(x, 0.8, 0); board.add(p); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.06), std(0xf2b51c, 0.6)); b.position.y = 1.55; board.add(b);
    const l1 = label("AUDIRA", { w: 512, h: 128, font: "900 92px Arial Black, Arial, sans-serif", color: "#1d2733", size: 1.7 }); l1.position.set(0, 1.7, 0.035); board.add(l1);
    const l2 = label("PROYEK CARA KERJA BENDA", { w: 1024, h: 96, font: "800 52px Arial, sans-serif", color: "#1d2733", size: 1.8 }); l2.position.set(0, 1.3, 0.035); board.add(l2); }
  // yard: a steel test beam on trestles with a dial gauge (s4)
  const YD = new THREE.Group(); YD.position.set(5.5, 4.0, 1.0); scene.add(YD);
  { for (const x of [-0.9, 0.9]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.7), std(0x7a5a3a, 0.8)); tr.position.set(x, 0.3, 0); YD.add(tr); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.22), steel); beam.position.y = 0.72; beam.castShadow = true; YD.add(beam);
    const ru = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 0.12), std(0xf2d44a, 0.5)); ru.position.set(0, 0.84, 0.05); YD.add(ru);
    const ruL = label("1 m", { w: 256, h: 96, font: "800 70px Arial, sans-serif", color: "#1d2733", size: 0.5 }); ruL.position.set(0, 0.98, 0.12); YD.add(ruL); }
  const dial = new THREE.Group(); dial.position.set(1.32, 0.78, 0.12); YD.add(dial);
  dial.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 28).rotateX(Math.PI / 2), std(0xf4f1ea, 0.4)));
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.17, 0.01), std(0xd83a2c, 0.4)); needle.geometry.translate(0, 0.075, 0); needle.position.z = 0.04; dial.add(needle);
  const yLab = label("+12 per sejuta / 1 °C", { w: 1024, h: 128, font: "800 64px Arial, sans-serif", color: "#d83a2c", bg: "rgba(244,241,234,.92)", size: 1.9 }); yLab.position.set(0, 1.45, 0.1); YD.add(yLab);
  // locks + cracks (s5)
  const lockM = std(0xc8322a, 0.5, 0.2, { emissive: 0x4a0a06, emissiveIntensity: 0.5 });
  const locks = [-24.1, 0.0].map((x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 3.6), lockM); m.position.set(x, 3.6, 0); m.castShadow = true; scene.add(m); return m; });
  const lockLab = label("DIKUNCI", { w: 512, h: 128, font: "900 80px Arial Black, Arial, sans-serif", color: "#fff", bg: "#c8322a", size: 1.6 }); lockLab.position.set(0.0, 5.2, 1.9); scene.add(lockLab);
  const RC = mulberry(5), cracks = [];
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.02), std(0x1a1a1a, 1)); c.position.set(-20 + i * 2.1 + RC(), 3.8, 1.72); c.rotation.z = (RC() - 0.5) * 0.9; BR.add(c); cracks.push(c); }
  // tape across the joint (s7): 36 cm extension, 50 cm capacity
  const tape = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.012, 0.16), std(0xf2d44a, 0.5)); tape.position.set(0.1, 4.04, 1.25); scene.add(tape);
  const tLab = label("+36 cm", { w: 512, h: 128, font: "900 84px Arial Black, Arial, sans-serif", color: "#d83a2c", bg: "rgba(244,241,234,.92)", size: 0.9 }); tLab.position.set(0.1, 4.45, 1.3); scene.add(tLab);
  const cLab = label("maks 50 cm", { w: 512, h: 128, font: "900 78px Arial Black, Arial, sans-serif", color: "#1d2733", bg: "#f2b51c", size: 1.0 }); cLab.position.set(0.1, 4.8, -0.6); scene.add(cLab);
  // car: rounded sedan, metallic clearcoat
  const CAR = new THREE.Group(); scene.add(CAR);
  { const s = new THREE.Shape(); s.moveTo(-1.0, 0.18); s.lineTo(1.0, 0.18); s.quadraticCurveTo(1.12, 0.2, 1.1, 0.42); s.quadraticCurveTo(1.0, 0.52, 0.55, 0.54); s.quadraticCurveTo(0.3, 0.84, -0.1, 0.86); s.quadraticCurveTo(-0.55, 0.85, -0.75, 0.56); s.quadraticCurveTo(-1.08, 0.52, -1.1, 0.36); s.quadraticCurveTo(-1.1, 0.2, -1.0, 0.18);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 4, curveSegments: 20 }); g.translate(0, 0, -0.4);
    const body = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: 0xb3242c, metalness: 0.6, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 })); body.castShadow = true; CAR.add(body);
    const gl = new THREE.Shape(); gl.moveTo(0.45, 0.56); gl.quadraticCurveTo(0.26, 0.8, -0.1, 0.81); gl.quadraticCurveTo(-0.5, 0.8, -0.66, 0.57); gl.closePath();
    const gg = new THREE.ExtrudeGeometry(gl, { depth: 0.9, bevelEnabled: false }); gg.translate(0, 0.01, -0.45);
    CAR.add(new THREE.Mesh(gg, std(0x1d2a36, 0.1, 0.6)));
    const wg = new THREE.CylinderGeometry(0.19, 0.19, 0.16, 22); wg.rotateX(Math.PI / 2);
    for (const [x, z] of [[0.68, 0.46], [-0.68, 0.46], [0.68, -0.46], [-0.68, -0.46]]) { const w = new THREE.Mesh(wg, std(0x161616, 0.8)); w.position.set(x, 0.19, z); w.castShadow = true; CAR.add(w); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.17, 14).rotateX(Math.PI / 2), std(0xc8ccd0, 0.3, 0.9)); hub.position.copy(w.position); CAR.add(hub); }
    for (const z of [-0.28, 0.28]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.18), std(0xfff4d0, 0.2, 0, { emissive: 0xfff0c0, emissiveIntensity: 1.2 })); hl.position.set(1.11, 0.38, z); CAR.add(hl); } }

  // ---------- time functions ----------
  const win = (t, a, b, f = 0.35) => ramp(t, a - f, a + f) * (1 - ramp(t, b - f, b + f));
  const temp = (t) => { // 0 cold .. 1 hot, 0.5 mild
    let v = 0.55;
    if (t >= K.s3 && t < K.s4) v = 0.55 + 0.45 * ramp(t, A("s3:panas") - 0.6, A("s3:panas") + 0.2) - 0.95 * ramp(t, A("s3:dingin") - 0.5, A("s3:dingin") + 0.3) + 0.45 * ramp(t, A("s3:menyusut") - 0.3, A("s3:umurnya"));
    else if (t >= K.s4 && t < K.s5) v = 0.55 + 0.08 * ramp(t, A("s4:derajat") - 0.3, A("s4:derajat") + 0.3);
    else if (t >= K.s5 && t < K.s6) v = 0.55 + 0.45 * ramp(t, A("s5:muai") - 0.6, A("s5:muai") + 0.4);
    else if (t >= K.s6 && t < K.s7) v = 0.55 + 0.45 * ramp(t, A("s6:panas") - 0.5, A("s6:panas") + 0.2) - 1.0 * ramp(t, A("s6:dingin") - 0.5, A("s6:dingin") + 0.2) + 0.5 * ramp(t, A("s6:rata") - 0.2, A("s6:rata") + 1.4);
    else if (t >= K.s7 && t < K.s8) v = 0.55 + 0.45 * ramp(t, A("s7:tiga") - 0.4, A("s7:tiga") + 0.6);
    else if (t >= K.s8) v = 0.62;
    return clamp01(v);
  };
  const aging = (t) => (t >= K.s3 && t < K.s4 ? ramp(t, A("s3:menyusut") - 0.3, A("s3:umurnya") + 0.3) : 0);
  const locked = (t) => (t >= K.s5 - 0.1 && t < K.s6 + 0.2 ? ramp(t, A("s5:dikunci") - 0.3, A("s5:dikunci") + 0.2) * (1 - ramp(t, K.s6 - 0.1, K.s6 + 0.3)) : 0);
  // car crossings: the car passes x=0 at these times
  const CROSS = [A("s1:retak") + 0.6, A("s2:melintas") + 0.25, A("s6:rata") + 0.5, A("s8:bernapas"), A("s8:AUDIRA") + 2.4];
  const SPEED = 6.5;

  // ---------- camera ----------
  const C = track([
    [0, 2.3, 4.55, 2.45, -0.2, 4.0, 0.15], [A("s1:sengaja"), 2.6, 5.0, 3.2, -0.2, 4.0, 0.1], [K.s1e, 3.0, 5.3, 3.8, -0.4, 4.0, 0],
    [K.s2 + 0.8, 5.5, 6.6, 9.5, -2.5, 4.0, 0], [A("s2:melintas") - 0.2, 3.4, 5.0, 6.2, -0.4, 4.1, 0], [K.s2e, 3.6, 5.1, 6.4, -0.6, 4.1, 0],
    [K.s3 + 0.8, 14, 12, 23, -10, 3.2, 0], [A("s3:dingin") + 0.5, 12, 10.5, 20, -9, 3.4, 0], [A("s3:menyusut") + 0.3, 6.2, 7.0, 10.5, -1.2, 4.0, 0], [K.s3e, 6.0, 6.8, 10, -1.0, 4.0, 0],
    [K.s4 + 0.7, 8.2, 6.2, 5.9, 5.5, 4.7, 1.0], [A("s4:derajat") + 0.3, 7.6, 5.9, 4.8, 5.8, 4.75, 1.0], [A("s4:panjang") + 0.4, 16, 14, 26, -10, 3.0, 0], [K.s4e, 16, 14, 26.5, -10, 3.0, 0],
    [A("s5:dikunci") + 0.3, 7, 10, 24, -12, 4.0, -1], [A("s5:melengkung") + 0.3, 4, 8.5, 22, -12, 4.6, -1], [A("s5:retak") + 0.3, -4, 5.5, 9.0, -8, 4.0, 0], [K.s5e, -4.5, 5.4, 8.6, -8, 4.0, 0],
    [A("s6:terperosok"), 2.8, 6.0, 4.4, -0.2, 4.0, 0], [A("s6:sisir") + 0.2, 0.4, 7.6, 2.2, 0.1, 4.0, 0.05], [A("s6:menjauh") + 0.2, 0.5, 7.4, 2.0, 0.1, 4.0, 0.05], [A("s6:rata") + 0.3, 2.6, 4.45, 3.0, -0.6, 4.05, 0], [K.s6e, 2.8, 4.5, 3.1, -0.6, 4.05, 0],
    [K.s7 + 0.8, 16, 14, 26, -10, 3.0, 0], [A("s7:enam") + 0.2, 1.9, 5.6, 3.6, 0.0, 4.05, 0.6], [A("s7:setengah") + 0.3, 2.4, 6.2, 4.4, 0.0, 4.1, 0.2], [K.s7e, 2.5, 6.3, 4.6, 0.0, 4.1, 0.2],
    [K.s8 + 0.9, 12, 9, 20, -6, 4.0, 0], [A("s8:AUDIRA"), 10, 8, 17, -4, 4.4, -1], [K.dur, 9.4, 7.6, 16, -3.6, 4.4, -1],
  ]);
  const look = new THREE.Vector3(), o3 = new THREE.Object3D();

  return (t) => {
    const c = C(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.6), c[1] + 0.02 * Math.sin(t * 0.8 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    const T = temp(t), lk = locked(t);
    // deck end travel (exaggerated): hot = longer
    const dL = lk > 0.02 ? 0 : 0.36 * (T - 0.55) / 0.45 - 0.08 * aging(t);
    BR.position.x = dL * 0.5; BR.scale.x = 1 + dL / 24; BR.position.x = -24 * (1 - BR.scale.x) * -1 * 0 + (dL / 2) * 0 + 0; // pinned west end: scale about x=-24
    BR.scale.x = 1 + dL / 24; BR.position.x = (-24) * (1 - BR.scale.x);
    PA.position.x = dL;
    // bow when locked + hot
    const bow = lk * 0.55 * ramp(t, A("s5:melengkung") - 0.6, A("s5:melengkung") + 0.6);
    bowFns.forEach((f) => f((x) => bow * Math.sin(Math.PI * clamp01((x + 24) / 24))));
    locks.forEach((m) => { m.visible = lk > 0.01; m.scale.set(1, Math.max(0.001, back(lk)), 1); });
    lockLab.visible = lk > 0.01; lockLab.scale.setScalar(Math.max(0.001, lk)); lockLab.lookAt(cam.position);
    const cr = lk * ramp(t, A("s5:retak") - 0.3, A("s5:retak") + 0.2);
    cracks.forEach((m, i) => { m.visible = cr > 0.01; m.scale.set(1, Math.max(0.001, clamp01(cr * 1.6 - i * 0.07)), 1); m.position.y = 3.8 + bow * Math.sin(Math.PI * clamp01((m.position.x + 24) / 24)); });
    // sun + sky: hot = high warm sun, cold = low cool light
    const sa = 0.35 + 0.75 * T;
    sunL.position.set(-14 + 10 * (1 - T), 6 + 22 * Math.sin(sa), 14); sunL.target.position.set(-6, 3, 0);
    sunL.color.setRGB(1, 0.86 + 0.1 * T, 0.7 + 0.18 * T); sunL.intensity = 1.6 + 1.2 * T;
    sky.material.color.setRGB(0.82 + 0.18 * T, 0.88 + 0.1 * T, 1.0 - 0.06 * T); hemi.intensity = 0.55 + 0.25 * T;
    gradeP.uniforms.warm.value = T;
    col.scale.y = Math.max(0.02, 0.15 + 1.35 * T); bulb.material.emissiveIntensity = 0.4 + 0.6 * T;
    // crane lowers plate B in the hook, cables lift away by s2
    const seat = ramp(t, -0.5, A("s1:sengaja") + 0.2), lift = ramp(t, A("s1:sengaja") + 0.4, K.s2 + 0.8);
    PB.position.y = 1.6 * (1 - back(seat, 0.6));
    jibPiv.rotation.y = 0.35 * Math.sin(t * 0.05) - 0.25 * lift;
    trolley.position.set(-6.5 + 2.0 * lift, -0.45, 0);
    const tw = new THREE.Vector3(); trolley.getWorldPosition(tw);
    const hy = seat < 1 ? 4.0 + PB.position.y + 0.9 : 4.0 + 0.9 + 9 * lift;
    hookB.position.set(tw.x, hy, tw.z * (1 - 0) ); hookB.visible = t < K.s3;
    { const p = cables.geometry.attributes.position.array; const hx = hookB.position.x, hz = hookB.position.z; const sl = 1 - lift;
      p.set([tw.x, tw.y, tw.z, hx, hy + 0.2, hz, hx, hy - 0.2, hz, 0.28, 4.0 + PB.position.y + 0.08 * sl + (1 - sl) * 2, -1.3, hx, hy - 0.2, hz, 0.28, 4.0 + PB.position.y + 0.08 * sl + (1 - sl) * 2, 1.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      cables.geometry.attributes.position.needsUpdate = true; cables.visible = t < K.s3; cables.geometry.setDrawRange(0, sl > 0.02 ? 6 : 2); }
    // yard (s4)
    const yd = win(t, K.s4, A("s4:panjang"), 0.4); YD.visible = yd > 0.01 || (t > K.s1 && t < K.s4) || t > K.s8; YD.scale.setScalar(1);
    needle.rotation.z = -1.4 * ramp(t, A("s4:derajat") - 0.2, A("s4:derajat") + 0.4) * (t < K.s5 ? 1 : 0);
    yLab.visible = t > K.s4 && t < K.s5; yLab.material.opacity = ramp(t, A("s4:sejuta") - 0.3, A("s4:sejuta") + 0.3); yLab.lookAt(cam.position.x, yLab.getWorldPosition(new THREE.Vector3()).y, cam.position.z);
    // tape + labels (s7)
    const s7 = t >= K.s7 && t < K.s8;
    tape.visible = tLab.visible = cLab.visible = s7;
    tLab.material.opacity = ramp(t, A("s7:enam") - 0.3, A("s7:enam") + 0.3); tLab.lookAt(cam.position);
    cLab.material.opacity = ramp(t, A("s7:setengah") - 0.3, A("s7:setengah") + 0.3); cLab.scale.setScalar(0.8 + 0.2 * back(cLab.material.opacity)); cLab.lookAt(cam.position);
    // car
    let tc = CROSS[0]; for (const x of CROSS) if (Math.abs(t - x) < Math.abs(t - tc)) tc = x;
    const cx = (t - tc) * SPEED; CAR.visible = Math.abs(cx) < 26 && lk < 0.01;
    const bump = (x) => 0.05 * Math.exp(-((x) * (x)) * 30);
    CAR.position.set(cx, 4.02 + Math.max(bump(cx - 0.68), bump(cx + 0.68)) * 0.6, 0.72);
    CAR.rotation.z = (bump(cx + 0.68) - bump(cx - 0.68)) * 1.2;
    comp.render();
  };
}
