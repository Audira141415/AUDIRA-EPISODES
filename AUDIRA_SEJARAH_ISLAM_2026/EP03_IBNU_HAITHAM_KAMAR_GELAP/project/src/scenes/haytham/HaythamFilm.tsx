// EP03 Ibnu al-Haitsam — "Kamera itu dulu kamar". FILMNOIR.
// One continuous world: the dark room (camera obscura). The film opens on the approved cover framing,
// tours the room (model table: map, eye model, Nile rapids; the bolted door), cuts the room open for the
// candle experiment, then pulls out until the room is a box that shrinks into a phone's camera lens.
// The locked voice is the master clock: every key and event is a word of timeline.json.

import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { fontReady } from "../../core/type/fonts.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { DarkRoom, FxLayerOn } from "./DarkRoom.tsx";
import { ModelTable, Shelf, FrontWall, Outside, Shell, Phone, mapPoint, EYE_PUPIL, DarkBeatLights } from "./Props.tsx";
import { filmCamera, PALETTE, PIVOT, LENS, NILE_C, SHELF_C, HOLE, SPOTS, SPOT_CENTER } from "./layout.ts";
import { filmState } from "./state.ts";
import { ALL_WORDS, TOTAL, OUTRO_AT, at } from "./time.ts";
import { CITY } from "./textures.ts";
import { Layout, Titles, Tags, Stamp, Captions, Outro, SERIF, type Tag } from "./ui.tsx";

export const HAYTHAM_COVER_SECONDS = 4;
export const HAYTHAM_SECONDS = TOTAL;

// FILMNOIR memory best: APPLE_STUDIO_CLEAN, exposure 0.72, envIntensity 0.1; a little more
// vignette and grain for the 1940s film feel.
const NOIR_GRADE = { ...COLOR_PROFILES.APPLE_STUDIO_CLEAN, name: "Haytham noir", vignette: 0.24, grain: 0.014, contrastCurve: 0.2 };

