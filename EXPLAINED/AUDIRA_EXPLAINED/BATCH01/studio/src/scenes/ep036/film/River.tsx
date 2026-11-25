// EP036 film: a river-level sensor on a canal bank sends an early warning to a control room screen.
// Generic canal (labelled Kali Krukut in the overlay), no real logos; screen text is drawn procedurally.

import React, { useLayoutEffect, useMemo } from "react";
import { CanvasTexture, ExtrudeGeometry, MeshStandardMaterial, Shape, SRGBColorSpace } from "three";
import { FONT } from "../../../core/type/fonts.ts";
import { P } from "../layout.ts";
import { FLOOD } from "./Diorama.tsx";

export const RV = { len: 30, sensorX: 5.2, roomX0: 11, roomX1: 19 };
export type RiverState = { t: number; level: number; signal: number; alert: number; history: number[] };

const bankX = (y: number) => 3 + ((y + 3) / 3) * 1.5;

export const RiverSet: React.FC<{ s: RiverState }> = ({ s }) => {
  const ground = useMemo(() => {
    const sh = new Shape();
    sh.moveTo(-12, -6);
    sh.lineTo(24, -6);
    sh.lineTo(24, 0);
    sh.lineTo(4.5, 0);
    sh.lineTo(3, -3);
    sh.lineTo(-3, -3);
    sh.lineTo(-4.5, 0);
    sh.lineTo(-12, 0);
    sh.closePath();
    const g = new ExtrudeGeometry(sh, { depth: RV.len, bevelEnabled: false });
    g.translate(0, 0, -RV.len / 2);
    return { g, mats: [new MeshStandardMaterial({ color: "#b99670", roughness: 0.95 }), new MeshStandardMaterial({ color: "#cfcac0", roughness: 0.85 })] };
  }, []);
  const water = useMemo(() => {
    const y = s.level;
    const sh = new Shape();
    sh.moveTo(-3, -3);
    sh.lineTo(3, -3);
    sh.lineTo(bankX(y), y);
    sh.lineTo(-bankX(y), y);
    sh.closePath();
    const g = new ExtrudeGeometry(sh, { depth: RV.len - 0.02, bevelEnabled: false });
    g.translate(0, 0, -RV.len / 2 + 0.01);
    return g;
  }, [s.level]);
  const screen = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 576;
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    return { c, tex };
  }, []);
  useLayoutEffect(() => {
    const g = screen.c.getContext("2d")!;
    g.fillStyle = "#0f1a24";
    g.fillRect(0, 0, 1024, 576);
    g.fillStyle = "#8fb9d6";
    g.font = `600 40px ${FONT}, sans-serif`;
    g.fillText("TINGGI AIR · KALI KRUKUT", 48, 72);
    // grid
    g.strokeStyle = "rgba(143,185,214,0.18)";
    g.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(48, 120 + i * 70);
      g.lineTo(976, 120 + i * 70);
      g.stroke();
    }
    // level history
    g.strokeStyle = s.alert > 0.5 ? "#ff8a5c" : "#5ea7dc";
    g.lineWidth = 8;
    g.beginPath();
    s.history.forEach((v, i) => {
      const x = 48 + (i / Math.max(1, s.history.length - 1)) * 928;
      const y = 470 - v * 330;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.stroke();
    // threshold
    g.setLineDash([24, 16]);
    g.strokeStyle = "#f4b33f";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(48, 470 - 0.7 * 330);
    g.lineTo(976, 470 - 0.7 * 330);
    g.stroke();
    g.setLineDash([]);
    if (s.alert > 0) {
      const blink = Math.sin(s.t * 10) > -0.3 ? 1 : 0.55;
      g.globalAlpha = Math.min(1, s.alert) * blink;
      g.fillStyle = "#ef7a43";
      g.fillRect(560, 100, 416, 96);
      g.fillStyle = "#ffffff";
      g.font = `700 46px ${FONT}, sans-serif`;
      g.fillText("PERINGATAN DINI", 584, 166);
      g.globalAlpha = 1;
    }
    screen.tex.needsUpdate = true;
  }, [s.t, s.alert, s.history, screen]);
  const led = 0.5 + 0.5 * Math.sin(s.t * 8);
  return (
    <group>
      <hemisphereLight args={["#eef3f7", "#b9a68f", 0.9]} />
      <directionalLight position={[-14, 26, 18]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-far={90} shadow-bias={-0.0004} />
      <mesh geometry={ground.g} material={ground.mats} receiveShadow castShadow />
      {[
        [-8.25, 7.5],
        [14.25, 19.5],
      ].map(([x, w], i) => (
        <mesh key={i} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, RV.len]} />
          <meshStandardMaterial color="#cfe0bf" roughness={0.9} />
        </mesh>
      ))}
      <mesh geometry={water}>
        <meshPhysicalMaterial color={FLOOD} roughness={0.2} transparent opacity={0.94} clearcoat={0.3} />
      </mesh>
      {/* sensor pole with arm over the water */}
      <group position={[RV.sensorX, 0, 4]}>
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 4.4, 14]} />
          <meshStandardMaterial color="#9aa1a8" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[-1.4, 4.2, 0]} castShadow>
          <boxGeometry args={[2.9, 0.12, 0.12]} />
          <meshStandardMaterial color="#9aa1a8" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[-2.75, 3.95, 0]} castShadow>
          <boxGeometry args={[0.5, 0.42, 0.42]} />
          <meshStandardMaterial color="#f2f3f1" roughness={0.4} />
        </mesh>
        <mesh position={[-2.75, 3.7, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.12, 20]} />
          <meshStandardMaterial color="#2a2b2d" roughness={0.5} />
        </mesh>
        <mesh position={[0.0, 4.55, 0]}>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshStandardMaterial color="#ff8a5c" emissive="#ff6a3d" emissiveIntensity={0.5 + led * 3 * s.alert} />
        </mesh>
        {/* sensing beam to the water surface */}
        <mesh position={[-2.75, (3.6 + s.level) / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 3.6 - s.level, 8]} />
          <meshBasicMaterial color={P.water} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.4]} />
          <meshStandardMaterial color="#d9d4ca" roughness={0.8} />
        </mesh>
      </group>
      {/* signal pulses travelling to the control room */}
      {s.signal > 0.01 &&
        Array.from({ length: 4 }, (_, i) => {
          const k = (((i / 4 + s.t * 0.7) % 1) + 1) % 1;
          const x = RV.sensorX + 0.4 + k * (RV.roomX0 + 2 - RV.sensorX);
          const y = 4.6 + Math.sin(k * Math.PI) * 1.8;
          return (
            <mesh key={i} position={[x, y, 4 - k * 4]} rotation={[0, Math.PI / 2, 0]} scale={s.signal * (0.6 + k * 0.6)}>
              <torusGeometry args={[0.5, 0.06, 8, 32, Math.PI]} />
              <meshStandardMaterial color={P.water} emissive={P.water} emissiveIntensity={1.4} transparent opacity={1 - k * 0.5} />
            </mesh>
          );
        })}
      {/* control room, front wall removed */}
      <group position={[(RV.roomX0 + RV.roomX1) / 2, 0, -0.5]}>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[8, 0.2, 6]} />
          <meshStandardMaterial color="#e9e6e0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.0, -3]} receiveShadow>
          <boxGeometry args={[8, 4, 0.2]} />
          <meshStandardMaterial color="#f1eee8" roughness={0.8} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 4, 2.0, 0]} castShadow>
            <boxGeometry args={[0.2, 4, 6]} />
            <meshStandardMaterial color="#e6e2da" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 4.1, 0]} castShadow>
          <boxGeometry args={[8.4, 0.2, 6.4]} />
          <meshStandardMaterial color="#d8d3ca" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.2, -2.88]}>
          <planeGeometry args={[5.4, 3.04]} />
          <meshStandardMaterial map={screen.tex} emissive="#ffffff" emissiveMap={screen.tex} emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.95, -0.6]} castShadow>
          <boxGeometry args={[5.5, 0.12, 1.4]} />
          <meshStandardMaterial color="#c8c2b8" roughness={0.6} />
        </mesh>
        {[-1.6, 0, 1.6].map((x) => (
          <mesh key={x} position={[x, 1.45, -0.9]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[1.2, 0.75, 0.06]} />
            <meshStandardMaterial color="#1b2731" emissive={P.water} emissiveIntensity={0.25 + 0.6 * s.alert} />
          </mesh>
        ))}
        <pointLight position={[0, 3.2, 1]} intensity={8} distance={10} decay={2} color="#fff0d2" />
      </group>
    </group>
  );
};
