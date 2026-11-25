// EP11 — Kanakuri, the 54-year marathon (CHRONICLE). Multi-scene director, every cut on the locked VO (timing.ts).
// A 1912 road hook → B1 Stockholm stadium → B2 Eurasia map → B3 white night → C1 heat / Lazaro → C2 KM 30 → C3 cottage
// → C3b asleep → C3c station → D1 newspaper → D2 track 1920/24 → D3 Hakone → E1 TV crew / finish → E2 board → OUT.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotCanvas } from "./chronicle/ShotCanvas.tsx";
import { chronicleFontsReady, F_CAPTION, F_LABEL, F_STAMP } from "./chronicle/fonts.ts";
import { AMBER, Captions, CRIMSON, DateStamp, Frame, IVORY, MapPin, NameTag, RouteLine, type Word as CapWord } from "./chronicle/Overlay.tsx";
import { camAt, handheld, project, type CamKey, type Shot, type V3 } from "./chronicle/cam.ts";
import type { Look } from "./chronicle/Stage.tsx";
import { MAPLOOK, MapSet, ROAD, RoadSet, STADION12, Stockholm, WHITENIGHT, WhiteNightSet, mapPoint, routeAt } from "./sets.tsx";
import {
  BOARD, BoardSet, COTTAGE, CottageSet, DESK, DeskSet, FAMILY, FamilySet, FinishSet, HAKONE, HEAT, HakoneSet, HeatSet, InviteSet, KM30, KmSet, LazaroLook, LazaroSet,
  ROADEND, RoadEndSet, STADION67, STATION, SleepSet, StationSet, TRACK24, TrackSet, finishZ, heroX, sleepLook,
} from "./sets2.tsx";
import { NearLayer, BigValue, Chip, Flash, InkCut, Stamp } from "./hud.tsx";
import { CLIPS, CUT, T, VO_END, clamp, lerp, pop, seg, win } from "./timing.ts";

const K = (t: number, pos: V3, target: V3, fov = 42, roll = 0): CamKey => ({ t, pos, target, fov, roll });
const keys = (...k: CamKey[]) => (t: number) => camAt(k, t);

/** Tilt down by `px` (of 1920) so the subject's feet sit above the caption line. */
const lifted = (s: Shot, px = 0): Shot => { const d = Math.hypot(s.pos[0] - s.target[0], s.pos[1] - s.target[1], s.pos[2] - s.target[2]); return { ...s, target: [s.target[0], s.target[1] - (px / 960) * d * Math.tan((s.fov * Math.PI) / 360), s.target[2]] }; };

// ================================================================= B2 map camera + progress
const mapP = (t: number) => (t < 17.75 ? lerp(0.02, 0.25, seg(t, 14.2, 17.75)) : lerp(0.25, 0.95, seg(t, 17.75, CUT.b3 + 0.35)));
const mapShot = (t: number): Shot => {
  const f = routeAt(mapP(t)).pos;
  const mid = mapPoint(84, 47);
  const z = seg(t, 14.6, 16.6), out = 0.55 * seg(t, 18.3, CUT.b3 + 0.2);
  const k = z * (1 - out);
  const pos: V3 = [lerp(mid[0] + 185, f[0] + 30, k), lerp(218, 20, k), lerp(mid[2] + 90, f[2] + 22, k)];
  const tg: V3 = [lerp(mid[0] + 6, f[0] - 2, k), lerp(0, 1, k), lerp(mid[2] + 6, f[2], k)];
  return handheld(lifted({ pos, target: tg, fov: 46 }, 310 * (1 - k)), t, { drift: 0.003, seed: 4, hits: [T.delapanBelas], hit: 0.008 });
};
const ROUTE_P = Array.from({ length: 61 }, (_, i) => i / 60);

