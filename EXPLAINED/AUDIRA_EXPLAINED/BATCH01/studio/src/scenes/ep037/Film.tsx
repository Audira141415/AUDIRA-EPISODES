// EP037 "Mengapa Toilet Bus AKAP Punya Aturan Pemakaian Khusus?" — TOYDIORAMA film.
// Audio Master Clock: every beat below is looked up from timeline.json word times (no guessed seconds).
// Deterministic: everything derives from useCurrentFrame(); drops/trees use fixed seeds or fixed grids.
import React, { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { FONT, fontReady } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { BUS, BusState, FilmBus, StickerMode } from "./FilmBus.tsx";
import { P, PaperTag, V3 } from "./parts.tsx";
import { Sky, World } from "./World.tsx";

const lilita = loadFont("normal", { weights: ["400"], subsets: ["latin"] });
const TITLE_FONT = `'${lilita.fontFamily}', ${FONT}, sans-serif`;

// ---------------- timeline lookups ----------------
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as Record<"HOOK" | "KONTEKS" | "MEKANISME" | "REVEAL" | "PAYOFF" | "OUTRO", [number, number]>;
export const TOTAL = TL.total;
/** start time of the n-th word in clip `id` that starts with `prefix` (case-insensitive) */
const at = (id: string, prefix: string, n = 0): number => {
  const c = CLIPS.find((k) => k.id === id);
  if (!c) throw new Error(`clip ${id}`);
  const hits = c.words.filter((w) => w.w.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!hits[n]) throw new Error(`word ${prefix} in ${id}`);
  return hits[n].s;
};

const B = {
  hl1: at("l02", "Hanya"),
  hl2: at("l02", "hanya", 1),
  kenapa: at("l03", "Kenapa"),
  mana: at("l04", "mana"),
  buangan: at("l04", "buangannya"),
  sempit: at("l05", "sempit"),
  satuM: at("l05", "satu"),
  banting: at("l05", "terbanting"),
  goyang: at("l05", "bergoyang"),
  air: at("l06", "Air"),
  tandon: at("l06", "tandon"),
  nah: at("l07", "Nah"),
  tidak: at("l07", "tidak"),
  tangki: at("l07", "tangki"),
  saluran: at("l08", "Saluran"),
  tembus: at("l08", "tembus"),
  langsung: at("l08", "langsung"),
  jalan: at("l08", "jalan"),
  tersebar: at("l09", "tersebar"),
  tapi: at("l10", "Tapi"),
  saat10: at("l10", "saat"),
  berhenti: at("l10", "berhenti"),
  semuanya: at("l10", "semuanya"),
  satuT: at("l10", "satu"),
  genangan: at("l10", "genangan"),
  bau: at("l10", "bau"),
  kotoran: at("l11", "Kotoran"),
  umumnya: at("l11", "umumnya"),
  biaya: at("l13", "biaya"),
  menguras: at("l13", "menguras"),
  ruang: at("l13", "ruang"),
  bagasi: at("l13", "bagasi"),
  solar: at("l13", "tangki"),
  mesin: at("l13", "mesin"),
  sebagian: at("l14", "Sebagian"),
  bio: at("l14", "bio"),
  tank: at("l14", "tank"),
  bakteri: at("l14", "bakteri"),
  toiletnya: at("l14", "toiletnya"),
  boleh: at("l14", "boleh"),
  bukan: at("l15", "bukan"),
  soal: at("l16", "soal"),
  pipa: at("l16", "pipa"),
  kamu: at("l17", "Kamu"),
};
const OUTRO_START = SEC.OUTRO[1] + 0.2;

// ---------------- helpers ----------------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const pulse = (t: number, t0: number, up = 0.18, hold = 0.35, down = 0.5) =>
  t < t0 ? 0 : t < t0 + up ? (t - t0) / up : t < t0 + up + hold ? 1 : Math.max(0, 1 - (t - t0 - up - hold) / down);
const springIn = (t: number, t0: number) => {
  const p = (t - t0) / 0.5;
  if (p <= 0) return 0;
  if (p >= 1.6) return 1;
  return Math.max(0, 1 - Math.exp(-5 * p) * Math.cos(7 * p));
};
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------------- bus motion (world x) ----------------
const XS = 0; // stop position at the fuel stop
const V = 2.2;
const BRAKE0 = B.saat10;
const BRAKE_D = 1.3;
const GO = B.kamu;
const ACC = 1.8;
const busX = (t: number) => {
  if (t < BRAKE0) return XS - V * (BRAKE0 - t) - (V * BRAKE_D) / 2;
  if (t < BRAKE0 + BRAKE_D) {
    const u = BRAKE0 + BRAKE_D - t;
    return XS - (V * u * u) / (2 * BRAKE_D);
  }
  if (t < GO) return XS;
  return XS + 0.5 * ACC * (t - GO) ** 2;
};
const busSpeed = (t: number) => (busX(t + 0.02) - busX(t - 0.02)) / 0.04;

// ---------------- shots ----------------
type Key = { t: number; p: V3; l: V3; fov: number };
type Shot = { name: string; t0: number; t1: number; space: "bus" | "world"; keys: Key[] };
const sticker = (t0: number, t1: number): Key[] => [
  { t: t0, p: [-1.05, 1.27, 0.33], l: [-2.3, 1.21, 0.18], fov: 30 },
  { t: t1, p: [-1.5, 1.24, 0.22], l: [-2.3, 1.2, 0.18], fov: 29 },
];
const SHOTS: Shot[] = (() => {
  const s1 = B.hl2 - 0.3;
  const s2 = SEC.KONTEKS[0] - 0.2;
  const s3 = SEC.MEKANISME[0] - 0.1;
  const s4 = B.air - 0.1;
  const s5 = B.nah - 0.1;
  const s6 = B.saluran - 0.15;
  const s7 = SEC.REVEAL[0] - 0.05;
  const s8 = B.tapi - 0.1;
  const s9 = B.kotoran - 0.1;
  const s10 = SEC.PAYOFF[0] - 0.05;
  const s11 = B.ruang - 0.2;
  const s12 = B.sebagian - 0.1;
  const s13 = B.toiletnya - 0.3;
  const s14 = SEC.OUTRO[0] - 0.05;
  const s15 = B.kamu - 0.1;
  return [
    { name: "S01 stiker pintu", t0: 0, t1: s1, space: "bus", keys: sticker(0, s1) },
    {
      name: "S02 tarik mundur",
      t0: s1,
      t1: s2,
      space: "bus",
      keys: [
        { t: s1, p: [-1.5, 1.24, 0.22], l: [-2.3, 1.2, 0.18], fov: 29 },
        { t: s1 + 0.55, p: [-1.65, 1.32, 1.5], l: [-2.3, 1.2, 0.2], fov: 30 },
        { t: s1 + 1.3, p: [-0.9, 1.9, 3.5], l: [-2.0, 1.1, 0.1], fov: 31 },
        { t: s2, p: [0.2, 2.5, 5.6], l: [-1.7, 1.0, 0], fov: 32 },
      ],
    },
    {
      name: "S03 crane turun ke kolong",
      t0: s2,
      t1: s3,
      space: "bus",
      keys: [
        { t: s2, p: [-0.7, 2.6, 3.6], l: [-2.4, 1.05, 0.3], fov: 32 },
        { t: B.buangan, p: [-0.9, 1.1, 3.4], l: [-2.5, 0.6, 0.32], fov: 32 },
        { t: s3, p: [-1.0, 0.45, 3.2], l: [-2.5, 0.25, 0.35], fov: 32 },
      ],
    },
    {
      name: "S04 bilik 1 m2",
      t0: s3,
      t1: s4,
      space: "bus",
      keys: [
        { t: s3, p: [-1.3, 3.7, 2.7], l: [-2.7, 0.85, 0.25], fov: 30 },
        { t: s4, p: [-1.6, 3.4, 2.3], l: [-2.72, 0.85, 0.25], fov: 30 },
      ],
    },
    {
      name: "S05 tandon air bilas",
      t0: s4,
      t1: s5,
      space: "bus",
      keys: [
        { t: s4, p: [-1.4, 2.3, 2.5], l: [-2.9, 1.3, 0.3], fov: 30 },
        { t: s5, p: [-1.7, 2.15, 2.15], l: [-2.9, 1.3, 0.3], fov: 30 },
      ],
    },
    {
      name: "S06 tanpa tangki",
      t0: s5,
      t1: s6,
      space: "bus",
      keys: [
        { t: s5, p: [-0.9, 0.7, 3.3], l: [-2.5, 0.42, 0.2], fov: 32 },
        { t: s6, p: [-1.2, 0.62, 2.9], l: [-2.5, 0.4, 0.2], fov: 32 },
      ],
    },
    {
      name: "S07 tembus lantai",
      t0: s6,
      t1: s7,
      space: "bus",
      keys: [
        { t: s6, p: [-1.1, 1.5, 4.0], l: [-2.6, 0.62, 0.3], fov: 32 },
        { t: s7, p: [-1.5, 0.95, 3.3], l: [-2.55, 0.35, 0.35], fov: 32 },
      ],
    },
    {
      name: "S08 jejak tetes saat melaju",
      t0: s7,
      t1: s8,
      space: "bus",
      keys: [
        { t: s7, p: [-8.0, 1.25, 1.05], l: [-2.6, 0.45, 0.25], fov: 32 },
        { t: s8, p: [-9.2, 1.6, 1.35], l: [-2.6, 0.6, 0.25], fov: 32 },
      ],
    },
    {
      name: "S09 berhenti, genangan",
      t0: s8,
      t1: s9,
      space: "world",
      keys: [
        { t: s8, p: [XS - 13.5, 2.1, 2.2], l: [XS - 4.5, 0.9, -1.3], fov: 32 },
        { t: B.berhenti + 0.6, p: [XS - 12.2, 1.9, 2.0], l: [XS - 4.2, 0.85, -1.1], fov: 32 },
        { t: B.semuanya + 0.3, p: [XS - 5.2, 0.95, 2.5], l: [XS - 2.7, 0.3, 0.2], fov: 32 },
        { t: s9, p: [XS - 4.3, 0.7, 1.95], l: [XS - 2.55, 0.15, 0.35], fov: 32 },
      ],
    },
    { name: "S10 stiker: dilarang", t0: s9, t1: s10, space: "bus", keys: [
        { t: s9, p: [-1.0, 1.3, 0.34], l: [-2.3, 1.16, 0.18], fov: 30 },
        { t: s10, p: [-1.3, 1.28, 0.26], l: [-2.3, 1.16, 0.18], fov: 30 },
      ] },
    {
      name: "S11 kenapa tidak pakai tangki",
      t0: s10,
      t1: s11,
      space: "bus",
      keys: [
        { t: s10, p: [-0.9, 0.85, 3.5], l: [-2.5, 0.45, 0.2], fov: 32 },
        { t: s11, p: [-0.7, 0.95, 3.9], l: [-2.3, 0.5, 0.2], fov: 32 },
      ],
    },
    {
      name: "S12 kolong penuh",
      t0: s11,
      t1: s12,
      space: "bus",
      keys: [
        { t: s11, p: [0.75, 0.44, 2.7], l: [0.45, 0.36, 0], fov: 32 },
        { t: B.bagasi + 0.1, p: [0.35, 0.44, 2.6], l: [0.2, 0.36, 0], fov: 32 },
        { t: B.solar + 0.15, p: [-1.05, 0.44, 2.4], l: [-1.25, 0.36, 0], fov: 32 },
        { t: B.mesin + 0.15, p: [-2.6, 0.46, 2.4], l: [-2.95, 0.38, 0], fov: 32 },
        { t: s12, p: [-2.45, 0.5, 2.6], l: [-2.8, 0.4, 0.1], fov: 32 },
      ],
    },
    {
      name: "S13 varian bio tank",
      t0: s12,
      t1: s13,
      space: "bus",
      keys: [
        { t: s12, p: [-1.0, 0.95, 3.5], l: [-2.55, 0.6, 0.2], fov: 32 },
        { t: s13, p: [-0.8, 1.6, 4.3], l: [-2.6, 1.0, 0.2], fov: 32 },
      ],
    },
    { name: "S14 stiker bio tank", t0: s13, t1: s14, space: "bus", keys: sticker(s13, s14) },
    {
      name: "S15 soal pipa (wide)",
      t0: s14,
      t1: s15,
      space: "world",
      keys: [
        { t: s14, p: [XS - 9.0, 3.6, 8.4], l: [XS - 0.9, 0.95, 0], fov: 32 },
        { t: s15, p: [XS - 10.2, 4.1, 9.8], l: [XS - 0.9, 1.0, 0], fov: 32 },
      ],
    },
    {
      name: "S16 bus pergi",
      t0: s15,
      t1: TOTAL + 1,
      space: "world",
      keys: [
        { t: s15, p: [XS - 10.2, 4.1, 9.8], l: [XS - 0.9, 1.0, 0], fov: 32 },
        { t: OUTRO_START + 0.6, p: [XS - 9.4, 3.4, 8.6], l: [XS + 1.6, 0.9, 0], fov: 32 },
      ],
    },
  ];
})();

const camAt = (t: number) => {
  const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
  const k = shot.keys;
  let p = k[0].p;
  let l = k[0].l;
  let fov = k[0].fov;
  if (t >= k[k.length - 1].t) {
    p = k[k.length - 1].p;
    l = k[k.length - 1].l;
    fov = k[k.length - 1].fov;
  } else
    for (let i = 0; i < k.length - 1; i++)
      if (t >= k[i].t && t < k[i + 1].t) {
        const u = smooth((t - k[i].t) / (k[i + 1].t - k[i].t));
        p = lerp3(k[i].p, k[i + 1].p, u);
        l = lerp3(k[i].l, k[i + 1].l, u);
        fov = k[i].fov + (k[i + 1].fov - k[i].fov) * u;
      }
  const bx = busX(t);
  const off = shot.space === "bus" ? bx : 0;
  // gentle handheld-free drift so no frame is ever frozen
  const drift = Math.sin(t * 0.7) * 0.03;
  return {
    shot,
    pos: [p[0] + off, p[1] + drift * 0.5, p[2] + drift] as V3,
    look: [l[0] + off, l[1], l[2]] as V3,
    fov,
  };
};

const CamRig: React.FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.lookAt(...look);
    c.fov = fov;
    c.near = 0.03;
    c.far = 80;
    c.updateProjectionMatrix();
  });
  return null;
};

