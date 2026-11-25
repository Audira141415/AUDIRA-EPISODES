// EP036 film: a station entrance in half section (cut plane x = 0, camera on +x).
// Street -> sidewalk -> a few steps UP to a raised landing -> stairs DOWN into the station box.
// Flood panels are stacked by hand into vertical grooves at the landing edge.

import React, { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { P } from "../layout.ts";
import { FLOOD } from "./Diorama.tsx";
import { clamp01, easeOut, Worker } from "./common.tsx";

export const EN = { landingY: 0.8, landingZ0: -0.4, landingZ1: 1.1, curbZ: 5, roadZ1: 13, sideY: 0.2, depth: -6, panelH: 0.22, grooveZ: 1.02 };

export type EntranceState = { t: number; flood: number; panels: number; flow: number; lift: number };

const STEPS_DOWN = 16;
const stairEnd = { z: -5.2, y: -4.4 };
const STA = -13;

export const EntranceSet: React.FC<{ s: EntranceState }> = ({ s }) => {
  const soil = useMemo(() => {
    const run = (EN.landingZ0 - stairEnd.z) / (EN.landingY - stairEnd.y);
    const zAt0 = EN.landingZ0 - EN.landingY * run;
    const sh = new Shape();
    sh.moveTo(STA, -8);
    sh.lineTo(EN.roadZ1, -8);
    sh.lineTo(EN.roadZ1, 0);
    sh.lineTo(zAt0, 0);
    sh.lineTo(stairEnd.z, stairEnd.y);
    sh.lineTo(STA, stairEnd.y);
    sh.closePath();
    const g = new ExtrudeGeometry(sh, { depth: -EN.depth, bevelEnabled: false });
    return g;
  }, []);
  const rise = (EN.landingY - stairEnd.y) / STEPS_DOWN;
  const run = (EN.landingZ0 - stairEnd.z) / STEPS_DOWN;
  const L = s.flood;
  return (
    <group>
      <hemisphereLight args={["#eef3f7", "#b9a68f", 0.9]} />
      <directionalLight position={[22, 26, 14]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-far={90} shadow-bias={-0.0004} />
      <directionalLight position={[10, 5, 25]} intensity={0.5} color="#dfe9f2" />
      {/* soil body, cut at x = 0 */}
      <mesh geometry={soil} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#c4a073" roughness={0.95} />
      </mesh>
      {/* strata accents on the cut face */}
      {[
        [-0.35, 0.7, "#6b6660"],
        [-3.0, 0.15, "#b08a62"],
        [-6.6, 0.8, "#9a785c"],
      ].map(([y, h, c], i) => (
        <mesh key={i} position={[0.01, y as number, (EN.roadZ1 + 2) / 2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[EN.roadZ1 - 2, h as number]} />
          <meshStandardMaterial color={c as string} roughness={0.95} />
        </mesh>
      ))}
      {/* station box: roof slab, floor, back wall, columns, gates */}
      <mesh position={[EN.depth / 2, -0.75, (STA + stairEnd.z) / 2]} castShadow receiveShadow>
        <boxGeometry args={[-EN.depth, 1.5, stairEnd.z - STA]} />
        <meshStandardMaterial color="#d8d3ca" roughness={0.85} />
      </mesh>
      <mesh position={[EN.depth / 2, stairEnd.y - 0.04, (STA + stairEnd.z) / 2]} receiveShadow>
        <boxGeometry args={[-EN.depth, 0.08, stairEnd.z - STA]} />
        <meshStandardMaterial color="#e9e6e0" roughness={0.6} />
      </mesh>
      <mesh position={[EN.depth + 0.05, (stairEnd.y - 1.5) / 2, (STA + stairEnd.z) / 2]}>
        <boxGeometry args={[0.1, -1.5 - stairEnd.y, stairEnd.z - STA]} />
        <meshStandardMaterial color="#efece6" roughness={0.8} />
      </mesh>
      {[-8.2, -11.4].map((z) => (
        <mesh key={z} position={[-3.6, (stairEnd.y - 1.5) / 2, z]} castShadow>
          <boxGeometry args={[0.5, -1.5 - stairEnd.y, 0.5]} />
          <meshStandardMaterial color="#e3dfd7" roughness={0.8} />
        </mesh>
      ))}
      {[-1.2, -2.4, -3.6].map((x) => (
        <mesh key={x} position={[x, stairEnd.y + 0.5, -6.6]} castShadow>
          <boxGeometry args={[0.25, 1.0, 1.0]} />
          <meshStandardMaterial color="#9aa1a8" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {[-7, -9.6, -12.2].map((z) => (
        <mesh key={`lamp${z}`} position={[-3, -1.56, z]}>
          <boxGeometry args={[4, 0.05, 0.3]} />
          <meshStandardMaterial color="#fff6dc" emissive="#ffe9b0" emissiveIntensity={2.5} />
        </mesh>
      ))}
      <pointLight position={[-1.5, -2.2, -8.5]} intensity={14} distance={12} decay={2} color="#fff0d2" />
      {/* stairs down */}
      {Array.from({ length: STEPS_DOWN }, (_, i) => {
        const top = EN.landingY - (i + 1) * rise;
        const z = EN.landingZ0 - (i + 0.5) * run;
        return (
          <mesh key={i} position={[-1.3, top - 0.3, z]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.6, run + 0.01]} />
            <meshStandardMaterial color={i % 2 ? "#dcd7ce" : "#e2ddd4"} roughness={0.8} />
          </mesh>
        );
      })}
      {/* landing (raised threshold) + steps up from the sidewalk */}
      <mesh position={[-1.3, EN.landingY / 2, (EN.landingZ0 + EN.landingZ1) / 2]} castShadow receiveShadow>
        <boxGeometry args={[2.6, EN.landingY, EN.landingZ1 - EN.landingZ0]} />
        <meshStandardMaterial color="#e9e5dd" roughness={0.8} />
      </mesh>
      {[0, 1, 2].map((k) => {
        const top = EN.sideY + ((k + 1) * (EN.landingY - EN.sideY)) / 3;
        const z1 = EN.landingZ1 + (3 - k) * 0.42;
        return (
          <mesh key={k} position={[-1.3, top / 2, (EN.landingZ1 + z1) / 2]} castShadow receiveShadow>
            <boxGeometry args={[2.6, top, z1 - EN.landingZ1]} />
            <meshStandardMaterial color="#d6d1c7" roughness={0.85} />
          </mesh>
        );
      })}
      {/* sidewalk + curb, road */}
      <mesh position={[-3, EN.sideY / 2, (EN.landingZ1 + EN.curbZ) / 2]} receiveShadow>
        <boxGeometry args={[6, EN.sideY, EN.curbZ - EN.landingZ1]} />
        <meshStandardMaterial color={P.paver} roughness={0.85} />
      </mesh>
      <mesh position={[-3, -0.02, (EN.curbZ + EN.roadZ1) / 2]} receiveShadow>
        <boxGeometry args={[6, 0.04, EN.roadZ1 - EN.curbZ]} />
        <meshStandardMaterial color={P.asphalt} roughness={0.6} />
      </mesh>
      {/* entrance canopy: glass side wall, roof, posts */}
      <mesh position={[-1.3, 3.3, -2.05]} castShadow>
        <boxGeometry args={[3.0, 0.18, 7.2]} />
        <meshStandardMaterial color={P.water} roughness={0.5} />
      </mesh>
      <mesh position={[-2.65, 1.9, -2.05]}>
        <boxGeometry args={[0.05, 2.7, 6.8]} />
        <meshPhysicalMaterial color="#cfe6f2" roughness={0.05} transparent opacity={0.35} />
      </mesh>
      {[1.3, -5.4].map((z) => (
        <mesh key={z} position={[-2.6, 1.75, z]} castShadow>
          <boxGeometry args={[0.12, 3.1, 0.12]} />
          <meshStandardMaterial color="#8b9196" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* flood-panel grooves at the landing edge */}
      {[-2.55, -0.05].map((x) => (
        <mesh key={x} position={[x, EN.landingY + 0.75, EN.grooveZ]} castShadow>
          <boxGeometry args={[0.14, 1.5, 0.2]} />
          <meshStandardMaterial color="#7d858c" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {Array.from({ length: 4 }, (_, k) => {
        const a = clamp01(s.panels - k);
        if (a <= 0) return null;
        const y = EN.landingY + EN.panelH / 2 + k * EN.panelH;
        return (
          <mesh key={k} position={[-1.3, y + (1 - easeOut(a)) * 1.1, EN.grooveZ]} castShadow>
            <boxGeometry args={[2.4, EN.panelH - 0.015, 0.08]} />
            <meshStandardMaterial color={k % 2 ? "#d9dde0" : "#c6ccd1"} metalness={0.6} roughness={0.35} />
          </mesh>
        );
      })}
      <group position={[-1.6, EN.landingY, 0.35]} rotation={[0, 0.25, 0]}>
        <Worker lift={s.lift} />
      </group>
      {/* flood water */}
      <mesh position={[-3, L / 2, (EN.landingZ1 + EN.roadZ1) / 2]}>
        <boxGeometry args={[5.99, Math.max(0.02, L), EN.roadZ1 - EN.landingZ1 - 0.01]} />
        <meshPhysicalMaterial color={FLOOD} roughness={0.22} transparent opacity={0.93} clearcoat={0.3} />
      </mesh>
      {s.flow > 0.01 &&
        Array.from({ length: 5 }, (_, i) => {
          const k = (((i / 5 + s.t * 0.35) % 1) + 1) % 1;
          return (
            <mesh key={i} position={[-1.3, L + 0.04, 11 - k * 8.5]} rotation={[-Math.PI / 2, 0, 0]} scale={s.flow}>
              <coneGeometry args={[0.35, 0.7, 3]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} transparent opacity={0.85} />
            </mesh>
          );
        })}
    </group>
  );
};
