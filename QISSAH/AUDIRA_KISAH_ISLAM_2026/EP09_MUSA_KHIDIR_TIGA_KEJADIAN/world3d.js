// EP09 MUSA & KHIDIR, TIGA KEJADIAN. KINTSUGI: a wabi-sabi porcelain diorama. Cream and celadon glazed land with fine crackle,
// an ink-dark sea that turns celadon where the two seas meet, and cracks that first appear dark, then fill with flowing gold.
// Nabi Musa and Khidir are never shown: their presence is two lanterns (amber = Musa, pale celadon = Khidir) and their footprints.
// The youth event is only a small lamp going out on a hillside. Shore edge at z=0 (a porcelain cliff), sea toward -z, land toward +z.
// Journey runs along +x: bird (-49) -> gathering (-20) -> rock at the meeting of the seas (0) -> boat (25) -> hill lamp (47) -> wall (86) -> bowl (106).
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";


// Monotone (harmonic-mean) Hermite camera spline: no overshoot past a key, so holds on small subjects stay framed.
function mtrack(keys) {
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((_, j) => {
    if (j === 0) return 0;
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    const d0 = i > 0 ? (k[j] - a[j]) / (k[0] - a[0]) : null, d1 = i < n - 1 ? (b[j] - k[j]) / (b[0] - k[0]) : null;
    if (d0 === null) return d1; if (d1 === null) return d0;
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

const SEA = -2.2;
const BOAT_AT = new THREE.Vector3(25, SEA, -12);
const LAMP = new THREE.Vector3(46.6, 2.45, 15.5);
const WALL = new THREE.Vector3(86, 0, 2.75);
const BOWL = new THREE.Vector3(106, 0, 4);

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xeae2cf, fog: 0.0072, exp: 1.0, bloom: [0.62, 0.42, 1.0], shadow: true });
  r.toneMapping = THREE.NeutralToneMapping;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1882);
  const ease = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
  const bump = (t, a, b, c) => (t < b ? ramp(t, a, b) : 1 - ramp(t, b, c));
  envStrips(r, scene, [[60, 14, 0xfff0d6, 2.4, 0, 40, -10], [40, 10, 0xdce9e2, 1.3, -40, 12, 20], [80, 6, 0xffffff, 0.7, 30, -10, 40]], 0x20262a);

  // ---------- textures
  const crackle = (seed, base, a, n) => (g, w, h) => {
    const q = mulberry(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = q() * w, y = q() * h, rr = 20 + q() * 90, gr = g.createRadialGradient(x, y, 1, x, y, rr);
      const c = q() < 0.5 ? "255,255,255" : "120,105,80";
      gr.addColorStop(0, `rgba(${c},${0.03 + q() * 0.05})`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < n; i++) {
      g.strokeStyle = `rgba(70,58,44,${a * (0.5 + q() * 0.5)})`; g.lineWidth = 0.5 + q() * 0.9;
      g.beginPath(); let x = q() * w, y = q() * h, ang = q() * 6.28; g.moveTo(x, y);
      const m = 3 + Math.floor(q() * 5);
      for (let k = 0; k < m; k++) { ang += (q() - 0.5) * 1.7; const L = 8 + q() * 28; x += Math.cos(ang) * L; y += Math.sin(ang) * L; g.lineTo(x, y); }
      g.stroke();
    }
  };
  const glaze = (seed, base, a, n, rep) => canvasTex(512, 512, crackle(seed, base, a, n), rep);
  const porc = (color, map, o = {}) => new THREE.MeshPhysicalMaterial({ color, map, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
  const mCream = porc(0xffffff, glaze(3, "#f1eadb", 0.22, 170));
  const mCel = porc(0xffffff, glaze(5, "#a7c3b0", 0.22, 170));
  const mCelDeep = porc(0xffffff, glaze(6, "#6f9886", 0.2, 150));
  const mInk = porc(0x16191c, null, { roughness: 0.22 });
  const mRed = porc(0x6e2418, null, { roughness: 0.35, side: THREE.DoubleSide });
  const mTenmoku = porc(0x33251c, null, { roughness: 0.2 });
  const mGold = new THREE.MeshStandardMaterial({ color: 0xd9a648, metalness: 1, roughness: 0.24, emissive: 0xb07418, emissiveIntensity: 0.35 });
  const glowTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const glow = (color, s, parent) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); m.scale.setScalar(s); parent.add(m); return m; };
  const hdr = (r_, g_, b_) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r_, g_, b_) });
  const shadowy = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

  // ---------- sky dome and lights
  const skyM = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, map: canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#bfcac2"); gr.addColorStop(0.4, "#e2ddcc"); gr.addColorStop(0.5, "#efe7d5"); gr.addColorStop(1, "#efe7d5"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), skyM); sky.renderOrder = -10; scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xf3e7cf, 0x2a2e30, 1.2); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe6c0, 3.0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 0.5, far: 140 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun); scene.add(sun.target);

  // ---------- land: a glazed porcelain slab, cliff face at z=0, a hidden cavity under the wall
  const landTop = new THREE.Mesh(new THREE.PlaneGeometry(380, 140), porc(0xffffff, glaze(7, "#ebe3d0", 0.17, 230, [34, 12]), { roughness: 0.45, clearcoat: 0.5 }));
  landTop.rotation.x = -Math.PI / 2; landTop.position.set(20, 0, 70); landTop.receiveShadow = true; scene.add(landTop);
  const face = (x0, x1, y0, y1, parent = scene) => {
    const w = x1 - x0, h = y1 - y0;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), porc(0xffffff, glaze(9, "#ddd2bc", 0.25, 200, [Math.max(1, w / 5), Math.max(0.3, h / 5)]), { roughness: 0.4 }));
    m.rotation.y = Math.PI; m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); m.receiveShadow = true; parent.add(m); return m;
  };
  face(-170, 82.5, -3.6, 0); face(89.5, 210, -3.6, 0); face(82.5, 89.5, -0.3, 0); face(82.5, 89.5, -3.6, -2.0);
  const doorG = new THREE.Group(); scene.add(doorG);
  const door = face(82.5, 89.5, -2.0, -0.3, doorG); door.material.transparent = true; door.position.z = -0.01;
  const cavity = new THREE.Mesh(new THREE.BoxGeometry(7, 1.7, 3), new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9, side: THREE.BackSide }));
  cavity.position.set(86, -1.15, 1.5); scene.add(cavity);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(380, 0.12, 0.14), mCel); lip.position.set(20, -0.05, 0); scene.add(lip);
  // a warm sand strip along the shore for the footprints
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(380, 7), new THREE.MeshStandardMaterial({ transparent: true, roughness: 1, map: canvasTex(256, 256, (g, w, h) => {
    const q = mulberry(41); g.clearRect(0, 0, w, h);
    for (let y = 0; y < h; y++) { const a = y < h * 0.55 ? 1 : 1 - (y - h * 0.55) / (h * 0.45); g.fillStyle = `rgba(214,200,172,${a})`; g.fillRect(0, y, w, 1); }
    for (let i = 0; i < 2600; i++) { const y = q() * h; const a = (y < h * 0.55 ? 1 : 1 - (y - h * 0.55) / (h * 0.45)) * 0.35; g.fillStyle = q() < 0.5 ? `rgba(150,132,104,${a})` : `rgba(250,244,230,${a})`; g.fillRect(q() * w, y, 1.5, 1.5); }
  }, [60, 1]) }));
  sand.rotation.x = -Math.PI / 2; sand.position.set(20, 0.012, 3.5); sand.receiveShadow = true; scene.add(sand);

  // ---------- the sea: ink on the left, deep celadon on the right, meeting in a pale seam at x=0
  const NOISE = `float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}`;
  const SU = {
    uT: { value: 0 }, uDen: { value: 0.0072 }, uSeam: { value: 0 },
    uInk: { value: new THREE.Color(0x0b141b) }, uCel: { value: new THREE.Color(0x1f4440) }, uSky: { value: new THREE.Color(0xefe7d5) }, uFog: { value: new THREE.Color(0xeae2cf) },
    uSunDir: { value: new THREE.Vector3(-0.5, 0.6, -0.6).normalize() }, uSunC: { value: new THREE.Color(0xfff0d0) },
    uR0: { value: new THREE.Vector4(0, 0, -99, 0) }, uR1: { value: new THREE.Vector4(0, 0, -99, 0) }, uR2: { value: new THREE.Vector4(0, 0, -99, 0) },
  };
  const seaM = new THREE.ShaderMaterial({
    uniforms: SU,
    vertexShader: `varying vec3 vW;varying float vD;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float uT,uDen,uSeam;uniform vec3 uInk,uCel,uSky,uFog,uSunDir,uSunC;uniform vec4 uR0,uR1,uR2;
varying vec3 vW;varying float vD;
${NOISE}
float H(vec2 p){float t=uT;return sin(p.x*.9+t*1.1+sin(p.y*.5)*1.4)*.05+sin(p.y*1.3-t*1.4+p.x*.3)*.04+sin((p.x-p.y)*2.3+t*2.1)*.015+(vn(p*1.6+vec2(t*.3,t*.1))-.5)*.05;}
float ring(vec4 R,vec2 p){if(R.w<.5)return 0.;float a=uT-R.z;if(a<0.||a>3.5)return 0.;float rr=length(p-R.xy);float f=rr-a*1.15;return (exp(-f*f/.01)+.5*exp(-(f+.5)*(f+.5)/.01))*exp(-a*1.2);}
void main(){vec2 p=vW.xz;float e=.06;float h0=H(p);
 vec3 n=normalize(vec3(h0-H(p+vec2(e,0.)),e,h0-H(p+vec2(0.,e))));
 vec3 V=normalize(cameraPosition-vW);
 float wob=sin(p.y*.21+uT*.25)*1.4+(vn(p*.08)-.5)*3.;
 float side=smoothstep(-2.,2.,p.x+wob);
 vec3 base=mix(uInk,uCel,side);
 float fr=pow(1.-max(dot(n,V),0.),5.);
 vec3 col=base*(.8+.2*n.y)+uSky*(.03+.55*fr);
 vec3 Rf=reflect(-V,n);col+=uSunC*pow(max(dot(Rf,uSunDir),0.),240.)*1.4;
 float seam=exp(-pow((p.x+wob)/.4,2.))*(.45+.55*vn(p*.7+vec2(0.,uT*.6)))*smoothstep(-60.,-1.,p.y);
 col=mix(col,vec3(.9,.86,.72),seam*.28);col+=vec3(1.2,.8,.3)*seam*uSeam*.6;
 float shore=smoothstep(-1.4,0.,p.y);col=mix(col,vec3(.86,.84,.78),shore*.4*(.55+.45*vn(p*3.+uT)));
 col+=vec3(.95,.92,.82)*(ring(uR0,p)+ring(uR1,p)+ring(uR2,p))*.8;
 float fd=1.-exp(-pow(uDen*vD,2.));col=mix(col,uFog,fd);
 gl_FragColor=vec4(col,1.);}`,
  });
  const seaGeo = new THREE.PlaneGeometry(1400, 720); seaGeo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(seaGeo, seaM); sea.position.set(20, SEA, -340); scene.add(sea);
  // distant glazed islands
  [[-90, -120, 26, 0.32], [-20, -170, 34, 0.26], [70, -140, 30, 0.3], [150, -110, 22, 0.36], [40, -230, 44, 0.22]].forEach(([x, z, rr, sy]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(rr, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mCel); m.scale.y = sy; m.position.set(x, SEA, z); scene.add(m);
  });

  // ---------- crack helper: a dark crack that draws itself, then gold that flows along it
  const jag = (q, P, amp, sub = 4) => {
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
      for (let k = 0; k < sub; k++) { const u = k / sub, o = k === 0 ? 0 : (q() - 0.5) * amp * L; out.push([ax + dx * u - dy / L * o, ay + dy * u + dx / L * o]); }
    }
    out.push(P[P.length - 1]); return out;
  };
  function cracks(parent, paths, rad, surf) {
    const darkM = new THREE.MeshStandardMaterial({ color: 0x17140f, roughness: 0.8 });
    const goldM = mGold.clone();
    const items = paths.map(({ pts: P, s = 0, l = 1 }) => {
      const curve = new THREE.CatmullRomCurve3(P.map(([u, v]) => surf(u, v)), false, "catmullrom", 0);
      const segs = P.length * 8;
      const m1 = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, rad, 6, false), darkM);
      const m2 = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, rad * 1.5, 6, false), goldM);
      parent.add(m1); parent.add(m2);
      return { m1, m2, segs, s, l };
    });
    return {
      goldM,
      set(dp, gp, glowI = 0.4) {
        for (const i of items) {
          const a = Math.floor(clamp01((dp - i.s) / i.l) * i.segs) * 36, b = Math.floor(clamp01((gp - i.s) / i.l) * i.segs) * 36;
          i.m1.geometry.setDrawRange(0, a); i.m1.visible = a > 0;
          i.m2.geometry.setDrawRange(0, b); i.m2.visible = b > 0;
        }
        goldM.emissiveIntensity = glowI;
      },
    };
  }
  // thread: a glowing tube that draws along a smooth path
  function thread(P, rad, mat, tension = 0.5) {
    const curve = new THREE.CatmullRomCurve3(P, false, "centripetal", tension);
    const segs = P.length * 24;
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, rad, 8, false), mat);
    m.frustumCulled = false; scene.add(m);
    return { m, set(p) { const a = Math.floor(clamp01(p) * segs) * 48; m.geometry.setDrawRange(0, a); m.visible = a > 0; } };
  }

  // ---------- vessels
  const hullGeo = new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const sailGeo = new THREE.PlaneGeometry(1.5, 1.9, 8, 6);
  { const p = sailGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.16 * Math.sin(Math.PI * (p.getX(i) / 1.5 + 0.5))); sailGeo.computeVertexNormals(); }
  function vessel(hullM, trimM, sailM, len) {
    const G = new THREE.Group();
    const hull = new THREE.Mesh(hullGeo, hullM); hull.scale.set(3, 0.75, 1); G.add(hull);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 8, 72), trimM); rim.rotation.x = Math.PI / 2; rim.scale.set(3, 1, 1); G.add(rim);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 2.8, 8), trimM); mast.position.set(0.5, 0.9, 0); G.add(mast);
    const sail = new THREE.Mesh(sailGeo, sailM); sail.position.set(-0.28, 1.35, 0); G.add(sail);
    G.scale.setScalar(len); shadowy(G); scene.add(G);
    return G;
  }
  const mSail = porc(0xf3ecdc, null, { side: THREE.DoubleSide, roughness: 0.7, clearcoat: 0 });
  const hullCream = mCream.clone(); hullCream.side = THREE.DoubleSide;
  const boat = vessel(hullCream, mCel, mSail, 1);
  const hullSurf = (x, y) => { const z = -Math.sqrt(Math.max(0.0001, 1 - (x / 3) ** 2 - (y / 0.75) ** 2)); return new THREE.Vector3(x * 1.012, y, z * 1.025); };
  const qB = mulberry(77);
  const boatCrack = cracks(boat, [
    { pts: jag(qB, [[0.38, -0.02], [0.14, -0.22], [0.26, -0.38], [0.05, -0.56]], 0.5), s: 0, l: 0.75 },
    { pts: jag(qB, [[0.14, -0.22], [-0.3, -0.3], [-0.55, -0.24]], 0.5), s: 0.3, l: 0.7 },
  ], 0.022, hullSurf);
  const holeN = new THREE.Vector3(0.18 / 9, -0.4 / 0.5625, -Math.sqrt(1 - 0.0036 - 0.284)).normalize();
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.1, 18), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  hole.position.copy(hullSurf(0.2, -0.4)).addScaledVector(holeN, 0.01); hole.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), holeN); hole.scale.y = 0.8; boat.add(hole);
  const holeRing = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.14, 24), mGold.clone()); holeRing.position.copy(hole.position).addScaledVector(holeN, 0.005); holeRing.quaternion.copy(hole.quaternion); holeRing.scale.y = 0.8; boat.add(holeRing);
  const CHIPS = [];
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.TetrahedronGeometry(0.05 + qB() * 0.04), mCream); boat.add(c); CHIPS.push({ c, vx: (qB() - 0.5) * 0.8, vz: -0.6 - qB() * 0.8, vy: 0.4 + qB() * 0.8, r: qB() * 6 }); }
  const boatPos = (t, out) => {
    const u = ease((t - A("s4:perahu") + 0.2) / 1.9);
    out.set(9 + (BOAT_AT.x - 9) * u, SEA + 0.45, -5.5 + (BOAT_AT.z + 5.5) * u);
    out.y += Math.sin(t * 1.3) * 0.04; out.x += Math.sin(t * 0.4) * 0.08 * u;
    return out;
  };
  const boatYaw = (t) => -0.22 * bump(t, A("s4:perahu") - 0.2, A("s4:perahu") + 0.6, A("s4:dilubangi") - 0.2) + Math.sin(t * 0.7) * 0.02;
  // other fishermen's boats, and the king's fleet (black raku hulls, iron-red sails)
  const SB = [[34, -17.5], [41, -14.5], [46.5, -20.5]].map(([x, z]) => ({ G: vessel(hullCream, mCelDeep, mSail, 0.8), x, z }));
  const TS = [[90, -34, 29, -16.4, 34, -20.1], [98, -27, 41, -17.2, 41, -17.2], [104, -41, 46.5, -23.2, 46.5, -23.2]].map((a, i) => ({ G: vessel(mInk, mRed, mRed, 1.4), a, i }));
  TS.forEach(({ G }) => { const ban = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), mRed); ban.position.set(0.85, 2.45, 0); G.add(ban); });

  // ---------- lanterns: amber for Musa, pale celadon for Khidir, a smaller one for the servant
  const lanternParts = { cap: new THREE.ConeGeometry(0.2, 0.15, 8), base: new THREE.CylinderGeometry(0.15, 0.17, 0.05, 12), post: new THREE.CylinderGeometry(0.012, 0.012, 0.34, 5), core: new THREE.CylinderGeometry(0.115, 0.115, 0.3, 14), ring: new THREE.TorusGeometry(0.07, 0.012, 6, 16) };
  function lantern(cr, cg, cb, scale, lightColor) {
    const G = new THREE.Group();
    const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; G.add(o); return o; };
    add(lanternParts.cap, mCel, 0, 0.23, 0); add(lanternParts.base, mCel, 0, -0.17, 0);
    for (let k = 0; k < 4; k++) add(lanternParts.post, mGold, Math.cos(k * 1.571 + 0.78) * 0.135, 0.03, Math.sin(k * 1.571 + 0.78) * 0.135);
    const coreM = hdr(cr, cg, cb); const core = add(lanternParts.core, coreM, 0, 0.03, 0); core.castShadow = false;
    add(lanternParts.ring, mGold, 0, 0.36, 0);
    const halo = glow(new THREE.Color(cr, cg, cb).multiplyScalar(0.28 / Math.max(cr, cg, cb)), 1.15, G);
    const light = new THREE.PointLight(lightColor, 0, 4.5, 2); light.position.y = 0.05; G.add(light);
    G.scale.setScalar(scale); scene.add(G);
    const base = new THREE.Color(cr, cg, cb);
    return { G, set(vis, k) { G.visible = vis > 0.01; coreM.color.copy(base).multiplyScalar(0.2 + 0.45 * k); halo.material.opacity = 0.6 * vis * Math.min(1.4, k); light.intensity = 1.6 * vis * k; G.scale.setScalar(scale * (0.4 + 0.6 * eout(vis))); } };
  }
  const LM = lantern(3.2, 1.9, 0.75, 1, 0xffb060), LK = lantern(2.0, 2.6, 2.2, 1, 0xd8f3e6), LS = lantern(2.4, 1.5, 0.6, 0.78, 0xffaa55);
  // an audience of small dim lanterns (Bani Israil, faceless), only in s2
  const AUD = [];
  for (let i = 0; i < 16; i++) {
    const a = -0.2 + (i / 15) * 3.5, rr = 3.2 + (i % 3) * 0.9;
    const L = lantern(1.6, 1.15, 0.6, 0.48 + rnd() * 0.08, 0xffb070); AUD.push({ L, x: -20 + Math.cos(a) * rr * 1.3, z: 2.2 + Math.sin(a) * rr * 0.75 + 1.0, ph: rnd() * 6 });
  }

  // ---------- footprints: two sets that appear behind the lanterns as they walk on the sand
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
  const path = (keys) => (t, out) => {
    if (t <= keys[0][0]) return out.set(keys[0][1], keys[0][2], keys[0][3]);
    for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t < b[0]) { const u = ease((t - a[0]) / (b[0] - a[0])); return out.set(a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u); } }
    const l = keys[keys.length - 1]; return out.set(l[1], l[2], l[3]);
  };
  const tBoard = A("s4:perahu") - 1.1, tBoarded = A("s4:perahu") - 0.35;
  const deck = (t, off, out) => { boatPos(t, out); const y = boatYaw(t), c = Math.cos(y), s = Math.sin(y); out.x += off[0] * c + off[1] * s; out.z += -off[0] * s + off[1] * c; out.y += 0.3; return out; };
  const mkLantern = (land1, land2, off) => (t, out) => {
    if (t < tBoard) return land1(t, out);
    if (t < tBoarded) { land1(tBoard, vB); deck(t, off, vC); const u = ease((t - tBoard) / (tBoarded - tBoard)); out.lerpVectors(vB, vC, u); out.y += Math.sin(Math.PI * u) * 0.6; return out; }
    if (t < K.s4e) return deck(t, off, out);
    return land2(t, out);
  };
  const s5a = K.s5, sKh = A("s5:Khidir"), sPart = A("s5:situlah"), sPart2 = A("s5:berpisah") + 1.2;
  const Mpos = mkLantern(path([[0, -20, 0.9, 1.5], [A("s3:berangkat"), -20, 0.9, 1.5], [A("s3:batu") - 0.1, -1.6, 0.9, 1.3], [A("s3:Musa#2"), -1.6, 0.9, 1.3], [A("s3:ikut"), 0.5, 0.9, 1.2]]),
    path([[s5a, 73.5, 0.9, 1.2], [sKh, 84.8, 0.9, 1.25], [sPart, 84.8, 0.9, 1.25], [sPart2, 77.5, 0.9, 1.15]]), [-0.7, 0.05]);
  const Kpos = mkLantern(path([[0, 1.9, 0.9, 1.25]]),
    path([[s5a, 74.2, 0.9, 2.1], [sKh, 85.8, 0.9, 2.05], [sPart, 85.8, 0.9, 2.05], [sPart2, 94.5, 0.9, 2.0]]), [0.7, -0.05]);
  const Spos = path([[0, -21.3, 0.85, 2.3], [A("s3:berangkat"), -21.3, 0.85, 2.3], [A("s3:batu") - 0.1, -2.9, 0.85, 2.15]]);
  const FP = [];
  const footprints = (fn, t0, t1) => {
    let last = null, dist = 0, side = 1;
    for (let t = t0; t <= t1; t += 0.02) {
      fn(t, vA);
      if (vA.z < 0.3 || vA.y > 1.2 || vA.y < 0.5) { last = null; continue; }
      if (last) { const d = Math.hypot(vA.x - last.x, vA.z - last.z); dist += d; if (dist > 0.36 && d > 0.002) { dist = 0; side = -side; const dx = vA.x - last.x, dz = vA.z - last.z, l = Math.hypot(dx, dz); FP.push({ x: vA.x - dz / l * 0.11 * side, z: vA.z + dx / l * 0.11 * side, yaw: Math.atan2(dx, dz), tc: t }); } }
      last = vA.clone();
    }
  };
  footprints(Mpos, K.s3, A("s3:ikut") + 0.2); footprints(Spos, K.s3, A("s3:batu")); footprints(Mpos, K.s5, sPart2); footprints(Kpos, K.s5, sPart2);
  const fpM = new THREE.InstancedMesh(new THREE.CircleGeometry(0.07, 10), new THREE.MeshStandardMaterial({ color: 0x9b8766, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }), FP.length);
  fpM.frustumCulled = false; fpM.receiveShadow = true; scene.add(fpM);
  const fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fs = new THREE.Vector3(), fe = new THREE.Euler();

  // ---------- s1: a small porcelain bird and one drop
  const bird = new THREE.Group(); scene.add(bird);
  const mBird = porc(0xffffff, glaze(12, "#86ad9c", 0.2, 120)), mBelly = mCream;
  const bAdd = (geo, m, x, y, z, p = bird) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
  bAdd(new THREE.SphereGeometry(0.2, 24, 16), mBird, 0, 0, 0).scale.set(1.7, 0.95, 0.95);
  bAdd(new THREE.SphereGeometry(0.19, 20, 14), mBelly, 0.03, -0.05, 0).scale.set(1.5, 0.78, 0.85);
  bAdd(new THREE.SphereGeometry(0.13, 20, 14), mBird, 0.3, 0.1, 0);
  const beak = bAdd(new THREE.ConeGeometry(0.035, 0.17, 10), mInk, 0.47, 0.08, 0); beak.rotation.z = -Math.PI / 2;
  for (const s of [-1, 1]) bAdd(new THREE.SphereGeometry(0.022, 8, 6), mInk, 0.36, 0.14, s * 0.088);
  const tail = bAdd(new THREE.ConeGeometry(0.09, 0.32, 4), mBird, -0.43, 0.06, 0); tail.rotation.z = Math.PI / 2; tail.scale.z = 0.35;
  const WINGS = [-1, 1].map((s) => { const piv = new THREE.Group(); piv.position.set(0.02, 0.1, s * 0.1); bird.add(piv); const w = bAdd(new THREE.SphereGeometry(0.2, 18, 10), mBird, -0.02, 0, s * 0.24, piv); w.scale.set(0.95, 0.12, 1.4); return { piv, s }; });
  const drop = bAdd(new THREE.SphereGeometry(0.036, 14, 10), hdr(2.2, 2.1, 1.7), 0.555, 0.035, 0);
  const dropGlow = glow(new THREE.Color(1.0, 0.85, 0.55), 0.35, drop);
  const glintG = new THREE.BufferGeometry(); glintG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
  const glintM = new THREE.PointsMaterial({ size: 18, sizeAttenuation: false, map: glowTex, color: 0xffe9b0, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const glint = new THREE.Points(glintG, glintM); glint.frustumCulled = false; glint.renderOrder = 5; scene.add(glint);
  const birdTrack = track([[-1, -55.6, -0.5, -14], [0, -53.6, -0.95, -14], [1.2, -51.2, -1.6, -14], [1.9, -49.9, -1.86, -14], [2.35, -49.2, -1.93, -14], [2.9, -48.3, -1.55, -14], [3.6, -47.2, -0.95, -14], [5, -45.2, -0.25, -14], [6.5, -43, 0.4, -14], [9, -39, 1.4, -14], [12, -34, 2.6, -14]]);
  const tDip = 2.3;

  // ---------- s3: rock at the meeting of the seas, the basket and the fish
  const rockGeo = new THREE.IcosahedronGeometry(1.4, 2);
  { const p = rockGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 + 0.12 * Math.sin(x * 3.1 + y * 1.7) * Math.cos(z * 2.3 - x) + 0.06 * Math.sin(y * 5 + z * 4); p.setXYZ(i, x * k, y * k, z * k); } rockGeo.computeVertexNormals(); }
  mTenmoku.roughness = 0.5; mTenmoku.clearcoatRoughness = 0.5;
  const rock = new THREE.Mesh(rockGeo, mTenmoku); rock.scale.set(1.2, 0.85, 1); rock.position.set(0, -1.0, -0.9); shadowy(rock); scene.add(rock);
  [[-6, -2.2, 0.7], [7.5, -1.7, 0.5], [-11, -3.4, 0.9]].forEach(([x, z, s]) => { const m = new THREE.Mesh(rockGeo, mTenmoku); m.scale.set(s * 1.2, s * 0.6, s); m.position.set(x, SEA, z); scene.add(m); });
  const basket = new THREE.Group(); scene.add(basket);
  const bowlProf = (sc) => [[0, 0], [0.16, 0], [0.18, 0.03], [0.24, 0.1], [0.27, 0.17], [0.25, 0.175], [0.21, 0.11], [0.14, 0.05], [0, 0.04]].map(([x, y]) => new THREE.Vector2(x * sc, y * sc));
  const bk = new THREE.Mesh(new THREE.LatheGeometry(bowlProf(1.5), 28), mCel); bk.castShadow = true; basket.add(bk);
  const fish = new THREE.Group(); scene.add(fish);
  { const f = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); fish.add(o); return o; };
    f(new THREE.SphereGeometry(0.1, 18, 12), porc(0xffffff, glaze(13, "#cfe0d6", 0.15, 60)), 0, 0, 0).scale.set(2.1, 0.85, 0.6);
    const tf = f(new THREE.ConeGeometry(0.08, 0.14, 4), mGold, -0.25, 0, 0); tf.rotation.z = -Math.PI / 2; tf.scale.z = 0.25;
    const df = f(new THREE.ConeGeometry(0.04, 0.09, 3), mGold, 0.02, 0.09, 0); df.scale.z = 0.3;
    for (const s of [-1, 1]) f(new THREE.SphereGeometry(0.014, 8, 6), mInk, 0.15, 0.025, s * 0.05); }
  const tLeap = A("s3:melompat"), tSplash = tLeap + 0.7;
  const FISH_IN = new THREE.Vector3(-0.6, SEA, -4.2);
  const trailM = hdr(1.5, 2.0, 1.8); trailM.transparent = true;
  const trailPts = []; for (let i = 0; i <= 14; i++) { const u = i / 14; trailPts.push(new THREE.Vector3(-0.6 + 2.2 * u + Math.sin(u * 9) * 0.6, SEA + 0.03, -4.2 - 30 * u)); }
  const trail = thread(trailPts, 0.06, trailM);
  const khGlow = glow(new THREE.Color(0.7, 0.85, 0.75), 3.2, scene); khGlow.position.set(1.4, 0.9, 0.4);
  // guide thread in s2: from the gathering along the shore to the seam
  const guideM = new THREE.MeshStandardMaterial({ color: 0xd9a648, metalness: 1, roughness: 0.25, emissive: 0xc08020, emissiveIntensity: 1.4, transparent: true });
  const guide = thread([new THREE.Vector3(-19.3, 0.04, 0.9), new THREE.Vector3(-14, 0.04, 0.55), new THREE.Vector3(-8, 0.04, 0.7), new THREE.Vector3(-3.2, 0.04, 0.35), new THREE.Vector3(-2.6, -0.3, 0.02), new THREE.Vector3(-2.6, SEA + 0.03, -0.4), new THREE.Vector3(-1.3, SEA + 0.03, -3.2), new THREE.Vector3(0, SEA + 0.03, -7), new THREE.Vector3(0.4, SEA + 0.03, -24)], 0.05, guideM, 0.2);

  // ---------- event 2 (not depicted): a small lamp on a hillside goes out; later re-lit beside the parents' home
  const hill = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 24), mCel); hill.scale.y = 0.45; hill.position.set(48, -1, 20); hill.receiveShadow = true; hill.castShadow = true; scene.add(hill);
  const hillY = (x, z) => -1 + 0.45 * Math.sqrt(Math.max(0, 81 - (x - 48) ** 2 - (z - 20) ** 2));
  const lamp = new THREE.Group(); lamp.position.copy(LAMP); scene.add(lamp);
  const lampBody = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.13, 0], [0.2, 0.05], [0.22, 0.1], [0.16, 0.15], [0.06, 0.17], [0, 0.17]].map(([x, y]) => new THREE.Vector2(x, y)), 24), mCream); lampBody.castShadow = true; lamp.add(lampBody);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.16, 10), mCream); spout.rotation.z = -1.1; spout.position.set(0.24, 0.15, 0); lamp.add(spout);
  const flameM = hdr(2.2, 1.1, 0.3);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), flameM); flame.position.set(0.31, 0.25, 0); lamp.add(flame);
  const flameGlow = glow(new THREE.Color(0.8, 0.42, 0.15), 0.7, flame);
  const lampLight = new THREE.PointLight(0xffa24a, 0, 7, 1.5); lampLight.position.set(0.31, 0.3, 0); lamp.add(lampLight);
  const reRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.2, 0.4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  reRing.rotation.x = -Math.PI / 2; reRing.position.set(LAMP.x + 0.3, LAMP.y + 0.05, LAMP.z); scene.add(reRing);
  const smoke = pts(scene, 46, { color: 0x8c8a86, size: 0.16, add: false, opacity: 0.45 });
  const smokeSeed = Array.from({ length: 46 }, () => [rnd(), rnd(), rnd()]);
  // the parents' home on the hill (s6 only)
  const home = new THREE.Group(); home.position.set(48.7, hillY(48.7, 17.8) - 0.15, 17.8); scene.add(home);
  const mkHouse = (G, w, h, d, doorM, winM) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mCream); body.position.y = h / 2; G.add(body);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(d * 0.62, d * 0.62, w * 1.08, 3), mCel); roof.rotation.z = Math.PI / 2; roof.rotation.x = Math.PI / 6 + Math.PI / 2; roof.position.y = h + d * 0.28; roof.scale.y = 1; G.add(roof);
    const dr = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.55, 0.06), doorM); dr.position.set(0, h * 0.275, -d / 2 - 0.02); G.add(dr);
    const wins = [-1, 1].map((s) => { const wm = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, h * 0.2, 0.05), winM); wm.position.set(s * w * 0.3, h * 0.6, -d / 2 - 0.02); G.add(wm); return wm; });
    shadowy(G); return wins;
  };
  const winM = hdr(0.08, 0.07, 0.06);
  mkHouse(home, 1.5, 1.1, 1.3, mInk, winM);
  const homeGlow = glow(new THREE.Color(1, 0.6, 0.25), 2.4, home); homeGlow.position.set(0, 0.7, -0.9);

  // ---------- event 3: a cold village with closed doors, the leaning wall, the hidden chest
  const VIL = [[79.5, 7.5, 2.6, 2.2, 2.4], [84.2, 9, 2.4, 2.0, 2.2], [89, 8, 2.8, 2.4, 2.4], [93.6, 9.5, 2.4, 2.1, 2.3], [77.6, 13, 2.2, 1.9, 2.2], [86.8, 13.6, 2.6, 2.3, 2.4], [92, 15, 2.3, 2.0, 2.2], [97.5, 12, 2.4, 2.2, 2.2]];
  const darkWin = new THREE.MeshStandardMaterial({ color: 0x23272a, roughness: 0.5 });
  VIL.forEach(([x, z, w, h, d]) => { const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = (rnd() - 0.5) * 0.25; scene.add(G); mkHouse(G, w, h, d, mInk, darkWin); });
  const wallPiv = new THREE.Group(); wallPiv.position.copy(WALL); scene.add(wallPiv);
  const wallM = porc(0xffffff, glaze(15, "#e9e1cd", 0.3, 200));
  const wall = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 0.5), wallM); wall.position.set(0, 1.3, 0.25); wallPiv.add(wall);
  const coping = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.16, 0.62), mCel); coping.position.set(0, 2.68, 0.25); wallPiv.add(coping);
  shadowy(wallPiv);
  const qW = mulberry(303);
  const wallCrack = cracks(wallPiv, [
    { pts: jag(qW, [[-2.6, 2.58], [-2.0, 1.8], [-2.4, 1.1], [-1.7, 0.3], [-1.9, 0.02]], 0.45), s: 0, l: 0.6 },
    { pts: jag(qW, [[0.4, 2.58], [0.9, 1.9], [0.3, 1.2], [1.0, 0.6], [0.6, 0.02]], 0.45), s: 0.15, l: 0.6 },
    { pts: jag(qW, [[0.9, 1.9], [1.9, 1.6], [2.3, 1.75]], 0.45), s: 0.45, l: 0.4 },
    { pts: jag(qW, [[3.0, 0.02], [2.3, 0.8], [2.7, 1.5], [3.2, 1.9]], 0.45), s: 0.3, l: 0.55 },
  ], 0.035, (u, v) => new THREE.Vector3(u, v, -0.012));
  const WCH = [];
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.TetrahedronGeometry(0.12 + qW() * 0.08), wallM); c.castShadow = true; scene.add(c); WCH.push({ c, x: WALL.x - 2.8 + i * 1.1 + qW() * 0.4, z0: WALL.z + 0.1, z1: WALL.z - 0.6 - qW() * 1.2, t0: A("s5:negeri") + i * 0.22, r: qW() * 6 }); }
  const qD = mulberry(512);
  const doorCrack = cracks(doorG, [
    { pts: jag(qD, [[83, -0.35], [84.6, -0.9], [86, -0.6], [87.6, -1.2], [89.2, -0.8]], 0.4), s: 0, l: 0.7 },
    { pts: jag(qD, [[86, -0.6], [85.6, -1.4], [86.3, -1.95]], 0.4), s: 0.3, l: 0.6 },
  ], 0.035, (u, v) => new THREE.Vector3(u, v, -0.03));
  const chest = new THREE.Group(); chest.position.set(86, -2.0, 1.4); scene.add(chest);
  { const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 0.75), mInk); body.position.y = 0.25; chest.add(body);
    for (const x of [-0.42, 0, 0.42]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.77), mGold); b.position.set(x, 0.25, 0); chest.add(b); } }
  const lidPiv = new THREE.Group(); lidPiv.position.set(0, 0.5, 0.375); chest.add(lidPiv);
  { const lid = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.18, 0.79), mInk); lid.position.set(0, 0.09, -0.395); lidPiv.add(lid); const lb = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.06, 0.81), mGold); lb.position.set(0, 0.03, -0.395); lidPiv.add(lb); }
  const goldIn = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.65), hdr(2.6, 1.7, 0.5)); goldIn.position.y = 0.47; chest.add(goldIn);
  const chestGlow = glow(new THREE.Color(1, 0.7, 0.25), 3.2, chest); chestGlow.position.set(0, 0.6, 0);
  const chestLight = new THREE.PointLight(0xffc060, 0, 6, 1.4); chestLight.position.set(0, 0.8, -0.6); chest.add(chestLight);
  const SAP = [83.4, 88.6].map((x) => { const G = new THREE.Group(); G.position.set(x, 0, 2.0); scene.add(G); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.5, 6), mCelDeep); st.position.y = 0.25; G.add(st); for (const s of [-1, 1]) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mCel); lf.scale.set(1.6, 0.35, 0.8); lf.position.set(s * 0.12, 0.45 + s * 0.04, 0); lf.rotation.z = s * 0.5; G.add(lf); } shadowy(G); return G; });

  // ---------- s8: a broken celadon bowl that reassembles with gold seams
  const bowlG = new THREE.Group(); bowlG.position.copy(BOWL); scene.add(bowlG);
  const prof = [[0.001, 0], [0.42, 0], [0.45, 0.07], [0.4, 0.1], [0.66, 0.24], [0.94, 0.48], [1.12, 0.76], [1.18, 0.92], [1.13, 0.94], [1.06, 0.88], [0.88, 0.52], [0.6, 0.29], [0.001, 0.18]].map(([x, y]) => new THREE.Vector2(x, y));
  const mBowl = porc(0xffffff, glaze(21, "#9fbfab", 0.25, 160), { side: THREE.DoubleSide });
  const PH = [0, 1.15, 2.05, 3.25, 4.15, 5.2, Math.PI * 2];
  const qS = mulberry(808);
  const SH = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 10, PH[i], PH[i + 1] - PH[i]), mBowl); m.castShadow = true; m.receiveShadow = true;
    const piv = new THREE.Group(); bowlG.add(piv); piv.add(m);
    const mid = (PH[i] + PH[i + 1]) / 2, dir = new THREE.Vector3(Math.sin(mid), 0, Math.cos(mid));
    SH.push({ piv, off: dir.clone().multiplyScalar(0.8 + qS() * 0.7).add(new THREE.Vector3(0, -0.12, 0)), rot: new THREE.Euler((qS() - 0.5) * 1.6, (qS() - 0.5) * 1.4, (qS() - 0.5) * 1.6), d: i * 0.22 });
  }
  const outer = [[1.18, 0.92], [1.12, 0.76], [0.94, 0.48], [0.66, 0.24], [0.45, 0.07]];
  const bowlSeams = cracks(bowlG, PH.slice(0, 6).map((ph, i) => ({ pts: outer.map(([, y], k) => [ph + (k ? (qS() - 0.5) * 0.09 : 0), y]), s: i * 0.06, l: 0.7 })), 0.022,
    (u, v) => { const rr = outer.find(([, Y]) => Y === v)[0]; return new THREE.Vector3(Math.sin(u) * rr * 1.015, v, Math.cos(u) * rr * 1.015); });
  const bowlGlow = glow(new THREE.Color(1, 0.75, 0.35), 4.2, bowlG); bowlGlow.position.y = 0.6;

  // ---------- s7: the gold thread of the whole journey
  const journeyM = hdr(2.4, 1.6, 0.5);
  const journey = thread([
    new THREE.Vector3(-49, SEA + 0.05, -14), new THREE.Vector3(-36, SEA + 0.05, -7), new THREE.Vector3(-24, SEA + 0.05, -1.5), new THREE.Vector3(-20, 0.06, 1.5), new THREE.Vector3(-10, 0.06, 1.3),
    new THREE.Vector3(-1, 0.06, 1.3), new THREE.Vector3(3, SEA + 0.05, -3.5), new THREE.Vector3(14, SEA + 0.05, -9), new THREE.Vector3(25, SEA + 0.05, -12),
    new THREE.Vector3(33, SEA + 0.05, -4), new THREE.Vector3(38, 0.06, 4), new THREE.Vector3(43, 1.6, 11), new THREE.Vector3(46.6, 2.55, 15.5),
    new THREE.Vector3(55, 1.2, 12), new THREE.Vector3(66, 0.06, 4), new THREE.Vector3(78, 0.06, 1.4), new THREE.Vector3(86, 0.06, 1.5), new THREE.Vector3(97, 0.06, 2.6), new THREE.Vector3(106, 0.06, 4),
  ], 0.3, journeyM, 0.5);
  const EVG = [BOAT_AT.clone().setY(SEA + 0.6), LAMP.clone().setY(LAMP.y + 0.6), new THREE.Vector3(86, 0.8, 1.5)].map((p) => { const g = glow(new THREE.Color(1, 0.7, 0.3), 6, scene); g.position.copy(p); return g; });

  // ---------- scenery for depth: bonsai pines, pebbles, floating gold dust
  const trunkM = porc(0x3a2c22, null, { roughness: 0.5 });
  let placed = 0;
  while (placed < 26) {
    const x = -60 + rnd() * 190, z = 7 + rnd() * 34;
    if (Math.hypot(x - 48, z - 20) < 11 || (x > 74 && x < 100 && z < 19) || Math.hypot(x - BOWL.x, z - BOWL.z) < 5 || (x > -26 && x < -14 && z < 9) || (x > 36 && x < 54 && z < 17)) continue;
    placed++;
    const G = new THREE.Group(); G.position.set(x, 0, z); const s = 0.8 + rnd() * 0.9; G.scale.setScalar(s); scene.add(G);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 1.8, 6), trunkM); tr.position.y = 0.9; tr.rotation.z = (rnd() - 0.5) * 0.4; G.add(tr);
    for (let k = 0; k < 3; k++) { const pd = new THREE.Mesh(new THREE.SphereGeometry(0.55 - k * 0.12, 14, 8), k % 2 ? mCel : mCelDeep); pd.scale.y = 0.38; pd.position.set((rnd() - 0.5) * 0.8, 1.2 + k * 0.45, (rnd() - 0.5) * 0.5); G.add(pd); }
    shadowy(G);
  }
  const pebG = new THREE.IcosahedronGeometry(0.12, 1);
  const peb = new THREE.InstancedMesh(pebG, mCream, 140); scene.add(peb);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < 140; i++) { const x = -60 + rnd() * 190, z = 1 + rnd() * 26; s.set(0.6 + rnd(), 0.4 + rnd() * 0.4, 0.6 + rnd()); p.set(x, 0.03, z); m.compose(p, q, s); peb.setMatrixAt(i, m); } }
  const dust = pts(scene, 150, { color: 0xf3cf86, size: 0.06, add: true, opacity: 0.8 });
  const dseed = Array.from({ length: 150 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- camera
  const camT = mtrack([
    [0, -52.8, -0.6, -18.6, -53.3, -0.95, -14],
    [1.6, -50.4, -1.3, -18.2, -50.5, -1.7, -14],
    [A("s1:paruhnya") + 0.5, -49.4, -1.7, -17.8, -49.1, -1.95, -14],
    [A("s1:Sebanyak"), -48.4, -1.45, -17.7, -48.2, -1.6, -14],
    [A("s1:manusia"), -47.4, 2.5, -24, -47, -1.4, -14],
    [A("s1:Allah"), -46.5, 16, -42, -45.5, -1.6, -13],
    [K.s2 + 0.2, -40, 13, -36, -32, -0.5, -6],
    [A("s2:Musa"), -24, 4.4, -11, -20, 1.0, 3],
    [A("s2:berilmu"), -22.6, 3.2, -8, -20, 1.1, 2.6],
    [A("s2:aku"), -21.3, 2.3, -5.8, -20, 1.35, 2],
    [A("s2:menegurnya"), -21.1, 2.4, -5.9, -20, 1.2, 2],
    [A("s2:menunjukkan"), -19, 5, -11, -12, 0.2, 0],
    [A("s2:pertemuan"), -10, 13, -27, 0, -1.5, -6],
    [A("s2:Hadis"), -6, 15.5, -30, 0, -1.8, -8],
    [K.s2e, -14, 9, -20, -12, 0, 0],
    [A("s3:berangkat") + 0.3, -21, 4.2, -9.5, -17, 0.8, 1.6],
    [A("s3:ikan"), -12.5, 3.0, -7.2, -10, 0.7, 1.5],
    [A("s3:batu"), -5, 3.2, -8.5, -0.6, -0.3, -1.8],
    [A("s3:melompat"), -5.4, 3.0, -8.8, -0.4, -0.7, -2.8],
    [A("s3:laut") + 0.4, -6, 5, -12.5, 0, -1.6, -7],
    [A("s3:tempatnya"), 3, 3, -8.5, 1.3, 0.6, 0.6],
    [A("s3:Musa#2"), 2.2, 2.4, -6.6, 1, 0.9, 1.2],
    [A("s3:sabar"), 1.4, 2.1, -5.8, 1, 0.95, 1.3],
    [K.s4 + 0.1, 3.5, 3.0, -12.5, 7, -1.2, -4.5],
    [A("s4:perahu"), 7.5, 2.6, -14, 10, -1.6, -5.8],
    [A("s4:dilubangi"), 22.2, 0.9, -20.4, 25.2, -1.9, -12.2],
    [A("s4:protes"), 21.6, 1.5, -21.2, 25.2, -1.7, -12],
    [A("s4:Kedua") + 0.2, 30, 7, -14, 38, 1, 2],
    [A("s4:anak"), 44.4, 3.7, 9.8, 46.7, 2.75, 15.5],
    [A("s4:membunuhnya"), 45.1, 3.4, 11.4, 46.7, 2.7, 15.5],
    [A("s4:keras") - 0.6, 45.3, 3.4, 11.9, 46.7, 2.7, 15.5],
    [A("s4:keras"), 45.35, 3.45, 12.0, 46.7, 2.72, 15.5],
    [K.s5 + 0.4, 51, 8, 2, 50, 2.3, 14],
    [A("s5:menjamu"), 78.5, 3.8, -8.8, 85, 1.3, 4.5],
    [A("s5:Khidir"), 82.5, 2.4, -6.2, 85.5, 1.2, 3],
    [A("s5:dinding"), 83.8, 2.0, -5.6, 86, 1.3, 3],
    [A("s5:upah"), 84.4, 2.1, -5.3, 86, 1.3, 3],
    [A("s5:lagi"), 84, 4.5, -10.5, 86, 0.8, 2],
    [A("s5:berpisah"), 85, 8.5, -15.5, 86, 0, 2],
    [K.s6 + 0.3, 74, 13, -26, 60, -0.5, -6],
    [A("s6:dijelaskan") + 0.3, 46, 12, -34, 30, -1.5, -12],
    [A("s6:Perahu"), 23.6, 0.3, -19.6, 25.25, -2.0, -12.9],
    [A("s6:miskin"), 24.0, -0.3, -18.4, 25.25, -2.05, -12.9],
    [A("s6:raja"), 14, 15, -38, 31, -2, -16],
    [A("s6:baik"), 15, 17, -42, 33, -2, -17],
    [A("s6:Anak") + 0.4, 34, 10, -12, 44, 2, 10],
    [A("s6:dikhawatirkan") + 0.2, 43.5, 3.8, 6.6, 47.2, 2.9, 16],
    [A("s6:beriman"), 44, 3.6, 8.2, 47.4, 3.0, 16.2],
    [A("s6:kekafiran") + 0.5, 44, 4.2, 7.6, 47.4, 3.0, 16.4],
    [A("s6:bawah"), 64, 9, -10, 80, 0, 2],
    [A("s6:tersimpan") - 0.2, 84.3, 0.0, -6.6, 86, -1.0, 1.3],
    [A("s6:yatim") + 0.3, 84.6, 0.4, -6.0, 86, -0.7, 1.6],
    [K.s7 + 0.6, 122, 42, -44, 50, -2, 0],
    [A("s7:sendiri"), 126, 46, -42, 42, -2, 1],
    [A("s7:delapan"), 118, 15, -20, 80, -1, 3],
    [K.s8 + 0.5, 103.2, 2.9, -3.6, 106, 0.7, 4],
    [A("s8:penyelamat"), 103.9, 2.5, -3.0, 106, 0.75, 4],
    [A("s8:Pernahkah"), 104.4, 2.2, -2.6, 106, 0.8, 4],
    [K.end, 103.6, 3.4, -4.0, 106, 0.7, 4],
    [K.dur, 103.4, 3.6, -4.3, 106, 0.7, 4],
  ]);

  // ---------- mood: warm dawn, dusk on the hill, cold in the village, warm again for the explanation
  const cWarmSky = new THREE.Color(0xf3e7cf), cColdSky = new THREE.Color(0xb7c4cc), cDusk = new THREE.Color(0xd9c3a6);
  const cWarmSun = new THREE.Color(0xffe6c0), cColdSun = new THREE.Color(0xcfdbe6);
  const cFogW = new THREE.Color(0xeae2cf), cFogC = new THREE.Color(0xc3ccd0), cFogD = new THREE.Color(0xcdbca6);
  const tmpC = new THREE.Color();
  const cold = (t) => ramp(t, K.s5 - 0.3, K.s5 + 0.8) * (1 - ramp(t, A("s5:upah"), K.s6 + 0.8)) + 0.35 * bump(t, A("s6:bawah"), A("s6:tersimpan"), A("s6:harta"));
  const dusk = (t) => ramp(t, A("s4:Kedua"), A("s4:anak")) * (1 - ramp(t, K.s4e, K.s5 + 0.6)) + ramp(t, A("s6:Anak"), A("s6:dikhawatirkan")) * (1 - ramp(t, A("s6:beriman"), A("s6:Dan") + 0.4)) * 0.85;

  const look = new THREE.Vector3(), bp = new THREE.Vector3(), mm = new THREE.Matrix4(), qq = new THREE.Quaternion(), ss = new THREE.Vector3(), pp = new THREE.Vector3();
  const tTyr0 = A("s6:miskin") - 1.0, tTyr1 = A("s6:merampas") + 0.6, tTow = A("s6:baik") - 0.1;

  return (t) => {
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.06, c[1] + Math.sin(t * 0.23) * 0.05, c[2] + Math.cos(t * 0.27) * 0.06);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);
    sky.position.copy(cam.position);

    // light and mood
    const cd = cold(t), dk = dusk(t);
    hemi.color.copy(cWarmSky).lerp(cColdSky, cd).lerp(cDusk, dk);
    hemi.intensity = 1.2 - 0.25 * cd - 0.55 * dk;
    sun.color.copy(cWarmSun).lerp(cColdSun, cd);
    sun.intensity = 3.0 - 1.2 * cd - 2.1 * dk;
    sun.position.set(look.x - 18, look.y + 30, look.z - 16); sun.target.position.copy(look);
    tmpC.copy(cFogW).lerp(cFogC, cd).lerp(cFogD, dk);
    scene.fog.color.copy(tmpC); SU.uFog.value.copy(tmpC); SU.uSky.value.copy(tmpC);
    skyM.color.setRGB(1, 1, 1).lerp(new THREE.Color(0.8, 0.86, 0.9), cd).lerp(new THREE.Color(0.82, 0.74, 0.66), dk);
    SU.uT.value = t;
    SU.uSeam.value = 0.9 * bump(t, A("s2:pertemuan") - 0.2, A("s2:laut") + 0.4, K.s2e + 0.5) + 0.6 * bump(t, A("s2:Khidir"), A("s2:Khidir") + 0.5, A("s3:berangkat")) + 0.4 * bump(t, tSplash, tSplash + 0.6, A("s3:Musa#2"));
    SU.uR0.value.set(-48.95, -14, tDip, 1);
    SU.uR1.value.set(FISH_IN.x, FISH_IN.z, tSplash, 1);
    SU.uR2.value.set(BOAT_AT.x + 0.2, BOAT_AT.z - 1.2, A("s4:dilubangi") + 0.1, 1);

    // bird
    const b = birdTrack(t);
    bird.visible = t < K.s3;
    bird.position.set(b[0], b[1], b[2]);
    const bv = birdTrack(t + 0.05);
    const pitch = Math.atan2(bv[1] - b[1], Math.max(0.01, bv[0] - b[0])) * 0.6 - 0.6 * bump(t, 1.85, tDip, 2.8);
    bird.rotation.set(Math.sin(t * 1.7) * 0.05, 0, pitch);
    const held = bump(t, 1.6, 1.95, 2.85);
    WINGS.forEach(({ piv, s }) => { piv.rotation.x = s * (Math.sin(t * 15) * 0.75 * (1 - held) + 0.85 * held); });
    const dropOn = ramp(t, tDip + 0.15, tDip + 0.35);
    drop.visible = dropOn > 0.01; drop.scale.setScalar(Math.max(0.001, dropOn)); dropGlow.material.opacity = dropOn * 0.9;
    drop.getWorldPosition(pp); glintG.attributes.position.setXYZ(0, pp.x, pp.y, pp.z); glintG.attributes.position.needsUpdate = true;
    glintM.opacity = ramp(t, A("s1:Sebanyak"), A("s1:manusia")) * (1 - ramp(t, K.s2 + 0.4, K.s2 + 1.6)) * (0.8 + 0.2 * Math.sin(t * 9));

    // lanterns
    const visM = ramp(t, K.s2 - 0.3, K.s2 + 0.4) * (1 - ramp(t, A("s4:Kedua") + 0.05, A("s4:Kedua") + 0.35)) + ramp(t, K.s5 - 0.1, K.s5 + 0.4) * (1 - ramp(t, sPart2 - 0.6, sPart2 + 0.2));
    const visK = ramp(t, A("s3:situlah") - 0.1, A("s3:tempatnya") + 0.2) * (1 - ramp(t, A("s4:Kedua") + 0.05, A("s4:Kedua") + 0.35)) + ramp(t, K.s5 - 0.1, K.s5 + 0.4) * (1 - ramp(t, sPart2 - 0.6, sPart2 + 0.2));
    const visS = ramp(t, K.s3 - 0.1, K.s3 + 0.5) * (1 - ramp(t, A("s3:Jawabnya"), K.s3e));
    const kM = 1 + 0.75 * bump(t, A("s2:aku") - 0.1, A("s2:aku") + 0.3, A("s2:menegurnya")) - 0.35 * bump(t, A("s2:menegurnya"), A("s2:menegurnya") + 0.6, A("s2:pertemuan"))
      + 0.7 * bump(t, A("s4:protes") - 0.2, A("s4:protes") + 0.1, A("s4:protes") + 0.5) + 0.5 * bump(t, A("s5:bertanya") - 0.2, A("s5:bertanya") + 0.1, A("s5:lagi") + 0.3);
    const liftM = 0.25 * bump(t, A("s2:aku") - 0.1, A("s2:aku") + 0.3, A("s2:menegurnya")) - 0.1 * bump(t, A("s2:menegurnya"), A("s2:menegurnya") + 0.6, A("s2:pertemuan"));
    Mpos(t, vA); LM.G.position.copy(vA); LM.G.position.y += liftM + Math.sin(t * 2.1) * 0.03; LM.G.rotation.z = Math.sin(t * 3.1) * 0.05; LM.set(visM, kM);
    Kpos(t, vA); LK.G.position.copy(vA); LK.G.position.y += Math.sin(t * 1.9 + 1) * 0.03; LK.G.rotation.z = Math.sin(t * 2.7 + 1) * 0.05; LK.set(visK, 1);
    Spos(t, vA); LS.G.position.copy(vA); LS.G.position.y += Math.sin(t * 2.3 + 2) * 0.03; LS.set(visS, 0.8);
    const visA = ramp(t, K.s2 - 0.3, K.s2 + 0.6) * (1 - ramp(t, K.s3 - 0.2, K.s3 + 0.8));
    AUD.forEach((a) => { a.L.G.position.set(a.x, 0.62 + Math.sin(t * 1.5 + a.ph) * 0.03, a.z); a.L.set(visA, 0.55 + 0.1 * Math.sin(t * 2 + a.ph)); });
    khGlow.material.opacity = 0.7 * bump(t, A("s2:Khidir") - 0.2, A("s2:Khidir") + 0.4, K.s2e + 0.4);

    // footprints
    for (let i = 0; i < FP.length; i++) {
      const f = FP[i], on = ramp(t, f.tc, f.tc + 0.25) * (1 - ramp(t, K.s7 + 3, K.s7 + 4.5));
      fe.set(-Math.PI / 2, 0, f.yaw); fq.setFromEuler(fe); fs.set(Math.max(0.0001, on), Math.max(0.0001, on * 1.7), 1);
      fm.compose(pp.set(f.x, 0.022, f.z), fq, fs); fpM.setMatrixAt(i, fm);
    }
    fpM.instanceMatrix.needsUpdate = true;

    // basket, fish, trail, guide
    if (t < A("s3:batu") - 0.4) { Spos(t, vA); basket.position.set(vA.x, vA.y - 0.52, vA.z); }
    else { Spos(A("s3:batu") - 0.4, vA); const u = ease((t - A("s3:batu") + 0.4) / 0.7); basket.position.set(vA.x + (0 - vA.x) * u, vA.y - 0.52 + (0.2 - vA.y + 0.52) * u + Math.sin(Math.PI * u) * 0.3, vA.z + (-0.75 - vA.z) * u); }
    basket.visible = t > K.s3 - 0.2 && t < K.s5;
    basket.scale.setScalar(Math.max(0.001, ramp(t, K.s3 - 0.2, K.s3 + 0.4)));
    if (t < tLeap) { fish.position.set(basket.position.x, basket.position.y + 0.14 + Math.sin(t * 3) * 0.004, basket.position.z); fish.rotation.set(0, 0.4, 0.05); }
    else { const u = clamp01((t - tLeap) / (tSplash - tLeap)); fish.position.set(basket.position.x + (FISH_IN.x - basket.position.x) * u, basket.position.y + 0.14 + (FISH_IN.y - basket.position.y - 0.14) * u + Math.sin(Math.PI * u) * 1.5, basket.position.z + (FISH_IN.z - basket.position.z) * u); fish.rotation.set(0, Math.PI / 2 + 0.15, -1.6 * u + 0.9 * (1 - u)); }
    fish.visible = basket.visible && t < tSplash + 0.04;
    trail.set(ramp(t, tSplash, A("s3:tempatnya") + 0.5)); trailM.opacity = 1 - ramp(t, K.s3e, K.s4 + 1.5);
    guide.set(ramp(t, A("s2:menunjukkan"), A("s2:laut") + 0.3)); guideM.opacity = 1 - ramp(t, K.s3 - 0.4, K.s3 + 0.8);

    // the boat, the hole, the fleet
    boatPos(t, bp); boat.position.copy(bp); boat.rotation.y = boatYaw(t); boat.rotation.z = Math.sin(t * 1.1) * 0.025;
    const tHole = A("s4:dilubangi");
    hole.visible = t > tHole; hole.scale.set(eout((t - tHole) / 0.3) + 0.001, 0.8 * eout((t - tHole) / 0.3) + 0.001, 1);
    const goldBoat = ramp(t, A("s6:Perahu") + 0.2, A("s6:miskin") + 0.2);
    boatCrack.set(ramp(t, tHole - 0.25, tHole + 0.35), goldBoat, 0.35 + 1.4 * goldBoat * (1 - 0.5 * ramp(t, A("s6:Anak"), A("s6:Anak") + 1)) + 1.3 * bump(t, A("s7:apa"), A("s7:apa") + 0.6, A("s7:sendiri")));
    holeRing.visible = goldBoat > 0.5; holeRing.material.emissiveIntensity = 1.2 * goldBoat;
    CHIPS.forEach((ch, i) => { const a = t - tHole - i * 0.03; ch.c.visible = a > 0 && a < 1.2; if (ch.c.visible) { ch.c.position.set(hole.position.x + ch.vx * a, hole.position.y + ch.vy * a - 4.9 * a * a, hole.position.z + ch.vz * a); ch.c.rotation.set(ch.r + a * 6, a * 4, 0); } });
    const fleetOn = t > tTyr0 - 0.5 && t < tTow + 5.5;
    TS.forEach(({ G, a, i }) => {
      G.visible = fleetOn;
      const u = ease((t - tTyr0 - i * 0.15) / (tTyr1 - tTyr0 - 0.3));
      let x, z;
      if (i === 0) { const u1 = ease((t - tTyr0) / (tTyr1 - tTyr0 - 0.9)), u2 = ease((t - tTyr1 + 0.9) / 0.9); x = a[0] + (a[2] - a[0]) * u1 + (a[4] - a[2]) * u2; z = a[1] + (a[3] - a[1]) * u1 + (a[5] - a[3]) * u2; }
      else { x = a[0] + (a[2] - a[0]) * u; z = a[1] + (a[3] - a[1]) * u; }
      const tw = Math.max(0, t - tTow), dx = 9 * tw * tw / (1 + tw) * 0.9, dz = -6 * tw * tw / (1 + tw) * 0.9;
      G.position.set(x + dx, SEA + 0.45 * 1.4 + Math.sin(t * 1.2 + i) * 0.05, z + dz);
      G.rotation.y = 0.15 + 0.4 * ramp(t, tTow, tTow + 1.2); G.rotation.z = Math.sin(t * 0.9 + i) * 0.03;
    });
    SB.forEach((s, i) => {
      const tw = Math.max(0, t - tTow - 0.15), dx = 9 * tw * tw / (1 + tw) * 0.9, dz = -6 * tw * tw / (1 + tw) * 0.9;
      s.G.visible = t > K.s4 - 1 && t < tTow + 5.5;
      s.G.position.set(s.x + dx + Math.sin(t * 0.35 + i) * 0.15, SEA + 0.36 + Math.sin(t * 1.3 + i * 2) * 0.03, s.z + dz);
      s.G.rotation.y = 0.2 * i + 0.4 * ramp(t, tTow, tTow + 1.2); s.G.rotation.z = Math.sin(t * 1 + i) * 0.03;
    });

    // the lamp: alight, goes out, smoke; re-lit as a new warm light beside the parents' home
    const tOut = A("s4:membunuhnya") + 0.25, tRe = A("s6:beriman");
    const lit = (1 - ramp(t, tOut, tOut + 0.55)) + ramp(t, tRe, tRe + 0.5) * 1.25;
    const fl = 1 + 0.08 * Math.sin(t * 23) + 0.05 * Math.sin(t * 37);
    flame.scale.set(Math.max(0.001, lit) * fl, Math.max(0.001, lit) * fl * (1 + 0.15 * Math.sin(t * 17)), Math.max(0.001, lit) * fl);
    flame.visible = lit > 0.01; flameGlow.material.opacity = Math.min(1, lit) * 0.95; lampLight.intensity = 1.6 * lit;
    const sa = (1 - ramp(t, tOut + 3.5, tOut + 4.5));
    for (let i = 0; i < 46; i++) {
      const s = smokeSeed[i], age = t - (tOut + 0.25 + s[0] * 1.6);
      if (age > 0 && age < 2.6 && sa > 0) { smoke.pos[i * 3] = LAMP.x + 0.31 + Math.sin(age * 2 + s[1] * 6) * 0.08 * (1 + age) + age * 0.12; smoke.pos[i * 3 + 1] = LAMP.y + 0.3 + age * 0.55; smoke.pos[i * 3 + 2] = LAMP.z + (s[2] - 0.5) * 0.2 * age; }
      else { smoke.pos[i * 3 + 1] = -500; }
    }
    smoke.commit();
    const rr2 = clamp01((t - tRe - 0.1) / 1.4); reRing.visible = rr2 > 0 && rr2 < 1; reRing.scale.setScalar(0.2 + 3.2 * eout(rr2)); reRing.material.opacity = 1 - rr2;
    const hU = ramp(t, A("s6:dikhawatirkan"), A("s6:dikhawatirkan") + 1.1);
    home.visible = t > A("s6:Anak") && t < K.s7 + 6; home.scale.set(1, Math.max(0.001, back(hU)), 1);
    const win = ramp(t, tRe - 0.1, tRe + 0.5);
    winM.color.setRGB(0.08 + 2.6 * win, 0.07 + 1.6 * win, 0.06 + 0.5 * win); homeGlow.material.opacity = 0.75 * win;

    // the wall: leaning, chips falling, straightened, chips back in place, gold flows
    const tUp0 = A("s5:menegakkan"), tUp1 = A("s5:roboh") + 0.1;
    wallPiv.rotation.x = -0.2 * (1 - eout((t - tUp0) / (tUp1 - tUp0))) + (t < tUp0 ? Math.sin(t * 2.2) * 0.006 * ramp(t, K.s5, K.s5 + 1) : 0);
    WCH.forEach((w, i) => {
      const fa = clamp01((t - w.t0) / 0.55), back_ = ease((t - tUp0 - i * 0.05) / (tUp1 - tUp0));
      const y0 = 2.5, gy = 0.1;
      const yFall = y0 + (gy - y0) * fa * fa, z = w.z0 + (w.z1 - w.z0) * fa;
      w.c.visible = t > w.t0 - 0.05 && back_ < 0.98;
      w.c.position.set(w.x, yFall + (y0 - yFall) * back_, z + (w.z0 - z) * back_);
      w.c.rotation.set(w.r + fa * 3, fa * 2, 0);
    });
    const gWall = ramp(t, tUp1 - 0.1, A("s5:upah") + 0.4);
    wallCrack.set(t > K.s5 - 1 ? 1 : 0, gWall, 0.35 + 1.4 * gWall * (1 - 0.6 * ramp(t, A("s5:Musa"), K.s6)) + 1.3 * bump(t, A("s7:apa"), A("s7:apa") + 0.6, A("s7:sendiri")));

    // the hidden treasure
    const tTr = A("s6:tersimpan");
    const gDoor = ramp(t, tTr - 0.4, tTr + 0.3), open = ease((t - tTr - 0.3) / 0.8);
    doorCrack.set(gDoor > 0 ? 1 : 0, gDoor, 1.6 * gDoor);
    doorG.position.y = -2.2 * open; door.material.opacity = 1 - open; doorG.visible = open < 0.99;
    const shine = ramp(t, tTr, tTr + 0.9);
    lidPiv.rotation.x = 0.75 * ease((t - A("s6:harta")) / 0.8);
    chestGlow.material.opacity = shine * 0.9; chestLight.intensity = 6 * shine;
    SAP.forEach((g, i) => { const u = ramp(t, A("s6:dua") - 0.1 + i * 0.2, A("s6:yatim") + 0.4 + i * 0.2); g.scale.setScalar(Math.max(0.001, back(u))); g.visible = u > 0.001; });

    // the bowl
    SH.forEach((s) => {
      const u = back(clamp01((t - K.s8 - 0.2 - s.d) / 1.1), 1.2);
      s.piv.position.copy(s.off).multiplyScalar(1 - u);
      s.piv.rotation.set(s.rot.x * (1 - u), s.rot.y * (1 - u), s.rot.z * (1 - u));
    });
    const gBowl = ramp(t, A("s8:penyelamat") - 0.2, A("s8:pahami") + 0.2);
    bowlSeams.set(gBowl > 0 ? 1 : 0, gBowl, 0.5 + 1.6 * gBowl);
    bowlGlow.material.opacity = 0.55 * gBowl * (0.85 + 0.15 * Math.sin(t * 2));

    // the journey thread (s7)
    const jp = ramp(t, K.s7 + 0.4, A("s7:sendiri") + 0.6);
    journey.set(jp); journeyM.color.setRGB(2.4, 1.6, 0.5).multiplyScalar(1 - 0.6 * ramp(t, K.s8, K.s8 + 1.5));
    journey.m.visible = journey.m.visible && t < K.s8 + 2;
    [0.42, 0.66, 0.85].forEach((k, i) => { EVG[i].material.opacity = 0.9 * bump(t, K.s7 + 0.4 + (A("s7:sendiri") + 0.2 - K.s7) * k, K.s7 + 0.9 + (A("s7:sendiri") + 0.2 - K.s7) * k, K.s8); });

    // gold dust around the subject
    for (let i = 0; i < 150; i++) {
      const s = dseed[i];
      dust.pos[i * 3] = look.x + (((s[0] * 16 + t * 0.12 * (0.5 + s[3])) % 16) - 8);
      dust.pos[i * 3 + 1] = look.y - 1.5 + (((s[1] * 6 + t * 0.08 * (0.4 + s[2])) % 6));
      dust.pos[i * 3 + 2] = look.z - 9 + s[2] * 13 + Math.sin(t * 0.5 + s[0] * 9) * 0.3;
    }
    dust.commit();

    comp.render();
  };
}
