// SEJARAH MAKKAH · EP04 — Kiswah. Topic cover = first key image of the film.
// A huge black silk kiswah fills the frame. Across it runs the gold hizam band, shown in its real
// production order from left to right: finished gold satin over raised cotton padding, the active
// stitch with needle and taut gold thread, yellow cotton padding waiting for gold, then only the
// white silk-screen print. Below, four thread cards hold the earlier kiswah colours.
// The band ornament is purely geometric (overlapping squares, lozenges, knots): no pseudo-letters.
// Authored for 9:16; Finish (FormatFov) and useFormat adapt it to 16:9.

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { mulberry32 } from "../../kits/sulamforge/core/motion.ts";

export const KISWAH_COVER_SECONDS = 3;

export const C = {
  bg: "#0A0708",
  silk: "#0E0C0E",
  gold: "#E3A93E",
  goldDeep: "#B98A33",
  cotton: "#E2D29A",
  chalk: "#EDE7DA",
  beech: "#C9A274",
  cream: "#F6EAD6",
};

// ---------- band layout (scene units ≈ metres; the real hizam is 95 cm wide) ----------
const STAR_H = 0.26; // half size of the axis square
const STAR_R = STAR_H * Math.SQRT2; // half diagonal of the rotated square
const PITCH = 0.92; // motif repeat along the band
const STITCH = 0.0115; // satin spacing
const X_MIN = -5.6;
const X_MAX = 5.6;
const NEEDLE_X = 0.06; // where the active satin stitch is being laid
const WORK = Math.round(NEEDLE_X / PITCH); // index of the motif under the needle (0 → centre 0)
const TOP = 0.02; // stitch height above the cloth (raised over padding)

export type Seg = { a: THREE.Vector3; b: THREE.Vector3; r: number };
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const starHalfZ = (dx: number) => Math.max(Math.abs(dx) <= STAR_H ? STAR_H : 0, STAR_R - Math.abs(dx));
const starHalfX = (z: number) => Math.max(Math.abs(z) <= STAR_H ? STAR_H : 0, STAR_R - Math.abs(z));
const LOZ = 0.11;

