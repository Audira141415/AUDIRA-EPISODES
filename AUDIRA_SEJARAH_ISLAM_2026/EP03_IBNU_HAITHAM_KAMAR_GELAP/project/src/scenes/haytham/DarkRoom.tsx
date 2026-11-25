// The dark room (camera obscura) of EP03: plaster walls, a closed shutter with one pinhole on the
// left wall, three candle images projected upside down on the back wall, the light beams that make
// them, a desk with an open optics book and the scholar seen only from behind (no face).
//
// `light` (0..1 per candle) lets later beats cover a candle and its spot goes out.

import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { createFresnelPBRMaterial } from "../../core/materials/fresnel.ts";
import { prng } from "../../core/materials/textures.ts";
import { ROOM, HOLE, SPOTS, SPOT_CENTER, PALETTE } from "./layout.ts";
import { invertedFlame, softDot, diagramPage, latticeGobo } from "./textures.ts";

const FX = 1 << FX_LAYER;

/** Enable the FX layer on the camera from the first frame (a still renders only one frame). */
export const FxLayerOn: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.layers.enable(FX_LAYER);
  });
  return null;
};

// ---------- light beam: open cone from the pinhole to a spot, soft edges, fades at the hole ----------
const beamVert = /* glsl */ `
varying float vAlong; varying vec3 vN; varying vec3 vV;
void main(){
  vAlong = uv.y;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const beamFrag = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity;
varying float vAlong; varying vec3 vN; varying vec3 vV;
void main(){
  float edge = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
  edge = edge * edge;
  float along = smoothstep(0.0, 0.06, vAlong) * (0.55 + 0.45 * (1.0 - vAlong));
  float a = clamp(uOpacity * edge * along, 0.0, 1.0);
  gl_FragColor = vec4(uColor * a, a);
}`;

const Beam: React.FC<{ from: [number, number, number]; to: [number, number, number]; r0: number; r1: number; opacity: number; color: string }> = ({
  from,
  to,
  r0,
  r1,
  opacity,
  color,
}) => {
  const { geo, quat, mid } = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    // cylinder axis = +y; uv.y runs 0 (bottom, -y) to 1 (top, +y): put the hole at the bottom
    const g = new THREE.CylinderGeometry(r1, r0, len, 32, 1, true);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize().negate());
    return { geo: g, quat: q, mid: a.clone().add(b).multiplyScalar(0.5) };
  }, [from, to, r0, r1]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVert,
        fragmentShader: beamFrag,
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [color],
  );
  mat.uniforms.uOpacity.value = opacity;
  return <mesh geometry={geo} material={mat} position={mid} quaternion={quat} layers-mask={FX} />;
};

