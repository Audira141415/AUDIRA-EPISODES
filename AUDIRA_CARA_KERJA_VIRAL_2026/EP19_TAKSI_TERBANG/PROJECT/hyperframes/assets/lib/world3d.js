// EP19 TAKSI TERBANG. POLYVERSE look: a flat-shaded pastel low-poly world (lake test base, pine hills, toy city across the water).
// Five generic lift+cruise eVTOLs (no logos) rise from hex pads, transition to wing-borne flight and loop the lake in a V.
// A sixth "demo" aircraft at the AUDIRA pad explains the mechanism (s3-s5): lift rotors + downwash, pusher + wing airflow,
// rotor stop, x-ray flight computer with RPM bars and one failed motor. Then satellite + datalinks over the formation,
// battery vs jet-fuel energy blocks on the apron, a map view (range ring, route), and the formation again for the payoff.
// Every value is a pure function of t. 1 unit = 1 m. Aircraft local frame: forward +x, up +y.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, smooth } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const flat = (color, rough = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.02, flatShading: true, ...extra });
const C = { ink: 0x2a3342, cream: 0xf7f2e8, coral: 0xff7a6b, teal: 0x2bb5a6, butter: 0xf4c55a, lav: 0xa29bfe, mint: 0x7fdcb0, red: 0xe8574a };

// ---------- terrain ----------
const LAKE = { cx: 0, cz: -430, rx: 540, rz: 390 };
const lakeD = (x, z) => { const a = (x - LAKE.cx) / LAKE.rx, b = (z - LAKE.cz) / LAKE.rz; return Math.sqrt(a * a + b * b) + 0.035 * Math.sin(x * 0.013 + 1.7) + 0.03 * Math.sin(z * 0.017 + 0.4); };
const nz = (x, z) => Math.sin(x * 0.011 + Math.sin(z * 0.007) * 2) * Math.cos(z * 0.013 + 0.5) + 0.5 * Math.sin(x * 0.031 + z * 0.023 + 2.1);
const baseZone = (x, z) => x > -150 && x < 150 && z > -60 && z < 130;
function hgt(x, z) {
  const d = lakeD(x, z);
  if (d < 1) return -1.5 - 7 * clamp01((1 - d) * 4);
  let h = 0.9 + 0.8 * clamp01((d - 1) * 9);
  const r = Math.hypot(x - LAKE.cx, (z - LAKE.cz) * 1.15);
  h += 4 * clamp01((d - 1.08) * 3) * (0.5 + 0.5 * nz(x, z));
  h += clamp01((r - 780) / 650) * (70 + 55 * nz(x * 0.6, z * 0.6));
  if (baseZone(x, z)) h = lerp(h, 1.0, 1);
  return h;
}

