// Bab 2: Banjir yang menyeret Maqam Ibrahim (masa Umar, sekitar 17 H). The early town floods
// through Bab Bani Syaibah, the Maqam (an object in its case) is carried south, measured ropes
// bring it home, and a dam rises upstream. The Ka'bah stays whole; 1630 is a card only.
import React, { useMemo } from "react";
import { CH, lerp, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef, V3 } from "../types.ts";
import { HIJR, Maqam, MAQAM_HOME, RUKUN, SITE, ZAMZAM, hubHeight } from "../hub.tsx";
import { FlowLine, Label3D, Rope, WaterPlane } from "../parts.tsx";
import { EBox } from "../MakkahWorld.tsx";
import { INK } from "../engraving.ts";
import { G, H, K } from "./common.tsx";

const C = "c03_banjir_klasik";
const DAM_Z = 4.3;

const maqamAt = (t: number): { p: V3; tilt: number } => {
  const go = ramp(t, W(C, "mengangkat"), W(C, "bawah") + 0.3);
  const back = ramp(t, W(C, "dikembalikan") - 0.4, W(C, "tempatnya", 1) + 0.6);
  const k = go * (1 - back);
  const [mx, , mz] = SITE.misfalah;
  // drift south along the wadi, a little side to side in the current
  const x = lerp(MAQAM_HOME[0], mx, k) + Math.sin(k * 9) * 0.15 * (1 - back);
  const z = lerp(MAQAM_HOME[2], mz, k);
  return { p: [x, hubHeight(x, z) + 0.005 + (k > 0.02 && k < 0.98 ? 0.06 : 0), z], tilt: Math.sin(k * 12) * 0.4 * k * (1 - back) };
};

