// EP13 LASER UNDER THE CANOPY. LIDARFORGE, dawn-forest variant: a real instanced rainforest dissolves into a green-gold point cloud,
// the canopy points are peeled away and the warm amber ground returns show ditched geoglyphs (circle, square, avenue).
// Generic twin-engine survey aircraft with a coral laser fan, GNSS satellites and an IMU gizmo. 1 unit = 1 m. Illustration only.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, skyEnv, canvasTex, eout, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const ALT = 1125, VEL = 67;
// geoglyphs baked into the terrain: k c = ditched circle, s = ditched square (r = half side)
const GL = [
  { k: "c", x: 0, z: -95, r: 95 }, { k: "s", x: 0, z: 125, r: 72 },
  { k: "c", x: -385, z: 300, r: 55 }, { k: "c", x: -360, z: -300, r: 72 }, { k: "c", x: -360, z: -300, r: 46 },
  { k: "s", x: 370, z: 340, r: 55 }, { k: "c", x: 300, z: -470, r: 60 },
];
const ROADS = [[0, -190, 0, -640], [0, -2, 0, 55], [-385, 245, -385, 120]];
const MISS = { x: 215, z: -330, r: 48 }; // exists but NOT in the laser data (the "terlewat" ghost)
const HX = -30, HZ = -60; // hero tree for the cutaway

function sdG(g, x, z) {
  const dx = x - g.x, dz = z - g.z;
  if (g.k === "c") return Math.hypot(dx, dz) - g.r;
  const rc = 9, qx = Math.abs(dx) - g.r + rc, qz = Math.abs(dz) - g.r + rc;
  return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - rc;
}
function segD(ax, az, bx, bz, x, z) {
  const vx = bx - ax, vz = bz - az, u = clamp01(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz));
  return Math.hypot(x - ax - vx * u, z - az - vz * u);
}
function terrain(x, z) {
  let h = 4.5 * Math.sin(x / 190 + 1) * Math.cos(z / 230) + 2.2 * Math.sin((x + z) / 97) + 1.1 * Math.sin(x / 41) * Math.sin(z / 53 + 0.5);
  const xv = -560 + 50 * Math.sin(z / 130);
  h -= 9 * Math.exp(-(((x - xv) / 75) ** 2));
  let dit = 0, gt = 0;
  for (const g of GL) {
    const d = sdG(g, x, z);
    if (d > 40 || d < -40) continue;
    const a = Math.exp(-((d / 5.5) ** 2)), b = Math.exp(-(((d - 11) / 4.5) ** 2));
    h += -4.2 * a + 1.5 * b;
    if (a > dit) { dit = a; gt = g.k === "c" ? 1 : 2; }
  }
  for (const [ax, az, bx, bz] of ROADS) {
    const sd = segD(ax, az, bx, bz, x, z);
    if (sd > 30) continue;
    const w = Math.exp(-(((sd - 10) / 3.5) ** 2)), c = Math.exp(-((sd / 6) ** 2));
    h += 1.2 * w - 0.9 * c;
    const a = Math.max(w * 0.8, c * 0.7);
    if (a > dit) { dit = a; gt = 3; }
  }
  return [h, dit, gt];
}
const pasture = (x, z) => clamp01((x - 230 + 14 * Math.sin(z / 37)) / 40) * clamp01((z - 190 + 12 * Math.sin(x / 29)) / 40);

// rounded box (hard surfaces never ship as raw boxes)
function rbox(w, h, d, r) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.absarc(x + ww, y, r, -Math.PI / 2, 0); s.lineTo(x + ww + r, y + hh);
  s.absarc(x + ww, y + hh, r, 0, Math.PI / 2); s.lineTo(x, y + hh + r); s.absarc(x, y + hh, r, Math.PI / 2, Math.PI); s.lineTo(x - r, y); s.absarc(x, y, r, Math.PI, 1.5 * Math.PI);
  const b = Math.min(r, d / 2) * 0.6;
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.8, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * b) / 2);
  return g;
}
function crownGeo(detail, seed) {
  const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, R = mulberry(seed);
  const a = [R() * 6, R() * 6, R() * 6], f = [3 + R() * 3, 3 + R() * 3, 3 + R() * 3];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const r = 1 + 0.16 * Math.sin(f[0] * x + a[0]) * Math.sin(f[1] * y + a[1]) * Math.sin(f[2] * z + a[2]) * 2 + 0.05 * Math.sin(11 * x + 9 * z);
    p.setXYZ(i, x * r, (y < -0.15 ? y * 0.5 : y) * r, z * r);
  }
  g.computeVertexNormals();
  return g;
}


