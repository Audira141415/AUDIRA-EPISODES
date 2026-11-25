// THE POOL: a dusk archipelago orbiting one glowing basin. The camera never leaves its orbit, it only tightens and climbs.
// All geometry is generic and procedural; no Fortnite assets. The pool level and the island share are illustrations of the documented mechanism, not data.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, eout, back, clamp01, track, box, cyl, std } from "./lib3d.js";

const VIO = 0x6c3bff, CYA = 0x29e7ff, GLD = 0xffc83d, MAG = 0xff3d9a;

function island(rnd, r, col, seed) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(r, r * 0.42, r * 0.7, 9, 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (Math.sin(i * 12.9 + seed) * 0.12);
    p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k);
    if (p.getY(i) < 0) p.setY(i, p.getY(i) - Math.abs(Math.sin(i * 4.1 + seed)) * r * 0.45);
  }
  geo.computeVertexNormals();
  const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x3a3160, roughness: 0.85, flatShading: true }));
  rock.castShadow = true;
  g.add(rock);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.03, r, r * 0.12, 9), new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, flatShading: true }));
  top.position.y = r * 0.38;
  g.add(top);
  // small built structures, different per island so they read as different maps
  const mat = std(0xe8ebff, 0.45), glow = new THREE.MeshStandardMaterial({ color: 0x111122, emissive: CYA, emissiveIntensity: 1.6 });
  const n = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.28, d = rnd() * r * 0.62, w = r * (0.14 + rnd() * 0.16), h = r * (0.25 + rnd() * 0.7);
    const b = box(w, h, w, mat, Math.cos(a) * d, r * 0.44 + h / 2, Math.sin(a) * d, g);
    box(w * 1.04, h * 0.1, w * 1.04, glow, b.position.x, b.position.y + h * 0.28, b.position.z, g);
  }
  for (let i = 0; i < 4; i++) {
    const a = rnd() * 6.28, d = r * (0.55 + rnd() * 0.35);
    const tree = new THREE.Mesh(new THREE.ConeGeometry(r * 0.1, r * 0.34, 5), new THREE.MeshStandardMaterial({ color: 0x1fbf9a, flatShading: true, roughness: 0.8 }));
    tree.position.set(Math.cos(a) * d, r * 0.6, Math.sin(a) * d);
    g.add(tree);
  }
  return g;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  const rnd = mulberry(4040);

  // sky dome: indigo to hot horizon band
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: "varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec3 p;void main(){float h=normalize(p).y;vec3 a=vec3(.92,.30,.45),b=vec3(.20,.08,.52),c=vec3(.025,.015,.11);vec3 col=mix(a,b,smoothstep(-.01,.11,h));col=mix(col,c,smoothstep(.08,.34,h));gl_FragColor=vec4(col,1.);}",
  }));
  scene.add(sky);
  scene.fog = new THREE.FogExp2(0x2a1560, 0.0012);
  // stars
  { const n = 900, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = rnd() * 6.28, b = 0.2 + rnd() * 1.2; pos.set([Math.cos(a) * Math.cos(b) * 800, Math.sin(b) * 800, Math.sin(a) * Math.cos(b) * 800], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false }))); }

  // ocean: vertex waves in a shader, driven by a time uniform so every frame is seekable
  const seaU = { t: { value: 0 } };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800, 200, 200), new THREE.ShaderMaterial({
    uniforms: seaU,
    vertexShader: `uniform float t;varying float h;varying vec3 w;void main(){vec3 p=position;float a=sin(p.x*.05+t*.9)*1.5+sin(p.y*.08-t*1.2)*1.1+sin((p.x+p.y)*.13+t*1.7)*.5;p.z=a;h=a;vec4 wp=modelMatrix*vec4(p,1.);w=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
    fragmentShader: `varying float h;varying vec3 w;void main(){float d=length(w.xz);vec3 c=mix(vec3(.02,.015,.12),vec3(.05,.13,.36),smoothstep(-1.5,2.,h));c+=vec3(.95,.35,.55)*.16*smoothstep(150.,800.,d);c+=vec3(.2,.9,1.)*.16*smoothstep(1.9,3.,h);c=mix(c,vec3(.5,.17,.42),smoothstep(300.,850.,d));gl_FragColor=vec4(c,1.);}`,
  }));
  sea.rotation.x = -Math.PI / 2;
  scene.add(sea);

  scene.add(new THREE.HemisphereLight(0xb9a8ff, 0x20104a, 1.5));
  const sun = new THREE.DirectionalLight(0xffb59a, 3.4);
  sun.position.set(-120, 70, 160);
  scene.add(sun);

  // central basin: a tall tank; its gold level is the Engagement Pool
  const pool = new THREE.Group();
  scene.add(pool);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(30, 42, 14, 12), new THREE.MeshStandardMaterial({ color: 0x241a4d, flatShading: true, roughness: 0.6 }));
  base.position.y = 5;
  pool.add(base);
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 44, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0, side: THREE.DoubleSide, depthWrite: false }));
  tank.position.y = 34;
  pool.add(tank);
  const ring = (y, c, i = 2.4) => { const m = new THREE.Mesh(new THREE.TorusGeometry(24.4, 0.5, 8, 60), new THREE.MeshStandardMaterial({ color: 0x111122, emissive: c, emissiveIntensity: i })); m.rotation.x = Math.PI / 2; m.position.y = y; pool.add(m); return m; };
  ring(12, CYA); ring(56, CYA); const lvlRing = ring(30, GLD, 3);
  const gold = new THREE.Mesh(new THREE.CylinderGeometry(23.4, 23.4, 1, 40), new THREE.MeshStandardMaterial({ color: GLD, emissive: 0xff9d1e, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.3 }));
  pool.add(gold);
  const goldL = new THREE.PointLight(GLD, 2600, 170, 1.8);
  pool.add(goldL);

  // funnel over the tank: item shop revenue pours in; 40 of 100 streams are lit, the rest stay behind
  const STREAM = 100;
  const stGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
  const drops = new THREE.InstancedMesh(stGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), STREAM);
  drops.frustumCulled = false;
  const cc = new THREE.Color();
  for (let i = 0; i < STREAM; i++) drops.setColorAt(i, cc.set(i % 5 < 2 ? 0xffd25a : 0x51507a));
  scene.add(drops);
  const shop = new THREE.Group();
  shop.position.set(0, 86, 0);
  scene.add(shop);
  const shopBox = new THREE.Mesh(new THREE.CylinderGeometry(14, 6, 10, 6), new THREE.MeshStandardMaterial({ color: 0x1d1640, emissive: VIO, emissiveIntensity: 0.9, flatShading: true }));
  shop.add(shopBox);
  const shopEpic = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 30), new THREE.MeshStandardMaterial({ color: 0x2a2150, flatShading: true, roughness: 0.7 }));
  shopEpic.position.set(70, 88, -60);
  scene.add(shopEpic);

  // islands on a ring around the tank; pipes light up by share of engagement
  const cols = [0x35d07f, 0xf6b73c, 0xff5f8f, 0x40c4ff, 0xb388ff, 0x7be04a];
  const IS = [];
  const N = 6;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.4, R = 88 + (i % 2) * 22, rad = 17 + (i % 3) * 4;
    const g = island(rnd, rad, cols[i], i * 3.3);
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    g.position.set(x, 18, z);
    scene.add(g);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1, 8), new THREE.MeshStandardMaterial({ color: 0x111122, emissive: GLD, emissiveIntensity: 2.2 }));
    scene.add(pipe);
    IS.push({ g, a, R, x, z, pipe, share: [1, .35, .6, .22, .8, .45][i], rad });
  }
  const epicIs = IS[3]; // the one Epic-owned island, tagged by colour only

  // players as glowing motes that land on islands; island height pulse shows retention
  const PL = 340;
  const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), PL);
  motes.frustumCulled = false;
  const md = [];
  for (let i = 0; i < PL; i++) { md.push({ i: Math.floor(rnd() * N), off: rnd(), sp: 0.12 + rnd() * 0.2, a: rnd() * 6.28, d: 0.3 + rnd() * 0.6, nw: i % 4 === 0 }); motes.setColorAt(i, cc.set(i % 4 === 0 ? 0x7dffb0 : 0x9fe9ff)); }
  scene.add(motes);

  // item crates that orbit the second-act island when item sales arrive
  const crate = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: MAG, emissiveIntensity: 1.1, roughness: 0.4 }), 60);
  crate.frustumCulled = false;
  scene.add(crate);

  // calendar gate for the requirements: 30 pips in a ring
  const pips = new THREE.InstancedMesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: 0xffffff }), 30);
  pips.frustumCulled = false;
  for (let i = 0; i < 30; i++) pips.setColorAt(i, cc.set(0x29e7ff));
  scene.add(pips);

  // camera orbit: angle always advances one way; radius and height carry the story
  const orb = track([
    [0, 0.0, 250, 60, 58],
    [K.s1e, 0.55, 215, 66, 56],
    [K.s2 + 3, 1.0, 195, 52, 50],
    [K.s2e, 1.5, 185, 54, 50],
    [K.s3 + 1, 1.8, 190, 78, 62],
    [K.s3e, 2.5, 180, 74, 60],
    [K.s4 + 1, 2.9, 205, 58, 50],
    [K.s4e, 3.6, 190, 56, 48],
    [K.s5 + 1, 4.0, 178, 50, 46],
    [K.s5e, 5.0, 170, 48, 46],
    [K.s6 + 1, 5.4, 205, 64, 52],
    [K.s6e, 6.2, 220, 70, 54],
    [K.s7 + 1.2, 6.5, 320, 120, 70],
    [K.s7e, 7.0, 380, 140, 74],
    [K.s8 + 2, 7.4, 245, 66, 58],
    [K.dur, 8.0, 225, 60, 56],
  ]);
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 1, 2000);

  const composer = new EffectComposer(r);
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.24, 0.5, 0.86));
  composer.addPass(new OutputPass());

  const m = new THREE.Matrix4(), v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), qa = new THREE.Quaternion();
  const put = (im, i, x, y, z, s) => { m.makeScale(s, s, s).setPosition(x, y, z); im.setMatrixAt(i, m); };

  return function draw(t) {
    seaU.t.value = t;
    const [ang, rad, cy, ly] = orb(t);
    // first frame: the tank sits close enough to read, framing the hook
    cam.position.set(Math.cos(ang) * rad, cy, Math.sin(ang) * rad);
    cam.lookAt(0, ly, 0);

    // pool: level climbs as the 40 percent pours in, drains a little through the pipes while payouts run
    const pourA = AT["s3:40"], fill = ramp(t, pourA - 0.2, pourA + 3.2);
    const drain = ramp(t, K.s4, K.s4 + 7) * 0.26;
    const lvl = 2 + 40 * Math.max(0.06, fill * (1 - drain) + 0.06);
    gold.scale.y = lvl; gold.position.y = 12 + lvl / 2;
    lvlRing.position.y = 12 + lvl;
    goldL.position.set(0, 12 + lvl + 10, 0);
    goldL.intensity = 200 + 800 * fill;
    gold.material.emissiveIntensity = 0.5 + Math.sin(t * 2.2) * 0.06;

    // drops fall from the shop to the tank during s3; only 2 of 5 enter, the others peel off toward Epic operations
    const onDrop = t > K.s3 - 0.5 && t < K.s4 + 1;
    drops.visible = shop.visible = shopEpic.visible = t > K.s3 - 2 && t < K.s4 + 2;
    if (onDrop) {
      for (let i = 0; i < STREAM; i++) {
        const u = ((t * 0.55 + i / STREAM * 3) % 1);
        const a = i * 2.4, rr = 2 + (i % 7) * 1.1;
        const toTank = i % 5 < 2;
        const live = ramp(t, AT["s3:40"] - 0.8, AT["s3:40"] - 0.4);
        if (toTank) put(drops, i, Math.cos(a) * rr, 80 - u * 50, Math.sin(a) * rr, live);
        else put(drops, i, Math.cos(a) * rr + u * 70, 82 + Math.sin(u * 3.14) * 5, Math.sin(a) * rr - u * 60, live);
      }
      drops.instanceMatrix.needsUpdate = true;
    }

    // islands: bob on seek-safe sines; pipe swells with its share when the formula is on screen
    const showPipes = ramp(t, K.s3 + 2.4, K.s3 + 4);
    const sharePump = ramp(t, K.s4, K.s4 + 1);
    IS.forEach((o, i) => {
      const y = 18 + Math.sin(t * 0.55 + i * 1.7) * 1.4;
      o.g.position.y = y;
      o.g.rotation.y = t * 0.04 * (i % 2 ? 1 : -1);
      // pipe from tank rim to island edge
      v.set(o.x, y + 2, o.z);
      const from = new THREE.Vector3(Math.cos(o.a) * 25, Math.min(12 + lvl * 0.5, 34), Math.sin(o.a) * 25);
      const dir = v.clone().sub(from), len = dir.length();
      o.pipe.position.copy(from).addScaledVector(dir, 0.5);
      qa.setFromUnitVectors(up, dir.normalize());
      o.pipe.quaternion.copy(qa);
      const w = 0.35 + (1.7 * o.share) * sharePump;
      o.pipe.scale.set(w * showPipes + 0.001, len, w * showPipes + 0.001);
      o.pipe.material.emissiveIntensity = 0.7 + 0.8 * o.share * sharePump;
    });
    // Epic's own island glows violet to mark that it competes for the same pool
    epicIs.g.children[1].material.emissive = new THREE.Color(VIO);
    epicIs.g.children[1].material.emissiveIntensity = 1.4 * ramp(t, AT["s3:Island"], AT["s3:Island"] + 0.6);

    // players: stream to islands from word "pemain" onward; green ones are the new players
    const showM = ramp(t, AT["s2:pemain"] - 0.4, AT["s2:pemain"] + 1.2);
    for (let i = 0; i < PL; i++) {
      const d = md[i], o = IS[d.i], u = (t * d.sp + d.off) % 1;
      const ca = o.a + d.a * 0.05;
      const x = o.x + Math.cos(d.a + t * 0.3) * o.rad * d.d, z = o.z + Math.sin(d.a + t * 0.3) * o.rad * d.d;
      const sx = Math.cos(ca) * 260, sz = Math.sin(ca) * 260;
      const land = eout(u * 1.8);
      const yy = 30 + Math.sin(u * Math.PI) * 8;
      const nb = d.nw ? ramp(t, AT["s4:pemain#2"], AT["s4:pemain#2"] + 0.8) : 1;
      put(motes, i, sx + (x - sx) * land, yy, sz + (z - sz) * land, Math.max(0.001, showM * nb * (d.nw ? 0.75 : 0.5)));
    }
    motes.instanceMatrix.needsUpdate = true;

    // item crates orbit the hero island during s5
    const cOn = ramp(t, AT["s5:item"], AT["s5:item"] + 0.8) * (1 - ramp(t, K.s6 - 0.2, K.s6 + 0.8));
    crate.visible = cOn > 0;
    if (cOn > 0) {
      const o = IS[0];
      for (let i = 0; i < 60; i++) {
        const a = i * 0.7 + t * 0.7, rr = o.rad * (1.15 + (i % 5) * 0.14), yy = o.g.position.y + 12 + (i % 7) * 2.6 + Math.sin(t + i) * 1.2;
        m.makeRotationY(a + t).scale(v.setScalar(cOn * 0.8)).setPosition(o.x + Math.cos(a) * rr, yy, o.z + Math.sin(a) * rr);
        crate.setMatrixAt(i, m);
      }
      crate.instanceMatrix.needsUpdate = true;
    }

    // 30 pips light in order on "30 hari", counting the wait before payout
    const pOn = ramp(t, AT["s6:30"] - 0.2, AT["s6:30"] + 0.2) * (1 - ramp(t, K.s7, K.s7 + 0.8));
    pips.visible = pOn > 0;
    if (pOn > 0) {
      const lit = clamp01((t - AT["s6:30"]) / 2.2) * 30;
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * 6.283;
        put(pips, i, Math.cos(a) * 34, 62, Math.sin(a) * 34, pOn * (i < lit ? 1.4 : 0.5));
        pips.setColorAt(i, cc.set(i < lit ? GLD : 0x4a4a7a));
      }
      pips.instanceMatrix.needsUpdate = true;
      pips.instanceColor.needsUpdate = true;
    }

    composer.render();
  };
}
