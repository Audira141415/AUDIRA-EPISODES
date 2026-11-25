// EP05 film world: the cover's study desk (notebook, pencil stairs 1-2-3, idea bulb, cheat sheet),
// made time-driven for the film. Copied from Cover.tsx (the cover stays untouched) and extended:
// the X on the cheat sheet is drawn on, the bulb lights up, the student really climbs step by step,
// and the near desk is dressed (phone, ruler, sticky notes) so the foreground is never empty.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { POLISH, RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, LEG_LENGTH, poseAt, type Pose } from "../../core/polish/Person.tsx";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette.ts";
import { makeDeskTexture } from "../../kits/sketchforge/lib/materials.ts";
import { rng } from "../../kits/sketchforge/core/motion.ts";
import { camAt } from "./camera.ts";

type V3 = [number, number, number];
const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";

// ---------------------------------------------------------------- textures (seeded, cached)
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const paperTooth = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, base = P.paper) => {
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 60; i++) {
    ctx.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.25)" : "rgba(120,110,95,0.07)";
    ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  return r;
};

/** Sketchy line: two slightly offset passes, like a pencil going over a line twice. */
const sketchLine = (ctx: CanvasRenderingContext2D, r: () => number, x1: number, y1: number, x2: number, y2: number, j = 2) => {
  for (let k = 0; k < 2; k++) {
    ctx.beginPath();
    ctx.moveTo(x1 + (r() - 0.5) * j, y1 + (r() - 0.5) * j);
    ctx.lineTo(x2 + (r() - 0.5) * j, y2 + (r() - 0.5) * j);
    ctx.stroke();
  }
};

/** Left page: handwritten notes about Guided Learning (only researched wording). */
const makeLeftPage = () =>
  canvasTex(1024, 1400, (ctx) => {
    const r = paperTooth(ctx, 1024, 1400, 51);
    // ruled lines + margin
    ctx.strokeStyle = "rgba(90,91,97,0.16)";
    ctx.lineWidth = 2;
    for (let y = 200; y < 1360; y += 70) sketchLine(ctx, r, 40, y, 990, y, 1);
    ctx.strokeStyle = "rgba(240,83,45,0.35)";
    sketchLine(ctx, r, 130, 40, 130, 1370, 1);
    ctx.fillStyle = "rgba(47,48,52,0.85)";
    ctx.font = `bold 66px ${HAND}`;
    ctx.fillText("Guided Learning", 160, 175);
    ctx.strokeStyle = P.accent;
    ctx.lineWidth = 5;
    sketchLine(ctx, r, 160, 200, 760, 196, 3);
    ctx.fillStyle = "rgba(47,48,52,0.78)";
    ctx.font = `italic 46px ${HAND}`;
    const lines = ["1. Add files", "2. More tools", "3. Guided Learning", "4. tulis topik /", "    unggah materi", "", "langkah demi langkah,", "bukan langsung jawaban"];
    lines.forEach((l, i) => ctx.fillText(l, 165, 330 + i * 70));
    // a small hand sketch of a stair + bulb in the corner
    ctx.strokeStyle = "rgba(47,48,52,0.6)";
    ctx.lineWidth = 4;
    const sx = 620, sy = 1270;
    sketchLine(ctx, r, sx, sy, sx + 90, sy, 3);
    sketchLine(ctx, r, sx + 90, sy, sx + 90, sy - 70, 3);
    sketchLine(ctx, r, sx + 90, sy - 70, sx + 180, sy - 70, 3);
    sketchLine(ctx, r, sx + 180, sy - 70, sx + 180, sy - 140, 3);
    sketchLine(ctx, r, sx + 180, sy - 140, sx + 270, sy - 140, 3);
    ctx.beginPath();
    ctx.arc(sx + 300, sy - 230, 40, 0, Math.PI * 2);
    ctx.stroke();
  });

