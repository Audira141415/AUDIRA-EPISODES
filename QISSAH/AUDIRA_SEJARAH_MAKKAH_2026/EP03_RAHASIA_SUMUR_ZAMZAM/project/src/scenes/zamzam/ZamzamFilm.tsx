// SEJARAH MAKKAH EP03 "Rahasia sumur Zamzam" (INNERWORKS): the long-form 16:9 film and its two 9:16
// shorts from one world. The long film runs on vo.wav time; a short maps its own clock onto the
// long-form clock (time.ts srcTime) and is re-framed for 9:16, never cropped.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { at, chapter, prog, smooth, srcTime, window01, SHORTS, TIMELINE, TOTAL, VO_END, type Mode, type Word } from "./time.ts";
import { camAt, nearestSet, portraitFov, projector, SET, type V3 } from "./cam.ts";
import { L, PAL } from "./layout.ts";
import { ZamzamWorld } from "./World.tsx";
import { heroState, T5 } from "./state.ts";
import { Valley, T2, POOL, OUTLINE } from "./ch02.tsx";
import { Buried, T3, nightAt } from "./ch03.tsx";
import { Eras, T4, eraAt } from "./ch04.tsx";
import { Plant, T6, dropAt, MAKKAH_DOT, MADINAH_DOT } from "./ch06.tsx";
import { Lab, T7, BARS, LIMIT_H, CHART_Y } from "./ch07.tsx";
import { Export, T8, onGlobe, PLACES } from "./ch08.tsx";
import { Counter, EndScreen, Layout, Leader, Outro, Panel, ShortCaptions, ShortEndCard, ShortHook, Tag, TitleCard, WideCaptions, CYAN, INK } from "./ui.tsx";

const add = (o: V3, p: V3): V3 => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
const ch = (id: string) => chapter(id);

// ---------------------------------------------------------------- 3D ----
const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const pose = camAt(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(new THREE.Vector3(...pose.tgt));
    cam.fov = portraitFov(pose.wf); // FormatFov turns this into pose.wf in 16:9
    cam.near = 0.3;
    cam.far = 2000;
    cam.updateProjectionMatrix();
  });
  return null;
};

/** Key light that follows the set being filmed, so every set gets shadows. */
const Lights: React.FC<{ t: number }> = ({ t }) => {
  const pose = camAt(t);
  const o = SET[nearestSet(pose.tgt)];
  const night = nightAt(t);
  const light = useMemo(() => new THREE.DirectionalLight("#fff4e6", 2.6), []);
  useLayoutEffect(() => {
    light.position.set(o[0] - 38, 62, o[2] + 70);
    light.target.position.set(o[0], 0, o[2] - 10);
    light.target.updateMatrixWorld();
    light.intensity = 3.1 * (1 - 0.7 * night);
    light.color.set(night > 0.5 ? "#c9d6ff" : "#fff4e6");
    light.castShadow = true;
    light.shadow.mapSize.set(4096, 4096);
    const c = light.shadow.camera;
    c.left = -95; c.right = 95; c.top = 80; c.bottom = -80; c.near = 1; c.far = 300;
    c.updateProjectionMatrix();
    light.shadow.bias = -0.0004;
    light.shadow.normalBias = 0.04;
  });
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <hemisphereLight args={["#ffffff", "#bfa984", 0.55 * (1 - 0.55 * night)]} />
      <directionalLight position={[o[0] + 50, 10, o[2] + 40]} intensity={0.55} color="#dceeff" />
      <pointLight position={[0, -13.8, 1.0]} intensity={14} distance={9} decay={2} color="#8fe4ff" />
      <pointLight position={[0, -24, 1.0]} intensity={10} distance={9} decay={2} color="#7fd6ff" />
      <pointLight position={[1.0, -19.2, 1.2]} intensity={6} distance={5} decay={2} color="#ffe2c8" />
    </>
  );
};

const Fog: React.FC = () => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog(PAL.bg, 240, 560);
    return () => { scene.fog = null; };
  }, [scene]);
  return null;
};