// ================================================================= scenes
type Scene = { id: string; at: number; look: Look | ((t: number) => Look); shot: (t: number) => Shot; Set: React.FC<{ t: number }>; lift?: number };
const SCENES: Scene[] = [
  { id: "A", lift: 80, at: 0, look: ROAD, Set: RoadSet, shot: (t) => handheld(camAt([K(0, [0.9, 0.62, 4.3], [0.05, 0.98, 0], 46), K(1.6, [0.5, 0.8, 5.2], [0, 0.95, 0], 46), K(4.4, [-0.9, 1.15, 6.4], [0, 0.84, 0], 44)], t), t, { hits: [T.hit54], hit: 0.022, seed: 5 }) },
  { id: "B1", lift: 115, at: CUT.b1, look: STADION12, Set: ({ t }) => <Stockholm t={t} pair={seg(t, 10.6, 11.4)} />, shot: keys(K(CUT.b1, [-2.4, 6.4, 11], [0, 1.9, -5], 46), K(7.4, [-0.9, 1.7, 7.0], [0.15, 0.8, -1], 44), K(8.6, [-0.7, 1.25, 5.6], [0.1, 0.85, 0], 42), K(10.6, [-0.2, 1.2, 5.1], [0.15, 0.82, 0], 42), K(CUT.b2 + 0.1, [1.5, 1.25, 6.5], [0.5, 1.02, -0.3], 42)) },
  { id: "B2", at: CUT.b2, look: MAPLOOK, Set: ({ t }) => <MapSet t={t} p={mapP(t)} />, shot: mapShot },
  { id: "B3", lift: 210, at: CUT.b3, look: WHITENIGHT, Set: WhiteNightSet, shot: keys(K(CUT.b3, [-1.7, 1.75, 5.0], [0.1, 1.0, -1.2], 44), K(CUT.c1 + 0.1, [0.75, 1.2, 3.4], [0.0, 0.88, -1.0], 44)) },
  { id: "C1", lift: 120, at: CUT.c1, look: HEAT, Set: HeatSet, shot: (t) => handheld(camAt([K(CUT.c1, [3.4, 0.9, 3.6], [0.2, 0.95, -1.2], 44), K(26.8, [2.0, 1.5, 5.4], [0, 0.9, -1.2], 44), K(29.4, [0.5, 2.3, 6.4], [0, 0.6, -1.6], 44), K(CUT.c1b + 0.1, [-1.5, 2.0, 5.4], [-0.6, 0.35, -2], 44)], t), t, { hits: [T.pelari68], hit: 0.01, seed: 3 }) },
  { id: "C1b", lift: 95, at: CUT.c1b, look: LazaroLook, Set: LazaroSet, shot: keys(K(CUT.c1b, [1.0, 1.5, 4.3], [0, 1.0, -2.6], 42), K(T.kolaps, [0.5, 1.0, 5.0], [0, 0.8, 0], 42), K(CUT.c2 + 0.1, [-1.1, 0.75, 3.7], [0, 0.6, 0], 42)) },
  { id: "C2", lift: 115, at: CUT.c2, look: KM30, Set: KmSet, shot: keys(K(CUT.c2, [-1.6, 1.3, 5.0], [0.25, 0.98, -0.6], 42), K(CUT.c3 + 0.1, [0.6, 1.1, 4.9], [0.3, 0.9, -0.4], 42)) },
  { id: "C3", lift: 90, at: CUT.c3, look: COTTAGE, Set: CottageSet, shot: keys(K(CUT.c3, [-2.0, 1.5, 5.5], [-0.4, 1.0, -0.3], 42), K(CUT.c3b + 0.1, [0.9, 1.35, 5.0], [0.18, 0.96, -0.1], 42)) },
  { id: "C3b", at: CUT.c3b, look: (t) => sleepLook(seg(t, T.pagi - 0.5, T.pagi + 0.4)), Set: SleepSet, shot: keys(K(CUT.c3b, [1.3, 2.4, 3.5], [0, 0.95, -1.2], 46), K(CUT.c3c + 0.1, [-0.5, 1.9, 2.9], [0, 0.95, -1.2], 46)) },
  { id: "C3c", at: CUT.c3c, look: STATION, Set: StationSet, shot: (t) => { const z = -(t - CUT.c3c) * 1.15; return handheld(camAt([K(CUT.c3c, [1.5, 1.2, 5.0], [0.3, 0.95, 0], 42), K(CUT.d1 + 0.1, [-0.5, 1.9, 6.0 + z * 0.7], [0.3, 0.9, z], 42)], t), t, { seed: 8 }); } },
  { id: "D1", at: CUT.d1, look: DESK, Set: DeskSet, shot: keys(K(CUT.d1, [1.1, 1.5, 2.9], [0.1, 0.35, -0.7], 44), K(T.hilang, [0.2, 2.5, 2.0], [0.02, 0.0, -0.14], 44), K(CUT.d2 + 0.1, [-0.1, 2.35, 1.4], [0, 0.0, -0.22], 44)) },
  { id: "D2", lift: 90, at: CUT.d2, look: TRACK24, Set: TrackSet, shot: (t) => { const x = heroX(t); return handheld(camAt([K(CUT.d2, [x + 2.6, 0.8, 4.9], [x + 0.1, 0.92, 0], 42), K(CUT.d3 + 0.1, [x - 1.6, 1.4, 5.2], [x + 0.1, 0.88, 0], 42)], t), t, { hits: [T.y1920, T.y1924], hit: 0.01, seed: 6 }); } },
  { id: "D3", lift: 90, at: CUT.d3, look: HAKONE, Set: HakoneSet, shot: keys(K(CUT.d3, [-2.4, 1.1, 5.2], [-0.5, 1.0, -0.6], 44), K(T.estafet, [0.4, 1.2, 5.9], [0.3, 0.94, 0], 44), K(CUT.e1 + 0.1, [1.2, 1.4, 5.8], [0.5, 0.94, 0], 44)) },
  { id: "E1", lift: 50, at: CUT.e1, look: STADION67, Set: InviteSet, shot: keys(K(CUT.e1, [2.2, 2.7, 5.2], [-0.1, 1.5, -5], 44), K(T.televisi + 0.4, [0.55, 1.75, 3.5], [-0.05, 1.1, -3.5], 44), K(CUT.e1b + 0.1, [0.0, 1.55, 2.1], [0.15, 1.02, -3.5], 42)) },
  { id: "E1b", lift: 105, at: CUT.e1b, look: STADION67, Set: FinishSet, shot: (t) => { const z = finishZ(t); return handheld(camAt([K(CUT.e1b, [1.4, 1.3, 2.2], [0, 1.1, -5], 44), K(T.melintasi, [0.6, 1.1, 4.6], [0, 1.0, z], 44), K(T.finis + 0.1, [0.1, 0.95, 5.9], [0, 0.98, 0], 44), K(CUT.e2 + 0.1, [-0.5, 1.0, 5.9], [0, 0.98, 0.4], 44)], t), t, { hits: [T.finis], hit: 0.02, seed: 2 }); } },
  { id: "E2", lift: 40, at: CUT.e2, look: BOARD, Set: BoardSet, shot: (t) => handheld(camAt([K(CUT.e2, [1.5, 1.0, 9.6], [0, 1.85, -1.8], 46), K(T.w6, [0.2, 1.7, 10.7], [0, 1.8, -1.8], 46), K(CUT.out + 0.1, [-1.4, 2.2, 10.5], [0, 1.8, -1.8], 46)], t), t, { hits: [T.w54, T.w8, T.w6, T.w5, T.w32, T.w20], hit: 0.007, seed: 9 }) },
  { id: "OUT", lift: 90, at: CUT.out, look: FAMILY, Set: FamilySet, shot: keys(K(CUT.out, [1.5, 0.8, 4.2], [0, 0.95, 0], 42), K(T.menikah, [0.5, 1.1, 5.4], [0, 0.9, 0], 42), K(T.sepuluh, [-0.3, 1.5, 7.3], [0, 1.0, 0], 42), K(CUT.out2 + 0.1, [-0.8, 1.6, 7.8], [0, 1.0, 0], 42)) },
  { id: "OUT2", lift: 110, at: CUT.out2, look: ROADEND, Set: RoadEndSet, shot: (t) => { const z = -0.81 * (t - CUT.out2); return handheld(camAt([K(CUT.out2, [1.3, 1.0, 5.6], [0.1, 1.0, 0], 44), K(T.kembali, [0.3, 1.5, 5.5 + z * 0.8], [0, 0.98, -2.6], 44), K(91.4, [-0.8, 2.6, 1.0], [0, 1.1, -7.6], 44)], t), t, { seed: 7 }); } },
];
const NEAR: Record<string, "grass" | "crowd"> = { A: "grass", C1: "grass", C1b: "grass", C2: "grass", C3: "grass", D3: "grass", OUT: "grass", OUT2: "grass", B1: "crowd", C3c: "crowd", D2: "crowd", E1: "crowd", E1b: "crowd", E2: "crowd" };
const sceneAt = (t: number) => { let s = SCENES[0]; for (const c of SCENES) if (t >= c.at) s = c; return s; };

