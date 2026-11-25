// EP08 extra felt sets: the garden party, his seaside memory, the home kitchen of forty years,
// the hometown memory hoop, and the embroidered letter. Same textile rules as Cafe.tsx.

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Fuzzy, SPHERE } from "../../kits/feltcraft/scene/Fuzzy";
import { feltMaterial } from "../../kits/feltcraft/lib/materials";
import { mulberry32, stepT } from "../../kits/feltcraft/core/motion";
import { C, Chair, SeaWindow, StitchRing, StringLights, TABLE_TOP, WaveStrip, YarnBall, embroideredText } from "./Cafe.tsx";

type V3 = [number, number, number];

/** Bunting: felt triangles on a sagging thread. */
const Bunting: React.FC<{ y: number; z: number; x0: number; x1: number; t: number }> = ({ y, z, x0, x1, t }) => {
  const cols = ["#E3B23C", "#C9463D", "#3E9C95", "#F29AA0", "#86AE5E"];
  const n = 16;
  const ts = stepT(t);
  const cord = useMemo(() => {
    const pts = Array.from({ length: 30 }, (_, i) => new THREE.Vector3(x0 + ((x1 - x0) * i) / 29, y - 0.25 * Math.sin((Math.PI * i) / 29), z));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.006, 4, false);
  }, [x0, x1, y, z]);
  return (
    <group>
      <mesh geometry={cord}>
        <meshStandardMaterial color={C.stitch} roughness={1} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        return (
          <mesh key={i} position={[x0 + (x1 - x0) * u, y - 0.25 * Math.sin(Math.PI * u) - 0.11, z]} rotation={[Math.sin(ts * 2 + i) * 0.12, 0, Math.PI]}>
            <coneGeometry args={[0.1, 0.2, 3, 1]} />
            <meshPhysicalMaterial color={cols[i % cols.length]} roughness={1} sheen={1} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Garden party at dusk: felt lawn, teal tent cloth, bunting, string lights, punch table. */
export const PartySet: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const lawn = useMemo(() => feltMaterial("#5F8A4E", 4), []);
  const tent = useMemo(() => feltMaterial("#2F5B5A", 3), []);
  const cloth = useMemo(() => feltMaterial(C.clothLight, 2), []);
  return (
    <group>
      <mesh material={tent} position={[0, 2.2, -2.2]} receiveShadow>
        <planeGeometry args={[12, 5]} />
      </mesh>
      {/* tent pleats: vertical running stitches */}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-5 + i, 2.0, -2.18]}>
          <capsuleGeometry args={[0.006, 3.2, 3, 6]} />
          <meshStandardMaterial color="#4E7F7C" roughness={1} />
        </mesh>
      ))}
      <mesh material={lawn} position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 6]} />
      </mesh>
      {/* dance floor: felt circle with blanket-stitch rim */}
      <mesh position={[-0.6, 0.004, -0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.25, 48]} />
        <meshPhysicalMaterial color="#D9B98C" roughness={1} sheen={1} />
      </mesh>
      <group position={[-0.6, 0, -0.2]}>
        <StitchRing r={1.2} y={0.012} n={64} />
      </group>
      <Bunting y={2.5} z={-1.6} x0={-3.6} x1={3.6} t={t} />
      <group scale={[1, 1, 1]}>
        <StringLights y={2.95} z={-1.0} x0={-3.6} x1={3.6} sag={0.3} t={t * (1 - dim)} />
      </group>
      {/* punch table, right */}
      <group position={[2.15, 0, -0.6]}>
        <mesh material={cloth} position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.8, 0.5]} />
        </mesh>
        <mesh position={[0, 0.88, 0]} castShadow>
          <sphereGeometry args={[0.16, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial color="#F3EBDD" roughness={1} sheen={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.14, 24]} />
          <meshPhysicalMaterial color="#C9463D" roughness={0.3} clearcoat={0.6} />
        </mesh>
        {[-0.3, 0.3].map((x) => (
          <Fuzzy key={x} geometry={SPHERE} color={x < 0 ? "#F2B53B" : "#F29AA0"} position={[x, 0.86, 0.05]} scale={0.06} shells={2} spacing={0.08} />
        ))}
      </group>
      {/* pompom flower bushes at the sides */}
      {[-3.1, -2.6, 3.0].map((x, i) => (
        <group key={i} position={[x, 0, -1.3 + i * 0.2]}>
          <Fuzzy geometry={SPHERE} color="#4F8A4B" position={[0, 0.3, 0]} scale={[0.4, 0.32, 0.3]} shells={3} spacing={0.04} />
          {[0, 1, 2, 3].map((k) => (
            <Fuzzy key={k} geometry={SPHERE} color={["#F29AA0", "#FFFFFF", "#F2B53B", "#B9A0E0"][k]} position={[Math.cos(k * 1.6) * 0.28, 0.42 + (k % 2) * 0.12, 0.2 + Math.sin(k * 1.6) * 0.05]} scale={0.06} shells={2} spacing={0.08} />
          ))}
        </group>
      ))}
      <YarnBall position={[-2.6, 0.18, 1.2]} color="#B9A0E0" />
    </group>
  );
};

