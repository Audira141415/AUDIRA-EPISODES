// EP08 AIRBAG MOBIL (PRECISION), rebuild r7. A photoreal product studio: warm off-white seamless sweep (camera-locked
// gradient plane, toneMapped off) over a shadow-only floor, softbox environment, a soft key + cool rim + fill that follow
// the shot target, depth-buffer DOF. One large subject per beat, each on its own station, cut on scene changes with a
// continuous camera move inside every shot:
//   H  hero steering wheel + airbag module (s1 mid-burst, s5 deploying, closing hub stamped AUDIRA)
//   S  MEMS accelerometer macro (ceramic package, proof mass on springs, comb fingers, lifted lid)
//   E  airbag control unit (aluminium tray, board, threshold LED bar, lifted lid stamped AUDIRA)
//   C  crash lane: titanium test sedan into a concrete block (AUDIRA CRASH LAB)
//   I  cutaway inflator (igniter, solid propellant pellets, filter, exit ports, gas)
//   B  seat buck on a ceramic plinth: crash-test dummy driver, bag + vents, belt, rear child seat
//   R  five modules frozen at successive inflation states, receding in depth (rack focus)
//   P  a crowd of small ceramic figurines that warm up in a wave (lives saved)
// Generic products only, no logos. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, clamp01, smooth, canvasTex, track, std, stage } from "./lib3d.js";

const SANS = "Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";
const O = { H: 0, S: 30, E: 60, C: 100, I: 150, B: -60, R: 220, P: 270 };

