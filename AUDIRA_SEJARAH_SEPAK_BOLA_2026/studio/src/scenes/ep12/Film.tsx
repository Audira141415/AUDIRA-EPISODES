import React, { useState, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { INK_PALETTE } from "../../kits/inkstory/lib/palette.ts";
import { FilmScene } from "./FilmScene.tsx";
import { Cover } from "./Cover.tsx";
import { TOTAL_SECONDS, T, CUT, seg, win, WORDS, type Word } from "./timing.ts";
import { delayRender, continueRender } from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";
import { loadFont as loadPM } from "@remotion/google-fonts/PermanentMarker";

const { fontFamily: ANTON } = loadFont();
const { fontFamily: PM } = loadPM();
const SERIF = "'Georgia', 'Palatino Linotype', serif";

const BG = INK_PALETTE.agedXuanPaper;
const VERM = INK_PALETTE.vermilionCinnabar;
const GOLD = INK_PALETTE.ancientGold;
const WASH = INK_PALETTE.dilutedWash;
const PANEL = "rgba(20,19,18,0.78)";

const CAM_POS: [number, number, number] = [-1.8, -0.3, 4.6];

// ---------- HUD components ----------
const Chip: React.FC<{
  o: number; kicker?: string; title: string; big?: number; sub?: string; accent?: string;
}> = ({ o, kicker, title, big = 80, sub, accent = GOLD }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 60, right: 60, top: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: o }}>
      {kicker && <div style={{ fontFamily: SERIF, fontSize: 36, color: WASH, letterSpacing: 2 }}>{kicker}</div>}
      <div style={{ background: PANEL, padding: "12px 36px 16px", borderTop: `3px solid ${accent}`, borderBottom: `3px solid ${accent}`, textAlign: "center" }}>
        <div style={{ fontFamily: ANTON, fontWeight: 400, fontSize: big, lineHeight: 1.1, color: BG }}>{title}</div>
      </div>
      {sub && <div style={{ fontFamily: SERIF, fontSize: 34, color: WASH, fontStyle: "italic", textAlign: "center" }}>{sub}</div>}
    </div>
  );

const BigLine: React.FC<{ o: number; top?: number; children: React.ReactNode; scale?: number }> = ({ o, top = 320, children, scale = 1 }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${scale})` }}>
      <div style={{ background: PANEL, padding: "14px 40px 20px", borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`, textAlign: "center" }}>{children}</div>
    </div>
  );

