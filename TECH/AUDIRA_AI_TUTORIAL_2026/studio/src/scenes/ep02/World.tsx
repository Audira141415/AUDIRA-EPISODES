// EP02 film world: the cover's miniature photo-studio stage, driven by VO seconds `t`.
// Theatre logic for scene changes: wagons roll in from the wings (subject set, product set),
// photo prints and the chat window fly in from above on wires. One camera, cut per shot.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, LEG_LENGTH, type Pose } from "../../core/polish/Person.tsx";
import { sample, type Key } from "../../core/motion/track.ts";
import { clamp, ease, mix, remap } from "../../core/motion/easing.ts";
import { TOYDIORAMA_PALETTE as PAL } from "../../kits/toydiorama/lib/palette";
import { Stage, Foreground, Plaque, SuitFront, ToyCamera, canvasTex, phys } from "./Cover.tsx";

type V3 = [number, number, number];
const D = Math.PI / 180;
const io = (t: number, a: number, b: number) => ease.inOut(remap(t, a, b));
const outE = (t: number, a: number, b: number) => ease.out(remap(t, a, b));
const backOut = (x: number) => {
  const c = 1.9;
  const u = clamp(x) - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};

// ------------------------------------------------------------------------------------------
// Story state (all in VO seconds).
export const WIPE_HOOK: [number, number] = [10.35, 11.0];
export const WIPE_RESULT: [number, number] = [32.0, 32.4];
export const SUIT_AT = 48.15;
export const BRIGHT: [number, number] = [69.0, 69.6];

export const wipeAt = (t: number) => {
  if (t < 11.59) return io(t, WIPE_HOOK[0], WIPE_HOOK[1]);
  return io(t, WIPE_RESULT[0], WIPE_RESULT[1]);
};
const brightAt = (t: number) => io(t, BRIGHT[0], BRIGHT[1]);
/** Subject wagon x: rolls into the left wing while the product set is on stage. */
const subjectX = (t: number) => -2.5 * (io(t, 54.3, 55.1) - io(t, 62.3, 63.1));
const productX = (t: number) => 2.5 * (1 - io(t, 54.3, 55.1) + io(t, 62.3, 63.1));

// ------------------------------------------------------------------------------------------
// Dynamic canvas texture: redrawn only when its key changes.
function useDynTex(w: number, h: number) {
  return useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { ctx, tex, key: "" };
  }, [w, h]);
}

const BACK_W = 1.5;
const BACK_H = 1.62;

function drawBackdrop(c: CanvasRenderingContext2D, W: number, H: number, wipe: number, bright: number) {
  const red = c.createRadialGradient(W / 2, H * 0.42, 30, W / 2, H * 0.5, W * 1.05);
  red.addColorStop(0, "#e2564a");
  red.addColorStop(0.55, "#c2352d");
  red.addColorStop(1, "#86201c");
  c.fillStyle = red;
  c.fillRect(0, 0, W, H);
  if (wipe <= 0) return;
  c.save();
  c.beginPath();
  c.rect(0, 0, W * wipe, H);
  c.clip();
  const blue = c.createRadialGradient(W / 2, H * 0.42, 30, W / 2, H * 0.5, W * 1.05);
  blue.addColorStop(0, mixHex("#4f86ec", "#8fb7fb", bright));
  blue.addColorStop(0.55, mixHex("#2a62d2", "#5a8cec", bright));
  blue.addColorStop(1, mixHex("#173f9a", "#2f62c8", bright));
  c.fillStyle = blue;
  c.fillRect(0, 0, W, H);
  c.restore();
}

function mixHex(a: string, b: string, k: number) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const r = Math.round(mix(ch(pa, 16), ch(pb, 16), k));
  const g = Math.round(mix(ch(pa, 8), ch(pb, 8), k));
  const bl = Math.round(mix(ch(pa, 0), ch(pb, 0), k));
  return `rgb(${r},${g},${bl})`;
}

