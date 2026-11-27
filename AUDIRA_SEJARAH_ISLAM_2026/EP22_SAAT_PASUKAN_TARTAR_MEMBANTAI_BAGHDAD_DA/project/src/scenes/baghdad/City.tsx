// Baghdad 1258 on the war table: the Round City (double ring wall, four gates), the Tigris as a
// 3D water ribbon through its east side, flat-roofed houses, and four landmarks on one north-south
// line (mosque, palace, library, hospital) so s5 can track sideways past them. Each landmark dims
// and sinks on its own VO word. No human figures.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Banner } from "./Banner.tsx";
import { CUE } from "./cues.ts";
import { BAGHDAD, TIGRIS_LL, geo } from "./geo.ts";
import { lin, ss } from "./timing.ts";
import { SHEET_Y, hAt } from "./World.tsx";

export const CITY: [number, number] = [BAGHDAD[0] - 0.25, BAGHDAD[1]];
export const CITY_R = 0.62;
const LX = CITY[0] - 0.18; // landmark line (west of the river)
export const LANDMARKS = {
  masjid: [LX, CITY[1] - 0.3] as [number, number],
  istana: [LX, CITY[1] - 0.06] as [number, number],
  perpus: [LX, CITY[1] + 0.18] as [number, number],
  rs: [LX, CITY[1] + 0.42] as [number, number],
};
export const SOUTH_GATE: [number, number] = [CITY[0], CITY[1] + CITY_R];
const gy = (x: number, z: number) => SHEET_Y + hAt(x, z);
const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---- Tigris ribbon (also the base for the s4 flood) -------------------------------------------
const riverPts = (() => {
  let c: THREE.CatmullRomCurve3 | null = null;
  return () => {
    if (c) return c;
    const pts = TIGRIS_LL.slice(2, 11).map(([lo, la]) => { const [x, z] = geo(lo, la); return new THREE.Vector3(x, 0, z); });
    return (c = new THREE.CatmullRomCurve3(pts));
  };
})();
/** Distance from a table point to the river centre line (cheap polyline sample). */
const RIVER_S = (() => { const c = riverPts(); return c.getSpacedPoints(160); })();
export const riverDist = (x: number, z: number) => {
  let d = Infinity;
  for (const p of RIVER_S) d = Math.min(d, Math.hypot(p.x - x, p.z - z));
  return d;
};

