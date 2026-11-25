// c07 "Diuji, dituduh, dibela": a clean laboratory bench. Dated report cards (1883, 2011), the
// unofficial bottle, two studies as 3D bar charts against the WHO limit (values from the source
// register only), the pH strip, a petri dish for animal/cell studies, and one lit glass of water.

import React, { useMemo } from "react";
import * as THREE from "three";
import { at, chapter, prog, smooth, easeOut } from "./time.ts";
import { Plinth, TextPlate } from "./kit.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";

const C = "c07_sains";
export const T7 = {
  start: chapter(C).start,
  frankland: at(C, "Edward Frankland"),
  ottoman: at(C, "Tim Ottoman"),
  bbc: at(C, "investigasi BBC"),
  saudi: at(C, "Pihak Saudi membantah"),
  journal: at(C, "apa kata jurnal"),
  s2012: at(C, "Satu studi tahun"),
  s2021: at(C, "Studi tahun dua ribu dua puluh satu"),
  basa: at(C, "sedikit basa"),
  animal: at(C, "hewan atau sel"),
  hadith: at(C, "Bagi umat Islam"),
  end: chapter(C).end,
};

/** Bars: value / WHO limit (limit line at height LIMIT_H). */
export const LIMIT_H = 2.4;
/** Chart baseline height (above the cards on the bench). */
export const CHART_Y = 5.6;
export const BARS = [
  { id: "as12", x: -8.2, ratio: 27 / 10, at: "s2012", label: "Arsenik 27 µg/L", color: "#e2783d", side: "left" },
  { id: "no12", x: -5.8, ratio: 150 / 50, at: "s2012", label: "Nitrat 150 mg/L", color: "#e2983d", side: "right" },
  { id: "tds21", x: 5.0, ratio: 814 / 1000, at: "s2021", label: "TDS 814 mg/L", color: "#3fb2d9", side: "left" },
  { id: "as21", x: 7.4, ratio: 0.03, at: "s2021", label: "Arsenik: tak terdeteksi", color: "#3fb2d9", side: "right" },
] as const;

