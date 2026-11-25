// EP08 felt café set: a hand-sewn coffee shop at night. Felt walls with blanket-stitched seams,
// a window onto a felt sea (his memory of home), an embroidery-hoop sign "Kedai AUDIRA",
// pompom string lights, a round table with a gingham felt cloth, felt cups, and the key prop:
// a tiny felt salt shaker. All textile: felt, wool, yarn, thread, wood, bead.

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Fuzzy, SPHERE, CYL } from "../../kits/feltcraft/scene/Fuzzy";
import { feltMaterial, yarnMaterial } from "../../kits/feltcraft/lib/materials";
import { mulberry32, stepT } from "../../kits/feltcraft/core/motion";

export const C = {
  wall: "#C8794A", // terracotta felt
  wallLow: "#7C4A34", // wainscot felt
  floor: "#6B4430",
  wood: "#A8774E",
  woodDark: "#6E4A2F",
  cloth: "#C9463D",
  clothLight: "#F5E6CF",
  stitch: "#FFF4DE",
  seaNight: "#1F3557",
  sea1: "#2F5E8C",
  sea2: "#3F7BA8",
  sea3: "#6FA6C8",
  moon: "#F4DFA0",
  cup: "#F3EBDD",
  coffee: "#4A2A18",
  salt: "#FFFFFF",
  shakerCap: "#9AA3AA",
  bulb: "#FFC873",
};

