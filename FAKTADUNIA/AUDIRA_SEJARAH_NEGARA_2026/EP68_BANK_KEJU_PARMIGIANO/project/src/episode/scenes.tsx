// EP68 scenes A–F. Each scene is built around the origin; camera keys in timeline.ts. t = film seconds, f = 60 fps clock.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { ToyPerson, type PoseName, type Expression } from "../core/polish/Person.tsx";
import { FX_LAYER } from "../core/render/Post.tsx";
import { clamp01 } from "../kits/feltcraft/core/motion";
import { C, mat, pop, Ground, Smoke, textTexture, SignBoard, Shape, SPHERE } from "./parts.tsx";
import { Wheel, WheelInstances, Rack, Wedge, CopperVat, Stamp, Prosciutto, OilBottle, WHEEL_R, WHEEL_H } from "./cheese.tsx";
import type { V3, SceneId } from "./timeline.ts";

type SP = { t: number; f: number };
const st = (t: number) => Math.floor(t * 12) / 12;
const ease = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

// ---------- people (ToyPerson always with hair, painted face; makers wear apron + cloth cap) ----------
const Apron: React.FC<{ color?: string }> = ({ color = "#FBF7EE" }) => (
  <mesh position={[0, 0.0, 0.1]}>
    <boxGeometry args={[0.2, 0.4, 0.012]} />
    <meshStandardMaterial color={color} roughness={0.85} />
  </mesh>
);
const ClothCap: React.FC<{ color?: string }> = ({ color = "#FBF7EE" }) => (
  <mesh position={[0, 0.085, -0.005]}>
    <cylinderGeometry args={[0.118, 0.128, 0.09, 20]} />
    <meshStandardMaterial color={color} roughness={0.9} />
  </mesh>
);
const Maker: React.FC<{ f: number; position: V3; heading?: number; pose?: PoseName; seed?: number; scale?: number; expression?: Expression; coat?: boolean; rightHand?: React.ReactNode }> = ({ f, position, heading = 0, pose = "stand", seed = 12, scale = 0.62, expression = "happy", coat, rightHand }) => (
  <ToyPerson
    f={f}
    seed={seed}
    pose={pose}
    outfit={coat ? "formal" : "casual"}
    look={coat ? { top: "#F7F4EE", bottom: "#4A4440" } : { top: "#5E7FA6", bottom: "#4A3A2E", hair: "#3B2A1E" }}
    expression={expression}
    position={position}
    heading={heading}
    scale={scale}
    torso={coat ? undefined : <Apron />}
    headwear={<ClothCap />}
    rightHand={rightHand}
  />
);

/** Light shaft: soft additive slab from above. */
const Shaft: React.FC<{ position: V3; rotation?: V3; w?: number; h?: number; opacity?: number; color?: string }> = ({ position, rotation = [0, 0, 0.18], w = 0.9, h = 7, opacity = 0.1, color = "#FFD9A0" }) => (
  <mesh position={position} rotation={rotation} layers={FX_LAYER} renderOrder={4}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>
);

const brass = (text: string) => textTexture(text, { w: 768, h: 192, bg: "#C9A24E", fg: "#3B2414", border: "#8A6A2A", font: "bold 130px Georgia, serif" });

