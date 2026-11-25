// EP03 DAMPAK POLITIK EKONOMI (DATAPHYSICAL): one giant brass balance scale on a round walnut plinth in a dark museum hall
// with a warm amber back wall. Left pan PASAR holds the data sculptures (IHSG aluminium column, orange rupiah column under
// a brass press, a stack of gold bars); right pan RAKYAT gets three brass voice plaques. Four silent aluminium party blocks
// stand under the beam. The beam tilts with the data; the camera orbits from pan to pan.
// Illustration only: no logos, no faces. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, envStrips } from "./lib3d.js";

const P = { night: 0x141416, amber: "#3A2A18", walnut: "#2A1B14", brass: "#D2B07A", alu: "#C8CCD1", teal: "#9FD3D6",
  orange: "#D4521C", gold: "#E6C35C", hud: "#ECEFF4", kick: "#F5B44E" };
const SANS = "'Segoe UI','Arial',sans-serif", HEAVY = "'Arial Black','Segoe UI Black','Arial',sans-serif", MONO = "'Consolas','Courier New',monospace";

const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// APPLE_STUDIO_CLEAN in display space: neutral S-curve 0.15, vignette 0.06, grain 0.004, no aberration, soft highlight knee.
const Grade = { uniforms: { tDiffuse: { value: null }, uT: { value: 0 } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uT;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 knee(vec3 x){vec3 k=vec3(.88);vec3 o=x-k;return mix(x,k+.075*(1.0-exp(-o/.075)),step(k,x));}
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
   vec3 s=c*c*(3.0-2.0*c);c=mix(c,s,.15);
   float d=distance(vUv,vec2(.5,.48));c*=1.0-.06*smoothstep(.25,.8,d);
   c+=(h(vUv*vec2(1080.,1920.)+floor(uT*30.0))-.5)*.004;
   c=max(c,vec3(.022,.021,.024));
   gl_FragColor=vec4(knee(c),1.0);}` };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: P.night, fog: 0.012, exp: 1, bloom: [0.1, 0.35, 0.95], fov: 30 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gr = new ShaderPass(Grade); comp.addPass(gr);
  envStrips(r, scene, [[8, 3, 0xffe2b8, 1.6, -5, 7, 6], [4, 8, 0xffb060, 0.9, 0, 4, -9], [3, 7, 0xcfe0ff, 0.9, 8, 4, -3], [10, 1.5, 0xffffff, 0.6, 0, 10, 2]], 0x141416);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const R0 = mulberry(303);

  // ---------- lights: warm theatre key from above, cool rim, amber wall wash, soft fill ----------
  scene.add(new THREE.HemisphereLight(0xffe8cc, 0x22304c, 0.5));
  const key = new THREE.SpotLight(0xfff0dc, 3.2, 0, 0.42, 0.65, 0); key.position.set(3, 22, 11); key.target.position.set(0, 3.2, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0015; key.shadow.normalBias = 0.06; key.shadow.camera.near = 8; key.shadow.camera.far = 60;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x8fb8ff, 2.1); rim.position.set(-8, 12, -14); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xffc890, 0.9); rim2.position.set(10, 6, -10); scene.add(rim2);
  const fill = new THREE.DirectionalLight(0xfff0e0, 0.4); fill.position.set(-6, 5, 14); scene.add(fill);
  const cool = new THREE.DirectionalLight(0x5f8cff, 0.9); cool.position.set(-16, 7, 2); scene.add(cool);
  const tealL = new THREE.PointLight(0x7fe0e6, 0, 6, 1.5); scene.add(tealL);
  const orgL = new THREE.PointLight(0xff7a3a, 0, 5, 1.5); scene.add(orgL);

  // ---------- textures + materials ----------
  const brushed = canvasTex(256, 256, (g, w, h) => { const R = mulberry(5); g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R() > .5 ? "255,255,255" : "120,120,120"},${0.05 + R() * 0.08})`; g.fillRect(0, R() * h, w, 0.6 + R()); } }, [2, 2]);
  const woodT = canvasTex(1024, 256, (g, w, h) => { const R = mulberry(9); g.fillStyle = "#6b4a36"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${R() > .5 ? "40,22,14" : "140,100,70"},${0.12 + R() * 0.2})`; g.lineWidth = 0.8 + R() * 2.4; g.beginPath(); const y = R() * h; g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.012 + i) * 5 + Math.sin(x * 0.05 + i * 2) * 1.5); g.stroke(); } }, [3, 1]);
  const brass = (rough = 0.24, extra = {}) => new THREE.MeshPhysicalMaterial({ color: P.brass, metalness: 0.85, roughness: rough, clearcoat: 0.35, clearcoatRoughness: 0.2, map: brushed, ...extra });
  const brassM = brass();
  const aluM = new THREE.MeshPhysicalMaterial({ color: P.alu, metalness: 0.18, roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.15, map: brushed });
  const walnutM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: woodT, metalness: 0.1, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x24201d, roughness: 0.5, metalness: 0.3 });

  const sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const add = (geo, mat, x = 0, y = 0, z = 0, par = scene) => { const m = sh(new THREE.Mesh(geo, mat)); m.position.set(x, y, z); par.add(m); return m; };
  // rounded block, bottom at y=0
  function rbox(w, h, d, rr = 0.04) {
    const s = new THREE.Shape(), x = -w / 2 + rr, y = -h / 2 + rr, W = w - 2 * rr, H = h - 2 * rr, c = Math.min(W, H) * 0.08;
    s.moveTo(x + c, y); s.lineTo(x + W - c, y); s.quadraticCurveTo(x + W, y, x + W, y + c); s.lineTo(x + W, y + H - c); s.quadraticCurveTo(x + W, y + H, x + W - c, y + H);
    s.lineTo(x + c, y + H); s.quadraticCurveTo(x, y + H, x, y + H - c); s.lineTo(x, y + c); s.quadraticCurveTo(x, y, x + c, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * rr), bevelEnabled: true, bevelSize: rr, bevelThickness: rr, bevelSegments: 3, curveSegments: 4 });
    g.translate(0, h / 2, -(d - 2 * rr) / 2); g.computeVertexNormals(); return g;
  }
  // engraved text on a transparent plane (dark letters + a light lower lip)
  function engrave(lines, w, h, o = {}) {
    const W = 1024, H = Math.round(1024 * h / w);
    const tx = canvasTex(W, H, (g) => {
      g.clearRect(0, 0, W, H); if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, W, H); }
      if (o.border) { g.strokeStyle = o.border; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 28); }
      g.textAlign = "center"; g.textBaseline = "middle";
      lines.forEach(([txt, size, font, col, yy]) => {
        let s = size * H; g.font = `${font} ${s}px ${font === "900" ? HEAVY : SANS}`;
        while (g.measureText(txt).width > W * 0.88 && s > 8) { s *= 0.94; g.font = `${font} ${s}px ${font === "900" ? HEAVY : SANS}`; }
        g.fillStyle = "rgba(255,240,210,.35)"; g.fillText(txt, W / 2, yy * H + 3);
        g.fillStyle = col; g.fillText(txt, W / 2, yy * H);
      });
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.5, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -2 }));
  }

  // ---------- hall: polished floor with a live reflection, amber back wall, BG row of data columns ----------
  const floorT = canvasTex(1024, 1024, (g, w, h) => { const R = mulberry(17); g.fillStyle = "#353a44"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${R() > .5 ? "255,240,220" : "0,0,0"},${0.02 + R() * 0.04})`; g.fillRect(R() * w, R() * h, 2, 2); }
    g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, [10, 10]);
  const floorM = new THREE.MeshStandardMaterial({ color: 0x4c6468, map: floorT, roughness: 0.34, metalness: 0.15 });
  const mirrorRT = new THREE.WebGLRenderTarget(540, 960, { type: THREE.HalfFloatType });
  const texM = new THREE.Matrix4();
  floorM.onBeforeCompile = (s) => {
    s.uniforms.tRefl = { value: mirrorRT.texture }; s.uniforms.uTM = { value: texM };
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nuniform mat4 uTM;varying vec4 vRc;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvRc=uTM*modelMatrix*vec4(position,1.0);");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D tRefl;varying vec4 vRc;")
      .replace("#include <opaque_fragment>", `{vec2 ru=vRc.xy/max(vRc.w,1e-4);vec3 rc=vec3(0.0);
        for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++)rc+=texture2D(tRefl,clamp(ru+vec2(float(i)*.0022,float(j)*.0016),0.001,0.999)).rgb;
        rc=clamp(rc/25.0,0.0,4.0);if(!(rc.r==rc.r))rc=vec3(0.0);outgoingLight+=rc*.34;}
        #include <opaque_fragment>`);
  };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), floorM); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const mcam = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 900);
  const bias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);

  const wallT = canvasTex(1024, 512, (g, w, h) => {
    // dusk hall: cool blue-violet high up, a rose band, the warm amber pool low behind the scale, teal washes at the sides
    const vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, "#1c2c50"); vg.addColorStop(0.22, "#2e2858"); vg.addColorStop(0.4, "#4a2650"); vg.addColorStop(0.56, "#52283a"); vg.addColorStop(0.74, "#3e2a3a"); vg.addColorStop(1, "#2e2a30");
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
    for (const [cx, col] of [[0.24, "rgba(40,130,130,.8)"], [0.76, "rgba(40,118,146,.75)"]]) { const sg = g.createRadialGradient(w * cx, h * 0.55, 4, w * cx, h * 0.55, w * 0.16); sg.addColorStop(0, col); sg.addColorStop(1, "rgba(40,120,124,0)"); g.fillStyle = sg; g.fillRect(0, 0, w, h); }
    const gg = g.createRadialGradient(w * 0.5, h * 0.7, 10, w * 0.5, h * 0.7, w * 0.24); gg.addColorStop(0, "rgba(201,138,70,1)"); gg.addColorStop(0.4, "rgba(122,79,40,.85)"); gg.addColorStop(1, "rgba(58,42,24,0)");
    g.fillStyle = gg; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(x, 0, 3, h); g.fillStyle = "rgba(255,220,170,.04)"; g.fillRect(x + 4, 0, 2, h); }
    g.fillStyle = "rgba(10,8,6,.55)"; g.fillRect(0, h * 0.86, w, h * 0.14);
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(90, 45), new THREE.MeshStandardMaterial({ color: 0x2a221c, emissive: 0xffffff, emissiveMap: wallT, emissiveIntensity: 0.52, roughness: 0.9, map: wallT }));
  wall.position.set(0, 16, -24); scene.add(wall);
  // BG: a museum row of other data sculptures (aluminium columns, brass caps) between plinth and wall
  const tealBg = new THREE.MeshPhysicalMaterial({ color: 0x48aaa4, metalness: 0.2, roughness: 0.35, map: brushed });
  const ledM = new THREE.MeshBasicMaterial({ color: 0x3fc8b4 });
  const bgM = new THREE.MeshPhysicalMaterial({ color: 0x8c9ab0, metalness: 0.2, roughness: 0.35, map: brushed });
  for (let i = 0; i < 17; i++) {
    const x = -20 + i * 2.5 + (R0() - 0.5) * 0.6, hh = 1.8 + R0() * 5.5, z = -13 - R0() * 2.5;
    add(rbox(1.1, hh, 1.1, 0.06), i % 4 === 1 ? tealBg : i % 5 === 2 ? new THREE.MeshPhysicalMaterial({ color: 0x8a4a2a, metalness: 0.25, roughness: 0.4 }) : bgM, x, 0.5, z);
    add(new THREE.BoxGeometry(1.2, 0.08, 1.2), brassM, x, 0.5 + hh + 0.04, z);
    add(new THREE.BoxGeometry(1.6, 0.5, 1.6), walnutM, x, 0.25, z);
    const led = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.05, 1.14), ledM); led.position.set(x, 0.5 + hh - 0.06, z); scene.add(led);
  }

  // ---------- walnut plinth with brass trim + engraved AUDIRA band ----------
  const PR = 4.4, PT = 0.9;
  const plinth = add(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(PR + 0.15, 0), new THREE.Vector2(PR + 0.15, 0.12), new THREE.Vector2(PR, 0.18), new THREE.Vector2(PR, PT - 0.08), new THREE.Vector2(PR - 0.06, PT), new THREE.Vector2(0, PT)], 96), walnutM);
  add(new THREE.TorusGeometry(PR - 0.02, 0.035, 8, 128), brassM, 0, PT - 0.1, 0).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(PR + 0.02, 0.03, 8, 128), brassM, 0, 0.2, 0).rotation.x = Math.PI / 2;
  const bandT = canvasTex(4096, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 150px ${HEAVY}`;
    g.fillStyle = "rgba(255,225,170,.25)"; g.fillText("A U D I R A", w / 2, h / 2 + 4); g.fillStyle = "#c9a56a"; g.fillText("A U D I R A", w / 2, h / 2);
    g.font = `700 64px ${SANS}`; g.fillStyle = "#b8955c"; g.fillText("TIMBANGAN DATA  ·  EP 03", w * 0.5 + 1100, h / 2); g.fillText("PASAR  ·  RAKYAT", w * 0.5 - 1050, h / 2); });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(PR + 0.012, PR + 0.012, 0.5, 128, 1, true, -Math.PI, Math.PI * 2), new THREE.MeshStandardMaterial({ map: bandT, transparent: true, metalness: 0.6, roughness: 0.3 }));
  band.position.y = 0.5; scene.add(band);

  // ---------- the scale: pillar, pivot, beam with needle, dial ----------
  const PY = 7.1, L = 2.7, HANG = 3.26;
  const pil = [[0, PT], [0.98, PT], [0.98, PT + 0.14], [0.78, PT + 0.24], [0.52, PT + 0.42], [0.34, PT + 0.7], [0.25, PT + 1.1], [0.22, 6.15], [0.3, 6.28], [0.3, 6.42], [0.2, 6.52], [0.17, 6.95], [0, 7.0]].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(pil, 64), brassM);
  for (const y of [2.1, 3.6, 5.1]) add(new THREE.TorusGeometry(0.25, 0.045, 10, 40), brassM, 0, y, 0).rotation.x = Math.PI / 2;
  const yoke = add(new THREE.BoxGeometry(0.22, 0.5, 0.55), brassM, 0, 7.05, 0);
  // dial sector behind the needle
  const dialT = canvasTex(1024, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const cx = w / 2, cy = h * 0.98;
    g.strokeStyle = "#e0c48e"; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, h * 0.86, Math.PI * 1.3, Math.PI * 1.7); g.stroke();
    for (let i = -10; i <= 10; i++) { const a = -Math.PI / 2 + i * 0.0314 * 2; const r1 = h * 0.86, r2 = r1 - (i % 5 === 0 ? 70 : 34); g.lineWidth = i === 0 ? 12 : 5; g.strokeStyle = i === 0 ? "#f0d6a0" : "#c9a56a";
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); g.stroke(); }
    g.font = `700 40px ${SANS}`; g.fillStyle = "#e0c48e"; g.textAlign = "center"; g.fillText("SEIMBANG", cx, h * 0.3); });
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshStandardMaterial({ map: dialT, transparent: true, metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }));
  dial.position.set(0, PY + 0.62, -0.2); scene.add(dial);
  const dialBack = add(new THREE.CircleGeometry(1.25, 48, Math.PI * 0.28, Math.PI * 0.44), darkM, 0, PY, -0.24);
  const beam = new THREE.Group(); beam.position.set(0, PY, 0); scene.add(beam);
  { const s = new THREE.Shape(); s.moveTo(-L, -0.07); s.quadraticCurveTo(-0.6, -0.12, 0, -0.2); s.quadraticCurveTo(0.6, -0.12, L, -0.07); s.lineTo(L, 0.07); s.quadraticCurveTo(0.6, 0.12, 0, 0.2); s.quadraticCurveTo(-0.6, 0.12, -L, 0.07); s.lineTo(-L, -0.07);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 3, curveSegments: 16 }); g.translate(0, 0, -0.07); add(g, brassM, 0, 0, 0, beam); }
  for (const sx of [-1, 1]) { add(new THREE.SphereGeometry(0.13, 20, 14), brassM, sx * L, 0, 0, beam); add(new THREE.TorusGeometry(0.09, 0.025, 8, 24), brassM, sx * L, -0.17, 0, beam); }
  add(new THREE.CylinderGeometry(0.09, 0.09, 0.62, 24), brassM, 0, 0, 0, beam).rotation.x = Math.PI / 2;
  const needle = add(new THREE.ConeGeometry(0.05, 1.25, 12), brass(0.2), 0, 0.68, -0.1, beam);
  add(new THREE.SphereGeometry(0.16, 20, 14), brassM, 0, 7.82, 0);

  // ---------- pans: hook, spreader ring, four chains, bowl, front tag ----------
  const linkG = new THREE.TorusGeometry(0.05, 0.014, 6, 12);
  function pan(name) {
    const G = new THREE.Group(); scene.add(G);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), brassM, 0, -0.35, 0, G);
    add(new THREE.TorusGeometry(1.2, 0.035, 8, 64), brassM, 0, -0.62, 0, G).rotation.x = Math.PI / 2;
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; const rod = add(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), brassM, Math.cos(a) * 0.6, -0.61, Math.sin(a) * 0.6, G); rod.rotation.z = Math.PI / 2; rod.rotation.y = -a; }
    const per = 30, inst = new THREE.InstancedMesh(linkG, brassM, per * 4); inst.castShadow = false; inst.frustumCulled = false;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2;
      for (let i = 0; i < per; i++) { const f = (i + 0.5) / per; const rr = 1.2 + 0.06 * f; V.set(Math.cos(a) * rr, -0.66 - f * 2.42, Math.sin(a) * rr);
        E.set(0, -a + (i % 2 ? Math.PI / 2 : 0), Math.PI / 2); Q.setFromEuler(E); M.compose(V, Q, S); inst.setMatrixAt(k * per + i, M); } }
    G.add(inst);
    const bowl = [[0, -3.37], [0.92, -3.37], [1.18, -3.22], [1.33, -3.07], [1.31, -3.03], [1.24, -3.09], [0.95, -3.25], [0, -3.25]].map(([x, y]) => new THREE.Vector2(x, y));
    add(new THREE.LatheGeometry(bowl, 64), brassM, 0, 0, 0, G);
    add(new THREE.TorusGeometry(1.32, 0.03, 8, 64), brass(0.18), 0, -3.05, 0, G).rotation.x = Math.PI / 2;
    const tag = engrave([[name, 0.62, "900", "#2a1d12", 0.54]], 1.0, 0.3, { bg: "#cfae76", border: "#8a6a3c" });
    tag.position.set(0, -3.24, 1.27); tag.rotation.x = -0.35; G.add(tag);
    return G;
  }
  const panL = pan("PASAR"), panR = pan("RAKYAT");
  const FY = -3.25; // pan floor in pan-local y

  // ---------- PASAR contents ----------
  const ihsgM = aluM.clone(); ihsgM.emissive = new THREE.Color(0x3a3c40); ihsgM.emissiveIntensity = 0.6;
  const ihsg = add(rbox(0.52, 1, 0.52, 0.035), ihsgM, -0.48, FY, -0.28, panL);
  const ihsgCap = add(new THREE.BoxGeometry(0.58, 0.06, 0.58), brassM, -0.48, 0, -0.28, panL);
  const ihsgTag = engrave([["IHSG", 0.7, "900", "#1f2226", 0.5]], 0.46, 0.17); ihsgTag.position.set(-0.48, 0, -0.01); panL.add(ihsgTag);
  const arrowS = new THREE.Shape(); arrowS.moveTo(-0.07, 0); arrowS.lineTo(0.07, 0); arrowS.lineTo(0.07, 0.3); arrowS.lineTo(0.17, 0.3); arrowS.lineTo(0, 0.52); arrowS.lineTo(-0.17, 0.3); arrowS.lineTo(-0.07, 0.3); arrowS.lineTo(-0.07, 0);
  const arrowG = new THREE.ExtrudeGeometry(arrowS, { depth: 0.08, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }); arrowG.translate(0, 0, -0.04);
  const arrow = add(arrowG, new THREE.MeshStandardMaterial({ color: P.teal, emissive: 0x2f8f96, emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.2 }), -0.48, 0, -0.28, panL);
  const rupM = new THREE.MeshPhysicalMaterial({ color: P.orange, metalness: 0.25, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const rup = add(rbox(0.52, 1, 0.52, 0.035), rupM, 0.48, FY, -0.28, panL);
  const rupTag = engrave([["RUPIAH", 0.6, "900", "#2b1208", 0.5]], 0.46, 0.15); rupTag.position.set(0.48, 0, -0.01); panL.add(rupTag);
  // press: post behind the column, arm over it, screw down to a brass plate
  add(rbox(0.12, 2.35, 0.12, 0.02), brassM, 0.48, FY, -0.7, panL);
  add(rbox(0.14, 0.12, 0.62, 0.02), brassM, 0.48, FY + 2.3, -0.45, panL);
  const screw = add(new THREE.CylinderGeometry(0.035, 0.035, 1, 12), brass(0.3), 0.48, 0, -0.28, panL);
  const plate = add(rbox(0.66, 0.07, 0.66, 0.02), brassM, 0.48, 0, -0.28, panL);
  const hand = add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), brassM, 0.48, FY + 2.48, -0.28, panL); hand.rotation.z = Math.PI / 2;
  // gold bars: trapezoid section, long axis x; 2 columns x 3 layers (6,4,2)
  const tz = new THREE.Shape(); tz.moveTo(-0.11, 0); tz.lineTo(0.11, 0); tz.lineTo(0.08, 0.12); tz.lineTo(-0.08, 0.12); tz.lineTo(-0.11, 0);
  const barG = new THREE.ExtrudeGeometry(tz, { depth: 0.42, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }); barG.translate(0, 0, -0.21); barG.rotateY(Math.PI / 2);
  const goldM = new THREE.MeshPhysicalMaterial({ color: P.gold, metalness: 0.9, roughness: 0.2, clearcoat: 0.3, map: brushed, emissive: 0x3a2a08, emissiveIntensity: 0.5 });
  const bars = [];
  const layers = [[-0.24, 0, 0.24], [-0.12, 0.12], [0]];
  layers.forEach((zs, ly) => zs.forEach((z) => [-0.24, 0.24].forEach((x) => bars.push(add(barG, goldM, x, FY + ly * 0.125, 0.42 + z, panL)))));
  const dropBar = bars[bars.length - 1]; panL.remove(dropBar); scene.add(dropBar);
  const dropM = goldM.clone(); dropBar.material = dropM; dropBar.scale.setScalar(1.25);
  // net-buy bubble (teal acrylic) + MSCI sleeve
  const acrylM = new THREE.MeshPhysicalMaterial({ color: P.teal, metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 });
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 20), acrylM); panL.add(bubble);
  const bubTx = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(20,20,22,.78)"; g.fillRect(8, 40, w - 16, h - 80); g.strokeStyle = P.teal; g.lineWidth = 6; g.strokeRect(8, 40, w - 16, h - 80);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = P.teal; g.font = `700 92px ${MONO}`; g.fillText("Rp 443,5 M", w / 2, h / 2 + 4); });
  const bubLab = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: bubTx, transparent: true, depthTest: false, toneMapped: false })); bubLab.renderOrder = 5; scene.add(bubLab);
  const sleeve = new THREE.Mesh(rbox(0.74, 2.3, 0.74, 0.04), acrylM.clone()); panL.add(sleeve);
  const msciTag = engrave([["MSCI", 0.6, "900", "#bff2f4", 0.42], ["REBALANCING", 0.2, "700", "#bff2f4", 0.84]], 0.62, 0.36); msciTag.material.emissive = new THREE.Color(0x3fb3ba); msciTag.material.emissiveIntensity = 0.5; panL.add(msciTag);

  // ---------- RAKYAT contents: three brass voice plaques ----------
  const voices = [["PAPUA", "paham daerah"], ["KOMPAS", "lebih dari kompromi"], ["ISEAI", "transisi tertib"]].map(([a, b], i) => {
    const G = new THREE.Group(); G.position.set(-0.62 + i * 0.62, FY, i === 1 ? -0.2 : 0.05); panR.add(G);
    add(rbox(0.56, 0.08, 0.26, 0.02), walnutM, 0, 0, 0, G);
    const pq = new THREE.Group(); pq.position.y = 0.07; pq.rotation.x = -0.14; G.add(pq);
    add(rbox(0.5, 0.74, 0.05, 0.015), brass(0.26), 0, 0, 0, pq);
    const t = engrave([[a, 0.24, "900", "#2a1d12", 0.36], [b, 0.11, "700", "#3a2a18", 0.68]], 0.44, 0.66); t.position.set(0, 0.37, 0.028); pq.add(t);
    return G;
  });

  // ---------- party blocks under the beam + PRESIDEN plaque ----------
  const parties = ["PAN", "DEMOKRAT", "PKS", "GOLKAR"].map((nm, i) => {
    const m = aluM.clone(); m.emissive = new THREE.Color(0xffc070); m.emissiveIntensity = 0;
    const G = new THREE.Group(); G.position.set([-2.45, -1.35, 1.35, 2.45][i], PT, 1.0); scene.add(G);
    add(rbox(0.95, 0.95, 0.6, 0.04), m, 0, 0, 0, G);
    add(new THREE.BoxGeometry(0.99, 0.05, 0.64), brassM, 0, 0.97, 0, G);
    const t = engrave([[nm, 0.5, "900", "#1d2024", 0.5]], 0.86, 0.36); t.position.set(0, 0.5, 0.305); G.add(t);
    return { G, m };
  });
  const presM = brass(0.24); presM.emissive = new THREE.Color(0xffb050); presM.emissiveIntensity = 0;
  const pres = new THREE.Group(); pres.position.set(0, PT, 3.25); scene.add(pres);
  add(rbox(1.16, 0.42, 0.42, 0.03), walnutM, 0, 0, 0, pres);
  add(new THREE.BoxGeometry(1.2, 0.04, 0.46), brassM, 0, 0.42, 0, pres);
  const presPl = new THREE.Group(); presPl.position.y = 0.44; presPl.rotation.x = -0.2; pres.add(presPl);
  add(rbox(1.1, 0.4, 0.05, 0.015), presM, 0, 0, 0, presPl);
  const presT = engrave([["PRESIDEN", 0.62, "900", "#2a1d12", 0.52]], 1.0, 0.32); presT.position.set(0, 0.21, 0.028); presPl.add(presT);

  // ---------- FG: brass stanchions with sagging chain ----------
  const posts = [-6.2, -2.6, 2.6, 6.2], FZ = 7.6;
  for (const x of posts) { add(new THREE.CylinderGeometry(0.06, 0.06, 1.15, 16), brassM, x, 0.62, FZ); add(new THREE.CylinderGeometry(0.28, 0.3, 0.08, 24), brassM, x, 0.04, FZ); add(new THREE.SphereGeometry(0.1, 16, 12), brassM, x, 1.24, FZ); }
  { const nL = 3 * 44, fg = new THREE.InstancedMesh(new THREE.TorusGeometry(0.06, 0.016, 6, 12), brassM, nL); fg.frustumCulled = false; fg.castShadow = true;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1); let n = 0;
    for (let s = 0; s < 3; s++) { const x0 = posts[s], x1 = posts[s + 1];
      for (let i = 0; i < 44; i++) { const f = (i + 0.5) / 44, x = x0 + (x1 - x0) * f, y = 1.18 - 0.42 * Math.sin(Math.PI * f); V.set(x, y, FZ); E.set(i % 2 ? Math.PI / 2 : 0, 0, 0.25 * Math.cos(Math.PI * f)); Q.setFromEuler(E); M.compose(V, Q, S); fg.setMatrixAt(n++, M); } }
    scene.add(fg); }

  // ---------- beam tilt: + = PASAR (left) down. Base curve from the data beats + damped jolts ----------
  const base = track([
    [0, 0.0], [A("s1:bereaksi"), 0.02], [A("s1:bereaksi") + 0.7, 0.11], [A("s1:kira") - 0.1, 0.09], [A("s1:kira") + 0.8, -0.09],
    [A("s2:naik") + 0.6, -0.12], [K.s3e, -0.12], [A("s4:rupiah"), -0.1], [A("s4:18.500") + 0.4, 0.03], [A("s4:turun") + 0.9, 0.12],
    [K.s5 + 1, 0.11], [K.s5e, 0.1], [A("s6:Papua") + 0.6, 0.075], [A("s6:Kompas") + 0.6, 0.045], [A("s6:ISEAI") + 0.6, 0.012],
    [A("s7:rakyat"), -0.012], [K.s8, -0.01], [K.end, 0.0],
  ]);
  const jolts = [[A("s1:bereaksi"), 0.05, 2.4], [A("s1:kira"), 0.035, 2.6], [A("s2:5.250"), 0.015, 3], [A("s4:18.500"), 0.02, 3], [A("s4:turun") + 0.4, 0.03, 2.8], [A("s6:Papua"), 0.012, 3], [A("s6:Kompas"), 0.012, 3], [A("s6:ISEAI"), 0.012, 3]];
  const tilt = (t) => { let a = base(t)[0] + 0.006 * Math.sin(t * 0.9); for (const [t0, amp, dec] of jolts) if (t > t0) a += amp * Math.exp(-(t - t0) * dec) * Math.sin((t - t0) * 7.5); return a; };
  const endPos = (a, sx) => [sx * L * Math.cos(a), PY + sx * L * Math.sin(a) - 0.17];

  // ---------- camera: orbit pan to pan ----------
  const deg = Math.PI / 180;
  const Pc = (t, x, y, z, dist, el, yaw) => [t, x + dist * Math.sin(yaw * deg) * Math.cos(el * deg), y + dist * Math.sin(el * deg), z + dist * Math.cos(yaw * deg) * Math.cos(el * deg), x, y, z];
  const camT = track([
    Pc(0, 0, 4.4, 0, 38, -1, -12),
    Pc(A("s1:bereaksi"), 0, 4.4, 0, 36, 1, -7),
    Pc(A("s1:kira"), -0.3, 4.5, 0, 34, 3, -1),
    Pc(K.s1e, -1.0, 4.8, 0, 28, 6, -8),
    Pc(K.s2 + 0.7, -2.5, 5.1, 0, 18, 9, -22),
    Pc(A("s2:5.250"), -2.6, 5.3, 0, 17.5, 11, -13),
    Pc(A("s2:443,5"), -2.6, 5.2, 0.2, 17.5, 14, -26),
    Pc(K.s2e, -2.6, 5.2, 0, 16.5, 18, -33),
    Pc(A("s3:MSCI"), -2.6, 5.3, 0, 17, 24, -38),
    Pc(A("s3:jadwal"), -2.6, 5.3, 0, 17.5, 31, -26),
    Pc(K.s3e, -2.6, 5.1, 0, 16.5, 26, -10),
    Pc(A("s4:rupiah"), -2.5, 5.0, 0, 15.5, 14, 6),
    Pc(A("s4:18.500"), -2.4, 4.8, 0.1, 16, 12, 13),
    Pc(A("s4:Emas"), -2.6, 4.5, 0.4, 16, 14, -4),
    Pc(A("s4:turun") + 0.4, -2.6, 3.3, 1.0, 15, 18, -14),
    Pc(A("s4:turun") + 1.4, -2.4, 2.4, 1.8, 12.5, 22, -18),
    Pc(K.s4e, -2.1, 2.6, 1.6, 14, 22, -24),
    Pc(K.s5 + 0.7, -0.8, 2.6, 1.2, 19.5, 13, -24),
    Pc(A("s5:PAN"), -0.6, 2.5, 1.3, 19, 12, -9),
    Pc(A("s5:Golkar"), 0.6, 2.5, 1.3, 19, 12, 8),
    Pc(A("s5:Prabowo"), 0.1, 2.4, 1.8, 18, 15, 2),
    Pc(K.s5e, 1.2, 3.3, 1.2, 17, 14, 16),
    Pc(K.s6 + 0.7, 2.6, 5.1, 0, 17, 13, 32),
    Pc(A("s6:Kompas"), 2.7, 5.1, 0, 16, 12, 20),
    Pc(A("s6:ISEAI"), 2.7, 5.1, 0, 16, 12, 8),
    Pc(K.s6e, 2.0, 5.0, 0, 18, 13, 2),
    Pc(A("s7:18.500"), 0, 5.2, 0, 36, 9, 8),
    Pc(A("s7:MSCI"), 0, 5.3, 0, 38, 11, -2),
    Pc(A("s7:rakyat"), 0, 5.3, 0, 39, 13, -10),
    Pc(K.s7e, 0, 5.2, 0, 40, 11, -13),
    Pc(K.s8 + 0.4, 0, 5.1, 0, 42, 8, -16),
    Pc(K.end, 0, 5.2, 0, 46, 7, -22),
  ]);

  const camQ = new THREE.Quaternion();
  return function draw(t) {
    gr.uniforms.uT.value = t;
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.updateMatrixWorld();

    // beam + pans
    const a = tilt(t);
    beam.rotation.z = a;
    const [lx, ly] = endPos(a, -1), [rx, ry] = endPos(a, 1);
    panL.position.set(lx, ly, 0); panR.position.set(rx, ry, 0);
    const floorL = ly + FY; // world y of PASAR pan floor

    // IHSG column grows on "naik" -> "5.250"
    const g2 = eout(clamp01((t - A("s2:naik") + 0.1) / Math.max(0.6, A("s2:5.250") + 0.5 - A("s2:naik"))));
    const hI = 1.0 + 0.95 * g2;
    ihsg.scale.y = hI; ihsgCap.position.y = FY + hI + 0.03; ihsgTag.position.y = FY + 0.32;
    ihsgM.emissiveIntensity = 0.45 + 0.6 * ramp(t, A("s2:naik"), A("s2:5.250")) * (1 - 0.5 * ramp(t, K.s4, K.s4 + 1));
    const ar = ramp(t, A("s2:naik") - 0.2, A("s2:naik") + 0.3) * (1 - ramp(t, K.s3 + 0.5, A("s3:MSCI") + 0.2)) + ramp(t, A("s7:MSCI") - 0.3, A("s7:MSCI") + 0.2) * (1 - ramp(t, K.s8, K.s8 + 0.6));
    arrow.visible = ar > 0.01; arrow.scale.setScalar(Math.max(0.001, ar)); arrow.position.y = FY + hI + 0.14 + 0.08 * Math.sin(t * 3.2);
    arrow.rotation.y = t * 0.8;

    // net-buy bubble: drops in on "443,5", rides into the MSCI sleeve on "mengikuti"
    const bd = eout(clamp01((t - A("s2:443,5") + 0.3) / 0.9));
    const bm = ramp(t, A("s3:mengikuti") - 0.3, A("s3:jadwal") + 0.2);
    const bx = -0.82 + 0.34 * bm, bz = 0.55 - 0.83 * bm, by = FY + 0.3 + 3.2 * (1 - bd) + 0.6 * Math.sin(bm * Math.PI) + 0.05 * Math.sin(t * 2.3);
    bubble.position.set(bx, by, bz); bubble.visible = t > A("s2:443,5") - 0.35 && bm < 0.98;
    bubble.scale.setScalar(Math.max(0.001, 1 - 0.7 * bm));
    bubLab.visible = bubble.visible && t < K.s3 + 0.4;
    bubLab.position.set(lx + bx, ly + by + 0.62, bz); bubLab.quaternion.copy(cam.quaternion);
    bubLab.material.opacity = ramp(t, A("s2:443,5") - 0.1, A("s2:443,5") + 0.3) * (1 - ramp(t, K.s3 - 0.1, K.s3 + 0.4));

    // MSCI sleeve descends over IHSG on "MSCI", stays as a translucent jacket
    const sd = eout(clamp01((t - A("s3:MSCI") + 0.25) / 1.1));
    sleeve.position.set(-0.48, FY + 0.01 + 4.2 * (1 - sd), -0.28); sleeve.visible = t > A("s3:MSCI") - 0.3;
    msciTag.position.set(-0.48, sleeve.position.y + 1.5, 0.11); msciTag.visible = sleeve.visible;
    tealL.position.set(lx - 0.48, ly + FY + 1.4, 0.4); tealL.intensity = 2.2 * ramp(t, A("s3:MSCI"), A("s3:MSCI") + 0.8) * (1 - 0.6 * ramp(t, K.s4, K.s4 + 1)) + 1.6 * ramp(t, A("s7:MSCI") - 0.3, A("s7:MSCI") + 0.3);

    // rupiah pressed: plate comes down on "rupiah", squeezes the column to "18.500"
    const p1 = ramp(t, A("s4:rupiah") - 0.3, A("s4:tertekan") + 0.2), p2 = ramp(t, A("s4:tertekan"), A("s4:18.500") + 0.3);
    const hR = 1.72 - 0.62 * p2;
    rup.scale.y = hR; rupTag.position.y = FY + Math.min(0.32, hR - 0.2);
    const plY = FY + 2.05 - (2.05 - 1.75) * p1 - 0.62 * p2 + 0.02;
    plate.position.y = Math.max(plY, FY + hR + 0.005);
    screw.position.y = (plate.position.y + FY + 2.3) / 2 + 0.03; screw.scale.y = Math.max(0.05, FY + 2.3 - plate.position.y);
    hand.rotation.y = (p1 + p2) * 6;
    orgL.position.set(lx + 0.48, ly + FY + 1.0, 0.5); orgL.intensity = 2.0 * ramp(t, A("s4:rupiah"), A("s4:18.500")) * (1 - ramp(t, K.s5, K.s5 + 1)) + 1.6 * ramp(t, A("s7:18.500") - 0.3, A("s7:18.500") + 0.3);

    // gold: top bar slides off the front of the stack on "turun" and drops onto the plinth
    const T0 = A("s4:turun") - 0.15, TS = 0.5, TF = 0.82;
    const lzTop = 0.42, lyTop = FY + 2 * 0.125;
    if (t < T0 + TS) {
      const k = ramp(t, T0, T0 + TS);
      dropBar.position.set(lx + 0.24, floorL - FY + lyTop, lzTop + 1.0 * k); dropBar.rotation.set(0.5 * k * k, 0, 0);
    } else {
      const aS = tilt(T0 + TS), [sx, sy] = endPos(aS, -1); const y0 = sy + lyTop, df = t - T0 - TS;
      const land = PT + 0.06, tl = Math.sqrt(2 * (y0 - land) / 9.8);
      const fk = clamp01(df / tl);
      const y = df < tl ? y0 - 4.9 * df * df : land + 0.12 * Math.abs(Math.sin((df - tl) * 9)) * Math.exp(-(df - tl) * 6);
      dropBar.position.set(sx + 0.24 + 0.1 * fk, y, lzTop + 1.0 + 0.75 * fk);
      dropBar.rotation.set(0.5 + (Math.PI - 0.5) * fk, 0.3 * fk, 0);
    }
    dropM.emissiveIntensity = 0.5 + 1.4 * ramp(t, T0, T0 + 0.6) * (1 - 0.6 * ramp(t, K.s5, K.s5 + 1.5));

    // party blocks light one by one, then turn toward the PRESIDEN plaque on "Prabowo"
    const pw = ["s5:PAN", "s5:Demokrat", "s5:PKS", "s5:Golkar"];
    const turn = ramp(t, A("s5:Prabowo") - 0.2, A("s5:Prabowo") + 0.7);
    parties.forEach((p, i) => {
      const w = A(pw[i]); p.m.emissiveIntensity = 0.55 * (ramp(t, w - 0.1, w + 0.2) * (1 - 0.7 * ramp(t, w + 0.6, w + 1.4))) + 0.12 * ramp(t, K.s5, K.s5 + 0.6) * (1 - ramp(t, K.s6, K.s6 + 1));
      const x0 = [-2.45, -1.35, 1.35, 2.45][i];
      p.G.position.set(x0 * (1 - 0.06 * turn), PT, 1.0 + 0.3 * turn);
      p.G.rotation.y = -Math.atan2(x0, 2.6) * turn;
      p.G.position.y = PT + 0.05 * Math.max(0, Math.sin((t - w) * 9)) * Math.exp(-Math.max(0, t - w) * 4) * (t > w ? 1 : 0);
    });
    presM.emissiveIntensity = 0.5 * ramp(t, A("s5:Prabowo") - 0.1, A("s5:Prabowo") + 0.4) * (1 - 0.6 * ramp(t, K.s6, K.s6 + 1));

    // RAKYAT plaques rise one by one
    ["s6:Papua", "s6:Kompas", "s6:ISEAI"].forEach((w, i) => { const k = back(clamp01((t - A(w) + 0.15) / 0.5), 1.5); voices[i].scale.setScalar(Math.max(0.001, k)); voices[i].visible = k > 0.001; });

    // needle + key light breathe with the drama; key light tracks the subject

    key.target.position.set(c[3] * 0.6, 3.2, c[5] * 0.6);

    // mirrored camera for the floor reflection
    mcam.position.set(cam.position.x, -cam.position.y, cam.position.z); mcam.up.set(0, -1, 0); mcam.lookAt(c[3], -c[4], c[5]); mcam.updateMatrixWorld();
    texM.copy(bias).multiply(mcam.projectionMatrix).multiply(mcam.matrixWorldInverse);
    floor.visible = false;
    r.setRenderTarget(mirrorRT); r.render(scene, mcam); r.setRenderTarget(null);
    floor.visible = true;
    comp.render();
  };
}
