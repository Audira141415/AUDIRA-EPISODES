// EP28 MUSA DAN PARA PENYIHIR. WAYANGFORGE: a wayang kulit performance seen from the dalang's side.
// World (x = along the screen, y = up, z = toward the camera, 1 unit ~ 10 cm of puppet): a long kelir (screen) lies at
// z = 0, glowing from a hanging blencong oil lamp that rides with the camera (top of frame). Perforated, painted
// leather puppets stand in a banana trunk (gedebog) at z ~ 1 and cast real projected shadows on the kelir: each shadow
// is the puppet scaled about the flame (s = lz / (lz - z)), plus a crimson fringe from a second, coloured lamp.
// Depiction: Musa and Harun never appear. Musa's presence is one wooden staff puppet held upright at the right frame
// edge (no hand). Firaun and the magicians are faceless ornamental figures: plain rounded heads, headdress shapes,
// perforated robes, no nose / eye / mouth carving. The magicians' ropes and sticks exist only as wobbly, doubled
// shadows (an illusion); the staff's serpent is a crisp shadow that swallows them. Firaun's punishment is never shown.
// Layout: hook stage at x ~ 0 (s1, a flash-forward), a gunungan sweeps across the lens, then the main arena x 26..48:
// Firaun's throne at x 30, the magicians' line, the floor where ropes crawl. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const GOLD = "#E3B04B", GOLD2 = "#F6D27A", INKC = "#1b0d08";

// ---------- canvas helpers
function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
// punch holes (tatahan) inside a Path2D on a lattice, leaving a rim
function tatah(x, path, x0, y0, x1, y1, step, r, rim = 7, keep) {
  x.save(); x.globalCompositeOperation = "destination-out";
  for (let yy = y0; yy <= y1; yy += step) for (let xx = x0 + ((Math.round((yy - y0) / step)) % 2) * step / 2; xx <= x1; xx += step) {
    if (keep && !keep(xx, yy)) continue;
    if (!x.isPointInPath(path, xx, yy)) continue;
    let ok = true;
    for (const [dx, dy] of [[rim, 0], [-rim, 0], [0, rim], [0, -rim]]) if (!x.isPointInPath(path, xx + dx, yy + dy)) ok = false;
    if (!ok) continue;
    x.beginPath(); x.arc(xx, yy, r, 0, Math.PI * 2); x.fill();
  }
  x.restore();
}
function shadowOf(src, blur) {
  const c = mk(src.width, src.height), x = c.getContext("2d");
  x.filter = `blur(${blur}px)`; x.drawImage(src, 0, 0); x.filter = "none";
  x.globalCompositeOperation = "source-in"; x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
  return c;
}
function crop(src, y0, y1) { const c = mk(src.width, y1 - y0); c.getContext("2d").drawImage(src, 0, -y0); return c; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function goldLine(x, w = 3) { x.strokeStyle = GOLD; x.lineWidth = w; x.stroke(); }

// ---------- puppet drawings (all faceless: heads are plain rounded shapes)
function drawMagician(v) {
  const c = mk(300, 720), x = c.getContext("2d");
  x.lineJoin = x.lineCap = "round";
  // gapit (central horn rod)
  x.fillStyle = "#3a2213"; x.fillRect(147, 70, 6, 650);
  // back arm
  x.strokeStyle = v.dark; x.lineWidth = 15;
  x.beginPath(); x.moveTo(140, 196); x.quadraticCurveTo(108, 270, 126, 372); x.stroke();
  // lower robe (dodot) with a back flick and a pointed front panel
  const robe = new Path2D();
  robe.moveTo(112, 326); robe.bezierCurveTo(100, 420, 82, 520, 62, 628); robe.quadraticCurveTo(40, 640, 22, 668);
  robe.quadraticCurveTo(70, 662, 92, 658); robe.lineTo(206, 658); robe.quadraticCurveTo(232, 600, 252, 676);
  robe.quadraticCurveTo(250, 560, 214, 470); robe.bezierCurveTo(200, 420, 192, 370, 190, 326); robe.closePath();
  x.fillStyle = v.robe; x.fill(robe); x.lineWidth = 4; x.strokeStyle = GOLD; x.stroke(robe);
  for (const yy of [392, 470, 548]) { x.save(); x.clip(robe); x.fillStyle = v.band; x.fillRect(0, yy, 300, 26); x.strokeStyle = GOLD; x.lineWidth = 3; x.strokeRect(-5, yy, 310, 26); x.restore(); }
  tatah(x, robe, 60, 400, 250, 640, 13, 2.6, 6, (xx, yy) => ((yy - 392) % 78) < 30);
  // feet
  x.fillStyle = v.skin; x.beginPath(); x.ellipse(132, 682, 30, 10, 0, 0, 7); x.ellipse(176, 684, 30, 10, 0, 0, 7); x.fill();
  x.fillStyle = "#3a2213"; x.fillRect(147, 650, 6, 70);
  // torso
  const tor = new Path2D();
  tor.moveTo(122, 180); tor.quadraticCurveTo(108, 250, 112, 330); tor.lineTo(192, 330); tor.quadraticCurveTo(196, 250, 182, 180); tor.closePath();
  x.fillStyle = v.body; x.fill(tor); x.strokeStyle = GOLD; x.lineWidth = 3; x.stroke(tor);
  x.fillStyle = v.band; x.fillRect(110, 306, 84, 24); x.strokeStyle = GOLD; x.strokeRect(110, 306, 84, 24);
  // collar (kalung) with holes
  const col = new Path2D(); col.ellipse(152, 186, 40, 18, 0, 0, Math.PI * 2);
  x.fillStyle = GOLD; x.fill(col);
  x.save(); x.globalCompositeOperation = "destination-out"; for (let a = 0.15; a < 3.0; a += 0.36) { x.beginPath(); x.arc(152 + 30 * Math.cos(a), 186 + 12 * Math.sin(a), 3.2, 0, 7); x.fill(); } x.restore();
  // front arm, long and thin, wayang style, to the hand near the knee
  x.strokeStyle = v.skin; x.lineWidth = 15;
  x.beginPath(); x.moveTo(176, 196); x.quadraticCurveTo(214, 268, 230, 360); x.stroke();
  x.fillStyle = GOLD; x.beginPath(); x.arc(230, 364, 10, 0, 7); x.fill();
  x.fillStyle = GOLD; x.fillRect(184, 236, 26, 10);
  // neck + plain rounded head (no features)
  x.fillStyle = v.skin; x.fillRect(141, 140, 22, 40);
  x.beginPath(); x.ellipse(156, 122, 33, 38, 0.15, 0, Math.PI * 2); x.fill();
  // headdress: three cap shapes
  const cap = new Path2D();
  if (v.cap === 0) { cap.moveTo(118, 108); cap.bezierCurveTo(116, 40, 150, 6, 196, 18); cap.quadraticCurveTo(214, 24, 206, 44); cap.quadraticCurveTo(186, 30, 182, 52); cap.bezierCurveTo(186, 70, 192, 90, 192, 108); cap.closePath(); }
  else if (v.cap === 1) { cap.moveTo(116, 110); cap.lineTo(124, 52); cap.quadraticCurveTo(156, 0, 188, 52); cap.lineTo(196, 110); cap.closePath(); }
  else { cap.moveTo(114, 110); cap.quadraticCurveTo(110, 66, 134, 40); cap.lineTo(156, 4); cap.lineTo(176, 40); cap.quadraticCurveTo(200, 66, 196, 110); cap.closePath(); }
  x.fillStyle = v.capc; x.fill(cap); x.strokeStyle = GOLD; x.lineWidth = 3; x.stroke(cap);
  tatah(x, cap, 110, 20, 210, 100, 11, 2.4, 5);
  x.fillStyle = GOLD; x.fillRect(114, 98, 84, 14);
  x.save(); x.globalCompositeOperation = "destination-out"; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(122 + i * 14, 105, 3, 0, 7); x.fill(); } x.restore();
  // hair knot at the back (still no face)
  x.fillStyle = v.dark; x.beginPath(); x.ellipse(118, 132, 14, 20, 0.3, 0, 7); x.fill();
  return c;
}

