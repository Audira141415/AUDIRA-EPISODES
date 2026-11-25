// EP42 INFLATABLE smoke detector: bouncy PVC dome, colorful ion balls, puffy Am-241 source.
// Palette: coral #FF6B8A, mint #7EEDC6, yellow #FFD166, sky #B8E8FF, purple-ink #2D1B4E
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { track, stage } from "./lib3d.js";

const NanGuard = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=any(isnan(c))||any(isinf(c))?vec4(0.72,0.91,1.0,1.0):c;}`
};
const Grade = {
  uniforms: { tDiffuse: { value: null }, vig: { value: 0.25 }, gr: { value: 0.03 } },
  vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float vig;uniform float gr;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 q=vUv-0.5;float v=1.0-dot(q,q)*vig;c.rgb*=v;c.rgb+=gr*(fract(sin(dot(vUv,vec2(12.9898,78.233)))*43758.5453)-0.5);gl_FragColor=c;}`
};

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, {
    bg: 0xb8e8ff, fog: 0.012, exp: 1.15, bloom: [0.18, 0.4, 0.92]
  });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));

  // --- colors ---
  const CORAL = 0xff6b8a, MINT = 0x7eedc6, YELLOW = 0xffd166, SKY = 0xb8e8ff;
  const PURPLE = 0x2d1b4e, WHITE = 0xffffff, PINK = 0xff8fab;

  // --- lights ---
  const amb = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(amb);
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(6, 12, 8);
  scene.add(sun);
  const rim = new THREE.PointLight(CORAL, 1.2, 30);
  rim.position.set(-5, 4, -4);
  scene.add(rim);

  // --- materials ---
  const vinyl = (c, rough = 0.25) => new THREE.MeshPhysicalMaterial({
    color: c, roughness: rough, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.08,
    sheen: 0.4, sheenColor: new THREE.Color(0xffffff)
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xddffff, roughness: 0.05, metalness: 0, transmission: 0.7,
    thickness: 0.5, clearcoat: 1.0, ior: 1.35, transparent: true, opacity: 0.6
  });

  // --- dome (smoke detector body) ---
  const domeG = new THREE.SphereGeometry(4.5, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const dome = new THREE.Mesh(domeG, vinyl(WHITE, 0.2));
  dome.position.set(0, 0, 0);
  scene.add(dome);
  const baseG = new THREE.CylinderGeometry(4.8, 4.8, 0.35, 48);
  const base = new THREE.Mesh(baseG, vinyl(0xf0f0f0, 0.3));
  base.position.set(0, -0.18, 0);
  scene.add(base);
  const ringG = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
  const ring = new THREE.Mesh(ringG, vinyl(CORAL));
  ring.position.set(0, 4.0, 0);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // --- ionization chamber (transparent dome inside) ---
  const chamberG = new THREE.SphereGeometry(2.4, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const chamber = new THREE.Mesh(chamberG, glass);
  chamber.position.set(0, 0.5, 0);
  scene.add(chamber);

  // --- plates (+ and -) ---
  const plateG = new THREE.BoxGeometry(2.6, 0.15, 2.6);
  const platePlus = new THREE.Mesh(plateG, vinyl(CORAL));
  platePlus.position.set(0, 2.6, 0);
  scene.add(platePlus);
  const plateMinus = new THREE.Mesh(plateG, vinyl(MINT));
  plateMinus.position.set(0, 0.5, 0);
  scene.add(plateMinus);
  const makeTxt = (txt, c, px, py, pz) => {
    const cv = document.createElement("canvas");
    cv.width = 128; cv.height = 64;
    const cx = cv.getContext("2d");
    cx.fillStyle = "#00000000"; cx.fillRect(0, 0, 128, 64);
    cx.font = "bold 52px Arial"; cx.fillStyle = c; cx.textAlign = "center";
    cx.fillText(txt, 64, 48);
    const tx = new THREE.CanvasTexture(cv);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true }));
    sp.position.set(px, py, pz); sp.scale.set(1.0, 0.5, 1);
    scene.add(sp);
    return sp;
  };
  makeTxt("+", "#ff3366", 1.8, 2.9, 1.4);
  makeTxt("−", "#22aa88", 1.8, 0.8, 1.4);

  // --- Am-241 source (puffy glowing pellet) ---
  const amG = new THREE.SphereGeometry(0.45, 24, 24);
  const amMat = vinyl(YELLOW, 0.15);
  amMat.emissive = new THREE.Color(0xffaa00);
  amMat.emissiveIntensity = 0.6;
  const am241 = new THREE.Mesh(amG, amMat);
  am241.position.set(0, 1.5, 0);
  scene.add(am241);
  const glowG = new THREE.TorusGeometry(0.65, 0.08, 12, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: YELLOW, transparent: true, opacity: 0.5 });
  const glow = new THREE.Mesh(glowG, glowMat);
  glow.position.copy(am241.position);
  glow.rotation.x = Math.PI / 2;
  scene.add(glow);

  // --- alpha particles (bouncing balls) ---
  const alphas = [];
  for (let i = 0; i < 12; i++) {
    const aG = new THREE.SphereGeometry(0.12, 16, 16);
    const a = new THREE.Mesh(aG, vinyl(i % 2 === 0 ? YELLOW : 0xffaa33, 0.1));
    a.position.copy(am241.position);
    a.userData = {
      vel: new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3),
      born: K.s3 + i * 0.4, life: 3 + Math.random() * 2
    };
    a.visible = false;
    scene.add(a);
    alphas.push(a);
  }

  // --- ions (colored spheres: red+ and blue-) ---
  const ions = [];
  for (let i = 0; i < 16; i++) {
    const iG = new THREE.SphereGeometry(0.1, 12, 12);
    const isPos = i % 2 === 0;
    const ion = new THREE.Mesh(iG, vinyl(isPos ? CORAL : MINT, 0.1));
    const angle = (i / 16) * Math.PI * 2;
    const rad = 0.8 + Math.random() * 1.0;
    ion.position.set(Math.cos(angle) * rad, 1.2 + Math.random() * 1.2, Math.sin(angle) * rad);
    ion.userData = { positive: isPos, baseY: ion.position.y, phase: Math.random() * Math.PI * 2 };
    ion.visible = false;
    scene.add(ion);
    ions.push(ion);
  }

  // --- smoke particles ---
  const smokes = [];
  for (let i = 0; i < 20; i++) {
    const sG = new THREE.SphereGeometry(0.18 + Math.random() * 0.15, 12, 12);
    const sMat = new THREE.MeshPhysicalMaterial({
      color: 0x555555, roughness: 0.9, transparent: true, opacity: 0.0
    });
    const s = new THREE.Mesh(sG, sMat);
    s.position.set(
      (Math.random() - 0.5) * 6,
      -1 - Math.random() * 2,
      (Math.random() - 0.5) * 6
    );
    s.userData = { startX: s.position.x, startZ: s.position.z, delay: i * 0.3, speed: 0.3 + Math.random() * 0.3 };
    scene.add(s);
    smokes.push(s);
  }

  // --- current meter (puffy gauge) ---
  const meterG = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 24);
  const meter = new THREE.Mesh(meterG, vinyl(PINK));
  meter.position.set(3.5, 1.5, 0);
  scene.add(meter);
  const needleG = new THREE.BoxGeometry(0.04, 0.45, 0.04);
  const needle = new THREE.Mesh(needleG, new THREE.MeshStandardMaterial({ color: PURPLE }));
  needle.position.set(3.5, 1.7, 0);
  scene.add(needle);

  // --- alarm bell ---
  const bellG = new THREE.SphereGeometry(0.5, 24, 24);
  const bell = new THREE.Mesh(bellG, vinyl(CORAL));
  bell.position.set(-3.5, 2.5, 0);
  bell.visible = false;
  scene.add(bell);
  const bellRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: YELLOW }));
  bellRing.position.copy(bell.position);
  bellRing.rotation.x = Math.PI / 2;
  bellRing.visible = false;
  scene.add(bellRing);

  // --- battery ---
  const battG = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16);
  const batt = new THREE.Mesh(battG, vinyl(YELLOW));
  batt.position.set(2.8, 0.1, 2.5);
  batt.rotation.z = Math.PI / 2;
  scene.add(batt);
  const battCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12), vinyl(CORAL));
  battCap.position.set(3.25, 0.1, 2.5);
  battCap.rotation.z = Math.PI / 2;
  scene.add(battCap);

  // --- AUDIRA brand on detector body ---
  const brandCv = document.createElement("canvas");
  brandCv.width = 512; brandCv.height = 128;
  const bCx = brandCv.getContext("2d");
  bCx.fillStyle = "#00000000"; bCx.fillRect(0, 0, 512, 128);
  bCx.font = "bold 60px Arial"; bCx.fillStyle = "#2D1B4E"; bCx.textAlign = "center";
  bCx.fillText("AUDIRA", 256, 75);
  const brandTx = new THREE.CanvasTexture(brandCv);
  const brandSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: brandTx, transparent: true }));
  brandSp.position.set(0, 3.4, 3.2);
  brandSp.scale.set(3.0, 0.75, 1);
  scene.add(brandSp);
  const brand2Cv = document.createElement("canvas");
  brand2Cv.width = 256; brand2Cv.height = 64;
  const b2x = brand2Cv.getContext("2d");
  b2x.fillStyle = "#00000000"; b2x.fillRect(0, 0, 256, 64);
  b2x.font = "bold 32px Arial"; b2x.fillStyle = "#ff6b8a"; b2x.textAlign = "center";
  b2x.fillText("AUDIRA", 128, 42);
  const brand2Tx = new THREE.CanvasTexture(brand2Cv);
  const brand2Sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: brand2Tx, transparent: true }));
  brand2Sp.position.set(0, -0.3, 5.0);
  brand2Sp.scale.set(1.8, 0.45, 1);
  scene.add(brand2Sp);

  // --- floor (playmat) ---
  const floorG = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8f4ff, roughness: 0.9 });
  const floor = new THREE.Mesh(floorG, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  // --- camera track ---
  const camT = track([
    [0,     0, 5, 14,    0, 1.5, 0],
    [K.s2,  5, 4, 10,    0, 1.5, 0],
    [K.s3,  2, 3, 7,     0, 1.5, 0],
    [K.s4,  0, 2.5, 5,   0, 1.5, 0],
    [K.s5,  -3, 2, 6,    0, 1.5, 0],
    [K.s6,  0, 0.5, 8,   0, 0.5, 0],
    [K.s7,  6, 5, 10,    0, 1.5, 0],
    [K.s8,  0, 5, 13,    0, 1.5, 0],
  ]);

  return function draw(t) {
    const v = camT(t);
    cam.position.set(v[0], v[1], v[2]);
    cam.lookAt(v[3], v[4], v[5]);

    // Am-241 glow pulse
    const pulse = 0.4 + 0.2 * Math.sin(t * 4);
    glow.material.opacity = pulse;
    glow.scale.setScalar(1 + 0.15 * Math.sin(t * 3));
    amMat.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 5);

    // alpha particles: appear after s3, travel outward, bounce
    for (const a of alphas) {
      const age = t - a.userData.born;
      if (age < 0 || age > a.userData.life) { a.visible = false; continue; }
      a.visible = true;
      const bounce = Math.abs(Math.sin(age * 2.5)) * 0.3;
      a.position.set(
        am241.position.x + a.userData.vel.x * age * 0.5,
        am241.position.y + a.userData.vel.y * age * 0.4 + bounce,
        am241.position.z + a.userData.vel.z * age * 0.5
      );
      a.scale.setScalar(0.8 + 0.3 * Math.sin(age * 6));
    }

    // ions: appear after s4, float and drift toward plates after s5
    const ionShow = t >= (AT["s4:ion"] || K.s4);
    const ionDrift = t >= (AT["s5:positif"] || K.s5);
    for (const ion of ions) {
      ion.visible = ionShow;
      if (!ionShow) continue;
      const bob = Math.sin(t * 2 + ion.userData.phase) * 0.15;
      if (ionDrift) {
        const driftStart = AT["s5:positif"] || K.s5;
        const drift = Math.min(1, (t - driftStart) / 4);
        const targetY = ion.userData.positive ? 2.4 : 0.7;
        ion.position.y = ion.userData.baseY + (targetY - ion.userData.baseY) * drift + bob * (1 - drift);
      } else {
        ion.position.y = ion.userData.baseY + bob;
      }
    }

    // smoke: enters after s6, drifts upward into chamber
    const smokeStart = AT["s6:Saat"] || K.s6;
    for (const s of smokes) {
      const age = t - smokeStart - s.userData.delay;
      if (age < 0) { s.material.opacity = 0; continue; }
      const progress = Math.min(1, age * s.userData.speed);
      s.material.opacity = Math.min(0.55, progress * 0.55) * (1 - Math.max(0, progress - 0.7) / 0.3);
      s.position.y = -1 + progress * 3.5;
      s.position.x = s.userData.startX * (1 - progress * 0.7);
      s.position.z = s.userData.startZ * (1 - progress * 0.7);
    }

    // needle: swings based on current (drops when smoke enters)
    const currentDrop = t >= smokeStart ? Math.min(1, (t - smokeStart) / 3) : 0;
    const needleAngle = (0.6 - currentDrop * 0.9) + 0.05 * Math.sin(t * 1.5);
    needle.rotation.z = needleAngle;

    // alarm: flashes after s6:alarm
    const alarmTime = AT["s6:alarm"] || K.s6 + 5;
    if (t >= alarmTime) {
      bell.visible = true;
      bellRing.visible = true;
      const flash = Math.sin((t - alarmTime) * 12) > 0;
      bell.material.emissive = new THREE.Color(flash ? CORAL : 0x000000);
      bell.material.emissiveIntensity = flash ? 0.8 : 0;
      bellRing.scale.setScalar(1 + 0.3 * Math.abs(Math.sin((t - alarmTime) * 8)));
    }

    // dome gentle breathing
    dome.scale.setScalar(1 + 0.008 * Math.sin(t * 1.2));
    chamber.scale.setScalar(1 + 0.012 * Math.sin(t * 1.5 + 1));

    // plates subtle bounce
    platePlus.position.y = 2.6 + 0.04 * Math.sin(t * 2);
    plateMinus.position.y = 0.5 + 0.04 * Math.sin(t * 2 + Math.PI);

    comp.render();
  };
}
