// EP22 ASHABUS SABT, IKAN HARI SABAT. RISOFORGE: a seaside village printed as a risograph in 3D.
// The scene renders INK DENSITIES, not colours: red channel = fluorescent pink, green = teal, blue = yellow.
// A post pass turns those densities into three spot-ink plates on off-white paper: each plate is sampled with its own
// small misregistration offset, screened as a rotated halftone, mottled with riso grain, then multiplied onto paper.
// Overlaps overprint (pink+teal = deep navy, pink+yellow = red-orange, teal+yellow = green).
// World: shoreline at z=0, sea toward -z built from stacked wavy cut-paper wave bands, beach and village toward +z,
// layered paper hill on the left (x<-4). Villagers are faceless flat cut-outs drawn with ADDITIVE density (overprint).
// s1/s3: seven printed day tags on a line over the shallows; the active day is inked yellow; on SABAT fish crowd the
// surface between the wave bands (InstancedMesh), other days the water is empty.
// s4: one overprinted crowd separates like colour plates into three groups (teal: nets slipped into the water,
// pink: hands raised warning, green: standing aside with printed question marks).
// s6: the warners are re-printed safe on the hill; the violators darken into a navy smudge and dissolve (no ape shown).
// s7: aerial of the empty shore, smudge washing away. s8: calm sunset sea, nets hung up, AUDIRA stamped on a crate.
// Every value is a pure function of t (seek-safe). Run via build-video.mjs.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, clamp01, canvasTex, track, stage } from "./lib3d.js";