/** His seaside hometown: sand, felt sea layers, button sun, felt house with parents, palm. */
export const SeaSet: React.FC<{ t: number }> = ({ t }) => {
  const sky = useMemo(() => feltMaterial("#A9D3E6", 4), []);
  const sand = useMemo(() => feltMaterial("#E3CB96", 4), []);
  const wall = useMemo(() => feltMaterial("#F1E3C6", 1.5), []);
  const roof = useMemo(() => feltMaterial("#B5532F", 1.5), []);
  const trunk = useMemo(() => feltMaterial("#8A5A36", 2), []);
  const ts = stepT(t);
  const sunUp = 2.6 + Math.min(1, ts / 3) * 0.2;
  return (
    <group>
      <mesh material={sky} position={[0, 2.5, -3.2]} receiveShadow>
        <planeGeometry args={[14, 7]} />
      </mesh>
      <group position={[1.9, sunUp, -3.1]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 0.08, 40]} />
          <meshPhysicalMaterial color="#F2B53B" roughness={0.4} clearcoat={0.5} emissive="#F2B53B" emissiveIntensity={0.15} />
        </mesh>
        {[0, 1].map((k) => (
          <mesh key={k} position={[0, -0.05, 0]} rotation={[0, (k ? 1 : -1) * Math.PI / 4, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.03]} />
            <meshStandardMaterial color={C.cloth} roughness={1} />
          </mesh>
        ))}
      </group>
      {/* pompom clouds */}
      {[-2.4, -0.6, 0.9].map((x, i) => (
        <group key={i} position={[x + Math.sin(ts * 0.6 + i) * 0.05, 3.0 + (i % 2) * 0.3, -2.9]}>
          {[0, 1, 2].map((k) => (
            <Fuzzy key={k} geometry={SPHERE} color="#FFFFFF" position={[(k - 1) * 0.26, k === 1 ? 0.08 : 0, 0]} scale={0.2 + (k === 1 ? 0.05 : 0)} shells={3} spacing={0.05} />
          ))}
        </group>
      ))}
      {/* the sea: layered felt waves */}
      {[
        [1.25, -2.6, C.sea1, 0],
        [1.0, -2.1, C.sea2, 1.3],
        [0.75, -1.6, "#4C8DB8", 2.2],
        [0.5, -1.1, C.sea3, 3.1],
        [0.28, -0.6, "#8EC0DA", 4.0],
      ].map(([y, z, col, ph], i) => (
        <group key={i} position={[0, 0, 0]}>
          <WaveStrip y={y as number} z={z as number} w={12} h={0.07} color={col as string} phase={ph as number} t={t} />
          <mesh position={[0, (y as number) / 2 - 0.05, (z as number) + 0.01]}>
            <boxGeometry args={[12, y as number, 0.02]} />
            <meshPhysicalMaterial color={col as string} roughness={1} sheen={1} />
          </mesh>
        </group>
      ))}
      <mesh material={sand} position={[0, -0.05, 1.0]} receiveShadow>
        <boxGeometry args={[14, 0.1, 3.4]} />
      </mesh>
      {/* felt fishing house, left */}
      <group position={[-2.3, 0, -0.1]} rotation={[0, 0.35, 0]}>
        <mesh material={wall} position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.84, 0.7]} />
        </mesh>
        <mesh material={roof} position={[0, 1.08, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.72, 0.5, 4]} />
        </mesh>
        <mesh position={[0.1, 0.28, 0.36]}>
          <boxGeometry args={[0.2, 0.38, 0.02]} />
          <meshPhysicalMaterial color="#6E4A2F" roughness={1} sheen={0.5} />
        </mesh>
        <mesh position={[-0.24, 0.52, 0.36]}>
          <boxGeometry args={[0.18, 0.16, 0.02]} />
          <meshPhysicalMaterial color="#9CC8E0" roughness={1} />
        </mesh>
      </group>
      {/* palm: wound-yarn trunk + felt leaves */}
      <group position={[2.7, 0, 0.1]}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} material={trunk} position={[Math.sin(i * 0.25) * 0.08, 0.1 + i * 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.085, 0.16, 14]} />
          </mesh>
        ))}
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <Fuzzy key={i} geometry={SPHERE} color={i % 2 ? "#4F8A4B" : "#6FA35E"} position={[Math.cos(a) * 0.3 + 0.15, 1.62 - 0.05 * (i % 2), Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.5, -a, 1.2]} scale={[0.07, 0.36, 0.03]} shells={2} spacing={0.06} />;
        })}
      </group>
      {/* boat on the sea */}
      <group position={[0.4, 0.62 + Math.sin(ts * 1.5) * 0.02, -1.35]} rotation={[0, 0, Math.sin(ts * 1.2) * 0.06]}>
        <mesh>
          <boxGeometry args={[0.5, 0.1, 0.16]} />
          <meshPhysicalMaterial color="#B9583A" roughness={1} sheen={1} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.42, 6]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
        <mesh position={[0.09, 0.27, 0]}>
          <coneGeometry args={[0.15, 0.36, 3]} />
          <meshPhysicalMaterial color={C.clothLight} roughness={1} sheen={1} />
        </mesh>
      </group>
      {/* shells & starfish in the sand */}
      {[-0.9, 0.2, 1.4].map((x, i) => (
        <Fuzzy key={i} geometry={SPHERE} color={i === 1 ? "#E8796E" : "#FFF4DE"} position={[x, 0.03, 1.2 + (i % 2) * 0.3]} scale={[0.07, 0.025, 0.06]} shells={1} spacing={0.06} />
      ))}
    </group>
  );
};

