// Studio props: the potter's wheel (enamel body, splash pan with slip, spinning aluminium head),
// the wood-fired brick kiln with a glowing mouth, the rack of matte fired terracotta (kendi,
// gentong, pots, bowls, a stamped AUDIRA plaque), the wooden rib and the glaze jug.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";
import { CLAY, GERABAH_PALETTE as P } from "../lib/palette.ts";
import { SHAPES, vesselPoints } from "../lib/profile.ts";
import { brickTexture, noise2, stampTexture, terracottaTexture, wheelHeadTexture } from "../lib/textures.ts";

type V3 = [number, number, number];
export const WHEEL_Y = 0.5;

// --- Wheel -------------------------------------------------------------------------------------
export const Wheel: React.FC<{ angle: number }> = ({ angle }) => {
  const pan = useMemo(() => {
    const pts = [[0.1, 0.36], [0.355, 0.36], [0.375, 0.372], [0.38, 0.465], [0.372, 0.472], [0.362, 0.462], [0.358, 0.378], [0.1, 0.378]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  const head = wheelHeadTexture();
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.64, 0.36, 0.58]} radius={0.05} />
        <meshPhysicalMaterial color={P.wheelBody} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} metalness={0.15} />
      </mesh>
      {/* Clay smears on the body */}
      <mesh position={[0.12, 0.25, 0.291]}>
        <circleGeometry args={[0.05, 24]} />
        <meshStandardMaterial color={CLAY.slip} roughness={0.7} transparent opacity={0.55} />
      </mesh>
      <mesh geometry={pan} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.tray} roughness={0.5} clearcoat={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Wet slip pooled in the splash pan */}
      <mesh position={[0, 0.381, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.1, 0.358, 96]} />
        <meshPhysicalMaterial color={CLAY.slip} roughness={0.15} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* Spindle and the spinning head */}
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 20]} />
        <meshStandardMaterial color={P.steel} metalness={0.9} roughness={0.35} />
      </mesh>
      <group position={[0, WHEEL_Y - 0.015, 0]} rotation={[0, angle, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.245, 0.03, 96]} />
          <meshPhysicalMaterial map={head} metalness={0.75} roughness={0.32} clearcoat={0.5} clearcoatRoughness={0.2} />
        </mesh>
      </group>
      {/* Pedal */}
      <mesh position={[0.26, 0.03, 0.38]} rotation={[-0.15, 0.4, 0]} castShadow>
        <RoundedBoxGeo args={[0.12, 0.04, 0.18]} radius={0.015} />
        <meshPhysicalMaterial color="#1E2628" roughness={0.5} />
      </mesh>
    </group>
  );
};

// --- Terracotta pieces -------------------------------------------------------------------------
export const Terracotta: React.FC<{ shape: keyof typeof SHAPES; position: V3; scale?: number; base?: string; seed?: number; band?: boolean; rotation?: number; spout?: boolean }> = ({
  shape, position, scale = 1, base = CLAY.fired, seed = 1, band = true, rotation = 0, spout = false,
}) => {
  const S = SHAPES[shape];
  const geo = useMemo(() => new THREE.LatheGeometry(vesselPoints(S.keys, S.h), 72), [S]);
  const { map, bump } = terracottaTexture(base, seed, band);
  const mat = (
    <meshPhysicalMaterial map={map} bumpMap={bump} bumpScale={1.1} roughness={0.93} sheen={0.35} sheenRoughness={0.75} sheenColor="#ffcfa8" side={THREE.DoubleSide} />
  );
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        {mat}
      </mesh>
      {spout && (
        // Kendi spout: a tapered tube out of the shoulder.
        <mesh position={[0.085, S.h * 0.55, 0]} rotation={[0, 0, -0.75]} castShadow>
          <cylinderGeometry args={[0.012, 0.022, 0.09, 16]} />
          {mat}
        </mesh>
      )}
    </group>
  );
};

