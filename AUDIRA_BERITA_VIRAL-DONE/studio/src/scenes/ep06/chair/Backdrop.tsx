// World layer for EP06 (TIMEFORGE Extras): a folded state-hall curtain and wooden wainscot behind
// the plinth, a red carpet under it, and the story props driven by the cut's fx channels:
// two candidate boards ("2 calon"), a 60-tile day ring around the plinth, and three pillars
// DPR / MK / MPR (impeachment route). Seeded grain only, no Math.random.

import React, { useMemo } from "react";
import { BoxGeometry, CanvasTexture, CylinderGeometry, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { PLINTH } from "../../../core/studio/Studio.tsx";
import type { FilmState } from "../../../kits/timeforge/film/choreography.ts";
import type { Chair, ChairFx } from "./params.ts";

const W = 320;
const H = 130;
const FLOOR = PLINTH.top - PLINTH.h + 0.02;
const ease = (x: number) => {
  const k = Math.max(0, Math.min(1, x));
  return k * k * (3 - 2 * k);
};

const curtainGeo = () => {
  const g = new PlaneGeometry(W, H, 900, 8);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const fold = Math.sin(x * 0.9) * 1.1 + Math.sin(x * 0.37 + 1.3) * 0.6;
    p.setZ(i, fold * (0.75 + 0.25 * (1 - (y + H / 2) / H)));
  }
  g.computeVertexNormals();
  return g;
};

const label = (text: string, font: string, bg: string, fg: string, w = 512, h = 256, size = 120) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = fg;
  g.lineWidth = 10;
  g.strokeRect(12, 12, w - 24, h - 24);
  g.fillStyle = fg;
  g.font = `800 ${size}px ${font}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 6);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const Backdrop: React.FC<{ s: FilmState<Chair, ChairFx>; font: string }> = ({ s, font }) => {
  const fx = s.fx;
  const geo = useMemo(curtainGeo, []);
  const grain = useSurfaceGrain(61, 0.18, 14);
  const cloth = useMemo(() => new MeshStandardMaterial({ color: "#d6c7ad", roughness: 0.95, roughnessMap: grain, bumpMap: grain, bumpScale: 0.6 }), [grain]);
  const woodGrain = useSurfaceGrain(83, 0.3, 6);
  const wood = useMemo(() => new MeshStandardMaterial({ color: "#a8825c", roughness: 0.5, roughnessMap: woodGrain, bumpMap: woodGrain, bumpScale: 0.4 }), [woodGrain]);
  const rugGrain = useSurfaceGrain(29, 0.25, 20);
  const rug = useMemo(() => new MeshStandardMaterial({ color: "#b8584a", roughness: 0.92, roughnessMap: rugGrain, bumpMap: rugGrain, bumpScale: 0.5 }), [rugGrain]);
  const gold = useMemo(() => new MeshStandardMaterial({ color: "#c9a14a", metalness: 0.85, roughness: 0.35 }), []);
  const stone = useMemo(() => new MeshStandardMaterial({ color: "#e4ddd0", roughness: 0.6 }), []);
  const box = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const col = useMemo(() => new CylinderGeometry(1, 1.08, 1, 40), []);
  const plane = useMemo(() => new PlaneGeometry(1, 1), []);
  const tiles = useMemo(() => Array.from({ length: 60 }, () => new MeshStandardMaterial({ color: "#d9d2c4", roughness: 0.5 })), []);
  const calon = useMemo(() => [1, 2].map((n) => new MeshStandardMaterial({ map: label(`CALON ${n}`, font, "#1c2a48", "#f2e6c9", 512, 256, 96), roughness: 0.5 })), [font]);
  const pillarLab = useMemo(() => ["DPR", "MK", "MPR"].map((t) => new MeshStandardMaterial({ map: label(t, font, "#f4efe6", "#1c2a48", 512, 256, 150), roughness: 0.6 })), [font]);

  const ringOn = fx.ring;
  tiles.forEach((m, i) => {
    const lit = ringOn > 0.01 && i < Math.round(ringOn * 60);
    m.color.set(lit ? "#c4302b" : "#d9d2c4");
    m.emissive.set(lit ? "#5a0c0a" : "#000000");
  });

  return (
    <>
      {/* warm rim light from behind: separates the chair from the curtain */}
      <spotLight position={[0, 16, -16]} target-position={[0, -2, 0]} angle={0.5} penumbra={0.8} intensity={900} distance={60} decay={1.6} color="#ffd9a8" />
      {/* curtain + wainscot */}
      <group position={[0, 0, -42]}>
        <mesh geometry={geo} material={cloth} position={[0, 50, 0]} receiveShadow />
        {Array.from({ length: 19 }, (_, i) => i - 9).map((i) => (
          <mesh key={i} material={wood} position={[i * 17, -11.2, 2.2]} receiveShadow castShadow>
            <RoundedBoxGeo args={[16.2, 5.5, 1.0]} radius={0.25} />
          </mesh>
        ))}
      </group>
      {/* red carpet with a gold border */}
      <mesh geometry={plane} material={gold} position={[0, FLOOR, -6]} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 64, 1]} receiveShadow />
      <mesh geometry={plane} material={rug} position={[0, FLOOR + 0.02, -6]} rotation={[-Math.PI / 2, 0, 0]} scale={[28.6, 62.6, 1]} receiveShadow />
      {/* 60-day ring */}
      {ringOn > 0.001
        ? tiles.map((m, i) => {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            return <mesh key={i} geometry={box} material={m} position={[Math.cos(a) * 8.6, FLOOR + 0.25, Math.sin(a) * 8.6]} rotation={[0, -a, 0]} scale={[0.5, 0.35 * Math.min(1, ringOn * 6), 0.75]} castShadow />;
          })
        : null}
      {/* two candidate boards */}
      {fx.cards > 0.01
        ? [-1, 1].map((sx, i) => {
            const k = ease(fx.cards * 1.4 - i * 0.4);
            return (
              <group key={sx} position={[sx * 11.5, FLOOR, 3]} rotation={[0, -sx * 0.35, 0]} scale={[1, Math.max(0.001, k), 1]}>
                <mesh geometry={box} material={wood} position={[0, 4, 0]} scale={[0.5, 8, 0.5]} castShadow />
                <mesh geometry={box} material={wood} position={[0, 9.4, 0]} scale={[7.2, 3.8, 0.4]} castShadow />
                <mesh geometry={plane} material={calon[i]} position={[0, 9.4, 0.22]} scale={[6.8, 3.4, 1]} />
              </group>
            );
          })
        : null}
      {/* DPR / MK / MPR pillars behind the chair */}
      {[fx.dpr, fx.mk, fx.mpr].map((v, i) => {
        if (v < 0.01) return null;
        const h = 21 * ease(v);
        return (
          <group key={i} position={[(i - 1) * 12, FLOOR, -11]}>
            <mesh geometry={col} material={stone} position={[0, h / 2, 0]} scale={[2.2, Math.max(0.01, h), 2.2]} castShadow receiveShadow />
            <mesh geometry={box} material={gold} position={[0, h + 0.3, 0]} scale={[5.4, 0.6, 5.4]} castShadow />
            {v > 0.6 ? <mesh geometry={plane} material={pillarLab[i]} position={[0, h + 2.6, 0]} scale={[6, 3, 1]} /> : null}
          </group>
        );
      })}
    </>
  );
};
