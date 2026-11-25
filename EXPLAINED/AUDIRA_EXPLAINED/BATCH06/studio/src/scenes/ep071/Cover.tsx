// AE-071 cover — THERMALFORGE. A cutaway office block seen through a thermal camera: one compartment on a
// middle floor burns white-yellow, the rooms around it stay violet-blue because the fire-rated walls, floor
// slabs and the closed fire door (closer arm on top) hold the heat in. Only the sprinkler head above the fire
// sprays; the other heads stay dry. Building is fictional; no people. "60 MENIT" is an example rating
// (RESEARCH_REPORT: ratings are time-limited, never "forever").
// Ironbow is the false-colour scale of a single temperature field computed in the shader.

import React, { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const C = { black: "#0A0A10", violet: "#310E68", magenta: "#9B1D8C", amber: "#EA5E28", yellow: "#F7D038", white: "#FFFFFF", cyan: "#00E5FF" };
const BG = "#05030C";

// ---------- building grid ----------
const BAY = 4.4; // bay pitch (room 4.0 + wall 0.4)
const FL = 3.6; // floor-to-floor (slab 0.35)
const SLAB = 0.35;
const DEPTH = 5.0;
const BAYS = [-2, -1, 0, 1, 2];
const FLOORS = [-4, -3, -2, -1, 0, 1];
const HOT = { min: new THREE.Vector3(-2.0, 0, -DEPTH), max: new THREE.Vector3(2.0, FL - SLAB, 0) };
const FIRE = new THREE.Vector3(0.5, 0.35, -2.7);
const SPRINK = new THREE.Vector3(FIRE.x, FL - SLAB - 0.32, FIRE.z);
const DOOR_X = -1.15; // door centre offset inside each bay (back wall)

const CAM = { pos: new THREE.Vector3(8.5, 5.4, 26), target: new THREE.Vector3(-0.5, -0.65, -2.5), fov: 34 };

const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---------- the single temperature field, Ironbow false colour ----------
const IRONBOW = /* glsl */ `vec3 ironbow(float x){ x = clamp(x,0.,1.);
  vec3 c0=vec3(.012,.008,.045), c1=vec3(.17,.03,.40), c2=vec3(.58,.09,.53), c3=vec3(.92,.36,.15), c4=vec3(.97,.80,.22), c5=vec3(1.,.98,.9);
  if(x<.2) return mix(c0,c1,x/.2);
  if(x<.42) return mix(c1,c2,(x-.2)/.22);
  if(x<.62) return mix(c2,c3,(x-.42)/.2);
  if(x<.84) return mix(c3,c4,(x-.62)/.22);
  return mix(c4,c5,(x-.84)/.16); }`;

const FIELD = /* glsl */ `
  uniform vec3 hotMin, hotMax, fire;
  float hsh(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x), mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),f.x), f.y); }
  float sdBox(vec3 p, vec3 lo, vec3 hi){ vec3 c=(lo+hi)*.5, h=(hi-lo)*.5; vec3 q=abs(p-c)-h; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
  // air temperature at q (0 = coldest on the scale, 1 = hottest)
  float roomT(vec3 q){
    float dh = sdBox(q, hotMin, hotMax);
    if (dh < 0.) {
      float hy = (q.y - hotMin.y) / (hotMax.y - hotMin.y);
      vec3 df = q - fire;
      return 0.5 + 0.34*smoothstep(0.15, 0.95, hy) + 0.3*exp(-dot(df,df)/2.4) + 0.05*vn(q.xz*1.3 + q.y);
    }
    bool inside = q.z < 0.02 && q.z > -${DEPTH.toFixed(1)} && abs(q.x) < 11. && q.y < ${(2 * FL).toFixed(2)};
    if (!inside) return 0.035 + 0.02*smoothstep(-12., 8., q.y);
    vec2 cell = floor(vec2((q.x + ${(BAY / 2).toFixed(2)}) / ${BAY.toFixed(2)}, q.y / ${FL.toFixed(2)}));
    float hy = fract(q.y / ${FL.toFixed(2)});
    return 0.15 + 0.05*hsh(cell) + 0.035*hy + 0.03*vn(q.xz*.8);
  }
  float surfT(vec3 p, vec3 n){
    float t = roomT(p + n*0.16);
    // heat soaked into the rated wall / slab itself, falling off fast through its thickness
    float dw = max(sdBox(p, hotMin, hotMax), 0.);
    return max(t, 0.6*exp(-dw/0.26));
  }`;

type MatOpts = { emis?: number; add?: number; fixed?: number; map?: THREE.Texture | null; mapGain?: number };
const makeMat = ({ emis = 1, add = 0, fixed = -1, map = null, mapGain = 0 }: MatOpts) =>
  new THREE.ShaderMaterial({
    uniforms: {
      emis: { value: emis }, add: { value: add }, fixT: { value: fixed }, map: { value: map }, useMap: { value: map ? 1 : 0 }, mapGain: { value: mapGain },
      hotMin: { value: HOT.min }, hotMax: { value: HOT.max }, fire: { value: FIRE }, t: { value: 0 },
    },
    vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec2 vUv;
      void main(){ vec4 m = modelMatrix*vec4(position,1.); vP = m.xyz; vUv = uv;
        vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*m; }`,
    fragmentShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec2 vUv;
      uniform float emis, add, fixT, useMap, mapGain, t; uniform sampler2D map;
      ${IRONBOW}
      ${FIELD}
      void main(){
        vec3 N = normalize(vN);
        float x = fixT >= 0. ? fixT : surfT(vP, N) * emis + add;
        if (useMap > .5) x += mapGain * texture2D(map, vUv).r;
        // a little form shading so the cutaway reads as 3D (thermal images are nearly flat)
        float ndl = dot(N, normalize(vec3(-0.45, 0.75, 0.55)));
        x *= 0.84 + 0.16*ndl;
        x += (hsh(gl_FragCoord.xy*0.37 + t) - .5) * .018;
        gl_FragColor = vec4(pow(ironbow(x), vec3(2.2)), 1.);
      }`,
  });

// flame tongue: teardrop lathe with curling tip, additive and layered (outer, mid, core), on FX_LAYER
const makeFlameMat = (seed: number, hot: number, gain: number) =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { t: { value: 0 }, seed: { value: seed }, hot: { value: hot }, gain: { value: gain } },
    vertexShader: /* glsl */ `varying float vH; varying vec3 vN; varying vec3 vV; uniform float t, seed;
      void main(){ float h = clamp(position.y, 0., 1.); vH = h;
        float ang = uv.x*6.2831853; vec2 dir = vec2(sin(ang), cos(ang));
        float R = pow(1.-h, 0.85) * (0.45 + 0.75*sin(min(h*2.4, 1.)*1.5708));
        R *= 1. + 0.14*sin(ang*3. + h*7. - t*0.31 + seed*2.) + 0.08*sin(ang*5. - h*11. + t*0.23 + seed);
        vec3 p = vec3(dir.x*R, h, dir.y*R);
        float sway = sin(t*0.09 + seed*1.7);
        p.x += h*h*(0.55*sway) + sin(h*6.5 - t*0.27 + seed*3.)*0.09*h;
        p.z += h*h*0.3*cos(t*0.07 + seed);
        vN = normalize(normalMatrix*vec3(dir.x, 0.35, dir.y));
        vec4 mv = modelViewMatrix*vec4(p,1.); vV = -mv.xyz;
        gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `varying float vH; varying vec3 vN; varying vec3 vV; uniform float hot, gain; ${IRONBOW}
      void main(){ float fres = abs(dot(normalize(vN), normalize(vV)));
        float a = pow(fres, 1.3) * smoothstep(1., 0.62, vH) * smoothstep(0., 0.06, vH) * gain;
        float x = hot - 0.34*pow(vH, 1.3);
        gl_FragColor = vec4(pow(ironbow(x), vec3(2.2)) * a * 1.6, 1.); }`,
  });

// rising heat shimmer under the hot ceiling (FX_LAYER, additive)
const makeShimmerMat = () =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; uniform float t;
      void main(){ float y = vUv.y;
        float w = sin(vUv.x*23. + sin(y*9. - t*0.2)*2.2 + t*0.05) * sin(vUv.x*9. - y*5. + t*0.11);
        float band = 0.5 + 0.5*w;
        float a = smoothstep(0.15, 1., y) * (0.35 + 0.65*band) * smoothstep(0., 0.12, vUv.x) * smoothstep(1., 0.88, vUv.x) * 0.32;
        gl_FragColor = vec4(vec3(1.0, .78, .38) * a, 1.); }`,
  });