/** A terracotta tile with AUDIRA stamped into it. */
export const StampPlaque: React.FC<{ position: V3; rotation?: V3 }> = ({ position, rotation }) => {
  const { map, bump } = stampTexture("AUDIRA", CLAY.fired);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[0.3, 0.115, 0.02]} radius={0.008} />
        <meshPhysicalMaterial color="#8f4a2c" roughness={0.94} sheen={0.3} sheenColor="#ffcfa8" />
      </mesh>
      <mesh position={[0, 0, 0.0102]} receiveShadow>
        <planeGeometry args={[0.288, 0.105]} />
        <meshPhysicalMaterial map={map} bumpMap={bump} bumpScale={3} roughness={0.92} sheen={0.3} sheenColor="#ffcfa8" />
      </mesh>
    </group>
  );
};

// --- Rack --------------------------------------------------------------------------------------
const Plank: React.FC<{ position: V3; args: V3 }> = ({ position, args }) => (
  <mesh position={position} castShadow receiveShadow>
    <RoundedBoxGeo args={args} radius={0.006} />
    <meshPhysicalMaterial color={P.shelf} roughness={0.75} sheen={0.2} />
  </mesh>
);
export const Rack: React.FC<{ position: V3; rotation?: number }> = ({ position, rotation = 0 }) => {
  const W = 0.78, D = 0.26;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0.32, 0.72, 1.12].map((y) => (
        <Plank key={y} position={[0, y, 0]} args={[W, 0.025, D]} />
      ))}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Plank key={`${sx}${sz}`} position={[(sx * (W - 0.03)) / 2, 0.62, (sz * (D - 0.03)) / 2]} args={[0.03, 1.24, 0.03]} />))}
      {/* Fired pieces: matte red and dark Kasongan bodies, incised bands */}
      <Terracotta shape="gentong" position={[-0.2, 0.333, 0]} base={CLAY.firedDark} seed={3} />
      <Terracotta shape="kendi" position={[0.06, 0.333, 0.02]} seed={5} spout rotation={0.5} />
      <Terracotta shape="pot" position={[0.27, 0.333, -0.02]} seed={7} />
      <Terracotta shape="vaseTall" position={[-0.22, 0.733, 0]} seed={9} />
      <Terracotta shape="celengan" position={[0.0, 0.733, 0.02]} base="#B5603A" seed={11} band={false} />
      <Terracotta shape="bowl" position={[0.22, 0.733, 0]} seed={13} />
      <Terracotta shape="bowl" position={[0.22, 0.79, 0]} scale={0.9} seed={14} />
      <Terracotta shape="gentong" position={[-0.17, 1.133, 0]} scale={0.8} seed={15} />
      <Terracotta shape="kendi" position={[0.16, 1.133, 0]} scale={0.9} base={CLAY.firedDark} seed={17} spout rotation={2.2} />
    </group>
  );
};