function buildBand() {
  const goldSatin: Seg[] = [];
  const goldCord: Seg[] = [];
  const padding: Seg[] = [];
  const chalk: Seg[] = [];
  const knots: THREE.Vector3[] = [];
  const centres: number[] = [];
  for (let i = Math.floor(X_MIN / PITCH); i <= Math.ceil(X_MAX / PITCH); i++) centres.push(i * PITCH);

  const squares = (cx: number, h: number, y: number, r: number, out: Seg[]) => {
    const A = [v(cx - h, y, -h), v(cx + h, y, -h), v(cx + h, y, h), v(cx - h, y, h)];
    const R = h * Math.SQRT2;
    const B = [v(cx, y, -R), v(cx + R, y, 0), v(cx, y, R), v(cx - R, y, 0)];
    for (const P of [A, B]) for (let k = 0; k < 4; k++) out.push({ a: P[k], b: P[(k + 1) % 4], r });
  };
  const diamond = (cx: number, h: number, y: number, r: number, out: Seg[]) => {
    const P = [v(cx, y, -h), v(cx + h, y, 0), v(cx, y, h), v(cx - h, y, 0)];
    for (let k = 0; k < 4; k++) out.push({ a: P[k], b: P[(k + 1) % 4], r });
  };
  const ring = (cx: number, rad: number, y: number, r: number, out: Seg[]) => {
    const n = 28;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 1) / n) * Math.PI * 2;
      out.push({ a: v(cx + Math.cos(a0) * rad, y, Math.sin(a0) * rad), b: v(cx + Math.cos(a1) * rad, y, Math.sin(a1) * rad), r });
    }
  };

  centres.forEach((cx, idx) => {
    const i = Math.round(cx / PITCH);
    const lx = cx + PITCH / 2; // lozenge between stars
    const done = i < WORK;
    const working = i === WORK;
    const padded = i <= WORK + 1;
    // cotton padding strands, running along the band under the satin
    if (padded && !done) {
      for (let z = -STAR_R + 0.012; z <= STAR_R - 0.012; z += 0.019) {
        const hx = starHalfX(z) - 0.006;
        if (hx > 0.02) padding.push({ a: v(cx - hx, 0.009, z), b: v(cx + hx, 0.009, z), r: 0.0105 });
      }
      for (let z = -LOZ + 0.01; z <= LOZ - 0.01; z += 0.019) {
        const hx = LOZ - Math.abs(z) - 0.004;
        if (hx > 0.01) padding.push({ a: v(lx - hx, 0.009, z), b: v(lx + hx, 0.009, z), r: 0.0105 });
      }
    }
    // gold satin, laid across the band over the padding
    if (done || working) {
      for (let x = cx - STAR_R + STITCH / 2; x <= cx + STAR_R; x += STITCH) {
        if (working && x > NEEDLE_X) break;
        const hz = starHalfZ(x - cx);
        // tiny per-stitch tilt and height jitter: hand-laid gold glints unevenly
        const j = Math.sin(x * 913.7) * 0.5 + Math.sin(x * 377.1) * 0.5;
        if (hz > 0.01) goldSatin.push({ a: v(x - j * 0.0025, TOP + j * 0.0015, -hz), b: v(x + j * 0.0025, TOP - j * 0.0015, hz), r: 0.0062 });
      }
    }
    if (done) {
      for (let x = lx - LOZ + STITCH / 2; x <= lx + LOZ; x += STITCH) {
        const hz = LOZ - Math.abs(x - lx);
        if (hz > 0.006) goldSatin.push({ a: v(x, TOP, -hz), b: v(x, TOP, hz), r: 0.0062 });
      }
      squares(cx, STAR_H, TOP + 0.012, 0.0085, goldCord);
      ring(cx, 0.1, TOP + 0.014, 0.007, goldCord);
      diamond(lx, LOZ + 0.02, TOP + 0.01, 0.007, goldCord);
      // small French-knot rosette in the star centre
      for (let k = 0; k < 8; k++) knots.push(v(cx + Math.cos((k / 8) * Math.PI * 2) * 0.05, TOP + 0.016, Math.sin((k / 8) * Math.PI * 2) * 0.05));
      knots.push(v(cx, TOP + 0.018, 0));
    } else {
      // white silk-screen print the embroiderers follow
      squares(cx, STAR_H, 0.0015, 0.0028, chalk);
      ring(cx, 0.1, 0.0015, 0.0024, chalk);
      diamond(lx, LOZ + 0.02, 0.0015, 0.0028, chalk);
    }
    void idx;
  });

  // border cords and a knot line, finished a little past the needle
  const borderEnd = NEEDLE_X + 0.55;
  for (const z of [-0.44, 0.44]) goldCord.push({ a: v(X_MIN, 0.012, z), b: v(borderEnd, 0.012, z), r: 0.015 });
  for (const z of [-0.395, 0.395]) goldCord.push({ a: v(X_MIN, 0.008, z), b: v(borderEnd - 0.12, 0.008, z), r: 0.008 });
  for (const z of [-0.44, 0.44, -0.395, 0.395]) chalk.push({ a: v(borderEnd, 0.0015, z), b: v(X_MAX, 0.0015, z), r: 0.003 });
  for (let x = X_MIN; x < borderEnd - 0.2; x += 0.034) for (const z of [-0.4175, 0.4175]) knots.push(v(x, 0.012, z));
  return { goldSatin, goldCord, padding, chalk, knots };
}

// ---------- materials & textures ----------
export function silkTextures() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = C.silk;
  g.fillRect(0, 0, S, S);
  const rnd = mulberry32(7);
  // fine weft lines
  for (let y = 0; y < S; y += 2) {
    g.fillStyle = `rgba(${40 + rnd() * 10},${36 + rnd() * 8},${42 + rnd() * 10},${0.18 + rnd() * 0.12})`;
    g.fillRect(0, y, S, 1);
  }
  // jacquard: a tone-on-tone geometric trellis (lozenges and 8-point rosettes), never letters
  g.strokeStyle = "rgba(70,62,70,0.55)";
  g.lineWidth = 5;
  const cell = S / 4;
  for (let i = -1; i <= 4; i++) {
    g.beginPath();
    g.moveTo(i * cell, 0);
    g.lineTo(i * cell + S, S);
    g.moveTo(i * cell, S);
    g.lineTo(i * cell + S, 0);
    g.stroke();
  }
  g.lineWidth = 4;
  for (let yy = 0; yy < 4; yy++)
    for (let xx = 0; xx < 4; xx++) {
      const cx = (xx + 0.5) * cell;
      const cy = (yy + 0.5) * cell;
      const r = cell * 0.2;
      for (const rot of [0, Math.PI / 4]) {
        g.beginPath();
        for (let k = 0; k <= 4; k++) {
          const a = rot + (k / 4) * Math.PI * 2 + Math.PI / 4;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.stroke();
      }
    }
  // panel seam at the tile edge: every tile = one 98 cm panel
  g.fillStyle = "rgba(0,0,0,0.9)";
  g.fillRect(0, 0, 6, S);
  g.fillStyle = "rgba(90,80,88,0.5)";
  g.fillRect(7, 0, 2, S);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;
  const bump = map.clone();
  bump.colorSpace = THREE.NoColorSpace;
  return { map, bump };
}

