// EP040 film world. One street (from the cover), seen two ways by a single shader:
//  - "mata" (human eye): only visible light counts — street lamps, headlights, a white flash.
//  - "sensor": Ironbow false colour of what the pole camera records, including its own illuminator.
// A screen-space mask (sweep from the top, split from the left) decides which view each pixel shows,
// so transitions and the eye-vs-camera split are done in one render. Plus two macro worlds:
// retroreflective glass beads in cross-section, and the old-vs-new plate comparison.
// Everything is a pure function of the state passed in (built from useCurrentFrame()).

import React, { useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FONT } from "../../core/type/fonts.ts";

export const PLATE = "B 1234 XYZ";
export type V3 = [number, number, number];
export type Cam = { pos: V3; target: V3; fov: number; shift?: [number, number] }; // shift: move the image (layout px), e.g. into a monitor window
export type WorldState = {
  world: "street" | "macro" | "compare" | "none";
  cam: Cam;
  t: number;
  car: { x: number; z: number; yaw: number };
  sweep: number; // 0..1 of the screen height (from the top) that shows the sensor view
  splitX: number; // sensor only right of this 0..1 screen x
  irOn: number; // illuminator output 0..1
  flash: number; // white visible flash 0..1
  rings: number; // -1 hidden, else emission phase in seconds
  beadIn: number; // macro: incoming ray progress 0..1
  beadOut: number; // macro: returning ray progress 0..1
  newPlate: number; // compare: new plate reveal 0..1
  pulse: number; // -1 hidden, else 0..1 data pulse along the gantry
  fill?: number; // extra key light on hardware (sensor view), for the gantry close-ups
  bloom?: number; // bloom strength (lower for plate close-ups so the characters stay sharp)
};

// gantry: the pole stands on the right sidewalk, the arm reaches over the approach lanes
export const CAM1: V3 = [2.4, 5.7, 13.6];
export const CAM2: V3 = [5.6, 5.7, 13.6];
export const AIM: V3 = [1.95, 0.4, -4];
export const LAMP: V3 = [2.02, 5.7, 13.62]; // illuminator panel right beside CAM1's lens
export const PLATE_LOCAL: V3 = [0, 0.5, 2.45];
export const PLATE_W = 0.62, PLATE_H = 0.17;

export const plateWorld = (car: WorldState["car"], lx = 0, ly = 0) => {
  const v = new THREE.Vector3(PLATE_LOCAL[0] + lx, PLATE_LOCAL[1] + ly, PLATE_LOCAL[2]);
  v.applyAxisAngle(new THREE.Vector3(0, 1, 0), car.yaw);
  return v.add(new THREE.Vector3(car.x, 0, car.z));
};

/** Screen position (1080×1920 layout px) of a world point for a camera. */
export const project = (cam: Cam, p: THREE.Vector3 | V3) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.3, 500);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = (Array.isArray(p) ? new THREE.Vector3(...p) : p.clone()).project(c);
  return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, behind: v.z > 1 };
};

const IRONBOW = /* glsl */ `vec3 ironbow(float x){ x = clamp(x,0.,1.);
  vec3 c0=vec3(.015,.01,.05), c1=vec3(.19,.03,.40), c2=vec3(.61,.10,.53), c3=vec3(.92,.37,.16), c4=vec3(.97,.80,.22), c5=vec3(1.,.98,.88);
  if(x<.2) return mix(c0,c1,x/.2);
  if(x<.42) return mix(c1,c2,(x-.2)/.22);
  if(x<.62) return mix(c2,c3,(x-.42)/.2);
  if(x<.84) return mix(c3,c4,(x-.62)/.22);
  return mix(c4,c5,(x-.84)/.16); }`;
