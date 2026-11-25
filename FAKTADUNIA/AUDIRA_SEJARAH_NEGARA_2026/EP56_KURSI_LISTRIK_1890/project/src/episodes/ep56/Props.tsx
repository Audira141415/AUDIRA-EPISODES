// EP56 Kursi Listrik 1890 — procedural period props (wood, brass, copper) for VINTAGEFORGE.
// Every prop is a built object (frame, coil, dial, straps), never a bare floating cube.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";

export const C = {
  wood: "#6b4423",
  woodDark: "#3f2716",
  brass: "#C5A059",
  copper: "#B87333",
  iron: "#2b2a28",
  leather: "#2e1c10",
  parchment: "#F3EAD6",
  ink: "#1E1B18",
  terracotta: "#B85A3F",
  verdigris: "#52796F",
  velvet: "#6e2a22",
};

/** Deterministic pseudo-random in [0,1). */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const sm = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// ---------- materials ----------
export const Brass: React.FC<{ emissive?: number }> = ({ emissive = 0 }) => (
  <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.34} clearcoat={0.3} envMapIntensity={3} emissive={C.brass} emissiveIntensity={emissive} />
);
export const Copper: React.FC<{ glow?: number; glowColor?: string }> = ({ glow = 0, glowColor = "#ffb066" }) => (
  <meshPhysicalMaterial color={C.copper} metalness={1} roughness={0.3} clearcoat={0.2} envMapIntensity={2.6} emissive={glowColor} emissiveIntensity={glow} />
);
export const Iron: React.FC = () => <meshPhysicalMaterial color={C.iron} metalness={0.8} roughness={0.5} envMapIntensity={1.6} />;
export const Wood: React.FC<{ color?: string; seed?: number }> = ({ color = C.wood, seed = 3 }) => {
  const grain = useSurfaceGrain(seed, 0.28, 2);
  return <meshPhysicalMaterial color={color} roughness={0.58} clearcoat={0.25} clearcoatRoughness={0.5} roughnessMap={grain} bumpMap={grain} bumpScale={0.02} />;
};
export const Leather: React.FC = () => <meshPhysicalMaterial color={C.leather} roughness={0.78} sheen={0.4} sheenColor="#6b4a30" />;
export const Velvet: React.FC = () => <meshPhysicalMaterial color={C.velvet} roughness={0.9} sheen={1} sheenColor="#c46a52" />;
export const Paper: React.FC<{ map?: THREE.Texture }> = ({ map }) => <meshStandardMaterial color={map ? "#ffffff" : C.parchment} map={map} roughness={0.85} />;

// ---------- text labels painted on canvas (deterministic, no font fetch) ----------
export function useLabelTexture(
  lines: string[],
  opts: { w: number; h: number; bg?: string; fg?: string; border?: string; italic?: boolean; stamp?: boolean } ,
) {
  const { w, h, bg = C.parchment, fg = C.ink, border, italic, stamp } = opts;
  return useMemo(() => {
    const W = 1024;
    const H = Math.max(64, Math.round((W * h) / w));
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    if (bg !== "transparent") {
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      // age stains
      for (let i = 0; i < 14; i++) {
        g.fillStyle = `rgba(120,80,40,${0.03 + rnd(i + lines.length) * 0.05})`;
        g.beginPath();
        g.arc(rnd(i * 3) * W, rnd(i * 7) * H, 30 + rnd(i * 11) * 120, 0, Math.PI * 2);
        g.fill();
      }
    }
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = Math.max(8, H * 0.04);
      g.strokeRect(g.lineWidth, g.lineWidth, W - g.lineWidth * 2, H - g.lineWidth * 2);
    }
    if (stamp) {
      g.strokeStyle = fg;
      g.lineWidth = H * 0.06;
      g.beginPath();
      g.ellipse(W / 2, H / 2, W * 0.46, H * 0.4, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const n = lines.length;
    lines.forEach((line, i) => {
      let size = (H / n) * 0.62;
      g.font = `${italic ? "italic " : ""}700 ${size}px Georgia, "Times New Roman", serif`;
      const max = W * 0.86;
      const m = g.measureText(line).width;
      if (m > max) {
        size *= max / m;
        g.font = `${italic ? "italic " : ""}700 ${size}px Georgia, "Times New Roman", serif`;
      }
      g.fillText(line, W / 2, (H / n) * (i + 0.5));
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.join("|"), w, h, bg, fg, border, italic, stamp]);
}

export const Label: React.FC<{
  lines: string[];
  w: number;
  h: number;
  bg?: string;
  fg?: string;
  border?: string;
  italic?: boolean;
  stamp?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  opacity?: number;
  emissive?: number;
}> = ({ lines, w, h, bg, fg, border, italic, stamp, position, rotation, opacity = 1, emissive = 0 }) => {
  const tex = useLabelTexture(lines, { w, h, bg, fg, border, italic, stamp });
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        map={tex}
        roughness={0.8}
        transparent={bg === "transparent" || opacity < 1}
        opacity={opacity}
        emissive="#ffffff"
        emissiveMap={tex}
        emissiveIntensity={emissive}
        depthWrite={bg !== "transparent"}
      />
    </mesh>
  );
};

// ---------- cable ----------
export const Cable: React.FC<{ points: [number, number, number][]; r?: number; glow?: number; glowColor?: string; seg?: number }> = ({
  points,
  r = 0.09,
  glow = 0,
  glowColor,
  seg = 64,
}) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, seg, r, 10, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), r, seg]);
  return (
    <mesh geometry={geo} castShadow>
      <Copper glow={glow} glowColor={glowColor} />
    </mesh>
  );
};

