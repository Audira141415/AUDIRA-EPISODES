// THE MESH (CYBERFORGE + CIRCUITFORGE): one dark room around one object. 925 real points, one per skill. They crush a small memory ring, spread out into a shell, and only the ones Claude asks for light up. A plug physically seats when the command is typed.
import * as THREE from "./three.module.js";
import { stage, ramp, smooth, track, clamp01, back, mulberry, pts } from "./lib3d.js";

const BG = 0x04171a, TOSCA = 0x00b894, LIME = 0xa3e635, ORG = 0xff6a3d, WHITE = 0xe9fff6;
const N = 925, MONO = '"JetBrains Mono"', G = '"Space Grotesk"';

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: BG, fog: .006, exp: 1.05, bloom: [.6, .5, .62], fov: 38, shadow: false });
  const rnd = mulberry(925);
  const P = pts(scene, N, { color: TOSCA, size: .34, add: true, opacity: 1 });
  const shell = [], loose = [], seedA = [];
  const CENTER = new THREE.Vector3(0, 3.4, 0);
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + .5) / N * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963;
    const R = 7.4 + (rnd() - .5) * 1.5;
    shell.push(new THREE.Vector3(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R));
    const a = rnd() * 6.283, b = rnd() * 6.283, c = 34 + rnd() * 30;
    loose.push(new THREE.Vector3(Math.cos(a) * Math.sin(b) * c, Math.cos(b) * c, Math.sin(a) * Math.sin(b) * c));
    seedA.push(rnd());
  }
  // Links between nearest neighbours in the shell, drawn once.
  const seg = [];
  for (let i = 0; i < N; i += 2) { let best = -1, bd = 1e9; for (let j = i + 1; j < Math.min(N, i + 60); j++) { const d = shell[i].distanceToSquared(shell[j]); if (d < bd) { bd = d; best = j; } } if (best > 0) seg.push(shell[i].x, shell[i].y, shell[i].z, shell[best].x, shell[best].y, shell[best].z); }
  const links = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(seg, 3)), new THREE.LineBasicMaterial({ color: TOSCA, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  links.position.copy(CENTER); scene.add(links);

  // Claude's memory: a small ring that overfills in the hook.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3, .1, 12, 80), new THREE.MeshBasicMaterial({ color: WHITE, transparent: true }));
  ring.position.copy(CENTER); scene.add(ring);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 1), new THREE.MeshStandardMaterial({ color: 0x0b3d2e, emissive: TOSCA, emissiveIntensity: .75, flatShading: true, metalness: .3, roughness: .35 }));
  core.position.copy(CENTER); scene.add(core);
  scene.add(new THREE.PointLight(0xffffff, 60, 30), new THREE.AmbientLight(0xb0ffe0, .5));
  scene.children.at(-2).position.set(5, 9, 9);
  const sun = new THREE.DirectionalLight(0xdffff2, 2.4); sun.position.set(-6, 10, 14); scene.add(sun);

  // Plug and socket. Real geometry, seated on the command word.
  const metal = new THREE.MeshStandardMaterial({ color: 0xcfe8df, metalness: .85, roughness: .28 });
  const shellM = new THREE.MeshStandardMaterial({ color: 0x2e9c80, metalness: .25, roughness: .42, emissive: 0x0b3d2e, emissiveIntensity: .9 });
  const plug = new THREE.Group(); scene.add(plug);
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 2.8), shellM); plug.add(body);
  for (const x of [-.55, .55]) { const pin = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 1.2, 12), metal); pin.position.set(x, 1.3, 0); plug.add(pin); }
  const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 40 }, () => new THREE.Vector3())), new THREE.LineBasicMaterial({ color: LIME })); cable.frustumCulled = false; scene.add(cable);
  const socket = new THREE.Mesh(new THREE.BoxGeometry(3.1, .7, 3.1), shellM); socket.position.set(0, 1.62, 0); scene.add(socket);
  const sockGlow = new THREE.Mesh(new THREE.TorusGeometry(1.36, .06, 8, 40), new THREE.MeshBasicMaterial({ color: ORG })); sockGlow.rotation.x = Math.PI / 2; sockGlow.position.set(0, 1.24, 0); scene.add(sockGlow);

  // Clone: packets fall into a folder. npm: 95 cubes stack up, the real package count.
  const folder = new THREE.Group(); scene.add(folder);
  const fBack = new THREE.Mesh(new THREE.BoxGeometry(6, 3.8, .3), shellM); fBack.position.set(0, 1.9, -1); folder.add(fBack);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(2.4, .55, .3), shellM); tab.position.set(-1.8, 4.05, -1); folder.add(tab);
  const fFront = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, .3), new THREE.MeshStandardMaterial({ color: 0x008f73, metalness: .1, roughness: .55, emissiveIntensity: 0 })); fFront.position.set(0, 1.25, .7); fFront.rotation.x = -.18; folder.add(fFront);
  const packets = pts(scene, 240, { color: LIME, size: .26, add: true });
  const cubeG = new THREE.BoxGeometry(.38, .38, .38);
  const cubes = new THREE.InstancedMesh(cubeG, new THREE.MeshStandardMaterial({ color: 0x7fbf22, roughness: .55 }), 95); cubes.frustumCulled = false; scene.add(cubes);
  const dummy = new THREE.Object3D();

  // Key for the -e flag.
  const key = new THREE.Group(); scene.add(key);
  const km = new THREE.MeshStandardMaterial({ color: ORG, emissive: ORG, emissiveIntensity: .45, metalness: .5, roughness: .35 });
  const bow = new THREE.Mesh(new THREE.TorusGeometry(.8, .24, 12, 30), km); bow.position.x = -1.6; key.add(bow);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(3, .3, .3), km); shaft.position.x = .5; key.add(shaft);
  for (const x of [1.3, 1.85]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.28, .6, .28), km); b.position.set(x, -.4, 0); key.add(b); }
  // A censor bar that slides over the key: never show it on screen.
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.5), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true })); scene.add(bar);

  const a3 = AT["s3:clone"], a4 = AT["s4:npm"], a5 = AT["s5:claude"], a7 = AT["s7:connected"], a7b = AT["s7:online"];
  const CAM = track([
    [0, 0, 5, 26, 0, 4.2, 0],
    [K.s2, 2, 4, 28, 0, 4, 0],
    [K.s3 - .6, -10, 8, 38, 0, 3.9, 0],
    [K.s3 + 1, -7, 7, 30, 0, 3.2, 0],
    [K.s4, 7, 7, 26, 0, 3.1, 0],
    [K.s5, 5, 6, 24, 0, 2.8, 0],
    [K.s6, -4, 6, 22, 0, 5.3, 0],
    [K.s7, 4, 6, 24, 0, 5.3, 0],
    [K.s7 + 2, 12, 7, 34, 0, 6.2, 0],
    [K.s8, 22, 8, 32, 0, 4.4, 0],
    [K.dur + 2, 30, 8, 26, 0, 3.8, 0],
  ]);
  const col = new THREE.Color(), cT = new THREE.Color(TOSCA), cL = new THREE.Color(LIME), cO = new THREE.Color(ORG), cW = new THREE.Color(WHITE);
  const pulses = [];
  { const r2 = mulberry(7); for (let i = 0; i < 12; i++) pulses.push(Math.floor(r2() * N)); }

  return (t) => {
    const crush = 1 - ramp(t, K.s2 - .5, K.s2 + 1.2);       // hook: all squeezed into the ring
    const rush = smooth(clamp01(t / 2.6));
    const dim = 1 - .55 * ramp(t, K.s3 - .5, K.s3 + .4) * (1 - ramp(t, a7, a7 + 1.5));
    const wave = (t - a7) * 9;
    const rot = t * .05;
    for (let i = 0; i < N; i++) {
      const s = shell[i], l = loose[i];
      const inR = 3.2 * (seedA[i] * .9 + .1);
      const ang = i * 2.399963 + t * .6;
      const rx = Math.cos(ang) * inR, ry = Math.sin(ang) * inR, rz = (seedA[(i * 7) % N] - .5) * 2.2;
      const u = smooth(clamp01(rush * 1.6 - seedA[i] * .6));
      let x = l.x + (rx - l.x) * u, y = l.y + (ry - l.y) * u, z = l.z + (rz - l.z) * u;
      const cx = Math.cos(rot), sx = Math.sin(rot);
      const qx = s.x * cx - s.z * sx, qz = s.x * sx + s.z * cx;
      const e = 1 - crush;
      x += (qx - x) * e; y += (s.y - y) * e; z += (qz - z) * e;
      P.pos[i * 3] = x + CENTER.x; P.pos[i * 3 + 1] = y + CENTER.y; P.pos[i * 3 + 2] = z + CENTER.z;
      // Overflow turns the points orange in the hook.
      const over = ramp(t, AT["s1:penuh"] - .8, AT["s1:penuh"]) * crush;
      col.copy(cT).lerp(cO, over * .9);
      const d = Math.hypot(s.x, s.y + 7, s.z);
      if (t > a7) col.lerp(cL, clamp01(1 - Math.abs(d - wave) / 3) + (wave > 18 ? .55 : 0));
      col.multiplyScalar(dim);
      P.col[i * 3] = col.r; P.col[i * 3 + 1] = col.g; P.col[i * 3 + 2] = col.b;
    }
    // Claude searches: a few chosen skills flare in turn during the explanation.
    const sA = AT["s2:mencari"], sB = K.s3;
    if (t > sA && t < sB) pulses.forEach((p, i) => { const on = clamp01(1 - Math.abs(t - sA - i * .28) / .4); const lit = t > sA + i * .28 ? .75 : 0; const v = Math.max(on * 3, lit); P.col[p * 3] = v * cW.r; P.col[p * 3 + 1] = v; P.col[p * 3 + 2] = v * .4; });
    P.m.size = .34 + .12 * crush;
    P.commit();
    links.material.opacity = .22 * ramp(t, K.s2, K.s2 + 1.2) * dim;
    links.rotation.y = -rot;

    const shk = crush * ramp(t, AT["s1:penuh"] - .6, AT["s1:penuh"]) * (t < K.s2 ? 1 : 0);
    ring.scale.setScalar((1 + .05 * Math.sin(t * 42) * shk) * (1 - .6 * ramp(t, K.s2, K.s2 + 1)));
    ring.material.color.copy(cW).lerp(cO, shk);
    ring.material.opacity = 1 - ramp(t, K.s3 - 1, K.s3);
    const hide = ramp(t, K.s3 - .6, K.s3 + .2) * (1 - ramp(t, a5, a5 + .9));
    core.scale.setScalar(Math.max(.001, (1 - hide) * (.9 + .1 * Math.sin(t * 2))));
    core.rotation.set(t * .2, t * .3, 0);
    core.material.emissiveIntensity = t > a7 ? .75 + 1.1 * ramp(t, a7, a7 + .5) : .75;

    // Folder + clone stream
    const fIn = back(clamp01((t - K.s3 - .2) / .5), 1.3) * (1 - ramp(t, K.s5 - .4, K.s5 + .2));
    folder.scale.setScalar(Math.max(.001, fIn)); folder.position.set(0, .2, 0); folder.visible = fIn > .01; folder.rotation.y = Math.sin(t * .4) * .16;
    for (let i = 0; i < 240; i++) {
      const ph = ((t * (.5 + (i % 7) * .05) + i * .137) % 1);
      const act = t > a3 && t < K.s4 + .4;
      packets.pos[i * 3] = act ? (Math.sin(i * 12.9) * 2.6 * (1 - ph * .6)) : 0;
      packets.pos[i * 3 + 1] = act ? 15 - ph * 13.5 : -40;
      packets.pos[i * 3 + 2] = act ? Math.cos(i * 7.3) * .7 - .2 : 0;
    }
    packets.commit();
    // 95 packages, one per moment of the install line.
    const nCube = Math.floor(95 * clamp01((t - a4) / Math.max(.5, AT["s4:Jangan"] - a4)));
    const out = ramp(t, K.s5 - .5, K.s5 + .1);
    for (let i = 0; i < 95; i++) {
      const on = i < nCube && out < 1;
      const row = i % 16, lay = Math.floor(i / 16);
      dummy.position.set(-2.55 + row * .34, 4.15 + lay * .42 - out * 3, .1 + (i % 2) * .1);
      dummy.rotation.set(0, i * .3 * out, 0);
      dummy.scale.setScalar(on ? 1 : .0001);
      dummy.updateMatrix(); cubes.setMatrixAt(i, dummy.matrix);
    }
    cubes.instanceMatrix.needsUpdate = true;

    // Plug seats on "claude mcp add".
    const pv = ramp(t, K.s5 - .1, K.s5 + .6) * 1;
    const seat = ramp(t, a5, a5 + 1.1);
    const bump = t > a5 + 1.1 ? Math.exp(-(t - a5 - 1.1) * 8) * .14 : 0;
    plug.position.set(0, -4 + pv * 1.6 + seat * 2.42 + bump, 0);
    plug.visible = pv > 0;
    socket.visible = sockGlow.visible = t > K.s5 - .4;
    sockGlow.material.color.copy(cO).lerp(cL, ramp(t, a5 + 1.05, a5 + 1.3));
    const cp = cable.geometry.attributes.position;
    for (let i = 0; i < 40; i++) { const u = i / 39; cp.setXYZ(i, plug.position.x + Math.sin(u * 3.3) * 3 * u, plug.position.y - .75 - u * 7, plug.position.z + u * 2); }
    cp.needsUpdate = true; cable.visible = plug.visible;

    // Key: appears for the flag, then covered by the censor bar on the warning.
    const kIn = back(clamp01((t - K.s6 - .1) / .45), 1.5) * (1 - ramp(t, K.s7 - .4, K.s7));
    key.scale.setScalar(Math.max(.001, kIn * .95)); key.position.set(0, 3.3, 6); key.rotation.set(.1, Math.sin(t * .8) * .3, .15);
    const warn = AT["s6:jangan"];
    const bu = ramp(t, warn, warn + .3) * (1 - ramp(t, K.s7 - .4, K.s7));
    bar.scale.set(Math.max(.001, bu), 1, 1); bar.position.set(0, 3.3, 7.2); bar.quaternion.copy(cam.quaternion); bar.visible = bu > 0;

    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
