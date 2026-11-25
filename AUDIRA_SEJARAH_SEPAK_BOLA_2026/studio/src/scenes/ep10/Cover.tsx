// EP10 cover (CHAINREACTION): "Jerman 7–1 Brasil", semifinal Piala Dunia 2014.
// A maker's chain-reaction contraption on a pitch-green felt tabletop: seven white/black
// "Germany" dominoes, each painted with a goal minute (11' 23' 24' 26' 29' 69' 79', research
// table, HIGH), topple in sequence toward a canary-yellow BRASIL block. The wave front (79') is
// mid-fall; the earlier ones lean on each other at physically solved angles. A football launches
// off the last plywood ramp with the kit's orange route trail. One small yellow 90' domino
// (Oscar's consolation goal) stands apart. A scoreboard prop reads JERMAN 7 / BRASIL 1.
// No crests, no real faces, no logos. AUDIRA appears small on the scoreboard panel.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { pegboard, woodGrain } from "../../kits/chainreaction/lib/materials";
import { CHAINREACTION_PALETTE as KP } from "../../kits/chainreaction/lib/palette";
import { brazilBlockFace, brazilDomino, cornerFlag, dominoFace, minutePennant, pitchFelt, scoreboardFace } from "./coverTextures.ts";

export const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500", "600"], subsets: ["latin"] });

export const BG = KP.bg;
export const PITCH = "#2BD46A";
export const YELLOW = "#F7D21C";

type V3 = [number, number, number];

// ---------- chain layout (all along one line on the table) ----------
export const A: [number, number] = [-0.95, 1.15]; // first pivot (x, z)
export const DIR = (() => {
  const v = [0.42, -1];
  const l = Math.hypot(v[0], v[1]);
  return [v[0] / l, v[1] / l] as [number, number];
})();
export const SIDE: [number, number] = [-DIR[1], DIR[0]]; // right of travel, seen from the camera
export const HEADING = Math.atan2(-DIR[1], DIR[0]); // rotation.y that maps local +x onto DIR
export const at = (s: number, lat = 0, y = 0): V3 => [A[0] + DIR[0] * s + SIDE[0] * lat, y, A[1] + DIR[1] * s + SIDE[1] * lat];

export const H = 0.55; // domino height
export const T = 0.1; // thickness (along travel)
export const W = 0.36; // width (chunky toy dominoes so the minutes read)
export const D = 0.3; // pivot spacing
export const MINUTES = [11, 23, 24, 26, 29, 69, 79];
export const FRONT_TILT = 0.24; // rad: 79' is mid-fall, not yet touching anything

/**
 * Lean angles of a resting domino wave: each domino pivots on its front-bottom edge and its
 * top-front edge rests on the back face of the next one. Solved back-to-front by bisection.
 */
function leanAngles(): number[] {
  const n = MINUTES.length;
  const th = new Array(n).fill(0);
  th[n - 1] = FRONT_TILT;
  for (let i = n - 2; i >= 0; i--) {
    const s = i * D, s2 = (i + 1) * D, t2 = th[i + 1];
    const bx = s2 - T * Math.cos(t2), by = T * Math.sin(t2);
    const nx = -Math.cos(t2), ny = Math.sin(t2);
    const dist = (t: number) => (s + H * Math.sin(t) - bx) * nx + (H * Math.cos(t) - by) * ny;
    let lo = 0, hi = 1.45;
    if (dist(hi) > 0) {
      th[i] = hi;
      continue;
    }
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (dist(mid) > 0) lo = mid;
      else hi = mid;
    }
    th[i] = lo;
  }
  return th;
}

export const S_LAST = (MINUTES.length - 1) * D;
export const RAMP_S0 = S_LAST + 0.2;
export const RAMP_LEN = 0.4;
export const RAMP_RISE = 0.15;
export const RAMP_LIP_S = RAMP_S0 + RAMP_LEN * Math.cos(Math.atan2(RAMP_RISE, RAMP_LEN));
export const BALL_R = 0.125;
export const BALL_S = RAMP_LIP_S + 0.14;
export const BALL_Y = 0.42;
export const BLOCK_S = RAMP_LIP_S + 0.8;
export const BOARD_S = BLOCK_S - 1.15;

// ---------- camera ----------
export const CAM_POS: V3 = [-6.615, 3.364, 2.639];
export const CAM_TARGET: V3 = [-0.564, 0.474, -0.141];
export const FOV = 40;
/** rotation.y that turns a part's painted -x face toward the camera (horizontal). */
export const CAM_YAW = Math.atan2(CAM_POS[2] - CAM_TARGET[2], -(CAM_POS[0] - CAM_TARGET[0]));
const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...CAM_POS);
    camera.lookAt(...CAM_TARGET);
    (camera as THREE.PerspectiveCamera).fov = FOV;
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};
export const FOCUS = Math.hypot(...(at(S_LAST * 0.75, 0, 0.3).map((v, i) => v - CAM_POS[i]) as V3));

