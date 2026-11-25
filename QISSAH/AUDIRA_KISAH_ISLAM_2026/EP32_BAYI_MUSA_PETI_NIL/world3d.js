// EP32 BAYI MUSA DI PETI. MARBLEMUSEUM: a carved limestone diorama of the Nile on a marble plinth in a dark museum
// gallery, raked by a low golden side light. One connected world (camera mostly looks "downstream", -z):
//   mother's house (left bank, z 12)  ->  village + midwives' stele (left bank, z 9..-9)  ->  Firaun's terrace with pylons
//   (left bank, z -14..-26). The river (x -3.6..3.6) is turquoise water carved as an Egyptian zigzag relief that slowly
//   flows downstream. Right bank: reeds and a papyrus colonnade. Relief walls (carved registers) stand behind both banks,
//   the museum back wall carries a large carved sun disc. A brass museum label "AUDIRA" stands in front of the plinth.
// Depiction: Nabi Musa is never shown, not even as a baby. Only the closed chest is seen. Musa's mother, his sister,
// Firaun's wife, Firaun, servants, midwives and nurses are faceless extruded relief silhouettes (no features).
// The killing is shown only as a list carved on a stele and village windows going dark one by one.
// Every value is a pure function of t (seek-safe, no Math.random).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const mix = (a, b, u) => a + (b - a) * u;
const pulse = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x15110d, fog: 0.006, exp: 1.22, bloom: [0.22, 0.4, 0.93], shadow: true });
  // NaN / Inf guard before bloom: a single bad pixel would be smeared across the frame
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;float f(float x){return (x<40.0&&x>=0.0)?x:(x>=40.0?40.0:0.0);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(f(c.r),f(c.g),f(c.b),1.0);}" }), 1);
  cam.near = 0.05; cam.far = 600; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(3232);
  const tv = new THREE.Vector3();
  envStrips(r, scene, [[40, 6, 0xffd9a0, 0.9, -30, 18, 10], [30, 8, 0xffc890, 0.5, 0, 12, -40], [24, 18, 0x7fa6c8, 0.22, 30, 12, 10], [50, 6, 0xfff0d8, 0.3, 0, 30, 30]], 0x0c0a08);

  // ---------- timing
  const tLep1 = A("s1:melepasnya"), tSel = A("s1:diselamatkan");
  const tFir = A("s2:Firaun"), tDib = A("s2:dibunuh"), tPara = A("s2:Para"), tMend = A("s2:mendata"), tHamil = A("s2:hamil"), tTapi = A("s2:Tapi"), tLahir = A("s2:lahir");
  const tHany = A("s3:hanyutkanlah"), tKemb = A("s3:mengembalikannya");
  const tLetak = A("s4:meletakkan"), tLep4 = A("s4:melepasnya"), tTepi = A("s4:tepi"), tPung = A("s4:dipungut"), tRumah = A("s4:rumah");
  const tPeny = A("s5:penyejuk"), tJang = A("s5:jangan"), tSem = A("s5:Sementara"), tKos = A("s5:kosong"), tHamp = A("s5:hampir"), tTeg = A("s5:meneguhkan");
  const tIkut = A("s6:ikutilah"), tKak = A("s6:Kakak"), tTol = A("s6:menolak");
  const tKk7 = A("s7:Kakaknya"), tMaka = A("s7:Maka"), tSen = A("s7:senang"), tJan = A("s7:janji");
  const tKis = A("s8:Kisah");

  // ---------- materials
  const limeTex = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#d8ccb4"; x.fillRect(0, 0, w, h);
    const rr = mulberry(7);
    for (let i = 0; i < 3000; i++) { const v = rr(); x.fillStyle = `rgba(${v > .5 ? "255,250,235" : "90,70,45"},${0.03 + rr() * 0.06})`; x.fillRect(rr() * w, rr() * h, 1 + rr() * 4, 1 + rr() * 3); }
    for (let i = 0; i < 14; i++) { x.strokeStyle = `rgba(90,70,45,${0.05 + rr() * 0.07})`; x.lineWidth = 1; x.beginPath(); let px = rr() * w, py = rr() * h; x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (rr() - .5) * 70; py += (rr() - .5) * 40; x.lineTo(px, py); } x.stroke(); }
  }, [3, 3]);
  const marbleTex = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, w, h);
    const rr = mulberry(19);
    for (let i = 0; i < 9; i++) { const g = x.createRadialGradient(rr() * w, rr() * h, 10, rr() * w, rr() * h, 260); g.addColorStop(0, "rgba(225,215,200,.35)"); g.addColorStop(1, "rgba(225,215,200,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); }
    for (let i = 0; i < 34; i++) {
      const big = i < 8; x.strokeStyle = big ? `rgba(110,100,92,${0.35 + rr() * 0.25})` : `rgba(150,135,120,${0.12 + rr() * 0.2})`; x.lineWidth = big ? 1.5 + rr() * 2.5 : 0.5 + rr();
      x.beginPath(); let px = rr() * w, py = rr() * h; x.moveTo(px, py); const ang = -0.6 + rr() * 0.4;
      for (let k = 0; k < 26; k++) { px += Math.cos(ang) * 22 + (rr() - .5) * 26; py -= Math.sin(ang) * 22 + (rr() - .5) * 18; x.lineTo(px, py); } x.stroke();
    }
    x.strokeStyle = "rgba(201,160,74,.35)"; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); let px = rr() * w, py = rr() * h; x.moveTo(px, py); for (let k = 0; k < 18; k++) { px += 24 + (rr() - .5) * 20; py += (rr() - .5) * 30; x.lineTo(px, py); } x.stroke(); }
  }, [5, 1]);
  // carved relief textures: cream stone with darker incised grooves; the same canvas is the bump map (dark = cut in)
  const groove = "rgba(92,72,46,.85)";
  function glyphRow(x, y0, w, sz, rr) {
    x.strokeStyle = groove; x.fillStyle = groove; x.lineWidth = Math.max(2, sz * 0.09);
    for (let cx = sz * 0.6; cx < w; cx += sz * 1.15) {
      const k = Math.floor(rr() * 7), cy = y0 + sz * 0.5;
      x.beginPath();
      if (k === 0) { x.arc(cx, cy, sz * 0.3, 0, 7); x.stroke(); x.beginPath(); x.arc(cx, cy, sz * 0.07, 0, 7); x.fill(); }
      else if (k === 1) { x.moveTo(cx, cy + sz * 0.45); x.quadraticCurveTo(cx + sz * 0.35, cy, cx, cy - sz * 0.45); x.stroke(); }
      else if (k === 2) { for (let i = 0; i < 5; i++) x.lineTo(cx - sz * 0.4 + i * sz * 0.2, cy + (i % 2 ? -1 : 1) * sz * 0.12); x.stroke(); }
      else if (k === 3) { x.ellipse(cx, cy, sz * 0.18, sz * 0.42, 0, 0, 7); x.stroke(); x.beginPath(); x.moveTo(cx - sz * 0.25, cy + sz * 0.45); x.lineTo(cx + sz * 0.25, cy + sz * 0.45); x.stroke(); }
      else if (k === 4) { x.moveTo(cx - sz * 0.35, cy + sz * 0.1); x.quadraticCurveTo(cx, cy - sz * 0.4, cx + sz * 0.35, cy + sz * 0.1); x.lineTo(cx + sz * 0.1, cy + sz * 0.1); x.lineTo(cx, cy + sz * 0.42); x.stroke(); }
      else if (k === 5) { x.moveTo(cx, cy - sz * 0.45); x.lineTo(cx, cy + sz * 0.45); x.moveTo(cx - sz * 0.25, cy - sz * 0.05); x.lineTo(cx + sz * 0.25, cy - sz * 0.05); x.stroke(); x.beginPath(); x.ellipse(cx, cy - sz * 0.3, sz * 0.12, sz * 0.15, 0, 0, 7); x.stroke(); }
      else { x.rect(cx - sz * 0.3, cy - sz * 0.3, sz * 0.6, sz * 0.6); x.stroke(); }
    }
  }
  function lotusRow(x, y0, w, sz) {
    x.strokeStyle = groove; x.lineWidth = Math.max(2, sz * 0.07);
    for (let cx = sz * 0.5, i = 0; cx < w; cx += sz * 0.9, i++) {
      const base = y0 + sz;
      x.beginPath(); x.moveTo(cx, base); x.lineTo(cx, base - sz * 0.35); x.stroke();
      x.beginPath();
      if (i % 2 === 0) { for (const a of [-0.32, 0, 0.32]) { x.moveTo(cx, base - sz * 0.35); x.quadraticCurveTo(cx + a * sz * 1.4 - sz * 0.12, base - sz * 0.7, cx + a * sz * 0.9, base - sz * 0.98); x.quadraticCurveTo(cx + a * sz * 1.4 + sz * 0.12, base - sz * 0.7, cx, base - sz * 0.35); } }
      else { x.moveTo(cx, base - sz * 0.35); x.quadraticCurveTo(cx - sz * 0.18, base - sz * 0.6, cx, base - sz * 0.8); x.quadraticCurveTo(cx + sz * 0.18, base - sz * 0.6, cx, base - sz * 0.35); }
      x.stroke();
    }
  }
  function zigRow(x, y0, w, a, rows = 3) {
    x.strokeStyle = groove; x.lineWidth = 4;
    for (let r2 = 0; r2 < rows; r2++) { x.beginPath(); for (let i = 0; i <= w / 18; i++) { const px = i * 18, py = y0 + r2 * a * 2.6 + (i % 2 ? a : -a); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  }
  const band = (x, w, y) => { x.fillStyle = groove; x.fillRect(0, y, w, 4); x.fillRect(0, y + 10, w, 4); };
  const friezeTex = canvasTex(2048, 512, (x, w, h) => {
    x.fillStyle = "#efe5cf"; x.fillRect(0, 0, w, h);
    const rr = mulberry(77);
    for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(${rr() > .5 ? "255,252,240" : "120,95,60"},${0.04 + rr() * 0.05})`; x.fillRect(rr() * w, rr() * h, 2, 2); }
    band(x, w, 8); glyphRow(x, 34, w, 72, rr); band(x, w, 118);
    lotusRow(x, 150, w, 150); band(x, w, 312);
    glyphRow(x, 336, w, 56, rr); band(x, w, 404); zigRow(x, 440, w, 9); band(x, w, 494);
  }, [7, 1]);
  const blockTex = canvasTex(1024, 1024, (x, w, h) => {
    x.fillStyle = "#efe6d2"; x.fillRect(0, 0, w, h);
    const rr = mulberry(41);
    for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(${rr() > .5 ? "255,252,240" : "120,95,60"},${0.03 + rr() * 0.05})`; x.fillRect(rr() * w, rr() * h, 2, 2); }
    x.fillStyle = "rgba(110,88,58,.75)";
    for (let row = 0; row < 8; row++) { x.fillRect(0, row * 128, w, 3); for (let c = 0; c < 4; c++) x.fillRect(((c + (row % 2) * 0.5) * 256) % w, row * 128, 3, 128); }
    glyphRow(x, 900, w, 90, rr);
  }, [1, 1]);
  const paveTex = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#f0e8d6"; x.fillRect(0, 0, w, h); const rr = mulberry(31);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${rr() > .5 ? "255,252,240" : "120,95,60"},${0.03 + rr() * 0.05})`; x.fillRect(rr() * w, rr() * h, 2, 2); }
    x.fillStyle = "rgba(120,96,64,.5)"; for (let k = 0; k < 4; k++) { x.fillRect(0, k * 128, w, 2); x.fillRect(k * 128 + (k % 2) * 64, 0, 2, h); }
  }, [10, 36]);
  const limeM = new THREE.MeshStandardMaterial({ color: 0xf2eadb, roughness: 0.78, metalness: 0, map: limeTex, bumpMap: limeTex, bumpScale: 0.6 });
  const carvedM = (rep, bs = 3) => { const m = friezeTex.clone(); m.needsUpdate = true; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(rep[0], rep[1]); return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, map: m, bumpMap: m, bumpScale: bs }); };
  const blockM = (rx, ry) => { const m = blockTex.clone(); m.needsUpdate = true; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ color: 0xfff6e6, roughness: 0.82, map: m, bumpMap: m, bumpScale: 1.6 }); };
  const bankM = new THREE.MeshStandardMaterial({ color: 0xe9dcc2, roughness: 0.86, metalness: 0, map: paveTex, bumpMap: paveTex, bumpScale: 1.2 }), bankOld = ({ map: canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#d8ccb4"; x.fillRect(0, 0, w, h); const rr = mulberry(31);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${rr() > .5 ? "255,250,235" : "90,70,45"},${0.03 + rr() * 0.05})`; x.fillRect(rr() * w, rr() * h, 2, 2); }
  }, [8, 30]) });
  const houseM = blockM(1, 1);
  const darkM = new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 0.95 });
  const marbleM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.15, map: marbleTex });
  const goldM = new THREE.MeshStandardMaterial({ color: 0xdcb05a, roughness: 0.24, metalness: 1 });
  const lapisM = new THREE.MeshStandardMaterial({ color: 0x2b4c7e, roughness: 0.55, metalness: 0.1 });
  const reedM = new THREE.MeshStandardMaterial({ color: 0x8c9a66, roughness: 0.8 });
  const reedHM = new THREE.MeshStandardMaterial({ color: 0xa8b276, roughness: 0.75 });
  const woodM = new THREE.MeshStandardMaterial({ color: 0x9a6a38, roughness: 0.5, metalness: 0.05 });
  const floorM = new THREE.MeshStandardMaterial({ color: 0x1b1612, roughness: 0.28, metalness: 0.3 });
  const wallM = new THREE.MeshStandardMaterial({ color: 0x2c241c, roughness: 0.9 });

  const add = (geo, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ---------- lights: low golden raking key from the left, cool fill from the right, museum spot that follows the story
  const hemi = new THREE.HemisphereLight(0xfff0d6, 0x3a2c1e, 0.8); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd08a, 2.9); key.position.set(16, 24, 36); key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { near: 1, far: 140, left: -42, right: 42, top: 42, bottom: -42 }); key.shadow.camera.updateProjectionMatrix();
  key.target.position.set(0, 0, -4); scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(0xc8d8e8, 0.45); fill.position.set(-30, 12, 20); scene.add(fill);
  const rimL = new THREE.DirectionalLight(0xffc068, 1.6); rimL.position.set(-8, 12, -46); scene.add(rimL);
  const spot = new THREE.SpotLight(0xfff0d0, 0, 60, 0.42, 0.75, 1.2); scene.add(spot); scene.add(spot.target);
  const firL = new THREE.SpotLight(0xff8a4a, 0, 30, 0.35, 0.6, 1.2); firL.position.set(-8.5, 7.5, -16.5); firL.target.position.set(-13, 1.6, -20); scene.add(firL); scene.add(firL.target);
  const wifeL = new THREE.PointLight(0xffc878, 0, 9, 1.2); wifeL.position.set(-7.6, 3.4, -18.2); scene.add(wifeL);
  const lampL = new THREE.PointLight(0xffa850, 0, 7, 1.5); scene.add(lampL);
  const sunL = new THREE.SpotLight(0xffc070, 30, 60, 0.5, 0.8, 1.0); sunL.position.set(0, 16, -30); sunL.target.position.set(0, 10, -49); scene.add(sunL); scene.add(sunL.target);

  // ---------- museum: floor, back wall with carved sun disc
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), floorM); floor.rotation.x = -Math.PI / 2; floor.position.y = -3; floor.receiveShadow = true; scene.add(floor);
  add(B(140, 50, 1), wallM, 0, 20, -50.5);
  const disc = add(new THREE.CylinderGeometry(5, 5, 0.5, 64), limeM, 0, 10, -49.8); disc.rotation.x = Math.PI / 2;
  const discRing = add(new THREE.TorusGeometry(5.3, 0.18, 10, 80), goldM, 0, 10, -49.7);
  for (let i = 0; i < 17; i++) { const a = Math.PI * (0.06 + 0.88 * i / 16) + Math.PI; const ray = add(B(0.18, 4.5, 0.2), limeM, Math.cos(a) * 8, 10 + Math.sin(a) * 8, -49.85); ray.rotation.z = a - Math.PI / 2; }
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) add(B(6 - k * 0.6, 0.35, 0.3), limeM, s * (9 + k * 0.4), 11.5 - k * 0.55, -49.85);

  // ---------- plinth with carved river channel
  const PZ0 = -43, PZ1 = 31, PL = PZ1 - PZ0, PC = (PZ0 + PZ1) / 2;
  add(B(46, 2.1, PL), marbleM, 0, -1.95, PC);
  { const fm = carvedM([3, 1], 3); add(B(46.12, 0.85, 0.06), fm, 0, -1.55, PZ1 + 0.03); const fs = carvedM([12, 1], 3); for (const sx of [-1, 1]) { const b = add(new THREE.PlaneGeometry(PL, 0.85), fs, sx * 23.04, -1.55, PC); b.rotation.y = sx * Math.PI / 2; } add(B(46.2, 0.08, 0.1), goldM, 0, -1.08, PZ1 + 0.05); add(B(46.2, 0.08, 0.1), goldM, 0, -2.02, PZ1 + 0.05); }
  add(B(19.4, 0.9, PL), bankM, -13.3, -0.45, PC);
  add(B(19.4, 0.9, PL), bankM, 13.3, -0.45, PC);
  add(B(46.6, 0.18, PL + 0.6), goldM, 0, -0.98, PC).receiveShadow = true;
  for (const s of [-1, 1]) add(B(0.3, 0.12, PL), limeM, s * 3.75, -0.06, PC); // carved bank lip
  add(B(1.0, 0.03, 25), new THREE.MeshStandardMaterial({ color: 0xeee4cf, roughness: 0.9, map: limeTex }), -5.0, 0.015, -0.2); // bank path

  // ---------- water: zigzag relief, flows downstream (-z)
  const WY = -0.3;
  const wGeo = new THREE.PlaneGeometry(7.2, PL, 44, 600); wGeo.rotateX(-Math.PI / 2);
  const wPos = wGeo.attributes.position, WB = new Float32Array(wPos.count * 2);
  for (let i = 0; i < wPos.count; i++) { WB[i * 2] = wPos.getX(i); WB[i * 2 + 1] = wPos.getZ(i) + PC; }
  const water = new THREE.Mesh(wGeo, new THREE.MeshStandardMaterial({ color: 0x3e8c8c, roughness: 0.42, metalness: 0.04, emissive: 0x0b2a2a, emissiveIntensity: 1 }));
  water.position.set(0, WY, PC); water.receiveShadow = true; scene.add(water);
  const wh = (x, z, t) => {
    const u = (z + 0.42 * t) * 1.45 + 0.3 * Math.sin(x * 1.6 + z * 0.15);
    const zz = Math.abs(u - Math.floor(u) - 0.5) * 2;
    const edge = sm((3.6 - Math.abs(x)) / 0.5);
    return (0.05 * zz * zz + 0.012 * Math.sin(x * 3.1 - t * 0.8 + z * 0.4)) * edge;
  };

  // ---------- relief walls (carved registers: winged band, papyrus, birds, zigzag water)
  const relTex = canvasTex(2048, 512, (x, w, h) => {
    x.fillStyle = "#cfc2a6"; x.fillRect(0, 0, w, h);
    const rr = mulberry(77);
    x.fillStyle = "rgba(70,55,38,.55)";
    for (const y of [70, 76, 300, 306, 440, 446]) x.fillRect(0, y, w, 3);
    for (let i = 0; i < 40; i++) { const cx = i * 52 + 20; x.beginPath(); x.moveTo(cx, 40); x.lineTo(cx + 14, 62); x.lineTo(cx - 14, 62); x.closePath(); x.fill(); }
    x.strokeStyle = "rgba(70,55,38,.6)"; x.lineWidth = 4;
    for (let i = 0; i < 70; i++) { const cx = i * 30 + rr() * 10, top = 120 + rr() * 60; x.beginPath(); x.moveTo(cx, 296); x.quadraticCurveTo(cx + 6, 200, cx + (rr() - .5) * 20, top); x.stroke(); x.beginPath(); x.moveTo(cx - 14, top + 14); x.lineTo(cx + (rr() - .5) * 20, top); x.lineTo(cx + 14, top + 14); x.stroke(); }
    x.fillStyle = "rgba(70,55,38,.6)";
    for (let i = 0; i < 9; i++) { const bx = 120 + i * 220 + rr() * 60, by = 110 + rr() * 60; x.beginPath(); x.moveTo(bx - 30, by); x.quadraticCurveTo(bx, by - 22, bx + 30, by); x.quadraticCurveTo(bx, by - 8, bx - 30, by); x.fill(); }
    x.lineWidth = 5;
    for (let row = 0; row < 3; row++) { x.beginPath(); for (let i = 0; i <= 120; i++) { const px = i * 18, py = 330 + row * 34 + (i % 2 ? 12 : -12); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  }, [5, 1]);
  const relM = carvedM([7, 1], 4);
  const wallL = add(new THREE.PlaneGeometry(PL, 7), relM, -21.5, 3.5, PC); wallL.rotation.y = Math.PI / 2; wallL.castShadow = false;
  const wallR = add(new THREE.PlaneGeometry(PL, 7), relM, 12.5, 3.5, PC); wallR.rotation.y = -Math.PI / 2;
  for (const x of [-21.6, 12.6]) { add(B(0.6, 0.4, PL), limeM, x, 7.1, PC).castShadow = false; add(B(0.6, 0.4, PL), limeM, x, 0.2, PC); }

  // ---------- houses (village + mother's house). Windows face the river (+x) and dim one by one.
  const winM = [];
  function house(x, z, w, h, d, mother = false) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    add(B(w, h, d), houseM, 0, h / 2, 0, G);
    add(B(w + 0.14, 0.14, d + 0.14), limeM, 0, h + 0.07, 0, G);
    add(B(0.08, 0.95, 0.55), darkM, w / 2 + 0.01, 0.48, d * 0.22, G);
    add(B(0.06, 1.05, 0.7), lapisM, w / 2 + 0.005, 0.52, d * 0.22, G).scale.set(1, 1, 1);
    const wm = new THREE.MeshStandardMaterial({ color: 0x1a120a, emissive: 0xffb860, emissiveIntensity: 1.2, roughness: 0.6 });
    add(new THREE.PlaneGeometry(0.42, 0.34), wm, w / 2 + 0.03, h * 0.66, -d * 0.2, G).rotation.y = Math.PI / 2;
    if (!mother) winM.push(wm);
    return { G, wm };
  }
  const MH = house(-8.4, 12.6, 3.0, 2.3, 3.2, true);
  const VILL = [[-9.6, 7.2, 2.4, 1.9, 2.6], [-12.6, 9.6, 2.2, 2.4, 2.4], [-10.2, 3.4, 2.6, 2.1, 2.8], [-13.4, 4.8, 2.0, 1.7, 2.2], [-9.2, -0.6, 2.2, 2.0, 2.4],
    [-12.4, -2.0, 2.6, 2.6, 2.6], [-9.8, -4.8, 2.4, 1.8, 2.6], [-13.0, -7.4, 2.2, 2.2, 2.4], [-9.4, -9.0, 2.0, 1.9, 2.2], [-16.2, 1.0, 2.4, 2.0, 2.6], [-16.0, 7.6, 2.2, 2.2, 2.4]];
  for (const v of VILL) house(...v);

  // ---------- palms (carved stone)
  function palm(x, z, h) {
    for (let i = 0; i < 7; i++) add(new THREE.CylinderGeometry(0.13, 0.16, h / 7 + 0.02, 7), limeM, x + Math.sin(i * 0.5) * 0.04 * i, h * (i + 0.5) / 7, z);
    for (let k = 0; k < 8; k++) { const f = add(new THREE.ConeGeometry(0.22, 1.7, 4), reedM, x, h, z); f.scale.set(1, 1, 0.25); f.rotation.set(0, (k / 8) * Math.PI * 2, 1.9); f.translateY(0.75); }
  }
  palm(-11.0, 13.9, 3.4); palm(-7.2, -11.8, 3.0); palm(-15.2, -4.0, 3.6); palm(5.8, 11.0, 3.2); palm(5.5, -6.2, 3.4); palm(-14.6, 12.0, 2.8);

  // ---------- papyrus colonnade on the right bank
  const capGeo = new THREE.LatheGeometry([[0.2, 0], [0.26, 0.15], [0.45, 0.5], [0.55, 0.62], [0.5, 0.68]].map((p) => new THREE.Vector2(p[0], p[1])), 16);
  for (let z = 27; z > -42; z -= 8.6) {
    add(new THREE.CylinderGeometry(0.62, 0.66, 0.2, 18), limeM, 7.2, 0.1, z);
    add(new THREE.CylinderGeometry(0.3, 0.4, 3.6, 12), limeM, 7.2, 1.95, z);
    for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(0.31, 0.04, 6, 18), goldM, 7.2, 3.55 + k * 0.08, z).rotation.x = Math.PI / 2;
    add(capGeo, limeM, 7.2, 3.75, z);
    add(B(1.2, 0.18, 1.2), limeM, 7.2, 4.5, z);
  }
  add(B(0.9, 0.5, 70), limeM, 7.2, 4.85, -7.5);

  // ---------- reeds (instanced, sway)
  const RS = [];
  const blocked = (x, z) => x < 0 && ((z > 9.6 && z < 15) || (z > -22.5 && z < -12) || (z > -6 && z < 9.7) || (z > -11.4 && z < -6.5));
  for (let i = 0; i < 900; i++) {
    const side = rnd() < 0.52 ? -1 : 1;
    const x = side * (3.75 + rnd() * (side < 0 ? 0.7 : 1.6));
    const z = PZ0 + 1 + rnd() * (PL - 2);
    if (blocked(x, z)) continue;
    RS.push([x, z, 0.7 + rnd() * 0.9, rnd() * 6.28, (rnd() - 0.5) * 0.25]);
  }
  for (let i = 0; i < 70; i++) RS.push([-3.75 - rnd() * 0.45, -11.6 - rnd() * 0.8, 1.1 + rnd() * 0.6, rnd() * 6.28, (rnd() - 0.5) * 0.2]); // sister's hiding place
  const NR = RS.length;
  const stemG = new THREE.CylinderGeometry(0.012, 0.02, 1, 4); stemG.translate(0, 0.5, 0);
  const headG = new THREE.ConeGeometry(0.1, 0.18, 7); headG.rotateX(Math.PI); headG.translate(0, 0.07, 0);
  const stems = new THREE.InstancedMesh(stemG, reedM, NR), heads = new THREE.InstancedMesh(headG, reedHM, NR);
  stems.frustumCulled = heads.frustumCulled = false; stems.castShadow = heads.castShadow = true; scene.add(stems); scene.add(heads);
  const dm = new THREE.Object3D();

  // ---------- midwives' stele with the carved list
  const STELE = new THREE.Group(); STELE.position.set(-5.7, 0, 1.0); STELE.rotation.y = 2.35; scene.add(STELE);
  add(B(1.3, 1.8, 0.24), limeM, 0, 0.9, 0, STELE);
  const stTop = add(new THREE.CylinderGeometry(0.65, 0.65, 0.24, 24, 1, false, 0, Math.PI), limeM, 0, 1.8, 0, STELE); stTop.rotation.set(Math.PI / 2, 0, -Math.PI / 2); stTop.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  add(B(1.5, 0.16, 0.4), limeM, 0, 0.08, 0, STELE);
  add(new THREE.TorusGeometry(0.16, 0.035, 6, 24), goldM, 0, 1.92, 0.13, STELE);
  const MARKS = [];
  for (let row = 0; row < 7; row++) for (let c = 0; c < 6; c++) {
    const m = add(B(0.13, 0.035, 0.03), darkM, -0.45 + c * 0.18, 1.55 - row * 0.19, 0.12, STELE); m.castShadow = false; MARKS.push(m);
  }

  // ---------- palace terrace, steps, pylons, columns, throne
  add(B(12, 1.0, 12), carvedM([4, 0.5], 3), -11.2, 0.5, -20);
  add(B(12.2, 0.1, 12.2), goldM, -11.2, 0.96, -20); { const tp = paveTex.clone(); tp.needsUpdate = true; tp.wrapS = tp.wrapT = THREE.RepeatWrapping; tp.repeat.set(4, 4); add(B(11.9, 0.04, 11.9), new THREE.MeshStandardMaterial({ color: 0xeee2c8, roughness: 0.6, map: tp, bumpMap: tp, bumpScale: 1.2 }), -11.2, 1.02, -20); }
  for (let i = 0; i < 5; i++) add(B(0.34, 0.9 + (i + 1) * 0.26, 2.6), limeM, -3.77 - 0.32 * i, -0.9 + (0.9 + (i + 1) * 0.26) / 2, -19.5);
  for (let j = 0; j < 4; j++) add(B(1.8, 0.25 * (j + 1), 0.42), limeM, -5.5, 0.125 * (j + 1), -12.62 - 0.4 * j);
  function taper(w, h, d, k) { const g = B(w, h, d); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } g.computeVertexNormals(); return g; }
  for (const z of [-16.4, -23.6]) { add(taper(2.4, 5.2, 3.4, 0.82), blockM(1, 2), -18.2, 3.6, z); add(B(2.2, 0.3, 3.2), limeM, -18.2, 6.3, z); }
  add(B(1.4, 3.4, 0.5), limeM, -18.0, 2.7, -18.2); add(B(1.4, 3.4, 0.5), limeM, -18.0, 2.7, -21.8); add(B(1.6, 0.6, 4.4), limeM, -18.0, 4.6, -20);
  const sd = add(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 24), goldM, -17.15, 4.6, -20); sd.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const wg = add(B(0.08, 0.22, 1.5), goldM, -17.16, 4.62, -20 + s * 1.0); wg.rotation.x = s * 0.12; }
  add(B(0.12, 3.2, 3.4), darkM, -18.6, 2.6, -20);
  const pcol = (x, z) => { add(new THREE.CylinderGeometry(0.26, 0.32, 3.2, 12), limeM, x, 2.6, z); add(capGeo, limeM, x, 4.2, z).scale.setScalar(0.8); add(B(0.9, 0.14, 0.9), limeM, x, 4.82, z); };
  pcol(-6.0, -25.4); pcol(-15.4, -14.6); pcol(-15.4, -25.4);
  add(B(0.8, 0.5, 1.0), lapisM, -13.35, 1.25, -20); add(B(0.16, 1.4, 1.0), lapisM, -13.75, 1.7, -20); add(B(0.9, 0.08, 1.1), goldM, -13.2, 1.52, -20);

  // ---------- museum label with AUDIRA (in-world brand, never on anything sacred)
  const labTex = canvasTex(1024, 300, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3a2c1c"); g.addColorStop(1, "#22190f"); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = "#c9a04a"; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28);
    x.fillStyle = "#e7c47a"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = "700 120px Georgia, 'Times New Roman', serif"; x.fillText("A U D I R A", w / 2, 128);
    x.font = "600 36px Georgia, 'Times New Roman', serif"; x.fillStyle = "#d9c8a4"; x.fillText("RELIEF SUNGAI NIL  ·  KISAH DALAM AL-QUR'AN", w / 2, 226);
  });
  const LAB = new THREE.Group(); LAB.position.set(-1.4, -3, 34.5); scene.add(LAB);
  add(new THREE.CylinderGeometry(0.08, 0.14, 2.3, 10), goldM, 0, 1.15, 0, LAB);
  add(new THREE.CylinderGeometry(0.5, 0.55, 0.08, 20), goldM, 0, 0.04, 0, LAB);
  const plate = add(B(3.4, 1.0, 0.08), new THREE.MeshStandardMaterial({ map: labTex, roughness: 0.4, metalness: 0.4 }), 0, 2.45, 0, LAB);
  plate.rotation.x = -0.55;
  const labL = new THREE.PointLight(0xffd8a0, 0, 5, 1.5); labL.position.set(-1.4, 0.4, 36.2); scene.add(labL);

  // ---------- the chest (always closed)
  const CH = new THREE.Group(); scene.add(CH);
  const chestTex = canvasTex(512, 256, (x, w, h) => {
    x.fillStyle = "#b5773a"; x.fillRect(0, 0, w, h);
    const rr = mulberry(55);
    for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(${rr() > .5 ? "70,40,15" : "230,170,100"},${0.15 + rr() * 0.2})`; x.lineWidth = 1 + rr() * 2; x.beginPath(); const y = rr() * h; x.moveTo(0, y); x.bezierCurveTo(w * .3, y + (rr() - .5) * 20, w * .6, y + (rr() - .5) * 20, w, y + (rr() - .5) * 10); x.stroke(); }
    x.strokeStyle = "rgba(60,32,10,.9)"; x.lineWidth = 6; x.strokeRect(18, 18, w - 36, h - 36); x.lineWidth = 3; x.strokeRect(34, 34, w - 68, h - 68);
    x.fillStyle = "rgba(60,32,10,.85)"; for (let i = 0; i < 9; i++) { const cx = 70 + i * 47; x.beginPath(); x.moveTo(cx, 200); x.quadraticCurveTo(cx - 16, 150, cx, 120); x.quadraticCurveTo(cx + 16, 150, cx, 200); x.fill(); }
  });
  const chestM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: chestTex, bumpMap: chestTex, bumpScale: 2, roughness: 0.45, metalness: 0.1 });
  const gildM = new THREE.MeshStandardMaterial({ color: 0xe0b45a, roughness: 0.22, metalness: 1, bumpMap: chestTex, bumpScale: 1.2 });
  const lapisInM = new THREE.MeshStandardMaterial({ color: 0x2f5ea8, roughness: 0.25, metalness: 0.2, emissive: 0x0a1630 });
  add(B(0.7, 0.32, 0.42), chestM, 0, 0.18, 0, CH);
  add(B(0.714, 0.075, 0.434), lapisInM, 0, 0.2, 0, CH);
  for (const y of [0.158, 0.242]) add(B(0.72, 0.014, 0.44), goldM, 0, y, 0, CH);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { add(B(0.05, 0.36, 0.05), goldM, sx * 0.345, 0.18, sz * 0.205, CH); add(B(0.07, 0.04, 0.07), goldM, sx * 0.345, 0.0, sz * 0.205, CH); }
  add(B(0.78, 0.045, 0.5), goldM, 0, 0.36, 0, CH);
  const roof = new THREE.Shape(); roof.moveTo(-0.25, 0); roof.lineTo(0.25, 0); roof.lineTo(0.0, 0.15); roof.closePath();
  const rg = new THREE.ExtrudeGeometry(roof, { depth: 0.74, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }); rg.translate(0, 0, -0.37); rg.rotateY(Math.PI / 2);
  add(rg, gildM, 0, 0.38, 0, CH);
  add(B(0.8, 0.02, 0.03), lapisInM, 0, 0.46, 0, CH).position.y = 0.52;
  const chestRec = add(B(0.82, 0.02, 0.54), darkM, -4.05, 0.012, 11.75); chestRec.castShadow = false; // pressed ground where the chest stood

  // ---------- faceless relief silhouettes (extruded profiles; head is a plain oval, no features)
  const SH = (p) => { const s = new THREE.Shape(); s.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) s.lineTo(p[i][0], p[i][1]); s.closePath(); return s; };
  const OV = (cx, cy, rx, ry) => { const s = new THREE.Shape(); s.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, 0); return s; };
  const EX = (shapes, d = 0.08) => { const g = new THREE.ExtrudeGeometry(shapes, { depth: d, bevelEnabled: true, bevelThickness: 0.026, bevelSize: 0.014, bevelSegments: 4, curveSegments: 16 }); g.translate(0, 0, -d / 2); return g; };
  function figure(kind, color, scale) {
    const G = new THREE.Group(); scene.add(G);
    // painted limestone with a soft gold sheen on the rounded edges (reads as a rim light)
    const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.62, metalness: 0, map: limeTex, bumpMap: limeTex, bumpScale: 0.5, sheen: 1, sheenColor: new THREE.Color(0xffc468), sheenRoughness: 0.32, transparent: true, side: THREE.DoubleSide });
    const wigM = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color).multiplyScalar(0.62), roughness: 0.66, map: limeTex, sheen: 1, sheenColor: new THREE.Color(0xffc468), sheenRoughness: 0.32, transparent: true, side: THREE.DoubleSide });
    const gm = new THREE.MeshStandardMaterial({ color: 0xa8843e, roughness: 0.5, metalness: 0.6, transparent: true, side: THREE.DoubleSide });
    const dy = kind === "kneel" ? -0.28 : kind === "seat" ? -0.24 : 0;
    const head = [OV(0.035, 0.905 + dy, 0.066, 0.08), SH([[-0.01, 0.76 + dy], [0.045, 0.76 + dy], [0.045, 0.85 + dy], [-0.01, 0.85 + dy]])];
    let robe;
    if (kind === "kneel") robe = [[-0.09, 0.5], [0.075, 0.5], [0.085, 0.42], [0.06, 0.32], [0.07, 0.24], [0.2, 0.12], [0.22, 0], [-0.2, 0], [-0.22, 0.08], [-0.12, 0.2], [-0.07, 0.3], [-0.08, 0.4]];
    else if (kind === "seat") robe = [[-0.09, 0.54], [0.075, 0.54], [0.085, 0.46], [0.06, 0.34], [0.24, 0.34], [0.25, 0.28], [0.24, 0], [0.17, 0], [0.18, 0.25], [-0.08, 0.25], [-0.08, 0.4]];
    else robe = [[-0.09, 0.78], [0.075, 0.78], [0.085, 0.7], [0.06, 0.6], [0.05, 0.47], [0.07, 0.25], [0.11, 0.02], [0.12, 0], [-0.11, 0], [-0.1, 0.02], [-0.07, 0.25], [-0.06, 0.47], [-0.08, 0.62]];
    const body = new THREE.Mesh(EX([SH(robe), ...head]), mat); body.castShadow = true; G.add(body);
    let wig;
    if (kind === "seat") wig = SH([[-0.12, 0.6 + dy], [-0.06, 0.97 + dy], [0.0, 1.0 + dy], [0.06, 0.975 + dy], [0.085, 0.93 + dy], [0.03, 0.93 + dy], [0.02, 0.84 + dy], [0.07, 0.72 + dy], [0.025, 0.72 + dy], [-0.03, 0.82 + dy], [-0.06, 0.6 + dy]]);
    else wig = SH([[-0.075, 0.93 + dy], [-0.05, 0.975 + dy], [0.0, 0.99 + dy], [0.05, 0.975 + dy], [0.07, 0.94 + dy], [0.02, 0.93 + dy], [-0.01, 0.86 + dy], [-0.02, 0.76 + dy], [-0.09, 0.76 + dy], [-0.095, 0.86 + dy]]);
    const wm = new THREE.Mesh(EX([wig], 0.085), kind === "seat" ? gm : wigM); wm.castShadow = true; G.add(wm);
    const col = new THREE.Mesh(EX([SH([[-0.085, 0.79 + dy], [0.08, 0.79 + dy], [0.07, 0.73 + dy], [-0.07, 0.73 + dy]])], 0.085), gm); G.add(col);
    const arm = new THREE.Group(); arm.position.set(0.0, 0.75 + dy, 0.045); G.add(arm);
    const am = new THREE.Mesh(EX([SH([[-0.022, 0], [0.022, 0], [0.02, -0.33], [0.03, -0.36], [0, -0.4], [-0.025, -0.36], [-0.02, -0.33]])], 0.04), mat); am.castShadow = true; arm.add(am);
    G.scale.setScalar(scale);
    return { G, arm, sc: scale, setO(o) { mat.opacity = wigM.opacity = gm.opacity = o; G.visible = o > 0.01; } };
  }
  const momK = figure("kneel", 0x5a7cbc, 1.25), momS = figure("stand", 0x5a7cbc, 1.25);
  const sis = figure("stand", 0x6fb3b4, 0.95);
  const wife = figure("stand", 0xe3c07a, 1.25);
  const fir = figure("seat", 0x9a7c5c, 1.6);
  const serv = [figure("stand", 0xd2bb94, 1.15), figure("stand", 0xd2bb94, 1.15)];
  const mids = [figure("stand", 0xc4ab86, 1.15), figure("stand", 0xc4ab86, 1.15)];
  const nurses = [0, 1, 2].map(() => figure("stand", 0xdcc29a, 1.2));
  fir.G.position.set(-13.05, 1.0, -20.0); fir.G.rotation.y = 0;
  const FIGS = [momK, momS, sis, wife, fir, ...serv, ...mids, ...nurses];
  // small clay lamp beside the mother
  const lamp = new THREE.Group(); lamp.position.set(-5.2, 0, 13.5); scene.add(lamp);
  add(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: 0.8 }), 0, 0.06, 0, lamp).scale.set(1.4, 0.55, 1);
  const flame = add(new THREE.ConeGeometry(0.045, 0.16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.4, 0.5) }), 0.12, 0.18, 0, lamp);

  // ---------- promise line: downstream on the water, back home along the bank path (gold)
  const lineM = new THREE.MeshStandardMaterial({ color: 0x3a2a08, emissive: 0xffc860, emissiveIntensity: 2.2, transparent: true, opacity: 0, depthWrite: false });
  const downC = new THREE.CatmullRomCurve3([[-3.0, -0.18, 12.4], [-1.6, -0.18, 6], [-1.2, -0.18, -2], [-1.8, -0.18, -10], [-3.3, -0.18, -19.2]].map((p) => new THREE.Vector3(...p)));
  const backC = new THREE.CatmullRomCurve3([[-4.2, 0.3, -19.2], [-5.6, 1.06, -17.0], [-5.5, 1.06, -14.3], [-5.0, 0.06, -12.3], [-5.0, 0.06, -4], [-5.0, 0.06, 4], [-4.6, 0.06, 10.6], [-3.4, 0.06, 12.3]].map((p) => new THREE.Vector3(...p)));
  const NSEG = 300, RAD = 6;
  const downT = new THREE.Mesh(new THREE.TubeGeometry(downC, NSEG, 0.05, RAD, false), lineM); scene.add(downT);
  const backT = new THREE.Mesh(new THREE.TubeGeometry(backC, NSEG, 0.05, RAD, false), lineM); scene.add(backT);
  const draw = (m, u) => { m.geometry.setDrawRange(0, Math.floor(clamp01(u) * NSEG) * RAD * 6); m.visible = u > 0.002; };

  // ---------- dust motes in the museum light
  const NM = 260, motes = pts(scene, NM, { color: 0xffe2b0, size: 0.07, add: true, opacity: 0.8 });
  const MS = []; for (let i = 0; i < NM; i++) MS.push([rnd(), rnd(), rnd(), rnd()]);

  // ---------- state helpers
  const chestOnBank = new THREE.Vector3(-4.05, 0, 11.75), chestW0 = new THREE.Vector3(-3.0, WY - 0.08, 12.3);
  const stepY = (x) => -0.3 + 1.3 * clamp01((-3.6 - x) / 1.6);
  function driftPos(u) { // s4 drift down the river to the palace steps
    const e = sm(u);
    return new THREE.Vector3(-3.0 + 1.8 * Math.sin(Math.PI * e) - 0.35 * e, WY - 0.08, mix(12.3, -19.35, e));
  }
  function chestState(t, o) {
    o.vis = true; o.ry = 0.1; o.float = false;
    if (t < K.s2) { // hook: released from the bank, drifts away
      const u = ramp(t, tLep1, K.s2 + 1.5);
      o.p.set(mix(-3.0, -1.3, u), WY - 0.08, mix(12.3, 8.6, u)); o.float = true; o.ry = 0.1 + 0.3 * u;
    } else if (t < K.s3 - 0.3) o.vis = false;
    else if (t < tLetak + 0.2) o.p.copy(chestOnBank);
    else if (t < tLep4) { const u = sm((t - tLetak - 0.2) / 1.4); o.p.lerpVectors(chestOnBank, chestW0, u); o.p.y += Math.sin(Math.PI * u) * 0.45; o.float = u >= 1; }
    else if (t < tPung) { o.p.copy(driftPos((t - tLep4) / (tTepi + 0.5 - tLep4))); o.float = true; o.ry = 0.1 + 0.25 * Math.sin(t * 0.6); }
    else if (t < tPung + 1.4) { const u = sm((t - tPung) / 1.4); const x = mix(-3.35, -7.4, u); o.p.set(x, Math.max(WY - 0.08, mix(stepY(x) + 0.35, 1.0, sm((u - 0.75) / 0.25))), -19.45); }
    else if (t < tMaka) o.p.set(-7.4, 1.0, -19.45);
    else if (t < K.s8) { const u = ramp(t, tMaka, tMaka + 2.4); o.p.set(mix(-4.9, -5.2, u), 0.34, mix(5.6, 10.4, u) + 0.36); o.ry = Math.PI / 2; }
    else { o.p.set(-4.5, 0, 11.3); o.ry = 0.2; }
    if (o.float) { o.p.y += wh(o.p.x, o.p.z, t) + 0.02 * Math.sin(t * 2.1); }
    return o;
  }
  const CHS = { p: new THREE.Vector3(), vis: true, ry: 0, float: false };
  function place(f, x, y, z, ry, o = 1) { f.G.position.set(x, y, z); f.G.rotation.set(0, ry, 0); f.setO(o); }
  function walk(f, P, u, t, o = 1, lift = (p) => p.y) { // P: array of Vector3-like [x,y,z]; u 0..1 along it
    const n = P.length - 1, s = clamp01(u) * n, i = Math.min(n - 1, Math.floor(s)), k = s - i;
    const a = P[i], b = P[i + 1];
    const x = mix(a[0], b[0], k), y = mix(a[1], b[1], k), z = mix(a[2], b[2], k);
    const moving = u > 0 && u < 1;
    f.G.position.set(x, y + (moving ? 0.025 * Math.abs(Math.sin(t * 9)) : 0), z);
    f.G.rotation.set(0, Math.atan2(-(b[2] - a[2]), b[0] - a[0]), moving ? 0.03 * Math.sin(t * 9) : 0);
    f.arm.rotation.z = moving ? 0.35 * Math.sin(t * 9) : 0.08;
    f.setO(o);
  }

  // ---------- camera: four segments, hard cuts at the cross-cut words (Potong silang)
  const dp = (u) => driftPos(u);
  const follow = [];
  for (let i = 0; i <= 5; i++) { const tt = tLep4 + 0.2 + (tTepi + 0.5 - tLep4 - 0.2) * i / 5; const c = dp((tt - tLep4) / (tTepi + 0.5 - tLep4)); follow.push([tt, c.x + 3.0, 2.0, c.z + 5.6, c.x - 0.6, 0.0, c.z - 1.6]); }
  const SEG = [
    [0, track([
      [0, -0.6, 2.4, 19.4, -3.5, 0.35, 12.2],
      [3.0, -0.9, 2.1, 18.4, -3.3, 0.3, 12.0],
      [6.6, -0.9, 2.0, 17.0, -2.4, 0.15, 10.4],
      [K.s2 + 0.4, 0.4, 4.6, 15.5, -6.0, 0.8, -2.0],
      [tFir + 1.4, -2.2, 3.0, -14.2, -12.8, 1.9, -20.0],
      [tFir + 2.7, -2.6, 2.9, -14.6, -12.8, 1.9, -20.0],
      [tMend - 0.5, -0.8, 2.9, -5.0, -5.7, 1.1, 1.0],
      [tMend + 0.3, -0.9, 2.8, -4.6, -5.7, 1.1, 1.0],
      [tHamil + 0.4, -1.1, 2.7, -3.9, -5.7, 1.1, 1.1],
      [tLahir - 0.6, 0.6, 2.7, 5.8, -7.0, 1.0, 12.0],
      [K.s2e, 0.2, 2.5, 6.8, -7.2, 1.0, 12.4],
      [K.s3 + 1.4, -0.8, 1.2, 15.6, -5.0, 0.7, 12.3],
      [tHany - 0.3, -0.3, 1.7, 16.4, -4.8, 0.6, 12.0],
      [tKemb - 1.4, 0.6, 3.6, 18.6, -3.6, 0.3, 10.0],
      [K.s3e, 2.4, 8.6, 22.0, -2.4, 0.0, -2.0],
      [tLetak + 1.2, -0.3, 2.1, 17.4, -3.6, 0.1, 12.0],
      ...follow,
      [tPung + 0.9, 0.8, 3.6, -11.0, -8.4, 1.4, -19.8],
      [K.s4e, 0.4, 3.4, -11.8, -9.4, 1.5, -19.8],
      [tJang, -0.2, 3.0, -13.0, -9.4, 1.5, -19.6],
      [tSem, -0.6, 2.9, -13.6, -9.4, 1.5, -19.5],
    ])],
    [tSem, track([
      [tSem, -0.3, 1.7, 16.6, -5.0, 0.6, 12.2],
      [tTeg, -1.1, 1.4, 15.6, -5.0, 0.6, 12.2],
      [K.s6 + 0.6, -1.0, 1.6, 15.8, -5.0, 0.7, 11.6],
      [tIkut, -1.0, 1.6, 15.4, -5.0, 0.7, 11.0],
      [tKak, -1.0, 1.7, 13.4, -4.8, 0.65, 8.4],
    ])],
    [tKak, track([
      [tKak, -2.2, 1.35, -3.2, -7.6, 1.15, -19.4],
      [tTol - 0.6, -2.3, 1.4, -3.7, -7.8, 1.15, -19.6],
      [K.s6e, -2.4, 1.45, -4.2, -8.0, 1.15, -19.8],
      [tKk7 + 2.0, -0.6, 2.9, -10.6, -7.8, 1.5, -18.8],
      [tMaka, -0.8, 2.8, -11.4, -8.4, 1.5, -19.2],
    ])],
    [tMaka, track([
      [tMaka, -0.6, 1.6, 15.2, -5.0, 0.7, 8.0],
      [tSen, -0.9, 1.7, 16.0, -5.1, 0.75, 10.0],
      [tJan - 0.4, -0.2, 3.2, 18.6, -4.4, 0.5, 9.0],
      [K.s8 + 0.2, 2.2, 7.6, 24.0, -2.8, 0.0, 0.0],
      [K.s8 + 3.6, 1.2, 6.0, 33.0, -2.2, 0.0, 6.0],
      [tKis - 1.0, -0.4, 1.8, 46.5, -1.5, -0.2, 18.0],
      [K.end, -0.6, 1.4, 50.0, -1.5, -0.2, 20.0],
      [K.dur, -0.62, 1.4, 50.1, -1.5, -0.2, 20.0],
    ])],
  ];

  // ---------- frame
  return (t) => {
    let seg = SEG[0][1];
    for (const [t0, f] of SEG) if (t >= t0) seg = f;
    const [px, py, pz, tx, ty, tz] = seg(t);
    cam.position.set(px, py, pz); cam.lookAt(tx, ty, tz);

    // mood: key light by scene
    const night = pulse(t, tDib, tDib + 1.5, K.s4 - 0.5, K.s4 + 0.5) * 0.32 + pulse(t, tSem - 0.05, tSem + 0.1, K.s6, K.s6 + 2) * 0.28;
    const dusk = ramp(t, K.s8, K.s8 + 4);
    key.intensity = 2.5 * (1 - night) * (1 - 0.25 * dusk);
    key.color.setRGB(1, mix(0.81, 0.62, dusk), mix(0.54, 0.34, dusk));
    hemi.intensity = 0.8 * (1 - 0.45 * night) + 0.1 * dusk;
    fill.intensity = 0.35 + 0.25 * night;
    spot.position.set(tx + 3, ty + 12, tz + 5); spot.target.position.set(tx, ty, tz); spot.intensity = 60 * (0.6 + 0.4 * night);
    labL.intensity = 8 * ramp(t, K.s8 + 2, K.s8 + 4);

    // water relief flows
    const p = wPos.array;
    for (let i = 0; i < wPos.count; i++) p[i * 3 + 1] = wh(WB[i * 2], WB[i * 2 + 1], t);
    wPos.needsUpdate = true; wGeo.computeVertexNormals();

    // reeds sway
    for (let i = 0; i < NR; i++) {
      const s = RS[i], sw = 0.05 * Math.sin(t * 1.3 + s[3]) + 0.02 * Math.sin(t * 2.7 + s[3] * 2);
      dm.position.set(s[0], 0, s[1]); dm.rotation.set(sw, 0, s[4] + sw * 0.6); dm.scale.set(1, s[2], 1); dm.updateMatrix(); stems.setMatrixAt(i, dm.matrix);
      dm.translateY(s[2]); dm.scale.set(1, 1, 1); dm.updateMatrix(); heads.setMatrixAt(i, dm.matrix);
    }
    stems.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;

    // village windows: lit, go dark one by one after the order, warm again when the promise is kept
    for (let i = 0; i < winM.length; i++) winM[i].emissiveIntensity = 1.3 * (1 - ramp(t, tDib + 0.2 + i * 0.32, tDib + 0.8 + i * 0.32)) + 0.06 + 1.0 * ramp(t, tSen + i * 0.12, tSen + 0.8 + i * 0.12);
    MH.wm.emissiveIntensity = 1.2 * (1 - ramp(t, tDib, tDib + 1)) + 1.7 * ramp(t, tLahir, tLahir + 0.8) * (1 - 0.8 * pulse(t, tSem, tSem + 0.2, tTeg, tTeg + 1.2)) + 1.2 * ramp(t, tSen, tSen + 1.0);
    const lampOn = ramp(t, tLahir, tLahir + 0.8) * (t < tKak || t >= tMaka ? 1 : 0) + (t < K.s2 ? 1 : 0);
    const fl = 1 + 0.08 * Math.sin(t * 13.1) * (1 - 0.8 * ramp(t, tTeg, tTeg + 1)) + 0.06 * Math.sin(t * 29.7 + 1.3) * pulse(t, tKos, tKos + 0.5, tTeg, tTeg + 1);
    const lampDim = 1 - 0.55 * pulse(t, tKos, tKos + 0.8, tTeg, tTeg + 1.0);
    flame.scale.set(1, Math.max(0.001, lampOn * fl * lampDim), 1);
    lampL.position.set(-5.0, 0.6, 13.5); lampL.intensity = 4.0 * lampOn * fl * lampDim * (1 + 0.6 * ramp(t, tSen, tSen + 1));
    chestRec.visible = t >= K.s5 && t < tMaka;

    // stele list
    for (let i = 0; i < MARKS.length; i++) { const a = mix(tMend, tHamil + 0.3, i / MARKS.length); const u = ramp(t, a, a + 0.12); MARKS[i].scale.set(Math.max(0.001, u), 1, 1); MARKS[i].visible = u > 0.001; }

    // chest
    chestState(t, CHS);
    CH.visible = CHS.vis; CH.position.copy(CHS.p); CH.rotation.set(CHS.float ? 0.04 * Math.sin(t * 1.7) : 0, CHS.ry, CHS.float ? 0.04 * Math.sin(t * 1.3 + 1) : 0);

    // promise line
    let dU = 0, bU = 0, lo = 0;
    if (t < K.s4 + 1.6) { dU = ramp(t, tKemb, tKemb + 1.0); bU = ramp(t, tKemb + 1.0, tKemb + 2.0); lo = 0.85 * ramp(t, tKemb, tKemb + 0.3) * (1 - ramp(t, K.s4 + 0.6, K.s4 + 1.6)); }
    else if (t < tPung + 1) { dU = (t - tLep4) / (tTepi + 0.5 - tLep4); lo = 0.55 * ramp(t, tLep4, tLep4 + 0.5) * (1 - ramp(t, tPung, tPung + 1)); }
    else if (t >= tMaka) { bU = ramp(t, tMaka + 0.3, tJan); dU = ramp(t, tJan - 0.6, tJan + 0.8); lo = ramp(t, tMaka + 0.3, tMaka + 0.8); }
    draw(downT, dU); draw(backT, bU); lineM.opacity = lo; lineM.emissiveIntensity = 2.0 + 0.6 * ramp(t, tJan, tJan + 1);

    // ---- figures
    const hide = (f) => f.setO(0);
    [momK, momS, sis, wife, ...serv, ...mids, ...nurses].forEach(hide);
    // mother
    if (t < K.s2) { place(momK, -4.6, 0, 12.6, 0); momK.arm.rotation.z = mix(1.25, 0.55, ramp(t, tLep1 + 0.2, tLep1 + 1.4)); }
    else if (t >= tTapi + 0.4 && t < K.s2e) { place(momK, -6.2, 0, 12.0, 0, ramp(t, tLahir, tLahir + 0.8)); momK.arm.rotation.z = 0.5; }
    else if (t >= K.s3 - 0.4 && t < K.s4e - 1) { place(momK, -4.6, 0, 12.6, 0); momK.arm.rotation.z = 0.35 + 0.8 * pulse(t, tHany, tHany + 0.6, K.s3e - 0.6, K.s3e) + 0.9 * pulse(t, tLetak, tLetak + 0.4, tLep4 + 0.4, tLep4 + 1.4); }
    else if (t >= tSem && t < K.s6) {
      const up = pulse(t, tHamp, tHamp + 0.5, tTeg, tTeg + 0.6);
      place(momK, -4.6, 0, 12.6, 0, 1 - up); momK.arm.rotation.z = 0.4;
      place(momS, -4.45, 0, 12.6, 0, up); momS.G.rotation.z = -0.12 * up; momS.arm.rotation.z = 0.9 * up;
    } else if (t >= K.s6 && t < tKak) { place(momS, -4.8, 0, 12.5, 0, ramp(t, K.s6, K.s6 + 0.4)); momS.arm.rotation.z = 0.15 + 1.2 * pulse(t, tIkut, tIkut + 0.4, tKak - 0.4, tKak); }
    else if (t >= tKk7 + 2.6 && t < tMaka) { walk(momS, [[-11.2, 1, -21.2], [-8.7, 1, -20.6]], ramp(t, tKk7 + 2.6, tMaka - 0.3), t, ramp(t, tKk7 + 2.6, tKk7 + 3.0)); }
    else if (t >= tMaka && t < K.s8) { walk(momS, [[-4.9, 0, 5.6], [-5.2, 0, 10.4]], ramp(t, tMaka, tMaka + 2.4), t); momS.arm.rotation.z = 1.0; if (t > tMaka + 2.4) { momS.G.rotation.y = mix(-Math.PI / 2, 0, ramp(t, tMaka + 2.4, tMaka + 3.0)); } }
    else if (t >= K.s8) { place(momS, -5.2, 0, 10.6, 0); momS.arm.rotation.z = 0.25; }
    // sister
    if (t >= K.s6 && t < tKak) { if (t < tIkut + 0.1) { place(sis, -5.5, 0, 11.6, 0, ramp(t, K.s6, K.s6 + 0.4)); sis.arm.rotation.z = 0.1; } else walk(sis, [[-5.4, 0, 11.4], [-4.9, 0, 7.4]], ramp(t, tIkut + 0.1, tKak), t); }
    else if (t >= tKak && t < tKk7) { walk(sis, [[-4.45, 0, -9.2], [-4.35, 0, -11.2]], ramp(t, tKak, tKak + 1.1), t); if (t > tKak + 1.1) sis.G.rotation.y = Math.PI / 2; }
    else if (t >= tKk7 && t < tMaka) {
      const u = ramp(t, tKk7, tKk7 + 1.9);
      walk(sis, [[-4.35, 0, -11.2], [-4.9, 0, -12.3], [-5.5, 1.0, -14.1], [-6.5, 1.0, -17.2]], u, t);
      if (u >= 1) { sis.G.rotation.y = 1.98; sis.arm.rotation.z = 0.25 + 0.6 * pulse(t, tKk7 + 1.3, tKk7 + 1.7, tMaka - 0.8, tMaka - 0.3); }
    } else if (t >= K.s8) { place(sis, -5.95, 0, 10.0, 0); sis.arm.rotation.z = 0.1; }
    // palace: wife, Firaun, servants, nurses
    const atPalace = (t > tFir - 0.5 && t < K.s3) || (t > tTepi && t < tSem) || (t >= tKak && t < tMaka);
    fir.G.rotation.y = 0; fir.setO(atPalace ? 1 : 0); fir.arm.rotation.z = 1.2;
    if (atPalace && t > tPung) { place(wife, -8.9, 1.0, -18.4, 0, ramp(t, tPung + 0.9, tPung + 1.6)); wife.arm.rotation.z = 0.15 + 0.8 * ramp(t, tPeny - 0.2, tPeny + 0.6); }
    for (let k = 0; k < 2; k++) {
      const f = serv[k];
      if (t > tTepi && t < tPung + 2.6) {
        const zz = -19.45 + (k ? -0.5 : 0.5);
        if (t < tPung) place(f, -4.7 - k * 0.4, 1.0 - 0.0, zz, Math.PI, ramp(t, tTepi, tTepi + 0.5));
        else if (t < tPung + 1.4) { const x = CH.position.x - 0.45 + k * 0.9; f.G.position.set(x, Math.max(-0.3, stepY(x)) + (x < -5.2 ? 0 : 0), zz); f.G.rotation.set(0, Math.PI, 0); f.setO(1); f.arm.rotation.z = 1.4; }
        else walk(f, [[-7.4 + k * 0.9 - 0.45, 1, zz], [-11.5, 1, zz + (k ? -1.5 : 1.5)]], ramp(t, tPung + 1.4, tPung + 2.6), t, 1 - ramp(t, tPung + 2.0, tPung + 2.6));
        if (t < tPung) f.G.position.y = 1.0;
      }
    }
    for (let k = 0; k < 2; k++) if (t > tPara - 0.3 && t < tHamil + 1.0) {
      const f = mids[k];
      if (t < tHamil) { place(f, -5.6 + (k ? -0.9 : 0.6), 0, 1.0 + (k ? 0.9 : -0.9), 2.35 - Math.PI / 2 + (k ? -0.6 : 0.6) + Math.PI, ramp(t, tPara - 0.3, tPara + 0.2)); f.arm.rotation.z = k ? 0.2 : 0.9 + 0.15 * Math.sin(t * 6); }
      else walk(f, [[-5.6 + (k ? -0.9 : 0.6), 0, 1.0 + (k ? 0.9 : -0.9)], [-6.6 + (k ? -0.9 : 0), 0, 4.2 + (k ? 0.6 : 0)]], ramp(t, tHamil, tHamil + 1.0), t, 1 - ramp(t, tHamil + 0.5, tHamil + 1.0));
    }
    for (let k = 0; k < 3; k++) {
      const t0 = tTol - 0.3 + k * 1.05, f = nurses[k];
      if (t < t0 || t > t0 + 1.5 || !atPalace) continue;
      if (t < t0 + 0.55) walk(f, [[-11.3, 1, -21.3], [-8.4, 1, -20.5]], (t - t0) / 0.55, t, ramp(t, t0, t0 + 0.2));
      else if (t < t0 + 0.9) { place(f, -8.4, 1, -20.5, Math.atan2(-0.8, 2.9)); f.arm.rotation.z = 0.9; }
      else walk(f, [[-8.4, 1, -20.5], [-11.0, 1, -21.6]], (t - t0 - 0.9) / 0.6, t, 1 - ramp(t, t0 + 1.2, t0 + 1.5));
    }
    firL.intensity = 38 * (pulse(t, tFir - 0.2, tFir + 0.6, tDib + 0.5, tDib + 1.4) + ramp(t, tRumah - 0.3, tRumah + 0.5) * (1 - 0.65 * ramp(t, tJang, tJang + 1.2)));
    wifeL.intensity = 3.5 * ramp(t, tPeny - 0.2, tPeny + 0.8) * (atPalace ? 1 : 0);

    // relief cutouts turn their face plane to the camera; the profile is mirrored so it keeps its intended facing
    for (const f of FIGS) {
      if (!f.G.visible) continue;
      const ry = f.G.rotation.y, dx = cam.position.x - f.G.position.x, dz = cam.position.z - f.G.position.z;
      const r0 = Math.atan2(dx, dz), mir = Math.cos(r0) * Math.cos(ry) + Math.sin(r0) * Math.sin(ry) < 0;
      f.G.rotation.y = r0; f.G.scale.set(mir ? -f.sc : f.sc, f.sc, f.sc);
    }
    // dust motes around the look target
    const Bx = 5, By = 4, Bz = 6;
    for (let i = 0; i < NM; i++) {
      const s = MS[i];
      const wx = ((s[0] * Bx * 2 + t * 0.05 * (s[3] - 0.3) - tx) % (Bx * 2) + Bx * 4) % (Bx * 2) - Bx;
      const wy = ((s[1] * By * 2 + t * 0.03 - ty) % (By * 2) + By * 4) % (By * 2) - By;
      const wz = ((s[2] * Bz * 2 + t * 0.04 - tz) % (Bz * 2) + Bz * 4) % (Bz * 2) - Bz;
      motes.pos[i * 3] = tx + wx; motes.pos[i * 3 + 1] = Math.max(0.1, ty + 1 + wy); motes.pos[i * 3 + 2] = tz + wz + 2;
      const tw = 0.3 + 0.3 * Math.sin(t * (0.8 + s[3] * 1.6) + s[0] * 40);
      motes.col[i * 3] = tw; motes.col[i * 3 + 1] = tw * 0.85; motes.col[i * 3 + 2] = tw * 0.6;
    }
    motes.commit();

    bp.strength = 0.22 + 0.08 * dusk;
    comp.render();
  };
}
