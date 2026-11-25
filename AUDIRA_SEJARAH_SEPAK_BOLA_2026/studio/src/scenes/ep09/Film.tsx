// EP09 film "Gol Tangan Tuhan 1986" (COMICFORGE): a living comic page. Each beat is a slanted panel with its own
// halftone 3D scene and moving camera; new panels wipe in along the reading direction. Frame 0 = approved cover.
// All beats come from timeline.json (locked VO). Audio is muxed separately by the lead. Root adds signature + outro card.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ANTON,
  Box,
  GROT,
  GREEN,
  NameTag,
  P1,
  P1_CAM,
  P1_TARGET,
  P2,
  P2_CAM,
  P2_TARGET,
  PAGE_X,
  PANEL_W,
  Panel1Bg,
  Panel1Scene,
  Panel2Bg,
  Panel2Scene,
  burstPoints,
  useFonts,
} from "./Cover.tsx";
import { V3 } from "./comic.tsx";
import { Balloon, Burst, GOLD, NameCard, NarrBox, P, PageBg, Panel, RaysBg, Rect, ScoreChip, SkyBg, Stage, Stamp, project, useFilmMats, useK } from "./filmKit.tsx";
import {
  FALKLANDS_POS,
  FistScene,
  FlagsScene,
  HandScene,
  LinesmanScene,
  MAP_KEYS,
  MapScene,
  PressScene,
  RefScene,
  RunScene,
  ScoreScene,
  StadiumScene,
  TrophyScene,
  TvScene,
  handCam,
} from "./filmScenes.tsx";
import { camPath } from "./filmKit.tsx";
import { CLIPS, T, TOTAL, Word, easeInOut, lin, pop, seg, win } from "./timing.ts";

const MAIN: Rect = { x: 40, y: 300, w: 1000, h: 1580 };
const WIPE = 0.42;

// shot start times (each wipes in over the previous one)
const S = {
  stadium: 4.85,
  flags: 11.2,
  score1: 19.0,
  hand: 21.0,
  ref: 32.0,
  tv: 36.3,
  clock: 39.2,
  run: 42.0,
  lineker: 50.5,
  press: 54.7,
  fist: 60.6,
  abad: 63.2,
  trophy: 67.2,
  outro: 71.6,
};
const ORDER = Object.values(S);
const nextAfter = (a: number) => ORDER.find((x) => x > a) ?? TOTAL + 1;
/** Is the shot that starts at `a` on screen (from its wipe until the next shot fully covers it)? */
const live = (t: number, a: number) => t >= a && t < nextAfter(a) + WIPE + 0.05;
const rev = (t: number, a: number) => seg(t, a, a + WIPE);

// =====================================================================
// HOOK: the approved cover page, alive (frame 0 identical to the cover).
// =====================================================================
const FistIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={18} y={34} width={64} height={52} rx={16} fill="#F4C9A0" stroke={P.ink} strokeWidth={7} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={18 + i * 16} y={18} width={16} height={30} rx={8} fill="#F4C9A0" stroke={P.ink} strokeWidth={6} />
    ))}
    <path d="M18,60 Q6,52 14,40 L30,48" fill="#F4C9A0" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);
const RunIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {[24, 44, 64].map((y, i) => (
      <rect key={i} x={6 + i * 6} y={y} width={40 - i * 8} height={8} rx={4} fill={P.ink} />
    ))}
    <circle cx={70} cy={58} r={22} fill="#FFFFFF" stroke={P.ink} strokeWidth={7} />
    <polygon points="70,46 80,54 76,66 64,66 60,54" fill={P.ink} />
  </svg>
);

