// EP46 cover (TIMEFORGE, pearl studio look of the series, same pipeline as the EP02 cover).
// One hero: Arthur Wharton as a stylised dark-skinned goalkeeper on the tallest pedestal "1889"
// (first Black professional footballer, Rotherham Town), stitched leather ball, wooden posts and
// crossbar without a net (nets came in 1891). A green time line climbs to him from the 1886
// sprint step (100 yards in 10 seconds); a grey line falls from him to a plain, nameless grave
// (December 1930, pauper's grave) with a miner's lantern (he ended as a colliery worker).
// A small bronze statue "2014" stands behind (St George's Park).
// Facts: research/SOURCE_REGISTER.md rows 3, 5, 8, 9, 11.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig, FX_LAYER, Post, type Shot } from "../../core/render/Post.tsx";
import { NEUTRAL_LOOK, Studio, type StudioLook } from "../../core/studio/Studio.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, SKIN_TONES } from "../../core/polish/Person.tsx";
import { INK, INK_SOFT, MANROPE, manropeReady } from "../../core/type/fonts.ts";
import { Ball, tagBox } from "../ep02/Cover.tsx";
import { GlbLive } from "./GlbLive.tsx";
import { heroPlaqueTexture, smallPlaqueTexture, stoneTexture, turfTexture, woodTexture } from "./coverTextures.ts";

type V3 = [number, number, number];

export const GREEN = "#1E9A4C";
export const PITCH = "#2BD46A";
export const ASH = "#8b9295";
export const BRONZE = "#8a5a2e";

// ---------- layout ----------
export const CAM_POS: V3 = [0, 15, 44];
export const CAM_TARGET: V3 = [0.15, 2.1, 0.4];
export const FOV = 18.5;

export const HERO = { x: 0, z: 0.6, w: 4.6, d: 2.2, h: 1.7 };
export const RUN = { x: -2.6, z: 3.8, w: 1.4, h: 0.55 };
export const GRAVE = { x: 2.6, z: 3.7 };
export const STATUE = { x: 3.0, z: -5.6, w: 1.2, h: 1.1 };

export const coverCam = () => {
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 1, 900);
  cam.position.set(...CAM_POS);
  cam.lookAt(...CAM_TARGET);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};

export const SHOT: Shot = { pos: CAM_POS, target: CAM_TARGET, fov: FOV, focus: 47, aperture: 0.0012, maxBlur: 0.006, exposure: 1.0 };

export const LOOK: StudioLook = { ...NEUTRAL_LOOK, tint: [1.06, 1.0, 0.86], tintAmount: 0.75, keyAz: (28 * Math.PI) / 180, keyEl: (56 * Math.PI) / 180, keyIntensity: 2.2, envIntensity: 0.75 };

/** Turns the stitched leather ball (ep02 Ball, detail) so its lace slit faces the camera, 3/4 on. */
const LACE_TO_CAMERA = new THREE.Euler((-22 * Math.PI) / 180, (142 * Math.PI) / 180, 0, "YXZ");

// ---------- hero stage ----------
export const HeroStage: React.FC = () => {
  const grain = useSurfaceGrain(46, 0.12, 3);
  const turf = turfTexture();
  const { x, z, w, d, h } = HERO;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <RoundedBoxGeo args={[w, h, d]} radius={0.1} segments={4} />
        <meshPhysicalMaterial color="#ecebe6" roughness={0.42} roughnessMap={grain} clearcoat={0.45} clearcoatRoughness={0.25} />
      </mesh>
      {/* turf inlay on top */}
      <mesh receiveShadow position={[0, h + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.3, d - 0.3]} />
        <meshPhysicalMaterial map={turf} {...POLISH.fabric} sheen={0.25} />
      </mesh>
      {/* front plaque: 1889 + AUDIRA */}
      <mesh position={[0, h * 0.5, d / 2 + 0.004]}>
        <planeGeometry args={[2.6, 1.3]} />
        <meshPhysicalMaterial map={heroPlaqueTexture("1889", PITCH)} roughness={0.5} clearcoat={0.3} />
      </mesh>
    </group>
  );
};

