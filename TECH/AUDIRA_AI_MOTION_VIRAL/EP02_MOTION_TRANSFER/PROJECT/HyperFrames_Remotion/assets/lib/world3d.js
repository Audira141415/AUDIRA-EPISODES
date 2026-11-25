// CAPTURE STAGE: a performer rendered only as a point cloud on a dark mocap floor. One skeleton, driven by one dance function, also drives a jointed puppet, so the transfer is literally the same data.
// Illustration of the workflow, drawn in code; not output from an AI model.
import * as THREE from "./three.module.js";
import { stage, canvasTex, track, ramp, smooth, mulberry, clamp01, pts, envStrips, std } from "./lib3d.js";

const CY = 0x3DF5E0, MG = 0xFF3D9A, AM = 0xFFC247;
// Analytic two-bone IK in the xy plane with a bend sign, so feet can be planted.
function ik(root, tip, l1, l2, bend) {
  const dx = tip[0] - root[0], dy = tip[1] - root[1], dz = tip[2] - root[2];
  const d = Math.min(l1 + l2 - .001, Math.max(.05, Math.hypot(dx, dy, dz)));
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const u = [dx / d, dy / d, dz / d];
  return [root[0] + u[0] * a + bend[0] * h, root[1] + u[1] * a + bend[1] * h, root[2] + u[2] * a + bend[2] * h];
}
// Beat-synced step-touch: returns all joints at time t. energy 0 = neutral pose with palms up (the capture pose).
function pose(t, energy, bpm = 112) {
  const b = (t * bpm) / 60, ph = (b / 2) % 1, side = Math.sin(b * Math.PI);
  const E = energy;
  const hipX = side * .3 * E, hipY = 2.02 - Math.abs(Math.sin(b * Math.PI)) * .13 * E, hipZ = 0;
  const hip = [hipX, hipY, hipZ];
  const lean = side * .16 * E;
  const chest = [hipX + lean, hipY + .82, Math.sin(b * Math.PI * .5) * .1 * E];
  const neck = [chest[0] + lean * .35, chest[1] + .42, chest[2]];
  const head = [neck[0] + lean * .3, neck[1] + .28, neck[2] + .03];
  const wid = .38, hw = .2;
  const shL = [chest[0] - wid, chest[1] + .26 + side * .05 * E, chest[2]], shR = [chest[0] + wid, chest[1] + .26 - side * .05 * E, chest[2]];
  const hpL = [hipX - hw, hipY, 0], hpR = [hipX + hw, hipY, 0];
  // feet step side to side
  const st = Math.floor(b) % 2, frac = b - Math.floor(b), lift = Math.sin(frac * Math.PI);
  const footOut = .34 + .22 * E;
  const fL = [-footOut + (st === 0 ? lift * .22 * E : 0), .08 + (st === 0 ? lift * .22 * E : 0), .05], fR = [footOut - (st === 1 ? lift * .22 * E : 0), .08 + (st === 1 ? lift * .22 * E : 0), .05];
  const kL = ik(hpL, fL, 1, 1, [-.2 * .98, 0, .98]), kR = ik(hpR, fR, 1, 1, [.2 * .98, 0, .98]);
  // hands: neutral is palms-forward at shoulder height, dance swaps high and low diagonals on the bar
  const seq = [[-1.05, .55, .35, 1.05, -.2, .35], [-.8, -.25, .5, .9, .8, .3], [-1.0, .9, .3, .8, -.35, .55], [-.5, .35, .7, 1.05, .6, .25]];
  const bar = Math.floor(b / 2) % 4, nxt = (bar + 1) % 4, mu = smooth(ph * 1.6);
  const q = seq[bar].map((v, i) => v + (seq[nxt][i] - v) * mu);
  const neut = [-.72, -.05, .46, .72, -.05, .46];
  const hd = q.map((v, i) => neut[i] + (v - neut[i]) * E);
  const hL = [chest[0] + hd[0], chest[1] + .26 + hd[1], chest[2] + hd[2]], hR = [chest[0] + hd[3], chest[1] + .26 + hd[4], chest[2] + hd[5]];
  const eL = ik(shL, hL, .62, .62, [-.75, -.6, -.2]), eR = ik(shR, hR, .62, .62, [.75, -.6, -.2]);
  return { hip, chest, neck, head, shL, shR, hpL, hpR, kL, kR, fL, fR, eL, eR, hL, hR };
}
const BONES = [["hip", "chest", .24, .3], ["chest", "neck", .3, .2], ["shL", "shR", .15, .15], ["hpL", "hpR", .17, .17], ["shL", "eL", .1, .09], ["eL", "hL", .09, .07], ["shR", "eR", .1, .09], ["eR", "hR", .09, .07], ["hpL", "kL", .15, .12], ["kL", "fL", .12, .08], ["hpR", "kR", .15, .12], ["kR", "fR", .12, .08]];

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x05070C, fog: 0.022, exp: 1.05, bloom: [.26, .45, .92], fov: 38 });
  const rnd = mulberry(202);
  envStrips(r, scene, [[6, 24, "#CFEFFF", 3, -14, 8, 4], [6, 24, "#FFD0E8", 2.4, 14, 8, 4], [28, 4, "#FFFFFF", 2.5, 0, 22, 0]], 0x05070C);
  scene.environmentIntensity = .42;
  scene.add(new THREE.HemisphereLight(0x8FB8FF, 0x101018, .55));
  const sp = new THREE.SpotLight(0xFFFFFF, 210, 50, .5, .6, 1.6); sp.position.set(-3, 15, 12); sp.target.position.set(1.8, 1.5, 0); sp.castShadow = true; sp.shadow.mapSize.set(1536, 1536); sp.shadow.radius = 4; scene.add(sp, sp.target);
  // calibrated floor
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ roughness: .36, metalness: .4, map: canvasTex(1024, 1024, (x, w, h) => { x.fillStyle = "#090C14"; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(61,245,224,.28)"; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8, h); x.moveTo(0, i * h / 8); x.lineTo(w, i * h / 8); x.stroke(); } x.fillStyle = "rgba(61,245,224,.55)"; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) x.fillRect(i * w / 8 - 4, j * h / 8 - 1, 8, 2); }, [20, 20]) }));
  fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  // tracking camera rigs on the floor perimeter, each with a laser cone that switches on when capture starts
  const rigM = std(0x20242E, .5, .6);
  const rigs = [[-7.5, 0, -3], [7.5, 0, -3.5], [-7, 0, 5], [7, 0, 5.5], [0, 0, -7]].map(([x, y, z]) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 5.2, 8), rigM); pole.position.y = 2.6; G.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.5, .32, .5), rigM); head.position.y = 5.3; G.add(head);
    const led = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFF3020 })); led.position.set(0, 5.3, .28); G.add(led);
    return { G, led };
  });
  // point-cloud performer: dots sampled around bones, offset in a local bone frame so they ride with the skeleton
  const N = 7200;
  const cloud = pts(scene, N, { color: CY, size: .05, add: true, opacity: .95 });
  const seeds = [];
  const lens = BONES.map(() => 1);
  for (let i = 0; i < N; i++) {
    const head = i < N * .1;
    const bi = head ? -1 : Math.floor(rnd() * BONES.length);
    seeds.push({ b: bi, u: rnd(), a: rnd() * Math.PI * 2, rr: Math.pow(rnd(), .35), c: rnd() });
  }
  const set = cloud.col;
  for (let i = 0; i < N; i++) { const s = seeds[i]; const m = .45 + s.c * .55; set[i * 3] = .24 * m; set[i * 3 + 1] = .96 * m; set[i * 3 + 2] = .88 * m; }
  // transfer stream from performer to puppet
  const SN = 520;
  const stream = pts(scene, SN, { color: MG, size: .085, add: true, opacity: 1 });
  const sSeeds = []; for (let i = 0; i < SN; i++) sSeeds.push([rnd(), Math.floor(rnd() * 16), rnd()]);
  // bright skeleton over the cloud
  const skelG = new THREE.BufferGeometry(); skelG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BONES.length * 6 + 18), 3));
  const skel = new THREE.LineSegments(skelG, new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 })); skel.frustumCulled = false; scene.add(skel);
  const jointNames = ["hip", "chest", "neck", "head", "shL", "shR", "hpL", "hpR", "kL", "kR", "fL", "fR", "eL", "eR", "hL", "hR"];
  const jM = jointNames.map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), new THREE.MeshBasicMaterial({ color: AM, transparent: true, opacity: 0 })); scene.add(m); return m; });
  // puppet: same joints, sculpted capsule bones and a wayang-tinged mask head, so it reads as a made character
  const P = new THREE.Group(); scene.add(P);
  const body = std(0xCDB89A, .42, .1), trim = std(MG, .3, .2, { emissive: MG, emissiveIntensity: .3 }), dark = std(0x1B2130, .4, .5), gold = std(0xFFC247, .28, .75);
  const pbones = BONES.map(([a, b, r0, r1], i) => { const g = new THREE.CylinderGeometry(r1 * 1.18, r0 * 1.18, 1, 14); g.translate(0, .5, 0); const m = new THREE.Mesh(g, i < 2 ? body : (i === 2 || i === 3) ? dark : i % 2 ? trim : body); m.castShadow = true; P.add(m); return m; });
  const pj = jointNames.map((n, i) => { const big = { hip: .28, chest: .32, neck: .13, head: 0, shL: .19, shR: .19, hpL: .19, hpR: .19, kL: .16, kR: .16, fL: 0, fR: 0, eL: .13, eR: .13, hL: .14, hR: .14 }[n]; const m = new THREE.Mesh(new THREE.SphereGeometry(Math.max(.01, big), 14, 12), n[0] === "h" && n !== "hip" ? gold : body); m.castShadow = true; m.visible = big > 0; P.add(m); return m; });
  const Hd = new THREE.Group(); P.add(Hd);
  const mask = new THREE.Mesh(new THREE.SphereGeometry(.36, 20, 16), body); mask.scale.set(.92, 1.14, .92); mask.castShadow = true; Hd.add(mask);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 10), new THREE.MeshStandardMaterial({ color: CY, emissive: CY, emissiveIntensity: 1.5 })); e.scale.set(1.5, .7, .5); e.position.set(s * .15, .05, .32); Hd.add(e); const ear = new THREE.Mesh(new THREE.ConeGeometry(.1, .42, 8), gold); ear.position.set(s * .3, .36, 0); ear.rotation.z = -s * .35; Hd.add(ear); }
  const crown = new THREE.Mesh(new THREE.TorusGeometry(.3, .045, 8, 24), gold); crown.rotation.x = Math.PI / 2; crown.position.y = .28; Hd.add(crown);
  const shoes = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(.3, .16, .55), dark); m.castShadow = true; P.add(m); return m; });
  // strings for the dalang image
  const strG = new THREE.BufferGeometry(); strG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6 * 6), 3));
  const str = new THREE.LineSegments(strG, new THREE.LineBasicMaterial({ color: MG, transparent: true, opacity: 0 })); str.frustumCulled = false; scene.add(str);
  // three input plates that orbit in for s3
  const plate = (draw) => new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3), new THREE.MeshBasicMaterial({ map: canvasTex(440, 600, draw), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  const frameCss = (x, w, h, c) => { x.fillStyle = "rgba(8,11,18,.85)"; x.fillRect(0, 0, w, h); x.strokeStyle = c; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16); };
  // proportion check frames for s4
  const cropBad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xFF3B30, transparent: true, opacity: 0, side: THREE.DoubleSide, wireframe: false, depthWrite: false }));
  const edge = (w, h, c) => { const G = new THREE.Group(), material = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false }), T = .05; for (const [a, b, x, y] of [[w, T, 0, h / 2], [w, T, 0, -h / 2], [T, h, -w / 2, 0], [T, h, w / 2, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(a, b), material); m.position.set(x, y, 0); G.add(m); } G.material = material; return G; };
  const fA = edge(2.9, 5.1, 0x3DF5E0), fB = edge(2.9, 5.1, 0x3DF5E0), fBad = edge(1.45, 1.3, 0xFF3B30); scene.add(fA, fB, fBad);
  const px = -1.5, qx = 1.5;
  const hook = AT["s1:bergerak"], capOn = AT["s2:tali"], wy = AT["s2:wayangnya"], prop = AT["s4:proporsi"], rusak = AT["s4:rusak"], palm = AT["s5:telapak"], batas = AT["s7:batas"], video = AT["s3:Video"], gam = AT["s3:Gambar"], pr = AT["s3:Prompt"], neon = AT["s3:neon"], alat = AT["s6:Kling"], wan = AT["s6:Wan"];
  const camTr = track([
    [0, -1.2, 2.6, 7.5, -1.4, 2.2, 0], [hook, -.8, 2.6, 8.5, -1.4, 2.2, 0], [K.s1e, 0, 3.4, 17, 0, 2, 0],
    [K.s2 + 1.5, -.8, 3.8, 17.5, 0, 2, 0], [K.s2e, .8, 4.2, 17.5, 0, 2, 0],
    [K.s3 + 1, 3.6, 5, 16.8, .1, 2, 0], [K.s3e, 2.4, 4.2, 17, .1, 2, 0],
    [K.s4 + .8, 0, 3.1, 17.5, 0, 2, 0], [K.s4e, -.3, 3.1, 17, 0, 2, 0],
    [K.s5 + 1, -1.6, 2.5, 8.8, -1.6, 2.3, 0], [K.s5 + 5, -1.3, 2.5, 8.2, -1.7, 2.4, 0], [K.s5e, .6, 3.2, 17, 0, 2, 0],
    [K.s6 + 1.5, 2.6, 3.8, 16.5, .3, 2, 0], [K.s6 + 6, -3.2, 4.1, 16.5, -.1, 2, 0], [K.s6e, -3.4, 4.4, 17, 0, 2, 0],
    [K.s7 + 1.2, 0, 2.8, 13.5, .9, 2.2, 0], [K.dur, .4, 2.8, 11.5, 1.1, 2.4, 0],
  ]);
  const J = (o, ox) => { const r = {}; for (const k in o) r[k] = [o[k][0] + ox, o[k][1], o[k][2]]; return r; };
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
  return (t) => {
    // dance energy: starts in neutral capture pose only at the palms beat, otherwise dances from the hook on
    const danceOn = ramp(t, .3, 1.2) * (1 - ramp(t, palm - .6, palm) * (1 - ramp(t, palm + 2.2, palm + 3)));
    const A = J(pose(t, danceOn), px);
    // the puppet follows the same data with 3 frames of lag and fades in on the word; before that it stands in rest.
    const tr = ramp(t, hook - .2, hook + .3);
    const raw = pose(t - .1, danceOn * tr);
    const B = J(raw, qx);
    // Cloud positions around bones.
    for (let i = 0; i < N; i++) {
      const s = seeds[i]; let x, y, z;
      if (s.b < 0) { const c = A.head; const ph = s.a, th = s.u * Math.PI; x = c[0] + Math.sin(th) * Math.cos(ph) * .26 * s.rr; y = c[1] + Math.cos(th) * .31 * s.rr; z = c[2] + Math.sin(th) * Math.sin(ph) * .26 * s.rr; }
      else {
        const [a, b, r0, r1] = BONES[s.b]; const pa = A[a], pb = A[b]; const R = (r0 + (r1 - r0) * s.u) * s.rr;
        x = pa[0] + (pb[0] - pa[0]) * s.u + Math.cos(s.a) * R; y = pa[1] + (pb[1] - pa[1]) * s.u + Math.sin(s.a) * R * .5; z = pa[2] + (pb[2] - pa[2]) * s.u + Math.sin(s.a) * R;
      }
      const jit = Math.sin(t * 19 + i) * .006;
      cloud.pos[i * 3] = x + jit; cloud.pos[i * 3 + 1] = y; cloud.pos[i * 3 + 2] = z;
    }
    cloud.commit();
    // skeleton overlay appears when the strings are named, stays afterward at low level
    const skA = ramp(t, capOn - .3, capOn + .3) * .9 + .0;
    const arr = skelG.attributes.position.array; let w = 0;
    BONES.forEach(([a, b]) => { arr.set(A[a], w); arr.set(A[b], w + 3); w += 6; });
    skel.material.opacity = skA; skelG.attributes.position.needsUpdate = true;
    jointNames.forEach((n, i) => { jM[i].position.set(...A[n]); jM[i].material.opacity = skA; });
    rigs.forEach((o, i) => { o.led.material.color.set(Math.floor(t * 2 + i) % 2 ? 0xFF3020 : 0x401010); });
    // puppet
    P.scale.setScalar(1);
    const pIn = ramp(t, hook - .25, hook + .35);
    P.visible = pIn > .01;
    P.position.set(0, (1 - pIn) * -6, 0);
    BONES.forEach(([a, b], i) => { tmpA.set(...B[a]); tmpB.set(...B[b]).sub(tmpA); const l = tmpB.length(); pbones[i].position.copy(tmpA); pbones[i].scale.set(1, l, 1); pbones[i].quaternion.copy(q.setFromUnitVectors(UP, tmpB.normalize())); });
    jointNames.forEach((n, i) => pj[i].position.set(...B[n]));
    Hd.position.set(...B.head); Hd.rotation.z = (B.neck[0] - B.chest[0]) * -1.2; Hd.rotation.y = Math.sin(t * 1.3) * .2;
    shoes[0].position.set(B.fL[0], B.fL[1], B.fL[2] + .12); shoes[1].position.set(B.fR[0], B.fR[1], B.fR[2] + .12);
    // strings from performer's hands and head to the puppet's, the dalang image
    const stA = ramp(t, capOn - .1, capOn + .5) * (1 - ramp(t, K.s3, K.s3 + 1)) + ramp(t, batas, batas + .4) * 0;
    const sa = strG.attributes.position.array;
    [["hL", "hL"], ["hR", "hR"], ["head", "head"], ["fL", "fL"], ["fR", "fR"], ["hip", "hip"]].forEach(([a, b], i) => { sa.set(A[a], i * 6); sa.set(B[b], i * 6 + 3); });
    str.material.opacity = stA * .55; strG.attributes.position.needsUpdate = true;
    // pink packets flow between bodies during the transfer and whenever the puppet is explained
    const sOn = Math.max(ramp(t, hook - .2, hook + .3) * (1 - ramp(t, K.s2, K.s2 + .6)), ramp(t, video, video + .4) * (1 - ramp(t, K.s4, K.s4 + .5)), ramp(t, K.s7, K.s7 + .5) * (1 - ramp(t, batas, batas + .5)));
    const jn = jointNames;
    for (let i = 0; i < SN; i++) {
      const s = sSeeds[i]; const n = jn[s[1]]; const u = (s[0] + t * (.5 + s[2] * .4)) % 1;
      const a = A[n], b = B[n], sag = Math.sin(u * Math.PI) * (.4 + s[2] * .5);
      stream.pos[i * 3] = a[0] + (b[0] - a[0]) * u; stream.pos[i * 3 + 1] = a[1] + (b[1] - a[1]) * u + sag; stream.pos[i * 3 + 2] = a[2] + (b[2] - a[2]) * u;
      const v = sOn * Math.sin(u * Math.PI); stream.col[i * 3] = v; stream.col[i * 3 + 1] = .24 * v; stream.col[i * 3 + 2] = .6 * v;
    }
    stream.commit();
    // proportion frames for the rule: both match, then the image frame shrinks to the head and turns red
    const pf = ramp(t, prop - .3, prop + .2) * (1 - ramp(t, K.s5 - .4, K.s5));
    const bad = ramp(t, rusak - 1.6, rusak - .9);
    fA.position.set(px, 2.35, .6); fB.position.set(qx, 2.35, .6);
    fA.material.opacity = pf; fB.material.opacity = pf * (1 - bad); fBad.position.set(qx, 4.1, .6); fBad.material.opacity = pf * bad;
    const c = camTr(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
