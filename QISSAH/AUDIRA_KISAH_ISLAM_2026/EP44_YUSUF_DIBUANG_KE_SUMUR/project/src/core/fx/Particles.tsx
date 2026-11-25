// Deterministic 3D particle emitter for React Three Fiber.
//
// Seeded RNG makes every frame identical across renders (Remotion requirement).
// Presets cover the common kit needs: dust, sparks, snow, embers, bubbles, smoke.
//
//   <Particles preset="dust" count={120} frame={frame} fps={fps} />

import React, { useMemo } from "react";
import * as THREE from "three";

export type ParticlePreset = "dust" | "sparks" | "snow" | "embers" | "bubbles" | "smoke";

export type ParticlesProps = {
  frame: number;
  fps: number;
  count?: number;
  preset?: ParticlePreset;
  /** Bounding box half-extents [x, y, z]. */
  bounds?: readonly [number, number, number];
  /** Base particle size. */
  size?: number;
  color?: string;
  opacity?: number;
  /** Seed for deterministic placement. */
  seed?: number;
};

type ParticleConfig = {
  size: number;
  color: string;
  opacity: number;
  speed: number;
  drift: number;
  turbulence: number;
  glow: boolean;
};

const PRESETS: Record<ParticlePreset, ParticleConfig> = {
  dust: { size: 0.08, color: "#e8dcc8", opacity: 0.4, speed: 0.3, drift: 0.5, turbulence: 0.2, glow: false },
  sparks: { size: 0.06, color: "#ffaa33", opacity: 0.9, speed: 2.0, drift: 0.8, turbulence: 0.4, glow: true },
  snow: { size: 0.1, color: "#ffffff", opacity: 0.7, speed: 0.5, drift: 0.3, turbulence: 0.15, glow: false },
  embers: { size: 0.05, color: "#ff6622", opacity: 0.8, speed: 0.8, drift: 0.6, turbulence: 0.3, glow: true },
  bubbles: { size: 0.15, color: "#aaddff", opacity: 0.35, speed: 0.4, drift: 0.4, turbulence: 0.1, glow: false },
  smoke: { size: 0.3, color: "#888888", opacity: 0.25, speed: 0.2, drift: 0.7, turbulence: 0.35, glow: false },
};

function seededRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

export const Particles: React.FC<ParticlesProps> = ({
  frame,
  fps,
  count = 80,
  preset = "dust",
  bounds = [15, 15, 15],
  size: sizeOverride,
  color: colorOverride,
  opacity: opacityOverride,
  seed = 42,
}) => {
  const cfg = PRESETS[preset];
  const t = frame / fps;

  const particles = useMemo(() => {
    const rand = seededRand(seed);
    return Array.from({ length: count }, (_, i) => ({
      x: (rand() - 0.5) * 2 * bounds[0],
      y: (rand() - 0.5) * 2 * bounds[1],
      z: (rand() - 0.5) * 2 * bounds[2],
      phase: rand() * Math.PI * 2,
      speed: 0.7 + rand() * 0.6,
      sizeJitter: 0.6 + rand() * 0.8,
    }));
  }, [count, bounds[0], bounds[1], bounds[2], seed]);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const yOff = t * cfg.speed * p.speed;
      const xDrift = Math.sin(t * cfg.turbulence + p.phase) * cfg.drift;
      const zDrift = Math.cos(t * cfg.turbulence * 0.7 + p.phase) * cfg.drift;
      const bx = bounds[0], by = bounds[1], bz = bounds[2];
      arr[i * 3] = ((p.x + xDrift) % (bx * 2) + bx * 2) % (bx * 2) - bx;
      arr[i * 3 + 1] = ((p.y + yOff) % (by * 2) + by * 2) % (by * 2) - by;
      arr[i * 3 + 2] = ((p.z + zDrift) % (bz * 2) + bz * 2) % (bz * 2) - bz;
    }
    return arr;
  }, [frame, count, particles, cfg, bounds]);

  const sizes = useMemo(() => {
    const s = sizeOverride ?? cfg.size;
    return new Float32Array(particles.map((p) => s * p.sizeJitter));
  }, [particles, sizeOverride, cfg.size]);

  const finalColor = colorOverride ?? cfg.color;
  const finalOpacity = opacityOverride ?? cfg.opacity;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={sizeOverride ?? cfg.size}
        color={finalColor}
        transparent
        opacity={finalOpacity}
        depthWrite={false}
        sizeAttenuation
        blending={cfg.glow ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
};
