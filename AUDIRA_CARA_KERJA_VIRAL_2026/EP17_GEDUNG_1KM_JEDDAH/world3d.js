// EP17 SATU KILOMETER KE ATAS. URBANFORGE look: a matte plaster massing model of a 1 km tower on a huge exhibition table
// in a dark gallery, a slow sun sweeping shadows across the white city, and data projected onto the model as light
// (cyan = structure / wind, amber = construction / loads). 1 unit = 10 m. Tower base at the origin, height in local y.
// Every value is a pure function of t (seek-safe). Scene keys K.sN and word anchors AT drive all timing.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const CYAN = 0x00e5ff, AMBER = 0xffb703, PLASTER = 0xebe9e3;

// ---------------- tower plan (Y: triangular core + three tapering wings) ----------------
const L0 = 7.2, CORE = 2.4, CH = 0.5;
const ENDS = [56, 64, 72];               // each wing steps back into the core at a different height
const TH = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 3, -Math.PI / 2 + (4 * Math.PI) / 3];
const TOP = 100.8;                       // "lebih dari satu kilometer"
const hwAt = (y) => 1.75 - 0.5 * Math.min(1, y / 80);
function wingL(i, y) {
  if (y >= ENDS[i]) return y >= 72 ? CORE * (1 - 0.22 * clamp01((y - 72) / 8)) : CORE;
  return CORE + (L0 - CORE) * (1 - 0.86 * (y / ENDS[i]));
}
function planPts(L, hw) {
  const pts = [];
  const cr = hw / Math.sin(Math.PI / 3);
  for (let i = 0; i < 3; i++) {
    const th = TH[i], dx = Math.cos(th), dz = Math.sin(th), nx = -dz, nz = dx;
    const ca = th - Math.PI / 3;
    pts.push([Math.cos(ca) * cr, Math.sin(ca) * cr]);
    const l = L[i], ch = Math.min(CH, hw * 0.45);
    pts.push([-nx * hw + dx * (l - ch), -nz * hw + dz * (l - ch)]);
    pts.push([-nx * (hw - ch) + dx * l, -nz * (hw - ch) + dz * l]);
    pts.push([nx * (hw - ch) + dx * l, nz * (hw - ch) + dz * l]);
    pts.push([nx * hw + dx * (l - ch), nz * hw + dz * (l - ch)]);
  }
  return pts;
}
const towerPlan = (y) => planPts([0, 1, 2].map((i) => wingL(i, y)), hwAt(y));
const circlePts = (r, n = 14) => Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);
function roundRect(w, d, ch) {
  const a = w / 2, b = d / 2;
  return [[-a + ch, -b], [a - ch, -b], [a, -b + ch], [a, b - ch], [a - ch, b], [-a + ch, b], [-a, b - ch], [-a, -b + ch]];
}

// prism builder: bottom ring at y0, top ring at y1 (same vertex count), flat normals, outward winding fixed by test
function Prisms() {
  const P = [], N = [];
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), n = new THREE.Vector3();
  function tri(a, b, c, want) {
    tmpA.subVectors(b, a); tmpB.subVectors(c, a); n.crossVectors(tmpA, tmpB);
    if (n.lengthSq() < 1e-12) return;
    if (n.dot(want) < 0) { const t = b; b = c; c = t; n.negate(); }
    n.normalize();
    for (const p of [a, b, c]) { P.push(p.x, p.y, p.z); N.push(n.x, n.y, n.z); }
  }
  function add(bot, top, y0, y1, ox = 0, oz = 0, caps = true) {
    const m = bot.length;
    let cx = 0, cz = 0; for (const p of bot) { cx += p[0]; cz += p[1]; } cx /= m; cz /= m;
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m;
      const a = v3(bot[i][0] + ox, y0, bot[i][1] + oz), b = v3(bot[j][0] + ox, y0, bot[j][1] + oz);
      const c = v3(top[j][0] + ox, y1, top[j][1] + oz), d = v3(top[i][0] + ox, y1, top[i][1] + oz);
      const want = v3((bot[i][0] + bot[j][0]) / 2 - cx, 0, (bot[i][1] + bot[j][1]) / 2 - cz);
      if (want.lengthSq() < 1e-9) want.set(1, 0, 0);
      tri(a, b, c, want); tri(a, c, d, want);
    }
    if (caps) {
      for (const [ring, y, up] of [[top, y1, 1], [bot, y0, -1]]) {
        const idx = THREE.ShapeUtils.triangulateShape(ring.map((p) => new THREE.Vector2(p[0], p[1])), []);
        for (const [i, j, k] of idx) tri(v3(ring[i][0] + ox, y, ring[i][1] + oz), v3(ring[j][0] + ox, y, ring[j][1] + oz), v3(ring[k][0] + ox, y, ring[k][1] + oz), v3(0, up, 0));
      }
    }
  }
  function geom() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    return g;
  }
  return { add, geom };
}

