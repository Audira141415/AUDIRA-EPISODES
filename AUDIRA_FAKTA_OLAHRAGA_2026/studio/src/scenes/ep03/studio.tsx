// EP03 S2 — virtual broadcast studio after the BROADCASTFORGE kit recipe (starter/src/kits/broadcastforge):
// obsidian clearcoat floor + cyan/red floor rings, riser, navy desk with cyan LED edge, trusses, LED wall
// (here faceted: three flat panels so the canvas graphics never mirror), warm key, cool fill, cyan rim.
// Two AR pedestals carry stylised toy figures of the players (no faces, no logos).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { B } from "./palette.ts";

const FLOOR = "#0F1722";
const FONT = (w: number, px: number) => `${w} ${px}px EP03Barlow, Manrope, sans-serif`;

const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const ledBase = (g: CanvasRenderingContext2D, w: number, h: number) => {
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#0a2a52");
  grad.addColorStop(1, "#06152c");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(0,229,255,0.10)";
  g.lineWidth = 2;
  for (let x = 0; x < w; x += 64) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  for (let y = 0; y < h; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
};

export type WallMode = "title" | "players" | "rule";

const drawCenter = (mode: WallMode) => (g: CanvasRenderingContext2D) => {
  const w = 1024, h = 640;
  ledBase(g, w, h);
  g.textAlign = "center";
  g.textBaseline = "middle";
  if (mode === "rule") {
    g.fillStyle = B.breakingRed;
    g.fillRect(0, 70, w, 92);
    g.fillStyle = "#fff";
    g.font = FONT(800, 72);
    g.fillText("ATURAN 2010 · SET KELIMA", w / 2, 118);
    g.font = FONT(800, 150);
    g.fillText("TANPA", w / 2, 285);
    g.fillStyle = B.cyan;
    g.fillText("TIE-BREAK", w / 2, 425);
    g.fillStyle = "#ECEFF4";
    g.font = FONT(600, 62);
    g.fillText("MENANG HARUS SELISIH 2 GAME", w / 2, 552);
    return;
  }
  // title: a top-down court diagram + location
  g.fillStyle = B.liveAmber;
  g.font = FONT(600, 64);
  g.fillText(mode === "players" ? "BABAK PERTAMA · TUNGGAL PUTRA" : "WIMBLEDON · JUNI 2010", w / 2, 92);
  const cx = w / 2, cy = 360, cw = 520, ch = 300;
  g.fillStyle = "#2f6b2a";
  g.fillRect(cx - cw / 2 - 30, cy - ch / 2 - 30, cw + 60, ch + 60);
  g.strokeStyle = "#f4f1e8";
  g.lineWidth = 6;
  g.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);
  g.strokeRect(cx - cw / 2, cy - ch / 2 + 38, cw, ch - 76);
  g.beginPath();
  g.moveTo(cx, cy - ch / 2);
  g.lineTo(cx, cy + ch / 2);
  g.stroke();
  g.fillStyle = "#ffffff";
  g.font = FONT(800, 150);
  g.fillText("18", cx, cy + 8);
  g.fillStyle = "#ECEFF4";
  g.font = FONT(800, 66);
  g.fillText("LAPANGAN 18", w / 2, 590);
};

/** Wing panel: no text (the HUD callout carries the name), only the player's accent colour as broadcast light bars. */
const drawWing = (accent: string) => (g: CanvasRenderingContext2D) => {
  const w = 640, h = 640;
  ledBase(g, w, h);
  for (let i = 0; i < 9; i++) {
    const y = 70 + i * 58;
    const len = 180 + ((i * 97) % 5) * 70;
    const grad = g.createLinearGradient(60, 0, 60 + len, 0);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.globalAlpha = 0.35 + 0.08 * (i % 4);
    g.fillRect(60, y, len, 30);
  }
  g.globalAlpha = 1;
};

const Panel: React.FC<{ map: THREE.Texture; w: number; h: number; position: [number, number, number]; rotY: number; glow: number }> = ({ map, w, h, position, rotY, glow }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0, -0.03]}>
      <boxGeometry args={[w + 0.12, h + 0.12, 0.05]} />
      <meshStandardMaterial color="#060910" roughness={0.5} metalness={0.8} />
    </mesh>
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={map} emissiveMap={map} emissive="#ffffff" emissiveIntensity={glow} roughness={0.35} metalness={0.1} />
    </mesh>
    <mesh position={[0, h / 2 + 0.06, 0.02]}>
      <boxGeometry args={[w, 0.03, 0.02]} />
      <meshBasicMaterial color={B.cyan} toneMapped={false} />
    </mesh>
    <mesh position={[0, -h / 2 - 0.06, 0.02]}>
      <boxGeometry args={[w, 0.03, 0.02]} />
      <meshBasicMaterial color={B.breakingRed} toneMapped={false} />
    </mesh>
  </group>
);