const D = (p, t, y) => new THREE.Color(p, t, y); // densities: pink, teal, yellow (linear, untouched by colour management)
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
// [t, v] keys, smoothstep between
const keyed = (KS) => (t) => {
  if (t <= KS[0][0]) return KS[0][1];
  for (let i = 0; i < KS.length - 1; i++) if (t < KS[i + 1][0]) return lerp(KS[i][1], KS[i + 1][1], sm((t - KS[i][0]) / Math.max(1e-3, KS[i + 1][0] - KS[i][0])));
  return KS[KS.length - 1][1];
};

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x000000, exp: 1, bloom: [0, 0, 1], fov: 38, shadow: false });
  r.toneMapping = THREE.NoToneMapping;
  bp.enabled = false;
  comp.renderTarget1.samples = 4; comp.renderTarget2.samples = 4;
  cam.near = 0.05; cam.far = 900; cam.updateProjectionMatrix();
  scene.fog = new THREE.Fog(D(0.08, 0.05, 0.06), 34, 150);
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2222);
  const DS = THREE.DoubleSide;
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, side: DS, ...o });
  // density texture: draw with rgb = pink/teal/yellow densities; no sRGB decode so 128 means 0.5
  const dtex = (w, h, draw) => { const tx = canvasTex(w, h, draw); tx.colorSpace = THREE.NoColorSpace; tx.needsUpdate = true; return tx; };
  const ink = (p, t, y, a = 1) => `rgba(${Math.round(p * 255)},${Math.round(t * 255)},${Math.round(y * 255)},${a})`;
  const MONO = "'Space Mono','Courier New',monospace";

  // ---------- timing
  const tFish1 = A("s1:ikan-ikan") - 0.3, tOther1 = A("s1:Di"), tUjian = A("s1:Ujian"), tGoda = A("s1:godaan");
  const tNeg = A("s2:negeri"), tPend = A("s2:Penduduknya"), tIbadah = A("s2:ibadah");
  const tFish3 = A("s3:ikan-ikan") - 0.35, tOther3 = A("s3:Pada"), tAyat = A("s3:Ayatnya"), tDemi = A("s3:demikianlah");
  const tSplit = A("s4:terbelah"), tGA = A("s4:Sebagian"), tCelah = A("s4:celah"), tGB = A("s4:Sebagian#2"), tNas = A("s4:menasihati");
  const tGC = A("s4:kelompok"), tTanya = A("s4:bertanya"), tWide = A("s4:untuk");
  const tLupa = A("s6:dilupakan"), tSave = A("s6:diselamatkan"), tZalim = A("s6:Yang"), tTimpa = A("s6:ditimpa"), tHina = A("s6:hina");
  const tPer7 = A("s7:peringatan"), tKamu = A("s8:Kamu");

  // ---------- riso post pass
  const RISO = {
    uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1080, 1920) }, uOP: { value: new THREE.Vector2() }, uOT: { value: new THREE.Vector2() }, uOY: { value: new THREE.Vector2() }, uCell: { value: 7.0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uRes,uOP,uOT,uOY;uniform float uCell;varying vec2 vUv;
float h21(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float scr(vec2 px,float a,float c){float s=sin(a),k=cos(a);vec2 q=mat2(k,-s,s,k)*px/c;return (cos(6.2831853*q.x)+cos(6.2831853*q.y))*.25+.5;}
float plate(float d,vec2 px,float a,float c){d=clamp(d,0.,1.);if(d<.01)return 0.;if(d>.965)return 1.;float s=scr(px,a,c);float th=1.-d;float w=fwidth(s)*.85+.002;return smoothstep(th-w,th+w,s);}
void main(){vec2 px=vUv*uRes;
 float dP=texture2D(tDiffuse,vUv+uOP/uRes).r, dT=texture2D(tDiffuse,vUv+uOT/uRes).g, dY=texture2D(tDiffuse,vUv+uOY/uRes).b;
 float iP=plate(dP,px,.2618,uCell), iT=plate(dT,px,1.309,uCell), iY=plate(dY,px,.0,uCell*1.07);
 float m1=vn(px*.03+3.1), m2=vn(px*.021+17.), m3=vn(px*.026+41.);
 iP*=(.80+.20*m1)*step(.012,h21(floor(px/1.6)+1.7));
 iT*=(.82+.18*m2)*step(.012,h21(floor(px/1.6)+8.3));
 iY*=(.84+.16*m3)*step(.010,h21(floor(px/1.6)+5.9));
 vec3 paper=vec3(.957,.937,.890)*(.978+.03*vn(px*.45)+.012*vn(px*.07));
 vec3 c=paper;
 c*=mix(vec3(1.),vec3(1.,.282,.690),iP);
 c*=mix(vec3(1.),vec3(.0,.514,.541),iT*.96);
 c*=mix(vec3(1.),vec3(1.,.91,.0),iY*.92);
 gl_FragColor=vec4(pow(c,vec3(2.2)),1.);}`,
  };
  const riso = new ShaderPass(RISO);
  comp.insertPass(riso, 1);
  const SCN = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((s) => K[s]);

  // ---------- sky (density gradient + sun) ; moods
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uLow: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 0.05, -1) }, uSunC: { value: new THREE.Color() }, uSunR: { value: 0.07 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=(modelMatrix*vec4(position,1.)).xyz-cameraPosition;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uLow,uSun,uSunC;uniform float uSunR;varying vec3 vD;
void main(){vec3 d=normalize(vD);float y=d.y;
 vec3 c=mix(uHor,uTop,smoothstep(.0,.42,y));
 c=mix(uLow,c,smoothstep(-.012,.004,y));
 float g=dot(d,normalize(uSun));float cr=cos(uSunR);
 c=mix(c,max(c,uSunC*.45),smoothstep(cos(uSunR*1.9),cos(uSunR*1.5),g));
 c=mix(c,uSunC,smoothstep(cr-.00012,cr+.00012,g));
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);
  // moods: [t, top(p,t,y), hor, low, sunC, sunY, fog(p,t,y), bandPink, bandYel]
  const MK = [
    [0, [0, 0, 0], [0.34, 0.02, 0.36], [0.05, 0.55, 0.1], [0.22, 0, 1], 0.05, [0.12, 0.04, 0.14], 0, 0.08],
    [K.s5, [0, 0, 0], [0.36, 0.02, 0.38], [0.05, 0.55, 0.1], [0.22, 0, 1], 0.05, [0.12, 0.04, 0.14], 0, 0.08],
    [tLupa, [0.1, 0.18, 0], [0.42, 0.18, 0.26], [0.12, 0.6, 0.06], [0.22, 0, 1], 0.05, [0.2, 0.18, 0.1], 0.05, 0.04],
    [tTimpa, [0.4, 0.55, 0], [0.55, 0.5, 0.12], [0.3, 0.7, 0.0], [0.22, 0, 1], 0.05, [0.4, 0.42, 0.06], 0.22, 0],
    [tHina + 0.6, [0.45, 0.6, 0], [0.58, 0.52, 0.1], [0.3, 0.7, 0.0], [0.22, 0, 1], 0.05, [0.42, 0.45, 0.05], 0.25, 0],
    [K.s7 + 1.6, [0.06, 0.08, 0], [0.3, 0.08, 0.3], [0.08, 0.58, 0.08], [0.22, 0, 1], 0.05, [0.14, 0.08, 0.12], 0.03, 0.06],
    [K.s7e, [0.04, 0.02, 0.04], [0.5, 0.02, 0.5], [0.12, 0.55, 0.12], [0.3, 0, 1], 0.03, [0.2, 0.04, 0.2], 0.1, 0.1],
    [K.s8 + 1.5, [0.14, 0.04, 0.06], [0.82, 0, 0.6], [0.3, 0.55, 0.18], [0.42, 0, 1], 0.012, [0.36, 0.03, 0.32], 0.28, 0.16],
    [K.dur, [0.2, 0.05, 0.05], [0.9, 0.02, 0.62], [0.36, 0.55, 0.2], [0.5, 0, 1], 0.0, [0.42, 0.04, 0.36], 0.34, 0.18],
  ];
  const M = {};
  const mood = (t) => {
    let i = 0; while (i < MK.length - 2 && MK[i + 1][0] <= t) i++;
    const a = MK[i], b = MK[i + 1], u = sm((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
    const V = (j) => a[j].map((v, k) => lerp(v, b[j][k], u));
    M.top = V(1); M.hor = V(2); M.low = V(3); M.sunC = V(4); M.sunY = lerp(a[5], b[5], u); M.fog = V(6); M.bp = lerp(a[7], b[7], u); M.by = lerp(a[8], b[8], u);
    return M;
  };

  // ---------- far sea floor (catches the view between bands and in the aerial)
  const seaFloor = new THREE.Mesh(new THREE.PlaneGeometry(700, 400), basic(D(0.0, 0.62, 0.08)));
  seaFloor.rotation.x = -Math.PI / 2; seaFloor.position.set(0, -0.12, -200); scene.add(seaFloor);

  // ---------- wave bands: stacked cut-paper strips with a paper foam crest
  const bandTex = dtex(64, 512, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      const v = 1 - y / h; // 1 at top
      let tl = 0, mask = 0;
      if (v > 0.955) { tl = 0; mask = 0; } else if (v > 0.93) { tl = 1; mask = 1; } else if (v > 0.9) { tl = 0.0; mask = 0; } else { tl = 0.98 - 0.5 * sm((0.9 - v) / 0.55); mask = 1; }
      g.fillStyle = ink(mask, tl, mask); g.fillRect(0, y, w, 1);
    }
    g.fillStyle = ink(1, 0.55, 1); for (let y = h * 0.2; y < h * 0.85; y += 22) g.fillRect(0, y, w, 3);
  });
  const NB = 30, BZ = (k) => -0.6 - 2.4 * k;
  const bandMats = [basic(D(0, 1, 0.08), { map: bandTex }), basic(D(0, 0.86, 0.2), { map: bandTex })];
  const BANDS = [];
  for (let k = 0; k < NB; k++) {
    const geo = new THREE.PlaneGeometry(130, 3.4, 260, 1);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      if (pa.getY(i) > 0) { const x = pa.getX(i); pa.setY(i, 1.7 + 0.24 * Math.pow(Math.abs(Math.sin(x * 0.52 + k * 1.37)), 0.55) + 0.05 * Math.sin(x * 1.9 + k)); }
    }
    const m = new THREE.Mesh(geo, bandMats[k % 2]);
    m.position.set(0, -1.62, BZ(k)); scene.add(m);
    BANDS.push({ m, k, ph: rnd() * 6.28 });
  }

  // ---------- land
  const sandTex = dtex(256, 256, (g, w, h) => {
    g.fillStyle = ink(0.06, 0, 0.32); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) { g.fillStyle = ink(0.1, 0.05, 0.5); g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 4, 1); }
  });
  sandTex.wrapS = sandTex.wrapT = THREE.RepeatWrapping; sandTex.repeat.set(30, 20);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(240, 120), basic(D(1, 1, 1), { map: sandTex }));
  sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.0, 59.6); scene.add(sand);
  // wet sand strip at the waterline
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(240, 1.0), basic(D(0.05, 0.22, 0.42)));
  wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.005, 0.0); scene.add(wet);
  const fieldM = basic(D(0.0, 0.32, 0.55));
  const field = new THREE.Mesh(new THREE.PlaneGeometry(240, 100), fieldM);
  field.rotation.x = -Math.PI / 2; field.position.set(0, 0.008, 78); scene.add(field);

  // ---------- hill: three stacked paper layers on the left
  const HILL = [];
  const hillLayer = (z, dz, pts, col) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    const g = new THREE.ExtrudeGeometry(s, { depth: dz, bevelEnabled: false, curveSegments: 6 });
    const m = new THREE.Mesh(g, basic(col)); m.position.z = z; scene.add(m); HILL.push(m); return m;
  };
  const curve = (x0, x1, y0, y1, n, f) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [lerp(x0, x1, u), lerp(y0, y1, f(u))]; });
  const PLAT = 3.2;
  hillLayer(6.6, 3.0, [[-3.6, 0], ...curve(-3.6, -6.4, 0, PLAT, 10, (u) => sm(u)), [-11.2, PLAT], ...curve(-11.2, -16, PLAT, 0.4, 8, (u) => sm(u)), [-30, 0.2], [-30, 0]], D(0, 0.34, 0.6));
  hillLayer(9.6, 3.0, [[-5.0, 0], ...curve(-5.0, -8.5, 0, 4.6, 12, (u) => sm(u) * (1 + 0.08 * Math.sin(u * 9))), ...curve(-8.5, -14, 4.6, 5.4, 8, (u) => u), ...curve(-14, -22, 5.4, 1, 10, (u) => sm(u)), [-30, 0.3], [-30, 0]], D(0.04, 0.5, 0.5));
  hillLayer(12.6, 3.0, [[-6.5, 0], ...curve(-6.5, -12, 0, 6.6, 12, (u) => sm(u)), ...curve(-12, -24, 6.6, 2.0, 12, (u) => sm(u)), [-34, 0.5], [-34, 0]], D(0.1, 0.62, 0.38));
  const plateau = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.0), basic(D(0.0, 0.3, 0.7)));
  plateau.rotation.x = -Math.PI / 2; plateau.position.set(-8.8, PLAT + 0.002, 8.1); scene.add(plateau);
  const hillLight = HILL[0].material; // lit (more yellow) when the warners are safe there

  // ---------- village: flat-roofed cut-paper houses
  const winM = basic(D(0.85, 0.9, 0.0)), doorM = basic(D(0.0, 0.95, 0.15));
  const houseMats = [
    [basic(D(0.0, 0.18, 0.1)), basic(D(0.0, 0.18, 0.1)), basic(D(0.04, 0.02, 0.5)), basic(D(0, 0, 0)), basic(D(0.0, 0.05, 0.22)), basic(D(0.0, 0.05, 0.22))],
    [basic(D(0.2, 0.2, 0.08)), basic(D(0.2, 0.2, 0.08)), basic(D(0.22, 0.0, 0.55)), basic(D(0, 0, 0)), basic(D(0.2, 0.02, 0.18)), basic(D(0.2, 0.02, 0.18))],
    [basic(D(0.0, 0.3, 0.3)), basic(D(0.0, 0.3, 0.3)), basic(D(0.0, 0.1, 0.62)), basic(D(0, 0, 0)), basic(D(0.0, 0.12, 0.4)), basic(D(0.0, 0.12, 0.4))],
  ];
  const HOUSES = [];
  const addHouse = (x, z, w, h, d, v) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), houseMats[v]); b.position.y = h / 2; G.add(b);
    const par = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.12, d + 0.08), houseMats[v][2]); par.position.y = h + 0.06; G.add(par);
    for (const sz of [-1, 1]) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.2, Math.min(1.0, h * 0.45)), doorM); door.position.set(-w * 0.18, Math.min(1.0, h * 0.45) / 2, sz * (d / 2 + 0.01)); G.add(door);
      const nW = Math.max(1, Math.floor(w / 1.1));
      for (let i = 0; i < nW; i++) { const win = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.3), winM); win.position.set(-w / 2 + (i + 0.5) * w / nW + 0.12, h * 0.7, sz * (d / 2 + 0.012)); G.add(win); }
    }
    HOUSES.push(G); return G;
  };
  for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) {
    const z = 11.5 + row * 3.4 + rnd() * 0.8, x = -15 + i * 2.7 + (row % 2) * 1.2 + rnd() * 0.5;
    if (x < -5 && z < 16) continue;
    if (Math.abs(x) < 4.2 && z < 15) continue;
    addHouse(x, z, 1.6 + rnd() * 0.9, 1.4 + rnd() * 1.6 + (row > 1 ? 0.5 : 0), 1.8 + rnd() * 0.6, Math.floor(rnd() * 3));
  }
  for (let i = 0; i < 4; i++) addHouse(10.5 + i * 2.6, 7.2 + rnd() * 1.2, 1.7, 1.5 + rnd() * 1.0, 1.8, Math.floor(rnd() * 3));
  // palms: trunk + fan of leaf cut-outs
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.6, 0.35, 1.3, -0.15); leafShape.quadraticCurveTo(0.6, 0.12, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const palmM = basic(D(0.0, 0.85, 0.75)), trunkM = basic(D(0.45, 0.5, 0.35));
  for (const [x, z, h] of [[-3.4, 9.5, 3.4], [4.4, 8.6, 3.0], [9.0, 4.6, 3.6], [-13, 4.2, 2.8], [13.5, 4.0, 2.6], [1.8, 13.2, 3.8]]) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.14), trunkM); tr.position.y = h / 2; tr.rotation.z = 0.06; G.add(tr);
    for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(leafGeo, palmM); l.position.set(0.1, h, 0); l.rotation.set(0, (k % 2) * Math.PI * 0.5, -0.5 + k * 0.62); G.add(l); }
  }

  // ---------- boats: side-profile cut-outs
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-1.5, 0.55); hullShape.quadraticCurveTo(-1.2, 0.0, -0.4, 0.0); hullShape.lineTo(0.9, 0.0); hullShape.quadraticCurveTo(1.45, 0.05, 1.75, 0.7); hullShape.lineTo(1.5, 0.62); hullShape.lineTo(-1.3, 0.62); hullShape.lineTo(-1.5, 0.55);
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.9, bevelEnabled: false, curveSegments: 10 }); hullGeo.translate(0, 0, -0.45);
  const hullMs = [basic(D(1, 0.0, 0.55)), basic(D(0.0, 0.95, 0.5)), basic(D(0.9, 0.0, 0.0))];
  const rimM = basic(D(0.0, 1, 0.0));
  const netTex = dtex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = ink(1, 0, 0); g.lineWidth = 6;
    for (let i = -w; i < w * 2; i += 26) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
  });
  netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  const netMat = (rx, ry, c = D(1, 0, 0)) => { const tx = netTex.clone(); tx.needsUpdate = true; tx.repeat.set(rx, ry); return basic(c, { map: tx, transparent: true, alphaTest: 0.4, depthWrite: false }); };
  const pileM = basic(D(1, 0.0, 0.25));
  const makeBoat = (x, z, rotY, v, net) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = rotY; scene.add(G);
    G.add(new THREE.Mesh(hullGeo, hullMs[v]));
    const rim = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.95), rimM); rim.position.set(0.1, 0.62, 0); G.add(rim);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.0, 0.07), basic(D(0.5, 0.6, 0.2))); mast.position.set(0.15, 1.6, 0); G.add(mast);
    if (net) { const pile = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8, 0, 6.3, 0, 1.6), pileM); pile.scale.set(1.3, 0.55, 0.9); pile.position.set(-0.6, 0.6, 0); G.add(pile); }
    return G;
  };
  const beach1 = makeBoat(6.3, 0.9, Math.PI / 2 + 0.12, 0, true);
  const beach2 = makeBoat(8.9, 1.5, Math.PI / 2 - 0.1, 1, true);
  const moored = makeBoat(-2.4, -3.3, 0.08, 2, true); // floats in the shallows (temptation close by)
  moored.position.y = -0.28;

  // ---------- AUDIRA stamp on a fishing crate (s1, s8)
  const crateTex = dtex(256, 256, (g, w, h) => {
    g.fillStyle = ink(0.32, 0.18, 0.62); g.fillRect(0, 0, w, h);
    g.fillStyle = ink(0.5, 0.36, 0.75); for (let y = 0; y < h; y += 64) g.fillRect(0, y, w, 6);
    g.strokeStyle = ink(0.45, 0.32, 0.7); g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.save(); g.translate(w / 2, h / 2 + 6); g.rotate(-0.07);
    g.strokeStyle = ink(1, 0, 0); g.lineWidth = 7; g.strokeRect(-104, -42, 208, 84);
    g.fillStyle = ink(1, 0, 0); g.font = `700 48px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", 0, 2);
    g.restore();
    g.fillStyle = ink(0, 0, 0); for (let i = 0; i < 160; i++) g.fillRect(40 + rnd() * 176, 80 + rnd() * 100, 2, 2); // worn stamp
  });
  const crateSide = basic(D(0.3, 0.2, 0.6));
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.62, 0.62), [crateSide, crateSide, basic(D(0.18, 0.12, 0.5)), crateSide, basic(D(1, 1, 1), { map: crateTex }), crateSide]);
  crate.position.set(1.4, 0.31, 0.55); crate.rotation.y = -0.18; scene.add(crate);
  const fishInCrate = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.5), basic(D(0.9, 0.0, 0.7))); fishInCrate.position.set(1.4, 0.6, 0.55); fishInCrate.rotation.y = -0.18; scene.add(fishInCrate);

  // ---------- day tags on a line over the shallows (s1-s3)
  const DAYS = ["AHAD", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABAT"];
  const fishIcon = (g, cx, cy, s, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx - 6 * s, cy, 34 * s, 16 * s, 0, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(cx + 22 * s, cy); g.lineTo(cx + 46 * s, cy - 16 * s); g.lineTo(cx + 46 * s, cy + 16 * s); g.fill(); g.fillStyle = ink(0, 0, 0); g.beginPath(); g.arc(cx - 26 * s, cy - 3 * s, 4 * s, 0, 6.3); g.fill(); };
  const waveIcon = (g, cx, cy, col) => { g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); for (let x = -50; x <= 50; x += 4) g.lineTo(cx + x, cy + 9 * Math.sin(x * 0.12)); g.stroke(); };
  const tagTex = (i, on) => dtex(256, 340, (g, w, h) => {
    g.fillStyle = on ? ink(0, 0, 1) : ink(0, 0, 0.0); g.fillRect(0, 0, w, h);
    g.strokeStyle = ink(i === 6 ? 1 : 0, i === 6 ? 0 : 1, 0); g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = ink(0, 0, 0); g.beginPath(); g.arc(w / 2, 34, 11, 0, 6.3); g.fill();
    g.strokeStyle = ink(0, 1, 0); g.lineWidth = 5; g.beginPath(); g.arc(w / 2, 34, 13, 0, 6.3); g.stroke();
    g.fillStyle = ink(i === 6 ? 1 : 0, 1, 0); g.font = `700 ${DAYS[i].length > 5 ? 50 : 58}px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(DAYS[i], w / 2, 130);
    if (i === 6) fishIcon(g, w / 2 - 6, 244, 1.25, ink(1, 0, on ? 0 : 0.5)); else waveIcon(g, w / 2, 244, ink(0, 1, 0));
  });
  const TAGS = [];
  const ROPE_Z = -6.5, TAG_X = (i) => (i - 3) * 0.92;
  const ropeY = (x) => 4.05 - 0.36 * (1 - (x / 3.45) ** 2);
  const ropeG = new THREE.Group(); scene.add(ropeG);
  const ropeM = basic(D(0.85, 0.85, 0.1), { transparent: true });
  const poleM = basic(D(0.7, 0.75, 0.2), { transparent: true });
  const ropeCurve = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => { const x = -3.45 + i * 0.575; return new THREE.Vector3(x, ropeY(x), ROPE_Z); }));
  ropeG.add(new THREE.Mesh(new THREE.TubeGeometry(ropeCurve, 48, 0.022, 6), ropeM));
  for (const x of [-3.45, 3.45]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.13, 5.6, 0.13), poleM); p.position.set(x, 1.3, ROPE_Z); ropeG.add(p); }
  for (let i = 0; i < 7; i++) {
    const piv = new THREE.Group(); piv.position.set(TAG_X(i), ropeY(TAG_X(i)) - 0.02, ROPE_Z + 0.02); ropeG.add(piv);
    const off = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.06), basic(D(1, 1, 1), { map: tagTex(i, false), transparent: true }));
    off.position.y = -0.56; piv.add(off);
    const onM = basic(D(1, 1, 1), { map: tagTex(i, true), transparent: true, depthWrite: false });
    const on = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.06), onM); on.position.set(0, -0.56, 0.004); piv.add(on);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.04), poleM); clip.position.y = -0.02; piv.add(clip);
    TAGS.push({ piv, off, on, onM });
  }
  // active-day windows [tag, t0, t1]
  const WIN = [];
  const sweep = (t0, t1, dt) => { for (let i = 0; i < 6; i++) WIN.push([i, t0 + i * dt, i === 5 ? t1 : t0 + (i + 1) * dt]); };
  WIN.push([6, 0.3, tOther1 - 0.02]); sweep(tOther1, tUjian - 0.1, 0.3); WIN.push([6, tUjian - 0.1, K.s2e]);
  WIN.push([6, K.s3 - 0.2, tOther3 - 0.02]); sweep(tOther3, tDemi - 0.15, 0.32); WIN.push([6, tDemi - 0.15, K.s4 + 2]);
  const tagAct = (i, t) => { let a = 0; for (const [k, t0, t1] of WIN) if (k === i) a = Math.max(a, ramp(t, t0, t0 + 0.1) * (1 - ramp(t, t1, t1 + 0.1))); return a; };
  const ropeVis = keyed([[0, 1], [tAyat + 1.6, 1], [K.s4 - 0.3, 0]]);

  // ---------- fish: InstancedMesh of side-view cut-outs rising between the wave bands
  const fs = new THREE.Shape();
  fs.moveTo(-0.46, 0.0); fs.quadraticCurveTo(-0.38, 0.2, -0.05, 0.2); fs.quadraticCurveTo(0.12, 0.31, 0.14, 0.19); fs.quadraticCurveTo(0.26, 0.14, 0.3, 0.04);
  fs.lineTo(0.52, 0.2); fs.lineTo(0.46, 0.0); fs.lineTo(0.52, -0.19); fs.lineTo(0.3, -0.04); fs.quadraticCurveTo(0.2, -0.17, -0.05, -0.17); fs.quadraticCurveTo(-0.38, -0.17, -0.46, 0.0);
  const fishGeo = new THREE.ShapeGeometry(fs, 8);
  { const pa = fishGeo.attributes.position, uv = fishGeo.attributes.uv; for (let i = 0; i < pa.count; i++) uv.setXY(i, (pa.getX(i) + 0.46) / 0.98, (pa.getY(i) + 0.19) / 0.5); }
  const fishTex = dtex(256, 128, (g, w, h) => {
    g.fillStyle = ink(1, 0, 0.0); g.fillRect(0, 0, w, h);
    g.fillStyle = ink(1, 0, 1); g.fillRect(0, h * 0.62, w, h);
    g.fillStyle = ink(1, 0.0, 0.45); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(70 + i * 22, 56, 9, 0, 6.3); g.fill(); }
    g.strokeStyle = ink(0.9, 0.9, 0); g.lineWidth = 5; g.beginPath(); g.arc(58, 60, 26, -1, 1); g.stroke();
    g.fillStyle = ink(0, 0, 0); g.beginPath(); g.arc(28, 52, 8, 0, 6.3); g.fill();
    g.fillStyle = ink(0.9, 0.9, 0); g.beginPath(); g.arc(28, 52, 3.5, 0, 6.3); g.fill();
  });
  const NF = 300;
  const fishM = new THREE.MeshBasicMaterial({ map: fishTex, side: DS });
  const fish = new THREE.InstancedMesh(fishGeo, fishM, NF);
  fish.frustumCulled = false; scene.add(fish);
  const FS = [];
  for (let i = 0; i < NF; i++) {
    const near = i < 46;
    const k = near ? 1 + (i % 2) : 3 + Math.floor(rnd() * 12);
    const z = BZ(k) - 0.45 - rnd() * 1.5;
    const spread = near ? 3.2 : 1.6 + (z * -0.16);
    const x = near ? -3.4 + rnd() * 4.6 : (rnd() - 0.5) * 2 * spread * 1.4;
    FS.push({ x, z, near, flip: rnd() < 0.5 ? -1 : 1, s: 0.7 + rnd() * 0.5, ph: rnd() * 6.28, d: rnd(), jump: rnd() < 0.07 });
    fish.setColorAt(i, rnd() < 0.3 ? new THREE.Color(0.6, 1, 1) : new THREE.Color(1, 1, rnd() < 0.5 ? 1 : 0.4));
  }
  fish.instanceColor.needsUpdate = true;
  const fishUp = keyed([[0, 0], [tFish1, 0], [tFish1 + 0.9, 1], [tOther1 - 0.05, 1], [tOther1 + 0.55, 0], [tUjian - 0.1, 0], [tUjian + 0.8, 1], [K.s2 + 1.0, 1], [K.s2 + 1.5, 0],
    [tFish3, 0], [tFish3 + 0.8, 1], [tOther3 - 0.05, 1], [tOther3 + 0.6, 0], [tDemi - 0.2, 0], [tDemi + 0.7, 0.85], [K.s4 - 0.4, 0.85], [K.s4 + 0.3, 0]]);
  const nearUp = keyed([[0, 0], [tGoda - 0.7, 0], [tGoda + 0.4, 1], [K.s2 + 1.0, 1], [K.s2 + 1.5, 0], [tFish3, 0], [tFish3 + 0.8, 1], [tOther3 - 0.05, 1], [tOther3 + 0.6, 0]]);
  const fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fe = new THREE.Euler(), fv = new THREE.Vector3(), fsc = new THREE.Vector3();

  // ---------- gulls
  const gullGeo = new THREE.BufferGeometry();
  gullGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0, -0.5, 0.18, 0, -0.45, 0.06, 0, 0, 0, 0, 0.5, 0.18, 0, 0.45, 0.06, 0]), 3));
  const gullM = basic(D(0.95, 0.95, 0.0));
  const GULLS = Array.from({ length: 7 }, (_, i) => { const m = new THREE.Mesh(gullGeo.clone(), gullM); m.frustumCulled = false; scene.add(m); return { m, ph: rnd() * 6.28, r: 3 + rnd() * 5, y: 5 + rnd() * 3.5, cz: -8 - rnd() * 14, cx: (rnd() - 0.5) * 6, sp: 0.18 + rnd() * 0.15 }; });

  // ---------- clouds (flat cut-outs on a far ring)
  const cloudM = basic(D(0.3, 0.0, 0.12), { fog: false });
  const cloudM2 = basic(D(0.0, 0.0, 0.32), { fog: false });
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Shape(); const n = 4 + Math.floor(rnd() * 3); s.moveTo(-n * 1.4, 0);
    for (let j = 0; j < n; j++) s.absarc(-n * 1.4 + 1.4 + j * 2.8, 0, 1.4 + rnd() * 1.6, Math.PI, 0, true);
    s.lineTo(n * 1.4, 0); s.lineTo(-n * 1.4, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), i % 3 ? cloudM : cloudM2);
    const a = (i / 16) * Math.PI * 2 + rnd() * 0.3, R = 210;
    m.position.set(Math.sin(a) * R, 16 + rnd() * 30, -Math.cos(a) * R); m.lookAt(0, m.position.y, 0); m.scale.setScalar(2 + rnd() * 2); scene.add(m);
  }

  // ---------- villagers: faceless flat cut-outs, additive density (they overprint)
  const figVS = `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
  const figFS = `uniform vec3 uC;uniform float uA,uDis,uDark;varying vec3 vW;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){float nn=n(vW.xy*6.+vW.z*2.)*.6+n(vW.xy*17.)*.4;
 float th=uDis*1.3-.15;if(nn<th)discard;
 float rim=uDis>.001?smoothstep(th+.28,th,nn):0.;
 vec3 c=mix(uC,vec3(.92,.9,.12),clamp(max(uDark,rim),0.,1.));
 gl_FragColor=vec4(c,uA);}`;
  const figMat = (c) => new THREE.ShaderMaterial({ uniforms: { uC: { value: c }, uA: { value: 0 }, uDis: { value: 0 }, uDark: { value: 0 } }, vertexShader: figVS, fragmentShader: figFS, transparent: true, depthWrite: false, side: DS, fog: false });
  const GM = [figMat(D(0, 1, 0)), figMat(D(1, 0, 0)), figMat(D(0, 0.5, 0.9))]; // A teal, B pink, C green
  const robe = new THREE.Shape();
  robe.moveTo(-0.27, 0); robe.lineTo(0.27, 0); robe.quadraticCurveTo(0.24, 0.6, 0.21, 0.98); robe.quadraticCurveTo(0.2, 1.1, 0.07, 1.12); robe.lineTo(-0.07, 1.12); robe.quadraticCurveTo(-0.2, 1.1, -0.21, 0.98); robe.quadraticCurveTo(-0.24, 0.6, -0.27, 0);
  const robeGeo = new THREE.ShapeGeometry(robe, 6);
  const headGeo = new THREE.CircleGeometry(0.15, 20);
  const armGeo = new THREE.PlaneGeometry(0.1, 0.56); armGeo.translate(0, -0.26, 0);
  const qGeo = (() => { const tx = dtex(128, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = ink(1, 0, 0); g.font = `700 150px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", w / 2, h / 2 + 6); }); return tx; })();
  const FIG = [];
  for (let i = 0; i < 12; i++) {
    const g = Math.floor(i / 4), j = i % 4;
    const G = new THREE.Group(); scene.add(G);
    const body = new THREE.Group(); G.add(body);
    body.add(new THREE.Mesh(robeGeo, GM[g]));
    const head = new THREE.Mesh(headGeo, GM[g]); head.position.y = 1.3; body.add(head);
    const mkArm = (s) => { const p = new THREE.Group(); p.position.set(s * 0.2, 1.02, 0.001); body.add(p); p.add(new THREE.Mesh(armGeo, GM[g])); return p; };
    const aL = mkArm(-1), aR = mkArm(1);
    const sc = 0.92 + ((i * 37) % 10) / 60;
    FIG.push({ G, body, aL, aR, g, j, sc, ph: i * 1.7 });
  }
  const groupPos = (g, j) => g === 0 ? [-4.35 + j * 0.62, 0.55 + (j % 2) * 0.28] : g === 1 ? [-0.95 + j * 0.62, 2.4 + (j % 2) * 0.3] : [2.75 + j * 0.62, 3.4 + (j % 2) * 0.3];
  const clusterPos = (g, j) => [-1.05 + j * 0.64 + (g - 1) * 0.11, 2.5 + (g - 1) * 0.04];
  const villPos = (i) => [5.1 + (i % 6) * 0.68 + Math.floor(i / 6) * 0.3, 3.3 + Math.floor(i / 6) * 0.75];
  const hillPos = (j) => [-9.9 + j * 0.62, 7.7 + (j % 2) * 0.35];
  // nets slipped into the water by group A
  const NETS = [0, 1].map((k) => {
    const piv = new THREE.Group(); piv.position.set(-4.05 + k * 1.24, 0.5, 0.42); scene.add(piv);
    const geo = new THREE.PlaneGeometry(1.0, 2.4); geo.translate(0, -1.2, 0);
    const m = new THREE.Mesh(geo, netMat(2.2, 5, D(1, 0, 0))); m.material.transparent = true; piv.add(m);
    piv.rotation.x = -1.18; return { piv, m };
  });
  const QM = new THREE.MeshBasicMaterial({ map: qGeo, transparent: true, depthWrite: false, side: DS, color: D(1, 1, 1) });
  const QS = [0, 1, 2].map((k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.52), QM); m.position.set(3.05 + k * 0.62, 2.3, 3.45 + (k % 2) * 0.3); scene.add(m); return m; });
  // speech marks for the warners: three short printed strokes beside raised hands
  const markM = basic(D(1, 0, 0.0), { transparent: true, depthWrite: false });
  const MARKS = [0, 1, 2].map((k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.06), markM); scene.add(m); return m; });
  // smudge left where the violators stood
  const smTex = dtex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const R2 = mulberry(77);
    for (let i = 0; i < 260; i++) { const a = R2() * 6.28, rr = Math.pow(R2(), 0.7) * 110; g.fillStyle = ink(0.92, 0.9, 0.1, 0.25 + R2() * 0.4); g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * rr * 1.1, h / 2 + Math.sin(a) * rr * 0.6, 10 + R2() * 26, 6 + R2() * 14, a, 0, 6.3); g.fill(); }
  });
  const smM = new THREE.MeshBasicMaterial({ map: smTex, transparent: true, depthWrite: false, opacity: 0 });
  const smudge = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.0), smM); smudge.rotation.x = -Math.PI / 2; smudge.position.set(-3.4, 0.03, 0.8); scene.add(smudge);

  // ---------- drying racks with nets hung up (s2 near the boats; s8 near the camera after the event)
  const rack = (x0, x1, z, h, c) => {
    const G = new THREE.Group(); scene.add(G);
    for (const x of [x0, x1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.1), basic(D(0.6, 0.7, 0.3))); p.position.set(x, h / 2, z); G.add(p); }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 0.2, 0.07, 0.07), basic(D(0.6, 0.7, 0.3))); bar.position.set((x0 + x1) / 2, h - 0.05, z); G.add(bar);
    const geo = new THREE.PlaneGeometry(x1 - x0 - 0.1, h * 0.62, 20, 6);
    const pa = geo.attributes.position; for (let i = 0; i < pa.count; i++) { const u = (pa.getX(i) / (x1 - x0)) + 0.5; pa.setY(i, pa.getY(i) - 0.22 * Math.sin(Math.PI * u) * (0.5 - pa.getY(i) / (h * 0.62))); pa.setZ(i, 0.05 * Math.sin(u * 9)); }
    const net = new THREE.Mesh(geo, netMat(3, 2.6, c)); net.position.set((x0 + x1) / 2, h - 0.08 - h * 0.31, z); G.add(net);
    return { G, net };
  };
  const rack1 = rack(7.4, 9.5, 3.0, 2.3, D(1, 0, 0.3));
  const rack2 = rack(-0.9, 0.6, 2.0, 2.1, D(1, 0, 0.0));
  const rack2Mats = []; rack2.G.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; rack2Mats.push(o.material); } });

  // ---------- camera track [t, px,py,pz, lx,ly,lz]
  const CAM = track([
    [0, 0, 2.55, 12.8, 0, 1.45, -8],
    [tOther1, 0, 2.35, 11.0, 0, 1.35, -8],
    [tUjian, 0.2, 1.95, 9.0, 0.0, 1.05, -8],
    [K.s1e - 0.2, 0.2, 1.3, 6.2, -0.6, 0.55, -8],
    [K.s2 + 1.6, -3, 10.5, 33, 1, 0, -7],
    [tPend - 0.3, -1.2, 9.0, 28.5, 1.4, 0, -7],
    [tPend + 1.3, 15.5, 2.7, 2.6, 6.5, 0.95, 3.4],
    [K.s2e - 0.2, 14.4, 2.45, 3.6, 5.6, 0.95, 4.6],
    [K.s3 + 1.0, -0.4, 1.75, 6.6, -0.2, 0.95, -10],
    [tOther3, -0.2, 1.9, 7.6, 0, 1.05, -10],
    [tAyat, 0, 2.5, 9.6, 0, 1.25, -10],
    [tDemi + 0.9, 0.4, 3.0, 10.3, 0, 1.15, -10],
    [K.s4 - 0.25, 13, 6.5, -6, 0, 1.0, -2.5],
    [K.s4 + 0.7, 0.3, 3.3, -24.5, 0.1, 1.25, 3],
    [tGA + 0.2, 0.2, 3.1, -23, 0.1, 1.2, 3],
    [tGA + 0.9, -3.0, 2.15, -9.6, -3.3, 0.75, 1],
    [tGB - 0.1, -2.9, 2.2, -9.2, -3.25, 0.75, 1],
    [tGB + 0.7, 0.0, 2.3, -9.6, 0, 0.95, 2.4],
    [tGC - 0.1, 0.1, 2.3, -9.2, 0.1, 0.95, 2.4],
    [tGC + 0.7, 3.5, 2.35, -9.0, 3.6, 0.95, 3.4],
    [tWide - 0.1, 3.4, 2.35, -8.6, 3.5, 1.0, 3.4],
    [tWide + 1.3, 0.4, 3.1, -21, 0.3, 1.15, 3],
    [K.s5 - 0.1, 0.4, 3.0, -20, 0.3, 1.15, 3],
    [K.s5 + 0.8, -0.3, 1.85, -6.6, -0.1, 0.78, 2.4],
    [K.s5e, -0.5, 1.9, -7.4, -0.2, 0.8, 2.4],
    [K.s6 + 1.0, -5.0, 3.0, -15.0, -5.5, 2.05, 5],
    [K.s6e, -4.7, 2.8, -12.8, -5.3, 1.95, 5],
    [K.s7 + 2.2, -1.5, 15.5, -19, -1.2, 0, 3],
    [K.s7e - 0.4, 1.5, 18.5, -22, 0, 0, 3.5],
    [K.s8 + 0.4, -9, 7.5, 2.0, 0, 0.6, -3],
    [K.s8 + 1.6, 1.3, 1.85, 10.4, 0.9, 0.4, -10],
    [K.dur, 1.05, 1.75, 9.6, 0.9, 0.4, -10],
  ]);
  const look = new THREE.Vector3();

  return (t) => {
    // misregistration: a fresh small offset per scene ("each scene is a new print pass")
    let si = 0; while (si < 7 && t >= SCN[si + 1]) si++;
    const hj = (k) => { const s = Math.sin((si + 1) * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s) - 0.5; };
    const ex = 1 + 1.4 * ramp(t, tTimpa, tTimpa + 1) * (1 - ramp(t, K.s7, K.s7 + 1.5));
    riso.uniforms.uOP.value.set((2.4 + 2 * hj(1)) * ex, (-1.8 + 2 * hj(2)) * ex);
    riso.uniforms.uOT.value.set((-2.0 + 2 * hj(3)) * ex, (1.5 + 2 * hj(4)) * ex);
    riso.uniforms.uOY.value.set((1.0 + 2 * hj(5)) * ex, (2.2 + 2 * hj(6)) * ex);

    // camera
    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // mood
    mood(t);
    SU.uTop.value.setRGB(...M.top); SU.uHor.value.setRGB(...M.hor); SU.uLow.value.setRGB(...M.low); SU.uSunC.value.setRGB(...M.sunC);
    SU.uSun.value.set(0.12, M.sunY, -1);
    scene.fog.color.setRGB(...M.fog);
    bandMats[0].color.setRGB(M.bp, 1, 0.08 + M.by); bandMats[1].color.setRGB(M.bp * 0.8, 0.86, 0.2 + M.by);
    // hill lit (more yellow) from the warners' rescue onward
    const lit = ramp(t, tSave - 0.4, tSave + 0.8);
    hillLight.color.setRGB(0.0, 0.34 - 0.12 * lit, 0.6 + 0.4 * lit);
    plateau.material.color.setRGB(0, 0.3 - 0.2 * lit, 0.7 + 0.3 * lit);

    // waves
    for (const B of BANDS) {
      B.m.position.x = 0.7 * Math.sin(t * 0.33 + B.ph) + (B.k % 2 ? 0.3 : -0.3) * Math.sin(t * 0.21 + B.k);
      B.m.position.y = -1.62 + 0.06 * Math.sin(t * 1.1 + B.ph * 2);
    }
    moored.position.y = -0.3 + 0.05 * Math.sin(t * 1.3); moored.rotation.z = 0.03 * Math.sin(t * 1.1);

    // day tags
    const rv = ropeVis(t);
    ropeG.visible = rv > 0.01;
    ropeM.opacity = rv; poleM.opacity = rv;
    TAGS.forEach((T, i) => {
      const a = tagAct(i, t);
      T.onM.opacity = a * rv; T.off.material.opacity = rv;
      const pop = 1 + 0.14 * a;
      T.piv.scale.set(pop, pop, 1);
      T.piv.rotation.z = 0.05 * Math.sin(t * 1.25 + i * 0.9) + 0.06 * a * Math.sin(t * 6 + i);
    });

    // fish
    const up = fishUp(t), nup = nearUp(t);
    for (let i = 0; i < NF; i++) {
      const F = FS[i];
      const u = F.near ? nup : up;
      const stag = clamp01(u * 1.6 - F.d * 0.6);
      const e = sm(stag);
      let y = lerp(-1.5, 0.12 + 0.05 * Math.sin(t * 2.4 + F.ph), e), x = F.x + 0.12 * Math.sin(t * 0.7 + F.ph), roll = 0.12 * Math.sin(t * 2.0 + F.ph);
      if (F.jump && e > 0.9) { const p = ((t * 0.55 + F.ph) % 1); if (p < 0.45) { const q = p / 0.45; y += 0.9 * Math.sin(Math.PI * q); x += F.flip * 0.8 * (q - 0.5); roll = F.flip * (0.9 - 1.8 * q); } }
      fv.set(x, y, F.z);
      fe.set(0, (F.flip < 0 ? Math.PI : 0) + 0.25 * Math.sin(F.ph), roll); fq.setFromEuler(fe);
      const s = e > 0.001 ? F.s : 0.0001;
      fsc.set(s, s, s); fm.compose(fv, fq, fsc); fish.setMatrixAt(i, fm);
    }
    fish.instanceMatrix.needsUpdate = true;

    // gulls (s1-s3, s8)
    const gv = 1 - ramp(t, K.s3e, K.s3e + 0.3) + ramp(t, K.s8, K.s8 + 0.5);
    GULLS.forEach((G, i) => {
      G.m.visible = gv > 0.5;
      const a = t * G.sp + G.ph;
      G.m.position.set(G.cx + Math.cos(a) * G.r, G.y + 0.3 * Math.sin(t * 0.8 + i), G.cz + Math.sin(a) * G.r * 0.4);
      G.m.lookAt(cam.position);
      const fl = Math.sin(t * 7 + G.ph * 3) * 0.6; const p = G.m.geometry.attributes.position;
      p.setY(1, 0.18 + fl * 0.3); p.setY(4, 0.18 + fl * 0.3); p.setY(2, 0.06 + fl * 0.12); p.setY(5, 0.06 + fl * 0.12); p.needsUpdate = true;
    });

    // villagers
    const vIn = ramp(t, tPend - 0.1, tPend + 0.7), vOut = ramp(t, K.s2e - 0.7, K.s2e - 0.1);
    const walk = ramp(t, tIbadah - 1.4, K.s2e);
    const sIn = ramp(t, K.s4 - 0.5, K.s4 + 0.4);
    const split = ramp(t, tSplit - 0.1, tSplit + 1.3);
    const cOut = ramp(t, K.s5 + 2.0, K.s5 + 2.8);
    const bMove = ramp(t, tSave - 0.9, tSave - 0.1), bIn = ramp(t, tSave - 0.5, tSave + 0.4);
    const dis = ramp(t, tTimpa - 0.1, tHina + 0.7), dark = ramp(t, tZalim - 0.2, tTimpa + 0.4);
    const inS2 = t < K.s3;
    // group materials: alpha, dissolve, darkening
    for (let g = 0; g < 3; g++) {
      let a;
      if (inS2) a = vIn * (1 - vOut);
      else if (g === 0) a = sIn;
      else if (g === 1) a = t < tSave - 0.5 ? sIn * (1 - bMove) : bIn;
      else a = sIn * (1 - cOut);
      GM[g].uniforms.uA.value = a;
      GM[g].uniforms.uDis.value = g === 0 && !inS2 ? dis : 0;
      GM[g].uniforms.uDark.value = g === 0 && !inS2 ? dark * 0.55 : 0;
    }
    for (const Fg of FIG) {
      const { G, body, aL, aR, g, j, sc } = Fg;
      let x, z, y = 0, crouch = 0, al = 0.12, ar = -0.12, step = 0;
      if (inS2) {
        const i = g * 4 + j, p = villPos(i);
        x = p[0]; z = p[1] + walk * (4.2 + (i % 3) * 0.4); step = walk > 0 && walk < 1 ? 1 : 0;
        G.rotation.y = Math.PI / 2;
      } else {
        G.rotation.y = 0;
        const cp = clusterPos(g, j), gp = groupPos(g, j);
        x = lerp(cp[0], gp[0], split); z = lerp(cp[1], gp[1], split); step = split > 0 && split < 1 ? 1 : 0;
        if (g === 0) {
          const cr = ramp(t, tGA - 0.2, tCelah);
          crouch = cr * 0.3; al = lerp(0.12, -0.75, cr); ar = lerp(-0.12, 0.75, cr);
        } else if (g === 1) {
          const rs = ramp(t, tNas - 0.25, tNas + 0.3) * (1 - ramp(t, K.s6e + 2, K.s6e + 3));
          const wave = 0.12 * Math.sin(t * 3 + j);
          ar = lerp(-0.12, 2.55 + wave, rs); al = lerp(0.12, j % 2 ? -2.3 : 0.4, rs);
          if (t >= tSave - 0.5) { const hp = hillPos(j); x = hp[0]; z = hp[1]; y = PLAT; ar = -0.12; al = 0.12; }
        } else {
          const lean = ramp(t, tTanya - 0.3, tTanya + 0.3);
          body.rotation.z = -0.07 * lean;
          al = lerp(0.12, -1.6, lean * (j % 2)); // a hand to the chin
        }
      }
      const bob = step * Math.abs(Math.sin(t * 7 + Fg.ph)) * 0.05;
      G.position.set(x, y + bob, z);
      G.scale.set(sc, sc * (1 - crouch), sc);
      body.rotation.x = 0;
      aL.rotation.z = al; aR.rotation.z = ar;
      G.visible = GM[g].uniforms.uA.value > 0.003;
    }
    // nets slipping into the water
    const netU = ramp(t, tCelah - 0.4, tCelah + 1.4) * (1 - ramp(t, K.s7e - 1, K.s7e));
    NETS.forEach((N, k) => {
      N.piv.visible = netU > 0.01;
      N.m.scale.set(1, Math.max(0.001, netU * (0.9 + 0.1 * Math.sin(t * 1.3 + k))), 1);
      N.m.material.opacity = 1 - 0.6 * ramp(t, tHina, tHina + 1.5);
      N.piv.position.y = 0.5 - 0.35 * ramp(t, tTimpa, tHina + 0.5);
    });
    // question marks over group C
    const qa = ramp(t, tTanya - 0.15, tTanya + 0.25) * (1 - cOut);
    QM.opacity = qa;
    QS.forEach((q, k) => { q.visible = qa > 0.01; q.position.y = 2.25 + 0.06 * Math.sin(t * 2.2 + k * 2); q.scale.setScalar(0.6 + 0.4 * sm(qa)); q.lookAt(cam.position.x, q.position.y, cam.position.z); });
    // warning strokes beside group B (s4 'menasihati' to s5 end)
    const ma = ramp(t, tNas, tNas + 0.3) * (1 - ramp(t, K.s5e, K.s5e + 0.4));
    markM.opacity = ma * (0.75 + 0.25 * Math.sin(t * 5));
    MARKS.forEach((m, k) => { m.visible = ma > 0.01; m.position.set(-1.35 - 0.12 * k, 1.75 + 0.2 * (k - 1), 2.3); m.rotation.z = 0.5 * (k - 1); });
    // smudge
    smM.opacity = 0.95 * ramp(t, tTimpa + 0.4, tHina + 0.6) * (1 - ramp(t, tPer7, K.s7e - 0.5) * 0.9);
    smudge.scale.set(0.6 + 0.4 * ramp(t, tTimpa, tHina + 0.6), 1, 1);
    // nets hung up near the camera (s7-s8)
    const r2 = ramp(t, K.s7 + 2, K.s7 + 3.5);
    rack2.G.visible = r2 > 0.01; for (const m of rack2Mats) m.opacity = r2;
    rack1.G.visible = t < K.s7;

    comp.render();
  };
}
