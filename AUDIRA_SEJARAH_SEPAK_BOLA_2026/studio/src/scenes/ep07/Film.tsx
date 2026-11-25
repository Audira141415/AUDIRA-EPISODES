// EP07 film "Piala Dunia Pertama, Uruguay 1930" (PAPERWORLD). Frame 0 = the approved cover.
// All beats come from timeline.json (locked VO). Audio is muxed separately by the lead; the AUDIRA
// outro card and signature are stacked by Root.tsx.
import React, { useLayoutEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, mixLight, type Light } from "../../kits/paperworld/render/Stage.tsx";
import { PaperCloud } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AFTERNOON, C, OUT_AX, OUT_BZ, World } from "./Cover.tsx";
import { CalSet, Confetti, Flag, FinalBalls, MapSet, PaperRain, PocitosSet, Scaffold, SeaSet, Trophy, quayFlagTime } from "./sets.tsx";
import { shotAt } from "./camera.ts";
import { CLIPS, CUTS, CUT_LIST, T, TOTAL, pop, seg, setAt, win, type Word } from "./timing.ts";

const DISPLAY = "EP07Anton, Impact, sans-serif";
const LABEL = "EP07Grotesk, 'Segoe UI', sans-serif";
const PAPER = "#faf4e8";
const CORAL = "#c4614f";

const RAIN: Light = {
  ...AFTERNOON,
  dir: [-0.3, 0.9, 0.3],
  key: "#d7dde8",
  keyI: 1.25,
  fill: "#b9c4d6",
  fillI: 0.7,
  sky: "#d3d8df",
  ground: "#8f8a80",
  hemiI: 1.05,
  bg: "#c6cbd2",
  exposure: 0.96,
};

const useFonts = () => {
  const [handle] = useState(() => delayRender("EP07 film fonts"));
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const faces = [
      new FontFace("EP07Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("EP07Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load()))
      .then((loaded) => loaded.forEach((ff) => (document.fonts as unknown as Set<FontFace>).add(ff)))
      .catch(() => undefined)
      .finally(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

/** HTML laid out in 1080x1920 units, scaled to the composition. */
const Px: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ---------- 3D ----------
const TOWER_AT: [number, number, number] = [OUT_AX * 0.62, 0, -OUT_BZ * 0.86];
const rainAmt = (t: number) => (t < CUTS.toBuild ? 0 : 1 - seg(t, T.baru - 0.2, T.baru + 0.5));
const build = (t: number) => (t < CUTS.toBuild ? 1 : 0.5 + 0.5 * seg(t, T.baru + 0.1, T.lima + 0.9));
const URU_FLAGS = [200, 228, 256, 284, 312, 340].map((deg, i) => {
  const a = (deg * Math.PI) / 180;
  const x = (6.6 + 2.6) * Math.cos(a);
  const z = (9.4 + 2.6) * Math.sin(a);
  return { x, z, yaw: Math.atan2(-x, -z) + Math.PI, i };
});

const StadiumExtras: React.FC<{ t: number }> = ({ t }) => {
  const late = t >= CUTS.toBuild;
  if (!late) return null;
  const rise = seg(t, T.juaraDunia - 0.25, T.juaraDunia + 0.9);
  return (
    <>
      <Scaffold show={1 - seg(t, T.lima + 0.4, T.lima + 1.0)} at={TOWER_AT} />
      {rise > 0 && <Trophy position={[0, -7.2 + rise * 7.2, -0.6]} scale={1.3} yaw={Math.sin(t * 0.6) * 0.35} glow={0.15 + 0.15 * rise} />}
      {URU_FLAGS.map((f) => (
        <Flag key={f.i} code="URU" w={3.2} h={2.1} pole={4} position={[f.x, 1.9, f.z]} yaw={f.yaw}
          t={pop(t, T.besoknya + f.i * 0.1, 0.4)} wave={Math.sin(t * 2.4 + f.i) * 0.14} />
      ))}
      {t > T.juaraDunia && <Confetti t={t} t0={T.juaraDunia} center={[0, 0, 0]} area={16} top={16} />}
    </>
  );
};

const Scene3D: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const set = setAt(t);
  const shot = shotAt(t);
  const r = set === "stadium" ? rainAmt(t) : 0;
  const base = mixLight(AFTERNOON, RAIN, r * 0.95);
  // depth pass (film only, never frame 0): paper haze toward the far set + a little more lens blur
  const dp = seg(t, 0.25, 1.4);
  const d = Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2]);
  const light: Light = dp > 0 ? { ...base, fog: { color: base.bg, near: d * (1.15 + (1 - dp) * 20), far: d * (3.6 + (1 - dp) * 60) } } : base;
  shot.aperture = shot.aperture * (1 + 1.6 * dp);
  shot.maxBlur = shot.maxBlur * (1 + 1.4 * dp);
  const center = t === 0 ? ([0, 0, -8] as [number, number, number]) : shot.target;
  return (
    <>
      <Stage shot={shot} light={light} frame={frame} center={frame === 0 ? [0, 0, -8] : center}>
        {set === "stadium" && (
          <>
            <World s={t} build={build(t)} towerRise={t < CUTS.toBuild ? 1 : 0.42 + 0.58 * seg(t, T.lima, T.lima + 0.9)}
              balls={t >= CUTS.toBuild ? <FinalBalls t={t} /> : undefined} extra={<StadiumExtras t={t} />} />
            {r > 0.01 && (
              <>
                <PaperRain t={t} amount={r} center={[0, 0, -8]} area={[60, 60]} top={28} />
                <PaperCloud w={16} color="#8f98a8" position={[-6, 24 + (1 - r) * 12, -18]} threadTo={30} />
                <PaperCloud w={13} color="#9aa3b2" position={[12, 22 + (1 - r) * 12, -10]} threadTo={30} />
                <PaperCloud w={12} color="#a3abb8" position={[-18, 20 + (1 - r) * 12, -4]} threadTo={30} />
              </>
            )}
          </>
        )}
        {set === "map" && <MapSet t={t} />}
        {set === "cal" && <CalSet t={t} />}
        {set === "sea" && <SeaSet t={t} />}
        {set === "pocitos" && <PocitosSet t={t} />}
      </Stage>
      <Finish frame={frame} background={light.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
    </>
  );
};