function label(text, sub, col = "#ffffff", w = 1024, h = 256, bg = null) {
  return canvasTex(w, h, (c) => {
    if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); }
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = col; c.font = `800 ${Math.round(h * (sub ? 0.46 : 0.62))}px Arial, sans-serif`;
    c.fillText(text, w / 2, sub ? h * 0.38 : h * 0.52);
    if (sub) { c.font = `600 ${Math.round(h * 0.2)}px Arial, sans-serif`; c.globalAlpha = 0.8; c.fillText(sub, w / 2, h * 0.8); }
  });
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 2500);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    km: A_("s1:kilometer", 0.45), tapi: A_("s1:Tapi", 1.35), atas: A_("s1:atas", 2.0), bagai: A_("s1:Bagaimana", 2.6), berdiri: A_("s1:berdiri", 4.4),
    nov: A_("s2:November", s.s2 + 0.7), menembus: A_("s2:menembus", s.s2 + 2), n120: A_("s2:120", s.s2 + 2.8), n480: A_("s2:480", s.s2 + 4.4),
    mangkrak: A_("s2:mangkrak", s.s2 + 6.7), lanjut: A_("s2:dilanjutkan", s.s2 + 8.8), target: A_("s2:targetnya", s.s2 + 11.3), km2: A_("s2:kilometer", s.s2 + 15),
    fond: A_("s3:Fondasinya", s.s3), berongga: A_("s3:berongga", s.s3 + 1.7), ada: A_("s3:Ada", s.s3 + 2.4), tiang: A_("s3:tiang", s.s3 + 4.1), sedalam: A_("s3:sedalam", s.s3 + 4.9),
    n105: A_("s3:105", s.s3 + 6.8), diikat: A_("s3:diikat", s.s3 + 7.9), pelat: A_("s3:pelat", s.s3 + 8.2),
    dari: A_("s4:Dari", s.s4), Y: A_("s4:Y", s.s4 + 2.2), inti: A_("s4:Inti", s.s4 + 2.7), sayap: A_("s4:sayap", s.s4 + 4.9), beban: A_("s4:Bebannya", s.s4 + 6.2),
    dinding: A_("s4:dinding", s.s4 + 7.2), kolom: A_("s4:kolom", s.s4 + 8), tiga: A_("s4:Tiga", s.s4 + 8.6), stabil: A_("s4:stabil", s.s4 + 10.9),
    pompa: A_("s5:Satu", s.s5), estafet: A_("s5:estafet", s.s5 + 3.5), pertama: A_("s5:pertama", s.s5 + 4.6), kedua: A_("s5:kedua", s.s5 + 7.4), terus: A_("s5:meneruskan", s.s5 + 7.8),
    musuh: A_("s6:Musuh", s.s6), angin: A_("s6:Angin", s.s6 + 1.6), pusaran: A_("s6:pusaran", s.s6 + 2.4), ayun: A_("s6:mengayunkan", s.s6 + 4.1), karena: A_("s6:Karena", s.s6 + 5.4),
    pendek: A_("s6:pendek", s.s6 + 8.1), kompak: A_("s6:kompak", s.s6 + 10.1), semua: A_("s6:Semuanya", s.s6 + 10.7), tunnel: A_("s6:terowongan", s.s6 + 11.9),
    baja: A_("s7:baja", s.s7 + 2.7), berat: A_("s7:berat", s.s7 + 3.5), lift: A_("s7:Lift", s.s7 + 4.1), karbon: A_("s7:karbon", s.s7 + 7), n630: A_("s7:630", s.s7 + 8.1),
    liftnya: A_("s7:Liftnya", s.s7 + 10), sepuluh: A_("s7:sepuluh", s.s7 + 11.2), ujung: A_("s7:ujung", s.s7 + 13.4), peredam: A_("s7:peredam", s.s7 + 14.3), goyang: A_("s7:goyangan", s.s7 + 15.7),
    akar: A_("s8:Akar", s.s8), kaki: A_("s8:kaki", s.s8 + 1.5), kecoh: A_("s8:pengecoh", s.s8 + 2.6), ikuti: A_("s8:Ikuti", s.s8 + 3.7),
  };
  const win = (t, a, b, fi = 0.5, fo = 0.5) => ramp(t, a - fi, a) * (1 - ramp(t, b, b + fo));

  const S = new THREE.Scene();
  S.background = new THREE.Color(0x0b0c0f);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  S.add(new THREE.AmbientLight(0xe5e7eb, 0.16));
  const hemi = new THREE.HemisphereLight(0xf4f1ea, 0x2a2c33, 0.22); S.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e2, 1.55);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  S.add(sun, sun.target);
  const proj = new THREE.SpotLight(0x7fe8ff, 0, 0, Math.PI / 7, 0.8, 0); proj.position.set(0, 160, 40); S.add(proj, proj.target);

  // ---------------- shared tower uniforms + shader patch ----------------
  const U = {
    uH: { value: TOP + 1 }, uCut: { value: 999 }, uLiftV: { value: v3(0, 0, 0) }, uSway: { value: 0 },
    uBandY: { value: -99 }, uBandW: { value: 1.2 }, uBandC: { value: new THREE.Color(0, 0, 0) },
  };
  function patch(mat, mode, kind) {
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = "uniform float uCut;uniform vec3 uLiftV;uniform float uSway;varying vec3 vLP;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\nvLP=position;if(position.y>uCut)transformed+=uLiftV;if(position.y>80.0){float kk=(position.y-80.0)/21.0;transformed.x+=uSway*kk*kk;}");
      let f = "uniform float uH,uBandY,uBandW,uCut;uniform vec3 uBandC;varying vec3 vLP;\n" + sh.fragmentShader.replace("void main() {", "void main() {\n" + (kind === "depth" ? "if(vLP.y>uCut)discard;" : "") + (mode === "below" ? "if(vLP.y>uH)discard;" : mode === "above" ? "if(vLP.y<uH)discard;" : ""));
      if (kind === "std") {
        f = f.replace("#include <color_fragment>", "#include <color_fragment>\n{float fl=(vLP.y+0.2)/0.4;float w=fwidth(fl);float dd=min(fract(fl),1.0-fract(fl));float ln=1.0-smoothstep(0.0,max(w*1.2,0.05),dd);float fade=1.0-smoothstep(0.25,0.6,w);diffuseColor.rgb*=1.0-0.2*ln*fade;}");
        f = f.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n{float bd=(vLP.y-uBandY)/uBandW;totalEmissiveRadiance+=uBandC*exp(-bd*bd);}");
      }
      sh.fragmentShader = f;
    };
    mat.customProgramCacheKey = () => "ep17" + mode + kind;
    return mat;
  }

  // ---------------- tower geometry (merged prisms) ----------------
  function buildTower() {
    const pr = Prisms();
    const e = 0.001;
    for (let y = 0; y < 80; y += 2) pr.add(towerPlan(y + e), towerPlan(y + 2 - e), y > 0 ? y + 0.004 : 0, y + 2);
    const sp = [[80, 1.25], [84, 1.0], [88, 0.75], [92, 0.5], [96, 0.28], [TOP, 0.05]];
    for (let i = 0; i < sp.length - 1; i++) pr.add(circlePts(sp[i][1]), circlePts(sp[i + 1][1]), sp[i][0], sp[i + 1][0]);
    return pr.geom();
  }
  const tGeo = buildTower();
  const tower = new THREE.Group(); S.add(tower);
  const plasterT = patch(new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.86, metalness: 0, transparent: true, emissive: 0x000000 }), "below", "std");
  const towerM = new THREE.Mesh(tGeo, plasterT); towerM.castShadow = towerM.receiveShadow = true; tower.add(towerM);
  towerM.customDepthMaterial = patch(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), "below", "depth");
  const ghostM = patch(new THREE.MeshBasicMaterial({ color: 0x9fefff, transparent: true, opacity: 0, depthWrite: false }), "above", "basic");
  const ghost = new THREE.Mesh(tGeo, ghostM); tower.add(ghost);
  const eGeo = new THREE.EdgesGeometry(tGeo, 25);
  const edgeSolidM = patch(new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0, depthWrite: false }), "below", "line");
  const edgeGhostM = patch(new THREE.LineBasicMaterial({ color: 0x8ff3ff, transparent: true, opacity: 0, depthWrite: false }), "above", "line");
  const edgeSolid = new THREE.LineSegments(eGeo, edgeSolidM); tower.add(edgeSolid);
  const edgeGhost = new THREE.LineSegments(eGeo, edgeGhostM); tower.add(edgeGhost);
  // sky terrace (630 m) on the tallest wing
  const dkTh = TH[2], dkR = wingL(2, 63) + 1.0;
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.32, 40), new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.8, emissive: CYAN, emissiveIntensity: 0 }));
  deck.position.set(Math.cos(dkTh) * dkR, 63, Math.sin(dkTh) * dkR); deck.castShadow = true; tower.add(deck);

  // ---------------- exhibition table, road, city ----------------
  const tableTex = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = "#d9d6cf"; c.fillRect(0, 0, w, w);
    const R = mulberry(9);
    for (let i = 0; i < 26000; i++) { c.fillStyle = R() > 0.5 ? "rgba(120,110,95,.05)" : "rgba(255,255,255,.08)"; c.fillRect(R() * w, R() * w, 1 + R() * 2, 1 + R() * 2); }
    c.strokeStyle = "rgba(90,90,100,.08)"; c.lineWidth = 2;
    for (let x = 0; x <= w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, w); c.stroke(); c.beginPath(); c.moveTo(0, x); c.lineTo(w, x); c.stroke(); }
  }, [14, 14]);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.92 }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; S.add(table);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(324, 6, 324), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.45, metalness: 0.2 }));
  plinth.position.y = -3.02; S.add(plinth);
  const floorG = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ color: 0x0d0e11, roughness: 0.6 }));
  floorG.rotation.x = -Math.PI / 2; floorG.position.y = -40; S.add(floorG);
  // road the tower is laid along in s1
  const roadTex = canvasTex(256, 1024, (c, w, h) => {
    c.fillStyle = "#d4d1ca"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#f7f6f2"; for (let y = 0; y < h; y += 128) c.fillRect(w / 2 - 4, y, 8, 64);
    c.fillStyle = "#c2beb6"; c.fillRect(0, 0, 10, h); c.fillRect(w - 10, 0, 10, h);
  }, [1, 12]);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 190), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.9 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -60); road.receiveShadow = true; S.add(road);
  // city massing (deterministic)
  {
    const pr = Prisms(); const R = mulberry(1707);
    let n = 0;
    for (let k = 0; k < 900 && n < 150; k++) {
      const a = R() * Math.PI * 2, rr = 15 + Math.pow(R(), 0.8) * 125;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (Math.abs(x) < 7 && z < 28) continue;            // keep the road clear
      if (x < -50 && x > -92 && Math.abs(z) < 24) continue; // wind-tunnel box site
      const w = 2 + R() * 4.5, d = 2 + R() * 4.5, hh = 0.6 + Math.pow(R(), 2.2) * (rr < 40 ? 6 : 14);
      const ring = roundRect(w, d, 0.35).map(([px, pz]) => { const c = Math.cos(a), si = Math.sin(a); return [px * c - pz * si, px * si + pz * c]; });
      pr.add(ring, ring, 0, hh, x, z); n++;
    }
    const city = new THREE.Mesh(pr.geom(), new THREE.MeshStandardMaterial({ color: 0xdedbd4, roughness: 0.9 }));
    city.castShadow = city.receiveShadow = true; S.add(city);
  }
  // AUDIRA model label plate on the table (visible in the opening and the plaza shot)
  const plateTex = canvasTex(1024, 384, (c, w, h) => {
    c.fillStyle = "#16171b"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffb703"; c.fillRect(0, 0, 16, h);
    c.fillStyle = "#ffffff"; c.font = "800 150px Arial, sans-serif"; c.textBaseline = "middle"; c.fillText("AUDIRA", 60, h * 0.4);
    c.fillStyle = "#00e5ff"; c.font = "600 50px Arial, sans-serif"; c.fillText("MODEL STUDI  ·  JEDDAH TOWER", 64, h * 0.78);
  });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 3.4), [0, 0, 1, 0, 0, 0].map((k) => k ? new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.5 }) : new THREE.MeshStandardMaterial({ color: 0x16171b, roughness: 0.5 })));
  plate.position.set(12, 0.4, 30); plate.rotation.set(-0.25, -0.5, 0); plate.castShadow = true; S.add(plate);
  // site hoarding ring with the AUDIRA mark (seen close at the plaza)
  {
    const hTex = canvasTex(1024, 128, (c, w, h) => {
      c.fillStyle = "#f4f2ec"; c.fillRect(0, 0, w, h); c.fillStyle = "#ffb703"; c.fillRect(0, h - 18, w, 18);
      c.fillStyle = "#16171b"; c.font = "800 70px Arial, sans-serif"; c.textBaseline = "middle"; c.fillText("AUDIRA", 40, h * 0.44);
      c.fillStyle = "#4a4d55"; c.font = "600 40px Arial, sans-serif"; c.fillText("PROYEK GEDUNG 1 KM", 380, h * 0.46);
    });
    const hm = new THREE.MeshStandardMaterial({ map: hTex, roughness: 0.8 });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.1, rr = 11.5;
      if (Math.abs(Math.cos(a) * rr) < 4 && Math.sin(a) * rr < 0) continue;
      const b = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.32, 0.05), hm);
      b.position.set(Math.cos(a) * rr, 0.16, Math.sin(a) * rr); b.rotation.y = -a + Math.PI / 2; b.castShadow = true; S.add(b);
    }
  }
  // generic people for scale (built in metres, scaled to model units)
  const people = new THREE.Group(); S.add(people);
  {
    const R = mulberry(44);
    const skins = [0xc68a62, 0x8d5a3b, 0xe0b48f, 0xa86f4c, 0x6e4430];
    const cloth = [[0x2f4f6f, 0x2b2b30], [0xb4553a, 0x3a3f4a], [0xf0efe9, 0x5a4a3a], [0x3c6e5a, 0x24262b], [0x7a3b5a, 0x2f3540], [0xe0b030, 0x34363d], [0x4a6fa8, 0xd8d2c4], [0x5c5f66, 0x1f2024]];
    const cap = (r_, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r_, l, 4, 10), m);
    const spots = [[2.45, 16.5, 0.4], [2.95, 16.2, 2.8], [2.1, 15.7, -0.5], [3.25, 15.6, 0.2], [2.7, 15.1, 0.9], [1.7, 16.7, -2.4], [3.5, 16.8, 3.0], [2.3, 14.6, -1.5]];
    spots.forEach(([x, z, ry], i) => {
      const g = new THREE.Group();
      const skin = new THREE.MeshStandardMaterial({ color: skins[i % skins.length], roughness: 0.6 });
      const [top, bot] = cloth[i];
      const tm = new THREE.MeshStandardMaterial({ color: top, roughness: 0.8 }), bm = new THREE.MeshStandardMaterial({ color: bot, roughness: 0.85 });
      const walk = i % 3 === 0 ? 0.35 : 0.08;
      // legs: thigh + shin, knees bent
      for (const sd of [-1, 1]) {
        const hip = new THREE.Group(); hip.position.set(sd * 0.1, 0.92, 0); hip.rotation.x = sd * walk; g.add(hip);
        const th = cap(0.065, 0.32, bm); th.position.y = -0.21; hip.add(th);
        const knee = new THREE.Group(); knee.position.y = -0.43; knee.rotation.x = 0.18 + (sd > 0 ? 0.2 : 0) * walk * 2; hip.add(knee);
        const sh = cap(0.055, 0.32, bm); sh.position.y = -0.2; knee.add(sh);
        const ft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.24), new THREE.MeshStandardMaterial({ color: 0x1d1d20 })); ft.position.set(0, -0.42, 0.05); knee.add(ft);
      }
      const pel = cap(0.12, 0.14, bm); pel.rotation.z = Math.PI / 2; pel.position.y = 0.95; g.add(pel);
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.15, 0.56, 14), tm); torso.scale.z = 0.62; torso.position.y = 1.25; g.add(torso);
      const neck = cap(0.045, 0.06, skin); neck.position.y = 1.58; g.add(neck);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), skin); head.position.y = 1.72; head.scale.set(0.92, 1.05, 1); g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x1b1612, roughness: 0.9 })); hair.position.y = 1.735; hair.rotation.x = -0.25; g.add(hair);
      for (const sd of [-1, 1]) { const ey = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: 0x111111 })); ey.position.set(sd * 0.038, 1.735, 0.1); g.add(ey); }
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), skin); nose.position.set(0, 1.71, 0.11); g.add(nose);
      for (const sd of [-1, 1]) {
        const sh = new THREE.Group(); sh.position.set(sd * 0.25, 1.49, 0); sh.rotation.set(-sd * walk * 0.8, 0, sd * 0.12); g.add(sh);
        const up = cap(0.05, 0.24, tm); up.position.y = -0.15; sh.add(up);
        const el = new THREE.Group(); el.position.y = -0.3; el.rotation.x = -0.45; sh.add(el);
        const fo = cap(0.042, 0.22, skin); fo.position.y = -0.14; el.add(fo);
      }
      g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
      g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(0.1);
      g.userData = { walk: i % 3 === 0, x, z, ry };
      people.add(g);
    });
  }

  // ---------------- s1 ruler along the road ----------------
  const ruler = new THREE.Group(); S.add(ruler);
  const rulerM = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0, toneMapped: false });
  for (let k = 0; k <= 10; k++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(k % 5 ? 3.2 : 6.4, 0.05, 0.35), rulerM); tk.position.set(-6.6, 0.06, -k * 10.08); ruler.add(tk); }
  { const ln = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, TOP), rulerM); ln.position.set(-8.2, 0.06, -TOP / 2); ruler.add(ln); }
  const kmTex = label("1 KM", null, "#ffb703", 1024, 384);
  const kmM = new THREE.MeshBasicMaterial({ map: kmTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const kmLbl = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), kmM); kmLbl.rotation.x = -Math.PI / 2; kmLbl.position.set(-2, 0.1, -TOP - 7); ruler.add(kmLbl);

  // ---------------- Burj Khalifa ghost (s2) ----------------
  const burj = new THREE.Group(); burj.position.set(-42, 0, -30); S.add(burj);
  const burjM = new THREE.MeshBasicMaterial({ color: 0xb8c4d8, transparent: true, opacity: 0, depthWrite: false });
  const burjE = new THREE.LineBasicMaterial({ color: 0xd8e2f0, transparent: true, opacity: 0, depthWrite: false });
  {
    const pr = Prisms(); const ends = [34, 46, 58];
    const bL = (i, y) => (y >= ends[i] ? 1.6 : 1.6 + 3.4 * (1 - y / ends[i] * 0.8));
    for (let y = 0; y < 64; y += 2) pr.add(planPts([0, 1, 2].map((i) => bL(i, y + 0.001)), 1.2), planPts([0, 1, 2].map((i) => bL(i, y + 1.999)), 1.2), y, y + 2);
    const sp = [[64, 1.0], [70, 0.7], [76, 0.4], [82.8, 0.05]];
    for (let i = 0; i < sp.length - 1; i++) pr.add(circlePts(sp[i][1], 10), circlePts(sp[i + 1][1], 10), sp[i][0], sp[i + 1][0]);
    const g = pr.geom(); burj.add(new THREE.Mesh(g, burjM)); burj.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), burjE));
  }
  const burjLM = new THREE.MeshBasicMaterial({ map: label("BURJ KHALIFA", null, "#dfe8f5", 1024, 192), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const burjL = new THREE.Mesh(new THREE.PlaneGeometry(22, 4.1), burjLM); burjL.position.set(0, 88, 0); burj.add(burjL);
  const kmTopM = new THREE.MeshBasicMaterial({ map: label("> 1 KM", null, "#ffb703", 1024, 256), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const kmTop = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), kmTopM); kmTop.position.set(0, TOP + 5, 0); tower.add(kmTop);
  const ringTopM = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide, depthWrite: false });
  const ringTop = new THREE.Mesh(new THREE.RingGeometry(6.5, 7.0, 64), ringTopM); ringTop.rotation.x = -Math.PI / 2; ringTop.position.y = TOP; tower.add(ringTop);

  // ---------------- cranes (ride the construction top) ----------------
  const craneM = new THREE.MeshStandardMaterial({ color: 0xf0a81c, roughness: 0.55, emissive: 0x3a2400, emissiveIntensity: 0.4 });
  const cranes = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.32, 6, 0.32), craneM); mast.position.y = 3; g.add(mast);
    const jibG = new THREE.Group(); jibG.position.y = 6.1; g.add(jibG);
    const jib = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.28, 0.24), craneM); jib.position.x = 3.2; jibG.add(jib);
    const cj = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.5), craneM); cj.position.x = -1.6; jibG.add(cj);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.42), new THREE.MeshStandardMaterial({ color: 0x23252b, roughness: 0.4 })); cab.position.set(0.4, -0.35, 0.3); jibG.add(cab);
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 4), new THREE.MeshBasicMaterial({ color: 0x333333 })); hook.position.set(6.2, -1.5, 0); jibG.add(hook);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    g.userData.jib = jibG; tower.add(g); cranes.push(g);
  }

  // ---------------- s3 ground section: strata, 270 piles, raft ----------------
  const ground = new THREE.Group(); S.add(ground);
  const strata = [];
  const mkStrat = (y0, y1, base, holes, seed) => {
    const tx = canvasTex(512, 256, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const R = mulberry(seed);
      for (let i = 0; i < holes; i++) { const rr = 2 + R() * 9; c.fillStyle = `rgba(40,34,28,${0.18 + R() * 0.3})`; c.beginPath(); c.ellipse(R() * w, R() * h, rr * 1.6, rr, R() * 3, 0, 7); c.fill(); }
      for (let i = 0; i < 2500; i++) { c.fillStyle = R() > 0.5 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)"; c.fillRect(R() * w, R() * h, 2, 2); }
    });
    const m = new THREE.MeshStandardMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false, roughness: 0.95, side: THREE.DoubleSide });
    const b = new THREE.Mesh(new THREE.BoxGeometry(34, y1 - y0, 26), m); b.position.y = (y0 + y1) / 2; b.renderOrder = 2; ground.add(b); strata.push(m);
  };
  mkStrat(-1.4, -0.02, "#d9cdb4", 40, 3);
  mkStrat(-6.2, -1.4, "#c9b48f", 260, 4);
  mkStrat(-12.4, -6.2, "#a8916f", 120, 5);
  const pilePts = [];
  {
    const base = towerPlan(0), R = mulberry(270);
    const inside = (x, z) => { let c = false; for (let i = 0, j = base.length - 1; i < base.length; j = i++) { const [xi, zi] = base[i], [xj, zj] = base[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
    const cand = [];
    for (let x = -8; x <= 8; x += 0.62) for (let z = -8; z <= 8; z += 0.62) { const ok = inside(x, z) || inside(x * 0.9, z * 0.9) || inside(x * 0.82, z * 0.82); if (ok) cand.push([x, z, Math.hypot(x, z)]); }
    cand.sort((a, b) => a[2] - b[2]);
    const step = cand.length / 270;
    for (let i = 0; i < 270; i++) { const c = cand[Math.min(cand.length - 1, Math.floor(i * step))]; pilePts.push([c[0] + (R() - 0.5) * 0.08, c[1] + (R() - 0.5) * 0.08, c[2]]); }
  }
  const pmax = Math.max(...pilePts.map((p) => p[2]));
  const pileM = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.7, emissive: AMBER, emissiveIntensity: 0 });
  const piles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.085, 0.085, 1, 10), pileM, 270);
  piles.frustumCulled = false; piles.renderOrder = 1; ground.add(piles);
  const pileLen = pilePts.map((p) => 4.5 + 6.0 * Math.pow(1 - p[2] / pmax, 1.3));   // 45 m at the rim, 105 m under the core
  const raftPlan = planPts([L0 + 0.9, L0 + 0.9, L0 + 0.9], 1.75 + 0.9);
  const raftG = (() => { const pr = Prisms(); pr.add(raftPlan, raftPlan, -0.5, 0); return pr.geom(); })();
  const raftM = new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.75, emissive: AMBER, emissiveIntensity: 0, transparent: true, opacity: 0 });
  const raft = new THREE.Mesh(raftG, raftM); ground.add(raft);
  const raftEdge = new THREE.LineSegments(new THREE.EdgesGeometry(raftG), new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0, toneMapped: false })); ground.add(raftEdge);

  // ---------------- s4 plan walls on the cut at y=20 ----------------
  const CUTY = 20;
  const planG = new THREE.Group(); planG.position.y = CUTY + 0.03; tower.add(planG);
  const wallCy = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, toneMapped: false });
  const wallAm = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0, toneMapped: false });
  const seg = (a, b, wdt, m, hgt = 0.5) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    const w = new THREE.Mesh(new THREE.BoxGeometry(len + wdt, hgt, wdt), m);
    w.position.set((a[0] + b[0]) / 2, hgt / 2, (a[1] + b[1]) / 2); w.rotation.y = -Math.atan2(dz, dx); planG.add(w); return w;
  };
  {
    const p = towerPlan(CUTY + 0.01);
    for (let i = 0; i < p.length; i++) seg(p[i], p[(i + 1) % p.length], 0.2, wallCy);
    const hw = hwAt(CUTY), cr = hw / Math.sin(Math.PI / 3);
    const tri = [0, 1, 2].map((i) => { const a = TH[i] + Math.PI / 3; return [Math.cos(a) * cr, Math.sin(a) * cr]; });
    const triIn = [0, 1, 2].map((i) => { const a = TH[i] - Math.PI / 3; return [Math.cos(a) * cr, Math.sin(a) * cr]; });
    for (let i = 0; i < 3; i++) seg(triIn[i], triIn[(i + 1) % 3], 0.3, wallAm, 0.62);
    for (let i = 0; i < 3; i++) { const L = wingL(i, CUTY), d = [Math.cos(TH[i]), Math.sin(TH[i])]; seg([d[0] * cr * 0.5, d[1] * cr * 0.5], [d[0] * (L - 0.25), d[1] * (L - 0.25)], 0.16, wallCy); }
    // corridor cross walls
    for (let i = 0; i < 3; i++) { const L = wingL(i, CUTY), d = [Math.cos(TH[i]), Math.sin(TH[i])], n = [-d[1], d[0]]; for (const f of [0.45, 0.72]) { const c = [d[0] * L * f, d[1] * L * f]; seg([c[0] - n[0] * hw, c[1] - n[1] * hw], [c[0] + n[0] * hw, c[1] + n[1] * hw], 0.12, wallCy, 0.4); } }
    void tri;
  }
  // tripod: three load legs from core to wing tips + the stability triangle
  const tripod = new THREE.Group(); tripod.position.y = CUTY + 0.9; tower.add(tripod);
  const tripM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
  const tripLegs = [];
  for (let i = 0; i < 3; i++) {
    const L = wingL(i, CUTY) + 0.6, d = v3(Math.cos(TH[i]), 0, Math.sin(TH[i]));
    const g = new THREE.Group(); g.rotation.y = -TH[i]; tripod.add(g);
    const sh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 0.3), tripM); sh.position.x = 0.5; g.add(sh);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 16), tripM); hd.rotation.z = -Math.PI / 2; g.add(hd);
    tripLegs.push({ g, sh, hd, L, d });
  }
  const triLineM = new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0, toneMapped: false });
  {
    const pts = [0, 1, 2, 0].map((i) => { const L = wingL(i, CUTY) + 0.6; return v3(Math.cos(TH[i]) * L, 0, Math.sin(TH[i]) * L); });
    tripod.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), triLineM));
  }

  // ---------------- s5 concrete relay ----------------
  const relay = new THREE.Group(); tower.add(relay);
  const pipeM = new THREE.MeshStandardMaterial({ color: 0x3a3c42, roughness: 0.4, metalness: 0.6, emissive: AMBER, emissiveIntensity: 0, transparent: true, opacity: 0 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 10), pipeM); relay.add(pipe);
  const pipeH = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 14, 10), pipeM); pipeH.rotation.x = Math.PI / 2; pipeH.position.set(0.7, 0.4, 7); relay.add(pipeH);
  const pumpM = new THREE.MeshStandardMaterial({ color: 0xf0a81c, roughness: 0.5, emissive: AMBER, emissiveIntensity: 0, transparent: true, opacity: 0 });
  const pump1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.6), pumpM); pump1.position.set(0.7, 0.7, 14.5); relay.add(pump1);
  const pump2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 1.5), pumpM); pump2.position.set(0.7, 50, 0); relay.add(pump2);
  const NC = 70;
  const blobs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffc94d, toneMapped: false }), NC);
  blobs.frustumCulled = false; relay.add(blobs);
  const m500 = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide, depthWrite: false });
  const ring500 = new THREE.Mesh(new THREE.RingGeometry(7.6, 8.0, 64), m500); ring500.rotation.x = -Math.PI / 2; ring500.position.y = 50; tower.add(ring500);
  const l500M = new THREE.MeshBasicMaterial({ map: label("± 500 m", null, "#ffb703", 1024, 256), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const l500 = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), l500M); l500.position.set(-2, 51.6, 10); tower.add(l500);

  // ---------------- s6 wind tunnel: straight box vs tapered tower ----------------
  const BOXX = -72;
  const boxG = new THREE.Group(); boxG.position.set(BOXX, 0, 0); S.add(boxG);
  {
    const pr = Prisms(); const rr = roundRect(12, 12, 0.6);
    for (let y = 0; y < 70; y += 2) pr.add(rr, rr, y, y + 2);
    const bm = patch(new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.86 }), "none", "std");
    const b = new THREE.Mesh(pr.geom(), bm); b.castShadow = b.receiveShadow = true; boxG.add(b);
  }
  const NLY = 5, NLZ = 5, NPL = 30;
  const NW = NLY * NLZ * NPL;
  const windM = new THREE.MeshBasicMaterial({ color: 0x14d8ef, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const windBox = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), windM, NW);
  const windTow = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), windM, NW);
  windBox.frustumCulled = windTow.frustumCulled = false; S.add(windBox, windTow);
  const WS = []; { const R = mulberry(606); for (let i = 0; i < NW; i++) WS.push(R()); }
  const PH = []; { const R = mulberry(818); for (let j = 0; j < NLY; j++) PH.push([R() * 6.28, 0.6 + R() * 0.9, 0.5 + R() * 0.7]); }
  const tunnelM = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0, toneMapped: false });
  const tunnel = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(70, 80, 34)), tunnelM); tunnel.position.set(6, 40, 0); S.add(tunnel);
  const tunLM = new THREE.MeshBasicMaterial({ map: label("TEROWONGAN ANGIN", null, "#00e5ff", 1024, 160), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const tunL = new THREE.Mesh(new THREE.PlaneGeometry(28, 4.4), tunLM); tunL.position.set(6, 62, 18); S.add(tunL);

  // ---------------- s7 lifts: steel vs carbon rope, double-deck car, spire dampers ----------------
  const lifts = new THREE.Group(); tower.add(lifts);
  const glassM = new THREE.MeshBasicMaterial({ color: 0x9fefff, transparent: true, opacity: 0, depthWrite: false });
  const shaftL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1, 1.1), glassM); lifts.add(shaftL);
  const shaftR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1, 1.1), glassM); lifts.add(shaftR);
  const steelM = new THREE.MeshStandardMaterial({ color: 0x7c8088, roughness: 0.35, metalness: 0.9, transparent: true, opacity: 0 });
  const steel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1, 10), steelM); lifts.add(steel);
  const carbM = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.25, metalness: 0.3, emissive: CYAN, emissiveIntensity: 0, transparent: true, opacity: 0 });
  const carb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1, 0.05), carbM); lifts.add(carb);
  const redM = new THREE.MeshBasicMaterial({ color: 0xff4b3e, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const steelStop = new THREE.Group(); lifts.add(steelStop);
  { const a = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.22, 0.22), redM); a.rotation.z = 0.785; const b = a.clone(); b.rotation.z = -0.785; steelStop.add(a, b); }
  const wArrows = [];
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 12), redM); c.rotation.z = Math.PI; lifts.add(c); wArrows.push(c); }
  const carM = new THREE.MeshStandardMaterial({ color: 0xf6f4ee, roughness: 0.5, emissive: CYAN, emissiveIntensity: 0.25, transparent: true, opacity: 0 });
  const car = new THREE.Group(); lifts.add(car);
  for (const yy of [0, 0.62]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.85), carM); c.position.y = yy; car.add(c); }
  const streakM = new THREE.MeshBasicMaterial({ color: 0xbff6ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const NSK = 24, streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1, 0.05), streakM, NSK); streaks.frustumCulled = false; lifts.add(streaks);
  const SK = []; { const R = mulberry(10); for (let i = 0; i < NSK; i++) SK.push([(R() - 0.5) * 2.6, R() * 10, (R() - 0.5) * 2.6, 1 + R() * 2]); }
  const dampM = new THREE.MeshStandardMaterial({ color: 0x9da3ad, roughness: 0.3, metalness: 0.8, emissive: AMBER, emissiveIntensity: 0 });
  const damp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.0, 20), dampM); tower.add(damp1);
  const damp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 20), dampM); tower.add(damp2);
  const l630M = new THREE.MeshBasicMaterial({ map: label("> 630 m", "DEK PENGAMATAN", "#00e5ff", 1024, 320), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const l630 = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.45), l630M); tower.add(l630);

  // ---------------- post: NaN guard -> bloom -> output -> clean studio grade ----------------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 bad=bvec4(isnan(c.r)||isinf(c.r),isnan(c.g)||isinf(c.g),isnan(c.b)||isinf(c.b),isnan(c.a)||isinf(c.a));if(any(bad))c=vec4(0.,0.,0.,1.);gl_FragColor=vec4(clamp(c.rgb,0.,64.),c.a);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.28, 0.4, 1.35);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c*=mix(vec3(.95,.99,1.05),vec3(1.03,1.,.95),smoothstep(.15,.8,l));c=(c-.5)*1.06+.5;gl_FragColor=vec4(clamp(c,0.,1.),1.);}" })));

  // ================================================================ choreography
  const dmy = new THREE.Object3D();
  // construction height: full model, then the real 2 Nov state (~480 m) with the rest as ghost, then floors added in s5
  const FLOOR = 0.4;
  function hTAt(t) {
    if (t < E.menembus - 0.4) return TOP + 1;
    if (t < s.s5) return lerp(TOP + 1, 48, eout(ramp(t, E.menembus - 0.4, E.menembus + 1.2)));
    if (t < s.s6) {
      const g = 48 + 8 * ramp(t, E.pertama - 0.6, E.kedua) + 22 * ramp(t, E.kedua, s.s5e + 0.2);
      return Math.floor(g / FLOOR) * FLOOR + 0.01;
    }
    return lerp(78, TOP + 1, ramp(t, s.s6 + 0.2, E.pusaran + 1));
  }
  // camera spline (pos xyz, look xyz); every key on an anchor
  const CAM = track([
    [0, 30, 44, 60, 0, 0, -42],
    [E.tapi, 30, 34, 58, 0, 6, -30],
    [E.atas + 1.0, 30, 3.5, 40, 0, 40, 0],
    [E.berdiri + 0.5, 36, 5, 47, 0, 47, 0],
    [E.nov, 42, 16, 56, 0, 42, 0],
    [E.menembus + 1.2, 24, 44, 33, 0, 46, 0],
    [E.mangkrak, -6, 52, 34, 0, 48, 0],
    [E.target, -46, 44, 98, -12, 50, -10],
    [E.km2 + 0.4, -58, 52, 132, -12, 52, -12],
    [s.s3 + 0.4, 14, 10, 36, 0, 4, 2],
    [E.berongga, 2.75, 0.2, 18.1, 2.4, 1.3, 10],
    [E.ada + 0.3, 9, -3, 36, 0, -3.5, 0],
    [E.sedalam, 6, -6.5, 40, 0, -5, 0],
    [E.pelat, 13, -2.5, 38, 0, -3, 0],
    [s.s3e, 18, 8, 38, 0, 6, 0],
    [E.dari + 0.6, 22, 36, 30, 0, 21, 0],
    [E.Y, 2, 92, 13, 0, 20, -9],
    [E.tiga, -4, 88, 15, 0, 20, -9],
    [s.s4e, 6, 46, 30, 0, 24, 0],
    [s.s5 + 0.5, 30, 15, 44, 0, 14, 0],
    [E.pertama, 36, 40, 54, 0, 45, 0],
    [E.kedua, 33, 52, 48, 0, 55, 0],
    [s.s5e, 40, 64, 62, 0, 64, 0],
    [s.s6 + 0.6, -40, 100, 86, -60, 30, 0],
    [E.pusaran, -52, 118, 58, -58, 28, -4],
    [E.ayun + 0.8, -48, 118, 60, -54, 28, -4],
    [E.karena + 0.4, -20, 120, 62, -20, 30, -4],
    [E.pendek, 12, 122, 62, 14, 32, -4],
    [E.kompak, 16, 120, 64, 16, 32, -4],
    [E.tunnel, 34, 66, 108, 8, 38, 0],
    [s.s7 + 0.4, 15, 8, 24, 0, 11, 0],
    [E.baja, 15, 30, 25, 0, 34, 0],
    [E.berat, 14, 46, 23, 0, 48, 0],
    [E.lift + 0.2, 13, 8, 19, 0, 7, 0],
    [E.n630 + 0.6, 13, 62, 19, 0, 62, 0],
    [E.sepuluh, 12, 70, 20, 0, 71, 0],
    [E.ujung, 9, 84, 19, 0, 85, 0],
    [E.goyang, 11, 88, 22, 0, 87, 0],
    [s.s8 + 0.3, 44, 72, 118, 0, 48, 0],
    [s.end, 92, 62, 188, 0, 44, 0],
    [s.dur, 98, 62, 196, 0, 44, 0],
  ]);
  // s7 car height: rides the carbon shaft to the sky deck
  const carY = (t) => 0.5 + 62.4 * ramp(t, E.lift + 0.2, E.n630 + 0.6);

  return (t) => {
    // ---- sun: slow arc across the table, faster sweep in the payoff ----
    const sa = 0.6 + 0.012 * t + 0.9 * ramp(t, s.s8, s.dur);
    sun.position.set(Math.cos(sa) * 260, 250, Math.sin(sa) * 260 + 90);
    const c = CAM(t);
    const cp = v3(c[0], c[1], c[2]), ct = v3(c[3], c[4], c[5]);
    const dist = cp.distanceTo(ct);
    const half = THREE.MathUtils.clamp(dist * 0.55, 10, 130);
    sun.target.position.copy(ct); sun.target.position.y = 0;
    sun.position.add(sun.target.position);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 800 });
    sun.shadow.camera.updateProjectionMatrix();

    // ---- s1: tower lies along the road, then stands up ----
    const lie = 1 - eout(ramp(t, E.tapi, E.atas + 1.0));
    tower.rotation.set(-Math.PI / 2 * lie, 0, 0);
    tower.position.set(0, 2.2 * Math.sin(lie * Math.PI / 2), 0);
    const rul = 1 - ramp(t, E.atas + 0.4, E.atas + 1.4);
    rulerM.opacity = 0.95 * rul * ramp(t, -1, 0.01); kmM.opacity = rul;

    U.uCut.value = win(t, E.dari + 0.2, s.s4e - 0.6, 1.0, 0.9) > 0.0005 ? CUTY : 999;
    // ---- construction state ----
    const hT = hTAt(t);
    U.uH.value = hT;
    const ghostOn = win(t, E.menembus - 0.4, s.s6 + 1.2, 0.3, 1.0);
    ghostM.opacity = 0.07 * ghostOn; edgeGhostM.opacity = 0.5 * ghostOn;
    const xray = Math.max(win(t, s.s5 + 0.3, s.s5e, 0.6, 0.6), win(t, s.s7 + 0.2, s.s7e, 0.6, 0.8));
    plasterT.opacity = 1 - 0.8 * xray; plasterT.depthWrite = xray < 0.05;
    edgeSolidM.opacity = Math.max(0.75 * xray, 0.6 * lie);
    // projected data band: scan up the tower as it stands; amber at the working floor while it is built
    let bandY = -99, bandC = 0, bandCol = CYAN, bandW = 1.4;
    if (t < s.s2) { bandY = TOP * ramp(t, E.atas + 0.2, E.berdiri + 0.6); bandC = 1.2 * win(t, E.atas + 0.2, E.berdiri + 0.6, 0.2, 0.3); bandW = 2.4; }
    else if (t < s.s6) { bandY = hT - 0.6; bandC = (t < s.s3 ? ramp(t, E.menembus, E.menembus + 1) : t >= s.s5 ? 1 : 0.6) * 0.55; bandCol = AMBER; bandW = 0.9; }
    U.uBandY.value = bandY; U.uBandW.value = bandW; U.uBandC.value.set(bandCol).multiplyScalar(bandC);
    kmTopM.opacity = win(t, E.km2 - 0.6, s.s3 + 0.2, 0.4, 0.5) + 0.0;
    ringTopM.opacity = 0.9 * win(t, E.km2 - 0.6, s.s3 + 0.2, 0.4, 0.5);
    kmTop.quaternion.copy(cam.quaternion);
    // cranes on the construction top (wing cranes drop out where a wing has stepped back)
    const crOn = hT < TOP - 1 ? 1 : 0;
    for (let i = 0; i < 4; i++) {
      const g = cranes[i];
      let x = 0, z = 0, ok = crOn;
      if (i > 0) { const L = wingL(i - 1, hT); const th = TH[i - 1]; x = Math.cos(th) * L * 0.62; z = Math.sin(th) * L * 0.62; if (L < CORE + 0.8) ok = 0; }
      else { x = 0.4; z = 0.3; }
      g.visible = ok > 0 && U.uCut.value > 900; g.position.set(x, hT - 0.2, z); g.userData.jib.rotation.y = 0.6 * i + 0.35 * Math.sin(t * 0.35 + i * 1.7);
      g.scale.setScalar(i === 0 ? 1.1 : 0.85);
    }

    // ---- s2: Burj ghost for comparison ----
    const bj = win(t, E.target - 0.8, s.s3 + 0.3, 0.6, 0.6);
    burjM.opacity = 0.06 * bj; burjE.opacity = 0.42 * bj; burjLM.opacity = bj; burj.visible = bj > 0.002;
    burjL.quaternion.copy(cam.quaternion);

    // ---- s3: foundation x-ray ----
    const gx = Math.max(win(t, E.ada, s.s3e + 0.2, 0.9, 0.9), 0.55 * win(t, E.akar, E.kaki + 0.6, 0.4, 0.6));
    strata.forEach((m, i) => { m.opacity = gx * (i === 0 ? 0.42 : i === 1 ? 0.5 : 0.62); });
    ground.visible = gx > 0.002;
    for (let i = 0; i < 270; i++) {
      const p = pilePts[i];
      const g0 = E.tiang - 0.5 + (p[2] / pmax) * 1.4;
      const grow = t >= s.s8 ? 1 : eout(ramp(t, g0, g0 + 1.6)) * (0.43 + 0.57 * eout(ramp(t, E.sedalam + 0.2 + (p[2] / pmax) * 0.6, E.n105 + 0.5)));
      const L = pileLen[i] * grow;
      dmy.position.set(p[0], -0.5 - L / 2, p[1]); dmy.rotation.set(0, 0, 0); dmy.scale.set(1, Math.max(0.001, L), 1); dmy.updateMatrix(); piles.setMatrixAt(i, dmy.matrix);
    }
    piles.instanceMatrix.needsUpdate = true;
    pileM.emissiveIntensity = 0.55 * win(t, E.n105 - 0.2, E.diikat, 0.3, 0.8) + 0.6 * win(t, E.akar, E.kaki, 0.3, 0.6);
    const rf = ramp(t, E.pelat - 0.3, E.pelat + 0.5);
    raftM.opacity = gx * rf; raftM.emissiveIntensity = 0.35 * win(t, E.pelat, s.s3e, 0.3, 0.6);
    raftEdge.material.opacity = gx * rf;
    raft.scale.set(1, 0.05 + 0.95 * eout(rf), 1);

    // ---- s4: horizontal cut, upper model slides off, plan walls + tripod ----
    const lift = win(t, E.dari + 0.2, s.s4e - 0.6, 1.0, 0.9);
    U.uCut.value = lift > 0.0005 ? CUTY : 999;
    U.uLiftV.value.set(0, 130 * eout(lift), 0);
    const pl = win(t, E.inti - 0.2, s.s4e - 0.4, 0.4, 0.5);
    const wallsOn = win(t, E.Y - 0.3, s.s4e - 0.4, 0.4, 0.5);
    wallAm.opacity = Math.max(pl, 0.0) * (0.75 + 0.25 * Math.sin(t * 6) * win(t, E.inti, E.sayap, 0.2, 0.2));
    wallCy.opacity = wallsOn * (0.35 + 0.6 * ramp(t, E.sayap - 0.3, E.sayap + 0.3)) * (1 + 0.25 * win(t, E.dinding, E.kolom + 0.4, 0.2, 0.3));
    planG.visible = wallsOn > 0.002;
    const tp = win(t, E.tiga - 0.2, s.s4e - 0.3, 0.3, 0.4);
    tripM.opacity = tp; triLineM.opacity = tp; tripod.visible = tp > 0.002;
    tripLegs.forEach((lg, i) => {
      const k = eout(ramp(t, E.tiga - 0.2 + i * 0.18, E.tiga + 0.6 + i * 0.18));
      const len = Math.max(0.01, lg.L * k - 0.6);
      lg.sh.scale.x = len; lg.sh.position.x = len / 2 + 0.2; lg.hd.position.x = len + 0.6;
    });

    // ---- s5: relay pumps ----
    const rl = win(t, s.s5 + 0.2, s.s5e + 0.2, 0.6, 0.6);
    relay.visible = rl > 0.002;
    pipeM.opacity = rl; pumpM.opacity = rl;
    const topP = Math.min(hT, 80) - 0.3;
    pipe.scale.set(1, topP, 1); pipe.position.set(0.7, topP / 2, 0);
    const st1 = ramp(t, E.pertama - 0.5, E.pertama + 0.3), st2 = ramp(t, E.kedua - 0.3, E.kedua + 0.4);
    pumpM.emissiveIntensity = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 9));
    pump2.position.y = 50; pump2.visible = hT > 50.2;
    for (let i = 0; i < NC; i++) {
      const stage2 = i >= NC / 2;
      const ph = ((i % (NC / 2)) / (NC / 2) + t * 0.32) % 1;
      const y = stage2 ? 50 + ph * Math.max(0, topP - 50) : 0.4 + ph * 49.6;
      const on = stage2 ? st2 * (hT > 51 ? 1 : 0) : st1;
      dmy.position.set(0.7, y, 0); dmy.rotation.set(0, 0, 0); dmy.scale.setScalar(on * rl); dmy.updateMatrix(); blobs.setMatrixAt(i, dmy.matrix);
    }
    blobs.instanceMatrix.needsUpdate = true;
    const r5 = Math.max(win(t, E.pertama - 0.3, s.s5e, 0.4, 0.5), win(t, E.baja - 0.2, E.lift, 0.4, 0.5));
    m500.opacity = 0.85 * r5; l500M.opacity = r5; l500.quaternion.copy(cam.quaternion);

    // ---- s6: wind ----
    const wOn = win(t, E.angin - 0.6, s.s6e + 0.2, 0.6, 0.5), w8 = win(t, E.kecoh - 0.2, s.end, 0.4, 0.6);
    windM.opacity = 0.85 * Math.max(wOn, w8 * 0.8);
    windBox.visible = wOn > 0.002; windTow.visible = wOn > 0.002 || w8 > 0.002;
    boxG.visible = t > s.s6 - 1 && t < s.s7 + 0.5;
    const swayAmp = ramp(t, E.ayun - 0.6, E.ayun + 0.6);
    boxG.rotation.x = 0.03 * swayAmp * Math.sin(t * 3.1);
    const V = 22;
    const fill = (mesh, ox, bOf, coherent) => {
      let n = 0;
      for (let j = 0; j < NLY; j++) {
        const y = 8 + j * 12;
        const b = bOf(y);
        const om = coherent ? 3.1 : 3.1 * PH[j][1] * (5.5 / Math.max(2.5, b));
        const ph0 = coherent ? 0 : PH[j][0];
        const amp = coherent ? 0.85 * b * swayAmp + 0.25 * b : 0.38 * b * PH[j][2];
        for (let k = 0; k < NLZ; k++) {
          const z0 = (k - (NLZ - 1) / 2) * 2.9;
          for (let q = 0; q < NPL; q++) {
            const sd = WS[n];
            const sx = ((t * V + q * (110 / NPL) + sd * 3) % 110) - 45;
            const near = 1 - Math.min(1, Math.abs(z0) / (2.6 * b + 1));
            let z = z0 + Math.sign(z0 || 1) * b * 1.05 * Math.exp(-(sx * sx) / (b * b * 1.6)) * near;
            const wk = sx > 0 ? clamp01(sx / (1.6 * b)) * Math.exp(-sx / 60) : 0;
            const kk = 0.32 / Math.max(1, b / 4);
            z += wk * amp * near * Math.sin(kk * sx - om * t + ph0 + (coherent ? 0 : k * 0.9));
            const fade = clamp01((sx + 45) / 8) * clamp01((65 - sx) / 10);
            const yy = y + (coherent ? 0 : wk * 0.8 * Math.sin(sx * 0.2 + j));
            dmy.position.set(ox + sx, yy, z);
            dmy.rotation.set(0, -Math.atan2(wk * amp * near * kk * Math.cos(kk * sx - om * t + ph0), 1), 0);
            dmy.scale.set(2.6 * fade + 0.001, 0.32, 0.32);
            dmy.updateMatrix(); mesh.setMatrixAt(n, dmy.matrix); n++;
          }
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    if (wOn > 0.002) fill(windBox, BOXX, () => 6.4, true);
    if (wOn > 0.002 || w8 > 0.002) fill(windTow, 0, (y) => Math.max(...[0, 1, 2].map((i) => wingL(i, y))) * 0.8, false);
    const tu = win(t, E.semua - 0.3, s.s6e + 0.2, 0.4, 0.5);
    tunnelM.opacity = 0.8 * tu; tunLM.opacity = tu; tunL.quaternion.copy(cam.quaternion);

    // ---- s7: lifts ----
    const lf = win(t, s.s7 + 0.2, s.s7e + 0.2, 0.6, 0.6);
    lifts.visible = lf > 0.002;
    glassM.opacity = 0.12 * lf;
    shaftL.scale.set(1, 50, 1); shaftL.position.set(-1.3, 25, 0.9);
    shaftR.scale.set(1, 63, 1); shaftR.position.set(1.3, 31.5, 0.9);
    const sr = ramp(t, s.s7 + 0.3, E.baja + 0.3);
    steelM.opacity = lf; steel.scale.set(1, Math.max(0.01, 50 * sr), 1); steel.position.set(-1.3, 50 - 25 * sr, 0.9);
    const heavy = win(t, E.berat - 0.5, E.lift + 0.5, 0.3, 0.6);
    redM.opacity = heavy * lf; steelStop.position.set(-1.3, 51.2, 1.5); steelStop.scale.setScalar(0.6 + 0.4 * eout(ramp(t, E.berat - 0.4, E.berat)));
    wArrows.forEach((a, i) => { const ph = ((t * 0.9 + i / 5) % 1); a.position.set(-2.4, 50 - ph * 22, 0.9); a.scale.setScalar(heavy * (1 - ph * 0.3)); });
    const cr = ramp(t, E.lift - 0.4, E.karbon + 0.2);
    carbM.opacity = lf * cr; carbM.emissiveIntensity = 0.5 * win(t, E.karbon - 0.4, E.n630 + 1.4, 0.3, 0.6);
    carb.scale.set(1, Math.max(0.01, 63 * cr), 1); carb.position.set(1.3, 63 * cr / 2, 0.9);
    const cy = carY(t);
    carM.opacity = lf * ramp(t, E.lift - 0.5, E.lift); car.position.set(1.3, cy, 0.9);
    const spd = ramp(t, E.lift + 0.2, E.lift + 0.9) * (1 - ramp(t, E.n630 + 0.2, E.n630 + 0.6)) + win(t, E.liftnya, E.ujung - 0.4, 0.3, 0.4);
    streakM.opacity = 0.75 * spd * lf;
    for (let i = 0; i < NSK; i++) {
      const q = SK[i]; const yy = cy + 5 - ((q[1] + t * 18) % 10);
      dmy.position.set(1.3 + q[0], yy, 0.9 + q[2]); dmy.rotation.set(0, 0, 0); dmy.scale.set(1, q[3], 1); dmy.updateMatrix(); streaks.setMatrixAt(i, dmy.matrix);
    }
    streaks.instanceMatrix.needsUpdate = true;
    deck.material.emissiveIntensity = 0.6 * win(t, E.karbon, E.liftnya + 0.5, 0.4, 0.6);
    l630M.opacity = win(t, E.n630 - 0.3, E.liftnya + 0.5, 0.3, 0.5);
    l630.position.set(deck.position.x - 1.2, 65.2, deck.position.z + 1.0);
    deck.visible = U.uCut.value > 900; l630.quaternion.copy(cam.quaternion);
    // spire sway and dampers (move opposite, the sway dies away after "peredam")
    const swA = 0.9 * win(t, E.ujung - 0.6, s.s8 + 0.5, 0.5, 0.8) * (1 - 0.75 * ramp(t, E.peredam, E.goyang + 0.6));
    const sw = swA * Math.sin(t * 2.4);
    U.uSway.value = sw;
    const k1 = Math.pow((82.6 - 80) / 21, 2), k2 = Math.pow((87.4 - 80) / 21, 2);
    const dOn = ramp(t, E.peredam - 0.3, E.peredam + 0.3);
    damp1.position.set(sw * k1 - dOn * 0.55 * Math.sin(t * 2.4) * (swA > 0.01 ? 1 : 0), 82.6, 0);
    damp2.position.set(sw * k2 - dOn * 0.4 * Math.sin(t * 2.4) * (swA > 0.01 ? 1 : 0), 87.4, 0);
    dampM.emissiveIntensity = 0.7 * win(t, E.peredam - 0.2, s.s8, 0.3, 0.6);
    damp1.visible = damp2.visible = xray > 0.05;

    // ---- people: a gentle stroll on the plaza ----
    people.children.forEach((g, i) => {
      const u = g.userData;
      if (u.walk) { const d = (t * 0.12 + i) % 3; g.position.set(u.x + Math.sin(u.ry) * d * 0.4, 0, u.z + Math.cos(u.ry) * d * 0.4); }
    });

    // ---- s8 payoff: Y footprint glows on the plaza ----
    proj.intensity = 0;

    // ---- camera ----
    plinth.visible = cp.y > 0.3;
    cam.position.copy(cp); cam.lookAt(ct);
    comp.render();
  };
}