// ---------------- A: vault door swings open onto golden cheese racks ----------------
export const SceneA: React.FC<SP> = ({ t, f }) => {
  const wall = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-5, -0.2);
    s.lineTo(5, -0.2);
    s.lineTo(5, 4.2);
    s.lineTo(-5, 4.2);
    s.lineTo(-5, -0.2);
    const hole = new THREE.Path();
    hole.absarc(0, 1.3, 1.05, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: 0.45, bevelEnabled: false, curveSegments: 48 });
  }, []);
  const open = ease((st(t) - 0.5) / 2.2);
  const piles = useMemo(() => {
    const out: { p: V3; s: number }[] = [];
    // stacked wheels on the floor in the middle of the vault (pyramids)
    for (const [cx, cz] of [[-0.55, -3.0], [0.6, -3.6], [-0.2, -4.6]] as [number, number][])
      for (let lvl = 0; lvl < 4; lvl++) for (let i = 0; i < 4 - lvl; i++) out.push({ p: [cx + (i - (3 - lvl) / 2) * WHEEL_R * 2.1, lvl * WHEEL_H, cz], s: 1 });
    return out;
  }, []);
  return (
    <group>
      <Ground color={C.concrete} />
      {/* vault wall + steel frame ring */}
      <mesh geometry={wall} position={[0, 0, -1.4]} material={mat("#C9BBA4", 4, "stone")} castShadow receiveShadow />
      <mesh position={[0, 1.3, -0.93]}>
        <torusGeometry args={[1.08, 0.07, 16, 64]} />
        <meshStandardMaterial color={C.steel} metalness={1} roughness={0.3} />
      </mesh>
      {/* door on a hinge at the right edge */}
      <group position={[1.08, 1.3, -0.9]} rotation={[0, -open * 1.95, 0]}>
        <group position={[-1.04, 0, 0.16]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.0, 1.0, 0.3, 64]} />
            <meshStandardMaterial color="#59616A" metalness={1} roughness={0.32} />
          </mesh>
          {Array.from({ length: 16 }, (_, i) => (
            <mesh key={i} position={[Math.cos((i / 16) * 6.28) * 0.86, Math.sin((i / 16) * 6.28) * 0.86, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.04, 12]} />
              <meshStandardMaterial color="#9AA2AA" metalness={1} roughness={0.25} />
            </mesh>
          ))}
          {/* spoke wheel handle */}
          <group position={[0, 0.05, 0.22]} rotation={[0, 0, t * 0.9]}>
            <mesh>
              <torusGeometry args={[0.3, 0.03, 12, 40]} />
              <meshStandardMaterial color="#C9A24E" metalness={1} roughness={0.25} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI]}>
                <boxGeometry args={[0.62, 0.035, 0.035]} />
                <meshStandardMaterial color="#C9A24E" metalness={1} roughness={0.25} />
              </mesh>
            ))}
          </group>
          {/* brass AUDIRA plate (brand in-world) */}
          <mesh position={[0, -0.55, 0.156]}>
            <planeGeometry args={[0.72, 0.18]} />
            <meshStandardMaterial map={brass("AUDIRA")} metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      </group>
      {/* inside: walls, racks both sides, piles, golden glow */}
      <mesh position={[0, 2, -7.2]} material={mat("#B79E7E", 3, "stone")}>
        <boxGeometry args={[5, 4.4, 0.2]} />
      </mesh>
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <mesh position={[sx * 2.3, 2, -4.3]} material={mat("#B79E7E", 3, "stone")}>
            <boxGeometry args={[0.2, 4.4, 6]} />
          </mesh>
          <Rack position={[sx * 1.85, 0, -1.7]} rotation={-Math.PI / 2} len={5.2} tiers={7} gap={0.42} seed={sx + 4} />
        </group>
      ))}
      <WheelInstances items={piles} seed={7} lo={false} shadows />
      <pointLight position={[0, 2.6, -3.4]} intensity={18} distance={9} color="#FFC266" />
      <pointLight position={[0, 1.2, -1.8]} intensity={5} distance={4} color="#FFB25A" />
      <Shaft position={[-0.6, 2.4, -3.6]} rotation={[0, 0, 0.25]} opacity={0.08 * open} />
      <Shaft position={[0.7, 2.4, -4.4]} rotation={[0, 0, -0.2]} opacity={0.08 * open} />
      {/* foreground: crates with coins, safe and a few wheels (fill the bottom of frame) */}
      <mesh position={[-1.05, 0.35, 2.2]} material={mat(C.woodHoney, 2, "wood")} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.7, 0.7]} />
      </mesh>
      <AssetModel id="gold-coin-stack-a9ef52" size={0.32} ground position={[-1.15, 0.7, 2.25]} />
      <AssetModel id="gold-coin-stack-a9ef52" size={0.24} ground position={[-0.85, 0.7, 2.05]} rotation={[0, 0.8, 0]} />
      <AssetModel id="iron-vault-safe-8b8f29" size={0.8} ground position={[1.35, 0, 2.0]} rotation={[0, -0.5, 0]} />
      <Wheel position={[1.3, 0.8, 2.05]} scale={0.8} />
      <Wheel position={[0.55, 0, 2.6]} edge rotation={[0, -0.3, 0]} />
      <Wedge position={[-0.4, 0, 2.9]} rotation={[0, 0.6, 0]} scale={1.1} />
    </group>
  );
};