const MinuteBadge: React.FC<{ t: number; a: number; x: number; y: number; right?: boolean; bg: string; color: string; text: string; sub: string; icon: React.ReactNode }> = ({
  t,
  a,
  x,
  y,
  right,
  bg,
  color,
  text,
  sub,
  icon,
}) => {
  const o = seg(t, a, a + 0.12);
  if (o <= 0.001) return null;
  const s = 0.6 + 0.4 * pop(t, a, 0.3);
  return (
    <div
      style={{
        position: "absolute",
        [right ? "right" : "left"]: x,
        top: y,
        opacity: o,
        transform: `scale(${s}) rotate(${right ? 2 : -2}deg)`,
        transformOrigin: right ? "right top" : "left top",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: bg,
        border: `6px solid ${P.ink}`,
        boxShadow: `9px 9px 0 ${P.ink}`,
        padding: "4px 20px 4px 10px",
      }}
    >
      {icon}
      <div style={{ lineHeight: 0.95 }}>
        <div style={{ fontFamily: ANTON, fontSize: 104, color, WebkitTextStroke: `5px ${P.ink}`, paintOrder: "stroke fill" }}>{text}</div>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 32, color: P.ink }}>{sub}</div>
      </div>
    </div>
  );
};

const Hook: React.FC<{ t: number; m: ReturnType<typeof useFilmMats> }> = ({ t, m }) => {
  const k = useK();
  const zoom = seg(t, 4.7, 5.3);
  const fade = 1 - seg(t, 4.95, 5.3);
  if (fade <= 0.001) return null;
  const p = easeInOut(lin(t, 0, 4.9));
  const c1: V3 = [P1_CAM[0] - 0.25 * p, P1_CAM[1] + 0.06 * p, P1_CAM[2] - 0.45 * p];
  const t1: V3 = [P1_TARGET[0], P1_TARGET[1] + 0.05 * p, P1_TARGET[2]];
  const c2: V3 = [P2_CAM[0] + 0.7 * p, P2_CAM[1] + 0.1 * p, P2_CAM[2] - 0.4 * p];
  const t2: V3 = [P2_TARGET[0] + 0.5 * p, P2_TARGET[1], P2_TARGET[2]];
  const kicker = 1 - seg(t, 2.0, 2.4);
  const tags = 1 - seg(t, 0.85, 1.1);
  const title = 1 - seg(t, 4.35, 4.8);
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `scale(${1 + 1.4 * zoom})`, transformOrigin: `${540 * k}px ${1520 * k}px` }}>
      <Panel r={{ x: PAGE_X, y: P1.top, w: PANEL_W, h: P1.h }} slant={[0, 0, 60, 0]} bg={<Panel1Bg />} camera={P1_CAM}>
        <Panel1Scene m={m} cam={c1} target={t1} />
      </Panel>
      <Panel r={{ x: PAGE_X, y: P2.top, w: PANEL_W, h: P2.h }} slant={[60, 0, 0, 0]} bg={<Panel2Bg />} camera={P2_CAM}>
        <Panel2Scene m={m} cam={c2} target={t2} />
      </Panel>
      <Stage>
        <div style={{ opacity: kicker }}>
          <div style={{ position: "absolute", left: 56, top: 190, background: P.ink, padding: "6px 16px 4px", fontFamily: GROT, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: GREEN }}>
            SEJARAH SEPAK BOLA #09
          </div>
          <div style={{ position: "absolute", right: 56, top: 190, background: P.yellow, border: `4px solid ${P.ink}`, boxShadow: `5px 5px 0 ${P.ink}`, padding: "4px 14px 2px", fontFamily: ANTON, fontSize: 32, letterSpacing: 2, color: P.ink, transform: "rotate(2deg)" }}>
            AUDIRA
          </div>
        </div>
        <div style={{ opacity: title }}>
          <div style={{ position: "absolute", left: 50, top: 252, fontFamily: ANTON, lineHeight: 0.98, transform: "rotate(-3deg) skewX(-6deg)", transformOrigin: "left top" }}>
            <div style={{ fontSize: 132, color: "#FFFFFF", WebkitTextStroke: `5px ${P.ink}`, paintOrder: "stroke fill", textShadow: `8px 8px 0 ${P.ink}` }}>DUA GOL,</div>
            <div style={{ fontSize: 132, color: P.yellow, WebkitTextStroke: `5px ${P.ink}`, paintOrder: "stroke fill", textShadow: `8px 8px 0 ${P.ink}` }}>EMPAT MENIT</div>
          </div>
          <Box style={{ left: 60, top: 522, fontSize: 40, background: "#FFF6E0", fontFamily: GROT, fontWeight: 700, letterSpacing: 0.5, padding: "4px 18px 4px" }}>Argentina 2–1 Inggris · 1986</Box>
        </div>
        {t < T.curang + 0.05 && (
          <div style={{ opacity: 1 - seg(t, T.curang - 0.12, T.curang) }}>
            <Box style={{ left: 66, top: 628, fontSize: 40, letterSpacing: 1 }}>MENIT 51</Box>
          </div>
        )}
        <MinuteBadge t={t} a={T.curang} x={64} y={624} bg={P.red} color="#FFFFFF" text="51'" sub="TANGAN" icon={<FistIcon size={104} />} />
        <div style={{ position: "absolute", left: 690, top: P1.top + 34, transform: `scale(${0.82 + 0.03 * Math.sin(t * 9)})`, transformOrigin: "left top" }}>
          <svg width={440} height={260} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <polygon points={burstPoints(215, 125, 15, 225, 150, 909)} fill={P.ink} transform="translate(9,9)" />
            <polygon points={burstPoints(215, 125, 15, 225, 150, 909)} fill={P.red} stroke={P.ink} strokeWidth={7} />
            <polygon points={burstPoints(215, 125, 13, 168, 128, 911)} fill={P.yellow} />
          </svg>
          <div style={{ position: "absolute", left: 0, top: 58, width: 430, textAlign: "center", fontFamily: ANTON, fontSize: 112, lineHeight: 1, color: P.red, WebkitTextStroke: `6px ${P.ink}`, paintOrder: "stroke fill", transform: "rotate(-6deg)", textShadow: `6px 6px 0 ${P.ink}` }}>
            TANGAN?!
          </div>
        </div>
        {tags > 0.001 && (
          <div style={{ opacity: tags }}>
            <NameTag name="MARADONA" role="Argentina #10" style={{ left: 70, top: 1040 }} />
            <NameTag name="SHILTON" role="kiper Inggris" style={{ left: 712, top: 1012, transform: "rotate(-2deg)" }} />
          </div>
        )}
        <NarrBox t={t} a={T.empat} b={9} x={60} y={1112} size={64} bg="#FFFFFF" rot={-3}>
          4 MENIT
        </NarrBox>
        {t < T.terindah + 0.05 && (
          <div style={{ opacity: 1 - seg(t, T.terindah - 0.12, T.terindah) }}>
            <Box style={{ right: 66, top: 1200, fontSize: 54, letterSpacing: 1, transform: "rotate(-2deg)" }}>MENIT 55 · GOL ABAD INI</Box>
          </div>
        )}
        <MinuteBadge t={t} a={T.terindah} x={64} y={1166} right bg={GOLD} color="#FFFFFF" text="55'" sub="LARI SOLO" icon={<RunIcon size={104} />} />
      </Stage>
    </AbsoluteFill>
  );
};

