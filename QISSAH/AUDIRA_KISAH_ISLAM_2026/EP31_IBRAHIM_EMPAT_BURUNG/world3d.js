// EP31 IBRAHIM DAN EMPAT BURUNG. UKIYOFORGE: a Japanese woodblock-print (ukiyo-e) valley built in 3D.
// Flat toon-banded colour, inverted-hull ink outlines, bokashi gradients on hills/sky/ridges, layered far ridges that
// fade into washi-cream mist, horizontal kasumi mist bands, a vermilion sun disk, and a washi paper pass on top.
// One connected world (camera looks "north", -z):
//   valley floor with one lantern on a flat stone (origin), a still pond to the south-west, an ink-carved stone marker,
//   four hills around the valley (E, N, W, S), a distant ziggurat (the king's city) far to the north-west,
//   three ring ridgelines at 80/120/170 and the sky dome.
// Depiction: Nabi Ibrahim never appears; his presence is the lantern (its glow, its rising light motes, its call rings).
// Allah and angels are never depicted. The four birds are generic stylised birds (no species). There is no cutting and
// no blood: a gold mist band sweeps over the perched birds and only feathers lift out of it; the feathers (four colours,
// mixed) fly to the four hilltops; called back, they fly home in arcs, sort by colour and become four whole birds.
// Every value is a pure function of t (seek-safe, no Math.random).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, back } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";

const mix = (a, b, u) => a + (b - a) * u;
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }

// palette (sRGB hex)
const INDIGO = 0x24345a, BRICK = 0xb8473a, WASHI = 0xefe3c8, MOSS = 0x6f7f4e, GOLD = 0xe2a84b, INK = 0x1b2133;
const BIRDC = [INDIGO, BRICK, MOSS, GOLD];
const BIRDLIGHT = ["#3c5488", "#d0634f", "#8c9c63", "#f0c370"];

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe9dcc0, fog: 0.0062, exp: 1.0, bloom: [0.22, 0.35, 0.9], shadow: false });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  // NaN guard before bloom: a single NaN/Inf pixel would be smeared over the whole frame
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;float f(float x){return (x<40.0&&x>=0.0)?x:(x>=40.0?40.0:0.0);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(f(c.r),f(c.g),f(c.b),1.0);}" }), 1);
  // washi paper pass (after output, sRGB): long fibres, fine tooth, a top ichimonji-bokashi band
  comp.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 px=vUv*vec2(1080.,1920.);
