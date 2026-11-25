// EP05 hook world (DEVFORGE): a floating IDE prompt panel ("AUDIRA_Map.prompt") whose prompt lines
// peel off, break into glowing 1-stud cubes and snap into a side-scroller platform map below.
// The blocky avatar jumps across the fresh platforms while a red NPC patrols and chases within 10 studs.
// Units: 1 = 1 stud. Driven by the 60 fps film clock f (t = f / 60).
// `MapSet` is the reusable map (cover, hook and the explain beat); `HookWorld` = cover framing + lights.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { DEVFORGE_PALETTE as P } from "../../kits/devforge/lib/palette.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { BlockAvatar, type AvatarPose } from "../_shared/BlockAvatar.tsx";
import { blockSideTexture, filmPanelTexture, glowTexture, gridTexture, labelTexture, panelTexture, stripTexture, type FilmPanelMode } from "./textures.ts";

export type V3 = [number, number, number];

/** Camera start pose of the film = the cover framing. */
export const COVER_CAMERA = {
  position: [3.2, 4.6, 50] as V3,
  target: [0.4, 1.4, 0] as V3,
  fov: 36,
};

export const BG = P.ambientVoid;
export const GRASS = "#35C46A";
export const PROMPT_CHARS = 47; // full prompt typed at the opening frame
export const NPC_COLORS = { torso: "#D8312C", legs: "#2B2F3A", skin: "#AEB8C6" };

/** Seeded hash in 0..1 (no Math.random). */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    const cam = camera as THREE.PerspectiveCamera;
    const [px, py, pz] = COVER_CAMERA.position;
    // slow push-in drift; at t≈0.3 s this is still the cover pose (within a few cm)
    cam.position.set(px - t * 0.05, py, pz - t * 0.12);
    cam.lookAt(...COVER_CAMERA.target);
    cam.fov = COVER_CAMERA.fov;
    cam.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- IDE panel ----------
export const PANEL_POS: V3 = [-0.4, 4.3, -8];
export const PANEL_SIZE: [number, number] = [16.4, 9.3];