const RiverRibbon: React.FC<{ dark?: number }> = ({ dark = 0 }) => {
  const geom = useMemo(() => {
    const c = riverPts();
    const N = 240, w = 0.075;
    const pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = c.getPointAt(u), tg = c.getTangentAt(u);
      const nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1;
      for (const s of [-1, 1]) {
        const x = p.x + (s * w * nx) / l, z = p.z + (s * w * nz) / l;
        pos.push(x, gy(x, z) + 0.012, z);
      }
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  const col = new THREE.Color("#2f6a98").lerp(new THREE.Color("#10141c"), dark);
  return (
    <mesh geometry={geom} receiveShadow>
      <meshPhysicalMaterial color={col} roughness={0.12} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
    </mesh>
  );
};

// ---- walls ----------------------------------------------------------------------------------
const ringGeo = (r: number, th: number, h: number) =>
  new THREE.LatheGeometry([new THREE.Vector2(r - th, 0), new THREE.Vector2(r + th, 0), new THREE.Vector2(r + th * 0.8, h), new THREE.Vector2(r - th * 0.8, h), new THREE.Vector2(r - th, 0)], 96);

const Walls: React.FC = () => {
  const outer = useMemo(() => ringGeo(CITY_R, 0.022, 0.085), []);
  const inner = useMemo(() => ringGeo(CITY_R * 0.62, 0.014, 0.06), []);
  const y = gy(CITY[0], CITY[1]);
  return (
    <group position={[CITY[0], y, CITY[1]]}>
      <mesh geometry={outer} castShadow receiveShadow>
        <meshStandardMaterial color="#c9a273" roughness={0.88} />
      </mesh>
      <mesh geometry={inner} castShadow receiveShadow>
        <meshStandardMaterial color="#d4b083" roughness={0.88} />
      </mesh>
      {[0.25, 0.25 + Math.PI / 2, 0.25 + Math.PI, 0.25 + (3 * Math.PI) / 2].map((a, i) => (
        <group key={i} position={[Math.sin(a) * CITY_R, 0, Math.cos(a) * CITY_R]} rotation={[0, a, 0]}>
          {[-0.05, 0.05].map((dx) => (
            <mesh key={dx} position={[dx, 0.07, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.036, 0.14, 14]} />
              <meshStandardMaterial color="#b78f62" roughness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.035, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#2f8f86" roughness={0.35} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---- houses (instanced) -----------------------------------------------------------------------
const Houses: React.FC<{ dim: number }> = ({ dim }) => {
  const { mesh } = useMemo(() => {
    const r = prng(1258);
    const mats: THREE.Matrix4[] = [];
    const lm = Object.values(LANDMARKS);
    let tries = 0;
    while (mats.length < 230 && tries++ < 4000) {
      const a = r() * Math.PI * 2;
      const rr = Math.sqrt(r()) * (CITY_R + 0.55);
      const x = CITY[0] + Math.sin(a) * rr, z = CITY[1] + Math.cos(a) * rr;
      if (riverDist(x, z) < 0.12) continue;
      if (Math.abs(rr - CITY_R) < 0.06 || Math.abs(rr - CITY_R * 0.62) < 0.04) continue;
      if (lm.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 0.12)) continue;
      if (rr > CITY_R + 0.05 && r() < 0.55) continue; // thinner outside the wall
      const w = 0.035 + r() * 0.04, d = 0.035 + r() * 0.04, h = 0.03 + r() * 0.04;
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(x, gy(x, z) + h / 2, z),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a + (r() - 0.5) * 0.4),
        new THREE.Vector3(w, h, d),
      );
      mats.push(m);
    }
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 });
    const im = new THREE.InstancedMesh(geom, mat, mats.length);
    mats.forEach((m, i) => im.setMatrixAt(i, m));
    const c = new THREE.Color();
    for (let i = 0; i < mats.length; i++) im.setColorAt(i, c.setHSL(0.09, 0.32, 0.62 + (r() - 0.5) * 0.14));
    im.castShadow = true;
    im.receiveShadow = true;
    return { mesh: im };
  }, []);
  (mesh.material as THREE.MeshStandardMaterial).color.setScalar(1 - 0.45 * dim);
  return <primitive object={mesh} />;
};

// ---- landmarks --------------------------------------------------------------------------------
const Dome: React.FC<{ r: number; color: string; y: number; glow?: number }> = ({ r, color, y, glow = 0 }) => {
  const geom = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 0.5;
      // slightly pointed onion profile
      pts.push(new THREE.Vector2(Math.cos(a) * r * (1 + 0.12 * Math.sin(a * 2)), Math.sin(a) * r * 1.25));
    }
    pts.push(new THREE.Vector2(0, r * 1.38));
    return new THREE.LatheGeometry(pts, 40);
  }, [r]);
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geom} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.28} metalness={0.25} clearcoat={0.8} emissive={color} emissiveIntensity={glow} />
      </mesh>
      <mesh position={[0, r * 1.42, 0]}>
        <sphereGeometry args={[r * 0.08, 10, 8]} />
        <meshStandardMaterial color="#e2bd62" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
};

const SAND = "#dcc092";
const Block: React.FC<{ w: number; h: number; d: number; y?: number; color?: string }> = ({ w, h, d, y = 0, color = SAND }) => (
  <mesh position={[0, y + h / 2, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={[w, h, d]} radius={Math.min(w, h, d) * 0.12} />
    <meshStandardMaterial color={color} roughness={0.85} />
  </mesh>
);

const Mosque: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <Block w={0.2} h={0.06} d={0.2} />
    <Block w={0.13} h={0.04} d={0.13} y={0.06} />
    <Dome r={0.06} color="#2fa39a" y={0.1} glow={glow} />
    <group position={[0.085, 0, -0.085]}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.26, 12]} />
        <meshStandardMaterial color="#e3cfa6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.012, 12]} />
        <meshStandardMaterial color="#c9a14e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.275, 0]} castShadow>
        <coneGeometry args={[0.014, 0.04, 12]} />
        <meshStandardMaterial color="#2fa39a" roughness={0.3} />
      </mesh>
    </group>
  </group>
);
const Palace: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <Block w={0.22} h={0.08} d={0.16} />
    <Block w={0.1} h={0.06} d={0.1} y={0.08} />
    <Dome r={0.065} color="#3f8f58" y={0.14} glow={glow} />
    {[-0.1, 0.1].map((x) => (
      <group key={x} position={[x, 0, 0.07]}>
        <Block w={0.04} h={0.12} d={0.04} color="#cfae7e" />
      </group>
    ))}
  </group>
);
const Library: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <Block w={0.2} h={0.02} d={0.14} color="#cdb183" />
    {[-0.08, -0.04, 0, 0.04, 0.08].map((x) =>
      [-0.055, 0.055].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.055, z]} castShadow>
          <cylinderGeometry args={[0.007, 0.008, 0.07, 10]} />
          <meshStandardMaterial color="#efdcb8" roughness={0.6} />
        </mesh>
      )),
    )}
    <Block w={0.21} h={0.02} d={0.15} y={0.09} color="#c2a170" />
    <Block w={0.12} h={0.05} d={0.08} y={0.02} color="#8c6a42" />
    <mesh position={[0, 0.05, 0]}>
      <boxGeometry args={[0.1, 0.03, 0.082]} />
      <meshStandardMaterial color="#ffb85a" emissive="#ffb85a" emissiveIntensity={0.4 + glow} />
    </mesh>
  </group>
);
const Hospital: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    {/* courtyard ring of rooms around a small pool */}
    <Block w={0.2} h={0.05} d={0.04} y={0} />
    <group position={[0, 0, 0.16]}><Block w={0.2} h={0.05} d={0.04} /></group>
    <group position={[-0.08, 0, 0.08]}><Block w={0.04} h={0.05} d={0.12} /></group>
    <group position={[0.08, 0, 0.08]}><Block w={0.04} h={0.05} d={0.12} /></group>
    <mesh position={[0, 0.006, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.035, 24]} />
      <meshPhysicalMaterial color="#3d86b0" roughness={0.1} clearcoat={1} />
    </mesh>
    {[-0.06, 0.06].map((x) => (
      <group key={x} position={[x, 0, 0]}>
        <Dome r={0.028} color="#d8c29a" y={0.05} glow={glow * 0.5} />
      </group>
    ))}
  </group>
);