let fontsReady: Promise<unknown> | null = null;
const loadFonts = () => {
  if (fontsReady) return fontsReady;
  if (typeof document === "undefined") return (fontsReady = Promise.resolve());
  const face = new FontFace(SERIF, `url(${staticFile("fonts/InstrumentSerif-Regular.ttf")}) format("truetype")`);
  fontsReady = Promise.all([
    face.load().then((f) => {
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
    fontReady(),
  ]);
  return fontsReady;
};

let TAGS: Tag[] | null = null;
const tags = (): Tag[] =>
  (TAGS ??= [
    { text: "± 1000 TAHUN LALU", a: at("sekitar"), b: at("ibnu") - 0.1, x: 540, y: 300 },
    { text: "IBNU AL-HAITSAM", sub: "BASRAH", a: at("ibnu"), b: at("waktu"), x: 540, y: 300, pin: mapPoint(...CITY.basrah) },
    { text: "MATA MEMANCARKAN SINAR?", a: at("mata"), b: at("eropa"), x: 540, y: 300, pin: EYE_PUPIL, strikeAt: at("sinar") },
    { text: "ALHAZEN", sub: "DI EROPA", a: at("dikenal"), b: at("menurut") - 0.1, x: 540, y: 300 },
    { text: "MENURUT IBNU AL-QIFTI", a: at("menurut"), b: at("khalifah") - 0.1, x: 540, y: 300 },
    { text: "KHALIFAH AL-HAKIM → MESIR", a: at("khalifah"), b: at("jeram") - 0.1, x: 540, y: 300, pin: mapPoint(...CITY.kairo) },
    { text: "JERAM ASWAN", sub: "SUNGAI NIL", a: at("jeram"), b: at("rencana") - 0.1, x: 540, y: 300, pin: NILE_C },
    { text: "RENCANA: MENGATUR BANJIR NIL", a: at("rencana"), b: at("konon") - 0.15, x: 540, y: 300, pin: NILE_C, strikeAt: at("mustahil") },
    { text: "SEGARIS LURUS", a: at("segaris"), b: at("tutup") - 0.1, x: 540, y: 300, pin: HOLE },
    { text: "TITIKNYA HILANG", a: at("hilang") - 0.1, b: at("buka"), x: 540, y: 300, pin: SPOTS[1] },
    { text: "TITIKNYA KEMBALI", a: at("kembali") - 0.1, b: at("lewat"), x: 540, y: 300, pin: SPOTS[1] },
    { text: "TERBALIK", a: at("terbalik"), b: at("kesimpulannya") + 0.7, x: 540, y: 300, pin: SPOT_CENTER },
    { text: "CAHAYA BERJALAN LURUS", a: at("berjalan"), b: at("kita", 1), x: 540, y: 300 },
    { text: "CAHAYA MASUK KE MATA", a: at("kita", 1) + 0.05, b: at("kitab"), x: 540, y: 300, pin: EYE_PUPIL },
    { text: "KITAB OPTIK · 7 JILID", a: at("kitab"), b: at("latin") - 0.45, x: 540, y: 300, pin: SHELF_C },
    { text: "BAHASA LATIN", a: at("latin") - 0.4, b: at("johannes") - 0.05, x: 540, y: 300 },
    { text: "JOHANNES KEPLER", a: at("johannes"), b: at("camera") - 0.15, x: 540, y: 300 },
    { text: "CAMERA OBSCURA", sub: "= KAMAR GELAP", a: at("camera"), b: at("tahun", 1) - 0.1, x: 540, y: 300, big: true },
    { text: "PBB · 2015", sub: "1000 TAHUN KARYANYA", a: at("tahun", 1), b: at("setiap") - 0.1, x: 540, y: 300, big: true },
    { text: "KAMAR GELAP KECIL", sub: "DI DALAM PONSELMU", a: at("ada"), b: at("kalau") + 0.3, x: 540, y: 300 },
  ]);

export const HaythamFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f60 = (frame / fps) * 60;
  const t = frame / fps;
  const shot = filmCamera(f60);
  const s = filmState(t);
  const [handle] = useState(() => delayRender("haytham fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    loadFonts().then(done, done);
  }, [handle]);

  const sigIn = Math.max(0, Math.min(1, (t - at("kamera", 1)) / 0.5));
  // payoff: the room group scales toward the lens point (room centre PIVOT -> LENS)
  const k = s.scale;
  const pt: [number, number, number] = [0, 1, 2].map((i) => PIVOT[i] + (LENS[i] - PIVOT[i]) * s.shrink) as [number, number, number];
  const roomPos: [number, number, number] = [pt[0] - k * PIVOT[0], pt[1] - k * PIVOT[1], pt[2] - k * PIVOT[2]];

  return (
    <AbsoluteFill style={{ background: PALETTE.void }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: PCFShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true }}
            camera={{ position: shot.pos, fov: shot.fov, near: 0.03, far: 80 }}
          >
            <PoseCamera position={shot.pos} target={shot.target} fov={shot.fov} roll={shot.roll} />
            <FxLayerOn />
            <ambientLight intensity={0.3 * s.dim} color="#5a6478" />
            <hemisphereLight args={["#7d8aa3", "#2a2218", 0.7 * s.dim]} />
            {/* cold rim from behind-left high, separates the scholar and the beams' wall */}
            <directionalLight position={[-2.5, 5, -4]} intensity={0.35} color={PALETTE.moon} />
            {/* outside the box (payoff): warm key from the front-right, cold rim from the back-left */}
            <directionalLight position={[-10, 9, 12]} intensity={3.0 * s.shell} color="#f0d2a0" />
            <directionalLight position={[9, 6, -8]} intensity={1.6 * s.shell} color={PALETTE.moon} />
            {/* dark-beat key that follows the camera (FILMNOIR memory): the turn from the door to the pinhole never goes black */}
            <pointLight position={[shot.pos[0], shot.pos[1] + 0.3, shot.pos[2]]} intensity={9 * s.shutterGlow} distance={6} decay={1.2} color="#e8c48e" />
            <group position={roomPos} scale={k}>
              <DarkRoom t={t} light={s.light} cut={s.cut} dim={s.dim} k={k} moonK={s.moon}>
                <ModelTable s={s} t={t} />
                <Shelf s={s} />
                <FrontWall s={s} />
                <Outside s={s} t={t} />
                <Shell s={s} />
                <DarkBeatLights s={s} t={t} />
              </DarkRoom>
            </group>
            <Phone s={s} lens={LENS} />
            <Finish frame={frame} background={PALETTE.void} profile={NOIR_GRADE} exposure={0.72} envIntensity={0.1} />
          </ThreeCanvas>
          <Layout>
            <Titles t={t} />
            <Tags tags={tags()} t={t} shot={shot} />
            <Stamp t={t} a={at("mustahil")} b={at("konon") - 0.15} text="MUSTAHIL" top={1120} right={140} size={104} />
            <Stamp t={t} a={at("konon")} b={at("wafat", 0, "e") + 0.6} text="KONON" />
            <Captions t={t} words={ALL_WORDS} />
          </Layout>
          <Outro v={s.outro} t={t} at0={OUTRO_AT} />
        </>
      ) : null}
      {/* the moving signature waits until the cover titles have left (it would sit on the kicker line) */}
      <AbsoluteFill style={{ opacity: sigIn, pointerEvents: "none" }}>
        <AudiraSignature seed="sejarah-islam-ep03" handle="@AUDIRAQISSAH" outroSeconds={TOTAL - OUTRO_AT} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