const NOISE = /* glsl */ `float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }`;
const VERT = /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vO; varying vec3 vON; varying vec2 vUv;
  void main(){ vec4 m = modelMatrix*vec4(position,1.); vP = m.xyz; vO = position; vON = normal; vUv = uv;
    vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*m; }`;

// uniforms shared by every material (same {value} objects, so one update reaches all)
const makeShared = () => ({
  lamp: { value: new THREE.Vector3(...LAMP) },
  lampDir: { value: new THREE.Vector3().subVectors(new THREE.Vector3(...AIM), new THREE.Vector3(...LAMP)).normalize() },
  camPos: { value: new THREE.Vector3() },
  irOn: { value: 1 }, flash: { value: 0 }, sweep: { value: 1 }, splitX: { value: 0 },
  res: { value: new THREE.Vector2(1080, 1920) }, t: { value: 0 },
  carPos: { value: new THREE.Vector3() },
  fill: { value: 0 },
});
type Shared = ReturnType<typeof makeShared>;

type MatOpts = { albedo: number; retro?: number; ev?: number; ei?: number; kind?: number; map?: THREE.Texture | null; tint?: V3 };
// kind: 0 plain, 1 ground (grain, lamp pools, headlight beams), 2 car body (glass above beltline),
// 3 building (lit windows), 4 coloured light (tint in the eye view)
const streetMat = (S: Shared, { albedo, retro = 0, ev = 0, ei = 0, kind = 0, map = null, tint = [1, 1, 1] }: MatOpts) =>
  new THREE.ShaderMaterial({
    uniforms: {
      ...S, albedo: { value: albedo }, retro: { value: retro }, ev: { value: ev }, ei: { value: ei }, kind: { value: kind },
      map: { value: map }, useMap: { value: map ? 1 : 0 }, tint: { value: new THREE.Vector3(...tint) },
    },
    vertexShader: VERT,
    fragmentShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vO; varying vec3 vON; varying vec2 vUv;
      uniform float albedo, retro, ev, ei, kind, useMap, t, irOn, flash, sweep, splitX, fill; uniform sampler2D map;
      uniform vec3 lamp, lampDir, camPos, tint, carPos; uniform vec2 res;
      ${IRONBOW}
      ${NOISE}
      void main(){
        // kind 5: illuminator LEDs, always a dim red dot (that is what an eye or camera sees of an IR LED)
        if (kind > 4.5) { vec3 led = vec3(.62,.05,.035)*(.2+.8*irOn); gl_FragColor = vec4(pow(led, vec3(2.2)), 1.); return; }
        vec3 N = normalize(vN);
        vec3 d = lamp - vP; float r2 = dot(d,d); vec3 L = d*inversesqrt(r2);
        float ndl = max(dot(N,L),0.);
        float cone = smoothstep(.72,.93, dot(-L, lampDir));
        float irr = ndl * (0.3*smoothstep(-.2,.3,dot(-L,lampDir)) + 0.9*cone) * 800. / (r2 + 60.) * smoothstep(.5, 1.6, sqrt(r2)); // nothing behind the lamp, nor its own housing, gets lit
        vec3 V = normalize(camPos - vP);
        float align = pow(max(dot(L,V),0.), 24.);
        float a = albedo;
        if (useMap > .5) a *= pow(texture2D(map, vUv).r, 2.5);
        bool ground = kind > .5 && kind < 1.5;
        if (ground) a *= .75 + .5*n(vP.xz*7.) + .25*n(vP.xz*.6);
        if (kind > 1.5 && kind < 2.5) { if (vO.y > .96 && vO.y < 1.36 && abs(vON.y) < .95) a = .045; }
        // response to the camera's own light; retroreflection returns toward the source (bright when we look from there)
        float litR = retro*a*pow(max(dot(N,V),0.),2.)*irr*(.35+.65*align);
        float lit = a*irr + litR;
        float key = (kind < .5 ? fill : 0.)*a*(.35+.65*max(dot(N, normalize(vec3(-.25,.55,-.8))),0.));
        float amb = .05*(.5+.5*N.y) + (kind < .5 ? .22 : 0.); // plain props (poles, housings) catch some street-lamp fill
        float hl = 0.;
        if (ground) {
          amb += .5*exp(-dot(vP.xz-vec2(-8.,-9.),vP.xz-vec2(-8.,-9.))/18.) + .4*exp(-dot(vP.xz-vec2(8.6,-17.),vP.xz-vec2(8.6,-17.))/20.)
               + .35*exp(-dot(vP.xz-vec2(-8.,24.),vP.xz-vec2(-8.,24.))/22.);
          vec2 q = vP.xz - carPos.xz; float ahead = q.y - 2.3;
          float ah = max(ahead, 0.); // clamp: behind the car the falloff would blow up to Inf*0 = NaN and bloom blanks the frame
          hl = smoothstep(0.,1.2,ahead) * exp(-ah/13.) * exp(-q.x*q.x/(.9+ah*.22)) * 2.2;
        }
        if (kind > 2.5 && kind < 3.5) {
          vec2 g = vec2(floor(vP.x*.55 + vP.z*.55), floor(vP.y*.42));
          vec2 fr = fract(vec2(vP.x*.55 + vP.z*.55, vP.y*.42));
          float win = step(.25, fr.x)*step(fr.x,.75)*step(.3,fr.y)*step(fr.y,.75);
          amb += win * step(.7, h(g)) * 1.1;
        }
        float Ivis = a*amb*1.4 + ev + a*hl + flash*(litR*1.6 + a*irr*.12);
        float Iir = irOn*lit + .5*a*amb + ei + .6*a*hl + flash*(litR + a*irr*.12) + key + .035*n(vP.xy*2.3+vP.z);
        // eye view: dark night, warm sodium/white lights; coloured lights keep their tint
        float hv = 1. - exp(-Ivis*1.5);
        vec3 eye = vec3(.012,.016,.04) + hv*vec3(.92,.86,.74);
        if (kind > 3.5) eye = vec3(.012,.016,.04) + tint*(1.-exp(-ev*2.));
        // sensor view
        float x = 1. - exp(-Iir*1.25);
        float dist = length(camPos - vP);
        x *= mix(1., .55, smoothstep(28., 75., dist));
        x += (h(gl_FragCoord.xy + t) - .5) * .02;
        vec3 sen = ironbow(x);
        vec2 uv = gl_FragCoord.xy / res;
        float m = step(1. - uv.y, sweep) * step(splitX, uv.x);
        vec3 c = mix(eye, sen, m);
        gl_FragColor = vec4(pow(clamp(c, 0., 1.), vec3(2.2)), 1.);
      }`,
  });