/** Canvas texture for the wall calendar: "tahun ke-N". */
const calendarTexture = (year: number) =>
  embroideredText(
    [
      { text: "tahun ke-", size: 46, color: "#4A2E1E", y: 150 },
      { text: String(year), size: 190, color: "#C9463D", y: 330 },
    ],
    "#FFF7E8",
  );

/** Home kitchen of forty years: cream felt wall, green wainscot, day window, shelf with jars,
 *  wall calendar, embroidered "Rumah" sampler, a rectangular table with a felt runner. */
export const KitchenSet: React.FC<{ t: number; year: number; showSecondChair?: boolean }> = ({ t, year, showSecondChair = true }) => {
  const wall = useMemo(() => feltMaterial("#E6CF9E", 3), []);
  const low = useMemo(() => feltMaterial("#6E9A7A", 3), []);
  const floor = useMemo(() => feltMaterial("#8A5E3E", 4), []);
  const wood = useMemo(() => feltMaterial(C.wood, 1), []);
  const runner = useMemo(() => feltMaterial("#3E7C74", 1.5), []);
  const yr = Math.max(1, Math.min(40, Math.round(year)));
  const cal = useMemo(() => calendarTexture(yr), [yr]);
  useEffect(() => () => cal.dispose(), [cal]);
  const sampler = useMemo(() => embroideredText([{ text: "Rumah", size: 120, color: "#B5532F", y: 250 }, { text: "♥", size: 80, color: "#C9463D", y: 370 }], "#F6ECD8"), []);
  const jarLabel = (txt: string) => embroideredText([{ text: txt, size: 120, color: "#2F5E8C", y: 256 }], "#FFFFFF");
  const gula = useMemo(() => jarLabel("gula"), []);
  const garam = useMemo(() => jarLabel("garam"), []);
  return (
    <group>
      <mesh material={wall} position={[0, 2, -1.6]} receiveShadow>
        <planeGeometry args={[9, 4.4]} />
      </mesh>
      <mesh material={low} position={[0, 0.35, -1.57]} receiveShadow>
        <boxGeometry args={[9, 0.75, 0.04]} />
      </mesh>
      {Array.from({ length: 60 }, (_, i) => (
        <mesh key={i} position={[-4 + (i + 0.5) * (8 / 60), 0.7, -1.54]}>
          <capsuleGeometry args={[0.007, 0.07, 3, 6]} />
          <meshStandardMaterial color={C.stitch} roughness={1} />
        </mesh>
      ))}
      <mesh material={floor} position={[0, -0.05, 0.6]} receiveShadow>
        <boxGeometry args={[9, 0.1, 5]} />
      </mesh>
      <SeaWindow x={-0.1} y={1.62} z={-1.52} t={t} day />
      {/* shelf with jars: gula and garam */}
      <group position={[1.6, 1.32, -1.45]}>
        <mesh material={wood} castShadow>
          <boxGeometry args={[0.9, 0.04, 0.22]} />
        </mesh>
        {[
          [-0.22, gula],
          [0.18, garam],
        ].map(([x, tex], i) => (
          <group key={i} position={[x as number, 0.15, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.24, 24]} />
              <meshPhysicalMaterial color="#F6F1E6" roughness={1} sheen={1} />
            </mesh>
            <mesh position={[0, 0, 0.0]}>
              <cylinderGeometry args={[0.0915, 0.0915, 0.11, 24, 1, true, -0.8, 1.6]} />
              <meshStandardMaterial map={tex as THREE.Texture} roughness={1} />
            </mesh>
            <Fuzzy geometry={SPHERE} color={i ? "#2F5E8C" : "#C9463D"} position={[0, 0.14, 0]} scale={[0.095, 0.035, 0.095]} shells={1} spacing={0.05} />
          </group>
        ))}
      </group>
      {/* wall calendar */}
      <group position={[1.62, 1.95, -1.55]}>
        <mesh>
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial map={cal} roughness={1} />
        </mesh>
        <mesh position={[0, 0.24, 0.01]}>
          <boxGeometry args={[0.44, 0.04, 0.02]} />
          <meshPhysicalMaterial color={C.cloth} roughness={1} />
        </mesh>
      </group>
      {/* embroidered sampler hoop */}
      <group position={[-1.7, 1.75, -1.55]}>
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.24, 40]} />
          <meshStandardMaterial map={sampler} roughness={1} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <torusGeometry args={[0.245, 0.018, 8, 40]} />
          <meshPhysicalMaterial color="#C9A46E" roughness={0.6} />
        </mesh>
      </group>
      {/* rectangular table with runner */}
      <mesh material={wood} position={[0, TABLE_TOP - 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.06, 0.82]} />
      </mesh>
      <mesh material={runner} position={[0, TABLE_TOP + 0.002, 0]} receiveShadow>
        <boxGeometry args={[1.38, 0.008, 0.32]} />
      </mesh>
      {[-0.6, 0.6].flatMap((x) =>
        [-0.34, 0.34].map((z) => (
          <mesh key={`${x}${z}`} material={wood} position={[x, (TABLE_TOP - 0.06) / 2, z]} castShadow>
            <boxGeometry args={[0.06, TABLE_TOP - 0.06, 0.06]} />
          </mesh>
        )),
      )}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={`r${i}`} position={[-0.66 + i * 0.063, TABLE_TOP + 0.008, 0.13]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.005, 0.025, 3, 6]} />
          <meshStandardMaterial color={C.stitch} roughness={1} />
        </mesh>
      ))}
      <Chair position={[-0.95, 0, 0.02]} rotY={1.25} />
      {showSecondChair && <Chair position={[0.95, 0, 0.02]} rotY={-1.25} />}
      {/* felt plant on the sill */}
      <group position={[-0.55, 1.18, -1.4]}>
        <mesh castShadow position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.14, 18]} />
          <meshPhysicalMaterial color="#C9563A" roughness={1} sheen={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <Fuzzy key={k} geometry={SPHERE} color="#6FA35E" position={[Math.cos(k * 1.57) * 0.04, 0.22, Math.sin(k * 1.57) * 0.04]} rotation={[0, -k * 1.57, 0.4]} scale={[0.03, 0.1, 0.02]} shells={1} spacing={0.06} />
        ))}
      </group>
    </group>
  );
};

