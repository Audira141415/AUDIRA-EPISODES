// Bab 7: Kota yang bergerak untuk jutaan tamu. Brass bar chart of pilgrims (official GASTAT),
// metro Al-Masya'ir east to Mina-Muzdalifah-Arafah, Haramain rail west, five-storey Jamarat,
// the Mina tents (1997 shown abstractly as darkened tents), the fire-proof tent city, 2026 numbers.
import React, { useMemo } from "react";
import { CH, clamp01, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef, V3 } from "../types.ts";
import { SITE } from "../hub.tsx";
import { FlowLine, Label3D } from "../parts.tsx";
import { EBox } from "../MakkahWorld.tsx";
import { INK } from "../engraving.ts";
import { G, H, K, Rail, RAIL_PTS } from "./common.tsx";

const C = "c08_kota_modern";
export const CHART = G(-1.1, 4.4, 0);
const BARS: [string, number, string][] = [["1970", 1.08, "± 1 juta"], ["2012", 3.16, "> 3,1 juta"], ["2020", 0.001, "1.000 orang"], ["2026", 1.71, "± 1,7 juta"]];
const MET: V3[] = [SITE.mina, [-9.5, 0, -1.5], SITE.muzdalifah, [-13.5, 0, -1.2], SITE.arafah].map(([x, , z]) => G(x, z, 0.4));

const Tents: React.FC<{ fire: number; rebuilt: number }> = ({ fire, rebuilt }) => {
  const pts = useMemo(() => {
    const out: V3[] = [];
    for (let i = 0; i < 14; i++) for (let j = 0; j < 7; j++) out.push(G(-9.9 + i * 0.19, -2.3 + j * 0.2 + (i % 2) * 0.05, 0));
    return out;
  }, []);
  const dark = fire * (1 - rebuilt);
  const color = dark > 0.5 ? "#5a4632" : "#f4ecd8";
  return (
    <>
      {pts.map((p, i) => (
        <mesh key={i} position={[p[0], p[1] + 0.05, p[2]]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.1, 0.11, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} emissive={dark > 0.5 ? "#c4682c" : "#000000"} emissiveIntensity={dark > 0.5 ? 0.35 * dark : 0} />
        </mesh>
      ))}
    </>
  );
};

