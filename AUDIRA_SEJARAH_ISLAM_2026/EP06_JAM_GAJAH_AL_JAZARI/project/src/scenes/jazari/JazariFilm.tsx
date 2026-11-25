// EP06 Jam Gajah Al-Jazari — INNERWORKS. One continuous world grown from the approved cover:
// the cutaway copper elephant clock on a plinth, the open manuscript on a lectern (back-left) and the
// basalt wall far behind. The locked voice is the master clock: every key and event is a word of
// timeline.json (see time.ts, state.ts, camera.ts).

import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { fontReady } from "../../core/type/fonts.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { Elephant, Studio } from "./Elephant.tsx";
import { SceneFog, BasaltWall, Manuscript, Plaque, People } from "./World.tsx";
import { PALETTE, TANK, WATER_TOP, BOOK, WALL_Z, ADULT, MOUTH, CASTLE, DOME_R, ROOF_Y, CYMBAL, bowlY, BOWL_R } from "./layout.ts";
import { filmCamera } from "./camera.ts";
import { filmState } from "./state.ts";
import { ALL_WORDS, TOTAL, OUTRO_AT, at, part, prog } from "./time.ts";
import { Layout, Titles, PinLabel, Chips, Gauge, Captions, project, SERIF, type Chip } from "./ui.tsx";

export const JAZARI_COVER_SECONDS = 4;
export const JAZARI_SECONDS = TOTAL;

let fontsReady: Promise<unknown> | null = null;
const loadFonts = () => {
  if (fontsReady) return fontsReady;
  if (typeof document === "undefined") return (fontsReady = Promise.resolve());
  const face = new FontFace(SERIF, `url(${staticFile("fonts/InstrumentSerif-Regular.ttf")}) format("truetype")`);
  fontsReady = Promise.all([face.load().then((f) => (document.fonts as unknown as { add(f: FontFace): void }).add(f)), fontReady()]);
  return fontsReady;
};

// INNERWORKS memory best: CINEMA_TEAL_ORANGE, exposure 1, envIntensity 0.55, hdri studio.
const GRADE = { ...COLOR_PROFILES.CINEMA_TEAL_ORANGE, name: "Jazari studio", vignette: 0.12 };

type V3 = [number, number, number];
const BOOK_PAGE = (side: -1 | 1): V3 => {
  const lx = (side * BOOK.pageW) / 2;
  const c = Math.cos(BOOK.rotY), s = Math.sin(BOOK.rotY);
  return [BOOK.pos[0] + lx * c, BOOK.lift + BOOK.pageH * 0.5, BOOK.pos[2] - lx * s];
};