// --- Kiln --------------------------------------------------------------------------------------
const mouthTexture = () => {
  const W = 256, H = 320;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(W / 2, H * 0.62, 10, W / 2, H * 0.62, H * 0.7);
  grad.addColorStop(0, "#FFF4C8");
  grad.addColorStop(0.35, "#FFB447");
  grad.addColorStop(0.7, "#E0521A");
  grad.addColorStop(1, "#5A1606");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // Pots stacked inside, silhouetted against the fire.
  g.fillStyle = "rgba(60,14,4,0.82)";
  const pot = (x: number, y: number, w: number, h: number) => {
    g.beginPath();
    g.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(x - w * 0.35, y - h * 1.25, w * 0.7, h * 0.5);
  };
  pot(70, 250, 42, 40);
  pot(170, 255, 48, 38);
  pot(120, 175, 36, 30);
  for (let i = 0; i < 1400; i++) {
    const x = noise2(i * 0.37, 1, 3) * W, y = noise2(i * 0.53, 2, 5) * H;
    g.fillStyle = `rgba(255,${180 + (i % 60)},90,0.25)`;
    g.fillRect(x, y, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const Kiln: React.FC<{ position: V3; heat: number; t: number }> = ({ position, heat, t }) => {
  const R = 0.58;
  const { map, bump } = brickTexture();
  const bodyMap = useMemo(() => {
    const m = map.clone();
    m.repeat.set(3, 1.2);
    m.needsUpdate = true;
    return m;
  }, [map]);
  const domeMap = useMemo(() => {
    const m = map.clone();
    m.repeat.set(3, 1.4);
    m.needsUpdate = true;
    return m;
  }, [map]);
  const mouth = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.17, h = 0.26;
    s.moveTo(-w, 0);
    s.lineTo(w, 0);
    s.lineTo(w, h);
    s.absarc(0, h, w, 0, Math.PI, false);
    s.lineTo(-w, 0);
    const g = new THREE.ShapeGeometry(s, 24);
    // UVs from the shape bounds.
    const pos = g.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) + w) / (2 * w);
      uv[i * 2 + 1] = pos.getY(i) / (h + w);
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }, []);
  const mouthMap = useMemo(() => mouthTexture(), []);
  const flicker = 0.85 + 0.1 * Math.sin(t * 13.1) + 0.05 * Math.sin(t * 29.7 + 1);
  const glow = (0.55 + 2.4 * heat) * flicker;
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R + 0.03, 0.6, 64, 1, true]} />
        <meshStandardMaterial map={bodyMap} bumpMap={bump} bumpScale={1.2} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[R, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial map={domeMap} bumpMap={bump} bumpScale={1.2} roughness={0.95} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0.05, 1.3, -0.1]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.5, 24]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
      {/* Glowing mouth with a brick arch around it */}
      <mesh geometry={mouth} position={[0, 0.06, R + 0.004]}>
        <meshBasicMaterial map={mouthMap} color={new THREE.Color(glow, glow, glow)} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06 + 0.26, R + 0.012]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.185, 0.03, 10, 32, Math.PI]} />
        <meshStandardMaterial map={map} roughness={0.95} color="#b98a70" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.185, 0.06 + 0.13, R + 0.012]}>
          <boxGeometry args={[0.06, 0.26, 0.05]} />
          <meshStandardMaterial map={map} roughness={0.95} color="#b98a70" />
        </mesh>
      ))}
      {/* Firewood stacked by the mouth */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0.36 + (i % 3) * 0.07, 0.035 + Math.floor(i / 3) * 0.06, R + 0.05]} rotation={[0, 0.3, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.032, 0.34, 10]} />
          <meshStandardMaterial color={i % 2 ? "#5C3B24" : "#6B4529"} roughness={0.9} />
        </mesh>
      ))}
      <pointLight position={[0, 0.25, R + 0.2]} color={P.kiln} intensity={(1.2 + 9 * heat) * flicker} distance={4.5} decay={1.6} />
    </group>
  );
};

// --- Tools -------------------------------------------------------------------------------------
/** Wooden throwing rib, pressed flat against the wall (local +z = into the clay). */
export const Rib: React.FC<{ position: V3; yaw: number; tilt: number; visible: boolean }> = ({ position, yaw, tilt, visible }) => {
  if (!visible) return null;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group rotation={[tilt, 0, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[0.06, 0.08, 0.007]} radius={0.003} />
          <meshPhysicalMaterial color="#6E4A2C" roughness={0.55} clearcoat={0.4} clearcoatRoughness={0.3} />
        </mesh>
        {/* Wet clay on the working edge */}
        <mesh position={[0, 0, -0.0042]}>
          <planeGeometry args={[0.07, 0.09]} />
          <meshPhysicalMaterial color={CLAY.wet} roughness={0.2} clearcoat={1} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

/** Glaze jug: glossy brown stoneware with a handle; `tip` 0..1 tilts it toward the spout. */
export const GlazeJug: React.FC<{ position: V3; yaw: number; tip: number }> = ({ position, yaw, tip }) => {
  const geo = useMemo(() => {
    const keys: [number, number][] = [[0, 0.04], [0.3, 0.058], [0.6, 0.06], [0.85, 0.05], [1, 0.055]];
    return new THREE.LatheGeometry(vesselPoints(keys, 0.13, 0.005), 48);
  }, []);
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Pivot at the spout lip (local +x toward the piece). */}
      <group rotation={[0, 0, -tip * 1.25]}>
        <group position={[-0.055, -0.13, 0]}>
          <mesh geometry={geo} castShadow>
            <meshPhysicalMaterial color="#4A2A1A" roughness={0.18} clearcoat={1} clearcoatRoughness={0.06} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 32]} />
            <meshPhysicalMaterial color="#AFC2B7" roughness={0.12} clearcoat={1} />
          </mesh>
          <mesh position={[-0.058, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.035, 0.008, 10, 24, Math.PI]} />
            <meshPhysicalMaterial color="#4A2A1A" roughness={0.18} clearcoat={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
