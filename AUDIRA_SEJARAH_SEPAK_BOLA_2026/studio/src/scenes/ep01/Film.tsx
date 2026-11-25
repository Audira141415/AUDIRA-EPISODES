// EP01 film "Semua Juara Piala Dunia" (HISTORYMAP): 3D map table + HUD + karaoke captions.
// All beats come from timeline.json (locked VO). Audio is muxed separately by the lead.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, CAM, useFonts } from "./Cover.tsx";
import { DISPLAY, GOLD, GREEN, LABEL } from "./coverTextures.ts";
import { FilmScene } from "./FilmScene.tsx";
import { CLIPS, T, TOTAL, seg, win, pop, type Word } from "./timing.ts";
import { Outro } from "../_shared/Outro.tsx";

const CREAM = "#F4EFE3";

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

// ---------- hook title (identical to the cover at frame 0) ----------
const HookTitle: React.FC<{ t: number }> = ({ t }) => {
  const out = seg(t, T.hookEnd - 0.25, T.hookEnd + 0.35);
  const grad = 1 - out * 0.55;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: grad,
          background:
            "linear-gradient(180deg, rgba(7,9,12,0.95) 0%, rgba(7,9,12,0.86) 22%, rgba(7,9,12,0.0) 36%, rgba(7,9,12,0) 78%, rgba(7,9,12,0.6) 100%)",
        }}
      />
      {out < 1 && (
        <div style={{ opacity: 1 - out, transform: `translateY(${-out * 60}px)` }}>
          <div style={{ position: "absolute", left: 70, top: 196, display: "flex", alignItems: "center", gap: 16, fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GREEN }}>
            <span style={{ width: 16, height: 16, background: GREEN, display: "inline-block" }} />
            SEJARAH SEPAK BOLA #01
          </div>
          <div style={{ position: "absolute", left: 64, top: 262, fontFamily: `"${DISPLAY}"`, color: CREAM, lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
            <div style={{ fontSize: 150, letterSpacing: 1 }}>
              CUMA <span style={{ color: GOLD }}>8</span> NEGARA
            </div>
            <div style={{ marginTop: 14, fontFamily: `"${LABEL}"`, fontWeight: 600, fontSize: 46, letterSpacing: 1, color: "#E9E2D2" }}>
              juara dunia 1930–2026 · <span style={{ color: GOLD }}>23 gelar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ---------- HUD pieces ----------
const Chip: React.FC<{ o: number; title: string; sub?: string; top?: number; accent?: string; big?: number }> = ({ o, title, sub, top = 280, accent = GOLD, big = 84 }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 64, top, opacity: o, transform: `translateX(${(1 - o) * -40}px)` }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 18 }}>
        <div style={{ width: 10, background: GREEN }} />
        <div>
          <div style={{ fontFamily: `"${DISPLAY}"`, fontSize: big, lineHeight: 1, color: accent, letterSpacing: 1, textShadow: "0 6px 22px rgba(0,0,0,0.7)" }}>{title}</div>
          {sub && <div style={{ marginTop: 8, fontFamily: `"${LABEL}"`, fontWeight: 600, fontSize: 38, color: CREAM, textShadow: "0 4px 16px rgba(0,0,0,0.8)" }}>{sub}</div>}
        </div>
      </div>
    </div>
  );

/** Big number + label for the 84 -> 13 -> 8 funnel. */
const Funnel: React.FC<{ t: number }> = ({ t }) => {
  const rows: [number, number, string, string][] = [
    [T.n84, T.n13, "84", "negara pernah tampil"],
    [T.n13, T.n8, "13", "pernah masuk final"],
    [T.n8, T.eng - 0.3, "8", "pernah juara dunia"],
  ];
  return (
    <>
      {rows.map(([a, b, n, label], i) => {
        const o = win(t, a, b, 0.25, 0.25);
        if (o <= 0.001) return null;
        const s = 0.9 + 0.1 * pop(t, a, 0.35);
        return (
          <div key={i} style={{ position: "absolute", left: 64, top: 270, opacity: o, transform: `scale(${s})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ fontFamily: `"${DISPLAY}"`, fontSize: 210, lineHeight: 0.95, color: i === 2 ? GOLD : i === 1 ? CREAM : GREEN, textShadow: "0 8px 28px rgba(0,0,0,0.7)" }}>{n}</div>
            <div style={{ fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 50, lineHeight: 1.1, color: CREAM, maxWidth: 520, textShadow: "0 4px 16px rgba(0,0,0,0.8)" }}>{label}</div>
          </div>
        );
      })}
    </>
  );
};

/** Running title tally during the count (top right). */
const Tally: React.FC<{ t: number }> = ({ t }) => {
  const steps: [number, number][] = [[T.eng + 1.0, 1], [T.dua1, 5], [T.kedua, 7], [T.argTiga, 10], [T.empat + 0.4, 18], [T.lima + 0.4, 23]];
  let n = 0;
  for (const [a, v] of steps) if (t >= a) n = v;
  const o = win(t, T.eng + 0.2, T.lihat + 1.2, 0.4, 0.4);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", right: 64, top: 280, opacity: o, textAlign: "right", background: "rgba(10,14,19,0.78)", border: `3px solid ${GOLD}`, padding: "10px 22px 12px" }}>
      <div style={{ fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: GREEN }}>GELAR</div>
      <div style={{ fontFamily: `"${DISPLAY}"`, fontSize: 92, lineHeight: 1, color: GOLD }}>
        {n}
        <span style={{ fontSize: 46, color: CREAM }}> / 23</span>
      </div>
    </div>
  );
};

/** Europe 13 vs South America 10 bars. */
const Continents: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.eropa - 0.2, T.belum + 0.1, 0.3, 0.4);
  if (o <= 0.001) return null;
  const bar = (n: number, a: number, label: string, color: string) => {
    const p = seg(t, a, a + 0.6);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, opacity: seg(t, a - 0.1, a + 0.2) }}>
        <div style={{ width: 300, fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 40, color: CREAM }}>{label}</div>
        <div style={{ height: 46, width: 30 * n * p, background: color }} />
        <div style={{ fontFamily: `"${DISPLAY}"`, fontSize: 70, lineHeight: 1, color }}>{Math.round(n * p)}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 64, top: 280, opacity: o, background: "rgba(10,14,19,0.72)", padding: "16px 26px 22px", borderLeft: `10px solid ${GREEN}` }}>
      <div style={{ fontFamily: `"${DISPLAY}"`, fontSize: 64, color: GOLD, lineHeight: 1 }}>GELAR PER BENUA</div>
      {bar(13, T.eropa, "EROPA", GOLD)}
      {bar(10, T.amsel, "AMERIKA SELATAN", "#E9C77D")}
    </div>
  );
};

const Hosts: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.tuan - 0.1, T.drama + 0.2, 0.3, 0.4);
  if (o <= 0.001) return null;
  const list = ["Uruguay 1930", "Italia 1934", "Inggris 1966", "Jerman Barat 1974", "Argentina 1978", "Prancis 1998"];
  return (
    <div style={{ position: "absolute", left: 64, top: 280, opacity: o, background: "rgba(10,14,19,0.72)", padding: "16px 26px 20px", borderLeft: `10px solid ${GREEN}` }}>
      <div style={{ fontFamily: `"${DISPLAY}"`, fontSize: 70, color: GOLD, lineHeight: 1 }}>TUAN RUMAH JUARA: 6×</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", width: 860, marginTop: 12 }}>
        {list.map((s, i) => {
          const last = i === 5 && t > T.terakhir;
          return (
            <div key={s} style={{ opacity: seg(t, T.tuan + 0.15 + i * 0.1, T.tuan + 0.4 + i * 0.1), fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 34, color: last ? "#0A0E13" : CREAM, background: last ? GREEN : "transparent", padding: last ? "0 10px" : 0 }}>
              {s}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, opacity: seg(t, T.terakhir, T.terakhir + 0.3), fontFamily: `"${LABEL}"`, fontWeight: 600, fontSize: 34, color: GREEN }}>terakhir: 1998</div>
    </div>
  );
};

/** Screen-space rubber stamp on a dark plate (never crops, never sits on the gold wireframe). */
const StampHTML: React.FC<{ t: number; a: number; b: number; text: string; top?: number }> = ({ t, a, b, text, top = 600 }) => {
  const o = win(t, a, b, 0.12, 0.3);
  if (o <= 0.001) return null;
  const s = 1.25 - 0.25 * seg(t, a, a + 0.18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(10,12,15,0.86)", padding: "18px 30px", borderRadius: 6, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", transform: `rotate(-4deg) scale(${s})` }}>
        <div style={{ border: "8px solid #E23A26", padding: "4px 30px 8px", fontFamily: `"${DISPLAY}"`, fontSize: 118, lineHeight: 1, letterSpacing: 4, color: "#E23A26" }}>{text}</div>
      </div>
    </div>
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Chip o={win(t, T.sejak + 0.1, T.n84 - 0.05, 0.3, 0.25)} title="SEJAK 1930" sub="Piala Dunia pertama, di Uruguay" />
    <Funnel t={t} />
    <Tally t={t} />
    <Chip o={win(t, T.eng + 0.1, T.uru - 0.1)} title="INGGRIS · 1 GELAR" sub="1966, di kandang sendiri" />
    <Chip o={win(t, T.uru, T.esp - 0.1)} title="URUGUAY & PRANCIS" sub="masing-masing 2 gelar" />
    <Chip o={win(t, T.esp, T.juli + 0.1)} title="SPANYOL · 2 GELAR" sub="2010 dan 2026" />
    <Chip o={win(t, T.juli + 0.1, T.ferran - 0.05, 0.3, 0.2)} title="FINAL · JULI 2026" sub="Spanyol 1–0 Argentina" />
    <Chip o={win(t, T.ferran, T.arg - 0.1, 0.2, 0.3)} title="FERRAN TORRES" sub="Spanyol · gol menit 106'" />
    <Chip o={win(t, T.arg, T.ita - 0.1)} title="ARGENTINA · 3 GELAR" sub="1978 · 1986 · 2022" />
    <Chip o={win(t, T.ita, T.puncak)} title="ITALIA & JERMAN" sub="masing-masing 4 gelar" />
    <Chip o={win(t, T.puncak + 0.1, T.lihat + 0.1)} title="BRASIL · 5 BINTANG" sub="juara terbanyak" big={96} />
    <Chip o={win(t, T.lihat + 0.1, T.eropa - 0.2)} title="CUMA 2 BENUA" sub="Eropa dan Amerika Selatan" />
    <Continents t={t} />
    <Chip o={win(t, T.belum + 0.1, T.tuan - 0.1)} title="BELUM PERNAH KE FINAL" sub="Afrika · Asia · Amerika Utara" accent="#FF6A4D" big={74} />
    <Hosts t={t} />
    <Chip o={win(t, T.drama + 0.1, T.pertama - 0.05)} title="DRAMA TROFI" sub="dua kali dicuri" />
    <Chip o={win(t, T.pertama, T.ditemukan - 0.05)} title="1966 · DICURI" sub="trofi pertama (Jules Rimet), London" accent="#FF6A4D" />
    <StampHTML t={t} a={T.dicuri1 + 0.2} b={T.ditemukan - 0.05} text="DICURI 1966" />
    <Chip o={win(t, T.ditemukan, T.y1983 - 0.05)} title="PICKLES" sub="anjing collie yang menemukannya, 7 hari kemudian" />
    <Chip o={win(t, T.y1983, T.kini - 0.05)} title="1983 · DICURI LAGI" sub="Rio de Janeiro · tak pernah kembali" accent="#FF6A4D" />
    <StampHTML t={t} a={T.dicuri2 + 0.3} b={T.kini - 0.05} text="HILANG 1983" top={1080} />
    <Chip o={win(t, T.kini, T.audira - 0.1)} title="TROFI PENGGANTI" sub="dipakai sejak 1974 · kini di Spanyol" />
    <Chip o={win(t, T.audira, T.berikut - 0.1)} title="AUDIRA" sub="Sejarah Sepak Bola" accent={GREEN} />
    <Chip o={win(t, T.berikut, T.outroCard + 0.3)} title="EPISODE BERIKUTNYA" sub="kenapa Brasil punya 5 bintang?" />
  </>
);

// ---------- karaoke captions ----------
type Group = { words: Word[]; start: number; end: number };
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const c of CLIPS) {
    // sentences/phrases end at punctuation
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
    // never leave a single word alone: merge with the next (or previous) chunk
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
    // groups of at most 8 words, balanced
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
    <div style={{ position: "absolute", left: 40, right: 40, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: o }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 24, background: "rgba(8,11,15,0.82)", padding: "6px 22px 10px", borderBottom: `4px solid ${GREEN}` }}>
          {ln.map((w, wi) => {
            const active = t >= w.s && t < w.e + 0.05;
            const said = t >= w.s;
            const b = active ? 1 + 0.04 * (1 - seg(t, w.s, w.s + 0.18)) : 1;
            return (
              <span key={wi} style={{ fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 56, lineHeight: 1.15, color: active ? GOLD : said ? CREAM : "rgba(244,239,227,0.55)", transform: `scale(${b})`, display: "inline-block" }}>
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
  const ready = useFonts();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: CAM, fov: 34, near: 0.05, far: 80 }}>
          <FilmScene t={t} />
        </ThreeCanvas>
      )}
      {ready && (
        <Stage>
          {/* light top gradient so HUD stays readable after the hook */}
          <div style={{ position: "absolute", inset: 0, opacity: seg(t, T.hookEnd - 0.3, T.hookEnd + 0.3), background: "linear-gradient(180deg, rgba(7,9,12,0.7) 0%, rgba(7,9,12,0.35) 20%, rgba(7,9,12,0) 32%, rgba(7,9,12,0) 62%, rgba(7,9,12,0.55) 82%, rgba(7,9,12,0.7) 100%)" }} />
          <HookTitle t={t} />
          <HUD t={t} />
          <Captions t={t} />
        </Stage>
      )}
      <Outro start={T.outroCard} />
    </AbsoluteFill>
  );
};
