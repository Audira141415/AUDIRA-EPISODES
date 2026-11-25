// EP050 "Kok Koper Nggak Tertukar?" — SATISFYFORGE topic cover (1080x1920 still).
// Pastel cyclorama, a curved main conveyor, a light-arch barcode scanner, a tilt-tray sorter and
// three colour-coded lanes whose colour matches each bag tag.
import React, { useLayoutEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets";
import { FONT, fontReady } from "../../core/type/fonts";
import { SATISFYFORGE_PALETTE as P } from "../../kits/satisfyforge/lib/palette";
import { BELT_TOP, Conveyor, Decor, LANE, ScannerArch, Suitcase, SUITCASE, makeSignTexture, makeSlatTexture, makeSweep, makeTagTexture } from "./parts";

const V = (x: number, z: number) => new THREE.Vector3(x, 0, z);

const useFonts = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("ep050 canvas fonts"));
  useLayoutEffect(() => {
    fontReady().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const sway = Math.sin(t * 0.5) * 0.08;
    c.position.set(2.6 + sway, 6.2, 10.4);
    c.fov = 36;
    c.lookAt(-0.2 + sway * 0.3, 0.2, 0.55);
    c.updateProjectionMatrix();
  });
  return null;
};

type Bag = { color: string; to: string; lane: string; seed: number };
const BAGS_MAIN: (Bag & { u: number })[] = [
  { u: 0.2, color: P.sky, to: "KNO", lane: LANE.mint, seed: 3101 },
  { u: 0.4, color: P.peach, to: "DPS", lane: LANE.pink, seed: 3102 },
  { u: 0.6, color: P.lilac, to: "SUB", lane: LANE.butter, seed: 3103 },
  { u: 0.84, color: "#9FE3CF", to: "DPS", lane: LANE.pink, seed: 3104 },
];

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const sweep = useMemo(makeSweep, []);
  const slats = useMemo(makeSlatTexture, []);
  const main = useMemo(() => new THREE.CatmullRomCurve3([V(-3.4, -8.4), V(-3.0, -6.2), V(-1.4, -4.4), V(0, -2.6), V(0, -0.45)], false, "centripetal"), []);
  const lanes = useMemo(
    () => [
      { c: new THREE.CatmullRomCurve3([V(-1.05, 0.75), V(-1.15, 1.8), V(-1.7, 3.2), V(-2.2, 5.6)], false, "centripetal"), col: LANE.pink, code: "DPS" },
      { c: new THREE.CatmullRomCurve3([V(0, 0.75), V(0, 2.2), V(0.1, 4.0), V(0.3, 6.0)], false, "centripetal"), col: LANE.butter, code: "SUB" },
      { c: new THREE.CatmullRomCurve3([V(1.05, 0.75), V(1.15, 1.8), V(1.8, 3.1), V(2.4, 5.4)], false, "centripetal"), col: LANE.mint, code: "KNO" },
    ],
    [],
  );
  const tags = useMemo(() => {
    const m = new Map<number, THREE.Texture>();
    for (const b of BAGS_MAIN) m.set(b.seed, makeTagTexture("CGK", b.to, b.lane, b.seed));
    m.set(3201, makeTagTexture("CGK", "KNO", LANE.mint, 3201));
    m.set(3202, makeTagTexture("CGK", "DPS", LANE.pink, 3202));
    m.set(3203, makeTagTexture("CGK", "SUB", LANE.butter, 3203));
    m.set(3204, makeTagTexture("CGK", "KNO", LANE.mint, 3204));
    m.set(3205, makeTagTexture("CGK", "SUB", LANE.butter, 3205));
    m.set(3206, makeTagTexture("CGK", "KNO", LANE.mint, 3206));
    return m;
  }, []);
  const plaque = useMemo(() => makeSignTexture("AUDIRA · SCAN", "#FFFFFF", P.ink, 640, 150, 78), []);
  const signs = useMemo(() => lanes.map((l) => makeSignTexture(l.code, l.col, "#FFFFFF", 384, 192, 120)), [lanes]);

  const onCurve = (c: THREE.Curve<THREE.Vector3>, u: number) => {
    const p = c.getPointAt(u);
    const tg = c.getTangentAt(u);
    return { p, yaw: Math.atan2(tg.x, tg.z) };
  };
  const drift = (t * 0.06) % 1; // belts creep, everything stays equally spaced
  const archAt = onCurve(main, 0.6);
  const tilt = 0.32 + 0.02 * Math.sin(t * 2.0); // tray mid-tilt
  const slide = 0.1 + 0.02 * Math.sin(t * 2.0);

  return (
    <group>
      <mesh geometry={sweep} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <Decor t={t} />

      {/* main belt + bags spaced exactly */}
      <Conveyor curve={main} width={0.86} rail="#FFFFFF" slats={slats} t={t} />
      {BAGS_MAIN.map((b, i) => {
        const { p, yaw } = onCurve(main, Math.min(0.97, b.u + drift * 0.02));
        return <Suitcase key={i} color={b.color} tag={tags.get(b.seed)!} tagRot={0.18 - i * 0.09} position={[p.x, BELT_TOP, p.z]} yaw={yaw} />;
      })}
      <pointLight position={[archAt.p.x, 1.0, archAt.p.z]} color="#8FE9FF" intensity={2.2} distance={2.6} decay={2} />
      <ScannerArch position={archAt.p} yaw={archAt.yaw} plaque={plaque} t={t} width={0.86} />
      {/* scan line sweeping the bag inside the arch */}
      <mesh position={[archAt.p.x, BELT_TOP + SUITCASE.H + 0.012, archAt.p.z]} rotation={[0, archAt.yaw, 0]}>
        <boxGeometry args={[0.66, 0.006, 0.018]} />
        <meshBasicMaterial color="#C6F6FF" toneMapped={false} />
      </mesh>

      {/* sort deck */}
      <mesh position={[0, 0.36, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.16, 1.3]} />
        <meshPhysicalMaterial color={P.plinth} roughness={0.32} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, BELT_TOP - 0.001, 0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.1, 1.2]} />
        <meshStandardMaterial color="#EEE8F3" roughness={0.7} />
      </mesh>
      {/* lane code plates on the deck front */}
      {lanes.map((l, i) => (
        <group key={i} position={[(i - 1) * 1.05, BELT_TOP + 0.004, 0.6]}>
          {/* low raised code plate at the lane mouth: same colour as the tags bound for it */}
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.74, 0.04, 0.34]} />
            <meshPhysicalMaterial color={l.col} roughness={0.3} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.0405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 0.32]} />
            <meshStandardMaterial map={signs[i]} roughness={0.35} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.3 + i * 1.3, 0.15, 0.15]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.3, 16]} />
          <meshPhysicalMaterial color="#F3ECF6" roughness={0.4} />
        </mesh>
      ))}

      {/* tilt-tray sorter: each tray carries one bag and tilts it off into the lane its tag names */}
      {([[0.78, tilt, true]] as const).map(([x, a, full], k) => (
        <group key={k} position={[x, BELT_TOP + 0.08, 0.12]}>
          <mesh position={[0, -0.04, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.1, 20]} />
            <meshPhysicalMaterial color="#E8ECF2" metalness={0.85} roughness={0.2} />
          </mesh>
          <group rotation={[0, 0, -a]}>
            <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.0, 0.06, 0.82]} />
              <meshPhysicalMaterial color="#FFFFFF" roughness={0.25} clearcoat={1} />
            </mesh>
            {[-0.39, 0.39].map((z) => (
              <mesh key={z} position={[0, 0.075, z]} castShadow>
                <boxGeometry args={[1.0, 0.05, 0.04]} />
                <meshPhysicalMaterial color={full ? LANE.mint : "#D9CFE6"} roughness={0.25} clearcoat={1} />
              </mesh>
            ))}
            {full && <Suitcase color="#FFC9DA" tag={tags.get(3201)!} tagRot={-0.05} position={[0.08 + slide, 0.06, 0]} yaw={Math.PI / 2} />}
          </group>
        </group>
      ))}

      {/* lanes + sorted bags */}
      {lanes.map((l, i) => (
        <group key={i}>
          <Conveyor curve={l.c} width={0.78} rail={l.col} slats={slats} t={t} />
        </group>
      ))}
      {(
        [
          [0, 0.2, "#B9A6F5", 3202],
          [1, 0.17, "#9FD0FA", 3203],
          [2, 0.22, "#FFE08A", 3204],
          [1, 0.62, "#FFB3C9", 3205],
          [2, 0.72, "#B9A6F5", 3206],
        ] as const
      ).map(([li, u, col, seed], k) => {
        const { p, yaw } = onCurve(lanes[li].c, u + drift * 0.02);
        return <Suitcase key={k} color={col} tag={tags.get(seed)!} tagRot={0.1 - k * 0.1} position={[p.x, BELT_TOP, p.z]} yaw={yaw} />;
      })}
    </group>
  );
};

