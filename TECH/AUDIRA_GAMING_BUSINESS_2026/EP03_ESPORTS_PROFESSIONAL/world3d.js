// THE BOWL: one stadium, one forward push. The camera starts in the back of the crowd and only ever moves deeper, ending at a single empty desk.
// Generic arena built from primitives; no team, league or game assets. LED wall bars carry the same numbers as the HUD.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, box, cyl, std } from "./lib3d.js";

const ICE = 0xdff1ff, MAG = 0xff1f6b, AMB = 0xffb020;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03040a);
  scene.fog = new THREE.FogExp2(0x070a18, 0.0048);
  const rnd = mulberry(5680);
  const cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.5, 900);

  const wl = new THREE.PointLight(0x8fb0ff, 9000, 420, 1.6); wl.position.set(0, 46, -80); scene.add(wl);
  scene.add(new THREE.HemisphereLight(0x5a6ea8, 0x0a0c18, 1.5));

  // floor, reflective enough to catch the wall
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 620), new THREE.MeshStandardMaterial({ color: 0x0b0d16, roughness: 0.62, metalness: 0.3 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -60;
  scene.add(floor);

  // stage at z = -120
  const stage = new THREE.Group();
  stage.position.z = -120;
  scene.add(stage);
  box(120, 5, 44, std(0x11131e, 0.4, 0.5), 0, 2.5, 6, stage);
  const edge = box(120.4, 0.6, 0.4, new THREE.MeshStandardMaterial({ color: 0x111111, emissive: MAG, emissiveIntensity: 3 }), 0, 5, 28.3, stage);
  // LED wall: canvas redrawn only when its act changes, so seeks stay deterministic and cheap
  const WALLW = 1024, WALLH = 1024;
  const wc = document.createElement("canvas"); wc.width = WALLW; wc.height = WALLH;
  const wg = wc.getContext("2d");
  const wtex = new THREE.CanvasTexture(wc); wtex.colorSpace = THREE.SRGBColorSpace;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(72, 72), new THREE.MeshBasicMaterial({ map: wtex, color: 0xffffff, toneMapped: false, fog: false }));
  wall.position.set(0, 47, -14);
  stage.add(wall);
  box(76, 76, 2, std(0x0a0b12, 0.5, 0.6), 0, 47, -15.4, stage);

  // five desks, each with a monitor glow and a seated figure
  const figs = [];
  const figM = std(0x171a28, 0.6), screenM = () => new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0x57d4ff, emissiveIntensity: 1.1 });
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    g.position.set((i - 2) * 19, 5, 8);
    box(14, 0.8, 6, std(0x1a1d2c, 0.4, 0.6), 0, 5, 0, g);
    box(1, 5, 1, std(0x1a1d2c, 0.5, 0.5), -5.5, 2.5, 0, g); box(1, 5, 1, std(0x1a1d2c, 0.5, 0.5), 5.5, 2.5, 0, g);
    const sc = box(9, 5, 0.4, screenM(), 0, 8.8, -1.6, g);
    const body = new THREE.Group();
    body.position.set(0, 0, 5);
    box(3.8, 5, 2.4, figM, 0, 7, 0, body);
    cyl(1.25, 1.25, 2.6, 16, std(0x2b2f42, 0.5), 0, 10.8, 0, body);
    box(4.4, 0.7, 0.7, std(0x05060a, 0.3), 0, 11.8, 0, body);
    box(4.4, 6, 1, std(0x0d0f18, 0.5), 0, 6.5, 1.8, body);
    g.add(body);
    stage.add(g);
    figs.push({ g, body, sc });
  }
  // trophy on a plinth at front of stage, scales to the prize story
  const trophy = new THREE.Group();
  trophy.position.set(0, 5, 22);
  stage.add(trophy);
  const gld = new THREE.MeshStandardMaterial({ color: 0xffc95a, metalness: 0.85, roughness: 0.42, emissive: 0x6a4600, emissiveIntensity: 0.5 });
  cyl(3.4, 4.2, 3, 8, std(0x12141f, 0.3, 0.8), 0, 1.5, 0, trophy);
  const pts = [[0.2, 0], [1.6, 0.4], [0.6, 1.4], [0.5, 3], [1.2, 4], [3.2, 7], [3.6, 10], [3.2, 10.2], [2.5, 7.5], [0.2, 5]].map(([a, b]) => new THREE.Vector2(a, b));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), gld);
  cup.position.y = 3;
  trophy.add(cup);

  // volumetric cones: additive shells, intensity follows the act
  const beamMat = (c) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { c: { value: new THREE.Color(c) }, a: { value: 0.3 } },
    vertexShader: "varying float v;varying vec3 n;varying vec3 vd;void main(){v=uv.y;n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vd=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 c;uniform float a;varying float v;varying vec3 n;varying vec3 vd;void main(){float f=pow(abs(dot(n,vd)),2.4);gl_FragColor=vec4(c,a*f*pow(v,1.6));}",
  });
  const beams = [];
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, c = i % 4 === 0 ? MAG : i % 4 === 2 ? AMB : ICE;
    const geo = new THREE.ConeGeometry(24, 150, 28, 1, true);
    geo.translate(0, -75, 0);
    const m = new THREE.Mesh(geo, beamMat(c));
    m.position.set(side * (14 + i * 7), 126, -150 + i * 13);
    m.frustumCulled = false;
    scene.add(m);
    beams.push({ m, side, ph: i * 0.9, c });
  }
  // rig truss
  for (let i = 0; i < 4; i++) box(240, 2, 2, std(0x1c2030, 0.5, 0.7), 0, 128, -150 + i * 46, scene);

  // crowd: one instanced mesh of seated heads and phone lights on stepped tiers wrapping the floor
  const CN = 5200;
  const crowd = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), CN);
  const cd = [];
  const m4 = new THREE.Matrix4(), cc = new THREE.Color();
  for (let i = 0; i < CN; i++) {
    const row = Math.floor(rnd() * 24), s = rnd();
    // central floor block behind the camera path plus side tiers
    let x, z, y;
    if (i % 3 === 0) { x = (s - 0.5) * 130; z = -70 + rnd() * 260; y = 2.2; }
    else { const side = i % 3 === 1 ? 1 : -1; x = side * (74 + row * 4.6); z = -130 + s * 300; y = 3 + row * 2.5; }
    cd.push({ x, y, z, ph: rnd() * 6.28, s: 0.9 + rnd() * 0.5 });
    m4.makeScale(1.1, 1.3, 1.1).setPosition(x, y, z);
    crowd.setMatrixAt(i, m4);
    crowd.setColorAt(i, cc.setHSL(0.62, 0.2, 0.2 + rnd() * 0.22));
  }
  crowd.frustumCulled = false;
  scene.add(crowd);
  const PHN = 900;
  const phones = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 1.5), new THREE.MeshBasicMaterial({ color: 0xcfe9ff, side: THREE.DoubleSide, toneMapped: false }), PHN);
  phones.frustumCulled = false;
  const phd = [];
  for (let i = 0; i < PHN; i++) { const c = cd[Math.floor(rnd() * CN)]; phd.push({ x: c.x + 0.4, y: c.y + 2, z: c.z - 0.6, ph: rnd() * 6.28, d: rnd() }); }
  scene.add(phones);

  // solo desk: small room-scale prop at the end of the film, the question of the last scene
  const solo = new THREE.Group();
  solo.position.set(0, 0, -300);
  scene.add(solo);

  // --- LED wall content, one painter per act ---
  const mono = "bold 60px 'JetBrains Mono', monospace";
  const disp = "400 170px 'Archivo Black', sans-serif";
  const bars = (rows, unit) => {
    const max = Math.max(...rows.map((x) => x[1]));
    return (u) => {
      rows.forEach(([n, v, c], i) => {
        const y = 170 + i * 200, w = 900 * (v / max) * clamp01(u * 1.3 - i * 0.14);
        wg.fillStyle = "#121829"; wg.fillRect(62, y, 900, 110);
        wg.fillStyle = c; wg.fillRect(62, y, w, 110);
        wg.fillStyle = "#fff"; wg.font = "bold 46px 'JetBrains Mono', monospace"; wg.textAlign = "left"; wg.fillText(n, 62, y - 18);
        wg.textAlign = "right"; wg.fillText(unit(v), 962, y - 18);
      });
    };
  };
  const paintHero = (txt, sub, col) => () => {
    wg.fillStyle = col; wg.textAlign = "center"; wg.font = disp; wg.fillText(txt, 512, 470);
    wg.fillStyle = "#cfe1ff"; wg.font = mono; wg.fillText(sub, 512, 590);
  };
  const breakdown = bars([["TURNAMEN", 39, "#FF1F6B"], ["KLUB", 30, "#FFB020"], ["KUALIFIKASI", 6, "#7CC4FF"]], (v) => "$" + v + "M");
  const games = bars([["COUNTER-STRIKE 2", 64.9, "#FFB020"], ["VALORANT", 42.2, "#FF1F6B"], ["MOBILE LEGENDS", 24.5, "#7CC4FF"], ["FREE FIRE", 23.3, "#7BE495"]], (v) => "$" + v.toFixed(1).replace(".", ",") + "M");
  const pie = (u) => {
    const cx = 512, cy = 512, R = 340, a0 = -Math.PI / 2;
    wg.fillStyle = "#121829"; wg.beginPath(); wg.arc(cx, cy, R, 0, 6.3); wg.fill();
    wg.fillStyle = "#FFB020"; wg.beginPath(); wg.moveTo(cx, cy); wg.arc(cx, cy, R, a0, a0 + 6.283 * 0.2 * clamp01(u * 2)); wg.fill();
    const k = clamp01(u * 2 - 1);
    for (let i = 0; i < 5; i++) { wg.fillStyle = i % 2 ? "#FF1F6B" : "#D11257"; wg.beginPath(); wg.moveTo(cx, cy); const s = a0 + 6.283 * (0.2 + 0.16 * i); wg.arc(cx, cy, R, s, s + 6.283 * 0.16 * k); wg.fill(); }
  };
  const salary = bars([["RATA-RATA", 240, "#FFB020"], ["MEDIAN", 165, "#FF1F6B"], ["ROOKIE", 115, "#7CC4FF"]], (v) => "€" + v + "K");
  const ind = (u) => {
    wg.fillStyle = "#fff"; wg.textAlign = "center"; wg.font = "400 150px 'Archivo Black', sans-serif"; wg.fillText("$" + (22.5 * eout(u * 1.4)).toFixed(1).replace(".", ",") + "M", 512, 340);
    wg.font = mono; wg.fillStyle = "#cfe1ff"; wg.fillText("INDONESIA, TOTAL", 512, 430);
    wg.fillStyle = "#121829"; wg.fillRect(62, 590, 900, 90);
    wg.fillStyle = "#FF1F6B"; wg.fillRect(62, 590, 900 * (1.1 / 22.5) * clamp01(u * 2 - 0.7), 90);
    wg.fillStyle = "#fff"; wg.font = "bold 50px 'JetBrains Mono', monospace"; wg.fillText("#1 WHITEMON $1,1M", 512, 770);
  };
  const acts = [
    [0, 0.8, paintHero("$75M", "PRIZE POOL", "#FFB020")],
    [K.s2, 3.5, breakdown],
    [K.s3, 4.5, games],
    [K.s4, 0.8, paintHero("5,68M", "PENONTON PUNCAK M7", "#7CC4FF")],
    [AT["s4:Hadiahnya"], 0.5, paintHero("$1M", "HADIAH M7", "#FFB020")],
    [K.s5, 2.4, pie],
    [K.s6, 0.5, () => {}],
  ];
  let lastKey = "";
  function paint(t) {
    let act = acts[0];
    for (const x of acts) if (t >= x[0]) act = x;
    const u = clamp01((t - act[0]) / act[1]);
    const key = act[0] + ":" + (u >= 1 ? 1 : u.toFixed(3));
    if (key === lastKey) return;
    lastKey = key;
    wg.fillStyle = "#04060e"; wg.fillRect(0, 0, WALLW, WALLH);
    wg.fillStyle = "#0c1020"; for (let i = 0; i < WALLW; i += 16) { wg.fillRect(i, 0, 1, WALLH); wg.fillRect(0, i, WALLW, 1); }
    act[2](u);
    wtex.needsUpdate = true;
  }

  // the push: z only decreases. Height dips for the desks, then climbs for the wall.
  const path = track([
    [0, 0, 20, 205, 0, 40, -134],
    [K.s1e, 0, 20, 186, 0, 40, -134],
    [K.s2e, -5, 20, 166, 0, 40, -134],
    [K.s3e, 5, 20, 150, 1, 41, -134],
    [K.s4e, 1, 18, 134, 0, 41, -134],
    [K.s5e, -2, 20, 112, 0, 41, -134],
    [K.s6 + 1.4, -30, 26, -6, -5, 20, -112],
    [K.s6e, -24, 26, -22, -2, 21, -112],
    [K.s7 + 1, 14, 26, -30, 2, 21, -112],
    [K.s7e, 8, 26, -40, 2, 21, -112],
    [K.s8 + 1.6, -13, 22, -54, 0, 18, -112],
    [K.dur, -16, 20, -64, 0, 18, -112],
  ]);

  const composer = new EffectComposer(r);
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.42, 0.55, 0.8));
  composer.addPass(new OutputPass());
  const mo = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3();

  return function draw(t) {
    const [cx, cy, cz, lx, ly, lz] = path(t);
    cam.position.set(cx, cy, cz);
    cam.lookAt(lx, ly, lz);
    paint(t);

    // beams sweep with film time; they tighten on the numbers and kill on the salary scene
    const dim = 1 - 0.62 * ramp(t, K.s5, K.s5 + 1.2) * (1 - ramp(t, K.s8, K.s8 + 1.5));
    const hit = Math.exp(-Math.max(0, t - AT["s4:5,68"]) * 2.4) * (t >= AT["s4:5,68"] ? 1 : 0);
    for (const b of beams) {
      b.m.rotation.z = Math.sin(t * 0.5 + b.ph) * 0.34 + b.side * 0.1;
      b.m.rotation.x = Math.cos(t * 0.37 + b.ph) * 0.2;
      b.m.material.uniforms.a.value = (0.15 + 0.4 * hit) * dim;
    }
    edge.material.emissiveIntensity = 2 + 3.4 * hit;

    // crowd lifts with the viewer number, a seek-safe wave
    const lift = ramp(t, AT["s4:5,68"] - 0.2, AT["s4:5,68"] + 0.4) * (1 - ramp(t, AT["s4:Hadiahnya"], AT["s4:Hadiahnya"] + 1));
    for (let i = 0; i < CN; i += 1) {
      const c = cd[i];
      const y = c.y + Math.max(0, Math.sin(t * 2.2 + c.ph)) * (0.25 + 1.6 * lift);
      mo.makeScale(1.7, 2.3, 1.7).setPosition(c.x, y, c.z);
      crowd.setMatrixAt(i, mo);
    }
    crowd.instanceMatrix.needsUpdate = true;
    const phoneOn = 0.25 + 0.75 * ramp(t, AT["s4:5,68"] - 0.2, AT["s4:5,68"] + 0.5);
    for (let i = 0; i < PHN; i++) {
      const p = phd[i], on = p.d < phoneOn;
      e.set(0, Math.sin(p.ph) * 0.5, 0); q.setFromEuler(e); pos.set(p.x, on ? p.y + Math.sin(t * 1.4 + p.ph) * 0.2 : -50, p.z); sc.setScalar(1);
      mo.compose(pos, q, sc);
      phones.setMatrixAt(i, mo);
    }
    phones.instanceMatrix.needsUpdate = true;

    // trophy rotates and is the only thing lit in the first act
    trophy.rotation.y = t * 0.5;
    wl.intensity = 9000 * (1 - 0.75 * ramp(t, K.s6 - 1, K.s6 + 1));
    // desks: a figure dims off one by one from the salary scene on; on the last scene one desk remains lit
    figs.forEach((f, i) => {
      f.body.rotation.x = Math.sin(t * 3 + i * 1.4) * 0.02;
      const off = i === 2 ? 0 : ramp(t, K.s7 + 0.3 + i * 0.2, K.s7 + 0.8 + i * 0.2);
      f.sc.material.emissiveIntensity = 1.1 * (1 - off);
      f.body.visible = off < 1;
      f.sc.material.emissive.setHex(i === 2 && t > K.s8 ? MAG : 0x57d4ff);
    });
    composer.render();
  };
}
