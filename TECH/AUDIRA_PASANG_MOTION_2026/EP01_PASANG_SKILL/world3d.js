// BLUEPRINT TABLE (DRAFTFORGE): the skill is drawn as a technical part. One long drafting sheet, one camera, five stations along X.
// Everything is white line plus pale fill on navy paper. Lime means correct, orange means trap.
import * as THREE from "./three.module.js";
import { stage, ramp, smooth, track, clamp01, back } from "./lib3d.js";

const NAVY = 0x0d2a4a, LINE = 0xcfe8ff, LIME = 0xa3e635, ORG = 0xff6a3d;
const COND = '"Barlow Condensed"', MONO = '"JetBrains Mono"';

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: NAVY, fog: 0, exp: 1, bloom: [0.22, 0.5, 0.75], fov: 38, shadow: false });
  r.toneMapping = THREE.NoToneMapping; scene.fog = null;

  const labels = [];
  const lab = (text, { w = 720, h = 130, font = `700 92px ${MONO}`, color = "#eaf5ff", size = 4 } = {}) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const paint = () => { const x = c.getContext("2d"); x.clearRect(0, 0, w, h); x.font = font; x.fillStyle = color; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText(text, w / 2, h / 2 + 4); t.needsUpdate = true; };
    paint(); labels.push({ paint, font });
    return new THREE.Mesh(new THREE.PlaneGeometry(size, size * h / w), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  };
  // Blueprint part: pale fill and crisp edges.
  const wire = (geo, color = LINE, fill = .1) => {
    const G = new THREE.Group();
    const f = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: fill, depthWrite: false, side: THREE.DoubleSide }));
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color, transparent: true }));
    G.add(f, e); G.f = f; G.e = e;
    G.tint = (c, a = 1, fl = fill) => { f.material.color.setHex(c); e.material.color.setHex(c); e.material.opacity = a; f.material.opacity = fl * a; };
    return G;
  };
  const folderGeo = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(w * .45, h); s.lineTo(w * .36, h + h * .14); s.lineTo(0, h + h * .14); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(-w / 2, 0, -d / 2); return g; };

  // Drafting sheet with a printed grid.
  const gridC = document.createElement("canvas"); gridC.width = gridC.height = 512;
  { const x = gridC.getContext("2d"); x.fillStyle = "#0d2a4a"; x.fillRect(0, 0, 512, 512); x.strokeStyle = "rgba(190,225,255,.13)"; x.lineWidth = 1; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 512); x.moveTo(0, i * 64); x.lineTo(512, i * 64); x.stroke(); } x.strokeStyle = "rgba(190,225,255,.3)"; x.lineWidth = 2; x.strokeRect(0, 0, 512, 512); }
  const gt = new THREE.CanvasTexture(gridC); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(40, 14); gt.colorSpace = THREE.SRGBColorSpace; gt.anisotropy = 8;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(320, 112), new THREE.MeshBasicMaterial({ map: gt })); sheet.rotation.x = -Math.PI / 2; sheet.position.set(90, 0, 0); scene.add(sheet);

  // Drawn route on the sheet, inked as the film goes.
  const STX = [0, 40, 80, 120, 160, 200];
  const pathPts = []; for (let i = 0; i <= 240; i++) { const x = -4 + i * (214 / 240); pathPts.push(new THREE.Vector3(x, .03, 6.5 + Math.sin(x * .08) * 1.2)); }
  const route = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPts), new THREE.LineBasicMaterial({ color: LIME })); route.frustumCulled = false; scene.add(route);

  // A. The skill as a machined cartridge. Plates are the real top-level contents of the skill folder.
  const A = new THREE.Group(); scene.add(A);
  const PL = ["SKILL.md", "kits/", "starter/", "references/"];
  const plates = PL.map((n, i) => { const p = wire(new THREE.BoxGeometry(7, .55, 4.6), i === 0 ? LIME : LINE, i === 0 ? .22 : .1); A.add(p); const l = lab(n, { size: 4.6, color: i === 0 ? "#d9f99d" : "#eaf5ff" }); l.rotation.x = -Math.PI / 2; l.position.set(0, .3, .6); p.add(l); return p; });

  // B. Requirement blocks drop on their word.
  const B = new THREE.Group(); B.position.x = STX[1]; scene.add(B);
  const REQ = [["Claude Code", -3.1, -3, "s3:Akses"], ["Node 22.13+", 3.1, -3, "s3:Node.js"], ["ffmpeg", -3.1, 3.6, "s3:ffmpeg"], ["disk 5 GB", 3.1, 3.6, "s3:Sisakan"]];
  const reqs = REQ.map(([n, x, z, at]) => { const b = wire(new THREE.BoxGeometry(5.2, 2.3, 3.6)); b.position.set(x, 1.15, z); B.add(b); const l = lab(n, { size: 4.7, w: 720, h: 120, font: `700 86px ${COND}` }); l.position.set(0, 0, 1.82); b.add(l); b.at = AT[at]; return b; });

  // C. ZIP crate, then the folder route the skill must travel.
  const C = new THREE.Group(); C.position.x = STX[2]; scene.add(C);
  const FN = ["Users", ".claude", "skills", "audira-motion"];
  const fold = FN.map((n, i) => { const f = wire(folderGeo(4.6, 3.1, 1.1), i === 3 ? LIME : LINE, i === 3 ? .2 : .1); f.position.set(-7.5 + i * 6, 0, 1 - i * .4); C.add(f); const l = lab(n, { size: 4, w: 720, h: 110, font: `700 76px ${COND}`, color: i === 3 ? "#d9f99d" : "#eaf5ff" }); l.position.set(0, 1.3, .6); f.add(l); return f; });
  const crate = wire(new THREE.BoxGeometry(4, 3, 3), ORG, .12); crate.position.set(-14, 1.5, 1); C.add(crate);
  const zipL = lab("ZIP", { size: 2.4, w: 300, h: 130, font: `800 110px ${COND}`, color: "#ffc9b5" }); zipL.position.set(0, 0, 1.52); crate.add(zipL);
  const carg = wire(new THREE.BoxGeometry(2.3, 1.4, 1.1), LIME, .3); C.add(carg);

  // D. Trap: the wrong tree on the left, the right one on the right.
  const D = new THREE.Group(); D.position.x = STX[3]; scene.add(D);
  const wrongO = wire(folderGeo(5.6, 3.8, 1.2), ORG, .08); wrongO.position.set(-3.5, .1, 0); D.add(wrongO);
  const wrongI = wire(folderGeo(3.7, 2.45, 1), ORG, .14); wrongI.position.set(-3.5, .55, .62); D.add(wrongI);
  const fileW = wire(new THREE.BoxGeometry(1.6, 1.9, .12), ORG, .4); fileW.position.set(-3.5, 1.5, 1.3); D.add(fileW);
  const rightF = wire(folderGeo(5.6, 3.8, 1.2), LIME, .14); rightF.position.set(3.5, .1, 0); D.add(rightF);
  const fileR = wire(new THREE.BoxGeometry(2.5, 3, .14), LIME, .42); fileR.position.set(3.5, 2.1, .9); D.add(fileR);
  const mk = (d, c, x) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(d), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, transparent: true })); m.position.set(x, 6.4, 1); D.add(m); return m; };
  const xS = new THREE.Shape(); [[-1, -.75], [-.75, -1], [0, -.25], [.75, -1], [1, -.75], [.25, 0], [1, .75], [.75, 1], [0, .25], [-.75, 1], [-1, .75], [-.25, 0]].forEach(([a, b], i) => (i ? xS.lineTo(a, b) : xS.moveTo(a, b))); xS.closePath();
  const cS = new THREE.Shape(); [[-1.1, 0], [-.75, -.35], [-.3, .1], [.8, -1], [1.15, -.65], [-.3, .8]].forEach(([a, b], i) => (i ? cS.lineTo(a, b) : cS.moveTo(a, b))); cS.closePath();
  const markX = mk(xS, ORG, -3.5), markC = mk(cS, LIME, 3.5);

  // E. Download gauge at the last station, then the socket closes on the plate.
  const E = new THREE.Group(); E.position.x = STX[4]; scene.add(E);
  const gauge = []; for (let i = 0; i < 27; i++) { const b = wire(new THREE.BoxGeometry(.5, 1, 1.4), LINE, .4); b.position.set(-6.5 + i * .5, .5, 2); E.add(b); gauge.push(b); }

  // F. End of the sheet: a socket labelled for the next episode.
  const F = new THREE.Group(); F.position.x = STX[5]; scene.add(F);
  const sock = wire(new THREE.TorusGeometry(3, .35, 10, 40), LIME, .25); sock.position.y = 4.2; F.add(sock);
  const sockIn = wire(new THREE.CylinderGeometry(1.4, 1.4, .6, 6), LINE, .12); sockIn.rotation.x = Math.PI / 2; sockIn.position.y = 4.2; F.add(sockIn);

  // G. The check: a big slash and the part that answers it.
  const SX = 142;
  const G6 = new THREE.Group(); G6.position.x = SX; scene.add(G6);
  const slashS = new THREE.Shape(); [[-.9, 0], [.1, 0], [2.3, 6], [1.3, 6]].forEach(([a, b], i) => (i ? slashS.lineTo(a, b) : slashS.moveTo(a, b))); slashS.closePath();
  const slash = wire(new THREE.ExtrudeGeometry(slashS, { depth: 1.1, bevelEnabled: false }), LIME, .3); slash.position.set(-3.6, 0, 0); G6.add(slash);
  const reply = wire(new THREE.BoxGeometry(5, 1.5, 2.2), LINE, .12); reply.position.set(2.2, 2.6, 0); G6.add(reply);
  const repL = lab("audira-motion", { size: 4.6, w: 720, h: 110, font: `700 78px ${MONO}`, color: "#d9f99d" }); repL.position.set(0, 0, 1.13); reply.add(repL);

  const CAM = track([
    [0, -1, 12, 25, 0, 4.5, 0],
    [K.s2 - .2, 2, 11, 27, 0, 4.7, 0],
    [K.s3 - 1.2, -2, 9, 29, 0, 4.8, 0],
    [K.s3 + .7, STX[1] - 2, 17, 31, STX[1], 5.1, .5],
    [K.s4 - 1, STX[1] + 2, 15, 33, STX[1], 5.1, .5],
    [K.s4 + .8, STX[2] - 10, 8, 24, STX[2] - 9, 2.9, 0],
    [K.s5 - 1, STX[2] + 7, 9, 24, STX[2] + 6, 2.9, 0],
    [K.s5 + .9, STX[3], 11, 36, STX[3], 4.3, 0],
    [K.s6 - .4, STX[3] + 1, 9, 34, STX[3] + .5, 4.3, 0],
    [K.s6 + 1, SX - 1, 8, 27, SX, 3.4, 0],
    [K.s7 - .3, SX + 1, 9, 25, SX, 3.4, 0],
    [K.s7 + 2, STX[4] - 1, 9, 35, STX[4], 4.4, 0],
    [K.s8 - 1, STX[4] + 1, 10, 36, STX[4], 4.4, 0],
    [K.s8 + 1.5, STX[5], 10, 26, STX[5], 3.1, 0],
    [K.dur + 2, STX[5] + 1, 9, 23, STX[5], 3.1, 0],
  ]);
  let fontsOK = false;
  return (t) => {
    if (!fontsOK && document.fonts.check(`700 40px ${COND}`) && document.fonts.check(`700 40px ${MONO}`)) { fontsOK = true; labels.forEach((l) => l.paint()); }
    route.geometry.setDrawRange(0, Math.floor(240 * clamp01((t + 3) / K.end)));

    // Cartridge assembles for the hook, then explodes when the narration names its contents.
    const asm = smooth(clamp01(t / 1.8));
    const ex = ramp(t, AT["s2:Isinya"] - .2, AT["s2:Isinya"] + 1);
    const shut = ramp(t, AT["s2:Sekali"], AT["s2:Sekali"] + .9);
    plates.forEach((p, i) => {
      const h = (i - 1.5);
      p.position.y = 3.6 + h * (.58 + (1 - asm) * 3 + (ex - shut) * 1.15);
      p.rotation.y = .4 + Math.sin(t * .28) * .3 + (i - 1.5) * (ex - shut) * .1;
      const lit = i === 0 || (t > AT["s2:Isinya"] + i * .55 && t < AT["s2:Harus"]);
      p.tint(i === 0 ? LIME : lit ? 0xffffff : LINE, 1, i === 0 ? .22 : .1);
    });

    reqs.forEach((b, i) => { const u = back(clamp01((t - b.at) / .4), 1.4); b.visible = t > b.at - .02; b.scale.setScalar(.75 + .25 * u); b.position.y = 1.15 + (1 - clamp01((t - b.at) / .3)) * 3; b.tint(t > b.at + .5 ? LIME : LINE, 1, .1); });

    // ZIP opens, the lime part rides the folder route into the last folder.
    const opn = ramp(t, AT["s4:ekstrak"], AT["s4:ekstrak"] + .8);
    crate.scale.y = 1 - opn * .35; crate.rotation.z = opn * .1;
    const hops = [AT["s4:folder"], AT["s4:titik"], AT["s4:skills"], AT["s4:audira-motion"]];
    let hx = -14, hy = 1.5 + opn * 2.1;
    hops.forEach((a, i) => { const u = smooth(clamp01((t - a) / .55)); hx += u * (i === 0 ? 6.5 : 6); });
    const land = ramp(t, hops[3] + .4, hops[3] + 1);
    carg.position.set(hx, hy - land * 1.4 + Math.sin(clamp01((t - hops[0]) / 3) * 25) * .2 * (1 - land), 1.2 - land);
    carg.visible = t > AT["s4:ekstrak"];
    fold.forEach((f, i) => f.tint(t > hops[i] ? LIME : LINE, 1, t > hops[i] ? .2 : .1));

    // Trap: the nested tree appears first and is rejected, then the correct tree lands.
    const wa = AT["s5:membuat"], ca = AT["s5:pastikan"];
    const wIn = ramp(t, K.s5, K.s5 + .5), wNest = ramp(t, wa, wa + .6);
    wrongO.tint(ORG, wIn, .08); wrongI.tint(ORG, wNest, .14); fileW.tint(ORG, wNest, .4); wrongI.position.y = .55 + (1 - wNest) * 3;
    fileW.position.y = 1.5 + (1 - wNest) * 3.6;
    const xu = back(clamp01((t - AT["s5:menemukannya"]) / .28), 2); markX.scale.setScalar(Math.max(.001, xu)); markX.material.opacity = xu > 0 ? 1 : 0;
    const rIn = ramp(t, ca - .5, ca); rightF.tint(LIME, rIn, .14); fileR.tint(LIME, rIn, .42); fileR.position.y = 2.1 + (1 - rIn) * 3.4;
    const cu = back(clamp01((t - AT["s5:terlihat"]) / .28), 2); markC.scale.setScalar(Math.max(.001, cu)); markC.material.opacity = cu > 0 ? 1 : 0;
    D.rotation.y = Math.sin(t * .22) * .05;

    // Gauge fills across the download sentence.
    const g = (t - AT["s7:mengunduh"]) / Math.max(.5, AT["s7:Panduannya"] - AT["s7:mengunduh"]);
    gauge.forEach((b, i) => { const on = clamp01(g * gauge.length - i); b.scale.y = .25 + on * (1.4 + Math.sin(i * 1.9) * .5 + 1.1); b.position.y = b.scale.y / 2; b.tint(on > .9 ? LIME : LINE, .25 + on * .75, .4); });

    const su = back(clamp01((t - AT["s6:Ketik"]) / .35), 1.6); slash.scale.setScalar(Math.max(.001, su));
    const ru = smooth(clamp01((t - AT["s6:Muncul"]) / .4)); reply.scale.setScalar(Math.max(.001, ru)); reply.position.y = 2.6 + Math.sin(t * 1.4) * .1;
    G6.rotation.y = Math.sin(t * .3) * .12;
    sock.rotation.z = t * .3; sockIn.rotation.y = t * .22;
    const lk = ramp(t, AT["s8:kita"], AT["s8:skill"] || AT["s8:kita"] + 1.2); sock.tint(LIME, .35 + lk * .65, .25);

    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    comp.render();
  };
}
