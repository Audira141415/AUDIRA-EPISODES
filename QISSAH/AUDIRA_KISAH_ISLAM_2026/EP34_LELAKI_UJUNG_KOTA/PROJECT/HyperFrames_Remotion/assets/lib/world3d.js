// EP34 LELAKI DARI UJUNG KOTA. LIDARFORGE: an ancient walled town captured as a 3D point-cloud survey.
// Everything is points: ground, houses (some domed), the round city wall with its south gate and a small north postern,
// palms outside the wall, a survey grid on the ground. A scan front reveals the town in s1; scan rings and a rising
// scanline keep it "live". The camera is a survey drone.
// Layout (y up; north = -z): square (alun-alun) at the origin, south gate at z=+34, the man's route from the north
// postern (-4.5,-33) down the north street to the square. The gate of light stands outside the town at z=-66.
// Depiction:
//  - the three messengers are never figures: three steady lights that enter the gate and stand in the square;
//  - townspeople are small faceless point silhouettes, cyan at first, red once they reject the messengers;
//  - the man is a faceless amber point silhouette with an amber point trail; he is never named;
//  - no violence: at "membunuhnya" his amber light dims and goes still; nothing else is shown;
//  - paradise is only a soft gate of light that opens, no figures; no depiction of Allah or angels.
// Every value is a pure function of t (seek-safe, mulberry only).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const mix = (a, b, u) => a + (b - a) * u;
const gauss = (t, c, w) => Math.exp(-(((t - c) / w) ** 2));