function drawFiraun() {
  const c = mk(520, 760), x = c.getContext("2d");
  x.lineJoin = x.lineCap = "round";
  const RED = "#6a1410", DK = "#2a0c08";
  // throne: tall perforated back + seat + legs
  const th = new Path2D();
  th.moveTo(70, 650); th.lineTo(70, 200); th.quadraticCurveTo(74, 150, 112, 140); th.quadraticCurveTo(150, 150, 152, 200); th.lineTo(152, 470);
  th.lineTo(352, 470); th.lineTo(352, 500); th.lineTo(330, 500); th.lineTo(330, 680); th.lineTo(310, 680); th.lineTo(310, 500); th.lineTo(110, 500); th.lineTo(110, 680); th.lineTo(70, 680); th.closePath();
  x.fillStyle = "#4a2a10"; x.fill(th); x.strokeStyle = GOLD; x.lineWidth = 4; x.stroke(th);
  tatah(x, th, 70, 160, 160, 460, 12, 3, 7);
  x.fillStyle = GOLD; x.beginPath(); x.arc(111, 172, 16, 0, 7); x.fill();
  // base plinth
  x.fillStyle = "#3a200c"; x.fillRect(50, 680, 330, 34); x.strokeStyle = GOLD; x.lineWidth = 3; x.strokeRect(50, 680, 330, 34);
  x.save(); x.globalCompositeOperation = "destination-out"; for (let i = 0; i < 15; i++) { x.beginPath(); x.moveTo(62 + i * 21, 707); x.lineTo(72 + i * 21, 687); x.lineTo(82 + i * 21, 707); x.fill(); } x.restore();
  x.fillStyle = "#3a2213"; x.fillRect(214, 80, 7, 680);
  // seated body: torso, lap, shins
  const bd = new Path2D();
  bd.moveTo(170, 268); bd.quadraticCurveTo(150, 360, 160, 470); bd.lineTo(370, 466); bd.quadraticCurveTo(392, 470, 392, 500); bd.lineTo(398, 690); bd.lineTo(356, 690); bd.lineTo(352, 512); bd.lineTo(170, 512);
  bd.quadraticCurveTo(150, 500, 158, 470); bd.lineTo(252, 470); bd.quadraticCurveTo(262, 360, 252, 268); bd.closePath();
  x.fillStyle = RED; x.fill(bd); x.strokeStyle = GOLD; x.lineWidth = 4; x.stroke(bd);
  x.save(); x.clip(bd); x.fillStyle = "#8a6420"; x.fillRect(0, 430, 520, 26); x.fillRect(150, 560, 400, 20); x.restore();
  tatah(x, bd, 150, 280, 400, 680, 13, 2.8, 6);
  x.fillStyle = "#b8873c"; x.beginPath(); x.ellipse(384, 700, 34, 11, 0, 0, 7); x.fill();
  // broad collar
  x.fillStyle = GOLD; x.beginPath(); x.ellipse(212, 274, 54, 24, 0, 0, 7); x.fill();
  x.save(); x.globalCompositeOperation = "destination-out"; for (let a = 0.1; a < 3.1; a += 0.3) { x.beginPath(); x.arc(212 + 42 * Math.cos(a), 274 + 16 * Math.sin(a), 3.4, 0, 7); x.fill(); } x.restore();
  // neck + plain rounded head
  x.fillStyle = "#1e120c"; x.fillRect(198, 220, 30, 44);
  x.beginPath(); x.ellipse(216, 196, 40, 46, 0.12, 0, 7); x.fill();
  // nemes-like headcloth falling behind the head
  x.fillStyle = "#2f3f6e"; x.beginPath(); x.moveTo(176, 168); x.quadraticCurveTo(150, 230, 160, 300); x.lineTo(194, 296); x.quadraticCurveTo(188, 230, 196, 180); x.closePath(); x.fill();
  x.strokeStyle = GOLD; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(166 + i * 1, 196 + i * 18); x.lineTo(192 - i * .5, 194 + i * 18); x.stroke(); }
  // tall ornamental crown
  const cr = new Path2D();
  cr.moveTo(178, 168); cr.lineTo(176, 120); cr.quadraticCurveTo(178, 30, 214, 12); cr.quadraticCurveTo(250, 30, 252, 120); cr.lineTo(256, 168); cr.closePath();
  x.fillStyle = "#d8c49a"; x.fill(cr); x.strokeStyle = GOLD; x.lineWidth = 4; x.stroke(cr);
  x.fillStyle = RED; x.beginPath(); x.moveTo(170, 170); x.lineTo(164, 96); x.lineTo(186, 104); x.lineTo(190, 170); x.closePath(); x.fill(); x.strokeStyle = GOLD; x.stroke();
  tatah(x, cr, 176, 30, 256, 160, 12, 2.6, 6);
  x.fillStyle = GOLD; x.fillRect(172, 156, 88, 16);
  x.beginPath(); x.moveTo(250, 150); x.quadraticCurveTo(286, 120, 268, 96); x.quadraticCurveTo(262, 120, 248, 132); x.fill();
  return c;
}
function drawArm(skin) {
  const c = mk(300, 70), x = c.getContext("2d");
  x.lineCap = "round"; x.strokeStyle = skin; x.lineWidth = 17;
  x.beginPath(); x.moveTo(20, 35); x.quadraticCurveTo(150, 46, 270, 34); x.stroke();
  x.fillStyle = GOLD; x.fillRect(110, 28, 22, 18);
  x.beginPath(); x.arc(276, 34, 12, 0, 7); x.fill();
  return c;
}
function drawStaff() {
  const c = mk(60, 820), x = c.getContext("2d");
  const g = x.createLinearGradient(16, 0, 44, 0); g.addColorStop(0, "#4a2a12"); g.addColorStop(0.45, "#9a6a34"); g.addColorStop(1, "#3a200c");
  x.fillStyle = g; x.beginPath(); x.moveTo(17, 790); x.lineTo(19, 70); x.quadraticCurveTo(12, 26, 32, 8); x.quadraticCurveTo(52, 26, 45, 70); x.lineTo(43, 790); x.closePath(); x.fill();
  x.strokeStyle = "rgba(30,14,6,.5)"; x.lineWidth = 1.5; for (let i = 0; i < 18; i++) { x.beginPath(); x.moveTo(27 + (i % 3) * 3, 90 + i * 38); x.lineTo(28 + (i % 3) * 3, 120 + i * 38); x.stroke(); }
  x.fillStyle = GOLD; x.fillRect(22, 120, 18, 8);
  return c;
}
function drawGunungan() {
  const c = mk(512, 820), x = c.getContext("2d");
  x.lineJoin = x.lineCap = "round";
  const body = new Path2D();
  body.moveTo(256, 14); body.bezierCurveTo(330, 120, 500, 300, 492, 470); body.quadraticCurveTo(488, 560, 400, 640);
  body.lineTo(112, 640); body.quadraticCurveTo(24, 560, 20, 470); body.bezierCurveTo(12, 300, 182, 120, 256, 14); body.closePath();
  const gr = x.createLinearGradient(0, 0, 0, 640); gr.addColorStop(0, "#5a0f0c"); gr.addColorStop(0.6, "#7a1a12"); gr.addColorStop(1, "#3a1a0a");
  x.fillStyle = gr; x.fill(body); x.lineWidth = 7; x.strokeStyle = GOLD; x.stroke(body);
  // tree of life: trunk and spiral branches
  x.save(); x.clip(body);
  x.strokeStyle = GOLD2; x.lineWidth = 10; x.beginPath(); x.moveTo(256, 640); x.lineTo(256, 90); x.stroke();
  for (let i = 0; i < 7; i++) {
    const y = 560 - i * 66, L = 70 + 120 * Math.sin((i + 1) / 8 * Math.PI);
    for (const s of [-1, 1]) {
      x.lineWidth = 6; x.strokeStyle = GOLD; x.beginPath(); x.moveTo(256, y); x.quadraticCurveTo(256 + s * L * 0.6, y - 40, 256 + s * L, y - 14);
      x.stroke(); x.beginPath(); x.arc(256 + s * L - s * 10, y - 26, 14, 0, 7); x.stroke();
      x.fillStyle = "#2f5a3a"; x.beginPath(); x.ellipse(256 + s * L * 0.55, y - 46, 22, 11, s * 0.5, 0, 7); x.fill();
    }
  }
  x.restore();
  tatah(x, body, 20, 40, 492, 630, 15, 3.2, 9, (xx, yy) => Math.abs(xx - 256) > 14);
  // inner border ring of holes
  // base: gate with two doors and a plaque that carries AUDIRA as perforated letters
  x.fillStyle = "#3a200c"; x.fillRect(150, 560, 212, 120); x.strokeStyle = GOLD; x.lineWidth = 5; x.strokeRect(150, 560, 212, 120);
  x.fillStyle = "#6a1410"; x.fillRect(166, 576, 86, 104); x.fillRect(260, 576, 86, 104);
  x.strokeStyle = GOLD; x.lineWidth = 3; x.strokeRect(166, 576, 86, 104); x.strokeRect(260, 576, 86, 104);
  x.fillStyle = GOLD; x.beginPath(); x.moveTo(140, 560); x.lineTo(256, 506); x.lineTo(372, 560); x.closePath(); x.fill();
  x.fillStyle = "#c79434"; x.fillRect(96, 690, 320, 96); x.strokeStyle = "#5a3a10"; x.lineWidth = 4; x.strokeRect(96, 690, 320, 96);
  x.save(); x.globalCompositeOperation = "destination-out";
  x.font = "700 62px Georgia, 'Times New Roman', serif"; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText("AUDIRA", 256, 741);
  for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(112 + i * 26.5, 702, 3, 0, 7); x.fill(); x.beginPath(); x.arc(112 + i * 26.5, 776, 3, 0, 7); x.fill(); }
  x.restore();
  x.fillStyle = "#3a2213"; x.fillRect(252, 786, 8, 34);
  return c;
}
function drawSun() {
  const c = mk(256, 256), x = c.getContext("2d");
  x.fillStyle = GOLD; x.beginPath();
  for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r = i % 2 ? 84 : 122; x.lineTo(128 + r * Math.cos(a), 128 + r * Math.sin(a)); }
  x.closePath(); x.fill();
  x.fillStyle = "#c2501e"; x.beginPath(); x.arc(128, 128, 76, 0, 7); x.fill(); x.strokeStyle = GOLD2; x.lineWidth = 5; x.stroke();
  x.save(); x.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; x.beginPath(); x.arc(128 + 58 * Math.cos(a), 128 + 58 * Math.sin(a), 6, 0, 7); x.fill(); x.beginPath(); x.arc(128 + 100 * Math.cos(a + 0.1), 128 + 100 * Math.sin(a + 0.1), 3.5, 0, 7); x.fill(); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.beginPath(); x.ellipse(128 + 28 * Math.cos(a), 128 + 28 * Math.sin(a), 12, 5, a, 0, 7); x.fill(); }
  x.restore();
  return c;
}
function drawTreasure() {
  const c = mk(256, 200), x = c.getContext("2d");
  x.fillStyle = "#d9a441";
  for (let i = 0; i < 14; i++) { const a = (i * 2.4) % 6.28, rr = 18 + (i * 7) % 36; x.beginPath(); x.arc(128 + rr * Math.cos(a) * 1.6, 88 - Math.abs(rr * Math.sin(a)) * 0.9, 17, 0, 7); x.fill(); x.strokeStyle = "#8a5a18"; x.lineWidth = 2; x.stroke(); }
  const b = new Path2D(); b.moveTo(30, 96); b.lineTo(226, 96); b.quadraticCurveTo(220, 176, 128, 182); b.quadraticCurveTo(36, 176, 30, 96); b.closePath();
  x.fillStyle = "#b8862e"; x.fill(b); x.strokeStyle = GOLD2; x.lineWidth = 4; x.stroke(b);
  tatah(x, b, 30, 104, 226, 176, 13, 3, 6);
  return c;
}
function drawCrowd(seed) {
  const c = mk(2048, 170), x = c.getContext("2d"), R = mulberry(seed);
  x.fillStyle = "#fff";
  for (let row = 0; row < 3; row++) {
    const y0 = 170 - row * 22, sc = 1 - row * 0.12;
    for (let px = 10 + row * 13; px < 2040; px += (34 + R() * 16) * sc) {
      const hr = (14 + R() * 4) * sc, sh = (26 + R() * 6) * sc;
      x.beginPath(); x.ellipse(px, y0 - 6, sh, 40 * sc, 0, Math.PI, 0); x.fill();
      x.beginPath(); x.arc(px + (R() - 0.5) * 4, y0 - 44 * sc - hr * 0.6, hr, 0, 7); x.fill();
    }
  }
  return shadowOf(c, 3);
}