/** Right page: the flat construction drawing the stairs grew out of (the sketch stays). */
const makeRightPage = () =>
  canvasTex(1024, 1400, (ctx) => {
    const r = paperTooth(ctx, 1024, 1400, 52);
    ctx.strokeStyle = "rgba(90,91,97,0.14)";
    ctx.lineWidth = 2;
    for (let y = 200; y < 1360; y += 70) sketchLine(ctx, r, 30, y, 990, y, 1);
    // soft construction guides
    ctx.strokeStyle = "rgba(90,91,97,0.32)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) sketchLine(ctx, r, 40 + r() * 200, 300 + r() * 900, 700 + r() * 300, 200 + r() * 1000, 4);
    // graphite smudges
    for (let i = 0; i < 4; i++) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
      g.addColorStop(0, "rgba(60,60,66,0.09)");
      g.addColorStop(1, "rgba(60,60,66,0)");
      ctx.save();
      ctx.translate(200 + r() * 600, 300 + r() * 900);
      ctx.scale(1.8, 0.7);
      ctx.fillStyle = g;
      ctx.fillRect(-200, -200, 400, 400);
      ctx.restore();
    }
    // flat oblique drawing of the staircase, in front of the 3D one (the sketch stays on the page)
    const U = (x: number) => ((x - 0.03) / 2.9) * 1024;
    const V = (z: number) => ((z + 1.95) / 3.9) * 1400;
    ctx.strokeStyle = "rgba(47,48,52,0.82)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let k = 0; k < FLAT_PROFILE.length - 1; k++) {
      const [x1, z1] = FLAT_PROFILE[k], [x2, z2] = FLAT_PROFILE[k + 1];
      sketchLine(ctx, r, U(x1), V(z1), U(x2), V(z2), 4);
    }
    // depth edges of the oblique drawing
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(47,48,52,0.5)";
    for (const [x, z] of FLAT_PROFILE.slice(1, -2)) sketchLine(ctx, r, U(x), V(z), U(x + 0.22), V(z - 0.2), 3);
    // hatching on the risers of the flat drawing
    ctx.strokeStyle = "rgba(47,48,52,0.28)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const x0 = FLAT.x0 + i * STEP.w, zt = FLAT.zb - (i + 1) * STEP.rise * FLAT.k;
      for (let hx = 0.03; hx < STEP.w; hx += 0.06) sketchLine(ctx, r, U(x0 + hx), V(FLAT.zb), U(x0 + hx + 0.05), V(zt + 0.02), 2);
    }
    ["1", "2", "3"].forEach((n, i) => {
      ctx.fillStyle = "rgba(240,83,45,0.9)";
      ctx.font = `bold 54px ${HAND}`;
      ctx.fillText(n, U(FLAT.x0 + i * STEP.w + STEP.w * 0.38), V(FLAT.zb - 0.07));
    });
    ctx.fillStyle = "rgba(47,48,52,0.55)";
    ctx.font = `italic 34px ${HAND}`;
    ctx.fillText("satu langkah, satu pertanyaan", 260, 1385);
  });

/** Cheat sheet: answers in a cramped scrawl, crossed out with a big vermilion X. */
const makeCheatSheet = () =>
  canvasTex(640, 820, (ctx) => {
    const r = paperTooth(ctx, 640, 820, 77, "#EFE6D5");
    ctx.fillStyle = "rgba(47,48,52,0.85)";
    ctx.font = `bold 58px ${HAND}`;
    ctx.fillText("CONTEKAN", 120, 100);
    ctx.font = `italic 30px ${HAND}`;
    ctx.fillStyle = "rgba(47,48,52,0.6)";
    for (let i = 0; i < 12; i++) {
      const txt = `${i + 1}. ` + ["A", "C", "B", "D"][Math.floor(r() * 4)] + "  ~~~~ ~~ ~~~";
      ctx.fillText(txt, 60, 170 + i * 52);
    }
  });