// Monotone cubic track (no overshoot between keys): tangent = harmonic mean of neighbour slopes, 0 at turning points.
function trackM(keys) {
  const n = keys.length, D = keys[0].length;
  const sl = (i, j) => (keys[i + 1][j] - keys[i][j]) / Math.max(0.001, keys[i + 1][0] - keys[i][0]);
  const tan = keys.map((k, i) => k.map((_, j) => {
    if (j === 0) return 0;
    if (i === 0 || i === n - 1) return 0;
    const a = sl(i - 1, j), b = sl(i, j);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    const out = [];
    for (let j = 1; j < D; j++) out.push((2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]);
    return out;
  };
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 1, 140000);
  const s = K;
  const A = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    laser: A("s1:laser", 3.4), ling: A("s1:lingkaran", 4.7),
    acre: A("s2:Acre", 12.4), dit: A("s2:Ditemukan", 16.6), n432: A("s2:432", 17.3), n36: A("s2:36", 20.1),
    terbang: A("s3:terbang", 23.2), km: A("s3:kilometer", 25.7), juta: A("s3:juta", 30.7), kiri: A("s3:kiri", 32.5),
    pulsa: A("s4:pulsa", 34.3), puncak: A("s4:puncak", 37.1), ranting: A("s4:ranting", 37.9), celah: A("s4:celah", 40.5), tanah4: A("s4:tanah", 41.6), waktu: A("s4:Waktu", 42.1),
    gnss: A("s5:GNSS", 44.2), mencatat: A("s5:mencatat", 45.6), imu: A("s5:IMU", 47.2), pantulan: A("s5:pantulan", 49.6), n31: A("s5:31", 52.3), pohon: A("s5:pohon", 55.4),
    kenapa: A("s6:Kenapa", 56.5), atap: A("s6:atap", 60.5), gundul: A("s6:gundul", 63.2), laser6: A("s6:Laser", 63.8), tanah6: A("s6:tanah", 66.8), terlewat: A("s6:terlewat", 68.5),
    matahari: A("s7:matahari", 71.3), parit: A("s7:Parit", 72.5), ling7: A("s7:lingkaran", 75.6), persegi: A("s7:persegi", 76.5), total: A("s7:Totalnya", 77.2),
    adat: A("s8:adat", 86.2),
  };

  const S = new THREE.Scene();
  const SUN = v3(0.85, 0.16, -0.5).normalize();
  const skyU = { uS: { value: SUN.clone() }, uVoid: { value: 0 } };
  S.add(new THREE.Mesh(new THREE.SphereGeometry(60000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform vec3 uS;uniform float uVoid;void main(){vec3 n=normalize(v);float y=max(n.y,0.);
      vec3 c=mix(vec3(1.05,.66,.38),vec3(.20,.30,.48),pow(y,.42));float d=max(dot(n,normalize(uS)),0.);
      c+=vec3(1.,.62,.3)*(pow(d,700.)*18.+pow(d,6.)*.55);
      vec3 vd=mix(vec3(.09,.05,.025),vec3(.012,.012,.02),pow(y,.35));gl_FragColor=vec4(mix(c,vd,uVoid),1.);}`,
  })));
  S.environment = skyEnv(r, 0x4a6890, 0xf0b27a, 0x3a3020, SUN, 0xffc890, 3);
  S.environmentIntensity = 0.55;
  S.fog = new THREE.FogExp2(0xd9a070, 0.0003);
  const sun = new THREE.DirectionalLight(0xffc890, 3.6);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.8;
  Object.assign(sun.shadow.camera, { left: -720, right: 720, top: 720, bottom: -720, near: 10, far: 4000 });
  S.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xb8c8e8, 0x3a2a14, 0.55); S.add(hemi);

  // ---------- shared reveal uniforms (crowns, trunks and points all read them) ----------
  const DU = {
    uFront: { value: -1e5 }, uDir: { value: new THREE.Vector2(0, -1) }, uRad: { value: -1 }, uC: { value: new THREE.Vector2() },
    uRadOn: { value: 0 }, uCutZ: { value: 1e5 }, uCutB: { value: -1e5 }, uEdge: { value: new THREE.Color(1, 0.78, 0.32) },
  };
  const dissolve = (mat) => {
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, DU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vW2;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvec4 wp2=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nwp2=instanceMatrix*wp2;\n#endif\nvW2=(modelMatrix*wp2).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vW2;uniform float uFront,uRad,uRadOn,uCutZ,uCutB;uniform vec2 uDir,uC;uniform vec3 uEdge;
float hide2(){float d=dot(vW2.xz,uDir)-uFront;if(uRadOn>.5)d=min(d,length(vW2.xz-uC)-uRad);return d;}`)
        .replace("void main() {", "void main() {\nfloat hd=hide2()+fract(sin(dot(floor(vW2*.9),vec3(12.9,78.2,37.7)))*43758.5)*7.;if(hd<0.)discard;if(vW2.z>uCutZ||vW2.z<uCutB)discard;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance+=uEdge*smoothstep(9.,0.,hd)*2.2;");
    };
    mat.customProgramCacheKey = () => "ep13dissolve";
    return mat;
  };

  // ---------- ground: terrain mesh with photo / hillshade modes ----------
  const GS = 1240, GN = 372;
  const gGeo = new THREE.PlaneGeometry(GS, GS, GN, GN); gGeo.rotateX(-Math.PI / 2);
  const gp = gGeo.attributes.position, gc = new Float32Array(gp.count * 3), gd = new Float32Array(gp.count), gtA = new Float32Array(gp.count);
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i), [h, dit, gt] = terrain(x, z), pa = pasture(x, z);
    gp.setY(i, h); gd[i] = dit; gtA[i] = gt;
    const fl = [0.06, 0.045, 0.028], ps = [0.42 + 0.05 * Math.sin(x * 0.07), 0.5, 0.2];
    const dd = dit * pa;
    gc[i * 3] = fl[0] * (1 - pa) + (ps[0] * (1 - dd) + 0.24 * dd) * pa;
    gc[i * 3 + 1] = fl[1] * (1 - pa) + (ps[1] * (1 - dd) + 0.28 * dd) * pa;
    gc[i * 3 + 2] = fl[2] * (1 - pa) + (ps[2] * (1 - dd) + 0.1 * dd) * pa;
  }
  gGeo.setAttribute("color", new THREE.BufferAttribute(gc, 3)); gGeo.setAttribute("dit", new THREE.BufferAttribute(gd, 1)); gGeo.setAttribute("gt", new THREE.BufferAttribute(gtA, 1));
  gGeo.computeVertexNormals();
  const GU = { uHill: { value: 0 }, uHSun: { value: v3(-0.5, 0.55, -0.5).normalize() }, uGlowC: { value: 0 }, uGlowS: { value: 0 }, uGlowR: { value: 0 }, uTT: { value: 0 } };
  const gMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  gMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, GU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float dit,gt;varying float vDit,vGt;varying vec3 vWN,vWP;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvDit=dit;vGt=gt;vWN=normalize(mat3(modelMatrix)*objectNormal);vWP=(modelMatrix*vec4(transformed,1.)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vDit,vGt;varying vec3 vWN,vWP;uniform float uHill,uGlowC,uGlowS,uGlowR,uTT;uniform vec3 uHSun;")
      .replace("#include <opaque_fragment>", `#include <opaque_fragment>
{float lam=clamp(dot(normalize(vWN),uHSun),0.,1.);vec3 hs=mix(vec3(.04,.014,.003),vec3(.78,.42,.13),pow(lam,1.35));
float ct=abs(fract(vWP.y/1.2)-.5);hs+=vec3(.3,.13,.03)*smoothstep(.07,0.,ct)*.5;
vec2 gq=abs(fract(vWP.xz/100.)-.5);hs+=vec3(.25,.16,.05)*smoothstep(.004,0.,min(gq.x,gq.y)-.495)*.0;
float gl=vGt<1.5?uGlowC:(vGt<2.5?uGlowS:uGlowR);hs+=vec3(1.,.66,.24)*1.7*vDit*gl*(.85+.15*sin(uTT*5.-length(vWP.xz)*.05));
gl_FragColor.rgb=mix(gl_FragColor.rgb,hs,uHill);}`);
  };
  const ground = new THREE.Mesh(gGeo, gMat); ground.receiveShadow = true; S.add(ground);

  // far canopy plane and a muddy river
  const farTex = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = "#1f3a17"; c.fillRect(0, 0, w, w);
    const R = mulberry(31), cols = ["#2d5a22", "#3a6a2a", "#24481c", "#4a7a30", "#33602a", "#556f2a"];
    for (let i = 0; i < 5200; i++) {
      const x = R() * w, y = R() * w, rr = 4 + R() * 9;
      c.fillStyle = "rgba(10,20,8,.5)"; c.beginPath(); c.arc(x + 2, y + 2, rr, 0, 7); c.fill();
      c.fillStyle = R() < 0.015 ? "#c9a535" : cols[Math.floor(R() * cols.length)]; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill();
    }
  }, [70, 70]);
  const farMat = new THREE.MeshStandardMaterial({ map: farTex, roughness: 0.95 });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(100000, 100000), farMat); far.rotation.x = -Math.PI / 2; far.position.y = -1.5; far.receiveShadow = true; S.add(far);
  {
    const pts = []; for (let x = -45000; x <= 45000; x += 300) pts.push([x, -6500 + 900 * Math.sin(x / 2300) + 380 * Math.sin(x / 770)]);
    const pos = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], w = 130;
      pos.push(x0, 0, z0 - w, x1, 0, z1 - w, x0, 0, z0 + w, x1, 0, z1 - w, x1, 0, z1 + w, x0, 0, z0 + w);
    }
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); rg.computeVertexNormals();
    const river = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: 0x7a5a38, roughness: 0.25, metalness: 0.1, side: THREE.DoubleSide })); river.position.y = -1.2; S.add(river);
  }

  // ---------- forest ----------
  const rnd = mulberry(1313);
  const trees = [];
  for (let gx = -650; gx <= 650; gx += 10.5) for (let gz = -1300; gz <= 650; gz += 10.5) {
    const x = gx + (rnd() - 0.5) * 7, z = gz + (rnd() - 0.5) * 7, pa = pasture(x, z), q = rnd();
    if (pa > 0.15 && q > 0.012) continue;
    if (Math.hypot(x - HX, z - HZ) < 11) continue;
    const em = rnd() < 0.08, th = em ? 29 + rnd() * 8 : 15 + rnd() * 8, cr = em ? 10 + rnd() * 3 : 6.6 + rnd() * 3;
    const near = Math.abs(x) <= 610 && z >= -610;
    trees.push({ x, z, y0: near ? terrain(x, z)[0] : 0, th, cr, cy: cr * (0.62 + rnd() * 0.15), rot: rnd() * 6.28, v: Math.floor(rnd() * 3), near, c: rnd(), fl: rnd() < 0.025 });
  }
  const greens = ["#2f6b2a", "#3d7a2c", "#28592a", "#4f8a35", "#5c7f2e", "#36702f", "#2a6236"].map((h) => new THREE.Color(h));
  const gold = new THREE.Color("#d8b13a");
  const crownMat = dissolve(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, emissive: 0x000000 }));
  const trunkMat = dissolve(new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.9, emissive: 0x000000 }));
  const dm = new THREE.Object3D();
  const crownSets = [];
  for (let v = 0; v < 6; v++) {
    const nearSet = v < 3, list = trees.filter((t) => t.near === nearSet && t.v === v % 3);
    const im = new THREE.InstancedMesh(crownGeo(nearSet ? 2 : 1, 17 + v * 5), crownMat, list.length);
    list.forEach((t, i) => {
      dm.position.set(t.x, t.y0 + t.th, t.z); dm.rotation.set(0, t.rot, 0); dm.scale.set(t.cr, t.cy, t.cr * 0.92); dm.updateMatrix();
      im.setMatrixAt(i, dm.matrix); im.setColorAt(i, t.fl ? gold : greens[Math.floor(t.c * greens.length)]);
    });
    im.castShadow = im.receiveShadow = true; im.frustumCulled = false; S.add(im); crownSets.push(im);
  }
  const nearTrees = trees.filter((t) => t.near);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.7, 1, 6), trunkMat, nearTrees.length);
  nearTrees.forEach((t, i) => { dm.position.set(t.x, t.y0 + t.th / 2, t.z); dm.rotation.set(0, 0, 0); dm.scale.set(1 + t.cr * 0.06, t.th, 1 + t.cr * 0.06); dm.updateMatrix(); trunks.setMatrixAt(i, dm.matrix); });
  trunks.castShadow = true; trunks.frustumCulled = false; S.add(trunks);

  // hero tree (cutaway subject): trunk, a crossing branch and crown lumps with a gap the beam slips through
  const hero = new THREE.Group(); S.add(hero);
  const hy0 = terrain(HX, HZ)[0];
  const lumpM = new THREE.MeshStandardMaterial({ color: 0x3f7f2e, roughness: 0.8 }), barkM = new THREE.MeshStandardMaterial({ color: 0x6a5038, roughness: 0.85 });
  const lumps = [[3.6, 28, 0, 4.6], [-4.5, 26, 1, 4.2], [2, 32.5, -5, 3.8], [-2, 30, -5, 3.5], [7, 24, 2, 4], [-6.5, 30.5, -2, 3.6]];
  lumps.forEach(([x, y, z, rr], i) => { const m = new THREE.Mesh(crownGeo(2, 90 + i), lumpM); m.position.set(HX + x, hy0 + y, HZ + z); m.scale.set(rr, rr * 0.8, rr); m.castShadow = true; hero.add(m); });
  const limb = (a, b, rad) => {
    const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.7, rad, d.length(), 8), barkM);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(v3(0, 1, 0), d.normalize()); m.castShadow = true; hero.add(m);
  };
  const HB = v3(HX + 2.5, hy0, HZ);
  limb(HB, v3(HX + 2.5, hy0 + 26, HZ), 1.0);
  limb(v3(HX + 2.5, hy0 + 15, HZ), v3(HX - 4.5, hy0 + 21, HZ + 0.2), 0.45);
  limb(v3(HX + 2.5, hy0 + 19, HZ), v3(HX + 7, hy0 + 23, HZ + 1.5), 0.4);
  limb(v3(HX + 2.5, hy0 + 22, HZ), v3(HX - 2, hy0 + 29, HZ - 4.5), 0.35);
  const HIT = [hy0 + 30.9, hy0 + 15 + 6 * (2.5 / 7), hy0 + 0.1];

  // ---------- point cloud ----------
  const near2 = nearTrees;
  const NGx = 480, step = GS / NGx;
  const NG = NGx * NGx, NCp = near2.length * 16, NMid = near2.length * 3, NP = NG + NCp + NMid;
  const pP = new Float32Array(NP * 3), pCls = new Float32Array(NP), pR = new Float32Array(NP), pD = new Float32Array(NP), pGt = new Float32Array(NP), pSh = new Float32Array(NP), pHg = new Float32Array(NP);
  const L = v3(-0.55, 0.62, -0.55).normalize();
  const R2 = mulberry(77);
  let k = 0;
  for (let ix = 0; ix < NGx; ix++) for (let iz = 0; iz < NGx; iz++) {
    const x = -GS / 2 + (ix + R2()) * step, z = -GS / 2 + (iz + R2()) * step;
    const [h, dit, gt] = terrain(x, z), hx = terrain(x + 2, z)[0], hz = terrain(x, z + 2)[0];
    const n = v3(-(hx - h) * 1.6, 2, -(hz - h) * 1.6).normalize();
    pP[k * 3] = x; pP[k * 3 + 1] = h + 0.25; pP[k * 3 + 2] = z; pCls[k] = 0; pR[k] = R2(); pD[k] = dit; pGt[k] = gt; pSh[k] = clamp01(n.dot(L) * 1.25 - 0.1); pHg[k] = 0; k++;
  }
  for (const t of near2) {
    for (let j = 0; j < 16; j++) {
      const a = R2() * 6.283, y = -0.25 + R2() * 1.25, c = Math.sqrt(Math.max(0, 1 - Math.min(1, y) ** 2));
      const px = t.x + Math.cos(a) * c * t.cr * 1.02, py = t.y0 + t.th + Math.min(1, y) * t.cy * 1.02, pz = t.z + Math.sin(a) * c * t.cr * 1.02;
      pP[k * 3] = px; pP[k * 3 + 1] = py; pP[k * 3 + 2] = pz; pCls[k] = 1; pR[k] = R2(); pD[k] = 0; pGt[k] = 0; pSh[k] = 0; pHg[k] = clamp01((py - t.y0 - 14) / 24); k++;
    }
    for (let j = 0; j < 3; j++) {
      pP[k * 3] = t.x + (R2() - 0.5) * 3; pP[k * 3 + 1] = t.y0 + R2() * t.th; pP[k * 3 + 2] = t.z + (R2() - 0.5) * 3; pCls[k] = 2; pR[k] = R2(); pD[k] = 0; pGt[k] = 0; pSh[k] = 0; pHg[k] = 0; k++;
    }
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pP, 3)); pg.setAttribute("cls", new THREE.BufferAttribute(pCls, 1)); pg.setAttribute("rnd", new THREE.BufferAttribute(pR, 1));
  pg.setAttribute("dit", new THREE.BufferAttribute(pD, 1)); pg.setAttribute("gt", new THREE.BufferAttribute(pGt, 1)); pg.setAttribute("sh", new THREE.BufferAttribute(pSh, 1)); pg.setAttribute("hg", new THREE.BufferAttribute(pHg, 1));
  const PU = {
    ...DU, uFrontOn: { value: 0 }, uG: { value: 0 }, uCan: { value: 0 }, uMid: { value: 0 }, uLift: { value: 0 }, uSize: { value: 1800 },
    uGlowC: GU.uGlowC, uGlowS: GU.uGlowS, uGlowR: GU.uGlowR, uFogC: { value: new THREE.Color() }, uFogD: { value: 0 }, uMissC: { value: new THREE.Vector3(MISS.x, MISS.z, MISS.r) },
  };
  const cloud = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: PU, transparent: true, depthWrite: false,
    vertexShader: `attribute float cls,rnd,dit,gt,sh,hg;uniform float uFront,uRad,uRadOn,uFrontOn,uG,uCan,uMid,uLift,uSize,uGlowC,uGlowS,uGlowR,uFogD;uniform vec2 uDir,uC;uniform vec3 uFogC;
varying vec3 vC;varying float vA;
void main(){vec3 p=position;float d=dot(p.xz,uDir)-uFront;
float vis=max(uFrontOn*smoothstep(3.,-3.,d),uRadOn*smoothstep(0.,-8.,length(p.xz-uC)-uRad));
float a=cls<.5?uG:(cls<1.5?uCan:uMid);float lift=cls>.5?uLift:0.;
p.y+=lift*lift*(20.+rnd*90.);a*=1.-smoothstep(.35,1.,lift);
vec3 col;
if(cls<.5){col=mix(vec3(.28,.09,.015),vec3(1.,.6,.2),pow(sh,1.4));float gl=gt<.5?0.:(gt<1.5?uGlowC:(gt<2.5?uGlowS:uGlowR));col=mix(col,vec3(1.,.86,.5)*2.6,dit*gl);}
else if(cls<1.5){col=mix(vec3(.07,.42,.16),vec3(1.,.82,.25),hg*hg)*(.8+.4*rnd);}
else col=vec3(.5,.55,.18);
float edge=uFrontOn*exp(-d*d/60.)*step(-1.,-uLift);col+=vec3(1.,.9,.6)*edge*1.8;
vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
float f=1.-exp(-uFogD*uFogD*mv.z*mv.z);vC=mix(col,uFogC,f*.8);vA=a*vis;
gl_PointSize=vA<.01?0.:clamp(uSize*(1.+edge)/-mv.z,1.3,9.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;if(dot(q,q)>.25)discard;gl_FragColor=vec4(vC,vA);}`,
  }));
  cloud.frustumCulled = false; cloud.renderOrder = 2; S.add(cloud);

  // ---------- dawn haze sheets ----------
  const hazeTex = canvasTex(512, 512, (c, w) => {
    const R = mulberry(5); c.clearRect(0, 0, w, w);
    for (let i = 0; i < 160; i++) { const x = R() * w, y = R() * w, rr = 30 + R() * 90, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, w); }
  });
  const hazeM = new THREE.MeshBasicMaterial({ map: hazeTex, color: 0xffd2a0, transparent: true, opacity: 0.5, depthWrite: false, fog: true });
  const hazes = [14, 24, 36].map((y, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1800, 2600), hazeM); m.rotation.x = -Math.PI / 2; m.position.set(i * 90, y, -300); S.add(m); return m; });

  // ---------- aircraft ----------
  const plane = new THREE.Group(); S.add(plane);
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xf2efe8, roughness: 0.3, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x141a22, roughness: 0.06, metalness: 0.4, clearcoat: 1 });
  const stripe = new THREE.MeshStandardMaterial({ color: 0xd9832b, roughness: 0.4, metalness: 0.2 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x2a2e33, roughness: 0.45, metalness: 0.6 });
  {
    const prof = [[0, -4.4], [0.35, -4.25], [0.55, -3.9], [0.66, -3.2], [0.7, -2], [0.7, -0.5], [0.62, 1], [0.45, 2.5], [0.25, 3.8], [0.08, 4.3], [0, 4.35]].map(([a, b]) => new THREE.Vector2(a, b));
    const fg = new THREE.LatheGeometry(prof, 32); fg.rotateX(Math.PI / 2); fg.scale(1, 1.08, 1);
    plane.add(new THREE.Mesh(fg, paint));
    const sg = new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p.x * 1.012, p.y)), 32, -0.25, 0.5); sg.rotateX(Math.PI / 2); sg.rotateZ(Math.PI / 2 + 0.25);
    const strip = new THREE.Mesh(sg, stripe); plane.add(strip);
    const ck = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), glass); ck.scale.set(0.56, 0.38, 1.35); ck.position.set(0, 0.38, -2.5); plane.add(ck);
    const planform = (span, rc, tc, sweep) => { const sh = new THREE.Shape(); sh.moveTo(-span, -(sweep - tc / 2)); sh.lineTo(0, -(-rc * 0.6)); sh.lineTo(span, -(sweep - tc / 2)); sh.lineTo(span, -(sweep + tc / 2)); sh.lineTo(0, -(rc * 0.4)); sh.lineTo(-span, -(sweep + tc / 2)); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }); g.rotateX(-Math.PI / 2); return g; };
    const wing = new THREE.Mesh(planform(5.95, 1.7, 1.05, 0.05), paint); wing.position.set(0, -0.42, -0.4); plane.add(wing);
    const hs = new THREE.Mesh(planform(2.1, 0.95, 0.7, 0.1), paint); hs.position.set(0, 0.12, 3.75); plane.add(hs);
    const fin = new THREE.Shape(); fin.moveTo(-3.0, 0.3); fin.lineTo(-4.35, 0.3); fin.lineTo(-4.5, 2.05); fin.lineTo(-3.95, 2.1); fin.closePath();
    const fgeo = new THREE.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }); fgeo.rotateY(Math.PI / 2); fgeo.translate(-0.07, 0, 0);
    plane.add(new THREE.Mesh(fgeo, paint));
    const tagTex = canvasTex(512, 160, (c, w, h) => { c.fillStyle = "#0B3D2E"; c.fillRect(0, 0, w, h); c.fillStyle = "#A3E635"; c.fillRect(0, h - 18, w, 18); c.fillStyle = "#ffffff"; c.font = "800 92px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("AUDIRA", w / 2, h / 2 - 8); });
    const tagM = new THREE.MeshStandardMaterial({ map: tagTex, roughness: 0.4 });
    [-1, 1].forEach((sd) => { const tg = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.36), tagM); tg.position.set(sd * 0.13, 1.15, 3.85); tg.rotation.y = sd * Math.PI / 2; plane.add(tg); });
    const regTex = canvasTex(512, 96, (c, w, h) => { c.fillStyle = "#1c2a24"; c.font = "700 64px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("AUDIRA SURVEY", w / 2, h / 2); });
    const regM = new THREE.MeshBasicMaterial({ map: regTex, transparent: true });
    [-1, 1].forEach((sd) => { const tg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.45), regM); tg.position.set(sd * 0.72, 0.05, 0.9); tg.rotation.y = sd * Math.PI / 2; plane.add(tg); });
    plane.userData.props = [];
    [-1.95, 1.95].forEach((x) => {
      const nac = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.5, 6, 16), paint); nac.rotation.x = Math.PI / 2; nac.position.set(x, -0.25, -0.9); plane.add(nac);
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.38, 16), darkM); sp.rotation.x = -Math.PI / 2; sp.position.set(x, -0.25, -1.95); plane.add(sp);
      const prop = new THREE.Group(); prop.position.set(x, -0.25, -1.9); plane.add(prop);
      for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(rbox(0.12, 0.95, 0.03, 0.04), darkM); bl.position.y = 0.5; const arm = new THREE.Group(); arm.rotation.z = b * 2.094; arm.add(bl); prop.add(arm); }
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), new THREE.MeshBasicMaterial({ color: 0x999999, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })); prop.add(disc);
      plane.userData.props.push(prop);
    });
    const pod = new THREE.Mesh(rbox(0.75, 0.42, 1.1, 0.16), darkM); pod.position.set(0, -0.8, 0.4); plane.add(pod);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.1, 0.7) })); lens.rotation.x = Math.PI / 2; lens.position.set(0, -1.02, 0.4); plane.add(lens);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffc860, emissiveIntensity: 0 })); ant.position.set(0, 0.78, -0.6); plane.add(ant); plane.userData.ant = ant;
    plane.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  }
  // plane marker for map-scale shots and a 1 km swath trail
  const markM = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 1.4, 0.8), transparent: true, depthWrite: false });
  const mark = new THREE.Mesh(new THREE.ConeGeometry(1, 2.2, 3), markM); mark.rotation.x = -Math.PI / 2; S.add(mark);
  const swathM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 0.55, 0.3), transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending });
  const swath = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), swathM); swath.rotation.x = -Math.PI / 2; S.add(swath);

  // IMU gizmo rings
  const imu = new THREE.Group(); S.add(imu);
  const ringCols = [new THREE.Color(3, 0.9, 0.6), new THREE.Color(2.6, 2.0, 0.6), new THREE.Color(1.2, 2.6, 1.0)];
  const imuRings = ringCols.map((c, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(7.2 - i * 0.6, 0.06, 8, 96), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false })); imu.add(m); return m; });
  imuRings[0].rotation.y = Math.PI / 2; imuRings[1].rotation.set(0, 0, 0); imuRings[2].rotation.x = Math.PI / 2;

  // satellites (GNSS + imaging)
  const solarTex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = "#0d1a3a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#5c79b8"; c.lineWidth = 2; for (let x = 0; x <= w; x += 21) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 21) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  const foil = new THREE.MeshStandardMaterial({ color: 0xd4a23a, roughness: 0.3, metalness: 1 });
  const solM = new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.25, metalness: 0.5, emissive: 0x0a1430 });
  const makeSat = () => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(rbox(1.6, 1.6, 2.2, 0.18), foil));
    [-1, 1].forEach((sd) => { const p = new THREE.Mesh(rbox(3.6, 0.08, 1.5, 0.04), solM); p.position.set(sd * 2.7, 0, 0); g.add(p); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), darkM); a.rotation.z = Math.PI / 2; a.position.set(sd * 1.0, 0, 0); g.add(a); });
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3, metalness: 0.4, side: THREE.DoubleSide })); dish.position.y = -1.0; g.add(dish);
    return g;
  };
  const SATP = [v3(-520, 2350, -1150), v3(420, 2480, -980), v3(-40, 2250, -1650)];
  const sats = SATP.map((p) => { const g = makeSat(); g.position.copy(p); g.scale.setScalar(26); S.add(g); return g; });
  const imgSat = makeSat(); imgSat.scale.setScalar(24); S.add(imgSat);
  const NSD = 3 * 40;
  const sdG2 = new THREE.BufferGeometry(); const sdP = new Float32Array(NSD * 3); sdG2.setAttribute("position", new THREE.BufferAttribute(sdP, 3));
  const sigM = new THREE.PointsMaterial({ color: new THREE.Color(3, 2.4, 1.2), size: 7, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  const sig = new THREE.Points(sdG2, sigM); sig.frustumCulled = false; S.add(sig);
  // imaging satellite footprint frame
  const fpG = new THREE.BufferGeometry(); const fpP = new Float32Array(8 * 2 * 3); fpG.setAttribute("position", new THREE.BufferAttribute(fpP, 3));
  const fpM = new THREE.LineBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.4), transparent: true, opacity: 0 });
  const fp = new THREE.LineSegments(fpG, fpM); fp.frustumCulled = false; S.add(fp);

  // ---------- laser fan ----------
  const NF = 44;
  const fanG = new THREE.BufferGeometry(); const fanP = new Float32Array(NF * 2 * 3), fanA = new Float32Array(NF * 2);
  fanG.setAttribute("position", new THREE.BufferAttribute(fanP, 3)); fanG.setAttribute("al", new THREE.BufferAttribute(fanA, 1));
  const fanU = { uCol: { value: new THREE.Color(4.0, 0.9, 0.55) }, uOp: { value: 0 } };
  const fan = new THREE.LineSegments(fanG, new THREE.ShaderMaterial({ uniforms: fanU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "attribute float al;varying float vA;void main(){vA=al;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 uCol;uniform float uOp;varying float vA;void main(){gl_FragColor=vec4(uCol*vA*uOp,1.);}" }));
  fan.frustumCulled = false; S.add(fan);
  const curG = new THREE.BufferGeometry(); const curP = new Float32Array((NF - 1) * 3 * 3); curG.setAttribute("position", new THREE.BufferAttribute(curP, 3));
  const curM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.3, 0.18), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const curtain = new THREE.Mesh(curG, curM); curtain.frustumCulled = false; S.add(curtain);
  const NH = 160; const hitG = new THREE.BufferGeometry(); const hitP = new Float32Array(NH * 3); hitG.setAttribute("position", new THREE.BufferAttribute(hitP, 3));
  const hitM = new THREE.PointsMaterial({ color: new THREE.Color(4, 2.6, 1.2), size: 6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  const hits = new THREE.Points(hitG, hitM); hits.frustumCulled = false; S.add(hits);
  const fanSet = (apex, fz, half, yTop, op, t) => {
    const sweep = 0.5 + 0.5 * Math.sin(t * 2 * Math.PI / 0.9);
    for (let i = 0; i < NF; i++) {
      const u = i / (NF - 1), x = apex.x - half + 2 * half * u;
      fanP.set([apex.x, apex.y, apex.z, x, yTop, fz], i * 6);
      const a = 0.25 + 1.4 * Math.exp(-(((u - sweep) / 0.09) ** 2));
      fanA[i * 2] = a * 0.35; fanA[i * 2 + 1] = a;
      if (i < NF - 1) { const x2 = apex.x - half + 2 * half * (i + 1) / (NF - 1); curP.set([apex.x, apex.y, apex.z, x, yTop, fz, x2, yTop, fz], i * 9); }
    }
    for (let i = 0; i < NH; i++) { const u = (i + 0.5) / NH, fl = Math.sin(i * 12.9898 + Math.floor(t * 24) * 7.233) * 43758.5; hitP.set([apex.x - half + 2 * half * u, yTop + (fl - Math.floor(fl)) * 4, fz + ((fl * 3) % 1) * 6], i * 3); }
    fanG.attributes.position.needsUpdate = fanG.attributes.al.needsUpdate = curG.attributes.position.needsUpdate = hitG.attributes.position.needsUpdate = true;
    fanU.uOp.value = op; curM.opacity = 0.09 * op; hitM.opacity = Math.min(1, op);
  };

  // ---------- cutaway beam ----------
  const beamM = [1, 0.6, 0.38].map((o) => new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.0, 0.6).multiplyScalar(o), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const beams = beamM.map((m) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1, 10), m); b.frustumCulled = false; S.add(b); return b; });
  const hitCols = [new THREE.Color(1.4, 3.2, 1.0), new THREE.Color(3.2, 2.4, 0.8), new THREE.Color(3.6, 1.8, 0.5)];
  const flashes = hitCols.map((c) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.75, 1, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); S.add(m); return m; });
  const dots = hitCols.map((c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0 })); S.add(m); return m; });
  const echoes = hitCols.map((c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0 })); S.add(m); return m; });
  const ruler = new THREE.Group(); S.add(ruler);
  const rulM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.2, 1.8), transparent: true, opacity: 0 });
  { const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 6), rulM); rl.name = "rl"; ruler.add(rl); for (let i = 0; i < 2; i++) { const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), rulM); tk.rotation.z = Math.PI / 2; tk.name = "tk" + i; ruler.add(tk); } }

  // ---------- markers (432 found, 36 known) and estimate dots ----------
  const RM = mulberry(432), STRIPS = [-4200, -2800, -1400, 0, 1400, 2800];
  const mk = [];
  for (let i = 0; i < 432; i++) { const st = STRIPS[Math.floor(RM() * 6)]; mk.push({ x: st + (RM() - 0.5) * 520, z: 5200 - 21000 * Math.pow(RM(), 1.7), s: 55 + RM() * 55, o: RM() }); }
  mk.sort((a, b) => b.z - a.z);
  const markers = new THREE.InstancedMesh(new THREE.RingGeometry(0.66, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, toneMapped: false }), 432);
  const amber = new THREE.Color(3.0, 1.5, 0.45), white = new THREE.Color(2.6, 2.7, 2.8);
  mk.forEach((m, i) => { markers.setColorAt(i, amber); dm.position.set(m.x, 6, m.z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(0.001); dm.updateMatrix(); markers.setMatrixAt(i, dm.matrix); });
  markers.frustumCulled = false; S.add(markers);
  const known = new Set(); { const RK = mulberry(36); while (known.size < 36) known.add(Math.floor(RK() * 432)); }
  const stripM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 0.7, 0.35), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const strips = STRIPS.map((x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(520, 22000), stripM); m.rotation.x = -Math.PI / 2; m.position.set(x, 3, -5800); S.add(m); return m; });
  const NE = 3200, eP = new Float32Array(NE * 3), eD = new Float32Array(NE); { const RE = mulberry(2430); for (let i = 0; i < NE; i++) { const x = (RE() - 0.5) * 34000, z = 6000 - RE() * 34000; eP.set([x, 8, z], i * 3); eD[i] = Math.hypot(x, z + 3000) / 22000; } }
  const eG = new THREE.BufferGeometry(); eG.setAttribute("position", new THREE.BufferAttribute(eP, 3)); eG.setAttribute("dd", new THREE.BufferAttribute(eD, 1));
  const eU = { uP: { value: 0 }, uA: { value: 0 } };
  const est = new THREE.Points(eG, new THREE.ShaderMaterial({ uniforms: eU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "attribute float dd;uniform float uP,uA;varying float vA;void main(){vA=uA*smoothstep(uP,uP-.08,dd);vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=vA<.01?0.:4.5;}",
    fragmentShader: "varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vec3(1.,.62,.22)*2.*(1.-d),vA);}" }));
  est.frustumCulled = false; S.add(est);

  // ghost of the structure the laser missed (dashed coral ring) and the virtual sun
  const ghostPts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * 6.283; ghostPts.push(v3(MISS.x + Math.cos(a) * MISS.r, 32, MISS.z + Math.sin(a) * MISS.r)); }
  const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ghostPts), new THREE.LineDashedMaterial({ color: new THREE.Color(3, 0.9, 0.6), dashSize: 9, gapSize: 7, transparent: true, opacity: 0 }));
  ghost.computeLineDistances(); S.add(ghost);
  const qTex = canvasTex(128, 128, (c, w) => { c.fillStyle = "#ff7a55"; c.font = "800 110px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", w / 2, w / 2 + 6); });
  const qm = new THREE.Sprite(new THREE.SpriteMaterial({ map: qTex, transparent: true, opacity: 0, depthWrite: false })); qm.scale.set(60, 60, 1); qm.position.set(MISS.x, 70, MISS.z); S.add(qm);
  const sqPts = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([a, b]) => v3(370 + a * 70, 4, 340 + b * 70));
  const sqLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(sqPts), new THREE.LineBasicMaterial({ color: new THREE.Color(3, 2.2, 0.9), transparent: true, opacity: 0 })); S.add(sqLine);
  const vsun = new THREE.Mesh(new THREE.SphereGeometry(14, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 3.6, 1.6), transparent: true, opacity: 0 })); S.add(vsun);
  const crownRing = new THREE.Mesh(new THREE.RingGeometry(93, 97, 128).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.5, 0.5), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  crownRing.position.set(0, 34, -95); S.add(crownRing);
  // survey label inside the world (anti-reupload): a ground stake board near the square
  const boardTex = canvasTex(512, 256, (c, w, h) => { c.fillStyle = "#0b1410"; c.fillRect(0, 0, w, h); c.strokeStyle = "#ffb347"; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#ffb347"; c.font = "800 84px Arial"; c.textAlign = "center"; c.fillText("AUDIRA", w / 2, 108); c.fillStyle = "#f3e6c8"; c.font = "600 40px Arial"; c.fillText("LIDAR SURVEY · EP13", w / 2, 180); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(56, 28), new THREE.MeshBasicMaterial({ map: boardTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); board.position.set(-150, 40, 40); S.add(board);

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.6, 0.45, 0.9);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  // ---------- flight paths ----------
  const zA = (t) => -60 + VEL * (40.5 - t); // pass A heading -z (s2..s4)
  const zB = (t) => VEL * (t - E.pantulan); // pass B heading +z (s5)
  const planeAt = (t) => (t < s.s5 ? v3(0, ALT, zA(t)) : v3(0, ALT, zB(t)));
  const rollAt = (t) => 0.035 * Math.sin(t * 0.7) + (t >= s.s5 && t < s.s6 ? 0.1 * Math.sin((t - E.imu) * 2.1) * ramp(t, E.imu - 0.5, E.imu + 0.5) * (1 - ramp(t, E.pantulan - 0.5, E.pantulan)) : 0);
  const P = (t, dx, dy, dz) => { const p = planeAt(t); return [p.x + dx, p.y + dy, p.z + dz]; };
  const camKeys = [
    [0, -40, 640, 880, 0, 0, -60], [E.laser, -20, 600, 820, 0, 0, -70], [s.s1e, 10, 560, 760, 0, 0, -80],
    [s.s2 + 2.2, 0, 1500, 2500, 0, 0, -600], [E.acre + 1, 0, 3600, 6200, 0, 0, -2400], [E.n432, 300, 4300, 7200, 0, 0, -3000], [s.s2e - 0.9, 500, 4400, 7300, 0, 0, -2800], [s.s2e - 0.4, 520, 4380, 7280, 0, 0, -2780],
    [E.terbang + 0.4, ...P(E.terbang + 0.4, 46, 22, 70), ...P(E.terbang + 0.4, 0, -12, -20)],
    [E.km + 0.8, ...P(E.km + 0.8, 26, 12, 34), ...P(E.km + 0.8, 0, -40, -60)],
    [E.juta, ...P(E.juta, 40, 30, 40), ...P(E.juta, 0, -520, -120)],
    [s.s3e - 0.3, ...P(s.s3e - 0.3, 60, 0, 120), ...P(s.s3e - 0.3, 0, -700, -40)],
    [E.pulsa + 0.6, HX + 30, 420, HZ + 380, HX, 40, HZ],
    [E.puncak - 0.6, HX + 4, 18, HZ + 172, HX + 1, 12, HZ],
    [E.waktu + 1.0, HX - 8, 17, HZ + 166, HX, 12, HZ],
    [E.waktu + 1.6, HX - 9, 18, HZ + 168, HX, 13, HZ],
    [E.imu + 0.3, ...P(E.imu + 0.3, 30, 8, 32), ...P(E.imu + 0.3, 0, 0.5, -1)],
    [E.pantulan + 1.0, 200, 330, 560, 0, 10, -60],
    [E.n31, 50, 92, 175, 0, 14, 30],
    [E.pohon + 0.3, 0, 360, 520, 0, 0, -40], [s.s5e, 0, 420, 560, 0, 0, -40],
    [s.s6 + 1.4, 110, 1650, 230, 110, 0, 60], [E.laser6, 120, 1600, 220, 120, 0, 50], [s.s6e - 0.2, 110, 1460, 160, 100, 0, 20],
    [s.s6e + 0.15, 110, 1450, 120, 100, 0, -20], [s.s7 + 0.9, -460, 330, 560, 0, 0, -20], [E.parit + 0.2, 170, 38, -30, 95, 0, -95], [E.ling7, 60, 560, 600, 0, 0, -10], [E.total + 0.3, 0, 900, 1300, 0, 0, -300],
    [s.s7e - 0.4, 0, 6200, 7400, 0, 0, -3200], [s.s7e, 0, 6150, 7350, 0, 0, -3180],
    [s.s8 + 1.8, -80, 120, 520, 0, 30, -300], [s.dur, -40, 105, 330, 0, 45, -800],
  ];
  const camT = trackM(camKeys);
  const relT = trackM([[s.s5, 95, -45, 160, 0, 12, 0], [E.mencatat, 70, -38, 118, 0, 10, 0], [E.imu + 0.3, 30, 8, 32, 0, 0.5, -1], [E.imu + 1.6, 26, 9, 34, 0, 0.5, -1]]);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    let [cx, cy, cz, tx, ty, tz] = camT(t);
    if (t >= s.s5 - 0.6 && t < E.pantulan + 1.0) {
      const w = ramp(t, s.s5 - 0.6, s.s5 + 0.9) * (1 - ramp(t, E.imu + 1.6, E.pantulan + 1.0)), pq = planeAt(t), o = relT(t);
      const rel = [pq.x + o[0], pq.y + o[1], pq.z + o[2], pq.x + o[3], pq.y + o[4], pq.z + o[5]];
      [cx, cy, cz, tx, ty, tz] = [cx, cy, cz, tx, ty, tz].map((v, i) => v + (rel[i] - v) * w);
    }
    cam.position.set(cx, cy, cz); cam.up.set(0, 1, 0); cam.lookAt(tx, ty, tz);
    const inS = (a, b) => t >= s[a] && t < s[b];
    // ---- grade: dawn vs void ----
    let vd = 0;
    if (t < s.s2) vd = 0.75 * ramp(t, E.laser - 0.4, E.ling);
    else if (t < s.s3) vd = 0.75 * (1 - ramp(t, s.s2, s.s2 + 1.6));
    else if (t < s.s4) vd = 0.25 * ramp(t, E.juta, s.s3e);
    else if (t < s.s5) vd = 0.25 + 0.68 * ramp(t, s.s4, s.s4 + 1.8);
    else if (t < s.s6) vd = 0.8 - 0.45 * ramp(t, s.s5, E.mencatat) + 0.45 * ramp(t, E.pantulan - 0.8, E.pantulan);
    else if (t < s.s7) vd = 0.8 * (1 - ramp(t, s.s6, s.s6 + 1.2)) + 0.55 * ramp(t, E.laser6, E.laser6 + 1.2);
    else if (t < s.s8) vd = 0.95;
    else vd = 0.95 * (1 - ramp(t, s.s8, s.s8 + 1.6));
    // sun direction per chapter
    if (t >= s.s6 && t < s.s7) SUN.set(0.5, 0.75, -0.4).normalize();
    else if (t >= s.s8) SUN.set(0.55, 0.07, -1).normalize();
    else SUN.set(0.85, 0.16, -0.5).normalize();
    skyU.uS.value.copy(SUN); skyU.uVoid.value = vd;
    sun.position.set(SUN.x * 1500, SUN.y * 1500, SUN.z * 1500); sun.target.position.set(0, 0, 0);
    sun.intensity = 3.6 * (1 - 0.85 * vd); hemi.intensity = 0.55 * (1 - 0.8 * vd);
    S.environmentIntensity = 0.55 * (1 - 0.6 * vd);
    const fogC = new THREE.Color(0xd9a070).lerp(new THREE.Color(0x0a0705), vd);
    S.fog.color.copy(fogC); S.fog.density = THREE.MathUtils.lerp(0.00026, 0.000032, clamp01((cy - 600) / 3000));
    PU.uFogC.value.copy(fogC); PU.uFogD.value = S.fog.density;
    farMat.color.setRGB(1, 1, 1).lerp(new THREE.Color(0.25, 0.18, 0.12), vd);
    const hz = (t < s.s2 ? 1 - ramp(t, E.laser, E.ling) : t >= s.s8 ? ramp(t, s.s8 + 0.5, s.s8 + 2.5) : t < s.s3 ? 0.4 * (1 - ramp(t, s.s2, s.s2 + 2)) : 0);
    hazeM.opacity = 0.13 * hz; hazes.forEach((m, i) => { m.position.x = i * 90 + t * (3 + i * 2); m.visible = hz > 0.01; });

    // ---- reveal state ----
    let cutB = -1e5, fOn = 0, front = -1e5, dir = [0, -1], radOn = 0, rad = -1, cut = 1e5, uG = 0, uCan = 0, uMid = 0, lift = 0, crownsOn = true;
    let gC = 0, gS = 0, gR = 0, hill = 0;
    if (t < s.s2) { // hook: laser front sweeps up the screen, canopy dissolves into points
      const fz = 650 - 1300 * eout(ramp(t, 0.8, E.ling + 0.6)); front = -fz; fOn = 1; uG = 1; uCan = 0.2; uMid = 0.08;
      gC = gS = ramp(t, E.ling - 0.3, E.ling + 0.5); gR = gC * 0.7;
    } else if (t < s.s3) { const fz = -650 + 1400 * ramp(t, s.s2, s.s2 + 1.3); front = -fz; fOn = 1; uG = 1 - ramp(t, s.s2, s.s2 + 1.3); uCan = 0.4 * uG; gC = gS = uG; }
    else if (t < s.s4) { front = -(zA(t)); fOn = 1; uCan = 1; uMid = 0.4; uG = 0.5; }
    else if (t < s.s5) { cut = HZ + 6; cutB = HZ - 28; }
    else if (t < s.s6) {
      dir = [0, 1]; front = -650 + 1300 * ramp(t, E.mencatat + 0.5, E.pohon - 0.4); fOn = 1; uG = 1; uCan = 1; uMid = 0.5;
      lift = ramp(t, E.pohon - 0.2, E.pohon + 1.4); crownsOn = lift < 0.9;
      gC = gS = gR = ramp(t, E.pohon, E.pohon + 1);
    } else if (t < s.s7) {
      radOn = 1; DU.uC.value.set(0, -40); rad = t < E.laser6 ? 900 * (1 - ramp(t, s.s6, s.s6 + 1.2)) - 5 : 560 * eout(ramp(t, E.laser6 + 0.3, E.tanah6 + 0.4));
      uG = 1; gC = gS = gR = ramp(t, E.laser6 + 1, E.tanah6);
    } else if (t < s.s8) {
      crownsOn = false; hill = ramp(t, s.s7, s.s7 + 1.0); uG = 0.3 * (1 - ramp(t, s.s7, s.s7 + 1)) + 0.15; radOn = 1; rad = 2000;
      gR = 0.4 * ramp(t, E.matahari, E.matahari + 1); gC = Math.max(gR, ramp(t, E.ling7 - 0.3, E.ling7 + 0.3)); gS = Math.max(gR, ramp(t, E.persegi - 0.3, E.persegi + 0.3));
      if (t > E.parit - 0.3 && t < E.ling7) gC = Math.max(gC, 0.5 * ramp(t, E.parit - 0.3, E.parit + 0.4));
    } else {
      const fz = -650 + 1400 * ramp(t, s.s8, s.s8 + 1.8); front = -fz; fOn = 1; uG = 1 - ramp(t, s.s8, s.s8 + 1.8); gC = gS = uG;
    }
    DU.uFront.value = fOn ? front : -1e5; DU.uDir.value.set(dir[0], dir[1]); DU.uRadOn.value = radOn; DU.uRad.value = rad; DU.uCutZ.value = cut; DU.uCutB.value = cutB;
    // during s3 the canopy meshes stay; points sit on top of them
    if (t >= s.s3 && t < s.s4) DU.uFront.value = -1e5;
    PU.uFrontOn.value = fOn; PU.uFront.value = fOn ? front : -1e5; PU.uG.value = uG; PU.uCan.value = uCan; PU.uMid.value = uMid; PU.uLift.value = lift;
    PU.uSize.value = t >= s.s5 && t < s.s6 ? 1500 : t >= s.s6 && t < s.s7 ? 3400 : 1800;
    PU.uRad.value = rad; PU.uRadOn.value = radOn;
    crownSets.forEach((m) => (m.visible = crownsOn)); trunks.visible = crownsOn;
    GU.uHill.value = hill; GU.uGlowC.value = gC; GU.uGlowS.value = gS; GU.uGlowR.value = gR; GU.uTT.value = t;
    const sa = t >= s.s7 ? (t - s.s7) * 0.32 : 0; GU.uHSun.value.set(Math.cos(sa + 3.9) * 0.8, 0.42, Math.sin(sa + 3.9) * 0.8).normalize();
    vsun.material.opacity = t >= s.s7 && t < s.s8 ? ramp(t, E.matahari - 0.6, E.matahari) * (1 - ramp(t, E.total, E.total + 1)) : 0;
    vsun.position.copy(GU.uHSun.value).multiplyScalar(520);
    hero.visible = t >= s.s3 && t < s.s6;
    cloud.visible = uG + uCan + uMid > 0.001;
    ground.visible = true; far.visible = !(t >= s.s7 + 0.8 && t < s.s8);

    // ---- aircraft ----
    const pp = planeAt(t), hdg = t < s.s5 ? 0 : Math.PI, rl = rollAt(t);
    plane.position.copy(pp); plane.rotation.set(0.02 * Math.sin(t * 0.9), hdg, rl);
    plane.userData.props.forEach((p, i) => (p.rotation.z = t * 95 * (i ? -1 : 1)));
    plane.visible = t >= s.s2 && t < s.s6 && !(t >= s.s4 + 1.2 && t < s.s5);
    plane.userData.ant.material.emissiveIntensity = t >= s.s5 && t < s.s6 ? 3 * ramp(t, E.gnss, E.mencatat) * (1 - ramp(t, E.pantulan - 0.5, E.pantulan)) : 0;
    const mapScale = clamp01((cy - 1200) / 3000);
    mark.visible = t >= s.s2 && t < s.s3 && mapScale > 0.05; mark.position.set(pp.x, 40, pp.z); mark.scale.setScalar(60 * mapScale + 1);
    markM.opacity = mapScale;
    swathM.opacity = t >= s.s2 && t < s.s3 ? 0.35 * ramp(t, E.acre - 1, E.acre) : 0;
    { const z0 = 5200, z1 = pp.z; swath.scale.set(520, Math.max(1, z0 - z1), 1); swath.position.set(0, 4, (z0 + z1) / 2); }
    stripM.opacity = t >= s.s2 && t < s.s3 ? 0.055 * ramp(t, E.acre - 0.5, E.acre + 1) : 0;
    // markers
    const showM = t >= s.s2 && t < s.s3;
    markers.visible = showM;
    if (showM) {
      for (let i = 0; i < 432; i++) {
        const m = mk[i], ta = E.n432 + (i / 432) * 1.4, sc = back(ramp(t, ta, ta + 0.35)) * m.s;
        const kn = known.has(i), kp = kn ? ramp(t, E.n36, E.n36 + 0.3) : 0;
        dm.position.set(m.x, 6, m.z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(Math.max(0.001, sc * (1 + 0.6 * kp))); dm.updateMatrix(); markers.setMatrixAt(i, dm.matrix);
        markers.setColorAt(i, kn && kp > 0 ? white : amber);
      }
      markers.instanceMatrix.needsUpdate = true; markers.instanceColor.needsUpdate = true;
      markers.material.opacity = 1 - 0.65 * ramp(t, E.n36, E.n36 + 0.4) * 1;
    }
    // ---- laser fan ----
    let fanOp = 0;
    if (t < s.s2) {
      const fz = 650 - 1300 * eout(ramp(t, 0.8, E.ling + 0.6));
      fanOp = ramp(t, 0.6, 1.0) * (1 - ramp(t, E.ling + 0.4, E.ling + 1.0));
      fanSet(v3(0, ALT, fz + 40), fz, 520, terrain(0, fz)[0] + 30, fanOp, t);
    } else if (t >= s.s3 && t < s.s4 + 0.6) {
      fanOp = ramp(t, E.terbang, E.terbang + 0.8) * (1 + 0.6 * ramp(t, E.juta - 0.3, E.juta)) * (1 - ramp(t, s.s4, s.s4 + 0.6));
      const ap = plane.localToWorld(v3(0, -1.0, 0.4));
      fanSet(ap, pp.z, 500, 29, fanOp, t);
    } else if (t >= s.s6 && t < s.s7) {
      fanOp = ramp(t, E.laser6, E.laser6 + 0.5) * (1 - ramp(t, E.tanah6, E.tanah6 + 0.6)) * 0.8;
      const fz = 300 - 700 * ramp(t, E.laser6, E.tanah6);
      fanSet(v3(0, 1500, fz), fz, 420, 30, fanOp, t);
    }
    fan.visible = curtain.visible = hits.visible = fanOp > 0.001;
    // ---- satellites, GNSS signals, IMU ----
    const satOn = t >= s.s5 && t < E.pantulan + 0.5;
    sats.forEach((g, i) => { g.visible = satOn; g.rotation.y = t * 0.1 + i; });
    const sigOp = satOn ? ramp(t, E.gnss, E.gnss + 0.8) * (1 - ramp(t, E.pantulan - 0.5, E.pantulan)) : 0;
    sigM.opacity = sigOp; sig.visible = sigOp > 0.01;
    if (sig.visible) { const an = plane.localToWorld(v3(0, 0.8, -0.6)); for (let i = 0; i < 3; i++) for (let j = 0; j < 40; j++) { const u = ((j / 40) + t * 0.45) % 1; const p = SATP[i].clone().lerp(an, u); sdP.set([p.x, p.y, p.z], (i * 40 + j) * 3); } sdG2.attributes.position.needsUpdate = true; }
    const imuOp = t >= s.s5 && t < s.s6 ? ramp(t, E.imu - 0.3, E.imu + 0.4) * (1 - ramp(t, E.pantulan - 0.6, E.pantulan)) : 0;
    imu.visible = imuOp > 0.01; imu.position.copy(pp); imu.rotation.set(0, hdg, rl); imuRings.forEach((m) => (m.material.opacity = imuOp));
    // imaging satellite in s6
    const isOn = t >= s.s6 && t < E.gundul;
    imgSat.visible = isOn;
    if (isOn) { const u = ramp(t, s.s6 - 0.5, E.gundul); imgSat.position.set(-420 + 840 * u, 1240, -260); imgSat.rotation.set(0.2, 0.4, 0.1); }
    fpM.opacity = isOn ? 0.8 * ramp(t, s.s6 + 0.6, s.s6 + 1.2) * (1 - ramp(t, E.atap + 0.8, E.gundul)) : 0; fp.visible = fpM.opacity > 0.01;
    if (fp.visible) { const c = imgSat.position, hw = 200, hd = 240, y = 32, fx = c.x, fzz = c.z + 150; const q = [[fx - hw, y, fzz - hd], [fx + hw, y, fzz - hd], [fx + hw, y, fzz + hd], [fx - hw, y, fzz + hd]]; let o = 0; for (let i = 0; i < 4; i++) { fpP.set([...q[i], ...q[(i + 1) % 4]], o); o += 6; fpP.set([c.x, c.y - 20, c.z, ...q[i]], o); o += 6; } fpG.attributes.position.needsUpdate = true; }
    ghost.material.opacity = t >= s.s6 && t < s.s7 ? ramp(t, E.terlewat - 1.2, E.terlewat - 0.6) : 0;
    qm.material.opacity = ghost.material.opacity;
    sqLine.material.opacity = t >= s.s6 && t < s.s7 ? ramp(t, E.gundul - 1.6, E.gundul - 1.0) * (1 - ramp(t, E.laser6 + 0.5, E.laser6 + 1.0)) : 0;
    // ---- cutaway beam (s4) ----
    const bOn = t >= s.s4 && t < s.s5;
    const top = hy0 + 260, bx = HX, bz = HZ;
    const fy = bOn ? top - (top - HIT[0]) * ramp(t, E.pulsa, E.puncak) - (HIT[0] - HIT[1]) * ramp(t, E.puncak + 0.05, E.ranting) - (HIT[1] - HIT[2]) * ramp(t, E.celah - 0.6, E.tanah4) : top;
    const segs = [[top, HIT[0]], [HIT[0], HIT[1]], [HIT[1], HIT[2]]];
    beams.forEach((b, i) => {
      const [y0, y1] = segs[i], lo = Math.max(y1, fy), len = y0 - lo;
      b.visible = bOn && len > 0.05; b.position.set(bx, (y0 + lo) / 2, bz); b.scale.set(1, Math.max(0.01, len), 1);
      beamM[i].opacity = bOn ? 0.9 * (1 - ramp(t, s.s5 - 0.5, s.s5)) : 0;
    });
    const hitT = [E.puncak, E.ranting, E.tanah4];
    flashes.forEach((f, i) => { const u = bOn ? clamp01((t - hitT[i]) / 0.9) : 0; f.visible = bOn && t > hitT[i]; f.position.set(bx, HIT[i], bz + 0.5); f.scale.setScalar(1 + 5 * eout(u)); f.material.opacity = (1 - u) * 0.9; });
    dots.forEach((d, i) => { d.visible = bOn && t > hitT[i]; d.position.set(bx, HIT[i], bz + 0.4); d.material.opacity = 1; d.scale.setScalar(1 + 0.25 * Math.sin(t * 9 + i)); });
    echoes.forEach((e, i) => { const u = (t - hitT[i]) / 1.6; e.visible = bOn && u > 0 && u < 1; e.position.set(bx + 0.9, HIT[i] + u * 80, bz + 0.6); e.material.opacity = 1 - u; });
    const ruOp = bOn ? ramp(t, E.waktu - 0.2, E.waktu + 0.4) : 0; rulM.opacity = ruOp; ruler.visible = ruOp > 0.01;
    if (ruler.visible) { const y0 = HIT[2], y1 = HIT[2] + 75 * ramp(t, E.waktu, E.waktu + 1); const rl = ruler.getObjectByName("rl"); rl.position.set(bx - 7, (y0 + y1) / 2, bz + 1); rl.scale.set(1, Math.max(0.1, y1 - y0), 1); ruler.getObjectByName("tk0").position.set(bx - 7, y0, bz + 1); ruler.getObjectByName("tk1").position.set(bx - 7, y1, bz + 1); }
    // ---- s7 estimate, s8 ring, board ----
    eU.uA.value = t >= s.s7 && t < s.s8 ? ramp(t, E.total - 0.2, E.total + 0.6) : 0; eU.uP.value = 0.05 + 1.3 * ramp(t, E.total, s.s7e);
    est.visible = eU.uA.value > 0.01;
    crownRing.material.opacity = t >= s.s8 ? 0.55 * ramp(t, s.s8 + 1.5, s.s8 + 3) : 0;
    board.material.opacity = (t >= s.s5 && t < s.s6 ? ramp(t, E.pohon, E.pohon + 0.8) : 0) + (t >= s.s7 && t < s.s8 ? ramp(t, s.s7 + 0.5, s.s7 + 1.2) * (1 - ramp(t, E.total - 0.5, E.total)) : 0) + (t < s.s2 ? ramp(t, E.ling, E.ling + 0.6) : 0);
    board.quaternion.copy(cam.quaternion); board.visible = board.material.opacity > 0.01;
    bloom.strength = 0.45 + 0.45 * vd;
    comp.render();
  };
}