/** Mount a set only around the time the camera uses it. */
const on = (t: number, a: number, b: number) => t > a && t < b;
const Sets: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const heroOn = t < ch("c02_lembah").start + 3 || on(t, T4.dismantle, T6.kudai + 4) || t > ch("c09_penutup").start - 4;
  return (
    <>
      {heroOn ? <ZamzamWorld f={f} st={heroState(t)} /> : null}
      {on(t, ch("c02_lembah").start - 4, ch("c03_hilang").start + 2) ? <group position={SET.V}><Valley t={t} /></group> : null}
      {on(t, ch("c03_hilang").start - 4, ch("c04_timba").start + 2) ? <group position={SET.B}><Buried t={t} /></group> : null}
      {on(t, ch("c04_timba").start - 4, T4.lowered + 3) ? <group position={SET.E}><Eras t={t} /></group> : null}
      {on(t, ch("c06_perjalanan").start - 1, ch("c07_sains").start + 2) ? <group position={SET.P}><Plant t={t} /></group> : null}
      {on(t, ch("c07_sains").start - 4, ch("c08_ekspor").start + 2) ? <group position={SET.L}><Lab t={t} /></group> : null}
      {on(t, ch("c08_ekspor").start - 4, ch("c09_penutup").start + 3) ? <group position={SET.X}><Export t={t} /></group> : null}
      <Drop t={t} />
      <Floor />
    </>
  );
};

/** Studio floor under the diorama sets (not under the hero cutaway, not under the buried-well column). */
const Floor: React.FC = () => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d6ccbb", roughness: 0.92 }), []);
  return (
    <>
      {([[-1100, -610], [-430, -150], [200, 1300]] as [number, number][]).map(([a, b]) => (
        <mesh key={a} position={[(a + b) / 2, -3.6, -100]} rotation={[-Math.PI / 2, 0, 0]} material={mat} receiveShadow>
          <planeGeometry args={[b - a, 700]} />
        </mesh>
      ))}
    </>
  );
};

const Drop: React.FC<{ t: number }> = ({ t }) => {
  const p = dropAt(t);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9ff0ff", emissive: "#39c6f2", emissiveIntensity: 2 }), []);
  if (!p) return null;
  return (
    <group position={p}>
      <mesh material={mat}>
        <sphereGeometry args={[0.55, 24, 18]} />
      </mesh>
      <pointLight intensity={12} distance={7} color="#8fe4ff" />
    </group>
  );
};

const bgAt = (t: number) => {
  const n = nightAt(t);
  return "#" + new THREE.Color(PAL.bg).lerp(new THREE.Color("#2c3544"), n * 0.85).getHexString();
};

// ------------------------------------------------------------ overlays ----
type Item = {
  a: number; b: number;
  kind: "tag" | "chip" | "counter";
  anchor?: V3; // world point for tags (with leader)
  value: string; caption?: string; accent?: string;
  side?: "left" | "right";
  pos?: [number, number]; // chips/counters: fraction of the layout (x, y)
};