/** Her hometown memory: an embroidery hoop "bubble" with felt hills and a little house, stitched on linen. */
export const MemoryHoop: React.FC<{ position: V3; scale: number; t: number }> = ({ position, scale, t }) => {
  const ts = stepT(t);
  const linen = useMemo(() => feltMaterial("#F6ECD8", 1), []);
  return (
    <group position={position} scale={scale} rotation={[0, 0, Math.sin(ts * 1.5) * 0.03]}>
      <mesh material={linen}>
        <circleGeometry args={[0.36, 48]} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[0.365, 0.024, 10, 48]} />
        <meshPhysicalMaterial color="#C9A46E" roughness={0.6} />
      </mesh>
      {/* hills */}
      {[
        [-0.12, -0.12, 0.26, "#86AE5E"],
        [0.14, -0.15, 0.24, "#5E8A55"],
      ].map(([x, y, r, col], i) => (
        <mesh key={i} position={[x as number, y as number, 0.012 + i * 0.004]}>
          <circleGeometry args={[r as number, 32, 0, Math.PI]} />
          <meshPhysicalMaterial color={col as string} roughness={1} sheen={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.25, 0.02]}>
        <planeGeometry args={[0.66, 0.2]} />
        <meshPhysicalMaterial color="#B5CF7A" roughness={1} sheen={1} />
      </mesh>
      {/* little house */}
      <mesh position={[0.02, -0.1, 0.03]}>
        <planeGeometry args={[0.13, 0.1]} />
        <meshPhysicalMaterial color="#F1E3C6" roughness={1} />
      </mesh>
      <mesh position={[0.02, -0.02, 0.031]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.1, 3, Math.PI / 2]} />
        <meshPhysicalMaterial color="#B5532F" roughness={1} />
      </mesh>
      {/* sun */}
      <mesh position={[-0.16, 0.14, 0.02]}>
        <circleGeometry args={[0.05, 24]} />
        <meshStandardMaterial color="#F2B53B" emissive="#F2B53B" emissiveIntensity={0.2} />
      </mesh>
      {/* family: three tiny felt figures */}
      {[-0.17, -0.11, 0.17].map((x, i) => (
        <group key={i} position={[x, -0.25 + (i === 1 ? -0.01 : 0), 0.035]}>
          <mesh position={[0, 0.05, 0]}>
            <circleGeometry args={[0.02, 14]} />
            <meshStandardMaterial color="#E6B28C" />
          </mesh>
          <mesh>
            <planeGeometry args={[0.03, 0.06]} />
            <meshStandardMaterial color={["#C9463D", "#3E9C95", "#E3B23C"][i]} />
          </mesh>
        </group>
      ))}
      {/* running stitch around */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.03]} rotation={[0, 0, a + Math.PI / 2]}>
            <capsuleGeometry args={[0.004, 0.025, 3, 6]} />
            <meshStandardMaterial color={C.cloth} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
};

