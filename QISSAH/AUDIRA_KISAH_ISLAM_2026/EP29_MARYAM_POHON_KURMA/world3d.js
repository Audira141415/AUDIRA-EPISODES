// EP29 MARYAM DAN POHON KURMA. FELTCRAFT: a soft handmade felt diorama on a round felt base. Fuzzy wool surfaces
// (one shared fibre canvas used as map + bump, MeshPhysical sheen), stitched seams (instanced running stitches in
// cream thread), button stars sewn on a navy felt sky, a felt crescent, layered felt hill flats with stitched ridges.
// Subject: one felt date palm (puffy lathe rings, toothed felt fronds with corded midribs, felt-ball date clusters).
// Maryam is never shown in any form: her presence is a soft blue felt shawl resting at the foot of the palm (one corner
// leaning on the trunk) and a small brass-felt lantern. The angel is not shown: the call (QS 19:24) is a gentle ring of
// light rippling out from the ground under the palm. Baby Isa is not shown.
// s1 night hook, wind; s2 a felt village far away, a running stitch sews the path east to the palm, a "TIMUR" signpost;
// s3 stars brighten on "tanda"/"rahmat"; s4 close on the shawl leaning on the trunk; s5 ripple, then a felt stream
// sews itself out from under the palm; s6 the trunk sways and ripe felt dates fall softly into the shawl, a cup pops up
// by the stream; s7 a weak tremble, then a few more dates; s8 dawn: the sky felt warms, a felt sun rises, stars fade.
// AUDIRA is a tiny embroidered cotton tag sewn on a felt rock by the shawl. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, clamp01, canvasTex, track, stage, pts, back } from "./lib3d.js";

