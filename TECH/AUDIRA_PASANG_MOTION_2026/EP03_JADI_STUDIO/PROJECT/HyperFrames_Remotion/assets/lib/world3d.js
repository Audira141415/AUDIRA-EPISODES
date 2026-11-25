// THE STUDIO (PAPERWORLD + PRECISION): a warm cream cyclorama with a conveyor belt. A paper note rides from desk to voice bars to projector, so the production line is one continuous place. Real audira-motion clips play in DOM frames above it.
import * as THREE from "./three.module.js";
import { stage, ramp, smooth, track, clamp01, back, canvasTex, box, cyl, std } from "./lib3d.js";

const CREAM = 0xf0e6d2, INK = 0x1c1a17, ORG = 0xff6a3d, FOREST = 0x0b3d2e, TOSCA = 0x00b894, LIME = 0xa3e635;
const SER = '"Fraunces"', MONO = '"DM Mono"';

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: CREAM, fog: .0035, exp: 1.02, bloom: [.08, .4, .95], fov: 34, shadow: true });
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0xcdb99a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.5); sun.position.set(-14, 26, 18); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 90 }); sun.shadow.bias = -.0006; scene.add(sun); scene.add(sun.target);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 200), std(CREAM, .95)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const labels = [];
  const sign = (text, w, h, font, bg, fg, size) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const paint = () => { const x = c.getContext("2d"); x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, h / 2 + 4); t.needsUpdate = true; };
    paint(); labels.push(paint);
    return new THREE.Mesh(new THREE.PlaneGeometry(size, size * h / w), new THREE.MeshStandardMaterial({ map: t, roughness: .8 }));
  };

  // Belt: runs under every station.
  const beltTex = canvasTex(256, 256, (x, w) => { x.fillStyle = "#2a2622"; x.fillRect(0, 0, w, w); x.fillStyle = "#3a352f"; x.fillRect(0, 0, 24, w); });
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(70, 1);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(260, .5, 5), new THREE.MeshStandardMaterial({ map: beltTex, roughness: .8 })); belt.position.set(80, 1.2, 0); belt.castShadow = belt.receiveShadow = true; scene.add(belt);
  for (let i = 0; i < 32; i++) box(.6, 1, 5.6, std(0x8c7f6c, .5, .3), -40 + i * 8, .5, 0, scene);

  // The three players stand behind the belt at the first station.
  const P = [["Claude Code", -4.2, FOREST, "s2:Claude"], ["audira-motion", 0, ORG, "s2:audira-motion"], ["mesh", 4.2, TOSCA, "s2:Mesh"]];
  const players = P.map(([n, x, c, a]) => { const G = new THREE.Group(); G.position.set(x, 0, -5.5); scene.add(G); const b = box(3.7, 6, 3, std(c, .55), 0, 3, 0, G); const l = sign(n, 512, 110, `500 58px ${MONO}`, "#f8f1e2", "#1c1a17", 3.4); l.position.set(0, 4.3, 1.52); G.add(l); G.a = AT[a]; return G; });

  // Note: the sentence itself, as paper, travelling the whole line.
  const note = new THREE.Group(); scene.add(note);
  const noteB = box(5, .05, 3.3, std(0xfffaf0, .9), 0, 0, 0, note);
  const nl = sign("/audira-motion", 512, 300, `500 52px ${MONO}`, "#fffaf0", "#1c1a17", 4.8); nl.rotation.x = -Math.PI / 2; nl.position.y = .04; note.add(nl);

  // Voice station: bars rise from the belt side.
  const VX = 34;
  const bars = []; for (let i = 0; i < 26; i++) { const b = box(.5, 1, 1.1, std(i % 2 ? TOSCA : FOREST, .5), VX - 7.2 + i * .58, .5, -4.2, scene); bars.push(b); }
  const mic = new THREE.Group(); mic.position.set(VX + 7, 0, -3.2); scene.add(mic);
  cyl(.12, .12, 5, 10, std(INK, .4, .6), 0, 2.5, 0, mic); const hd = cyl(.75, .75, 1.7, 22, std(0x4a453e, .3, .75), 0, 5.6, 0, mic); hd.rotation.z = .2;

  // Preview: a tiny monitor. Final: the same monitor grown large.
  const SX = 72;
  const softs = [-5.6, 5.6].map((x) => { const G = new THREE.Group(); G.position.set(SX + x, 0, -5); scene.add(G); cyl(.14, .2, 10, 10, std(INK, .45, .4), 0, 5, 0, G); const p = box(3, 4, .4, new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: 0xffe6b8, emissiveIntensity: .75 }), 0, 11, 0, G); p.rotation.y = -x * .07; return G; });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.42, 18, 14), new THREE.MeshBasicMaterial({ color: ORG })); lamp.position.set(SX, 1.9, 2.2); scene.add(lamp);

  // Fork at the end of the belt: 3D line continues, flat explainer branches off to the other path.
  const FX = 112;
  const stA = sign("FILM 3D", 512, 170, `700 104px ${SER}`, "#ff6a3d", "#fff", 4.1); stA.position.set(FX - 2.3, 5.2, -4); scene.add(stA);
  const stB = sign("DATAR", 512, 170, `700 104px ${SER}`, "#0b3d2e", "#a3e635", 4.1); stB.position.set(FX + 2.3, 5.2, -4); scene.add(stB);
  for (const [sx, c] of [[stA, ORG], [stB, FOREST]]) cyl(.14, .14, 4.8, 10, std(c, .5), sx.position.x, 2.4, -4.1, scene);

  const a2 = K.s2, a3 = K.s3, a4 = K.s4, a5 = K.s5, a6 = K.s6, a7 = K.s7, a8 = K.s8;
  const noteX = track([[0, -3, 0, 0], [a3 + 1, -3, 0, 0], [a4 - .3, 6, 0, 0], [a4 + 2, VX - 8, 0, 0], [a5 - .3, VX + 3, 0, 0], [a5 + 1.5, SX - 5, 0, 0], [a6 + 1, SX + 3, 0, 0], [a7 + 1, FX - 3, 0, 0], [a8, FX - 3, 0, 0], [K.dur + 2, FX + 2, 0, 0]]);
  const CAM = track([
    [0, -1, 8, 36, 0, 6.6, -4],
    [a2 + 1, 1, 9, 39, 0, 5.8, -4],
    [a3 - .4, 0, 9, 37, 0, 5.4, -4],
    [a3 + 1.6, 3, 8, 27, 1, 5.6, -1],
    [a4 - .4, 14, 8, 27, 12, 6, -2],
    [a4 + 1.6, VX - 1, 7, 27, VX, 5.8, -2],
    [a5 - .4, VX + 7, 7, 27, VX + 8, 6.3, -2],
    [a5 + 1.5, SX - 7, 7, 30, SX - 5, 8.2, -3],
    [a6 + .6, SX + 2, 8, 34, SX, 8.8, -3],
    [a7 - .4, SX + 8, 8, 36, SX + 10, 8.8, -3],
    [a7 + 1.5, FX - 2, 8, 31, FX, 6.3, -3],
    [a8, FX + 1, 8, 31, FX, 6, -3],
    [K.dur + 2, FX + 3, 7, 29, FX, 6, -3],
  ]);
  let fontsOK = false;
  return (t) => {
    if (!fontsOK && document.fonts.check(`700 40px ${SER}`) && document.fonts.check(`500 40px ${MONO}`)) { fontsOK = true; labels.forEach((p) => p()); }
    beltTex.offset.x = -t * .55;
    players.forEach((G) => { const u = back(clamp01((t - G.a) / .4), 1.4); G.scale.setScalar(Math.max(.001, .001 + u)); G.rotation.y = Math.sin(t * .5 + G.position.x) * .05; });
    const n = noteX(t);
    note.position.set(n[0], 1.5, 1);
    note.rotation.y = Math.sin(t * .6) * .08;
    note.visible = t > a3 - .2;
    // Bars act out speech only while the mesh voice line is spoken.
    bars.forEach((b, i) => { const on = ramp(t, AT["s4:Mesh"] - .6, AT["s4:Mesh"]); const h = .3 + on * (1.7 + 1.6 * Math.abs(Math.sin(t * 5.1 + i * .9) * Math.sin(t * 1.7 + i * .37))); b.scale.y = h; b.position.y = h / 2; });
    lamp.visible = false;
    sun.position.set(n[0] - 14, 26, 18); sun.target.position.set(n[0], 0, 0); sun.target.updateMatrixWorld();
    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