// ---------- electric arc (jagged, regenerated every 2 frames, deterministic) ----------
export const Arc: React.FC<{ from: [number, number, number]; to: [number, number, number]; frame: number; intensity?: number; color?: string }> = ({
  from,
  to,
  frame,
  intensity = 1,
  color = "#ffd7a0",
}) => {
  const step = Math.floor(frame / 2);
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const pts: THREE.Vector3[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const p = a.clone().lerp(b, i / n);
      if (i > 0 && i < n) {
        p.x += (rnd(step * 13 + i) - 0.5) * 0.5;
        p.y += (rnd(step * 17 + i) - 0.5) * 0.5;
        p.z += (rnd(step * 19 + i) - 0.5) * 0.3;
      }
      pts.push(p);
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), 40, 0.035, 6, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, JSON.stringify(from), JSON.stringify(to)]);
  if (intensity <= 0.01) return null;
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={Math.min(1, intensity)} />
      </mesh>
      <pointLight position={from.map((v, i) => (v + to[i]) / 2) as [number, number, number]} color="#ffc27a" intensity={18 * intensity} distance={12} decay={1.6} />
    </group>
  );
};

/** Small sparks flying from a point (accent only). */
export const Sparks: React.FC<{ at: [number, number, number]; t: number; seed?: number; count?: number }> = ({ at, t, seed = 1, count = 10 }) => {
  const burst = t % 0.9;
  const k = Math.floor(t / 0.9);
  return (
    <group position={at}>
      {Array.from({ length: count }, (_, i) => {
        const s = seed * 100 + k * 31 + i;
        const dir = new THREE.Vector3(rnd(s) - 0.5, rnd(s + 1) * 0.8 + 0.2, rnd(s + 2) - 0.5).normalize();
        const d = burst * (2 + rnd(s + 3) * 2);
        const fall = burst * burst * 3;
        const life = 1 - burst / 0.9;
        return (
          <mesh key={i} position={[dir.x * d, dir.y * d - fall, dir.z * d]} scale={0.05 + life * 0.05}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color="#ffd08a" toneMapped={false} transparent opacity={life} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- execution chair (always empty) ----------
export const ExecChair: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <group>
    {/* platform */}
    <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
      <RoundedBoxGeo args={[4.2, 0.3, 4.2]} radius={0.06} />
      <Wood color={C.woodDark} seed={5} />
    </mesh>
    {/* legs */}
    {[
      [-1.1, -1.0],
      [1.1, -1.0],
      [-1.1, 1.0],
      [1.1, 1.0],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x, 1.25, z]} castShadow>
        <RoundedBoxGeo args={[0.34, 1.9, 0.34]} radius={0.05} />
        <Wood seed={7 + i} />
      </mesh>
    ))}
    {/* seat */}
    <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[2.7, 0.3, 2.5]} radius={0.08} />
      <Wood seed={11} />
    </mesh>
    {/* back: two posts + slats */}
    {[-1.15, 1.15].map((x, i) => (
      <mesh key={i} position={[x, 4.2, -1.1]} castShadow>
        <RoundedBoxGeo args={[0.32, 4.0, 0.32]} radius={0.05} />
        <Wood seed={13 + i} />
      </mesh>
    ))}
    {[3.0, 4.0, 5.0, 5.9].map((y, i) => (
      <mesh key={i} position={[0, y, -1.1]} castShadow>
        <RoundedBoxGeo args={[2.3, 0.42, 0.18]} radius={0.04} />
        <Wood seed={17 + i} color={i === 3 ? C.woodDark : C.wood} />
      </mesh>
    ))}
    {/* arms */}
    {[-1.3, 1.3].map((x, i) => (
      <group key={i}>
        <mesh position={[x, 3.15, 0.05]} castShadow>
          <RoundedBoxGeo args={[0.36, 0.22, 2.5]} radius={0.06} />
          <Wood seed={21 + i} />
        </mesh>
        <mesh position={[x, 2.7, 1.05]} castShadow>
          <RoundedBoxGeo args={[0.26, 0.9, 0.26]} radius={0.05} />
          <Wood seed={23 + i} />
        </mesh>
        {/* leather strap + brass buckle on the arm */}
        <mesh position={[x, 3.16, 0.4]}>
          <RoundedBoxGeo args={[0.44, 0.27, 0.34]} radius={0.04} />
          <Leather />
        </mesh>
        <mesh position={[x + (i ? 0.23 : -0.23), 3.16, 0.4]}>
          <boxGeometry args={[0.04, 0.2, 0.2]} />
          <Brass />
        </mesh>
        {/* leg strap */}
        <mesh position={[x * 0.85, 1.5, 1.0]}>
          <RoundedBoxGeo args={[0.5, 0.24, 0.5]} radius={0.04} />
          <Leather />
        </mesh>
      </group>
    ))}
    {/* chest strap across back */}
    <mesh position={[0, 3.6, -0.98]}>
      <RoundedBoxGeo args={[2.5, 0.3, 0.08]} radius={0.03} />
      <Leather />
    </mesh>
    {/* head electrode on an adjustable brass rod */}
    <mesh position={[0, 6.7, -1.1]} castShadow>
      <cylinderGeometry args={[0.06, 0.06, 1.4, 12]} />
      <Brass />
    </mesh>
    <mesh position={[0, 7.4, -0.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.06, 0.8, 12]} />
      <Brass />
    </mesh>
    <mesh position={[0, 7.05, -0.4]} castShadow>
      <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Brass emissive={glow * 0.6} />
    </mesh>
    <Cable points={[[0, 7.35, -0.5], [0.8, 7.9, -1.4], [2.2, 6.5, -1.8], [3.2, 2.0, -1.5], [4.6, 0.35, -0.8], [7, 0.35, 0.5]]} glow={glow} />
    {/* leg electrode */}
    <mesh position={[0.55, 0.75, 1.15]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.28, 0.32, 0.25, 20]} />
      <Brass emissive={glow * 0.5} />
    </mesh>
    <Cable points={[[0.75, 0.75, 1.2], [2.2, 0.4, 1.6], [4.5, 0.35, 1.2], [7, 0.35, 0.8]]} r={0.07} glow={glow} />
  </group>
);

