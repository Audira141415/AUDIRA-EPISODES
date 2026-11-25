// EP06 IBRAHIM, API JADI DINGIN. VINTAGEFORGE: the whole world is printed as an antique copper engraving on sepia parchment
// (a post pass turns light into swelling hatch lines and keeps copper, gold and fire colour in the paper tone).
// Nabi Ibrahim is never shown: his presence is one small clay oil lamp and the trail of light it leaves on the ground.
// Layout: temple courtyard with two rows of idols at the origin, ziggurat at z=-40, dune crest at z=-84 under the night sky
// (celestial dial at z=-300), the furnace on the plaza at z=+45 outside the gate. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const FUR = new THREE.Vector3(0, 0, 45);      // furnace centre
const CREST_Z = -84;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xeadcc0, fog: 0.0036, exp: 1.0, bloom: [0.3, 0.45, 0.88], shadow: true });
  r.toneMapping = THREE.NoToneMapping;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(6069);

  // ---------- engraving pass: light becomes hatch lines on parchment, hue survives in the paper tone
  const EU = { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1080, 1920) }, uNight: { value: 0 } };
  const engr = new THREE.ShaderMaterial({
    uniforms: EU,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uNight;varying vec2 vUv;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}
vec3 S(vec2 uv){return pow(max(texture2D(tDiffuse,uv).rgb,0.),vec3(1./2.2));}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
float hatch(vec2 p,float a,float per,float w){float c=dot(p,vec2(cos(a),sin(a)));float f=abs(fract(c/per)-.5)*per;return 1.-smoothstep(w*.5-.55,w*.5+.55,f);}
void main(){
 vec2 px=vUv*uRes;
 vec3 c=S(vUv);float L=lum(c);
 vec2 e=1.6/uRes;
 float a1=lum(S(vUv+vec2(-e.x,e.y))),a2=lum(S(vUv+vec2(0.,e.y))),a3=lum(S(vUv+vec2(e.x,e.y)));
 float b1=lum(S(vUv+vec2(-e.x,0.))),b3=lum(S(vUv+vec2(e.x,0.)));
 float c1=lum(S(vUv+vec2(-e.x,-e.y))),c2=lum(S(vUv+vec2(0.,-e.y))),c3=lum(S(vUv+vec2(e.x,-e.y)));
 float gx=(a3+2.*b3+c3)-(a1+2.*b1+c1),gy=(a1+2.*a2+a3)-(c1+2.*c2+c3);
 float edge=smoothstep(.13,.36,length(vec2(gx,gy)));
 float d=1.-L;
 vec2 q=px+vec2(vn(px*.011)*7.,vn(px*.011+9.)*7.);
 float per=7.5;
 float h1=hatch(q,.55,per,per*clamp((d-.2)/.55,0.,1.)*.8);
 float h2=hatch(q,-.75,per,per*clamp((d-.5)/.38,0.,1.)*.62);
 float h3=hatch(q,1.571,per*.85,per*clamp((d-.74)/.24,0.,1.)*.55);
 float ink=max(max(h1,h2),h3);
 ink=max(ink,edge*.82);
 float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));
 vec3 parch=vec3(.925,.86,.705)*(.92+.05*vn(px*.004)+.03*vn(px*.03));
 vec3 tint=c/max(mx,.03);
 float sat=clamp((mx-mn)*2.3,0.,1.);
 vec3 paper=mix(parch,mix(parch*tint*1.06,tint*.98,.5),sat*.92);
 vec3 inkC=mix(vec3(.17,.105,.06),c*.42,.22);
 vec3 col=mix(paper,inkC,ink*.93);
 col=mix(col,max(col,c),smoothstep(.78,1.,mx)*.55);
 vec2 u=vUv-.5;col*=1.-smoothstep(.38,.92,length(u*vec2(1.,.62)))*.32;
 gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(2.2)),1.);}`,
  });
  comp.insertPass(new ShaderPass(engr), 2);

  // ---------- light
  const hemi = new THREE.HemisphereLight(0xfff1d8, 0x6b5236, 2.2); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffe2b8, 2.6); scene.add(sunL); scene.add(sunL.target);
  sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 220 });
  sunL.shadow.bias = -0.0008;
  const fireL = new THREE.PointLight(0xff8a30, 0, 0, 2); fireL.position.set(FUR.x, 8, FUR.z); scene.add(fireL);
  const lampL = new THREE.PointLight(0xffc070, 0, 0, 2); scene.add(lampL);
  const cDayBg = new THREE.Color(0xeadcc0), cNightBg = new THREE.Color(0x1f1c24), cDusk = new THREE.Color(0xd9b48a), bgC = new THREE.Color();

  // ---------- textures
  const brickTex = (seed, base, rows, cols) => canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    const bh = h / rows;
    for (let y = 0; y < rows; y++) {
      const off = (y % 2) * (w / cols / 2);
      for (let x = -1; x <= cols; x++) {
        const bx = x * (w / cols) + off;
        g.fillStyle = `rgba(${90 + q() * 50},${60 + q() * 30},${30 + q() * 20},${0.12 + q() * 0.18})`;
        g.fillRect(bx + 2, y * bh + 2, w / cols - 4, bh - 4);
      }
      g.fillStyle = "rgba(50,32,18,.55)"; g.fillRect(0, y * bh, w, 3);
      for (let x = 0; x <= cols; x++) g.fillRect(x * (w / cols) + off, y * bh, 3, bh);
    }
  }, [4, 4]);
  const mudM = new THREE.MeshLambertMaterial({ map: brickTex(11, "#b48e60", 16, 6) });
  const mud2M = new THREE.MeshLambertMaterial({ map: brickTex(12, "#a47e52", 12, 5) });
  const sandTex = canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(5); g.fillStyle = "#d8c29a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(110,80,45,.22)";
    for (let i = 0; i < 90; i++) { g.lineWidth = .6 + q() * 1.2; g.beginPath(); const x = q() * w, y = q() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 40, y + (q() - .5) * 10, x + 70 + q() * 60, y + (q() - .5) * 8); g.stroke(); }
  }, [40, 40]);

  // ---------- ground and dunes
  const groundH = (x, z) => 3.0 * Math.exp(-(((z - CREST_Z) / 7) ** 2)) * (0.85 + 0.15 * Math.cos(x * 0.05))
    + 6.6 * Math.exp(-(((z + 160) / 22) ** 2)) * (0.8 + 0.2 * Math.sin(x * 0.04 + 1))
    + 12 * Math.exp(-(((z + 250) / 40) ** 2));
  const gGeo = new THREE.PlaneGeometry(700, 560, 140, 140); gGeo.rotateX(-Math.PI / 2); gGeo.translate(0, 0, -110);
  { const p = gGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i))); gGeo.computeVertexNormals(); }
  const ground = new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({ map: sandTex })); ground.receiveShadow = true; scene.add(ground);

  // ---------- temple courtyard
  const add = (geo, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const floorM = new THREE.MeshLambertMaterial({ map: brickTex(13, "#c4a074", 10, 10) });
  add(new THREE.BoxGeometry(32, 0.12, 34), floorM, 0, 0.06, -8);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(1.6, 5.2, 34), mudM, s * 16.8, 2.6, -8);
    for (let z = -24; z <= 8; z += 3.2) add(new THREE.BoxGeometry(0.9, 5.6, 1.1), mud2M, s * 15.8, 2.8, z);
    add(new THREE.BoxGeometry(13, 5.2, 1.6), mudM, s * 10.3, 2.6, 9);                // front wall halves
    add(new THREE.BoxGeometry(3.2, 7.4, 3.2), mud2M, s * 4.6, 3.7, 9);                 // gate towers
    for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(0.7, 0.7, 3.4), mudM, s * (3.5 + k * 0.75), 7.6, 9); // crenels
  }
  add(new THREE.BoxGeometry(12.4, 1.2, 1.8), mud2M, 0, 7.0, 9);                         // lintel over the gate
  // ziggurat
  [[30, 6, 22, 3], [21, 5, 15, 8.5], [12, 4.2, 9, 13.1]].forEach(([w, h, d, y]) => add(new THREE.BoxGeometry(w, h, d), mudM, 0, y, -42));
  const stair = add(new THREE.BoxGeometry(4.4, 0.6, 16), mud2M, 0, 3.6, -26); stair.rotation.x = -0.42;
  add(new THREE.BoxGeometry(5, 3, 4), mud2M, 0, 16.7, -42);
  // houses and palms around the temple, kept off the paths and the plaza
  for (let i = 0; i < 70; i++) {
    const x = (rnd() - 0.5) * 150, z = -30 + rnd() * 110;
    if (Math.abs(x) < 20 && z < 12) continue;
    if (Math.hypot(x - FUR.x, z - FUR.z) < 24 || Math.abs(x) < 7) continue;
    const w = 3 + rnd() * 4, h = 2.4 + rnd() * 3, d = 3 + rnd() * 4;
    add(new THREE.BoxGeometry(w, h, d), rnd() < 0.5 ? mudM : mud2M, x, h / 2, z);
  }
  const palmTrunk = new THREE.MeshLambertMaterial({ color: 0x7a5a3a }), palmLeaf = new THREE.MeshLambertMaterial({ color: 0x6f7a48, side: THREE.DoubleSide });
  for (let i = 0; i < 16; i++) {
    const x = (rnd() < .5 ? -1 : 1) * (22 + rnd() * 40), z = -20 + rnd() * 90;
    if (Math.hypot(x - FUR.x, z - FUR.z) < 22) continue;
    const h = 6 + rnd() * 4, G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const tr = add(new THREE.CylinderGeometry(0.22, 0.34, h, 7), palmTrunk, 0, h / 2, 0, G); tr.rotation.z = (rnd() - .5) * .15;
    for (let k = 0; k < 8; k++) { const lf = add(new THREE.ConeGeometry(0.5, 4.2, 4), palmLeaf, 0, h, 0, G); lf.scale.set(1, 1, 0.18); lf.rotation.set(0, k * 0.785, 1.9); lf.position.set(Math.cos(k * .785) * 1.6, h - 0.5, -Math.sin(k * .785) * 1.6); lf.rotation.order = "YZX"; }
  }
  // plaza paving
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(22, 48), new THREE.MeshLambertMaterial({ map: brickTex(14, "#c3a173", 14, 14) }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(FUR.x, 0.05, FUR.z); plaza.receiveShadow = true; scene.add(plaza);

  // ---------- idols: carved bronze figures with horned gold crowns, no faces
  const bronze = new THREE.MeshStandardMaterial({ color: 0x9a6236, roughness: 0.55, metalness: 0.35 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd2a24c, roughness: 0.4, metalness: 0.45, emissive: 0x2a1a05 });
  const stoneM = new THREE.MeshLambertMaterial({ color: 0x9c8a6c });
  const bodyG = new THREE.LatheGeometry([[0, 0], [.55, 0], [.58, .3], [.5, 1.2], [.4, 1.55], [.36, 1.65], [.5, 2.05], [.46, 2.2], [.2, 2.28], [0, 2.3]].map(([a, b]) => new THREE.Vector2(a, b)), 12);
  const IDOLS = [];
  const mkIdol = (x, z, s, yaw) => {
    const base = new THREE.Group(); base.position.set(x, 0.12, z); base.rotation.y = yaw; scene.add(base);
    add(new THREE.BoxGeometry(1.5, 0.8, 1.5), stoneM, 0, 0.4, 0, base);
    const G = new THREE.Group(); G.position.y = 0.8; base.add(G);
    add(bodyG, bronze, 0, 0, 0, G);
    for (let k = 0; k < 4; k++) add(new THREE.TorusGeometry(.5 - k * .025, .035, 5, 16), bronze, 0, .45 + k * .22, 0, G).rotation.x = Math.PI / 2;  // flounced skirt
    add(new THREE.BoxGeometry(.5, .2, .3), bronze, 0, 1.75, .38, G);                // clasped hands
    add(new THREE.SphereGeometry(.3, 14, 12), bronze, 0, 2.55, 0, G);
    for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(.27 - k * .05, .31 - k * .05, .16, 12), gold, 0, 2.82 + k * .15, 0, G);
    for (const sd of [-1, 1]) { const hn = add(new THREE.TorusGeometry(.2, .035, 5, 10, Math.PI), gold, sd * .18, 2.85, 0, G); hn.rotation.set(0, Math.PI / 2, sd * .5); }
    base.scale.setScalar(s);
    // offering bowl with fruit and bread in front of the idol
    const bowl = new THREE.Group(); bowl.position.set(x + Math.sin(yaw) * 1.5 * s, 0.12, z + Math.cos(yaw) * 1.5 * s); scene.add(bowl);
    if (s < 2) {
      add(new THREE.CylinderGeometry(.34, .2, .18, 12), stoneM, 0, .09, 0, bowl);
      [[.1, 0, 0xc06a3a], [-.1, .06, 0xa8843e], [0, -.1, 0xb85a30]].forEach(([dx, dz, c]) => add(new THREE.SphereGeometry(.1, 8, 6), new THREE.MeshLambertMaterial({ color: c }), dx, .24, dz, bowl));
    }
    return { base, G, x, z, s, yaw };
  };
  const ROWZ = [-3, -7, -11, -15];
  ROWZ.forEach((z) => { for (const sd of [-1, 1]) IDOLS.push(mkIdol(sd * 5.6, z, 1, sd < 0 ? Math.PI / 2 : -Math.PI / 2)); });
  IDOLS.push(mkIdol(-9.5, -19, 1, 0.5), mkIdol(9.5, -19, 1, -0.5));
  const BIG = mkIdol(0, -21, 2.7, 0);

  // topple order follows the lamp: near pairs first
  const tSmash0 = A("s4:menghancurkan") - 0.2, tSmashGap = (A("s4:kecuali") - 0.2 - tSmash0) / IDOLS.length;
  IDOLS.forEach((d, i) => { d.tT = tSmash0 + i * tSmashGap; d.dir = d.x < 0 ? 1 : -1; });
  const FALL = 0.32;

  // shards: bronze body pieces and gold crown pieces, ballistic then resting
  const shardBronze = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.24, 0), bronze, IDOLS.length * 22);
  const shardGold = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.16, 0), gold, IDOLS.length * 6);
  for (const m of [shardBronze, shardGold]) { m.frustumCulled = false; m.castShadow = true; scene.add(m); }
  const SH = [];
  IDOLS.forEach((d, i) => {
    for (let k = 0; k < 28; k++) {
      const a = rnd() * Math.PI * 2, sp = 1.5 + rnd() * 3.2;
      SH.push({ i, g: k >= 22, idx: k >= 22 ? i * 6 + (k - 22) : i * 22 + k,
        o: new THREE.Vector3(d.x + d.dir * (0.6 + rnd() * 1.6), 0.4 + rnd() * (k >= 22 ? 0.4 : 1.2), d.z + (rnd() - .5) * 0.8),
        v: new THREE.Vector3(Math.cos(a) * sp + d.dir * 1.6, 2 + rnd() * 3.5, Math.sin(a) * sp), s: 0.6 + rnd() * 1.1,
        rx: rnd() * 6, ry: rnd() * 6, w: 4 + rnd() * 8 });
    }
  });
  const shM = new THREE.Matrix4(), shQ = new THREE.Quaternion(), shE = new THREE.Euler(), shS = new THREE.Vector3(), shP = new THREE.Vector3();

  // ---------- faceless crowd: robe below the waist, bowing upper body (smooth hood, no features)
  const robeG = new THREE.LatheGeometry([[0, 0], [.34, 0], [.3, .5], [.24, .92], [0, .92]].map(([a, b]) => new THREE.Vector2(a, b)), 10);
  const upG = new THREE.LatheGeometry([[0, 0], [.25, 0], [.27, .3], [.2, .48], [.15, .52], [.17, .62], [.15, .74], [.08, .8], [0, .82]].map(([a, b]) => new THREE.Vector2(a, b)), 10);
  const NF = 48;
  const robe = new THREE.InstancedMesh(robeG, new THREE.MeshLambertMaterial({ color: 0x5a4030 }), NF);
  const upper = new THREE.InstancedMesh(upG, new THREE.MeshLambertMaterial({ color: 0x6e5038 }), NF);
  for (const m of [robe, upper]) { m.frustumCulled = false; m.castShadow = true; scene.add(m); }
  const GATE = new THREE.Vector3(0, 0, 9), OUTS = new THREE.Vector3(0, 0, 17), PLZ = new THREE.Vector3(0, 0, 27);
  const FIG = [];
  for (let i = 0; i < NF; i++) {
    let ax, az;
    if (i < 24) { ax = -2.4 + (i % 4) * 1.6; az = -6 - Math.floor(i / 4) * 1.7; }
    else { const j = i - 24, sd = j < 12 ? -1 : 1, jj = j % 12; ax = sd * (10.4 + (jj % 3) * 1.3); az = -1 - Math.floor(jj / 3) * 3.4; }
    const ca = Math.PI * (1.12 + 0.76 * ((i * 7) % NF) / NF), cr = 13 + (i % 3) * 1.5;
    FIG.push({
      aisle: new THREE.Vector3(ax, 0.12, az),
      court: new THREE.Vector3(-7 + (i % 8) * 2 + (rnd() - .5) * .6, 0.12, 0.5 + Math.floor(i / 8) * 1.5 + (rnd() - .5) * .5),
      ring: new THREE.Vector3(FUR.x + Math.cos(ca) * cr, 0.05, FUR.z + Math.sin(ca) * cr),
      away: new THREE.Vector3((rnd() - .5) * 26, 0.05, 20 + rnd() * 10),
      k: (i * 13 % NF) / NF, lat: (rnd() - .5) * 4, ph: rnd() * 6.28, s: 0.92 + rnd() * 0.16,
    });
  }
  const poly = (u, P, out) => { u = clamp01(u) * (P.length - 1); const i = Math.min(P.length - 2, Math.floor(u)); return out.copy(P[i]).lerp(P[i + 1], u - i); };
  const tLeave = A("s4:kaumnya"), tBack = K.s5 - 0.7, tToRing = K.s6 + 0.2;
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  // returns visibility; writes position into out
  const figPos = (f, t, out) => {
    if (t < K.s2 - 0.05) { out.copy(f.ring); return 1; }
    if (t < tLeave + f.k * 1.6) { out.copy(f.aisle); return 1; }
    const lw = (t - tLeave - f.k * 1.6) / 3.0;
    if (t < tBack + f.k * 1.8) {
      if (lw >= 1) { out.copy(f.away); return 0; }
      poly(lw, [f.aisle, tmpA.set(f.lat * 0.5, 0.12, Math.min(f.aisle.z, 2)), tmpB.set(f.lat * 0.5, 0.12, GATE.z), OUTS, f.away], out); return 1;
    }
    const bw = (t - tBack - f.k * 1.8) / 2.6;
    if (t < tToRing + f.k * 1.5) {
      if (bw < 1) { poly(bw, [f.away, OUTS, tmpB.set(f.lat * 0.5, 0.12, GATE.z), tmpA.set(f.court.x * .6, 0.12, 5), f.court], out); return 1; }
      out.copy(f.court); return 1;
    }
    const rw = (t - tToRing - f.k * 1.5) / 3.2;
    if (rw < 1) { poly(rw, [f.court, tmpA.set(f.lat * 0.5, 0.12, GATE.z), tmpB.set(f.lat, 0.05, PLZ.z), f.ring], out); return 1; }
    out.copy(f.ring);
    const back_ = ramp(t, A("s7:mencelakainya"), A("s7:rugi") + 0.5) * 3.2;
    if (back_ > 0) { tmpA.copy(f.ring).sub(FUR).setY(0).normalize(); out.addScaledVector(tmpA, back_); }
    return 1;
  };
  const faceTarget = (t, out) => {
    if (t < K.s2 - 0.05 || t > tToRing + 2) return out.copy(FUR);
    if (t < tLeave + 1) return out.set(0, 0, -21);
    return out.set(0, 0, -21);
  };
  const bowF = (f, t) => {
    if (t >= K.s2 - 0.05 && t < tLeave) return 0.25 + 0.55 * Math.max(0, Math.sin(t * 1.5 + f.ph));       // worship
    if (t >= K.s5 && t < tToRing + f.k * 1.5) return 0.8 * ramp(t, A("s5:tertunduk") - 0.15 + f.k * 0.3, A("s5:tertunduk") + 0.5 + f.k * 0.3);
    if (t > K.s7) return 0.6 * ramp(t, A("s7:rugi") - 0.4 + f.k * 0.4, A("s7:rugi") + 0.4 + f.k * 0.4);
    return 0;
  };
  const fM = new THREE.Matrix4(), fU = new THREE.Matrix4(), fR = new THREE.Matrix4(), fQ = new THREE.Quaternion(), fS = new THREE.Vector3(), fP = new THREE.Vector3(), fP2 = new THREE.Vector3(), fT = new THREE.Vector3(), yAx = new THREE.Vector3(0, 1, 0);
  const torches = pts(scene, NF, { color: 0xffa040, size: 1.1, opacity: 1 });
  const torchOn = (t) => (t < K.s2 - 0.05 ? 1 : 0) + (t > K.s6 ? ramp(t, A("s6:Bakarlah"), A("s6:Bakarlah") + 0.5) * (1 - ramp(t, A("s7:mencelakainya"), A("s7:rugi") + 0.3)) : 0);

  // ---------- the oil lamp (his presence) and its trail of light
  const clay = new THREE.MeshStandardMaterial({ color: 0xa8643a, roughness: 0.7, metalness: 0.05 });
  const lamp = new THREE.Group(); scene.add(lamp);
  const lampBody = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.13, .01], [.2, .06], [.21, .1], [.15, .14], [.06, .15], [.05, .19], [0, .19]].map(([a, b]) => new THREE.Vector2(a, b)), 16), clay);
  lampBody.scale.set(1, 1, 1.25); lampBody.castShadow = true; lamp.add(lampBody);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(.045, .07, .26, 8), clay); spout.rotation.x = Math.PI / 2 - 0.35; spout.position.set(0, .12, .3); lamp.add(spout);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.07, .022, 6, 12, Math.PI * 1.3), clay); handle.position.set(0, .14, -.27); handle.rotation.y = Math.PI / 2; lamp.add(handle);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe6a8 }));
  flame.scale.set(.045, .11, .045); flame.position.set(0, .3, .42); lamp.add(flame);
  const glowTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 1, 64, 64, 64); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(.25, "rgba(255,200,120,.55)"); gr.addColorStop(1, "rgba(255,160,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  scene.add(glow);
  const LAMPS = 2.4;  // lamp scale so it reads in wide shots
  lamp.scale.setScalar(LAMPS);

  const crestY = groundH(0, CREST_Z);
  const PIN = (x, y, z) => new THREE.Vector3(x, y, z);
  const P_s2a = PIN(0, 1.0, 3.2), P_s2b = PIN(0, 1.0, -3.2);
  const P_dune = [P_s2b, PIN(18, 1.4, -14), PIN(19, 2.0, -58), PIN(0, crestY + 0.05, CREST_Z)];
  const P_back = [PIN(0, crestY + 0.05, CREST_Z), PIN(19, 2.0, -58), PIN(19, 1.0, 14), PIN(0, 1.0, 15), PIN(0, 1.0, 5), PIN(0, 1.0, -1.5)];
  const P_left = PIN(-3.6, 1.0, -7), P_right = PIN(3.6, 1.0, -11);
  const P_smash = [P_right, PIN(-3.4, 1.0, -3), PIN(3.4, 1.0, -7), PIN(-3.4, 1.0, -11), PIN(3.4, 1.0, -15), PIN(0, 1.0, -17.5), PIN(0, 1.0, -9.5)];
  const P_out = [PIN(0, 1.0, -9.5), PIN(0, 1.0, 9), PIN(0, 1.0, 30), PIN(0, 1.0, 58)];
  const IN_FIRE = PIN(FUR.x, 0.12, FUR.z);
  const tThrow0 = A("s6:dilemparkan"), tThrow1 = A("s6:dilemparkan") + 1.05;
  const lampPos = (t, out) => {
    if (t < K.s2 - 0.05) return out.copy(IN_FIRE);
    if (t < K.s3 - 0.1) return out.copy(P_s2a).lerp(P_s2b, ramp(t, A("s2:Ia"), A("s2:tekun")));
    if (t < K.s4 - 0.1) return poly(ramp(t, K.s3 - 0.1, A("s3:berpikir")), P_dune, out);
    if (t < A("s4:bertanya")) return poly(ramp(t, K.s4 - 0.1, A("s4:berhala-berhala") + 0.5), P_back, out);
    if (t < A("s4:Kenapa") - 0.2) return out.copy(P_back[5]).lerp(P_left, ramp(t, A("s4:bertanya"), A("s4:makan")));
    if (t < tSmash0 - 0.4) return out.copy(P_left).lerp(P_right, ramp(t, A("s4:Kenapa") - 0.2, A("s4:menjawab")));
    if (t < K.s6) return poly(ramp(t, tSmash0 - 0.4, A("s4:besar") + 0.4), P_smash, out);
    if (t < tThrow0) return poly(ramp(t, K.s6 + 0.3, A("s6:bangunan")), P_out, out);
    if (t < tThrow1) { const u = (t - tThrow0) / (tThrow1 - tThrow0); out.copy(P_out[3]).lerp(IN_FIRE, eout(u)); out.y += Math.sin(Math.PI * u) * 8; return out; }
    return out.copy(IN_FIRE);
  };
  const lampGlowAmt = (t) => 1 + 0.9 * Math.exp(-(((t - A("s2:bertanya")) / 0.5) ** 2)) + 0.9 * Math.exp(-(((t - A("s5:menjawab")) / 0.6) ** 2))
    + 0.5 * ramp(t, A("s7:keselamatan") - 0.5, A("s7:keselamatan") + 0.5) + 0.6 * ramp(t, K.s3, A("s3:menghadap")) * (t < K.s4 ? 1 : 0);
  const NTR = 22;
  const trail = pts(scene, NTR, { color: 0xffc070, size: 2.2, opacity: 0.55 });
  const lpA = new THREE.Vector3(), lpB = new THREE.Vector3(), lpC = new THREE.Vector3();

  // ---------- the furnace: a ring of bricks laid course by course
  const COURSES = 14, PER = 40, RW = 7.6;
  const bricks = new THREE.InstancedMesh(new THREE.BoxGeometry(1.12, 0.42, 0.6), new THREE.MeshLambertMaterial({ color: 0xa7774a }), COURSES * PER);
  bricks.frustumCulled = false; bricks.castShadow = bricks.receiveShadow = true; scene.add(bricks);
  { const c = new THREE.Color(); for (let i = 0; i < COURSES * PER; i++) { c.setHSL(0.075, 0.42, 0.36 + rnd() * 0.14); bricks.setColorAt(i, c); } }
  const brM = new THREE.Matrix4(), brQ = new THREE.Quaternion(), brP = new THREE.Vector3(), brS = new THREE.Vector3();
  const buildP = (t) => (t < K.s2 - 0.05 ? 1 : t < K.s6 ? 0 : ramp(t, A("s6:Sebuah") - 0.2, A("s6:api") + 0.1));
  // flames: engraved tongues of fire, cones flickered in the vertex shader
  const NFL = 40;
  const flG = new THREE.ConeGeometry(1, 1, 14, 12, true); flG.translate(0, 0.5, 0);
  const FU = { uT: { value: 0 }, uHeat: { value: 0 }, uCool: { value: 0 } };
  const flM = new THREE.ShaderMaterial({
    uniforms: FU, transparent: true, depthWrite: false, blending: THREE.NormalBlending, side: THREE.DoubleSide,
    vertexShader: `attribute float aPh;uniform float uT,uHeat,uCool;varying float vY;varying float vPh;varying vec3 vN;varying vec3 vV;
