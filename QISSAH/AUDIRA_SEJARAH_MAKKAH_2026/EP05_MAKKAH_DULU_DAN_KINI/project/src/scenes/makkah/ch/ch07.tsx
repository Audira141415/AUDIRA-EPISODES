// Bab 6: Benteng yang hilang, menara yang muncul. One site, south of the sanctuary: Ajyad fortress
// on Bukit Bulbul -> January 2002 (stones laid on a plan, hill lowered) -> Abraj Al-Bait rises on
// the same ground. Turkish and Saudi positions get equal cards; heritage critique and official reason
// are paired too. Neutral throughout.
import React from "react";
import { CH, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef } from "../types.ts";
import { HILL, SITE, TOWER_TOP } from "../hub.tsx";
import { Label3D } from "../parts.tsx";
import { INK } from "../engraving.ts";
import { H, K } from "./common.tsx";

const C = "c07_ajyad_menara";
const [AX, , AZ] = SITE.ajyad;

const World: React.FC<{ t: number }> = ({ t }) => {
  const o = (a: number, b: number) => window01(t, a, b, 0.4, 0.6);
  const ruler = ramp(t, W(C, "enam") - 0.4, W(C, "meter", 1) + 0.6) * (1 - ramp(t, W(C, "Biaya"), W(C, "Biaya") + 1));
  const puff = ramp(t, W(C, "meriam"), W(C, "ditembakkan") + 0.8);
  const fortTop = HILL.h;
  return (
    <>
      <Label3D at={[AX, fortTop + 0.5, AZ]} title="BENTENG AJYAD" sub="Bukit Bulbul · akhir abad ke-18" o={o(W(C, "Ajyad") - 0.3, W(C, "Januari"))} lift={0.55} h={0.3} />
      <Label3D at={[AX - 0.9, fortTop * 0.6, AZ + 0.6]} title="± 23.000 m²" o={o(W(C, "dua"), W(C, "Benteng", 2) + 0.4)} lift={0.4} h={0.2} />
      {puff > 0.01 && puff < 0.99 ? (
        <mesh position={[AX + 0.2, fortTop + 0.36 + puff * 0.2, AZ + 0.55 + puff * 0.45]} scale={0.05 + puff * 0.22}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color="#efe2c4" transparent opacity={0.75 * (1 - puff)} />
        </mesh>
      ) : null}
      <Label3D at={[AX + 1.6, 0.05, AZ + 0.6]} title="JANUARI 2002" sub="benteng dibongkar bersama sebagian bukit" o={o(W(C, "Januari") - 0.2, W(C, "Tanggapannya") + 0.4)} lift={0.5} h={0.24} />
      {/* height ruler beside the tower, engraved ticks */}
      {ruler > 0.01 ? (
        <group position={[AX + 1.95, 0, AZ + 0.9]}>
          <mesh position={[0, (TOWER_TOP * ruler) / 2, 0]}>
            <boxGeometry args={[0.03, TOWER_TOP * ruler, 0.03]} />
            <meshStandardMaterial color={INK.gold} metalness={0.85} roughness={0.3} />
          </mesh>
          {Array.from({ length: 13 }).map((_, i) => {
            const y = (i / 12) * TOWER_TOP;
            if (y > TOWER_TOP * ruler) return null;
            return (
              <mesh key={i} position={[-0.08, y, 0]}>
                <boxGeometry args={[i % 3 === 0 ? 0.2 : 0.11, 0.015, 0.015]} />
                <meshStandardMaterial color={INK.sepia} />
              </mesh>
            );
          })}
        </group>
      ) : null}
      <Label3D at={[AX + 1.95, TOWER_TOP * ruler, AZ + 0.9]} title="601 m" sub="selesai 2012" o={ruler} lift={0.35} h={0.32} tone="ink" />
      <Label3D at={[AX, 4.6, AZ + 0.6]} title="43 × 43 m" sub="muka jam, di keempat sisi" o={o(W(C, "Muka") - 0.2, W(C, "Biaya") + 0.3)} lift={0.9} h={0.22} />
    </>
  );
};