/** Stair face: paper tooth + real pencil hatching; density 0..2 (2 adds cross-hatch). */
const faceCache = new Map<string, THREE.CanvasTexture>();
const makeStepFace = (seed: number, density: number) => {
  const key = `${seed}:${density}`;
  const hit = faceCache.get(key);
  if (hit) return hit;
  const t = canvasTex(512, 512, (ctx) => {
    const r = paperTooth(ctx, 512, 512, seed, P.paper);
    const pass = (angle: number, gap: number, alpha: number) => {
      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate(angle);
      for (let y = -400; y < 400; y += gap + r() * gap * 0.5) {
        const x0 = -400 + r() * 60, x1 = 400 - r() * 60;
        ctx.strokeStyle = `rgba(47,48,52,${alpha * (0.6 + r() * 0.6)})`;
        ctx.lineWidth = 1.2 + r() * 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.quadraticCurveTo(0, y + (r() - 0.5) * 6, x1, y + (r() - 0.5) * 8);
        ctx.stroke();
      }
      ctx.restore();
    };
    if (density > 0) pass(-0.8, 15 - density * 3, 0.16 + density * 0.07);
    if (density > 1) pass(0.75, 13, 0.18);
    // soft graphite smudge toward one corner
    const g = ctx.createRadialGradient(470, 470, 0, 470, 470, 380);
    g.addColorStop(0, `rgba(60,60,66,${0.05 + density * 0.05})`);
    g.addColorStop(1, "rgba(60,60,66,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  });
  faceCache.set(key, t);
  return t;
};

/** Riser label: a big hand-drawn numeral in a circle. */
const numCache = new Map<string, THREE.CanvasTexture>();
const makeNumber = (n: string) => {
  const hit = numCache.get(n);
  if (hit) return hit;
  const t = canvasTex(256, 256, (ctx) => {
    const r = rng(n.charCodeAt(0));
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = P.accent;
    ctx.lineWidth = 10;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      ctx.ellipse(128 + (r() - 0.5) * 6, 128 + (r() - 0.5) * 6, 100, 96, r(), 0.1, Math.PI * 2.05);
      ctx.stroke();
    }
    ctx.fillStyle = P.graphite;
    ctx.font = `bold 170px ${HAND}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n, 128, 140);
  });
  numCache.set(n, t);
  return t;
};

/** Cream paper label with "AUDIRA" in pencil, for the notebook cover. */
const makeLabel = () =>
  canvasTex(512, 200, (ctx) => {
    const r = paperTooth(ctx, 512, 200, 9, P.paperWhite);
    ctx.strokeStyle = "rgba(47,48,52,0.7)";
    ctx.lineWidth = 4;
    sketchLine(ctx, r, 14, 14, 498, 14, 2);
    sketchLine(ctx, r, 498, 14, 498, 186, 2);
    sketchLine(ctx, r, 498, 186, 14, 186, 2);
    sketchLine(ctx, r, 14, 186, 14, 14, 2);
    ctx.fillStyle = P.graphite;
    ctx.font = `bold 92px ${HAND}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AUDIRA", 256, 108);
  });

// ---------------------------------------------------------------- pencil edges
/** 12 box edges as thin graphite rods with a little overshoot, drawn twice with a seeded wobble. */
const PencilBox: React.FC<{ size: V3; seed: number; r?: number }> = ({ size, seed, r = 0.012 }) => {
  const rods = useMemo(() => {
    const [w, h, d] = size.map((v) => v / 2) as V3;
    const c: V3[] = [];
    for (const x of [-w, w]) for (const y of [-h, h]) for (const z of [-d, d]) c.push([x, y, z]);
    const pairs: [number, number][] = [];
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const diff = c[i].filter((v, k) => v !== c[j][k]).length;
      if (diff === 1) pairs.push([i, j]);
    }
    const rnd = rng(seed);
    const out: { pos: V3; quat: THREE.Quaternion; len: number; rad: number }[] = [];
    for (const [i, j] of pairs) {
      for (let pass = 0; pass < 2; pass++) {
        const a = new THREE.Vector3(...c[i]);
        const b = new THREE.Vector3(...c[j]);
        const dir = b.clone().sub(a).normalize();
        const over = 0.05 + rnd() * 0.06;
        a.addScaledVector(dir, -over * (pass ? 0.4 : 1));
        b.addScaledVector(dir, over * (pass ? 1 : 0.5));
        const jit = new THREE.Vector3((rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.012);
        const mid = a.clone().add(b).multiplyScalar(0.5).add(jit);
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        out.push({ pos: [mid.x, mid.y, mid.z], quat, len: a.distanceTo(b), rad: pass ? r * 0.6 : r });
      }
    }
    return out;
  }, [size, seed, r]);
  return (
    <group>
      {rods.map((rd, i) => (
        <mesh key={i} position={rd.pos} quaternion={rd.quat}>
          <cylinderGeometry args={[rd.rad, rd.rad, rd.len, 5]} />
          <meshBasicMaterial color={P.graphite} transparent opacity={i % 2 ? 0.55 : 0.92} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- scene parts
const STEP = { w: 0.86, rise: 0.46, d: 1.5, x0: -0.25, z: 0.0 };
const stepTop = (i: number) => (i + 1) * STEP.rise;
// Flat drawing on the right page (world coords; the stairs group is offset by STAIRS_OFF).
const STAIRS_OFF: V3 = [0.15, 0, -0.25];
const FLAT = { x0: STEP.x0 + 0.15 + 0.2, zb: 1.78, k: 0.62 };
const FLAT_PROFILE: [number, number][] = (() => {
  const pts: [number, number][] = [[FLAT.x0, FLAT.zb]];
  for (let i = 0; i < 3; i++) {
    const x = FLAT.x0 + i * STEP.w;
    pts.push([x, FLAT.zb - (i + 1) * STEP.rise * FLAT.k]);
    pts.push([x + STEP.w, FLAT.zb - (i + 1) * STEP.rise * FLAT.k]);
  }
  pts.push([FLAT.x0 + 3 * STEP.w, FLAT.zb]);
  pts.push([FLAT.x0, FLAT.zb]);
  return pts;
})();
const stepX = (i: number) => STEP.x0 + (i + 0.5) * STEP.w;

/** Dashed rods from flat-drawing corners (page, y=0) up to step 1's front corners, in stairs-group space. */
const PEEL = (() => {
  const out: { pos: V3; quat: THREE.Quaternion; len: number }[] = [];
  const zTop = FLAT.zb - STEP.rise * FLAT.k;
  const pairs: [V3, V3][] = [
    [[FLAT.x0, 0.005, FLAT.zb], [STEP.x0, 0, STEP.d / 2]],
    [[FLAT.x0, 0.005, zTop], [STEP.x0, stepTop(0), STEP.d / 2]],
    [[FLAT.x0 + STEP.w, 0.005, zTop], [STEP.x0 + STEP.w, stepTop(0), STEP.d / 2]],
  ];
  for (const [aW, b] of pairs) {
    const a = new THREE.Vector3(aW[0] - STAIRS_OFF[0], aW[1], aW[2] - STAIRS_OFF[2]);
    const bb = new THREE.Vector3(...b);
    const n = 9;
    for (let k = 0; k < n; k++) {
      // a gentle peel arc: rises off the paper, settles onto the corner
      const p0 = a.clone().lerp(bb, k / n), p1 = a.clone().lerp(bb, (k + 0.55) / n);
      p0.y += Math.sin((k / n) * Math.PI) * 0.12;
      p1.y += Math.sin(((k + 0.55) / n) * Math.PI) * 0.12;
      const dir = p1.clone().sub(p0);
      const mid = p0.clone().add(p1).multiplyScalar(0.5);
      out.push({ pos: [mid.x, mid.y, mid.z], quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), len: dir.length() });
    }
  }
  return out;
})();

const Stairs: React.FC = () => {
  // per-face pencil shading (+x, -x, +y, -y, +z, -z): shadow side cross-hatched, top nearly clean
  const stepMats = useMemo(() => {
    const grain = surfaceGrain(23, 256, 0.3, 2);
    return [0, 1, 2].map((i) =>
      [2, 1, 0, 1, 1, 1].map(
        (d, k) =>
          new THREE.MeshPhysicalMaterial({ ...POLISH.paper, color: new THREE.Color(i === 2 ? P.paperWhite : "#FFFFFF"), map: makeStepFace(31 + i * 7 + k, d), roughnessMap: grain, bumpMap: grain, bumpScale: 0.6 }),
      ),
    );
  }, []);
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const h = stepTop(i);
        const size: V3 = [STEP.w, h, STEP.d];
        return (
          <group key={i} position={[stepX(i), h / 2 + 0.002, STEP.z]}>
            <mesh castShadow receiveShadow material={stepMats[i]}>
              <RoundedBoxGeo args={size} radius={0.02} />
            </mesh>
            <PencilBox size={size} seed={11 + i} />
            {/* numeral on the side facing the camera */}
            <mesh position={[0, h / 2 - 0.3, STEP.d / 2 + 0.004]}>
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial map={makeNumber(String(i + 1))} transparent toneMapped={false} />
            </mesh>
            {/* numeral on the tread too */}
            <mesh position={[0.05, h / 2 + 0.004, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.34, 0.34]} />
              <meshBasicMaterial map={makeNumber(String(i + 1))} transparent opacity={0.55} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* peel lines: step 1's flat drawing on the page lifting into the 3D block (kit: lines lift low-to-high) */}
      {PEEL.map((rd, k) => (
        <mesh key={`peel${k}`} position={rd.pos} quaternion={rd.quat}>
          <cylinderGeometry args={[0.009, 0.009, rd.len, 5]} />
          <meshBasicMaterial color={P.graphiteMid} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* dashed guide line from the top step up to the bulb: the next line still being drawn */}
      {Array.from({ length: 7 }, (_, k) => {
        const a = new THREE.Vector3(stepX(2) + 0.2, stepTop(2) + 0.08, 0);
        const b = new THREE.Vector3(BULB[0] - 0.05, BULB[1] - 0.55, BULB[2]);
        const p = a.clone().lerp(b, (k + 0.5) / 7);
        const dir = b.clone().sub(a).normalize();
        return (
          <mesh key={k} position={[p.x, p.y, p.z]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)}>
            <cylinderGeometry args={[0.01, 0.01, 0.09, 5]} />
            <meshBasicMaterial color={P.graphiteMid} />
          </mesh>
        );
      })}
    </group>
  );
};

// film: the bulb hangs higher and further right than on the cover so the student can stand on step 3 beneath it
const BULB: V3 = [2.4, 3.45, -0.35];

const IdeaBulb: React.FC<{ f: number; lit: number }> = ({ f, lit }) => {
  const t = f / 60;
  const pulse = 1 + Math.sin(t * 2.4) * 0.04;
  return (
    <group position={BULB} rotation={[0, 0, -0.12]}>
      {/* glass */}
      <mesh castShadow>
        <sphereGeometry args={[0.46, 40, 30]} />
        <meshPhysicalMaterial color={lit > 0.5 ? "#FFF3DE" : "#E9E4DA"} emissive={P.accentGlow} emissiveIntensity={(0.18 + 4.0 * lit) * pulse} roughness={0.18} clearcoat={1} transparent opacity={0.96} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.22, 24]} />
        <meshPhysicalMaterial color="#FFE7C6" emissive={P.accentGlow} emissiveIntensity={0.15 + 2.45 * lit} roughness={0.3} />
      </mesh>
      {/* screw base */}
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[0, -0.58 - k * 0.075, 0]}>
          <torusGeometry args={[0.18 - k * 0.006, 0.03, 8, 24]} />
          <meshStandardMaterial color="#9EA0A6" metalness={0.85} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, -0.69, 0]}>
        <cylinderGeometry args={[0.17, 0.15, 0.26, 20]} />
        <meshStandardMaterial color="#8C8D93" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.86, 0]}>
        <sphereGeometry args={[0.08, 16, 10]} />
        <meshStandardMaterial color={P.graphite} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* pencil outline + rays */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.47, 0.011, 6, 64]} />
        <meshBasicMaterial color={P.graphite} />
      </mesh>
      {Array.from({ length: 9 }, (_, k) => {
        const a = (0.22 + (k / 8) * 0.9) * Math.PI;
        const len = 0.28 + (k % 2) * 0.12;
        const r0 = 0.66;
        return (
          <mesh key={k} position={[Math.cos(a) * (r0 + len / 2), Math.sin(a) * (r0 + len / 2), 0]} rotation={[0, 0, a - Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, len, 6]} />
            <meshBasicMaterial color={k % 3 === 1 ? P.accent : P.graphite} toneMapped={false} />
          </mesh>
        );
      })}
      <pointLight position={[0, 0, 0.4]} intensity={0.4 + 8.6 * lit} distance={6} decay={1.6} color={P.accentGlow} />
    </group>
  );
};