// ---------- the screen (kelir) shader: oil-lamp hot spot, cloth weave, coloured falloff
const SCREEN_FS = `
uniform vec2 uL; uniform float uI,uRed,uGold,uT;
varying vec2 vP;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 d=(vP-uL)*vec2(1.,1.25);
  float r2=dot(d,d);
  float g=uI*(.85*exp(-r2/(2.*5.2*5.2))+.3*exp(-r2/(2.*13.*13.)));
  vec3 deep=vec3(.13,.035,.02), mid=vec3(.86,.45,.16), hot=vec3(1.,.74,.42);
  vec3 c=mix(deep,mid,smoothstep(.0,.55,g));
  c=mix(c,hot,smoothstep(.45,1.05,g));
  c=mix(c,c*vec3(1.15,.55,.45),uRed*smoothstep(.1,.8,g));
  c+=uGold*vec3(.28,.2,.06)*smoothstep(.3,1.,g);
  float w=.965+.035*sin(vP.x*90.)*sin(vP.y*90.)+.02*(h(floor(vP*30.))-.5);
  c*=w;
  c*=smoothstep(-1.3,.4,vP.y)*.35+.65;
  c*=1.-.55*smoothstep(11.5,13.6,vP.y);
  gl_FragColor=vec4(c*.5,1.);
}`;
const SCREEN_VS = `varying vec2 vP; void main(){ vec4 w=modelMatrix*vec4(position,1.); vP=w.xy; gl_Position=projectionMatrix*viewMatrix*w; }`;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x090403, fog: 0, exp: 1.0, bloom: [0.35, 0.5, 0.86], fov: 38, shadow: false });
  scene.fog = null;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2028);

  // ---------- kelir, frame, gedebog, kotak, gamelan
  const scrU = { uL: { value: new THREE.Vector2() }, uI: { value: 1 }, uRed: { value: 0 }, uGold: { value: 0 }, uT: { value: 0 } };
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(130, 18), new THREE.ShaderMaterial({ uniforms: scrU, vertexShader: SCREEN_VS, fragmentShader: SCREEN_FS }));
  screen.position.set(25, 5, 0); scene.add(screen);
  // top cloth border (plangitan) + wooden beam
  const borderT = canvasTex(512, 64, (x, w, h) => { x.fillStyle = "#3a0a0a"; x.fillRect(0, 0, w, h); x.fillStyle = "#120404"; x.fillRect(0, 0, w, 22); x.fillStyle = "#c99a3a"; x.fillRect(0, 22, w, 4); x.fillRect(0, h - 8, w, 4); for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(i * 32, h - 8); x.lineTo(i * 32 + 16, 34); x.lineTo(i * 32 + 32, h - 8); x.fillStyle = "#7a1a12"; x.fill(); } }, [26, 1]);
  const border = new THREE.Mesh(new THREE.PlaneGeometry(130, 2.2), new THREE.MeshBasicMaterial({ map: borderT, color: 0x9a7a6a }));
  border.position.set(25, 13.9, 0.05); scene.add(border);
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 0.6 });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(130, 0.5, 0.5), wood); beam.position.set(25, 15.1, 0.2); scene.add(beam);
  // gedebog: banana trunk the puppets stand in
  const gedT = canvasTex(256, 64, (x, w, h) => { x.fillStyle = "#6c6a36"; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = i % 2 ? "rgba(40,36,14,.35)" : "rgba(170,160,100,.25)"; x.fillRect(0, i * 1.6, w, 1); } }, [30, 1]);
  const ged = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 130, 24, 1, false), new THREE.MeshStandardMaterial({ map: gedT, roughness: 0.75 }));
  ged.rotation.z = Math.PI / 2; ged.position.set(25, -0.45, 2.2); scene.add(ged);
  const kotak = new THREE.Mesh(new THREE.BoxGeometry(130, 12, 1.4), new THREE.MeshStandardMaterial({ color: 0x24140a, roughness: 0.7 }));
  kotak.position.set(25, -7.1, 2.4); scene.add(kotak);
  const trimT = canvasTex(512, 32, (x, w, h) => { x.fillStyle = "#2a1608"; x.fillRect(0, 0, w, h); x.fillStyle = "#b8862e"; for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(i * 32 + 16, 16, 7, 0, 7); x.fill(); } x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3); }, [60, 1]);
  const trim = new THREE.Mesh(new THREE.PlaneGeometry(130, 0.5), new THREE.MeshStandardMaterial({ map: trimT, roughness: 0.5, metalness: 0.3 }));
  trim.position.set(25, -1.45, 3.11); scene.add(trim);
  // gamelan: two rows of bonang kettles on a wooden frame, foreground
  const bronze = new THREE.MeshStandardMaterial({ color: 0xb07a36, roughness: 0.32, metalness: 0.85 });
  const NK = 120, ket = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), bronze, NK);
  const knob = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 12, 8), bronze, NK);
  const fm = new THREE.Matrix4(), tv = new THREE.Vector3(), fq = new THREE.Quaternion(), fs = new THREE.Vector3();
  for (let i = 0; i < NK; i++) {
    const row = i % 2, xx = -12 + Math.floor(i / 2) * 1.12 + row * 0.56, y = -3.05 + row * 0.25, z = 10.5 - row * 0.9;
    fm.compose(tv.set(xx, y, z), fq.identity(), fs.set(1, 0.62, 1)); ket.setMatrixAt(i, fm);
    fm.compose(tv.set(xx, y + 0.27, z), fq.identity(), fs.set(1, 1, 1)); knob.setMatrixAt(i, fm);
  }
  scene.add(ket, knob);
  for (const [z, y] of [[10.5, -3.1], [9.6, -2.85]]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(80, 0.18, 0.5), new THREE.MeshStandardMaterial({ color: 0x5a1a10, roughness: 0.5 })); rail.position.set(26, y - 0.1, z); scene.add(rail); }
  // a hanging gong at the arena's right
  const gong = new THREE.Group();
  const gd = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.18, 40), bronze); gd.rotation.x = Math.PI / 2; gong.add(gd);
  const gb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 12), bronze); gb.position.z = 0.12; gong.add(gb);
  const gf = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a1a10 })); gf.position.y = 2.1; gong.add(gf);
  gong.position.set(48.5, -1.6, 7.5); scene.add(gong);

  // lights: the flame point light rides with the lamp, low warm fill
  const flameL = new THREE.PointLight(0xffa24a, 420, 0, 2); scene.add(flameL);
  scene.add(new THREE.HemisphereLight(0x5a3a28, 0x100604, 0.55));

  // ---------- blencong (lamp prop): brass bird vessel with a wick and flame, hanging on a chain
  const lamp = new THREE.Group(); scene.add(lamp);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc28a3a, roughness: 0.28, metalness: 0.9, emissive: 0x3a1a04, emissiveIntensity: 0.6 });
  const lb = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), brass); lb.scale.set(1.35, 0.8, 0.9); lamp.add(lb);
  const ln = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 10, 24, Math.PI * 1.1), brass); ln.position.set(-0.36, 0.28, 0); ln.rotation.z = 0.2; lamp.add(ln);
  const lw = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 24, Math.PI), brass); lw.position.set(0.1, 0.15, 0); lw.rotation.z = 0.5; lamp.add(lw);
  const sp = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 12), brass); sp.rotation.z = -1.25; sp.position.set(0.6, 0.06, 0); lamp.add(sp);
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 6, 6), brass); chain.position.set(0, 3.2, 0); lamp.add(chain);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.72, 0.32).multiplyScalar(4.5), toneMapped: false }));
  flame.position.set(0.8, 0.28, 0); lamp.add(flame);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,200,120,.9)"); g.addColorStop(0.3, "rgba(255,140,50,.35)"); g.addColorStop(1, "rgba(255,120,40,0)"); x.fillStyle = g; x.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(2.2, 2.2, 1); halo.position.copy(flame.position); lamp.add(halo);

  // ---------- puppet rig: puppet parts + mirrored shadow parts (main + crimson fringe)
  const SHM = (col, op) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, alphaMap: null });
  const PUPS = [];
  function part(canvasSrc, worldH, piv, blur = 4) {
    const cw = canvasSrc.width, ch = canvasSrc.height, w = worldH * cw / ch;
    const geo = new THREE.PlaneGeometry(w, worldH);
    geo.translate(-((piv[0] / cw - 0.5) * w), -((0.5 - piv[1] / ch) * worldH), 0);
    return { geo, map: tex(canvasSrc), smap: tex(shadowOf(canvasSrc, blur)) };
  }
  function puppet(spec, z = 1.0, opts = {}) {
    const P = { G: new THREE.Group(), SG: new THREE.Group(), FG: new THREE.Group(), nodes: [], mats: [], smats: [], fmats: [], op: 1, shadow: opts.shadow !== false, fringe: opts.fringe ?? 1, sh: opts.sh ?? 0.8 };
    P.G.position.z = z; scene.add(P.G);
    if (P.shadow) { scene.add(P.SG, P.FG); }
    const build = (s, parentP, parentS, parentF) => {
      const pm = new THREE.MeshStandardMaterial({ map: s.p.map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.62, metalness: 0.12, emissive: 0xffffff, emissiveMap: s.p.map, emissiveIntensity: 0.18 });
      const sm1 = new THREE.MeshBasicMaterial({ color: 0x160806, alphaMap: s.p.smap, transparent: true, opacity: 0.86, depthWrite: false });
      const sm2 = new THREE.MeshBasicMaterial({ color: 0x8a1a3a, alphaMap: s.p.smap, transparent: true, opacity: 0.5, depthWrite: false });
      const np = new THREE.Group(), ns = new THREE.Group(), nf = new THREE.Group();
      const mp = new THREE.Mesh(s.p.geo, pm), ms = new THREE.Mesh(s.p.geo, sm1), mf = new THREE.Mesh(s.p.geo, sm2);
      mp.renderOrder = 5; ms.renderOrder = 3; mf.renderOrder = 2;
      np.add(mp); ns.add(ms); nf.add(mf);
      if (s.pos) for (const g of [np, ns, nf]) g.position.set(s.pos[0], s.pos[1], s.z || 0);
      if (s.z) { ns.position.z = 0; nf.position.z = 0; }
      parentP.add(np); parentS.add(ns); parentF.add(nf);
      P.nodes.push([np, ns, nf]); P.mats.push(pm); P.smats.push(sm1); P.fmats.push(sm2);
      const node = { n: np };
      if (s.kids) node.kids = s.kids.map((k) => build(k, np, ns, nf));
      return node;
    };
    P.root = build(spec, P.G, P.SG, P.FG);
    PUPS.push(P);
    return P;
  }
  const L = new THREE.Vector3();
  function syncShadows() {
    for (const P of PUPS) {
      if (!P.shadow) continue;
      for (const [np, ns, nf] of P.nodes) { ns.position.x = nf.position.x = np.position.x; ns.position.y = nf.position.y = np.position.y; ns.rotation.copy(np.rotation); nf.rotation.copy(np.rotation); ns.scale.copy(np.scale); nf.scale.copy(np.scale); }
      const g = P.G, s = L.z / Math.max(0.5, L.z - g.position.z);
      const X = L.x + (g.position.x - L.x) * s, Y = L.y + (g.position.y - L.y) * s;
      P.SG.position.set(X, Y, 0.03); P.FG.position.set(X + 0.3 * s, Y - 0.08, 0.02);
      for (const S of [P.SG, P.FG]) { S.rotation.copy(g.rotation); S.scale.copy(g.scale).multiplyScalar(s); S.visible = g.visible && P.op > 0.01; }
      const far = clamp01((g.position.z - 1.2) / 9);
      P.smats.forEach((m) => (m.opacity = P.sh * P.op * (1 - 0.45 * far)));
      P.fmats.forEach((m) => (m.opacity = 0.46 * P.fringe * P.op * (1 - 0.3 * far)));
    }
  }
  function setOp(P, o) { P.op = o; P.G.visible = o > 0.01; P.mats.forEach((m) => { m.transparent = o < 0.999; m.opacity = o; m.alphaTest = o < 0.999 ? 0.02 : 0.5; m.depthWrite = o > 0.999; }); }

  // ---------- build the cast
  const MV = [
    { robe: "#5e1712", band: "#2a0e0a", body: "#4a120e", skin: "#c08a3e", dark: "#2a120a", capc: "#1f2a52", cap: 0 },
    { robe: "#1f2c58", band: "#0e1430", body: "#18224a", skin: "#b5823a", dark: "#121830", capc: "#7a1a12", cap: 1 },
    { robe: "#1e4a36", band: "#0c2418", body: "#163a2a", skin: "#c08a3e", dark: "#0e2016", capc: "#5e1712", cap: 2 },
    { robe: "#4a1a40", band: "#200a1c", body: "#3a1232", skin: "#b5823a", dark: "#200a1a", capc: "#1e4a36", cap: 0 },
    { robe: "#6a3a10", band: "#2a1606", body: "#552c0c", skin: "#c08a3e", dark: "#2a1606", capc: "#1f2c58", cap: 1 },
  ];
  const MH = 6.6, MK = MH / 720, HIPY = (720 - 330) * MK;
  const mags = MV.map((v, i) => {
    const full = drawMagician(v);
    const up = part(crop(full, 0, 338), 338 * MK, [150, 330]);
    const lo = part(crop(full, 322, 720), 398 * MK, [150, 8]);
    const P = puppet({ p: lo, kids: [{ p: up, pos: [0, 0], z: 0.01 }] }, 2.2 + i * 0.02);
    P.up = P.nodes[1][0]; P.lo = P.nodes[0][0];
    return P;
  });
  const firC = drawFiraun(), FH = 7.4, FK = FH / 760;
  const fir = puppet({ p: part(firC, FH, [260, 714]), kids: [{ p: part(drawArm("#1e120c"), 70 * FK, [20, 35]), pos: [(232 - 260) * FK, (714 - 300) * FK], z: 0.01 }] }, 0.95);
  fir.arm = fir.nodes[1][0];
  const staff = puppet({ p: part(drawStaff(), 6.6, [30, 410], 3) }, 1.25, { sh: 0.85 });
  const gunC = drawGunungan();
  const gun = puppet({ p: part(gunC, 10.2, [256, 810], 5) }, 1.6, { sh: 0.8 });
  const gunSweep = puppet({ p: part(gunC, 10.2, [256, 410], 5) }, 0, { shadow: false });
  const sun = puppet({ p: part(drawSun(), 2.3, [128, 128], 4) }, 0.85, { sh: 0.7 });
  const gift = puppet({ p: part(drawTreasure(), 1.15, [128, 100], 3) }, 1.3, { sh: 0.7 });
  // crowd shadows (audience, shadow only, faceless dots)
  const crowdM = new THREE.MeshBasicMaterial({ color: 0x150705, alphaMap: tex(drawCrowd(7)), transparent: true, opacity: 0.0, depthWrite: false });
  const crowd = new THREE.Mesh(new THREE.PlaneGeometry(34, 34 * 170 / 2048), crowdM); crowd.renderOrder = 1; scene.add(crowd);
  const crowdM2 = crowdM.clone(); crowdM2.alphaMap = tex(drawCrowd(19)); crowdM2.color.set(0x3a0c1a);
  const crowd2 = new THREE.Mesh(crowd.geometry, crowdM2); crowd2.renderOrder = 1; scene.add(crowd2);

  // ---------- dynamic shadow layer for the illusions (ropes, sticks) and the serpent
  const FX0 = 31, FX1 = 51, FY0 = -0.6, FY1 = 6.4, FPU = 102.4;
  const fxC = mk(Math.round((FX1 - FX0) * FPU), Math.round((FY1 - FY0) * FPU)), fx = fxC.getContext("2d");
  const fxT = new THREE.CanvasTexture(fxC); fxT.colorSpace = THREE.SRGBColorSpace;
  const fxMesh = new THREE.Mesh(new THREE.PlaneGeometry(FX1 - FX0, FY1 - FY0), new THREE.MeshBasicMaterial({ map: fxT, transparent: true, depthWrite: false }));
  fxMesh.position.set((FX0 + FX1) / 2, (FY0 + FY1) / 2, 0.04); fxMesh.renderOrder = 4; scene.add(fxMesh);
  const PX = (x) => (x - FX0) * FPU, PY = (y) => (FY1 - y) * FPU;

  // ---------- dust motes in the lamp light
  const NDU = 140, dust = pts(scene, NDU, { color: 0xffc27a, size: 0.07, opacity: 0.55 });
  const DU = Array.from({ length: NDU }, () => ({ x: rnd() * 16 - 8, y: rnd() * 12 - 1, z: 2 + rnd() * 12, s: 0.1 + rnd() * 0.25, p: rnd() * 6.28 }));

  // ---------- timing
  const tSw = K.s2 - 0.2;                                 // camera jump hidden behind the sweeping gunungan
  const tBow1 = A("s1:bersujud") - 0.35;
  const tWalk = K.s3 - 0.1, tAsk = A("s3:bertanya"), tAns = A("s3:silakan");
  const tGift = A("s3:hadiah"), tGiftOut = A("s3:Mereka");
  const tStep = K.s4 - 0.15, tThrow = K.s4 + 0.35, tFear = A("s4:Musa"), tFearE = A("s4:Seorang");
  const tWah = A("s5:wahyu"), tLemp = A("s5:Lemparkan"), tLand = A("s5:Tongkat") - 0.5, tSwal = A("s5:Tongkat"), tSwalE = A("s5:buat") + 0.2;
  const tKini = A("s6:merunduk") - 0.3, tPaham = A("s6:paham");
  const tMurka = A("s7:murka"), tAncam = A("s7:mengancam"), tJawab = A("s7:Jawab");
  const tGun = K.s8 - 0.1;

  // ---------- camera
  const camA = track([[0, 0.4, 37.5], [3, 0.1, 34.5], [6.2, -0.1, 32], [7.4, -0.4, 31]]);
  const camB = track([[tSw, 30.2, 31], [12, 30.9, 29.6], [16.5, 31.6, 30], [K.s3 - 0.2, 32.6, 31.2], [23, 36.4, 32], [27, 38.6, 31], [31, 39.4, 30.5], [K.s4, 39.9, 30], [37.5, 40.4, 29.2], [K.s5, 40.7, 29.6], [47.4, 41.0, 31], [50.6, 40.3, 32.6], [K.s6, 39.0, 31.6], [59.5, 37.0, 29], [63.5, 36.4, 22], [K.s7 - 0.2, 35.9, 23.5], [68, 34.4, 33.5], [73, 34.2, 34.5], [K.s8 - 0.3, 35.2, 34.5], [80, 36.3, 38.5], [85, 36.5, 42.5], [K.dur, 36.5, 44]]);
  const camAt = (t) => (t < tSw ? camA(t) : camB(t));

  // magician placement
  const hookX = (i) => -4.5 + i * 2.25;
  const lineX = (i) => 35.0 + i * 2.05;
  const groupX = (i) => 32.6 + i * 1.55;
  function bowPose(P, b, lean) {
    // b: 0 standing .. 1 sujud. lean: extra forward lean (radians) while standing
    const sy = 1 - 0.6 * sm(b);
    P.lo.scale.y = sy;
    P.up.rotation.z = -(lean + 1.95 * sm(b));
    P.up.position.x = 0.35 * sm(b);
    return HIPY * sy;
  }

  return (t) => {
    // ---- camera + lamp
    const [cx, D] = camAt(t);
    const lookY = 0.107 * D;
    cam.position.set(cx, lookY + 0.25, D); cam.lookAt(cx, lookY, 0); cam.updateMatrixWorld();
    const halfW = 0.1937 * D;
    const sway = 0.04 * Math.sin(t * 0.9) + 0.02 * Math.sin(t * 2.3);
    lamp.position.set(cx + 0.95, lookY + 3.55, D - 12); lamp.rotation.z = sway;
    flame.getWorldPosition(L);
    // flame flicker: calm by default, nervous during fear and Firaun's anger, steady and bright at the revelation
    const nerv = Math.max(ramp(t, tFear - 0.3, tFear + 0.2) * (1 - ramp(t, tFearE + 0.6, tFearE + 1.6)), ramp(t, tMurka - 0.2, tMurka + 0.3) * (1 - ramp(t, tJawab, tJawab + 1.2)));
    const fl = 1 + 0.035 * Math.sin(t * 13.1) + 0.025 * Math.sin(t * 7.3 + 1) + nerv * (0.09 * Math.sin(t * 23.7) + 0.07 * Math.sin(t * 31.3 + 2));
    const wah = ramp(t, tWah - 0.2, tWah + 1.0) * (1 - ramp(t, K.s6 + 2, K.s6 + 5));
    const red = ramp(t, tMurka - 0.1, tMurka + 0.5) * (1 - ramp(t, tJawab + 0.2, tJawab + 1.6)) * (0.8 + 0.2 * Math.sin(t * 17));
    flame.scale.set(1, fl * (1 + 0.25 * wah), 1); halo.material.opacity = 0.9 * fl;
    flameL.position.copy(L); flameL.intensity = 420 * fl * (1 + 0.25 * wah);
    flameL.color.setRGB(1, 0.64 - 0.2 * red, 0.29 - 0.1 * red);
    scrU.uL.value.set(L.x - 0.6, L.y - 3.2); scrU.uI.value = fl * (1 + 0.12 * wah) * (1 - 0.15 * nerv * (t < 50 ? 1 : 0)); scrU.uRed.value = red; scrU.uGold.value = wah; scrU.uT.value = t;

    // ---- magicians
    mags.forEach((P, i) => {
      let x, b = 0, lean = 0, y = 0, rot = 0, vis = true;
      if (t < tSw) {
        x = hookX(i) + 0.2 * Math.sin(t * 0.5 + i);
        b = ramp(t, tBow1 + i * 0.12, tBow1 + i * 0.12 + 0.75);
        lean = 0.06 * Math.sin(t * 1.1 + i);
      } else if (t < tWalk) { vis = false; x = -100; }
      else {
        const w = ramp(t, tWalk + i * 0.18, tWalk + 2.6 + i * 0.18);
        x = lineX(i) - (1 - w) * (11 + 1.2 * i);
        y = (w > 0 && w < 1) ? 0.16 * Math.abs(Math.sin((t - tWalk) * 5.5 + i)) : 0;
        rot = (w > 0 && w < 1) ? 0.04 * Math.sin((t - tWalk) * 5.5 + i) : 0;
        lean = 0.05 * Math.sin(t * 1.3 + i * 1.7) * 0.6;
        lean += 0.18 * ramp(t, tAsk, tAsk + 0.3) * (1 - ramp(t, tAsk + 1.6, tAsk + 2.1)) * (i === 2 ? 1.3 : 0.5);
        // step back into a group, then throw
        const st = ramp(t, tStep + i * 0.05, tStep + 0.55 + i * 0.05);
        x = x + (groupX(i) - lineX(i)) * st;
        const th = tThrow + i * 0.13;
        lean += 0.55 * ramp(t, th, th + 0.18) * (1 - ramp(t, th + 0.3, th + 0.8));
        // shrink back when the serpent swallows, straighten when they understand
        lean -= 0.12 * ramp(t, tSwal, tSwal + 0.4) * (1 - ramp(t, tPaham, tPaham + 0.8));
        b = ramp(t, tKini + i * 0.14, tKini + i * 0.14 + 0.9);
        // s8: stay in sujud flanking the gunungan
      }
      const hy = bowPose(P, b, lean);
      P.G.position.set(x, hy + y, P.G.position.z); P.G.rotation.z = rot;
      setOp(P, vis ? 1 : 0);
    });

    // ---- Firaun
    {
      const vis = t > tSw;
      const ang = t < K.s7 ? ramp(t, A("s2:menantang") - 0.1, A("s2:menantang") + 0.3) * (1 - ramp(t, A("s2:Waktunya"), A("s2:Waktunya") + 0.6)) : ramp(t, tAncam - 0.2, tAncam + 0.2) * (1 - ramp(t, tJawab + 0.4, tJawab + 1.4));
      fir.arm.rotation.z = -1.25 + 1.12 * ang;
      // anger: the puppet is pushed toward the lamp so its shadow swells, then pulled back when the magicians answer
      const loom = ramp(t, tMurka - 0.1, tMurka + 1.2) * (1 - ramp(t, tJawab + 0.3, tJawab + 2.2));
      const jit = red * 0.05 * Math.sin(t * 29);
      const gone = ramp(t, K.s8 + 0.1, K.s8 + 1.0);
      fir.G.position.set(30.2 + 1.6 * loom + jit, -8.5 * gone + jit * 0.5, 2.1 + 3.4 * loom);
      fir.G.rotation.z = jit * 0.4;
      setOp(fir, vis ? 1 : 0);
      fir.smats.forEach((m) => m.color.setRGB(0.086 + 0.25 * red, 0.03, 0.024));
    }

    // ---- staff: upright at the right frame edge (no hand); thrown in s5; gone before the sujud
    {
      const edgeX = cx + halfW - 0.42;
      let x = edgeX, y = 3.35, z = 2.3, rot = 0.02 * Math.sin(t * 0.8), op = 1;
      op *= ramp(t, K.s2 + 0.4, K.s2 + 1.4);
      rot += -0.13 * ramp(t, tAns - 0.15, tAns + 0.25) * (1 - ramp(t, tAns + 1.0, tAns + 1.5)); // a small nod: "silakan"
      rot += 0.02 * Math.sin(t * 31) * ramp(t, tFear, tFear + 0.3) * (1 - ramp(t, tFearE, tFearE + 0.5)); // a tremor, the fear in the heart
      const u = clamp01((t - (tLemp + 0.2)) / (tLand - tLemp - 0.2));
      if (t > tLemp + 0.2) {
        const e = sm(u), X1 = 44.8;
        x = edgeX + (X1 - edgeX) * e;
        y = 3.35 + 3.0 * Math.sin(Math.PI * e) - 2.9 * e;
        z = 2.3 + 7.0 * Math.sin(Math.PI * e);
        rot = -Math.PI * 1.5 * e;
      }
      op *= 1 - ramp(t, tLand + 0.15, tSwal + 0.25);
      staff.G.position.set(x, y, z); staff.G.rotation.z = rot;
      setOp(staff, t > tSw ? op : 0);
    }

    // ---- gunungan: the sweep across the lens (s1 -> s2) and the closing in s8
    {
      const u = (t - (tSw - 0.55)) / 1.1;
      const on = u > 0 && u < 1;
      const off = 7.2 - 14.4 * u;
      gunSweep.G.position.set(cx + off, lookY + 0.2, D - 10);
      gunSweep.G.rotation.set(0, 0, 0.25 * Math.sin(u * Math.PI * 2));
      gunSweep.G.scale.setScalar(1.05);
      setOp(gunSweep, on ? 1 : 0);
      const g = ramp(t, tGun, tGun + 1.4);
      const flut = (1 - ramp(t, tGun + 0.6, tGun + 2.6)) * Math.sin((t - tGun) * 7);
      gun.G.position.set(36.6 + (1 - g) * 12, -0.35 + (1 - g) * 1.5, 2.6);
      gun.G.rotation.set(0, 0.6 * flut, -0.35 * (1 - g) + 0.05 * flut);
      setOp(gun, t > tGun ? 1 : 0);
    }

    // ---- sun (pagi hari), gift (hadiah), crowd (orang banyak)
    {
      const sp = ramp(t, A("s2:pagi") - 0.2, A("s2:pagi") + 0.8), so = 1 - ramp(t, K.s3 + 0.5, K.s3 + 1.6);
      sun.G.position.set(34.0, 2.6 + 3.0 * sp, 1.8); sun.G.rotation.z = t * 0.12; sun.G.scale.setScalar(0.6 + 0.4 * sp);
      setOp(sun, sp * so);
      const gp = ramp(t, tGift - 0.15, tGift + 0.35) * (1 - ramp(t, tGiftOut - 0.2, tGiftOut + 0.3));
      gift.G.position.set(37.2 + 0.1 * Math.sin(t * 2), 5.2 + 0.12 * Math.sin(t * 2.6), 2.3); gift.G.rotation.z = 0.05 * Math.sin(t * 1.7);
      setOp(gift, gp);
      const cr = ramp(t, A("s2:orang") - 0.3, A("s2:orang") + 0.6) * (1 - ramp(t, K.s8 + 3, K.s8 + 5));
      crowd.position.set(33 + 0.05 * Math.sin(t), -1.2 + 1.85 * sm(cr) + 0.6, 0.012);
      crowd2.position.set(33.6, -1.3 + 1.6 * sm(cr) + 0.6, 0.011);
      crowdM.opacity = 0.75 * cr; crowdM2.opacity = 0.45 * cr;
      crowd.visible = crowd2.visible = cr > 0.01;
    }

    // ---- ropes, sticks, serpent: drawn into the shadow layer
    const fxOn = t > tThrow - 0.1 && t < K.s6 + 1.5;
    fxMesh.visible = fxOn;
    if (fxOn) {
      fx.clearRect(0, 0, fxC.width, fxC.height);
      const sR = mulberry(28);
      const HX = (tt) => 44.3 - 8.6 * sm((tt - tSwal) / (tSwalE - tSwal)); // serpent head x
      const hx = t > tSwal ? HX(t) : 99;
      const ropes = [];
      for (let j = 0; j < 13; j++) {
        const stick = j >= 9, src = j % 5;
        const t0 = tThrow + src * 0.13 + (j >= 5 ? 0.2 : 0) + (stick ? 0.1 : 0);
        const fx0 = 37.6 + sR() * 5.4, fy = 0.35 + sR() * 1.6, len = stick ? 0.9 + sR() * 0.4 : 1.7 + sR() * 1.0;
        const v = 0.12 + sR() * 0.16, ph = sR() * 6.28, dir = sR() < 0.75 ? 1 : -1;
        ropes.push({ stick, t0, fx0, fy, len, v, ph, dir, src });
      }
      const drawRope = (o, ghost) => {
        if (t < o.t0) return;
        const fall = sm((t - o.t0) / 0.4);
        const sx = groupX(o.src) + 0.6, sy = 3.0;
        const crawl = Math.max(0, t - o.t0 - 0.4);
        const head = o.fx0 + o.dir * Math.min(1.3, o.v * crawl);
        const n = 26, P = [];
        const wob = ghost ? 0.06 * Math.sin(t * 9 + o.ph) : 0;
        for (let k = 0; k <= n; k++) {
          const u = k / n;
          // airborne: a straight-ish line falling from the hand; landed: a writhing body trailing behind the head
          const ax = sx + (head - sx) * fall - o.dir * u * o.len * fall + (1 - fall) * (u - 0.5) * o.len * 0.8;
          const amp = o.stick ? 0.07 : 0.16, k2 = o.stick ? 5 : 9;
          const wave = fall * amp * Math.sin(k2 * u * o.len - (t * (o.stick ? 4 : 6.5)) + o.ph) * (0.3 + 0.7 * u) ;
          const lift = fall * (o.stick ? 0 : 0.35 * Math.max(0, Math.sin(t * 1.3 + o.ph)) * Math.pow(1 - u, 3));
          const ay = sy + (o.fy - sy) * fall + wave + lift + (1 - fall) * Math.sin(u * 3) * 0.2;
          P.push([ax + wob, ay + wob * 0.6]);
        }
        // swallowed: only the part left of the serpent head stays, the rest is pulled into the mouth
        const keep = (p) => p[0] < hx - 0.35;
        fx.lineCap = "round"; fx.lineJoin = "round";
        const th = (o.stick ? 0.26 : 0.18) * FPU;
        fx.strokeStyle = ghost ? "rgba(120,24,64,.38)" : "rgba(24,9,8,.84)";
        fx.filter = ghost ? "blur(7px)" : "blur(2.5px)";
        fx.lineWidth = ghost ? th * 1.5 : th;
        fx.beginPath(); let st = false;
        for (const p of P) { if (!keep(p)) { st = false; continue; } if (!st) { fx.moveTo(PX(p[0]), PY(p[1])); st = true; } else fx.lineTo(PX(p[0]), PY(p[1])); }
        fx.stroke();
      };
      for (const o of ropes) drawRope(o, true);
      for (const o of ropes) drawRope(o, false);
      fx.filter = "none";
      // serpent: a crisp shadow with perforation dots catching the lamp light
      const sg = ramp(t, tLand + 0.1, tSwal + 0.2), sgo = 1 - ramp(t, tSwalE + 0.3, K.s6 + 1.2);
      if (sg > 0.001 && sgo > 0.001) {
        const shrink = ramp(t, tSwalE + 0.1, K.s6 + 1.0);
        const hX = t > tSwal ? HX(t) : 44.3, BL = (6.2 * sg) * (1 - 0.6 * shrink);
        const n = 60, P = [];
        for (let k = 0; k <= n; k++) {
          const u = k / n;
          const w = (1 - shrink) * sg * (0.34 * Math.sin(u * 7.5 - t * 6.2) * (0.25 + 0.75 * u));
          const rear = (1 - shrink) * 1.7 * Math.pow(1 - u, 2.2) * (0.55 + 0.45 * Math.sin(t * 2.1));
          P.push([hX + u * BL, 1.2 + w + rear, u]);
        }
        fx.globalAlpha = sgo;
        fx.lineCap = "round";
        for (let k = n; k > 0; k--) {
          const u = P[k][2], thk = (0.12 + 0.62 * Math.sin(Math.PI * Math.min(1, (1 - u) * 1.25 + 0.05))) * (0.4 + 0.6 * sg) * (1 - 0.6 * shrink);
          fx.strokeStyle = "rgb(20,8,7)"; fx.lineWidth = Math.max(4, thk * FPU);
          fx.beginPath(); fx.moveTo(PX(P[k][0]), PY(P[k][1])); fx.lineTo(PX(P[k - 1][0]), PY(P[k - 1][1])); fx.stroke();
        }
        // head
        const h0 = P[0], h1 = P[3], ang = Math.atan2(PY(h0[1]) - PY(h1[1]), PX(h0[0]) - PX(h1[0]));
        fx.save(); fx.translate(PX(h0[0]), PY(h0[1])); fx.rotate(ang);
        const hs = 1.5 * (0.5 + 0.5 * sg) * (1 - 0.6 * shrink) * FPU;
        fx.fillStyle = "rgb(20,8,7)"; fx.beginPath(); fx.ellipse(0.12 * hs, 0, 0.42 * hs, 0.27 * hs, 0, 0, 7); fx.fill();
        fx.fillStyle = "rgba(255,196,110,.9)"; fx.beginPath(); fx.arc(0.22 * hs, -0.1 * hs, 0.045 * hs, 0, 7); fx.fill();
        fx.restore();
        // perforation dots (lamp light through the leather) along the body
        fx.fillStyle = "rgba(255,190,100,.85)";
        for (let k = 4; k < n - 4; k += 2) { const p = P[k]; fx.beginPath(); fx.arc(PX(p[0]), PY(p[1]) + ((k / 2) % 2 ? 6 : -6) * (1 - shrink), 3.2 * (1 - 0.5 * shrink), 0, 7); fx.fill(); }
        fx.globalAlpha = 1;
      }
      fxT.needsUpdate = true;
    }

    // ---- dust
    for (let i = 0; i < NDU; i++) {
      const o = DU[i];
      dust.pos[i * 3] = cx + o.x + 0.3 * Math.sin(t * o.s + o.p);
      dust.pos[i * 3 + 1] = lookY + o.y - 4 + ((t * o.s * 0.3 + o.p) % 3) - 1.5;
      dust.pos[i * 3 + 2] = o.z;
    }
    dust.commit();

    syncShadows();
    bp.strength = 0.22 + 0.1 * wah; bp.threshold = 0.93;
    comp.render();
  };
}
