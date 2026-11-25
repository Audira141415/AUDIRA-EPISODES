// EP17 RETROWAVE: Bhutan, the last country to switch on television (1999). One neon night stage:
// a scrolling magenta grid, a wireframe Himalaya horizon with a striped magenta sun, a dzong-like silhouette on a hill
// with prayer flags as neon lines, and a big curved-glass CRT TV floating over the grid. The TV screen is a canvas
// repainted every frame; its content changes per beat with a CRT power-off/on squeeze:
// static snow, map, spillover signal, the 1989 ban stamp, a dim black-and-white bootleg, the 1998 football pilot,
// BBS power-on in colour (payoff), the 19.00 clock, cable tiles multiplying, three banned channels crossed out.
// 3D props per beat: transmitter towers and signal arcs (s3), a dish with a prohibition ring (1989), VHS tapes (s4),
// a grid shock ring on power-on (s6), a wall of 45 channel tiles (s7). Everything is a function of t.

const FONTS = ['400 120px Audiowide', '400 120px "Share Tech Mono"', '400 120px Monoton'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AB19"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, pts, back, smooth } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const HEAD = "Audiowide, 'Arial Black', sans-serif", MONO = "'Share Tech Mono', 'Courier New', monospace";
const MAG = "#FF007F", CYAN = "#00F6FF", AMB = "#FF9E00", GRN = "#39FF14", SIL = "#E2E8F0", VOID = 0x0c081a;
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
const hash = (x) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: VOID, fog: 0.0, exp: 1.0, bloom: [0.32, 0.4, 0.9], shadow: false });
  r.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  scene.fog = new THREE.FogExp2(0x160a2c, 0.0035);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const ENV = 0.55;

  // ---------- beat times ----------
  const s1 = K.s1, s2 = K.s2, s3 = K.s3, b89 = A("s3:Tahun#2"), s4 = K.s4, s5 = K.s5, s5b = A("s5:Setelah"), s6 = K.s6;
  const clk = A("s6:Siarannya"), s7 = K.s7, ban = A("s7:Beberapa"), s8 = K.s8, END = K.end;

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0x6a4cff, 0x2a0830, 0.55));
  const rim = new THREE.DirectionalLight(0xff3d9a, 2.2); rim.position.set(0, 30, -60); scene.add(rim);
  const fillL = new THREE.DirectionalLight(0x37e8ff, 1.0); fillL.position.set(-40, 15, 30); scene.add(fillL);
  const key = new THREE.DirectionalLight(0xfff0f6, 0.9); key.position.set(25, 30, 40); scene.add(key);

  // ---------- sky dome ----------
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uE: { value: 1 } },
    vertexShader: "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float uE;varying vec3 vP;void main(){float y=vP.y;vec3 top=vec3(.012,.008,.04);vec3 mid=vec3(.05,.012,.11);vec3 hor=vec3(.30,.03,.30);vec3 c=mix(mid,top,smoothstep(.05,.55,y));c=mix(hor,c,smoothstep(-.02,.16,y));if(y<0.)c=vec3(.03,.01,.06);gl_FragColor=vec4(c*uE,1.);}",
  }));
  scene.add(sky);
  // stars
  const STN = 700, star = pts(scene, STN, { color: 0xffffff, size: 1.6, opacity: 0.9 });
  const srnd = mulberry(17);
  const starB = [];
  for (let i = 0; i < STN; i++) {
    const th = srnd() * Math.PI * 2, ph = 0.08 + srnd() * 1.3, R = 520;
    star.pos[i * 3] = Math.cos(th) * Math.cos(ph) * R; star.pos[i * 3 + 1] = Math.sin(ph) * R; star.pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * R;
    starB.push([0.3 + srnd() * 0.7, srnd() * 6.28, srnd() < 0.15 ? 1 : 0]);
  }
  star.commit();
  star.m.fog = false;

  // ---------- sun ----------
  const sun = new THREE.Mesh(new THREE.CircleGeometry(34, 96), new THREE.ShaderMaterial({
    transparent: true, fog: false, toneMapped: false,
    uniforms: { uT: { value: 0 }, uE: { value: 1 } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform float uT,uE;varying vec2 vU;void main(){float y=vU.y;
      vec3 c=mix(vec3(1.,.0,.5),vec3(1.,.45,.55),smoothstep(.35,1.,y));
      float band=0.;if(y<.52){float k=fract(y*15.-uT*.18);float w=mix(.55,.08,y/.52);band=step(k,w);}
      if(band>.5)discard;gl_FragColor=vec4(c*.88*uE,1.);}`,
  }));
  sun.position.set(0, 30, -330); scene.add(sun);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshBasicMaterial({
    map: canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,40,150,.55)"); gr.addColorStop(0.35, "rgba(255,0,127,.18)"); gr.addColorStop(1, "rgba(255,0,127,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); }),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  }));
  halo.position.set(0, 30, -335); scene.add(halo);

  // ---------- grid floor ----------
  const gridMat = new THREE.ShaderMaterial({
    transparent: false, fog: false,
    uniforms: { uT: { value: 0 }, uE: { value: 1 }, uRing: { value: -10 }, uRingA: { value: 0 } },
    vertexShader: "varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: `uniform float uT,uE,uRing,uRingA;varying vec3 vW;
      float gl(vec2 p,float s){vec2 q=p/s;vec2 g=abs(fract(q-.5)-.5)/max(fwidth(q),vec2(1e-4));return 1.-min(min(g.x,g.y),1.);}
      void main(){vec2 p=vW.xz;p.y-=uT*4.;float l=gl(p,5.);
        float far=clamp((-vW.z+40.)/300.,0.,1.);
        vec3 base=mix(vec3(.025,.008,.05),vec3(.16,.02,.2),pow(far,1.6));
        vec3 lc=mix(vec3(1.,.05,.6),vec3(.0,.9,1.),pow(far,.9)*.6);
        float fade=1.-smoothstep(.55,1.,far)*.75;
        vec3 c=base+lc*l*fade*1.25*uE;
        float d=length(vW.xz);float ring=exp(-pow((d-uRing)/2.2,2.))*uRingA;
        c+=vec3(.2,.95,1.)*ring*(.35+l);
        gl_FragColor=vec4(c,1.);}`,
  });
  gridMat.extensions = { derivatives: true };
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(900, 520), gridMat);
  grid.rotation.x = -Math.PI / 2; grid.position.set(0, 0, -160); scene.add(grid);

  // ---------- wireframe ridges ----------
  function ridge({ x0, x1, z0, z1, nx, nz, h, col, peakCol, y0 = 0 }) {
    const P = [], C = [], idx = [], H = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = x0 + (x1 - x0) * i / nx, z = z0 + (z1 - z0) * j / nz, y = Math.max(0, h(x, z, j / nz)) + y0;
      P.push(x, y, z); H.push(y);
    }
    const hmax = Math.max(...H);
    const ca = new THREE.Color(col), cb = new THREE.Color(peakCol), tmp = new THREE.Color();
    for (let k = 0; k < H.length; k++) { tmp.copy(ca).lerp(cb, smooth((H[k] / hmax - 0.55) / 0.4)); C.push(tmp.r, tmp.g, tmp.b); }
    const W = nx + 1;
    for (let j = 0; j <= nz; j++) for (let i = 0; i < nx; i++) idx.push(j * W + i, j * W + i + 1);
    for (let j = 0; j < nz; j++) for (let i = 0; i <= nx; i++) idx.push(j * W + i, (j + 1) * W + i);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    lg.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
    lg.setIndex(idx);
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, toneMapped: false, fog: true }));
    const tri = [];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * W + i; tri.push(a, a + 1, a + W, a + 1, a + W + 1, a + W); }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); fg.setIndex(tri);
    const fill = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x0a0518, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2, fog: true }));
    scene.add(fill, lines);
    return { lines, fill };
  }
  // Himalaya: tall back range, lower towards the centre so the sun sits in a saddle
  const himal = ridge({
    x0: -420, x1: 420, z0: -190, z1: -250, nx: 110, nz: 9, col: "#1fd8ff", peakCol: "#f4f0ff",
    h: (x, z, v) => {
      const prof = 26 + 30 * Math.pow(Math.abs(Math.sin(x * 0.012 + 0.6)), 1.4) + 14 * vnoise(x * 0.05) + 6 * vnoise(x * 0.17 + 9);
      const saddle = 0.45 + 0.55 * smooth((Math.abs(x) - 18) / 90);
      return prof * saddle * Math.sin(Math.PI * (0.12 + v * 0.8));
    },
  });
  // foothills between the grid and the range
  const hills = ridge({
    x0: -220, x1: 220, z0: -46, z1: -70, nx: 70, nz: 6, col: "#ff1f8f", peakCol: "#ff9ed0",
    h: (x, z, v) => (4 + 8 * vnoise(x * 0.06 + 3) + 4 * vnoise(x * 0.2)) * Math.sin(Math.PI * (0.1 + v * 0.85)) * (0.35 + 0.65 * smooth((Math.abs(x) - 6) / 30)),
  });

  // ---------- dzong-like silhouette on a left hill + prayer flags ----------
  const DZ = new THREE.Group(); DZ.position.set(-21, 0, -40); scene.add(DZ);
  const edgeLine = (mesh, col, op = 1) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op, toneMapped: false })); e.position.copy(mesh.position); e.rotation.copy(mesh.rotation); e.scale.copy(mesh.scale); mesh.parent.add(e); return e; };
  const wallM = new THREE.MeshStandardMaterial({ color: 0x2a2440, roughness: 0.8, envMapIntensity: ENV });
  const bandM = new THREE.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.8, envMapIntensity: ENV, emissive: 0x2a0008 });
  const roofM = new THREE.MeshStandardMaterial({ color: 0x1a1428, roughness: 0.6, metalness: 0.3, envMapIntensity: ENV });
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(9, 14, 3, 7), wallM.clone()); mound.material.color.set(0x120a22); mound.position.y = 1.5; DZ.add(mound); edgeLine(mound, MAG, 0.7);
  const taper = (w, h, d, y, m) => { const g = new THREE.CylinderGeometry(0.62, 0.72, h, 4, 1); g.rotateY(Math.PI / 4); const mm = new THREE.Mesh(g, m); mm.scale.set(w, 1, d); mm.position.y = y; DZ.add(mm); return mm; };
  const wall = taper(14, 5, 9, 5.5, wallM); edgeLine(wall, CYAN, 0.85);
  const band = taper(12.4, 1.1, 8, 8.55, bandM); edgeLine(band, AMB, 0.9);
  const roof1 = new THREE.Mesh(new THREE.ConeGeometry(9.2, 2.4, 4), roofM); roof1.rotation.y = Math.PI / 4; roof1.scale.set(1, 1, 0.66); roof1.position.y = 10.3; DZ.add(roof1); edgeLine(roof1, MAG, 0.9);
  const tower = taper(5, 4.2, 4, 12.4, wallM); edgeLine(tower, CYAN, 0.9);
  const tband = taper(4.5, 0.8, 3.6, 14.3, bandM); edgeLine(tband, AMB, 0.9);
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(4.3, 2.2, 4), roofM); roof2.rotation.y = Math.PI / 4; roof2.position.y = 15.8; DZ.add(roof2); edgeLine(roof2, MAG, 0.9);
  const winM = new THREE.MeshBasicMaterial({ color: 0xffb04a, toneMapped: false });
  for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), winM); w.position.set(-4.6 + i * 1.85, 5.2 + k * 1.8, 3.45 - k * 0.12); DZ.add(w); }
  // prayer flags: neon strings in the five traditional colours, catenary between poles
  const FLAGC = [0x2f7bff, 0xf4f4ff, 0xff2a3a, 0x2bff7a, 0xffd21f];
  const flagSets = [];
  function flagLine(a, b, n, sag) {
    const G = new THREE.Group(); scene.add(G);
    const pts3 = []; for (let i = 0; i <= 40; i++) { const u = i / 40; const p = new V3().lerpVectors(a, b, u); p.y -= Math.sin(Math.PI * u) * sag; pts3.push(p); }
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts3), new THREE.LineBasicMaterial({ color: 0xffe9ff, transparent: true, opacity: 0.6, toneMapped: false }));
    G.add(ln);
    const fl = [];
    for (let i = 1; i < n; i++) {
      const u = i / n, p = new V3().lerpVectors(a, b, u); p.y -= Math.sin(Math.PI * u) * sag;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), new THREE.MeshBasicMaterial({ color: FLAGC[i % 5], side: THREE.DoubleSide, toneMapped: false, transparent: true, opacity: 0.85 }));
      m.position.copy(p); m.position.y -= 0.6; m.lookAt(p.x, p.y - 0.6, p.z + 10); G.add(m); fl.push([m, i]);
    }
    for (const q of [a, b]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, q.y, 6), new THREE.MeshBasicMaterial({ color: 0xffd9f0, toneMapped: false })); pole.position.set(q.x, q.y / 2, q.z); G.add(pole); }
    flagSets.push(fl);
    return G;
  }
  flagLine(new V3(-37, 13, -36), new V3(-15, 7, -24), 18, 2.2);
  // (short lower string removed: its pole crossed the TV framing)
  flagLine(new V3(18, 9, -30), new V3(42, 13, -40), 18, 2.0);

  // ---------- the CRT television ----------
  const TV = new THREE.Group(); scene.add(TV);
  const TVY = 7.6, TW = 8.6, TH = 6.8, TD = 5.0;
  const rr = (w, h, rad) => { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2; s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad); s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h); s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad); s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y); return s; };
  const bodyM = new THREE.MeshPhysicalMaterial({ color: 0x1a1230, roughness: 0.45, metalness: 0.1, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: ENV });
  const chrome = new THREE.MeshStandardMaterial({ color: 0x6c7288, roughness: 0.4, metalness: 1, envMapIntensity: ENV });
  const bodyG = new THREE.ExtrudeGeometry(rr(TW - 0.6, TH - 0.6, 0.7), { depth: TD - 0.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 5, curveSegments: 10 });
  bodyG.center();
  const body = new THREE.Mesh(bodyG, bodyM); TV.add(body);
  // back taper (tube housing)
  const backG = new THREE.CylinderGeometry(2.4, 3.6, 3.2, 4, 1); backG.rotateY(Math.PI / 4); backG.rotateX(Math.PI / 2);
  const backM = new THREE.Mesh(backG, bodyM); backM.scale.set(1.3, 1.0, 1); backM.position.set(0, 0.1, -TD / 2 - 1.4); TV.add(backM);
  const FZ = TD / 2 + 0.02;
  const SX = -0.85, SY = 0.35, SWd = 6.0, SHt = 4.5;
  // screen recess + chrome trim
  const rec = new THREE.Mesh(new THREE.ShapeGeometry(rr(SWd + 0.5, SHt + 0.5, 0.55)), new THREE.MeshStandardMaterial({ color: 0x07050c, roughness: 0.6 }));
  rec.position.set(SX, SY, FZ + 0.005); TV.add(rec);
  const trimS = rr(SWd + 0.9, SHt + 0.9, 0.75); trimS.holes.push(rr(SWd + 0.45, SHt + 0.45, 0.55));
  const trim = new THREE.Mesh(new THREE.ExtrudeGeometry(trimS, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }), chrome);
  trim.position.set(SX, SY, FZ - 0.02); TV.add(trim);
  // curved screen
  const scrG = new THREE.PlaneGeometry(SWd, SHt, 48, 36);
  { const p = scrG.attributes.position; for (let i = 0; i < p.count; i++) { const nx = p.getX(i) / (SWd / 2), ny = p.getY(i) / (SHt / 2); p.setZ(i, 0.38 * (1 - 0.5 * (nx * nx + ny * ny))); } scrG.computeVertexNormals(); }
  const SC = document.createElement("canvas"); SC.width = 1024; SC.height = 768;
  const sg = SC.getContext("2d");
  const scrTex = new THREE.CanvasTexture(SC); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 8;
  const scrMat = new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false, color: new THREE.Color(0.7, 0.7, 0.7) });
  const scr = new THREE.Mesh(scrG, scrMat); scr.position.set(SX, SY, FZ + 0.02); TV.add(scr);
  const glass = new THREE.Mesh(scrG, new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.12, metalness: 0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 0.1 }));
  glass.position.set(SX, SY, FZ + 0.05); glass.scale.set(1.0, 1.0, 1.04);
  // control column: channel LED, knobs, speaker grille
  const CX = TW / 2 - 1.05;
  const ledC = document.createElement("canvas"); ledC.width = 256; ledC.height = 128;
  const ledTex = new THREE.CanvasTexture(ledC); ledTex.colorSpace = THREE.SRGBColorSpace;
  const led = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false })); led.position.set(CX, 2.35, FZ + 0.01); TV.add(led);
  let ledTxt = "";
  const setLed = (s) => { if (s === ledTxt) return; ledTxt = s; const g = ledC.getContext("2d"); g.fillStyle = "#12020a"; g.fillRect(0, 0, 256, 128); g.font = `400 84px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "#ff2a55"; g.shadowBlur = 16; g.fillStyle = "#ff4a6a"; g.fillText(s, 128, 68); ledTex.needsUpdate = true; };
  const knobs = [];
  for (const [y, s] of [[1.15, 0.5], [-0.25, 0.42]]) {
    const kn = new THREE.Mesh(new THREE.CylinderGeometry(s, s * 1.08, 0.45, 32), chrome); kn.rotation.x = Math.PI / 2; kn.position.set(CX, y, FZ + 0.22); TV.add(kn);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.08, s * 0.8, 0.06), new THREE.MeshBasicMaterial({ color: MAG, toneMapped: false })); tick.position.set(0, 0.24, -s * 0.4); tick.rotation.x = -Math.PI / 2; kn.add(tick);
    knobs.push(kn);
  }
  for (let i = 0; i < 7; i++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.09, 0.05), new THREE.MeshStandardMaterial({ color: 0x05030a, roughness: 0.9 })); sl.position.set(CX, -1.25 - i * 0.26, FZ + 0.01); TV.add(sl); }
  // AUDIRA badge under the screen (chrome lettering)
  const badgeTex = canvasTex(1024, 160, () => {});
  const paintBadge = () => { const c = badgeTex.image, g = c.getContext("2d"); g.clearRect(0, 0, 1024, 160); const gr = g.createLinearGradient(0, 20, 0, 140); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.45, "#b9c3d6"); gr.addColorStop(0.55, "#5a6378"); gr.addColorStop(1, "#e9eef8"); g.font = `400 112px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 6; g.strokeStyle = "#ff2a8a"; g.shadowColor = "#ff007f"; g.shadowBlur = 18; g.strokeText("AUDIRA", 512, 84); g.shadowBlur = 0; g.fillStyle = gr; g.fillText("AUDIRA", 512, 84); badgeTex.needsUpdate = true; };
  paintBadge();
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.41), new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, toneMapped: false })); badge.position.set(SX, -2.73, FZ + 0.02); TV.add(badge);
  // rabbit-ear antenna
  const antBase = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), chrome); antBase.position.set(0.4, TH / 2 - 0.05, -0.6); TV.add(antBase);
  const antTips = [];
  for (const s of [-1, 1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 5.2, 8), chrome); rod.geometry.translate(0, 2.6, 0);
    rod.position.copy(antBase.position); rod.rotation.z = s * 0.5; rod.rotation.x = -0.12; TV.add(rod);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false })); tip.position.set(0, 5.2, 0); rod.add(tip); antTips.push(tip);
  }
  // under-glow and contact darkening on the grid
  const blob = (col, alpha, sz) => new THREE.Mesh(new THREE.PlaneGeometry(sz, sz * 0.6), new THREE.MeshBasicMaterial({
    map: canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, col.replace("A", alpha)); gr.addColorStop(1, col.replace("A", 0)); g.fillStyle = gr; g.fillRect(0, 0, w, w); }),
    transparent: true, depthWrite: false, toneMapped: false,
  }));
  const shadow = blob("rgba(0,0,0,A)", 0.85, 14); shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.03, 0); scene.add(shadow);
  const glow = blob("rgba(255,0,127,A)", 0.5, 18); glow.material.blending = THREE.AdditiveBlending; glow.rotation.x = -Math.PI / 2; glow.position.set(0, 0.05, 0.5); scene.add(glow);

  // ---------- s3: transmitter towers + signal arcs ----------
  function pylon(x, z, col) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const H = 20, P = [];
    const lv = [0, 4, 8, 12, 16, 20].map((y) => [y, 2.6 * (1 - y / H) + 0.35]);
    for (let i = 0; i < lv.length; i++) {
      const [y, w] = lv[i]; const c = [[-w, -w], [w, -w], [w, w], [-w, w]];
      for (let k = 0; k < 4; k++) { const a = c[k], b = c[(k + 1) % 4]; P.push(a[0], y, a[1], b[0], y, b[1]); }
      if (i < lv.length - 1) { const [y2, w2] = lv[i + 1]; const c2 = [[-w2, -w2], [w2, -w2], [w2, w2], [-w2, w2]]; for (let k = 0; k < 4; k++) { P.push(c[k][0], y, c[k][1], c2[k][0], y2, c2[k][1]); P.push(c[k][0], y, c[k][1], c2[(k + 1) % 4][0], y2, c2[(k + 1) % 4][1]); } }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    G.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, toneMapped: false, transparent: true })));
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff2040, toneMapped: false })); beacon.position.y = H + 0.6; G.add(beacon);
    return { G, beacon, top: new V3(x, H + 0.6, z) };
  }
  const towerIN = pylon(-17, -80, AMB), towerBD = pylon(17, -80, CYAN);
  const arcMat = (col) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uT: { value: 0 }, uP: { value: 0 }, uA: { value: 0 }, uC: { value: new THREE.Color(col) } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float uT,uP,uA;uniform vec3 uC;varying vec2 vU;void main(){if(vU.x>uP)discard;float d=fract(vU.x*16.-uT*2.2);float a=smoothstep(.0,.15,d)*smoothstep(.75,.45,d);float head=smoothstep(uP-.06,uP,vU.x);gl_FragColor=vec4(uC*(.55+a*1.1+head*1.5),(.35+a*.65)*uA);}",
  });
  const antTop = new V3(0.4, TVY + TH / 2 + 4.6, -0.6);
  const mkArc = (from, side, col) => {
    const curve = new THREE.QuadraticBezierCurve3(from.clone(), new V3(side * 10, 34, -40), antTop);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.32, 8), arcMat(col)); scene.add(m); return m;
  };
  const arcIN = mkArc(towerIN.top, -1, AMB), arcBD = mkArc(towerBD.top, 1, CYAN);

  // 3D text sprites
  const labels = [];
  const label = (txt, col, px = 96) => {
    const paint = (g, w, h) => { g.clearRect(0, 0, w, h); g.font = `400 ${px}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgba(12,8,26,.78)"; const tw = g.measureText(txt).width + 70; g.fillRect((w - tw) / 2, h / 2 - px * 0.72, tw, px * 1.44); g.strokeStyle = col; g.lineWidth = 5; g.strokeRect((w - tw) / 2, h / 2 - px * 0.72, tw, px * 1.44); g.shadowColor = col; g.shadowBlur = 18; g.fillStyle = "#fff"; g.fillText(txt, w / 2, h / 2 + 4); };
    const tx = canvasTex(1024, 192, paint); labels.push([tx, paint]);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false, fog: false })); s.scale.set(16, 3, 1); scene.add(s); return s;
  };
  const labIN = label("INDIA", AMB), labBD = label("BANGLADESH", CYAN);
  labIN.position.set(-17, 24, -80); labBD.position.set(17, 24, -80); labIN.scale.set(13, 2.44, 1); labBD.scale.set(13, 2.44, 1);

  // ---------- 1989: dish + prohibition ring ----------
  const DISH = new THREE.Group(); DISH.position.set(-7.2, 0, -3); DISH.userData.s = 0.75; scene.add(DISH);
  const dishM = new THREE.MeshStandardMaterial({ color: 0x9aa0b4, roughness: 0.45, metalness: 0.5, side: THREE.DoubleSide, envMapIntensity: ENV });
  const prof = []; for (let i = 0; i <= 16; i++) { const x = (i / 16) * 2.1; prof.push(new THREE.Vector2(x, x * x * 0.17)); }
  const dish = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), dishM);
  const dishPiv = new THREE.Group(); dishPiv.position.y = 4.4; DISH.add(dishPiv);
  dish.rotation.x = Math.PI / 2 - 0.3; dishPiv.add(dish); dishPiv.rotation.y = 0.5;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), dishM); arm.position.set(0, 0.25, 0.9); arm.rotation.x = Math.PI / 2 - 0.3; dishPiv.add(arm);
  const lnb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.45), new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5 })); lnb.position.set(0, 0.5, 1.75); dishPiv.add(lnb);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.4, 10), dishM); pole.position.y = 2.2; DISH.add(pole);
  const dshadow = blob("rgba(0,0,0,A)", 0.8, 4); dshadow.rotation.x = -Math.PI / 2; dshadow.position.y = 0.04; DISH.add(dshadow);
  const noM = new THREE.MeshBasicMaterial({ color: 0xc8001f, toneMapped: false, transparent: true });
  const NO = new THREE.Group(); NO.position.set(0, 4.3, 0.6); DISH.add(NO);
  NO.add(new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.14, 10, 64), noM));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.26, 0.2), noM); bar.rotation.z = -Math.PI / 4; NO.add(bar);

  // ---------- s4: VHS tapes ----------
  const tapes = [];
  const tapeLab = canvasTex(512, 128, () => {});
  const paintTape = () => { const g = tapeLab.image.getContext("2d"); g.fillStyle = "#efe9dc"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#c8102e"; g.fillRect(0, 0, 512, 22); g.fillStyle = "#1a1a1a"; g.font = `400 54px ${MONO}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("VHS  E-180", 24, 76); tapeLab.needsUpdate = true; };
  paintTape();
  const tapeM = new THREE.MeshPhysicalMaterial({ color: 0x141218, roughness: 0.3, clearcoat: 0.6, envMapIntensity: ENV });
  for (let i = 0; i < 3; i++) {
    const G = new THREE.Group(); scene.add(G);
    G.add(new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.5, 2.1), tapeM));
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.42), new THREE.MeshBasicMaterial({ map: tapeLab, toneMapped: false, color: 0xbbbbbb })); lb.position.set(0, 0, 1.06); G.add(lb);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.52, 18), new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 0.4 })); w.position.set(s * 0.95, 0, -0.2); G.add(w); }
    tapes.push(G);
  }

  // ---------- s6: shock ring handled in grid shader; s7: tile wall ----------
  const TILE_N = 45, TC = 9;
  const tileTex = canvasTex(256, 192, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(0, y, w, 3); } g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); });
  const tileMat = new THREE.MeshBasicMaterial({ map: tileTex, toneMapped: false, transparent: true });
  const tiles = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.0, 1.5), tileMat, TILE_N);
  tiles.frustumCulled = false; scene.add(tiles);
  const TPAL = ["#ff007f", "#00f6ff", "#ff9e00", "#39ff14", "#8a5cff", "#ff4f4f", "#ffd21f", "#21a5ff"];
  const tileCol = [], trnd = mulberry(45);
  for (let i = 0; i < TILE_N; i++) tileCol.push(new THREE.Color(TPAL[Math.floor(trnd() * TPAL.length)]).multiplyScalar(0.55 + trnd() * 0.35));
  const order = [...Array(TILE_N).keys()].map((i) => [i, Math.abs((i % TC) - 4) + Math.abs(Math.floor(i / TC) - 2) + trnd() * 0.8]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  const tileAt = new Array(TILE_N); order.forEach((i, k) => { tileAt[i] = k; });
  const dummy = new THREE.Object3D();

  // ======================= screen painter =======================
  const W = 1024, Hs = 768;
  const NZ = [];
  for (let k = 0; k < 8; k++) { const c = document.createElement("canvas"); c.width = 256; c.height = 192; const g = c.getContext("2d"); const im = g.createImageData(256, 192); const q = mulberry(100 + k); for (let i = 0; i < im.data.length; i += 4) { const v = q() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); NZ.push(c); }
  // map canvas (static)
  const MAPC = document.createElement("canvas"); MAPC.width = W; MAPC.height = Hs;
  const LON0 = 90.4, LAT0 = 27.0, PX = 150;
  const prj = (lon, lat) => [W / 2 + (lon - LON0) * PX * Math.cos(LAT0 * Math.PI / 180) * 1.1, Hs / 2 - (lat - LAT0) * PX];
  const paintMap = () => {
    const g = MAPC.getContext("2d"); g.fillStyle = "#08051a"; g.fillRect(0, 0, W, Hs);
    g.strokeStyle = "rgba(0,246,255,.14)"; g.lineWidth = 1; for (let x = 0; x < W; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Hs); g.stroke(); } for (let y = 0; y < Hs; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (const c of GEO) {
      const bt = c.name === "Bhutan";
      for (const ring of c.rings) {
        g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = prj(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
        g.fillStyle = bt ? "rgba(255,0,127,.55)" : c.name === "China" ? "rgba(40,20,90,.55)" : c.name === "Bangladesh" ? "rgba(20,60,80,.6)" : "rgba(25,25,70,.55)";
        g.fill();
        g.shadowColor = bt ? MAG : CYAN; g.shadowBlur = bt ? 18 : 8; g.strokeStyle = bt ? "#ff8ac4" : "rgba(0,246,255,.85)"; g.lineWidth = bt ? 5 : 3; g.stroke(); g.shadowBlur = 0;
      }
    }
    const lab = (s, lon, lat, px, col) => { const [x, y] = prj(lon, lat); g.font = `400 ${px}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 8; g.strokeStyle = "rgba(8,5,26,.9)"; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); };
    lab("TIONGKOK", 91.2, 29.0, 54, "#bfc7ff");
    lab("INDIA", 88.6, 25.9, 54, "#9fefff");
    lab("BANGLADESH", 90.6, 25.15, 36, "#9fefff");
    lab("BHUTAN", 90.4, 27.45, 66, "#ffffff");
  };
  paintMap();

  const T = (s, x, y, px, col, o = {}) => {
    sg.save(); sg.font = `400 ${px}px ${o.f || HEAD}`; sg.textAlign = o.al || "center"; sg.textBaseline = "middle";
    if (o.glow) { sg.shadowColor = o.glow; sg.shadowBlur = o.blur || 22; }
    if (o.stroke) { sg.lineWidth = o.sw || 10; sg.strokeStyle = o.stroke; sg.strokeText(s, x, y); }
    sg.fillStyle = col; sg.fillText(s, x, y); sg.restore();
  };
  const R = (x, y, w, h, col) => { sg.fillStyle = col; sg.fillRect(x, y, w, h); };
  const noise = (t, a) => { sg.save(); sg.globalAlpha = a; sg.imageSmoothingEnabled = false; sg.drawImage(NZ[Math.floor(t * 24) % 8], 0, 0, W, Hs); sg.restore(); };
  const fadeIn = (t, a, d = 0.25) => clamp01((t - a) / d);
  const osd = (s, col = GRN) => T(s, 40, 52, 40, col, { f: MONO, al: "left", glow: col, blur: 10 });

  function seg7(ch, x, y, w, h, col, th) {
    const S = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcfgd", "-": "g" }[ch] || "";
    const seg = { a: [x + th, y, w - 2 * th, th], b: [x + w - th, y + th, th, h / 2 - th * 1.5], c: [x + w - th, y + h / 2 + th / 2, th, h / 2 - th * 1.5], d: [x + th, y + h - th, w - 2 * th, th], e: [x, y + h / 2 + th / 2, th, h / 2 - th * 1.5], f: [x, y + th, th, h / 2 - th * 1.5], g: [x + th, y + h / 2 - th / 2, w - 2 * th, th] };
    sg.save(); sg.shadowColor = col; sg.shadowBlur = 24;
    for (const k of "abcdefg") { sg.fillStyle = S.includes(k) ? col : "rgba(255,158,0,.07)"; const [a, b, c, d] = seg[k]; sg.fillRect(a, b, c, d); }
    sg.restore();
  }
  function tvIcon(x, y, s, col) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = col; sg.lineWidth = 9; sg.lineJoin = "round"; sg.shadowColor = col; sg.shadowBlur = 14; sg.strokeRect(-70, -48, 140, 100); sg.strokeRect(-56, -36, 92, 76); sg.beginPath(); sg.moveTo(-25, -52); sg.lineTo(-48, -90); sg.moveTo(15, -52); sg.lineTo(38, -90); sg.stroke(); sg.beginPath(); sg.arc(52, -16, 6, 0, 7); sg.arc(52, 14, 6, 0, 7); sg.stroke(); sg.restore(); }
  function dishIcon(x, y, s, col) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = col; sg.lineWidth = 9; sg.lineCap = "round"; sg.shadowColor = col; sg.shadowBlur = 14; sg.beginPath(); sg.ellipse(-6, -14, 62, 34, -0.6, 0, Math.PI, false); sg.closePath(); sg.stroke(); sg.beginPath(); sg.moveTo(-6, -14); sg.lineTo(36, -62); sg.moveTo(-10, 18); sg.lineTo(-10, 70); sg.moveTo(-40, 70); sg.lineTo(20, 70); sg.stroke(); sg.beginPath(); sg.arc(40, -66, 8, 0, 7); sg.stroke(); sg.restore(); }
  function stamp(txt, x, y, px, col, rot, k) {
    if (k <= 0) return;
    const sc = 1 + 1.4 * (1 - eout(k));
    sg.save(); sg.translate(x, y); sg.rotate(rot); sg.scale(sc, sc); sg.globalAlpha = Math.min(1, k * 2.5);
    sg.font = `400 ${px}px ${HEAD}`; sg.textAlign = "center"; sg.textBaseline = "middle";
    const tw = sg.measureText(txt).width + 60, th = px * 1.35;
    sg.lineWidth = 12; sg.strokeStyle = col; sg.shadowColor = col; sg.shadowBlur = 20; sg.strokeRect(-tw / 2, -th / 2, tw, th);
    sg.lineWidth = 4; sg.strokeRect(-tw / 2 + 14, -th / 2 + 14, tw - 28, th - 28);
    sg.fillStyle = col; sg.fillText(txt, 0, 6); sg.restore();
  }
  function crossX(x, y, w, h, k) {
    if (k <= 0) return;
    sg.save(); sg.strokeStyle = "#ff1030"; sg.lineWidth = 16; sg.lineCap = "round"; sg.shadowColor = "#ff1030"; sg.shadowBlur = 20;
    const a = clamp01(k * 2), b = clamp01(k * 2 - 1);
    sg.beginPath(); sg.moveTo(x, y); sg.lineTo(x + w * a, y + h * a); if (b > 0) { sg.moveTo(x + w, y); sg.lineTo(x + w - w * b, y + h * b); } sg.stroke(); sg.restore();
  }
  function colorBars() { const C = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"]; C.forEach((c, i) => R(i * W / 7, 0, W / 7 + 1, Hs * 0.7, c)); const C2 = ["#0000c0", "#111", "#c000c0", "#111", "#00c0c0", "#111", "#c0c0c0"]; C2.forEach((c, i) => R(i * W / 7, Hs * 0.7, W / 7 + 1, Hs * 0.08, c)); R(0, Hs * 0.78, W, Hs * 0.22, "#101018"); }

  // modes
  const BOUND = [s2, s3, b89, s4, s5, s5b, s6, clk, s7, ban, s8];
  function content(t) {
    if (t < s2) { // snow, no broadcast
      noise(t, 1); R(0, 0, W, Hs, "rgba(10,6,26,.35)");
      const k = fadeIn(t, 0.4);
      sg.globalAlpha = k; R(150, 300, 724, 170, "rgba(8,5,20,.88)"); sg.strokeStyle = CYAN; sg.lineWidth = 4; sg.strokeRect(150, 300, 724, 170);
      T("TIDAK ADA SIARAN", W / 2, 362, 62, "#fff", { f: HEAD, glow: MAG });
      T("SIARAN TV NASIONAL: —", W / 2, 432, 34, CYAN, { f: MONO });
      sg.globalAlpha = 1;
      osd("AUDIRA CH-1");
      if (t > A("s1:dilarang") - 0.05) stamp("DILARANG", W / 2, 600, 70, "#ff1030", -0.06, fadeIn(t, A("s1:dilarang") - 0.05, 0.22));
      return;
    }
    if (t < s3) { // map
      sg.drawImage(MAPC, 0, 0);
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      const [bx, by] = prj(90.4, 27.4);
      sg.save(); sg.strokeStyle = `rgba(255,0,127,${0.4 + 0.5 * pulse})`; sg.lineWidth = 4; sg.beginPath(); sg.arc(bx, by, 150 + 30 * ((t * 0.8) % 1), 0, 7); sg.stroke(); sg.restore();
      return;
    }
    if (t < b89) { // spillover: rolling ghost of a neighbour's test card in the snow
      const roll = (t * 140) % Hs;
      sg.save(); sg.globalAlpha = 0.5; sg.translate(0, roll); colorBars(); sg.translate(0, -Hs); colorBars(); sg.restore();
      sg.save(); sg.filter = "none"; R(0, 0, W, Hs, "rgba(20,10,40,.35)"); sg.restore();
      noise(t, 0.55);
      osd("SINYAL TETANGGA · 1980-AN", AMB);
      const a1 = fadeIn(t, A("s3:India")), a2 = fadeIn(t, A("s3:Bangladesh"));
      if (a1 > 0) { sg.globalAlpha = a1; R(60, 470, 420, 150, "rgba(8,5,20,.85)"); sg.strokeStyle = AMB; sg.lineWidth = 4; sg.strokeRect(60, 470, 420, 150); T("DD", 270, 520, 62, AMB, { glow: AMB }); T("INDIA", 270, 584, 38, "#fff", { f: MONO }); }
      if (a2 > 0) { sg.globalAlpha = a2; R(544, 470, 420, 150, "rgba(8,5,20,.85)"); sg.strokeStyle = CYAN; sg.lineWidth = 4; sg.strokeRect(544, 470, 420, 150); T("BTV", 754, 520, 62, CYAN, { glow: CYAN }); T("BANGLADESH", 754, 584, 38, "#fff", { f: MONO }); }
      sg.globalAlpha = 1;
      // signal bars
      for (let i = 0; i < 5; i++) { const on = (Math.sin(t * 9 + i) > -0.2 && i < 3) || i < 1; R(870 + i * 22, 90 - i * 12, 14, 20 + i * 12, on ? GRN : "rgba(57,255,20,.18)"); }
      return;
    }
    if (t < s4) { // 1989 ban
      R(0, 0, W, Hs, "#1c0208"); noise(t, 0.1);
      const y89 = fadeIn(t, A("s3:1989") - 0.05);
      if (y89 > 0) { sg.globalAlpha = y89; T("1989", W / 2, 150, 150, AMB, { glow: AMB, blur: 30 }); sg.globalAlpha = 1; }
      const ka = back(fadeIn(t, A("s3:pesawat"), 0.35)), kb = back(fadeIn(t, A("s3:parabola"), 0.35));
      if (ka > 0) tvIcon(300, 420, 1.35 * ka, "#ffffff");
      if (kb > 0) dishIcon(720, 410, 1.35 * kb, "#ffffff");
      const ks = fadeIn(t, A("s3:dilarang") - 0.06, 0.2);
      if (ks > 0) { R(0, 0, W, Hs, `rgba(120,0,20,${0.25 * ks})`); stamp("DILARANG", W / 2, 420, 120, "#ff1030", -0.12, ks); }
      const kw = fadeIn(t, A("s3:warisan"));
      if (kw > 0) { sg.globalAlpha = kw; T("DEMI WARISAN BUDAYA", W / 2, 660, 50, "#fff", { glow: MAG }); sg.globalAlpha = 1; }
      osd("PENGUMUMAN", "#ff4a6a");
      return;
    }
    if (t < s5) { // dim black-and-white, bootleg VHS
      const fl = 0.82 + 0.1 * Math.sin(t * 37) + 0.06 * vnoise(t * 20);
      const gr = sg.createLinearGradient(0, 0, 0, Hs); gr.addColorStop(0, "#3a3a3a"); gr.addColorStop(1, "#151515"); sg.fillStyle = gr; sg.fillRect(0, 0, W, Hs);
      // stage spotlight and two dancing silhouettes (a generic film musical number)
      const sp = sg.createRadialGradient(W / 2, 520, 20, W / 2, 520, 420); sp.addColorStop(0, "rgba(235,235,235,.75)"); sp.addColorStop(1, "rgba(235,235,235,0)"); sg.fillStyle = sp; sg.fillRect(0, 0, W, Hs);
      R(0, 640, W, 128, "#222");
      const fig = (x, ph, s) => { sg.save(); sg.translate(x, 640); sg.rotate(Math.sin(t * 3 + ph) * 0.12); sg.fillStyle = "#0b0b0b"; sg.beginPath(); sg.arc(0, -230 * s, 26 * s, 0, 7); sg.fill(); sg.beginPath(); sg.moveTo(-34 * s, -200 * s); sg.lineTo(34 * s, -200 * s); sg.lineTo(58 * s, 0); sg.lineTo(-58 * s, 0); sg.closePath(); sg.fill(); sg.lineWidth = 14 * s; sg.strokeStyle = "#0b0b0b"; sg.lineCap = "round"; const a = Math.sin(t * 3 + ph); sg.beginPath(); sg.moveTo(-26 * s, -190 * s); sg.lineTo(-90 * s, (-260 + a * 50) * s); sg.moveTo(26 * s, -190 * s); sg.lineTo(90 * s, (-250 - a * 50) * s); sg.stroke(); sg.restore(); };
      fig(W / 2 - 120 + Math.sin(t * 1.5) * 20, 0, 1.0); fig(W / 2 + 120 - Math.sin(t * 1.5) * 20, 1.6, 0.92);
      // scratches + grain
      sg.save(); sg.globalAlpha = 0.35; noise(t, 0.22); sg.restore();
      for (let i = 0; i < 3; i++) { const x = (hash(Math.floor(t * 8) + i * 7) * W); R(x, 0, 2, Hs, "rgba(255,255,255,.25)"); }
      // VHS tracking band
      const by = ((t * 90) % (Hs + 200)) - 100; sg.save(); sg.globalAlpha = 0.5; sg.drawImage(NZ[(Math.floor(t * 24) + 3) % 8], 0, 0, 256, 20, 0, by, W, 46); sg.restore();
      R(0, 0, W, Hs, `rgba(0,0,0,${1 - fl})`);
      const kf = fadeIn(t, A("s4:film"));
      if (kf > 0) { sg.globalAlpha = kf; T("PLAY ▶", 40, 52, 44, "#fff", { f: MONO, al: "left" }); const s = Math.floor((t - A("s4:film")) * 1) + 727; T(`0:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`, 984, 52, 44, "#fff", { f: MONO, al: "right" }); sg.globalAlpha = 1; }
      const kb2 = fadeIn(t, A("s4:bajakan") - 0.05);
      if (kb2 > 0) { sg.globalAlpha = kb2; R(212, 668, 600, 72, "rgba(0,0,0,.7)"); T("SALINAN BAJAKAN", W / 2, 706, 48, "#fff", { f: MONO }); sg.globalAlpha = 1; }
      const kh = fadeIn(t, A("s4:hitam") - 0.1);
      if (kh > 0 && kf <= 0) { sg.globalAlpha = kh; T("HITAM PUTIH", 40, 52, 44, "#ddd", { f: MONO, al: "left" }); sg.globalAlpha = 1; }
      return;
    }
    if (t < s5b) { // 1998 World Cup final, pilot broadcast
      R(0, 0, W, Hs, "#06140a");
      // perspective pitch
      sg.save();
      const top = 210, bot = 760, wl = 300, wr = 1000;
      for (let i = 0; i < 10; i++) { const y0 = top + (bot - top) * Math.pow(i / 10, 1.25), y1 = top + (bot - top) * Math.pow((i + 1) / 10, 1.25); const k0 = (y0 - top) / (bot - top), k1 = (y1 - top) / (bot - top); const w0 = wl + (wr - wl) * k0, w1 = wl + (wr - wl) * k1; sg.fillStyle = i % 2 ? "#1f7a34" : "#1a6a2d"; sg.beginPath(); sg.moveTo(W / 2 - w0, y0); sg.lineTo(W / 2 + w0, y0); sg.lineTo(W / 2 + w1, y1); sg.lineTo(W / 2 - w1, y1); sg.fill(); }
      sg.strokeStyle = "rgba(255,255,255,.85)"; sg.lineWidth = 4;
      sg.beginPath(); sg.moveTo(W / 2 - wl, top); sg.lineTo(W / 2 + wl, top); sg.lineTo(W / 2 + wr, bot); sg.lineTo(W / 2 - wr, bot); sg.closePath(); sg.stroke();
      sg.beginPath(); sg.moveTo(W / 2, top); sg.lineTo(W / 2, bot); sg.stroke();
      sg.beginPath(); sg.ellipse(W / 2, 430, 140, 55, 0, 0, 7); sg.stroke();
      const pl = mulberry(98);
      for (let i = 0; i < 16; i++) { const bx = pl(), byy = pl(), ph = pl() * 6; const u = bx + 0.06 * Math.sin(t * 1.3 + ph), v = 0.15 + byy * 0.8 + 0.04 * Math.cos(t * 1.1 + ph); const y = top + (bot - top) * v, hw = wl + (wr - wl) * v; const x = W / 2 + (u * 2 - 1) * hw * 0.85; const s = 6 + 10 * v; sg.fillStyle = i < 8 ? "#2a6bff" : "#fff6cc"; sg.beginPath(); sg.arc(x, y - s, s, 0, 7); sg.fill(); }
      const bu = 0.5 + 0.25 * Math.sin(t * 0.9), bv = 0.45 + 0.2 * Math.sin(t * 1.7); const by2 = top + (bot - top) * bv; sg.fillStyle = "#fff"; sg.beginPath(); sg.arc(W / 2 + (bu * 2 - 1) * (wl + (wr - wl) * bv) * 0.8, by2, 7, 0, 7); sg.fill();
      sg.restore();
      // floodlight haze + light noise
      const hz = sg.createLinearGradient(0, 0, 0, 260); hz.addColorStop(0, "rgba(255,255,230,.18)"); hz.addColorStop(1, "rgba(255,255,230,0)"); sg.fillStyle = hz; sg.fillRect(0, 0, W, 260);
      noise(t, 0.12);
      R(30, 30, 640, 120, "rgba(8,5,20,.88)"); R(30, 30, 12, 120, AMB);
      T("FINAL PIALA DUNIA", 64, 70, 40, "#fff", { al: "left" }); T("1998", 64, 120, 40, AMB, { al: "left", f: HEAD });
      const ku = fadeIn(t, A("s5:uji") - 0.1);
      if (ku > 0) { sg.globalAlpha = ku; R(694, 30, 300, 120, "#d0102e"); T("UJI COBA", 844, 72, 40, "#fff"); T("THIMPHU", 844, 120, 34, "#fff", { f: MONO }); sg.globalAlpha = 1; }
      return;
    }
    if (t < s6) { // BBS allowed (still pre-launch, monochrome cyan)
      R(0, 0, W, Hs, "#04101a"); noise(t, 0.08);
      T("BBS", W / 2, 300, 230, CYAN, { glow: CYAN, blur: 34 });
      T("LEMBAGA PENYIARAN", W / 2, 470, 44, "#cfefff", { f: MONO });
      const kd = fadeIn(t, A("s5:diizinkan") - 0.05);
      if (kd > 0) { sg.globalAlpha = kd; R(210, 540, 604, 110, "rgba(57,255,20,.12)"); sg.strokeStyle = GRN; sg.lineWidth = 5; sg.strokeRect(210, 540, 604, 110); T("✓ DIIZINKAN", W / 2, 597, 60, GRN, { glow: GRN }); sg.globalAlpha = 1; }
      return;
    }
    if (t < clk) { // payoff: colour bars, then BBS on air
      const on = A("s6:BBS") - 0.15;
      if (t < on) {
        colorBars();
        T("2 JUNI 1999", W / 2, Hs * 0.89, 70, "#fff", { glow: MAG });
        osd("AUDIRA CH-1");
        return;
      }
      const gr = sg.createLinearGradient(0, 0, W, Hs); gr.addColorStop(0, "#2a0050"); gr.addColorStop(0.5, "#5a0060"); gr.addColorStop(1, "#06305a"); sg.fillStyle = gr; sg.fillRect(0, 0, W, Hs);
      sg.save(); sg.globalAlpha = 0.35; for (let i = 0; i < 14; i++) { sg.strokeStyle = i % 2 ? MAG : CYAN; sg.lineWidth = 3; sg.beginPath(); sg.arc(W / 2, 330, 120 + i * 40 + ((t - on) * 60) % 40, 0, 7); sg.stroke(); } sg.restore();
      const lg = sg.createLinearGradient(0, 200, 0, 420); lg.addColorStop(0, "#ffd36e"); lg.addColorStop(0.5, "#ff3d9a"); lg.addColorStop(1, "#00f6ff");
      const kk = back(fadeIn(t, on, 0.4));
      sg.save(); sg.translate(W / 2, 320); sg.scale(kk, kk); sg.font = `400 240px ${HEAD}`; sg.textAlign = "center"; sg.textBaseline = "middle"; sg.shadowColor = MAG; sg.shadowBlur = 30; sg.fillStyle = lg; sg.fillText("BBS", 0, 0); sg.restore();
      T("TELEVISION", W / 2, 470, 58, "#fff", { glow: CYAN });
      R(64, 36, 190, 64, "#e0102e"); T("ON AIR", 159, 70, 38, "#fff", { f: MONO });
      const kt = fadeIn(t, A("s6:Thimphu") - 0.05);
      if (kt > 0) { sg.globalAlpha = kt; T("THIMPHU · 2 JUNI 1999", W / 2, 560, 44, "#fff", { f: MONO }); sg.globalAlpha = 1; }
      const kr = fadeIn(t, A("s6:dua") - 0.05);
      if (kr > 0) { sg.globalAlpha = kr; R(150, 612, 724, 92, "rgba(255,158,0,.18)"); sg.strokeStyle = AMB; sg.lineWidth = 4; sg.strokeRect(150, 612, 724, 92); T("25 TAHUN PENOBATAN RAJA", W / 2, 660, 44, AMB, { glow: AMB, blur: 12 }); sg.globalAlpha = 1; }
      T("AUDIRA CH-1", 984, 70, 34, GRN, { f: MONO, al: "right", glow: GRN, blur: 8 });
      return;
    }
    if (t < s7) { // no fixed hours: the 19.00 clock
      R(0, 0, W, Hs, "#06041a");
      sg.strokeStyle = "rgba(0,246,255,.12)"; sg.lineWidth = 2; for (let x = 0; x < W; x += 48) { sg.beginPath(); sg.moveTo(x, 0); sg.lineTo(x, Hs); sg.stroke(); }
      const k19 = t >= A("s6:tujuh") - 0.05;
      const blink = !k19 && Math.floor(t * 2.4) % 2 === 0;
      const digs = k19 ? "1900" : blink ? "----" : "    ";
      const dw = 150, dh = 270, th = 26, x0 = 112, y0 = 220;
      seg7(digs[0], x0, y0, dw, dh, AMB, th); seg7(digs[1], x0 + 190, y0, dw, dh, AMB, th);
      sg.save(); sg.shadowColor = AMB; sg.shadowBlur = 20; sg.fillStyle = k19 || blink ? AMB : "rgba(255,158,0,.1)"; sg.fillRect(x0 + 370, y0 + dh - th, th, th); sg.restore();
      seg7(digs[2], x0 + 440, y0, dw, dh, AMB, th); seg7(digs[3], x0 + 630, y0, dw, dh, AMB, th);
      T("JADWAL SIARAN", W / 2, 110, 46, CYAN, { f: MONO });
      const kj = fadeIn(t, A("s6:jam") - 0.05);
      if (kj > 0 && !k19) { sg.globalAlpha = kj; T("BELUM ADA JAM TETAP", W / 2, 620, 50, "#fff", { glow: MAG }); sg.globalAlpha = 1; }
      if (k19) { const kk = fadeIn(t, A("s6:tujuh") - 0.05); sg.globalAlpha = kk; T("BIASANYA MULAI 19.00", W / 2, 620, 50, "#fff", { glow: MAG }); sg.globalAlpha = 1; }
      T("AUDIRA CH-1", 40, 52, 34, GRN, { f: MONO, al: "left", glow: GRN, blur: 8 });
      return;
    }
    if (t < ban) { // cable tiles multiply
      R(0, 0, W, Hs, "#05030c");
      const lt = t - s7;
      const n = t < A("s7:puluhan") - 0.1 ? (lt < 0.9 ? 2 : lt < 1.6 ? 3 : 4) : t < A("s7:saluran") ? 5 : 7;
      const gx = 24, cw = (W - gx * 2) / n, ch = (Hs - 150) / n;
      const q = mulberry(7);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const c = TPAL[Math.floor(q() * TPAL.length)];
        const x = gx + i * cw, y = 130 + j * ch;
        sg.fillStyle = c; sg.globalAlpha = 0.25 + 0.15 * Math.sin(t * 4 + i + j * 2); sg.fillRect(x + 4, y + 4, cw - 8, ch - 8); sg.globalAlpha = 1;
        sg.strokeStyle = c; sg.lineWidth = 3; sg.strokeRect(x + 4, y + 4, cw - 8, ch - 8);
        if (n <= 5) T(String(j * n + i + 1).padStart(2, "0"), x + cw / 2, y + ch / 2, Math.min(80, ch * 0.45), "#fff", { f: MONO });
      }
      T("TV KABEL", 40, 64, 46, CYAN, { f: HEAD, al: "left", glow: CYAN, blur: 10 });
      const kc = fadeIn(t, A("s7:India") - 0.05);
      if (kc > 0) { sg.globalAlpha = kc; T("45+ SALURAN INDIA", 984, 64, 40, AMB, { f: MONO, al: "right" }); sg.globalAlpha = 1; }
      return;
    }
    if (t < s8) { // three banned channels crossed out
      R(0, 0, W, Hs, "#12030a"); noise(t, 0.06);
      T("SALURAN DILARANG", W / 2, 80, 54, "#ff4a6a", { glow: "#ff1030" });
      const rows = [["WWE", "s7:WWE", "#ff9e00"], ["FASHION TV", "s7:Fashion", "#ff007f"], ["MTV", "s7:MTV", "#00f6ff"]];
      rows.forEach(([nm, a, c], i) => {
        const y = 160 + i * 196, x = 150, w = 724, h = 168;
        const ka = clamp01((t - (A("s7:dilarang") + i * 0.25)) / 0.3);
        if (ka <= 0) return;
        sg.globalAlpha = ka; R(x, y, w, h, "rgba(10,6,24,.92)"); sg.strokeStyle = c; sg.lineWidth = 6; sg.shadowColor = c; sg.shadowBlur = 16; sg.strokeRect(x, y, w, h); sg.shadowBlur = 0;
        T(nm, W / 2, y + h / 2 + 4, 84, "#fff", { glow: c }); sg.globalAlpha = 1;
        crossX(x + 40, y + 20, w - 80, h - 40, clamp01((t - A(a)) / 0.35));
      });
      return;
    }
    // s8: colour BBS + the question
    const gr = sg.createLinearGradient(0, 0, W, Hs); gr.addColorStop(0, "#1a0040"); gr.addColorStop(1, "#04304a"); sg.fillStyle = gr; sg.fillRect(0, 0, W, Hs);
    const kq = fadeIn(t, A("s8:Menurut") - 0.1, 0.35);
    if (kq <= 0) {
      sg.drawImage(MAPC, 0, 0); R(0, 0, W, Hs, "rgba(8,5,26,.35)");
      const kt = fadeIn(t, A("s8:terakhir") - 0.1);
      if (kt > 0) { sg.globalAlpha = kt; R(120, 590, 784, 110, "rgba(8,5,26,.9)"); sg.strokeStyle = MAG; sg.lineWidth = 5; sg.strokeRect(120, 590, 784, 110); T("NEGARA TERAKHIR?", W / 2, 648, 64, "#fff", { glow: MAG }); sg.globalAlpha = 1; }
    } else {
      sg.globalAlpha = kq;
      R(0, 0, W / 2, Hs, "rgba(0,246,255,.16)"); R(W / 2, 0, W / 2, Hs, "rgba(255,0,127,.16)");
      T("MELINDUNGI", W / 4, 330, 52, "#fff", { glow: CYAN }); T("BUDAYA", W / 4, 400, 52, CYAN, { glow: CYAN });
      T("ATAU", W / 2, 520, 40, "#fff", { f: MONO });
      T("TERTINGGAL", W * 3 / 4, 330, 52, "#fff", { glow: MAG }); T("?", W * 3 / 4, 410, 80, MAG, { glow: MAG });
      sg.globalAlpha = 1;
    }
    osd("AUDIRA CH-1");
  }

  function paintScreen(t) {
    // CRT squeeze around each boundary: collapse to a line, then a dot; open again
    let p = 1, bnd = -1;
    for (const b of BOUND) {
      const off = b === s6 ? 0.55 : 0.2, dt = t - b;
      if (dt > -off && dt < 0.32) { bnd = b; p = dt < 0 ? clamp01(-dt / off) : clamp01(dt / 0.32); if (b === s6 && dt < 0) p = clamp01((-dt - 0.35) / 0.2); }
    }
    sg.setTransform(1, 0, 0, 1, 0, 0);
    R(0, 0, W, Hs, "#000");
    const v = Math.max(0.006, smooth((p - 0.28) / 0.72)), h = smooth(p / 0.28);
    if (p > 0.02) {
      sg.save(); sg.translate(W / 2, Hs / 2); sg.scale(Math.max(0.02, h), v); sg.translate(-W / 2, -Hs / 2);
      content(t);
      sg.restore();
      if (v < 0.25) { sg.save(); sg.shadowColor = "#fff"; sg.shadowBlur = 30; R(W / 2 - (W / 2) * h, Hs / 2 - 4, W * h, 8, "#f4f8ff"); sg.restore(); }
    } else if (bnd >= 0) {
      const g = sg.createRadialGradient(W / 2, Hs / 2, 0, W / 2, Hs / 2, 40); g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)"); sg.fillStyle = g; sg.fillRect(0, 0, W, Hs);
    }
    sg.setTransform(1, 0, 0, 1, 0, 0);
    // scanlines, phosphor vignette
    sg.fillStyle = "rgba(0,0,0,.22)"; for (let y = 0; y < Hs; y += 4) sg.fillRect(0, y, W, 2);
    const vg = sg.createRadialGradient(W / 2, Hs / 2, Hs * 0.35, W / 2, Hs / 2, W * 0.66); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)"); sg.fillStyle = vg; sg.fillRect(0, 0, W, Hs);
    scrTex.needsUpdate = true;
  }

  // ---------- camera ----------
  const c1 = s3, keys = [
    [0, 0.6, 7.2, 27, 0, 8.4, 0], [s2 - 0.2, -0.4, 7.8, 31, 0, 8.7, 0],
    [s2 + 2.6, 7, 10, 40, -7, 8.8, -12], [s3 - 0.001, 8.5, 10.5, 42, -8, 9, -13],
    [s3, 0, 15, 58, 0, 10, -30], [b89 - 0.001, 0, 14, 54, 0, 10, -30],
    [b89, -2, 8.8, 37, -1.0, 8.2, 0], [s4 - 0.001, -1.5, 8.6, 35, -0.9, 8.1, 0],
    [s4, -6, 6.4, 35, -1.9, 8.0, 0], [s5 - 0.001, -4.5, 7, 34, -1.7, 8.1, 0],
    [s5 + 2.4, 2, 8.4, 32, 0, 8.5, 0], [s5b, 3.5, 8.6, 33, 0, 8.6, 0], [s6 - 0.001, 2, 8.4, 30, 0, 8.4, 0],
    [s6, 0, 7.9, 24, -0.4, 8.4, 0], [A("s6:BBS") + 0.3, 0, 8, 26, -0.4, 8.6, 0], [clk, 0, 8.8, 34, 0, 8.8, 0], [s7 - 0.001, -1.5, 8.6, 33, 0, 8.7, 0],
    [s7, 0, 11, 47, 0, 8.6, -4], [ban - 0.4, 0, 10.5, 44, 0, 8.6, -4], [ban + 1.6, 0, 8.6, 32, -0.4, 8.5, 0], [s8 - 0.001, 0, 8.6, 31, -0.4, 8.5, 0],
    [s8, -3, 14, 52, -6, 9.5, -20], [END, -4, 17, 62, -6.5, 10, -22], [K.dur, -4, 17.5, 63, -6.5, 10, -22],
  ];
  const camT = track(keys);
  const tgt = new V3();

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`400 40px Audiowide`)) { labels.done = true; for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); paint(g, c.width, c.height); tx.needsUpdate = true; } paintBadge(); paintTape(); paintMap(); }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.15, c[1] + Math.sin(t * 0.29) * 0.1, c[2] + Math.cos(t * 0.31) * 0.15);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);

    // energy: dimmer during the ban era, burst on power-on
    const dim = ramp(t, s4 - 0.3, s4 + 0.6) * (1 - ramp(t, s6 - 0.2, s6 + 0.3));
    const burst = Math.exp(-Math.max(0, t - s6) / 1.6) * (t >= s6 ? 1 : 0);
    const E = 1 - 0.42 * dim + 0.35 * burst;
    gridMat.uniforms.uT.value = t; gridMat.uniforms.uE.value = E;
    const rt = t - s6; gridMat.uniforms.uRing.value = rt > 0 ? rt * 32 : -10; gridMat.uniforms.uRingA.value = rt > 0 ? Math.exp(-rt / 1.4) * 1.6 : 0;
    sun.material.uniforms.uT.value = t; sun.material.uniforms.uE.value = 0.75 + 0.25 * E;
    sky.material.uniforms.uE.value = 0.8 + 0.2 * E;
    halo.material.opacity = 0.7 + 0.3 * E;
    himal.lines.material.opacity = 0.55 + 0.4 * E; hills.lines.material.opacity = 0.6 + 0.35 * E;
    for (let i = 0; i < STN; i++) { const [b, ph, tw] = starB[i]; const v = b * (tw ? 0.55 + 0.45 * Math.sin(t * 3 + ph) : 1); star.col[i * 3] = v; star.col[i * 3 + 1] = v * 0.92; star.col[i * 3 + 2] = v; }
    star.commit();

    // TV float
    TV.position.set(0, TVY + Math.sin(t * 0.9) * 0.12, 0);
    TV.rotation.y = Math.sin(t * 0.23) * 0.05 + (t > s4 && t < s5 ? 0.12 * ramp(t, s4, s4 + 1.5) * (1 - ramp(t, s5 - 1, s5)) : 0);
    TV.rotation.x = -0.02;
    knobs[0].rotation.y = Math.floor(t > s7 ? (t - s7) * 3 : 0) * 0.5;
    setLed(t < s6 ? (t < s3 ? "--" : t < s5 ? "?" + (Math.floor(t * 3) % 10) : "TS") : t < s7 ? "01" : String(Math.min(45, 1 + Math.floor((t - s7) * 14))).padStart(2, "0"));
    for (const tp of antTips) tp.material.color.set(t > s3 && t < b89 ? (Math.floor(t * 6) % 2 ? AMB : CYAN) : CYAN);
    glow.material.opacity = 0.65 + 0.35 * E;
    paintScreen(t);
    scrMat.color.setScalar(t >= s4 && t < s5 ? 0.5 : 0.7);

    // prayer flags flutter
    for (const set of flagSets) for (const [m, i] of set) m.rotation.z = Math.sin(t * 2.2 + i * 0.7) * 0.12;

    // s3 towers + arcs
    const sp = t > s3 - 0.3 && t < b89 + 0.4;
    towerIN.G.visible = towerBD.G.visible = labIN.visible = labBD.visible = sp;
    arcIN.visible = arcBD.visible = sp;
    if (sp) {
      const fade = 1 - ramp(t, b89 - 0.2, b89 + 0.2);
      arcIN.material.uniforms.uT.value = arcBD.material.uniforms.uT.value = t;
      arcIN.material.uniforms.uP.value = eout((t - A("s3:India") + 0.2) / 1.6); arcIN.material.uniforms.uA.value = fade;
      arcBD.material.uniforms.uP.value = eout((t - A("s3:Bangladesh") + 0.2) / 1.6); arcBD.material.uniforms.uA.value = fade;
      labIN.material.opacity = fade * clamp01((t - A("s3:India") + 0.3) / 0.3); labBD.material.opacity = fade * clamp01((t - A("s3:Bangladesh") + 0.3) / 0.3);
      towerIN.beacon.visible = towerBD.beacon.visible = Math.floor(t * 2) % 2 === 0;
    }
    // 1989 dish
    const dOn = t > b89 - 0.1 && t < s4 + 0.05;
    DISH.visible = dOn;
    if (dOn) {
      const kd = back(clamp01((t - A("s3:parabola") + 0.3) / 0.45));
      DISH.scale.setScalar(Math.max(0.001, kd * 0.75));
      const kn = clamp01((t - A("s3:dilarang") + 0.05) / 0.2);
      NO.visible = kn > 0; NO.scale.setScalar(1 + 0.6 * (1 - eout(kn))); noM.opacity = kn * (0.85 + 0.15 * Math.sin(t * 12));
      NO.lookAt(cam.position);
    }
    // VHS tapes
    const vOn = t > A("s4:film") - 0.4 && t < s5 + 0.05;
    for (let i = 0; i < 3; i++) {
      const G = tapes[i]; G.visible = vOn; if (!vOn) continue;
      const k = back(clamp01((t - A("s4:film") + 0.3 - i * 0.18) / 0.5));
      G.scale.setScalar(Math.max(0.001, k));
      G.position.set(-7.4 + i * 0.25, 3.0 + i * 1.6 + Math.sin(t * 1.1 + i) * 0.15, 2.5 - i * 0.6);
      G.rotation.set(0.35 + i * 0.1, 0.5 + Math.sin(t * 0.5 + i) * 0.2, 0.15 - i * 0.12);
    }
    // tile wall
    const wOn = t > s7 - 0.05 && t < s8;
    tiles.visible = wOn;
    if (wOn) {
      const dimW = 1 - 0.75 * ramp(t, ban - 0.2, ban + 0.6);
      for (let i = 0; i < TILE_N; i++) {
        const k = back(clamp01((t - s7 - 0.35 - tileAt[i] * 0.065) / 0.35));
        const cx = (i % TC) - 4, cy = Math.floor(i / TC) - 2;
        dummy.position.set(cx * 2.25, 9.0 + cy * 1.75, -9 - Math.abs(cx) * 0.35);
        dummy.rotation.set(0, -cx * 0.05, 0);
        dummy.scale.setScalar(Math.max(0.001, k));
        dummy.updateMatrix(); tiles.setMatrixAt(i, dummy.matrix);
        const fl = 0.75 + 0.25 * Math.sin(t * 5 + i * 1.7);
        tiles.setColorAt(i, new THREE.Color().copy(tileCol[i]).multiplyScalar(fl * dimW));
      }
      tiles.instanceMatrix.needsUpdate = true; if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    }
    comp.render();
  };
}