const World: React.FC<{ t: number }> = ({ t }) => {
  const o = (a: number, b: number) => window01(t, a, b, 0.4, 0.6);
  const end = CH(C).end + 0.8;
  const show = (k: number) => [ramp(t, W(C, "1970") - 0.3, W(C, "1970") + 0.9), ramp(t, W(C, "2012") - 0.3, W(C, "2012") + 0.9), ramp(t, W(C, "2020") - 0.3, W(C, "2020") + 0.9), ramp(t, W(C, "2026") - 0.3, W(C, "2026") + 1.2)][k];
  const metro = ramp(t, W(C, "Al-Masya'ir") - 0.3, W(C, "Arafah") + 0.5);
  const train = clamp01((t - W(C, "Arafah")) / 8) % 1;
  const jam = ramp(t, W(C, "lima", 1) - 0.6, W(C, "lantai") + 0.6);
  const fire = ramp(t, W(C, "1997") - 0.2, W(C, "terbakar") + 0.4);
  const rebuilt = ramp(t, W(C, "permanen") - 0.6, W(C, "Teflon") + 0.4);
  return (
    <>
      {/* bar chart stand */}
      <group position={CHART}>
        <EBox args={[3.0, 0.12, 0.7]} position={[0, 0.06, 0]} mat={{ color: "#8a6a44", freq: 30, keep: 0.6 }} />
        {BARS.map(([y, v], i) => {
          const h = Math.max(0.01, v * 0.8 * show(i));
          return (
            <group key={y} position={[-1.1 + i * 0.73, 0.12, 0]}>
              <mesh position={[0, h / 2, 0]} castShadow>
                <boxGeometry args={[0.42, h, 0.42]} />
                <meshStandardMaterial color={i === 2 ? INK.terracotta : INK.gold} metalness={0.6} roughness={0.4} emissive="#6a4f1c" emissiveIntensity={0.45} />
              </mesh>
            </group>
          );
        })}
      </group>
      {BARS.map(([y, v, lab], i) => (
        <Label3D key={y} at={[CHART[0] - 1.1 + i * 0.73, CHART[1] + 0.12 + v * 0.8 * show(i), CHART[2]]} title={y} sub={lab} o={show(i) * window01(t, CH(C).start, W(C, "menggerakkan") + 0.4, 0.5, 0.8) + (i === 3 ? show(3) * window01(t, W(C, "2026"), end, 0.4, 0.8) : 0)} lift={0.3} h={0.26} />
      ))}
      {/* metro Al-Masya'ir on pylons */}
      <FlowLine pts={MET} r={0.09} t={t} reveal={metro} o={window01(t, W(C, "Al-Masya'ir") - 0.3, end, 0.3, 0.8)} color="#e8c26a" />
      {metro > 0.05
        ? Array.from({ length: 9 }).map((_, i) => {
            const k = i / 8;
            const s = Math.min(MET.length - 1.001, k * (MET.length - 1));
            const a = MET[Math.floor(s)], b = MET[Math.floor(s) + 1], f = s - Math.floor(s);
            const p: V3 = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
            if (k > metro) return null;
            return (
              <group key={i}>
                <mesh position={[p[0], p[1] / 2, p[2]]}>
                  <cylinderGeometry args={[0.05, 0.07, p[1], 8]} />
                  <meshStandardMaterial color="#d8c8a6" />
                </mesh>
                <mesh position={p}>
                  <cylinderGeometry args={[0.24, 0.24, 0.06, 18]} />
                  <meshStandardMaterial color={INK.gold} metalness={0.85} roughness={0.3} />
                </mesh>
              </group>
            );
          })
        : null}
      {metro > 0.9 && train > 0 && train < 1 ? (
        (() => {
          const s = train * (MET.length - 1.001);
          const a = MET[Math.floor(s)], b = MET[Math.floor(s) + 1], f = s - Math.floor(s);
          return (
            <mesh position={[a[0] + (b[0] - a[0]) * f, a[1] + 0.08, a[2] + (b[2] - a[2]) * f]} rotation={[0, Math.atan2(b[0] - a[0], b[2] - a[2]), 0]}>
              <boxGeometry args={[0.2, 0.16, 1.6]} />
              <meshStandardMaterial color="#efe2c4" metalness={0.4} roughness={0.4} />
            </mesh>
          );
        })()
      ) : null}
      <Label3D at={G(SITE.mina[0], SITE.mina[2], 0.4)} title="MINA" o={o(W(C, "Mina") - 0.3, end)} lift={0.6} h={0.3} />
      <Label3D at={G(SITE.muzdalifah[0], SITE.muzdalifah[2], 0.4)} title="MUZDALIFAH" o={o(W(C, "Muzdalifah") - 0.3, W(C, "Haramain"))} lift={0.6} h={0.3} />
      <Label3D at={G(SITE.arafah[0], SITE.arafah[2], 0.4)} title="ARAFAH" sub="18,1 km · 9 stasiun" o={o(W(C, "Arafah") - 0.3, W(C, "Haramain"))} lift={0.7} h={0.34} />
      <Rail t={t} reveal={ramp(t, W(C, "Haramain") - 0.3, W(C, "2018") + 0.8)} train={ramp(t, W(C, "melaju") - 0.5, W(C, "jam") + 1)} o={window01(t, W(C, "Haramain") - 0.3, W(C, "Jembatan") + 0.6, 0.3, 0.8)} />
      <Label3D at={G(9, -1.4, 0.2)} title="HARAMAIN  →" sub="± 450 km · 300 km/jam" o={o(W(C, "Haramain") - 0.2, W(C, "Jembatan") + 0.4)} lift={1.0} h={0.45} />
      {/* Jamarat: five storeys */}
      {jam > 0.01
        ? Array.from({ length: 5 }).map((_, i) => {
            const k = clamp01(jam * 5 - i);
            if (k <= 0.01) return null;
            const p = G(-6.5, -0.4, 0);
            return <EBox key={i} args={[1.6, 0.075 * k, 0.5]} position={[p[0], p[1] + 0.04 + i * 0.08, p[2]]} rotation={[0, 0.35, 0]} mat={{ color: "#ece0c2", freq: 30, keep: 0.3 }} />;
          })
        : null}
      <Label3D at={G(-6.5, -0.4, 0.42)} title="JAMARAT" sub="bangunan 5 lantai" o={o(W(C, "Jamarat") - 0.2, W(C, "1997"))} lift={0.5} h={0.26} />
      {t > W(C, "Mina", 1) - 3 ? <Tents fire={fire} rebuilt={rebuilt} /> : null}
    </>
  );
};