const VS = `attribute vec3 aCol;attribute float aRnd;
uniform float uSize,uDim,uRev,uRevOn,uScanY,uRingA,uRingB,uGate;
uniform vec3 uRingCA,uRingCB,uRingColB,uGateP;
varying vec3 vC;
void main(){
 vec4 mv=modelViewMatrix*vec4(position,1.);
 gl_Position=projectionMatrix*mv;
 vec3 wp=(modelMatrix*vec4(position,1.)).xyz;
 float d=length(wp.xz);
 float rev=mix(1.,smoothstep(uRev,uRev-5.,d),uRevOn);
 float front=uRevOn*exp(-pow((d-uRev)/1.8,2.));
 float ra=exp(-pow((length(wp.xz-uRingCA.xz)-uRingA)/1.1,2.));
 float rb=exp(-pow((length(wp.xz-uRingCB.xz)-uRingB)/1.5,2.));
 float sl=exp(-pow((wp.y-uScanY)/.22,2.))*step(.05,wp.y);
 vec3 c=aCol+vec3(.62,.9,1.)*(front*1.3+ra*.16+sl*.32)*uRevOn+uRingColB*rb*.8;
 float gd=length(wp-uGateP);
 c+=vec3(1.,.74,.42)*uGate*exp(-gd*gd/1500.)*.55;
 vC=c*uDim*rev;
 float ps=uSize*projectionMatrix[1][1]*960./max(.5,-mv.z)*(.75+.5*aRnd);
 gl_PointSize=rev<.002?0.:clamp(ps,1.,11.);
}`;
const FS = `varying vec3 vC;
void main(){vec2 p=gl_PointCoord-.5;float r=dot(p,p)*4.;if(r>1.)discard;float a=1.-r;gl_FragColor=vec4(vC*a*a,1.);}`;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0b0f14, fog: 0, exp: 1, bloom: [0.55, 0.45, 0.32], fov: 38, shadow: false });
  r.toneMapping = THREE.NoToneMapping;
  scene.fog = null;
  // guard: NaN/Inf pixels would be smeared over the frame by the bloom blur; cap bright values too
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;float f(float x){return (x<6.0&&x>=0.0)?x:(x>=6.0?6.0:0.0);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(f(c.r),f(c.g),f(c.b),1.0);}" }), 1);
  cam.near = 0.1; cam.far = 1200; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(3434);
  const CY = new THREE.Color("#5FD3E0"), AMB = new THREE.Color("#F2A93B"), RED = new THREE.Color("#C0504D"), WARM = new THREE.Color("#FFE3B0"), WHITE = new THREE.Color("#E8EEF2");
  const GP = new THREE.Vector3(0, 0, -66);

  // ---------- timing
  const tLel = A("s1:lelaki"), tBerg = A("s1:bergegas");
  const tDua = A("s2:dua"), tDust = A("s2:mendustakan"), tKet = A("s2:ketiga"), tTol = A("s2:menolak");
  const tPend = A("s3:penduduk"), tSial = A("s3:sial"), tRajam = A("s3:rajam");
  const tDat = A("s4:datanglah"), tWah = A("s4:wahai"), tIku = A("s4:ikutilah"), tImb = A("s4:imbalan");
  const tCipta = A("s5:menciptakanku"), tTuhan = A("s5:tuhan"), tTolong = A("s5:menolongku"), tIman = A("s5:beriman"), tDeng = A("s5:dengarkanlah");
  const tBunuh = A("s6:membunuhnya"), tDoa = A("s6:berdoa"), tTahu = A("s6:mengetahui"), tMati = A("s6:kematiannya"), tMasuk = A("s6:masuklah");
  const tKaum7 = A("s7:kaumku"), tKaum8 = A("s8:kaumnya"), tKisah = A("s8:Kisah");
  const tRun0 = tDat + 0.15, tRun1 = tWah - 0.15;

  // ---------- shared point shader
  const SU = { uRev: { value: 200 }, uScanY: { value: -50 }, uRingA: { value: -99 }, uRingB: { value: -99 }, uRingCA: { value: new THREE.Vector3() },
    uRingCB: { value: new THREE.Vector3() }, uRingColB: { value: new THREE.Color() }, uGate: { value: 0 }, uGateP: { value: GP.clone() } };
  const pmat = (size, rev = true) => new THREE.ShaderMaterial({ uniforms: { ...SU, uSize: { value: size }, uDim: { value: 1 }, uRevOn: { value: rev ? 1 : 0 } },
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  function cloud(arr, size, rev = true) {
    const n = arr.length / 7, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), rr = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos.set(arr.slice(i * 7, i * 7 + 3), i * 3); col.set(arr.slice(i * 7 + 3, i * 7 + 6), i * 3); rr[i] = arr[i * 7 + 6]; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aCol", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rr, 1));
    const P = new THREE.Points(g, pmat(size, rev)); P.frustumCulled = false; scene.add(P);
    return { P, pos, col, g, n, commit() { g.attributes.position.needsUpdate = true; g.attributes.aCol.needsUpdate = true; } };
  }
  const dyn = (n, size) => cloud(new Array(n * 7).fill(0), size, false);

  // ---------- city point cloud (static)
  const C = [];
  const add = (x, y, z, c, b) => { b *= 1.45; C.push(x, y, z, c.r * b, c.g * b, c.b * b, rnd()); };
  // north route of the man (xz), used for the street and his run
  const PATH = [[-4.5, -33], [-4.1, -27], [-2.4, -20.5], [-0.5, -14], [0.4, -8], [0, -2.4]];
  const PL = [0]; for (let i = 1; i < PATH.length; i++) PL.push(PL[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));
  const LEN = PL[PL.length - 1];
  function pathAt(u) {
    const s = clamp01(u) * LEN; let i = 0; while (i < PATH.length - 2 && PL[i + 1] < s) i++;
    const k = (s - PL[i]) / (PL[i + 1] - PL[i]);
    return [mix(PATH[i][0], PATH[i + 1][0], k), mix(PATH[i][1], PATH[i + 1][1], k), Math.atan2(PATH[i + 1][0] - PATH[i][0], PATH[i + 1][1] - PATH[i][1])];
  }
  const distPath = (x, z) => { let m = 99; for (let u = 0; u <= 1; u += 0.02) { const p = pathAt(u); m = Math.min(m, Math.hypot(x - p[0], z - p[1])); } return m; };
  const RW = 34;
  const hill = (x, z) => { const rr2 = Math.hypot(x, z); const o = clamp01((rr2 - 40) / 30); const lane = Math.abs(x) < 9 && z < -36 ? 0.25 : 1; return o * lane * (1.6 + 1.4 * Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.09) + 0.8 * Math.sin(x * 0.27 + z * 0.19)); };
  // ground
  for (let i = 0; i < 26000; i++) { const a = rnd() * 6.283, rr2 = Math.sqrt(rnd()) * RW; const x = Math.cos(a) * rr2, z = Math.sin(a) * rr2; add(x, 0, z, CY, 0.13 + 0.09 * rnd()); }
  for (let i = 0; i < 30000; i++) { const a = rnd() * 6.283, rr2 = RW + Math.pow(rnd(), 0.8) * 70; const x = Math.cos(a) * rr2, z = Math.sin(a) * rr2; add(x, hill(x, z), z, CY, (0.15 + 0.08 * rnd()) * (1 - 0.6 * clamp01((rr2 - 60) / 44))); }
  // square paving rings (subtle)
  for (let k = 0; k < 3; k++) for (let i = 0; i < 260; i++) { const a = (i / 260) * 6.283; const rr2 = 3 + k * 3.6; add(Math.cos(a) * rr2, 0.02, Math.sin(a) * rr2, CY, 0.32); }
  // houses
  const houseOK = (x, z, w, d) => {
    const rr2 = Math.hypot(x, z) + Math.max(w, d) * 0.6;
    if (rr2 > RW - 1.8 || Math.hypot(x, z) < 11 + Math.max(w, d) * 0.5) return false;
    if (z > 4 && Math.abs(x) < 2.6 + w / 2) return false; // south street
    if (z < -2 && distPath(x, z) < 2.4 + Math.max(w, d) / 2) return false; // north street (the man's route)
    if (Math.abs(z - 0.5) < 1.6 + d / 2 && Math.abs(x) > 10) return false; // east-west lane
    return true;
  };
  function boxPts(cx, cy, cz, w, h, d, b) {
    const area = 2 * (w + d) * h + w * d, n = Math.floor(area * 5.2);
    for (let i = 0; i < n; i++) {
      const s = rnd() * area; let x, y, z, br = 0.42;
      if (s < w * d) { x = (rnd() - 0.5) * w; z = (rnd() - 0.5) * d; y = h; br = 0.5; }
      else { const per = rnd() * 2 * (w + d); y = rnd() * h; if (per < w) { x = per - w / 2; z = -d / 2; } else if (per < w + d) { x = w / 2; z = per - w - d / 2; } else if (per < 2 * w + d) { x = per - w - d - w / 2; z = d / 2; } else { x = -w / 2; z = per - 2 * w - d - d / 2; } br = 0.3 + 0.25 * (y / Math.max(h, 1)); }
      add(cx + x, cy + y, cz + z, CY, br * b);
    }
    // crisp edges
    for (const [ex, ez] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (let k = 0; k < h * 7; k++) add(cx + ex * w / 2, cy + rnd() * h, cz + ez * d / 2, CY, 0.95 * b);
    for (let k = 0; k < (w + d) * 9; k++) { const u = rnd(); const side = Math.floor(rnd() * 4); const x = side < 2 ? (u - 0.5) * w : (side === 2 ? -w / 2 : w / 2); const z = side < 2 ? (side ? d / 2 : -d / 2) : (u - 0.5) * d; add(cx + x, cy + h, cz + z, CY, 1.0 * b); }
  }
  function domePts(cx, cy, cz, rad, b) {
    for (let i = 0; i < rad * rad * 60; i++) { const a = rnd() * 6.283, v = Math.acos(rnd()); add(cx + Math.cos(a) * Math.sin(v) * rad, cy + Math.cos(v) * rad, cz + Math.sin(a) * Math.sin(v) * rad, CY, 0.45 + 0.4 * Math.cos(v)); }
    for (let i = 0; i < 80; i++) { const a = (i / 80) * 6.283; add(cx + Math.cos(a) * rad, cy, cz + Math.sin(a) * rad, CY, 0.9 * b); }
  }
  for (let gx = -32; gx <= 32; gx += 5.6) for (let gz = -32; gz <= 32; gz += 5.6) {
    if (rnd() < 0.1) continue;
    const w = 3.1 + rnd() * 1.8, d = 3.1 + rnd() * 1.8, x = gx + (rnd() - 0.5) * 1.1, z = gz + (rnd() - 0.5) * 1.1;
    if (!houseOK(x, z, w, d)) continue;
    const h = 2.4 + rnd() * 2.2 + 1.6 * clamp01(1 - Math.hypot(x, z) / 30);
    boxPts(x, 0, z, w, h, d, 1);
    const q = rnd();
    if (q < 0.2) domePts(x, h, z, Math.min(w, d) * 0.42, 1);
    else if (q < 0.42) boxPts(x + (rnd() - 0.5) * 0.6, h, z + (rnd() - 0.5) * 0.6, w * 0.55, 1.6 + rnd(), d * 0.55, 0.9);
  }
  // city wall with crenellations, south gate gap and small north postern
  const gapS = 3.4 / RW, aS = Math.PI / 2, aN = Math.atan2(-33.7, -4.5), gapN = 1.3 / RW;
  const angGap = (a) => { const dS = Math.abs(Math.atan2(Math.sin(a - aS), Math.cos(a - aS))), dN = Math.abs(Math.atan2(Math.sin(a - aN), Math.cos(a - aN))); return dS < gapS || dN < gapN; };
  for (let i = 0; i < 16000; i++) {
    const a = rnd() * 6.283; if (angGap(a)) continue;
    const side = rnd() < 0.55 ? 0.7 : -0.7, y = rnd() * 5.4;
    add(Math.cos(a) * (RW + side), y, Math.sin(a) * (RW + side), CY, 0.32 + 0.3 * (y / 5.4));
  }
  for (let i = 0; i < 2400; i++) { const a = (i / 2400) * 6.283; if (angGap(a)) continue; const mer = Math.floor((a * RW) / 1.4) % 2 === 0; for (const s of [-0.7, 0.7]) add(Math.cos(a) * (RW + s), 5.4 + (mer ? 0.8 * rnd() : 0), Math.sin(a) * (RW + s), CY, 1.0); }
  function towerPts(x, z, rad, h) {
    for (let i = 0; i < rad * h * 26; i++) { const a = rnd() * 6.283, y = rnd() * h; add(x + Math.cos(a) * rad, y, z + Math.sin(a) * rad, CY, 0.35 + 0.35 * y / h); }
    for (let i = 0; i < 140; i++) { const a = (i / 140) * 6.283; add(x + Math.cos(a) * rad, h, z + Math.sin(a) * rad, CY, 1.1); add(x + Math.cos(a) * rad * 1.15, h + 0.9 * (Math.floor(i / 7) % 2), z + Math.sin(a) * rad * 1.15, CY, 0.9); }
  }
  towerPts(-4.6, 33.7, 2.1, 9.5); towerPts(4.6, 33.7, 2.1, 9.5);
  for (const a of [0.15, 0.95, 2.25, 3.0, 3.75, 4.35, 5.3]) towerPts(Math.cos(a) * RW, Math.sin(a) * RW, 1.7, 7.5);
  // gate arch over the south gap
  for (let i = 0; i < 900; i++) { const th = rnd() * Math.PI; const rr2 = 2.6 + rnd() * 0.5; add(Math.cos(th) * rr2, 5.6 + Math.sin(th) * rr2 * 0.9, 33.7 + (rnd() - 0.5) * 1.4, CY, 0.85); }
  for (let i = 0; i < 500; i++) { const x = (rnd() - 0.5) * 9.4; add(x, 8.2 + rnd() * 1.2, 33.7 + (rnd() - 0.5) * 1.4, CY, 0.55); }
  // palms outside the wall
  const prn = mulberry(77);
  for (let p = 0; p < 18; p++) {
    let a = prn() * 6.283; if (Math.abs(Math.sin(a) - 1) < 0.08) a += 0.4;
    const rr2 = 39 + prn() * 22, x0 = Math.cos(a) * rr2, z0 = Math.sin(a) * rr2, y0 = hill(x0, z0), H = 5 + prn() * 2.5, lean = (prn() - 0.5) * 1.6;
    for (let k = 0; k < 60; k++) { const u = k / 60; add(x0 + lean * u * u, y0 + u * H, z0 + lean * 0.4 * u * u, CY, 0.55); }
    for (let f = 0; f < 8; f++) { const fa = (f / 8) * 6.283 + prn(); for (let k = 0; k < 22; k++) { const u = k / 22; add(x0 + lean + Math.cos(fa) * u * 2.6, y0 + H + 0.5 * Math.sin(u * 3) - u * u * 1.6, z0 + lean * 0.4 + Math.sin(fa) * u * 2.6, CY, 0.8); } }
  }
  // idols ("tuhan lain") at the north-east edge of the square: plain stone pillars with a block, no faces
  const IDOL = [[6.6, -7.2], [8.8, -4.0], [3.6, -9.4]];
  const idolArr = [];
  for (const [ix, iz] of IDOL) {
    for (let i = 0; i < 360; i++) { const y = rnd() * 2.6, side = Math.floor(rnd() * 4), u = rnd() - 0.5; const w = y < 0.4 ? 0.95 : 0.5; idolArr.push(ix + (side < 2 ? u * w : (side - 2.5) * w), y, iz + (side < 2 ? (side - 0.5) * w : u * w), 0.5, 0.62, 0.66, rnd()); }
    for (let i = 0; i < 120; i++) idolArr.push(ix + (rnd() - 0.5) * 0.8, 2.6 + rnd() * 0.7, iz + (rnd() - 0.5) * 0.8, 0.55, 0.66, 0.7, rnd());
  }
  const city = cloud(C, 0.085);
  const idols = cloud(idolArr, 0.075, false);

  // ---------- survey grid (lines) and ground cross marks
  {
    const v = []; const E = 96, S = 8;
    for (let x = -E; x <= E; x += S) v.push(x, 0.01, -E, x, 0.01, E);
    for (let z = -E; z <= E; z += S) v.push(-E, 0.01, z, E, 0.01, z);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    var grid = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: CY.clone().multiplyScalar(0.16), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(grid);
  }

  // ---------- textures
  const glowTex = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.2, "rgba(255,255,255,.55)"); g.addColorStop(0.55, "rgba(255,255,255,.12)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  const glow = (col, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.setScalar(s); scene.add(m); return m; };

  // ---------- labels (survey tags in the world)
  function label(text, col, wW, anchor, h) {
    const cw = 1024, ch = 150;
    const tex = canvasTex(cw, ch, (x, w, hh) => {
      x.font = 'bold 70px Consolas, "Courier New", monospace';
      const tw = Math.min(w - 70, x.measureText(text).width);
      x.fillStyle = "rgba(6,12,16,.72)"; x.fillRect(0, 10, tw + 64, hh - 20);
      x.strokeStyle = col; x.lineWidth = 6;
      x.beginPath(); x.moveTo(4, 44); x.lineTo(4, 13); x.lineTo(34, 13); x.moveTo(4, hh - 44); x.lineTo(4, hh - 13); x.lineTo(34, hh - 13);
      x.moveTo(tw + 60, 44); x.lineTo(tw + 60, 13); x.lineTo(tw + 30, 13); x.moveTo(tw + 60, hh - 44); x.lineTo(tw + 60, hh - 13); x.lineTo(tw + 30, hh - 13); x.stroke();
      x.fillStyle = col; x.textBaseline = "middle"; x.fillText(text, 32, hh / 2 + 3);
    });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    sp.center.set(0, 0.5); sp.scale.set(wW, (wW * ch) / cw, 1); sp.position.set(anchor[0] + 0.15, anchor[1] + h, anchor[2]); sp.renderOrder = 20; scene.add(sp);
    const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(anchor[0], anchor[1], anchor[2]), new THREE.Vector3(anchor[0], anchor[1] + h, anchor[2])]);
    const ln = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: col, transparent: true, depthTest: false, depthWrite: false })); ln.renderOrder = 19; scene.add(ln);
    return (o) => { sp.material.opacity = o; ln.material.opacity = o * 0.8; sp.visible = ln.visible = o > 0.01; };
  }
  const TP = [8.5, 0, 44];
  const L = {
    ujung: label("UJUNG KOTA", "#F2A93B", 7.5, [-4.5, 0, -33], 5.5),
    gerbang: label("GERBANG KOTA", "#5FD3E0", 6.4, [-4.6, 9.5, 33.7], 2.2),
    audira: label("SURVEI AUDIRA", "#E8EEF2", 5.2, [TP[0], 1.75, TP[2]], 1.6),
    alun: label("ALUN-ALUN", "#5FD3E0", 6.2, [-9, 0, -3], 4.5),
    pend: label("PENDUDUK", "#E07470", 5.0, [-6.8, 1.8, 3], 2.6),
    kaum: label("KAUMKU", "#F2A93B", 15, [-7.2, 1.8, 2], 9),
  };

  // ---------- survey tripod with a sweeping laser fan (the AUDIRA survey station)
  const triV = []; const head = [TP[0], 1.7, TP[2]];
  for (const a of [0.3, 2.4, 4.5]) triV.push(...head, TP[0] + Math.cos(a) * 0.8, 0, TP[2] + Math.sin(a) * 0.8);
  const tri = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(triV, 3)), new THREE.LineBasicMaterial({ color: WHITE, transparent: true, opacity: 0.8 }));
  scene.add(tri);
  const NF = 7, fanPos = new Float32Array(NF * 6);
  const fanG = new THREE.BufferGeometry(); fanG.setAttribute("position", new THREE.BufferAttribute(fanPos, 3));
  const fan = new THREE.LineSegments(fanG, new THREE.LineBasicMaterial({ color: CY, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })); fan.frustumCulled = false; scene.add(fan);
  const triHead = glow(CY, 0.7); triHead.position.set(...head);

  // ---------- people: faceless point silhouettes (template with parts for leg/arm swing)
  function personTemplate(n, seed) {
    const pr = mulberry(seed), T = [];
    const push = (x, y, z, part, b) => T.push([x, y, z, part, b]);
    for (let i = 0; i < n * 0.22; i++) { const a = pr() * 6.283, v = Math.acos(2 * pr() - 1); push(Math.cos(a) * Math.sin(v) * 0.14, 1.6 + Math.cos(v) * 0.15, Math.sin(a) * Math.sin(v) * 0.14, 0, 1); }
    for (let i = 0; i < n * 0.36; i++) { const y = 0.86 + pr() * 0.56, rad = mix(0.19, 0.25, (y - 0.86) / 0.56), a = pr() * 6.283; push(Math.cos(a) * rad, y, Math.sin(a) * rad * 0.7, 0, 0.85); }
    for (const s of [-1, 1]) {
      for (let i = 0; i < n * 0.12; i++) { const y = pr() * 0.88; push(s * 0.1 + (pr() - 0.5) * 0.08, y, (pr() - 0.5) * 0.08, s < 0 ? 1 : 2, 0.8); }
      for (let i = 0; i < n * 0.09; i++) { const y = 0.82 + pr() * 0.58; push(s * (0.29 + (1.4 - y) * 0.05) + (pr() - 0.5) * 0.05, y, (pr() - 0.5) * 0.06, s < 0 ? 3 : 4, 0.8); }
    }
    return T;
  }
  const PT = personTemplate(110, 5), MT = personTemplate(300, 9);
  function posePerson(T, buf, off, colBuf, x, z, yaw, swing, col, b, sc = 1, lift = 0) {
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    for (let k = 0; k < T.length; k++) {
      let [px, py, pz, part, pb] = T[k];
      if (part) {
        const piv = part < 3 ? 0.88 : 1.4, ang = (part === 1 || part === 4 ? 1 : -1) * swing * (part < 3 ? 1 : 0.8);
        const dy = py - piv, c2 = Math.cos(ang), s2 = Math.sin(ang);
        py = piv + dy * c2; pz = pz + dy * s2;
      }
      px *= sc; py *= sc; pz *= sc;
      const i = (off + k) * 3;
      buf[i] = x + px * cs + pz * sn; buf[i + 1] = py + lift; buf[i + 2] = z - px * sn + pz * cs;
      colBuf[i] = col.r * b * pb; colBuf[i + 1] = col.g * b * pb; colBuf[i + 2] = col.b * b * pb;
    }
  }

  // crowd: home spots in the streets, then a ring around the square (gaps south for the messengers, north for the man)
  const NP = 58, crowd = dyn(NP * PT.length, 0.06);
  const PR = mulberry(4242), PD = [];
  for (let i = 0; i < NP; i++) {
    const side = i % 2 ? 1 : -1, row = i % 3;
    const ang = side * (0.5 + PR() * 2.15);   // angle from +z (south), east/west arcs only
    const rad = 5.6 + row * 1.15 + PR() * 0.5;
    const ha = PR() * 6.283, hr = 12 + PR() * 12;
    PD.push({ hx: Math.sin(ha) * hr, hz: Math.cos(ha) * hr, ang, rad, d0: PR() * 1.6, ph: PR() * 6.28, sp: 0.9 + PR() * 0.3 });
  }
  const CC = [0, 0.6];

  // messengers: three steady lights (never figures)
  const MSG = [{ x: -1.5, z: 2.6, t0: tDua - 0.35, dur: 4.6, gx: -1.1 }, { x: 1.5, z: 2.6, t0: tDua - 0.1, dur: 4.6, gx: 1.1 }, { x: 0, z: 3.4, t0: tKet - 0.55, dur: 3.2, gx: 0 }];
  const msgG = MSG.map(() => [glow(WARM, 0.85), glow(new THREE.Color(1, 1, 1), 0.32), glow(WARM, 2.2)]);
  const msgRing = dyn(3 * 40, 0.05);

  // the man: amber silhouette + trail + footprints that stay
  const man = dyn(MT.length, 0.055);
  const manGlow = glow(AMB, 2.2), manCore = glow(new THREE.Color(1, 0.85, 0.6), 0.55);
  const NT = 320, trail = dyn(NT, 0.07);
  const TRR = mulberry(31); const TJ = Array.from({ length: NT }, () => [TRR() - 0.5, TRR(), TRR() - 0.5]);
  const NFP = 90, steps = dyn(NFP, 0.08);
  const FPU = Array.from({ length: NFP }, (_, i) => 0.03 + (i / NFP) * 0.97);
  const runU = (t) => (t < K.s4 - 0.05 ? 0.07 * sm((t - tBerg) / Math.max(0.5, K.s1e - tBerg)) : mix(0.07, 1, sm((t - tRun0) / (tRun1 - tRun0))));
  const manAt = (t) => { const p = pathAt(runU(t)); return [p[0], p[1], p[2]]; };

  // memorial pin (s8): vertical amber line + diamond at his spot
  const NPin = 160, pin = dyn(NPin, 0.16);
  const pinGlow = glow(AMB, 5);
  const END = pathAt(1);

  // ---------- gate of light (outside the town, north)
  const gateArr = [], leafArr = [];
  const GW = 4.6, GH = 13.5, GA = 3.6;
  for (let i = 0; i < 1600; i++) { const s = rnd() < 0.5 ? -1 : 1; gateArr.push(s * (GW + (rnd() - 0.5) * 0.9), rnd() * GH, (rnd() - 0.5) * 0.9, 1, 0.86, 0.62, rnd()); }
  for (let i = 0; i < 1300; i++) { const th = rnd() * Math.PI; gateArr.push(Math.cos(th) * (GW + (rnd() - 0.5) * 0.9), GH + Math.sin(th) * GA, (rnd() - 0.5) * 0.9, 1, 0.86, 0.62, rnd()); }
  for (let i = 0; i < 2200; i++) { const u = rnd(), y = rnd() * (GH + 5); const xx = u * GW; const top = GH + Math.sqrt(Math.max(0, 1 - (xx / GW) ** 2)) * GA; if (y > top) continue; const edge = u > 0.96 || u < 0.04 || y < 0.3 || top - y < 0.3; leafArr.push(xx, y, 0, 0.9, 0.78, 0.55, edge ? 1 : rnd() * 0.35); }
  const gate = cloud(gateArr, 0.09, false); gate.P.position.copy(GP);
  const leaves = [-1, 1].map((s) => { const c = cloud(leafArr, 0.08, false); c.P.position.set(GP.x + s * GW, 0, GP.z); c.P.scale.x = -s; return c; });
  const innerTex = canvasTex(128, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,220,160,0)"); g.addColorStop(0.5, "rgba(255,240,210,1)"); g.addColorStop(1, "rgba(255,220,160,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, "rgba(0,0,0,.85)"); v.addColorStop(0.35, "rgba(0,0,0,0)"); x.globalCompositeOperation = "destination-out"; x.fillStyle = v; x.fillRect(0, 0, w, h); });
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(2 * GW, GH + GA), new THREE.MeshBasicMaterial({ map: innerTex, color: 0xffe2b0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  inner.position.set(GP.x, (GH + GA) / 2, GP.z); scene.add(inner);
  const NG = 420, motes = dyn(NG, 0.07); const GMR = mulberry(55); const GM = Array.from({ length: NG }, () => [GMR() * 2 - 1, GMR(), GMR() * 2 - 1, GMR()]);

  // ---------- camera (drone). keys: [t, px,py,pz, tx,ty,tz]
  const chase = [];
  for (const tk of [tRun0 + 1.5, tRun0 + 2.4, tRun0 + 3.3, tRun1 + 0.15]) { const [mx, mz] = manAt(tk); chase.push([tk, mx + 1.6, 5.2, mz + 10.5, mx * 0.6, 1.1, mz - 3.5]); }
  const camK = [
    [0, 0, 82, 72, 0, 0, -6],
    [tLel, -2, 64, 36, -3, 0, -22],
    [tBerg + 2.2, -7, 30, -6, -4, 1, -29],
    [K.s1e, -9, 23, -15, -4, 1, -30],
    [K.s2 + 2.4, 6, 58, 4, 0, 0, 10],
    [tDua - 0.6, 5, 13, 58, 0, 3.5, 28],
    [tDust + 0.4, 4, 14, 49, 0, 1.4, 16],
    [tKet + 0.2, 8, 18, 31, 0, 1, 4],
    [K.s2e, 13, 19, 22, 0, 1, 1.5],
    [tSial, 8, 11.5, 17, 0, 1.2, 1],
    [tRajam, -3, 9.5, 15.5, 0, 1.2, 0.8],
    [K.s3e, -2, 15, 16, -1, 1, -8],
    [tRun0 + 0.4, 0, 16, 10, -2.6, 1, -25],
    ...chase,
    [tIku + 0.4, -4, 6.5, 10.5, 0, 1.2, -1.5],
    [K.s4e, -11, 7, 6, 0, 1.2, -1.2],
    [tTuhan - 0.6, -12, 5.8, -4, 0, 1.4, -1.8],
    [tTolong + 0.6, -9, 6.2, -12, 2.2, 1.4, -3.6],
    [tIman + 0.2, -4, 7.5, -14, 0, 1.4, -2.4],
    [K.s5e, 4, 9.5, -13.5, 0, 1.2, -1.6],
    [tBunuh + 0.4, 6.5, 12, -11, 0, 1.1, -1.4],
    [tDoa + 0.6, 11, 24, -6, 0, 0.5, -1.8],
    [tTahu + 0.4, 9, 33, 10, 0, 0, -5],
    [tMati + 0.6, 3, 30, 4, 0, 6, -34],
    [tMasuk + 0.2, 4, 18, -4, 0, 8, -66],
    [K.s7 + 0.6, 44, 26, -24, 0, 7, -64],
    [K.s7 + 2.4, 60, 32, -100, 0, 6, -58],
    [tKaum7 - 0.6, 6, 30, -104, 0, 1, -6],
    [K.s7e, 0, 32, -108, 0, 0.8, -4],
    [tKaum8 + 0.6, -10, 56, -92, 0, 1, -4],
    [K.end, -14, 92, -66, 0, 0, 0],
    [K.dur, -15, 95, -64, 0, 0, 0],
  ];
  const camT = track(camK);

  // ---------- render
  const tv = new THREE.Vector3();
  return (t) => {
    const [cx, cy, cz, tx, ty, tz] = camT(t);
    cam.position.set(cx, cy, cz); cam.lookAt(tx, ty, tz);

    // scan reveal, ambient scan ring, rising scanline, event rings
    SU.uRev.value = t < 3.2 ? mix(16, 120, eout(t / 3.0)) : 220;
    SU.uRingA.value = ((t * 14) % 130); SU.uRingCA.value.set(0, 0, 0);
    SU.uScanY.value = ((t * 2.2) % 13) - 1;
    const EV = [[tLel, -4.5, -33, AMB], [tIku, 0, -2.4, AMB], [tIman, 0, -2.4, AMB], [tDeng, 0, -2.4, AMB], [tDoa, 0, -2.4, AMB], [tMasuk, GP.x, GP.z, WARM], [tKaum8, 0, -2.4, AMB], [tKisah, 0, -2.4, CY]];
    let ev = null; for (const e of EV) if (t >= e[0]) ev = e;
    if (ev && t - ev[0] < 6) { SU.uRingB.value = (t - ev[0]) * (ev[0] === tMasuk ? 26 : 13); SU.uRingCB.value.set(ev[1], 0, ev[2]); SU.uRingColB.value.copy(ev[3]).multiplyScalar(1 - (t - ev[0]) / 6); }
    else SU.uRingB.value = -99;
    const gOpen = ramp(t, tMasuk - 0.2, tMasuk + 2.4);
    SU.uGate.value = gOpen * (1 - 0.3 * ramp(t, K.s8, K.end));
    city.P.material.uniforms.uDim.value = 1 - 0.22 * ramp(t, tBunuh, tBunuh + 3) + 0.12 * ramp(t, K.s8, K.s8 + 3);
    grid.material.opacity = 0.9;

    // labels
    L.ujung(ramp(t, tLel, tLel + 0.4) * (1 - ramp(t, K.s1e - 0.6, K.s1e)) + ramp(t, K.s4, K.s4 + 0.4) * (1 - ramp(t, tRun0 + 1.2, tRun0 + 1.6)));
    L.gerbang(ramp(t, tDua - 1.6, tDua - 1.1) * (1 - ramp(t, tDust + 0.6, tDust + 1.0)));
    L.audira(ramp(t, tDua - 1.4, tDua - 0.9) * (1 - ramp(t, tDust + 0.6, tDust + 1.0)));
    L.alun(ramp(t, tKet + 0.3, tKet + 0.7) * (1 - ramp(t, K.s2e - 0.3, K.s2e)));
    L.pend(ramp(t, tPend, tPend + 0.4) * (1 - ramp(t, tSial + 0.6, tSial + 1.0)));
    L.kaum(ramp(t, tKaum7 - 0.3, tKaum7 + 0.2) * (1 - ramp(t, K.s7e - 0.4, K.s7e)));

    // survey tripod fan sweeping toward the gate
    for (let k = 0; k < NF; k++) {
      const a = -Math.PI / 2 - 0.42 + 0.3 * Math.sin(t * 1.3) + k * 0.045 + 0.25;
      const el = -0.08 + 0.05 * Math.sin(t * 2.1 + k);
      fanPos.set([head[0], head[1], head[2], head[0] + Math.cos(a) * 16, head[1] + el * 16, head[2] + Math.sin(a) * 16], k * 6);
    }
    fanG.attributes.position.needsUpdate = true;
    const triVis = t < K.s3; tri.visible = fan.visible = triHead.visible = triVis;

    // messengers
    for (let k = 0; k < 3; k++) {
      const m = MSG[k], u = sm((t - m.t0) / m.dur), on = ramp(t, m.t0 - 0.2, m.t0 + 0.4);
      const x = mix(m.gx, m.x, u), z = mix(37.5, m.z, u);
      const [halo, core, wide] = msgG[k];
      halo.position.set(x, 1.3, z); core.position.set(x, 1.3, z); wide.position.set(x, 1.3, z);
      halo.material.opacity = 0.7 * on; core.material.opacity = 0.9 * on; wide.material.opacity = 0.14 * on * (1 + 0.6 * gauss(t, tIku + 0.3, 0.6));
      halo.visible = core.visible = wide.visible = on > 0.01;
      for (let j = 0; j < 40; j++) {
        const a = (j / 40) * 6.283, i3 = (k * 40 + j) * 3;
        msgRing.pos[i3] = x + Math.cos(a) * 0.7; msgRing.pos[i3 + 1] = 0.04; msgRing.pos[i3 + 2] = z + Math.sin(a) * 0.7;
        msgRing.col[i3] = 1 * on * 0.8; msgRing.col[i3 + 1] = 0.88 * on * 0.8; msgRing.col[i3 + 2] = 0.66 * on * 0.8;
      }
    }
    msgRing.commit();

    // man
    const u = runU(t), [mx, mz, myaw] = manAt(t);
    const vel = Math.abs(runU(t + 0.03) - runU(t - 0.03)) * LEN / 0.06;
    const arrived = t > tRun1 - 0.1;
    let mOn = t < K.s2 ? ramp(t, tLel - 0.2, tLel + 0.4) * (1 - ramp(t, K.s2 - 0.1, K.s2 + 0.5)) : ramp(t, K.s4, K.s4 + 0.6);
    const dimF = 1 - 0.78 * ramp(t, tBunuh + 0.3, tBunuh + 2.8) + 0.25 * gauss(t, tDoa + 1.2, 1.4) * ramp(t, tBunuh, tBunuh + 1);
    const still = t > tBunuh + 2.8;
    const breath = still ? 0 : 0.02 * Math.sin(t * 2.2);
    const brightM = mOn * dimF * (1 + 0.5 * gauss(t, tIman + 0.3, 0.7) + 0.3 * gauss(t, tCipta + 0.3, 0.6));
    const sw = Math.sin(u * LEN * 1.9) * Math.min(1, vel / 3) * 0.75;
    const yawM = arrived ? mix(myaw, Math.PI, ramp(t, tRun1, tRun1 + 0.8)) : myaw;
    posePerson(MT, man.pos, 0, man.col, mx, mz, yawM, sw, AMB, brightM * 1.0, 1 + breath);
    man.commit(); man.P.visible = mOn > 0.01;
    manGlow.position.set(mx, 1.15, mz); manGlow.material.opacity = 0.3 * brightM; manGlow.visible = mOn > 0.01;
    manCore.position.set(mx, 1.2, mz); manCore.material.opacity = 0.45 * brightM; manCore.visible = mOn > 0.01;
    // trail: his recent path, fading
    for (let i = 0; i < NT; i++) {
      const tau = t - i * 0.009, uu = runU(tau), p = pathAt(uu), fresh = 1 - i / NT;
      const mv = Math.abs(uu - runU(tau - 0.05)) > 1e-4 ? 1 : 0;
      const j = TJ[i];
      trail.pos[i * 3] = p[0] + j[0] * 0.5; trail.pos[i * 3 + 1] = 0.05 + j[1] * 1.3 * fresh; trail.pos[i * 3 + 2] = p[1] + j[2] * 0.5;
      const b = mOn * mv * fresh * fresh * 1.4 * (t < K.s2 ? 1 : 1);
      trail.col[i * 3] = AMB.r * b; trail.col[i * 3 + 1] = AMB.g * b; trail.col[i * 3 + 2] = AMB.b * b;
    }
    trail.commit();
    // footprints: stay where he passed (dim), shine again in s8
    const fpB = (t < K.s2 ? 1 : ramp(t, K.s4, K.s4 + 0.3)) * (0.45 * dimF + 0.6 * ramp(t, tKaum8, tKaum8 + 2));
    for (let i = 0; i < NFP; i++) {
      const p = pathAt(FPU[i]), side = i % 2 ? 0.18 : -0.18;
      steps.pos[i * 3] = p[0] + Math.cos(p[2]) * side; steps.pos[i * 3 + 1] = 0.03; steps.pos[i * 3 + 2] = p[1] - Math.sin(p[2]) * side;
      const b = u >= FPU[i] ? fpB : 0;
      steps.col[i * 3] = AMB.r * b; steps.col[i * 3 + 1] = AMB.g * b; steps.col[i * 3 + 2] = AMB.b * b;
    }
    steps.commit();

    // crowd
    for (let i = 0; i < NP; i++) {
      const d = PD[i];
      const gather = sm((t - tDust - d.d0 * 0.5) / 3.4);
      const tight = sm((t - tRajam + 0.6) / 1.4) * (1 - 0.35 * sm((t - tBunuh - 3) / 4));
      const rad = d.rad * (1 - 0.22 * tight);
      const rx = CC[0] + Math.sin(d.ang) * rad, rz = CC[1] + Math.cos(d.ang) * rad;
      const wob = 1 - gather;
      const hx = d.hx + 0.5 * Math.sin(t * 0.3 + d.ph) * wob, hz = d.hz + 0.5 * Math.cos(t * 0.27 + d.ph) * wob;
      const x = mix(hx, rx, gather), z = mix(hz, rz, gather);
      const moving = (gather > 0.02 && gather < 0.98) || (tight > 0.02 && tight < 0.98);
      const swing = moving ? Math.sin(t * 9 * d.sp + d.ph) * 0.5 : 0;
      const face = t > tRun1 ? Math.atan2(mx - x, mz - z) : Math.atan2(CC[0] - x, 2.6 - z);
      const homeFace = Math.atan2(-hx, -hz);
      const yaw = gather < 0.5 ? homeFace : face;
      const redU = sm((t - tDust - d.d0) / 0.8);
      const pulse = 1 + 0.6 * gauss(t, tSial + 0.2, 0.35) + 0.9 * gauss(t, tRajam + 0.2, 0.45) + 0.4 * gauss(t, tBunuh + 0.3, 0.6);
      const col = new THREE.Color().copy(CY).lerp(RED, redU);
      const b = (0.55 + 0.6 * redU) * pulse * (1 - 0.35 * ramp(t, tMati, tMati + 3)) * ramp(t, 0.6, 2.4);
      posePerson(PT, crowd.pos, i * PT.length, crowd.col, x, z, yaw, swing, col, b, 0.96);
    }
    crowd.commit();

    // idols: glitch and go hollow at "menolongku"
    const iG = ramp(t, tTolong, tTolong + 1.2);
    idols.P.material.uniforms.uDim.value = ramp(t, tTuhan - 1.2, tTuhan) * (1 - 0.8 * iG) * (iG > 0 && iG < 1 ? 0.5 + 0.5 * Math.sin(t * 61) : 1) * (1 - ramp(t, K.s6, K.s6 + 1)) * 1.0;
    idols.P.visible = t > tTuhan - 1.3 && t < K.s6 + 1.1;

    // memorial pin in s8
    const pinB = ramp(t, tKaum8 - 0.2, tKaum8 + 1.4);
    for (let i = 0; i < NPin; i++) {
      const i3 = i * 3;
      if (i < 110) { const y = (i / 110) * 14 * pinB; pin.pos[i3] = END[0]; pin.pos[i3 + 1] = y; pin.pos[i3 + 2] = END[1]; }
      else { const a = ((i - 110) / 50) * 6.283; const dd = 0.9 * (1 - Math.abs(Math.sin(a * 2)) * 0.5); pin.pos[i3] = END[0] + Math.cos(a) * dd; pin.pos[i3 + 1] = 14 * pinB + Math.sin(a) * dd * 1.3; pin.pos[i3 + 2] = END[1]; }
      const b = pinB * 1.5 * (0.85 + 0.15 * Math.sin(t * 2 + i * 0.3));
      pin.col[i3] = AMB.r * b; pin.col[i3 + 1] = AMB.g * b; pin.col[i3 + 2] = AMB.b * b;
    }
    pin.commit(); pin.P.visible = pinB > 0.001;
    pinGlow.position.set(END[0], 14 * pinB, END[1]); pinGlow.material.opacity = 0.6 * pinB; pinGlow.visible = pinB > 0.001;

    // gate of light
    const gIn = ramp(t, tMati - 0.3, tMati + 1.5);
    gate.P.material.uniforms.uDim.value = gIn * (0.65 + 0.3 * gOpen); gate.P.visible = gIn > 0.001;
    const lr = 1.35 * eout(gOpen);
    leaves[0].P.rotation.y = -lr; leaves[1].P.rotation.y = lr;
    for (const lv of leaves) { lv.P.material.uniforms.uDim.value = gIn * (0.75 + 0.25 * gOpen); lv.P.visible = gIn > 0.001; }
    const behind = ramp(t, K.s7, K.s7 + 2.5);
    inner.material.opacity = gOpen * (0.5 - 0.35 * behind); inner.visible = gOpen > 0.001;
    for (let i = 0; i < NG; i++) {
      const g = GM[i], i3 = i * 3, yy = ((g[1] + t * 0.03 * (0.5 + g[3])) % 1) * (GH + 3);
      motes.pos[i3] = GP.x + g[0] * GW * 0.95; motes.pos[i3 + 1] = yy; motes.pos[i3 + 2] = GP.z + g[2] * 1.5;
      const b = gOpen * (0.5 + 0.5 * Math.sin(t * 1.7 + g[3] * 20)) * 0.9;
      motes.col[i3] = b; motes.col[i3 + 1] = 0.86 * b; motes.col[i3 + 2] = 0.62 * b;
    }
    motes.commit(); motes.P.visible = gOpen > 0.001;

    bp.strength = 0.55 - 0.15 * gOpen;
    comp.render();
  };
}
