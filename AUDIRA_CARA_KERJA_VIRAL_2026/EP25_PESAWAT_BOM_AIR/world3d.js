// EP25 PESAWAT BOM AIR. COMICFORGE look: a printed-comic 3D board of East Kalimantan in Ben-Day halftone cel shading
// (3 hard tone bands + screen-space dots), thick black ink hulls on every prop, CMYK palette on newsprint-cyan sky,
// Indonesian onomatopoeia bursts (BYURRR!, NGEEENG!, HUP!, WUSSS!) and radial action rays behind big beats.
// One connected board along +x: airport (x -145..-62) -> river (-58..-50) -> burning forest slab (-45..45, peat
// layers on its front face) -> lake (52..135). Tanker and lead plane share one flight rail from the runway over the fire.
// Every value is a pure function of t (seeded PRNG only, no accumulated state).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, canvasTex, track, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const P = {
  paper: "#FFF6E0", ink: "#121014", cyan: "#00A3E0", cyanS: "#005E9E", mag: "#E5007D", magS: "#8E0050",
  yel: "#FFE100", yelS: "#E39A00", red: "#ED1C24", redS: "#8A0A10",
};

// ---------- halftone cel shader (kit recipe + rim light + distance haze) ----------
const HT_V = `varying vec3 vN;varying vec3 vW;
void main(){
#ifdef USE_INSTANCING
 mat4 m=modelMatrix*instanceMatrix;
#else
 mat4 m=modelMatrix;
#endif
 vec4 wp=m*vec4(position,1.);vW=wp.xyz;vN=mat3(m)*normal;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const HT_F = `uniform vec3 uColor,uShade,uLight,uFogC,uRimC;uniform float uDot,uSpec,uRim,uFogN,uFogF;varying vec3 vN;varying vec3 vW;