export const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1);
const Y = new THREE.Vector3(0, 1, 0);

export const Segments: React.FC<{ segs: Seg[]; material: THREE.Material; cast?: boolean }> = ({ segs, material, cast = true }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(unitCyl, material, Math.max(1, segs.length));
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    segs.forEach((sg, i) => {
      const d = sg.b.clone().sub(sg.a);
      const len = d.length();
      q.setFromUnitVectors(Y, d.normalize());
      s.set(sg.r, len, sg.r);
      mat.compose(sg.a.clone().add(sg.b).multiplyScalar(0.5), q, s);
      m.setMatrixAt(i, mat);
    });
    m.count = segs.length;
    m.castShadow = cast;
    m.receiveShadow = true;
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [segs, material, cast]);
  return <primitive object={mesh} />;
};

export const Knots: React.FC<{ pts: THREE.Vector3[]; material: THREE.Material }> = ({ pts, material }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.011, 10, 8), material, pts.length);
    const mat = new THREE.Matrix4();
    pts.forEach((p, i) => m.setMatrixAt(i, mat.makeTranslation(p.x, p.y, p.z)));
    m.castShadow = true;
    m.instanceMatrix.needsUpdate = true;
    return m;
  }, [pts, material]);
  return <primitive object={mesh} />;
};

// ---------- thread cards: the earlier kiswah colours ----------
export const CARDS = [
  { color: "#EEE6D6", name: "putih" },
  { color: "#A8242E", name: "merah" },
  { color: "#2E6E47", name: "hijau" },
  { color: "#151314", name: "hitam" },
];

export const ThreadCard: React.FC<{ x: number; z: number; color: string; seed: number }> = ({ x, z, color, seed }) => {
  const segs = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: Seg[] = [];
    for (let k = 0; k < 30; k++) {
      const xx = -0.088 + k * 0.0059;
      const j = (rnd() - 0.5) * 0.004;
      out.push({ a: v(xx + j, 0.03, -0.085), b: v(xx - j, 0.03, 0.085), r: 0.0042 });
    }
    return out;
  }, [seed]);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.5,
        sheen: 1,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.45),
      }),
    [color],
  );
  return (
    <group position={[x, 0, z]} rotation={[0, (seed - 2.5) * 0.05, 0]}>
      <mesh position={[0, 0.013, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.022, 0.2]} />
        <meshStandardMaterial color={C.beech} roughness={0.55} />
      </mesh>
      <Segments segs={segs} material={mat} />
    </group>
  );
};

/** Foreground spool of gold-plated silver thread, partly out of frame: depth and the source of the taut threads. */
export const GoldSpool: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const wound = useMemo(() => {
    const out: Seg[] = [];
    for (let k = 0; k < 46; k++) {
      const y = 0.04 + k * 0.0052;
      const a0 = k * 0.7;
      for (let j = 0; j < 24; j++) {
        const a = a0 + (j / 24) * Math.PI * 2;
        const b2 = a0 + ((j + 1) / 24) * Math.PI * 2;
        const rr = 0.145;
        out.push({ a: v(Math.cos(a) * rr, y, Math.sin(a) * rr), b: v(Math.cos(b2) * rr, y + 0.0002, Math.sin(b2) * rr), r: 0.0034 });
      }
    }
    return out;
  }, []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.3, envMapIntensity: 2.4 }), []);
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.135, 0.135, 0.24, 32]} />
        <meshStandardMaterial color="#6B4A2A" roughness={0.6} />
      </mesh>
      {[0.025, 0.285].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.03, 40]} />
          <meshStandardMaterial color={C.beech} roughness={0.5} />
        </mesh>
      ))}
      <Segments segs={wound} material={gold} />
    </group>
  );
};

