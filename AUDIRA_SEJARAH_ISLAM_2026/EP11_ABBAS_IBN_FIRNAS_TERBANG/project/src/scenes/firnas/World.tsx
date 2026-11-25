// EP11 Firnas 3D world: a continuous sketchbook landscape with scene zones.
// Each zone lives at an x-offset so the camera pans across the desk.
// SKETCHFORGE style: paper ground, graphite + vermilion palette, sketch-to-3D transitions.

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";
import { makeSketchPaper, makeDeskTexture, lerpColor } from "../../kits/sketchforge/lib/materials";
import { rng } from "../../kits/sketchforge/core/motion";
import { B } from "./beats";
import { prog, smooth } from "./time";

type V3 = [number, number, number];
// --- Ground plane: continuous sketchbook pages ---

export const SketchbookGround: React.FC = () => {
  const paperTex = useMemo(makeSketchPaper, []);
  const deskTex = useMemo(makeDeskTexture, []);
  return (
    <group>
      {/* desk surface */}
      <mesh position={[12, -0.08, 0]} receiveShadow>
        <boxGeometry args={[52, 0.15, 16]} />
        <meshStandardMaterial map={deskTex} roughness={0.8} metalness={0.1} color={P.desk} />
      </mesh>
      {/* sketchbook pages - continuous strip */}
      {[0, 6, 12, 18, 24].map((x, i) => (
        <mesh key={i} position={[x, 0.005, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 10]} />
          <meshStandardMaterial map={paperTex} roughness={0.9} color={P.paper} />
        </mesh>
      ))}
    </group>
  );
};

// --- Hook zone (x ≈ 0): winged silhouette sketch ---

