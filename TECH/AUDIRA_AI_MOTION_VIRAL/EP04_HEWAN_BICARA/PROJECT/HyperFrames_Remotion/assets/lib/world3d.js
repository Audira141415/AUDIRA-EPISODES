import WORDS from "./words.js";
// CLAY CAT HOST: a plasticine cat narrates its own how-to. Time is stepped to 12 per second for stop-motion feel, and the mouth shape comes directly from timeline word times, so the lip sync is real and re-locks to the voice.
// A code puppet, not output from an AI video model. The script says so.
import * as THREE from "./three.module.js";
import { stage, canvasTex, track, ramp, smooth, mulberry, clamp01, back } from "./lib3d.js";

export function create(canvas, K, AT, W = WORDS) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xF3C9A4, fog: 0, exp: 1.0, bloom: [.04, .3, .98], fov: 34 });
  const rnd = mulberry(404);
  scene.fog = null;
  const key = new THREE.DirectionalLight(0xFFF1DC, 2.6); key.position.set(-5, 11, 9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 7; Object.assign(key.shadow.camera, { left: -11, right: 11, top: 14, bottom: -8 }); scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xFFEAD6, 0xB67B59, 1.25));
  const rim = new THREE.DirectionalLight(0xFFD2E0, .8); rim.position.set(7, 4, -5); scene.add(rim);
  // thumbprint bump shared by everything: dents and fingerprint whorls drawn once
  const bump = canvasTex(1024, 1024, (x, w, h) => {
    x.fillStyle = "#808080"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const a = rnd() * w, b = rnd() * h, rr = 18 + rnd() * 56; const g = x.createRadialGradient(a, b, 1, a, b, rr); g.addColorStop(0, `rgba(40,40,40,${.22 + rnd() * .25})`); g.addColorStop(1, "rgba(128,128,128,0)"); x.fillStyle = g; x.beginPath(); x.ellipse(a, b, rr, rr * (.6 + rnd() * .4), rnd() * 3, 0, 7); x.fill(); }
    x.lineWidth = 1.4;
    for (let i = 0; i < 60; i++) { const a = rnd() * w, b = rnd() * h, rot = rnd() * 3; for (let k = 3; k < 44; k += 5) { x.strokeStyle = "rgba(50,50,50,.2)"; x.beginPath(); x.ellipse(a, b, k, k * .7, rot, .3, 5.6); x.stroke(); } }
  }, [2, 2]);
  bump.colorSpace = THREE.NoColorSpace;
  const clay = (c, rough = .62) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, metalness: 0, bumpMap: bump, bumpScale: 1.3, sheen: .4, sheenRoughness: .7, sheenColor: new THREE.Color(0xFFFFFF), clearcoat: .22, clearcoatRoughness: .6 });
  const sph = (rad, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, parent) => { const o = new THREE.Mesh(new THREE.SphereGeometry(rad, 32, 24), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = o.receiveShadow = true; if (parent) parent.add(o); return o; };
  const ORANGE = clay(0xE98A2E), CREAM = clay(0xFFEBCF), DARKS = clay(0xB5581B), PINK = clay(0xEC8AA0), TEAL = clay(0x2AA79B), PLUM = clay(0x5A2F52), YEL = clay(0xF6C445), WHT = clay(0xFFF8EE, .4), INK = clay(0x241622, .35), MOUTH = clay(0x5B1730, .8), RED = clay(0xD8452E);
  // curved cyclorama of clay
  const set = new THREE.Group(); scene.add(set);
  const cycG = new THREE.CylinderGeometry(26, 26, 40, 72, 1, true, Math.PI / 2 + .7, Math.PI * 2 - 1.4);
  const cyc = new THREE.Mesh(cycG, new THREE.MeshStandardMaterial({ color: 0xF2BE96, side: THREE.DoubleSide, roughness: .9, bumpMap: bump, bumpScale: 1 })); cyc.position.set(0, 20, 0); cyc.receiveShadow = true; set.add(cyc);
  const flo = new THREE.Mesh(new THREE.CircleGeometry(30, 60), new THREE.MeshStandardMaterial({ color: 0xEDB08A, roughness: .92, bumpMap: bump, bumpScale: 1 })); flo.rotation.x = -Math.PI / 2; flo.receiveShadow = true; set.add(flo);
  // cat
  const cat = new THREE.Group(); scene.add(cat);
  const body = sph(1.5, ORANGE, 0, 1.7, 0, 1, 1.12, .92, cat);
  sph(1.05, CREAM, 0, 1.55, .72, .96, 1.05, .6, cat);
  const pawL = sph(.42, ORANGE, -.78, .34, 1.05, 1, .75, 1.3, cat), pawR = sph(.42, ORANGE, .78, .34, 1.05, 1, .75, 1.3, cat);
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.position.set(-1.28, 2.45, .35); armR.position.set(1.28, 2.45, .35); cat.add(armL, armR);
  sph(.34, ORANGE, 0, -.55, 0, 1, 1.9, 1, armL); sph(.38, CREAM, 0, -1.15, .05, 1, 1, 1, armL); sph(.34, ORANGE, 0, -.55, 0, 1, 1.9, 1, armR); sph(.38, CREAM, 0, -1.15, .05, 1, 1, 1, armR);
  // tail built of beads so it can wag in steps
  const tailG = []; for (let i = 0; i < 16; i++) { tailG.push(sph(.27 - i * .006, i % 2 ? DARKS : ORANGE, 0, 0, 0, 1, 1, 1, cat)); }
  const head = new THREE.Group(); head.position.set(0, 3.9, .15); cat.add(head);
  sph(1.42, ORANGE, 0, 0, 0, 1.1, .94, .96, head);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(.56, 1, 24), ORANGE); ear.position.set(s * .94, 1.28, -.05); ear.rotation.z = -s * .28; ear.castShadow = true; head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(.33, .66, 20), PINK); inner.position.set(s * .94, 1.24, .22); inner.rotation.z = -s * .28; head.add(inner);
    for (let k = 0; k < 3; k++) { const st = sph(.12, DARKS, s * (.28 + k * .34), 1.07 - k * .13, .55 - k * .08, 1.9, .5, .6, head); st.rotation.z = s * (-.3 - k * .3); }
  }
  // face plate and eyes
  sph(.92, CREAM, 0, -.42, .78, 1.15, .76, .66, head);
  const eyes = [-1, 1].map((s) => { const G = new THREE.Group(); G.position.set(s * .58, .22, 1.16); head.add(G); sph(.36, WHT, 0, 0, 0, 1, 1.08, .55, G); const pup = sph(.2, INK, 0, 0, .15, 1, 1.15, .55, G); const glint = sph(.06, WHT, .06, .1, .27, 1, 1, .5, G); const lid = sph(.385, ORANGE, 0, .0, .0, 1.03, 1.1, .6, G); return { G, pup, glint, lid }; });
  sph(.17, PINK, 0, -.16, 1.42, 1.25, .8, .7, head);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.022, .012, 1.05, 8), INK); wh.position.set(s * 1.28, -.3 - (i - 1) * .14, 1.05); wh.rotation.z = Math.PI / 2 + s * (i - 1) * .16; head.add(wh); }
  // Mouth: muzzle pieces around a cavity. The jaw drops, cavity scales, corners spread by viseme.
  const mouth = new THREE.Group(); mouth.position.set(0, -.52, 1.28); head.add(mouth);
  const cav = sph(.34, MOUTH, 0, 0, -.02, 1.2, .3, .4, mouth);
  const tong = sph(.16, PINK, 0, -.05, .1, 1.2, .5, .5, mouth);
  const teeth = [-1, 1].map((s) => { const c = new THREE.Mesh(new THREE.ConeGeometry(.05, .13, 10), WHT); c.position.set(s * .17, -.07, .14); c.rotation.x = Math.PI; mouth.add(c); return c; });
  const lipU = sph(.42, CREAM, 0, .13, .08, .95, .24, .34, mouth);
  const jaw = sph(.36, CREAM, 0, -.13, .08, 1.05, .36, .46, mouth);
  // Viseme curve from word text: each word becomes syllable pulses in its own time span.
  const words = W.map((w) => ({ a: w.start, b: w.end, v: (w.text.toLowerCase().match(/[aiueo]/g) || ["a"]) }));
  const open = (t) => {
    for (const w of words) if (t >= w.a && t < w.b) {
      const u = (t - w.a) / (w.b - w.a) * w.v.length, i = Math.min(w.v.length - 1, Math.floor(u));
      const e = Math.sin((u - i) * Math.PI), ch = w.v[i];
      return { j: e * ({ a: 1, e: .62, i: .34, o: .82, u: .5 })[ch], wide: ({ a: .1, e: .3, i: .6, o: -.28, u: -.46 })[ch] * e };
    }
    return { j: 0, wide: 0 };
  };
  // Props per chapter, all clay.
  const prop = new THREE.Group(); scene.add(prop);
  // s3 picture frame around the face, lens lights
  const frame = new THREE.Group(); scene.add(frame);
  const barMat = TEAL;
  const bar = (w, h, x, y, p = frame) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .34, 4, 4, 2), barMat); m.position.set(x, y, 0); p.add(m); return m; };
  bar(4, .22, 0, 1.75, frame); bar(4, .22, 0, -1.75, frame); bar(.22, 3.72, -2, 0, frame); bar(.22, 3.72, 2, 0, frame);
  // fang flag
  // s4 waveform: clay bars pumped by word energy
  const WN = 15;
  const wave = []; const waveG = new THREE.Group(); scene.add(waveG);
  for (let i = 0; i < WN; i++) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(.14, 1, 6, 14), [TEAL, YEL, PINK][i % 3]); m.position.set((i - (WN - 1) / 2) * .44, 0, 0); m.castShadow = true; waveG.add(m); wave.push(m); }
  // s5 path A: a picture card plus an audio tin feed into a little machine
  const machine = new THREE.Group(); scene.add(machine);
  const box3 = (w, h, d, m, x, y, z, p = machine) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 3, 3, 3), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
  const cardP = box3(1.1, 1.4, .16, WHT, -2.3, .9, 0); sph(.34, ORANGE, -2.3, 1, .12, 1, .95, .4, machine);
  const tin = new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .6, 24), YEL); tin.position.set(2.3, .3, 0); tin.castShadow = true; machine.add(tin); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(.12 + i * .1, .03, 8, 24, 1.6), PLUM); b.position.set(2.3, .92, 0); b.rotation.z = .8; machine.add(b); }
  // s6 path B: a small human clay actor beside the cat, whose head gesture leads the cat's
  const actor = new THREE.Group(); scene.add(actor);
  sph(.72, clay(0x3E6FB0), 0, 1.05, 0, 1, 1.2, .8, actor);
  const aHead = new THREE.Group(); aHead.position.set(0, 2.25, 0); actor.add(aHead);
  sph(.56, clay(0xE7B38E), 0, 0, 0, 1, 1.05, 1, aHead); sph(.58, INK, 0, .22, -.08, 1.02, .8, 1, aHead);
  for (const s of [-1, 1]) { sph(.08, WHT, s * .2, .02, .47, 1, 1.1, .5, aHead); sph(.04, INK, s * .2, .02, .52, 1, 1, .5, aHead); }
  const aMouth = sph(.09, MOUTH, 0, -.22, .5, 1.3, .5, .4, aHead);
  const aArmL = new THREE.Group(), aArmR = new THREE.Group(); aArmL.position.set(-.66, 1.45, 0); aArmR.position.set(.66, 1.45, 0); actor.add(aArmL, aArmR);
  sph(.17, clay(0x3E6FB0), 0, -.42, 0, 1, 2.5, 1, aArmL); sph(.17, clay(0x3E6FB0), 0, -.42, 0, 1, 2.5, 1, aArmR);
  const camClay = new THREE.Group(); scene.add(camClay);
  box3(.8, .55, .5, PLUM, 0, 2.3, 0, camClay); const lens = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .34, 20), INK); lens.rotation.x = Math.PI / 2; lens.position.set(0, 2.3, .4); camClay.add(lens); const leg = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2, 10), INK); leg.position.y = 1; camClay.add(leg);
  // connecting clay beads between actor and cat
  const beads = []; for (let i = 0; i < 12; i++) beads.push(sph(.09, YEL, 0, 0, 0, 1, 1, 1, scene));
  // label tag for the disclosure: a little clay sign the cat holds up
  const sign = new THREE.Group(); scene.add(sign);
  const signB = box3(1.8, 1, .16, WHT, 0, 1.95, 0, sign); const stick = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.6, 10), PLUM); stick.position.y = .8; sign.add(stick);
  const aiTex = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .78), new THREE.MeshBasicMaterial({ map: canvasTex(300, 156, (x, w, h) => { x.fillStyle = "#FFF8EE"; x.fillRect(0, 0, w, h); x.fillStyle = "#D8452E"; x.font = "900 96px Nunito,sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("AI", w / 2, h / 2 + 4); }) })); aiTex.position.set(0, 1.95, .1); sign.add(aiTex);
  // the "strings" payoff at the end: thin timing threads rising from the mouth
  const threads = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.05, .3 + (i * 37 % 12) * .05, .05), [TEAL, PLUM, RED][i % 3]); scene.add(m); threads.push(m); }

  const sus = AT["s2:Suara"], waj = AT["s2:wajah"], kar = AT["s3:Karakter"], tar = AT["s3:Punya"], suaraS4 = AT["s4:Suara"], hed = AT["s5:Hedra"], jalurA = AT["s6:Jalur"], stdp = AT["s6:Standard"], rah = AT["s7:Rahasiaku"], lab = AT["s7:label"];
  const camTr = track([
    [0, .2, 5, 12.5, 0, 4.85, 0], [K.s1e, -.3, 4.9, 14, 0, 4.6, 0],
    [K.s2 + 1, .6, 4.3, 17, 0, 3.6, 0], [K.s2e, -.5, 4.4, 17.6, 0, 3.6, 0],
    [K.s3 + 1, .1, 4.6, 13.5, 0, 4.5, 0], [tar - .1, -.2, 4.6, 12.6, 0, 4.4, 0], [tar + 1, .1, 4, 8, 0, 3.8, 0], [K.s3e, .2, 4, 8.4, 0, 3.8, 0],
    [K.s4 + 1, -1, 3.8, 17.4, 0, 3.1, 0], [K.s4e, 1, 3.8, 17.4, 0, 3.1, 0],
    [K.s5 + 1, .4, 4.6, 19, 0, 3.4, 0], [K.s5e, -.4, 4.6, 18.4, 0, 3.4, 0],
    [K.s6 + 1.2, 1, 3.8, 20, .25, 3.3, 0], [K.s6e, .4, 3.9, 19, .25, 3.3, 0],
    [K.s7 + 1, .1, 4.4, 16, 0, 4, 0], [rah, .3, 4.4, 15, 0, 4.2, 0], [rah + 2, .1, 4.8, 13, 0, 4.7, 0], [K.dur, 0, 4.8, 12.6, 0, 4.7, 0],
  ]);
  const inOut = (t, a, b, s = .35) => back(clamp01((t - a) / s), 1.6) * (1 - smooth((t - b) / .3));
  return (rawT) => {
    // stop-motion clock. Everything below reads the stepped time, including the camera at a slightly finer step.
    const t = Math.floor(rawT * 12) / 12;
    const tc = Math.floor(rawT * 24) / 24;
    const jx = (rnd.call ? 0 : 0);
    const f = Math.floor(rawT * 12);
    // boil: every frame the clay wobbles a hair, as if re-sculpted
    const boil = (i) => { const a = Math.sin(f * 12.9898 + i * 78.233) * 43758.5453; return (a - Math.floor(a)) - .5; };
    bump.offset.set(boil(1) * .02, boil(2) * .02);
    const m = open(t);
    const j = m.j, wd = m.wide;
    jaw.position.y = -.13 - j * .3; jaw.scale.set(.9 + wd * .4, .26 + j * .1, .36);
    lipU.scale.set(.95 + wd * .4, .24, .34);
    cav.scale.set(1.2 + wd * .6, .22 + j * .92, .4);
    cav.position.y = -j * .15; tong.position.y = -.08 - j * .32; tong.visible = j > .2;
    teeth.forEach((c, i) => { c.position.x = (i ? 1 : -1) * (.17 + wd * .1); c.visible = t > tar - .1 || j > .4; c.scale.setScalar(t > tar - .1 && t < tar + 3.4 ? 1.6 : 1); });
    // head physics: nods on stressed syllables, turns slowly, tilts at commas
    const nod = j * .05 + Math.sin(t * 1.9) * .025;
    head.rotation.x = nod + (boil(3) * .004); head.rotation.y = Math.sin(t * .63) * .16 + (t > K.s6 && t < K.s7 ? .34 : 0); head.rotation.z = Math.sin(t * .47) * .06;
    body.scale.set(1 + j * .012, 1.12 - j * .012, .92);
    // blink, eye dart
    const bl = (t % 3.7) < .17 || ((t + 1.3) % 6.1) < .17;
    const look = [Math.sin(t * .8) * .05 + (t > K.s6 && t < K.s7 ? .1 : 0), Math.cos(t * .6) * .03];
    eyes.forEach((e) => { e.lid.scale.y = bl ? 1.1 : .001; e.lid.visible = bl; e.pup.position.x = look[0]; e.pup.position.y = look[1]; e.glint.position.x = look[0] + .06; });
    // arms gesture while talking
    const g1 = Math.sin(t * 2.3) * .22 * clamp01(j * 2.4 + .3), g2 = Math.sin(t * 1.9 + 1.1) * .2 * clamp01(j * 2.4 + .3);
    const raise = ramp(t, K.s7 - .1, K.s7 + .3) * (1 - ramp(t, rah - .3, rah));
    armL.rotation.z = -.28 + g1; armL.rotation.x = -.25 + g1 * .4; armR.rotation.z = .28 - g2 - raise * 2.1; armR.rotation.x = -.25 - raise * .3;
    tailG.forEach((b, i) => { const u = i / 15, w = Math.sin(t * 2.2 - i * .3) * .38 * u; b.position.set(1.05 + u * 1.1 + w * .4, .5 + u * u * 1.9, -.7 - u * .3 + w); });
    // Beats
    // s2: three tokens drop in, then swap so voice lands first. Reuses the wave as the voice token.
    const fIn = inOut(t, kar - .2, tar - .1);
    frame.visible = fIn > .01; frame.position.set(0, 3.8, 1.6 + boil(4) * .02); frame.scale.setScalar(Math.max(.01, fIn)); frame.rotation.z = boil(5) * .01;
    const wIn = Math.max(inOut(t, sus - .2, K.s3 - .2), inOut(t, suaraS4 - .2, K.s5 + .1), inOut(t, rah - .1, K.dur + 2));
    waveG.visible = wIn > .01;
    waveG.position.set(0, 3.5, -3 + boil(6) * .01);
    waveG.scale.setScalar(Math.max(.01, wIn) * 1.5);
    wave.forEach((b, i) => { const ph = Math.sin(i * .9 + t * 7); b.scale.y = .4 + (j * 2.2 + .25) * (.55 + .45 * ph); });
    const mIn = inOut(t, hed - .35, K.s6 - .1);
    machine.visible = mIn > .01; machine.position.set(0, .12, 2.4); machine.scale.setScalar(Math.max(.01, mIn));
    cardP.rotation.y = .28 + boil(7) * .02; tin.rotation.y = t;
    const aIn = inOut(t, jalurA - .2, K.s7 - .1);
    actor.visible = camClay.visible = aIn > .01;
    cat.position.x = 1 * smooth(clamp01(aIn)); actor.position.set(-1.95, 0, 2.2); actor.scale.setScalar(Math.max(.01, aIn));
    camClay.position.set(-2.9, 0, 4.6); camClay.rotation.y = Math.PI - .35; camClay.scale.setScalar(Math.max(.01, aIn));
    const gest = Math.sin(t * 2.2);
    aHead.rotation.set(j * .05, Math.sin(t * 1.3) * .35, Math.sin(t * .9) * .15); aArmL.rotation.z = -.2 - (gest > 0 ? gest * 1.3 : 0); aArmR.rotation.z = .2 + (gest < 0 ? -gest * 1.3 : 0);
    aMouth.scale.set(1.3, .5 + j * 1.3, .4);
    // the cat mirrors the actor's gesture with a beat of lag during path B
    if (aIn > .01) { head.rotation.y += Math.sin((t - .15) * 1.3) * .3; const gg = Math.sin((t - .15) * 2.2); armL.rotation.z -= gg > 0 ? gg * .9 : 0; armR.rotation.z += gg < 0 ? -gg * .9 : 0; }
    beads.forEach((b, i) => { const u = ((i / beads.length + t * .35) % 1); b.visible = aIn > .3; b.position.set(-1.5 + 2.2 * u, 2.8 + u * 1 + Math.sin(u * 3.14) * 1.2, 2 - u * .4); b.scale.setScalar(.8 + Math.sin(u * 3.14)); });
    const sA = inOut(t, K.s7 - .15, rah - .2);
    sign.visible = sA > .01; sign.position.set(1.55, 2.3, 1.5); sign.scale.setScalar(Math.max(.01, sA) * .9); sign.rotation.z = -.12 + boil(8) * .02;
    // the payoff: colour timing blocks rise from the mouth in word order
    const thr = 0;
    threads.forEach((m2, i) => { const u = ((i / 26 + t * .3) % 1); m2.visible = thr > .01; const a = i * 2.399; m2.position.set(Math.cos(a) * (.3 + u * 2.2), 3.5 + u * 6, 1.8 + Math.sin(a) * .4); m2.scale.setScalar(Math.max(.01, thr * (1 - u))); });
    const c = camTr(tc);
    // tiny stepped camera wobble, a hand-cranked rig
    cam.position.set(c[0] + boil(9) * .012, c[1] + boil(10) * .012, c[2]); cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
