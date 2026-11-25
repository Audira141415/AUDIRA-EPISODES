// Bab 1: Kota di dasar mangkuk. Topography, peaks, rain, water converging on the sanctuary.
import React, { useMemo } from "react";
import { CH, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef, V3 } from "../types.ts";
import { hubHeight, SITE } from "../hub.tsx";
import { FlowLine, Label3D, Rain, WaterPlane } from "../parts.tsx";
import { G, H, K } from "./common.tsx";

const C = "c02_lembah";

/** Paths of rain water running downhill to the sanctuary (gradient descent on the valley). */
function downhill(x0: number, z0: number): V3[] {
  const pts: V3[] = [];
  let x = x0, z = z0;
  for (let i = 0; i < 260; i++) {
    pts.push([x, hubHeight(x, z) + 0.05, z]);
    if (Math.hypot(x, z) < 0.9) break;
    const e = 0.05;
    let gx = (hubHeight(x + e, z) - hubHeight(x - e, z)) / (2 * e);
    let gz = (hubHeight(x, z + e) - hubHeight(x, z - e)) / (2 * e);
    // a pull toward the low point keeps the path moving across the flat floor
    const d = Math.hypot(x, z);
    gx += (x / d) * 0.25;
    gz += (z / d) * 0.25;
    const m = Math.hypot(gx, gz) || 1;
    x -= (gx / m) * 0.12;
    z -= (gz / m) * 0.12;
  }
  return pts.filter((_, i) => i % 3 === 0);
}

const STARTS: [number, number][] = [[-4.2, 1.2], [-3.6, -1.4], [-5, 4], [3.6, 2.2], [4.2, -0.8], [2.4, 5.5], [-1.6, 7], [0.8, -6.2], [-2.6, -4.6], [3.4, -4.2], [5.2, 3.6], [-5.6, -0.4]];

const World: React.FC<{ t: number }> = ({ t }) => {
  const flows = useMemo(() => STARTS.map(([x, z]) => downhill(x, z)), []);
  const wadi = useMemo(() => Array.from({ length: 24 }, (_, i) => G(0.1 * (9 - i * 0.65) - 0.2, 9 - i * 0.68, 0.06)), []);
  const o = (a: number, b: number) => window01(t, a, b, 0.5, 0.6);
  const end = CH(C).end + 0.8;
  return (
    <>
      <Label3D at={G(0, 0, 0.6)} title="± 277 m dpl" sub="lembah sempit" o={o(W(C, "sempit"), W(C, "Jeddah") + 0.5)} lift={0.5} h={0.34} />
      <Label3D at={G(27, -1, 0.1)} title="LAUT MERAH · JEDDAH" sub="± 70 km ke barat" o={o(W(C, "laut") - 0.2, W(C, "Al-Qur'an") + 0.5)} lift={1.2} h={0.55} />
      <WaterPlane y={0.03} size={[16, 70]} at={[36, -10]} t={t} color="#7d9a8c" opacity={0.85 * window01(t, W(C, "laut") - 1.5, W(C, "Al-Qur'an") + 1.5, 1, 1)} />
      <FlowLine pts={wadi} r={0.05} t={t} reveal={ramp(t, W(C, "Wadi"), W(C, "Haram") + 0.6)} o={window01(t, W(C, "Wadi"), W(C, "Qubais") + 1, 0.3, 1)} />
      <Label3D at={G(-0.6, 5.5, 0.1)} title="WADI IBRAHIM" sub="utara → selatan" o={o(W(C, "Wadi"), W(C, "Qubais"))} lift={0.8} h={0.42} />
      <Label3D at={G(SITE.abuQubais[0], SITE.abuQubais[2], 0.05)} title="ABU QUBAIS" sub="timur Masjidil Haram" o={o(W(C, "Qubais") - 0.3, W(C, "Tsur") + 4)} lift={0.6} h={0.36} />
      <Label3D at={G(SITE.hira[0], SITE.hira[2], 0.1)} title="JABAL AN-NUR" sub="Gua Hira · ± 642 m" o={o(W(C, "An-Nur") - 0.3, W(C, "Hujan") + 1)} lift={1.0} h={0.7} />
      <Label3D at={G(SITE.tsur[0], SITE.tsur[2], 0.1)} title="JABAL TSUR" sub="selatan · ± 750 m" o={o(W(C, "Tsur") - 0.3, W(C, "Hujan") + 1)} lift={1.0} h={0.75} />
      <Rain t={t} o={window01(t, W(C, "Hujan"), W(C, "Studi"), 0.6, 1.2)} center={[0, 0.3, 0]} spread={10} height={8} />
      {flows.map((f, i) => (
        <FlowLine key={i} pts={f} r={0.03} t={t + i * 0.13} reveal={ramp(t, W(C, "hujan", 1) + i * 0.12, W(C, "arah") + 0.4)} o={window01(t, W(C, "hujan", 1), end, 0.4, 1)} color="#9fd6cc" />
      ))}
      <Label3D at={G(0, 0, 0.5)} title="TITIK TERENDAH" sub="semua air menuju Masjidil Haram" o={o(W(C, "terendah") - 0.2, W(C, "Studi"))} lift={0.55} h={0.3} />
      <WaterPlane y={0.02 + 0.16 * ramp(t, W(C, "menggenangi"), W(C, "persegi") + 1)} size={[16, 16]} t={t} opacity={0.6 * window01(t, W(C, "Studi"), end, 1, 1)} />
    </>
  );
};

