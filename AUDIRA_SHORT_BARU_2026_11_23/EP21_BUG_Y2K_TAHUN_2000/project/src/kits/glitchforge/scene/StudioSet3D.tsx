import React, { useMemo } from "react";
import * as THREE from "three";
import { GLITCH_PALETTE as P } from "../lib/palette";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";

// Seamless white cyclorama (floor + coved wall with a printed calibration grid), a turned plinth, and a broadcast test card on a stand
// in the background — the clean "product shot" that the glitch will tear apart.
const testCard = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext("2d")!;
  const bars = ["#E6E6E6", "#E6E61A", "#1AE6E6", "#1AE61A", "#E61AE6", "#E61A1A", "#1A1AE6"];
  bars.forEach((b, i) => {
    ctx.fillStyle = b;
    ctx.fillRect((i * 512) / 7, 0, 512 / 7 + 1, 260);
  });
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgb(${i * 32},${i * 32},${i * 32})`;
    ctx.fillRect((i * 512) / 8, 260, 512 / 8 + 1, 60);
  }
  ctx.fillStyle = P.ink;
  ctx.fillRect(0, 320, 512, 64);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("FEED 68 // CAL", 256, 364);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/**
 * One cell of a printed calibration grid (backdrop for the cyc). Mid-grey lines with a small cross
 * at each node: it keeps the white studio look but gives the orbit real background parallax.
 */
const gridTex = (rx: number, ry: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = P.studio;
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#B4B7C1";
  g.fillRect(0, 0, 128, 3);
  g.fillRect(0, 0, 3, 128);
  g.fillStyle = "#8D919C";
  g.fillRect(0, 0, 14, 5);
  g.fillRect(0, 0, 5, 14);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  return t;
};

/** Gaffer-tape floor marks (seeded grid): studio texture that gives the orbit something to slide past. */
const TAPE = (() => {
  const out: { x: number; z: number; r: number; c: string }[] = [];
  let k = 0;
  for (let z = -3.5; z <= 5.5; z += 1.5) {
    for (let x = -7.5; x <= 7.5; x += 1.5) {
      k++;
      if (Math.hypot(x, z) < 1.6) continue; // keep the plinth footprint clean
      const h = Math.sin(k * 12.9898) * 43758.5453;
      const f = h - Math.floor(h);
      out.push({ x: x + (f - 0.5) * 0.3, z: z + (f - 0.5) * 0.2, r: f * 0.6, c: f < 0.18 ? P.signalRed : f < 0.3 ? P.cyan : "#2A2C33" });
    }
  }
  return out;
})();

export const StudioSet3D: React.FC = () => {
  const res = useMemo(() => {
    // coved cyclorama: quarter-cylinder joining floor to wall
    const cove = new THREE.CylinderGeometry(4, 4, 30, 32, 1, true, Math.PI, Math.PI / 2);
    cove.rotateZ(Math.PI / 2);
    return { cove, card: testCard(), wallGrid: gridTex(30, 16), coveGrid: gridTex(6, 30) };
  }, []);
  // faint seeded paper grain on the cyc so the white is a surface, not a flat fill
  const grain = useSurfaceGrain(68, 0.08, 6);
  const mat = <meshPhysicalMaterial {...POLISH.paper} color={P.studio} bumpMap={grain} bumpScale={0.35} />;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        {mat}
      </mesh>
      <mesh geometry={res.cove} position={[0, 4, -6]} receiveShadow>
        <meshPhysicalMaterial {...POLISH.paper} map={res.coveGrid} />
      </mesh>
      <mesh position={[0, 12, -10]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshPhysicalMaterial {...POLISH.paper} map={res.wallGrid} />
      </mesh>
      {/* floor marks: small taped crosses */}
      {TAPE.map(({ x, z, r, c }, i) => (
        <group key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, r]}>
          <mesh>
            <planeGeometry args={[0.34, 0.05]} />
            <meshBasicMaterial color={c} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.34, 0.05]} />
            <meshBasicMaterial color={c} />
          </mesh>
        </group>
      ))}
      {/* plinth */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.9, 64]} />
        <meshPhysicalMaterial color={P.plinth} roughness={0.25} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.91, 0]}>
        <torusGeometry args={[1.05, 0.012, 8, 96]} />
        <meshBasicMaterial color={P.cyan} toneMapped={false} />
      </mesh>
      {/* test card on a stand, back left */}
      <group position={[-2.6, 0, -3.2]} rotation={[0, 0.45, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
          <meshPhysicalMaterial color="#888C96" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.05, 0.03]} castShadow>
          <RoundedBoxGeo args={[1.6, 1.2, 0.04]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1A1B20" />
        </mesh>
        <mesh position={[0, 2.05, 0.055]}>
          <planeGeometry args={[1.5, 1.1]} />
          <meshBasicMaterial map={res.card} toneMapped={false} />
        </mesh>
      </group>
      {/* second monitor on a stand, back right: SMPTE bars on the other side of the orbit */}
      <group position={[3.4, 0, -1.2]} rotation={[0, -0.7, 0]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <meshPhysicalMaterial color="#888C96" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.75, 0.03]} castShadow>
          <RoundedBoxGeo args={[1.3, 1.0, 0.05]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1A1B20" />
        </mesh>
        <mesh position={[0, 1.75, 0.06]}>
          <planeGeometry args={[1.2, 0.9]} />
          <meshBasicMaterial map={res.card} toneMapped={false} />
        </mesh>
      </group>
      {/* light stand silhouette, back right */}
      <group position={[3.0, 0, -2.6]}>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.025, 0.04, 2.8, 8]} />
          <meshPhysicalMaterial color="#2A2C33" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.95, 0.1]} rotation={[0.5, -0.6, 0]}>
          <RoundedBoxGeo args={[0.9, 0.6, 0.12]} radius={0.03} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2A2C33" />
        </mesh>
        <mesh position={[-0.03, 2.93, 0.17]} rotation={[0.5, -0.6, 0]}>
          <planeGeometry args={[0.82, 0.52]} />
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};
