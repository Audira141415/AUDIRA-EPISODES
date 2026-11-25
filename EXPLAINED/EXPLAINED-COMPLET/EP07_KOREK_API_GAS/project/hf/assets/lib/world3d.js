// EP07 KOREK API GAS (COMICFORGE), rebuild r9. A printed comic page per beat, after the kit's quality-bar cover:
// a saturated backdrop of big blotchy Ben-Day dots with white/yellow speed rays, a huge inked yellow+red burst behind
// ONE big subject, a giant onomatopoeia printed into the world behind the subject, and inked tetra shards in the
// foreground. Every prop: halftone cel shader (3 hard bands, Ben-Day dots on the shadow side, hard highlight, comic
// chrome bands on metal) + black inverted-hull ink. Stations:
//   H  (0,0,0)     hero flint lighter: magenta body (front half peels off for the cutaway), cyan liquid butane,
//                  big toothed wheel, flint + spring, yellow fork lever, brass nozzle, steel hood, gauge, flame
//   F  x=-14       ferrocerium rod being scraped + Fe / Ce tiles; generic chemist figure with a name plate
//   E  x=+14       electric lighter cutaway: button, spring, hammer, piezo crystal, wire, spark gap
//   M  (-6,7,-8)   one glowing spark shard, magnified
// Every value is a pure function of t (seek-safe, seeded randomness only). All times come from K / AT.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const P = {
  ink: "#121014", cyan: "#00B4F0", cyanS: "#0062A8", mag: "#E5007D", magS: "#7E0046", yel: "#FFE100", yelS: "#E08A00",
  red: "#ED1C24", redS: "#7A0810", navy: "#2B2E8C", navyS: "#14154A", purple: "#5B2A9E",
};
const FONT = "Impact, 'Arial Black', sans-serif";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };

// ---------- halftone cel shader + ink hull ----------
const LU = { value: new THREE.Vector3(0, 1, 0) }, RU = { value: new THREE.Vector3(0, 0, -1) }, RC = { value: new THREE.Color(1, 1, 1) };
const HV = `varying vec3 vN;varying vec3 vW;varying vec3 vIC;
void main(){
#ifdef USE_INSTANCING
 mat4 m=modelMatrix*instanceMatrix;
#else
 mat4 m=modelMatrix;
#endif
#ifdef USE_INSTANCING_COLOR
 vIC=instanceColor;
#else
 vIC=vec3(1.0);
#endif
 vec4 wp=m*vec4(position,1.0);vW=wp.xyz;vN=normalize(mat3(m)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const HF = `uniform vec3 uColor;uniform vec3 uShade;uniform vec3 uLight;uniform vec3 uRimDir;uniform vec3 uRimCol;
