// EP10 film "Jerman 7–1 Brasil 2014" (CHAINREACTION): a maker's goal machine on a pitch-felt
// workshop table + screen-space workshop tags + karaoke captions. All beats from timeline.json.
// Audio is muxed separately by the lead; the AUDIRA outro card + signature come from Root.tsx.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, BG, CAM_POS, FOV, OSWALD, PITCH, YELLOW } from "./Cover.tsx";
import { FilmScene, GOALS } from "./FilmScene.tsx";
import { CLIPS, T, TOTAL, seg, win, pop, lin, type Word } from "./timing.ts";

const CREAM = "#FFF4E6";
const ORANGE = "#F3A712";
const RED = "#E4572E";
const INK = "#17110D";
const WHITE_TEAM = "#F4F1EA";

/** Lay HTML out in 1080x1920 units, scaled to the composition size. */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ---------- hook: the cover overlay, identical at frame 0 ----------
const HookTitle: React.FC<{ t: number }> = ({ t }) => {
  const out = seg(t, 1.95, 2.45);
  const grad = 1 - out;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: grad,
          background:
            "linear-gradient(180deg, rgba(23,17,13,0.92) 0%, rgba(23,17,13,0.78) 24%, rgba(23,17,13,0.0) 36%, rgba(23,17,13,0) 70%, rgba(23,17,13,0.55) 100%)",
        }}
      />
      {out < 1 && (
        <div style={{ opacity: 1 - out, transform: `translateY(${-out * 50}px)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 34, letterSpacing: 7, color: PITCH }}>
            SEJARAH SEPAK BOLA #10
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 242, textAlign: "center", fontFamily: ANTON, lineHeight: 1.0, textShadow: "0 6px 26px rgba(0,0,0,0.75)" }}>
            <div style={{ fontSize: 116, color: CREAM, letterSpacing: 1 }}>4 GOL DALAM</div>
            <div style={{ fontSize: 158, color: YELLOW, letterSpacing: 2, marginTop: 2 }}>6 MENIT</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 524, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 36, letterSpacing: 6, color: CREAM, textShadow: "0 3px 12px rgba(0,0,0,0.8)" }}>
            SEMIFINAL PIALA DUNIA 2014
          </div>
        </div>
      )}
    </>
  );
};

/** Stopwatch tag: 23' -> 29' sweeps once ("enam menit"), then the "4 gol" tally pops. */
const Stopwatch: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.enam - 0.05, 2.45, 0.2, 0.35);
  if (o <= 0.001) return null;
  const u = seg(t, T.enam, T.kandang + 0.2);
  const minute = Math.round(23 + 6 * u);
  const ang = -90 + 360 * u;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 610, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "rgba(23,17,13,0.86)", border: `4px solid ${ORANGE}`, borderRadius: 18, padding: "12px 28px", transform: `scale(${0.9 + 0.1 * pop(t, T.enam, 0.3)})` }}>
        <svg width={96} height={96} viewBox="-50 -50 100 100">
          <circle r={44} fill="none" stroke={CREAM} strokeWidth={7} />
          <rect x={-7} y={-56} width={14} height={9} fill={CREAM} />
          <path d={`M0 0 L0 -44 A44 44 0 ${u > 0.5 ? 1 : 0} 1 ${44 * Math.cos((ang * Math.PI) / 180)} ${44 * Math.sin((ang * Math.PI) / 180)} Z`} fill={ORANGE} opacity={0.85} />
          <line x1={0} y1={0} x2={38 * Math.cos((ang * Math.PI) / 180)} y2={38 * Math.sin((ang * Math.PI) / 180)} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: ANTON, fontSize: 84, lineHeight: 1, color: CREAM }}>
          23'<span style={{ color: ORANGE }}> → </span>
          {minute}'
        </div>
      </div>
    </div>
  );
};

// ---------- workshop tags (HUD) ----------
/** Name card: hanging workshop tag. Minute badge + name + team line. */
const Card: React.FC<{ o: number; title: string; sub?: string; badge?: string; top?: number; color?: string; big?: number; note?: string }> = ({
  o, title, sub, badge, top = 300, color = WHITE_TEAM, big = 74, note,
}) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 56, top, opacity: o, transform: `translateX(${(1 - o) * -46}px) rotate(${(1 - o) * -3}deg)`, transformOrigin: "0 0" }}>
      <div style={{ display: "flex", alignItems: "stretch", background: "rgba(23,17,13,0.9)", borderRadius: 14, boxShadow: "0 14px 40px rgba(0,0,0,0.55)", overflow: "hidden", maxWidth: 640 }}>
        <div style={{ width: 16, background: color }} />
        {badge && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 22px", background: ORANGE, fontFamily: ANTON, fontSize: 70, color: INK, lineHeight: 1 }}>{badge}</div>
        )}
        <div style={{ padding: "14px 26px 18px" }}>
          <div style={{ fontFamily: ANTON, fontSize: big, lineHeight: 1.02, color: CREAM, letterSpacing: 1 }}>{title}</div>
          {sub && <div style={{ marginTop: 6, fontFamily: OSWALD, fontWeight: 600, fontSize: 38, color: PITCH, letterSpacing: 1 }}>{sub}</div>}
          {note && <div style={{ marginTop: 6, fontFamily: OSWALD, fontWeight: 500, fontSize: 36, color: CREAM }}>{note}</div>}
        </div>
      </div>
    </div>
  );
/** Stamp plate in screen space, above the caption band. */
const Stamp: React.FC<{ t: number; a: number; b: number; text: string; sub?: string; top?: number; color?: string }> = ({ t, a, b, text, sub, top = 1040, color = ORANGE }) => {
  const o = win(t, a, b, 0.12, 0.3);
  if (o <= 0.001) return null;
  const s = 1.22 - 0.22 * seg(t, a, a + 0.18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(23,17,13,0.9)", padding: "14px 30px 18px", borderRadius: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", transform: `rotate(-3deg) scale(${s})`, border: `6px solid ${color}`, textAlign: "center" }}>
        <div style={{ fontFamily: ANTON, fontSize: 96, lineHeight: 1, letterSpacing: 2, color }}>{text}</div>
        {sub && <div style={{ marginTop: 8, fontFamily: OSWALD, fontWeight: 600, fontSize: 40, color: CREAM, letterSpacing: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Score bug top-right during the match machine: JER x – y BRA + last goal minute. */
const ScoreBug: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.m11 - 0.1, 42.15, 0.3, 0.25);
  if (o <= 0.001) return null;
  let ger = 0, min = 0, last = -9;
  for (const g of GOALS)
    if (t >= g.t + 0.45) {
      ger++;
      min = g.m;
      last = g.t + 0.45;
    }
  const bra = t >= T.oscar + 0.55 ? 1 : 0;
  if (bra) {
    min = 90;
    last = Math.max(last, T.oscar + 0.55);
  }
  const p = 1 + 0.08 * (1 - seg(t, last, last + 0.35)) * (t - last < 0.35 ? 1 : 0);
  return (
    <div style={{ position: "absolute", right: 56, top: 300, opacity: o, transform: `scale(${p})`, transformOrigin: "100% 0" }}>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(23,17,13,0.9)", borderRadius: 12, overflow: "hidden", border: `3px solid ${PITCH}` }}>
        <div style={{ padding: "8px 16px", background: WHITE_TEAM, fontFamily: ANTON, fontSize: 46, color: INK }}>JER</div>
        <div style={{ padding: "4px 18px", fontFamily: ANTON, fontSize: 64, color: CREAM, lineHeight: 1 }}>
          {ger}–{bra}
        </div>
        <div style={{ padding: "8px 16px", background: YELLOW, fontFamily: ANTON, fontSize: 46, color: "#0E5F2C" }}>BRA</div>
      </div>
      <div style={{ marginTop: 8, textAlign: "right", fontFamily: OSWALD, fontWeight: 600, fontSize: 36, color: ORANGE, letterSpacing: 2 }}>{min ? `MENIT ${min}'` : "SEMIFINAL"}</div>
    </div>
  );
};

/** Statistics irony panel (set D). */
const Stats: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.menguasai - 0.1, T.jelEnd + 0.1, 0.3, 0.3);
  if (o <= 0.001) return null;
  const pb = seg(t, T.menguasai, T.p52 + 0.4);
  const sb = seg(t, T.menembak, T.s18 + 0.4);
  const sw = seg(t, T.s14 - 0.4, T.s14 + 0.3);
  const bar = (label: string, a: number, b: number, pa: number, pb2: number, fmt: (n: number) => string, max: number) => (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 36, color: CREAM, letterSpacing: 3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
        <div style={{ width: 92, fontFamily: ANTON, fontSize: 40, color: YELLOW }}>BRA</div>
        <div style={{ height: 44, width: (560 * a * pa) / max, background: YELLOW, borderRadius: 6 }} />
        <div style={{ fontFamily: ANTON, fontSize: 58, lineHeight: 1, color: YELLOW, opacity: pa }}>{fmt(Math.round(a * pa))}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
        <div style={{ width: 92, fontFamily: ANTON, fontSize: 40, color: WHITE_TEAM }}>JER</div>
        <div style={{ height: 44, width: (560 * b * pb2) / max, background: WHITE_TEAM, borderRadius: 6 }} />
        <div style={{ fontFamily: ANTON, fontSize: 58, lineHeight: 1, color: WHITE_TEAM, opacity: pb2 }}>{fmt(Math.round(b * pb2))}</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 56, top: 300, width: 968, opacity: o }}>
      <div style={{ background: "rgba(23,17,13,0.88)", borderRadius: 14, padding: "18px 30px 24px", borderLeft: `14px solid ${PITCH}` }}>
        <div style={{ fontFamily: ANTON, fontSize: 64, lineHeight: 1, color: ORANGE }}>ANEHNYA…</div>
        {pb > 0.001 && bar("PENGUASAAN BOLA", 52, 48, pb, pb, (n) => `${n}%`, 52)}
        {sb > 0.001 && bar("TEMBAKAN", 18, 14, sb, sw, (n) => `${n}`, 18)}
      </div>
    </div>
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Stopwatch t={t} />
    <ScoreBug t={t} />
    {/* konteks */}
    <Card o={win(t, T.semifinal + 0.05, T.tuan - 0.05)} title="SEMIFINAL PIALA DUNIA" sub="8 Juli 2014 · Belo Horizonte" color={PITCH} big={66} />
    <Card o={win(t, T.tuan, T.neymar - 0.05, 0.3, 0.2)} title="BRASIL · TUAN RUMAH" sub="2 slot susunan kosong" color={YELLOW} big={66} />
    <Card o={win(t, T.neymar, T.kontEnd + 0.1, 0.25, 0.3)} title="NEYMAR — CEDERA" sub="retak tulang belakang" color={RED} big={62} />
    <Card o={win(t, T.thiago, T.kontEnd + 0.1, 0.25, 0.3)} top={470} title="THIAGO SILVA (KAPTEN)" sub="akumulasi kartu kuning" color={ORANGE} big={56} />
    {/* pengembangan: one card per scorer */}
    <Card o={win(t, T.muller - 0.1, T.m23 - 0.05)} badge="11'" title="THOMAS MÜLLER" sub="JERMAN · gol pembuka" />
    <Card o={win(t, T.klose - 0.1, T.m24 - 0.05)} badge="23'" title="MIROSLAV KLOSE" sub="JERMAN" note="gol Piala Dunia ke-16" />
    <Stamp t={t} a={T.rekor} b={T.m24 - 0.1} text="REKOR" sub="16 gol · sepanjang masa" />
    <Card o={win(t, T.m24 - 0.05, T.m29 - 0.05)} badge={t < T.m26 ? "24'" : "26'"} title="TONI KROOS" sub="JERMAN · 24' & 26'" />
    <Stamp t={t} a={T.berselang} b={T.m29 - 0.1} text="< 70 DETIK" sub="dua gol Kroos" />
    <Card o={win(t, T.m29 - 0.05, T.limaNol + 0.4)} badge="29'" title="SAMI KHEDIRA" sub="JERMAN" />
    <Stamp t={t} a={T.limaNol} b={T.empatGol - 0.1} text="5–0" sub="sebelum 30 menit" />
    <Stamp t={t} a={T.empatGol + 0.1} b={T.pengEnd + 0.1} text="4 GOL · 6 MENIT" sub="tercepat di Piala Dunia" color={PITCH} />
    {/* penjelasan */}
    <Card o={win(t, T.babak2, T.schurrle - 0.05)} title="BABAK KEDUA" sub="skor masih 5–0" color={PITCH} big={66} />
    <Card o={win(t, T.schurrle - 0.05, T.oscar - 0.05)} badge={t < T.duaGol + 0.45 ? "69'" : "79'"} title="ANDRÉ SCHÜRRLE" sub="JERMAN · pemain pengganti" note="69' & 79'" />
    <Card o={win(t, T.oscar - 0.05, T.tujuhSatu)} badge="90'" title="OSCAR" sub="BRASIL · gol balasan" color={YELLOW} />
    <Stamp t={t} a={T.tujuhSatu} b={42.2} text="7–1" sub="JERMAN · BRASIL" top={1000} />
    <Stats t={t} />
    <Stamp t={t} a={T.s14 + 0.25} b={T.jelEnd + 0.1} text="TETAP KALAH 1–7" color={RED} top={1060} />
    {/* payoff */}
    <Stamp t={t} a={T.memutus + 0.05} b={T.n62 - 0.05} text="PUTUS" color={RED} top={1060} />
    <Card o={win(t, T.n62, T.orang - 0.1)} title="62 LAGA KANDANG RESMI" sub="tanpa kalah · sejak 1975" note="berakhir 8 Juli 2014" color={YELLOW} big={60} />
    <Card o={win(t, T.mineirazo - 0.05, T.limaHari - 0.1)} title="MINEIRAZO" sub="luka baru · 2014" color={YELLOW} big={80} />
    <Card o={win(t, T.maracanazo - 0.1, T.limaHari - 0.1)} top={500} title="MARACANAZO" sub="bayangan lama · 1950" color="#9BC7FF" big={64} />
    <Card o={win(t, T.limaHari - 0.05, T.satuNol - 0.05)} title="5 HARI KEMUDIAN" sub="Final · 13 Juli 2014" color={PITCH} big={66} />
    <Card o={win(t, T.satuNol - 0.05, T.gotze - 0.05)} title="JERMAN 1–0 ARGENTINA" sub="JUARA DUNIA" color={PITCH} big={62} />
    <Card o={win(t, T.gotze - 0.05, T.payEnd + 0.2)} badge="113'" title="MARIO GÖTZE" sub="JERMAN · gol penentu final" />
    {/* outro */}
    <Card o={win(t, T.audira - 0.1, T.berikut - 0.05)} title="AUDIRA" sub="Sejarah Sepak Bola" color={PITCH} big={84} />
    <Card o={win(t, T.berikut, T.outroCard + 0.2)} title="BERIKUTNYA" sub="Cuju · sepak bola kuno Tiongkok" color={ORANGE} big={66} />
  </>
);

