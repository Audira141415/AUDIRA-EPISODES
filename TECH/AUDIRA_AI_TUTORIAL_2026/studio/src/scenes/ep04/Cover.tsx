// EP04 cover — "ASLI ATAU AI?" in VISUALINVESTIGATION: a dark forensic desk with two prints that
// look identical (evidence A and B). A magnifier over B reveals a faint glowing lattice that is
// only visible inside the lens: the invisible watermark idea, without claiming any tool catches
// every AI image.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { VISUALINVESTIGATION_PALETTE as P } from "../../kits/visualinvestigation/lib/palette.ts";
import { cardTexture, landscapeTexture, lensTexture, scaleTexture, stampTexture, tentTexture } from "./textures.ts";

const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const plex = loadPlex("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

const BG = "#0B0C0E";

const Print: React.FC<{ map: THREE.Texture; position: [number, number, number]; rot: number }> = ({ map, position, rot }) => (
  <group position={position} rotation={[0, rot, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.006, 0]}>
      <RoundedBoxGeo args={[1.36, 0.012, 1.02]} radius={0.005} />
      <meshPhysicalMaterial {...POLISH.paper} color={P.archivalPaper} />
    </mesh>
    <mesh position={[0, 0.0125, -0.02]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1.24, 0.893]} />
      <meshPhysicalMaterial map={map} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.25} />
    </mesh>
  </group>
);