uniform float uDot;uniform float uSpec;uniform float uRim;uniform float uAlpha;uniform float uEmit;uniform float uBoost;uniform float uMetal;
varying vec3 vN;varying vec3 vW;varying vec3 vIC;
float dots(float cov,float cell){vec2 p=gl_FragCoord.xy/cell;p=mat2(0.7071,-0.7071,0.7071,0.7071)*p;vec2 g=fract(p)-0.5;float r=sqrt(clamp(cov,0.0,1.0))*0.64;return 1.0-smoothstep(r-0.07,r+0.07,length(g));}
void main(){
 vec3 n=normalize(vN);vec3 v=normalize(cameraPosition-vW);if(dot(n,v)<0.0)n=-n;
 vec3 C=uColor*vIC,S=uShade*vIC;
 float ndl=dot(n,normalize(uLight));
 vec3 col=ndl>0.55?C:(ndl>0.15?mix(C,S,dots(0.3,uDot)):(ndl>-0.25?mix(C,S,dots(0.8,uDot)):mix(S,S*0.35,dots(0.55,uDot))));
 if(uMetal>0.0){vec3 vn=normalize((viewMatrix*vec4(n,0.0)).xyz);float s=vn.x*0.75+vn.y*0.66;
  col=s>0.68?mix(col,vec3(0.97),uMetal*0.85):((s>0.08&&s<0.3)?mix(col,S*0.3,uMetal*0.85):col);}
 col=mix(col,C,uEmit);
 vec3 h=normalize(normalize(uLight)+v);
 col=mix(col,vec3(1.0),step(0.985,dot(n,h))*uSpec);
 float fr=1.0-abs(dot(n,v));
 col=mix(col,uRimCol,step(0.5,fr)*step(0.0,dot(n,normalize(uRimDir)))*uRim);
 gl_FragColor=vec4(col*uBoost,uAlpha);
 #include <colorspace_fragment>
}`;
function HT(color, shade, o = {}) {
  const al = o.alpha ?? 1;
  return new THREE.ShaderMaterial({
    vertexShader: HV, fragmentShader: HF, side: THREE.DoubleSide, transparent: al < 1, depthWrite: al >= 1,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uShade: { value: new THREE.Color(shade) }, uLight: LU, uRimDir: RU, uRimCol: RC,
      uDot: { value: o.dot ?? 13 }, uSpec: { value: o.spec ?? 0 }, uRim: { value: o.rim ?? 0.85 }, uAlpha: { value: al },
      uEmit: { value: o.emit ?? 0 }, uBoost: { value: o.boost ?? 1 }, uMetal: { value: o.metal ?? 0 },
    },
  });
}
const OV = `attribute vec3 onormal;uniform float uThick;
void main(){
#ifdef USE_INSTANCING
 mat4 m=modelMatrix*instanceMatrix;
#else
 mat4 m=modelMatrix;
#endif
 vec4 wp=m*vec4(position,1.0);vec3 wn=normalize(mat3(m)*onormal);float d=length(cameraPosition-wp.xyz);
 float sc=length(m[0].xyz);wp.xyz+=wn*uThick*d*step(0.0005,sc);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const OLC = {};
const OL = (th) => OLC[th] || (OLC[th] = new THREE.ShaderMaterial({ vertexShader: OV, fragmentShader: `void main(){gl_FragColor=vec4(0.05,0.04,0.06,1.0);}`, uniforms: { uThick: { value: th } }, side: THREE.BackSide }));
function addON(g) {
  if (g.attributes.onormal) return;
  const p = g.attributes.position, n = g.attributes.normal, map = new Map(), key = (i) => `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i); const v = map.get(k) || [0, 0, 0]; v[0] += n.getX(i); v[1] += n.getY(i); v[2] += n.getZ(i); map.set(k, v); }
  const a = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const v = map.get(key(i)), l = Math.hypot(v[0], v[1], v[2]) || 1; a[i * 3] = v[0] / l; a[i * 3 + 1] = v[1] / l; a[i * 3 + 2] = v[2] / l; }
  g.setAttribute("onormal", new THREE.BufferAttribute(a, 3));
}
const INK = 0.016; // ~ constant screen-width ink line
function ink(m, th = INK) {
  addON(m.geometry);
  let h;
  if (m.isInstancedMesh) { h = new THREE.InstancedMesh(m.geometry, OL(th), m.count); h.instanceMatrix = m.instanceMatrix; h.frustumCulled = false; }
  else h = new THREE.Mesh(m.geometry, OL(th));
  m.add(h); return m;
}
function mk(geo, mat, parent, x = 0, y = 0, z = 0, th = INK) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (th) ink(m, th); parent.add(m); return m;
}
const BX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const CY = (a, b, h, s = 32) => new THREE.CylinderGeometry(a, b, h, s);
const SP = (r, a = 24, b = 16) => new THREE.SphereGeometry(r, a, b);
const win = (t, a, b, f = 0.25) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
const popS = (t, a, b = 1e9, d = 0.3) => (t < a ? 0 : back(clamp01((t - a) / d), 2.2)) * (1 - ramp(t, b - 0.2, b));
function rrShape(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape(), x0 = cx - w / 2, y0 = cy - h / 2;
  s.moveTo(x0 + r, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r); s.lineTo(x0 + w, y0 + h - r);
  s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h); s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s;
}
const EXT = (shape, depth, bevel = 0.035) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 10 }); g.computeVertexNormals(); return g; };

function plane(w, h, tex, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.position.set(x, y, z); parent.add(m); return m;
}
function textTex(w, h, draw) { return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); draw(g, w, h); }); }
function starPath(g, cx, cy, n, r1, r2, rot, R) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, r = (i % 2 ? r2 : r1) * (R ? 0.78 + 0.44 * R() : 1); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
// onomatopoeia: big italic letters, coloured inner stroke, heavy black outer stroke, hard drop shadow
function sfxTex(word, { px = 300, fill = P.yel, inner = P.red } = {}) {
  return textTex(1536, 640, (g, w, h) => {
    g.save(); g.translate(w / 2, h / 2 + px * 0.36); g.transform(1, -0.06, -0.16, 1, 0, 0);
    let s = px; g.font = `italic 900 ${s}px ${FONT}`; while (g.measureText(word).width > w * 0.86) { s -= 8; g.font = `italic 900 ${s}px ${FONT}`; }
    g.textAlign = "center"; g.lineJoin = "round";
    g.fillStyle = P.ink; g.lineWidth = 56; g.strokeStyle = P.ink; g.strokeText(word, 16, 16);
    g.lineWidth = 46; g.strokeText(word, 0, 0);
    g.lineWidth = 22; g.strokeStyle = inner; g.strokeText(word, 0, 0);
    g.fillStyle = fill; g.fillText(word, 0, 0); g.restore();
  });
}
// burst: irregular inked star, inner jagged star, halftone dots in between
function burstTex(outer, inner, dotCol, seed) {
  return textTex(1024, 1024, (g, w, h) => {
    const R = mulberry(seed);
    starPath(g, w / 2, h / 2, 13, 505, 300, 0.12, R); g.fillStyle = outer; g.fill(); g.lineWidth = 30; g.strokeStyle = P.ink; g.lineJoin = "miter"; g.stroke();
    g.save(); g.clip(); g.fillStyle = dotCol; for (let y = 0; y < h; y += 26) for (let x = (y / 26) % 2 ? 13 : 0; x < w; x += 26) { const d = Math.hypot(x - w / 2, y - h / 2); const r = 9 * clamp01((d - 260) / 200); if (r > 0.6) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } } g.restore();
    starPath(g, w / 2, h / 2, 11, 330, 205, 0.4, R); g.fillStyle = inner; g.fill(); g.lineWidth = 18; g.strokeStyle = P.ink; g.stroke();
  });
}

// ---------- backdrop: blotchy two-colour Ben-Day dots + speed rays from the burst centre ----------
const BGF = `uniform vec3 uA;uniform vec3 uD1;uniform vec3 uD2;uniform vec3 uR1;uniform vec3 uR2;uniform vec2 uC;uniform float uRot;
float hash(float n){return fract(sin(n*12.9898)*43758.5453);}
void main(){vec2 q=gl_FragCoord.xy;vec3 c=uA;float cell=74.0;
 vec2 p=q/cell;vec2 g=fract(p)-0.5;vec2 id=floor(p);
 float m1=0.5+0.5*sin(id.x*0.9+id.y*0.45+1.3)*sin(id.y*0.62-id.x*0.33);float r1=0.12+0.3*m1;
 c=mix(c,uD1,1.0-smoothstep(r1-0.03,r1+0.03,length(g*vec2(1.0,1.35))));
 vec2 p2=q/cell+0.5;g=fract(p2)-0.5;id=floor(p2);
 float m2=0.5+0.5*sin(id.x*0.5-id.y*0.8+4.0)*sin(id.y*0.37+id.x*0.61);float r2=0.05+0.3*m2*m2;
 c=mix(c,uD2,1.0-smoothstep(r2-0.03,r2+0.03,length(g*vec2(1.0,1.35))));
 vec2 v=q-uC;float ang=atan(v.y,v.x)/6.28318+0.5;float k=ang*64.0+uRot;float i=floor(k);float f=fract(k);
 float w=0.05+0.16*hash(i);float ray=step(hash(i+7.0),0.55)*(1.0-smoothstep(w*0.55,w,abs(f-0.5)));
 ray*=smoothstep(120.0,420.0,length(v));
 c=mix(c,mix(uR1,uR2,step(0.6,hash(i+3.0))),ray*0.95);
 gl_FragColor=vec4(c,1.0);
 #include <colorspace_fragment>
}`;
// per-beat palettes: [base, dots1, dots2, ray1, ray2, rim, fg shard colour, fg shade]
const PAL = {
  hook: ["#5B2A9E", "#3C5BD6", "#E0308A", "#FFFFFF", "#FFE100", "#00E0FF", "#E5007D", "#7E0046"],
  rod: ["#00A3E0", "#0067B0", "#7FE6FF", "#FFFFFF", "#FFE100", "#FFE100", "#2B2E8C", "#14154A"],
  chem: ["#00A651", "#007A3A", "#9FEA5A", "#FFFFFF", "#FFE100", "#FFE100", "#E5007D", "#7E0046"],
  tank: ["#E5007D", "#A3005A", "#FF6FB8", "#FFFFFF", "#FFE100", "#00E0FF", "#00B4F0", "#0062A8"],
  valve: ["#2B2E8C", "#1E5FD0", "#6A2A9E", "#FFFFFF", "#FFE100", "#FFE100", "#E5007D", "#7E0046"],
  boil: ["#1E5FD0", "#2B2E8C", "#00B4F0", "#FFFFFF", "#FFE100", "#FFE100", "#FFFFFF", "#7FB8E0"],
  jet: ["#FF7A00", "#ED1C24", "#FFC400", "#FFFFFF", "#FFE100", "#00E0FF", "#00B4F0", "#0062A8"],
  wheel: ["#ED1C24", "#9A0A12", "#FF7A00", "#FFFFFF", "#FFE100", "#FFE100", "#FFE100", "#E08A00"],
  piezo: ["#00A651", "#007A3A", "#2B2E8C", "#FFFFFF", "#FFE100", "#FFE100", "#00E0FF", "#0062A8"],
  spark: ["#14154A", "#ED1C24", "#6A2A9E", "#FFE100", "#FF7A00", "#FF7A00", "#ED1C24", "#7A0810"],
  flame: ["#5B2A9E", "#3C5BD6", "#E0308A", "#FFFFFF", "#FFE100", "#FFE100", "#FF7A00", "#B33A00"],
  safe: ["#00A3E0", "#2B2E8C", "#7FE6FF", "#FFFFFF", "#FFE100", "#E5007D", "#E5007D", "#7E0046"],
};

// ---------- generic stylised figure (no likeness) ----------
function person(M) {
  const G = new THREE.Group(), th = INK * 0.85;
  const add = (geo, mat, x, y, z, p = G) => mk(geo, mat, p, x, y, z, th);
  const leg = (s) => {
    const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.95, 0); G.add(hip);
    add(CY(0.08, 0.068, 0.46, 16), M.pants, 0, -0.23, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -0.46; hip.add(knee);
    add(SP(0.07, 14, 10), M.pants, 0, 0, 0, knee); add(CY(0.066, 0.052, 0.44, 16), M.pants, 0, -0.22, 0, knee);
    add(BX(0.13, 0.08, 0.26), M.shoe, 0, -0.47, 0.06, knee); return { hip, knee };
  };
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.26, 1.44, 0); G.add(sh);
    add(SP(0.085, 16, 12), M.coat, 0, 0, 0, sh); add(CY(0.066, 0.056, 0.3, 14), M.coat, 0, -0.15, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
    add(SP(0.058, 12, 10), M.coat, 0, 0, 0, el); add(CY(0.054, 0.046, 0.27, 14), M.coat, 0, -0.135, 0, el);
    add(SP(0.058, 14, 10), M.skin, 0, -0.3, 0, el); return { sh, el };
  };
  const L = { legL: leg(-1), legR: leg(1), armL: arm(-1), armR: arm(1) };
  const torso = add(CY(0.24, 0.17, 0.52, 24), M.coat, 0, 1.2, 0); torso.scale.z = 0.62;
  const skirt = add(CY(0.18, 0.25, 0.42, 24), M.coat, 0, 0.78, 0); skirt.scale.z = 0.7;
  add(CY(0.055, 0.06, 0.1, 14), M.skin, 0, 1.5, 0);
  const head = new THREE.Group(); head.position.set(0, 1.67, 0); G.add(head);
  add(SP(0.13, 24, 18), M.skin, 0, 0, 0, head).scale.set(1, 1.12, 1.02);
  const hair = add(new THREE.SphereGeometry(0.138, 24, 12, 0, Math.PI * 2, 0, 1.25), M.hair, 0, 0.02, -0.01, head); hair.rotation.x = -0.35;
  const beard = add(new THREE.SphereGeometry(0.125, 20, 10, 0, Math.PI * 2, 1.9, 1.2), M.hair, 0, -0.01, 0.01, head); beard.scale.set(1, 1.15, 1.05);
  for (const s of [-1, 1]) { mk(SP(0.017, 10, 8), M.ink, head, s * 0.046, 0.025, 0.118, 0); add(SP(0.03, 10, 8), M.skin, s * 0.13, 0, 0, head); mk(BX(0.05, 0.013, 0.01), M.ink, head, s * 0.047, 0.07, 0.12, 0); }
  for (const s of [-1, 1]) { const c = add(BX(0.1, 0.12, 0.02), M.coat, s * 0.07, 1.42, 0.11); c.rotation.z = s * 0.5; }
  return { G, head, ...L };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: "#5B2A9E", exp: 0.95, bloom: [0.07, 0.12, 0.985], shadow: false });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.96;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader, fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=max(texture2D(tDiffuse,vUv).rgb,0.0);float l=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(vec3(l),c,1.25);c=(c-0.2)*1.1+0.2;gl_FragColor=vec4(max(c,0.0),1.0);}` }), 2);
  cam.near = 0.03; cam.updateProjectionMatrix(); scene.add(cam);
  const A = (k) => AT[k];

  const bgU = { uA: { value: new THREE.Color() }, uD1: { value: new THREE.Color() }, uD2: { value: new THREE.Color() }, uR1: { value: new THREE.Color() }, uR2: { value: new THREE.Color() }, uC: { value: new THREE.Vector2(540, 960) }, uRot: { value: 0 } };
  const bgQ = new THREE.Mesh(new THREE.PlaneGeometry(80, 140), new THREE.ShaderMaterial({ vertexShader: `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`, fragmentShader: BGF, uniforms: bgU, depthWrite: false }));
  bgQ.position.z = -100; bgQ.renderOrder = -10; cam.add(bgQ);

  // ---------- materials ----------
  const M = {
    body: HT(P.mag, P.magS, { spec: 1 }), inner: HT("#9A0052", "#4A0028", { rim: 0 }),
    liquid: HT(P.cyan, P.cyanS, { rim: 0.5 }), liqTop: HT("#8FE9FF", P.cyan, { rim: 0 }),
    steel: HT("#C9D6EA", "#3A4766", { spec: 1, metal: 1 }), dark: HT("#5A6684", "#161A2A", { spec: 1, metal: 1 }),
    brass: HT("#FFD24A", "#B86A00", { spec: 1, metal: 0.8 }), flint: HT("#7D8496", "#22252F", { spec: 0.5 }),
    yel: HT(P.yel, P.yelS, { spec: 0.6 }), red: HT(P.red, P.redS, { spec: 0.6 }), copper: HT("#FF9A5A", "#A8461A", { spec: 1, metal: 0.7 }),
    ink: HT(P.ink, P.ink, { rim: 0 }), white: HT("#FFFFFF", "#8FA6C8", { rim: 0 }),
    bubble: HT("#FFFFFF", "#7FDDF8", { rim: 0, spec: 1 }), gas: HT("#33CCFF", "#0062A8", { rim: 0, dot: 11 }), air: HT("#FFFFFF", "#9AB0D8", { rim: 0, dot: 11 }),
    spark: HT("#FFFFFF", "#FF7A00", { emit: 0.75, boost: 1.25, rim: 0 }),
    fO: HT("#FF3D1A", "#FF3D1A", { emit: 1, rim: 0, boost: 1.05 }), fM: HT("#FF9A00", "#FF9A00", { emit: 1, rim: 0, boost: 1.1 }),
    fI: HT("#FFF06A", "#FFF06A", { emit: 1, rim: 0, boost: 1.2 }), fB: HT("#2E8CFF", "#2E8CFF", { emit: 1, rim: 0, boost: 1.1 }),
    rod: HT("#9AA5BC", "#20253A", { spec: 1, metal: 1 }), striker: HT("#E6ECF6", "#46536E", { spec: 1, metal: 1 }),
    coat: HT("#FFFFFF", "#8CA2C4"), pants: HT(P.navy, P.navyS), hair: HT("#5A341C", "#22120A"), shoe: HT("#2A2A30", "#101014"), skin: HT("#FFCFA0", "#C9784C"),
    ebody: HT(P.cyan, P.cyanS, { spec: 1 }), einner: HT("#00609C", "#00304E", { rim: 0 }), crystal: HT("#B8FFF0", "#22C8A8", { spec: 1 }),
    guard: HT("#C9D6EA", "#3A4766", { spec: 1, metal: 1 }), fg: HT(P.mag, P.magS, { rim: 0.6 }),
  };

  // =============== H: hero flint lighter ===============
  const H = new THREE.Group(); scene.add(H);
  const BW = 1.2, BH = 2.5, BY = 1.35, BD = 0.34;
  // back half: thin wall ring + back plate (hollow so the cutaway shows the inside)
  const ring = rrShape(BW, BH, 0.24, 0, BY); ring.holes.push(rrShape(BW - 0.14, BH - 0.14, 0.18, 0, BY));
  mk(EXT(ring, BD, 0.03), M.body, H, 0, 0, -BD);
  mk(EXT(rrShape(BW, BH, 0.24, 0, BY), 0.05, 0.03), M.inner, H, 0, 0, -BD - 0.02, 0).position.z = -BD - 0.04;
  // front half: solid, peels off toward the camera for the cutaway
  const front = new THREE.Group(); H.add(front);
  mk(EXT(rrShape(BW, BH, 0.24, 0, BY), BD, 0.035), M.body, front, 0, 0, 0);
  const stick = textTex(1024, 420, (g, w, h) => {
    g.fillStyle = P.yel; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(237,28,36,.4)"; for (let y = 10; y < h; y += 24) for (let x = (y / 24) % 2 ? 12 : 0; x < w; x += 24) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    g.lineWidth = 26; g.strokeStyle = P.ink; g.strokeRect(13, 13, w - 26, h - 26);
    g.font = `italic 900 250px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 34; g.strokeStyle = P.ink; g.strokeText("AUDIRA", w / 2, h / 2 + 10); g.fillStyle = P.red; g.fillText("AUDIRA", w / 2, h / 2 + 10);
  });
  const sticker = plane(0.98, 0.4, stick, front, 0, 1.25, BD + 0.04); sticker.rotation.z = 0.06; sticker.material.depthWrite = true;
  // shine stripes on the body (comic gloss)
  const shineT = textTex(256, 1024, (g) => { g.fillStyle = "#FFFFFF"; g.save(); g.transform(1, 0, -0.18, 1, 0, 0); g.fillRect(150, 70, 34, 860); g.fillRect(205, 140, 14, 700); g.restore(); });
  plane(0.42, 2.0, shineT, front, -0.32, 1.5, BD + 0.045).material.depthWrite = true;
  // inside: liquid butane, gas tube, flint spring
  const liquid = mk(BX(BW - 0.16, 1, BD - 0.02), M.liquid, H, 0, 0, -BD / 2 - 0.01, 0.006);
  const liqTop = mk(BX(BW - 0.16, 0.04, BD - 0.02), M.liqTop, H, 0, 0, -BD / 2 - 0.01, 0);
  mk(CY(0.035, 0.035, 2.3, 12), M.steel, H, 0.26, 1.45, 0.03, 0.006);
  const helix = (R, turns, h, rr = 0.012) => { const pts = []; for (let i = 0; i <= turns * 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * R, (i / (turns * 24)) * h, Math.sin(a) * R)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 24, rr, 6, false); };
  mk(helix(0.06, 7, 0.75, 0.016), M.copper, H, -0.3, 1.85, 0.03, 0.006);
  // top deck, flint, wheel, hood, nozzle, lever
  mk(BX(BW + 0.06, 0.12, 2 * BD + 0.06), M.steel, H, 0, 2.66, 0);
  const flint = mk(CY(0.075, 0.075, 0.2, 18), M.flint, H, -0.3, 2.8, 0);
  const wheelShape = new THREE.Shape(); for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, rr = i % 2 ? 0.215 : 0.26; i ? wheelShape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : wheelShape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const wheelG = new THREE.ExtrudeGeometry(wheelShape, { depth: 0.16, bevelEnabled: false, curveSegments: 4 }); wheelG.translate(0, 0, -0.08); wheelG.computeVertexNormals();
  const wheel = new THREE.Group(); wheel.position.set(-0.3, 3.1, 0); H.add(wheel);
  mk(wheelG, M.dark, wheel, 0, 0, 0);
  for (const s of [-1, 1]) { const dg = new THREE.CylinderGeometry(0.29, 0.29, 0.07, 40); const d = mk(dg, M.dark, wheel, 0, 0, s * 0.12); d.rotation.x = Math.PI / 2; for (let i = 0; i < 6; i++) { const nb = mk(BX(0.05, 0.08, 0.02), M.dark, wheel, Math.cos(i * 1.047) * 0.2, Math.sin(i * 1.047) * 0.2, s * 0.16, 0); nb.rotation.z = i * 1.047; } }
  mk(CY(0.05, 0.05, 0.42, 14), M.dark, wheel, 0, 0, 0).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) mk(BX(0.16, 0.5, 0.05), M.steel, H, -0.3, 2.95, s * 0.24);
  // hood (chimney) around the nozzle: back + sides + low front lip, perforated
  const holeT = textTex(256, 256, (g, w, h) => { g.fillStyle = "#1A1E2C"; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { g.beginPath(); g.arc(50 + x * 78, 50 + y * 78, 22, 0, 7); g.fill(); } });
  const hood = new THREE.Group(); hood.position.set(0.28, 3.0, 0); H.add(hood);
  mk(BX(0.66, 0.6, 0.04), M.steel, hood, 0, 0.02, -0.26); plane(0.5, 0.42, holeT, hood, 0, 0.02, -0.235).material.depthWrite = true;
  mk(BX(0.04, 0.6, 0.56), M.steel, hood, 0.33, 0.02, 0);
  const nozzle = new THREE.Group(); nozzle.position.set(0.26, 2.74, 0); H.add(nozzle);
  mk(CY(0.085, 0.1, 0.26, 24), M.brass, nozzle, 0, 0.13, 0); mk(CY(0.05, 0.07, 0.1, 20), M.brass, nozzle, 0, 0.3, 0);
  mk(CY(0.03, 0.03, 0.02, 12), M.ink, nozzle, 0, 0.36, 0, 0);
  const lever = new THREE.Group(); lever.position.set(-0.02, 2.78, 0); H.add(lever);
  mk(BX(0.86, 0.1, 0.5), M.yel, lever, 0.42, 0, 0); mk(BX(0.12, 0.2, 0.5), M.yel, lever, 0.82, 0.06, 0);
  // child guard over the wheel (s8)
  const guard = mk(new THREE.TorusGeometry(0.34, 0.05, 12, 28, Math.PI), M.guard, H, -0.3, 3.1, 0.2);
  // gauge (s3-s4)
  const gauge = new THREE.Group(); gauge.position.set(1.25, 1.05, 0.75); H.add(gauge);
  mk(CY(0.48, 0.48, 0.16, 40), M.red, gauge, 0, 0, 0).rotation.x = Math.PI / 2;
  const gface = textTex(512, 512, (g) => {
    g.fillStyle = "#FFFDF4"; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill();
    g.strokeStyle = P.red; g.lineWidth = 44; g.beginPath(); g.arc(256, 256, 190, (-90 + 30) * Math.PI / 180, (-90 + 130) * Math.PI / 180); g.stroke();
    g.fillStyle = P.ink; g.font = `900 80px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    [["0", -130], ["1×", -43], ["2×", 43], ["3×", 130]].forEach(([s, d]) => { const a = (d - 90) * Math.PI / 180; g.fillText(s, 256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140); });
    for (let d = -130; d <= 130; d += 14.4) { const a = (d - 90) * Math.PI / 180; g.strokeStyle = P.ink; g.lineWidth = 7; g.beginPath(); g.moveTo(256 + Math.cos(a) * 205, 256 + Math.sin(a) * 205); g.lineTo(256 + Math.cos(a) * 238, 256 + Math.sin(a) * 238); g.stroke(); }
    g.font = `900 52px ${FONT}`; g.fillText("TEKANAN", 256, 370);
  });
  const gfp = plane(0.84, 0.84, gface, gauge, 0, 0, 0.085); gfp.material.depthWrite = true;
  const needle = new THREE.Group(); needle.position.z = 0.1; gauge.add(needle);
  mk(BX(0.045, 0.34, 0.02), M.red, needle, 0, 0.15, 0, 0.006); mk(CY(0.05, 0.05, 0.03, 16), M.ink, needle, 0, 0, 0, 0).rotation.x = Math.PI / 2;
  const gpipe = mk(CY(0.05, 0.05, 1.0, 12), M.steel, H, 0.78, 0.7, 0.4, 0.007); gpipe.rotation.order = "YXZ"; gpipe.rotation.set(Math.PI / 2, Math.atan2(0.75, 0.9) , 0);
  // pressure arrows squeezing the liquid (s3)
  const arrowShape = (() => { const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.lineTo(-0.08, 0.32); s.lineTo(-0.18, 0.32); s.lineTo(0, 0.55); s.lineTo(0.18, 0.32); s.lineTo(0.08, 0.32); s.lineTo(0.08, 0); s.closePath(); return s; })();
  const arrowG = EXT(arrowShape, 0.06, 0.01);
  const pArrows = [[-0.95, 1.2, Math.PI / 2 * -1], [0.95, 1.5, Math.PI / 2], [-0.95, 0.6, -Math.PI / 2], [0.95, 0.75, Math.PI / 2]].map(([x, y, rz]) => { const m = mk(arrowG, M.yel, H, x, y, 0.25); m.rotation.z = rz; m.userData.x = x; return m; });
  // action arrows (comic motion marks): press arrow over the lever, curl arrow around the wheel
  const press = mk(arrowG, M.red, H, 0.72, 3.55, 0.25); press.rotation.z = Math.PI; press.scale.setScalar(1.3);
  const curl = new THREE.Group(); curl.position.set(-0.3, 3.1, 0.32); H.add(curl);
  { const pts = []; for (let i = 0; i <= 24; i++) { const a = 2.6 - i * 0.075; pts.push(new THREE.Vector3(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0)); }
    mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 8, false), M.white, curl, 0, 0, 0, INK * 0.8);
    const hd = mk(new THREE.ConeGeometry(0.09, 0.2, 12), M.white, curl, Math.cos(0.8) * 0.42, Math.sin(0.8) * 0.42, 0, INK * 0.8); hd.rotation.z = 0.8 - Math.PI; }
  // boiling bubbles (on the cut face) + vapour
  const IM = (geo, mat, n, th = INK * 0.8) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; if (th) ink(m, th); return m; };
  const bub = IM(SP(1, 12, 8), M.bubble, 46); H.add(bub);
  const RB = mulberry(707), bubS = [...Array(46)].map((_, i) => [(RB() - 0.5) * 0.9, RB(), 0.35 + RB() * 0.6, i % 5 === 0 ? 0.07 + RB() * 0.03 : 0.025 + RB() * 0.035, RB() * 0.06]);
  // gas jet + air (s5)
  const gasI = IM(SP(1, 12, 8), M.gas, 60); H.add(gasI);
  const airI = IM(SP(1, 12, 8), M.air, 40); H.add(airI);
  const RS = mulberry(4242);
  const gS = [...Array(60)].map(() => [RS(), (RS() - 0.5) * 2, (RS() - 0.5) * 2, 0.6 + RS() * 0.8, RS() * 6]);
  const aS = [...Array(40)].map(() => [RS(), RS() * 6.28, 3.15 + RS() * 0.9, 0.45 + RS() * 0.6, 0.6 + RS() * 0.5]);
  const airArrows = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(0.26 + s * 0.75, 3.75, 0.05); H.add(g); const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(new THREE.Vector3(-s * u * 0.45, 0.35 * Math.sin(u * 2.4) - u * 0.15, 0)); } mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.03, 8, false), M.white, g, 0, 0, 0, INK * 0.8); const e = pts[16], d = pts[16].clone().sub(pts[14]); const hd = mk(new THREE.ConeGeometry(0.08, 0.17, 12), M.white, g, e.x, e.y, 0, INK * 0.8); hd.rotation.z = Math.atan2(d.y, d.x) - Math.PI / 2; return g; });
  // flame: flat inked tongues in 3 boil variants
  const tongue = (w, h, bend, lift = 0) => { const s = new THREE.Shape(), N = 18, R = [], L = []; for (let i = 0; i <= N; i++) { const y = i / N, x = w * Math.sin(Math.PI * Math.pow(y, 0.55)) * Math.pow(1 - y, 0.42), off = bend * w * y * y; R.push([x + off, y * h + lift]); L.push([-x + off, y * h + lift]); } s.moveTo(R[0][0], R[0][1]); for (let i = 1; i <= N; i++) s.lineTo(R[i][0], R[i][1]); for (let i = N - 1; i >= 1; i--) s.lineTo(L[i][0], L[i][1]); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }); };
  const flame = new THREE.Group(); flame.position.set(0.26, 3.08, 0); H.add(flame);
  const fVar = [0, 1, 2].map((v) => { const g = new THREE.Group(); flame.add(g); const b = [-0.25, 0.18, 0.4][v], j = [1, 1.08, 0.94][v];
    mk(tongue(0.48, 1.95 * j, b), M.fO, g, 0, 0, -0.08); mk(tongue(0.24, 1.05 * j, b - 0.5), M.fO, g, -0.32, 0.12, -0.1).rotation.z = 0.42; mk(tongue(0.22, 0.95 * j, b + 0.5), M.fO, g, 0.32, 0.1, -0.1).rotation.z = -0.4;
    mk(tongue(0.34, 1.45 * j, b * 0.8), M.fM, g, 0, 0, 0); mk(tongue(0.2, 0.92 * j, b * 0.6), M.fI, g, 0, 0, 0.07, INK * 0.7); mk(tongue(0.12, 0.3, 0), M.fB, g, 0, -0.02, 0.12, INK * 0.6); return g; });
  // sparks: inked tetra shards (4 burst slots)
  const tet = new THREE.TetrahedronGeometry(1, 0);
  const spk = IM(tet, M.spark, 160, INK * 0.7); spk.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(480).fill(1), 3); scene.add(spk);
  const spS = [...Array(160)].map(() => [RS() - 0.5, RS(), RS() - 0.5, 0.035 + RS() * 0.05, 0.55 + RS() * 0.55, RS() * 6]);
  // 85% stamp (s8)
  const stampT = textTex(700, 400, (g, w, h) => { g.save(); g.translate(w / 2, h / 2); g.rotate(-0.1); g.fillStyle = "#FFFFFF"; g.fillRect(-300, -150, 600, 300); g.lineWidth = 30; g.strokeStyle = P.ink; g.strokeRect(-300, -150, 600, 300); g.lineWidth = 14; g.strokeStyle = P.red; g.strokeRect(-282, -132, 564, 264); g.font = `italic 900 230px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 32; g.strokeStyle = P.ink; g.strokeText("85%", 0, 10); g.fillStyle = P.red; g.fillText("85%", 0, 10); g.restore(); });
  const stamp = plane(0.3, 0.171, stampT, cam, 0.11, 0.1, -1.6); stamp.renderOrder = 40; stamp.material.depthTest = false;

  // =============== F: ferrocerium rod + chemist ===============
  const F = new THREE.Group(); F.position.set(-14, 0, 0); scene.add(F);
  const rodG = new THREE.CylinderGeometry(0.42, 0.42, 3.2, 40, 64); { const p = rodG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (Math.abs(Math.abs(y) - 1.6) > 0.01) { const k = 1 + 0.035 * Math.sin(y * 34) + 0.02 * Math.sin(Math.atan2(p.getZ(i), p.getX(i)) * 7 + y * 5); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } } rodG.computeVertexNormals(); }
  const rodGrp = new THREE.Group(); rodGrp.position.set(0, 2.1, 0); rodGrp.rotation.set(0.25, 0, -0.85); F.add(rodGrp);
  mk(rodG, M.rod, rodGrp, 0, 0, 0);
  mk(CY(0.47, 0.47, 0.5, 40), M.red, rodGrp, 0, -1.5, 0); mk(new THREE.TorusGeometry(0.2, 0.05, 10, 24), M.dark, rodGrp, 0, -1.82, 0);
  const striker = new THREE.Group(); rodGrp.add(striker);
  mk(BX(0.12, 0.9, 0.7), M.striker, striker, 0.5, 0, 0); mk(BX(0.16, 0.5, 0.74), M.ink, striker, 0.62, 0, 0, 0);
  const tile = (n, sym, name, col) => textTex(420, 500, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); g.lineWidth = 22; g.strokeStyle = P.ink; g.strokeRect(11, 11, w - 22, h - 22); g.fillStyle = P.ink; g.font = `900 70px ${FONT}`; g.textAlign = "left"; g.fillText(n, 38, 96); g.textAlign = "center"; g.font = `900 240px ${FONT}`; g.fillText(sym, w / 2, 336); g.font = `900 66px ${FONT}`; g.fillText(name, w / 2, 444); });
  const tileBox = (tex, x, y, z, rz) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.z = rz; g.scale.setScalar(0.75); F.add(g); mk(BX(0.84, 1.0, 0.14), M.ink, g, 0, 0, 0, 0); const p = plane(0.8, 0.95, tex, g, 0, 0, 0.075); p.material.depthWrite = true; return g; };
  const tFe = tileBox(tile("26", "Fe", "BESI", "#FFB070"), -0.4, 2.45, 0.55, 0.14), tCe = tileBox(tile("58", "Ce", "CERIUM", "#9FE8FF"), 0.5, 1.6, 0.6, -0.12);
  const chem = person({ coat: M.coat, pants: M.pants, skin: M.skin, hair: M.hair, shoe: M.shoe, ink: M.ink });
  chem.G.position.set(-2.6, 0, -0.4); chem.G.scale.setScalar(1.45); chem.G.rotation.y = 0.45; F.add(chem.G);
  const lathe = (pts, seg = 32) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  const flask = new THREE.Group(); chem.armR.el.add(flask); flask.position.set(0, -0.38, 0.05);
  mk(lathe([[0.001, 0], [0.1, 0.0], [0.11, 0.03], [0.11, 0.07], [0.04, 0.17], [0.032, 0.26], [0.044, 0.27]]), HT("#E9F8FF", "#7FB8D8", { rim: 0 }), flask, 0, 0, 0, INK * 0.7);
  mk(lathe([[0.001, 0.005], [0.094, 0.008], [0.1, 0.06], [0.045, 0.13], [0.001, 0.13]]), M.liquid, flask, 0, 0, 0, INK * 0.6);
  const plate = new THREE.Group(); plate.position.set(-3.55, -0.35, 0.5); plate.rotation.y = 0.35; F.add(plate);
  mk(BX(0.07, 1.25, 0.07), M.dark, plate, 0, 0.62, 0);
  const plTex = textTex(1024, 300, (g, w) => { g.fillStyle = "#FFFDF4"; g.fillRect(0, 0, w, 300); g.lineWidth = 20; g.strokeStyle = P.ink; g.strokeRect(10, 10, w - 20, 280); g.fillStyle = P.ink; g.textAlign = "center"; g.font = `900 90px ${FONT}`; g.fillText("CARL AUER VON WELSBACH", w / 2, 130); g.fillStyle = P.mag; g.font = `900 70px ${FONT}`; g.fillText("KIMIAWAN AUSTRIA", w / 2, 235); });
  mk(BX(1.42, 0.46, 0.05), M.ink, plate, 0, 1.4, -0.03, 0); const plP = plane(1.36, 0.4, plTex, plate, 0, 1.4, 0.0); plP.material.depthWrite = true;

  // =============== E: electric lighter cutaway ===============
  const E = new THREE.Group(); E.position.set(14, 0, 0); scene.add(E);
  const ringE = rrShape(BW, BH, 0.24, 0, BY); ringE.holes.push(rrShape(BW - 0.14, BH - 0.14, 0.18, 0, BY));
  mk(EXT(ringE, BD, 0.03), M.ebody, E, 0, 0, -BD); const ebp = mk(EXT(rrShape(BW, BH, 0.24, 0, BY), 0.05, 0.03), M.einner, E, 0, 0, 0, 0); ebp.position.z = -BD - 0.04;
  const liqE = mk(BX(BW - 0.16, 0.95, BD - 0.02), M.liquid, E, 0, 0.6, -BD / 2 - 0.01, 0.006);
  mk(BX(BW + 0.06, 0.12, 2 * BD + 0.06), M.steel, E, 0, 2.66, 0);
  const eHood = new THREE.Group(); eHood.position.set(0.28, 3.0, 0); E.add(eHood); mk(BX(0.66, 0.6, 0.04), M.steel, eHood, 0, 0.02, -0.26); mk(BX(0.04, 0.6, 0.56), M.steel, eHood, 0.33, 0.02, 0);
  mk(CY(0.085, 0.1, 0.36, 24), M.brass, E, 0.2, 2.9, 0);
  const elec = mk(CY(0.03, 0.03, 0.4, 10), M.steel, E, 0.48, 3.0, 0.02, 0.006); elec.rotation.z = 0.5;
  const btn = mk(BX(0.5, 0.18, 0.5), M.yel, E, -0.28, 2.82, 0);
  mk(CY(0.2, 0.2, 1.2, 28), HT("#E6F2FF", "#7E97B8", { alpha: 0.35, rim: 0 }), E, -0.28, 1.95, 0.02, 0);
  const plunger = mk(CY(0.15, 0.15, 0.08, 20), M.steel, E, -0.28, 2.5, 0.02, 0.007);
  const spr = mk(helix(0.12, 6, 1, 0.022), M.copper, E, -0.28, 1.9, 0.02, 0.006);
  const hammer = mk(BX(0.26, 0.18, 0.26), M.dark, E, -0.28, 1.8, 0.02, 0.008);
  const crystal = mk(BX(0.24, 0.26, 0.22), M.crystal, E, -0.28, 1.52, 0.02, 0.008);
  mk(BX(0.32, 0.06, 0.26), M.steel, E, -0.28, 1.36, 0.02, 0.007);
  const wireC = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.14, 1.52, 0.06), new THREE.Vector3(0.2, 1.7, 0.08), new THREE.Vector3(0.4, 2.3, 0.08), new THREE.Vector3(0.42, 2.75, 0.06), new THREE.Vector3(0.55, 3.15, 0.04)]);
  mk(new THREE.TubeGeometry(wireC, 40, 0.028, 8, false), M.red, E, 0, 0, 0, 0.006);
  const pulse = mk(SP(0.07, 14, 10), HT("#FFFFFF", P.yel, { emit: 1, boost: 1.5, rim: 0 }), E, 0, 0, 0, 0.006);
  const bolts = [0, 1, 2].map((s) => { const R = mulberry(900 + s), pts = []; for (let i = 0; i <= 7; i++) { const u = i / 7; pts.push(new THREE.Vector3(0.57 - u * 0.33 + (i && i < 7 ? (R() - 0.5) * 0.08 : 0), 3.18 + (i && i < 7 ? (R() - 0.5) * 0.12 : 0) - u * 0.08, 0.05)); } return mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0), 30, 0.022, 6, false), HT("#FFFFFF", "#8FE8FF", { emit: 1, boost: 1.6, rim: 0 }), E, 0, 0, 0, 0.006); });
  const eStick = plane(0.9, 0.37, stick, E, 0, 0.55, 0.06); eStick.material.depthWrite = true; eStick.rotation.z = -0.05;
  const pressE = mk(arrowG, M.red, E, -0.28, 3.55, 0.25); pressE.rotation.z = Math.PI; pressE.scale.setScalar(1.3);

  // =============== M: magnified spark ===============
  const MG = new THREE.Group(); MG.position.set(-6, 7, -8); scene.add(MG);
  const core = mk(new THREE.IcosahedronGeometry(0.42, 0), HT("#FFF06A", "#FF7A00", { emit: 0.15, boost: 1.0, rim: 0, spec: 1 }), MG, 0, 0, 0);
  const spikes = [...Array(14)].map((_, i) => { const g = new THREE.Group(); g.rotation.set((i * 2.399) % 6.28, (i * 1.7) % 6.28, (i * 0.9) % 6.28); MG.add(g); mk(new THREE.ConeGeometry(0.09, 0.42, 4), i % 2 ? M.fO : M.fM, g, 0, 0.55, 0); return g; });
  const deb = IM(tet, M.spark, 26, INK * 0.7); MG.add(deb);
  const dS = [...Array(26)].map(() => [RS() * 6.28, 0.9 + RS() * 0.9, (RS() - 0.5) * 1.2, 0.04 + RS() * 0.05, 0.3 + RS() * 0.6]);
  const mgas = IM(SP(1, 12, 8), M.gas, 30); MG.add(mgas);
  const mgS = [...Array(30)].map(() => [RS(), (RS() - 0.5) * 1.6, (RS() - 0.5) * 0.8, 0.07 + RS() * 0.06]);

  // =============== camera track (scene + word anchors only): [t, pos, look, roll] ===============
  const k = (t, p, l, roll = 0) => [t, ...p, ...l, roll];
  const camT = track([
    k(0, [-3.6, 1.3, 9.0], [0.0, 2.85, 0], 0.07),
    k(A("s1:logam"), [-3.35, 1.4, 8.5], [-0.02, 2.85, 0], 0.08),
    k(K.s1e - 0.05, [-3.1, 1.5, 8.1], [-0.05, 2.85, 0], 0.09),
    k(K.s2 + 0.4, [-11.9, 1.2, 4.9], [-14.05, 2.05, 0], -0.1),
    k(A("s2:cerium"), [-12.15, 1.35, 4.5], [-14.05, 2.1, 0], -0.12),
    k(A("s2:Campuran") - 0.1, [-12.35, 1.45, 4.3], [-14.1, 2.1, 0], -0.12),
    k(A("s2:Carl") - 0.2, [-15.2, 1.3, 5.6], [-16.4, 1.75, -0.3], 0.04),
    k(K.s2e - 0.05, [-15.45, 1.35, 5.2], [-16.45, 1.78, -0.3], 0.05),
    k(K.s3 + 0.42, [3.3, 0.6, 7.2], [0.25, 1.7, 0], -0.06),
    k(A("s3:dua"), [3.0, 0.7, 6.7], [0.25, 1.7, 0], -0.08),
    k(K.s3e - 0.05, [2.85, 0.8, 6.45], [0.25, 1.72, 0], -0.08),
    k(K.s4 + 0.42, [1.9, 5.0, 3.1], [0.25, 2.8, 0], 0.12),
    k(A("s4:katup"), [1.75, 4.85, 2.9], [0.25, 2.8, 0], 0.12),
    k(A("s4:mendidih") - 0.05, [-1.4, 2.5, 5.6], [0.0, 1.5, 0], -0.1),
    k(K.s4e - 0.05, [-1.55, 2.4, 5.3], [0.0, 1.45, 0], -0.11),
    k(K.s5 + 0.42, [1.9, 3.35, 3.0], [0.2, 3.4, 0], 0.0),
    k(A("s5:bercampur"), [1.75, 3.45, 2.8], [0.2, 3.45, 0], 0.03),
    k(K.s5e - 0.05, [1.7, 3.5, 2.7], [0.2, 3.48, 0], 0.04),
    k(K.s6 + 0.42, [-2.4, 2.65, 2.0], [-0.25, 2.82, 0.05], 0.14),
    k(A("s6:menggores"), [-2.2, 2.7, 1.8], [-0.25, 2.84, 0.05], 0.15),
    k(A("s6:Serpihan") + 0.3, [-2.2, 3.0, 2.6], [-0.1, 3.3, 0.1], 0.1),
    k(A("s6:Pada#2") - 0.05, [-2.1, 3.1, 2.75], [-0.08, 3.4, 0.1], 0.09),
    k(A("s6:Pada#2") + 0.45, [15.5, 2.5, 5.2], [14.0, 2.2, 0], -0.05),
    k(A("s6:memukul"), [15.2, 2.3, 4.3], [13.9, 2.0, 0], -0.07),
    k(A("s6:percikan"), [15.2, 3.0, 3.9], [14.15, 2.7, 0], -0.04),
    k(K.s6e - 0.05, [15.2, 3.05, 3.8], [14.2, 2.75, 0], -0.03),
    k(K.s7 + 0.45, [-4.6, 7.5, -2.6], [-6, 7, -8], 0.0),
    k(A("s7:seribu"), [-5.3, 7.3, -2.8], [-6, 7, -8], 0.1),
    k(A("s7:menyalakan") - 0.25, [-5.6, 7.2, -3.1], [-6, 7, -8], 0.14),
    k(A("s7:menyalakan") + 0.2, [2.6, 1.5, 6.3], [0.15, 3.0, 0], -0.08),
    k(K.s7e - 0.05, [2.45, 1.6, 5.9], [0.15, 3.05, 0], -0.09),
    k(K.s8 + 0.45, [-2.3, 5.9, 5.3], [-0.05, 2.45, 0], 0.06),
    k(A("s8:delapan"), [-2.15, 5.7, 5.0], [-0.05, 2.5, 0], 0.06),
    k(K.end, [-2.7, 6.6, 6.4], [-0.05, 2.3, 0], 0.03),
    k(K.dur, [-2.75, 6.7, 6.5], [-0.05, 2.3, 0], 0.03),
  ]);

  // =============== per-beat burst + giant onomatopoeia (placed from the beat's own camera) ===============
  // [from, to, place time, palette, burst variant, [ [word, at, until, x, y, size, fill, inner] ... ]]
  const beats = [
    [-1, K.s2 - 0.05, K.s1e - 1.5, "hook", 0, [["SKRIIT!", -1, K.s2, -0.02, -0.12, 1.22, P.yel, P.red]]],
    [K.s2, A("s2:Campuran") + 0.2, A("s2:cerium"), "rod", 0, [["SRAKK!", K.s2 + 0.5, A("s2:Campuran") + 0.2, 0.0, -0.12, 1.15, P.yel, P.mag]]],
    [A("s2:Campuran") + 0.2, K.s3 - 0.05, A("s2:Carl") + 1, "chem", 1, [["1903!", A("s2:seribu") - 0.05, K.s3, 0.12, -0.12, 1.0, "#FFFFFF", P.red]]],
    [K.s3, K.s4 - 0.05, A("s3:dua"), "tank", 0, [["TEKAN!", A("s3:tertekan") - 0.05, K.s4, 0.0, -0.12, 1.12, P.yel, P.navy]]],
    [K.s4, A("s4:mendidih") - 0.3, A("s4:katup"), "valve", 0, [["KLIK!", A("s4:ditekan") - 0.05, A("s4:mendidih") - 0.3, 0.05, -0.12, 1.0, "#FFFFFF", P.mag]]],
    [A("s4:mendidih") - 0.3, K.s5 - 0.05, K.s4e - 1, "boil", 2, [["BLUB! BLUB!", A("s4:mendidih") - 0.05, K.s5, 0.0, -0.12, 1.12, "#FFFFFF", P.cyan]]],
    [K.s5, K.s6 - 0.05, A("s5:bercampur"), "jet", 2, [["FSSSHH!", A("s5:menyembur") - 0.05, K.s6, 0.0, 0.1, 1.05, P.cyan, P.ink]]],
    [K.s6, A("s6:Pada#2") + 0.15, A("s6:menggores") + 0.6, "wheel", 0, [["SKRRRT!", A("s6:menggores") - 0.05, A("s6:Pada#2") + 0.15, 0.0, -0.12, 1.18, P.yel, P.red]]],
    [A("s6:Pada#2") + 0.15, K.s7 - 0.05, A("s6:tegangan"), "piezo", 0, [["TAK!", A("s6:memukul") - 0.03, A("s6:percikan") - 0.05, 0.2, 0.06, 0.8, "#FFFFFF", P.mag], ["ZZAP!", A("s6:percikan") - 0.05, K.s7, 0.1, 0.06, 1.0, P.yel, P.cyan]]],
    [K.s7, A("s7:menyalakan") - 0.02, A("s7:seribu"), "spark", 1, [["PANAS!", A("s7:panas") - 0.05, A("s7:menyalakan"), 0.0, -0.12, 1.1, P.yel, P.red]]],
    [A("s7:menyalakan") - 0.02, K.s8 - 0.05, K.s7e - 0.8, "flame", 0, [["FWOOSH!", A("s7:menyalakan"), K.s8, 0.0, -0.12, 1.2, P.yel, P.red]]],
    [K.s8, 1e9, A("s8:delapan"), "safe", 2, [["AMAN!", A("s8:pengaman") - 0.05, 1e9, 0.0, -0.12, 1.0, P.yel, P.mag]]],
  ];
  const bursts = [burstTex(P.yel, P.red, "rgba(237,28,36,.75)", 11), burstTex(P.red, P.yel, "rgba(255,225,0,.7)", 12), burstTex("#FFFFFF", P.yel, "rgba(0,180,240,.6)", 13)];
  const P0 = new THREE.Vector3(), L0 = new THREE.Vector3(), dir = new THREE.Vector3(), rgt = new THREE.Vector3(), upv = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const frameAt = (tm) => { const c = camT(tm); P0.set(c[0], c[1], c[2]); L0.set(c[3], c[4], c[5]); const d = P0.distanceTo(L0); dir.subVectors(L0, P0).normalize(); rgt.crossVectors(dir, Y).normalize(); upv.crossVectors(rgt, dir).normalize(); return d; };
  const place = (m, d, sx, sy, roll) => { const W = 0.387 * d, Hh = 0.689 * d; m.position.copy(P0).addScaledVector(dir, d).addScaledVector(rgt, sx * W).addScaledVector(upv, sy * Hh); m.up.copy(upv); m.lookAt(P0); m.rotateZ(roll); return W; };
  const B = beats.map(([a, b, tm, pal, bv, ws], i) => {
    const d = frameAt(tm);
    const bm = plane(1, 1, bursts[bv], scene); bm.renderOrder = -6; const W = place(bm, d + 2.6, 0.0, 0.02, 0.1 * (i % 3 - 1)); bm.userData.s = W * 1.45; bm.userData.base = bm.quaternion.clone();
    const words = ws.map(([w, wa, wb, sx, sy, sz, fill, inner]) => { const m = plane(1, 1 / 2.4, sfxTex(w, { fill, inner }), scene); m.renderOrder = 30; m.material.depthTest = false; const Ww = place(m, d + 0.9, sx, sy, -0.07 + 0.05 * (i % 2)); m.userData = { s: Ww * sz, a: wa, b: wb }; return m; });
    return { a, b, pal: PAL[pal], bm, words, i };
  });

  // =============== foreground shards riding the camera (edges, middle band) ===============
  const fgG = new THREE.Group(); fgG.position.z = -1.6; cam.add(fgG);
  const RF = mulberry(31), fgS = [...Array(9)].map((_, i) => { const s = i % 2 ? 1 : -1; const m = mk(tet, M.fg, fgG, s * (0.25 + RF() * 0.08), -0.16 + RF() * 0.3, -RF() * 0.3, INK * 0.9); const sz = 0.025 + RF() * 0.035; m.scale.setScalar(sz); return { m, s, sz, ph: RF() * 6, y: m.position.y, x: m.position.x }; });

  const look = new THREE.Vector3(), o3 = new THREE.Object3D(), tc = new THREE.Color(), col = new THREE.Color(), vproj = new THREE.Vector3();
  const wheelEv = [-0.7, A("s1:terbakar") - 0.1, A("s1:tergores") - 0.1, A("s6:menggores") - 0.15, A("s6:Serpihan") - 0.1, A("s7:menyalakan") - 0.3];
  // spark events: [time, origin, main direction, spread]
  const WO = [-0.3, 2.86, 0.18];
  const spEv = [
    [-0.3, WO, [0.9, 1.6, 0.9], 1.2], [A("s1:terbakar"), WO, [0.9, 1.6, 0.9], 1.2], [A("s1:tergores"), WO, [0.9, 1.6, 0.9], 1.2],
    [K.s2 + 0.6, null, [1.6, 0.6, 1.2], 1.0], [A("s2:besi") - 0.1, null, [1.6, 0.6, 1.2], 1.0], [A("s2:cerium") - 0.1, null, [1.6, 0.6, 1.2], 1.0],
    [A("s6:menggores"), WO, [-0.5, 1.5, 1.0], 1.0], [A("s6:menggores") + 0.6, WO, [-0.4, 1.5, 1.0], 1.0], [A("s6:menggores") + 1.2, WO, [-0.4, 1.5, 1.0], 1.0], [A("s6:Serpihan"), WO, [-0.3, 1.4, 1.1], 1.0], [A("s6:Serpihan") + 0.6, WO, [-0.3, 1.4, 1.1], 1.0], [A("s6:seratus"), WO, [-0.3, 1.4, 1.1], 1.0],
    [A("s7:menyalakan") - 0.25, WO, [0.9, 1.6, 0.9], 1.0],
  ];
  const strokeT = spEv.slice(3, 6).map((e) => e[0]);
  const rodTip = new THREE.Vector3();

  return function draw(t) {
    // ---- camera ----
    const c = camT(t);
    let shake = 0; for (const b of [A("s1:tergores"), A("s6:memukul"), A("s7:menyalakan")]) { const u = t - b; if (u > 0 && u < 0.45) shake += 0.03 * (1 - u / 0.45) * Math.sin(u * 70); }
    cam.position.set(c[0] + shake + 0.012 * Math.sin(t * 0.43), c[1] + shake * 0.6 + 0.01 * Math.sin(t * 0.31 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c[6]);
    LU.value.set(-0.85, 0.55, 0.45).applyQuaternion(cam.quaternion).normalize();
    RU.value.set(0.85, 0.25, -0.5).applyQuaternion(cam.quaternion).normalize();
    // ---- beat: backdrop palette, burst, words ----
    let bi = 0; for (let i = 0; i < B.length; i++) if (t >= B[i].a) bi = i;
    const cur = B[bi], nx = B[Math.min(B.length - 1, bi + 1)], bl = bi < B.length - 1 ? ramp(t, nx.a - 0.18, nx.a) : 0;
    bgU.uA.value.set(cur.pal[0]).lerp(tc.set(nx.pal[0]), bl); bgU.uD1.value.set(cur.pal[1]).lerp(tc.set(nx.pal[1]), bl); bgU.uD2.value.set(cur.pal[2]).lerp(tc.set(nx.pal[2]), bl);
    bgU.uR1.value.set(cur.pal[3]); bgU.uR2.value.set(cur.pal[4]); RC.value.set(cur.pal[5]);
    M.fg.uniforms.uColor.value.set(cur.pal[6]); M.fg.uniforms.uShade.value.set(cur.pal[7]);
    bgU.uRot.value = t * 0.35;
    for (const b of B) {
      const on = t >= b.a - 0.05 && t < b.b + 0.05; b.bm.visible = on;
      if (on) { const s = b.bm.userData.s * (0.6 + 0.4 * back(clamp01((t - b.a + 0.05) / 0.3), 2)) * (1 + 0.015 * Math.sin(t * 5)); b.bm.scale.set(s, s, 1); b.bm.quaternion.copy(b.bm.userData.base); b.bm.rotateZ(0.04 * Math.sin(t * 0.7 + b.i)); }
      for (const w of b.words) { const s = on ? popS(t, w.userData.a, w.userData.b, 0.28) : 0; w.visible = s > 0.002; if (w.visible) { const z = w.userData.s * s * (1 + 0.02 * Math.sin(t * 8)); w.scale.set(z, z, 1); } }
    }
    vproj.copy(cur.bm.position).project(cam); bgU.uC.value.set((vproj.x + 1) * 540, (vproj.y + 1) * 960);
    fgS.forEach((f, i) => { f.m.position.set(f.x + 0.01 * Math.sin(t * 0.6 + f.ph), f.y + 0.012 * Math.sin(t * 0.45 + f.ph * 2), f.m.position.z); f.m.rotation.set(t * 0.5 + f.ph, t * 0.37 + i, f.ph); const hide = 1 - win(t, K.s7, A("s7:menyalakan"), 0.2) * 0.0; f.m.scale.setScalar(f.sz * hide); });
    fgG.visible = t < K.end;

    // ---- stations ----
    const heroOn = t < K.s2 + 0.5 || (t > K.s3 - 0.5 && t < A("s6:Pada#2") + 0.5) || t > A("s7:menyalakan") - 0.5;
    H.visible = heroOn; F.visible = t > K.s2 - 0.6 && t < K.s3 + 0.6; E.visible = t > A("s6:Pada#2") - 0.6 && t < K.s7 + 0.6; MG.visible = t > K.s7 - 0.6 && t < A("s7:menyalakan") + 0.4;

    // ---- hero ----
    let wa = 0; for (const e of wheelEv) wa -= 2.2 * eout(clamp01((t - e) / 0.4));
    wheel.rotation.z = wa;
    const curlOn = Math.max(...wheelEv.map((e) => win(t, e - 0.25, e + 0.55, 0.12))) * (t < K.s2 || (t > K.s6 && t < A("s6:Pada#2")) || t > A("s7:menyalakan") - 0.8 ? 1 : 0);
    curl.visible = curlOn > 0.02; curl.scale.setScalar(Math.max(0.001, curlOn)); curl.rotation.z = -0.5 * curlOn;
    const cut = ramp(t, K.s3 + 0.15, K.s3 + 0.75) * (1 - ramp(t, K.s5 - 0.25, K.s5 + 0.15));
    front.visible = cut < 0.98; front.position.set(1.4 * cut, 0.3 * cut, 3.2 * cut); front.rotation.y = 1.1 * cut;
    const pr = ramp(t, A("s4:ditekan") - 0.2, A("s4:ditekan")) * (1 - ramp(t, K.s5 + 0.1, K.s5 + 0.4)) + win(t, A("s7:menyalakan") - 0.15, K.s8 - 0.1, 0.12);
    lever.rotation.z = -0.1 * Math.min(1, pr);
    const prOn = win(t, A("s4:ditekan") - 0.35, A("s4:mendidih") - 0.3, 0.15);
    press.visible = prOn > 0.02; press.position.y = 3.55 + 0.2 * (1 - ramp(t, A("s4:ditekan") - 0.3, A("s4:ditekan"))) ; press.scale.setScalar(1.3 * Math.max(0.001, prOn));
    const vOpen = Math.max(ramp(t, A("s4:katup") - 0.1, A("s4:katup") + 0.25) * (1 - ramp(t, K.s6 - 0.3, K.s6)), pr > 0.5 && t > K.s7 ? 1 : 0);
    nozzle.position.y = 2.74 + 0.05 * vOpen;
    const L = 2.05 - 0.15 * ramp(t, A("s4:mendidih"), K.s5);
    liquid.scale.y = L - 0.2; liquid.position.y = 0.2 + (L - 0.2) / 2; liqTop.position.y = L + 0.01 + 0.012 * Math.sin(t * 9) * ramp(t, A("s4:mendidih") - 0.3, A("s4:mendidih"));
    // gauge + squeeze arrows
    const gOn = win(t, K.s3 + 0.3, K.s4e, 0.3);
    gauge.visible = gpipe.visible = gOn > 0.01; gauge.scale.setScalar(Math.max(0.001, back(gOn)));
    gauge.lookAt(cam.position.x, gauge.position.y + 0.2, cam.position.z);
    const gv = 0.0 + 2.15 * ramp(t, A("s3:tertekan") - 0.2, A("s3:dua") + 0.15) - 1.25 * ramp(t, A("s4:turun") - 0.1, A("s4:turun") + 0.6);
    needle.rotation.z = -((-130 + (260 * gv) / 3) * Math.PI) / 180 + 0.02 * Math.sin(t * 13) * gOn;
    const sq = win(t, A("s3:tertekan") - 0.2, K.s4 - 0.1, 0.2);
    pArrows.forEach((m, i) => { m.visible = sq > 0.02; m.scale.setScalar(Math.max(0.001, sq)); m.position.x = m.userData.x * (1.05 + 0.08 * Math.sin(t * 6 + i)); });
    // boiling bubbles on the cut face
    const boil = ramp(t, A("s4:mendidih") - 0.4, A("s4:mendidih")) * (1 - ramp(t, K.s5 - 0.2, K.s5 + 0.2));
    bubS.forEach((b, i) => { const u = (t * b[2] + b[1]) % 1, on = i < 46 * boil; o3.position.set(b[0] * (1 - u * 0.15), 0.3 + u * (L - 0.25), 0.03 + b[4]); o3.rotation.set(0, 0, 0); o3.scale.setScalar(on ? b[3] * (0.6 + 0.6 * u) : 0.0001); o3.updateMatrix(); bub.setMatrixAt(i, o3.matrix); });
    bub.instanceMatrix.needsUpdate = true;
    // gas jet + air
    const jet = ramp(t, A("s5:menyembur") - 0.3, A("s5:menyembur") + 0.15) * (1 - ramp(t, K.s6 - 0.3, K.s6)) + 0.4 * ramp(t, A("s4:katup"), A("s4:katup") + 0.4) * (1 - ramp(t, K.s5 - 0.2, K.s5 + 0.2));
    gS.forEach((d, i) => { const u = (t * 0.75 * d[3] + d[0]) % 1, on = i < 60 * jet, sw = 0.08 + 0.38 * u; o3.position.set(0.26 + d[1] * sw * 0.6 + 0.04 * Math.sin(t * 3 + d[4]) * u, 3.12 + u * 1.75, d[2] * sw * 0.5); o3.scale.setScalar(on ? (0.03 + 0.075 * u) * (1 - Math.pow(u, 5)) : 0.0001); o3.updateMatrix(); gasI.setMatrixAt(i, o3.matrix); });
    gasI.instanceMatrix.needsUpdate = true;
    const air = ramp(t, A("s5:bercampur") - 0.5, A("s5:bercampur")) * (1 - ramp(t, K.s6 - 0.3, K.s6));
    aS.forEach((d, i) => { const u = (t * 0.3 * d[4] + d[0]) % 1, on = i < 40 * air, rr = 0.95 * (1 - u) + 0.12 * u, a = d[1] + u * 3.2; o3.position.set(0.26 + Math.cos(a) * rr, d[2] + u * 0.7, Math.sin(a) * rr * 0.5); o3.scale.setScalar(on ? 0.06 * d[3] * Math.sin(Math.PI * Math.min(1, u * 1.15)) : 0.0001); o3.updateMatrix(); airI.setMatrixAt(i, o3.matrix); });
    airI.instanceMatrix.needsUpdate = true;
    airArrows.forEach((g, i) => { const s = popS(t, A("s5:bercampur") - 0.1 + i * 0.12, K.s6 - 0.1, 0.25); g.visible = s > 0.002; g.scale.setScalar(Math.max(0.001, s)); });
    // flame
    const fl = ramp(t, A("s7:menyalakan") + 0.02, A("s7:menyalakan") + 0.25) * (1 - ramp(t, K.s8 + 0.1, K.s8 + 0.45));
    flame.visible = fl > 0.01; const vI = Math.floor(t * 11) % 3; fVar.forEach((g, i) => (g.visible = i === vI));
    flame.scale.set(Math.max(0.001, fl) * (1 + 0.04 * Math.sin(t * 23)), Math.max(0.001, fl) * (1 + 0.05 * Math.sin(t * 17)), 1);
    flame.rotation.y = Math.atan2(cam.position.x - 0.26, cam.position.z);
    // guard highlight + stamp (s8)
    const gh = win(t, A("s8:pengaman") - 0.1, K.end, 0.2) * (0.75 + 0.25 * Math.sin(t * 8));
    M.guard.uniforms.uColor.value.set("#C9D6EA").lerp(tc.set(P.yel), gh); M.guard.uniforms.uShade.value.set("#3A4766").lerp(tc.set(P.yelS), gh);
    guard.visible = t > K.s8 - 0.3;
    { const a8 = A("s8:delapan"), u = (t - a8) / 0.18; stamp.visible = t >= a8 && t < K.end + 0.3; stamp.rotation.set(0, 0, 0.08); stamp.scale.setScalar(t < a8 ? 0.001 : 1 + 1.4 * (1 - eout(u))); }

    // ---- sparks ----
    const strk = strokeT.reduce((m, s) => (t >= s - 0.1 ? s : m), -1e9);
    const su = clamp01((t - strk + 0.1) / 0.5);
    striker.position.y = 0.9 - 1.6 * eout(su); striker.visible = F.visible;
    rodGrp.updateMatrixWorld(); rodTip.set(0.45, striker.position.y, 0.1).applyMatrix4(rodGrp.matrixWorld);
    for (let s = 0; s < 4; s++) {
      let ev = null; spEv.forEach((e, j) => { if (j % 4 === s && t >= e[0] && t < e[0] + 1.1) ev = e; });
      for (let q = 0; q < 40; q++) {
        const i = s * 40 + q, d = spS[i];
        if (!ev || t - ev[0] > d[4]) { o3.scale.setScalar(0.0001); o3.position.set(0, -50, 0); }
        else {
          const a = t - ev[0], u = a / d[4], o = ev[1] || [rodTip.x, rodTip.y, rodTip.z], v = ev[2], sp = ev[3];
          o3.position.set(o[0] + (v[0] + d[0] * 2.2 * sp) * a, o[1] + (v[1] * (0.6 + d[1] * 0.8)) * a - 2.2 * a * a, o[2] + (v[2] + d[2] * 2 * sp) * a);
          o3.rotation.set(a * 9 + d[5], a * 7, d[5]); o3.scale.setScalar(d[3] * Math.pow(1 - u, 0.5) * (ev[1] && ev[0] > K.s6 && ev[0] < K.s7 ? 0.7 : 1));
          if (u < 0.1) col.setRGB(0.62, 0.66, 0.74); else if (u < 0.45) col.setRGB(1, 1, 0.8); else if (u < 0.75) col.setRGB(1, 0.72, 0.2); else col.setRGB(1, 0.35, 0.12);
          spk.setColorAt(i, col);
        }
        o3.updateMatrix(); spk.setMatrixAt(i, o3.matrix);
      }
    }
    spk.instanceMatrix.needsUpdate = true; spk.instanceColor.needsUpdate = true;

    // ---- F ----
    const fe = popS(t, A("s2:besi") - 0.1, 1e9, 0.3), ce = popS(t, A("s2:cerium") - 0.1, 1e9, 0.3);
    tFe.scale.setScalar(0.75 * Math.max(0.001, fe)); tCe.scale.setScalar(0.75 * Math.max(0.001, ce));
    tFe.rotation.y = 0.25 + 0.1 * Math.sin(t * 0.9); tCe.rotation.y = -0.3 + 0.1 * Math.sin(t * 0.8 + 1);
    const wave = win(t, A("s2:Carl") - 0.2, K.s2e, 0.3);
    chem.armR.sh.rotation.set(-0.95 - 0.3 * wave + 0.05 * Math.sin(t * 1.4), 0, 0.2); chem.armR.el.rotation.set(-1.0, 0, 0);
    chem.armL.sh.rotation.set(-0.3, 0, -0.2); chem.armL.el.rotation.set(-1.25, 0, 0);
    chem.legL.hip.rotation.x = -0.12; chem.legL.knee.rotation.x = 0.2; chem.legR.hip.rotation.x = 0.06; chem.legR.knee.rotation.x = 0.08;
    chem.head.rotation.set(0.05 * Math.sin(t * 0.9), 0.15 + 0.1 * Math.sin(t * 0.5), 0);

    // ---- E ----
    const ep = ramp(t, A("s6:palu") - 0.25, A("s6:memukul") - 0.05), strike = A("s6:memukul"), back2 = ramp(t, A("s6:percikan") + 0.6, K.s6e);
    btn.position.y = 2.82 - 0.12 * ep * (1 - back2); plunger.position.y = 2.5 - 0.3 * ep * (1 - back2);
    const hy2 = t >= strike ? 1.8 - 0.1 * eout(clamp01((t - strike) / 0.06)) + 0.04 * ramp(t, strike + 0.3, strike + 1) : 1.8;
    hammer.position.y = hy2; const top = plunger.position.y - 0.05, bot = hy2 + 0.1; spr.position.y = bot; spr.scale.y = Math.max(0.05, top - bot);
    const pE = win(t, A("s6:palu") - 0.4, A("s6:memukul") + 0.1, 0.12); pressE.visible = pE > 0.02; pressE.scale.setScalar(1.3 * Math.max(0.001, pE));
    const glow = win(t, strike, A("s6:percikan") + 0.6, 0.1) * (0.7 + 0.3 * Math.sin(t * 30));
    M.crystal.uniforms.uEmit.value = glow; M.crystal.uniforms.uBoost.value = 1 + 0.45 * glow;
    const pv = ramp(t, A("s6:tegangan") - 0.2, A("s6:percikan")); pulse.visible = pv > 0.01 && pv < 0.999; pulse.position.copy(wireC.getPoint(Math.min(1, pv)));
    const arc = win(t, A("s6:percikan") - 0.05, K.s6e + 0.2, 0.03); const bI = Math.floor(t * 15) % 3; bolts.forEach((b, i) => { b.visible = arc > 0.5 && i === bI; });

    // ---- M ----
    const heat = 1 + 0.25 * ramp(t, A("s7:panas") - 0.2, A("s7:panas") + 0.3) + 0.3 * ramp(t, A("s7:seribu") - 0.2, A("s7:seribu") + 0.4);
    core.scale.setScalar(heat * (1 + 0.05 * Math.sin(t * 19))); core.rotation.set(t * 0.7, t * 0.5, 0);
    spikes.forEach((g, i) => g.scale.setScalar(heat * (0.75 + 0.35 * Math.sin(t * 7 + i * 1.7))));
    MG.rotation.z = t * 0.25; MG.position.y = 7 + 0.05 * Math.sin(t * 1.7);
    dS.forEach((d, i) => { const a = d[0] + t * d[4], rr = d[1] * heat; o3.position.set(Math.cos(a) * rr, Math.sin(a) * rr * 0.85, d[2]); o3.rotation.set(t * 3 + i, t * 2, 0); o3.scale.setScalar(d[3]); o3.updateMatrix(); deb.setMatrixAt(i, o3.matrix); });
    deb.instanceMatrix.needsUpdate = true;
    const ign = ramp(t, A("s7:Cukup") - 0.1, A("s7:Cukup") + 0.3);
    mgS.forEach((d, i) => { const u = (t * 0.25 + d[0]) % 1, x = 2.2 - u * 1.8; o3.position.set(x, d[1] * (0.5 + 0.5 * u), d[2]); o3.scale.setScalar(ign > 0.01 ? d[3] * (u > 0.85 ? (1 - u) / 0.15 : 1) * ign : 0.0001); o3.updateMatrix(); mgas.setMatrixAt(i, o3.matrix); });
    mgas.instanceMatrix.needsUpdate = true;

    comp.render();
  };
}
