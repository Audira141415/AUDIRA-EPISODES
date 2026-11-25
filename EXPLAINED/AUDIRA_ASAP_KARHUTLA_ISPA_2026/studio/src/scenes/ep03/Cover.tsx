// EP03 cover (VISUALINVESTIGATION): forensic desk that takes apart a viral number.
// Map of Tanah Papua with Papua Tengah hatched, "463.219 BERPOTENSI" stamp, red note
// "BUKAN KASUS TERKONFIRMASI", CELIOS report dossier, formula card, red string between pins.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import {
  deskTexture,
  formulaTexture,
  mapTexture,
  mapUV,
  noteTexture,
  reportTexture,
  stampTexture,
  tentTexture,
  smokeTexture,
  MAP_W,
  MAP_H,
} from "./coverTextures.ts";

const BG = "#0B0C0E";
const RED = "#D8311C";

type V3 = [number, number, number];

// ---------- camera ----------
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    camera.position.set(0.2 - t * 0.02, 11.0 - t * 0.04, 4.6);
    camera.lookAt(0.02, 0, 0.55);
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- paper sheet: thin rounded slab + printed face ----------
const Sheet: React.FC<{
  size: [number, number];
  pos: V3;
  rotY?: number;
  tex: THREE.Texture;
  thick?: number;
  edge?: string;
}> = ({ size, pos, rotY = 0, tex, thick = 0.012, edge = "#E4DDCB" }) => {
  const grain = useSurfaceGrain(19, 0.18, 4);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow position={[0, thick / 2, 0]}>
        <RoundedBoxGeo args={[size[0], thick, size[1]]} radius={thick * 0.45} segments={2} />
        <meshPhysicalMaterial {...POLISH.paper} color={edge} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, thick + 0.0015, 0]}>
        <planeGeometry args={size} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} />
      </mesh>
    </group>
  );
};

// ---------- push pin ----------
const Pin: React.FC<{ pos: V3; color?: string }> = ({ pos, color = RED }) => (
  <group position={pos}>
    <mesh castShadow position={[0, 0.07, 0]}>
      <sphereGeometry args={[0.055, 24, 16]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} clearcoat={0.9} roughness={0.25} />
    </mesh>
    <mesh castShadow position={[0, 0.025, 0]}>
      <cylinderGeometry args={[0.03, 0.04, 0.04, 20]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.005, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.03, 8]} />
      <meshStandardMaterial color="#C8CCD2" metalness={1} roughness={0.25} />
    </mesh>
  </group>
);

// ---------- red string between pins ----------
const Thread: React.FC<{ a: V3; b: V3; sag?: number }> = ({ a, b, sag = 0.02 }) => {
  const geo = useMemo(() => {
    const pa = new THREE.Vector3(a[0], a[1] + 0.06, a[2]);
    const pb = new THREE.Vector3(b[0], b[1] + 0.06, b[2]);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const p = pa.clone().lerp(pb, t);
      p.y -= Math.sin(t * Math.PI) * sag;
      pts.push(p);
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.008, 8, false);
  }, [a, b, sag]);
  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial {...POLISH.fabric} color="#C21A10" />
    </mesh>
  );
};

// ---------- desk ----------
const Desk: React.FC = () => {
  const tex = useMemo(() => {
    const t = deskTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.4, 1.4);
    t.needsUpdate = true;
    return t;
  }, []);
  const grain = useSurfaceGrain(3, 0.3, 6);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.6]}>
      <planeGeometry args={[12, 14]} />
      <meshPhysicalMaterial map={tex} roughness={0.62} roughnessMap={grain} clearcoat={0.25} clearcoatRoughness={0.5} />
    </mesh>
  );
};