// ---------- scene ----------
const Rig: React.FC<{ t: number; wide: boolean }> = ({ t, wide }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const drift = Math.sin(t * 0.6) * 0.03;
    // portrait: band in the middle, thread cards below, title above the band
    const tgt = wide ? v(0.25, 0, -0.22) : v(0.2, 0, -0.02);
    const k = wide ? 0.95 : 0.78;
    c.position.set(tgt.x + 0.3 * k + drift, 3.7 * k, tgt.z + 3.0 * k);
    c.fov = 34;
    c.near = 0.05;
    c.far = 60;
    c.lookAt(tgt);
    c.updateProjectionMatrix();
  }, [camera, t, wide]);
  return null;
};

const KiswahWorld: React.FC<{ wide: boolean }> = ({ wide }) => {
  const band = useMemo(() => buildBand(), []);
  const silk = useMemo(() => silkTextures(), []);
  const cloth = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, 18, 240, 140);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i); // becomes -z
      const away = Math.max(0, Math.abs(y) - 1.0);
      p.setZ(i, away * 0.05 * (Math.sin(x * 1.3 + y * 0.5) + 0.5 * Math.sin(y * 2.1 - x * 0.3)));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useMemo(() => {
    silk.map.repeat.set(30 / 0.98, 18 / 0.98);
    silk.bump.repeat.set(30 / 0.98, 18 / 0.98);
  }, [silk]);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.17, envMapIntensity: 2.6 }), []);
  const cordMat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.goldDeep, metalness: 1, roughness: 0.3, envMapIntensity: 2.2 }), []);
  const cottonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.cotton, roughness: 0.95 }), []);
  const chalkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.chalk, roughness: 0.9 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#D9DDE3", metalness: 1, roughness: 0.18 }), []);

  // needle: tip enters the cloth at the end of the active stitch, eye up and back
  const needle = useMemo(() => {
    const hz = starHalfZ(NEEDLE_X - WORK * PITCH);
    const tip = v(NEEDLE_X + STITCH, 0.0, hz + 0.01);
    const dir = v(0.32, 0.86, -0.4).normalize();
    const eye = tip.clone().add(dir.clone().multiplyScalar(0.42));
    return { tip, dir, eye };
  }, []);
  // taut gold threads leaving the frame toward the spools
  const threads = useMemo<Seg[]>(() => {
    const far = (x: number, z: number) => v(x, 4.4, z);
    return [
      { a: needle.eye, b: far(1.6, -3.2), r: 0.0042 },
      { a: v(NEEDLE_X + 0.55, 0.012, -0.44), b: far(2.6, -4.2), r: 0.0048 },
      { a: v(NEEDLE_X + 0.55, 0.012, 0.44), b: far(3.2, -3.0), r: 0.0048 },
      { a: v(NEEDLE_X - 0.12, TOP, -0.2), b: far(-0.6, -4.6), r: 0.0036 },
    ];
  }, [needle]);
  // thread in the needle: from the active stitch end up to the eye
  const live = useMemo<Seg[]>(() => [{ a: v(NEEDLE_X, TOP, starHalfZ(NEEDLE_X - WORK * PITCH)), b: needle.tip.clone().add(v(0, 0.01, 0)), r: 0.0045 }], [needle]);
  const needleQ = useMemo(() => new THREE.Quaternion().setFromUnitVectors(Y, needle.dir), [needle]);
  const needleMid = useMemo(() => needle.tip.clone().add(needle.dir.clone().multiplyScalar(0.21)), [needle]);

  return (
    <group>
      <mesh geometry={cloth} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshPhysicalMaterial
          map={silk.map}
          bumpMap={silk.bump}
          bumpScale={0.9}
          roughness={0.52}
          sheen={1}
          sheenRoughness={0.32}
          sheenColor="#5A4E5C"
          envMapIntensity={0.6}
        />
      </mesh>
      <Segments segs={band.padding} material={cottonMat} />
      <Segments segs={band.goldSatin} material={goldMat} />
      <Segments segs={band.goldCord} material={cordMat} />
      <Segments segs={band.chalk} material={chalkMat} cast={false} />
      <Knots pts={band.knots} material={goldMat} />
      <Segments segs={threads} material={goldMat} />
      <Segments segs={live} material={goldMat} />
      <mesh position={needleMid} quaternion={needleQ} castShadow>
        <cylinderGeometry args={[0.01, 0.002, 0.42, 16]} />
        <primitive object={steel} attach="material" />
      </mesh>
      {/* portrait only: in 16:9 it sits too close to the lens and reads as a blob */}
      {!wide && <GoldSpool position={[0.8, 0, -0.92]} />}
      {CARDS.map((c, i) => (
        <ThreadCard key={c.name} x={(wide ? 0.25 : 0.28) + (i - 1.5) * (wide ? 0.42 : 0.275)} z={wide ? 0.66 : 0.86} color={c.color} seed={i + 1} />
      ))}
    </group>
  );
};