const Notebook: React.FC = () => {
  const tex = useMemo(() => ({ left: makeLeftPage(), right: makeRightPage(), label: makeLabel() }), []);
  const PW = 2.9, PD = 3.9;
  return (
    <group position={[0, 0, 0]}>
      {/* hard cover under both pages */}
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PW * 2 + 0.3, 0.06, PD + 0.28]} radius={0.025} />
        <meshPhysicalMaterial {...POLISH.fabric} color={P.graphite} />
      </mesh>
      {/* page blocks, slightly curved toward the gutter */}
      {[-1, 1].map((sgn) => (
        <group key={sgn}>
          <mesh position={[sgn * (PW / 2 + 0.03), -0.022, 0]} receiveShadow castShadow>
            <boxGeometry args={[PW, 0.04, PD]} />
            <meshStandardMaterial color={P.paperShade} roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, sgn * 0.0, 0]} position={[sgn * (PW / 2 + 0.03), 0.0, 0]} receiveShadow>
            <planeGeometry args={[PW, PD]} />
            <meshPhysicalMaterial {...POLISH.paper} map={sgn < 0 ? tex.left : tex.right} />
          </mesh>
        </group>
      ))}
      {/* gutter shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[0.16, PD]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>
      {/* AUDIRA label on the hard-cover tab behind the left page */}
      <group position={[-1.55, -0.02, -PD / 2 - 0.42]} rotation={[0, -0.03, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[1.85, 0.05, 0.86]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.fabric} color={P.graphite} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.027, 0.02]}>
          <planeGeometry args={[1.62, 0.63]} />
          <meshPhysicalMaterial {...POLISH.paper} map={tex.label} />
        </mesh>
      </group>
    </group>
  );
};

