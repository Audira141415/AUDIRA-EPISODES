// EP05 ALTIPLANO SURVEY: a stylised elevation point cloud of the central Andes (procedural relief, not survey data) flown like a drone.
// Map acts first (lake, coast, war, rail, rivers), then two set pieces (Dia del Mar parade, ICJ scale), then the boat at dusk.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std, box, cyl, stage, pts, envStrips } from "./lib3d.js";
import { GEO } from "./geo.js";

const S = 4, HS = 0.55;
const X = (lon) => (lon + 67) * S, Z = (lat) => -(lat + 18) * S;
const LY = 3.812 * HS;
const RED = 0xd52b1e, YEL = 0xf9e300, GRN = 0x007934, SLATE = 0x7e9cc4, GOLD = 0xf2c14e, PAC = 0x0a3d6b;
const PARADE = new THREE.Vector3(300, 0, 0), COURT = new THREE.Vector3(600, 0, 0);
const R0 = [-82, -28, -56, -8];

// ---------- relief ----------
const lerpT = (tab, v) => { if (v >= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (v >= tab[i][0]) { const [a, x] = tab[i - 1], [b, y] = tab[i]; return y + (x - y) * (v - b) / (a - b); } return tab[tab.length - 1][1]; };
const AXIS = [[-8, -77.6], [-10, -76.6], [-12, -75.4], [-13.5, -73.6], [-15, -71.0], [-16, -69.6], [-17, -68.6], [-18, -68.0], [-20, -67.4], [-22, -67.2], [-24, -67.3], [-26, -67.8], [-28, -68.6]];
const WID = [[-8, 0.7], [-12, 0.8], [-14, 1.0], [-16, 1.5], [-18, 1.6], [-20, 1.6], [-22, 1.4], [-24, 1.2], [-26, 0.9], [-28, 0.7]];
const COAST = [[-8, -79.3], [-10, -78.2], [-12, -77.1], [-14, -76.3], [-15.5, -75.0], [-17, -72.0], [-18.5, -70.35], [-20, -70.15], [-23, -70.5], [-25, -70.5], [-28, -71.2]];
const hash = (i, j) => { let h = Math.imul(i, 374761393) + Math.imul(j, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vn(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function ridged(x, y) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < 5; k++) { s += a * (1 - Math.abs(vn(x * f, y * f) * 2 - 1)); f *= 2.03; a *= 0.5; } return s; }
const g = (u, c, s) => Math.exp(-(((u - c) / s) ** 2));
function elev(lon, lat) {
  const A = lerpT(AXIS, lat), W = lerpT(WID, lat), u = (lon - A) / W;
  const n = ridged(lon * 2.2, lat * 2.2), n2 = vn(lon * 0.7 + 5, lat * 0.7);
  const pl = 3.72 + 0.3 * (n2 - 0.5), rw = 4.3 + 1.7 * n, re = 4.2 + 1.9 * n;
  let h;
  if (u < -1.15) { const dW = A - 1.15 * W - lon; h = rw * Math.exp(-dW / 0.45); const c = lerpT(COAST, lat); h += (0.6 + 0.9 * n) * g(lon, c + 0.3, 0.25) + 0.3 * n2; }
  else if (u > 1.15) { const dE = lon - (A + 1.15 * W); h = 0.22 + (re - 0.22) * Math.exp(-dE / 0.75) + 0.5 * vn(lon * 1.3, lat * 1.3) * Math.exp(-dE / 2.2); }
  else h = pl + (rw - pl) * g(u, -1.12, 0.3) + (re - pl) * g(u, 1.12, 0.32) + (n - 0.5) * 0.5;
  return Math.max(0.05, h);
}
const GRAD = [[0, 0x0c4f52], [0.6, 0x177f78], [1.6, 0x4b8d72], [2.8, 0xb39461], [3.9, 0xd8c08c], [4.8, 0xc9bfae], [5.5, 0xf4f6f8]];
function ecol(h, out) { let i = 1; while (i < GRAD.length - 1 && h > GRAD[i][0]) i++; const [a, ca] = GRAD[i - 1], [b, cb] = GRAD[i]; const k = clamp01((h - a) / (b - a)); const A = new THREE.Color(ca), B = new THREE.Color(cb); out.copy(A).lerp(B, k); return out; }

// Lake Titicaca outline, approximate (lon, lat).
const LAKE = [[-69.95, -15.25], [-69.55, -15.2], [-69.2, -15.45], [-68.95, -15.75], [-68.75, -16.05], [-68.65, -16.3], [-68.85, -16.55], [-69.05, -16.45], [-69.2, -16.2], [-69.6, -16.2], [-69.9, -15.95], [-70.05, -15.7], [-70.0, -15.4]];
const RIVERS = {
  mamore: [[-64.6, -17.4], [-64.9, -16.2], [-65.0, -14.8], [-65.2, -13.3], [-65.3, -12.0], [-65.35, -10.8], [-65.38, -10.45]],
  beni: [[-67.5, -15.3], [-67.0, -14.4], [-66.6, -13.1], [-66.2, -11.9], [-66.06, -11.0], [-65.6, -10.6], [-65.38, -10.45]],
  madre: [[-69.2, -12.6], [-68.0, -12.0], [-67.0, -11.4], [-66.06, -11.0]],
  itenez: [[-60.2, -15.0], [-61.5, -13.6], [-62.8, -12.9], [-64.0, -12.4], [-65.0, -11.9], [-65.3, -12.0]],
  madeira: [[-65.38, -10.45], [-65.0, -9.6], [-64.4, -8.8], [-63.9, -8.0]],
};
const RAIL = [[-70.32, -18.48], [-70.0, -18.3], [-69.75, -18.0], [-69.5, -17.62], [-69.0, -17.2], [-68.65, -16.95], [-68.35, -16.65], [-68.15, -16.5]];
const v3 = (lon, lat, dy = 0.06) => new THREE.Vector3(X(lon), elev(lon, lat) * HS + dy, Z(lat));

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x05080c, fog: 0.0018, exp: 1.15, bloom: [0.42, 0.5, 0.82], fov: 38 });
  cam.far = 1600; cam.near = 0.05; cam.updateProjectionMatrix();
  envStrips(r, scene, [[24, 4, 0xffe2b0, 4, 0, 14, 8], [4, 22, 0x7fc8ff, 2.4, -14, 2, 6], [30, 3, 0xffffff, 1.2, 0, -8, 8]]);
  const rnd = mulberry(505);
  const hemi = new THREE.HemisphereLight(0x8fb4d0, 0x1a1410, 1.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.position.set(-40, 60, -20); scene.add(sun); sun.castShadow = false;
  const a = (k) => AT[k];

  // ---------- country masks ----------
  const PPD = 40, LON0 = -95, LAT1 = -6, MW = 39 * PPD, MH = 24 * PPD;
  const ids = { Peru: 1, Bolivia: 2, Chile: 3, Argentina: 4, Brazil: 5, Paraguay: 6 };
  const idMap = new Uint8Array(MW * MH);
  const mc = document.createElement("canvas"); mc.width = MW; mc.height = MH;
  const mx = mc.getContext("2d", { willReadFrequently: true });
  const toPx = (lon, lat) => [(lon - LON0) * PPD, (LAT1 - lat) * PPD];
  for (const c of GEO) {
    mx.clearRect(0, 0, MW, MH); mx.fillStyle = "#fff"; mx.beginPath();
    for (const ring of c.rings) ring.forEach(([lo, la], i) => { const [x, y] = toPx(lo, la); i ? mx.lineTo(x, y) : mx.moveTo(x, y); });
    mx.fill("evenodd");
    const d = mx.getImageData(0, 0, MW, MH).data, id = ids[c.name] || 0;
    for (let i = 0; i < MW * MH; i++) if (d[i * 4 + 3] > 127) idMap[i] = id;
  }
  const idAt = (lon, lat) => { const x = Math.floor((lon - LON0) * PPD), y = Math.floor((LAT1 - lat) * PPD); return x < 0 || y < 0 || x >= MW || y >= MH ? 0 : idMap[y * MW + x]; };
  const lakePath = new Path2D(); LAKE.forEach(([lo, la], i) => { const [x, y] = toPx(lo, la); i ? lakePath.lineTo(x, y) : lakePath.moveTo(x, y); }); lakePath.closePath();
  const inLake = (lon, lat) => lon > -70.1 && lon < -68.6 && lat < -15.15 && lat > -16.6 && mx.isPointInPath(lakePath, ...toPx(lon, lat));

  // ---------- point cloud ----------
  const P = [], C = [], ID = [], FN = [];
  const col = new THREE.Color();
  const L = new THREE.Vector3(-0.55, 0.72, -0.42).normalize();
  const FINE = [-70.6, -18.9, -67.4, -15.0];
  const inFine = (lo, la) => lo > FINE[0] && lo < FINE[2] && la > FINE[1] && la < FINE[3];
  function add(lon, lat, fine) {
    let id = idAt(lon, lat);
    if (!id || inLake(lon, lat)) return;
    if (id === 3 && lat < -21.5 && lat > -25.5 && lon < -66.8) id = 7;
    const e = 0.02, h = elev(lon, lat);
    const dx = (elev(lon + e, lat) - elev(lon - e, lat)) * HS / (2 * e * S), dz = (elev(lon, lat - e) - elev(lon, lat + e)) * HS / (2 * e * S);
    const nrm = new THREE.Vector3(-dx * 2.2, 1, -dz * 2.2).normalize();
    const sh = 0.42 + 0.8 * Math.max(0, nrm.dot(L));
    const edge = clamp01(Math.min(lon - R0[0], R0[2] - lon, lat - R0[1], R0[3] - lat) / 1.6);
    ecol(h, col).multiplyScalar(sh * (0.15 + 0.85 * edge));
    P.push(X(lon), h * HS, Z(lat)); C.push(col.r, col.g, col.b); ID.push(id); FN.push(fine ? 1 : 0, rnd());
  }
  for (let la = R0[1]; la < R0[3]; la += 0.06) for (let lo = R0[0]; lo < R0[2]; lo += 0.06) { add(lo + rnd() * 0.06, la + rnd() * 0.06, 0); }
  for (let la = FINE[1]; la < FINE[3]; la += 0.013) for (let lo = FINE[0]; lo < FINE[2]; lo += 0.013) add(lo + rnd() * 0.013, la + rnd() * 0.013, 1);
  const cg = new THREE.BufferGeometry();
  cg.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  cg.setAttribute("aCol", new THREE.Float32BufferAttribute(C, 3));
  cg.setAttribute("aId", new THREE.Float32BufferAttribute(ID, 1)); cg.setAttribute("aFn", new THREE.Float32BufferAttribute(FN, 2));
  const U = { uScan: { value: 0 }, uBol: { value: 0 }, uLit: { value: 0 }, uLitC: { value: 0 }, uChile: { value: 0 }, uAlly: { value: 0 }, uDusk: { value: 0 }, uK: { value: 300 }, uDim: { value: 1 } };
  const cloudM = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: true,
    vertexShader: `attribute vec3 aCol;attribute float aId;attribute vec2 aFn;uniform float uScan,uBol,uLit,uLitC,uChile,uAlly,uDusk,uK,uDim;varying vec3 vC;
      bool is(float k){return abs(aId-k)<.5;}
      void main(){vec3 p=position;vec3 c=aCol;
        bool bol=is(2.),lit=is(7.),chi=is(3.)||lit,per=is(1.);
        if(bol){c=mix(c,c*vec3(1.25,1.15,.75)+vec3(.05,.04,0.),uBol);} else {c*=1.-.35*uBol;}
        if(lit){vec3 gold=vec3(.98,.74,.25);c=mix(c,gold*(.55+.6*length(aCol)),uLit*(1.-uLitC));p.y+=sin(3.14159*uLitC)*2.6;p.x-=sin(3.14159*uLitC)*1.2;}
        if(chi){c=mix(c,vec3(.42,.55,.74)*(.5+.8*length(aCol)),.55*uChile);}
        if(per||bol){c=mix(c,vec3(.84,.17,.12)*(.5+.8*length(aCol)),.42*uAlly);}
        float d=abs(p.z-uScan);c+=vec3(.25,.85,1.)*exp(-d*d*.8)*.55;
        c=mix(c,c*vec3(1.25,.72,.5),uDusk);
        vC=c*uDim;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float sz=uK/-mv.z;gl_PointSize=clamp(sz,1.6,5.5);if(aFn.x>.5){float keep=clamp((15.-300./sz)/8.,0.,1.);if(aFn.y>keep)gl_Position=vec4(9.,9.,9.,1.);gl_PointSize=clamp(sz*.5,1.2,4.);}}`,
    fragmentShader: `varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;float r=dot(q,q);if(r>.25)discard;gl_FragColor=vec4(vC,1.);}`,
  });
  const cloud = new THREE.Points(cg, cloudM); cloud.frustumCulled = false; scene.add(cloud);

  // ---------- ocean ----------
  const oc = document.createElement("canvas"); oc.width = MW / 2; oc.height = MH / 2;
  { const o = oc.getContext("2d"), im = o.createImageData(oc.width, oc.height);
    for (let y = 0; y < oc.height; y++) for (let x = 0; x < oc.width; x++) {
      const land = idMap[(y * 2) * MW + x * 2] ? 1 : 0;
      const ed = clamp01(Math.min(x, y, oc.width - x, oc.height - y) / 70);
      const v = (1 - land) * ed * 255, i = (y * oc.width + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
    } o.putImageData(im, 0, 0); }
  const oTex = new THREE.CanvasTexture(oc);
  const OW = 39 * S, OH = 24 * S;
  const oGeo = new THREE.PlaneGeometry(OW, OH, 220, 136);
  const oBase = oGeo.attributes.position.array.slice();
  const ocean = new THREE.Mesh(oGeo, new THREE.MeshStandardMaterial({ color: PAC, emissive: 0x041c34, roughness: 0.32, metalness: 0.2, alphaMap: oTex, transparent: true, depthWrite: false }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.set(X(LON0) + OW / 2, 0, Z(LAT1) + OH / 2); scene.add(ocean);

  // ---------- borders ----------
  const lineM = new THREE.LineBasicMaterial({ color: 0xcfe6f0, transparent: true, opacity: 0.32 });
  const bolM = new THREE.LineBasicMaterial({ color: YEL, transparent: true, opacity: 0 });
  const inR = (lo, la) => lo > R0[0] + 0.2 && lo < R0[2] - 0.2 && la > R0[1] + 0.2 && la < R0[3] - 0.2;
  for (const c of GEO) for (const ring of c.rings) {
    let run = [];
    const flush = () => { if (run.length > 1) { const geo = new THREE.BufferGeometry().setFromPoints(run); const ln = new THREE.Line(geo, c.name === "Bolivia" ? bolM : lineM); scene.add(ln); } run = []; };
    for (const [lo, la] of ring) { if (inR(lo, la)) run.push(v3(lo, la, 0.12)); else flush(); }
    flush();
  }

  // ---------- 1825 coast segment (Litoral, approximate) ----------
  const chile = GEO.find((c) => c.name === "Chile");
  let coastPts = [];
  for (const ring of chile.rings) for (const [lo, la] of ring) if (la < -21.5 && la > -25.5 && lo < -69.9) coastPts.push([lo, la]);
  coastPts.sort((p, q) => q[1] - p[1]);
  coastPts = coastPts.filter((p, i) => i % 2 === 0);
  const coastCurve = new THREE.CatmullRomCurve3(coastPts.map(([lo, la]) => new THREE.Vector3(X(lo), 0.35, Z(la))));
  const coastM = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0 });
  const coastTube = new THREE.Mesh(new THREE.TubeGeometry(coastCurve, 160, 0.22, 6), coastM); scene.add(coastTube);
  // band edges: dashed outline north, south and inland
  const bandPts = [[-70.2, -21.5], [-68.4, -21.5], [-68.2, -23.0], [-68.0, -24.3], [-68.6, -25.5], [-70.6, -25.5]].map(([lo, la]) => v3(lo, la, 0.25));
  const bandM = new THREE.LineDashedMaterial({ color: GOLD, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0 });
  const band = new THREE.Line(new THREE.BufferGeometry().setFromPoints(bandPts), bandM); band.computeLineDistances(); scene.add(band);

  // ---------- 1879 arrows (Chile) ----------
  function ribbon(path, w, y, color) {
    const curve = new THREE.CatmullRomCurve3(path.map(([lo, la]) => new THREE.Vector3(X(lo), y, Z(la))));
    const N = 140, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = curve.getPointAt(u), tg = curve.getTangentAt(u), nx = -tg.z, nz = tg.x, ww = w * (0.55 + 0.45 * u);
      pos.push(p.x + nx * ww, p.y, p.z + nz * ww, p.x - nx * ww, p.y, p.z - nz * ww);
      if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, m); scene.add(mesh);
    const head = new THREE.Mesh(new THREE.ConeGeometry(w * 2.2, w * 4.2, 3), m); head.scale.y = 1; scene.add(head);
    return { curve, mesh, head, N, m, w };
  }
  const ARROWS = [
    { r: ribbon([[-70.3, -23.6], [-69.7, -23.0], [-69.1, -22.5]], 0.55, 4.0, SLATE), a: "s3:memicu", b: "s3:Pasifik" },
    { r: ribbon([[-70.25, -23.4], [-69.95, -21.6], [-70.05, -20.2], [-70.3, -18.8]], 0.7, 3.4, SLATE), a: "s3:Bolivia", b: "s3:Chile" },
    { r: ribbon([[-72.8, -27.0], [-71.8, -24.0], [-71.3, -21.0], [-71.2, -19.0], [-72.4, -17.3], [-75.6, -14.0], [-77.4, -12.3]], 0.85, 0.5, SLATE), a: "s3:melawan", b: "s3:menang" },
  ];

  // ---------- 1904 rail ----------
  const railCurve = new THREE.CatmullRomCurve3(RAIL.map(([lo, la]) => v3(lo, la, 0.14)));
  const railM = new THREE.MeshBasicMaterial({ color: GOLD });
  const railGeo = new THREE.TubeGeometry(railCurve, 200, 0.06, 5); const rail = new THREE.Mesh(railGeo, railM); scene.add(rail);
  const railIdx = railGeo.index.count;
  const train = new THREE.Group(); scene.add(train);
  const cars = [0, 1, 2].map((i) => { const c = box(0.36, 0.18, 0.16, std(i ? 0x9aa6b4 : 0xd52b1e, 0.5, 0.3)); train.add(c); return c; });
  const headL = new THREE.PointLight(0xffd88a, 0, 4, 1.5); scene.add(headL);
  const port = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0 }));
  port.rotation.x = -Math.PI / 2; port.position.copy(v3(-70.32, -18.48, 0.15)); scene.add(port);

  // ---------- 1963 rivers ----------
  const riverM = new THREE.MeshBasicMaterial({ color: 0x46e6f2, transparent: true, opacity: 0.95 });
  const rivers = Object.values(RIVERS).map((path) => { const curve = new THREE.CatmullRomCurve3(path.map(([lo, la]) => v3(lo, la, 0.12))); const geo = new THREE.TubeGeometry(curve, 140, 0.13, 5); const m = new THREE.Mesh(geo, riverM); scene.add(m); return { curve, geo, n: geo.index.count }; });
  const flow = pts(scene, 360, { color: 0xbff8ff, size: 0.32 });
  const flowSeed = Array.from({ length: 360 }, () => [rnd(), 0.025 + rnd() * 0.03, Math.floor(rnd() * rivers.length)]);

  // ---------- boats ----------
  const flagTex = canvasTex(96, 64, (x, w, h) => { x.fillStyle = "#D52B1E"; x.fillRect(0, 0, w, h / 3); x.fillStyle = "#F9E300"; x.fillRect(0, h / 3, w, h / 3 + 1); x.fillStyle = "#007934"; x.fillRect(0, (2 * h) / 3, w, h / 3); });
  function makeBoat() {
    const G = new THREE.Group();
    const hullM = std(0x6f7c88, 0.5, 0.45), white = std(0xe9edf0, 0.45, 0.1), dark = std(0x10161c, 0.3, 0.4);
    box(0.42, 0.07, 0.13, hullM, 0, 0.035, 0, G);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.16, 4), hullM); bow.rotation.set(0, Math.PI / 4, Math.PI / 2); bow.scale.set(1, 1, 0.9); bow.position.set(-0.29, 0.035, 0); G.add(bow);
    box(0.44, 0.012, 0.135, std(0xe9edf0, 0.4), 0, 0.072, 0, G);
    box(0.15, 0.075, 0.095, white, 0.04, 0.11, 0, G);
    box(0.152, 0.022, 0.097, dark, 0.04, 0.128, 0, G);
    box(0.06, 0.05, 0.07, white, 0.04, 0.17, 0, G);
    cyl(0.004, 0.004, 0.17, 6, dark, 0.06, 0.27, 0, G);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.066), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.8, emissive: 0x222222, emissiveMap: flagTex }));
    fl.position.set(0.112, 0.32, 0); G.add(fl);
    const nl = (c, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), new THREE.MeshBasicMaterial({ color: c })); m.position.set(-0.02, 0.15, z); G.add(m); };
    nl(0xff3030, -0.05); nl(0x30ff70, 0.05);
    return { G, fl };
  }
  const hero = makeBoat(); scene.add(hero.G);
  const bx = (t) => X(-69.05) - 0.025 * t, bz = Z(-15.85);
  const wake = pts(scene, 160, { color: 0xd8fbff, size: 0.02, opacity: 0.85 });
  const wakeSeed = Array.from({ length: 160 }, () => [rnd(), rnd() > 0.5 ? 1 : -1, rnd()]);
  const rboats = [0, 1, 2, 3].map(() => { const b = makeBoat(); b.G.scale.setScalar(2.4); scene.add(b.G); return b; });
  const RB = [[0, 0.15, 0.04], [1, 0.3, 0.035], [3, 0.05, 0.03], [2, 0.6, -0.03]];

  // ---------- lake ----------
  const lakeShape = new THREE.Shape(LAKE.map(([lo, la]) => new THREE.Vector2(X(lo), -Z(la))));
  const LU = { uT: { value: 0 }, uDusk: { value: 0 }, uGlow: { value: 1 } };
  const lakeM = new THREE.ShaderMaterial({
    uniforms: LU, transparent: true,
    vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform float uT,uDusk,uGlow;varying vec3 vW;void main(){
      float r=sin(vW.x*9.+uT*1.3)*sin(vW.z*7.-uT*.9)*.5+.5;float f=sin(vW.x*42.+vW.z*13.+uT*2.2)*.5+.5;
      vec3 deep=vec3(.004,.035,.07),glow=vec3(.06,.42,.52);vec3 c=mix(deep,glow,(.07+.16*r+.08*f)*uGlow);c+=vec3(.5,.9,1.)*pow(f,12.)*.25;
      vec3 dusk=mix(vec3(.12,.05,.09),vec3(1.,.48,.2),pow(f*r,1.5)*.9+.12);c=mix(c,dusk,uDusk);
      gl_FragColor=vec4(c,.94);}`,
  });
  const lake = new THREE.Mesh(new THREE.ShapeGeometry(lakeShape, 24), lakeM); lake.rotation.x = -Math.PI / 2; lake.position.y = LY; scene.add(lake);
  // altitude gauge: sea level ring and a vertical rule up to the lake surface
  const gx = X(-69.3), gz = Z(-15.95);
  const gaugeM = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false });
  const gp = [new THREE.Vector3(gx, 0, gz), new THREE.Vector3(gx, LY, gz)];
  for (let i = 0; i <= 8; i++) { const y = (LY * i) / 8; gp.push(new THREE.Vector3(gx, y, gz), new THREE.Vector3(gx + 0.16, y, gz)); }
  const gauge = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([gp[0], gp[1], ...gp.slice(2)]), gaugeM); scene.add(gauge);
  const seaRingM = new THREE.MeshBasicMaterial({ color: 0x5fb4ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false });
  const seaRing = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.53, 48), seaRingM); seaRing.rotation.x = -Math.PI / 2; seaRing.position.set(gx, 0, gz); scene.add(seaRing);
  // hook dashed line: from the lake to the nearest coast
  const hookM = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.35, gapSize: 0.3, transparent: true, opacity: 0 });
  const hookLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(bx(0), LY + 0.4, bz), new THREE.Vector3(X(-70.3), 1.2, Z(-18.5))]), hookM); hookLine.computeLineDistances(); scene.add(hookLine);

  // dusk glow far west
  const duskTex = canvasTex(8, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.55, "rgba(120,40,60,.35)"); gr.addColorStop(0.78, "rgba(255,120,60,.9)"); gr.addColorStop(0.86, "rgba(255,190,110,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
  const duskM = new THREE.MeshBasicMaterial({ map: duskTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const dusk = new THREE.Mesh(new THREE.PlaneGeometry(900, 70), duskM); dusk.rotation.y = Math.PI / 2; dusk.position.set(-260, 8, bz); scene.add(dusk);
  const sunD = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0, fog: false })); sunD.rotation.y = Math.PI / 2; sunD.position.set(-255, 6.5, bz + 2); scene.add(sunD);

  // ---------- parade set (Dia del Mar, La Paz) ----------
  const plazaTex = canvasTex(512, 512, (x, w, h) => { x.fillStyle = "#1a1d22"; x.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 900; i++) { const v = 22 + q() * 18; x.fillStyle = `rgb(${v},${v + 2},${v + 5})`; x.fillRect(q() * w, q() * h, 4 + q() * 30, 3 + q() * 8); } x.strokeStyle = "rgba(120,200,210,.35)"; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); } }, [10, 5]);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(90, 45), new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.7, metalness: 0.15 }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.copy(PARADE); scene.add(plaza);
  const winTex = canvasTex(128, 128, (x, w, h) => { x.fillStyle = "#2a2622"; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { x.fillStyle = (i + j) % 3 ? "#e8b870" : "#3a3028"; x.fillRect(10 + i * 30, 12 + j * 40, 16, 26); } }, [2, 1]);
  for (let i = 0; i < 9; i++) { const h = 4 + ((i * 37) % 5) * 0.8; const b = box(8.6, h, 3, new THREE.MeshStandardMaterial({ color: 0x8a7c6a, map: winTex, roughness: 0.8, emissive: 0x3a2a14, emissiveMap: winTex, emissiveIntensity: 0.25 }), PARADE.x - 38 + i * 9.2, h / 2, PARADE.z - 17); scene.add(b); }
  // Illimani as its own point cloud behind the city
  { const mp = [], mcl = []; const q = mulberry(77);
    for (let i = 0; i < 26000; i++) { const x = (q() - 0.5) * 300, z = -150 - q() * 60; const hh = 62 * Math.exp(-(((x - 10) / 34) ** 2)) + 20 * Math.exp(-(((x + 70) / 40) ** 2)) + 18 * Math.exp(-(((x - 90) / 30) ** 2)) + 6 * vn(x * 0.08, z * 0.08); const y = hh * (0.2 + 0.8 * q() ** 0.25); if (q() > 0.6 && y < hh * 0.6) continue; ecol((y / 62) * 6.2, col).multiplyScalar(0.55 + 0.45 * q()); mp.push(PARADE.x + x, y, z); mcl.push(col.r, col.g, col.b); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(mp, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(mcl, 3));
    const pm = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, vertexColors: true, fog: false })); scene.add(pm); }
  const skin = std(0x7a4e33, 0.7), uni = std(0xf2f2ee, 0.55), navy = std(0x1b2a44, 0.6), blk = std(0x111111, 0.4, 0.3);
  function sailor() {
    const G = new THREE.Group();
    const limb = (x, y, len, w, mat) => { const pv = new THREE.Group(); pv.position.set(x, y, 0); G.add(pv); const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, w), mat); m.position.y = -len / 2; pv.add(m); return pv; };
    const legL = limb(-0.13, 0.95, 0.92, 0.17, uni), legR = limb(0.13, 0.95, 0.92, 0.17, uni);
    box(0.52, 0.66, 0.3, uni, 0, 1.3, 0, G); box(0.53, 0.08, 0.31, blk, 0, 0.99, 0, G);
    box(0.3, 0.12, 0.05, navy, 0, 1.56, 0.15, G);
    const armL = limb(-0.33, 1.6, 0.66, 0.13, uni), armR = limb(0.33, 1.6, 0.66, 0.13, uni);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skin); hd.position.y = 1.82; G.add(hd);
    cyl(0.19, 0.17, 0.09, 16, uni, 0, 1.97, 0, G); cyl(0.17, 0.17, 0.02, 16, blk, 0, 1.925, 0, G);
    return { G, legL, legR, armL, armR };
  }
  const troops = [];
  for (let row = 0; row < 6; row++) for (let c = 0; c < 7; c++) { const s = sailor(); s.G.rotation.y = Math.PI / 2; scene.add(s.G); troops.push({ s, row, c }); }
  const flagGeo = () => new THREE.PlaneGeometry(1.5, 1.0, 14, 6);
  const flags = [];
  const flagM = new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.75, emissive: 0x333333, emissiveMap: flagTex });
  const poleM = std(0xcfd3d6, 0.3, 0.8);
  function flag(x, y, z, scale) { const G = new THREE.Group(); const pole = cyl(0.03, 0.03, 3.2 * scale, 8, poleM, 0, 1.6 * scale, 0, G); const geo = flagGeo(); const m = new THREE.Mesh(geo, flagM); m.scale.setScalar(scale); m.position.set(0.75 * scale, 2.75 * scale, 0); G.add(m); G.position.set(x, y, z); scene.add(G); const f = { G, geo, base: geo.attributes.position.array.slice(), ph: rnd() * 6 }; flags.push(f); return f; }
  for (let i = 0; i < 7; i++) flag(PARADE.x - 27 + i * 9, 0, PARADE.z - 12.5, 1.4);
  const bearers = [flag(0, 0, 0, 1), flag(0, 0, 0, 1)];

  // ---------- court set (ICJ) ----------
  const goldM = std(0xd8b25a, 0.22, 0.95);
  const courtFloor = new THREE.Mesh(new THREE.CircleGeometry(22, 64), new THREE.MeshStandardMaterial({ color: 0x0b0e13, roughness: 0.25, metalness: 0.6 }));
  courtFloor.rotation.x = -Math.PI / 2; courtFloor.position.copy(COURT); scene.add(courtFloor);
  for (let i = 1; i < 6; i++) { const rr = new THREE.Mesh(new THREE.RingGeometry(i * 3.4, i * 3.4 + 0.04, 96), new THREE.MeshBasicMaterial({ color: 0x3a4d5c, transparent: true, opacity: 0.6 })); rr.rotation.x = -Math.PI / 2; rr.position.set(COURT.x, 0.01, COURT.z); scene.add(rr); }
  const scale = new THREE.Group(); scale.position.copy(COURT); scene.add(scale);
  cyl(0.9, 1.1, 0.25, 32, goldM, 0, 0.12, 0, scale); cyl(0.09, 0.12, 3.6, 16, goldM, 0, 1.9, 0, scale);
  const beam = new THREE.Group(); beam.position.y = 3.75; scale.add(beam);
  box(3.6, 0.1, 0.12, goldM, 0, 0, 0, beam); cyl(0.16, 0.16, 0.2, 16, goldM, 0, 0.05, 0, beam).rotation.x = Math.PI / 2;
  const pans = [-1, 1].map((sd) => { const hang = new THREE.Group(); hang.position.set(sd * 1.7, 0, 0); beam.add(hang); const chainM = new THREE.LineBasicMaterial({ color: 0xd8b25a }); hang.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.5, -1.5, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, -1.5, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1.5, 0.5)]), chainM)); const pan = cyl(0.62, 0.42, 0.12, 32, goldM, 0, -1.55, 0, hang); return { hang, pan }; });
  const judges = [];
  for (let i = 0; i < 12; i++) { const ang = -1.15 + (2.3 * i) / 11, R = 8.5; const m = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.35, metalness: 0.4, emissive: 0xffa04a, emissiveIntensity: 0 }); const j = box(0.55, 3.8, 0.55, m, COURT.x + Math.sin(ang) * R, 1.9, COURT.z - Math.cos(ang) * R); scene.add(j); judges.push(m); }
  const gavel = new THREE.Group(); gavel.position.set(COURT.x + 2.6, 0, COURT.z + 1.6); scene.add(gavel);
  const woodM = std(0x5a3520, 0.5, 0.05);
  cyl(0.55, 0.6, 0.22, 32, woodM, 0, 0.11, 0, gavel);
  const arm = new THREE.Group(); arm.position.set(1.3, 0.55, 0); gavel.add(arm);
  const handle = cyl(0.05, 0.06, 1.3, 10, woodM, 0, 0, 0, arm); handle.rotation.z = Math.PI / 2; handle.position.x = -0.65;
  const ghead = cyl(0.17, 0.17, 0.62, 18, woodM, -1.3, 0, 0, arm); ghead.rotation.x = Math.PI / 2;
  cyl(0.18, 0.18, 0.05, 18, goldM, -1.3, 0, 0.26, arm).rotation.x = Math.PI / 2; cyl(0.18, 0.18, 0.05, 18, goldM, -1.3, 0, -0.26, arm).rotation.x = Math.PI / 2;
  const courtL = new THREE.PointLight(0xffe0a8, 0, 30, 1.4); courtL.position.set(COURT.x, 9, COURT.z + 3); scene.add(courtL);
  const paradeL = new THREE.PointLight(0xffe8c8, 0, 60, 1.6); paradeL.position.set(PARADE.x, 14, PARADE.z + 8); scene.add(paradeL);

  // ---------- dust in front of the lens ----------
  const dust = pts(scene, 240, { color: 0xcfe9ff, size: 0.05, opacity: 0.6 });
  const dustSeed = Array.from({ length: 240 }, () => [rnd() * 2 - 1, rnd() * 2 - 1, rnd(), rnd() * 6.28, 0.2 + rnd() * 0.5]);

  // ---------- DOM labels (projected each frame) ----------
  const root = canvas.parentNode;
  const LBL = [];
  function label(html, pos, t0, t1, style = "") {
    const e = document.createElement("div");
    e.style.cssText = `position:absolute;left:0;top:0;z-index:6;white-space:nowrap;pointer-events:none;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:34px;letter-spacing:.06em;color:#EAF4F6;text-shadow:0 2px 10px #000,0 0 3px #000;opacity:0;${style}`;
    e.innerHTML = html; root.appendChild(e); LBL.push({ e, pos, t0, t1 }); return e;
  }
  const sub = (t) => `<div style="font-family:Barlow,sans-serif;font-weight:600;font-size:24px;letter-spacing:.02em;color:#CFE3E8;margin-top:2px">${t}</div>`;
  label("SAMUDRA PASIFIK", new THREE.Vector3(X(-75.5), 0.5, Z(-21)), 4.6, a("s3:Chile"), "color:#8EC5F0;font-size:36px");
  label("BOLIVIA", v3(-64.5, -17.2, 1.2), a("s2:Bolivia"), K.s3, "font-size:58px;color:#F9E300");
  label("PERU", v3(-73.5, -11.5, 1), K.s3, K.s4, "font-size:40px");
  label("CHILE", v3(-70.0, -26.6, 1), a("s3:Chile"), K.s4, "font-size:44px;color:#A9C1E4");
  label("LIMA", v3(-77.0, -12.05, 1), a("s3:Chile#2"), K.s4, "font-size:30px;color:#A9C1E4");
  label("Pantai Bolivia" + sub("perkiraan wilayah Litoral"), v3(-69.2, -24.4, 2.5), a("s2:pantai"), a("s3:lepas") + 0.9, "font-size:36px;color:#F2C14E");
  label("ARICA" + sub("pelabuhan, kini Chile"), v3(-70.32, -18.48, 0.8), a("s4:Arica") - 0.3, K.s5, "font-size:36px;color:#F2C14E");
  label("LA PAZ", v3(-68.15, -16.5, 0.8), a("s4:La") - 0.2, K.s5, "font-size:36px");
  label("DANAU TITICACA", new THREE.Vector3(X(-69.4), LY + 0.6, Z(-15.6)), 3.0, 5.9, "font-size:34px;color:#7FF0F5");
  label("pantai terdekat:<br>wilayah Peru & Chile", new THREE.Vector3(X(-70.3), 1.4, Z(-18.5)), 4.3, 6.4, "font-size:28px;font-family:Barlow,sans-serif;font-weight:600;letter-spacing:.01em");
  label("MAMORÉ", v3(-65.0, -14.4, 0.6), a("s5:sungai") + 0.3, a("s5:Danau"), "font-size:28px;color:#7FF0F5");
  label("BENI", v3(-66.6, -13.0, 0.6), a("s5:sungai") + 0.5, a("s5:Danau"), "font-size:28px;color:#7FF0F5");
  label("ITÉNEZ", v3(-62.6, -13.0, 0.6), a("s5:sungai") + 0.7, a("s5:Danau"), "font-size:28px;color:#7FF0F5");
  label("ke Sungai Amazon ↑", v3(-64.6, -9.0, 0.6), a("s5:Amazon") - 0.3, a("s5:Danau"), "font-size:28px;color:#BFF8FF");
  label("DANAU TITICACA" + sub("3.812 m di atas permukaan laut"), new THREE.Vector3(gx, LY + 0.25, gz), a("s5:Titicaca"), K.s6 - 0.1, "font-size:38px;color:#7FF0F5");
  label("0 m · permukaan laut", new THREE.Vector3(gx + 1.1, 0, gz), a("s5:3.812") + 0.4, K.s6 - 0.1, "font-size:26px;color:#8EC5F0");
  label("BOLIVIA", new THREE.Vector3(COURT.x - 1.7, 1.05, COURT.z + 0.7), K.s7 + 0.3, K.s8, "font-size:36px;color:#F9E300");
  label("CHILE", new THREE.Vector3(COURT.x + 1.7, 1.05, COURT.z + 0.7), K.s7 + 0.3, K.s8, "font-size:36px;color:#A9C1E4");
  label("arah Samudra Pasifik ←", new THREE.Vector3(-90, 4, bz - 6), a("s8:tetap"), K.outro, "font-size:30px;color:#FFC27A");
  const cover = document.createElement("div");
  cover.style.cssText = "position:absolute;inset:0;z-index:7;background:#05080C;opacity:0;pointer-events:none"; root.appendChild(cover);

  // ---------- camera ----------
  const B0 = [bx(0), LY, bz];
  const camA = track([
    [0, B0[0] + 0.95, LY + 0.3, B0[2] + 1.2, B0[0] - 0.08, LY + 0.1, B0[2]],
    [1.8, B0[0] + 1.5, LY + 0.6, B0[2] + 2.0, B0[0] - 0.15, LY + 0.08, B0[2]],
    [3.4, B0[0] + 4.5, LY + 4, B0[2] + 7.5, B0[0] - 0.8, LY, B0[2] - 0.5],
    [5.8, -3, 50, 44, -8, 0, -3],
    [8.0, 8, 98, 84, 7, 0, -4],
    [10.6, 3, 92, 86, 2, 0, 1],
    [13.6, -6, 58, 72, -9, 0, 15],
    [15.6, -11, 78, 84, -17, 0, 5],
    [19.6, -16, 90, 84, -21, 0, -3],
    [22.8, -11, 66, 76, -15, 0, 9],
    [25.2, -6, 40, 56, -10, 0, 20],
    [27.4, -24, 24, 26, -10, 1, 0],
    [31.2, -17, 16, 17, -8, 1.5, -2],
    [34.8, -5, 20, 14, -6, 1.5, -5],
    [38.2, 1, 46, 26, 3, 0, -12],
    [41.6, 6, 52, 20, 6, 0, -18],
    [45.6, 8, 44, 12, 5, 0, -21],
    [47.8, 0, 24, 6, -4, 1, -12],
    [49.6, gx + 3.6, LY + 2.6, gz + 6.0, gx - 0.6, LY - 0.4, gz - 0.4],
    [53.2, gx + 2.6, LY + 1.8, gz + 4.8, gx - 0.9, LY - 0.4, gz - 0.4],
  ]);
  const camB = track([
    [K.s6, 2.0, 3.4, 15, -3, 3.1, -6],
    [K.s6 + 4.5, 4.5, 4.0, 16, -2.6, 3.2, -6],
    [K.s7, 6.5, 4.8, 18, -2.2, 3.3, -6],
  ]);
  const camC = track([
    [K.s7, COURT.x - 3, 6.5, 15, COURT.x, 2.8, 0],
    [K.s7 + 5, COURT.x + 2, 5.2, 14.5, COURT.x + 0.9, 2.4, 0],
    [a("s7:keluar"), COURT.x + 1.8, 5.4, 16, COURT.x + 1.2, 2.2, 0],
    [K.s8, COURT.x + 0.6, 5.2, 15.5, COURT.x + 1.2, 2.2, 0],
  ]);
  const camD = track([
    [K.s8, 2.0, 0.3, 0.22, -4, -0.12, -0.05],
    [K.s8 + 5, 2.6, 0.36, 0.3, -5, -0.12, -0.05],
    [K.dur, 4.2, 0.62, 0.55, -7, -0.1, 0],
  ]);
  const SWEEP = [K.s2, K.s3, K.s4, K.s5, a("s5:Kini"), K.s6, K.s7, K.s8, K.outro + 0.05];
  const tmp = new THREE.Vector3(), tgt = new THREE.Vector3();
  const strike1 = a("s7:keluar"), strike2 = a("s7:berunding");

  return (t) => {
    // which set are we on
    const set = t < K.s6 ? 0 : t < K.s7 ? 1 : t < K.s8 ? 2 : 3;
    let c;
    if (set === 0) { c = camA(t); const off = (bx(t) - bx(0)) * (1 - ramp(t, 3, 5.8)); c[0] += off; c[3] += off; }
    else if (set === 1) { const f = PARADE.x - 8 + (t - K.s6) * 1.35, o = camB(t); c = [f + o[0], o[1], PARADE.z + o[2], f + o[3], o[4], PARADE.z + o[5]]; }
    else if (set === 2) c = camC(t);
    else { const o = camD(t); c = [bx(t) + o[0], LY + o[1], bz + o[2], bx(t) + o[3], LY + o[4], bz + o[5]]; }
    let shake = 0;
    for (const s of [strike1, strike2]) shake += Math.exp(-(t - s) * 9) * (t > s ? 1 : 0);
    const drift = 0.02 * Math.min(1, Math.hypot(c[0] - c[3], c[1] - c[4], c[2] - c[5]));
    cam.position.set(c[0] + Math.sin(t * 0.7) * drift * 3, c[1] + Math.sin(t * 0.9 + 1) * drift * 2 + shake * 0.06, c[2] + Math.cos(t * 0.5) * drift * 2);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    cam.updateMatrixWorld();

    // map uniforms
    const onMap = set === 0 || set === 3;
    cloud.visible = onMap; ocean.visible = set === 0;
    U.uScan.value = -48 + ((t * 11) % 110);
    U.uBol.value = ramp(t, a("s2:Bolivia") - 0.3, a("s2:Bolivia") + 0.5) * (1 - 0.5 * ramp(t, K.s3, K.s3 + 1)) * (1 - ramp(t, K.s5 + 8, K.s6));
    U.uLit.value = ramp(t, a("s2:pantai") - 0.2, a("s2:pantai") + 0.6);
    U.uLitC.value = ramp(t, a("s3:seluruh"), a("s3:lepas") + 0.5);
    U.uChile.value = ramp(t, a("s3:Chile") - 0.2, a("s3:Chile") + 0.6) * (1 - 0.6 * ramp(t, K.s5, K.s5 + 2));
    U.uAlly.value = ramp(t, a("s3:Bolivia") - 0.2, a("s3:Peru") + 0.3) * (1 - ramp(t, a("s3:menang"), a("s3:menang") + 0.8));
    const dk = ramp(t, K.s8 - 0.2, K.s8 + 4);
    U.uDusk.value = dk * 0.85; LU.uDusk.value = dk; LU.uT.value = t;
    U.uK.value = 300;
    bolM.opacity = 0.9 * U.uBol.value;
    coastM.opacity = U.uLit.value * (1 - ramp(t, K.s4, K.s4 + 1));
    coastM.color.setHex(GOLD).lerp(new THREE.Color(SLATE), U.uLitC.value);
    const lift = Math.sin(Math.PI * U.uLitC.value);
    coastTube.position.set(-lift * 1.2, lift * 2.6, 0);
    bandM.opacity = 0.85 * U.uLit.value * (1 - U.uLitC.value);
    duskM.opacity = dk; sunD.material.opacity = dk;
    scene.background.setHex(0x05080c).lerp(new THREE.Color(0x0d0a12), dk);

    // ocean swell
    const op = oGeo.attributes.position.array;
    for (let i = 0; i < op.length; i += 3) { const x = oBase[i], y = oBase[i + 1]; op[i + 2] = 0.14 * Math.sin(x * 0.33 + t * 0.6) + 0.09 * Math.sin(y * 0.47 - t * 0.45 + x * 0.2); }
    oGeo.attributes.position.needsUpdate = true; oGeo.computeVertexNormals();

    // arrows
    for (const A of ARROWS) {
      const p = clamp01((t - a(A.a)) / Math.max(0.6, a(A.b) - a(A.a)));
      const vis = p > 0 && t < K.s4 + 0.3;
      A.r.mesh.visible = A.r.head.visible = vis;
      A.r.m.opacity = 0.9 * (1 - ramp(t, K.s4 - 1.2, K.s4));
      if (vis) {
        const u = eout(p); A.r.mesh.geometry.setDrawRange(0, Math.floor(A.r.N * u) * 6);
        const tip = A.r.curve.getPointAt(Math.max(0.001, u)), tg = A.r.curve.getTangentAt(Math.max(0.001, u));
        A.r.head.position.copy(tip); A.r.head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
      }
    }

    // rail and train
    const rp = ramp(t, a("s4:rel") - 0.2, a("s4:Paz") + 0.3);
    rail.visible = rp > 0 && t < K.s5 + 2; railGeo.setDrawRange(0, Math.floor((railIdx / 6) * rp) * 6);
    port.material.opacity = ramp(t, a("s4:Arica") - 0.3, a("s4:Arica") + 0.3) * (1 - ramp(t, K.s5, K.s5 + 1)); port.scale.setScalar(1 + 0.15 * Math.sin(t * 4));
    const tu = ramp(t, a("s4:La") - 0.3, K.s5 + 1);
    train.visible = t > a("s4:La") - 0.5 && t < K.s5 + 2;
    cars.forEach((car, i) => { const u = clamp01(tu - i * 0.022) * 0.98 + 0.01; const p = railCurve.getPointAt(u), tg = railCurve.getTangentAt(u); car.position.copy(p).y += 0.1; car.rotation.y = Math.atan2(-tg.z, tg.x); });
    headL.intensity = train.visible ? 12 : 0; headL.position.copy(cars[0].position).y += 0.5;

    // rivers + boats
    const rv = ramp(t, a("s5:sungai") - 0.3, a("s5:sungai") + 1.4);
    rivers.forEach((R) => { R.geo.setDrawRange(0, Math.floor((R.n / 6) * rv) * 6); });
    riverM.opacity = 0.95 * (1 - 0.6 * ramp(t, a("s5:Danau"), a("s5:Danau") + 1.5));
    const fp = flow.pos;
    flowSeed.forEach(([s0, sp, ri], i) => { const u = (s0 + t * sp) % 1; const on = rv > u; const p = rivers[ri].curve.getPointAt(u); fp[i * 3] = p.x; fp[i * 3 + 1] = on && set === 0 ? p.y + 0.12 : -500; fp[i * 3 + 2] = p.z; });
    flow.commit();
    const bv = t > a("s5:berpatroli") - 0.6 && t < K.s6;
    rboats.forEach((b, i) => { const [ri, u0, sp] = RB[i]; b.G.visible = bv; if (!bv) return; let u = u0 + (t - a("s5:berpatroli")) * sp; u = ((u % 1) + 1) % 1; const R = rivers[ri].curve; const p = R.getPointAt(u), tg = R.getTangentAt(u).multiplyScalar(Math.sign(sp)); b.G.position.copy(p).y += 0.02; b.G.rotation.y = Math.atan2(tg.z, -tg.x); b.G.scale.setScalar(2.4 * eout(ramp(t, a("s5:berpatroli") - 0.6, a("s5:berpatroli")))); });

    // hero boat on the lake
    hero.G.visible = onMap;
    hero.G.position.set(bx(t), LY + Math.sin(t * 1.7) * 0.006, bz);
    hero.G.rotation.set(Math.sin(t * 1.3) * 0.03, 0, Math.sin(t * 1.7 + 1) * 0.025);
    hero.fl.rotation.y = Math.sin(t * 3.1) * 0.25; hero.fl.position.x = 0.112 + Math.cos(t * 3.1) * 0.004;
    const wp = wake.pos;
    wakeSeed.forEach(([s0, sd, j], i) => { const age = (s0 + t * 0.35) % 1; wp[i * 3] = bx(t) + 0.22 + age * 1.6; wp[i * 3 + 1] = onMap ? LY + 0.006 : -500; wp[i * 3 + 2] = bz + sd * (0.03 + age * 0.32) + (j - 0.5) * 0.04; });
    wake.commit(); wake.m.opacity = 0.8;

    // altitude gauge + hook line
    const ga = ramp(t, a("s5:3.812") - 0.3, a("s5:3.812") + 0.4) * (1 - ramp(t, K.s6 - 0.4, K.s6));
    gaugeM.opacity = 0.9 * ga; seaRingM.opacity = 0.8 * ga; seaRing.scale.setScalar(1 + 0.4 * eout(ga));
    LU.uGlow.value = 1 + 0.6 * ga;
    hookM.opacity = 0.85 * ramp(t, 4.1, 4.6) * (1 - ramp(t, 6.0, 6.6));

    // parade
    const pOn = set === 1;
    plaza.visible = pOn; paradeL.intensity = pOn ? 140 : 0;
    const front = PARADE.x - 8 + (t - K.s6) * 1.35;
    const ph = t * Math.PI * 2 * 0.93;
    troops.forEach(({ s, row, c }, i) => {
      s.G.visible = pOn; if (!pOn) return;
      const p = ph + (row % 2) * 0.0;
      s.G.position.set(front - row * 1.25, Math.abs(Math.sin(p)) * 0.04, PARADE.z - 3 + c * 1.05);
      s.legL.rotation.x = Math.sin(p) * 0.42; s.legR.rotation.x = -Math.sin(p) * 0.42;
      s.armL.rotation.x = -Math.sin(p) * 0.35; s.armR.rotation.x = Math.sin(p) * 0.35;
    });
    bearers.forEach((f, i) => { f.G.position.set(front + 1.6, 0, PARADE.z - 1.6 + i * 7.6); });
    flags.forEach((f) => {
      f.G.visible = pOn; if (!pOn) return;
      const ar = f.geo.attributes.position.array;
      for (let i = 0; i < ar.length; i += 3) { const x = f.base[i] + 0.75; ar[i + 2] = Math.sin(x * 4 - t * 5 + f.ph) * 0.09 * x; }
      f.geo.attributes.position.needsUpdate = true;
    });

    // court
    const cOn = set === 2;
    scale.visible = gavel.visible = courtFloor.visible = cOn; courtL.intensity = cOn ? 520 : 0;
    const tilt = ramp(t, a("s7:wajib") - 0.2, a("s7:wajib") + 0.9);
    beam.rotation.z = Math.sin(t * 1.4) * 0.05 * (1 - tilt) - 0.2 * eout(tilt);
    pans.forEach((pn) => { pn.hang.rotation.z = -beam.rotation.z; });
    judges.forEach((m, i) => { m.emissiveIntensity = 0.35 * ramp(t, a("s7:putusannya") + i * 0.1, a("s7:putusannya") + i * 0.1 + 0.25); });
    let lift2 = 0;
    for (const s of [strike1, strike2]) { const d = t - s; if (d > -0.55 && d < 0) lift2 = Math.max(lift2, Math.sin(((d + 0.55) / 0.55) * Math.PI * 0.5) * (d > -0.12 ? (-d / 0.12) : 1)); }
    arm.rotation.z = 0.12 - lift2 * 1.0;

    // dust around the lens
    const dp = dust.pos, dd = cam.position.distanceTo(tgt), sc = Math.max(0.25, Math.min(14, dd * 0.12));
    dustSeed.forEach(([x0, y0, z0, phs, sp], i) => {
      tmp.set((x0 * 2.2 + Math.sin(t * sp + phs) * 0.2) * sc, (y0 * 3.5 + Math.cos(t * sp * 0.8 + phs) * 0.2) * sc, -(1.5 + z0 * 8) * sc).applyMatrix4(cam.matrixWorld);
      dp[i * 3] = tmp.x; dp[i * 3 + 1] = tmp.y; dp[i * 3 + 2] = tmp.z;
    });
    dust.commit(); dust.m.size = 0.035 * sc; dust.m.color.setHex(dk > 0.3 ? 0xffc89a : 0xcfe9ff);

    // labels
    for (const l of LBL) {
      let o = ramp(t, l.t0, l.t0 + 0.35) * (1 - ramp(t, l.t1 - 0.3, l.t1));
      if (o <= 0.001) { l.e.style.opacity = 0; continue; }
      tmp.copy(l.pos).project(cam);
      if (tmp.z > 1) o = 0;
      const sx = (tmp.x + 1) * 540, sy = (1 - tmp.y) * 960;
      o *= ramp(sy, 560, 640) * (1 - ramp(sy, 1180, 1260)) * ramp(sx, 20, 120) * (1 - ramp(sx, 960, 1060));
      l.e.style.opacity = o.toFixed(3);
      l.e.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    }
    const topoE = document.getElementById("topo");
    if (topoE) { let y = 2000; for (const w of SWEEP) { const u = (t - (w - 0.5)) / 0.9; if (u >= 0 && u <= 1) y = 1920 - 2870 * (u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2); } topoE.style.transform = `translateY(${y.toFixed(1)}px)`; }
    let cv = 0;
    for (const k of [K.s6, K.s7, K.s8]) cv = Math.max(cv, 1 - ramp(Math.abs(t - k), 0.05, 0.32));
    cover.style.opacity = cv.toFixed(3);

    bp.strength = 0.42 + 0.25 * dk + 0.3 * shake;
    comp.render();
  };
}
