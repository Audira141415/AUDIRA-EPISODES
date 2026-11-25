// Bab 5: Lima bulan di laut. The sea chart west of the valley: sailing ship Batavia -> Aden -> Jeddah,
// Suez 1869, steamship 1873, the Kongsi Tiga fleet with Indonesian names, the Jawi lands,
// Syekh Ahmad Khatib (mimbar and kitab only), 1952 first flight, end of sea pilgrimage.
import React from "react";
import { CH, ramp, W, window01 } from "../tl.ts";
import type { ChapterDef } from "../types.ts";
import { FLEET_NAMES, SX, geo } from "../sets.tsx";
import { FlowLine, Label3D } from "../parts.tsx";
import { H, K } from "./common.tsx";

const C = "c06_nusantara";

const World: React.FC<{ t: number }> = ({ t }) => {
  const o = (a: number, b: number) => window01(t, a, b, 0.4, 0.6);
  const names = ["Soekaboemi", "Medan", "Krakatau", "Soemba"];
  return (
    <>
      <Label3D at={geo(106.9, -6.1, 0.1)} title="BATAVIA" sub="Tanjung Priok" o={o(W(C, "layar") - 0.4, W(C, "Aden") + 0.5)} lift={1.1} h={0.75} />
      <Label3D at={geo(45, 12.8, 0.1)} title="ADEN" sub="tak kurang dari 5 bulan" o={o(W(C, "Aden") - 0.2, W(C, "Suez"))} lift={1.1} h={0.75} />
      <Label3D at={geo(32.55, 30, 0.1)} title="TERUSAN SUEZ" sub="dibuka 1869" o={o(W(C, "Suez") - 0.2, W(C, "hari") + 0.5)} lift={1.1} h={0.75} />
      <Label3D at={geo(39.2, 21.5, 0.1)} title="JEDDAH" sub="19–49 hari dengan kapal uap" o={o(W(C, "Jeddah") - 0.2, W(C, "Kongsi"))} lift={1.2} h={0.75} />
      {FLEET_NAMES.map(([n, lo, la], i) => (
        <Label3D key={n} at={geo(lo, la, 0.3)} title={`SS ${n}`} o={o(W(C, names[i]) - 0.2, W(C, "1912") + 0.4)} lift={0.8 + (i % 2) * 0.5} h={0.42} tone="ink" />
      ))}
      <Label3D at={geo(118, 2, 0.1)} title="ORANG JAWI" sub="dari Siam dan Malaka sampai Papua" o={o(W(C, "Jawi") - 0.2, W(C, "menonjol") + 0.4)} lift={1.6} h={0.9} />
      <Label3D at={geo(100.4, -0.3, 0.1)} title="AGAM, SUMATRA BARAT" sub="lahir 1860" o={o(W(C, "1860") - 0.4, W(C, "imam") + 0.6)} lift={0.9} h={0.55} />
      <FlowLine pts={[geo(100.4, -0.3, 0.12), geo(80, 8, 0.6), geo(55, 18, 0.6), geo(41.2, 22.4, 0.12)]} r={0.05} t={t} reveal={ramp(t, W(C, "imam") - 0.4, W(C, "khatib", 1) + 0.8)} o={window01(t, W(C, "imam") - 0.4, W(C, "Murid-muridnya"), 0.3, 0.6)} color="#e8c26a" />
      <Label3D at={geo(41.2, 22.6, 0.6)} title="IMAM & KHATIB" sub="Masjidil Haram" o={o(W(C, "imam") - 0.2, W(C, "Murid-muridnya") + 0.3)} lift={0.9} h={0.5} />
      <Label3D at={geo(110.4, -7.8, 0.1)} title="KH AHMAD DAHLAN" sub="pendiri Muhammadiyah" o={o(W(C, "Dahlan") - 0.3, W(C, "1952") + 0.3)} lift={0.8} h={0.45} />
      <Label3D at={geo(112.2, -7.5, 0.1)} title="KH HASYIM ASY'ARI" sub="pendiri NU" o={o(W(C, "Hasyim") - 0.3, W(C, "1952") + 0.3)} lift={1.6} h={0.45} />
    </>
  );
};

const bat = geo(106.9, -6.1), aden = geo(45, 12.8), suez = geo(32.55, 30), agam = geo(100.4, -0.3), mim = geo(41.2, 22.6);