export const Lab: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(
    () => ({
      bench: new THREE.MeshPhysicalMaterial({ color: "#c9d3d6", roughness: 0.35, clearcoat: 0.5 }),
      leg: new THREE.MeshPhysicalMaterial({ color: "#9aa3a8", metalness: 0.9, roughness: 0.3 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#eaf8ff", roughness: 0.04, transparent: true, opacity: 0.35, depthWrite: false }),
      water: new THREE.MeshPhysicalMaterial({ color: "#5cc4e6", roughness: 0.05, emissive: "#1a7fa8", emissiveIntensity: 0.3 }),
      limit: new THREE.MeshStandardMaterial({ color: "#1d2326", emissive: "#1d2326", emissiveIntensity: 0.2 }),
      salt: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.5 }),
      bottle: new THREE.MeshPhysicalMaterial({ color: "#d4ecf5", roughness: 0.15, transparent: true, opacity: 0.7 }),
      dish: new THREE.MeshPhysicalMaterial({ color: "#f0faff", roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false }),
      agar: new THREE.MeshPhysicalMaterial({ color: "#f2d6a0", roughness: 0.6 }),
    }),
    [],
  );
  const bars = BARS.map((b) => ({ ...b, h: Math.max(0.03, b.ratio * LIMIT_H * easeOut(prog(t, T7[b.at] + 0.6, T7[b.at] + 2.6))) }));
  const charts = smooth(prog(t, T7.journal, T7.journal + 1.5));
  const cardsIn = smooth(prog(t, T7.start - 0.3, T7.start + 1.2));
  const card = (_k: keyof typeof T7) => cardsIn;
  const lift = (k: keyof typeof T7) => 0.5 * smooth(prog(t, T7[k] - 0.2, T7[k] + 0.8));
  const ph = smooth(prog(t, T7.basa - 0.3, T7.basa + 1.2));
  const dish = smooth(prog(t, T7.animal - 0.3, T7.animal + 1));
  const hadith = smooth(prog(t, T7.hadith, T7.hadith + 2.5));
  const phMat = useMemo(() => {
    if (typeof document === "undefined") return new THREE.MeshBasicMaterial();
    const c = document.createElement("canvas");
    c.width = 512; c.height = 32;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 512, 0);
    ["#e5484d", "#f0a63a", "#f3e04a", "#5cc46a", "#3aa0d8", "#5a5ad8"].forEach((col, i) => gr.addColorStop(i / 5, col));
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  }, []);

  return (
    <group>
      <Plinth w={70} d={40} h={6} top="#d9d6cf" side="#8f8a80" seed={51} front={12} />
      {/* dark backdrop wall so the white bench and cards read */}
      <mesh position={[0, 9, -14]} receiveShadow>
        <RoundedBoxGeo args={[60, 18, 1]} radius={0.3} />
        <meshPhysicalMaterial {...POLISH.stone} color="#1f4a52" />
      </mesh>
      {/* bench */}
      <mesh position={[0, 2.2, -1]} material={m.bench} castShadow receiveShadow>
        <RoundedBoxGeo args={[34, 0.5, 9]} radius={0.15} />
      </mesh>
      {[-16, 16].map((x) => [-4.5, 2.5].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 1.0, z - 1]} material={m.leg}>
          <boxGeometry args={[0.3, 2.0, 0.3]} />
        </mesh>
      )))}
      {/* back board for the charts */}
      {[-7, 6.2].map((x) => (
        <mesh key={x} position={[x, CHART_Y + 4.2 * charts - 0.6, -6.2]} scale={[1, Math.max(0.01, charts), 1]} receiveShadow>
          <RoundedBoxGeo args={[8.4, 8.4, 0.3]} radius={0.15} />
          <meshPhysicalMaterial color="#f1efe9" roughness={0.6} />
        </mesh>
      ))}

      {/* dated report cards */}
      <group scale={card("frankland")}>
        <TextPlate text="1883" sub="Frankland: tercemar" p={[-10, 3.9 + lift("frankland"), 0.6]} w={5.2} h={2.8} rot={[-0.1, 0.15, 0]} />
      </group>
      <group scale={card("ottoman")}>
        <TextPlate text="1883" sub="Ottoman: tak berbahaya" p={[-4, 3.9 + lift("ottoman"), 0.6]} w={5.2} h={2.8} rot={[-0.1, 0, 0]} bg="#eef3f0" />
        <mesh position={[-4, 2.6, 0.4]} material={m.salt} scale={card("ottoman")}>
          <coneGeometry args={[0.6, 0.5, 18]} />
        </mesh>
      </group>
      <group scale={card("bbc")}>
        <TextPlate text="2011" sub="BBC: arsenik ±3× batas" p={[6, 3.9 + lift("bbc"), 0.6]} w={5.2} h={2.8} rot={[-0.1, -0.1, 0]} />
        <mesh position={[8.9, 3.2, 1.6]} material={m.bottle} castShadow>
          <capsuleGeometry args={[0.32, 1.0, 6, 16]} />
        </mesh>
      </group>
      <group scale={card("saudi")}>
        <TextPlate text="2011" sub="Saudi: membantah" p={[12, 3.9 + lift("saudi"), 0.6]} w={5.2} h={2.8} rot={[-0.1, -0.2, 0]} bg="#eef3f0" />
      </group>

      {/* bar charts on the back board: value relative to the WHO limit line */}
      <group position={[0, CHART_Y, -5.6]} scale={[1, 1, Math.max(0.01, charts)]}>
        {[-7, 6.2].map((cx) => (
          <mesh key={cx} position={[cx, LIMIT_H, 0.3]} material={m.limit} scale={[charts, 1, 1]}>
            <boxGeometry args={[6.4, 0.06, 0.06]} />
          </mesh>
        ))}
        {bars.map((b) => (
          <mesh key={b.id} position={[b.x, b.h / 2, 0.4]} castShadow>
            <RoundedBoxGeo args={[1.4, b.h, 0.6]} radius={0.08} />
            <meshPhysicalMaterial color={b.color} roughness={0.35} clearcoat={0.5} />
          </mesh>
        ))}
      </group>

      {/* sample tubes */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[0.4 + i * 0.45, 2.45, 2.4]}>
          <mesh position={[0, 0.6, 0]} material={m.glass}>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 12]} />
          </mesh>
          <mesh position={[0, 0.35, 0]} material={m.water}>
            <cylinderGeometry args={[0.13, 0.13, 0.7, 12]} />
          </mesh>
        </group>
      ))}

      {/* pH strip 6 → 9 with a marker at about 7.6–8 */}
      <group position={[14.5, 2.5, 2.6]} scale={ph}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={phMat}>
          <planeGeometry args={[5, 0.6]} />
        </mesh>
        <mesh position={[((7.8 - 6) / 3 - 0.5) * 5, 0.35, 0]} material={m.limit}>
          <coneGeometry args={[0.18, 0.5, 4]} />
        </mesh>
      </group>

      {/* petri dish (animal / cell studies) */}
      <group position={[-15, 2.5, 2.4]} scale={dish}>
        <mesh position={[0, 0.08, 0]} material={m.agar}>
          <cylinderGeometry args={[0.95, 0.95, 0.12, 32]} />
        </mesh>
        <mesh position={[0, 0.16, 0]} material={m.dish}>
          <cylinderGeometry args={[1.05, 1.05, 0.3, 32, 1, true]} />
        </mesh>
      </group>

      {/* one glass of water, softly lit */}
      <group position={[0, 2.45, 3.0]}>
        <mesh position={[0, 0.55, 0]} material={m.glass}>
          <cylinderGeometry args={[0.42, 0.34, 1.1, 32, 1, true]} />
        </mesh>
        <mesh position={[0, 0.42, 0]} material={m.water}>
          <cylinderGeometry args={[0.4, 0.34, 0.8, 32]} />
        </mesh>
        <pointLight position={[0, 2.4, 1.4]} intensity={18 * hadith} distance={6} color="#fff3d8" />
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} scale={0.6 + hadith * 0.8}>
          <circleGeometry args={[1.2, 32]} />
          <meshBasicMaterial color="#fff1c8" transparent opacity={0.35 * hadith} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

/** Unused material recipe kept out of the scene to avoid a lint warning. */
export const _labPolish = POLISH.stone;