// ---------------- B: Italian town square, bank, wheel rolling to the steps ----------------
const Cypress: React.FC<{ position: V3; h?: number }> = ({ position, h = 2.4 }) => (
  <group position={position}>
    <mesh position={[0, 0.2, 0]} material={mat("#B9653F", 1, "stone")} castShadow>
      <cylinderGeometry args={[0.22, 0.17, 0.4, 16]} />
    </mesh>
    <Shape geometry={SPHERE} color={C.cypress} kind="paint" position={[0, 0.4 + h * 0.45, 0]} scale={[0.26, h * 0.5, 0.26]} />
  </group>
);
export const SceneB: React.FC<SP> = ({ t, f }) => {
  const roll = ease((st(t) - 18.6) / 2.6);
  const wp: V3 = lerp3([-3.4, 0, 1.5], [-0.15, 0, 0.75], roll);
  return (
    <group>
      <Ground color={C.cobble} />
      <mesh position={[0, 0.005, 0.6]} rotation={[-Math.PI / 2, 0, 0]} material={mat("#B6A58E", 10, "stone")} receiveShadow>
        <planeGeometry args={[10, 3.4]} />
      </mesh>
      {/* bank + steps */}
      <AssetModel id="classical-bank-04954e" size={3.6} ground position={[0, 0.3, -1.6]} tint="#EADBC2" />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.1, 0.15 - i * 0.22]} material={mat("#D9CCB6", 3, "stone")} receiveShadow castShadow>
          <boxGeometry args={[2.6 - i * 0.1, 0.1, 0.5]} />
        </mesh>
      ))}
      {/* neighbouring Italian houses with brick-red roofs */}
      <AssetModel id="two-story-house-40f6dc" size={2.8} ground position={[-3.3, 0, -2.0]} rotation={[0, 0.35, 0]} tint="#E7B98A" />
      <AssetModel id="bank-414f6b" size={2.6} ground position={[3.4, 0, -1.8]} rotation={[0, -0.4, 0]} tint="#EBC9A0" />
      <AssetModel id="two-story-house-40f6dc" size={3.0} ground position={[-1.8, 0, -5.4]} tint="#D9A27A" />
      <AssetModel id="two-story-house-40f6dc" size={3.2} ground position={[2.0, 0, -5.8]} rotation={[0, 3.1, 0]} tint="#E3B48C" />
      <AssetModel id="two-story-house-40f6dc" size={3.0} ground position={[5.6, 0, -4.4]} rotation={[0, -0.8, 0]} tint="#C98E6A" />
      <AssetModel id="two-story-house-40f6dc" size={3.0} ground position={[-5.6, 0, -4.2]} rotation={[0, 0.8, 0]} tint="#DDB08A" />
      <Cypress position={[-1.6, 0, 0.6]} />
      <Cypress position={[1.6, 0, 0.6]} />
      <Cypress position={[-4.8, 0, -0.6]} h={3} />
      <AssetModel id="delivery-truck-a9537e" size={1.9} ground position={[2.7, 0, 1.6]} rotation={[0, -1.2, 0]} tint="#F2EDE4" />
      {/* rolling wheel (on edge) */}
      {t >= 16.5 ? (
        <group position={wp} rotation={[0, -0.25, 0]}>
          <group position={[0, WHEEL_R, 0]} rotation={[0, 0, -roll * 14]}>
            <Wheel position={[0, -WHEEL_R, 0]} edge />
          </group>
        </group>
      ) : null}
      <Maker f={f} position={[-1.0, 0, 1.7]} heading={0.6} pose={t > 19 ? "point" : "walk"} seed={14} />
      {/* foreground: market crate of wheels + wedge */}
      <mesh position={[1.2, 0.18, 2.6]} material={mat(C.woodHoney, 2, "wood")} castShadow>
        <boxGeometry args={[0.8, 0.36, 0.5]} />
      </mesh>
      <Wheel position={[1.05, 0.36, 2.6]} scale={0.8} />
      <Wheel position={[1.4, 0.36, 2.55]} scale={0.75} tint="#F2E2C0" />
      <Wedge position={[-0.9, 0, 2.9]} rotation={[0, 0.9, 0]} />
    </group>
  );
};