const KeyLight: React.FC<{ x: number }> = ({ x }) => {
  const ref = React.useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.target.position.set(x - 0.5, 0, 0);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={ref}
      position={[x + 3.5, 7.0, 6.0]}
      intensity={2.6}
      color="#FFE6C4"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0003}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
      shadow-camera-near={0.5}
      shadow-camera-far={25}
    />
  );
};

// ---------------- tags (billboarded paper notes) ----------------
// Tags live on a foreground plane: anchored to a screen position (sx, sy in -1..1) at 60% of the
// distance to the shot's look point, sized as a fraction of frame width, with a string to the 3D target.
// sy range keeps them inside the safe zone (top 180 px) and above the caption strip.
type TagSpec = { text: string; sub?: string; scr: [number, number]; t0: number; t1: number; w: number; target?: V3; space: "bus" | "world"; tilt?: number };
const TB = BUS.tankBox;
const tankC: V3 = [(TB.x0 + TB.x1) / 2, (TB.y0 + TB.y1) / 2, (TB.z0 + TB.z1) / 2];
const TAGS: TagSpec[] = [
  { text: "KENAPA?", sub: "ATURAN KHUSUS", scr: [-0.1, 0.55], t0: B.kenapa, t1: SHOTS[1].t1, w: 0.62, space: "bus", tilt: 0.05 },
  { text: "KE MANA?", sub: "BUANGANNYA", scr: [0.2, 0.5], t0: B.mana, t1: SHOTS[2].t1, w: 0.55, target: BUS.hoseEnd, space: "bus", tilt: -0.04 },
  { text: "± 1 m²", sub: "BILIK SEMPIT", scr: [-0.3, 0.6], t0: B.satuM, t1: SHOTS[3].t1, w: 0.5, space: "bus", tilt: 0.05 },
  { text: "TIDAK TERBANTING", sub: "SUPAYA PENUMPANG", scr: [0.25, -0.18], t0: B.banting, t1: SHOTS[3].t1, w: 0.6, space: "bus", tilt: -0.04 },
  { text: "AIR BILAS", sub: "TANDON KECIL TERPISAH", scr: [0.2, 0.6], t0: B.tandon, t1: SHOTS[4].t1, w: 0.55, target: BUS.flushTank, space: "bus", tilt: 0.04 },
  { text: "TANPA TANGKI", sub: "KEBANYAKAN BUS AKAP", scr: [0.0, 0.58], t0: B.tidak, t1: SHOTS[5].t1, w: 0.62, target: tankC, space: "bus", tilt: -0.03 },
  { text: "KE JALAN", sub: "TEMBUS LANTAI, LANGSUNG", scr: [0.22, 0.55], t0: B.langsung, t1: SHOTS[6].t1, w: 0.55, target: BUS.hoseEnd, space: "bus", tilt: 0.04 },
  { text: "TERSEBAR TIPIS", sub: "SAAT BUS MELAJU", scr: [-0.25, 0.58], t0: B.tersebar, t1: SHOTS[7].t1, w: 0.6, space: "bus", tilt: -0.04 },
  { text: "SATU TITIK", sub: "SAAT BUS BERHENTI", scr: [0.22, 0.62], t0: B.satuT, t1: SHOTS[8].t1, w: 0.55, target: [XS - 2.52, 0.05, 0.4], space: "world", tilt: 0.04 },
  { text: "GENANGAN BAU", sub: "MENINGGALKAN", scr: [-0.22, 0.3], t0: B.genangan, t1: SHOTS[8].t1, w: 0.55, space: "world", tilt: -0.05 },
  { text: "DILARANG", sub: "KOTORAN PADAT · UMUMNYA", scr: [0.25, -0.32], t0: B.umumnya, t1: SHOTS[9].t1, w: 0.5, space: "bus", tilt: -0.1 },
  { text: "PAKAI TANGKI?", sub: "KENAPA TIDAK", scr: [-0.15, 0.6], t0: SEC.PAYOFF[0], t1: SHOTS[10].t1, w: 0.58, target: tankC, space: "bus", tilt: 0.04 },
  { text: "BIAYA", sub: "BUTUH", scr: [-0.45, 0.22], t0: B.biaya, t1: SHOTS[10].t1, w: 0.36, space: "bus", tilt: -0.06 },
  { text: "MENGURAS", sub: "BUTUH WAKTU", scr: [0.42, 0.22], t0: B.menguras, t1: SHOTS[10].t1, w: 0.4, space: "bus", tilt: 0.06 },
  { text: "BAGASI", sub: "KOLONG PENUH", scr: [-0.35, 0.5], t0: B.bagasi, t1: B.solar, w: 0.42, space: "bus", tilt: 0.04 },
  { text: "TANGKI SOLAR", sub: "KOLONG PENUH", scr: [0.0, 0.5], t0: B.solar, t1: B.mesin, w: 0.5, space: "bus", tilt: -0.04 },
  { text: "MESIN", sub: "KOLONG PENUH", scr: [0.3, 0.5], t0: B.mesin, t1: SHOTS[11].t1, w: 0.42, space: "bus", tilt: 0.04 },
  { text: "SEBAGIAN BUS", sub: "VARIAN, BUKAN STANDAR", scr: [-0.05, 0.62], t0: B.sebagian, t1: SHOTS[12].t1, w: 0.62, space: "bus", tilt: -0.05 },
  { text: "BIO TANK", sub: "BAKTERI PENGURAI", scr: [0.3, 0.05], t0: B.bakteri, t1: SHOTS[12].t1, w: 0.5, target: [tankC[0], tankC[1], TB.z1], space: "bus", tilt: 0.05 },
  { text: "BUKAN PELIT", sub: "ATURANNYA", scr: [-0.3, 0.58], t0: B.bukan, t1: B.soal, w: 0.55, space: "world", tilt: -0.05 },
  { text: "SOAL PIPA", sub: "INTINYA", scr: [0.2, 0.55], t0: B.soal, t1: SHOTS[14].t1, w: 0.6, target: [XS + BUS.hoseEnd[0], BUS.hoseEnd[1], BUS.hoseEnd[2]], space: "world", tilt: 0.04 },
  { text: "KAMU PERNAH?", sub: "TOILET BEBAS DIPAKAI", scr: [0.0, 0.55], t0: B.kamu, t1: TOTAL + 1, w: 0.68, space: "world", tilt: -0.04 },
];