// ---------- parts ----------
/** One domino standing on its pivot (front-bottom edge), tilted forward by `tilt`. */
export const Domino: React.FC<{ s: number; lat?: number; tilt: number; face: THREE.Texture; color: string; scale?: number; yaw?: number }> = ({
  s,
  lat = 0,
  tilt,
  face,
  color,
  scale = 1,
  yaw = 0,
}) => (
  <group position={at(s, lat)} rotation={[0, HEADING + yaw, 0]} scale={scale}>
    <group rotation={[0, 0, -tilt]}>
      <mesh position={[-T / 2, H / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[T, H, W]} radius={0.016} />
        <meshPhysicalMaterial color={color} {...POLISH.toyPlastic} clearcoat={0.7} clearcoatRoughness={0.18} />
      </mesh>
      {/* painted back face (the side facing the camera), a hair proud of the body */}
      <mesh position={[-T - 0.0015, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[W - 0.022, H - 0.022]} />
        <meshPhysicalMaterial map={face} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
    </group>
  </group>
);

/** Mini corner-flag pennant planted in the felt, facing the camera, carrying one goal minute. */
export const Pennant: React.FC<{ pos: V3; tex: THREE.Texture; lift?: number }> = ({ pos, tex, lift = 0 }) => (
  <group position={pos} rotation={[0, CAM_YAW - Math.PI / 2, 0]}>
    <mesh position={[0, (0.4 + lift) / 2, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.01, 0.4 + lift, 10]} />
      <meshPhysicalMaterial color="#F4F1EA" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0, 0.405 + lift, 0]}>
      <sphereGeometry args={[0.014, 12, 10]} />
      <meshPhysicalMaterial color="#16161A" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0.135, 0.3 + lift, 0.004]} castShadow>
      <planeGeometry args={[0.26, 0.18]} />
      <meshPhysicalMaterial map={tex} {...POLISH.fabric} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Classic 32-panel look: white sphere with 12 black pentagons at the icosahedron vertices. */
export const Football: React.FC<{ pos: V3; r: number; spin?: V3 }> = ({ pos, r, spin = [0.4, 0.7, 0.2] }) => {
  const patches = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, 0);
    const p = ico.attributes.position as THREE.BufferAttribute;
    const seen: THREE.Vector3[] = [];
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).normalize();
      if (!seen.some((u) => u.distanceTo(v) < 1e-3)) seen.push(v);
    }
    return seen.map((n) => ({ n, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n) }));
  }, []);
  return (
    <group position={pos} rotation={spin}>
      <mesh castShadow>
        <sphereGeometry args={[r, 48, 32]} />
        <meshPhysicalMaterial color="#F6F4EE" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      {patches.map(({ n, q }, i) => (
        <mesh key={i} position={[n.x * r * 0.975, n.y * r * 0.975, n.z * r * 0.975]} quaternion={q}>
          <cylinderGeometry args={[r * 0.34, r * 0.34, r * 0.06, 5]} />
          <meshPhysicalMaterial color="#18181C" roughness={0.4} clearcoat={0.6} />
        </mesh>
      ))}
    </group>
  );
};

/** Plywood ramp on a block support, rising along the travel line. */
export const Ramp: React.FC<{ grain: THREE.Texture }> = ({ grain }) => {
  const ang = Math.atan2(RAMP_RISE, RAMP_LEN);
  const mid = RAMP_S0 + (RAMP_LEN * Math.cos(ang)) / 2;
  return (
    <group position={at(mid)} rotation={[0, HEADING, 0]}>
      <mesh position={[0, RAMP_RISE / 2 + 0.01, 0]} rotation={[0, 0, ang]} castShadow receiveShadow>
        <RoundedBoxGeo args={[RAMP_LEN + 0.04, 0.026, 0.26]} radius={0.006} />
        <meshPhysicalMaterial color={KP.plywood} map={grain} {...POLISH.paper} roughness={0.66} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[0, RAMP_RISE / 2 + 0.03, k * 0.135]} rotation={[0, 0, ang]} castShadow>
          <RoundedBoxGeo args={[RAMP_LEN + 0.04, 0.04, 0.014]} radius={0.004} />
          <meshPhysicalMaterial color={KP.plyEdge} map={grain} roughness={0.55} clearcoat={0.3} />
        </mesh>
      ))}
      {/* support block under the lip */}
      <mesh position={[RAMP_LEN * 0.38, RAMP_RISE * 0.42, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.12, RAMP_RISE * 0.84, 0.22]} radius={0.01} />
        <meshPhysicalMaterial color="#B5482B" {...POLISH.toyPlastic} />
      </mesh>
    </group>
  );
};