// ---------- voltmeter ----------
export const Voltmeter: React.FC<{ value: number; jitter?: number; scale?: number; ticks?: string[] }> = ({
  value,
  jitter = 0,
  scale = 1,
  ticks = ["0", "500", "1000", "1500", "2000"],
}) => {
  const face = useLabelTexture([""], { w: 2, h: 2, bg: C.parchment });
  const ang = THREE.MathUtils.degToRad(60 - 120 * Math.min(1, Math.max(0, value))) + jitter;
  return (
    <group scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.2, 0.5, 48]} />
        <Brass />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.26]}>
        <torusGeometry args={[1.08, 0.08, 12, 48]} />
        <Brass />
      </mesh>
      <mesh position={[0, 0, 0.255]}>
        <circleGeometry args={[1.02, 48]} />
        <meshStandardMaterial map={face} roughness={0.7} />
      </mesh>
      {/* tick marks + labels */}
      {ticks.map((tk, i) => {
        const a = THREE.MathUtils.degToRad(60 - (120 * i) / (ticks.length - 1));
        return (
          <group key={i}>
            <mesh position={[-Math.sin(a) * 0.82, Math.cos(a) * 0.82 - 0.25, 0.26]} rotation={[0, 0, a]}>
              <planeGeometry args={[0.04, 0.18]} />
              <meshBasicMaterial color={i === ticks.length - 1 ? C.terracotta : C.ink} />
            </mesh>
            <Label lines={[tk]} w={0.42} h={0.16} bg="transparent" fg={C.ink} position={[-Math.sin(a) * 0.6, Math.cos(a) * 0.6 - 0.25, 0.262]} />
          </group>
        );
      })}
      <Label lines={["VOLT"]} w={0.5} h={0.16} bg="transparent" fg={C.terracotta} italic position={[0, -0.55, 0.262]} />
      {/* needle */}
      <group position={[0, -0.25, 0.27]} rotation={[0, 0, ang]}>
        <mesh position={[0, 0.42, 0]}>
          <planeGeometry args={[0.035, 0.9]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
      </group>
      <mesh position={[0, -0.25, 0.28]}>
        <circleGeometry args={[0.07, 16]} />
        <Brass />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.3]}>
        <circleGeometry args={[1.05, 48]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} transmission={0} clearcoat={1} color="#ffffff" />
      </mesh>
    </group>
  );
};

