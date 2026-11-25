// EP03 cover (CYBERFORGE): hologram threat table of the Indonesian archipelago.
// Red attack arcs arrive from outside and shatter on a cyan hexagonal firewall dome;
// a generic bank building sits safe underneath. Headline: "DIBLOKIR, BUKAN DIBOBOL".
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadChakra } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { CYBER_PALETTE as C } from "../../kits/cyberforge/lib/palette.ts";
import { CyberAtmosphere } from "../../kits/cyberforge/world/Atmosphere.tsx";
import { CyberGrid } from "../../kits/cyberforge/world/CyberGrid.tsx";
import { DataStream } from "../../kits/cyberforge/world/DataStream.tsx";
import { TelemetryRings } from "../../kits/cyberforge/hud/TelemetryRings.tsx";
import { ISLANDS, toXZ } from "./islands.ts";
import { glowTexture, plaqueTexture, tableTexture } from "./coverTextures.ts";

const { fontFamily: CHAKRA } = loadChakra("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"], subsets: ["latin"] });

const RED = "#ff2a3c";
type V3 = [number, number, number];

// Dome (firewall) semi-axes and table size
const DA = 3.75, DB = 2.05, DH = 2.3;
const TA = 4.25, TB = 2.4;
const domeY = (x: number, z: number) => {
  const q = 1 - (x / DA) ** 2 - (z / DB) ** 2;
  return q <= 0 ? 0 : DH * Math.sqrt(q);
};

// ---------- camera ----------
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0.15 - t * 0.03, 12.6, 11.4);
    cam.lookAt(0, 0.0, 0.1);
    cam.fov = 40;
    cam.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- holo table ----------
const Table: React.FC = () => {
  const grain = useSurfaceGrain(23, 0.2, 5);
  return (
    <group>
      <mesh position={[0, -0.18, 0]} scale={[TA, 1, TB]} receiveShadow>
        <cylinderGeometry args={[1, 0.96, 0.36, 96]} />
        <meshStandardMaterial color="#0a1426" metalness={0.75} roughness={0.32} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[TA * 0.985, TB * 0.985, 1]}>
        <circleGeometry args={[1, 96]} />
        <meshStandardMaterial map={tableTexture()} emissiveMap={tableTexture()} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.25} metalness={0.4} />
      </mesh>
      {/* rim light ring */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[TA, TB, 1]}>
        <ringGeometry args={[0.975, 0.995, 128]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* AUDIRA plaque on the front bezel */}
      <mesh position={[0, -0.12, TB + 0.1]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[3.5, 0.42]} />
        <meshBasicMaterial map={plaqueTexture()} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- islands ----------