const W = (cid: string, ph: string, n = 0) => at(cid, ph, n);
const ITEMS: Item[] = [
  // c00 hook
  { a: W("c00_hook", "ada sebuah sumur"), b: W("c00_hook", "Pernah ditimba") + 1, kind: "tag", anchor: [0, L.wellBottom, 0], value: "± 30 m", caption: "di bawah lantai tawaf", accent: "#39c6f2" },
  { a: W("c00_hook", "dijatah per tahun"), b: W("c00_hook", "Inilah rahasia"), kind: "chip", value: "± 500.000 m³ / tahun", caption: "batas pengambilan (Badan Survei Geologi Saudi)", pos: [0.62, 0.16] },
  { a: W("c00_hook", "menempuh perjalanan"), b: W("c00_hook", "Inilah rahasia"), kind: "tag", anchor: [20, -1.45, -0.8], value: "± 4–5 km", caption: "pipa ke pemurnian Kudai", accent: PAL.steel },
  // c02 valley
  { a: W("c02_lembah", "Menurut hadis riwayat"), b: W("c02_lembah", "Persediaan air"), kind: "chip", value: "HR Bukhari 3364", caption: "riwayat Ibnu Abbas", pos: [0.62, 0.12] },
  { a: T2.outline, b: T2.shafa, kind: "tag", anchor: add(SET.V, OUTLINE), value: "Lokasi Ka'bah kini", caption: "garis rencana", accent: PAL.gold },
  { a: T2.shafa, b: T2.sai + 2, kind: "tag", anchor: add(SET.V, [-38, 9, -16]), value: "SHAFA", accent: PAL.coral },
  { a: T2.marwah, b: T2.sai + 2, kind: "tag", anchor: add(SET.V, [36, 8, -20]), value: "MARWAH", accent: PAL.coral, side: "left" },
  { a: T2.water + 0.5, b: T2.stream, kind: "tag", anchor: add(SET.V, POOL), value: "Mata air", caption: "dibendung, jadi kolam kecil", accent: "#39c6f2" },
  { a: T2.stream + 0.6, b: T2.birds - 0.5, kind: "chip", value: "“Seandainya dibiarkan…”", caption: "akan menjadi mata air yang mengalir di permukaan · HR Bukhari", pos: [0.58, 0.14] },
  { a: T2.tents + 0.5, b: T2.name, kind: "tag", anchor: add(SET.V, [POOL[0] - 10, 2, POOL[2] - 8]), value: "Kabilah Jurhum", caption: "datang, lalu menetap", accent: "#c9a571", side: "left" },
  { a: T2.name + 0.4, b: ch("c02_lembah").end + 0.5, kind: "chip", value: "Nama “Zamzam”", caption: "beberapa penjelasan; asal katanya tidak pasti", pos: [0.6, 0.14] },
  // c03 buried
  { a: W("c03_hilang", "Menurut riwayat Ibnu"), b: T3.bury + 2, kind: "chip", value: "Ibnu Ishaq, Sirah", caption: "terj. Guillaume, 1955", pos: [0.66, 0.12] },
  { a: T3.gazelles + 0.4, b: T3.forgot, kind: "tag", anchor: add(SET.B, [0, -8.6, -1.2]), value: "2 kijang emas", caption: "dikubur di dalam timbunan", accent: PAL.gold },
  { a: T3.later + 0.5, b: T3.nights, kind: "tag", anchor: add(SET.B, [-67, 1, -62]), value: "Hijr", caption: "di samping Ka'bah", accent: PAL.marble, side: "left" },
  { a: W("c03_hilang", "Thibah"), b: W("c03_hilang", "Barrah"), kind: "counter", value: "Malam 1", caption: "“Thibah”", pos: [0.08, 0.2] },
  { a: W("c03_hilang", "Barrah"), b: W("c03_hilang", "Al-Madhnunah"), kind: "counter", value: "Malam 2", caption: "“Barrah”", pos: [0.08, 0.2] },
  { a: W("c03_hilang", "Al-Madhnunah"), b: W("c03_hilang", "Dan pada malam"), kind: "counter", value: "Malam 3", caption: "“Al-Madhnunah”", pos: [0.08, 0.2] },
  { a: W("c03_hilang", "Dan pada malam"), b: T3.clues, kind: "counter", value: "Malam 4", caption: "“Zamzam”", pos: [0.08, 0.2] },
  { a: T3.clues + 0.4, b: T3.dig, kind: "tag", anchor: add(SET.B, [3.4, 0.6, -5]), value: "Sarang semut", accent: "#a37f55" },
  { a: T3.clues + 1.2, b: T3.dig, kind: "tag", anchor: add(SET.B, [-2.4, 0.8, -4.4]), value: "Gagak mematuk", accent: "#2e2622", side: "left" },
  { a: T3.finds + 1, b: T3.arrows, kind: "tag", anchor: add(SET.B, [3, 1.4, -2.5]), value: "Pedang & baju zirah", caption: "ditemukan bersama air", accent: PAL.steel },
  { a: T3.arrows + 0.6, b: T3.door, kind: "tag", anchor: add(SET.B, [-6.5, 2.6, -3]), value: "Undian anak panah", caption: "penyelesaian sengketa", accent: "#7b5534", side: "left" },
  { a: T3.door + 1.5, b: T3.jars, kind: "tag", anchor: add(SET.B, [-2, 3.2, -3.4]), value: "Pintu Ka'bah berlapis emas", caption: "menurut Ibnu Ishaq", accent: PAL.gold },
  { a: W("c03_hilang", "yang disebut siqayah"), b: ch("c03_hilang").end + 0.5, kind: "chip", value: "SIQAYAH · memberi minum jemaah", caption: "Abdul Muthalib → Abu Thalib → al-Abbas (catatan Al-Azraqi)", pos: [0.52, 0.14] },
  // c04 eras
  { a: T4.azraqi + 1, b: T4.mansur, kind: "tag", anchor: add(SET.E, [5.5, 0.8, -1.5]), value: "Dua kolam", caption: "minum & wudu", accent: "#39c6f2" },
  { a: T4.pump + 1.2, b: T4.dismantle, kind: "tag", anchor: add(SET.E, [7.5, 3.0, -5]), value: "2 tangki × 12 keran", caption: "1953, pompa pertama", accent: PAL.steel },
  { a: T4.visitors - 0.6, b: T4.room2, kind: "tag", anchor: [-3.2, -2.0, -1.2], value: "± 2,5 m di bawah lantai tawaf", caption: "jemaah turun tangga untuk minum", accent: PAL.concreteCut },
  { a: T4.room2 + 0.5, b: T4.seal, kind: "tag", anchor: [4.4, -1.6, -2.4], value: "Ruang kedua", caption: "1973", accent: "#ffe3a3" },
  { a: T4.seal + 1, b: T4.glass, kind: "tag", anchor: [-4.6, -0.9, -1.6], value: "Pintu masuk ditutup", caption: "2003", accent: PAL.seal },
  { a: T4.area, b: T4.glass, kind: "counter", value: "+ ± 320 m²", caption: "pelataran tawaf bertambah", pos: [0.62, 0.14] },
  { a: T4.glass + 1, b: T4.museum, kind: "tag", anchor: [2.9, -1.6, -1.6], value: "Ruang berdinding kaca", caption: "tak ada pengunjung yang boleh masuk", accent: "#8fd8ff" },
  { a: T4.museum + 1, b: ch("c04_timba").end + 0.5, kind: "tag", anchor: [-26, 4.0, -12], value: "Bibir sumur lama", caption: "Museum Arsitektur Dua Masjid Suci, Makkah", accent: "#b88a4a" },
  // c05 anatomy (depth labels are the ruler below)
  { a: T5.hand - 0.5, b: T5.koshak, kind: "chip", value: "Badan Survei Geologi Saudi", caption: "kedalaman & lapisan sumur", pos: [0.64, 0.12] },
  { a: T5.opening + 0.6, b: T5.source, kind: "tag", anchor: [-0.35, -13.8, -1.2], value: "Bukaan utama ± 45 × 30 cm", caption: "ke arah Hajar Aswad · catatan Yahya Koshak", accent: "#39c6f2" },
  { a: T5.recharge, b: T5.quota, kind: "chip", value: "Akuifer Wadi Ibrahim", caption: "diisi ulang hujan & aliran dari bukit sekitar", pos: [0.6, 0.12] },
  { a: T5.pump + 0.5, b: T5.sensor, kind: "tag", anchor: [0.3, -19.5, -0.6], value: "± 11–18,5 L/detik", caption: "menurut laporan yang dikutip media Saudi", accent: PAL.coral },
  { a: T5.tunnel + 1, b: T5.found, kind: "tag", anchor: [-11, -7.2, 0], value: "Terowongan drainase", caption: "awal 1980-an · muka air Zamzam turun", accent: "#e2483d", side: "left" },
  { a: T5.found + 0.8, b: ch("c05_anatomi").end + 0.5, kind: "tag", anchor: [-46, -5.6, -0.3], value: "Fondasi di atas muka air tanah", caption: "aturan di Wadi Ibrahim", accent: "#39c6f2" },
  // c06 journey
  { a: T6.push + 0.5, b: T6.kudai, kind: "tag", anchor: [70, -1.45, -0.8], value: "Pipa baja tahan karat", caption: "± 4–5 km ke selatan", accent: PAL.steel },
  { a: T6.kudai + 0.5, b: T6.raw, kind: "chip", value: "Proyek Raja Abdullah · Kudai", caption: "diluncurkan sekitar 2010", pos: [0.6, 0.12] },
  { a: T6.raw + 0.6, b: T6.sand, kind: "tag", anchor: add(SET.P, [-62, 8, -14]), value: "Tangki air baku", caption: "5.000 m³", accent: PAL.concrete },
  { a: T6.sand + 0.3, b: T6.cart, kind: "tag", anchor: add(SET.P, [-37, 6.5, -10]), value: "Saringan pasir", accent: "#d9c49b" },
  { a: T6.cart + 0.3, b: T6.uv, kind: "tag", anchor: add(SET.P, [-13, 3.4, -8]), value: "Saringan kartrid", accent: "#e9e9e4" },
  { a: T6.uv + 0.4, b: T6.scada, kind: "tag", anchor: add(SET.P, [4, 3.6, -6]), value: "Sinar ultraviolet", caption: "sterilisasi", accent: "#6f8dff" },
  { a: T6.scada + 0.4, b: T6.tanks, kind: "tag", anchor: add(SET.P, [20, 5.4, -14]), value: "Kendali terpusat", caption: "dari pompa sumur sampai pengisian", accent: "#3fd0ff" },
  { a: T6.tanks + 0.6, b: T6.back + 1, kind: "tag", anchor: add(SET.P, [48, 12.6, -14]), value: "2 tangki × 10.000 m³", caption: "air sudah dimurnikan", accent: "#f2f1ec" },
  { a: T6.back + 1, b: T6.madinah, kind: "chip", value: "Kembali ke Masjidil Haram", caption: "lewat pipa yang sama arah", pos: [0.62, 0.12] },
  { a: T6.madinah + 0.4, b: T6.pack, kind: "tag", anchor: add(SET.P, MAKKAH_DOT), value: "MAKKAH", accent: PAL.coral },
  { a: T6.madinah + 0.8, b: T6.pack, kind: "tag", anchor: add(SET.P, MADINAH_DOT), value: "MADINAH", accent: PAL.coral, side: "left" },
  { a: T6.truck + 0.5, b: T6.termos, kind: "counter", value: "± 150.000 L / hari", caption: "hingga ± 400.000 L / hari di musim haji", pos: [0.58, 0.12] },
  { a: T6.termos + 0.5, b: T6.pack, kind: "chip", value: "Disinari UV sekali lagi", caption: "lalu masuk termos di Masjid Nabawi", pos: [0.6, 0.12] },
  { a: T6.pack + 0.6, b: T6.tests, kind: "tag", anchor: add(SET.P, [62, 3, -1]), value: "Kemasan 5 liter", accent: "#dff3ff" },
  { a: T6.tests + 0.5, b: ch("c06_perjalanan").end + 0.6, kind: "counter", value: "± 70 uji / hari", caption: "keamanan & mutu · musim haji 1447 H", pos: [0.6, 0.12] },
  // c07 lab
  { a: T7.ottoman + 2.5, b: T7.bbc, kind: "chip", value: "“Hampir seasin air laut”", caption: "alasan tim Ottoman meragukan sampel 1883", pos: [0.56, 0.12] },
  { a: T7.s2012 + 0.6, b: T7.basa, kind: "chip", value: "Studi 2012 (Shomar)", caption: "sebagian besar sampel dari jemaah & toko di Jerman", pos: [0.08, 0.6] },
  { a: T7.s2021 + 0.6, b: T7.basa, kind: "chip", value: "Studi 2021 (Donia & Mortada)", caption: "sampel dari keran di Makkah", pos: [0.6, 0.6] },
  ...BARS.map((b): Item => ({ a: T7[b.at] + 2.2, b: T7.basa, kind: "tag", anchor: add(SET.L, [b.x, CHART_Y + Math.max(0.2, b.ratio * LIMIT_H) + 0.2, -5.2]), value: b.label, accent: b.color, side: b.side })),
  { a: T7.journal + 1.2, b: T7.basa, kind: "tag", anchor: add(SET.L, [-3.6, CHART_Y + LIMIT_H, -5.2]), value: "Batas WHO", accent: INK },
  { a: T7.basa + 0.6, b: T7.animal, kind: "tag", anchor: add(SET.L, [14.5, 2.9, 2.6]), value: "pH ± 7,6–8", caption: "sedikit basa", accent: "#5cc46a" },
  { a: T7.animal + 0.5, b: T7.hadith, kind: "tag", anchor: add(SET.L, [-15, 2.8, 2.4]), value: "Uji hewan & sel", caption: "belum ada uji klinis besar pada manusia", accent: "#f2d6a0" },
  { a: W("c07_sains", "Dalam riwayat Muslim"), b: ch("c07_sains").end + 0.6, kind: "chip", value: "“Diberkahi, dan makanan yang mengenyangkan”", caption: "HR Muslim 2473", pos: [0.08, 0.12] },
  // c08 export
  { a: T8.ban + 0.5, b: T8.label, kind: "chip", value: "Ekspor komersial dilarang", caption: "Saudipedia · Kementerian Media Saudi", pos: [0.6, 0.12] },
  ...PLACES.map((pl): Item => ({ a: T8.ban + 2.2, b: T8.indo - 0.5, kind: "tag", anchor: add(SET.X, onGlobe(pl.lat, pl.lon, 0.3)), value: pl.name, accent: INK, side: pl.lon < 30 ? "left" : "right" })),
  { a: T8.travel + 0.6, b: T8.label + 1, kind: "tag", anchor: add(SET.X, [-15, 3, -1]), value: "Kemasan perjalanan", caption: "yang boleh dibawa jemaah", accent: "#e7f6ff", side: "left" },
  { a: T8.malaysia + 0.4, b: T8.indo - 0.5, kind: "chip", value: "Malaysia, 2022", caption: "tak ada perusahaan berizin impor Zamzam", pos: [0.6, 0.24] },
  { a: T8.indo + 0.5, b: T8.ration, kind: "chip", value: "Jemaah Indonesia", caption: "Zamzam dilarang masuk koper bagasi · Kemenag", pos: [0.6, 0.12] },
  { a: T8.ration + 0.8, b: T8.free, kind: "tag", anchor: add(SET.X, [62, 4.6, -2]), value: "Jatah 5 liter", caption: "dibagikan di asrama haji", accent: "#0b3d2e" },
  { a: T8.hajj, b: ch("c08_ekspor").end + 0.6, kind: "counter", value: "± 1,6 juta liter / hari", caption: "Masjidil Haram, musim haji 1447 H · SPA", pos: [0.08, 0.12] },
  { a: T8.cups, b: ch("c08_ekspor").end + 0.6, kind: "counter", value: "> 2 juta gelas / hari", caption: "rata-rata, musim haji 1447 H", pos: [0.08, 0.36] },
  // c09
  { a: W("c09_penutup", "Airnya masuk"), b: W("c09_penutup", "Sumur kecil"), kind: "tag", anchor: [-3, -13.75, 0], value: "0,5 m", caption: "jalan masuk air utama", accent: "#39c6f2", side: "left" },
];

