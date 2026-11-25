// EP03 cover (DATAPHYSICAL): "Siapa yang terbaik?" as a museum data sculpture.
// Four brushed-aluminium pedestals (Pelé, Maradona, Messi, Cristiano Ronaldo) on a walnut plinth with a
// felt pitch top. Each column is stacked from trophy blocks: brass = Piala Dunia (3/1/1/0, engraved years),
// burnt orange = Ballon d'Or (0/0/8/5). A ball rests on the felt, centred in front of the four pedestals (the debate stays open).
// Numbers: HIGH rows of research/RESEARCH_REPORT.md only. No faces, no logos.
import React, { useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import {
  PAL,
  ballTexture,
  brushedTexture,
  glowTexture,
  pitchTexture,
  plaqueTexture,
  plateTexture,
  scaleTexture,
  walnutTexture,
  yearTexture,
} from "./coverTextures.ts";

type V3 = [number, number, number];

// ---------- data (HIGH rows only) ----------
export const PLAYERS = [
  { name: "PELÉ", nat: "BRASIL", num: "10", wc: 3, bdo: 0, years: ["1958", "1962", "1970"] },
  { name: "MARADONA", nat: "ARGENTINA", num: "10", wc: 1, bdo: 0, years: ["1986"] },
  { name: "MESSI", nat: "ARGENTINA", num: "10", wc: 1, bdo: 8, years: ["2022"] },
  { name: "C. RONALDO", nat: "PORTUGAL", num: "7", wc: 0, bdo: 5, years: [] as string[] },
] as const;

// ---------- layout ----------
// centre gap widened so the ball sits between Maradona and Messi
export const COL_X = [-1.73, -0.68, 0.68, 1.73];
export const PED_W = 0.98;
export const PED_H = 0.94;
export const BLOCK = 0.78;
export const BLOCK_H = 0.2;
export const STEP = 0.222;
export const BALL_R = 0.21;
export const BALL_POS: V3 = [0, BALL_R + 0.004, 0.66];

export const grainFine = () => surfaceGrain(23, 256, 0.18, 3);

// ---------- camera ----------
export const CAM_POS: V3 = [-0.5, 3.1, 18.6];
export const CAM_TARGET: V3 = [0.05, 1.92, 0];
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    camera.position.set(CAM_POS[0] + t * 0.02, CAM_POS[1], CAM_POS[2] - t * 0.03);
    camera.lookAt(CAM_TARGET[0], CAM_TARGET[1], CAM_TARGET[2]);
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- materials ----------
export const Alu: React.FC<{ color?: string }> = ({ color = PAL.alu }) => (
  <meshPhysicalMaterial color={color} metalness={0.92} roughness={0.32} roughnessMap={brushedTexture(5)} clearcoat={0.15} clearcoatRoughness={0.4} />
);
export const Brass: React.FC = () => (
  <meshPhysicalMaterial color="#E3C186" metalness={0.9} roughness={0.22} roughnessMap={brushedTexture(9)} clearcoat={0.3} clearcoatRoughness={0.2} />
);
export const Anodised: React.FC = () => (
  <meshPhysicalMaterial color={PAL.orange} metalness={0.55} roughness={0.34} roughnessMap={brushedTexture(13)} clearcoat={0.6} clearcoatRoughness={0.18} />
);

// ---------- one data column ----------
const Column: React.FC<{ i: number }> = ({ i }) => {
  const p = PLAYERS[i];
  const x = COL_X[i];
  const blocks: { kind: "wc" | "bdo"; year?: string }[] = [
    ...p.years.map((y) => ({ kind: "wc" as const, year: y })),
    ...Array.from({ length: p.bdo }, () => ({ kind: "bdo" as const })),
  ];
  const top = PED_H + blocks.length * STEP;
  return (
    <group position={[x, 0, 0]}>
      {/* pedestal */}
      <mesh castShadow receiveShadow position={[0, PED_H / 2, 0]}>
        <RoundedBoxGeo args={[PED_W, PED_H, PED_W]} radius={0.035} segments={4} />
        <Alu />
      </mesh>
      {/* name plate on the front face */}
      <mesh position={[0, PED_H / 2, PED_W / 2 + 0.003]}>
        <planeGeometry args={[PED_W * 0.9, PED_W * 0.9]} />
        <meshPhysicalMaterial map={plateTexture(p.name, p.nat, p.num, p.wc, p.bdo)} roughness={0.38} metalness={0.25} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      {/* trophy blocks */}
      {blocks.map((b, k) => {
        const y = PED_H + 0.006 + k * STEP + BLOCK_H / 2;
        return (
          <group key={k} position={[0, y, 0]}>
            <mesh castShadow receiveShadow>
              <RoundedBoxGeo args={[BLOCK, BLOCK_H, BLOCK]} radius={0.022} segments={3} />
              {b.kind === "wc" ? <Brass /> : <Anodised />}
            </mesh>
            {b.year && (
              <mesh position={[0, 0, BLOCK / 2 + 0.002]}>
                <planeGeometry args={[BLOCK * 0.86, BLOCK * 0.86 * 0.25]} />
                <meshBasicMaterial map={yearTexture(b.year)} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* thin aluminium cap */}
      <mesh castShadow receiveShadow position={[0, top + 0.02, 0]}>
        <RoundedBoxGeo args={[BLOCK + 0.04, 0.035, BLOCK + 0.04]} radius={0.012} segments={2} />
        <Alu color="#DADDE1" />
      </mesh>
    </group>
  );
};

// ---------- ball ----------
const Ball: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <mesh castShadow rotation={[0.35, 0.6, 0.2]}>
      <sphereGeometry args={[BALL_R, 96, 64]} />
      <meshPhysicalMaterial map={ballTexture()} roughness={0.38} roughnessMap={grainFine()} clearcoat={0.55} clearcoatRoughness={0.25} metalness={0} />
    </mesh>
    {/* small brass cradle ring */}
    <mesh position={[0, -BALL_R + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.12, 0.012, 12, 48]} />
      <Brass />
    </mesh>
  </group>
);

// ---------- plinth with felt pitch ----------
const PL_W = 5.0;
const PL_D = 1.9;
const PL_H = 0.42;
export const Plinth: React.FC = () => (
  <group>
    <mesh castShadow receiveShadow position={[0, -PL_H / 2, 0]}>
      <RoundedBoxGeo args={[PL_W, PL_H, PL_D]} radius={0.04} segments={3} />
      <meshPhysicalMaterial map={walnutTexture()} roughness={0.5} roughnessMap={grainFine()} clearcoat={0.35} clearcoatRoughness={0.35} />
    </mesh>
    {/* felt pitch inset */}
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <planeGeometry args={[PL_W - 0.2, PL_D - 0.2]} />
      <meshPhysicalMaterial {...POLISH.fabric} map={pitchTexture()} />
    </mesh>
    {/* brass rail + AUDIRA plaque on the front bevel */}
    <mesh position={[0, -0.06, PL_D / 2 + 0.012]}>
      <RoundedBoxGeo args={[PL_W - 0.3, 0.035, 0.03]} radius={0.01} segments={2} />
      <Brass />
    </mesh>
    <mesh position={[0, -0.24, PL_D / 2 + 0.006]}>
      <planeGeometry args={[2.0, 0.25]} />
      <meshPhysicalMaterial map={plaqueTexture()} metalness={0.7} roughness={0.3} clearcoat={0.4} />
    </mesh>
  </group>
);

// ---------- background: acrylic scale panel, back wall, floodlight bokeh ----------
export const Backdrop: React.FC = () => (
  <group>
    <mesh receiveShadow position={[0, 3, -4.5]}>
      <planeGeometry args={[30, 16]} />
      <meshStandardMaterial color="#1E1F23" roughness={0.9} />
    </mesh>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#121315" roughness={0.75} />
    </mesh>
    {/* thin acrylic scale fin behind Ronaldo (engraved ticks) */}
    <mesh position={[2.25, 1.75, -1.3]}>
      <boxGeometry args={[0.36, 3.5, 0.03]} />
      <meshPhysicalMaterial color={PAL.teal} transparent opacity={0.1} roughness={0.08} metalness={0} clearcoat={1} depthWrite={false} />
    </mesh>
    <mesh position={[2.25, 1.75, -1.28]}>
      <planeGeometry args={[0.3, 3.4]} />
      <meshBasicMaterial map={scaleTexture()} transparent depthWrite={false} toneMapped={false} opacity={0.6} />
    </mesh>
    {/* warm pool of light on the back wall, behind the columns */}
    <mesh position={[0.3, 1.6, -4.45]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
      <planeGeometry args={[9, 7]} />
      <meshBasicMaterial map={glowTexture()} transparent opacity={0.09} depthWrite={false} toneMapped={false} color="#FFE2B8" />
    </mesh>
    {/* far floodlights, softened by the lens */}
    {[
      [-3.6, 5.6, -4.3, 1.1], [-2.9, 5.9, -4.3, 0.8], [3.3, 5.4, -4.3, 1.0], [4.0, 5.8, -4.3, 0.75], [-4.4, 3.2, -4.3, 0.6], [4.6, 3.6, -4.3, 0.55],
    ].map(([x, y, z, s], k) => (
      <mesh key={k} position={[x, y, z]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[s, s]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0.5} depthWrite={false} toneMapped={false} color="#FFE8C4" />
      </mesh>
    ))}
  </group>
);

// ---------- foreground: out-of-focus brass ruler at the lower right ----------
export const Foreground: React.FC = () => (
  <group position={[1.9, -0.2, 6.2]} rotation={[0, -0.45, 0.05]}>
    <mesh castShadow>
      <RoundedBoxGeo args={[2.4, 0.06, 0.32]} radius={0.015} segments={2} />
      <Brass />
    </mesh>
  </group>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const focus = Math.hypot(CAM_POS[0] - COL_X[1], CAM_POS[1] - 1.2, CAM_POS[2]);
  return (
    <>
      <CameraRig f={f} />
      <ambientLight intensity={0.25} color="#FFFFFF" />
      <hemisphereLight args={["#FFF4E2", "#0E0F12", 0.3]} />
      <spotLight
        position={[-4.5, 7.5, 5.5]}
        intensity={260}
        angle={0.55}
        penumbra={0.8}
        decay={2}
        color="#FFF3DC"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[4.5, 4.5, -4]} intensity={1.1} color="#90CAF9" />
      <directionalLight position={[3.5, 2.5, 6]} intensity={0.35} color="#FFE9CF" />
      <Backdrop />
      <Plinth />
      {PLAYERS.map((_, i) => (
        <Column key={i} i={i} />
      ))}
      <Ball pos={BALL_POS} />
      <GroundShadow y={0.004} scale={5} opacity={0.5} blur={2} far={2.4} />
      <Foreground />
      <Finish
        frame={Math.round(f)}
        background={PAL.bg}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={1}
        envIntensity={0.55}
        ao
        focus={focus}
        aperture={0.0012}
        maxBlur={0.007}
      />
    </>
  );
};

// ---------- fonts for the HTML layer ----------
export const useFonts = () => {
  const [handle] = useState(() => delayRender("EP03 cover fonts"));
  useLayoutEffect(() => {
    const faces = [
      new FontFace("EP03Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("EP03Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load()))
      .then((loaded) => loaded.forEach((ff) => (document.fonts as unknown as Set<FontFace>).add(ff)))
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

const GREEN = PAL.pitch;

/** `legend` opacity (default 1) lets the film fade the legend row before the captions start. */
export const Overlay: React.FC<{ legend?: number }> = ({ legend = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(14,15,17,0.9) 0%, rgba(14,15,17,0.7) 22%, rgba(14,15,17,0) 36%, rgba(14,15,17,0) 74%, rgba(14,15,17,0.6) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 196, fontFamily: "EP03Grotesk, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: 6, color: GREEN }}>
      ● SEJARAH SEPAK BOLA #03
    </div>
    <div style={{ position: "absolute", left: 66, top: 256, fontFamily: "EP03Anton, Impact, sans-serif", color: "#F3F1EC", lineHeight: 0.95, textShadow: "0 6px 26px rgba(0,0,0,0.55)" }}>
      <div style={{ fontSize: 170, letterSpacing: 1 }}>SIAPA YANG</div>
      <div style={{ fontSize: 170, letterSpacing: 1 }}>
        <span style={{ color: PAL.brass }}>TERBAIK</span>?
      </div>
    </div>
    <div style={{ position: "absolute", left: 72, top: 600, fontFamily: "EP03Grotesk, 'Segoe UI', sans-serif", fontWeight: 500, fontSize: 44, color: "rgba(243,241,236,0.86)" }}>
      debat GOAT dengan <span style={{ color: GREEN, fontWeight: 700 }}>data</span>
    </div>
    {/* legend, above the bottom safe zone */}
    <div style={{ position: "absolute", left: 72, right: 72, top: 1496, opacity: legend, display: "flex", gap: 40, fontFamily: "EP03Grotesk, 'Segoe UI', sans-serif", fontWeight: 600, fontSize: 30, color: "#E9E6DF", letterSpacing: 1 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 30, height: 30, background: PAL.brass, borderRadius: 4 }} />PIALA DUNIA
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 30, height: 30, background: PAL.orange, borderRadius: 4 }} />BALLON D'OR
      </span>
      <span style={{ opacity: 0.7, fontWeight: 500 }}>1 balok = 1 trofi
      </span>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: PAL.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 28, near: 0.1, far: 80 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