// ---------- dynamo / generator ----------
export const Dynamo: React.FC<{ spin: number; coil?: string; glow?: number; label?: string }> = ({ spin, coil = C.copper, glow = 0 }) => (
  <group>
    {/* iron bed */}
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[4.4, 0.6, 2.6]} radius={0.08} />
      <Iron />
    </mesh>
    {/* field magnets (two upright horseshoe legs) */}
    {[-0.75, 0.75].map((x, i) => (
      <group key={i}>
        <mesh position={[x, 1.9, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 2.4, 28]} />
          <meshPhysicalMaterial color={coil} metalness={1} roughness={0.36} envMapIntensity={2.4} emissive="#ff9a4a" emissiveIntensity={glow * 0.25} />
        </mesh>
        {/* winding rings */}
        {[1.1, 1.5, 1.9, 2.3, 2.7].map((y, k) => (
          <mesh key={k} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.57, 0.035, 8, 32]} />
            <Copper />
          </mesh>
        ))}
      </group>
    ))}
    <mesh position={[0, 3.35, 0]} castShadow>
      <RoundedBoxGeo args={[2.4, 0.5, 1.3]} radius={0.12} />
      <Iron />
    </mesh>
    {/* armature + shaft */}
    <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.12, 0.12, 4.8, 16]} />
      <Brass />
    </mesh>
    <group position={[0, 1.0, 0]} rotation={[spin, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.0, 24]} />
        <Copper glow={glow * 0.3} />
      </mesh>
    </group>
    {/* flywheel with spokes */}
    <group position={[2.3, 1.55, 0]} rotation={[spin, 0, 0]}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[1.25, 0.13, 12, 48]} />
        <Brass />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <mesh key={k} rotation={[(k * Math.PI) / 3, 0, 0]}>
          <boxGeometry args={[0.08, 2.4, 0.1]} />
          <Iron />
        </mesh>
      ))}
    </group>
    {/* brass bearing posts */}
    {[-1.9, 1.7].map((x, i) => (
      <mesh key={i} position={[x, 0.85, 0]} castShadow>
        <RoundedBoxGeo args={[0.3, 0.6, 0.7]} radius={0.06} />
        <Brass />
      </mesh>
    ))}
    {/* terminals */}
    {[-0.4, 0.4].map((z, i) => (
      <mesh key={i} position={[-2.0, 0.75, z]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
        <Brass emissive={glow * 0.4} />
      </mesh>
    ))}
  </group>
);