/** Canvas texture of embroidered letters: satin-stitch striations over each glyph. */
export const embroideredText = (lines: { text: string; size: number; color: string; y: number }[], bg: string, w = 512, h = 512) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // linen weave
  const rnd = mulberry32(808);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(120,90,60,${0.04 + rnd() * 0.06})`;
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 6, 1);
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const l of lines) {
    g.font = `bold ${l.size}px Georgia, 'Times New Roman', serif`;
    g.fillStyle = l.color;
    g.fillText(l.text, w / 2, l.y);
    // satin stitch striations clipped to the glyphs
    g.save();
    g.globalCompositeOperation = "source-atop";
    g.strokeStyle = "rgba(255,255,255,0.22)";
    g.lineWidth = 1.2;
    for (let x = -h; x < w; x += 4) {
      g.beginPath();
      g.moveTo(x, l.y + l.size);
      g.lineTo(x + l.size * 0.9, l.y - l.size);
      g.stroke();
    }
    g.restore();
    g.globalCompositeOperation = "source-over";
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

/** Gingham felt texture for the tablecloth. */
const ginghamTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = C.clothLight;
  g.fillRect(0, 0, 256, 256);
  const s = 32;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = "rgba(201,70,61,0.55)";
    g.fillRect(i * s, 0, s / 2, 256);
    g.fillRect(0, i * s, 256, s / 2);
  }
  const rnd = mulberry32(77);
  for (let i = 0; i < 2600; i++) {
    const v = 200 + Math.floor(rnd() * 55);
    g.strokeStyle = `rgba(${v},${v},${v},0.18)`;
    g.lineWidth = 0.7;
    const x = rnd() * 256, y = rnd() * 256, a = rnd() * 6.28, l = 3 + rnd() * 8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
};

/** A ring of blanket-stitch bars + running thread around a circle (y-up). */
export const StitchRing: React.FC<{ r: number; y: number; n: number; color?: string; vertical?: boolean }> = ({ r, y, n, color = C.stitch, vertical }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      o.rotation.set(vertical ? 0 : Math.PI / 2, -a, vertical ? 0 : 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [r, y, n, vertical]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <capsuleGeometry args={[0.006, vertical ? 0.05 : 0.035, 3, 6]} />
      <meshStandardMaterial color={color} roughness={1} />
    </instancedMesh>
  );
};

/** Steam as two curls of loose white yarn rising from the cup, re-posed on twos. */
const SteamWisp: React.FC<{ t: number; seed: number; amount: number }> = ({ t, seed, amount }) => {
  const ts = stepT(t);
  const pose = Math.floor(ts * 4) % 6; // the animator nudges the wire 4x per second
  const geos = useMemo(
    () =>
      Array.from({ length: 6 }, (_, k) =>
        [0, 1].map((j) => {
          const pts: THREE.Vector3[] = [];
          for (let i = 0; i <= 24; i++) {
            const u = i / 24;
            const ph = seed * 1.7 + j * 2.4 + k * 0.5;
            pts.push(new THREE.Vector3((j ? 0.025 : -0.02) + Math.sin(u * 7 + ph) * 0.028 * (0.4 + u), 0.15 + u * 0.24, Math.cos(u * 5 + ph) * 0.012));
          }
          return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0045, 5, false);
        }),
      ),
    [seed],
  );
  return (
    <group scale={[1, amount, 1]}>
      {geos[pose].map((g, j) => (
        <mesh key={j} geometry={g}>
          <meshStandardMaterial color="#FFF8EC" roughness={1} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
};

/** A felt cup on a saucer, with coffee and optional wool steam. */
export const FeltCup: React.FC<{ position: [number, number, number]; rotY?: number; t: number; steam?: number; seed?: number }> = ({ position, rotY = 0, t, steam = 1, seed = 1 }) => {
  const cupMat = useMemo(() => feltMaterial(C.cup, 1), []);
  const coffeeMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: C.coffee, roughness: 0.35, clearcoat: 0.6 }), []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh material={cupMat} position={[0, 0.008, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.12, 0.016, 32]} />
      </mesh>
      <StitchRing r={0.118} y={0.017} n={22} />
      <mesh material={cupMat} position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.078, 0.06, 0.12, 28]} />
      </mesh>
      <mesh material={coffeeMat} position={[0, 0.128, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.006, 28]} />
      </mesh>
      <mesh position={[0, 0.134, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.076, 0.008, 8, 32]} />
        <meshPhysicalMaterial color={C.clothLight} roughness={1} sheen={1} />
      </mesh>
      <StitchRing r={0.074} y={0.09} n={18} color={C.cloth} vertical />
      <mesh material={cupMat} position={[0.085, 0.078, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.032, 0.011, 8, 18]} />
      </mesh>
      {steam > 0 && <SteamWisp t={t} seed={seed} amount={steam} />}
    </group>
  );
};

/** The key prop: a felt salt shaker with a grey felt cap, bead holes and an embroidered "G" label. */
export const SaltShaker: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({ position, rotation, scale = 1 }) => {
  const label = useMemo(() => {
    const tx = embroideredText([{ text: "garam", size: 54, color: "#2F5E8C", y: 64 }], C.salt, 256, 128);
    tx.wrapS = THREE.RepeatWrapping;
    // read upright while the shaker is tipped over the cup (thumbnail legibility)
    tx.center.set(0.5, 0.5);
    tx.rotation = Math.PI;
    return tx;
  }, []);
  const bodyMat = useMemo(() => feltMaterial(C.salt, 1), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={bodyMat} position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.048, 0.12, 24]} />
      </mesh>
      <mesh position={[0, 0.062, 0]}>
        <cylinderGeometry args={[0.0485, 0.0525, 0.045, 24, 1, true, -0.9, 1.8]} />
        <meshStandardMaterial map={label} roughness={1} side={THREE.FrontSide} />
      </mesh>
      <Fuzzy geometry={SPHERE} color={C.shakerCap} position={[0, 0.125, 0]} scale={[0.046, 0.034, 0.046]} shells={1} spacing={0.04} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.017, 0.157, Math.sin(a) * 0.017]} scale={0.006} geometry={SPHERE}>
            <meshBasicMaterial color="#2A2A2A" />
          </mesh>
        );
      })}
      <StitchRing r={0.045} y={0.105} n={10} color="#2F5E8C" vertical />
    </group>
  );
};

/** Falling salt grains (white beads) between two points, stepped on twos. */
export const SaltStream: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; t: number; amount: number }> = ({ from, to, t, amount }) => {
  if (amount <= 0) return null;
  const ts = stepT(t);
  const n = 22;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = ((ts * 1.4 + i / n) % 1 + 1) % 1;
        const r = mulberry32(i * 31 + 5);
        const p = from.clone().lerp(to, u * u);
        p.x += (r() - 0.5) * 0.025 * u;
        p.z += (r() - 0.5) * 0.025 * u;
        return (
          <mesh key={i} position={p} scale={0.005 + r() * 0.003} geometry={SPHERE}>
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={0.6} emissive="#FFF2DA" emissiveIntensity={0.25} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Wavy felt strip (extruded) with a running stitch along the crest: for the felt sea. */
export const WaveStrip: React.FC<{ y: number; z: number; w: number; h: number; color: string; phase: number; t: number }> = ({ y, z, w, h, color, phase, t }) => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, -0.09);
    for (let i = 0; i <= 40; i++) {
      const x = -w / 2 + (i / 40) * w;
      sh.lineTo(x, h * Math.sin((i / 40) * Math.PI * 5 + phase));
    }
    sh.lineTo(w / 2, -0.09);
    sh.closePath();
    return new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3 });
  }, [w, h, phase]);
  const thread = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = -w / 2 + 0.02 + (i / 60) * (w - 0.04);
      pts.push(new THREE.Vector3(x, h * Math.sin(((x + w / 2) / w) * Math.PI * 5 + phase) - 0.03, 0.035));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.004, 4, false);
  }, [w, h, phase]);
  const mat = useMemo(() => feltMaterial(color, 0.6), [color]);
  const bob = Math.sin(stepT(t) * 1.6 + phase) * 0.012;
  return (
    <group position={[Math.sin(stepT(t) * 0.8 + phase) * 0.02, y + bob, z]}>
      <mesh geometry={geo} material={mat} />
      <mesh geometry={thread}>
        <meshStandardMaterial color={C.stitch} roughness={1} />
      </mesh>
    </group>
  );
};

/** Window onto the night sea (his hometown memory). Centre at (x, y) on the back wall. */
export const SeaWindow: React.FC<{ x: number; y: number; z: number; t: number; day?: boolean }> = ({ x, y, z, t, day }) => {
  const W = 1.15, H = 0.78;
  const frameMat = useMemo(() => feltMaterial(C.woodDark, 1), []);
  const skyMat = useMemo(() => feltMaterial(day ? "#9CC8E0" : C.seaNight, 1.5), [day]);
  const stars = useMemo(() => {
    const r = mulberry32(42);
    return Array.from({ length: 14 }, () => [(r() - 0.5) * W * 0.9, 0.05 + r() * H * 0.42] as const);
  }, []);
  return (
    <group position={[x, y, z]}>
      <mesh material={skyMat} position={[0, 0, -0.03]}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {!day && stars.map(([sx, sy], i) => (
        <mesh key={i} position={[sx, sy, -0.02]} scale={0.008 + (i % 3) * 0.003} geometry={SPHERE}>
          <meshBasicMaterial color="#FFF1C8" />
        </mesh>
      ))}
      {/* moon button */}
      <group position={[0.3, 0.2, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 32]} />
          <meshStandardMaterial color={day ? "#F2B53B" : C.moon} emissive={day ? "#F2B53B" : C.moon} emissiveIntensity={day ? 0.3 : 0.6} roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + 0.78;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.025, -0.012, Math.sin(a) * 0.025]}>
              <cylinderGeometry args={[0.01, 0.01, 0.006, 10]} />
              <meshBasicMaterial color="#8A6A2A" />
            </mesh>
          );
        })}
      </group>
      {/* little felt boat */}
      <group position={[-0.22, -0.11 + Math.sin(stepT(t) * 1.6) * 0.012, 0.0]} rotation={[0, 0, Math.sin(stepT(t) * 1.3) * 0.08]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.035, 0.02]} />
          <meshPhysicalMaterial color="#B9583A" roughness={1} sheen={1} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.12, 6]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
        <mesh position={[0.03, 0.07, 0]}>
          <coneGeometry args={[0.045, 0.1, 3]} />
          <meshPhysicalMaterial color={C.clothLight} roughness={1} sheen={1} />
        </mesh>
      </group>
      <WaveStrip y={-0.17} z={-0.01} w={W} h={0.03} color={C.sea1} phase={0} t={t} />
      <WaveStrip y={-0.24} z={0.01} w={W} h={0.035} color={C.sea2} phase={1.4} t={t} />
      <WaveStrip y={-0.31} z={0.03} w={W} h={0.03} color={C.sea3} phase={2.6} t={t} />
      {/* frame + cross bars */}
      {[
        [0, H / 2 + 0.04, W + 0.16, 0.08],
        [0, -H / 2 - 0.04, W + 0.16, 0.08],
        [-W / 2 - 0.04, 0, 0.08, H],
        [W / 2 + 0.04, 0, 0.08, H],
        [0, 0, 0.035, H],
      ].map(([fx, fy, fw, fh], i) => (
        <mesh key={i} material={frameMat} position={[fx, fy, 0.05]} castShadow>
          <boxGeometry args={[fw, fh, 0.06]} />
        </mesh>
      ))}
      {/* sill */}
      <mesh material={frameMat} position={[0, -H / 2 - 0.09, 0.1]} castShadow>
        <boxGeometry args={[W + 0.3, 0.04, 0.16]} />
      </mesh>
    </group>
  );
};

/** Embroidery hoop sign: "Kedai AUDIRA" stitched on linen, wooden ring. */
export const HoopSign: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const tex = useMemo(
    () =>
      embroideredText(
        [
          { text: "Kedai", size: 70, color: "#7A3B22", y: 170 },
          { text: "AUDIRA", size: 96, color: "#0B3D2E", y: 262 },
          { text: "kopi & cerita", size: 44, color: "#B5532F", y: 350 },
        ],
        "#F6ECD8",
      ),
    [],
  );
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.01, 48]} />
        <meshStandardMaterial color="#F6ECD8" roughness={1} />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <circleGeometry args={[0.3, 48]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[0.305, 0.022, 10, 48]} />
        <meshPhysicalMaterial color="#C9A46E" roughness={0.6} clearcoat={0.2} />
      </mesh>
      <mesh position={[0, 0.34, 0.01]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshPhysicalMaterial color="#C9A46E" roughness={0.6} />
      </mesh>
      {/* hanging thread */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.4, 5]} />
        <meshStandardMaterial color={C.stitch} roughness={1} />
      </mesh>
    </group>
  );
};

/** Pompom string lights along a sagging yarn. */
export const StringLights: React.FC<{ y: number; z: number; x0: number; x1: number; sag: number; t: number }> = ({ y, z, x0, x1, sag, t }) => {
  const N = 13;
  const pts = useMemo(() => Array.from({ length: 41 }, (_, i) => {
    const u = i / 40;
    return new THREE.Vector3(x0 + (x1 - x0) * u, y - sag * Math.sin(Math.PI * u), z);
  }), [x0, x1, y, z, sag]);
  const cord = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.006, 5, false), [pts]);
  const cols = ["#FFC873", "#FF9F6B", "#FFE2A0", "#F7B2A0"];
  const ts = stepT(t);
  return (
    <group>
      <mesh geometry={cord}>
        <meshStandardMaterial color="#5B3A26" roughness={1} />
      </mesh>
      {Array.from({ length: N }, (_, i) => {
        const u = (i + 0.5) / N;
        const p = new THREE.Vector3(x0 + (x1 - x0) * u, y - sag * Math.sin(Math.PI * u) - 0.05, z);
        const flick = 1.4 + 0.25 * Math.sin(ts * 2 + i * 1.7);
        return (
          <group key={i} position={p}>
            <mesh scale={0.042} geometry={SPHERE}>
              <meshStandardMaterial color={cols[i % 4]} emissive={cols[i % 4]} emissiveIntensity={flick} roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Chair: React.FC<{ position: [number, number, number]; rotY: number }> = ({ position, rotY }) => {
  const mat = useMemo(() => feltMaterial(C.wood, 1), []);
  const cushion = useMemo(() => feltMaterial("#3E7C74", 1), []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh material={mat} position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 28]} />
      </mesh>
      <mesh material={cushion} position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.23, 0.04, 28]} />
      </mesh>
      <StitchRing r={0.2} y={0.482} n={24} />
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, zz], i) => (
        <mesh key={i} material={mat} position={[x, 0.2, zz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.42, 10]} />
        </mesh>
      ))}
      {/* curved backrest */}
      <mesh material={mat} position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.22, 0.04]} />
      </mesh>
      {[-0.15, 0.15].map((x) => (
        <mesh key={x} material={mat} position={[x, 0.62, -0.2]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.4, 8]} />
        </mesh>
      ))}
    </group>
  );
};

/** Round café table with gingham felt cloth and blanket-stitched hem. Top surface at y = 0.76. */
export const TABLE_TOP = 0.76;
const CafeTable: React.FC = () => {
  const tex = useMemo(ginghamTexture, []);
  const clothMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: tex, roughness: 1, sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color("#FFFFFF"), bumpMap: tex, bumpScale: 0.6 }), [tex]);
  const wood = useMemo(() => feltMaterial(C.woodDark, 1), []);
  const skirtMat = useMemo(() => {
    const tx = tex.clone();
    tx.repeat.set(9, 0.7);
    tx.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({ map: tx, roughness: 1, sheen: 1, sheenRoughness: 0.7, sheenColor: new THREE.Color("#FFFFFF"), bumpMap: tx, bumpScale: 0.6 });
  }, [tex]);
  return (
    <group>
      <mesh material={clothMat} position={[0, TABLE_TOP - 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.66, 0.02, 48]} />
      </mesh>
      <mesh material={skirtMat} position={[0, TABLE_TOP - 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.7, 0.22, 48, 1, true]} />
      </mesh>
      <StitchRing r={0.68} y={TABLE_TOP - 0.2} n={70} vertical />
      <mesh material={wood} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.6, 16]} />
      </mesh>
      <mesh material={wood} position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 28]} />
      </mesh>
    </group>
  );
};

/** Foreground notion: yarn ball with knitting needles. */
export const YarnBall: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 700; i++) {
      const u = i / 700;
      const a = u * Math.PI * 2 * 22;
      const tilt = u * Math.PI * 6.3;
      pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0).applyAxisAngle(new THREE.Vector3(Math.cos(tilt), 0, Math.sin(tilt)).normalize(), tilt * 0.9).multiplyScalar(0.2));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 1800, 0.014, 5, false);
  }, []);
  const mat = useMemo(() => yarnMaterial(color), [color]);
  return (
    <group position={position}>
      <mesh geometry={geo} material={mat} castShadow />
      <mesh scale={0.19} geometry={SPHERE}>
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.04 * s, 0.15, 0]} rotation={[0.3 * s, 0, 0.6 + s * 0.15]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.7, 8]} />
          <meshPhysicalMaterial color="#C7B48F" roughness={0.3} clearcoat={0.8} />
        </mesh>
      ))}
    </group>
  );
};

export const CafeSet: React.FC<{ t: number }> = ({ t }) => {
  const wallMat = useMemo(() => feltMaterial(C.wall, 3), []);
  const lowMat = useMemo(() => feltMaterial(C.wallLow, 3), []);
  const floorMat = useMemo(() => feltMaterial(C.floor, 4), []);
  const seam = useMemo(() => {
    const pts = Array.from({ length: 2 }, (_, i) => new THREE.Vector3(-4 + i * 8, 0.72, -1.54));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 2, 0.008, 4, false);
  }, []);
  const seamBars = useRef<THREE.InstancedMesh>(null);
  const NB = 90;
  useLayoutEffect(() => {
    const m = seamBars.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < NB; i++) {
      o.position.set(-4 + (i + 0.5) * (8 / NB), 0.68, -1.535);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      {/* back wall + wainscot */}
      <mesh material={wallMat} position={[0, 2, -1.6]} receiveShadow>
        <planeGeometry args={[9, 4.4]} />
      </mesh>
      <mesh material={lowMat} position={[0, 0.35, -1.57]} receiveShadow>
        <boxGeometry args={[9, 0.75, 0.04]} />
      </mesh>
      <mesh geometry={seam}>
        <meshStandardMaterial color={C.stitch} roughness={1} />
      </mesh>
      <instancedMesh ref={seamBars} args={[undefined, undefined, NB]}>
        <capsuleGeometry args={[0.007, 0.07, 3, 6]} />
        <meshStandardMaterial color={C.stitch} roughness={1} />
      </instancedMesh>
      {/* floor */}
      <mesh material={floorMat} position={[0, -0.05, 0.6]} receiveShadow>
        <boxGeometry args={[9, 0.1, 5]} />
      </mesh>
      <SeaWindow x={0} y={1.62} z={-1.52} t={t} />
      <HoopSign position={[1.72, 1.62, -1.54]} />
      <StringLights y={2.32} z={-1.3} x0={-2.8} x1={2.8} sag={0.22} t={t} />
      <Chair position={[-0.98, 0, 0.02]} rotY={1.25} />
      <Chair position={[0.98, 0, 0.02]} rotY={-1.25} />
      <CafeTable />
      <YarnBall position={[-1.55, 0.18, 1.35]} color="#C9563A" />
      {/* potted felt plant, right */}
      <group position={[1.55, 0, 0.9]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.11, 0.32, 24]} />
          <meshPhysicalMaterial color="#D9B98C" roughness={0.9} sheen={0.5} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <Fuzzy key={i} geometry={SPHERE} color={i % 2 ? "#4F8A4B" : "#6FA35E"} position={[Math.cos(a) * 0.1, 0.48 + (i % 3) * 0.06, Math.sin(a) * 0.1]} rotation={[0, -a, 0.5]} scale={[0.05, 0.2, 0.03]} shells={2} spacing={0.06} />;
        })}
      </group>
      {/* soft contact shadow under table */}
      <mesh geometry={CYL} position={[0, 0.002, 0]} scale={[0.9, 0.001, 0.9]}>
        <meshBasicMaterial color="#2A160C" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
};
