// Episode-local helpers (copied into hf/assets/lib by build-video.mjs). Pure functions of t, no look decisions
// beyond what each world passes in.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { canvasTex, clamp01 } from "./lib3d.js";

const VS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
// Zeroes NaN / runaway pixels before bloom so one bad pixel never spreads into black blocks.
export const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: VS,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };

// Colour grade: tint shadows / highlights, contrast, saturation, cut flash to a colour.
export function gradePass({ shadow = [0, 0, 0], high = [1, 1, 1], sat = 1.05, con = 1.06, flashColor = [1, 1, 1] } = {}) {
  const v3 = (a) => `vec3(${a.map((x) => x.toFixed(3)).join(",")})`;
  return new ShaderPass({ uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
    float l=dot(c,vec3(0.299,0.587,0.114));c+=${v3(shadow)}*(1.0-l)*0.08;c*=mix(vec3(1.0),${v3(high)},l*0.5);
    c=mix(vec3(l),c,${sat.toFixed(3)});c=(c-0.5)*${con.toFixed(3)}+0.5;c=mix(c,${v3(flashColor)},flash);
    vec2 q=vUv-0.5;c*=1.0-dot(q,q)*0.35;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` });
}

// Strip-light environment for reflections (no HDR file). strips: [w,h,color,intensity,x,y,z]
export function stripEnv(r, scene, strips, base, intensity) {
  const pm = new THREE.PMREMGenerator(r), s = new THREE.Scene();
  s.background = new THREE.Color(base);
  for (const [w, h, c, i, x, y, z] of strips) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  }
  scene.environment = pm.fromScene(s, 0.04).texture; pm.dispose();
  scene.environmentIntensity = intensity;
}

// Text on a transparent plane. lines: [[text, font, color, y(0..1)]]
export function textPlane(w, h, lines, size, { bg = null, border = null } = {}) {
  const tx = canvasTex(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    if (border) { g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }
    g.textAlign = "center"; g.textBaseline = "middle";
    for (const [t, f, c, y] of lines) { g.font = f; g.fillStyle = c; g.fillText(t, w / 2, y * h); }
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(size, (size * h) / w), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
}

// A stylised person: head, neck, shoulders wider than the waist, bent elbows and knees, skin differs from clothes.
// Feet at y=0, height ~1.75 units at scale 1. Returns pivots so poses are pure functions of t.
export function person({ skin = "#c99a78", top = "#2c4a6e", bottom = "#2b2b30", hair = "#1d1712", mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }) } = {}) {
  const G = new THREE.Group();
  const add = (geo, c, x, y, z, p = G) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const torso = new THREE.Group(); torso.position.y = 0.95; G.add(torso);
  add(new THREE.CylinderGeometry(0.21, 0.15, 0.55, 14), top, 0, 0.28, 0, torso);
  add(new THREE.SphereGeometry(0.2, 14, 10), top, 0, 0.52, 0, torso).scale.set(1.25, 0.45, 0.8);
  add(new THREE.CylinderGeometry(0.15, 0.17, 0.16, 12), bottom, 0, 0.0, 0, torso);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 10), skin, 0, 0.6, 0, torso);
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head);
  add(new THREE.SphereGeometry(0.13, 18, 14), skin, 0, 0.12, 0, head).scale.set(0.92, 1.08, 0.98);
  add(new THREE.SphereGeometry(0.136, 18, 12, 0, Math.PI * 2, 0, 1.45), hair, 0, 0.14, -0.012, head);
  const limb = (x, y, l1, l2, r, c, cHand, parent) => {
    const a = new THREE.Group(); a.position.set(x, y, 0); parent.add(a);
    add(new THREE.CapsuleGeometry(r, l1 - 2 * r, 4, 10), c, 0, -l1 / 2, 0, a);
    const b = new THREE.Group(); b.position.y = -l1; a.add(b);
    add(new THREE.CapsuleGeometry(r * 0.9, l2 - 2 * r, 4, 10), c, 0, -l2 / 2, 0, b);
    add(new THREE.SphereGeometry(r * 1.15, 10, 8), cHand, 0, -l2, 0, b);
    return { a, b };
  };
  const armL = limb(-0.27, 0.5, 0.3, 0.28, 0.055, top, skin, torso), armR = limb(0.27, 0.5, 0.3, 0.28, 0.055, top, skin, torso);
  const legL = limb(-0.1, 0.95, 0.46, 0.46, 0.075, bottom, "#1a1a1a", G), legR = limb(0.1, 0.95, 0.46, 0.46, 0.075, bottom, "#1a1a1a", G);
  return { G, torso, head, armL, armR, legL, legR };
}
// pose: shoulder pitch / roll, elbow bend, hip, knee (radians). Arms hang slightly out by default.
export function pose(p, o = {}) {
  p.armL.a.rotation.set(o.aL ?? 0.1, 0, -(o.rL ?? 0.12)); p.armR.a.rotation.set(o.aR ?? 0.1, 0, o.rR ?? 0.12);
  p.armL.b.rotation.x = -(o.eL ?? 0.35); p.armR.b.rotation.x = -(o.eR ?? 0.35);
  p.legL.a.rotation.x = o.hL ?? 0; p.legR.a.rotation.x = o.hR ?? 0;
  p.legL.b.rotation.x = o.kL ?? 0.05; p.legR.b.rotation.x = o.kR ?? 0.05;
  p.head.rotation.set(o.hx ?? 0, o.hy ?? 0, 0); p.torso.rotation.y = o.ty ?? 0;
}

// Cut flash: 1 at the cut, fading over d seconds either side.
export function flashAt(t, cuts, d = 0.18) {
  let f = 0;
  for (const c of cuts) f = Math.max(f, 1 - clamp01(Math.abs(t - c) / d));
  return f * f;
}
