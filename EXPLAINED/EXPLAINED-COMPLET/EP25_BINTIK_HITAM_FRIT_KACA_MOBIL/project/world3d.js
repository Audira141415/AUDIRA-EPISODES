// EP25 BINTIK HITAM FRIT KACA MOBIL — THERMALFORGE
// Ironbow thermal world: car windshield cross-section, frit band, urethane adhesive,
// furnace bending, halftone newspaper, mirror dots. Camera tracks one connected world.
// Every value pure fn(t). No Math.random — mulberry seeded.
import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, ramp, eout, track, box, cyl, std, stage, pts, envStrips, avatar, label, canvasTex, runPose } from "./lib3d.js";

const rng = mulberry(2025);

// Ironbow palette: blue-cold → magenta → orange → yellow → white-hot
const COLD = 0x1a237e, COOL = 0x4a148c, WARM = 0xbf360c, HOT = 0xff8f00, WHITE = 0xfff9c4;
const FLOOR = 0x1a1208, BG = 0x0d0907, GLASS = 0x90caf9, FRIT = 0x212121;
const FRAME_GRAY = 0x37474f, RUBBER = 0x455a64, URETHANE = 0xf57c00;

function ironbow(v) {
  v = clamp01(v);
  const c = new THREE.Color();
  if (v < 0.25) c.lerpColors(new THREE.Color(COLD), new THREE.Color(COOL), v / 0.25);
  else if (v < 0.5) c.lerpColors(new THREE.Color(COOL), new THREE.Color(WARM), (v - 0.25) / 0.25);
  else if (v < 0.75) c.lerpColors(new THREE.Color(WARM), new THREE.Color(HOT), (v - 0.5) / 0.25);
  else c.lerpColors(new THREE.Color(HOT), new THREE.Color(WHITE), (v - 0.75) / 0.25);
  return c;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, {
    bg: BG, fog: 0.012, exp: 1.05, bloom: [0.45, 0.7, 0.88], fov: 38, shadow: true
  });
  bp.threshold = 0.86;

  // environment strips for metallic reflections
  envStrips(r, scene, [
    [30, 6, 0xff6d00, 2.5, 0, 12, -20],
    [20, 4, 0x42a5f5, 1.5, -15, 8, 10],
    [25, 5, 0xffab00, 2, 15, 10, -15],
    [18, 3, 0x80cbc4, 1, 0, -5, 18],
  ], 0x0a0806);

  // warm floor (not black per style note)
  const floorMat = std(0x1a1208, 0.9);
  const floor = box(200, 0.5, 200, floorMat, 0, -0.25, 0, scene);

  // heat scale bar on right edge (world space, always visible)
  const scaleGrp = new THREE.Group();
  for (let i = 0; i < 20; i++) {
    const c = ironbow(i / 19);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.15), new THREE.MeshBasicMaterial({ color: c }));
    m.position.set(6.5, i * 0.5 + 1, 0);
    scaleGrp.add(m);
  }
  const scaleLbl = label("°C", { w: 128, h: 64, font: "700 48px sans-serif", color: "#ff8f00", size: 1.2 });
  scaleLbl.position.set(6.5, 11, 0);
  scaleGrp.add(scaleLbl);

  // --- SET 1: CAR WINDSHIELD (x = 0) ---
  const carGrp = new THREE.Group();
  scene.add(carGrp);

  // windshield glass pane (curved)
  const glassGeo = new THREE.BoxGeometry(8, 10, 0.15, 1, 20, 1);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: GLASS, roughness: 0.05, metalness: 0.1, transmission: 0.6,
    thickness: 0.15, ior: 1.52, transparent: true, opacity: 0.7
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 5.5, 0);
  glass.rotation.x = -0.12;
  carGrp.add(glass);

  // frit band (black strip at top and bottom of windshield)
  const fritTopMat = std(FRIT, 0.95, 0, { emissive: 0x1a0a00, emissiveIntensity: 0.3 });
  const fritTop = box(8, 1.5, 0.18, fritTopMat, 0, 10, 0.02, carGrp);
  const fritBot = box(8, 1.8, 0.18, fritTopMat, 0, 1.2, 0.02, carGrp);

  // halftone dots on frit band (instanced)
  const dotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8);
  const dotMat = std(FRIT, 0.9);
  const dots = new THREE.InstancedMesh(dotGeo, dotMat, 200);
  const dm = new THREE.Matrix4();
  let di = 0;
  for (let row = 0; row < 10; row++) {
    const y = 2.0 + row * 0.18;
    const dotR = 0.06 - row * 0.004;
    for (let col = 0; col < 20; col++) {
      if (di >= 200) break;
      const x = -3.8 + col * 0.4 + (row % 2) * 0.2;
      dm.makeTranslation(x, y, 0.1);
      dm.multiply(new THREE.Matrix4().makeScale(1 - row * 0.06, 1, 1 - row * 0.06));
      dots.setMatrixAt(di, dm);
      di++;
    }
  }
  dots.instanceMatrix.needsUpdate = true;
  carGrp.add(dots);

  // car frame (metal)
  const frameMat = std(FRAME_GRAY, 0.3, 0.8);
  box(9, 0.8, 1, frameMat, 0, 0, -0.4, carGrp);
  box(0.6, 11, 0.6, frameMat, -4.3, 5, -0.2, carGrp);
  box(0.6, 11, 0.6, frameMat, 4.3, 5, -0.2, carGrp);

  // urethane adhesive layer (orange glow)
  const urethaneMat = std(URETHANE, 0.6, 0, { emissive: 0xbf360c, emissiveIntensity: 0.5 });
  box(7.6, 0.3, 0.25, urethaneMat, 0, 0.6, -0.15, carGrp);

  // AUDIRA label in world (brand requirement)
  const audiraLbl = label("AUDIRA", { w: 512, h: 96, font: "700 56px sans-serif", color: "#ff8f00", bg: "rgba(13,9,7,0.85)", size: 3 });
  audiraLbl.position.set(0, 12.5, 0.3);
  carGrp.add(audiraLbl);

  // --- SET 2: RUBBER vs MODERN CROSS-SECTION (x = -18) ---
  const crossGrp = new THREE.Group();
  crossGrp.position.x = -18;
  scene.add(crossGrp);

  // old car: rubber gasket
  const rubberMat = std(RUBBER, 0.85);
  box(4, 6, 0.2, glassMat.clone(), -2.5, 4, 0, crossGrp);
  const rubberSeal = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.12, 8, 16), rubberMat);
  rubberSeal.position.set(-2.5, 0.8, 0);
  rubberSeal.rotation.x = Math.PI / 2;
  rubberSeal.scale.set(8, 1, 3);
  crossGrp.add(rubberSeal);
  box(4.5, 0.6, 1, frameMat, -2.5, 0, -0.3, crossGrp);

  // modern car: urethane adhesive
  box(4, 6, 0.2, glassMat.clone(), 2.5, 4, 0, crossGrp);
  box(3.8, 0.3, 0.2, urethaneMat, 2.5, 0.6, -0.1, crossGrp);
  box(3.8, 0.2, 0.15, fritTopMat, 2.5, 1.1, 0.12, crossGrp);
  box(4.5, 0.6, 1, frameMat, 2.5, 0, -0.3, crossGrp);

  // labels
  const lblOld = label("KARET", { w: 256, h: 80, font: "700 52px sans-serif", color: "#90caf9", bg: "rgba(13,9,7,0.9)", size: 2.5 });
  lblOld.position.set(-2.5, 7.5, 0.3);
  crossGrp.add(lblOld);
  const lblNew = label("URETAN", { w: 256, h: 80, font: "700 52px sans-serif", color: "#ff8f00", bg: "rgba(13,9,7,0.9)", size: 2.5 });
  lblNew.position.set(2.5, 7.5, 0.3);
  crossGrp.add(lblNew);

  // --- SET 3: UV SHIELD (x = -36) ---
  const uvGrp = new THREE.Group();
  uvGrp.position.x = -36;
  scene.add(uvGrp);

  // glass + frit band + UV rays
  box(8, 8, 0.15, glassMat.clone(), 0, 5, 0, uvGrp);
  box(8, 1.5, 0.18, fritTopMat, 0, 1.5, 0.02, uvGrp);
  box(7.6, 0.3, 0.2, urethaneMat, 0, 0.5, -0.1, uvGrp);

  // UV arrows (emissive purple)
  const uvMat = std(0x7c4dff, 0.3, 0, { emissive: 0x7c4dff, emissiveIntensity: 1.5, transparent: true, opacity: 0.7 });
  const uvArrows = [];
  for (let i = 0; i < 6; i++) {
    const arrow = cyl(0.06, 0.06, 3, 8, uvMat, -3 + i * 1.2, 11, 0.5, uvGrp);
    arrow.rotation.z = 0.15;
    uvArrows.push(arrow);
  }
  // blocked arrows (darker, stopped at frit)
  const blockedMat = std(0x311b92, 0.5, 0, { emissive: 0x311b92, emissiveIntensity: 0.4, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 4; i++) {
    cyl(0.05, 0.05, 1, 8, blockedMat, -2 + i * 1.5, 2.8, 0.3, uvGrp);
  }
  const payungLbl = label("PAYUNG UV", { w: 384, h: 80, font: "700 48px sans-serif", color: "#ce93d8", bg: "rgba(13,9,7,0.9)", size: 3 });
  payungLbl.position.set(0, 10, 0.5);
  uvGrp.add(payungLbl);

  // --- SET 4: GRIP + CONCEALMENT (x = -54) ---
  const gripGrp = new THREE.Group();
  gripGrp.position.x = -54;
  scene.add(gripGrp);

  // textured frit surface (rough)
  const roughFrit = std(FRIT, 0.98, 0, { emissive: 0x1a0a00, emissiveIntensity: 0.2 });
  const fritPanel = box(6, 4, 0.2, roughFrit, 0, 3, 0, gripGrp);

  // urethane grabbing onto frit
  const gripUre = box(5.5, 0.5, 0.3, urethaneMat, 0, 1, -0.15, gripGrp);

  // teeth-like grip pattern
  for (let i = 0; i < 8; i++) {
    const tooth = box(0.2, 0.4, 0.15, urethaneMat, -2.5 + i * 0.72, 1.45, 0, gripGrp);
  }
  const gripLbl = label("CENGKERAM", { w: 384, h: 80, font: "700 48px sans-serif", color: "#ff8f00", bg: "rgba(13,9,7,0.9)", size: 2.8 });
  gripLbl.position.set(0, 6, 0.3);
  gripGrp.add(gripLbl);

  // outside view: hidden glue line
  box(6, 6, 0.15, glassMat.clone(), 0, 9, 0, gripGrp);
  const hiddenLbl = label("LEM TERSEMBUNYI", { w: 512, h: 80, font: "700 44px sans-serif", color: "#4fc3f7", bg: "rgba(13,9,7,0.9)", size: 3 });
  hiddenLbl.position.set(0, 13, 0.3);
  gripGrp.add(hiddenLbl);

  // --- SET 5: FURNACE / BENDING (x = -72) ---
  const furnGrp = new THREE.Group();
  furnGrp.position.x = -72;
  scene.add(furnGrp);

  // furnace body
  const furnMat = std(0x424242, 0.7, 0.4);
  box(10, 8, 6, furnMat, 0, 4, -3, furnGrp);
  // glowing interior
  const glowMat = std(0xff6d00, 0.3, 0, { emissive: 0xff6d00, emissiveIntensity: 2 });
  box(8, 6, 0.1, glowMat, 0, 4.5, 0, furnGrp);

  // glass being bent (curved glass slab)
  const bendGeo = new THREE.BoxGeometry(7, 0.2, 3, 20, 1, 1);
  const bendGlass = new THREE.Mesh(bendGeo, glassMat.clone());
  bendGlass.position.set(0, 5, 0);
  furnGrp.add(bendGlass);

  // heat map overlay: frit part hotter (orange) than clear (blue)
  const heatFrit = box(7, 0.25, 0.8, new THREE.MeshBasicMaterial({ color: HOT, transparent: true, opacity: 0.6 }), 0, 5.3, -0.5, furnGrp);
  const heatClear = box(7, 0.25, 1.5, new THREE.MeshBasicMaterial({ color: COLD, transparent: true, opacity: 0.3 }), 0, 5.3, 0.8, furnGrp);

  // sharp vs gradual boundary visualization
  const sharpLine = box(0.08, 3, 0.1, new THREE.MeshBasicMaterial({ color: 0xff1744 }), -2, 5, 1.8, furnGrp);
  const gradDots = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const r = 0.15 - i * 0.01;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.03, r), 8, 8), new THREE.MeshBasicMaterial({ color: ironbow(1 - i / 12) }));
    dot.position.set(2, 4 + i * 0.25, 1.8);
    gradDots.add(dot);
  }
  furnGrp.add(gradDots);
  const sharpLbl = label("TAJAM → DISTORSI", { w: 512, h: 80, font: "700 44px sans-serif", color: "#ff1744", bg: "rgba(13,9,7,0.9)", size: 3 });
  sharpLbl.position.set(-2, 8, 2);
  furnGrp.add(sharpLbl);
  const gradLbl = label("BINTIK → BERTAHAP", { w: 512, h: 80, font: "700 44px sans-serif", color: "#66bb6a", bg: "rgba(13,9,7,0.9)", size: 3 });
  gradLbl.position.set(2, 8, 2);
  furnGrp.add(gradLbl);

  // --- SET 6: HALFTONE / NEWSPAPER (x = -90) ---
  const halfGrp = new THREE.Group();
  halfGrp.position.x = -90;
  scene.add(halfGrp);

  // newspaper page (plane with halftone texture)
  const newsTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f5f0e0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#111";
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 30; x++) {
        const r = 2 + (y / 30) * 6;
        ctx.beginPath();
        ctx.arc(x * 17 + (y % 2) * 8, y * 17, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  const newsPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshStandardMaterial({ map: newsTex, roughness: 0.9 })
  );
  newsPlane.position.set(-3, 6, 0);
  halfGrp.add(newsPlane);

  // car glass halftone comparison
  const carHalfTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#1a237e";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 30; x++) {
        const dist = Math.sqrt((x - 15) ** 2 + (y - 15) ** 2) / 21;
        const r = 7 * (1 - dist);
        if (r > 0.5) {
          ctx.fillStyle = `rgba(33,33,33,${0.9 - dist * 0.5})`;
          ctx.beginPath();
          ctx.arc(x * 17 + (y % 2) * 8, y * 17, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  });
  const carHalf = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshStandardMaterial({ map: carHalfTex, roughness: 0.7, emissive: 0x0d47a1, emissiveIntensity: 0.15 })
  );
  carHalf.position.set(5, 6, 0);
  halfGrp.add(carHalf);

  const htLbl = label("HALFTONE", { w: 384, h: 80, font: "700 52px sans-serif", color: "#fff9c4", bg: "rgba(13,9,7,0.9)", size: 3 });
  htLbl.position.set(1, 12, 0.3);
  halfGrp.add(htLbl);

  // --- SET 7: MIRROR DOTS (x = -108) ---
  const mirrorGrp = new THREE.Group();
  mirrorGrp.position.x = -108;
  scene.add(mirrorGrp);

  // windshield interior view with rearview mirror
  box(10, 8, 0.15, glassMat.clone(), 0, 5, 0, mirrorGrp);
  const mirrorMat = std(0x78909c, 0.1, 0.9);
  const mirror = box(2.5, 1.2, 0.3, mirrorMat, 0, 8, 0.3, mirrorGrp);

  // dot cluster behind mirror
  const mirDotMat = std(FRIT, 0.9, 0, { emissive: 0x1a0a00, emissiveIntensity: 0.2 });
  for (let i = 0; i < 40; i++) {
    const x = (rng() - 0.5) * 3;
    const y = 7 + rng() * 2.5;
    const s = 0.04 + rng() * 0.06;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(s, 6, 6), mirDotMat);
    dot.position.set(x, y, 0.12);
    mirrorGrp.add(dot);
  }
  const silauLbl = label("ANTI-SILAU", { w: 384, h: 80, font: "700 48px sans-serif", color: "#4fc3f7", bg: "rgba(13,9,7,0.9)", size: 2.8 });
  silauLbl.position.set(0, 11, 0.3);
  mirrorGrp.add(silauLbl);

  // sun visor shapes
  for (const sx of [-3, 3]) {
    const visor = box(2.5, 0.3, 1.5, std(0x9e9e9e, 0.8), sx, 10, -0.5, mirrorGrp);
  }

  // --- SET 8: SUMMARY (x = -126) ---
  const sumGrp = new THREE.Group();
  sumGrp.position.x = -126;
  scene.add(sumGrp);

  // complete windshield with all features highlighted
  box(8, 10, 0.15, glassMat.clone(), 0, 5.5, 0, sumGrp);
  box(8, 1.5, 0.18, fritTopMat, 0, 10, 0.02, sumGrp);
  box(8, 1.8, 0.18, fritTopMat, 0, 1.2, 0.02, sumGrp);
  box(7.6, 0.3, 0.25, urethaneMat, 0, 0.5, -0.15, sumGrp);
  // car body outline
  box(10, 0.5, 3, frameMat, 0, 0, -1.5, sumGrp);

  // heat particles (emissive)
  const heatPts = pts(scene, 120, { color: HOT, size: 0.25, add: true, opacity: 0.7 });

  // ambient particles
  const ambPts = pts(scene, 80, { color: 0x4fc3f7, size: 0.15, add: true, opacity: 0.4 });

  // lights
  const amb = new THREE.AmbientLight(0x1a1a2e, 0.3);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xff8f00, 1.2);
  dir.position.set(5, 15, 8);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 50;
  dir.shadow.camera.left = -20;
  dir.shadow.camera.right = 20;
  dir.shadow.camera.top = 20;
  dir.shadow.camera.bottom = -5;
  scene.add(dir);
  const rim = new THREE.PointLight(0x42a5f5, 0.6, 30);
  rim.position.set(-5, 8, 8);
  scene.add(rim);

  // add scale bar near camera path
  scene.add(scaleGrp);

  // camera track: one continuous dolly through all sets
  const camTrack = track([
    //  t,    x,     y,   z,  lx,    ly,  lz
    [0,      0,     6,   12,  0,     5,   0],
    [K.s1e,  0,     5,   8,   0,     4,   0],
    [K.s2,  -4,     4,   6,  -4,     5,  -1],
    [K.s3,  -18,    5,   8,  -18,    4,   0],
    [K.s3e, -18,    4,   5,  -16,    3,  -1],
    [K.s4,  -36,    6,   10, -36,    5,   0],
    [K.s4e, -36,    5,   7,  -36,    4,   0],
    [K.s5,  -54,    5,   9,  -54,    5,   0],
    [K.s5e, -54,    8,   7,  -54,    8,   0],
    [K.s6,  -72,    5,   12, -72,    5,   0],
    [K.s6 + 4, -72, 5,   7,  -72,   5,  -1],
    [K.s6e, -74,    6,   5,  -72,    5,   1],
    [K.s7,  -90,    6,   10, -90,    6,   0],
    [K.s7 + 5, -88, 7,   6,  -90,   6,   0],
    [K.s7e, -108,   7,   9,  -108,   7,   0],
    [AT["silau"] || K.s7 + 9, -108, 8, 5, -108, 8, 0],
    [K.s8,  -126,   6,   12, -126,  5.5,  0],
    [K.s8e, -126,   5,   8,  -126,  5,    0],
    [K.outro, -126, 6,   14, -126,  5,    0],
  ]);

  // animated UV arrows
  function animateUV(t) {
    const phase = ramp(t, K.s4, K.s4e);
    for (let i = 0; i < uvArrows.length; i++) {
      const yOff = Math.sin(t * 3 + i * 0.8) * 0.3 * phase;
      uvArrows[i].position.y = 11 + yOff - phase * 2;
    }
  }

  // furnace glow pulsation
  function animateFurnace(t) {
    const glow = ramp(t, K.s6, K.s6 + 2);
    const pulse = 1.5 + 0.5 * Math.sin(t * 4);
    glowMat.emissiveIntensity = glow * pulse;
    // bend the glass as it heats
    const bend = ramp(t, AT["dipanaskan"] || K.s6 + 3, K.s6e) * 0.15;
    const positions = bendGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      positions.setY(i, (x * x) * bend * 0.02);
    }
    positions.needsUpdate = true;
  }

  // heat particles floating up
  function animateHeatPts(t) {
    for (let i = 0; i < 120; i++) {
      const seed = rng();
      const baseX = ((i * 7 + 13) % 200 - 100) * 0.08;
      const speed = 0.5 + (i % 5) * 0.2;
      const y = ((t * speed + i * 0.37) % 12);
      const setIdx = Math.floor(t / (K.dur / 8));
      const worldX = -setIdx * 18 + baseX;
      heatPts.pos[i * 3] = worldX;
      heatPts.pos[i * 3 + 1] = y;
      heatPts.pos[i * 3 + 2] = (Math.sin(t * 2 + i) * 2);
    }
    heatPts.commit();
  }

  // ambient cool particles
  function animateAmbPts(t) {
    for (let i = 0; i < 80; i++) {
      const baseX = ((i * 11 + 7) % 160 - 80) * 0.15;
      const y = 2 + Math.sin(t * 0.3 + i * 0.5) * 4;
      const z = Math.cos(t * 0.2 + i * 0.7) * 5;
      const setIdx = Math.floor(t / (K.dur / 8));
      ambPts.pos[i * 3] = -setIdx * 18 + baseX;
      ambPts.pos[i * 3 + 1] = y;
      ambPts.pos[i * 3 + 2] = z;
    }
    ambPts.commit();
  }

  // move scale bar near current camera
  function moveScale(camX) {
    scaleGrp.position.x = camX + 7;
    scaleGrp.position.z = -2;
  }

  return function render(t) {
    const c = camTrack(t);
    cam.position.set(c[0], c[1], c[2]);
    cam.lookAt(c[3], c[4], c[5]);

    moveScale(c[0]);
    animateUV(t);
    animateFurnace(t);
    animateHeatPts(t);
    animateAmbPts(t);

    // directional light follows camera
    dir.position.set(c[0] + 5, 15, c[2] + 8);
    dir.target.position.set(c[3], c[4], c[5]);
    dir.target.updateMatrixWorld();
    rim.position.set(c[0] - 5, 8, c[2] + 8);

    comp.render();
  };
}