/** Fixed false-colour value with simple key shading (macro worlds). shade 0 = flat (self-lit). */
const flatMat = (S: Shared, x: number, shade = 1, glass = 0, map: THREE.Texture | null = null, lo = 0, hi = 1) =>
  new THREE.ShaderMaterial({
    uniforms: { ...S, xv: { value: x }, shade: { value: shade }, glass: { value: glass }, map: { value: map }, useMap: { value: map ? 1 : 0 }, lo: { value: lo }, hi: { value: hi } },
    vertexShader: VERT,
    transparent: glass > 0,
    depthWrite: glass === 0,
    fragmentShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec2 vUv;
      uniform float xv, shade, glass, useMap, lo, hi, t; uniform vec3 camPos; uniform sampler2D map;
      ${IRONBOW}
      ${NOISE}
      void main(){
        vec3 N = normalize(vN); vec3 V = normalize(camPos - vP);
        float x = xv;
        if (useMap > .5) x = mix(lo, hi, texture2D(map, vUv).r);
        float k = max(dot(N, normalize(vec3(-.4,.8,.6))),0.);
        x *= mix(1., .55 + .45*k, shade);
        float fr = pow(1. - abs(dot(N,V)), 2.);
        x += glass * fr * .55;
        x += (h(gl_FragCoord.xy + t) - .5) * .02;
        float alpha = glass > 0. ? clamp(.25 + fr*.7, 0., 1.) * glass : 1.;
        gl_FragColor = vec4(pow(ironbow(x), vec3(2.2)), alpha);
      }`,
  });

const ringMat = () =>
  new THREE.ShaderMaterial({
    uniforms: { alpha: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; uniform float alpha;
      void main(){ gl_FragColor = vec4(pow(vec3(.97,.62,.2), vec3(2.2)) * alpha, alpha); }`,
  });

const plateTexture = (bg: string, fg: string, stroke: number) => {
  const cv = document.createElement("canvas");
  cv.width = 1024; cv.height = 280; // drawn large, sampled without mips (mips grey out the characters)
  const g = cv.getContext("2d")!;
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 280);
  g.strokeStyle = fg; g.lineWidth = 14; g.strokeRect(14, 14, 996, 252);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `600 170px '${FONT}'`;
  if (stroke > 0) { g.lineWidth = stroke; g.lineJoin = "round"; g.strokeStyle = fg; g.strokeText(PLATE, 512, 128); }
  g.fillText(PLATE, 512, 128);
  g.font = `600 52px '${FONT}'`;
  g.fillText("08 · 29", 512, 236);
  const tex = new THREE.CanvasTexture(cv);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  return tex;
};