const Tent: React.FC<{ map: THREE.Texture; position: [number, number, number]; rot: number }> = ({ map, position, rot }) => {
  const lean = 0.42;
  const h = 0.24;
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <group position={[0, h * Math.cos(lean), 0]}>
        {[1, -1].map((s) => (
          <group key={s} rotation={[s * lean, 0, 0]}>
            <mesh castShadow receiveShadow position={[0, -h / 2, 0]}>
              <RoundedBoxGeo args={[0.3, h, 0.006]} radius={0.002} />
              <meshPhysicalMaterial {...POLISH.paper} color="#F2B33D" />
            </mesh>
            {s === -1 && (
              <mesh position={[0, -h / 2, 0.0035]}>
                <planeGeometry args={[0.3, h]} />
                <meshStandardMaterial map={map} roughness={0.8} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

const Pin: React.FC<{ p: [number, number, number] }> = ({ p }) => (
  <group position={p}>
    <mesh castShadow position={[0, 0.045, 0]}>
      <sphereGeometry args={[0.034, 24, 16]} />
      <meshPhysicalMaterial {...POLISH.brickABS} color="#D7261C" />
    </mesh>
    <mesh position={[0, 0.015, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
      <meshStandardMaterial color="#c9ccd2" metalness={1} roughness={0.25} />
    </mesh>
  </group>
);

const Thread: React.FC<{ pts: [number, number, number][] }> = ({ pts }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.2);
    return new THREE.TubeGeometry(curve, 120, 0.0065, 8, false);
  }, [pts]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#E0301E" roughness={0.6} emissive="#5a0a04" emissiveIntensity={0.4} />
    </mesh>
  );
};

const Magnifier: React.FC<{ lens: THREE.Texture; f: number }> = ({ lens, f }) => {
  const R = 0.44;
  const pulse = 1 + Math.sin(f / 22) * 0.04;
  return (
    <group position={[0.36, 0.5, 0.42]} rotation={[0.16, 0, -0.06]}>
      {/* lens view (sits flat, faces the camera from above) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R, 96]} />
        <meshBasicMaterial map={lens} toneMapped={false} color={new THREE.Color(pulse, pulse, pulse)} />
      </mesh>
      {/* black lacquer rim with chrome bezel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[R + 0.025, 0.04, 24, 128]} />
        <meshPhysicalMaterial color="#121315" roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <torusGeometry args={[R - 0.004, 0.012, 16, 128]} />
        <meshStandardMaterial color="#d9dce2" metalness={1} roughness={0.15} />
      </mesh>
      {/* handle: brass ferrule then dark wood grip, toward bottom-right */}
      <group rotation={[0, -0.72, 0]}>
        <mesh position={[R + 0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.16, 32]} />
          <meshStandardMaterial color="#b8893f" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[R + 0.56, -0.02, 0]} rotation={[0, 0, Math.PI / 2 + 0.05]} castShadow>
          <cylinderGeometry args={[0.058, 0.05, 0.74, 32]} />
          <meshPhysicalMaterial color="#2a1a12" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} />
        </mesh>
      </group>
      <pointLight position={[0, -0.2, 0]} color="#6effd6" intensity={0.5} distance={1.4} decay={2} />
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = useMemo(
    () => ({
      photo: landscapeTexture(),
      lens: lensTexture(600, 380, 1.9),
      tentA: tentTexture("A"),
      tentB: tentTexture("B"),
      card: cardTexture(),
      stamp: stampTexture(),
      scale: scaleTexture(),
    }),
    [],
  );
  const pA: [number, number, number] = [-0.4, 0, -0.62];
  const pB: [number, number, number] = [0.38, 0, 0.5];
  return (
    <>
      <ambientLight intensity={0.16} color="#b9c6d8" />
      <spotLight
        position={[-1.7, 5.6, -0.6]}
        angle={0.62}
        penumbra={0.85}
        intensity={62}
        decay={2}
        color="#FFE8C4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        target-position={[0.1, 0, 0.3]}
      />
      <directionalLight position={[3.5, 2.2, -3]} intensity={0.45} color="#86b4ff" />

      {/* desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshPhysicalMaterial color="#0c0d0f" roughness={0.88} />
      </mesh>
      {/* case folder under the prints */}
      <mesh position={[-0.05, 0.003, -0.05]} rotation={[0, 0.06, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[2.5, 0.006, 2.7]} radius={0.003} />
        <meshPhysicalMaterial {...POLISH.paper} color="#3a3127" />
      </mesh>

      <Print map={t.photo} position={[pA[0], 0.006, pA[2]]} rot={0.09} />
      <Print map={t.photo} position={[pB[0], 0.006, pB[2]]} rot={-0.07} />

      {/* DIPERIKSA stamp on print A */}
      <mesh position={[-0.08, 0.0215, -0.3]} rotation={[-Math.PI / 2, 0, 0.22]}>
        <planeGeometry args={[0.66, 0.227]} />
        <meshStandardMaterial map={t.stamp} transparent roughness={0.7} depthWrite={false} />
      </mesh>

      <Tent map={t.tentA} position={[0.62, 0.006, -1.02]} rot={-0.25} />
      <Tent map={t.tentB} position={[-0.8, 0.006, 0.26]} rot={0.18} />

      {/* AUDIRA evidence card */}
      <group position={[-0.6, 0.012, 0.86]} rotation={[0, 0.16, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[0.8, 0.008, 0.507]} radius={0.003} />
          <meshPhysicalMaterial {...POLISH.paper} color={P.archivalPaper} />
        </mesh>
        <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.507]} />
          <meshStandardMaterial map={t.card} roughness={0.9} />
        </mesh>
      </group>

      {/* forensic scale under print B */}
      <mesh position={[0.46, 0.012, 1.06]} rotation={[-Math.PI / 2, 0, 0.05]} receiveShadow>
        <planeGeometry args={[1.05, 0.13]} />
        <meshStandardMaterial map={t.scale} roughness={0.85} />
      </mesh>

      {/* red thread between the evidence */}
      <Pin p={[0.14, 0.02, -1.0]} />
      <Pin p={[-0.53, 0.02, 0.62]} />
      <Pin p={[0.9, 0.02, 0.12]} />
      <Thread pts={[[0.14, 0.06, -1.0], [0.62, 0.05, -0.5], [0.9, 0.06, 0.12]]} />
      <Thread pts={[[0.14, 0.06, -1.0], [-0.3, 0.05, 0.05], [-0.53, 0.06, 0.62]]} />

      {/* pencil */}
      <group position={[-1.22, 0.025, -0.2]} rotation={[0, 1.45, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.8, 6]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2d2f33" />
        </mesh>
        <mesh position={[0.44, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.022, 0.08, 6]} />
          <meshStandardMaterial color="#d8b98a" roughness={0.8} />
        </mesh>
      </group>

      <Magnifier lens={t.lens} f={f} />
    </>
  );
};

export const Ep04Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP04 fonts"));
  useEffect(() => {
    Promise.all([anton.waitUntilDone(), plex.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ position: [0.05, 8.8, 3.0], fov: 30, near: 0.1, far: 60 }}
          onCreated={({ camera }) => camera.lookAt(0, 0, -0.62)}
        >
          <Scene f={f} />
          <Finish frame={frame} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} />
        </ThreeCanvas>
      )}
      {/* legibility gradient behind the headline */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,12,14,0.92) 0%, rgba(11,12,14,0.72) 30%, rgba(11,12,14,0) 44%)" }} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 262 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'IBM Plex Mono'", fontWeight: 600, fontSize: 32, letterSpacing: 7, color: "#FFBE55" }}>
          <span style={{ width: 18, height: 18, background: P.evidenceRed, display: "inline-block" }} />
          AUDIRA AI TUTORIAL
        </div>
        <div style={{ fontFamily: "'Anton'", fontSize: 200, lineHeight: 0.96, color: "#F3EFE6", marginTop: 18, letterSpacing: 1 }}>
          ASLI ATAU
          <br />
          <span style={{ color: P.evidenceRed }}>AI?</span>
        </div>
        <div style={{ marginTop: 22, display: "flex", gap: 12, fontFamily: "'IBM Plex Mono'", fontWeight: 500, fontSize: 24, letterSpacing: 2, color: "#C9CED6" }}>
          <span style={{ border: "1px solid #FFBE55", padding: "6px 12px" }}>SYNTHID</span>
          <span style={{ border: "1px solid #FFBE55", padding: "6px 12px" }}>CONTENT CREDENTIALS</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
