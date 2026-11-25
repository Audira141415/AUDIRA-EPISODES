// TIME DUNGEON: the camera never stops flying forward through portal rings. Each room is one link of the value chain. Original art, no Big Time assets.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std, box, cyl, stage, pts, figure, back, envStrips } from "./lib3d.js";

const AMB = 0xffb020, MAG = 0xff2fa0, TEAL = 0x2ff0d0, UV = 0x7a4dff;
const ROOM = 90;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x06040f, fog: 0.0105, exp: 1.2, bloom: [0.42, 0.55, 0.86] });
  envStrips(r, scene, [[24, 4, 0xffffff, 3, 0, 14, 8], [4, 24, MAG, 3, -14, 2, 6], [4, 24, TEAL, 3, 14, 2, 6], [30, 3, AMB, 2, 0, -10, 8]]);
  const rnd = mulberry(5000);
  scene.add(new THREE.HemisphereLight(0x5a4d9a, 0x120a20, 2.2));
  const roomZ = (i) => -i * ROOM;
  const LEN = ROOM * 9;

  // corridor: panelled walls and floor with seams; a neon strip per side runs the whole length
  const panelT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#171426"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2f2a4a"; g.lineWidth = 6; for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } const q = mulberry(2); for (let i = 0; i < 40; i++) { g.fillStyle = q() > 0.5 ? "#232039" : "#0f0d1c"; g.fillRect(Math.floor(q() * 4) * 128 + 8, Math.floor(q() * 4) * 128 + 8, 112, 112); } }, [8, 60]);
  const wall = new THREE.MeshStandardMaterial({ map: panelT, roughness: 0.62, metalness: 0.45 });
  const W0 = 26, H0 = 46;
  const flo = new THREE.Mesh(new THREE.PlaneGeometry(W0 * 2, LEN), wall); flo.rotation.x = -Math.PI / 2; flo.position.z = -LEN / 2 + ROOM; flo.receiveShadow = true; scene.add(flo);
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(LEN, H0), wall); m.rotation.y = -s * Math.PI / 2; m.position.set(s * W0, H0 / 2, -LEN / 2 + ROOM); scene.add(m); const n = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, LEN), new THREE.MeshBasicMaterial({ color: new THREE.Color(s < 0 ? MAG : TEAL).multiplyScalar(1.8) })); n.position.set(s * (W0 - 0.3), 1.1, -LEN / 2 + ROOM); scene.add(n); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W0 * 2, LEN), wall); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H0, -LEN / 2 + ROOM); scene.add(ceil);

  // portal rings between rooms; their colour marks the link of the chain
  const rings = [];
  const ringCols = [AMB, MAG, TEAL, AMB, UV, MAG, 0xff4030, TEAL];
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(); g.position.set(0, 21, roomZ(i) - ROOM / 2 - 4);
    const hue = new THREE.Color(ringCols[i]);
    const a = new THREE.Mesh(new THREE.TorusGeometry(20, 0.8, 16, 80), new THREE.MeshStandardMaterial({ color: 0x0c0a18, metalness: 0.95, roughness: 0.2, emissive: hue, emissiveIntensity: 0.9 })); g.add(a);
    const b = new THREE.Mesh(new THREE.TorusGeometry(17.6, 0.22, 8, 80), new THREE.MeshBasicMaterial({ color: hue.clone().multiplyScalar(2) })); g.add(b);
    for (let k = 0; k < 12; k++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.6, 0.9), new THREE.MeshBasicMaterial({ color: hue.clone().multiplyScalar(1.6) })); const an = (k / 12) * 6.283; t.position.set(Math.cos(an) * 21.5, Math.sin(an) * 21.5, 0); t.rotation.z = an + Math.PI / 2; g.add(t); }
    scene.add(g); rings.push({ g, b, a });
    const L = new THREE.PointLight(hue, 210, 90, 1.5); L.position.set(0, 18, g.position.z + 12); scene.add(L);
  }

  // hero: jacketed time traveller with a blade, runs through rooms ahead of the lens
  const H = figure(std(0x1a2230, 0.6, 0.3), std(0x35506a, 0.42, 0.8), std(0x2a1e18, 0.7, 0), 1.25);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.26, 5.2, 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(TEAL).multiplyScalar(1.05) })); blade.position.y = -4.3; H.armR.add(blade);
  scene.add(H.G);

  // room 0: loot chest with a beam of light, the "legendary" drop
  const R0 = new THREE.Group(); R0.position.set(0, 0, roomZ(0)); scene.add(R0);
  const goldM = std(0xa86d10, 0.42, 0.9), dark = std(0x171426, 0.35, 0.9);
  box(6.5, 3, 4.5, dark, 3.6, 1.5, 0, R0); const lid = box(6.7, 0.9, 4.7, goldM, 3.6, 3.4, 0, R0);
  const beamM = new THREE.MeshBasicMaterial({ color: new THREE.Color(AMB).multiplyScalar(1), transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(2, 4.5, 34, 24, 1, true), beamM); beam.position.set(3.6, 19, 0); R0.add(beam);
  // the loot itself: a greatsword silhouette with a stamped rarity plate
  const makeLoot = () => { const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color: 0x241a0a, emissive: AMB, emissiveIntensity: 0.65, metalness: 0.9, roughness: 0.18 }); box(0.95, 8.4, 0.3, m, 0, 3.2, 0, g); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.5, 4), m); tip.position.y = 8.1; tip.scale.z = 0.35; g.add(tip); box(3.6, 0.6, 0.6, goldM, 0, -1.1, 0, g); box(0.5, 2.2, 0.5, dark, 0, -2.4, 0, g); return g; };
  const loot = makeLoot(); loot.position.set(3.6, 8.4, 0); R0.add(loot);

  // room 1: monster with spines, fights and falls
  const R1 = new THREE.Group(); R1.position.set(0, 0, roomZ(1)); scene.add(R1);
  const monM = new THREE.MeshStandardMaterial({ color: 0x25103a, roughness: 0.5, metalness: 0.2, flatShading: true });
  const mon = new THREE.Group(); mon.position.set(5.5, 0, -2); R1.add(mon);
  const mb = new THREE.Mesh(new THREE.IcosahedronGeometry(4.1, 1), monM); mb.position.y = 5.2; mb.castShadow = true; mon.add(mb);
  for (let i = 0; i < 16; i++) { const a = rnd() * 6.283, e = rnd() * 2.8; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3 + rnd() * 2.6, 6), monM); const n = new THREE.Vector3(Math.cos(a) * Math.sin(e), Math.cos(e), Math.sin(a) * Math.sin(e)); sp.position.copy(n.clone().multiplyScalar(4.4)).add(new THREE.Vector3(0, 5.2, 0)); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); mon.add(sp); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(MAG).multiplyScalar(2.2) })); e.position.set(s * 1.5, 6, 3.7); mon.add(e); }
  const drop = makeLoot(); drop.scale.setScalar(0.7); drop.position.set(5.5, 4, 2); R1.add(drop);

  // room 2: two pedestals. Cosmetic on one, a slab of SPACE land with a tiny workshop on the other.
  const R2 = new THREE.Group(); R2.position.set(0, 0, roomZ(2)); scene.add(R2);
  const ped = (x) => { cyl(3.6, 4.2, 2.6, 8, dark, x, 1.3, 0, R2); const h = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.12, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(TEAL).multiplyScalar(1.5) })); h.rotation.x = Math.PI / 2; h.position.set(x, 2.65, 0); R2.add(h); };
  ped(-6); ped(6);
  const skin = makeLoot(); skin.scale.setScalar(0.78); skin.position.set(-6, 5.6, 0); R2.add(skin);
  const land = new THREE.Group(); land.position.set(6, 5.4, 0); R2.add(land);
  box(6.2, 1.1, 6.2, std(0x2f2a4a, 0.4, 0.6), 0, 0, 0, land); box(5.7, 0.2, 5.7, new THREE.MeshBasicMaterial({ color: new THREE.Color(UV).multiplyScalar(1.2) }), 0, 0.65, 0, land);
  box(2.2, 2.4, 2.2, goldM, -1, 1.9, -0.6, land); cyl(0.5, 0.7, 2, 8, dark, 1.2, 1.7, 1, land);

  // room 3: giant hourglass whose sand drains and refills. The token only falls while sand runs.
  const R3 = new THREE.Group(); R3.position.set(0, 0, roomZ(3)); scene.add(R3);
  const HG = new THREE.Group(); HG.position.set(0, 0.2, -2); HG.scale.setScalar(0.62); R3.add(HG);
  const frameM = std(AMB, 0.22, 1);
  for (const y of [0.5, 19.5]) cyl(7, 7.4, 1, 24, frameM, 0, y, 0, HG);
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + (i * Math.PI) / 2; cyl(0.34, 0.34, 19, 10, frameM, Math.cos(a) * 6.2, 10, Math.sin(a) * 6.2, HG); }
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.03, metalness: 0, transmission: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 2.4 });
  const prof = []; for (let i = 0; i <= 40; i++) { const y = i / 40; const d = Math.abs(y - 0.5) * 2; prof.push(new THREE.Vector2(0.42 + 4.9 * Math.pow(d, 0.72), 1 + y * 18)); }
  HG.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 36), glass));
  const sandM = new THREE.MeshBasicMaterial({ color: new THREE.Color(AMB).multiplyScalar(1.15) });
  const sandTop = new THREE.Mesh(new THREE.ConeGeometry(4.4, 7, 32), sandM); sandTop.rotation.x = Math.PI; sandTop.position.y = 13.8; HG.add(sandTop);
  const sandBot = new THREE.Mesh(new THREE.ConeGeometry(4.6, 5, 32), sandM); sandBot.position.y = 3.5; HG.add(sandBot);
  const sandFall = pts(scene, 240, { color: AMB, size: 0.55 });
  const wardenRing = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.5, 12, 64), new THREE.MeshStandardMaterial({ color: 0x0b0a15, metalness: 0.9, roughness: 0.2, emissive: TEAL, emissiveIntensity: 1 })); wardenRing.rotation.x = Math.PI / 2; wardenRing.position.y = 10; HG.add(wardenRing);
  const tokT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#1a1408"; g.fillRect(0, 0, w, w); g.fillStyle = "#ffc23a"; g.beginPath(); g.arc(w / 2, w / 2, 118, 0, 7); g.fill(); g.fillStyle = "#3a2708"; g.textAlign = "center"; g.font = "700 62px 'League Gothic'"; g.fillText("BIGTIME", w / 2, w / 2 + 6); g.font = "700 22px Inter"; g.fillText("ILUSTRASI", w / 2, w / 2 + 40); });
  tokT.center.set(0.5, 0.5); tokT.rotation = Math.PI / 2;
  const tokM = [std(AMB, 0.25, 1), new THREE.MeshStandardMaterial({ map: tokT, metalness: 0.6, roughness: 0.35 }), new THREE.MeshStandardMaterial({ map: tokT, metalness: 0.6, roughness: 0.35 })];
  const makeCoin = (s) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(s, s, s * 0.2, 40), tokM); m.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; };
  const coins3 = []; for (let i = 0; i < 6; i++) { const c = makeCoin(1.3); R3.add(c); coins3.push(c); }

  // room 4: forge hammer strikes a blank; the finished skin slides onto a wall of market cards
  const R4 = new THREE.Group(); R4.position.set(0, 0, roomZ(4)); scene.add(R4);
  box(9, 3.4, 5.4, dark, -5, 1.7, 0, R4); box(7, 0.8, 4, std(0x4b4560, 0.3, 0.9), -5, 3.8, 0, R4);
  const hammer = new THREE.Group(); hammer.position.set(-5, 13, 0); R4.add(hammer); box(4, 3, 3.4, std(0x4b4560, 0.3, 0.95), 0, 0, 0, hammer); cyl(0.6, 0.6, 9, 12, dark, 0, 6, 0, hammer);
  const forgeL = new THREE.PointLight(0xff8a2a, 0, 40, 1.6); forgeL.position.set(-5, 6, 3); R4.add(forgeL);
  const blank = makeLoot(); blank.scale.setScalar(0.5); blank.rotation.z = Math.PI / 2; blank.position.set(-4.4, 4.7, 0); R4.add(blank);
  const fsparks = pts(scene, 160, { color: 0xffb060, size: 0.5 });
  const cardT = canvasTex(256, 340, (g, w, h) => { g.fillStyle = "#120e22"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ff2fa0"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = "#ffb020"; g.fillRect(w / 2 - 8, 40, 16, 150); g.fillRect(w / 2 - 34, 180, 68, 12); g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "700 30px 'Space Mono'"; g.fillText("ITEM", w / 2, 250); g.fillStyle = "#2ff0d0"; g.font = "700 26px 'Space Mono'"; g.fillText("ILUSTRASI", w / 2, 296); });
  const cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(3.6, 4.8), new THREE.MeshStandardMaterial({ map: cardT, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: cardT, emissiveIntensity: 0.65 }), 40);
  cards.frustumCulled = false; R4.add(cards);
  const dummy = new THREE.Object3D();

  // room 5: the cost. A SPACE slab and workshop inside a cage of cost bars.
  const R5 = new THREE.Group(); R5.position.set(0, 0, roomZ(5)); R5.scale.setScalar(0.8); scene.add(R5);
  const land2 = land.clone(); land2.scale.setScalar(1.3); land2.position.set(0, 3.2, 0); R5.add(land2);
  cyl(6.2, 6.8, 2.6, 8, dark, 0, 1.3, 0, R5);
  const cage = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; const b = cyl(0.14, 0.14, 11, 8, new THREE.MeshBasicMaterial({ color: new THREE.Color(MAG).multiplyScalar(1.4) }), Math.cos(a) * 6.6, 7.8, Math.sin(a) * 6.6, R5); b.castShadow = false; cage.push(b); }

  // room 6: a falling line drawn in space from the 2023 peak to today, on a log-free honest axis. Illustrative between the two sourced points.
  const R6 = new THREE.Group(); R6.position.set(0, 0, roomZ(6)); scene.add(R6);
  const cv = []; { const q = mulberry(44); for (let i = 0; i <= 60; i++) { const u = i / 60; const base = 11 * Math.exp(-u * 4.8) + 0.3; cv.push(new THREE.Vector3(-10 + u * 20, 2 + base + (i && i < 60 ? (q() - 0.5) * 1.1 * (1 - u * 0.7) : 0), 0)); } }
  const lineCurve = new THREE.CatmullRomCurve3(cv);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(lineCurve, 300, 0.2, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff4030).multiplyScalar(2) })); tube.geometry.setDrawRange(0, 0); R6.add(tube);
  const totalIdx = tube.geometry.index.count;
  const axisM = new THREE.MeshBasicMaterial({ color: 0x4a4570 });
  box(20.4, 0.1, 0.1, axisM, 0, 2, 0, R6); box(0.1, 13, 0.1, axisM, -10, 8.5, 0, R6);
  const fallCoin = makeCoin(2.2); R6.add(fallCoin);

  const colS = box(6, 11, 6, std(0xa86d10, 0.45, 0.6, { emissive: 0x6a4408, emissiveIntensity: 0.9 }), -5, 5.5, 0, R6), colP = box(6, 11, 6, std(0x2f2a4a, 0.5, 0.6), 5, 5.5, 0, R6);
  const lab = (txt, col) => new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = col; g.textAlign = "center"; g.font = "700 96px 'League Gothic'"; g.fillText(txt, w / 2, 100); }) }));
  const labS = lab("STUDIO", "#ffb020"), labP = lab("PEMAIN ?", "#f4f1ff"); labS.position.set(-5, 12.2, 3.2); labP.position.set(5, 3.2, 3.2); R6.add(labS, labP);

  // room 7: last portal, hero looks into it
  const R7 = new THREE.Group(); R7.position.set(0, 0, roomZ(7)); scene.add(R7);
  const portalM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { t: { value: 0 } }, vertexShader: "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "varying vec2 v;uniform float t;void main(){vec2 p=v-.5;float r=length(p)*2.;float a=atan(p.y,p.x);float s=sin(a*5.+r*18.-t*3.)*.5+.5;vec3 c=mix(vec3(.48,.3,1.),vec3(1.,.69,.13),s*r);float m=smoothstep(1.,.92,r);gl_FragColor=vec4(c*(.5+.9*s),m*(.35+.55*s));}" });
  const portal = new THREE.Mesh(new THREE.CircleGeometry(16, 64), portalM); portal.position.set(0, 16.5, -12); R7.add(portal);
  const ptR = new THREE.Mesh(new THREE.TorusGeometry(16, 0.7, 12, 80), new THREE.MeshStandardMaterial({ color: 0x0c0a18, metalness: 0.95, roughness: 0.2, emissive: AMB, emissiveIntensity: 1 })); ptR.position.copy(portal.position); R7.add(ptR);

  const dust = pts(scene, 700, { color: 0xbfb4ff, size: 0.28, opacity: 0.7 });
  const dustS = []; for (let i = 0; i < 700; i++) dustS.push([(rnd() - 0.5) * 46, rnd() * 40, -rnd() * LEN + ROOM, rnd() * 6, 0.2 + rnd() * 0.4]);
  const sS = []; for (let i = 0; i < 700; i++) sS.push([rnd(), rnd(), rnd()]);

  // the lens is always moving toward -z. Inside a scene it creeps, between scenes it dives through a ring.
  const keys = [];
  const scenes = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
  scenes.forEach((s, i) => {
    const Z = roomZ(i), a = K[s], b = K[s + "e"];
    keys.push([i === 0 ? 0 : a + 0.15, 0, 8, Z + 56, 0, 4.8, Z]);
    keys.push([b - 0.35, 0, 7.6, Z + 49, 0, 4.4, Z]);
  });
  keys.push([K.dur, 0, 8, roomZ(7) + 38, 0, 6, roomZ(7) - 10]);
  const camT = track(keys);
  const hit1 = AT["s2:melawan"], dropT = AT["s2:drop"], tokT1 = AT["s4:Token"], rechg = AT["s4:Habis"], forgeT = AT["s5:Forge"], mkt = AT["s5:Open"], exportT = AT["s5:diekspor"], chartT = AT["s7:Harga"], rev = AT["s7:Maret"];
  const heroZ = (t) => { for (let i = scenes.length - 1; i >= 0; i--) if (t >= K[scenes[i]] - 0.2) return roomZ(i); return 0; };

  return (t) => {
    const c = camT(t);
    const sh = 0.4 * (t > hit1 ? Math.exp(-(t - hit1) * 6) : 0);
    cam.position.set(c[0] + Math.sin(t * 0.6) * 0.8 + Math.sin(t * 53) * sh, c[1] + Math.sin(t * 0.8) * 0.25 + Math.cos(t * 41) * sh, c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    rings.forEach((x, i) => { x.g.rotation.z = t * (i % 2 ? 0.28 : -0.22); x.a.material.emissiveIntensity = 0.7 + 0.5 * Math.sin(t * 2 + i); });

    // hero stands left of each subject, faces it, blade ready; a short lunge in the fight
    const zH = heroZ(t);
    const lunge = t > hit1 && t < hit1 + 1.3 ? Math.sin(((t - hit1) / 1.3) * Math.PI) : 0;
    H.G.position.set(-6.8 + lunge * 7, 0, zH + 8);
    H.G.rotation.y = 0.75;
    const inS6 = t > K.s6 - 0.2 && t < K.s7 - 0.2;
    H.G.scale.setScalar(1.25);
    H.armR.rotation.x = -0.6 - lunge * 1.8 + Math.sin(t * 1.7) * 0.06;
    H.armL.rotation.x = 0.15 + Math.sin(t * 1.7 + 1) * 0.05;
    if (t > K.s8) { H.G.position.set(-1.5, 0, roomZ(7) + 12); H.G.rotation.y = Math.PI; }

    // room 0: lid opens at the word loot, sword rises in the beam
    const op = ramp(t, AT["s1:loot"] - 0.3, AT["s1:loot"] + 0.4);
    lid.rotation.x = -1.1 * op; lid.position.y = 3.4 + op * 0.8; lid.position.z = -op * 1.4;
    beamM.opacity = 0.1 * op;
    loot.position.y = 3 + 5.6 * eout((t - AT["s1:loot"]) / 0.8);
    loot.scale.setScalar(Math.max(0.001, op));
    loot.rotation.y = t * 0.8;

    // room 1: monster breathes, is hit, collapses into the drop
    const die = ramp(t, dropT - 0.5, dropT + 0.2);
    mon.scale.setScalar(Math.max(0.001, 1 - die * 0.98));
    mon.position.y = Math.sin(t * 2) * 0.25; mon.rotation.y = Math.sin(t * 1.1) * 0.25;
    drop.scale.setScalar(Math.max(0.001, back((t - dropT) / 0.55) * 0.7));
    drop.rotation.y = t; drop.position.y = 5 + Math.sin(t * 2) * 0.4;

    // room 2
    skin.rotation.y = t * 0.8; land.rotation.y = -t * 0.45;
    const cosIn = back((t - AT["s3:Kosmetik"]) / 0.5), landIn = back((t - AT["s3:SPACE"]) / 0.5);
    skin.scale.setScalar(Math.max(0.001, cosIn * 0.78)); land.scale.setScalar(Math.max(0.001, landIn));

    // room 3: sand level follows a running cycle. "Habis" empties the top, the warden ring recharges it
    const run = ramp(t, tokT1 - 0.3, rechg - 0.1);
    const fill = ramp(t, rechg + 0.8, K.s4e - 0.5);
    const lvl = 1 - run * 0.94 + fill * 0.8;
    sandTop.scale.set(Math.max(0.02, Math.pow(lvl, 0.5)), Math.max(0.02, lvl), Math.max(0.02, Math.pow(lvl, 0.5)));
    sandTop.position.y = 10.3 + 3.5 * lvl;
    sandBot.scale.set(Math.max(0.1, 1.08 - lvl * 0.7), Math.max(0.1, 1.08 - lvl * 0.7), Math.max(0.1, 1.08 - lvl * 0.7));
    sandBot.position.y = 1.3 + 2.5 * (1.08 - lvl * 0.7);
    const sI = sandFall.pos, running = t > tokT1 && t < rechg;
    for (let i = 0; i < 240; i++) { const u = (sS[i][0] + t * 1.5) % 1; sI[i * 3] = (sS[i][1] - 0.5) * 0.5 * (running ? 1 : 0); sI[i * 3 + 1] = running ? 10 - u * 7 : -60; sI[i * 3 + 2] = roomZ(3) - 2 + (sS[i][2] - 0.5) * 0.5; }
    sandFall.commit();
    wardenRing.material.emissiveIntensity = 0.3 + 0.7 * ramp(t, rechg + 0.5, rechg + 1.2) * (1 - ramp(t, K.s4e - 0.5, K.s4e));
    wardenRing.rotation.z = t * 2;
    wardenRing.position.y = 2 + 16 * (0.5 + 0.5 * Math.sin(t * 2.4));
    coins3.forEach((m, i) => { const u = clamp01((t - tokT1 - 0.25 - i * 0.5) / 2.6); m.position.set(Math.sin(i * 2.1) * 10.5, 19 - 17.5 * u * u, Math.cos(i * 1.3) * 3.5 + 2); m.rotation.y = t * 2 + i; m.scale.setScalar(u > 0 ? 1 : 0.0001); });

    // room 4
    const beat = forgeT > t ? 0 : ((t - forgeT) * 1.25) % 1;
    const on4 = t > forgeT && t < mkt;
    const hy = on4 ? (beat < 0.14 ? 13 - 7.6 * (beat / 0.14) * (beat / 0.14) : 5.4 + 7.6 * ramp(beat, 0.2, 0.9)) : 13;
    hammer.position.y = hy;
    forgeL.intensity = on4 ? 420 * Math.exp(-beat * 5) + 40 : 20;
    const fI = fsparks.pos;
    for (let i = 0; i < 160; i++) { const a = sS[i + 200], l = beat * (0.6 + a[0]); fI[i * 3] = on4 && beat < 0.7 ? -5 + (a[1] - 0.5) * 22 * l : 0; fI[i * 3 + 1] = on4 && beat < 0.7 ? 4.6 + a[2] * 14 * l - 12 * l * l : -60; fI[i * 3 + 2] = roomZ(4) + (a[0] - 0.5) * 12 * l; }
    fsparks.commit();
    const cardsOn = ramp(t, mkt - 0.4, mkt + 0.4) * (1 - ramp(t, K.s5e - 0.7, K.s5e - 0.3));
    for (let i = 0; i < 40; i++) {
      const row = i % 3, col = Math.floor(i / 3), dir = row % 2 ? 1 : -1;
      const x = ((col * 4.4 + dir * t * 1.6 + row * 3) % 57.2 + 57.2) % 57.2 - 28.6;
      dummy.position.set(x + 3, 2.8 + row * 5.1, -10);
      const s = Math.max(0.001, cardsOn);
      dummy.scale.set(s, s, s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); cards.setMatrixAt(i, dummy.matrix);
    }
    cards.instanceMatrix.needsUpdate = true;
    blank.material = blank.material;

    // room 5: cage closes as cost is named
    const cgIn = ramp(t, AT["s6:produksi"] - 0.2, AT["s6:produksi"] + 0.6);
    cage.forEach((b, i) => { b.scale.y = Math.max(0.001, cgIn); b.position.y = 2.6 + 5.2 * cgIn; });
    land2.rotation.y = t * 0.3;

    // room 6: the line draws on the word Harga; coin slides down the curve with it
    const dr = clamp01((t - chartT) / 2.2);
    tube.geometry.setDrawRange(0, Math.floor(totalIdx * dr));
    const p6 = lineCurve.getPoint(Math.max(0.0001, dr));
    fallCoin.position.set(p6.x, p6.y + 2.8, 0.4);
    fallCoin.scale.setScalar(dr > 0 ? 1 : 0.0001);
    fallCoin.rotation.y = t * 3;

    portalM.uniforms.t.value = t;
    portal.visible = ptR.visible = t > K.s7e - 0.8;
    const colIn = ramp(t, rev - 0.2, rev + 0.5) * (1 - ramp(t, chartT - 0.5, chartT));
    colS.scale.y = Math.max(0.001, colIn); colP.scale.y = Math.max(0.001, colIn * 0.14);
    colS.position.y = 5.5 * colIn; colP.position.y = 0.8 * colIn;
    labS.visible = labP.visible = colIn > 0.5;
    labS.position.y = 12.2 * colIn; labP.position.y = 3.2 * colIn;

    const dI = dust.pos;
    for (let i = 0; i < 700; i++) { const d = dustS[i]; dI[i * 3] = d[0] + Math.sin(t * d[4] + d[3]) * 1.5; dI[i * 3 + 1] = (d[1] + t * d[4]) % 40; dI[i * 3 + 2] = d[2]; }
    dust.commit();
    comp.render();
  };
}