// ================================================================= small HUD parts
const YearRoll: React.FC<{ t: number; a: number; b: number; y: number }> = ({ t, a, b, y }) => {
  const v = win(t, a, b, 0.2, 0.25);
  if (v <= 0) return null;
  const k = 1 - Math.pow(1 - clamp((t - a) / 0.6), 2);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 26, opacity: v, fontFamily: F_STAMP, fontSize: 92, color: IVORY, textShadow: "0 6px 26px rgba(0,0,0,0.65)" }}>
      <span style={{ opacity: 0.8 }}>1912</span>
      <span style={{ width: 150, height: 9, background: "rgba(244,234,216,0.3)", position: "relative" }}><span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${k * 100}%`, background: CRIMSON }} /></span>
      <span style={{ color: AMBER, minWidth: 190 }}>{Math.round(lerp(1912, 1967, k))}</span>
    </div>
  );
};
const Ask: React.FC<{ t: number }> = ({ t }) => {
  const v = win(t, T.menurutmu + 0.2, T.ikuti - 0.1, 0.25, 0.25);
  if (v <= 0) return null;
  const box = (label: string, a: number, color: string) => (
    <div style={{ width: 400, textAlign: "center", padding: "14px 0 8px", border: `5px solid ${color}`, background: "rgba(18,13,11,0.72)", fontFamily: F_STAMP, fontSize: 92, lineHeight: 1.1, color, transform: `scale(${t < a ? 0.86 : pop(t, a)})`, opacity: t < a ? 0.45 : 1 }}>{label}</div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 285, opacity: v }}>
      <div style={{ textAlign: "center", fontFamily: F_LABEL, fontWeight: 800, fontSize: 60, letterSpacing: 8, color: IVORY, textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>FINIS ITU SOAL…</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 20 }}>{box("CEPAT?", T.cepat, IVORY)}{box("KEMBALI?", T.kembali, AMBER)}</div>
    </div>
  );
};
const MapHud: React.FC<{ t: number; aspect: number }> = ({ t, aspect }) => {
  const s = mapShot(t), P = (p: V3) => project(s, aspect, p, 0.5, 4000);
  const p = mapP(t), wide = 1 - seg(t, 15.0, 15.9);
  const done = ROUTE_P.filter((x) => x <= p).concat(p).map((x) => P(routeAt(x).pos)).filter((q) => q.vis);
  const all = ROUTE_P.map((x) => P(routeAt(x).pos)).filter((q) => q.vis);
  const a = P(mapPoint(139.7, 35.6)), b = P(mapPoint(18.1, 59.3));
 return (
    <>
      <RouteLine pts={all} progress={seg(t, 13.5, 15.2)} dash width={7} opacity={0.75} />
      <RouteLine pts={done} progress={1} width={11} />
      {a.vis && wide > 0.1 && <MapPin s={t} a={13.5} x={a.x} y={a.y} name="JEPANG" side="l" pulse={1} />}
      {b.vis && wide > 0.1 && <MapPin s={t} a={14.4} x={b.x} y={b.y} name="STOCKHOLM" pulse={1} />}
      <BigValue t={t} a={T.delapanBelas} b={CUT.b3} label="PERJALANAN" value="18 HARI" color={AMBER} y={250} size={200} />
      <Chip t={t} a={T.kapal} b={T.trans - 0.2} text="NAIK KAPAL" color={IVORY} y={540} />
      <Chip t={t} a={T.trans - 0.15} b={CUT.b3} text="KERETA TRANS SIBERIA" color={IVORY} y={540} />
    </>
  );
};

const Hud: React.FC<{ t: number; id: string; aspect: number }> = ({ t, id, aspect }) => (
  <>
    {id === "A" && (<>
      <Chip t={t} a={-0.2} b={1.55} text="MARATON INI SELESAI DALAM…" color={IVORY} y={270} />
      <Stamp t={t} a={T.hit54} b={CUT.b1} text="54 TAHUN" color={AMBER} y={240} size={204} />
      <YearRoll t={t} a={1.95} b={CUT.b1} y={448} />
      <Flash t={t} at={T.hit54} dur={0.3} max={0.45} />
    </>)}
    {id === "B1" && (<>
      <DateStamp s={t} a={CUT.b1 + 0.1} b={7.5} top="STOCKHOLM · OLIMPIADE" big="14 JULI 1912" y={250} size={150} />
      <NameTag s={t} a={T.shizo} b={11.0} name="SHIZO KANAKURI" role="20 tahun" y={240} />
      <BigValue t={t} a={T.duaAtlet} b={CUT.b2} label="OLIMPIAN PERTAMA JEPANG" value="1 DARI 2" color={AMBER} y={240} size={160} />
    </>)}
    {id === "B2" && <MapHud t={t} aspect={aspect} />}
    {id === "B3" && (<>
      <Chip t={t} a={19.5} b={21.1} text="TIBA DALAM KEADAAN LEMAS" color={IVORY} y={300} />
      <Stamp t={t} a={T.susahTidur} b={CUT.c1} text="SUSAH TIDUR" sub="MALAM TETAP TERANG" y={270} size={150} />
    </>)}
    {id === "C1" && (<>
      <Stamp t={t} a={25.18} b={26.75} text="GELOMBANG PANAS" color="#ffdf9a" y={270} size={124} />
      <BigValue t={t} a={T.pelari68} b={29.55} label="BERANGKAT" value="68 PELARI" color={AMBER} y={250} size={180} />
      <Stamp t={t} a={29.71} b={CUT.c1b} text="PULUHAN TUMBANG" color="#ff8a6a" y={240} size={100} />
      <Flash t={t} at={T.pelari68} dur={0.25} max={0.25} />
    </>)}
    {id === "C1b" && <NameTag s={t} a={T.lazaro} b={CUT.c2} name="FRANCISCO LAZARO" role={t < T.meninggal ? "Portugal" : "meninggal setelah kolaps"} y={290} />}
    {id === "C2" && <Stamp t={t} a={T.menyerah} b={CUT.c3} text="MENYERAH" color={IVORY} y={270} size={180} />}
    {id === "C3" && <Stamp t={t} a={T.rumah} b={CUT.c3b} text={t < T.minum ? "MASUK RUMAH WARGA" : "DIBERI MINUM"} y={280} size={110} />}
    {id === "C3b" && <Stamp t={t} a={T.tertidur} b={CUT.c3c} text="TERTIDUR SAMPAI PAGI" sub="VERSI OLYMPEDIA" y={280} size={100} />}
    {id === "C3c" && <Stamp t={t} a={T.malu} b={CUT.d1} text={t < T.pulang ? "KARENA MALU" : "PULANG DIAM-DIAM"} sub={t < T.pulang ? undefined : "TANPA LAPOR PANITIA"} y={280} size={112} />}
    {id === "D1" && <Stamp t={t} a={T.legenda} b={CUT.d2} text="LEGENDA" sub="PELARI JEPANG YANG HILANG" color={AMBER} y={250} size={150} />}
    {id === "D2" && (<>
      <Chip t={t} a={T.berlari - 0.1} b={T.y1920 - 0.15} text="PADAHAL IA TERUS BERLARI" y={300} />
      <BigValue t={t} a={T.y1920} b={CUT.d3} label="OLIMPIADE" value={t < T.y1924 ? "1920" : "1920 · 1924"} color={AMBER} y={260} size={170} />
    </>)}
    {id === "D3" && <Stamp t={t} a={T.hakone} b={CUT.e1} text="HAKONE EKIDEN" sub="LOMBA LARI ESTAFET" y={260} size={130} />}
    {id === "E1" && (<>
      <Stamp t={t} a={T.y1967} b={T.televisi - 0.1} text="1967" color={AMBER} y={246} size={210} />
      <Stamp t={t} a={T.televisi} b={CUT.e1b} text="DIUNDANG KEMBALI" sub="TELEVISI SWEDIA" y={262} size={116} />
    </>)}
    {id === "E1b" && (<>
      <BigValue t={t} a={T.usia75 - 0.1} b={T.melintasi} label="USIA" value="75" color={AMBER} y={330} size={190} />
      <Stamp t={t} a={T.finis} b={CUT.e2} text="FINIS!" color={AMBER} y={310} size={170} />
      <Flash t={t} at={T.finis} dur={0.4} max={0.6} />
    </>)}
    {id === "E2" && [T.w54, T.w8, T.w6, T.w5, T.w32, T.w20].map((a) => <Flash key={a} t={t} at={a} dur={0.2} max={0.16} />)}
    {id === "OUT" && (<>
      <Chip t={t} a={T.perjalanan} b={T.menikah - 0.15} text="PERJALANAN YANG PANJANG" color={IVORY} y={300} />
      <Chip t={t} a={T.menikah} b={T.enam - 0.1} text="DI TENGAH JALAN, IA MENIKAH" y={300} />
      <BigValue t={t} a={T.enam} b={CUT.out2} label="KELUARGA" value={t < T.sepuluh ? "6 ANAK" : "6 ANAK · 10 CUCU"} color={AMBER} y={260} size={t < T.sepuluh ? 170 : 132} />
    </>)}
    {id === "OUT2" && (<>
      <Ask t={t} />
      <Chip t={t} a={T.ikuti} b={VO_END + 0.2} text="@AudiraSportFacts" y={300} />
    </>)}
  </>
);

// ================================================================= captions (VO words)
const KEYS = /^(maraton|shizo|kanakuri|jepang|lazaro|francisco|54|68|18|1912|1920|1967|75|tertidur|hilang|hakone|ekiden|finis|legenda|audira|cepat|kembali|menyerah|meninggal)/i;
const CAP: CapWord[] = CLIPS.flatMap((c) => c.words.map((w) => ({ w: w.w, t: w.s, key: KEYS.test(w.w) })));

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [h] = useState(() => delayRender("ep11 fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => { chronicleFontsReady().then(() => { setOk(true); continueRender(h); }); }, [h]);
  const sc = sceneAt(t);
  return (
    <AbsoluteFill style={{ background: "#120a06", fontFamily: F_CAPTION }}>
      {ok && (
        <>
          <ShotCanvas key={sc.id} shot={handheld(lifted(sc.shot(t), sc.lift), t, { drift: 0.002, seed: 11 })} look={typeof sc.look === "function" ? sc.look(t) : sc.look} frame={frame}><sc.Set t={t} /></ShotCanvas>
          <Frame width={width} height={height}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(16,8,6,0.4) 0%, rgba(16,8,6,0.24) 55%, rgba(16,8,6,0) 100%)" }} />
            <NearLayer t={t - sc.at} kind={NEAR[sc.id]} />
            <Hud t={t} id={sc.id} aspect={width / height} />
            <Captions s={t} words={CAP} max={3} y={1300} end={VO_END + 0.1} />
            <InkCut t={t} cuts={Object.values(CUT)} />
          </Frame>
        </>
      )}
    </AbsoluteFill>
  );
};