const ASPECT = 1080 / 1920;
const Tag: React.FC<{ spec: TagSpec; t: number; cam: { pos: V3; look: V3; fov: number }; camQ: THREE.Quaternion; bx: number }> = ({ spec, t, cam, camQ, bx }) => {
  const k = springIn(t, spec.t0);
  const off = spec.space === "bus" ? bx : 0;
  const eye = new THREE.Vector3(...cam.pos);
  const fwd = new THREE.Vector3(...cam.look).sub(eye);
  const d = fwd.length() * 0.6;
  fwd.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camQ);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camQ);
  const halfH = d * Math.tan(((cam.fov / 2) * Math.PI) / 180);
  const halfW = halfH * ASPECT;
  const p = eye.clone().addScaledVector(fwd, d).addScaledVector(right, spec.scr[0] * halfW).addScaledVector(up, spec.scr[1] * halfH);
  const sc = spec.w * 2 * halfW * Math.max(k, 0.001);
  let target: V3 | undefined;
  if (spec.target) {
    const v = new THREE.Vector3(spec.target[0] + off, spec.target[1], spec.target[2]).sub(p).applyQuaternion(camQ.clone().invert()).divideScalar(sc);
    target = [v.x, v.y, v.z];
  }
  return (
    <group position={p} quaternion={camQ}>
      <group scale={sc}>
        <PaperTag text={spec.text} sub={spec.sub} font={FONT} position={[0, 0, 0]} rotY={0} tilt={spec.tilt ?? 0} target={target} w={1} />
      </group>
    </group>
  );
};

