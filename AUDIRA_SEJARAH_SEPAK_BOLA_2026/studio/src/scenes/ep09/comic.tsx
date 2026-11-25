// EP09 comic toolkit: a local variant of the COMICFORGE halftone cel shader (adds stripes and a texture map)
// plus a generic comic footballer built from inked parts. Kit files are imported, never edited.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { KEY_LIGHT, makeOutlineMaterial } from "../../kits/comicforge/lib/materials.ts";
import { Inked } from "../../kits/comicforge/scene/Ink.tsx";
import { numberTexture } from "./coverTextures.ts";

export type V3 = [number, number, number];

const VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vW;
varying vec3 vP;
varying vec2 vUv;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vP = position;
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uShade;
uniform vec3 uColor2;
uniform vec3 uShade2;
uniform vec3 uLight;
uniform float uDot;
uniform float uSpec;
uniform float uStripes;
uniform float uUseMap;
uniform sampler2D uMap;
varying vec3 vN;
varying vec3 vW;
varying vec3 vP;
varying vec2 vUv;
float dots(float cov){
  vec2 p = gl_FragCoord.xy / uDot;
  p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
  vec2 g = fract(p) - 0.5;
  float r = sqrt(cov) * 0.62;
  return 1.0 - smoothstep(r - 0.07, r + 0.07, length(g));
}
void main(){
  vec3 c = uColor;
  vec3 sh = uShade;
  if (uStripes > 0.0) {
    float s = step(0.5, fract(vP.x * uStripes + 0.25));
    c = mix(uColor, uColor2, s);
    sh = mix(uShade, uShade2, s);
  }
  if (uUseMap > 0.5) {
    vec3 t = texture2D(uMap, vUv).rgb;
    c = t;
    sh = t * 0.55;
  }
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, normalize(uLight));
  float lit = smoothstep(0.28, 0.32, ndl);
  float mid = smoothstep(-0.22, -0.18, ndl);
  vec3 midCol = mix(c, sh, dots(0.42));
  vec3 col = lit > 0.5 ? c : (mid > 0.5 ? midCol : mix(sh, sh * 0.72, dots(0.35)));
  vec3 v = normalize(cameraPosition - vW);
  vec3 h = normalize(normalize(uLight) + v);
  col = mix(col, vec3(1.0), step(0.965, dot(n, h)) * uSpec);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export const tone = (
  dotPx: number,
  color: string,
  shade: string,
  opts: { spec?: number; stripes?: number; color2?: string; shade2?: string; map?: THREE.Texture; light?: THREE.Vector3 } = {},
) =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uShade: { value: new THREE.Color(shade) },
      uColor2: { value: new THREE.Color(opts.color2 ?? color) },
      uShade2: { value: new THREE.Color(opts.shade2 ?? shade) },
      uLight: { value: (opts.light ?? KEY_LIGHT).clone() },
      uDot: { value: dotPx },
      uSpec: { value: opts.spec ?? 0 },
      uStripes: { value: opts.stripes ?? 0 },
      uUseMap: { value: opts.map ? 1 : 0 },
      uMap: { value: opts.map ?? null },
    },
    side: THREE.DoubleSide,
  });

export const INK = {
  thick: makeOutlineMaterial(0.03),
  mid: makeOutlineMaterial(0.018),
  thin: makeOutlineMaterial(0.011),
};
export const inkBasic = new THREE.MeshBasicMaterial({ color: "#121014" });
export const whiteBasic = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });

export const CameraRig: React.FC<{ pos: V3; target: V3; fov: number }> = ({ pos, target, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.up.set(0, 1, 0);
    c.lookAt(...target);
    c.fov = fov;
    c.near = 0.05;
    c.far = 200;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }, [camera, pos, target, fov]);
  return null;
};

