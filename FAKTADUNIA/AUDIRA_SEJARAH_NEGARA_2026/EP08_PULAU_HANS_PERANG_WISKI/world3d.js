// EP08 PERANG WISKI: one continuous low-poly pastel set. Kennedy Channel coasts come from Natural Earth 50m (rotated so the
// strait runs up the screen, squeezed so coast to coast reads 35 km). Hans Island is modelled by hand: a kidney-shaped rock,
// ~13 units across (1 unit ~ 100 m), with a north-south crack that becomes the 2022 land border. Props are toy-scale.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, smooth, canvasTex, track, std, box, cyl, stage, pts, envStrips } from "./lib3d.js";
import { GEO } from "./geo.js";

const KM = 8.75, LON0 = -66.46, LAT0 = 80.826, PHI = -0.593, CP = Math.cos(PHI), SP = Math.sin(PHI);
const proj = (lon, lat) => { const x = (lon - LON0) * 17.8, z = -(lat - LAT0) * 111.2; return [(x * CP - z * SP) * KM, (x * SP + z * CP) * KM]; };
const CAR = 0xd52b1e, DKR = 0xc8102e, NAVY = 0x16324a;

const hash = (i, j) => { let h = Math.imul(i, 374761393) + Math.imul(j, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vn(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }

// ---------- Hans Island ----------
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const RAD = (th) => 6.3 + 0.35 * Math.cos(2 * th + 0.4) + 0.22 * Math.sin(3 * th + 1) - 1.6 * Math.exp(-((wrap(th - 0.95) / 0.5) ** 2));
const xc = (z) => -0.4 + 0.6 * Math.sin(0.45 * z) + 0.25 * Math.sin(1.3 * z);
function hI(x, z) {
  const d = Math.hypot(x, z) / RAD(Math.atan2(z, x));
  if (d >= 1) return -(d - 1) * 9;
  const n = vn(x * 0.9 + 3, z * 0.9) - 0.5, n2 = vn(x * 2.3 + 9, z * 2.3) - 0.5;
  let h = 2.9 * (0.3 * smooth((1 - d) / 0.1) + 0.7 * (1 - d * d) ** 0.8) + (0.5 * n + 0.18 * n2) * smooth((1 - d) / 0.15);
  h -= 1.0 * Math.exp(-(((x - xc(z)) / 0.42) ** 2)) * smooth((1 - d) / 0.12);
  return h;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe6f0f6, fog: 0.00042, exp: 1.0, bloom: [0.1, 0.35, 0.94], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  cam.near = 0.1; cam.far = 5200; cam.updateProjectionMatrix();
  cam.setViewOffset(1080, 1920, 0, -120, 1080, 1920);
  envStrips(r, scene, [[24, 6, 0xffffff, 2.2, 0, 14, 8], [6, 22, 0xbfe0f2, 1.6, -14, 2, 6], [30, 4, 0xffe2cc, 1.2, 8, -6, -10]], 0x8fb4c8);
  const a = (k) => { const v = AT[k] ?? K[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const rnd = mulberry(808);

  // ---------- sky + light ----------
  const sunDir = new THREE.Vector3(-0.45, 0.32, 0.83).normalize();
  const skyU = { uSun: { value: sunDir }, cH: { value: new THREE.Color(0xeef5f9) }, cZ: { value: new THREE.Color(0x9cc8e3) }, cG: { value: new THREE.Color(0xffd6c4) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4600, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uSun,cH,cZ,cG;varying vec3 vD;void main(){float y=vD.y;vec3 c=mix(cH,cZ,smoothstep(0.,.5,y));float s=max(0.,dot(vD,uSun));
      c=mix(c,cG,pow(s,5.)*.55*(1.-smoothstep(0.,.45,y)));c+=vec3(1.,.95,.88)*pow(s,300.)*.6;gl_FragColor=vec4(c,1.);}`,
  }));
  scene.add(sky);
  scene.fog.color.set(0xe6f0f6);
  const hemi = new THREE.HemisphereLight(0xf2f8fc, 0x7fb8d6, 1.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe8d6, 2.1); sun.position.copy(sunDir).multiplyScalar(60); scene.add(sun); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 140 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;

  // ---------- coasts: low-poly heightfield over a land mask ----------
  const BX0 = -1150, BX1 = 1150, BZ0 = -1500, BZ1 = 1300, PX = 2.5, MW = (BX1 - BX0) / PX, MH = (BZ1 - BZ0) / PX;
  const mk = (blur) => { const c = document.createElement("canvas"); c.width = MW; c.height = MH; const x = c.getContext("2d", { willReadFrequently: true }); return [c, x]; };
  const [mc, mx] = mk();
  mx.fillStyle = "#000"; mx.fillRect(0, 0, MW, MH); mx.fillStyle = "#fff";
  for (const c of GEO) for (const ring of c.rings) { mx.beginPath(); ring.forEach(([lo, la], i) => { const [x, z] = proj(lo, la); const px = (x - BX0) / PX, pz = (z - BZ0) / PX; i ? mx.lineTo(px, pz) : mx.moveTo(px, pz); }); mx.closePath(); mx.fill(); }
  const blurred = (px) => { const [c, x] = mk(); x.fillStyle = "#000"; x.fillRect(0, 0, MW, MH); x.filter = `blur(${px}px)`; x.drawImage(mc, 0, 0); return x.getImageData(0, 0, MW, MH).data; };
  const M0 = mx.getImageData(0, 0, MW, MH).data, B1 = blurred(4), B2 = blurred(26);
  const samp = (D, x, z) => { const i = Math.floor((x - BX0) / PX), j = Math.floor((z - BZ0) / PX); if (i < 0 || j < 0 || i >= MW || j >= MH) return 0; return D[(j * MW + i) * 4] / 255; };
  const hT = (x, z) => {
    const s1 = samp(B1, x, z), s2 = samp(B2, x, z);
    if (s1 < 0.45) return -10;
    return 3 + 20 * smooth((s1 - 0.45) / 0.5) + 75 * smooth((s2 - 0.5) / 0.45) * (0.45 + 0.9 * vn(x * 0.006 + 4, z * 0.006)) + 9 * (vn(x * 0.03, z * 0.03) - 0.5);
  };
  {
    const C = 16, NX = Math.floor((BX1 - BX0) / C), NZ = Math.floor((BZ1 - BZ0) / C), V = [];
    for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = BX0 + i * C + (rnd() - 0.5) * C * 0.6, z = BZ0 + j * C + (rnd() - 0.5) * C * 0.6; V.push([x, hT(x, z), z]); }
    const P = [], CO = [], col = new THREE.Color(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    const SNOW = new THREE.Color(0xf4f8fb), SNOW2 = new THREE.Color(0xe2eef6), RK = new THREE.Color(0x8a8f98), RK2 = new THREE.Color(0xa3a6b6), BEACH = new THREE.Color(0x9ba3ac);
    const tri = (A, B, Cc) => {
      if (A[1] < -2 && B[1] < -2 && Cc[1] < -2) return;
      e1.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]); e2.set(Cc[0] - A[0], Cc[1] - A[1], Cc[2] - A[2]); const nr = e1.clone().cross(e2).normalize();
      if (nr.y < 0) { const t = B; B = Cc; Cc = t; nr.negate(); }
      const h = (A[1] + B[1] + Cc[1]) / 3, q = hash(Math.floor(A[0]), Math.floor(A[2]));
      if (h < 5) col.copy(BEACH); else if (nr.y > 0.8 && h > 12) col.copy(SNOW).lerp(SNOW2, q); else col.copy(RK).lerp(RK2, q);
      for (const p of [A, B, Cc]) { P.push(p[0], p[1], p[2]); CO.push(col.r, col.g, col.b); }
    };
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const v00 = V[j * (NX + 1) + i], v10 = V[j * (NX + 1) + i + 1], v01 = V[(j + 1) * (NX + 1) + i], v11 = V[(j + 1) * (NX + 1) + i + 1];
      if ((i + j) % 2) { tri(v00, v10, v11); tri(v00, v11, v01); } else { tri(v00, v10, v01); tri(v10, v11, v01); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(CO, 3)); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })));
  }
  // coast-to-coast crossing on the gauge line, measured on the land mask
  const coastAt = (z, dir) => { for (let x = 0; Math.abs(x) < 900; x += dir * 2) if (samp(M0, x, z) > 0.5) return x; return dir * 180; };
  const GZ = 60, CW = coastAt(GZ, -1), CE = coastAt(GZ, 1);

  // ---------- sea: one grid, fine near the island, coarse far away ----------
  const SEG = 160, sg = new THREE.PlaneGeometry(2, 2, SEG, SEG); sg.rotateX(-Math.PI / 2);
  const sp = sg.attributes.position.array, f = (u) => Math.sign(u) * 2600 * Math.abs(u) ** 3 + 26 * u;
  const sCol = new Float32Array(sp.length), cA = new THREE.Color(0xa9d6ea), cB = new THREE.Color(0x7fb8d6), cC = new THREE.Color(0x6aa4c6), tc = new THREE.Color();
  for (let i = 0; i < sp.length; i += 3) { sp[i] = f(sp[i]); sp[i + 2] = f(sp[i + 2]); const d = Math.hypot(sp[i], sp[i + 2]); tc.copy(cA).lerp(cB, smooth((d - 8) / 14)).lerp(cC, smooth((d - 200) / 900)); sCol[i] = tc.r; sCol[i + 1] = tc.g; sCol[i + 2] = tc.b; }
  sg.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
  const sBase = sp.slice();
  const sea = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.42, metalness: 0.05 }));
  sea.receiveShadow = true; scene.add(sea);

  // ---------- island halves ----------
  const isl = { W: new THREE.Group(), E: new THREE.Group() }; scene.add(isl.W, isl.E);
  const matW = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, side: THREE.DoubleSide, emissive: CAR, emissiveIntensity: 0 });
  const matE = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, side: THREE.DoubleSide, emissive: DKR, emissiveIntensity: 0 });
  {
    const S = 0.3, N = 66, o = (-N * S) / 2, V = [], rj = mulberry(88);
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const ed = i && j && i < N && j < N ? 1 : 0; const x = o + i * S + (rj() - 0.5) * S * 0.55 * ed, z = o + j * S + (rj() - 0.5) * S * 0.55 * ed; V.push([x, hI(x, z), z]); }
    const out = { W: [[], []], E: [[], []] }, col = new THREE.Color(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    const R1 = new THREE.Color(0x8a8f98), R2 = new THREE.Color(0xa4a8b0), CL = new THREE.Color(0x737983), WET = new THREE.Color(0x646b75), SN = new THREE.Color(0xeef3f6), LI = new THREE.Color(0xa7a58f);
    const tri = (A, B, C) => {
      if (A[1] < -0.8 && B[1] < -0.8 && C[1] < -0.8) return;
      e1.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]); e2.set(C[0] - A[0], C[1] - A[1], C[2] - A[2]); const nr = e1.clone().cross(e2).normalize();
      if (nr.y < 0) { const t = B; B = C; C = t; nr.negate(); }
      const cx = (A[0] + B[0] + C[0]) / 3, cy = (A[1] + B[1] + C[1]) / 3, cz = (A[2] + B[2] + C[2]) / 3, q = hash(Math.floor(cx * 7), Math.floor(cz * 7));
      if (cy < 0.15) col.copy(WET); else if (nr.y > 0.94 && vn(cx * 1.4 + 2, cz * 1.4) > 0.76) col.copy(SN); else if (nr.y < 0.62) col.copy(CL).lerp(R1, q * 0.5); else if (q > 0.86) col.copy(LI); else col.copy(R1).lerp(R2, q);
      const T = out[cx < xc(cz) ? "W" : "E"];
      for (const p of [A, B, C]) { T[0].push(p[0], p[1], p[2]); T[1].push(col.r, col.g, col.b); }
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const v00 = V[j * (N + 1) + i], v10 = V[j * (N + 1) + i + 1], v01 = V[(j + 1) * (N + 1) + i], v11 = V[(j + 1) * (N + 1) + i + 1];
      if ((i + j) % 2) { tri(v00, v10, v11); tri(v00, v11, v01); } else { tri(v00, v10, v01); tri(v10, v11, v01); }
    }
    for (const k of ["W", "E"]) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(out[k][0], 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(out[k][1], 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, k === "W" ? matW : matE); m.castShadow = m.receiveShadow = true; isl[k].add(m); }
  }
  const on = (x, z, dy = 0) => new THREE.Vector3(x, hI(x, z) + dy, z);

  // crack path along the surface, north to south
  const crackPts = [];
  for (let z = -7; z <= 7; z += 0.2) { const x = xc(z), h = hI(x, z); if (h > 0.08) crackPts.push(new THREE.Vector3(x, h + 0.07, z)); }
  const crack = new THREE.CatmullRomCurve3(crackPts);
  const crackGeo = new THREE.TubeGeometry(crack, 200, 0.07, 6), crackN = crackGeo.index.count;
  const crackM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const crackTube = new THREE.Mesh(crackGeo, crackM); scene.add(crackTube);
  const crackLen = crack.getLength();
  const dots = crack.getSpacedPoints(Math.round(crackLen / 0.42)).map((p) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.4 })); m.position.copy(p).y += 0.04; m.castShadow = true; scene.add(m); return m; });

  // ---------- flags ----------
  const LEAF = [[0, 1], [.12, .78], [.28, .84], [.22, .48], [.45, .62], [.52, .52], [.72, .58], [.62, .36], [.75, .3], [.42, .06], [.48, -.06], [.08, 0], [.05, -.32], [-.05, -.32], [-.08, 0], [-.48, -.06], [-.42, .06], [-.75, .3], [-.62, .36], [-.72, .58], [-.52, .52], [-.45, .62], [-.22, .48], [-.28, .84], [-.12, .78]];
  const texCA = canvasTex(512, 256, (x, w, h) => { x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.fillStyle = "#D52B1E"; x.fillRect(0, 0, w / 4, h); x.fillRect(w * 0.75, 0, w / 4, h); const s = h * 0.42; x.beginPath(); LEAF.forEach(([a, b], i) => { const px = w / 2 + a * s, py = h / 2 - (b - 0.34) * s; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); x.fill(); });
  const texDK = canvasTex(370, 280, (x, w, h) => { x.fillStyle = "#C8102E"; x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; x.fillRect(120, 0, 40, h); x.fillRect(0, 120, w, 40); });
  const poleM = std(0xe9eef2, 0.35, 0.4), goldM = std(0xe0b450, 0.3, 0.8);
  const flags = [];
  function flag(tex, w, h, x, z) {
    const G = new THREE.Group(); const base = on(x, z, -0.05);
    cyl(0.04, 0.05, 2.9, 8, poleM, 0, 1.45, 0, G); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), goldM); ball.position.y = 2.95; G.add(ball);
    const geo = new THREE.PlaneGeometry(w, h, 18, 8); geo.translate(w / 2, 0, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 })); m.position.set(0.04, 2.85 - h / 2, 0); m.castShadow = true; G.add(m);
    G.position.copy(base); scene.add(G);
    const o = { G, geo, base, b0: geo.attributes.position.array.slice(), ph: rnd() * 6 }; flags.push(o); return o;
  }
  const FCA = flag(texCA, 1.6, 0.8, -2.0, -0.8), FDK = flag(texDK, 1.06, 0.8, 1.5, 0.6);

  // ---------- bottles ----------
  const prof = [[0, 0], [0.13, 0], [0.145, 0.02], [0.145, 0.42], [0.13, 0.5], [0.065, 0.58], [0.05, 0.63], [0.05, 0.78], [0.058, 0.8], [0, 0.8]].map(([x, y]) => new THREE.Vector2(x, y));
  const labelDK = canvasTex(512, 128, (x, w, h) => { x.fillStyle = "#F4EEDC"; x.fillRect(0, 0, w, h); x.fillStyle = "#C8102E"; for (const u of [0.25, 0.75]) { x.fillRect(u * w - 70, 20, 140, 10); x.fillRect(u * w - 70, h - 30, 140, 10); x.fillRect(u * w - 16, 44, 32, 40); } });
  const labelCA = canvasTex(512, 128, (x, w, h) => { x.fillStyle = "#F4EEDC"; x.fillRect(0, 0, w, h); x.fillStyle = "#1E2A36"; x.font = "italic 700 30px Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle"; for (const u of [0.25, 0.75]) { x.fillText("Canadian", u * w, h * 0.36); x.fillText("Club", u * w, h * 0.68); } x.fillStyle = "#B08A3C"; x.fillRect(0, 6, w, 4); x.fillRect(0, h - 10, w, 4); });
  const bottles = [];
  function bottle(kind, x, z) {
    const G = new THREE.Group(), S = new THREE.Group(); G.add(S);
    const glass = new THREE.MeshStandardMaterial({ color: kind === "CA" ? 0xa8641f : 0x3f6f52, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.9, envMapIntensity: 1.6 });
    const b = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), glass); b.castShadow = true; S.add(b);
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.149, 0.149, 0.22, 24, 1, true), new THREE.MeshStandardMaterial({ map: kind === "CA" ? labelCA : labelDK, roughness: 0.7 })); lb.position.y = 0.24; S.add(lb);
    cyl(0.06, 0.06, 0.06, 12, kind === "CA" ? std(0xd8b25a, 0.3, 0.8) : std(0xb88a56, 0.7), 0, 0.82, 0, S);
    G.position.copy(on(x, z, -0.02)); G.rotation.y = 0.25; S.scale.setScalar(0); scene.add(G);
    const o = { G, S }; bottles.push(o); return o;
  }

  // ---------- Danish sign ----------
  const signTex = canvasTex(512, 280, (x, w, h) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.strokeStyle = "#C8102E"; x.lineWidth = 18; x.strokeRect(9, 9, w - 18, h - 18);
    x.fillStyle = "#C8102E"; x.fillRect(36, 34, 74, 56); x.fillStyle = "#fff"; x.fillRect(60, 34, 9, 56); x.fillRect(36, 58, 74, 9);
    x.fillStyle = "#16324A"; x.textAlign = "center"; const fit = (txt, px, cx, y, maxW) => { x.font = `700 ${px}px Georgia, serif`; const m = x.measureText(txt).width; x.save(); x.translate(cx, y); x.scale(Math.min(1, maxW / m), 1); x.fillText(txt, 0, 0); x.restore(); }; fit("VELKOMMEN TIL", 40, w / 2 + 48, 78, 330); fit("DEN DANSKE Ø", 50, w / 2, 168, 420);
    x.font = "italic 400 28px Georgia, serif"; x.fillStyle = "#2B5C7A"; x.fillText("— Danmark —", w / 2, 224);
  });
  const sign = new THREE.Group(); const signBase = on(2.7, 1.3, -0.05);
  cyl(0.05, 0.05, 1.3, 8, std(0x8a6a4a, 0.8), -0.42, 0.65, -0.09, sign); cyl(0.05, 0.05, 1.3, 8, std(0x8a6a4a, 0.8), 0.42, 0.65, -0.09, sign);
  const wh = std(0xffffff, 0.6);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.68, 0.05), [wh, wh, wh, wh, new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 }), wh]); board.position.y = 1.1; board.castShadow = true; sign.add(board);
  sign.position.copy(signBase); sign.rotation.y = -0.35; scene.add(sign);

  // ---------- helicopter (1984) ----------
  const heli = new THREE.Group(); scene.add(heli);
  const hRed = std(DKR, 0.45, 0.1), hWh = std(0xffffff, 0.5), hDk = std(0x23303c, 0.4, 0.4), hGl = std(0x9fd0ea, 0.12, 0.3);
  { const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 9), hRed); body.scale.set(1.5, 0.95, 0.9); body.position.y = 0.75; body.castShadow = true; heli.add(body);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 9), hGl); gl.scale.set(1, 0.85, 0.9); gl.position.set(-0.45, 0.85, 0); heli.add(gl);
    box(0.7, 0.1, 0.92, hWh, 0.05, 0.62, 0, heli);
    const tail = cyl(0.14, 0.06, 1.7, 7, hRed, 1.35, 0.88, 0, heli); tail.rotation.z = Math.PI / 2;
    box(0.32, 0.55, 0.06, hRed, 2.15, 1.1, 0, heli);
    for (const s of [-1, 1]) { box(1.7, 0.06, 0.07, hDk, 0, 0.1, s * 0.42, heli); box(0.05, 0.4, 0.05, hDk, -0.4, 0.3, s * 0.38, heli); box(0.05, 0.4, 0.05, hDk, 0.45, 0.3, s * 0.38, heli); }
    cyl(0.05, 0.05, 0.3, 8, hDk, 0, 1.32, 0, heli); }
  const rotor = new THREE.Group(); rotor.position.y = 1.48; heli.add(rotor);
  box(3.4, 0.03, 0.14, hDk, 0, 0, 0, rotor); box(0.14, 0.03, 3.4, hDk, 0, 0, 0, rotor);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide })); disc.rotation.x = -Math.PI / 2; rotor.add(disc);
  const trotor = new THREE.Group(); trotor.position.set(2.18, 1.12, 0.07); heli.add(trotor); box(0.06, 0.72, 0.02, hDk, 0, 0, 0, trotor);
  const HL = [3.7, -1.3]; const hLand = hI(...HL);
  const heliT = track([
    [K.s4, 30, 15, -40], [a("s4:menteri"), 16, 10, -18], [a("s4:Greenland"), 8, 5.2, -5], [a("s4:mendarat") - 0.15, HL[0], hLand + 0.7, HL[1]], [a("s4:mendarat") + 0.6, HL[0], hLand, HL[1]],
    [K.s5 + 0.1, HL[0], hLand, HL[1]], [K.s5 + 1.3, HL[0] + 2, hLand + 3.5, HL[1] - 2], [K.s5 + 3.6, 40, 20, -34],
  ]);

  // ---------- Canadian ship (reply) ----------
  const ship = new THREE.Group(); scene.add(ship);
  { const hull = std(0x5d6b78, 0.5, 0.3), whi = std(0xf4f6f8, 0.5);
    box(2.6, 0.5, 0.9, hull, 0, 0.12, 0, ship); const bow = box(0.64, 0.5, 0.64, hull, 1.3, 0.12, 0, ship); bow.rotation.y = Math.PI / 4;
    box(2.62, 0.08, 0.92, std(CAR, 0.5), 0, 0.3, 0, ship); box(1.0, 0.55, 0.7, whi, -0.2, 0.62, 0, ship); box(0.55, 0.3, 0.62, whi, -0.25, 1.05, 0, ship);
    cyl(0.03, 0.03, 0.8, 6, hull, -0.25, 1.55, 0, ship);
    const sf = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.22), new THREE.MeshStandardMaterial({ map: texCA, side: THREE.DoubleSide })); sf.position.set(-0.03, 1.8, 0); ship.add(sf); }
  const SH = [-9.6, 2.6];
  const shipT = track([[a("s5:membalas") - 1.6, -46, 0, 12], [a("s5:benderanya") - 0.3, SH[0], 0, SH[1]], [a("s5:Media"), SH[0], 0, SH[1]], [a("s5:Media") + 3.4, -46, 0, 14]]);

  // ---------- pen (2022) ----------
  const pen = new THREE.Group(); scene.add(pen);
  { const pb = std(NAVY, 0.3, 0.4); const body = cyl(0.11, 0.11, 1.5, 12, pb, 0, 1.05, 0, pen); cyl(0.115, 0.115, 0.08, 12, goldM, 0, 0.55, 0, pen); cyl(0.115, 0.115, 0.06, 12, goldM, 0, 1.6, 0, pen);
    const nib = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.5, 12), goldM); nib.rotation.x = Math.PI; nib.position.y = 0.25; pen.add(nib); }

  // ---------- strait overlays: gauge, zones, 1973 line, ring ----------
  const lineM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false });
  const gauge = new THREE.Group(); scene.add(gauge);
  const gBar = box(CE - CW, 0.5, 5, lineM, (CW + CE) / 2, 2, GZ, gauge); gBar.castShadow = false;
  const gT1 = box(5, 0.5, 40, lineM, CW, 2, GZ, gauge), gT2 = box(5, 0.5, 40, lineM, CE, 2, GZ, gauge);
  const stripe = (col, dir) => canvasTex(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = col.replace("A", "0.22"); x.fillRect(0, 0, w, h); x.strokeStyle = col.replace("A", "0.75"); x.lineWidth = 14; for (let k = -w; k < w * 2; k += 46) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + dir * h, h); x.stroke(); } }, [4, 16]);
  const zoneMat = (tex) => new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const ZW = 194, ZL = 1300;
  const zCA = new THREE.Mesh(new THREE.PlaneGeometry(ZW + 60, ZL), zoneMat(stripe("rgba(213,43,30,A)", 1))); zCA.rotation.x = -Math.PI / 2; zCA.position.set(CW - 60 + (ZW + 60) / 2, 1.2, -100); scene.add(zCA);
  const zDK = new THREE.Mesh(new THREE.PlaneGeometry(ZW + 60, ZL), zoneMat(stripe("rgba(140,16,46,A)", -1))); zDK.rotation.x = -Math.PI / 2; zDK.position.set(CE + 60 - (ZW + 60) / 2, 1.3, -100); scene.add(zDK);
  const XM = (CW + CE) / 2;
  const mlX = (z) => XM * (1 - Math.exp(-((z / 110) ** 2)));
  const dashes = [];
  for (const sgn of [1, -1]) for (let z = 18, k = 0; z < 900; z += 14, k++) { const d = box(2.2, 0.4, 8, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false }), mlX(sgn * (z + 4)), 1.6, sgn * (z + 4)); d.castShadow = false; d.rotation.y = Math.atan2(mlX(sgn * (z + 8)) - mlX(sgn * z), 8) * -sgn; scene.add(d); dashes.push({ d, z, sgn }); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(12, 15, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 1.5; scene.add(ring);

  // ---------- ice floes ----------
  const floeM = new THREE.MeshStandardMaterial({ color: 0xf2f8fb, flatShading: true, roughness: 0.75 });
  const floes = [];
  for (let i = 0; i < 120; i++) {
    const far = i > 60, rr = far ? 40 + rnd() * 320 : 9.5 + rnd() * 38, th = rnd() * 6.283, x = Math.cos(th) * rr, z = Math.sin(th) * rr;
    if (Math.abs(x) > (far ? 150 : 80)) continue;
    const g = new THREE.CylinderGeometry(1, 1.12, 0.45, 5 + Math.floor(rnd() * 4), 1); const pa = g.attributes.position.array; for (let k = 0; k < pa.length; k += 3) { const s = 0.75 + hash(Math.round(pa[k] * 100), Math.round(pa[k + 2] * 100) + i) * 0.5; pa[k] *= s; pa[k + 2] *= s; }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, floeM); const sc = far ? 3 + rnd() * 12 : 0.5 + rnd() * 2.2; m.scale.set(sc, far ? 1.5 : 1, sc * (0.6 + rnd() * 0.6)); m.rotation.y = rnd() * 6; m.castShadow = !far; m.receiveShadow = true; scene.add(m);
    floes.push({ m, x, z, ph: rnd() * 6, sp: 0.15 + rnd() * 0.25 });
  }

  // ---------- falling snow near the lens ----------
  const snow = pts(scene, 260, { color: 0xffffff, size: 0.05, add: false, opacity: 0.85 });
  const snowSeed = Array.from({ length: 260 }, () => [rnd() * 2 - 1, rnd() * 2 - 1, rnd(), rnd() * 6.28, 0.25 + rnd() * 0.5]);

  // ---------- DOM labels, projected each frame and kept below the visible panel ----------
  const root = canvas.parentNode, LBL = [];
  const panels = [...root.querySelectorAll(".p")];
  function label(html, pos, t0, t1, style = "") {
    const e = document.createElement("div");
    e.style.cssText = "position:absolute;left:0;top:0;z-index:6;white-space:nowrap;pointer-events:none;text-align:center;opacity:0";
    e.innerHTML = `<div style="display:inline-block;font-family:Manrope,sans-serif;font-weight:800;font-size:30px;letter-spacing:.05em;color:#16324A;background:rgba(255,255,255,.92);padding:6px 16px;border-radius:999px;box-shadow:0 6px 16px rgba(22,50,74,.22);${style}">${html}</div><div style="width:3px;height:30px;background:#16324A;margin:0 auto;opacity:.8"></div>`;
    root.appendChild(e); LBL.push({ e, pos, t0, t1 }); return e;
  }
  const sub = (t) => `<div style="font-weight:600;font-size:21px;letter-spacing:.01em;color:#2B5C7A;margin-top:1px">${t}</div>`;
  label("PULAU HANS", new THREE.Vector3(0, 6, 0), a("s2:Kanada"), a("s3:Hans") + 0.6);
  label("SELAT NARES", new THREE.Vector3(XM * 0.5, 3, -230), a("s2:Nares"), K.s3 + 0.5, "background:rgba(232,244,250,.85)");
  label("KANADA" + sub("Pulau Ellesmere"), new THREE.Vector3(CW - 40, 40, -150), a("s2:Kanada"), K.s3 + 1, "color:#D52B1E");
  label("GREENLAND" + sub("wilayah Kerajaan Denmark"), new THREE.Vector3(CE + 40, 40, -150), a("s2:Greenland"), K.s3 + 1, "color:#C8102E");
  label("35 km", new THREE.Vector3(XM, 3, GZ), a("s2:35") + 0.4, K.s3 + 0.3, "font-size:36px");
  label("perairan Kanada", new THREE.Vector3(CW + 80, 2, -40), a("s2:perairan") + 0.2, K.s3 + 0.6, "font-size:24px;color:#D52B1E");
  label("perairan Denmark", new THREE.Vector3(CE - 80, 2, -40), a("s2:kedua") + 0.1, K.s3 + 0.6, "font-size:24px;color:#8C102E");
  label("garis batas 1973", new THREE.Vector3(mlX(150), 2, 150), a("s3:batas") + 0.3, a("s3:Tapi") + 0.5, "font-size:26px");
  label("?", new THREE.Vector3(0, 4.5, 0), a("s3:titik") - 0.1, K.s4 + 0.6, "font-family:Fraunces,serif;font-size:64px;padding:0 26px;color:#D52B1E");
  label("konon", on(2.05, 1.6, 0.95), a("s4:Konon"), K.s5 - 0.2, "font-family:Fraunces,serif;font-style:italic;font-weight:700;font-size:34px");
  label("1.280 m", new THREE.Vector3(xc(-2.6), hI(xc(-2.6), -2.6) + 0.5, -2.6), a("s7:1.280") + 0.3, a("s7:paling"), "font-size:32px");
  label("KANADA", on(-3.6, 1.6, 0.6), a("s7:Kanada"), K.s8 - 0.2, "color:#D52B1E;font-size:26px");
  label("DENMARK", on(3.3, 1.9, 0.6), a("s7:Denmark"), K.s8 - 0.2, "color:#C8102E;font-size:26px");

  // ---------- state helpers ----------
  const chain = (t, ev) => { let v = ev[0][1]; for (const [te, val, d = 0.5] of ev.slice(1)) v += (val - v) * ramp(t, te, te + d); return v; };
  const B = a("s5:Begitu");
  const EV_CA = [[-9, 1], [K.s2 - 0.7, 0], [a("s5:benderanya") - 0.3, 1], [B, 0, 0.22], [a("s5:Begitu+0.45"), 1, 0.22], [a("s5:Begitu+0.9"), 0, 0.22], [a("s5:Begitu+1.35"), 1, 0.22], [K.s6 - 0.2, 0], [a("s7:Kanada") - 0.2, 1]];
  const EV_DK = [[-9, 1], [K.s2 - 0.7, 0], [a("s4:menancapkan") - 0.1, 1], [a("s5:benderanya") - 0.3, 0], [B, 1, 0.22], [a("s5:Begitu+0.45"), 0, 0.22], [a("s5:Begitu+0.9"), 1, 0.22], [a("s5:Begitu+1.35"), 0, 0.22], [a("s5:Media"), 1], [K.s6 - 0.2, 0], [a("s7:Denmark") - 0.2, 1]];
  const BOT = [
    [bottle("CA", -1.45, -0.15), [[-9, 0], [a("s1:sebotol") - 0.1, 1, 0.35], [K.s2 - 0.7, 0]]],
    [bottle("DK", 0.95, 1.1), [[-9, 0], [a("s1:sebotol") + 0.15, 1, 0.35], [K.s2 - 0.7, 0]]],
    [bottle("DK", 2.05, 1.6), [[-9, 0], [a("s4:sebotol") - 0.1, 1, 0.35], [a("s5:wiski") - 0.5, 0, 0.3]]],
    [bottle("CA", -1.5, -0.05), [[-9, 0], [a("s5:wiski") - 0.1, 1, 0.35], [K.s6 - 0.3, 0]]],
    [bottle("CA", -0.05, 1.6), [[-9, 0], [a("s8:tanpa") - 0.1, 1, 0.35]]],
    [bottle("DK", 0.5, 1.6), [[-9, 0], [a("s8:tanpa") + 0.12, 1, 0.35]]],
  ];
  const EV_SIGN = [[-9, 0], [a("s4:pesan") - 0.25, 1, 0.6], [a("s5:benderanya") - 0.3, 0]];

  // ---------- camera (one continuous path; each station keyed to a word) ----------
  const camT = track([
    [0, 4.6, 4.4, 11.5, -0.2, 2.5, 0],
    [3.6, 1.8, 3.9, 11.8, -0.2, 2.3, 0],
    [a("s1:sebotol"), -0.6, 3.1, 9.4, -0.1, 1.5, 0.4],
    [K.s2, -2.6, 5.5, 13, 0, 1.4, 0],
    [a("s2:Selat"), 0, 24, 40, 0, 0, 0],
    [a("s2:Kanada"), 0, 300, 340, 0, 0, -30],
    [a("s2:Luasnya"), 0, 760, 740, 0, 0, -60],
    [a("s2:35"), 25, 840, 800, 0, 0, -50],
    [a("s2:negara"), -15, 880, 850, 0, 0, -40],
    [a("s3:batas"), -10, 640, 700, 0, 0, 40],
    [a("s3:itu"), 0, 300, 380, 0, 0, 20],
    [a("s3:Hans"), 5, 120, 170, 0, 0, 0],
    [a("s3:titik"), 8, 46, 66, 0, 1, 0],
    [K.s4 + 1, 12, 26, 44, 3, 2, -2],
    [a("s4:Greenland"), 11, 9.5, 22, 3.5, 2.8, -1],
    [a("s4:bendera"), 6.2, 5.6, 12.5, 1.8, 3.0, 0],
    [a("s4:pesan"), 4.8, 4.2, 8.8, 1.9, 2.5, 0.9],
    [a("s4:Konon"), 3.6, 3.3, 6.6, 2.0, 2.2, 1.2],
    [a("s4:keras"), 3.0, 3.0, 5.6, 1.9, 2.1, 1.3],
    [K.s5 + 0.4, 0.5, 4.8, 12.5, -1.5, 1.8, 0],
    [a("s5:benderanya"), -5.5, 4.8, 12, -3.0, 2.6, 0],
    [a("s5:wiski"), -3.6, 2.9, 6.4, -1.8, 1.5, -0.2],
    [B, -0.6, 4.8, 12.5, -0.3, 2.2, 0],
    [a("s5:Media"), 1.8, 5.8, 14.5, 0, 2.1, 0],
    [a("s5:Tahun"), 6, 8.5, 16.5, 0, 1.6, 0],
    [K.s6, 3, 22, 18, 0, 0.4, 0],
    [a("s6:Greenland"), 1, 26, 13, 0, 0, 0.6],
    [a("s6:pembagian"), 0, 25, 11, -0.3, 0, 0.6],
    [a("s6:retakan"), -1, 21, 11, -0.3, 0, 0.2],
    [K.s7 + 0.5, -6.5, 6.4, 12.5, -0.4, 1.4, 0],
    [a("s7:meter"), -3.5, 6.8, 13.5, -0.3, 1.5, 0],
    [a("s7:Kanada"), -1.2, 4.6, 11.5, -0.3, 2.0, 0],
    [a("s7:bertetangga"), 1.8, 4.4, 11.8, -0.3, 2.1, 0],
    [a("s7:paling"), 2.8, 3.6, 13, -0.5, 5.5, -30],
    [K.s8, 2.2, 5.6, 13.5, 0, 1.9, 0.3],
    [a("s8:Menurut"), -0.8, 7.5, 17, 0, 1.8, 0.3],
    [K.dur, -4, 11.5, 24, 0, 1.6, 0],
  ]);
  const tmp = new THREE.Vector3(), tgt = new THREE.Vector3(), vp = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    const d0c = Math.hypot(c[0] - c[3], c[1] - c[4], c[2] - c[5]), kz = 1 + 0.85 * (1 - ramp(d0c, 30, 70));
    for (let j = 0; j < 3; j++) c[j] = c[3 + j] + (c[j] - c[3 + j]) * kz;
    const dd = d0c * kz;
    const drift = 0.012 * dd;
    cam.position.set(c[0] + Math.sin(t * 0.37) * drift, c[1] + Math.sin(t * 0.29 + 1) * drift * 0.6, c[2] + Math.cos(t * 0.31) * drift * 0.7);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt); cam.updateMatrixWorld();

    // sea swell
    for (let i = 0; i < sp.length; i += 3) { const x = sBase[i], z = sBase[i + 2], d = Math.hypot(x, z), amp = 0.05 + Math.min(0.9, d * 0.0025); sp[i + 1] = amp * (0.55 * Math.sin(x * 0.7 + t * 1.1) + 0.45 * Math.sin(z * 0.9 - t * 0.8 + x * 0.3)); }
    sg.attributes.position.needsUpdate = true;
    floes.forEach((F) => { const dz = t * F.sp; F.m.position.set(F.x + Math.sin(t * 0.1 + F.ph) * 0.6, 0.08 + Math.sin(t * 0.9 + F.ph) * 0.05, F.z + dz); F.m.rotation.z = Math.sin(t * 0.7 + F.ph) * 0.02; });

    // island split (2022) and rejoin with the border
    const sep = a("s6:separuh-separuh");
    const gap = 0.55 * eout(ramp(t, sep - 0.1, sep + 0.7)) * (1 - ramp(t, K.s7 - 0.9, K.s7 + 0.1));
    isl.W.position.x = -gap; isl.E.position.x = gap;
    const claim = ramp(t, a("s3:mengklaim") - 0.2, a("s3:mengklaim") + 0.2) * (1 - ramp(t, K.s4 - 0.4, K.s4 + 0.3));
    matW.emissiveIntensity = claim * 0.35 * (0.5 + 0.5 * Math.sin(t * 7));
    matE.emissiveIntensity = claim * 0.35 * (0.5 - 0.5 * Math.sin(t * 7));

    // flags
    const fv = [chain(t, EV_CA), chain(t, EV_DK)];
    [FCA, FDK].forEach((F, k) => {
      const v = fv[k]; F.G.visible = v > 0.002; F.G.position.set(F.base.x + (k ? gap : -gap), F.base.y - 3.1 * (1 - v), F.base.z);
      if (!F.G.visible) return;
      const ar = F.geo.attributes.position.array, fl = 1 + 0.6 * Math.exp(-(((t - a("s1:Bendera")) / 0.8) ** 2));
      for (let i = 0; i < ar.length; i += 3) { const x = F.b0[i]; ar[i + 2] = Math.sin(x * 3.2 - t * 5.5 + F.ph) * 0.09 * x * fl + Math.sin(x * 7 - t * 9 + F.ph) * 0.015 * x; ar[i + 1] = F.b0[i + 1] - 0.03 * x * x; }
      F.geo.attributes.position.needsUpdate = true; F.geo.computeVertexNormals();
    });

    // bottles
    const clink = a("s8:pecundang");
    BOT.forEach(([o, ev], i) => {
      const v = chain(t, ev); o.G.visible = v > 0.002; if (!o.G.visible) return;
      o.S.scale.setScalar(v * (1 + 0.22 * Math.sin(Math.PI * v)));
      if (i >= 4) { const k = Math.exp(-Math.max(0, t - clink) * 4) * Math.sin(Math.max(0, t - clink) * 18) * (t > clink - 0.25 ? 1 : 0) + (t > clink - 0.25 && t < clink ? ramp(t, clink - 0.25, clink) * 0.25 : 0); o.G.rotation.z = (i === 4 ? -1 : 1) * k * 0.6; }
    });
    const sv = chain(t, EV_SIGN); sign.visible = sv > 0.002; sign.position.set(signBase.x, signBase.y - 1.8 * (1 - sv), signBase.z);

    // helicopter
    heli.visible = t > K.s4 - 0.1 && t < K.s5 + 3.6;
    if (heli.visible) {
      const p = heliT(t), p2 = heliT(t + 0.1); heli.position.set(p[0], p[1], p[2]);
      const vx = (p2[0] - p[0]) * 10, vz = (p2[2] - p[2]) * 10, sp2 = Math.hypot(vx, vz);
      heli.rotation.y = t < K.s5 ? Math.atan2(vz, -vx) * ramp(sp2, 0.3, 2) : Math.atan2(vz, -vx) * ramp(sp2, 0.3, 2);
      heli.rotation.z = -Math.min(0.25, sp2 * 0.02);
      const spin = 1 - 0.75 * ramp(t, a("s4:mendarat") + 0.6, a("s4:mendarat") + 2.5) * (1 - ramp(t, K.s5 - 0.6, K.s5));
      rotor.rotation.y = t * 31 * spin; trotor.rotation.z = t * 45; disc.material.opacity = 0.16 * spin;
    }
    // ship
    ship.visible = t > a("s5:membalas") - 1.6 && t < a("s5:Media") + 3.4;
    if (ship.visible) { const p = shipT(t); ship.position.set(p[0], 0.05 + Math.sin(t * 1.4) * 0.04, p[2]); ship.rotation.y = Math.PI * ramp(t, a("s5:Media") - 0.2, a("s5:Media") + 0.8); ship.rotation.z = Math.sin(t * 1.2) * 0.03; }

    // pen draws the dividing line along the crack
    const pu = ramp(t, a("s6:pembagian") - 0.3, a("s6:retakan") + 0.4);
    pen.visible = t > a("s6:menandatangani") - 0.4 && t < a("s6:retakan") + 1.1;
    if (pen.visible) { const p = crack.getPointAt(Math.max(0.001, Math.min(0.999, pu))); const lift = (1 - ramp(t, a("s6:pembagian") - 0.5, a("s6:pembagian") - 0.2)) * 1.2 + ramp(t, a("s6:retakan") + 0.4, a("s6:retakan") + 1.0) * 2; pen.position.set(p.x, p.y + lift, p.z); pen.rotation.set(-0.5, 0, 0.35); }
    crackTube.visible = pu > 0; crackGeo.setDrawRange(0, Math.floor((crackN / 36) * pu) * 36);
    crackM.opacity = 0.95 * ramp(t, a("s6:pembagian") - 0.3, a("s6:pembagian")) * (1 - ramp(t, K.s7 + 1.5, K.s7 + 2.4));
    const d0 = a("s7:perbatasan"), d1 = a("s7:1.280") + 0.6;
    dots.forEach((m, i) => { const u = d0 + (d1 - d0) * (i / dots.length); const s = back(ramp(t, u, u + 0.3) / 1) ; m.visible = t > u; m.scale.setScalar(Math.max(0.001, s)); });

    // strait overlays
    const wide = ramp(t, a("s2:Kanada") - 0.5, a("s2:Kanada") + 0.5);
    const gp = eout(ramp(t, a("s2:35") - 0.1, a("s2:35") + 0.9));
    lineM.opacity = 0.95 * ramp(t, a("s2:35") - 0.2, a("s2:35")) * (1 - ramp(t, K.s3, K.s3 + 0.8));
    gBar.scale.x = Math.max(0.001, gp); gT1.position.x = XM + (CW - XM) * gp; gT2.position.x = XM + (CE - XM) * gp;
    const zc = eout(ramp(t, a("s2:perairan") - 0.2, a("s2:perairan") + 0.9)), zd = eout(ramp(t, a("s2:kedua") - 0.2, a("s2:kedua") + 0.9)), zo = 1 - ramp(t, a("s3:batas"), a("s3:itu") + 0.5);
    zCA.material.opacity = 0.7 * zc * zo; zCA.scale.x = Math.max(0.001, zc); zCA.position.x = CW - 60 + ((ZW + 60) / 2) * zc;
    zDK.material.opacity = 0.7 * zd * zo; zDK.scale.x = Math.max(0.001, zd); zDK.position.x = CE + 60 - ((ZW + 60) / 2) * zd;
    const lp = ramp(t, a("s3:batas") - 0.4, a("s3:itu") + 1.2), lFade = 1 - ramp(t, K.s4 + 0.5, K.s4 + 1.6);
    dashes.forEach(({ d, z }) => { const u = 1 - z / 900; d.material.opacity = 0.95 * lFade * clamp01((lp - u) * 30); });
    ring.material.opacity = 0.85 * wide * (1 - ramp(t, a("s3:Hans"), a("s3:Hans") + 1)) * (0.6 + 0.4 * Math.sin(t * 4));
    ring.scale.setScalar(1 + 0.25 * Math.sin(t * 4));

    // falling snow around the lens
    const spos = snow.pos, sc = Math.max(0.3, Math.min(30, dd * 0.11));
    snowSeed.forEach(([x0, y0, z0, phs, s], i) => {
      const y = ((y0 + 1 - t * s * 0.12) % 2 + 2) % 2 - 1;
      tmp.set((x0 * 2.0 + Math.sin(t * s + phs) * 0.15) * sc, y * 3.4 * sc, -(1.4 + z0 * 7) * sc).applyMatrix4(cam.matrixWorld);
      spos[i * 3] = tmp.x; spos[i * 3 + 1] = tmp.y; spos[i * 3 + 2] = tmp.z;
    });
    snow.commit(); snow.m.size = 0.03 * sc;

    // labels stay between the visible panel and the caption band
    let pb = 210;
    for (const p of panels) if (p.style.visibility === "visible" && +(p.style.opacity || 0) > 0.05) pb = Math.max(pb, p.offsetTop + p.offsetHeight);
    for (const l of LBL) {
      let o = ramp(t, l.t0, l.t0 + 0.35) * (1 - ramp(t, l.t1 - 0.3, l.t1));
      if (o <= 0.001) { l.e.style.opacity = 0; continue; }
      vp.copy(l.pos);
      if (l.pos.y < 6 && Math.abs(l.pos.x) < 9 && t > K.s6) vp.x += l.pos.x < 0 ? -gap : gap;
      tmp.copy(vp).project(cam);
      if (tmp.z > 1) o = 0;
      const sx = (tmp.x + 1) * 540, sy = (1 - tmp.y) * 960, hh = l.e.offsetHeight || 80, ww = l.e.offsetWidth || 200;
      o *= ramp(sy - hh, pb + 6, pb + 40) * (1 - ramp(sy, 1240, 1275)) * ramp(sx - ww / 2, 20, 50) * (1 - ramp(sx + ww / 2, 1030, 1060));
      l.e.style.opacity = o.toFixed(3);
      l.e.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    }
    comp.render();
  };
}
