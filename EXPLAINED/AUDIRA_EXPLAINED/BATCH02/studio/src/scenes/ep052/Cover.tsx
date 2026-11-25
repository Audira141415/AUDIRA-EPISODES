// EP052 cover (NANOFORGE): a golden used-cooking-oil droplet magnified to molecular scale.
// Bottom: palm-oil triglyceride (glycerol + 3 ester-linked fatty chains, red oxygens) rising out
// of the droplet. Middle: hydrogen in, water out (the oxygen leaves). Top: straight alkane chains
// (grey C, white H, no O) streaming up toward a faint airliner taking off.
// Deterministic: everything derives from the frame; particle layout uses a fixed hash.

import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig, FX_LAYER, Post, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { buildAlkane, buildH2, buildTriglyceride, buildWater, type Mol } from "./molecules.ts";

export const PAL = {
  void: "#02050f",
  navy: "#071531",
  gold: "#f5a524",
  amber: "#fbbf24",
  cyan: "#22d3ee",
  teal: "#00f5d4",
  carbon: "#7b8594",
  hydrogen: "#f4f7fb",
  oxygen: "#ff3b3b",
  bond: "#c9d3e0",
};

export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------- shared geometry/materials ----------
export const useKit = () =>
  useMemo(() => {
    const sphere = new THREE.SphereGeometry(1, 32, 24);
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 14, 1);
    const std = (color: string, rough: number, metal = 0, emissive = "#000000", ei = 0) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity: ei, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.1 });
    return {
      sphere,
      cyl,
      C: std(PAL.carbon, 0.32, 0.15),
      H: std(PAL.hydrogen, 0.28, 0.0),
      O: std(PAL.oxygen, 0.26, 0.0, "#ff1a1a", 0.35),
      bond: std(PAL.bond, 0.35, 0.2),
      bondWarm: std("#d9c39a", 0.35, 0.2),
    };
  }, []);

export type Kit = ReturnType<typeof useKit>;
export const RADIUS = { C: 0.135, H: 0.085, O: 0.15 } as const;

/** Ball-and-stick rendering of a Mol. */
export const MolMesh: React.FC<{ mol: Mol; kit: Kit; warm?: boolean; scale?: number; hide?: Set<number> }> = ({ mol, kit, warm, scale = 1, hide }) => {
  const parts = useMemo(() => {
    const bonds: { pos: THREE.Vector3; quat: THREE.Quaternion; len: number; r: number }[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (const b of mol.bonds) {
      if (hide && (hide.has(b.a) || hide.has(b.b))) continue;
      const pa = mol.atoms[b.a].p;
      const pb = mol.atoms[b.b].p;
      const d = pb.clone().sub(pa);
      const len = d.length();
      const quat = new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize());
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      if (b.order === 1) bonds.push({ pos: mid, quat, len, r: 0.04 });
      else {
        // double bond: two thinner sticks offset perpendicular to the bond
        let off = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1));
        if (off.lengthSq() < 1e-6) off = new THREE.Vector3(1, 0, 0);
        off.normalize().multiplyScalar(0.055);
        bonds.push({ pos: mid.clone().add(off), quat, len, r: 0.028 });
        bonds.push({ pos: mid.clone().sub(off), quat, len, r: 0.028 });
      }
    }
    return bonds;
  }, [mol, hide]);
  return (
    <group scale={scale}>
      {mol.atoms.map((a, i) => hide?.has(i) ? null : (
        <mesh key={`a${i}`} geometry={kit.sphere} material={kit[a.el]} position={a.p} scale={RADIUS[a.el]} castShadow receiveShadow />
      ))}
      {parts.map((b, i) => (
        <mesh key={`b${i}`} geometry={kit.cyl} material={warm ? kit.bondWarm : kit.bond} position={b.pos} quaternion={b.quat} scale={[b.r, b.len, b.r]} castShadow receiveShadow />
      ))}
    </group>
  );
};

// ---------- environment ----------
export const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    pm.dispose();
  }, [gl, scene]);
  return null;
};