// ---------- generic comic footballer ----------
const lathe = (pts: [number, number][]) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 28);
const G = {
  torso: lathe([
    [0, -0.02],
    [0.14, 0],
    [0.165, 0.08],
    [0.185, 0.22],
    [0.232, 0.37],
    [0.24, 0.43],
    [0.205, 0.5],
    [0.09, 0.545],
    [0, 0.555],
  ]),
  shoulder: new THREE.SphereGeometry(0.078, 16, 12),
  neck: new THREE.CapsuleGeometry(0.048, 0.06, 4, 10),
  head: new THREE.SphereGeometry(0.118, 22, 16),
  hair: new THREE.SphereGeometry(0.128, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
  curl: new THREE.SphereGeometry(0.05, 10, 8),
  shorts: new THREE.CapsuleGeometry(0.155, 0.1, 6, 16),
  shortLeg: new THREE.CapsuleGeometry(0.088, 0.08, 4, 12),
  thigh: new THREE.CapsuleGeometry(0.075, 0.24, 4, 12),
  shin: new THREE.CapsuleGeometry(0.062, 0.28, 4, 12),
  boot: new THREE.CapsuleGeometry(0.056, 0.13, 4, 10),
  sleeve: new THREE.CapsuleGeometry(0.066, 0.1, 4, 12),
  upper: new THREE.CapsuleGeometry(0.054, 0.15, 4, 10),
  fore: new THREE.CapsuleGeometry(0.049, 0.17, 4, 10),
  fist: new THREE.SphereGeometry(0.064, 14, 12),
  glove: new THREE.SphereGeometry(0.09, 14, 12),
  eye: new THREE.SphereGeometry(0.018, 8, 6),
  plane: new THREE.PlaneGeometry(1, 1),
};

export type Limb = { x: number; z?: number; bend: number };
export type FigurePose = {
  lean?: number; // forward lean (rad)
  side?: number; // sideways tilt
  head?: number; // negative = look up
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
};

export type Kit = {
  shirt: THREE.Material;
  sleeve: THREE.Material;
  shorts: THREE.Material;
  socks: THREE.Material;
  skin: THREE.Material;
  hair: THREE.Material;
  boot: THREE.Material;
  glove?: THREE.Material;
  longSleeves?: boolean;
  curls?: boolean;
  number?: string;
  numberColor?: string;
  face?: boolean;
};

const Arm: React.FC<{ side: 1 | -1; l: Limb; kit: Kit }> = ({ side, l, kit }) => (
  <group position={[0.245 * side, 0.44, 0]} rotation={[l.x, 0, (l.z ?? 0.08) * side]}>
    <Inked geometry={G.sleeve} material={kit.sleeve} outline={INK.mid} position={[0, -0.06, 0]} />
    <Inked geometry={G.upper} material={kit.longSleeves ? kit.sleeve : kit.skin} outline={INK.thin} position={[0, -0.17, 0]} />
    <group position={[0, -0.28, 0]} rotation={[l.bend, 0, 0]}>
      <Inked geometry={G.fore} material={kit.longSleeves ? kit.sleeve : kit.skin} outline={INK.thin} position={[0, -0.12, 0]} />
      {kit.glove ? (
        <Inked geometry={G.glove} material={kit.glove} outline={INK.mid} position={[0, -0.27, 0]} scale={[1, 1.1, 0.8]} />
      ) : (
        <Inked geometry={G.fist} material={kit.skin} outline={INK.mid} position={[0, -0.26, 0]} />
      )}
    </group>
  </group>
);

const Leg: React.FC<{ side: 1 | -1; l: Limb; kit: Kit }> = ({ side, l, kit }) => (
  <group position={[0.092 * side, -0.03, 0]} rotation={[l.x, 0, (l.z ?? 0.04) * side]}>
    <Inked geometry={G.shortLeg} material={kit.shorts} outline={INK.mid} position={[0, -0.08, 0]} />
    <Inked geometry={G.thigh} material={kit.skin} outline={INK.thin} position={[0, -0.22, 0]} />
    <group position={[0, -0.42, 0]} rotation={[l.bend, 0, 0]}>
      <Inked geometry={G.shin} material={kit.socks} outline={INK.thin} position={[0, -0.2, 0]} />
      <Inked geometry={G.boot} material={kit.boot} outline={INK.thin} position={[0, -0.42, 0.05]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  </group>
);

/** Origin at the feet; local +z is the figure's front. */
export const Footballer: React.FC<{ kit: Kit; pose: FigurePose; position: V3; rotY?: number; scale?: number }> = ({ kit, pose, position, rotY = 0, scale = 1 }) => {
  const numTex = useMemo(() => (kit.number ? numberTexture(kit.number, kit.numberColor ?? "#121014") : null), [kit.number, kit.numberColor]);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <group rotation={[pose.lean ?? 0, 0, pose.side ?? 0]}>
        <group position={[0, 0.92, 0]}>
          {/* torso (shoulders wider than waist) */}
          <group scale={[1, 1, 0.66]}>
            <Inked geometry={G.torso} material={kit.shirt} outline={INK.mid} />
          </group>
          {numTex && (
            <mesh geometry={G.plane} position={[0, 0.3, -0.168]} rotation={[0.08, Math.PI, 0]} scale={[0.2, 0.2, 1]}>
              <meshBasicMaterial map={numTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
          )}
          <Inked geometry={G.shoulder} material={kit.sleeve} outline={INK.thin} position={[0.21, 0.44, 0]} />
          <Inked geometry={G.shoulder} material={kit.sleeve} outline={INK.thin} position={[-0.21, 0.44, 0]} />
          <Inked geometry={G.neck} material={kit.skin} outline={INK.thin} position={[0, 0.58, 0]} />
          {/* head */}
          <group position={[0, 0.72, 0]} rotation={[pose.head ?? 0, 0, 0]}>
            <Inked geometry={G.head} material={kit.skin} outline={INK.mid} />
            <Inked geometry={G.hair} material={kit.hair} outline={INK.thin} rotation={[-0.45, 0, 0]} position={[0, 0.012, -0.01]} />
            {kit.curls &&
              [
                [0.07, 0.07, -0.06],
                [-0.07, 0.07, -0.06],
                [0, 0.1, -0.04],
                [0.1, 0.0, -0.06],
                [-0.1, 0.0, -0.06],
                [0, 0.02, -0.11],
                [0.05, -0.04, -0.1],
                [-0.05, -0.04, -0.1],
              ].map((p, i) => <Inked key={i} geometry={G.curl} material={kit.hair} outline={INK.thin} position={p as V3} />)}
            {kit.face && (
              <>
                <mesh geometry={G.eye} material={inkBasic} position={[0.042, 0.02, 0.108]} scale={[0.8, 1.4, 0.5]} />
                <mesh geometry={G.eye} material={inkBasic} position={[-0.042, 0.02, 0.108]} scale={[0.8, 1.4, 0.5]} />
                <mesh geometry={G.eye} material={inkBasic} position={[0, -0.05, 0.11]} scale={[1.4, 1.1, 0.5]} />
              </>
            )}
          </group>
          <Arm side={1} l={pose.armR} kit={kit} />
          <Arm side={-1} l={pose.armL} kit={kit} />
          {/* shorts + legs */}
          <group scale={[1.12, 1, 0.82]}>
            <Inked geometry={G.shorts} material={kit.shorts} outline={INK.mid} position={[0, 0.02, 0]} />
          </group>
          <Leg side={1} l={pose.legR} kit={kit} />
          <Leg side={-1} l={pose.legL} kit={kit} />
        </group>
      </group>
    </group>
  );
};
