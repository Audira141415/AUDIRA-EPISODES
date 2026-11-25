// EP04 MUSA MEMBELAH LAUT. INKSTORY: a sumi-e ink-wash world on rice paper. Black and grey ink, deep indigo for water only.
// Nabi Musa is never shown: his presence is one wooden staff. Bani Israil are tiny faceless ink dabs, Firaun's army dark chariot silhouettes.
// Shore at z=0, sea toward -z, far shore at z=-61, land and the army toward +z. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const L = 61;               // sea width between the shores
const PAPER = 0xefe7d6, NIGHT = 0x9c9da0;
const INDIGO = 0x1c2a58, INK = 0x15161a;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: PAPER, fog: 0.0062, exp: 1.0, bloom: [0, 0.3, 0.99], shadow: false });
  r.toneMapping = THREE.NoToneMapping;
  bp.strength = 0;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2663);
  const cPaper = new THREE.Color(PAPER), cNight = new THREE.Color(NIGHT), bgC = new THREE.Color();

  // ---------- timing
  const tStrike = A("s5:tongkatmu") + 0.45;          // the staff meets the water
  const tSplit0 = tStrike + 0.15, tSplit1 = A("s5:belahan");
  const tCross0 = A("s5:jalan") - 0.3, tCross1 = A("s6:Firaun");
  const tChase = A("s6:Firaun") + 0.2;
  const tClose0 = A("s6:ombak"), tClose1 = A("s6:mereka") + 0.6;
  const nightF = (t) => (t > K.s2 - 0.05 ? 1 : 0) * (1 - ramp(t, A("s3:Saat"), A("s3:terbit") + 0.6));
  const sunUp = (t) => (t < K.s2 - 0.05 ? 0.75 : ramp(t, A("s3:Saat") - 0.3, A("s3:menyusul")) * 0.8 + 0.2 * ramp(t, K.s4, K.s8));

  // ---------- paper textures
  const washTex = (seed, base, dabs, alpha) => canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < dabs; i++) {
      const x = q() * w, y = q() * h, rr = 10 + q() * 70;
      const gr = g.createRadialGradient(x, y, 1, x, y, rr);
      gr.addColorStop(0, `rgba(40,40,44,${alpha * q()})`); gr.addColorStop(1, "rgba(40,40,44,0)");
      g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    g.strokeStyle = "rgba(30,30,34,.12)";
    for (let i = 0; i < 40; i++) { g.lineWidth = 0.6 + q() * 1.4; g.beginPath(); const x = q() * w, y = q() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 30, y + (q() - .5) * 8, x + 40 + q() * 80, y + (q() - .5) * 6); g.stroke(); }
  }, [14, 14]);
  const groundM = new THREE.MeshBasicMaterial({ map: washTex(4, "#ece3cf", 70, 0.16) });
  const near = new THREE.Mesh(new THREE.PlaneGeometry(900, 450), groundM);
  near.rotation.x = -Math.PI / 2; near.position.set(0, 0.25, 225 + 0.4); scene.add(near);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(900, 450), groundM);
  far.rotation.x = -Math.PI / 2; far.position.set(0, 0.25, -L - 225 - 0.2); scene.add(far);

  // brush shorelines
  const strokeTex = canvasTex(1024, 64, (g, w, h) => {
    const q = mulberry(77); g.clearRect(0, 0, w, h);
    for (let k = 0; k < 9; k++) { g.strokeStyle = `rgba(20,22,28,${0.25 + q() * 0.5})`; g.lineWidth = 3 + q() * 10; g.beginPath(); let y = h / 2 + (q() - .5) * 20; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) { y += (q() - .5) * 4; g.lineTo(x, Math.max(6, Math.min(h - 6, y))); } g.stroke(); }
  });
  for (const z of [0.55, -L - 0.4]) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(420, 0.7), new THREE.MeshBasicMaterial({ map: strokeTex, transparent: true, opacity: 0.55, depthWrite: false }));
    s.rotation.x = -Math.PI / 2; s.position.set(0, 0.27, z); scene.add(s);
  }

  // ---------- dry seabed for the path (QS 20:77): cracked, pale
  const bedTex = canvasTex(256, 1024, (g, w, h) => {
    const q = mulberry(2077);
    g.fillStyle = "#e3d6bb"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(60,50,40,.45)";
    for (let i = 0; i < 260; i++) { g.lineWidth = 0.5 + q() * 1.5; g.beginPath(); let x = q() * w, y = q() * h; g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (q() - .5) * 40; y += (q() - .5) * 40; g.lineTo(x, y); } g.stroke(); }
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(28,42,88,.5)"); gr.addColorStop(.18, "rgba(28,42,88,0)"); gr.addColorStop(.82, "rgba(28,42,88,0)"); gr.addColorStop(1, "rgba(28,42,88,.5)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(9.6, L + 2), new THREE.MeshBasicMaterial({ map: bedTex }));
  bed.rotation.x = -Math.PI / 2; bed.position.set(0, -0.35, -L / 2); scene.add(bed);

  // ---------- the sea: GPU heightfield, ink contour lines, split into two mountain walls
  const NX = 300, NZ = 170;
  const xs = [], zs = [];
  for (let i = 0; i <= NX; i++) { const u = i / NX * 2 - 1; xs.push(220 * Math.sign(u) * Math.pow(Math.abs(u), 2.3)); }
  for (let j = 0; j <= NZ; j++) zs.push(1.6 - (L + 3.2) * j / NZ);
  const sp = new Float32Array((NX + 1) * (NZ + 1) * 3), idx = [];
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const k = (j * (NX + 1) + i) * 3; sp[k] = xs[i]; sp[k + 1] = 0; sp[k + 2] = zs[j]; }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const seaG = new THREE.BufferGeometry();
  seaG.setAttribute("position", new THREE.BufferAttribute(sp, 3)); seaG.setIndex(idx);
  const U = {
    uT: { value: 0 }, uFront: { value: -10 }, uOpen: { value: 0 }, uClose: { value: 0 }, uStorm: { value: 1 }, uRing: { value: 0 }, uRingT: { value: 0 },
    uPaper: { value: new THREE.Color(0xf3ecdc) }, uIndigo: { value: new THREE.Color(INDIGO) }, uInk: { value: new THREE.Color(INK) },
    uFog: { value: new THREE.Color(PAPER) }, uDen: { value: 0.0062 }, uL: { value: L },
  };
  const NOISE = `float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}`;
  const seaM = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `uniform float uT,uFront,uOpen,uClose,uStorm,uL,uRing,uRingT;
varying vec3 vW;varying vec3 vN;varying float vH;varying float vD;
${NOISE}
float baseW(vec2 p){float t=uT;
 float h=sin(p.x*.21+t*.9+sin(p.y*.13)*1.5)*.22+sin(p.y*.31-t*1.3+p.x*.05)*.18+sin((p.x+p.y)*.47+t*1.7)*.08+(vn(p*.15+vec2(t*.2,0.))-.5)*.3;
 return h*uStorm;}
float H(vec2 p){
 float b=baseW(p);
 b*=mix(.35,1.,smoothstep(.5,-4.,p.y)*smoothstep(-uL-1.,-uL+4.,p.y));
 float rr=length(p-vec2(0.,-1.2));
 b+=uRing*sin(rr*2.2-uRingT*7.)*exp(-((rr-uRingT*3.2)/1.6)*((rr-uRingT*3.2)/1.6))*.35;
 float d=abs(p.x),zz=-p.y;
 float inSea=smoothstep(-1.2,.6,zz)*smoothstep(uL+1.2,uL-.6,zz);
 float s=smoothstep(zz-1.,zz+7.,uFront)*uOpen*inSea;
 float W=3.7+(vn(vec2(p.y*.1,3.))-.5)*.7;
 float pk=15.5*(.78+.44*vn(vec2(p.y*.07,p.x>0.?1.:7.)));
 float rise=smoothstep(W,W+2.8,d);
 float fall=exp(-max(d-W-3.,0.)/17.);
 float wall=mix(-6.,pk*fall,rise)+b*.6+(vn(p*.45)-.5)*1.1*rise;
 float h=mix(b,wall,s);
 float cr=uClose;
 h+=sin(3.14159*cr)*5.5*exp(-((d-(W+3.)*(1.-cr))/2.6)*((d-(W+3.)*(1.-cr))/2.6))*inSea*step(.001,cr)*step(cr,.999);
 return h;}
void main(){
 vec2 p=position.xz;float h=H(p);float e=.18;
 vec3 n=normalize(vec3(H(p-vec2(e,0.))-H(p+vec2(e,0.)),2.*e,H(p-vec2(0.,e))-H(p+vec2(0.,e))));
 vec3 w=vec3(p.x,h,p.y);vW=w;vN=n;vH=h;
 vec4 mv=viewMatrix*vec4(w,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform vec3 uPaper,uIndigo,uInk,uFog;uniform float uDen;
varying vec3 vW;varying vec3 vN;varying float vH;varying float vD;
${NOISE}
void main(){
 vec3 n=normalize(vN);float slope=1.-n.y;
 float nz=vn(vW.xz*.35)*.6+vn(vW.xz*1.3)*.4;
 float ink=.42+.38*smoothstep(.1,.85,slope)+.2*nz;
 float f=fract(vH*1.6+nz*.35+sin(vW.x*.08)*.3);
 float line=1.-smoothstep(.015,.05,abs(f-.5));
 float st=vn(vec2(vW.x*1.6+vW.z*1.6,vW.y*.12));
 ink+=line*.45*(1.-smoothstep(.5,.9,slope))+smoothstep(.5,.85,st)*.4*smoothstep(.35,.8,slope);
 float crest=smoothstep(.55,1.,vH*.1)*(1.-smoothstep(.2,.5,slope));
 ink=clamp(ink-crest*.45,0.,1.);
 vec3 col=mix(uPaper,uIndigo,ink);
 col=mix(col,uInk,smoothstep(.82,1.,ink)*.5);
 float fd=1.-exp(-pow(uDen*vD,2.));
 gl_FragColor=vec4(mix(col,uFog,fd),1.);}`,
  });
  const sea = new THREE.Mesh(seaG, seaM); sea.frustumCulled = false; scene.add(sea);

  // ---------- far ink mountains (shan shui layers), drawn on paper, beyond the fog
  const ridgeTex = (seed, dark) => canvasTex(2048, 256, (g, w, h) => {
    const q = mulberry(seed); g.clearRect(0, 0, w, h);
    const ys = []; let y = h * .45;
    for (let x = 0; x <= w; x += 8) { y += (q() - .5) * 14 + (h * .45 - y) * .02; if (q() < .03) y -= 30; ys.push([x, Math.max(20, Math.min(h * .8, y))]); }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(30,32,40,${dark})`); gr.addColorStop(1, "rgba(30,32,40,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, h); ys.forEach(([x, yy]) => g.lineTo(x, yy)); g.lineTo(w, h); g.fill();
    g.strokeStyle = `rgba(20,20,26,${dark})`; g.lineWidth = 3; g.beginPath(); ys.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy))); g.stroke();
  });
  const RIDGES = [];
  [[-230, 0.42, 11, 70], [-320, 0.26, 12, 95], [300, 0.3, 13, 70], [400, 0.2, 14, 95]].forEach(([z, d, s, hgt]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1400, hgt), new THREE.MeshBasicMaterial({ map: ridgeTex(s, d), transparent: true, fog: false, depthWrite: false }));
    m.position.set(0, hgt * 0.32, z); if (z > 0) m.rotation.y = Math.PI; m.renderOrder = -5; scene.add(m); RIDGES.push(m);
  });

  // ---------- sun (east, +x) and moon
  const discTex = (fill, ring) => canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); const gr = g.createRadialGradient(128, 128, 10, 128, 128, 126); gr.addColorStop(0, fill); gr.addColorStop(.8, fill); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); if (ring) { g.strokeStyle = ring; g.lineWidth = 5; g.beginPath(); g.arc(128, 128, 104, 0.3, 5.9); g.stroke(); } });
  const sunM = new THREE.MeshBasicMaterial({ map: discTex("rgba(214,170,120,.85)", "rgba(40,30,30,.5)"), transparent: true, fog: false, depthWrite: false });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), sunM); sun.renderOrder = -6; scene.add(sun);
  const moonM = new THREE.MeshBasicMaterial({ map: discTex("rgba(248,244,232,1)", "rgba(40,40,50,.35)"), transparent: true, fog: false, depthWrite: false });
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), moonM); moon.renderOrder = -6; scene.add(moon);

  // ---------- Egypt: pyramids and towns, grey ink
  const GREY = new THREE.MeshBasicMaterial({ color: 0x55555a }), GREY2 = new THREE.MeshBasicMaterial({ color: 0x77777a }), DARK = new THREE.MeshBasicMaterial({ color: 0x2a2b30 });
  const CITY = new THREE.Vector3(58, 0.25, 120);
  [[0, 0, 13], [-16, 10, 9], [15, 14, 7]].forEach(([dx, dz, s]) => { const p = new THREE.Mesh(new THREE.ConeGeometry(s * .6, s * .75, 4), GREY2); p.rotation.y = Math.PI / 4; p.position.set(CITY.x + dx - 10, 0.25 + s * 0.62, CITY.z + dz + 48); scene.add(p); });
  const TOWNS = [new THREE.Vector3(-38, 0.25, 175), new THREE.Vector3(4, 0.25, 200), new THREE.Vector3(42, 0.25, 168), CITY];
  const TBANNERS = [];
  TOWNS.forEach((tc, ti) => {
    for (let k = 0; k < 14; k++) {
      const w = 2 + rnd() * 3, h = 1.4 + rnd() * 2.6, d = 2 + rnd() * 3;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rnd() < .5 ? GREY : GREY2);
      b.position.set(tc.x + (rnd() - .5) * 22, 0.25 + h / 2, tc.z + (rnd() - .5) * 16); scene.add(b);
    }
    if (ti < 3) { const gate = new THREE.Group(); gate.position.copy(tc); scene.add(gate);
    for (const s of [-1, 1]) { const py = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6, 2), GREY); py.position.set(s * 3, 3, -9); gate.add(py); } }
    if (ti < 3) for (let k = 0; k < 3; k++) {
      const G = new THREE.Group(); G.position.set(tc.x - 6 + k * 6, 0.25, tc.z - 10); scene.add(G);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 9, 6), DARK); pole.position.y = 4.5; G.add(pole);
      const fl = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, .05), DARK); fl.position.set(1.3, 8, 0); G.add(fl);
      TBANNERS.push({ G, k: ti * 0.35 + k * 0.12 });
    }
  });

  // ---------- Bani Israil: faceless ink dabs
  const dabG = new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(.13, .03), new THREE.Vector2(.15, .2), new THREE.Vector2(.11, .4), new THREE.Vector2(.08, .5), new THREE.Vector2(.1, .58), new THREE.Vector2(.05, .68), new THREE.Vector2(0, .7)], 8);
  const ND = 460;
  const dots = new THREE.InstancedMesh(dabG, new THREE.MeshBasicMaterial({ color: 0xffffff }), ND);
  dots.frustumCulled = false; scene.add(dots);
  const tmpC = new THREE.Color();
  const PATH = [CITY.clone().add(new THREE.Vector3(-8, 0, -12)), new THREE.Vector3(40, 0.25, 70), new THREE.Vector3(14, 0.25, 30), new THREE.Vector3(0, 0.25, 7)];
  const pathAt = (u, out) => { u = clamp01(u) * (PATH.length - 1); const i = Math.min(PATH.length - 2, Math.floor(u)), f = u - i; return out.copy(PATH[i]).lerp(PATH[i + 1], f); };
  const DOT = [];
  for (let i = 0; i < ND; i++) {
    tmpC.setScalar(0.008 + rnd() * 0.05); dots.setColorAt(i, tmpC);
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
    DOT.push({
      o: i / ND, lat: (rnd() - .5) * 3.2, ph: rnd() * 6.28, s: 0.85 + rnd() * 0.35,
      nx: Math.cos(a) * rr * 11.5, nz: 4.6 + Math.sin(a) * rr * 3.6 + rr * 1.2,
      fx: (rnd() - .5) * 30, fz: -L - 9 - rnd() * 14,
      cx: (rnd() - .5) * 5.4, q: rnd(),
    });
  }
  const dm = new THREE.Matrix4(), dq = new THREE.Quaternion(), dsv = new THREE.Vector3(), dpv = new THREE.Vector3(), tmpV = new THREE.Vector3();

  // ---------- Firaun's army: chariot silhouettes, faceless riders, banners
  const horseSh = new THREE.Shape([[-.8, 0], [-.62, 0], [-.58, .9], [.45, .9], [.5, 0], [.68, 0], [.7, 1.0], [.92, 1.4], [1.25, 1.75], [1.45, 1.62], [1.52, 1.74], [1.3, 2.06], [1.05, 2.0], [.76, 1.62], [.55, 1.56], [-.7, 1.52], [-.96, 1.36], [-1.16, .98], [-1.04, .94], [-.88, 1.12], [-.86, .9]].map(([x, y]) => new THREE.Vector2(x, y)));
  const horseG = new THREE.ExtrudeGeometry(horseSh, { depth: .55, bevelEnabled: false }); horseG.translate(1.25, 0, -.275);
  const carG = new THREE.BoxGeometry(1.0, .7, 1.3); carG.translate(-.75, .95, 0);
  const wheelG = new THREE.TorusGeometry(.5, .07, 6, 16); const wheelL = wheelG.clone().translate(-.8, .5, .72), wheelR = wheelG.clone().translate(-.8, .5, -.72);
  const riderG = new THREE.CapsuleGeometry(.2, .55, 3, 8); riderG.translate(-.8, 1.75, 0);
  const poleG = new THREE.CylinderGeometry(.04, .04, 3.2, 5); poleG.translate(-1.15, 2.4, 0);
  const banG = new THREE.BoxGeometry(.9, .62, .03); banG.translate(-.7, 3.6, 0);
  const NC = 30;
  const PARTS = [[horseG, 0x1b1c20], [carG, 0x3a3b40], [wheelL, 0x111214], [wheelR, 0x111214], [riderG, 0x2a2b30], [poleG, 0x1a1a1e], [banG, 0x2e2f36]].map(([g, c]) => {
    const m = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: c }), NC); m.frustumCulled = false; scene.add(m); return m;
  });
  const CH = [];
  for (let j = 0; j < NC; j++) {
    const row = Math.floor(j / 6), col = j % 6;
    CH.push({ row, col, town: TOWNS[j % 4], tj: new THREE.Vector3((rnd() - .5) * 14, 0, (rnd() - .5) * 10), ban: j % 3 === 1, lane: (j % 3) - 1, k: j, ph: rnd() * 6 });
  }
  // Firaun's own tall banner rides in the middle of the column and is the last thing the water takes
  const kingBan = new THREE.Group(); scene.add(kingBan);
  const kp = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 6.4, 6), DARK); kp.position.y = 3.2; kingBan.add(kp);
  const kfG = new THREE.PlaneGeometry(2.2, 1.4, 10, 2); kfG.translate(1.1, 0, 0);
  const kfBase = kfG.attributes.position.array.slice();
  const kf = new THREE.Mesh(kfG, new THREE.MeshBasicMaterial({ color: 0x1d1e24, side: THREE.DoubleSide })); kf.position.y = 5.6; kingBan.add(kf);
  const KING = 14;

  const zArmy = (t) => {
    if (t < K.s2 - 0.05) return 66;                                  // the hook is a glimpse of the moment at the shore
    return 130 - 84 * ramp(t, A("s3:Saat") - 0.4, A("s3:menyusul") + 0.5) - 6 * ramp(t, K.s4, K.s5);
  };
  const formPos = (c, t, out) => out.set((c.col - 2.5) * 5.4 + (c.row % 2) * 1.4, 0.25, zArmy(t) + c.row * 5.2);
  const queuePos = (c, t, out) => {
    const lead = 6 - 64 * ramp(t, tChase, tClose0 + 0.6);
    const qi = Math.floor(c.k / 3);
    return out.set(c.lane * 1.9, 0.25, lead + qi * 3.4 + (c.k % 3) * 0.6);
  };
  const cpos = (c, t, out) => {
    if (t < K.s2 - 0.05) return formPos(c, t, out);
    const ta = A("s3:kota-kota") + (c.k % 4) * 0.2;
    if (t < A("s3:mengumpulkan") + 1.2) return out.copy(c.town).add(c.tj);
    formPos(c, t, out);
    const g = ramp(t, A("s3:mengumpulkan") + 0.3 + c.k * 0.02, A("s3:Katanya") + 0.4);
    if (g < 1) out.lerp(tmpV.copy(c.town).add(c.tj), 1 - g);
    const q = ramp(t, tChase + c.k * 0.035, tChase + 1.4 + c.k * 0.035);
    if (q > 0) { const qx = queuePos(c, t, new THREE.Vector3()); out.lerp(qx, q); if (q >= 1) out.copy(qx); }
    void ta;
    return out;
  };
  const cm = new THREE.Matrix4(), cq = new THREE.Quaternion(), cs = new THREE.Vector3(), cp = new THREE.Vector3(), cp2 = new THREE.Vector3(), yAx = new THREE.Vector3(0, 1, 0);

  // ---------- the staff: straight wood, a small crook at the top
  const WOOD = new THREE.MeshBasicMaterial({ color: 0x3b2a1e });
  const staff = new THREE.Group(); scene.add(staff);
  const sPivot = new THREE.Group(); staff.add(sPivot);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.055, .075, 2.7, 10), WOOD); shaft.position.y = 1.35; sPivot.add(shaft);
  const crook = new THREE.Mesh(new THREE.TorusGeometry(.17, .05, 8, 16, Math.PI * 1.1), WOOD); crook.position.set(.17, 2.7, 0); crook.rotation.z = -0.05; sPivot.add(crook);
  for (const y of [.8, 1.6, 2.2]) { const kn = new THREE.Mesh(new THREE.TorusGeometry(.075, .022, 5, 10), WOOD); kn.rotation.x = Math.PI / 2; kn.position.y = y; sPivot.add(kn); }
  // ink rings on the sand around the staff when it answers "sekali-kali tidak" and "Tuhanku bersamaku"
  const ringTex = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(20,22,30,.85)"; for (let k = 0; k < 3; k++) { g.lineWidth = 10 - k * 3; g.beginPath(); g.arc(128, 128, 112 - k * 6, 0.2 + k, 0.2 + k + 5.4); g.stroke(); } });
  const RINGS = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; });
  const ringTimes = [A("s1:sekali-kali"), A("s4:Tuhanku"), A("s4:petunjuk")];
  // footprints from the waterline up to the staff on the far shore (s8)
  const fpTex = canvasTex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "rgba(30,28,30,.55)"; g.beginPath(); g.ellipse(32, 36, 11, 20, 0, 0, 7); g.fill(); });
  const FPS = [];
  for (let k = 0; k < 7; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .4), new THREE.MeshBasicMaterial({ map: fpTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set((k % 2 ? .16 : -.16), 0.27, -L - 0.3 - k * 0.5); scene.add(m); FPS.push(m); }
  // a chariot wheel left on the far shore (s7), no bodies
  const lostW = new THREE.Mesh(new THREE.TorusGeometry(.5, .08, 6, 18), new THREE.MeshBasicMaterial({ color: 0x18191c }));
  lostW.rotation.set(-0.75, 0.5, 0); lostW.position.set(5.5, 0.55, -L - 1.6); lostW.scale.setScalar(0.8); scene.add(lostW);
  const spokes = new THREE.Mesh(new THREE.BoxGeometry(.9, .05, .05), lostW.material); lostW.add(spokes);
  for (const a of [Math.PI / 3, -Math.PI / 3]) { const sk = spokes.clone(); sk.rotation.z = a; lostW.add(sk); }

  // staff position over time: shore, leads the night march, crosses first, stands on the far shore
  const SHORE = new THREE.Vector3(0, 0.25, 1.0), FAR = new THREE.Vector3(0, 0.25, -L - 4);
  const marchF = (t) => ramp(t, K.s2 + 0.3, K.s3 - 0.6);
  const staffPos = (t, out) => {
    if (t < K.s2 - 0.05) return out.copy(SHORE);
    if (t < K.s3 - 0.4) { pathAt(Math.min(1, marchF(t) * 1.06 + 0.02), out); out.y = 0.25; if (marchF(t) > .9) out.lerp(SHORE, ramp(t, K.s3 - 1.6, K.s3 - 0.4)); return out; }
    const c = ramp(t, tCross0 - 0.2, tCross1 - 0.6);
    out.copy(SHORE).lerp(FAR, c); out.y = 0.25 + Math.sin(c * Math.PI) * 0.25;
    return out;
  };

  // ---------- particles: dust behind the army, ink spray at the strike and the crash
  const dust = pts(scene, 260, { color: 0x6d655a, size: 9, add: false, opacity: 0.32 });
  const dseed = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const spray = pts(scene, 700, { color: 0x1c2a58, size: 0.55, add: false, opacity: 0.85 });
  const sseed = Array.from({ length: 700 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const ferry = pts(scene, 200, { color: 0x2a2a30, size: 0.18, add: false, opacity: 0.6 }); // drifting ink motes
  const fseed = Array.from({ length: 200 }, () => [rnd(), rnd(), rnd()]);

  // ---------- camera: [t, px, py, pz, tx, ty, tz]
  const CUT1 = K.s2 - 0.05;
  const camA = track([
    [0, 0, 11, -28, 0, 1.2, 24],
    [A("s1:Pengikut"), 0.3, 7.5, -18, 0, 1.0, 20],
    [A("s1:menjawab"), 0.5, 3.0, -5.2, 0.4, 1.6, 10],
    [CUT1, 0.6, 2.4, -3.3, 0.4, 1.5, 4],
  ]);
  const camB = track([
    [CUT1, 98, 42, 92, 52, 0, 112],
    [A("s2:Allah"), 90, 38, 84, 48, 0, 100],
    [A("s2:pergilah"), 66, 26, 108, 40, 0, 72],
    [A("s2:dikejar"), 26, 20, 52, 10, 0, 18],
    [K.s2e, 12, 18, 30, 0, 0, -6],
    [A("s3:kota-kota"), -16, 34, 52, 4, 4, 165],
    [A("s3:mengumpulkan") + 0.8, -10, 38, 66, 4, 4, 170],
    [A("s3:Katanya"), 4, 26, 182, 0, 0, 50],
    [A("s3:kecil"), 3, 22, 164, 0, 0, 20],
    [A("s3:Saat") + 0.2, -48, 8, 62, 12, 4, 92],
    [A("s3:menyusul"), -50, 9, 48, 10, 3, 66],
    [K.s4, 0, 96, 72, 0, 0, 24],
    [A("s4:Pengikut"), 0, 100, 70, 0, 0, 22],
    [A("s4:Musa#2"), 2, 52, 44, 0, 0, 12],
    [A("s4:Tuhanku"), 5, 18, 16, 0, 0.5, 1],
    [K.s4e, 6, 8, 11, 0, 1.4, 0],
    [A("s5:pukullah"), 9.5, 2.3, 2.5, -4, 1.2, -2.5],
    [tStrike, 8.5, 2.0, 2.2, -4, 0.9, -3.5],
    [A("s5:terbelah") + 0.6, 1.2, 4.2, 10, 0, 5, -30],
    [A("s5:gunung"), 1.9, 3.0, 4.2, 0, 7.5, -40],
    [A("s5:besar") + 0.4, 1.9, 3.4, 2.6, 0, 7, -42],
    [A("s5:Thaha"), 12, 34, 22, 0, 0, -22],
    [K.s5e, 16, 38, 20, 0, 0, -26],
    [A("s6:selamat"), 4, 42, 12, 0, 0, -30],
    [A("s6:menyusul"), 6, 46, 18, 0, 0, -24],
    [tClose0 + 0.4, 14, 50, 22, 0, 2, -26],
    [A("s6:Saat"), 26, 26, 4, 0, 2, -24],
    [A("s6:tuhan"), 14, 12, -8, 0, 2.5, -24],
    [K.s6e, 10, 9, -12, 0, 2, -24],
    [A("s7:terlambat"), 12, 16, -8, 0, 0, -L - 4],
    [A("s7:Kami"), 14, 4.5, -50, 5, 0.4, -L - 2],
    [A("s7:pelajaran"), 12, 3.6, -54, 5, 0.4, -L - 2],
    [A("s7:Menariknya"), 8, 6, -52, 1, 1, -L - 6],
    [K.s7e, 3, 4, -56, 0, 1.2, -L - 6],
    [K.s8 + 0.6, 0.9, 2.4, -L - 11, 0, 1.4, -L + 10],
    [A("s8:Kalau"), 0.7, 2.8, -L - 12.5, 0, 1.4, -L + 12],
    [K.end, -2, 9, -L - 25, 0, 1.0, -L + 6],
    [K.dur, -2.4, 10, -L - 27, 0, 1.0, -L + 6],
  ]);
  const look = new THREE.Vector3(), sv = new THREE.Vector3();

  return (t) => {
    const c = t < CUT1 ? camA(t) : camB(t);
    cam.position.set(c[0] + Math.sin(t * .31) * .25, c[1] + Math.sin(t * .23) * .15, c[2] + Math.cos(t * .27) * .25);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // paper by day, grey wash at night
    const nf = nightF(t);
    bgC.copy(cPaper).lerp(cNight, nf * 0.85);
    scene.background.copy(bgC); scene.fog.color.copy(bgC); U.uFog.value.copy(bgC);
    U.uPaper.value.setRGB(.9, .86, .76).lerp(new THREE.Color(.42, .43, .45), nf * .8);
    groundM.color.setScalar(1 - .38 * nf);
    // a little denser mist over the far shore toward the end
    const den = 0.0062;
    scene.fog.density = den; U.uDen.value = den;

    // sun rises in the east, moon by night
    const su = sunUp(t);
    sun.position.set(c[0] + 380, -40 + 95 * su, c[2] + 30); sun.lookAt(cam.position);
    sunM.opacity = (1 - nf) * .95;
    moon.position.set(c[0] - 120, 120, c[2] + 300 * Math.sign(c[5] - c[2] || 1)); moon.lookAt(cam.position);
    moonM.opacity = nf;

    // sea state
    U.uT.value = t;
    U.uStorm.value = 1.0 + 0.6 * ramp(t, K.s3, K.s4) - 0.7 * ramp(t, A("s4:tenang"), A("s4:Tuhanku")) + 0.4 * ramp(t, A("s5:pukullah"), tStrike) - 0.2 * ramp(t, K.s7, K.s8);
    U.uFront.value = -10 + (L + 20) * ramp(t, tSplit0, tSplit1 + 0.6);
    const close = clamp01((t - tClose0) / (tClose1 - tClose0));
    U.uOpen.value = (t > tSplit0 ? 1 : 0) * (1 - eout(close));
    U.uClose.value = t > tClose0 && t < tClose1 ? close : 0;
    U.uRing.value = ramp(t, tStrike - 0.05, tStrike + 0.05) * (1 - ramp(t, tStrike + 1.5, tStrike + 2.5));
    U.uRingT.value = Math.max(0, t - tStrike);
    bed.visible = t > tSplit0 - 0.1 && t < tClose1 + 0.2;

    // the staff: lifts, leans over the water, strikes, stands again; later crosses first
    staffPos(t, sv); staff.position.copy(sv);
    const lift = ramp(t, A("s5:pukullah"), A("s5:tongkatmu"));
    const fallR = ramp(t, A("s5:tongkatmu"), tStrike);
    const upAgain = ramp(t, tStrike + 0.5, tStrike + 1.6);
    sPivot.position.set(0, 0.9 * lift * (1 - fallR) + 0.0, -0.4 * fallR * (1 - upAgain));
    sPivot.rotation.x = (-0.35 * lift - 0.85 * fallR) * (1 - upAgain);
    sPivot.rotation.y = 0.3;
    const marching = t > K.s2 && t < K.s3;
    sPivot.position.y += marching ? Math.abs(Math.sin(t * 4.2)) * 0.12 : 0;

    // ink rings
    RINGS.forEach((m, i) => { const a = clamp01((t - ringTimes[i]) / 1.8); m.visible = a > 0 && a < 1; m.position.set(sv.x, 0.28, sv.z); m.scale.setScalar(0.6 + 5 * eout(a)); m.material.opacity = 1 - a; });

    // Bani Israil
    const mf = marchF(t), front = mf * 1.45;
    const crossLen = 2.5;
    for (let i = 0; i < ND; i++) {
      const d = DOT[i];
      let show = 1;
      if (t >= K.s2 - 0.05 && t < K.s3 - 0.3) {
        const u = front - d.o * 0.45;
        if (u <= 0) { show = 0; dpv.copy(PATH[0]); }
        else if (u < 0.94) { pathAt(u / 0.94, dpv); const nxt = pathAt(Math.min(1, u / 0.94 + .01), tmpV); const dx = nxt.x - dpv.x, dz = nxt.z - dpv.z, l = Math.hypot(dx, dz) || 1; dpv.x += -dz / l * d.lat; dpv.z += dx / l * d.lat; }
        else { pathAt(1, dpv); dpv.x += d.lat; dpv.lerp(tmpV.set(d.nx, 0.25, d.nz), clamp01((u - 0.94) / 0.4)); }
      } else {
        const cr = clamp01((t - (tCross0 + d.q * (tCross1 - tCross0 - crossLen))) / crossLen);
        const e = cr * cr * (3 - 2 * cr);
        const z = d.nz + (d.fz - d.nz) * e;
        const inC = clamp01((2 - z) / 4) * clamp01((z + L + 2) / 4);
        const xo = d.nx + (d.fx - d.nx) * e;
        dpv.set(xo + (d.cx - xo) * inC, 0.25 - 0.6 * inC, z);
        if (t < K.s2) dpv.set(d.nx, 0.25, d.nz);
      }
      const bob = Math.abs(Math.sin(t * 5 + d.ph)) * 0.04;
      dsv.setScalar(show ? d.s : 0.0001);
      dm.compose(tmpV.set(dpv.x, dpv.y + bob, dpv.z), dq.identity(), dsv);
      dots.setMatrixAt(i, dm);
    }
    dots.instanceMatrix.needsUpdate = true;

    // army
    const armyOn = t < K.s2 - 0.05 || t > A("s3:kota-kota") - 0.2;
    let kingP = null;
    for (const ch of CH) {
      cpos(ch, t, cp); cpos(ch, t + 0.08, cp2);
      const dx = cp2.x - cp.x, dz = cp2.z - cp.z;
      const yaw = Math.hypot(dx, dz) > 0.01 ? Math.atan2(-dz, dx) : Math.PI / 2;
      const pop = t < K.s2 ? 1 : back((t - A("s3:kota-kota") - (ch.k % 4) * 0.15) / 0.5);
      // inside the closing sea the chariots sink under the water before it meets over them
      let sink = 0;
      if (cp.z < 1 && t > tClose0 - 0.2) sink = ramp(t, tClose0 - 0.1 + Math.abs(cp.z) * 0.004, tClose0 + 0.9);
      cp.y = 0.25 - 4.5 * sink + Math.abs(Math.sin(t * 6 + ch.ph)) * 0.05 * (1 - sink);
      cs.setScalar(armyOn && sink < 0.999 ? Math.max(0.0001, pop) * 1.15 : 0.0001);
      cq.setFromAxisAngle(yAx, yaw);
      cm.compose(cp, cq, cs);
      PARTS.forEach((m, pi) => { if (pi >= 5 && !ch.ban) m.setMatrixAt(ch.k, tmpM.makeScale(0, 0, 0)); else m.setMatrixAt(ch.k, cm); });
      if (ch.k === KING) kingP = cp.clone();
    }
    PARTS.forEach((m) => { m.instanceMatrix.needsUpdate = true; });

    // Firaun's banner: with the column, then stranded as the water closes, sinking while he speaks, gone at "terlambat"
    const lastPos = new THREE.Vector3(0, 0.25, -24);
    if (t < tClose0) { kingBan.position.copy(kingP); kingBan.position.y = 0.25; }
    else { kingBan.position.copy(lastPos); kingBan.position.y = 0.25 - 2.2 * ramp(t, tClose0, tClose1) - 3.6 * ramp(t, tClose1, A("s7:terlambat")); }
    kingBan.visible = armyOn && t > K.s3 && t < A("s7:terlambat") + 0.3;
    kingBan.rotation.y = Math.PI / 2;
    kingBan.rotation.z = 0.18 * ramp(t, tClose0, tClose1) + Math.sin(t * 1.3) * 0.04 * ramp(t, tClose1, tClose1 + 1);
    const kp2 = kfG.attributes.position.array;
    for (let i = 0; i < kp2.length; i += 3) kp2[i + 2] = kfBase[i + 2] + Math.sin(t * 3.4 + kp2[i] * 2.4) * 0.14 * kp2[i];
    kfG.attributes.position.needsUpdate = true;

    // town banners rise on "kota-kota"
    for (const b of TBANNERS) b.G.scale.set(1, Math.max(0.0001, back((t - A("s3:kota-kota") - b.k) / 0.5)), 1);

    // footprints and the lost wheel
    FPS.forEach((m, k) => { m.material.opacity = ramp(t, tCross1 - 0.8 + k * 0.05, tCross1 - 0.3 + k * 0.05); });
    lostW.visible = t > K.s7 - 0.5;

    // dust follows the army while it marches
    const dAmt = (t < K.s2 ? 0.8 : 0) + ramp(t, A("s3:mengumpulkan"), A("s3:Saat")) * (1 - ramp(t, tChase + 1, tClose0));
    const za = zArmy(t);
    for (let i = 0; i < 260; i++) {
      const s = dseed[i];
      dust.pos[i * 3] = (s[0] - .5) * 46 + Math.sin(t * .3 + s[3] * 9) * 2;
      dust.pos[i * 3 + 1] = 1 + s[1] * 9 * dAmt + Math.sin(t * .4 + s[2] * 6) * .5 - (dAmt < 0.02 ? 200 : 0);
      dust.pos[i * 3 + 2] = za + 26 + s[2] * 26 - ((t * 2 + s[3] * 20) % 20) * 0.3;
    }
    dust.commit();

    // ink spray: a burst at the strike, a crown over the walls as the split runs, a wide crash when they close
    for (let i = 0; i < 700; i++) {
      const s = sseed[i];
      let x = 0, y = -50, z = 0;
      if (i < 120) {
        const a = t - tStrike;
        if (a > 0 && a < 1.4) { const ang = s[0] * 6.28, v = 2 + s[1] * 4; x = Math.cos(ang) * v * a * .6; z = -1.2 + Math.sin(ang) * v * a * .6; y = 0.2 + (3 + s[2] * 4) * a - 6 * a * a; }
      } else if (i < 380) {
        const a = t - (tSplit0 + s[0] * (tSplit1 - tSplit0 + 0.4));
        if (a > 0 && a < 1.6) { const side = s[3] < .5 ? -1 : 1; x = side * (5 + s[1] * 3 + a * 2); z = -s[0] * (L - 2); y = 12 + s[2] * 4 + 4 * a - 5 * a * a; }
      } else {
        const a = t - (tClose0 + 0.25 + s[0] * 0.5);
        if (a > 0 && a < 2.2) { const side = s[3] < .5 ? -1 : 1; x = side * (6 - 6 * clamp01(a / .8)) + (s[1] - .5) * 3; z = -2 - s[2] * (L - 4); y = 1 + (6 + s[1] * 6) * a - 5.5 * a * a; }
      }
      spray.pos[i * 3] = x; spray.pos[i * 3 + 1] = y; spray.pos[i * 3 + 2] = z;
    }
    spray.commit();
    for (let i = 0; i < 200; i++) {
      const s = fseed[i];
      ferry.pos[i * 3] = c[0] + (c[3] - c[0]) * (.2 + .4 * s[0]) + (s[1] - .5) * 18 + Math.sin(t * .2 + s[2] * 9);
      ferry.pos[i * 3 + 1] = c[1] * (.3 + .6 * s[2]) + Math.sin(t * .3 + s[0] * 7) * .6;
      ferry.pos[i * 3 + 2] = c[2] + (c[5] - c[2]) * (.2 + .4 * s[0]) + (s[2] - .5) * 18;
    }
    ferry.commit();

    comp.render();
  };
}
const tmpM = new THREE.Matrix4();