export const ch08: ChapterDef = {
  id: C,
  card: { num: "BAB 7", title: "Kota yang Bergerak untuk Jutaan Tamu", tag: "1970–2026" },
  keys: () => [
    K(CH(C).start, [-0.4, 1.8, 8.8], [CHART[0], 1.0, CHART[2]], 38),
    K(W(C, "2012"), [0.6, 1.6, 7.8], [CHART[0], 1.2, CHART[2]], 38),
    K(W(C, "2020"), [-0.6, 1.5, 8.9], [CHART[0] + 0.3, 0.6, CHART[2]], 36),
    K(W(C, "menggerakkan"), [-2.2, 6, 9.5], [-7, 0, -1.2], 40),
    K(W(C, "Al-Masya'ir"), G(-8.2, 2.4, 2.4), G(-11.5, -1.4, 0.4), 40),
    K(W(C, "delapan"), G(-12.2, 2.4, 2.4), G(-15, -1.1, 0.4), 40),
    K(W(C, "Haramain"), G(9, 2.8, 2.4), G(14, -1.6, 0.2), 40),
    K(W(C, "melaju"), G(5.5, 2.4, 2.2), RAIL_PTS[3], 40),
    K(W(C, "jam") + 0.6, G(30, 2.2, 2.0), RAIL_PTS[21], 40),
    K(W(C, "Jamarat"), [-4.8, 1.6, 1.6], [-6.5, 0.2, -0.4], 38),
    K(W(C, "Mina", 1), [-6.4, 2.6, 1.8], [-8.6, 0, -1.3], 38),
    K(W(C, "permanen"), [-8.2, 4.4, 2.6], [-8.6, 0, -1.3], 40),
    K(W(C, "2026"), [-2.6, 2.0, 8.6], [CHART[0], 1.0, CHART[2]], 38),
    K(W(C, "udara"), [0.6, 6.2, 15], [0.3, 2.4, -2], 40),
    K(CH(C).end + 0.6, [0.4, 6.6, 16], [0.3, 2.4, -2], 40),
  ],
  hub: () => H(2, 0, 1, 0.15, 1, 0.6),
  dusk: () => 0.6,
  World,
  callouts: () => [
    { a: W(C, "Data") - 0.2, b: W(C, "Rekornya"), kicker: "DATA RESMI SAUDI · SEJAK 1970", title: "± 1 juta jemaah", sub: "di tahun pertama", pos: "tl" },
    { a: W(C, "2020") - 0.2, b: W(C, "menggerakkan") + 0.4, kicker: "2020 · PANDEMI", title: "1.000 orang", pos: "tr", big: true },
    { a: W(C, "Al-Masya'ir") - 0.2, b: W(C, "Haramain") - 0.2, kicker: "KERETA AL-MASYA'IR · 2010", title: "Mina · Muzdalifah · Arafah", sub: "18,1 km · 9 stasiun", pos: "tl" },
    { a: W(C, "Haramain") - 0.2, b: W(C, "Jembatan") - 0.2, kicker: "KERETA CEPAT HARAMAIN · 2018", title: "± 450 km · 300 km/jam", pos: "tl" },
    { a: W(C, "Jembatan") - 0.2, b: W(C, "pelajaran") - 0.4, kicker: "JAMARAT", title: "Dibongkar 2006 → 5 lantai", pos: "tr" },
    { a: W(C, "1997") - 0.2, b: W(C, "Setelah") - 0.2, kicker: "MINA · 1997", title: "± 70.000 tenda terbakar", sub: "lebih dari 340 jemaah wafat, menurut laporan resmi", pos: "tl" },
    { a: W(C, "Setelah") - 0.2, b: W(C, "Haji", 1) - 0.2, kicker: "SETELAH ITU", title: "> 100.000 tenda permanen", sub: "serat kaca berlapis Teflon, tahan api", pos: "tl" },
    { a: W(C, "Haji", 1) - 0.2, b: W(C, "Sembilan", 1) - 0.2, kicker: "HAJI 2026", title: "± 1,7 juta jemaah", sub: "165 kewarganegaraan", pos: "tr", big: true },
    { a: W(C, "Sembilan", 1) - 0.2, b: W(C, "laut") - 0.7, kicker: "JEMAAH LUAR NEGERI", title: "96,1% lewat udara", pos: "tr", big: true },
    { a: W(C, "laut") - 0.7, b: CH(C).end + 0.8, kicker: "LEWAT LAUT", title: "hanya 6.497 orang", pos: "tr", big: true },
  ],
};
