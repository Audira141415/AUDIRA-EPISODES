// EP02 PROSES MPR 60 HARI (DATAPHYSICAL): one long walnut table in a cool archive room. A 60-mark brass ruler runs
// along the table; teal acrylic date blocks (12 NOV, 25 NOV, 9 DES) rise behind their marks; a machined cursor slides
// along the days. On the right end stands a semicircular MPR chamber model of small aluminium chairs (DPR block + DPD
// block) facing a walnut podium with two name slots. In front: the impeachment route (3 gates) vs the replacement route
// (2 stops), four party blocks that hand their choice to one PRESIDEN plaque, and a 2024-2029 term bar.
// Illustration only: no faces, no emblems, no logos. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, envStrips } from "./lib3d.js";

const P = { slate: "#181B21", wall: "#24272E", walnut: "#2A1B14", brass: "#D2B07A", alu: "#C8CCD1", teal: "#9FD3D6",
  orange: "#D4521C", navy: "#1F3A5F", hud: "#ECEFF4", amber: "#FFBE55", ink: "#3A2810" };
const SERIF = "Georgia,'Times New Roman',serif", MONO = "Consolas,'Courier New',monospace", SANS = "'Segoe UI',Arial,sans-serif";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// APPLE_STUDIO_CLEAN in display space: one clean grade, no tint. S-curve 0.15, vignette 0.06, grain 0.004, no aberration,
// soft ceiling under 250/255 so specular highlights never clip, a small black lift so the archive shelves never crush.
const Grade = { uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1080, 1920) }, uT: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uT;varying vec2 vUv;
  float hsh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
   vec3 s=c*c*(3.0-2.0*c);c=mix(c,s,0.15);
   vec2 q=vUv-0.5;q.x*=0.5625;c*=1.0-0.06*smoothstep(0.18,0.62,length(q)*1.5);
   c+=(hsh(floor(vUv*uRes)+floor(uT*30.0)*7.31)-0.5)*0.008;
   vec3 k=vec3(0.955);c=min(c,k+(c-k)*0.25);c=0.028+c*0.95;c=min(c,vec3(0.972));
   gl_FragColor=vec4(max(c,vec3(0.0)),1.0);}` };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x181b21, fog: 0.0105, exp: 1, bloom: [0.12, 0.3, 0.92], fov: 32 });
  r.toneMapping = THREE.ACESFilmicToneMapping;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gr = new ShaderPass(Grade); comp.addPass(gr);
  envStrips(r, scene, [[8, 3, 0xfff4e6, 1.2, -6, 9, 6], [3, 8, 0xcfe4ff, 0.9, 9, 4, 2], [12, 2, 0x90caf9, 0.6, 0, 2, -9], [4, 4, 0xffd8a8, 0.7, -8, 3, -6]], 0x14171c);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const rnd = mulberry(2602);

  // ---------- lights: neutral 4200K key that follows the subject, strong cool blue fill, rim ----------
  const hemi = new THREE.HemisphereLight(0xdde7f3, 0x2a1b14, 0.7); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe6cc, 2.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 160 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x90caf9, 1.6); scene.add(fill, fill.target);
  // cool archive wash on the back shelves (blue from the left, a faint violet from the right) so the BG layer reads in colour
  // cool skylight pools on the walnut (blue-violet, as from high archive windows): the cold note of this episode
  for (const [px, pz] of [[-14, 4], [2, 6], [16, 8], [30, 6]]) { const sp = new THREE.SpotLight(0x8a90ee, 620, 60, 0.42, 0.9, 1.5); sp.position.set(px + 6, 26, pz + 8); sp.target.position.set(px, 0, pz); scene.add(sp, sp.target); }
  for (const [sx, col, inten] of [[-10, 0x5d8fd6, 700], [22, 0x8a7ad6, 560]]) { const sp = new THREE.SpotLight(col, inten, 70, 0.75, 0.6, 1.6); sp.position.set(sx, 18, -4); sp.target.position.set(sx + 4, 2, -21); scene.add(sp, sp.target); }
  const rim = new THREE.DirectionalLight(0xd8e6ff, 0.9); scene.add(rim, rim.target);

  // ---------- helpers ----------
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const mesh = (geo, m, x = 0, y = 0, z = 0, p = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
  // rounded box (extruded rounded rect with bevel) so every edge catches a highlight line
  const rbox = (w, h, d, rr = 0.06, seg = 3) => {
    rr = Math.min(rr, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const s = new THREE.Shape(), x = -w / 2 + rr, y = -h / 2 + rr, W = w - 2 * rr, H = h - 2 * rr;
    s.moveTo(x, y); s.lineTo(x + W, y); s.lineTo(x + W, y + H); s.lineTo(x, y + H); s.lineTo(x, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * rr), bevelEnabled: true, bevelThickness: rr, bevelSize: rr, bevelSegments: seg, curveSegments: 4 });
    g.translate(0, 0, -(d - 2 * rr) / 2); return g;
  };
  const brassM = () => new THREE.MeshStandardMaterial({ color: P.brass, metalness: 0.85, roughness: 0.24 });
  const aluM = (em = 0.04) => new THREE.MeshStandardMaterial({ color: P.alu, metalness: 0.18, roughness: 0.28, emissive: 0x9fb4c8, emissiveIntensity: em });
  const acrylM = (op = 0.45) => new THREE.MeshPhysicalMaterial({ color: P.teal, transparent: true, opacity: op, roughness: 0.08, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08, depthWrite: false, emissive: P.teal, emissiveIntensity: 0.08 });
  const txt = (w, h, draw) => canvasTex(w, h, draw);
  // engraved face on a brass plate: brass base colour, ink letters, a light brushed texture
  const brushed = (g, w, h, base, R) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < h * 1.4; i++) { g.fillStyle = R() > 0.5 ? "rgba(255,240,210,.05)" : "rgba(60,40,10,.05)"; g.fillRect(0, R() * h, w, 1 + R() * 1.5); } };
  const face = (w, h, tex, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, metalness: o.metal ?? 0.7, roughness: o.rough ?? 0.3, transparent: !!o.transparent, emissive: o.em ?? 0x000000, emissiveMap: o.em ? tex : null, emissiveIntensity: o.emI ?? 0 })); m.receiveShadow = true; return m; };

  // ---------- textures ----------
  const walnutT = canvasTex(2048, 1024, (g, w, h) => {
    const R = mulberry(77); g.fillStyle = "#3a2619"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1100; i++) { const y0 = R() * h, a = 0.02 + R() * 0.07; g.strokeStyle = R() > 0.45 ? `rgba(20,10,5,${a + 0.04})` : `rgba(120,78,46,${a})`; g.lineWidth = 0.8 + R() * 3.2; g.beginPath();
      const ph = R() * 6, amp = 2 + R() * 8; for (let x = 0; x <= w; x += 32) g.lineTo(x, y0 + Math.sin(x * 0.004 + ph) * amp + Math.sin(x * 0.019 + ph * 2) * amp * 0.25); g.stroke(); }
    for (let k = 0; k < 7; k++) { const cx = R() * w, cy = R() * h; for (let j = 0; j < 9; j++) { g.strokeStyle = `rgba(24,12,6,${0.08 + j * 0.01})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, 30 + j * 12, 8 + j * 4, 0, 0, 7); g.stroke(); } }
  }, [3, 1.6]);
  const walnutM = (rough = 0.5) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: walnutT, roughness: rough, metalness: 0.05, clearcoat: 0.14, clearcoatRoughness: 0.45 });

  // ---------- room: slate floor, wood-panel wall, blurred archive shelves, banker's lamps ----------
  const floor = mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.38, metalness: 0.3 }), 0, -10, 0); floor.rotation.x = -Math.PI / 2;
  const wallT = canvasTex(1024, 512, (g, w, h) => { const R = mulberry(5); g.fillStyle = P.wall; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 128) { g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x, 0, 6, h); g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(x + 6, 0, 3, h); }
    for (let i = 0; i < 500; i++) { g.strokeStyle = `rgba(${R() > 0.5 ? "60,52,48" : "12,12,14"},${0.05 + R() * 0.06})`; g.beginPath(); const x = R() * w; g.moveTo(x, 0); g.lineTo(x + (R() - 0.5) * 6, h); g.stroke(); }
    g.fillStyle = "rgba(210,176,122,.35)"; g.fillRect(0, h * 0.18, w, 5); }, [10, 1]);
  const wall = mesh(new THREE.PlaneGeometry(220, 60), new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.75, metalness: 0.05 }), 6, 14, -24);
  // archive shelves: uprights, boards and instanced binders/boxes (fog softens them into a BG layer)
  const shelfM = new THREE.MeshStandardMaterial({ color: 0x2b2f37, roughness: 0.6, metalness: 0.3 });
  const binderGeo = new THREE.BoxGeometry(1, 1, 1);
  const NB = 900; const binders = new THREE.InstancedMesh(binderGeo, new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.05 }), NB); binders.castShadow = false; binders.receiveShadow = true;
  {
    const cols = [0x1f3a5f, 0x2c6e9e, 0x3f8f8a, 0x2f7a4a, 0x7a8a2e, 0xc2a03a, 0xb8642e, 0x8e2f3a, 0x6a3d7e, 0x9a4a7a, 0xd8cfb8, 0x6b7480, 0x4a8fc0, 0x5e9e5a];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), c = new THREE.Color();
    let n = 0; const R = mulberry(31);
    for (let u = 0; u < 13; u++) {
      const x0 = -38 + u * 7.4;
      for (const sx of [0, 7]) mesh(new THREE.BoxGeometry(0.3, 30, 3), shelfM, x0 + sx - 0.15, 3, -20.5);
      for (let lv = 0; lv < 6; lv++) {
        const y = -10 + lv * 4.6; mesh(new THREE.BoxGeometry(7, 0.25, 3), shelfM, x0 + 3.5, y, -20.5);
        let x = x0 + 0.3;
        while (x < x0 + 6.6 && n < NB) { const bw = 0.35 + R() * 0.55, bh = 2.4 + R() * 1.6; if (R() < 0.08) { x += 0.6; continue; }
          v.set(x + bw / 2, y + 0.12 + bh / 2, -20.4 + (R() - 0.5) * 0.3); q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), R() < 0.1 ? 0.16 : 0); s.set(bw * 0.95, bh, 2.2);
          m4.compose(v, q, s); binders.setMatrixAt(n, m4); binders.setColorAt(n, c.set(cols[Math.floor(R() * cols.length)])); n++; x += bw; }
      }
    }
    binders.count = n; scene.add(binders);
  }
  // banker's lamps (brass, green glass shade) on the back of the table: warm pools on the wall and tabletop
  const lamps = [];
  const shadeM = new THREE.MeshPhysicalMaterial({ color: 0x1f6a4a, roughness: 0.15, metalness: 0.1, clearcoat: 1, emissive: 0x2f8a5c, emissiveIntensity: 0.25 });
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xa88a60 });
  for (const [lx, lz] of [[-15, -10.5], [0, -10.5], [31, -10.5]]) {
    const g = G(lx, 0, lz);
    mesh(new THREE.CylinderGeometry(0.9, 1.05, 0.25, 32), brassM(), 0, 0.12, 0, g);
    mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 12), brassM(), 0, 1.5, 0, g);
    const sh = mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.2, 32, 1, true, 0, Math.PI), shadeM, 0, 2.9, 0.25, g); sh.rotation.z = Math.PI / 2; sh.rotation.y = 0; sh.material.side = THREE.DoubleSide;
    const bulb = mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 12), bulbM, 0, 2.55, 0.25, g); bulb.rotation.z = Math.PI / 2; bulb.castShadow = false;
    const pl = new THREE.PointLight(0xffc98a, 7, 22, 1.4); pl.position.set(lx, 2.3, lz + 0.6); scene.add(pl);
    lamps.push(g);
  }

  // ---------- the long walnut table ----------
  const TX0 = -24, TX1 = 37, TZ0 = -12, TZ1 = 26;
  const table = mesh(rbox(TX1 - TX0, 1.2, TZ1 - TZ0, 0.18), walnutM(), (TX0 + TX1) / 2, -0.6, (TZ0 + TZ1) / 2);
  table.rotation.x = 0; // extrude depth is z; fine for a slab
  // table top UV: planar projection so the walnut grain runs along x
  { const g = table.geometry, p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 30) / 20, (p.getZ(i) + 14) / 9 + p.getY(i) * 0.3); uv.needsUpdate = true; }
  table.material.map = walnutT.clone(); table.material.map.wrapS = table.material.map.wrapT = THREE.RepeatWrapping; table.material.map.repeat.set(1, 1); table.material.map.needsUpdate = true;
  // brass inlay along the front edge
  mesh(new THREE.BoxGeometry(TX1 - TX0 - 0.6, 0.05, 0.16), brassM(), (TX0 + TX1) / 2, 0.01, TZ1 - 0.5);
  // legs (only seen in the widest frames)
  for (const lx of [TX0 + 2, TX1 - 2]) for (const lz of [TZ0 + 2, TZ1 - 2]) mesh(new THREE.BoxGeometry(1.4, 11, 1.4), walnutM(0.5), lx, -6.7, lz);
  // FG props: archive folder stacks at the front corners
  const folderCols = [0xb9a77e, 0x1f3a5f, 0xd8cfb8, 0x6b7480, 0x3f6f73];
  for (const [fx, fz, n0] of [[-20, 13.5, 7], [-17.6, 15.4, 4], [33.6, 5.2, 6]]) for (let i = 0; i < n0; i++) {
    const m = mesh(new THREE.BoxGeometry(3.2, 0.22, 2.3), new THREE.MeshStandardMaterial({ color: folderCols[(i + Math.round(fx)) % 5 < 0 ? 0 : (i + Math.abs(Math.round(fx))) % 5], roughness: 0.8 }), fx + Math.sin(i * 2.1) * 0.15, 0.11 + i * 0.23, fz + Math.cos(i * 1.7) * 0.12);
    m.rotation.y = Math.sin(i * 1.3) * 0.08;
  }

  // =============== RULER: 60 engraved day marks, AUDIRA engraved at the right end ===============
  const RX0 = -12, DS = 0.4, RA = -12.8, RB = 14.6, RW = 1.8, RT = 0.28, RL = RB - RA;
  const dayX = (d) => RX0 + d * DS;
  const ruler = G(0, 0, 0);
  mesh(rbox(RL, RT, RW, 0.05), brassM(), (RA + RB) / 2, RT / 2, 0, ruler);
  const rulerT = canvasTex(4096, Math.round(4096 * RW / RL), (g, w, h) => {
    const R = mulberry(9); brushed(g, w, h, "#ffffff", R);
    const X = (x) => (x - RA) / RL * w;
    g.strokeStyle = "rgba(58,40,16,.9)"; g.fillStyle = "rgba(58,40,16,.92)";
    g.lineWidth = 3; g.beginPath(); g.moveTo(X(RX0), h * 0.06); g.lineTo(X(dayX(60)), h * 0.06); g.stroke();
    for (let d = 0; d <= 60; d++) { const x = X(dayX(d)), L = d % 10 === 0 ? 0.5 : d % 5 === 0 ? 0.36 : 0.22; g.lineWidth = d % 5 === 0 ? 5 : 3; g.beginPath(); g.moveTo(x, h * 0.06); g.lineTo(x, h * (0.06 + L)); g.stroke(); }
    g.font = `700 54px ${MONO}`; g.textAlign = "center"; g.textBaseline = "top";
    for (let d = 0; d <= 60; d += 10) g.fillText(String(d), X(dayX(d)), h * 0.6);
    g.textAlign = "left"; g.font = `700 34px ${MONO}`; g.fillText("HARI", X(RA) + 14, h * 0.62);
    // AUDIRA engraved on the right end plate
    const ax = X(12.75), bx = X(RB - 0.15); g.lineWidth = 3; g.strokeRect(ax, h * 0.14, bx - ax, h * 0.72);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 64px ${SERIF}`; g.fillText("AUDIRA", (ax + bx) / 2, h * 0.43);
    g.font = `700 26px ${MONO}`; g.fillText("PASAL 8 (2)", (ax + bx) / 2, h * 0.7);
  });
  const rulerTop = new THREE.Mesh(new THREE.PlaneGeometry(RL - 0.1, RW - 0.1), new THREE.MeshStandardMaterial({ color: P.brass, map: rulerT, bumpMap: rulerT, bumpScale: 1.5, metalness: 0.85, roughness: 0.26 }));
  rulerTop.rotation.x = -Math.PI / 2; rulerTop.position.set((RA + RB) / 2, RT + 0.004, 0); rulerTop.receiveShadow = true; ruler.add(rulerTop);
  // progress inlay (orange while the schedule is spoken, teal later) on the front strip of the ruler
  const inlayM = new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0.9, roughness: 0.4 });
  const inlayGeo = new THREE.BoxGeometry(1, 0.035, 0.2); inlayGeo.translate(0.5, 0, 0);
  const inlay = mesh(inlayGeo, inlayM, dayX(0), RT + 0.02, 0.58, ruler); inlay.castShadow = false;
  // the "60" mark: glowing tick + an upright engraved tab on a brass post
  const tick60M = new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0 });
  mesh(new THREE.BoxGeometry(0.07, 0.03, 0.95), tick60M, dayX(60), RT + 0.02, -0.38, ruler).castShadow = false;
  const tab = G(dayX(60), RT, -0.62, ruler);
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 12), brassM(), 0, 0.55, 0, tab);
  const tabRing = mesh(rbox(1.42, 1.06, 0.1, 0.08), new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0, roughness: 0.4 }), 0, 1.62, -0.04, tab);
  mesh(rbox(1.3, 0.94, 0.12, 0.07), brassM(), 0, 1.62, 0, tab);
  const t60 = canvasTex(512, 370, (g, w, h) => { const R = mulberry(3); brushed(g, w, h, "#D9BA86", R); g.fillStyle = P.navy; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 230px ${MONO}`; g.fillText("60", w / 2, h * 0.44); g.font = `700 52px ${MONO}`; g.fillText("HARI", w / 2, h * 0.87); });
  const tabFace = face(1.2, 0.86, t60, { metal: 0.6, rough: 0.3 }); tabFace.position.set(0, 1.62, 0.065); tab.add(tabFace);
  // machined cursor that slides to the current day
  const cursor = G(dayX(0), 0, 0, ruler);
  { const cm = aluM(0.06);
    mesh(rbox(0.7, 0.22, RW + 0.5, 0.05), cm, 0, RT + 0.11, 0, cursor);
    for (const s of [-1, 1]) mesh(rbox(0.7, 0.5, 0.16, 0.04), cm, 0, 0.25, s * (RW / 2 + 0.17), cursor);
    mesh(new THREE.BoxGeometry(0.04, 0.02, RW + 0.3), new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0.8 }), 0, RT + 0.23, 0, cursor); }

  // =============== DATE BLOCKS: teal acrylic with engraved dates, brass feet, leader to the mark ===============
  const dateBlock = (big, small, d) => {
    const g = G(dayX(d), 0, -2.1);
    mesh(rbox(2.5, 0.22, 1.0, 0.06), brassM(), 0, 0.11, 0, g);
    const blk = mesh(rbox(2.2, 2.7, 0.7, 0.12), acrylM(0.42), 0, 0.22 + 1.35, 0, g); blk.castShadow = false;
    const tx = txt(512, 628, (q, w, h) => { q.clearRect(0, 0, w, h); q.fillStyle = "#E6F3F4"; q.strokeStyle = "rgba(20,40,60,.55)"; q.lineWidth = 6; q.textAlign = "center"; q.textBaseline = "middle";
      q.font = `700 300px ${MONO}`; q.strokeText(big, w / 2, h * 0.38); q.fillText(big, w / 2, h * 0.38); q.font = `700 130px ${MONO}`; q.strokeText(small, w / 2, h * 0.8); q.fillText(small, w / 2, h * 0.8); });
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.45), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, color: 0xd8e8ea }));
    fm.position.set(0, 0.22 + 1.35, 0.36); fm.renderOrder = 3; g.add(fm);
    const inner = mesh(rbox(1.9, 2.4, 0.3, 0.08), new THREE.MeshStandardMaterial({ color: P.teal, emissive: P.teal, emissiveIntensity: 0.0, transparent: true, opacity: 0.25, depthWrite: false }), 0, 1.57, -0.05, g); inner.castShadow = false;
    mesh(new THREE.BoxGeometry(0.06, 0.03, 0.85), brassM(), 0, 0.02, 0.85 + 0.0, g);
    return { g, inner, fm };
  };
  const blocks = [dateBlock("12", "NOV", 0), dateBlock("25", "NOV", 13), dateBlock("9", "DES", 27)];

  // =============== PASAL 8 AYAT 2 plate on a walnut lectern (left end) ===============
  const pasal = G(-18.2, 0, -0.6);
  { const prof = new THREE.Shape(); prof.moveTo(-1.6, 0); prof.lineTo(1.6, 0); prof.lineTo(1.6, 0.6); prof.lineTo(-1.6, 2.0); prof.lineTo(-1.6, 0);
    const lect = mesh(new THREE.ExtrudeGeometry(prof, { depth: 4.6, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }), walnutM(0.4), 2.3, 0, 0, pasal); lect.rotation.y = -Math.PI / 2; }
  const plate = G(0, 1.4, 0, pasal); plate.rotation.x = Math.atan2(1.4, 3.2);
  mesh(rbox(4.9, 0.14, 3.3, 0.06), brassM(), 0, 0.07, 0, plate);
  const pasalT = canvasTex(1024, 690, (g, w, h) => { const R = mulberry(13); brushed(g, w, h, "#D7B883", R);
    g.strokeStyle = P.navy; g.lineWidth = 8; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 2; g.strokeRect(42, 42, w - 84, h - 84);
    g.fillStyle = P.navy; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 54px ${SERIF}`; g.fillText("UUD 1945", w / 2, 112);
    g.font = `700 150px ${SERIF}`; g.fillText("PASAL 8", w / 2, 255);
    g.font = `700 104px ${SERIF}`; g.fillText("AYAT (2)", w / 2, 395);
    g.fillStyle = "rgba(31,58,95,.55)"; for (let i = 0; i < 4; i++) g.fillRect(150, 490 + i * 34, (w - 300) * (i === 3 ? 0.55 : 1), 10); });
  const pasalFace = face(4.7, 3.15, pasalT, { metal: 0.65, rough: 0.28 }); pasalFace.rotation.x = -Math.PI / 2; pasalFace.position.y = 0.146; plate.add(pasalFace);

  // =============== BALLOT BOX struck out by a TANPA PEMILU placard ===============
  const ballot = G(-14.4, 0, 3.2);
  { const bx = mesh(rbox(2.0, 2.2, 2.0, 0.1), acrylM(0.35), 0, 1.1, 0, ballot); bx.castShadow = false;
    mesh(rbox(2.15, 0.14, 2.15, 0.05), aluM(0.05), 0, 2.27, 0, ballot);
    mesh(new THREE.BoxGeometry(1.0, 0.03, 0.14), new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.9 }), 0, 2.35, 0, ballot);
    const pm = new THREE.MeshStandardMaterial({ color: 0xe6e9ee, roughness: 0.85, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) { const pp = mesh(new THREE.PlaneGeometry(0.9, 0.62), pm, -0.4 + (i % 3) * 0.4, 0.2 + i * 0.1, -0.4 + ((i * 5) % 3) * 0.3, ballot); pp.rotation.set(-Math.PI / 2 + 0.3 * Math.sin(i * 2), i * 0.9, 0.2 * Math.cos(i)); } }
  const placard = G(0, 0, 1.35, ballot);
  { mesh(rbox(2.7, 0.75, 0.1, 0.04), aluM(0.05), 0, 0, 0, placard);
    const pt = canvasTex(1024, 284, (g, w, h) => { const R = mulberry(17); brushed(g, w, h, "#C9CED4", R); g.fillStyle = P.navy; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 150px ${MONO}`; g.fillText("TANPA PEMILU", w / 2, h * 0.53); });
    const pf = face(2.62, 0.7, pt, { metal: 0.2, rough: 0.35 }); pf.position.z = 0.056; placard.add(pf); }
  const strikeGeo = new THREE.BoxGeometry(1, 0.16, 0.06); strikeGeo.translate(0.5, 0, 0);
  const strike = mesh(strikeGeo, new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0.6, roughness: 0.4 }), -1.25, 0.35, 1.08, ballot); strike.rotation.z = 0.62; strike.castShadow = false;

  // =============== MPR CHAMBER MODEL: stepped half-ring tiers, aluminium chairs (DPR big block, DPD small block) ===============
  const CX = 23.5, CZ = -1.6, NT = 6, R0 = 2.3, STEP = 0.66;
  const tierM = new THREE.MeshStandardMaterial({ color: 0x3b4049, roughness: 0.55, metalness: 0.25 });
  const nosingM = brassM();
  for (let i = 0; i < NT; i++) {
    const ri = R0 + i * STEP - 0.3, ro = ri + STEP, hgt = 0.16 * (i + 1);
    const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI, false); s.lineTo(-ri, 0); s.absarc(0, 0, ri, Math.PI, 0, true); s.lineTo(ro, 0);
    const ex = mesh(new THREE.ExtrudeGeometry(s, { depth: hgt, bevelEnabled: false, curveSegments: 48 }), tierM, CX, 0, CZ); ex.rotation.x = -Math.PI / 2;
    const ns = mesh(new THREE.TorusGeometry(ri, 0.03, 6, 64, Math.PI), nosingM, CX, hgt, CZ); ns.rotation.x = -Math.PI / 2;
  }
  const chairBlocks = [];
  const mkChairs = (a0, a1, emCol) => {
    const list = [];
    for (let i = 0; i < NT; i++) { const rm = R0 + i * STEP, n = Math.floor((a1 - a0) * rm / 0.42); for (let j = 0; j < n; j++) { const a = a0 + (j + 0.5) / n * (a1 - a0); list.push({ a, rm, y: 0.16 * (i + 1), row: i }); } }
    const m = new THREE.MeshStandardMaterial({ color: P.alu, metalness: 0.18, roughness: 0.3, emissive: emCol, emissiveIntensity: 0.03 });
    const seat = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.05, 0.27), m, list.length);
    const backG = new THREE.BoxGeometry(0.3, 0.28, 0.04); backG.translate(0, 0.19, -0.12);
    const bk = new THREE.InstancedMesh(backG, m, list.length);
    const postG = new THREE.CylinderGeometry(0.025, 0.04, 0.12, 8); postG.translate(0, -0.08, 0);
    const post = new THREE.InstancedMesh(postG, m, list.length);
    for (const im of [seat, bk, post]) { im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); }
    const B = { list, m, ims: [seat, bk, post] }; chairBlocks.push(B); return B;
  };
  const DPR = mkChairs(Math.PI * 0.3, Math.PI, P.teal), DPD = mkChairs(0, Math.PI * 0.25, 0xcfe4ff);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), v4 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const placeChairs = (B, t, tOn) => {
    B.list.forEach((c, k) => {
      const delay = (1 - c.a / Math.PI) * 0.9 + c.row * 0.05;
      const pop = tOn === null ? 0 : Math.sin(Math.PI * clamp01((t - tOn - delay) / 0.45));
      const x = CX + c.rm * Math.cos(c.a), z = CZ - c.rm * Math.sin(c.a);
      q4.setFromAxisAngle(up, Math.atan2(-Math.cos(c.a), Math.sin(c.a)));
      v4.set(x, c.y + 0.14 + 0.18 * pop, z); s4.setScalar(1);
      m4.compose(v4, q4, s4); for (const im of B.ims) im.setMatrixAt(k, m4);
    });
    for (const im of B.ims) im.instanceMatrix.needsUpdate = true;
  };
  // block plaques on the floor in front of each block
  const floorPlaque = (label, x, z, w = 1.5, rotY = 0, par = scene) => { const g = G(x, 0, z, par); g.rotation.y = rotY; mesh(rbox(w, 0.08, 0.6, 0.03), brassM(), 0, 0.04, 0, g);
    const tx = canvasTex(512, Math.round(512 * 0.56 / (w - 0.06)), (q, W, H) => { const R = mulberry(label.length * 7); brushed(q, W, H, "#D7B883", R); q.fillStyle = P.navy; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 ${Math.round(H * 0.72)}px ${MONO}`; q.fillText(label, W / 2, H * 0.55); });
    const f = face(w - 0.06, 0.54, tx, { metal: 0.6, rough: 0.3 }); f.rotation.x = -Math.PI / 2; f.position.y = 0.082; g.add(f); return g; };
  floorPlaque("DPR", CX + 1.0 * Math.cos(Math.PI * 0.68) - 0.3, CZ + 0.35, 1.5);
  floorPlaque("DPD", CX + 1.75, CZ + 0.35, 1.5);
  // podium with the MPR plate and two name slots
  const pod = G(CX, 0, CZ + 1.15);
  mesh(rbox(2.4, 1.05, 1.0, 0.08), walnutM(0.4), 0, 0.525, 0, pod);
  mesh(rbox(2.6, 0.08, 1.15, 0.03), brassM(), 0, 1.09, 0, pod);
  { const mt = canvasTex(512, 160, (q, w, h) => { const R = mulberry(41); brushed(q, w, h, "#D7B883", R); q.fillStyle = P.navy; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 120px ${SERIF}`; q.fillText("MPR", w / 2, h * 0.56); });
    const f = face(1.4, 0.44, mt, { metal: 0.6, rough: 0.3 }); f.position.set(0, 0.55, 0.505); pod.add(f); mesh(rbox(1.5, 0.52, 0.03, 0.01), brassM(), 0, 0.55, 0.49, pod); }
  const nameTex = canvasTex(512, 390, (q, w, h) => { q.fillStyle = "#e9edf1"; q.fillRect(0, 0, w, h); q.fillStyle = P.navy; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 110px ${MONO}`; q.fillText("NAMA", w / 2, h * 0.36); q.fillStyle = "rgba(31,58,95,.5)"; q.fillRect(70, h * 0.68, w - 140, 12); });
  const slots = [-0.62, 0.62].map((sx) => {
    const g = G(sx, 1.13, 0.05, pod);
    const frameM = new THREE.MeshStandardMaterial({ color: P.alu, metalness: 0.18, roughness: 0.3, emissive: P.orange, emissiveIntensity: 0 });
    mesh(rbox(1.0, 0.78, 0.14, 0.04), frameM, 0, 0.39, 0, g);
    const fm = new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.5, emissive: 0xffffff, emissiveMap: nameTex, emissiveIntensity: 0.05 });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.66), fm); f.position.set(0, 0.39, 0.075); g.add(f);
    return { g, frameM, fm, x: sx };
  });

  // =============== TWO ROUTES on the front of the table (impeachment: 3 gates; replacement: 2 stops) ===============
  // routes run front-to-back toward the chamber: built in a group turned 90 deg, so local +x = world -z, local z = world x
  const routesG = G(0, 0, 0); routesG.rotation.y = Math.PI / 2;
  const LZ = 6.0, SZ = 11.0, LX0 = -13.0, LX1 = -4.0, GX = [-11.0, -8.6, -6.2], SX0 = -12.8, SX1 = -4.8;
  const railGeo = new THREE.BoxGeometry(1, 0.06, 0.16); railGeo.translate(0.5, 0, 0);
  const longRailM = new THREE.MeshStandardMaterial({ color: P.brass, metalness: 0.85, roughness: 0.26, emissive: P.amber, emissiveIntensity: 0 });
  const longRail = mesh(railGeo, longRailM, LX0, 0.03, LZ, routesG); longRail.castShadow = false;
  const shortRailM = new THREE.MeshStandardMaterial({ color: P.brass, metalness: 0.6, roughness: 0.3, emissive: P.orange, emissiveIntensity: 0 });
  const shortRail = mesh(railGeo, shortRailM, SX0, 0.03, SZ, routesG); shortRail.castShadow = false;
  // gate: acrylic slab with an arch cut, standing across the long rail
  const gateShape = (() => { const s = new THREE.Shape(); s.moveTo(-1.1, 0); s.lineTo(1.1, 0); s.lineTo(1.1, 2.2); s.lineTo(-1.1, 2.2); s.lineTo(-1.1, 0);
    const hole = new THREE.Path(); hole.moveTo(-0.5, 0.0001); hole.lineTo(0.5, 0.0001); hole.lineTo(0.5, 1.1); hole.absarc(0, 1.1, 0.5, 0, Math.PI, false); hole.lineTo(-0.5, 0.0001); s.holes.push(hole); return s; })();
  const gateGeo = new THREE.ExtrudeGeometry(gateShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 20 }); gateGeo.translate(0, 0, -0.15);
  const gates = GX.map((gx, i) => {
    const g = G(gx, 0, LZ, routesG);
    const gm = acrylM(0.5); const gt = mesh(gateGeo, gm, 0, 0, 0, g); gt.rotation.y = Math.PI / 2; gt.castShadow = false;
    const lbl = floorPlaque(["DPR", "MK", "MPR"][i], gx, LZ - 1.9, 1.5, -Math.PI / 2, routesG);
    return { g, gm, lbl };
  });
  const standPlaque = (label, x, z, w) => { const g = G(x, 0, z, routesG); g.rotation.y = -Math.PI / 2; mesh(rbox(w, 1.0, 0.6, 0.07), walnutM(0.4), 0, 0.5, 0, g);
    const m = new THREE.MeshStandardMaterial({ color: P.brass, metalness: 0.8, roughness: 0.28, emissive: P.orange, emissiveIntensity: 0 });
    mesh(rbox(w - 0.2, 0.7, 0.06, 0.02), m, 0, 0.5, 0.31, g);
    const tx = canvasTex(1024, Math.round(1024 * 0.6 / (w - 0.34)), (q, W, H) => { q.clearRect(0, 0, W, H); q.fillStyle = P.navy; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 ${Math.round(H * 0.62)}px ${SERIF}`; q.fillText(label, W / 2, H * 0.56); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.34, 0.6), new THREE.MeshStandardMaterial({ map: tx, transparent: true, metalness: 0.3, roughness: 0.4 })); f.position.set(0, 0.5, 0.345); g.add(f);
    return { g, m }; };
  const presP = standPlaque("PRESIDEN", SX0 - 0.9, SZ, 3.4);
  const mprP = standPlaque("MPR", SX1 + 0.6, SZ, 2.0);
  const puckM = aluM(0.1);
  const puckL = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 32), puckM, LX0, 0.12, LZ, routesG);
  const puckS = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 32), new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0.5, roughness: 0.35 }), SX0, 0.12, SZ, routesG);

  // =============== FOUR PARTY BLOCKS (text only) that hand the choice to the PRESIDEN plaque ===============
  const parties = ["PAN", "DEMOKRAT", "PKS", "GOLKAR"].map((nm, i) => {
    const g = G(0, 0, 0);
    mesh(rbox(2.0, 0.8, 0.55, 0.07), aluM(0.05), 0, 0.4, 0, g);
    const tx = canvasTex(512, 200, (q, w, h) => { q.clearRect(0, 0, w, h); q.fillStyle = P.navy; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 ${nm.length > 4 ? 92 : 120}px ${MONO}`; q.fillText(nm, w / 2, h * 0.55); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 0.72), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.4 })); f.position.set(0, 0.4, 0.28); g.add(f);
    return { g, x: [14.4, 16.6, 14.4, 16.6][i], z: [12.8, 12.8, 14.7, 14.7][i], nm };
  });

  // =============== TERM BAR 2024-2029 (aluminium) at the front edge ===============
  const BZ = 11.0, BX0 = 19.2, BX1 = 36.0, BL = BX1 - BX0;
  const yX = (y) => BX0 + (y - 2024.8) / 5 * BL; const CUT = yX(2026.94);
  const termG = G(0, 0, 0);
  mesh(rbox(BL, 0.5, 0.8, 0.08), aluM(0.03), (BX0 + BX1) / 2, 0.55, BZ, termG);
  for (const fx of [BX0 + 0.8, BX1 - 0.8]) mesh(rbox(0.5, 0.32, 1.0, 0.05), brassM(), fx, 0.16, BZ, termG);
  const termT = canvasTex(4096, 122, (q, w, h) => { q.clearRect(0, 0, w, h); const X = (x) => (x - BX0) / BL * w; q.fillStyle = P.navy; q.strokeStyle = P.navy; q.textBaseline = "middle"; q.font = `700 78px ${MONO}`;
    for (let y = 2025; y <= 2029; y++) { const x = X(yX(y)); q.lineWidth = 6; q.beginPath(); q.moveTo(x, 0); q.lineTo(x, h * 0.3); q.stroke(); q.textAlign = "center"; q.fillText(String(y), Math.min(x, w - 120), h * 0.66); }
    q.textAlign = "left"; q.fillText("2024", 14, h * 0.66); });
  const termFace = new THREE.Mesh(new THREE.PlaneGeometry(BL, 0.48), new THREE.MeshStandardMaterial({ map: termT, transparent: true, roughness: 0.4 })); termFace.position.set((BX0 + BX1) / 2, 0.55, BZ + 0.405); termG.add(termFace);
  const pastGeo = new THREE.BoxGeometry(1, 0.04, 0.7); pastGeo.translate(0.5, 0, 0);
  const pastM = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.6, metalness: 0.2, transparent: true, opacity: 0.85 });
  const past = mesh(pastGeo, pastM, BX0, 0.82, BZ, termG); past.castShadow = false;
  const futM = new THREE.MeshStandardMaterial({ color: P.orange, emissive: P.orange, emissiveIntensity: 0.8, roughness: 0.4 });
  const fut = mesh(pastGeo, futM, CUT, 0.82, BZ, termG); fut.castShadow = false;
  const cutPin = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 10), brassM(), CUT, 1.1, BZ - 0.2, termG);
  // brackets with labels: "5 TAHUN" over the whole bar, "HAMPIR 3 TAHUN" over the rest of the term
  const bracket = (x0, x1, y, label, col) => { const g = G(0, 0, BZ, termG); const m = new THREE.MeshStandardMaterial({ color: col, metalness: 0.7, roughness: 0.3, emissive: col, emissiveIntensity: 0.15, transparent: true, opacity: 1 });
    mesh(new THREE.BoxGeometry(x1 - x0, 0.06, 0.06), m, (x0 + x1) / 2, y, 0, g); for (const x of [x0, x1]) mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), m, x, y - 0.2, 0, g);
    const tx = canvasTex(1024, 200, (q, w, h) => { q.fillStyle = "rgba(24,27,33,.88)"; q.fillRect(0, 0, w, h); q.strokeStyle = col; q.lineWidth = 8; q.strokeRect(4, 4, w - 8, h - 8); q.fillStyle = "#E8ECF1"; q.textAlign = "center"; q.textBaseline = "middle"; q.font = `700 112px ${MONO}`; q.fillText(label, w / 2, h * 0.55); });
    const lm = new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 1, depthWrite: false });
    const l = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.9), lm); l.position.set((x0 + x1) / 2, y + 0.5, 0.3); g.add(l); return { g, m, lm, l }; };
  const br5 = bracket(BX0, BX1, 1.45, "5 TAHUN", "#C8CCD1");
  const br3 = bracket(CUT, BX1, 1.45, "HAMPIR 3 TAHUN", P.orange);

  // ---------- FG: blurred archive folders riding with the camera at the bottom edge (under the caption band) ----------
  const fgT = canvasTex(640, 300, (g, w, h) => {
    const c2 = document.createElement("canvas"); c2.width = w; c2.height = h; const q = c2.getContext("2d"); const R = mulberry(55);
    for (let i = 0; i < 6; i++) { q.fillStyle = ["#b9a77e", "#1f3a5f", "#d8cfb8", "#6b7480", "#3f6f73", "#8a6a45"][i]; q.save(); q.translate(60 + i * 8, 120 + i * 28); q.rotate((R() - 0.5) * 0.06); q.fillRect(0, 0, w * 0.75, 34); q.restore(); }
    g.clearRect(0, 0, w, h); g.filter = "blur(14px)"; g.drawImage(c2, 0, 0); g.filter = "none"; });
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.89), new THREE.MeshBasicMaterial({ map: fgT, transparent: true, depthTest: false, depthWrite: false, opacity: 0 }));
  fg.renderOrder = 10; fg.position.set(-0.55, -2.0, -8); cam.add(fg); scene.add(cam);

  // ---------- camera ----------
  const deg = Math.PI / 180;
  const Pc = (t, x, y, z, dist, el, yaw) => [t, x + dist * Math.sin(yaw * deg) * Math.cos(el * deg), y + dist * Math.sin(el * deg), z + dist * Math.cos(yaw * deg) * Math.cos(el * deg), x, y, z];
  const camT = track([
    Pc(0, 12.5, 1.3, -0.4, 10.5, 17, 38),
    Pc(A("s1:konstitusi"), 10.4, 1.1, -0.2, 13, 20, 44),
    Pc(A("s1:Prosesnya"), 1, 1.4, 0.2, 38, 27, 52),
    Pc(A("s1:pemilu") + 0.2, -14.2, 1.0, 3.6, 17, 22, 32),
    Pc(K.s1e, -15.4, 1.0, 2.6, 18, 22, 14),
    Pc(K.s2 + 0.7, -18.2, 2.2, -0.4, 17, 26, -12),
    Pc(A("s2:skenario"), -18.0, 2.3, -0.4, 15, 24, -4),
    Pc(A("s2:mengusulkan"), -6, 1.0, -0.6, 32, 40, 14),
    Pc(A("s2:dua") - 0.3, 22.8, 1.8, -1.2, 19, 26, 14),
    Pc(A("s2:satu"), 23.4, 1.9, -0.8, 14, 22, 6),
    Pc(K.s2e, 23.2, 1.9, -0.9, 15.5, 25, -2),
    Pc(K.s3 + 0.9, -7, 1.4, -1.0, 30, 32, 30),
    Pc(A("s3:12") + 0.2, -11.4, 2.2, -1.6, 14.5, 16, 24),
    Pc(A("s3:25") + 0.2, -6.8, 2.2, -1.6, 14.5, 16, 20),
    Pc(A("s3:sidang"), -3.0, 2.2, -1.6, 15, 17, 16),
    Pc(K.s4 + 0.4, -1.8, 2.2, -1.6, 15, 17, 12),
    Pc(A("s4:9") + 0.6, -1.2, 2.2, -1.6, 14.5, 17, 8),
    Pc(A("s4:MPR#2"), 22.6, 1.8, -3.4, 26, 32, 6),
    Pc(A("s4:DPR"), 21.4, 1.8, -3.6, 21, 30, -12),
    Pc(A("s4:DPD") + 0.3, 25.4, 1.8, -3.4, 20, 30, 16),
    Pc(A("s4:dilantik"), 23.5, 1.9, -0.6, 11.5, 18, 6),
    Pc(K.s4e, 23.0, 1.8, -0.4, 13, 22, -2),
    Pc(K.s5 + 0.6, 8.4, 0.4, 8.6, 38, 40, -30),
    Pc(A("s5:DPR"), 8.0, 0.4, 8.8, 35, 38, -34),
    Pc(A("s5:MPR"), 8.2, 0.4, 8.2, 35, 40, -28),
    Pc(A("s5:Presiden"), 8.8, 0.4, 8.6, 35, 40, -20),
    Pc(K.s5e, 9.2, 0.4, 8.8, 34, 38, -16),
    Pc(K.s6 + 0.5, 13.4, 0.6, 13.6, 19, 26, 8),
    Pc(A("s6:Prabowo"), 12.6, 0.6, 13.6, 16, 22, 4),
    Pc(A("s6:satu") + 0.2, 11.0, 0.7, 13.7, 11, 16, 0),
    Pc(K.s6e, 11.3, 0.7, 13.7, 12, 18, 6),
    Pc(K.s7 + 0.8, 24, 1.8, BZ, 26, 20, -14),
    Pc(A("s7:2029"), 28.5, 1.9, BZ, 27, 20, 2),
    Pc(A("s7:tiga") + 0.3, 30, 1.9, BZ, 25, 22, 10),
    Pc(K.s7e, 29.5, 1.9, BZ - 0.4, 27, 23, 14),
    Pc(K.s8 + 0.4, 20, 0.5, 2.0, 42, 32, 44),
    Pc(A("s8:Ikuti"), 16, 0.5, 1.0, 54, 33, 48),
    Pc(K.dur, 14.5, 0.5, 0.6, 60, 34, 50),
  ]);

  const tmpC = new THREE.Color(), cOr = new THREE.Color(P.orange), cTe = new THREE.Color(P.teal);
  return function draw(t) {
    gr.uniforms.uT.value = t;
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    key.target.position.set(c[3], 0, c[5]); key.position.set(c[3] - 16, 30, c[5] + 20);
    // fill and rim are placed relative to the view (side lights), so their glossy lobe on the walnut never faces the lens
    const vx = c[3] - c[0], vz = c[5] - c[2], vl = Math.hypot(vx, vz) || 1, dx = vx / vl, dz = vz / vl;
    fill.target.position.set(c[3], 0, c[5]); fill.position.set(c[3] + dz * 28 - dx * 6, 12, c[5] - dx * 28 - dz * 6);
    rim.target.position.set(c[3], 0, c[5]); rim.position.set(c[3] - dz * 24 + dx * 8, 18, c[5] + dx * 24 + dz * 8);

    // ---- s1: the 60 mark glows; the ballot box gets struck out ----
    const g60 = ramp(t, 0, 0.6) * (1 - 0.7 * ramp(t, K.s2, K.s2 + 1));
    tick60M.emissiveIntensity = 1.4 * g60; tabRing.material.emissiveIntensity = 0.9 * g60;
    const pk = back(ramp(t, A("s1:pemilu") - 0.35, A("s1:pemilu") + 0.25), 1.6);
    placard.visible = t > A("s1:pemilu") - 0.4;
    placard.position.y = 0.42 + 3.2 * (1 - pk); placard.rotation.x = -0.18 - 0.4 * (1 - pk);
    const sk = ramp(t, A("s1:pemilu") + 0.1, A("s1:pemilu") + 0.6);
    strike.scale.x = Math.max(0.001, 2.95 * sk); strike.visible = sk > 0;

    // ---- s2: the Pasal plate lifts; two name blocks slide onto the podium; one lights ----
    const lift = ramp(t, A("s2:Pasal") - 0.3, A("s2:Pasal") + 0.6);
    plate.position.y = 1.4 + 0.5 * lift; plate.rotation.x = Math.atan2(1.4, 3.2) + 0.25 * lift;
    slots.forEach((s, i) => {
      const k = eout(ramp(t, A("s2:dua") - 0.2 + i * 0.25, A("s2:nama") + 0.5 + i * 0.25));
      s.g.position.set(s.x, 1.13 + 0.9 * Math.sin(Math.PI * k) * (1 - k), 0.05 + 6.5 * (1 - k)); s.g.visible = k > 0.001 || t > K.s3;
      const lit = i === 0 ? ramp(t, A("s2:satu") - 0.2, A("s2:satu") + 0.3) * (1 - ramp(t, K.s3, K.s3 + 1)) : 0;
      const won = i === 0 ? ramp(t, A("s4:dilantik") - 0.2, A("s4:dilantik") + 0.4) : 0;
      s.fm.emissiveIntensity = 0.05 + 0.5 * lit + 0.2 * won;
      s.frameM.emissiveIntensity = 1.1 * won; s.frameM.emissive.set(won > 0 ? P.orange : P.teal); if (lit > 0 && won <= 0) s.frameM.emissiveIntensity = 0.5 * lit;
      s.g.scale.setScalar(i === 1 ? 1 - 0.12 * won : 1);
    });

    // ---- s3/s4: date blocks rise on their dates; cursor slides along the days; the interval lights ----
    const bt = [A("s3:12"), A("s3:25"), A("s4:9")];
    blocks.forEach((b, i) => { const k = back(ramp(t, bt[i] - 0.35, bt[i] + 0.35), 1.4); b.g.scale.set(1, Math.max(0.001, k), 1); b.g.visible = k > 0.001;
      b.inner.material.emissiveIntensity = 0.6 * Math.max(0, 1 - Math.abs(t - bt[i] - 0.3) / 1.4); });
    const dcur = 13 * ramp(t, A("s3:25") - 0.6, A("s3:25") + 0.4) + 14 * ramp(t, A("s4:9") - 0.6, A("s4:9") + 0.4);
    cursor.position.x = dayX(dcur); cursor.visible = t > A("s3:12") - 0.6;
    cursor.position.y = 1.2 * (1 - eout(ramp(t, A("s3:12") - 0.6, A("s3:12")))) ;
    const inlayD = 13 * ramp(t, A("s3:25") - 0.3, A("s3:25") + 0.9) + 14 * ramp(t, A("s4:9") - 0.3, A("s4:9") + 0.9);
    inlay.scale.x = Math.max(0.001, inlayD * DS); inlay.visible = inlayD > 0.01;
    const ft = ramp(t, K.s5, K.s5 + 1.5);
    tmpC.copy(cOr).lerp(cTe, ft); inlayM.color.copy(tmpC); inlayM.emissive.copy(tmpC); inlayM.emissiveIntensity = 0.9 - 0.5 * ft;

    // ---- s4: chamber blocks light up (DPR, then DPD), everyone votes, one slot turns orange ----
    const tD = A("s4:DPR") - 0.2, tP = A("s4:DPD") - 0.2;
    const vote = Math.sin(Math.PI * clamp01((t - A("s4:memilih") + 0.2) / 0.8));
    DPR.m.emissiveIntensity = 0.03 + 0.45 * ramp(t, tD, tD + 1.0) * (1 - 0.6 * ramp(t, A("s4:dilantik"), A("s4:dilantik") + 1.2)) + 0.25 * vote;
    DPD.m.emissiveIntensity = 0.03 + 0.55 * ramp(t, tP, tP + 1.0) * (1 - 0.6 * ramp(t, A("s4:dilantik"), A("s4:dilantik") + 1.2)) + 0.25 * vote;
    placeChairs(DPR, t, tD); placeChairs(DPD, t, tP);

    // ---- s5: two routes: long rail with 3 gates, short rail straight to MPR ----
    const r5 = ramp(t, A("s5:Pemakzulan") - 0.4, A("s5:lembaga") + 0.2);
    longRail.scale.x = Math.max(0.001, (LX1 - LX0) * r5); longRail.visible = r5 > 0;
    const gk = [A("s5:DPR"), A("s5:Konstitusi"), A("s5:MPR")];
    gates.forEach((g, i) => { const k = back(ramp(t, gk[i] - 0.5, gk[i] + 0.1), 1.5); g.g.scale.set(1, Math.max(0.001, k), 1); g.g.visible = k > 0.001; g.lbl.visible = k > 0.001;
      g.gm.emissiveIntensity = 0.08 + 0.7 * Math.max(0, 1 - Math.abs(t - gk[i] - 0.2) / 0.9); });
    // puck on the long route stops at each gate in turn
    const lx = LX0 + (GX[0] - LX0) * eout(ramp(t, gk[0] - 0.6, gk[0] + 0.2)) + (GX[1] - GX[0]) * eout(ramp(t, gk[1] - 0.6, gk[1] + 0.2)) + (GX[2] - GX[1]) * eout(ramp(t, gk[2] - 0.6, gk[2] + 0.2)) + (LX1 - GX[2]) * eout(ramp(t, A("s5:memutuskan"), A("s5:memutuskan") + 0.8));
    puckL.position.x = lx; puckL.visible = r5 > 0.05;
    const sOn = ramp(t, A("s5:Penggantian") - 0.3, A("s5:wapres") + 0.2);
    shortRail.scale.x = Math.max(0.001, (SX1 - SX0) * sOn); shortRail.visible = sOn > 0;
    const sLit = ramp(t, A("s5:sederhana") - 0.3, A("s5:sederhana") + 0.4);
    const s6on = ramp(t, K.s6 - 0.2, K.s6 + 0.8);
    shortRailM.emissiveIntensity = 0.95 * sLit * (1 - 0.8 * s6on);
    longRailM.emissiveIntensity = 0.12 * r5 * (1 - sLit);
    puckS.position.x = SX0 + (SX1 - SX0) * eout(ramp(t, A("s5:Presiden") - 0.2, A("s5:MPR#2") + 0.2)); puckS.visible = sOn > 0.3;
    presP.g.visible = mprP.g.visible = t > A("s5:Penggantian") - 0.6;
    const pp = back(ramp(t, A("s5:Penggantian") - 0.6, A("s5:Penggantian")), 1.4);
    presP.g.scale.set(1, Math.max(0.001, pp), 1); mprP.g.scale.set(1, Math.max(0.001, pp), 1);
    // s6: other plaques dim while the PRESIDEN plaque takes the four party blocks and turns orange
    const dim = s6on * (1 - ramp(t, K.s7, K.s7 + 1.0));
    gates.forEach((g) => { g.gm.opacity = 0.5 - 0.32 * dim; });
    mprP.m.color.set(P.brass).multiplyScalar(1 - 0.6 * dim);
    longRailM.color.set(P.brass).multiplyScalar(1 - 0.6 * dim);
    const one = ramp(t, A("s6:satu") - 0.3, A("s6:satu") + 0.4);
    const arrive = [0, 1, 2, 3].map((i) => ramp(t, A("s6:Prabowo") - 0.5 + i * 0.22, A("s6:Prabowo") + 0.5 + i * 0.22));
    presP.m.emissiveIntensity = 0.15 * arrive.reduce((a, b) => a + b, 0) / 4 + 0.6 * one * (1 - ramp(t, K.s7 + 0.5, K.s7 + 1.5));
    const pt = [A("s6:PAN"), A("s6:Demokrat"), A("s6:PKS"), A("s6:Golkar")];
    parties.forEach((p, i) => {
      const k = back(ramp(t, pt[i] - 0.35, pt[i] + 0.2), 1.5), a = arrive[i];
      const x = p.x + (SZ - p.x) * eout(a), z = p.z + (14.2 - p.z) * eout(a);
      p.g.position.set(x, 0.6 * Math.sin(Math.PI * a), z);
      const sc = Math.max(0.001, k * (1 - a));
      p.g.scale.set(sc, sc, sc); p.g.visible = k > 0.001 && a < 0.999;
    });

    // ---- s7: term bar rises; the spent part dims, the rest of the term lights orange ----
    const tb = back(ramp(t, K.s7 - 0.5, K.s7 + 0.4), 1.3);
    termG.visible = tb > 0.001; termG.position.y = -1.2 * (1 - tb);
    const pd = ramp(t, A("s7:Masa") - 0.2, A("s7:meneruskan") + 0.2);
    past.scale.x = Math.max(0.001, (CUT - BX0) * pd); past.visible = pd > 0;
    const fu = ramp(t, A("s7:sisa") - 0.2, A("s7:2029") + 0.4);
    fut.scale.x = Math.max(0.001, (BX1 - CUT) * fu); fut.visible = fu > 0;
    cutPin.visible = pd > 0.5;
    const b5 = ramp(t, A("s7:lima") - 0.3, A("s7:lima") + 0.3) * (1 - ramp(t, A("s7:Masa"), A("s7:Masa") + 0.6));
    br5.g.visible = b5 > 0.01; br5.g.scale.set(1, Math.max(0.001, b5), 1); br5.lm.opacity = b5;
    const b3 = ramp(t, A("s7:tiga") - 0.4, A("s7:tiga") + 0.3) * (1 - ramp(t, K.s8 + 0.6, K.s8 + 1.4));
    br3.g.visible = b3 > 0.01; br3.g.scale.set(1, Math.max(0.001, b3), 1); br3.lm.opacity = b3;

    // FG folders only in the low truck shots (s3, s7)
    const fgo = Math.max(ramp(t, K.s3 + 0.6, K.s3 + 1.4) - ramp(t, K.s3e - 0.4, K.s3e + 0.2), ramp(t, K.s7 + 0.4, K.s7 + 1.2) - ramp(t, K.s7e - 0.6, K.s7e));
    fg.material.opacity = 0.9 * fgo; fg.visible = fgo > 0.01;
    bp.strength = 0.12;
    comp.render();
  };
}
