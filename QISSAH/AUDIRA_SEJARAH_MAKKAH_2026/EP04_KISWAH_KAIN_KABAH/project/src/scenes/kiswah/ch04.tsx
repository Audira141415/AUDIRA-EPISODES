// Station 3 (x = 36): the colours of the kiswah (c04). The maquette turns slowly on a beech
// turntable; its cloth changes with the narration: white qabathi, two layers, the pile and the load
// gauge, Al-Mahdi's single cover, red and white dibaj, green, then black with the gold band.
import React, { useMemo } from "react";
import * as THREE from "three";
import { brocadeTex, Kaaba, kiswahTex, PAL, silkMat, Spool, Tag, weaveTex, type Shell } from "./kit.tsx";
import { CH, clamp, ease, lerp, SX, W } from "./tl.ts";

const C = "c04_warna";

export const Station3: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(3);
  const linen = useMemo(() => weaveTex(PAL.linen, 141, [14, 18], 8), []);
  const beech = useMemo(() => weaveTex(PAL.beech, 143, [3, 3], 16), []);
  const m = useMemo(
    () => ({
      white: silkMat(PAL.white, weaveTex(PAL.white, 151, [3, 3], 6)),
      white2: silkMat("#E7DDC8", weaveTex("#E7DDC8", 152, [3, 3], 6)),
      ivoryB: silkMat("#E9DCC0", brocadeTex("#E9DCC0", "rgba(170,140,90,0.45)")),
      pile: ["#D8CCB4", "#C9B79A", "#E2D6BE"].map((c, i) => silkMat(c, weaveTex(c, 160 + i, [3, 3], 6))),
      red: silkMat(PAL.red, brocadeTex(PAL.red, "rgba(255,200,170,0.35)")),
      whiteB: silkMat("#F0E8D8", brocadeTex("#F0E8D8", "rgba(170,140,90,0.4)")),
      green: silkMat(PAL.green, weaveTex(PAL.green, 171, [3, 3], 6)),
      black: new THREE.MeshPhysicalMaterial({ map: kiswahTex(), roughness: 0.5, sheen: 1, sheenRoughness: 0.35, sheenColor: "#5A4E5C" }),
    }),
    [],
  );
  const tQ = W(C, "qabathi");
  const tTwo = W(C, "dua");
  const tDibaj = W(C, "dibaj");
  const tPile = W(C, "tumpukan");
  const tHeavy = W(C, "berat");
  const tOff = W(C, "mencopot");
  const tRed = W(C, "merah");
  const tWhite = W(C, "putih", 1);
  const tGreen = W(C, "hijau");
  const tBlack = W(C, "hitam", 1);
  const L = (a: number) => ease(t, a, 1.1);
  const shells: Shell[] = [
    { mat: m.white, cover: ease(t, tQ - 0.3, 1.2), lift: L(tRed + 0.6), inflate: 0.012 },
    { mat: m.white2, cover: ease(t, tTwo - 0.2, 1.0), lift: L(tOff), inflate: 0.024 },
    { mat: m.ivoryB, cover: ease(t, tDibaj - 0.3, 1.0), lift: L(tOff + 0.15), inflate: 0.036 },
    ...m.pile.map((mat, i) => ({ mat, cover: ease(t, tPile + 0.3 + i * 0.9, 0.9), lift: L(tOff + 0.3 + i * 0.15), inflate: 0.048 + i * 0.012 })),
    { mat: m.red, cover: ease(t, tRed - 0.4, 1.0), lift: L(tWhite + 0.5), inflate: 0.026 },
    { mat: m.whiteB, cover: ease(t, tWhite - 0.3, 1.0), lift: L(tGreen + 0.5), inflate: 0.03 },
    { mat: m.green, cover: ease(t, tGreen - 0.3, 1.0), lift: L(tBlack + 0.5), inflate: 0.034 },
    { mat: m.black, cover: ease(t, tBlack - 0.3, 1.1), inflate: 0.038 },
  ].map((s) => ({ ...s, cover: (s.lift ?? 0) >= 0.999 ? 0 : s.cover }));
  // load gauge: needle rises with the pile, drops when Al-Mahdi removes it
  const load = clamp(ease(t, tTwo, 1) * 0.2 + ease(t, tDibaj, 1) * 0.15 + ease(t, tPile, 3) * 0.35 + ease(t, tHeavy - 1, 1.2) * 0.25) * (1 - ease(t, tOff + 0.4, 1.4) * 0.8);
  const rot = (t - CH(C).start) * 0.1 - 0.4;
  // timeline tags alternate between two slots so they never overlap
  const slots: [number, number, number][] = [
    [-1.2, 0.05, 0.95],
    [1.2, 0.05, 0.95],
  ];
  const tags: { at: string; n?: number; lines: string[]; accent?: boolean }[] = [
    { at: "qabathi", lines: ["Abu Bakar & Umar", "qabathi · linen putih Mesir"] },
    { at: "baitul", lines: ["dibiayai Baitul Mal"] },
    { at: "utsman", lines: ["Utsman", "dua lapis"] },
    { at: "muawiyah", lines: ["Mu'awiyah", "dua kali setahun"] },
    { at: "dibaj", lines: ["masa Umayyah", "dibaj · sutra brokat"] },
    { at: "seratus", lines: ["Al-Mahdi · 160 H", "menurut Al-Ya'qubi"], accent: true },
    { at: "mencopot", lines: ["hanya satu kiswah"], accent: true },
    { at: "almamun", lines: ["Al-Ma'mun", "tiga kali setahun"] },
    { at: "fathimiyah", lines: ["Fathimiyah", "kiswah putih dari Mesir"] },
    { at: "nama", lines: ["nama · tempat · tahun", "ditulis pada kain"] },
    { at: "annashir", lines: ["An-Nashir", "abad ke-12–13 M"], accent: true },
    { at: "delapan", lines: ["hitam ± 800 tahun"], accent: true },
  ];
  const times = tags.map((g) => W(C, g.at, g.n ?? 0));
  return (
    <group position={[O, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[12.02, 16]} />
        <meshStandardMaterial map={linen.map} bumpMap={linen.bump} bumpScale={0.6} roughness={0.9} />
      </mesh>
      {/* embroidered floor ring: a stitched circle of colour stations */}
      {[PAL.white, "#E9DCC0", PAL.red, "#F0E8D8", PAL.green, "#141214"].map((c, i) => {
        const a = -Math.PI * 0.85 + (i / 5) * Math.PI * 0.7;
        const lit = [tQ, tDibaj, tRed, tWhite, tGreen, tBlack][i];
        return (
          <mesh key={i} position={[Math.cos(a) * 1.75, 0.012 + ease(t, lit, 0.5) * 0.01, -Math.sin(a) * 1.75 * -1 - 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
            <circleGeometry args={[0.13 + ease(t, lit, 0.5) * 0.04, 28]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.25, 1.3, 0.07, 64]} />
        <meshStandardMaterial map={beech.map} roughness={0.55} />
      </mesh>
      <Kaaba pos={[0, 0.075, 0]} rotY={rot} shells={shells} door={ease(t, tBlack, 0.8)} />
      {/* brass load gauge */}
      <group position={[1.55, 0, -0.55]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.03, 0.6, 10]} />
          <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.3} />
        </mesh>
        <group position={[0, 0.66, 0]} rotation={[0.2, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.03, 40]} />
            <meshStandardMaterial color="#EDE3CF" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <torusGeometry args={[0.2, 0.014, 10, 40]} />
            <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.25} />
          </mesh>
          {/* red zone */}
          <mesh position={[0, 0, 0.017]} rotation={[0, 0, -0.2]}>
            <ringGeometry args={[0.13, 0.17, 24, 1, 0, 0.9]} />
            <meshStandardMaterial color="#A8242E" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.025]} rotation={[0, 0, lerp(1.9, -0.6, load)]}>
            <boxGeometry args={[0.012, 0.32, 0.006]} />
            <meshStandardMaterial color="#2A1A12" roughness={0.6} />
          </mesh>
        </group>
      </group>
      <Spool pos={[-2.4, 0, -0.9]} color={PAL.red} />
      <Spool pos={[-2.7, 0, -0.3]} color={PAL.green} rotY={0.6} />
      <Spool pos={[2.6, 0, 0.9]} color={PAL.white} />
      {tags.map((g, i) => (
        <Tag key={g.at} pos={slots[i % 2]} lines={g.lines} t={t} at={times[i]} until={i + 2 < times.length ? times[i + 2] : CH(C).end + 3} w={1.2} accent={g.accent} />
      ))}
    </group>
  );
};
