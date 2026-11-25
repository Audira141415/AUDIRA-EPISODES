// AE-068 cover: the street model cut open. Traffic above, the jacked pipe string and boring machine below.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { C, JP, RPIT, YP, jackState } from "./shared.ts";
import { Buildings, Gantry, Hoarding, PipeString, Road, Soil, Stockpile, StreetLights, Traffic, Workers, makePlate, useMats } from "./StreetWorld.tsx";

export const COVER_T = 24.6;
const POS = new THREE.Vector3(-4, 3.2, 34);
const TGT = new THREE.Vector3(-10.5, -2.4, -2);

const CoverScene: React.FC = () => {
  const { camera } = useThree();
  const M = useMats();
  const plate = useMemo(() => makePlate(["AUDIRA", "PROYEK PIPA BAWAH JALAN"]), []);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(POS); cam.lookAt(TGT); cam.fov = 36; cam.near = 0.5; cam.far = 600;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  });
  const js = jackState(COVER_T);
  return (
    <>
      <fog attach="fog" args={[C.bg, 60, 170]} />
      <StreetLights />
      <Soil M={M} />
      <Road M={M} />
      <Buildings />
      <Traffic t={2.4} />
      <Hoarding x0={JP.x0 - 0.4} x1={JP.x1 + 0.4} M={M} plate={plate} />
      <Hoarding x0={RPIT.x0 - 0.4} x1={RPIT.x1 + 0.4} M={M} />
      <Gantry M={M} hookY={js.lower >= 0 ? YP + js.lower * 9 + 0.9 : 4} />
      <Stockpile M={M} />
      <PipeString t={COVER_T} M={M} />
      <Workers f={60} />
      <Finish frame={0} background={C.bg} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.84} envIntensity={0.3} ao hdri="city" />
    </>
  );
};

export const Cover: React.FC = () => (
  <Stage3D background={C.bg} overlay={() => (
    <AbsoluteFill style={{ fontFamily: `'${FONT}'` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(#0d0f14f0 0%, #0d0f14c0 55%, #0d0f1400 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "linear-gradient(#0d0f1400 0%, #0d0f14d0 100%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 270, color: "#fff" }}>
        <div style={{ display: "inline-block", fontSize: 34, fontWeight: 600, letterSpacing: "0.22em", color: C.accent, padding: "8px 18px", background: "rgba(16,18,24,0.86)", borderLeft: `6px solid ${C.accent}` }}>AUDIRA EXPLAINED</div>
        <div style={{ marginTop: 26, fontSize: 112, fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.02em", textShadow: "0 4px 24px #000a" }}>Pipa Raksasa<br />di Bawah Jalan</div>
      </div>
    </AbsoluteFill>
  )}>
    <CoverScene />
  </Stage3D>
);