export const ch02: ChapterDef = {
  id: C,
  card: { num: "BAB 1", title: "Kota di Dasar Mangkuk", tag: "geografi lembah" },
  keys: () => [
    K(CH(C).start, [2.2, 12.5, 10.5], [0, 0, -1], 40),
    K(W(C, "mangkuk"), [0.4, 8.8, 12.5], [0, 0.5, -1.5], 40),
    K(W(C, "sempit"), [1.6, 3.2, 6.8], [0, 0.4, 0], 38),
    K(W(C, "Jeddah") - 0.6, [14, 14, 10], [33, 0, -3], 42),
    K(W(C, "Al-Qur'an"), [0.6, 2.1, 7.4], [0, 0.9, -3], 38),
    K(W(C, "Wadi"), [-1.5, 7.5, 14], [0.4, 0, -3.5], 40),
    K(W(C, "sekelilingnya"), [3.8, 6, 9.5], [0, 0.5, -1], 40),
    K(W(C, "Qubais"), [1.4, 5.6, 4.8], [-3.3, 1.0, 0.5], 40),
    K(W(C, "Jabal") - 0.3, [1.6, 7.2, 2.2], [-6, 2.0, 7], 40),
    K(W(C, "An-Nur") + 0.6, [0.6, 7.6, 3.4], [-9.5, 3.0, 11], 40),
    K(W(C, "Tsur"), [0.8, 5.2, 5.5], [1.5, 3.2, -13], 40),
    K(W(C, "Hujan"), [0.2, 6.2, 10.5], [0, 1.0, -2], 40),
    K(W(C, "terendah"), [1.4, 2.4, 5.2], [0, 0.1, 0], 38),
    K(W(C, "Studi"), [0.3, 10, 11.5], [0, 0, -1], 40),
    K(CH(C).end + 0.6, [-0.4, 11.2, 12.5], [0, 0, -1.2], 40),
  ],
  hub: (t) => {
    const r = 1 - ramp(t, CH(C).start - 0.6, CH(C).start + 2.6); // modern rewinds to the early valley
    return H(2 * r, r, r, 1 - 0.85 * r, r);
  },
  World,
  callouts: () => [
    { a: W(C, "Al-Qur'an") - 0.2, b: W(C, "Wadi") - 0.2, kicker: "QS IBRAHIM 14:37 · TERJEMAHAN KEMENAG", title: "“lembah yang tidak mempunyai tanam-tanaman”", pos: "tc" },
    { a: W(C, "Hujan"), b: W(C, "masalahnya") + 0.8, kicker: "CURAH HUJAN", title: "< 110 mm", sub: "setahun", pos: "tr" },
    { a: W(C, "Studi"), b: CH(C).end + 0.8, kicker: "MODEL HIDROLOGI 2025", title: "7–9,8 km²", sub: "genangan > 2 m · banjir periode 50–200 tahun", pos: "tr" },
  ],
};