const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
// Depth of field from the scene depth buffer (golden-angle disc gather) with a NaN guard folded in.
const Dof = { uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, focus: { value: 3 }, amt: { value: 1.4 }, near: { value: 0.1 }, far: { value: 900 }, px: { value: new THREE.Vector2(1 / 1080, 1 / 1920) }, R: { value: 18 } },
  vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse,tDepth;uniform float focus,amt,near,far,R;uniform vec2 px;varying vec2 vUv;
  vec4 g(vec4 c){if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);return max(c,vec4(0.0));}
  float vz(vec2 uv){float d=texture2D(tDepth,uv).x;return near*far/(far-d*(far-near));}
  float coc(float z){if(z>200.0)return 1.0;return clamp(abs(z-focus)/max(z,0.05)*amt,0.0,1.0);}
  void main(){vec4 c0=g(texture2D(tDiffuse,vUv));float cc=coc(vz(vUv));vec4 acc=c0;float wt=1.0;
    for(int i=0;i<32;i++){float fi=float(i);float a=fi*2.39996;float rad=sqrt((fi+0.5)/32.0)*R*cc;
      vec2 uv=vUv+vec2(cos(a),sin(a))*rad*px;float cs=coc(vz(uv));float w=smoothstep(rad-1.0,rad+1.0,cs*R+0.5);
      acc+=g(texture2D(tDiffuse,uv))*w;wt+=w;}
    gl_FragColor=acc/wt;}` };
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(0.97,0.995,1.03),0.5*(1.0-l));c=mix(c,c*vec3(1.02,1.0,0.97),0.35*l);c=c+(c-vec3(0.5))*0.06;
  vec2 d=vUv-0.5;c*=1.0-0.16*dot(d,d);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
const phys = (color, r = 0.4, cc = 0.5, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: r, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.14, ...extra });
const metal = (color, r = 0.3) => new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 1 });
const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
const lerp = (a, b, u) => a + (b - a) * u;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rbox(w, h, d, r = 0.02) {
  r = Math.max(1e-4, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
  s.moveTo(x, y); s.lineTo(x + W, y); s.lineTo(x + W, y + H); s.lineTo(x, y + H); s.lineTo(x, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(1e-4, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 5, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals(); return g;
}
function envFrom(r, strips, base) {
  const pm = new THREE.PMREMGenerator(r); const s = new THREE.Scene(); s.background = new THREE.Color(base);
  for (const [w, h, c, i, x, y, z] of strips) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  }
  const tx = pm.fromScene(s, 0.035).texture; pm.dispose(); return tx;
}
const softDot = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
const puffTex = [11, 23, 37].map((sd) => canvasTex(256, 256, (g) => {
  g.clearRect(0, 0, 256, 256); const R = mulberry(sd);
  for (let i = 0; i < 24; i++) { const x = 128 + (R() - 0.5) * 100, y = 128 + (R() - 0.5) * 100, r = 30 + R() * 60; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${0.16 + R() * 0.14})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
}));
function puffs(parent, n, seed, { size = 0.06, life = [0.9, 1.6], speed = 0.25, color = 0xe9f1ff, op = 0.45 } = {}) {
  const R = mulberry(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map: puffTex[i % 3], color, transparent: true, opacity: 0, depthWrite: false });
    const s = new THREE.Sprite(m); s.renderOrder = 8; s.visible = false; parent.add(s);
    arr.push({ s, m, per: life[0] + R() * (life[1] - life[0]), ph: R(), j: [R() - 0.5, R() - 0.5, R() - 0.5], sz: 0.7 + R() * 0.6, rot: R() * 6 });
  }
  return (t, amt, origins, dirs) => {
    arr.forEach((w, i) => {
      if (amt <= 0.002) { w.s.visible = false; return; }
      const k = i % origins.length, o = origins[k], d = dirs[k];
      const u = ((t / w.per + w.ph) % 1 + 1) % 1, dist = speed * w.per * eout(u) * 1.2;
      w.s.visible = true;
      w.s.position.set(o[0] + (d[0] + w.j[0] * 0.6) * dist, o[1] + (d[1] + w.j[1] * 0.6) * dist + u * 0.02, o[2] + (d[2] + w.j[2] * 0.6) * dist);
      const sz = size * w.sz * (0.4 + 1.6 * u); w.s.scale.set(sz, sz, 1);
      w.m.opacity = Math.sin(Math.PI * Math.min(1, u * 1.15)) * op * amt; w.m.rotation = w.rot + u;
    });
  };
}
// engraved / printed text plate (transparent canvas)
function textPlate(lines, w, h, pw, ph, { color = "rgba(30,32,36,.88)", bg = null } = {}) {
  const tx = canvasTex(w, h, (g) => {
    g.clearRect(0, 0, w, h); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.textAlign = "center"; g.textBaseline = "middle";
    for (const [txt, font, y, c] of lines) { g.font = font; g.fillStyle = c || color; g.fillText(txt, w / 2, y); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.4, metalness: 0.2, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.renderOrder = 3; return m;
}

// ---------- airbag nylon (polar texture: canvas top = front centre) ----------
const bagTex = canvasTex(1024, 512, (g, w, h) => {
  g.fillStyle = "#f3f0e9"; g.fillRect(0, 0, w, h); const R = mulberry(91);
  for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${0.015 + R() * 0.025})`; g.fillRect(0, y, w, 1); }
  for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(90,90,90,${0.015 + R() * 0.025})`; g.fillRect(x, 0, 1, h); }
  g.filter = "blur(7px)";
  for (let k = 0; k < 14; k++) { const x = (k + 0.5) * w / 14 + (R() - 0.5) * 30; const gr = g.createLinearGradient(x - 20, 0, x + 20, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(60,55,45,.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - 20, 80, 40, 170 + R() * 40); }
  g.filter = "none";
  g.fillStyle = "rgba(70,64,52,.30)"; g.fillRect(0, 58, w, 5);
  g.fillStyle = "rgba(60,56,48,.5)"; for (let x = 0; x < w; x += 10) { g.fillRect(x, 50, 6, 2); g.fillRect(x, 70, 6, 2); }
  g.fillStyle = "rgba(60,55,45,.36)"; g.fillRect(0, 276, w, 9);
  g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(0, 285, w, 3);
  g.fillStyle = "rgba(50,46,40,.55)"; for (let x = 0; x < w; x += 9) { g.fillRect(x, 266, 5, 2); g.fillRect(x, 296, 5, 2); }
});
const nz = (x, y, z, k) => 0.6 * Math.sin(x * 5.3 + k) * Math.sin(y * 4.7 + k * 1.7) + 0.3 * Math.sin(x * 11.1 + y * 9.7 + z * 7.3 + k * 2.3) + 0.25 * Math.sin(z * 13.7 - x * 6.1 + y * 3.3 + k);
function makeBag(parent, S, seed, mat, ventM) {
  const geo = new THREE.SphereGeometry(1, 72, 48), pos = geo.attributes.position, base = pos.array.slice(), n = pos.count;
  const n1 = new Float32Array(n), n2 = new Float32Array(n), n3 = new Float32Array(n), uv = geo.attributes.uv;
  for (let i = 0; i < n; i++) {
    const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2]; n1[i] = nz(x, y, z, seed); n2[i] = nz(x * 2.3, y * 2.1, z * 1.9, seed + 3.1);
    const ph = Math.atan2(y, x), th = Math.acos(Math.max(-1, Math.min(1, z)));
    uv.setXY(i, ph / (2 * Math.PI) + 0.5, 1 - th / Math.PI);
    n3[i] = -Math.pow(Math.abs(Math.sin(4 * ph + 1.6 * th + seed)), 5) * smooth(th / 1.2) - 0.6 * Math.pow(Math.abs(Math.sin(7 * ph - 2.2 * th + seed * 2)), 8);
  }
  uv.needsUpdate = true;
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.castShadow = m.receiveShadow = true; parent.add(m);
  const VD = [[-0.78, 0.2, -0.25], [0.78, 0.2, -0.25]].map((v) => new THREE.Vector3(...v).normalize());
  const vents = VD.map(() => { const v = new THREE.Mesh(new THREE.TorusGeometry(0.03 * S, 0.008 * S, 10, 32), ventM); v.castShadow = true; parent.add(v); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.03 * S, 24), new THREE.MeshBasicMaterial({ color: 0x1a1b1e })); v.add(hole); return v; });
  const Z = new THREE.Vector3(0, 0, 1), nv = new THREE.Vector3();
  let P = { rx: 0, ry: 0, rz: 0, cz: 0 };
  const shape = (x, y, z, u, press, defl, a, b, c = 0) => {
    const wr = 0.2 * Math.pow(1 - u, 1.4) + 0.1 * defl + 0.01, rr = 1 + wr * (0.7 * a + 0.3 * b) + c * (0.03 + 0.12 * defl + 0.1 * (1 - u));
    const pinch = z < -0.35 ? lerp(1, 0.38, smooth((-z - 0.35) / 0.65)) : 1;
    let X = x * P.rx * rr * pinch, Y = y * P.ry * rr * pinch, Zz = P.cz + z * P.rz * rr;
    if (press > 0) { const zf = P.cz + P.rz * (1 - 0.5 * press); if (Zz > zf) Zz = zf + (Zz - zf) * 0.2; const bl = 1 + press * 0.12 * clamp01((z + 0.2) / 1.2); X *= bl; Y *= bl; }
    return [X, Y, Zz];
  };
  const api = {
    m, vents, ventW: [new THREE.Vector3(), new THREE.Vector3()], ventN: [new THREE.Vector3(), new THREE.Vector3()],
    set(u, press = 0, defl = 0) {
      const vis = u > 0.004; m.visible = vis; vents.forEach((v) => (v.visible = vis && u > 0.6));
      if (!vis) return;
      const s = 0.16 + 0.84 * eout(u), k = 1 - 0.3 * defl;
      P = { rx: 0.29 * S * s * k, ry: 0.27 * S * s * k, rz: 0.17 * S * (0.22 + 0.78 * eout(u)) * (1 - 0.38 * defl), cz: 0 };
      P.cz = 0.03 * S + P.rz * 0.85;
      const A = pos.array;
      for (let i = 0; i < n; i++) { const r = shape(base[i * 3], base[i * 3 + 1], base[i * 3 + 2], u, press, defl, n1[i], n2[i], n3[i]); A[i * 3] = r[0]; A[i * 3 + 1] = r[1]; A[i * 3 + 2] = r[2]; }
      pos.needsUpdate = true; geo.computeVertexNormals();
      parent.updateMatrixWorld(true);
      VD.forEach((d, j) => {
        const r = shape(d.x, d.y, d.z, u, 0, defl, 0, 0);
        nv.set(r[0] / (P.rx * P.rx), r[1] / (P.ry * P.ry), (r[2] - P.cz) / (P.rz * P.rz)).normalize();
        vents[j].position.set(r[0] + nv.x * 0.002, r[1] + nv.y * 0.002, r[2] + nv.z * 0.002); vents[j].quaternion.setFromUnitVectors(Z, nv);
        api.ventW[j].copy(vents[j].position); parent.localToWorld(api.ventW[j]);
        api.ventN[j].copy(nv).transformDirection(parent.matrixWorld);
      });
    },
  };
  return api;
}

// ---------- generic 3-spoke steering wheel with an airbag module; bag points +z ----------
function wheelModule(parent, M, { S = 1, seed = 1, stamp = false, column = 0.3 } = {}) {
  const G = new THREE.Group(); parent.add(G);
  mesh(new THREE.TorusGeometry(0.185, 0.021, 32, 128), M.leather, G);
  for (const a of [0, Math.PI, -Math.PI / 2]) {
    const sp = new THREE.Group(); sp.rotation.z = a; G.add(sp);
    mesh(rbox(0.12, 0.05, 0.022, 0.009), M.spoke, sp, 0.12, 0, -0.006);
    mesh(rbox(0.035, 0.026, 0.006, 0.002), M.alu, sp, 0.1, 0, 0.007);
  }
  mesh(rbox(0.17, 0.14, 0.05, 0.016), M.graphite, G, 0, 0, -0.012);
  if (column > 0) { const col = mesh(new THREE.CylinderGeometry(0.032, 0.042, column, 28), M.graphite, G, 0, 0, -column / 2 - 0.02); col.rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 32), M.spoke, G, 0, 0, -0.05).rotation.x = Math.PI / 2; }
  const mk = (sgn) => {
    const piv = new THREE.Group(); piv.position.set(0, sgn * 0.066, 0.016); G.add(piv);
    const f = mesh(rbox(0.155, 0.064, 0.02, 0.008), M.cover, piv, 0, -sgn * 0.0325, 0);
    return { piv, f };
  };
  const top = mk(1), bot = mk(-1);
  const lab = stamp
    ? textPlate([["AUDIRA", `800 92px ${SANS}`, 70, "rgba(214,216,220,.95)"], ["SRS · AIRBAG", `700 34px ${MONO}`, 132, "rgba(214,216,220,.7)"]], 512, 170, 0.12, 0.04)
    : textPlate([["AIRBAG", `700 40px ${SANS}`, 34, "rgba(190,192,196,.75)"]], 256, 64, 0.07, 0.0175);
  lab.position.set(0, stamp ? -0.004 : -0.012, 0.0105); bot.f.add(lab);
  const bag = makeBag(G, S, seed, M.bagM, M.ventM);
  return { G, top, bot, bag, flaps(a) { top.piv.rotation.x = -1.95 * a; bot.piv.rotation.x = 1.95 * a; } };
}

// ---------- cutaway inflator (driver disc type), axis +y, cut wedge facing +z ----------
function inflatorCut(parent, M) {
  const G = new THREE.Group(); parent.add(G);
  const R = 0.16, H = 0.11, PS = 0.32 * Math.PI, PL = 1.36 * Math.PI;
  const lathe = (pts, seg = 96) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg, PS, PL);
  mesh(lathe([[0.001, -H / 2], [R - 0.01, -H / 2], [R, -H / 2 + 0.01], [R, H / 2 - 0.01], [R - 0.01, H / 2], [0.001, H / 2]]), M.steel, G);
  mesh(lathe([[R, -0.006], [R + 0.045, -0.006], [R + 0.045, 0.006], [R, 0.006]]), M.steel, G);
  for (const phi of [PS, PS + PL]) {
    const s = new THREE.Group(); s.rotation.y = phi; G.add(s);
    const f = (w, h, d, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), M.section, s, x, y, z);
    f(0.002, H, 0.006, 0, 0, R - 0.003); f(0.002, 0.006, R, 0, H / 2 - 0.003, R / 2); f(0.002, 0.006, R, 0, -H / 2 + 0.003, R / 2);
    f(0.002, 0.012, 0.045, 0, 0, R + 0.0225); f(0.002, H - 0.014, 0.008, 0, 0, 0.118); f(0.002, H * 0.7, 0.005, 0, -H * 0.15, 0.036);
  }
  const filt = mesh(new THREE.CylinderGeometry(0.118, 0.118, H - 0.014, 96, 1, true, PS, PL), M.meshM, G); filt.castShadow = false;
  mesh(new THREE.CylinderGeometry(0.036, 0.036, H * 0.7, 48, 1, true, PS, PL), M.steel, G, 0, -H * 0.15, 0);
  const ign = new THREE.Group(); ign.position.y = -0.012; G.add(ign);
  mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.04, 32), M.brass, ign);
  const cap = mesh(new THREE.SphereGeometry(0.019, 24, 12, 0, 6.3, 0, Math.PI / 2), M.ignCap, ign, 0, 0.02, 0);
  for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.07, 8), M.alu, ign, s * 0.007, -0.05, 0);
  const curve = new THREE.CatmullRomCurve3([[0.007, -0.095, 0], [0.02, -0.12, 0.02], [0.12, -0.13, 0.08], [0.26, -0.12, 0.1], [0.34, -0.1, 0.06]].map((p) => new THREE.Vector3(...p)));
  mesh(new THREE.TubeGeometry(curve, 60, 0.004, 8), M.wire, ign);
  mesh(rbox(0.05, 0.03, 0.03, 0.006), M.ceramic, ign, 0.36, -0.1, 0.05);
  const pellet = new THREE.CylinderGeometry(0.011, 0.011, 0.007, 18), bands = [], Rr = mulberry(77);
  for (let b = 0; b < 3; b++) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x48484b, roughness: 0.7, emissive: 0xff6a1a, emissiveIntensity: 0 });
    const list = [];
    for (let i = 0; i < 70; i++) {
      const r = 0.048 + (b + Rr()) * 0.021, a = (Rr() - 0.5) * 2 * 0.62 * Math.PI, y = -H / 2 + 0.012 + Rr() * (H - 0.03);
      list.push([Math.sin(a) * r, y, Math.cos(a) * r, Rr() * 3, Rr() * 3, 0.85 + Rr() * 0.3]);
    }
    const im = new THREE.InstancedMesh(pellet, mat, list.length); im.frustumCulled = false; im.castShadow = true; G.add(im);
    const d = new THREE.Object3D();
    list.forEach((p, i) => { d.position.set(p[0], p[1], p[2]); d.rotation.set(p[3], p[4], 0); d.scale.setScalar(p[5]); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
    bands.push({ im, mat });
  }
  const ports = [];
  for (let i = 0; i < 14; i++) {
    const a = PS + 0.05 + (i / 13) * (PL - 0.1), x = Math.sin(a) * (R + 0.001), z = Math.cos(a) * (R + 0.001);
    const p = mesh(new THREE.CircleGeometry(0.0085, 16), M.port, G, x, H / 2 - 0.024, z); p.rotation.y = a; p.castShadow = false;
    ports.push([x, H / 2 - 0.024, z, Math.sin(a), Math.cos(a)]);
  }
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, color: new THREE.Color(0xffd27a).multiplyScalar(6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
  spark.position.set(0, 0.03, 0); spark.renderOrder = 30; ign.add(spark);
  const bolt = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, color: new THREE.Color(0x7fd6ff).multiplyScalar(6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  bolt.renderOrder = 30; ign.add(bolt);
  const gas = puffs(G, 80, 808, { size: 0.09, life: [0.8, 1.4], speed: 0.16, color: 0xf6f8fc, op: 0.5 });
  const warm = new THREE.PointLight(0xff7a2a, 0, 0.6, 2); warm.position.set(0, 0, 0.05); G.add(warm);
  return { G, ign, cap, curve, bands, ports, spark, bolt, gas, warm, H };
}

// ---------- crash-test dummy (hip pivot at origin, faces +z) ----------
function dummy(M, { s = 1, child = false } = {}) {
  const G = new THREE.Group(); G.scale.setScalar(s);
  const skin = M.dSkin, jt = M.dJoint;
  const add = (geo, mat, p, x = 0, y = 0, z = 0) => mesh(geo, mat, p, x, y, z);
  add(rbox(0.34, 0.15, 0.25, 0.06), skin, G, 0, 0, 0);
  const upper = new THREE.Group(); upper.position.y = 0.06; G.add(upper);
  add(new THREE.CylinderGeometry(0.11, 0.13, 0.12, 24), jt, upper, 0, 0.06, 0).scale.set(1.1, 1, 0.82);
  const ab = add(new THREE.SphereGeometry(1, 32, 20), skin, upper, 0, 0.17, 0); ab.scale.set(0.15, 0.1, 0.11);
  const chest = add(new THREE.SphereGeometry(1, 40, 28), skin, upper, 0, 0.33, 0); chest.scale.set(0.2, 0.17, 0.13);
  for (let i = 0; i < 3; i++) { const rb = add(new THREE.TorusGeometry(0.17, 0.006, 8, 48, Math.PI), jt, upper, 0, 0.28 + i * 0.045, 0); rb.rotation.x = Math.PI / 2; rb.scale.set(1.12, 0.74, 1); rb.castShadow = false; }
  for (const sx of [-1, 1]) { const d = add(new THREE.CircleGeometry(0.032, 28), M.quad, upper, sx * 0.203, 0.33, 0.0); d.rotation.y = sx * Math.PI / 2; d.castShadow = false; }
  // shoulders clearly wider than the waist
  const yoke = add(new THREE.CapsuleGeometry(0.06, 0.34, 8, 20), skin, upper, 0, 0.46, -0.005); yoke.rotation.z = Math.PI / 2;
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 20), jt, upper, 0, 0.52 + i * 0.026, 0);
  const head = new THREE.Group(); head.position.y = 0.62; upper.add(head);
  const hm = add(new THREE.SphereGeometry(0.1, 48, 32), M.dHead, head, 0, 0.1, 0.0); hm.scale.set(0.92, 1.16, 1.06);
  const jaw = add(new THREE.SphereGeometry(0.07, 24, 16), skin, head, 0, 0.03, 0.03); jaw.scale.set(1, 0.75, 1.05);
  add(rbox(0.024, 0.05, 0.03, 0.01), skin, head, 0, 0.1, 0.105);
  for (const sx of [-1, 1]) { const d = add(new THREE.CircleGeometry(0.036, 28), M.quad, head, sx * 0.093, 0.11, 0); d.rotation.y = sx * Math.PI / 2; d.castShadow = false; }
  const arm = (sx) => {
    const sh = new THREE.Group(); sh.position.set(sx * 0.235, 0.45, 0); upper.add(sh);
    add(new THREE.SphereGeometry(0.066, 20, 14), jt, sh);
    add(new THREE.CapsuleGeometry(0.05, 0.2, 8, 16), skin, sh, 0, -0.15, 0);
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    add(new THREE.SphereGeometry(0.048, 16, 12), jt, el);
    add(new THREE.CapsuleGeometry(0.042, 0.19, 8, 16), skin, el, 0, -0.13, 0);
    add(rbox(0.06, 0.09, 0.04, 0.018), skin, el, 0, -0.27, 0.0);
    return { sh, el };
  };
  const leg = (sx) => {
    const hip = new THREE.Group(); hip.position.set(sx * 0.1, -0.02, 0); G.add(hip);
    add(new THREE.CapsuleGeometry(0.074, 0.3, 8, 16), skin, hip, 0, -0.2, 0);
    const kn = new THREE.Group(); kn.position.y = -0.42; hip.add(kn);
    add(new THREE.SphereGeometry(0.064, 16, 12), jt, kn);
    add(new THREE.CapsuleGeometry(0.056, 0.3, 8, 16), skin, kn, 0, -0.2, 0);
    add(rbox(0.1, 0.07, 0.25, 0.03), jt, kn, 0, -0.41, 0.07);
    return { hip, kn };
  };
  const D = { G, upper, head, armL: arm(1), armR: arm(-1), legL: leg(1), legR: leg(-1) };
  if (child) head.scale.setScalar(1.28);
  D.sit = (lean = 0, nod = 0, reach = 1, hands = 0) => {
    for (const l of [D.legL, D.legR]) { l.hip.rotation.x = -Math.PI / 2 + 0.14; l.kn.rotation.x = Math.PI / 2 - 0.08; }
    D.legL.hip.rotation.z = 0.06; D.legR.hip.rotation.z = -0.06;
    upper.rotation.x = -0.14 + lean; head.rotation.x = nod;
    for (const [a, sx] of [[D.armL, 1], [D.armR, -1]]) { a.sh.rotation.set(lerp(-0.25, -1.15, reach), 0, sx * lerp(0.12, 0.2, reach)); a.el.rotation.x = lerp(-1.1, -0.6, reach) - hands; }
  };
  return D;
}
// Flat strap through points; offset normal roughly +z. Draw-in by fraction.
function strap(parent, pts, w, mat, out = V(0, 0, 1)) {
  const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), N = 48, pos = [], idx = [];
  const side = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const p = cv.getPoint(i / N), tg = cv.getTangent(i / N); side.crossVectors(tg, out).normalize().multiplyScalar(w / 2);
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = mesh(g, mat, parent); m.castShadow = false;
  m.draw = (f) => { g.setDrawRange(0, Math.round(N * clamp01(f)) * 6); m.visible = f > 0.01; };
  return m;
}
function seat(parent, M, x, z, { w = 0.54, bench = false } = {}) {
  const G = new THREE.Group(); G.position.set(x, 0.12, z); parent.add(G);
  mesh(rbox(w * 0.55, 0.28, 0.4, 0.03), M.graphite, G, 0, 0.14, 0);
  mesh(rbox(w, 0.14, 0.54, 0.06), M.seat, G, 0, 0.38, 0.02);
  for (const s of [-1, 1]) mesh(rbox(0.07, 0.1, 0.5, 0.035), M.seat, G, s * (w / 2 - 0.02), 0.45, 0.02);
  const bk = new THREE.Group(); bk.position.set(0, 0.43, -0.24); bk.rotation.x = -0.2; G.add(bk);
  mesh(rbox(w, 0.74, 0.14, 0.06), M.seat, bk, 0, 0.37, 0);
  for (const s of [-1, 1]) mesh(rbox(0.08, 0.62, 0.16, 0.035), M.seat, bk, s * (w / 2 - 0.02), 0.34, 0.03);
  if (!bench) { mesh(rbox(0.27, 0.18, 0.12, 0.05), M.seat, bk, 0, 0.86, -0.01); for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 10), M.alu, bk, s * 0.08, 0.75, -0.01); }
  return G;
}

// ---------- generic test sedan (side profile extruded), crumple on the front ----------
function sedan(parent, M) {
  const G = new THREE.Group(); parent.add(G);
  const s = new THREE.Shape(), P = [[-2.2, 0.3], [-1.77, 0.3], "A-1.35", [0.96, 0.3], "A1.38", [2.18, 0.3], [2.22, 0.5], [2.2, 0.74], [1.95, 0.86], [1.0, 0.98], [0.38, 1.42], [-0.85, 1.44], [-1.35, 1.02], [-2.05, 0.96], [-2.22, 0.78]];
  s.moveTo(...P[0]); P.slice(1, 6).forEach((p) => { if (typeof p === "string") { const cx = +p.slice(1); s.absarc(cx, 0.3, 0.41, Math.PI, 0, true); } else s.lineTo(...p); });
  s.splineThru(P.slice(6).map(([x, y]) => new THREE.Vector2(x, y)).concat([new THREE.Vector2(-2.24, 0.55)])); s.lineTo(...P[0]);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.36, bevelEnabled: true, bevelThickness: 0.21, bevelSize: 0.1, bevelSegments: 12, curveSegments: 32 });
  geo.translate(0, 0, -0.68);
  mesh(geo, M.carPaint, G); const base = geo.attributes.position.array.slice();
  const glass = (pts, z) => { const sh = new THREE.Shape(); sh.moveTo(...pts[0]); pts.slice(1).forEach((p) => sh.lineTo(...p)); const m = mesh(new THREE.ShapeGeometry(sh), M.glass, G, 0, 0, z); if (z < 0) { m.rotation.y = Math.PI; m.scale.x = -1; } return m; };
  for (const z of [0.895, -0.895]) { glass([[0.92, 1.02], [0.36, 1.36], [-0.12, 1.37], [-0.12, 1.02]], z); glass([[-0.22, 1.02], [-0.22, 1.37], [-0.8, 1.38], [-1.22, 1.03]], z); }
  const ws = mesh(new THREE.PlaneGeometry(1.5, 0.74), M.glass, G, 0.69, 1.2, 0); ws.rotation.set(0, Math.PI / 2, 0); ws.rotateX(-0.95);
  const rw = mesh(new THREE.PlaneGeometry(1.5, 0.62), M.glass, G, -1.12, 1.23, 0); rw.rotation.set(0, -Math.PI / 2, 0); rw.rotateX(-0.75);
  for (const z of [0.905, -0.905]) {
    for (const [x, y, r] of [[-0.55, 0.72, 0.13], [1.55, 0.7, 0.1]]) { const d = mesh(new THREE.CircleGeometry(r, 32), M.quad, G, x, y, z); if (z < 0) d.rotation.y = Math.PI; d.castShadow = false; }
    mesh(new THREE.BoxGeometry(4.0, 0.06, 0.02), M.orange, G, -0.05, 0.86, z * 1.002).castShadow = false;
  }
  const gapM = new THREE.MeshBasicMaterial({ color: 0x3a3c40 });
  for (const z of [0.893, -0.893]) for (const [x, y0, y1] of [[0.95, 0.42, 1.0], [-0.2, 0.36, 1.02], [-1.28, 0.42, 0.98]]) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.008, y1 - y0, 0.004), gapM); g.position.set(x, (y0 + y1) / 2, z); G.add(g); }
  for (const z of [0.9, -0.9]) for (const x of [0.55, -0.6]) mesh(rbox(0.16, 0.035, 0.03, 0.012), M.alu, G, x, 0.92, z);
  for (const z of [0.9, -0.9]) mesh(rbox(3.0, 0.1, 0.03, 0.02), M.graphite, G, -0.15, 0.36, z);
  const lights = [];
  for (const z of [0.58, -0.58]) lights.push(mesh(rbox(0.06, 0.1, 0.32, 0.02), M.headL, G, 2.24, 0.68, z));
  const grille = mesh(rbox(0.05, 0.12, 0.7, 0.02), M.graphite, G, 2.25, 0.52, 0);
  mesh(rbox(0.16, 0.14, 1.9, 0.05), M.graphite, G, -2.25, 0.42, 0);
  for (const z of [0.98, -0.98]) mesh(rbox(0.16, 0.08, 0.1, 0.03), M.graphite, G, 0.82, 1.02, z);
  const wheels = [];
  for (const x of [1.38, -1.35]) for (const z of [0.8, -0.8]) {
    const w = new THREE.Group(); w.position.set(x, 0.33, z); G.add(w);
    mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 48), M.tire, w).rotation.x = Math.PI / 2;
    const rim = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.25, 32), M.alu, w); rim.rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) { const sp = mesh(new THREE.BoxGeometry(0.04, 0.17, 0.02), M.graphite, w, 0, 0, z > 0 ? 0.126 : -0.126); sp.rotation.z = k * 1.2566; sp.translateY(0.08); }
    wheels.push(w);
  }
  return {
    G, wheels, lights, grille,
    crumple(c) {
      const A = geo.attributes.position.array;
      for (let i = 0; i < A.length; i += 3) {
        const x = base[i], y = base[i + 1], z = base[i + 2];
        A[i] = x > 1.0 ? 1.0 + (x - 1.0) * (1 - 0.42 * c) + c * 0.03 * Math.sin(z * 9 + y * 7) * clamp01((x - 1.4) / 0.8) : x;
        A[i + 1] = y + (x > 1.25 && y > 0.7 ? c * 0.11 * Math.sin(Math.PI * clamp01((x - 1.25) / 0.95)) : 0);
      }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
      const fx = 1.0 + 1.24 * (1 - 0.42 * c);
      lights.forEach((l) => (l.position.x = fx)); grille.position.x = fx + 0.01;
      wheels[0].position.x = wheels[1].position.x = 1.0 + 0.38 * (1 - 0.3 * c);
    },
  };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xe6e3dd, exp: 1.0, bloom: [0.2, 0.4, 2.6], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  cam.setViewOffset(1080, 1920, 0, 70, 1080, 1920); // subject at screen centre sits a little above the true centre (panels top, captions low)
  const dof = new ShaderPass(Dof); comp.insertPass(dof, 1);
  for (const rt of [comp.renderTarget1, comp.renderTarget2]) { rt.depthTexture = new THREE.DepthTexture(1080, 1920); rt.depthTexture.type = THREE.UnsignedIntType; }
  comp.addPass(new ShaderPass(Grade));
  scene.environment = envFrom(r, [[7, 3.5, 0xffffff, 2.4, 0, 6, 1], [1.4, 5, 0xffffff, 1.8, -5, 1.5, 1.5], [1.4, 5, 0xe4ecff, 1.5, 5, 1.5, -1], [9, 2, 0xfff6ec, 0.9, 0, -2.5, 4], [3, 3, 0xffffff, 1.2, 0, 2, 6]], 0x8d8b88);
  scene.environmentIntensity = 0.62;
  scene.add(cam);
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const W = new THREE.Group(); scene.add(W);

  // ---------- seamless sweep backdrop (camera-locked) + shadow floor ----------
  const bdT = canvasTex(512, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#b9b5ae"); gr.addColorStop(0.28, "#dedad3"); gr.addColorStop(0.52, "#f1eee8"); gr.addColorStop(0.8, "#e2ded7"); gr.addColorStop(1, "#c6c2bb"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const rg = g.createRadialGradient(w / 2, h * 0.46, 10, w / 2, h * 0.46, w * 0.95); rg.addColorStop(0, "rgba(255,255,255,.45)"); rg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = rg; g.fillRect(0, 0, w, h);
    const R = mulberry(3); for (let i = 0; i < 9000; i++) { const v = R() > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},0.02)`; g.fillRect(R() * w, R() * h, 1, 1); }
  });
  const bdM = new THREE.MeshBasicMaterial({ map: bdT, toneMapped: false, depthWrite: false, depthTest: false, fog: false });
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(36, 64), bdM); bd.position.z = -60; bd.renderOrder = -10; cam.add(bd);
  const floorM = new THREE.ShadowMaterial({ opacity: 0.32, color: 0x2a221a });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), floorM); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; W.add(floor);
  const blobT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(30,24,18,.55)"); gr.addColorStop(0.5, "rgba(30,24,18,.25)"); gr.addColorStop(1, "rgba(30,24,18,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (parent, w, d, x, z, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); m.renderOrder = 1; parent.add(m); return m; };

  // ---------- lights (re-placed around the shot target every frame) ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.1));
  const hemi = new THREE.HemisphereLight(0xfffaf2, 0x8a847c, 0.45); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfffaf3, 2.1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02; key.shadow.radius = 7; key.shadow.blurSamples = 16; scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xcfe0ff, 1.7); scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(0xfff4e8, 0.55); scene.add(fill, fill.target);

  // ---------- materials ----------
  const quadT = canvasTex(128, 128, (g, w) => {
    g.clearRect(0, 0, w, w); const c = w / 2, rr = w / 2 - 4;
    g.fillStyle = "#111"; g.beginPath(); g.arc(c, c, rr + 3, 0, 7); g.fill();
    for (let q = 0; q < 4; q++) { g.fillStyle = q % 2 ? "#111" : "#F2C230"; g.beginPath(); g.moveTo(c, c); g.arc(c, c, rr, q * Math.PI / 2, (q + 1) * Math.PI / 2); g.fill(); }
  });
  const fabricT = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#c9c9c6"; g.fillRect(0, 0, w, h); const R = mulberry(9);
    for (let i = 0; i < 6000; i++) { const v = R() > 0.5 ? 255 : 60; g.fillStyle = `rgba(${v},${v},${v},${R() * 0.07})`; g.fillRect(R() * w, R() * h, 2, 2); }
    for (let y = 0; y < h; y += 64) { const gr = g.createLinearGradient(0, y, 0, y + 64); gr.addColorStop(0, "rgba(0,0,0,.22)"); gr.addColorStop(0.15, "rgba(255,255,255,.06)"); gr.addColorStop(0.85, "rgba(0,0,0,.03)"); gr.addColorStop(1, "rgba(0,0,0,.22)"); g.fillStyle = gr; g.fillRect(0, y, w, 64); g.fillStyle = "rgba(80,80,80,.4)"; for (let x = 0; x < w; x += 8) g.fillRect(x, y + 4, 4, 1.4); }
  }, [3, 3]);
  const leatherT = canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = "#222327"; g.fillRect(0, 0, w, h); const R = mulberry(5);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${R() > 0.5 ? "255,255,255" : "0,0,0"},${0.04 + R() * 0.05})`; g.fillRect(R() * w, R() * h, 2, 2); }
    g.fillStyle = "rgba(170,170,170,.55)"; for (let x = 0; x < w; x += 12) g.fillRect(x, h * 0.47, 7, 2);
  }, [10, 1]);
  const M = {
    ceramic: phys(0xf2f0eb, 0.3, 1), ceramicW: phys(0xece7df, 0.36, 0.8), graphite: phys(0x2a2c31, 0.42, 0.7), cover: phys(0x1e1f23, 0.36, 0.9),
    spoke: new THREE.MeshStandardMaterial({ color: 0x3c3f45, roughness: 0.3, metalness: 0.8 }), alu: metal(0xc9cdd2, 0.26), steel: new THREE.MeshStandardMaterial({ color: 0xc2c6cb, roughness: 0.24, metalness: 1, side: THREE.DoubleSide }),
    leather: std(0xffffff, 0.55, 0, { map: leatherT }),
    bagM: new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: 0.34, sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.28, clearcoat: 0.45, clearcoatRoughness: 0.22, specularIntensity: 1, map: bagTex, bumpMap: bagTex, bumpScale: 2.4, side: THREE.DoubleSide }),
    ventM: std(0xd6d1c7, 0.5),
    section: new THREE.MeshStandardMaterial({ color: 0xff5a1f, roughness: 0.45, emissive: 0xff5a1f, emissiveIntensity: 0.18 }),
    orange: phys(0xff5a1f, 0.4, 0.6), meshM: new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.45, metalness: 0.85, side: THREE.DoubleSide, map: canvasTex(128, 128, (g, w) => { g.fillStyle = "#666"; g.fillRect(0, 0, w, w); g.strokeStyle = "#ddd"; g.lineWidth = 2; for (let i = 0; i < w; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 30, w); g.stroke(); g.beginPath(); g.moveTo(i + 30, 0); g.lineTo(i, w); g.stroke(); } }, [10, 2]) }),
    brass: metal(0xcaa24c, 0.28), ignCap: new THREE.MeshStandardMaterial({ color: 0xcaa24c, roughness: 0.28, metalness: 0.85, emissive: 0xffb050, emissiveIntensity: 0 }),
    wire: phys(0xd23a1e, 0.4, 0.6), port: new THREE.MeshBasicMaterial({ color: 0x15171a }),
    dSkin: phys(0xe3a93c, 0.36, 0.6), dJoint: phys(0x26282c, 0.5, 0.4), dHead: phys(0xffffff, 0.34, 0.6),
    quad: new THREE.MeshBasicMaterial({ map: quadT, transparent: true }),
    seat: new THREE.MeshPhysicalMaterial({ color: 0x9c9a96, roughness: 0.92, sheen: 1, sheenColor: new THREE.Color(0xd8d4cc), sheenRoughness: 0.6, map: fabricT, bumpMap: fabricT, bumpScale: 3 }),
    carPaint: new THREE.MeshPhysicalMaterial({ color: 0xeceae5, roughness: 0.16, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, sheen: 0.3, sheenColor: new THREE.Color(0xfff6ea) }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x15191f, roughness: 0.04, metalness: 0.3, clearcoat: 1, side: THREE.DoubleSide }),
    headL: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, emissive: 0xfff2d8, emissiveIntensity: 0.5 }), tire: std(0x1c1d1f, 0.82),
  };
  M.dHead.map = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#e3a93c"; g.fillRect(0, 0, w, h); const cx = w * 0.25;
    g.filter = "blur(3px)"; g.fillStyle = "rgba(120,70,0,.3)"; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(cx + sx * 30, 116, 20, 12, 0, 0, 7); g.fill(); }
    g.fillStyle = "rgba(255,240,200,.3)"; g.beginPath(); g.ellipse(cx, 66, 60, 24, 0, 0, 7); g.fill(); g.filter = "none";
    g.fillStyle = "rgba(40,30,10,.5)"; g.fillRect(cx - 1, 18, 2, 100);
    g.strokeStyle = "rgba(90,50,0,.45)"; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 14, 168); g.quadraticCurveTo(cx, 173, cx + 14, 168); g.stroke();
  });
  M.dHead.needsUpdate = true;

  // =================== H: hero wheel ===================
  const hG = new THREE.Group(); hG.position.x = O.H; W.add(hG);
  const hTilt = new THREE.Group(); hTilt.position.set(0, 0.74, 0); hTilt.rotation.x = -0.28; hG.add(hTilt);
  const hero = wheelModule(hTilt, M, { S: 1, seed: 1.3, stamp: true, column: 0.42 });
  blob(hG, 1.1, 0.9, 0, -0.05, 0.9);
  const heroPuff = puffs(hTilt, 30, 51, { size: 0.07, life: [1.1, 1.9], speed: 0.1, color: 0xf3f6fb, op: 0.3 });
  const hWire = new THREE.CatmullRomCurve3([[0.03, -0.03, -0.42], [0.04, -0.03, -0.25], [0.02, -0.02, -0.06]].map((p) => V(...p)));
  const hBolt = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, color: new THREE.Color(0x7fd6ff).multiplyScalar(5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); hBolt.renderOrder = 30; hTilt.add(hBolt);

  // =================== S: MEMS accelerometer macro ===================
  const sG = new THREE.Group(); sG.position.x = O.S; W.add(sG);
  const chip = new THREE.Group(); chip.position.y = 0.36; sG.add(chip);
  mesh(rbox(0.74, 0.1, 0.74, 0.03), M.ceramic, chip, 0, 0, 0);
  mesh(rbox(0.6, 0.02, 0.6, 0.01), M.graphite, chip, 0, 0.046, 0);
  for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const ld = mesh(rbox(0.045, 0.018, 0.09, 0.006), M.alu, chip, sx * 0.39, -0.035, -0.28 + i * 0.08); ld.rotation.y = Math.PI / 2; }
  const si = new THREE.MeshPhysicalMaterial({ color: 0x5c6679, roughness: 0.2, metalness: 0.7, iridescence: 0.7, iridescenceIOR: 1.6, clearcoat: 0.6 });
  mesh(new THREE.BoxGeometry(0.46, 0.02, 0.46), si, chip, 0, 0.066, 0);
  const siL = new THREE.MeshStandardMaterial({ color: 0xb3bac5, roughness: 0.22, metalness: 0.9 });
  const mass = new THREE.Group(); mass.position.y = 0.088; chip.add(mass);
  mesh(new THREE.BoxGeometry(0.2, 0.02, 0.17), new THREE.MeshStandardMaterial({ color: 0xc8cfd8, roughness: 0.18, metalness: 0.95, map: canvasTex(128, 128, (g, w) => { g.fillStyle = "#d3d9e0"; g.fillRect(0, 0, w, w); g.fillStyle = "#5a616b"; for (let x = 10; x < w; x += 18) for (let y = 10; y < w; y += 18) g.fillRect(x, y, 7, 7); }) }), mass);
  const fingM = new THREE.MeshStandardMaterial({ color: 0x9fb0c4, roughness: 0.22, metalness: 0.7, emissive: 0x47c8ff, emissiveIntensity: 0 });
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) {
    mesh(new THREE.BoxGeometry(0.08, 0.012, 0.01), siL, mass, sx * 0.14, 0, -0.072 + i * 0.024);
    mesh(new THREE.BoxGeometry(0.08, 0.014, 0.01), fingM, chip, sx * 0.165, 0.088, -0.06 + i * 0.024);
  }
  for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.02, 0.02, 0.2), siL, chip, sx * 0.212, 0.088, 0);
  const anc = [[-0.08, -0.15], [0.08, -0.15], [-0.08, 0.15], [0.08, 0.15]];
  anc.forEach(([x, z]) => mesh(new THREE.BoxGeometry(0.035, 0.02, 0.025), siL, chip, x, 0.088, z));
  const springMat = new THREE.MeshStandardMaterial({ color: 0xdde2e8, roughness: 0.18, metalness: 0.95 });
  const springs = anc.map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), springMat); m.castShadow = true; chip.add(m); return m; });
  const springGeo = (ax, az, mx, mz) => { const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10, zz = (i > 0 && i < 10) ? (i % 2 ? 0.022 : -0.022) : 0; pts.push(V(lerp(ax, mx, u) + zz, 0.088, lerp(az, mz, u))); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), 60, 0.004, 6); };
  // gold bond wires from die to package pads
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) {
    const z = -0.18 + i * 0.072, cv = new THREE.CatmullRomCurve3([V(sx * 0.22, 0.078, z), V(sx * 0.255, 0.115, z), V(sx * 0.29, 0.06, z)]);
    mesh(new THREE.TubeGeometry(cv, 16, 0.0025, 5), M.brass, chip).castShadow = false;
    mesh(new THREE.BoxGeometry(0.02, 0.004, 0.02), M.brass, chip, sx * 0.29, 0.058, z);
  }
  const arrowM = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff5a1f, emissiveIntensity: 0.5, roughness: 0.4 });
  const arr = new THREE.Group(); arr.position.set(0, 0.13, 0); chip.add(arr);
  mesh(new THREE.BoxGeometry(0.014, 0.008, 0.12), arrowM, arr, 0, 0, 0.0); const ah = mesh(new THREE.ConeGeometry(0.026, 0.05, 3), arrowM, arr, 0, 0, 0.08); ah.rotation.x = Math.PI / 2;
  // lifted lid, foreground layer, stamped AUDIRA
  const sLid = new THREE.Group(); sLid.position.set(0.32, 0.74, -0.8); sLid.rotation.set(0.9, 0.35, 0.0); sG.add(sLid); sLid.visible = false;
  mesh(rbox(0.74, 0.04, 0.74, 0.03), M.ceramic, sLid);
  const sLidT = textPlate([["AUDIRA", `800 96px ${SANS}`, 120], ["MEMS · ACC-08", `700 40px ${MONO}`, 196]], 512, 300, 0.5, 0.29); sLidT.rotation.x = -Math.PI / 2; sLidT.position.y = 0.0205; sLid.add(sLidT);
  blob(sG, 1.2, 1.2, 0, 0, 0.8);

  // =================== E: airbag control unit ===================
  const eG = new THREE.Group(); eG.position.x = O.E; W.add(eG);
  const ecu = new THREE.Group(); ecu.position.y = 0.32; eG.add(ecu);
  mesh(rbox(0.86, 0.1, 0.66, 0.03), M.alu, ecu, 0, 0, 0);
  const pcbT = canvasTex(1024, 768, (g, w, h) => {
    g.fillStyle = "#1a2a26"; g.fillRect(0, 0, w, h); const R = mulberry(808); g.lineCap = "round";
    for (let i = 0; i < 80; i++) { let x = R() * w, y = R() * h; g.strokeStyle = `rgba(214,176,92,${0.3 + R() * 0.3})`; g.lineWidth = 2 + R() * 3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { if (k % 2) y += (R() - 0.5) * 200; else x += (R() - 0.5) * 300; g.lineTo(x, y); } g.stroke(); g.fillStyle = "rgba(226,190,100,.7)"; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
    g.fillStyle = "rgba(235,235,230,.75)"; g.font = `700 30px ${MONO}`; g.fillText("ACU-08", 40, 60);
  });
  const pcbSide = std(0x14201d, 0.6);
  mesh(new THREE.BoxGeometry(0.78, 0.012, 0.58), [pcbSide, pcbSide, std(0xffffff, 0.5, 0.1, { map: pcbT }), pcbSide, pcbSide, pcbSide], ecu, 0, 0.056, 0);
  const EY = 0.062;
  mesh(rbox(0.17, 0.024, 0.17, 0.006), std(0x141517, 0.38), ecu, -0.12, EY + 0.012, -0.06);
  const mcuL = textPlate([["ACU", `800 70px ${SANS}`, 60, "rgba(220,220,220,.85)"], ["CRASH-DSP", `400 30px ${MONO}`, 112, "rgba(220,220,220,.7)"]], 256, 150, 0.13, 0.076); mcuL.rotation.x = -Math.PI / 2; mcuL.position.set(-0.12, EY + 0.025, -0.06); ecu.add(mcuL);
  for (let i = 0; i < 12; i++) for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.006, 0.004, 0.02), M.alu, ecu, -0.19 + i * 0.0127, EY + 0.004, -0.06 + s * 0.095);
  for (const [x, z] of [[0.17, -0.16], [0.24, -0.16], [0.17, -0.04]]) { mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 24), M.alu, ecu, x, EY + 0.045, z); mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.006, 24), std(0x1b1d22, 0.4), ecu, x, EY + 0.093, z); }
  mesh(rbox(0.3, 0.07, 0.08, 0.01), M.ceramic, ecu, -0.1, EY + 0.035, -0.27);
  const leds = [];
  for (let i = 0; i < 10; i++) { const mm = new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.25, emissive: i < 5 ? 0x3cff7a : i < 7 ? 0xffb020 : 0xff2a1a, emissiveIntensity: 0 }); leds.push(mesh(rbox(0.045, 0.018, 0.034, 0.006), mm, ecu, -0.27 + i * 0.058, EY + 0.01, 0.2)); }
  mesh(new THREE.BoxGeometry(0.006, 0.03, 0.07), new THREE.MeshBasicMaterial({ color: 0xffffff }), ecu, -0.27 + 6.5 * 0.058, EY + 0.016, 0.2);
  const dispA = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#06120c"; g.fillRect(0, 0, w, h); g.fillStyle = "#5dff9a"; g.font = `700 54px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SIAGA", w / 2, h / 2); });
  const dispB = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#1a0303"; g.fillRect(0, 0, w, h); g.fillStyle = "#ff4a2a"; g.font = `700 58px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PICU!", w / 2, h / 2); });
  const dispM = new THREE.MeshBasicMaterial({ map: dispA, toneMapped: false });
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.071), dispM); disp.rotation.x = -Math.PI / 2; disp.position.set(0.2, EY + 0.008, 0.09); ecu.add(disp);
  const pulseM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6fe0ff).multiplyScalar(3), toneMapped: false });
  const dataP = Array.from({ length: 8 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.014), pulseM); ecu.add(m); return m; });
  mesh(new THREE.BoxGeometry(0.5, 0.003, 0.012), std(0xd8b25c, 0.3, 0.8), ecu, -0.18, EY + 0.008, -0.27 + 0.06);
  const eLid = new THREE.Group(); eLid.position.set(0.15, 0.4, -0.62); eLid.rotation.set(1.3, -0.25, 0.0); eG.add(eLid);
  mesh(rbox(0.86, 0.035, 0.66, 0.025), M.alu, eLid);
  const eLidT = textPlate([["AUDIRA", `800 128px ${SANS}`, 130], ["SRS · ACU-08", `700 46px ${MONO}`, 228]], 640, 320, 0.62, 0.31, { color: "rgba(28,30,34,.9)" }); eLidT.rotation.x = -Math.PI / 2; eLidT.position.y = 0.0185; eLid.add(eLidT);
  blob(eG, 1.4, 1.1, 0, 0, 0.8);

  // =================== C: crash lane ===================
  const cG = new THREE.Group(); cG.position.x = O.C; W.add(cG);
  const laneT = canvasTex(2048, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); const fade = (x, y) => Math.min(1, Math.min(x, w - x) / 300) * Math.min(1, Math.min(y, h - y) / 110);
    for (let x = 0; x < w; x += 8) for (let y = 0; y < h; y += 8) { const a = fade(x, y); g.fillStyle = `rgba(206,203,197,${0.9 * a})`; g.fillRect(x, y, 8, 8); }
    g.fillStyle = "rgba(242,194,48,.9)"; for (const y of [0.16 * h, 0.84 * h]) for (let x = 300; x < w - 300; x += 64) g.fillRect(x, y - 5, 38, 10);
    g.fillStyle = "rgba(30,30,32,.7)"; for (let x = 300; x < w - 200; x += 34) { const L = (x / 34) % 5 === 0 ? 40 : 18; g.fillRect(x, 0.5 * h - L / 2, 3, L); }
  });
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.4), new THREE.MeshStandardMaterial({ map: laneT, transparent: true, roughness: 0.75, depthWrite: false })); lane.rotation.x = -Math.PI / 2; lane.position.set(-3.5, 0.002, 0); lane.receiveShadow = true; cG.add(lane);
  const concT = (sign) => canvasTex(sign ? 1024 : 512, 1024, (g, w, h) => {
    g.fillStyle = "#c9c6c0"; g.fillRect(0, 0, w, h); const R = mulberry(sign ? 61 : 62);
    for (let i = 0; i < 9000; i++) { const v = R() > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${R() * 0.06})`; g.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3); }
    g.strokeStyle = "rgba(60,58,54,.28)"; g.lineWidth = 3; for (let y = 0; y < h; y += 256) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let x = 0; x < w; x += 20) { g.fillStyle = Math.floor(x / 40) % 2 ? "#151515" : "#F2C230"; g.save(); g.translate(x, h - 90); g.transform(1, 0, -0.6, 1, 0, 0); g.fillRect(0, 0, 20, 90); g.restore(); }
    if (sign) { g.fillStyle = "#151515"; g.font = `900 132px ${SANS}`; g.textAlign = "center"; g.fillText("AUDIRA", w / 2, 230); g.font = `700 56px ${SANS}`; g.fillText("CRASH LAB", w / 2, 310); g.fillStyle = "#ff5a1f"; g.fillRect(w / 2 - 180, 345, 360, 10); }
  });
  const concPlain = std(0xffffff, 0.88, 0, { map: concT(false) });
  const signM = std(0xffffff, 0.88, 0, { map: concT(true) });
  mesh(new THREE.BoxGeometry(2.0, 2.4, 4.8), [concPlain, signM, concPlain, concPlain, signM, concPlain], cG, 3.9, 1.2, 0);
  const car = sedan(cG, M);
  blob(car.G, 5.2, 2.4, 0, 0, 0.9);
  const debM = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.4, metalness: 0.6 });
  const debris = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.02, 0.045), debM, 50); debris.frustumCulled = false; debris.castShadow = true; cG.add(debris);
  const debD = (() => { const R = mulberry(44); return Array.from({ length: 50 }, () => [R() * -1.8 - 0.4, 1.0 + R() * 2.2, (R() - 0.5) * 3.2, R() * 6, R() * 6, R() * 0.3 + 0.35]); })();
  const dObj = new THREE.Object3D();

  // =================== I: cutaway inflator ===================
  const iG = new THREE.Group(); iG.position.x = O.I; W.add(iG);
  const infHold = new THREE.Group(); infHold.position.set(0, 0.62, 0); infHold.scale.setScalar(3.3); iG.add(infHold);
  const inf = inflatorCut(infHold, M);
  blob(iG, 1.8, 1.6, 0, 0, 0.85);

  // =================== B: seat buck ===================
  const bG = new THREE.Group(); bG.position.x = O.B; W.add(bG);
  mesh(rbox(1.7, 0.12, 3.1, 0.05), M.ceramic, bG, 0, 0.06, -0.3);
  const DX = 0.36, KX = -0.4;
  seat(bG, M, DX, 0.02);
  seat(bG, M, 0, -1.25, { w: 1.5, bench: true });
  // dash: slim ceramic beam + column
  mesh(rbox(1.62, 0.16, 0.3, 0.06), M.ceramicW, bG, 0, 1.02, 1.12);
  mesh(rbox(1.55, 0.05, 0.36, 0.02), M.graphite, bG, 0, 0.93, 1.1);
  for (const s of [-1, 1]) mesh(rbox(0.07, 0.86, 0.07, 0.02), M.alu, bG, s * 0.78, 0.55, 1.12);
  const pBagHold = new THREE.Group(); pBagHold.position.set(-0.4, 1.06, 1.0); pBagHold.rotation.y = Math.PI; pBagHold.rotation.x = 0.0; bG.add(pBagHold);
  const bWheelO = new THREE.Group(); bWheelO.position.set(DX, 1.02, 0.66); bWheelO.rotation.y = Math.PI; bG.add(bWheelO);
  const bWheelT = new THREE.Group(); bWheelT.rotation.x = -0.4; bWheelO.add(bWheelT);
  const bw = wheelModule(bWheelT, M, { S: 1, seed: 2.1, column: 0.5 });
  const drv = dummy(M); drv.G.position.set(DX, 0.64, 0.06); bG.add(drv.G);
  const ventPuff = puffs(bG, 60, 404, { size: 0.08, life: [0.7, 1.2], speed: 0.24, color: 0xf6f9ff, op: 0.6 });
  const beltM = phys(0xff5a1f, 0.55, 0.2, { emissive: 0xff5a1f, emissiveIntensity: 0, side: THREE.DoubleSide });
  const beltS = strap(bG, [[DX - 0.24, 1.3, -0.12], [DX - 0.17, 1.18, 0.07], [DX - 0.02, 0.98, 0.15], [DX + 0.13, 0.8, 0.15], [DX + 0.22, 0.66, 0.1]], 0.055, beltM);
  const lapS = strap(bG, [[DX + 0.24, 0.66, 0.0], [DX + 0.12, 0.7, 0.16], [DX - 0.12, 0.7, 0.16], [DX - 0.26, 0.64, -0.02]], 0.055, beltM);
  const buckle = mesh(rbox(0.05, 0.07, 0.03, 0.01), M.alu, bG, DX + 0.21, 0.68, 0.1);
  // child seat on the rear bench (behind the empty passenger side)
  const cs = new THREE.Group(); cs.position.set(KX, 0.58, -1.12); bG.add(cs);
  const csM = std(0xb8b4ad, 0.8);
  mesh(rbox(0.44, 0.1, 0.42, 0.05), csM, cs, 0, 0.05, 0.02);
  const csBk = new THREE.Group(); csBk.position.set(0, 0.06, -0.18); csBk.rotation.x = -0.16; cs.add(csBk);
  mesh(rbox(0.44, 0.7, 0.08, 0.04), csM, csBk, 0, 0.35, 0);
  for (const s of [-1, 1]) { mesh(rbox(0.07, 0.62, 0.3, 0.035), csM, csBk, s * 0.22, 0.32, 0.12); mesh(rbox(0.07, 0.2, 0.22, 0.03), csM, csBk, s * 0.2, 0.62, 0.1); }
  mesh(rbox(0.3, 0.06, 0.24, 0.025), M.graphite, cs, 0, 0.11, 0.02);
  const kid = dummy(M, { s: 0.5, child: true }); kid.G.position.set(KX, 0.75, -1.06); bG.add(kid.G);
  const harnM = phys(0xff5a1f, 0.55, 0.2, { emissive: 0xff5a1f, emissiveIntensity: 0, side: THREE.DoubleSide });
  for (const s of [-1, 1]) strap(bG, [[KX + s * 0.07, 1.08, -1.12], [KX + s * 0.07, 1.0, -0.98], [KX + s * 0.05, 0.88, -0.96], [KX, 0.78, -0.95]], 0.03, harnM).draw(1);
  mesh(rbox(0.05, 0.05, 0.02, 0.01), M.alu, bG, KX, 0.84, -0.95);
  blob(bG, 2.4, 3.8, 0, -0.3, 0.7);

  // =================== R: strobe row (depth) ===================
  const rG = new THREE.Group(); rG.position.x = O.R; W.add(rG);
  const strobe = [];
  for (let i = 0; i < 5; i++) {
    const st = new THREE.Group(); st.position.set(-0.75 + i * 0.32, 0, -3.4 + i * 0.85); rG.add(st);
    mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.04, 40), M.ceramic, st, 0, 0.02, 0);
    mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.56, 16), M.alu, st, 0, 0.3, 0);
    const tl = new THREE.Group(); tl.position.y = 0.72; tl.rotation.set(-0.12, 0.85, 0); st.add(tl);
    const w = wheelModule(tl, M, { S: 1, seed: 3 + i * 0.7, column: 0.08 });
    const u = i / 4; w.flaps(i ? 1 : 0); w.bag.set(u * 0.999 + (i ? 0.001 : 0));
    blob(st, 0.7, 0.7, 0, 0, 0.7);
    strobe.push(st);
  }
  const ruler = new THREE.Group(); if (0) mesh(rbox(0.06, 0.02, 4.0, 0.01), M.ceramic, rG, 0.1, 0.01, -1.6); ruler.rotation.y = Math.atan2(0.32, 0.85);
  const tickM = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0xff5a1f, emissiveIntensity: 0.3 });
  const ticks = [];
  for (let i = 0; i < 5; i++) { const tk = mesh(new THREE.BoxGeometry(0.16, 0.022, 0.025), tickM.clone(), new THREE.Group(), -0.75 + i * 0.32 + 0.38, 0.012, -3.4 + i * 0.85 - 0.14); tk.rotation.y = ruler.rotation.y; ticks.push(tk); }
  const r0 = textPlate([["0 detik", `700 64px ${SANS}`, 64]], 512, 128, 0.42, 0.105); r0.rotation.x = -Math.PI / 2; r0.rotation.z = -ruler.rotation.y; r0.position.set(-0.75 + 0.62, 0.003, -3.4 - 0.05); 
  const r1 = textPlate([["1/20 detik", `800 64px ${SANS}`, 64, "rgba(255,90,31,.95)"]], 512, 128, 0.42, 0.105); r1.rotation.x = -Math.PI / 2; r1.rotation.z = -ruler.rotation.y; r1.position.set(-0.75 + 4 * 0.32 + 0.62, 0.003, -3.4 + 4 * 0.85 - 0.05); 

  // =================== P: crowd of figurines ===================
  const pG = new THREE.Group(); pG.position.x = O.P; W.add(pG);
  mesh(new THREE.CylinderGeometry(2.6, 2.66, 0.06, 96), M.ceramic, pG, 0, 0.03, 0);
  const spots = []; { const R = mulberry(5150); for (let ix = -13; ix <= 13; ix++) for (let iz = -13; iz <= 13; iz++) { const x = ix * 0.18 + (R() - 0.5) * 0.06, z = iz * 0.18 + (R() - 0.5) * 0.06; if (x * x + z * z < 2.35 * 2.35) spots.push([x, z, (R() - 0.5) * 0.9, 0.9 + R() * 0.2]); } }
  const figGeo = [
    [new THREE.SphereGeometry(0.03, 16, 12), 0, 0.205, 0],
    [new THREE.CylinderGeometry(0.044, 0.03, 0.095, 16), 0, 0.135, 0],
    [new THREE.CapsuleGeometry(0.014, 0.075, 4, 8), -0.016, 0.055, 0],
    [new THREE.CapsuleGeometry(0.014, 0.075, 4, 8), 0.016, 0.055, 0],
    [new THREE.CapsuleGeometry(0.011, 0.07, 4, 8), -0.052, 0.13, 0],
    [new THREE.CapsuleGeometry(0.011, 0.07, 4, 8), 0.052, 0.13, 0],
  ];
  figGeo[1][0].scale(1, 1, 0.62);
  figGeo[4][0].rotateZ(-0.18); figGeo[5][0].rotateZ(0.18);
  const figMat = phys(0xffffff, 0.34, 0.8);
  const crowd = figGeo.map(([g, x, y, z]) => { g.translate(x, y, z); const im = new THREE.InstancedMesh(g, figMat, spots.length); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; pG.add(im); return im; });
  spots.forEach(([x, z, ry, s], i) => { dObj.position.set(x, 0.06, z); dObj.rotation.set(0, ry, 0); dObj.scale.setScalar(s); dObj.updateMatrix(); crowd.forEach((im) => im.setMatrixAt(i, dObj.matrix)); });
  const cBase = new THREE.Color(0xeeebe5), cWarm = new THREE.Color(0xff7a3a), cTmp = new THREE.Color();

  // ---------- shots: one per station, continuous move inside, cuts between ----------
  const tP = A("s3:Patokannya"), tT = A("s3:tembok"), tMen = A("s7:Menurut"), tIni = A("s8:Ini");
  const cS2 = K.s2 - 0.08, cS3 = K.s3 - 0.08, cC = tP - 0.3, cS4 = K.s4 - 0.08, cS5 = K.s5 - 0.08, cS6 = K.s6 - 0.08, cS7 = K.s7 - 0.08, cP = tMen - 0.25, cS8 = K.s8 - 0.08, cEnd = tIni - 0.12;
  const carX = (t) => {
    if (t < tT) return lerp(-6.8, 0.68, clamp01((t - cC) / (tT - cC)) * 0.15 + 0.85 * clamp01((t - cC) / (tT - cC)));
    const c = eout((t - tT) / 0.2); return 0.68 + 0.51 * c - 0.1 * ramp(t, tT + 0.18, tT + 0.7);
  };
  const crumpleAt = (t) => eout((t - tT) / 0.2);
  const shots = [
    { a: -1, b: cS2, o: O.H, tr: track([[0, -1.75, 0.95, 1.45, 0, 0.82, 0.08], [A("s1:gas"), -1.6, 0.9, 1.5, 0, 0.82, 0.1], [cS2, -1.45, 0.86, 1.55, 0, 0.82, 0.12]]) },
    { a: cS2, b: cS3, o: O.S, tr: track([[cS2, 1.4, 1.95, 1.9, 0, 0.47, 0.0], [A("s2:mengukur"), 1.18, 1.75, 1.66, 0, 0.46, 0.02], [cS3, 1.0, 1.6, 1.5, 0, 0.45, 0.04]]) },
    { a: cS3, b: cC, o: O.E, tr: track([[cS3, -1.35, 2.0, 2.1, 0.05, 0.5, -0.2], [A("s3:memutuskan"), -1.05, 1.75, 1.8, 0.05, 0.46, -0.1], [A("s3:keras"), -0.75, 1.4, 1.45, 0.02, 0.4, 0.05], [cC, -0.62, 1.3, 1.32, 0.04, 0.4, 0.08]]) },
    { a: cC, b: cS4, o: O.C, f: (t) => {
      const cx = carX(t), u = ramp(t, tT + 0.25, tT + 1.6), a = ramp(t, cC, tT);
      const tx = Math.max(cx + 0.6, -2.5);
      return [[lerp(lerp(4.2, 5.4, a), 0.2, u), lerp(3.0, 2.6, a) + 0.3 * u, lerp(lerp(8.8, 7.6, a), 10.2, u) - 0.6 * ramp(t, tT + 1.6, K.s4)], [lerp(tx, 1.2, u), 0.9, 0.2]];
    } },
    { a: cS4, b: cS5, o: O.I, tr: track([[cS4, 1.7, 2.9, 3.4, 0, 0.6, 0.0], [A("s4:Bahan"), 1.2, 2.55, 3.0, 0, 0.58, 0.05], [cS5, 0.95, 2.4, 2.8, 0, 0.58, 0.06]]) },
    { a: cS5, b: cS6, o: O.H, tr: track([[cS5, 0.5, 2.3, 1.45, 0, 0.72, 0.12], [A("s5:penuh"), 0.7, 2.45, 1.85, 0, 0.72, 0.2], [cS6, 0.75, 2.5, 1.95, 0, 0.72, 0.22]]) },
    { a: cS6, b: cS7, o: O.B, tr: track([[cS6, 4.3, 1.2, 0.5, DX, 0.74, 0.32], [A("s6:kepalamu"), 4.0, 1.2, 0.5, DX, 0.78, 0.36], [A("s6:lubang"), 3.3, 1.22, 0.55, DX, 0.86, 0.42], [A("s6:Kantong") + 0.6, 3.6, 1.2, 0.55, DX, 0.8, 0.4], [cS7, 4.1, 1.2, 0.5, DX, 0.74, 0.32]]) },
    { a: cS7, b: cP, o: O.R, tr: track([[cS7, 2.7, 1.2, 0.1, -0.6, 0.72, -3.1], [A("s7:detik"), 2.9, 1.25, 1.0, 0.35, 0.74, -0.3], [A("s7:kedipan"), 3.0, 1.45, 1.1, -0.1, 0.7, -1.7], [cP, 3.2, 1.5, 1.2, -0.12, 0.7, -1.75]]) },
    { a: cP, b: cS8, o: O.P, tr: track([[cP, 0.0, 4.6, 3.6, 0, 0.1, -0.2], [A("s7:lima"), 0.0, 2.6, 3.1, 0, 0.2, 0.0], [cS8, 0.0, 2.2, 2.8, 0, 0.22, 0.1]]) },
    { a: cS8, b: cEnd, o: O.B, tr: track([[cS8, -2.5, 1.65, 1.7, DX, 0.95, 0.1], [A("s8:sabuk#2"), -2.2, 1.6, 1.5, DX, 0.95, 0.12], [A("s8:dudukkan"), -1.55, 1.55, 1.9, 0.0, 0.9, -0.5], [A("s8:belakang"), -2.0, 1.45, 0.75, KX, 0.88, -1.08], [cEnd, -1.9, 1.4, 0.55, KX, 0.88, -1.1]]) },
    { a: cEnd, b: 1e9, o: O.H, tr: track([[cEnd, 0.75, 1.05, 1.45, 0, 0.78, 0.0], [K.dur, 0.45, 0.95, 1.15, 0, 0.76, 0.0]]) },
  ];
  const groups = { [O.H]: hG, [O.S]: sG, [O.E]: eG, [O.C]: cG, [O.I]: iG, [O.B]: bG, [O.R]: rG, [O.P]: pG };
  const tgt = new THREE.Vector3(), cpos = new THREE.Vector3();
  const tint = (t) => {
    const base = [1, 1, 1];
    const amb = ramp(t, A("s4:Bahan") - 0.3, A("s4:bereaksi")) * (1 - ramp(t, cS5 - 0.3, cS5));
    const cool = t > cC && t < cS4 ? 1 : 0, warmP = t > cP && t < cS8 ? ramp(t, A("s7:lima") - 0.2, A("s7:lima") + 0.8) : 0;
    return [base[0] - 0.04 * cool + 0.02 * amb + 0.02 * warmP, base[1] - 0.02 * cool - 0.06 * amb - 0.01 * warmP, base[2] + 0.0 * cool - 0.14 * amb - 0.05 * warmP];
  };

  return function draw(t) {
    const sh = shots.find((s) => t >= s.a && t < s.b) || shots[shots.length - 1];
    for (const k in groups) groups[k].visible = +k === sh.o;
    let p, q;
    if (sh.f) [p, q] = sh.f(t); else { const v = sh.tr(t); p = v.slice(0, 3); q = v.slice(3, 6); }
    cpos.set(sh.o + p[0], p[1], p[2]); tgt.set(sh.o + q[0], q[1], q[2]);
    cam.position.copy(cpos); cam.lookAt(tgt);
    const dist = cpos.distanceTo(tgt);
    const md = tint(t); bdM.color.setRGB(md[0], md[1], md[2]);
    // lights around the target
    const sc = Math.max(1.2, dist * 0.75);
    key.position.set(tgt.x - 0.9 * sc, tgt.y + 2.4 * sc, tgt.z + 1.4 * sc); key.target.position.copy(tgt);
    const kc = key.shadow.camera; kc.left = kc.bottom = -sc * 1.3; kc.right = kc.top = sc * 1.3; kc.near = 0.1; kc.far = sc * 8; kc.updateProjectionMatrix();
    rim.position.set(tgt.x + 1.6 * sc, tgt.y + 1.0 * sc, tgt.z - 2.0 * sc); rim.target.position.copy(tgt);
    fill.position.set(cpos.x + 0.6, cpos.y - 0.3, cpos.z + 0.4); fill.target.position.copy(tgt);

    // ---------- H ----------
    if (hG.visible) {
      let u, fl;
      if (sh === shots[0]) { u = 0.72 + 0.2 * ramp(t, 0, A("s1:gas") + 0.4); fl = 1; }
      else if (sh === shots[5]) { const tm = A("s5:mendorong"); fl = ramp(t, tm - 0.45, tm + 0.05); u = ramp(t, tm - 0.15, A("s5:penuh") + 0.1); u = Math.min(1, u * u * (3 - 2 * u)); }
      else { u = 0; fl = 0; }
      hero.flaps(fl); hero.bag.set(u);
      const gp = sh === shots[0] ? win(t, A("s1:gas") - 0.2, cS2, 0.4) : sh === shots[5] ? win(t, A("s5:mendorong"), A("s5:penuh") + 0.6, 0.3) : 0;
      heroPuff(t, gp, [[0.08, 0.06, 0.06], [-0.08, 0.06, 0.06], [0.1, -0.05, 0.05], [-0.1, -0.05, 0.05]], [[0.8, 0.5, 0.3], [-0.8, 0.5, 0.3], [0.7, -0.3, 0.4], [-0.7, -0.3, 0.4]]);
      const bu = sh === shots[0] ? clamp01((t - (A("s1:listrik") - 0.1)) / 0.45) : 0;
      hBolt.visible = bu > 0 && bu < 1; if (hBolt.visible) { hWire.getPoint(bu, hBolt.position); hBolt.scale.setScalar(0.05 + 0.01 * Math.sin(t * 40)); }
    }
    // ---------- S ----------
    if (sG.visible) {
      const tm = A("s2:melambat"), shift = 0.055 * ramp(t, tm - 0.25, tm + 0.25) + 0.012 * Math.sin(t * 9) * win(t, A("s2:percepatan"), tm - 0.2, 0.3);
      mass.position.z = shift;
      anc.forEach(([x, z], i) => { springs[i].geometry.dispose(); springs[i].geometry = springGeo(x, z, x * 0.75, (z > 0 ? 0.085 : -0.085) + shift); });
      fingM.emissiveIntensity = 2.2 * win(t, A("s2:percepatan") - 0.1, cS3, 0.3) * (0.6 + 0.4 * Math.abs(Math.sin(t * 7)));
      arr.visible = t > tm - 0.3; arr.position.z = 0.0 + shift; arr.scale.setScalar(0.4 + 0.6 * eout((t - tm + 0.3) / 0.4));
      sLid.position.y = 0.78 + 0.02 * Math.sin(t * 0.8);
    }
    // ---------- E ----------
    if (eG.visible) {
      const tk = A("s3:keras"), lv = 10 * clamp01(ramp(t, A("s3:memutuskan") - 0.2, tk) * 0.62 + 0.38 * ramp(t, tk - 0.15, tk + 0.25));
      leds.forEach((l, i) => (l.material.emissiveIntensity = lv > i + 0.5 ? 2.4 : lv > i ? 0.9 : 0));
      dispM.map = t > tk ? dispB : dispA;
      const dataOn = t > A("s3:membaca") - 0.4;
      dataP.forEach((m, i) => { m.visible = dataOn; const u = ((t * 0.9 + i / dataP.length) % 1); m.position.set(lerp(-0.42, -0.2, u), EY + 0.012, -0.21 + (i % 2) * 0.012); });
      eLid.position.y = 0.4 + 0.01 * Math.sin(t * 0.9);
    }
    // ---------- C ----------
    if (cG.visible) {
      const cx = carX(t), c = crumpleAt(t);
      car.G.position.set(cx, 0, 0); car.crumple(c);
      const spin = t < tT ? (cx + 6.8) / 0.33 : (0.68 + 6.8) / 0.33;
      car.wheels.forEach((w) => (w.rotation.z = -spin));
      car.G.rotation.z = 0.025 * Math.sin(Math.PI * clamp01((t - tT) / 0.5)) * (t > tT ? 1 : 0);
      debris.visible = t > tT;
      if (debris.visible) {
        const dt = Math.min(t - tT, 2.4);
        debD.forEach(([vx, vy, vz, rx, ry, s], i) => {
          const tt = Math.min(dt, (vy + Math.sqrt(vy * vy + 2 * 9.8 * 0.9)) / 9.8);
          const y = Math.max(0.012, 0.9 + vy * tt - 4.9 * tt * tt);
          dObj.position.set(2.75 + vx * tt * 0.9, y, vz * tt * 0.8); dObj.rotation.set(rx * tt * 3, ry * tt * 3, 0); dObj.scale.setScalar(s * 1.4); dObj.updateMatrix(); debris.setMatrixAt(i, dObj.matrix);
        });
        debris.instanceMatrix.needsUpdate = true;
      }
    }
    // ---------- I ----------
    if (iG.visible) {
      const ta = A("s4:arus"), tpm = A("s4:pemantik"), tb = A("s4:Bahan"), tr = A("s4:bereaksi"), tg = A("s4:menghasilkan");
      const pu = clamp01((t - ta) / (tpm - ta));
      inf.bolt.visible = pu > 0 && pu < 1; if (inf.bolt.visible) { inf.curve.getPoint(1 - pu, inf.bolt.position); inf.bolt.scale.setScalar(0.03 + 0.008 * Math.sin(t * 40)); }
      const sp = win(t, tpm - 0.05, tr, 0.2);
      inf.spark.visible = sp > 0.01; inf.spark.scale.setScalar(0.035 * sp + 0.01 * sp * Math.sin(t * 33));
      M.ignCap.emissiveIntensity = 1.4 * sp;
      inf.bands.forEach((b, i) => { const g = ramp(t, tb + i * 0.5, tr + i * 0.5); b.mat.emissiveIntensity = 1.1 * g * (0.85 + 0.15 * Math.sin(t * 13 + i)) * (1 - 0.5 * ramp(t, K.s4e, K.s5)); });
      inf.warm.intensity = 0.8 * ramp(t, tb, tr + 0.5);
      const ga = ramp(t, tg - 0.3, tg + 0.3);
      inf.gas(t, ga, inf.ports.map((p) => [p[0], p[1], p[2]]), inf.ports.map((p) => [p[3] * 0.9, 0.35, p[4] * 0.9]));
    }
    // ---------- B ----------
    if (bG.visible) {
      const s6 = sh === shots[6];
      const tk = A("s6:kepalamu");
      const lean = s6 ? 0.5 * ramp(t, tk - 0.7, tk + 0.5) + 0.16 * ramp(t, A("s6:sebagian"), A("s6:mendadak")) : 0;
      const press = clamp01((lean - 0.12) / 0.3), defl = s6 ? 0.85 * ramp(t, A("s6:sebagian") - 0.1, A("s6:mendadak") + 0.3) : 0;
      drv.sit(lean, 0.3 * lean, 1, 0);
      bw.flaps(s6 ? 1 : 0); bw.bag.set(s6 ? 1 : 0, press, defl);
      kid.sit(0, 0.05, 0.25, 0.4);
      const vAmt = s6 ? win(t, A("s6:sebagian") - 0.1, A("s6:mendadak") + 0.2, 0.3) * (0.6 + 0.4 * Math.sin(t * 5) ** 2) : 0;
      const bx = O.B;
      ventPuff(t, vAmt, bw.bag.ventW.map((v) => [v.x - bx, v.y, v.z]), bw.bag.ventN.map((v) => [v.x * 0.8, v.y + 0.25, v.z * 0.8]));
      const tb = A("s8:sabuk");
      const bf = s6 ? 0 : ramp(t, tb - 0.2, tb + 0.7);
      beltS.draw(bf); lapS.draw(ramp(t, tb + 0.2, tb + 0.9) * (s6 ? 0 : 1)); buckle.visible = bf > 0.9;
      beltM.emissiveIntensity = 0.0 * win(t, tb, A("s8:dudukkan"), 0.3);
      harnM.emissiveIntensity = 0.0 * win(t, A("s8:anak") - 0.1, tIni, 0.3);
    }
    // ---------- R ----------
    if (rG.visible) {
      const cu = ramp(t, A("s7:selesai") - 0.2, A("s7:detik") + 0.2);
      ticks.forEach((m, i) => { m.material.emissiveIntensity = cu * 4.2 > i - 0.1 ? 2.2 : 0.2; });
      strobe.forEach((s, i) => { s.position.y = 0.004 * Math.sin(t * 1.3 + i); });
    }
    // ---------- P ----------
    if (pG.visible) {
      const tl = A("s7:lima"), wave = (t - tl + 0.2) * 2.2;
      spots.forEach(([x, z], i) => { const rr = Math.sqrt(x * x + z * z), w = clamp01((wave - rr) / 0.6); cTmp.copy(cBase).lerp(cWarm, w * 0.7); crowd.forEach((im) => im.setColorAt(i, cTmp)); });
      crowd.forEach((im) => (im.instanceColor.needsUpdate = true));
    }

    dof.uniforms.focus.value = dist; dof.uniforms.near.value = cam.near; dof.uniforms.far.value = cam.far; dof.uniforms.tDepth.value = comp.readBuffer.depthTexture;
    comp.render();
  };
}