export const LedWall: React.FC<{ f: number; mode: WallMode; isner: number; mahut: number }> = ({ f, mode, isner, mahut }) => {
  const center = useMemo(() => tex(1024, 640, drawCenter(mode)), [mode]);
  const left = useMemo(() => tex(640, 640, drawWing(B.cyan)), []);
  const right = useMemo(() => tex(640, 640, drawWing(B.liveAmber)), []);
  const blank = useMemo(() => tex(640, 640, (g) => ledBase(g, 640, 640)), []);
  const scan = ((f * 0.012) % 1) * 2.0 - 1.0;
  return (
    <group position={[0, 1.85, -2.2]}>
      <Panel map={center} w={3.2} h={2.0} position={[0, 0, 0]} rotY={0} glow={1.0} />
      <Panel map={isner > 0.5 ? left : blank} w={2.0} h={2.0} position={[-2.55, 0, 0.42]} rotY={0.42} glow={0.55 + 0.45 * isner} />
      <Panel map={mahut > 0.5 ? right : blank} w={2.0} h={2.0} position={[2.55, 0, 0.42]} rotY={-0.42} glow={0.55 + 0.45 * mahut} />
      <mesh position={[0, scan, 0.03]}>
        <boxGeometry args={[3.2, 0.025, 0.01]} />
        <meshBasicMaterial color={B.cyan} transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** AR pedestal: glowing ring plinth, the figure turns slowly on it. */
const Pedestal: React.FC<{ f: number; x: number; on: number; look: object; seed: number; heading: number }> = ({ f, x, on, look, seed, heading }) => (
  <group position={[x, 0, 1.1]}>
    <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[0.62, 0.68, 0.12, 48]} />
      <meshPhysicalMaterial color="#0b1420" roughness={0.2} metalness={0.6} clearcoat={0.6} />
    </mesh>
    <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.55, 0.6, 64]} />
      <meshBasicMaterial color={B.cyan} transparent opacity={0.25 + 0.75 * on} toneMapped={false} />
    </mesh>
    {on > 0.01 ? (
      <group scale={[1, Math.max(0.02, on), 1]}>
        <ToyPerson f={f} seed={seed} look={look} pose="stand" position={[0, 0.12, 0]} heading={heading + (1 - on) * 1.2} scale={1.0} />
      </group>
    ) : null}
    <pointLight position={[0.4, 2.4, 1.1]} intensity={14 * on} distance={5} color="#cfe9ff" />
  </group>
);

export const StudioSet: React.FC<{ f: number; mode: WallMode; isner: number; mahut: number; isnerLook: object; mahutLook: object }> = ({ f, mode, isner, mahut, isnerLook, mahutLook }) => {
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.08);
  return (
    <group>
      <color attach="background" args={[B.studioVoid]} />
      <fog attach="fog" args={[B.studioVoid, 9, 24]} />
      {/* lights: warm key with shadow, cool fill, cyan rim behind */}
      <hemisphereLight args={["#2a3a5a", "#05070a", 0.2]} />
      <directionalLight position={[3.5, 6, 6]} intensity={2.2} color="#ffe2c4" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 3, 4]} intensity={0.7} color="#90caf9" />
      <pointLight position={[0, 2.6, -1.4]} intensity={8} distance={7} color={B.cyan} />
      {/* floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshPhysicalMaterial color={FLOOR} roughness={0.16} metalness={0.42} clearcoat={0.65} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, -0.04, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 96]} />
        <meshBasicMaterial color={B.cyan} transparent opacity={0.65} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.04, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.4, 3.43, 96]} />
        <meshBasicMaterial color={B.breakingRed} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      {/* riser + desk */}
      <mesh position={[0, 0.05, 0.2]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.85, 0.1, 48]} />
        <meshStandardMaterial color={B.studioVoid} roughness={0.3} metalness={0.6} />
      </mesh>
      <group position={[0, 0.45, 0.3]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[2.4, 0.7, 0.8]} radius={0.15} />
          <meshPhysicalMaterial color={B.broadcastNavy} roughness={0.22} metalness={0.48} clearcoat={0.45} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <RoundedBoxGeo args={[2.5, 0.04, 0.9]} radius={0.02} />
          <meshPhysicalMaterial color="#080C14" roughness={0.08} metalness={0.25} transmission={0.45} thickness={0.06} />
        </mesh>
        <mesh position={[0, 0.05, 0.41]}>
          <boxGeometry args={[2.2, 0.04, 0.02]} />
          <meshBasicMaterial color={B.cyan} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.12, 0.41]}>
          <boxGeometry args={[0.9, 0.22, 0.01]} />
          <meshStandardMaterial color={B.breakingRed} emissive={B.breakingRed} emissiveIntensity={0.25 + 0.35 * pulse} roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      {/* trusses */}
      {[-2.5, 2.5].map((x) => (
        <group key={x} position={[x, 3.4, -1.0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 4.0, 16]} />
            <meshStandardMaterial color="#222834" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation={[0.4, x > 0 ? -0.3 : 0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 0.3, 16]} />
            <meshStandardMaterial color="#111620" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <LedWall f={f} mode={mode} isner={isner} mahut={mahut} />
      <Pedestal f={f} x={-2.4} on={isner} look={isnerLook} seed={23} heading={0.35} />
      <Pedestal f={f} x={2.4} on={mahut} look={mahutLook} seed={41} heading={-0.35} />
    </group>
  );
};