const Islands: React.FC = () => {
  const geos = useMemo(
    () =>
      Object.values(ISLANDS).map((pts) => {
        const shape = new THREE.Shape(pts.map(([lo, la]) => {
          const [x, z] = toXZ(lo, la);
          return new THREE.Vector2(x, -z);
        }));
        const g = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 1 });
        g.rotateX(-Math.PI / 2);
        const edges = new THREE.EdgesGeometry(g, 25);
        return { g, edges };
      }),
    [],
  );
  return (
    <group position={[0, 0.02, 0]}>
      {geos.map(({ g, edges }, i) => (
        <group key={i}>
          <mesh geometry={g} castShadow receiveShadow>
            <meshStandardMaterial color="#0e8fa0" emissive={C.cyan} emissiveIntensity={0.35} roughness={0.35} metalness={0.35} flatShading />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={C.hudCyan} transparent opacity={0.85} toneMapped={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
};

// ---------- firewall dome ----------
const domeVert = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const domeFrag = /* glsl */ `
uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
void main(){
  float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);
  float a = 0.04 + fr * 0.5;
  gl_FragColor = vec4(uColor * (0.55 + fr * 0.8), a);
}`;

const Dome: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: domeVert,
        fragmentShader: domeFrag,
        uniforms: { uColor: { value: new THREE.Color(C.cyan) } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const hexGeo = useMemo(() => {
    const s = 0.3; // hex radius
    const pts: number[] = [];
    const w = Math.sqrt(3) * s;
    for (let row = -12; row <= 12; row++) {
      for (let col = -14; col <= 14; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0);
        const cz = row * 1.5 * s;
        for (let k = 0; k < 6; k++) {
          const a0 = (Math.PI / 3) * k + Math.PI / 6, a1 = a0 + Math.PI / 3;
          const x0 = cx + s * Math.cos(a0), z0 = cz + s * Math.sin(a0);
          const x1 = cx + s * Math.cos(a1), z1 = cz + s * Math.sin(a1);
          const N = 5;
          for (let i = 0; i < N; i++) {
            const ta = i / N, tb = (i + 1) / N;
            const xa = x0 + (x1 - x0) * ta, za = z0 + (z1 - z0) * ta;
            const xb = x0 + (x1 - x0) * tb, zb = z0 + (z1 - z0) * tb;
            const qa = (xa / DA) ** 2 + (za / DB) ** 2, qb = (xb / DA) ** 2 + (zb / DB) ** 2;
            if (qa > 0.97 || qb > 0.97) continue;
            pts.push(xa, domeY(xa, za) + 0.004, za, xb, domeY(xb, zb) + 0.004, zb);
          }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <group>
      <mesh scale={[DA, DH, DB]} material={mat}>
        <sphereGeometry args={[1, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <lineSegments geometry={hexGeo}>
        <lineBasicMaterial color={C.cyan} transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
      {/* dome foot ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[DA, DB, 1]}>
        <ringGeometry args={[0.985, 1.005, 128]} />
        <meshBasicMaterial color={C.hudCyan} transparent opacity={0.95} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- attack arcs + impacts ----------
type Arc = { tube: THREE.TubeGeometry; hit: THREE.Vector3; n: THREE.Vector3; seed: number; big: boolean };

const makeArcs = (): Arc[] => {
  const r = prng(907);
  const arcs: Arc[] = [];
  const N = 24;
  for (let i = 0; i < N; i++) {
    // mostly from the back half and the sides; never from behind the camera
    const side = i % 6 === 0 ? -1 : i % 6 === 3 ? 1 : 0;
    const phi = side === -1 ? Math.PI + 0.05 + r() * 0.35 : side === 1 ? -0.05 - r() * 0.35 : Math.PI * (1.08 + (i / N) * 0.84) + (r() - 0.5) * 0.2;
    const th = 0.35 + r() * 0.75;
    const hit = new THREE.Vector3(DA * Math.cos(th) * Math.cos(phi), DH * Math.sin(th), DB * Math.cos(th) * Math.sin(phi));
    const n = new THREE.Vector3(hit.x / DA ** 2, hit.y / DH ** 2, hit.z / DB ** 2).normalize();
    const R = 9 + r() * 6;
    const src = new THREE.Vector3(Math.cos(phi) * R, 6 + r() * 6, Math.sin(phi) * (5 + r() * 4) - 1.5);
    const ctrl = src.clone().lerp(hit, 0.55).add(new THREE.Vector3(0, 2.2 + r() * 2.2, 0));
    const curve = new THREE.QuadraticBezierCurve3(src, ctrl, hit);
    const big = i % 3 === 0;
    const seg = 64, rad = 10;
    const tube = new THREE.TubeGeometry(curve, seg, big ? 0.03 : 0.02, rad, false);
    const col = new Float32Array((seg + 1) * (rad + 1) * 3);
    const red = new THREE.Color(RED), hot = new THREE.Color("#ff9a5a");
    for (let s = 0; s <= seg; s++) {
      const t = s / seg;
      const k = Math.pow(t, 1.7);
      const c = red.clone().lerp(hot, Math.max(0, (t - 0.85) / 0.15)).multiplyScalar(k * (big ? 1.0 : 0.8));
      for (let j = 0; j <= rad; j++) {
        const idx = (s * (rad + 1) + j) * 3;
        col[idx] = c.r; col[idx + 1] = c.g; col[idx + 2] = c.b;
      }
    }
    tube.setAttribute("color", new THREE.BufferAttribute(col, 3));
    arcs.push({ tube, hit, n, seed: 100 + i * 17, big });
  }
  return arcs;
};

const orient = (n: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);

const Impact: React.FC<{ a: Arc; f: number }> = ({ a, f }) => {
  const q = useMemo(() => orient(a.n), [a.n]);
  const shards = useMemo(() => {
    const r = prng(a.seed);
    const t1 = new THREE.Vector3().crossVectors(a.n, new THREE.Vector3(0, 1, 0.3)).normalize();
    const t2 = new THREE.Vector3().crossVectors(a.n, t1).normalize();
    return Array.from({ length: a.big ? 9 : 6 }, () => {
      const ang = r() * Math.PI * 2;
      const d = 0.12 + r() * (a.big ? 0.5 : 0.32);
      const p = a.hit.clone()
        .addScaledVector(t1, Math.cos(ang) * d)
        .addScaledVector(t2, Math.sin(ang) * d)
        .addScaledVector(a.n, 0.06 + r() * 0.3);
      return { p: p.toArray() as V3, rot: [r() * 6, r() * 6, r() * 6] as V3, s: 0.035 + r() * 0.05 };
    });
  }, [a]);
  const pulse = 0.85 + 0.15 * Math.sin(f * 0.2 + a.seed);
  const glow = glowTexture();
  return (
    <group>
      {/* firewall flare: hex cell lights up */}
      <mesh position={a.hit} quaternion={q}>
        <circleGeometry args={[a.big ? 0.26 : 0.18, 6]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.45 * pulse} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={a.hit} quaternion={q}>
        <ringGeometry args={[a.big ? 0.32 : 0.22, a.big ? 0.36 : 0.25, 6]} />
        <meshBasicMaterial color={C.hudCyan} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <sprite position={a.hit} scale={a.big ? [0.9, 0.9, 1] : [0.55, 0.55, 1]}>
        <spriteMaterial map={glow} color="#ff5a3c" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      {/* shattered attack fragments */}
      {shards.map((s, i) => (
        <mesh key={i} position={s.p} rotation={s.rot} scale={s.s}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ff4a3a" emissive={RED} emissiveIntensity={0.5} roughness={0.4} metalness={0.2} flatShading />
        </mesh>
      ))}
    </group>
  );
};

const Attacks: React.FC<{ f: number }> = ({ f }) => {
  const arcs = useMemo(makeArcs, []);
  return (
    <group>
      {arcs.map((a, i) => (
        <mesh key={i} geometry={a.tube}>
          <meshBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {arcs.map((a, i) => (
        <Impact key={`i${i}`} a={a} f={f} />
      ))}
    </group>
  );
};

// ---------- generic bank building (no logos) ----------
const HOLO_GREEN = "#19d98a";
const bankMat = (
  <meshStandardMaterial color="#10a86c" emissive={HOLO_GREEN} emissiveIntensity={0.35} roughness={0.35} metalness={0.3} flatShading />
);
const Bank: React.FC<{ f: number }> = ({ f }) => {
  const [x, z] = toXZ(111.2, -4.3);
  const pedTri = useMemo(() => {
    const s = new THREE.Shape([new THREE.Vector2(-0.46, 0), new THREE.Vector2(0.46, 0), new THREE.Vector2(0, 0.22)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
    g.translate(0, 0, -0.15);
    return g;
  }, []);
  const edgeTri = useMemo(() => new THREE.EdgesGeometry(pedTri), [pedTri]);
  const bob = Math.sin(f * 0.05) * 0.02;
  const cols = [-0.36, -0.22, 0.22, 0.36];
  return (
    <group position={[x, 0, z]}>
      {/* projector beam from the map up to the floating hologram */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 0.18, 48, 1, true]} />
        <meshBasicMaterial color={C.matrixLime} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    <group position={[0, 0.14, 0]} scale={0.85}>
      {/* pedestal shield ring */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.44, 0.48, 64]} />
        <meshBasicMaterial color={C.matrixLime} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 64]} />
        <meshBasicMaterial color={C.matrixLime} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
    <group position={[0, 0.3 + bob, 0]} rotation={[-0.6, 0, 0]} scale={1.12}>
      {/* steps */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <RoundedBoxGeo args={[1.0, 0.06, 0.5]} radius={0.015} segments={2} />
        {bankMat}
      </mesh>
      <mesh position={[0, 0.09, 0]} castShadow>
        <RoundedBoxGeo args={[0.9, 0.06, 0.42]} radius={0.015} segments={2} />
        {bankMat}
      </mesh>
      {/* columns */}
      {cols.map((cx) => (
        <mesh key={cx} position={[cx, 0.32, 0.12]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.4, 8]} />
          {bankMat}
        </mesh>
      ))}
      {/* vault wall behind the columns, with a round vault door */}
      <mesh position={[0, 0.32, -0.06]} castShadow>
        <RoundedBoxGeo args={[0.78, 0.4, 0.18]} radius={0.02} segments={2} />
        <meshStandardMaterial color="#0b6e4a" emissive={HOLO_GREEN} emissiveIntensity={0.2} roughness={0.4} metalness={0.3} flatShading />
      </mesh>
      <mesh position={[0, 0.32, 0.035]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.022, 8, 32]} />
        <meshBasicMaterial color="#c8ffe4" toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[0, 0.32, 0.035]} rotation={[0, 0, (Math.PI / 4) * k]}>
          <boxGeometry args={[0.22, 0.014, 0.01]} />
          <meshBasicMaterial color="#c8ffe4" toneMapped={false} />
        </mesh>
      ))}
      {/* architrave + pediment */}
      <mesh position={[0, 0.56, 0.02]} castShadow>
        <RoundedBoxGeo args={[0.96, 0.08, 0.36]} radius={0.015} segments={2} />
        {bankMat}
      </mesh>
      <group position={[0, 0.6, 0.02]}>
        <mesh geometry={pedTri} castShadow>
          {bankMat}
        </mesh>
        <lineSegments geometry={edgeTri}>
          <lineBasicMaterial color="#c8ffe4" toneMapped={false} />
        </lineSegments>
      </group>
      {/* green glow under the building */}
      <sprite position={[0, 0.3, 0]} scale={[1.6, 1.6, 1]}>
        <spriteMaterial map={glowTexture()} color={C.matrixLime} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
    </group>
  );
};

// ---------- scene ----------
const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig f={f} />
    <CyberAtmosphere f={f} />
    <directionalLight position={[-3, 9, 6]} intensity={1.6} color="#bfefff" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
    <pointLight position={[0, 3.5, 0]} intensity={6} distance={9} decay={2} color={C.cyan} />
    <group position={[0, 1.2, 0]}>
      <CyberGrid f={f} size={60} divisions={44} />
    </group>
    <group position={[0, -0.5, 0]} scale={[1, 1, 0.58]}>
      <TelemetryRings f={f} radius={5.2} />
    </group>
    <group position={[0, -3, -4]}>
      <DataStream f={f} count={160} />
    </group>
    <Table />
    <Islands />
    <Bank f={f} />
    <Dome />
    <Attacks f={f} />
    <Finish frame={Math.round(f)} background={C.voidDeep} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
  </>
);

// ---------- HTML overlay ----------
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(4,6,13,0.94) 0%, rgba(4,6,13,0.8) 22%, rgba(4,6,13,0) 34%, rgba(4,6,13,0) 64%, rgba(4,6,13,0.75) 76%, rgba(4,6,13,0.85) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 70, top: 200, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: C.cyan }}>
      <span style={{ color: RED }}>●</span> LIVE · PETA SERANGAN SIBER
    </div>
    <div style={{ position: "absolute", left: 64, top: 258, fontFamily: CHAKRA, fontWeight: 700, lineHeight: 0.95, textTransform: "uppercase" }}>
      <div style={{ fontSize: 158, color: C.cyan, letterSpacing: 1, textShadow: "0 0 28px rgba(0,240,255,0.55)" }}>DIBLOKIR,</div>
      <div style={{ fontSize: 118, color: C.hudWhite, letterSpacing: 1, textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>
        BUKAN <span style={{ color: "#ff4a5a" }}>DIBOBOL</span>
      </div>
    </div>
    {/* counter panel */}
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        top: 1322,
        padding: "14px 34px 16px",
        border: `3px solid ${C.cyan}`,
        background: "rgba(6,14,28,0.78)",
        boxShadow: "0 0 30px rgba(0,240,255,0.25)",
      }}
    >
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: C.solarAmber }}>UPAYA SERANGAN KE INDONESIA</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, fontFamily: CHAKRA, fontWeight: 700, color: C.hudWhite, marginTop: 4 }}>
        <span style={{ fontSize: 108, lineHeight: 1 }}>2,1 JUTA</span>
        <span style={{ fontSize: 60, color: C.cyan }}>/ 24 JAM</span>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#8fb3cc", marginTop: 8 }}>SUMBER: FORTIGUARD, 10 NOV 2026</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: C.voidDeep }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0, 12.6, 11.4], fov: 40, near: 0.1, far: 200 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