// ---------------- drops & puddle (abstract clear water) ----------------
const DROP_MAT = { color: "#A9D6E5", emissive: "#6FC0DC", roughness: 0.15 };
const DRIP_DT = 0.12;
const Drops: React.FC<{ t: number }> = ({ t }) => {
  const hx = BUS.hoseEnd[0];
  const out: React.ReactNode[] = [];
  // while driving: spread thin along the road
  const d0 = B.jalan;
  const d1 = BRAKE0 + BRAKE_D * 0.5;
  for (let ti = d0, i = 0; ti < d1 && ti <= t; ti += DRIP_DT, i++) {
    const x = busX(ti) + hx;
    const age = t - ti;
    const z = BUS.hoseEnd[2] + Math.sin(i * 1.7) * 0.05;
    if (age < 0.16) {
      const y = BUS.hoseEnd[1] - (BUS.hoseEnd[1] - 0.05) * (age / 0.16);
      out.push(
        <mesh key={`f${i}`} position={[x, y, z]} scale={[0.022, 0.03, 0.022]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial {...DROP_MAT} emissiveIntensity={0.6} transparent opacity={0.9} />
        </mesh>,
      );
    } else {
      const s = 0.045 + (i % 3) * 0.008;
      out.push(
        <mesh key={`d${i}`} position={[x, 0.047, z]} scale={[s * 1.4, s * 0.18, s]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial {...DROP_MAT} emissiveIntensity={0.45} transparent opacity={0.85} />
        </mesh>,
      );
    }
  }
  // stopped: everything falls at one point
  const px = XS + hx;
  const p0 = B.semuanya;
  const p1 = B.bau + 0.3;
  if (t >= p0 && t < p1 + 0.3) {
    for (let j = 0; j < 3; j++) {
      const ph = ((t - p0) * 3 + j / 3) % 1;
      const y = BUS.hoseEnd[1] - (BUS.hoseEnd[1] - 0.05) * ph;
      out.push(
        <mesh key={`s${j}`} position={[px, y, BUS.hoseEnd[2]]} scale={[0.022, 0.03, 0.022]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial {...DROP_MAT} emissiveIntensity={0.6} transparent opacity={0.9} />
        </mesh>,
      );
    }
  }
  if (t >= p0) {
    const r = 0.05 + 0.3 * ramp(t, p0, p1);
    out.push(
      <mesh key="puddle" position={[px + 0.02, 0.046, BUS.hoseEnd[2] + 0.02]} scale={[r * 1.35, 0.012, r]}>
        <sphereGeometry args={[1, 28, 10]} />
        <meshStandardMaterial color="#6F8090" emissive="#8EA2B4" emissiveIntensity={0.12} roughness={0.06} metalness={0.1} transparent opacity={0.78} />
      </mesh>,
    );
  }
  // abstract smell squiggles (cartoon icon, no explicit matter)
  const stink = ramp(t, B.bau - 0.25, B.bau + 0.2) * (1 - ramp(t, SEC.PAYOFF[0] - 0.4, SEC.PAYOFF[0]));
  if (stink > 0.01)
    [0, 1, 2].forEach((j) => {
      const rise = ((t - B.bau) * 0.25 + j * 0.12) % 0.45;
      out.push(<Squiggle key={`q${j}`} pos={[px - 0.12 + j * 0.12, 0.1 + rise * 0.7, BUS.hoseEnd[2] + 0.35]} t={t} ph={j} k={stink} />);
    });
  return <>{out}</>;
};

const Squiggle: React.FC<{ pos: V3; t: number; ph: number; k: number }> = ({ pos, t, ph, k }) => {
  const geo = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.55 + ph) * 0.035, i * 0.012, 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.009, 6, false);
  }, [ph]);
  return (
    <mesh geometry={geo} position={pos} rotation={[0, 0, Math.sin(t * 2 + ph) * 0.15]} scale={k * 0.6}>
      <meshStandardMaterial color="#C9D0D6" emissive="#AEB8C2" emissiveIntensity={0.3} roughness={0.5} transparent opacity={0.8} />
    </mesh>
  );
};

