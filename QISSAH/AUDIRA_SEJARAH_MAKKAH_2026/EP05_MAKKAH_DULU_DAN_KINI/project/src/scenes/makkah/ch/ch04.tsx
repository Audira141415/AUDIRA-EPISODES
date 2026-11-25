// Bab 3: 1941, tawaf sambil berenang. Ottoman-era sanctuary under rain, water to chest height,
// swimmers only as light ripples, two ripples rest at the door; then cracks, 1969 mud, the raised
// floor and the drainage tunnels (x-ray).
import React, { useMemo } from "react";
import { CH, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef, V3 } from "../types.ts";
import { FlowLine, Label3D, Rain, WaterPlane } from "../parts.tsx";
import { engrave, INK } from "../engraving.ts";
import { DOOR, G, H, K, TawafRipples } from "./common.tsx";

const C = "c04_banjir_1941";
const CHEST = 0.06; // 1,4 m at the Ka'bah's scale (13 m = 0.54 units)
const DOOR_Y = 0.135; // the Ka'bah door sill, about 2 m above the floor

const World: React.FC<{ t: number }> = ({ t }) => {
  const f41 = ramp(t, W(C, "Hujan"), W(C, "leher") + 0.6) * (1 - ramp(t, W(C, "surut") - 0.6, W(C, "surut") + 1.2));
  const f69 = ramp(t, W(C, "1969"), W(C, "Ka'bah", 3) + 0.4) * (1 - ramp(t, W(C, "lumpur") + 0.8, W(C, "masjid", 1) + 1.0));
  const y = Math.max(CHEST * f41, DOOR_Y * f69);
  const mud = window01(t, W(C, "lumpur"), W(C, "ditinggikan") + 0.8, 0.6, 0.8);
  const floor = ramp(t, W(C, "ditinggikan") - 0.8, W(C, "ditinggikan") + 0.8);
  const tunnels = ramp(t, W(C, "terowongan") - 0.3, W(C, "hujan", 1) + 0.6);
  const end = CH(C).end + 0.8;
  const tun = useMemo(() => {
    const out: V3[][] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      out.push([0.9, 2.2, 4, 6.5].map((r, k) => [Math.cos(a) * r, -0.12 - k * 0.12, Math.sin(a) * r] as V3));
    }
    out.push(Array.from({ length: 33 }, (_, i) => [Math.cos((i / 32) * Math.PI * 2) * 1.3, -0.12, Math.sin((i / 32) * Math.PI * 2) * 1.3] as V3));
    return out;
  }, []);
  const cracks = useMemo(
    () => [[-0.5, 1.35, 0.4, 0.3], [0.1, 1.42, 0.55, -0.2], [0.6, 1.3, 0.35, 0.5], [-0.15, 1.6, 0.3, 0.9]] as [number, number, number, number][],
    [],
  );
  const crackK = window01(t, W(C, "retak") - 0.4, W(C, "1969") + 0.5, 0.5, 0.6);
  const o = (a: number, b: number) => window01(t, a, b, 0.4, 0.5);
  return (
    <>
      <Rain t={t} o={window01(t, W(C, "Hujan"), W(C, "Ali") + 1, 0.6, 1.4)} center={[0, 0.2, 0]} spread={6} height={5} n={1100} />
      <Rain t={t} o={window01(t, W(C, "1969"), W(C, "lumpur"), 0.5, 1)} center={[0, 0.2, 0]} spread={6} height={5} n={700} />
      {y > 0.003 ? <WaterPlane y={y} size={[9, 9]} t={t} color={f69 > 0.05 ? "#8b7a58" : "#6f8f84"} opacity={0.8} /> : null}
      {mud > 0.01 ? (
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.36, 1.12, 64]} />
          <meshStandardMaterial color="#7a6342" roughness={0.95} transparent opacity={0.75 * mud} />
        </mesh>
      ) : null}
      <TawafRipples t={t} y={CHEST} o={window01(t, W(C, "Bertawaf") - 0.4, W(C, "surut") - 0.4, 0.6, 1)} stopAtDoor={ramp(t, W(C, "Dua", 1), W(C, "ambang") + 0.6)} />
      <Label3D at={[DOOR[0], DOOR_Y + 0.02, DOOR[2]]} title="AMBANG PINTU KA'BAH" sub="dua anak berlindung, menunggu ditolong" o={o(W(C, "ambang") - 0.3, W(C, "Fotonya") + 0.6)} lift={0.42} h={0.17} />
      <Label3D at={[0.5, CHEST, 0.6]} title="SETINGGI DADA–LEHER" sub="orang dewasa" o={o(W(C, "genangan"), W(C, "Bahrain") + 0.3)} lift={0.32} h={0.15} />
      {cracks.map(([x, z, l, r], i) =>
        crackK > 0.01 ? (
          <mesh key={i} position={[x, 0.02, z]} rotation={[0, r, 0]}>
            <boxGeometry args={[l * crackK, 0.004, 0.012]} />
            <meshStandardMaterial color={INK.iron} />
          </mesh>
        ) : null,
      )}
      <Label3D at={[0.1, 0.02, 1.45]} title="SISI ASY-SYAMIYAH" sub="tanah retak ± 1,5 m" o={o(W(C, "retak") - 0.3, W(C, "kehausan") + 0.5)} lift={0.4} h={0.2} />
      {/* raised courtyard floor */}
      {floor > 0.01 ? (
        <mesh position={[0, (0.035 * floor) / 2, 0]} receiveShadow castShadow material={engrave({ color: "#f4ead2", freq: 24, keep: 0.45, toneGain: 1.6 })}>
          <cylinderGeometry args={[1.12, 1.14, 0.035 * floor + 0.001, 64, 1]} />
        </mesh>
      ) : null}
      {tun.map((p, i) => (
        <FlowLine key={i} pts={p} r={0.03} t={t} reveal={tunnels} o={window01(t, W(C, "terowongan") - 0.3, end, 0.4, 0.8)} color="#e8c26a" xray />
      ))}
      <Label3D at={G(2.2, 0.8, -0.1)} title="TEROWONGAN & DRAINASE" sub="di bawah lantai masjid" o={o(W(C, "terowongan"), W(C, "Kini") + 1.0)} lift={0.6} h={0.24} />
    </>
  );
};