/** Depth ruler on the cut face (cover look, larger labels), shown when the hero is framed. */
const RULER_WINDOWS: [number, number][] = [
  [ch("c01_intro").start + 0.8, at("c01_intro", "tiba di tangan")],
  [T5.hand, T5.weathered - 0.2],
];
const TICKS = [
  { y: 0, value: "0 m", caption: "lantai tawaf (mataf)", accent: "#9aa3a6" },
  { y: -2.5, value: "± 2,5 m", caption: "ruang bawah tanah lama", accent: PAL.concreteCut },
  { y: L.alluviumBottom, value: "13,5 m", caption: "pasir & kerikil (aluvium)", accent: PAL.sandDark },
  { y: L.weatheredBottom, value: "0,5 m batuan lapuk", caption: "jalan masuk air utama", accent: "#39c6f2" },
  { y: L.wellBottom, value: "± 30 m", caption: "dasar sumur, batuan diorit", accent: "#626d69" },
];
// reveal order in c05 (per word), else all at once
const TICK_AT = [T5.hand, T5.hand + 1.2, T5.alluvium, T5.weathered, T5.diorite];

const TITLES: { id: string; num: string; title: string; era: string }[] = [
  { id: "c02_lembah", num: "BAB 1", title: "Air di lembah tanpa air", era: "Menurut tradisi, ± 4.000 tahun lalu" },
  { id: "c03_hilang", num: "BAB 2", title: "Sumur yang hilang dan digali kembali", era: "Sebelum Islam" },
  { id: "c04_timba", num: "BAB 3", title: "Dari timba ke ruang bawah tanah", era: "Abad ke-8 sampai 2003" },
  { id: "c05_anatomi", num: "BAB 4", title: "Anatomi sumur tiga puluh meter", era: "Hari ini" },
  { id: "c06_perjalanan", num: "BAB 5", title: "Perjalanan setetes Zamzam", era: "Sejak sekitar 2010" },
  { id: "c07_sains", num: "BAB 6", title: "Diuji, dituduh, dibela", era: "1883 – 2021" },
  { id: "c08_ekspor", num: "BAB 7", title: "Tidak dijual ke luar negeri, diminum jutaan orang", era: "Musim haji 1447 H" },
];

