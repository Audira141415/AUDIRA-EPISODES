// EP06 film "Lahirnya Sepak Bola Modern 1863" (VINTAGEFORGE): tavern-night manuscript world + HUD + karaoke.
// All beats come from timeline.json (locked VO). Audio is muxed separately by the lead.
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { CAM_POS, GOLD, OSWALD, Overlay, PARCH, PITCH, PLAYFAIR, fellI, fellN } from "./Cover.tsx";
import { FilmScene } from "./FilmScene.tsx";
import { CLIPS, CUT, T, TOTAL, pop, seg, win, type Word } from "./timing.ts";

const { fontFamily: PLAYFAIR_B } = loadPlayfair("normal", { weights: ["700"], subsets: ["latin"] });
const FELL_I = `${fellI.fontFamily}`;
const FELL_N = `${fellN.fontFamily}`;
const PANEL = "rgba(22,12,6,0.82)";
const RED = "#E0603F";

/** Lay HTML out in 1080x1920 units, scaled to the composition size. */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0", overflow: "hidden" }}>{children}</div>
    </AbsoluteFill>
  );
};

// ---------- HUD pieces ----------
const Chip: React.FC<{ o: number; title: string; sub?: string; top?: number; accent?: string; big?: number; kicker?: string; mark?: "ok" | "no" }> = ({ o, title, sub, top = 300, accent = GOLD, big = 84, kicker, mark }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 64, top, opacity: o, transform: `translateX(${(1 - o) * -40}px)`, maxWidth: 952 }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 20, background: PANEL, padding: "16px 30px 20px 0", borderTop: `2px solid rgba(226,190,114,0.5)`, borderBottom: `2px solid rgba(226,190,114,0.5)` }}>
        <div style={{ width: 10, background: PITCH }} />
        <div>
          {kicker && <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: PITCH, marginBottom: 6 }}>{kicker}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: big, lineHeight: 1.02, color: accent }}>{title}</div>
            {mark && <Mark kind={mark} size={big * 0.9} />}
          </div>
          {sub && <div style={{ marginTop: 6, fontFamily: FELL_I, fontStyle: "italic", fontSize: 46, lineHeight: 1.15, color: PARCH }}>{sub}</div>}
        </div>
      </div>
    </div>
  );

const Mark: React.FC<{ kind: "ok" | "no"; size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke={kind === "ok" ? PITCH : RED} strokeWidth="9" />
    {kind === "ok" ? (
      <path d="M28 52 L44 68 L74 34" fill="none" stroke={PITCH} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M32 32 L68 68 M68 32 L32 68" fill="none" stroke={RED} strokeWidth="11" strokeLinecap="round" />
    )}
  </svg>
);

/** Boot hitting a shin (hacking) or a hand holding a ball, engraved line style. */
const Icon: React.FC<{ kind: "hack" | "hand"; size: number; color: string }> = ({ kind, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    {kind === "hack" ? (
      <g fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M30 10 L30 92 L52 92 L50 80 L42 76 L42 10" />
        <path d="M100 30 L96 62 L74 66 L60 74 L62 84 L104 84 L110 60 Z" fill={color} />
        <path d="M50 58 L60 54 M50 66 L62 66 M50 74 L60 78" />
      </g>
    ) : (
      <g fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="62" cy="34" r="22" />
        <path d="M30 110 L30 70 Q30 56 40 56 L40 44 Q40 38 46 38 L46 64 M46 44 Q46 36 54 38 L54 62 M54 44 Q56 38 62 40 L62 62 M62 50 Q66 44 72 48 L70 80 Q66 100 54 110" />
      </g>
    )}
  </svg>
);

const Stamp: React.FC<{ t: number; a: number; b: number; text: string; icon?: "hack" | "hand"; top: number; left: number; rot?: number }> = ({ t, a, b, text, icon, top, left, rot = -6 }) => {
  const o = win(t, a, b, 0.1, 0.25);
  if (o <= 0.001) return null;
  const s = 1.3 - 0.3 * seg(t, a, a + 0.16);
  return (
    <div style={{ position: "absolute", left, top, opacity: o, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: "50% 50%" }}>
      <div style={{ background: "rgba(22,12,6,0.86)", padding: "14px 18px", borderRadius: 6, boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, border: `7px solid ${RED}`, padding: "6px 24px 10px" }}>
          {icon && <Icon kind={icon} size={96} color={RED} />}
          <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: 3, color: RED }}>{text}</div>
        </div>
      </div>
    </div>
  );
};

