// EP04 cover (MARBLEMUSEUM): "Real Madrid Raja Eropa".
// A white-marble trophy gallery: 15 generic silver "big-ears" cups on marble plinths receding
// down a purple-carpeted aisle, each with a brass year plaque (years: research table, HIGH).
// The nearest cup (2024, gelar ke-15) is the hero. No crest: the club name is text on a banner.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { makeFloorTexture, makeGiltMaterial, makeMarbleMaterial, makeBeamTexture } from "../../kits/marblemuseum/lib/materials";
import { audiraPlaque, bannerTexture, heroPlaque, yearPlaque } from "./coverTextures.ts";

const { fontFamily: CINZEL } = loadCinzel("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500", "600"], subsets: ["latin"] });

const BG = "#0E0B12";
const PITCH = "#2BD46A";
const GOLD = "#E2C27A";

type V3 = [number, number, number];

// Years of the 15 titles (RESEARCH_REPORT table, HIGH). Hero = 2024.
const LEFT = [2022, 2017, 2014, 2000, 1966, 1959, 1957];
const RIGHT = [2018, 2016, 2002, 1998, 1960, 1958, 1956];
const ROW_X = 1.3;
const ROW_Z0 = -1.9;
const ROW_DZ = 1.75;
const rowZ = (k: number) => ROW_Z0 - k * ROW_DZ;

// ---------- camera ----------
const CAM_POS: V3 = [0, 1.78, 4.4];
const CAM_TARGET: V3 = [0, 1.42, -4];
const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...CAM_POS);
    camera.lookAt(...CAM_TARGET);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// ---------- big-ears cup (generic silhouette) ----------
const cupBody = () => {
  const pts: [number, number][] = [
    [0.0, 0.0],
    [0.17, 0.0],
    [0.17, 0.03],
    [0.13, 0.05],
    [0.12, 0.085],
    [0.085, 0.1],
    [0.05, 0.16],
    [0.042, 0.23],
    [0.07, 0.255],
    [0.042, 0.28],
    [0.05, 0.33],
    [0.1, 0.4],
    [0.16, 0.5],
    [0.195, 0.6],
    [0.205, 0.66],
    [0.215, 0.675],
    [0.2, 0.68],
    [0.185, 0.62],
    [0.15, 0.52],
    [0.0, 0.42],
  ];
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 72);
};

const earGeo = (side: 1 | -1) => {
  const p = (x: number, y: number) => new THREE.Vector3(x * side, y, 0);
  const curve = new THREE.CatmullRomCurve3(
    [p(0.19, 0.63), p(0.27, 0.71), p(0.37, 0.67), p(0.4, 0.53), p(0.34, 0.38), p(0.2, 0.3), p(0.06, 0.27)],
    false,
    "centripetal",
  );
  return new THREE.TubeGeometry(curve, 96, 0.022, 14, false);
};

export const Cup: React.FC<{ pos: V3; scale: number; rotY?: number; mat: THREE.Material; shadow?: boolean }> = ({ pos, scale, rotY = 0, mat, shadow }) => {
  const body = useMemo(cupBody, []);
  const earL = useMemo(() => earGeo(-1), []);
  const earR = useMemo(() => earGeo(1), []);
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <mesh geometry={body} material={mat} castShadow={shadow} receiveShadow />
      <mesh geometry={earL} material={mat} castShadow={shadow} />
      <mesh geometry={earR} material={mat} castShadow={shadow} />
    </group>
  );
};

