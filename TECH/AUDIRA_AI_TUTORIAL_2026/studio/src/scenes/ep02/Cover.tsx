// EP02 cover: "Edit Foto Cukup Ngetik" in TOYDIORAMA.
// A miniature theatre stage turned photo studio. The backdrop is split: left half a plain home
// wall, right half a blue passport-photo backdrop. The same toy figure stands twice: casual tee
// in front of the home wall, suit and tie in front of the blue. A toy camera on a tripod sits
// centre-front, and a toy chat bubble hangs from the fly with the typed edit command.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, LEG_LENGTH, type Pose } from "../../core/polish/Person.tsx";
import { TOYDIORAMA_PALETTE as PAL } from "../../kits/toydiorama/lib/palette";

type V3 = [number, number, number];

const BG = "#0E141D";
const PASFOTO_BLUE = "#1f57c8";
const WALL = "#e9dcc3";

// ------------------------------------------------------------------------------------------
// Canvas textures (deterministic: no randomness, system fonts only).
const texCache = new Map<string, THREE.CanvasTexture>();
export function canvasTex(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
}

const blueBackdropTex = () =>
  canvasTex("blue", 512, 768, (c) => {
    const g = c.createRadialGradient(256, 330, 40, 256, 380, 520);
    g.addColorStop(0, "#4f86ec");
    g.addColorStop(0.55, "#2a62d2");
    g.addColorStop(1, "#173f9a");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 768);
  });

const wallpaperTex = () =>
  canvasTex("wall", 512, 768, (c) => {
    c.fillStyle = WALL;
    c.fillRect(0, 0, 512, 768);
    // soft vertical stripes + a tiny diamond motif, like printed wallpaper
    for (let x = 0; x < 512; x += 64) {
      c.fillStyle = "rgba(196,170,128,0.22)";
      c.fillRect(x, 0, 22, 768);
    }
    c.fillStyle = "rgba(170,120,80,0.25)";
    for (let y = 24; y < 768; y += 56)
      for (let x = 43; x < 512; x += 64) {
        c.beginPath();
        c.moveTo(x, y - 6);
        c.lineTo(x + 5, y);
        c.lineTo(x, y + 6);
        c.lineTo(x - 5, y);
        c.fill();
      }
    // skirting board
    c.fillStyle = "#b98d63";
    c.fillRect(0, 700, 512, 68);
    c.fillStyle = "#9c7250";
    c.fillRect(0, 700, 512, 6);
  });

