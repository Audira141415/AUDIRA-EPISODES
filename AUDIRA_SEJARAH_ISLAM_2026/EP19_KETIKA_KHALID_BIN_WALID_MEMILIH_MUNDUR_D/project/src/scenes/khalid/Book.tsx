// s3 book tray: an open leather book (pages carry abstract ruled lines, no lettering), a lantern
// with a live flame, a wax drop on "air mata", and three mini banners for the three commanders:
// each glows while its name is spoken and falls on its "gugur".
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Banner } from "./Banner.tsx";
import { CUE } from "./cues.ts";
import { BOOK } from "./geo.ts";
import { easeInCubic, lin, ss } from "./timing.ts";

export const LANTERN: [number, number, number] = [BOOK[0] + 1.05, 0, BOOK[1] - 0.5];
export const CANDLE_LIGHT: [number, number, number] = [LANTERN[0], 0.32, LANTERN[2]];

const pageTexture = (seed: number) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const g = c.getContext("2d")!;
  g.fillStyle = "#efe2c2";
  g.fillRect(0, 0, 512, 640);
  const grd = g.createRadialGradient(256, 320, 120, 256, 320, 420);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(1, "rgba(120,80,30,0.28)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 640);
  // ornamental frame
  g.strokeStyle = "rgba(150,100,40,0.8)";
  g.lineWidth = 5;
  g.strokeRect(40, 40, 432, 560);
  g.lineWidth = 2;
  g.strokeRect(52, 52, 408, 536);
  // abstract ruled lines of varying length (not letters)
  let r = seed;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  g.strokeStyle = "rgba(60,40,25,0.62)";
  g.lineCap = "round";
  for (let y = 96; y < 560; y += 26) {
    let x = 470 - rnd() * 20;
    const end = 80 + (y > 520 ? 160 * rnd() : 0);
    g.lineWidth = 4;
    while (x > end) {
      const len = 18 + rnd() * 50;
      g.beginPath();
      g.moveTo(x, y + Math.sin(x * 0.2) * 1.2);
      g.lineTo(Math.max(end, x - len), y);
      g.stroke();
      x -= len + 10 + rnd() * 8;
    }
  }
  g.fillStyle = "rgba(160,40,30,0.75)";
  g.beginPath();
  g.arc(256, 82, 9, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const Page: React.FC<{ side: 1 | -1; seed: number }> = ({ side, seed }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.62, 0.84, 24, 6);
    g.rotateX(-Math.PI / 2);
    g.translate((side * 0.62) / 2, 0, 0);
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const u = Math.abs(a.getX(i)) / 0.62;
      a.setY(i, Math.sin(Math.min(1, u * 1.1) * Math.PI * 0.5) * 0.06 * (1 - u * 0.55) + 0.004);
    }
    g.computeVertexNormals();
    return g;
  }, [side]);
  const tex = useMemo(() => pageTexture(seed), [seed]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial map={tex} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Flame: React.FC<{ t: number }> = ({ t }) => {
  const f = 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 31 + 1) * 0.05;
  return (
    <group position={[CANDLE_LIGHT[0], 0.27, CANDLE_LIGHT[2]]} scale={[1, f, 1]}>
      <mesh>
        <sphereGeometry args={[0.022, 12, 10]} />
        <meshBasicMaterial color="#fff2c0" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <coneGeometry args={[0.02, 0.06, 12]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Candle light strength for LightRig (flickers). */
export const candleIntensity = (t: number) => (2.2 + Math.sin(t * 13) * 0.25 + Math.sin(t * 29) * 0.15) * ss(15.5, 17.5, t) * (1 - ss(30.5, 31.5, t));

const TRIO = [
  { dx: -0.6, glow: [CUE.zaid, CUE.gugurZaid], fall: CUE.gugurZaid, fy: 0.9, color: "#2F6B4F" },
  { dx: 0, glow: [CUE.jafar, CUE.gugurJafar], fall: CUE.gugurJafar, fy: 1.3, color: "#2F6B4F" },
  { dx: 0.6, glow: [CUE.abdullah, CUE.gugurAll], fall: CUE.gugurAll, fy: 1.9, color: "#2F6B4F" },
];

export const Book: React.FC<{ t: number }> = ({ t }) => {
  const drop = lin(CUE.airMata, CUE.airMata + 0.55, t);
  return (
    <group>
      <group position={[BOOK[0], 0, BOOK[1]]}>
        {/* tray */}
        <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[2.7, 0.06, 2.0]} radius={0.02} />
          <meshStandardMaterial color="#4a2f1c" roughness={0.5} />
        </mesh>
        {/* book, yawed toward the camera */}
        <group position={[0, 0.06, -0.12]} rotation={[0, 0.9, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.33, 0.012, 0]} rotation={[0, 0, s * -0.05]} castShadow receiveShadow>
              <RoundedBoxGeo args={[0.68, 0.024, 0.9]} radius={0.008} />
              <meshPhysicalMaterial color="#6b2a1c" roughness={0.6} sheen={0.4} sheenColor="#c08050" />
            </mesh>
          ))}
          <group position={[0, 0.03, 0]}>
            <Page side={-1} seed={4261} />
            <Page side={1} seed={4262} />
          </group>
          <mesh position={[0, 0.06, 0.44]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.18, 6]} />
            <meshStandardMaterial color="#9b2a22" />
          </mesh>
        </group>
        {/* three commanders' banners */}
        {TRIO.map((b, i) => (
          <Banner key={i} t={t} color={b.color} h={0.6} w={0.3} ch={0.2} position={[b.dx, 0.06, 0.55]} yaw={0.4}
            glow={ss(b.glow[0] - 0.2, b.glow[0] + 0.3, t) * (1 - ss(b.glow[1], b.glow[1] + 0.6, t))}
            fall={easeInCubic(lin(b.fall, b.fall + 0.5, t))} fallYaw={b.fy} seed={i * 3 + 1} />
        ))}
      </group>
      {/* lantern + flame */}
      <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={0.45} ground position={[LANTERN[0], 0.06, LANTERN[2]]} />
      <Flame t={t} />
      {drop > 0 && drop < 1 ? (
        <mesh position={[CANDLE_LIGHT[0] + 0.03, 0.22 - drop * drop * 0.16, CANDLE_LIGHT[2] + 0.02]} scale={[1, 1.4, 1]}>
          <sphereGeometry args={[0.012, 10, 8]} />
          <meshStandardMaterial color="#fff6dc" emissive="#ffcf80" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      ) : null}
    </group>
  );
};