// ---------- dust in the beams ----------
const Dust: React.FC<{ t: number; strength: number }> = ({ t, strength }) => {
  const { positions, base } = useMemo(() => {
    const rnd = prng(41);
    const n = 260;
    const base: { s: number; k: number; ox: number; oy: number; oz: number; sp: number }[] = [];
    for (let i = 0; i < n; i++) base.push({ s: Math.floor(rnd() * 3), k: rnd(), ox: rnd() - 0.5, oy: rnd() - 0.5, oz: rnd() - 0.5, sp: 0.2 + rnd() });
    return { positions: new Float32Array(n * 3), base };
  }, []);
  const h = new THREE.Vector3(...HOLE);
  base.forEach((p, i) => {
    const s = new THREE.Vector3(...SPOTS[p.s]);
    const k = (p.k + t * 0.012 * p.sp) % 1;
    const pt = h.clone().lerp(s, 0.08 + k * 0.9);
    const r = 0.03 + k * 0.16;
    positions[i * 3] = pt.x + p.ox * r + Math.sin(t * 0.6 * p.sp + i) * 0.015;
    positions[i * 3 + 1] = pt.y + p.oy * r + Math.sin(t * 0.4 * p.sp + i * 1.7) * 0.02;
    positions[i * 3 + 2] = pt.z + p.oz * r;
  });
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
  return (
    <points geometry={geo} layers-mask={FX}>
      <pointsMaterial
        map={softDot()}
        color={PALETTE.tungsten}
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.75 * strength}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

// ---------- the scholar from behind (slim silhouette, no face) ----------
const Scholar: React.FC<{ t: number }> = ({ t }) => {
  const rim = useMemo(
    () => createFresnelPBRMaterial({ baseColor: PALETTE.robe, rimColor: PALETTE.moon, rimPower: 2.8, rimIntensity: 0.9, roughness: 0.92, metalness: 0 }),
    [],
  );
  const cloth = useMemo(
    () => createFresnelPBRMaterial({ baseColor: "#24201b", rimColor: PALETTE.tungsten, rimPower: 2.8, rimIntensity: 0.8, roughness: 0.9, metalness: 0 }),
    [],
  );
  const lathe = (pts: number[][], sx: number, sz: number) => {
    const g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 64);
    g.scale(sx, 1, sz);
    g.computeVertexNormals();
    return g;
  };
  // seated, upright back: narrow waist, shoulders wider than the waist, a long neck line to the head
  const robe = useMemo(
    () => lathe([[0, 0], [0.2, 0], [0.205, 0.06], [0.175, 0.22], [0.15, 0.4], [0.165, 0.56], [0.205, 0.7], [0.2, 0.76], [0.15, 0.81], [0.075, 0.85], [0.055, 0.9], [0, 0.91]], 1.05, 0.72),
    [],
  );
  // shawl over the shoulders, falling to a point down the back
  const shawl = useMemo(() => lathe([[0.17, 0.5], [0.185, 0.62], [0.215, 0.71], [0.205, 0.77], [0.15, 0.82], [0.08, 0.86], [0.062, 0.9]], 1.07, 0.76), []);
  const breathe = 1 + Math.sin(t * 1.6) * 0.006;
  const write = Math.sin(t * 2.3) * 0.04; // the right arm moves a little: writing
  return (
    <group position={[-0.62, 0.3, 0.35]} rotation={[0, 0.18, 0]} scale={0.95}>
      <mesh geometry={robe} material={rim} scale={[1, breathe, 1]} castShadow />
      <mesh geometry={shawl} material={rim} scale={[1.01, breathe, 1.01]} castShadow />
      {/* upper arms reaching forward to the desk (sleeves), seen from behind */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.19, 0.7, -0.02]} rotation={[0.95 + (side > 0 ? write : 0), 0, side * 0.12]}>
          <mesh material={rim} position={[0, -0.13, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.2, 6, 16]} />
          </mesh>
        </group>
      ))}
      <group position={[0, 0.99, -0.01]} rotation={[-0.12, 0, 0]}>
        <mesh material={rim} scale={[0.9, 1.06, 0.98]} castShadow>
          <sphereGeometry args={[0.095, 32, 24]} />
        </mesh>
        {/* turban: wrapped cloth, two crossed wraps over a soft crown */}
        <mesh material={cloth} position={[0, 0.062, 0.005]} scale={[1.05, 0.72, 1.04]}>
          <sphereGeometry args={[0.11, 32, 24]} />
        </mesh>
        <mesh material={cloth} position={[0, 0.04, 0]} rotation={[Math.PI / 2 + 0.22, 0.12, 0]}>
          <torusGeometry args={[0.102, 0.03, 14, 48]} />
        </mesh>
        <mesh material={cloth} position={[0, 0.072, 0]} rotation={[Math.PI / 2 - 0.25, -0.18, 0]}>
          <torusGeometry args={[0.09, 0.026, 14, 48]} />
        </mesh>
      </group>
      {/* low wooden stool */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.2, 0.3, 24]} />
        <meshStandardMaterial color="#0e0b08" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ---------- room ----------
/**
 * The room. `light` = per-candle light reaching the wall, `cut` = cutaway (ceiling off), `dim` = room fill,
 * `k` = the room group's scale (payoff), so local lights keep the same look when the room shrinks.
 */