const LONG_WORDS: Word[] = TIMELINE.clips.flatMap((c) => c.words);

const Overlay: React.FC<{ t: number; ts: number; mode: Mode; seg: string }> = ({ t, ts, mode, seg }) => {
  const fmt = useFormat();
  const Wd = fmt.layout.width, Ht = fmt.layout.height;
  const wide = fmt.isWide;
  const P = projector(camAt(t), Wd, Ht);
  const safe = fmt.safe;
  const capBand = wide ? 120 + 130 : 380 + 230; // keep tags above the captions
  const tagSize = wide ? 1 : 1.15;
  const tagNodes: React.ReactNode[] = [];
  const fixed: React.ReactNode[] = [];
  const inStory = mode === "long" || seg === "reuse";

  let chipK = 0;
  if (inStory) {
    ITEMS.forEach((it, i) => {
      const vis = window01(t, it.a, it.b, 0.5);
      if (vis <= 0.01) return;
      if (it.kind === "tag" && it.anchor) {
        const p = P(it.anchor);
        if (!p.front || p.x < -50 || p.x > Wd + 50 || p.y < -50 || p.y > Ht + 50) return;
        const right = it.side ? it.side === "right" : p.x < Wd * 0.62;
        const dx = (wide ? 70 : 60) * (right ? 1 : -1);
        let ty = p.y - (wide ? 70 : 90);
        ty = Math.max(safe.top + 40, Math.min(Ht - capBand, ty));
        let tx = p.x + dx;
        tx = right ? Math.min(tx, Wd - safe.right - 380 * tagSize) : Math.max(tx, safe.left + 380 * tagSize);
        tx = Math.max(safe.left, Math.min(Wd - safe.right, tx));
        tagNodes.push(<Leader key={`l${i}`} x1={tx} y1={ty} x2={p.x} y2={p.y} vis={vis} />);
        tagNodes.push(<Tag key={`t${i}`} x={right ? tx : Wd - tx} y={ty} value={it.value} caption={it.caption} accent={it.accent} align={right ? "left" : "right"} vis={vis} size={tagSize} />);
      } else if (it.pos) {
        const [fx, fy] = it.pos;
        const x = wide ? Math.max(safe.left, fx * Wd) : safe.left + 10;
        const y = wide ? Math.max(safe.top + 10, fy * Ht) : safe.top + 250 + 200 * chipK++;
        if (it.kind === "counter") fixed.push(<Counter key={`c${i}`} vis={vis} x={x} y={y} value={it.value} label={it.caption ?? ""} />);
        else
          fixed.push(
            <div key={`h${i}`} style={{ position: "absolute", left: x, top: y, maxWidth: wide ? 700 : 900, opacity: vis, transform: `translateY(${(1 - vis) * 14}px)`, fontFamily: FONT, background: "rgba(16,26,30,0.82)", color: "#eef6f8", borderRadius: 16, padding: "14px 22px 16px", boxShadow: "0 8px 26px rgba(0,0,0,0.25)" }}>
              <div style={{ fontWeight: 600, fontSize: wide ? 32 : 40, color: "#8fe4ff" }}>{it.value}</div>
              {it.caption ? <div style={{ marginTop: 4, fontWeight: 500, fontSize: wide ? 23 : 29, lineHeight: 1.25 }}>{it.caption}</div> : null}
            </div>,
          );
      }
    });

    // depth ruler
    const rv = Math.max(...RULER_WINDOWS.map(([a, b]) => window01(t, a, b, 0.7)));
    if (rv > 0.01) {
      const rx = wide ? -6.5 : -4.2;
      const top = P([rx, 0, 0.05]), bot = P([rx, L.wellBottom, 0.05]);
      fixed.push(<div key="ruler" style={{ position: "absolute", left: top.x - 2, top: top.y, width: 4, height: Math.max(0, (bot.y - top.y) * rv), background: "rgba(255,255,255,0.92)", boxShadow: "0 0 6px rgba(0,0,0,0.3)" }} />);
      const inC05 = t > T5.start && t < T5.koshak;
      TICKS.forEach((k, i) => {
        const v = rv * (inC05 ? smooth(prog(t, TICK_AT[i], TICK_AT[i] + 0.6)) : 1);
        if (v <= 0.01) return;
        const p = P([rx, k.y, 0.05]);
        if (p.x < safe.left + 30 || p.x > Wd - safe.right - 30) return;
        const dy = i === 0 ? -30 : i === 1 ? 34 : i === 2 ? -36 : i === 3 ? 40 : 0;
        fixed.push(<div key={`tk${i}`} style={{ position: "absolute", left: p.x - 14, top: p.y - 2, width: 28, height: 4, background: "#fff", opacity: v }} />);
        fixed.push(<Tag key={`tg${i}`} x={wide ? Wd - (p.x - 26) : p.x + 26} y={p.y + dy} value={k.value} caption={k.caption} accent={k.accent} align={wide ? "right" : "left"} vis={v} size={wide ? 1.1 : 1.05} />);
      });
    }

    // sensor HUD (c05)
    const hud = window01(t, T5.sensor - 0.2, T5.tunnel, 0.6);
    if (hud > 0.01) {
      const st = heroState(t);
      const lvl = (st.water - (L.waterLevel - 3)) / 4;
      const warn = st.pumpOn < 0.5;
      fixed.push(
        <Panel key="hud" vis={hud} x={safe.right + 10} y={wide ? safe.top + 20 : safe.top + 240} title="DATA LOGGER · REAL-TIME" width={wide ? 470 : 560}
          rows={[
            { k: "Muka air", v: warn ? "di bawah ambang" : "normal", bar: lvl, warn },
            { k: "Keasaman (pH)", v: "dipantau", bar: 0.62 + 0.03 * Math.sin(t * 1.7) },
            { k: "Suhu", v: "dipantau", bar: 0.48 + 0.03 * Math.sin(t * 1.3 + 1) },
            { k: "Daya hantar listrik", v: "dipantau", bar: 0.55 + 0.03 * Math.sin(t * 1.1 + 2) },
            { k: "Pompa", v: warn ? "BERHENTI" : "jalan", warn },
          ]}
          note="Badan Survei Geologi Saudi"
        />,
      );
    }
    const quota = window01(t, T5.quota, T5.sensor, 0.6);
    if (quota > 0.01) fixed.push(<Counter key="quota" vis={quota} x={wide ? safe.left + 10 : safe.left + 10} y={wide ? safe.top + 30 : safe.top + 260} value="± 500.000 m³" label="batas pengambilan per tahun · bisa dinaikkan bila hujan cukup" />);

    // era chip (c04)
    const era = eraAt(t);
    if (era && t > T4.start + 3.4) {
      fixed.push(
        <div key="era" style={{ position: "absolute", right: safe.right + 6, top: safe.top + (wide ? 14 : 30), fontFamily: FONT, fontWeight: 600, fontSize: wide ? 30 : 36, color: INK, background: "rgba(255,255,255,0.9)", padding: "12px 20px", borderRadius: 12, boxShadow: "0 6px 18px rgba(30,25,15,0.18)" }}>
          <span style={{ color: CYAN }}>● </span>{era}
        </div>,
      );
    }
  }

  // hook payoff / closing payoff: the cover title over the cutaway
  const titleVis = mode === "long" ? Math.max(window01(t, at("c00_hook", "Inilah rahasia"), ch("c01_intro").start + 1.5, 0.6), window01(t, at("c09_penutup", "Sumur kecil"), at("c09_penutup", "Menurutmu") + 0.5, 0.6)) : 0;

  return (
    <>
      {tagNodes}
      {fixed}
      {titleVis > 0.01 ? (
        <div style={{ position: "absolute", left: safe.left, top: safe.top + 20, opacity: titleVis, fontFamily: FONT }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontWeight: 600, fontSize: 26, letterSpacing: 5, color: INK, background: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 8 }}>
            <span style={{ width: 10, height: 10, background: PAL.coral, borderRadius: 2 }} />
            SEJARAH MAKKAH · EP03
          </div>
          <div style={{ marginTop: 14, fontWeight: 600, fontSize: 104, lineHeight: 0.98, letterSpacing: -2, color: INK }}>
            <div>SUMUR DI BAWAH</div>
            <div style={{ color: CYAN }}>KAKIMU</div>
          </div>
        </div>
      ) : null}
      {mode === "long" ? TITLES.map((c) => <TitleCard key={c.id} t={t} at={ch(c.id).start} num={c.num} title={c.title} era={c.era} />) : null}
      {mode === "long" ? <WideCaptions t={t} words={LONG_WORDS} /> : <ShortCaptions t={ts} words={SHORTS[mode].words} />}
      {mode === "long" ? <EndScreen t={t} voEnd={VO_END} total={TOTAL} /> : null}
      {mode !== "long" ? <ShortHook t={ts} title={SHORTS[mode].title} /> : null}
      {mode !== "long" ? <ShortTail ts={ts} mode={mode} /> : null}
    </>
  );
};