export const Ep050CoverCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const fontsOk = useFonts();
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: P.sweepWall }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.VSMShadowMap }} camera={{ position: [2, 6, 7], fov: 36, near: 0.05, far: 80 }}>
        <CameraRig t={t} />
        <hemisphereLight args={[P.sky2, P.ground, 0.6]} />
        <directionalLight
          position={[2.0, 8, 4.0]}
          intensity={1.6}
          color={P.key}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={8}
          shadow-camera-bottom={-10}
          shadow-camera-far={30}
          shadow-radius={14}
          shadow-blurSamples={16}
          shadow-bias={-0.0006}
        />
        <directionalLight position={[-4, 3, 5]} intensity={0.5} color="#FFE7F0" />
        {fontsOk && <Scene t={t} />}
        <Finish frame={frame} background={P.sweepWall} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.82} envIntensity={0.25} focus={11.2} aperture={0.0016} maxBlur={0.007} />
      </ThreeCanvas>
    </div>
  );
};

const CoverOverlay: React.FC = () => {
  const { height } = useVideoConfig();
  const s = height / 1920;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: `'${FONT}', sans-serif`, color: P.ink }}>
      <div style={{ position: "absolute", top: 196 * s, left: 64 * s, right: 64 * s, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ background: "rgba(255,255,255,0.85)", padding: `${9 * s}px ${18 * s}px`, borderRadius: 999, fontSize: 21 * s, letterSpacing: 4 * s, fontWeight: 600, color: P.hudAccent }}>● EP 050</div>
        <div style={{ background: "rgba(255,255,255,0.85)", border: `${2 * s}px solid ${P.hudAccent}`, padding: `${9 * s}px ${18 * s}px`, borderRadius: 999, fontWeight: 600, fontSize: 21 * s, letterSpacing: 2 * s }}>
          CGK → DPS ✓
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 400 * s,
          left: 56 * s,
          right: 56 * s,
          background: "rgba(255,255,255,0.88)",
          borderRadius: 40 * s,
          padding: `${34 * s}px ${40 * s}px ${30 * s}px`,
          boxShadow: `0 ${14 * s}px ${40 * s}px rgba(120,90,160,0.22)`,
        }}
      >
        <div style={{ fontSize: 100 * s, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3 * s }}>
          Kok Koper
          <br />
          Nggak{" "}
          <span style={{ background: `linear-gradient(transparent 62%, ${LANE.pink}88 62%)`, padding: `0 ${6 * s}px` }}>Tertukar?</span>
        </div>
        <div style={{ display: "flex", gap: 10 * s, marginTop: 22 * s, alignItems: "center" }}>
          {[LANE.pink, LANE.butter, LANE.mint].map((c, i) => (
            <div key={c} style={{ width: (i === 2 ? 64 : 22) * s, height: 12 * s, borderRadius: 6 * s, background: c }} />
          ))}
          <div style={{ marginLeft: 14 * s, fontSize: 22 * s, letterSpacing: 4 * s, fontWeight: 600, color: "rgba(75,63,92,0.6)" }}>AUDIRA EXPLAINED</div>
        </div>
      </div>
    </div>
  );
};

export const Cover: React.FC = () => (
  <div style={{ width: "100%", height: "100%", position: "relative" }}>
    <Ep050CoverCanvas />
    <CoverOverlay />
  </div>
);