const NameCard: React.FC<{ o: number; kicker: string; name: string; sub: string; top?: number }> = ({ o, kicker, name, sub, top = 300 }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 64, top, opacity: o, transform: `translateY(${(1 - o) * 30}px)` }}>
      <div style={{ background: "rgba(243,234,214,0.94)", padding: "18px 34px 22px", border: "3px solid #2A1A0E", boxShadow: "0 14px 40px rgba(0,0,0,0.55), inset 0 0 0 8px rgba(243,234,214,0.94), inset 0 0 0 10px rgba(42,26,14,0.6)" }}>
        <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: "#2E7A4C" }}>{kicker}</div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 78, lineHeight: 1.02, color: "#2A1A0E" }}>{name}</div>
        <div style={{ marginTop: 4, fontFamily: FELL_I, fontStyle: "italic", fontSize: 44, color: "#8A2E1C" }}>{sub}</div>
      </div>
    </div>
  );

const BigLine: React.FC<{ o: number; top: number; children: React.ReactNode; scale?: number }> = ({ o, top, children, scale = 1 }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${scale})` }}>
      <div style={{ background: PANEL, padding: "14px 40px 20px", borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`, textAlign: "center" }}>{children}</div>
    </div>
  );

const XMark: React.FC<{ o: number; x: number; y: number; size: number; label: string; draw: number }> = ({ o, x, y, size, label, draw }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, opacity: o }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path d="M12 12 L88 88" stroke={RED} strokeWidth="9" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={110 * (1 - Math.min(1, draw * 2))} />
        <path d="M88 12 L12 88" stroke={RED} strokeWidth="9" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={110 * (1 - Math.max(0, draw * 2 - 1))} />
      </svg>
      <div style={{ marginTop: 6, textAlign: "center", fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 44, color: PARCH, background: PANEL, padding: "4px 10px" }}>{label}</div>
    </div>
  );