/** Dashed-looking ghost of the holding tank most AKAP buses do NOT have. */
const GhostTank: React.FC<{ t: number; flash: number; cross: number }> = ({ flash, cross }) => {
  const geo = React.useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(TB.x1 - TB.x0, TB.y1 - TB.y0, TB.z1 - TB.z0)), []);
  const col = flash > 0.5 ? P.busCoral : "#F4EFEA";
  return (
    <group position={tankC}>
      <mesh>
        <boxGeometry args={[TB.x1 - TB.x0, TB.y1 - TB.y0, TB.z1 - TB.z0]} />
        <meshBasicMaterial color={col} transparent opacity={0.16 + flash * 0.2} depthWrite={false} />
      </mesh>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={col} />
      </lineSegments>
      {cross > 0.01 ? (
        <group position={[0, 0, (TB.z1 - TB.z0) / 2 + 0.04]} scale={cross}>
          <mesh rotation={[0, 0, 0.7]}>
            <boxGeometry args={[0.5, 0.06, 0.02]} />
            <meshStandardMaterial color={P.busCoral} emissive={P.busCoral} emissiveIntensity={0.5} />
          </mesh>
          <mesh rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.5, 0.06, 0.02]} />
            <meshStandardMaterial color={P.busCoral} emissive={P.busCoral} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** Glowing drop travelling toilet -> pipe -> hose -> road (bus space). */
const FlowDrop: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.1) return null;
  const pts: V3[] = [
    [BUS.toiletX + 0.02, BUS.FLOOR + 0.2, 0.3],
    [BUS.pipeX, BUS.FLOOR - 0.28, 0.3],
    BUS.hoseEnd,
    [BUS.hoseEnd[0], 0.05, BUS.hoseEnd[2]],
  ];
  const u = clamp01((t - t0) / (t1 - t0)) * 3;
  const i = Math.min(2, Math.floor(u));
  const p = lerp3(pts[i], pts[i + 1], u - i);
  return (
    <mesh position={p} scale={[0.04, 0.05, 0.04]}>
      <sphereGeometry args={[1, 14, 12]} />
      <meshStandardMaterial color="#BFEAF7" emissive="#7FD3F0" emissiveIntensity={1.6} roughness={0.1} />
    </mesh>
  );
};