// ---------- antique dentist chair ----------
export const DentistChair: React.FC<{ recline: number }> = ({ recline }) => (
  <group>
    <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[1.3, 1.5, 0.24, 40]} />
      <Iron />
    </mesh>
    <mesh position={[0, 1.0, 0]} castShadow>
      <cylinderGeometry args={[0.28, 0.36, 1.6, 24]} />
      <Brass />
    </mesh>
    {/* seat */}
    <mesh position={[0, 2.0, 0.1]} castShadow>
      <RoundedBoxGeo args={[2.2, 0.45, 2.2]} radius={0.18} />
      <Velvet />
    </mesh>
    {/* back, reclining */}
    <group position={[0, 2.2, -0.95]} rotation={[-0.25 - recline * 0.3, 0, 0]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <RoundedBoxGeo args={[2.0, 3.0, 0.4]} radius={0.18} />
        <Velvet />
      </mesh>
      <mesh position={[0, 1.6, -0.25]}>
        <RoundedBoxGeo args={[2.1, 3.1, 0.12]} radius={0.05} />
        <Wood seed={31} />
      </mesh>
      {/* headrest on brass stem */}
      <mesh position={[0, 3.35 + recline * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 10]} />
        <Brass />
      </mesh>
      <mesh position={[0, 3.8 + recline * 0.35, 0.15]} castShadow>
        <RoundedBoxGeo args={[1.0, 0.5, 0.4]} radius={0.15} />
        <Velvet />
      </mesh>
    </group>
    {/* arms */}
    {[-1.15, 1.15].map((x, i) => (
      <mesh key={i} position={[x, 2.75, 0.1]} castShadow>
        <RoundedBoxGeo args={[0.3, 0.2, 2.0]} radius={0.08} />
        <Wood seed={33 + i} />
      </mesh>
    ))}
    {/* footrest */}
    <mesh position={[0, 1.3, 1.6]} rotation={[0.5, 0, 0]} castShadow>
      <RoundedBoxGeo args={[1.6, 0.18, 1.0]} radius={0.06} />
      <Brass />
    </mesh>
  </group>
);

// ---------- gavel + sound block ----------
export const Gavel: React.FC<{ lift: number }> = ({ lift }) => (
  <group>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.0, 1.1, 0.4, 40]} />
      <Wood color={C.woodDark} seed={41} />
    </mesh>
    <group position={[2.6, 0.9, 0]} rotation={[0, 0, 0.15 + lift * 0.9]}>
      <mesh position={[-1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 3.2, 16]} />
        <Wood seed={43} />
      </mesh>
      <mesh position={[-3.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 1.4, 28]} />
        <Wood color={C.woodDark} seed={44} />
      </mesh>
      {[-0.55, 0.55].map((y, i) => (
        <mesh key={i} position={[-3.2, y, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.12, 28]} />
          <Brass />
        </mesh>
      ))}
    </group>
  </group>
);

// ---------- stopwatch ----------
export const Stopwatch: React.FC<{ sec: number }> = ({ sec }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.75, 0.75, 0.25, 40]} />
      <Brass />
    </mesh>
    <mesh position={[0, 0.9, 0]}>
      <torusGeometry args={[0.18, 0.05, 8, 20]} />
      <Brass />
    </mesh>
    <mesh position={[0, 0, 0.13]}>
      <circleGeometry args={[0.66, 40]} />
      <meshStandardMaterial color={C.parchment} roughness={0.7} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(a) * 0.56, Math.cos(a) * 0.56, 0.135]} rotation={[0, 0, -a]}>
          <planeGeometry args={[0.03, 0.1]} />
          <meshBasicMaterial color={C.ink} />
        </mesh>
      );
    })}
    <group position={[0, 0, 0.14]} rotation={[0, 0, (-sec / 60) * Math.PI * 2]}>
      <mesh position={[0, 0.25, 0]}>
        <planeGeometry args={[0.03, 0.5]} />
        <meshBasicMaterial color={C.terracotta} />
      </mesh>
    </group>
  </group>
);

