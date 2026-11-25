// c02 "Air di lembah tanpa air": an empty valley diorama between two hills (Shafa, Marwah).
// No person, prophet or angel is shown: footprints, water, a dam of sand, birds and tents only.

import React, { useMemo } from "react";
import * as THREE from "three";
import { at, chapter, prog, smooth, easeOut } from "./time.ts";
import { Plinth, scatter } from "./kit.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH } from "../../core/polish/Polish.tsx";

const C = "c02_lembah";
export const T2 = {
  start: chapter(C).start,
  outline: at(C, "Nabi Ibrahim meninggalkan"),
  shafa: at(C, "Hajar naik ke"),
  marwah: at(C, "Lalu berlari ke"),
  laps: at(C, "Bolak-balik"),
  sai: at(C, "asal ibadah sa'i"),
  water: at(C, "Lalu air muncul"),
  dam: at(C, "membendungnya dengan tangan"),
  stream: at(C, "seandainya Hajar membiarkannya"),
  streamBack: at(C, "Jadi bendungan kecil"),
  birds: at(C, "melihat burung"),
  tents: at(C, "Mereka datang"),
  name: at(C, "Soal nama Zamzam"),
};

const SHAFA: [number, number, number] = [-38, 0, -16];
const MARWAH: [number, number, number] = [36, 0, -20];
export const POOL: [number, number, number] = [8, 0, -4];
export const OUTLINE: [number, number, number] = [-6, 0, -12];

