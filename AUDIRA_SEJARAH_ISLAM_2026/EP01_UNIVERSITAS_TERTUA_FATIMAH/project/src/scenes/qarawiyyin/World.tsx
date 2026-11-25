// EP01 world props that grow out of the mosaic, each timed to a word of the locked voice:
// mosque walls rising course by course from terracotta (859), the well, Fatimah al-Fihri as a small
// faceless figure seen from behind, the inheritance chest, the study circle (halaqah), the ijazah
// sheet, the library shelves (1349) with the AUDIRA maker's plaque, the vault glow and the
// leather-bound manuscript in its case, the oil lamp of the outro, and 3D label plaques.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { mulberry32 } from "../../kits/mosaicforge/core/motion.ts";
import { P, PLAN, RING, ARCH, ROSE } from "./picture.ts";
import { W, ramp, win, clamp01, mix } from "./tl.ts";
import { SeatedFigure, StandingFigure, Rehal, Cushion } from "./Figures.tsx";

const tmp = new THREE.Object3D();
type V3 = [number, number, number];

// ---------------------------------------------------------------- canvas textures
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  if (typeof document === "undefined") return new THREE.Texture();
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

/** 3D label plaque: cobalt enamel with an ochre rule (style memory: text needs a solid card). */
export const Plaque3D: React.FC<{
  lines: string[];
  pos: V3;
  width: number;
  t: number;
  from: number;
  to: number;
  cam: V3;
  big?: boolean;
}> = ({ lines, pos, width, t, from, to, cam, big }) => {
  const k = win(t, from, to, 0.45, 0.4);
  const tex = useMemo(
    () =>
      canvasTex(1024, big ? 420 : 300, (g) => {
        const H = big ? 420 : 300;
        g.fillStyle = "#0E2456";
        g.fillRect(0, 0, 1024, H);
        g.strokeStyle = "#F2C46A";
        g.lineWidth = 12;
        g.strokeRect(14, 14, 996, H - 28);
        g.fillStyle = "#B4532A";
        g.fillRect(14, 14, 22, H - 28);
        g.textAlign = "center";
        g.textBaseline = "middle";
        const n = lines.length;
        lines.forEach((ln, i) => {
          const main = i === 0;
          const size = main ? (big ? 210 : n > 1 ? 118 : 150) : 68;
          g.font = `900 ${size}px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
          let s = size;
          while (g.measureText(ln).width > 900 && s > 30) {
            s -= 4;
            g.font = `900 ${s}px "Arial Black", "Segoe UI Black", Arial, sans-serif`;
          }
          g.fillStyle = main ? "#FBF1DF" : "#F2C46A";
          const y = n === 1 ? H / 2 + 6 : main ? H * 0.4 : H * 0.78;
          g.fillText(ln, 527, y);
        });
      }),
    [lines.join("|"), big],
  );
  if (k <= 0.001) return null;
  const h = (width * (big ? 420 : 300)) / 1024;
  const yaw = Math.atan2(cam[0] - pos[0], cam[2] - pos[2]);
  const pitch = Math.atan2(cam[1] - pos[1], Math.hypot(cam[0] - pos[0], cam[2] - pos[2])) * 0.85;
  return (
    <group position={[pos[0], pos[1] - (1 - k) * 0.25, pos[2]]} rotation={[0, yaw, 0]} scale={0.6 + 0.4 * k}>
      <group rotation={[-pitch, 0, 0]}>
        <mesh position={[0, 0, -0.025]}>
          <RoundedBoxGeo args={[width + 0.06, h + 0.06, 0.04]} radius={0.015} />
          <meshStandardMaterial color="#6E5328" metalness={0.6} roughness={0.6} transparent opacity={k} />
        </mesh>
        <mesh>
          <planeGeometry args={[width, h]} />
          <meshBasicMaterial map={tex} color="#C8C8C8" transparent opacity={k} toneMapped />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- mosque walls (859, "tumbuh")
const COURSE_H = 0.075;
const COURSES1 = 10;
const COURSES2 = 15;
const useBricks = () =>
  useMemo(() => {
    const rnd = mulberry32(859);
    const list: { x: number; z: number; ry: number; c: number; seed: number; tone: number }[] = [];
    const inset = 0.065;
    const x0 = PLAN.x0 + inset, x1 = PLAN.x1 - inset;
    const zFar = -PLAN.v1 + inset, zNear = -PLAN.v0 - inset;
    const L = 0.23;
    for (let c = 0; c < COURSES2; c++) {
      const off = (c % 2) * L * 0.5;
      // near and far walls (along x); near wall has the gate
      for (const z of [zFar, zNear]) {
        for (let x = x0 + off; x < x1 - 0.05; x += L) {
          if (z === zNear && Math.abs(x + L / 2) < PLAN.gate) continue;
          list.push({ x: x + L / 2, z, ry: 0, c, seed: rnd(), tone: 0.85 + rnd() * 0.25 });
        }
      }
      for (const x of [x0, x1]) {
        for (let z = zFar + off + 0.06; z < zNear - 0.05; z += L) list.push({ x, z: z + L / 2, ry: Math.PI / 2, c, seed: rnd(), tone: 0.85 + rnd() * 0.25 });
      }
    }
    return list;
  }, []);

export const MosqueWalls: React.FC<{ t: number }> = ({ t }) => {
  const bricks = useBricks();
  const grain = useSurfaceGrain(1859, 0.3, 3);
  const mesh = useMemo(() => {
    const geo = new RoundedBoxGeometry(0.22, COURSE_H * 0.92, 0.12, 1, 0.012);
    const m = new THREE.InstancedMesh(geo, new THREE.MeshPhysicalMaterial({ ...POLISH.clay, roughness: 0.82, roughnessMap: grain }), bricks.length);
    m.frustumCulled = false;
    bricks.forEach((b, i) => m.setColorAt(i, new THREE.Color(b.c >= COURSES1 ? "#C9B79A" : P.terracotta).multiplyScalar(b.tone)));
    return m;
  }, [bricks, grain]);
  const A1 = W("membangun", 0), B1 = W("selesai");
  const A2 = W("tumbuh"), B2 = W("guru", 0) + 0.6;
  const sink = ramp(t, W("tahun", 2), W("tahun", 2) + 2.0);
  useLayoutEffect(() => {
    const g1 = clamp01((t - A1) / (B1 - A1)) * COURSES1;
    const g2 = clamp01((t - A2) / (B2 - A2)) * (COURSES2 - COURSES1);
    const grown = g1 + g2;
    bricks.forEach((b, i) => {
      const local = grown - b.c - b.seed * 0.6;
      const k = clamp01(local / 0.6);
      if (k <= 0 || sink >= 1) {
        tmp.position.set(0, -50, 0);
        tmp.scale.setScalar(0.0001);
      } else {
        const drop = (1 - k) * (1 - k) * 0.5;
        tmp.position.set(b.x, COURSE_H * (b.c + 0.5) + drop - sink * COURSE_H * (COURSES2 + 1), b.z);
        tmp.scale.setScalar(0.4 + 0.6 * k);
      }
      tmp.rotation.set(0, b.ry + (b.seed - 0.5) * 0.04, 0);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  // arcade pillars between hall and courtyard + green tile roofs over the hall ("masjid itu tumbuh")
  const pk = clamp01((t - A1) / (B1 - A1));
  const roof = ramp(t, A2 + 0.4, B2 + 0.6) * (1 - sink);
  const pillarH = COURSE_H * (COURSES1 * pk + (COURSES2 - COURSES1) * ramp(t, A2, B2)) * (1 - sink);
  if (pk <= 0) return <primitive object={mesh} />;
  return (
    <group>
      <primitive object={mesh} />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-2.0 + i * 0.5, pillarH / 2, -PLAN.split]}>
          <cylinderGeometry args={[0.055, 0.065, Math.max(0.001, pillarH), 14]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#E6D9BE" />
        </mesh>
      ))}
      {roof > 0.01
        ? Array.from({ length: 6 }, (_, r) => (
            <mesh key={`r${r}`} position={[0, COURSE_H * COURSES2 * (1 - sink) + 0.02, -PLAN.split - 0.3 - r * 0.53]} rotation={[0, 0, Math.PI / 2]} scale={[1, roof, roof]}>
              <cylinderGeometry args={[0.26, 0.26, 4.5, 18, 1, false, -Math.PI / 2, Math.PI]} />
              <meshPhysicalMaterial color={r % 2 ? P.zelligeGreen : P.zelligeGreenDeep} roughness={0.28} clearcoat={0.85} clearcoatRoughness={0.15} side={THREE.DoubleSide} />
            </mesh>
          ))
        : null}
    </group>
  );
};

// ---------------------------------------------------------------- well, chest, Fatimah
export const Courtyard: React.FC<{ t: number }> = ({ t }) => {
  const [fu, fv] = PLAN.fountain;
  const well = ramp(t, W("airnya"), W("airnya") + 0.9) * (1 - ramp(t, W("tumbuh"), W("tumbuh") + 0.9));
  const fat = ramp(t, W("perempuan"), W("perempuan") + 1.0) * (1 - ramp(t, W("masjid", 3), W("masjid", 3) + 1.0));
  const chest = ramp(t, W("harta", 0), W("harta", 0) + 0.7) * (1 - ramp(t, W("membangun", 0) + 1.0, W("membangun", 0) + 2.2));
  return (
    <group>
      {well > 0.001 ? (
        <group position={[fu, (well - 1) * 0.25, -fv]}>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.24, 0.26, 0.14, 28, 1, true]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#BFAE8E" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.25, 0.035, 10, 32]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#D8C8A6" />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.23, 32]} />
            <meshPhysicalMaterial color="#2E5F8A" roughness={0.05} clearcoat={1} metalness={0.1} />
          </mesh>
        </group>
      ) : null}
      {fat > 0.001 ? (
        <group position={[0.85, 0, 2.55]} rotation={[0, Math.PI, 0]} scale={[1, fat, 1]}>
          <StandingFigure robe="#5B3A2A" scarf="#D9C9A8" scale={1.7} />
        </group>
      ) : null}
      {chest > 0.001 ? (
        <group position={[1.25, 0, 2.75]} scale={chest} rotation={[0, -0.4, 0]}>
          <mesh position={[0, 0.07, 0]}>
            <RoundedBoxGeo args={[0.24, 0.14, 0.16]} radius={0.02} />
            <meshPhysicalMaterial {...POLISH.stone} roughness={0.55} color="#6B3F22" />
          </mesh>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[((i * 37) % 9) / 50 - 0.08, 0.15 + (i % 3) * 0.012, ((i * 53) % 7) / 60 - 0.05]} rotation={[0.3 * (i % 3), i, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.006, 16]} />
              <meshStandardMaterial color="#E6B54A" metalness={1} roughness={0.25} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- halaqah + ijazah
const STUDENTS = Array.from({ length: 9 }, (_, i) => {
  const th = ((-100 + i * 25) * Math.PI) / 180; // near arc, facing the teacher across the ring
  return { th, x: RING.u + Math.sin(th) * RING.r, z: -RING.v + Math.cos(th) * RING.r };
});
const ROBES = ["#9C6B44", "#7A4E2E", "#B8875A", "#6E5A3A", "#A0683E", "#8C7148", "#704A32", "#C49A6C", "#5E4630"];
const WRAPS = ["#E9DFC9", "#D9C9A8", "#EFE6D2", "#D9C9A8", "#E9DFC9", "#EFE6D2", "#D9C9A8", "#E9DFC9", "#D2BF9C"];
const TEACHER: V3 = [RING.u, 0, -RING.v - RING.r];

const sheetTex = () =>
  canvasTex(512, 680, (g) => {
    const grd = g.createLinearGradient(0, 0, 512, 680);
    grd.addColorStop(0, "#F3E6C4");
    grd.addColorStop(1, "#E2CC9A");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 680);
    g.strokeStyle = "#B58A3C";
    g.lineWidth = 8;
    g.strokeRect(22, 22, 468, 636);
    g.lineWidth = 2;
    g.strokeRect(36, 36, 440, 608);
    // abstract calligraphy-like strokes (not letters, not verses)
    const rnd = mulberry32(1349);
    g.strokeStyle = "#3A2414";
    g.lineCap = "round";
    for (let row = 0; row < 9; row++) {
      const y = 120 + row * 52;
      let x = 440;
      while (x > 80) {
        const w = 18 + rnd() * 46;
        g.lineWidth = 3 + rnd() * 3;
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x - w * 0.3, y - 10 - rnd() * 14, x - w * 0.7, y + 6, x - w, y);
        g.stroke();
        if (rnd() > 0.6) {
          g.beginPath();
          g.moveTo(x - w * 0.5, y - 4);
          g.lineTo(x - w * 0.5 + 2, y - 22 - rnd() * 10);
          g.stroke();
        }
        x -= w + 8 + rnd() * 10;
      }
    }
    // seal
    g.fillStyle = "#8E2F1E";
    g.beginPath();
    g.arc(130, 590, 44, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#E6B54A";
    g.lineWidth = 4;
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const r = i % 2 ? 22 : 34;
      g.lineTo(130 + Math.cos(a) * r, 590 + Math.sin(a) * r);
    }
    g.closePath();
    g.stroke();
  });

export const Halaqah: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(sheetTex, []);
  const out = ramp(t, W("tahun", 2), W("tahun", 2) + 1.2);
  const tIn = W("murid", 0);
  const teacher = ramp(t, tIn - 0.6, tIn + 0.2) * (1 - out);
  const give = ramp(t, W("memberi"), W("memberi") + 0.9);
  const raise = ramp(t, W("ijazah"), W("ijazah") + 1.1);
  const sheetOn = win(t, W("memberi") - 0.3, W("tahun", 2) + 0.3, 0.3, 0.6);
  const s4 = STUDENTS[4];
  const from: V3 = [TEACHER[0], 0.22, TEACHER[2] + 0.18];
  const hand: V3 = [s4.x, 0.24, s4.z - 0.2];
  const up: V3 = [s4.x, 0.85, s4.z - 0.45];
  const p0: V3 = [mix(from[0], hand[0], give), mix(from[1], hand[1], give) + Math.sin(give * Math.PI) * 0.25, mix(from[2], hand[2], give)];
  const pos: V3 = [mix(p0[0], up[0], raise), mix(p0[1], up[1], raise), mix(p0[2], up[2], raise)];
  const flat = -Math.PI / 2 + 0.25;
  const rx = mix(flat, -0.12, raise);
  const sc = mix(0.55, 1.0, raise);
  if (teacher <= 0.001 && sheetOn <= 0.001) return null;
  return (
    <group>
      {teacher > 0.001 ? (
        <group>
          <group position={[TEACHER[0], 0, TEACHER[2]]} scale={[1, teacher, 1]}>
            <Cushion color="#7E3519" />
            <SeatedFigure robe="#D8C7A4" wrap="#EFE6D2" scale={1.2} />
          </group>
          {STUDENTS.map((s, i) => {
            const k = ramp(t, tIn + i * 0.13, tIn + i * 0.13 + 0.55) * (1 - out);
            if (k <= 0.001) return null;
            const ry = Math.atan2(TEACHER[0] - s.x, TEACHER[2] - s.z);
            return (
              <group key={i} position={[s.x, (k - 1) * 0.2, s.z]} rotation={[0, ry, 0]} scale={[1, k, 1]}>
                <Cushion color={i % 2 ? "#13306F" : "#1E6A4C"} />
                <SeatedFigure robe={ROBES[i]} wrap={WRAPS[i]} bow={0.18} />
                <group position={[0, 0, 0.2]}>
                  <Rehal scale={0.9} book={i === 4 ? "" : "#6B2E1C"} />
                </group>
              </group>
            );
          })}
        </group>
      ) : null}
      {sheetOn > 0.001 ? (
        <group position={pos} rotation={[rx, 0, 0]} scale={sc}>
          <mesh>
            <planeGeometry args={[0.42, 0.56, 8, 8]} />
            <meshStandardMaterial map={tex} roughness={0.85} side={THREE.DoubleSide} transparent opacity={sheetOn} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- library shelves (1349)
export const SHELF_Z = [-3.45, -1.15, 1.15, 3.45];
export const SHELF_X = 4.62;
const SHELF = { w: 2.1, h: 1.9, d: 0.5, boards: [0.12, 0.55, 0.98, 1.41] };
const useBooks = () =>
  useMemo(() => {
    const rnd = mulberry32(1349);
    const list: { case: number; x: number; y: number; z: number; w: number; h: number; d: number; c: THREE.Color }[] = [];
    const tones = ["#7E3519", "#5A2E1A", "#8A6A3A", "#3B2A20", "#6B2E1C", "#A07A44", "#2F3B52", "#4A3B24"];
    let ci = 0;
    for (const side of [-1, 1]) {
      for (let zi = 0; zi < SHELF_Z.length; zi++) {
        for (let b = 0; b < SHELF.boards.length; b++) {
          let z = -SHELF.w / 2 + 0.08;
          while (z < SHELF.w / 2 - 0.12) {
            const w = 0.06 + rnd() * 0.07;
            const h = 0.26 + rnd() * 0.12;
            // empty slot for Ibnu Khaldun's gift (right side, second case, second board)
            const slot = side === 1 && zi === 1 && b === 1 && z > -0.1 && z < 0.12;
            if (!slot) list.push({ case: ci, x: side * (SHELF_X - 0.04), y: SHELF.boards[b] + 0.025 + h / 2, z: SHELF_Z[zi] + z + w / 2, w, h, d: 0.3 + rnd() * 0.06, c: new THREE.Color(tones[Math.floor(rnd() * tones.length)]).multiplyScalar(0.8 + rnd() * 0.4) });
            z += w + 0.006;
          }
        }
        ci++;
      }
    }
    return list;
  }, []);

const audiraPlateTex = () =>
  canvasTex(512, 160, (g) => {
    g.fillStyle = "#2A1C10";
    g.fillRect(0, 0, 512, 160);
    g.fillStyle = "#E6C27A";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `900 88px "Arial Black", Arial, sans-serif`;
    g.fillText("AUDIRA", 256, 86);
    g.strokeStyle = "#E6C27A";
    g.lineWidth = 5;
    g.strokeRect(12, 12, 488, 136);
  });

export const Library: React.FC<{ t: number }> = ({ t }) => {
  const books = useBooks();
  const wood = useSurfaceGrain(4021, 0.28, 3);
  const plate = useMemo(audiraPlateTex, []);
  const A = W("tahun", 2);
  const rise = (ci: number) => ramp(t, A + ci * 0.12, A + ci * 0.12 + 1.8);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 1, 0.08), new THREE.MeshPhysicalMaterial({ roughness: 0.72, sheen: 0.3, sheenRoughness: 0.6 }), books.length);
    m.frustumCulled = false;
    books.forEach((b, i) => m.setColorAt(i, b.c));
    return m;
  }, [books]);
  useLayoutEffect(() => {
    books.forEach((b, i) => {
      const k = rise(b.case);
      tmp.position.set(b.x, b.y - (1 - k) * 2.2, b.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(b.d, b.h, b.w);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  if (t < A - 0.1) return null;
  const lightA = W("sultan");
  const khIn = ramp(t, W("menghadiahkan"), W("menghadiahkan") + 0.9);
  const kh: V3 = [mix(2.6, SHELF_X - 0.06, khIn), mix(1.6, SHELF.boards[1] + 0.18, khIn) + Math.sin(khIn * Math.PI) * 0.3, -1.15 + 0.01];
  let ci = 0;
  const cases: React.ReactNode[] = [];
  for (const side of [-1, 1]) {
    for (let zi = 0; zi < SHELF_Z.length; zi++) {
      const k = rise(ci);
      const y = -(1 - k) * 2.2;
      const x = side * (SHELF_X + 0.06);
      cases.push(
        <group key={ci} position={[x, y, SHELF_Z[zi]]}>
          {/* back + sides + top */}
          <mesh position={[side * 0.2, SHELF.h / 2, 0]}>
            <boxGeometry args={[0.05, SHELF.h, SHELF.w]} />
            <meshPhysicalMaterial {...POLISH.stone} roughness={0.65} color="#4A2C18" roughnessMap={wood} />
          </mesh>
          {[-1, 1].map((e) => (
            <mesh key={e} position={[0, SHELF.h / 2, (e * SHELF.w) / 2]}>
              <RoundedBoxGeo args={[SHELF.d, SHELF.h, 0.07]} radius={0.015} />
              <meshPhysicalMaterial {...POLISH.stone} roughness={0.6} color="#6B4226" roughnessMap={wood} />
            </mesh>
          ))}
          <mesh position={[0, SHELF.h + 0.06, 0]}>
            <RoundedBoxGeo args={[SHELF.d + 0.08, 0.12, SHELF.w + 0.12]} radius={0.02} />
            <meshPhysicalMaterial {...POLISH.stone} roughness={0.6} color="#6B4226" roughnessMap={wood} />
          </mesh>
          {SHELF.boards.map((by, b) => {
            const glow = ramp(t, lightA + (ci * 4 + b) * 0.07, lightA + (ci * 4 + b) * 0.07 + 0.5);
            return (
              <group key={b}>
                <mesh position={[0, by, 0]}>
                  <boxGeometry args={[SHELF.d, 0.04, SHELF.w]} />
                  <meshPhysicalMaterial {...POLISH.stone} roughness={0.6} color="#6B4226" roughnessMap={wood} />
                </mesh>
                {/* warm lamp strip under the board above: shelves light one by one */}
                <mesh position={[-side * 0.18, by + 0.41, 0]}>
                  <boxGeometry args={[0.02, 0.012, SHELF.w - 0.15]} />
                  <meshBasicMaterial color={new THREE.Color("#FFC877").multiplyScalar(0.2 + glow * 2.2)} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
        </group>,
      );
      ci++;
    }
  }
  return (
    <group>
      <primitive object={mesh} />
      {cases}
      {/* AUDIRA maker's plate on the end of the right front case (a furniture plate, not a manuscript) */}
      <group position={[SHELF_X + 0.06, -(1 - rise(7)) * 2.2 + 1.0, SHELF_Z[3] + SHELF.w / 2 + 0.041]}>
        <mesh>
          <RoundedBoxGeo args={[0.36, 0.13, 0.012]} radius={0.004} />
          <meshPhysicalMaterial color="#B98B3F" metalness={1} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.0075]}>
          <planeGeometry args={[0.33, 0.103]} />
          <meshStandardMaterial map={plate} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      {/* Ibnu Khaldun's gift: a cloth-bound bundle sliding into the empty slot */}
      {t > W("menghadiahkan") - 0.6 ? (
        <group position={kh} scale={ramp(t, W("menghadiahkan") - 0.6, W("menghadiahkan"))}>
          <mesh>
            <RoundedBoxGeo args={[0.3, 0.32, 0.17]} radius={0.03} />
            <meshPhysicalMaterial {...POLISH.fabric} color="#C9A46A" />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.31, 0.03, 0.18]} />
            <meshPhysicalMaterial {...POLISH.fabric} color="#7E3519" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- vault: glow + manuscript case
const archShape = () => {
  const s = new THREE.Shape();
  const top = ARCH.cy - Math.sqrt(ARCH.R * ARCH.R - ARCH.jamb * ARCH.jamb);
  const a0 = Math.asin(-Math.sqrt(ARCH.R * ARCH.R - ARCH.jamb * ARCH.jamb) / ARCH.R);
  s.moveTo(-ARCH.jamb, ARCH.sill);
  s.lineTo(ARCH.jamb, ARCH.sill);
  s.lineTo(ARCH.jamb, top);
  s.absarc(ARCH.cx, ARCH.cy, ARCH.R, a0, Math.PI - a0, false);
  s.lineTo(-ARCH.jamb, ARCH.sill);
  return s;
};
const codexTex = () =>
  canvasTex(512, 384, (g) => {
    g.fillStyle = "#5A2A16";
    g.fillRect(0, 0, 512, 384);
    g.strokeStyle = "#D9A94E";
    g.lineWidth = 6;
    g.strokeRect(26, 26, 460, 332);
    // tooled geometric star (no text)
    g.translate(256, 192);
    for (const [r, w] of [[110, 6], [70, 4]] as const) {
      g.lineWidth = w;
      g.beginPath();
      for (let i = 0; i <= 16; i++) {
        const a = (i * Math.PI) / 8;
        const rr = i % 2 ? r * 0.72 : r;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.stroke();
    }
  });
export const VAULT_Z = -0.75;
export const Vault: React.FC<{ t: number; open: number }> = ({ t, open }) => {
  const shape = useMemo(() => new THREE.ShapeGeometry(archShape(), 48), []);
  const cover = useMemo(codexTex, []);
  const up = ramp(t, W("dalamnya"), W("dalamnya") + 1.3) * (1 - ramp(t, W("tempat"), W("tempat") + 1.0));
  if (open <= 0.001 && up <= 0.001) return null;
  return (
    <group>
      {/* warm light filling the opened door: lay under the tesserae */}
      <mesh geometry={shape} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <meshBasicMaterial color={new THREE.Color("#E89A45").multiplyScalar(0.1 + open * 0.3)} transparent opacity={open * 0.9} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.9, VAULT_Z]} intensity={open * 9} distance={7} decay={1.6} color="#FFC679" />
      {up > 0.001 ? (
        <group position={[0, (up - 1) * 0.9, VAULT_Z]}>
          <mesh position={[0, 0.2, 0]}>
            <RoundedBoxGeo args={[1.0, 0.4, 0.7]} radius={0.03} />
            <meshPhysicalMaterial {...POLISH.stone} roughness={0.5} color="#2E1A0E" />
          </mesh>
          {/* closed leather codex (animal-skin parchment inside), tooled cover, lying flat */}
          <group position={[0, 0.45, 0]} rotation={[0, 0.25, 0]}>
            <mesh>
              <RoundedBoxGeo args={[0.5, 0.09, 0.38]} radius={0.015} />
              <meshPhysicalMaterial color="#5A2A16" roughness={0.55} sheen={0.3} sheenRoughness={0.5} clearcoat={0.2} />
            </mesh>
            <mesh position={[0, 0.0455, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.48, 0.36]} />
              <meshStandardMaterial map={cover} roughness={0.5} metalness={0.15} />
            </mesh>
            <mesh position={[0, 0, 0.191]}>
              <boxGeometry args={[0.46, 0.06, 0.004]} />
              <meshStandardMaterial color="#EAD9B4" roughness={0.9} />
            </mesh>
          </group>
          {/* glass case */}
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[0.8, 0.45, 0.56]} />
            <meshPhysicalMaterial color="#DDEBF0" roughness={0.04} metalness={0} transparent opacity={0.13} clearcoat={1} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- outro lamp
export const Lamp: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, W("pusat"), W("pusat") + 1.2);
  if (k <= 0.001) return null;
  const flick = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05;
  return (
    <group position={[ROSE.u, (k - 1) * 0.3, -ROSE.v]} scale={1.7}>
      <Rehal scale={2.6} book="" />
      <group position={[0, 0.3, 0]} scale={k * 1.4}>
        <mesh scale={[1.4, 0.55, 1]}>
          <sphereGeometry args={[0.06, 20, 14]} />
          <meshStandardMaterial color="#C99A45" metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0.08, 0.01, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.02, 0.07, 12]} />
          <meshStandardMaterial color="#C99A45" metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0.06, 0]} scale={[1, 1.6 * flick, 1]}>
          <sphereGeometry args={[0.014, 12, 10]} />
          <meshBasicMaterial color={new THREE.Color("#FFD27A").multiplyScalar(3)} toneMapped={false} />
        </mesh>
        <pointLight position={[0.1, 0.12, 0]} intensity={3.5 * k * flick} distance={4} decay={1.5} color="#FFC679" />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- minaret beyond the arcade (1963)
export const Minaret: React.FC = () => {
  const grain = useSurfaceGrain(1963, 0.25, 4);
  return (
    <group position={[-5.4, 0, -9.8]}>
      <mesh position={[0, 4.6, 0]}>
        <boxGeometry args={[1.5, 9.2, 1.5]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#EDE4D2" roughnessMap={grain} />
      </mesh>
      {/* green tile panel bands */}
      {[6.2, 7.6].map((y) => (
        <mesh key={y} position={[0, y, 0.76]}>
          <boxGeometry args={[1.1, 0.7, 0.03]} />
          <meshPhysicalMaterial color={P.zelligeGreen} roughness={0.3} clearcoat={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = Math.floor(i / 2), s = i % 2 ? 0.45 : -0.45;
        const pos: V3 = a === 0 ? [s, 9.4, 0.62] : a === 1 ? [s, 9.4, -0.62] : a === 2 ? [0.62, 9.4, s] : [-0.62, 9.4, s];
        return (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.24, 0.4, 0.24]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#EDE4D2" />
          </mesh>
        );
      })}
      <mesh position={[0, 10.0, 0]}>
        <boxGeometry args={[0.7, 1.2, 0.7]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#EDE4D2" />
      </mesh>
      <mesh position={[0, 10.75, 0]}>
        <sphereGeometry args={[0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={P.zelligeGreen} roughness={0.25} clearcoat={0.9} />
      </mesh>
      <mesh position={[0, 11.25, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
        <meshStandardMaterial color="#D9A94E" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