const NameCard: React.FC<{ o: number; kicker: string; name: string; sub?: string }> = ({ o, kicker, name, sub }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 60, right: 60, top: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: o }}>
      <div style={{ fontFamily: SERIF, fontSize: 34, color: WASH }}>{kicker}</div>
      <div style={{ background: PANEL, padding: "16px 44px 20px", borderLeft: `4px solid ${VERM}` }}>
        <div style={{ fontFamily: ANTON, fontSize: 72, color: BG, lineHeight: 1.1 }}>{name}</div>
        {sub && <div style={{ fontFamily: SERIF, fontSize: 34, color: GOLD, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );

// ---------- HUD ----------
const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* HOOK */}
    <Chip o={win(t, T.cruyff1, T.guardiola1 + 0.3, 0.2, 0.25)} kicker="DARI KAKI" title="CRUYFF KE GUARDIOLA" big={66} sub="satu garis lurus" />

    {/* KONTEKS */}
    <Chip o={win(t, T.tahun1973, T.cruyffDatang - 0.1)} title="1973" big={150} sub="Cruyff datang ke Barcelona" />
    <Chip o={win(t, T.musimPertama, T.limaNol1 - 0.1)} kicker="MUSIM PERTAMA" title="DI KANDANG REAL MADRID" big={60} />
    <BigLine o={win(t, T.limaNol1, T.dinanti)} top={400}>
      <div style={{ fontFamily: ANTON, fontSize: 170, lineHeight: 1, color: VERM }}>5-0</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: BG }}>dan gelar liga yang lama dinanti</div>
    </BigLine>
    <Chip o={win(t, T.gagasan, T.ruangEnd + 0.2)} kicker="GAGASAN SEDERHANA" title="KUASAI BOLA, KUASAI RUANG" big={56} accent={VERM} />

    {/* PENGEMBANGAN */}
    <NameCard o={win(t, T.pelatih, T.dreamTeamEnd + 0.3)} kicker="SEBAGAI PELATIH" name="CRUYFF" sub="membangun Dream Team" />
    <BigLine o={win(t, T.empatGelar, T.beruntun + 0.3)} top={360}>
      <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1, color: GOLD }}>4</div>
      <div style={{ fontFamily: SERIF, fontSize: 44, color: BG }}>La Liga beruntun</div>
    </BigLine>
    <Chip o={win(t, T.trofiPiala, T.wembley + 0.3)} kicker="PIALA EROPA PERTAMA" title="WEMBLEY, 1992" big={70} />
    <NameCard o={win(t, T.koeman, T.koemanEnd + 0.5)} kicker="TENDANGAN BEBAS" name="RONALD KOEMAN" />
    <Chip o={win(t, T.akademi - 0.1, T.laMasia1End + 0.3)} kicker="WARISAN TERBESAR" title="LA MASIA" big={100} sub="akademi yang mengakar" accent={GOLD} />

    {/* PENJELASAN */}
    <Chip o={win(t, T.tahun2008, T.pepGuardiola - 0.1)} title="2008" big={150} sub="lulusan ajaran Cruyff" />
    <NameCard o={win(t, T.pepGuardiola, T.pepEnd + 0.5)} kicker="NAIK KE KURSI PELATIH" name="PEP GUARDIOLA" />
    <Chip o={win(t, T.tikiTaka - 0.1, T.tikiTakaEnd + 0.5)} kicker="GAYA BARU" title="TIKI-TAKA" big={110} accent={VERM} />
    <Chip o={win(t, T.treble1, T.trebleEnd + 0.3)} kicker="MUSIM 2008/09" title="TREBLE PERTAMA SPANYOL" big={62} sub="termasuk 2-0 atas Man United" />
    <BigLine o={win(t, T.enamTrofi, T.kalender + 0.5)} top={340}>
      <div style={{ fontFamily: ANTON, fontSize: 170, lineHeight: 1, color: GOLD }}>6</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: BG }}>trofi dalam satu tahun kalender</div>
      <div style={{ fontFamily: PM, fontSize: 40, color: VERM, marginTop: 8, opacity: seg(t, T.belumPernah, T.melakukannya) }}>belum pernah ada yang melakukannya</div>
    </BigLine>

    {/* PAYOFF */}
    <Chip o={win(t, T.tahun2010, T.tigaFinalis - 0.1)} title="2010" big={150} />
    <Chip o={win(t, T.tigaFinalis, T.laMasia2 + 0.3)} kicker="TIGA FINALIS BALLON D'OR" title="SEMUA ANAK LA MASIA" big={58} />
    <BigLine o={win(t, T.messi, T.xaviEnd + 0.8)} top={360}>
      <div style={{ fontFamily: ANTON, fontSize: 80, lineHeight: 1.2, color: GOLD }}>MESSI</div>
      <div style={{ fontFamily: ANTON, fontSize: 70, lineHeight: 1.2, color: BG, opacity: seg(t, T.iniesta - 0.05, T.iniesta + 0.2) }}>INIESTA</div>
      <div style={{ fontFamily: ANTON, fontSize: 70, lineHeight: 1.2, color: BG, opacity: seg(t, T.xavi - 0.05, T.xavi + 0.2) }}>XAVI</div>
    </BigLine>
    <BigLine o={win(t, T.realMadrid2, T.limaNol2End + 0.8)} top={380}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 42, color: BG }}>Real Madrid dibungkam lagi</div>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: VERM }}>5-0</div>
    </BigLine>
    <Chip o={win(t, T.skorSama, T.filosofiEnd + 0.3)} kicker="SKOR YANG SAMA, 36 TAHUN KEMUDIAN" title="FILOSOFI YANG SAMA" big={62} accent={GOLD} />

    {/* OUTRO */}
    <Chip o={win(t, T.iniAudira, T.episode - 0.1)} kicker="SEJARAH SEPAK BOLA" title="AUDIRA" big={110} accent={VERM} />
    <Chip o={win(t, T.episode, T.trebleEnd2 + 0.5)} kicker="EPISODE BERIKUTNYA" title="MANCHESTER UNITED" big={62} sub="dari tragedi Munich ke treble" />
  </>
);