/** Early goal: two square wooden posts and a crossbar, no net (nets from 1891). */
export const WoodGoal: React.FC<{ pos: V3; width?: number; height?: number }> = ({ pos, width = 4.0, height = 2.5 }) => {
  const wood = woodTexture();
  const t = 0.12;
  const mat = <meshPhysicalMaterial map={wood} color="#f2ead9" roughness={0.6} clearcoat={0.15} />;
  return (
    <group position={pos}>
      {[-1, 1].map((k) => (
        <mesh key={k} castShadow receiveShadow position={[(k * width) / 2, height / 2, 0]}>
          <RoundedBoxGeo args={[t, height, t]} radius={0.02} segments={2} />
          {mat}
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, height, 0]}>
        <RoundedBoxGeo args={[width + t, t, t]} radius={0.02} segments={2} />
        {mat}
      </mesh>
    </group>
  );
};

export const Keeper: React.FC<{ f: number }> = ({ f }) => {
  const look = useMemo(
    () => ({ skin: SKIN_TONES[5], hair: "#141010", top: "#2b3a4f", bottom: "#f1eee6", outfit: "casual" as const, hairStyle: 0 as const, build: 1.06, height: 1.04 }),
    [],
  );
  const { x, z, h } = HERO;
  return (
    <>
      <ToyPerson f={f} seed={46} pose="cheer" look={look} position={[x - 0.3, h, z - 0.05]} heading={0.12} scale={2.35} />
      <group position={[x + 0.95, h + 0.34, z + 0.5]} rotation={LACE_TO_CAMERA}>
        <Ball pos={[0, 0, 0]} skin="leather" r={0.34} detail />
      </group>
    </>
  );
};

export const SmallPedestal: React.FC<{ x: number; z: number; w: number; h: number; year: string; accent: string; dark?: boolean }> = ({ x, z, w, h, year, accent, dark }) => {
  const grain = useSurfaceGrain(x * 10 + z, 0.12, 3);
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <RoundedBoxGeo args={[w, h, w]} radius={0.07} segments={4} />
        {dark ? (
          <meshPhysicalMaterial color="#4a4744" roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.2} />
        ) : (
          <meshPhysicalMaterial color="#ecebe6" roughness={0.42} roughnessMap={grain} clearcoat={0.45} clearcoatRoughness={0.25} />
        )}
      </mesh>
      <mesh position={[0, h + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[w / 2 - 0.12, w / 2 - 0.08, 96]} />
        <meshBasicMaterial color={new THREE.Color(accent).multiplyScalar(1.5)} toneMapped={false} />
      </mesh>
      <mesh position={[0, h / 2, w / 2 + 0.004]}>
        <planeGeometry args={[Math.min(h * 0.9, w * 0.8), Math.min(h * 0.9, w * 0.8)]} />
        <meshPhysicalMaterial map={smallPlaqueTexture(year, accent)} roughness={0.5} clearcoat={0.3} />
      </mesh>
    </group>
  );
};

/** Plain grave: low earth mound and a blank, nameless stone. */
export const Grave: React.FC<{ pos: V3 }> = ({ pos }) => {
  const stone = stoneTexture();
  return (
    <group position={pos}>
      <mesh receiveShadow castShadow position={[0, 0.12, 0.2]}>
        <RoundedBoxGeo args={[1.2, 0.24, 1.9]} radius={0.11} segments={4} />
        <meshPhysicalMaterial color="#7d7268" roughness={0.95} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.72, -0.85]} rotation={[-0.05, 0, 0.04]}>
        <RoundedBoxGeo args={[1.0, 1.45, 0.22]} radius={0.1} segments={4} />
        <meshPhysicalMaterial map={stone} roughness={0.85} />
      </mesh>
    </group>
  );
};

