// EP10 REM ABS (LIDARFORGE): the world is a laser scan. Every surface is a cloud of returns coloured by height and by
// state: indigo night, cyan car body, amber wet road, green rolling wheels, coral locked wheels.
//   ROAD  z=0     a generic sedan on a scrolling wet road (the car stays at the origin, the road moves under it):
//                 ABS hook stop, hard brake that locks the wheels and lays skid returns, grip comparison, top-down
//                 "steer but slide straight", and the payoff stop that steers round a cone past an AUDIRA billboard
//   LAB   z=-80   the ABS system peeled into a diagram: wheel corner (disc, caliper, tone ring, wheel speed sensor),
//                 valve block, pump, ECU, brake pedal, and a scan-line graph (wheel vs car speed, pressure saw-tooth)
// Cuts between the two sets hide behind a laser sweep. Generic car, no badges or brand marks. Speed and wheel angle
// come from tables integrated once at load, so every value is still a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const C = { void: 0x05060f, cyan: "#38f0ff", indigo: "#3b4cff", amber: "#ffc24a", coral: "#ff5a4a", green: "#4ff0a0", white: "#eaf6ff", violet: "#8a6cff" };
const SANS = "'Arial Black', Arial, Helvetica, sans-serif";
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Neon-void grade + laser sweep wipe (a bright scan line with darkness on one side).
const Grade = { uniforms: { tDiffuse: { value: null }, wipe: { value: -1 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float wipe;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(0.92,0.98,1.08),(1.0-l)*0.5);c=(c-0.5)*1.05+0.5;
  if(wipe>-0.5){float d=vUv.y-wipe;c*=smoothstep(0.0,0.02,d)*0.0+step(0.0,d);c+=vec3(1.0,0.42,0.3)*exp(-abs(d)*160.0)*1.4+vec3(0.2,0.9,1.0)*exp(-abs(d)*40.0)*0.25;}
  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- point cloud material ----------
// mode 0 static, 1 skid returns (x shifts with travelled distance, attribute pa = distance it was laid at), 2 rain.
function ptsMat(size, o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uSize: { value: size }, uK: { value: 2788 }, uTint: { value: new THREE.Color(o.tint || "#ffffff") }, uAlpha: { value: 1 }, uScroll: { value: 0 }, uWrap: { value: o.wrap || 0 },
      uD: { value: 0 }, uTime: { value: 0 }, uMode: { value: o.mode || 0 }, uScan: { value: 99 } },
    vertexShader: `attribute vec3 pcol;attribute float pa;uniform float uSize,uK,uScroll,uWrap,uD,uTime,uScan;uniform int uMode;varying vec3 vC;varying float vA;
    void main(){vec3 p=position;vA=1.0;
      if(uWrap>0.0){p.x=mod(p.x-uScroll+uWrap*0.5,uWrap)-uWrap*0.5;vA=1.0-smoothstep(uWrap*0.32,uWrap*0.5,abs(p.x));}
      if(uMode==1){p.x=p.x-(uD-pa);vA=step(pa,uD)*(1.0-smoothstep(8.0,22.0,-p.x));}
      if(uMode==2){p.y=mod(p.y-uTime*pa,9.0)-0.5;p.x=p.x-0.25*mod(uTime*pa,9.0);}
      vA*=smoothstep(uScan,uScan-0.25,p.y);
      vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uSize*uK/max(0.1,-mv.z),1.0,28.0);vC=pcol;}`,
    fragmentShader: `uniform vec3 uTint;uniform float uAlpha;varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-0.5;float r=dot(d,d);if(r>0.25)discard;float f=1.0-r*4.0;
      gl_FragColor=vec4(vC*uTint*(0.3+0.7*f)*uAlpha*vA,1.0);}`,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
}
// cloud from arrays; returns the Points with its material
function cloud(P, size, parent, o = {}) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P.pos, 3));
  g.setAttribute("pcol", new THREE.Float32BufferAttribute(P.col, 3));
  g.setAttribute("pa", new THREE.Float32BufferAttribute(P.a.length ? P.a : new Array(P.pos.length / 3).fill(0), 1));
  const m = new THREE.Points(g, ptsMat(size, o)); m.frustumCulled = false; if (parent) parent.add(m); return m;
}
const bag = () => ({ pos: [], col: [], a: [] });
const tmpC = new THREE.Color();
function put(B, x, y, z, color, a) { B.pos.push(x, y, z); tmpC.set(color); B.col.push(tmpC.r, tmpC.g, tmpC.b); if (a !== undefined) B.a.push(a); }
const mix = (c1, c2, f) => "#" + new THREE.Color(c1).lerp(new THREE.Color(c2), clamp01(f)).getHexString();

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.void, fog: 0, exp: 1.0, bloom: [0.7, 0.55, 0.15], shadow: false });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
  const R = mulberry(1010);
  const LZ = -80;

  // ---------- speed tables (integrated once) ----------
  const tIn = A("s2:diinjak"), tLock = A("s2:terkunci");
  const vCar = (t) => {
    if (t < K.s2) return 16 - 8 * ramp(t, 0.3, K.s2 - 0.2);
    if (t < K.s4) return t < tIn ? 14 : 14 - 11 * ramp(t, tIn, K.s4);
    if (t < K.s8) return 0;
    return 12 - 10.5 * ramp(t, K.s8, A("s8:AUDIRA") + 0.5);
  };
  const absOn = (t) => t < K.s2 || t >= K.s8;
  const pulse = (t) => 0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 5);
  const slipOf = (t) => (absOn(t) ? 0.35 * pulse(t) * (t < K.s2 ? 1 - ramp(t, K.s2 - 1.5, K.s2) : 1 - ramp(t, A("s8:AUDIRA"), A("s8:AUDIRA") + 0.6)) : t >= tLock && t < K.s4 ? 1 : t >= tIn && t < K.s4 ? ramp(t, tIn, tLock) : 0);
  const DT = 1 / 120, NT = Math.ceil((K.dur + 1) / DT) + 2, Dtab = new Float32Array(NT), Wtab = new Float32Array(NT);
  for (let i = 1; i < NT; i++) { const t = (i - 0.5) * DT, v = vCar(t); Dtab[i] = Dtab[i - 1] + v * DT; Wtab[i] = Wtab[i - 1] + (v * (1 - slipOf(t)) / 0.36) * DT; }
  const look = (tab, t) => { const f = clamp01(t / DT / (NT - 1)) * (NT - 1), i = Math.min(NT - 2, Math.floor(f)); return tab[i] + (tab[i + 1] - tab[i]) * (f - i); };
  const D = (t) => look(Dtab, t), WA = (t) => look(Wtab, t);

  // ---------- ROAD set ----------
  const ROAD = new THREE.Group(); scene.add(ROAD);
  { // wet road grid, lane dashes and edges; scrolls with uScroll
    const B = bag(), WR = 80;
    for (let x = -WR / 2; x < WR / 2; x += 0.16) for (let z = -6; z <= 6; z += 0.16) {
      const jx = x + (R() - 0.5) * 0.1, jz = z + (R() - 0.5) * 0.1, edge = Math.abs(Math.abs(jz) - 3.6) < 0.08, dash = Math.abs(jz) < 0.07 && ((jx % 4) + 4) % 4 < 2;
      const off = Math.abs(jz) > 3.7;
      put(B, jx, off ? 0.02 + 0.06 * R() : 0, jz, edge || dash ? C.amber : off ? mix("#0b1430", "#1a2a55", R()) : mix("#3a2a10", "#5b4318", R() * 0.6 + (R() < 0.04 ? 0.8 : 0)));
    }
    ROAD.userData.road = cloud(B, 0.03, ROAD, { wrap: WR });
  }
  // car body: side profile polygon, both flanks + perimeter strips, coloured by height
  const CAR = new THREE.Group(); ROAD.add(CAR);
  const prof = [[-2.2, 0.3], [-2.25, 0.8], [-1.9, 0.95], [-1.0, 1.0], [-0.6, 1.5], [0.7, 1.5], [1.3, 1.0], [2.1, 0.9], [2.25, 0.6], [2.2, 0.3]];
  const inPoly = (x, y) => { let c = false; for (let i = 0, j = prof.length - 1; i < prof.length; j = i++) { const [xi, yi] = prof[i], [xj, yj] = prof[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const WH = [[1.4, 0.36, 0.86], [1.4, 0.36, -0.86], [-1.4, 0.36, 0.86], [-1.4, 0.36, -0.86]];
  const hcol = (y, glass) => (glass ? mix("#7fd8ff", C.white, (y - 1.0) / 0.5) : y < 0.9 ? mix(C.indigo, C.cyan, (y - 0.3) / 0.6) : mix(C.cyan, C.white, (y - 0.9) / 0.6));
  {
    const B = bag();
    for (let i = 0; i < 9000; i++) {
      const x = -2.3 + R() * 4.6, y = 0.25 + R() * 1.3;
      if (!inPoly(x, y) || WH.some(([wx, wy]) => Math.hypot(x - wx, y - wy) < 0.46)) continue;
      const glass = y > 1.02 && x > -0.95 && x < 1.2 && inPoly(x, y + 0.06);
      put(B, x, y, R() < 0.5 ? 0.9 : -0.9, hcol(y, glass));
    }
    for (let i = 0; i < prof.length - 1; i++) {
      const [x0, y0] = prof[i], [x1, y1] = prof[i + 1], L = Math.hypot(x1 - x0, y1 - y0), n = Math.round(L * 700);
      const glass = i >= 3 && i <= 5;
      for (let k = 0; k < n; k++) { const u = R(); const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; put(B, x, y, -0.9 + 1.8 * R(), hcol(y, glass && Math.abs(-0.9) > 0)); }
    }
    for (let k = 0; k < 500; k++) { const z = -0.9 + 1.8 * R(); put(B, 2.2, 0.62 + 0.04 * R(), z, Math.abs(z) > 0.55 ? C.white : C.cyan); put(B, -2.24, 0.75, z * 0.95, Math.abs(z) > 0.55 ? C.coral : C.indigo); }
    cloud(B, 0.026, CAR);
  }
  // wheels: tyre torus + 5 spokes, own material each so the tint can go green (rolling) or coral (locked)
  const wheelPts = (r0) => {
    const B = bag();
    for (let i = 0; i < 1400; i++) { const a = R() * 6.283, b = R() * 6.283, rr = r0 - 0.12 + 0.12 * Math.cos(b); put(B, rr * Math.cos(a), rr * Math.sin(a), 0.12 * Math.sin(b), "#ffffff"); }
    for (let s = 0; s < 5; s++) for (let k = 0; k < 60; k++) { const u = 0.05 + 0.18 * (k / 60), a = (s / 5) * 6.283; put(B, u * Math.cos(a), u * Math.sin(a), 0.08, "#ffffff"); }
    for (let i = 0; i < 160; i++) { const a = R() * 6.283; put(B, 0.05 * Math.cos(a), 0.05 * Math.sin(a), 0.1, "#ffffff"); }
    return B;
  };
  const wheels = WH.map(([x, y, z], i) => { const G = new THREE.Group(); G.position.set(x, y, z); CAR.add(G); const S = new THREE.Group(); G.add(S); const p = cloud(wheelPts(0.36), 0.028, S, { tint: C.green }); return { G, S, p, front: i < 2 }; });
  // ABS pulse rings at the front wheels
  const ringPts = (() => { const B = bag(); for (let i = 0; i < 300; i++) { const a = (i / 300) * 6.283; put(B, Math.cos(a), Math.sin(a), 0, C.amber); } return B; })();
  const rings = [0, 1].map((i) => { const m = cloud(ringPts, 0.04, ROAD); m.position.set(WH[i][0], WH[i][1], WH[i][2] + (i ? -0.2 : 0.2)); return m; });
  // skid returns behind the four wheels, laid between lock and the end of s3
  const d0 = D(tLock), d1 = D(K.s4);
  {
    const B = bag();
    for (const [wx, , wz] of WH) for (let i = 0; i < 700; i++) { const dd = d0 + (d1 - d0) * R(); put(B, wx, 0.012, wz + (R() - 0.5) * 0.22, mix(C.coral, "#7a1a10", R() * 0.5), dd); }
    ROAD.userData.skid = cloud(B, 0.03, ROAD, { mode: 1 });
  }
  // rain (s2, s3)
  { const B = bag(); for (let i = 0; i < 2500; i++) put(B, -10 + 20 * R(), 9 * R(), -5 + 10 * R(), mix("#5b7cff", C.white, R() * 0.5), 6 + 4 * R()); ROAD.userData.rain = cloud(B, 0.018, ROAD, { mode: 2 }); }
  // ghost rolling wheel beside the car (grip comparison) with grip arrows
  const ghostW = new THREE.Group(); ghostW.position.set(1.4, 0.36, 2.5); ROAD.add(ghostW);
  const ghostS = new THREE.Group(); ghostW.add(ghostS); const ghostP = cloud(wheelPts(0.36), 0.03, ghostS, { tint: C.green });
  const arrowPts = (len, color) => { const B = bag(); for (let i = 0; i < 400; i++) { const u = R(); put(B, -u * len, (R() - 0.5) * 0.05, (R() - 0.5) * 0.05, color); } for (let i = 0; i < 300; i++) { const u = R(), w = (1 - u) * 0.16; put(B, -len - 0.25 * u, (R() - 0.5) * 2 * w, 0, color); } return B; };
  const gripBig = cloud(arrowPts(1.3, C.green), 0.035, ROAD); gripBig.position.set(1.4 + 0.4, 0.02, 2.5);
  const gripSmall = cloud(arrowPts(0.45, C.coral), 0.035, ROAD); gripSmall.position.set(1.4 + 0.4, 0.02, 1.15);
  // intended curve (green, dashed) vs actual straight slide (coral), drawn on the road ahead
  const pathPts = (fn, color) => { const B = bag(); for (let i = 0; i < 900; i++) { const u = R(); if ((u * 30) % 1 > 0.6) continue; const [x, z] = fn(u); put(B, x, 0.03, z + (R() - 0.5) * 0.05, color); } return B; };
  const pathGo = cloud(pathPts((u) => [2.3 + 9 * u, -0.0 - 3.2 * u * u], C.green), 0.04, ROAD);
  const pathReal = cloud(pathPts((u) => [2.3 + 9 * u, 0], C.coral), 0.04, ROAD);
  // cone and AUDIRA billboard (s8)
  const coneG = new THREE.Group(); ROAD.add(coneG);
  { const B = bag(); for (let i = 0; i < 1600; i++) { const y = R() * 0.75, rr = 0.28 * (1 - y / 0.8), a = R() * 6.283; put(B, rr * Math.cos(a), y, rr * Math.sin(a), y > 0.3 && y < 0.45 ? C.white : C.coral); } cloud(B, 0.03, coneG); }
  const textPts = (str, h, color, dens = 3) => {
    const W = 1024, H = 256, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.font = `900 200px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(str, W / 2, H / 2 + 8);
    const d = g.getImageData(0, 0, W, H).data, B = bag(), s = h / H;
    for (let y = 0; y < H; y += dens) for (let x = 0; x < W; x += dens) if (d[(y * W + x) * 4 + 3] > 128) put(B, (x - W / 2) * s + (R() - 0.5) * s * dens, (H / 2 - y) * s, (R() - 0.5) * 0.04, typeof color === "function" ? color(y / H) : color);
    return B;
  };
  const board = new THREE.Group(); ROAD.add(board);
  cloud(textPts("AUDIRA", 1.6, (v) => mix(C.white, C.cyan, v)), 0.035, board).position.y = 2.6;
  { const B = bag(); for (let i = 0; i < 1500; i++) { const x = -3.4 + 6.8 * R(), y = 1.75 + 1.7 * R(); if (Math.abs(x) < 3.3 && y > 1.83 && y < 3.37) continue; put(B, x, y, 0, C.indigo); } for (const px of [-2.6, 2.6]) for (let i = 0; i < 300; i++) put(B, px + (R() - 0.5) * 0.1, 1.75 * R(), (R() - 0.5) * 0.1, C.indigo); cloud(B, 0.03, board); }
  board.position.z = -5.0;
  const X0cone = D(A("s8:AUDIRA") - 0.4) - D(K.s8), X0board = D(K.dur) - D(K.s8) + 1.5;

  // ---------- LAB set ----------
  const LAB = new THREE.Group(); LAB.position.z = LZ; scene.add(LAB);
  const WC = [-0.9, 0.9];
  const labStatic = bag();
  const sBox = (B, cx, cy, cz, w, h, d, n, col) => { for (let i = 0; i < n; i++) { const f = Math.floor(R() * 6), u = R() - 0.5, v = R() - 0.5; let x, y, z; if (f < 2) { x = (f ? 0.5 : -0.5) * w; y = u * h; z = v * d; } else if (f < 4) { y = (f === 3 ? 0.5 : -0.5) * h; x = u * w; z = v * d; } else { z = (f === 5 ? 0.5 : -0.5) * d; x = u * w; y = v * h; } put(B, cx + x, cy + y, cz + z, typeof col === "function" ? col(y / h + 0.5) : col); } };
  // wheel corner: brake disc with drilled holes, tone ring with teeth (rotating), caliper (static)
  const discG = new THREE.Group(); discG.position.set(WC[0], WC[1], 0); LAB.add(discG);
  { const B = bag(); for (let i = 0; i < 4200; i++) { const a = R() * 6.283, rr = 0.48 + 0.27 * Math.sqrt(R()); const hole = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].some((k) => Math.hypot(rr * Math.cos(a) - 0.62 * Math.cos(k * 0.5236), rr * Math.sin(a) - 0.62 * Math.sin(k * 0.5236)) < 0.035); if (hole) continue; put(B, rr * Math.cos(a), rr * Math.sin(a), (R() - 0.5) * 0.05, mix("#5b6c9a", C.white, rr - 0.4)); }
    for (let i = 0; i < 1600; i++) { const a = R() * 6.283, tooth = Math.cos(a * 40) > 0, rr = 0.36 + (tooth ? 0.06 : 0.0) * R() + 0.02 * R(); put(B, rr * Math.cos(a), rr * Math.sin(a), 0.07, tooth ? C.amber : "#8a6a2a"); }
    for (let i = 0; i < 500; i++) { const a = R() * 6.283, rr = 0.2 * Math.sqrt(R()); put(B, rr * Math.cos(a), rr * Math.sin(a), 0.05, C.indigo); }
    cloud(B, 0.024, discG); }
  sBox(labStatic, WC[0] + 0.5, WC[1] + 0.5, 0.06, 0.32, 0.36, 0.22, 1200, C.coral); // caliper
  sBox(labStatic, WC[0], WC[1] - 0.6, 0.07, 0.08, 0.22, 0.08, 300, C.green); // wheel speed sensor
  // valve block, pump, ECU, pedal + master cylinder
  sBox(labStatic, 0.9, 1.0, 0, 0.62, 0.46, 0.4, 2600, (v) => mix("#4a5a8a", "#a8b8e8", v));
  sBox(labStatic, 0.9, 0.35, 0, 0.36, 0.34, 0.36, 1300, (v) => mix("#2a3a7a", C.violet, v));
  sBox(labStatic, 0.9, 1.92, 0, 0.74, 0.36, 0.26, 2200, (v) => mix("#1d3a5a", C.cyan, v));
  for (let i = 0; i < 260; i++) put(labStatic, 0.6 + 0.6 * R(), 1.92 + (R() - 0.5) * 0.3, 0.135, R() < 0.5 ? C.green : "#1d6a5a"); // circuit dots
  sBox(labStatic, -0.15, 2.05, 0, 0.5, 0.14, 0.14, 700, (v) => mix("#4a5a8a", "#c8d8ff", v)); // master cylinder
  // lines: brake (master -> valve -> caliper), signal (sensor -> ECU), command (ECU -> valve), pump -> valve
  const poly3 = (pts) => new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0.0)), false, "catmullrom", 0.2);
  const brakeIn = poly3([[0.1, 2.05], [0.45, 2.05], [0.62, 1.6], [0.7, 1.24]]);
  const brakeOut = poly3([[0.59, 1.0], [0.2, 1.05], [-0.1, 1.3], [-0.3, 1.45]]);
  const sig = poly3([[WC[0], 0.18], [-0.2, 0.08], [0.35, 0.15], [0.45, 1.3], [0.52, 1.85]]);
  for (const [cv, n, col] of [[brakeIn, 500, "#6a7ab8"], [brakeOut, 500, "#6a7ab8"], [sig, 600, "#1d6a5a"]]) for (let i = 0; i < n; i++) { const p = cv.getPoint(R()); put(labStatic, p.x + (R() - 0.5) * 0.02, p.y + (R() - 0.5) * 0.02, (R() - 0.5) * 0.02, col); }
  cloud(labStatic, 0.022, LAB);
  // AUDIRA print on the ECU lid + 1978 behind
  const ecuTxt = cloud(textPts("AUDIRA ECU", 0.16, C.white, 2), 0.012, LAB); ecuTxt.position.set(0.9, 2.02, 0.14);
  const y78 = cloud(textPts("1978", 2.2, (v) => mix(C.cyan, C.violet, v), 3), 0.04, LAB); y78.position.set(0.0, 2.1, -2.2);
  // moving parts: inlet / outlet valve plungers, pump eccentric, pedal
  const plunger = (y, col) => { const B = bag(); sBox(B, 0, 0, 0, 0.08, 0.16, 0.08, 300, col); const m = cloud(B, 0.022, LAB); m.position.set(0.9, y, 0.22); return m; };
  const vIn = plunger(1.12, C.green), vOut = plunger(0.88, C.coral);
  const pumpG = new THREE.Group(); pumpG.position.set(0.9, 0.35, 0.2); LAB.add(pumpG);
  { const B = bag(); for (let i = 0; i < 300; i++) { const a = R() * 6.283, rr = 0.1 * Math.sqrt(R()); put(B, rr * Math.cos(a) + 0.04, rr * Math.sin(a), 0, C.violet); } cloud(B, 0.024, pumpG); }
  const pedalG = new THREE.Group(); pedalG.position.set(-0.45, 2.3, 0); LAB.add(pedalG);
  { const B = bag(); for (let i = 0; i < 300; i++) put(B, (R() - 0.5) * 0.03, -0.55 * R(), 0, "#c8d8ff"); sBox(B, 0, -0.6, 0, 0.2, 0.08, 0.16, 300, C.white); cloud(B, 0.024, pedalG); }
  const foot = new THREE.Group(); LAB.add(foot);
  { const B = bag(); sBox(B, 0, 0, 0, 0.5, 0.16, 0.2, 900, (v) => mix("#2a3a7a", "#8a9ad8", v)); sBox(B, 0.18, 0.2, 0, 0.16, 0.3, 0.18, 400, "#5a6ab0"); cloud(B, 0.022, foot); }
  // flowing pressure returns + signal pulses (updated per frame)
  const NF = 160, flowB = { pos: new Array(NF * 3).fill(0), col: [], a: [] };
  for (let i = 0; i < NF; i++) { tmpC.set(i < 110 ? C.coral : C.green); flowB.col.push(tmpC.r, tmpC.g, tmpC.b); }
  const flow = cloud(flowB, 0.04, LAB), fpos = flow.geometry.attributes.position;
  // scan-line graph (HUD in the world), two traces of 220 points
  const NG = 220, gB = { pos: new Array(NG * 2 * 3).fill(0), col: [], a: [] };
  for (let i = 0; i < NG * 2; i++) { tmpC.set(i < NG ? C.cyan : C.amber); gB.col.push(tmpC.r, tmpC.g, tmpC.b); }
  const graph = cloud(gB, 0.03, LAB), gpos = graph.geometry.attributes.position;
  { const B = bag(); for (let i = 0; i < 700; i++) { const u = R(); put(B, -1.1 + 2.2 * u, 2.62, 0, "#2a3a6a"); } for (let i = 0; i < 160; i++) put(B, -1.1, 2.62 + 0.62 * R(), 0, "#2a3a6a"); for (let k = 0; k <= 15; k++) for (let i = 0; i < 12; i++) put(B, -1.1 + (2.2 * k) / 15, 2.6 - 0.03 * (i / 12), 0, "#3a4a8a"); cloud(B, 0.02, LAB); }
  const GX = (u) => -1.1 + 2.2 * u, GY = (v) => 2.65 + 0.55 * clamp01(v);
  const labW = (t) => { // lab wheel speed (rad/s) and line pressure
    const m = A("s5:melambat"), h = A("s5:hampir"), sp = A("s6:berputar");
    let w = 6;
    if (t >= m && t < sp) w = 6 - 5.2 * ramp(t, m, h);
    else if (t >= sp) w = 0.8 + 5.2 * ramp(t, sp - 0.3, sp + 0.6) - (t > A("s6:siklus") ? 1.4 * pulse(t * 0.5) : 0);
    return w;
  };
  const press = (t) => { const mn = A("s6:menutup"), mb = A("s6:membuang"), pp = A("s6:Pompa"), sk = A("s6:siklus"); if (t < mb) return 1; if (t < pp) return 1 - 0.65 * ramp(t, mb, mb + 0.4); if (t < sk) return 0.35 + 0.65 * ramp(t, pp, pp + 0.6); return 0.35 + 0.65 * (((t * 2.5) % 1)); };
  const LWtab = new Float32Array(NT); for (let i = 1; i < NT; i++) LWtab[i] = LWtab[i - 1] + labW((i - 0.5) * DT) * DT;

  // ---------- camera ----------
  const k = (t, p, l) => [t, ...p, ...l];
  const CR = track([
    k(0, [6.2, 1.9, 9.0], [0.3, 0.75, 0]),
    k(A("s1:dilepas"), [4.6, 1.2, 5.6], [1.2, 0.5, 0.6]),
    k(A("s1:lima"), [3.6, 0.85, 4.4], [1.4, 0.42, 0.86]),
    k(K.s1e, [3.4, 0.9, 4.6], [1.3, 0.45, 0.8]),
    k(K.s2, [-3.5, 2.6, 9.5], [0.2, 0.6, 0]),
    k(A("s2:diinjak"), [-1.5, 2.0, 7.8], [0.4, 0.5, 0.2]),
    k(A("s2:terkunci"), [3.0, 0.85, 4.4], [1.4, 0.38, 0.9]),
    k(A("s2:terseret"), [-4.8, 1.1, 4.4], [-1.8, 0.25, 0.4]),
    k(K.s3, [4.6, 1.6, 7.0], [1.4, 0.4, 1.6]),
    k(A("s3:mencengkeram"), [4.2, 1.3, 6.4], [1.5, 0.4, 1.8]),
    k(A("s3:parah"), [3.5, 5.0, 5.0], [2.5, 0, 0]),
    k(A("s3:dibelokkan"), [3.6, 10.5, 0.8], [3.6, 0, -0.2]),
    k(K.s4 - 0.05, [5.2, 11.0, 0.9], [5.2, 0, -0.4]),
  ]);
  const CL = track([
    k(K.s4, [0.6, 1.6, LZ + 8.8], [-0.1, 1.45, LZ]),
    k(A("s4:sensor"), [-0.5, 0.7, LZ + 3.6], [-0.9, 0.55, LZ]),
    k(A("s4:komputer"), [1.2, 2.15, LZ + 3.6], [0.9, 1.85, LZ]),
    k(A("s4:katup"), [1.3, 1.25, LZ + 3.4], [0.9, 1.0, LZ]),
    k(A("s4:pompa"), [1.2, 0.6, LZ + 3.4], [0.9, 0.45, LZ]),
    k(K.s5, [-0.4, 0.9, LZ + 4.2], [-0.8, 0.7, LZ]),
    k(A("s5:melambat"), [0.1, 2.0, LZ + 5.6], [-0.2, 2.0, LZ]),
    k(A("s5:hampir"), [0.6, 2.0, LZ + 4.6], [0.4, 1.95, LZ]),
    k(K.s6, [1.2, 1.25, LZ + 3.8], [0.85, 1.05, LZ]),
    k(A("s6:membuang"), [1.1, 1.1, LZ + 3.3], [0.85, 0.95, LZ]),
    k(A("s6:berputar"), [-0.3, 1.1, LZ + 4.8], [-0.6, 1.0, LZ]),
    k(A("s6:Pompa"), [1.2, 0.6, LZ + 3.6], [0.9, 0.5, LZ]),
    k(A("s6:getaran"), [0.1, 2.0, LZ + 4.8], [-0.3, 1.85, LZ]),
    k(K.s7, [0.3, 2.55, LZ + 5.0], [0.0, 2.5, LZ]),
    k(A("s7:Kaki"), [-0.3, 2.0, LZ + 4.4], [-0.5, 1.85, LZ]),
    k(A("s7:Sistem"), [0.2, 1.9, LZ + 9.5], [0.0, 1.95, LZ]),
    k(K.s8 - 0.05, [0.0, 2.0, LZ + 10.5], [0.0, 2.0, LZ]),
  ]);
  const C8 = track([
    k(K.s8, [-6.0, 2.3, 8.0], [1.0, 0.55, 0]),
    k(A("s8:injak"), [-3.0, 1.6, 6.5], [1.0, 0.5, 0.2]),
    k(A("s8:arahkan"), [8.0, 3.0, 6.0], [3.0, 0.5, 0.5]),
    k(A("s8:AUDIRA"), [3.5, 5.0, 13.0], [2.0, 1.6, -0.5]),
    k(K.dur, [3.0, 5.8, 15.5], [2.0, 1.8, -0.5]),
  ]);
  const camAt = (t) => (t < K.s4 ? CR(t) : t < K.s8 ? CL(t) : C8(t));
  const lk = new THREE.Vector3();
  const cuts = [K.s4, K.s8];

  return (t) => {
    const c = camAt(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.41), c[1] + 0.02 * Math.sin(t * 0.57 + 1), c[2]); lk.set(c[3], c[4], c[5]); cam.lookAt(lk);
    // laser sweep wipe across each cut
    let wp = -1; for (const tc of cuts) if (t > tc - 0.35 && t < tc + 0.35) wp = t < tc ? 1 - (t - (tc - 0.35)) / 0.35 : 1 - (t - tc) / 0.35;
    gradeP.uniforms.wipe.value = wp;
    const onRoad = t < K.s4 || t >= K.s8;
    ROAD.visible = onRoad; LAB.visible = !onRoad;

    if (onRoad) {
      const dist = D(t), wa = WA(t), slip = slipOf(t);
      ROAD.userData.road.material.uniforms.uScroll.value = dist;
      ROAD.userData.skid.material.uniforms.uD.value = dist;
      ROAD.userData.skid.visible = t < K.s4;
      const rain = t >= K.s2 && t < K.s4 ? 1 : 0;
      ROAD.userData.rain.visible = rain > 0; ROAD.userData.rain.material.uniforms.uTime.value = t;
      const steer = t >= K.s8 ? 0.42 * win(t, A("s8:arahkan") - 0.4, A("s8:AUDIRA"), 0.6) : t < K.s4 ? 0.45 * ramp(t, A("s3:Setir") - 0.3, A("s3:Setir") + 0.4) : 0;
      wheels.forEach((w) => { w.S.rotation.z = -wa; w.G.rotation.y = w.front ? steer : 0; w.p.material.uniforms.uTint.value.set(mix(C.green, C.coral, slip)); });
      // car body: dive under braking, sideways move round the cone in s8
      const brk = t < K.s2 ? 1 : t < K.s4 ? ramp(t, tIn, tIn + 0.4) : ramp(t, K.s8, K.s8 + 0.5);
      CAR.rotation.z = -0.025 * brk - (absOn(t) ? 0.006 * pulse(t) : 0);
      const lane = t >= K.s8 ? 1.7 * ramp(t, A("s8:arahkan") - 0.4, A("s8:AUDIRA") - 0.2) : 0;
      CAR.position.z = lane; CAR.rotation.y = t >= K.s8 ? 0.3 * steer * (1 - ramp(t, A("s8:AUDIRA") - 0.6, A("s8:AUDIRA") + 0.3)) : 0;
      rings.forEach((rg, i) => { const ph = (t * 5) % 1; const on = absOn(t) ? (t < K.s2 ? 1 - ramp(t, K.s2 - 1.2, K.s2 - 0.6) : 1 - ramp(t, A("s8:AUDIRA") - 0.6, A("s8:AUDIRA"))) : 0; rg.visible = on > 0.01; rg.scale.setScalar(0.45 + 0.4 * ph); rg.material.uniforms.uAlpha.value = on * (1 - ph); rg.position.z = WH[i][2] + (i ? -0.2 : 0.2) + lane; });
      // grip comparison (s3)
      const gc = win(t, A("s3:terseret") - 0.2, A("s3:parah"), 0.4);
      ghostW.visible = gripBig.visible = gripSmall.visible = gc > 0.01;
      ghostS.rotation.z = -t * 6; ghostP.material.uniforms.uAlpha.value = gc;
      gripBig.material.uniforms.uAlpha.value = gc * ramp(t, A("s3:mencengkeram") - 0.2, A("s3:mencengkeram") + 0.4); gripBig.scale.x = 0.2 + 0.8 * ramp(t, A("s3:mencengkeram") - 0.2, A("s3:mencengkeram") + 0.5);
      gripSmall.material.uniforms.uAlpha.value = gc * ramp(t, A("s3:lemah") - 0.3, A("s3:lemah") + 0.2);
      // steer-but-slide paths (end of s3)
      const ps = t < K.s4 ? win(t, A("s3:dibelokkan") - 0.5, K.s4, 0.2) : 0;
      pathGo.visible = pathReal.visible = ps > 0.01; pathGo.material.uniforms.uAlpha.value = ps * ramp(t, A("s3:Setir"), A("s3:Setir") + 0.5); pathReal.material.uniforms.uAlpha.value = ps * ramp(t, A("s3:meluncur") - 0.2, A("s3:lurus"));
      // cone + billboard scroll with the road in s8
      coneG.visible = board.visible = t >= K.s8 - 0.05;
      const ds = dist - D(K.s8);
      coneG.position.set(X0cone - ds, 0, 0); board.position.x = X0board - ds;
    } else {
      // LAB
      const la = look(LWtab, t);
      discG.rotation.z = -la;
      const w = labW(t), carW = 6 - 0.9 * ramp(t, A("s5:melambat"), A("s5:hampir"));
      const p = press(t);
      const cl = t >= A("s6:menutup") - 0.1 && t < A("s6:Pompa") ? 1 : 0;
      vIn.position.y = 1.12 - 0.05 * (t >= A("s6:siklus") ? ((t * 2.5) % 1) < 0.5 ? 1 : 0 : cl);
      vOut.position.y = 0.88 + 0.05 * (t >= A("s6:membuang") && t < A("s6:Pompa") ? 1 : t >= A("s6:siklus") ? ((t * 2.5) % 1) > 0.8 ? 1 : 0 : 0);
      pumpG.rotation.z = t >= A("s6:Pompa") - 0.3 ? -t * 18 : -t * 2;
      const vib = t >= A("s6:getaran") - 0.3 ? 0.04 * Math.sin(t * 2 * Math.PI * 7.5) : 0;
      pedalG.rotation.z = -0.25 + vib; foot.visible = t >= A("s6:getaran") - 0.5;
      foot.position.set(-0.75 + 0.02 * Math.sin(t * 2), 1.7 + vib * 0.5, 0.05); foot.rotation.z = 0.5;
      // pressure returns flow master -> valve -> caliper; signal pulses sensor -> ECU
      const vv = new THREE.Vector3();
      for (let i = 0; i < NF; i++) {
        if (i < 110) { const u = (i / 110 + t * 0.6 * (0.4 + p)) % 1, ont = (u < 0.5 ? 1 : p) * (u * 2 % 1 < 0.75 ? 1 : 0.4); (u < 0.5 ? brakeIn : brakeOut).getPoint(u < 0.5 ? u * 2 : u * 2 - 1, vv); fpos.setXYZ(i, vv.x, vv.y, ont > 0.5 || i % 2 ? 0.01 : -50); }
        else { const u = ((i - 110) / 50 + t * 1.6) % 1; sig.getPoint(u, vv); fpos.setXYZ(i, vv.x, vv.y, ((i - 110) % 5 === 0 || t > K.s5 - 0.3) && (i - 110) % 3 === 0 ? 0.01 : -50); }
      }
      fpos.needsUpdate = true;
      // graph: s4 idle, s5 wheel vs car speed, s6+ pressure saw-tooth, s7 15 peaks in one second
      const mode = t < K.s5 ? 0 : t < K.s6 ? 1 : t < K.s7 ? 2 : 3, head = (t * 0.35) % 1;
      for (let i = 0; i < NG; i++) {
        const u = i / (NG - 1); let a = 0.5, b = 0.5, show = 1;
        if (mode === 0) { a = 0.55 + 0.03 * Math.sin(u * 30 + t * 3); b = a; }
        else if (mode === 1) { const tt = K.s5 + (A("s5:hampir") + 0.8 - K.s5) * u; a = 0.85 - 0.12 * ramp(tt, A("s5:melambat"), A("s5:hampir")); b = labW(tt) / 6 * 0.85; show = tt <= t + 0.05 ? 1 : 0; }
        else if (mode === 2) { const tt = K.s6 + (K.s7 - K.s6) * u; a = press(tt) * 0.9; b = labW(tt) / 6 * 0.85; show = tt <= t ? 1 : 0; }
        else { a = 0.15 + 0.75 * (u * 15 % 1 < 0.75 ? (u * 15 % 1) / 0.75 : 1 - ((u * 15 % 1) - 0.75) / 0.25); b = 0.15 + 0.7 * (0.5 + 0.5 * Math.sin(u * 2 * Math.PI * 1.2)); show = u <= ramp(t, K.s7, A("s7:detik") + 0.4) ? 1 : 0; }
        gpos.setXYZ(i, GX(u), GY(a), show ? 0.01 : -50);
        gpos.setXYZ(NG + i, GX(u), GY(b), show && (mode !== 3 || t > A("s7:Kaki") - 0.2) ? 0.01 : -50);
      }
      gpos.needsUpdate = true;
      graph.material.uniforms.uAlpha.value = 1;
      y78.visible = t > A("s7:Sistem") - 0.4; y78.material.uniforms.uScan.value = -0.5 + 5 * ramp(t, A("s7:dipasang") - 1.2, A("s7:delapan") + 0.4);
      // emphasise the part being named in s4
      const em = (a2) => 0.6 + 0.4 * win(t, a2 - 0.2, a2 + 1.2, 0.3);
      ecuTxt.material.uniforms.uAlpha.value = em(A("s4:komputer"));
    }
    comp.render();
  };
}
