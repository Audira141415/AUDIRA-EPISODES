// EP03 "Rahasia sumur Zamzam" topic cover (first key image of the film), INNERWORKS.
// One scene for both formats: the 9:16 shot is authored first; the 16:9 shot reuses the same world
// with its own camera (the well moves right so the title has the plaza sky on the left).
//
// Labels are 2D, attached to projected 3D anchors from the same layout as the geometry.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat, wideFov } from "../../core/film/format.ts";
import { FONT } from "../../core/type/fonts.ts";
import { L, PAL } from "./layout.ts";
import { ZamzamWorld } from "./World.tsx";

export const ZAMZAM_COVER_SECONDS = 3;

type Shot = { pos: [number, number, number]; target: [number, number, number]; fov: number };

/** Real vertical fov per format. The wide rig writes the portrait-equivalent value, FormatFov converts it. */
const SHOTS: Record<"short" | "wide", Shot> = {
  short: { pos: [17, 8, 118], target: [1.5, -10.2, 0], fov: 31 },
  wide: { pos: [30, 9, 100], target: [-15, -11.8, -2], fov: 30 },
};

/** Inverse of wideFov: the portrait fov that FormatFov turns into `real`. */
const portraitFovFor = (real: number) => {
  // wideFov is monotonic; solve by bisection (cheap, deterministic)
  let lo = 1, hi = 170;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (wideFov(mid) < real) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
};

const Rig: React.FC<{ shot: Shot; wide: boolean }> = ({ shot, wide }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...shot.pos);
    cam.lookAt(new THREE.Vector3(...shot.target));
    cam.fov = wide ? portraitFovFor(shot.fov) : shot.fov;
    cam.near = 0.5;
    cam.far = 600;
    cam.updateProjectionMatrix();
  }, [camera, shot, wide]);
  return null;
};

const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#ffffff", "#cdb99a", 0.9]} />
    <directionalLight
      position={[-38, 62, 70]}
      intensity={2.6}
      color="#fff4e6"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-camera-left={-80}
      shadow-camera-right={80}
      shadow-camera-top={70}
      shadow-camera-bottom={-70}
      shadow-camera-near={1}
      shadow-camera-far={260}
      shadow-bias={-0.0004}
      shadow-normalBias={0.04}
    />
    <directionalLight position={[50, 10, 40]} intensity={0.55} color="#dceeff" />
    {/* inspection lights inside the shaft */}
    <pointLight position={[0, -13.8, 1.0]} intensity={14} distance={9} decay={2} color="#8fe4ff" />
    <pointLight position={[0, -24, 1.0]} intensity={10} distance={9} decay={2} color="#7fd6ff" />
    <pointLight position={[-1.5, -1.5, 1.4]} intensity={12} distance={8} decay={2} color="#fff1d6" />
  </>
);

/** Project a world point with the same camera the canvas uses. */
function useProjector(shot: Shot, width: number, height: number) {
  return useMemo(() => {
    const cam = new THREE.PerspectiveCamera(shot.fov, width / height, 0.5, 600);
    cam.position.set(...shot.pos);
    cam.lookAt(new THREE.Vector3(...shot.target));
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    return (p: [number, number, number]) => {
      const v = new THREE.Vector3(...p).project(cam);
      return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
    };
  }, [shot, width, height]);
}

/** Two-line technical tag: bold value + short caption, pill with an accent dot. */
const Tag: React.FC<{ x: number; y: number; value: string; caption?: string; s: number; accent?: string; align?: "left" | "right" }> = ({
  x, y, value, caption, s, accent = PAL.ink, align = "left",
}) => (
  <div
    style={{
      position: "absolute",
      left: align === "left" ? x : undefined,
      right: align === "right" ? x : undefined,
      top: y,
      transform: "translateY(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 12 * s,
      background: "rgba(255,255,255,0.95)",
      borderRadius: 14 * s,
      padding: `${8 * s}px ${16 * s}px ${8 * s}px ${12 * s}px`,
      boxShadow: "0 6px 18px rgba(30,25,15,0.22)",
      fontFamily: FONT,
      color: PAL.ink,
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ width: 12 * s, height: 12 * s, borderRadius: 99, background: accent, flex: "none" }} />
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
      <span style={{ fontWeight: 600, fontSize: 25 * s, letterSpacing: 0.3 * s }}>{value}</span>
      {caption ? <span style={{ fontWeight: 500, fontSize: 16.5 * s, color: "#5a6366", letterSpacing: 0.4 * s }}>{caption}</span> : null}
    </div>
  </div>
);