// ---------- karaoke captions ----------
type Group = { words: Word[]; start: number; end: number };
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of WORDS) {
    cur.push(w);
    if (/[.,?!:;]$/.test(w.text)) { chunks.push(cur); cur = []; }
  }
  if (cur.length) chunks.push(cur);
  const merged: Word[][] = [];
  for (let i = 0; i < chunks.length; i++) {
    const ch = chunks[i];
    if (ch.length === 1 && i + 1 < chunks.length) { chunks[i + 1] = [...ch, ...chunks[i + 1]]; continue; }
    if (ch.length === 1 && merged.length) { merged[merged.length - 1] = [...merged[merged.length - 1], ...ch]; continue; }
    merged.push(ch);
  }
  for (const ch of merged) {
    const n = Math.ceil(ch.length / 7);
    const size = Math.ceil(ch.length / n);
    for (let i = 0; i < ch.length; i += size) {
      let part = ch.slice(i, i + size);
      if (ch.length - (i + size) === 1) { part = ch.slice(i); i = ch.length; }
      out.push({ words: part, start: part[0].start, end: part[part.length - 1].end });
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
        <div key={li} style={{ display: "flex", gap: 20, background: PANEL, padding: "6px 24px 12px", borderTop: `2px solid ${GOLD}`, borderBottom: `2px solid ${GOLD}` }}>
          {ln.map((w, wi) => {
            const active = t >= w.start && t < w.end + 0.05;
            const said = t >= w.start;
            const b = active ? 1 + 0.04 * (1 - seg(t, w.start, w.start + 0.18)) : 1;
            return (
              <span key={wi} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.18, color: active ? GOLD : said ? BG : "rgba(245,240,230,0.5)", transform: `scale(${b})`, display: "inline-block", whiteSpace: "nowrap" }}>
                {w.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------- ink wash transitions ----------
const InkWash: React.FC<{ t: number; c: number }> = ({ t, c }) => {
  const p = (t - (c - 0.2)) / 0.5;
  if (p <= 0 || p >= 1) return null;
  const e = p * p * (3 - 2 * p);
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(20,19,18,${0.7 * (1 - Math.abs(e - 0.5) * 2)}) 0%, transparent 70%)` }} />
  );
};

export { TOTAL_SECONDS };

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender("ep12 fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load("110px 'Anton'"), document.fonts.load("40px 'Permanent Marker'")])
      .catch(() => undefined)
      .then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  const coverO = 1 - seg(t, 1.1, 2.75);
  return (
    <AbsoluteFill style={{ background: INK_PALETTE.agedXuanPaper }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 36, near: 0.05, far: 30 }}>
          <FilmScene t={t} frame={frame} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - coverO, background: "linear-gradient(180deg, rgba(20,19,18,0.55) 0%, rgba(20,19,18,0.2) 22%, transparent 34%, transparent 62%, rgba(20,19,18,0.4) 80%, rgba(20,19,18,0.55) 100%)" }} />
        {coverO > 0.001 && (
          <div style={{ position: "absolute", inset: 0, opacity: coverO }}>
            <Cover />
          </div>
        )}
        {ready && <HUD t={t} />}
        <Captions t={t} />
        {[CUT.konteks, CUT.pengembangan, CUT.penjelasan, CUT.payoff, CUT.outro].map((c) => (
          <InkWash key={c} t={t} c={c} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
