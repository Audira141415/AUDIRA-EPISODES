// Penutup: compare then and now (ship -> plane on the chart; Zubaidah line -> desalination; flood ->
// tunnels; fortress -> tower), the one thing unchanged (people keep coming: a flow of points), the
// Indonesian quota and queue, the CTA, then the 20 s end screen with the outro.
import React, { useMemo } from "react";
import * as THREE from "three";
import { CH, ramp, TOTAL, VO_END, W, window01 } from "../tl.ts";
import type { ChapterDef, V3 } from "../types.ts";
import { FlowLine } from "../parts.tsx";
import { fx } from "../parts.tsx";
import { SX } from "../sets.tsx";
import { G, H, K } from "./common.tsx";
import { rng } from "../engraving.ts";

const C = "c09_payoff";

/** Pilgrims as points only: streams along the valley roads into the sanctuary, then a tawaf ring. */
export const Crowd: React.FC<{ t: number; o: number; n?: number }> = ({ t, o, n = 1400 }) => {
  const { geoB, seeds, mat } = useMemo(() => {
    const r = rng(221);
    const seeds = Array.from({ length: n }, (_, i) => ({ road: i % 9, ph: r(), sp: 0.04 + r() * 0.05, off: (r() - 0.5) * 0.35, ring: i % 4 === 0, rr: 0.45 + r() * 0.55 }));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const m = new THREE.PointsMaterial({ color: "#4a2a14", size: 0.065, sizeAttenuation: true, transparent: true, depthWrite: false });
    return { geoB: g, seeds, mat: m };
  }, [n]);
  if (o <= 0.001) return null;
  const p = geoB.attributes.position as THREE.BufferAttribute;
  seeds.forEach((s, i) => {
    if (s.ring) {
      const a = -t * 0.3 * (1.2 - s.rr * 0.5) + s.ph * Math.PI * 2;
      p.setXYZ(i, Math.cos(a) * s.rr, 0.03, Math.sin(a) * s.rr);
    } else {
      const a = (s.road / 9) * Math.PI * 2 + 0.3;
      const k = (s.ph + t * s.sp) % 1; // 0 far .. 1 arriving
      const r = 7 - k * 5.8;
      const x = Math.cos(a) * r + Math.sin(a) * s.off, z = Math.sin(a) * r - Math.cos(a) * s.off;
      const gp = G(x, z, 0.04);
      p.setXYZ(i, gp[0], gp[1], gp[2]);
    }
  });
  p.needsUpdate = true;
  mat.opacity = o;
  return <points geometry={geoB} material={mat} ref={fx} frustumCulled={false} />;
};

const World: React.FC<{ t: number }> = ({ t }) => {
  const desal: V3[] = useMemo(() => [G(16, -1.5, 0.15), G(11, -1.2, 0.12), G(7, -0.8, 0.1), G(3.5, -0.4, 0.08), G(1.3, 0, 0.05)], []);
  const tun: V3[][] = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return [1, 2.5, 4.5].map((r, k) => [Math.cos(a) * r, -0.15 - k * 0.1, Math.sin(a) * r] as V3);
  }), []);
  const crowd = ramp(t, W(C, "Orang", 1) - 0.5, W(C, "datang", 2) + 1);
  return (
    <>
      <FlowLine pts={desal} r={0.05} t={t} reveal={ramp(t, W(C, "Air"), W(C, "desalinasi") + 0.4)} o={window01(t, W(C, "Air"), W(C, "Banjir") + 0.6, 0.3, 0.6)} color="#9fd6cc" />
      {tun.map((p, i) => (
        <FlowLine key={i} pts={p} r={0.03} t={t} reveal={ramp(t, W(C, "Banjir"), W(C, "terowongan") + 0.4)} o={window01(t, W(C, "Banjir"), W(C, "benteng") + 0.6, 0.3, 0.6)} color="#e8c26a" xray />
      ))}
      <Crowd t={t} o={crowd * (1 - ramp(t, VO_END + 12, VO_END + 16))} />
    </>
  );
};