const extrudeProfile = (pts: [number, number][], width: number, bevel: number) => {
  const sh = new THREE.Shape();
  sh.moveTo(...pts[0]);
  pts.slice(1).forEach((p) => sh.lineTo(...p));
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, steps: 1 });
  geo.translate(-2.31, 0, -width / 2);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
};

// cylinder between two points (rays, arm)
const Beam: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r: number; mat: THREE.Material; geo: THREE.BufferGeometry }> = ({ a, b, r, mat, geo }) => {
  const len = a.distanceTo(b);
  if (len < 1e-3) return null;
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return <mesh geometry={geo} material={mat} position={mid} quaternion={q} scale={[r, len, r]} />;
};

const lookQuat = (from: V3, to: V3) => {
  const o = new THREE.Object3D();
  o.position.set(...from);
  o.lookAt(...to);
  return o.quaternion.clone();
};

export const World: React.FC<{ s: WorldState }> = ({ s }) => {
  const { gl, scene, camera, size } = useThree();
  const S = useMemo(makeShared, []);
  const tex = useMemo(() => ({ plate: plateTexture("#fff", "#0b0b0b", 16), oldPlate: plateTexture("#0b0b0b", "#d8d8d8", 0) }), []);
  const M = useMemo(() => ({
    asphalt: streetMat(S, { albedo: 0.34, kind: 1 }),
    paint: streetMat(S, { albedo: 0.42, retro: 0.9, kind: 1 }),
    curb: streetMat(S, { albedo: 0.42 }),
    walk: streetMat(S, { albedo: 0.3, kind: 1 }),
    building: streetMat(S, { albedo: 0.16, kind: 3 }),
    body: streetMat(S, { albedo: 0.3, kind: 2 }),
    dark: streetMat(S, { albedo: 0.04 }),
    rim: streetMat(S, { albedo: 0.35 }),
    head: streetMat(S, { albedo: 0.3, ev: 2.6, ei: 2.6 }),
    plate: streetMat(S, { albedo: 1.0, retro: 1.4, map: tex.plate }),
    pole: streetMat(S, { albedo: 0.32 }),
    steel: streetMat(S, { albedo: 0.5 }),
    glass: streetMat(S, { albedo: 0.05, retro: 0.3 }),
    lampHead: streetMat(S, { albedo: 0.3, ev: 1.6, ei: 0.35, kind: 4, tint: [1, 0.78, 0.45] }),
    red: streetMat(S, { albedo: 0.2, ev: 1.2, ei: 0.2, kind: 4, tint: [1, 0.12, 0.08] }),
    led: streetMat(S, { albedo: 0.2, kind: 5 }),
    // macro
    alu: flatMat(S, 0.3),
    binder: flatMat(S, 0.5),
    bead: flatMat(S, 0.42, 1, 1),
    coat: flatMat(S, 0.2, 0, 0.45),
    ink: flatMat(S, 0.06),
    rayIn: flatMat(S, 0.74, 0),
    rayOut: flatMat(S, 0.97, 0),
    srcBox: flatMat(S, 0.4),
    newPlate: flatMat(S, 1, 0, 0, tex.plate, 0.07, 0.93),
    oldPlate: flatMat(S, 1, 0, 0, tex.oldPlate, 0.1, 0.55),
    backing: flatMat(S, 0.12),
    ring0: ringMat(), ring1: ringMat(), ring2: ringMat(), ring3: ringMat(), ring4: ringMat(),
    pulse: flatMat(S, 1, 0),
  }), [S, tex]);
  const G = useMemo(() => ({
    body: extrudeProfile([[0, 0.3], [0.02, 0.62], [0.18, 0.8], [1.35, 0.92], [4.45, 0.95], [4.62, 0.74], [4.6, 0.3]], 1.6, 0.12),
    cabin: extrudeProfile([[1.42, 0.9], [2.32, 1.36], [3.3, 1.38], [4.02, 0.92]], 1.22, 0.1),
    box: new THREE.BoxGeometry(1, 1, 1),
    rbox: new RoundedBoxGeometry(1, 1, 1, 3, 0.18),
    wheel: new THREE.CylinderGeometry(0.34, 0.34, 0.24, 28),
    hub: new THREE.CylinderGeometry(0.2, 0.2, 0.25, 20),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 14),
    plane: new THREE.PlaneGeometry(1, 1),
    pole: new THREE.CylinderGeometry(0.11, 0.14, 1, 14),
    sphere: new THREE.SphereGeometry(1, 32, 20),
    led: new THREE.SphereGeometry(1, 10, 8),
    ring: new THREE.RingGeometry(0.92, 1, 48),
  }), []);

  const chain = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(1);
    composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.34, 0.32, 0.84);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    return { composer, bloom };
  }, [gl, scene, camera, size.width, size.height]);

  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...s.cam.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(...s.cam.target);
    cam.fov = s.cam.fov; cam.near = 0.1; cam.far = 400;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    gl.toneMapping = THREE.NoToneMapping;
    S.camPos.value.set(...s.cam.pos);
    S.irOn.value = s.irOn; S.flash.value = s.flash; S.sweep.value = s.sweep; S.splitX.value = s.splitX;
    S.res.value.set(size.width, size.height);
    S.t.value = Math.round(s.t * 30) % 97;
    S.carPos.value.set(s.car.x, 0, s.car.z);
    S.fill.value = s.fill ?? 0;
    chain.bloom.strength = s.bloom ?? 0.34;
    if (s.cam.shift) cam.setViewOffset(size.width, size.height, (-s.cam.shift[0] * size.width) / 1080, (-s.cam.shift[1] * size.height) / 1920, size.width, size.height);
    else cam.clearViewOffset();
  }, [camera, gl, S, M, s, size.width, size.height, chain]);
  useFrame(() => chain.composer.render(), 1);

  if (s.world === "none") return <color attach="background" args={["#030108"]} />;
  if (s.world === "macro") return <Macro s={s} M={M} G={G} />;
  if (s.world === "compare") return <Compare s={s} M={M} G={G} />;
  return <Street s={s} M={M} G={G} />;
};