const ShortTail: React.FC<{ ts: number; mode: "short01" | "short02" }> = ({ ts, mode }) => {
  const sd = SHORTS[mode];
  const outroSeg = sd.segments[sd.segments.length - 1];
  const card = smooth(prog(ts, outroSeg.start - 0.2, outroSeg.start + 0.5)) * (1 - smooth(prog(ts, sd.duration - 2.6, sd.duration - 2.1)));
  const outro = smooth(prog(ts, sd.duration - 2.6, sd.duration - 2.0));
  return (
    <>
      <ShortEndCard vis={card} />
      <Outro vis={outro} />
    </>
  );
};

// -------------------------------------------------------------- film ----
export const ZamzamFilm: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ts = frame / fps;
  const { t, seg } = srcTime(mode, ts);
  const f = t * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.bg }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 40, near: 0.3, far: 2000, position: [52, 42, 70] }}>
        <Rig t={t} />
        <Lights t={t} />
        <Fog />
        <Sets t={t} f={f} />
        <Finish frame={frame} hdri="studio" background={bgAt(t)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} />
      </ThreeCanvas>
      <Layout>
        <Overlay t={t} ts={ts} mode={mode} seg={seg} />
      </Layout>
      <AudiraSignature seed="sejarah-makkah-ep03" handle="@audira" />
    </AbsoluteFill>
  );
};

export const ZAMZAM_LONG_SECONDS = TOTAL;
export const zamzamShortSeconds = (m: "short01" | "short02") => SHORTS[m].duration;