// ---------------- C: dairy → copper vat → wheel on the scale; then maturing rack + calendar ----------------
const Calendar: React.FC<{ t: number; position: V3 }> = ({ t, position }) => {
  const month = Math.max(1, Math.min(24, Math.floor(1 + clamp01((st(t) - 28.0) / 3.8) * 23)));
  const tex = textTexture(`BULAN ${month}`, { w: 512, h: 384, bg: "#FBF4E4", fg: "#8A2A16", border: "#B5523B", font: "bold 120px Georgia, serif" });
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  );
};
const Padlock: React.FC<{ position: V3; s: number }> = ({ position, s }) =>
  s <= 0.001 ? null : (
    <group position={position} scale={s}>
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[0.08, 0.02, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#B9BEC4" metalness={1} roughness={0.25} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.22, 0.18, 0.08]} />
        <meshStandardMaterial color="#C9A24E" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
export const SceneC: React.FC<SP> = ({ t, f }) => {
  const lift = ease((st(t) - 22.4) / 1.2);
  const onScale = pop(t, 23.6);
  const pour = st(t) > 25.6 && st(t) < 27.4;
  const needle = clamp01((st(t) - 23.75) / 0.5) * 2.4;
  return (
    <group>
      <group position={[3, 0, 0]}>
        <Ground color="#AFA866" size={30} />
      </group>
      {/* dairy */}
      <AssetModel id="red-barn-d41683" size={3.4} ground position={[-3.4, 0, -2.6]} rotation={[0, 0.5, 0]} />
      <AssetModel id="alpine-hay-barn-3965e5" size={2.4} ground position={[1.2, 0, -3.4]} rotation={[0, -0.3, 0]} />
      <AssetModel id="cow-base" size={1.5} ground position={[-1.9, 0, -0.5]} rotation={[0, 0.9, 0]} />
      <AssetModel id="cow-base" size={1.4} ground position={[-3.0, 0, 0.6]} rotation={[0, 1.6, 0]} />
      <AssetModel id="milk-churn-stand-130fe2" size={0.9} ground position={[-0.9, 0, -0.9]} />
      <group position={[-0.6, 0.55, 0.05]} rotation={[0, 0, pour ? -1.2 : -0.2]}>
        <AssetModel id="milk-churn-895735" size={0.5} ground position={[0, 0, 0]} />
      </group>
      {pour ? (
        <mesh position={[-0.12, 0.78, 0.05]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.025, 0.035, 0.42, 12]} />
          <meshPhysicalMaterial color="#FBF7EC" roughness={0.15} clearcoat={0.8} />
        </mesh>
      ) : null}
      <CopperVat position={[0.35, 0.26, 0]} scale={0.9} />
      <Smoke t={t} origin={[0.35, 0.95, 0]} color={C.steam} n={4} rise={1.0} spread={0.4} size={0.14} opacity={0.35} seed={3} />
      {/* curd lifted in linen cloth */}
      {st(t) < 23.6 ? (
        <group position={[0.35, 0.86 + lift * 0.55, 0]}>
          <Shape geometry={SPHERE} color="#F6EED6" kind="paint" scale={[0.22, 0.2, 0.22]} />
          <mesh position={[0, 0.16, 0]} scale={[0.26, 0.18, 0.26]}>
            <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color="#F8F4EA" roughness={0.95} side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
        </group>
      ) : null}
      <Maker f={f} position={[1.0, 0, -0.55]} heading={-0.7} pose={st(t) < 23.6 ? "carry" : "point"} seed={12} />
      {/* scale with the finished wheel */}
      <group position={[1.35, 0, 0.75]}>
        <mesh position={[0, 0.28, 0]} material={mat(C.woodHoney, 2, "wood")} castShadow>
          <boxGeometry args={[0.6, 0.56, 0.5]} />
        </mesh>
        <mesh position={[0, 0.57, 0]} material={mat("#C9CED3", 1, "metal")}>
          <boxGeometry args={[0.66, 0.03, 0.56]} />
        </mesh>
        <mesh position={[0, 0.32, 0.252]}>
          <circleGeometry args={[0.17, 32]} />
          <meshStandardMaterial color="#FBF4E4" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.32, 0.256]} rotation={[0, 0, 1.2 - needle]}>
          <planeGeometry args={[0.012, 0.3]} />
          <meshBasicMaterial color="#B3261E" />
        </mesh>
        {onScale > 0 ? <Wheel position={[0, 0.585, 0]} scale={onScale} /> : null}
      </group>
      <AssetModel id="haystack-77b0dd" size={1.1} ground position={[-2.2, 0, 1.9]} />
      <mesh position={[-0.4, 0.15, 1.9]} material={mat(C.woodHoney, 1, "wood")} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.3, 20]} />
      </mesh>

      {/* maturing room on the right (x 5.4 … 10.4) */}
      <mesh position={[7.9, 1.7, -0.9]} material={mat("#A97E55", 3, "wood")} receiveShadow>
        <boxGeometry args={[5.6, 3.4, 0.12]} />
      </mesh>
      <mesh position={[7.9, 0.006, 0.6]} rotation={[-Math.PI / 2, 0, 0]} material={mat("#B9A486", 6, "stone")} receiveShadow>
        <planeGeometry args={[5.6, 3.4]} />
      </mesh>
      <Rack position={[5.3, 0, -0.45]} len={5.2} tiers={6} gap={0.4} seed={21} />
      <Calendar t={t} position={[8.0, 2.95, -0.82]} />
      <Maker f={f} position={[8.9, 0, 0.9]} heading={-2.6} pose="think" seed={12} expression="neutral" />
      <group position={[9.6, 0, 1.1]}>
        <mesh position={[0, 0.3, 0]} material={mat(C.woodDark, 1, "wood")} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        </mesh>
        <AssetModel id="gold-coin-stack-a9ef52" size={0.3} ground position={[0, 0.6, 0]} />
        <Padlock position={[0.02, 0.95, 0.05]} s={pop(t, 32.35)} />
      </group>
      <Wheel position={[6.9, 0, 1.6]} edge rotation={[0, 0.3, 0]} />
      <Wedge position={[7.6, 0, 1.9]} rotation={[0, 1.0, 0]} />
    </group>
  );
};

