import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";
import { HISTORYMAP_PALETTE } from "../../kits/historymap/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const P = HISTORYMAP_PALETTE;

const COUNTRIES = [
  { name: "SWISS", pos: [-0.3, 0, -0.4] as const, color: "#2E7D32", size: [0.5, 0.4] as const, mountains: true },
  { name: "THAILAND", pos: [2.1, 0, 0.5] as const, color: "#F9A825", size: [0.4, 0.7] as const, mountains: false },
  { name: "ETHIOPIA", pos: [0.6, 0, 1.0] as const, color: P.romanCrimson, size: [0.6, 0.5] as const, mountains: true },
  { name: "JEPANG", pos: [3.0, 0, -0.6] as const, color: "#C62828", size: [0.3, 0.8] as const, mountains: true },
  { name: "NEPAL", pos: [1.8, 0, -0.2] as const, color: "#6A1B9A", size: [0.5, 0.25] as const, mountains: true },
];

function gaussianPeak(x: number, z: number, cx: number, cz: number, h: number, s: number) {
  const dx = x - cx;
  const dz = z - cz;
  return h * Math.exp(-(dx * dx + dz * dz) / (2 * s * s));
}

const MountainRange: React.FC<{ cx: number; cz: number; count: number; spread: number; seed: number }> = ({
  cx, cz, count, spread, seed,
}) => {
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const a = (seed + i * 137.5) % 360;
    const r = spread * (0.3 + 0.7 * ((seed * (i + 1) * 7) % 100) / 100);
    const px = cx + r * Math.cos((a * Math.PI) / 180);
    const pz = cz + r * Math.sin((a * Math.PI) / 180);
    const h = 0.15 + 0.2 * gaussianPeak(i, 0, count / 2, 0, 1, count / 3);
    peaks.push(
      <mesh key={i} position={[px, h / 2 - 0.15, pz]}>
        <coneGeometry args={[0.12 + h * 0.3, h, 4]} />
        <meshStandardMaterial color="#404B5A" roughness={0.88} />
      </mesh>
    );
  }
  return <>{peaks}</>;
};

const CountryTerritory: React.FC<{
  pos: readonly [number, number, number];
  color: string;
  size: readonly [number, number];
}> = ({ pos, color, size }) => (
  <mesh position={[pos[0], -0.17, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[size[0], size[1]]} />
    <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.8} />
  </mesh>
);

const GoldPin: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.15, 0]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={P.borderGold} />
    </mesh>
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 0.2]} />
      <meshBasicMaterial color={P.borderGold} />
    </mesh>
  </group>
);

