// TRANSFORM BAY: a black product-film studio. One lofted hull morphs through three real shapes: sedan, open frame, race car. Frame plates are rendered from this same scene, so "first frame" and "last frame" are the actual states.
// Fictional, unbadged vehicle. Illustration in code, not output from an AI model.
import * as THREE from "./three.module.js";
import { stage, canvasTex, track, ramp, smooth, mulberry, clamp01, pts, envStrips, std, box, cyl } from "./lib3d.js";

const NS = 48, NV = 34;
const L = 4.6;
// profile tables: top line, belt line, half width, floor height. index = position along the car, front to back
const US = [0, .03, .1, .24, .32, .42, .62, .72, .86, .97, 1];
const SHAPES = [
  { // sedan, three box
    top: [.62, .84, .96, 1.0, 1.05, 1.52, 1.54, 1.1, 1.04, .98, .7], belt: [.62, .82, .94, .98, 1.0, 1.02, 1.03, 1.05, 1.02, .96, .7],
    w: [.56, .76, .82, .84, .85, .85, .85, .85, .83, .74, .55], bot: [.42, .36, .34, .34, .34, .34, .34, .34, .34, .4, .52], cab: [.42, .62, .92, .14], wheelX: [.19, .78], wheelR: .33, wheelW: .24, track: .78,
  },
  { // open frame: hull collapses to a low tub so the chassis shows
    top: [.5, .56, .6, .62, .62, .62, .62, .62, .62, .6, .5], belt: [.5, .54, .58, .6, .6, .6, .6, .6, .6, .58, .5],
    w: [.3, .42, .5, .54, .56, .56, .56, .56, .54, .46, .3], bot: [.38, .34, .3, .3, .3, .3, .3, .3, .3, .34, .4], cab: [.42, .62, .0, .0], wheelX: [.19, .78], wheelR: .36, wheelW: .32, track: .92,
  },
  { // race: wedge with cab-forward canopy
    top: [.2, .32, .5, .68, .88, 1.08, 1.05, .9, .86, .84, .62], belt: [.2, .31, .48, .6, .66, .68, .72, .78, .8, .8, .62],
    w: [.72, .88, .96, 1.0, .94, .88, .92, 1.02, 1.04, .98, .84], bot: [.2, .17, .16, .16, .16, .16, .16, .16, .17, .22, .3], cab: [.26, .66, .92, .14], wheelX: [.18, .8], wheelR: .38, wheelW: .4, track: 1.0,
  },
];
const lerp = (a, b, u) => a + (b - a) * u;
function tab(arr, u) { let i = 0; while (i < US.length - 2 && US[i + 1] < u) i++; const f = smooth((u - US[i]) / (US[i + 1] - US[i])); return lerp(arr[i], arr[i + 1], f); }
const COL = [new THREE.Color(0x6E1F2A), new THREE.Color(0x3A3F46), new THREE.Color(0xE8860C)];

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x050506, fog: .018, exp: 1.02, bloom: [.16, .4, .94], fov: 38 });
  const rnd = mulberry(303);
  envStrips(r, scene, [[3, 26, "#FFFFFF", 9, -13, 8, 3], [3, 26, "#FFEFDC", 7, 13, 8, 2], [26, 2.4, "#FFFFFF", 9, 0, 18, 0], [18, 1.2, "#FFD9B0", 1.2, 0, 1.5, -14]], 0x030304);
  scene.environmentIntensity = 1.25;
  scene.add(new THREE.HemisphereLight(0xD8DCE6, 0x141414, .5));
  const sp = new THREE.SpotLight(0xFFF2E0, 760, 40, .55, .7, 1.6); sp.position.set(-3, 13, 7); sp.target.position.set(0, .4, 0); sp.castShadow = true; sp.shadow.mapSize.set(2048, 2048); sp.shadow.radius = 5; scene.add(sp, sp.target);
  // glossy floor: a clone of the car is drawn mirrored under a translucent plane
  const floor = new THREE.Mesh(new THREE.CircleGeometry(20, 64), new THREE.MeshStandardMaterial({ color: 0x0C0C0F, roughness: .72, metalness: 0, transparent: true, alphaMap: canvasTex(512, 512, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, '#fff'); g.addColorStop(.42, '#fff'); g.addColorStop(.8, '#000'); x.fillStyle = g; x.fillRect(0, 0, w, w); }) }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // a slim light frame on the floor that frames the car and marks the fixed camera idea
  const ring = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.24, 96), new THREE.MeshBasicMaterial({ color: 0xFFB25A, transparent: true, opacity: .55 })); ring.rotation.x = -Math.PI / 2; ring.position.y = .01; scene.add(ring);

  const nVerts = (NS + 1) * NV;
  const pos = new Float32Array(nVerts * 3), col = new Float32Array(nVerts * 3);
  const idx = [];
  for (let i = 0; i < NS; i++) for (let j = 0; j < NV; j++) { const a = i * NV + j, b = i * NV + (j + 1) % NV, c = (i + 1) * NV + j, d = (i + 1) * NV + (j + 1) % NV; idx.push(a, b, c, b, d, c); }
  const hullG = new THREE.BufferGeometry();
  hullG.setAttribute("position", new THREE.BufferAttribute(pos, 3)); hullG.setAttribute("color", new THREE.BufferAttribute(col, 3)); hullG.setIndex(idx);
  const paint = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .24, metalness: .72, clearcoat: 1, clearcoatRoughness: .08, side: THREE.DoubleSide, transparent: true });
  const car = new THREE.Group(); scene.add(car);
  const hull = new THREE.Mesh(hullG, paint); hull.castShadow = true; hull.receiveShadow = true; hull.frustumCulled = false; car.add(hull);
  const wire = new THREE.Mesh(hullG, new THREE.MeshBasicMaterial({ color: 0xFFB25A, wireframe: true, transparent: true, opacity: 0 })); wire.frustumCulled = false; car.add(wire);
  const G0 = new THREE.Color(0x07090C), BK = new THREE.Color(0x020203), TMP = new THREE.Color();
  function writeHull(m) {
    const a = m < 1 ? 0 : 1, b = a + 1, f = m < 1 ? m : m - 1;
    const A = SHAPES[a], B = SHAPES[b];
    const paintC = TMP.copy(COL[a]).lerp(COL[b], f).clone();
    const cA = A.cab, cB = B.cab;
    const wr = lerp(A.wheelR, B.wheelR, f);
    for (let i = 0; i <= NS; i++) {
      const u = i / NS, xx = (u - .5) * L;
      const top = lerp(tab(A.top, u), tab(B.top, u), f), belt = lerp(tab(A.belt, u), tab(B.belt, u), f), w = lerp(tab(A.w, u), tab(B.w, u), f), bot = lerp(tab(A.bot, u), tab(B.bot, u), f);
      const yb = bot, bl = Math.max(yb + .02, belt), yt = Math.max(bl + .01, top);
      for (let j = 0; j < NV; j++) {
        const th = (j / NV) * Math.PI * 2, v = (1 - Math.cos(th)) / 2, sd = th < Math.PI ? 1 : -1;
        const y = yb + (yt - yb) * v;
        let hw;
        if (y <= bl) { const q = clamp01((bl - y) / Math.max(.01, bl - yb)); hw = w * Math.pow(1 - Math.pow(q, 3.2), .5); }
        else { const q = clamp01((y - bl) / Math.max(.01, yt - bl)); hw = w * (1 - .26 * q) * Math.pow(1 - Math.pow(q, 4.5), .5); }
        const k = i * NV + j;
        pos[k * 3] = xx; pos[k * 3 + 1] = y; pos[k * 3 + 2] = sd * hw;
        // paint, glasshouse, wheel arch
        let cr = paintC.r, cg = paintC.g, cb = paintC.b;
        const u0 = lerp(cA[0], cB[0], f), u1 = lerp(cA[1], cB[1], f), low = lerp(cA[2], cB[2], f), sp1 = lerp(cA[3], cB[3], f);
        const qg = (y - bl) / Math.max(.01, yt - bl);
        const inWin = u > u0 && u < u1 && qg > .1 && qg < low && sp1 > .02;
        if (inWin) { cr = G0.r; cg = G0.g; cb = G0.b; }
        const Wx = [lerp(A.wheelX[0], B.wheelX[0], f), lerp(A.wheelX[1], B.wheelX[1], f)];
        for (const wx of Wx) { const dx = (u - wx) * L, dy = y - wr; if (Math.hypot(dx, dy) < wr * 1.22 && Math.abs(sd * hw) > w * .55) { cr = BK.r; cg = BK.g; cb = BK.b; } }
        col[k * 3] = cr; col[k * 3 + 1] = cg; col[k * 3 + 2] = cb;
      }
    }
    hullG.attributes.position.needsUpdate = true; hullG.attributes.color.needsUpdate = true; hullG.computeVertexNormals();
  }
  // wheels: rim + tyre, widened by the shape table
  const tyreM = std(0x0C0C0E, .72, .1), rimM = std(0xD8D8DC, .18, 1);
  const wheels = [];
  for (let i = 0; i < 4; i++) {
    const W = new THREE.Group(); car.add(W);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40), tyreM); t.rotation.x = Math.PI / 2; t.castShadow = true; W.add(t);
    const rim = new THREE.Group(); W.add(rim);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, 1.03, 28), rimM); c.rotation.x = Math.PI / 2; rim.add(c);
    for (let k = 0; k < 7; k++) { const sk = new THREE.Mesh(new THREE.BoxGeometry(.14, .5, 1.06), std(0x1A1A1E, .4, .7)); sk.position.set(Math.cos(k * .898) * .34, Math.sin(k * .898) * .34, 0); sk.rotation.z = k * .898 + Math.PI / 2; rim.add(sk); }
    wheels.push({ W, rim, front: i < 2, side: i % 2 ? 1 : -1 });
  }
  // chassis visible at the open-frame state: rails, cage, glowing engine
  const cage = new THREE.Group(); car.add(cage);
  const tubeM = std(0xBFC3C9, .28, .95);
  const tube = (a, b, rad = .035) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A); const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, d.length(), 8), tubeM); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; cage.add(m); };
  for (const s of [-1, 1]) {
    tube([-2, .55, s * .5], [2, .55, s * .5], .05); tube([-.6, .55, s * .5], [-.35, 1.32, s * .38]); tube([.8, .55, s * .5], [.55, 1.34, s * .38]); tube([-.35, 1.32, s * .38], [.55, 1.34, s * .38]); tube([-1.9, .55, s * .5], [-1.5, .88, s * .36]); tube([1.9, .55, s * .5], [1.5, .9, s * .36]);
  }
  tube([-.35, 1.32, -.38], [-.35, 1.32, .38]); tube([.55, 1.34, -.38], [.55, 1.34, .38]); tube([-1.5, .88, -.36], [-1.5, .88, .36]); tube([1.5, .9, -.36], [1.5, .9, .36]);
  const engineM = new THREE.MeshStandardMaterial({ color: 0x2A2A2E, emissive: 0xFF7A1A, emissiveIntensity: .7, roughness: .4, metalness: .6 });
  const eng = box(.8, .42, .62, engineM, 1.25, .8, 0, cage);
  for (let i = 0; i < 4; i++) cyl(.07, .07, .3, 10, tubeM, 1.0 + i * .17, 1.12, 0, cage);
  // body panels that fly off between sedan and frame
  const panels = [];
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.5 + rnd() * .9, .03, .4 + rnd() * .5), new THREE.MeshPhysicalMaterial({ color: COL[0], roughness: .24, metalness: .7, clearcoat: 1 })); m.castShadow = true; car.add(m); panels.push({ m, x: -1.8 + (i % 4) * 1.2, side: i < 4 ? 1 : -1, y: 1 + (i % 3) * .1, rx: rnd() * 2 - 1, rz: rnd() * 2 - 1, d: rnd() }); }
  // race aero and sedan chrome
  const wing = new THREE.Group(); car.add(wing);
  const wm = std(0x101012, .3, .6); box(.5, .05, 2, wm, 2.3, 1.42, 0, wing); for (const s of [-1, 1]) { box(.3, .5, .04, wm, 2.28, 1.18, s * .55, wing); box(.56, .32, .03, wm, 2.3, 1.42, s * 1.0, wing); }
  const split = box(.5, .03, 2.1, wm, -2.36, .12, 0, car);
  const chrome = std(0xE8E8EE, .12, 1);
  const bump = [box(.12, .12, 1.56, chrome, -2.34, .46, 0, car), box(.12, .12, 1.56, chrome, 2.34, .52, 0, car)];
  const lampM = new THREE.MeshStandardMaterial({ color: 0xFFF4DC, emissive: 0xFFE2A8, emissiveIntensity: .9 });
  const lamps = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.13, 18, 14), lampM); m.position.set(-2.24, .72, s * .58); car.add(m); return m; });
  const dlrM = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 3.2 });
  const dlr = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.2, .03, .46), dlrM); m.position.set(-1.86, .42, s * .62); m.rotation.y = -s * .3; car.add(m); return m; });
  const tail = new THREE.Mesh(new THREE.BoxGeometry(.03, .05, 1.5), new THREE.MeshStandardMaterial({ color: 0x300, emissive: 0xFF1E1E, emissiveIntensity: 2.6 })); tail.position.set(2.31, .84, 0); car.add(tail);
  // sparks and dust, written from time
  const sparks = pts(scene, 900, { color: 0xFFB25A, size: .05, add: true });
  const sparkSeed = []; for (let i = 0; i < 900; i++) sparkSeed.push([rnd(), rnd(), rnd(), rnd()]);
  // floating frame plates: textures rendered from this scene on first draw
  const RT = [0, 1, 2].map(() => new THREE.WebGLRenderTarget(640, 400, { samples: 4 }));
  const plateM = RT.map((t) => new THREE.MeshBasicMaterial({ map: t.texture, color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  const plates = plateM.map((m) => { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 1.2), m); g.add(p); const fm = new THREE.MeshBasicMaterial({ color: 0xFFB25A, transparent: true, opacity: 0, depthWrite: false }); for (const [a, b, x, y] of [[1.98, .03, 0, .6], [1.98, .03, 0, -.6], [.03, 1.2, -.96, 0], [.03, 1.2, .96, 0]]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(a, b), fm); e.position.set(x, y, .001); g.add(e); } g.fm = fm; g.renderOrder = 5; scene.add(g); return g; });
  // the morph timeline between plates: a beam of in-between ghost dots
  const beamN = 140; const beam = pts(scene, beamN, { color: 0xFFD08A, size: .06, add: true });

  const hk = AT["s1:balap"], awal = AT["s2:awal"], akhir = AT["s2:akhir"], mengisi = AT["s2:mengisi"], sudut = AT["s3:sudut"], sama = AT["s3:sama"], rangka = AT["s4:rangka"], balap4 = AT["s4:balap"], panel = AT["s5:Panel"], rg5 = AT["s5:rangka"], roda = AT["s5:roda"], diam = AT["s5:diam"], perc = AT["s6:percikan"], bay = AT["s6:bayangan"], bass = AT["s6:bass"], mendarat = AT["s6:mendarat"], sambung = AT["s6:sambungannya"], label = AT["s7:label"];
  const morph = (t) => {
    let m = 2 * smooth((t - hk) / 1.6);                      // hook pull
    m *= 1 - smooth((t - K.s2 + .25) / .7);                  // rewound for the explanation
    m += ramp(t, rangka - .2, rangka + 1.1) * (1 - ramp(t, K.s5 - .2, K.s5 + .4));   // sedan to frame during the staging line
    m += ramp(t, balap4 - .2, balap4 + 1.1) * (1 - ramp(t, K.s5 - .2, K.s5 + .4));
    // s5 acts out the prompt, word by word
    m += ramp(t, panel, panel + 1.2) * .55 + ramp(t, rg5, rg5 + 1.0) * .45;
    m += ramp(t, K.s6 - .3, bass) * 1 * ramp(t, K.s6 - .3, K.s6);
    return clamp01(m / 2) * 2;
  };
  const camTr = track([
    [0, -7.5, 1.6, 10, 0, 1.2, 0], [hk + .2, -8.3, 1.8, 11, 0, 1.3, 0], [K.s1e, -9, 2.2, 10.8, 0, 1.45, 0],
    [K.s2 + 1, -9.2, 2.6, 11.5, 0, 1.75, 0], [K.s2e, -6, 2.8, 13.4, 0, 1.75, 0],
    [K.s3 + 1, -5, 3.0, 13.8, 0, 1.75, 0], [K.s3e, -4.6, 3, 14, 0, 1.75, 0],
    [K.s4 + 1, -9.2, 2.2, 11.5, 0, 1.45, 0], [K.s4e, -10.6, 2.6, 9.6, 0, 1.45, 0],
    [K.s5 + .8, -11, 3, 8.8, 0, 1.5, 0], [diam, -10.2, 3.1, 10, 0, 1.5, 0], [K.s5e, -10.2, 3.1, 10, 0, 1.5, 0],
    [K.s6 + 1.4, 8, 2.6, 11.4, 0, 1.45, 0], [K.s6e, 11.2, 2, 8.6, 0, 1.3, 0],
    [K.s7 + 1.2, 8, 1.6, -10.8, .2, 1.3, 0], [K.dur, 5.5, 1.5, -12.4, .2, 1.3, 0],
  ]);
  let baked = false;
  const place = (t, m) => {
    writeHull(m);
    const a = m < 1 ? 0 : 1, f = m < 1 ? m : m - 1, A = SHAPES[a], B = SHAPES[a + 1];
    const wr = lerp(A.wheelR, B.wheelR, f), ww = lerp(A.wheelW, B.wheelW, f), tr = lerp(A.track, B.track, f);
    const wf = lerp(A.wheelX[0], B.wheelX[0], f), wb = lerp(A.wheelX[1], B.wheelX[1], f);
    wheels.forEach((w, i) => { const u = w.front ? wf : wb; w.W.position.set((u - .5) * L, wr, w.side * (tr + ww * .15)); w.W.scale.set(wr, wr, ww); w.rim.rotation.z = 0; });
    const open = 1 - Math.abs(m - 1); const oc = smooth(clamp01(open * 1.6 - .2));
    cage.visible = oc > .01; cage.scale.setScalar(.92 + oc * .08); engineM.emissiveIntensity = .7 * oc;
    cage.children.forEach((c) => (c.visible = oc > .05));
    wire.material.opacity = oc * .22;
    paint.opacity = 1;
    const fl = clamp01(m); const flyU = smooth(fl);
    panels.forEach((p, i) => { const u = clamp01((fl - p.d * .25) / .75), vis = fl > .002 && fl < .998; p.m.visible = vis; p.m.position.set(p.x + p.rx * u * u * .9, p.y + u * (1.2 + p.d * .9) - u * u * 1.6, p.side * (.85 + u * (1.6 + p.d))); p.m.rotation.set(p.rx * u * 3, p.d * u, p.side * u * 2 + p.rz * u); p.m.material.color.copy(COL[0]); });
    const race = smooth(clamp01(m - 1)), sed = 1 - smooth(clamp01(m * 1.5));
    wing.visible = race > .02; wing.scale.set(1, race, race); wing.position.y = (1 - race) * -.6;
    split.visible = race > .3; split.scale.z = race;
    bump.forEach((b) => { b.visible = sed > .03; b.scale.z = sed; });
    lamps.forEach((l) => { l.visible = sed > .1; });
    dlr.forEach((l) => { l.visible = race > .5; });
    return { oc, race };
  };
  return (t) => {
    if (!baked) {
      baked = true;
      const vis = [floor.visible, ring.visible];
      sparks.P.visible = beam.P.visible = false; plates.forEach((p) => (p.visible = false));
      [0, 1, 2].forEach((i) => {
        place(0, i);
        const rc = new THREE.PerspectiveCamera(30, 1.6, .1, 100); rc.position.set(-5.4, 1.55, 6); rc.lookAt(0, .72, 0);
        r.setRenderTarget(RT[i]); r.render(scene, rc);
      });
      r.setRenderTarget(null); sparks.P.visible = beam.P.visible = true;
    }
    const m = morph(t);
    const { oc, race } = place(t, m);
    // fixed spin free wheels only move at the drop
    const drop = ramp(t, mendarat - .35, mendarat) * (1 - ramp(t, mendarat, mendarat + .55));
    const landed = t > K.s6 ? Math.exp(-Math.max(0, t - bass) * 6) * Math.sin(Math.max(0, t - bass) * 18) * .05 * (t > bass ? 1 : 0) : 0;
    car.position.y = landed;
    // Sparks: during any transform, or on the named word in s6
    const dm = Math.abs(morph(t + .05) - m) > .004;
    const sparkOn = Math.max(dm ? 1 : 0, ramp(t, perc, perc + .2) * (1 - ramp(t, K.s7, K.s7 + .8)) * .9);
    sparks.m.opacity = sparkOn;
    for (let i = 0; i < 900; i++) {
      const s = sparkSeed[i], life = (s[0] + t * (.55 + s[1])) % 1;
      const ox = -2.1 + s[2] * 4.2, side = s[3] > .5 ? 1 : -1;
      sparks.pos[i * 3] = ox + (s[1] - .5) * 3.6 * life; sparks.pos[i * 3 + 1] = .3 + s[3] * 1 + life * (2.2 * s[1]) - life * life * 2.8; sparks.pos[i * 3 + 2] = side * (.9 + life * 2.6 * s[0]);
      if (sparks.pos[i * 3 + 1] < .02) sparks.pos[i * 3 + 1] = .02;
      const b = (1 - life) * (1 - life);
      sparks.col[i * 3] = b; sparks.col[i * 3 + 1] = .55 * b; sparks.col[i * 3 + 2] = .12 * b;
    }
    sparks.commit();
    // shadows on the floor switch on at the word, until then the light is kept high and soft
    sp.intensity = t < K.s6 ? 760 : (760 + 300 * ramp(t, bay, bay + .3)) * (1 - .78 * ramp(t, K.s7 - .3, K.s7 + .9));
    ring.material.opacity = .4 + .4 * Math.exp(-Math.max(0, t - bass) * 2.5) * (t > bass ? 1 : 0);
    // plates. s2: start and end frames over the car. s3: same, aligned. s4: three steps. s6: frame hand-off.
    const c = camTr(t);
    const shk = t > bass ? Math.exp(-(t - bass) * 7) * .12 : 0;
    cam.position.set(c[0] + Math.sin(t * 61) * shk, c[1] + Math.cos(t * 53) * shk, c[2]); cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld();
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1), fw = new THREE.Vector3(); cam.getWorldDirection(fw);
    const at = (sx, sy, z = 8) => cam.position.clone().addScaledVector(fw, z).addScaledVector(right, sx * z).addScaledVector(up, sy * z);
    const a0 = Math.max(ramp(t, awal - .1, awal + .25), ramp(t, K.s4, K.s4 + .4) * (1 - ramp(t, rangka - .1, rangka + .2)) * 0) * (1 - ramp(t, K.s4 - .2, K.s4));
    const a1 = ramp(t, akhir - .1, akhir + .25) * (1 - ramp(t, K.s4 - .2, K.s4));
    const a2 = 0;
    const s4A = ramp(t, K.s4 + 1, K.s4 + 1.4) * (1 - ramp(t, K.s5 - .2, K.s5));
    const s6A = ramp(t, sambung - 2.2, sambung - 1.8) * (1 - ramp(t, bay - .1, bay + .2));
    plates.forEach((p, i) => {
      let o = 0, sx = 0, sy = .06, sc = 1;
      if (i === 0) { o = a0; sx = -.118; }
      if (i === 2) { o = a1; sx = .118; }
      if (s4A > 0) { o = Math.max(o, s4A * (i === 0 ? 1 : i === 1 ? ramp(t, rangka - .1, rangka + .2) : ramp(t, balap4 - .1, balap4 + .2))); sx = -.126 + i * .126; sc = .9; sy = .075; }
      if (s6A > 0) { o = Math.max(o, s6A * (i === 1 ? 1 : 0)); sx = 0; sc = 1.15; sy = .07; }
      p.visible = o > .01;
      if (!p.visible) return;
      p.position.copy(at(sx, sy, 8)); p.quaternion.copy(cam.quaternion); p.scale.setScalar(sc * .58);
      plateM[i].opacity = o; p.fm.opacity = o;
    });
    // ghost dots filling the gap on the word mengisi
    const bA = ramp(t, mengisi - .1, mengisi + .4) * (1 - ramp(t, K.s3 - .3, K.s3));
    for (let i = 0; i < beamN; i++) { const u = (i / beamN + t * .12) % 1; const P = at(-.05 + .1 * u, .06 + Math.sin(u * 12 + t * 3) * .006, 8); beam.pos[i * 3] = P.x; beam.pos[i * 3 + 1] = P.y; beam.pos[i * 3 + 2] = P.z; const b = bA * (.5 + .5 * Math.sin(i * .7 + t * 6)); beam.col[i * 3] = b; beam.col[i * 3 + 1] = .8 * b; beam.col[i * 3 + 2] = .5 * b; }
    beam.commit();
    comp.render();
  };
}