type Ms = Record<string, THREE.ShaderMaterial>;
type Gs = Record<string, THREE.BufferGeometry>;

const Car: React.FC<{ M: Ms; G: Gs; plate?: boolean; heads?: boolean }> = ({ M, G, plate = true, heads = true }) => (
  <>
    <mesh geometry={G.body} material={M.body} />
    <mesh geometry={G.cabin} material={M.body} />
    {[[-0.86, 1.45], [0.86, 1.45], [-0.86, -1.5], [0.86, -1.5]].map(([x, z], i) => (
      <group key={i} position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={G.wheel} material={M.dark} />
        <mesh geometry={G.hub} material={M.rim} />
      </group>
    ))}
    {heads ? [-0.6, 0.6].map((x) => <mesh key={x} geometry={G.rbox} material={M.head} position={[x, 0.73, 2.29]} scale={[0.44, 0.15, 0.12]} />) : null}
    {/* grille between the headlights, under the hood line */}
    <mesh geometry={G.rbox} material={M.dark} position={[0, 0.71, 2.37]} scale={[0.72, 0.2, 0.06]} />
    {[0.65, 0.71, 0.77].map((y) => <mesh key={y} geometry={G.box} material={M.rim} position={[0, y, 2.41]} scale={[0.64, 0.016, 0.02]} />)}
    {[-1, 1].map((sx) => <mesh key={sx} geometry={G.rbox} material={M.body} position={[sx * 0.98, 0.98, 0.78]} scale={[0.22, 0.13, 0.12]} />)}
    <mesh geometry={G.rbox} material={M.dark} position={[0, 0.2, 2.3]} scale={[1.5, 0.08, 0.12]} />
    {plate ? <mesh geometry={G.plane} material={M.plate} position={[PLATE_LOCAL[0], PLATE_LOCAL[1], PLATE_LOCAL[2]]} scale={[PLATE_W, PLATE_H, 1]} /> : null}
  </>
);