/** Scoreboard prop: painted plywood frame on two dowel legs, LED panel. */
export const Scoreboard: React.FC<{ grain: THREE.Texture }> = ({ grain }) => {
  const BW = 1.45, BH = 0.58, LEG = 0.3;
  return (
    <group position={at(BOARD_S, 1.7)} rotation={[0, CAM_YAW - 0.05, 0]}>
      <group rotation={[0, 0, -0.1]}>
        {[-0.52, 0.52].map((z) => (
          <mesh key={z} position={[0.02, LEG / 2, z]} castShadow>
            <cylinderGeometry args={[0.022, 0.026, LEG, 14]} />
            <meshStandardMaterial color={KP.bracket} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0.05, LEG + BH / 2, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.08, BH + 0.08, BW + 0.08]} radius={0.02} />
          <meshPhysicalMaterial color="#3B2A1E" map={grain} roughness={0.5} clearcoat={0.35} />
        </mesh>
        <mesh position={[0.008, LEG + BH / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[BW, BH]} />
          <meshStandardMaterial map={scoreboardFace()} emissive="#FFFFFF" emissiveMap={scoreboardFace()} emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog(BG, 6.5, 13);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  const tilts = useMemo(leanAngles, []);
  const ply = woodGrain(31, [1.5, 0.3]);
  const benchWood = woodGrain(3, [3, 1]);
  const peg = pegboard([48, 30]);
  const feltGrain = useSurfaceGrain(1010, 0.18, 8);
  const felt = pitchFelt();

  const mid = at(1.9);
  const blockPos = at(BLOCK_S);
  const BLOCK = { w: 0.66, h: 1.05, t: 0.24 };

  return (
    <>
      <CameraRig />
      <hemisphereLight args={["#FFE9CF", "#1B2A1C", 0.38]} />
      {/* desk-lamp key from the front right, cool rim from the back left */}
      <directionalLight
        position={[-3.2, 5.2, 3.6]}
        intensity={2.3}
        color={KP.lamp}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-3, 3.2, -3.5]} intensity={1.0} color={KP.rim} />
      {/* warm wash on the pegboard wall so the workshop BG reads */}
      <pointLight position={at(BLOCK_S + 1.2, 0.6, 1.6)} intensity={3.2} distance={4} decay={1.6} color="#FFC98A" />
      <pointLight position={[0.4, 1.9, 0.6]} intensity={1.6} distance={4.5} decay={2} color={KP.lamp} />
      <pointLight position={[blockPos[0] + 0.6, 1.6, blockPos[2] + 1.0]} intensity={1.4} distance={3} decay={2} color="#FFE3A0" />

      {/* table: oiled wood slab with pitch-green felt inlay, felt top at y = 0 */}
      <group position={[mid[0], 0, mid[2]]} rotation={[0, HEADING + Math.PI / 2, 0]}>
        <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
          <RoundedBoxGeo args={[4.3, 0.12, 6.6]} radius={0.03} />
          <meshPhysicalMaterial color={KP.bench} map={benchWood} roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.35} />
        </mesh>
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.9, 6.2]} />
          <meshPhysicalMaterial map={felt} color="#C9D8C6" {...POLISH.fabric} roughnessMap={feltGrain} sheenColor={new THREE.Color("#8CE0A4")} envMapIntensity={0.2} />
        </mesh>
        {/* apron under the slab */}
        <mesh position={[0, -0.45, 0]}>
          <RoundedBoxGeo args={[4.1, 0.66, 6.4]} radius={0.02} />
          <meshPhysicalMaterial color="#5E3E25" map={benchWood} roughness={0.6} />
        </mesh>
      </group>

      {/* workshop pegboard wall far behind */}
      <mesh position={at(BLOCK_S + 1.9, 0, 1.6)} rotation={[0, HEADING + Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color={KP.pegboard} map={peg} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* warm practical lamps behind: bokeh */}
      {([[0.9, 1.9, 0.09], [2.2, 1.4, 0.07], [-1.6, 1.2, 0.06], [3.2, 2.1, 0.08]] as const).map(([lat, y, r], i) => (
        <mesh key={i} position={at(BLOCK_S + 1.6, lat, y)} onUpdate={(m) => m.layers.enable(FX_LAYER)}>
          <sphereGeometry args={[r, 16, 16]} />
          <meshBasicMaterial color={KP.lamp} toneMapped={false} />
        </mesh>
      ))}

      {/* the seven German dominoes, wave front at 79'; each goal minute on a pitch pennant beside it */}
      {MINUTES.map((m, i) => (
        <React.Fragment key={m}>
          <Domino s={i * D} tilt={tilts[i]} face={dominoFace(m)} color="#F2EFE8" />
          <Pennant pos={at(i * D, i % 2 ? 0.34 : -0.36)} tex={minutePennant(m)} lift={i % 2 ? 0.3 : 0} />
        </React.Fragment>
      ))}

      <Ramp grain={ply} />
      {/* motion echoes along the launch arc instead of a solid trail line */}
      {[0.33, 0.66].map((u, k) => {
        const lip = at(RAMP_LIP_S, 0, RAMP_RISE + BALL_R);
        const b = at(BALL_S, 0, BALL_Y);
        const p: V3 = [lip[0] + (b[0] - lip[0]) * u, lip[1] + (b[1] - lip[1]) * Math.sqrt(u), lip[2] + (b[2] - lip[2]) * u];
        return (
          <mesh key={k} position={p}>
            <sphereGeometry args={[BALL_R * (0.8 + 0.2 * u), 24, 16]} />
            <meshBasicMaterial color="#FFF4E6" transparent opacity={0.12 + 0.14 * u} depthWrite={false} />
          </mesh>
        );
      })}
      <Football pos={at(BALL_S, 0, BALL_Y)} r={BALL_R} />

      {/* BRASIL block: the target */}
      <group position={blockPos} rotation={[0, HEADING + (CAM_YAW - HEADING) * 0.55, 0]}>
        <mesh position={[-BLOCK.t / 2, BLOCK.h / 2, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[BLOCK.t, BLOCK.h, BLOCK.w]} radius={0.03} />
          <meshPhysicalMaterial color={YELLOW} {...POLISH.toyPlastic} clearcoat={0.35} clearcoatRoughness={0.3} />
        </mesh>
        <mesh position={[-BLOCK.t - 0.002, BLOCK.h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[BLOCK.w - 0.04, BLOCK.h - 0.04]} />
          <meshPhysicalMaterial map={brazilBlockFace()} roughness={0.36} clearcoat={0.6} clearcoatRoughness={0.2} />
        </mesh>
      </group>

      {/* Brazil's lone 90' goal: small yellow domino, standing apart */}
      <Domino s={BLOCK_S - 0.55} lat={0.98} tilt={0} face={brazilDomino()} color={YELLOW} scale={0.8} yaw={CAM_YAW - HEADING} />

      <Scoreboard grain={benchWood} />

      {/* foreground: corner flag at the near touchline, spare dominoes stacked */}
      <group position={at(-0.55, 1.05)}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.56, 10]} />
          <meshPhysicalMaterial color="#F4F1EA" {...POLISH.toyPlastic} />
        </mesh>
        <mesh position={[0.09, 0.49, 0]} rotation={[0, -0.6, 0]} castShadow>
          <planeGeometry args={[0.18, 0.13]} />
          <meshPhysicalMaterial map={cornerFlag()} {...POLISH.fabric} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={at(-0.75, -1.0 + k * 0.02, 0.03 + k * 0.05)} rotation={[0, HEADING + 0.5 + k * 0.22, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[H * 0.9, 0.05, W * 0.9]} radius={0.012} />
          <meshPhysicalMaterial color={k === 1 ? "#16161A" : "#F2EFE8"} {...POLISH.toyPlastic} />
        </mesh>
      ))}

      <GroundShadow x={mid[0]} z={mid[2]} scale={6.5} opacity={0.55} blur={2} far={1.1} />

      <Finish
        frame={Math.round(f)}
        background={BG}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        exposure={0.95}
        hdri="warmStudio"
        envIntensity={0.45}
        focus={FOCUS}
        aperture={0.0012}
        maxBlur={0.005}
      />
    </>
  );
};

// ---------- HTML overlay (headline in the top safe area, nothing important below y = 1290) ----------
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(23,17,13,0.92) 0%, rgba(23,17,13,0.78) 24%, rgba(23,17,13,0.0) 36%, rgba(23,17,13,0) 70%, rgba(23,17,13,0.55) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 34, letterSpacing: 7, color: PITCH }}>
      SEJARAH SEPAK BOLA #10
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 242, textAlign: "center", fontFamily: ANTON, lineHeight: 1.0, textShadow: "0 6px 26px rgba(0,0,0,0.75)" }}>
      <div style={{ fontSize: 116, color: "#FFF4E6", letterSpacing: 1 }}>4 GOL DALAM</div>
      <div style={{ fontSize: 158, color: YELLOW, letterSpacing: 2, marginTop: 2 }}>6 MENIT</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 524, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 36, letterSpacing: 6, color: "#FFF4E6", textShadow: "0 3px 12px rgba(0,0,0,0.8)" }}>
      SEMIFINAL PIALA DUNIA 2014
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: FOV, near: 0.05, far: 40 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