export const ch07: ChapterDef = {
  id: C,
  card: { num: "BAB 6", title: "Benteng yang Hilang, Menara yang Muncul", tag: "Ajyad · Abraj Al-Bait" },
  keys: () => [
    K(CH(C).start + 1.5, [0.1, 0.7, 2.9], [AX, 2.8, AZ], 42),
    K(W(C, "raksasa"), [0.0, 0.8, 3.4], [AX, 3.0, AZ], 42),
    K(W(C, "Tapi") + 0.6, [0.2, 1.5, 4.6], [AX, 1.0, AZ], 38),
    K(W(C, "Bulbul"), [2.6, 2.2, -0.4], [AX, 1.1, AZ], 38),
    K(W(C, "dibangun"), [-1.9, 1.9, -0.7], [AX, 1.2, AZ], 38),
    K(W(C, "meriam"), [1.1, 1.75, -1.5], [AX + 0.2, 1.35, AZ + 0.4], 34),
    K(W(C, "Januari"), [2.9, 3.0, 2.0], [AX + 0.6, 0.6, AZ], 38),
    K(W(C, "Tanggapannya"), [0.4, 4.6, 10.5], [0.3, 1.2, -2], 38),
    K(W(C, "Fahd"), [-0.6, 3.6, 8.5], [AX, 0.6, AZ], 38),
    K(W(C, "Abraj"), [-2.6, 3.4, 6.2], [AX, 3.4, AZ], 40),
    K(W(C, "enam"), [2.3, 1.1, 4.2], [AX + 0.6, 4.8, AZ], 46),
    K(W(C, "Guinness"), [1.5, 2.6, 5.4], [AX, 5.2, AZ], 44),
    K(W(C, "Muka"), [1.5, 4.9, 0.6], [AX, 4.7, AZ], 34),
    K(W(C, "Biaya"), [0.4, 5.2, 13.5], [0.3, 3.0, -2], 38),
    K(W(C, "Kelompok"), [-1.6, 3.2, 9.5], [0.1, 1.6, -1.8], 38),
    K(CH(C).end + 0.6, [1.4, 3.6, 10.5], [0.2, 1.8, -2], 38),
  ],
  hub: (t) => {
    const back = ramp(t, W(C, "Tapi") - 0.2, W(C, "benteng") + 0.8); // today -> a quarter-century ago
    const demo = ramp(t, W(C, "Januari") + 0.2, W(C, "bukitnya") + 0.8);
    const rise = ramp(t, W(C, "Abraj") - 0.3, W(C, "2012") + 0.3);
    const era = 2 - back + rise; // 2 -> 1 (Ottoman, fortress) -> 2 (modern)
    const tower = (1 - back) + rise;
    return H(Math.min(2, era), back, demo, 1 - 0.85 * Math.max(demo, 1 - back), Math.min(1, tower), ramp(t, W(C, "Muka"), W(C, "Muka") + 0.8) * (1 - ramp(t, W(C, "Biaya"), W(C, "Biaya") + 1)), window01(t, W(C, "Januari") + 0.8, W(C, "Abraj") + 0.5, 0.8, 0.8));
  },
  World,
  callouts: () => [
    { a: W(C, "dibangun") - 0.2, b: W(C, "pula") + 0.2, kicker: "MASA UTSMANI", title: "Melindungi Ka'bah", sub: "dari perampok dan penyerang", pos: "tl" },
    { a: W(C, "meriam") - 0.2, b: W(C, "Januari") - 0.2, kicker: "DARI BENTENG INI", title: "Meriam Ramadan", pos: "tr" },
    { a: W(C, "Abraj") - 0.2, b: W(C, "enam") - 0.3, kicker: "KINI DI LAHAN YANG SAMA", title: "Abraj Al-Bait", sub: "kompleks tujuh menara", pos: "tl" },
    { a: W(C, "Guinness") - 0.2, b: W(C, "Muka") - 0.2, kicker: "GUINNESS", title: "Menara jam tertinggi di dunia", sub: "Makkah Royal Clock Tower · 601 m · 2012", pos: "tl" },
    { a: W(C, "Biaya") - 0.2, b: W(C, "Kelompok") - 0.2, kicker: "BIAYA KOMPLEKS", title: "± US$15 miliar", pos: "tr", big: true },
  ],
  quotes: () => [
    {
      a: W(C, "Tanggapannya") - 0.2,
      b: W(C, "Abraj") - 0.4,
      left: { who: "KEMENTERIAN KEBUDAYAAN TURKI", text: "Memprotes keras dan meminta UNESCO ikut bersuara." },
      right: { who: "PEMERINTAH SAUDI", text: "Urusan dalam negeri; proyek untuk menampung jemaah. Raja Fahd mewakafkan lahan untuk Masjidil Haram." },
    },
    {
      a: W(C, "Kelompok") - 0.2,
      b: CH(C).end + 0.8,
      left: { who: "PEMERHATI WARISAN SEJARAH", text: "Menyayangkan hilangnya banyak bangunan lama." },
      right: { who: "PEMERINTAH", text: "Alasannya: hotel dan infrastruktur bagi jutaan jemaah." },
    },
  ],
};