/** Box camera on the gantry: long housing with sun shield, glass front, lens; illuminator panel beside the lens. */
const BoxCam: React.FC<{ at: V3; M: Ms; G: Gs }> = ({ at, M, G }) => {
  const q = useMemo(() => lookQuat(at, AIM), [at]);
  return (
    <group position={at} quaternion={q}>
      <mesh geometry={G.rbox} material={M.steel} scale={[0.34, 0.3, 0.92]} />
      <mesh geometry={G.box} material={M.steel} position={[0, 0.19, 0.06]} scale={[0.44, 0.03, 1.08]} />
      <mesh geometry={G.plane} material={M.glass} position={[0, 0, 0.465]} scale={[0.28, 0.24, 1]} />
      <mesh geometry={G.cyl} material={M.dark} position={[0, 0, 0.44]} rotation={[Math.PI / 2, 0, 0]} scale={[0.085, 0.04, 0.085]} />
      <mesh geometry={G.cyl} material={M.rim} position={[0, 0, 0.43]} rotation={[Math.PI / 2, 0, 0]} scale={[0.11, 0.03, 0.11]} />
      {/* illuminator panel, beside the lens */}
      <group position={[-0.38, 0, 0.3]}>
        <mesh geometry={G.rbox} material={M.steel} scale={[0.32, 0.3, 0.12]} />
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} geometry={G.led} material={M.led} position={[-0.105 + (i % 4) * 0.07, -0.105 + Math.floor(i / 4) * 0.07, 0.065]} scale={0.022} />
        ))}
      </group>
      {/* bracket up to the arm */}
      <mesh geometry={G.box} material={M.pole} position={[0, 0.42, -0.1]} scale={[0.06, 0.5, 0.06]} />
    </group>
  );
};