/** Pass-photo backdrop on a frame: red until the edit wipes it blue (seam glows while wiping). */
const Backdrop: React.FC<{ t: number }> = ({ t }) => {
  const dyn = useDynTex(384, 416);
  const wipe = wipeAt(t);
  const bright = brightAt(t);
  const key = `${wipe.toFixed(3)}:${bright.toFixed(3)}`;
  if (dyn.key !== key) {
    drawBackdrop(dyn.ctx, 384, 416, wipe, bright);
    dyn.tex.needsUpdate = true;
    dyn.key = key;
  }
  const seamOn = wipe > 0.001 && wipe < 0.999;
  return (
    <group position={[0, BACK_H / 2, -0.62]}>
      <mesh receiveShadow>
        <RoundedBoxGeo args={[BACK_W, BACK_H, 0.05]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.paper} roughness={0.78} map={dyn.tex} emissiveMap={dyn.tex} emissive="#ffffff" emissiveIntensity={0.14 + bright * 0.1} />
      </mesh>
      {/* sweep onto the floor */}
      <mesh position={[0, -BACK_H / 2 + 0.003, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[BACK_W, 0.6]} />
        <meshPhysicalMaterial {...POLISH.paper} roughness={0.85} color={wipe > 0.5 ? "#2a5fc9" : "#b53029"} />
      </mesh>
      {/* roll tube */}
      <mesh position={[0, BACK_H / 2 + 0.035, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, BACK_W + 0.06, 20]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#3a3f48" />
      </mesh>
      {seamOn && (
        <group position={[-BACK_W / 2 + wipe * BACK_W, 0, 0.04]}>
          <mesh>
            <boxGeometry args={[0.026, BACK_H, 0.02]} />
            <meshStandardMaterial color="#fff4d6" emissive="#ffe3a0" emissiveIntensity={3.4} />
          </mesh>
          {[0.55, 0.2, -0.15, -0.5].map((y, i) => (
            <mesh key={i} position={[0.02 * Math.sin(t * 9 + i), y + 0.04 * Math.sin(t * 7 + i * 2), 0.02]} rotation={[0.4, t * 3 + i, 0.6]} scale={0.035}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#fff2c8" emissive="#ffd36b" emissiveIntensity={2.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// ------------------------------------------------------------------------------------------
const SKIN = "#d09a6c";
const HAIR = "#2a1c14";
const CASUAL = { skin: SKIN, hair: HAIR, hairStyle: 0 as const, top: "#2f8f83", bottom: "#3b5b86", outfit: "casual" as const, build: 1, height: 1 };
const SUIT = { skin: SKIN, hair: HAIR, hairStyle: 0 as const, top: "#1a1d24", bottom: "#1a1d24", outfit: "casual" as const, build: 1.04, height: 1 };

/** The subject: casual tee until the "ganti baju" edit, then a black suit with white shirt. */
const Subject: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const suit = t >= SUIT_AT;
  // Hook beat 2: the figure glances toward the photo shop on the left.
  const glance = io(t, 3.6, 4.2) - io(t, 5.7, 6.3);
  const base = poseAt("stand", f, 2);
  const casualPose: Pose = { ...base, head: [0.03, base.head[1] * 0.5 + glance * 0.6, 0.03], ls: [-0.15, 0, 0.16], le: -0.4 };
  const straight: Pose = { ...base, body: [0, 0, 0], spine: [0, 0, 0], head: [0, base.head[1] * 0.3, 0], ls: [0, 0, 0.1], rs: [0, 0, -0.1] };
  // sparkle ring sweeping down the figure during the outfit swap
  const ring = remap(t, SUIT_AT - 0.45, SUIT_AT + 0.45);
  const ringOn = ring > 0 && ring < 1;
  return (
    <group position={[0, 0, -0.05]}>
      <group scale={0.94}>
        <ToyPerson f={f} seed={4} look={suit ? SUIT : CASUAL} poseOverride={suit ? straight : casualPose} />
        {suit && (
          <group position={[0, LEG_LENGTH, 0]}>
            <SuitFront />
          </group>
        )}
      </group>
      {ringOn && (
        <mesh position={[0, mix(1.15, 0.05, ease.inOut(ring)), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.012, 8, 48]} />
          <meshStandardMaterial color="#fff2c8" emissive="#ffd36b" emissiveIntensity={3.5} />
        </mesh>
      )}
    </group>
  );
};

// ------------------------------------------------------------------------------------------
const shopSignTex = () =>
  canvasTex("ep02:shopsign", 512, 128, (c) => {
    c.fillStyle = "#1a4d3a";
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = "#f6e7c4";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "900 66px 'Arial Black', Arial, sans-serif";
    c.fillText("STUDIO FOTO", 256, 68);
  });

/** Hook beat 2: a toy photo-studio shopfront wheeled in from the left wing, then crossed out. */
const ShopFront: React.FC<{ t: number }> = ({ t }) => {
  const on = io(t, 3.2, 3.75) - io(t, 6.0, 6.6);
  if (on <= 0.001) return null;
  const sign = shopSignTex();
  const x = mix(-1.8, -0.6, on);
  const xPop = backOut(remap(t, 4.7, 5.0));
  const wall = phys("toyPlastic", "#efe3cc");
  return (
    <group position={[x, 0, 0.28]} rotation={[0, 0.32, 0]}>
      <mesh position={[0, 0.34, 0]} material={wall} castShadow>
        <RoundedBoxGeo args={[0.5, 0.68, 0.08]} radius={0.02} />
      </mesh>
      {/* awning */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.2 + i * 0.1, 0.62, 0.08]} rotation={[0.55, 0, 0]}>
          <RoundedBoxGeo args={[0.1, 0.16, 0.02]} radius={0.006} />
          <meshPhysicalMaterial {...POLISH.fabric} color={i % 2 ? "#f4efe6" : "#c8323a"} />
        </mesh>
      ))}
      {/* sign */}
      <mesh position={[0, 0.75, 0.03]}>
        <RoundedBoxGeo args={[0.46, 0.12, 0.03]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1a4d3a" />
      </mesh>
      <mesh position={[0, 0.75, 0.047]}>
        <planeGeometry args={[0.44, 0.11]} />
        <meshStandardMaterial map={sign} roughness={0.5} />
      </mesh>
      {/* door + window */}
      <mesh position={[-0.11, 0.2, 0.045]}>
        <RoundedBoxGeo args={[0.15, 0.36, 0.02]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#7a4b2c" />
      </mesh>
      <mesh position={[0.11, 0.32, 0.045]}>
        <RoundedBoxGeo args={[0.17, 0.17, 0.02]} radius={0.01} />
        <meshStandardMaterial color="#9fd0f2" emissive="#9fd0f2" emissiveIntensity={0.25} roughness={0.2} />
      </mesh>
      {/* red X stamped over it */}
      {xPop > 0 && (
        <group position={[0, 0.38, 0.1]} scale={xPop}>
          {[-1, 1].map((s) => (
            <mesh key={s} rotation={[0, 0, s * 0.75]}>
              <RoundedBoxGeo args={[0.72, 0.09, 0.03]} radius={0.02} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color="#e0342f" emissive="#e0342f" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// ------------------------------------------------------------------------------------------
const BUBBLE_TEXT = "ganti latar biru";
const titleTex = () =>
  canvasTex("ep02:bubbletitle", 1024, 128, (c) => {
    c.fillStyle = "#1a4d3a";
    c.fillRect(0, 0, 1024, 128);
    c.fillStyle = "#f6e7c4";
    c.textBaseline = "middle";
    c.font = "900 64px 'Arial Black', Arial, sans-serif";
    c.fillText("AUDIRA AI TUTORIAL", 40, 68);
    c.fillStyle = "#e5a93c";
    c.beginPath();
    c.arc(960, 64, 20, 0, Math.PI * 2);
    c.fill();
  });

/** Hook beat 3: a toy chat window (title strip carries AUDIRA) flies in; the command types itself. */
const ChatWindow3D: React.FC<{ t: number }> = ({ t }) => {
  const dyn = useDynTex(1024, 220);
  const title = titleTex();
  const n = Math.round(BUBBLE_TEXT.length * remap(t, 8.75, 10.15));
  const caret = Math.floor(t * 2.4) % 2 === 0 || (n > 0 && n < BUBBLE_TEXT.length);
  const key = `${n}:${caret}`;
  if (dyn.key !== key) {
    const c = dyn.ctx;
    c.clearRect(0, 0, 1024, 220);
    c.fillStyle = "#1c1f24";
    c.textBaseline = "middle";
    c.font = "800 96px 'Arial Black', 'Segoe UI', Arial, sans-serif";
    const s = BUBBLE_TEXT.slice(0, n);
    c.fillText(s, 40, 112);
    if (caret) {
      c.fillStyle = "#2f6fde";
      c.fillRect(40 + c.measureText(s).width + 12, 62, 12, 100);
    }
    dyn.tex.needsUpdate = true;
    dyn.key = key;
  }
  const drop = outE(t, 5.95, 6.7) - io(t, 11.0, 11.6) * 0;
  if (t < 5.9 || t > 11.6) return null;
  const y = mix(2.9, 1.42, drop);
  const press = remap(t, 10.25, 10.45) - remap(t, 10.45, 10.7);
  const W = 1.12, H = 0.36;
  return (
    <group position={[0, y, 0.55]} rotation={[0.02, 0, Math.sin(t * 1.8) * 0.012]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.5, 0.85, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 1.4, 6]} />
          <meshStandardMaterial color="#8c8577" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh castShadow>
        <RoundedBoxGeo args={[W, H, 0.07]} radius={0.034} segments={5} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#fbf8f2" />
      </mesh>
      {/* title strip */}
      <mesh position={[0, H / 2 - 0.045, 0.037]}>
        <planeGeometry args={[W - 0.06, 0.07]} />
        <meshStandardMaterial map={title} roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, -0.04, 0.037]}>
        <planeGeometry args={[0.78, 0.17]} />
        <meshStandardMaterial map={dyn.tex} transparent roughness={0.6} />
      </mesh>
      <group position={[W / 2 - 0.12, -0.05, 0.04 - press * 0.02]} scale={1 - press * 0.12}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 28]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2f6fde" emissive="#2f6fde" emissiveIntensity={press * 0.8} />
        </mesh>
        <mesh position={[0.008, 0, 0.018]} rotation={[0, 0, -Math.PI / 2]}>
          <circleGeometry args={[0.032, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------------------------------
// Toy photo prints (canvas-drawn snapshots).
type Person2D = { x: number; shirt: string; suit?: boolean; skin?: string; s?: number };
export function drawPhoto(c: CanvasRenderingContext2D, W: number, H: number, bg: string, people: Person2D[]) {
  if (bg === "park") {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#8fc4f0");
    g.addColorStop(0.62, "#e8f3fb");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#6fa860";
    c.fillRect(0, H * 0.62, W, H * 0.38);
    c.fillStyle = "#4a7c59";
    [[0.12, 0.5, 0.13], [0.88, 0.47, 0.15], [0.7, 0.55, 0.08]].forEach(([x, y, r]) => {
      c.beginPath();
      c.arc(x * W, y * H, r * W, 0, Math.PI * 2);
      c.fill();
    });
  } else {
    const col = bg === "blue" ? ["#4f86ec", "#173f9a"] : bg === "red" ? ["#e2564a", "#86201c"] : bg === "green" ? ["#7cc48a", "#2f6b45"] : ["#ddd6c8", "#9d958a"];
    const g = c.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.5, W);
    g.addColorStop(0, col[0]);
    g.addColorStop(1, col[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  for (const p of people) {
    const s = (p.s ?? 1) * W;
    const cx = p.x * W;
    const sk = p.skin ?? SKIN;
    // shoulders
    c.fillStyle = p.shirt;
    c.beginPath();
    c.ellipse(cx, H + s * 0.06, s * 0.36, s * 0.34, 0, Math.PI, 0);
    c.fill();
    if (p.suit) {
      c.fillStyle = "#f6f3ec";
      c.beginPath();
      c.moveTo(cx - s * 0.08, H - s * 0.27);
      c.lineTo(cx + s * 0.08, H - s * 0.27);
      c.lineTo(cx, H - s * 0.06);
      c.fill();
      c.fillStyle = "#c8323a";
      c.fillRect(cx - s * 0.018, H - s * 0.24, s * 0.036, s * 0.16);
    }
    // neck + head
    c.fillStyle = sk;
    c.fillRect(cx - s * 0.06, H - s * 0.36, s * 0.12, s * 0.1);
    c.beginPath();
    c.arc(cx, H - s * 0.5, s * 0.17, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = HAIR;
    c.beginPath();
    c.arc(cx, H - s * 0.53, s * 0.175, Math.PI * 1.05, Math.PI * 1.95);
    c.fill();
    c.fillStyle = "#15100d";
    c.beginPath();
    c.arc(cx - s * 0.06, H - s * 0.49, s * 0.018, 0, Math.PI * 2);
    c.arc(cx + s * 0.06, H - s * 0.49, s * 0.018, 0, Math.PI * 2);
    c.fill();
  }
}

const photoTex = (key: string, bg: string, people: Person2D[]) =>
  canvasTex(`ep02:photo:${key}`, 300, 380, (c) => {
    drawPhoto(c, 300, 380, bg, people);
  });

const Print: React.FC<{ tex: THREE.Texture; position: V3; rot?: number; scale?: number; w?: number; h?: number; wires?: boolean }> = ({ tex, position, rot = 0, scale = 1, w = 0.42, h = 0.53, wires = true }) => (
  <group position={position} rotation={[0, 0, rot]} scale={scale}>
    {wires && (
      <mesh position={[0, 0.85, -0.01]}>
        <cylinderGeometry args={[0.003, 0.003, 1.4, 6]} />
        <meshStandardMaterial color="#8c8577" roughness={0.5} metalness={0.4} />
      </mesh>
    )}
    <mesh castShadow>
      <RoundedBoxGeo args={[w + 0.06, h + 0.08, 0.015]} radius={0.008} />
      <meshPhysicalMaterial {...POLISH.paper} color="#faf6ee" />
    </mesh>
    <mesh position={[0, 0.012, 0.009]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.55} />
    </mesh>
    {/* washi tape */}
    <mesh position={[0, h / 2 + 0.035, 0.012]} rotation={[0, 0, 0.08]}>
      <planeGeometry args={[0.16, 0.05]} />
      <meshStandardMaterial color="#ebcd78" transparent opacity={0.85} roughness={0.7} />
    </mesh>
  </group>
);

/** Penjelasan beat 3: three prints fly in, then merge into one new picture. */
const MergePrints: React.FC<{ t: number }> = ({ t }) => {
  if (t < 48.7 || t > 55.0) return null;
  const A = photoTex("A", "blue", [{ x: 0.5, shirt: "#1a1d24", suit: true }]);
  const B = photoTex("B", "green", [{ x: 0.5, shirt: "#f2b400", skin: "#b47a52" }]);
  const C = photoTex("C", "park", []);
  const M = photoTex("M", "park", [{ x: 0.33, shirt: "#1a1d24", suit: true, s: 0.85 }, { x: 0.68, shirt: "#f2b400", skin: "#b47a52", s: 0.85 }]);
  const exit = io(t, 54.2, 54.9);
  const merge = io(t, 52.1, 52.85);
  const items = [
    { tex: A, x: -0.5, delay: 0, rot: 0.06 },
    { tex: B, x: 0, delay: 0.22, rot: -0.03 },
    { tex: C, x: 0.5, delay: 0.44, rot: -0.07 },
  ];
  const mScale = backOut(remap(t, 52.6, 53.2));
  return (
    <group position={[0, exit * 1.6, 0.75]}>
      {merge < 0.999 &&
        items.map((it, i) => {
          const d = outE(t, 49.0 + it.delay, 49.8 + it.delay);
          const y = mix(1.6, 0, d) + 1.55;
          const sway = Math.sin(t * 1.6 + i * 2) * 0.03;
          return <Print key={i} tex={it.tex} position={[mix(it.x, 0, merge), y, -0.02 * i]} rot={mix(it.rot + sway, 0, merge)} scale={1 - merge * 0.85} />;
        })}
      {mScale > 0 && <Print tex={M} position={[0, 1.55, 0.05]} w={0.6} h={0.46} scale={mScale * 0.95} rot={Math.sin(t * 1.4) * 0.02} />}
      {merge > 0 && merge < 1 &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2 + t;
          const r = 0.15 + merge * 0.45;
          return (
            <mesh key={i} position={[Math.cos(a) * r, 1.55 + Math.sin(a) * r * 0.8, 0.1]} rotation={[0.4, a, 0.6]} scale={0.03}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#fff2c8" emissive="#ffd36b" emissiveIntensity={2.8} />
            </mesh>
          );
        })}
    </group>
  );
};

// ------------------------------------------------------------------------------------------
const jarLabelTex = () =>
  canvasTex("ep02:jarlabel", 512, 160, (c) => {
    c.fillStyle = "#faf6ee";
    c.fillRect(0, 0, 512, 160);
    c.fillStyle = "#6e4426";
    c.fillRect(0, 0, 512, 22);
    c.fillRect(0, 138, 512, 22);
    c.fillStyle = "#3a2a1d";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "900 96px 'Arial Black', Arial, sans-serif";
    c.fillText("KOPI", 256, 84);
  });

/** Penjelasan beat 4: product on a plain grey sweep, re-staged on a wooden table in morning light. */
const ProductSet: React.FC<{ t: number }> = ({ t }) => {
  const x = productX(t);
  const label = jarLabelTex();
  if (x > 2.45) return null;
  const reveal = io(t, 60.6, 61.5);
  const greyW = 1.2 * (1 - reveal);
  const sun = reveal;
  const wood = ["#9a6a3f", "#b07a45", "#a26f40", "#b98450"];
  const TOP = 0.32;
  return (
    <group position={[x, 0, 0.2]}>
      {/* pedestal table */}
      <mesh position={[0, TOP / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.0, TOP, 0.62]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#5a3d29" roughness={0.6} />
      </mesh>
      {/* wooden planks top (revealed) */}
      {wood.map((c, i) => (
        <mesh key={i} position={[0, TOP + 0.012, -0.23 + i * 0.155]} receiveShadow>
          <RoundedBoxGeo args={[1.02, 0.025, 0.15]} radius={0.006} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.55} clearcoat={0.3} color={c} />
        </mesh>
      ))}
      {/* window flat behind (revealed) */}
      <group position={[0, TOP + 0.45, -0.36]}>
        <mesh>
          <RoundedBoxGeo args={[1.1, 0.9, 0.03]} radius={0.01} />
          <meshPhysicalMaterial {...POLISH.paper} color="#f1e2c4" />
        </mesh>
        <mesh position={[-0.18, 0.06, 0.02]}>
          <RoundedBoxGeo args={[0.44, 0.52, 0.03]} radius={0.01} />
          <meshStandardMaterial color="#fff1cf" emissive="#ffd890" emissiveIntensity={0.9 * sun + 0.1} />
        </mesh>
        {[0, 1].map((i) => (
          <mesh key={i} position={[-0.18, 0.06, 0.04]} rotation={[0, 0, i * Math.PI / 2]}>
            <boxGeometry args={[0.02, 0.52, 0.02]} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4efe6" />
          </mesh>
        ))}
        {/* potted plant */}
        <group position={[0.34, -0.36, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.04, 0.08, 16]} />
            <meshPhysicalMaterial {...POLISH.clay} color="#c0643a" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.sin(i * 1.7) * 0.04, 0.09 + i * 0.02, Math.cos(i * 1.7) * 0.03]} rotation={[0.3 * Math.sin(i), i, 0.5 * Math.cos(i)]} scale={[0.025, 0.07, 0.012]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshPhysicalMaterial {...POLISH.clay} color="#4a7c59" />
            </mesh>
          ))}
        </group>
      </group>
      {/* morning light shafts */}
      {sun > 0.01 &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.05 + i * 0.12, TOP + 0.35, -0.05]} rotation={[0, 0, 0.55]}>
            <planeGeometry args={[0.08, 1.0]} />
            <meshBasicMaterial color="#ffd890" transparent opacity={0.13 * sun} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      {/* grey sweep (before): shrinks from the left as the edit wipes across */}
      {greyW > 0.005 && (
        <group position={[0.6 - greyW / 2, 0, 0]}>
          <mesh position={[0, TOP + 0.03, 0]}>
            <boxGeometry args={[greyW, 0.012, 0.64]} />
            <meshPhysicalMaterial {...POLISH.paper} color="#b9b4ab" />
          </mesh>
          <mesh position={[0, TOP + 0.47, -0.33]}>
            <boxGeometry args={[greyW, 0.94, 0.012]} />
            <meshPhysicalMaterial {...POLISH.paper} color="#c4bfb6" />
          </mesh>
        </group>
      )}
      {reveal > 0.001 && reveal < 0.999 && (
        <mesh position={[0.6 - greyW, TOP + 0.47, -0.2]}>
          <boxGeometry args={[0.02, 0.95, 0.02]} />
          <meshStandardMaterial color="#fff4d6" emissive="#ffe3a0" emissiveIntensity={3.4} />
        </mesh>
      )}
      {/* the product: same shape before and after */}
      <group position={[0.02, TOP + 0.04, 0.05]} rotation={[0, 0.1 + Math.sin(t * 0.5) * 0.05, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.095, 0.095, 0.24, 32]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4efe6" />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.097, 0.097, 0.1, 32, 1, true, -0.95, 1.9]} />
          <meshStandardMaterial map={label} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 32]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#6e4426" />
        </mesh>
      </group>
      <spotLight
        position={[-1.4, TOP + 1.0, 0.7]}
        intensity={14 * sun}
        angle={0.5}
        penumbra={0.8}
        decay={2}
        color="#ffcf8a"
        target-position={[0, TOP, 0]}
      />
    </group>
  );
};

// ------------------------------------------------------------------------------------------
/** Outro: a print of the result whose invisible watermark is revealed by a scanning light. */
const WatermarkPrint: React.FC<{ t: number }> = ({ t }) => {
  const dyn = useDynTex(300, 380);
  if (t < 77.8 || t > 83.9) return null;
  const scan = remap(t, 79.4, 81.0);
  const key = scan.toFixed(3);
  if (dyn.key !== key) {
    const c = dyn.ctx;
    drawPhoto(c, 300, 380, "blue", [{ x: 0.5, shirt: "#1a1d24", suit: true }]);
    if (scan > 0) {
      c.save();
      c.beginPath();
      c.rect(0, 0, 300 * scan, 380);
      c.clip();
      for (let y = 8; y < 380; y += 16)
        for (let x = 8; x < 300; x += 16) {
          const on = ((x * 7 + y * 13) >> 4) % 3 !== 0;
          c.fillStyle = on ? "rgba(140,255,230,0.75)" : "rgba(140,255,230,0.25)";
          c.fillRect(x - 2, y - 2, 4, 4);
        }
      c.restore();
    }
    dyn.tex.needsUpdate = true;
    dyn.key = key;
  }
  const drop = outE(t, 77.9, 78.7) - io(t, 83.1, 83.8);
  const y = mix(2.6, 0.98, drop);
  return (
    <group>
      <Print tex={dyn.tex} position={[0, y, 0.85]} w={0.5} h={0.63} rot={Math.sin(t * 1.3) * 0.02} />
      {scan > 0 && scan < 1 && (
        <mesh position={[-0.25 + 0.5 * scan, y + 0.012, 0.87]}>
          <planeGeometry args={[0.025, 0.7]} />
          <meshBasicMaterial color="#b8fff0" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

// ------------------------------------------------------------------------------------------
// Camera: one rig per shot, hard cuts between shots. Rows: [t, tx, ty, tz, azDeg, elDeg, dist, fov].
type Row = number[];
const rig = (...rows: Row[]): Key[] => rows.map((r) => ({ f: r[0], v: r.slice(1) }));
export const SHOTS: { a: number; b: number; keys: Key[] }[] = [
  { a: 0, b: 3.42, keys: rig([0, 0, 0.8, -0.05, -7, 3, 3.7, 32], [3.42, 0, 0.8, -0.05, 2, 4, 3.1, 32]) },
  { a: 3.42, b: 5.92, keys: rig([3.42, -0.3, 0.6, 0.15, -16, 6, 3.0, 32], [5.92, -0.4, 0.6, 0.2, -26, 8, 2.6, 32]) },
  { a: 5.92, b: 11.59, keys: rig([5.92, 0, 1.0, 0.35, -3, 3, 4.6, 32], [8.2, 0, 1.0, 0.35, 2, 4, 4.3, 32], [10.95, 0, 1.05, 0.4, 0, 3, 4.0, 32], [11.59, 0, 1.42, 0.55, 0, 1, 0.42, 32]) },
  { a: 11.59, b: 19.58, keys: rig([11.59, 0.55, 0.62, 0.62, 40, 7, 1.0, 32], [15.2, 0.35, 0.7, 0.4, 26, 6, 2.3, 32], [19.58, 0.1, 0.78, 0.1, 8, 5, 3.4, 32]) },
  { a: 19.58, b: 32.35, keys: rig([19.58, 0, 1.0, 0, -10, 6, 4.2, 32], [32.35, 0, 0.95, 0, 8, 5, 3.9, 32]) },
  { a: 32.35, b: 33.6, keys: rig([32.35, 0, 0.75, -0.05, 0, 3, 3.0, 32], [33.6, 0, 0.75, -0.05, -4, 3, 2.8, 32]) },
  { a: 33.6, b: 39.32, keys: rig([33.6, 0, 0.95, 0, -14, 6, 4.0, 32], [39.32, 0, 0.9, 0, 6, 5, 3.7, 32]) },
  { a: 39.32, b: 43.48, keys: rig([39.32, 0, 0.8, -0.1, -14, 4, 3.6, 32], [43.48, 0, 0.8, -0.1, 6, 4, 3.2, 32]) },
  { a: 43.48, b: 48.8, keys: rig([43.48, 0, 0.72, 0, 14, 4, 3.0, 32], [48.8, 0, 0.72, 0, -8, 4, 2.6, 32]) },
  { a: 48.8, b: 54.48, keys: rig([48.8, 0, 1.2, 0.3, 0, 3, 3.4, 32], [50.0, 0, 1.45, 0.75, -4, 4, 2.5, 32], [54.48, 0, 1.45, 0.75, 6, 4, 2.75, 32]) },
  { a: 54.48, b: 62.55, keys: rig([54.48, 0, 0.5, 0.2, 26, 9, 3.0, 32], [58, 0, 0.44, 0.25, 10, 9, 2.4, 32], [62.55, 0, 0.44, 0.25, -12, 8, 2.25, 32]) },
  { a: 62.55, b: 69.61, keys: rig([62.55, 0, 0.82, -0.1, 10, 4, 3.4, 32], [69.61, 0, 0.82, -0.1, -6, 4, 3.0, 32]) },
  { a: 69.61, b: 78.2, keys: rig([69.61, 0, 0.85, 0.2, -12, 6, 4.4, 32], [78.2, 0, 0.85, 0.2, 10, 5, 4.0, 32]) },
  { a: 78.2, b: 83.18, keys: rig([78.2, 0, 1.0, 0.85, 8, 3, 2.4, 32], [83.18, 0, 1.0, 0.85, -6, 3, 2.1, 32]) },
  { a: 83.18, b: 999, keys: rig([83.18, 0, 0.85, 0.4, -6, 4, 4.4, 32], [85.3, 0, 0.6, 0.7, 0, 4, 3.2, 32], [86.3, 0, 0.15, 1.0, 0, 3, 1.6, 32]) },
];

export const cameraAt = (t: number) => {
  const s = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
  const [tx, ty, tz, az, el, dist, fov] = sample(s.keys, t);
  const pos: V3 = [tx + dist * Math.cos(el * D) * Math.sin(az * D), ty + dist * Math.sin(el * D), tz + dist * Math.cos(el * D) * Math.cos(az * D)];
  return { pos, target: [tx, ty, tz] as V3, fov, dist };
};

const CamRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const c = cameraAt(t);
  // subtle handheld breathing so no frame is ever locked off
  const hx = Math.sin(t * 0.7) * 0.006, hy = Math.sin(t * 0.53 + 1) * 0.005;
  camera.position.set(c.pos[0] + hx, c.pos[1] + hy, c.pos[2]);
  camera.lookAt(c.target[0] + hx * 0.5, c.target[1] + hy * 0.5, c.target[2]);
  const pc = camera as THREE.PerspectiveCamera;
  if (pc.fov !== c.fov) {
    pc.fov = c.fov;
    pc.updateProjectionMatrix();
  }
  return null;
};

// ------------------------------------------------------------------------------------------
export const World: React.FC<{ t: number }> = ({ t }) => {
  const sx = subjectX(t);
  return (
    <>
      <CamRig t={t} />
      <ambientLight intensity={0.34} color="#f5e8d3" />
      <spotLight
        position={[2.4, 4.4, 4.2]}
        intensity={46}
        angle={0.42}
        penumbra={0.75}
        decay={2}
        color={PAL.keyLight}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
        target-position={[0, 0.7, 0]}
      />
      <directionalLight position={[-3, 3.5, -3]} intensity={1.1} color={PAL.rimLight} />
      <pointLight position={[0, 1.5, 0.5]} intensity={1.5} distance={3} decay={2} color="#eaf1ff" />
      <pointLight position={[0, 2.0, 2.2]} intensity={1.4} distance={3.5} decay={2} color="#fff3e2" />

      <Stage />
      <group position={[sx, 0, 0]}>
        <Backdrop t={t} />
        <Subject t={t} />
        <ToyCamera position={[0.58, 0, 0.62]} rotY={0.72} />
      </group>
      <ShopFront t={t} />
      <ChatWindow3D t={t} />
      <MergePrints t={t} />
      <ProductSet t={t} />
      <WatermarkPrint t={t} />
      <Foreground />
      <pointLight position={[0, 0.6, 2.6]} intensity={0.9} distance={2.5} decay={2} color="#ffb870" />
      <Plaque />
    </>
  );
};