void main(){vec3 p=position;float y=p.y;float sw=mix(1.,.3,uCool);
 p.y*=uHeat*mix(1.,.24,uCool)*(1.+.2*sin(uT*7.+aPh*5.)*sw);
 p.xz*=(1.-y*.86)*(1.+.16*sin(uT*9.+y*6.+aPh));
 p.x+=sin(uT*3.1+y*4.+aPh)*.45*y*sw;p.z+=cos(uT*2.7+y*3.5+aPh*1.3)*.45*y*sw;
 vec4 wp=modelMatrix*instanceMatrix*vec4(p,1.);vY=y;vPh=aPh;
 vN=normalize(mat3(modelMatrix*instanceMatrix)*normal);vV=normalize(cameraPosition-wp.xyz);
 gl_Position=projectionMatrix*viewMatrix*wp;}`,
    fragmentShader: `uniform float uT,uCool,uHeat;varying float vY;varying float vPh;varying vec3 vN;varying vec3 vV;
void main(){float fr=.55+.45*abs(dot(normalize(vN),vV));
 float band=smoothstep(.3,.55,abs(fract(vY*7.-uT*2.4*mix(1.,.25,uCool)+vPh)-.5)*2.);
 vec3 hot=mix(vec3(1.,.93,.62),vec3(1.,.44,.08),smoothstep(.0,.6,vY));hot=mix(hot,vec3(.6,.1,.02),smoothstep(.65,1.,vY));
 vec3 cool=mix(vec3(.66,.84,1.),vec3(.28,.52,.96),smoothstep(.05,.8,vY));
 vec3 col=mix(hot,cool,uCool);
 float a=fr*pow(1.-vY,.5)*(.5+.5*band)*min(uHeat,1.)*mix(.62,.4,uCool);
 gl_FragColor=vec4(col*(1.05+.25*band),a);}`,
  });
  const flames = new THREE.InstancedMesh(flG, flM, NFL); flames.frustumCulled = false; scene.add(flames);
  { const ph = new Float32Array(NFL); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < NFL; i++) { const a = rnd() * Math.PI * 2, rr = 1.3 + Math.sqrt(rnd()) * 4.6; p.set(FUR.x + Math.cos(a) * rr, 0.1, FUR.z + Math.sin(a) * rr);
      const hh = 7 + rnd() * 7 * (1 - rr / 7); s.set(0.9 + rnd() * 0.9, hh, 0.9 + rnd() * 0.9); m.compose(p, q.identity(), s); flames.setMatrixAt(i, m); ph[i] = rnd() * 6.28; }
    flG.setAttribute("aPh", new THREE.InstancedBufferAttribute(ph, 1)); }
  const tIgnite = A("s6:api"), tCool0 = A("s7:wahai"), tCool1 = A("s7:dingin") + 0.4;
  const heatF = (t) => (t < K.s2 - 0.05 ? 1 : t < K.s6 ? 0 : ramp(t, tIgnite, tIgnite + 0.9) * (1 + 0.25 * Math.exp(-(((t - tThrow1) / 0.35) ** 2))));
  const coolF = (t) => (t < K.s2 - 0.05 ? 0.5 * ramp(t, A("s1:wahai"), K.s1e) : ramp(t, tCool0, tCool1));
  const embers = pts(scene, 520, { color: 0xffa050, size: 0.32, opacity: 1 });
  const emS = Array.from({ length: 520 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const petals = pts(scene, 380, { color: 0xf6e8e2, size: 0.42, add: false, opacity: 0.95 });
  const peS = Array.from({ length: 380 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const coolMotes = pts(scene, 220, { color: 0x9cc8ff, size: 0.5, opacity: 0.9 });
  const cmS = Array.from({ length: 220 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const dust = pts(scene, 300, { color: 0x8a6a48, size: 0.9, add: false, opacity: 0.5 });
  const duS = Array.from({ length: 300 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- the night sky: stars, the celestial dial, the star, the moon and the sun on one arc
  const starsP = pts(scene, 900, { color: 0xfff6e0, size: 1.6, opacity: 1 });
  starsP.m.fog = false;
  for (let i = 0; i < 900; i++) { const a = rnd() * Math.PI - Math.PI, e = 0.03 + Math.pow(rnd(), 0.8) * 1.3, R = 420; starsP.pos[i * 3] = Math.cos(e) * Math.cos(a) * R * 1.3; starsP.pos[i * 3 + 1] = Math.sin(e) * R; starsP.pos[i * 3 + 2] = Math.cos(e) * Math.sin(a) * R - 40; }
  starsP.commit();
  const DIAL = new THREE.Group(); DIAL.position.set(0, 8, -300); scene.add(DIAL);
  const dialM = new THREE.MeshBasicMaterial({ color: 0xd8ad5c, fog: false, transparent: true });
  const RD = 46;
  for (const [rr, th] of [[RD, .45], [RD + 5, .3], [RD - 7, .25], [RD + 7.5, .18]]) DIAL.add(new THREE.Mesh(new THREE.TorusGeometry(rr, th, 6, 160), dialM));
  for (let k = 0; k < 120; k++) { const a = k / 120 * Math.PI * 2, L = k % 10 === 0 ? 5 : k % 5 === 0 ? 3.4 : 2; const tk = new THREE.Mesh(new THREE.BoxGeometry(.22, L, .1), dialM); tk.position.set(Math.cos(a) * (RD + L / 2), Math.sin(a) * (RD + L / 2), 0); tk.rotation.z = a - Math.PI / 2; DIAL.add(tk); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const sp = new THREE.Mesh(new THREE.BoxGeometry(.16, RD - 7, .1), dialM); sp.position.set(Math.cos(a) * (RD - 7) / 2, Math.sin(a) * (RD - 7) / 2, 0); sp.rotation.z = a - Math.PI / 2; DIAL.add(sp); }
  const needle = new THREE.Group(); DIAL.add(needle);
  { const n = new THREE.Mesh(new THREE.BoxGeometry(.7, RD + 2, .1), dialM); n.position.y = (RD + 2) / 2; needle.add(n); const tip = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4, 3), dialM); tip.position.y = RD + 3.5; needle.add(tip); }
  const hub = new THREE.Mesh(new THREE.TorusGeometry(3, .5, 6, 24), dialM); DIAL.add(hub);
  const sprite = (tex, size) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); scene.add(m); return m; };
  const starTex = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.translate(128, 128); g.fillStyle = "#fff8e2"; for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, -120); g.lineTo(9, 0); g.lineTo(0, 120); g.lineTo(-9, 0); g.fill(); } g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); g.strokeStyle = "rgba(255,240,200,.6)"; g.lineWidth = 2; for (let k = 0; k < 24; k++) { const a = k / 24 * 6.28; g.beginPath(); g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); g.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); g.stroke(); } });
  const moonTex = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = "#fbf3dc"; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill(); g.strokeStyle = "rgba(70,50,30,.75)"; g.lineWidth = 2.2; for (let y = 20; y < 240; y += 7) { const hw = Math.sqrt(Math.max(0, 118 * 118 - (y - 128) ** 2)); g.beginPath(); g.moveTo(128 + hw * 0.15, y); g.lineTo(128 + hw, y); g.stroke(); } g.lineWidth = 4; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke(); });
  const sunTex = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.translate(128, 128); g.fillStyle = "#ffd98a"; for (let k = 0; k < 16; k++) { g.rotate(Math.PI / 8); g.beginPath(); g.moveTo(-10, -62); g.quadraticCurveTo(14, -92, 0, -124); g.quadraticCurveTo(4, -90, 10, -62); g.fill(); } g.beginPath(); g.arc(0, 0, 62, 0, 7); g.fill(); g.strokeStyle = "rgba(120,70,20,.8)"; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 60, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, 46, 0, 7); g.stroke(); });
  const STAR = sprite(starTex, 16), MOON = sprite(moonTex, 15), SUN = sprite(sunTex, 22);
  // each body travels left horizon -> over -> right horizon on the dial's arc and sets on its word
  const arcPos = (th, out) => out.set(DIAL.position.x + Math.cos(th) * RD, DIAL.position.y + Math.sin(th) * RD, DIAL.position.z + 2);
  const D2R = Math.PI / 180;
  const thStar = (t) => (110 - 112 * ramp(t, K.s3 + 0.5, A("s3:terbenam") + 0.6)) * D2R;
  const thMoon = (t) => (178 - 182 * ramp(t, A("s3:Bintang") - 0.4, A("s3:terbenam#2") + 0.6)) * D2R;
  const thSun = (t) => (178 - 182 * ramp(t, A("s3:Bulan"), A("s3:terbenam#3") + 0.6)) * D2R;
  const skyOn = (t) => (t > K.s3 - 0.2 && t < K.s4 + 0.6) || t > K.s8 - 0.5;
  // day light in the middle of the sky sequence follows the sun's height
  const sunAlt = (t) => (t > K.s3 && t < K.s4 ? Math.max(0, Math.sin(thSun(t))) * (thSun(t) < 177 * D2R ? 1 : 0) : 0);

  // ---------- camera [t, px,py,pz, tx,ty,tz]
  const CUT1 = K.s2 - 0.05;
  const camA = track([
    [0, 0, 30, 104, 0, 5, 45],
    [A("s1:kaumnya"), 0, 20, 82, 0, 6, 45],
    [A("s1:Satu"), 3, 14, 70, 0, 4.5, 45],
    [A("s1:wahai"), 2, 19, 62, 0, 0.8, 45],
    [CUT1, 1, 20, 59, 0, 0.4, 45],
  ]);
  const camB = track([
    [CUT1, 34, 30, 44, 0, 3, -14],
    [A("s2:patung"), 26, 20, 28, 0, 2, -10],
    [A("s2:ayahnya"), 12, 9, 13, 0, 1.6, -7],
    [A("s2:Ia"), 4, 4.2, 12.5, 0, 1.4, 0],
    [A("s2:tekun"), 1.2, 3.0, 6.5, 0, 2.6, -14],
    [A("s2:Jawab"), 2.4, 3.2, 1.0, -2, 2.4, -15],
    [A("s2:nenek"), 1.6, 5.6, 4, 5, 2, -18],
    [K.s2e, 2.2, 6.5, -2, 4, 2.6, -22],
    [A("s3:Ibrahim"), 10, 24, -14, 0, 12, -60],
    [A("s3:berpikir"), 1.5, 6.5, -62, 0, 15, -300],
    [A("s3:Bintang"), 0, 4.4, -66, 4, 22, -300],
    [A("s3:Bulan"), 0, 4.3, -66.5, 0, 24, -300],
    [A("s3:Matahari"), 0, 4.3, -67, -2, 24, -300],
    [A("s3:Yang"), 0, 4.2, -67.5, 4, 20, -300],
    [A("s3:menghadap"), 0, 7, -60, 0, 24, -300],
    [K.s3e, 0, 14, -50, 0, 22, -300],
    [K.s4 + 0.3, 0, 26, -22, 0, 3, 0],
    [A("s4:pergi"), 2, 20, -10, 0, 0, 6],
    [A("s4:Ibrahim"), 2, 16, -8, 0, 0.8, 8],
    [A("s4:berhala-berhala"), 6, 7, 6, 0, 1.4, -6],
    [A("s4:bertanya"), 2.6, 3.0, -0.5, -5.6, 1.8, -9],
    [A("s4:Kenapa"), -1.6, 3.0, -4, 5.6, 1.8, -13],
    [A("s4:Lalu"), 0, 19, 13, 0, 0.5, -9],
    [A("s4:kecuali"), 0, 12, 6, 0, 2, -15],
    [K.s4e, 0, 2.0, -6, 0, 6, -21],
    [A("s5:marah"), -9, 7.5, -23, 0, 1.0, 3],
    [A("s5:Ibrahim"), 3.5, 3.4, -15.5, 0, 1.4, -6],
    [A("s5:tanyakan"), 3, 10.5, 7.5, 0, 6.2, -17],
    [A("s5:besar"), 1, 10.5, 6.5, 0, 6.6, -18],
    [A("s5:Mereka"), 12, 8, 7.5, 0, 4, -17],
    [A("s5:tahu"), 12.5, 7.5, 6, 0, 3.6, -17],
    [K.s5e, 4, 8, -14, 0, 1.4, 4],
    [A("s6:Bakarlah"), 0, 20, 14, 0, 1, 42],
    [A("s6:bangunan"), 18, 13, 66, 0, 2.5, 45],
    [A("s6:api"), 10, 14, 76, 0, 5, 45],
    [A("s6:dilemparkan"), 2, 15, 80, 0, 5, 45],
    [K.s6e, 0, 20, 70, 0, 3, 45],
    [A("s7:Allah"), 0, 26, 66, 0, 2, 45],
    [A("s7:wahai"), 0, 22, 58, 0, 1, 45],
    [A("s7:dingin"), 1, 14, 52.5, 0, 0.6, 45],
    [A("s7:keselamatan"), 2.4, 5.2, 50.6, 0, 0.5, 45],
    [A("s7:surah"), 3.2, 3.4, 49.6, 0, 0.6, 45],
    [A("s7:surah") + 1.4, 2.6, 9, 48.6, 0, 0.6, 45],
    [A("s7:Yang"), 0.5, 17, 55, 0, 0.6, 45],
    [A("s7:rugi"), 0, 34, 78, 0, 0, 38],
    [K.s7e, 0, 35, 80, 0, 0, 37],
    [A("s8:padam"), 0, 28, 72, 0, 0, 44],
    [A("s8:Menurut"), 0, 26, 84, 0, 10, -30],
    [K.end, 0, 26, 94, 0, 16, -80],
    [K.dur, 0, 26, 95, 0, 16.5, -82],
  ]);
  const look = new THREE.Vector3(), lp = new THREE.Vector3(), tmpV = new THREE.Vector3(), cc = new THREE.Color();

  return (t) => {
    const c = t < CUT1 ? camA(t) : camB(t);
    cam.position.set(c[0] + Math.sin(t * .29) * .18, c[1] + Math.sin(t * .21) * .1, c[2] + Math.cos(t * .25) * .18);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // day, night and dusk
    let nf;
    if (t < CUT1) nf = 1;
    else if (t < K.s3) nf = 0;
    else if (t < K.s4 - 0.4) nf = ramp(t, K.s3, A("s3:berpikir")) * (1 - 0.85 * sunAlt(t));
    else if (t < K.s6) nf = 1 - ramp(t, K.s4 - 0.4, K.s4 + 1.0);
    else if (t < K.s8) nf = 0.6 * ramp(t, tIgnite - 0.6, tThrow0);
    else nf = 0.6 + 0.4 * ramp(t, K.s8, A("s8:Menurut"));
    const dusk = t > K.s6 ? ramp(t, tIgnite - 0.6, tThrow0) * (1 - ramp(t, K.s8, A("s8:Menurut"))) : 0;
    bgC.copy(cDayBg).lerp(cDusk, dusk * 0.5).lerp(cNightBg, nf);
    scene.background.copy(bgC); scene.fog.color.copy(bgC);
    hemi.intensity = 2.3 - 1.85 * nf;
    sunL.intensity = 2.8 * (1 - nf) + 0.35 * nf;
    sunL.color.setHex(nf > 0.5 ? 0xb8c4e0 : 0xffe2b8);
    sunL.position.set(look.x + 30, look.y + 55, look.z + 26); sunL.target.position.copy(look);
    EU.uNight.value = nf;

    // lamp
    lampPos(t, lp); lamp.position.copy(lp);
    lampPos(t + 0.08, tmpV);
    const vx = tmpV.x - lp.x, vz = tmpV.z - lp.z;
    if (Math.hypot(vx, vz) > 0.004) lamp.rotation.y = Math.atan2(vx, vz);
    lamp.rotation.z = Math.sin(t * 2.3) * 0.03;
    const ga = lampGlowAmt(t);
    flame.scale.set(.045, .11 * (1 + .12 * Math.sin(t * 13) + .06 * Math.sin(t * 29)), .045);
    glow.position.set(lp.x, lp.y + 0.75, lp.z); glow.quaternion.copy(cam.quaternion);
    const gs = 2.6 * ga * (1 + 0.08 * Math.sin(t * 11)); glow.scale.set(gs, gs, 1);
    lampL.position.set(lp.x, lp.y + 1.2, lp.z); lampL.intensity = 3.2 * Math.min(ga, 2) * (1 + nf);
    // trail of light pools on the ground where the lamp has been
    for (let k = 0; k < NTR; k++) {
      lampPos(t - (k + 1) * 0.16, lpA); lampPos(t - k * 0.16, lpB);
      const mv = Math.min(1, lpA.distanceTo(lpB) * 4) * (1 - k / NTR);
      trail.pos[k * 3] = lpA.x; trail.pos[k * 3 + 1] = groundH(lpA.x, lpA.z) + 0.12 + (lpA.y > 3 && t > tThrow0 ? lpA.y - 0.12 : 0); trail.pos[k * 3 + 2] = lpA.z;
      cc.setRGB(1, .75, .42).multiplyScalar(mv);
      trail.col[k * 3] = cc.r; trail.col[k * 3 + 1] = cc.g; trail.col[k * 3 + 2] = cc.b;
    }
    trail.commit();
    void lpC;

    // idols topple and shatter; the biggest stays
    IDOLS.forEach((d) => {
      const u = clamp01((t - d.tT) / FALL);
      const broken = t >= d.tT + FALL;
      d.base.visible = true;
      d.G.visible = !broken;
      d.G.rotation.z = d.dir * u * u * 1.45;
      d.G.position.x = d.dir * u * 0.4;
    });
    const smashOn = t > tSmash0 - 0.1;
    SH.forEach((s) => {
      const d = IDOLS[s.i];
      const a = t - (d.tT + FALL);
      const m = s.g ? shardGold : shardBronze;
      if (!smashOn || a < 0) { shM.makeScale(0, 0, 0); m.setMatrixAt(s.idx, shM); return; }
      const ta = Math.min(a, 1.4);
      const tl = (s.v.y + Math.sqrt(s.v.y * s.v.y + 2 * 14 * s.o.y)) / 14;   // landing time
      const aa = Math.min(ta, tl);
      shP.set(s.o.x + s.v.x * aa * 0.8, Math.max(0.16, s.o.y + s.v.y * aa - 7 * aa * aa), s.o.z + s.v.z * aa * 0.8);
      const spin = Math.min(a, tl);
      shE.set(s.rx + spin * s.w, s.ry + spin * s.w * 0.7, 0); shQ.setFromEuler(shE);
      shS.setScalar(s.s * (s.g ? 1.2 : 1));
      shM.compose(shP, shQ, shS); m.setMatrixAt(s.idx, shM);
    });
    shardBronze.instanceMatrix.needsUpdate = true; shardGold.instanceMatrix.needsUpdate = true;
    BIG.base.visible = true;

    // crowd
    for (let i = 0; i < NF; i++) {
      const f = FIG[i];
      const vis = figPos(f, t, fP); figPos(f, t + 0.1, fP2);
      const dx = fP2.x - fP.x, dz = fP2.z - fP.z, moving = Math.hypot(dx, dz) > 0.02;
      let yaw;
      if (moving) yaw = Math.atan2(dx, dz);
      else { faceTarget(t, fT); yaw = Math.atan2(fT.x - fP.x, fT.z - fP.z); }
      const hop = moving ? Math.abs(Math.sin(t * 9 + f.ph)) * 0.07 : 0;
      fQ.setFromAxisAngle(yAx, yaw);
      fS.setScalar(vis ? f.s : 0.0001);
      fM.compose(tmpV.set(fP.x, fP.y + hop, fP.z), fQ, fS);
      robe.setMatrixAt(i, fM);
      const bw = bowF(f, t);
      fU.makeTranslation(0, 0.92, 0).multiply(fR.makeRotationX(bw));
      upper.setMatrixAt(i, tmpM.multiplyMatrices(fM, fU));
      // torch held up in front
      const ton = torchOn(t) * (vis ? 1 : 0);
      torches.pos[i * 3] = fP.x + Math.sin(yaw) * 0.4 + Math.cos(yaw) * 0.25; torches.pos[i * 3 + 1] = 1.95 * f.s + Math.sin(t * 17 + f.ph) * 0.03; torches.pos[i * 3 + 2] = fP.z + Math.cos(yaw) * 0.4 - Math.sin(yaw) * 0.25;
      cc.setRGB(1, .62, .25).multiplyScalar(ton * (0.85 + 0.15 * Math.sin(t * 21 + f.ph)));
      torches.col[i * 3] = cc.r; torches.col[i * 3 + 1] = cc.g; torches.col[i * 3 + 2] = cc.b;
    }
    robe.instanceMatrix.needsUpdate = true; upper.instanceMatrix.needsUpdate = true; torches.commit();

    // furnace bricks
    const bp_ = buildP(t);
    for (let cI = 0; cI < COURSES; cI++) for (let k = 0; k < PER; k++) {
      const i = cI * PER + k;
      const appear = clamp01((bp_ * (COURSES + 1.5) - cI - (k / PER) * 1.5));
      const a = (k + (cI % 2) * 0.5) / PER * Math.PI * 2;
      brP.set(FUR.x + Math.cos(a) * RW, 0.21 + cI * 0.44 + (1 - eout(appear)) * 1.6, FUR.z + Math.sin(a) * RW);
      brQ.setFromAxisAngle(yAx, -a + Math.PI / 2);
      brS.setScalar(appear > 0 ? Math.max(0.0001, back(appear, 1.4)) : 0.0001);
      brM.compose(brP, brQ, brS); bricks.setMatrixAt(i, brM);
    }
    bricks.instanceMatrix.needsUpdate = true;

    // fire: roar, then cool
    const heat = heatF(t), cool = coolF(t);
    FU.uT.value = t; FU.uHeat.value = heat; FU.uCool.value = cool;
    flames.visible = heat > 0.002;
    fireL.intensity = heat * (110 - 75 * cool) * (1 + 0.12 * Math.sin(t * 11) * (1 - cool));
    fireL.color.setRGB(1 - 0.45 * cool, 0.55 + 0.3 * cool, 0.2 + 0.8 * cool);
    for (let i = 0; i < 520; i++) {
      const s = emS[i], H = 22;
      const y = ((t * (2.5 + s[0] * 4) + s[1] * H) % H);
      const a = s[2] * 6.28 + t * 0.3, rr = s[3] * 5.6 * (1 - y / H * .3);
      const on = heat * (1 - cool) * (y < H * (0.4 + 0.6 * (1 - cool)) ? 1 : 0);
      embers.pos[i * 3] = FUR.x + Math.cos(a) * rr + Math.sin(t + s[0] * 9) * y * 0.05; embers.pos[i * 3 + 1] = 0.5 + y; embers.pos[i * 3 + 2] = FUR.z + Math.sin(a) * rr;
      const fade = on * (1 - y / H);
      embers.col[i * 3] = fade; embers.col[i * 3 + 1] = fade * .55; embers.col[i * 3 + 2] = fade * .2;
    }
    embers.commit();
    // embers become petals and cool light
    const pOn = ramp(t, tCool0 + 0.4, tCool1 + 0.6) * (t > K.s6 ? 1 : 0);
    for (let i = 0; i < 380; i++) {
      const s = peS[i], H = 11;
      const y = H - ((t * (0.35 + s[0] * 0.4) + s[1] * H) % H);
      const a = s[2] * 6.28 + t * (0.15 + s[3] * 0.2), rr = 1.1 + s[3] * 5.4;
      petals.pos[i * 3] = FUR.x + Math.cos(a) * rr + Math.sin(t * 1.3 + s[0] * 7) * 0.4;
      petals.pos[i * 3 + 1] = pOn > 0.001 ? 0.3 + y * (0.3 + 0.7 * pOn) : -50;
      petals.pos[i * 3 + 2] = FUR.z + Math.sin(a) * rr;
    }
    petals.m.opacity = 0.95 * pOn; petals.commit();
    for (let i = 0; i < 220; i++) {
      const s = cmS[i], H = 9;
      const y = (t * (0.4 + s[0] * 0.5) + s[1] * H) % H;
      const a = s[2] * 6.28 - t * 0.2, rr = s[3] * 6;
      coolMotes.pos[i * 3] = FUR.x + Math.cos(a) * rr; coolMotes.pos[i * 3 + 1] = 0.4 + y; coolMotes.pos[i * 3 + 2] = FUR.z + Math.sin(a) * rr;
      const f = cool * heat * (1 - y / H);
      coolMotes.col[i * 3] = .6 * f; coolMotes.col[i * 3 + 1] = .8 * f; coolMotes.col[i * 3 + 2] = f;
    }
    coolMotes.commit();
    // dust: crowd leaving and returning, the toppling idols
    for (let i = 0; i < 300; i++) {
      const s = duS[i];
      let x = 0, y = -60, z = 0;
      if (i < 200) {
        const d = IDOLS[i % IDOLS.length], a = t - (d.tT + FALL);
        if (a > 0 && a < 2.4) { x = d.x + d.dir * 1.2 + (s[0] - .5) * (1 + a * 2.2); z = d.z + (s[1] - .5) * (1 + a * 2.2); y = 0.2 + s[2] * a * 1.4; }
      } else {
        const a = t - (A("s6:api") - 0.2);
        if (a > 0 && a < 3) { const ang = s[0] * 6.28, rr = RW + 0.5 + a * 3 * s[1]; x = FUR.x + Math.cos(ang) * rr; z = FUR.z + Math.sin(ang) * rr; y = 0.3 + a * s[2] * 2; }
      }
      dust.pos[i * 3] = x; dust.pos[i * 3 + 1] = y; dust.pos[i * 3 + 2] = z;
    }
    dust.m.opacity = 0.45; dust.commit();

    // sky
    const sk = skyOn(t);
    DIAL.visible = sk; STAR.visible = sk && t < K.s4; MOON.visible = sk && t < K.s4; SUN.visible = sk && t < K.s4;
    starsP.m.opacity = nf * nf;
    dialM.opacity = clamp01(nf * 1.4) * (t > K.s8 - 0.5 ? ramp(t, K.s8, A("s8:Menurut")) : 1);
    DIAL.rotation.z = t * 0.012;
    DIAL.scale.setScalar(t > K.s8 - 0.5 ? 1.9 : 1);
    arcPos(thStar(t), STAR.position); STAR.quaternion.copy(cam.quaternion);
    STAR.scale.setScalar(1 + 0.12 * Math.sin(t * 5));
    arcPos(thMoon(t), MOON.position); MOON.quaternion.copy(cam.quaternion);
    arcPos(thSun(t), SUN.position); SUN.quaternion.copy(cam.quaternion); SUN.rotation.z += t * 0.2;
    MOON.material.opacity = t > A("s3:Bintang") - 0.4 ? 1 : 0;
    SUN.material.opacity = t > A("s3:Bulan") ? 1 : 0;
    // the needle points at whichever body is setting now
    const thN = t < A("s3:Bintang") ? thStar(t) : t < A("s3:Matahari") - 0.2 ? thMoon(t) : t < A("s3:Yang") ? thSun(t) : Math.PI / 2 + ramp(t, A("s3:Yang"), A("s3:menghadap")) * 0;
    needle.rotation.z = (thN - DIAL.rotation.z) - Math.PI / 2;

    comp.render();
  };
}
const tmpM = new THREE.Matrix4();