const World: React.FC<{ t: number }> = ({ t }) => {
  const inflow = useMemo(() => {
    const pts: V3[] = [];
    for (let i = 0; i <= 16; i++) {
      const k = i / 16;
      const x = lerp(SITE.syarai[0], SITE.babSail[0], k);
      const z = lerp(SITE.syarai[2], SITE.babSail[2], k);
      pts.push(G(x, z, 0.08));
    }
    return pts;
  }, []);
  const lvl = 0.1 * ramp(t, W(C, "banjir", 1), W(C, "Nahsyal") + 0.5) * (1 - ramp(t, W(C, "Lalu"), W(C, "diketahui") + 0.5));
  const m = maqamAt(t);
  const o = (a: number, b: number) => window01(t, a, b, 0.4, 0.5);
  const ropes = W(C, "Rukun");
  const end = CH(C).end + 0.8;
  const dam = ramp(t, W(C, "tanggul") - 0.3, W(C, "Al-A'la") + 0.4);
  return (
    <>
      <FlowLine pts={inflow} r={0.07} t={t * 1.6} reveal={ramp(t, W(C, "banjir", 0), W(C, "Syaibah") + 0.6)} o={window01(t, W(C, "banjir", 0), W(C, "Lalu") + 0.5, 0.4, 1)} color="#9fd6cc" />
      <FlowLine pts={[G(0.3, -0.6, 0.06), G(0.6, -2.2, 0.06), G(0.9, -4.4, 0.06), G(0.9, -6.2, 0.06)]} r={0.06} t={t * 1.6} reveal={ramp(t, W(C, "mengangkat"), W(C, "bawah"))} o={window01(t, W(C, "mengangkat"), W(C, "Lalu") + 0.5, 0.4, 1)} color="#9fd6cc" />
      {lvl > 0.002 ? <WaterPlane y={lvl} size={[7, 16]} at={[0.2, -1]} t={t} color="#6f8f84" opacity={0.78} /> : null}
      <Maqam at={m.p} tilt={m.tilt} />
      <Label3D at={G(SITE.babSail[0], SITE.babSail[2], 0.1)} title="BAB BANI SYAIBAH" sub="dijuluki Bab As-Sail, Pintu Banjir" o={o(W(C, "Syaibah") - 0.3, W(C, "Umar") + 0.4)} lift={0.6} h={0.26} />
      <Label3D at={[m.p[0], m.p[1] + 0.12, m.p[2]]} title="MAQAM IBRAHIM" sub="terangkat banjir" o={o(W(C, "Maqam") - 0.2, W(C, "Lalu"))} lift={0.35} h={0.2} />
      <Label3D at={G(SITE.misfalah[0], SITE.misfalah[2], 0.05)} title="MAKKAH BAGIAN BAWAH" o={o(W(C, "ditemukan") - 0.2, W(C, "Lalu") + 0.4)} lift={0.6} h={0.3} />
      {/* measured ropes of Al-Muththalib: Maqam -> Rukun, -> door of the Hijr, -> Zamzam */}
      <Rope a={[MAQAM_HOME[0], 0.05, MAQAM_HOME[2]]} b={[RUKUN[0], 0.05, RUKUN[2]]} p={ramp(t, ropes - 0.2, ropes + 0.6) * (1 - ramp(t, W(C, "tanggul"), W(C, "tanggul") + 1))} />
      <Rope a={[MAQAM_HOME[0], 0.05, MAQAM_HOME[2]]} b={[HIJR[0], 0.05, HIJR[2]]} p={ramp(t, W(C, "Hijr") - 0.2, W(C, "Hijr") + 0.6) * (1 - ramp(t, W(C, "tanggul"), W(C, "tanggul") + 1))} />
      <Rope a={[MAQAM_HOME[0], 0.05, MAQAM_HOME[2]]} b={[ZAMZAM[0], 0.05, ZAMZAM[2]]} p={ramp(t, W(C, "Zamzam") - 0.2, W(C, "Zamzam") + 0.6) * (1 - ramp(t, W(C, "tanggul"), W(C, "tanggul") + 1))} />
      <mesh position={[ZAMZAM[0], 0.04, ZAMZAM[2]]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.07, 16]} />
        <meshStandardMaterial color="#d8c49a" roughness={0.7} />
      </mesh>
      <Label3D at={[RUKUN[0], 0.3, RUKUN[2]]} title="RUKUN" o={o(ropes, W(C, "ukuran") + 0.3)} lift={0.3} h={0.16} />
      <Label3D at={[HIJR[0], 0.05, HIJR[2]]} title="PINTU HIJR" o={o(W(C, "Hijr") - 0.1, W(C, "ukuran") + 0.3)} lift={0.35} h={0.16} />
      <Label3D at={[ZAMZAM[0], 0.08, ZAMZAM[2]]} title="ZAMZAM" o={o(W(C, "Zamzam") - 0.1, W(C, "ukuran") + 0.3)} lift={0.3} h={0.16} />
      {/* Ar-Radm Al-A'la: the upper dam across the wadi, north of the sanctuary */}
      {dam > 0.01 ? (
        <group position={[0.15, 0, DAM_Z]} scale={[1, dam, 1]}>
          {Array.from({ length: 13 }).map((_, i) => {
            const x = -1.8 + i * 0.3;
            return <EBox key={i} args={[0.31, 0.34, 0.22]} position={[x, hubHeight(x + 0.15, DAM_Z) + 0.17, 0]} mat={{ color: "#d6bf90", freq: 40 }} />;
          })}
        </group>
      ) : null}
      <Label3D at={G(0.15, DAM_Z, 0.3)} title="AR-RADM AL-A'LA" sub="tanggul atas, masa Umar" o={o(W(C, "tanggul"), W(C, "terakhir") + 0.3)} lift={0.6} h={0.3} />
      {/* 1630: only a flood line on a plaque beside the sanctuary, never damage on the Ka'bah */}
      <mesh position={[-1.25, 0.2, 1.25]} rotation={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.36 * window01(t, W(C, "1630") - 0.5, end, 0.5, 0.5) + 0.0001, 0.4, 0.03]} />
        <meshStandardMaterial color="#e6d6b2" roughness={0.8} />
      </mesh>
      <mesh position={[-1.25 + 0.012, 0.16, 1.25 + 0.02]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.34 * window01(t, W(C, "1630") - 0.3, end, 0.5, 0.5) + 0.0001, 0.012, 0.005]} />
        <meshStandardMaterial color={INK.verdigris} emissive={INK.verdigris} emissiveIntensity={0.4} />
      </mesh>
    </>
  );
};

