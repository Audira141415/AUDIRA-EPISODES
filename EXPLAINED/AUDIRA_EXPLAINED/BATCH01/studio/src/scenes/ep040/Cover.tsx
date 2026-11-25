// EP040 cover — THERMALFORGE look on a night plate-reading subject. An ETLE-style pole camera looks down on a
// night intersection. Brightness here is reflected 850 nm light from the pole's own IR illuminator (not
// heat): retroreflective plate sheeting and lane paint bounce it straight back, so the plate is the
// brightest thing in frame. Ironbow is only the false-colour palette. Plate "B 1234 XYZ" is fictional.

import React, { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { FONT } from "../../core/type/fonts.ts";

const PLATE = "B 1234 XYZ";
const C = { black: "#0A0A10", violet: "#310E68", magenta: "#9B1D8C", amber: "#EA5E28", yellow: "#F7D038", white: "#FFFFFF", cyan: "#00E5FF" };

// ---------- camera (pole-mounted, high, looking down the approach) ----------
const CAM = { pos: new THREE.Vector3(4.2, 5.6, 13.5), target: new THREE.Vector3(2.1, 0, -3.2), fov: 30 };
const LAMP = new THREE.Vector3(3.85, 5.35, 13.3); // IR illuminator housing beside the lens (coaxial-ish)

// car pose as a function of the frame (rolls slowly toward the camera)
const carPose = (frame: number) => ({ x: 1.95, z: -6.2 + frame * 0.012, yaw: 0.13 });
const PLATE_LOCAL = new THREE.Vector3(0, 0.5, 2.43);
const PLATE_W = 0.62, PLATE_H = 0.17;

const plateWorld = (frame: number, lx: number, ly: number) => {
  const p = carPose(frame);
  const v = new THREE.Vector3(PLATE_LOCAL.x + lx, PLATE_LOCAL.y + ly, PLATE_LOCAL.z + 0.02);
  v.applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
  return v.add(new THREE.Vector3(p.x, 0, p.z));
};

// ---------- the single NIR intensity shader, Ironbow false colour ----------
const IRONBOW = /* glsl */ `vec3 ironbow(float x){ x = clamp(x,0.,1.);
  vec3 c0=vec3(.015,.01,.05), c1=vec3(.19,.03,.40), c2=vec3(.61,.10,.53), c3=vec3(.92,.37,.16), c4=vec3(.97,.80,.22), c5=vec3(1.,.98,.88);
  if(x<.2) return mix(c0,c1,x/.2);
  if(x<.42) return mix(c1,c2,(x-.2)/.22);
  if(x<.62) return mix(c2,c3,(x-.42)/.2);
  if(x<.84) return mix(c3,c4,(x-.62)/.22);
  return mix(c4,c5,(x-.84)/.16); }`;

type MatOpts = { albedo: number; retro?: number; emissive?: number; kind?: number; map?: THREE.Texture | null };

const makeMat = ({ albedo, retro = 0, emissive = 0, kind = 0, map = null }: MatOpts) =>
  new THREE.ShaderMaterial({
    uniforms: {
      albedo: { value: albedo }, retro: { value: retro }, emissive: { value: emissive }, kind: { value: kind },
      map: { value: map }, useMap: { value: map ? 1 : 0 },
      lamp: { value: LAMP }, lampDir: { value: new THREE.Vector3().subVectors(new THREE.Vector3(1.8, 0, -5), LAMP).normalize() },
      camPos: { value: CAM.pos }, t: { value: 0 },
    },
    vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vO; varying vec3 vON; varying vec2 vUv;
      void main(){ vec4 m = modelMatrix*vec4(position,1.); vP = m.xyz; vO = position; vON = normal; vUv = uv;
        vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*m; }`,
    fragmentShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vO; varying vec3 vON; varying vec2 vUv;
      uniform float albedo, retro, emissive, kind, useMap, t; uniform sampler2D map; uniform vec3 lamp, lampDir, camPos;
      ${IRONBOW}
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec3 N = normalize(vN);
        vec3 d = lamp - vP; float r2 = dot(d,d); vec3 L = d*inversesqrt(r2);
        float ndl = max(dot(N,L),0.);
        float cone = smoothstep(.72,.93, dot(-L, lampDir));
        float irr = ndl * (0.3 + 0.9*cone) * 800. / (r2 + 60.);
        vec3 V = normalize(camPos - vP);
        float a = albedo;
        if (useMap > .5) a *= pow(texture2D(map, vUv).r, 2.5);
        // kind 1: asphalt grain; 2: car body (glass above beltline is dark); 3: building facade windows
        if (kind > .5 && kind < 1.5) a *= .75 + .5*n(vP.xz*7.) + .25*n(vP.xz*.6);
        if (kind > 1.5 && kind < 2.5) {
          bool glass = vO.y > .96 && vO.y < 1.36 && abs(vON.y) < .95;
          if (glass) a = .045;
        }
        float I = a * irr;
        // retroreflection: returns toward the source; the lamp sits next to the lens, so it reads very bright
        I += retro * a * pow(max(dot(N,V),0.), 2.) * irr * 1.0;
        // street lamp pools on the ground (LED, little NIR)
        if (kind > .5 && kind < 1.5) {
          I += .16*exp(-dot(vP.xz-vec2(-8.5,-9.),vP.xz-vec2(-8.5,-9.))/22.) + .12*exp(-dot(vP.xz-vec2(9.,-16.),vP.xz-vec2(9.,-16.))/26.);
        }
        if (kind > 2.5) {
          vec2 g = vec2(floor(vP.x*.55 + vP.z*.55), floor(vP.y*.42));
          vec2 fr = fract(vec2(vP.x*.55 + vP.z*.55, vP.y*.42));
          float win = step(.25, fr.x)*step(fr.x,.75)*step(.3,fr.y)*step(fr.y,.75);
          I += win * step(.72, h(g)) * .32;
          I += .03;
        }
        I += emissive + .05;
        I += .035*n(vP.xy*2.3+vP.z) ;
        float x = 1. - exp(-I*1.25);
        // depth haze into the cold end
        float dist = length(camPos - vP);
        x *= mix(1., .55, smoothstep(28., 70., dist));
        x += (h(gl_FragCoord.xy + t) - .5) * .02;
        vec3 c = ironbow(x);
        gl_FragColor = vec4(pow(c, vec3(2.2)), 1.);
      }`,
  });

// plate sheeting: bright background, dark characters
const makePlateTexture = () => {
  const cv = document.createElement("canvas");
  cv.width = 1024; cv.height = 280; // drawn large, sampled without mips
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fff"; g.fillRect(0, 0, 1024, 280);
  g.strokeStyle = "#111"; g.lineWidth = 14; g.strokeRect(14, 14, 996, 252);
  g.fillStyle = "#0b0b0b"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `600 170px '${FONT}'`;
  g.lineWidth = 16; g.lineJoin = "round"; g.strokeStyle = "#0b0b0b";
  g.strokeText(PLATE, 512, 128);
  g.fillText(PLATE, 512, 128);
  g.font = `600 52px '${FONT}'`;
  g.fillText("08 · 29", 512, 236);
  const tex = new THREE.CanvasTexture(cv);
  // no mip chain: averaged mips turn the small, far plate into flat grey and the characters vanish
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  return tex;
};

// sedan side profile (u along the car, v up), extruded across its width: a full-width lower body plus a
// narrower greenhouse, so the cabin tucks in (tumblehome) instead of reading as a box
const extrudeProfile = (pts: [number, number][], width: number, bevel: number) => {
  const sh = new THREE.Shape();
  sh.moveTo(...pts[0]);
  pts.slice(1).forEach((p) => sh.lineTo(...p));
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, steps: 1 });
  geo.translate(-2.31, 0, -width / 2);
  geo.rotateY(Math.PI / 2); // u axis -> -z, so the nose (u = 0) faces +z
  geo.computeVertexNormals();
  return geo;
};
const carBodyGeometry = () => extrudeProfile([[0, 0.3], [0.02, 0.62], [0.18, 0.8], [1.35, 0.92], [4.45, 0.95], [4.62, 0.74], [4.6, 0.3]], 1.6, 0.12);
const carCabinGeometry = () => extrudeProfile([[1.42, 0.9], [2.32, 1.36], [3.3, 1.38], [4.02, 0.92]], 1.22, 0.1);

const Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const { gl, scene, camera, size } = useThree();
  const plateTex = useMemo(makePlateTexture, []);
  const M = useMemo(() => ({
    asphalt: makeMat({ albedo: 0.34, kind: 1 }),
    paint: makeMat({ albedo: 0.42, retro: 0.9, kind: 1 }),
    curb: makeMat({ albedo: 0.42 }),
    walk: makeMat({ albedo: 0.3, kind: 1 }),
    building: makeMat({ albedo: 0.16, kind: 3 }),
    body: makeMat({ albedo: 0.3, kind: 2 }),
    dark: makeMat({ albedo: 0.04 }),
    rim: makeMat({ albedo: 0.35 }),
    head: makeMat({ albedo: 0.3, emissive: 0.75 }),
    tail: makeMat({ albedo: 0.3, emissive: 0.25 }),
    plate: makeMat({ albedo: 1.0, retro: 1.4, map: plateTex }),
    pole: makeMat({ albedo: 0.32 }),
    signal: makeMat({ albedo: 0.2, emissive: 0.18 }),
    farHead: makeMat({ albedo: 0.4, emissive: 1.1 }),
  }), [plateTex]);
  const G = useMemo(() => ({
    body: carBodyGeometry(),
    cabin: carCabinGeometry(),
    box: new THREE.BoxGeometry(1, 1, 1),
    rbox: new RoundedBoxGeometry(1, 1, 1, 3, 0.18),
    wheel: new THREE.CylinderGeometry(0.34, 0.34, 0.24, 28),
    hub: new THREE.CylinderGeometry(0.2, 0.2, 0.25, 20),
    plane: new THREE.PlaneGeometry(1, 1),
    pole: new THREE.CylinderGeometry(0.11, 0.14, 1, 14),
  }), []);

  const chain = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(1);
    composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.32, 0.3, 0.85));
    composer.addPass(new OutputPass());
    return composer;
  }, [gl, scene, camera, size.width, size.height]);

  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(CAM.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(CAM.target);
    cam.fov = CAM.fov; cam.near = 0.5; cam.far = 400;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    gl.toneMapping = THREE.NoToneMapping;
    Object.values(M).forEach((m) => (m.uniforms.t.value = frame % 97));
  }, [camera, gl, M, frame]);
  useFrame(() => chain.render(), 1);

  const car = carPose(frame);
  // dashed lane lines along z at x = ±3.5; road edges at ±7; cross street spans z in [-15, -3]
  const dashes: React.ReactNode[] = [];
  for (const x of [-3.5, 3.5]) {
    for (let z = -1; z < 40; z += 4.5) dashes.push(<mesh key={`d${x}${z}`} geometry={G.box} material={M.paint} position={[x, 0.012, z]} scale={[0.15, 0.02, 2.4]} />);
    for (let z = -17; z > -70; z -= 4.5) dashes.push(<mesh key={`e${x}${z}`} geometry={G.box} material={M.paint} position={[x, 0.012, z]} scale={[0.15, 0.02, 2.4]} />);
  }
  const zebra = (z0: number) => Array.from({ length: 10 }, (_, i) => (
    <mesh key={`z${z0}${i}`} geometry={G.box} material={M.paint} position={[-6.2 + i * 1.38, 0.012, z0]} scale={[0.72, 0.02, 2.6]} />
  ));
  const zebraX = (x0: number) => Array.from({ length: 8 }, (_, i) => (
    <mesh key={`zx${x0}${i}`} geometry={G.box} material={M.paint} position={[x0, 0.012, -14 + i * 1.5]} scale={[2.6, 0.02, 0.75]} />
  ));
  return (
    <>
      <color attach="background" args={["#030108"]} />
      {/* ground: main road, cross street, sidewalks */}
      <mesh geometry={G.plane} material={M.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} scale={[14, 160, 1]} />
      <mesh geometry={G.plane} material={M.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -9]} scale={[160, 12, 1]} />
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => {
        const cz = sz > 0 ? 25 : -45;
        const len = sz > 0 ? 48 : 60;
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
      <mesh geometry={G.box} material={M.paint} position={[3.5, 0.012, -18.2]} scale={[7, 0.02, 0.45]} />
      <mesh geometry={G.box} material={M.paint} position={[-3.5, 0.012, 1.6]} scale={[7, 0.02, 0.45]} />
      {zebra(-0.5)}
      {zebra(-17.5)}
      {zebraX(-9)}
      {zebraX(9)}
      {/* corner buildings */}
      {[[-17, -30, 18, 14, 22], [16, -32, 16, 20, 20], [-15, 22, 14, 10, 18], [24, 18, 16, 16, 24], [-8, -62, 20, 26, 14], [12, -66, 14, 30, 16]].map(([x, z, w, h, d], i) => (
        <mesh key={`b${i}`} geometry={G.box} material={M.building} position={[x, h / 2, z]} scale={[w, h, d]} />
      ))}
      {/* street lamps + signal gantry */}
      {[[-8.2, -8.8], [8.4, -16.2], [-8.2, 12]].map(([x, z], i) => (
        <group key={`p${i}`} position={[x, 0, z]}>
          <mesh geometry={G.pole} material={M.pole} position={[0, 4.5, 0]} scale={[1, 9, 1]} />
          <mesh geometry={G.rbox} material={M.signal} position={[x < 0 ? 1.2 : -1.2, 8.9, 0]} scale={[2.4, 0.22, 0.5]} />
        </group>
      ))}
      <group position={[8.1, 0, -2.6]}>
        <mesh geometry={G.pole} material={M.pole} position={[0, 3.2, 0]} scale={[1, 6.4, 1]} />
        <mesh geometry={G.box} material={M.pole} position={[-4.2, 6.2, 0]} scale={[8.4, 0.18, 0.18]} />
        {[-3.2, -6.6].map((x) => (
          <group key={x} position={[x, 5.6, 0]}>
            <mesh geometry={G.rbox} material={M.dark} scale={[0.55, 1.4, 0.45]} />
            {[0.42, 0, -0.42].map((y, k) => <mesh key={k} geometry={G.hub} material={k === 2 ? M.signal : M.dark} position={[0, y, 0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.75, 0.3, 0.75]} />)}
          </group>
        ))}
      </group>
      <group position={[6.6, 0, -17.2]}>
        <mesh geometry={G.pole} material={M.pole} position={[0, 3.2, 0]} scale={[1, 6.4, 1]} />
        <mesh geometry={G.box} material={M.pole} position={[-3.6, 6.1, 0]} scale={[7.2, 0.16, 0.16]} />
        {[-2.2, -5.4].map((x) => (
          <group key={x} position={[x, 5.5, 0]}>
            <mesh geometry={G.rbox} material={M.dark} scale={[0.5, 1.3, 0.42]} />
            {[0.4, 0, -0.4].map((y, k) => <mesh key={k} geometry={G.hub} material={k === 0 ? M.signal : M.dark} position={[0, y, 0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.7, 0.3, 0.7]} />)}
          </group>
        ))}
      </group>
      {/* hero car */}
      <group position={[car.x, 0, car.z]} rotation={[0, car.yaw, 0]}>
        <mesh geometry={G.body} material={M.body} />
        <mesh geometry={G.cabin} material={M.body} />
        {[[-0.86, 1.45], [0.86, 1.45], [-0.86, -1.5], [0.86, -1.5]].map(([x, z], i) => (
          <group key={i} position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh geometry={G.wheel} material={M.dark} />
            <mesh geometry={G.hub} material={M.rim} />
          </group>
        ))}
        {[-0.58, 0.58].map((x) => <mesh key={x} geometry={G.rbox} material={M.head} position={[x, 0.74, 2.27]} scale={[0.5, 0.13, 0.12]} />)}
        <mesh geometry={G.rbox} material={M.dark} position={[0, 0.74, 2.36]} scale={[0.6, 0.16, 0.06]} />
        {[0.7, 0.78].map((y) => <mesh key={y} geometry={G.box} material={M.rim} position={[0, y, 2.4]} scale={[0.54, 0.015, 0.02]} />)}
        {[-1, 1].map((sx) => <mesh key={sx} geometry={G.rbox} material={M.body} position={[sx * 0.98, 0.98, 0.78]} scale={[0.22, 0.13, 0.12]} />)}
        <mesh geometry={G.rbox} material={M.dark} position={[0, 0.2, 2.3]} scale={[1.5, 0.08, 0.12]} />
        <mesh geometry={G.rbox} material={M.dark} position={[0, 0.3, 2.34]} scale={[1.2, 0.12, 0.06]} />
        <mesh geometry={G.plane} material={M.plate} position={[PLATE_LOCAL.x, PLATE_LOCAL.y, PLATE_LOCAL.z + 0.02]} scale={[PLATE_W, PLATE_H, 1]} />
      </group>
      {/* a second car further back, crossing the junction */}
      <group position={[-5.2 + frame * 0.01, 0, -14.6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={G.body} material={M.body} />
        <mesh geometry={G.cabin} material={M.body} />
        {[[-0.86, 1.45], [0.86, 1.45], [-0.86, -1.5], [0.86, -1.5]].map(([x, z], i) => (
          <group key={i} position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh geometry={G.wheel} material={M.dark} />
            <mesh geometry={G.hub} material={M.rim} />
          </group>
        ))}
        {[-0.58, 0.58].map((x) => <mesh key={x} geometry={G.rbox} material={M.farHead} position={[x, 0.74, 2.27]} scale={[0.5, 0.13, 0.12]} />)}
      </group>
      <group position={[-1.9, 0, -38]} rotation={[0, 0, 0]}>
        <mesh geometry={G.body} material={M.body} />
        <mesh geometry={G.cabin} material={M.body} />
        {[-0.58, 0.58].map((x) => <mesh key={x} geometry={G.rbox} material={M.farHead} position={[x, 0.74, 2.27]} scale={[0.5, 0.13, 0.12]} />)}
      </group>
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
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => project(plateWorld(frame, (sx * PLATE_W) / 2, (sy * PLATE_H) / 2)));
  const minX = Math.min(...corners.map((c) => c.x)), maxX = Math.max(...corners.map((c) => c.x));
  const minY = Math.min(...corners.map((c) => c.y)), maxY = Math.max(...corners.map((c) => c.y));
  const pad = 16;
  const box = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  const inset = { x: 66, y: 1040, w: 600, h: 150 };
  const mono: React.CSSProperties = { fontFamily: `'${FONT}'`, fontVariantNumeric: "tabular-nums", letterSpacing: "0.14em" };
  const tick = (s: React.CSSProperties) => <div style={{ position: "absolute", background: C.cyan, ...s }} />;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: `'${FONT}'`, color: "#F1EEF4" }}>
      {/* sensor scanlines + edge falloff */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.13, backgroundImage: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 40%, transparent 55%, #05020Fcc 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 430, background: "linear-gradient(#05020Fee 45%, #05020F00)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, background: "linear-gradient(#05020F00, #05020Fd8 42%, #05020F)" }} />

      {/* top HUD (inside the 180 px top safe zone) */}
      <div style={{ position: "absolute", left: 66, top: 196, ...mono }}>
        <div style={{ fontSize: 24, color: C.cyan, fontWeight: 600 }}>● REC  KAMERA TIANG · MODE MALAM</div>
        <div style={{ fontSize: 22, opacity: 0.7, marginTop: 10 }}>SENSOR MALAM · PELAT REFLEKTIF</div>
      </div>
      <div style={{ position: "absolute", right: 66, top: 196, textAlign: "right", ...mono }}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>23:47:{String(12 + Math.floor(frame / 30)).padStart(2, "0")}</div>
        <div style={{ fontSize: 22, color: C.yellow, marginTop: 10 }}>ILUMINATOR AKTIF</div>
      </div>

      {/* reflectance scale (not temperature) */}
      <div style={{ position: "absolute", right: 66, top: 330, height: 330, width: 18, background: "linear-gradient(0deg,#04020D,#30076A 20%,#9C1A88 42%,#EB5E28 62%,#F7CF3A 84%,#FFFBE6)", border: "2px solid #ffffffaa" }} />
      <div style={{ position: "absolute", right: 96, top: 322, fontSize: 18, textAlign: "right", ...mono, opacity: 0.85 }}>PANTULAN<br />TINGGI</div>
      <div style={{ position: "absolute", right: 96, top: 640, fontSize: 18, textAlign: "right", ...mono, opacity: 0.85 }}>RENDAH</div>

      {/* detection lock on the plate */}
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, border: `3px solid ${C.cyan}`, boxShadow: `0 0 18px ${C.cyan}88` }}>
        {tick({ left: -16, top: box.h / 2 - 1.5, width: 22, height: 3 })}
        {tick({ right: -16, top: box.h / 2 - 1.5, width: 22, height: 3 })}
        {tick({ top: -16, left: box.w / 2 - 1.5, width: 3, height: 22 })}
        {tick({ bottom: -16, left: box.w / 2 - 1.5, width: 3, height: 22 })}
        <div style={{ position: "absolute", left: box.w + 26, top: box.h / 2 - 13, whiteSpace: "nowrap", fontSize: 20, color: C.cyan, fontWeight: 600, ...mono }}>PLAT TERKUNCI</div>
      </div>
      {/* leader from the lock to the OCR crop */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polyline points={`${box.x + box.w / 2},${box.y + box.h} ${box.x + box.w / 2},${inset.y - 40} ${inset.x + inset.w / 2},${inset.y - 40} ${inset.x + inset.w / 2},${inset.y}`} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="10 8" />
      </svg>

      {/* OCR crop: what the reader sees after the lock */}
      <div style={{ position: "absolute", left: inset.x, top: inset.y, width: inset.w, height: inset.h, background: "#FFFBEA", border: `3px solid ${C.cyan}`, boxShadow: `0 0 40px #F7D03866, 0 0 0 10px #05020Faa`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {PLATE.split("").map((ch, i) => (ch === " " ? <div key={i} style={{ width: 22 }} /> : (
          <div key={i} style={{ width: 54, height: 92, border: `2px solid ${C.magenta}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 78, fontWeight: 600, color: "#0B0910", lineHeight: 1 }}>{ch}</div>
        )))}
      </div>
      <div style={{ position: "absolute", left: inset.x, top: inset.y + inset.h + 16, fontSize: 20, ...mono, color: C.cyan }}>
        OCR 9/9 KARAKTER <span style={{ color: "#F1EEF4", opacity: 0.6 }}>· ilustrasi, plat fiktif</span>
      </div>

      {/* title block: bottom edge stays above the 380 px bottom safe zone */}
      <div style={{ position: "absolute", left: 66, right: 66, top: 1262 }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.32em", color: C.amber }}>AUDIRA EXPLAINED</div>
        <div style={{ fontSize: 118, fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.02em", marginTop: 14 }}>
          Plat Terbaca<br /><span style={{ color: C.yellow }}>Meski Gelap</span>
        </div>
      </div>
    </div>
  );
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D background="#030108" overlay={() => <Overlay frame={frame} />}>
      <Scene frame={frame} />
    </Stage3D>
  );
};