// soft additive bloom of the hot gas; on FX_LAYER so AO never sees it
const makeGlowMat = (strength: number) =>
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { s: { value: strength } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; uniform float s;
      void main(){ vec2 d = vUv - .5; float r = length(d*vec2(1.,1.25)); float a = exp(-r*r*14.) * s;
        gl_FragColor = vec4(vec3(1.0, .55, .16) * a, 1.); }`,
  });

const makePlateTexture = (lines: string[], w = 1024, h = 300) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#fff"; g.lineWidth = 12; g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `600 ${Math.round(h * 0.46)}px '${FONT}'`;
  g.fillText(lines[0], w / 2, lines[1] ? h * 0.42 : h / 2);
  if (lines[1]) { g.font = `500 ${Math.round(h * 0.14)}px '${FONT}'`; g.fillText(lines[1], w / 2, h * 0.78); }
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 8;
  return tex;
};

const fx = (m: THREE.Object3D | null) => m && m.layers.set(FX_LAYER);

// flame tongues around the sofa: [x, z, radius, height]
const FLAMES: [number, number, number, number][] = [[0, 0, 0.55, 2.1], [-0.55, 0.12, 0.42, 1.55], [0.6, -0.08, 0.45, 1.75], [0.18, 0.3, 0.34, 1.3], [-0.25, -0.28, 0.4, 1.85], [0.9, 0.18, 0.3, 1.1], [-0.85, -0.05, 0.32, 1.2], [0.35, -0.3, 0.36, 1.45], [-0.5, 0.35, 0.28, 0.95]];
// seeded far city (background plane)
const CITY = (() => { const r = rng(4071); return Array.from({ length: 30 }, (_, i) => ({ x: -70 + i * 4.8 + (r() - 0.5) * 3, z: -75 - r() * 30, w: 5 + r() * 8, top: 15 + r() * 17, m: Math.floor(r() * 3) })); })();
// camera-locked foreground (blurred by DOF): nearest column, slab edge and sprinkler pipe, bottom-right
const CamLocked: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const q = useMemo(() => { const m = new THREE.Matrix4().lookAt(CAM.pos, CAM.target, new THREE.Vector3(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(m); }, []);
  return <group position={CAM.pos} quaternion={q}>{children}</group>;
};

const Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const plate = useMemo(() => makePlateTexture(["AUDIRA", "LANTAI 05 · KOMPARTEMEN B"]), []);
  const M = useMemo(() => ({
    concrete: makeMat({}),
    slabEdge: makeMat({ emis: 1.02 }),
    door: makeMat({ emis: 0.93 }),
    metal: makeMat({ emis: 0.5 }), // bare metal: low emissivity reads cooler on a thermal camera
    furn: makeMat({ emis: 1.03 }),
    soft: makeMat({ emis: 1.06 }),
    monitor: makeMat({ add: 0.17 }),
    lamp: makeMat({ add: 0.22 }),
    plate: makeMat({ emis: 0.98, map: plate, mapGain: 0.5 }),
    spray: makeMat({ fixed: 0.36 }),
    sky: makeMat({ emis: 0.8 }),
    skyBg: makeMat({ fixed: 0.105 }),
    city: [0.16, 0.2, 0.24].map((v) => makeMat({ fixed: v })),
    fg: makeMat({ fixed: 0.2 }),
    fgMetal: makeMat({ fixed: 0.12 }),
    flames: FLAMES.flatMap((_, i) => [makeFlameMat(i * 1.37, 0.82, 0.32), makeFlameMat(i * 1.37 + 0.3, 0.93, 0.36), makeFlameMat(i * 1.37 + 0.6, 1.02, 0.5)]),
    shimmer: makeShimmerMat(),
    glowBig: makeGlowMat(0.55),
    glowCore: makeGlowMat(0.9),
  }), [plate]);
  const G = useMemo(() => ({
    box: new THREE.BoxGeometry(1, 1, 1),
    rbox: new RoundedBoxGeometry(1, 1, 1, 3, 0.12),
    rboxSoft: new RoundedBoxGeometry(1, 1, 1, 4, 0.3),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
    cone: (() => { const g = new THREE.ConeGeometry(1, 1, 20, 12, true); g.translate(0, 0.5, 0); return g; })(),
    plane: new THREE.PlaneGeometry(1, 1),
    sphere: new THREE.SphereGeometry(1, 16, 12),
  }), []);

  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(CAM.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(CAM.target);
    cam.fov = CAM.fov; cam.near = 0.5; cam.far = 400;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(FX_LAYER);
    const tt = frame % 97;
    [M.concrete, M.slabEdge, M.door, M.metal, M.furn, M.soft, M.monitor, M.lamp, M.plate, M.spray, M.sky].forEach((m) => (m.uniforms.t.value = tt));
    M.flames.forEach((m) => (m.uniforms.t.value = frame + 40));
    M.shimmer.uniforms.t.value = frame + 40;
  }, [camera, M, frame]);

  // spray droplets from the one open head (seeded, frame-driven)
  const spray = useMemo(() => {
    const r = rng(71);
    return Array.from({ length: 56 }, () => {
      const az = r() * Math.PI * 2;
      const pol = 0.15 + r() * 0.95; // umbrella: wide cone
      const dir = new THREE.Vector3(Math.sin(pol) * Math.cos(az), -Math.cos(pol), Math.sin(pol) * Math.sin(az)).normalize();
      return { dir, phase: r(), len: 0.18 + r() * 0.3, speed: 0.012 + r() * 0.01 };
    });
  }, []);

  const rooms: React.ReactNode[] = [];
  FLOORS.forEach((f) => BAYS.forEach((b) => {
    const cx = b * BAY, y0 = f * FL;
    const hot = f === 0 && b === 0;
    const r = rng(1000 + f * 17 + b * 5);
    const k = `${f}_${b}`;
    // fire door on the back wall + closer arm on the room (pull) side + frame
    rooms.push(
      <group key={`d${k}`} position={[cx + DOOR_X, y0, -DEPTH + 0.06]}>
        <mesh geometry={G.box} material={M.metal} position={[0, 1.1, -0.02]} scale={[1.18, 2.3, 0.1]} />
        <mesh geometry={G.rbox} material={M.door} position={[0, 1.06, 0.04]} scale={[0.98, 2.1, 0.08]} />
        <mesh geometry={G.rbox} material={M.metal} position={[0.34, 1.05, 0.12]} scale={[0.2, 0.05, 0.08]} />
        {/* overhead door closer: body on the door, arm to the frame */}
        <mesh geometry={G.rbox} material={M.metal} position={[-0.12, 2.0, 0.14]} scale={[0.46, 0.12, 0.12]} />
        <mesh geometry={G.box} material={M.metal} position={[0.18, 2.12, 0.16]} rotation={[0, 0, 0.18]} scale={[0.42, 0.035, 0.05]} />
        {/* vision panel */}
        <mesh geometry={G.box} material={M.metal} position={[0, 1.55, 0.085]} scale={[0.22, 0.36, 0.01]} />
      </group>,
    );
    // sprinkler pipe + head (every room has one; only the hot room's head is open)
    rooms.push(
      <group key={`s${k}`} position={[cx + (hot ? FIRE.x : -0.4), y0 + FL - SLAB, FIRE.z]}>
        <mesh geometry={G.cyl} material={M.metal} position={[0, -0.14, 0]} scale={[0.03, 0.28, 0.03]} />
        <mesh geometry={G.cyl} material={M.metal} position={[0, -0.3, 0]} scale={[0.05, 0.06, 0.05]} />
        <mesh geometry={G.cyl} material={M.metal} position={[0, -0.36, 0]} scale={[0.11, 0.015, 0.11]} />
      </group>,
    );
    // ceiling light panel
    rooms.push(<mesh key={`l${k}`} geometry={G.rbox} material={M.lamp} position={[cx - 0.9, y0 + FL - SLAB - 0.04, -2.0]} scale={[1.2, 0.06, 0.5]} />);
    if (hot) {
      // burning sofa + coffee table + shelf
      rooms.push(
        <group key="hotfurn" position={[FIRE.x, 0, FIRE.z]}>
          <mesh geometry={G.rboxSoft} material={M.soft} position={[0, 0.28, 0]} scale={[1.9, 0.5, 0.85]} />
          <mesh geometry={G.rboxSoft} material={M.soft} position={[0, 0.66, -0.36]} scale={[1.9, 0.62, 0.26]} />
          <mesh geometry={G.rboxSoft} material={M.soft} position={[-0.92, 0.48, 0]} scale={[0.24, 0.5, 0.85]} />
          <mesh geometry={G.rboxSoft} material={M.soft} position={[0.92, 0.48, 0]} scale={[0.24, 0.5, 0.85]} />
          <mesh geometry={G.rbox} material={M.furn} position={[0.3, 0.22, 1.25]} scale={[1.0, 0.08, 0.6]} />
        </group>,
        <mesh key="hotshelf" geometry={G.rbox} material={M.furn} position={[1.55, 1.0, -4.5]} scale={[0.8, 2.0, 0.45]} />,
      );
    } else {
      const dx = (r() - 0.5) * 0.8;
      rooms.push(
        <group key={`f${k}`} position={[cx - 0.5 + dx, y0, -2.6]}>
          <mesh geometry={G.rbox} material={M.furn} position={[0, 0.74, 0]} scale={[1.6, 0.06, 0.8]} />
          {[-0.72, 0.72].map((x) => <mesh key={x} geometry={G.box} material={M.metal} position={[x, 0.37, 0]} scale={[0.05, 0.74, 0.7]} />)}
          <mesh geometry={G.rbox} material={M.monitor} position={[0.1, 1.04, -0.22]} scale={[0.62, 0.38, 0.05]} />
          <mesh geometry={G.rbox} material={M.furn} position={[0.1 + (r() - 0.5) * 0.4, 0.5, 0.7]} scale={[0.5, 0.08, 0.5]} />
          <mesh geometry={G.rbox} material={M.furn} position={[0.1, 0.82, 0.95]} scale={[0.5, 0.6, 0.07]} />
        </group>,
        <mesh key={`sh${k}`} geometry={G.rbox} material={M.furn} position={[cx + 1.45, y0 + 0.95, -4.55]} scale={[0.75, 1.9, 0.42]} />,
      );
    }
  }));

  return (
    <>
      <color attach="background" args={[BG]} />
      {/* far skyline + cold night sky (background plane) */}
      <mesh geometry={G.plane} material={M.skyBg} position={[0, 30, -140]} scale={[420, 160, 1]} />
      {CITY.map((c, i) => (
        <mesh key={`city${i}`} geometry={G.box} material={M.city[c.m]} position={[c.x, (c.top - 20) / 2, c.z]} scale={[c.w, c.top + 20, 8]} />
      ))}
      <mesh geometry={G.plane} material={M.sky} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4 * FL - SLAB, -20]} scale={[200, 200, 1]} />

      {/* slabs (incl. roof) */}
      {[...FLOORS, 2].map((f) => (
        <mesh key={`slab${f}`} geometry={G.box} material={M.slabEdge} position={[0, f * FL - SLAB / 2, -DEPTH / 2 - 0.15]} scale={[22.4, SLAB, DEPTH + 0.3]} />
      ))}
      {/* roof parapet */}
      <mesh geometry={G.box} material={M.concrete} position={[0, 2 * FL + 0.45, -0.15]} scale={[22.4, 0.9, 0.3]} />
      {/* rated partitions between bays */}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((k) => (
        <mesh key={`w${k}`} geometry={G.box} material={M.concrete} position={[k * BAY, (2 * FL + -4 * FL - SLAB) / 2, -DEPTH / 2 - 0.15]} scale={[0.4, 6 * FL + SLAB, DEPTH + 0.3]} />
      ))}
      {/* back wall */}
      <mesh geometry={G.box} material={M.concrete} position={[0, (2 * FL - 4 * FL - SLAB) / 2, -DEPTH - 0.15]} scale={[22.4, 6 * FL + SLAB, 0.3]} />
      {/* in-world AUDIRA plate on the cold neighbour's back wall */}
      <mesh geometry={G.plane} material={M.plate} position={[-BAY - 1.0, 2.58, -DEPTH + 0.02]} scale={[2.3, 0.62, 1]} />

      {rooms}

      {/* fire: three additive layers per tongue */}
      <group position={[FIRE.x, 0.5, FIRE.z]}>
        {FLAMES.map(([x, z, rad, h], i) => [1, 0.68, 0.4].map((k, j) => (
          <mesh key={`fl${i}_${j}`} ref={fx} geometry={G.cone} material={M.flames[i * 3 + j]} position={[x, 0, z]} scale={[rad * k * 1.1, h * (0.55 + 0.45 * k), rad * k * 1.1]} />
        )))}
      </group>
      <mesh ref={fx} geometry={G.plane} material={M.shimmer} position={[0, 2.2, -0.8]} scale={[3.9, 1.9, 1]} />
      <mesh ref={fx} geometry={G.plane} material={M.glowBig} position={[0, 1.7, -1.2]} scale={[6.5, 4.6, 1]} />
      <mesh ref={fx} geometry={G.plane} material={M.glowCore} position={[FIRE.x, 1.0, FIRE.z + 0.8]} scale={[2.6, 2.4, 1]} />

      {/* spray umbrella: cooler water droplets under the open head */}
      {spray.map((s, i) => {
        const d = 0.25 + ((s.phase + frame * s.speed) % 1) * 2.1;
        const p = SPRINK.clone().addScaledVector(s.dir, d);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.dir);
        return <mesh key={`sp${i}`} geometry={G.cyl} material={M.spray} position={p} quaternion={q} scale={[0.01, s.len, 0.01]} />;
      })}

      <CamLocked>
        <mesh geometry={G.rbox} material={M.fg} position={[1.0, -1.1, -6]} scale={[0.5, 2.4, 0.55]} />
        <mesh geometry={G.rbox} material={M.fg} position={[0.95, -0.92, -6.4]} scale={[1.3, 0.32, 1.1]} />
        <mesh geometry={G.cyl} material={M.fgMetal} position={[0.95, -0.5, -5.7]} rotation={[0, 0, Math.PI / 2]} scale={[0.04, 1.0, 0.04]} />
        <mesh geometry={G.cyl} material={M.fgMetal} position={[0.62, -0.6, -5.7]} scale={[0.022, 0.2, 0.022]} />
        <mesh geometry={G.cyl} material={M.fgMetal} position={[0.62, -0.71, -5.7]} scale={[0.065, 0.012, 0.065]} />
      </CamLocked>

      <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao focus={CAM.pos.distanceTo(new THREE.Vector3(0, 1.6, -2.5))} aperture={0.0006} maxBlur={0.012} />
    </>
  );
};

// ---------- 2D HUD + title ----------
const project = (v: THREE.Vector3) => {
  const cam = new THREE.PerspectiveCamera(CAM.fov, 1080 / 1920, 0.5, 400);
  cam.position.copy(CAM.pos);
  cam.lookAt(CAM.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const p = v.clone().project(cam);
  return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 };
};

const Overlay: React.FC<{ frame: number }> = ({ frame }) => {
  const mono: React.CSSProperties = { fontFamily: `'${FONT}'`, fontVariantNumeric: "tabular-nums", letterSpacing: "0.14em" };
  // crosshair box around the hot compartment's front opening
  const pts = [[HOT.min.x, HOT.min.y], [HOT.max.x, HOT.min.y], [HOT.max.x, HOT.max.y], [HOT.min.x, HOT.max.y]].map(([x, y]) => project(new THREE.Vector3(x, y, 0)));
  const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const box = { x: minX + 6, y: minY + 6, w: maxX - minX - 12, h: maxY - minY - 12 };
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const sp = project(SPRINK);
  const door = project(new THREE.Vector3(DOOR_X, 1.3, -DEPTH + 0.2));
  const cold = project(new THREE.Vector3(-BAY - 0.6, 0.9, -1.4));
  const corner = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 44, height: 44, borderColor: C.cyan, borderStyle: "solid", borderWidth: 0, ...s }} />;
  const tag = (x: number, y: number, text: string, align: "left" | "right" = "left", color: string = C.cyan) => (
    <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? 1080 - x : undefined, top: y - 16, fontSize: 21, fontWeight: 600, color, whiteSpace: "nowrap", background: "#05020Fcc", padding: "5px 10px", border: `1.5px solid ${color}99`, ...mono, letterSpacing: "0.1em" }}>{text}</div>
  );
  const blink = 0.55 + 0.45 * Math.cos(frame * 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: `'${FONT}'`, color: "#F1EEF4" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 38%, transparent 55%, #05020Fcc 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 360, background: "linear-gradient(#05020Fb0 30%, #05020F00)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 720, background: "linear-gradient(#05020F00, #05020Fa8 45%, #05020F)" }} />

      {/* top HUD */}
      <div style={{ position: "absolute", left: 66, top: 270, ...mono }}>
        <div style={{ fontSize: 24, color: C.cyan, fontWeight: 600 }}><span style={{ color: "#FF3B3B", opacity: blink }}>●</span> REC  AUDIRA IR-CAM · TERMAL</div>
        <div style={{ fontSize: 20, opacity: 0.65, marginTop: 8 }}>ilustrasi · gedung fiktif</div>
      </div>

      {/* ironbow scale (relative, no absolute temperatures claimed) */}
      <div style={{ position: "absolute", right: 66, top: 570, height: 330, width: 18, background: "linear-gradient(0deg,#04020D,#30076A 20%,#9C1A88 42%,#EB5E28 62%,#F7CF3A 84%,#FFFBE6)", border: "2px solid #ffffffaa" }} />
      <div style={{ position: "absolute", right: 96, top: 564, fontSize: 18, textAlign: "right", ...mono, opacity: 0.9 }}>PANAS</div>
      <div style={{ position: "absolute", right: 96, top: 878, fontSize: 18, textAlign: "right", ...mono, opacity: 0.9 }}>DINGIN</div>

      {/* lock on the burning compartment */}
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h }}>
        {corner({ left: 0, top: 0, borderLeftWidth: 4, borderTopWidth: 4 })}
        {corner({ right: 0, top: 0, borderRightWidth: 4, borderTopWidth: 4 })}
        {corner({ left: 0, bottom: 0, borderLeftWidth: 4, borderBottomWidth: 4 })}
        {corner({ right: 0, bottom: 0, borderRightWidth: 4, borderBottomWidth: 4 })}
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g stroke={C.cyan} strokeWidth={2.5} fill="none" opacity={0.9}>
          <circle cx={cx} cy={cy} r={20} />
          <line x1={cx - 44} y1={cy} x2={cx - 24} y2={cy} /><line x1={cx + 24} y1={cy} x2={cx + 44} y2={cy} />
          <line x1={cx} y1={cy - 44} x2={cx} y2={cy - 24} /><line x1={cx} y1={cy + 24} x2={cx} y2={cy + 44} />
        </g>
        <g stroke={C.cyan} strokeWidth={2} fill="none" strokeDasharray="8 6">
          <polyline points={`${sp.x},${sp.y} ${sp.x + 50},${sp.y - 70} ${1000},${sp.y - 70}`} />
          <polyline points={`${door.x},${door.y} ${door.x - 40},${door.y - 225} ${80},${door.y - 225}`} />
          <polyline points={`${cold.x},${cold.y} ${cold.x},${cold.y + 156}`} />
        </g>
        <circle cx={sp.x} cy={sp.y} r={7} fill={C.cyan} />
        <circle cx={door.x} cy={door.y} r={7} fill={C.cyan} />
        <circle cx={cold.x} cy={cold.y} r={7} fill={C.cyan} />
      </svg>
      {tag(1000, sp.y - 70 - 22, "SPRINKLER · HANYA KEPALA INI", "right")}
      {tag(80, door.y - 225 - 22, "PINTU TAHAN API · TERTUTUP", "left")}
      {tag(66, cold.y + 172, "RUANG SEBELAH TETAP DINGIN", "left")}

      {/* rating chip */}
      <div style={{ position: "absolute", right: 66, top: box.y + box.h + 34, display: "flex", alignItems: "center", gap: 18, background: "#05020Fd9", border: `2px solid ${C.yellow}`, padding: "12px 20px", boxShadow: `0 0 30px ${C.amber}55` }}>
        <div style={{ fontSize: 58, fontWeight: 600, color: C.yellow, lineHeight: 1, ...mono, letterSpacing: "0.02em" }}>60 MENIT</div>
        <div style={{ fontSize: 18, lineHeight: 1.3, ...mono, letterSpacing: "0.12em" }}>KETAHANAN API<br /><span style={{ opacity: 0.6 }}>contoh rating</span></div>
      </div>

      {/* title */}
      <div style={{ position: "absolute", left: 66, right: 66, top: 1196 }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.32em", color: C.amber }}>AUDIRA EXPLAINED</div>
        <div style={{ fontSize: 116, fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.02em", marginTop: 14 }}>
          Api Terkunci<br /><span style={{ color: C.yellow }}>di Satu Ruang</span>
        </div>
      </div>
    </div>
  );
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D background={BG} overlay={() => <Overlay frame={frame} />}>
      <Scene frame={frame} />
    </Stage3D>
  );
};