// ---------- plinth with gilt band + brass plaque ----------
const Plinth: React.FC<{
  pos: V3;
  w: number;
  h: number;
  marble: THREE.Material;
  gilt: THREE.Material;
  plaque: THREE.Texture;
  plaqueSize: [number, number];
  shadow?: boolean;
}> = ({ pos, w, h, marble, gilt, plaque, plaqueSize, shadow }) => (
  <group position={pos}>
    <mesh material={marble} position={[0, 0.06, 0]} castShadow={shadow} receiveShadow>
      <RoundedBoxGeo args={[w * 1.18, 0.12, w * 1.18]} radius={0.03} />
    </mesh>
    <mesh material={marble} position={[0, h / 2, 0]} castShadow={shadow} receiveShadow>
      <RoundedBoxGeo args={[w, h - 0.1, w]} radius={0.03} />
    </mesh>
    <mesh material={gilt} position={[0, h - 0.07, 0]}>
      <RoundedBoxGeo args={[w * 1.04, 0.035, w * 1.04]} radius={0.012} />
    </mesh>
    <mesh material={marble} position={[0, h - 0.02, 0]} castShadow={shadow} receiveShadow>
      <RoundedBoxGeo args={[w * 1.12, 0.06, w * 1.12]} radius={0.025} />
    </mesh>
    {/* brass plaque on the front face */}
    <group position={[0, h * 0.8, w / 2 + 0.008]}>
      <mesh material={gilt}>
        <RoundedBoxGeo args={[plaqueSize[0] + 0.02, plaqueSize[1] + 0.02, 0.014]} radius={0.005} segments={2} />
      </mesh>
      <mesh position={[0, 0, 0.0085]}>
        <planeGeometry args={plaqueSize} />
        <meshStandardMaterial map={plaque} metalness={0.75} roughness={0.38} envMapIntensity={1.2} />
      </mesh>
    </group>
  </group>
);

// ---------- fluted pilaster column ----------
export const flutedShaft = (r: number, h: number) => {
  const geo = new THREE.CylinderGeometry(r * 0.92, r, h, 96, 1, true);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const k = 1 - 0.05 * Math.pow(Math.abs(Math.cos(Math.atan2(z, x) * 10)), 0.6);
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  return geo;
};
export const Column: React.FC<{ pos: V3; mat: THREE.Material; shaft: THREE.BufferGeometry; gilt: THREE.Material }> = ({ pos, mat, shaft, gilt }) => (
  <group position={pos}>
    <mesh material={mat} position={[0, 0.12, 0]} receiveShadow>
      <RoundedBoxGeo args={[0.7, 0.24, 0.7]} radius={0.03} />
    </mesh>
    <mesh geometry={shaft} material={mat} position={[0, 2.44, 0]} />
    <mesh material={gilt} position={[0, 4.6, 0]}>
      <cylinderGeometry args={[0.36, 0.26, 0.2, 40]} />
    </mesh>
    <mesh material={mat} position={[0, 4.78, 0]}>
      <RoundedBoxGeo args={[0.74, 0.16, 0.74]} radius={0.03} />
    </mesh>
  </group>
);

// ---------- downlight beam (additive, FX layer) ----------
export const Beam: React.FC<{ pos: V3; h: number; w: number; o: number; tex: THREE.Texture }> = ({ pos, h, w, o, tex }) => (
  <>
    {[0, Math.PI / 2].map((ry) => (
      <mesh key={ry} position={pos} rotation={[0, ry, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} color="#FFF1DA" transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    ))}
  </>
);

// ---------- downlight aimed at a point ----------
export const Downlight: React.FC<{ at: V3; intensity: number; angle?: number; shadow?: boolean; color?: string; from?: V3 }> = ({ at, intensity, angle = 0.28, shadow, color = "#FFF0DA", from }) => {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...at);
    o.updateMatrixWorld();
    return o;
  }, [at]);
  const p: V3 = from ?? [at[0] * 0.8, 4.3, at[2] + 0.9];
  return (
    <spotLight
      position={p}
      target={target}
      angle={angle}
      penumbra={0.8}
      intensity={intensity}
      decay={1.5}
      distance={9}
      color={color}
      castShadow={shadow}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0004}
      shadow-radius={5}
    />
  );
};

