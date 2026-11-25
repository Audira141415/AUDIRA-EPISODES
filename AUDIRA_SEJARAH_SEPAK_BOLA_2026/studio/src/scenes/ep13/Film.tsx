import React, { useState, useEffect } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { MOSAIC_PALETTE } from "../../kits/mosaicforge/lib/palette.ts";
import { FilmScene } from "./FilmScene.tsx";
import { Cover } from "./Cover.tsx";
import { TOTAL_SECONDS, T, CUT, seg, win, WORDS, type Word } from "./timing.ts";
import { delayRender, continueRender } from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";
import { loadFont as loadPalatinoFallback } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily: ANTON } = loadFont();
const { fontFamily: PLAYFAIR } = loadPalatinoFallback();
const SERIF = `'Palatino Linotype', ${PLAYFAIR}, 'Georgia', serif`;

const ROOM = MOSAIC_PALETTE.room;
const CREAM = MOSAIC_PALETTE.cream;
const GOLD_HUD = MOSAIC_PALETTE.goldPale ?? "#F2D27A";
const GOLD = MOSAIC_PALETTE.gold;
const MAN_RED = "#DA291C";
const COBALT_CARD = "rgba(19, 48, 111, 0.88)";

const CAM_POS: [number, number, number] = [0.5, 0.6, 6.4];