float dots(float cov){vec2 p=gl_FragCoord.xy/uDot;p=mat2(.7071,-.7071,.7071,.7071)*p;vec2 g=fract(p)-.5;float r=sqrt(cov)*.62;return 1.-smoothstep(r-.07,r+.07,length(g));}
void main(){
 vec3 n=length(vN)>1e-5?normalize(vN):vec3(0.,1.,0.);if(!gl_FrontFacing)n=-n;
 vec3 L=normalize(uLight);float ndl=dot(n,L);vec3 col;
 if(ndl>.3)col=uColor;else if(ndl>-.2)col=mix(uColor,uShade,dots(.42));else col=mix(uShade,uShade*.72,dots(.35));
 vec3 vd=cameraPosition-vW;vec3 v=length(vd)>1e-5?normalize(vd):vec3(0.,0.,1.);vec3 h=normalize(L+v);
 col=mix(col,vec3(1.),step(.965,dot(n,h))*uSpec);
 float rim=smoothstep(.6,.68,1.-max(dot(n,v),0.))*uRim*step(-.35,ndl);col=mix(col,uRimC,rim);
 col=mix(col,uFogC,smoothstep(uFogN,uFogF,length(vd))*.8);
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`;
const SH = { uLight: { value: v3(0.55, 0.78, 0.42).normalize() }, uDot: { value: 9 }, uFogC: { value: new THREE.Color("#BFE6F5") }, uFogN: { value: 70 }, uFogF: { value: 260 } };
function ht(color, shade, spec = 0, rim = 0.5, rimC = "#FFF6E0") {
  return new THREE.ShaderMaterial({
    vertexShader: HT_V, fragmentShader: HT_F, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uShade: { value: new THREE.Color(shade) }, uSpec: { value: spec }, uRim: { value: rim }, uRimC: { value: new THREE.Color(rimC) }, ...SH },
  });
}
// instanced inverted hull (normal-extruded), flat ink
function outlineMat(thick) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: { uT: { value: thick }, uInk: { value: new THREE.Color(P.ink) } },
    vertexShader: `uniform float uT;void main(){vec3 p=position+normal*uT;
#ifdef USE_INSTANCING
 vec4 wp=modelMatrix*instanceMatrix*vec4(p,1.);
#else
 vec4 wp=modelMatrix*vec4(p,1.);
#endif
 gl_Position=projectionMatrix*viewMatrix*wp;}`,
    fragmentShader: `uniform vec3 uInk;void main(){gl_FragColor=vec4(uInk,1.);
#include <colorspace_fragment>
}`,
  });
}
const INK = new THREE.MeshBasicMaterial({ color: P.ink, side: THREE.BackSide });
const INKF = new THREE.MeshBasicMaterial({ color: P.ink });

// ---------- geometry helpers ----------
function rbox(w, h, d, r, seg = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
// mesh + scaled ink hull (uniform line thickness t on each axis)
function inked(geo, mat, t, parent, pos, rot) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat));
  geo.computeBoundingBox();
  const bb = geo.boundingBox, sz = bb.getSize(v3(0, 0, 0)), c = bb.getCenter(v3(0, 0, 0));
  const s = v3((sz.x + 2 * t) / Math.max(sz.x, 0.05), (sz.y + 2 * t) / Math.max(sz.y, 0.05), (sz.z + 2 * t) / Math.max(sz.z, 0.05));
  const hl = new THREE.Mesh(geo, INK); hl.scale.copy(s); hl.position.set(c.x * (1 - s.x), c.y * (1 - s.y), c.z * (1 - s.z));
  g.add(hl);
  if (pos) g.position.copy(pos);
  if (rot) g.rotation.set(rot[0], rot[1], rot[2]);
  if (parent) parent.add(g);
  return g;
}
function lathe(prof, alongX = true) {
  const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y)), 28);
  if (alongX) g.rotateZ(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
function cylX(r, len, seg = 20) { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateZ(Math.PI / 2); return g; }
function finGeo(pts, depth) {
  const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
}

// ---------- comic lettering textures ----------
function burstTex(txt, fill, txtCol, w = 1024, h = 560, spikes = 14) {
  return canvasTex(w, h, (c) => {
    const cx = w / 2, cy = h / 2;
    c.beginPath();
    const R = mulberry(txt.length * 31 + spikes);
    for (let i = 0; i < spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2, rr = i % 2 ? 0.62 + 0.08 * R() : 0.98;
      const x = cx + Math.cos(a) * (w / 2 - 14) * rr, y = cy + Math.sin(a) * (h / 2 - 14) * rr;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath(); c.fillStyle = fill; c.fill(); c.lineWidth = 16; c.strokeStyle = P.ink; c.lineJoin = "round"; c.stroke();
    c.font = `italic 900 ${Math.round(h * 0.34)}px Impact, "Arial Black", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.save(); c.translate(cx, cy); c.rotate(-0.06);
    c.lineWidth = 22; c.strokeStyle = P.ink; c.strokeText(txt, 8, 10);
    c.fillStyle = P.ink; c.fillText(txt, 8, 10);
    c.lineWidth = 14; c.strokeStyle = P.ink; c.strokeText(txt, 0, 0);
    c.fillStyle = txtCol; c.fillText(txt, 0, 0);
    c.restore();
  });
}
function sprite(tex, w, h) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  sp.scale.set(w, h, 1); sp.renderOrder = 30; sp.userData.w = w; sp.userData.h = h; return sp;
}
function badgeTex(txt, fill, col) {
  return canvasTex(256, 256, (c) => {
    c.beginPath(); c.arc(128, 128, 112, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); c.lineWidth = 14; c.strokeStyle = P.ink; c.stroke();
    c.font = `900 150px Impact, "Arial Black", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = col; c.fillText(txt, 128, 136);
  });
}

// monotone cubic (Fritsch-Carlson) over [t, v] keys: no overshoot, holds stay holds
function mono(keys) {
  const n = keys.length, xs = keys.map((k) => k[0]), ys = keys.map((k) => k[1]);
  const d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / Math.max(1e-4, xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (t) => {
    if (t <= xs[0]) return ys[0];
    if (t >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (xs[i + 1] < t) i++;
    const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.9;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 1500);
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    dij: A_("s1:dijatuhkan", 1.4), mel: A_("s1:melompat", 4.4),
    tiga: A_("s2:tiga", s.s2 + 2.3), makroman: A_("s2:Makroman", s.s2 + 5.4), herc: A_("s2:Hercules", s.s2 + 8.7), militer: A_("s2:militer", s.s2 + 13.7),
    sungai: A_("s3:sungai", s.s3 + 1.5), balik: A_("s3:Balikpapan", s.s3 + 2.4), selang: A_("s3:selang", s.s3 + 3.2), mengisi: A_("s3:mengisi", s.s3 + 3.6), liter: A_("s3:liter", s.s3 + 6.5), menit: A_("s3:menit", s.s3 + 11),
    dua: A_("s4:dua", s.s4 + 0.3), pemandu: A_("s4:pemandu", s.s4 + 4.8), terbang: A_("s4:terbang", s.s4 + 5.9), menandai: A_("s4:menandai", s.s4 + 7), mengecek: A_("s4:mengecek", s.s4 + 8.3),
    puluhan: A_("s5:puluhan", s.s5 + 1.3), komputer: A_("s5:Komputer", s.s5 + 4.9), pintu: A_("s5:pintu", s.s5 + 5.9), air: A_("s5:Air", s.s5 + 8.7), hujan: A_("s5:hujan", s.s5 + 9.8), sisi: A_("s5:sisi", s.s5 + 11.2),
    kenapa: A_("s6:kenapa", s.s6 + 0.3), hilang: A_("s6:hilang", s.s6 + 4.8), gaya: A_("s6:Gaya", s.s6 + 5.3), berat: A_("s6:beratnya", s.s6 + 7.5), dorong: A_("s6:terdorong", s.s6 + 9.5), pilot: A_("s6:pilot", s.s6 + 10.4),
    amfibi: A_("s7:amfibi", s.s7 + 1.3), sendok: A_("s7:menyendok", s.s7 + 4.4), n6137: A_("s7:6.137", s.s7 + 6.7), detik7: A_("s7:detik", s.s7 + 9.9), tapi: A_("s7:Tapi", s.s7 + 10.6), gambut: A_("s7:gambut", s.s7 + 11.3), tim: A_("s7:tim", s.s7 + 13.4),
    membeli: A_("s8:membeli", s.s8 + 2.2), ikuti: A_("s8:Ikuti", s.s8 + 4.6),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color("#7FD3F0");
  S.add(cam);

  // ---------- sky dome: cyan Ben-Day sky with warm smoke haze on the horizon ----------
  const skyTex = canvasTex(512, 1024, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1C9AD6"); g.addColorStop(0.36, "#5CC6EE"); g.addColorStop(0.47, "#FFE7A8"); g.addColorStop(0.53, "#F7B26A"); g.addColorStop(1, "#7a5a3a");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cell = 14;
    for (let j = 0; j < h / cell; j++) for (let i = 0; i < w / cell + 1; i++) {
      const y = j * cell, x = i * cell + (j % 2 ? cell / 2 : 0), v = y / h;
      const cov = v < 0.45 ? 0.5 * (1 - v / 0.45) : 0.35 * clamp01((v - 0.47) / 0.1);
      const rr = cell * 0.5 * Math.sqrt(cov); if (rr < 0.6) continue;
      c.fillStyle = v < 0.45 ? "rgba(0,70,160,.55)" : "rgba(229,0,125,.45)";
      c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill();
    }
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false }));
  sky.renderOrder = -10; S.add(sky);
  // radial action rays behind the hero beats
  const raysTex = canvasTex(1024, 1024, (c, w) => {
    const R = mulberry(77); c.translate(w / 2, w / 2);
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2 + R() * 0.05, wd = 0.012 + R() * 0.03;
      c.fillStyle = i % 3 === 0 ? "rgba(255,225,0,.9)" : "rgba(255,255,255,.85)";
      c.beginPath(); c.moveTo(Math.cos(a) * 90, Math.sin(a) * 90); c.lineTo(Math.cos(a - wd) * 520, Math.sin(a - wd) * 520); c.lineTo(Math.cos(a + wd) * 520, Math.sin(a + wd) * 520); c.fill();
    }
  });
  const rays = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: raysTex, transparent: true, depthWrite: false, opacity: 0 }));
  rays.renderOrder = -5; S.add(rays);

  // ---------- materials ----------
  const M = {
    grass: ht("#8CCB45", "#3E7A2A", 0, 0.2), soil: ht("#B5763E", "#5C3418", 0, 0), peat: ht("#4A2C1A", "#1E120A", 0, 0), clay: ht("#D89A57", "#8A5226", 0, 0),
    char: ht("#3A3034", "#141014", 0, 0), tree1: ht("#1FA34A", "#0B5A2A", 0, 0.35, "#D9F99D"), tree2: ht("#64BD3C", "#2D6E1F", 0, 0.35, "#ECFCCB"), trunk: ht("#8A5A32", "#40240F", 0, 0),
    water: ht("#00A3E0", "#005E9E", 1, 0.3), runway: ht("#5A6178", "#2C3146", 0, 0), apron: ht("#C8D3DF", "#6C7A92", 0, 0),
    yel: ht(P.yel, P.yelS, 1, 0.55), steel: ht("#E6EEF5", "#6C7A92", 1, 0.4), dark: ht("#3A4256", "#14171F", 1, 0.3), red: ht(P.red, P.redS, 1, 0.5, "#FFE100"),
    mag: ht(P.mag, P.magS, 1, 0.5), cyan: ht(P.cyan, P.cyanS, 1, 0.5), smoke: ht("#D6D0C4", "#7D7682", 0, 0.4, "#FFFFFF"), steam: ht("#FFFFFF", "#9FD6EE", 0, 0),
    hangar: ht("#F2EBDD", "#8B8EA3", 0, 0.3), orange: ht("#FF8A1F", "#B4480A", 1, 0.3),
  };
  const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c });
  const R = mulberry(2511);

  // ---------- board slabs ----------
  const board = new THREE.Group(); S.add(board);
  function slab(cx, cz, w, d, layers) {
    let y = 0;
    for (const [hgt, mat] of layers) { inked(rbox(w, hgt, d, Math.min(0.25, hgt / 2.2)), mat, 0.08, board, v3(cx, y - hgt / 2, cz)); y -= hgt; }
  }
  slab(0, 0, 90, 90, [[0.6, M.grass], [1.5, M.soil], [3.8, M.peat], [1.8, M.clay]]);
  slab(-103.5, 5, 83, 40, [[0.6, M.grass], [1.6, M.soil], [1.6, M.clay]]);
  slab(93.5, -10, 83, 50, [[0.6, M.grass], [1.6, M.soil], [1.6, M.clay]]);
  // the board sits on a printed newsprint page (halftone dots) so wide shots never show empty void under the slabs
  { const pt = canvasTex(128, 128, (c, w) => { c.fillStyle = "#FFF6E0"; c.fillRect(0, 0, w, w); c.fillStyle = "rgba(229,0,125,.35)"; for (const [x, y] of [[32, 32], [96, 96], [96, 32], [32, 96]]) { c.beginPath(); c.arc(x, y, 13, 0, 6.283); c.fill(); } }, [260, 260]);
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshBasicMaterial({ map: pt })); pg.rotation.x = -Math.PI / 2; pg.position.y = -8.3; board.add(pg); }
  // river between airport and forest
  inked(rbox(8, 1.6, 60, 0.3), M.water, 0.08, board, v3(-54, -1.4, 0));
  // lake surface (slightly above grass)
  inked(rbox(64, 0.3, 30, 0.14), M.water, 0.1, board, v3(95, -0.05, -10));

  // ---------- fire geometry (needed for tree exclusion) ----------
  const FA = { x: 2, z: -6, rx: 16, rz: 9 }, FB = { x: -24, z: -24, rx: 4.5, rz: 4 };
  const inEll = (x, z, F, pad) => ((x - F.x) / (F.rx + pad)) ** 2 + ((z - F.z) / (F.rz + pad)) ** 2 < 1;
  { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), M.char); m.rotation.x = -Math.PI / 2; m.scale.set(FA.rx, FA.rz, 1); m.position.set(FA.x, 0.03, FA.z); board.add(m); }
  { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 32), M.char); m.rotation.x = -Math.PI / 2; m.scale.set(FB.rx, FB.rz, 1); m.position.set(FB.x, 0.03, FB.z); board.add(m); }

  // ---------- instanced trees ----------
  const coneG = new THREE.ConeGeometry(0.85, 2.4, 7); coneG.translate(0, 1.9, 0);
  const trunkG = new THREE.CylinderGeometry(0.14, 0.18, 0.8, 6); trunkG.translate(0, 0.4, 0);
  const treePos = [];
  const tryTree = (x, z) => {
    if (inEll(x, z, FA, 1.2) || inEll(x, z, FB, 1.2)) return;
    if (Math.abs(z - 3) < 1.2 && x > -45 && x < 45 && R() < 0.0) return;
    treePos.push([x, z, 0.75 + R() * 0.55, R() * 6.28]);
  };
  for (let i = 0; i < 1500; i++) { const x = -43 + R() * 86, z = -43 + R() * 86; if (z > 30 && Math.abs(x + 3) < 12) continue; tryTree(x, z); }
  for (let i = 0; i < 420; i++) { const x = 54 + R() * 79, z = -33 + R() * 35; if (Math.abs(x - 95) < 33 && Math.abs(z + 10) < 16) continue; tryTree(x, z); }
  for (let i = 0; i < 260; i++) { const x = -143 + R() * 79, z = -13 + R() * 36; if (z > -2) continue; if (x > -126 && x < -108 && z < -1) continue; tryTree(x, z); }
  const dm = new THREE.Object3D();
  const half = Math.ceil(treePos.length / 2);
  const olTree = outlineMat(0.07);
  for (const [k, mat] of [[0, M.tree1], [1, M.tree2]]) {
    const list = treePos.filter((_, i) => (i < half ? 0 : 1) === k);
    const cones = new THREE.InstancedMesh(coneG, mat, list.length), hulls = new THREE.InstancedMesh(coneG, olTree, list.length), trunks = new THREE.InstancedMesh(trunkG, M.trunk, list.length);
    list.forEach(([x, z, sc, ro], i) => { dm.position.set(x, 0, z); dm.rotation.set(0, ro, 0); dm.scale.set(sc, sc * (0.9 + 0.3 * ((i * 7) % 5) / 5), sc); dm.updateMatrix(); cones.setMatrixAt(i, dm.matrix); hulls.setMatrixAt(i, dm.matrix); trunks.setMatrixAt(i, dm.matrix); });
    board.add(cones, hulls, trunks);
  }

  // ---------- airport props ----------
  inked(rbox(78, 0.14, 7.5, 0.06), M.runway, 0.06, board, v3(-103.5, 0.07, 6));
  { const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.05, 0.3), BASIC("#FFF6E0"), 18); for (let i = 0; i < 18; i++) { dm.position.set(-140 + i * 4.2, 0.17, 6); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); dash.setMatrixAt(i, dm.matrix); } board.add(dash); }
  inked(rbox(22, 0.12, 9, 0.05), M.apron, 0.05, board, v3(-114, 0.06, -3.5));
  { const hg = new THREE.CylinderGeometry(4, 4, 10, 24, 1, false, 0, Math.PI); hg.rotateZ(Math.PI / 2); hg.rotateX(Math.PI / 2); hg.rotateY(Math.PI / 2); inked(hg, M.hangar, 0.1, board, v3(-121, 0, -8)); }
  // ground water tank with the AUDIRA stencil (anti-reupload: brand inside the world)
  const tankG = inked(rbox(4.2, 3.2, 2.4, 0.35), M.cyan, 0.1, board, v3(-104.5, 1.6, 0.6));
  const stencil = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.9), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: canvasTex(760, 380, (c, w, h) => {
    c.fillStyle = "#FFF6E0"; c.fillRect(10, 10, w - 20, h - 20); c.lineWidth = 12; c.strokeStyle = P.ink; c.strokeRect(10, 10, w - 20, h - 20);
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = P.ink; c.font = `900 150px Impact, "Arial Black", sans-serif`; c.fillText("AUDIRA", w / 2, h * 0.43);
    c.fillStyle = P.red; c.font = `900 70px Impact, "Arial Black", sans-serif`; c.fillText("TANGKI AIR", w / 2, h * 0.78);
  }) }));
  stencil.position.set(-104.5, 1.75, 1.83); board.add(stencil);
  // hose from tank to tanker belly (flowing dashes while filling)
  const hoseCurve = new THREE.QuadraticBezierCurve3(v3(-106.4, 0.5, 1.6), v3(-110, 0.12, 4.2), v3(-112.6, 0.55, 5.4));
  const dashTex = canvasTex(64, 16, (c, w, h) => { c.fillStyle = "#00A3E0"; c.fillRect(0, 0, w, h); c.fillStyle = "#BFF0FF"; c.fillRect(0, 0, w * 0.45, h); }, [14, 1]);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 40, 0.16, 10), new THREE.MeshBasicMaterial({ map: dashTex }));
  const hoseInk = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 40, 0.24, 10), INK);
  board.add(hose, hoseInk);
  // traffic cones on the apron
  for (let i = 0; i < 5; i++) { const cg = new THREE.ConeGeometry(0.28, 0.75, 10); cg.translate(0, 0.38, 0); inked(cg, M.orange, 0.05, board, v3(-117 + i * 2.6, 0.12, 10.6)); }

  // ---------- power line across the drop path (the hazard the lead plane checks) ----------
  const pyl = (x, z) => { const g = new THREE.Group(); inked(rbox(0.5, 7, 0.5, 0.08), M.steel, 0.06, g, v3(0, 3.5, 0)); inked(rbox(0.3, 0.3, 3, 0.06), M.steel, 0.05, g, v3(0, 6.6, 0)); g.position.set(x, 0, z); board.add(g); };
  pyl(-28, 14); pyl(-28, -9);
  for (const dx of [-0.12, 0.12]) {
    const cv = new THREE.QuadraticBezierCurve3(v3(-28 + dx, 6.7, 14), v3(-28 + dx, 5.6, 2.5), v3(-28 + dx, 6.7, -9));
    board.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 30, 0.05, 5), INKF));
  }

  // ---------- fire trucks (ground team) ----------
  const trucks = [];
  for (const [x, z] of [[-9, 33], [4, 34]]) {
    const g = new THREE.Group();
    inked(rbox(1.2, 1.1, 2.8, 0.18), M.red, 0.06, g, v3(0, 0.95, 0.2));
    inked(rbox(1.15, 0.95, 1.0, 0.2), M.red, 0.06, g, v3(0, 0.9, -1.6));
    inked(rbox(1.0, 0.36, 0.08, 0.04), M.dark, 0.03, g, v3(0, 1.05, -2.12));
    inked(rbox(0.5, 0.18, 2.4, 0.06), M.steel, 0.04, g, v3(0, 1.6, 0.2));
    for (const [wx, wz] of [[-0.6, -1.4], [0.6, -1.4], [-0.6, 0.9], [0.6, 0.9]]) inked(cylX(0.32, 0.25, 14), M.dark, 0.05, g, v3(wx, 0.32, wz));
    g.position.set(x, 0, z); g.rotation.y = 0.15 * (x > 0 ? -1 : 1); board.add(g); trucks.push(g);
  }

  // ---------- peat embers on the slab's front face ----------
  const emb = []; const embG = new THREE.CircleGeometry(1, 12);
  const embMat = new THREE.MeshBasicMaterial({ color: "#FF7A1A", toneMapped: false });
  const embCore = new THREE.MeshBasicMaterial({ color: "#FFE100", toneMapped: false });
  const embI = new THREE.InstancedMesh(embG, embMat, 46), embC = new THREE.InstancedMesh(embG, embCore, 46);
  embI.frustumCulled = embC.frustumCulled = false;
  for (let i = 0; i < 46; i++) emb.push({ x: -28 + R() * 56, y: -2.5 - R() * 3.0, r: 0.25 + R() * 0.45, ph: R() * 6.28 });
  board.add(embI, embC);
  // glowing peat seam line
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(70, 0.18), new THREE.MeshBasicMaterial({ color: "#FF5A1A", toneMapped: false, transparent: true, opacity: 0.8 })); g.position.set(0, -3.6, 45.03); board.add(g); }

  // ---------- flames (instanced cones + ink hulls) ----------
  const flames = [];
  for (let i = 0; i < 74; i++) { const a = (i / 74) * Math.PI * 2; flames.push({ x: FA.x + Math.cos(a) * FA.rx * (0.96 + 0.08 * R()), z: FA.z + Math.sin(a) * FA.rz * (0.96 + 0.08 * R()), ph: R() * 6.28, sc: 0.8 + R() * 0.6 }); }
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; flames.push({ x: FB.x + Math.cos(a) * FB.rx, z: FB.z + Math.sin(a) * FB.rz, ph: R() * 6.28, sc: 0.7 + R() * 0.5 }); }
  const flOG = new THREE.ConeGeometry(0.6, 2.0, 8); flOG.translate(0, 1.0, 0);
  const flIG = new THREE.ConeGeometry(0.34, 1.25, 8); flIG.translate(0, 0.62, 0.1);
  const flO = new THREE.InstancedMesh(flOG, new THREE.MeshBasicMaterial({ color: "#FF3B1F", toneMapped: false }), flames.length);
  const flH = new THREE.InstancedMesh(flOG, outlineMat(0.08), flames.length);
  const flI = new THREE.InstancedMesh(flIG, new THREE.MeshBasicMaterial({ color: "#FFE100", toneMapped: false }), flames.length);
  for (const m of [flO, flH, flI]) { m.frustumCulled = false; S.add(m); }
  // drop events: footprint [x0,x1] on the south flank, plane over x0 at t0 and x1 at t1
  const DROPS = [
    { x0: 3.4, x1: 9.0, t0: E.dij, t1: E.dij + 2.6, fall: 1.0 },
    { x0: -7.6, x1: 1.8, t0: E.air, t1: E.hilang, fall: 1.6 },
  ];
  const suppress = (f, t) => {
    let k = 1;
    if (f.z > FA.z + 2) for (const d of DROPS) {
      if (f.x < d.x0 - 0.8 || f.x > d.x1 + 0.8) continue;
      const th = d.t0 + clamp01((f.x - d.x0) / (d.x1 - d.x0)) * (d.t1 - d.t0) + d.fall;
      k = Math.min(k, 1 - 0.88 * ramp(t, th, th + 1.1));
    }
    return k;
  };
  // smoke and steam puffs
  const sphG = new THREE.IcosahedronGeometry(1, 2);
  const NSM = 120, smoke = new THREE.InstancedMesh(sphG, M.smoke, NSM), smokeH = new THREE.InstancedMesh(sphG, outlineMat(0.06), NSM);
  const SMK = Array.from({ length: NSM }, (_, i) => ({ f: Math.floor(R() * flames.length), P: 6 + R() * 4, ph: R(), dx: R() - 0.5 }));
  const NST = 40, steam = new THREE.InstancedMesh(sphG, M.steam, NST), steamH = new THREE.InstancedMesh(sphG, outlineMat(0.05), NST);
  const STM = Array.from({ length: NST }, (_, i) => ({ d: i % 2, u: R(), P: 3 + R() * 2, ph: R(), dz: R() - 0.5 }));
  for (const m of [smoke, smokeH, steam, steamH]) { m.frustumCulled = false; S.add(m); }

  // ---------- aircraft builders ----------
  function buildTanker() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const fg = lathe([[0, -5], [0.3, -4.9], [0.45, -4.2], [0.64, -3], [0.82, -1.6], [0.82, 3.3], [0.76, 4.05], [0.56, 4.62], [0.3, 4.93], [0, 5.02]]);
    const pa = fg.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i); if (x < -1.5) pa.setY(i, pa.getY(i) + (-1.5 - x) * 0.13); } fg.computeVertexNormals();
    inked(fg, M.yel, 0.07, body);
    inked(rbox(0.7, 0.22, 1.5, 0.08), M.dark, 0.04, body, v3(4.2, 0.42, 0));            // cockpit glazing
    inked(rbox(1.7, 0.2, 13.6, 0.09), M.yel, 0.07, body, v3(0.6, 0.78, 0));              // high wing
    inked(rbox(0.5, 0.2, 13.0, 0.08), M.red, 0.05, body, v3(-0.05, 0.8, 0));             // trailing-edge band
    const props = [];
    for (const z of [-4.4, -2.3, 2.3, 4.4]) {
      inked(cylX(0.27, 2.0), M.steel, 0.05, body, v3(1.25, 0.55, z));
      const cg = new THREE.ConeGeometry(0.22, 0.45, 14); cg.rotateZ(-Math.PI / 2); inked(cg, M.red, 0.04, body, v3(2.45, 0.55, z));
      const pr = new THREE.Group(); pr.position.set(2.3, 0.55, z); body.add(pr);
      for (let b = 0; b < 4; b++) { const bl = inked(rbox(0.06, 1.45, 0.18, 0.025), M.dark, 0.025, null); bl.children.forEach((c) => c.position.y += 0.72); const piv = new THREE.Group(); piv.rotation.x = (b / 4) * Math.PI * 2; piv.add(bl); pr.add(piv); }
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.45, 32), new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.22, depthWrite: false })); disc.rotation.y = Math.PI / 2; disc.position.x = 0.02; pr.add(disc);
      props.push(pr);
    }
    inked(finGeo([[0, 0], [2.0, 0], [1.25, 2.55], [0.35, 2.55]], 0.16), M.yel, 0.06, body, v3(-5.0, 0.95, 0));
    inked(rbox(0.6, 0.5, 0.18, 0.07), M.red, 0.04, body, v3(-4.2, 3.3, 0));
    inked(rbox(1.1, 0.12, 5.0, 0.05), M.yel, 0.05, body, v3(-4.45, 1.05, 0));
    // belly tank, level gauge and drop doors
    inked(rbox(3.8, 0.5, 1.3, 0.14), M.steel, 0.06, body, v3(0.4, -0.72, 0));
    const gaugeFrame = inked(rbox(2.9, 0.26, 0.05, 0.02), M.dark, 0.03, body, v3(0.4, -0.7, 0.68));
    const gauge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 0.06), new THREE.MeshBasicMaterial({ color: "#3FD2FF", toneMapped: false }));
    gauge.geometry.translate(1.4, 0, 0); gauge.position.set(0.4 - 1.4, -0.7, 0.71); body.add(gauge);
    const doors = [];
    for (const sd of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(0.4, -0.98, sd * 0.6); const d = inked(rbox(3.3, 0.07, 0.6, 0.03), M.dark, 0.03, piv, v3(0, 0, -sd * 0.3)); body.add(piv); doors.push([piv, sd]); }
    const gear = new THREE.Group(); body.add(gear);
    for (const [x, z] of [[0.4, -0.95], [0.4, 0.95], [3.6, 0]]) inked(cylX(0.26, 0.22, 12).rotateY(Math.PI / 2), M.dark, 0.04, gear, v3(x, -1.25, z));
    // speed lines
    const sl = new THREE.Group(); g.add(sl);
    const RS = mulberry(55);
    for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.9, toneMapped: false })); m.userData = { y: -1.6 + RS() * 4, z: -7 + RS() * 14, x: -6 - RS() * 6, l: 3 + RS() * 6, ph: RS() }; sl.add(m); }
    // lift (up) and weight (down) arrows
    const arrow = (mat, len) => { const a = new THREE.Group(); inked(new THREE.CylinderGeometry(0.22, 0.22, len, 14).translate(0, len / 2, 0), mat, 0.06, a); inked(new THREE.ConeGeometry(0.6, 1.1, 16).translate(0, len + 0.55, 0), mat, 0.06, a); return a; };
    const lift = arrow(M.mag, 3.0); lift.position.set(0.6, 1.0, 0); g.add(lift);
    const wgt = arrow(M.dark, 3.0); wgt.rotation.z = Math.PI; wgt.position.set(0.4, -1.05, 0); g.add(wgt);
    return { g, body, props, doors, gauge, gear, sl, lift, wgt };
  }
  function buildLead() {
    const g = new THREE.Group();
    inked(lathe([[0, -2.2], [0.2, -2.1], [0.34, -1.4], [0.36, 0.9], [0.3, 1.6], [0.16, 2.1], [0, 2.25]]), M.steel, 0.05, g);
    inked(rbox(0.35, 0.12, 1.1, 0.05), M.dark, 0.03, g, v3(1.55, 0.2, 0));
    inked(rbox(0.85, 0.1, 5.4, 0.04), M.mag, 0.05, g, v3(0.1, -0.2, 0));
    for (const z of [-0.5, 0.5]) inked(cylX(0.17, 0.95), M.steel, 0.04, g, v3(-1.2, 0.2, z));
    inked(finGeo([[0, 0], [0.9, 0], [0.6, 1.2], [0.2, 1.2]], 0.1), M.mag, 0.04, g, v3(-2.1, 0.2, 0));
    inked(rbox(0.5, 0.08, 2.0, 0.03), M.mag, 0.04, g, v3(-1.7, 1.38, 0));
    return { g };
  }
  function buildScooper() {
    const g = new THREE.Group();
    inked(lathe([[0, -3.4], [0.25, -3.3], [0.42, -2.4], [0.66, -1.0], [0.68, 2.2], [0.5, 3.0], [0.25, 3.4], [0, 3.5]]), M.red, 0.06, g);
    inked(rbox(4.6, 0.32, 0.7, 0.12), M.red, 0.05, g, v3(0.6, -0.6, 0));
    inked(rbox(0.5, 0.2, 1.1, 0.06), M.dark, 0.03, g, v3(2.85, 0.35, 0));
    inked(rbox(1.3, 0.16, 10.2, 0.07), M.yel, 0.06, g, v3(0.4, 0.95, 0));
    for (const z of [-1.9, 1.9]) { inked(cylX(0.3, 1.8), M.yel, 0.05, g, v3(0.9, 1.05, z)); const d = new THREE.Mesh(new THREE.CircleGeometry(1.2, 28), new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.25, depthWrite: false })); d.rotation.y = Math.PI / 2; d.position.set(1.85, 1.05, z); g.add(d); }
    for (const z of [-4.7, 4.7]) inked(new THREE.CapsuleGeometry(0.16, 0.7, 4, 10).rotateZ(Math.PI / 2), M.yel, 0.04, g, v3(0.5, 0.5, z));
    inked(finGeo([[0, 0], [1.4, 0], [0.9, 2.0], [0.3, 2.0]], 0.14), M.red, 0.05, g, v3(-3.3, 0.45, 0));
    inked(rbox(0.8, 0.1, 3.2, 0.04), M.yel, 0.04, g, v3(-2.9, 2.35, 0));
    const probes = new THREE.Group(); g.add(probes);
    for (const z of [-0.2, 0.2]) inked(rbox(0.12, 0.5, 0.1, 0.03), M.dark, 0.03, probes, v3(0.3, -0.95, z));
    return { g, probes };
  }
  const TK = buildTanker(); S.add(TK.g);
  const LD = buildLead(); S.add(LD.g);
  const SC = buildScooper(); S.add(SC.g);

  // ---------- flight rail shared by tanker and lead plane ----------
  const rail = new THREE.CatmullRomCurve3([v3(-135, 1.5, 6), v3(-80, 1.5, 6), v3(-64, 5.5, 5.4), v3(-46, 9.4, 3.6), v3(-30, 9.6, 3), v3(0, 9.2, 3), v3(25, 9.2, 3), v3(45, 13, 1.5), v3(75, 22, -6), v3(140, 34, -22)], false, "centripetal");
  const RL = rail.getLength(), NS = 1600, railX = [];
  for (let i = 0; i <= NS; i++) railX.push(rail.getPointAt(i / NS).x);
  const sx = (x) => { let i = 0; while (i < NS && railX[i + 1] < x) i++; const a = railX[i], b = railX[Math.min(NS, i + 1)]; return ((i + clamp01((x - a) / Math.max(1e-4, b - a))) / NS) * RL; };
  const railPose = (sv) => { const u = clamp01(sv / RL); const p = rail.getPointAt(u), tg = rail.getTangentAt(u); return { p, yaw: Math.atan2(-tg.z, tg.x), pitch: Math.asin(THREE.MathUtils.clamp(tg.y, -1, 1)) }; };
  const sT = mono([[s.s3 - 0.6, sx(-113)], [E.terbang + 0.3, sx(-113)], [E.terbang + 2.6, sx(-78)], [s.s5 + 0.4, sx(-24)], [E.pintu, sx(-14)], [E.air, sx(-8)], [E.hilang, sx(1)], [E.pilot + 1, sx(6)], [s.s7, sx(22)], [s.s8, sx(55)], [s.dur, sx(125)]]);
  const sL = mono([[s.s3 - 0.6, sx(-92)], [E.pemandu - 1.0, sx(-92)], [E.terbang, sx(-80)], [E.menandai, sx(-42)], [E.mengecek + 0.5, sx(-10)], [s.s5 + 2, sx(15)], [E.pintu, sx(40)], [s.s6, sx(70)], [s.s7, sx(135)]]);
  const s1e = s.s1e;
  function tanker(t) {
    if (t < s.s3 - 0.6) {
      const tau = Math.max(0, t - s1e);
      const x = 1.0 + 1.6 * Math.min(t, s1e) + 1.6 * tau + 0.9 * tau * tau;
      const jump = 3.0 * ramp(t, E.dij + 1.2, E.mel + 1.0);
      return {
        p: v3(x, 9 + jump + 0.12 * tau * tau, 3 - 0.06 * tau * tau), yaw: 0.02 * tau, pitch: 0.17 * win(t, E.dij + 1.3, E.mel + 1.1, 0.5, 0.8) + 0.12 * ramp(t, s1e, s1e + 2),
        door: win(t, E.dij - 0.5, E.dij + 3.0, 0.3, 0.4), level: 1 - ramp(t, E.dij, E.dij + 2.6), jump, vis: t < s.s2 + 9, ground: false,
      };
    }
    const rp = railPose(sT(t));
    const jump = 3.0 * ramp(t, E.hilang - 0.6, E.dorong + 0.6);
    const lvl = t < s.s4 ? ramp(t, E.mengisi, E.liter) : 1 - ramp(t, E.air, E.hilang);
    rp.p.y += jump;
    return {
      p: rp.p, yaw: rp.yaw, pitch: rp.pitch + 0.17 * win(t, E.hilang - 0.5, E.pilot + 0.3, 0.5, 0.8), jump,
      door: ramp(t, E.pintu - 0.2, E.pintu + 0.6) * (1 - ramp(t, E.pilot, E.pilot + 1)), level: lvl, vis: t < s.dur, ground: rp.p.y < 2.2,
    };
  }
  function lead(t) {
    const sv = sL(t), rp = railPose(sv);
    rp.p.y -= 0.6 * (1 - ramp(rp.p.y, 1.5, 4));
    return { p: rp.p, yaw: rp.yaw, pitch: rp.pitch, vis: t >= s.s3 - 0.6 && sv < RL - 2 };
  }
  const scX = mono([[s.s7 - 1.2, 46], [E.sendok, 72], [E.detik7 + 0.3, 112], [E.tapi + 1.6, 132]]);
  function scooper(t) {
    const x = scX(t);
    const y = 0.62 + 7 * (1 - ramp(t, s.s7 - 1.2, E.sendok)) + 6 * ramp(t, E.detik7 + 0.3, E.tapi + 1.6);
    return { p: v3(x, y, -10), pitch: -0.08 * win(t, s.s7, E.sendok, 0.3, 0.4) + 0.14 * win(t, E.detik7 + 0.2, E.tapi + 1.5, 0.4, 0.4), scoop: win(t, E.sendok, E.detik7, 0.2, 0.3), vis: t > s.s7 - 1.3 && t < E.tapi + 1.8 };
  }

  // ---------- water particles (two drop curtains, lake spray, truck hoses) ----------
  const ND = [760, 960], NSP = 320, NHS = 90, NTOT = ND[0] + ND[1] + NSP + NHS;
  const wPos = new Float32Array(NTOT * 3);
  const wGeo = new THREE.BufferGeometry(); wGeo.setAttribute("position", new THREE.BufferAttribute(wPos, 3));
  const dropTex = canvasTex(64, 64, (c) => { c.beginPath(); c.arc(32, 32, 27, 0, 6.283); c.fillStyle = "#EFFBFF"; c.fill(); c.lineWidth = 6; c.strokeStyle = "#0B4F8A"; c.stroke(); c.beginPath(); c.arc(25, 24, 7, 0, 6.283); c.fillStyle = "#FFFFFF"; c.fill(); });
  const water = new THREE.Points(wGeo, new THREE.PointsMaterial({ map: dropTex, size: 0.55, sizeAttenuation: true, transparent: true, alphaTest: 0.4, depthWrite: true, toneMapped: false }));
  water.frustumCulled = false; S.add(water);
  const WJ = Array.from({ length: NTOT }, () => [R() - 0.5, R() - 0.5, R(), R()]);

  // ---------- lead-plane marked lane (comic dashed line above the canopy) ----------
  const laneX = []; for (let x = -42; x <= 24; x += 1.7) laneX.push(x);
  const lane = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 0.12, 0.34), new THREE.MeshBasicMaterial({ color: "#FFE100", toneMapped: false }), laneX.length);
  const laneH = new THREE.InstancedMesh(new THREE.BoxGeometry(1.16, 0.2, 0.5), INKF, laneX.length);
  lane.frustumCulled = laneH.frustumCulled = false; S.add(lane, laneH);

  // ---------- comic lettering sprites ----------
  const SP = {
    byur1: sprite(burstTex("BYURRR!", P.yel, "#00A3E0"), 7.2, 3.9), byur2: sprite(burstTex("BYURRR!", P.yel, "#00A3E0"), 7.2, 3.9),
    hup: sprite(burstTex("HUP!", "#FFFFFF", P.mag, 900, 560, 11), 4.4, 2.7), hup2: sprite(burstTex("HUP!", "#FFFFFF", P.mag, 900, 560, 11), 4.6, 2.85),
    ngeng: sprite(burstTex("NGEEENG!", "#FFFFFF", P.red), 6.2, 3.4), wus: sprite(burstTex("WUSSS!", P.yel, P.red), 5.6, 3.1),
    x: sprite(canvasTex(256, 256, (c) => { c.lineCap = "round"; for (const [lw, col] of [[64, P.ink], [40, P.red]]) { c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.moveTo(50, 50); c.lineTo(206, 206); c.moveTo(206, 50); c.lineTo(50, 206); c.stroke(); } }), 12, 12),
    warn: sprite(canvasTex(256, 256, (c) => { c.beginPath(); c.moveTo(128, 18); c.lineTo(240, 226); c.lineTo(16, 226); c.closePath(); c.fillStyle = P.yel; c.fill(); c.lineWidth = 16; c.lineJoin = "round"; c.strokeStyle = P.ink; c.stroke(); c.font = `900 150px Impact, "Arial Black"`; c.textAlign = "center"; c.fillStyle = P.ink; c.fillText("!", 128, 210); }), 3.2, 3.2),
    b1: sprite(badgeTex("1", P.yel, P.ink), 3.2, 3.2), b2: sprite(badgeTex("2", P.yel, P.ink), 3.2, 3.2), b3: sprite(badgeTex("3", P.yel, P.ink), 3.2, 3.2),
  };
  for (const k in SP) S.add(SP[k]);
  const pop = (sp, on, pos, wob = 0) => {
    sp.visible = on > 0.01; if (!sp.visible) return;
    const k = back(on, 2.2); sp.scale.set(sp.userData.w * k, sp.userData.h * k, 1); sp.material.opacity = Math.min(1, on * 1.4); sp.material.rotation = wob; sp.position.copy(pos);
  };

  // ---------- camera-attached foreground layer (per zone) ----------
  const FG = new THREE.Group(); cam.add(FG);
  const fgLeaf = new THREE.Group(), fgAir = new THREE.Group(), fgLake = new THREE.Group();
  FG.add(fgLeaf, fgAir, fgLake);
  for (const [x, y, sc, m] of [[-1.05, -1.75, 0.55, M.tree1], [1.1, -1.65, 0.45, M.tree2], [-1.15, 1.2, 0.3, M.tree2]]) {
    const cl = new THREE.Group(); for (let i = 0; i < 4; i++) inked(new THREE.IcosahedronGeometry(sc * (0.7 + 0.15 * i), 1), m, 0.03, cl, v3((i - 1.5) * sc * 0.6, Math.sin(i * 2) * sc * 0.3, 0));
    cl.position.set(x, y, -4.2); fgLeaf.add(cl);
  }
  for (const [x, y] of [[-0.95, -1.7], [1.0, -1.75]]) { const cg = new THREE.ConeGeometry(0.22, 0.6, 12); inked(cg, M.orange, 0.025, fgAir, v3(x, y, -4)); }
  for (let i = 0; i < 9; i++) { const cg = new THREE.ConeGeometry(0.04, 0.9 + (i % 3) * 0.25, 5); cg.translate(0, 0.45, 0); inked(cg, M.tree2, 0.015, fgLake, v3(-1.15 + (i % 3) * 0.12 + (i > 4 ? 2.15 : 0), -2.15, -4 + (i % 2) * 0.2)); }

  // ---------- camera shots ----------
  const tb = (t) => tanker(t);
  const off = (keys) => track(keys);
  const shH = off([[0, -12, 2.5, 42, 2, -1.2, 0], [E.dij, -11, 2.2, 43, 1.5, -1.4, 0], [E.mel, -8, 2.5, 44, 1, -0.6, 0], [s1e, -5, 3.5, 46, 0, -0.4, 0], [s.s2, -2, 3, 48, -1, -2.5, 0]]);
  const shW = off([[s.s2, 10, 34, 64, 3, 0, -4], [E.tiga, 4, 46, 70, 0, 0, -9], [E.herc, -2, 48, 70, -2, 0, -9], [s.s2e, -10, 50, 72, -5, 0, -8]]);
  const shA = off([[s.s3, -40, 30, 50, -54, 0, 2], [E.sungai + 0.4, -44, 27, 46, -55, 0, 0], [E.balik + 0.5, -97, 9, 32, -109, 1.6, 4], [E.liter, -106, 7.5, 33, -109.5, 0.6, 4], [s.s3e, -105, 8, 34, -109, 0.7, 4]]);
  const shT0 = off([[s.s4, -130, 6.5, 17, -101, 2.2, 5.5], [E.pemandu, -128, 6, 16, -97, 2.0, 5.5]]);
  const shTr = off([[E.terbang - 0.5, -14, 6, 30, 3, -1.5, 0], [E.menandai, -13, 8, 32, 4, -3, 0], [E.mengecek, -8, 10, 36, 3, -5, 0], [s.s4e, -6, 10, 38, 3, -5.5, 0]]);
  const shD = off([[s.s5, -14, 1, 34, 2, -1.6, 0], [E.puluhan, -8, 0, 34, 1, -2.4, 0], [E.komputer, 3, -2.0, 21, 0, -0.1, 0], [E.pintu + 0.8, 4, -2.2, 21, 0, -0.3, 0], [E.air, 4, -1, 28, 0, -2.2, 0], [E.hujan, 4, 1, 38, -1, -2.6, 0], [s.s5e, 3, 1, 38, -1, -2.4, 0]]);
  const shJ = off([[s.s6, 2, 1.5, 40, 0, 0.6, 0], [E.gaya, -1, 1.5, 38, 0, 0.8, 0], [E.dorong, 0, 1.5, 40, 0, 1.4, 0], [s.s6e, 2, 1.5, 42, 0, 1.0, 0]]);
  const shL = off([[s.s7, -14, 6, 32, 0, -0.5, 0], [E.sendok, -6, 7, 28, 0, -0.5, 0], [E.detik7, -5, 7, 28, 0, -0.5, 0], [E.tapi, -5, 7.5, 28, 0, -0.5, 0]]);
  const shP = off([[E.tapi, -3, -0.6, 64, -3, -3.0, 40], [E.gambut + 0.8, -1, -1.4, 59, -2, -3.4, 40], [E.tim, 0, 4.2, 66, -2, 0.6, 32], [s.s8, 1, 5, 66, -2, 1.0, 32]]);
  const shO = off([[s.s8, 4, 14, 74, -1, 0, 6], [E.membeli, 10, 38, 82, 0, 0, -4], [s.dur, 14, 46, 86, 2, 0, -4]]);
  const rel = (o, p, jumpDamp = 0) => [p.x + o[0], p.y + o[1] - jumpDamp, p.z + o[2], p.x + o[3], p.y + o[4] - jumpDamp, p.z + o[5]];
  const SHOTS = [
    { a: 0, f: (t) => { const k = tb(t); return rel(shH(t), k.p, k.jump * 0.55); } },
    { a: s.s2, f: (t) => shW(t) },
    { a: s.s3, f: (t) => shA(t) },
    { a: s.s4, f: (t) => { const a0 = shT0(t), L = lead(t); const b0 = rel(shTr(t), L.p); const u = ramp(t, E.terbang - 0.7, E.terbang + 0.5); return a0.map((v, i) => lerp(v, b0[i], u)); } },
    { a: s.s5, f: (t) => { const k = tb(t); return rel(shD(t), k.p); } },
    { a: s.s6, f: (t) => { const k = tb(t); return rel(shJ(t), k.p, k.jump * 0.45); } },
    { a: s.s7, f: (t) => rel(shL(t), scooper(t).p) },
    { a: E.tapi + 0.2, f: (t) => shP(t) },
    { a: s.s8, f: (t) => shO(t) },
  ];
  const BW = 0.6;
  function camAt(t) {
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].a) i++;
    let c = SHOTS[i].f(t);
    if (i + 1 < SHOTS.length && t > SHOTS[i + 1].a - BW) {
      const u = ramp(t, SHOTS[i + 1].a - BW, SHOTS[i + 1].a + BW), n = SHOTS[i + 1].f(t);
      const d = Math.hypot(n[0] - c[0], n[2] - c[2]);
      c = c.map((v, j) => lerp(v, n[j], u)); c[1] += Math.sin(Math.PI * u) * Math.min(18, d * 0.12);
    } else if (i > 0 && t < SHOTS[i].a + BW) {
      const u = ramp(t, SHOTS[i].a - BW, SHOTS[i].a + BW), p = SHOTS[i - 1].f(t);
      const d = Math.hypot(p[0] - c[0], p[2] - c[2]);
      c = p.map((v, j) => lerp(v, c[j], u)); c[1] += Math.sin(Math.PI * u) * Math.min(18, d * 0.12);
    }
    return c;
  }

  // ---------- post: NaN guard -> output (Neutral, exposure .9) -> print grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,20.);}" })));
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uShake: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uShake;varying vec2 vUv;void main(){vec2 o=vec2(.0009+.004*uShake,0.);
      float rr=texture2D(tDiffuse,vUv+o).r;vec3 c=texture2D(tDiffuse,vUv).rgb;c.r=mix(c.r,rr,.55);
      c=mix(vec3(dot(c,vec3(.299,.587,.114))),c,1.12);c*=vec3(1.02,1.0,.96);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  const tq = new THREE.Quaternion(), eul = new THREE.Euler();
  const placePlane = (obj, pose) => { obj.position.copy(pose.p); obj.rotation.set(0, 0, 0); eul.set(0, pose.yaw || 0, pose.pitch || 0, "YXZ"); obj.quaternion.setFromEuler(eul); };

  return (t) => {
    // ----- camera -----
    const c = camAt(t);
    const shake = Math.max(win(t, E.dij + 0.9, E.dij + 1.6, 0.05, 0.5), win(t, E.air + 1.4, E.air + 2.0, 0.05, 0.5), 0.6 * win(t, E.dorong, E.dorong + 0.6, 0.05, 0.4));
    cam.position.set(c[0] + 0.05 * Math.sin(t * 0.8) + shake * 0.25 * Math.sin(t * 61), c[1] + 0.04 * Math.sin(t * 0.63 + 1) + shake * 0.2 * Math.sin(t * 47), c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld(true);
    gradeU.uShake.value = shake;
    sky.position.copy(cam.position);
    // foreground layer by zone
    const zx = cam.position.x;
    fgAir.visible = zx < -70 && t > s.s3; fgLake.visible = zx > 48 && t < E.tapi + 0.3; fgLeaf.visible = !fgAir.visible && !fgLake.visible && cam.position.y < 30;
    FG.position.set(0.04 * Math.sin(t * 0.7), 0.03 * Math.sin(t * 0.9), 0);
    // action rays behind hero beats
    const rOn = Math.max(win(t, E.dij + 0.4, s1e, 0.3, 0.5), win(t, E.hilang, E.pilot + 0.8, 0.4, 0.5), 0.8 * win(t, E.sendok, E.detik7, 0.3, 0.4));
    rays.visible = rOn > 0.01;
    if (rays.visible) { const fw = v3(0, 0, -1).applyQuaternion(cam.quaternion); rays.position.copy(cam.position).addScaledVector(fw, 300); rays.quaternion.copy(cam.quaternion); rays.scale.setScalar(560); rays.rotation.z += t * 0.05; rays.material.opacity = 0.55 * rOn; }

    // ----- tanker -----
    const k = tanker(t);
    TK.g.visible = k.vis;
    placePlane(TK.g, k);
    TK.props.forEach((p, i) => (p.rotation.x = t * 31 + i));
    TK.doors.forEach(([piv, sd]) => (piv.rotation.x = sd * 1.25 * k.door));
    TK.gauge.scale.x = Math.max(0.001, k.level);
    TK.gear.visible = k.ground;
    const fast = Math.max(ramp(t, 0, 0.1) * (t < s.s2 ? 0.6 : 0), win(t, E.terbang + 0.2, s.s5 + 1.2, 0.3, 0.6));
    TK.sl.children.forEach((m) => { const u = m.userData; const ph = (t * 1.7 + u.ph) % 1; m.scale.x = u.l * (0.5 + ph); m.position.set(u.x - ph * 4, u.y, u.z); m.material.opacity = fast * (1 - ph) * 0.9; m.visible = fast > 0.02; });
    const lOn = win(t, E.gaya - 0.1, s.s6e, 0.25, 0.4), wOn = win(t, E.kenapa + 1.2, s.s6e, 0.3, 0.4);
    TK.lift.visible = lOn > 0.01; TK.lift.scale.setScalar(0.001 + back(lOn, 1.8));
    TK.wgt.visible = wOn > 0.01; const wk = 1 - 0.55 * ramp(t, E.hilang - 0.6, E.berat + 0.4); TK.wgt.scale.set(0.001 + wOn, (0.001 + wOn) * wk, 0.001 + wOn);

    // ----- lead plane -----
    const L = lead(t);
    LD.g.visible = L.vis; placePlane(LD.g, L);
    // marked lane appears where the lead has flown
    const lx = L.vis ? L.p.x : -999, laneOn = 1 - ramp(t, E.pilot, E.pilot + 1.2);
    laneX.forEach((x, i) => {
      const on = t > s.s4 && lx > x ? laneOn * ramp(lx - x, 0, 3) : 0;
      const sc = on > 0.01 ? on : 0.0001;
      dm.position.set(x, 5.0, 3); dm.rotation.set(0, 0, 0); dm.scale.set(sc, sc, sc); dm.updateMatrix(); lane.setMatrixAt(i, dm.matrix); laneH.setMatrixAt(i, dm.matrix);
    });
    lane.instanceMatrix.needsUpdate = laneH.instanceMatrix.needsUpdate = true;

    // ----- scooper -----
    const sc = scooper(t);
    SC.g.visible = sc.vis; SC.g.position.copy(sc.p); SC.g.rotation.set(0, 0, sc.pitch);
    SC.probes.visible = sc.scoop > 0.05; SC.probes.position.y = -0.25 * (1 - sc.scoop);

    // ----- flames, smoke, steam -----
    flames.forEach((f, i) => {
      const sup = suppress(f, t);
      const hgt = f.sc * (0.85 + 0.25 * Math.sin(t * 7.3 + f.ph) + 0.15 * Math.sin(t * 13.1 + f.ph * 2)) * sup;
      const wd = f.sc * (0.9 + 0.1 * Math.sin(t * 5 + f.ph)) * (0.4 + 0.6 * sup);
      dm.position.set(f.x, 0, f.z); dm.rotation.set(0.12 * Math.sin(t * 3 + f.ph), f.ph, 0.12 * Math.sin(t * 2.6 + f.ph)); dm.scale.set(wd, Math.max(0.02, hgt), wd); dm.updateMatrix();
      flO.setMatrixAt(i, dm.matrix); flH.setMatrixAt(i, dm.matrix); flI.setMatrixAt(i, dm.matrix);
    });
    flO.instanceMatrix.needsUpdate = flH.instanceMatrix.needsUpdate = flI.instanceMatrix.needsUpdate = true;
    SMK.forEach((m, i) => {
      const f = flames[m.f], u = (t / m.P + m.ph) % 1, sup = suppress(f, t);
      const scl = (0.45 + 2.3 * u) * Math.min(1, u * 6) * Math.min(1, (1 - u) * 4) * (0.35 + 0.65 * sup);
      dm.position.set(f.x + u * 7 + m.dx * 2, 1.4 + u * 14, f.z - u * 6); dm.rotation.set(u * 2, m.ph * 6, 0); dm.scale.setScalar(Math.max(0.001, scl)); dm.updateMatrix();
      smoke.setMatrixAt(i, dm.matrix); smokeH.setMatrixAt(i, dm.matrix);
    });
    smoke.instanceMatrix.needsUpdate = smokeH.instanceMatrix.needsUpdate = true;
    STM.forEach((m, i) => {
      const d = DROPS[m.d], x = d.x0 + m.u * (d.x1 - d.x0), th = d.t0 + m.u * (d.t1 - d.t0) + d.fall + 0.4;
      const age = t - th, u = ((age / m.P) + m.ph) % 1;
      const on = age > 0 ? Math.min(1, age) * (1 - ramp(age, 14, 20)) : 0;
      const scl = on * (0.4 + 1.6 * u) * Math.min(1, (1 - u) * 4) * Math.min(1, u * 8);
      dm.position.set(x + u * 2, 2.2 + u * 7, 3.3 + m.dz * 2 - u * 2); dm.rotation.set(0, 0, 0); dm.scale.setScalar(Math.max(0.001, scl)); dm.updateMatrix();
      steam.setMatrixAt(i, dm.matrix); steamH.setMatrixAt(i, dm.matrix);
    });
    steam.instanceMatrix.needsUpdate = steamH.instanceMatrix.needsUpdate = true;

    // ----- embers in the peat (front face) -----
    const peatOn = 0.35 + 0.65 * ramp(t, E.tapi, E.gambut + 0.4);
    emb.forEach((e, i) => {
      const pulse = 0.75 + 0.25 * Math.sin(t * 3.1 + e.ph) * Math.sin(t * 1.3 + e.ph * 2);
      dm.position.set(e.x, e.y, 45.05); dm.rotation.set(0, 0, 0); dm.scale.setScalar(e.r * pulse * peatOn); dm.updateMatrix(); embI.setMatrixAt(i, dm.matrix);
      dm.position.z = 45.07; dm.scale.setScalar(e.r * 0.5 * pulse * peatOn); dm.updateMatrix(); embC.setMatrixAt(i, dm.matrix);
    });
    embI.instanceMatrix.needsUpdate = embC.instanceMatrix.needsUpdate = true;

    // ----- water particles -----
    let o = 0;
    const hide = (j) => { wPos[j * 3] = 0; wPos[j * 3 + 1] = -999; wPos[j * 3 + 2] = 0; };
    DROPS.forEach((d, di) => {
      const n = ND[di], G = di === 0 ? 9.5 : 4.2;
      for (let i = 0; i < n; i++, o++) {
        const J = WJ[o], rr = (i + J[2]) / n, tr = d.t0 + rr * (d.t1 - d.t0), tau = t - tr;
        if (tau < 0) { hide(o); continue; }
        const bp = tanker(tr);
        const bx = bp.p.x + 0.4, by = bp.p.y - 1.05, bz = bp.p.z;
        const y = by - 0.5 * G * tau * tau - 0.6 * tau;
        if (y < 0.4 || tau > 6) { hide(o); continue; }
        const sp = 0.25 + tau * (1.1 + 0.5 * J[3]);
        wPos[o * 3] = bx + 0.9 * Math.min(tau, 1.3) + J[0] * sp * 1.2 + J[0] * 1.6;
        wPos[o * 3 + 1] = y + J[1] * 0.3;
        wPos[o * 3 + 2] = bz + J[1] * sp * 1.4;
      }
    });
    // lake spray: V-wake from the hull while scooping
    for (let i = 0; i < NSP; i++, o++) {
      const J = WJ[o], a = ((t * 0.9 + J[2] * 1.3) % 1.3), te = t - a, so = scooper(te);
      if (so.scoop < 0.2 || !sc.vis) { hide(o); continue; }
      const side = J[0] > 0 ? 1 : -1;
      wPos[o * 3] = so.p.x - 0.8 - a * 2.4 + J[1] * 0.4;
      wPos[o * 3 + 1] = 0.2 + a * (2.6 + J[3]) - 4.2 * a * a;
      wPos[o * 3 + 2] = so.p.z + side * (0.5 + a * (2.4 + 1.4 * J[3]));
      if (wPos[o * 3 + 1] < 0.05) hide(o);
    }
    // truck hoses (ground team) aimed at the burning edge
    const hoseOn = ramp(t, E.tim - 0.4, E.tim + 0.3);
    for (let i = 0; i < NHS; i++, o++) {
      const J = WJ[o], tr = trucks[i % 2];
      if (hoseOn < 0.05) { hide(o); continue; }
      const a = ((t * 1.1 + J[2]) % 1);
      const x0 = tr.position.x, z0 = tr.position.z - 0.8;
      wPos[o * 3] = x0 + J[0] * a * 1.2 + (i % 2 ? -1 : 1) * a * 1.5;
      wPos[o * 3 + 1] = 1.8 + a * 3.2 - 5 * a * a;
      wPos[o * 3 + 2] = z0 - a * 9 + J[1] * a;
      if (wPos[o * 3 + 1] < 0.1) hide(o);
    }
    wGeo.attributes.position.needsUpdate = true;
    water.material.size = 0.72;

    // ----- hose at the airport -----
    const hoseVis = t > s.s3 - 0.6 && t < E.terbang - 0.2;
    hose.visible = hoseInk.visible = hoseVis;
    dashTex.offset.x = -t * 1.8 * ramp(t, E.mengisi - 0.2, E.mengisi + 0.3) * (1 - ramp(t, E.liter, E.liter + 0.4));

    // ----- comic lettering -----
    const TKp = k.p;
    pop(SP.byur1, win(t, E.dij + 0.9, E.dij + 3.0, 0.25, 0.3), v3(TKp.x - 1.5, 3.6, 6), -0.08);
    pop(SP.hup, win(t, E.mel, s1e + 0.4, 0.2, 0.3), v3(TKp.x + 3.5, TKp.y + 2.4, 3), 0.1);
    pop(SP.b1, win(t, E.tiga, s.s2e, 0.2, 0.3), v3(6.5, 5, 3.5)); pop(SP.b2, win(t, E.tiga + 0.25, s.s2e, 0.2, 0.3), v3(-4, 5, 3.5)); pop(SP.b3, win(t, E.tiga + 0.5, s.s2e, 0.2, 0.3), v3(-24, 5, -20));
    pop(SP.x, win(t, E.sungai - 0.1, E.balik - 0.1, 0.18, 0.25), v3(-54, 4, 4), -0.05);
    pop(SP.ngeng, win(t, E.terbang - 0.2, E.terbang + 1.6, 0.2, 0.3), L.p.clone().add(v3(-1, -2.5, 3)), 0.06);
    pop(SP.warn, win(t, E.mengecek - 0.1, s.s4e + 0.2, 0.2, 0.3), v3(-28, 8.6, 2.5));
    pop(SP.byur2, win(t, E.air + 1.4, E.sisi + 0.8, 0.25, 0.3), v3(TKp.x - 2, 3.0, 8), -0.06);
    pop(SP.hup2, win(t, E.dorong, E.pilot + 0.4, 0.2, 0.3), v3(TKp.x + 3.2, TKp.y + 2.6, 3), 0.1);
    pop(SP.wus, win(t, E.sendok + 0.2, E.detik7 + 0.2, 0.2, 0.3), sc.p.clone().add(v3(-4, 2.6, 0)), -0.07);

    comp.render();
  };
}
