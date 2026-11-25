// Bab 4: Air dari seorang permaisuri (Ain Zubaidah). From the dry valley the camera travels east to
// the channel set: route Hunain / Nu'man -> Arafah -> Muzdalifah -> Mina -> Makkah, cut section,
// gravity slope, inspection shafts, gold coins, centuries of repair, then the 20th-century end.
import { CH, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef } from "../types.ts";
import { ZX, ZubaidahLabels, SECTION } from "../sets.tsx";
import { H, K } from "./common.tsx";
import React from "react";

const C = "c05_zubaidah";
const SZ = SECTION.z + SECTION.depth;

const World: React.FC<{ t: number }> = ({ t }) => {
  const o = (a: number, b = CH(C).end + 0.6) => window01(t, a, b, 0.4, 0.6);
  return (
    <ZubaidahLabels
      o={{
        hunain: o(W(C, "Hunain") - 0.2, W(C, "Biayanya")),
        numan: o(W(C, "Nu'man") - 0.2, W(C, "Biayanya")),
        arafah: o(W(C, "Arafah") - 0.2, W(C, "Biayanya")),
        muzdalifah: o(W(C, "Muzdalifah") - 0.2, W(C, "Biayanya")),
        mina: o(W(C, "Mina") - 0.2, W(C, "Biayanya")),
        makkah: o(W(C, "Makkah") - 0.2, W(C, "Biayanya")),
      }}
    />
  );
};

export const ch05: ChapterDef = {
  id: C,
  card: { num: "BAB 4", title: "Air dari Seorang Permaisuri", tag: "Ain Zubaidah · awal abad ke-9" },
  keys: () => [
    K(CH(C).start, [-1.6, 3.2, 7.5], [-3.5, 0.5, -1], 38),
    K(W(C, "sungai"), [-2.4, 3.6, 7.2], [-3.2, 0.5, -1.2], 38),
    K(W(C, "berdatangan") + 0.4, [-6, 6, 10], [-14, 0.5, -1], 40),
    K(W(C, "seribu") + 0.6, [ZX + 14, 8, 15], [ZX + 4, 0.4, 0], 40),
    K(W(C, "Zubaidah"), [ZX + 15.5, 2.4, 6.5], [ZX + 12.5, 0.3, 0], 38),
    K(W(C, "proyek"), [ZX + 3, 9.5, 15.5], [ZX, 0.5, -0.5], 42),
    K(W(C, "Arafah"), [ZX - 1, 7.5, 13], [ZX - 2, 0.6, -0.5], 42),
    K(W(C, "Makkah"), [ZX + 6, 7.5, 13.5], [ZX + 4, 0.5, 0], 42),
    K(W(C, "Biayanya") + 0.6, [ZX - 2.5, 1.9, 10.5], [ZX - 2.5, 0.7, SZ], 38),
    K(W(C, "dinar"), [ZX + 0.5, 1.7, 9.5], [ZX + 0.5, 0.6, SZ], 38),
    K(W(C, "kemiringan"), [ZX + 5, 1.3, 8.6], [ZX + 2, 0.4, SZ], 38),
    K(W(C, "lubang"), [ZX + 7, 1.4, 7.6], [ZX + 6.5, 0.4, SZ], 36),
    K(W(C, "Sistem"), [ZX + 1, 6, 15], [ZX, 0.5, 1], 42),
    K(W(C, "Kapasitasnya"), [ZX - 6, 3.2, 11], [ZX - 4, 0.4, SZ], 40),
    K(W(C, "berhenti"), [ZX + 10, 4.2, 12], [ZX + 12, 0.3, 1.5], 40),
    K(W(C, "laut"), [ZX + 40, 16, 22], [ZX + 60, 0.5, 0], 44),
    K(CH(C).end + 1.0, [40, 20, 26], [70, 0, 0], 44),
  ],
  hub: () => H(1, 1, 0, 1, 0),
  zub: (t) => ({
    route: ramp(t, W(C, "saluran"), W(C, "Makkah") + 0.4),
    branch: ramp(t, W(C, "Hunain") - 0.3, W(C, "Nu'man")),
    section: ramp(t, W(C, "Biayanya") - 0.5, W(C, "Biayanya") + 1.5),
    water: ramp(t, W(C, "kemiringan"), W(C, "gravitasi") + 0.4),
    shafts: ramp(t, W(C, "lubang") - 0.4, W(C, "memeriksa") + 0.6),
    coins: window01(t, W(C, "Biayanya"), W(C, "kemiringan") + 0.5, 0.6, 0.8),
    dim: ramp(t, W(C, "berhenti"), W(C, "desalinasi") + 0.5),
    desal: ramp(t, W(C, "desalinasi"), W(C, "laut") + 0.5),
    t,
  }),
  World,
  callouts: () => [
    { a: W(C, "Zubaidah") - 0.2, b: W(C, "proyek"), kicker: "PERMAISURI ABBASIYAH", title: "Zubaidah binti Ja'far", sub: "istri Khalifah Harun Ar-Rasyid", pos: "tl" },
    { a: W(C, "Biayanya") - 0.1, b: W(C, "Diriwayatkan"), kicker: "MENURUT CATATAN SEJARAH", title: "± 1,7 juta mitsqal emas", pos: "tr", big: true },
    { a: W(C, "Diriwayatkan") - 0.1, b: W(C, "kemiringan") - 0.2, kicker: "DIRIWAYATKAN, KEPADA BENDAHARANYA", title: "“Kerjakan, walau setiap ayunan kapak berharga satu dinar.”", pos: "tc" },
    { a: W(C, "kemiringan") - 0.1, b: W(C, "Setiap", 1) - 0.1, kicker: "KEMIRINGAN", title: "± 1 : 3000", sub: "air mengalir hanya dengan gravitasi", pos: "tr" },
    { a: W(C, "Setiap", 1) - 0.1, b: W(C, "Sistem"), kicker: "LUBANG INSPEKSI", title: "tiap ± 50 m", pos: "tr" },
    { a: W(C, "Sistem") - 0.1, b: W(C, "Pembangunan"), kicker: "BEKERJA LEBIH DARI", title: "1.000 tahun", sub: "diperbaiki khalifah, Mamluk, Utsmani", pos: "tl", big: true },
    { a: W(C, "Pembangunan") - 0.1, b: W(C, "Raja"), kicker: "1571", title: "Pembangunan ulang selesai", sub: "masa Sultan Sulaiman", pos: "tl" },
    { a: W(C, "Raja") - 0.1, b: W(C, "Kapasitasnya"), kicker: "± 1928", title: "Renovasi Raja Abdulaziz", pos: "tl" },
    { a: W(C, "Kapasitasnya") - 0.1, b: W(C, "Saluran", 1), kicker: "KAPASITAS TERCATAT", title: "± 40.000 m³ / hari", pos: "tr", big: true },
    { a: W(C, "Saluran", 1) - 0.1, b: CH(C).end + 0.8, kicker: "ABAD KE-20", title: "Digantikan desalinasi air laut", pos: "tr" },
  ],
};
