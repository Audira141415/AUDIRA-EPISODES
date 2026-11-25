// EP03 film world (CYBERFORGE): the approved cover's threat table, made animatable.
// Table, islands, firewall dome, live attack packets, bank hologram, data bars, transaction
// packet and the 151 response-team tokens. Cover.tsx keeps its own static copy (cover output frozen).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { CYBER_PALETTE as C } from "../../kits/cyberforge/lib/palette.ts";
import { ISLANDS, toXZ } from "./islands.ts";
import { glowTexture, plaqueTexture, tableTexture } from "./coverTextures.ts";
import { labelTexture, nodeTexture } from "./filmTextures.ts";

export const RED = "#ff2a3c";
export const DA = 3.75, DB = 2.05, DH = 2.3;
const TA = 4.25, TB = 2.4;
const domeY = (x: number, z: number) => {
  const q = 1 - (x / DA) ** 2 - (z / DB) ** 2;
  return q <= 0 ? 0 : DH * Math.sqrt(q);
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
type V3 = [number, number, number];

const [BX, BZ] = toXZ(111.2, -4.3);
export const BANK_POS: V3 = [BX, 0, BZ];

// ---------- table ----------
export const Table: React.FC = () => {
  const grain = useSurfaceGrain(23, 0.2, 5);
  return (
    <group>
      <mesh position={[0, -0.18, 0]} scale={[TA, 1, TB]} receiveShadow>
        <cylinderGeometry args={[1, 0.96, 0.36, 96]} />
        <meshStandardMaterial color="#0a1426" metalness={0.75} roughness={0.32} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[TA * 0.985, TB * 0.985, 1]} receiveShadow>
        <circleGeometry args={[1, 96]} />
        <meshStandardMaterial map={tableTexture()} emissiveMap={tableTexture()} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.25} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[TA, TB, 1]}>
        <ringGeometry args={[0.975, 0.995, 128]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* in-world AUDIRA brand: bezel plaque */}
      <mesh position={[0, -0.12, TB + 0.1]} rotation={[-0.55, 0, 0]}>
        <planeGeometry args={[3.5, 0.42]} />
        <meshBasicMaterial map={plaqueTexture()} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- islands ----------
