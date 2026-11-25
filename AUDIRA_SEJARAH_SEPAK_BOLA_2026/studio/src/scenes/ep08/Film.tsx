// EP08 film "Maracanazo 1950" (FILMNOIR): cover stadium + stage props + interrogation room, screen-space HUD,
// venetian-blind wipes and karaoke captions. All beats come from timeline.json (locked VO); audio is muxed by the lead.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CAM_POS, useFonts } from "./Cover.tsx";
import { PAL } from "./coverTextures.ts";
import { FilmScene, SHIRT_YELLOW, URUGUAY } from "./FilmScene.tsx";
import { CLIPS, CUT, T, TOTAL, pop, seg, win, type Word } from "./timing.ts";

const CREAM = PAL.paper;
const GREEN = PAL.pitch;
const ANTON = "EP08Anton, Impact, sans-serif";
const GROT = "EP08Grotesk, 'Segoe UI', sans-serif";
const SERIF = "EP08Serif, Georgia, serif";

/** Lay HTML out in 1080x1920 units, scaled to the composition size. */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ---------- hook title: identical to the cover overlay at frame 0 ----------
const HookTitle: React.FC<{ t: number }> = ({ t }) => {
  const out = seg(t, 1.75, 2.15);
  const grad = 1 - seg(t, 1.9, 3.0) * 0.55;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: grad,
          background: "linear-gradient(180deg, rgba(6,7,9,0.9) 0%, rgba(6,7,9,0.62) 18%, rgba(6,7,9,0) 31%, rgba(6,7,9,0) 72%, rgba(6,7,9,0.55) 100%)",
        }}
      />
      {out < 1 && (
        <div style={{ opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
          <div style={{ position: "absolute", left: 72, top: 196, fontFamily: GROT, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: GREEN }}>● SEJARAH SEPAK BOLA #08</div>
          <div style={{ position: "absolute", left: 66, top: 252, fontFamily: ANTON, color: CREAM, lineHeight: 0.98, textShadow: "0 6px 26px rgba(0,0,0,0.7)" }}>
            <div style={{ fontSize: 112, letterSpacing: 2, opacity: 0.92 }}>HAMPIR 200 RIBU</div>
            <div style={{ fontSize: 156, letterSpacing: 1 }}>ORANG TERDIAM</div>
          </div>
          <div style={{ position: "absolute", left: 74, top: 556, fontFamily: SERIF, fontSize: 56, color: "rgba(237,233,225,0.88)" }}>Maracanazo, 1950</div>
        </div>
      )}
    </>
  );
};

// ---------- HUD pieces (one subject at a time, top safe zone, y >= 290) ----------
const Chip: React.FC<{ o: number; title: React.ReactNode; sub?: React.ReactNode; top?: number; accent?: string; big?: number; swatch?: string }> = ({ o, title, sub, top = 300, accent = CREAM, big = 84, swatch }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 64, top, opacity: o, transform: `translateX(${(1 - o) * -36}px)` }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 20, background: "rgba(6,7,9,0.74)", padding: "16px 30px 18px 0", borderTop: "2px solid rgba(237,233,225,0.35)", borderBottom: "2px solid rgba(237,233,225,0.35)" }}>
        <div style={{ width: 10, background: GREEN }} />
        {swatch && <div style={{ width: 34, alignSelf: "center", height: 46, background: swatch, border: "3px solid #0b0c0e", boxShadow: "0 0 0 2px rgba(237,233,225,0.6)" }} />}
        <div>
          <div style={{ fontFamily: ANTON, fontSize: big, lineHeight: 1.02, color: accent, letterSpacing: 1.5 }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontFamily: GROT, fontWeight: 600, fontSize: 38, color: CREAM, opacity: 0.92 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );

/** Rubber stamp in screen space. */
const Stamp: React.FC<{ t: number; a: number; b: number; text: string; top?: number; color?: string; size?: number }> = ({ t, a, b, text, top = 640, color = CREAM, size = 116 }) => {
  const o = win(t, a, b, 0.1, 0.3);
  if (o <= 0.001) return null;
  const s = 1.22 - 0.22 * seg(t, a, a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(6,7,9,0.82)", padding: "16px 26px", transform: `rotate(-4deg) scale(${s})`, boxShadow: "0 14px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ border: `8px solid ${color}`, padding: "2px 30px 6px", fontFamily: ANTON, fontSize: size, lineHeight: 1.05, letterSpacing: 4, color }}>{text}</div>
      </div>
    </div>
  );
};

const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

