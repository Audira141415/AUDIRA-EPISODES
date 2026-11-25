import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { stepT } from "../../kits/feltcraft/core/motion";
import { Hospital } from "./Hospital";
import { Courtyard, FeltFigure, Foreground, Sky } from "./Props";
import { BrandPost, CourtPlan, NeedsShelf, PayoffProps, SickRoom, WaqfTown } from "./Zones";
import { MansuriOverlay } from "./Overlay";
import { Captions } from "./Captions";
import { mansuriCamera } from "./camera";
import { M } from "./palette";
import { COVER } from "./framing";
import { B } from "./beats";
import { TOTAL, OUTRO_AT, prog, smooth } from "./time";

// EP10 Bimaristan al-Mansuri (sejarah-islam-EP10, FELTCRAFT). One continuous felt diorama on the
// locked voice: the gate (hook), Damaskus sick room (context), courtyard plan with wards and beds
// (main), waqf town + gold threads + shelf (explanation), clothes, coins, oud at night and the 1915
// sign (payoff), then the whole diorama with the AUDIRA signpost (outro) and <AudiraOutro />.

export const MANSURI_COVER_SECONDS = 3;
export const MANSURI_TOTAL = TOTAL;
const FPS = 60;

const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  const cam = mansuriCamera(f);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.position);
    c.fov = cam.fov;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  });
  return null;
};

export const MansuriFilm: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  // the outro card and the signature belong to the full film (not to the 3 s cover composition)
  const isFilm = durationInFrames / fps >= TOTAL - 0.1;
  const f = (frame / fps) * FPS;
  const t = f / FPS;
  const ts = stepT(t);
  // night falls for "Konon ... musik dan pendongeng", day returns for the five centuries
  const night = smooth(prog(t, B.konon - 0.3, B.konon + 0.9)) * (1 - smooth(prog(t, B.limaAbad - 0.2, B.limaAbad + 1.0)));
  const day = 1 - night * 0.75;
  // doors open at the cover frame and settle a touch wider (stop-motion on twos)
  const doorOpen = 1.05 + Math.min(1, ts / 2) * 0.12;
  // hook travellers walk in, then are inside
  const walkZ = 1.55 - Math.min(ts, 8) * 0.16;
  const showHook = ts < 8.2;
  // "Pintunya terbuka untuk semua": a queue walks in
  const qT = ts - B.pintunya + 0.4;
  // payoff: a cured patient walks out toward the table (faceless)
  const outT = Math.max(0, Math.min(1, (ts - B.sembuh) / (B.pakaian - B.sembuh)));

  return (
    <AbsoluteFill style={{ background: M.sky }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: COVER.pos, fov: COVER.fov, near: 0.05, far: 80 }}>
        <CameraRig f={f} />
        <color attach="background" args={[M.sky]} />
        <hemisphereLight args={[M.skyFill, M.groundBounce, 0.6 * day]} />
        <spotLight position={[0.6, 3.6, 6.5]} angle={0.32} penumbra={0.9} intensity={60 * day} distance={14} decay={1.6} color={M.keyWarm} target-position={[0, 1.4, 0]} />
        <directionalLight
          position={[3.2, 7.5, 5.8]}
          intensity={1.5 * day}
          color={M.keyWarm}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-11}
          shadow-camera-right={11}
          shadow-camera-top={6}
          shadow-camera-bottom={-12}
          shadow-camera-far={40}
          shadow-bias={-0.0005}
          shadow-radius={5}
        />
        <directionalLight position={[-3, 3.5, -4]} intensity={1.1 * day + 0.3 * night} color={night > 0.5 ? "#9FB4E0" : "#FFD2A0"} />
        {/* warm fills over the side zones so every beat keeps a lit subject */}
        <pointLight position={[-3.8, 2.6, 2.8]} intensity={6} distance={6} decay={1.5} color={M.glow} />
        <pointLight position={[0, 3.2, -5.2]} intensity={5} distance={7} decay={1.4} color={M.keyWarm} />
        <pointLight position={[5.4, 2.8, 2.6]} intensity={6} distance={7} decay={1.4} color={M.keyWarm} />

        <Sky t={t} night={night} />
        <Hospital doorOpen={doorOpen} />
        <Courtyard />
        {showHook && (
          <>
            <FeltFigure position={[-0.2, 0, walkZ]} rich walk={ts} seed={11} />
            <FeltFigure position={[0.22, 0, walkZ + 0.08]} walk={ts + 0.21} seed={23} />
          </>
        )}
        {qT > 0 && qT < 4.5 &&
          [0, 1, 2].map((i) => {
            const z = 3.0 + i * 0.55 - qT * 0.55;
            return z > 0.5 ? <FeltFigure key={i} position={[(i % 2 ? 0.18 : -0.15), 0, z]} walk={qT + i * 0.3} seed={70 + i} robe={["#8C6A48", "#6B7F5A", "#7A6A8C"][i]} staff={i === 0} /> : null;
          })}
        {ts > B.sembuh - 0.2 && ts < B.konon + 0.5 && <FeltFigure position={[0.25, 0, 0.6 + outT * 1.75]} walk={ts} seed={81} yaw={0.15} robe="#6B7F5A" />}
        <Foreground t={t} />
        <SickRoom t={t} />
        <CourtPlan t={t} />
        <WaqfTown t={t} />
        <NeedsShelf t={t} />
        <PayoffProps t={t} night={night} />
        <BrandPost t={t} />
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
      </ThreeCanvas>
      <MansuriOverlay t={t} />
      <Captions t={t} />
      {withAudio && <Audio src={staticFile("audio/full.wav")} />}
      {isFilm && <AudiraOutro seconds={TOTAL - OUTRO_AT} />}
      {isFilm && <AudiraSignature seed="sejarah-islam-ep10" outroSeconds={TOTAL - OUTRO_AT} />}
    </AbsoluteFill>
  );
};