// =====================================================================
// SHOTS (3D panels)
// =====================================================================
const Shots: React.FC<{ t: number; m: ReturnType<typeof useFilmMats> }> = ({ t, m }) => {
  const W = MAIN.w;
  const H = MAIN.h;
  const minute = Math.min(55, 51 + Math.floor(4 * lin(t, T.kemudian + 0.1, T.menit55 + 0.62) + 1e-6));
  const flipT = lin(t, T.m81, T.m81 + 0.5);
  return (
    <>
      {live(t, S.stadium) && (
        <Panel r={MAIN} slant={[40, 0, 0, 0]} reveal={rev(t, S.stadium)} bg={<SkyBg w={W} h={H} top="#5DB8EC" low="#FFF6E0" dot="#00A3E0" />}>
          <StadiumScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.flags) && (
        <>
          <Panel r={{ x: 40, y: 300, w: 1000, h: 480 }} slant={[0, 0, 36, 0]} reveal={rev(t, S.flags)} bg={<RaysBg w={1000} h={480} cx={500} cy={240} inner="#FFF6E0" outer="#FF6FB0" ray="#FFFFFF" dot="#E5007D" seed={12} />}>
            <FlagsScene m={m} t={t} />
          </Panel>
          {/* page strip between panels until the map arrives */}
          <Panel r={{ x: 40, y: 790, w: 1000, h: 1090 }} slant={[36, 0, 0, 0]} reveal={seg(t, T.empatTahun - 0.4, T.empatTahun)} bg={<SkyBg w={1000} h={1090} top="#1B5FA0" low="#2B2E8C" dot="#00A3E0" />}>
            <MapScene m={m} t={t} />
          </Panel>
        </>
      )}
      {live(t, S.score1) && (
        <Panel r={MAIN} slant={[0, 40, 0, 0]} reveal={rev(t, S.score1)} bg={<SkyBg w={W} h={H} top="#5DB8EC" low="#FFE100" dot="#00A3E0" />}>
          <ScoreScene m={m} t={t} a={S.score1} b={21.4} face={["PEREMPAT FINAL 1986", "ARG", "0–0", "ING", "BABAK PERTAMA"]} />
        </Panel>
      )}
      {live(t, S.hand) && (
        <Panel r={MAIN} slant={[40, 0, 0, 0]} reveal={rev(t, S.hand)} bg={<RaysBg w={W} h={H} cx={560} cy={260} inner="#FFF6E0" outer="#5DB8EC" ray="#FFFFFF" dot="#4FA9E3" seed={51} />}>
          <HandScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.ref) && (
        <>
          <Panel r={{ x: 40, y: 300, w: 1000, h: 570 }} slant={[0, 0, 36, 0]} reveal={rev(t, S.ref)} bg={<RaysBg w={1000} h={570} cx={500} cy={200} inner="#FFF6E0" outer="#FFE100" ray="#FFFFFF" ray2="#FF6FB0" dot="#E39A00" seed={33} />}>
            <RefScene m={m} t={t} />
          </Panel>
          <Panel r={{ x: 40, y: 884, w: 1000, h: 996 }} slant={[36, 0, 0, 0]} reveal={seg(t, T.hakim - 0.5, T.hakim - 0.1)} bg={<SkyBg w={1000} h={996} top="#5DB8EC" low="#FFF6E0" dot="#00A3E0" />}>
            <LinesmanScene m={m} t={t} />
          </Panel>
        </>
      )}
      {live(t, S.tv) && (
        <Panel r={MAIN} slant={[0, 40, 0, 0]} reveal={rev(t, S.tv)} bg={<RaysBg w={W} h={H} cx={500} cy={700} inner="#FFF6E0" outer="#00A3E0" ray="#FFFFFF" dot="#005E9E" seed={86} />}>
          <TvScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.clock) && (
        <Panel r={MAIN} slant={[40, 0, 0, 0]} reveal={rev(t, S.clock)} bg={<SkyBg w={W} h={H} top="#5DB8EC" low="#FFE100" dot="#00A3E0" />}>
          <ScoreScene m={m} t={t} a={S.clock} b={42.6} face={["PEREMPAT FINAL 1986", "ARG", "1–0", "ING", `MENIT ${minute}`]} />
        </Panel>
      )}
      {live(t, S.run) && (
        <Panel r={MAIN} slant={[0, 40, 0, 0]} reveal={rev(t, S.run)} bg={<SkyBg w={W} h={H} top="#5DB8EC" low="#FFF6E0" dot="#00A3E0" />}>
          <RunScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.lineker) && (
        <Panel r={MAIN} slant={[40, 0, 0, 0]} reveal={rev(t, S.lineker)} bg={<SkyBg w={W} h={H} top="#5DB8EC" low="#FFE100" dot="#00A3E0" />}>
          <ScoreScene
            m={m}
            t={t}
            a={S.lineker}
            b={55}
            flip={flipT}
            lineker
            face={flipT < 0.5 ? ["PEREMPAT FINAL 1986", "ARG", "2–0", "ING", "BABAK KEDUA"] : ["PEREMPAT FINAL 1986", "ARG", "2–1", "ING", "MENIT 81"]}
          />
        </Panel>
      )}
      {live(t, S.press) && (
        <Panel r={MAIN} slant={[0, 40, 0, 0]} reveal={rev(t, S.press)} bg={<RaysBg w={W} h={H} cx={500} cy={900} inner="#FFF6E0" outer="#E5007D" ray="#FFFFFF" dot="#8E0050" seed={57} />}>
          <PressScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.fist) && (
        <Panel r={MAIN} slant={[40, 0, 0, 0]} reveal={rev(t, S.fist)} bg={<RaysBg w={W} h={H} cx={520} cy={520} inner="#FFE100" outer="#ED1C24" ray="#FFFFFF" ray2="#FFE100" dot="#8E0010" seed={2005} rot={t * 6} />}>
          <FistScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.abad) && (
        <Panel r={MAIN} slant={[0, 40, 0, 0]} reveal={rev(t, S.abad)} bg={<SkyBg w={W} h={H} top="#FFE100" low="#FFF6E0" dot="#E39A00" />}>
          <RunScene m={m} t={t} abad />
        </Panel>
      )}
      {live(t, S.trophy) && (
        <Panel r={MAIN} slant={[40, 0, 0, 0]} reveal={rev(t, S.trophy)} bg={<RaysBg w={W} h={H} cx={500} cy={640} inner="#FFF6E0" outer="#74ACDF" ray="#FFFFFF" ray2="#FFE100" dot="#00A3E0" seed={1986} rot={-t * 4} />}>
          <TrophyScene m={m} t={t} />
        </Panel>
      )}
      {live(t, S.outro) && (
        <Panel r={MAIN} slant={[0, 40, 0, 0]} reveal={rev(t, S.outro)} bg={<SkyBg w={W} h={H} top="#2B2E8C" low="#FF6FB0" dot="#E5007D" dotOpacity={0.4} />}>
          <StadiumScene m={m} t={t} outro />
        </Panel>
      )}
    </>
  );
};