export const ch09: ChapterDef = {
  id: C,
  card: { num: "", title: "", tag: "" },
  keys: () => [
    K(CH(C).start + 0.4, [60, 16, 20], [70, 0, 0], 44),
    K(W(C, "berlayar"), [SX + 2, 9, 16], [SX, 0, 3], 42),
    K(W(C, "Kini"), [SX - 4, 20, 22], [SX - 4, 0, 0], 42),
    K(W(C, "kapal") + 0.2, [SX - 6, 19, 21], [SX - 6, 0, 0], 42),
    K(W(C, "Air") + 0.9, [6, 5.5, 9], [3, 0.4, -0.5], 40),
    K(W(C, "Banjir"), [0.8, 3.4, 5], [0, -0.2, 0], 40),
    K(W(C, "benteng"), [0.2, 1.2, 4.8], [0.35, 3.6, -3.1], 42),
    K(W(C, "Yang", 3), [0.5, 4.2, 9.5], [0, 0.4, -0.5], 40),
    K(W(C, "kuota"), [-1.6, 2.4, 5.2], [0, 0.2, 0], 40),
    K(W(C, "daftar"), [2.4, 5.4, 9.5], [0, 0, -0.8], 42),
    K(W(C, "Menurutmu"), [0.6, 4.8, 13], [0.3, 2.2, -2], 40),
    K(W(C, "Sejarah"), [0.3, 5.6, 15.5], [0.3, 2.6, -2], 40),
    K(VO_END + 2, [-1.2, 7.2, 17.5], [0.3, 2.4, -2], 42),
    K(TOTAL - 3, [1.8, 7.6, 17.5], [0.3, 2.4, -2], 42),
    K(TOTAL + 1, [2.2, 7.8, 17.2], [0.3, 2.4, -2], 42),
  ],
  hub: () => H(2, 0, 1, 0.15, 1, 0.5),
  dusk: (t) => 0.4 + 0.5 * ramp(t, VO_END - 2, VO_END + 6),
  sea: (t) => ({
    route: 1,
    ship: 0.25 + 0.3 * ramp(t, CH(C).start, W(C, "laut") + 1),
    steam: 0,
    jawi: 0,
    khatib: 0,
    plane: ramp(t, W(C, "Kini") - 0.5, W(C, "kapal") + 0.8),
    fleet: 0,
    t,
  }),
  World,
  callouts: () => [
    { a: W(C, "Dulu") - 0.2, b: W(C, "Kini") - 0.1, kicker: "DULU", title: "5–6 bulan berlayar", sub: "hampir semua lewat laut", pos: "tl", big: true },
    { a: W(C, "Kini") - 0.1, b: W(C, "Air") + 0.4, kicker: "KINI · DARI SELURUH DUNIA", title: "± 6.000 tiba dengan kapal", pos: "tr", big: true },
    { a: W(C, "Air") + 0.4, b: W(C, "Banjir") - 0.1, kicker: "AIR MINUM", title: "Saluran Zubaidah → desalinasi", pos: "tl" },
    { a: W(C, "Banjir") - 0.1, b: W(C, "benteng") - 0.2, kicker: "BANJIR", title: "Kini dialirkan lewat terowongan", pos: "tl" },
    { a: W(C, "benteng") - 0.2, b: W(C, "Yang", 3) - 0.2, kicker: "BUKIT BULBUL", title: "Benteng → menara jam", pos: "tl" },
    { a: W(C, "kuota") - 0.3, b: W(C, "Sementara") - 0.1, kicker: "KUOTA INDONESIA 2026", title: "221.000 jemaah", pos: "tr", big: true },
    { a: W(C, "Sementara") - 0.1, b: W(C, "Di", 1) - 0.1, kicker: "DAFTAR TUNGGU · SEPTEMBER 2025", title: "± 5,4 juta orang", pos: "tr", big: true },
    { a: W(C, "Di", 1) - 0.1, b: W(C, "Menurutmu") - 0.2, kicker: "DI SEBAGIAN PROVINSI", title: "pernah sampai 47 tahun", pos: "tr", big: true },
    { a: W(C, "Menurutmu") - 0.2, b: W(C, "Kalau") - 0.1, kicker: "TULIS DI KOLOM KOMENTAR", title: "Perubahan Makkah mana yang paling mengejutkan?", pos: "tc" },
    { a: W(C, "Kalau") - 0.1, b: W(C, "Sejarah") - 0.1, kicker: "SUKA SEJARAH SEPERTI INI?", title: "Subscribe & nyalakan lonceng", pos: "tc" },
    { a: W(C, "Sejarah") - 0.1, b: VO_END + 2.5, kicker: "AUDIRA", title: "Sejarah Makkah, bersama Audira", pos: "tc", big: true },
  ],
};