const Overlay: React.FC = () => {
  const fmt = useFormat();
  const { width } = useVideoConfig();
  const s = fmt.scale;
  const wide = fmt.isWide;
  const L = fmt.layout;
  const left = (wide ? fmt.safe.left : 64) * s;
  const top = (wide ? fmt.safe.top + 18 : 200) * s;
  const titleSize = (wide ? 92 : 104) * s;
  const shadow = `0 ${3 * s}px ${22 * s}px rgba(0,0,0,0.85)`;
  void width;
  void L;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: C.cream, fontFamily: "'Georgia', serif" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 52%, rgba(8,5,6,0.62) 100%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: wide
            ? "linear-gradient(180deg, rgba(8,5,6,0.78) 0%, rgba(8,5,6,0.35) 30%, rgba(8,5,6,0) 42%)"
            : "linear-gradient(180deg, rgba(8,5,6,0.8) 0%, rgba(8,5,6,0.45) 26%, rgba(8,5,6,0) 36%)",
        }}
      />
      <div style={{ position: "absolute", top, left, right: left }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: (wide ? 24 : 26) * s, letterSpacing: 5 * s, color: C.gold, textShadow: shadow }}>
          SEJARAH MAKKAH · EP04
        </div>
        <div style={{ marginTop: 14 * s, fontSize: titleSize, fontWeight: 700, lineHeight: 1.0, letterSpacing: -1 * s, textShadow: shadow }}>
          {wide ? (
            <>
              Benang <span style={{ color: C.gold }}>Emas</span> yang
              <br />
              Bukan <span style={{ color: C.gold }}>Emas</span>
            </>
          ) : (
            <>
              Benang <span style={{ color: C.gold }}>Emas</span>
              <br />
              yang Bukan
              <br />
              <span style={{ color: C.gold }}>Emas</span>
            </>
          )}
        </div>
        <div style={{ marginTop: 16 * s, fontFamily: "'Courier New', monospace", fontSize: (wide ? 22 : 24) * s, letterSpacing: 2 * s, color: "rgba(246,234,214,0.88)", textShadow: shadow }}>
          perak · disepuh emas 24 karat
        </div>
      </div>
    </div>
  );
};

export const KiswahCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const wide = width > height;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: C.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.4, 3.8, 3.3], fov: 34, near: 0.05, far: 60 }}>
        <Rig t={t} wide={wide} />
        <fog attach="fog" args={[C.bg, 6, 13]} />
        <hemisphereLight args={["#FFE7C8", "#140A0C", 0.35]} />
        {/* low grazing warm key from the left: satin stitches and padding read as raised */}
        <directionalLight
          position={[-3.4, 2.7, 1.8]}
          intensity={2.9}
          color="#FFD7A0"
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-bias={-0.0003}
          shadow-normalBias={0.002}
          shadow-camera-left={-3.5}
          shadow-camera-right={3.5}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-camera-near={0.1}
          shadow-camera-far={12}
        />
        {/* cool back rim for the silk sheen */}
        <directionalLight position={[2.5, 1.4, -4]} intensity={0.9} color="#B8C2FF" />
        {/* warm pool on the working area */}
        <pointLight position={[NEEDLE_X + 0.2, 1.1, 0.9]} intensity={2.2} distance={4} decay={1.6} color="#FFE2B0" />
        <KiswahWorld wide={wide} />
        <Finish frame={frame} background={C.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.92} hdri="studio" envIntensity={1.05} ao aoRadius={0.08} focus={wide ? 4.15 : 3.45} aperture={0.0009} maxBlur={0.006} />
      </ThreeCanvas>
      <Overlay />
    </div>
  );
};