// ---------------- D: bank credit desk ----------------
const Balance: React.FC<{ t: number; position: V3 }> = ({ t, position }) => {
  const level = ease((st(t) - 38.7) / 0.6);
  const tilt = 0.32 * (1 - level);
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} material={mat("#C9A24E", 1, "metal")}>
        <cylinderGeometry args={[0.018, 0.03, 0.44, 12]} />
      </mesh>
      <group position={[0, 0.44, 0]} rotation={[0, 0, tilt]}>
        <mesh material={mat("#C9A24E", 1, "metal")}>
          <boxGeometry args={[0.7, 0.025, 0.025]} />
        </mesh>
        {[-1, 1].map((sx) => (
          <group key={sx} position={[sx * 0.34, 0, 0]} rotation={[0, 0, -tilt]}>
            <mesh position={[0, -0.16, 0]} material={mat("#C9A24E", 1, "metal")}>
              <cylinderGeometry args={[0.13, 0.1, 0.02, 24]} />
            </mesh>
            {sx < 0 ? <Wheel position={[0, -0.15, 0]} scale={0.48} /> : <AssetModel id="banded-cash-bundle-7da278" size={0.2} ground position={[0, -0.15, 0]} />}
            {sx > 0 && level > 0.1 ? <AssetModel id="banded-cash-bundle-7da278" size={0.2} ground position={[0, -0.11, 0]} rotation={[0, 0.5, 0]} /> : null}
          </group>
        ))}
      </group>
    </group>
  );
};
export const SceneD: React.FC<SP> = ({ t, f }) => {
  const push = ease((st(t) - 33.4) / 2.8);
  const onDesk = ease((st(t) - 36.4) / 0.5);
  const trolleyX = -3.2 + push * 2.2;
  const wheelPos = lerp3([trolleyX + 0.05, 0.55, 0.75], [-0.55, 1.0, 0.2], onDesk);
  const steal = ease((st(t) - 48.6) / 1.0);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat("#8A5A36", 8, "wood")} receiveShadow>
        <planeGeometry args={[14, 10]} />
      </mesh>
      {/* back wall with tall windows */}
      <mesh position={[0, 2.4, -2.2]} material={mat(C.cream, 3, "stone")} receiveShadow>
        <boxGeometry args={[10, 4.8, 0.2]} />
      </mesh>
      {[-2.6, 0, 2.6].map((x) => (
        <group key={x} position={[x, 2.5, -2.08]}>
          <mesh>
            <planeGeometry args={[1.1, 2.6]} />
            <meshBasicMaterial color="#FFE8BE" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.05, 2.6, 0.02]} />
            <meshStandardMaterial color={C.woodDark} />
          </mesh>
          <mesh position={[0, 0.2, 0.01]}>
            <boxGeometry args={[1.1, 0.05, 0.02]} />
            <meshStandardMaterial color={C.woodDark} />
          </mesh>
          <Shaft position={[0.3, -1.0, 1.2]} rotation={[-0.6, 0, 0.1]} w={1.0} h={3.4} opacity={0.07} />
        </group>
      ))}
      {/* counter */}
      <mesh position={[0.4, 0.5, -0.4]} material={mat("#7A4A2A", 3, "wood")} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1.0, 1.0]} />
      </mesh>
      <mesh position={[0.4, 1.01, -0.4]} material={mat("#5A3620", 3, "wood")} receiveShadow>
        <boxGeometry args={[3.7, 0.03, 1.08]} />
      </mesh>
      <ToyPerson f={f} seed={31} pose={st(t) > 43 && st(t) < 44.3 ? "point" : "stand"} outfit="formal" look={{ top: "#3E4A5C", hair: "#2A1E16" }} expression="happy" position={[0.5, 0, -1.25]} heading={0} scale={0.62} />
      <AssetModel id="cash-counting-machine-1f6eca" size={0.34} ground position={[1.15, 1.02, -0.65]} rotation={[0, -0.3, 0]} />
      <Balance t={t} position={[0.55, 1.02, -0.3]} />
      {/* ledger + pen + coins */}
      <mesh position={[0.0, 1.04, 0.0]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.26]} />
        <meshStandardMaterial color="#7A2A1E" roughness={0.7} />
      </mesh>
      <mesh position={[0.02, 1.065, 0.0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.32, 0.22]} />
        <meshStandardMaterial map={textTexture("KREDIT · 80%", { w: 512, h: 352, bg: "#FBF4E4", fg: "#3B2414", border: "#C9B48E", font: "bold 64px Georgia, serif" })} roughness={0.8} />
      </mesh>
      <AssetModel id="gold-coin-stack-a9ef52" size={0.16} ground position={[0.3, 1.02, 0.15]} />
      {/* maker pushing a trolley */}
      <group position={[trolleyX, 0, 0.75]}>
        <mesh position={[0, 0.42, 0]} material={mat(C.steel, 1, "metal")} castShadow>
          <boxGeometry args={[0.6, 0.04, 0.45]} />
        </mesh>
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
            <meshStandardMaterial color="#2A2A2A" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[-0.32, 0.65, 0]} material={mat(C.steel, 1, "metal")}>
          <boxGeometry args={[0.03, 0.5, 0.45]} />
        </mesh>
      </group>
      <Maker f={f} position={[trolleyX - 0.6, 0, 0.75]} heading={Math.PI / 2} pose={push < 1 ? "walk" : "stand"} seed={12} />
      {/* hero wheel: trolley → desk, standing on its edge facing camera */}
      <group position={wheelPos} rotation={[0, 0.25 * onDesk, 0]}>
        <Wheel position={[0, -WHEEL_R * onDesk - (1 - onDesk) * 0.0, 0]} edge={onDesk > 0.5} />
        <Stamp text="N. 0184-27" t={t} at={43.08} position={[0, 0, WHEEL_H / 2 + 0.012]} w={0.3} color="#3B2414" />
      </group>
      {/* prosciutto + oil: considered, then rejected */}
      <group position={[1.75 + steal * 1.6, 1.02, 0.1]} scale={pop(t, 44.4)}>
        <Prosciutto rotation={[0, 0, -1.25]} position={[-0.05, 0.12, 0]} scale={0.9} />
      </group>
      <group position={[2.25 + steal * 1.2, 1.02, 0.05]} scale={pop(t, 45.0)}>
        <OilBottle />
      </group>
      <Stamp text="DITOLAK" t={t} at={47.04} position={[1.95, 1.35, 0.42]} rotation={[0, 0.35, -0.12]} w={0.8} />
      {/* foreground */}
      <Wheel position={[-1.9, 0, 1.6]} rotation={[0, 0.6, 0]} />
      <Wheel position={[-1.9, WHEEL_H, 1.6]} rotation={[0, 1.4, 0]} />
      <Wheel position={[2.6, 0, 1.5]} edge rotation={[0, -0.4, 0]} />
    </group>
  );
};