const CheatSheet: React.FC<{ x: number }> = ({ x }) => {
  const tex = useMemo(makeCheatSheet, []);
  return (
    <group position={[-0.95, 0.03, 1.05]} rotation={[0, 0.28, 0]}>
      {/* two halves with a small fold so it reads as a slip of paper, not a decal */}
      <mesh rotation={[-Math.PI / 2 + 0.5, 0, 0.06]} position={[0, 0.32, 0]} castShadow receiveShadow>
        <planeGeometry args={[1.05, 1.35, 1, 1]} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} side={THREE.DoubleSide} />
      </mesh>
      {/* the vermilion X is drawn on in two strokes (sheet-local plane, just above the paper) */}
      <group rotation={[-Math.PI / 2 + 0.5, 0, 0.06]} position={[0, 0.32, 0]}>
        {[0, 1].map((k) => {
          const p = Math.min(1, Math.max(0, x * 2 - k));
          if (p <= 0) return null;
          const A = k === 0 ? [-0.42, 0.56] : [0.42, 0.56];
          const B = k === 0 ? [0.42, -0.54] : [-0.4, -0.52];
          const cx = A[0] + (B[0] - A[0]) * p, cy = A[1] + (B[1] - A[1]) * p;
          const L = Math.hypot(cx - A[0], cy - A[1]);
          const ang = Math.atan2(cy - A[1], cx - A[0]);
          return (
            <mesh key={k} position={[(A[0] + cx) / 2, (A[1] + cy) / 2, 0.006 + k * 0.002]} rotation={[0, 0, ang]}>
              <planeGeometry args={[L, 0.075]} />
              <meshBasicMaterial color={P.accent} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

/** Hexagonal pencil (accent body, graphite tip, ferrule, eraser) lying on the desk. */
const LyingPencil: React.FC<{ position: V3; yaw: number; len?: number }> = ({ position, yaw, len = 3.2 }) => (
  <group position={position} rotation={[0, yaw, Math.PI / 2]}>
    <mesh castShadow position={[0, 0, 0]}>
      <cylinderGeometry args={[0.11, 0.11, len, 6]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.accent} />
    </mesh>
    <mesh castShadow position={[0, -len / 2 - 0.19, 0]} rotation={[Math.PI, 0, 0]}>
      <cylinderGeometry args={[0.03, 0.11, 0.38, 6]} />
      <meshStandardMaterial color={P.wood} roughness={0.8} />
    </mesh>
    <mesh castShadow position={[0, -len / 2 - 0.44, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.032, 0.12, 6]} />
      <meshStandardMaterial color={P.graphite} metalness={0.6} roughness={0.35} />
    </mesh>
    <mesh castShadow position={[0, len / 2 + 0.09, 0]}>
      <cylinderGeometry args={[0.115, 0.115, 0.18, 16]} />
      <meshStandardMaterial color="#B9BBC0" metalness={0.85} roughness={0.3} />
    </mesh>
    <mesh castShadow position={[0, len / 2 + 0.28, 0]}>
      <cylinderGeometry args={[0.108, 0.108, 0.22, 16]} />
      <meshPhysicalMaterial {...POLISH.clay} color="#F2B9A6" />
    </mesh>
  </group>
);

const Eraser: React.FC<{ position: V3; yaw: number }> = ({ position, yaw }) => (
  <group position={position} rotation={[0, yaw, 0]}>
    <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
      <RoundedBoxGeo args={[1.1, 0.32, 0.55]} radius={0.06} />
      <meshPhysicalMaterial {...POLISH.clay} color={P.paperWhite} />
    </mesh>
    <mesh castShadow position={[0.22, 0.16, 0]}>
      <RoundedBoxGeo args={[0.6, 0.335, 0.565]} radius={0.03} />
      <meshPhysicalMaterial {...POLISH.paper} color={P.accent} />
    </mesh>
  </group>
);

const Shavings: React.FC = () => {
  const items = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 14 }, () => ({ p: [1.0 + r() * 1.8, 0.012, 3.3 + r() * 0.9] as V3, rot: r() * 6, s: 0.06 + r() * 0.08 }));
  }, []);
  return (
    <group>
      {items.map((sh, i) => (
        <mesh key={i} position={sh.p} rotation={[-Math.PI / 2, 0, sh.rot]} scale={sh.s}>
          <circleGeometry args={[1, 10, 0, 4]} />
          <meshStandardMaterial color={i % 3 === 0 ? P.accent : P.wood} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};


// ---------------------------------------------------------------- student (real step-up cycle)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const SCALE = 1.6;
const standX = (i: number) => stepX(i) - 0.12;

/** Climb progress 0..2 (step index) over film time: 1 -> 2 on "Jawab", 2 -> 3 on "disesuaikan". */
export const climbAt = (t: number) => sm((t - 49.7) / 1.5) + sm((t - 52.5) / 1.5);

const studentState = (t: number, f: number): { pos: V3; pose: Pose } => {
  const c = climbAt(t);
  const i = Math.min(1, Math.floor(c));
  const p = c >= 2 ? 1 : c - i;
  const moving = p > 0.001 && p < 0.999;
  if (!moving) {
    const at = Math.round(c);
    const cheer = t > 57.9 && t < 59.5;
    const base = poseAt(cheer ? "cheer" : "stand", f, 6);
    return {
      pos: [standX(at), stepTop(at), 0.1],
      pose: { ...base, head: cheer ? base.head : [-0.32 + base.head[0], -0.55 + base.head[1] * 0.4, 0] },
    };
  }
  const pa = sm(p / 0.45); // front foot rises onto the next tread
  const pb = sm((p - 0.38) / 0.62); // weight transfers up, back leg follows
  const lift = pa * (1 - pb);
  const trail = Math.sin(pb * Math.PI);
  const sw = Math.sin(p * Math.PI);
  return {
    pos: [standX(i) + (standX(i + 1) - standX(i)) * (0.15 * pa + 0.85 * pb), stepTop(i) + (stepTop(i + 1) - stepTop(i)) * pb, 0.1],
    pose: {
      body: [0, 0, 0],
      lift: LEG_LENGTH - 0.01 * sw,
      spine: [0.28 * sw, 0, 0],
      head: [-0.2, -0.3, 0],
      ls: [-0.55 * sw, 0, 0.12], le: -0.5 - 0.3 * sw,
      rs: [0.6 * sw, 0, -0.12], re: -0.4,
      lh: [-1.35 * lift, 0, 0.04], lk: 1.6 * lift,
      rh: [0.25 * trail, 0, -0.03], rk: 1.1 * trail,
    },
  };
};

const Student: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = studentState(t, f);
  return (
    <ToyPerson
      f={f}
      seed={6}
      outfit="casual"
      poseOverride={s.pose}
      look={{ skin: "#d09a6c", hair: "#1b1411", top: P.paperWhite, bottom: P.graphiteMid, hairStyle: 0, height: 1, build: 1 }}
      position={s.pos}
      heading={Math.PI / 2}
      scale={SCALE}
    />
  );
};

// ---------------------------------------------------------------- near-desk dressing
const makePhoneScreen = () =>
  canvasTex(360, 720, (ctx) => {
    const r = paperTooth(ctx, 360, 720, 91, P.paperWhite);
    ctx.strokeStyle = "rgba(47,48,52,0.75)";
    ctx.lineWidth = 4;
    sketchLine(ctx, r, 24, 70, 336, 70, 2);
    sketchLine(ctx, r, 24, 130, 336, 130, 2);
    sketchLine(ctx, r, 24, 70, 24, 130, 2);
    sketchLine(ctx, r, 336, 70, 336, 130, 2);
    ctx.fillStyle = P.graphite;
    ctx.font = `bold 30px ${HAND}`;
    ctx.fillText("gemini.google.com", 34, 112);
    ctx.font = `bold 44px ${HAND}`;
    ctx.fillText("versi web", 70, 260);
    ctx.strokeStyle = P.accent;
    ctx.lineWidth = 6;
    sketchLine(ctx, r, 66, 280, 300, 276, 3);
    ctx.strokeStyle = "rgba(47,48,52,0.4)";
    ctx.lineWidth = 3;
    for (let y = 340; y < 600; y += 50) sketchLine(ctx, r, 40, y, 300 - r() * 80, y, 2);
    ctx.strokeStyle = "rgba(47,48,52,0.75)";
    ctx.lineWidth = 4;
    sketchLine(ctx, r, 24, 630, 336, 630, 2);
    sketchLine(ctx, r, 24, 690, 336, 690, 2);
  });

const Phone: React.FC = () => {
  const screen = useMemo(makePhoneScreen, []);
  return (
    <group position={[-2.55, -0.05, 3.35]} rotation={[0, 0.38, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.045, 0]}>
        <RoundedBoxGeo args={[1.0, 0.09, 1.95]} radius={0.04} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.graphite} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.093, 0]}>
        <planeGeometry args={[0.88, 1.78]} />
        <meshStandardMaterial map={screen} emissive="#ffffff" emissiveMap={screen} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
    </group>
  );
};

const makeRuler = () =>
  canvasTex(128, 1024, (ctx) => {
    const r = paperTooth(ctx, 128, 1024, 33, P.wood);
    ctx.strokeStyle = "rgba(47,48,52,0.75)";
    for (let i = 0; i < 40; i++) {
      ctx.lineWidth = i % 5 === 0 ? 3 : 2;
      sketchLine(ctx, r, 0, 20 + i * 25, i % 5 === 0 ? 60 : 32, 20 + i * 25, 1);
    }
  });

const Ruler: React.FC = () => {
  const tex = useMemo(makeRuler, []);
  return (
    <group position={[3.75, -0.075, 1.4]} rotation={[0, -0.18, 0]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[0.5, 0.04, 4.0]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.paper} color={P.wood} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, 0]}>
        <planeGeometry args={[0.5, 4.0]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  );
};