const HUD: React.FC<{ t: number }> = ({ t }) => {
  const count = t < T.tujuhBelas - 0.4 ? 13 : Math.min(17, 13 + Math.floor((t - (T.tujuhBelas - 0.4)) / 0.09));
  return (
    <>
      {/* HOOK */}
      <Chip o={win(t, T.kick - 0.05, T.hookEnd + 0.05, 0.25, 0.25)} title="1863" big={150} sub="menendang tulang kering: sah" />
      <Stamp t={t} a={T.hit1 + 0.02} b={T.hookEnd + 0.05} text="HACKING" icon="hack" top={620} left={300} rot={-5} />
      {/* KONTEKS */}
      <Chip o={win(t, CUT.schools + 0.15, T.rugby - 0.1)} kicker="INGGRIS, SEBELUM 1863" title="TIAP SEKOLAH, ATURAN SENDIRI" big={70} />
      <Chip o={win(t, T.rugby, T.eton - 0.15)} kicker="SEKOLAH RUGBY" title="BOLA DIBAWA" sub="boleh lari sambil memegang bola" mark="ok" />
      <Chip o={win(t, T.eton, T.begitu - 0.1)} kicker="SEKOLAH ETON" title="TANGAN" sub="hampir dilarang" mark="no" />
      <Chip o={win(t, T.begitu, CUT.quill + 0.05)} kicker="ALUMNI BERTEMU" title="MAIN YANG MANA?" sub="dua aturan bertabrakan" accent={RED} />
      {/* PENGEMBANGAN */}
      <Chip o={win(t, CUT.quill + 0.15, CUT.tavern + 0.05)} kicker="SENIN MALAM" title="26 OKTOBER 1863" big={80} />
      <Chip o={win(t, T.wakil, T.berkumpul + 0.6)} kicker="LONDON" title="12 KLUB & SEKOLAH" sub="mengirim wakil" />
      <Chip o={win(t, T.berkumpul + 0.6, CUT.room + 0.05)} kicker="TEMPAT RAPAT" title="FREEMASONS' TAVERN" big={70} sub="Great Queen Street, London" />
      <NameCard o={win(t, T.ebenezer - 0.15, T.malam - 0.1)} kicker="PENGGAGAS" name="EBENEZER MORLEY" sub="kapten klub Barnes" />
      <Chip o={win(t, T.malam, T.lalu - 0.05)} kicker="MALAM ITU LAHIR" title="THE FOOTBALL ASSOCIATION" big={64} />
      <Chip o={win(t, T.lalu, T.bolehkah1 - 0.05)} kicker="RAPAT DEMI RAPAT" title="DEBAT PANJANG" />
      <Chip o={win(t, T.bolehkah1, T.bolehkah2 - 0.05)} kicker="PERTANYAAN 1" title="MENENDANG KAKI LAWAN?" big={66} />
      <Chip o={win(t, T.bolehkah2, T.kubu - 0.05)} kicker="PERTANYAAN 2" title="BOLA DIBAWA LARI?" big={66} />
      <Chip o={win(t, T.kubu, T.morley2 - 0.05)} kicker="SEMPAT UNGGUL" title="KUBU TENDANG KAKI" big={70} accent={RED} />
      <NameCard o={win(t, T.morley2 - 0.05, T.akhirnya - 0.1)} kicker="MORLEY MEMBALAS" name="ATURAN CAMBRIDGE" sub="melarang keduanya" />
      <Chip o={win(t, T.akhirnya, T.blackheath - 0.1)} kicker="AKHIRNYA" title="RESMI DILARANG" accent={PITCH} />
      <Stamp t={t} a={T.resmi - 0.25} b={T.blackheath - 0.1} text="DILARANG" icon="hack" top={880} left={190} rot={-5} />
      <Stamp t={t} a={T.dilarangP - 0.05} b={T.blackheath - 0.1} text="DILARANG" icon="hand" top={1070} left={230} rot={4} />
      <NameCard o={win(t, T.blackheath - 0.05, CUT.fork + 0.05)} kicker="KLUB" name="BLACKHEATH" sub="keluar dari rapat" />
      <Chip o={win(t, T.y1871 - 0.1, CUT.laws + 0.05)} kicker="JALAN BERPISAH" title="1871 · RUGBY FOOTBALL UNION" big={60} sub="kubu rugby punya federasi sendiri" />
      {/* PENJELASAN */}
      <BigLine o={win(t, T.tigaBelas - 0.05, T.gawang - 0.05)} top={300} scale={0.92 + 0.08 * pop(t, T.tigaBelas - 0.05)}>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 170, lineHeight: 1, color: GOLD }}>13 HUKUM</div>
        <div style={{ fontFamily: FELL_I, fontStyle: "italic", fontSize: 50, color: PARCH, opacity: seg(t, T.aneh - 0.1, T.aneh + 0.2) }}>dan isinya aneh</div>
      </BigLine>
      <Chip o={win(t, T.gawang, T.tim - 0.1)} kicker="ANEH #1" title="TANPA MISTAR" sub="setinggi apa pun tetap gol" mark="no" />
      <Stamp t={t} a={T.gol1} b={T.tim - 0.05} text="GOL!" top={820} left={330} rot={-8} />
      <Chip o={win(t, T.tim, T.bolaTangkap - 0.1)} kicker="ANEH #2" title="TUKAR SISI" sub="setiap kali terjadi gol" />
      <Chip o={win(t, T.bolaTangkap, T.tidak - 0.1)} kicker="ANEH #3" title="BOLA DITANGKAP" sub="boleh, dengan tangan" mark="ok" />
      <Chip o={win(t, T.tidak, T.tapi - 0.1)} kicker="ANEH #4" title="TANPA KIPER, TANPA WASIT" big={60} />
      <XMark o={win(t, T.kiper - 0.1, T.tapi - 0.15, 0.15, 0.25)} x={640} y={900} size={250} label="KIPER" draw={seg(t, T.kiper, T.kiper + 0.35)} />
      <XMark o={win(t, T.wasit - 0.15, T.tapi - 0.15, 0.15, 0.25)} x={220} y={1030} size={170} label="WASIT" draw={seg(t, T.wasit - 0.05, T.wasit + 0.3)} />
      {/* PAYOFF */}
      <Chip o={win(t, T.tapi, T.lebar - 0.1)} kicker="DARI MALAM ITU" title="2 ANGKA MASIH HIDUP" big={70} accent={PITCH} />
      <BigLine o={win(t, T.lebar, T.jarak - 0.15)} top={330}>
        <div style={{ fontFamily: FELL_I, fontStyle: "italic", fontSize: 48, color: PARCH }}>lebar gawang</div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 130, lineHeight: 1.05, color: GOLD, opacity: seg(t, T.delapan - 0.1, T.delapan + 0.15) }}>8 yard</div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 110, lineHeight: 1.05, color: PITCH, opacity: seg(t, T.tujuhKoma - 0.1, T.tujuhKoma + 0.15) }}>= 7,32 m</div>
      </BigLine>
      <BigLine o={win(t, T.jarak, T.tigaBaris - 0.15)} top={330}>
        <div style={{ fontFamily: FELL_I, fontStyle: "italic", fontSize: 48, color: PARCH }}>jarak lawan saat sepak mula</div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 130, lineHeight: 1.05, color: GOLD, opacity: seg(t, T.sepuluh - 0.1, T.sepuluh + 0.15) }}>10 yard</div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 110, lineHeight: 1.05, color: PITCH, opacity: seg(t, T.sembilan - 0.1, T.sembilan + 0.15) }}>= 9,15 m</div>
      </BigLine>
      <BigLine o={win(t, T.tigaBaris, CUT.outro + 0.05)} top={320} scale={count === 17 ? 1 + 0.04 * (1 - seg(t, T.tujuhBelas, T.tujuhBelas + 0.3)) : 1}>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 200, lineHeight: 1, color: count === 17 ? PITCH : GOLD }}>{count}</div>
        <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 46, letterSpacing: 6, color: PARCH }}>HUKUM PERMAINAN</div>
        <div style={{ fontFamily: FELL_I, fontStyle: "italic", fontSize: 44, color: GOLD, opacity: seg(t, T.dunia - 0.6, T.dunia) }}>dimainkan di seluruh dunia</div>
      </BigLine>
      {/* OUTRO */}
      <Chip o={win(t, T.ini, T.episode - 0.1)} kicker="SEJARAH SEPAK BOLA" title="AUDIRA" big={110} accent={PITCH} />
      <Chip o={win(t, T.episode, T.outroCard + 0.3)} kicker="EPISODE BERIKUTNYA" title="PIALA DUNIA PERTAMA" big={66} sub="Uruguay, 1930" />
    </>
  );
};