/** Paper tape-measure strips on the cubicle floor (approximate size cue). */
const Tape: React.FC<{ k: number }> = ({ k }) =>
  k < 0.01 ? null : (
    <group position={[0, BUS.FLOOR + 0.02, 0]}>
      <mesh position={[-2.71 + (k - 1) * 0.4, 0, 0.6]} scale={[k, 1, 1]}>
        <boxGeometry args={[0.8, 0.006, 0.05]} />
        <meshStandardMaterial color={P.busHoney} roughness={0.7} />
      </mesh>
      <mesh position={[-2.31 + 0.04, 0, 0.27]} scale={[1, 1, k]}>
        <boxGeometry args={[0.05, 0.006, 0.6]} />
        <meshStandardMaterial color={P.busHoney} roughness={0.7} />
      </mesh>
    </group>
  );

// ---------------- 3D scene ----------------
const Scene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(t);
  const bx = busX(t);
  const speed = busSpeed(t);
  const sec = cam.shot.name;
  const camQ = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(new THREE.Vector3(...cam.pos), new THREE.Vector3(...cam.look), new THREE.Vector3(0, 1, 0)),
  );

  const moving = clamp01(Math.abs(speed) / V);
  const bang = t > B.banting - 0.1 && t < B.goyang + 0.9 ? Math.sin((t - B.banting) * 7) * 0.05 * Math.sin(clamp01((t - B.banting + 0.1) / (B.goyang + 1.0 - B.banting)) * Math.PI) : 0;
  const roll = Math.sin(t * 6.3) * 0.006 * moving + bang;
  const u = t - BRAKE0;
  const pitch = u > 0 && u < BRAKE_D + 0.6 ? -0.022 * Math.sin(Math.min(1, u / (BRAKE_D + 0.6)) * Math.PI) : 0;

  let stickerMode: StickerMode = "base";
  if (t >= B.hl1 && t < SHOTS[1].t1) stickerMode = t >= B.hl2 ? "hl2" : "hl1";
  if (sec.startsWith("S14")) stickerMode = "bio";

  const inS3 = sec.startsWith("S03");
  const inS7 = sec.startsWith("S07");
  const glowToilet = inS3 ? pulse(t, B.buangan - 0.1) : inS7 ? pulse(t, B.saluran) : sec.startsWith("S15") ? pulse(t, B.pipa - 0.2, 0.2, 0.6) : 0;
  const glowPipe = inS3 ? pulse(t, B.buangan + 0.3) : inS7 ? pulse(t, B.tembus - 0.1, 0.18, 0.6) : sec.startsWith("S15") ? pulse(t, B.pipa - 0.1, 0.2, 0.8) : 0;
  const glowHose = inS3 ? pulse(t, B.buangan + 0.6) : inS7 ? pulse(t, B.langsung - 0.1, 0.18, 0.6) : sec.startsWith("S15") ? pulse(t, B.pipa, 0.2, 0.8) : 0;

  const xray = sec.startsWith("S12") || sec.startsWith("S13") || sec.startsWith("S11");
  const bio = sec.startsWith("S13") || sec.startsWith("S14") ? springIn(t, B.bio - 0.2) : 0;
  const s: BusState = {
    spin: -bx / BUS.wheelR,
    roll,
    pitch,
    sticker: stickerMode,
    skirt: xray ? 1 - 0.88 * ramp(t, SEC.PAYOFF[0], SEC.PAYOFF[0] + 0.5) : 1,
    hiLuggage: sec.startsWith("S12") ? pulse(t, B.bagasi, 0.15, 0.35, 0.3) : 0,
    hiFuel: sec.startsWith("S12") ? pulse(t, B.solar, 0.15, 0.35, 0.3) : 0,
    hiEngine: sec.startsWith("S12") ? pulse(t, B.mesin, 0.15, 0.6, 0.6) : 0,
    kolongLight: xray ? 3.2 : 0,
    kolongX: cam.look[0] - bx,
    glowToilet,
    glowPipe,
    glowHose,
    flush: sec.startsWith("S05") ? ramp(t, B.tandon - 0.2, B.tandon + 0.2) : 0,
    bio,
    vent: sec.startsWith("S13") || sec.startsWith("S14") ? ramp(t, B.tank + 0.2, B.tank + 1.0) : 0,
    t,
    standee: sec.startsWith("S04") ? roll * 4 : null,
  };

  const ghostOn = sec.startsWith("S06") ? (t >= B.tidak - 0.1 ? 1 : 0) : sec.startsWith("S11") || sec.startsWith("S12") ? 1 : 0;
  const ghostFlash = sec.startsWith("S12") ? pulse(t, B.mesin + 0.35, 0.1, 0.5, 0.3) : 0;
  const ghostCross = sec.startsWith("S06") ? springIn(t, B.tangki) : 0;

  return (
    <>
      <CamRig pos={cam.pos} look={cam.look} fov={cam.fov} />
      <color attach="background" args={["#0E141D"]} />
      <fog attach="fog" args={["#2A2348", 16, 30]} />
      <ambientLight intensity={0.5} color="#E8D9F0" />
      <hemisphereLight args={["#6A6FB0", "#3A291E", 0.6]} />
      <KeyLight x={bx} />
      <directionalLight position={[-5, 4.5, -4]} intensity={1.2} color="#8EB8E5" />
      <directionalLight position={[2, 2, 6]} intensity={0.35} color="#FFD1A0" />
      <Sky camX={cam.pos[0]} camZ={cam.pos[2]} />
      <World camX={cam.pos[0]} xs={XS} />
      <group position={[bx, 0, 0]}>
        <FilmBus s={s} />
        {ghostOn ? <GhostTank t={t} flash={ghostFlash} cross={ghostCross} /> : null}
        <Tape k={sec.startsWith("S04") ? ramp(t, B.sempit, B.sempit + 0.6) : 0} />
        {inS3 ? <FlowDrop t={t} t0={B.buangan - 0.1} t1={B.buangan + 1.1} /> : null}
        {inS7 ? <FlowDrop t={t} t0={B.saluran} t1={B.jalan} /> : null}
      </group>
      <Drops t={t} />
      {TAGS.filter((g) => t >= g.t0 && t < g.t1).map((g) => (
        <Tag key={g.text} spec={g} t={t} cam={cam} camQ={camQ} bx={bx} />
      ))}
    </>
  );
};