export const NeonFrame: React.FC<{ w: number; h: number; color: string; intensity?: number }> = ({ w, h, color, intensity = 3.2 }) => {
  const b = 0.09;
  const bars: [V3, [number, number, number]][] = [
    [[0, h / 2, 0], [w + b, b, b]],
    [[0, -h / 2, 0], [w + b, b, b]],
    [[-w / 2, 0, 0], [b, h + b, b]],
    [[w / 2, 0, 0], [b, h + b, b]],
  ];
  return (
    <>
      {bars.map(([p, s], i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={s} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

export const PromptPanel: React.FC<{ f: number; chars?: number; hl?: number; frameColor?: string; big?: boolean; film?: { mode: FilmPanelMode; hl: number } }> = ({ f, chars = PROMPT_CHARS, hl = -1, frameColor = P.accentNeon, big = false, film }) => {
  const t = f / 60;
  const cursor = Math.floor(t * 2.2) % 2 === 0;
  const tex = film ? filmPanelTexture(film.mode, film.hl, cursor) : panelTexture(chars, cursor, hl, big);
  const [w, h] = PANEL_SIZE;
  return (
    <group position={[PANEL_POS[0], PANEL_POS[1] + Math.sin(t * 1.1) * 0.08, PANEL_POS[2]]} rotation={[0.04, 0.1, 0]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[w + 0.5, h + 0.5, 0.45]} radius={0.2} />
        <meshPhysicalMaterial color={P.editorHeader} roughness={0.18} metalness={0.3} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.235]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.25]}>
        <NeonFrame w={w + 0.5} h={h + 0.5} color={frameColor} />
      </group>
    </group>
  );
};

// ---------- peeling prompt strips + flying cubes ----------
const STRIPS: { text: string; pos: V3; rot: V3; seed: number; scale: number }[] = [
  { text: "kejar pemain dalam", pos: [6.4, -1.6, -5.6], rot: [-0.25, -0.15, -0.1], seed: 3, scale: 0.72 },
  { text: "10 stud", pos: [8.6, -3.2, -3.8], rot: [-0.45, -0.2, -0.25], seed: 7, scale: 0.62 },
];

const Strip: React.FC<{ s: (typeof STRIPS)[number]; f: number; opacity: number }> = ({ s, f, opacity }) => {
  const t = f / 60;
  const tex = stripTexture(s.text, s.seed);
  return (
    <mesh position={[s.pos[0], s.pos[1] + Math.sin(t * 1.6 + s.seed) * 0.06, s.pos[2]]} rotation={s.rot} scale={s.scale}>
      <planeGeometry args={[8.75, 1.0]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} color={new THREE.Color(1.6, 1.6, 1.6)} />
    </mesh>
  );
};

/** Missing top blocks of platform C that the cubes fill. */
const SLOTS: V3[] = [
  [7.5, -8, 0.5],
  [8.5, -8, 0.5],
  [9.5, -8, 0.5],
];
const CUBE_N = 9;

const FlyingCubes: React.FC<{ f: number; chaos: number }> = ({ f, chaos }) => {
  const t = f / 60;
  const start = new THREE.Vector3(8.8, -3.3, -3.6);
  return (
    <>
      {Array.from({ length: CUBE_N }, (_, i) => {
        const p = (((t * 0.32 + i / CUBE_N) % 1) + 1) % 1;
        const slot = SLOTS[i % SLOTS.length];
        const end = new THREE.Vector3(...slot);
        const pos = start.clone().lerp(end, p);
        pos.x += Math.sin(p * Math.PI) * (0.9 + (i % 3) * 0.5) * (i % 2 ? 1 : -0.6);
        pos.y += Math.sin(p * Math.PI) * 1.2;
        // chaos: the cubes miss their slots and scatter
        pos.x += chaos * (hash(i) - 0.5) * 9;
        pos.y -= chaos * hash(i + 9) * 6;
        const sc = 0.32 + p * 0.55;
        const glow = 1 - p;
        const col = new THREE.Color(P.accentNeon).lerp(new THREE.Color(chaos > 0.5 ? "#FF4D4F" : GRASS), p);
        return (
          <mesh key={i} position={pos.toArray() as V3} rotation={[p * 4 + i + chaos * 3, p * 3 + i * 0.7, chaos * i]} scale={sc}>
            <RoundedBoxGeo args={[1, 1, 1]} radius={0.1} segments={2} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4 + glow * 2.6} roughness={0.35} toneMapped={glow < 0.3} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- platform map ----------
export const Platform: React.FC<{
  x0: number;
  x1: number;
  top: number;
  missing?: number[];
  seed: number;
  /** 0 = tidy, 1 = broken: blocks tilt and drop (seeded). */
  chaos?: number;
  /** 0 = grey prototype, 1 = finished green (default finished). */
  finish?: number;
  bodyH?: number;
}> = ({ x0, x1, top, missing = [], seed, chaos = 0, finish = 1, bodyH = 14 }) => {
  const grain = useSurfaceGrain(seed, 0.2, 3);
  const side = useMemo(() => {
    const tt = blockSideTexture().clone();
    tt.wrapS = tt.wrapT = THREE.RepeatWrapping;
    tt.repeat.set(x1 - x0, bodyH);
    tt.needsUpdate = true;
    return tt;
  }, [x0, x1, bodyH]);
  const cols = Array.from({ length: x1 - x0 }, (_, i) => x0 + i + 0.5);
  const depth = 3;
  const grass = new THREE.Color("#8A93A3").lerp(new THREE.Color(GRASS), finish);
  const bodyTint = new THREE.Color("#6B7280").lerp(new THREE.Color("#FFFFFF"), finish);
  const tilt = chaos * (hash(seed) - 0.5) * 0.5;
  const drop = chaos * hash(seed + 3) * 2.2;
  return (
    <group position={[(x0 + x1) / 2, -drop, 0]} rotation={[0, 0, tilt]}>
      <group position={[-(x0 + x1) / 2, 0, 0]}>
        {/* body */}
        <mesh position={[(x0 + x1) / 2, top - 1 - bodyH / 2, 0.5]} receiveShadow castShadow>
          <RoundedBoxGeo args={[x1 - x0, bodyH, depth]} radius={0.08} segments={2} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} map={finish > 0.02 ? side : null} color={bodyTint} roughnessMap={grain} />
        </mesh>
        {/* grass top: 1-stud blocks with studs */}
        {cols.map((x, i) => {
          if (missing.includes(i)) return null;
          const j = chaos * (hash(seed * 31 + i) - 0.5);
          return (
            <group key={i} position={[x + j * 0.8, top - 0.5 + chaos * hash(seed * 7 + i) * 1.6, 0.5]} rotation={[j * 0.6, j * 0.4, j * 1.4]}>
              <mesh castShadow receiveShadow>
                <RoundedBoxGeo args={[0.98, 1, depth]} radius={0.1} segments={3} />
                <meshPhysicalMaterial {...POLISH.brickABS} color={grass} roughnessMap={grain} />
              </mesh>
              {[-0.9, 0, 0.9].map((z) => (
                <mesh key={z} position={[0, 0.58, z]} castShadow>
                  <cylinderGeometry args={[0.28, 0.28, 0.16, 20]} />
                  <meshPhysicalMaterial {...POLISH.brickABS} color={grass} />
                </mesh>
              ))}
            </group>
          );
        })}
        {/* prototype wireframe overlay */}
        {finish < 0.98 ? (
          <mesh position={[(x0 + x1) / 2, top - 1 - bodyH / 2 + 0.5, 0.5]}>
            <boxGeometry args={[x1 - x0 + 0.05, bodyH + 1.05, depth + 0.05, x1 - x0, 6, 3]} />
            <meshBasicMaterial color={P.accentNeon} wireframe transparent opacity={0.55 * (1 - finish)} toneMapped={false} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
};

export const Coin: React.FC<{ pos: V3; f: number; seed: number; scale?: number }> = ({ pos, f, seed, scale = 1 }) => {
  const t = f / 60;
  return (
    <group position={[pos[0], pos[1] + Math.sin(t * 3 + seed) * 0.15, pos[2]]} rotation={[Math.PI / 2, 0, t * 2.5 + seed]} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.16, 32]} />
        <meshStandardMaterial color={P.amberGold} metalness={0.9} roughness={0.22} emissive={P.amberGold} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
        <meshStandardMaterial color="#FFE08A" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

/** Red dashed range line between NPC and player with a "10 STUD" plate. */
export const RangeMarker: React.FC<{ a: V3; b: V3; f: number; opacity?: number }> = ({ a, b, f, opacity = 1 }) => {
  const t = f / 60;
  const plate = labelTexture("10 STUD", "#E5383B", "#FFFFFF");
  const n = 14;
  const len = b[0] - a[0];
  const pulse = 0.85 + Math.sin(t * 6) * 0.15;
  if (opacity <= 0.01) return null;
  return (
    <group position={[(a[0] + b[0]) / 2, a[1], a[2]]} scale={Math.max(0.01, opacity)}>
     <group position={[-(a[0] + b[0]) / 2, -a[1], -a[2]]}>
      {Array.from({ length: n }, (_, i) => {
        const x = a[0] + (len * (i + 0.5)) / n;
        return (
          <mesh key={i} position={[x, a[1], a[2]]}>
            <boxGeometry args={[(len / n) * 0.55, 0.12, 0.12]} />
            <meshStandardMaterial color="#FF4D4F" emissive="#FF4D4F" emissiveIntensity={2.6 * pulse} toneMapped={false} />
          </mesh>
        );
      })}
      {[a, b].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.12, 0.9, 0.12]} />
          <meshStandardMaterial color="#FF4D4F" emissive="#FF4D4F" emissiveIntensity={2.6} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[(a[0] + b[0]) / 2, a[1] + 0.75, a[2] + 0.05]}>
        <planeGeometry args={[3.0, 0.94]} />
        <meshBasicMaterial map={plate} transparent toneMapped={false} />
      </mesh>
    </group>
    </group>
  );
};

/** "!" alert above the chasing NPC. */
export const Alert: React.FC<{ pos: V3; f: number; scale?: number }> = ({ pos, f, scale = 1 }) => {
  const t = f / 60;
  const s = (1 + Math.sin(t * 8) * 0.08) * scale;
  if (scale <= 0.01) return null;
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.45, 0]}>
        <RoundedBoxGeo args={[0.32, 0.95, 0.32]} radius={0.12} segments={3} />
        <meshStandardMaterial color="#FF3B30" emissive="#FF3B30" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial color="#FF3B30" emissive="#FF3B30" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- background + foreground depth ----------
export const BackWall: React.FC = () => {
  const tex = useMemo(() => {
    const g = gridTexture().clone();
    g.wrapS = g.wrapT = THREE.RepeatWrapping;
    g.repeat.set(6, 8);
    g.needsUpdate = true;
    return g;
  }, []);
  return (
    <>
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[90, 120]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      {/* soft cyan halo behind the panel */}
      <mesh position={[PANEL_POS[0], PANEL_POS[1], -20]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial map={glowTexture("rgba(14,80,100,0.75)")} transparent depthWrite={false} />
      </mesh>
    </>
  );
};

const DRIFT: { p: V3; s: number; c: string }[] = [
  { p: [-11, 12, -18], s: 1.4, c: P.codeFunc },
  { p: [12, 10, -16], s: 1.1, c: P.accentNeon },
  { p: [-12, -2, -14], s: 0.9, c: P.metricProfit },
  { p: [13.5, -4, -12], s: 1.2, c: P.codeFunc },
  { p: [-7.6, -12, 14], s: 0.9, c: P.accentNeon },
  { p: [9.2, 8.5, 16], s: 0.7, c: P.amberGold },
];

export const DriftCubes: React.FC<{ f: number; seed?: number }> = ({ f, seed = 0 }) => {
  const t = f / 60;
  return (
    <>
      {DRIFT.map((d, i) => {
        const k = i + seed * 3;
        const sx = seed ? (hash(k) > 0.5 ? 1 : -1) : 1;
        return (
          <mesh key={i} position={[d.p[0] * sx, d.p[1] + Math.sin(t * 0.8 + k) * 0.3, d.p[2]]} rotation={[t * 0.3 + k, t * 0.4 + k * 2, 0]} scale={d.s}>
            <RoundedBoxGeo args={[1, 1, 1]} radius={0.12} segments={2} />
            <meshStandardMaterial color={d.c} emissive={d.c} emissiveIntensity={1.2} roughness={0.3} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- the map set (panel + strips + cubes + platforms + avatars) ----------
export type MapSetProps = {
  f: number;
  chars?: number;
  hl?: number;
  chaos?: number;
  hero?: { pos: V3; pose: AvatarPose; rot: number; tumble?: number };
  npc?: { pos: V3; pose: AvatarPose; rot: number };
  range?: number;
  alert?: number;
  strips?: number;
  cubes?: boolean;
  /** larger panel text (film beats after the hook) */
  big?: boolean;
  /** film-only re-lettered panel (3 big lines) */
  film?: { mode: FilmPanelMode; hl: number };
  /** extra children rendered in the map's space (selection boxes, tags) */
  children?: React.ReactNode;
};

const STRAIGHT: AvatarPose[] = ["stand", "type", "point", "think", "wave"];
/** Dark seam between straight legs so the two legs read as two (only for straight, non-lifting poses). */
const Seam: React.FC = () => (
  <mesh position={[0, 1.0, 0]}>
    <boxGeometry args={[0.07, 1.96, 0.9]} />
    <meshStandardMaterial color="#0B0F18" roughness={0.9} />
  </mesh>
);

export const HERO0: V3 = [-5.5, -8, 0.6];
export const NPC0: V3 = [0.8, -7, 0.6];

export const MapSet: React.FC<MapSetProps> = ({
  f,
  chars = PROMPT_CHARS,
  hl = -1,
  chaos = 0,
  hero = { pos: HERO0, pose: "jump", rot: -0.35 },
  npc = { pos: NPC0, pose: "run", rot: -0.9 },
  range = 1,
  alert = 1,
  strips = 1,
  cubes = true,
  big = false,
  film,
  children,
}) => {
  const tumble = hero.tumble ?? 0;
  return (
    <>
      <DriftCubes f={f} />
      <PromptPanel f={f} chars={chars} hl={hl} big={big} film={film} frameColor={chaos > 0.3 ? "#FF4D4F" : P.accentNeon} />
      {strips > 0.01 ? STRIPS.map((s) => <Strip key={s.text} s={s} f={f} opacity={strips} />) : null}
      {cubes ? <FlyingCubes f={f} chaos={chaos} /> : null}

      {/* side-scroller map: A (left, low), B (middle, raised), C (right, being built) */}
      <Platform x0={-13} x1={-4} top={-8} seed={11} chaos={chaos} />
      <Platform x0={-2} x1={3} top={-7} seed={12} chaos={chaos} />
      <Platform x0={5} x1={12} top={-7.5} missing={[2, 3, 4]} seed={13} chaos={chaos} />
      <Coin pos={[-3.0, -2.8 - chaos * 3, 0.6]} f={f} seed={1} />
      <Coin pos={[-10, -6.2 - chaos * 2, 0.6]} f={f} seed={2} />
      <Coin pos={[5.8, -5.4 - chaos * 4, 0.6]} f={f} seed={3} />

      {/* player avatar */}
      <group position={hero.pos} rotation={[0, 0, tumble]}>
        <BlockAvatar f={f} pose={hero.pose} seed={1} rotation={[0, hero.rot, 0]} />
        {STRAIGHT.includes(hero.pose) ? <group rotation={[0, hero.rot, 0]}><Seam /></group> : null}
      </group>
      {STRAIGHT.includes(npc.pose) ? <group position={npc.pos} rotation={[0, npc.rot, 0]}><Seam /></group> : null}
      {/* NPC: grey-red bot */}
      <BlockAvatar f={f} pose={npc.pose} seed={2} position={npc.pos} rotation={[0, npc.rot, 0]} colors={NPC_COLORS} torsoEmissive="#FF2A1F" />
      <Alert pos={[npc.pos[0] - 0.3, npc.pos[1] + 6.6, npc.pos[2]]} f={f} scale={alert} />
      <RangeMarker a={[hero.pos[0] + 0.6, -5.9, 2.4]} b={[npc.pos[0] - 0.6, -5.9, 2.4]} f={f} opacity={range} />
      {children}
    </>
  );
};

/** Hook lights (also used, following the camera, by the film). */
export const HookLights: React.FC = () => (
  <>
    <ambientLight intensity={0.35} color="#CFE6FF" />
    <hemisphereLight args={["#BFE9FF", "#0A0F18", 0.45]} />
    <directionalLight position={[-16, 6, -4]} intensity={1.4} color={P.accentNeon} />
    <pointLight position={[0, -3, 6]} intensity={60} distance={30} decay={2} color={P.metricProfit} />
    <pointLight position={[PANEL_POS[0], PANEL_POS[1] - 3, PANEL_POS[2] + 5]} intensity={70} distance={26} decay={2} color={P.accentNeon} />
  </>
);

export const KeyLight: React.FC = () => (
  <directionalLight
    position={[14, 22, 20]}
    intensity={2.6}
    color="#FFF2DE"
    castShadow
    shadow-mapSize-width={2048}
    shadow-mapSize-height={2048}
    shadow-camera-left={-22}
    shadow-camera-right={22}
    shadow-camera-top={22}
    shadow-camera-bottom={-22}
    shadow-camera-near={1}
    shadow-camera-far={80}
    shadow-bias={-0.0004}
    shadow-radius={4}
  />
);

// ---------- the whole hook world (cover) ----------
export const HookWorld: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig f={f} />
    <fog attach="fog" args={[BG, 62, 110]} />
    <KeyLight />
    <HookLights />
    <BackWall />
    <MapSet f={f} />
  </>
);