export const BronzeStatue: React.FC<{ f: number }> = ({ f }) => {
  const look = useMemo(() => ({ skin: "#7a5230", hair: "#5e3e22", top: BRONZE, bottom: "#7d522b", outfit: "casual" as const, hairStyle: 0 as const, build: 1.04, height: 1 }), []);
  const { x, z, h } = STATUE;
  return <ToyPerson f={f} seed={2014} pose="stand" look={look} position={[x, h, z]} heading={-0.4} scale={1.5} />;
};

/** Time line: green climb 1886 → 1889, grey fall 1889 → 1930, faint gold dots 1930 → 2014. */
export const TimeLines: React.FC = () => {
  const { up, down, dots } = useMemo(() => {
    const tube = (pts: V3[], from: string, to: string, gain: number) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");
      const g = new THREE.TubeGeometry(curve, 140, 0.05, 8, false);
      const a = new THREE.Color(from), b = new THREE.Color(to);
      const cols: number[] = [];
      const n = 141, ring = g.attributes.position.count / n;
      for (let k = 0; k < g.attributes.position.count; k++) {
        const c = a.clone().lerp(b, Math.floor(k / ring) / (n - 1));
        cols.push(c.r * gain, c.g * gain, c.b * gain);
      }
      g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      return g;
    };
    const up = tube(
      [[RUN.x + 0.45, RUN.h + 0.05, RUN.z - 0.45], [-2.5, 1.1, 2.6], [-2.2, HERO.h + 0.05, 1.5]],
      PITCH, "#8CFFB0", 2.0,
    );
    const down = tube(
      [[HERO.x + 2.25, HERO.h + 0.05, HERO.z + 0.9], [2.7, 1.1, 2.0], [GRAVE.x, 0.4, 2.7]],
      "#9aa0a2", "#5d6366", 1.0,
    );
    const a = new THREE.Vector3(GRAVE.x + 0.5, 0.15, GRAVE.z - 1.2), b = new THREE.Vector3(STATUE.x, 0.15, STATUE.z + 0.8);
    const d: V3[] = [];
    for (let i = 1; i < 16; i++) {
      const p = a.clone().lerp(b, i / 16);
      p.x += Math.sin((i / 16) * Math.PI) * 0.35;
      p.y = 0.08;
      d.push([p.x, p.y, p.z]);
    }
    return { up, down, dots: d };
  }, []);
  return (
    <>
      <mesh geometry={up} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh geometry={down}>
        <meshBasicMaterial vertexColors />
      </mesh>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.055, 12, 8]} />
          <meshBasicMaterial color="#c9a04a" />
        </mesh>
      ))}
    </>
  );
};

const Runner: React.FC<{ f: number }> = ({ f }) => {
  const look = useMemo(() => ({ skin: SKIN_TONES[5], hair: "#141010", top: "#f1eee6", bottom: "#f1eee6", outfit: "casual" as const, hairStyle: 0 as const, build: 0.98, height: 1 }), []);
  return <ToyPerson f={f + 18} seed={1886} pose="walk" look={look} position={[RUN.x, RUN.h, RUN.z]} heading={0.9} scale={1.35} />;
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Studio look={LOOK} plinth={{ top: 0, r: 90, h: 1, ring: false }} shadow={{ left: -14, right: 14, top: 16, bottom: -16, near: 4, far: 80 }} />
    <HeroStage />
    <WoodGoal pos={[HERO.x, HERO.h, HERO.z - 0.75]} />
    <Keeper f={f} />
    <SmallPedestal x={RUN.x} z={RUN.z} w={RUN.w} h={RUN.h} year="1886" accent={PITCH} />
    <Runner f={f} />
    <Grave pos={[GRAVE.x, 0, GRAVE.z]} />
    <GlbLive id="miner-lantern-c13511" position={[GRAVE.x - 0.95, 0, GRAVE.z + 0.75]} rotation={[0, -0.6, 0]} height={0.95} />
    <SmallPedestal x={STATUE.x} z={STATUE.z} w={STATUE.w} h={STATUE.h} year="2014" accent="#c9a04a" dark />
    <BronzeStatue f={f} />
    <TimeLines />
    {/* foreground: an out-of-focus stitched leather ball on the studio floor */}
    <group position={[2.3, 0.75, 12]} rotation={LACE_TO_CAMERA}>
      <Ball pos={[0, 0, 0]} skin="leatherLight" r={0.75} detail />
    </group>
    <CameraRig shot={SHOT} />
    <Post shot={SHOT} frame={Math.round(f)} aoRadius={0.45} />
  </>
);

