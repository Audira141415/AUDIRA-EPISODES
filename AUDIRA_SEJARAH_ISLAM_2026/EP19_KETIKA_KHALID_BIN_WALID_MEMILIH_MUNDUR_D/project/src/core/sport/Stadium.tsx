// Venue around a SportField: stepped stands with an instanced crowd (thousands of fans, two draw
// calls, a Mexican wave), LED boards that carry the AUDIRA brand inside the world, and either
// floodlight towers + roof canopy (outdoor) or walls, ceiling lights and a hanging scoreboard
// (indoor). Deterministic: every value comes from `seed` and the 60 fps clock `f`.
//
//   <Stadium f={f} sport="football" teams={[TEAMS.harbour, TEAMS.valley]} />

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { prng } from "../materials/textures.ts";
import { POLISH } from "../polish/Polish.tsx";
import { SKIN_TONES } from "../polish/Person.tsx";
import { brandName } from "../type/brand.ts";
import { SPORTS, fieldExtent, type SportId, type Team } from "./specs.ts";

type V3 = [number, number, number];

const boardCache = new Map<string, THREE.CanvasTexture>();
/** Scrolling LED board texture: brand name and handle on a dark panel. */
export function ledBoardTexture(text: string, sub: string, accent: string): THREE.CanvasTexture {
  const key = `${text}|${sub}|${accent}`;
  let t = boardCache.get(key);
  if (t) return t;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0b0e14";
  g.fillRect(0, 0, 1024, 64);
  g.textBaseline = "middle";
  for (let i = 0; i < 2; i++) {
    const x0 = i * 512;
    g.fillStyle = accent;
    g.fillRect(x0, 0, 10, 64);
    // Fit the name and the handle side by side inside each 512 px tile.
    let size = 40;
    g.font = `800 ${size}px sans-serif`;
    while (g.measureText(text).width > 300 && size > 20) g.font = `800 ${(size -= 2)}px sans-serif`;
    g.fillStyle = "#ffffff";
    g.fillText(text, x0 + 32, 34);
    const tw = g.measureText(text).width;
    g.font = "600 22px sans-serif";
    g.fillStyle = accent;
    g.fillText(sub, x0 + 32 + tw + 24, 34);
  }
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  boardCache.set(key, t);
  return t;
}

type Seat = { x: number; y: number; z: number; shirt: THREE.Color; skin: THREE.Color; phase: number; theta: number; h: number };