function integ(f, t, dt = 0.05) { let s = 0; for (let x = 0; x < t; x += dt) { const h = Math.min(dt, t - x); s += f(x + h * 0.5) * h; } return s; }

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.82;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(32, W / H, 0.5, 14000);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    pilot: A_("s1:pilot", 5),
    menerbangkan: A_("s2:menerbangkan", s.s2 + 3), evtol: A_("s2:eVTOL", s.s2 + 6), empat: A_("s2:Empat", s.s2 + 9), otomatis: A_("s2:otomatis", s.s2 + 11), pesawatnya: A_("s2:Pesawatnya", s.s2 + 12), bukan: A_("s2:bukan", s.s2 + 14),
    kunci: A_("s3:Kuncinya", s.s3), rotor: A_("s3:rotor", s.s3 + 2.5), diputar: A_("s3:diputar", s.s3 + 4), udara: A_("s3:Udara", s.s3 + 6.5), naik: A_("s3:naik", s.s3 + 8),
    kedua: A_("s4:Kedua", s.s4), pendorong: A_("s4:pendorong", s.s4 + 1), melaju: A_("s4:melaju", s.s4 + 3), udara4: A_("s4:udara", s.s4 + 4), mengangkat: A_("s4:mengangkat", s.s4 + 6.5), begitu: A_("s4:Begitu", s.s4 + 7.5), berhenti: A_("s4:berhenti", s.s4 + 9), hemat: A_("s4:hemat", s.s4 + 11),
    otak: A_("s5:Otaknya", s.s5), mengatur: A_("s5:mengatur", s.s5 + 3), mati: A_("s5:mati", s.s5 + 6), menambah: A_("s5:menambah", s.s5 + 7), navigasi: A_("s5:Navigasi", s.s5 + 9), satelit: A_("s5:satelit", s.s5 + 12.5), radio: A_("s5:radio", s.s5 + 14),
    kenapa: A_("s6:Kenapa", s.s6), baterai: A_("s6:Baterai", s.s6 + 2), kilo: A_("s6:kilo", s.s6 + 3), puluhan: A_("s6:puluhan", s.s6 + 5), energi: A_("s6:energi", s.s6 + 7), jangkauan: A_("s6:Jangkauan", s.s6 + 8), dua6: A_("s6:dua", s.s6 + 10),
    kunshan: A_("s7:Kunshan", s.s7), memimpin: A_("s7:memimpin", s.s7 + 3), empat7: A_("s7:empat", s.s7 + 4), carry: A_("s7:CarryAll", s.s7 + 6), indonesia: A_("s7:Indonesia", s.s7 + 8),
    naik8: A_("s8:Naik", s.s8), terbang8: A_("s8:terbang", s.s8 + 2), komputer8: A_("s8:komputer", s.s8 + 4),
  };

  const S = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.25;
  const hemi = new THREE.HemisphereLight(0xd6ecff, 0xc8e3b0, 1.25); S.add(hemi);
  S.add(new THREE.AmbientLight(0xfff1e6, 0.25));
  const sunDir = v3(0.55, 0.62, 0.56).normalize();
  const sun = new THREE.DirectionalLight(0xffe4c2, 2.7);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 600 });
  S.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xbfe3ff, 0.55); fill.position.set(-0.6, 0.4, -0.7); S.add(fill);

  // ---------- sky ----------
  const skyTex = canvasTex(8, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#7fb9e6"); g.addColorStop(0.3, "#a9d3f0"); g.addColorStop(0.46, "#f6dcc6"); g.addColorStop(0.5, "#ffd2b4"); g.addColorStop(0.56, "#cfe3d0"); g.addColorStop(1, "#9fcfa8");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(9000, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, toneMapped: false, depthWrite: false, fog: false }));
  S.add(sky);
  S.fog = new THREE.Fog(0xf2dccb, 700, 3200);

  // ---------- terrain (non-indexed, one colour per facet) ----------
  {
    const g = new THREE.PlaneGeometry(4400, 4400, 120, 120); g.rotateX(-Math.PI / 2); g.translate(0, 0, -400);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, hgt(p.getX(i), p.getZ(i)));
    const ng = g.toNonIndexed(); const q = ng.attributes.position; const col = new Float32Array(q.count * 3);
    const R = mulberry(19), cc = new THREE.Color();
    const grass = ["#86d39a", "#74c78c", "#94dba2", "#6cbf86", "#9fdca6"].map((x) => new THREE.Color(x));
    for (let i = 0; i < q.count; i += 3) {
      const x = (q.getX(i) + q.getX(i + 1) + q.getX(i + 2)) / 3, z = (q.getZ(i) + q.getZ(i + 1) + q.getZ(i + 2)) / 3, y = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3;
      const d = lakeD(x, z), rr = R();
      if (d < 1.0) cc.set("#9ed6cf");
      else if (d < 1.05 && !baseZone(x, z)) cc.set(rr > 0.5 ? "#f3e2b6" : "#ecd8a6");
      else if (y > 95) cc.set(rr > 0.5 ? "#f4f1ec" : "#e8e4ee");
      else if (y > 45) cc.set(rr > 0.5 ? "#a6b0c8" : "#b8b2d6");
      else if (baseZone(x, z)) cc.set(rr > 0.5 ? "#a9dca9" : "#9dd5a0");
      else cc.copy(grass[Math.floor(rr * grass.length)]);
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = cc.r; col[(i + k) * 3 + 1] = cc.g; col[(i + k) * 3 + 2] = cc.b; }
    }
    ng.setAttribute("color", new THREE.BufferAttribute(col, 3)); ng.computeVertexNormals();
    const m = new THREE.Mesh(ng, flat(0xffffff, 0.95, { vertexColors: true })); m.receiveShadow = true; S.add(m);
  }
  // ---------- lake water (faceted, bobbing) ----------
  const wg = new THREE.PlaneGeometry(1200, 900, 54, 40).toNonIndexed(); wg.rotateX(-Math.PI / 2); wg.translate(LAKE.cx, 0, LAKE.cz);
  const wPos = wg.attributes.position, wBase = Float32Array.from(wPos.array);
  const water = new THREE.Mesh(wg, flat(0x7fd0e3, 0.22, { metalness: 0.1, envMapIntensity: 1.2 })); water.receiveShadow = true; S.add(water);
  const waterAt = (t) => { for (let i = 0; i < wPos.count; i++) { const x = wBase[i * 3], z = wBase[i * 3 + 2]; wPos.setY(i, 0.45 * Math.sin(x * 0.045 + t * 1.1) + 0.35 * Math.sin(z * 0.06 - t * 0.9 + x * 0.01)); } wPos.needsUpdate = true; wg.computeVertexNormals(); };

  // ---------- trees (instanced low-poly pines) ----------
  {
    const NT = 1100, R = mulberry(41);
    const trunkG = new THREE.CylinderGeometry(0.35, 0.5, 2.4, 5); trunkG.translate(0, 1.2, 0);
    const c1 = new THREE.ConeGeometry(3.0, 5.2, 6); c1.translate(0, 4.6, 0);
    const c2 = new THREE.ConeGeometry(2.1, 4.2, 6); c2.translate(0, 7.4, 0);
    const trunk = new THREE.InstancedMesh(trunkG, flat(0x8a6650), NT), f1 = new THREE.InstancedMesh(c1, flat(0xffffff, 0.85), NT), f2 = new THREE.InstancedMesh(c2, flat(0xffffff, 0.85), NT);
    const pines = ["#3fae78", "#2f9a6a", "#4fc088", "#36a070", "#5bc78f"].map((x) => new THREE.Color(x));
    const dm = new THREE.Object3D(); let n = 0, guard = 0;
    while (n < NT && guard++ < 20000) {
      const x = (R() - 0.5) * 2600, z = -1500 + R() * 2100;
      const d = lakeD(x, z);
      if (d < 1.07 || baseZone(x, z) || (x > -110 && x < 330 && z > -60 && z < 90)) continue;
      const y = hgt(x, z); if (y > 70) continue;
      if (z < -820 && z > -1250 && Math.abs(x) < 560) continue; // city
      const sc = 0.8 + R() * 0.9;
      dm.position.set(x, y - 0.2, z); dm.rotation.set(0, R() * 6.28, 0); dm.scale.set(sc, sc * (0.9 + R() * 0.4), sc); dm.updateMatrix();
      trunk.setMatrixAt(n, dm.matrix); f1.setMatrixAt(n, dm.matrix); f2.setMatrixAt(n, dm.matrix);
      const pc = pines[Math.floor(R() * pines.length)]; f1.setColorAt(n, pc); f2.setColorAt(n, pc.clone().offsetHSL(0, 0, 0.05));
      n++;
    }
    for (const m of [trunk, f1, f2]) { m.count = n; m.castShadow = true; m.receiveShadow = true; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; S.add(m); }
  }
  // ---------- toy city across the lake ----------
  {
    const NB = 170, R = mulberry(73);
    const bg = new THREE.BoxGeometry(1, 1, 1); bg.translate(0, 0.5, 0);
    const rg = new THREE.ConeGeometry(0.75, 0.5, 4); rg.rotateY(Math.PI / 4); rg.translate(0, 0.25, 0);
    const blds = new THREE.InstancedMesh(bg, flat(0xffffff, 0.75), NB), roofs = new THREE.InstancedMesh(rg, flat(0xffffff, 0.7), NB);
    const pal = ["#fbe3cf", "#ffd0c2", "#cfe7f5", "#d9d2f7", "#fff1c9", "#c9eedd", "#f7f2e8"].map((x) => new THREE.Color(x));
    const dm = new THREE.Object3D();
    for (let i = 0; i < NB; i++) {
      const x = (R() - 0.5) * 1000, z = -880 - R() * 320, cen = 1 - Math.min(1, Math.abs(x) / 520);
      const hh = 14 + R() * 30 + cen * cen * R() * 90, wd = 16 + R() * 18, dp = 16 + R() * 18, y = Math.max(0.5, hgt(x, z)) - 0.5;
      dm.position.set(x, y, z); dm.rotation.set(0, (R() - 0.5) * 0.3, 0); dm.scale.set(wd, hh, dp); dm.updateMatrix(); blds.setMatrixAt(i, dm.matrix);
      dm.position.y = y + hh; dm.scale.set(wd * 1.3, R() > 0.5 ? 9 : 0.01, dp * 1.3); dm.updateMatrix(); roofs.setMatrixAt(i, dm.matrix);
      const pc = pal[Math.floor(R() * pal.length)]; blds.setColorAt(i, pc); roofs.setColorAt(i, new THREE.Color(R() > 0.5 ? "#ff9d8a" : "#8fb8d8"));
    }
    for (const m of [blds, roofs]) { m.castShadow = true; m.receiveShadow = true; m.instanceColor.needsUpdate = true; S.add(m); }
  }
  // ---------- low-poly clouds ----------
  const clouds = [];
  {
    const R = mulberry(5), cm = flat(0xffffff, 0.95, { emissive: 0xffffff, emissiveIntensity: 0.12 });
    for (let i = 0; i < 16; i++) {
      const g = new THREE.Group();
      for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(14 + R() * 12, 0), cm); m.position.set((k - 2) * 16 + R() * 6, R() * 8, (R() - 0.5) * 14); m.scale.y = 0.65; g.add(m); }
      g.position.set((R() - 0.5) * 2600, 190 + R() * 160, -1600 + R() * 1900); g.userData.x0 = g.position.x; S.add(g); clouds.push(g);
    }
  }

  // ---------- test base: hex pads, hangar, AUDIRA pad ----------
  const label = (w, h, draw) => canvasTex(w, h, draw);
  const hTex = (txt) => label(512, 512, (c, w) => {
    c.fillStyle = "#ece7dd"; c.fillRect(0, 0, w, w);
    c.strokeStyle = "#f4c55a"; c.lineWidth = 22; c.beginPath(); c.arc(w / 2, w / 2, w * 0.4, 0, 6.283); c.stroke();
    c.fillStyle = "#2a3342"; c.font = "800 230px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("H", w / 2, w / 2 - (txt ? 24 : 0));
    if (txt) { c.font = "800 62px Arial, sans-serif"; c.fillStyle = "#ff7a6b"; c.fillText(txt, w / 2, w * 0.74); }
  });
  const padM = flat(0xdfdad0, 0.7), padTop = new THREE.MeshStandardMaterial({ map: hTex(""), roughness: 0.7 });
  const mkPad = (x, z, rad, top) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 1.06, 0.6, 6), padM); p.position.set(x, 1.3, z); p.receiveShadow = true; S.add(p);
    const d = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.84, 6), top); d.rotation.x = -Math.PI / 2; d.rotation.z = Math.PI / 6; d.position.set(x, 1.62, z); d.receiveShadow = true; S.add(d);
  };
  const FOFF = [[0, 0, 0], [-16, 3, 14], [-16, 3, -14], [-32, 6, 28], [-32, 6, -28]];
  FOFF.forEach((o, i) => mkPad(o[0], o[2], i === 0 ? 9 : 7, padTop));
  const DEMO0 = v3(46, 1.6, 44);
  mkPad(DEMO0.x, DEMO0.z, 8, new THREE.MeshStandardMaterial({ map: hTex("AUDIRA"), roughness: 0.7 }));
  // apron slab
  { const a = new THREE.Mesh(new THREE.CylinderGeometry(120, 124, 0.8, 8), flat(0xd3d8cf, 0.9)); a.position.set(0, 0.6, 30); a.scale.z = 0.55; a.receiveShadow = true; S.add(a); }
  // quonset hangar (faceted half cylinder), door faces -z, AUDIRA sign
  {
    const hg = new THREE.Group(); hg.position.set(-22, 1.0, 74); S.add(hg);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 34, 9, 1, true, -Math.PI / 2, Math.PI), flat(0xf3eadb, 0.6, { side: THREE.DoubleSide }));
    shell.rotation.x = Math.PI / 2; shell.castShadow = shell.receiveShadow = true; hg.add(shell);
    const front = new THREE.Mesh(new THREE.CircleGeometry(13, 9, 0, Math.PI), flat(0xffb4a2, 0.7)); front.position.z = -17; front.rotation.y = Math.PI; hg.add(front);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(14, 8.5), flat(0x3a4458, 0.8)); door.position.set(0, 4.25, -17.05); door.rotation.y = Math.PI; hg.add(door);
    const sTex = label(1024, 256, (c, w, h) => {
      c.fillStyle = "#2a3342"; c.beginPath(); c.roundRect(6, 6, w - 12, h - 12, 40); c.fill();
      c.fillStyle = "#ffffff"; c.font = "800 150px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("AUDIRA", w / 2 - 70, h / 2 + 6);
      c.fillStyle = "#f4c55a"; c.font = "700 46px Arial, sans-serif"; c.fillText("UJI", w - 120, h / 2 - 22); c.fillText("TERBANG", w - 120, h / 2 + 30);
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshStandardMaterial({ map: sTex, roughness: 0.5, emissive: 0xffffff, emissiveMap: sTex, emissiveIntensity: 0.15 }));
    sign.position.set(0, 10.6, -17.2); sign.rotation.y = Math.PI; hg.add(sign);
  }
  // windsock (low-poly cone that swings)
  const sock = new THREE.Group(); sock.position.set(70, 1, 6); S.add(sock);
  { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 9, 5), flat(0xdedede)); pole.position.y = 4.5; sock.add(pole); }
  const sockC = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.6, 6, 1, true).rotateZ(Math.PI / 2).translate(-1.8, 0, 0), flat(C.coral, 0.7, { side: THREE.DoubleSide })); sockC.position.y = 8.6; sock.add(sockC);

  // ---------- aircraft ----------
  const ROT = [[3.0, 2.0], [1.45, 2.0], [-2.0, 2.0], [-3.55, 2.0], [3.0, -2.0], [1.45, -2.0], [-2.0, -2.0], [-3.55, -2.0]];
  const FY = 1.2, WY = 1.86, BY = 1.45, RY = 2.1;
  function bladeGeo(len, w0, w1) {
    const sh = new THREE.Shape(); sh.moveTo(0, -w0 / 2); sh.lineTo(len, -w1 / 2); sh.lineTo(len + 0.04, 0); sh.lineTo(len, w1 / 2); sh.lineTo(0, w0 / 2); sh.lineTo(0, -w0 / 2);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1 }); g.rotateX(Math.PI / 2); return g;
  }
  const bladeG = bladeGeo(0.7, 0.17, 0.09), pushBladeG = bladeGeo(0.82, 0.2, 0.1);
  const fusG = (() => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const y = -3.05 + (i / 16) * 6.0;
      let rr = y < -1 ? 0.26 + 0.49 * smooth((y + 3.05) / 2.05) : y < 1.6 ? 0.75 : 0.75 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 1.6) / 1.35, 2)));
      if (i === 16) rr = 0;
      pts.push(new THREE.Vector2(rr, y));
    }
    pts.unshift(new THREE.Vector2(0, -3.05));
    const g = new THREE.LatheGeometry(pts, 8); g.rotateZ(-Math.PI / 2); g.scale(1, 0.95, 0.85); g.computeVertexNormals(); return g;
  })();
  const wingG = (() => {
    const sh = new THREE.Shape(); sh.moveTo(0.62, -5.0); sh.lineTo(0.78, 0); sh.lineTo(0.62, 5.0); sh.lineTo(0.3, 5.25); sh.lineTo(-0.52, 5.15); sh.lineTo(-0.66, 0); sh.lineTo(-0.52, -5.15); sh.lineTo(0.3, -5.25); sh.lineTo(0.62, -5.0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.07, bevelSegments: 1 }); g.rotateX(Math.PI / 2); return g;
  })();
  const finG = (() => { const sh = new THREE.Shape(); sh.moveTo(0.4, 0); sh.lineTo(-0.35, 0); sh.lineTo(-0.75, 1.25); sh.lineTo(-0.25, 1.25); sh.lineTo(0.4, 0); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 }); g.translate(0, 0, -0.035); return g; })();
  const stabG = (() => { const sh = new THREE.Shape(); sh.moveTo(0.25, -2.3); sh.lineTo(0.25, 2.3); sh.lineTo(-0.45, 2.3); sh.lineTo(-0.45, -2.3); sh.lineTo(0.25, -2.3); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.04, bevelSegments: 1 }); g.rotateX(Math.PI / 2); return g; })();
  const podG = (() => { const sh = new THREE.Shape(); const w = 2.4, h = 0.75, rr = 0.22; sh.moveTo(-w / 2 + rr, -h / 2); sh.lineTo(w / 2 - rr, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr); sh.lineTo(w / 2, h / 2 - rr); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2); sh.lineTo(-w / 2 + rr, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr); sh.lineTo(-w / 2, -h / 2 + rr); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 1, curveSegments: 2 }); g.translate(0, 0, -0.35); return g; })();
  const discG = new THREE.CircleGeometry(0.74, 20).rotateX(-Math.PI / 2);
  const pdiscG = new THREE.CircleGeometry(0.88, 20).rotateY(Math.PI / 2);

  function makeCraft(o) {
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); inner.scale.setScalar(o.scale || 1);
    const bodyM = flat(C.cream, 0.42, { metalness: 0.05, envMapIntensity: 1.1 }), accM = flat(o.accent, 0.5, o.accent === C.butter ? { metalness: 0.1, emissive: C.butter, emissiveIntensity: 0.12 } : {}), darkM = flat(C.ink, 0.35), wingM = flat(0xfdfaf3, 0.45);
    const add = (geo, mat, x, y, z, parent = inner) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    add(fusG, bodyM, 0, FY, 0);
    { const band = add(new THREE.CylinderGeometry(0.775, 0.775, 0.32, 8, 1, true).rotateZ(Math.PI / 2).scale(1, 0.95, 0.85), accM, 1.0, FY, 0); band.material = accM; }
    add(new THREE.IcosahedronGeometry(0.28, 0), darkM, 2.62, FY + 0.12, 0);
    add(wingG, wingM, -0.05, WY + 0.14, 0);
    add(new THREE.BoxGeometry(1.2, 0.35, 0.5), bodyM, -0.05, WY - 0.2, 0);
    for (const z of [2.0, -2.0]) {
      add(new THREE.CylinderGeometry(0.13, 0.13, 8.1, 6).rotateZ(Math.PI / 2), bodyM, -0.4, BY, z);
      const fin = add(finG, accM, -4.15, BY + 0.1, z); fin.scale.set(1, 1, 1);
    }
    add(stabG, accM, -4.7, BY + 1.38, 0);
    for (const z of [0.55, -0.55]) { add(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 5).rotateZ(Math.PI / 2), darkM, 0, 0.08, z); for (const x of [1.1, -1.1]) add(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 5), darkM, x, 0.42, z * 0.85); }
    if (o.pod) add(podG, flat(C.butter, 0.5, { metalness: 0.1, emissive: C.butter, emissiveIntensity: 0.1 }), -0.1, 0.38, 0);
    if (o.tank) { add(new THREE.CylinderGeometry(0.36, 0.36, 2.4, 8).rotateZ(Math.PI / 2), flat(C.red, 0.5), -0.1, 0.42, 0); }
    const lift = ROT.map(([x, z]) => {
      add(new THREE.CylinderGeometry(0.06, 0.08, RY - BY, 5), darkM, x, (RY + BY) / 2 - 0.1, z);
      const motorM = flat(C.ink, 0.35, { emissive: 0x000000 });
      add(new THREE.CylinderGeometry(0.15, 0.17, 0.26, 8), motorM, x, RY - 0.08, z);
      const bl = new THREE.Group(); bl.position.set(x, RY + 0.08, z); inner.add(bl);
      for (const a of [0, Math.PI]) { const b = new THREE.Mesh(bladeG, darkM); b.rotation.y = a; b.castShadow = true; bl.add(b); }
      const hub = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 6), accM); hub.position.y = 0.06; bl.add(hub);
      const discM = new THREE.MeshBasicMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      const disc = new THREE.Mesh(discG, discM); disc.position.set(x, RY + 0.09, z); inner.add(disc);
      return { bl, disc, discM, motorM, x, z };
    });
    const pb = new THREE.Group(); pb.position.set(-3.2, FY, 0); inner.add(pb);
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(pushBladeG, darkM); b.rotation.set(0, 0, 0); const holder = new THREE.Group(); holder.rotation.x = (k * 2 * Math.PI) / 3; b.rotation.z = Math.PI / 2; b.rotation.y = Math.PI / 2; holder.add(b); pb.add(holder); }
    { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8).rotateZ(Math.PI / 2), accM); sp.position.set(-3.3, FY, 0); inner.add(sp); }
    const pdM = new THREE.MeshBasicMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const pdisc = new THREE.Mesh(pdiscG, pdM); pdisc.position.set(-3.22, FY, 0); inner.add(pdisc);
    return { g, inner, lift, pb, pdM, bodyM, wingM, accM, scale: o.scale || 1 };
  }
  const setRotors = (cr, aL, rL, aP, rP, per) => {
    const al = (a, rpm) => lerp(a, Math.round(a / Math.PI) * Math.PI, clamp01(1 - rpm * 1.4));
    cr.lift.forEach((ro, i) => {
      const rr = per ? per[i] : rL; ro.bl.rotation.y = al(aL * (1 + i * 0.013) + i * 0.7 * clamp01(rr * 3), rr);
      ro.discM.opacity = 0.16 * clamp01((rr - 0.25) * 2);
    });
    cr.pb.rotation.x = rP > 0.02 ? aP : lerp(aP, Math.round(aP / (2 * Math.PI / 3)) * (2 * Math.PI / 3), 1);
    cr.pdM.opacity = 0.18 * clamp01((rP - 0.25) * 2);
  };

  const ACC = [0x2bb5a6, C.butter, C.coral, C.butter, C.coral];
  const fleet = FOFF.map((o, i) => { const cr = makeCraft({ accent: ACC[i], scale: i === 0 ? 1.35 : 1, pod: i === 1 || i === 3, tank: i === 2 || i === 4 }); S.add(cr.g); return cr; });
  const demo = makeCraft({ accent: C.lav, scale: 1 }); S.add(demo.g);

  // ---------- FX materials ----------
  const flowMat = (col, dir) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uOp: { value: 0 }, uC: { value: new THREE.Color(col) } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vU;uniform float uT,uOp;uniform vec3 uC;void main(){float s=fract(${dir}*5.-uT*1.6);float d=smoothstep(0.,.1,s)*(1.-smoothstep(.35,.7,s));float e=smoothstep(0.,.12,vU.y)*smoothstep(1.,.75,vU.y);gl_FragColor=vec4(uC*(1.+.6*d),clamp(uOp*e*(.18+.82*d),0.,1.));}` });
  // downwash cones under demo lift rotors
  const washM = flowMat(0xa8dcf0, "(1.-vU.y)");
  const washG = new THREE.CylinderGeometry(0.72, 1.15, 3.4, 14, 1, true); washG.translate(0, -1.7, 0);
  ROT.forEach(([x, z]) => { const m = new THREE.Mesh(washG, washM); m.position.set(x, RY - 0.05, z); m.frustumCulled = false; demo.inner.add(m); });
  // airflow over the wing (s4), local frame, moving backwards (-x)
  const airM = flowMat(0x9fe6ff, "(1.-vU.x)");
  const airM2 = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: airM.uniforms, vertexShader: airM.vertexShader,
    fragmentShader: "varying vec2 vU;uniform float uT,uOp;uniform vec3 uC;void main(){float s=fract(vU.x*7.+uT*1.8);float d=smoothstep(0.,.08,s)*(1.-smoothstep(.3,.6,s));float e=smoothstep(0.,.1,vU.x)*smoothstep(1.,.85,vU.x);gl_FragColor=vec4(uC*(1.+.7*d),clamp(uOp*e*(.2+.8*d),0.,1.));}" });
  const airGroup = new THREE.Group(); demo.inner.add(airGroup);
  for (let i = 0; i < 14; i++) {
    const z = -4.6 + (i / 13) * 9.2, y0 = WY + 0.05 + (i % 3) * 0.18; const pts = [];
    for (let k = 0; k <= 40; k++) { const x = 7 - k * 0.35; const bump = Math.exp(-Math.pow((x - 0.05) / 0.9, 2)) * 0.32 * (1 - Math.abs(z) / 6); pts.push(v3(x, y0 + bump - (x < -0.7 ? (x + 0.7) * 0.04 : 0), z)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.028, 5), airM2); m.frustumCulled = false; airGroup.add(m);
  }
  // force arrows
  const arrow = (col) => { const g = new THREE.Group(); const m = flat(col, 0.4, { emissive: col, emissiveIntensity: 0.35 }); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 6).translate(0, 0.5, 0), m); sh.name = "sh"; const hd = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 6).translate(0, 0.25, 0), m); hd.name = "hd"; g.add(sh, hd); return g; };
  const setArrow = (a, len) => { a.visible = len > 0.02; a.getObjectByName("sh").scale.y = Math.max(0.001, len); a.getObjectByName("hd").position.y = len; };
  const rotArrows = ROT.map(([x, z]) => { const a = arrow(C.coral); a.position.set(x, RY + 0.25, z); demo.inner.add(a); return a; });
  const wingArrows = [3.6, -3.6].map((z) => { const a = arrow(C.teal); a.position.set(-0.05, WY + 0.25, z); demo.inner.add(a); return a; });
  const thrustArrow = arrow(C.butter); thrustArrow.rotation.z = -Math.PI / 2; thrustArrow.position.set(-2.6, FY + 1.05, 0); demo.inner.add(thrustArrow);
  // flight computer + wires + RPM bars (s5)
  const chipTex = label(256, 128, (c, w, h) => { c.fillStyle = "#1f8f84"; c.fillRect(0, 0, w, h); c.strokeStyle = "#bff7ee"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = "#ffffff"; c.font = "800 44px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FBW", w / 2, h / 2); });
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.6), [0, 0, 1, 0, 0, 0].map((k) => k ? new THREE.MeshStandardMaterial({ map: chipTex, emissive: 0xffffff, emissiveMap: chipTex, emissiveIntensity: 0.6 }) : flat(C.teal, 0.4, { emissive: C.teal, emissiveIntensity: 0.6 })));
  chip.position.set(1.7, FY + 0.1, 0); demo.inner.add(chip);
  const wireMs = [], wires = new THREE.Group(); demo.inner.add(wires);
  const pulseMat = () => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uOp: { value: 0 }, uC: { value: new THREE.Color(0x52f0d8) } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vU;uniform float uT,uOp;uniform vec3 uC;void main(){float s=fract(vU.x*4.-uT*1.3);float d=smoothstep(0.,.05,s)*(1.-smoothstep(.12,.3,s));gl_FragColor=vec4(uC*(1.+1.5*d),clamp(uOp*(.35+.65*d),0.,1.));}" });
  [...ROT, [-3.2, 0]].forEach(([x, z], i) => {
    const pts = i < 8 ? [v3(1.7, FY + 0.1, 0), v3(0.6, FY + 0.45, z * 0.15), v3(0.1, WY - 0.05, z * 0.5), v3(0, BY + 0.05, z), v3(x, BY + 0.1, z), v3(x, RY - 0.1, z)] : [v3(1.7, FY + 0.1, 0), v3(0, FY + 0.2, 0), v3(-3.0, FY, 0)];
    const m = pulseMat(); wireMs.push(m);
    const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), 60, 0.035, 5), m); tb.frustumCulled = false; wires.add(tb);
  });
  const barG = new THREE.BoxGeometry(0.22, 1, 0.22); barG.translate(0, 0.5, 0);
  const bars = ROT.map(([x, z]) => { const m = new THREE.Mesh(barG, flat(C.butter, 0.4, { emissive: C.butter, emissiveIntensity: 0.4 })); m.position.set(x, RY + 0.45, z); demo.inner.add(m); return m; });

  // ---------- satellite + datalinks (s5) ----------
  const sat = new THREE.Group(); S.add(sat);
  {
    const panelTex = label(256, 128, (c, w, h) => { c.fillStyle = "#4d6fb8"; c.fillRect(0, 0, w, h); c.strokeStyle = "#a9c4ff"; c.lineWidth = 3; for (let x = 0; x <= w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
    const body = new THREE.Mesh(new THREE.OctahedronGeometry(3.2, 0), flat(C.butter, 0.45, { metalness: 0.15, emissive: C.butter, emissiveIntensity: 0.15 })); body.scale.set(1, 1.2, 1); sat.add(body);
    for (const sx of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 3.6), [0, 0, 1, 1, 0, 0].map((k) => k ? new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.3, metalness: 0.2 }) : flat(0xd8dde6))); p.position.x = sx * 7.6; sat.add(p); }
    const dish = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.2, 8, 1, true), flat(0xf3f3f3, 0.4, { side: THREE.DoubleSide })); dish.position.y = -4.2; sat.add(dish);
  }
  const linkGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true); linkGeo.translate(0, 0.5, 0);
  const linkMat = (col) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uOp: { value: 0 }, uC: { value: new THREE.Color(col) } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vU;uniform float uT,uOp;uniform vec3 uC;void main(){float s=fract(vU.y*6.-uT*1.4);float d=step(.5,s);float k=smoothstep(.0,.15,s)*(1.-smoothstep(.35,.5,s));gl_FragColor=vec4(uC*(1.+k),clamp(uOp*(.25+.75*k)*(.4+.6*d),0.,1.));}" });
  const beamM = linkMat(0xffd66b), dlM = linkMat(0x7ff0ff);
  const beams = fleet.map(() => { const m = new THREE.Mesh(linkGeo, beamM); m.frustumCulled = false; S.add(m); return m; });
  const PAIRS = [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]];
  const links = PAIRS.map(() => { const m = new THREE.Mesh(linkGeo, dlM); m.frustumCulled = false; S.add(m); return m; });
  const UP = v3(0, 1, 0), tq = new THREE.Quaternion(), tv = new THREE.Vector3();
  const placeLink = (m, a, b, rad) => { tv.subVectors(b, a); const L = tv.length(); m.position.copy(a); tq.setFromUnitVectors(UP, tv.normalize()); m.quaternion.copy(tq); m.scale.set(rad, L, rad); };

  // ---------- battery vs jet fuel energy blocks (s6) on the apron ----------
  const BX = -60, BZ1 = 27.5, BZ2 = 21.5;
  const energyM = flat(C.butter, 0.4, { metalness: 0.1, emissive: C.butter, emissiveIntensity: 0.35 });
  const cubeG = new THREE.IcosahedronGeometry(0.62, 0);
  const NE = 40;
  const fuelCubes = new THREE.InstancedMesh(cubeG, energyM, NE); fuelCubes.frustumCulled = false; fuelCubes.castShadow = true; S.add(fuelCubes);
  const battCube = new THREE.Mesh(cubeG, energyM); battCube.castShadow = true; S.add(battCube);
  const exhibit = new THREE.Group(); S.add(exhibit);
  {
    const plM = flat(0xf7f2e8, 0.6);
    for (const z of [BZ1, BZ2]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 1.2, 6), plM); p.position.set(BX, 1.6, z); p.castShadow = p.receiveShadow = true; exhibit.add(p); }
    const batt = new THREE.Mesh(podG, flat(C.teal, 0.45)); batt.scale.set(0.75, 1.6, 1.6); batt.position.set(BX, 2.95, BZ1); batt.castShadow = true; exhibit.add(batt);
    for (const zz of [-0.35, 0.35]) { const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 6), flat(zz > 0 ? C.coral : C.ink, 0.4)); tm.position.set(BX + 0.4, 3.75, BZ1 + zz); exhibit.add(tm); }
    const can = new THREE.Mesh(podG, flat(C.coral, 0.45)); can.scale.set(0.62, 2.3, 1.3); can.position.set(BX, 3.3, BZ2); can.castShadow = true; exhibit.add(can);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.7, 6), flat(C.ink, 0.4)); spout.position.set(BX + 0.5, 4.5, BZ2 + 0.3); spout.rotation.x = 0.5; exhibit.add(spout);
    const mkLab = (txt, sub, z) => {
      const tx = label(768, 220, (c, w, h) => { c.fillStyle = "rgba(42,51,66,.92)"; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 34); c.fill(); c.fillStyle = "#fff"; c.font = "800 92px Arial, sans-serif"; c.textBaseline = "middle"; c.fillText(txt, 34, h * 0.38); c.fillStyle = "#f4c55a"; c.font = "700 52px Arial, sans-serif"; c.fillText(sub, 36, h * 0.76); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.32), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false })); m.position.set(BX + 0.4, 6.6, z); m.rotation.y = Math.PI / 2; exhibit.add(m); return m;
    };
    exhibit.userData.l1 = mkLab("1 kg", "BATERAI", BZ1);
    exhibit.userData.l2 = mkLab("1 kg", "BAHAN BAKAR JET", BZ2);
  }

  // ---------- map overlay (range ring, route, chevrons) ----------
  const ringM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, uniforms: { uOp: { value: 0 }, uC: { value: new THREE.Color(C.coral) } },
    vertexShader: "varying vec2 vU;varying vec3 vP;void main(){vU=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec3 vP;uniform float uOp;uniform vec3 uC;void main(){float a=atan(vP.y,vP.x);float d=step(.45,fract(a*18./6.2832));gl_FragColor=vec4(uC,uOp*(.35+.65*d));}" });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.975, 1.0, 128, 1), ringM); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 40, 0); ring.renderOrder = 5; S.add(ring);
  const ringFill = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: C.coral, transparent: true, opacity: 0, depthWrite: false, depthTest: false })); ringFill.rotation.x = -Math.PI / 2; ringFill.position.set(0, 38, 0); ringFill.renderOrder = 4; S.add(ringFill);
  const sprite = (txt, col, w = 512, h = 160) => { const tx = label(w, h, (c) => { c.fillStyle = col; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 40); c.fill(); c.fillStyle = "#fff"; c.font = "800 92px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, w / 2, h / 2 + 4); }); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false, toneMapped: false })); sp.renderOrder = 8; S.add(sp); return sp; };
  const ringLab = sprite("± 200 km", "#ff7a6b");
  const baseLab = sprite("BASIS UJI", "#2a3342", 560, 150);
  const routeR = 420, RC = v3(LAKE.cx, 0, LAKE.cz + 10);
  const routeM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, uniforms: { uP: { value: 0 }, uOp: { value: 0 }, uT: { value: 0 } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vU;uniform float uP,uOp,uT;void main(){if(vU.x>uP)discard;float d=step(.4,fract(vU.x*60.-uT*.8));vec3 c=mix(vec3(1.,.48,.42),vec3(1.,.85,.4),d);gl_FragColor=vec4(c,uOp);}" });
  const routePts = []; for (let i = 0; i <= 200; i++) { const a = (i / 200) * Math.PI * 2; routePts.push(v3(RC.x + routeR * Math.sin(a), 45, RC.z + routeR * Math.cos(a))); }
  const route = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(routePts), 400, 7, 6), routeM); route.renderOrder = 6; route.frustumCulled = false; S.add(route);
  const chevG = (() => { const sh = new THREE.Shape(); sh.moveTo(1, 0); sh.lineTo(-0.7, 0.65); sh.lineTo(-0.35, 0); sh.lineTo(-0.7, -0.65); sh.lineTo(1, 0); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); return g; })();
  const chevs = fleet.map((_, i) => { const m = new THREE.Mesh(chevG, new THREE.MeshBasicMaterial({ color: ACC[i], transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 9; S.add(m); return m; });

  // ---------- post: NaN guard -> bloom -> output -> warm documentary grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,60.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.16, 0.35, 2.6);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c*=mix(vec3(.96,1.,1.04),vec3(1.04,1.,.94),smoothstep(.15,.75,l));c=(c-.5)*1.04+.5;gl_FragColor=vec4(clamp(c,0.,1.),1.);}" })));

  // ================= choreography =================
  // formation: hover-climb at the base in s1, accelerate along a loop round the lake from s2
  const VF = 42;
  const vF = (t) => VF * ramp(t, E.menerbangkan - 0.8, E.menerbangkan + 5.5);
  const altF = (t) => 6 + 26 * eout(clamp01(t / (s.s1e + 1.5))) + 14 * ramp(t, E.menerbangkan, E.otomatis + 2);
  const liftF = (t) => 1 - ramp(t, E.empat - 0.5, E.otomatis + 0.3);
  const pushF = (t) => ramp(t, E.menerbangkan - 1.2, E.menerbangkan);
  const PC = v3(0, 0, -routeR);
  const fFrame = (t) => {
    const sd = integ(vF, t), th = sd / routeR;
    const pos = v3(PC.x + routeR * Math.sin(th), altF(t), PC.z + routeR * Math.cos(th));
    const fwd = v3(Math.cos(th), 0, -Math.sin(th)), lat = v3(Math.sin(th), 0, Math.cos(th)); // lat: outward from the lake (+z at start)
    return { pos, fwd, lat, th, sd };
  };
  // demo aircraft
  const vD = (t) => 22 * ramp(t, E.melaju - 0.6, E.berhenti) * (1 - ramp(t, s.s5 - 0.2, E.mengatur + 1.2));
  const liftD = (t) => (t < s.s5 ? ramp(t, E.rotor - 0.6, E.diputar) * (1 - ramp(t, E.begitu, E.berhenti + 0.3)) : ramp(t, E.otak + 0.6, E.mengatur + 0.3));
  const pushD = (t) => ramp(t, E.pendorong - 0.4, E.pendorong + 0.6) * (1 - 0.75 * ramp(t, E.mengatur, E.mengatur + 1.5));
  const yD = (t) => DEMO0.y + 15 * eout(ramp(t, E.udara - 0.3, E.naik + 1.8)) + 7 * ramp(t, E.melaju, E.berhenti + 1);
  const dPos = (t) => v3(DEMO0.x + integ(vD, t), yD(t), DEMO0.z - 26 * ramp(t, E.melaju, E.berhenti + 2));

  // camera tracks: world W, demo-relative D, formation-relative F (fwd, up, lat)
  const CW = track([
    [0, 60, 10, -60, 0, 10, 0],
    [s.s6 - 0.4, BX + 46, 12, 22, BX - 6, 3, 24.5],
    [E.baterai, BX + 40, 9, 24.5, BX - 6, 3, 24.5],
    [E.puluhan, BX + 40, 12, 24.8, BX - 20, 1.5, 24.5],
    [E.energi, BX + 38, 16, 25.2, BX - 34, 0.5, 24.5],
    [E.jangkauan, 0, 2300, 260, 0, 0, -80],
    [E.dua6 + 1.5, 0, 2500, 300, 0, 0, -110],
    [s.s7 + 1.5, 0, 2750, 390, 0, 0, -380],
    [E.memimpin, 0, 2600, 380, 0, 0, -380],
    [s.dur, 0, 2600, 380, 0, 0, -380],
  ]);
  const CD = track([
    [s.s3 - 1, 40, 22, -46, 0, 2, 0],
    [s.s3 + 1, 19, 8, -25, 0, 0.6, 0],
    [E.udara, 14, 4, -22, 0, 1.2, 0],
    [s.s3e, 16, -1.0, -20, 0, 1.6, 0],
    [E.melaju, 3, 4, -26, 0, 3, 0],
    [E.mengangkat, 12, 10, -18, 0, 3, 0],
    [E.berhenti, -5, 8, -21, 0, 3, 0],
    [s.s4e, -9, 6, -21, 0, 3, 0],
    [s.s5 + 1.2, 14, 7, -17, 0, 3, 0],
    [E.mati, 8, 11, -15, -0.2, 3, 0],
    [E.navigasi, 12, 8, -19, 0, 3, 0],
    [s.dur, 12, 8, -19, 0, 3, 0],
  ]);
  const CF = track([
    [0, 40, -2, 17, -10, 4.5, 2],
    [s.s1e, 48, 1, 22, -12, 4.5, 0],
    [E.menerbangkan + 1, 60, 30, 85, -10, 0, 0],
    [E.evtol + 1, -40, 55, 120, -12, 0, 0],
    [E.otomatis, -150, 70, 40, -10, 0, 0],
    [E.pesawatnya + 0.3, -8, 3, -44, -18, 7, -14],
    [E.bukan + 0.6, -2, 2, -40, -18, 7, -14],
    [s.s3, -2, 2, -40, -18, 7, -14],
    [E.navigasi + 1.2, -105, 34, 80, -14, 3, 0],
    [E.satelit, -100, 30, 70, -14, 4, 0],
    [s.s5e, -80, 26, 85, -14, 4, 0],
    [s.s7 - 1, -80, 26, 85, -14, 4, 0],
    [E.memimpin + 0.8, 50, 30, -42, -14, 1, 4],
    [E.empat7 + 0.6, 44, 26, -54, -14, 1, 0],
    [E.carry, -6, 3, 42, -16, 3, 14],
    [E.indonesia + 1, -2, 2.4, 38, -16, 6, 14],
    [s.s8 + 1, -120, 48, 0, -14, 9, 0],
    [s.dur, -175, 62, 10, 0, 12, 0],
  ]);
  const wDf = (t) => ramp(t, E.bukan - 0.2, s.s3 + 0.9) * (1 - ramp(t, E.navigasi - 0.6, E.navigasi + 1.4));
  const wFf = (t) => (1 - ramp(t, E.bukan - 0.2, s.s3 + 0.9)) + ramp(t, E.navigasi - 0.6, E.navigasi + 1.4) * (1 - ramp(t, s.s6 - 0.7, s.s6 + 1.0)) + ramp(t, E.memimpin - 1.2, E.memimpin + 0.6);
  const dmy = new THREE.Object3D(), mtx = new THREE.Matrix4(), qY = new THREE.Quaternion();
  const posCraft = (cr, p, fwd, pitch, roll) => { cr.g.position.copy(p); const yaw = Math.atan2(-fwd.z, fwd.x); cr.g.rotation.set(0, yaw, 0, "YXZ"); cr.g.rotateZ(pitch); cr.g.rotateX(roll); };

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    waterAt(t);
    for (const c of clouds) c.position.x = c.userData.x0 + 3 * t;
    sockC.rotation.y = 0.5 + 0.25 * Math.sin(t * 1.3); sockC.rotation.z = -0.1 + 0.08 * Math.sin(t * 2.1);

    // formation
    const F = fFrame(t), lF = liftF(t), pF = pushF(t);
    const aLF = 2 * Math.PI * 7 * integ(liftF, t), aPF = 2 * Math.PI * 9 * integ(pushF, t);
    const bank = 0.12 * ramp(t, E.menerbangkan + 2, E.menerbangkan + 6);
    const fpos = [];
    fleet.forEach((cr, i) => {
      const o = FOFF[i];
      const bob = 0.25 * Math.sin(t * 1.3 + i * 1.7) * (1 - 0.5 * pF);
      const p = F.pos.clone().addScaledVector(F.fwd, o[0]).addScaledVector(F.lat, o[2]); p.y += o[1] * ramp(t, E.menerbangkan - 1, E.menerbangkan + 3) + bob - (i ? (1 - ramp(t, 0, s.s1e)) * 0 : 0);
      if (i) p.y -= 3 * (1 - ramp(t, 0, s.s1e)) * (i > 2 ? 1 : 0.5);
      posCraft(cr, p, F.fwd, 0, -bank);
      setRotors(cr, aLF + i, lF, aPF + i, pF);
      fpos.push(p);
    });
    // demo
    const D = dPos(t);
    const lD = liftD(t), pD = pushD(t);
    const failK = t >= s.s5 ? ramp(t, E.mati - 0.1, E.mati + 0.6) : 0, boost = t >= s.s5 ? ramp(t, E.menambah - 0.3, E.menambah + 0.5) : 0;
    const per = ROT.map((_, i) => (i === 2 ? lD * (1 - failK) : lD * (1 + 0.35 * boost * (i === 1 || i === 3 || i === 6 ? 1 : 0.3))));
    const aLD = 2 * Math.PI * 7 * integ(liftD, t), aPD = 2 * Math.PI * 9 * integ(pushD, t);
    const wob = failK * (1 - boost) * 0.06 * Math.sin(t * 9);
    posCraft(demo, D, v3(1, 0, -0.35 * ramp(t, E.melaju, E.berhenti + 2) * (1 - ramp(t, E.berhenti + 2, E.berhenti + 4))).normalize(), 0.04 * ramp(t, E.udara4, E.mengangkat) * (1 - ramp(t, E.berhenti, s.s4e)), wob);
    setRotors(demo, aLD, lD, aPD, pD, per);
    demo.lift[2].motorM.emissive.setRGB(1.6 * failK, 0.2 * failK, 0.1 * failK);
    demo.g.visible = t > s.s2 && t < s.s6 + 0.5;
    // demo FX
    const sc3 = t >= s.s3 - 0.5 && t < s.s5e;
    washM.uniforms.uT.value = t; washM.uniforms.uOp.value = sc3 ? 0.28 * ramp(t, E.rotor, E.diputar + 0.4) * clamp01(lD) * (1 - ramp(t, E.melaju, E.melaju + 1.5)) : 0;
    rotArrows.forEach((a, i) => setArrow(a, sc3 ? 1.15 * ramp(t, E.udara - 0.4, E.udara + 0.8) * (1 - ramp(t, E.melaju, E.mengangkat)) * (t < s.s5 ? 1 : 0) : 0));
    const wl = t < s.s5 ? ramp(t, E.mengangkat - 0.6, E.mengangkat + 0.6) * (1 - ramp(t, s.s4e - 0.5, s.s4e + 0.3)) : 0;
    wingArrows.forEach((a) => setArrow(a, 3.2 * wl));
    setArrow(thrustArrow, t < s.s5 ? 2.2 * ramp(t, E.pendorong, E.pendorong + 1) * (1 - ramp(t, s.s4e - 0.5, s.s4e + 0.3)) : 0);
    airM.uniforms.uT.value = t; airM.uniforms.uOp.value = t < s.s5 ? 0.9 * ramp(t, E.udara4 - 0.5, E.udara4 + 0.6) * (1 - ramp(t, s.s4e - 0.6, s.s4e + 0.2)) : 0;
    airGroup.visible = airM.uniforms.uOp.value > 0.01;
    demo.wingM.emissive.setHex(C.teal); demo.wingM.emissiveIntensity = 0.3 * wl;
    // x-ray flight computer (s5)
    const xr = t >= s.s5 - 0.5 && t < s.s6 ? ramp(t, E.otak - 0.2, E.otak + 0.8) * (1 - ramp(t, E.navigasi - 0.5, E.navigasi + 0.5)) : 0;
    for (const m of [demo.bodyM, demo.wingM]) { m.transparent = xr > 0.01; m.opacity = 1 - 0.68 * xr; m.depthWrite = xr < 0.5; }
    chip.visible = wires.visible = xr > 0.01;
    wireMs.forEach((m, i) => { m.uniforms.uT.value = t + i * 0.13; m.uniforms.uOp.value = xr * ramp(t, E.otak + 0.3, E.mengatur); m.uniforms.uC.value.setHex(i === 2 && failK > 0.5 ? 0xff5a4a : 0x52f0d8); });
    bars.forEach((b, i) => { const v = per[i] * (0.8 + 0.2 * Math.sin(t * 7 + i * 1.9)); const on = xr * ramp(t, E.mengatur - 0.3, E.mengatur + 0.5); b.visible = on > 0.02; b.scale.set(on, 0.05 + 1.6 * v * on, on); b.material.emissive.setHex(i === 2 && failK > 0.5 ? 0xff3b30 : C.butter); b.material.color.setHex(i === 2 && failK > 0.5 ? C.red : C.butter); });

    // satellite + links (s5 second half)
    const ln = t >= s.s5 && t < s.s6 + 0.5 ? ramp(t, E.satelit - 0.8, E.satelit + 0.4) * (1 - ramp(t, s.s5e + 0.2, s.s6 + 0.4)) : 0;
    const dl = t >= s.s5 && t < s.s6 + 0.5 ? ramp(t, E.radio - 1.0, E.radio + 0.4) * (1 - ramp(t, s.s5e + 0.2, s.s6 + 0.4)) : 0;
    const satP = F.pos.clone().addScaledVector(F.fwd, 70).addScaledVector(F.lat, -40); satP.y += 16 - 8 * (1 - ln);
    sat.position.copy(satP); sat.rotation.set(0.3, t * 0.25, 0.15); sat.visible = ln > 0.01; sat.scale.setScalar(0.4 + 0.6 * ln);
    beamM.uniforms.uT.value = t; beamM.uniforms.uOp.value = 0.75 * ln; dlM.uniforms.uT.value = t; dlM.uniforms.uOp.value = 0.85 * dl;
    beams.forEach((m, i) => { m.visible = ln > 0.01; placeLink(m, satP.clone().add(v3(0, -4, 0)), fpos[i].clone().add(v3(0, 2.4, 0)), 0.22); });
    links.forEach((m, k) => { m.visible = dl > 0.01; const [a, b] = PAIRS[k]; placeLink(m, fpos[a].clone().add(v3(0, 1.6, 0)), fpos[b].clone().add(v3(0, 1.6, 0)), 0.12); });

    // energy blocks (s6)
    const ex = t > s.s5e - 1 && t < s.s7;
    exhibit.visible = battCube.visible = fuelCubes.visible = ex;
    if (ex) {
      const b1 = ramp(t, E.baterai - 0.3, E.baterai + 0.4);
      battCube.position.set(BX + 3.6, 1.6 + 0.12 * Math.sin(t * 2), BZ1); battCube.scale.setScalar(Math.max(0.001, b1)); battCube.rotation.set(t * 0.4, t * 0.6, 0);
      for (let i = 0; i < NE; i++) {
        const k = clamp01((t - E.puluhan + 0.6 - i * 0.045) / 0.25);
        dmy.position.set(BX + 3.6 - i * 1.1, 1.6 + 0.12 * Math.sin(t * 2 + i * 0.4) + 1.2 * (1 - eout(k)), BZ2 - i * 1.15); dmy.rotation.set(t * 0.4 + i, t * 0.6 + i * 0.3, 0); dmy.scale.setScalar(Math.max(0.001, eout(k))); dmy.updateMatrix(); fuelCubes.setMatrixAt(i, dmy.matrix);
      }
      fuelCubes.instanceMatrix.needsUpdate = true;
    }

    // map mode
    const mp = ramp(t, E.jangkauan - 1.4, E.jangkauan + 0.2) * (1 - ramp(t, E.memimpin - 1.0, E.memimpin + 0.2));
    S.fog.near = lerp(700, 6000, mp); S.fog.far = lerp(3200, 12000, mp);
    const rg = t < s.s7 ? ramp(t, E.jangkauan - 0.2, E.dua6 + 0.4) : 1 - ramp(t, s.s7 - 0.2, s.s7 + 0.8);
    const rr = 30 + 300 * eout(rg);
    ring.scale.set(rr, rr, 1); ringFill.scale.set(rr, rr, 1);
    ringM.uniforms.uOp.value = 0.95 * mp * clamp01(rg * 3); ringFill.material.opacity = 0.14 * mp * clamp01(rg * 3);
    ring.visible = ringFill.visible = mp > 0.01;
    ringLab.position.set(0, 60, -rr * 0.5); ringLab.scale.set(240, 75, 1); ringLab.material.opacity = mp * ramp(t, E.dua6 - 0.2, E.dua6 + 0.3) * (t < s.s7 + 0.6 ? 1 : 0); ringLab.visible = ringLab.material.opacity > 0.01;
    baseLab.position.set(0, 60, 80); baseLab.scale.set(230, 62, 1); baseLab.material.opacity = mp * (t < s.s7 ? 1 : 0); baseLab.visible = mp > 0.01;
    const rp = ramp(t, s.s7 - 0.3, E.memimpin - 0.8);
    routeM.uniforms.uT.value = t; routeM.uniforms.uP.value = rp; routeM.uniforms.uOp.value = mp * clamp01(rp * 5); route.visible = mp > 0.01 && rp > 0;
    chevs.forEach((m, i) => { m.position.set(fpos[i].x, 80, fpos[i].z); m.rotation.set(0, Math.atan2(-F.fwd.z, F.fwd.x), 0); const sc = (i === 0 ? 34 : 26); m.scale.set(sc, sc, sc); m.material.opacity = mp; m.visible = mp > 0.01; });

    // camera blend
    const wD = wDf(t), wF = clamp01(wFf(t)) * (1 - wD), wW = Math.max(0, 1 - wD - wF);
    const cw = CW(t), cd = CD(t), cf = CF(t);
    const pW = v3(cw[0], cw[1], cw[2]), tW = v3(cw[3], cw[4], cw[5]);
    const pDc = D.clone().add(v3(cd[0], cd[1], cd[2])), tD = D.clone().add(v3(cd[3], cd[4], cd[5]));
    const fr = (o) => F.pos.clone().addScaledVector(F.fwd, o[0]).add(v3(0, o[1], 0)).addScaledVector(F.lat, o[2]);
    const pFp = fr(cf), tF = fr([cf[3], cf[4], cf[5]]);
    const P = pW.multiplyScalar(wW).addScaledVector(pDc, wD).addScaledVector(pFp, wF);
    const T = tW.multiplyScalar(wW).addScaledVector(tD, wD).addScaledVector(tF, wF);
    const arc = 4 * wD * (1 - wD) * 70 + 4 * clamp01(wF) * clamp01(1 - wF) * (t > s.s6 - 1 && t < s.s7 + 5 ? 0 : 40);
    P.y += arc;
    P.y = Math.max(P.y, hgt(P.x, P.z) + 2.5);
    cam.position.copy(P); cam.lookAt(T);
    // sun follows the look target so shadows stay crisp around the subject
    sun.target.position.copy(T); sun.position.copy(T).addScaledVector(sunDir, 260);
    sun.shadow.camera.updateProjectionMatrix();
    comp.render();
  };
}