// ---------- HTML overlay ----------
export const project = (p: V3) => {
  const v = new THREE.Vector3(...p).project(coverCam());
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920] as const;
};

/** Card text at >= 30 px (TIMEFORGE memory: smaller labels vanish on the pale studio). */
export const TagBody: React.FC<{ name: string; line: string; muted?: boolean }> = ({ name, line, muted }) => (
  <>
    <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "0.05em", color: muted ? "#4a5053" : INK, lineHeight: 1.1 }}>{name}</div>
    <div style={{ fontSize: 30, fontWeight: 500, color: muted ? "#5d6366" : "#4a5053", lineHeight: 1.2 }}>{line}</div>
  </>
);

/** Name card pinned to a world point: dx/dy offset in px; right = card grows to the left of the point. */
const Tag: React.FC<{ at: V3; dx: number; dy: number; right?: boolean; name: string; line: string; muted?: boolean }> = ({ at, dx, dy, right, name, line, muted }) => {
  const [sx, sy] = project(at);
  return (
    <div style={{ ...tagBox(!!muted, !!right), top: sy + dy, left: sx + dx, transform: right ? "translateX(-100%)" : undefined }}>
      <TagBody name={name} line={line} muted={muted} />
    </div>
  );
};

export const Overlay: React.FC<{ headK?: number; tagK?: number }> = ({ headK = 1, tagK = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", fontFamily: MANROPE, opacity: headK }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(243,241,236,0.92) 0%, rgba(243,241,236,0.75) 20%, rgba(243,241,236,0) 30%)" }} />
    <div style={{ position: "absolute", top: 192, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.38em", paddingLeft: "0.38em", color: GREEN }}>SEJARAH SEPAK BOLA #46</div>
      <div style={{ marginTop: 16, fontWeight: 600, fontSize: 104, lineHeight: 0.98, letterSpacing: "-0.01em", color: INK }}>
        <div>KIPER YANG</div>
        <div style={{ color: GREEN }}>DILUPAKAN</div>
      </div>
      <div style={{ marginTop: 18, fontSize: 36, fontWeight: 400, color: INK_SOFT }}>Arthur Wharton · pemain pro kulit hitam pertama</div>
    </div>
    <div style={{ position: "absolute", inset: 0, opacity: tagK }}>
      <Tag at={[HERO.x - 2.0, HERO.h + 1.2, HERO.z - 0.75]} dx={-150} dy={-30} name="ARTHUR WHARTON" line="1889 · kiper pro" />
      <Tag at={[RUN.x, RUN.h + 1.5, RUN.z]} dx={-60} dy={-100} name="1886" line="100 yard · 10 detik" />
      <Tag at={[GRAVE.x, 1.6, GRAVE.z - 0.85]} dx={170} dy={-80} right name="DES 1930" line="makam tanpa nama" muted />
      <Tag at={[STATUE.x, STATUE.h + 1.6, STATUE.z]} dx={180} dy={-95} right name="2014" line="patung perunggu" />
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [handle] = useState(() => delayRender("Manrope for EP46 cover"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: "#e9e6e0" }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: FOV, near: 1, far: 900, position: CAM_POS }}
          >
            <Scene f={f} />
          </ThreeCanvas>
          <Overlay />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
