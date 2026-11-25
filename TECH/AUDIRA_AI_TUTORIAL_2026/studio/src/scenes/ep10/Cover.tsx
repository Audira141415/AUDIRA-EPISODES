// EP10 cover: "Chat AI-mu Disimpan?" (hapus riwayat Gemini) in FILMNOIR.
// A detective office at night: a steel filing cabinet with its top drawer pulled open, full of
// index cards printed with chat bubbles ("riwayat chat"). A banker's lamp on the cabinet lights the
// cards, moonlight falls through venetian blinds in stripes over the wall and cabinet, a ToyPerson
// drops a card into a bin stamped "HAPUS", and a small wall clock carries a "72 JAM" plate.
// Brass "AUDIRA" plate on the drawer. Everything is driven by the frame and seeded randomness.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH, RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, type Pose } from "../../core/polish/Person.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FILMNOIR_PALETTE as NP } from "../../kits/filmnoir/lib/palette.ts";
import { Ep10Overlay } from "./Overlay.tsx";

export type V3 = [number, number, number];
export const SERIF = "'Times New Roman', Georgia, serif";
export const MONO = "'Courier New', Courier, monospace";
export const BG = "#050608";

// ---------------------------------------------------------------- textures (seeded, cached)
export const texCache = new Map<string, THREE.CanvasTexture>();
export const canvasTex = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** Index card "RIWAYAT CHAT": typed header, then alternating chat bubbles with grey text bars. */
export const cardTex = (v: number) =>
  canvasTex(`card${v}`, 600, 360, (ctx) => {
    const r = prng(101 + v * 17);
    ctx.fillStyle = "#E9E0CC";
    ctx.fillRect(0, 0, 600, 360);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.22)" : "rgba(90,70,40,0.08)";
      ctx.fillRect(r() * 600, r() * 360, 1.5, 1.5);
    }
    // index-card rule: red top line, blue lines
    ctx.fillStyle = "rgba(180,40,40,0.55)";
    ctx.fillRect(0, 62, 600, 3);
    ctx.fillStyle = "rgba(60,90,150,0.18)";
    for (let y = 100; y < 360; y += 34) ctx.fillRect(0, y, 600, 2);
    ctx.fillStyle = "#2A2722";
    ctx.font = `bold 30px ${MONO}`;
    ctx.fillText("RIWAYAT CHAT", 22, 44);
    ctx.font = `24px ${MONO}`;
    ctx.fillStyle = "rgba(42,39,34,0.7)";
    ctx.fillText(`No. ${String(204 + v * 37).padStart(4, "0")}`, 430, 44);
    // bubbles
    let y = 82;
    for (let b = 0; b < 3; b++) {
      const right = (b + v) % 2 === 1;
      const bw = 260 + r() * 140;
      const bh = 62 + (b === 1 ? 20 : 0);
      const x = right ? 600 - 26 - bw : 26;
      ctx.fillStyle = right ? "rgba(52,48,42,0.9)" : "rgba(255,252,244,0.95)";
      ctx.strokeStyle = "rgba(42,39,34,0.75)";
      ctx.lineWidth = 3;
      roundRect(ctx, x, y, bw, bh, 22);
      ctx.fill();
      ctx.stroke();
      // tail
      ctx.beginPath();
      const tx = right ? x + bw - 30 : x + 30;
      ctx.moveTo(tx, y + bh - 2);
      ctx.lineTo(tx + (right ? 22 : -22), y + bh + 18);
      ctx.lineTo(tx + (right ? -6 : 6), y + bh - 2);
      ctx.fill();
      // text bars
      ctx.fillStyle = right ? "rgba(233,224,204,0.75)" : "rgba(60,56,50,0.55)";
      const lines = bh > 70 ? 2 : 1;
      for (let l = 0; l < lines + 1; l++) {
        const lw = (bw - 60) * (l === lines ? 0.55 : 0.85 + r() * 0.1);
        ctx.fillRect(x + 22, y + 16 + l * 20, lw, 9);
      }
      y += bh + 28;
    }
  });

