// EP22 COMICFORGE: Belgian politics as a 3D pop comic page floating in a halftone sunburst. Seven panels are plates
// with thick ink rims on one big printed page (top to bottom, the order a reader follows):
// H  the day counter: an alarm-clock odometer that rolls to 589, a starburst, the Belgian tricolour, a newspaper
//    with the HARIAN AUDIRA masthead and a TIK-TOK! sign,
// M  the map: Belgium extruded and split along the language border; Flandria (yellow) and Wallonia (red) drift
//    apart, KRAK!; later a PUSAT tower at Brussels throws euro coins to both halves,
// P  the 150-seat hemicycle, 11 generic party colours, a 20% bar board, the N-VA wedge (27) rises,
// N  the negotiation table: the king's chair, mediators walk in through a door and leave again, Leterme's desk
//    with a padlock,
// B  the budget: a giant calculator, an empty APBN 2011 folder, monthly sheets stamped DIPERPANJANG,
// C  the record track: a day-tile road with the 194 (Belgium 2007) and 353 (Cambodia) flags,
// S  the swearing-in stage, 6 Dec 2011, Di Rupo behind the lectern, confetti and a crowd.
// Look: halftone cel shader (flat lit band, Ben-Day dots, solid shade) + an ink pass from depth and normals,
// Neutral tone mapping at 0.9, RoomEnvironment at 0.2 on the few metal parts. Everything is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, back } from "./lib3d.js";
import { GEO } from "./geo.js";

const YEL = "#FFD23F", RED = "#E63946", INK = "#111111", BLUE = "#1D4E89", PAPER = "#FFF6E0", SKY = "#4FB3E8";
const GOLD = "#E8B23A", WOOD = "#B5793F", GREEN = "#2A9D8F", PINK = "#FF77A9", PURP = "#7B5CD6", ORNG = "#F4A261";
const V3 = THREE.Vector3;

// Hermite track with harmonic-mean tangents: never overshoots a key.
function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}

