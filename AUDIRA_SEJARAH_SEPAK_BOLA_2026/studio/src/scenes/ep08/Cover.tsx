// EP08 cover (FILMNOIR): Maracanazo, 16 July 1950. Black-and-white chiaroscuro seen from behind the net:
// the 1950 leather ball lies in the near-post corner (FG), a lone goalkeeper silhouette in Brazil's white
// kit stands head-down in the goalmouth (MG), a hard key light cuts through haze from the far stand of a
// vast, silent bowl (BG) where the scoreboard reads BRASIL 1 – 2 URUGUAY, 16·07·1950.
// Generic figure (no face shown, no name): not a portrait of Barbosa. Numbers: HIGH rows of research only
// (199.854 hadir per RSSSF -> "HAMPIR 200 RIBU"; score 1–2; date 16-07-1950).
import React, { useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { ToyPerson, type Pose, LEG_LENGTH } from "../../core/polish/Person.tsx";
import {
  PAL,
  ballTexture,
  crowdTexture,
  glowTexture,
  grassTexture,
  hazeTexture,
  netTexture,
  plateTexture,
  scoreboardTexture,
} from "./coverTextures.ts";

type V3 = [number, number, number];

// ---------- world (metres) ----------
const GOAL_W = 7.32;
const GOAL_H = 2.44;
const POST = 0.12;
const NET_D = 2.0; // net depth behind the goal line (goal line z = 0, pitch is +z)
export const BALL_R = 0.17;
export const BALL_POS: V3 = [3.18, BALL_R, -1.05];
export const KEEPER_POS: V3 = [0.0, 0, 1.4];
const BOWL_C: V3 = [0, 0, 56];

// ---------- camera: low, outside the net behind the near post ----------
export const CAM_POS: V3 = [6.6, 0.75, -6.2];
export const CAM_TARGET: V3 = [6.6 - 10 * Math.sin(0.61), 0.75, -6.2 + 10 * Math.cos(0.61)];
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    camera.position.set(CAM_POS[0] - t * 0.02, CAM_POS[1], CAM_POS[2] + t * 0.03);
    camera.lookAt(CAM_TARGET[0], CAM_TARGET[1], CAM_TARGET[2]);
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

const grain = () => surfaceGrain(31, 256, 0.2, 4);

// ---------- goal: square white wooden posts, crossbar, net ----------
const Paint: React.FC = () => <meshPhysicalMaterial color="#E9E6DF" roughness={0.42} roughnessMap={grain()} clearcoat={0.25} clearcoatRoughness={0.4} />;

const NetMat: React.FC<{ rx: number; ry: number; opacity?: number }> = ({ rx, ry, opacity = 0.85 }) => {
  const map = useMemo(() => {
    const t = netTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(rx, ry);
    return t;
  }, [rx, ry]);
  return <meshStandardMaterial map={map} transparent alphaTest={0.08} opacity={opacity} side={THREE.DoubleSide} roughness={0.9} color="#DAD7D0" depthWrite={false} />;
};

export const Goal: React.FC = () => {
  const x = GOAL_W / 2 + POST / 2;
  const topBackY = 2.1;
  const slant = Math.hypot(NET_D, GOAL_H - topBackY);
  return (
    <group>
      {[-x, x].map((px) => (
        <mesh key={px} castShadow receiveShadow position={[px, GOAL_H / 2, 0]}>
          <RoundedBoxGeo args={[POST, GOAL_H, POST]} radius={0.015} segments={2} />
          <Paint />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, GOAL_H + POST / 2, 0]}>
        <RoundedBoxGeo args={[GOAL_W + POST * 2, POST, POST]} radius={0.015} segments={2} />
        <Paint />
      </mesh>
      {/* back stanchions */}
      {[-x].map((px) => (
        <mesh key={`s${px}`} castShadow position={[px, topBackY / 2, -NET_D]}>
          <cylinderGeometry args={[0.025, 0.025, topBackY, 10]} />
          <meshStandardMaterial color="#5a5852" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {/* net: top (slanted), back, two sides */}
      <mesh position={[0, (GOAL_H + topBackY) / 2, -NET_D / 2]} rotation={[-Math.PI / 2 + Math.atan2(GOAL_H - topBackY, NET_D), 0, 0]}>
        <planeGeometry args={[GOAL_W, slant]} />
        <NetMat rx={GOAL_W / 0.6} ry={slant / 0.6} />
      </mesh>
      <mesh position={[0, topBackY / 2, -NET_D]}>
        <planeGeometry args={[GOAL_W, topBackY]} />
        <NetMat rx={GOAL_W / 0.6} ry={topBackY / 0.6} opacity={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`side${s}`} position={[s * (GOAL_W / 2), GOAL_H / 2 - 0.08, -NET_D / 2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[NET_D, GOAL_H - 0.16]} />
          <NetMat rx={NET_D / 0.6} ry={GOAL_H / 0.6} opacity={s > 0 ? 0.3 : 0.7} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- pitch: greyscale turf + chalk lines ----------
export const Pitch: React.FC = () => {
  const map = useMemo(() => {
    const t = grassTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(6, 10);
    return t;
  }, []);
  const chalk = <meshLambertMaterial color="#D8D5CE" />;
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 40]}>
        <planeGeometry args={[120, 120]} />
        <meshLambertMaterial map={map} />
      </mesh>
      {/* goal line, six-yard box */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[40, 0.12]} />
        {chalk}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (GOAL_W / 2 + 5.5), 0.004, 2.75]}>
          <planeGeometry args={[0.12, 5.5]} />
          {chalk}
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 5.5]}>
        <planeGeometry args={[GOAL_W + 11, 0.12]} />
        {chalk}
      </mesh>
      {/* penalty box front line, far */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 16.5]}>
        <planeGeometry args={[40.3, 0.12]} />
        {chalk}
      </mesh>
      {/* dark track and grass behind the goal */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -14]}>
        <planeGeometry args={[60, 20]} />
        <meshLambertMaterial color="#1a1b1d" />
      </mesh>
    </group>
  );
};