export const ch06: ChapterDef = {
  id: C,
  card: { num: "BAB 5", title: "Lima Bulan di Laut", tag: "jemaah Nusantara · 1869–1970-an" },
  keys: () => [
    K(CH(C).start + 1.2, [SX - 2, 27, 27], [SX - 2, 0, 0], 40),
    K(W(C, "layar"), [bat[0] + 2.5, 4.8, bat[2] + 5.5], [bat[0] - 0.5, 0, bat[2] - 0.5], 38),
    K(W(C, "Aden") - 0.3, [SX - 3, 5.5, 7.5], [SX - 6.5, 0, 1], 40),
    K(W(C, "bulan"), [aden[0] + 3, 4.8, aden[2] + 5], [aden[0], 0, aden[2]], 38),
    K(W(C, "Suez"), [suez[0] + 4.5, 6.5, suez[2] + 9], [suez[0] + 1, 0, suez[2] + 2], 40),
    K(W(C, "1873"), [SX - 2, 23, 25], [SX - 2, 0, 1], 42),
    K(W(C, "Tapi"), [SX - 4, 21, 24], [SX - 4, 0, 0], 42),
    K(W(C, "Kongsi"), [bat[0] + 4, 3.4, bat[2] + 4.2], [bat[0] + 2.5, 0.2, bat[2] - 1.2], 38),
    K(W(C, "Soemba") + 0.4, [bat[0] + 1.5, 3.6, bat[2] + 4.8], [bat[0] + 3, 0.2, bat[2] - 1], 38),
    K(W(C, "1912"), [SX + 5, 9, 17], [SX + 3, 0, 5], 40),
    K(W(C, "Jawi"), [SX + 11, 18, 21], [SX + 11, 0, 2.5], 42),
    K(W(C, "Syekh"), [agam[0] + 2.2, 3.4, agam[2] + 4.2], [agam[0], 0.2, agam[2]], 38),
    K(W(C, "imam"), [mim[0] + 2.2, 2.0, mim[2] + 3.0], [mim[0], 0.6, mim[2] - 0.3], 36),
    K(W(C, "Kemenag") + 1.2, [mim[0] + 1.6, 1.9, mim[2] + 3.2], [mim[0], 0.6, mim[2] - 0.3], 36),
    K(W(C, "Murid-muridnya"), [bat[0] + 6, 4.2, bat[2] + 5.5], [bat[0] + 4.5, 0.2, bat[2]], 38),
    K(W(C, "1952"), [SX - 4, 21, 23], [SX - 4, 0, 0], 42),
    K(W(C, "akhir"), [SX - 8, 24, 26], [SX - 8, 0, 0], 42),
    K(CH(C).end + 0.5, [56, 18, 22], [40, 0, 0], 44),
  ],
  hub: () => H(1, 1, 0, 1, 0),
  sea: (t) => ({
    route: ramp(t, W(C, "layar") - 0.5, W(C, "bulan") + 0.5),
    ship: ramp(t, W(C, "Sebelum") - 0.4, W(C, "bulan") + 1.0) * 0.83,
    steam: ramp(t, W(C, "1873"), W(C, "hari") + 1.0),
    fleet: window01(t, W(C, "Kongsi") - 0.5, W(C, "1912") + 1.0, 0.5, 0.8),
    jawi: ramp(t, W(C, "Siam") - 0.3, W(C, "Papua") + 0.4),
    khatib: ramp(t, W(C, "imam") - 0.6, W(C, "imam") + 0.6),
    plane: ramp(t, W(C, "pesawat"), W(C, "pesawat") + 7),
    t,
  }),
  World,
  callouts: () => [
    { a: W(C, "Sebelum") - 0.2, b: W(C, "Setelah"), kicker: "SEBELUM KAPAL UAP", title: "Kapal layar dagang", sub: "ke Aden saja tak kurang dari 5 bulan", pos: "tl" },
    { a: W(C, "1873") - 0.3, b: W(C, "Kapal-kapal"), kicker: "KAPAL UAP SEJAK 1873", title: "Batavia → Jeddah: 19–49 hari", sub: "pergi-pulang tetap ± 6 bulan", pos: "tl" },
    { a: W(C, "Kongsi") - 0.2, b: W(C, "berat") + 0.4, kicker: "KONGSI TIGA", title: "Nama daerah kita", sub: "Soekaboemi · Medan · Krakatau · Soemba", pos: "tr" },
    { a: W(C, "1912") - 0.2, b: W(C, "Meski") + 0.4, kicker: "LAPORAN HAJI 1912 · ARSIP NASIONAL", title: "2.634 dari 18.535 jemaah meninggal", pos: "tc", big: true },
    { a: W(C, "Snouck") - 0.2, b: W(C, "Papua") + 0.8, kicker: "SNOUCK HURGRONJE · MAKKAH 1884–1885", title: "Semua disebut “Jawi”", pos: "tl" },
    { a: W(C, "Syekh") - 0.2, b: W(C, "Murid-muridnya"), kicker: "DISEBUT KEMENAG: NON-ARAB PERTAMA DI JABATAN ITU", title: "Syekh Ahmad Khatib Al-Minangkabawi", sub: "imam dan khatib di Masjidil Haram", pos: "tl" },
    { a: W(C, "1952") - 0.2, b: W(C, "lewat") - 0.2, kicker: "1952 · PERTAMA KALI DENGAN PESAWAT", title: "293 terbang · 14.031 berlayar", pos: "tc", big: true },
    { a: W(C, "lewat") - 0.2, b: CH(C).end + 0.8, kicker: "AKHIR 1970-AN", title: "Haji lewat laut berhenti", pos: "tr" },
  ],
};