export const SkyShader = {
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `varying vec2 vUv;
    void main(){
      float y = vUv.y;
      vec3 deep = vec3(0.008, 0.02, 0.06);
      vec3 navy = vec3(0.02, 0.06, 0.14);
      vec3 dawn = vec3(0.10, 0.30, 0.42);
      vec3 warm = vec3(0.20, 0.09, 0.015);
      vec3 c = mix(warm, deep, smoothstep(0.08, 0.40, y));
      c = mix(c, navy, smoothstep(0.42, 0.70, y));
      c = mix(c, dawn, smoothstep(0.70, 0.98, y));
      // soft horizontal glow band behind the airliner
      float band = exp(-pow((y - 0.88) * 9.0, 2.0)) * smoothstep(0.0, 0.6, vUv.x) * 0.25;
      c += vec3(0.25, 0.55, 0.65) * band;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

const Backdrop: React.FC = () => (
  <mesh position={[0, 0.5, -26]}>
    <planeGeometry args={[40, 64]} />
    <shaderMaterial args={[SkyShader]} depthWrite={false} />
  </mesh>
);

/** The magnified golden oil droplet the triglyceride rises out of. */
export const Droplet: React.FC<{ f: number }> = ({ f }) => {
  const glowMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: { uCol: { value: new THREE.Color(PAL.gold) } },
        vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `uniform vec3 uCol; varying vec3 vN; varying vec3 vV; void main(){ float r = 1.0 - abs(dot(vN, vV)); float a = pow(r, 2.2) * 0.55; gl_FragColor = vec4(uCol * a, a); }`,
      }),
    [],
  );
  const s = 1 + Math.sin(f * 0.03) * 0.006;
  return (
    <group position={[-0.6, -6.05, -1.8]} scale={[s * 1.06, s, s]}>
      <mesh>
        <sphereGeometry args={[4.1, 96, 64]} />
        <meshPhysicalMaterial
          color="#a8680a"
          emissive="#6b3502"
          emissiveIntensity={0.4}
          roughness={0.08}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.9}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh scale={1.1} layers={FX_LAYER}>
        <sphereGeometry args={[4.1, 64, 48]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
    </group>
  );
};

/** Golden-to-cyan particle stream: the conversion path from oil to fuel. */
export const Stream: React.FC<{ f: number }> = ({ f }) => {
  const pts = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => ({
        t: hash(i * 3.1),
        ang: hash(i * 7.7) * Math.PI * 2,
        rad: 0.3 + hash(i * 1.9) * 1.3,
        size: 0.018 + hash(i * 5.3) * 0.035,
        z: (hash(i * 9.1) - 0.5) * 2.4,
      })),
    [],
  );
  const gold = new THREE.Color(PAL.amber);
  const cyan = new THREE.Color(PAL.teal);
  return (
    <group>
      {pts.map((p, i) => {
        const t = (p.t + f * 0.0015) % 1;
        const y = THREE.MathUtils.lerp(0.0, 3.4, t);
        const x = THREE.MathUtils.lerp(0.6, -0.4, t) + Math.cos(p.ang + t * 5) * p.rad * (0.6 + 0.4 * Math.sin(t * Math.PI));
        const col = gold.clone().lerp(cyan, THREE.MathUtils.smoothstep(t, 0.3, 0.7));
        return (
          <mesh key={i} position={[x, y, p.z + Math.sin(p.ang + t * 5) * 0.6]} layers={FX_LAYER}>
            <sphereGeometry args={[p.size, 8, 6]} />
            <meshBasicMaterial color={col} transparent opacity={0.35 + 0.5 * Math.sin(t * Math.PI)} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Background bokeh droplets (warm low, cool high). */
export const Bokeh: React.FC<{ f: number }> = ({ f }) => {
  const list = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: (hash(i + 11) - 0.5) * 16,
        y: (hash(i + 23) - 0.5) * 22,
        z: -6 - hash(i + 37) * 10,
        r: 0.06 + hash(i + 51) * 0.22,
      })),
    [],
  );
  return (
    <group>
      {list.map((b, i) => {
        const warm = b.y < -2;
        return (
          <mesh key={i} position={[b.x + Math.sin(f * 0.01 + i) * 0.1, b.y, b.z]} layers={FX_LAYER}>
            <sphereGeometry args={[b.r, 16, 12]} />
            <meshBasicMaterial color={warm ? PAL.amber : PAL.cyan} transparent opacity={0.22} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const SHOT: Shot = {
  pos: [0.9, 0.9, 16.5],
  target: [0.2, 0.15, 0],
  fov: 40,
  focus: 16.4,
  aperture: 0.0012,
  maxBlur: 0.006,
  exposure: 1.05,
};

export const CoverScene: React.FC<{ f: number; shot?: Shot }> = ({ f, shot = SHOT }) => {
  const kit = useKit();
  const tg = useMemo(() => buildTriglyceride(), []);
  const alkanes = useMemo(() => [buildAlkane(15), buildAlkane(13), buildAlkane(11)], []);
  const water = useMemo(() => buildWater(), []);
  const h2 = useMemo(() => buildH2(), []);
  const drift = (k: number, a = 0.04) => Math.sin(f * 0.02 + k) * a;
  return (
    <>
      <CameraRig shot={shot} near={0.5} far={120} />
      <Env />
      <Backdrop />
      <ambientLight color="#0d2448" intensity={0.6} />
      {/* electron-beam key from above */}
      <directionalLight position={[3, 9, 7]} color="#dbe6ff" intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      {/* warm oil light from the droplet below */}
      <pointLight position={[-0.5, -3.2, 2.0]} color={PAL.gold} intensity={26} distance={9} decay={1.6} />
      {/* cool fuel light from above */}
      <pointLight position={[0.5, 4.6, 2.5]} color={PAL.cyan} intensity={22} distance={9} decay={1.6} />
      {/* rim kickers */}
      <pointLight position={[-4, 1.0, -2.5]} color={PAL.teal} intensity={10} distance={8} />
      <pointLight position={[4.5, -1.5, -1.5]} color="#ff8a3d" intensity={8} distance={8} />

      <Droplet f={f} />
      <Bokeh f={f} />
      <Stream f={f} />

      {/* triglyceride emerging from the droplet */}
      <group position={[-2.1, -0.3 + drift(1, 0.03), 0.6]} rotation={[0.22, -0.42, 0.06]} scale={0.8}>
        <MolMesh mol={tg} kit={kit} warm />
      </group>

      {/* hydrogen going in */}
      {[
        [2.2, 0.6, 1.6, 0.4],
        [-2.4, 1.15, 1.4, 1.2],
        [0.9, 1.35, 2.6, 2.3],
      ].map(([x, y, z, r], i) => (
        <group key={`h2${i}`} position={[x, y + drift(i * 2), z]} rotation={[r, r * 0.7, r * 1.3]}>
          <MolMesh mol={h2} kit={kit} />
        </group>
      ))}
      {/* water leaving: the oxygen removed from the oil */}
      {[
        [-2.3, 1.25, 1.2, 0.3],
        [2.55, 0.95, 0.6, 2.1],
        [1.5, 0.95, 2.2, 4.0],
      ].map(([x, y, z, r], i) => (
        <group key={`w${i}`} position={[x, y + drift(i * 3 + 1), z]} rotation={[r * 0.5, r, r * 0.3]} scale={1.15}>
          <MolMesh mol={water} kit={kit} />
        </group>
      ))}

      {/* straight hydrocarbon chains, no oxygen, rising toward the airliner */}
      <group position={[-2.6, 1.95 + drift(5, 0.03), 0.6]} rotation={[0.12, -0.22, 0.17]} scale={0.78}>
        <MolMesh mol={alkanes[0]} kit={kit} />
      </group>
      <group position={[-1.9, 2.95 + drift(6, 0.03), -0.4]} rotation={[0.1, -0.2, 0.19]} scale={0.78}>
        <MolMesh mol={alkanes[1]} kit={kit} />
      </group>
      <group position={[-2.6, 3.8 + drift(7, 0.03), -1.4]} rotation={[0.14, -0.18, 0.21]} scale={0.78}>
        <MolMesh mol={alkanes[2]} kit={kit} />
      </group>

      <Post shot={shot} frame={f} ao aoRadius={0.18} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} />
    </>
  );
};

/** Generic airliner side silhouette, climbing (no livery, no logos). */
export const Airliner: React.FC = () => (
  <svg width={520} height={190} viewBox="-20 -90 460 170" style={{ position: "absolute", left: 590, top: 70, transform: "rotate(-13deg) scale(0.9)", opacity: 0.6, filter: "blur(0.6px)" }}>
    <defs>
      <linearGradient id="ep052trail" x1="0" x2="1">
        <stop offset="0" stopColor="#9be7f5" stopOpacity="0" />
        <stop offset="1" stopColor="#9be7f5" stopOpacity="0.55" />
      </linearGradient>
    </defs>
    <rect x={-420} y={27} width={590} height={3} fill="url(#ep052trail)" transform="translate(0,0)" />
    <rect x={-380} y={38} width={540} height={2} fill="url(#ep052trail)" />
    <g fill="#061226" stroke="#7fd8ea" strokeWidth={1.4} strokeOpacity={0.6}>
      {/* far wing */}
      <path d="M215,18 L262,-10 L282,-10 L252,20 Z" opacity={0.85} />
      {/* fuselage + fin (nose at right) */}
      <path d="M410,20 C410,6 396,-2 366,-2 L92,-2 L36,-70 L10,-70 L18,-2 L2,6 L6,22 L50,36 L360,40 C396,40 410,32 410,20 Z" />
      {/* horizontal stabiliser */}
      <path d="M60,12 L14,12 L-6,24 L14,26 Z" />
      {/* near wing */}
      <path d="M262,28 L190,28 L104,66 L124,70 Z" />
      {/* engine nacelle */}
      <rect x={210} y={38} width={56} height={20} rx={10} />
    </g>
    {/* cockpit windows hint */}
    <path d="M384,6 L398,10" stroke="#9be7f5" strokeWidth={2} strokeOpacity={0.6} />
  </svg>
);

const Overlay: React.FC = () => {
  const mono = "'JetBrains Mono', Consolas, 'Courier New', monospace";
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: "#fff" }}>
      <Airliner />
      {/* microscopy HUD */}
      <div style={{ position: "absolute", left: 64, top: 190, fontFamily: mono, fontSize: 21, letterSpacing: 3, color: "rgba(160,235,245,0.85)" }}>
        MAG 2.000.000×
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <div style={{ width: 82, height: 3, background: "rgba(220,245,250,0.9)" }} />
          <span style={{ fontSize: 19 }}>5 Å</span>
        </div>
      </div>
      {/* labels */}
      <div style={{ position: "absolute", left: 740, top: 560, fontFamily: mono, fontSize: 22, letterSpacing: 2, color: "#9ff3ff", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
        HIDROKARBON
        <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: 0, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>C–H saja, tanpa oksigen</div>
      </div>
      <div style={{ position: "absolute", left: 806, top: 1000, width: 230, fontFamily: mono, fontSize: 22, letterSpacing: 2, color: "#ffd27a", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
        TRIGLISERIDA
        <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: 0, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
          minyak jelantah<br /><span style={{ color: "#ff6a6a", fontWeight: 600 }}>O</span> = oksigen
        </div>
      </div>
      {/* title */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 1290, textShadow: "0 4px 30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.7)" }}>
        <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: 9, color: PAL.teal, fontWeight: 600 }}>AUDIRA EXPLAINED</div>
        <div style={{ fontSize: 118, fontWeight: 600, lineHeight: 1.0, letterSpacing: -2, marginTop: 14 }}>
          Jelantah
          <br />
          Jadi <span style={{ color: "#7ff3ff" }}>Avtur?</span>
        </div>
      </div>
    </div>
  );
};

export const Ep052Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame * 2; // 60 fps film clock
  return (
    <Stage3D background={PAL.void} overlay={() => <Overlay />}>
      <CoverScene f={f} />
    </Stage3D>
  );
};