const skyTex = () =>
  canvasTex("sky", 256, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#8fc4f0");
    g.addColorStop(1, "#e8f3fb");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = "rgba(255,255,255,0.9)";
    [[70, 90, 34], [110, 84, 26], [180, 150, 24], [205, 146, 18]].forEach(([x, y, r]) => {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = "#7fb36d";
    c.fillRect(0, 210, 256, 46);
  });

const bubbleTextTex = () =>
  canvasTex("bubble", 1024, 400, (c) => {
    c.clearRect(0, 0, 1024, 400);
    c.fillStyle = "#1c1f24";
    c.textBaseline = "middle";
    c.font = "800 92px 'Arial Black', 'Segoe UI', Arial, sans-serif";
    c.fillText("ganti latar biru,", 56, 132);
    c.fillText("pakai jas", 56, 262);
    // blinking-caret style cursor after the text
    c.fillStyle = "#2f6fde";
    c.fillRect(56 + c.measureText("pakai jas").width + 18, 214, 12, 96);
  });

const plaqueTex = () =>
  canvasTex("plaque", 1024, 256, (c) => {
    c.clearRect(0, 0, 1024, 256);
    c.fillStyle = "#f6e7c4";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "900 150px 'Arial Black', Arial, sans-serif";
    c.fillText("AUDIRA", 512, 136);
  });

const tagTex = (label: string, ink: string) =>
  canvasTex(`tag:${label}`, 512, 160, (c) => {
    c.fillStyle = PAL.paperCard;
    c.fillRect(0, 0, 512, 160);
    c.fillStyle = ink;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "900 84px 'Arial Black', Arial, sans-serif";
    c.fillText(label, 256, 88);
  });

// ------------------------------------------------------------------------------------------
const mats = new Map<string, THREE.Material>();
export const phys = (kind: keyof typeof POLISH, color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) => {
  const key = `${kind}:${color}:${JSON.stringify(extra)}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ ...POLISH[kind], color: new THREE.Color(color), ...extra });
    mats.set(key, m);
  }
  return m;
};

// ------------------------------------------------------------------------------------------
export const Stage: React.FC = () => {
  const grain = useMemo(() => surfaceGrain(11, 256, 0.3, 4), []);
  const planks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  return (
    <group>
      {/* back wall void */}
      <mesh position={[0, 2.6, -2.4]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={BG} roughness={0.95} />
      </mesh>
      {/* walnut planks */}
      {planks.map((i) => (
        <mesh key={i} position={[i * 0.3, -0.06, 0.0]} receiveShadow>
          <RoundedBoxGeo args={[0.29, 0.12, 2.06]} radius={0.015} />
          <meshPhysicalMaterial
            {...POLISH.stone}
            roughness={0.62}
            clearcoat={0.25}
            clearcoatRoughness={0.5}
            color={i % 2 === 0 ? "#4a3222" : "#5a3d29"}
            bumpMap={grain}
            bumpScale={0.6}
          />
        </mesh>
      ))}
      {/* apron fascia */}
      <mesh position={[0, -0.16, 1.05]}>
        <RoundedBoxGeo args={[3.2, 0.3, 0.1]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.stone} roughness={0.7} color={PAL.stageTrim} bumpMap={grain} bumpScale={0.4} />
      </mesh>
      {/* footlights */}
      {[-0.8, -0.22, 0.22, 0.8].map((x) => (
        <group key={x} position={[x, 0.02, 0.9]}>
          <mesh position={[0, 0.0, 0]}>
            <cylinderGeometry args={[0.06, 0.075, 0.05, 16]} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2a1a10" />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <sphereGeometry args={[0.045, 20, 16]} />
            <meshStandardMaterial color={PAL.footlights} emissive={PAL.footlights} emissiveIntensity={2.2} roughness={0.25} />
          </mesh>
          <pointLight color={PAL.footlights} intensity={0.5} distance={1.4} decay={2} position={[0, 0.1, -0.12]} />
        </group>
      ))}
      {/* velvet drapes: several folds per side */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.96, 1.6, 0.55]}>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[side * k * 0.08, 0, (k % 2) * 0.05]}>
              <cylinderGeometry args={[0.07, 0.085, 3.4, 18]} />
              <meshPhysicalMaterial {...POLISH.fabric} color={k % 2 ? "#5c141d" : PAL.curtainVelvet} sheenColor={new THREE.Color("#ff8a8a")} />
            </mesh>
          ))}
        </group>
      ))}
      {/* top valance */}
      <mesh position={[0, 2.62, 0.6]}>
        <RoundedBoxGeo args={[2.8, 0.28, 0.16]} radius={0.05} />
        <meshPhysicalMaterial {...POLISH.fabric} color={PAL.curtainVelvet} sheenColor={new THREE.Color("#ff8a8a")} />
      </mesh>
    </group>
  );
};

const PANEL_Z = -0.7;
const PANEL_W = 1.12;
const PANEL_H = 1.32;

/** Left half: plain home wall with window, framed picture and a potted plant. */
const HomeFlat: React.FC = () => {
  const wall = useMemo(() => wallpaperTex(), []);
  const sky = useMemo(() => skyTex(), []);
  const wood = "#c08a57";
  return (
    <group position={[-PANEL_W / 2 - 0.01, PANEL_H / 2, PANEL_Z]}>
      <mesh receiveShadow>
        <RoundedBoxGeo args={[PANEL_W, PANEL_H, 0.05]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.paper} map={wall} />
      </mesh>
      {/* window */}
      <group position={[-0.2, 0.1, 0.04]}>
        <mesh>
          <RoundedBoxGeo args={[0.5, 0.56, 0.04]} radius={0.012} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4efe6" />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.42, 0.48]} />
          <meshStandardMaterial map={sky} emissiveMap={sky} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.025, 0.48, 0.015]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4efe6" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.42, 0.025, 0.015]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4efe6" />
        </mesh>
        {/* curtains */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.27, -0.02, 0.05]}>
            <RoundedBoxGeo args={[0.11, 0.66, 0.035]} radius={0.016} />
            <meshPhysicalMaterial {...POLISH.fabric} color="#d9734e" />
          </mesh>
        ))}
        <mesh position={[0, 0.34, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 10]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={wood} />
        </mesh>
      </group>
      {/* framed picture */}
      <group position={[0.3, 0.22, 0.035]} rotation={[0, 0, -0.04]}>
        <mesh>
          <RoundedBoxGeo args={[0.2, 0.24, 0.025]} radius={0.008} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={wood} />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <planeGeometry args={[0.15, 0.19]} />
          <meshStandardMaterial color="#e9b949" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.03, 0.016]}>
          <circleGeometry args={[0.045, 20]} />
          <meshStandardMaterial color="#4a7c59" roughness={0.8} />
        </mesh>
      </group>
      {/* small shelf with books */}
      <group position={[0.32, -0.1, 0.06]}>
        <mesh>
          <RoundedBoxGeo args={[0.3, 0.025, 0.08]} radius={0.006} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={wood} />
        </mesh>
        {["#2f6fde", "#e8423f", "#1fa67a", "#f2b400"].map((c, i) => (
          <mesh key={c} position={[-0.09 + i * 0.045, 0.06 - (i % 2) * 0.01, 0]} rotation={[0, 0, i === 3 ? -0.3 : 0]}>
            <RoundedBoxGeo args={[0.035, 0.1 - (i % 2) * 0.02, 0.065]} radius={0.006} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={c} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Right half: passport-photo blue backdrop with a softbox. */
const BlueFlat: React.FC = () => {
  const blue = useMemo(() => blueBackdropTex(), []);
  return (
    <group position={[PANEL_W / 2 + 0.01, PANEL_H / 2, PANEL_Z]}>
      <mesh receiveShadow>
        <RoundedBoxGeo args={[PANEL_W, PANEL_H, 0.05]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.paper} roughness={0.75} map={blue} emissiveMap={blue} emissive="#ffffff" emissiveIntensity={0.12} />
      </mesh>
      {/* the backdrop sweeps onto the floor like a paper roll */}
      <mesh position={[0, -PANEL_H / 2 + 0.002, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[PANEL_W, 0.6]} />
        <meshPhysicalMaterial {...POLISH.paper} roughness={0.8} color="#2a5fc9" />
      </mesh>
      {/* roll tube on top */}
      <mesh position={[0, PANEL_H / 2 + 0.03, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, PANEL_W + 0.06, 20]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1d4cb0" />
      </mesh>
    </group>
  );
};

/** Glowing seam where the edit "wipes" the backdrop from home to blue. */
export const Seam: React.FC<{ f: number }> = ({ f }) => {
  const sparks: V3[] = [
    [0.0, 1.2, -0.6], [0.06, 0.95, -0.58], [-0.05, 0.72, -0.58], [0.04, 0.5, -0.6], [-0.03, 0.26, -0.58], [0.08, 1.33, -0.56],
  ];
  return (
    <group>
      <mesh position={[0, PANEL_H / 2, PANEL_Z + 0.03]}>
        <boxGeometry args={[0.022, PANEL_H, 0.02]} />
        <meshStandardMaterial color="#fff4d6" emissive="#ffe3a0" emissiveIntensity={3.2} />
      </mesh>
      {sparks.map((p, i) => {
        const s = 0.03 + 0.012 * Math.sin(f * 0.08 + i * 1.7);
        return (
          <mesh key={i} position={p} rotation={[0.4, f * 0.02 + i, 0.6]} scale={[s, s * 1.6, s]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#fff2c8" emissive="#ffd36b" emissiveIntensity={2.6} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Suit pieces worn over a ToyPerson torso (figure frame: chest faces +z). */
export const SuitFront: React.FC = () => {
  const shirtGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.05, 0.0);
    s.lineTo(0.05, 0.0);
    s.lineTo(0.0, -0.13);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  const lapel = phys("fabric", "#141d33");
  return (
    <group position={[0, 0.272, 0.084]}>
      <mesh geometry={shirtGeo} position={[0, 0, 0.004]} rotation={[-0.32, 0, 0]}>
        <meshPhysicalMaterial {...POLISH.fabric} color="#f6f3ec" side={THREE.DoubleSide} />
      </mesh>
      {/* tie */}
      <mesh position={[0, -0.055, 0.03]} rotation={[-0.3, 0, 0]}>
        <RoundedBoxGeo args={[0.026, 0.1, 0.012]} radius={0.004} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#c8323a" />
      </mesh>
      <mesh position={[0, -0.002, 0.012]}>
        <sphereGeometry args={[0.016, 12, 10]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#c8323a" />
      </mesh>
      {/* lapels */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.045, -0.07, 0.012]} rotation={[-0.25, 0, s * 0.42]} material={lapel}>
          <RoundedBoxGeo args={[0.03, 0.15, 0.012]} radius={0.004} />
        </mesh>
      ))}
      {/* buttons */}
      {[-0.15, -0.19].map((y) => (
        <mesh key={y} position={[0, y, 0.012]}>
          <sphereGeometry args={[0.008, 10, 8]} />
          <meshPhysicalMaterial {...POLISH.glossyEye} color="#d8c18a" />
        </mesh>
      ))}
    </group>
  );
};

const SKIN = "#d09a6c";
const HAIR = "#2a1c14";

const Figures: React.FC<{ f: number }> = ({ f }) => {
  const scale = 0.94;
  const casual = useMemo(
    () => ({ skin: SKIN, hair: HAIR, hairStyle: 0 as const, top: "#ef7b3d", bottom: "#3b5b86", outfit: "casual" as const, build: 1, height: 1 }),
    [],
  );
  const suit = useMemo(
    () => ({ skin: SKIN, hair: HAIR, hairStyle: 0 as const, top: "#1d2a46", bottom: "#1d2a46", outfit: "casual" as const, build: 1.04, height: 1 }),
    [],
  );
  // Suit figure stands straight and still so the lapels sit on the chest.
  const base = poseAt("stand", f, 4);
  const straight: Pose = { ...base, body: [0, 0, 0], spine: [0, 0, 0], head: [0, -0.12, 0], ls: [0, 0, 0.1], rs: [0, 0, -0.1] };
  const casualPose: Pose = { ...poseAt("stand", f, 2), head: [0.04, 0.22, 0.05], ls: [-0.2, 0, 0.18], le: -0.5 };
  return (
    <group>
      <ToyPerson f={f} seed={2} look={casual} poseOverride={casualPose} position={[-0.5, 0, -0.05]} heading={0.18} scale={scale} />
      <group position={[0.5, 0, -0.05]} rotation={[0, -0.16, 0]} scale={scale}>
        <ToyPerson f={f} seed={4} look={suit} poseOverride={straight} />
        <group position={[0, LEG_LENGTH, 0]}>
          <SuitFront />
        </group>
      </group>
    </group>
  );
};

/** Toy photo camera on a wooden tripod, seen from behind-left. */
export const ToyCamera: React.FC<{ position?: V3; rotY?: number }> = ({ position = [0, 0, 0.5], rotY = 0.5 }) => {
  const body = phys("toyPlastic", "#22262d");
  const wood = phys("toyPlastic", PAL.stageDowel, { roughness: 0.6, clearcoat: 0.2 });
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* tripod */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.3;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.1, 0.24, Math.cos(a) * 0.1]} rotation={[-Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36]} material={wood}>
            <cylinderGeometry args={[0.012, 0.016, 0.52, 10]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.5, 0]} material={wood}>
        <cylinderGeometry args={[0.035, 0.035, 0.05, 14]} />
      </mesh>
      {/* body */}
      <group position={[0, 0.6, 0]}>
        <mesh material={body} castShadow>
          <RoundedBoxGeo args={[0.3, 0.17, 0.13]} radius={0.03} />
        </mesh>
        {/* grip stripe */}
        <mesh position={[0, -0.01, 0]}>
          <RoundedBoxGeo args={[0.305, 0.07, 0.135]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#8a5a34" />
        </mesh>
        {/* lens toward the figures (-z) */}
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={body}>
          <cylinderGeometry args={[0.058, 0.064, 0.09, 24]} />
        </mesh>
        <mesh position={[0, 0, -0.147]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.044, 0.044, 0.006, 24]} />
          <meshPhysicalMaterial {...POLISH.glossyEye} color="#0f1a2c" />
        </mesh>
        {/* top: flash + shutter */}
        <mesh position={[-0.08, 0.11, 0]}>
          <RoundedBoxGeo args={[0.09, 0.05, 0.08]} radius={0.012} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#e9e4da" />
        </mesh>
        <mesh position={[0.09, 0.1, 0.02]}>
          <cylinderGeometry args={[0.018, 0.018, 0.03, 14]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#d95d39" />
        </mesh>
        {/* back screen showing a tiny blue photo */}
        <mesh position={[0, 0.005, 0.067]}>
          <planeGeometry args={[0.2, 0.11]} />
          <meshStandardMaterial color="#3a73e0" emissive="#3a73e0" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, -0.005, 0.068]}>
          <circleGeometry args={[0.022, 18]} />
          <meshStandardMaterial color="#d09a6c" emissive="#d09a6c" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, -0.04, 0.068]}>
          <circleGeometry args={[0.035, 18, 0, Math.PI]} />
          <meshStandardMaterial color="#1d2a46" emissive="#1d2a46" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
};

/** Toy chat bubble on two fly wires carrying the typed command. */
const ChatBubble: React.FC<{ f: number }> = ({ f }) => {
  const text = useMemo(() => bubbleTextTex(), []);
  const tailGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.16, 0);
    s.lineTo(0.02, -0.16);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3 });
  }, []);
  const sway = Math.sin(f * 0.03) * 0.015;
  const W = 1.12;
  const H = 0.31;
  return (
    <group position={[-0.04, 1.11, 0.6]} rotation={[0.02, 0.05, -0.035 + sway]}>
      {/* wires up into the fly */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.5, 0.75, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 1.3, 6]} />
          <meshStandardMaterial color="#8c8577" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh castShadow>
        <RoundedBoxGeo args={[W, H, 0.07]} radius={0.034} segments={5} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#fbf8f2" />
      </mesh>
      <mesh geometry={tailGeo} position={[-0.06, -H / 2 + 0.02, -0.03]} scale={0.8}>
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#fbf8f2" />
      </mesh>
      <mesh position={[-0.1, 0.0, 0.0365]}>
        <planeGeometry args={[0.72, 0.28]} />
        <meshStandardMaterial map={text} transparent roughness={0.6} />
      </mesh>
      {/* send button */}
      <group position={[W / 2 - 0.12, -0.06, 0.04]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 28]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2f6fde" />
        </mesh>
        <mesh position={[0.008, 0, 0.018]} rotation={[0, 0, -Math.PI / 2]}>
          <circleGeometry args={[0.032, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};

/** "AUDIRA" plaque screwed to the stage apron. */
export const Plaque: React.FC = () => {
  const tex = useMemo(() => plaqueTex(), []);
  return (
    <group position={[0, -0.085, 1.11]}>
      <mesh>
        <RoundedBoxGeo args={[0.5, 0.13, 0.03]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1a4d3a" />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.47, 0.115]} />
        <meshStandardMaterial map={tex} transparent roughness={0.4} metalness={0.2} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.22, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.006, 12]} />
          <meshStandardMaterial color="#d8c18a" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

/** Paper tags taped to each backdrop half. */
const Tag: React.FC<{ label: string; ink: string; position: V3; rot: number }> = ({ label, ink, position, rot }) => {
  const tex = useMemo(() => tagTex(label, ink), [label, ink]);
  return (
    <group position={position} rotation={[-0.22, 0, rot]}>
      <mesh>
        <boxGeometry args={[0.36, 0.112, 0.006]} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} />
      </mesh>
      <mesh position={[0, 0.065, 0.005]} rotation={[0, 0, 0.06]}>
        <planeGeometry args={[0.16, 0.05]} />
        <meshStandardMaterial color="#ebcd78" transparent opacity={0.82} roughness={0.7} />
      </mesh>
    </group>
  );
};

/** Theatre floor in front of the stage: toy spotlight, director's chair and a coiled cable (soft focus). */
export const Foreground: React.FC = () => {
  const grain = useMemo(() => surfaceGrain(23, 256, 0.3, 6), []);
  const metal = phys("toyPlastic", "#2b2f36", { roughness: 0.35, clearcoat: 0.6 });
  const wood = phys("toyPlastic", "#b07a45", { roughness: 0.6 });
  const canvas = phys("fabric", "#c8323a");
  return (
    <group>
      <mesh position={[0, -0.31, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshPhysicalMaterial {...POLISH.stone} roughness={0.7} color="#2a1f18" bumpMap={grain} bumpScale={0.5} />
      </mesh>
      {/* toy spotlight on a stand, aimed at the stage */}
      <group position={[-0.62, -0.31, 1.75]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.2, 0]} material={metal}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 10]} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.sin(a) * 0.06, 0.02, Math.cos(a) * 0.06]} rotation={[Math.cos(a) * 1.2, 0, -Math.sin(a) * 1.2]} material={metal}>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
            </mesh>
          );
        })}
        <group position={[0, 0.44, 0]} rotation={[-0.35, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={metal}>
            <cylinderGeometry args={[0.07, 0.09, 0.2, 24]} />
          </mesh>
          <mesh position={[0, 0, -0.101]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.085, 24]} />
            <meshStandardMaterial color="#fff1cf" emissive="#ffd890" emissiveIntensity={2.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      {/* director's chair */}
      <group position={[0.66, -0.31, 1.85]} rotation={[0, -0.6, 0]}>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.1, 0.12, 0]} rotation={[0.5, 0, 0]} material={wood}>
              <RoundedBoxGeo args={[0.02, 0.3, 0.02]} radius={0.005} />
            </mesh>
            <mesh position={[s * 0.1, 0.12, 0]} rotation={[-0.5, 0, 0]} material={wood}>
              <RoundedBoxGeo args={[0.02, 0.3, 0.02]} radius={0.005} />
            </mesh>
            <mesh position={[s * 0.1, 0.32, -0.08]} material={wood}>
              <RoundedBoxGeo args={[0.02, 0.2, 0.02]} radius={0.005} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.25, 0]} material={canvas}>
          <RoundedBoxGeo args={[0.22, 0.015, 0.16]} radius={0.005} />
        </mesh>
        <mesh position={[0, 0.36, -0.085]} material={canvas}>
          <RoundedBoxGeo args={[0.22, 0.08, 0.012]} radius={0.004} />
        </mesh>
      </group>
      {/* coiled cable */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.05 + i * 0.012, -0.295 + i * 0.012, 1.6]} rotation={[-Math.PI / 2 + 0.05, 0, i]}>
          <torusGeometry args={[0.11 - i * 0.012, 0.009, 8, 40]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#191b1f" />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------
const CAM = { position: [0, 0.55, 5.8] as V3, target: [0, 0.68, 0] as V3, fov: 32 };

const Scene3D: React.FC<{ frame: number }> = ({ frame }) => {
  const { width, height } = useVideoConfig();
  const f = (frame / 30) * 60;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      camera={{ position: CAM.position, fov: CAM.fov, near: 0.1, far: 50 }}
      onCreated={({ camera }) => camera.lookAt(...CAM.target)}
    >
      <ambientLight intensity={0.32} color="#f5e8d3" />
      {/* warm 3200K key from upper right front */}
      <spotLight
        position={[2.4, 4.4, 4.2]}
        intensity={46}
        angle={0.42}
        penumbra={0.75}
        decay={2}
        color={PAL.keyLight}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
        target-position={[0, 0.7, 0]}
      />
      {/* cool rim from back left */}
      <directionalLight position={[-3, 3.5, -3]} intensity={1.1} color={PAL.rimLight} />
      {/* softbox wash on the blue half */}
      <pointLight position={[1.0, 1.4, 0.4]} intensity={1.6} distance={3} decay={2} color="#eaf1ff" />
      {/* warm lamp glow on the home half */}
      <pointLight position={[-0.8, 1.5, 0.1]} intensity={1.2} distance={2.6} decay={2} color="#ffcf8a" />
      {/* fill on the bubble */}
      <pointLight position={[0, 2.0, 2.2]} intensity={1.4} distance={3.5} decay={2} color="#fff3e2" />

      <Stage />
      <HomeFlat />
      <BlueFlat />
      <Seam f={f} />
      <Tag label="SEBELUM" ink="#3a2a1d" position={[-0.5, 0.075, 0.32]} rot={0.04} />
      <Tag label="SESUDAH" ink={PASFOTO_BLUE} position={[0.5, 0.075, 0.32]} rot={-0.04} />
      <Figures f={f} />
      <ToyCamera />
      <ChatBubble f={f} />
      <Foreground />
      <pointLight position={[0, 0.6, 2.6]} intensity={0.9} distance={2.5} decay={2} color="#ffb870" />
      <Plaque />
      <Finish frame={frame} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} focus={5.85} aperture={0.004} maxBlur={0.012} />
    </ThreeCanvas>
  );
};

const Headline: React.FC = () => (
  <div style={{ position: "absolute", left: 64, top: 262, right: 64, color: "#fff" }}>
    <div
      style={{
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: 30,
        letterSpacing: 6,
        color: PAL.propPrimary,
        fontWeight: 700,
        marginBottom: 14,
      }}
    >
      ● AUDIRA AI TUTORIAL
    </div>
    <div
      style={{
        fontFamily: "'Arial Black', 'Segoe UI Black', Arial, sans-serif",
        fontWeight: 900,
        fontSize: 112,
        lineHeight: 0.98,
        letterSpacing: -2,
        textShadow: "0 6px 24px rgba(0,0,0,0.65)",
      }}
    >
      EDIT FOTO
      <br />
      <span style={{ color: "#ffd166" }}>CUKUP NGETIK</span>
    </div>
  </div>
);

export const Ep02Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Scene3D frame={frame} />
      <Headline />
    </AbsoluteFill>
  );
};