float f1=n(px*vec2(.018,.16));float f2=n(px*vec2(.17,.02)+9.);
float fib=smoothstep(.78,.96,f1)*.6+smoothstep(.82,.97,f2)*.5;
float tooth=n(px*.55)*.6+n(px*1.9)*.4;
vec3 col=c.rgb*(.93+.09*tooth);
col=mix(col,vec3(.96,.92,.83),fib*.10);
float top=smoothstep(.86,1.,vUv.y);col=mix(col,vec3(.14,.20,.34),top*.42);
gl_FragColor=vec4(clamp(col,0.,1.),1.);}` }));
  cam.fov = 38; cam.near = 0.05; cam.far = 1200; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const C = (h) => new THREE.Color(h);
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), tq = new THREE.Quaternion(), tq2 = new THREE.Quaternion();
  const dummy = new THREE.Object3D();

  // ---------- timing
  const tPer = A("s1:perlihatkan"), tDoa = A("s2:berdoa"), tMati = A("s2:mati"), tSeb = A("s2:Sebagian"), tRaja = A("s2:raja");
  const tTen = A("s3:tenang"), tYak = A("s3:keyakinannya");
  const tAmb = A("s4:ambillah"), tBur = A("s4:burung"), tCin = A("s4:cincanglah"), tLet = A("s4:Letakkan"), tBuk = A("s4:bukit"), tLain = A("s4:lain");
  const tPang = A("s5:panggillah"), tMem = A("s5:memanggil"), tKem = A("s5:kembali"), tHid = A("s5:hidup");
  const tIbr6 = A("s6:Ibrahim"), tYang6 = A("s6:Yang"), tPen = A("s6:penjuru"), tBang = A("s6:membangkitkan");
  const tPara = A("s7:Para"), tTanya = A("s8:Pertanyaan"), tKis = A("s8:Kisah");
  const tHide = tCin + 0.25;        // birds disappear behind the mist band
  const tForm = tKem - 0.1;         // feathers become birds
  const tRet = tMem + 0.45;         // feathers leave the hills
  const tLand7 = K.s6e - 0.4;       // birds come down to the stone for s7

  // ---------- toon + ink helpers
  const grad = new THREE.DataTexture(new Uint8Array([95, 95, 95, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: grad, ...extra });
  const inkMats = {};
  const inkMat = (w, col = INK) => {
    const k = w + ":" + col;
    if (!inkMats[k]) inkMats[k] = new THREE.ShaderMaterial({ uniforms: { w: { value: w }, col: { value: C(col) } }, side: THREE.BackSide,
      vertexShader: "uniform float w;void main(){vec3 p=position+normalize(normal)*w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}",
      fragmentShader: "uniform vec3 col;void main(){gl_FragColor=vec4(col,1.);}" });
    return inkMats[k];
  };
  const hull = (m, w, col) => { const h = new THREE.Mesh(m.geometry, inkMat(w, col)); m.add(h); return h; };

  // ---------- lights
  const SUN = new THREE.Vector3(0.32, 0.06, -1).normalize();
  const hemi = new THREE.HemisphereLight(0xfff1d6, 0x7d8a5c, 1.55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe1b4, 1.7); key.position.set(30, 22, -40); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fb0d8, 0.5); fill.position.set(-20, 15, 30); scene.add(fill);

  // ---------- sky dome: indigo top band, pale middle, cream-gold horizon with dawn glow toward the sun
  const skyU = { uSun: { value: SUN.clone() }, uDawn: { value: 0.5 } };
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform vec3 uSun;uniform float uDawn;varying vec3 vD;
vec3 L(vec3 c){return pow(c,vec3(2.2));}
void main(){vec3 d=normalize(vD);float e=d.y;
vec3 hor=L(vec3(.94,.87,.72)),mid=L(vec3(.80,.81,.79)),top=L(vec3(.19,.27,.44));
vec3 c=mix(hor,mid,smoothstep(.0,.16,e));c=mix(c,top,smoothstep(.16,.48,e));
float sa=atan(uSun.x,-uSun.z),da=atan(d.x,-d.z),dd=da-sa;dd=mod(dd+3.14159,6.28318)-3.14159;
float g=exp(-dd*dd/.45)*exp(-max(e,0.)*5.);
c+=uDawn*L(vec3(.96,.60,.28))*g*.55;
float st=smoothstep(.05,.0,abs(e-.21))*.0+smoothstep(.012,.0,abs(e-.30))*.08;c=mix(c,top,st);
if(e<0.)c=hor;gl_FragColor=vec4(c,1.);}` })));
  // vermilion sun disk (rises in s7-s8)
  const sunM = new THREE.MeshBasicMaterial({ color: C(0xd2503a), fog: false, transparent: true, opacity: 1 });
  const sun = new THREE.Mesh(new THREE.CircleGeometry(30, 64), sunM); scene.add(sun);

  // ---------- ground with bokashi patches
  {
    const g = new THREE.PlaneGeometry(520, 520, 180, 180); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    const cA = C(0xb7b285), cB = C(0xd9cfa7), cC = C(0x8e9667), cFar = C(0xd8cfb0);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z);
      const n = fbm(x * 0.09 + 3, z * 0.09);
      const c = cA.clone().lerp(cB, clamp01((n - 0.42) * 3)).lerp(cC, clamp01((0.38 - n) * 4));
      c.lerp(cFar, clamp01((rr - 40) / 80));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      p.setY(i, rr > 26 ? (rr - 26) * 0.05 * fbm(x * 0.05, z * 0.05) : 0);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, toon(0xffffff, { vertexColors: true })));
  }

  // ---------- four hills (E, N, W, S): bokashi from pale skirt to dark moss crown, ink hull
  const HILLS = [
    { x: 9.6, z: -1.5, h: 6.6, R: 5.2, a: 0 },
    { x: 1.0, z: -15, h: 8.6, R: 6.4, a: 1 },
    { x: -10.2, z: -2.5, h: 7.0, R: 5.4, a: 2 },
    { x: -2.5, z: 13.8, h: 5.0, R: 5.0, a: 3 },
  ];
  const yHill = (H, dx, dz) => { const q = Math.min(1, Math.hypot(dx, dz) / H.R); return H.h * Math.pow(1 - Math.pow(q, 2.2), 1.6); };
  HILLS.forEach((H, hi) => {
    const prof = [];
    for (let i = 0; i <= 28; i++) { const q = 1 - i / 28; prof.push(new THREE.Vector2(Math.max(0.001, q * H.R), H.h * Math.pow(1 - Math.pow(q, 2.2), 1.6))); }
    const g = new THREE.LatheGeometry(prof, 72);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    const c0 = C(0xd3cc9f), c1 = C(MOSS), c2 = C(0x2f3b2a);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ang = Math.atan2(z, x), rq = Math.hypot(x, z) / H.R;
      const k = 1 + 0.16 * (fbm(Math.cos(ang) * 1.6 + hi * 7, Math.sin(ang) * 1.6) - 0.5) * 2 * rq;
      p.setX(i, x * k); p.setZ(i, z * k);
      const f = y / H.h;
      const c = f < 0.45 ? c0.clone().lerp(c1, f / 0.45) : c1.clone().lerp(c2, (f - 0.45) / 0.55);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, toon(0xffffff, { vertexColors: true }));
    m.position.set(H.x, -0.02, H.z); scene.add(m); hull(m, 0.09);
  });

  // ---------- pines (ukiyo pine: leaning trunk + flat layered canopies, ink outlined)
  const trunkM = toon(0x4a3426), pineM = toon(0x34432d);
  function pine(x, z, s, lean) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); G.rotation.y = lean * 3;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.13, 2.2, 8), trunkM); tr.position.set(0.15 * lean, 1.1, 0); tr.rotation.z = -0.15 * lean; G.add(tr); hull(tr, 0.025);
    [[0.0, 2.1, 0.75], [0.35 * lean, 1.6, 0.6], [-0.3 * lean, 1.25, 0.5]].forEach(([cx, cy, cr]) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(cr, 16, 10), pineM); c.scale.set(1.3, 0.32, 1); c.position.set(cx, cy, 0); G.add(c); hull(c, 0.05);
    });
    scene.add(G); return G;
  }
  HILLS.forEach((H, hi) => {
    for (let k = 0; k < 2; k++) {
      const a = hi * 1.7 + k * 2.4 + 0.6, rr = H.R * (0.5 + 0.12 * k);
      const dx = Math.cos(a) * rr, dz = Math.sin(a) * rr;
      pine(H.x + dx, H.z + dz, 1.1 - 0.15 * k, k ? 1 : -1).position.y = yHill(H, dx, dz) - 0.15;
    }
  });
  pine(-6.5, -7, 1.3, 1); pine(7.5, 6.5, 1.15, -1); pine(-7.8, 5.2, 1.0, 1);

  // ---------- far ridgelines: rings that fade into mist (bokashi), with an ink ribbon along the crest
  [[80, 13, 0x4c5d4c, 3.1], [120, 22, 0x52638a, 5.7], [170, 34, 0x8492b0, 9.3]].forEach(([R, Hm, hex, sd]) => {
    const N = 360, pos = [], col = [], idx = [], ipos = [], iidx = [];
    const top = C(hex), bot = C(0xe6dbc0);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2, cx = Math.cos(a) * R, cz = Math.sin(a) * R;
      const hgt = Hm * (0.35 + 0.65 * fbm(Math.cos(a) * 3 + sd, Math.sin(a) * 3 + sd)) + Hm * 0.25 * Math.pow(Math.abs(Math.sin(a * 3 + sd)), 6);
      pos.push(cx, -2, cz, cx, hgt, cz); col.push(bot.r, bot.g, bot.b, top.r, top.g, top.b);
      ipos.push(cx, hgt - 0.35 - R * 0.002, cz, cx, hgt + 0.05, cz);
      if (i < N) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); iidx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })));
    const gi = new THREE.BufferGeometry(); gi.setAttribute("position", new THREE.Float32BufferAttribute(ipos, 3)); gi.setIndex(iidx);
    scene.add(new THREE.Mesh(gi, new THREE.MeshBasicMaterial({ color: C(hex).multiplyScalar(0.55), side: THREE.DoubleSide })));
  });

  // ---------- the king's distant city (stepped ziggurat silhouette, hazed by distance)
  {
    const zM = toon(0x5f6886), G = new THREE.Group(); G.position.set(-36, 0, -58); G.rotation.y = 0.5;
    [[15, 2.4], [11, 2.2], [7.6, 2.1], [4.8, 1.9], [2.6, 1.6]].reduce((y, [s, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(s, h, s), zM); b.position.y = y + h / 2; G.add(b); hull(b, 0.12, 0x2a3048); return y + h; }, 0);
    scene.add(G);
  }

  // ---------- kasumi mist bands (washi-cream / gold, rounded ends); billboards that keep their yaw toward the camera
  const bandTex = (c1, c2) => canvasTex(1024, 128, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    x.fillStyle = gr; x.beginPath(); x.roundRect(6, 14, w - 12, h - 28, (h - 28) / 2); x.fill();
    x.strokeStyle = "rgba(120,90,50,.35)"; x.lineWidth = 3; x.stroke();
  });
  const bandT1 = bandTex("#f5ead0", "#ead7ae"), bandT2 = bandTex("#f3d79a", "#e2b469");
  const BANDS = [];
  const bandMat = (tx, o) => new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: o, depthWrite: false, fog: false });
  const rb = mulberry(311);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rb() * 0.4, R = 26 + rb() * 34, w = 16 + rb() * 18;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 8), bandMat(i % 3 ? bandT1 : bandT2, 0.85));
    m.userData = { a, R, y: 2.2 + rb() * 4.5, sp: 0.004 + rb() * 0.004 }; scene.add(m); BANDS.push(m);
  }
  { // band across the ziggurat base
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 4.2), bandMat(bandT1, 0.9)); m.userData = { fixed: new THREE.Vector3(-30, 2.4, -50) }; scene.add(m); BANDS.push(m);
  }
  // the veil that sweeps over the perched birds at "cincanglah" (two staggered gold bands)
  const VEIL = [0, 1].map((k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.95), bandMat(k ? bandT1 : bandT2, 0)); m.scale.y = 0.7; m.renderOrder = 5; scene.add(m); return m; });

  // ---------- lantern on a flat stone (Ibrahim's presence)
  const stoneM = toon(0xb9b398);
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.6, 0.35, 40), stoneM); stone.position.y = 0.175; scene.add(stone); hull(stone, 0.03);
  const LANT = new THREE.Group(); LANT.position.set(0, 0.35, 0); scene.add(LANT);
  const woodM = toon(0x3a2a1e);
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, 0.08, 24), woodM); lb.position.y = 0.04; LANT.add(lb); hull(lb, 0.012);
  const paperTex = canvasTex(256, 128, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffd88a"); gr.addColorStop(0.5, "#fff1c8"); gr.addColorStop(1, "#ffcf78");
    x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = "rgba(70,40,20,.55)";
    for (let i = 0; i < 8; i++) x.fillRect(i * 32, 0, 3, h); x.fillRect(0, 10, w, 3); x.fillRect(0, h - 13, w, 3);
  });
  const paperM = new THREE.MeshBasicMaterial({ map: paperTex, color: C(0xffffff) });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.46, 24), paperM); body.position.y = 0.31; LANT.add(body); hull(body, 0.012);
  const capM = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.16, 24), woodM); capM.position.y = 0.62; LANT.add(capM); hull(capM, 0.012);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 6, 20, Math.PI), woodM); handle.position.y = 0.7; LANT.add(handle);
  const glowTex = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,236,190,1)"); g.addColorStop(0.3, "rgba(255,200,120,.5)"); g.addColorStop(1, "rgba(255,170,80,0)"); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  glow.position.set(0, 0.66, 0); scene.add(glow);
  const lampL = new THREE.PointLight(0xffc070, 3, 9, 1.4); lampL.position.set(0, 0.75, 0); scene.add(lampL);

  // ---------- stone marker with the AUDIRA inscription (ink letters + red seal), beside the path
  {
    const mk = new THREE.Group(); mk.position.set(2.15, 0, 3.6); mk.rotation.y = -0.18; scene.add(mk);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.55, 0.2), toon(0x8f8b7a)); st.position.y = 0.775; mk.add(st); hull(st, 0.02);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.26), toon(0x6f6a5c)); cap.position.y = 1.59; mk.add(cap); hull(cap, 0.015);
    const plate = canvasTex(160, 512, (x, w, h) => {
      x.fillStyle = "#efe3c8"; x.fillRect(0, 0, w, h); x.strokeStyle = "#1b2133"; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
      x.fillStyle = "#1b2133"; x.font = "700 62px Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle";
      "AUDIRA".split("").forEach((ch, i) => x.fillText(ch, w / 2, 52 + i * 62));
      x.fillStyle = "#b8473a"; x.fillRect(w / 2 - 30, h - 92, 60, 60); x.fillStyle = "#efe3c8"; x.font = "700 30px serif"; x.fillText("A", w / 2, h - 61);
    });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.96), new THREE.MeshBasicMaterial({ map: plate })); pl.position.set(0, 0.85, 0.101); mk.add(pl);
  }

  // ---------- pond (indigo bokashi + ripple lines), lantern reflection, ripple rings
  const POND = new THREE.Vector3(-0.9, 0.03, 3.7);
  const waterTex = canvasTex(512, 512, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); g.addColorStop(0, "#5a77a6"); g.addColorStop(0.7, "#2f4774"); g.addColorStop(1, "#24345a");
    x.fillStyle = g; x.fillRect(0, 0, w, w); x.strokeStyle = "rgba(239,227,200,.32)"; x.lineWidth = 3;
    for (let i = 0; i < 9; i++) { x.beginPath(); const yy = 90 + i * 40; for (let k = 0; k <= 40; k++) { const xx = (k / 40) * w; x.lineTo(xx, yy + Math.sin(k * 0.9 + i) * 5); } x.stroke(); }
  });
  const pond = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshBasicMaterial({ map: waterTex })); pond.rotation.x = -Math.PI / 2; pond.position.copy(POND); scene.add(pond);
  const pondRim = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.3, 64), new THREE.MeshBasicMaterial({ color: C(INK) })); pondRim.rotation.x = -Math.PI / 2; pondRim.position.copy(POND).setY(0.032); scene.add(pondRim);
  const reflTex = canvasTex(64, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,220,150,.95)"); g.addColorStop(1, "rgba(255,200,120,0)"); x.fillStyle = g; x.beginPath(); x.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 7); x.fill(); });
  const refl = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.6), new THREE.MeshBasicMaterial({ map: reflTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  refl.rotation.x = -Math.PI / 2; refl.position.set(-0.35, 0.045, 2.35); scene.add(refl);
  const ringTex = canvasTex(256, 256, (x, w) => { x.strokeStyle = "rgba(239,227,200,.95)"; x.lineWidth = 5; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 6, 0, 7); x.stroke(); x.lineWidth = 2; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 22, 0, 7); x.stroke(); });
  const RIP = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.position.set(-1.2, 0.05, 4.1); scene.add(m); return m; });

  // ---------- call rings across the valley floor (gold ink), from the lantern to the hills
  const CALLS = [tPang + 0.1, tMem + 0.1];
  const CRING = [];
  for (let c = 0; c < 2; c++) for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.955, 1, 160), new THREE.MeshBasicMaterial({ color: C(GOLD), transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.08; m.userData = { t0: CALLS[c] + k * 0.28 }; scene.add(m); CRING.push(m);
  }

  // ---------- prayer motes rising from the lantern (s2)
  const NP = 110, PR = [], rp = mulberry(77);
  for (let i = 0; i < NP; i++) PR.push([rp(), rp(), rp()]);
  const motes = pts(scene, NP, { size: 0.16, add: true });

  // ---------- grass strokes (static instanced ink ticks)
  {
    const g = new THREE.PlaneGeometry(0.05, 0.32); g.translate(0, 0.16, 0);
    const N = 900, im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: C(0x4b5636), side: THREE.DoubleSide }), N);
    const rg = mulberry(5); let n = 0;
    while (n < N) {
      const a = rg() * Math.PI * 2, rr = 2.0 + rg() * 24, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (Math.hypot(x - POND.x, z - POND.z) < 2.6) continue;
      if (HILLS.some((H) => Math.hypot(x - H.x, z - H.z) < H.R * 0.95)) continue;
      dummy.position.set(x, 0, z); dummy.rotation.set((rg() - 0.5) * 0.6, rg() * 6.28, (rg() - 0.5) * 0.7); dummy.scale.setScalar(0.6 + rg() * 0.9); dummy.updateMatrix();
      im.setMatrixAt(n++, dummy.matrix);
    }
    im.frustumCulled = false; scene.add(im);
  }

  // ---------- flowers that bloom across the valley at "membangkitkan"
  const flTex = canvasTex(128, 128, (x, w) => {
    x.translate(w / 2, w / 2);
    for (let i = 0; i < 5; i++) { x.rotate((Math.PI * 2) / 5); x.fillStyle = "#ffffff"; x.strokeStyle = "#1b2133"; x.lineWidth = 4; x.beginPath(); x.ellipse(0, -30, 17, 28, 0, 0, 7); x.fill(); x.stroke(); }
    x.fillStyle = "#e2a84b"; x.beginPath(); x.arc(0, 0, 13, 0, 7); x.fill(); x.stroke();
  });
  const NF = 420, FL = [], rf = mulberry(91);
  const flower = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.42).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: flTex, alphaTest: 0.4, side: THREE.DoubleSide }), NF);
  const FCOL = [0xf3e6c8, 0xd06a55, 0xeec06a, 0xe8b2a6].map(C);
  while (FL.length < NF) {
    const a = rf() * Math.PI * 2, rr = 2.0 + Math.pow(rf(), 0.8) * 13, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (Math.hypot(x - POND.x, z - POND.z) < 2.5) continue;
    if (HILLS.some((H) => Math.hypot(x - H.x, z - H.z) < H.R * 0.85)) continue;
    FL.push([x, z, rr, rf(), rf()]); flower.setColorAt(FL.length - 1, FCOL[FL.length % 4]);
  }
  flower.frustumCulled = false; scene.add(flower);

  // ---------- birds (generic, stylised; four colours)
  const wingTex = (base, light) => canvasTex(256, 128, (x, w, h) => {
    x.fillStyle = base; x.strokeStyle = "#1b2133"; x.lineWidth = 5;
    x.beginPath(); x.moveTo(4, 30); x.lineTo(w - 10, 18);
    for (let i = 0; i < 6; i++) { const xx = w - 10 - i * 40; x.quadraticCurveTo(xx - 6, h - 10 - (i % 2) * 6, xx - 34, h - 22 - i * 4); }
    x.lineTo(4, h - 50); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = light; x.beginPath(); x.moveTo(10, 34); x.lineTo(w - 30, 26); x.lineTo(w - 70, 58); x.lineTo(10, 62); x.closePath(); x.fill();
    x.lineWidth = 3; for (let i = 0; i < 6; i++) { const xx = w - 30 - i * 40; x.beginPath(); x.moveTo(xx, 40); x.lineTo(xx - 16, h - 24 - i * 3); x.stroke(); }
  });
  const tailTex = (base) => canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = base; x.strokeStyle = "#1b2133"; x.lineWidth = 5;
    x.beginPath(); x.moveTo(w / 2 - 14, 6); x.lineTo(w / 2 + 14, 6); x.lineTo(w - 8, h - 10); x.quadraticCurveTo(w / 2, h - 30, 8, h - 10); x.closePath(); x.fill(); x.stroke();
    x.lineWidth = 3; [0.3, 0.5, 0.7].forEach((f) => { x.beginPath(); x.moveTo(w / 2, 10); x.lineTo(f * w, h - 20); x.stroke(); });
  });
  const BIRDS = BIRDC.map((col, c) => {
    const G = new THREE.Group(); scene.add(G);
    const P = new THREE.Group(); G.add(P); // pose group: pitched nose-up when perched
    const bodyM = toon(col), bellyM = toon(C(col).lerp(C(WASHI), 0.55));
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 22, 14), bodyM); b.scale.set(1, 0.92, 1.55); P.add(b); hull(b, 0.014);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12), bellyM); belly.scale.set(0.9, 0.78, 1.35); belly.position.set(0, -0.04, 0.04); P.add(belly);
    const head = new THREE.Group(); head.position.set(0, 0.15, 0.24); P.add(head);
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.118, 18, 12), bodyM); head.add(hm); hull(hm, 0.012);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.13, 8), toon(c === 3 ? 0x3a2a1e : GOLD)); beak.rotation.x = Math.PI / 2; beak.position.set(0, -0.01, 0.16); head.add(beak); hull(beak, 0.008);
    for (const s of [-1, 1]) {
      const ew = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: C(WASHI) })); ew.position.set(s * 0.072, 0.035, 0.07); head.add(ew);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), new THREE.MeshBasicMaterial({ color: C(INK) })); e.position.set(s * 0.085, 0.037, 0.085); head.add(e);
    }
    const wm = new THREE.MeshToonMaterial({ map: wingTex("#" + C(col).getHexString(), BIRDLIGHT[c]), gradientMap: grad, alphaTest: 0.4, side: THREE.DoubleSide });
    const wg = new THREE.PlaneGeometry(0.56, 0.28); wg.translate(0.28, 0, 0); wg.rotateX(-Math.PI / 2);
    const wings = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.12, 0.08, 0.04); p.scale.x = s; P.add(p); p.add(new THREE.Mesh(wg, wm)); return p; });
    const tg = new THREE.PlaneGeometry(0.3, 0.3); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, -0.14);
    const tail = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ map: tailTex("#" + C(col).getHexString()), gradientMap: grad, alphaTest: 0.4, side: THREE.DoubleSide }));
    tail.position.set(0, 0.03, -0.22); P.add(tail);
    // legs (upright, in the unpitched group) with forward-pointing feet; shown only when perched
    const legM = toon(0x6b4a2a);
    const legs = [-1, 1].map((s) => {
      const L = new THREE.Group(); L.position.set(s * 0.065, -0.1, 0.02); G.add(L);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.17, 6), legM); sh.position.y = -0.085; L.add(sh); hull(sh, 0.006);
      const ft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), legM); ft.rotation.x = Math.PI / 2; ft.scale.y = 1; ft.position.set(0, -0.17, 0.04); ft.scale.set(1, 1, 0.4); L.add(ft);
      return L;
    });
    G.userData = { wings, head, P, tail, legs };
    return G;
  });
  // perches on the stone, birds face the lantern
  const PERCH = [150, 112, 68, 30].map((d) => { const a = (d * Math.PI) / 180; return new THREE.Vector3(Math.cos(a) * 1.05, 0.35 + 0.27, Math.sin(a) * 1.05); });
  // assembly points above the lantern
  const ASM = [0, 1, 2, 3].map((c) => { const a = c * Math.PI / 2 + Math.PI / 4; return new THREE.Vector3(Math.cos(a) * 1.6, 3.0 + c * 0.12, Math.sin(a) * 1.6); });
  const hillTop = (H) => new THREE.Vector3(H.x, H.h, H.z);
  const bez = (a, c, b, u, out) => { const v = 1 - u; return out.set(v * v * a.x + 2 * v * u * c.x + u * u * b.x, v * v * a.y + 2 * v * u * c.y + u * u * b.y, v * v * a.z + 2 * v * u * c.z + u * u * b.z); };
  const SKY_T = [0, 1, 2, 3].map((c) => new THREE.Vector3(10 + c * 2.2 - 3, 13 + c * 1.3, -48 - c * 3));

  function circlePos(c, t, out) {
    const tau = Math.max(0, t - tForm);
    const ang = c * Math.PI / 2 + Math.PI / 4 + 0.95 * (tau - 0.7 * (1 - Math.exp(-tau / 0.7)));
    let R = 1.6 + 1.0 * ramp(t, tForm + 0.6, K.s6) + 1.2 * ramp(t, K.s6, tYang6);
    R += 6.0 * ramp(t, tPen - 0.5, tPen + 0.6) * (1 - ramp(t, tPen + 1.2, tBang + 0.9));
    const y = 3.0 + c * 0.12 + 0.6 * ramp(t, tForm + 0.6, K.s6) + 1.2 * ramp(t, K.s6, tYang6) + 0.15 * Math.sin(tau * 2.1 + c);
    return out.set(Math.cos(ang) * R, y, Math.sin(ang) * R);
  }
  // returns {vis, fly, s} and writes position into out
  function birdAt(c, t, out) {
    const tIn0 = tAmb - 0.3 + c * 0.15, tIn1 = tBur + 0.1 + c * 0.12;
    if (t < tIn0) return { vis: false };
    if (t < tIn1) {
      const u = eout((t - tIn0) / (tIn1 - tIn0));
      const H = HILLS[c], a = new THREE.Vector3(H.x * 0.7, 6 + c, H.z * 0.7);
      bez(a, tv2.copy(a).lerp(PERCH[c], 0.5).setY(4), PERCH[c], u, out);
      return { vis: true, fly: 1 - ramp(t, tIn1 - 0.25, tIn1), s: 1 };
    }
    if (t < tHide) { out.copy(PERCH[c]); return { vis: true, fly: 0, s: 1 }; }
    if (t < tForm) return { vis: false };
    const sIn = back((t - tForm) / 0.55, 1.4);
    if (t < tLand7) { circlePos(c, t, out); return { vis: true, fly: 1, s: sIn }; }
    const tL1 = K.s7 + 1.9 + c * 0.15;
    if (t < tL1) {
      const u = ramp(t, tLand7, tL1);
      circlePos(c, t, out).lerp(PERCH[c], u); out.y += Math.sin(Math.PI * u) * 0.6;
      return { vis: true, fly: 1 - ramp(t, tL1 - 0.35, tL1), s: 1 };
    }
    const tT = tTanya + 0.2 + c * 0.35;
    if (t < tT) { out.copy(PERCH[c]); return { vis: true, fly: 0, s: 1 }; }
    const u = clamp01((t - tT) / 6.5), uu = u * u * (1.6 - 0.6 * u);
    bez(PERCH[c], tv2.copy(PERCH[c]).add(new THREE.Vector3(0.5, 3.2, -4)), SKY_T[c], uu, out);
    return { vis: true, fly: 1, s: 1 };
  }

  // ---------- feathers: 4 colours x 36, each hill gets every colour
  const featherTex = canvasTex(64, 192, (x, w, h) => {
    x.fillStyle = "#ffffff"; x.strokeStyle = "#1b2133"; x.lineWidth = 4;
    x.beginPath(); x.moveTo(w / 2, 6); x.quadraticCurveTo(w - 4, h * 0.35, w / 2 + 3, h - 30); x.lineTo(w / 2 - 3, h - 30); x.quadraticCurveTo(4, h * 0.35, w / 2, 6); x.fill(); x.stroke();
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(0,0,0,.25)"); g.addColorStop(0.4, "rgba(0,0,0,0)"); x.fillStyle = g; x.fill();
    x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, 10); x.lineTo(w / 2, h - 4); x.stroke();
    x.lineWidth = 1.5; for (let i = 0; i < 7; i++) { const yy = 30 + i * 18; x.beginPath(); x.moveTo(w / 2, yy); x.lineTo(w / 2 - 14, yy + 12); x.moveTo(w / 2, yy); x.lineTo(w / 2 + 14, yy + 12); x.stroke(); }
  });
  const NPER = 36, NFE = NPER * 4;
  const feathers = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.17, 0.5), new THREE.MeshBasicMaterial({ map: featherTex, alphaTest: 0.45, side: THREE.DoubleSide }), NFE);
  feathers.frustumCulled = false; scene.add(feathers);
  const FE = [], rfe = mulberry(4242);
  for (let i = 0; i < NFE; i++) {
    const c = i % 4, k = Math.floor(i / 4), h = (k + c) % 4, R8 = Array.from({ length: 10 }, () => rfe());
    const H = HILLS[h], la = R8[5] * Math.PI * 2, lr = 0.25 + R8[6] * 1.25, dx = Math.cos(la) * lr, dz = Math.sin(la) * lr;
    const land = new THREE.Vector3(H.x + dx, yHill(H, dx, dz) + 0.07, H.z + dz);
    const ea = R8[7] * Math.PI * 2, eb = (R8[8] - 0.5) * 2;
    const asmOff = new THREE.Vector3(Math.cos(ea) * 0.22, eb * 0.16, Math.sin(ea) * 0.36);
    FE.push({ c, h, R: R8, land, asmOff });
    feathers.setColorAt(i, C(BIRDC[c]).lerp(C(0xffffff), 0.12));
  }
  feathers.instanceColor.needsUpdate = true;
  const tL = (f) => tLet + f.R[1] * 0.9, dL = (f) => 1.7 + f.R[4] * 0.5;
  const tR = (f) => tRet + f.h * 0.12 + f.R[1] * 0.35, dR = (f) => 1.35 + f.R[4] * 0.3;
  function swirl(f, t, out) {
    const tB = tHide + f.R[0] * 0.25, s = clamp01((t - tB) / 1.6);
    const ang = f.R[2] * 6.283 + (t - tB) * 1.7, rad = 0.35 + (0.6 + 0.8 * f.R[3]) * eout(s);
    const y = 0.55 + (1.2 + 1.6 * f.R[9]) * eout(clamp01((t - tB) / 2.2)) + 0.12 * Math.sin(t * 2 + f.R[3] * 9);
    out.set(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
    const b = eout(clamp01((t - tB) / 0.6));
    return out.lerp(tv2.copy(PERCH[f.c]).setY(0.6), 1 - b);
  }
  const hillArrive = (f, t0) => t0 + Math.hypot(HILLS[f.h].x, HILLS[f.h].z) / 11;
  const fA = new THREE.Vector3(), fCtl = new THREE.Vector3(), fB = new THREE.Vector3();
  // state: 0 hidden, 1 swirl, 2 flight out, 3 rest, 4 flight back, 5 gather
  function featherAt(f, t, out) {
    const tB = tHide + f.R[0] * 0.25;
    if (t < tB || t > tForm + 0.5) return { st: 0 };
    const t1 = tL(f);
    if (t < t1) { swirl(f, t, out); return { st: 1, fl: 0.6 }; }
    const t2 = t1 + dL(f);
    if (t < t2) {
      const u = ramp(t, t1, t2); swirl(f, t1, fA);
      fCtl.copy(fA).lerp(f.land, 0.5); fCtl.y = Math.max(fA.y, f.land.y) + 6 + 3 * f.R[7];
      bez(fA, fCtl, f.land, u, out); return { st: 2, fl: Math.sin(Math.PI * u) };
    }
    const t3 = tR(f);
    if (t < t3) {
      out.copy(f.land);
      let lift = 0;
      for (const tc of CALLS) { const ta = hillArrive(f, tc); lift += Math.exp(-Math.pow((t - ta - 0.25) / 0.3, 2)); }
      lift += ramp(t, t3 - 0.5, t3);
      out.y += 0.18 * lift * (0.6 + f.R[2]); return { st: 3, fl: 0.2 * lift };
    }
    const t4 = t3 + dR(f);
    const dst = fB.copy(ASM[f.c]).add(f.asmOff);
    if (t < t4) {
      const u = ramp(t, t3, t4); fA.copy(f.land); fA.y += 0.18;
      fCtl.copy(fA).lerp(dst, 0.5); fCtl.y = Math.max(fA.y, dst.y) + 4 + 2 * f.R[7];
      bez(fA, fCtl, dst, u, out); return { st: 4, fl: Math.sin(Math.PI * u) };
    }
    // gather: small tight orbit round the assembly point, then drawn into the body
    const a = f.R[2] * 6.283 + (t - t4) * 3.2, k = 1 - ramp(t, tForm - 0.1, tForm + 0.4);
    out.set(ASM[f.c].x + Math.cos(a) * f.asmOff.length() * (0.6 + 0.6 * k), dst.y, ASM[f.c].z + Math.sin(a) * f.asmOff.length() * (0.6 + 0.6 * k));
    return { st: 5, fl: 0.3 * k, sc: k };
  }
  const trail = pts(scene, NFE * 3, { size: 0.45, add: true });
  const fP = new THREE.Vector3(), fQ = new THREE.Vector3();

  // ---------- camera
  const camT = track([
    [0, 5, 30, 52, 0, 4, -6],
    [tPer, 3, 15, 27, 0, 2.5, -2],
    [K.s1e, 1.6, 4.0, 10.5, 0, 1.8, 0],
    [tDoa, 1.0, 3.2, 8.8, 0, 2.3, 0],
    [tMati, 2.6, 7.2, 14.4, 0, 1.5, 0],
    [tSeb, 2.2, 7.6, 14.2, -0.6, 1.9, -2],
    [tSeb + 1.8, -2.4, 4.6, 10.5, -11, 5.6, -22],
    [tRaja, -3.4, 6.0, 7.0, -29, 6.5, -50],
    [tRaja + 0.7, -3.7, 6.2, 6.6, -31, 6.7, -53],
    [K.s3 + 0.4, 1.8, 3.2, 10.8, -0.8, 0.6, 2.0],
    [K.s3 + 2.6, 0.6, 2.4, 10.8, -0.8, 0.7, 2.2],
    [tTen, -1.0, 1.7, 9.8, -0.5, 0.6, 1.8],
    [tYak, -0.7, 1.8, 9.4, -0.2, 1.6, -3],
    [K.s3e, 0.4, 3.0, 10.4, 0, 1.2, -8],
    [tAmb + 0.3, 2.2, 3.4, 8.2, 0, -0.05, 0],
    [tCin, 2.4, 3.1, 7.6, 0, 0.2, 0],
    [tLet + 0.2, 3.4, 4.6, 10.4, 0, 2, -1],
    [tBuk + 0.4, 6, 44, 30, 0, 0, -1],
    [tLain, 2, 46, 28, 0, 0, -1],
    [tPang, -2, 45, 27, 0, 0, -1],
    [tMem, -3.5, 22, 30, 0, 2, -2],
    [tKem - 0.4, -2.6, 6.8, 14.5, 0, 3, 0],
    [tHid + 0.8, 1.0, 5.6, 13.0, 0, 3.3, 0],
    [K.s6 + 1.2, 3, 7.2, 13.5, 0, 3.8, 0],
    [tIbr6, 2.5, 11, 17, 0, 3.4, -1],
    [tYang6, 0.5, 22, 24, 0, 2, -2],
    [tPen, -1.5, 30, 28, 0, 0.5, -2],
    [K.s6e - 0.2, -1.8, 30.5, 28.5, 0, 0.5, -2],
    [K.s7 + 2.4, -1.4, 2.3, 9.4, 0, 1.2, 0],
    [tPara, -0.8, 1.9, 8.6, 0, 1.3, -2],
    [K.s7e, 0.3, 2.3, 8.6, 0, -0.3, -5],
    [tTanya, 0.8, 2.7, 8.9, 0, -0.6, -8],
    [tKis - 0.3, 1.5, 1.45, 9.6, 0.5, 2.6, -20],
    [K.end, 1.6, 1.45, 9.9, 0.5, 2.7, -20],
  ]);

  return (t) => {
    const [px, py, pz, tx, ty, tz] = camT(t);
    cam.position.set(px, py, pz); cam.lookAt(tx, ty, tz);

    // sky + sun
    const sunUp = ramp(t, K.s7 - 1, K.end);
    skyU.uDawn.value = 0.45 + 0.35 * ramp(t, K.s4, K.s6) + 0.4 * sunUp;
    tv.copy(SUN).setY(-0.06 + 0.13 * sunUp).normalize().multiplyScalar(600); sun.position.copy(tv); sun.lookAt(0, 0, 0);
    key.intensity = 1.5 + 0.4 * sunUp;

    // mist bands
    BANDS.forEach((m) => {
      const u = m.userData;
      if (u.fixed) m.position.copy(u.fixed); else { const a = u.a + t * u.sp; m.position.set(Math.cos(a) * u.R, u.y, Math.sin(a) * u.R); }
      m.rotation.set(0, Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z), 0);
    });
    VEIL.forEach((m, k) => {
      const u = clamp01((t - (tCin - 0.35 + k * 0.18)) / 1.7);
      m.material.opacity = u > 0 && u < 1 ? Math.min(0.92, Math.sin(Math.PI * u) * 2.2) : 0;
      tv.set(1, 0, 0).applyQuaternion(cam.quaternion);
      m.position.set(0, 0.62 + k * 0.42, 0).addScaledVector(tv, mix(-4.2, 4.2, u)).add(tv2.set(0, 0, 1).applyQuaternion(cam.quaternion).multiplyScalar(1.6));
      m.quaternion.copy(cam.quaternion);
    });

    // lantern glow: prayer (s2), calm (s3), the two calls (s5), steady later
    const prayer = ramp(t, tDoa - 0.3, tDoa + 0.8) * (1 - ramp(t, tSeb, tSeb + 1.2));
    let call = 0; for (const tc of CALLS) call += Math.exp(-Math.pow((t - tc - 0.15) / 0.35, 2));
    const fl = 1 + 0.05 * Math.sin(t * 11.3) + 0.03 * Math.sin(t * 23.1 + 1);
    const lg = (0.75 + 0.5 * prayer + 0.25 * ramp(t, tTen - 0.5, tTen + 1) + 1.4 * call + 0.25 * ramp(t, K.s8, K.end)) * fl;
    paperM.color.setScalar(0.85 + 0.45 * lg);
    glow.scale.setScalar(1.3 * lg); glow.material.opacity = Math.min(1, 0.55 * lg);
    lampL.intensity = 2.6 * lg;

    // prayer motes: a rising line of light from the lantern
    for (let i = 0; i < NP; i++) {
      const s = PR[i], ph = (t * 0.32 + s[0]) % 1;
      const a = s[1] * 6.283 + t * 0.6;
      motes.pos[i * 3] = Math.cos(a) * (0.05 + 0.18 * ph); motes.pos[i * 3 + 1] = 1.0 + ph * 9; motes.pos[i * 3 + 2] = Math.sin(a) * (0.05 + 0.18 * ph);
      const al = prayer * Math.sin(Math.PI * ph) * (0.6 + 0.4 * s[2]);
      motes.col[i * 3] = al; motes.col[i * 3 + 1] = al * 0.82; motes.col[i * 3 + 2] = al * 0.5;
    }
    motes.commit();

    // pond: agitated ripples calm down at "tenang"; reflection sharpens
    const agit = 1 - ramp(t, tTen - 0.2, tTen + 1.6);
    RIP.forEach((m, k) => { const ph = (t * 0.55 + k / 3) % 1; m.scale.setScalar(0.3 + 2.4 * ph); m.material.opacity = agit * (1 - ph) * 0.85; });
    refl.scale.set(1 + agit * 0.35 * Math.sin(t * 9.1), 1 + agit * 0.15 * Math.sin(t * 6.3), 1);
    refl.material.opacity = 0.55 + 0.35 * (1 - agit) + 0.3 * call;

    // call rings
    CRING.forEach((m) => { const u = (t - m.userData.t0) / 1.7; if (u <= 0 || u >= 1) { m.material.opacity = 0; m.scale.setScalar(0.01); return; } m.scale.setScalar(0.6 + 17 * eout(u)); m.material.opacity = 0.9 * (1 - u); });

    // flowers
    const tb = tBang - 0.3;
    for (let i = 0; i < NF; i++) {
      const f = FL[i], s = back((t - tb - f[2] * 0.07 - f[3] * 0.3) / 0.5, 1.6);
      dummy.position.set(f[0], 0.04 + f[4] * 0.02, f[1]); dummy.rotation.set((f[3] - 0.5) * 0.3, f[4] * 6.28, 0); dummy.scale.setScalar(Math.max(0.001, s * (0.75 + 0.5 * f[4])));
      dummy.updateMatrix(); flower.setMatrixAt(i, dummy.matrix);
    }
    flower.instanceMatrix.needsUpdate = true;

    // birds
    BIRDS.forEach((G, c) => {
      const st = birdAt(c, t, tv);
      G.visible = !!st.vis;
      if (!st.vis) return;
      G.position.copy(tv); G.scale.setScalar(Math.max(0.001, st.s));
      birdAt(c, t + 0.04, fP); birdAt(c, t - 0.04, fQ);
      const v = fP.sub(fQ);
      // perched: stand facing outward from the lantern (toward the viewer side), slowly shifting stance
      const yawWob = 0.35 * Math.sin(t * 0.37 + c * 2.3);
      dummy.position.copy(tv); dummy.rotation.set(0, 0, 0);
      dummy.lookAt(tv2.copy(tv).multiplyScalar(2).setY(tv.y).add(fQ.set(Math.cos(c + yawWob) * 0.3, 0, Math.sin(c + yawWob) * 0.3))); tq2.copy(dummy.quaternion);
      if (v.length() > 0.004) { dummy.lookAt(tv2.copy(tv).add(v)); tq.copy(dummy.quaternion); } else tq.copy(tq2);
      G.quaternion.copy(tq2).slerp(tq, clamp01(st.fly * 1.4));
      const fold = 1 - st.fly;
      const U = G.userData;
      // alive while perched: little hops, wing ruffles, head turns and tilts
      const hop = Math.pow(Math.max(0, Math.sin(t * 1.6 + c * 2.1)), 14);
      G.position.y += fold * 0.09 * hop;
      const ruff = fold * Math.pow(Math.max(0, Math.sin(t * 0.75 + c * 1.3)), 18);
      const a = st.fly * (0.25 + 0.75 * Math.abs(Math.sin(t * 1.1 + c))) * Math.sin(t * 2 * Math.PI * 3.1 + c * 1.3) * 0.85 + ruff * 0.45 * (0.5 + 0.5 * Math.sin(t * 34));
      const [wl, wr] = U.wings;
      wr.rotation.set(0, 1.25 * fold, a - 0.3 * fold);
      wl.rotation.set(0, -1.25 * fold, -(a - 0.3 * fold)); // mirrored pivot (scale.x = -1): signs flip
      U.P.rotation.x = -0.55 * fold - 0.15 * fold * hop;
      U.tail.rotation.x = 0.1 + 0.75 * fold;
      U.head.rotation.set(0.25 * fold - 0.15 * fold * Math.max(0, Math.sin(t * 0.6 + c * 3)), fold * 0.75 * Math.sin(t * 0.9 + c * 2), fold * 0.25 * Math.sin(t * 1.3 + c));
      U.legs.forEach((L) => { L.visible = fold > 0.05; L.scale.y = Math.max(0.001, fold); });
    });

    // feathers + trails
    for (let i = 0; i < NFE; i++) {
      const f = FE[i], s = featherAt(f, t, fP);
      if (!s.st) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.001); dummy.updateMatrix(); feathers.setMatrixAt(i, dummy.matrix); for (let k = 0; k < 3; k++) trail.pos[(i * 3 + k) * 3 + 1] = -50; continue; }
      dummy.position.copy(fP);
      if (s.st === 3) dummy.rotation.set(-Math.PI / 2 + (f.R[3] - 0.5) * 0.5 + 0.3 * s.fl * Math.sin(t * 8 + i), f.R[5] * 6.28, 0);
      else dummy.rotation.set(Math.sin(t * 3.1 + f.R[2] * 9) * 1.2, t * (1.5 + f.R[4] * 2) + f.R[5] * 6, Math.sin(t * 2.3 + f.R[6] * 7) * 0.8);
      dummy.scale.setScalar(s.sc !== undefined ? Math.max(0.001, s.sc) : s.st === 3 ? 1.9 : s.st === 2 || s.st === 4 ? 1 + 1.2 * s.fl : 1); dummy.updateMatrix(); feathers.setMatrixAt(i, dummy.matrix);
      const cc = C(BIRDC[f.c]).lerp(C(0xffe2a0), 0.55);
      for (let k = 0; k < 3; k++) {
        const j = (i * 3 + k) * 3, s2 = featherAt(f, t - 0.07 * (k + 1), fQ);
        const al = (s.st === 2 || s.st === 4) && (s2.st === 2 || s2.st === 4) ? s.fl * (1 - k * 0.28) : 0;
        trail.pos[j] = fQ.x; trail.pos[j + 1] = al > 0 ? fQ.y : -50; trail.pos[j + 2] = fQ.z;
        trail.col[j] = cc.r * al; trail.col[j + 1] = cc.g * al; trail.col[j + 2] = cc.b * al;
      }
    }
    feathers.instanceMatrix.needsUpdate = true; trail.commit();

    bp.strength = 0.2 + 0.25 * call + 0.1 * prayer;
    comp.render();
  };
}