const Counter: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.n173 - 0.15, T.penonton + 0.6, 0.25, 0.3);
  const o2 = win(t, T.hampir2 - 0.2, CUT.clock + 0.05, 0.25, 0.2);
  const n = 173850 * seg(t, T.n173, T.n173 + 1.25);
  return (
    <>
      {o > 0.001 && (
        <div style={{ position: "absolute", left: 64, top: 300, opacity: o, background: "rgba(6,7,9,0.74)", padding: "14px 30px 18px", borderLeft: `10px solid ${GREEN}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 34, letterSpacing: 5, color: GREEN }}>TIKET RESMI TERJUAL</div>
          <div style={{ fontFamily: ANTON, fontSize: 168, lineHeight: 1, color: CREAM, letterSpacing: 2 }}>{fmt(n)}</div>
        </div>
      )}
      {o2 > 0.001 && (
        <div style={{ position: "absolute", left: 64, top: 300, opacity: o2, background: "rgba(6,7,9,0.74)", padding: "14px 30px 18px", borderLeft: `10px solid ${GREEN}`, transform: `scale(${0.94 + 0.06 * pop(t, T.hampir2 - 0.2)})`, transformOrigin: "0 0" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 34, letterSpacing: 5, color: GREEN }}>YANG HADIR · PERKIRAAN</div>
          <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: CREAM }}>± 200 RIBU</div>
          <div style={{ fontFamily: GROT, fontWeight: 600, fontSize: 36, color: CREAM, opacity: 0.85, marginTop: 6 }}>resmi tetap 173.850 tiket</div>
        </div>
      )}
    </>
  );
};

const Results: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.menghajar - 0.2, CUT.ticket + 0.05, 0.25, 0.2);
  if (o <= 0.001) return null;
  const row = (a: number, txt: string, opp: string) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 22, opacity: seg(t, a - 0.15, a + 0.15), transform: `translateX(${(1 - seg(t, a - 0.15, a + 0.2)) * -30}px)` }}>
      <div style={{ fontFamily: ANTON, fontSize: 120, lineHeight: 1.02, color: CREAM }}>{txt}</div>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 46, color: CREAM }}>{opp}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 64, top: 300, opacity: o, background: "rgba(6,7,9,0.74)", padding: "14px 34px 18px", borderLeft: `10px solid ${GREEN}` }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 34, letterSpacing: 5, color: GREEN }}>BRASIL BARU SAJA MENANG</div>
      {row(T.swedia, "7–1", "atas Swedia")}
      {row(T.spanyol, "6–1", "atas Spanyol")}
    </div>
  );
};

const Minute: React.FC<{ t: number; a: number; b: number; m: string }> = ({ t, a, b, m }) => {
  const o = win(t, a, b, 0.15, 0.25);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", right: 64, top: 300, opacity: o, transform: `scale(${0.9 + 0.1 * pop(t, a)})`, transformOrigin: "100% 0", background: GREEN, padding: "4px 26px 10px" }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: "#06140b" }}>MENIT</div>
      <div style={{ fontFamily: ANTON, fontSize: 132, lineHeight: 0.95, color: "#06140b" }}>{m}</div>
    </div>
  );
};

const Years: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.hukuman - 0.1, T.baju - 0.15, 0.25, 0.25);
  if (o <= 0.001) return null;
  const col = (a: number, n: string, label: string, color: string, strike = false) => (
    <div style={{ opacity: seg(t, a - 0.1, a + 0.2), transform: `scale(${0.9 + 0.1 * pop(t, a - 0.1)})`, transformOrigin: "50% 100%", textAlign: "center", width: 380 }}>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 0.95, color, textDecoration: strike ? "none" : "none" }}>{n}</div>
      <div style={{ fontFamily: ANTON, fontSize: 54, color, letterSpacing: 3 }}>TAHUN</div>
      <div style={{ fontFamily: GROT, fontWeight: 600, fontSize: 36, color: CREAM, marginTop: 6, lineHeight: 1.15 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 290, opacity: o, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 30 }}>
      <div style={{ background: "rgba(6,7,9,0.78)", padding: "18px 10px 24px", display: "flex", alignItems: "flex-end", gap: 10, borderTop: `6px solid ${GREEN}` }}>
        {col(T.tiga, "30", "hukuman maksimal di Brasil", CREAM)}
        <div style={{ fontFamily: SERIF, fontSize: 70, color: CREAM, opacity: seg(t, T.tapi - 0.1, T.tapi + 0.2), alignSelf: "center" }}>vs</div>
        {col(T.lima, "50", "“hukuman” untuk Barbosa", "#FFFFFF")}
      </div>
    </div>
  );
};

const QuoteCard: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.hanya - 0.1, CUT.room + 0.05, 0.3, 0.2);
  if (o <= 0.001) return null;
  const hl = (a: number, s: string) => <span style={{ color: t >= a ? GREEN : CREAM, transition: "none" }}>{s}</span>;
  return (
    <div style={{ position: "absolute", left: 64, right: 64, top: 290, opacity: o, background: "rgba(6,7,9,0.8)", padding: "22px 34px 24px", borderLeft: `10px solid ${GREEN}` }}>
      <div style={{ fontFamily: SERIF, fontSize: 60, lineHeight: 1.12, color: CREAM }}>
        “Hanya tiga orang yang pernah membungkam Maracanã: {hl(T.sinatra, "Frank Sinatra")}, {hl(T.paus, "Paus")}, dan {hl(T.dirinya, "saya")}.”
      </div>
      <div style={{ marginTop: 12, fontFamily: GROT, fontWeight: 600, fontSize: 34, color: CREAM, opacity: 0.85 }}>— Alcides Ghiggia (diparafrasekan)</div>
    </div>
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* HOOK */}
    <Chip o={win(t, T.noFinal - 0.05, T.hampir - 0.1, 0.25, 0.2)} title="PIALA DUNIA 1950" sub="satu-satunya tanpa partai final" />
    <Chip o={win(t, T.hampir - 0.05, CUT.board + 0.05, 0.2, 0.15)} title="HAMPIR 200 RIBU" sub="perkiraan penonton · bukan angka resmi" big={112} />
    {/* KONTEKS */}
    <Chip o={win(t, CUT.board + 0.15, T.juli - 0.1)} title="JUARA = PUNCAK GRUP" sub="4 tim saling bertemu, tanpa final" />
    <Chip o={win(t, T.juli - 0.05, T.brasil4 - 0.1)} title="16 JULI 1950" sub="laga terakhir · Maracanã, Rio" />
    <Chip o={win(t, T.brasil4 - 0.05, T.cukup - 0.1)} title="BRASIL 4 · URUGUAY 3" sub="poin sebelum laga terakhir" />
    <Stamp t={t} a={T.cukup + 0.3} b={T.menghajar - 0.2} text="SERI = BRASIL JUARA" top={310} color={GREEN} size={96} />
    <Results t={t} />
    {/* PENGEMBANGAN */}
    <Counter t={t} />
    <Chip o={win(t, T.babak, T.m47 - 0.1, 0.2, 0.2)} title="BABAK 1 · 0–0" sub="Brasil terus menyerang" />
    <Minute t={t} a={T.m47} b={T.m66 - 0.05} m="47'" />
    <Chip o={win(t, T.friaca - 0.05, T.m66 - 0.05)} title="FRIAÇA" sub="Brasil · gol, 1–0" swatch="#ECEAE4" />
    <Minute t={t} a={T.m66} b={T.satuSatu - 0.05} m="66'" />
    <Chip o={win(t, T.schiaffino - 0.05, T.satuSatu - 0.05)} title="J. A. SCHIAFFINO" sub="Uruguay · gol, 1–1" swatch={URUGUAY.top} />
    <Chip o={win(t, T.satuSatu, CUT.goal + 0.05, 0.25, 0.2)} title="1–1 MASIH CUKUP" sub="hasil seri = Brasil juara" />
    <Minute t={t} a={T.m79 - 0.05} b={T.kiper - 0.05} m="79'" />
    <Chip o={win(t, T.ghiggia - 0.05, T.kiper - 0.05)} title="ALCIDES GHIGGIA" sub="Uruguay · tiang dekat" swatch={URUGUAY.top} big={76} />
    <Chip o={win(t, T.kiper - 0.05, T.gol - 0.1)} title="MOACYR BARBOSA" sub="kiper Brasil · menduga umpan silang" swatch="#D9D5CD" big={76} />
    <Stamp t={t} a={T.gol} b={CUT.board2 + 0.05} text="GOL · 1–2" top={330} color={GREEN} size={130} />
    {/* PENJELASAN */}
    <Chip o={win(t, T.uruMenang, CUT.silence + 0.05, 0.25, 0.2)} title="URUGUAY 2–1" sub={t >= T.juara2 ? "juara dunia untuk kedua kalinya" : "klasemen akhir: Uruguay 5 poin"} accent={URUGUAY.top} big={104} />
    <Chip o={win(t, T.hening - 0.15, T.ghiggiaQ - 0.05, 0.2, 0.15)} title="STADION HENING" sub="penonton membeku" />
    <Chip o={win(t, T.ghiggiaQ + 0.05, T.hanya - 0.1, 0.25, 0.2)} title="ALCIDES GHIGGIA" sub="Uruguay · pencetak gol penentu" swatch={URUGUAY.top} />
    <QuoteCard t={t} />
    {/* PAYOFF */}
    <Chip o={win(t, CUT.room + 0.2, T.barbosa - 0.1)} title="LUKANYA PANJANG" sub="Brasil mencari yang disalahkan" />
    <Chip o={win(t, T.barbosa - 0.05, T.hukuman - 0.1)} title="MOACYR BARBOSA" sub={t >= T.kambing ? "dijadikan kambing hitam seumur hidup" : "kiper Brasil, 1950"} swatch="#D9D5CD" />
    <Years t={t} />
    <Chip o={win(t, T.baju - 0.05, T.tahun - 0.1)} title="BAJU PUTIH 1950" sub="kerah biru · seragam Brasil saat itu" />
    <Stamp t={t} a={T.dicap + 0.1} b={T.tahun - 0.1} text="TIDAK PATRIOTIK" top={560} size={96} />
    <Chip o={win(t, T.tahun - 0.05, T.pemenang - 0.1)} title="1953 · LOMBA DESAIN" sub="sebuah koran mencari kaus baru" />
    <Chip o={win(t, T.pemenang - 0.05, T.dari - 0.1)} title="ALDYR SCHLEE · 19 TH" sub={t >= T.pendukung ? "pemenang · pendukung Uruguay" : "remaja pemenang lomba"} swatch="#9a958d" />
    <Chip o={win(t, T.dari - 0.05, T.audira - 0.1)} title="LAHIRLAH KAUS KUNING" sub="kuning-hijau, dari kekalahan 1950" accent={SHIRT_YELLOW} />
    {/* OUTRO */}
    <Chip o={win(t, T.audira - 0.1, T.berikut - 0.1)} title="AUDIRA" sub="Sejarah Sepak Bola" accent={GREEN} big={100} />
    <Chip o={win(t, T.berikut - 0.05, T.outroCard + 0.2)} title="EPISODE BERIKUTNYA" sub="Gol Tangan Tuhan · Maradona 1986" />
  </>
);

// ---------- transitions: venetian blinds close and reopen at each set cut ----------
const BLIND_CUTS = [CUT.board, CUT.ticket, CUT.clock, CUT.goal, CUT.board2, CUT.silence, CUT.room];
const Blinds: React.FC<{ t: number }> = ({ t }) => {
  const c = BLIND_CUTS.find((x) => Math.abs(t - x) < 0.36);
  if (c === undefined) return null;
  const N = 16;
  const h = 1920 / N;
  return (
    <>
      {Array.from({ length: N }, (_, i) => {
        const d = Math.abs(t - c) - i * 0.006;
        const k = 1 - seg(d, 0.04, 0.3);
        if (k <= 0.001) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * h + (h * (1 - k)) / 2, height: h * k + 1, background: "#050608", borderBottom: k > 0.9 ? "2px solid rgba(237,233,225,0.08)" : "none" }} />
        );
      })}
    </>
  );
};

const Smoke: React.FC<{ t: number }> = ({ t }) => {
  const c = T.ghiggiaQ - 0.05;
  const o = 1 - seg(Math.abs(t - c), 0.05, 0.4);
  if (o <= 0.001) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o * 0.92, background: "radial-gradient(70% 50% at 50% 45%, rgba(190,186,178,0.9) 0%, rgba(60,58,55,0.95) 60%, rgba(8,8,9,1) 100%)" }} />;
};

// ---------- karaoke captions ----------
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
  if (!g || t > T.outroCard) return null;
  const n = g.words.length;
  const lines = n <= 4 ? [g.words] : [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))];
  const o = seg(t, g.start - 0.05, g.start + 0.08);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      <div style={{ background: "rgba(5,6,8,0.86)", padding: "10px 30px 14px", borderTop: "2px solid rgba(237,233,225,0.55)", borderBottom: "2px solid rgba(237,233,225,0.55)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", gap: 24 }}>
            {ln.map((w, wi) => {
              const active = t >= w.s && t < w.e + 0.05;
              const said = t >= w.s;
              const b = active ? 1 + 0.04 * (1 - seg(t, w.s, w.s + 0.18)) : 1;
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: GROT,
                    fontWeight: 700,
                    fontSize: 56,
                    lineHeight: 1.18,
                    color: active ? GREEN : said ? CREAM : "rgba(237,233,225,0.5)",
                    transform: `scale(${b})`,
                    display: "inline-block",
                    textShadow: active ? "0 0 18px rgba(43,212,106,0.35)" : "none",
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TOTAL_SECONDS = TOTAL;

export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: PAL.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 42, near: 0.05, far: 260 }}>
        <FilmScene t={t} />
      </ThreeCanvas>
      <Stage>
        {/* film vignette + top/bottom grade so HUD and captions read */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: seg(t, 2.0, 3.0), background: "linear-gradient(180deg, rgba(6,7,9,0.6) 0%, rgba(6,7,9,0.25) 22%, rgba(6,7,9,0) 34%, rgba(6,7,9,0) 62%, rgba(6,7,9,0.45) 80%, rgba(6,7,9,0.6) 100%)" }} />
        <HookTitle t={t} />
        <HUD t={t} />
        <Captions t={t} />
        <Smoke t={t} />
        <Blinds t={t} />
      </Stage>
    </AbsoluteFill>
  );
};
