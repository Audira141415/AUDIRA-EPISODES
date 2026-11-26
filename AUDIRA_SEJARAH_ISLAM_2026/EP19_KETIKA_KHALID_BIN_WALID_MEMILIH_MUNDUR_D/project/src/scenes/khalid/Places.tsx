// Map stations that stay on the table all film: Madinah (adobe wall ring, gate toward the route,
// mud houses, palms) and the Syria camp (command tent, banner pole for the change of command).
import React from "react";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Banner } from "./Banner.tsx";
import { CUE } from "./cues.ts";
import { MADINAH, SYRIA } from "./geo.ts";
import { easeInCubic, easeOutBack, lin, ss } from "./timing.ts";
import { SHEET_Y, hAt } from "./World.tsx";

const gy = (x: number, z: number) => SHEET_Y + hAt(x, z);

/** Gate direction of Madinah (toward the route north). */
export const GATE_DIR: [number, number] = [-0.25, -0.97];
const WALL_R = 0.95;
const GATE_A = Math.atan2(GATE_DIR[1], GATE_DIR[0]);
export const GATE: [number, number] = [MADINAH[0] + GATE_DIR[0] * WALL_R, MADINAH[1] + GATE_DIR[1] * WALL_R];

const MUD = "#b48a5e";
const HOUSES: [number, number, number, number, number][] = [
  // dx, dz, w, h, d
  [0.1, 0.1, 0.34, 0.2, 0.3], [-0.35, 0.25, 0.26, 0.16, 0.28], [0.4, -0.15, 0.28, 0.18, 0.24], [-0.2, -0.3, 0.3, 0.15, 0.22],
  [0.3, 0.45, 0.24, 0.14, 0.24], [-0.5, -0.05, 0.2, 0.13, 0.3],
];
const PALMS: [number, number][] = [[-0.2, -0.62], [0.12, -0.6], [0.62, 0.3], [-0.6, 0.45], [0.05, 0.62]];

export const Madinah: React.FC = () => {
  const [mx, mz] = MADINAH;
  const segs = 8;
  const gap = 0.36;
  const walls = Array.from({ length: segs }, (_, i) => {
    const a = GATE_A + gap + ((Math.PI * 2 - 2 * gap) * (i + 0.5)) / segs;
    const x = mx + Math.cos(a) * WALL_R, z = mz + Math.sin(a) * WALL_R;
    return { x, z, yaw: -a - Math.PI / 2 };
  });
  const gnx = -GATE_DIR[1], gnz = GATE_DIR[0];
  return (
    <group>
      {walls.map((w, i) => (
        <AssetModel key={i} id="adobe-tapia-wall-run-074dd5" assetType="prop" size={0.78} ground tint="#c49a6a"
          position={[w.x, gy(w.x, w.z), w.z]} rotation={[0, w.yaw, 0]} />
      ))}
      {/* gate: two pillars and a lintel */}
      {[-1, 1].map((s) => {
        const x = GATE[0] + gnx * s * 0.2, z = GATE[1] + gnz * s * 0.2;
        return (
          <mesh key={s} position={[x, gy(x, z) + 0.2, z]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.09, 0.4, 0.09]} radius={0.015} />
            <meshPhysicalMaterial color="#a77f55" {...POLISH.stone} />
          </mesh>
        );
      })}
      <mesh position={[GATE[0], gy(GATE[0], GATE[1]) + 0.43, GATE[1]]} rotation={[0, -Math.atan2(gnz, gnx), 0]} castShadow>
        <RoundedBoxGeo args={[0.52, 0.07, 0.11]} radius={0.015} />
        <meshPhysicalMaterial color="#9a744c" {...POLISH.stone} />
      </mesh>
      {HOUSES.map(([dx, dz, w, h, d], i) => {
        const x = mx + dx, z = mz + dz;
        return (
          <group key={i} position={[x, gy(x, z), z]} rotation={[0, i * 0.4, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <RoundedBoxGeo args={[w, h, d]} radius={0.02} />
              <meshPhysicalMaterial color={MUD} {...POLISH.stone} />
            </mesh>
            <mesh position={[0, h + 0.012, 0]} castShadow>
              <RoundedBoxGeo args={[w * 1.06, 0.024, d * 1.06]} radius={0.008} />
              <meshPhysicalMaterial color="#8d6a45" {...POLISH.stone} />
            </mesh>
          </group>
        );
      })}
      {PALMS.map(([dx, dz], i) => {
        const x = mx + dx, z = mz + dz;
        return <AssetModel key={i} id="palm-tree-a307da" assetType="prop" size={0.55} ground position={[x, gy(x, z), z]} rotation={[0, i * 1.3, 0]} />;
      })}
    </group>
  );
};

const POLE_H = 2.6;
const TENTS: [number, number, number][] = [[-0.75, -0.35, 0.5], [0.8, -0.3, 0.5], [0.05, -0.85, 0.5]];
const ROW = [-0.6, -0.3, 0, 0.3, 0.6];

export const Syria: React.FC<{ t: number }> = ({ t }) => {
  const [sx, sz] = SYRIA;
  const base = gy(sx, sz);
  const khalidLower = lin(CUE.mencopot, CUE.mencopot + 1.8, t);
  const khalidOnPole = t < 66.4;
  const abuLower = 1 - ss(66.0, 67.8, t);
  const rowIn = easeOutBack(lin(70, 70.8, t));
  const plant = easeInCubic(lin(74.9, 75.6, t));
  const rowZ = sz + 0.5;
  return (
    <group>
      <AssetModel id="soldiers-tent-4bd5b9" assetType="building" size={0.9} ground tint="#d8c8a6" position={[sx + 0.35, base, sz - 0.35]} rotation={[0, 0.3, 0]} />
      {TENTS.map(([dx, dz, s], i) => {
        const x = sx + dx, z = sz + dz;
        return <AssetModel key={i} id="soldiers-tent-4bd5b9" assetType="building" size={s} ground tint="#cdbb94" position={[x, gy(x, z), z]} rotation={[0, i * 0.9, 0]} />;
      })}
      {/* command pole */}
      {t >= 62 ? (
        <>
          {khalidOnPole ? (
            <Banner t={t} color="#2F6B4F" h={POLE_H} w={0.8} ch={0.5} position={[sx - 0.15, base, sz]} yaw={0.3} lower={khalidLower} seed={2} />
          ) : null}
          {t >= 66 ? (
            <Banner t={t} color="#EDE3C8" h={POLE_H} w={0.8} ch={0.5} position={[sx - 0.15, base, sz]} yaw={0.3} lower={abuLower} seed={5} />
          ) : null}
        </>
      ) : null}
      {/* front row */}
      {t >= 70
        ? ROW.map((dx, i) => {
            const x = sx + dx, z = rowZ;
            return (
              <Banner key={i} t={t} color="#2F6B4F" h={0.7} w={0.34} ch={0.22} position={[x, gy(x, z), z]} yaw={0.25}
                seed={i + 9} scale={Math.max(0.001, rowIn)} />
            );
          })
        : null}
      {t >= 74.9 ? (
        <Banner t={t} color="#3E8A5F" h={0.9} w={0.4} ch={0.26} position={[sx + 0.15, gy(sx + 0.15, rowZ + 0.05) + (1 - plant) * 2.4, rowZ + 0.05]} yaw={0.25}
          glow={ss(75.4, 75.8, t) * (1 - ss(77.5, 79, t)) * 0.6} seed={3} />
      ) : null}
    </group>
  );
};