export const Islands: React.FC<{ dim: number }> = ({ dim }) => {
  const geos = useMemo(
    () =>
      Object.values(ISLANDS).map((pts) => {
        const shape = new THREE.Shape(
          pts.map(([lo, la]) => {
            const [x, z] = toXZ(lo, la);
            return new THREE.Vector2(x, -z);
          }),
        );
        const g = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 1 });
        g.rotateX(-Math.PI / 2);
        return { g, edges: new THREE.EdgesGeometry(g, 25) };
      }),
    [],
  );
  const k = 1 - dim * 0.6;
  return (
    <group position={[0, 0.02, 0]}>
      {geos.map(({ g, edges }, i) => (
        <group key={i}>
          <mesh geometry={g} castShadow receiveShadow>
            <meshStandardMaterial color={new THREE.Color("#0e8fa0").multiplyScalar(k)} emissive={C.cyan} emissiveIntensity={0.35 * k} roughness={0.35} metalness={0.35} flatShading />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={C.hudCyan} transparent opacity={0.85 * k} toneMapped={false} />
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
uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV;
void main(){
  float d = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
  float fr = pow(1.0 - d, 2.4);
  float a = (0.04 + fr * 0.5) * uK;
  gl_FragColor = vec4(uColor * (0.55 + fr * 0.8), a);
}`;

export const Dome: React.FC<{ k: number; flash: number }> = ({ k, flash }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: domeVert,
        fragmentShader: domeFrag,
        uniforms: { uColor: { value: new THREE.Color(C.cyan) }, uK: { value: 1 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  mat.uniforms.uK.value = k * (1 + flash * 0.6);
  const hexGeo = useMemo(() => {
    const s = 0.3;
    const pts: number[] = [];
    const w = Math.sqrt(3) * s;
    for (let row = -12; row <= 12; row++) {
      for (let col = -14; col <= 14; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0);
        const cz = row * 1.5 * s;
        for (let kk = 0; kk < 6; kk++) {
          const a0 = (Math.PI / 3) * kk + Math.PI / 6, a1 = a0 + Math.PI / 3;
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
  if (k <= 0.001) return null;
  return (
    <group>
      <mesh scale={[DA, DH, DB]} material={mat}>
        <sphereGeometry args={[1, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <lineSegments geometry={hexGeo}>
        <lineBasicMaterial color={C.cyan} transparent opacity={0.42 * k * (1 + flash * 0.5)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[DA, DB, 1]}>
        <ringGeometry args={[0.985, 1.005, 128]} />
        <meshBasicMaterial color={C.hudCyan} transparent opacity={0.95 * k} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- live attack packets ----------
type Arc = {
  curve: THREE.QuadraticBezierCurve3;
  tube: THREE.TubeGeometry;
  hit: THREE.Vector3;
  q: THREE.Quaternion;
  period: number;
  phase: number;
  big: boolean;
  shards: { dir: THREE.Vector3; rot: V3; s: number }[];
};

const makeArcs = (): Arc[] => {
  const r = prng(907);
  const arcs: Arc[] = [];
  const N = 24;
  for (let i = 0; i < N; i++) {
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
    const seg = 64, rad = 8;
    const tube = new THREE.TubeGeometry(curve, seg, big ? 0.022 : 0.015, rad, false);
    const col = new Float32Array((seg + 1) * (rad + 1) * 3);
    const red = new THREE.Color(RED);
    for (let s = 0; s <= seg; s++) {
      const c = red.clone().multiplyScalar(Math.pow(s / seg, 1.7) * 0.55);
      for (let j = 0; j <= rad; j++) {
        const idx = (s * (rad + 1) + j) * 3;
        col[idx] = c.r;
        col[idx + 1] = c.g;
        col[idx + 2] = c.b;
      }
    }
    tube.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const t1 = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0.3)).normalize();
    const t2 = new THREE.Vector3().crossVectors(n, t1).normalize();
    const shards = Array.from({ length: big ? 8 : 5 }, () => {
      const ang = r() * Math.PI * 2;
      const dir = t1.clone().multiplyScalar(Math.cos(ang)).addScaledVector(t2, Math.sin(ang)).addScaledVector(n, 0.4 + r() * 0.8).normalize().multiplyScalar(0.3 + r() * 0.5);
      return { dir, rot: [r() * 6, r() * 6, r() * 6] as V3, s: 0.03 + r() * 0.04 };
    });
    arcs.push({
      curve,
      tube,
      hit,
      q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n),
      period: 1.5 + r() * 1.1,
      phase: r(),
      big,
      shards,
    });
  }
  return arcs;
};

const ArcFx: React.FC<{ a: Arc; t: number; k: number }> = ({ a, t, k }) => {
  const u = (t / a.period + a.phase) % 1;
  const FLY = 0.72;
  const fly = u < FLY ? u / FLY : 1;
  const head = a.curve.getPoint(Math.min(1, fly * fly * 0.4 + fly * 0.6));
  const hitK = u >= FLY ? (u - FLY) / (1 - FLY) : 0; // 0..1 after impact
  const flash = u >= FLY ? Math.exp(-hitK * 5) : 0;
  const glow = glowTexture();
  return (
    <group>
      <mesh geometry={a.tube}>
        <meshBasicMaterial vertexColors transparent opacity={k} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {u < FLY && (
        <sprite position={head} scale={a.big ? [0.42, 0.42, 1] : [0.3, 0.3, 1]}>
          <spriteMaterial map={glow} color="#ff5a3c" transparent opacity={k} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      )}
      {flash > 0.01 && (
        <group>
          <mesh position={a.hit} quaternion={a.q}>
            <circleGeometry args={[a.big ? 0.26 : 0.18, 6]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={0.6 * flash * k} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <mesh position={a.hit} quaternion={a.q} scale={1 + hitK * 1.6}>
            <ringGeometry args={[0.2, 0.24, 6]} />
            <meshBasicMaterial color={C.hudCyan} transparent opacity={0.9 * flash * k} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <sprite position={a.hit} scale={a.big ? [0.9, 0.9, 1] : [0.6, 0.6, 1]}>
            <spriteMaterial map={glow} color="#ff6a3c" transparent opacity={0.9 * flash * k} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      )}
      {hitK > 0 &&
        k > 0.05 &&
        a.shards.map((s, i) => (
          <mesh key={i} position={a.hit.clone().addScaledVector(s.dir, hitK)} rotation={[s.rot[0] + hitK * 4, s.rot[1], s.rot[2] + hitK * 3]} scale={s.s * (1 - hitK * 0.7)}>
            <tetrahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#ff4a3a" emissive={RED} emissiveIntensity={0.5} roughness={0.4} metalness={0.2} flatShading transparent opacity={(1 - hitK) * k} />
          </mesh>
        ))}
    </group>
  );
};

export const Attacks: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const arcs = useMemo(makeArcs, []);
  if (k <= 0.01) return null;
  return (
    <group>
      {arcs.map((a, i) => (
        <ArcFx key={i} a={a} t={t} k={k} />
      ))}
    </group>
  );
};

// ---------- bank hologram (generic, no logos) ----------
const HOLO_GREEN = "#19d98a";
export const Bank: React.FC<{ t: number; glow: number }> = ({ t, glow }) => {
  const pedTri = useMemo(() => {
    const s = new THREE.Shape([new THREE.Vector2(-0.46, 0), new THREE.Vector2(0.46, 0), new THREE.Vector2(0, 0.22)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
    g.translate(0, 0, -0.15);
    return g;
  }, []);
  const edgeTri = useMemo(() => new THREE.EdgesGeometry(pedTri), [pedTri]);
  const bob = Math.sin(t * 3) * 0.02;
  const mat = <meshStandardMaterial color="#10a86c" emissive={HOLO_GREEN} emissiveIntensity={0.35 + glow * 0.25} roughness={0.35} metalness={0.3} flatShading />;
  return (
    <group position={BANK_POS}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 0.18, 48, 1, true]} />
        <meshBasicMaterial color={C.matrixLime} transparent opacity={0.16 + glow * 0.1} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <group position={[0, 0.14, 0]} scale={0.85}>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1 + glow * 0.15 * (0.5 + 0.5 * Math.sin(t * 6))}>
          <ringGeometry args={[0.44, 0.48, 64]} />
          <meshBasicMaterial color={C.matrixLime} transparent opacity={0.85} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.44, 64]} />
          <meshBasicMaterial color={C.matrixLime} transparent opacity={0.12 + glow * 0.1} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <group position={[0, 0.3 + bob, 0]} rotation={[-0.6, 0, 0]} scale={1.12}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <RoundedBoxGeo args={[1.0, 0.06, 0.5]} radius={0.015} segments={2} />
          {mat}
        </mesh>
        <mesh position={[0, 0.09, 0]} castShadow>
          <RoundedBoxGeo args={[0.9, 0.06, 0.42]} radius={0.015} segments={2} />
          {mat}
        </mesh>
        {[-0.36, -0.22, 0.22, 0.36].map((cx) => (
          <mesh key={cx} position={[cx, 0.32, 0.12]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.4, 8]} />
            {mat}
          </mesh>
        ))}
        <mesh position={[0, 0.32, -0.06]} castShadow>
          <RoundedBoxGeo args={[0.78, 0.4, 0.18]} radius={0.02} segments={2} />
          <meshStandardMaterial color="#0b6e4a" emissive={HOLO_GREEN} emissiveIntensity={0.2} roughness={0.4} metalness={0.3} flatShading />
        </mesh>
        <group position={[0, 0.32, 0.035]} rotation={[0, 0, t * 0.6]}>
          <mesh>
            <torusGeometry args={[0.12, 0.022, 8, 32]} />
            <meshBasicMaterial color="#c8ffe4" toneMapped={false} />
          </mesh>
          {[0, 1, 2, 3].map((kk) => (
            <mesh key={kk} rotation={[0, 0, (Math.PI / 4) * kk]}>
              <boxGeometry args={[0.22, 0.014, 0.01]} />
              <meshBasicMaterial color="#c8ffe4" toneMapped={false} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0.56, 0.02]} castShadow>
          <RoundedBoxGeo args={[0.96, 0.08, 0.36]} radius={0.015} segments={2} />
          {mat}
        </mesh>
        <group position={[0, 0.6, 0.02]}>
          <mesh geometry={pedTri} castShadow>
            {mat}
          </mesh>
          <lineSegments geometry={edgeTri}>
            <lineBasicMaterial color="#c8ffe4" toneMapped={false} />
          </lineSegments>
        </group>
        <sprite position={[0, 0.3, 0]} scale={[1.6, 1.6, 1]}>
          <spriteMaterial map={glowTexture()} color={C.matrixLime} transparent opacity={0.22 + glow * 0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      </group>
    </group>
  );
};

// ---------- data bars (three numbers, three scopes) ----------
export type BarSpec = { x: number; value: number; color: string; big: string; l1: string; l2: string; grow: number; check: number };
const PER = 0.32; // world units per juta
const BAR_Z = 1.0;
const LABEL_FACE = new THREE.Vector3(0, 4.2, 14);

const BarLabel: React.FC<{ spec: BarSpec; top: number; on: number }> = ({ spec, top, on }) => {
  const ref = useRef<THREE.Mesh>(null);
  const tex = labelTexture(spec.big, spec.l1, spec.l2, spec.color);
  useLayoutEffect(() => {
    ref.current?.lookAt(LABEL_FACE);
  });
  return (
    <mesh ref={ref} position={[spec.x, top + 0.62, BAR_Z]} scale={0.85 + on * 0.15}>
      <planeGeometry args={[1.42, 1.0]} />
      <meshBasicMaterial map={tex} transparent opacity={on} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

export const Bars: React.FC<{ specs: BarSpec[]; k: number }> = ({ specs, k }) => {
  if (k <= 0.01) return null;
  return (
    <group>
      {specs.map((b) => {
        const g = smooth(b.grow);
        const h = Math.max(0.001, b.value * PER * g);
        return (
          <group key={b.x}>
            <mesh position={[b.x, 0.15 + h / 2, BAR_Z]} castShadow>
              <RoundedBoxGeo args={[0.62, h, 0.62]} radius={Math.min(0.04, h / 2.2)} segments={2} />
              <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.35} roughness={0.3} metalness={0.4} flatShading transparent opacity={0.88 * k} />
            </mesh>
            <mesh position={[b.x, 0.15 + h / 2, BAR_Z]} scale={[1.01, 1.0, 1.01]}>
              <boxGeometry args={[0.62, h, 0.62]} />
              <meshBasicMaterial color={C.hudCyan} wireframe transparent opacity={0.7 * k} toneMapped={false} />
            </mesh>
            {/* base plate */}
            <mesh position={[b.x, 0.13, BAR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.42, 0.47, 6]} />
              <meshBasicMaterial color={b.color} transparent opacity={0.9 * k * g} toneMapped={false} />
            </mesh>
            <BarLabel spec={b} top={0.15 + h} on={Math.min(k, smooth((b.grow - 0.3) / 0.5))} />
          </group>
        );
      })}
    </group>
  );
};

// ---------- floating agency node (text only, no logos) ----------
export const AgencyNode: React.FC<{ pos: V3; text: string; color: string; on: number; t: number }> = ({ pos, text, color, on, t }) => {
  const ref = useRef<THREE.Mesh>(null);
  const tex = nodeTexture(text, color);
  const linkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...pos), new THREE.Vector3(BANK_POS[0], 0.75, BANK_POS[2])]);
    return g;
  }, [pos]);
  useLayoutEffect(() => {
    ref.current?.lookAt(new THREE.Vector3(pos[0], pos[1] + 2.0, pos[2] + 4.5));
  });
  if (on <= 0.01) return null;
  const pulse = (t * 1.4) % 1;
  const along = new THREE.Vector3(...pos).lerp(new THREE.Vector3(BANK_POS[0], 0.75, BANK_POS[2]), pulse);
  return (
    <group>
      <lineSegments geometry={linkGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.8 * on} toneMapped={false} />
      </lineSegments>
      <sprite position={along} scale={[0.22, 0.22, 1]}>
        <spriteMaterial map={glowTexture()} color={color} transparent opacity={on} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <mesh ref={ref} position={pos} scale={0.7 + 0.3 * on}>
        <planeGeometry args={[1.1, 0.5]} />
        <meshBasicMaterial map={tex} transparent opacity={on} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- suspicious transaction packet ----------
export const TxPacket: React.FC<{ t: number; a: number; flag: number; hold: number; verify: number }> = ({ t, a, flag, hold, verify }) => {
  if (a <= 0) return null;
  const from = new THREE.Vector3(1.4, 0.3, 1.1);
  const to = new THREE.Vector3(BANK_POS[0] + 0.62, 0.3, BANK_POS[2] + 0.28);
  const p = from.clone().lerp(to, smooth(a));
  const col = new THREE.Color("#ffaa00").lerp(new THREE.Color(RED), flag).lerp(new THREE.Color("#19d98a"), verify > 0.85 ? (verify - 0.85) / 0.15 : 0);
  return (
    <group position={p}>
      <mesh rotation={[0.4, t * (1 - hold) * 2, 0.2]} castShadow>
        <RoundedBoxGeo args={[0.16, 0.16, 0.16]} radius={0.03} segments={2} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} roughness={0.3} metalness={0.3} flatShading />
      </mesh>
      {flag > 0.01 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} scale={1 + 0.2 * Math.sin(t * 10)}>
          <ringGeometry args={[0.16, 0.2, 32]} />
          <meshBasicMaterial color={RED} transparent opacity={flag * (1 - verify)} toneMapped={false} />
        </mesh>
      )}
      {verify > 0.01 && (
        <group rotation={[0, t * 4, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3 * Math.sin(verify * Math.PI * 2) * 0.3, 0]}>
            <torusGeometry args={[0.2, 0.012, 8, 40, Math.PI * 1.5]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={verify} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ---------- 151 response-team tokens ----------
const RINGS = [
  { r: 0.78, n: 40 },
  { r: 0.98, n: 51 },
  { r: 1.18, n: 60 },
];
export const TeamTokens: React.FC<{ show: number; k: number }> = ({ show, k }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    RINGS.forEach(({ r, n }, ri) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ri * 0.13;
        out.push({ x: BANK_POS[0] + Math.cos(a) * r, z: BANK_POS[2] + Math.sin(a) * r * 0.92 });
      }
    });
    return out;
  }, []);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7fe9ff", emissive: C.cyan, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.3, flatShading: true }), []);
  const m = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    slots.forEach((s, i) => {
      const appear = clamp01(show * 151 - i);
      const sc = appear * k + 0.0001;
      m.position.set(s.x, 0.17 + (1 - appear) * 0.3, s.z);
      m.scale.set(sc, sc, sc);
      m.updateMatrix();
      im.setMatrixAt(i, m.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, 151]} frustumCulled={false} />;
};