export const ch04: ChapterDef = {
  id: C,
  card: { num: "BAB 3", title: "Tawaf Sambil Berenang", tag: "1941 · 1360 Hijriah" },
  keys: () => [
    K(CH(C).start, [0.5, 4.8, 11.5], [0.3, 0.9, -1], 38),
    K(W(C, "Hujan"), [2.0, 2.2, 6], [0, 0.35, 0], 38),
    K(W(C, "Air"), [0.6, 0.52, 1.8], [0, 0.2, 0], 40),
    K(W(C, "Ali"), [-0.9, 0.55, 1.6], [0, 0.22, 0], 40),
    K(W(C, "Bertawaf"), [-1.8, 0.5, 0.15], [0, 0.2, 0], 40),
    K(W(C, "Polisi"), [-0.8, 0.55, -1.7], [0, 0.2, 0], 40),
    K(W(C, "Dua", 1), [1.05, 0.45, 1.45], [DOOR[0], 0.12, DOOR[2]], 40),
    K(W(C, "Fotonya"), [0.9, 1.3, 3.4], [0, 0.25, 0], 36),
    K(W(C, "surut"), [0.3, 3.4, 6], [0, 0, 0], 38),
    K(W(C, "retak"), [0.6, 1.5, 3.4], [0.1, 0, 1.3], 36),
    K(W(C, "1969"), [1.35, 0.55, 1.4], [DOOR[0], 0.14, DOOR[2]], 40),
    K(W(C, "ditinggikan"), [1.0, 0.62, 1.8], [0, 0.1, 0], 40),
    K(W(C, "terowongan"), [0.6, 3.6, 5], [0, -0.3, 0], 40),
    K(W(C, "Kini"), [0.4, 4.4, 9.5], [0, 0.2, -1], 38),
    K(CH(C).end + 0.6, [-0.8, 4.0, 8.5], [-1.5, 0.4, -1], 38),
  ],
  hub: (t) => {
    const k = ramp(t, CH(C).start - 0.6, CH(C).start + 2.8); // the town grows into its Ottoman form
    return H(k, k, 0, 1, 0);
  },
  World,
  callouts: () => [
    { a: W(C, "Hujan") - 0.2, b: W(C, "hanyut") + 0.6, kicker: "1941 · 1360 H · SEKITAR APRIL", title: "Hujan hampir seminggu", sub: "siang dan malam", pos: "tr" },
    { a: W(C, "Ali") - 0.2, b: W(C, "dibayangkan") + 0.4, kicker: "KESAKSIAN · SAUDI GAZETTE", title: "Ali Al-Awadhi, 12 tahun", sub: "anak Bahrain yang sedang belajar di Makkah", pos: "tl" },
    { a: W(C, "Fotonya") - 0.2, b: W(C, "Setelah") + 0.2, kicker: "FOTO ARSIP 1941", title: "Salah satu dari sedikit foto banjir itu", sub: "di sini direkonstruksi, tanpa sosok", pos: "tl" },
    { a: W(C, "Musfir") - 0.2, b: W(C, "kehausan") + 0.6, kicker: "SEJARAWAN MUSFIR AL-UMAIRI", title: "Retak ± 1,5 m · air keruh", sub: "muncul gelombang kehausan", pos: "tr" },
    { a: W(C, "1969") - 0.2, b: W(C, "masjid", 1) + 0.8, kicker: "1969", title: "Air sampai pintu Ka'bah", sub: "lumpur tebal di lantai masjid", pos: "tr" },
    { a: W(C, "Kini") - 0.2, b: CH(C).end + 0.8, kicker: "KORAN MAKKAH", title: "Banjir di dalam masjid tinggal kenangan", pos: "tc" },
  ],
};