// ---------- ball in the net corner ----------
const Ball: React.FC = () => (
  <mesh castShadow receiveShadow position={BALL_POS} rotation={[0.4, 2.2, 0.15]}>
    <sphereGeometry args={[BALL_R, 96, 64]} />
    <meshPhysicalMaterial map={ballTexture()} roughness={0.55} roughnessMap={grain()} bumpMap={grain()} bumpScale={0.6} clearcoat={0.25} clearcoatRoughness={0.5} />
  </mesh>
);

// ---------- the goalkeeper: Brazil 1950 white kit, head down, arms hanging ----------
export const KEEPER_POSE: Pose = {
  body: [0.05, 0, 0],
  lift: LEG_LENGTH - 0.004,
  spine: [0.2, 0.08, 0],
  head: [0.62, 0.15, 0],
  ls: [0.12, 0, 0.16],
  le: -0.18,
  rs: [0.05, 0, -0.2],
  re: -0.32,
  lh: [0.02, 0, 0.07],
  lk: 0.06,
  rh: [-0.06, 0, -0.07],
  rk: 0.1,
};
// matte cloth: clone every material once and kill the plastic sheen
export const matte = (g: THREE.Group) => {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.userData.matte) return;
    m.userData.matte = true;
    const src = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
    // Lambert ignores scene.environment, so the keeper stays a silhouette with only the rim lights on him
    const c = new THREE.MeshLambertMaterial({ color: (src.color ? src.color.clone() : new THREE.Color("#888")).multiplyScalar(0.42), map: src.map ?? null });
    m.material = c;
  });
};
const Keeper: React.FC<{ f: number }> = ({ f }) => {
  const ref = React.useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (ref.current) matte(ref.current);
  });
  return (
  <group ref={ref}>
  <ToyPerson
    f={f}
    seed={8}
    poseOverride={KEEPER_POSE}
    position={KEEPER_POS}
    heading={-0.32}
    scale={2.05}
    look={{ skin: "#7b746c", hair: "#121214", hairStyle: 0, top: "#D9D5CD", bottom: "#B3AFA8", outfit: "casual", build: 1.06, height: 1 }}
  />
  </group>
  );
};

// ---------- stadium bowl: silent crowd on two tiers, roof edge, scoreboard ----------
const Tier: React.FC<{ r0: number; r1: number; y0: number; y1: number; seed: number; rep: number }> = ({ r0, r1, y0, y1, seed, rep }) => {
  const map = useMemo(() => {
    const t = crowdTexture(seed).clone();
    t.needsUpdate = true;
    t.repeat.set(rep, 1);
    return t;
  }, [seed, rep]);
  return (
    <mesh position={[BOWL_C[0], (y0 + y1) / 2, BOWL_C[2]]}>
      <cylinderGeometry args={[r1, r0, y1 - y0, 160, 1, true]} />
      <meshLambertMaterial map={map} color="#b4b4b4" side={THREE.BackSide} />
    </mesh>
  );
};