// ---------- karaoke captions: masking-tape strips, active word on an orange swatch ----------
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
      const n = Math.ceil(ch.length / 8);
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
  if (!g || t > T.outroCard) return null;
  const n = g.words.length;
  const lines = n <= 4 ? [g.words] : [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))];
  const o = seg(t, g.start - 0.05, g.start + 0.08);
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: o }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 30, background: "rgba(241,233,218,0.95)", padding: "6px 24px 10px", borderRadius: 4, transform: `rotate(${li ? 0.6 : -0.6}deg)`, boxShadow: "0 8px 22px rgba(0,0,0,0.45)" }}>
          {ln.map((w, wi) => {
            const active = t >= w.s && t < w.e + 0.05;
            const said = t >= w.s;
            const b = active ? 1 + 0.04 * (1 - seg(t, w.s, w.s + 0.18)) : 1;
            return (
              <span
                key={wi}
                style={{
                  fontFamily: ANTON,
                  fontSize: 58,
                  lineHeight: 1.15,
                  letterSpacing: 1,
                  color: active ? INK : said ? INK : "rgba(23,17,13,0.45)",
                  background: active ? ORANGE : "transparent",
                  borderRadius: 6,
                  padding: "0 6px",
                  margin: "0 -6px",
                  transform: `scale(${b})`,
                  display: "inline-block",
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const TOTAL_SECONDS = TOTAL;

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: FOV, near: 0.05, far: 40 }}>
        <FilmScene t={t} />
      </ThreeCanvas>
      <Stage>
        {/* after the hook: soft top + bottom shade so tags and captions read */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: seg(t, 1.95, 2.45) * (1 - 0.6 * lin(t, T.payEnd, T.payEnd + 1)),
            background:
              "linear-gradient(180deg, rgba(23,17,13,0.72) 0%, rgba(23,17,13,0.3) 22%, rgba(23,17,13,0) 34%, rgba(23,17,13,0) 60%, rgba(23,17,13,0.45) 80%, rgba(23,17,13,0.65) 100%)",
          }}
        />
        <HookTitle t={t} />
        <HUD t={t} />
        <Captions t={t} />
      </Stage>
    </AbsoluteFill>
  );
};
