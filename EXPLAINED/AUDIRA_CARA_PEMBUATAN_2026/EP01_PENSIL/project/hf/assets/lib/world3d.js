// EP01 PENSIL (SKETCHFORGE): one giant sketchbook page on a graphite desk. Every object is first drawn on the page in
// pencil, then its edges peel up and a clip plane fills it with paper-clay, then the single accent (pencil yellow) floods in.
// A post pass adds pencil outlines and screen-space hatching in the shadows, so the whole world reads as a graphite drawing.
// Stations run along +x: A hook pencil, A2 Borrowdale, B mix + extrude, C kiln + wax, D sandwich, E ratio, F paint + payoff.
// Illustration only: own drawings, no brands, no real packaging. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, envStrips } from "./lib3d.js";

const P = { graphite: "#2F3034", mid: "#5A5B61", soft: "#8C8D93", clay: "#BDB8B0", paper: "#F3EBDD", shade: "#E2D6C2", white: "#FBF7EF",
  accent: "#F2B31B", accentDeep: "#C98A0C", glow: "#FFC860", desk: "#2A2826", wood: "#D9B98E", woodDark: "#B8915F" };
const HAND = "'Segoe Print','Bradley Hand','Comic Sans MS',cursive", MONO = "'Courier New',monospace";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Pencil look in display space: wobbly Sobel outlines in graphite, hatching that thickens with darkness, warm paper lift.
const Sketch = { uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1080, 1920) }, uT: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uT;varying vec2 vUv;
  float L(vec2 u){return dot(texture2D(tDiffuse,u).rgb,vec3(.299,.587,.114));}
  float hsh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  float ln(float v,float w){float f=abs(fract(v)-.5);return 1.0-smoothstep(w*.5,w*.5+.12,f);}
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);vec2 px=vUv*uRes;
   float jt=floor(uT*6.0);vec2 wob=vec2(sin(px.y*.045+jt*1.7),cos(px.x*.05+jt*2.3))*.9/uRes;
   vec2 e=1.4/uRes;vec2 u=vUv+wob;
   float tl=L(u+vec2(-e.x,e.y)),t=L(u+vec2(0.,e.y)),tr=L(u+e),l=L(u-vec2(e.x,0.)),r=L(u+vec2(e.x,0.)),bl=L(u-e),b=L(u-vec2(0.,e.y)),br=L(u+vec2(e.x,-e.y));
   float gx=-tl-2.*l-bl+tr+2.*r+br,gy=-bl-2.*b-br+tl+2.*t+tr;float edge=smoothstep(.09,.3,length(vec2(gx,gy)));
   float lum=dot(c,vec3(.299,.587,.114));float n=hsh(floor(px/3.0))*.35;
   float h1=ln((px.x+px.y)/7.0+n*.3,.42)*smoothstep(.70,.48,lum);
   float h2=ln((px.x-px.y)/8.0+n*.3,.40)*smoothstep(.46,.26,lum);
   float h3=ln(px.x/6.0,.36)*smoothstep(.24,.10,lum);
   float hatch=clamp(h1*.55+h2*.6+h3*.5,0.0,1.0);
   vec3 gr=vec3(.184,.188,.204);
   vec3 o=mix(c,gr,hatch*.33);o=mix(o,gr*.9,edge*.78);
   o=mix(o,o*vec3(1.02,1.0,.96),.5);
   gl_FragColor=vec4(o,1.0);}` };

function dyn(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let key = null;
  return { tex, g, paint(k, fn) { if (k === key) return; key = k; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; } };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x2a2826, fog: 0.0016, exp: 0.95, bloom: [0.18, 0.4, 1.3] });
  r.toneMapping = THREE.NeutralToneMapping;
  r.localClippingEnabled = true;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const sk = new ShaderPass(Sketch); comp.addPass(sk);
  envStrips(r, scene, [[6, 3, 0xfff1dc, 1.4, -4, 5, 3], [3, 6, 0xdfe8ff, 0.7, 5, 3, -3]], 0x2a2826);
  scene.environmentIntensity = 0.25;
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const rnd = mulberry(1795);

  // ---------- lights: warm key that follows the subject (so its shadow box stays tight), cool rim, warm fill ----------
  const hemi = new THREE.HemisphereLight(0xfff4e2, 0x4a4238, 1.15); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0d8, 2.1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 260 }); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xd6e2ff, 0.9); scene.add(rim, rim.target);

  // ---------- shared textures and materials ----------
  const grainT = canvasTex(256, 256, (g, w, h) => { const R = mulberry(3); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { g.fillStyle = R() > .5 ? "rgba(255,255,255,.4)" : `rgba(90,80,70,${0.05 + R() * 0.06})`; g.fillRect(R() * w, R() * h, 1.5, 1.5); } }, [3, 3]);
  const mat = (color, rough = 0.85, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, map: grainT, ...extra });
  const woodT = canvasTex(256, 512, (g, w, h) => { const R = mulberry(11); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(120,80,40,${0.04 + R() * 0.07})`; g.lineWidth = 1 + R() * 2; g.beginPath(); const x = R() * w; g.moveTo(x, 0); for (let y = 0; y <= h; y += 32) g.lineTo(x + Math.sin(y * 0.02 + i) * 6, y); g.stroke(); } });
  const woodM = () => new THREE.MeshStandardMaterial({ color: P.wood, roughness: 0.8, map: woodT });
  const graphM = () => new THREE.MeshStandardMaterial({ color: 0x4a4b50, roughness: 0.32, metalness: 0.55 });
  // pencil hatching baked into surfaces, so hard bodies read as shaded drawings, not plain matte boxes
  const hatchT = canvasTex(512, 512, (g, w, h) => { const R = mulberry(41); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.lineCap = "round";
    for (let i = -h; i < w; i += 11) { g.strokeStyle = `rgba(47,48,52,${0.07 + R() * 0.07})`; g.lineWidth = 1.6 + R(); g.beginPath(); g.moveTo(i, h); g.lineTo(i + h * 0.9, 0); g.stroke(); }
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(47,48,52,.18)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const hatchM = (color, rough = 0.4, metal = 0.3) => new THREE.MeshStandardMaterial({ color, map: hatchT, roughness: rough, metalness: metal });
  const lineM = new THREE.LineBasicMaterial({ color: P.graphite, transparent: true, opacity: 0.9 });

  // ---------- desk, sketchbook page, spiral binding ----------
  const deskT = canvasTex(1024, 1024, (g, w, h) => { const R = mulberry(7); g.fillStyle = P.desk; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(${R() > .5 ? "255,240,220" : "0,0,0"},${0.02 + R() * 0.03})`; g.beginPath(); const y = R() * h; g.moveTo(0, y); g.lineTo(w, y + (R() - .5) * 8); g.stroke(); } }, [4, 2]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(900, 500), new THREE.MeshStandardMaterial({ color: 0xffffff, map: deskT, roughness: 0.6, metalness: 0.15 }));
  desk.rotation.x = -Math.PI / 2; desk.position.y = -1.6; desk.receiveShadow = true; scene.add(desk);
  const PW = 320, PD = 120;
  const pageT = canvasTex(2560, 960, (g, w, h) => {
    const R = mulberry(63); g.fillStyle = P.paper; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60000; i++) { g.fillStyle = R() > .5 ? "rgba(255,255,255,.28)" : "rgba(120,110,95,.07)"; g.fillRect(R() * w, R() * h, 1 + R() * 1.6, 1 + R() * 1.6); }
    g.fillStyle = "rgba(90,91,97,.13)"; for (let x = 20; x < w; x += 40) for (let y = 20; y < h; y += 40) g.fillRect(x, y, 2.4, 2.4);
    for (let i = 0; i < 16; i++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 120 + R() * 120); gr.addColorStop(0, "rgba(60,60,66,.07)"); gr.addColorStop(1, "rgba(60,60,66,0)"); g.save(); g.translate(R() * w, R() * h); g.scale(1.8, .7); g.fillStyle = gr; g.fillRect(-260, -260, 520, 520); g.restore(); }
    g.strokeStyle = "rgba(70,70,76,.07)"; g.lineWidth = 3; for (let i = 0; i < 30; i++) { g.beginPath(); const x = R() * w, y = R() * h; g.moveTo(x, y); g.lineTo(x + (R() - .5) * 600, y + (R() - .5) * 300); g.stroke(); }
    g.strokeStyle = "rgba(47,48,52,.25)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 110); g.lineTo(w, 110); g.stroke();
  });
  const page = new THREE.Mesh(new THREE.BoxGeometry(PW, 1.4, PD), [mat(P.shade), mat(P.shade), new THREE.MeshStandardMaterial({ color: 0xffffff, map: pageT, roughness: 0.92 }), mat(P.shade), mat(P.shade), mat(P.shade)]);
  page.position.y = -0.7; page.receiveShadow = true; scene.add(page);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(PW + 6, 0.8, PD + 6), mat(0x34312d, 0.7)); cover.position.y = -1.2; cover.receiveShadow = true; scene.add(cover);
  for (let i = 0; i < 52; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.28, 8, 24), new THREE.MeshStandardMaterial({ color: 0x9a9ba0, metalness: 0.9, roughness: 0.3 })); ring.position.set(-PW / 2 + 4 + i * 6.1, 0.4, -PD / 2 - 0.5); ring.castShadow = true; scene.add(ring); }

  // ---------- sketch pads: pencil drawings that grow on the page, stroke by stroke ----------
  const pads = [];
  function pad(cx, cz, w, d, res = 1024) {
    const D = dyn(res, Math.round(res * d / w));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: D.tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.02, cz); m.renderOrder = 1; scene.add(m);
    const P0 = { cx, cz, w, d, D, m, s: [], tx: [], sc: res / w };
    pads.push(P0); return P0;
  }
  // stroke: local page coords (x right, z toward the viewer), times a..b, width cm, colour, sketchy double pass
  const S = (pd, pts, a, b, o = {}) => { let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); pd.s.push({ pts, a, b, len, w: o.w ?? 0.14, c: o.c ?? P.graphite, dash: o.dash, j: [(rnd() - .5) * .25, (rnd() - .5) * .25], two: o.two ?? true, alpha: o.alpha ?? 1 }); };
  const TX = (pd, s, x, z, a, o = {}) => pd.tx.push({ s, x, z, a, size: o.size ?? 2, c: o.c ?? P.graphite, font: o.font ?? HAND, align: o.align ?? "center", rot: o.rot ?? 0, dur: o.dur ?? 0.6, weight: o.weight ?? "400" });
  const circ = (x, z, rx, rz, n = 28, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + Math.cos(a) * rx, z + Math.sin(a) * rz]; });
  const rect = (x, z, w, d) => [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2], [x - w / 2, z - d / 2]];
  function partial(pts, len, f) {
    const out = [pts[0]]; let acc = 0, goal = len * f;
    for (let i = 1; i < pts.length; i++) { const sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + sl >= goal) { const k = (goal - acc) / Math.max(1e-6, sl); out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); return out; } acc += sl; out.push(pts[i]); }
    return out;
  }
  function padTip(pd, idx, t) { const st = pd.s[idx]; const f = clamp01((t - st.a) / (st.b - st.a)); const p = partial(st.pts, st.len, f); const q = p[p.length - 1]; return [pd.cx + q[0], pd.cz + q[1]]; }
  function paintPads(t) {
    for (const pd of pads) {
      const fs = pd.s.map((s) => clamp01((t - s.a) / (s.b - s.a)));
      const ft = pd.tx.map((x) => clamp01((t - x.a) / x.dur));
      const k = fs.map((f) => Math.round(f * 60)).join(",") + "|" + ft.map((f) => Math.round(f * 30)).join(",");
      pd.D.paint(k, (g, W, H) => {
        const X = (x) => (x + pd.w / 2) * pd.sc, Z = (z) => (z + pd.d / 2) * pd.sc;
        g.lineCap = "round"; g.lineJoin = "round";
        pd.s.forEach((s, i) => {
          const f = fs[i]; if (f <= 0) return;
          const p = partial(s.pts, s.len, f);
          g.globalAlpha = s.alpha; g.strokeStyle = s.c; g.lineWidth = s.w * pd.sc; g.setLineDash(s.dash ? [s.w * pd.sc * 3, s.w * pd.sc * 3] : []);
          g.beginPath(); p.forEach((q, j) => (j ? g.lineTo(X(q[0]), Z(q[1])) : g.moveTo(X(q[0]), Z(q[1])))); g.stroke();
          if (s.two && f > 0.3) { const p2 = partial(s.pts, s.len, clamp01(f * 1.4 - 0.4)); g.globalAlpha = s.alpha * 0.45; g.lineWidth = s.w * pd.sc * 0.6; g.beginPath(); p2.forEach((q, j) => (j ? g.lineTo(X(q[0] + s.j[1]), Z(q[1] + s.j[0])) : g.moveTo(X(q[0] + s.j[0]), Z(q[1] + s.j[1])))); g.stroke(); }
        });
        g.setLineDash([]); g.globalAlpha = 1;
        pd.tx.forEach((x, i) => {
          const f = ft[i]; if (f <= 0) return;
          g.save(); g.translate(X(x.x), Z(x.z)); g.rotate(x.rot); g.font = `${x.weight} ${x.size * pd.sc}px ${x.font}`; g.textAlign = x.align; g.textBaseline = "middle";
          const tw = g.measureText(x.s).width, x0 = x.align === "center" ? -tw / 2 : x.align === "right" ? -tw : 0;
          g.beginPath(); g.rect(x0 - 4, -x.size * pd.sc, (tw + 8) * f, x.size * pd.sc * 2); g.clip(); g.fillStyle = x.c; g.fillText(x.s, 0, 0); g.restore();
        });
      });
    }
  }

  // ---------- risers: edges peel up from the page, then a rising clip plane fills the solid ----------
  const risers = [];
  function riser(g, h, a, b, o = {}) {
    g.updateMatrixWorld(true);
    const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const meshes = []; g.traverse((m) => { if (m.isMesh && !m.userData.noRise) meshes.push(m); });
    const lm = lineM.clone(); const edges = [];
    for (const m of meshes) {
      m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { x.clippingPlanes = [plane]; x.clipShadows = true; });
      m.castShadow = m.receiveShadow = true;
      if (!m.userData.noEdge) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), lm); m.add(e); edges.push(e); }
    }
    const y0 = new THREE.Vector3(); g.getWorldPosition(y0);
    const R0 = { g, h, a, b, plane, lm, y0: y0.y - (o.below ?? 0.2), sy: g.scale.y, keepEdge: o.keepEdge ?? 0.45 };
    risers.push(R0); return R0;
  }
  function updRisers(t) {
    for (const R0 of risers) {
      const k1 = R0.a <= 0 ? 1 : ramp(t, R0.a, R0.a + (R0.b - R0.a) * 0.45), k2 = R0.a <= 0 ? 1 : ramp(t, R0.a + (R0.b - R0.a) * 0.3, R0.b);
      R0.g.visible = R0.a <= 0 || t > R0.a;
      R0.g.scale.y = R0.sy * (0.04 + 0.96 * k1);
      R0.lm.opacity = 0.95 * (1 - (1 - R0.keepEdge) * k2);
      R0.plane.constant = k2 >= 1 ? 1e5 : R0.y0 + (R0.h + 0.4) * k2;
    }
  }
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const mesh = (geo, m, x = 0, y = 0, z = 0, p) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };
  const card = (w, h, draw, res = 512) => { const tx = canvasTex(res, Math.round(res * h / w), draw); return new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9 }); };
  // A finished-pencil body (hex) along +y, length L, radius R; coloured by mat m. Ends show wood ring and grey core.
  function hexPencil(L, R, m, p, coreR = R * 0.32) {
    const g = G(0, 0, 0, p);
    mesh(new THREE.CylinderGeometry(R, R, L, 6), m, 0, 0, 0, g);
    for (const s of [-1, 1]) {
      const cap = mesh(new THREE.CircleGeometry(R * 0.93, 6), new THREE.MeshStandardMaterial({ color: P.wood, roughness: 0.8, map: woodT }), 0, s * (L / 2 + 0.01), 0, g); cap.rotation.x = -s * Math.PI / 2; cap.userData.noEdge = true;
      const core = mesh(new THREE.CircleGeometry(coreR, 18), new THREE.MeshStandardMaterial({ color: 0x3a3b40, roughness: 0.4, metalness: 0.5 }), 0, s * (L / 2 + 0.02), 0, g); core.rotation.x = -s * Math.PI / 2; core.userData.noEdge = true;
    }
    return g;
  }

  // =============== STATION A (s1): the giant cut-open pencil, the Pb card that gets crossed out ===============
  const AX = -122;
  const padA = pad(AX, 4, 70, 70);
  // the drawing of the pencil stays under it, plus page notes with the AUDIRA study title
  const pz0 = -20, pz1 = 24, PR = 2.6;
  TX(padA, "AUDIRA", -5, -15.5, -1, { size: 2.8, font: MONO, weight: "700" });
  TX(padA, "studi 01", -5, -12.9, -1, { size: 1.3, font: MONO, weight: "700" });
  S(padA, [[-10, -14.1], [0, -14.1]], -1, -0.5, { w: 0.16 });
  const pencilA = G(AX, 0, 2); pencilA.rotation.y = -0.32;
  {
    const L = pz1 - pz0, zc = (pz0 + pz1) / 2;
    // lacquer half-hex shell (cut lengthwise), cut face on top, sharpened tip toward the viewer, ferrule + eraser behind
    const shell = mesh(new THREE.CylinderGeometry(PR, PR, L, 3, 1, false, -Math.PI / 2, Math.PI), mat(P.accent, 0.42, 0, { side: THREE.DoubleSide }), 0, PR * 0.866, zc, pencilA); shell.rotation.x = Math.PI / 2;
    const cutT = canvasTex(256, 1024, (g, w, h) => { g.drawImage(woodT.image, 0, 0, w, h); g.globalCompositeOperation = "multiply"; g.fillStyle = P.wood; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over"; g.fillStyle = P.accent; g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h); g.fillStyle = "#43444a"; g.fillRect(w / 2 - 34, 0, 68, h); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(w / 2 - 20, 0, 10, h); g.strokeStyle = "rgba(47,48,52,.9)"; g.lineWidth = 4; g.strokeRect(w / 2 - 34, -4, 68, h + 8); });
    const cut = mesh(new THREE.BoxGeometry(PR * 2, 0.08, L), new THREE.MeshStandardMaterial({ map: cutT, roughness: 0.75 }), 0, PR * 0.866 + 0.02, zc, pencilA);
    const tip = mesh(new THREE.CylinderGeometry(0.01, PR * 0.97, 9, 6), woodM(), 0, PR * 0.866, pz1 + 4.5, pencilA); tip.rotation.x = Math.PI / 2;
    const lead = mesh(new THREE.CylinderGeometry(0.01, PR * 0.32, 2.6, 16), graphM(), 0, PR * 0.866, pz1 + 7.75, pencilA); lead.rotation.x = Math.PI / 2;
    const fer = mesh(new THREE.CylinderGeometry(PR * 1.02, PR * 1.02, 4, 24), new THREE.MeshStandardMaterial({ color: 0xc9c6c0, metalness: 0.9, roughness: 0.32 }), 0, PR * 0.866, pz0 - 2, pencilA); fer.rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const rg = mesh(new THREE.TorusGeometry(PR * 1.03, 0.12, 6, 24), fer.material, 0, PR * 0.866, pz0 - 0.6 - i * 0.9, pencilA); }
    const er = mesh(new THREE.CylinderGeometry(PR * 0.98, PR * 0.98, 3.4, 24), mat(P.clay, 0.95), 0, PR * 0.866, pz0 - 5.7, pencilA); er.rotation.x = Math.PI / 2;
    riser(pencilA, PR * 2, -1, 0);
  }
  S(padA, [[-8, 26], [0, 37], [8, 26]], -1, -0.5, { w: 0.2, alpha: 0.5 });
  // "Pb" element card that gets struck out, and a graphite lump label
  const pbD = dyn(512, 600);
  const pbCard = G(AX - 15, 0, -9.8); pbCard.scale.setScalar(0.82);
  const pbM = new THREE.MeshStandardMaterial({ map: pbD.tex, roughness: 0.9 });
  mesh(new THREE.BoxGeometry(11, 13, 0.5), [mat(P.shade), mat(P.shade), mat(P.shade), mat(P.shade), pbM, mat(P.shade)], 0, 6.5, 0, pbCard).rotation.x = -0.12;
  mesh(new THREE.BoxGeometry(6, 0.6, 3), mat(P.mid, 0.7), 0, 0.3, 0.6, pbCard);
  pbCard.rotation.y = 0.35;
  riser(pbCard, 13, A("s1:mengandung") - 0.2, A("s1:timbal") + 0.2);

  // =============== STATION A2 (s2): Borrowdale hills, the lump, a miner card, the "TIMBAL?" tag, old paint tin ===============
  const BX = -78;
  const padB = pad(BX, 0, 60, 70);
  for (let k = 0; k < 4; k++) S(padB, Array.from({ length: 30 }, (_, i) => { const x = -26 + i * 1.8; return [x, -14 + k * 3.2 - 7 * Math.exp(-((x + 8) ** 2) / 90) - 4 * Math.exp(-((x - 12) ** 2) / 60)]; }), A("s2:abad") + k * 0.25, A("s2:Inggris") + 0.3 + k * 0.25, { w: 0.13, alpha: 0.75 });
  TX(padB, "abad ke-16 · Inggris", -24, -27, A("s2:Inggris"), { size: 2.4, align: "left" });
  const lump = G(BX - 3, 0, -2);
  {
    // graphite ore reads as layered mineral: matte-metallic grey + cleavage hatching + metallic flecks (not a glossy black gem)
    const oreT = canvasTex(512, 512, (g, w, h) => { const R = mulberry(23);
      g.fillStyle = "#34353a"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(20,20,24,${0.06 + R() * 0.12})`; const s = 10 + R() * 70; g.fillRect(R() * w, R() * h, s, s * (0.3 + R() * 0.5)); }
      g.lineCap = "round"; for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(150,152,160,${0.08 + R() * 0.22})`; g.lineWidth = 0.8 + R() * 1.6; const x = R() * w, y = R() * h, a = -0.7 + R() * 0.3, l = 16 + R() * 44; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(200,202,210,${0.1 + R() * 0.3})`; g.fillRect(R() * w, R() * h, 1.4, 1.4); }
    });
    const geo = new THREE.DodecahedronGeometry(4.2, 1); const pos = geo.attributes.position; const R2 = mulberry(16);
    for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); v.multiplyScalar(0.82 + R2() * 0.3); v.y *= 0.72; pos.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    const lm2 = mesh(geo, new THREE.MeshStandardMaterial({ color: 0x45464c, map: oreT, roughnessMap: oreT, roughness: 0.52, metalness: 0.5, flatShading: true }), 0, 2.8, 0, lump);
  }
  riser(lump, 6.2, A("s2:menemukan") - 0.1, A("s2:grafit") + 0.6);
  S(padB, circ(-3, -2, 6, 5), A("s2:menemukan") - 0.5, A("s2:menemukan") + 0.3, { w: 0.16 });
  // miner: a drawn paper cut-out standing on a card foot (generic, faceless, proper proportions)
  const minerT = canvasTex(512, 900, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.lineJoin = "round"; g.lineCap = "round";
    const body = "#8a97a6", skin = "#efd7b6", ink = P.graphite;
    const fillS = (c, f) => { g.fillStyle = c; g.beginPath(); f(); g.fill(); g.strokeStyle = ink; g.lineWidth = 7; g.stroke(); };
    // legs with bent knees
    fillS("#6c7480", () => { g.moveTo(190, 520); g.lineTo(150, 680); g.lineTo(175, 860); g.lineTo(225, 860); g.lineTo(205, 690); g.lineTo(250, 560); });
    fillS("#6c7480", () => { g.moveTo(270, 540); g.lineTo(330, 690); g.lineTo(320, 860); g.lineTo(370, 860); g.lineTo(380, 680); g.lineTo(330, 520); });
    fillS(ink, () => { g.ellipse(195, 868, 48, 18, 0, 0, 7); }); fillS(ink, () => { g.ellipse(350, 868, 48, 18, 0, 0, 7); });
    // torso: shoulders wider than hips
    fillS(body, () => { g.moveTo(150, 250); g.lineTo(370, 250); g.lineTo(345, 540); g.lineTo(180, 540); g.closePath(); });
    // arms with bent elbows; right hand holds a pick
    fillS(body, () => { g.moveTo(155, 260); g.lineTo(95, 400); g.lineTo(150, 500); g.lineTo(175, 470); g.lineTo(140, 400); g.lineTo(185, 300); });
    fillS(body, () => { g.moveTo(360, 260); g.lineTo(430, 360); g.lineTo(380, 450); g.lineTo(350, 425); g.lineTo(385, 365); g.lineTo(335, 300); });
    fillS(skin, () => { g.arc(160, 505, 22, 0, 7); }); fillS(skin, () => { g.arc(368, 448, 22, 0, 7); });
    g.strokeStyle = ink; g.lineWidth = 12; g.beginPath(); g.moveTo(368, 448); g.lineTo(450, 230); g.stroke();
    fillS("#8c8d93", () => { g.moveTo(400, 215); g.quadraticCurveTo(455, 190, 505, 235); g.lineTo(455, 222); g.closePath(); });
    // neck + head (faceless) + cap
    fillS(skin, () => { g.rect(235, 205, 50, 50); });
    fillS(skin, () => { g.ellipse(260, 160, 62, 72, 0, 0, 7); });
    fillS("#8a6f52", () => { g.ellipse(260, 112, 70, 34, 0, Math.PI, 0); g.lineTo(330, 118); g.lineTo(190, 118); });
    // hatching on the shadow side
    g.strokeStyle = "rgba(47,48,52,.28)"; g.lineWidth = 3; for (let y = 270; y < 530; y += 14) { g.beginPath(); g.moveTo(300, y); g.lineTo(340, y - 26); g.stroke(); }
  });
  const miner = G(BX - 11.5, 0, 5);
  { const pl = mesh(new THREE.PlaneGeometry(8.5, 15), new THREE.MeshStandardMaterial({ map: minerT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, emissive: 0xffffff, emissiveMap: minerT, emissiveIntensity: 0.35 }), 0, 7.6, 0, miner); pl.userData.noEdge = true; mesh(new THREE.BoxGeometry(6, 0.5, 2.4), mat(P.shade), 0, 0.25, 0, miner); }
  miner.rotation.y = 0.35;
  riser(miner, 15.5, A("s2:orang") - 0.2, A("s2:Inggris") + 0.4);
  const tagD = dyn(512, 220);
  const tag = G(BX + 4, 9.5, 1);
  const tagM = new THREE.MeshStandardMaterial({ map: tagD.tex, roughness: 0.9 });
  mesh(new THREE.BoxGeometry(9, 3.9, 0.3), [mat(P.shade), mat(P.shade), mat(P.shade), mat(P.shade), tagM, mat(P.shade)], 0, 0, 0, tag).userData.noEdge = false;
  // paint tin with an old-paint label
  const tin = G(BX + 16, 0, 6);
  {
    const lab = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.fillStyle = P.accent; g.fillRect(0, 0, w, 50); g.fillRect(0, h - 50, w, 50); g.fillStyle = P.graphite; g.font = `700 64px ${MONO}`; g.textAlign = "center"; g.fillText("CAT LAMA · Pb", w * 0.25, 150); g.fillText("CAT LAMA · Pb", w * 0.75, 150); });
    mesh(new THREE.CylinderGeometry(4, 4, 8, 32, 1, true), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.6, side: THREE.DoubleSide }), 0, 4, 0, tin);
    mesh(new THREE.CylinderGeometry(4.15, 4.15, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0xa9a7a2, metalness: 0.85, roughness: 0.35 }), 0, 8.1, 0, tin);
    mesh(new THREE.TorusGeometry(2.6, 0.18, 6, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8c8d93, metalness: 0.8, roughness: 0.4 }), 0, 8.3, 0, tin).rotation.y = 0.4;
    // a drip of yellow paint
    mesh(new THREE.CylinderGeometry(0.5, 0.35, 3, 12), mat(P.accent, 0.3), 2.6, 6.8, 3.0, tin);
  }
  tin.rotation.y = -0.4;
  riser(tin, 8.6, A("s2:cat") - 0.3, A("s2:dulu") + 0.2);

  // =============== STATION B (s3): powders, bowl, extruder pushing out thin rods, cut and dried ===============
  const CX = -36;
  const padC = pad(CX, 6, 60, 76);
  const bowlP = [CX - 14, -6];
  const piles = [["grafit", 0x45464c, -21, 6], ["tanah", P.clay, -13, 9], ["air", 0xd9dde2, -5, 6]].map(([w, c, x, z], i) => {
    const g = G(CX + x, 0, z);
    const m = i === 2 ? new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.75 }) : mat(c, 0.95);
    const geo = i === 2 ? new THREE.SphereGeometry(1.9, 24, 16) : new THREE.ConeGeometry(3, 3.4, 28);
    const o = mesh(geo, m, 0, i === 2 ? 1.8 : 1.7, 0, g); if (i === 2) o.scale.set(1, 1.25, 1);
    const key = i === 0 ? "s3:grafit" : i === 1 ? "s3:tanah" : "s3:air";
    riser(g, 4.2, A(key) - 0.35, A(key) + 0.15);
    S(padC, circ(x, z, 3.6, 3.6), A(key) - 0.6, A(key) - 0.2, { w: 0.12, dash: true });
    TX(padC, ["grafit", "tanah liat", "air"][i], x, z + 5.4, A(key) - 0.2, { size: 1.8 });
    return { g, x: CX + x, z, key };
  });
  const bowl = G(CX - 14, 0, -6);
  {
    const lat = new THREE.LatheGeometry([[0.1, 0], [4, 0.2], [6, 2], [7, 4.6], [7.3, 4.8], [6.6, 4.8], [5.8, 2.4], [3.6, 0.8], [0.1, 0.7]].map(([a, b]) => new THREE.Vector2(a, b)), 40);
    mesh(lat, mat(P.white, 0.6, 0, { side: THREE.DoubleSide }), 0, 0, 0, bowl);
    const dough = mesh(new THREE.SphereGeometry(5.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x55565c, 0.7), 0, 1.2, 0, bowl); dough.scale.y = 0.55; dough.name = "dough"; dough.userData.noEdge = true;
  }
  riser(bowl, 5, K.s3 + 0.1, A("s3:campuran") + 0.2);
  const dough = bowl.getObjectByName("dough");
  // extruder: block with a ram on top, nozzle facing the viewer
  const ext = G(CX + 2, 0, -12);
  mesh(new THREE.BoxGeometry(12, 10, 9), hatchM(P.white, 0.45, 0.15), 0, 5, 0, ext);
  mesh(new THREE.BoxGeometry(5.5, 3, 3), mat(P.shade, 0.6), 0, 3.4, 5.6, ext);
  const ram = G(0, 10, 0, ext); mesh(new THREE.BoxGeometry(4, 5, 4), hatchM(P.clay, 0.45, 0.15), 0, 2.5, 0, ram); mesh(new THREE.BoxGeometry(6, 0.8, 5.5), hatchM(P.shade, 0.45, 0.1), 0, 5.4, 0, ram);
  const extLab = canvasTex(512, 128, (g, w, h) => { g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.fillStyle = P.graphite; g.font = `700 54px ${MONO}`; g.textAlign = "center"; g.fillText("PRES", w / 2, 84); });
  const lb = mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshStandardMaterial({ map: extLab, roughness: 0.9 }), 0, 7.4, 4.52, ext); lb.userData.noEdge = true;
  riser(ext, 18.5, A("s3:Adonan") - 0.4, A("s3:dipres"));
  S(padC, rect(2, -12, 13, 10), A("s3:Adonan") - 0.8, A("s3:Adonan") - 0.2, { w: 0.14 });
  // rods: 5 strands x 6 pencil-length segments; they grow from the nozzle, then gaps open when cut
  const NR = 5, NS = 6, SEG = 4.6, RR = 0.42;
  const rodM = new THREE.MeshStandardMaterial({ color: 0x4a4b50, roughness: 0.45, metalness: 0.45 });
  const rods = [];
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const m = mesh(new THREE.CylinderGeometry(RR, RR, SEG, 14), rodM); m.rotation.x = Math.PI / 2; scene.add(m); rods.push({ m, i, j }); }
  const tray = mesh(new THREE.BoxGeometry(9, 0.4, 36), mat(P.shade, 0.8), CX + 2, 0.2, 13); scene.add(tray);
  S(padC, [[-4, -6], [-4, 32], [8, 32], [8, -6]], A("s3:lalu") - 0.3, A("s3:didorong"), { w: 0.12, dash: true });
  for (let k = 0; k < 4; k++) S(padC, Array.from({ length: 12 }, (_, i) => [12 + k * 1.6 + Math.sin(i * 1.3) * 0.6, 26 - i * 1.4]), A("s3:dikeringkan") - 0.1 + k * 0.1, A("s3:dikeringkan") + 0.7 + k * 0.1, { w: 0.12 });
  TX(padC, "dikeringkan", 14, 30, A("s3:dikeringkan"), { size: 1.9 });
  const blade = G(CX + 2, 14, 13); mesh(new THREE.BoxGeometry(8.4, 1.8, 0.15), new THREE.MeshStandardMaterial({ color: 0xe4e2de, metalness: 0.4, roughness: 0.3 }), 0, 0, 0, blade); mesh(new THREE.BoxGeometry(8.4, 0.6, 0.5), mat(P.soft, 0.5), 0, 1.1, 0, blade);

  // =============== STATION C (s4): kiln with a rotating perforated drum, temperature dial, wax pot ===============
  const DX = 4;
  const padD = pad(DX, 0, 64, 70);
  const kiln = G(DX - 6, 0, -6);
  {
    const brick = canvasTex(512, 512, (g, w, h) => { g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(47,48,52,.55)"; g.lineWidth = 3; for (let y = 0; y < h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 42) % 2 ? 0 : 42; x < w; x += 84) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 42); g.stroke(); } } });
    const bm = new THREE.MeshStandardMaterial({ color: P.shade, map: brick, roughness: 0.9 });
    const W = 18, H = 16, Dp = 14, T = 2.4;
    mesh(new THREE.BoxGeometry(W, H, T), bm, 0, H / 2, -Dp / 2 + T / 2, kiln);
    mesh(new THREE.BoxGeometry(T, H, Dp), bm, -W / 2 + T / 2, H / 2, 0, kiln);
    mesh(new THREE.BoxGeometry(T, H, Dp), bm, W / 2 - T / 2, H / 2, 0, kiln);
    mesh(new THREE.BoxGeometry(W, T, Dp), bm, 0, H - T / 2, 0, kiln);
    mesh(new THREE.BoxGeometry(W, T, Dp), bm, 0, T / 2, 0, kiln);
    mesh(new THREE.BoxGeometry(W + 1.4, 1.2, Dp + 1.4), mat(P.mid, 0.6), 0, H + 0.6, 0, kiln);
    mesh(new THREE.BoxGeometry(3, 5, 3), bm, 5, H + 3.5, -3, kiln);
    const lab = canvasTex(512, 128, (g, w, h) => { g.fillStyle = P.graphite; g.fillRect(0, 0, w, h); g.fillStyle = P.white; g.font = `700 58px ${MONO}`; g.textAlign = "center"; g.fillText("TUNGKU", w / 2, 86); });
    const lp = mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.8 }), 0, H - 1.2, Dp / 2 + 0.02, kiln); lp.userData.noEdge = true;
  }
  riser(kiln, 22, K.s4 - 0.2, A("s4:dibakar") - 0.1);
  S(padD, rect(-6, -6, 19, 15), K.s4 - 0.7, K.s4 + 0.2, { w: 0.15 });
  const glowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(P.glow), toneMapped: false });
  const glowP = mesh(new THREE.PlaneGeometry(13.2, 11.2), glowM, DX - 6, 8, -11.8); glowP.castShadow = false; scene.add(glowP);
  const drum = G(DX - 6, 8, -4.5);
  {
    const holes = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "destination-out"; for (let x = 16; x < w; x += 34) for (let y = 18; y < h; y += 34) { g.beginPath(); g.arc(x + ((y / 34) % 2) * 17, y, 9, 0, 7); g.fill(); } });
    const dm = new THREE.MeshStandardMaterial({ color: 0x77787d, metalness: 0.7, roughness: 0.4, alphaMap: holes, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    const c = mesh(new THREE.CylinderGeometry(4, 4, 11, 32, 1, true), dm, 0, 0, 0, drum); c.rotation.z = Math.PI / 2;
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const rr = mesh(new THREE.CylinderGeometry(0.4, 0.4, 10, 10), rodM, 0, Math.sin(a) * 2.2, Math.cos(a) * 2.2, drum); rr.rotation.z = Math.PI / 2; }
  }
  const kilnLight = new THREE.PointLight(0xffb040, 0, 40, 1.6); kilnLight.position.set(DX - 6, 8, 2); scene.add(kilnLight);
  // dial
  const dialD = dyn(512, 512);
  const dial = G(DX + 9, 0, -1);
  mesh(new THREE.CylinderGeometry(0.4, 0.5, 9, 10), mat(P.mid, 0.5, 0.4), 0, 4.5, 0, dial);
  const face = mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.8, 40), [mat(P.mid, 0.5, 0.3), new THREE.MeshStandardMaterial({ map: dialD.tex, roughness: 0.8 }), mat(P.mid)], 0, 12, 0, dial); face.rotation.x = Math.PI / 2;
  dial.rotation.y = -0.35;
  riser(dial, 16.5, A("s4:keramik") - 0.1, A("s4:suhu"));
  TX(padD, "O₂", 20, 14, A("s4:tanpa") - 0.2, { size: 4.2, font: MONO, weight: "700" });
  S(padD, [[16.5, 10.5], [24, 17.5]], A("s4:oksigen") - 0.2, A("s4:oksigen") + 0.2, { w: 0.5 });
  S(padD, [[24, 10.5], [16.5, 17.5]], A("s4:oksigen") + 0.1, A("s4:oksigen") + 0.45, { w: 0.5 });
  // wax pot
  const pot = G(DX + 22, 0, 8);
  {
    const lat = new THREE.LatheGeometry([[0.1, 0], [4.6, 0], [5, 0.6], [5, 7], [5.5, 7.4], [5.3, 7.7], [4.5, 7.2], [4.5, 0.6], [0.1, 0.6]].map(([a, b]) => new THREE.Vector2(a, b)), 40);
    mesh(lat, new THREE.MeshStandardMaterial({ color: 0x9a9ba0, metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide }), 0, 0, 0, pot);
    const wax = mesh(new THREE.CircleGeometry(4.5, 32), new THREE.MeshStandardMaterial({ color: "#F1DFA6", roughness: 0.15 }), 0, 6.2, 0, pot); wax.rotation.x = -Math.PI / 2; wax.userData.noEdge = true;
    const lab = canvasTex(512, 128, (g, w, h) => { g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.fillStyle = P.graphite; g.font = `700 60px ${MONO}`; g.textAlign = "center"; g.fillText("LILIN", w / 2, 86); });
    const lp = mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.8 }), 0, 4, 5.03, pot); lp.userData.noEdge = true;
  }
  riser(pot, 8, A("s4:Lalu") - 0.4, A("s4:isinya") + 0.2);
  S(padD, circ(22, 8, 6.4, 6.4), A("s4:Lalu") - 0.8, A("s4:Lalu") - 0.2, { w: 0.14 });
  const bundle = G(DX + 22, 20, 8);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; mesh(new THREE.CylinderGeometry(0.4, 0.4, 13, 10), rodM, i ? Math.cos(a) * 1.1 : 0, 0, i ? Math.sin(a) * 1.1 : 0, bundle); }
  mesh(new THREE.TorusGeometry(1.8, 0.25, 8, 24), new THREE.MeshStandardMaterial({ color: 0x8c8d93, metalness: 0.8, roughness: 0.3 }), 0, 5.5, 0, bundle).rotation.x = Math.PI / 2;

  // =============== STATION D (s5): the sandwich: grooved slat, glue, cores, second slat, press, cut ===============
  const EX = 44;
  const padE = pad(EX, 0, 56, 60);
  const SW = 7.2, ST = 0.9, SLL = 18.4, NG = 9, PITCH = SW / NG, CR = 0.3;
  const grooveD = dyn(512, 1024);
  const paintGroove = (k) => grooveD.paint(Math.round(k * 40), (g, w, h) => {
    g.drawImage(woodT.image, 0, 0, w, h); g.globalCompositeOperation = "multiply"; g.fillStyle = P.wood; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over";
    const pw = w / NG;
    for (let i = 0; i < NG; i++) { const x = (i + 0.5) * pw; const gr = g.createLinearGradient(x - pw * 0.4, 0, x + pw * 0.4, 0); gr.addColorStop(0, "rgba(90,60,30,.65)"); gr.addColorStop(0.5, "rgba(140,100,60,.25)"); gr.addColorStop(1, "rgba(255,240,220,.35)"); g.fillStyle = gr; g.fillRect(x - pw * 0.38, 0, pw * 0.76, h * k); g.strokeStyle = "rgba(47,48,52,.7)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - pw * 0.38, 0); g.lineTo(x - pw * 0.38, h * k); g.moveTo(x + pw * 0.38, 0); g.lineTo(x + pw * 0.38, h * k); g.stroke(); }
  });
  const slatMs = () => [woodM(), woodM(), new THREE.MeshStandardMaterial({ map: grooveD.tex, roughness: 0.8 }), woodM(), woodM(), woodM()];
  const slatA = G(EX, 0, 0); mesh(new THREE.BoxGeometry(SW, ST, SLL), slatMs(), 0, ST / 2, 0, slatA);
  riser(slatA, ST, A("s5:Papan") - 0.2, A("s5:cedar"));
  S(padE, rect(0, 0, SW + 0.6, SLL + 0.6), A("s5:kayunya") - 0.3, A("s5:Papan"), { w: 0.14 });
  TX(padE, "kayu cedar", -SW / 2 - 1.2, -6, A("s5:cedar") - 0.2, { size: 1.8, align: "right" });
  const glue = []; for (let i = 0; i < NG; i++) { const m = mesh(new THREE.BoxGeometry(PITCH * 0.7, 0.06, SLL), new THREE.MeshStandardMaterial({ color: 0xfbf7ef, roughness: 0.25, transparent: true, opacity: 0.85 }), EX - SW / 2 + (i + 0.5) * PITCH, ST + 0.03, 0); scene.add(m); glue.push(m); }
  const cores = []; for (let i = 0; i < NG; i++) { const m = mesh(new THREE.CylinderGeometry(CR, CR, SLL + 0.9, 14), rodM); m.rotation.x = Math.PI / 2; scene.add(m); cores.push(m); }
  // second slat lies to the right, grooves up, then flips over on a hinge at the right edge
  const hinge = G(EX + SW / 2, 0, 0); const slatB = G(SW / 2 + 0.3, 0, 0, hinge); mesh(new THREE.BoxGeometry(SW, ST, SLL), slatMs(), 0, ST / 2, 0, slatB);
  riser(hinge, ST, A("s5:lalu") - 0.4, A("s5:ditutup"));
  const press = [G(EX, 14, 0), G(EX, -0.6, 0)]; mesh(new THREE.BoxGeometry(SW + 3, 1.6, SLL + 3), hatchM(P.clay, 0.42, 0.15), 0, 0.8, 0, press[0]);
  const pressLab = canvasTex(512, 128, (g, w, h) => { g.fillStyle = P.accent; g.fillRect(0, 0, w, h); g.fillStyle = P.graphite; g.font = `700 60px ${MONO}`; g.textAlign = "center"; g.fillText("PRES", w / 2, 86); });
  const pl2 = mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: pressLab }), 0, 0.8, (SLL + 3) / 2 + 0.02, press[0]); pl2.userData.noEdge = true;
  // the nine pencils that come out of the cut
  const rawPens = []; for (let i = 0; i < NG; i++) { const g = hexPencil(SLL, PITCH * 0.5, woodM(), scene, CR * 0.9); g.rotation.x = Math.PI / 2; rawPens.push(g); }
  const knife = G(EX, 4, -SLL / 2 - 4); { const kb = mesh(new THREE.BoxGeometry(SW + 4, 0.25, 6), new THREE.MeshStandardMaterial({ color: 0xe4e2de, metalness: 0.4, roughness: 0.3 }), 0, 0, 0, knife); for (let i = 0; i < NG - 1; i++) mesh(new THREE.BoxGeometry(0.12, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0xe4e2de, metalness: 0.4, roughness: 0.3 }), -SW / 2 + (i + 1) * PITCH, 1.4, 0, knife); }
  // "not drilled": a drill sketched in the margin, struck out
  const drl = [[17, -3], [24, -3], [24, 1], [17, 1], [17, -3]];
  S(padE, drl, A("s5:Pensil") - 0.3, A("s5:tidak"), { w: 0.16 });
  S(padE, [[17, -1], [10, -1], [9.5, -1.8], [9, -0.2], [8.5, -1.8], [8, -0.2], [7.5, -1]], A("s5:tidak") - 0.1, A("s5:pernah"), { w: 0.16 });
  S(padE, [[6.5, -6], [25, 4]], A("s5:dibor") - 0.1, A("s5:dibor") + 0.25, { w: 0.55, c: P.graphite, two: false });
  S(padE, [[6.5, 4], [25, -6]], A("s5:dibor") + 0.15, A("s5:dibor") + 0.5, { w: 0.55, c: P.graphite, two: false });
  TX(padE, "tidak dibor", 16, 8, A("s5:dibor"), { size: 2.2 });

  // =============== STATION E (s6): ratio columns H and B, two pencils draw light and dark swatches ===============
  const FX = 84;
  const padF = pad(FX, 4, 56, 64);
  const colH = G(FX - 8, 0, -3), colB = G(FX + 8, 0, -3);
  const discs = [];
  const discG = new THREE.MeshStandardMaterial({ color: 0x26272b, map: hatchT, roughness: 0.16, metalness: 0.75 });
  const discC = new THREE.MeshStandardMaterial({ color: "#C9774A", map: hatchT, roughness: 0.75, metalness: 0 });
  const spot6 = new THREE.SpotLight(0xfff0d8, 0, 140, 0.42, 0.85, 1); spot6.position.set(FX - 26, 44, 34); spot6.target.position.set(FX, 4, -3); scene.add(spot6, spot6.target);
  const addDiscs = (g, seq, a, b) => seq.forEach((c, i) => { const m = mesh(new THREE.CylinderGeometry(3, 3, 1.5, 32), c === "g" ? discG : discC, 0, 0, 0, g); discs.push({ m, i, a: a + (b - a) * i / seq.length, n: seq.length }); });
  addDiscs(colH, ["c", "c", "c", "c", "c", "g", "g"], A("s6:tanah") - 0.3, A("s6:keras") + 0.4);
  addDiscs(colB, ["g", "g", "g", "g", "g", "c", "c"], A("s6:grafit") - 0.4, A("s6:lunak") + 0.4);
  for (const g of [colH, colB]) { const tube = mesh(new THREE.CylinderGeometry(3.4, 3.4, 12, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }), 0, 6, 0, g); tube.castShadow = false; tube.userData.noRise = true; mesh(new THREE.CylinderGeometry(3.8, 3.8, 0.5, 32), mat(P.mid, 0.6, 0.3), 0, 0.25, 0, g); }
  TX(padF, "tanah liat", -8, -14, A("s6:tanah") - 0.4, { size: 1.8 });
  TX(padF, "grafit", 8, -14, A("s6:grafit") - 0.4, { size: 1.8 });
  // big letters + swatches
  TX(padF, "H", -13, 8, A("s6:H") - 0.15, { size: 6, font: MONO, weight: "700", dur: 0.3 });
  TX(padF, "B", 3, 8, A("s6:B") - 0.15, { size: 6, font: MONO, weight: "700", dur: 0.3 });
  const zig = (x0, z0, n, w, h) => Array.from({ length: n * 2 + 1 }, (_, i) => [x0 + (i / 2) * w / n, z0 + (i % 2 ? h : 0)]);
  S(padF, zig(-10, 5, 4, 8, 6), A("s6:goresannya") - 0.1, A("s6:terang") + 0.3, { w: 0.18, c: "#9a9ba1", alpha: 0.8, two: false });
  S(padF, zig(6, 5, 4, 8, 6), A("s6:lunak") - 0.4, A("s6:hitam") + 0.3, { w: 0.65, c: "#1d1e21", two: false });
  const drawH = hexPencil(12, 0.55, mat(P.accent, 0.42), scene, 0.2), drawB = hexPencil(12, 0.55, mat(P.accent, 0.42), scene, 0.2);
  for (const d of [drawH, drawB]) { const tp = mesh(new THREE.CylinderGeometry(0.55, 0.02, 2.4, 6), woodM(), 0, -7.2, 0, d); mesh(new THREE.CylinderGeometry(0.17, 0.02, 0.8, 12), graphM(), 0, -8.1, 0, d); }
  const hbT = (s) => canvasTex(128, 64, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = P.graphite; g.font = `700 44px ${MONO}`; g.textAlign = "center"; g.fillText(s, w / 2, 48); });
  [[drawH, "H"], [drawB, "B"]].forEach(([d, s]) => { const p = mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: hbT(s) }), 0, 3, 0.48, d); p.rotation.z = Math.PI / 2; });

  // =============== STATION F (s7): sanded, dipped eight times, ferrule + eraser, then a field of pencils ===============
  const HX = 126;
  const padH = pad(HX, 0, 70, 80);
  const heroL = 22, heroR = 1.25;
  const heroD = dyn(1024, 512);
  const heroM = new THREE.MeshStandardMaterial({ map: heroD.tex, color: P.wood, roughness: 0.5 });
  const hero = G(HX, 1.2, 2); hero.rotation.z = -0.95;
  const heroBody = G(0, heroL / 2 + 4.5, 0, hero);
  mesh(new THREE.CylinderGeometry(heroR, heroR, heroL, 6), heroM, 0, 0, 0, heroBody);
  const htip = mesh(new THREE.CylinderGeometry(heroR * 0.97, 0.02, 6, 6), woodM(), 0, -heroL / 2 - 3, 0, heroBody);
  mesh(new THREE.CylinderGeometry(0.42, 0.02, 1.6, 16), graphM(), 0, -heroL / 2 - 5.2, 0, heroBody);
  const ferG = G(0, heroL / 2 + 1.4, 0, heroBody);
  { const fm = new THREE.MeshStandardMaterial({ color: 0xcfccc5, metalness: 0.92, roughness: 0.28 }); mesh(new THREE.CylinderGeometry(heroR * 1.04, heroR * 1.04, 2.8, 28), fm, 0, 0, 0, ferG); for (let i = 0; i < 3; i++) mesh(new THREE.TorusGeometry(heroR * 1.05, 0.1, 6, 28), fm, 0, -0.8 + i * 0.8, 0, ferG).rotation.x = Math.PI / 2; }
  const erG = G(0, heroL / 2 + 4.1, 0, heroBody); mesh(new THREE.CylinderGeometry(heroR, heroR, 2.6, 28), mat(P.clay, 0.95), 0, 0, 0, erG);
  riser(hero, heroL + 12, K.s7 - 0.3, A("s7:pensil") + 0.2);
  const heroMat = heroBody.children[0].material;
  S(padH, rect(0, 2, 4, 4), K.s7 - 0.8, K.s7 - 0.2, { w: 0.15 });
  const sander = G(heroR + 1.2, 0, 0, heroBody); mesh(new THREE.BoxGeometry(1.6, 4, 3.2), mat(P.mid, 0.95), 0, 0, 0, sander); mesh(new THREE.BoxGeometry(0.3, 4, 3.2), mat(P.shade, 1), -0.95, 0, 0, sander);
  const ring = mesh(new THREE.TorusGeometry(heroR * 1.35, 0.22, 8, 32), new THREE.MeshStandardMaterial({ color: P.accent, roughness: 0.25 }), 0, 0, 0, heroBody); ring.rotation.x = Math.PI / 2;
  // field of finished pencils
  const NF = 360, fieldM = new THREE.MeshStandardMaterial({ color: P.accent, roughness: 0.42, map: grainT });
  const field = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 12, 6), fieldM, NF); field.frustumCulled = false; field.castShadow = true; field.receiveShadow = true; scene.add(field);
  const fieldTip = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.02, 2.2, 6), new THREE.MeshStandardMaterial({ color: P.wood, roughness: 0.8 }), NF); fieldTip.frustumCulled = false; scene.add(fieldTip);
  const fseed = Array.from({ length: NF }, (_, i) => { const row = Math.floor(i / 24), col = i % 24; return [HX - 34 + col * 2.95 + (row % 2) * 1.4, -12 - row * 2.6, rnd(), rnd()]; });
  TX(padH, "> 2 miliar / tahun", 8, -36, A("s7:miliar"), { size: 2.6, font: HAND });

  // ---------- camera ----------
  const deg = Math.PI / 180;
  const Pc = (t, x, y, z, dist, el, yaw) => [t, x + dist * Math.sin(yaw * deg) * Math.cos(el * deg), y + dist * Math.sin(el * deg), z + dist * Math.cos(yaw * deg) * Math.cos(el * deg), x, y, z];
  const camT = track([
    Pc(0, AX - 6, 6, 1, 70, 50, -10),
    Pc(A("s1:timbal"), AX - 7, 6, -2, 72, 46, -2),
    Pc(K.s1e, AX - 8, 6, -3, 76, 42, 4),
    Pc(K.s2 + 0.7, BX - 8, 8, 1, 62, 26, -2),
    Pc(A("s2:keliru"), BX - 2, 6, 0, 56, 26, 2),
    Pc(A("s2:cat") + 0.2, BX + 11, 6, 4, 50, 26, 12),
    Pc(K.s2e, BX + 14, 5, 4, 52, 28, 16),
    Pc(K.s3 + 0.6, CX - 13, 4, 0, 54, 32, -10),
    Pc(A("s3:Adonan"), CX - 6, 6, -4, 60, 30, 6),
    Pc(A("s3:didorong"), CX + 2, 5, 2, 60, 30, 24),
    Pc(A("s3:dipotong"), CX + 2, 2, 12, 52, 40, 18),
    Pc(K.s3e, CX + 4, 2, 14, 52, 44, 22),
    Pc(K.s4 + 0.5, DX - 4, 11, -4, 66, 20, -10),
    Pc(A("s4:derajat"), DX + 1, 11, -3, 64, 20, 4),
    Pc(A("s4:Lalu") + 0.2, DX + 19, 10, 6, 50, 24, 10),
    Pc(K.s4e, DX + 21, 9, 6, 48, 28, 14),
    Pc(K.s5 + 0.5, EX + 1, 1, 1, 46, 40, 24),
    Pc(A("s5:Lem"), EX + 1, 1, 1, 42, 44, 30),
    Pc(A("s5:ditutup"), EX + 1, 2, 1, 42, 32, 36),
    Pc(A("s5:pisau"), EX, 2, 1, 42, 28, 40),
    Pc(A("s5:sekaligus"), EX + 2, 1, 1, 46, 32, 32),
    Pc(K.s5e, EX + 6, 1, 0, 54, 38, 20),
    Pc(K.s6 + 0.5, FX, 12, -2, 60, 26, -8),
    Pc(A("s6:kode"), FX - 3, 10, 2, 60, 34, -4),
    Pc(A("s6:kode#2"), FX + 3, 10, 2, 60, 34, 6),
    Pc(K.s6e, FX + 4, 11, 2, 64, 32, 10),
    Pc(K.s7 + 0.5, HX + 12, 12, 2, 92, 30, -10),
    Pc(A("s7:cincin"), HX + 14, 13, 2, 86, 26, 4),
    Pc(A("s7:pabrik"), HX + 4, 16, -4, 108, 34, 10),
    Pc(A("s7:tahun"), HX - 4, 18, -14, 140, 34, 12),
    Pc(K.s8 + 0.4, HX + 4, 11, -14, 116, 26, 28),
    Pc(K.end, HX - 2, 10, -18, 140, 24, 40),
  ]);

  const late = [pencilA, pbCard, lump, miner, tag, tin, ...piles.map((p) => p.g), bowl, ext, tray, blade, ...rods.map((r) => r.m), kiln, glowP, drum, dial, pot, bundle, slatA, hinge, ...press, ...glue, ...cores, ...rawPens, knife, colH, colB, drawH, drawB];
  // s5 foreground: an out-of-focus slab corner riding with the camera (bottom-left, under the caption band)
  const fgT = canvasTex(512, 340, (g, w, h) => {
    const c2 = document.createElement("canvas"); c2.width = w; c2.height = h; const q = c2.getContext("2d");
    q.beginPath(); q.moveTo(-20, h + 20); q.lineTo(-20, 150); q.lineTo(w * 0.62, 70); q.lineTo(w + 20, h + 20); q.closePath(); q.save(); q.clip();
    q.drawImage(woodT.image, 0, 0, w, h * 1.6); q.globalCompositeOperation = "multiply"; q.fillStyle = "#c79d68"; q.fillRect(0, 0, w, h); q.restore();
    q.strokeStyle = "rgba(47,48,52,.8)"; q.lineWidth = 10; q.beginPath(); q.moveTo(-20, 150); q.lineTo(w * 0.62, 70); q.lineTo(w + 20, h + 20); q.stroke();
    g.clearRect(0, 0, w, h); g.filter = "blur(12px)"; g.drawImage(c2, 0, 0); g.filter = "none"; });
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.13), new THREE.MeshBasicMaterial({ map: fgT, transparent: true, depthTest: false, depthWrite: false, opacity: 0.92 }));
  fg.renderOrder = 10; fg.position.set(-0.95, -2.3, -8); cam.add(fg); scene.add(cam);
  const tmpV = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const cream = new THREE.Color(P.wood), yel = new THREE.Color(P.accent);
  return function draw(t) {
    sk.uniforms.uT.value = t;
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    key.target.position.set(c[3], 0, c[5]); key.position.set(c[3] - 40, 70, c[5] + 45);
    rim.target.position.set(c[3], 0, c[5]); rim.position.set(c[3] + 30, 30, c[5] - 60);
    updRisers(t);
    paintPads(t);

    // ---- s1 Pb card: struck out on "Sama" ----
    const st1 = ramp(t, A("s1:Sama") - 0.1, A("s1:sekali") + 0.2), st2 = ramp(t, A("s1:sekali"), A("s1:sekali") + 0.4);
    pbD.paint(Math.round(st1 * 30) + ":" + Math.round(st2 * 30), (g, w, h) => {
      g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.strokeStyle = P.graphite; g.lineWidth = 8; g.strokeRect(20, 20, w - 40, h - 40);
      g.fillStyle = P.graphite; g.font = `700 230px ${MONO}`; g.textAlign = "center"; g.fillText("Pb", w / 2, 330);
      g.font = `700 64px ${MONO}`; g.fillText("TIMBAL", w / 2, 470);
      g.lineCap = "round"; g.strokeStyle = "#1d1e21"; g.lineWidth = 30;
      if (st1 > 0) { g.beginPath(); g.moveTo(50, 80); g.lineTo(50 + (w - 100) * st1, 80 + (h - 160) * st1); g.stroke(); }
      if (st2 > 0) { g.beginPath(); g.moveTo(w - 50, 80); g.lineTo(w - 50 - (w - 100) * st2, 80 + (h - 160) * st2); g.stroke(); }
    });

    // ---- s2 tag "TIMBAL?" then struck on "keliru" ----
    const tg = t > A("s2:mengira") - 0.2 ? back(clamp01((t - A("s2:mengira") + 0.2) / 0.45)) : 0;
    tag.scale.setScalar(Math.max(0.001, tg)); tag.visible = tg > 0.01; tag.rotation.y = 0.2 + Math.sin(t * 0.8) * 0.06;
    const tk = ramp(t, A("s2:keliru") - 0.1, A("s2:keliru") + 0.4);
    tagD.paint(Math.round(tk * 30), (g, w, h) => {
      g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.fillStyle = P.accent; g.fillRect(0, 0, 22, h);
      g.fillStyle = P.graphite; g.font = `700 92px ${MONO}`; g.textAlign = "center"; g.fillText("TIMBAL?", w / 2 + 10, 140);
      if (tk > 0) { g.strokeStyle = "#1d1e21"; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(50, 110); g.lineTo(50 + 420 * tk, 110 - 20 * tk); g.stroke(); }
    });

    // ---- s3 powders slide into the bowl; extruder; rods grow, cut, dry ----
    const mixK = ramp(t, A("s3:Adonan") - 0.5, A("s3:Adonan") + 0.5);
    piles.forEach((p, i) => { const k = clamp01(mixK * 1.3 - i * 0.15); p.g.position.set(p.x + (bowlP[0] - p.x) * k, Math.sin(k * Math.PI) * 4, p.z + (bowlP[1] - p.z) * k); if (k > 0) p.g.scale.setScalar(Math.max(0.01, 1 - k)); });
    dough.scale.set(0.6 + 0.4 * mixK, 0.25 + 0.3 * mixK, 0.6 + 0.4 * mixK); dough.visible = t > A("s3:Adonan") - 0.3 && t < K.s4 + 2;
    const pr = ramp(t, A("s3:dipres") - 0.2, A("s3:dipres") + 0.35) - ramp(t, A("s3:lewat"), A("s3:kecil") + 0.3) * 0.5;
    ram.position.y = 10 - 3 * pr;
    const grow = ramp(t, A("s3:didorong") - 0.2, A("s3:spageti") + 0.2);
    const cutK = ramp(t, A("s3:dipotong") + 0.15, A("s3:sepanjang") + 0.3);
    const dry = ramp(t, A("s3:dikeringkan"), A("s3:dikeringkan") + 1.2);
    const showRods = t > A("s3:didorong") - 0.25 && t < K.s4 + 3;
    rods.forEach((rd) => {
      const nz = -12 + 7; // nozzle front z
      const total = NS * SEG * grow, segStart = rd.j * SEG;
      const len = clamp01((total - segStart) / SEG) * SEG;
      rd.m.visible = showRods && len > 0.05;
      rd.m.scale.set(1, Math.max(0.01, len / SEG), 1);
      const gap = cutK * 1.3 * rd.j;
      rd.m.position.set(CX + 2 + (rd.i - (NR - 1) / 2) * 1.5, 0.4 + RR + 3 * (1 - clamp01(grow * 3)) * 0, nz + segStart + len / 2 + gap);
      rodM.color.setRGB(0.29 + 0.06 * dry, 0.29 + 0.06 * dry, 0.31 + 0.06 * dry);
    });
    tray.visible = t > A("s3:lalu") - 0.2;
    const bl = t > A("s3:dipotong") - 0.3 && t < A("s3:dikeringkan") + 0.4;
    blade.visible = bl;
    blade.position.set(CX + 2, 1.9 + 2.4 * Math.abs(Math.cos(clamp01((t - A("s3:dipotong")) / 1.6) * Math.PI * 3)), -3 + 22 * ramp(t, A("s3:dipotong"), A("s3:pensil") + 0.2));

    // ---- s4 kiln heats; drum turns; dial needle; wax dip ----
    const heat = ramp(t, A("s4:dibakar") - 0.2, A("s4:keramik")) * (1 - 0.6 * ramp(t, K.s5, K.s5 + 1));
    glowM.color.setRGB(0.95 + 0.6 * heat, 0.78 + 0.3 * heat, 0.45 + 0.05 * heat);
    glowP.visible = t > K.s4 - 0.2;
    kilnLight.intensity = 260 * heat; bp.strength = 0.18 + 0.35 * heat;
    drum.visible = t > A("s4:dibakar") - 0.1; drum.rotation.x = t * 0.9;
    const nd = ramp(t, A("s4:suhu"), A("s4:derajat") + 0.3);
    dialD.paint(Math.round(nd * 40), (g, w, h) => {
      g.fillStyle = P.white; g.fillRect(0, 0, w, h); g.translate(w / 2, h / 2); g.rotate(Math.PI * 1.5); // cylinder cap UV turned by the face rotation
      g.strokeStyle = P.graphite; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 230, 0, 7); g.stroke();
      for (let i = 0; i <= 12; i++) { const a = Math.PI * 0.75 + i / 12 * Math.PI * 1.5; g.lineWidth = i % 3 ? 4 : 8; g.beginPath(); g.moveTo(Math.cos(a) * 200, Math.sin(a) * 200); g.lineTo(Math.cos(a) * (i % 3 ? 178 : 162), Math.sin(a) * (i % 3 ? 178 : 162)); g.stroke(); }
      g.strokeStyle = P.accent; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, 214, Math.PI * 0.75 + 0.62 * Math.PI * 1.5, Math.PI * 0.75 + 0.92 * Math.PI * 1.5); g.stroke();
      g.fillStyle = P.graphite; g.font = `700 64px ${MONO}`; g.textAlign = "center"; g.fillText("±1.000°", 0, 120);
      const a = Math.PI * 0.75 + nd * 0.78 * Math.PI * 1.5; g.strokeStyle = "#1d1e21"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 170, Math.sin(a) * 170); g.stroke(); g.beginPath(); g.arc(0, 0, 18, 0, 7); g.fillStyle = "#1d1e21"; g.fill();
    });
    const dip = ramp(t, A("s4:direndam") - 0.3, A("s4:lilin") + 0.3) - ramp(t, A("s4:goresannya"), A("s4:halus") + 0.4);
    bundle.visible = t > A("s4:Lalu") && t < K.s5 + 1.5;
    bundle.position.y = 21 - 11 * dip + Math.sin(t * 1.2) * 0.2;

    // ---- s5 sandwich ----
    paintGroove(ramp(t, A("s5:diberi") - 0.1, A("s5:sejajar") + 0.3));
    glue.forEach((m, i) => { const k = ramp(t, A("s5:Lem") - 0.1 + i * 0.04, A("s5:dioles") + 0.3 + i * 0.04); m.scale.set(1, 1, Math.max(0.001, k)); m.position.z = -SLL / 2 + SLL * k / 2; m.visible = k > 0 && t < A("s5:pisau") + 0.3; });
    const cut = ramp(t, A("s5:memotongnya") - 0.1, A("s5:beberapa") + 0.2);
    const split = t > A("s5:memotongnya") + 0.1;
    cores.forEach((m, i) => { const k = eout(clamp01((t - (A("s5:isi") - 0.1) - i * 0.17) / 0.4)); m.position.set(EX - SW / 2 + (i + 0.5) * PITCH, ST + CR * 0.15 + 8 * (1 - k), 0); m.visible = k > 0 && !split; });
    const flip = ramp(t, A("s5:ditutup") - 0.1, A("s5:kedua") + 0.2);
    hinge.rotation.z = Math.PI * flip;
    hinge.position.y = flip > 0.5 ? (ST + 0.0) * 1 : 0;
    // when flipped the slat sits on top: hinge at x = right edge; with rotation PI it mirrors to the left side, shifted up by its own thickness
    hinge.position.y = ST * 2 * ramp(t, A("s5:ditutup") + 0.2, A("s5:kedua") + 0.2) + Math.sin(flip * Math.PI) * 2;
    const squeeze = ramp(t, A("s5:dipres") - 0.3, A("s5:dipres") + 0.3) - ramp(t, A("s5:kering") + 0.1, A("s5:pisau"));
    press[0].position.y = 14 - (14 - (ST * 2 + 0.05)) * squeeze; press[0].visible = t > A("s5:Setelah") - 0.3 && t < A("s5:pisau") + 0.4;
    press[1].visible = false;
    slatA.visible = slatA.visible && !split; hinge.visible = hinge.visible && !split;
    knife.visible = t > A("s5:kering") && t < A("s5:jadi") + 0.4;
    knife.position.set(EX, ST * 2 + 0.3, -SLL / 2 - 4 + (SLL + 8) * ramp(t, A("s5:pisau") - 0.2, A("s5:memotongnya") + 0.3));
    const spread = ramp(t, A("s5:jadi") - 0.2, A("s5:sekaligus") + 0.3);
    rawPens.forEach((g, i) => {
      g.visible = split && t < K.s7 + 2;
      const x0 = EX - SW / 2 + (i + 0.5) * PITCH, x1 = EX + (i - (NG - 1) / 2) * 1.9;
      g.position.set(x0 + (x1 - x0) * spread, ST + Math.sin(spread * Math.PI) * 1.2 + spread * (PITCH * 0.5 - ST), 0);
      g.rotation.set(Math.PI / 2, 0, spread * 0.5 * Math.sin(i * 1.7) * 0.3 + (1 - spread) * 0);
    });

    // ---- s6 discs stack; pencils draw ----
    discs.forEach((d) => { const k = eout(clamp01((t - d.a) / 0.35)); d.m.visible = k > 0; d.m.position.y = 0.5 + 0.75 + d.i * 1.5 + 9 * (1 - k); });
    const pH = padTip(padF, padF.s.length - 2, t), pB = padTip(padF, padF.s.length - 1, t);
    const aH = ramp(t, A("s6:goresannya") - 0.5, A("s6:goresannya")) - ramp(t, A("s6:terang") + 0.4, A("s6:Itu") + 0.6);
    const aB = ramp(t, A("s6:lunak") - 0.8, A("s6:lunak") - 0.4) - ramp(t, A("s6:hitam") + 0.4, A("s6:Itu#2") + 0.6);
    const vis6 = t > K.s6 - 0.5 && t < K.s7 + 0.5;
    [[drawH, pH, aH, -1], [drawB, pB, aB, 1]].forEach(([d, p, a, s]) => {
      d.visible = vis6; const hov = 1 - a;
      d.position.set(p[0] + 3.2 + hov * 2, 8.6 + hov * 5 + Math.sin(t * 2 + s) * 0.3 * hov, p[1] - 3 + hov * 2);
      d.rotation.set(-0.35, 0, -0.42);
    });

    // ---- s7 hero pencil: sand, eight coats, ferrule, eraser, stamp; then the field ----
    const sand = t > A("s7:diampelas") - 0.2 && t < A("s7:dicat") + 0.1;
    sander.visible = sand; sander.position.y = Math.sin((t - A("s7:diampelas")) * 14) * (heroL / 2 - 2.5);
    const coats = Math.floor(8 * ramp(t, A("s7:dicat") - 0.1, A("s7:lebih") + 0.2));
    const coatP = (8 * ramp(t, A("s7:dicat") - 0.1, A("s7:lebih") + 0.2)) % 1;
    heroMat.color.copy(cream).lerp(yel, Math.min(1, coats / 6));
    ring.visible = t > A("s7:dicat") - 0.1 && coats < 8;
    ring.position.y = -heroL / 2 + coatP * heroL;
    const stampK = ramp(t, A("s7:pabrik") - 0.3, A("s7:pabrik") + 0.3);
    heroD.paint(Math.round(stampK * 20), (g, w, h) => {
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
      if (stampK <= 0) return;
      // one hex face = 1/6 of the wrap; text runs along the pencil (rotated)
      g.save(); g.globalAlpha = stampK; g.translate(w * (0.5 / 6), h / 2); g.rotate(-Math.PI / 2); g.fillStyle = "#1d1e21"; g.font = `700 64px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA · HB", 0, 0); g.restore();
    });
    ferG.position.y = heroL / 2 + 1.4 + 14 * (1 - eout(ramp(t, A("s7:cincin") - 0.2, A("s7:logam") + 0.2)));
    ferG.visible = t > A("s7:cincin") - 0.25;
    erG.position.y = heroL / 2 + 4.1 + 10 * (1 - back(ramp(t, A("s7:karet") - 0.1, A("s7:penghapus") + 0.2)));
    erG.visible = t > A("s7:karet") - 0.15;
    heroBody.rotation.y = 0.5 + t * 0.12;
    hero.position.y = 1.2 + Math.sin(t * 0.9) * 0.2;
    const fk = t - A("s7:pabrik");
    for (let i = 0; i < NF; i++) {
      const [x, z, a, b] = fseed[i];
      const k = back(clamp01((fk - (i % 24) * 0.02 - Math.floor(i / 24) * 0.11 - a * 0.1) / 0.45), 1.4);
      const y = k <= 0 ? -20 : 7.4 * k;
      tmpQ.setFromAxisAngle(up, b * 2); tmpV.set(x, y - 1.2, z); tmpS.setScalar(k <= 0 ? 0 : 1);
      tmpM.compose(tmpV, tmpQ, tmpS); field.setMatrixAt(i, tmpM);
      tmpV.set(x, y - 1.2 - 7.1, z); tmpM.compose(tmpV, tmpQ, tmpS); fieldTip.setMatrixAt(i, tmpM);
    }
    field.instanceMatrix.needsUpdate = true; fieldTip.instanceMatrix.needsUpdate = true;
    field.visible = fieldTip.visible = fk > -0.2;

    // s3 + s5: stronger directional key, less flat fill, so forms get a shading gradient and a clear cast shadow
    const w35 = Math.max(ramp(t, K.s3 - 0.6, K.s3 + 0.4) - ramp(t, K.s3e, K.s4 + 0.4), ramp(t, K.s5 - 0.6, K.s5 + 0.4) - ramp(t, K.s5e, K.s6 + 0.4));
    hemi.intensity = 1.15 - 0.5 * w35; key.intensity = 2.1 + 1.1 * w35;
    fg.visible = t > K.s5 + 0.3 && t < K.s5e;
    fg.material.opacity = 0.92 * ramp(t, K.s5 + 0.3, K.s5 + 0.9) * (1 - ramp(t, K.s5e - 0.6, K.s5e));
    spot6.intensity = 95 * (ramp(t, K.s6 - 0.6, K.s6 + 0.4) - ramp(t, K.s6e, K.s7 + 0.6));
    // s7 payoff + s8 close: earlier stations are far off-screen by "pabrik"; hide them so the closing frames stay clean
    if (t > A("s7:pabrik")) { for (const o of late) o.visible = false; for (const pd of pads) if (pd !== padH) pd.m.visible = false; }
    comp.render();
  };
}
