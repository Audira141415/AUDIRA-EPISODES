// EP06 back and side layers: the far basalt wall (Diyarbakır's black-basalt walls, softened by fog),
// the open manuscript on a lectern (left page: 50 machine sketches; right page: the elephant drawing and
// abstract ink lines, no real text), the AUDIRA brass plaque on the plinth, and the faceless silhouettes
// of the payoff (visitors at the giant replica, one adult next to the original with a height bar).

import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { ToyPerson, type Look } from "../../core/polish/Person.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PALETTE, BOOK, WALL_Z, ADULT } from "./layout.ts";
import type { FilmState } from "./state.ts";
import { at } from "./time.ts";

const INK = "#4A3424";
const PAPER = "#EFE2C4";

/** Distant fog in the background colour: aerial perspective that separates the wall from the hero. */
export const SceneFog: React.FC = () => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog(PALETTE.bg, 20, 62);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
};

export const BasaltWall: React.FC = () => {
  const { geo, n, mats } = useMemo(() => {
    const geo = new RoundedBoxGeometry(1.15, 0.56, 0.6, 2, 0.06);
    const rnd = prng(606);
    const items: { p: [number, number, number]; c: THREE.Color }[] = [];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 34; col++) {
        const x = -22 + col * 1.2 + (row % 2) * 0.6;
        const y = 0.3 + row * 0.6;
        const g = 0.2 + rnd() * 0.08;
        items.push({ p: [x, y, WALL_Z + (rnd() - 0.5) * 0.08], c: new THREE.Color(g * 1.02, g * 0.96, g * 0.9) });
      }
    }
    return { geo, n: items.length, mats: items };
  }, []);
  const ref = React.useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    mats.forEach((it, i) => {
      m.makeTranslation(...it.p);
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, it.c);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [mats]);
  return (
    <group>
      <instancedMesh ref={ref} args={[geo, undefined, n]} receiveShadow>
        <meshStandardMaterial roughness={0.92} />
      </instancedMesh>
      {/* cornice */}
      <mesh position={[-1, 4.35, WALL_Z]}>
        <boxGeometry args={[42, 0.25, 0.8]} />
        <meshStandardMaterial color="#3A3632" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- manuscript textures
function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  if (typeof document === "undefined") return new THREE.Texture();
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function paper(c: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  c.fillStyle = PAPER;
  c.fillRect(0, 0, w, h);
  const rnd = prng(seed);
  for (let i = 0; i < 1400; i++) {
    c.fillStyle = `rgba(120,90,50,${rnd() * 0.06})`;
    c.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 5, 2 + rnd() * 5);
  }
  // red and lapis rules (manuscript frame)
  c.strokeStyle = "#A8342B";
  c.lineWidth = 6;
  c.strokeRect(34, 34, w - 68, h - 68);
  c.strokeStyle = "#2F4E8C";
  c.lineWidth = 3;
  c.strokeRect(46, 46, w - 92, h - 92);
}

/** Abstract ink lines (not letters, not any real text). */
function inkLines(c: CanvasRenderingContext2D, x: number, y: number, w: number, rows: number, seed: number) {
  const rnd = prng(seed);
  c.strokeStyle = INK;
  c.lineWidth = 3;
  for (let r = 0; r < rows; r++) {
    c.beginPath();
    let xx = x + w;
    const yy = y + r * 26;
    c.moveTo(xx, yy);
    while (xx > x + 10) {
      const step = 10 + rnd() * 26;
      c.quadraticCurveTo(xx - step / 2, yy - 6 - rnd() * 8, xx - step, yy);
      xx -= step;
      if (rnd() < 0.15) {
        c.moveTo(xx - 8, yy);
        xx -= 8;
      }
    }
    c.stroke();
  }
}