// ---------- scene ----------
const Scene: React.FC<{ f: number }> = ({ f }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog("#141019", 7, 22);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  const marble = useMemo(() => makeMarbleMaterial({ color: "#D9D2C5", scale: 2.2, strength: 0.8, roughness: 0.34 }), []);
  useLayoutEffect(() => {
    marble.clearcoat = 0.1;
  }, [marble]);
  const wallMarble = useMemo(() => makeMarbleMaterial({ color: "#CFC7B9", scale: 0.6, strength: 0.45, roughness: 0.55 }), []);
  const colMat = useMemo(() => makeMarbleMaterial({ color: "#E0D9CC", scale: 0.8, strength: 0.4, roughness: 0.42 }), []);
  const gilt = useMemo(() => makeGiltMaterial(), []);
  const silver = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#E4E8ED",
        metalness: 0.86,
        roughness: 0.17,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        envMapIntensity: 4.2,
      }),
    [],
  );
  const shaft = useMemo(() => flutedShaft(0.24, 4.4), []);
  const floorTex = useMemo(() => {
    const t = makeFloorTexture();
    t.repeat.set(2.4, 7);
    return t;
  }, []);
  const beamTex = useMemo(() => makeBeamTexture(), []);
  const carpetGrain = useSurfaceGrain(404, 0.3, 10);
  const wallGrain = useSurfaceGrain(59, 0.25, 6);

  const heroH = 1.0;
  const heroCupY = heroH + 0.0;
  const heroScale = 1.45;

  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.05} color="#F1E6D6" />
      <hemisphereLight args={["#F3E9DC", "#1A1022", 0.14]} />

      {/* hero light: key from upper right, rim from behind-left */}
      <Downlight at={[0, heroCupY + 0.45, 0]} from={[1.3, 4.6, 2.2]} intensity={34} angle={0.3} shadow />
      <directionalLight position={[-2.5, 3.5, -3]} intensity={0.9} color="#FFD9A8" />
      <pointLight position={[-1.4, 1.8, 1.6]} intensity={1.6} distance={5} decay={2} color="#CDB8FF" />
      <pointLight position={[0.6, 1.9, 2.6]} intensity={2.2} distance={4} decay={2} color="#FFF6EA" />

      {/* row downlights */}
      {LEFT.map((_, k) => (
        <Downlight key={`l${k}`} at={[-ROW_X, 1.25, rowZ(k)]} intensity={11 - k * 0.4} />
      ))}
      {RIGHT.map((_, k) => (
        <Downlight key={`r${k}`} at={[ROW_X, 1.25, rowZ(k)]} intensity={11 - k * 0.4} />
      ))}
      {/* banner light */}
      <Downlight at={[0, 3.05, -14.2]} from={[0, 4.8, -11]} intensity={30} angle={0.42} color="#FFE6C0" />

      {/* polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]} receiveShadow>
        <planeGeometry args={[6, 24]} />
        <meshStandardMaterial map={floorTex} roughness={0.2} metalness={0.05} envMapIntensity={0.22} />
      </mesh>
      {/* purple carpet runner down the aisle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -7]} receiveShadow>
        <planeGeometry args={[1.05, 22]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#3C1F62" roughnessMap={carpetGrain} envMapIntensity={0.15} />
      </mesh>
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, -7]}>
          <planeGeometry args={[0.06, 22]} />
          <meshStandardMaterial color="#C99A3E" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}

      {/* side walls + back wall in pale marble with gilt rail */}
      {[
        { p: [-3.0, 2.6, -6] as V3, r: Math.PI / 2, w: 24 },
        { p: [3.0, 2.6, -6] as V3, r: -Math.PI / 2, w: 24 },
        { p: [0, 2.6, -15] as V3, r: 0, w: 6 },
      ].map((wl, i) => (
        <group key={i} position={wl.p} rotation={[0, wl.r, 0]}>
          <mesh material={wallMarble} receiveShadow>
            <planeGeometry args={[wl.w, 5.2]} />
          </mesh>
          <mesh position={[0, -2.15, 0.03]}>
            <RoundedBoxGeo args={[wl.w, 0.9, 0.06]} radius={0.02} />
            <meshPhysicalMaterial {...POLISH.stone} color="#2B2230" bumpMap={wallGrain} bumpScale={0.2} />
          </mesh>
          <mesh material={gilt} position={[0, -1.68, 0.07]}>
            <RoundedBoxGeo args={[wl.w, 0.05, 0.08]} radius={0.02} />
          </mesh>
          <mesh material={gilt} position={[0, 2.45, 0.07]}>
            <RoundedBoxGeo args={[wl.w, 0.1, 0.12]} radius={0.03} />
          </mesh>
        </group>
      ))}
      {/* dark coffered ceiling */}
      <mesh position={[0, 5.2, -6]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 24]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#1E1820" side={THREE.DoubleSide} />
      </mesh>

      {/* pilasters between plinths */}
      {Array.from({ length: 8 }, (_, k) => {
        const z = ROW_Z0 + ROW_DZ / 2 - k * ROW_DZ;
        return (
          <React.Fragment key={k}>
            <Column pos={[-2.7, 0, z]} mat={colMat} shaft={shaft} gilt={gilt} />
            <Column pos={[2.7, 0, z]} mat={colMat} shaft={shaft} gilt={gilt} />
          </React.Fragment>
        );
      })}

      {/* back wall: purple velvet banner with gilt frame */}
      <group position={[0, 3.05, -14.9]}>
        <mesh>
          <planeGeometry args={[1.7, 2.83]} />
          <meshPhysicalMaterial {...POLISH.fabric} map={bannerTexture()} color="#FFFFFF" />
        </mesh>
        {[
          [0, 1.48, 1.94, 0.12],
          [0, -1.48, 1.94, 0.12],
          [-0.91, 0, 0.12, 3.08],
          [0.91, 0, 0.12, 3.08],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} material={gilt} position={[x, y, 0.05]}>
            <RoundedBoxGeo args={[w, h, 0.1]} radius={0.03} />
          </mesh>
        ))}
      </group>

      {/* the 14 earlier titles */}
      {LEFT.map((y, k) => (
        <React.Fragment key={`L${y}`}>
          <Plinth pos={[-ROW_X, 0, rowZ(k)]} w={0.5} h={1.0} marble={marble} gilt={gilt} plaque={yearPlaque(y)} plaqueSize={[0.3, 0.1125]} />
          <Cup pos={[-ROW_X, 1.0, rowZ(k)]} scale={1.0} rotY={0.25} mat={silver} />
        </React.Fragment>
      ))}
      {RIGHT.map((y, k) => (
        <React.Fragment key={`R${y}`}>
          <Plinth pos={[ROW_X, 0, rowZ(k)]} w={0.5} h={1.0} marble={marble} gilt={gilt} plaque={yearPlaque(y)} plaqueSize={[0.3, 0.1125]} />
          <Cup pos={[ROW_X, 1.0, rowZ(k)]} scale={1.0} rotY={-0.25} mat={silver} />
        </React.Fragment>
      ))}

      {/* hero: title 15, 2024 */}
      <Plinth pos={[0, 0, 0]} w={0.78} h={heroH} marble={marble} gilt={gilt} plaque={heroPlaque()} plaqueSize={[0.6, 0.27]} shadow />
      <Cup pos={[0, heroCupY, 0]} scale={heroScale} rotY={0.12} mat={silver} shadow />
      {/* AUDIRA collection plaque on the hero plinth foot */}
      <mesh position={[0, 0.07, 0.465]}>
        <planeGeometry args={[0.42, 0.0875]} />
        <meshStandardMaterial map={audiraPlaque()} metalness={0.75} roughness={0.4} />
      </mesh>
      <GroundShadow scale={2.4} opacity={0.65} blur={2.2} far={1.2} />

      {/* soft downlight beams */}
      <Beam pos={[0.35, 2.9, 0.5]} h={4.2} w={1.4} o={0.05} tex={beamTex} />
      <Beam pos={[0, 3.6, -13.5]} h={3.6} w={1.6} o={0.04} tex={beamTex} />

      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.82} envIntensity={0.35} hdri="studio" ao />
    </>
  );
};

// ---------- HTML overlay ----------
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(14,11,18,0.9) 0%, rgba(14,11,18,0.72) 22%, rgba(14,11,18,0.0) 36%, rgba(14,11,18,0) 80%, rgba(14,11,18,0.5) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 32, letterSpacing: 7, color: PITCH }}>
      SEJARAH SEPAK BOLA #04
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: CINZEL, fontWeight: 900, lineHeight: 1.0, textShadow: "0 6px 26px rgba(0,0,0,0.7)" }}>
      <div style={{ fontSize: 150, color: GOLD, letterSpacing: -2 }}>15 KALI</div>
      <div style={{ fontSize: 90, color: "#F6F2EA", marginTop: 4, letterSpacing: 1 }}>RAJA EROPA</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: OSWALD, fontWeight: 500, fontSize: 28, letterSpacing: 4, color: "#F6F2EA", background: "rgba(74,38,117,0.85)", border: `2px solid ${GOLD}`, padding: "6px 22px" }}>
        18 FINAL · 15 GELAR · 1956–2024
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 40, near: 0.05, far: 60 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