/** Brass plate with engraved text. */
export const plateTex = (key: string, text: string, w = 512, h = 160, size = 92) =>
  canvasTex(key, w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#8C6A2E");
    g.addColorStop(0.35, "#F2D68E");
    g.addColorStop(0.55, "#B48A3E");
    g.addColorStop(1, "#6E5022");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = prng(key.length * 97 + 5);
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(60,40,10,${0.05 + r() * 0.08})`;
      ctx.fillRect(0, r() * h, w, 1);
    }
    ctx.strokeStyle = "rgba(50,34,8,0.7)";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.font = `900 ${size}px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // engraved, black-enamel filled letters with a bright lower bevel
    ctx.fillStyle = "rgba(255,240,200,0.75)";
    ctx.fillText(text, w / 2 + 2, h / 2 + 7);
    ctx.fillStyle = "#0E0802";
    ctx.fillText(text, w / 2, h / 2 + 4);
    // screws
    for (const sx of [26, w - 26]) {
      ctx.fillStyle = "#4A3510";
      ctx.beginPath();
      ctx.arc(sx, h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Red rubber stamp "HAPUS" on a cream label. */
export const stampTex = () =>
  canvasTex("stamp", 520, 240, (ctx) => {
    ctx.fillStyle = "#DCD2BC";
    ctx.fillRect(0, 0, 520, 240);
    const r = prng(77);
    ctx.save();
    ctx.translate(260, 120);
    ctx.rotate(-0.09);
    ctx.strokeStyle = "#C8202F";
    ctx.lineWidth = 12;
    ctx.strokeRect(-215, -82, 430, 164);
    ctx.lineWidth = 4;
    ctx.strokeRect(-198, -66, 396, 132);
    ctx.fillStyle = "#C8202F";
    ctx.font = `900 120px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HAPUS", 0, 8);
    ctx.restore();
    // worn ink: knock out speckles
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(220,210,188,${0.4 + r() * 0.6})`;
      ctx.fillRect(r() * 520, r() * 240, 2 + r() * 3, 2 + r() * 3);
    }
  });

/** Clock face (numerals + minute ticks); hands are separate meshes. */
export const clockTex = () =>
  canvasTex("clock", 512, 512, (ctx) => {
    const g = ctx.createRadialGradient(256, 230, 20, 256, 256, 256);
    g.addColorStop(0, "#F1E8D2");
    g.addColorStop(1, "#BFB291");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    ctx.translate(256, 256);
    ctx.fillStyle = "#1E1A14";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const long = i % 5 === 0;
      ctx.save();
      ctx.rotate(a);
      ctx.fillRect(-(long ? 5 : 2), -238, long ? 10 : 4, long ? 34 : 16);
      ctx.restore();
    }
    ctx.font = `bold 62px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let n = 1; n <= 12; n++) {
      const a = (n / 12) * Math.PI * 2;
      ctx.fillText(String(n), Math.sin(a) * 168, -Math.cos(a) * 168 + 3);
    }
  });

/** Dark plaster wall with a faint wainscot line. */
export const wallTex = () =>
  canvasTex("wall", 1024, 1024, (ctx) => {
    ctx.fillStyle = "#3A3631";
    ctx.fillRect(0, 0, 1024, 1024);
    const r = prng(9);
    for (let i = 0; i < 9000; i++) {
      const v = r();
      ctx.fillStyle = v > 0.5 ? `rgba(255,245,225,${0.03 + r() * 0.04})` : `rgba(0,0,0,${0.05 + r() * 0.07})`;
      ctx.fillRect(r() * 1024, r() * 1024, 2 + r() * 4, 2 + r() * 4);
    }
  });

/** Dark oak floor planks. */
export const floorTex = () =>
  canvasTex("floor", 1024, 1024, (ctx) => {
    const r = prng(31);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const base = 30 + r() * 14;
      ctx.fillStyle = `rgb(${base + 12},${base + 4},${base - 4})`;
      ctx.fillRect((i * 1024) / n, 0, 1024 / n, 1024);
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = `rgba(0,0,0,${0.06 + r() * 0.1})`;
        ctx.fillRect((i * 1024) / n + r() * (1024 / n), 0, 1 + r() * 2, 1024);
      }
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect((i * 1024) / n, 0, 3, 1024);
      const cut = r() * 1024;
      ctx.fillRect((i * 1024) / n, cut, 1024 / n, 3);
    }
  });

// ---------------------------------------------------------------- camera
export const CAM = { position: [0.95, 2.0, 7.7] as V3, target: [0.0, 0.84, 0.1] as V3, fov: 34 };
export const camPos = (t: number): V3 => [CAM.position[0] - t * 0.05, CAM.position[1] - t * 0.02, CAM.position[2] - t * 0.12];

export const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  const t = f / 60;
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...camPos(t));
    c.lookAt(...CAM.target);
    c.fov = CAM.fov;
    c.near = 0.05;
    c.far = 60;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }, [camera, t]);
  return null;
};

// ---------------------------------------------------------------- room
export const WALL_Z = -0.62;

export const Room: React.FC = () => {
  const wall = useMemo(() => {
    const t = wallTex();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    return t;
  }, []);
  const floor = useMemo(() => {
    const t = floorTex();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);
  const grain = useMemo(() => surfaceGrain(12, 256, 0.25, 6), []);
  return (
    <>
      <mesh position={[0, 3, WALL_Z]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial map={wall} bumpMap={grain} bumpScale={0.6} roughness={0.92} />
      </mesh>
      {/* chair rail */}
      <mesh position={[0, 0.95, WALL_Z + 0.02]} receiveShadow castShadow>
        <boxGeometry args={[16, 0.06, 0.04]} />
        <meshStandardMaterial color="#1E1A16" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.06, WALL_Z + 0.02]} receiveShadow>
        <boxGeometry args={[16, 0.12, 0.04]} />
        <meshStandardMaterial color="#15120F" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshLambertMaterial map={floor} />
      </mesh>
    </>
  );
};

// ---------------------------------------------------------------- filing cabinet
export const CAB = { x: -0.6, w: 0.86, h: 1.5, d: 0.8 };
export const CAB_Z = WALL_Z + 0.02 + CAB.d / 2;
export const FRONT_Z = CAB_Z + CAB.d / 2;
export const DRAWER_H = 0.46;
export const OPEN = 0.5;
export const steel = { color: "#2C302C", roughness: 0.42, metalness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.35 };
export const brass = { color: "#C9A25A", roughness: 0.3, metalness: 0.9 };

export const DrawerFront: React.FC<{ y: number; z: number; label?: string; labelKey: string }> = ({ y, z, label, labelKey }) => {
  const tex = useMemo(() => (label ? plateTex(labelKey, label, 512, 160, label === "AUDIRA" ? 104 : 92) : null), [label, labelKey]);
  return (
    <group position={[CAB.x, y, z]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[CAB.w - 0.06, DRAWER_H - 0.03, 0.035]} radius={0.012} />
        <meshPhysicalMaterial {...steel} color="#343933" />
      </mesh>
      {/* label plate */}
      {tex ? (
        <mesh position={[0, 0.095, 0.022]}>
          <planeGeometry args={label === "AUDIRA" ? [0.46, 0.144] : [0.3, 0.094]} />
          <meshStandardMaterial map={tex} roughness={0.32} metalness={0.75} />
        </mesh>
      ) : null}
      {/* cup handle */}
      <mesh position={[0, -0.03, 0.035]} castShadow>
        <RoundedBoxGeo args={[0.26, 0.05, 0.04]} radius={0.015} />
        <meshStandardMaterial {...brass} />
      </mesh>
    </group>
  );
};

export const CARDS: { dz: number; up: number; tilt: number; v: number; dx: number }[] = (() => {
  const r = prng(404);
  const out = [];
  for (let i = 0; i < 13; i++) {
    out.push({ dz: -0.36 + i * 0.058, up: 0.1 + r() * 0.1 + (i === 9 ? 0.16 : i === 5 ? 0.12 : 0), tilt: (r() - 0.5) * 0.12 - 0.12, v: i % 4, dx: (r() - 0.5) * 0.03 });
  }
  return out;
})();

export const Card: React.FC<{ v: number; position: V3; rotation?: V3; scale?: number }> = ({ v, position, rotation = [0, 0, 0], scale = 1 }) => {
  const tex = useMemo(() => cardTex(v), [v]);
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[0.62, 0.372, 0.004]} />
      <meshStandardMaterial attach="material-0" color="#D9CFB8" roughness={0.9} />
      <meshStandardMaterial attach="material-1" color="#D9CFB8" roughness={0.9} />
      <meshStandardMaterial attach="material-2" color="#D9CFB8" roughness={0.9} />
      <meshStandardMaterial attach="material-3" color="#D9CFB8" roughness={0.9} />
      <meshStandardMaterial attach="material-4" map={tex} roughness={0.88} />
      <meshStandardMaterial attach="material-5" color="#D2C8B0" roughness={0.9} />
    </mesh>
  );
};

export const Cabinet: React.FC = () => {
  const topY = CAB.h - DRAWER_H / 2 - 0.03;
  const openZ = FRONT_Z + OPEN;
  return (
    <group>
      {/* body shell: sides, top, back, plinth */}
      <mesh position={[CAB.x, CAB.h / 2, CAB_Z]} castShadow receiveShadow>
        <RoundedBoxGeo args={[CAB.w, CAB.h, CAB.d]} radius={0.02} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      {/* top drawer cavity (dark) */}
      <mesh position={[CAB.x, topY, FRONT_Z + 0.001]}>
        <planeGeometry args={[CAB.w - 0.06, DRAWER_H - 0.03]} />
        <meshStandardMaterial color="#030303" roughness={1} />
      </mesh>
      <DrawerFront y={CAB.h - DRAWER_H * 1.5 - 0.05} z={FRONT_Z + 0.018} label="ARSIP" labelKey="arsip" />
      <DrawerFront y={CAB.h - DRAWER_H * 2.5 - 0.07} z={FRONT_Z + 0.018} label="2026" labelKey="y2026" />
      {/* open drawer: front + sides + floor, cards inside */}
      <group>
        <DrawerFront y={topY} z={openZ + 0.018} label="AUDIRA" labelKey="audira" />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[CAB.x + s * (CAB.w / 2 - 0.07), topY - 0.07, openZ - 0.38]} castShadow receiveShadow>
            <boxGeometry args={[0.02, 0.28, 0.76]} />
            <meshPhysicalMaterial {...steel} color="#3A3F39" />
          </mesh>
        ))}
        <mesh position={[CAB.x, topY - 0.2, openZ - 0.38]} receiveShadow>
          <boxGeometry args={[CAB.w - 0.14, 0.02, 0.76]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
        {CARDS.map((c, i) => (
          <Card key={i} v={c.v} position={[CAB.x + c.dx, topY - 0.02 + c.up, openZ - 0.08 + (c.dz - 0.336) * 0.98]} rotation={[c.tilt, 0, c.dx * 2]} />
        ))}
      </group>
      {/* stray cards on top of the cabinet */}
      <Card v={2} position={[CAB.x + 0.12, CAB.h + 0.003, CAB_Z + 0.18]} rotation={[-Math.PI / 2, 0, 0.35]} scale={0.9} />
      <Card v={1} position={[CAB.x + 0.18, CAB.h + 0.008, CAB_Z + 0.24]} rotation={[-Math.PI / 2, 0, -0.18]} scale={0.9} />
    </group>
  );
};

// ---------------------------------------------------------------- banker's lamp on the cabinet
export const LAMP_BASE: V3 = [CAB.x - 0.24, CAB.h, CAB_Z - 0.14];
export const LAMP_HEAD: V3 = [CAB.x - 0.04, CAB.h + 0.42, CAB_Z + 0.14];

export const Lamp: React.FC = () => {
  const head = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    head.current?.lookAt(CAB.x, CAB.h - 0.1, FRONT_Z + OPEN - 0.2);
  }, []);
  const [bx, by, bz] = LAMP_BASE;
  const [hx, hy, hz] = LAMP_HEAD;
  const armLen = Math.hypot(hx - bx, hy - by - 0.05, hz - bz);
  const armMid: V3 = [(bx + hx) / 2, (by + 0.05 + hy) / 2, (bz + hz) / 2];
  const armQuat = useMemo(() => {
    const dir = new THREE.Vector3(hx - bx, hy - by - 0.05, hz - bz).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }, [bx, by, bz, hx, hy, hz]);
  return (
    <group>
      <mesh position={[bx, by + 0.025, bz]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.05, 40]} />
        <meshStandardMaterial {...brass} color="#B8914C" />
      </mesh>
      <mesh position={armMid} quaternion={armQuat} castShadow>
        <cylinderGeometry args={[0.014, 0.014, armLen, 16]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      <group ref={head} position={LAMP_HEAD}>
        {/* shade opens toward the group's +z */}
        {/* green glass banker's shade: glossy outside, glowing inner rim, brass trim */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.25, 0.24, 48, 1, true]} />
          <meshPhysicalMaterial color="#1D7A4C" emissive="#0F4A2C" emissiveIntensity={0.9} roughness={0.18} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} side={THREE.FrontSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.098, 0.247, 0.238, 48, 1, true]} />
          <meshStandardMaterial color="#F4E8C8" emissive="#FFE2A0" emissiveIntensity={1.4} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <torusGeometry args={[0.25, 0.014, 12, 64]} />
          <meshStandardMaterial {...brass} />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <torusGeometry args={[0.1, 0.012, 12, 48]} />
          <meshStandardMaterial {...brass} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.045, 24, 16]} />
          <meshStandardMaterial color="#FFF1C8" emissive="#FFD98A" emissiveIntensity={6} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- HAPUS bin, falling card
export const BIN: V3 = [0.32, 0, 0.82];

export const Bin: React.FC<{ f: number }> = ({ f }) => {
  const stamp = useMemo(stampTex, []);
  const t = f / 60;
  return (
    <group position={BIN}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 48, 1, true]} />
        <meshPhysicalMaterial color="#1D2124" roughness={0.35} metalness={0.7} clearcoat={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.25, 0.012, 12, 64]} />
        <meshStandardMaterial {...brass} color="#8E8A80" />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 40]} />
        <meshStandardMaterial color="#0B0C0D" />
      </mesh>
      {/* stamped label, slightly curved by sitting on the front */}
      <mesh position={[0.04, 0.27, 0.228]} rotation={[0.08, 0.17, 0]}>
        <planeGeometry args={[0.3, 0.14]} />
        <meshStandardMaterial map={stamp} roughness={0.8} />
      </mesh>
      {/* discarded cards sticking out */}
      <Card v={3} position={[-0.06, 0.48, -0.05]} rotation={[-0.35, 0.4, 0.3]} scale={0.62} />
      <Card v={0} position={[0.07, 0.46, 0.03]} rotation={[-0.2, -0.5, -0.38]} scale={0.62} />
      <Card v={1} position={[0.0, 0.42, -0.1]} rotation={[0.3, 0.1, 0.12]} scale={0.62} />
      {/* the card being dropped */}
      <group position={[0.16, 0.9 - Math.min(t * 0.05, 0.05), 0.06]} rotation={[-0.5 + Math.sin(t * 2) * 0.03, -0.35, 0.22]}>
        <Card v={2} position={[0, 0, 0]} scale={0.66} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- wall clock + 72 JAM plate
export const CLOCK: V3 = [1.0, 2.12, WALL_Z + 0.04];

export const Clock: React.FC<{ f: number }> = ({ f }) => {
  const face = useMemo(clockTex, []);
  const plate = useMemo(() => plateTex("72jam", "72 JAM", 512, 160, 96), []);
  const sec = (f / 60) * 0.2;
  return (
    <group position={CLOCK}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 64]} />
        <meshStandardMaterial {...brass} color="#6B5532" />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <circleGeometry args={[0.195, 64]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.026]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.205, 0.016, 12, 64]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      {/* hands: 10:10-ish, minute hand creeping */}
      <mesh position={[0, 0, 0.032]} rotation={[0, 0, -(-1.05)]}>
        <boxGeometry args={[0.012, 0.11, 0.004]} />
        <meshStandardMaterial color="#121010" />
      </mesh>
      <group rotation={[0, 0, -(1.05 + sec * 0.1)]} position={[0, 0, 0.036]}>
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.008, 0.15, 0.004]} />
          <meshStandardMaterial color="#121010" />
        </mesh>
      </group>
      <group rotation={[0, 0, -sec * 6]} position={[0, 0, 0.04]}>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.003, 0.17, 0.002]} />
          <meshStandardMaterial color="#B0202C" />
        </mesh>
      </group>
      <mesh position={[0, -0.32, 0]}>
        <boxGeometry args={[0.34, 0.106, 0.012]} />
        <meshStandardMaterial attach="material-0" {...brass} />
        <meshStandardMaterial attach="material-1" {...brass} />
        <meshStandardMaterial attach="material-2" {...brass} />
        <meshStandardMaterial attach="material-3" {...brass} />
        <meshStandardMaterial attach="material-4" map={plate} roughness={0.32} metalness={0.75} />
        <meshStandardMaterial attach="material-5" {...brass} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- venetian blinds (offscreen) + window light
export const WIN_LIGHT: V3 = [-5.2, 3.9, 3.4];
export const WIN_TARGET: V3 = [-0.2, 1.0, WALL_Z];

export const Blinds: React.FC<{ light?: V3; target?: V3 }> = ({ light = WIN_LIGHT, target = WIN_TARGET }) => {
  const g = useRef<THREE.Group>(null);
  const dir = new THREE.Vector3(...target).sub(new THREE.Vector3(...light)).normalize();
  const pos = new THREE.Vector3(...light).addScaledVector(dir, 1.0);
  useLayoutEffect(() => {
    g.current?.lookAt(...target);
  }, [target]);
  const slats = Array.from({ length: 34 }, (_, i) => -0.7 + i * 0.042);
  return (
    <group ref={g} position={[pos.x, pos.y, pos.z]}>
      {slats.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.024, 0.004]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
};

export const SpotAt: React.FC<{
  position: V3;
  target: V3;
  intensity: number;
  color: string;
  angle: number;
  penumbra: number;
  decay?: number;
  shadow?: boolean;
  mapSize?: number;
}> = ({ position, target, intensity, color, angle, penumbra, decay = 2, shadow = false, mapSize = 2048 }) => {
  const light = useRef<THREE.SpotLight>(null);
  const tgt = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    tgt.position.set(...target);
    tgt.updateMatrixWorld();
    if (light.current) light.current.target = tgt;
  }, [tgt, target]);
  return (
    <>
      <primitive object={tgt} />
      <spotLight
        ref={light}
        position={position}
        intensity={intensity}
        color={color}
        angle={angle}
        penumbra={penumbra}
        decay={decay}
        castShadow={shadow}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-camera-near={0.2}
        shadow-camera-far={20}
        shadow-bias={-0.0003}
      />
    </>
  );
};

/** Faint additive cone under the lamp, on FX_LAYER so AO ignores it. */
export const LampBeam: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const top = new THREE.Vector3(...LAMP_HEAD);
  const bottom = new THREE.Vector3(CAB.x, CAB.h - 0.1, FRONT_Z + OPEN - 0.2);
  const len = top.distanceTo(bottom);
  const mid = top.clone().add(bottom).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), bottom.clone().sub(top).normalize());
  useLayoutEffect(() => {
    ref.current?.layers.set(FX_LAYER);
  }, []);
  return (
    <mesh ref={ref} position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.08, 0.36, len, 48, 1, true]} />
      <meshBasicMaterial color="#FFDFA0" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------------------------------------------------------------- foreground: rug, fallen cards, desk corner
export const FLOOR_LIGHT: V3 = [-5.6, 4.4, 7.2];
export const FLOOR_TARGET: V3 = [0.2, 0, 3.0];

export const rugTex = () =>
  canvasTex("rug", 1024, 768, (ctx) => {
    ctx.fillStyle = "#3B1F1A";
    ctx.fillRect(0, 0, 1024, 768);
    ctx.strokeStyle = "#6E5232";
    ctx.lineWidth = 18;
    ctx.strokeRect(40, 40, 944, 688);
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 80, 864, 608);
    ctx.fillStyle = "rgba(110,82,50,0.55)";
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(512, 384);
      ctx.rotate((i / 6) * Math.PI);
      ctx.fillRect(-260, -10, 520, 20);
      ctx.restore();
    }
    const r = prng(55);
    for (let i = 0; i < 14000; i++) {
      ctx.fillStyle = r() > 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,220,180,0.05)";
      ctx.fillRect(r() * 1024, r() * 768, 2, 2);
    }
  });

export const Foreground: React.FC = () => {
  const rug = useMemo(rugTex, []);
  const wood = { color: "#2A1C13", roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3, metalness: 0 };
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0.06]} position={[-0.1, 0.004, 2.75]} receiveShadow>
        <planeGeometry args={[3.0, 2.2]} />
        <meshLambertMaterial map={rug} />
      </mesh>
      {/* cards that slipped out of the drawer */}
      <Card v={0} position={[-0.55, 0.012, 3.35]} rotation={[-Math.PI / 2, 0, 0.5]} scale={0.95} />
      <Card v={3} position={[-0.15, 0.014, 3.75]} rotation={[-Math.PI / 2, 0, -0.32]} scale={0.95} />
      <Card v={2} position={[0.45, 0.012, 3.25]} rotation={[-Math.PI / 2, 0, 0.18]} scale={0.95} />
      <Card v={1} position={[-0.75, 0.016, 2.5]} rotation={[-Math.PI / 2, 0, -0.7]} scale={0.9} />
      <Card v={2} position={[0.05, 0.016, 2.2]} rotation={[-Math.PI / 2, 0, 0.9]} scale={0.85} />
      {/* desk corner in the right foreground: turned leg + apron */}
      <group position={[1.45, 0, 3.55]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.05, 0.84, 24]} />
          <meshPhysicalMaterial {...wood} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.06, 24, 16]} />
          <meshPhysicalMaterial {...wood} />
        </mesh>
        <mesh position={[0.4, 0.8, -0.4]} castShadow>
          <RoundedBoxGeo args={[0.9, 0.12, 0.9]} radius={0.02} />
          <meshPhysicalMaterial {...wood} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- person
export const PERSON_POS: V3 = [0.84, 0, 0.44];

export const Clerk: React.FC<{ f: number }> = ({ f }) => {
  const base = poseAt("stand", f, 4);
  const pose: Pose = { ...base, head: [0.28, 0.05, 0], spine: [0.1, 0, 0], ls: [-1.15, 0.2, 0.15], le: -0.35, rs: [0.05, 0, -0.1], re: -0.2 };
  return (
    <ToyPerson
      f={f}
      seed={4}
      outfit="casual"
      look={{ skin: "#c58f63", hair: "#17110d", top: "#4A4136", bottom: "#1B1D22", hairStyle: 0, height: 1, build: 1.05 }}
      poseOverride={pose}
      position={PERSON_POS}
      heading={-0.95}
      scale={1.4}
    />
  );
};

/** Felt fedora sitting on the clerk's head (follows the head pitch of the pose above). */
export const Fedora: React.FC = () => {
  const h = -0.95;
  const fwd = 0.1;
  return (
    <group position={[PERSON_POS[0] + Math.sin(h) * fwd, 1.25, PERSON_POS[2] + Math.cos(h) * fwd]} rotation={[0, h, 0]}>
      <group rotation={[0.3, 0, 0]}>
        <mesh position={[0, 0.115, 0]} castShadow>
          <cylinderGeometry args={[0.29, 0.29, 0.014, 48]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#24201C" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.175, 0.17, 40]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#24201C" />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.177, 0.18, 0.04, 40]} />
          <meshStandardMaterial color="#0D0B09" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- scene
export const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <color attach="background" args={[BG]} />
    <CameraRig f={f} />
    <ambientLight intensity={0.05} color="#4A5568" />
    <hemisphereLight args={["#3A4656", "#120E0A", 0.12]} />
    {/* moonlight through the blinds */}
    <SpotAt position={WIN_LIGHT} target={WIN_TARGET} intensity={340} color={NP.rimLightCool} angle={0.42} penumbra={0.35} shadow />
    <Blinds />
    {/* second window bay: blind stripes across the near floor (foreground layer) */}
    <SpotAt position={FLOOR_LIGHT} target={FLOOR_TARGET} intensity={300} color={NP.rimLightCool} angle={0.4} penumbra={0.3} shadow />
    <Blinds light={FLOOR_LIGHT} target={FLOOR_TARGET} />
    <Foreground />
    {/* banker's lamp pool on the cards */}
    <SpotAt position={LAMP_HEAD} target={[CAB.x, CAB.h - 0.1, FRONT_Z + OPEN - 0.2]} intensity={9} color={NP.streetLightTungsten} angle={0.75} penumbra={0.6} shadow mapSize={1024} />
    <pointLight position={[LAMP_HEAD[0], LAMP_HEAD[1] - 0.05, LAMP_HEAD[2] + 0.05]} intensity={0.35} color="#FFD98A" distance={2.5} />
    {/* warm key on the clerk + bin, cold rim from behind-right */}
    <SpotAt position={[2.6, 3.0, 3.2]} target={[0.6, 0.7, 0.6]} intensity={95} color="#FFD9A0" angle={0.33} penumbra={0.8} shadow mapSize={1024} />
    <directionalLight position={[3, 3.5, -3]} intensity={1.1} color={NP.rimLightCool} />
    {/* small picture lights: brass AUDIRA plate on the open drawer, 72 JAM clock plate */}
    <SpotAt position={[-0.2, 1.75, 3.0]} target={[CAB.x, CAB.h - DRAWER_H / 2 + 0.08, FRONT_Z + OPEN]} intensity={45} color="#FFE3A0" angle={0.12} penumbra={0.7} />
    <SpotAt position={[0.4, 1.2, 1.6]} target={[CLOCK[0], CLOCK[1] - 0.12, CLOCK[2]]} intensity={16} color="#FFE3A0" angle={0.2} penumbra={0.8} />
    <Room />
    <Cabinet />
    <Lamp />
    <LampBeam />
    <Bin f={f} />
    <Clock f={f} />
    <Clerk f={f} />
    <Fedora />
  </>
);

export const Ep10Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas flat width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM.position, fov: CAM.fov }}>
        <Scene f={f} />
        <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.72} envIntensity={0.1} hdri="studio" />
      </ThreeCanvas>
      <Ep10Overlay width={width} height={height} />
    </AbsoluteFill>
  );
};