/** ruin 0..1: building dims, tilts and sinks into the sheet. */
const Ruinable: React.FC<{ at: [number, number]; ruin: number; yaw?: number; scale?: number; children: React.ReactNode }> = ({ at, ruin, yaw = 0, scale = 1, children }) => {
  const y = gy(at[0], at[1]);
  return (
    <group position={[at[0], y - ruin * 0.09 * scale, at[1]]} rotation={[ruin * 0.18, yaw, ruin * -0.12]} scale={[scale, scale * (1 - ruin * 0.55), scale]}>
      {children}
      {ruin > 0.01 ? (
        <mesh position={[0, 0.06 * scale, 0]}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshBasicMaterial color="#120c08" transparent opacity={ruin * 0.55} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

export const ruinAt = (t: number) => ({
  masjid: ss(CUE.masjid, CUE.masjid + 1.1, t),
  istana: ss(CUE.istana + 0.3, CUE.istana + 1.4, t),
  perpus: ss(CUE.perpus, CUE.perpus + 1.2, t),
  rs: ss(CUE.rs, CUE.rs + 1.2, t),
});

export const City: React.FC<{ t: number }> = ({ t }) => {
  const r = ruinAt(t);
  const after = t > 61; // stays ruined until the dawn rebuild glow in s8
  const heal = ss(80.4, 84, t);
  const k = (v: number) => (after ? v * (1 - heal) : v);
  const glowHook = 0.35 * (1 - ss(CUE.selamat, CUE.selamat + 1.2, t)) + 0.3 * heal;
  const dim = Math.max(0, ss(CUE.masuk, CUE.sepekan + 1, t) * 0.6 * (1 - heal));
  const palaceBanner = lin(CUE.selamat - 0.1, CUE.selamat + 0.9, t);
  return (
    <group>
      <RiverRibbon dark={0} />
      <Walls />
      <Houses dim={dim} />
      <Ruinable at={LANDMARKS.masjid} ruin={k(r.masjid)} scale={1.25}><Mosque glow={glowHook} /></Ruinable>
      <Ruinable at={LANDMARKS.istana} ruin={k(r.istana)} scale={1.3}><Palace glow={glowHook} /></Ruinable>
      <Ruinable at={LANDMARKS.perpus} ruin={k(r.perpus)} scale={1.25} yaw={Math.PI / 2}><Library glow={glowHook} /></Ruinable>
      <Ruinable at={LANDMARKS.rs} ruin={k(r.rs)} scale={1.25}><Hospital glow={glowHook} /></Ruinable>
      {/* black Abbasid banner on the palace: falls on "tidak selamat" */}
      {t < 34 || t > 80 ? (
        <Banner t={t} color="#151515" position={[LANDMARKS.istana[0] + 0.12, gy(...LANDMARKS.istana) + 0.02, LANDMARKS.istana[1] - 0.08]}
          h={0.42} w={0.2} ch={0.13} yaw={-0.6} fall={t > 80 ? 0 : palaceBanner} fallYaw={0.4} glow={0.05} seed={2} />
      ) : null}
    </group>
  );
};