let CHIPS: Chip[] | null = null;
let CUR_S: ReturnType<typeof filmState> | null = null;
const getS = () => CUR_S!;
const chips = (): Chip[] =>
  (CHIPS ??= [
    { text: "AL-JAZARI", sub: "INSINYUR ISTANA", a: at("al-jazari"), b: at("dinasti") - 0.1 },
    { text: "DINASTI ARTUQID", a: at("dinasti"), b: at("wilayah") - 0.1 },
    { text: "DIYARBAKIR, TURKI", a: at("wilayah"), b: at("sekitar") - 0.15, pin: () => [-3.5, 3.4, WALL_Z + 0.4] },
    { text: "± 1206", a: at("sekitar"), b: at("50") - 0.15, big: true, pin: () => BOOK_PAGE(-1) },
    { text: "50 MESIN", a: at("50"), b: at("gambar") - 0.1, big: true, pin: () => BOOK_PAGE(-1) },
    { text: "GAMBAR + CARA MEMBUAT", a: at("gambar"), b: at("yang") - 0.1, pin: () => BOOK_PAGE(1) },
    { text: "JAM AIR GAJAH", a: at("jam air"), b: at("punggung") - 0.15, big: true },
    { text: "KASTIL", a: at("kastil"), b: at("elang") - 0.05, pin: () => [0, CASTLE.y0 + CASTLE.h * 0.6, CASTLE.d / 2] },
    { text: "ELANG", a: at("elang"), b: at("dua") - 0.05, pin: () => [0.72, 2.92, 0.16] },
    { text: "DUA ULAR", a: at("dua"), b: at("burung") - 0.05, pin: () => MOUTH },
    { text: "BURUNG", a: at("burung"), b: at("juru") - 0.1, pin: () => [0, CASTLE.y0 + CASTLE.h + 0.04 + DOME_R + 0.05, 0] },
    { text: "JURU TULIS", a: at("juru"), b: at("semuanya") - 0.1, pin: () => [-0.12, ROOF_Y + 0.25, 0.38] },
    { text: "BONEKA MEKANIS", a: at("semuanya"), b: at("setiap") - 0.15, big: true },
    { text: "SETIAP 1/2 JAM", a: at("setiap"), b: at("burung", 1) - 0.1, big: true },
    { text: "BOLA", a: at("bola"), b: at("ular", 2) - 0.05, pin: () => (getS().ballOn > 0.5 ? getS().ball : null) },
    { text: "PAWANG", a: at("pawang"), b: at("bola", 1) - 0.1, pin: () => [1.02, 2.3, 0] },
    { text: "SIMBAL", a: at("bola", 1), b: at("rahasianya") - 0.1, pin: () => CYMBAL },
    { text: "PERUT GAJAH", a: at("rahasianya"), b: at("mangkuk") - 0.1, big: true },
    { text: "MANGKUK KUNINGAN", a: at("mangkuk"), b: at("bak") - 0.05, pin: () => [TANK.x, bowlY(getS().sink) - 0.08, BOWL_R] },
    { text: "BAK AIR", a: at("bak"), b: at("lubang") - 0.05, pin: () => [TANK.x + 0.2, WATER_TOP - 0.2, 0.3] },
    { text: "LUBANG KECIL", a: at("lubang"), b: at("air masuk") - 0.15, pin: () => [TANK.x, bowlY(getS().sink) - BOWL_R + 0.02, 0.05] },
    { text: "TENGGELAM", a: at("saat"), b: at("tali") - 0.1, big: true },
    { text: "TALI", a: at("tali"), b: at("udara") - 0.1, pin: () => [TANK.x, 1.65, 0] },
    { text: "PELUIT", a: at("peluit") - 0.3, b: at("lalu", 1) - 0.05, pin: () => [-0.55, 1.74, 0.12] },
    { text: "BOLA ANGKAT MANGKUK", a: at("lalu", 1), b: at("siklus") - 0.1, pin: () => [TANK.x, bowlY(getS().sink), 0.2] },
    { text: "SIKLUS BERULANG", a: at("siklus"), b: at("hari") - 0.1, big: true },
    { text: "DUBAI", sub: "REPLIKA RAKSASA", a: at("dubai"), b: at("london") - 0.1, big: true },
    { text: "LONDON", sub: "± 5 METER", a: at("london"), b: at("padahal") - 0.1, big: true },
    { text: "MENURUT DONALD HILL", a: at("menurut"), b: at("jam aslinya") - 0.1 },
    { text: "± 1,8 M", sub: "SETINGGI ORANG DEWASA", a: at("jam aslinya"), b: at("al-jazari", 1) - 0.1, big: true, pin: () => [ADULT[0] - 0.62, 3.55, ADULT[2] - 0.15] },
    { text: "BISA DIBANGUN ULANG", a: at("supaya"), b: part("outro").start - 0.1, pin: () => BOOK_PAGE(1) },
    { text: "TULIS DI KOMENTAR", a: at("tulis", 1), b: OUTRO_AT - 0.3, big: true },
  ]);