// ---------------- transitions ----------------
// whip: lateral smear across the cut (motion continues into the next shot)
// zoom: push through the frame centre into the next shot (paper flash at the seam)
const TRANSITIONS: { t: number; kind: "whip" | "zoom"; dir?: number }[] = [
  { t: SHOTS[7].t0, kind: "whip", dir: -1 }, // S07 drop hits road -> S08 trail behind the bus
  { t: SHOTS[9].t0, kind: "zoom" }, // S09 puddle -> S10 sticker "DILARANG"
  { t: SHOTS[11].t0, kind: "whip", dir: 1 }, // S11 ghost tank -> S12 dolly along the full under-floor
  { t: SHOTS[13].t0, kind: "zoom" }, // S13 bio tank -> S14 bio-tank sticker
];
const transitionFx = (t: number) => {
  const out = { tx: 0, scale: 1, blur: 0, flash: 0 };
  for (const tr of TRANSITIONS) {
    const half = tr.kind === "whip" ? 0.16 : 0.22;
    const u = (t - tr.t) / half;
    if (Math.abs(u) >= 1) continue;
    const k = 1 - Math.abs(u);
    const e = k * k;
    if (tr.kind === "whip") {
      out.tx = (tr.dir ?? 1) * -u * 420;
      out.blur = 22 * e;
    } else {
      out.scale = 1 + 0.9 * e;
      out.blur = 10 * e;
      out.flash = 0.45 * e * e;
    }
  }
  return out;
};