const Overlay: React.FC = () => {
  const fmt = useFormat();
  const { width, height } = useVideoConfig();
  const wide = fmt.isWide;
  const shot = SHOTS[fmt.kind];
  const P = useProjector(shot, width, height);
  const s = fmt.scale * (wide ? 1.0 : 1.1);
  const { safe } = fmt;
  const k = fmt.scale;

  // depth ruler on the cut face: far left in 9:16 (tags to its right), left of the well in 16:9 (tags to its left)
  const rx = wide ? -6.5 : -12.6;
  const ticks: { y: number; value: string; caption: string; accent: string; dy?: number }[] = [
    { y: 0, value: "0 m", caption: "lantai tawaf (mataf)", accent: "#9aa3a6", dy: wide ? -26 : 8 },
    { y: -2.5, value: "± 2,5 m", caption: "ruang bawah tanah lama", accent: PAL.concreteCut, dy: wide ? 26 : 36 },
    { y: L.alluviumBottom, value: "13,5 m", caption: "pasir & kerikil (aluvium)", accent: PAL.sandDark, dy: -30 },
    { y: L.weatheredBottom, value: "0,5 m batuan lapuk", caption: "jalan masuk air utama", accent: "#39c6f2", dy: 34 },
    { y: L.wellBottom, value: "± 30 m", caption: "dasar sumur, batuan diorit", accent: PAL.diorite, dy: wide ? 0 : -14 },
  ];
  const top = P([rx, 0, 0.05]);
  const bot = P([rx, L.wellBottom, 0.05]);
  const pump = P([1.0, L.pumpY, 0]);
  const pipe = P([wide ? 17 : 7.5, -1.45, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ruler */}
      <div style={{ position: "absolute", left: top.x - 2 * k, top: top.y, width: 4 * k, height: bot.y - top.y, background: "rgba(255,255,255,0.9)", boxShadow: "0 0 6px rgba(0,0,0,0.3)" }} />
      {ticks.map((t) => {
        const p = P([rx, t.y, 0.05]);
        const ty = p.y + (t.dy ?? 0) * s;
        return (
          <React.Fragment key={t.value}>
            <div style={{ position: "absolute", left: p.x - 12 * k, top: p.y - 2 * k, width: 24 * k, height: 4 * k, background: "#fff", boxShadow: "0 0 4px rgba(0,0,0,0.3)" }} />
            {wide ? (
              <Tag x={width - (p.x - 24 * k)} y={ty} value={t.value} caption={t.caption} s={s} accent={t.accent} align="right" />
            ) : (
              <Tag x={p.x + 24 * k} y={ty} value={t.value} caption={t.caption} s={s} accent={t.accent} />
            )}
          </React.Fragment>
        );
      })}
      <Tag x={pump.x + 34 * k} y={pump.y} value="POMPA" caption="dua pompa listrik" s={s} accent={PAL.pump} />
      <Tag x={pipe.x} y={pipe.y + 70 * s} value="PIPA BAJA  →" caption="ke pemurnian Kudai, ± 4–5 km" s={s} accent={PAL.steel} />

      {/* source note */}
      <div style={{ position: "absolute", left: safe.left * k, bottom: (safe.bottom - 34) * k, fontFamily: FONT, fontWeight: 500, fontSize: 17 * s, color: "rgba(255,255,255,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
        Kedalaman & lapisan menurut Badan Survei Geologi Saudi
      </div>

      {/* title block */}
      <div style={{ position: "absolute", left: safe.left * k, top: (safe.top + (wide ? 18 : 12)) * k }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12 * s,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 24 * s,
            letterSpacing: 4 * s,
            color: PAL.ink,
            background: "rgba(255,255,255,0.8)",
            padding: `${8 * s}px ${16 * s}px`,
            borderRadius: 8 * s,
          }}
        >
          <span style={{ width: 10 * s, height: 10 * s, background: PAL.coral, borderRadius: 2 }} />
          SEJARAH MAKKAH · EP03
        </div>
        <div style={{ marginTop: 14 * k, fontFamily: FONT, fontWeight: 600, fontSize: (wide ? 104 : 104) * k, lineHeight: wide ? 0.98 : 0.95, letterSpacing: -2 * k, color: PAL.ink }}>
          {wide ? (
            <>
              <div>SUMUR DI BAWAH</div>
              <div><span style={{ color: "#1a8fbd" }}>KAKIMU</span></div>
            </>
          ) : (
            <>
              <div>SUMUR</div>
              <div>DI BAWAH</div>
              <div><span style={{ color: "#1a8fbd" }}>KAKIMU</span></div>
            </>
          )}
        </div>
        <div style={{ marginTop: 10 * k, fontFamily: FONT, fontWeight: 600, fontSize: 30 * s, letterSpacing: 6 * s, color: "#1a8fbd" }}>RAHASIA SUMUR ZAMZAM</div>
      </div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ f: number; frame: number }> = ({ f, frame }) => {
  const fmt = useFormat();
  const shot = SHOTS[fmt.kind];
  return (
    <>
      <Rig shot={shot} wide={fmt.isWide} />
      <Lights />
      <fog attach="fog" args={[PAL.bg, 140, 260]} />
      <ZamzamWorld f={f} />
      <Finish frame={frame} hdri="studio" background={PAL.bg} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} />
    </>
  );
};

export const ZamzamCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.bg }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 31, near: 0.5, far: 600, position: [17, 8, 118] }}>
        <Scene f={f} frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
