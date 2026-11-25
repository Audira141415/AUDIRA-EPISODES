// EP11 "Kearifan Segenggam Garam" (TERRARIUM, 16:9). The whole story lives inside glass on one walnut
// table: the old man's hut in a tall jar, the drinking glass of salt water, and the forest lake under a
// wide glass cloche. The camera travels between them and goes inside at character scale; the payoff
// pulls back to the small glass beside the big lake. Everything is timed from the real voice timeline.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { makeWoodTexture } from "../../kits/terrarium/lib/materials";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { LakeVessel } from "./LakeVessel";
import { SaltGlass } from "./SaltGlass";
import { HutJar } from "./HutJar";
import { Figure } from "./Figure.tsx";
import { CUP, HUT, HUTSET, PAL, prng } from "./world";
import { FS, T, TOTAL, cameraAt, day, hutGlass, hutW, lakeSalt, oldMan, youngMan, type CamPose, type FigState } from "./story";
import { Captions, Hikmah, Outro, TitleCard } from "./Overlay";

loadFraunces("normal", { weights: ["400", "600"], subsets: ["latin"] });
loadFraunces("italic", { weights: ["400"], subsets: ["latin"] });
loadManrope("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const TOTAL_SECONDS: number = TOTAL;

const CameraRig: React.FC<{ pose: CamPose; aspect: number }> = ({ pose, aspect }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(...pose.target);
    cam.fov = pose.fov;
    cam.aspect = aspect;
    cam.near = 0.02;
    cam.updateProjectionMatrix();
  }, [camera, pose, aspect]);
  return null;
};

const Room: React.FC<{ wall: number; sky: THREE.Color }> = ({ wall, sky }) => {
  const wood = useMemo(() => {
    const w = makeWoodTexture();
    w.repeat.set(4, 3);
    return w;
  }, []);
  const wallTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const g = c.getContext("2d")!;
    const lg = g.createLinearGradient(0, 0, 1024, 0);
    lg.addColorStop(0, "#EAD9B4");
    lg.addColorStop(0.45, "#D5D6BA");
    lg.addColorStop(1, "#AEB896");
    g.fillStyle = lg;
    g.fillRect(0, 0, 1024, 512);
    const r = prng(1111);
    g.filter = "blur(14px)";
    for (let i = 0; i < 30; i++) {
      const warm = r() > 0.55;
      g.fillStyle = warm ? "rgba(255,236,190,0.35)" : `rgba(${70 + r() * 40},${110 + r() * 40},${60 + r() * 30},0.35)`;
      g.beginPath();
      g.arc(r() * 1024, r() * 512, 20 + r() * 60, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  const tint = new THREE.Color("#FFFFFF").lerp(sky, 0.35).multiplyScalar(wall);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, -0.001, 0]} receiveShadow>
        <planeGeometry args={[50, 34]} />
        <meshStandardMaterial map={wood} roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[-2, 7, -16]}>
        <planeGeometry args={[80, 34]} />
        <meshBasicMaterial map={wallTex} color={tint} fog={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const LOOK = {
  old: { skin: PAL.oldSkin, hair: PAL.oldHair, top: PAL.oldTop, bottom: PAL.oldBottom, hairStyle: 0 as const, height: 0.98, build: 1.0 },
  young: { skin: PAL.youngSkin, hair: PAL.youngHair, top: PAL.youngTop, bottom: PAL.youngBottom, hairStyle: 0 as const, height: 1.0, build: 1.04 },
};
const Stick = <mesh position={[0, -0.32, 0.03]} rotation={[0.15, 0, 0]} castShadow><cylinderGeometry args={[0.012, 0.016, 0.85, 8]} /><meshStandardMaterial color="#6B4A2C" roughness={0.9} /></mesh>;

const Person: React.FC<{ s: FigState; f: number; seed: number; who: "old" | "young" }> = ({ s, f, seed, who }) =>
  s.where === "off" ? null : (
    <Figure
      f={f}
      seed={seed}
      outfit="casual"
      look={LOOK[who]}
      poseOverride={s.pose}
      position={s.pos}
      heading={s.heading}
      scale={FS}
      mouth={s.mouth}
      mood={s.mood}
      beard={who === "old" ? "#EDEAE2" : undefined}
      kopiah={who === "old" ? "#F4F1E8" : undefined}
      rightItem={s.item === "stick" ? Stick : undefined}
    />
  );

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const s = width / 1920;
  const pose = cameraAt(t);
  const d = day(t);
  const sky = `#${d.sky.getHexString()}`;
  const o = oldMan(t);
  const y = youngMan(t);
  const hg = hutGlass(t);
  const ls = lakeSalt(t);
  const sunPos: [number, number, number] = [-6 + 4 * d.night, 7 - 2 * d.night, -5];
  const plaqueLamp = Math.max(0, (t - (T("s8d") - 1)) / 2);

  return (
    <AbsoluteFill style={{ background: sky }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 30, near: 0.02, far: 120, position: [0, 2.5, 9] }}>
        <CameraRig pose={pose} aspect={width / height} />
        <color attach="background" args={[sky]} />
        <fog attach="fog" args={[sky, 16, 40]} />
        <ambientLight intensity={d.amb} color={d.night > 0.5 ? "#9FB4FF" : "#FFF3E2"} />
        <hemisphereLight args={[d.sky, "#3A2A1C", d.hemi]} />
        <directionalLight
          position={sunPos}
          intensity={d.sunI}
          color={d.sun}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-11}
          shadow-camera-right={6}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[5, 4, 6]} intensity={0.9 * (1 - d.night * 0.7)} color="#E6F0FF" />
        <pointLight position={[2.4, 1.2, 2.4]} intensity={Math.min(1, plaqueLamp) * 2.2} distance={4} color="#FFC77A" />
        <Room wall={d.wall} sky={d.sky} />
        <HutJar t={t} night={d.night} mist={1 - d.night} />
        {hg.visible && (
          <SaltGlass t={t} swirl={hg.swirl} cloud={hg.cloud} pour={hg.pour} position={hg.pos} scale={0.1} tilt={hg.tilt} spoon={hg.cloud > 0.01 && hg.tilt < 0.05} dish={hutW(HUTSET.table[0] - 0.07, HUTSET.table[1] - 0.04, 0.027 + HUTSET.tableH)} dishSalt={hg.dishSalt} />
        )}
        {!hg.visible && (
          <SaltGlass t={t} swirl={0} cloud={0} pour={0} position={[HUT.cx + 50, -10, 0]} scale={0.1} spoon={false} dish={hutW(HUTSET.table[0] - 0.07, HUTSET.table[1] - 0.04, 0.027 + HUTSET.tableH)} dishSalt={hg.dishSalt} />
        )}
        <LakeVessel t={t} scatter={ls.scatter} stir={ls.stir} night={d.night} hand={ls.hand} />
        <SaltGlass t={t} swirl={0.6} cloud={1} position={[CUP.x, 0, CUP.z]} dish={[CUP.x + 0.72, 0, CUP.z + 0.38]} />
        <Person s={o} f={f} seed={21} who="old" />
        <Person s={y} f={f} seed={34} who="young" />
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} hdri="sky" envIntensity={0.55} envRotation={2.2} />
      </ThreeCanvas>
      <TitleCard t={t} s={s} />
      <Hikmah t={t} s={s} />
      <Captions t={t} s={s} />
      <Outro t={t} s={s} />
      <AudiraSignature seed="cerita-hikmah-ep11" handle="@audira" />
    </AbsoluteFill>
  );
};