const Hill: React.FC<{ p: [number, number, number]; seed: number; h: number }> = ({ p, seed, h }) => {
  const lumps = useMemo(() => scatter(9, seed, (r) => [(r() - 0.5) * 16, r() * 0.6 + 0.4, (r() - 0.5) * 12]), [seed]);
  return (
    <group position={p}>
      {lumps.map(([x, s, z], i) => (
        <mesh key={i} position={[x, -1, z]} scale={[7 * s + 3, h * s, 6 * s + 3]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial {...POLISH.stone} color={i % 3 ? "#b8936a" : "#a9845d"} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/** Path between the hills (slightly curved). */
const walk = (u: number): [number, number] => {
  const x = SHAFA[0] + 8 + (MARWAH[0] - 8 - SHAFA[0] - 8) * u;
  const z = -17 + Math.sin(u * Math.PI) * 3.5;
  return [x, z];
};

/** Bare hills ringing the valley, plus rocks and a few desert shrubs. */
const Ridge: React.FC = () => {
  const peaks = useMemo(
    () =>
      scatter(26, 77, (r, i) => {
        const u = i / 25;
        // back arc from left to right, staying on the plinth
        const x = -78 + u * 156 + (r() - 0.5) * 6;
        const z = -78 - Math.sin(u * Math.PI) * 14 + (r() - 0.5) * 6;
        return [x, 6 + r() * 12, z];
      }),
    [],
  );
  const rocks = useMemo(() => scatter(40, 91, (r) => [-75 + r() * 150, 0.3 + r() * 0.9, -70 + r() * 78]), []);
  const shrubs = useMemo(() => scatter(18, 93, (r) => [-70 + r() * 140, 0, -60 + r() * 66]), []);
  return (
    <group>
      {peaks.map(([x, h, z], i) => (
        <mesh key={i} position={[x, h * 0.35, z]} scale={[9 + (i % 4) * 2, h, 8]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial {...POLISH.stone} color={i % 3 ? "#9c7a56" : "#8b6b4b"} flatShading />
        </mesh>
      ))}
      {rocks.map(([x, s, z], i) =>
        Math.hypot(x - POOL[0], z - POOL[2]) < 9 ? null : (
          <mesh key={`r${i}`} position={[x, s * 0.3, z]} scale={[s, s * 0.7, s]} rotation={[i, i * 2, 0]} castShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#a58663" flatShading />
          </mesh>
        ),
      )}
      {shrubs.map(([x, , z], i) =>
        Math.hypot(x - POOL[0], z - POOL[2]) < 10 || Math.abs(z + 17) < 3 ? null : (
          <mesh key={`s${i}`} position={[x, 0.5, z]} scale={[1.1, 0.7, 1.1]} castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#7d8a55" flatShading />
          </mesh>
        ),
      )}
    </group>
  );
};

export const Valley: React.FC<{ t: number }> = ({ t }) => {
  const mats = useMemo(
    () => ({
      foot: new THREE.MeshStandardMaterial({ color: "#8a6a45", roughness: 1 }),
      gold: new THREE.MeshStandardMaterial({ color: "#d6a842", emissive: "#7a5a10", emissiveIntensity: 0.4 }),
      water: new THREE.MeshPhysicalMaterial({ color: "#47b9de", roughness: 0.05, clearcoat: 1, emissive: "#0f6c90", emissiveIntensity: 0.35 }),
      ghost: new THREE.MeshStandardMaterial({ color: "#8fe4ff", emissive: "#39c6f2", emissiveIntensity: 1.1, transparent: true, opacity: 0.85 }),
      bird: new THREE.MeshStandardMaterial({ color: "#3b332c", roughness: 0.8 }),
      tent: new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: "#d8c3a0" }),
      sandRing: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#d7b685" }),
    }),
    [],
  );
  const outline = smooth(prog(t, T2.outline, T2.outline + 1.5));
  const lapsP = prog(t, T2.laps - 1.5, T2.sai + 1);
  const water = easeOut(prog(t, T2.water + 0.4, T2.water + 2.2));
  const dam = smooth(prog(t, T2.dam, T2.dam + 2));
  const stream = smooth(prog(t, T2.stream + 0.5, T2.stream + 2.5)) * (1 - smooth(prog(t, T2.streamBack, T2.streamBack + 2)));
  const birds = smooth(prog(t, T2.birds - 0.3, T2.birds + 1.2));
  const tents = prog(t, T2.tents, T2.tents + 3);

  // footprints: 7 passes, revealed progressively
  const prints: React.ReactNode[] = [];
  const per = 26;
  const shown = Math.floor(lapsP * 7 * per);
  for (let i = 0; i < Math.min(shown, 7 * per); i++) {
    const lap = Math.floor(i / per);
    const k = (i % per) / (per - 1);
    const u = lap % 2 ? 1 - k : k;
    const [x, z] = walk(u);
    const side = i % 2 ? 0.28 : -0.28;
    prints.push(
      <mesh key={i} position={[x, 0.04, z + side + (lap - 3) * 0.22]} rotation={[-Math.PI / 2, 0, 0]} material={mats.foot}>
        <circleGeometry args={[0.16, 8]} />
      </mesh>,
    );
  }

  const tentPts = useMemo(() => scatter(7, 31, (r, i) => [POOL[0] + Math.cos(i * 0.9 + 2.5) * (12 + r() * 6), 0, POOL[2] + Math.sin(i * 0.9 + 2.5) * (8 + r() * 4) - 4]), []);

  return (
    <group>
      <Plinth w={170} d={110} h={3.5} top="#e6cb9c" side="#a8865a" seed={12} front={12} />
      <Ridge />
      <Hill p={SHAFA} seed={4} h={10} />
      <Hill p={MARWAH} seed={8} h={8.5} />

      {/* where the Ka'bah stands today: a dashed plan outline only */}
      {outline > 0.01
        ? Array.from({ length: 16 }, (_, i) => {
            const side = Math.floor(i / 4), k = (i % 4) / 4 + 0.125;
            const w = 11, d = 12;
            const pts: [number, number][] = [
              [-w / 2 + k * w, -d / 2], [w / 2, -d / 2 + k * d], [w / 2 - k * w, d / 2], [-w / 2, d / 2 - k * d],
            ];
            const [x, z] = pts[side];
            return (
              <mesh key={i} position={[OUTLINE[0] + x, 0.06, OUTLINE[2] + z]} rotation={[0, side % 2 ? Math.PI / 2 : 0, 0]} material={mats.gold} scale={[outline, 1, 1]}>
                <boxGeometry args={[1.6, 0.08, 0.22]} />
              </mesh>
            );
          })
        : null}

      {prints}

      {/* the spring and the little sand dam around it */}
      <mesh position={[POOL[0], 0.05, POOL[2]]} rotation={[-Math.PI / 2, 0, 0]} material={mats.water} scale={water}>
        <circleGeometry args={[1.6, 40]} />
      </mesh>
      {water > 0.05
        ? [0, 1, 2].map((i) => {
            const ph = ((t * 0.5 + i / 3) % 1);
            return (
              <mesh key={i} position={[POOL[0], 0.08, POOL[2]]} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} scale={water * (0.4 + ph)}>
                <ringGeometry args={[1.4, 1.5, 40]} />
                <meshBasicMaterial color="#c9f3ff" transparent opacity={(1 - ph) * 0.7} depthWrite={false} />
              </mesh>
            );
          })
        : null}
      <mesh position={[POOL[0], 0, POOL[2]]} rotation={[-Math.PI / 2, 0, 0]} material={mats.sandRing} scale={[1, 1, Math.max(0.01, dam)]}>
        <torusGeometry args={[2.0, 0.42, 12, 40]} />
      </mesh>

      {/* "it would have flowed on the surface": a ghost stream down the valley, then pulled back */}
      {stream > 0.01
        ? Array.from({ length: 22 }, (_, i) => {
            const x = POOL[0] + 2 + i * 2.2;
            const show = i / 22 < stream;
            const flow = ((t * 1.4 - i * 0.12) % 1 + 1) % 1;
            return show ? (
              <mesh key={i} position={[x, 0.07, POOL[2] + Math.sin(i * 0.5) * 1.6]} rotation={[-Math.PI / 2, 0, 0]} material={mats.ghost} scale={0.6 + flow * 0.5}>
                <circleGeometry args={[0.55, 16]} />
              </mesh>
            ) : null;
          })
        : null}

      {/* birds circling above the water */}
      {birds > 0.01
        ? Array.from({ length: 7 }, (_, i) => {
            const a = t * 0.55 + (i * Math.PI * 2) / 7;
            const rr = 9 + (i % 3) * 2;
            const flap = Math.sin(t * 8 + i) * 0.5;
            return (
              <group key={i} position={[POOL[0] + Math.cos(a) * rr, 12 + (i % 2) * 2 + 6 * (1 - birds), POOL[2] + Math.sin(a) * rr]} rotation={[0, -a, 0]} scale={birds}>
                {[1, -1].map((s) => (
                  <mesh key={s} position={[0, 0, s * 0.5]} rotation={[s * (0.4 + flap), 0, 0]} material={mats.bird}>
                    <boxGeometry args={[0.5, 0.05, 1.0]} />
                  </mesh>
                ))}
              </group>
            );
          })
        : null}

      {/* Jurhum tents */}
      {tentPts.map((p, i) => {
        const s = smooth(prog(tents, i / 9, i / 9 + 0.3));
        return s > 0.01 ? (
          <mesh key={i} position={[p[0], 1.1 * s, p[2]]} scale={s} rotation={[0, i, 0]} material={mats.tent} castShadow>
            <coneGeometry args={[1.8, 2.2, 4]} />
          </mesh>
        ) : null;
      })}
    </group>
  );
};