export const JazariFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot = filmCamera(t);
  const s = filmState(t);
  CUR_S = s;
  const [handle] = useState(() => delayRender("jazari fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    loadFonts().then(done, done);
  }, [handle]);

  // hook labels: the same two labels as the approved cover
  const titlesOut = at("pembuatnya");
  const hookLab = 1 - prog(t, at("sendiri") + 0.2, at("sendiri") + 0.6);
  const bowlPin = project(shot, [TANK.x, bowlY(s.sink) - 0.05, 0.12]);
  const ballPin = s.ballOn > 0.5 ? project(shot, s.ball) : null;
  const sigIn = Math.max(0, Math.min(1, (t - titlesOut) / 0.5));
  const fade = Math.min(1, 0.85 + t * 0.5) * hookLab;

  return (
    <AbsoluteFill style={{ background: PALETTE.bg }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: PCFShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true }}
            camera={{ position: shot.pos, fov: shot.fov, near: 0.1, far: 160 }}
          >
            <PoseCamera position={shot.pos} target={shot.target} fov={shot.fov} />
            <SceneFog />
            <hemisphereLight args={["#fff8ee", "#c9b89c", 0.6]} />
            <directionalLight
              position={[6, 9, 7]}
              intensity={2.7}
              color="#ffe9cc"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-left={-11}
              shadow-camera-right={11}
              shadow-camera-top={12}
              shadow-camera-bottom={-6}
              shadow-camera-far={60}
              shadow-bias={-0.0004}
            />
            <directionalLight position={[-7, 5, -5]} intensity={1.0} color="#bfe0ff" />
            {/* warm back rim: separates the copper elephant and brass castle from the wall */}
            <directionalLight position={[-2, 7, -10]} intensity={1.3} color="#ffd29a" />
            {/* inspection light inside the open belly so the mechanism reads */}
            <pointLight position={[0.3 * s.scale, 1.45 * s.scale, 0.75 * s.scale]} intensity={1.6} distance={2.4 * s.scale} decay={1.5} color="#fff4e0" />
            <pointLight position={[TANK.x, (WATER_TOP - 0.25) * s.scale, 0]} intensity={0.6} distance={s.scale} color="#7fe0d6" />
            <BasaltWall />
            <Manuscript s={s} />
            <Studio />
            <Plaque />
            <People s={s} f={frame * (60 / fps)} />
            <Elephant s={s} />
            <Finish frame={frame} background={PALETTE.bg} profile={GRADE} exposure={1} envIntensity={0.55} hdri="studio" focus={Math.hypot(shot.pos[0] - shot.target[0], shot.pos[1] - shot.target[1], shot.pos[2] - shot.target[2])} aperture={0.0015} maxBlur={0.004} />
          </ThreeCanvas>
          <Layout>
            <Titles t={t} outAt={titlesOut} />
            {fade > 0.001 ? (
              <>
                {ballPin ? <PinLabel ring={30} text="BOLA" at={[ballPin[0] + 210, ballPin[1] - 60]} pin={ballPin} opacity={fade} /> : null}
                {bowlPin ? <PinLabel text="MANGKUK KUNINGAN" at={[Math.min(800, Math.max(260, bowlPin[0] - 140)), Math.min(1470, bowlPin[1] + 200) - 230 * prog(t, 0.35, 0.58)]} pin={bowlPin} opacity={fade} /> : null}
              </>
            ) : null}
            <Chips chips={chips()} t={t} shot={shot} />
            <Gauge v={s.gaugeOn} k={s.gauge} />
            <Captions t={t} words={ALL_WORDS} />
          </Layout>
          <AudiraOutro seconds={TOTAL - OUTRO_AT} />
        </>
      ) : null}
      {/* the moving signature waits until the cover titles have left */}
      <AbsoluteFill style={{ opacity: sigIn, pointerEvents: "none" }}>
        <AudiraSignature seed="sejarah-islam-ep06" outroSeconds={TOTAL - OUTRO_AT} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