const Street: React.FC<{ s: WorldState; M: Ms; G: Gs }> = ({ s, M, G }) => {
  const dashes: React.ReactNode[] = [];
  for (const x of [-3.5, 3.5]) {
    for (let z = -1; z < 40; z += 4.5) dashes.push(<mesh key={`d${x}${z}`} geometry={G.box} material={M.paint} position={[x, 0.012, z]} scale={[0.15, 0.02, 2.4]} />);
    for (let z = -20; z > -90; z -= 4.5) dashes.push(<mesh key={`e${x}${z}`} geometry={G.box} material={M.paint} position={[x, 0.012, z]} scale={[0.15, 0.02, 2.4]} />);
  }
  const zebra = (z0: number) => Array.from({ length: 10 }, (_, i) => (
    <mesh key={`z${z0}${i}`} geometry={G.box} material={M.paint} position={[-6.2 + i * 1.38, 0.012, z0]} scale={[0.72, 0.02, 2.6]} />
  ));
  const zebraX = (x0: number) => Array.from({ length: 8 }, (_, i) => (
    <mesh key={`zx${x0}${i}`} geometry={G.box} material={M.paint} position={[x0, 0.012, -14 + i * 1.5]} scale={[2.6, 0.02, 0.75]} />
  ));
  // data pulse: lens -> along the arm -> down the pole
  let pulse: React.ReactNode = null;
  if (s.pulse >= 0) {
    const path = [new THREE.Vector3(CAM1[0], 6.78, CAM1[2]), new THREE.Vector3(8.2, 6.78, 13.8), new THREE.Vector3(8.2, 0.4, 13.55)];
    const l1 = path[0].distanceTo(path[1]), l2 = path[1].distanceTo(path[2]);
    const d = s.pulse * (l1 + l2);
    const p = d < l1 ? path[0].clone().lerp(path[1], d / l1) : path[1].clone().lerp(path[2], (d - l1) / l2);
    const trail = d < l1 ? [[path[0], p]] : [[path[0], path[1]], [path[1], p]];
    pulse = (
      <>
        <mesh geometry={G.sphere} material={M.pulse} position={p} scale={0.32} />
        {trail.map(([u, v], i) => <Beam key={i} a={u} b={v} r={0.09} mat={M.rayOut} geo={G.cyl} />)}
      </>
    );
  }
  return (
    <>
      <color attach="background" args={["#030108"]} />
      <mesh geometry={G.plane} material={M.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} scale={[14, 200, 1]} />
      <mesh geometry={G.plane} material={M.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -9]} scale={[200, 12, 1]} />
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => {
        const cz = sz > 0 ? 25 : -55;
        const len = sz > 0 ? 48 : 80;
        return (
          <group key={i}>
            <mesh geometry={G.box} material={M.walk} position={[sx * 30, 0.08, cz]} scale={[46, 0.16, len]} />
            <mesh geometry={G.box} material={M.curb} position={[sx * 7.1, 0.1, cz]} scale={[0.25, 0.2, len]} />
          </group>
        );
      })}
      {dashes}
      <mesh geometry={G.box} material={M.paint} position={[-0.12, 0.012, 15]} scale={[0.12, 0.02, 30]} />
      <mesh geometry={G.box} material={M.paint} position={[0.12, 0.012, 15]} scale={[0.12, 0.02, 30]} />
      <mesh geometry={G.box} material={M.paint} position={[-0.12, 0.012, -55]} scale={[0.12, 0.02, 70]} />
      <mesh geometry={G.box} material={M.paint} position={[0.12, 0.012, -55]} scale={[0.12, 0.02, 70]} />
      <mesh geometry={G.box} material={M.paint} position={[3.5, 0.012, -18.2]} scale={[7, 0.02, 0.45]} />
      <mesh geometry={G.box} material={M.paint} position={[-3.5, 0.012, 1.6]} scale={[7, 0.02, 0.45]} />
      {zebra(-0.5)}
      {zebra(-17.5)}
      {zebraX(-9)}
      {zebraX(9)}
      {[[-17, -30, 18, 14, 22], [16, -32, 16, 20, 20], [-15, 22, 14, 10, 18], [24, 18, 16, 16, 24], [-8, -66, 20, 26, 14], [12, -70, 14, 30, 16], [-16, -50, 12, 18, 14]].map(([x, z, w, h, d], i) => (
        <mesh key={`b${i}`} geometry={G.box} material={M.building} position={[x, h / 2, z]} scale={[w, h, d]} />
      ))}
      {/* street lamps */}
      {[[-8.2, -8.8], [8.4, -17], [-8.2, 24], [8.4, -40], [-8.2, -40]].map(([x, z], i) => (
        <group key={`p${i}`} position={[x, 0, z]}>
          <mesh geometry={G.pole} material={M.pole} position={[0, 4.5, 0]} scale={[1, 9, 1]} />
          <mesh geometry={G.box} material={M.pole} position={[x < 0 ? 0.9 : -0.9, 8.95, 0]} scale={[1.9, 0.1, 0.12]} />
          <mesh geometry={G.rbox} material={M.lampHead} position={[x < 0 ? 1.8 : -1.8, 8.85, 0]} scale={[0.7, 0.16, 0.34]} />
        </group>
      ))}
      {/* far-side signal gantry */}
      <group position={[6.6, 0, -17.2]}>
        <mesh geometry={G.pole} material={M.pole} position={[0, 3.2, 0]} scale={[1, 6.4, 1]} />
        <mesh geometry={G.box} material={M.pole} position={[-3.6, 6.1, 0]} scale={[7.2, 0.16, 0.16]} />
        {[-2.2, -5.4].map((x) => (
          <group key={x} position={[x, 5.5, 0]}>
            <mesh geometry={G.rbox} material={M.dark} scale={[0.5, 1.3, 0.42]} />
            {[0.4, 0, -0.4].map((y, k) => <mesh key={k} geometry={G.hub} material={k === 0 ? M.red : M.dark} position={[0, y, 0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.7, 0.3, 0.7]} />)}
          </group>
        ))}
      </group>
      {/* ETLE-style gantry: pole on the right sidewalk, arm over the approach lanes, two box cameras */}
      <group>
        <mesh geometry={G.cyl} material={M.pole} position={[8.2, 3.3, 13.8]} scale={[0.17, 6.6, 0.17]} />
        <mesh geometry={G.box} material={M.pole} position={[4.6, 6.5, 13.8]} scale={[7.4, 0.2, 0.2]} />
        <mesh geometry={G.box} material={M.pole} position={[8.2, 0.35, 13.8]} scale={[0.6, 0.7, 0.45]} />
        <BoxCam at={CAM1} M={M} G={G} />
        <BoxCam at={CAM2} M={M} G={G} />
        {pulse}
      </group>
      {s.rings >= 0 ? <Rings phase={s.rings} M={M} G={G} /> : null}
      {/* hero car (faces +z, toward the gantry) */}
      <group position={[s.car.x, 0, s.car.z]} rotation={[0, s.car.yaw, 0]}>
        <Car M={M} G={G} />
      </group>
      {/* traffic for depth */}
      {s.t < 7 ? <group position={[-9 + s.t * 1.2, 0, -14.6]} rotation={[0, Math.PI / 2, 0]}><Car M={M} G={G} plate={false} /></group> : null}
      <group position={[-1.9, 0, -44 + s.t * 0.4]} rotation={[0, Math.PI, 0]}><Car M={M} G={G} plate={false} heads={false} /></group>
      <group position={[5.2, 0, -62 + s.t * 0.5]}><Car M={M} G={G} plate={false} /></group>
    </>
  );
};