// =====================================================================
// HUD (screen-space comic lettering)
// =====================================================================
const flashes = Array.from({ length: 9 }, (_, i) => ({ t: 55.0 + i * 0.62 + (i % 3) * 0.13, x: 120 + ((i * 337) % 820), y: 760 + ((i * 211) % 420) }));

const HUD: React.FC<{ t: number }> = ({ t }) => {
  const tap = project([0.42, 2.36, -0.44], handCam(T.kepalan), MAIN.w, MAIN.h);
  const mapCam = camPath(MAP_KEYS, t);
  const isl = project(FALKLANDS_POS, mapCam, 1000, 1090);
  const islX = 40 + isl.x;
  const islY = 790 + isl.y;
  return (
    <>
      {/* ---- konteks: stadium ---- */}
      <NarrBox t={t} a={T.tanggal} b={S.flags + 0.3} x={60} y={330} size={80}>
        22 JUNI 1986
      </NarrBox>
      <NarrBox t={t} a={T.perempat} b={S.flags + 0.3} x={60} y={450} size={46} bg="#FFFFFF" rot={1}>
        PEREMPAT FINAL · PIALA DUNIA
      </NarrBox>
      <NarrBox t={t} a={T.stadion} b={S.flags + 0.3} x={60} y={540} size={46} bg={GREEN} rot={-1}>
        STADION AZTECA, MEKSIKO
      </NarrBox>
      {/* ---- konteks: flags + map ---- */}
      <NarrBox t={t} a={T.argentina} b={S.score1 + 0.3} x={70} y={690} size={44} bg="#74ACDF" rot={-2}>
        ARGENTINA
      </NarrBox>
      <NarrBox t={t} a={T.argentina + 0.45} b={S.score1 + 0.3} x={70} y={690} size={44} bg="#FFFFFF" rot={2} right>
        INGGRIS
      </NarrBox>
      <Burst t={t} a={T.argentina + 0.4} b={S.score1 + 0.3} cx={540} cy={560} text="VS" size={0.55} seed={404} />
      <NarrBox t={t} a={T.empatTahun} b={S.score1 + 0.3} x={60} y={830} size={44} rot={-1.5}>
        4 TAHUN SEBELUMNYA
      </NarrBox>
      {t > T.falklands && t < S.score1 + 0.3 && (
        <div style={{ position: "absolute", inset: 0, opacity: win(t, T.falklands, S.score1 + 0.3, 0.25, 0.25) }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <line x1={islX} y1={islY - 20} x2={Math.min(islX, 700)} y2={islY - 150} stroke={P.ink} strokeWidth={7} />
            <circle cx={islX} cy={islY - 10} r={10} fill={P.ink} />
          </svg>
          <div style={{ position: "absolute", left: Math.min(islX, 700) - 330, top: islY - 262, width: 660, textAlign: "center", background: "#FFFFFF", border: `5px solid ${P.ink}`, boxShadow: `7px 7px 0 ${P.ink}`, padding: "6px 10px 4px", fontFamily: ANTON, fontSize: 40, lineHeight: 1.1, color: P.ink }}>
            KEPULAUAN FALKLANDS
            <div style={{ color: "#005E9E" }}>{t > T.malvinas - 0.1 ? "/ MALVINAS" : " "}</div>
          </div>
        </div>
      )}
      <NarrBox t={t} a={T.perang} b={S.score1 + 0.3} x={60} y={1205} size={44} bg="#FFF6E0" rot={1}>
        PERANG 1982 · DIMENANGKAN INGGRIS
      </NarrBox>
      {/* ---- pengembangan ---- */}
      <NarrBox t={t} a={S.score1 + 0.25} b={S.hand + 0.2} x={60} y={330} size={56} bg="#FFFFFF">
        BABAK PERTAMA: 0–0
      </NarrBox>
      <ScoreChip o={win(t, S.hand + 0.3, S.ref + 0.3)} score={t > T.gol1 ? "1–0" : "0–0"} minute="51'" />
      <NarrBox t={t} a={T.menit51} b={26.6} x={60} y={330} size={66} bg={P.red} color="#FFFFFF">
        MENIT 51
      </NarrBox>
      <NarrBox t={t} a={T.salah} b={25.3} x={60} y={440} size={40} bg="#FFFFFF" rot={1}>
        SAPUAN SALAH PEMAIN INGGRIS
      </NarrBox>
      <NameCard t={t} a={T.shilton} b={T.melompat} x={56} y={1110} right name="PETER SHILTON" sub="Inggris · kiper" num="1" shirt="#C4CAD4" numColor={P.ink} />
      <NameCard t={t} a={T.maradona} b={T.gol1} x={56} y={1110} name="DIEGO MARADONA" sub="Argentina" num="10" shirt="#2346B0" />
      <NarrBox t={t} a={T.pendek} b={T.kepalan - 0.1} x={60} y={330} size={50} bg="#FFFFFF" rot={-2}>
        JAUH LEBIH PENDEK
      </NarrBox>
      {t > T.kepalan && t < T.kepalan + 0.16 && <div style={{ position: "absolute", inset: 0, background: "#FFF6E0", opacity: 0.7 * (1 - lin(t, T.kepalan, T.kepalan + 0.16)) }} />}
      <Burst t={t} a={T.kepalan} b={T.gol1 - 0.05} cx={Math.min(800, MAIN.x + tap.x + 150)} cy={Math.max(520, MAIN.y + tap.y - 150)} text="TAP!" size={0.85} seed={303} />
      <NarrBox t={t} a={T.kepalan} b={T.gol1 + 0.6} x={60} y={330} size={52} bg={P.red} color="#FFFFFF">
        KEPALAN TANGAN KIRI
      </NarrBox>
      <Burst t={t} a={T.gol1} b={S.ref + 0.35} cx={540} cy={640} text="GOL!" size={1} seed={919} fill={GREEN} />
      <NameCard t={t} a={T.wasit} b={S.tv + 0.3} x={56} y={720} name="ALI BIN NASSER" sub="wasit · Tunisia" shirt="#2A2C36" />
      <Stamp t={t} a={T.sah} b={T.hakim - 0.3} y={380} text="GOL SAH" color="#1E7A3E" size={96} />
      <NarrBox t={t} a={T.hakim} b={S.tv + 0.3} x={60} y={930} size={48} bg="#FFFFFF" rot={-1.5}>
        HAKIM GARIS: DIAM
      </NarrBox>
      <Balloon o={win(t, T.diam - 0.1, S.tv + 0.3, 0.15, 0.25)} x={600} y={960} w={320} h={170} tx={540} ty={1150}>
        <div style={{ fontFamily: ANTON, fontSize: 96, lineHeight: 1, color: P.ink }}>. . .</div>
      </Balloon>
      <NarrBox t={t} a={T.belum} b={S.clock + 0.3} x={60} y={330} size={44} bg="#FFFFFF" rot={-1}>
        1986: BELUM ADA TAYANGAN
        <br />
        ULANG UNTUK WASIT
      </NarrBox>
      <Stamp t={t} a={37.7} b={S.clock + 0.35} y={1020} text="TANPA VAR" size={124} />
      {/* ---- penjelasan ---- */}
      <NarrBox t={t} a={T.kemudian} b={S.run + 0.2} x={60} y={330} size={66}>
        4 MENIT KEMUDIAN
      </NarrBox>
      <ScoreChip o={win(t, S.run + 0.3, S.lineker + 0.3)} score={t > T.gol2 ? "2–0" : "1–0"} minute="55'" />
      <NarrBox t={t} a={S.run + 0.2} b={44.75} x={60} y={330} size={66} bg={GOLD} color="#FFFFFF">
        MENIT 55
      </NarrBox>
      <NarrBox t={t} a={T.menerima + 0.4} b={44.75} x={60} y={440} size={40} bg="#FFFFFF" rot={1}>
        DARI SEPARUH LAPANGAN SENDIRI
      </NarrBox>
      <Stamp t={t} a={T.sepuluh} b={47.05} y={340} text="± 10 DETIK" color={P.ink} size={104} rot={-4} />
      <NarrBox t={t} a={T.melewati} b={T.gol2 + 0.2} x={60} y={330} size={50} bg="#FFFFFF" rot={-1}>
        LEWATI 5 PEMAIN INGGRIS
        <div style={{ fontSize: 36, fontFamily: GROT, fontWeight: 700 }}>4 pemain + kiper Shilton</div>
      </NarrBox>
      <Burst t={t} a={T.gol2} b={S.lineker + 0.35} cx={540} cy={640} text="GOL!" size={1} seed={555} fill={GOLD} />
      <NameCard t={t} a={T.lineker} b={T.menang21} x={56} y={450} right name="GARY LINEKER" sub="Inggris" num="10" shirt="#FFFFFF" numColor="#1E2A6E" />
      <NarrBox t={t} a={T.m81 + 0.3} b={T.menang21} x={60} y={330} size={56} bg="#FFFFFF">
        MENIT 81: 2–1
      </NarrBox>
      <Stamp t={t} a={T.menang21} b={S.press + 0.35} y={340} text="ARGENTINA MENANG 2–1" color="#2346B0" size={74} rot={-3} />
      {/* ---- payoff ---- */}
      <NarrBox t={t} a={T.usai} b={S.fist + 0.3} x={60} y={330} size={44} rot={-1}>
        USAI LAGA · KONFERENSI PERS
      </NarrBox>
      {flashes.map((f, i) => {
        const o = win(t, f.t, f.t + 0.22, 0.03, 0.18);
        if (o <= 0.001 || t < S.press + 0.3 || t > S.fist) return null;
        return (
          <svg key={i} width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
            <polygon points={burstPoints(f.x, f.y, 8, 70, 18, 40 + i)} fill="#FFFFFF" stroke={P.ink} strokeWidth={4} />
          </svg>
        );
      })}
      <Balloon o={win(t, T.kepala - 0.15, S.fist + 0.3, 0.2, 0.25)} x={70} y={430} w={940} h={420} tx={560} ty={980}>
        <div style={{ fontFamily: ANTON, fontSize: 60, lineHeight: 1.12, color: P.ink }}>"...SEDIKIT DENGAN KEPALA...</div>
        <div style={{ fontFamily: ANTON, fontSize: 60, lineHeight: 1.12, color: P.red, opacity: seg(t, T.tuhan - 0.1, T.tuhan + 0.15) }}>...SEDIKIT DENGAN TANGAN TUHAN"</div>
      </Balloon>
      <Stamp t={t} a={T.y2005} b={S.abad + 0.3} y={360} text="2005: MENGAKU" size={110} />
      <NarrBox t={t} a={T.mengaku} b={S.abad + 0.3} x={60} y={1150} size={42} bg="#FFFFFF" rot={1}>
        MARADONA MENGAKU MEMAKAI TANGAN
      </NarrBox>
      <NarrBox t={t} a={T.abad} b={T.polling} x={60} y={330} size={56} bg={GOLD} color="#FFFFFF">
        GOL KEDUA · MENIT 55
      </NarrBox>
      <Stamp t={t} a={T.polling} b={S.trophy + 0.35} y={350} text="GOL ABAD INI" sub="polling online FIFA · 2002" color="#B07A10" size={104} rot={-4} />
      <NarrBox t={t} a={T.seminggu} b={T.juara} x={60} y={330} size={46} rot={-1}>
        SEMINGGU KEMUDIAN · FINAL 29 JUNI 1986
      </NarrBox>
      <Stamp t={t} a={T.juara} b={S.outro + 0.35} y={340} text="JUARA DUNIA" color="#2346B0" size={110} rot={-3} />
      <NarrBox t={t} a={T.tigaDua} b={S.outro + 0.35} x={60} y={1150} size={52} bg="#FFFFFF" rot={1}>
        ARGENTINA 3–2 JERMAN BARAT
      </NarrBox>
      {/* ---- outro ---- */}
      <NarrBox t={t} a={T.audira - 0.2} b={T.outroCard + 0.4} x={60} y={340} size={60} bg={P.ink} color={GREEN} rot={-1.5}>
        AUDIRA · SEJARAH SEPAK BOLA
      </NarrBox>
      <NarrBox t={t} a={T.berikut} b={T.outroCard + 0.4} x={60} y={460} size={42} bg="#FFFFFF" rot={1}>
        BERIKUTNYA: BRASIL DIHAJAR 7–1
      </NarrBox>
    </>
  );
};

// =====================================================================
// KARAOKE CAPTIONS (comic caption strip; active word on a yellow ink chip)
// =====================================================================
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
  const chars = g.words.reduce((s, w) => s + w.w.length, 0);
  const lines = n <= 4 && (chars <= 28 || n < 4) ? [g.words] : [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))];
  const o = seg(t, g.start - 0.05, g.start + 0.06);
  const widest = Math.max(...lines.map((ln) => ln.reduce((s, w) => s + w.w.length, 0) * 0.56 + ln.length * 0.25));
  const fs = Math.min(54, (1010 - 46 - 22 * 3) / Math.max(1, widest));
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: o }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 22, background: "#FFF6E0", border: `5px solid ${P.ink}`, boxShadow: `7px 7px 0 ${P.ink}`, padding: "6px 18px 8px", transform: `rotate(${li ? 0.8 : -0.8}deg)` }}>
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
                  fontSize: fs,
                  lineHeight: 1.15,
                  padding: "0 6px",
                  background: active ? P.yellow : "transparent",
                  color: said ? P.ink : "rgba(18,16,20,0.45)",
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
  useFonts();
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const dotPx = Math.max(4, Math.round((11 * height) / 1920));
  const m = useFilmMats(dotPx);
  return (
    <AbsoluteFill style={{ background: P.skyTop }}>
      <PageBg />
      <Hook t={t} m={m} />
      <Shots t={t} m={m} />
      <Stage>
        {/* focus vignette: darkens panel edges so the hero lane (centre) separates in value */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 300,
            width: 1000,
            height: 1580,
            opacity: seg(t, S.stadium, S.stadium + 0.5),
            background: "radial-gradient(ellipse 62% 40% at 50% 46%, rgba(18,16,20,0) 55%, rgba(18,16,20,0.38) 85%, rgba(18,16,20,0.55) 100%)",
          }}
        />
        <HUD t={t} />
        <Captions t={t} />
      </Stage>
    </AbsoluteFill>
  );
};