const FT = 0.7; // date fall time (mix.py uses the same value)

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x141c3c, fog: 0.004, exp: 1.05, bloom: [0.3, 0.5, 0.82], shadow: true });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2919);
  const tv = new THREE.Vector3(), fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fs = new THREE.Vector3(), fe = new THREE.Euler();
  const UPV = new THREE.Vector3(0, 1, 0);
  const SRGB = THREE.SRGBColorSpace;

  // ---------- felt fibre canvas (tileable), shared by every felt material
  const FC = document.createElement("canvas"); FC.width = FC.height = 256;
  {
    const g = FC.getContext("2d"), W = 256;
    g.fillStyle = "#e6e6e6"; g.fillRect(0, 0, W, W);
    for (let i = 0; i < 260; i++) { const x = rnd() * W, y = rnd() * W, rr = 6 + rnd() * 22; g.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)"; for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]) { g.beginPath(); g.arc(x + ox, y + oy, rr, 0, 6.3); g.fill(); } }
    for (let i = 0; i < 9000; i++) {
      const x = rnd() * W, y = rnd() * W, a = rnd() * 6.283, l = 2 + rnd() * 7, lt = rnd() < 0.5;
      g.strokeStyle = lt ? `rgba(255,255,255,${0.1 + rnd() * 0.18})` : `rgba(40,40,40,${0.07 + rnd() * 0.12})`;
      g.lineWidth = 0.5 + rnd() * 0.9;
      const dx = Math.cos(a) * l, dy = Math.sin(a) * l * 0.8 + (rnd() - 0.5) * 3;
      for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]) {
        if ((ox && Math.abs(x + ox - W / 2) > W / 2 + 10) || (oy && Math.abs(y + oy - W / 2) > W / 2 + 10)) continue;
        g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + dx * 0.5 + (rnd() - 0.5) * 3, y + oy + dy * 0.5, x + ox + dx, y + oy + dy); g.stroke();
      }
    }
  }
  const fib = (rx, ry) => { const t = new THREE.CanvasTexture(FC); t.colorSpace = SRGB; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; };
  const fibB = (rx, ry) => { const t = new THREE.CanvasTexture(FC); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const felt = (color, rep = [2, 2], o = {}) => new THREE.MeshPhysicalMaterial({
    color, map: fib(rep[0], rep[1]), bumpMap: fibB(rep[0], rep[1]), bumpScale: o.bump ?? 1.4, roughness: 1, metalness: 0,
    sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.45), ...o.extra,
  });
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

  // ---------- running stitches (cream thread) as one instanced mesh, each with its own reveal time
  const STI = [];
  const stitch = (p, dir, len = 0.22, rev = -1, r0 = 0.028) => STI.push({ p: p.clone(), d: dir.clone().normalize(), len, rev, r0 });

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0x7a8ad0, 0x2a2238, 0.9); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xaabbff, 1.6); moon.position.set(-18, 26, 16); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.03;
  Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
  scene.add(moon); scene.add(moon.target);
  const sunL = new THREE.DirectionalLight(0xffb985, 0); sunL.position.set(16, 9, -24); scene.add(sunL);
  const fill = new THREE.DirectionalLight(0xffd6b0, 0); fill.position.set(10, 14, 26); scene.add(fill);

  // ---------- base: a round felt diorama base with a stitched rim
  const groundM = felt(0xb89a74, [10, 10], { bump: 1.6 });
  const base = mesh(new THREE.CylinderGeometry(26, 26.3, 1.4, 96), groundM, 0, -0.7, 0); base.castShadow = false;
  const rimM = felt(0x7a5a8a, [24, 1]);
  mesh(new THREE.TorusGeometry(26.15, 0.28, 12, 120), rimM, 0, -0.02, 0).rotation.x = Math.PI / 2;
  for (let i = 0; i < 220; i++) { const a = (i / 220) * 6.283; stitch(new THREE.Vector3(Math.cos(a) * 26.32, -0.55, Math.sin(a) * 26.32), new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), 0.3); }
  // a few felt dunes (low puffy mounds) on the valley floor
  const duneM = [felt(0xc6a57c, [3, 3]), felt(0xa98a6a, [3, 3]), felt(0xd1b38c, [3, 3])];
  for (const [x, z, sx, sz, h, c] of [[-14, -6, 6, 4, 0.9, 0], [12, -9, 7, 4.5, 1.1, 1], [-11, 8, 5, 3.5, 0.7, 2], [13, 6, 5, 3, 0.6, 0], [6, -16, 6, 3, 0.8, 2], [-17, -14, 5, 3, 1.0, 1]]) {
    const m = mesh(new THREE.SphereGeometry(1, 32, 16, 0, 6.283, 0, Math.PI / 2), duneM[c], x, 0, z); m.scale.set(sx, h, sz);
  }
  // pebbles and felt shrubs
  const pebM = felt(0x8d7c86, [1, 1]), shrubM = felt(0x6f7d45, [1, 1]), shrub2 = felt(0x8a9a52, [1, 1]);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * 6.283, rr = 5 + rnd() * 17, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (Math.abs(x - 2.5) < 3 && z > -1 && z < 13) continue;
    if (rnd() < 0.5) { const m = mesh(new THREE.SphereGeometry(0.3 + rnd() * 0.3, 14, 10), pebM, x, 0.1, z); m.scale.y = 0.55; }
    else { const s = 0.35 + rnd() * 0.4; for (let k = 0; k < 3; k++) mesh(new THREE.SphereGeometry(s * (0.7 + 0.3 * k / 2), 14, 10), k % 2 ? shrub2 : shrubM, x + (k - 1) * s * 0.7, s * 0.6, z + (rnd() - 0.5) * s); }
  }

  // ---------- sky: navy felt wall with button stars + a felt crescent; a dawn felt wall crossfades over it
  const skyM = felt(0x1d2752, [14, 6], { bump: 0.8, extra: { side: THREE.BackSide, sheen: 0.4 } });
  const sky = mesh(new THREE.CylinderGeometry(52, 52, 90, 96, 1, true, Math.PI - 2.3, 4.6), skyM, 0, 30, 6); sky.castShadow = sky.receiveShadow = false;
  const dawnTex = canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#6f86b8"); gr.addColorStop(0.42, "#b9a6c6"); gr.addColorStop(0.62, "#f2b9a0"); gr.addColorStop(0.78, "#ffd39a"); gr.addColorStop(1, "#ffe2b0");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "multiply"; for (let x = 0; x < w; x += 256) for (let y = 0; y < h; y += 256) g.drawImage(FC, x, y);
  });
  const dawnM = new THREE.MeshPhysicalMaterial({ map: dawnTex, roughness: 1, side: THREE.BackSide, transparent: true, opacity: 0, sheen: 0.5, sheenColor: new THREE.Color(0xffe6cc), emissive: 0xffffff, emissiveMap: dawnTex, emissiveIntensity: 0.25, depthWrite: false });
  const dawnSky = mesh(new THREE.CylinderGeometry(51.5, 51.5, 90, 96, 1, true, Math.PI - 2.3, 4.6), dawnM, 0, 30, 6); dawnSky.castShadow = dawnSky.receiveShadow = false;
  const btnTex = canvasTex(128, 128, (g, w) => {
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(64, 64, 62, 0, 6.3); g.fill();
    g.strokeStyle = "rgba(150,120,60,.55)"; g.lineWidth = 7; g.beginPath(); g.arc(64, 64, 50, 0, 6.3); g.stroke();
    g.fillStyle = "rgba(120,90,40,.75)"; for (const [x, y] of [[48, 48], [80, 48], [48, 80], [80, 80]]) { g.beginPath(); g.arc(x, y, 8, 0, 6.3); g.fill(); }
    g.strokeStyle = "rgba(240,230,210,.95)"; g.lineWidth = 4; g.beginPath(); g.moveTo(48, 48); g.lineTo(80, 80); g.moveTo(80, 48); g.lineTo(48, 80); g.stroke();
  });
  const starM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: btnTex, emissive: 0xffe9a8, emissiveMap: btnTex, emissiveIntensity: 0.9, roughness: 0.6 });
  const STARS = [];
  for (let i = 0; i < 46; i++) {
    const a = Math.PI * 0.5 + (rnd() - 0.5) * 3.1, y = 9 + rnd() * 30;
    STARS.push({ a, y, s: 0.35 + rnd() * 0.45, ph: rnd() * 6.283, big: i < 3 });
  }
  STARS[0].a = Math.PI * 0.5 + 0.25; STARS[0].y = 24; STARS[0].s = 1.1;
  STARS[1].a = Math.PI * 0.5 - 0.42; STARS[1].y = 30; STARS[1].s = 0.95;
  STARS[2].a = Math.PI * 0.5 + 0.62; STARS[2].y = 19; STARS[2].s = 0.85;
  const starG = new THREE.CylinderGeometry(1, 1, 0.25, 28); starG.rotateX(Math.PI / 2);
  const stars = new THREE.InstancedMesh(starG, starM, STARS.length); stars.frustumCulled = false; scene.add(stars);
  const starPos = (o) => new THREE.Vector3(Math.cos(o.a) * 50.6 * -1, o.y, 6 - Math.sin(o.a) * 50.6);
  // stitched sparkles (little cross stitches) between the buttons
  for (let i = 0; i < 30; i++) {
    const a = Math.PI * 0.5 + (rnd() - 0.5) * 3.0, y = 8 + rnd() * 34, p = new THREE.Vector3(-Math.cos(a) * 50.8, y, 6 - Math.sin(a) * 50.8);
    const tg = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
    stitch(p, tg.clone().add(new THREE.Vector3(0, 1, 0)), 0.5, -1, 0.05); stitch(p, tg.clone().sub(new THREE.Vector3(0, 1, 0)), 0.5, -1, 0.05);
  }
  // felt crescent moon
  const cres = new THREE.Shape(); cres.absarc(0, 0, 3, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(1.25, 0.7, 2.6, 0, Math.PI * 2, true); cres.holes.push(hole);
  const moonM = felt(0xf3e2b0, [0.4, 0.4], { extra: { emissive: 0xf7e2a0, emissiveIntensity: 0.35 } });
  const moonMesh = mesh(new THREE.ExtrudeGeometry(cres, { depth: 0.4, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 3, curveSegments: 48 }), moonM, -14, 30, -40);
  moonMesh.rotation.z = 0.5; moonMesh.castShadow = false;
  // felt sun for the dawn (disc with stitched ring), rises behind the hills in s8
  const sunTex = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#ffb24d"; g.fillRect(0, 0, w, w);
    g.globalCompositeOperation = "multiply"; g.drawImage(FC, 0, 0); g.globalCompositeOperation = "source-over";
    g.strokeStyle = "#fff0c8"; g.lineWidth = 7; g.setLineDash([16, 11]); g.beginPath(); g.arc(128, 128, 104, 0, 6.3); g.stroke(); g.setLineDash([]);
  });
  const sunM = new THREE.MeshStandardMaterial({ map: sunTex, emissive: 0xff9a3c, emissiveMap: sunTex, emissiveIntensity: 0.8, roughness: 1 });
  const sunMesh = mesh(new THREE.CylinderGeometry(4, 4, 0.5, 64), sunM, 7, -6, -44.5); sunMesh.rotation.x = Math.PI / 2; sunMesh.castShadow = false;

  // ---------- felt hill flats (stage-like layers) with stitched ridges
  const HILL = [[-30, 0xc7a27c, 4.5, 0.0], [-36, 0xa98088, 7.0, 1.7], [-42, 0x6f6694, 9.5, 3.1]];
  for (const [z, col, hh, ph] of HILL) {
    const sh = new THREE.Shape(); const W = 64, NS = 90;
    const top = (x) => hh + 1.6 * Math.sin(x * 0.11 + ph) + 1.0 * Math.sin(x * 0.27 + ph * 2) + 0.5 * Math.sin(x * 0.6 + ph);
    sh.moveTo(-W, -1);
    for (let i = 0; i <= NS; i++) { const x = -W + (2 * W * i) / NS; sh.lineTo(x, top(x)); }
    sh.lineTo(W, -1); sh.lineTo(-W, -1);
    const m = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelSize: 0.22, bevelThickness: 0.22, bevelSegments: 3, curveSegments: 4 }), felt(col, [0.12, 0.12]), 0, 0, z);
    m.castShadow = false;
    for (let x = -W + 1; x < W - 1; x += 0.62) {
      const y = top(x) - 0.42, d = new THREE.Vector3(0.62, top(x + 0.62) - top(x), 0);
      stitch(new THREE.Vector3(x, y, z + 0.84), d, 0.3, -1, 0.04);
    }
  }

  // ---------- village far away (west), on a felt mound
  const VX = -9, VZ = -20;
  const mound = mesh(new THREE.SphereGeometry(1, 40, 20, 0, 6.283, 0, Math.PI / 2), felt(0xbf9b74, [3, 2]), VX, 0, VZ); mound.scale.set(7, 1.6, 4.2);
  const houseC = [0xf1e3c8, 0xe7c9a0, 0xd99a78, 0xf4ead6, 0xcfae8c];
  const winM = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, emissive: 0xffb050, emissiveIntensity: 1.6 });
  const HOUSES = [[-3.2, 0.6, 1.4, 1.3, 1], [-1.4, -0.8, 1.2, 1.0, 0], [0.4, 0.4, 1.6, 1.5, 1], [2.3, -0.6, 1.1, 0.9, 0], [3.8, 0.5, 1.3, 1.2, 0], [-0.5, 1.9, 1.0, 0.9, 0], [1.6, 2.0, 1.2, 1.1, 1]];
  const winMeshes = [];
  HOUSES.forEach(([dx, dz, w, h, dome], i) => {
    const x = VX + dx, z = VZ + dz, gy = 1.6 * Math.sqrt(Math.max(0, 1 - (dx / 7) ** 2 - (dz / 4.2) ** 2)) - 0.12;
    const m = mesh(new THREE.BoxGeometry(w, h, w * 0.9, 2, 2, 2), felt(houseC[i % 5], [0.6, 0.6]), x, gy + h / 2, z);
    if (dome) mesh(new THREE.SphereGeometry(w * 0.36, 20, 10, 0, 6.283, 0, Math.PI / 2), felt(0xf6efe0, [0.4, 0.4]), x, gy + h, z);
    else mesh(new THREE.BoxGeometry(w * 1.08, 0.14, w * 0.98), felt(0x9c7458, [0.4, 0.4]), x, gy + h + 0.07, z);
    const wd = mesh(new THREE.PlaneGeometry(w * 0.22, h * 0.3), winM, x + w * 0.15, gy + h * 0.55, z + w * 0.45 + 0.01); wd.castShadow = false; winMeshes.push(wd);
    const dr = mesh(new THREE.PlaneGeometry(w * 0.22, h * 0.42), new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 1 }), x - w * 0.2, gy + h * 0.21, z + w * 0.45 + 0.01); dr.castShadow = false;
  });
  for (const [dx, dz, s] of [[-5.2, 0.3, 1], [5.4, -0.4, 0.9], [4.6, 1.6, 0.7]]) { // felt cypress
    const x = VX + dx, z = VZ + dz;
    const c = mesh(new THREE.ConeGeometry(0.45 * s, 2.2 * s, 16), felt(0x55693a, [0.5, 0.5]), x, 0.8 + 1.1 * s, z);
  }

  // ---------- the path east: a running stitch sewn from the village to the palm (s2)
  const pathC = new THREE.CatmullRomCurve3([[-7.2, -16.2], [-5.4, -13], [-6.4, -9.6], [-4.2, -6.4], [-2.6, -3.6], [-1.3, -1.4]].map(([x, z]) => new THREE.Vector3(x, 0.06, z)));
  const tP0 = A("s2:mengasingkan"), tP1 = A("s2:timur") + 0.5;
  const NPS = 44, PST0 = STI.length;
  for (let i = 0; i < NPS; i++) { const u = (i + 0.5) / NPS; stitch(pathC.getPointAt(u), pathC.getTangentAt(u), 0.3, tP0 + (tP1 - tP0) * u, 0.05); }
  // felt footpath strip under the stitches (sand-cream), revealed with them
  const NPSeg = 80, pathPos = new Float32Array((NPSeg + 1) * 2 * 3), pathUV = new Float32Array((NPSeg + 1) * 2 * 2), pathIdx = [];
  for (let i = 0; i <= NPSeg; i++) {
    const u = i / NPSeg, p = pathC.getPointAt(u), tg = pathC.getTangentAt(u), nx = -tg.z, nz = tg.x, w = 0.42;
    pathPos.set([p.x + nx * w, 0.03, p.z + nz * w, p.x - nx * w, 0.03, p.z - nz * w], i * 6);
    pathUV.set([u * 8, 0, u * 8, 1], i * 4);
    if (i < NPSeg) { const a = i * 2; pathIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const pathG = new THREE.BufferGeometry(); pathG.setAttribute("position", new THREE.BufferAttribute(pathPos, 3)); pathG.setAttribute("uv", new THREE.BufferAttribute(pathUV, 2)); pathG.setIndex(pathIdx); pathG.computeVertexNormals();
  const pathMesh = mesh(pathG, felt(0xe6d2ad, [1, 1]), 0, 0, 0); pathMesh.castShadow = false;
  // a felt needle at the sewing tip
  const needle = new THREE.Group(); scene.add(needle);
  mesh(new THREE.CylinderGeometry(0.03, 0.005, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.9, roughness: 0.25, emissive: 0x334455 }), 0, 0.55, 0, needle);
  // signpost "TIMUR"
  const sign = new THREE.Group(); sign.position.set(-3.6, 0, -8.6); scene.add(sign);
  mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 10), felt(0x7a5236, [0.3, 1]), 0, 1.1, 0, sign);
  const signTex = canvasTex(512, 200, (g, w, h) => {
    g.fillStyle = "#f3dfb6"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "multiply"; g.drawImage(FC, 0, 0, 256, 200); g.drawImage(FC, 256, 0, 256, 200); g.globalCompositeOperation = "source-over";
    g.strokeStyle = "#8a5a3a"; g.setLineDash([18, 12]); g.lineWidth = 6; g.strokeRect(16, 16, w - 32, h - 32); g.setLineDash([]);
    g.fillStyle = "#6b3a2a"; g.font = "700 96px Quicksand, sans-serif"; g.textBaseline = "middle"; g.fillText("TIMUR", 46, h / 2 + 6);
    g.beginPath(); g.moveTo(370, 70); g.lineTo(430, 100); g.lineTo(370, 130); g.lineTo(370, 112); g.lineTo(334, 112); g.lineTo(334, 88); g.lineTo(370, 88); g.closePath(); g.fill();
  });
  const signSide = felt(0xd8b98c, [0.3, 0.3]);
  mesh(new THREE.BoxGeometry(2.3, 0.9, 0.16), [signSide, signSide, signSide, signSide, new THREE.MeshStandardMaterial({ map: signTex, roughness: 1 }), signSide], 0.5, 1.85, 0.05, sign);

  // ---------- the date palm (pivot at the base: everything above sways)
  const palm = new THREE.Group(); scene.add(palm);
  const H = 7.2, NR = 13;
  const trunkM = [felt(0x8a5a3c, [1, 1]), felt(0xa06c46, [1, 1])];
  const lean = (y) => 0.32 * (y / H) ** 2;
  for (let i = 0; i < NR; i++) {
    const y0 = (i / NR) * H, hh = H / NR + 0.06, rb = 0.56 - 0.2 * (i / NR), rt = rb - 0.03;
    const prof = [[rb * 0.8, 0], [rb, hh * 0.18], [rb * 1.03, hh * 0.5], [rt * 0.98, hh * 0.85], [rt * 0.78, hh]].map(([x, y]) => new THREE.Vector2(x, y));
    const m = mesh(new THREE.LatheGeometry(prof, 22), trunkM[i % 2], lean(y0), y0, 0, palm);
    m.rotation.set((rnd() - 0.5) * 0.08, rnd() * 6, (rnd() - 0.5) * 0.08 - 0.05);
  }
  // root flare + crown ball
  mesh(new THREE.SphereGeometry(0.75, 24, 12, 0, 6.283, 0, Math.PI / 2), trunkM[0], 0, 0, 0, palm).scale.y = 0.5;
  const CX = lean(H), CY = H + 0.15;
  const crown = new THREE.Group(); crown.position.set(CX, CY, 0); palm.add(crown);
  mesh(new THREE.SphereGeometry(0.55, 20, 14), felt(0x55703a, [0.6, 0.6]), 0, 0, 0, crown);
  // fronds: toothed felt leaves, bent down, with a corded midrib
  const leafGeo = (L, wMax) => {
    const sh = new THREE.Shape(), N = 22; sh.moveTo(0, 0);
    for (let i = 1; i <= N; i++) { const x = (L * i) / N, w = wMax * Math.pow(Math.sin(Math.PI * Math.min(0.999, x / L)), 0.6) * (i % 2 ? 1 : 0.62); sh.lineTo(x, w); }
    for (let i = N; i >= 1; i--) { const x = (L * i) / N, w = wMax * Math.pow(Math.sin(Math.PI * Math.min(0.999, x / L)), 0.6) * (i % 2 ? 0.62 : 1); sh.lineTo(x, -w); }
    sh.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 2, steps: 1 });
    g.translate(0, 0, -0.03); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setY(i, p.getY(i) + 0.55 * x - 0.32 * x * x / L * 1.6); }
    g.computeVertexNormals();
    return g;
  };
  const frondM = [felt(0x4f7a3a, [0.7, 0.7]), felt(0x6b9446, [0.7, 0.7]), felt(0x3f6634, [0.7, 0.7])];
  const ribM = felt(0xb7c98a, [0.3, 0.3]);
  const FRONDS = [];
  for (let i = 0; i < 11; i++) {
    const L = 3.2 + rnd() * 1.0, piv = new THREE.Group(); crown.add(piv);
    const yaw = (i / 11) * 6.283 + rnd() * 0.3, pitch = (i % 3) * 0.1 - 0.05;
    piv.rotation.set(0, yaw, 0);
    const tilt = new THREE.Group(); piv.add(tilt); tilt.rotation.z = pitch;
    const m = mesh(leafGeo(L, 0.62 + rnd() * 0.15), frondM[i % 3], 0.2, 0, 0, tilt);
    const rib = new THREE.CatmullRomCurve3(Array.from({ length: 8 }, (_, k) => { const x = (k / 7) * L; return new THREE.Vector3(x + 0.2, 0.55 * x - 0.32 * x * x / L * 1.6 + 0.07, 0); }));
    mesh(new THREE.TubeGeometry(rib, 24, 0.05, 6, false), ribM, 0, 0, 0, tilt);
    FRONDS.push({ tilt, pitch, ph: rnd() * 6.283, L });
  }
  // date clusters: felt balls hung under the crown; some fall in s6/s7
  const dateG = new THREE.SphereGeometry(0.17, 14, 10); dateG.scale(1, 1.35, 1);
  const dateM = felt(0xffffff, [0.3, 0.3], { bump: 0.8 });
  const DATES = [];
  const CL = [0.5, 2.6, 4.4];
  CL.forEach((ca, ci) => {
    const cx = CX + Math.cos(ca) * 0.65, cz = -Math.sin(ca) * 0.65;
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), felt(0xd99a3a, [0.2, 0.2]), cx * 0.7 + CX * 0.3, CY - 0.6, cz * 0.7, palm).rotation.set(Math.sin(ca) * 0.5, 0, Math.cos(ca) * 0.5);
    for (let k = 0; k < 13; k++) {
      const ring = Math.floor(k / 5), a = (k % 5) * 1.256 + ring * 0.6, rr = 0.36 - ring * 0.1;
      DATES.push({ home: new THREE.Vector3(cx + Math.cos(ca) * 0.15 + Math.cos(a) * rr, CY - 0.95 - ring * 0.34, cz - Math.sin(ca) * 0.15 + Math.sin(a) * rr), drop: Infinity, col: new THREE.Color([0xb5562a, 0x8a3f1f, 0xc9772f, 0x9c4a22][(k + ci) % 4]) });
    }
  });
  const dates = new THREE.InstancedMesh(dateG, dateM, DATES.length); dates.castShadow = true; dates.frustumCulled = false; scene.add(dates);
  DATES.forEach((d, i) => dates.setColorAt(i, d.col));
  // assign drop times: K.drops (s6 harvest, then a few after "pertolongan" in s7)
  const drops = K.drops || [];
  const order = DATES.map((_, i) => i).sort((a, b) => ((a * 7) % 13) - ((b * 7) % 13) || a - b);
  drops.forEach((td, j) => { if (j < order.length) DATES[order[j]].drop = td; });

  // ---------- shawl: soft blue felt, pooled at the palm's foot, one corner leaning on the trunk
  const shawlP = (u, v, out) => {
    const L = Math.pow(1 - clamp01(v / 0.3), 2), mid = Math.pow(Math.sin(Math.PI * u), 1.6);
    const x = (u - 0.5) * 3.3 * (1 - 0.5 * L * mid) + 0.1;
    const z = 0.6 + v * 2.5;
    let y = 0.06 + L * 0.85 * mid;
    y += (0.07 + 0.05 * v) * (0.5 + 0.5 * Math.sin(u * 19 + v * 2.2 + 1.3 * Math.sin(v * 5))) * (0.4 + v);
    y += 0.05 * Math.sin(v * 11 + u * 3);
    y -= 0.06 * Math.sin(Math.PI * clamp01((u - 0.2) / 0.6)) * Math.sin(Math.PI * clamp01((v - 0.4) / 0.5));
    return out.set(x, Math.max(0.05, y), z);
  };
  const shTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#4f80c8"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "multiply"; g.drawImage(FC, 0, 0, 512, 512); g.globalCompositeOperation = "source-over";
    g.strokeStyle = "#d9e8ff"; g.lineWidth = 4; g.setLineDash([16, 12]); g.strokeRect(26, 26, w - 52, h - 52); g.setLineDash([]);
    g.strokeStyle = "rgba(40,70,130,.5)"; g.lineWidth = 3; g.strokeRect(46, 46, w - 92, h - 92);
    g.fillStyle = "#f2d38a"; for (let i = 0; i < 6; i++) { const x = 80 + i * 70; g.beginPath(); g.moveTo(x, 470); g.lineTo(x + 14, 456); g.lineTo(x + 28, 470); g.lineTo(x + 14, 484); g.fill(); }
  });
  const shG = new THREE.PlaneGeometry(1, 1, 48, 40);
  { const p = shG.attributes.position, uv = shG.attributes.uv; for (let i = 0; i < p.count; i++) { shawlP(uv.getX(i), 1 - uv.getY(i), tv); p.setXYZ(i, tv.x, tv.y, tv.z); } shG.computeVertexNormals(); }
  const shawlM = new THREE.MeshPhysicalMaterial({ map: shTex, bumpMap: fibB(2, 2), bumpScale: 1.2, roughness: 1, sheen: 0.5, sheenRoughness: 0.6, sheenColor: new THREE.Color(0x7fa6dc), side: THREE.DoubleSide });
  mesh(shG, shawlM);
  // felt pom-poms along the front hem
  const pomM = felt(0xf2d38a, [0.3, 0.3]);
  for (let i = 0; i < 9; i++) { shawlP(0.06 + i * 0.11, 1, tv); mesh(new THREE.SphereGeometry(0.11, 12, 8), pomM, tv.x, tv.y + 0.02, tv.z + 0.1); }

  // ---------- lantern (brass felt + warm glass) by the shawl
  const lan = new THREE.Group(); lan.position.set(-2.35, 0, 1.9); scene.add(lan);
  const brass = felt(0xc8963c, [0.4, 0.4], { extra: { sheenColor: new THREE.Color(0xffe2a0) } });
  mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.18, 20), brass, 0, 0.09, 0, lan);
  const glassM = new THREE.MeshStandardMaterial({ color: 0xffd28a, emissive: 0xffa840, emissiveIntensity: 2.2, roughness: 0.4, transparent: true, opacity: 0.92 });
  const glass = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.62, 20), glassM, 0, 0.5, 0, lan); glass.castShadow = false;
  for (let k = 0; k < 4; k++) { const a = k * 1.571 + 0.785; mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.66, 6), brass, Math.cos(a) * 0.27, 0.5, Math.sin(a) * 0.27, lan); }
  mesh(new THREE.ConeGeometry(0.4, 0.34, 20), brass, 0, 0.98, 0, lan);
  mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 20), brass, 0, 1.24, 0, lan);
  const lanL = new THREE.PointLight(0xffaa55, 9, 11, 1.6); lanL.position.set(-2.35, 0.7, 2.1); lanL.castShadow = false; scene.add(lanL);

  // ---------- AUDIRA: a tiny embroidered cotton tag sewn on a felt rock beside the shawl
  const rock = mesh(new THREE.SphereGeometry(1, 28, 16), felt(0x8c7a9a, [0.8, 0.8]), -3.7, 0.3, 4.3); rock.scale.set(1.15, 0.7, 0.85);
  const tagTex = canvasTex(400, 150, (g, w, h) => {
    g.fillStyle = "#f6efe0"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(120,100,70,.08)"; g.lineWidth = 1; for (let x = 0; x < w; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = "#2f6f73"; g.setLineDash([12, 8]); g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20); g.setLineDash([]);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 74px Quicksand, sans-serif";
    g.fillStyle = "#1f5458"; g.fillText("AUDIRA", w / 2 + 2, h / 2 + 4);
    g.fillStyle = "#2f7f84"; g.fillText("AUDIRA", w / 2, h / 2 + 2);
    g.save(); g.globalCompositeOperation = "source-atop"; g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 1.5; for (let x = -h; x < w; x += 5) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h * 0.6, 0); g.stroke(); } g.restore();
  });
  const tag = mesh(new THREE.PlaneGeometry(1.15, 0.43), new THREE.MeshStandardMaterial({ map: tagTex, roughness: 0.95, side: THREE.DoubleSide }), -3.55, 0.36, 5.2);
  tag.rotation.set(-0.35, 0.2, 0.04); tag.castShadow = false;

  // ---------- the stream: a felt ribbon that sews itself out from under the palm (s5) and keeps flowing
  const strC = new THREE.CatmullRomCurve3([[1.0, -0.5], [2.8, 0.2], [3.6, 2.1], [3.3, 4.3], [4.0, 6.8], [5.9, 9.6], [8.6, 12.4], [11.5, 15.2]].map(([x, z]) => new THREE.Vector3(x, 0.05, z)));
  const NSS = 160, sPos = new Float32Array((NSS + 1) * 2 * 3), sUV = new Float32Array((NSS + 1) * 2 * 2), sIdx = [];
  const strW = (u) => 0.32 + 0.5 * Math.min(1, u * 3) + 0.25 * u;
  for (let i = 0; i <= NSS; i++) {
    const u = i / NSS, p = strC.getPointAt(u), tg = strC.getTangentAt(u), nx = -tg.z, nz = tg.x, w = strW(u);
    sPos.set([p.x + nx * w, 0.06, p.z + nz * w, p.x - nx * w, 0.06, p.z - nz * w], i * 6);
    sUV.set([u * 14, 0, u * 14, 1], i * 4);
    if (i < NSS) { const a = i * 2; sIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const sG = new THREE.BufferGeometry(); sG.setAttribute("position", new THREE.BufferAttribute(sPos, 3)); sG.setAttribute("uv", new THREE.BufferAttribute(sUV, 2)); sG.setIndex(sIdx); sG.computeVertexNormals();
  const waterTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "#4f9fd0"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "multiply"; g.drawImage(FC, 0, 0, 256, 128); g.globalCompositeOperation = "source-over";
    g.lineCap = "round";
    for (const [y, c, lw] of [[30, "#9fd6f2", 7], [64, "#c8ecff", 5], [98, "#9fd6f2", 7]]) { g.strokeStyle = c; g.lineWidth = lw; g.setLineDash([26, 18]); g.beginPath(); for (let x = -10; x <= w + 10; x += 4) { const yy = y + 7 * Math.sin((x / w) * Math.PI * 4); x < -6 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
    g.setLineDash([]); g.fillStyle = "#3a7fb4"; g.fillRect(0, 0, w, 7); g.fillRect(0, h - 7, w, 7);
  }, [1, 1]);
  const waterM = new THREE.MeshPhysicalMaterial({ map: waterTex, roughness: 0.75, sheen: 0.8, sheenColor: new THREE.Color(0xc8ecff), emissive: 0x2a6a9a, emissiveIntensity: 0.25 });
  const stream = mesh(sG, waterM); stream.castShadow = false;
  // felt pebbles lining the banks, appear with the stream
  const BANK = [];
  for (let i = 0; i < 40; i++) { const u = 0.03 + (i / 40) * 0.95, side = i % 2 ? 1 : -1, p = strC.getPointAt(u), tg = strC.getTangentAt(u), w = strW(u) + 0.18; BANK.push({ u, x: p.x - tg.z * w * side, z: p.z + tg.x * w * side, s: 0.12 + rnd() * 0.12 }); }
  const bankM = felt(0xa59bb0, [0.3, 0.3]);
  const bank = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), bankM, BANK.length); bank.frustumCulled = false; bank.castShadow = true; scene.add(bank);
  // a felt cup by the stream (s6 "minum")
  const cup = new THREE.Group(); cup.position.set(1.35, 0, 4.25); scene.add(cup);
  const cupProf = [[0, 0], [0.3, 0], [0.34, 0.06], [0.4, 0.55], [0.36, 0.56], [0.3, 0.1], [0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(new THREE.LatheGeometry(cupProf, 24), felt(0xc0623e, [0.6, 0.3]), 0, 0, 0, cup);
  mesh(new THREE.CircleGeometry(0.33, 24), new THREE.MeshStandardMaterial({ color: 0x8fd0f0, emissive: 0x2a6a9a, emissiveIntensity: 0.3, roughness: 0.5 }), 0, 0.46, 0, cup).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283; stitch(new THREE.Vector3(1.35 + Math.cos(a) * 0.395, 0.38, 4.25 + Math.sin(a) * 0.395), new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), 0.1, -3, 0.022); }
  const CUPST0 = STI.length - 16;

  // ---------- the call (QS 19:24): soft rings of light rippling out from the ground under the palm
  const ringM = [0, 1, 2, 3].map(() => new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const RINGS = ringM.map((m) => { const g = new THREE.RingGeometry(0.92, 1, 96); g.rotateX(-Math.PI / 2); const o = new THREE.Mesh(g, m); o.position.set(0.4, 0.09, 0.8); scene.add(o); return o; });
  const glowTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, "rgba(255,240,205,1)"); gr.addColorStop(0.4, "rgba(255,225,170,.45)"); gr.addColorStop(1, "rgba(255,220,160,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.set(0.5, 0.5, 1); glow.scale.set(3.4, 3.4, 1); scene.add(glow);
  const callL = new THREE.PointLight(0xfff0c8, 0, 9, 1.5); callL.position.set(0.5, 0.6, 1.2); scene.add(callL);

  // ---------- stitches instanced (built last so all are collected)
  const capG = new THREE.CapsuleGeometry(1, 1, 3, 6);
  const threadM = new THREE.MeshStandardMaterial({ color: 0xf6ead2, roughness: 0.85, emissive: 0x3a3426, emissiveIntensity: 0.4 });
  const sti = new THREE.InstancedMesh(capG, threadM, STI.length); sti.frustumCulled = false; scene.add(sti);
  const setStitch = (i, sc) => {
    const o = STI[i];
    fq.setFromUnitVectors(UPV, o.d);
    if (sc <= 0.001) fm.compose(tv.set(0, -60, 0), fq, fs.set(0.001, 0.001, 0.001));
    else fm.compose(o.p, fq, fs.set(o.r0 * sc, (o.len / 3) * sc, o.r0 * sc));
    sti.setMatrixAt(i, fm);
  };
  for (let i = 0; i < STI.length; i++) setStitch(i, STI[i].rev === -1 ? 1 : 0);

  // ---------- drifting wool lint on the wind
  const NL = 70, LINT = Array.from({ length: NL }, () => ({ x: rnd() * 40 - 20, y: 0.5 + rnd() * 9, z: -12 + rnd() * 22, v: 0.4 + rnd() * 0.6, ph: rnd() * 6.283 }));
  const lint = pts(scene, NL, { color: 0xfff1da, size: 0.13, add: false, opacity: 0.75 });

  // ---------- timing
  const tSway = A("s6:goyanglah"), tSway2 = A("s7:bergoyang");
  const tCall = A("s5:diseru"), tCall2 = A("s5:janganlah");
  const tS0 = A("s5:Tuhanmu") - 0.2, tS1 = A("s5:bawahmu") + 0.4;
  const tCup = A("s6:minum") - 0.15;
  const tSign = A("s2:sebelah") - 0.2;
  const tSigns = [A("s3:tanda"), A("s3:rahmat")];
  const tLow = A("s4:alangkah");
  const sway = (t) => {
    const a1 = ramp(t, tSway - 0.1, tSway + 0.5) * (1 - ramp(t, tSway + 3.6, tSway + 6.5)) * 0.085;
    const a2 = ramp(t, tSway2 - 0.05, tSway2 + 0.3) * (1 - ramp(t, tSway2 + 0.9, tSway2 + 2.2)) * 0.012;
    const w = 0.004 * Math.sin(t * 0.9) + 0.003 * Math.sin(t * 2.3 + 1);
    return { z: a1 * Math.sin((t - tSway) * 4.2) + a2 * Math.sin((t - tSway2) * 9) + w, x: 0.35 * a1 * Math.sin((t - tSway) * 4.2 + 0.8) + 0.5 * w };
  };
  const homeAt = (d, t) => { const s = sway(t); return tv.copy(d.home).applyEuler(fe.set(s.x, 0, s.z)); };
  const LAND = DATES.map((d, i) => { const u = 0.28 + ((i * 0.618) % 1) * 0.44, v = 0.48 + ((i * 0.381) % 1) * 0.36; return shawlP(u, v, new THREE.Vector3()).add(new THREE.Vector3(0, 0.2, 0)); });
  const datesIn = (t) => DATES.reduce((n, d) => n + (t >= d.drop + FT ? 1 : 0), 0);

  // ---------- camera: one continuous move (Catmull-Rom over time keys)
  const cTrack = track([
    [0, -13, 4.4, 30, 0, 3.2, 0],
    [K.s1e - 0.6, -9.5, 3.9, 25, 0, 3.0, 0],
    [K.s2 + 1.6, -1.5, 15, 27, -4, 0.8, -8.5],
    [A("s2:timur"), 0.5, 14, 25, -3.5, 0.6, -7],
    [A("s2:Di") + 1.0, 3, 9, 24, -0.5, 2.4, -1.5],
    [K.s3 + 1.0, -6, 5.6, 27, 0, 3.4, 0],
    [K.s3e - 0.5, -11, 7.5, 24, 0, 3.6, 0],
    [K.s4 + 1.4, -6, 11.5, 27, -1.5, 1.6, -3],
    [A("s4:Saat") + 0.6, -4.4, 3.4, 13.5, 0, 1.25, 0.8],
    [K.s4e - 0.4, -3.2, 2.9, 11.2, 0.2, 1.15, 0.9],
    [K.s5 + 1.0, -2.5, 6.5, 14, 1.2, 1.5, 1.5],
    [K.s5e - 0.4, -0.5, 8.5, 17.5, 2.0, 1.2, 3.0],
    [tSway + 0.8, -6, 6.2, 25, 0, 3.9, 0],
    [A("s6:Maka") + 0.4, -3.6, 4.4, 13, 0.6, 1.0, 1.8],
    [K.s6e, -2.6, 4.0, 12, 0.8, 0.9, 2.0],
    [K.s7 + 2.0, 7, 6.8, 25, 0, 3.6, 0],
    [K.s7e - 0.5, 11, 8.5, 24, 0, 3.7, 0],
    [K.s8 + 1.5, 4, 4.4, 25, 0, 4.2, -1],
    [K.end, 0.5, 3.5, 23, 0, 4.8, -2],
    [K.dur, 0.3, 3.45, 22.6, 0, 4.85, -2],
  ]);

  const cBg = new THREE.Color(), cNight = new THREE.Color(0x141c3c), cDawn = new THREE.Color(0xe9b9a2);
  const hNs = new THREE.Color(0x7a8ad0), hDs = new THREE.Color(0xffd9c0), hNg = new THREE.Color(0x2a2238), hDg = new THREE.Color(0x8a6450);

  return (t) => {
    const [px, py, pz, lx, ly, lz] = cTrack(t);
    cam.position.set(px, py, pz); cam.lookAt(lx, ly, lz);

    // night -> dawn (pre-dawn lift through s7, sunrise in s8)
    const dn = 0.12 * ramp(t, K.s7, K.s8) + 0.88 * ramp(t, K.s8 - 0.3, K.s8 + 5.0);
    cBg.copy(cNight).lerp(cDawn, dn); scene.background.copy(cBg); scene.fog.color.copy(cBg);
    hemi.color.copy(hNs).lerp(hDs, dn); hemi.groundColor.copy(hNg).lerp(hDg, dn); hemi.intensity = 0.9 + 0.5 * dn;
    moon.intensity = 1.6 * (1 - dn) + 0.2; sunL.intensity = 2.2 * dn; fill.intensity = 1.1 * dn;
    dawnM.opacity = dn; skyM.opacity = 1;
    moonMesh.position.y = 30 + 6 * dn; moonM.emissiveIntensity = 0.35 * (1 - dn);
    sunMesh.position.y = -6 + 20 * ramp(t, K.s8 + 0.3, K.end + 0.5);

    // stars: twinkle, the three big ones brighten on "tanda" and "rahmat", fade at dawn
    const sB = 0.6 * ramp(t, tSigns[0] - 0.1, tSigns[0] + 0.4) * (1 - ramp(t, K.s4, K.s4 + 1)) + 0.5 * ramp(t, tSigns[1] - 0.1, tSigns[1] + 0.4) * (1 - ramp(t, K.s4, K.s4 + 1));
    starM.emissiveIntensity = (0.9 + 0.8 * sB) * (1 - 0.85 * dn);
    STARS.forEach((o, i) => {
      const tw = 1 + 0.08 * Math.sin(t * 2.1 + o.ph), big = o.big ? 1 + 0.35 * sB * back(clamp01((t - tSigns[i % 2]) / 0.5)) : 1;
      const s = o.s * tw * big * (1 - 0.7 * dn);
      const p = starPos(o); fe.set(0, Math.atan2(-p.x, -p.z + 6), 0);
      fm.compose(p, fq.setFromEuler(fe), fs.set(s, s, s)); stars.setMatrixAt(i, fm);
    });
    stars.instanceMatrix.needsUpdate = true;

    // village windows glow (night only)
    winM.emissiveIntensity = 1.6 * (1 - dn);

    // path stitches sewn in s2 + felt strip + needle at the tip
    const pu = clamp01((t - tP0) / (tP1 - tP0));
    for (let i = 0; i < NPS; i++) { const o = STI[PST0 + i]; setStitch(PST0 + i, back(clamp01((t - o.rev) / 0.22), 2.2)); }
    pathG.setDrawRange(0, Math.floor(NPSeg * pu) * 6);
    if (pu > 0 && pu < 1 && t < tP1 + 0.2) {
      needle.visible = true; const p = pathC.getPointAt(Math.max(0.001, pu)), tg = pathC.getTangentAt(Math.max(0.001, pu));
      const bob = Math.abs(Math.sin(t * 14));
      needle.position.set(p.x, 0.05 + 0.35 * bob, p.z);
      needle.quaternion.setFromUnitVectors(UPV, tv.set(tg.x * 0.9, 0.55, tg.z * 0.9).normalize());
    } else needle.visible = false;
    // signpost pops up on "sebelah"
    const sg = back(clamp01((t - tSign) / 0.5), 2.0);
    sign.scale.set(1, Math.max(0.001, sg), 1); sign.visible = sg > 0.001;

    // palm sway + frond flutter in the wind
    const s = sway(t);
    palm.rotation.set(s.x, 0, s.z);
    const gust = 0.5 + 0.5 * Math.sin(t * 0.37);
    const lag = s.z * 2.2;
    FRONDS.forEach((f, i) => { f.tilt.rotation.z = f.pitch + 0.05 * Math.sin(t * 1.3 + f.ph) * (0.6 + 0.6 * gust) - lag * Math.cos(i) * 0.5 - (tLow < t && t < K.s5 ? 0.04 * ramp(t, tLow, tLow + 1) : 0); f.tilt.rotation.x = 0.04 * Math.sin(t * 1.1 + f.ph * 2) * gust; });
    palm.updateMatrixWorld(true);

    // dates: hang, fall (gravity curve), land in the shawl with a felt bounce
    for (let i = 0; i < DATES.length; i++) {
      const d = DATES[i];
      let x, y, z, sq = 1;
      if (t < d.drop) { homeAt(d, t); x = tv.x; y = tv.y; z = tv.z; }
      else {
        homeAt(d, d.drop); const sx = tv.x, sy = tv.y, sz = tv.z, L = LAND[i];
        const u = (t - d.drop) / FT;
        if (u < 1) { x = sx + (L.x - sx) * u; z = sz + (L.z - sz) * u; y = sy + (L.y - sy) * u * u; }
        else { const tb = t - d.drop - FT; x = L.x; z = L.z; y = L.y + 0.32 * Math.abs(Math.sin(Math.PI * tb / 0.3)) * Math.exp(-tb * 6); sq = 1 - 0.25 * Math.exp(-tb * 14); }
      }
      fe.set(0.3 * Math.sin(i), i * 0.7, 0); fq.setFromEuler(fe);
      fm.compose(fs.set(x, y, z), fq, tv.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))); dates.setMatrixAt(i, fm);
    }
    dates.instanceMatrix.needsUpdate = true;

    // lantern flicker (dims a little on "alangkah", warms again with the call)
    const low = 0.35 * ramp(t, tLow, tLow + 0.8) * (1 - ramp(t, tCall, tCall + 1.5));
    const fl = 1 + 0.06 * Math.sin(t * 9.1) + 0.04 * Math.sin(t * 13.7 + 1) + 0.03 * Math.sin(t * 23.3);
    lanL.intensity = 9 * fl * (1 - low) * (1 - 0.5 * dn); glassM.emissiveIntensity = 2.2 * fl * (1 - low) * (1 - 0.4 * dn);

    // the call: rings + glow from below
    let gl = 0;
    RINGS.forEach((m, k) => {
      const t0 = k < 3 ? tCall + k * 0.55 : tCall2 + 0.1;
      const u = (t - t0) / 2.4;
      if (u <= 0 || u >= 1) { m.visible = false; return; }
      m.visible = true; const sc = 0.5 + 5.5 * Math.pow(u, 0.7); m.scale.set(sc, 1, sc); m.material.opacity = 0.5 * Math.sin(Math.PI * u) * (1 - u * 0.4);
    });
    gl = ramp(t, tCall - 0.2, tCall + 0.6) * (1 - ramp(t, K.s5e - 1.5, K.s6 + 0.5)) * 0.85;
    glow.material.opacity = 0.45 * gl * (0.85 + 0.15 * Math.sin(t * 3)); callL.intensity = 5 * gl;

    // stream sews itself out, then keeps flowing
    const su = ramp(t, tS0, tS1);
    sG.setDrawRange(0, Math.floor(NSS * su) * 6); stream.visible = su > 0.002;
    waterTex.offset.x = -t * 0.55;
    BANK.forEach((o, i) => { const g = back(clamp01((su - o.u) * 8), 2.2), sc = Math.max(0.0001, o.s * g); fm.compose(tv.set(o.x, o.s * 0.4, o.z), fq.identity(), fs.set(sc, sc * 0.6, sc)); bank.setMatrixAt(i, fm); });
    bank.instanceMatrix.needsUpdate = true;

    // cup pops up on "minum"
    const cg = back(clamp01((t - tCup) / 0.45), 2.4);
    cup.scale.setScalar(Math.max(0.001, cg)); cup.visible = cg > 0.001;
    for (let i = 0; i < 16; i++) setStitch(CUPST0 + i, cg > 0.9 ? 1 : 0);

    // lint drifting with the wind
    for (let i = 0; i < NL; i++) {
      const o = LINT[i]; const x = ((o.x + 20 + t * o.v * (0.6 + 0.4 * gust)) % 40) - 20;
      lint.pos[i * 3] = x; lint.pos[i * 3 + 1] = o.y + 0.4 * Math.sin(t * 0.8 + o.ph); lint.pos[i * 3 + 2] = o.z + 0.5 * Math.sin(t * 0.5 + o.ph * 2);
    }
    lint.m.opacity = 0.75 * (1 - 0.5 * dn); lint.commit();
    sti.instanceMatrix.needsUpdate = true;

    bp.strength = 0.3 + 0.1 * gl; bp.threshold = 0.82;
    comp.render();
  };
}
