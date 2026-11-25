// Station 6 (x = 72): Umm Al-Joud today (c07). On black kiswah silk: the dye vat where white silk
// turns black, a jacquard warp of vertical threads, the band being printed and embroidered, four
// thread bales sized by weight (data 2025), a giant cut thread showing the silver core under the
// gold, and 47 black panels falling into place on the maquette, then the gold pieces.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Band } from "./band.tsx";
import { KAABA, Kaaba, PAL, silkMat, Spool, Tag, weaveTex } from "./kit.tsx";
import { CH, clamp, ease, lerp, pop, SX, W } from "./tl.ts";

const C = "c07_pabrik";

export const bandX7 = (t: number) => {
  const a = W(C, "disulam");
  return lerp(-1.6, 0.2, clamp((t - a) / (W(C, "timbul") - a))) + clamp((t - W(C, "timbul")) / 40) * 1.0;
};

const PANELS = (() => {
  const out: { side: number; u: number; w: number }[] = [];
  const counts = [12, 12, 12, 11];
  counts.forEach((n, side) => {
    for (let i = 0; i < n; i++) out.push({ side, u: (i + 0.5) / n - 0.5, w: 1 / n });
  });
  return out;
})();

export const Station6: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(6);
  const m = useMemo(
    () => ({
      silkW: silkMat(PAL.white, weaveTex(PAL.white, 201, [1, 4], 4)),
      silkB: silkMat("#141214", weaveTex("#141214", 202, [1, 4], 4)),
      cotton: silkMat(PAL.cotton, weaveTex(PAL.cotton, 203, [1, 4], 4)),
      gold: new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.2 }),
      silver: new THREE.MeshStandardMaterial({ color: "#D6D8DC", metalness: 1, roughness: 0.18 }),
      dye: new THREE.MeshPhysicalMaterial({ color: "#060506", roughness: 0.08, clearcoat: 1 }),
      steel: new THREE.MeshStandardMaterial({ color: "#8E9298", metalness: 1, roughness: 0.35 }),
      warp: new THREE.MeshStandardMaterial({ color: "#E8E0D0", roughness: 0.6 }),
      panel: silkMat("#121012", weaveTex("#121012", 205, [1, 6], 4)),
    }),
    [],
  );
  const skein = useMemo(() => silkMat(PAL.white), []);
  const tDye = W(C, "dicelup");
  const dip = Math.sin(Math.PI * clamp((t - tDye + 0.8) / 2.6));
  const dark = ease(t, tDye, 1.6);
  skein.color.copy(new THREE.Color(PAL.white).lerp(new THREE.Color("#141214"), dark));
  skein.sheenColor.copy(new THREE.Color("#ffffff").lerp(new THREE.Color("#5A4E5C"), dark));
  const tJac = W(C, "jacquard");
  const shed = Math.sin((t - tJac) * 3.2) * ease(t, tJac, 0.8);
  // bales: heights proportional to kg (825 / 410 / 120 / 60)
  const bales = [
    { kg: 825, mat: m.silkB, at: W(C, "delapan", 1), lines: ["± 825 kg", "sutra mentah"] },
    { kg: 410, mat: m.cotton, at: W(C, "empat", 0), lines: ["± 410 kg", "katun"] },
    { kg: 120, mat: m.gold, at: W(C, "seratus", 0), lines: ["120 kg perak", "bersepuh emas"] },
    { kg: 60, mat: m.silver, at: W(C, "enam", 0), lines: ["60 kg", "perak murni"] },
  ];
  const tCut = W(C, "sebenarnya");
  const tPanels = W(C, "empat", 2);
  const tGold = W(C, "lima", 2);
  const tIkhlas = W(C, "alikhlas");
  const { w, d, h } = KAABA;
  return (
    <group position={[O, 0, 0]}>
      <Band pos={[0, 0, 0.15]} x0={-4.2} x1={4.2} X={t < W(C, "disulam") ? -4.3 : bandX7(t)} needle={t > W(C, "disulam") - 0.5} threads={t > W(C, "disulam") - 0.5} />
      {/* dye vat */}
      <group position={[-2.3, 0, -1.25]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.38, 0.44, 40, 1, true]} />
          <primitive object={m.steel} attach="material" />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.41, 40]} />
          <primitive object={m.dye} attach="material" />
        </mesh>
        <mesh position={[0, 0.72 - dip * 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.2, 0.06, 16, 40]} />
          <primitive object={skein} attach="material" />
        </mesh>
        <mesh position={[0, 1.0 - dip * 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
          <primitive object={m.steel} attach="material" />
        </mesh>
      </group>
      {/* jacquard warp: vertical silk threads like rain, heddles opening the shed */}
      <group position={[0.1, 0, -1.85]}>
        {[-1.3, 1.3].map((x) => (
          <mesh key={x} position={[x, 0.75, 0]} castShadow>
            <boxGeometry args={[0.06, 1.5, 0.06]} />
            <meshStandardMaterial color="#6B4A2E" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 1.48, 0]} castShadow>
          <boxGeometry args={[2.66, 0.06, 0.06]} />
          <meshStandardMaterial color="#6B4A2E" roughness={0.7} />
        </mesh>
        {Array.from({ length: 72 }, (_, i) => {
          const x = -1.24 + (i / 71) * 2.48;
          const o = (i % 2 ? 1 : -1) * shed * 0.05;
          return (
            <mesh key={i} position={[x, 0.75, o]} castShadow={false}>
              <boxGeometry args={[0.006, 1.42, 0.006]} />
              <primitive object={i % 2 ? m.warp : m.silkB} attach="material" />
            </mesh>
          );
        })}
      </group>
      {/* thread bales */}
      <group position={[2.0, 0, -1.2]}>
        {bales.map((b, i) => {
          const hh = (b.kg / 825) * 0.95 * ease(t, b.at - 0.2, 0.9);
          return (
            <group key={i} position={[(i % 2) * 0.62 - 0.3, 0, Math.floor(i / 2) * 0.62 - 0.3]}>
              {hh > 0.002 && (
                <mesh position={[0, hh / 2, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.22, 0.22, hh, 32]} />
                  <primitive object={b.mat} attach="material" />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
      {bales.map((b, i) => (
        <Tag key={i} pos={[1.1 + (i % 2) * 1.1, 0.06, 0.95]} lines={b.lines} t={t} at={b.at} until={i < 2 ? (bales[i + 2]?.at ?? tCut) : tCut} w={1.0} accent={i >= 2} />
      ))}
      {/* the cut thread: silver core, gold skin */}
      <group position={[-1.75, 0, 1.25]} rotation={[0, 0.35, 0]} scale={pop(t, W(C, "ya") - 0.2, 0.7)}>
        <mesh position={[0, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.9, 40, 1, true]} />
          <primitive object={m.gold} attach="material" />
        </mesh>
        <mesh position={[0.03, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.148, 0.148, 0.96, 40]} />
          <primitive object={m.silver} attach="material" />
        </mesh>
      </group>
      {/* 47 panels fall onto the maquette, then the gold pieces */}
      <group position={[2.55, 0, 1.05]} rotation={[0, -0.5, 0]} scale={0.8}>
        <Kaaba pos={[0, 0, 0]} shells={[]} corner={ease(t, tGold, 0.6) > 0.5} />
        {PANELS.map((p, i) => {
          const k = ease(t, tPanels - 0.3 + i * 0.12, 0.6);
          if (k <= 0.001) return null;
          const side = p.side;
          const len = side % 2 === 0 ? w : d;
          const y = 0.04 + h / 2 + (1 - k) * 1.4;
          const off = 0.006;
          const pos: [number, number, number] =
            side === 0 ? [p.u * len, y, d / 2 + off] : side === 1 ? [w / 2 + off, y, -p.u * len] : side === 2 ? [-p.u * len, y, -d / 2 - off] : [-w / 2 - off, y, p.u * len];
          return (
            <mesh key={i} position={pos} rotation={[0, (side * Math.PI) / 2, 0]} castShadow>
              <boxGeometry args={[p.w * len - 0.004, h, 0.006]} />
              <primitive object={m.panel} attach="material" />
            </mesh>
          );
        })}
        {/* gold band (hizam), door curtain and corner pieces: geometric gold, no lettering */}
        {t > tGold - 0.3 && (
          <group scale={[1, ease(t, tGold - 0.3, 0.8), 1]} position={[0, 0.04 + h * 0.7, 0]}>
            <mesh castShadow>
              <boxGeometry args={[w + 0.03, 0.08, d + 0.03]} />
              <primitive object={m.gold} attach="material" />
            </mesh>
          </group>
        )}
        {t > W(C, "tirai") && (
          <mesh position={[-w * 0.18, 0.04 + h * 0.46, d / 2 + 0.014]} scale={[1, ease(t, W(C, "tirai"), 0.6), 1]} castShadow>
            <boxGeometry args={[0.22, 0.4, 0.008]} />
            <primitive object={m.gold} attach="material" />
          </mesh>
        )}
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          const s = pop(t, tIkhlas + k * 0.15, 0.4);
          if (s <= 0.001) return null;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.62 * (w / 1.0) * 0.82, 0.04 + h * 0.55, Math.sin(a) * 0.62 * (d / 0.86) * 0.72]} rotation={[0, -a + Math.PI / 2, Math.PI / 4]} scale={s}>
              <boxGeometry args={[0.07, 0.07, 0.01]} />
              <primitive object={m.gold} attach="material" />
            </mesh>
          );
        })}
      </group>
      <Spool pos={[-3.3, 0, 0.9]} color={PAL.gold} />
      <Spool pos={[3.6, 0, -0.2]} color="#141214" rotY={0.4} />
      {/* callouts */}
      <Tag pos={[0, 0.06, 1.25]} lines={["Umm Al-Joud, Makkah · 1977"]} t={t} at={W(C, "umm")} until={W(C, "kompleks")} w={1.35} accent />
      <Tag pos={[0, 0.06, 1.25]} lines={["2018: Kompleks Raja Abdulaziz", "untuk Kiswah Ka'bah"]} t={t} at={W(C, "kompleks")} until={W(C, "sutra")} w={1.5} />
      <Tag pos={[-2.3, 0.06, -0.45]} lines={["sutra putih → hitam"]} t={t} at={tDye} until={tJac} w={1.0} />
      <Tag pos={[0.1, 0.06, -0.95]} shortPos={[-0.4, 0.06, -0.95]} lines={["mesin jacquard", "9.000+ benang lungsin"]} t={t} at={tJac} until={W(C, "sablon")} w={1.2} accent />
      <Tag pos={[0, 0.06, 1.25]} lines={["sablon → sulam → rakit"]} t={t} at={W(C, "sablon")} until={bales[0].at} w={1.2} />
      <Tag pos={[-1.75, 0.06, 1.85]} shortPos={[-1.5, 0.06, 2.4]} lines={["benang perak", "disepuh emas 24 karat"]} t={t} at={tCut} until={W(C, "hasilnya")} w={1.25} accent />
      <Tag pos={[0, 0.06, 1.25]} lines={["huruf timbul 1–2,5 cm", "isian benang katun"]} t={t} at={W(C, "timbul")} until={W(C, "hasilnya")} w={1.3} />
      <Tag pos={[3.7, 0.06, 1.7]} lines={["47 panel sutra hitam", "± 1 m × 14 m"]} t={t} at={tPanels} until={tGold} w={1.25} />
      <Tag pos={[3.7, 0.06, 1.7]} lines={["54 bagian bersulam emas", "sabuk & tirai pintu"]} t={t} at={tGold} until={W(C, "beratnya")} w={1.35} accent />
      <Tag pos={[3.7, 0.06, 1.7]} lines={["lebih dari 1,4 ton", "data resmi terbaru"]} t={t} at={W(C, "beratnya")} until={W(C, "menurut", 2)} w={1.25} accent />
      <Tag pos={[3.7, 0.06, 1.7]} lines={["± 150 pengrajin · 11 bulan", "data 2026"]} t={t} at={W(C, "menurut", 2)} until={W(C, "biayanya")} w={1.35} />
      <Tag pos={[3.7, 0.06, 1.7]} lines={["> 20 juta riyal", "kantor berita Saudi"]} t={t} at={W(C, "biayanya")} until={CH(C).end + 3} w={1.25} />
    </group>
  );
};