const WorldMapTable: React.FC = () => (
  <group>
    {/* Base slab */}
    <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 5.5]} />
      <meshStandardMaterial color={P.terrainNeutral} roughness={0.9} />
    </mesh>

    {/* Simplified continents as lighter terrain patches */}
    {/* Europe */}
    <mesh position={[-0.5, -0.19, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.8, 1.2]} />
      <meshStandardMaterial color="#3A4452" roughness={0.88} />
    </mesh>
    {/* Asia */}
    <mesh position={[1.8, -0.19, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.2, 2.5]} />
      <meshStandardMaterial color="#3A4452" roughness={0.88} />
    </mesh>
    {/* Africa */}
    <mesh position={[0.3, -0.19, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.5, 2.0]} />
      <meshStandardMaterial color="#3A4452" roughness={0.88} />
    </mesh>

    {/* Ocean grid lines */}
    {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
      <mesh key={`lon${i}`} position={[x, -0.195, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.01, 5.5]} />
        <meshBasicMaterial color="#1E2530" />
      </mesh>
    ))}
    {[-2, -1, 0, 1, 2].map((z, i) => (
      <mesh key={`lat${i}`} position={[0.5, -0.195, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 0.01]} />
        <meshBasicMaterial color="#1E2530" />
      </mesh>
    ))}

    {/* Rivers */}
    <mesh position={[-0.2, -0.185, -0.2]} rotation={[-Math.PI / 2, 0, Math.PI * 0.1]}>
      <planeGeometry args={[1.8, 0.06]} />
      <meshBasicMaterial color={P.riverBlue} />
    </mesh>
    <mesh position={[1.5, -0.185, 0.3]} rotation={[-Math.PI / 2, 0, -Math.PI * 0.15]}>
      <planeGeometry args={[2.0, 0.06]} />
      <meshBasicMaterial color={P.riverBlue} />
    </mesh>
    <mesh position={[0.5, -0.185, 1.3]} rotation={[-Math.PI / 2, 0, Math.PI * 0.05]}>
      <planeGeometry args={[0.8, 0.05]} />
      <meshBasicMaterial color={P.riverBlue} />
    </mesh>

    {/* Country territories + pins + mountains */}
    {COUNTRIES.map((c) => (
      <React.Fragment key={c.name}>
        <CountryTerritory pos={c.pos} color={c.color} size={c.size} />
        <GoldPin x={c.pos[0]} z={c.pos[2]} />
        {c.mountains && (
          <MountainRange
            cx={c.pos[0]}
            cz={c.pos[2]}
            count={5}
            spread={Math.max(c.size[0], c.size[1]) * 0.6}
            seed={c.name.charCodeAt(0) * 7}
          />
        )}
      </React.Fragment>
    ))}

    {/* Warm spot pool on lower map (memory lesson) */}
    <mesh position={[0.5, -0.188, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.2, 32]} />
      <meshBasicMaterial color="#2A1F10" transparent opacity={0.25} />
    </mesh>
  </group>
);

export const COVER_SECONDS = 1;

export const CoverMustahilDijajah: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#1B2028" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: [0.3, 6.5, 5.0],
          fov: 36,
          near: 0.1,
          far: 60,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0.5, 0, 0.2);
        }}
      >
        <ambientLight intensity={0.45} color="#FFFFFF" />
        <directionalLight position={[4.5, 7.5, 5.0]} intensity={1.65} color="#FFF8E7" />
        <directionalLight position={[-4.0, 4.0, -3.5]} intensity={0.75} color="#90CAF9" />

        <WorldMapTable />

        <Finish frame={0} background="#1B2028" profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} />
      </ThreeCanvas>

      {/* Title overlay — screen-space HTML on dark plate (memory: never 3D text) */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(10, 10, 10, 0.75)",
            padding: "10px 28px",
            borderLeft: "3px solid #FFB300",
          }}
        >
          <div style={{ color: "#FFB300", fontSize: 14, fontFamily: "Inter, Segoe UI, sans-serif", letterSpacing: 2, fontWeight: 600 }}>
            FAKTA DUNIA
          </div>
        </div>
        <div
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            padding: "14px 32px",
            marginTop: 8,
          }}
        >
          <div
            style={{
              color: "#ECEFF4",
              fontSize: 36,
              fontFamily: "Inter, Segoe UI, sans-serif",
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            5 NEGARA
            <br />
            MUSTAHIL DIJAJAH
          </div>
        </div>
      </div>

      {/* Country labels — screen-space HTML on dark plates (memory fix) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[
          { name: "SWISS", top: "52%", left: "38%" },
          { name: "THAILAND", top: "55%", left: "72%" },
          { name: "ETHIOPIA", top: "68%", left: "50%" },
          { name: "JEPANG", top: "42%", left: "82%" },
          { name: "NEPAL", top: "48%", left: "65%" },
        ].map((c) => (
          <div
            key={c.name}
            style={{
              position: "absolute",
              top: c.top,
              left: c.left,
              transform: "translate(-50%, -50%)",
              background: "rgba(10, 10, 10, 0.72)",
              padding: "3px 10px",
              borderLeft: "2px solid #D4AF37",
            }}
          >
            <span
              style={{
                color: "#ECEFF4",
                fontSize: 15,
                fontFamily: "Inter, Segoe UI, sans-serif",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