export const HookZone: React.FC<{ t: number }> = ({ t }) => {
  const drawK = smooth(prog(t, B.hookStart, B.wright));
  const liftK = smooth(prog(t, B.wright, B.terbangHook));
  return (
    <group position={[0, 0, 0]}>
      {/* Wing silhouette: two curved wing forms */}
      <group position={[0, 0.01 + liftK * 1.5, 0]}>
        {[-1, 1].map((side) => (
          <WingSketch key={side} side={side} drawK={drawK} liftK={liftK} />
        ))}
        {/* Body silhouette */}
        <mesh position={[0, 0.5 * liftK, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial
            color={lerpColor(P.graphiteMid, P.accentDeep, liftK * 0.3)}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
      </group>
      {/* "1000 tahun sebelum" text sketch on page */}
      <SketchLabel position={[0, 0.01, 2.5]} text="1000 tahun sebelum Wright Brothers" opacity={drawK} />
    </group>
  );
};

const WingSketch: React.FC<{ side: number; drawK: number; liftK: number }> = ({ side, drawK, liftK }) => {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    const idx: number[] = [];
    // feathered wing shape: 8 segments, tapered
    for (let i = 0; i <= 8; i++) {
      const frac = i / 8;
      const span = 1.8 * (1 - frac * 0.3);
      const chord = 0.5 * (1 - frac * frac * 0.6);
      const x = side * span * frac;
      const z = -chord * 0.5;
      pts.push(x, 0, z, x, 0, z + chord);
      if (i > 0) {
        const b = i * 2;
        idx.push(b - 2, b - 1, b, b, b - 1, b + 1);
      }
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [side]);
  return (
    <mesh ref={ref} geometry={geo} castShadow scale={[drawK, 1, drawK]} position={[0, 0.1 + liftK * 0.3, 0]} rotation={[liftK * -0.15, 0, side * liftK * 0.1]}>
      <meshStandardMaterial
        color={lerpColor(P.graphiteMid, P.accent, liftK * 0.6)}
        roughness={0.85}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// --- Context zone (x ≈ 2-5): Córdoba city + Ibn Firnas figure ---

export const ContextZone: React.FC<{ t: number }> = ({ t }) => {
  const cityDraw = smooth(prog(t, B.ctxStart, B.eropa));
  const cityLift = smooth(prog(t, B.cordoba, B.eropa));
  const figDraw = smooth(prog(t, B.abbas, B.penemu));
  const inventDraw = smooth(prog(t, B.kaca, B.mekanik));
  const r = useMemo(() => rng(42), []);
  return (
    <group position={[3, 0, 0]}>
      {/* Córdoba skyline: mosque dome, minaret, buildings */}
      <group position={[0, cityLift * 0.3, -1.5]}>
        {/* Great Mosque dome */}
        <mesh position={[0, 0.4 * cityLift, 0]} castShadow scale={[cityDraw, cityDraw, cityDraw]}>
          <sphereGeometry args={[0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={lerpColor(P.clay, P.paperShade, 0.3)} roughness={0.85} />
        </mesh>
        {/* Minaret */}
        <mesh position={[1.2, 0.6 * cityLift, 0]} castShadow scale={[cityDraw, cityDraw, cityDraw]}>
          <boxGeometry args={[0.25, 1.4, 0.25]} />
          <meshStandardMaterial color={P.clay} roughness={0.85} />
        </mesh>
        {/* Buildings row */}
        {[-1.5, -0.6, 0.4, 1.8, 2.5].map((x, i) => (
          <mesh key={i} position={[x, (0.15 + r() * 0.25) * cityLift, r() * 0.3]} castShadow scale={[cityDraw, cityDraw, cityDraw]}>
            <boxGeometry args={[0.4 + r() * 0.3, 0.3 + r() * 0.5, 0.35]} />
            <meshStandardMaterial color={lerpColor(P.paperShade, P.clay, r())} roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* Ibn Firnas figure: simple polymath at desk */}
      <group position={[2, 0, 1]} scale={[figDraw, figDraw, figDraw]}>
        {/* body */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <meshStandardMaterial color={P.graphite} roughness={0.7} />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={P.clay} roughness={0.8} />
        </mesh>
        {/* turban */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <sphereGeometry args={[0.11, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={P.paperWhite} roughness={0.9} />
        </mesh>
        {/* desk */}
        <mesh position={[0.3, 0.2, 0]} castShadow>
          <boxGeometry args={[0.5, 0.04, 0.35]} />
          <meshStandardMaterial color={P.wood} roughness={0.8} />
        </mesh>
        {/* scrolls */}
        {inventDraw > 0 && (
          <group position={[0.3, 0.23, 0]} scale={[inventDraw, inventDraw, inventDraw]}>
            <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.2, 6]} />
              <meshStandardMaterial color={P.paperShade} roughness={0.9} />
            </mesh>
            <mesh position={[0.1, 0, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.18, 6]} />
              <meshStandardMaterial color={P.paper} roughness={0.9} />
            </mesh>
          </group>
        )}
      </group>
      <SketchLabel position={[-1, 0.01, 3]} text="Córdoba, 875 M" opacity={cityDraw} />
    </group>
  );
};

// --- Main zone (x ≈ 8-9): Wing workshop ---

export const WorkshopZone: React.FC<{ t: number }> = ({ t }) => {
  const studyDraw = smooth(prog(t, B.mengamati, B.bertahun));
  const buildDraw = smooth(prog(t, B.membangun, B.sutra));
  const wingColor = smooth(prog(t, B.sayap, B.sutra));
  return (
    <group position={[8, 0, 0]}>
      {/* Workbench */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2, 0.06, 1.2]} />
        <meshStandardMaterial color={P.wood} roughness={0.8} />
      </mesh>
      {/* Bench legs */}
      {[[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} castShadow>
          <boxGeometry args={[0.06, 0.24, 0.06]} />
          <meshStandardMaterial color={P.wood} roughness={0.85} />
        </mesh>
      ))}
      {/* Bird study sketches on bench */}
      {studyDraw > 0 && (
        <group position={[-0.5, 0.3, 0]} scale={[studyDraw, studyDraw, studyDraw]}>
          {/* Bird silhouette */}
          <mesh castShadow rotation={[-Math.PI / 2, 0, 0.1]}>
            <planeGeometry args={[0.4, 0.3]} />
            <meshStandardMaterial color={P.graphiteMid} side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        </group>
      )}
      {/* Large wings being built */}
      {buildDraw > 0 && (
        <group position={[0.3, 0.3, 0]} scale={[buildDraw, buildDraw, buildDraw]}>
          {[-1, 1].map((side) => (
            <FeatheredWing key={side} side={side} colorK={wingColor} />
          ))}
          {/* Silk frame ribs */}
          {[-1, 1].map((side) => (
            <mesh key={`rib${side}`} position={[side * 0.6, 0.15, 0]} castShadow rotation={[0, 0, side * 0.3]}>
              <cylinderGeometry args={[0.02, 0.015, 1.4, 6]} />
              <meshStandardMaterial color={P.wood} roughness={0.75} />
            </mesh>
          ))}
        </group>
      )}
      <SketchLabel position={[0, 0.01, 1.8]} text="sayap bulu nasar + rangka sutra" opacity={buildDraw} />
    </group>
  );
};

const FeatheredWing: React.FC<{ side: number; colorK: number }> = ({ side, colorK }) => {
  return (
    <group>
      {Array.from({ length: 12 }, (_, i) => {
        const frac = i / 11;
        const span = 0.9 * (1 - frac * 0.2);
        const y = 0.03 + frac * 0.08;
        return (
          <mesh key={i} position={[side * span * frac * 0.1, y, (frac - 0.5) * 0.6]} castShadow rotation={[0, 0, side * 0.15 * frac]}>
            <boxGeometry args={[0.6 * (1 - frac * 0.3), 0.01, 0.06]} />
            <meshStandardMaterial
              color={lerpColor(P.graphiteMid, P.accent, colorK * (0.3 + frac * 0.2))}
              roughness={0.75}
              metalness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Cliff zone (x ≈ 12-16): Rusafa cliff + flight ---

export const CliffZone: React.FC<{ t: number }> = ({ t }) => {
  const cliffDraw = smooth(prog(t, B.tujuhPuluh, B.bukit));
  const figureAtCliff = smooth(prog(t, B.bukit, B.rusafa));
  const jumpK = smooth(prog(t, B.explStart, B.melompat));
  const flightK = smooth(prog(t, B.melompat + 0.3, B.burung));
  const crashK = smooth(prog(t, B.mendarat, B.cedera));
  const flightArc = Math.sin(flightK * Math.PI) * 2.5;
  const flightX = flightK * 3;
  const crashed = crashK > 0;
  return (
    <group position={[13, 0, 0]}>
      {/* Cliff face */}
      <group scale={[cliffDraw, cliffDraw, cliffDraw]}>
        <mesh position={[0, 1.2, -1]} castShadow>
          <boxGeometry args={[3, 2.4, 1.5]} />
          <meshStandardMaterial color={P.clay} roughness={0.9} />
        </mesh>
        {/* Cliff top platform */}
        <mesh position={[0, 2.45, -0.5]} castShadow>
          <boxGeometry args={[2, 0.1, 2]} />
          <meshStandardMaterial color={P.paperShade} roughness={0.85} />
        </mesh>
      </group>
      {/* Córdoba city below the cliff */}
      {cliffDraw > 0.5 && (
        <group position={[2, 0, -2]} scale={[0.4, 0.4, 0.4]}>
          {Array.from({ length: 8 }, (_, i) => {
            const rx = rng(i + 100);
            return (
              <mesh key={i} position={[rx() * 4 - 2, rx() * 0.3, rx() * 2 - 1]} castShadow>
                <boxGeometry args={[0.3 + rx() * 0.2, 0.2 + rx() * 0.4, 0.3]} />
                <meshStandardMaterial color={P.clay} roughness={0.9} />
              </mesh>
            );
          })}
        </group>
      )}
      {/* Crowd dots */}
      {figureAtCliff > 0.3 && (
        <group position={[1, 0.01, 1]}>
          {Array.from({ length: 12 }, (_, i) => {
            const rx = rng(i + 200);
            return (
              <mesh key={i} position={[(rx() - 0.5) * 3, 0.05, rx() * 1.5]} castShadow>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshStandardMaterial color={P.graphiteMid} roughness={0.8} />
              </mesh>
            );
          })}
        </group>
      )}
      {/* Flying figure */}
      <group position={[flightX, 2.5 + flightArc - crashK * 2, jumpK * -0.5]} rotation={[crashK * 0.8, 0, crashed ? 0.3 : 0]}>
        {/* Body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <meshStandardMaterial color={P.accentDeep} roughness={0.65} />
        </mesh>
        {/* Wings spread */}
        {!crashed && [-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.5, 0.05, 0]} castShadow rotation={[0, 0, side * (0.2 + flightK * 0.15)]}>
            <boxGeometry args={[0.8, 0.02, 0.35]} />
            <meshStandardMaterial color={lerpColor(P.graphite, P.accent, 0.5)} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* Broken wings after crash */}
        {crashed && [-1, 1].map((side) => (
          <mesh key={`broken${side}`} position={[side * 0.3, -0.1, 0]} castShadow rotation={[0.3, 0, side * 0.6]}>
            <boxGeometry args={[0.5, 0.02, 0.25]} />
            <meshStandardMaterial color={P.graphiteMid} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <SketchLabel position={[0, 0.01, 3]} text="Rusafa, Córdoba — usia 70 tahun" opacity={cliffDraw} />
    </group>
  );
};

// --- Payoff zone (x ≈ 19-22): Timeline ---

export const TimelineZone: React.FC<{ t: number }> = ({ t }) => {
  const tlDraw = smooth(prog(t, B.payStart, B.daVinci));
  const vinciDraw = smooth(prog(t, B.daVinci, B.terbangnya));
  const wrightDraw = smooth(prog(t, B.seribuPay, B.berhasil));
  const heroK = smooth(prog(t, B.tapi875, B.melompatPay));
  const moonK = smooth(prog(t, B.namanya, B.bulan));
  return (
    <group position={[19, 0, 0]}>
      {/* Timeline line */}
      <mesh position={[2, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 0.03]} />
        <meshBasicMaterial color={P.graphite} transparent opacity={tlDraw * 0.7} />
      </mesh>
      {/* 875 marker - Ibn Firnas */}
      <TimelineMarker x={0} y={0} label="875" desc="Ibn Firnas" drawK={tlDraw} accent color={P.accent} />
      {/* 1485 marker - Da Vinci */}
      <TimelineMarker x={2} y={0} label="1485" desc="Da Vinci" drawK={vinciDraw} color={P.graphiteMid} />
      {/* 1903 marker - Wright Bros */}
      <TimelineMarker x={4} y={0} label="1903" desc="Wright Brothers" drawK={wrightDraw} color={P.graphiteMid} />
      {/* Hero emphasis on 875 */}
      {heroK > 0 && (
        <mesh position={[0, 0.5 * heroK, 0]} castShadow>
          <sphereGeometry args={[0.2 * heroK, 12, 12]} />
          <meshStandardMaterial color={P.accent} emissive={P.accentGlow} emissiveIntensity={0.3 * heroK} roughness={0.5} />
        </mesh>
      )}
      {/* Moon crater */}
      {moonK > 0 && (
        <group position={[5.5, 1.5 * moonK, -0.5]} scale={[moonK, moonK, moonK]}>
          <mesh castShadow>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color={P.clay} roughness={0.95} />
          </mesh>
          {/* Crater label */}
          <mesh position={[0, 0, 0.62]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.4, 0.12]} />
            <meshStandardMaterial color={P.graphite} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      <SketchLabel position={[2, 0.01, 2.5]} text="600 tahun sebelum Da Vinci" opacity={tlDraw} />
    </group>
  );
};

const TimelineMarker: React.FC<{ x: number; y: number; label: string; desc: string; drawK: number; accent?: boolean; color: string }> = ({ x, y, label, desc, drawK, accent, color }) => (
  <group position={[x, 0, y]} scale={[drawK, drawK, drawK]}>
    <mesh position={[0, 0.02, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.08, 0.04, 8]} />
      <meshStandardMaterial color={accent ? P.accent : color} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[0.02, 0.5, 0.02]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  </group>
);

// --- Outro zone (x ≈ 24) ---

export const OutroZone: React.FC<{ t: number }> = ({ t }) => {
  const drawK = smooth(prog(t, B.audira - 0.5, B.audira + 0.5));
  return (
    <group position={[24, 0, 0]}>
      <mesh position={[0, 0.5 * drawK, 0]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.8]} />
        <meshStandardMaterial color={P.accent} roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
};

// --- Shared: sketch label on paper ---

const SketchLabel: React.FC<{ position: V3; text: string; opacity: number }> = ({ position, text, opacity }) => {
  if (opacity <= 0) return null;
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 0.2]} />
        <meshBasicMaterial color={P.graphiteSoft} transparent opacity={opacity * 0.5} />
      </mesh>
    </group>
  );
};