const ICONS = 6;
function iconTex(kind: number) {
  return canvasTex(128, 128, (c) => {
    c.fillStyle = PAPER;
    c.fillRect(0, 0, 128, 128);
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.fillStyle = "rgba(168,52,43,0.85)";
    const circ = (x: number, y: number, r: number) => {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
    };
    if (kind === 0) {
      // gear
      circ(64, 64, 30);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        c.beginPath();
        c.moveTo(64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30);
        c.lineTo(64 + Math.cos(a) * 42, 64 + Math.sin(a) * 42);
        c.stroke();
      }
      circ(64, 64, 8);
    } else if (kind === 1) {
      // water wheel with buckets
      circ(64, 64, 38);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        c.fillRect(64 + Math.cos(a) * 38 - 6, 64 + Math.sin(a) * 38 - 6, 12, 12);
      }
      c.beginPath();
      c.moveTo(10, 112);
      c.lineTo(118, 112);
      c.stroke();
    } else if (kind === 2) {
      // pump cylinders
      c.strokeRect(24, 30, 26, 70);
      c.strokeRect(78, 30, 26, 70);
      c.beginPath();
      c.moveTo(37, 30);
      c.lineTo(64, 12);
      c.lineTo(91, 30);
      c.stroke();
      c.fillRect(30, 70, 14, 10);
      c.fillRect(84, 50, 14, 10);
    } else if (kind === 3) {
      // castle clock
      c.strokeRect(34, 44, 60, 66);
      c.beginPath();
      c.arc(64, 44, 30, Math.PI, 0);
      c.stroke();
      circ(64, 76, 14);
    } else if (kind === 4) {
      // boat with figures
      c.beginPath();
      c.moveTo(12, 70);
      c.quadraticCurveTo(64, 110, 116, 70);
      c.closePath();
      c.stroke();
      for (let i = 0; i < 4; i++) c.fillRect(30 + i * 20, 52, 10, 18);
    } else {
      // peacock basin
      circ(64, 92, 20);
      c.beginPath();
      c.moveTo(64, 72);
      c.quadraticCurveTo(70, 40, 60, 24);
      c.stroke();
      c.beginPath();
      c.arc(86, 60, 26, -Math.PI / 2, Math.PI / 2);
      c.stroke();
    }
  });
}

function elephantPage() {
  return canvasTex(512, 664, (c) => {
    paper(c, 512, 664, 77);
    inkLines(c, 80, 90, 352, 3, 9);
    c.strokeStyle = INK;
    c.lineWidth = 5;
    c.fillStyle = "rgba(47,78,140,0.18)";
    // elephant side view
    c.beginPath();
    c.ellipse(240, 450, 120, 74, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.beginPath();
    c.arc(368, 410, 48, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(405, 430);
    c.quadraticCurveTo(430, 500, 410, 560);
    c.stroke();
    for (const x of [160, 200, 290, 330]) c.strokeRect(x - 14, 500, 28, 80);
    // dais, pillars, castle, dome, bird
    c.strokeRect(150, 362, 190, 12);
    for (const x of [160, 330]) {
      c.beginPath();
      c.moveTo(x, 362);
      c.lineTo(x, 290);
      c.stroke();
    }
    c.strokeRect(150, 280, 190, 10);
    c.fillStyle = "rgba(168,52,43,0.3)";
    c.fillRect(200, 220, 90, 60);
    c.strokeRect(200, 220, 90, 60);
    c.beginPath();
    c.arc(245, 220, 40, Math.PI, 0);
    c.stroke();
    c.beginPath();
    c.arc(245, 172, 8, 0, Math.PI * 2);
    c.stroke();
    // letter markers (abstract dots + lines, no script)
    c.fillStyle = "#A8342B";
    for (const [x, y] of [[120, 450], [245, 330], [380, 300], [250, 600]]) {
      c.beginPath();
      c.arc(x, y, 7, 0, Math.PI * 2);
      c.fill();
    }
    inkLines(c, 80, 616, 352, 1, 21);
  });
}

function blankLeftPage() {
  return canvasTex(512, 664, (c) => {
    paper(c, 512, 664, 31);
    inkLines(c, 80, 84, 352, 2, 5);
  });
}

/** Open manuscript on a lectern. */
/** Walnut bookshelf + brass oil lamp behind the lectern: background layer and a warm practical light. */
const LibraryBackdrop: React.FC = () => {
  const spines = useMemo(() => {
    const r = prng(606);
    const cols = ["#7A2E22", "#2F4A6B", "#5E4A23", "#3E5A3A", "#8A5A2B", "#4A2B3E", "#B08A4A"];
    const out: { x: number; y: number; w: number; h: number; c: string; lean: number }[] = [];
    for (let row = 0; row < 4; row++) {
      let x = -3.7;
      while (x < 3.6) {
        const w = 0.12 + r() * 0.14;
        const h = 0.62 + r() * 0.3;
        out.push({ x: x + w / 2, y: 0.55 + row * 1.25 + h / 2, w, h, c: cols[Math.floor(r() * cols.length)], lean: r() < 0.08 ? 0.18 : 0 });
        x += w + (r() < 0.12 ? 0.25 : 0.015);
      }
    }
    return out;
  }, []);
  return (
    <group position={[0, 0, -2.4]}>
      {/* carcass */}
      <mesh position={[0, 2.75, -0.3]} receiveShadow>
        <RoundedBoxGeo args={[8, 5.6, 0.25]} radius={0.04} />
        <meshPhysicalMaterial color="#4A2E1A" {...POLISH.stone} roughness={0.62} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.5 + i * 1.25, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[8, 0.1, 0.6]} radius={0.02} />
          <meshPhysicalMaterial color="#6B4426" {...POLISH.stone} roughness={0.55} />
        </mesh>
      ))}
      {spines.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, -0.02]} rotation={[0, 0, b.lean]} castShadow>
          <RoundedBoxGeo args={[b.w, b.h, 0.42]} radius={0.015} />
          <meshPhysicalMaterial color={b.c} {...POLISH.fabric} roughness={0.8} />
        </mesh>
      ))}
      {/* brass oil lamp on a stand, front-left of the lectern */}
      <group position={[-2.6, 0, 2.9]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.12, 1.6, 16]} />
          <meshStandardMaterial color="#B8862E" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0, 1.68, 0]} castShadow>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color="#C9973A" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[0.24, 1.82, 0]}>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshBasicMaterial color="#FFD27A" toneMapped={false} />
        </mesh>
        <pointLight position={[0.24, 1.95, 0.1]} intensity={3.2} distance={6} decay={1.6} color="#FFB45E" />
      </group>
    </group>
  );
};