const makeSticky = (txt: string, seed: number) =>
  canvasTex(256, 256, (ctx) => {
    paperTooth(ctx, 256, 256, seed, P.paperWhite);
    ctx.fillStyle = P.accent;
    ctx.fillRect(0, 0, 256, 22);
    ctx.fillStyle = P.graphite;
    ctx.font = `bold 52px ${HAND}`;
    ctx.textAlign = "center";
    ctx.fillText(txt, 128, 150);
  });

const Sticky: React.FC<{ position: V3; yaw: number; txt: string; seed: number }> = ({ position, yaw, txt, seed }) => {
  const tex = useMemo(() => makeSticky(txt, seed), [txt, seed]);
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.012, 0.9]} />
        <meshStandardMaterial color={P.paperWhite} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- rig + scene
const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const k = camAt(t);
    c.position.set(...k.pos);
    c.lookAt(...k.target);
    c.fov = k.fov;
    c.near = 0.05;
    c.far = 80;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }, [camera, t]);
  return null;
};

const Desk: React.FC = () => {
  const tex = useMemo(makeDeskTexture, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.095, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={tex} roughness={0.7} metalness={0.05} />
    </mesh>
  );
};

export const BULB_WORLD: V3 = [BULB[0] + STAIRS_OFF[0], BULB[1] + STAIRS_OFF[1], BULB[2] + STAIRS_OFF[2]];
/** Front edge of each tread in world space (for 2D labels that pin to the steps). */
export const stepWorld = (i: number): V3 => [stepX(i) + STAIRS_OFF[0], stepTop(i), STEP.d / 2 + STAIRS_OFF[2]];
export const studentHeadWorld = (t: number): V3 => {
  const c = climbAt(t);
  const x = standX(0) + (standX(2) - standX(0)) * (c / 2);
  return [x + STAIRS_OFF[0], stepTop(0) + c * STEP.rise + 1.6, 0.1 + STAIRS_OFF[2]];
};