export const ch03: ChapterDef = {
  id: C,
  card: { num: "BAB 2", title: "Banjir yang Menyeret Maqam Ibrahim", tag: "± 17 Hijriah · masa Umar" },
  keys: () => [
    K(CH(C).start, [-2.6, 3.6, 7.5], [-0.5, 0.3, 0.6], 38),
    K(W(C, "Syaibah"), [-1.9, 0.95, 2.9], [-0.95, 0.12, 1.0], 36),
    K(W(C, "Umar") + 0.3, [1.4, 4.6, 9], [0, 0.2, -1], 38),
    K(W(C, "mengangkat"), [0.9, 0.62, 1.7], [MAQAM_HOME[0], 0.08, MAQAM_HOME[2]], 34),
    K(W(C, "ditemukan"), [2.4, 1.7, -3.2], [SITE.misfalah[0], 0.1, SITE.misfalah[2]], 36),
    K(W(C, "Ternyata"), [0.5, 2.3, 1.8], [0, 0, 0], 36),
    K(W(C, "Zamzam") + 0.5, [-0.4, 1.9, 2.1], [-0.2, 0, 0.1], 36),
    K(W(C, "kemudian"), [0.5, 3.0, 0.9], [0.15, 0.15, DAM_Z], 38),
    K(W(C, "tanggul") + 1.0, [0.2, 2.8, 1.3], [0.15, 0.15, DAM_Z], 38),
    K(W(C, "Perluasan"), [1.2, 3.2, 6.5], [0, 0.2, 0], 38),
    K(W(C, "Al-Kurdi"), [0.4, 6.0, 12], [0, 0.5, -1], 40),
    K(W(C, "1630"), [-0.4, 0.75, 2.4], [-1.2, 0.2, 1.2], 36),
    K(CH(C).end + 0.6, [0.2, 3.0, 6.5], [0, 0.2, 0], 38),
  ],
  hub: () => H(0, 0, 0, 1, 0),
  World,
  callouts: () => [
    { a: W(C, "Al-Azraqi") - 0.2, b: W(C, "Syaibah") + 0.6, kicker: "MENURUT CATATAN", title: "Al-Azraqi, Akhbar Makkah", pos: "tl" },
    { a: W(C, "Sail") - 0.2, b: W(C, "wafat") + 0.6, kicker: "± 17 H · MASA KHALIFAH UMAR", title: "Sail Ummu Nahsyal", pos: "tr" },
    { a: W(C, "Al-Muththalib") - 0.2, b: W(C, "Zamzam") + 1.0, kicker: "DIUKUR DENGAN TALI", title: "Al-Muththalib bin Abi Wada'ah", sub: "ke Rukun · ke pintu Hijr · ke Zamzam", pos: "tl" },
    { a: W(C, "Perluasan") - 0.2, b: W(C, "terakhir"), kicker: "MASA UMAR", title: "Perluasan pertama", sub: "terkait kerusakan banjir ini", pos: "tr" },
    { a: W(C, "Al-Kurdi") - 0.2, b: W(C, "Salah") + 0.3, kicker: "CATATAN AL-KURDI", title: "89 banjir besar", sub: "hingga 1965", pos: "tr", big: true },
    { a: W(C, "1630") - 0.3, b: CH(C).end + 0.8, kicker: "± 1630", title: "Sebagian dinding Ka'bah roboh", sub: "kisahnya di EP01 · garis banjir pada maket", pos: "tl" },
  ],
};