export const Manuscript: React.FC<{ s: FilmState }> = ({ s }) => {
  const left = useMemo(blankLeftPage, []);
  const right = useMemo(elephantPage, []);
  const icons = useMemo(() => Array.from({ length: ICONS }, (_, i) => iconTex(i)), []);
  const { pageW: W, pageH: H, lift } = BOOK;
  const cells = useMemo(() => {
    const out: { x: number; y: number; k: number }[] = [];
    for (let r = 0; r < 10; r++) for (let c = 0; c < 5; c++) out.push({ x: -W + 0.32 + c * ((W - 0.64) / 4.4), y: H - 0.72 - r * 0.272, k: (r * 5 + c) % ICONS });
    return out;
  }, [W, H]);
  const tilt = -0.22; // pages lean back
  return (
    <group position={BOOK.pos} rotation={[0, BOOK.rotY, 0]}>
      <LibraryBackdrop />
      {/* lectern: two crossed walnut boards */}
      {[1, -1].map((sg) => (
        <mesh key={sg} position={[0, lift / 2, -0.15]} rotation={[0, 0, sg * 0.28]} castShadow>
          <RoundedBoxGeo args={[0.22, lift + 0.4, 0.18]} radius={0.05} />
          <meshPhysicalMaterial color="#6B4426" {...POLISH.stone} roughness={0.7} />
        </mesh>
      ))}
      <group position={[0, lift, 0]} rotation={[tilt, 0, 0]}>
        {/* leather boards */}
        <mesh position={[0, H / 2, -0.06]} castShadow>
          <RoundedBoxGeo args={[W * 2 + 0.24, H + 0.2, 0.08]} radius={0.03} />
          <meshPhysicalMaterial color="#5E2A1E" {...POLISH.fabric} roughness={0.75} />
        </mesh>
        {/* pages, slightly folded at the spine */}
        <mesh position={[-W / 2, H / 2, 0.02]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={left} roughness={0.95} />
        </mesh>
        <mesh position={[W / 2, H / 2, 0.02]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={right} roughness={0.95} />
        </mesh>
        {/* the 50 machine sketches (left page) appear on "50 mesin" */}
        <group>
          {cells.map((c, i) => {
            const k = Math.max(0, Math.min(1, s.sketches * 50 - i * 0.8 + 1));
            if (k <= 0) return null;
            return (
              <mesh key={i} position={[c.x + W * 0.0, c.y, 0.03 + 0.002 * i]} scale={0.6 + 0.4 * k}>
                <planeGeometry args={[0.24, 0.24]} />
                <meshStandardMaterial map={icons[c.k]} roughness={0.95} transparent opacity={k} />
              </mesh>
            );
          })}
        </group>
        {/* elephant drawing highlight frame on "gambar" */}
        {s.elephantSketch > 0.01 ? (
          <mesh position={[W / 2, H * 0.42, 0.035]}>
            <ringGeometry args={[0.98, 1.04, 64]} />
            <meshStandardMaterial color={PALETTE.cut} roughness={0.6} transparent opacity={s.elephantSketch} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
};

/** Brass plaque on the plinth: the one place the AUDIRA name lives inside the world. Not emissive. */
export const Plaque: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex(1024, 300, (c) => {
        const g = c.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, "#E2B44C");
        g.addColorStop(1, "#B9862E");
        c.fillStyle = g;
        c.fillRect(0, 0, 1024, 300);
        c.strokeStyle = "#7E4F2E";
        c.lineWidth = 10;
        c.strokeRect(14, 14, 996, 272);
        c.fillStyle = "#3A2414";
        c.textAlign = "center";
        c.font = "700 140px Manrope, sans-serif";
        c.fillText("AUDIRA", 512, 178);
        c.font = "600 50px Manrope, sans-serif";
        c.fillText("JAM GAJAH · ± 1206", 512, 252);
      }),
    [],
  );
  const yaw = 0.78;
  return (
    <group position={[0.2 + 2.05 * Math.sin(yaw), 0, 2.05 * Math.cos(yaw)]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.2, 0]} rotation={[-0.35, 0, 0]} castShadow>
        <RoundedBoxGeo args={[1.0, 0.32, 0.04]} radius={0.012} />
        <meshStandardMaterial color="#B9862E" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.2 + 0.02 * Math.sin(0.35), 0.022 * Math.cos(0.35)]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.97, 0.29]} />
        <meshStandardMaterial map={tex} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, -0.04]}>
        <boxGeometry args={[0.5, 0.12, 0.06]} />
        <meshStandardMaterial color={PALETTE.copperDark} metalness={0.8} roughness={0.45} />
      </mesh>
    </group>
  );
};