// ---------- HUD components ----------
const Chip: React.FC<{
  o: number; kicker?: string; title: string; big?: number; sub?: string; accent?: string;
}> = ({ o, kicker, title, big = 80, sub, accent = GOLD_HUD }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 60, right: 60, top: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: o }}>
      {kicker && <div style={{ fontFamily: SERIF, fontSize: 36, color: GOLD_HUD, letterSpacing: 2 }}>{kicker}</div>}
      <div style={{ background: COBALT_CARD, padding: "12px 36px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: ANTON, fontWeight: 400, fontSize: big, lineHeight: 1.1, color: CREAM }}>{title}</div>
      </div>
      {sub && <div style={{ fontFamily: SERIF, fontSize: 34, color: GOLD_HUD, fontStyle: "italic", textAlign: "center" }}>{sub}</div>}
    </div>
  );

const BigLine: React.FC<{ o: number; top?: number; children: React.ReactNode; scale?: number }> = ({ o, top = 320, children, scale = 1 }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${scale})` }}>
      <div style={{ background: COBALT_CARD, padding: "14px 40px 20px", textAlign: "center" }}>{children}</div>
    </div>
  );

const NameCard: React.FC<{ o: number; kicker: string; name: string; sub?: string }> = ({ o, kicker, name, sub }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 60, right: 60, top: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: o }}>
      <div style={{ fontFamily: SERIF, fontSize: 34, color: GOLD_HUD }}>{kicker}</div>
      <div style={{ background: COBALT_CARD, padding: "16px 44px 20px", borderLeft: `4px solid ${GOLD}` }}>
        <div style={{ fontFamily: ANTON, fontSize: 72, color: CREAM, lineHeight: 1.1 }}>{name}</div>
        {sub && <div style={{ fontFamily: SERIF, fontSize: 34, color: GOLD_HUD, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );

// ---------- HUD ----------
const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* HOOK */}
    <Chip o={win(t, T.enamFeb, T.delapan1958 + 0.3, 0.2, 0.25)} title="6 FEBRUARI 1958" big={72} />
    <Chip o={win(t, T.pesawat, T.munich1 + 0.2)} kicker="MUNICH" title="PESAWAT GAGAL LEPAS LANDAS" big={54} sub="di salju Munich" />
    <BigLine o={win(t, T.delapanPemain, T.united1 + 0.3)} top={400}>
      <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1, color: MAN_RED }}>8</div>
      <div style={{ fontFamily: SERIF, fontSize: 44, color: CREAM }}>pemain muda Manchester United</div>
    </BigLine>

    {/* KONTEKS */}
    <Chip o={win(t, T.busbyBabes, T.babesEnd + 0.5)} kicker="MEREKA DIJULUKI" title="BUSBY BABES" big={90} accent={MAN_RED} />
    <NameCard o={win(t, T.mattBusby1, T.busby1End + 0.5)} kicker="TIM BELIA BENTUKAN" name="MATT BUSBY" />
    <Chip o={win(t, T.perjalanan, T.beograd + 0.3)} kicker="PERJALANAN PULANG" title="LAGA PIALA EROPA" big={60} sub="di Beograd" />
    <Chip o={win(t, T.singgahMunich, T.munichEnd2 + 0.3)} kicker="SINGGAH DI" title="MUNICH" big={120} />
    <Chip o={win(t, T.percobaanKetiga, T.saljuBasah + 0.3)} kicker="PERCOBAAN KETIGA" title="GAGAL LEPAS LANDAS" big={62} sub="landasan tertutup salju basah" />

    {/* PENGEMBANGAN */}
    <BigLine o={win(t, T.empatPuluhEmpat, T.tewasEnd + 0.5)} top={340}>
      <div style={{ fontFamily: SERIF, fontSize: 42, color: GOLD_HUD }}>dari 44 orang di pesawat</div>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: MAN_RED }}>23</div>
      <div style={{ fontFamily: SERIF, fontSize: 44, color: CREAM }}>tewas</div>
    </BigLine>
    <Chip o={win(t, T.delapanPemain2, T.pemainEnd + 0.3)} title="8 DI ANTARANYA PEMAIN" big={60} accent={MAN_RED} />
    <NameCard o={win(t, T.duncanEdwards, T.kemudian + 0.3)} kicker="SELAMAT DARI LOKASI" name="DUNCAN EDWARDS" sub="wafat 15 hari kemudian" />
    <NameCard o={win(t, T.mattBusby2, T.bertahanEnd + 0.3)} kicker="DUA KALI SAKRAMEN TERAKHIR" name="MATT BUSBY" sub="namun ia bertahan" />

    {/* PENJELASAN */}
    <BigLine o={win(t, T.sepuluhTahun, T.puing + 0.5)} top={360}>
      <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1, color: GOLD }}>10</div>
      <div style={{ fontFamily: SERIF, fontSize: 44, color: CREAM }}>tahun membangun kembali dari puing</div>
    </BigLine>
    <Chip o={win(t, T.duaPuluhSembilan, T.mei1968 + 0.3)} title="29 MEI 1968" big={80} sub="Wembley" />
    <BigLine o={win(t, T.manchesterUtd2, T.empatSatuEnd + 0.5)} top={370}>
      <div style={{ fontFamily: SERIF, fontSize: 42, color: CREAM }}>Man United vs Benfica</div>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: GOLD }}>4-1</div>
    </BigLine>
    <Chip o={win(t, T.klubInggrisPertama, T.juaraEropaEnd + 0.5)} kicker="KLUB INGGRIS PERTAMA" title="JUARA EROPA" big={80} accent={GOLD} />
    <NameCard o={win(t, T.bobbyCharlton, T.malamItu)} kicker="PENYINTAS MUNICH" name="BOBBY CHARLTON" sub="mencetak 2 gol di malam itu" />

    {/* PAYOFF */}
    <BigLine o={win(t, T.tigaPuluhSatu, T.kemudian2 + 0.3)} top={370}>
      <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1, color: GOLD }}>31</div>
      <div style={{ fontFamily: SERIF, fontSize: 44, color: CREAM }}>tahun kemudian</div>
    </BigLine>
    <NameCard o={win(t, T.alexFerguson, T.fergusonEnd + 0.5)} kicker="MERAIH YANG BELUM PERNAH" name="ALEX FERGUSON" />
    <Chip o={win(t, T.treble, T.trebleEnd + 0.8)} title="TREBLE" big={120} accent={MAN_RED} />
    <BigLine o={win(t, T.liga, T.satuMusim + 0.5)} top={350}>
      <div style={{ fontFamily: ANTON, fontSize: 60, lineHeight: 1.3, color: CREAM }}>LIGA</div>
      <div style={{ fontFamily: ANTON, fontSize: 60, lineHeight: 1.3, color: GOLD, opacity: seg(t, T.pialaFA, T.pialaFA + 0.3) }}>PIALA FA</div>
      <div style={{ fontFamily: ANTON, fontSize: 60, lineHeight: 1.3, color: MAN_RED, opacity: seg(t, T.ligaChampions, T.ligaChampions + 0.3) }}>LIGA CHAMPIONS</div>
      <div style={{ fontFamily: SERIF, fontSize: 38, color: GOLD_HUD, marginTop: 6, opacity: seg(t, T.champions + 0.5, T.satuMusim) }}>dalam satu musim</div>
    </BigLine>
    <Chip o={win(t, T.finalnya, T.campNou + 0.5)} kicker="FINAL VS BAYERN" title="DI CAMP NOU" big={70} />
    <Chip o={win(t, T.ulangTahun, T.busby90End + 0.5)} kicker="TANGGAL ULANG TAHUN KE-90" title="MATT BUSBY" big={80} accent={GOLD} />
    <Chip o={win(t, T.tertinggal, T.sembilanPuluh + 0.3)} kicker="TERTINGGAL" title="SAMPAI MENIT 90" big={70} accent={MAN_RED} />
    <BigLine o={win(t, T.duaGol2, T.segalanya + 0.5)} top={350}>
      <div style={{ fontFamily: SERIF, fontSize: 40, color: CREAM }}>dua gol di masa tambahan</div>
      <div style={{ fontFamily: ANTON, fontSize: 70, lineHeight: 1.2, color: GOLD, opacity: seg(t, T.sheringham, T.sheringhamEnd + 0.3) }}>SHERINGHAM</div>
      <div style={{ fontFamily: ANTON, fontSize: 70, lineHeight: 1.2, color: MAN_RED, opacity: seg(t, T.solskjaer, T.solskjaerEnd + 0.3) }}>SOLSKJAER</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: GOLD_HUD, marginTop: 6, opacity: seg(t, T.membalik, T.segalanya) }}>membalik segalanya</div>
    </BigLine>

    {/* OUTRO */}
    <Chip o={win(t, T.iniAudira, T.episode - 0.1)} kicker="SEJARAH SEPAK BOLA" title="AUDIRA" big={110} accent={MAN_RED} />
    <Chip o={win(t, T.episode, T.istanbul + 0.5)} kicker="EPISODE BERIKUTNYA" title="LIVERPOOL" big={80} sub="dari Boot Room ke keajaiban Istanbul" />
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
        <div key={li} style={{ display: "flex", gap: 20, background: COBALT_CARD, padding: "6px 24px 12px" }}>
          {ln.map((w, wi) => {
            const active = t >= w.start && t < w.end + 0.05;
            const said = t >= w.start;
            const b = active ? 1 + 0.04 * (1 - seg(t, w.start, w.start + 0.18)) : 1;
            return (
              <span key={wi} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.18, color: active ? GOLD : said ? CREAM : "rgba(239,227,200,0.5)", transform: `scale(${b})`, display: "inline-block", whiteSpace: "nowrap" }}>
                {w.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------- mosaic dust transition ----------
const MosaicDust: React.FC<{ t: number; c: number }> = ({ t, c }) => {
  const p = (t - (c - 0.2)) / 0.5;
  if (p <= 0 || p >= 1) return null;
  const e = p * p * (3 - 2 * p);
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(42,29,20,${0.65 * (1 - Math.abs(e - 0.5) * 2)}) 0%, transparent 70%)` }} />
  );
};

export { TOTAL_SECONDS };

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender("ep13 fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load("110px 'Anton'"), document.fonts.load("60px 'Playfair Display'")])
      .catch(() => undefined)
      .then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  const coverO = 1 - seg(t, 1.1, 2.75);
  return (
    <AbsoluteFill style={{ background: ROOM }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 52, near: 0.05, far: 30 }}>
          <FilmScene t={t} frame={frame} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - coverO, background: "linear-gradient(180deg, rgba(42,29,20,0.55) 0%, rgba(42,29,20,0.2) 22%, transparent 34%, transparent 62%, rgba(42,29,20,0.4) 80%, rgba(42,29,20,0.55) 100%)" }} />
        {coverO > 0.001 && (
          <div style={{ position: "absolute", inset: 0, opacity: coverO }}>
            <Cover />
          </div>
        )}
        {ready && <HUD t={t} />}
        <Captions t={t} />
        {[CUT.konteks, CUT.pengembangan, CUT.penjelasan, CUT.payoff, CUT.outro].map((c) => (
          <MosaicDust key={c} t={t} c={c} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
