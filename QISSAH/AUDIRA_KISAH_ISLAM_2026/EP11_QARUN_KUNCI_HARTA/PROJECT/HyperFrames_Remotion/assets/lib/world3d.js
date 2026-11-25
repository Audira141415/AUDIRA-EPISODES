// EP11 QARUN, KUNCI HARTA. PRECISION: premium product-CGI. Polished gold, black glass, studio softboxes, slow macro dollies.
// Qarun is never shown as a person. His presence is the treasury itself: towers of gold bars, coin heaps, a jewelled throne-chair
// on a palanquin, a black-glass house, and a litter of giant keys carried by eight straining faceless porters.
// All people are faceless dark robed silhouettes (one instanced crowd). The collapse is geometric: tiles drop, the plate sinks, dust rises.
// World: treasury plate 24x24 at the origin (top y=0), ring tiles 12..16, a mirror floor outside. Avenue of onlookers along +z.
// The learned sit by a lamp at (-24, 0, 33.5). Ghost cities of earlier nations stand far behind (-z).
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, smooth, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const PLATE = 12, RING = 16;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x040405, exp: 1.0, bloom: [0.16, 0.35, 0.93], shadow: true });
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1111);

  // ---------- environment maps: studio softboxes, and a dawn sky for the last scene
  envStrips(r, scene, [
    [220, 120, 0x5d7fb8, 0.55, 0, 90, -20], [260, 30, 0xffb27a, 1.5, 0, 10, -120], [120, 40, 0x8aa4cc, 0.5, 0, 20, 110],
    [80, 30, 0xffc890, 0.8, -100, 12, -40], [80, 30, 0x9fb6dc, 0.5, 100, 12, -20],
  ], 0x141c2c);
  const envDawn = scene.environment;
  envStrips(r, scene, [
    [34, 14, 0xffffff, 1.9, 0, 42, 8], [7, 34, 0xfff0dc, 2.4, -42, 12, 12], [7, 34, 0xe6eeff, 2.0, 42, 14, -6],
    [44, 4, 0xffffff, 1.6, 0, 16, -46], [34, 6, 0xffe2b8, 0.55, 0, 4, 46], [10, 10, 0xffd9a0, 0.9, 30, 30, 30],
  ], 0x020203);
  const envStudio = scene.environment;

  // ---------- materials
  const GOLD = new THREE.MeshPhysicalMaterial({ color: 0xf2c25e, metalness: 1, roughness: 0.16, envMapIntensity: 1.3 });
  const GOLDB = new THREE.MeshPhysicalMaterial({ color: 0xc99a42, metalness: 1, roughness: 0.34, envMapIntensity: 1.0 });
  const GOLDK = new THREE.MeshPhysicalMaterial({ color: 0xd8a246, metalness: 1, roughness: 0.2, envMapIntensity: 1.35 });
  const ORB = new THREE.MeshPhysicalMaterial({ color: 0xf6cc6c, metalness: 1, roughness: 0.04, envMapIntensity: 1.2 });
  const GLASS = new THREE.MeshPhysicalMaterial({ color: 0x07070a, metalness: 0.25, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5 });
  const VELVET = new THREE.MeshStandardMaterial({ color: 0x4c0b16, roughness: 0.82 });
  const ROCK = new THREE.MeshStandardMaterial({ color: 0x0c0a08, roughness: 0.95 });
  const gem = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.03, clearcoat: 1, emissive: c, emissiveIntensity: 0.35, envMapIntensity: 2.2 });
  const RUBY = gem(0xc0102a), EMER = gem(0x0f9a5a), SAPH = gem(0x1d4fd0);
  const GEMS = [RUBY, EMER, SAPH];
  const mesh = (geo, mat, x = 0, y = 0, z = 0, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (p) p.add(m); return m; };

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0x8090a8, 0x050403, 0.3); scene.add(hemi);
  const key = new THREE.SpotLight(0xfff4e6, 2600, 140, 0.62, 0.85, 1.6);
  key.position.set(8, 40, 22); key.target.position.set(0, 0, 0); scene.add(key); scene.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 15; key.shadow.camera.far = 110; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  const rimL = new THREE.DirectionalLight(0xdfe8ff, 1.4); rimL.position.set(-30, 18, -30); scene.add(rimL);
  const rimR = new THREE.DirectionalLight(0xfff0d8, 1.1); rimR.position.set(34, 14, -20); scene.add(rimR);
  const frontF = new THREE.DirectionalLight(0xffe2bc, 0.35); frontF.position.set(0, 6, 40); scene.add(frontF);
  const lampL = new THREE.PointLight(0xffa54a, 0, 16, 1.6); scene.add(lampL);
  const paradeL = new THREE.PointLight(0xffd28a, 0, 26, 1.6); scene.add(paradeL);
  const pitL = new THREE.PointLight(0xffc070, 0, 60, 1.3); scene.add(pitL);

  // ---------- sky dome (studio void -> dawn)
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSunC: { value: new THREE.Color(0xffb070) }, uSun: { value: 0 }, uStar: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(620, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD;void main(){vD=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uSunC;uniform float uSun,uStar;varying vec3 vD;
void main(){vec3 d=normalize(vD);float e=d.y;
vec3 c=mix(uHor,uTop,smoothstep(-.02,.28,e));
float s=max(dot(d,normalize(vec3(.12,.035,-1.))),0.);c+=uSunC*(pow(s,60.)*1.6+pow(s,7.)*.32+pow(s,2.)*.06)*uSun;
vec3 q=floor(d*240.);float h=fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);c+=vec3(step(.9978,h))*uStar*smoothstep(.06,.45,e);
if(e<0.)c=mix(c,uHor*.7,smoothstep(0.,-.1,e));
gl_FragColor=vec4(c,1.);}`,
  }));
  scene.add(sky);

  // visible softbox panels overhead (they also give the mirror floor something to reflect)
  const SBM = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true });
  const soft = new THREE.Group(); scene.add(soft);
  const sbA = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), SBM); sbA.position.set(0, 34, 6); sbA.rotation.x = Math.PI / 2 - 0.12; soft.add(sbA);
  const sbL = new THREE.Mesh(new THREE.PlaneGeometry(5, 26), SBM); sbL.position.set(-34, 13, 6); sbL.rotation.y = Math.PI / 2 - 0.25; soft.add(sbL);
  const sbR = new THREE.Mesh(new THREE.PlaneGeometry(5, 26), SBM); sbR.position.set(34, 13, -4); sbR.rotation.y = -Math.PI / 2 + 0.25; soft.add(sbR);
  const sbB = new THREE.Mesh(new THREE.PlaneGeometry(40, 2.6), SBM); sbB.position.set(0, 20, -42); soft.add(sbB);

  // ---------- planar mirror floor (projective texture from a reflected camera)
  const mirrorRT = new THREE.WebGLRenderTarget(540, 960, { type: THREE.HalfFloatType, samples: 4 });
  const vcam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.1, 1400);
  const texMat = new THREE.Matrix4();
  const MU = { tMirror: { value: mirrorRT.texture }, texMat: { value: texMat }, uBase: { value: new THREE.Color(0x030304) }, uRefl: { value: 0.78 }, uHor: { value: new THREE.Color() }, uCam: { value: new THREE.Vector3() }, uFade: { value: 190 }, uSeam: { value: 1 } };
  const mirrorMat = new THREE.ShaderMaterial({
    uniforms: MU,
    vertexShader: `uniform mat4 texMat;varying vec4 vM;varying vec3 vW;
void main(){vec4 p=vec4(position,1.);
#ifdef USE_INSTANCING
p=instanceMatrix*p;
#endif
vec4 w=modelMatrix*p;vW=w.xyz;vM=texMat*w;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform sampler2D tMirror;uniform vec3 uBase,uHor,uCam;uniform float uRefl,uFade,uSeam;varying vec4 vM;varying vec3 vW;
void main(){vec2 uv=vM.xy/vM.w;vec2 px=vec2(1./540.,1./960.)*1.5;
vec3 rf=texture2D(tMirror,uv).rgb*.4+(texture2D(tMirror,uv+vec2(px.x,0.)).rgb+texture2D(tMirror,uv-vec2(px.x,0.)).rgb+texture2D(tMirror,uv+vec2(0.,px.y)).rgb+texture2D(tMirror,uv-vec2(0.,px.y)).rgb)*.15;
vec3 V=normalize(uCam-vW);float fr=.42+.58*pow(1.-clamp(V.y,0.,1.),4.);
vec2 g=abs(fract(vW.xz/4.+.5)-.5)*4.;float seam=1.-smoothstep(0.,.025,min(g.x,g.y));
float dc=length(vW.xz-uCam.xz);
vec3 c=uBase+rf*uRefl*fr+seam*vec3(.05,.038,.02)*uSeam*(1.-smoothstep(20.,70.,dc));
c=mix(c,uHor,smoothstep(uFade*.3,uFade,dc));
gl_FragColor=vec4(c,1.);}`,
  });
  const MIRROR = [];
  {
    const sh = new THREE.Shape(); sh.moveTo(-220, -220); sh.lineTo(220, -220); sh.lineTo(220, 220); sh.lineTo(-220, 220); sh.lineTo(-220, -220);
    const hole = new THREE.Path(); hole.moveTo(-RING, -RING); hole.lineTo(-RING, RING); hole.lineTo(RING, RING); hole.lineTo(RING, -RING); hole.lineTo(-RING, -RING);
    sh.holes.push(hole);
    const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(g, mirrorMat); scene.add(floor); MIRROR.push(floor);
  }
  // ring tiles 2x2 between the plate and the solid floor: they crack and fall first
  const tileXZ = [];
  for (let cx = -15; cx <= 15; cx += 2) for (let cz = -15; cz <= 15; cz += 2) if (!(Math.abs(cx) < PLATE && Math.abs(cz) < PLATE)) tileXZ.push([cx, cz, rnd(), rnd(), rnd()]);
  const tileGeo = new THREE.BoxGeometry(1.98, 0.6, 1.98); tileGeo.translate(0, -0.3, 0);
  const tiles = new THREE.InstancedMesh(tileGeo, [ROCK, ROCK, mirrorMat, ROCK, ROCK, ROCK], tileXZ.length);
  tiles.frustumCulled = false; scene.add(tiles); MIRROR.push(tiles);
  // the earth closes again in s8: two slabs slide in just under the floor surface
  const irisGeo = new THREE.BoxGeometry(RING, 0.6, RING * 2); irisGeo.translate(0, -0.34, 0);
  const irisL = new THREE.Mesh(irisGeo, [ROCK, ROCK, mirrorMat, ROCK, ROCK, ROCK]); scene.add(irisL); MIRROR.push(irisL);
  const irisR = new THREE.Mesh(irisGeo, [ROCK, ROCK, mirrorMat, ROCK, ROCK, ROCK]); scene.add(irisR); MIRROR.push(irisR);
  // pit walls (only seen once the tiles have fallen)
  const strata = canvasTex(256, 1024, (x, w, h) => { for (let y = 0; y < h; y += 4) { const v = 10 + 14 * Math.sin(y * 0.05) + 10 * Math.sin(y * 0.013 + 2) + 8 * rnd(); x.fillStyle = `rgb(${v + 8},${v + 4},${v})`; x.fillRect(0, y, w, 4); } });
  const PITM = new THREE.MeshStandardMaterial({ color: 0x9a8670, map: strata, roughness: 0.95, side: THREE.DoubleSide });
  for (const [x, z, ry] of [[RING, 0, -Math.PI / 2], [-RING, 0, Math.PI / 2], [0, RING, Math.PI], [0, -RING, 0]]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(RING * 2, 70), PITM); w.position.set(x, -35.05, z); w.rotation.y = ry; scene.add(w);
  }
  const pitB = new THREE.Mesh(new THREE.PlaneGeometry(RING * 2, RING * 2), ROCK); pitB.rotation.x = -Math.PI / 2; pitB.position.y = -70; scene.add(pitB);

  // cracks: bright hairlines in the black glass, radiating from the ring
  const CRK = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe6c0).multiplyScalar(1.4) });
  const cracks = [];
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2 + rnd() * 0.3;
    let x = Math.cos(ang) * RING * 1.05, z = Math.sin(ang) * RING * 1.05;
    const m = Math.max(Math.abs(x), Math.abs(z)); x *= RING / m; z *= RING / m;
    let a = ang;
    const segs = [];
    for (let s = 0; s < 4; s++) {
      a += (rnd() - 0.5) * 0.9;
      const len = 1.6 + rnd() * 2.8;
      const g = new THREE.BoxGeometry(1, 0.012, 0.07 - s * 0.012); g.translate(0.5, 0, 0);
      const mm = new THREE.Mesh(g, CRK); mm.position.set(x, 0.006, z); mm.rotation.y = -a; scene.add(mm);
      segs.push({ m: mm, len, d: s });
      x += Math.cos(a) * len; z += Math.sin(a) * len;
    }
    cracks.push({ segs, delay: rnd() * 0.5 });
  }

  // ---------- the treasury (everything in TG sinks)
  const TG = new THREE.Group(); scene.add(TG);
  mesh(new THREE.BoxGeometry(PLATE * 2, 2, PLATE * 2), GLASS, 0, -1, 0, TG);
  for (const [w, d, x, z] of [[23.2, 0.08, 0, 11.6], [23.2, 0.08, 0, -11.6], [0.08, 23.2, 11.6, 0], [0.08, 23.2, -11.6, 0], [21.6, 0.04, 0, 10.8], [0.04, 21.6, 10.8, 0], [0.04, 21.6, -10.8, 0]])
    mesh(new THREE.BoxGeometry(w, 0.02, d), GOLD, x, 0.01, z, TG);
  // maker's mark engraved into the floor plate
  const markTex = canvasTex(1024, 384, (x, w, h) => {
    x.fillStyle = "#060607"; x.fillRect(0, 0, w, h);
    const gg = x.createLinearGradient(0, 0, w, h); gg.addColorStop(0, "#8a6424"); gg.addColorStop(0.45, "#f7dc96"); gg.addColorStop(0.6, "#c8973c"); gg.addColorStop(1, "#f0cf80");
    x.strokeStyle = gg; x.lineWidth = 6; x.strokeRect(22, 22, w - 44, h - 44); x.lineWidth = 2; x.strokeRect(40, 40, w - 80, h - 80);
    x.font = "700 168px Georgia, 'Times New Roman', serif"; x.textAlign = "center"; x.textBaseline = "middle";
    const txt = "AUDIRA", sp = 26; let tw = 0; for (const ch of txt) tw += x.measureText(ch).width + sp; tw -= sp;
    let cx = w / 2 - tw / 2;
    for (const ch of txt) { const cw = x.measureText(ch).width; x.fillStyle = "#000"; x.fillText(ch, cx + cw / 2 + 4, h / 2 + 8); x.fillStyle = gg; x.fillText(ch, cx + cw / 2, h / 2 + 4); cx += cw + sp; }
    x.fillStyle = gg; for (const dx of [-1, 1]) { x.save(); x.translate(w / 2 + dx * (tw / 2 + 64), h / 2 + 4); x.rotate(Math.PI / 4); x.fillRect(-11, -11, 22, 22); x.restore(); }
  });
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), new THREE.MeshStandardMaterial({ map: markTex, emissiveMap: markTex, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.3, metalness: 0.55 }));
  mark.rotation.x = -Math.PI / 2; mark.position.set(8.2, 0.006, 10.0); mark.receiveShadow = true; TG.add(mark);

  // house: black-glass wall, pillars with gold capitals, architrave, vault doors with a giant keyhole
  const HG = new THREE.Group(); TG.add(HG);
  mesh(new THREE.BoxGeometry(23.4, 16, 0.6), GLASS, 0, 8, -11.6, HG);
  for (let i = 0; i < 8; i++) {
    const x = -10 + i * (20 / 7);
    mesh(new THREE.CylinderGeometry(0.42, 0.48, 13.2, 32), GLASS, x, 6.6 + 0.4, -9.6, HG);
    mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), GOLD, x, 0.2, -9.6, HG);
    mesh(new THREE.CylinderGeometry(0.75, 0.46, 0.55, 32), GOLD, x, 13.75, -9.6, HG);
  }
  mesh(new THREE.BoxGeometry(23.4, 1.1, 2.6), GOLD, 0, 14.55, -10.3, HG);
  mesh(new THREE.BoxGeometry(23.4, 0.25, 2.8), GLASS, 0, 15.2, -10.3, HG);
  for (let i = 0; i < 2; i++) mesh(new THREE.BoxGeometry(23.4 - i * 0.8, 0.22, 1.2), GLASS, 0, 0.11 + i * 0.22, -8.3 + i * 0.35, HG);
  const door = new THREE.Group(); door.position.set(0, 0, -11.22); HG.add(door);
  for (const s of [-1, 1]) {
    mesh(new THREE.BoxGeometry(2.3, 7.4, 0.2), GOLDB, s * 1.17, 3.7, 0, door);
    for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(2.0, 0.12, 0.08), GOLD, s * 1.17, 1.1 + k * 1.75, 0.13, door);
  }
  mesh(new THREE.TorusGeometry(0.42, 0.08, 16, 40), GOLD, 0, 4.1, 0.16, door);
  const kh = new THREE.Shape(); kh.absarc(0, 0.25, 0.22, 0, Math.PI * 2); const khb = new THREE.Shape(); khb.moveTo(-0.12, 0.1); khb.lineTo(0.12, 0.1); khb.lineTo(0.2, -0.55); khb.lineTo(-0.2, -0.55);
  for (const s of [kh, khb]) { const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: 0x000000 })); m.position.set(0, 3.9, 0.115); door.add(m); }

  // gold bar towers (one instanced draw)
  const barGeo = new THREE.CylinderGeometry(0.36, 0.46, 0.3, 4, 1); barGeo.rotateY(Math.PI / 4); barGeo.scale(1, 1, 2.1);
  const TOWERS = [[-9.3, -6.2, 12.5], [-6.5, -6.8, 14.2], [-9.6, -2.4, 9], [-6.7, -2.9, 10.6], [-9.2, 1.6, 6], [-6.4, 1.2, 3.4],
    [9.3, -6.4, 13.6], [6.4, -6.9, 10.4], [9.6, -2.6, 14.6], [6.6, -2.5, 8], [9.2, 1.5, 6.8], [6.5, 1.4, 2.8], [8.6, 5.2, 1.8], [-8.4, 5.6, 2.4]];
  const bars = [];
  for (const [x, z, h] of TOWERS) {
    const layers = Math.round(h / 0.31);
    for (let l = 0; l < layers; l++) {
      const rot = l % 2;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 4; b++) {
        const u = (a - 0.5) * 1.25, v = (b - 1.5) * 0.6;
        bars.push([x + (rot ? v : u), 0.15 + l * 0.31, z + (rot ? u : v), rot ? 0 : Math.PI / 2, rnd()]);
      }
    }
  }
  const barsIM = new THREE.InstancedMesh(barGeo, GOLDB, bars.length); barsIM.castShadow = barsIM.receiveShadow = true; TG.add(barsIM);
  {
    const d = new THREE.Object3D();
    bars.forEach(([x, y, z, ry, j], i) => { d.position.set(x, y, z); d.rotation.set(0, ry + (j - 0.5) * 0.04, 0); d.updateMatrix(); barsIM.setMatrixAt(i, d.matrix); });
  }
  // coin heaps
  const coinGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.028, 20);
  const HEAPS = [[-4.2, 2.6, 1.5, 0.9], [4.0, 2.8, 1.6, 1.0], [-7.6, 4.8, 1.3, 0.7], [7.7, 4.4, 1.4, 0.75], [0, -8.0, 1.6, 1.0], [-3.4, -5.2, 1.1, 0.6], [3.3, -5.4, 1.2, 0.65], [-1.8, 6.4, 0.9, 0.35], [2.4, 7.4, 0.7, 0.25]];
  const coins = [];
  for (const [cx, cz, R, H] of HEAPS) {
    const n = Math.round(R * R * 230);
    for (let i = 0; i < n; i++) {
      const rr = Math.sqrt(rnd()) * R, a = rnd() * 6.283;
      const y = Math.max(0.014, H * (1 - rr / R) * (0.75 + 0.25 * rnd()));
      coins.push([cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.9]);
    }
  }
  for (let i = 0; i < 260; i++) { const a = rnd() * 6.283, rr = 2 + rnd() * 8; coins.push([Math.cos(a) * rr * 1.1, 0.014, 2 + Math.sin(a) * rr * 0.6, 0, 0]); }
  const coinIM = new THREE.InstancedMesh(coinGeo, GOLD, coins.length); coinIM.castShadow = coinIM.receiveShadow = true; TG.add(coinIM);
  {
    const d = new THREE.Object3D();
    coins.forEach(([x, y, z, a, b], i) => { d.position.set(x, y, z); d.rotation.set(a, rnd() * 3, b); d.updateMatrix(); coinIM.setMatrixAt(i, d.matrix); });
  }
  // chests of gems
  for (const [x, z, ry] of [[-4.6, -0.6, 0.35], [4.7, -0.4, -0.3], [-3.0, 4.6, 0.1]]) {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; TG.add(c);
    mesh(new THREE.BoxGeometry(1.6, 0.9, 1.0), GLASS, 0, 0.45, 0, c);
    for (const bx of [-0.6, 0, 0.6]) mesh(new THREE.BoxGeometry(0.1, 0.94, 1.04), GOLD, bx, 0.45, 0, c);
    const lid = mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 24, 1, false, 0, Math.PI), GLASS, 0, 0, 0, c);
    lid.rotation.z = Math.PI / 2; lid.position.set(0, 0.9 + 0.35, -0.5 - 0.15); lid.rotation.x = -1.9;
    for (let i = 0; i < 16; i++) { const g = mesh(new THREE.IcosahedronGeometry(0.09 + rnd() * 0.06, 0), GEMS[i % 3], (rnd() - 0.5) * 1.3, 0.92 + rnd() * 0.08, (rnd() - 0.5) * 0.75, c); g.rotation.set(rnd() * 3, rnd() * 3, 0); }
  }
  // the orb that reflects only gold
  mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.6, 40), GLASS, 2.9, 0.8, -1.2, TG);
  mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 40), GOLD, 2.9, 1.62, -1.2, TG);
  const orb = mesh(new THREE.SphereGeometry(0.72, 64, 48), ORB, 2.9, 2.38, -1.2, TG);
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cubeCam = new THREE.CubeCamera(0.4, 500, cubeRT); scene.add(cubeCam);

  // ---------- palanquin with the jewelled throne-chair (Qarun's presence; the chair stays empty)
  const PAL = new THREE.Group(); scene.add(PAL);
  const PB = new THREE.Group(); PAL.add(PB);
  mesh(new THREE.BoxGeometry(2.7, 0.32, 2.7), GOLD, 0, 1.06, 0, PB);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.9, 16), GOLD, sx * 1.15, 0.45, sz * 1.15, PB);
  for (const sx of [-1, 1]) { const p = mesh(new THREE.CylinderGeometry(0.075, 0.075, 8.4, 16), GOLDB, sx * 1.62, 1.12, 0, PB); p.rotation.x = Math.PI / 2; for (const sz of [-1, 1]) mesh(new THREE.SphereGeometry(0.12, 16, 12), GOLD, sx * 1.62, 1.12, sz * 4.2, PB); }
  const TH = new THREE.Group(); TH.position.y = 1.22; PB.add(TH);
  mesh(new THREE.BoxGeometry(1.5, 0.3, 1.2), GOLD, 0, 0.55, 0, TH);
  mesh(new THREE.BoxGeometry(1.36, 0.16, 1.06), VELVET, 0, 0.78, 0.02, TH);
  for (const sx of [-1, 1]) {
    mesh(new THREE.BoxGeometry(0.14, 0.7, 1.2), GOLD, sx * 0.75, 0.35, 0, TH);
    mesh(new THREE.BoxGeometry(0.16, 0.12, 1.25), GOLD, sx * 0.78, 1.15, 0.05, TH);
    mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), GOLD, sx * 0.78, 0.92, 0.55, TH);
    mesh(new THREE.SphereGeometry(0.1, 20, 16), RUBY, sx * 0.78, 1.25, 0.66, TH);
  }
  mesh(new THREE.BoxGeometry(1.5, 2.3, 0.16), GOLD, 0, 1.85, -0.56, TH);
  mesh(new THREE.BoxGeometry(1.22, 1.9, 0.08), VELVET, 0, 1.75, -0.47, TH);
  const arch = mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.16, 40, 1, false, -Math.PI / 2, Math.PI), GOLD, 0, 3.0, -0.56, TH); arch.rotation.x = Math.PI / 2;
  mesh(new THREE.OctahedronGeometry(0.2, 0), SAPH, 0, 3.55, -0.44, TH);
  for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(0.075, 16, 12), GEMS[(i + 1) % 3], -0.6 + i * 0.3, 2.95, -0.46, TH);
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(0.055, 12, 10), GEMS[i % 3], sx * 0.66, 0.95 + i * 0.32, -0.46, TH);
  // canopy
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.5, 12), GOLD, sx * 1.22, 1.22 + 1.75, sz * 1.22, PB);
  const roof = mesh(new THREE.ConeGeometry(1.95, 0.9, 4, 1), GOLD, 0, 1.22 + 3.5 + 0.45, 0, PB); roof.rotation.y = Math.PI / 4;
  mesh(new THREE.SphereGeometry(0.16, 20, 16), RUBY, 0, 1.22 + 3.5 + 1.0, 0, PB);

  // ---------- the litter of giant keys
  const LIT = new THREE.Group(); scene.add(LIT);
  for (const sz of [-1, 1]) { const p = mesh(new THREE.CylinderGeometry(0.085, 0.085, 11, 16), GOLDB, 0, 1.62, sz * 0.95, LIT); p.rotation.z = Math.PI / 2; }
  for (const sx of [-1.45, 1.45]) {
    const cb = mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.0, 12), GOLDB, sx, 1.62, 0, LIT); cb.rotation.x = Math.PI / 2;
    for (const sz of [-1, 1]) { const up = mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 12), GOLDB, sx, 3.35, sz * 0.62, LIT); up.rotation.x = sz * 0.17; }
  }
  const topBar = mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.3, 16), GOLD, 0, 5.05, 0, LIT); topBar.rotation.z = Math.PI / 2;
  const RINGP = new THREE.Group(); RINGP.position.set(0, 5.0, 0); LIT.add(RINGP);
  mesh(new THREE.TorusGeometry(0.12, 0.035, 12, 24), GOLD, 0, -0.1, 0, RINGP).rotation.y = Math.PI / 2;
  const RR = 0.66, RCY = -0.22 - RR;
  mesh(new THREE.TorusGeometry(RR, 0.075, 24, 72), GOLD, 0, RCY, 0, RINGP);
  function makeKey(L, seed) {
    const k = new THREE.Group(); const rr = mulberry(seed);
    mesh(new THREE.TorusGeometry(0.24, 0.05, 16, 40), GOLDK, 0, -0.24, 0, k);
    mesh(new THREE.TorusGeometry(0.12, 0.03, 12, 28), GOLDK, 0, -0.24, 0, k);
    mesh(new THREE.SphereGeometry(0.07, 18, 14), GEMS[Math.floor(rr() * 3)], 0, -0.24, 0.0, k);
    for (const y of [-0.53, -0.62]) mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 24), GOLDK, 0, y, 0, k);
    mesh(new THREE.CylinderGeometry(0.06, 0.065, L - 0.9, 20), GOLDK, 0, -0.5 - (L - 0.9) / 2, 0, k);
    const bitY = -L + 0.24;
    mesh(new THREE.BoxGeometry(0.42, 0.34, 0.07), GOLDK, 0.21, bitY, 0, k);
    for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.1, 0.1 + rr() * 0.1, 0.075), GOLDK, 0.36 - i * 0.12 + 0.06, bitY - 0.15, 0, k);
    mesh(new THREE.SphereGeometry(0.075, 16, 12), GOLDK, 0, -L + 0.02, 0, k);
    return k;
  }
  const KEYS = [];
  for (let i = 0; i < 7; i++) {
    const th = -Math.PI / 2 + (i - 3) * 0.33;
    const piv = new THREE.Group(); piv.position.set(Math.cos(th) * RR, RCY + Math.sin(th) * RR, (i % 2 ? 0.04 : -0.04)); RINGP.add(piv);
    const k = makeKey(1.85 + (i % 3) * 0.18, 70 + i); k.rotation.y = (i - 3) * 0.28; piv.add(k);
    KEYS.push({ piv, th, ph: i * 1.7 });
  }

  // ---------- crowd: every person is a faceless robed figure in one instanced set
  const P = [];
  const add = (o) => { P.push({ yaw: 0, lean: 0, aL: -0.08, aR: -0.08, seat: 0, col: 0x1c1c22, ...o }); return P.length - 1; };
  const PORT = [];
  for (const sz of [-1, 1]) for (const lx of [-4.2, -2.6, 2.6, 4.2]) PORT.push(add({ lx, lz: sz * 0.95 - sz * 0.2, side: sz, col: 0x3b3833 }));
  const BEAR = [];
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) BEAR.push(add({ lx: sx * 1.62 - sx * 0.2, lz: sz * 4.45, col: 0x463a2e }));
  const ONL = [];
  for (const s of [-1, 1]) for (let rk = 0; rk < 2; rk++) for (let i = 0; i < 11; i++) {
    const x0 = s * (4.5 + rk * 1.35 + (rnd() - 0.5) * 0.3), z0 = 21.5 + i * 2.2 + rk * 1.1 + (rnd() - 0.5) * 0.5;
    ONL.push(add({ x0, z0, s, rk, ph: rnd(), reach: 0.55 + rnd() * 0.45, col: [0x45403a, 0x4d4236, 0x3c4048, 0x4a3c3a][Math.floor(rnd() * 4)] }));
  }
  const ADV = [];
  for (let i = 0; i < 5; i++) ADV.push(add({ x0: 3.6 + i * 1.2, z0: 17.4 + (i % 2) * 0.7, ph: rnd(), col: 0x504538 }));
  const LRN = [];
  const LC = new THREE.Vector3(-24, 0, 33.5);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.6; LRN.push(add({ x0: LC.x + Math.cos(a) * 1.3, z0: LC.z + Math.sin(a) * 1.3, yaw: Math.atan2(-Math.cos(a), -Math.sin(a)), seat: 1, ph: rnd(), col: 0x6a5240 })); }

  const NP = P.length;
  const geoRobe = new THREE.CylinderGeometry(0.21, 0.3, 1.15, 16); geoRobe.translate(0, 0.575, 0);
  const geoTorso = new THREE.CylinderGeometry(0.24, 0.2, 0.52, 14); geoTorso.translate(0, 1.38, 0);
  const geoHead = new THREE.SphereGeometry(0.135, 18, 14); geoHead.translate(0, 1.77, 0);
  const geoHood = new THREE.SphereGeometry(0.18, 18, 12, 0, Math.PI * 2, 0, 2.3); geoHood.scale(1, 1.25, 1); geoHood.translate(0, 1.74, -0.03);
  const geoArm = new THREE.CylinderGeometry(0.055, 0.045, 0.62, 10); geoArm.translate(0, -0.31, 0);
  const CM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.74, metalness: 0.05 });
  const HM = new THREE.MeshStandardMaterial({ color: 0x2a2725, roughness: 0.6 });
  const mk = (g, m) => { const im = new THREE.InstancedMesh(g, m, NP); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; scene.add(im); return im; };
  const imRobe = mk(geoRobe, CM), imTorso = mk(geoTorso, CM), imHood = mk(geoHood, CM), imHead = mk(geoHead, HM), imArmL = mk(geoArm, CM), imArmR = mk(geoArm, CM);
  const cc = new THREE.Color();
  P.forEach((p, i) => { cc.set(p.col); for (const im of [imRobe, imTorso, imHood, imArmL, imArmR]) im.setColorAt(i, cc); });
  const mB = new THREE.Matrix4(), mL = new THREE.Matrix4(), mT = new THREE.Matrix4(), mO = new THREE.Matrix4(), qY = new THREE.Matrix4(), qX = new THREE.Matrix4();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  function placePerson(i, x, y, z, yaw, lean, aL, aR, seat, hide) {
    if (hide) { for (const im of [imRobe, imTorso, imHood, imHead, imArmL, imArmR]) im.setMatrixAt(i, ZERO); return; }
    mB.makeTranslation(x, y, z).multiply(qY.makeRotationY(yaw)).multiply(qX.makeRotationX(lean));
    const sy = seat ? 0.5 : 1, dy = seat ? -0.5 : 0;
    imRobe.setMatrixAt(i, mO.copy(mB).multiply(mL.makeScale(seat ? 1.45 : 1, sy, seat ? 1.45 : 1)));
    mT.makeTranslation(0, dy, 0);
    imTorso.setMatrixAt(i, mO.copy(mB).multiply(mT));
    imHood.setMatrixAt(i, mO.copy(mB).multiply(mT));
    imHead.setMatrixAt(i, mO.copy(mB).multiply(mT));
    imArmL.setMatrixAt(i, mO.copy(mB).multiply(mL.makeTranslation(-0.22, 1.56 + dy, 0)).multiply(qX.makeRotationX(aL)));
    imArmR.setMatrixAt(i, mO.copy(mB).multiply(mL.makeTranslation(0.22, 1.56 + dy, 0)).multiply(qX.makeRotationX(aR)));
  }

  // ---------- the learned: rug, low stand with an open book, oil lamp
  const LG = new THREE.Group(); LG.position.copy(LC); scene.add(LG);
  const rugTex = canvasTex(512, 512, (x, w) => { x.fillStyle = "#3a1410"; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 2, 0, 7); x.fill(); x.strokeStyle = "#a07a3a"; x.lineWidth = 8; for (const rr of [240, 200, 120]) { x.beginPath(); x.arc(w / 2, w / 2, rr, 0, 7); x.stroke(); } for (let i = 0; i < 16; i++) { x.save(); x.translate(w / 2, w / 2); x.rotate(i * Math.PI / 8); x.fillStyle = "#7a4a22"; x.fillRect(150, -10, 36, 20); x.restore(); } });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95, transparent: true })); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; rug.receiveShadow = true; LG.add(rug);
  const WOOD = new THREE.MeshStandardMaterial({ color: 0x4a2e1a, roughness: 0.7 });
  mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.32, 20), WOOD, 0, 0.16, 0, LG);
  const lamp = new THREE.Group(); lamp.position.y = 0.32; LG.add(lamp);
  const lb = mesh(new THREE.SphereGeometry(0.12, 24, 12), GOLDK, 0, 0.05, 0, lamp); lb.scale.set(1.4, 0.6, 1);
  mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.12, 10), GOLDK, 0.16, 0.08, 0, lamp).rotation.z = -1.0;
  const flameMat = new THREE.SpriteMaterial({ map: canvasTex(64, 128, (x, w, h) => { const g = x.createRadialGradient(w / 2, h * 0.62, 1, w / 2, h * 0.6, w / 2); g.addColorStop(0, "rgba(255,250,220,1)"); g.addColorStop(0.35, "rgba(255,180,70,.9)"); g.addColorStop(1, "rgba(255,90,10,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); }), color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false });
  const flame = new THREE.Sprite(flameMat); flame.scale.set(0.12, 0.24, 1); flame.position.set(0.22, 0.2, 0); lamp.add(flame);
  const glowMat = new THREE.SpriteMaterial({ map: canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,190,110,.55)"); g.addColorStop(1, "rgba(255,140,40,0)"); x.fillStyle = g; x.fillRect(0, 0, w, w); }), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const glow = new THREE.Sprite(glowMat); glow.scale.set(1.6, 1.6, 1); glow.position.set(0.22, 0.2, 0); lamp.add(glow);
  const rehal = new THREE.Group(); rehal.position.set(0.75, 0, 0.55); rehal.rotation.y = -2.2; LG.add(rehal);
  for (const s of [-1, 1]) { const pl = mesh(new THREE.BoxGeometry(0.32, 0.02, 0.4), WOOD, s * 0.13, 0.22, 0, rehal); pl.rotation.z = s * 0.5; }
  const PAGE = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 });
  for (const s of [-1, 1]) { const pg = mesh(new THREE.BoxGeometry(0.28, 0.025, 0.34), PAGE, s * 0.13, 0.245, 0, rehal); pg.rotation.z = s * 0.38; }

  // ---------- ghost cities of the nations before (QS 28:78): translucent silhouettes that crumble
  const GHM = new THREE.MeshBasicMaterial({ color: 0x9cbbe0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const GHL = new THREE.LineBasicMaterial({ color: 0xcfe2ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const GHOST = [];
  const ghostBlock = (geo, x, y, z, delay) => {
    const m = new THREE.Mesh(geo, GHM); m.position.set(x, y, z); scene.add(m);
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo), GHL); m.add(l);
    GHOST.push({ m, x, y, z, delay, rx: (rnd() - 0.5) * 1.2, rz: (rnd() - 0.5) * 1.2 });
  };
  for (const [cx, cz, kind] of [[-26, -104, 0], [2, -138, 1], [27, -114, 2]]) {
    const d0 = rnd() * 0.4;
    if (kind === 0) { for (let i = 0; i < 6; i++) ghostBlock(new THREE.BoxGeometry(22 - i * 3.4, 5, 16 - i * 2.4), cx, 2.5 + i * 5, cz, d0 + i * 0.12); ghostBlock(new THREE.BoxGeometry(3, 6, 3), cx, 33, cz, d0 + 0.8); }
    if (kind === 1) { for (let i = 0; i < 7; i++) { const h = 20 + rnd() * 26; ghostBlock(new THREE.CylinderGeometry(1.1, 1.3, h, 12), cx - 15 + i * 5, h / 2, cz, d0 + i * 0.09); } ghostBlock(new THREE.BoxGeometry(36, 3, 6), cx, 47, cz, d0 + 0.7); ghostBlock(new THREE.ConeGeometry(20, 10, 4), cx, 54, cz, d0 + 0.9); }
    if (kind === 2) { for (let i = 0; i < 5; i++) { const h = 14 + rnd() * 30, w = 4 + rnd() * 4; ghostBlock(new THREE.BoxGeometry(w, h, w), cx - 12 + i * 6, h / 2, cz + (rnd() - 0.5) * 8, d0 + i * 0.1); } ghostBlock(new THREE.SphereGeometry(6, 24, 12, 0, 6.29, 0, 1.6), cx, 30, cz, d0 + 0.6); ghostBlock(new THREE.ConeGeometry(9, 18, 4), cx + 12, 9, cz - 10, d0 + 0.3); }
  }

  // distant dunes: silhouettes on the dawn horizon
  const DUNE = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12), DUNE); d.scale.set(50 + rnd() * 60, 8 + rnd() * 14, 30); d.position.set(-200 + i * 50 + rnd() * 20, -2, -280 - rnd() * 60); scene.add(d); }
  // single coin left on the empty floor (s8)
  const lastCoin = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 40), GOLD, 0.7, 0.016, 21.5, scene); lastCoin.rotation.y = 0.4;

  // ---------- particles
  const motes = pts(scene, 500, { color: 0xfff0d0, size: 0.07, opacity: 0.55 });
  const mseed = Array.from({ length: 500 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const glints = pts(scene, 420, { color: 0xffd57a, size: 0.12, opacity: 1 });
  const gseed = Array.from({ length: 420 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const dust = pts(scene, 1100, { color: 0x9a8a74, size: 0.45, add: false, opacity: 0.4 });
  const dseed = Array.from({ length: 1100 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const gdust = pts(scene, 600, { color: 0xb8d0f0, size: 0.9, opacity: 0.5 });
  const gdseed = Array.from({ length: 600 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- timing
  const tFlick0 = A("s1:lenyap"), tFlick1 = A("s1:sekejap") + 0.35;
  const tLift = K.s5 + 0.25, tGo = K.s5 + 0.9, tArrive = K.s5e + 1.2;
  const tTP = A("s6:beriman");                       // palanquin back on the plate while the camera is with the learned
  const tC = A("s7:dibenamkan");
  const tSink0 = tC + 0.25, tSink1 = tC + 8.5;
  const tBack = tC + 0.5, tBack2 = A("s7:iri");
  const tGhost0 = A("s4:umat") - 0.4, tGhostF = A("s4:dibinasakan");
  const tIris0 = K.s8 - 1.2, tIris1 = K.s8 + 2.0;
  const portXc = (t) => -20.5 + 11.2 * (1 - Math.pow(1 - clamp01(t / 22.4), 1.5));
  const zPal = (t) => (t < tTP ? -2 + 30 * (1 - Math.pow(1 - clamp01((t - tGo) / (tArrive - tGo)), 2)) + 2.5 * clamp01((t - tArrive) / 4) : -2);
  const sinkY = (t) => { const u = clamp01((t - tSink0) / (tSink1 - tSink0)); return -(t > tC - 0.05 ? 0.12 : 0) - 30 * Math.pow(u, 1.6) - 0.4 * u; };

  // ---------- cameras [t, cx, cy, cz, lx, ly, lz]
  const p0 = portXc(0), p1 = portXc(A("s1:dipikul")), p2 = portXc(A("s1:Bayangkan")), p3 = portXc(A("s1:hartanya"));
  const camS1 = track([
    [0, p0 + 1.3, 3.5, 21.4, p0, 3.35, 18],
    [A("s1:dipikul"), p1 + 1.6, 3.2, 21.9, p1 + 0.1, 3.1, 18],
    [A("s1:Bayangkan"), p2 + 3.5, 3.6, 31, p2 + 0.4, 2.3, 18],
    [A("s1:hartanya"), p3 + 6, 5.5, 40, p3 + 3, 2.6, 14],
    [A("s1:semuanya"), 9, 11, 47, 0, 5.5, -2],
    [K.s2, 8, 10.5, 45, 0, 5.5, -2],
  ]);
  const camS2 = track([
    [K.s2, 10.0, 1.15, 13.6, 8.2, 0.0, 9.9],
    [A("s2:menyebut"), 9.4, 1.25, 13.0, 7.9, 0.05, 9.6],
    [A("s2:Musa"), 6.4, 1.7, 10.8, 2, 2.6, -1],
    [A("s2:zalim"), 3.4, 1.15, 7.2, 0, 3.4, -2],
    [A("s2:Allah"), 2.4, 1.9, 8.4, 0, 3.6, -2],
    [A("s2:perbendaharaan"), -2.5, 9.5, 24, 0, 6.5, -3],
    [A("s2:kunci"), -2.0, 4.2, 38, -9.5, 2.3, 18],
    [K.s2e + 0.16, -2.6, 4.1, 38.8, -9.6, 2.3, 18],
  ]);
  const camS3 = track([
    [K.s3, 11.6, 2.5, 25.5, 2, 3.0, 0],
    [A("s3:Carilah"), 10.6, 2.7, 24.4, 1, 3.3, -2],
    [A("s3:dunia"), 9.2, 3.2, 23, 0, 3.6, -2],
    [K.s3e + 0.16, 8.2, 3.6, 22, 0, 3.8, -2],
  ]);
  const camS4 = track([
    [K.s4, 5.6, 3.3, 2.6, 2.9, 2.75, -1.2],
    [A("s4:ilmuku"), 4.9, 3.15, 2.2, 2.9, 2.75, -1.2],
    [A("s4:sendiri"), 4.4, 3.05, 1.7, 2.9, 2.75, -1.2],
    [A("s4:Al-Qur'an"), 4, 10, 16, 0, 13, -60],
    [A("s4:lebih"), 3, 21, 33, 0, 15, -100],
    [K.s4e + 0.16, 2, 22, 35, 0, 14, -100],
  ]);
  const zz = (t) => zPal(t);
  const camS5 = track([
    [K.s5, 9.5, 4.6, 14.5, 0, 2.6, -1.5],
    [A("s5:kemegahannya"), 9.5, 3.4, zz(A("s5:kemegahannya")) + 13.5, 0, 2.6, zz(A("s5:kemegahannya"))],
    [A("s5:Orang-orang"), 0.9, 4.4, zz(A("s5:Orang-orang")) + 23, 0, 1.5, zz(A("s5:Orang-orang")) + 2],
    [A("s5:andai"), 0.5, 3.9, zz(A("s5:andai")) + 19, 0, 1.7, zz(A("s5:andai")) + 1],
    [A("s5:beruntung"), -1.5, 3.6, zz(A("s5:beruntung")) + 15, 0, 2.0, zz(A("s5:beruntung"))],
    [K.s5e + 0.16, 5, 4.4, zz(K.s5e) + 12, 0, 2.2, zz(K.s5e)],
  ]);
  const camS6 = track([
    [K.s6, 1, 5, 46, -6, 2.2, 32],
    [A("s6:berilmu"), -15.0, 4.6, 43, -24, 0.4, 33.5],
    [A("s6:Pahala"), -16.6, 4.0, 41.6, -24, 0.4, 33.5],
    [A("s6:beramal"), -17.6, 3.6, 41.0, -24, 0.5, 33.5],
    [K.s6e + 0.16, -18.0, 3.6, 41.2, -24, 0.5, 33.5],
  ]);
  const camS7 = track([
    [K.s7, 17, 14, 47, 0, 1.5, 1],
    [A("s7:dibenamkan"), 16, 13.5, 45.5, 0, 1, 0],
    [A("s7:rumahnya"), 14, 17, 43, 0, -1.5, -2],
    [A("s7:golongan"), 9, 24, 37, 0, -5, -1],
    [A("s7:Dan"), 9, 26, 36, 0, -12, 0],
    [A("s7:untung"), 7.5, 24, 34, 0, -14, -1],
    [K.s7e + 0.16, 6.5, 22, 33, 0, -14, -1],
  ]);
  const camS8 = track([
    [K.s8, 2.4, 3.6, 30, 0.7, 0, 21],
    [K.s8 + 3.2, 1.6, 3.4, 29, 0.2, 0.2, 0],
    [K.end - 2, 0.6, 3.6, 24, 0, 1.5, -60],
    [K.dur, 0.2, 3.6, 21, 0, 1.8, -70],
  ]);
  const camAt = (t) => (t < K.s2 ? camS1(t) : t < K.s3 ? camS2(t) : t < K.s4 ? camS3(t) : t < K.s5 ? camS4(t) : t < K.s6 ? camS5(t) : t < K.s7 ? camS6(t) : t < K.s8 ? camS7(t) : camS8(t));
  const look = new THREE.Vector3();
  const clipY = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.03)];
  const bias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
  const tmpV = new THREE.Vector3(), dirV = new THREE.Vector3();
  const C = (h) => new THREE.Color(h);
  const SKY = { stTop: C(0x050506), stHor: C(0x0d0d10), dwTop: C(0x081226), dwHor: C(0x9a6444) };

  return (t) => {
    // ---- camera
    const c = camAt(t);
    const shake = t > tC - 0.1 && t < tSink1 + 0.6 ? 0.12 * Math.sin(Math.PI * clamp01((t - tC + 0.1) / (tSink1 - tC + 0.7))) : 0;
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.06 + shake * Math.sin(t * 47), c[1] + Math.sin(t * 0.23) * 0.05 + shake * Math.sin(t * 39 + 1), c[2] + Math.cos(t * 0.27) * 0.06);
    look.set(c[3], c[4] + shake * 0.5 * Math.sin(t * 31), c[5]); cam.lookAt(look);

    // ---- light mood
    const flick = t < K.s2 ? 1 - 0.85 * ramp(t, tFlick0, tFlick1) : 1;
    const s6dim = t >= K.s6 - 0.5 && t < K.s7 + 0.5 ? 1 - 0.55 * ramp(t, K.s6, A("s6:berilmu")) * (1 - ramp(t, K.s6e - 0.3, K.s7 + 0.4)) : 1;
    const dawn = ramp(t, A("s7:untung"), K.s8 + 3);
    const studio = flick * s6dim * (1 - dawn);
    key.intensity = 900 * studio + 300 * dawn;
    rimL.intensity = 1.4 * studio + 0.5 * dawn; rimR.intensity = 1.1 * studio + 0.8 * dawn; frontF.intensity = 0.35 * flick * s6dim + 0.4 * dawn;
    hemi.intensity = 0.3 + 0.5 * dawn;
    SBM.color.setScalar(2.6 * studio); SBM.opacity = 1 - dawn; soft.visible = dawn < 0.99;
    soft.position.y = 14 * dawn;
    scene.environment = t > K.s8 + 1.2 ? envDawn : envStudio;
    const envI = 0.25 + 0.75 * flick * (t > K.s6 && t < K.s7 ? 0.75 + 0.25 * s6dim : 1);
    for (const m of [GOLD, GOLDB, GOLDK, GLASS]) m.envMapIntensity = (m === GLASS ? 1.5 : m === GOLDB ? 0.95 : 1.3) * envI;
    sbB.visible = t < K.s4 + 1; sbR.visible = !(t > K.s5 && t < K.s6 + 1);
    SU.uTop.value.copy(SKY.stTop).lerp(SKY.dwTop, dawn); SU.uHor.value.copy(SKY.stHor).lerp(SKY.dwHor, dawn);
    SU.uSun.value = 0.55 * dawn; SU.uStar.value = 0.6 * dawn + 0.12 * (1 - dawn);
    scene.background.copy(SU.uHor.value);
    DUNE.color.copy(SU.uHor.value).multiplyScalar(0.45);
    MU.uHor.value.copy(SU.uHor.value).multiplyScalar(0.55 + 0.3 * dawn); MU.uCam.value.copy(cam.position);
    MU.uRefl.value = 0.78 + 0.12 * dawn;

    // ---- treasury sink and collapse
    const sy = sinkY(t);
    TG.position.y = sy;
    TG.rotation.z = t > tSink0 ? 0.03 * ramp(t, tSink0, tSink1) : 0;
    TG.visible = sy > -60;
    pitL.position.set(0, sy + 18, 4); pitL.intensity = t > tSink0 && t < tIris1 ? 420 * ramp(t, tSink0, tSink0 + 1.5) * (1 - ramp(t, tIris0, tIris1)) : 0;
    // ring tiles
    {
      const d = new THREE.Object3D();
      tileXZ.forEach(([x, z, a, b, cdl], i) => {
        const td = tC + 0.15 + 1.4 * cdl;
        const u = Math.max(0, t - td);
        const gap = t > tC - 0.2 ? 0.93 + 0.07 * (1 - ramp(t, tC - 0.2, tC + 0.3)) : 1;
        d.position.set(x, -4.9 * u * u - 0.05 * Math.min(1, u * 8), z);
        d.rotation.set((a - 0.5) * u * 1.6, 0, (b - 0.5) * u * 1.6);
        d.scale.set(gap, 1, gap);
        if (t > tIris1 || u > 4) d.scale.set(0, 0, 0);
        d.updateMatrix(); tiles.setMatrixAt(i, d.matrix);
      });
      tiles.instanceMatrix.needsUpdate = true;
    }
    for (const ck of cracks) {
      let acc = 0;
      for (const s of ck.segs) {
        const u = clamp01((t - tC + 0.35 - ck.delay * 0.4 - s.d * 0.16) / 0.22);
        const vis = t < tIris0 + 1.5 && u > 0;
        s.m.visible = vis; s.m.scale.x = Math.max(0.001, s.len * u);
        acc += s.len;
      }
    }
    CRK.color.setRGB(1.6, 1.38, 1.05).multiplyScalar(1 - ramp(t, tC + 3, tIris0 + 1.4) * 0.7);
    const ir = smooth((t - tIris0) / (tIris1 - tIris0));
    irisL.position.set(-RING * 1.5 + RING * ir, 0, 0); irisR.position.set(RING * 1.5 - RING * ir, 0, 0);
    irisL.visible = irisR.visible = t > tIris0 - 0.1;

    // ---- palanquin
    const zp = zPal(t);
    const carried = t >= tLift - 0.1 && t < tTP;
    const lift = t < tTP ? 0.5 * ramp(t, tLift, tLift + 0.6) * (1 - ramp(t, tArrive + 0.3, tArrive + 1.2)) : 0;
    const moving = carried && t > tGo && t < tArrive + 0.6;
    const bob = moving ? 0.035 * Math.abs(Math.sin(t * 5.2)) : 0;
    PAL.position.set(0, (t >= tTP ? sy : 0) + lift + bob, zp);
    PAL.rotation.z = moving ? 0.015 * Math.sin(t * 2.6) : 0;
    TH.rotation.y = 0;
    paradeL.position.set(0, 6, zp + 3); paradeL.intensity = t > K.s5 && t < tTP ? 140 * ramp(t, K.s5, K.s5 + 1) : 0;

    // ---- litter of keys
    const px = portXc(t);
    const walking = t < 22.4;
    const wph = px * 2.6;
    const lb2 = walking ? 0.05 * Math.abs(Math.sin(wph)) : 0.015 * Math.sin(t * 1.3);
    LIT.position.set(px, -0.06 + lb2, 18);
    LIT.rotation.x = 0.02 * Math.sin(wph * 0.5);
    RINGP.rotation.z = 0.07 * Math.sin(t * 1.25) + (walking ? 0.05 * Math.sin(wph * 0.5) : 0);
    RINGP.rotation.x = 0.05 * Math.sin(t * 0.9 + 1);
    for (const k of KEYS) { k.piv.rotation.z = 0.14 * Math.sin(t * 1.6 + k.ph) + 0.06 * Math.sin(t * 2.9 + k.ph * 2); k.piv.rotation.x = 0.06 * Math.sin(t * 1.1 + k.ph); }

    // ---- crowd
    const stepOut = 2.6 * ramp(t, tBack, tBack + 2.2) + 1.2 * ramp(t, tBack2, tBack2 + 1.6);
    for (const i of PORT) {
      const p = P[i];
      const ph = wph + (p.lx * 0.7 + p.side);
      const wb = walking ? 0.04 * Math.abs(Math.sin(ph)) : 0;
      const back = ramp(t, tBack, tBack + 2.2) * 1.4;
      placePerson(i, px + p.lx, wb - 0.04, 18 + p.lz + back, Math.PI / 2, 0.2 + 0.03 * Math.sin(ph), p.side > 0 ? -2.75 : -0.35 - 0.1 * Math.sin(ph), p.side > 0 ? -0.35 - 0.1 * Math.sin(ph) : -2.75, 0, false);
    }
    for (const i of BEAR) {
      const p = P[i];
      if (t < tTP) {
        const wb = moving ? 0.04 * Math.abs(Math.sin(t * 5.2 + p.lx)) : 0;
        const armUp = carried ? -1.35 : -0.55;
        const idle = 1 - ramp(t, K.s5 - 1.4, K.s5 + 0.1);
        placePerson(i, p.lx + Math.sign(p.lx) * 2.2 * idle, wb, zp + p.lz - Math.sign(p.lz) * 0.8 * idle, 0, carried ? 0.08 : 0.02, p.lx < 0 ? -0.08 : armUp, p.lx < 0 ? armUp : -0.08, 0, false);
      } else {
        const j = BEAR.indexOf(i);
        const x = [-5.2, -3.8, 3.8, 5.2][j], z = 18.6 + (j % 2) * 0.6 + 1.3 * stepOut;
        placePerson(i, x, 0, z, Math.PI, 0, -0.1, -0.1, 0, false);
      }
    }
    for (const i of ONL) {
      const p = P[i];
      const dz = Math.abs(p.z0 - zp);
      const near = t > K.s5 && t < tTP ? clamp01(1 - (dz - 6) / 20) * ramp(t, A("s5:kemegahannya") - 0.6, A("s5:Orang-orang")) : 0;
      const envy = near * p.reach;
      const sway = 0.04 * Math.sin(t * 0.9 + p.ph * 9);
      const ax = -0.12 - envy * (1.25 + 0.35 * Math.sin(t * 2.2 + p.ph * 7));
      const x = p.x0 + p.s * stepOut * (0.9 + 0.3 * p.ph), z = p.z0 + stepOut * 0.6;
      const yaw = p.s < 0 ? Math.PI / 2 : -Math.PI / 2;
      const yawT = yaw + (t > K.s5 && t < tTP ? Math.atan2(zp - p.z0, 8) * 0.5 * -p.s : 0);
      placePerson(i, x, 0, z, yawT, sway + envy * 0.12 - (t > tBack ? 0.06 * ramp(t, tBack, tBack + 1) : 0), p.s < 0 ? ax * 0.4 - 0.1 : ax, p.s < 0 ? ax : ax * 0.4 - 0.1, 0, false);
    }
    for (const i of ADV) {
      const p = P[i];
      const k = ADV.indexOf(i);
      const gest = t > K.s3 && t < K.s4 ? (k === 1 || k === 3 ? 0.6 + 0.25 * Math.sin(t * 1.8 + p.ph * 5) : 0) : 0;
      placePerson(i, p.x0 + 0.3 * stepOut, 0, p.z0 + 1.2 * stepOut, Math.PI + (p.x0 - 3) * 0.05, 0.03 * Math.sin(t * 0.7 + p.ph * 6), -0.1, -0.12 - gest, 0, false);
    }
    for (const i of LRN) {
      const p = P[i];
      const br = 0.012 * Math.sin(t * 1.4 + p.ph * 6);
      placePerson(i, p.x0, br, p.z0, p.yaw, 0.12, -0.3, -0.3, 1, false);
    }
    for (const im of [imRobe, imTorso, imHood, imHead, imArmL, imArmR]) im.instanceMatrix.needsUpdate = true;

    // ---- lamp
    const lampOn = 0.35 + 0.65 * ramp(t, K.s6, A("s6:berilmu"));
    const fl = 1 + 0.08 * Math.sin(t * 13.1) + 0.05 * Math.sin(t * 23.7 + 1);
    lampL.position.set(LC.x + 0.22, 0.75, LC.z); lampL.intensity = 16 * lampOn * fl;
    flame.scale.set(0.12 * fl, 0.24 * fl, 1); glow.material.opacity = lampOn;

    // ---- ghost cities
    const gIn = ramp(t, tGhost0, tGhost0 + 2.2) * (t < K.s5 + 0.5 ? 1 : 0);
    GHM.opacity = 0.075 * gIn; GHL.opacity = 0.5 * gIn;
    for (const g of GHOST) {
      const u = Math.max(0, t - tGhostF - g.delay);
      g.m.position.set(g.x + g.rx * u * 2, g.y - 7 * u * u, g.z);
      g.m.rotation.set(g.rx * u * 0.5, 0, g.rz * u * 0.5);
      g.m.visible = gIn > 0.001 && u < 3.2;
      const sc = 1 - 0.3 * clamp01(u / 3);
      g.m.scale.setScalar(sc);
    }
    if (t > tGhostF) { GHM.opacity *= 1 - clamp01((t - tGhostF) / 2.6); GHL.opacity *= 1 - clamp01((t - tGhostF) / 2.2); }

    // ---- particles: studio motes, parade glints, collapse dust, ghost dust
    for (let i = 0; i < 500; i++) {
      const s = mseed[i];
      const y = ((s[1] * 16 + t * (0.08 + s[3] * 0.1)) % 16);
      motes.pos[i * 3] = (s[0] - 0.5) * 34 + Math.sin(t * 0.3 + s[2] * 9) * 0.6;
      motes.pos[i * 3 + 1] = t > tSink0 && t < K.s8 + 3 ? -99 : y;
      motes.pos[i * 3 + 2] = (s[2] - 0.5) * 34 + 6;
    }
    motes.m.opacity = 0.5 * studio;
    motes.commit();
    for (let i = 0; i < 420; i++) {
      const s = gseed[i];
      const on = t > K.s5 && t < tTP + 0.1;
      const life = (t * (0.35 + s[3] * 0.3) + s[0]) % 1;
      glints.pos[i * 3] = (s[1] - 0.5) * 5;
      glints.pos[i * 3 + 1] = on ? 5.6 - life * 5.4 + 0.3 * Math.sin(t * 2 + s[2] * 8) : -99;
      glints.pos[i * 3 + 2] = zp + (s[2] - 0.5) * 6 - life * 1.5;
    }
    glints.commit();
    const dOn = t > tC - 0.1 && t < tIris1 + 1.5;
    for (let i = 0; i < 1100; i++) {
      const s = dseed[i];
      const tb = tC + s[3] * 4.5;
      const u = t - tb;
      if (!dOn || u < 0) { dust.pos[i * 3 + 1] = -99; continue; }
      const side = Math.floor(s[0] * 4), q = (s[1] - 0.5) * 2 * RING;
      const bx = side === 0 ? RING : side === 1 ? -RING : q, bz = side === 2 ? RING : side === 3 ? -RING : q;
      const out = 1 + u * 0.8 * (0.5 + s[2]);
      dust.pos[i * 3] = bx * (1 + 0.04 * u * s[2]) + (s[2] - 0.5) * 2;
      dust.pos[i * 3 + 1] = Math.max(-2, 0.4 + (7 + 9 * s[2]) * (1 - Math.exp(-u * 0.6)) - u * 0.45);
      dust.pos[i * 3 + 2] = bz * (1 + 0.04 * u * s[1]) + (s[1] - 0.5) * 2 * out * 0.3;
    }
    dust.m.opacity = 0.32 * ramp(t, tC - 0.1, tC + 0.6) * (1 - ramp(t, A("s7:untung"), tIris1 + 1.4)) * (0.4 + 0.6 * studio + 0.4 * dawn);
    dust.commit();
    for (let i = 0; i < 600; i++) {
      const s = gdseed[i];
      const g = GHOST[i % GHOST.length];
      const u = t - tGhostF - g.delay;
      if (u < 0 || u > 4 || t > K.s5 + 0.5) { gdust.pos[i * 3 + 1] = -99; continue; }
      gdust.pos[i * 3] = g.x + (s[0] - 0.5) * 16 + u * (s[1] - 0.5) * 6;
      gdust.pos[i * 3 + 1] = Math.max(0, g.y * (0.3 + s[2]) - u * u * 4 + u * 2);
      gdust.pos[i * 3 + 2] = g.z + (s[3] - 0.5) * 10;
    }
    gdust.m.opacity = 0.5 * (1 - clamp01((t - tGhostF) / 4));
    gdust.commit();

    // ---- orb reflects the gold around it (only while the camera is close)
    const orbLive = t > K.s4 - 0.2 && t < A("s4:Al-Qur'an") + 2.5;
    if (orbLive) {
      orb.visible = false; orb.getWorldPosition(tmpV); cubeCam.position.copy(tmpV);
      for (const m of MIRROR) m.visible = false;
      cubeCam.update(r, scene);
      for (const m of MIRROR) m.visible = true;
      orb.visible = true; ORB.envMap = cubeRT.texture; ORB.envMapIntensity = 1.15;
    } else { ORB.envMap = null; ORB.envMapIntensity = 1.3 * envI; }

    // ---- mirror pass
    cam.updateMatrixWorld();
    cam.getWorldDirection(dirV);
    vcam.fov = cam.fov; vcam.aspect = cam.aspect; vcam.near = cam.near; vcam.far = 1400; vcam.updateProjectionMatrix();
    vcam.position.set(cam.position.x, -cam.position.y, cam.position.z);
    vcam.up.set(0, -1, 0);
    tmpV.copy(cam.position).add(dirV); tmpV.y = -tmpV.y;
    vcam.lookAt(tmpV); vcam.updateMatrixWorld();
    texMat.copy(bias).multiply(vcam.projectionMatrix).multiply(vcam.matrixWorldInverse);
    for (const m of MIRROR) m.visible = false;
    const softVis = soft.visible; if (t > tC) soft.visible = false;
    const oldClip = r.clippingPlanes; r.clippingPlanes = clipY;
    r.setRenderTarget(mirrorRT); r.clear(); r.render(scene, vcam); r.setRenderTarget(null);
    r.clippingPlanes = oldClip; soft.visible = softVis;
    for (const m of MIRROR) m.visible = true;
    irisL.visible = irisR.visible = t > tIris0 - 0.1;

    comp.render();
  };
}