/** Illuminator output drawn as translucent wave fronts travelling toward the road (didactic: IR is invisible). */
const Rings: React.FC<{ phase: number; M: Ms; G: Gs }> = ({ phase, M, G }) => {
  const from = new THREE.Vector3(LAMP[0], LAMP[1], LAMP[2] + 0.4);
  const dir = new THREE.Vector3(...AIM).sub(from).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const k = ((phase * 0.55 + i / 5) % 1 + 1) % 1;
        const p = from.clone().add(dir.clone().multiplyScalar(0.3 + k * 9));
        const m = M[`ring${i}`];
        m.uniforms.alpha.value = 0.3 * Math.sin(Math.PI * k) * Math.min(1, phase * 2);
        return <mesh key={i} geometry={G.ring} material={m} position={p} quaternion={q} scale={0.25 + k * 2.6} />;
      })}
    </>
  );
};

// cross-section of retroreflective sheeting: aluminium, binder with glass beads, clear top coat
export const BEAD_SRC = new THREE.Vector3(-0.3, 0.954, 0).normalize();
export const BEAD_X = [-4.8, -3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6, 4.8];
export const BEAD_HITS = [-2.4, 0, 2.4];
const Macro: React.FC<{ s: WorldState; M: Ms; G: Gs }> = ({ s, M, G }) => {
  const perp = new THREE.Vector3(BEAD_SRC.y, -BEAD_SRC.x, 0).multiplyScalar(0.2);
  return (
    <>
      <color attach="background" args={["#05020F"]} />
      <mesh geometry={G.box} material={M.alu} position={[0, -1.7, 0]} scale={[14, 1.0, 3.2]} />
      <mesh geometry={G.box} material={M.binder} position={[0, -0.75, 0]} scale={[14, 0.9, 3.2]} />
      {BEAD_X.map((x) => [-0.8, 0.4].map((z) => <mesh key={`${x}${z}`} geometry={G.sphere} material={M.bead} position={[x + (z > 0 ? 0.3 : 0), -0.2, z]} scale={0.55} />))}
      <mesh geometry={G.box} material={M.coat} position={[0, 0.75, 0]} scale={[14, 1.4, 3.2]} />
      {BEAD_HITS.map((x, i) => {
        const hit = new THREE.Vector3(x, 0.25, 0);
        const src = hit.clone().add(BEAD_SRC.clone().multiplyScalar(12));
        const inEnd = src.clone().lerp(hit, s.beadIn);
        const back = hit.clone().add(perp);
        const outEnd = back.clone().add(BEAD_SRC.clone().multiplyScalar(12 * s.beadOut));
        return (
          <group key={i}>
            <Beam a={src} b={inEnd} r={0.05} mat={M.rayIn} geo={G.cyl} />
            {s.beadOut > 0 ? <Beam a={back} b={outEnd} r={0.07} mat={M.rayOut} geo={G.cyl} /> : null}
            {s.beadIn > 0.98 ? <mesh geometry={G.sphere} material={M.rayOut} position={hit} scale={0.14 + 0.05 * s.beadOut} /> : null}
          </group>
        );
      })}
      {/* the source: the camera's illuminator, up the beam */}
      <mesh geometry={G.rbox} material={M.srcBox} position={BEAD_SRC.clone().multiplyScalar(12.6)} scale={[1.6, 0.9, 1]} />
    </>
  );
};

const Compare: React.FC<{ s: WorldState; M: Ms; G: Gs }> = ({ s, M, G }) => (
  <>
    <color attach="background" args={["#05020F"]} />
    <group position={[0, 2.6, 0]}>
      <mesh geometry={G.box} material={M.backing} position={[0, 0, -0.08]} scale={[4.5, 1.45, 0.12]} />
      <mesh geometry={G.plane} material={M.oldPlate} scale={[4.3, 1.26, 1]} />
    </group>
    <group position={[0, 0.1 - (1 - s.newPlate) * 0.6, 0]} rotation={[(1 - s.newPlate) * 1.2, 0, 0]}>
      <mesh geometry={G.box} material={M.backing} position={[0, 0, -0.08]} scale={[4.5, 1.45, 0.12]} />
      <mesh geometry={G.plane} material={M.newPlate} scale={[4.3, 1.26, 1]} />
    </group>
  </>
);

/** World position of a point given in a box camera's local frame (e.g. its lens or illuminator). */
export const camLocal = (at: V3, local: V3) => new THREE.Vector3(...local).applyQuaternion(lookQuat(at, AIM)).add(new THREE.Vector3(...at));