// ---------- transitions ----------
const PageTurn: React.FC<{ t: number; c: number }> = ({ t, c }) => {
  const p = (t - (c - 0.26)) / 0.52;
  if (p <= 0 || p >= 1) return null;
  const e = p * p * (3 - 2 * p);
  const x = 1080 - 2600 * e;
  return (
    <div style={{ position: "absolute", left: x, top: -100, width: 1500, height: 2120, transform: "skewX(-9deg)", background: "linear-gradient(90deg, rgba(60,35,15,0.55) 0%, #C9B48A 2.5%, #E9DCBC 12%, #EADBB8 70%, #D9C49A 100%)", boxShadow: "-40px 0 60px rgba(0,0,0,0.55)" }}>
      <div style={{ position: "absolute", left: 120, top: 520, width: 900, fontFamily: FELL_N, fontSize: 64, lineHeight: 1.6, color: "rgba(42,26,14,0.28)", transform: "skewX(9deg)" }}>
        The Laws of the Game · MDCCCLXIII
      </div>
    </div>
  );
};
const Flash: React.FC<{ t: number; c: number }> = ({ t, c }) => {
  const o = Math.min(seg(t, c - 0.22, c), 1 - seg(t, c, c + 0.4));
  if (o <= 0.001) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o, background: "radial-gradient(circle at 50% 42%, #FFF6E0 0%, #FFD9A0 45%, #E8A060 100%)" }} />;
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
    <div style={{ position: "absolute", left: 30, right: 30, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: o }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 24, background: "rgba(22,12,6,0.86)", padding: "6px 24px 12px", borderTop: `2px solid ${GOLD}`, borderBottom: `2px solid ${GOLD}` }}>
          {ln.map((w, wi) => {
            const active = t >= w.s && t < w.e + 0.05;
            const said = t >= w.s;
            const b = active ? 1 + 0.04 * (1 - seg(t, w.s, w.s + 0.18)) : 1;
            return (
              <span key={wi} style={{ fontFamily: PLAYFAIR_B, fontWeight: 700, fontSize: 54, lineHeight: 1.18, color: active ? GOLD : said ? PARCH : "rgba(243,234,214,0.55)", transform: `scale(${b})`, display: "inline-block", whiteSpace: "nowrap" }}>
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
  const [handle] = useState(() => delayRender("ep06 film fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([fellN.waitUntilDone(), fellI.waitUntilDone(), document.fonts.load("110px 'IM Fell English'"), document.fonts.load("italic 58px 'IM Fell English'")])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  const coverO = 1 - seg(t, 1.1, 2.75); // gentle 1.65s dissolve (was a sharp 0.5s full-frame reveal that spiked measured motion)
  return (
    <AbsoluteFill style={{ background: "#120A05" }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 44, near: 0.05, far: 30 }}>
          <FilmScene t={t} frame={frame} />
        </ThreeCanvas>
      )}
      <Stage>
        {/* after the hook: light top/bottom gradient so HUD + captions stay readable */}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - coverO, background: "linear-gradient(180deg, rgba(18,10,5,0.62) 0%, rgba(18,10,5,0.25) 22%, rgba(18,10,5,0) 34%, rgba(18,10,5,0) 62%, rgba(18,10,5,0.45) 80%, rgba(18,10,5,0.6) 100%)" }} />
        {coverO > 0.001 && (
          <div style={{ position: "absolute", inset: 0, opacity: coverO }}>
            <Overlay />
          </div>
        )}
        {ready && <HUD t={t} />}
        <Captions t={t} />
        {[CUT.schools, CUT.quill, CUT.tavern, CUT.laws, CUT.outro].map((c) => (
          <PageTurn key={c} t={t} c={c} />
        ))}
        <Flash t={t} c={CUT.room} />
        <Flash t={t} c={CUT.fork} />
      </Stage>
    </AbsoluteFill>
  );
};
