// POP-UP: a flat print on a kraft desk rises into a paper diorama. Nothing in the picture moves until the narration names the motion, so the prompt formula is what you see.
// All art is drawn here on canvas; it is an illustration of the workflow, not output from an AI model.
import * as THREE from "./three.module.js";
import { stage, canvasTex, track, ramp, smooth, mulberry, clamp01, envStrips, box } from "./lib3d.js";

const PW = 9.6, PH = 17.07;

function grainFill(x, w, h, rnd, a = 0.05) {
  for (let i = 0; i < w * h * 0.012; i++) { x.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(60,30,10,${a})`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2.4, 1 + rnd() * 1.2); }
}
// Silhouette band with a cut-paper lit edge along its top.
function band(x, w, h, pts, fill, edge) {
  x.beginPath(); x.moveTo(0, h);
  pts.forEach(([u, v]) => x.lineTo(u * w, v * h));
  x.lineTo(w, h); x.closePath(); x.fillStyle = fill; x.fill();
  x.strokeStyle = edge; x.lineWidth = 5; x.beginPath(); pts.forEach(([u, v], i) => (i ? x.lineTo(u * w, v * h) : x.moveTo(u * w, v * h))); x.stroke();
}
const SKY = (x, w, h, rnd) => {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#27406B"); g.addColorStop(0.34, "#6E6A93"); g.addColorStop(0.56, "#E58F6A"); g.addColorStop(0.72, "#F7C27A"); g.addColorStop(1, "#F9DDA0");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = "#FFF2C9"; x.beginPath(); x.arc(w * 0.64, h * 0.68, w * 0.11, 0, 7); x.fill();
  x.strokeStyle = "rgba(255,242,201,.5)"; x.lineWidth = 4; x.beginPath(); x.arc(w * 0.64, h * 0.68, w * 0.14, 0, 7); x.stroke();
  grainFill(x, w, h, rnd);
};
const FAR = (x, w, h, rnd) => { band(x, w, h, [[0, .42], [.12, .2], [.24, .4], [.38, .08], [.52, .38], [.66, .18], [.82, .44], [1, .26]], "#7A6490", "#A18BB5"); grainFill(x, w, h, rnd); };
const MID = (x, w, h, rnd) => {
  band(x, w, h, [[0, .3], [.2, .16], [.42, .36], [.6, .24], [.8, .4], [1, .22]], "#3F6A5E", "#6F9C86");
  for (let i = 0; i < 9; i++) { const u = rnd(), v = .42 + rnd() * .3, s = 18 + rnd() * 24; x.fillStyle = "#2C4F47"; x.beginPath(); x.moveTo(u * w, v * h - s * 2.4); x.lineTo(u * w + s, v * h); x.lineTo(u * w - s, v * h); x.closePath(); x.fill(); }
  grainFill(x, w, h, rnd);
};
const HILL = (x, w, h, rnd) => { band(x, w, h, [[0, .55], [.18, .3], [.42, .1], [.6, .16], [.8, .42], [1, .5]], "#27463B", "#4E7A63"); grainFill(x, w, h, rnd); };
const PERSON = (x, w, h) => {
  x.fillStyle = "#24405F"; x.strokeStyle = "#1B2430"; x.lineCap = "round";
  x.lineWidth = w * .15; x.beginPath(); x.moveTo(w * .42, h * .95); x.lineTo(w * .46, h * .62); x.moveTo(w * .62, h * .95); x.lineTo(w * .56, h * .62); x.stroke();
  x.beginPath(); x.moveTo(w * .28, h * .66); x.quadraticCurveTo(w * .5, h * .7, w * .72, h * .66); x.lineTo(w * .68, h * .3); x.quadraticCurveTo(w * .5, h * .22, w * .32, h * .3); x.closePath(); x.fill();
  x.strokeStyle = "#24405F"; x.lineWidth = w * .1; x.beginPath(); x.moveTo(w * .66, h * .32); x.lineTo(w * .86, h * .12); x.moveTo(w * .34, h * .32); x.lineTo(w * .26, h * .58); x.stroke();
  x.fillStyle = "#E8B98F"; x.beginPath(); x.arc(w * .5, h * .15, w * .15, 0, 7); x.fill();
  x.fillStyle = "#2A1C14"; x.beginPath(); x.arc(w * .5, h * .12, w * .155, Math.PI, 0); x.fill(); x.fillRect(w * .36, h * .1, w * .28, h * .025);
};
const GRASS = (x, w, h, rnd) => {
  x.fillStyle = "#16261F"; x.fillRect(0, h * .55, w, h);
  for (let i = 0; i < 200; i++) { const u = rnd() * w, b = 8 + rnd() * 14, tall = h * (.2 + rnd() * .34); x.fillStyle = rnd() > .5 ? "#16261F" : "#1E342A"; x.beginPath(); x.moveTo(u - b, h * .62); x.quadraticCurveTo(u + rnd() * 18 - 9, h * .6 - tall * .6, u + rnd() * 34 - 17, h * .6 - tall); x.quadraticCurveTo(u + 8, h * .6 - tall * .5, u + b, h * .62); x.closePath(); x.fill(); }
};
const CLOUD = (x, w, h) => { x.fillStyle = "#FBE3C4"; x.beginPath(); x.ellipse(w * .32, h * .62, w * .22, h * .3, 0, 0, 7); x.ellipse(w * .55, h * .48, w * .24, h * .4, 0, 0, 7); x.ellipse(w * .76, h * .64, w * .18, h * .26, 0, 0, 7); x.fill(); x.fillStyle = "rgba(190,110,90,.35)"; x.fillRect(w * .1, h * .72, w * .8, h * .1); };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x3A2A1E, fog: 0.006, exp: 1.08, bloom: [0.1, 0.4, 0.95], fov: 38 });
  const rnd = mulberry(911);
  envStrips(r, scene, [[20, 10, "#FFE3B8", 1.6, 0, 18, 6]], 0x241812);
  scene.environmentIntensity = 0.42;
  const key = new THREE.SpotLight(0xFFE2B4, 900, 80, 0.62, 0.55, 1.6);
  key.position.set(-7, 22, 14); key.target.position.set(0, 2, -4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.radius = 5;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xFFE9CF, 0x4A3322, 0.55));

  const desk = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ roughness: .92, map: canvasTex(1024, 1024, (x, w, h) => { x.fillStyle = "#B98F60"; x.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { x.fillStyle = rnd() > .5 ? "rgba(255,230,190,.05)" : "rgba(70,40,15,.06)"; x.fillRect(rnd() * w, rnd() * h, 14 + rnd() * 80, 1); } }, [6, 6]) }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  const paper = (draw, wp, hp, w = 1024, h = 1024) => {
    const tx = canvasTex(w, h, (x, W, H) => draw(x, W, H, mulberry(w + h)));
    const g = new THREE.PlaneGeometry(wp, hp); g.translate(0, hp / 2, 0);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tx, roughness: .95, alphaTest: .5, side: THREE.DoubleSide }));
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  // layers front to back: [mesh, hinge z, delay]
  const hingeZ = -5.2;
  const backdrop = paper(SKY, PW, PH, 1024, 1820); backdrop.position.set(0, .02, hingeZ); scene.add(backdrop);
  const composite = canvasTex(1024, 1820, (x, w, h) => {
    const R = mulberry(4);
    SKY(x, w, h, R);
    x.save(); x.translate(0, h * .5); FAR(x, w, h * .34, R); x.restore();
    x.save(); x.translate(0, h * .64); MID(x, w, h * .28, R); x.restore();
    x.save(); x.translate(0, h * .76); HILL(x, w, h * .24, R); x.restore();
    x.save(); x.translate(w * .46, h * .67); PERSON(x, w * .16, h * .13); x.restore();
    x.save(); x.translate(0, h * .9); GRASS(x, w, h * .1, R); x.restore();
    x.strokeStyle = "#FFF8EA"; x.lineWidth = 34; x.strokeRect(0, 0, w, h);
  });
  const printM = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH).translate(0, PH / 2, 0), new THREE.MeshStandardMaterial({ map: composite, roughness: .7, transparent: true, side: THREE.DoubleSide }));
  printM.castShadow = true; printM.position.set(0, .04, hingeZ + 0.015); scene.add(printM);

  const L = [
    { m: paper(FAR, PW, 6.2), z: -4.2, d: .1 },
    { m: paper(MID, PW, 4.8), z: -3.0, d: .25 },
    { m: paper(HILL, PW, 4.0), z: -1.6, d: .4 },
    { m: paper(GRASS, PW, 1.9), z: 1.2, d: .7 },
  ];
  L.forEach((o) => { o.m.position.z = o.z; scene.add(o.m); });
  const person = new THREE.Group(); person.position.set(-.35, 3.25, -1.85); scene.add(person);
  const pm = paper(PERSON, 1.5, 2.5, 256, 512); pm.castShadow = false; person.add(pm);
  // scarf: a strip whose vertices are written from timeline time
  const SEG = 18;
  const sg = new THREE.PlaneGeometry(1.5, .22, SEG, 1); const sp = sg.attributes.position; const sb = sp.array.slice();
  const scarf = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xE4472E, roughness: .8, side: THREE.DoubleSide })); scarf.castShadow = false;
  scarf.position.set(.05, 1.92, .08); person.add(scarf);
  // kite and string
  const kite = new THREE.Group(); scene.add(kite);
  const kgeo = new THREE.BufferGeometry(); kgeo.setAttribute("position", new THREE.Float32BufferAttribute([0, .75, 0, .5, 0, 0, 0, -.9, 0, 0, .75, 0, 0, -.9, 0, -.5, 0, 0], 3)); kgeo.computeVertexNormals();
  const kM = new THREE.Mesh(kgeo, new THREE.MeshStandardMaterial({ color: 0xF3B72C, roughness: .8, side: THREE.DoubleSide })); kM.castShadow = true; kite.add(kM);
  const sM = new THREE.Line(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(3 * 24), 3)), new THREE.LineBasicMaterial({ color: 0x1B2430 })); sM.frustumCulled = false; scene.add(sM);
  // clouds slide on paper rails in front of the backdrop
  const clouds = [[1.4, 8.8, 2.8], [-2.2, 10.5, 3.6], [3.4, 11.8, 2.4], [-3.4, 7.9, 2.2]].map(([x, y, w]) => { const c = paper(CLOUD, w, w * .46, 512, 256); c.castShadow = false; c.position.set(x, y, hingeZ + .35); scene.add(c); return { c, x }; });
  // film strip on the desk for the edit step
  const strip = new THREE.Group(); scene.add(strip);
  const frames = [];
  const stripBase = new THREE.Mesh(new THREE.BoxGeometry(14, .03, 2.4), new THREE.MeshStandardMaterial({ color: 0x241C18, roughness: .6 })); stripBase.castShadow = stripBase.receiveShadow = true; strip.add(stripBase);
  for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.95), new THREE.MeshStandardMaterial({ map: composite, roughness: .6 })); f.rotation.x = -Math.PI / 2; f.position.set(-5.2 + i * 2.6, .03, 0); strip.add(f); frames.push(f); }
  for (let i = 0; i < 28; i++) for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.PlaneGeometry(.2, .14), new THREE.MeshBasicMaterial({ color: 0xE9DCC3 })); h.rotation.x = -Math.PI / 2; h.position.set(-6.8 + i * .5, .032, s * 1.1); strip.add(h); }
  const blade = new THREE.Group(); strip.add(blade);
  box(.04, .02, 2.7, new THREE.MeshStandardMaterial({ color: 0xE4472E, emissive: 0xE4472E, emissiveIntensity: .4 }), 0, .06, 0, blade);

  const pop = AT["s1:bergerak"], sy = AT["s4:Syalnya"], aw = AT["s4:awan"], close = AT["s7:hidupkan"], km = AT["s5:kamera"];
  const back = AT["s3:belakang"], tengah = AT["s3:tengah"], depan = AT["s3:depan"];
  const T = K.s1 + 0;
  const camTr = track([
    [pop, 0, 20, -13.0, 0, 0, -13.5],
    [pop + 2.4, 0, 8, 15, 0, 3.2, -2], [K.s2 + .8, -.6, 5.2, 20, 0, 3.6, -2], [K.s2e, .8, 4.8, 21, 0, 3.6, -2],
    // s3 orbit: separated layers read as front, middle, back
    [K.s3 + 1.6, 11, 5.6, 15.5, 0, 3.2, -2], [K.s3e - .4, 12.5, 6.4, 12, 0, 3.2, -2],
    [K.s4 + 1.2, 2.2, 3.6, 19.6, 0, 3.6, -2], [K.s4e, -1.4, 3.8, 19.2, -.2, 3.6, -2],
    [km - .1, -.6, 3.8, 18.8, -.2, 3.7, -2], [km + 1.8, -.4, 3.6, 12, -.3, 3.7, -2], [K.s5e, .3, 3.5, 11.4, -.3, 3.6, -2],
    // s6 pull back and tilt to the strip on the desk
    [K.s6 + 1.4, 0, 10.5, 19, 0, 2.2, 3], [K.s6e, .8, 9.5, 18.4, 0, 2.2, 3],
    [K.s7 + 1.5, 0, 5.6, 21.5, 0, 3.6, -2], [close, 0, 6.2, 22.5, 0, 3.4, -2], [K.dur, 0, 6.2, 22.5, 0, 3.4, -2],
  ]);
  const windU = (t, a) => ramp(t, a, a + .9);
  return (t) => {
    const up = ramp(t, pop, pop + 1.6) * (1 - ramp(t, close, close + 1.5));
    backdrop.rotation.x = -Math.PI / 2 + up * Math.PI / 2 * .995;
    printM.rotation.x = backdrop.rotation.x;
    printM.material.opacity = 1 - ramp(t, pop + .25, pop + .9) * (1 - ramp(t, close + .6, close + 1.3));
    printM.visible = printM.material.opacity > .01;
    const spread = ramp(t, depan - .4, back + .4) * (1 - ramp(t, K.s4, K.s4 + 1.2));
    const Lz = [-4.2 - 0.3 * spread, -3 + 0 * spread, -1.6 + 2.6 * spread, 1.2 + 4.4 * spread];
    L.forEach((o, i) => {
      const u = smooth(clamp01((up - o.d * .5) / (1 - o.d * .5)));
      o.m.rotation.x = -Math.PI / 2 + u * Math.PI / 2;
      o.m.scale.y = Math.max(.002, u);
      o.m.position.z = Lz[i];
      o.m.visible = u > .004;
    });
    const uP = smooth(clamp01((up - .4) / .6));
    person.visible = uP > .01; person.scale.setScalar(Math.max(.01, uP)); person.position.y = 3.25 * uP; person.position.z = Lz[2] - .25;
    // scarf is rigid until the narration says it moves
    const w1 = windU(t, sy);
    for (let i = 0; i < sp.count; i++) {
      const bx = sb[i * 3], by = sb[i * 3 + 1];
      const u = (bx + .75) / 1.5;
      const droop = (1 - w1) * (-u * u * 1.6);
      const flut = w1 * (Math.sin(u * 6 - t * 7) * .16 * u + Math.sin(u * 13 - t * 11) * .05 * u);
      sp.setXYZ(i, bx * (w1 * .9 + (1 - w1) * .5) + (w1 * .72), by * (1 - u * .4) + droop + flut, Math.cos(u * 5 - t * 6) * .08 * w1 * u);
    }
    sp.needsUpdate = true; sg.computeVertexNormals();
    scarf.visible = uP > .5;
    const w2 = windU(t, aw);
    const dt = Math.max(0, t - aw);
    clouds.forEach((o, i) => { o.c.position.x = ((o.x + dt * (.16 + i * .05) + 7) % 14) - 7; o.c.scale.y = up > .02 ? 1 : .001; o.c.visible = up > .5; o.c.position.z = hingeZ + .35; });
    // kite follows the wind
    kite.visible = sM.visible = uP > .5;
    const ksw = w1 * Math.sin(t * 1.7) * .32;
    kite.position.set(2.5 + ksw, 10 + w1 * Math.sin(t * 2.3) * .22, person.position.z);
    kite.rotation.z = -.4 + ksw * .7;
    const hand = new THREE.Vector3(person.position.x + .6, person.position.y + 2.28, person.position.z);
    const ar = sM.geometry.attributes.position.array;
    for (let i = 0; i < 24; i++) { const u = i / 23; ar[i * 3] = hand.x + (kite.position.x - hand.x) * u + Math.sin(u * 3.14) * .3; ar[i * 3 + 1] = hand.y + (kite.position.y - .9 - hand.y) * u - Math.sin(u * 3.14) * .5; ar[i * 3 + 2] = hand.z; }
    sM.geometry.attributes.position.needsUpdate = true;
    // strip slides on from the right at step three, blade cuts at the start of each clip
    const sIn = ramp(t, K.s6 - .1, K.s6 + 1.2) * (1 - ramp(t, K.s7, K.s7 + .8));
    strip.visible = sIn > .01;
    strip.position.set(16 * (1 - sIn) + 0.2 - ramp(t, K.s6 + 1.2, K.s6e) * 1.4, .02, 6.4);
    blade.position.x = -3.9 + Math.floor(clamp01((t - K.s6 - 1.3) / 3.2) * 3.99) * 2.6;
    frames.forEach((f, i) => { f.position.y = .035 + (clamp01((t - K.s6 - 1.3) / 3.2) * 4 > i ? 0 : 0); });
    const FLAT = [0, 21.5 - 1.5 * clamp01(t / pop), -13.2, 0, 0, -13.5];
    let c;
    if (t <= pop) c = FLAT;
    else if (t < pop + 2.4) c = camTr(pop + 2.4 * smooth((t - pop) / 2.4));
    else c = camTr(t);
    if (t > close) { const u = smooth((t - close) / 1.8), E = [0, 19, -9, 0, 0, -13.5]; c = c.map((v, i) => v + (E[i] - v) * u); }
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