// ---------- hook title (identical to the cover at frame 0) ----------
const HookTitle: React.FC<{ t: number }> = ({ t }) => {
  const kick = 1 - seg(t, 2.2, 2.75);
  const out = seg(t, T.hookEnd - 0.55, T.hookEnd + 0.05);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, background: "linear-gradient(180deg, rgba(239,228,207,0.92) 0%, rgba(239,228,207,0.75) 24%, rgba(239,228,207,0) 38%)" }} />
      {kick > 0.001 && (
        <div style={{ position: "absolute", left: 72, top: 188, opacity: kick, padding: "8px 20px", borderRadius: 8, background: C.green, color: "#f7f1e4", fontFamily: LABEL, fontWeight: 700, fontSize: 32, letterSpacing: 5 }}>
          SEJARAH SEPAK BOLA #07
        </div>
      )}
      {out < 1 && (
        <div style={{ opacity: 1 - out, transform: `translateY(${-out * 50}px)` }}>
          <div style={{ position: "absolute", left: 66, top: 262, fontFamily: DISPLAY, color: C.ink, lineHeight: 0.95 }}>
            <div style={{ fontSize: 168 }}>PIALA DUNIA</div>
            <div style={{ fontSize: 168, color: C.celesteInk }}>PERTAMA</div>
          </div>
          <div style={{ position: "absolute", left: 60, top: 604, padding: "6px 16px", borderRadius: 8, background: "rgba(250,244,232,0.92)", boxShadow: "0 4px 14px rgba(60,40,20,0.18)", fontFamily: LABEL, fontWeight: 600, fontSize: 44, color: C.ink }}>
            1930 · 13 tim · <span style={{ color: C.green, fontWeight: 700 }}>final dengan dua bola</span>
          </div>
        </div>
      )}
    </>
  );
};