export const Bowl: React.FC = () => (
  <group>
    <Tier r0={60} r1={72} y0={0.6} y1={12} seed={3} rep={34} />
    {/* tier rail */}
    <mesh position={[BOWL_C[0], 12.4, BOWL_C[2]]}>
      <cylinderGeometry args={[72.6, 72.6, 0.9, 160, 1, true]} />
      <meshLambertMaterial color="#2d2f33" side={THREE.BackSide} />
    </mesh>
    <Tier r0={73} r1={92} y0={12.8} y1={32} seed={7} rep={40} />
    {/* roof lip, dark */}
    <mesh position={[BOWL_C[0], 34.5, BOWL_C[2]]}>
      <cylinderGeometry args={[86, 93, 5, 160, 1, true]} />
      <meshLambertMaterial color="#0c0d0f" side={THREE.DoubleSide} />
    </mesh>
    {/* pitch-side wall */}
    <mesh position={[BOWL_C[0], 0.6, BOWL_C[2]]}>
      <cylinderGeometry args={[59.6, 59.6, 1.2, 160, 1, true]} />
      <meshLambertMaterial color="#3a3b3e" side={THREE.BackSide} />
    </mesh>
  </group>
);

// scoreboard on the far stand, facing the goal
export const SB_POS: V3 = [-44.0, 8.75, 80.0];
export const SB_W = 19.5;
export const Scoreboard: React.FC = () => (
  <group position={SB_POS} onUpdate={(g) => g.lookAt(CAM_POS[0], SB_POS[1] - 2, CAM_POS[2])}>
    <mesh position={[0, 0, -0.4]}>
      <boxGeometry args={[SB_W + 1.6, SB_W / 2 + 1.6, 0.6]} />
      <meshLambertMaterial color="#1c1d20" />
    </mesh>
    <mesh>
      <planeGeometry args={[SB_W, SB_W / 2]} />
      <meshBasicMaterial map={scoreboardTexture()} toneMapped={false} fog={false} color="#C9C6BF" />
    </mesh>
    {/* legs into the terrace */}
    {[-SB_W / 2 + 3, SB_W / 2 - 3].map((x) => (
      <mesh key={x} position={[x, -SB_W / 4 - 5, -0.6]}>
        <boxGeometry args={[0.9, 10, 0.9]} />
        <meshLambertMaterial color="#141517" />
      </mesh>
    ))}
    {/* AUDIRA maker plate */}
    <mesh position={[0, -SB_W / 4 - 2.2, 0]}>
      <planeGeometry args={[8.8, 2.2]} />
      <meshBasicMaterial map={plateTexture()} toneMapped={false} fog={false} color="#a8a59d" />
    </mesh>
  </group>
);

// ---------- light: haze sheets (additive, FX layer) ----------
export const KEY_POS: V3 = [-61.6, 11.3, 66.9];
const face = (m: THREE.Mesh) => {
  m.layers.set(FX_LAYER);
  m.lookAt(CAM_POS[0], CAM_POS[1], CAM_POS[2]);
};

const Haze: React.FC = () => (
  <group>
    {(
      [
        [-2, 3.5, 9, 22, 9, 0.05],
        [-10, 6, 26, 40, 12, 0.1],
        [-38, 9, 52, 40, 16, 0.14],
        [-56, 11, 62, 26, 21, 0.32],
        [2, 2.2, 4, 12, 13, 0.05],
      ] as [number, number, number, number, number, number][]
    ).map(([x, y, z, w, s, o], k) => (
      <mesh key={k} position={[x, y, z]} onUpdate={face}>
        <planeGeometry args={[w, w * 0.6]} />
        <meshBasicMaterial map={hazeTexture(s)} transparent opacity={o} depthWrite={false} toneMapped={false} color="#D9D6CF" />
      </mesh>
    ))}
    {/* the lamp itself, a hot point in the far haze */}
    <mesh position={KEY_POS} onUpdate={face}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial map={glowTexture()} transparent opacity={0.45} depthWrite={false} toneMapped={false} fog={false} color="#FFFDF6" />
    </mesh>
    <mesh position={KEY_POS} onUpdate={face}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial map={glowTexture()} transparent opacity={1} depthWrite={false} toneMapped={false} fog={false} color="#FFFFFF" />
    </mesh>
  </group>
);

