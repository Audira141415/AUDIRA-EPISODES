// EP03 STREET FIGHTER COMBO / TOONFORGE. A cel-shaded dusk street world: a fighting arena under an anime sun, a 1991-style
// arcade cabinet to the left (later a whole row of them), a bonus stage with a toon car to the right. Two ORIGINAL fighters
// (red scarf / teal jacket) built from capsules with bending elbows and knees, inverted-hull ink outlines, three-band toon
// shading, impact stars and a camera-locked speed-line layer. Illustration only. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const PI = Math.PI;
const INK = 0x0b0a12;
const C = {
  skin: 0xf2b48a, skin2: 0xc98b62, red: 0xe63946, yel: 0xffc93c, navy: 0x2a2f6e, plum: 0x5b2a86, teal: 0x16b3a6, tealL: 0x7ff0e0,
  char: 0x2b2d42, orange: 0xff8a3d, white: 0xf7f3ea, car: 0x45b6fe, dev: 0x2a2346, gold: 0xffb627,
};
const FONT = "Impact, 'Arial Black', sans-serif";

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x2a1650, exp: 1.0, bloom: [0.22, 0.4, 0.88], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  scene.fog = new THREE.Fog(0x6a2c91, 40, 130);
  // NaN guard before bloom
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=max(c,vec4(0.));}" }), 1);

  // ---------- toon materials + ink ----------
  const gmap = (() => { const tx = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat); tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.generateMipmaps = false; tx.needsUpdate = true; return tx; })();
  const TM = {};
  const toon = (c, extra) => { if (!extra && TM[c]) return TM[c]; const m = new THREE.MeshToonMaterial({ color: c, gradientMap: gmap, ...(extra || {}) }); if (!extra) TM[c] = m; return m; };
  const OL = {};
  const olMat = (th) => { const k = th.toFixed(4); if (OL[k]) return OL[k]; const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
    m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = position + normalize(normal) * " + k + ";"); };
    m.customProgramCacheKey = () => "ol" + k; return (OL[k] = m); };
  const ink = (mesh, th = 0.016) => { const o = new THREE.Mesh(mesh.geometry, olMat(th)); mesh.add(o); return mesh; };
  const add = (geo, mat, x, y, z, p, th = 0.016) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); if (th) ink(m, th); return m; };
  const bx = (w, h, d, mat, x, y, z, p, th = 0.022) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m);
    if (th) m.add(new THREE.Mesh(new THREE.BoxGeometry(w + 2 * th, h + 2 * th, d + 2 * th), olMat(0))); return m; };
  const cy = (rad, h, mat, x, y, z, p, th = 0.02, seg = 24) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m);
    if (th) m.add(new THREE.Mesh(new THREE.CylinderGeometry(rad + th, rad + th, h + 2 * th, seg), olMat(0))); return m; };
  const cap = (rad, l) => new THREE.CapsuleGeometry(rad, l, 6, 16);
  const sph = (rad) => new THREE.SphereGeometry(rad, 22, 16);
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthWrite: false, ...o });

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xc9b8ff, 0x3a2350, 0.75));
  const key = new THREE.DirectionalLight(0xfff0dc, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 40 }); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6fe7ff, 1.6); scene.add(rim, rim.target);

  // ---------- background layers: sky, sun, two skyline cut-outs, ground ----------
  const skyT = canvasTex(256, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1b1446"); gr.addColorStop(0.36, "#4b1f7a"); gr.addColorStop(0.58, "#b03a8c"); gr.addColorStop(0.72, "#ff6f59"); gr.addColorStop(0.82, "#ffb35c"); gr.addColorStop(1, "#ffd27a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // flat cel bands
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,255,255,${0.035 + i * 0.008})`; g.fillRect(0, h * (0.62 + i * 0.05), w, 6); } });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(420, 170), new THREE.MeshBasicMaterial({ map: skyT, fog: false, toneMapped: false }));
  sky.position.set(-6, 40, -78); scene.add(sky);
  const sunT = canvasTex(512, 512, (g, w) => { const c = w / 2; g.fillStyle = "#0b0a12"; g.beginPath(); g.arc(c, c, 250, 0, 7); g.fill(); g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(c, c, 238, 0, 7); g.fill(); g.fillStyle = "#fff6c9"; g.beginPath(); g.arc(c - 30, c - 30, 160, 0, 7); g.fill();
    g.fillStyle = "#ffb44d"; for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) { const px = c + 40 + x * 22, py = c + 40 + y * 22; const d = Math.hypot(px - c, py - c); if (d < 228) { g.beginPath(); g.arc(px, py, 2 + (x + y) * 0.55, 0, 7); g.fill(); } }
    g.fillStyle = "#ff8a3d"; for (let i = 0; i < 5; i++) g.fillRect(0, c + 70 + i * 34, w, 8 + i * 3); g.globalCompositeOperation = "destination-in"; g.beginPath(); g.arc(c, c, 250, 0, 7); g.fill(); });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: sunT, transparent: true, fog: false, toneMapped: false })); sun.position.set(-20, 8, -76); scene.add(sun);
  const skyline = (seed, W, H, col, win, x, z, wu, hu) => {
    const rnd = mulberry(seed);
    const t = canvasTex(W, H, (g) => { g.clearRect(0, 0, W, H); let px = 0; while (px < W) { const bw = 40 + rnd() * 90, bh = H * (0.25 + rnd() * 0.65); g.fillStyle = "#0b0a12"; g.fillRect(px - 3, H - bh - 3, bw + 6, bh + 3); g.fillStyle = col; g.fillRect(px, H - bh, bw, bh);
      if (rnd() < 0.4) { g.fillStyle = "#0b0a12"; g.fillRect(px + bw * 0.45, H - bh - 26, 4, 26); }
      g.fillStyle = win; for (let wy = H - bh + 14; wy < H - 10; wy += 22) for (let wx = px + 8; wx < px + bw - 12; wx += 16) if (rnd() < 0.32) g.fillRect(wx, wy, 7, 10); px += bw + 4 + rnd() * 10; } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, fog: false })); m.position.set(x, hu / 2 - 0.5, z); scene.add(m); return m;
  };
  skyline(31, 2048, 400, "#3b1d66", "#ffcf6b", -8, -62, 230, 24);
  skyline(77, 2048, 300, "#251243", "#ff7aa8", -6, -36, 150, 10);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), toon(0x3d2a63)); ground.rotation.x = -PI / 2; ground.receiveShadow = true; scene.add(ground);
  // painted street lines
  const lineT = canvasTex(1024, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#ffd27a"; for (let i = 0; i < 16; i++) g.fillRect(i * 64 + 8, 24, 40, 14); });
  const lines = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.5), basic(lineT, { opacity: 0.55 })); lines.rotation.x = -PI / 2; lines.position.set(-4, 0.01, 4.6); scene.add(lines);

  // ---------- ARENA (x=0) ----------
  const arena = new THREE.Group(); scene.add(arena);
  const floorT = canvasTex(1024, 1024, (g, w) => { const c = w / 2; g.fillStyle = "#e9a53c"; g.fillRect(0, 0, w, w); g.strokeStyle = "#0b0a12"; g.lineWidth = 14; g.beginPath(); g.arc(c, c, 480, 0, 7); g.stroke(); g.strokeStyle = "#fff1c9"; g.lineWidth = 10; g.beginPath(); g.arc(c, c, 420, 0, 7); g.stroke(); g.beginPath(); g.arc(c, c, 160, 0, 7); g.stroke();
    g.fillStyle = "rgba(180,70,40,.35)"; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(c, c); g.arc(c, c, 470, (i * 2 * PI) / 12, (i * 2 * PI) / 12 + 0.18); g.fill(); } });
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.5, 0.12, 64), [new THREE.MeshToonMaterial({ color: 0xb4532a, gradientMap: gmap }), new THREE.MeshToonMaterial({ map: floorT, gradientMap: gmap }), toon(0xb4532a)]);
  floor.position.y = 0.06; floor.receiveShadow = true; arena.add(floor);
  // fence + sponsor banners
  const banner = (text, sub, bg, fg, w) => canvasTex(1024, 256, (g, W, H) => { g.fillStyle = "#0b0a12"; g.fillRect(0, 0, W, H); g.fillStyle = bg; g.fillRect(12, 12, W - 24, H - 24); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `${sub ? 150 : 170}px ${FONT}`; g.lineWidth = 16; g.strokeStyle = "#0b0a12"; g.strokeText(text, W / 2, sub ? 110 : 132); g.fillStyle = fg; g.fillText(text, W / 2, sub ? 110 : 132);
    if (sub) { g.font = `52px ${FONT}`; g.fillStyle = "#0b0a12"; g.fillText(sub, W / 2, 210); } });
  for (let i = -3; i <= 3; i++) cy(0.06, 2.3, toon(C.char), i * 1.7, 1.15, -3.4, arena, 0.02, 10);
  bx(10.4, 0.08, 0.08, toon(C.char), 0, 2.3, -3.4, arena);
  const ban = [[0, "AUDIRA", "SEJARAH GAME", "#e63946", "#ffffff", 4.0], [-3.9, "FIGHT", null, "#ffc93c", "#e63946", 2.6], [3.9, "ARCADE", null, "#16b3a6", "#ffffff", 2.6]];
  for (const [x, t1, t2, bg, fg, w] of ban) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.0), new THREE.MeshBasicMaterial({ map: banner(t1, t2, bg, fg), toneMapped: false })); m.position.set(x, 1.62, -3.36); arena.add(m); }
  // string lights
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xffe9a8, toneMapped: false });
  for (let i = 0; i < 26; i++) { const x = -5.2 + i * 0.42; const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), bulbM); b.position.set(x, 2.6 - 0.18 * Math.sin((i % 13) / 12 * PI), -3.3); arena.add(b); }

  // ---------- FIGHTER builder (original designs) ----------
  function fighter(o) {
    const G = new THREE.Group(); const hips = new THREE.Group(); G.add(hips); const sp = new THREE.Group(); hips.add(sp);
    const M = (geo, mat, x, y, z, p, th = 0.016) => add(geo, mat, x, y, z, p, th);
    M(sph(0.17), o.pants, 0, 0, 0, hips).scale.set(1.2, 0.85, 0.9);
    M(cap(0.15, 0.26), o.top, 0, 0.3, 0, sp).scale.set(1.35, 1, 0.82);
    M(sph(0.16), o.top, 0, 0.47, 0, sp).scale.set(1.75, 0.75, 1);
    if (o.belt) { const b = M(new THREE.TorusGeometry(0.19, 0.035, 8, 28), toon(o.belt), 0, 0.08, 0, sp, 0.012); b.rotation.x = PI / 2; b.scale.set(1.08, 0.8, 1); }
    if (o.shirt) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.02), toon(o.shirt)); s.position.set(0, 0.3, 0.135); sp.add(s); }
    if (o.dev) {} // silhouette: no details
    const head = new THREE.Group(); head.position.y = 0.66; sp.add(head);
    M(cap(0.06, 0.06), o.skin, 0, 0.0, 0, head, 0);
    const hd = M(sph(0.135), o.skin, 0, 0.14, 0.01, head); hd.scale.set(0.95, 1.08, 1);
    if (o.face) {
      const eye = toon(INK);
      for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.03, 4, 8), eye); e.position.set(s * 0.048, 0.155, 0.122); head.add(e);
        const br = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 0.01), eye); br.position.set(s * 0.05, 0.205, 0.123); br.rotation.z = s * -0.35; head.add(br); }
      const mo = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.01), eye); mo.position.set(0, 0.08, 0.128); head.add(mo);
    }
    if (o.hair === "spike") { const hm = toon(0x16131f); M(sph(0.14), hm, 0, 0.19, -0.025, head, 0.014).scale.set(1, 0.85, 1);
      for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; const c = M(new THREE.ConeGeometry(0.05, 0.2, 8), hm, Math.sin(a) * 0.1, 0.27 + Math.cos(a) * 0.02, -0.05 - Math.cos(a) * 0.03, head, 0.012); c.rotation.set(-0.7, 0, -a * 0.9); }
      const tk = M(sph(0.05), hm, 0, 0.3, -0.13, head, 0.012); tk.scale.set(1, 1.3, 1); }
    if (o.hair === "swept") { const hm = toon(C.orange); M(sph(0.142), hm, 0, 0.19, -0.02, head, 0.014).scale.set(1.02, 0.82, 1.02);
      const f = M(new THREE.ConeGeometry(0.09, 0.32, 10), hm, 0.03, 0.25, 0.06, head, 0.012); f.rotation.set(1.2, 0, -0.5); }
    if (o.hair === "dev") { M(sph(0.14), o.top, 0, 0.18, -0.02, head, 0.014).scale.set(1, 0.8, 1); }
    // collar / scarf / jacket tails
    let scarf = null;
    if (o.scarf) { const sm = toon(C.red); const ring = M(new THREE.TorusGeometry(0.1, 0.045, 8, 22), sm, 0, 0.62, 0, sp, 0.012); ring.rotation.x = PI / 2;
      scarf = []; let parent = new THREE.Group(); parent.position.set(0.04, 0.62, -0.1); sp.add(parent);
      for (let i = 0; i < 4; i++) { const pv = new THREE.Group(); if (i) pv.position.z = -0.2; parent.add(pv); const geo = new THREE.BoxGeometry(0.12, 0.02, 0.21); geo.translate(0, 0, -0.1); const sg = new THREE.Mesh(geo, sm); sg.castShadow = true; pv.add(sg);
        const og = new THREE.BoxGeometry(0.15, 0.05, 0.24); og.translate(0, 0, -0.1); pv.add(new THREE.Mesh(og, olMat(0))); scarf.push(pv); parent = pv; } }
    let tails = null;
    if (o.jacket) { const jm = toon(C.teal); const col = M(new THREE.TorusGeometry(0.12, 0.05, 8, 22, PI * 1.4), toon(C.tealL), 0, 0.6, 0, sp, 0.012); col.rotation.set(PI / 2, 0, PI * 0.8);
      tails = []; for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(s * 0.13, 0.08, 0.06); sp.add(pv); bx(0.13, 0.3, 0.05, jm, 0, -0.14, 0, pv, 0.015); tails.push(pv); }
      const back = new THREE.Group(); back.position.set(0, 0.08, -0.1); sp.add(back); bx(0.34, 0.3, 0.05, jm, 0, -0.14, 0, back, 0.015); tails.push(back); }
    const arm = (s) => { const sh = new THREE.Group(); sh.position.set(s * 0.27, 0.5, 0); sp.add(sh);
      M(sph(0.078), o.sleeve, 0, 0, 0, sh); M(cap(0.06, 0.2), o.sleeve, 0, -0.15, 0, sh);
      const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
      M(cap(0.052, 0.17), o.fore || o.skin, 0, -0.11, 0, el); const fist = M(sph(0.08), o.glove, 0, -0.27, 0.005, el); fist.scale.set(1, 0.92, 1.1);
      return { sh, el, fist }; };
    const leg = (s) => { const hp = new THREE.Group(); hp.position.set(s * 0.1, -0.04, 0); hips.add(hp);
      M(cap(0.082, 0.28), o.pants, 0, -0.21, 0, hp);
      const kn = new THREE.Group(); kn.position.y = -0.44; hp.add(kn);
      M(cap(0.068, 0.28), o.pants, 0, -0.2, 0, kn); M(sph(0.085), o.boot, 0, -0.44, 0.05, kn).scale.set(0.95, 0.7, 1.6);
      return { hp, kn }; };
    const F = { G, hips, sp, head, aN: arm(-1), aP: arm(1), lN: leg(-1), lP: leg(1), scarf, tails };
    return F;
  }
  const mk = (c) => toon(c);
  const A = fighter({ skin: mk(C.skin), top: mk(C.yel), sleeve: mk(C.skin), pants: mk(C.plum), glove: mk(C.red), boot: mk(C.char), belt: C.char, hair: "spike", face: true, scarf: true });
  const B = fighter({ skin: mk(C.skin2), top: mk(C.teal), sleeve: mk(C.teal), fore: mk(C.skin2), pants: mk(C.char), glove: mk(C.white), boot: mk(C.orange), shirt: C.white, hair: "swept", face: true, jacket: true });
  const A2 = fighter({ skin: mk(C.skin), top: mk(C.yel), sleeve: mk(C.skin), pants: mk(C.plum), glove: mk(C.red), boot: mk(C.char), belt: C.char, hair: "spike", face: true, scarf: true });
  const dm = mk(C.dev);
  const DV = fighter({ skin: dm, top: dm, sleeve: dm, pants: dm, glove: dm, boot: dm, hair: "dev" });
  A.G.rotation.y = PI / 2; B.G.rotation.y = -PI / 2; A2.G.rotation.y = PI / 2;
  scene.add(A.G, B.G, A2.G, DV.G);

  // ---------- poses ----------
  const P0 = { drop: 0, fwd: 0, lean: 0, twist: 0, head: 0, nu: 0, ne: -0.15, nz: -0.1, pu: 0, pe: -0.15, pz: 0.1, lnu: 0, lnk: 0, lnz: -0.05, lpu: 0, lpk: 0, lpz: 0.05, y: 0, rz: 0 };
  const PS = {
    idle: {},
    guard: { drop: 0.08, lean: 0.1, twist: 0.3, head: -0.1, nu: -0.55, ne: -2.0, nz: -0.2, pu: -0.85, pe: -1.9, pz: 0.25, lnu: -0.4, lnk: 0.5, lnz: -0.12, lpu: 0.3, lpk: 0.35, lpz: 0.12 },
    jabN: { drop: 0.1, fwd: 0.14, lean: 0.2, twist: 0.6, head: -0.15, nu: -1.55, ne: -0.05, nz: 0.12, pu: -0.85, pe: -2.0, pz: 0.25, lnu: -0.55, lnk: 0.55, lnz: -0.12, lpu: 0.45, lpk: 0.2, lpz: 0.12 },
    jabP: { drop: 0.1, fwd: 0.16, lean: 0.22, twist: -0.45, head: -0.15, nu: -0.6, ne: -2.0, nz: -0.25, pu: -1.55, pe: -0.05, pz: -0.15, lnu: -0.55, lnk: 0.55, lnz: -0.12, lpu: 0.5, lpk: 0.2, lpz: 0.12 },
    kick: { drop: -0.02, fwd: 0.05, lean: -0.3, twist: 0.2, head: 0.2, nu: -0.7, ne: -1.7, nz: -0.4, pu: -0.4, pe: -1.6, pz: 0.5, lnu: -1.5, lnk: 0.08, lnz: -0.05, lpu: 0.15, lpk: 0.15, lpz: 0.1 },
    upper: { drop: -0.08, fwd: 0.12, lean: -0.12, twist: -0.3, head: 0.25, nu: -0.6, ne: -2.0, nz: -0.25, pu: -2.75, pe: -0.25, pz: 0.05, lnu: -0.2, lnk: 0.1, lnz: -0.1, lpu: 0.35, lpk: 0.5, lpz: 0.1 },
    hurt: { drop: 0.04, fwd: -0.12, lean: -0.45, twist: -0.2, head: 0.45, nu: -0.45, ne: -0.7, nz: -0.55, pu: -0.35, pe: -0.6, pz: 0.6, lnu: -0.15, lnk: 0.3, lnz: -0.12, lpu: 0.25, lpk: 0.15, lpz: 0.12 },
    fly: { drop: 0.0, fwd: -0.1, lean: -0.9, twist: 0, head: 0.5, nu: -1.2, ne: -0.3, nz: -0.8, pu: -1.0, pe: -0.4, pz: 0.8, lnu: -0.7, lnk: 1.0, lnz: -0.2, lpu: -0.3, lpk: 0.8, lpz: 0.2 },
    win: { drop: 0.02, lean: -0.08, twist: 0.25, head: 0.25, nu: -0.25, ne: -1.4, nz: -0.45, pu: -3.0, pe: -0.1, pz: 0.12, lnu: -0.2, lnk: 0.1, lnz: -0.18, lpu: 0.12, lpk: 0.08, lpz: 0.18 },
    clip: { drop: 0, lean: 0.12, head: -0.35, nu: -0.95, ne: -1.15, nz: 0.1, pu: -0.6, pe: -1.5, pz: -0.1 },
    look: { drop: 0, lean: -0.08, head: 0.2, nu: -0.6, ne: -1.3, nz: 0.05, pu: -2.3, pe: -1.8, pz: 0.3 },
  };
  for (const k in PS) PS[k] = { ...P0, ...PS[k] };
  const blend = (p, q, w) => { if (w <= 0) return p; const o = {}; for (const k in p) o[k] = p[k] + (q[k] - p[k]) * w; return o; };
  const strikeW = (t, h, slow = 1) => ramp(t, h - 0.08 * slow, h) * (1 - ramp(t, h + 0.12 * slow, h + 0.34 * slow));
  const hurtW = (t, h, slow = 1) => ramp(t, h, h + 0.05 * slow) * (1 - ramp(t, h + 0.16 * slow, h + 0.48 * slow));
  function apply(F, p, baseY = 0.98) {
    F.hips.position.set(0, baseY - p.drop + p.y, p.fwd); F.hips.rotation.z = p.rz;
    F.sp.rotation.set(p.lean, p.twist, 0); F.head.rotation.set(p.head, -p.twist * 0.6, 0);
    F.aN.sh.rotation.set(p.nu, 0, p.nz); F.aN.el.rotation.x = p.ne; F.aP.sh.rotation.set(p.pu, 0, p.pz); F.aP.el.rotation.x = p.pe;
    F.lN.hp.rotation.set(p.lnu, 0, p.lnz); F.lN.kn.rotation.x = p.lnk; F.lP.hp.rotation.set(p.lpu, 0, p.lpz); F.lP.kn.rotation.x = p.lpk;
  }
  const breathe = (p, t, ph = 0) => ({ ...p, drop: p.drop + 0.015 * Math.sin(t * 5.2 + ph), nu: p.nu + 0.04 * Math.sin(t * 5.2 + ph + 1), pu: p.pu + 0.04 * Math.sin(t * 5.2 + ph + 2) });
  const cloth = (F, t, ph, amt = 1) => { if (F.scarf) F.scarf.forEach((s, i) => { s.rotation.x = (i === 0 ? 0.5 : 0.08) + amt * 0.22 * Math.sin(t * 7 + ph + i * 1.1); s.rotation.y = 0.12 * Math.sin(t * 4.3 + i + ph); });
    if (F.tails) F.tails.forEach((s, i) => { s.rotation.x = (i === 2 ? -0.15 : 0.1) * (1 + amt) + 0.06 * Math.sin(t * 6 + i + ph); }); };

  // ---------- hit schedule ----------
  const H1 = K.h1, H3 = K.h3, H4 = K.h4, H6 = K.h6;
  const SEQ1 = ["jabN", "jabP", "kick", "jabN", "jabP", "upper"], SEQ6 = ["jabN", "jabP", "jabN", "kick", "jabP", "jabN", "kick", "upper"];
  const SEQ3 = ["jabP", "kick", "upper"], SEQ4 = ["jabN", "jabP", "jabN"];
  const gb = AT["s1:bug"];
  // effective arena time: at "bug" the combo stutters back to hit 5 and freezes there until the whip to s2
  const arenaT = (t) => { if (t >= gb && t < K.s2) { const fr = Math.floor((t - gb) * 10); return fr < 6 ? H1[4] + 0.04 + (fr % 3) * 0.06 : H1[4] + 0.1; } return t; };
  const tR = AT["s4:Adegannya"];

  const comboState = (t, hits, seq, slow = 1) => {
    let pa = breathe(PS.guard, t), pb = breathe(PS.guard, t, 1.7), push = 0, launch = null;
    hits.forEach((h, i) => { pa = blend(pa, PS[seq[i]], strikeW(t, h, slow)); pb = blend(pb, PS.hurt, hurtW(t, h, slow)); if (t > h) push += 0.07 * eout((t - h) / 0.14); });
    const hl = hits[hits.length - 1];
    const rec = ramp(t, hl + 1.0, hl + 2.0);
    let ly = 0, lx = 0;
    if (t > hl) { const u = clamp01((t - hl) / 0.95); ly = 0.85 * Math.sin(PI * u); lx = 0.75 * eout(u); pb = blend(pb, PS.fly, Math.sin(PI * u)); }
    lx *= 1 - rec; push *= 1 - rec;
    return { pa, pb, push, lx, ly };
  };

  // ---------- impact stars (pool) ----------
  const starGeo = (n, r1, r2) => { const s = new THREE.Shape(); for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * PI * 2, rr = i % 2 ? r2 : r1; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); } return new THREE.ShapeGeometry(s); };
  const stars = [];
  for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const mk2 = (geo, c, z) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, depthTest: false, depthWrite: false })); m.position.z = z; m.renderOrder = 30; g.add(m); return m; };
    mk2(starGeo(11, 0.62, 0.28), INK, 0); mk2(starGeo(11, 0.54, 0.24), C.yel, 0.001); mk2(starGeo(7, 0.3, 0.14), 0xffffff, 0.002); g.rotation.z = i; scene.add(g); stars.push(g); }
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
  const rings = stars.map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), ringM.clone()); m.renderOrder = 29; scene.add(m); return m; });

  // ---------- ARCADE CABINETS ----------
  const screenT = (variant) => canvasTex(512, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1b2a78"); gr.addColorStop(1, "#ff7a59"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#3b1d66"; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = "#ffd27a"; g.fillRect(0, h * 0.72, w, 6);
    g.fillStyle = "#ffc93c"; g.fillRect(24, 24, 190, 18); g.fillRect(w - 214, 24, 190 - variant * 40, 18); g.strokeStyle = "#fff"; g.lineWidth = 3; g.strokeRect(24, 24, 190, 18); g.strokeRect(w - 214, 24, 190, 18);
    const fig = (x, col, acc, dir) => { g.fillStyle = col; g.fillRect(x - 14, h * 0.45, 28, 50); g.fillStyle = "#f2b48a"; g.fillRect(x - 11, h * 0.45 - 24, 22, 22); g.fillStyle = acc; g.fillRect(x - 14, h * 0.45 + 50, 12, 46); g.fillRect(x + 2, h * 0.45 + 50, 12, 46); g.fillStyle = col; g.fillRect(x + dir * 14, h * 0.45 + 6, dir * 30, 12); };
    fig(190, "#ffc93c", "#5b2a86", 1); g.fillStyle = "#e63946"; g.fillRect(170, h * 0.45 - 2, 40, 8); fig(320, "#16b3a6", "#2b2d42", -1);
    g.fillStyle = "rgba(0,0,0,.18)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2);
  });
  const comboT = canvasTex(512, 384, (g, w, h) => { g.clearRect(0, 0, w, h); g.translate(w / 2, h / 2); g.rotate(-0.12); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `150px ${FONT}`; g.lineWidth = 22; g.strokeStyle = "#0b0a12"; g.strokeText("COMBO!", 0, -10); g.fillStyle = "#ffc93c"; g.fillText("COMBO!", 0, -10); g.font = `64px ${FONT}`; g.lineWidth = 12; g.strokeText("8 HIT", 0, 104); g.fillStyle = "#fff"; g.fillText("8 HIT", 0, 104); });
  const marqT = (text, bg) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `86px ${FONT}`; g.lineWidth = 12; g.strokeStyle = "#0b0a12"; g.strokeText(text, w / 2, h / 2 + 4); g.fillStyle = "#fff"; g.fillText(text, w / 2, h / 2 + 4); });
  const scrA = screenT(0), scrB = screenT(1);
  const cabCols = [0xe63946, 0x16b3a6, 0xffc93c, 0x5b2a86, 0xff8a3d, 0x45b6fe, 0xe63946, 0x16b3a6, 0xffc93c, 0x5b2a86];
  const marqs = [["1991", "#e63946"], ["VS", "#16b3a6"], ["FIGHT!", "#ff8a3d"], ["VS", "#5b2a86"], ["ROUND 1", "#e63946"], ["FIGHT!", "#16b3a6"], ["VS", "#ff8a3d"], ["K.O.", "#5b2a86"], ["VS", "#e63946"], ["FIGHT!", "#16b3a6"]];
  const cabs = [];
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group(); g.position.set(-9 - 1.25 * i, 0, -1); scene.add(g);
    const cm = toon(cabCols[i]), dk = toon(0x1a1730);
    bx(0.86, 1.02, 0.72, cm, 0, 0.51, 0, g);
    const deck = bx(0.86, 0.12, 0.38, dk, 0, 1.08, 0.3, g); deck.rotation.x = 0.28;
    bx(0.86, 0.86, 0.56, cm, 0, 1.56, -0.08, g);
    bx(0.9, 0.24, 0.62, dk, 0, 2.1, -0.04, g);
    const mq = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.21), new THREE.MeshBasicMaterial({ map: marqT(marqs[i][0], marqs[i][1]), toneMapped: false })); mq.position.set(0, 2.1, 0.275); g.add(mq);
    const bez = bx(0.74, 0.6, 0.02, dk, 0, 1.58, 0.205, g, 0); bez.rotation.x = -0.12;
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.5), new THREE.MeshBasicMaterial({ map: i % 2 ? scrB : scrA, toneMapped: false })); sc.position.set(0, 1.585, 0.218); sc.rotation.x = -0.12; g.add(sc);
    const cb = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.5), basic(comboT)); cb.position.set(0, 1.585, 0.226); cb.rotation.x = -0.12; cb.renderOrder = 5; g.add(cb);
    const st = cy(0.018, 0.12, toon(C.char), -0.2, 1.2, 0.3, g, 0.01, 8); st.rotation.x = 0.28; add(sph(0.045), toon(C.red), -0.2, 1.27, 0.32, g, 0.01);
    for (let b = 0; b < 3; b++) add(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 14), toon([C.red, C.yel, C.tealL][b]), 0.02 + b * 0.1, 1.16, 0.3, g, 0.008).rotation.x = 0.28;
    for (const s of [-1, 1]) bx(0.02, 1.9, 0.5, toon(cabCols[(i + 3) % 10]), s * 0.44, 1.05, 0.0, g, 0);
    cabs.push({ g, cb });
  }
  // silhouette rows of more cabinets behind (instanced)
  const NS = 36;
  const silM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 2.1, 0.7), toon(0x2b1f4a), NS); silM.frustumCulled = false; scene.add(silM);
  const silO = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 2.15, 0.75), olMat(0), NS); silO.frustumCulled = false; scene.add(silO);
  const silS = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.62, 0.48), new THREE.MeshBasicMaterial({ toneMapped: false }), NS); silS.frustumCulled = false; scene.add(silS);
  const dummy = new THREE.Object3D(); const srnd = mulberry(303); const silPos = [];
  for (let i = 0; i < NS; i++) { const row = i % 2, j = Math.floor(i / 2); const x = -7 - 1.35 * j + (row ? 0.6 : 0) + (srnd() - 0.5) * 0.2, z = row ? -10 : -5.5; silPos.push([x, z]);
    dummy.position.set(x, 1.05, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); silM.setMatrixAt(i, dummy.matrix); silO.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 1.45, z + 0.36); dummy.updateMatrix(); silS.setMatrixAt(i, dummy.matrix); silS.setColorAt(i, new THREE.Color(0x221a3a)); }
  const sDark = new THREE.Color(0x221a3a), sLit = [new THREE.Color(0xffc93c), new THREE.Color(0xff5a6e), new THREE.Color(0x6fe7ff)], tmpC = new THREE.Color();

  // developer crowd for s2 (36 small silhouettes, instanced)
  const NC = 36;
  const crB = new THREE.InstancedMesh(cap(0.13, 0.32), toon(0x4b3f72), NC), crH = new THREE.InstancedMesh(sph(0.11), toon(0x6d5fa0), NC);
  const crBO = new THREE.InstancedMesh(cap(0.13, 0.32), olMat(0.014), NC), crHO = new THREE.InstancedMesh(sph(0.11), olMat(0.014), NC);
  for (const m of [crB, crH, crBO, crHO]) { m.frustumCulled = false; scene.add(m); }
  const crowd = []; { let n = 0; for (const [R, cnt] of [[1.6, 10], [2.3, 12], [3.0, 14]]) for (let k = 0; k < cnt; k++) { const a = PI * (0.12 + 0.76 * (k / (cnt - 1))); crowd.push([-9 + Math.cos(a) * R * 1.25, -1.6 - Math.sin(a) * R * 0.75, n++ * 0.034]); } }

  // ---------- BONUS STAGE (x=10) ----------
  const bonus = new THREE.Group(); scene.add(bonus);
  const stT = canvasTex(512, 512, (g, w) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#ffc93c" : "#ff8a3d"; g.fillRect(x * 64, y * 64, 64, 64); } });
  const plat = bx(5.6, 0.35, 3.4, [toon(0xb4532a), toon(0xb4532a), new THREE.MeshToonMaterial({ map: stT, gradientMap: gmap }), toon(0xb4532a), toon(0xb4532a), toon(0xb4532a)], 10, 0.175, 0, bonus);
  const frM = toon(C.red), goldM = toon(C.gold);
  bx(0.4, 3.6, 0.4, frM, 7.0, 1.8, 1.6, bonus); bx(0.4, 3.6, 0.4, frM, 13.0, 1.8, 1.6, bonus); bx(6.4, 0.5, 0.45, frM, 10, 3.75, 1.6, bonus);
  bx(6.5, 0.1, 0.5, goldM, 10, 3.47, 1.6, bonus);
  const signT = canvasTex(1024, 192, (g, w, h) => { g.fillStyle = "#0b0a12"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffc93c"; g.fillRect(10, 10, w - 20, h - 20); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `120px ${FONT}`; g.lineWidth = 14; g.strokeStyle = "#0b0a12"; g.strokeText("BONUS STAGE", w / 2, h / 2 + 6); g.fillStyle = "#e63946"; g.fillText("BONUS STAGE", w / 2, h / 2 + 6); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.675), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false })); sign.position.set(10, 4.35, 1.62); bonus.add(sign);
  const sponsorT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#e63946"; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `92px ${FONT}`; g.fillStyle = "#fff"; g.fillText("AUDIRA", w / 2, h / 2 + 4); });
  const spn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: sponsorT, toneMapped: false })); spn.position.set(10, 2.6, -1.69); bonus.add(spn);
  bx(5.6, 2.9, 0.1, toon(0x3b1d66), 10, 1.8, -1.75, bonus);
  // curtain halves (pivot at the outer pillar)
  const curT = canvasTex(512, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#9e1b32" : "#d7263d"; g.fillRect(i * 32, 0, 32, h); g.fillStyle = "#0b0a12"; g.fillRect(i * 32 + 30, 0, 2, h); } });
  const curM = new THREE.MeshToonMaterial({ map: curT, gradientMap: gmap, side: THREE.DoubleSide });
  const curtains = [-1, 1].map((s) => { const geo = new THREE.BoxGeometry(2.9, 3.2, 0.06); geo.translate(-s * 1.45, 0, 0); const m = new THREE.Mesh(geo, curM); m.position.set(s > 0 ? 12.85 : 7.15, 1.85, 1.78); m.castShadow = true; scene.add(m);
    const og = new THREE.BoxGeometry(2.94, 3.24, 0.1); og.translate(-s * 1.45, 0, 0); m.add(new THREE.Mesh(og, olMat(0))); return m; });
  // padlock
  const lock = new THREE.Group(); lock.position.set(10, 1.9, 1.95); scene.add(lock);
  bx(0.7, 0.55, 0.2, goldM, 0, 0, 0, lock, 0.03); const sh = add(new THREE.TorusGeometry(0.22, 0.06, 10, 24, PI), toon(0xc7cbd6), 0, 0.27, 0, lock, 0.02);
  add(sph(0.06), toon(INK), 0, 0.02, 0.11, lock, 0); bx(0.04, 0.14, 0.02, toon(INK), 0, -0.08, 0.11, lock, 0);

  // car
  const car = new THREE.Group(); car.position.set(10.45, 0.35, -0.05); scene.add(car);
  const body = new THREE.Group(); car.add(body);
  const carM = toon(C.car);
  bx(2.1, 0.42, 1.0, carM, 0, 0.44, 0, body);
  bx(2.12, 0.08, 1.02, toon(C.white), 0, 0.5, 0, body, 0);
  const cabin = new THREE.Group(); cabin.position.set(-0.12, 0.66, 0); body.add(cabin);
  bx(1.0, 0.32, 0.86, toon(0x1d3b8f), 0, 0.16, 0, cabin); bx(1.12, 0.08, 0.92, carM, 0, 0.35, 0, cabin);
  for (const s of [-1, 1]) bx(0.08, 0.32, 0.88, carM, s * 0.12, 0.16, 0, cabin, 0.01);
  const crackT = canvasTex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#ffffff"; g.lineWidth = 4; const rn = mulberry(9); for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(w * 0.4, h * 0.5); let x = w * 0.4, y = h * 0.5; for (let j = 0; j < 4; j++) { x += (rn() - 0.5) * 90; y += (rn() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); } });
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.3), basic(crackT, { opacity: 0 })); crack.position.set(-0.12, 0.82, 0.441); body.add(crack);
  const wheels = []; for (const [x, z] of [[0.68, 0.47], [-0.68, 0.47], [0.68, -0.47], [-0.68, -0.47]]) { const w = cy(0.21, 0.16, toon(0x16131f), x, 0.22, z, car, 0.02); w.rotation.x = PI / 2; cy(0.1, 0.17, toon(0xc7cbd6), 0, 0, 0, w, 0, 16); wheels.push(w); }
  for (const z of [-0.32, 0.32]) { add(sph(0.075), toon(0xfff3b0, { emissive: 0xffe08a, emissiveIntensity: 0.6 }), 1.05, 0.5, z, body, 0.01); add(sph(0.06), toon(C.red), -1.05, 0.52, z, body, 0.01); }
  const plateT = canvasTex(512, 160, (g, w, h) => { g.fillStyle = "#0b0a12"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff6d6"; g.fillRect(8, 8, w - 16, h - 16); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `110px ${FONT}`; g.fillStyle = "#0b0a12"; g.fillText("AUDIRA", w / 2, h / 2 + 6); });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.144), new THREE.MeshBasicMaterial({ map: plateT, toneMapped: false })); plate.position.set(1.115, 0.32, 0); plate.rotation.y = PI / 2; body.add(plate);
  const bumperF = bx(0.12, 0.14, 1.04, toon(0xc7cbd6), 1.08, 0.28, 0, body, 0.015);
  const door = bx(0.6, 0.34, 0.04, carM, -0.12, 0.42, 0.52, body, 0.012);
  const shards = []; const shr = mulberry(41);
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.05 + shr() * 0.05), new THREE.MeshBasicMaterial({ color: i % 3 ? 0xbfe9ff : 0xffffff, toneMapped: false })); scene.add(m); shards.push({ m, v: [1.5 + shr() * 2.5, 2 + shr() * 2.5, (shr() - 0.5) * 3], s: shr() * 9 }); }
  // flying parts: door + bumper detach on the big smash
  const doorHome = door.position.clone(), bumpHome = bumperF.position.clone();

  // developer silhouette with clipboard + name plate + "!"
  DV.G.position.set(12.25, 0, 2.55); DV.G.rotation.y = -1.05;
  const clip = new THREE.Group(); clip.position.set(0, -0.3, 0.1); DV.aN.el.add(clip);
  const clipT = canvasTex(256, 320, (g, w, h) => { g.fillStyle = "#fff6d6"; g.fillRect(0, 0, w, h); g.fillStyle = "#0b0a12"; g.font = `52px ${FONT}`; g.textAlign = "center"; g.fillText("CEK BUG", w / 2, 70); g.lineWidth = 6; g.strokeStyle = "#0b0a12"; for (let i = 0; i < 3; i++) { g.strokeRect(30, 110 + i * 66, 40, 40); g.fillRect(90, 126 + i * 66, 130, 8); } g.strokeStyle = "#e63946"; g.beginPath(); g.moveTo(36, 128); g.lineTo(48, 144); g.lineTo(68, 108); g.stroke(); });
  const clipB = bx(0.26, 0.02, 0.32, toon(0x8a5520), 0, 0, 0, clip, 0.012); const clipP = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28), new THREE.MeshBasicMaterial({ map: clipT, toneMapped: false })); clipP.rotation.x = -PI / 2; clipP.position.y = 0.012; clip.add(clipP); clip.rotation.x = -0.9;
  const tagTex = (text, bg, fg, w = 1024, h = 180, fs = 104) => canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); g.fillStyle = "#0b0a12"; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(8, 8, w - 16, h - 16); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `${fs}px ${FONT}`; g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 5, w - 40); });
  const nameP = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.264), basic(tagTex("PENGEMBANG CAPCOM", "#ffffff", "#0b0a12"), { depthTest: false })); nameP.renderOrder = 25; scene.add(nameP);
  const bangT = canvasTex(256, 256, (g, w) => { g.textAlign = "center"; g.textBaseline = "middle"; g.font = `220px ${FONT}`; g.lineWidth = 26; g.strokeStyle = "#0b0a12"; g.strokeText("!", w / 2, w / 2 + 10); g.fillStyle = "#ffc93c"; g.fillText("!", w / 2, w / 2 + 10); });
  const bang = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), basic(bangT, { depthTest: false })); bang.renderOrder = 26; scene.add(bang);

  // ---------- foreground speed-line layer (camera-locked) ----------
  scene.add(cam);
  const slTex = [0, 1, 2].map((v) => canvasTex(512, 912, (g, w, h) => { g.clearRect(0, 0, w, h); const rn = mulberry(70 + v); const cx = w / 2, cyy = h * 0.55;
    for (let i = 0; i < 120; i++) { const a = rn() * PI * 2, r0 = 170 + rn() * 140, r1 = 900; const wdt = 1 + rn() * 5; g.fillStyle = rn() < 0.75 ? "rgba(255,255,255,.95)" : "rgba(11,10,18,.85)"; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cyy + Math.sin(a) * r0 * 1.4); g.lineTo(cx + Math.cos(a + wdt * 0.004) * r1, cyy + Math.sin(a + wdt * 0.004) * r1 * 1.4); g.lineTo(cx + Math.cos(a - wdt * 0.004) * r1, cyy + Math.sin(a - wdt * 0.004) * r1 * 1.4); g.fill(); } }));
  const slM = new THREE.MeshBasicMaterial({ map: slTex[0], transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.75), slM); sl.position.set(0, 0, -1); sl.renderOrder = 40; cam.add(sl);
  // horizontal whip streaks for camera swings
  const whT = canvasTex(512, 912, (g, w, h) => { g.clearRect(0, 0, w, h); const rn = mulberry(5); for (let i = 0; i < 70; i++) { const y = rn() * h, l = 120 + rn() * 380, x = rn() * w; g.fillStyle = rn() < 0.8 ? "rgba(255,255,255,.8)" : "rgba(11,10,18,.7)"; g.fillRect(x - l / 2, y, l, 1 + rn() * 3); } });
  const whM = new THREE.MeshBasicMaterial({ map: whT, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const wh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.75), whM); wh.position.set(0, 0, -1.01); wh.renderOrder = 39; cam.add(wh);

  // ---------- camera ----------
  const A_ = (k, o = 0) => AT[k] + o;
  const path = track([
    [0, 3.5, 1.65, 10.8, 0.35, 1.25, 0, -0.05],
    [A_("s1:awalnya"), 3.2, 1.6, 10.2, 0.4, 1.25, 0, -0.08],
    [gb, 3.0, 1.55, 9.8, 0.4, 1.25, 0, 0.1],
    [K.s1e, 2.95, 1.55, 9.6, 0.4, 1.25, 0, 0.12],
    [K.s2 + 0.45, -7.45, 1.3, 5.3, -9.0, 1.08, -1.2, 0],
    [A_("s2:dikerjakan", -0.3), -7.9, 1.42, 4.8, -9.05, 1.1, -1.25, 0],
    [A_("s2:orang"), -6.9, 2.7, 8.8, -9.2, 0.75, -2.6, 0],
    [K.s2e, -6.75, 2.8, 9.1, -9.2, 0.75, -2.6, 0],
    [K.s3 + 0.7, 13.2, 1.9, 11.6, 11.0, 1.1, 0.8, 0],
    [A_("s3:menghancurkan", -0.4), 11.9, 1.75, 11.6, 10.6, 1.0, 0.3, 0],
    [K.s3e, 11.5, 1.6, 10.8, 10.35, 1.0, 0.2, 0.04],
    [K.s4 + 0.4, 14.2, 2.0, 10.6, 11.9, 1.55, 1.4, 0],
    [A_("s4:direkam"), 13.8, 1.95, 10.2, 11.6, 1.5, 1.2, 0],
    [A_("s4:Ternyata"), 10.6, 1.45, 8.2, 9.7, 1.0, 0.1, 0],
    [K.s4e, 10.7, 1.4, 7.6, 9.75, 1.0, 0.1, 0.03],
    [K.s5 + 0.5, 10.4, 1.55, 9.0, 10.0, 1.25, 0, 0],
    [A_("s5:dihapus"), 10.8, 2.05, 14.6, 10.6, 1.6, 0.4, 0],
    [K.s5e, 10.8, 2.1, 15.2, 10.6, 1.6, 0.4, 0],
    [K.s6 + 0.55, 2.5, 1.28, 7.6, 0.12, 1.0, 0, 0.03],
    [A_("s6:Ternyata"), 2.25, 1.22, 7.0, 0.15, 1.0, 0, -0.06],
    [A_("s6:delapan", 0.3), 1.75, 1.12, 5.9, 0.25, 1.08, 0, -0.2],
    [K.s6e, 1.7, 1.12, 5.8, 0.25, 1.08, 0, -0.2],
    [K.s7 + 0.65, -6.8, 1.5, 6.2, -9.7, 1.08, -1.0, 0],
    [A_("s7:resmi"), -8.6, 1.5, 6.0, -11.5, 1.08, -1.0, 0],
    [A_("s7:Gamenya"), -14.2, 1.6, 6.4, -17.2, 1.05, -1.2, 0],
    [A_("s7:dunia"), -13.4, 5.2, 11.8, -17.6, 0.6, -5.5, 0],
    [K.s7e, -13.3, 5.4, 12.1, -17.6, 0.6, -5.5, 0],
    [K.s8 + 0.75, 2.7, 1.45, 8.8, 0.05, 1.0, 0, 0],
    [K.end, 2.15, 1.36, 7.6, 0.05, 1.0, 0, 0],
    [K.dur, 2.05, 1.33, 7.4, 0.05, 1.0, 0, 0],
  ]);
  const whips = [K.s2 + 0.15, K.s3 + 0.35, K.s4 + 0.1, K.s6 + 0.2, K.s7 + 0.3, K.s8 + 0.35];
  const ALLH = [...H1.map((h) => [h, 1]), ...H3.map((h) => [h, 1]), ...H4.map((h) => [h, 0.6]), ...H6.map((h) => [h, 1])];
  const tgt = new THREE.Vector3();

  return (t) => {
    const te = arenaT(t);
    // ---- arena fighters ----
    const inS6 = t > K.s5e;
    const hits = inS6 ? H6 : H1, seq = inS6 ? SEQ6 : SEQ1;
    const st = comboState(te, hits, seq);
    let pa = st.pa, pb = st.pb;
    if (t > A_("s8:fitur") - 0.4) { pa = blend(pa, breathe(PS.win, t), ramp(t, A_("s8:fitur") - 0.4, A_("s8:fitur"))); }
    apply(A, pa); apply(B, pb, 0.98 + st.ly);
    A.G.position.set(-0.75 + st.push * 0.85, 0.12, 0); B.G.position.set(0.75 + st.push + st.lx, 0.12, 0);
    B.G.rotation.z = -0.5 * Math.sin(PI * clamp01((te - hits[hits.length - 1]) / 0.95)) * (te > hits[hits.length - 1] ? 1 : 0);
    cloth(A, t, 0, 1 + st.push * 4); cloth(B, t, 2);
    const arenaVis = t < K.s2 + 0.6 || (t > K.s5e - 0.3 && t < K.s7 + 0.8) || t > K.s7e - 0.2;
    A.G.visible = B.G.visible = arenaVis;

    // ---- bonus stage fighter vs car ----
    const replay = t >= tR;
    const hb = replay ? H4 : H3, sq = replay ? SEQ4 : SEQ3, slow = replay ? 3 : 1;
    const tt = replay && t < A_("s4:ulang", 0.4) ? tR - (t - tR) * 1.6 : t; // rewind before the slow replay
    let p2 = breathe(PS.guard, tt, 0.6); hb.forEach((h, i) => { p2 = blend(p2, PS[sq[i]], strikeW(tt, h, slow)); });
    apply(A2, p2); A2.G.position.set(8.72, 0.35 + 0.12, 0.05); cloth(A2, t, 1, 1);
    let dmg = 0; hb.forEach((h) => { if (tt >= h) dmg++; });
    const big = hb[hb.length - 1];
    body.rotation.z = dmg >= 1 ? -0.05 * dmg : 0; body.position.y = dmg >= 2 ? -0.03 : 0;
    cabin.position.y = 0.66 - (dmg >= 2 ? 0.07 : 0) - (dmg >= 3 ? 0.06 : 0); cabin.rotation.z = dmg >= 3 ? 0.12 : 0;
    crack.material.opacity = dmg >= 1 ? 0.9 : 0;
    const sh0 = hb.reduce((a, h) => (tt > h && tt - h < 0.3 ? 0.06 * Math.sin((tt - h) * 70) * (1 - (tt - h) / 0.3) : a), 0);
    car.position.x = 10.45 + sh0; car.position.y = 0.35 + (tt > big ? 0.25 * Math.sin(PI * clamp01((tt - big) / 0.35)) : 0);
    const ft = tt - big;
    if (ft > 0) { const u = Math.min(ft, 1.6); door.position.set(doorHome.x + 1.2 * u, Math.max(-0.25, doorHome.y + 2.2 * u - 4.9 * u * u), doorHome.z + 1.4 * u); door.rotation.set(u * 5, u * 3, 0);
      bumperF.position.set(bumpHome.x + 1.6 * u, Math.max(-0.2, bumpHome.y + 1.5 * u - 4.9 * u * u), bumpHome.z + 0.5 * u); bumperF.rotation.set(0, u * 4, u * 2); }
    else { door.position.copy(doorHome); door.rotation.set(0, 0, 0); bumperF.position.copy(bumpHome); bumperF.rotation.set(0, 0, 0); }
    shards.forEach((s) => { const u = Math.min(ft, 1.4); s.m.visible = ft > 0 && ft < 2.5; if (s.m.visible) { s.m.position.set(9.6 + s.v[0] * u * 0.6, 1.1 + s.v[1] * u - 4.9 * u * u, s.v[2] * u * 0.6); if (s.m.position.y < 0.37) s.m.position.y = 0.37; s.m.rotation.set(s.s + u * 8, u * 6, 0); } });
    // curtain + lock
    const cc = ramp(t, A_("s5:dibiarkan", -0.25), A_("s5:tersembunyi", 0.25));
    curtains.forEach((m) => { m.scale.x = 0.08 + 0.92 * cc; });
    const lk = back(clamp01((t - A_("s5:tersembunyi", 0.2)) / 0.35), 2.2);
    lock.visible = lk > 0.01; lock.scale.setScalar(Math.max(0.01, lk)); lock.rotation.z = 0.08 * Math.sin(t * 3);
    // developer
    let pd = blend(breathe(PS.clip, t, 2), PS.look, ramp(t, A_("s4:aneh", -0.3), A_("s4:aneh")) * (1 - ramp(t, A_("s4:direkam"), A_("s4:direkam", 0.4))));
    pd = { ...pd, pe: pd.pe + 0.25 * Math.sin(t * 9) * ramp(t, A_("s3:mengecek", -0.2), A_("s3:mengecek", 0.2)) * (1 - ramp(t, A_("s3:Babak"), A_("s3:Babak", 0.3))) };
    apply(DV, pd);
    const nv = ramp(t, A_("s3:pengembang", -0.3), A_("s3:pengembang", 0.1)) * (1 - ramp(t, K.s6 - 0.4, K.s6));
    nameP.visible = nv > 0.01; nameP.position.set(11.85, 2.25, 2.6); nameP.quaternion.copy(cam.quaternion); nameP.scale.setScalar(Math.max(0.01, back(nv)));
    const bg = back(clamp01((t - A_("s4:aneh", -0.15)) / 0.3), 2.5) * (1 - ramp(t, A_("s4:Ternyata", -0.6), A_("s4:Ternyata", -0.3)));
    bang.visible = bg > 0.01; bang.position.set(12.85, 1.85 + 0.05 * Math.sin(t * 12), 2.6); bang.quaternion.copy(cam.quaternion); bang.scale.setScalar(Math.max(0.01, bg));

    // ---- crowd (s2) ----
    const c0 = A_("s2:dikerjakan", -0.1);
    crowd.forEach(([x, z, d], i) => { const u = back(clamp01((t - c0 - d) / 0.3), 2) * (1 - ramp(t, K.s3, K.s3 + 0.5)); const s = Math.max(0.001, u); const bob = 0.03 * Math.sin(t * 6 + i);
      dummy.rotation.set(0, Math.atan2(-9 - x, -1 - z), 0); dummy.scale.set(s, s, s); dummy.position.set(x, 0.3 * s + bob, z); dummy.updateMatrix(); crB.setMatrixAt(i, dummy.matrix); crBO.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.66 * s + bob, z); dummy.updateMatrix(); crH.setMatrixAt(i, dummy.matrix); crHO.setMatrixAt(i, dummy.matrix); });
    for (const m of [crB, crH, crBO, crHO]) m.instanceMatrix.needsUpdate = true;

    // ---- cabinets: COMBO! wave on "resmi", silhouettes light on "standar" ----
    const cw = A_("s7:resmi", -0.2);
    cabs.forEach((c, i) => { const u = back(clamp01((t - cw - i * 0.22) / 0.3), 2.4); c.cb.visible = u > 0.01; c.cb.scale.setScalar(Math.max(0.01, u)); });
    const sw = A_("s7:standar", -0.2);
    for (let i = 0; i < NS; i++) { const u = ramp(t, sw + Math.floor(i / 2) * 0.12, sw + Math.floor(i / 2) * 0.12 + 0.25); tmpC.copy(sDark).lerp(sLit[i % 3], u * (0.75 + 0.25 * Math.sin(t * 8 + i))); silS.setColorAt(i, tmpC); }
    silS.instanceColor.needsUpdate = true;

    // ---- impact stars ----
    let si = 0; let sl0 = 0, shake = 0;
    const starAt = (h, tE, pos, sc, k) => { const u = (tE - h) / 0.32; const g = stars[k % 8], rg = rings[k % 8]; if (u < 0 || u > 1) return; g.visible = true; g.position.copy(pos); g.quaternion.copy(cam.quaternion); g.rotateZ(k * 0.7); g.scale.setScalar(Math.max(0.01, sc * back(Math.min(1, u * 3.2), 2.5) * (1 - 0.6 * ramp(u, 0.6, 1))));
      rg.visible = true; rg.position.copy(pos); rg.quaternion.copy(cam.quaternion); rg.scale.setScalar(0.2 + u * 1.1 * sc); rg.material.opacity = 1 - u; };
    stars.forEach((g) => (g.visible = false)); rings.forEach((g) => (g.visible = false));
    const bx0 = B.G.position.x;
    hits.forEach((h, i) => { if (arenaVis) starAt(h, te, tgt.set(bx0 - 0.3, i === hits.length - 1 ? 1.45 : 1.3 - (seq[i] === "kick" ? 0.25 : 0), 0.3), i === hits.length - 1 ? 1.25 : 0.8, i); });
    hb.forEach((h, i) => { if (!replay || tt > A_("s4:ulang")) starAt(h, replay ? tt - (tt - h) * 0.66 : tt, tgt.set(9.35, 0.95 + i * 0.1, 0.45), i === 2 ? 1.1 : 0.75, i + 3); });
    for (const [h, a] of ALLH) { const d = t - h; if (d >= 0 && d < 0.6) { sl0 = Math.max(sl0, a * (1 - d / 0.6)); shake += a * 0.045 * Math.exp(-d * 12) * Math.sin(d * 75); } }
    if (t >= gb && t < K.s2) sl0 = Math.max(sl0, 0.55);
    slM.map = slTex[Math.floor(t * 12) % 3]; slM.opacity = Math.min(0.85, sl0);
    let w0 = 0; for (const w of whips) w0 = Math.max(w0, 1 - Math.abs(t - w) / 0.45); whM.opacity = 0.7 * clamp01(w0);
    sl.visible = slM.opacity > 0.01; wh.visible = whM.opacity > 0.01;

    // ---- camera ----
    const c = path(t);
    cam.position.set(c[0] + shake, c[1] + shake * 0.6, c[2]); tgt.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(tgt); cam.rotateZ(c[6]);
    key.position.set(c[3] + 4, 9, c[5] + 7); key.target.position.set(c[3], 0, c[5]); key.target.updateMatrixWorld();
    rim.position.set(c[3] - 5, 5, c[5] - 7); rim.target.position.set(c[3], 1, c[5]); rim.target.updateMatrixWorld();
    sun.position.x = -20 + c[0] * 0.25;
    comp.render();
  };
}