// ---------- HUD (paper cards, screen space) ----------
const Card: React.FC<{ o: number; title: string; sub?: string; top?: number; accent?: string; big?: number; children?: React.ReactNode }> = ({
  o,
  title,
  sub,
  top = 286,
  accent = C.ink,
  big = 86,
  children,
}) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 60, top, opacity: o, transform: `translateY(${(1 - o) * -24}px) rotate(${-0.6 + (1 - o) * -2}deg)`, transformOrigin: "0 0" }}>
      <div style={{ display: "inline-flex", alignItems: "stretch", background: PAPER, boxShadow: "0 10px 26px rgba(60,40,20,0.28), 0 2px 0 rgba(60,40,20,0.12)", borderRadius: 6 }}>
        <div style={{ width: 14, background: C.green, borderRadius: "6px 0 0 6px" }} />
        <div style={{ padding: "14px 30px 16px 22px" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: big, lineHeight: 1, color: accent, letterSpacing: 1 }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontFamily: LABEL, fontWeight: 600, fontSize: 38, color: C.ink }}>{sub}</div>}
          {children}
        </div>
      </div>
    </div>
  );

const FlagChip: React.FC<{ code: string; label: string; dim?: number; on?: number }> = ({ code, label, dim = 0, on = 0 }) => {
  const stripes: Record<string, [string, string[]]> = {
    FRA: ["90deg", ["#2f4f9a", "#f7f1e4", "#d6453b"]],
    BEL: ["90deg", ["#2b2622", "#f2c94c", "#d6453b"]],
    ROU: ["90deg", ["#2f4f9a", "#f2c94c", "#d6453b"]],
    YUG: ["180deg", ["#2f4f9a", "#f7f1e4", "#d6453b"]],
  };
  const [dir, cols] = stripes[code];
  const g = cols.map((c, i) => `${c} ${(i / cols.length) * 100}% ${((i + 1) / cols.length) * 100}%`).join(",");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - dim * 0.65, transform: `scale(${1 + on * 0.08})` }}>
      <div style={{ width: 96, height: 64, background: `linear-gradient(${dir}, ${g})`, boxShadow: on ? `0 0 0 5px ${C.green}` : "0 0 0 2px rgba(51,37,29,0.35)", borderRadius: 3 }} />
      <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 28, color: C.ink }}>{label}</div>
    </div>
  );
};

const Stamp: React.FC<{ t: number; a: number; b: number; text: string; top: number; color?: string }> = ({ t, a, b, text, top, color = CORAL }) => {
  const o = win(t, a, b, 0.1, 0.25);
  if (o <= 0.001) return null;
  const s = 1.3 - 0.3 * seg(t, a, a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `rotate(-5deg) scale(${s})`, background: "rgba(250,244,232,0.94)", padding: "10px 16px", borderRadius: 6, boxShadow: "0 10px 30px rgba(60,40,20,0.3)" }}>
        <div style={{ border: `7px solid ${color}`, padding: "4px 26px 8px", fontFamily: DISPLAY, fontSize: 96, lineHeight: 1, letterSpacing: 3, color }}>{text}</div>
      </div>
    </div>
  );
};

/** 1930-style manual scoreboard for the final. */
const Scoreboard: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.babak1 - 0.4, T.juaraDunia + 0.1, 0.3, 0.35);
  if (o <= 0.001) return null;
  let uru = 0, arg = 0;
  if (t >= T.duaSatu - 0.1) [uru, arg] = [1, 2];
  if (t >= T.uruBalik + 0.05) uru = 2;
  if (t >= T.uruBalik + 0.6) uru = 3;
  if (t >= T.empatDua - 0.05) uru = 4;
  const h2 = t >= T.babak2 - 0.1;
  const flip = (v: number, key: number) => (
    <div key={key} style={{ width: 120, height: 136, background: "#2f2620", color: PAPER, fontFamily: DISPLAY, fontSize: 118, lineHeight: "136px", textAlign: "center", borderRadius: 6, boxShadow: "inset 0 -68px 0 rgba(255,255,255,0.05)" }}>{v}</div>
  );
  const team = (name: string, col: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 70, height: 46, background: `linear-gradient(180deg, ${col})`, borderRadius: 3, boxShadow: "0 0 0 2px rgba(51,37,29,0.35)" }} />
      <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 32, color: C.ink, letterSpacing: 2 }}>{name}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 282, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: PAPER, borderRadius: 10, padding: "16px 30px 18px", boxShadow: "0 12px 30px rgba(60,40,20,0.3)", borderTop: `10px solid ${C.green}` }}>
        <div style={{ textAlign: "center", fontFamily: LABEL, fontWeight: 700, fontSize: 34, letterSpacing: 3, color: C.ink }}>
          {h2 ? "BABAK 2 · BOLA URUGUAY" : "BABAK 1 · BOLA ARGENTINA"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 12 }}>
          {team("URU", "#f7f1e4 0 22%, #4f97c8 22% 40%, #f7f1e4 40% 60%, #4f97c8 60% 78%, #f7f1e4 78%")}
          {flip(uru, 1)}
          <div style={{ fontFamily: DISPLAY, fontSize: 80, color: C.ink }}>–</div>
          {flip(arg, 2)}
          {team("ARG", "#86c6ea 0 33%, #f7f1e4 33% 66%, #86c6ea 66%")}
        </div>
      </div>
    </div>
  );
};