// ---------------- E: 2009 night — tunnel under the warehouse ----------------
export const SceneE: React.FC<SP> = ({ t, f }) => {
  const soil = mat(C.soil, 4, "stone");
  const siren = st(t) >= 57.6;
  const blink = Math.floor(t * 4) % 2 === 0;
  const wheels = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);
  return (
    <group>
      {/* surface (night grass) beyond the warehouse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.5, 0, 6]} material={mat("#4E5A48", 8, "stone")} receiveShadow>
        <planeGeometry args={[14, 12]} />
      </mesh>
      {/* warehouse floor slab + cutaway earth */}
      <mesh position={[-1, -0.1, -1.6]} material={mat("#8E7A62", 6, "wood")} receiveShadow castShadow>
        <boxGeometry args={[10, 0.2, 3.2]} />
      </mesh>
      <mesh position={[-1, -0.32, -0.25]} material={soil} receiveShadow>
        <boxGeometry args={[10, 0.25, 0.5]} />
      </mesh>
      <mesh position={[1, -1.45, -1]} material={soil} receiveShadow>
        <boxGeometry args={[14, 0.6, 2]} />
      </mesh>
      <mesh position={[1, -0.75, -1.4]} material={soil} receiveShadow>
        <boxGeometry args={[14, 0.9, 0.9]} />
      </mesh>
      {/* tunnel half-pipe (inside, back half) */}
      <mesh position={[1, -0.75, -0.3]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 12, 24, 1, true, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#7A5A3E" roughness={1} side={THREE.BackSide} />
      </mesh>
      {/* timber props in the tunnel */}
      {[-2.5, -0.5, 1.5, 3.5].map((x) => (
        <mesh key={x} position={[x, -0.75, -0.55]} material={mat(C.woodDark, 1, "wood")}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
        </mesh>
      ))}
      {/* warehouse racks above */}
      <Rack position={[-5.5, 0, -2.4]} len={8} tiers={3} gap={0.45} seed={33} fill={0.7} />
      {/* thief with lantern, crouching in the tunnel */}
      <group position={[-1.2 + ease((st(t) - 50) / 6) * 3.4, -1.15, -0.35]}>
        <ToyPerson f={f} seed={44} pose="crouch" outfit="casual" look={{ top: "#2E3346", bottom: "#24242C", hair: "#1E1A18" }} expression="surprised" heading={Math.PI / 2} scale={0.55} headwear={<ClothCap color="#24242C" />} />
        <mesh position={[0.32, 0.42, 0.05]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshBasicMaterial color="#FFE08A" />
        </mesh>
        <pointLight position={[0.32, 0.45, 0.3]} intensity={9} distance={4.5} decay={1.2} color="#FFD27A" />
      </group>
      {/* wheels rolling out through the tunnel */}
      {wheels.map((i) => {
        const u = clamp01((st(t) - 52.5 - i * 0.7) / 3.2);
        if (u <= 0) return null;
        const x = -0.2 + u * 5.6;
        return (
          <group key={i} position={[x, -1.15, -0.3]}>
            <group position={[0, WHEEL_R, 0]} rotation={[0, 0, -u * 26]}>
              <Wheel position={[0, -WHEEL_R, 0]} edge />
            </group>
          </group>
        );
      })}
      {/* exit pit + getaway truck */}
      <AssetModel id="delivery-truck-a9537e" size={2.0} ground position={[5.1, 0, -0.4]} rotation={[0, -0.9, 0]} tint="#C8CCD8" />
      <WheelInstances items={[{ p: [4.6, 0, 1.2] }, { p: [4.9, 0, 0.9] }, { p: [4.4, 0, 0.7] }, { p: [4.75, WHEEL_H, 1.0] }]} lo={false} seed={8} shadows />
      {/* warehouse back wall (brick, night) with lit window + distant cypress silhouettes */}
      <mesh position={[-1.6, 1.6, -3.25]} material={mat("#6E4436", 4, "stone")} receiveShadow>
        <boxGeometry args={[11, 3.4, 0.2]} />
      </mesh>
      <mesh position={[-0.4, 1.9, -3.14]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshBasicMaterial color="#FFD58A" />
      </mesh>
      <SignBoard text="MAGAZZINO" position={[2.6, 1.75, -3.1]} w={1.3} />
      {[-4, -1, 2.5, 6.5, 9].map((x, i) => (
        <Cypress key={x} position={[x, 0, -6 - (i % 2)]} h={3.2} />
      ))}
      <mesh position={[-3, 5.2, -12]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#F4EBCF" />
      </mesh>
      {/* warm fill on the cutaway faces (keeps soil/wood texture readable at night) */}
      <pointLight position={[2.2, -0.2, 2.4]} intensity={6} distance={6} decay={1.3} color="#FFC98A" />
      {/* tunnel work lamps */}
      {[-2.0, 0.0, 2.0, 3.8].map((x) => (
        <group key={x} position={[x, -0.42, -0.55]}>
          <mesh>
            <sphereGeometry args={[0.035, 12, 10]} />
            <meshBasicMaterial color="#FFE3A0" />
          </mesh>
          <pointLight intensity={7} distance={2.8} decay={1.4} color="#FFC870" />
        </group>
      ))}
      <mesh position={[0.6, 0.1, 1.6]} rotation={[0.3, 0.4, 0.5]} material={mat(C.woodDark, 1, "wood")} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
      </mesh>
      {/* police: officer + blinking lights */}
      {siren ? (
        <>
          <ToyPerson f={f} seed={52} pose="point" outfit="uniform" look={{ top: "#2B3E6E", bottom: "#1E2A44", hair: "#2A1E16" }} expression="angry" position={[4.4, 0, 1.15]} heading={2.3} scale={0.62} />
          <AssetModel id="boxy-sedan-70s-7d55f7" assetType="vehicle" size={1.5} ground position={[3.7, 0, 0.5]} rotation={[0, 0.5, 0]} tint="#2B3E6E" />
          <pointLight position={[3.55, 1.2, 0.9]} intensity={blink ? 10 : 1.5} distance={5} color="#3D6BFF" />
          <pointLight position={[3.95, 1.2, 0.7]} intensity={blink ? 1.5 : 10} distance={5} color="#FF3B3B" />
          <group position={[3.7, 0.62, 0.5]} rotation={[0, 0.5, 0]}>
            <mesh position={[-0.1, 0, 0]}>
              <boxGeometry args={[0.18, 0.06, 0.08]} />
              <meshBasicMaterial color={blink ? "#5C86FF" : "#22304F"} />
            </mesh>
            <mesh position={[0.1, 0, 0]}>
              <boxGeometry args={[0.18, 0.06, 0.08]} />
              <meshBasicMaterial color={blink ? "#4A1414" : "#FF5A5A"} />
            </mesh>
          </group>
        </>
      ) : null}
    </group>
  );
};

// ---------------- F: cheese cathedral + battitore hammer + fire brand ----------------
export const SceneF: React.FC<SP> = ({ t, f }) => {
  const tap = (at: number) => {
    const x = (st(t) - at) / 0.22;
    return x < 0 || x > 1 ? 0 : Math.sin(x * Math.PI);
  };
  const swing = Math.max(tap(65.42), tap(65.71), tap(66.0));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} material={mat("#B7A386", 10, "stone")} receiveShadow>
        <planeGeometry args={[8, 44]} />
      </mesh>
      {[-1, 1].map((sx) => (
        <Rack key={sx} position={[sx * 1.45, 0, sx < 0 ? 6 : -30]} rotation={sx < 0 ? Math.PI / 2 : -Math.PI / 2} len={36} tiers={20} gap={0.42} depth={0.55} seed={60 + sx} />
      ))}
      {/* end wall with tall window + light shafts from the roof */}
      <mesh position={[0, 4.5, -28.3]}>
        <planeGeometry args={[3, 9]} />
        <meshBasicMaterial color="#FFE2B0" />
      </mesh>
      {[-6, -2, 2].map((z, i) => (
        <Shaft key={z} position={[0.3 - i * 0.3, 5.2, z]} rotation={[0.1, 0, 0.22]} w={1.1} h={10} opacity={0.08} />
      ))}
      <pointLight position={[0, 6, -2]} intensity={20} distance={14} color="#FFC77A" />
      <SignBoard text="AUDIRA · RAK 68" position={[-0.55, 0, 3.0]} rotation={0.35} w={1.0} />
      {/* tester (white coat) + hero wheel on a cradle */}
      <mesh position={[0.05, 0.35, 0]} material={mat(C.woodDark, 1, "wood")} castShadow>
        <boxGeometry args={[0.36, 0.7, 0.36]} />
      </mesh>
      <group position={[0.05, 0.7, 0]} rotation={[0, 0.5, 0]}>
        <Wheel edge position={[0, 0, 0]} />
        <Stamp text="UJI LOLOS" t={t} at={66.73} oval position={[0, WHEEL_R, WHEEL_H / 2 + 0.012]} w={0.28} color="#5A2A10" glow={st(t) < 68 ? 1.6 : 0.4} />
      </group>
      {st(t) >= 66.73 && st(t) < 69 ? <Smoke t={t} origin={[0.12, 0.95, 0.2]} color="#E8E2DA" n={4} rise={0.7} spread={0.08} size={0.06} opacity={0.4} seed={11} /> : null}
      <Maker f={f} position={[0.62, 0, -0.35]} heading={-2.0} pose="point" seed={18} coat expression="neutral" />
      {/* battitore hammer: taps on the wheel */}
      <group position={[0.36, 1.18, 0.05]} rotation={[0, 0.5, 0.5 - swing * 0.55]}>
        <AssetModel id="hammer-fa3e51" size={0.26} position={[-0.06, -0.12, 0]} rotation={[0, 0, 1.6]} />
      </group>
      {/* foreground: wedge with crystals + small wheels */}
      <mesh position={[-0.55, 0.3, 0.9]} material={mat(C.woodHoney, 2, "wood")} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.4]} />
      </mesh>
      <Wedge position={[-0.6, 0.6, 0.95]} rotation={[0, 0.9, 0]} />
      <Wheel position={[0.75, 0, 1.4]} edge rotation={[0, -0.5, 0]} />
      <Wheel position={[-0.2, 0, 2.0]} scale={0.9} />
    </group>
  );
};

export const SCENES: Record<SceneId, React.FC<SP>> = { A: SceneA, B: SceneB, C: SceneC, D: SceneD, E: SceneE, F: SceneF };