// ---------------- captions (karaoke, kraft strip) ----------------
type Phrase = { words: Word[]; s: number; e: number };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = [];
    };
    c.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.?!:]$/.test(w.w);
      const rest = c.words.length - 1 - i;
      // keep a lone last word with its phrase instead of flashing it alone
      if (rest === 1 && !punct) return;
      if ((punct && cur.length >= 2) || cur.length >= 5) flush();
    });
    flush();
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_START) return null;
  let idx = -1;
  for (let i = 0; i < PHRASES.length; i++) if (t >= PHRASES[i].s - 0.08) idx = i;
  if (idx < 0) return null;
  const ph = PHRASES[idx];
  const next = PHRASES[idx + 1];
  const hideAt = Math.min(next ? next.s - 0.08 : Infinity, ph.e + 0.6);
  if (t > hideAt) return null;
  const inK = clamp01((t - ph.s + 0.08) / 0.18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1392, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          background: P.paper,
          borderRadius: 8,
          padding: "16px 30px 20px",
          maxWidth: 920,
          boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
          transform: `translateY(${(1 - inK) * 18}px) rotate(${idx % 2 ? 0.8 : -0.8}deg)`,
          opacity: inK,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 24,
        }}
      >
        <div style={{ position: "absolute", left: 40, top: -14, width: 130, height: 30, background: "rgba(230,200,117,0.85)", transform: "rotate(-4deg)" }} />
        {ph.words.map((w, i) => {
          const nxt = ph.words[i + 1];
          const active = t >= w.s && (nxt ? t < nxt.s : t < w.e + 0.25);
          const past = t >= w.s;
          const b = active ? 1 + 0.07 * Math.max(0, 1 - (t - w.s) / 0.18) : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: TITLE_FONT,
                fontSize: 64,
                lineHeight: 1.12,
                color: active ? P.busCoral : past ? P.ink : "rgba(24,26,27,0.42)",
                display: "inline-block",
                transform: `scale(${b}) translateY(${active ? -3 : 0}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender("ep037 film fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    Promise.all([fontReady(), lilita.waitUntilDone()]).then(done, done);
  }, [handle]);
  const s = width / 1080;
  const fx = transitionFx(t);
  return (
    <AbsoluteFill style={{ background: "#0E141D" }}>
      {ready ? (
        <>
          {t < OUTRO_START + 0.7 ? (
            <AbsoluteFill style={{ transform: `translateX(${fx.tx * s}px) scale(${fx.scale})`, filter: fx.blur > 0.05 ? `blur(${fx.blur * s}px)` : undefined }}>
              <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ position: [0, 2, 8], fov: 32, near: 0.03, far: 80 }}>
                <Scene t={t} />
              </ThreeCanvas>
            </AbsoluteFill>
          ) : null}
          <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0" }}>
            <div style={{ position: "absolute", left: 0, bottom: 0, width: 1080, height: 640, background: "linear-gradient(0deg, rgba(8,8,14,0.7) 0%, rgba(8,8,14,0.3) 50%, rgba(8,8,14,0) 100%)" }} />
            {fx.flash > 0.01 ? <div style={{ position: "absolute", inset: 0, background: P.paper, opacity: fx.flash }} /> : null}
            <Captions t={t} />
          </div>
          <Outro start={OUTRO_START} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