const QuayCount: React.FC<{ t: number }> = ({ t }) => {
  let n = 0;
  for (let i = 0; i < 13; i++) if (t >= quayFlagTime(i)) n = i + 1;
  return (
    <Card o={win(t, T.totalnya + 0.05, CUTS.toPocitos + 0.05, 0.25, 0.2)} title={`${n} TIM`} sub="tanpa babak kualifikasi" big={110} accent={C.celesteInk} />
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => {
  const four = win(t, T.akhirnya, T.kapal + 0.1, 0.3, 0.3);
  const board = [T.prancis, T.belgia, T.rumania];
  return (
    <>
      {/* KONTEKS */}
      <Card o={win(t, T.tahun + 0.1, T.alasan - 0.05, 0.3, 0.25)} title="URUGUAY · 1930" sub="tuan rumah Piala Dunia pertama" />
      <Card o={win(t, T.alasan, T.juara - 0.05, 0.2, 0.2)} title="2 ALASAN" sub="kenapa Uruguay?" />
      <Card o={win(t, T.juara, T.dan2 - 0.05, 0.3, 0.3)} title="JUARA OLIMPIADE" sub="sepak bola · 1924 & 1928" accent="#a8781f" />
      <Card o={win(t, T.dan2 + 0.1, CUTS.toCal + 0.05, 0.3, 0.2)} title="100 TAHUN" sub="konstitusi pertama · 1830 → 1930" big={112} accent={C.celesteInk} />
      {/* PENGEMBANGAN */}
      <Card o={win(t, T.masalah + 0.1, CUTS.toSea + 0.05, 0.3, 0.2)} title="2 BULAN SEBELUM" sub="kick-off: 13 Juli 1930" />
      <Stamp t={t} a={T.eropa - 0.1} b={CUTS.toSea} text="0 TIM EROPA" top={1050} />
      <Card o={win(t, T.perjalanan, T.akhirnya - 0.05, 0.3, 0.25)} title="±2 MINGGU" sub="naik kapal ke Montevideo" big={104} />
      {four > 0.001 && (
        <Card o={four} title={t < T.prancis ? "4 TIM EROPA" : "SATU KAPAL"} sub={t < T.prancis ? "yang akhirnya datang" : "Prancis · Belgia · Rumania"}>
          <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
            {(["FRA", "BEL", "ROU", "YUG"] as const).map((c, i) => (
              <FlagChip key={c} code={c} label={["PRANCIS", "BELGIA", "RUMANIA", "YUGOSLAVIA"][i]} on={i < 3 ? seg(t, board[i], board[i] + 0.2) : 0} dim={i === 3 ? seg(t, T.prancis, T.prancis + 0.3) : 0} />
            ))}
          </div>
        </Card>
      )}
      <Card o={win(t, T.kapal + 0.25, T.bersama - 0.05, 0.25, 0.2)} title="CONTE VERDE" sub="kapal yang sama · ±2 minggu di laut" />
      <Card o={win(t, T.bersama, T.totalnya - 0.05, 0.25, 0.25)} title="JULES RIMET" sub="presiden FIFA · membawa trofi" />
      <QuayCount t={t} />
      {/* PENJELASAN */}
      <Card o={win(t, T.juli13 + 0.1, T.lucien - 0.05, 0.3, 0.2)} title="13 JULI 1930" sub="hari pertama Piala Dunia" />
      <Card o={win(t, T.lucien, T.menit - 0.05, 0.25, 0.2)} title="LUCIEN LAURENT" sub="Prancis · gol pertama Piala Dunia" accent="#2f4f9a" />
      <Card o={win(t, T.menit, CUTS.toBuild + 0.05, 0.25, 0.2)} title="MENIT 19'" sub="Prancis vs Meksiko" big={112} accent="#2f4f9a" />
      <Card o={win(t, T.stadion, T.baru - 0.05, 0.3, 0.25)} title="ESTADIO CENTENARIO" sub="belum selesai · tertunda hujan" big={78} />
      <Card o={win(t, T.baru, T.tepat - 0.05, 0.25, 0.2)} title="+5 HARI" sub="baru dipakai 18 Juli 1930" big={110} accent={C.green} />
      <Card o={win(t, T.tepat, T.final - 0.05, 0.25, 0.25)} title="18 JULI 1930" sub="tepat 100 tahun konstitusi" accent={C.celesteInk} />
      {/* PAYOFF */}
      <Card o={win(t, T.final + 0.05, T.uru - 0.05, 0.25, 0.2)} title="FINAL · 30 JULI 1930" big={80} />
      <Card o={win(t, T.uru, T.kedua - 0.05, 0.25, 0.2)} title="URUGUAY vs ARGENTINA" big={78} accent={C.celesteInk} />
      <Card o={win(t, T.kedua, T.babak1 - 0.45, 0.25, 0.2)} title="BOLA SIAPA?" sub="dua tim, dua bola berbeda" />
      <Scoreboard t={t} />
      <Card o={win(t, T.juaraDunia + 0.05, T.besoknya - 0.05, 0.25, 0.2)} title="JUARA DUNIA PERTAMA" sub="Uruguay 4–2 Argentina" big={80} accent="#a8781f" />
      <Card o={win(t, T.besoknya, T.audira - 0.05, 0.25, 0.25)} title="31 JULI · LIBUR" sub="libur nasional di seluruh Uruguay" big={86} accent={C.celesteInk} />
      {/* OUTRO */}
      <Card o={win(t, T.audira, T.berikut - 0.05, 0.3, 0.25)} title="AUDIRA" sub="Sejarah Sepak Bola" big={110} accent={C.green} />
      <Card o={win(t, T.berikut, T.outroCard + 0.2, 0.3, 0.3)} title="BERIKUTNYA" sub="Maracanazo · Brasil 1950" />
    </>
  );
};

// ---------- karaoke captions: paper tape, celeste highlighter ----------
type Group = { words: Word[]; start: number; end: number };
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const c of CLIPS) {
    const chunks: Word[][] = [];
    let cur: Word[] = [];
    for (const w of c.words) {
      cur.push(w);
      if (/[.,?!:;]$/.test(w.w)) {
        chunks.push(cur);
        cur = [];
      }
    }
    if (cur.length) chunks.push(cur);
    const merged: Word[][] = [];
    for (let i = 0; i < chunks.length; i++) {
      const ch = chunks[i];
      if (ch.length === 1 && i + 1 < chunks.length) {
        chunks[i + 1] = [...ch, ...chunks[i + 1]];
        continue;
      }
      if (ch.length === 1 && merged.length) {
        merged[merged.length - 1] = [...merged[merged.length - 1], ...ch];
        continue;
      }
      merged.push(ch);
    }
    for (const ch of merged) {
      const n = Math.ceil(ch.length / 7);
      const size = Math.ceil(ch.length / n);
      for (let i = 0; i < ch.length; i += size) {
        let part = ch.slice(i, i + size);
        if (ch.length - (i + size) === 1) {
          part = ch.slice(i);
          i = ch.length;
        }
        out.push({ words: part, start: part[0].s, end: part[part.length - 1].e });
      }
    }
  }
  for (let i = 0; i < out.length; i++) out[i].end = Math.min(out[i].end + 0.35, out[i + 1]?.start ?? out[i].end + 0.35);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const g = GROUPS.find((x) => t >= x.start - 0.05 && t < x.end);
  if (!g || t > T.outroCard || t < 1 / 30) return null;
  const n = g.words.length;
  const lines = n <= 4 ? [g.words] : [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))];
  const o = seg(t, g.start - 0.05, g.start + 0.08);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 1296, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: o }}>
      {lines.map((ln, li) => {
        const chars = ln.reduce((a, w) => a + w.w.length, 0) + ln.length - 1;
        const fs = Math.min(56, Math.floor((56 * 27) / Math.max(27, chars)));
        return (
        <div key={li} style={{ display: "flex", gap: 26, background: "rgba(250,244,232,0.95)", padding: "6px 24px 10px", borderRadius: 4, boxShadow: "0 6px 18px rgba(60,40,20,0.25)", transform: `rotate(${li ? 0.5 : -0.5}deg)` }}>
          {ln.map((w, wi) => {
            const active = t >= w.s && t < w.e + 0.05;
            const said = t >= w.s;
            const b = active ? 1 + 0.04 * (1 - seg(t, w.s, w.s + 0.18)) : 1;
            return (
              <span key={wi} style={{ fontFamily: LABEL, fontWeight: 700, fontSize: fs, lineHeight: 1.15, color: said ? C.ink : "rgba(51,37,29,0.45)", background: active ? C.celeste : "transparent", borderRadius: 6, padding: "0 4px", margin: "0 -4px", transform: `scale(${b})`, display: "inline-block" }}>
                {w.w}
              </span>
            );
          })}
        </div>
        );
      })}
    </div>
  );
};

