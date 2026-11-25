// EP04 THE BEAM. A schematic acoustic hailer on a blueprint floor. The sound field is computed per pixel as the sum of in-phase point sources across the emitter face,
// so a narrow emitter really spreads and a wide one really beams. Wavelength and emitter are scaled up together (1 unit = 1 visual wavelength); the ratio aperture/wavelength is what matters.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, skyEnv, box, cyl, std, canvasTex } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;
const HY = 3.0; // emitter centre height

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 2000);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    lrad: A_("s2:LRAD", s.s2 + 0.8), nada: A_("s2:nada", s.s2 + 7),
    senter: A_("s3:senter", s.s3 + 2), ukuran: A_("s3:ukuran", s.s3 + 3.5), lebar: A_("s3:lebar", s.s3 + 6), gel: A_("s3:gelombang", s.s3 + 7.5),
    kuat: A_("s4:menguatkan", s.s4 + 2.5), redam: A_("s4:meredam", s.s4 + 4.5), derajat: A_("s4:derajat", s.s4 + 8),
    sepuluh: A_("s5:sepuluh", s.s5 + 3), sakit: A_("s5:sakit", s.s5 + 6.5), meter5: A_("s5:meter", s.s5 + 11),
    melemah: A_("s6:melemah", s.s6 + 1.5), sempit: A_("s6:sempit", s.s6 + 6), samping: A_("s6:sampingnya", s.s6 + 10),
    pitt: A_("s7:Pittsburgh", s.s7 + 1.5), permanen: A_("s7:permanen", s.s7 + 6), dolar: A_("s7:dolar", s.s7 + 11),
    bidik: A_("s8:membidik", s.s8 + 3), menjauh: A_("s8:Menjauh", s.s8 + 5),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color(0x040914);
  S.environment = skyEnv(r, 0x1d3a66, 0x0a1426, 0x02040a, v3(0, 1, 0), 0xffffff, 0);
  S.environmentIntensity = 0.9;
  S.fog = new THREE.FogExp2(0x040914, 0.012);
  // blueprint floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShaderMaterial({
    fog: true, uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
    vertexShader: "#include <fog_pars_vertex>\nvarying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}",
    fragmentShader: "#include <fog_pars_fragment>\nvarying vec3 vW;float ln(vec2 p,float s,float w){vec2 g=abs(fract(p/s-.5)-.5)*s;return 1.-smoothstep(0.,w,min(g.x,g.y));}void main(){vec2 p=vW.xz;vec3 c=vec3(.016,.04,.08);c+=vec3(.05,.16,.3)*ln(p,1.,.03)*.5+vec3(.1,.35,.6)*ln(p,5.,.05)*.7;gl_FragColor=vec4(c,1.);\n#include <fog_fragment>\n}",
  }));
  floor.rotation.x = -Math.PI / 2; S.add(floor);
  S.add(new THREE.HemisphereLight(0x6fa8ff, 0x050a12, 0.6));
  const rimL = new THREE.DirectionalLight(0x38e1ff, 2.5); rimL.position.set(-15, 10, -20); S.add(rimL);
  const key = new THREE.DirectionalLight(0xdbe8ff, 3.2); key.position.set(-20, 40, 25); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); S.add(key);

  // emitter: round panel of drivers on a yoke. Face points +x.
  const dev = new THREE.Group(); S.add(dev);
  const bodyM = std(0x8a97a8, 0.35, 0.75), faceM = std(0x1c2633, 0.5, 0.5);
  const panel = cyl(2.15, 2.15, 0.7, 64, bodyM, 0, HY, 0, dev); panel.rotation.z = Math.PI / 2;
  const face = cyl(2.0, 2.0, 0.05, 64, faceM, 0.36, HY, 0, dev); face.rotation.z = Math.PI / 2;
  const drvM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.6, 2.4) });
  const drivers = new THREE.InstancedMesh(new THREE.CircleGeometry(0.16, 16), drvM, 120);
  const dm = new THREE.Object3D();
  let nd = 0;
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const y = i * 0.3, z = j * 0.3 + (i % 2 ? 0.15 : 0);
    if (y * y + z * z > 3.4 || nd >= 120) continue;
    dm.position.set(0.39, HY + y, z); dm.rotation.set(0, Math.PI / 2, 0); dm.updateMatrix(); drivers.setMatrixAt(nd++, dm.matrix);
  }
  drivers.count = nd; dev.add(drivers);
  const yokeM = std(0x56606c, 0.4, 0.8);
  box(0.3, 2.6, 0.3, yokeM, 0, HY - 1.2, 2.3, dev); box(0.3, 2.6, 0.3, yokeM, 0, HY - 1.2, -2.3, dev);
  box(0.4, 0.3, 4.9, yokeM, 0, HY - 2.5, 0, dev);
  cyl(0.35, 0.5, HY - 2.5, 16, yokeM, 0, (HY - 2.5) / 2, 0, dev);
  dev.traverse((m) => { if (m.isMesh) m.castShadow = true; });

  // the field: a plane at emitter height
  const FU = { uT: { value: 0 }, uAp: { value: 4 }, uOn: { value: 0 }, uFar: { value: 1 }, uGain: { value: 1 } };
  const field = new THREE.Mesh(new THREE.PlaneGeometry(120, 90, 1, 1), new THREE.ShaderMaterial({
    uniforms: FU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}",
    fragmentShader: `precision highp float;varying vec3 vW;uniform float uT,uAp,uOn,uFar,uGain;
      void main(){vec2 p=vW.xz;if(p.x<.45){discard;}
        const int N=28;float k=6.2831853;float w=k*5.;float acc=0.;float env=0.;
        for(int i=0;i<N;i++){float z=(float(i)/float(N-1)-.5)*uAp;vec2 d=p-vec2(.4,z);float rr=length(d);
          acc+=sin(k*rr-w*uT)/sqrt(rr+.6);env+=cos(k*rr)/sqrt(rr+.6);}
        float rr=length(p);float a=acc/float(N);
        float front=smoothstep(uFar*60.,uFar*60.-6.,rr);
        float lead=smoothstep(0.,1.5,(uT*5.-rr+200.)) ;
        vec3 col=vec3(.25,1.25,2.2)*max(a,0.)*2.2+vec3(2.,.75,.12)*max(-a,0.)*.9;
        float aa=clamp(abs(a)*3.2,0.,1.)*uOn*front*uGain;
        gl_FragColor=vec4(col*aa,1.);}`,
  }));
  field.rotation.x = -Math.PI / 2; field.position.set(60, HY, 0); field.frustumCulled = false; S.add(field);
  // beam edge guides at +-15 degrees
  const guideM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.2, 0.2), transparent: true, opacity: 0 });
  const guides = [-1, 1].map((sg) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(60, 0.06, 0.06), guideM);
    const a = sg * 15 * Math.PI / 180;
    g.position.set(Math.cos(a) * 30 + 0.4, HY + 0.05, -Math.sin(a) * 30); g.rotation.y = a; S.add(g); return g;
  });
  const arc = new THREE.Mesh(new THREE.RingGeometry(7.8, 8.0, 48, 1, -15 * Math.PI / 180, 30 * Math.PI / 180), guideM);
  arc.rotation.x = -Math.PI / 2; arc.position.set(0.4, HY + 0.05, 0); S.add(arc);
  // distance markers: 1, 2, 4, 8, 16, 32 (labels in dB below the 160 dB peak at 1 m, inverse-square only)
  const label = (txt, col) => {
    const tx = canvasTex(512, 160, (c, w, h) => { c.fillStyle = "rgba(4,9,20,.82)"; c.fillRect(0, 0, w, h); c.fillStyle = col; c.fillRect(0, 0, 10, h); c.font = "800 88px 'JetBrains Mono', monospace"; c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(txt, 34, h / 2 + 4); });
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false })); m.scale.set(4.2, 1.31, 1); return m;
  };
  const marks = [1, 2, 4, 8, 16, 32].map((d, i) => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.2, 0.2), transparent: true, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; g.add(ring);
    const lb = label(`${160 - 6 * i} dB`, "#FFB547"); lb.position.set(0, 1.6, 0); g.add(lb);
    const dl = label(`${d} m`, "#38E1FF"); dl.scale.multiplyScalar(0.6); dl.position.set(0, 0.6, 0); g.add(dl);
    g.position.set(0.4 + d * 1.6, HY + 0.05, 0); S.add(g); return g;
  });
  // two listeners at the same distance, one on the beam axis and one off to the side
  const person = (col) => {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: 0x8aa2bf, roughness: 0.6, emissive: col, emissiveIntensity: 0 });
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.6, 6, 12), m); b.position.y = 1.25; g.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), m); h.position.y = 2.75; g.add(h);
    g.traverse((x) => { if (x.isMesh) x.castShadow = true; });
    S.add(g); return { g, m };
  };
  const pA = person(0xff3b1f), pB = person(0x38e1ff);
  pA.g.position.set(26, 0, 0); pB.g.position.set(26 * Math.cos(0.75), 0, -26 * Math.sin(0.75));
  // emitted ring pulses for the hook and the closing
  const NRg = 6;
  const pulseM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.8, 3), transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const pulses = Array.from({ length: NRg }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64, 1, -0.3, 0.6), pulseM.clone()); m.rotation.x = -Math.PI / 2; m.position.set(0.4, HY, 0); S.add(m); return m; });

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.7, 0.55, 0.9));
  comp.addPass(new OutputPass());
  const UPX = v3(1, 0, 0), UPY = v3(0, 1, 0);
  const look = (p, q, up = UPY) => { cam.up.copy(up); cam.position.copy(p); cam.lookAt(q); };
  const lv = (a, b, u) => a.clone().lerp(b, u);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    FU.uT.value = t;
    // aperture: a tiny source for "senter" until "lebar", then the full face
    let ap = 4.0;
    if (t >= s.s3 && t < s.s4) ap = THREE.MathUtils.lerp(0.05, 4.0, ramp(t, E.lebar - 0.2, E.gel + 0.6));
    FU.uAp.value = ap;
    const on = t < s.s2 ? ramp(t, 1.0, 2.5) : t < s.s3 ? ramp(t, E.nada - 0.4, E.nada + 0.5) * 0.9 + 0.1 : 1;
    FU.uOn.value = t >= s.s7 && t < s.s8 ? 0.35 : on;
    FU.uFar.value = 1;
    FU.uGain.value = t >= s.s8 ? 1 - 0.5 * ramp(t, E.menjauh, E.menjauh + 2) : 1;
    // guides and arc on the beam chapter and after
    guideM.opacity = (t >= s.s4 && t < s.s5) ? ramp(t, E.derajat - 0.6, E.derajat) : (t >= s.s6 && t < s.s7) ? 0.5 * ramp(t, E.sempit - 0.4, E.sempit + 0.3) : 0;
    const showMarks = t >= s.s6 && t < s.s7;
    marks.forEach((m, i) => { const k = showMarks ? ramp(t, E.melemah - 0.3 + i * 0.35, E.melemah + i * 0.35) : 0; m.visible = k > 0.01; m.scale.setScalar(Math.max(0.01, k)); });
    const ppl = (t >= s.s6 && t < s.s7) ? ramp(t, E.sempit - 0.5, E.sempit + 0.4) : (t >= s.s7) ? 1 : 0;
    pA.g.visible = pB.g.visible = ppl > 0.01;
    pB.g.visible = pB.g.visible && t < s.s7;
    pA.m.emissiveIntensity = ppl * (t >= s.s7 ? 0.25 + 0.15 * Math.sin(t * 9) : 0.9 + 0.3 * Math.sin(t * 12));
    pB.m.emissiveIntensity = ppl * 0.25;
    if (t >= s.s8) pA.g.position.x = 26 + 14 * ramp(t, E.menjauh, s.dur); else pA.g.position.x = 26;
    // pulses
    pulses.forEach((m, i) => {
      const age = ((t * 1.1 + i / NRg) % 1);
      const act = t < s.s3 || t >= s.s8;
      m.visible = act; m.scale.setScalar(1 + age * 38); m.material.opacity = (1 - age) * 0.5;
    });
    drvM.color.setRGB(0.1, 0.42, 0.62).multiplyScalar(0.6 + 0.5 * on);

    // cameras
    if (t < s.s2) {
      const u = t / s.s2;
      look(v3(9 - 1.5 * u, HY + 2.5, 12 - 2 * u), v3(0.3, HY - 0.4, 0));
    } else if (t < s.s3) {
      const u = (t - s.s2) / (s.s3 - s.s2);
      const a = 1.05 - 0.75 * u;
      look(v3(Math.cos(a) * 14, HY + 3 + 3 * u, Math.sin(a) * 14), v3(2, HY - 0.5, 0));
    } else if (t < s.s5) {
      // top-down, beam pointing up the frame
      const u = (t - s.s3) / (s.s5 - s.s3);
      look(v3(16 + 4 * u, 62 + 6 * u, 0.001), v3(16 + 4 * u, 0, 0), UPX);
    } else if (t < s.s6) {
      const u = (t - s.s5) / (s.s6 - s.s5);
      look(v3(8 - 1.5 * u, HY + 3, -12 + 2 * u), v3(0.3, HY - 0.4, 0));
    } else if (t < s.s7) {
      const u = (t - s.s6) / (s.s7 - s.s6);
      look(v3(24 + 2 * u, 84 + 4 * u, -7.001), v3(24 + 2 * u, 0, -7), UPX);
    } else if (t < s.s8) {
      const u = (t - s.s7) / (s.s8 - s.s7);
      look(v3(36 + 2 * u, 5.5, 11 - u), v3(25, 2.2, 0));
    } else {
      const u = ramp(t, s.s8, s.dur);
      look(v3(-6 - 6 * u, 30 + 30 * u, 0.001), v3(18, 0, 0), UPX);
    }
    comp.render();
  };
}