/** Faceless standing silhouette (matte slate), height h. Shoulders wider than the waist, no face. */


/** A bright toy-figure person (faced, skin != clothes) who walks in while v ramps 0 -> 1, then stands. */
const Walker: React.FC<{ f: number; v: number; seed: number; to: [number, number, number]; from: [number, number]; h: number; face: number; out?: boolean; look?: Partial<Look> }> = ({ f, v, seed, to, from, h, face, out, look }) => {
  if (v <= 0.001) return null;
  const e = v * v * (3 - 2 * v);
  const x = from[0] + (to[0] - from[0]) * e;
  const z = from[1] + (to[2] - from[1]) * e;
  const walking = v < 0.98;
  const dir = Math.atan2(to[0] - from[0], to[2] - from[1]) + (out ? Math.PI : 0);
  const turn = Math.min(1, Math.max(0, (v - 0.85) / 0.13));
  let dd = face - dir;
  dd = Math.atan2(Math.sin(dd), Math.cos(dd));
  const heading = dir + dd * turn;
  return <ToyPerson f={f} seed={seed} pose={walking ? "walk" : "stand"} outfit="casual" look={{ height: 1, ...look }} position={[x, to[1], z]} heading={heading} scale={h / 1.05} />;
};

/** Payoff people: visitors at the giant replica, then one adult with a height bar beside the original. */
export const People: React.FC<{ s: FilmState; f: number }> = ({ s, f }) => {
  const H = 3.55; // an adult = the original clock's height (Hill: ± 1.8 m)
  const t = f / 60;
  const visOut = t > at("berdiri", 1) + 0.5;
  const adultOut = t > at("hanya") + 0.6;
  return (
    <group>
      <Walker f={f} v={s.visitors} seed={21} to={[2.6, 0, 3.7]} from={[6.5, 4.6]} h={H} face={-2.6} out={visOut} />
      <Walker f={f} v={s.visitors} seed={34} to={[3.6, 0, 2.7]} from={[7.2, 2.2]} h={H * 0.96} face={-2.3} out={visOut} />
      <Walker f={f} v={s.visitors} seed={55} to={[-0.9, 0, 3.9]} from={[-5.2, 5.0]} h={H * 1.02} face={2.9} out={visOut} />
      <Walker f={f} v={s.adult} seed={8} to={ADULT} from={[-5.4, 2.4]} h={H} face={0.36} out={adultOut} look={{ skin: "#d09a6c", hair: "#1b1411", top: "#e8423f", bottom: "#2f6fde", hairStyle: 0, build: 1 }} />
      {s.adult > 0.01 ? (
        <group position={[ADULT[0] - 0.62, 0, ADULT[2] - 0.15]}>
          <mesh position={[0, (H * s.adult) / 2, 0]}>
            <boxGeometry args={[0.035, H * s.adult, 0.035]} />
            <meshStandardMaterial color={PALETTE.ink} roughness={0.6} />
          </mesh>
          {[0, 1].map((e) => (
            <mesh key={e} position={[0, e * H * s.adult, 0]}>
              <boxGeometry args={[0.3, 0.035, 0.035]} />
              <meshStandardMaterial color={PALETTE.cut} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};