// ---------- foreground: a corner flag-less near post shadow + out-of-focus net strings ----------
const aim = (p: V3) => (l: THREE.SpotLight) => {
  l.target.position.set(p[0], p[1], p[2]);
  l.target.updateMatrixWorld();
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const focus = Math.hypot(CAM_POS[0] - BALL_POS[0], CAM_POS[1] - BALL_POS[1], CAM_POS[2] - BALL_POS[2]) + 1.2;
  return (
    <>
      <CameraRig f={f} />
      <fog attach="fog" args={["#08090b", 60, 260]} />
      <ambientLight intensity={0.05} />
      <hemisphereLight args={["#c9ced6", "#0b0b0c", 0.08]} />
      {/* hard key from the far stand, through the haze, onto the goalmouth */}
      <spotLight
        position={KEY_POS}
        onUpdate={aim([KEEPER_POS[0] + 3, 0, KEEPER_POS[2] - 4])}
        intensity={60000}
        angle={0.17}
        penumbra={0.35}
        decay={2}
        color="#FFF6E6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
        shadow-camera-near={40}
        shadow-camera-far={110}
      />
      {/* hard rim on the keeper from behind-left (lamp side) */}
      <spotLight position={[KEEPER_POS[0] - 3.5, 3.2, KEEPER_POS[2] + 5]} onUpdate={aim([KEEPER_POS[0], 1.1, KEEPER_POS[2]])} intensity={900} angle={0.3} penumbra={0.5} decay={2} color="#FFF6E8" />
      <spotLight position={[KEEPER_POS[0] + 3.2, 2.6, KEEPER_POS[2] + 4.5]} onUpdate={aim([KEEPER_POS[0], 1.2, KEEPER_POS[2]])} intensity={300} angle={0.3} penumbra={0.5} decay={2} color="#ECEAE6" />
      {/* cold rim from the camera's left, low */}
      <directionalLight position={[-8, 3, -6]} intensity={0.12} color="#A3BFDB" />
      {/* soft fill on the ball from above the camera */}
      <spotLight position={[6, 4.5, -5]} onUpdate={aim(BALL_POS)} intensity={22} angle={0.35} penumbra={1} decay={2} color="#F2EEE6" />
      <spotLight position={[5, 3, -5]} onUpdate={aim([KEEPER_POS[0], 1.1, KEEPER_POS[2]])} intensity={6} angle={0.2} penumbra={1} decay={2} color="#DCE3EC" />
      {/* faint wash on the stands so the bowl reads */}
      <directionalLight position={[0, 40, -20]} intensity={0.15} color="#CFD4DA" />
      <Bowl />
      <Scoreboard />
      <Pitch />
      <Goal />
      <Ball />
      <Keeper f={f} />
      <GroundShadow x={BALL_POS[0]} z={BALL_POS[2]} y={0.004} scale={1.2} opacity={0.75} blur={1.6} far={0.6} />
      <GroundShadow x={KEEPER_POS[0]} z={KEEPER_POS[2]} y={0.004} scale={2.6} opacity={0.6} blur={2} far={2} />
      <Haze />
      <Finish
        frame={Math.round(f)}
        background={PAL.bg}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={0.72}
        envIntensity={0.1}
        ao
        focus={focus}
        aperture={0.0009}
        maxBlur={0.006}
      />
    </>
  );
};

// ---------- fonts for the HTML layer ----------
export const useFonts = () => {
  const [handle] = useState(() => delayRender("EP08 cover fonts"));
  useLayoutEffect(() => {
    const faces = [
      new FontFace("EP08Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("EP08Serif", `url(${staticFile("fonts/InstrumentSerif-Italic.ttf")})`),
      new FontFace("EP08Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load()))
      .then((loaded) => loaded.forEach((ff) => (document.fonts as unknown as Set<FontFace>).add(ff)))
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

export const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(6,7,9,0.9) 0%, rgba(6,7,9,0.62) 18%, rgba(6,7,9,0) 31%, rgba(6,7,9,0) 72%, rgba(6,7,9,0.55) 100%)",
      }}
    />
    {/* film vignette */}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 72, top: 196, fontFamily: "EP08Grotesk, 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: 6, color: PAL.pitch }}>
      ● SEJARAH SEPAK BOLA #08
    </div>
    <div style={{ position: "absolute", left: 66, top: 252, fontFamily: "EP08Anton, Impact, sans-serif", color: PAL.paper, lineHeight: 0.98, textShadow: "0 6px 26px rgba(0,0,0,0.7)" }}>
      <div style={{ fontSize: 112, letterSpacing: 2, opacity: 0.92 }}>HAMPIR 200 RIBU</div>
      <div style={{ fontSize: 156, letterSpacing: 1 }}>ORANG TERDIAM</div>
    </div>
    <div style={{ position: "absolute", left: 74, top: 556, fontFamily: "EP08Serif, Georgia, serif", fontSize: 56, color: "rgba(237,233,225,0.88)" }}>
      Maracanazo, 1950
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
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 42, near: 0.05, far: 260 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