// ---------- paper-sheet wipe that hides each set change ----------
const TORN_L = Array.from({ length: 26 }, (_, i) => `${(i % 2 ? 2.2 : 0) + ((i * 37) % 5) * 0.4}% ${(i / 25) * 100}%`);
const TORN_R = Array.from({ length: 26 }, (_, i) => `${97.8 - (i % 2 ? 2.2 : 0) - ((i * 53) % 5) * 0.4}% ${100 - (i / 25) * 100}%`);
const Wipe: React.FC<{ t: number }> = ({ t }) => {
  const c = CUT_LIST.find((x) => Math.abs(t - x) < 0.32);
  if (c === undefined) return null;
  const p = (t - (c - 0.3)) / 0.6;
  if (p <= 0 || p >= 1) return null;
  const left = 1080 - p * (1080 + 1600);
  return (
    <div style={{ position: "absolute", left, top: -200, width: 1600, height: 2320, transform: "rotate(-4deg)", filter: "drop-shadow(-18px 0 22px rgba(60,40,20,0.35)) drop-shadow(18px 0 22px rgba(60,40,20,0.35))" }}>
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${[...TORN_L, ...TORN_R].join(",")})`, background: "repeating-linear-gradient(90deg, #f3ead9 0 7px, #efe5d2 7px 9px), #f3ead9" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: DISPLAY, fontSize: 120, color: "rgba(51,37,29,0.08)", letterSpacing: 20 }}>1930</div>
      </div>
    </div>
  );
};

export const TOTAL_SECONDS = TOTAL;

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ready = useFonts();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: AFTERNOON.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 36, position: [0, 46, 64] }}>
        <Scene3D t={t} frame={frame} />
      </ThreeCanvas>
      {ready && (
        <Px>
          {/* soft paper gradient under the HUD after the hook */}
          <div style={{ position: "absolute", inset: 0, opacity: seg(t, T.hookEnd - 0.3, T.hookEnd + 0.2) * (t > T.outroCard ? 0 : 1), background: "linear-gradient(180deg, rgba(239,228,207,0.55) 0%, rgba(239,228,207,0.25) 22%, rgba(239,228,207,0) 34%)" }} />
          {/* value contrast: warm paper vignette keeps the subject lane brighter than the rim */}
          <div style={{ position: "absolute", inset: 0, opacity: seg(t, 0.3, 1.2) * (t > T.outroCard ? 0 : 1), background: "radial-gradient(ellipse 72% 48% at 50% 47%, rgba(60,40,24,0) 52%, rgba(60,40,24,0.34) 100%)" }} />
          <HookTitle t={t} />
          <HUD t={t} />
          <Captions t={t} />
          <Wipe t={t} />
        </Px>
      )}
    </AbsoluteFill>
  );
};