// ---------- evidence tent ----------
const Tent: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => {
  const tex = tentTexture();
  const w = 0.64, h = 0.28, tilt = 0.5;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {[1, -1].map((s) => (
        <group key={s} rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
          <mesh castShadow receiveShadow position={[0, (h / 2) * Math.cos(tilt), (h / 2) * Math.sin(tilt)]} rotation={[-tilt, 0, 0]}>
            <RoundedBoxGeo args={[w, h, 0.008]} radius={0.003} segments={2} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#F2C230" />
          </mesh>
          {s === 1 && (
            // printed face only on the side facing the camera; the back face stays blank yellow
            <mesh position={[0, (h / 2) * Math.cos(tilt) + 0.004 * Math.sin(tilt), (h / 2) * Math.sin(tilt) + 0.0045]} rotation={[-tilt, 0, 0]}>
              <planeGeometry args={[w * 0.98, h * 0.96]} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} map={tex} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// ---------- magnifier (foreground) ----------
const Magnifier: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh castShadow position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.44, 0.03, 20, 72]} />
      <meshStandardMaterial color="#B9BEC6" metalness={1} roughness={0.18} />
    </mesh>
    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.43, 64]} />
      <meshPhysicalMaterial color="#DDE8F0" roughness={0.02} metalness={0} transparent opacity={0.08} clearcoat={1} depthWrite={false} />
    </mesh>
    <mesh castShadow position={[0.78, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.065, 0.62, 24]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2A1A12" roughness={0.35} />
    </mesh>
  </group>
);

// ---------- smoke haze in the lamp beam ----------
// Horizontal sprites (camera looks almost straight down). Higher layers sit closer to the
// camera and are fainter, so the haze fades with depth instead of veiling the evidence.
const PUFFS: { p: V3; s: number; o: number; seed: number; rot: number; v: number }[] = [
  { p: [-1.5, 0.45, -0.9], s: 2.6, o: 0.5, seed: 3, rot: 0.3, v: 1.0 },
  { p: [-0.6, 0.6, -0.35], s: 2.2, o: 0.4, seed: 9, rot: 1.2, v: 0.8 },
  { p: [0.6, 0.5, -0.75], s: 2.4, o: 0.36, seed: 14, rot: 2.1, v: 1.2 },
  { p: [-1.2, 0.85, 0.6], s: 2.0, o: 0.3, seed: 21, rot: 0.8, v: 0.9 },
  { p: [0.9, 0.7, 0.6], s: 2.2, o: 0.3, seed: 27, rot: 2.6, v: 1.1 },
  { p: [-0.2, 1.2, 0.05], s: 3.0, o: 0.18, seed: 33, rot: 1.7, v: 0.7 },
  { p: [1.0, 1.4, -1.3], s: 2.6, o: 0.16, seed: 41, rot: 0.5, v: 1.0 },
];
const Haze: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  return (
    <>
      {PUFFS.map((q, i) => (
        <mesh
          key={i}
          position={[q.p[0] + t * 0.05 * q.v, q.p[1], q.p[2] - t * 0.02 * q.v]}
          rotation={[-Math.PI / 2, 0, q.rot + t * 0.04 * (i % 2 ? 1 : -1)]}
          onUpdate={(m) => m.layers.set(FX_LAYER)}
        >
          <planeGeometry args={[q.s * 1.4, q.s]} />
          <meshBasicMaterial map={smokeTexture(q.seed)} color="#E8DCC6" transparent opacity={Math.min(0.75, q.o * 1.6)} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

// ---------- scene ----------
const MAP_SIZE: [number, number] = [2.96, (2.96 * MAP_H) / MAP_W];
const MAP_POS: V3 = [0.02, 0, 0.2];
const MAP_ROT = -0.03;

/** World point on the (flat) map sheet for a lon/lat. */
const onMap = (lon: number, lat: number, y = 0.02): V3 => {
  const [u, v] = mapUV(lon, lat);
  const lx = (u - 0.5) * MAP_SIZE[0];
  const lz = (v - 0.5) * MAP_SIZE[1];
  const c = Math.cos(MAP_ROT), s = Math.sin(MAP_ROT);
  return [MAP_POS[0] + lx * c + lz * s, y, MAP_POS[2] - lx * s + lz * c];
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const stamp = stampTexture();
  const stampPos = onMap(133.3, -6.45, 0.0175);
  const notePos = onMap(132.35, -1.55, 0.016);
  const tengahPin = onMap(135.0, -4.3, 0.016);
  const notePin: V3 = [notePos[0] + 0.4, 0.03, notePos[2] - 0.2];
  const reportPin: V3 = [-0.4, 0.035, 1.66];
  const formulaPin: V3 = [1.42, 0.04, 1.5];
  const magPos = onMap(136.55, -3.55);
  const stampPin: V3 = [stampPos[0] + 0.58, 0.03, stampPos[2] - 0.05];
  return (
    <>
      <CameraRig f={f} />
      <ambientLight intensity={0.22} color="#FFF4E0" />
      <hemisphereLight args={["#FFE9C8", "#120C08", 0.35]} />
      <spotLight
        position={[-3.2, 6.5, -1.2]}
        intensity={140}
        angle={0.62}
        penumbra={0.75}
        decay={2}
        color="#FFE2B0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[3.5, 4, -3]} intensity={0.45} color="#9FC2E8" />

      <Desk />
      {/* Map sheet (midground hero) */}
      <Sheet size={MAP_SIZE} pos={MAP_POS} rotY={MAP_ROT} tex={mapTexture()} />
      {/* Stamp on the map */}
      <mesh position={stampPos} rotation={[-Math.PI / 2, 0, 0.07 - MAP_ROT]}>
        <planeGeometry args={[1.3, 0.615]} />
        <meshStandardMaterial map={stamp} transparent depthWrite={false} roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {/* Red note */}
      <Sheet size={[0.92, 0.57]} pos={[notePos[0], 0.014, notePos[2]]} rotY={0.07} tex={noteTexture()} thick={0.006} edge="#EADFAE" />
      {/* Dossier: open manila folder + CELIOS report page */}
      <group position={[-0.95, 0, 2.15]} rotation={[0, -0.2, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.008, 0]}>
          <RoundedBoxGeo args={[1.62, 0.014, 2.0]} radius={0.006} segments={2} />
          <meshPhysicalMaterial {...POLISH.paper} color="#B8925A" />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.5, 0.008, -1.06]}>
          <RoundedBoxGeo args={[0.5, 0.014, 0.16]} radius={0.006} segments={2} />
          <meshPhysicalMaterial {...POLISH.paper} color="#B8925A" />
        </mesh>
      </group>
      <Sheet size={[1.3, 1.65]} pos={[-0.88, 0.016, 2.1]} rotY={-0.12} tex={reportTexture()} />
      {/* Formula card */}
      <Sheet size={[1.42, 0.83]} pos={[0.88, 0.022, 1.78]} rotY={0.09} tex={formulaTexture()} thick={0.01} edge="#EEEADF" />
      {/* Pins + string */}
      <Pin pos={reportPin} />
      <Pin pos={formulaPin} />
      <Pin pos={stampPin} />
      <Pin pos={notePin} />
      <Pin pos={tengahPin} color="#1D1D1B" />
      <Thread a={reportPin} b={formulaPin} />
      <Thread a={formulaPin} b={stampPin} />
      <Thread a={stampPin} b={tengahPin} />
      <Thread a={notePin} b={stampPin} />
      {/* AUDIRA evidence tent */}
      <Tent pos={[-1.32, 0.025, 0.12]} rotY={0.22} />
      {/* Foreground magnifier */}
      {/* Magnifier held over Papua Tengah, handle out to the bay */}
      <Magnifier pos={[magPos[0], 0.32, magPos[2]]} rotY={0.62} />
      {/* Thin smoke haze drifting through the lamp beam */}
      <Haze f={f} />
      <Finish
        frame={Math.round(f)}
        background={BG}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        exposure={1}
        envIntensity={0.55}
        ao
      />
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
          "linear-gradient(180deg, rgba(11,12,14,0.92) 0%, rgba(11,12,14,0.78) 24%, rgba(11,12,14,0.0) 38%, rgba(11,12,14,0) 76%, rgba(11,12,14,0.55) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 196, fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 30, letterSpacing: 5, color: "#FF5A3C" }}>
      ● AUDIRA · ASAP &amp; ISPA
    </div>
    <div
      style={{
        position: "absolute",
        left: 66,
        top: 262,
        fontFamily: "'Arial Black', 'Segoe UI', Arial, sans-serif",
        fontWeight: 900,
        color: "#F4F1EA",
        lineHeight: 0.98,
        textShadow: "0 6px 24px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontSize: 150, letterSpacing: -3 }}>3,58 JUTA</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 10 }}>
        <span style={{ fontSize: 84, background: "#D8311C", padding: "0 18px 4px", letterSpacing: -1 }}>BERPOTENSI</span>
        <span style={{ fontSize: 84, letterSpacing: -1 }}>ISPA?</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Ep03Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.2, 11, 4.6], fov: 30, near: 0.1, far: 60 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