// ---------- big wall clock (hands animate) ----------
export const WallClock: React.FC<{ minutes: number }> = ({ minutes }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[2.3, 2.3, 0.4, 64]} />
      <Wood color={C.woodDark} seed={51} />
    </mesh>
    <mesh position={[0, 0, 0.21]}>
      <torusGeometry args={[2.05, 0.1, 12, 64]} />
      <Brass />
    </mesh>
    <mesh position={[0, 0, 0.205]}>
      <circleGeometry args={[2.0, 64]} />
      <meshStandardMaterial color={C.parchment} roughness={0.75} />
    </mesh>
    {Array.from({ length: 60 }, (_, i) => {
      const a = (i / 60) * Math.PI * 2;
      const big = i % 5 === 0;
      const hl = i < 8;
      return (
        <mesh key={i} position={[Math.sin(a) * 1.78, Math.cos(a) * 1.78, 0.21]} rotation={[0, 0, -a]}>
          <planeGeometry args={[big ? 0.07 : 0.03, big ? 0.3 : 0.14]} />
          <meshBasicMaterial color={hl ? C.terracotta : C.ink} />
        </mesh>
      );
    })}
    {/* elapsed wedge: 8 minutes sweep */}
    <mesh position={[0, 0, 0.207]} rotation={[0, 0, Math.PI / 2]}>
      <circleGeometry args={[1.6, 48, -((Math.min(8, minutes) / 60) * Math.PI * 2), (Math.min(8, minutes) / 60) * Math.PI * 2]} />
      <meshBasicMaterial color={C.terracotta} transparent opacity={0.35} />
    </mesh>
    <group position={[0, 0, 0.23]} rotation={[0, 0, (-minutes / 60) * Math.PI * 2]}>
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[0.08, 1.6]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
    </group>
    <group position={[0, 0, 0.22]} rotation={[0, 0, (-(10 + minutes / 60) / 12) * Math.PI * 2]}>
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[0.12, 1.0]} />
        <meshBasicMaterial color={C.ink} />
      </mesh>
    </group>
    <mesh position={[0, 0, 0.24]}>
      <circleGeometry args={[0.12, 16]} />
      <Brass />
    </mesh>
  </group>
);

// ---------- modern wall socket ----------
export const Socket: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <mesh castShadow>
      <RoundedBoxGeo args={[2.0, 2.0, 0.3]} radius={0.25} />
      <meshPhysicalMaterial color="#efe8da" roughness={0.35} clearcoat={0.6} />
    </mesh>
    <mesh position={[0, 0, 0.16]}>
      <cylinderGeometry args={[0.72, 0.72, 0.06, 40]} />
      <meshPhysicalMaterial color="#e4dccb" roughness={0.4} />
    </mesh>
    {[-0.3, 0.3].map((x, i) => (
      <mesh key={i} position={[x, 0, 0.2]}>
        <circleGeometry args={[0.12, 20]} />
        <meshBasicMaterial color="#1a120a" />
      </mesh>
    ))}
    <mesh position={[0, 0.85, 0.17]}>
      <circleGeometry args={[0.06, 12]} />
      <meshBasicMaterial color="#ffb347" toneMapped={false} transparent opacity={glow} />
    </mesh>
  </group>
);

/** Floor disc so every scene stands on something (wood boards or stone). */
export const Floor: React.FC<{ color?: string; r?: number }> = ({ color = "#2a1c11", r = 40 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <circleGeometry args={[r, 64]} />
    <meshStandardMaterial color={color} roughness={0.85} />
  </mesh>
);

/** Back wall with wainscot panels: gives every room a lit BG plane for depth. */
export const BackWall: React.FC<{ z?: number; color?: string; w?: number; h?: number }> = ({ z = -8, color = "#b8956a", w = 40, h = 20 }) => (
  <group position={[0, 0, z]}>
    <mesh position={[0, h / 2, 0]} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[(i - 4) * 4, 1.6, 0.08]} receiveShadow>
        <RoundedBoxGeo args={[3.4, 2.6, 0.12]} radius={0.05} />
        <Wood color="#4a3020" seed={60 + i} />
      </mesh>
    ))}
    <mesh position={[0, 3.05, 0.15]}>
      <boxGeometry args={[w, 0.18, 0.2]} />
      <Brass />
    </mesh>
  </group>
);