export const Stadium: React.FC<{
  f: number;
  sport: SportId;
  seed?: number;
  /** Home and away fan colours; a few neutral shirts are mixed in. */
  teams?: [Team, Team];
  rows?: number;
  /** Share of seats filled, 0..1. */
  fill?: number;
  /** Mexican wave strength, 0 = off. */
  wave?: number;
  /** Board text (defaults to the brand name from brand.json, else AUDIRA). */
  boardText?: string;
  boardSub?: string;
  accent?: string;
  /** Override the venue type (defaults to the sport's). */
  indoor?: boolean;
  /** Draw the venue shell (roof, towers, walls). Off for close shots that never see it. */
  shell?: boolean;
}> = ({ f, sport, seed = 7, teams, rows, fill = 0.88, wave = 1, boardText, boardSub = "audira.my.id", accent = "#ffd23f", indoor, shell = true }) => {
  const S = SPORTS[sport];
  const inside = indoor ?? S.indoor;
  const nRows = rows ?? (inside ? 10 : 18);
  const { w, d } = fieldExtent(sport);
  const gap = inside ? 0.9 : 1.6;
  const hx = w / 2 + gap;
  const hz = d / 2 + gap;
  const step = 0.55;
  const rise = 0.34;
  const base = 0.7;
  const t = f / 60;

  // Stands: one instanced box per side per row.
  const standGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const stands = useMemo(() => {
    const out: { p: V3; s: V3; c: THREE.Color }[] = [];
    for (let i = 0; i < nRows; i++) {
      const o = i * step;
      const top = base + i * rise;
      const c = new THREE.Color(i % 2 ? "#3a404c" : "#434a57");
      const ax = hx + o + step / 2;
      const az = hz + o + step / 2;
      out.push({ p: [0, top / 2, az], s: [(ax + step / 2) * 2, top, step], c });
      out.push({ p: [0, top / 2, -az], s: [(ax + step / 2) * 2, top, step], c });
      out.push({ p: [ax, top / 2, 0], s: [step, top, az * 2], c });
      out.push({ p: [-ax, top / 2, 0], s: [step, top, az * 2], c });
    }
    return out;
  }, [nRows, hx, hz]);
  const standRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = standRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    stands.forEach((b, i) => {
      o.position.set(...b.p);
      o.scale.set(...b.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, b.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [stands]);

  // Crowd seats.
  const seats = useMemo(() => {
    const r = prng(seed * 7717 + 3);
    const home = new THREE.Color(teams?.[0].top ?? "#ff5a3c");
    const away = new THREE.Color(teams?.[1].top ?? "#2f7bff");
    const neutral = ["#f4f1ea", "#262b33", "#7b4fd6", "#1fa67a", "#f2b400"].map((c) => new THREE.Color(c));
    const out: Seat[] = [];
    const spacing = 0.46;
    for (let i = 0; i < nRows; i++) {
      const o = i * step + step / 2;
      const y = base + i * rise;
      const ax = hx + o;
      const az = hz + o;
      const sides: [V3, V3, number][] = [
        [[-ax, y, az], [ax, y, az], 1],
        [[-ax, y, -az], [ax, y, -az], -1],
        [[ax, y, -az], [ax, y, az], 1],
        [[-ax, y, -az], [-ax, y, az], -1],
      ];
      for (const [a, b] of sides) {
        const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
        const n = Math.floor(len / spacing);
        for (let k = 0; k < n; k++) {
          if (r() > fill) continue;
          const u = (k + 0.5 + (r() - 0.5) * 0.3) / n;
          const x = a[0] + (b[0] - a[0]) * u;
          const z = a[2] + (b[2] - a[2]) * u;
          // Home fans behind the +z goal and on the +x side, away fans opposite.
          const homeSide = z > 0 || x > hx * 0.5;
          const v = r();
          const shirt = v < 0.12 ? neutral[Math.floor(r() * neutral.length)] : v < 0.82 ? (homeSide ? home : away) : homeSide ? away : home;
          out.push({
            x, y, z,
            shirt,
            skin: new THREE.Color(SKIN_TONES[Math.floor(r() * SKIN_TONES.length)]),
            phase: r() * Math.PI * 2,
            theta: Math.atan2(z, x),
            h: 0.9 + r() * 0.2,
          });
        }
      }
    }
    return out;
  }, [seed, nRows, hx, hz, fill, teams]);

  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.13, 0.2, 4, 10), []);
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.1, 12, 8), []);
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.fabric }), []);
  const headMat = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.toySkin }), []);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const b = bodyRef.current;
    const h = headRef.current;
    if (!b || !h) return;
    seats.forEach((s, i) => {
      b.setColorAt(i, s.shirt);
      h.setColorAt(i, s.skin);
    });
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
    if (h.instanceColor) h.instanceColor.needsUpdate = true;
  }, [seats]);
  useLayoutEffect(() => {
    const b = bodyRef.current;
    const h = headRef.current;
    if (!b || !h) return;
    const o = new THREE.Object3D();
    seats.forEach((s, i) => {
      // Idle fidget + bounce, and the wave sweeping around the bowl.
      const bounce = Math.max(0, Math.sin(t * 5.2 + s.phase)) * 0.035;
      const wv = wave > 0 ? Math.pow(Math.max(0, Math.cos(s.theta - t * 1.1)), 18) * wave : 0;
      const up = bounce + wv * 0.28;
      const stretch = 1 + wv * 0.35;
      o.position.set(s.x, s.y + 0.27 * s.h + up, s.z);
      o.scale.set(1, s.h * stretch, 1);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      b.setMatrixAt(i, o.matrix);
      o.position.set(s.x, s.y + 0.6 * s.h * stretch + up, s.z);
      o.scale.set(1, 1, 1);
      o.updateMatrix();
      h.setMatrixAt(i, o.matrix);
    });
    b.instanceMatrix.needsUpdate = true;
    h.instanceMatrix.needsUpdate = true;
  }, [seats, t, wave]);

  // LED boards on the field edge.
  const text = boardText ?? (brandName("AUDIRA").toUpperCase() || "AUDIRA");
  const boardTex = useMemo(() => {
    const tx = ledBoardTexture(text, boardSub, accent).clone();
    tx.needsUpdate = true;
    return tx;
  }, [text, boardSub, accent]);
  const bh = 0.5;
  const bx = w / 2 + 0.25;
  const bz = d / 2 + 0.25;
  boardTex.repeat.set(Math.max(1, Math.round((bx * 2) / 6)), 1);
  boardTex.offset.x = -t * 0.12;

  const outerX = hx + nRows * step;
  const outerZ = hz + nRows * step;
  const topY = base + nRows * rise;

  return (
    <group>
      {/* Ground apron under everything */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[outerX * 2 + 60, outerZ * 2 + 60]} />
        <meshStandardMaterial color={inside ? "#20252e" : "#5b5f5a"} roughness={0.9} />
      </mesh>
      <instancedMesh ref={standRef} args={[standGeo, undefined, stands.length]} receiveShadow castShadow>
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={bodyRef} args={[bodyGeo, bodyMat, seats.length]} />
      <instancedMesh ref={headRef} args={[headGeo, headMat, seats.length]} />
      {/* LED boards: brand inside the world */}
      {(
        [
          [[0, bh / 2, bz], [bx * 2, bh], 0],
          [[0, bh / 2, -bz], [bx * 2, bh], Math.PI],
          [[bx, bh / 2, 0], [bz * 2, bh], Math.PI / 2],
          [[-bx, bh / 2, 0], [bz * 2, bh], -Math.PI / 2],
        ] as [V3, [number, number], number][]
      ).map(([p, [bw, h], ry], i) => (
        <group key={i} position={p} rotation={[0, ry, 0]}>
          <mesh position={[0, 0, 0.02]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[bw, h]} />
            <meshStandardMaterial map={boardTex} emissiveMap={boardTex} emissive="#ffffff" emissiveIntensity={1.1} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[bw, h + 0.04, 0.06]} />
            <meshStandardMaterial color="#0d1117" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {shell && !inside && (
        <>
          {/* Roof canopy over the back rows */}
          {(
            [
              [[0, topY + 2.4, outerZ - 2.2], [outerX * 2, 0.25, 6]],
              [[0, topY + 2.4, -(outerZ - 2.2)], [outerX * 2, 0.25, 6]],
              [[outerX - 2.2, topY + 2.4, 0], [6, 0.25, outerZ * 2]],
              [[-(outerX - 2.2), topY + 2.4, 0], [6, 0.25, outerZ * 2]],
            ] as [V3, V3][]
          ).map(([p, s], i) => (
            <mesh key={i} position={p} castShadow>
              <boxGeometry args={s} />
              <meshPhysicalMaterial color="#e9edf2" roughness={0.5} clearcoat={0.3} />
            </mesh>
          ))}
          {/* Back wall of the bowl */}
          {(
            [
              [[0, topY / 2 + 1.2, outerZ + 0.2], [outerX * 2 + 0.4, topY + 2.4, 0.4]],
              [[0, topY / 2 + 1.2, -outerZ - 0.2], [outerX * 2 + 0.4, topY + 2.4, 0.4]],
              [[outerX + 0.2, topY / 2 + 1.2, 0], [0.4, topY + 2.4, outerZ * 2]],
              [[-outerX - 0.2, topY / 2 + 1.2, 0], [0.4, topY + 2.4, outerZ * 2]],
            ] as [V3, V3][]
          ).map(([p, s], i) => (
            <mesh key={i} position={p}>
              <boxGeometry args={s} />
              <meshStandardMaterial color="#2b313c" roughness={0.8} />
            </mesh>
          ))}
          {/* Floodlight towers */}
          {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], i) => (
            <group key={i} position={[sx * (outerX + 2), 0, sz * (outerZ + 2)]} rotation={[0, Math.atan2(-sx, -sz), 0]}>
              <mesh position={[0, (topY + 14) / 2, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.6, topY + 14, 10]} />
                <meshStandardMaterial color="#c9ced6" metalness={0.5} roughness={0.4} />
              </mesh>
              <group position={[0, topY + 14, 0.4]} rotation={[0.45, 0, 0]}>
                <mesh>
                  <boxGeometry args={[5, 3, 0.4]} />
                  <meshStandardMaterial color="#1b1f27" />
                </mesh>
                {Array.from({ length: 12 }, (_, k) => (
                  <mesh key={k} position={[-1.9 + (k % 4) * 1.27, 1 - Math.floor(k / 4) * 1, 0.21]}>
                    <circleGeometry args={[0.42, 16]} />
                    <meshBasicMaterial color="#fffbea" toneMapped={false} />
                  </mesh>
                ))}
              </group>
            </group>
          ))}
        </>
      )}
      {shell && inside && (
        <>
          {/* Walls, ceiling with light panels, hanging scoreboard */}
          {(
            [
              [[0, 6, outerZ + 0.2], [outerX * 2 + 0.4, 12, 0.4]],
              [[0, 6, -outerZ - 0.2], [outerX * 2 + 0.4, 12, 0.4]],
              [[outerX + 0.2, 6, 0], [0.4, 12, outerZ * 2]],
              [[-outerX - 0.2, 6, 0], [0.4, 12, outerZ * 2]],
            ] as [V3, V3][]
          ).map(([p, s], i) => (
            <mesh key={i} position={p}>
              <boxGeometry args={s} />
              <meshStandardMaterial color="#1a1f29" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[outerX * 2, outerZ * 2]} />
            <meshStandardMaterial color="#12161d" side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 12 }, (_, k) => (
            <mesh key={k} position={[((k % 4) - 1.5) * (w / 4), 11.9, (Math.floor(k / 4) - 1) * (d / 3)]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.6, 1.6]} />
              <meshBasicMaterial color="#fff6e0" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
          <Scoreboard y={8.6} text={text} accent={accent} />
        </>
      )}
    </group>
  );
};

const scoreCache = new Map<string, THREE.CanvasTexture>();
const Scoreboard: React.FC<{ y: number; text: string; accent: string }> = ({ y, text, accent }) => {
  const tex = useMemo(() => {
    const key = `${text}|${accent}`;
    let t = scoreCache.get(key);
    if (!t) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const g = c.getContext("2d")!;
      g.fillStyle = "#06080c";
      g.fillRect(0, 0, 512, 256);
      g.fillStyle = accent;
      g.fillRect(0, 0, 512, 10);
      g.fillStyle = "#ffffff";
      g.textAlign = "center";
      g.font = "800 72px sans-serif";
      g.fillText(text, 256, 120);
      g.font = "600 34px sans-serif";
      g.fillStyle = accent;
      g.fillText("LIVE", 256, 200);
      t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      scoreCache.set(key, t);
    }
    return t;
  }, [text, accent]);
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[3.4, 1.8, 3.4]} />
        <meshStandardMaterial color="#0d1015" metalness={0.4} roughness={0.5} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r) => (
        <mesh key={r} rotation={[0, r, 0]} position={[Math.sin(r) * 1.71, 0, Math.cos(r) * 1.71]}>
          <planeGeometry args={[3.2, 1.6]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={1.2} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
};