/** Bulb light 0..1: dim until "Sudah merasa paham?", then on for good. */
export const bulbLit = (t: number) => sm((t - 57.7) / 0.9);
/** Cheat-sheet X strokes 0..1, drawn on from 0.6 s so the hook lands in the first 3 s. */
export const crossAt = (t: number) => sm((t - 0.6) / 2.3);

export const WorldScene: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <>
    <color attach="background" args={[P.desk]} />
    <CameraRig t={t} />
    <ambientLight intensity={0.7} color="#FFF4E6" />
    <hemisphereLight args={["#FFF6EA", "#3A3A40", 0.5]} />
    <directionalLight
      position={[-4, 9, 6]}
      intensity={2.2}
      color="#FFF1DE"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-7}
      shadow-camera-right={7}
      shadow-camera-top={7}
      shadow-camera-bottom={-7}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[5, 3.5, -5]} intensity={0.9} color="#DDE6FF" />
    <Desk />
    <Notebook />
    <CheatSheet x={crossAt(t)} />
    <group position={STAIRS_OFF}>
      <Stairs />
      <Student t={t} f={f} />
      <IdeaBulb f={f} lit={bulbLit(t)} />
    </group>
    <LyingPencil position={[0.2, 0.02, 3.55]} yaw={0.22} />
    <Eraser position={[2.6, -0.09, 2.9]} yaw={-0.45} />
    <Shavings />
    <Phone />
    <Ruler />
    <Sticky position={[-3.9, -0.08, -0.6]} yaw={0.25} txt="?" seed={3} />
    <Sticky position={[-3.6, -0.065, 0.55]} yaw={-0.15} txt="x²" seed={4} />
  </>
);