// Ink: Laplacian of inverse depth (silhouettes) + normal creases, drawn before the output pass.
const INKPASS = {
  uniforms: { tDiffuse: { value: null }, tN: { value: null }, tD: { value: null }, px: { value: new THREE.Vector2(1 / 1080, 1 / 1920) }, near: { value: 1 }, far: { value: 1600 }, w: { value: 2.4 }, ink: { value: new THREE.Color(0x111111) }, amt: { value: 1 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `uniform sampler2D tDiffuse,tN,tD;uniform vec2 px;uniform float near,far,w,amt;uniform vec3 ink;varying vec2 vUv;
float iz(vec2 uv){float d=texture2D(tD,uv).x;float z=d*2.-1.;return (far+near-z*(far-near))/(2.*near*far);}
void main(){vec4 c=texture2D(tDiffuse,vUv);vec4 n0=texture2D(tN,vUv);float w0=iz(vUv);float e=0.;
vec2 D[4];D[0]=vec2(1.,0.);D[1]=vec2(0.,1.);D[2]=vec2(.707,.707);D[3]=vec2(.707,-.707);
for(int i=0;i<4;i++){vec2 o=D[i]*px*w;float wa=iz(vUv+o),wb=iz(vUv-o);float lap=abs(wa+wb-2.*w0)/max(w0,1e-5);e=max(e,smoothstep(.01,.026,lap));
vec4 na=texture2D(tN,vUv+o),nb=texture2D(tN,vUv-o);e=max(e,max(abs(na.a-n0.a),abs(nb.a-n0.a)));
if(n0.a>.5&&na.a>.5){float k=1.-dot(normalize(n0.xyz*2.-1.),normalize(na.xyz*2.-1.));e=max(e,smoothstep(.16,.34,k));}}
gl_FragColor=vec4(mix(c.rgb,ink,clamp(e,0.,1.)*amt),c.a);}`,
};

// Halftone cel material: lit band flat, mid band screen-space Ben-Day dots of the shade colour, dark band solid.
const HT_V = `varying vec3 vN;varying vec3 vCol;varying vec2 vUv;varying float vD;
void main(){mat4 m=modelMatrix;
#ifdef USE_INSTANCING
m=m*instanceMatrix;
#endif
vCol=vec3(1.);
#ifdef USE_INSTANCING_COLOR
vCol=instanceColor;
#endif
vN=normalize(mat3(m)*normal);vUv=uv;vec4 mv=viewMatrix*m*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}`;
const HT_F = `uniform vec3 uC,uS,uL,uFog;uniform float uCell,uFogD,uOp,uEm;
#ifdef USE_MAP
uniform sampler2D map;
#endif
varying vec3 vN;varying vec3 vCol;varying vec2 vUv;varying float vD;
void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float d=dot(n,normalize(uL));
vec3 base=uC*vCol;vec3 sh=uS*vCol;
#ifdef USE_MAP
vec4 tx=texture2D(map,vUv);base*=tx.rgb;sh*=tx.rgb;
#endif
vec2 p=gl_FragCoord.xy/uCell;p=vec2(p.x+p.y,p.y-p.x)*.7071;vec2 f=fract(p)-.5;
float tone=clamp((.52-d)/.6,0.,1.)*(1.-uEm);float rad=.7*sqrt(tone);
float dt=1.-smoothstep(rad-.06,rad+.06,length(f));
vec3 col=mix(base,sh,tone>.93?1.:dt);
col=mix(col,uFog,1.-exp(-vD*uFogD));
gl_FragColor=vec4(col,uOp);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x5b3fa8, fog: 0, exp: 0.9, bloom: [0.02, 0.2, 0.98], shadow: false });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.9;
  scene.background = null; scene.fog = null;
  cam.near = 1; cam.far = 1600; cam.updateProjectionMatrix();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const rtN = new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType });
  rtN.depthTexture = new THREE.DepthTexture(1080, 1920); rtN.depthTexture.type = THREE.UnsignedIntType;
  const nMat = new THREE.MeshNormalMaterial();
  const inkP = new ShaderPass(INKPASS);
  inkP.uniforms.tN.value = rtN.texture; inkP.uniforms.tD.value = rtN.depthTexture;
  comp.insertPass(inkP, 1);
  const noInk = [];

  // lights only for the few standard (metal) materials; the halftone shader has its own key direction
  scene.add(new THREE.HemisphereLight(0xfff6e0, 0x5b3fa8, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-50, 100, 70); scene.add(key);
  const LDIR = new V3(-0.45, 1, 0.62).normalize();
  const FOGU = { value: new THREE.Color(0x6a50b8) }, FOGD = { value: 0.0011 };

  // sunburst sky in screen space: rays from a point, a second colour band, halftone dots growing outward
  const skyU = { uCtr: { value: new THREE.Vector2(540, 900) }, uA: { value: new THREE.Color(0x5b3fa8) }, uB: { value: new THREE.Color(0x7b5cd6) }, uD: { value: new THREE.Color(0x3d2a80) }, uRot: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false,
    vertexShader: "void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform vec2 uCtr;uniform vec3 uA,uB,uD;uniform float uRot;
void main(){vec2 q=gl_FragCoord.xy-uCtr;float a=atan(q.y,q.x)+uRot;float s=step(.5,fract(a*16./6.2832));vec3 c=mix(uA,uB,s);
float rr=length(q)/1500.;vec2 p=gl_FragCoord.xy/22.;p=vec2(p.x+p.y,p.y-p.x)*.7071;float dd=length(fract(p)-.5);float rad=.12+.3*rr;
c=mix(c,uD,(1.-smoothstep(rad-.05,rad+.05,dd))*.6);gl_FragColor=vec4(c,1.);
#include <colorspace_fragment>
}` }));
  sky.renderOrder = -10; scene.add(sky); noInk.push(sky);

  // ---------- materials ----------
  const htC = {};
  const shadeOf = (c) => new THREE.Color(c).multiplyScalar(0.56).lerp(new THREE.Color(0x2a1f66), 0.16);
  const ht = (c, o = {}) => {
    const k = c + (o.em || 0) + (o.op || 1);
    if (!o.map && !o.inst && htC[k]) return htC[k];
    const m = new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Color(c) }, uS: { value: o.inst ? new THREE.Color(0x8f8aa8) : shadeOf(c) }, uL: { value: LDIR }, uFog: FOGU, uFogD: FOGD, uCell: { value: 11 }, uOp: { value: o.op || 1 }, uEm: { value: o.em || 0 }, map: { value: o.map || null } },
      vertexShader: HT_V, fragmentShader: HT_F, transparent: !!o.op && o.op < 1, side: o.side || THREE.FrontSide, defines: o.map ? { USE_MAP: "" } : {},
    });
    if (!o.map && !o.inst) htC[k] = m;
    return m;
  };
  const inkM = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const metal = (c, rough = 0.32) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.85, envMapIntensity: 0.2 });
  const goldM = metal(GOLD, 0.3);
  const boxG = new THREE.BoxGeometry(1, 1, 1);
  const add = (m, p = scene) => { p.add(m); return m; };
  const M = (geo, mat, p) => add(new THREE.Mesh(geo, typeof mat === "string" ? ht(mat) : mat), p);
  // box by centre + size
  const B = (x, y, z, w, h, d, mat, p) => { const m = M(boxG, mat, p); m.scale.set(w, h, d); m.position.set(x, y, z); return m; };
  const C = (x, y, z, rt, rb, h, mat, p, seg = 24) => { const m = M(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p); m.position.set(x, y, z); return m; };
  const S = (x, y, z, rad, mat, p, seg = 20) => { const m = M(new THREE.SphereGeometry(rad, seg, Math.ceil(seg * 0.7)), mat, p); m.position.set(x, y, z); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };

  // canvas labels, repainted once web fonts are ready
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const F = (px) => `${px}px Bangers, 'Luckiest Guy', Impact, sans-serif`;
  const FC = (px) => `700 ${px}px 'Comic Neue', 'Comic Sans MS', sans-serif`;
  try { document.fonts.load(F(40)); document.fonts.load(FC(40)); } catch (e) { /* no font api */ }
  const plane = (w, h, tx, x, y, z, p = scene, transparent = false) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, transparent }));
    m.position.set(x, y, z); p.add(m); return m;
  };
  // a printed board: canvas face on a thin black slab (gives a crisp rim and an ink silhouette)
  const board = (w, h, paint, x, y, z, p = scene, res = 128) => {
    const g = G(x, y, z, p);
    B(0, 0, -0.18, w + 0.5, h + 0.5, 0.3, inkM, g);
    plane(w, h, label(Math.round(w * res), Math.round(h * res), paint), 0, 0, 0.0, g);
    return g;
  };
  const txt = (g, s, x, y, px, col, font = F, align = "center") => { g.font = font(px); g.fillStyle = col; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
  const frame = (g, w, h, bg, lw = 14) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = lw; g.strokeRect(lw / 2, lw / 2, w - lw, h - lw); };
  const benday = (base, dot, cell = 18, rad = 4.5, n = 256) => canvasTex(n, n, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = dot;
    for (let y = 0; y < h; y += cell) for (let x = 0; x < w; x += cell) { const o = (y / cell) % 2 ? cell / 2 : 0; g.beginPath(); g.arc(x + o, y + cell / 2, rad, 0, 7); g.fill(); }
  }, [1, 1]);
  const rep = (tx, a, b) => { const t2 = tx.clone(); t2.needsUpdate = true; t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(a, b); return t2; };
  const starShape = (n, ro, ri, jit = 0, seed = 1) => {
    const q = mulberry(seed), s = new THREE.Shape();
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2, rr = (i % 2 ? ri : ro) * (1 + (q() - 0.5) * jit); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
    return s;
  };
  // flat burst sign with a word (stands on its own; scaled in on cue)
  const burst = (word, fill, col, ro, x, y, z, p = scene, seed = 3) => {
    const g = G(x, y, z, p);
    M(new THREE.ExtrudeGeometry(starShape(11, ro * 1.08, ro * 0.74, 0.25, seed), { depth: 0.3, bevelEnabled: false }), inkM, g).position.z = -0.35;
    M(new THREE.ExtrudeGeometry(starShape(11, ro, ro * 0.68, 0.25, seed), { depth: 0.3, bevelEnabled: false }), ht(fill, { em: 1 }), g);
    const tx = label(512, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.font = F(170); c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round"; c.lineWidth = 26; c.strokeStyle = INK; c.strokeText(word, w / 2, h / 2 + 8); c.fillStyle = col; c.fillText(word, w / 2, h / 2 + 8); });
    plane(ro * 1.5, ro * 0.75, tx, 0, 0, 0.36, g, true);
    return g;
  };
  // simple comic person: tapered suit torso (shoulders wider than hips), skin head with dot eyes, bent elbows/knees
  const person = (suit, opts = {}) => {
    const g = new THREE.Group(), skin = opts.skin || "#E9B48A", sm = ht(suit), dark = ht("#2B2B3A");
    const limb = (x, y, len, w, mat, bend) => {
      const a = new THREE.Group(); a.position.set(x, y, 0); g.add(a);
      M(new THREE.CylinderGeometry(w, w * 0.9, len, 10), mat, a).position.y = -len / 2;
      const b = new THREE.Group(); b.position.y = -len; a.add(b); b.rotation.x = bend;
      M(new THREE.CylinderGeometry(w * 0.9, w * 0.8, len, 10), mat, b).position.y = -len / 2;
      return { a, b };
    };
    const legL = limb(-0.42, 2.5, 1.25, 0.3, dark, 0.15), legR = limb(0.42, 2.5, 1.25, 0.3, dark, 0.15);
    for (const L of [legL, legR]) B(0, -1.3, 0.22, 0.62, 0.32, 0.95, ht(INK), L.b);
    M(new THREE.CylinderGeometry(1.0, 0.68, 2.5, 12), sm, g).position.y = 3.75;
    S(0, 5.0, 0, 0.62, sm, g).scale.set(1.6, 0.42, 1.0);
    B(0, 4.55, 0.62, 0.62, 0.9, 0.05, ht("#ffffff", { em: 1 }), g).rotation.z = 0;
    if (opts.bow) { for (const s of [-1, 1]) { const bt = M(new THREE.ConeGeometry(0.22, 0.42, 4), ht(RED), g); bt.position.set(s * 0.22, 4.92, 0.68); bt.rotation.z = s * Math.PI / 2; } }
    else B(0, 4.35, 0.66, 0.2, 0.95, 0.06, ht(opts.tie || RED), g);
    M(new THREE.CylinderGeometry(0.26, 0.3, 0.5, 10), ht(skin), g).position.y = 5.3;
    const head = S(0, 6.0, 0, 0.66, ht(skin), g);
    const hair = M(new THREE.SphereGeometry(0.7, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), ht(opts.hair || "#3B2A20"), g); hair.position.set(0, 6.08, -0.04);
    for (const s of [-1, 1]) S(s * 0.24, 6.06, 0.6, 0.085, inkM, g, 8);
    const armL = limb(-1.12, 4.85, 1.15, 0.24, sm, -0.5), armR = limb(1.12, 4.85, 1.15, 0.24, sm, -0.5);
    for (const L of [armL, armR]) S(0, -1.2, 0, 0.24, ht(skin), L.b, 10);
    armL.a.rotation.z = -0.12; armR.a.rotation.z = 0.12;
    return { g, legL, legR, armL, armR, head };
  };
  const walk = (P, ph, amt = 1) => {
    const s = Math.sin(ph) * 0.55 * amt;
    P.legL.a.rotation.x = s; P.legR.a.rotation.x = -s; P.legL.b.rotation.x = 0.15 + Math.max(0, -Math.sin(ph)) * 0.6 * amt; P.legR.b.rotation.x = 0.15 + Math.max(0, Math.sin(ph)) * 0.6 * amt;
    P.armL.a.rotation.x = -s * 0.8; P.armR.a.rotation.x = s * 0.8;
  };
  const nameCard = (s, x, y, z, p = scene, w = 9, bg = "#ffffff", col = INK) => board(w, 2.1, (c, W, H) => { frame(c, W, H, bg, 16); txt(c, s, W / 2, H / 2 + 6, Math.min(170, (W * 1.65) / Math.max(4, s.length)), col); }, x, y, z, p, 110);
  const blob = (x, z, rx, rz, p = scene, op = 0.35) => {
    const tx = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(17,17,17,1)"); gr.addColorStop(0.55, "rgba(17,17,17,.6)"); gr.addColorStop(1, "rgba(17,17,17,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: op, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.66, z); p.add(m); noInk.push(m); return m;
  };

  // ---------- the comic page ----------
  // rows: z centres -96 (H, full width), -32, 32, 96; columns x -36, 36
  const PAN = [];
  const panel = (cx, cz, w, d, base, dot) => {
    const g = G(cx, 0, cz);
    const fl = B(0, 0.3, 0, w, 0.6, d, ht("#ffffff", { map: rep(benday(base, dot), w / 9, d / 9), em: 1 }), g);
    const T = 1.6, Hh = 2.2;
    B(0, Hh / 2, -d / 2 - T / 2, w + 2 * T, Hh, T, inkM, g); B(0, Hh / 2, d / 2 + T / 2, w + 2 * T, Hh, T, inkM, g);
    B(-w / 2 - T / 2, Hh / 2, 0, T, Hh, d, inkM, g); B(w / 2 + T / 2, Hh / 2, 0, T, Hh, d, inkM, g);
    PAN.push(g); return { g, fl };
  };
  B(0, -2.2, 0, 152, 4, 266, ht(PAPER, { em: 0.4 }));
  // page edge: a few printed sheets below the top one
  for (let i = 1; i <= 3; i++) B(i * 0.9, -2.2 - i * 1.2, i * 0.9, 152, 1, 266, ht(i % 2 ? "#EADFC4" : PAPER));
  const HZ = -96, MX = -36, MZ = -32, PX = 36, PZ = -32, NX = -36, NZ = 32, BX = 36, BZ = 32, CX = -36, CZ = 96, SX = 36, SZ = 96;
  panel(0, HZ, 136, 56, YEL, "#F6B700");
  const mapPanel = panel(MX, MZ, 64, 56, "#8FD3F0", "#6DBFE3");
  panel(PX, PZ, 64, 56, "#FBD4D6", "#F2A9AE");
  panel(NX, NZ, 64, 56, "#CDEBE6", "#A6D8CF");
  panel(BX, BZ, 64, 56, "#FFE3C2", "#F8C995");
  panel(CX, CZ, 64, 56, "#D9E4F7", "#B6C9EE");
  panel(SX, SZ, 64, 56, "#E7DAFB", "#CDB8F4");
  // page header strip with the issue title, printed on the paper above row 0
  board(120, 7, (c, w, h) => { frame(c, w, h, RED, 18); txt(c, "FAKTA SEJARAH NEGARA  ·  EP 22  ·  BELGIA 2010–2011", w / 2, h / 2 + 8, 190, "#fff"); }, 0, 0.75, -129, scene, 40).rotation.x = -Math.PI / 2;

  // ================= H: the day counter =================
  const hc = G(0, 0.6, HZ - 6);
  B(0, 1.2, 0, 34, 2.4, 22, ht(BLUE), hc);
  const cas = G(0, 2.4, 0, hc);
  const cR = ht(RED);
  B(0, 4.6, 0, 30, 7.2, 18, cR, cas); B(0, 17.4, 0, 30, 7.2, 18, cR, cas); B(0, 11, -8.5, 30, 10, 1, cR, cas);
  for (const [x0, x1] of [[-15, -12.2], [-5, -3.6], [3.6, 5], [12.2, 15]]) B((x0 + x1) / 2, 11, 0, x1 - x0, 5.6, 18, cR, cas);
  // drums: ten digit faces around the x axis
  const digT = [];
  for (let d = 0; d < 10; d++) digT.push(label(256, 168, (c, w, h) => { c.fillStyle = PAPER; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(17,17,17,.12)"; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 14, w, 14); txt(c, String(d), w / 2, h / 2 + 10, 168, INK); }));
  const R = 7, fa = R * Math.cos(Math.PI / 10), fh = 2 * R * Math.sin(Math.PI / 10);
  const drums = [-8.6, 0, 8.6].map((x) => {
    const dg = G(x, 11, 9 - 0.55 - fa, cas);
    const core = M(new THREE.CylinderGeometry(fa * 0.985, fa * 0.985, 6.8, 10), ht("#2B2B3A"), dg); core.rotation.z = Math.PI / 2;
    for (let k = 0; k < 10; k++) { const pf = new THREE.Mesh(new THREE.PlaneGeometry(6.8, fh * 1.002), new THREE.MeshBasicMaterial({ map: digT[k] })); const a = -k * Math.PI / 5; pf.rotation.x = a; pf.position.set(0, -Math.sin(a) * fa, Math.cos(a) * fa); dg.add(pf); }
    return dg;
  });
  board(27, 3.2, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); txt(c, "HARI TANPA PEMERINTAHAN", w / 2, h / 2 + 6, 170, YEL); }, 0, 4.4, 9.05, cas, 64);
  board(27, 3.2, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); txt(c, "BELGIA · 2010–2011", w / 2, h / 2 + 6, 170, "#fff"); }, 0, 17.6, 9.05, cas, 64);
  // alarm-clock bells and the hammer between them
  const bellG = new THREE.SphereGeometry(3.4, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const bells = [-9, 9].map((x) => { const b = M(bellG, goldM, cas); b.position.set(x, 22.6, 0); b.rotation.z = x < 0 ? 0.35 : -0.35; C(x * 0.86, 21.6, 0, 0.35, 0.35, 2.4, ht(INK), cas, 8); return b; });
  const hammer = G(0, 21, 0, cas); C(0, 2.2, 0, 0.3, 0.3, 4.4, ht(INK), hammer, 8); S(0, 4.6, 0, 0.9, goldM, hammer);
  // starburst behind the counter
  const star = G(0, 22, HZ - 22);
  M(new THREE.ExtrudeGeometry(starShape(16, 30, 20, 0.2, 7), { depth: 1, bevelEnabled: false }), ht(RED, { em: 1 }), star).position.z = -1.2;
  M(new THREE.ExtrudeGeometry(starShape(16, 25.5, 17, 0.2, 7), { depth: 1, bevelEnabled: false }), ht(YEL, { em: 1 }), star);
  // Belgian tricolour on a pole, cloth waves as a function of t
  const flagG = G(-31, 0.6, HZ - 6);
  C(0, 14, 0, 0.45, 0.55, 28, ht("#E8E8E8"), flagG, 10); S(0, 28.3, 0, 0.8, goldM, flagG);
  const flagGeo = new THREE.PlaneGeometry(12, 8, 24, 8); flagGeo.translate(6, 0, 0);
  const flagTx = canvasTex(300, 200, (c, w, h) => { c.fillStyle = "#1a1a1a"; c.fillRect(0, 0, w / 3, h); c.fillStyle = "#FDDA24"; c.fillRect(w / 3, 0, w / 3, h); c.fillStyle = "#EF3340"; c.fillRect(2 * w / 3, 0, w / 3, h); });
  const flag = M(flagGeo, ht("#ffffff", { map: flagTx, side: THREE.DoubleSide }), flagG); flag.position.set(0.4, 23, 0);
  const flagBase = Float32Array.from(flagGeo.attributes.position.array);
  // newspaper on a stack, HARIAN AUDIRA masthead
  const np = G(-22, 0.6, HZ + 13);
  for (let i = 0; i < 6; i++) B((i % 2) * 0.3, 0.45 + i * 0.9, (i % 3) * 0.2, 13, 0.85, 9.5, ht(i % 2 ? PAPER : "#EFE6CF"), np);
  const paperB = board(12, 15.5, (c, w, h) => {
    c.fillStyle = PAPER; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
    txt(c, "HARIAN AUDIRA", w / 2, 150, 200, INK); c.fillStyle = INK; c.fillRect(60, 250, w - 120, 10); c.fillRect(60, 275, w - 120, 4);
    txt(c, "EDISI KHUSUS · 2011", w / 2, 320, 54, "#555", FC);
    txt(c, "BELGIA MASIH", w / 2, 460, 170, RED); txt(c, "TANPA", w / 2, 610, 170, RED); txt(c, "PEMERINTAH", w / 2, 760, 170, RED);
    c.fillStyle = "#cfc6b0"; c.fillRect(70, 880, 620, 520);
    c.fillStyle = YEL; c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.arc(380, 1140, 190, 0, 7); c.fill(); c.stroke(); txt(c, "589", 380, 1150, 190, INK);
    c.fillStyle = "rgba(17,17,17,.5)"; for (let y = 1440; y < 1900; y += 34) { c.fillRect(70, y, 290, 12); c.fillRect(420, y, 290, 12); }
  }, 0, 9.6, 3.4, np, 64);
  paperB.rotation.x = -0.62;
  // TIK-TOK! sign on a post
  const tik = G(23, 0.6, HZ + 11);
  C(0, 4.5, 0, 0.35, 0.35, 9, ht(INK), tik, 8);
  const tikB = burst("TIK-TOK!", YEL, RED, 7.2, 0, 13, 0, tik, 9);
  // calendar pages flying out of the counter while it rolls
  const pageTx = canvasTex(128, 160, (c, w, h) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); c.fillStyle = RED; c.fillRect(0, 0, w, 40); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = INK; c.font = "bold 70px Impact, sans-serif"; c.textAlign = "center"; c.fillText("HARI", w / 2, 120); });
  const NPG = 26;
  const pages = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.6, 3.2), new THREE.MeshBasicMaterial({ map: pageTx, side: THREE.DoubleSide }), NPG);
  pages.frustumCulled = false; scene.add(pages);
  blob(0, HZ - 6, 22, 14, scene, 0.3); blob(-22, HZ + 13, 9, 7); blob(-31, HZ - 6, 3, 3);

  // ================= M: the split map =================
  const LON0 = 4.45, LAT0 = 50.55, KX = 0.636 * 16, KZ = 16;
  const PJ = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KZ];
  // floor print: sea, neighbours, names
  const mapTx = canvasTex(1024, 896, (c, w, h) => {
    c.fillStyle = "#8FD3F0"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#6DBFE3"; for (let y = 0; y < h; y += 18) for (let x = 0; x < w; x += 18) { c.beginPath(); c.arc(x + ((y / 18) % 2 ? 9 : 0), y, 3.6, 0, 7); c.fill(); }
    const toC = (lon, lat) => { const [x, z] = PJ(lon, lat); return [(x + 32) * 16, (z + 28) * 16]; };
    for (const ctry of GEO) {
      for (const ring of ctry.rings) { c.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = toC(lo, la); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = ctry.name === "Belgium" ? "#cfc4ad" : "#F3E3BC"; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); }
    }
    c.fillStyle = "rgba(180,140,80,.28)"; for (let y = 0; y < h; y += 22) for (let x = 0; x < w; x += 22) { c.beginPath(); c.arc(x + ((y / 22) % 2 ? 11 : 0), y, 2.4, 0, 7); c.fill(); }
    const nm = (s, lon, lat, px = 44) => { const [x, y] = toC(lon, lat); c.font = F(px); c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 9; c.strokeStyle = "#fff"; c.strokeText(s, x, y); c.fillStyle = "#555"; c.fillText(s, x, y); };
    nm("BELANDA", 5.0, 51.75); nm("JERMAN", 6.95, 50.55); nm("PRANCIS", 3.9, 49.3); nm("LUKSEMBURG", 6.15, 49.25, 34); nm("LAUT UTARA", 2.4, 51.75, 40);
  });
  mapPanel.fl.material = ht("#ffffff", { map: mapTx, em: 1 });
  mapPanel.fl.material.uniforms.map.value.repeat.set(1, 1);
  // Belgium split along an approximate language border (west to east)
  const BORDER = [[2.3, 50.70], [2.95, 50.70], [3.25, 50.72], [3.6, 50.76], [3.85, 50.73], [4.05, 50.70], [4.3, 50.73], [4.55, 50.71], [4.85, 50.76], [5.15, 50.73], [5.45, 50.74], [5.66, 50.76], [5.72, 50.80], [6.6, 50.80]];
  const bl = (lon) => { for (let i = 0; i < BORDER.length - 1; i++) { const [a, b] = BORDER[i], [c2, d] = BORDER[i + 1]; if (lon >= a && lon <= c2) return b + (d - b) * (lon - a) / (c2 - a); } return 50.8; };
  const be = GEO.find((g) => g.name === "Belgium").rings[0];
  const clipRing = (north) => {
    const ins = (p) => (p[1] > bl(p[0])) === north;
    const s0 = be.findIndex(ins), n = be.length, out = [];
    let ex = null;
    for (let k = 0; k < n; k++) {
      const p = be[(s0 + k) % n], q = be[(s0 + k + 1) % n];
      if (ins(p)) out.push(p);
      if (ins(p) !== ins(q)) {
        let lo = 0, hi = 1;
        for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2, x = [p[0] + (q[0] - p[0]) * m, p[1] + (q[1] - p[1]) * m]; if (ins(x) === ins(p)) lo = m; else hi = m; }
        const X = [p[0] + (q[0] - p[0]) * lo, bl(p[0] + (q[0] - p[0]) * lo)];
        if (ins(p)) { out.push(X); ex = X; }
        else { const a = ex[0], b = X[0]; const mid = BORDER.filter(([lo2]) => lo2 > Math.min(a, b) && lo2 < Math.max(a, b)); if (a > b) mid.reverse(); out.push(...mid, X); }
      }
    }
    return out;
  };
  const half = (north, col) => {
    const s = new THREE.Shape();
    clipRing(north).forEach(([lo, la], i) => { const [x, z] = PJ(lo, la); i ? s.lineTo(x, -z) : s.moveTo(x, -z); });
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2.4, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const g = G(MX, 0.6, MZ); M(geo, ht(col), g); return g;
  };
  const north = half(true, YEL), south = half(false, RED);
  const [bxx, bzz] = PJ(4.37, 50.84);
  C(bxx, 2.4 + 0.5, bzz, 0.9, 0.9, 1.0, ht(BLUE), north, 18);
  const signF = board(13, 4.6, (c, w, h) => { frame(c, w, h, YEL, 18); txt(c, "FLANDRIA", w / 2, h * 0.4, 200, INK); txt(c, "BAHASA BELANDA", w / 2, h * 0.8, 70, INK, FC); }, 0, 0, 0, north, 80);
  const signW = board(13, 4.6, (c, w, h) => { frame(c, w, h, RED, 18); txt(c, "WALLONIA", w / 2, h * 0.4, 200, "#fff"); txt(c, "BAHASA PRANCIS", w / 2, h * 0.8, 70, "#fff", FC); }, 0, 0, 0, south, 80);
  const [fx0, fz0] = PJ(3.3, 51.12), [wx0, wz0] = PJ(5.05, 50.18);
  for (const [sg, x, z] of [[signF, fx0, fz0], [signW, wx0, wz0]]) { const post = C(x, 5, z + 0.3, 0.3, 0.3, 6, ht(INK), sg.parent, 8); post.userData.sign = sg; sg.position.set(x, 9.4, z + 0.3); }
  const krak = burst("KRAK!", "#ffffff", RED, 6, MX + 2, 11, MZ + 4, scene, 5);
  // s7: the PUSAT tower at Brussels and euro coins thrown to both regions
  const tower = G(0, 0, 0, north);
  B(bxx, 4.6, bzz, 3.4, 4.4, 3.4, ht("#F2F2F2"), tower); M(new THREE.ConeGeometry(2.8, 2.4, 4), ht(BLUE), tower).position.set(bxx, 8, bzz);
  for (const s of [-1, 1]) B(bxx + s * 1.1, 4.4, bzz + 1.75, 0.5, 3.4, 0.2, ht("#cccccc"), tower);
  const pusat = nameCard("PUSAT", bxx, 13.2, bzz + 1, tower, 7, BLUE, "#fff");
  const coinTop = canvasTex(128, 128, (c, w, h) => { c.fillStyle = GOLD; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a5a00"; c.lineWidth = 8; c.beginPath(); c.arc(w / 2, h / 2, 54, 0, 7); c.stroke(); c.fillStyle = "#7a4a00"; c.font = "bold 84px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("€", w / 2, h / 2 + 4); });
  const coinG = new THREE.CylinderGeometry(1.15, 1.15, 0.42, 26);
  const coinMats = [goldM, new THREE.MeshStandardMaterial({ map: coinTop, roughness: 0.35, metalness: 0.6, envMapIntensity: 0.2 }), goldM];
  const NC = 28;
  const coins = [];
  for (let i = 0; i < NC; i++) { const m = new THREE.Mesh(coinG, coinMats); m.visible = false; scene.add(m); coins.push(m); }
  const [pfx, pfz] = PJ(4.05, 51.2), [pwx, pwz] = PJ(4.95, 50.32);

  // ================= P: the hemicycle =================
  const hcx = PX, hcz = PZ + 8;
  const RAD = [9.5, 11.7, 13.9, 16.1, 18.3, 20.5], CNT = [16, 19, 23, 27, 31, 34];
  RAD.forEach((rr, k) => {
    const s = new THREE.Shape(); s.absarc(0, 0, rr + 1.1, 0, Math.PI, false); s.absarc(0, 0, rr - 1.1, Math.PI, 0, true);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.6 + k * 0.9, bevelEnabled: false, curveSegments: 40 }); geo.rotateX(-Math.PI / 2);
    const m = M(geo, ht(k % 2 ? "#F3E3BC" : "#E6CFA0")); m.position.set(hcx, 0.6, hcz);
  });
  const seats = [];
  RAD.forEach((rr, k) => { for (let i = 0; i < CNT[k]; i++) { const th = Math.PI - (i + 0.5) / CNT[k] * Math.PI; seats.push({ th, x: hcx + Math.cos(th) * rr, y: 0.6 + 0.6 + k * 0.9, z: hcz - Math.sin(th) * rr }); } });
  seats.sort((a, b) => b.th - a.th);
  const PARTY = [[RED, 26], [ORNG, 13], [GREEN, 8], ["#8AC926", 5], [PINK, 13], [PURP, 9], [BLUE, 18], [SKY, 17], ["#9C6644", 12], ["#6C757D", 2], [YEL, 27]];
  let si = 0; PARTY.forEach(([c2, n], pi) => { for (let j = 0; j < n; j++) { seats[si].p = pi; seats[si].col = new THREE.Color(c2); seats[si].j = j; si++; } });
  const seatI = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 0.7, 1.2).translate(0, 0.35, 0), ht("#ffffff", { inst: true }), 150);
  const backI = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 1.3, 0.35).translate(0, 1.0, -0.45), ht("#ffffff", { inst: true }), 150);
  seatI.frustumCulled = backI.frustumCulled = false; scene.add(seatI, backI);
  B(hcx, 1.8, hcz + 2.5, 6, 2.4, 2.6, ht(WOOD)); B(hcx, 3.1, hcz + 2.5, 6.4, 0.3, 3, ht("#7A4E26"));
  // bar board behind: 11 bars and the 20% line (30 seats)
  const bb = G(hcx, 0.6, hcz - 25);
  B(0, 11, 0, 50, 22, 1, ht("#ffffff", { em: 0.5 }), bb); B(0, 11, -0.2, 51.4, 23.4, 0.8, inkM, bb);
  for (const s of [-1, 1]) B(s * 22, -0.1, 1.5, 1, 0.6, 4, inkM, bb);
  const bars = PARTY.map(([c2, n], i) => { const m = B(-21.5 + i * 4.3, 0, 0.7, 3.2, 1, 1.1, ht(c2), bb); m.userData.n = n; return m; });
  const BH = 0.55, B0 = 2;
  const line20 = B(0, B0 + 30 * BH, 0.8, 47, 0.45, 0.4, ht(RED, { em: 1 }), bb);
  const lab20 = board(7.4, 3, (c, w, h) => { frame(c, w, h, RED, 14); txt(c, "20%", w / 2, h / 2 + 6, 240, "#fff"); }, 19.5, B0 + 30 * BH + 2.4, 1.2, bb, 64);
  board(30, 2.6, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); txt(c, "KURSI PER PARTAI · TOTAL 150", w / 2, h / 2 + 6, 200, "#fff"); }, 0, 20.6, 0.75, bb, 48);
  const nvaSeat = seats.filter((s) => s.p === 10);
  const nvaC = nvaSeat.reduce((a, s) => [a[0] + s.x / 27, a[1] + s.z / 27], [0, 0]);
  const nvaCard = nameCard("N-VA · 27 KURSI", nvaC[0] + 3, 12, nvaC[1] + 4, scene, 13, YEL);
  blob(hcx, hcz - 6, 26, 16, scene, 0.2);

  // ================= N: negotiation table =================
  const tb = G(NX - 2, 0.6, NZ - 4);
  const top = C(0, 3.4, 0, 1, 1, 0.7, ht(WOOD), tb, 40); top.scale.set(13, 1, 4.6);
  for (const [x, z] of [[-9, -2], [9, -2], [-9, 2], [9, 2]]) C(x, 1.5, z, 0.45, 0.35, 3, ht("#7A4E26"), tb, 10);
  const pq = mulberry(22);
  for (let i = 0; i < 9; i++) { const pp = B(-9 + i * 2.3, 3.8, (pq() - 0.5) * 4, 1.8, 0.08, 2.4, ht("#ffffff", { em: 0.6 }), tb); pp.rotation.y = (pq() - 0.5) * 0.8; }
  const chair = (x, z, ry, col, hi = 0) => { const c2 = G(x, 0, z, tb); c2.rotation.y = ry; B(0, 1.9, 0, 2.4, 0.4, 2.4, ht(col), c2); B(0, 3.6 + hi / 2, -1.05, 2.4, 3.4 + hi, 0.35, ht(col), c2); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(a * 1, 0.85, b * 1, 0.3, 1.7, 0.3, ht(INK), c2); return c2; };
  for (let i = 0; i < 4; i++) { chair(-6 + i * 4, -6.4, 0, BLUE); chair(-6 + i * 4, 6.4, Math.PI, BLUE); }
  const throne = chair(-15.5, 0, Math.PI / 2, RED, 3.2);
  const crown = G(-16.55, 7.5, 0, tb);
  C(0, 0, 0, 1.3, 1.1, 1.2, goldM, crown, 18);
  for (let k = 0; k < 6; k++) { const sp = M(new THREE.ConeGeometry(0.32, 1.1, 6), goldM, crown); sp.position.set(Math.cos(k * 1.047) * 1.15, 1.1, Math.sin(k * 1.047) * 1.15); }
  const kingCard = nameCard("RAJA ALBERT II", -15.5, 13.2, 1.5, tb, 11, YEL);
  // the door the mediators use
  const door = G(NX + 22, 0.6, NZ - 9);
  B(-3.2, 5.5, 0, 0.9, 11, 1.4, inkM, door); B(3.2, 5.5, 0, 0.9, 11, 1.4, inkM, door); B(0, 11.4, 0, 7.3, 0.9, 1.4, inkM, door);
  const leaf = G(-2.75, 0, 0.3, door); B(2.75, 5.5, 0, 5.5, 10.9, 0.4, ht(SKY), leaf); S(4.8, 5.5, 0.4, 0.35, goldM, leaf);
  board(6.6, 2, (c, w, h) => { frame(c, w, h, RED, 12); txt(c, "PINTU KELUAR", w / 2, h / 2 + 6, 120, "#fff"); }, 0, 13.4, 0.2, door, 80);
  const MED = [["DE WEVER", "#3D5A80"], ["DI RUPO", "#5A3D80"], ["PIETERS & FLAHAUT", "#2F6B4F"], ["VANDE LANOTTE", "#80503D"], ["BEKE", "#3D7080"]];
  const meds = MED.map(([nm, col], i) => {
    const P = person(col, { hair: i % 2 ? "#6B6B6B" : "#3B2A20", tie: [YEL, RED, SKY, ORNG, PINK][i] });
    scene.add(P.g); P.g.scale.setScalar(1.25);
    P.card = nameCard(nm, 0, 8.3, 0, P.g, nm.length > 10 ? 11 : 7.5, "#ffffff");
    return P;
  });
  const king = person("#6E1E2A", { hair: "#cfcfcf", tie: GOLD }); king.g.position.set(NX - 2 - 17.6, 0.6, NZ - 4 - 3.4); king.g.scale.setScalar(1.25); king.g.rotation.y = 0.5; scene.add(king.g);
  C(0, 6.95, 0, 0.72, 0.62, 0.7, goldM, king.g, 16);
  // Leterme's caretaker desk with the padlock
  const ld = G(NX + 12, 0.6, NZ + 15);
  B(0, 2.2, 0, 10, 0.7, 5, ht(WOOD), ld); B(-4.2, 1, 0, 1.2, 2, 4.6, ht("#7A4E26"), ld); B(4.2, 1, 0, 1.2, 2, 4.6, ht("#7A4E26"), ld); B(0, 1.2, -2, 9, 1.8, 0.4, ht("#7A4E26"), ld);
  const let_ = person("#2E3A55", { hair: "#4a3a2a", tie: SKY }); let_.g.position.set(0, 0, -3.6); let_.g.scale.setScalar(1.25); ld.add(let_.g);
  let_.armL.a.rotation.x = -0.9; let_.armR.a.rotation.x = -0.9;
  const letCard = nameCard("YVES LETERME", 0, 10.6, -3.4, ld, 11, "#ffffff");
  board(8, 1.8, (c, w, h) => { frame(c, w, h, YEL, 12); txt(c, "PM SEMENTARA", w / 2, h / 2 + 6, 130, INK); }, 0, 3.6, 2.6, ld, 80).rotation.x = -0.3;
  const lock = G(3.4, 3.2, 2.8, ld);
  B(0, 0, 0, 2.6, 2.2, 1.1, goldM, lock); const shk = M(new THREE.TorusGeometry(0.9, 0.24, 10, 24, Math.PI), metal("#C9CED6", 0.25), lock); shk.position.y = 1.1;
  const lockTag = nameCard("TERBATAS", 0, -2.4, 0.7, lock, 6.4, RED, "#fff");
  blob(NX - 2, NZ - 4, 17, 8, scene, 0.25); blob(NX + 12, NZ + 14, 7, 4);

  // ================= B: budget =================
  const calc = G(BX - 5, 2.7, BZ - 2); calc.scale.setScalar(0.78);
  const calcBody = G(0, 0, 0, calc); calcBody.rotation.x = 0.25;
  B(0, 2, 0, 18, 4, 24, ht("#3A3F55"), calcBody);
  const lcdTx = canvasTex(768, 224, () => {});
  const lcd = plane(14.5, 4.2, lcdTx, 0, 4.2, -7.5, calcBody); lcd.rotation.x = -Math.PI / 2;
  B(0, 4.0, -7.5, 15.4, 0.3, 5.1, inkM, calcBody);
  let lcdTxt = null;
  const paintLcd = (s) => { const c = lcdTx.image.getContext("2d"), w = 768, h = 224; c.fillStyle = "#B9D4A0"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(0,0,0,.07)"; for (let x = 0; x < w; x += 6) c.fillRect(x, 0, 2, h); c.font = F(170); c.fillStyle = "#1E2A16"; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(s, w - 40, h / 2 + 10); lcdTx.needsUpdate = true; };
  const keyCols = [YEL, "#E8E8E8", "#E8E8E8", RED];
  const keysI = [];
  for (let rr = 0; rr < 4; rr++) for (let cc = 0; cc < 4; cc++) { const k2 = B(-5.4 + cc * 3.6, 4.45, -1.4 + rr * 3.6, 2.8, 0.9, 2.8, ht(cc === 3 ? keyCols[3] : rr === 0 ? keyCols[0] : keyCols[1]), calcBody); keysI.push(k2); }
  const keyLbl = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.font = "bold 150px Impact, sans-serif"; c.fillStyle = INK; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("+", w / 2, h / 2); });
  plane(2.2, 2.2, keyLbl, 5.4, 4.92, 9.4, calcBody, true).rotation.x = -Math.PI / 2;
  // empty APBN 2011 folder with a KOSONG stamp
  const fold = G(BX + 15, 0.6, BZ - 8);
  const fb = B(0, 6, 0, 10, 12, 0.8, ht(ORNG), fold); fb.rotation.x = -0.12;
  board(8.4, 3, (c, w, h) => { frame(c, w, h, "#fff", 14); txt(c, "APBN 2011", w / 2, h / 2 + 8, 200, INK); }, 0, 9, 0.9, fold, 80).rotation.x = -0.12;
  const kosong = board(8.6, 2.8, (c, w, h) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); c.strokeStyle = RED; c.lineWidth = 22; c.strokeRect(11, 11, w - 22, h - 22); txt(c, "KOSONG", w / 2, h / 2 + 8, 200, RED); }, 0, 4.4, 1.4, fold, 80);
  // month sheets stamped DIPERPANJANG
  const MONTHS = ["JAN", "FEB", "MAR", "APR"];
  const sheets = MONTHS.map((mn, i) => {
    const g = G(0, 0, 0); scene.add(g);
    B(0, 0, 0, 7, 0.12, 9, ht("#ffffff", { em: 0.6 }), g);
    const lab = plane(6.6, 8.6, label(330, 430, (c, w, h) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); c.fillStyle = BLUE; c.fillRect(0, 0, w, 70); txt(c, "ANGGARAN 2010", w / 2, 40, 50, "#fff"); txt(c, mn + " 2011", w / 2, 150, 92, INK); c.fillStyle = "#bbb"; for (let y = 220; y < 300; y += 22) c.fillRect(30, y, w - 60, 8); }), 0, 0.08, 0, g);
    lab.rotation.x = -Math.PI / 2;
    const st = plane(6.2, 2.0, label(400, 130, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = RED; c.lineWidth = 12; c.strokeRect(8, 8, w - 16, h - 16); txt(c, "DIPERPANJANG", w / 2, h / 2 + 6, 82, RED); }), 0, 0.1, 2.0, g, true);
    st.rotation.x = -Math.PI / 2; st.rotation.z = 0.12; g.userData.st = st;
    return g;
  });
  const stamp = G(0, 0, 0); scene.add(stamp);
  B(0, 0.7, 0, 5.6, 1.4, 2.6, ht(RED), stamp); B(0, 1.6, 0, 3.4, 0.6, 1.6, ht(INK), stamp); C(0, 3.6, 0, 0.5, 0.5, 3.4, ht(WOOD), stamp, 10); S(0, 5.6, 0, 1.2, ht(WOOD), stamp);
  const stackX = BX - 19, stackZ = BZ + 13;
  blob(BX - 5, BZ - 2, 12, 14, scene, 0.25); blob(stackX, stackZ, 6, 7); blob(BX + 15, BZ - 8, 7, 3);

  // ================= C: record track =================
  const T0x = CX - 28, TLEN = 56, dayX = (d) => T0x + (d / 600) * TLEN, TZ = CZ + 4;
  for (let i = 0; i < 24; i++) { const x = dayX(i * 25 + 12.5); B(x, 1.0, TZ, 2.2, 0.8, 4.6, ht(i % 2 ? "#ffffff" : YEL), scene); }
  for (let d = 0; d <= 600; d += 100) { const g = board(3.4, 1.6, (c, w, h) => { frame(c, w, h, "#fff", 10); txt(c, String(d), w / 2, h / 2 + 5, 110, INK); }, dayX(d), 1.45, TZ + 3.6, scene, 64); g.rotation.x = -1.0; }
  const flagPost = (d, col, l1, l2, l3, ht2 = 16) => {
    const g = G(dayX(d), 0.6, TZ - 3.4);
    C(0, ht2 / 2, 0, 0.32, 0.32, ht2, ht(INK), g, 8);
    board(11.5, 6.2, (c, w, h) => { frame(c, w, h, col, 16); txt(c, l1, w / 2, h * 0.24, 92, "#fff"); txt(c, l2, w / 2, h * 0.56, 200, "#fff"); txt(c, l3, w / 2, h * 0.84, 70, "#fff", FC); }, 5.9, ht2 - 3.4, 0, g, 80);
    return g;
  };
  const f194 = flagPost(194, BLUE, "REKOR BELGIA 2007", "194 HARI", "pecah: 25 Des 2010", 15);
  const f353 = flagPost(353, RED, "REKOR DUNIA · KAMBOJA", "353 HARI", "2003–2004 · disamai 1 Jun 2011", 19);
  const fin = G(dayX(589), 0.6, TZ - 3.4); C(0, 6, 0, 0.3, 0.3, 12, ht(INK), fin, 8);
  board(5, 3.4, (c, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) { c.fillStyle = (x + y) % 2 ? "#fff" : INK; c.fillRect(x * w / 6, y * h / 4, w / 6, h / 4); } c.fillStyle = YEL; c.fillRect(w * 0.18, h * 0.25, w * 0.64, h * 0.5); txt(c, "589", w / 2, h / 2 + 6, 120, INK); }, 2.6, 10, 0, fin, 64);
  // a little Christmas tree beside 194
  const tree = G(dayX(194) - 5, 0.6, TZ - 6.5);
  for (let k = 0; k < 3; k++) M(new THREE.ConeGeometry(2.6 - k * 0.6, 2.8, 10), ht("#2E8B57"), tree).position.y = 2.2 + k * 1.7;
  M(new THREE.ExtrudeGeometry(starShape(5, 0.9, 0.4), { depth: 0.3, bevelEnabled: false }), ht(YEL, { em: 1 }), tree).position.set(0, 7.4, 0);
  const trophy = G(dayX(353) - 4.2, 0.6, TZ - 6); C(0, 1, 0, 1.6, 1.8, 2, ht(INK), trophy); C(0, 3.2, 0, 0.35, 0.6, 2.4, goldM, trophy, 12); const cup = M(new THREE.CylinderGeometry(1.8, 0.7, 2.6, 24, 1, true), metal(GOLD, 0.25), trophy); cup.position.y = 5.6; cup.material.side = THREE.DoubleSide;
  // tear-off calendar block
  const cal = G(CX - 14, 0.6, CZ - 16);
  B(0, 7, 0, 11, 14, 2.4, ht(RED), cal);
  const calTx = canvasTex(400, 440, () => {});
  plane(9.6, 10.6, calTx, 0, 6.2, 1.25, cal);
  let calTxt = null;
  const paintCal = (a, b) => { const c = calTx.image.getContext("2d"), w = 400, h = 440; c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); c.fillStyle = INK; c.fillRect(0, 0, w, 80); txt(c, b, w / 2, 44, 70, "#fff"); txt(c, a[0], w / 2, 220, 240, INK); txt(c, a[1], w / 2, 370, 96, RED); calTx.needsUpdate = true; };
  const tearTx = canvasTex(400, 440, (c, w, h) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); c.fillStyle = INK; c.fillRect(0, 0, w, 80); });
  const tear = plane(9.6, 10.6, tearTx, 0, 0, 0, scene); tear.material.side = THREE.DoubleSide; tear.visible = false;
  const token = G(0, 0.6, TZ);
  M(new THREE.ConeGeometry(1.6, 4.2, 20), ht(INK), token).position.y = 2.7;
  B(0, 2.4, 0, 3.0, 0.7, 0.2, ht(YEL), token).position.z = 0.9;
  S(0, 5.5, 0, 1.3, ht(RED), token);
  const tokFlag = G(0, 6.4, 0, token); C(0, 1.6, 0, 0.12, 0.12, 3.2, ht(INK), tokFlag, 6); plane(2.6, 1.7, flagTx, 1.35, 2.6, 0, tokFlag).material.side = THREE.DoubleSide;
  const tokBlob = blob(0, TZ, 2.6, 2.6, scene, 0.45);
  const rekor = burst("REKOR!", YEL, RED, 4.6, 0, 0, 0, scene, 11);
  const sama = burst("SAMA!", "#ffffff", RED, 4.6, 0, 0, 0, scene, 13);

  // ================= S: swearing-in stage =================
  const st = G(SX, 0.6, SZ - 8);
  B(0, 1.4, 0, 36, 2.8, 16, ht("#7A2E8E"), st); B(0, 2.9, 0, 36.4, 0.3, 16.4, ht(INK), st);
  for (let k = 0; k < 3; k++) B(0, 0.45 + k * 0.9, 8.7 + (2 - k) * 1.1, 10, 0.9 + k * 0, 1.2, ht(RED), st);
  const bd = board(36, 15, (c, w, h) => {
    c.fillStyle = "#1D4E89"; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,.08)"; for (let y = 0; y < h; y += 30) for (let x = 0; x < w; x += 30) { c.beginPath(); c.arc(x + ((y / 30) % 2 ? 15 : 0), y, 6, 0, 7); c.fill(); }
    const s3 = w / 3; c.fillStyle = "#1a1a1a"; c.fillRect(0, h - 70, s3, 70); c.fillStyle = "#FDDA24"; c.fillRect(s3, h - 70, s3, 70); c.fillStyle = "#EF3340"; c.fillRect(2 * s3, h - 70, s3, 70);
    txt(c, "PELANTIKAN PEMERINTAHAN", w / 2, 150, 150, YEL); txt(c, "6 DESEMBER 2011", w / 2, 380, 250, "#fff");
    c.strokeStyle = INK; c.lineWidth = 24; c.strokeRect(12, 12, w - 24, h - 24);
  }, 0, 10.6, -7.6, st, 48);
  const lect = G(0, 2.9, 1.6, st);
  B(0, 2.4, 0, 4.6, 4.8, 2.6, ht(WOOD), lect); B(0, 4.95, -0.2, 5.2, 0.4, 3.2, ht("#7A4E26"), lect);
  plane(3.6, 2.0, flagTx, 0, 1.5, 1.32, lect);
  const dr = person("#26324F", { bow: true, hair: "#2a2a2a" }); dr.g.position.set(0, 2.9, -1.4); dr.g.scale.setScalar(1.3); st.add(dr.g);
  const drCard = nameCard("ELIO DI RUPO", 0, 7.4, 3.0, st, 9, YEL);
  const sign541 = board(9, 6, (c, w, h) => { frame(c, w, h, YEL, 18); txt(c, "541", w / 2, h * 0.42, 360, RED); txt(c, "HARI NEGOSIASI", w / 2, h * 0.84, 110, INK); }, -13, 8, 4, st, 80);
  const crowdI = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), ht("#ffffff", { inst: true }), 28);
  const crowdB = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.1, 1.5, 3, 12), ht("#ffffff", { inst: true }), 28);
  crowdI.frustumCulled = crowdB.frustumCulled = false; scene.add(crowdI, crowdB);
  const crowd = []; const cq = mulberry(611);
  for (let i = 0; i < 28; i++) crowd.push({ x: SX - 26 + (i % 14) * 4 + (cq() - 0.5), z: SZ + 12 + Math.floor(i / 14) * 4.6, c: new THREE.Color([BLUE, "#3D5A80", PURP, "#2F6B4F", "#80503D"][i % 5]), ph: cq() * 6 });
  const cones = [-10, 10].map((x) => { const m = new THREE.Mesh(new THREE.ConeGeometry(6, 28, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide })); m.position.set(SX + x, 15, SZ - 6); m.rotation.z = x < 0 ? 0.3 : -0.3; scene.add(m); noInk.push(m); return m; });
  const NCF = 90;
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.7, 1.1), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), NCF);
  conf.frustumCulled = false; scene.add(conf);
  const cfq = mulberry(2011); const cfd = [];
  const cfc = [YEL, RED, SKY, PINK, "#ffffff", GREEN];
  for (let i = 0; i < NCF; i++) { cfd.push([SX - 18 + cfq() * 36, SZ - 14 + cfq() * 24, cfq() * 3, 2 + cfq() * 3, cfq() * 6]); conf.setColorAt(i, new THREE.Color(cfc[i % cfc.length])); }
  blob(SX, SZ - 8, 20, 9, scene, 0.25);

  // ---------- cues ----------
  const tSel = A("s1:selama"), tHari = A("s1:hari"), tIni1 = A("s1:Ini");
  const c2 = A("s2:Ini"), tSplit = A("s2:terbelah"), tFl = A("s2:Flandria"), tWa = A("s2:Wallonia");
  const c3 = A("s3:Pemilu"), t11 = A("s3:sebelas"), tPar = A("s3:parlemen"), tLeb = A("s3:lebih"), tPt = A("s3:Partai"), t27 = A("s3:dua#2");
  const c4 = A("s4:Negosiasi"), tBun = A("s4:buntu"), tRaja = A("s4:Raja"), tMen = A("s4:menunjuk"), tSem = A("s4:Sementara"), tYv = A("s4:Yves"), tWew = A("s4:wewenang");
  const c5 = A("s5:Belgia"), tTid = A("s5:tidak"), t2011 = A("s5:2011"), tAng = A("s5:Anggaran"), tPrp = A("s5:diperpanjang");
  const c6 = A("s6:Hari"), tNat = A("s6:Natal"), tPec = A("s6:memecahkan"), tSatu = A("s6:Satu"), tSam = A("s6:menyamai");
  const c7 = A("s7:Akhirnya"), tDil = A("s7:dilantik"), t541 = A("s7:lima"), c7b = A("s7:Kesepakatannya"), tMin = A("s7:memindahkan"), tWil = A("s7:wilayah");
  const c8 = A("s8:Hampir"), tQ = A("s8:Menurut");

  // ---------- camera: [t, px,py,pz, tx,ty,tz] ----------
  const view = (t, tx, ty, tz, d, pitch, yaw = 0) => { const p = pitch * Math.PI / 180, y = yaw * Math.PI / 180; return [t, tx + d * Math.sin(y) * Math.cos(p), ty + d * Math.sin(p), tz + d * Math.cos(y) * Math.cos(p), tx, ty, tz]; };
  const keys = [
    view(0, 0, 21, HZ - 4, 112, 11, -10), view(tSel, 0, 21, HZ - 4, 116, 12, -6), view(tHari + 0.3, 0, 21, HZ - 4, 120, 14, 2), view(c2 - 0.02, 0, 21, HZ - 4, 124, 16, 8),
    view(c2, MX, 6, MZ - 7, 122, 50, -6), view(tSplit, MX, 6, MZ - 7, 116, 52, -2), view(tWa, MX + 1, 6, MZ - 6, 112, 53, 3), view(c3 - 0.02, MX + 1, 6, MZ - 6, 110, 54, 5),
    view(c3, PX, 16, PZ - 4, 120, 34, -10), view(t11 + 1.2, PX, 16, PZ - 6, 116, 32, -4), view(tLeb + 0.6, PX, 17, PZ - 8, 118, 27, 2), view(tPt, PX + 2, 16, PZ - 6, 112, 30, 6),
    view(t27 + 0.6, PX + 7, 14, PZ - 3, 96, 30, 14), view(c4 - 0.02, PX + 8, 14, PZ - 3, 94, 31, 16),
    view(c4, NX - 2, 12, NZ - 6, 104, 28, -12), view(tRaja, NX - 4, 12, NZ - 7, 98, 27, -6), view(tMen + 2.2, NX + 2, 12, NZ - 7, 100, 26, 4), view(tSem - 0.3, NX + 6, 12, NZ - 3, 98, 27, 8),
    view(tYv + 0.2, NX + 12, 11, NZ + 12, 70, 22, 6), view(tWew + 0.4, NX + 13, 10, NZ + 13, 62, 22, 10), view(c5 - 0.02, NX + 13, 10, NZ + 13, 61, 22, 11),
    view(c5, BX + 2, 9, BZ - 8, 98, 42, -8), view(tAng, BX + 3, 9, BZ - 8, 94, 42, 0), view(tPrp, BX - 5, 8, BZ - 2, 90, 42, -6), view(c6 - 0.02, BX - 6, 8, BZ - 1, 88, 43, -10),
    view(c6, CX - 12, 12, CZ - 4, 80, 27, -12), view(tPec, dayX(194), 12, CZ - 3, 76, 25, -6), view(tSatu, dayX(270), 12, CZ - 3, 78, 25, 0), view(tSam + 0.6, dayX(353) - 2, 12, CZ - 3, 74, 25, 8), view(c7 - 0.02, dayX(370), 12, CZ - 3, 78, 26, 12),
    view(c7, SX, 16, SZ - 8, 118, 22, -10), view(tDil, SX, 16, SZ - 8, 110, 20, -4), view(t541 + 1.0, SX - 3, 16, SZ - 7, 112, 22, 4), view(c7b - 0.02, SX - 3, 16, SZ - 7, 114, 23, 8),
    view(c7b, MX, 6, MZ - 7, 128, 48, 8), view(tMin + 0.8, MX, 6, MZ - 7, 122, 50, 2), view(tWil + 0.6, MX, 6, MZ - 6, 120, 52, -4), view(c8 - 0.02, MX, 6, MZ - 6, 120, 52, -6),
    view(c8, 0, 21, HZ - 4, 118, 14, 10), view(tQ - 0.3, 0, 20, HZ - 4, 128, 18, 4), view(tQ + 1.8, 0, 6, HZ + 30, 240, 48, 0), view(K.end, 0, 0, -6, 340, 60, 0), view(K.dur, 0, 0, -4, 346, 61, 0),
  ];
  const camT = track(keys);
  const tgt = new V3();
  const M4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new V3(), s4 = new V3();
  const grey = new THREE.Color(0xd8d2c4), cTmp = new THREE.Color();
  const SKYS = [[0, 0x5b3fa8, 0x7b5cd6, 0x3d2a80], [c2, 0x1d4e89, 0x2f6fb0, 0x163a66], [c3, 0xc0303c, 0xe63946, 0x8f1f2a], [c4, 0x1f7a6e, 0x2a9d8f, 0x165a51], [c5, 0xd9792b, 0xf4a261, 0xa8561a],
    [c6, 0x1d4e89, 0x4fb3e8, 0x163a66], [c7, 0x5a2d82, 0x7b5cd6, 0x3d1f5c], [c7b, 0x1d4e89, 0x2f6fb0, 0x163a66], [c8, 0x5b3fa8, 0x7b5cd6, 0x3d2a80]];

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check(F(40))) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } lcdTxt = null; calTxt = null; }
    const tq = Math.floor(t * 30) / 30;
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.3, c[1] + Math.sin(t * 0.29) * 0.2, c[2] + Math.cos(t * 0.31) * 0.25);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    let sk = SKYS[0]; for (const s of SKYS) if (t >= s[0]) sk = s;
    skyU.uA.value.set(sk[1]); skyU.uB.value.set(sk[2]); skyU.uD.value.set(sk[3]); skyU.uRot.value = t * 0.05; FOGU.value.set(sk[2]);
    // punch shake on the big beats (decays within 0.5 s)
    let shake = 0; for (const tb2 of [tHari, tSplit, tBun, t2011, tPec, tSam, tDil]) { const u = t - tb2; if (u > 0 && u < 0.5) shake += Math.exp(-u * 9) * 0.5; }
    if (shake) { cam.position.x += Math.sin(t * 91) * shake; cam.position.y += Math.cos(t * 77) * shake; }

    // ----- H: counter roll -----
    let v = 589 * eout(clamp01((t - tSel + 0.1) / (tHari - tSel + 0.3)));
    if (t < tSel - 0.1) v = 0;
    const ones = v % 10, tens = Math.floor(v / 10) % 10 + clamp01(ones - 9), hund = Math.floor(v / 100) + clamp01((v % 100) - 99);
    drums[2].rotation.x = ones * Math.PI / 5; drums[1].rotation.x = tens * Math.PI / 5; drums[0].rotation.x = hund * Math.PI / 5;
    const ring = (t > tSel && t < tHari + 0.6) || (t > c8 && t < c8 + 1.2);
    hammer.rotation.z = ring ? Math.sin(t * 60) * 0.5 : 0;
    bells.forEach((b, i) => { b.position.y = 22.6 + (ring ? Math.abs(Math.sin(t * 60 + i)) * 0.2 : 0); });
    star.rotation.z = t * 0.06; const sp = 1 + 0.08 * Math.exp(-Math.max(0, t - tHari) * 5) * (t > tHari ? 1 : 0); star.scale.setScalar(sp);
    const tk = back(clamp01((t - tSel) / 0.35)); tikB.scale.setScalar(Math.max(0.001, t < c2 ? tk : 1)); tikB.rotation.z = Math.sin(t * 7) * 0.08;
    { const pa = flagGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = flagBase[i * 3], y = flagBase[i * 3 + 1]; pa.setZ(i, Math.sin(x * 0.55 - tq * 5 + y * 0.12) * 0.55 * (x / 12)); } pa.needsUpdate = true; flagGeo.computeVertexNormals(); }
    for (let i = 0; i < NPG; i++) {
      const t0 = tSel + i * ((tHari - tSel) / NPG), u = t - t0;
      if (u < 0 || u > 2.4 || t > c2) { M4.makeScale(0, 0, 0); pages.setMatrixAt(i, M4); continue; }
      const q = mulberry(i * 7 + 3), vx = (q() - 0.5) * 22, vz = 4 + q() * 8, vy = 16 + q() * 10;
      v4.set(vx * u, 22.6 + 0.6 + vy * u - 14 * u * u, HZ - 6 + vz * u); e4.set(u * 4 + q() * 6, u * 3, u * 5); q4.setFromEuler(e4); s4.setScalar(1.2);
      M4.compose(v4, q4, s4); pages.setMatrixAt(i, M4);
    }
    pages.instanceMatrix.needsUpdate = true;

    // ----- M: split, signs, KRAK, PUSAT and coins -----
    const sp2 = eout(clamp01((t - tSplit) / 0.8));
    north.position.set(MX - sp2 * 0.6, 0.6 + sp2 * 0.5, MZ - sp2 * 2.6); south.position.set(MX + sp2 * 0.6, 0.6, MZ + sp2 * 2.6);
    north.rotation.x = -sp2 * 0.03; south.rotation.x = sp2 * 0.03;
    signF.scale.setScalar(Math.max(0.001, back(clamp01((t - tFl + 0.1) / 0.35)))); signW.scale.setScalar(Math.max(0.001, back(clamp01((t - tWa + 0.1) / 0.35))));
    const kr = t < c3 ? back(clamp01((t - tSplit) / 0.3)) * (1 - ramp(t, tSplit + 1.6, tSplit + 2.0)) : 0; krak.scale.setScalar(Math.max(0.001, kr)); krak.rotation.z = -0.1;
    const tw = t >= c7b ? back(clamp01((t - c7b - 0.2) / 0.5)) : 0; tower.scale.set(1, Math.max(0.001, tw), 1); tower.visible = tw > 0.01; pusat.visible = tw > 0.5;
    for (let i = 0; i < NC; i++) {
      const t0 = tMin + i * ((tWil - tMin + 0.4) / NC), u = (t - t0) / 0.7, cn = coins[i];
      if (t < c7b || u < 0) { cn.visible = false; continue; }
      cn.visible = true;
      const toF = i % 2 === 0, k = Math.floor(i / 2);
      const hb = toF ? north : south;
      const sx = bxx + north.position.x, sz = bzz + north.position.z, sy = 11;
      const ex = (toF ? pfx : pwx) + hb.position.x + (k % 3 - 1) * 1.3, ez = (toF ? pfz : pwz) + hb.position.z + (Math.floor(k / 3) % 2) * 1.3, ey = 3.25 + Math.floor(k / 6) * 0.45 + hb.position.y;
      const uu = clamp01(u);
      cn.position.set(sx + (ex - sx) * uu, sy + (ey - sy) * uu + Math.sin(uu * Math.PI) * 9, sz + (ez - sz) * uu);
      cn.rotation.set(uu < 1 ? uu * 9 : 0, 0, uu < 1 ? uu * 4 : 0);
    }

    // ----- P: seats fill by party, bars, N-VA rises -----
    const dim = ramp(t, tPt, tPt + 0.6);
    for (let i = 0; i < 150; i++) {
      const s = seats[i];
      const a0 = t11 - 0.1 + s.p * ((tPar - t11 + 0.6) / 11) + s.j * 0.01;
      const k = clamp01((tq - a0) / 0.25);
      const lift = s.p === 10 ? back(clamp01((t - t27 + 0.3) / 0.45)) * 1.3 : 0;
      e4.set(0, Math.atan2(hcx - s.x, hcz - s.z), 0); q4.setFromEuler(e4);
      v4.set(s.x, s.y + lift + (k < 1 ? (1 - k) * 0.8 : 0), s.z); s4.setScalar(t < c3 ? 1 : 0.85 + 0.15 * back(k));
      M4.compose(v4, q4, s4); seatI.setMatrixAt(i, M4); backI.setMatrixAt(i, M4);
      cTmp.copy(grey).lerp(s.col, k);
      if (s.p !== 10) cTmp.lerp(grey, dim * 0.55);
      seatI.setColorAt(i, cTmp); backI.setColorAt(i, cTmp);
    }
    seatI.instanceMatrix.needsUpdate = backI.instanceMatrix.needsUpdate = true; seatI.instanceColor.needsUpdate = backI.instanceColor.needsUpdate = true;
    bars.forEach((m, i) => { const hgt = Math.max(0.05, m.userData.n * BH * eout(clamp01((t - tLeb + 0.4 - i * 0.07) / 0.6))) + (i === 10 ? Math.sin(Math.max(0, t - t27) * 8) * 0.25 * ramp(t, t27, t27 + 0.3) : 0); m.scale.y = B0 + hgt; m.position.y = (B0 + hgt) / 2; });
    const l20 = back(clamp01((t - tLeb - 0.6) / 0.35)); line20.scale.x = 47 * Math.max(0.001, clamp01((t - tLeb - 0.5) / 0.4)); lab20.scale.setScalar(Math.max(0.001, l20));
    nvaCard.scale.setScalar(Math.max(0.001, back(clamp01((t - t27 + 0.2) / 0.35))));

    bb.visible = (t >= c3 - 0.05 && t < c8) || t > tQ;
    // ----- N: mediators walk in and out, king, Leterme -----
    const dx0 = NX + 22, dz0 = NZ - 6, spotX = NX - 13, spotZ = NZ - 11.5;
    meds.forEach((P, i) => {
      const ts = tMen - 0.2 + i * 0.62, u = t - ts, D = 2.2;
      if (u < 0 || u > D || t < c4 || t > tSem + 0.5) { P.g.visible = false; return; }
      P.g.visible = true;
      let x, z, ry, mv = 1;
      const tx2 = spotX + i * 2.6;
      if (u < 0.8) { const w = eout(u / 0.8); x = dx0 + (tx2 - dx0) * w; z = dz0 + (spotZ - dz0) * w; ry = -Math.PI / 2; }
      else if (u < 1.2) { x = tx2; z = spotZ; ry = 0; mv = 0; }
      else { const w = clamp01((u - 1.2) / 1.0); x = tx2 + (dx0 + 3 - tx2) * w * w; z = spotZ + (dz0 - spotZ) * w * w; ry = Math.PI / 2; }
      P.g.position.set(x, 0.6 + Math.abs(Math.sin(u * 11)) * 0.25 * mv, z); P.g.rotation.y = ry; walk(P, u * 11, mv);
      P.card.rotation.y = -ry;
    });
    leaf.rotation.y = t > tMen - 0.4 && t < tSem + 0.5 ? -1.2 : -0.15;
    king.armR.a.rotation.x = t > tRaja && t < tSem ? -1.4 + Math.sin(t * 3) * 0.1 : 0; king.armR.a.rotation.z = 0.6 * (t > tRaja && t < tSem ? 1 : 0);
    kingCard.scale.setScalar(Math.max(0.001, t < c4 + 0.1 ? 1 : back(clamp01((t - tRaja + 0.1) / 0.35))));
    letCard.scale.setScalar(Math.max(0.001, back(clamp01((t - tYv) / 0.35))));
    const lk = back(clamp01((t - tWew) / 0.4)); lock.scale.setScalar(Math.max(0.001, lk)); lock.rotation.z = Math.sin(Math.max(0, t - tWew) * 14) * 0.15 * Math.exp(-Math.max(0, t - tWew) * 3);

    // ----- B: calculator display, KOSONG stamp, monthly sheets -----
    let ls = "2011";
    if (t >= tTid) ls = "APBN ---"; if (t >= t2011 + 0.4) ls = "ERROR"; if (t >= tAng) ls = "2010";
    const kTimes = MONTHS.map((_, i) => tPrp - 0.1 + i * 0.55);
    kTimes.forEach((kt, i) => { if (t >= kt) ls = "2010 +" + (i + 1) + " BLN"; });
    if (ls !== lcdTxt) { lcdTxt = ls; paintLcd(ls); }
    keysI.forEach((k2, i) => { let pr = 0; for (const kt of [tTid, t2011 + 0.4, tAng, ...kTimes]) { const u = t - kt; if (u > 0 && u < 0.25 && (i % 5) === (Math.floor(kt * 10) % 5)) pr = 1; } if (i === 15) for (const kt of kTimes) if (t > kt && t < kt + 0.25) pr = 1; k2.position.y = 4.45 - pr * 0.5; });
    const kz = back(clamp01((t - t2011 - 0.2) / 0.25)); kosong.scale.setScalar(Math.max(0.001, 1.6 - 0.6 * kz)); kosong.visible = kz > 0.01; kosong.rotation.z = -0.12;
    sheets.forEach((g, i) => {
      const kt = kTimes[i], u = clamp01((t - kt + 0.35) / 0.35);
      g.visible = t > kt - 0.35;
      g.position.set(stackX + (1 - u) * 6, 0.7 + i * 0.16 + (1 - eout(u)) * 6, stackZ - (1 - u) * 4); g.rotation.set(0, (i - 1.5) * 0.08 + (1 - u) * 0.6, 0);
      g.userData.st.visible = t >= kt + 0.15;
    });
    { let sy = 14, sx2 = stackX, live = false; for (let i = 0; i < 4; i++) { const u = t - kTimes[i]; if (u > -0.2 && u < 0.4) { live = true; sy = 0.75 + i * 0.16 + 0.1 + Math.abs(u - 0.15) / 0.35 * 9; } } stamp.position.set(sx2 + 0.3, Math.max(0.9 + 0.16 * 3, sy), stackZ + 1.6); stamp.visible = t > tPrp - 0.6 && t < c6; if (!live) stamp.position.y = 9; }

    // ----- C: token along the track, flags, calendar -----
    let day = 150 + 44 * eout(clamp01((t - c6 - 0.3) / (tPec - c6 - 0.3)));
    day += 159 * ((t - tSatu) > 0 ? eout(clamp01((t - tSatu) / (tSam - tSatu))) : 0);
    token.position.set(dayX(day), 0.6 + 1.4 + Math.abs(Math.sin((t - c6) * 7)) * 0.6 * (t < tSam ? 1 : 0), TZ); tokBlob.position.set(dayX(day), 0.66, TZ);
    token.rotation.y = Math.sin(t * 2) * 0.2;
    const rk = t >= tPec ? back(clamp01((t - tPec) / 0.3)) * (1 - ramp(t, tSatu, tSatu + 0.3)) : 0; rekor.position.set(dayX(194) - 6.5, 13.5, TZ + 1); rekor.scale.setScalar(Math.max(0.001, rk));
    const sm = t >= tSam ? back(clamp01((t - tSam) / 0.3)) : 0; sama.position.set(dayX(353) + 2.5, 13, TZ + 2); sama.scale.setScalar(Math.max(0.001, sm)); sama.rotation.z = 0.08;
    const cs = t < tSatu ? ["25", "DES 2010"] : ["1", "JUN 2011"];
    if (cs[0] !== calTxt) { calTxt = cs[0]; paintCal(cs, t < tSatu ? "HARI NATAL" : "SATU JUNI"); }
    const tu = t - tSatu; tear.visible = tu > 0 && tu < 1.2;
    if (tear.visible) { tear.position.set(CX - 14 + tu * 6, 0.6 + 6.2 + tu * 4 - tu * tu * 6, CZ - 16 + 1.3 + tu * 5); tear.rotation.set(-tu * 1.5, tu * 1.2, tu * 0.8); }

    // ----- S: stage, crowd, confetti -----
    const dl = clamp01((t - tDil) / 0.4);
    drCard.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s7:enam")) / 0.35))));
    dr.armR.a.rotation.x = t > tDil ? -2.4 * eout(dl) : 0; dr.armR.a.rotation.z = t > tDil ? 0.3 : 0;
    sign541.scale.setScalar(Math.max(0.001, back(clamp01((t - t541) / 0.35))));
    for (let i = 0; i < 28; i++) {
      const cw = crowd[i], hop = t > tDil ? Math.abs(Math.sin((t - tDil) * 6 + cw.ph)) * 0.7 * Math.exp(-Math.max(0, t - tDil - 3) * 0.5) : Math.sin(t * 1.5 + cw.ph) * 0.08;
      q4.identity(); v4.set(cw.x, 0.6 + 1.5 + hop, cw.z); s4.set(1, 1, 1); M4.compose(v4, q4, s4); crowdB.setMatrixAt(i, M4);
      v4.set(cw.x, 0.6 + 3.9 + hop, cw.z); s4.setScalar(0.95); M4.compose(v4, q4, s4); crowdI.setMatrixAt(i, M4);
      crowdB.setColorAt(i, cw.c); crowdI.setColorAt(i, cTmp.set("#E9B48A").lerp(new THREE.Color("#8D5A3B"), (i % 3) / 3));
    }
    crowdI.instanceMatrix.needsUpdate = crowdB.instanceMatrix.needsUpdate = true; crowdI.instanceColor.needsUpdate = crowdB.instanceColor.needsUpdate = true;
    cones.forEach((m, i) => { m.material.opacity = 0.07 + 0.05 * dl + Math.sin(t * 2 + i) * 0.02; });
    for (let i = 0; i < NCF; i++) {
      const [x, z, d0, spd, ph] = cfd[i], u = t - tDil - d0 * 0.4;
      if (u < 0 || t > c7b) { M4.makeScale(0, 0, 0); conf.setMatrixAt(i, M4); continue; }
      const y = 30 - ((u * spd) % 30);
      e4.set(u * 5 + ph, u * 3, u * 4); q4.setFromEuler(e4); v4.set(x + Math.sin(u * 2 + ph) * 1.5, y, z); s4.setScalar(1);
      M4.compose(v4, q4, s4); conf.setMatrixAt(i, M4);
    }
    conf.instanceMatrix.needsUpdate = true;

    // ----- ink pre-pass + render -----
    const hidden = noInk.map((o) => o.visible);
    noInk.forEach((o) => { o.visible = false; });
    scene.overrideMaterial = nMat;
    r.setRenderTarget(rtN); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, cam);
    r.setRenderTarget(null); scene.overrideMaterial = null;
    noInk.forEach((o, i) => { o.visible = hidden[i]; });
    comp.render();
  };
}