export const DarkRoom: React.FC<{ t: number; light?: [number, number, number]; cut?: number; dim?: number; k?: number; moonK?: number; children?: React.ReactNode }> = ({
  t,
  light = [1, 1, 1],
  cut = 0,
  dim = 1,
  k = 1,
  moonK = 1,
  children,
}) => {
  const grain = useSurfaceGrain(11, 0.35, 4);
  const grainFloor = useSurfaceGrain(23, 0.4, 6);
  const flameTex = invertedFlame();
  const page = diagramPage(3);
  const gobo = latticeGobo();
  const W = ROOM.halfW, B = ROOM.back, H = ROOM.height;
  const depth = ROOM.front - B;

  // the projected patch light: a real spot from the pinhole lights the back wall around the images
  const spot = useMemo(() => {
    const s = new THREE.SpotLight(PALETTE.flame, 0, 10, 0.34, 0.95, 1.4);
    s.position.set(...HOLE);
    s.target.position.set(...SPOT_CENTER);
    return s;
  }, []);
  const moon = useMemo(() => {
    const s = new THREE.SpotLight(PALETTE.moon, 0, 14, 0.42, 0.5, 1.2);
    s.position.set(W + 1.1, 3.4, 2.6);
    s.target.position.set(0.3, 0, 1.2);
    s.map = gobo;
    s.castShadow = true;
    s.shadow.mapSize.set(1024, 1024);
    s.shadow.bias = -0.0005;
    return s;
  }, [gobo, W]);
  const lit = (light[0] + light[1] + light[2]) / 3;
  const flick = (i: number) => 0.92 + 0.08 * Math.sin(t * 9.1 + i * 2.3) * Math.sin(t * 3.7 + i);
  // room lights live inside the (possibly scaled) room group: distance x k, intensity x k^decay
  const fill = useMemo(() => {
    const s = new THREE.SpotLight("#e8c48e", 0, 14, 0.75, 1, 1.3);
    s.position.set(0.6, 3.3, 3.5);
    s.target.position.set(0.2, 1.4, -3.6);
    return s;
  }, []);
  const rimP = useMemo(() => new THREE.PointLight(PALETTE.moon, 0, 3, 1.5), []);
  const bounce = useMemo(() => new THREE.PointLight(PALETTE.flame, 0, 6, 1.6), []);
  const kd = (d: number) => Math.pow(k, d);
  spot.intensity = 255 * lit * (0.96 + 0.04 * Math.sin(t * 7.3)) * kd(1.4);
  spot.distance = 10 * k;
  moon.intensity = 220 * moonK * kd(1.2);
  moon.distance = 14 * k;
  fill.intensity = 60 * dim * kd(1.3);
  fill.distance = 14 * k;
  rimP.position.set(-0.4, 1.9, -0.6);
  rimP.intensity = 6 * kd(1.5);
  rimP.distance = 3 * k;
  bounce.position.set(0.75, 1.55, -3.1);
  bounce.intensity = 4 * (0.35 + 0.65 * lit) * kd(1.6);
  bounce.distance = 6 * k;

  const shutterBoards = 7;
  return (
    <group>
      <primitive object={spot} />
      <primitive object={spot.target} />
      <primitive object={moon} />
      <primitive object={moon.target} />
      <primitive object={fill} />
      <primitive object={fill.target} />
      <primitive object={rimP} />
      <primitive object={bounce} />

      {/* floor (Lambert: no env glare band, per FILMNOIR memory) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, B + depth / 2]} receiveShadow>
        <planeGeometry args={[W * 2, depth]} />
        <meshLambertMaterial color={PALETTE.floor} bumpMap={grainFloor} />
      </mesh>
      {/* floor tiles seams */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`fz${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, B + 0.6 + i * 0.9]}>
          <planeGeometry args={[W * 2, 0.012]} />
          <meshBasicMaterial color="#070707" />
        </mesh>
      ))}

      {/* back wall */}
      <mesh position={[0, H / 2, B]} receiveShadow>
        <planeGeometry args={[W * 2, H, 1, 1]} />
        <meshStandardMaterial color={PALETTE.plaster} roughness={0.95} metalness={0} bumpMap={grain} bumpScale={1.4} envMapIntensity={0.3} />
      </mesh>
      {/* left wall (pinhole wall) */}
      <mesh position={[-W, H / 2, B + depth / 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, H]} />
        <meshStandardMaterial color={PALETTE.plasterDark} roughness={0.95} bumpMap={grain} bumpScale={1.4} />
      </mesh>
      {/* right wall */}
      <mesh position={[W, H / 2, B + depth / 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, H]} />
        <meshStandardMaterial color={PALETTE.plasterDark} roughness={0.95} bumpMap={grain} bumpScale={1.4} />
      </mesh>
      {/* ceiling + timber beams (removed for the cutaway) */}
      <mesh visible={cut < 0.5} position={[0, H, B + depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 2, depth]} />
        <meshStandardMaterial color="#1e1a16" roughness={1} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`bm${i}`} visible={cut < 0.5} position={[0, H - 0.09, B + 0.5 + i * 1.3]} castShadow>
          <RoundedBoxGeo args={[W * 2, 0.18, 0.16]} radius={0.02} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.85} bumpMap={grain} />
        </mesh>
      ))}

      {/* closed wooden shutter on the left wall, with the pinhole */}
      <group position={[-W + 0.04, HOLE[1] - 0.05, HOLE[2]]} rotation={[0, Math.PI / 2, 0]}>
        {/* frame (frame and boards are cut away for the experiment: only the brass plate stays) */}
        <mesh visible={cut < 0.5} position={[0, 0, -0.02]}>
          <RoundedBoxGeo args={[1.25, 1.55, 0.08]} radius={0.02} />
          <meshStandardMaterial color="#120c08" roughness={0.8} />
        </mesh>
        {Array.from({ length: shutterBoards }, (_, i) => (
          <mesh key={`sb${i}`} visible={cut < 0.5} position={[0, -0.66 + i * 0.22, 0.03]} castShadow>
            <RoundedBoxGeo args={[1.1, 0.2, 0.05]} radius={0.012} />
            <meshPhysicalMaterial {...POLISH.stone} color="#2a1d14" roughness={0.75} bumpMap={grain} bumpScale={2} />
          </mesh>
        ))}
        {/* cold moonlight leaking through the board gaps (thin emissive lines) */}
        {Array.from({ length: shutterBoards - 1 }, (_, i) => (
          <mesh key={`gap${i}`} visible={cut < 0.5} position={[0, -0.55 + i * 0.22, 0.058]} layers-mask={FX}>
            <planeGeometry args={[1.06, 0.008]} />
            <meshBasicMaterial color={PALETTE.moon} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
        {/* brass plate + pinhole */}
        <mesh position={[0, 0.05, 0.062]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.012, 40]} />
          <meshStandardMaterial color="#8a6a32" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.05, 0.07]} layers-mask={FX}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial map={softDot()} color={PALETTE.tungsten} transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.05, 0.071]} layers-mask={FX}>
          <planeGeometry args={[0.07, 0.07]} />
          <meshBasicMaterial map={softDot()} color="#ffffff" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* beams: soft wide sheath + bright core, one per candle */}
      {SPOTS.map((s, i) => (
        <group key={`beam${i}`}>
          <Beam from={HOLE} to={s} r0={0.012} r1={0.17} opacity={0.32 * light[i] * flick(i)} color={PALETTE.flame} />
          <Beam from={HOLE} to={s} r0={0.004} r1={0.05} opacity={0.5 * light[i] * flick(i)} color={PALETTE.tungsten} />
        </group>
      ))}
      <Dust t={t} strength={lit} />

      {/* inverted candle images on the back wall */}
      {SPOTS.map((s, i) => (
        <mesh key={`img${i}`} position={s} layers-mask={FX}>
          <planeGeometry args={[0.42, 0.84]} />
          <meshBasicMaterial
            map={flameTex}
            transparent
            opacity={Math.min(1, 1.6 * light[i] * flick(i))}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* desk with the open optics book (geometric diagram, no real script) */}
      <group position={[0.15, 0, -0.5]} rotation={[0, 0.06, 0]}>
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.5, 0.06, 0.7]} radius={0.015} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.6} bumpMap={grain} bumpScale={1.5} />
        </mesh>
        {[[-0.68, -0.3], [0.68, -0.3], [-0.68, 0.3], [0.68, 0.3]].map(([x, z], i) => (
          <mesh key={`leg${i}`} position={[x, 0.36, z]} castShadow>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshStandardMaterial color="#120c08" roughness={0.8} />
          </mesh>
        ))}
        {/* book: two pages bent slightly */}
        <group position={[0.15, 0.78, 0.02]} rotation={[-Math.PI / 2, 0, 0.08]}>
          <mesh position={[-0.2, 0, 0.008]} rotation={[0, 0.1, 0]} receiveShadow>
            <planeGeometry args={[0.4, 0.3]} />
            <meshPhysicalMaterial {...POLISH.paper} map={page} map-offset={[0, 0]} map-repeat={[0.5, 1]} />
          </mesh>
          <mesh position={[0.2, 0, 0.008]} rotation={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[0.4, 0.3]} />
            <meshPhysicalMaterial {...POLISH.paper} map={page.clone()} map-offset={[0.5, 0]} map-repeat={[0.5, 1]} />
          </mesh>
          <mesh position={[0, 0, -0.012]}>
            <RoundedBoxGeo args={[0.86, 0.34, 0.024]} radius={0.008} />
            <meshStandardMaterial color="#3a1d12" roughness={0.6} />
          </mesh>
        </group>
        {/* brass sighting tube (the instrument from Book I) */}
        <mesh position={[-0.5, 0.82, -0.05]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.42, 24]} />
          <meshStandardMaterial color="#9a7638" metalness={0.9} roughness={0.32} />
        </mesh>
        {/* extinguished candle on the desk */}
        <mesh position={[0.6, 0.86, -0.18]} castShadow>
          <cylinderGeometry args={[0.03, 0.032, 0.18, 20]} />
          <meshPhysicalMaterial {...POLISH.clay} color="#6e6250" />
        </mesh>
      </group>

      <Scholar t={t} />
      {children}
    </group>
  );
};