/** The letter: linen sheet, heading + the current phrase stitched in letter by letter (on twos). */
export const LetterCloth: React.FC<{ phrase: string; progress: number; position: V3; rotation: V3; scale?: number; wet: number }> = ({ phrase, progress, position, rotation, scale = 1, wet }) => {
  const nChars = Math.round(phrase.length * Math.max(0, Math.min(1, progress)));
  const shown = phrase.slice(0, nChars);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 720;
    const g = c.getContext("2d")!;
    g.fillStyle = "#F7EEDC";
    g.fillRect(0, 0, 1024, 720);
    const r = mulberry32(9);
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = `rgba(120,90,60,${0.03 + r() * 0.05})`;
      g.fillRect(r() * 1024, r() * 720, 1 + r() * 8, 1);
    }
    // stitched border
    g.strokeStyle = "#C9563A";
    g.lineWidth = 6;
    g.setLineDash([22, 14]);
    g.strokeRect(34, 34, 956, 652);
    g.setLineDash([]);
    g.textAlign = "left";
    g.fillStyle = "#7A3B22";
    g.font = "italic bold 58px Georgia, serif";
    g.fillText("Sayangku yang tercinta,", 90, 140);
    // wrap the phrase
    g.font = "bold 66px Georgia, serif";
    g.fillStyle = "#2F3E5C";
    const words = shown.split(" ");
    let line = "";
    let y = 270;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (g.measureText(test).width > 840) {
        g.fillText(line, 90, y);
        line = w;
        y += 92;
      } else line = test;
    }
    if (line) g.fillText(line, 90, y);
    // tear stains
    for (let k = 0; k < Math.floor(wet * 5); k++) {
      const rr = mulberry32(100 + k);
      const x = 200 + rr() * 650, yy = 200 + rr() * 400, rad = 34 + rr() * 30;
      const grd = g.createRadialGradient(x, yy, 4, x, yy, rad);
      grd.addColorStop(0, "rgba(90,110,140,0.28)");
      grd.addColorStop(1, "rgba(90,110,140,0)");
      g.fillStyle = grd;
      g.beginPath();
      g.arc(x, yy, rad, 0, Math.PI * 2);
      g.fill();
    }
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return tx;
  }, [shown, Math.floor(wet * 5)]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.64, 0.45, 0.006]} />
        <meshPhysicalMaterial color="#F7EEDC" roughness={1} sheen={1} />
      </mesh>
      <mesh position={[0, 0, 0.0035]}>
        <planeGeometry args={[0.64, 0.45]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
    </group>
  );
};
