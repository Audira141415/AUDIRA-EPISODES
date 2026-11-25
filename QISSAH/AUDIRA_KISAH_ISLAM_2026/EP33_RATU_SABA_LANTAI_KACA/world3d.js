// EP33 RATU SABA DAN LANTAI KACA. GLASSCRAFT: spatial glassmorphism at purple dusk. One connected world on one axis
// (camera mostly looks "north", -z; west = -x):
//   SABA COURT (x -30): warm sandstone disc, frosted sun-lattice screens, the queen's gold throne, a round glass council
//   table whose top works as a holographic war table (tiny glass soldiers, a glass city maquette).
//   GLASS BRIDGE (x -20..-14) over dusk dunes.
//   SULAIMAN'S GLASS PALACE (x 0): a long pool of teal water under a glass floor (tile seams appear only when the floor
//   is "revealed" as glass), frosted glass pillars with gold cores, floating frosted panels, three frosted arches, and an
//   ice-glass dais at the north end where the throne arrives as a flash of light.
// Depiction: Nabi Sulaiman never appears; his answers are light (the gate refusing the gift, the pillars lighting up,
// rising motes of gratitude). The man "with knowledge of the Book" and the 'Ifrit are not shown: the throne arrives as
// gathered light and a flash. The queen and her chiefs are small faceless robed silhouettes. When she uncovers her
// garment only a ripple in the floor's reflection is shown. Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, envStrips, back, std } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const mix = (a, b, u) => a + (b - a) * u;
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x2a2350, fog: 0.0062, exp: 0.9, bloom: [0.32, 0.45, 0.88], shadow: true });
  // guard: one NaN/Inf pixel would be smeared over the whole frame by the bloom blur
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;float f(float x){return (x<40.0&&x>=0.0)?x:(x>=40.0?40.0:0.0);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(f(c.r),f(c.g),f(c.b),1.0);}" }), 1);
  cam.fov = 38; cam.near = 0.05; cam.far = 1400; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(3327);
  const C = (h) => new THREE.Color(h);
  scene.fog.color.setRGB(0.27, 0.19, 0.33);
  envStrips(r, scene, [[60, 12, 0xffc48a, 1.3, -40, 8, 0], [40, 30, 0xe8eef0, 0.45, 0, 40, 0], [40, 8, 0x8a6fc0, 0.35, 30, 5, 0], [60, 6, 0x3fa7a3, 0.15, 0, -10, 30], [30, 10, 0xffe2b0, 0.7, 0, 12, -40]], 0x140f22);

  const CX = -30; // Saba court centre x
  const TB = new THREE.Vector3(0, 0.9, -12); // throne B (on the dais)
  const TA = new THREE.Vector3(CX, 0.4, -7.2); // throne A

  // ---------- timing
  const tMen = A("s1:menyingkap"), tAir1 = A("s1:air"), tTer1 = A("s1:Ternyata");
  const tSaba = A("s2:Saba"), tSur = A("s2:surat"), tOpen = A("s2:dengan"), tJang = A("s2:Janganlah");
  const tMus = A("s3:bermusyawarah"), tPem = A("s3:pembesarnya"), tKuat = A("s3:kuat"), tRaja = A("s3:raja-raja");
  const tMasuk = A("s3:memasuki"), tMer = A("s3:merusaknya"), tMaka = A("s3:Maka"), tPil = A("s3:memilih"), tKir = A("s3:mengirim"), tLalu = A("s3:lalu");
  const tTol = A("s4:menolak"), tAl4 = A("s4:Allah"), tBaik = A("s4:baik"), tTanya = A("s4:bertanya"), tSing4 = A("s4:singgasana");
  const tGa = A("s5:membawanya"), tF = A("s5:berkedip"), tAda = A("s5:Singgasana"), tHad = A("s5:hadapannya"), tSul5 = A("s5:Sulaiman"), tUji = A("s5:mengujiku");
  const tUbah = A("s6:diubah"), tSang = A("s6:sang"), tSer = A("s6:serupa"), tSeak = A("s6:seakan-akan"), tItu = A("s6:itulah"), tTid = A("s6:Tidak");
  const tDim = A("s7:diminta"), tIst = A("s7:istana"), tKol = A("s7:kolam"), tAir7 = A("s7:air"), tTer7 = A("s7:ternyata"), tKaca = A("s7:kaca"), tSul7 = A("s7:Sulaiman"), tAl7 = A("s7:Allah");
  const tBen = A("s8:kebenaran"), tKis = A("s8:Kisah");

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xd9ecf2, 0x3a2d5a, 0.75); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb98a, 1.7);
  sun.position.set(-40, 16, 14); sun.target.position.set(-10, 0, 0); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 40, bottom: -40, near: 1, far: 150 }); sun.shadow.bias = -0.0006;
  const fill = new THREE.DirectionalLight(0x9ad7e0, 0.45); fill.position.set(20, 12, 30); scene.add(fill);
  const lampA = new THREE.PointLight(0xffc070, 16, 26, 1.6); lampA.position.set(CX, 4.6, -1); scene.add(lampA);
  const poolL = new THREE.PointLight(0x5fd0c8, 30, 26, 1.6); poolL.position.set(0, 0.6, 4); scene.add(poolL);
  const flashL = new THREE.PointLight(0xfff2d0, 0, 34, 1.4); flashL.position.copy(TB).add(new THREE.Vector3(0, 1.6, 1.5)); scene.add(flashL);
  const gateL = new THREE.PointLight(0xd9ecf2, 0, 14, 1.8); gateL.position.set(-15, 2.4, 4); scene.add(gateL);
  const thrL = new THREE.PointLight(0xffd59a, 0, 12, 1.6); thrL.position.copy(TB).add(new THREE.Vector3(0, 3.0, 5)); scene.add(thrL);

  // ---------- materials
  const gold = std(0xe0b050, 0.34, 0.7, { envMapIntensity: 1.0, emissive: 0x2a1804 });
  const marble = std(0xdfe4ee, 0.42, 0.05);
  const sand = std(0xc79a64, 0.72, 0.02);
  const iceSolid = new THREE.MeshPhysicalMaterial({ color: 0xc6e2ea, roughness: 0.16, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5 });
  const glass = (op = 0.3, rough = 0.15, col = 0xd9ecf2) => new THREE.MeshPhysicalMaterial({ color: col, roughness: rough, metalness: 0, transparent: true, opacity: op, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.9, side: THREE.DoubleSide, depthWrite: false });
  const silM = std(0x1d1229, 0.9, 0, { emissive: 0x07040c, envMapIntensity: 0.3 });
  const silChief = std(0x241a32, 0.9, 0, { envMapIntensity: 0.3 });
  const add = (geo, mat, x, y, z, parent = scene, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (shadow) { m.castShadow = true; m.receiveShadow = true; } parent.add(m); return m; };
  const Box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ---------- sky dome (purple dusk, warm west glow)
  const skyU = { uWarm: { value: 0 } };
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform float uWarm;varying vec3 vP;void main(){vec3 d=normalize(vP);float h=d.y;
      vec3 top=vec3(.035,.03,.10),mid=vec3(.13,.09,.25),hor=vec3(.42,.24,.34),sunc=vec3(1.,.55,.30);
      float w=pow(max(0.,dot(normalize(vec3(-1.,.04,-.3)),d)),5.);
      vec3 c=mix(hor,mid,smoothstep(0.,.22,h));c=mix(c,top,smoothstep(.22,.75,h));
      c+=sunc*w*(.5+.4*uWarm)*(1.-smoothstep(.0,.35,h));
      c+=vec3(.2,.1,.08)*uWarm*(1.-smoothstep(0.,.3,h));
      if(h<0.)c=mix(hor*.75,vec3(.08,.06,.12),smoothstep(0.,-.25,h));
      gl_FragColor=vec4(c,1.);}` })));
  const NS = 520, stars = pts(scene, NS, { size: 2.2, color: 0xffffff });
  const SD = [];
  for (let i = 0; i < NS; i++) {
    const az = rnd() * Math.PI * 2, el = 0.12 + Math.pow(rnd(), 0.7) * 1.3;
    stars.pos.set([Math.cos(az) * Math.cos(el) * 450, Math.sin(el) * 450, Math.sin(az) * Math.cos(el) * 450], i * 3);
    SD.push([0.25 + 0.75 * rnd(), rnd() * 6.28]);
  }

  // ---------- dunes
  {
    const g = new THREE.PlaneGeometry(520, 520, 170, 170); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const flat = sm((Math.max(Math.abs(z - 2) - 26, (x < -48 ? -48 - x : x > 22 ? x - 22 : 0)) ) / 30);
      p.setY(i, -1.3 + flat * (4.5 * vnoise(x * 0.025, z * 0.025) + 1.4 * vnoise(x * 0.08 + 3, z * 0.08)) + 0.3 * vnoise(x * 0.3, z * 0.3));
    }
    g.computeVertexNormals();
    const m = add(g, std(0x8a6474, 0.95, 0, { flatShading: true }), 0, 0, 0); m.castShadow = false;
  }

  // ---------- SULAIMAN'S GLASS PALACE
  for (const [w, d, x, z] of [[3, 26, -12.5, 5], [3, 26, 12.5, 5], [28, 3, 0, 19.5], [28, 9, 0, -12.5]]) add(Box(w, 1.6, d), marble, x, -0.8, z);
  add(Box(22, 0.2, 26), std(0x062a33, 0.6, 0), 0, -1.5, 5, scene, false);
  for (const [w, d, x, z] of [[22.2, 0.1, 0, 18], [22.2, 0.1, 0, -8], [0.1, 26.2, -11, 5], [0.1, 26.2, 11, 5]]) add(Box(w, 0.06, d), gold, x, 0.02, z, scene, false);
  // water (shader) and glass floor (shader) share ripple rings
  const RIP = [new THREE.Vector4(1.5, 8.1, tMen + 0.15, 1), new THREE.Vector4(1.5, 8.1, tAir1 - 0.25, 0.7), new THREE.Vector4(0.3, 2.0, tKol + 0.1, 1), new THREE.Vector4(0.3, 2.0, tAir7 + 0.15, 0.7)];
  const RING = `uniform vec4 uRip[4];float ring(vec2 p,vec4 R,float spd){float a=uT-R.z;if(a<0.)return 0.;float d=length(p-R.xy);float rr=a*spd;return sin((d-rr)*9.)*exp(-abs(d-rr)*2.6)*exp(-a*.45)*R.w*smoothstep(0.,.2,a);}`;
  const wU = { uT: { value: 0 }, uRip: { value: RIP }, uCam: { value: new THREE.Vector3() }, uGlow: { value: 1 } };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(22, 26, 1, 1), new THREE.ShaderMaterial({ uniforms: wU,
    vertexShader: "varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: `uniform float uT,uGlow;uniform vec3 uCam;varying vec3 vW;${RING}
      void main(){vec2 p=vW.xz;
      float w=sin(p.x*1.3+uT*.9+sin(p.y*.7+uT*.4)*1.6)*.5+sin(p.y*1.7-uT*1.1+sin(p.x*.9)*1.2)*.5;
      float c=pow(abs(sin(p.x*2.1+w*1.4+uT*.5)*sin(p.y*2.3-w*1.2-uT*.45)),.6);
      float rp=0.;for(int i=0;i<4;i++)rp+=ring(p,uRip[i],1.7);
      vec3 deep=vec3(.015,.10,.13),teal=vec3(.07,.36,.36),hi=vec3(.55,.9,.88);
      vec3 col=mix(deep,teal,.45+.25*w+.3*rp);col+=hi*c*.2;col+=hi*max(rp,0.)*.45;
      vec3 V=normalize(uCam-vW);float fr=pow(1.-abs(V.y),3.);col=mix(col,vec3(.42,.27,.42),fr*.55);
      gl_FragColor=vec4(col*uGlow,1.);}` }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.5, 5); scene.add(water);
  const fU = { uT: { value: 0 }, uRip: { value: RIP }, uCam: { value: new THREE.Vector3() }, uSeam: { value: 0 }, uRipK: { value: 1 }, uSw: { value: new THREE.Vector3(0, 0, 0) }, uSwA: { value: 0 } };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 26, 1, 1), new THREE.ShaderMaterial({ uniforms: fU, transparent: true, depthWrite: false,
    vertexShader: "varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: `uniform float uT,uSeam,uRipK,uSwA;uniform vec3 uCam,uSw;varying vec3 vW;${RING}
      void main(){vec2 p=vW.xz;vec2 dl=(.5-abs(fract(p/2.)-.5))*2.;float md=min(dl.x,dl.y);
      float line=1.-smoothstep(.012,.05,md);float glint=1.-smoothstep(.0,.3,md);
      float rp=0.;for(int i=0;i<4;i++)rp+=ring(p,uRip[i],1.7);
      float sw=uSwA*exp(-pow(length(p-uSw.xy)-uSw.z,2.)*.9);
      vec3 V=normalize(uCam-vW);float fr=pow(1.-abs(V.y),4.);
      vec3 col=vec3(.78,.9,.95)*(1.-.35*fr)+vec3(.3,.18,.36)*fr;
      col=mix(col,vec3(1.,.84,.5),line*uSeam*.45);
      float a=.015+fr*.1+line*(.015+.7*uSeam)+glint*uSeam*.04+sw*(.12+line*.9)+abs(rp)*uRipK*.9;
      gl_FragColor=vec4(col*(1.+sw*1.4+line*uSeam*.6+abs(rp)*uRipK*.6),clamp(a,0.,.85));}` }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.006, 5); floor.renderOrder = 3; scene.add(floor);

  // dais: three ice-glass steps with gold trims
  [[10, 6.8, 0.15, -11.4], [8.6, 6.1, 0.45, -11.75], [7.2, 5.4, 0.75, -12.1]].forEach(([w, d, y, z]) => {
    add(Box(w, 0.3, d), iceSolid, 0, y, z);
    add(Box(w + 0.04, 0.035, 0.05), gold, 0, y + 0.15, z + d / 2, scene, false);
  });
  const ringM = new THREE.MeshBasicMaterial({ color: C(0xbfeff5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const dRing = add(new THREE.TorusGeometry(1.9, 0.035, 8, 96), ringM, TB.x, 0.93, TB.z, scene, false); dRing.rotation.x = -Math.PI / 2;
  // AUDIRA engraved small on the middle riser of the dais
  {
    const tx = canvasTex(640, 96, (x, w, h) => {
      x.clearRect(0, 0, w, h); x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "600 62px Marcellus, Georgia, serif";
      const s = "A U D I R A";
      x.fillStyle = "rgba(30,20,10,.55)"; x.fillText(s, w / 2 + 2, h / 2 + 3);
      x.fillStyle = "rgba(244,210,130,.98)"; x.fillText(s, w / 2, h / 2);
      x.fillStyle = "rgba(244,210,130,.8)"; x.fillRect(40, h / 2 - 1, 70, 2); x.fillRect(w - 110, h / 2 - 1, 70, 2);
    });
    add(new THREE.PlaneGeometry(1.9, 0.285), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false }), 0, 0.45, -8.69, scene, false);
  }

  // pillars: frosted glass shells with a gold light core
  const cores = [];
  const shellM = glass(0.36, 0.45, 0xe2f1f5);
  const PZ = [18, 12, 6, 0, -6, -12, -16];
  PZ.forEach((z, i) => {
    for (const s of [-1, 1]) {
      const x = s * 12.5;
      add(Box(1.7, 0.4, 1.7), gold, x, 0.2, z);
      add(new THREE.CylinderGeometry(0.62, 0.62, 10.6, 28, 1, true), shellM, x, 5.7, z, scene, false);
      const cm = new THREE.MeshBasicMaterial({ color: C(0xffd27a) });
      add(new THREE.CylinderGeometry(0.13, 0.13, 10.4, 10), cm, x, 5.7, z, scene, false);
      cores.push([cm, i]);
      add(Box(1.6, 0.35, 1.6), gold, x, 11.15, z);
    }
  });
  for (const s of [-1, 1]) add(Box(0.16, 0.16, 34.4), gold, s * 12.5, 11.3, 1, scene, false);
  // back arches (frosted, lattice)
  const archTex = canvasTex(256, 560, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const path = () => { x.beginPath(); x.moveTo(6, h - 4); x.lineTo(6, 128); x.arc(w / 2, 128, w / 2 - 6, Math.PI, 0); x.lineTo(w - 6, h - 4); x.closePath(); };
    path(); const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(230,244,248,.22)"); gr.addColorStop(1, "rgba(150,130,200,.1)"); x.fillStyle = gr; x.fill();
    x.save(); path(); x.clip(); x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = 2;
    for (let i = -h; i < w + h; i += 42) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); }
    x.restore(); path(); x.strokeStyle = "rgba(226,186,98,.95)"; x.lineWidth = 6; x.stroke();
  });
  const archM = new THREE.MeshBasicMaterial({ map: archTex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  for (const x of [-6.6, 0, 6.6]) add(new THREE.PlaneGeometry(5.6, 12.25), archM, x, 6.1, -16.6, scene, false);
  // west gate: a frosted glass door in a gold frame
  const gateM = glass(0.42, 0.5, 0xe6f4f7); gateM.emissive = C(0xbfeff5); gateM.emissiveIntensity = 0;
  {
    const g = add(Box(0.12, 5, 3.0), gateM, -14.05, 2.5, 4, scene, false);
    for (const z of [2.45, 5.55]) add(Box(0.3, 5.4, 0.18), gold, -14.05, 2.7, z);
    add(Box(0.3, 0.22, 3.3), gold, -14.05, 5.3, 4);
  }
  const gRingM = new THREE.MeshBasicMaterial({ color: C(0xd9f6fb), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const gRing = add(new THREE.TorusGeometry(1, 0.025, 8, 80), gRingM, -14.2, 2.2, 4, scene, false); gRing.rotation.y = Math.PI / 2;
  // floating frosted panels (spatial glassmorphism)
  const panTex = canvasTex(256, 384, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const rr = (a, b, c, d, rad) => { x.beginPath(); x.moveTo(a + rad, b); x.arcTo(a + c, b, a + c, b + d, rad); x.arcTo(a + c, b + d, a, b + d, rad); x.arcTo(a, b + d, a, b, rad); x.arcTo(a, b, a + c, b, rad); x.closePath(); };
    rr(4, 4, w - 8, h - 8, 34); const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(236,248,250,.42)"); gr.addColorStop(1, "rgba(140,120,200,.16)"); x.fillStyle = gr; x.fill();
    x.strokeStyle = "rgba(255,255,255,.8)"; x.lineWidth = 3; x.stroke();
    x.strokeStyle = "rgba(226,186,98,.7)"; x.lineWidth = 2; rr(18, 18, w - 36, h - 36, 24); x.stroke();
  });
  const panM = new THREE.MeshBasicMaterial({ map: panTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.85 });
  const PAN = [];
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1, sz = 2.4 + rnd() * 1.6;
    const m = add(new THREE.PlaneGeometry(sz, sz * 1.5), panM, s * (7.5 + rnd() * 4), 4 + rnd() * 5, -14 + i * 3.2 + rnd() * 1.5, scene, false);
    PAN.push([m, m.position.clone(), s * (0.5 + rnd() * 0.6), rnd() * 6.28]);
  }

  // ---------- GLASS BRIDGE between the courts
  add(Box(6.4, 0.12, 2.8), glass(0.45, 0.2), -17, -0.06, 4, scene, false);
  for (const z of [2.6, 5.4]) add(Box(6.4, 0.06, 0.06), gold, -17, 0.75, z, scene, false);
  for (let i = 0; i < 5; i++) for (const z of [2.6, 5.4]) add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), gold, -19.9 + i * 1.45, 0.38, z, scene, false);

  // ---------- SABA COURT
  add(new THREE.CylinderGeometry(10, 10.5, 1.6, 72), sand, CX, -0.8, 0);
  { const m = add(new THREE.TorusGeometry(9.5, 0.06, 6, 120), gold, CX, 0.01, 0, scene, false); m.rotation.x = -Math.PI / 2; }
  add(new THREE.CylinderGeometry(1.8, 1.9, 0.4, 40), gold, TA.x, 0.2, TA.z);
  const sunTex = canvasTex(256, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,226,180,.42)"); gr.addColorStop(1, "rgba(200,140,120,.2)"); x.fillStyle = gr; x.fillRect(4, 4, w - 8, h - 8);
    x.strokeStyle = "rgba(226,180,90,.75)"; x.lineWidth = 3;
    for (let yy = 40; yy < h; yy += 76) for (let xx = 40; xx < w; xx += 88) { x.beginPath(); x.arc(xx + (yy % 152 ? 44 : 0), yy, 26, 0, 6.3); x.stroke(); }
    x.lineWidth = 6; x.strokeStyle = "rgba(226,186,98,.95)"; x.strokeRect(4, 4, w - 8, h - 8);
  });
  const scrM = new THREE.MeshBasicMaterial({ map: sunTex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i - 3) * 0.3;
    const m = add(new THREE.PlaneGeometry(3.2, 6.4), scrM, CX + Math.sin(a) * 9.2, 3.3, Math.cos(a) * 9.2, scene, false);
    m.rotation.y = a;
  }
  const lampGlow = [];
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.06, 0.1, 3.4, 8), gold, CX + s * 4.4, 1.7, -5.2);
    const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.6, 0.8) });
    add(new THREE.SphereGeometry(0.26, 16, 12), gm, CX + s * 4.4, 3.55, -5.2, scene, false);
    lampGlow.push(gm);
  }
  // council table (glass top, gold rim)
  add(new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64), glass(0.24, 0.3, 0xa9bccc), CX, 1.0, 0, scene, false);
  { const m = add(new THREE.TorusGeometry(2.4, 0.045, 8, 100), gold, CX, 1.0, 0, scene, false); m.rotation.x = -Math.PI / 2; }
  add(new THREE.CylinderGeometry(0.3, 0.55, 1.0, 24), gold, CX, 0.5, 0);

  // ---------- silhouettes (faceless, robed)
  function person(queen, mat) {
    const G = new THREE.Group();
    const prof = queen
      ? [[0, 0], [0.5, 0], [0.44, 0.08], [0.32, 0.5], [0.24, 1.0], [0.2, 1.28], [0.25, 1.38], [0.12, 1.48], [0, 1.5]]
      : [[0, 0], [0.42, 0], [0.38, 0.25], [0.3, 0.9], [0.24, 1.2], [0.28, 1.3], [0.14, 1.42], [0, 1.44]];
    add(new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 32), mat, 0, 0, 0, G);
    if (queen) {
      add(new THREE.SphereGeometry(0.115, 18, 14), mat, 0, 1.6, 0, G);
      const veil = [[0.001, 1.79], [0.1, 1.76], [0.15, 1.62], [0.2, 1.4], [0.3, 1.0], [0.36, 0.55]].map(([a, b]) => new THREE.Vector2(a, b));
      const v = add(new THREE.LatheGeometry(veil, 28, Math.PI * 0.55, Math.PI * 0.9), mat, 0, 0, 0, G); // veil falls down the back
      v.material = mat;
      const tr = add(new THREE.ConeGeometry(0.42, 1.2, 24, 1, true, Math.PI * 0.7, Math.PI * 0.6), mat, 0, 0.42, -0.12, G); tr.scale.set(1, 1, 0.55); // train
      add(new THREE.TorusGeometry(0.105, 0.016, 8, 32), gold, 0, 1.73, 0, G).rotation.x = Math.PI / 2;
      for (let i = 0; i < 3; i++) add(new THREE.ConeGeometry(0.018, 0.06, 6), gold, (i - 1) * 0.06, 1.77, 0.09, G);
    } else {
      add(new THREE.SphereGeometry(0.14, 18, 14), mat, 0, 1.54, 0, G);
      add(new THREE.SphereGeometry(0.18, 16, 10, 0, 6.3, 0, 1.4), mat, 0, 1.58, 0, G); // turban cap
    }
    return G;
  }
  const queen = person(true, silM); scene.add(queen);
  const reflM = new THREE.MeshBasicMaterial({ color: C(0x2a2040), transparent: true, opacity: 0.32, depthTest: false, depthWrite: false });
  const qRef = person(true, reflM); qRef.traverse((o) => { if (o.isMesh) { o.material = reflM; o.castShadow = false; o.renderOrder = 2; } }); qRef.scale.y = -1; scene.add(qRef);
  [75, -75, 115, -115, 150, -150].forEach((d) => {
    const a = (d * Math.PI) / 180, p = person(false, silChief);
    p.position.set(CX + Math.sin(a) * 3.3, 0, Math.cos(a) * 3.3); p.rotation.y = a + Math.PI; p.scale.setScalar(0.98);
    scene.add(p);
  });

  // ---------- thrones
  function makeThrone(ghost) {
    const G = new THREE.Group();
    const gm = ghost || std(0xe0b050, 0.34, 0.7, { envMapIntensity: 1.0, emissive: 0x2a1804 });
    const cush = ghost || std(0x8a1f2e, 0.7, 0);
    const ins = ghost || std(0x6e1a28, 0.62, 0);
    const gem = ghost || std(0xc2263b, 0.12, 0.2, { emissive: 0x5a0a14, emissiveIntensity: 1 });
    const a = (geo, m, x, y, z) => add(geo, m, x, y, z, G, !ghost);
    a(Box(2.3, 0.45, 1.9), gm, 0, 0.225, 0);
    a(Box(2.0, 0.3, 1.6), cush, 0, 0.6, 0.05);
    a(Box(2.1, 2.7, 0.32), gm, 0, 1.95, -0.8);
    a(Box(1.5, 2.0, 0.06), ins, 0, 1.95, -0.62);
    for (const s of [-1, 1]) {
      a(Box(0.32, 0.75, 1.7), gm, s * 1.12, 0.82, 0);
      a(new THREE.SphereGeometry(0.17, 16, 12), gm, s * 1.12, 1.26, 0.78);
      a(Box(0.22, 3.5, 0.22), gm, s * 1.12, 1.75, -0.82);
      a(new THREE.SphereGeometry(0.16, 16, 12), gm, s * 1.12, 3.6, -0.82);
      a(new THREE.SphereGeometry(0.09, 12, 10), gem, s * 1.12, 0.82, 0.86);
    }
    const arch = a(new THREE.CylinderGeometry(1.05, 1.05, 0.32, 32, 1, false, Math.PI / 2, Math.PI), gm, 0, 3.3, -0.8); arch.rotation.x = Math.PI / 2;
    const disc = a(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32), gm, 0, 3.75, -0.6); disc.rotation.x = Math.PI / 2;
    const star = new THREE.Group(); star.position.set(0, 3.75, -0.58); G.add(star);
    const stM = ghost || new THREE.MeshPhysicalMaterial({ color: 0xbfeff5, roughness: 0.1, clearcoat: 1, emissive: 0x2a8f96, emissiveIntensity: 0.8 });
    for (const rz of [0, Math.PI / 4]) { const b = add(Box(0.56, 0.56, 0.1), stM, 0, 0, 0, star, false); b.rotation.z = rz; }
    star.scale.setScalar(0.001);
    for (const [x, y] of [[0, 2.65], [-0.42, 2.25], [0.42, 2.25], [-0.42, 1.55], [0.42, 1.55]]) a(new THREE.SphereGeometry(0.1, 14, 10), gem, x, y, -0.56);
    return { G, gm, cush, ins, gem, disc, star };
  }
  const thrA = makeThrone(); thrA.G.position.copy(TA); thrA.G.scale.setScalar(0.9); scene.add(thrA.G);
  const thrB = makeThrone(); thrB.G.position.copy(TB); scene.add(thrB.G);
  const ghostM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.8, 0.4), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const ghost = makeThrone(ghostM); ghost.star.visible = false; scene.add(ghost.G);
  const RUBY = C(0x8a1f2e), TEALC = C(0x1f5560), GEMR = C(0xc2263b), GEMI = C(0x9fe3ec), EMR = C(0x5a0a14), EMI = C(0x1a7f88), INSR = C(0x6e1a28), INSI = C(0x173f52), GOLD = C(0xd4a84a), GOLDP = C(0xe8d3a0);

  // ---------- the letter (frosted tablet, gold seal, lines of light written right to left)
  const letter = new THREE.Group(); scene.add(letter);
  add(Box(1.25, 1.65, 0.05), glass(0.42, 0.5, 0xbcd0dc), 0, 0, 0, letter, false);
  for (const [w, h, x, y] of [[1.33, 0.05, 0, 0.84], [1.33, 0.05, 0, -0.84], [0.05, 1.7, 0.645, 0], [0.05, 1.7, -0.645, 0]]) add(Box(w, h, 0.07), gold, x, y, 0, letter, false);
  const sealM = std(0xc8902f, 0.3, 0.9, { emissive: 0x6a3a08, emissiveIntensity: 0.6 });
  const sealL = add(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20, 1, false, 0, Math.PI), sealM, 0, -0.15, 0.05, letter, false); sealL.rotation.x = Math.PI / 2;
  const sealR = add(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20, 1, false, Math.PI, Math.PI), sealM, 0, -0.15, 0.05, letter, false); sealR.rotation.x = Math.PI / 2;
  const lineM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 1.05), transparent: true, opacity: 1 });
  const LINES = [];
  for (let i = 0; i < 7; i++) {
    const g = Box(1, 0.035, 0.01); g.translate(-0.5, 0, 0);
    const m = add(g, lineM, 0.47, 0.62 - i * 0.2, 0.035, letter, false);
    LINES.push([m, i === 0 ? 0.55 : 0.6 + rnd() * 0.34]);
  }

  // ---------- war-table hologram (Saba): soldiers and a glass city
  const NSOL = 36;
  const solM = std(0xd9603f, 0.3, 0.1, { emissive: 0x9a3020, emissiveIntensity: 0.9 });
  const sol = new THREE.InstancedMesh(new THREE.ConeGeometry(0.055, 0.2, 6), solM, NSOL); sol.frustumCulled = false; scene.add(sol);
  const SOL = [];
  for (let i = 0; i < NSOL; i++) { const b = i < 18 ? 0 : 1, j = i % 18; SOL.push([CX - 1.55 + (j % 6) * 0.17, 0.25 + Math.floor(j / 6) * 0.2 + b * 0.75 - 0.6, rnd()]); }
  const cityM = new THREE.MeshPhysicalMaterial({ color: 0x8fe0e0, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85, emissive: 0x1c6a70, emissiveIntensity: 0.6 });
  const CITY = [];
  for (let i = 0; i < 14; i++) {
    const h = 0.14 + rnd() * 0.34, w = 0.13 + rnd() * 0.08;
    const g = Box(w, h, w); g.translate(0, h / 2, 0);
    const m = add(g, cityM, CX + 0.6 + (i % 4) * 0.24 + rnd() * 0.06, 1.04, -0.5 + Math.floor(i / 4) * 0.27, scene, false);
    CITY.push([m, rnd() - 0.5, rnd() - 0.5, rnd()]);
  }
  const DUSTC = pts(scene, 40, { size: 0.08, color: 0x9ff0f0 });
  const DC = Array.from({ length: 40 }, () => [rnd() * 6.28, 0.3 + rnd() * 0.9, rnd()]);

  // ---------- the gift chest
  const chest = new THREE.Group(); scene.add(chest);
  add(Box(0.8, 0.45, 0.55), glass(0.55, 0.2, 0xffe6b0), 0, 0.225, 0, chest, false);
  for (const x of [-0.3, 0, 0.3]) add(Box(0.06, 0.48, 0.58), gold, x, 0.225, 0, chest, false);
  const lid = add(new THREE.CylinderGeometry(0.28, 0.28, 0.82, 20, 1, false, 0, Math.PI), gold, 0, 0.45, 0, chest, false); lid.rotation.z = Math.PI / 2; lid.rotation.y = 0;
  const chGlowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.7), transparent: true, opacity: 0.9 });
  add(new THREE.SphereGeometry(0.14, 14, 10), chGlowM, 0, 0.22, 0, chest, false);

  // ---------- light fx
  const radTex = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.2, "rgba(255,244,214,.75)"); g.addColorStop(0.55, "rgba(200,230,240,.18)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  const flashM = new THREE.MeshBasicMaterial({ map: radTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
  const flash = add(new THREE.PlaneGeometry(1, 1), flashM, TB.x, TB.y + 1.8, TB.z + 0.6, scene, false); flash.renderOrder = 10;
  const sealFlashM = flashM.clone(); const sealFlash = add(new THREE.PlaneGeometry(1, 1), sealFlashM, 0, 0, 0, scene, false); sealFlash.renderOrder = 10;
  const NG = 200, gath = pts(scene, NG, { size: 0.11, color: 0xffe9b8 });
  const GD = Array.from({ length: NG }, () => { const u = rnd() * 2 - 1, a = rnd() * 6.28, s = Math.sqrt(1 - u * u); return [s * Math.cos(a), u, s * Math.sin(a), 2.5 + rnd() * 3.5, rnd()]; });
  const NM = 150, motes = pts(scene, NM, { size: 0.09, color: 0xffd98a });
  const MD = Array.from({ length: NM }, () => [rnd() * 6.28, 0.6 + rnd() * 3.2, rnd()]);
  const NH = 300, hall = pts(scene, NH, { size: 0.07, color: 0xe6f4ff });
  const HD = Array.from({ length: NH }, () => [-12 + rnd() * 24, rnd() * 9, -16 + rnd() * 36, rnd()]);

  // ---------- camera (pos xyz, target xyz), hold keys around word moments so the spline does not overshoot
  const camT = track([
    [0, 6.8, 2.4, 23.5, 1.9, 1.3, 8.5],
    [2.6, 5.4, 2.0, 18.4, 1.5, 1.0, 7.6],
    [tAir1, 4.8, 1.7, 16.0, 1.5, 0.8, 7.4],
    [tTer1 + 0.4, 4.8, 2.2, 16.2, 1.4, 0.6, 6.8],
    [6.9, 4.6, 3.6, 16.8, 1.0, 0.4, 5.0],
    [8.2, -18, 14, 22, -26, 2.2, -2],
    [tSaba + 0.3, -26.0, 4.6, 10, -30.2, 2.3, -2],
    [tOpen, -27.4, 3.6, 6.8, -30.5, 2.4, -1.6],
    [tJang, -27.7, 3.7, 6.3, -30.5, 2.5, -1.6],
    [K.s2e, -26.4, 4.8, 8.0, -30.2, 2.0, -1.4],
    [tPem, -22.6, 7.8, 8.2, -30.0, 1.0, -0.8],
    [tKuat, -25.0, 6.8, 7.6, -30.2, 0.9, -0.2],
    [tRaja, -26.0, 6.2, 7.6, -29.8, 0.9, -0.2],
    [tMer, -26.8, 5.4, 6.4, -29.6, 0.9, -0.2],
    [tPil, -26.6, 4.9, 6.6, -29.8, 1.2, 0.4],
    [tLalu + 0.1, -24, 4.4, 10, -26, 2.0, 2.5],
    [K.s4 + 0.35, -16.5, 3.4, 11.5, -14.2, 2.0, 4],
    [tTol + 0.6, -16.5, 3.4, 11.5, -14.2, 2.0, 4],
    [tTol + 1.5, -15.2, 3.4, 22.5, -11, 4.6, -2],
    [tAl4, -6.5, 3.0, 23, -10.5, 5.2, -4],
    [tBaik, -5.5, 3.4, 20, -9.5, 5.0, -8],
    [tTanya, 4.5, 5.5, 12, 0, 2.0, -9],
    [tSing4, 4.2, 3.2, 2.0, 0, 1.6, -12],
    [K.s4e, 3.8, 3.1, 1.2, 0, 1.6, -12],
    [tGa, 3.4, 3.1, 0.6, 0, 1.8, -12],
    [tF - 0.3, 3.1, 3.1, 0.2, 0, 1.9, -12],
    [tF + 0.45, 2.4, 3.3, -0.8, 0, 2.2, -12],
    [tHad + 0.4, 2.3, 3.3, -1.0, 0, 2.2, -12],
    [tUji, 4.2, 6.0, 1.0, 0, 2.6, -12],
    [K.s5e, 5.2, 5.0, 0.4, 0, 2.4, -12],
    [tUbah + 0.3, 5.0, 4.8, 0.0, 0, 2.3, -12],
    [tSang + 0.7, 3.6, 4.8, 6.5, 0, 1.8, -7],
    [tSer, -4.8, 6.1, 9.4, -0.2, 0.9, -10],
    [tSeak, -4.4, 6.0, 8.9, -0.2, 0.9, -10],
    [tTid, -4.0, 5.9, 8.4, -0.2, 0.9, -10],
    [K.s6e, -1.5, 4.8, 7.0, 0, 1.2, -6],
    [tIst, 3.4, 2.9, 11, 0.3, 1.1, -1],
    [tKol, 2.9, 2.0, 10.0, 0.3, 0.85, 1.0],
    [tTer7, 2.9, 2.0, 9.9, 0.3, 0.8, 1.0],
    [tKaca, 3.4, 4.0, 11.5, 0.3, 0.6, 0],
    [tSul7, 1.6, 7.4, 15, 0, 1.2, -3],
    [K.s7e, 0.2, 10.5, 20, 0, 1.2, -4],
    [tBen, -1.8, 15, 26, 0, 1.0, -4],
    [tKis, -3.6, 20, 33, 0, 1.5, -5],
    [K.dur, -4.2, 22, 36, 0, 1.8, -5],
  ]);

  const tv = new THREE.Vector3(), col = new THREE.Color();
  const qPos = (t) => {
    // returns [x, z, yaw, visible, moving]
    if (t < K.s2 - 0.2) { const u = sm((t - 0.1) / 2.4); return [mix(2.6, 1.5, u), mix(12.6, 8.6, u), Math.PI, 1, u > 0 && u < 1 ? 1 : 0]; }
    if (t < K.s4) return [CX, -3.3, 0, 1, 0];
    if (t < tSang - 0.5) return [0, 0, 0, 0, 0];
    if (t < tDim) { const u = sm((t - tSang + 0.5) / 2.4); return [mix(1.8, -0.9, u), mix(0.5, -5.4, u), Math.PI + 0.15 * (1 - u), 1, u > 0 && u < 1 ? 1 : 0]; }
    const u = sm((t - tDim) / 2.2);
    return [mix(-0.9, 0.3, u), mix(-5.4, 1.6, u), Math.PI * (1 - sm((t - tDim) / 0.7)), 1, u > 0 && u < 1 ? 1 : 0];
  };

  const tDep = tKir + 0.35, tArr = K.s4 + 0.3, tRet = tTol + 0.55, tGone = tRet + 2.6;
  const chestAt = (t) => {
    let x = CX, y = 1.04 + 0.5 * eout((t - tPil) / 0.8), z = 0;
    if (t > tDep) { const u = sm((t - tDep) / (tArr - tDep)); x = mix(CX, -15.0, u); y = mix(1.54, 1.6, u) + Math.sin(u * Math.PI) * 1.4; z = mix(0, 4, sm(u * 1.6)); }
    if (t > tArr) { const kb = Math.exp(-Math.max(0, t - tTol) * 4) * (t > tTol ? 1 : 0); x = -15.0 - 0.45 * kb * Math.abs(Math.sin((t - tTol) * 9)); y = 1.6 + 0.04 * Math.sin(t * 3); z = 4; }
    if (t > tRet) { const u = sm((t - tRet) / (tGone - tRet)); x = mix(-15.0, CX + 4, u); y = 1.6 + Math.sin(u * Math.PI) * 1.2; z = mix(4, 1.5, u); }
    return [x, y, z];
  };
  // smoothed chest position for the follow camera (average over a short window, still a pure function of t)
  const chestS = (t) => { let a = 0, b = 0, c = 0; for (let k = -4; k <= 4; k++) { const [x, y, z] = chestAt(t + k * 0.06); a += x; b += y; c += z; } return [a / 9, b / 9, c / 9]; };
  return (t) => {
    let [px, py, pz, tx, ty, tz] = camT(t);
    const fw = ramp(t, tPil + 0.3, tDep + 0.5) * (1 - ramp(t, tTol + 0.8, tTol + 1.8));
    if (fw > 0) {
      const [cx, cy, cz] = chestS(Math.min(t, tTol + 0.8));
      px = mix(px, cx + 0.5, fw); py = mix(py, cy + 1.6, fw); pz = mix(pz, cz + 9.5, fw);
      tx = mix(tx, cx + 0.2, fw); ty = mix(ty, cy + 0.5, fw); tz = mix(tz, cz, fw);
    }
    let sh = 0.05 * Math.exp(-Math.max(0, t - tF) * 5) * (t > tF ? 1 : 0);
    cam.position.set(px + sh * Math.sin(t * 61), py + sh * Math.sin(t * 47 + 1), pz);
    cam.lookAt(tx, ty, tz);

    // sky warms slowly toward the end; stars come out
    const warm = ramp(t, tSul7, K.dur);
    skyU.uWarm.value = warm;
    for (let i = 0; i < NS; i++) { const b = SD[i][0] * (0.45 + 0.3 * warm) * (0.7 + 0.3 * Math.sin(t * 2 + SD[i][1])); stars.col[i * 3] = b; stars.col[i * 3 + 1] = b * 0.95; stars.col[i * 3 + 2] = b * 1.05; }
    stars.commit();
    sun.intensity = 1.7 + 0.5 * warm;
    hemi.intensity = 0.75 - 0.15 * warm;

    // water + floor
    wU.uT.value = t; fU.uT.value = t; wU.uCam.value.copy(cam.position); fU.uCam.value.copy(cam.position);
    const seam = ramp(t, tTer1, tTer1 + 0.8) * (1 - ramp(t, K.s2 - 0.2, K.s2 + 0.6)) + ramp(t, tTer7, tTer7 + 1.3);
    fU.uSeam.value = seam; fU.uRipK.value = 1 - seam;
    if (t < K.s3) { fU.uSw.value.set(1.5, 8.4, Math.max(0, t - tTer1) * 7); fU.uSwA.value = ramp(t, tTer1, tTer1 + 0.2) * (1 - ramp(t, tTer1 + 0.6, tTer1 + 2.4)); }
    else { fU.uSw.value.set(0.3, 1.6, Math.max(0, t - tTer7) * 7); fU.uSwA.value = ramp(t, tTer7, tTer7 + 0.2) * (1 - ramp(t, tTer7 + 0.8, tTer7 + 3.0)); }
    wU.uGlow.value = 1 + 0.25 * (1 - seam) * (ramp(t, tKol - 0.5, tKol) * (1 - ramp(t, tTer7, tTer7 + 1)));
    poolL.intensity = 26 + 14 * warm;

    // queen + reflection
    const [qx, qz, qyaw, qv, mv] = qPos(t);
    const bob = mv * 0.025 * Math.abs(Math.sin(t * 6.5));
    queen.visible = qv > 0; queen.position.set(qx, bob, qz); queen.rotation.set(0, qyaw, mv * 0.03 * Math.sin(t * 6.5));
    const onGlass = qv > 0 && qx > -11 && qz > -8;
    qRef.visible = onGlass; qRef.position.set(qx, -bob, qz); qRef.rotation.set(0, qyaw, -mv * 0.03 * Math.sin(t * 6.5));
    reflM.opacity = 0.26 + 0.12 * seam;

    // floating panels drift
    for (const [m, p0, s, ph] of PAN) { m.position.set(p0.x + 0.3 * Math.sin(t * 0.21 + ph), p0.y + 0.35 * Math.sin(t * 0.33 + ph), p0.z); m.rotation.y = -s + 0.08 * Math.sin(t * 0.17 + ph); }

    // pillar cores: riches lighting up front to back on "apa yang Allah berikan kepadaku lebih baik", warm at the end
    for (const [m, i] of cores) {
      const p = ramp(t, tAl4 - 0.4 + i * 0.22, tAl4 + i * 0.22 + 0.3) * (1 - 0.55 * ramp(t, K.s5, K.s5 + 2));
      const b = 0.35 + 2.1 * p + 0.9 * ramp(t, tSul7 - 1, tAl7 + 1);
      m.color.setRGB(b * 1.0, b * 0.78, b * 0.42);
    }

    // letter: descends, seal breaks on "dengan nama Allah", light lines written right to left, then lies on the table
    letter.visible = t > tSaba - 0.6 && t < K.s4 + 0.5;
    if (letter.visible) {
      const d = eout((t - tSaba + 0.6) / 2.2), lay = sm((t - K.s3 - 0.2) / 1.6);
      const sway = (1 - d) * 0.3 * Math.sin(t * 2.2);
      letter.position.set(mix(mix(-28.6, -30.9, d) + sway, CX - 1.45, lay), mix(mix(8.6, 2.55, d) + 0.05 * Math.sin(t * 1.3), 1.08, lay), mix(mix(-2.6, -1.3, d), -1.15, lay));
      letter.rotation.set(mix(0, -Math.PI / 2, lay), mix(0.28 + (1 - d) * 0.6, 0, lay), mix(sway * 0.4, 0.5, lay));
      const o = eout((t - tOpen) / 0.7);
      sealL.position.set(-0.3 * o, -0.15 - 0.2 * o, 0.05); sealL.rotation.z = 0.6 * o; sealR.position.set(0.3 * o, -0.15 - 0.2 * o, 0.05); sealR.rotation.z = -0.6 * o;
      sealM.opacity = 1; sealL.visible = sealR.visible = o < 0.98;
      LINES.forEach(([m, w], i) => { m.scale.x = Math.max(0.001, w * eout((t - tOpen - 0.35 - i * 0.32) / 0.55)); });
      lineM.opacity = 1 - 0.55 * lay;
    }
    const sf = ramp(t, tOpen - 0.1, tOpen + 0.05) * (1 - ramp(t, tOpen + 0.1, tOpen + 1.2));
    sealFlash.visible = sf > 0.001; sealFlashM.opacity = sf;
    if (sealFlash.visible) { letter.localToWorld(tv.set(0, -0.15, 0.1)); sealFlash.position.copy(tv); sealFlash.lookAt(cam.position); sealFlash.scale.setScalar(0.6 + 2.6 * sf); }

    // soldiers rise on "kuat", march into the city on "memasuki", all sink on "Maka"
    const sink = 1 - ramp(t, tMaka - 0.1, tMaka + 0.6);
    const march = eout((t - tMasuk) / 1.6);
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), p4 = new THREE.Vector3();
    for (let i = 0; i < NSOL; i++) {
      const [x, z, ph] = SOL[i];
      const up = back((t - tKuat + 0.2 - ph * 0.5) / 0.4) * sink;
      p4.set(x + march * (1.95 + 0.1 * ph), 1.04, z * (1 - 0.25 * march) + 0.02 * Math.sin(t * 9 + ph * 6) * march * (1 - march));
      s4.set(Math.max(0.001, up), Math.max(0.001, up), Math.max(0.001, up));
      m4.compose(p4.setY(1.04 + 0.1 * up), q4, s4); sol.setMatrixAt(i, m4);
    }
    sol.instanceMatrix.needsUpdate = true;
    solM.emissiveIntensity = 0.9 + 0.8 * ramp(t, tKuat, tKuat + 0.5) * (1 - ramp(t, tKuat + 1.5, tKuat + 3));
    const crack = ramp(t, tMer, tMer + 0.7);
    for (const [m, ax, az, ph] of CITY) {
      const g = back((t - tRaja - ph * 0.6) / 0.45) * sink;
      m.scale.set(Math.max(0.001, g), Math.max(0.001, g * (1 - 0.55 * crack)), Math.max(0.001, g));
      m.rotation.set(ax * 1.2 * crack, 0, az * 1.2 * crack);
    }
    col.set(0x8fe0e0).lerp(C(0x3a2f4a), crack); cityM.color.copy(col); cityM.emissiveIntensity = 0.6 * (1 - crack) + 0.05;
    const dAl = ramp(t, tMer, tMer + 0.2) * (1 - ramp(t, tMer + 0.8, tMer + 2.2));
    for (let i = 0; i < 40; i++) {
      const [a, sp, ph] = DC[i], e = eout((t - tMer) / 1.2);
      DUSTC.pos.set([CX + 1.0 + Math.cos(a) * sp * e * 0.8, 1.15 + e * (0.5 + ph * 0.4) - e * e * 0.4, -0.1 + Math.sin(a) * sp * e * 0.8], i * 3);
      DUSTC.col.set([0.7 * dAl, 1.0 * dAl, 1.0 * dAl], i * 3);
    }
    DUSTC.commit();

    // gift chest: rises on "memilih", departs, refused at the glass gate, returns
    chest.visible = t > tPil - 0.2 && t < tGone;
    if (chest.visible) {
      const rise = back((t - tPil) / 0.6);
      const [x, y, z] = chestAt(t);
      chest.position.set(x, y, z); chest.rotation.y = 0.3 * Math.sin(t * 0.8);
      chest.scale.setScalar(Math.max(0.001, 1.35 * rise * (1 - ramp(t, tGone - 0.8, tGone))));
      chGlowM.opacity = 0.95 * (1 - 0.75 * ramp(t, tTol, tTol + 0.6));
    }
    const gp = ramp(t, tTol - 0.1, tTol + 0.15) * (1 - ramp(t, tTol + 0.5, tTol + 2.0));
    gateM.emissiveIntensity = 0.3 * gp; gateL.intensity = 8 * gp;
    gRingM.opacity = 0.4 * gp * (1 - ramp(t, tTol + 0.3, tTol + 0.9)); gRing.scale.setScalar(0.8 + 1.2 * eout((t - tTol) / 0.9));

    // thrones: A vanishes at the blink, B arrives in a flash; ring marks the empty dais while the question hangs
    thrA.G.visible = t < tF;
    const arr = clamp01((t - tF) / 0.55);
    thrB.G.visible = t > tF;
    thrB.G.scale.setScalar(Math.max(0.001, 0.95 * back(arr, 1.2)));
    ringM.opacity = 0.9 * ramp(t, tSing4 - 0.3, tSing4 + 0.6) * (1 - ramp(t, tF, tF + 0.6)) * (0.75 + 0.25 * Math.sin(t * 5));
    dRing.scale.setScalar(1 + 0.08 * Math.sin(t * 2.5));
    const fl = t > tF ? Math.exp(-(t - tF) * 3.2) : ramp(t, tF - 0.5, tF) * 0.35;
    flashM.opacity = Math.min(1, fl); flash.visible = fl > 0.003; flash.lookAt(cam.position); flash.scale.setScalar(2.5 + 11 * fl);
    flashL.intensity = 160 * fl;
    thrL.intensity = 6 * ramp(t, tF, tF + 0.8) * (1 - 0.5 * ramp(t, K.s6, K.s6 + 2)) + 3 * ramp(t, tSul5, tSul5 + 1) * (1 - ramp(t, K.s6, K.s6 + 2));
    // the change ("diubah"): ruby to teal-ice, sun disc to an ice star
    const ch = sm((t - tUbah + 0.1) / 1.3);
    thrB.cush.color.lerpColors(RUBY, TEALC, ch); thrB.ins.color.lerpColors(INSR, INSI, ch);
    thrB.gem.color.lerpColors(GEMR, GEMI, ch); thrB.gem.emissive.lerpColors(EMR, EMI, ch); 
    thrB.disc.scale.setScalar(Math.max(0.001, 1 - ch)); thrB.star.scale.setScalar(Math.max(0.001, ch)); thrB.star.rotation.z = ch * Math.PI * 0.5;
    // the ghost of the original throne: offset at "seakan-akan", settles into the changed one on "itulah dia"
    const go = ramp(t, tSeak - 0.3, tSeak + 0.2) * (1 - ramp(t, tTid - 0.2, tTid + 0.8));
    ghost.G.visible = go > 0.003; ghostM.opacity = 0.1 * go;
    ghost.G.position.set(TB.x + 1.1 * (1 - sm((t - tItu + 0.3) / 1.2)), TB.y, TB.z + 0.05); ghost.G.scale.setScalar(0.95);

    // gathering light before the blink, burst after it
    for (let i = 0; i < NG; i++) {
      const [dx, dy, dz, r0, ph] = GD[i];
      let rr, a;
      if (t < tF) { const u = sm((t - tGa) / (tF - tGa)); rr = r0 * (1 - 0.94 * u); a = ramp(t, tGa - 0.2, tGa + 0.6) * (0.4 + 0.6 * u); }
      else { rr = 0.2 + 7.5 * eout((t - tF) / 1.3) * (0.5 + ph); a = 1 - ramp(t, tF, tF + 1.4); }
      const sw = (t - tGa) * 0.9 * (1 + ph);
      const cx = dx * Math.cos(sw) - dz * Math.sin(sw), cz = dx * Math.sin(sw) + dz * Math.cos(sw);
      gath.pos.set([TB.x + cx * rr, TB.y + 1.8 + dy * rr * 0.7, TB.z + 0.4 + cz * rr], i * 3);
      gath.col.set([a, a * 0.92, a * 0.75], i * 3);
    }
    gath.commit();
    // gratitude motes rise around the throne ("ini karunia Tuhanku")
    const ma = ramp(t, tSul5 - 0.3, tSul5 + 1.0) * (1 - ramp(t, K.s6 + 0.3, K.s6 + 1.6));
    for (let i = 0; i < NM; i++) {
      const [a, rr, ph] = MD[i], yy = (t * 0.32 + ph * 5) % 5;
      motes.pos.set([TB.x + Math.cos(a + t * 0.1) * rr, TB.y + yy, TB.z + 0.5 + Math.sin(a + t * 0.1) * rr], i * 3);
      const b = ma * Math.sin(Math.PI * yy / 5) * 0.9;
      motes.col.set([b, b * 0.82, b * 0.45], i * 3);
    }
    motes.commit();
    // hall motes (glass dust), brighter and golden in the surrender and the sign-off
    const hb = 0.25 + 0.6 * ramp(t, tAl7 - 1.5, tAl7 + 1.5);
    for (let i = 0; i < NH; i++) {
      const [x, y0, z, ph] = HD[i], yy = (y0 + t * 0.15 * (0.5 + ph)) % 9;
      hall.pos.set([x + 0.4 * Math.sin(t * 0.2 + ph * 6), yy, z], i * 3);
      const b = hb * Math.sin(Math.PI * yy / 9);
      hall.col.set([b * mix(0.85, 1, warm), b * mix(0.95, 0.85, warm), b * mix(1, 0.6, warm)], i * 3);
    }
    hall.commit();
    lampA.intensity = 16 + 1.5 * Math.sin(t * 7.3) + 1.2 * Math.sin(t * 11.1);

    comp.render();
  };
}
