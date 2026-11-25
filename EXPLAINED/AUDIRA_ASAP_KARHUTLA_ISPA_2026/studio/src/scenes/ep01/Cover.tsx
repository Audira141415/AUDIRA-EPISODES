// EP01 cover (SATELLITEBRIEFING): southern New Guinea from orbit. Fire hotspots around Merauke,
// a smoke plume carried north-west along the south coast to Timika (Mimika), which has almost
// no hotspots of its own. All motion comes from useCurrentFrame(); all randomness is seeded.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { prng } from "../../core/materials/textures.ts";
import { SATELLITEBRIEFING_PALETTE as P } from "../../kits/satellitebriefing/lib/palette.ts";
import {
  W, heightAt, buildTerrainGeometry, buildColorTexture, buildSmokeTexture, buildGlowTexture, buildPlateTexture,
} from "./terrain.ts";

const WIDTH = 1080, HEIGHT = 1920, FOV = 34;
const BG = "#070B0E";

const TIMIKA: [number, number] = [136.89, -4.53];
const MERAUKE: [number, number] = [140.4, -8.49];

// ---------- camera (shared by the 3D rig and the HTML label projection) ----------
const camState = (frame: number) => {
  const [tx, tz] = W(138.6, -6.05);
  const elev = (62 * Math.PI) / 180;
  const yaw = (-8 * Math.PI) / 180 + frame * 0.0006;
  const dist = 23.5 - frame * 0.015;
  const pos = new THREE.Vector3(
    tx + Math.sin(yaw) * Math.cos(elev) * dist,
    Math.sin(elev) * dist,
    tz + Math.cos(yaw) * Math.cos(elev) * dist,
  );
  const target = new THREE.Vector3(tx, 0, tz);
  const cam = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.1, 80);
  cam.position.copy(pos);
  cam.lookAt(target);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return { pos, target, cam };
};
const project = (cam: THREE.PerspectiveCamera, lon: number, lat: number, lift = 0) => {
  const [x, z] = W(lon, lat);
  const v = new THREE.Vector3(x, heightAt(lon, lat) + lift, z).project(cam);
  return { x: (v.x * 0.5 + 0.5) * WIDTH, y: (-v.y * 0.5 + 0.5) * HEIGHT };
};

const Rig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, target } = camState(frame);
    const c = camera as THREE.PerspectiveCamera;
    c.fov = FOV;
    c.near = 0.1;
    c.far = 80;
    c.position.copy(pos);
    c.lookAt(target);
    c.updateProjectionMatrix();
    c.updateMatrixWorld(true);
  }, [camera, frame]);
  return null;
};

// ---------- smoke path: Merauke -> south coast -> Timika ----------
const PATH: [number, number][] = [
  [140.45, -8.45], [139.75, -7.95], [139.0, -7.25], [138.3, -6.45], [137.75, -5.6], [137.15, -5.0], [136.95, -4.68], [136.75, -4.45],
];
const pathAt = (t: number): { lon: number; lat: number; nx: number; ny: number } => {
  const s = Math.min(PATH.length - 1.0001, Math.max(0, t * (PATH.length - 1)));
  const i = Math.floor(s), f = s - i;
  const [a, b] = [PATH[i], PATH[i + 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  return { lon: a[0] + dx * f, lat: a[1] + dy * f, nx: -dy / l, ny: dx / l };
};
const gauss = (r: () => number) => (r() + r() + r() - 1.5) / 1.5;

type Puff = { lon: number; lat: number; h: number; size: number; rot: number; warm: number; layer: number; speed: number };
const makePuffs = (): Puff[] => {
  const r = prng(4242);
  const out: Puff[] = [];
  // main plume: three braided fingers that widen and meander downwind
  for (let i = 0; i < 820; i++) {
    const t = Math.pow(r(), 0.8);
    const p = pathAt(t);
    const finger = Math.floor(r() * 3) - 1;
    const width = 0.08 + t * 0.32;
    const off = finger * (0.05 + t * 0.32) + Math.sin(t * 11 + finger * 2.1) * 0.12 * t + gauss(r) * width;
    out.push({
      lon: p.lon + p.nx * off, lat: p.lat + p.ny * off,
      h: 0.04 + r() * 0.12 + t * 0.05,
      size: 0.18 + t * 0.5 + r() * 0.28,
      rot: r() * Math.PI * 2,
      warm: Math.max(0, 1 - t * 2.6),
      layer: Math.floor(r() * 3),
      speed: 0.6 + r() * 0.8,
    });
  }
  // branch plumes from the inland fire clusters, merging into the main flow
  for (let i = 0; i < 260; i++) {
    const c = CLUSTERS[1 + Math.floor(r() * 3)];
    const join = pathAt(0.4 + r() * 0.15);
    const s = r();
    out.push({
      lon: c[0] + (join.lon - c[0]) * s + gauss(r) * 0.12, lat: c[1] + (join.lat - c[1]) * s + gauss(r) * 0.12,
      h: 0.05 + r() * 0.12, size: 0.16 + s * 0.3 + r() * 0.2, rot: r() * Math.PI * 2,
      warm: Math.max(0, 0.8 - s), layer: 1 + Math.floor(r() * 2), speed: 0.5 + r() * 0.5,
    });
  }
  // thin haze blanket pooling over the Mimika lowland
  for (let i = 0; i < 140; i++) {
    const t = 0.6 + r() * 0.45;
    out.push({
      lon: 137.0 + gauss(r) * 0.75 - (t - 0.6) * 0.8, lat: -4.85 + gauss(r) * 0.4, h: 0.06 + r() * 0.1, size: 0.9 + r() * 1.1,
      rot: r() * Math.PI * 2, warm: 0, layer: 3, speed: 0.3,
    });
  }
  // rising columns straight above the densest fires
  for (let i = 0; i < 60; i++) {
    const c = CLUSTERS[Math.floor(r() * 2)];
    out.push({
      lon: c[0] + gauss(r) * 0.3, lat: c[1] + gauss(r) * 0.25, h: 0.05 + r() * 0.2, size: 0.22 + r() * 0.3,
      rot: r() * Math.PI * 2, warm: 1, layer: 0, speed: 0.4,
    });
  }
  return out;
};

// fire clusters [lon, lat, spread, weight] (Merauke dominant; none near Mimika)
const CLUSTERS: [number, number, number, number][] = [
  [140.25, -8.2, 0.45, 0.42], [139.45, -7.15, 0.35, 0.2], [140.3, -6.75, 0.35, 0.16], [138.75, -6.35, 0.3, 0.12], [140.8, -7.6, 0.3, 0.1],
];
const makeHotspots = () => {
  const r = prng(777);
  const pts: { lon: number; lat: number; s: number; ph: number }[] = [];
  let guard = 0;
  while (pts.length < 170 && guard++ < 5000) {
    let u = r(), k = 0;
    while (k < CLUSTERS.length - 1 && u > CLUSTERS[k][3]) { u -= CLUSTERS[k][3]; k++; }
    const c = CLUSTERS[k];
    const lon = c[0] + gauss(r) * c[2] * 1.4, lat = c[1] + gauss(r) * c[2];
    if (heightAt(lon, lat) <= 0.004 || heightAt(lon, lat) > 0.12) continue;
    pts.push({ lon, lat, s: 0.6 + r() * 0.9, ph: r() * 6.28 });
  }
  return pts;
};

const World: React.FC<{ frame: number }> = ({ frame }) => {
  const { cam } = camState(frame);
  const terrain = useMemo(() => buildTerrainGeometry(), []);
  const colorMap = useMemo(() => buildColorTexture(), []);
  const smokeTex = useMemo(() => [buildSmokeTexture(1), buildSmokeTexture(2), buildSmokeTexture(3)], []);
  const glowTex = useMemo(() => buildGlowTexture(), []);
  const plateTex = useMemo(() => buildPlateTexture(), []);
  const puffs = useMemo(() => makePuffs(), []);
  const hot = useMemo(() => makeHotspots(), []);

  const LAYERS = [
    { opacity: 0.3, tex: smokeTex[0] },
    { opacity: 0.21, tex: smokeTex[1] },
    { opacity: 0.15, tex: smokeTex[2] },
    { opacity: 0.085, tex: smokeTex[0] },
  ];

  // Instanced meshes: matrices and colours are written before the first draw (useMemo).
  const smokeMeshes = useMemo(
    () =>
      LAYERS.map((L, li) => {
        const list = puffs.filter((p) => p.layer === li);
        const geo = new THREE.PlaneGeometry(1, 1);
        const mat = new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, opacity: L.opacity, depthWrite: false, color: "#ffffff" });
        const mesh = new THREE.InstancedMesh(geo, mat, list.length);
        mesh.frustumCulled = false;
        mesh.renderOrder = 5 + li;
        const cold = new THREE.Color("#8f979b"), warm = new THREE.Color("#b08e74");
        list.forEach((p, i) => mesh.setColorAt(i, cold.clone().lerp(warm, p.warm * 0.8)));
        return { mesh, list };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [puffs, smokeTex],
  );
  const q = cam.quaternion.clone();
  const m4 = new THREE.Matrix4(), rz = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  for (const { mesh, list } of smokeMeshes) {
    list.forEach((p, i) => {
      // drift north-west along the wind, a few hundredths of a degree per frame
      const drift = frame * 0.004 * p.speed;
      const [x, z] = W(p.lon - drift * 0.7, p.lat + drift * 0.7);
      pos.set(x, heightAt(p.lon, p.lat) * 0.6 + p.h, z);
      rz.setFromAxisAngle(new THREE.Vector3(0, 0, 1), p.rot + frame * 0.002);
      sc.set(p.size, p.size, 1);
      m4.compose(pos, q.clone().multiply(rz), sc);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  const hotMeshes = useMemo(() => {
    const core = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.022, 10, 8),
      new THREE.MeshBasicMaterial({ color: "#FFC46B", toneMapped: false }),
      hot.length,
    );
    const glow = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: glowTex, color: "#FF6A1A", transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      hot.length,
    );
    core.frustumCulled = glow.frustumCulled = false;
    glow.renderOrder = 4;
    const m = new THREE.Matrix4();
    hot.forEach((p, i) => {
      const [x, z] = W(p.lon, p.lat);
      m.makeTranslation(x, heightAt(p.lon, p.lat) + 0.02, z);
      core.setMatrixAt(i, m);
    });
    return { core, glow };
  }, [hot, glowTex]);
  hot.forEach((p, i) => {
    const [x, z] = W(p.lon, p.lat);
    const flick = 0.85 + 0.15 * Math.sin(frame * 0.45 + p.ph);
    const s = 0.2 * p.s * flick;
    m4.compose(new THREE.Vector3(x, heightAt(p.lon, p.lat) + 0.03, z), q, new THREE.Vector3(s, s, 1));
    hotMeshes.glow.setMatrixAt(i, m4);
  });
  hotMeshes.glow.instanceMatrix.needsUpdate = true;

  const [tx, tz] = W(...TIMIKA);
  const th = heightAt(...TIMIKA);
  const [mx, mz] = W(...MERAUKE);
  const mh = heightAt(...MERAUKE);
  const pulse = 1 + 0.08 * Math.sin(frame * 0.2);
  const [px, pz] = W(136.3, -8.45);

  return (
    <>
      <fog attach="fog" args={[BG, 17, 34]} />
      <hemisphereLight args={["#9fc3e6", "#1a1410", 0.8]} />
      <directionalLight position={[-7, 6.5, -4]} intensity={2.9} color="#FFE7C4" />
      <directionalLight position={[5, 3, 6]} intensity={0.35} color="#90CAF9" />

      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial map={colorMap} roughness={0.93} metalness={0} />
      </mesh>

      {/* in-world AUDIRA plate stamped on the Arafura Sea */}
      <mesh position={[px, 0.01, pz]} rotation={[-Math.PI / 2, 0, -0.04]}>
        <planeGeometry args={[2.4, 0.6]} />
        <meshBasicMaterial map={plateTex} transparent toneMapped={false} />
      </mesh>

      {/* Merauke source ring */}
      <mesh position={[mx, mh + 0.03, mz]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[pulse, pulse, 1]}>
        <ringGeometry args={[0.32, 0.36, 4]} />
        <meshBasicMaterial color="#FF8A3D" toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* Timika pin: ground reticle, pillar, head */}
      <group position={[tx, th, tz]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[pulse, pulse, 1]}>
          <ringGeometry args={[0.24, 0.28, 4]} />
          <meshBasicMaterial color={P.readingAmber} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.07, 24]} />
          <meshBasicMaterial color={P.vectorWhite} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.7, 8]} />
          <meshBasicMaterial color={P.readingAmber} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.055, 20, 16]} />
          <meshPhysicalMaterial color={P.readingAmber} emissive={P.readingAmber} emissiveIntensity={0.6} roughness={0.25} clearcoat={0.8} />
        </mesh>
      </group>

      <primitive object={hotMeshes.core} />
      <primitive object={hotMeshes.glow} />
      {smokeMeshes.map(({ mesh }, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </>
  );
};

// ---------- HTML overlay ----------
const MONO = "Consolas, 'JetBrains Mono', 'Courier New', monospace";
const Tag: React.FC<{ x: number; y: number; title: string; sub: string; color: string; align?: "left" | "right" }> = ({ x, y, title, sub, color, align = "left" }) => (
  <div
    style={{
      position: "absolute",
      left: align === "left" ? x : undefined,
      right: align === "right" ? WIDTH - x : undefined,
      top: y,
      background: "rgba(7,11,14,0.82)",
      borderLeft: align === "left" ? `5px solid ${color}` : undefined,
      borderRight: align === "right" ? `5px solid ${color}` : undefined,
      padding: "10px 16px 10px 16px",
      textAlign: align,
    }}
  >
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, letterSpacing: 2, color: "#F2F5F6", lineHeight: 1 }}>{title}</div>
    <div style={{ fontFamily: MONO, fontSize: 21, color, marginTop: 8, letterSpacing: 1, whiteSpace: "pre-line", lineHeight: 1.35 }}>{sub}</div>
  </div>
);

const Overlay: React.FC<{ frame: number }> = ({ frame }) => {
  const { cam } = camState(frame);
  const tk = project(cam, ...TIMIKA, 0.72);
  const mk = project(cam, ...MERAUKE, 0.05);
  // wind arrow along the plume's western flank
  const arrowPts = [0.12, 0.3, 0.48, 0.66, 0.8].map((t) => {
    const p = pathAt(t);
    return project(cam, p.lon - p.nx * 0.95, p.lat - p.ny * 0.95, 0.05);
  });
  const d = arrowPts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const a = arrowPts[arrowPts.length - 1], b = arrowPts[arrowPts.length - 2];
  const ang = Math.atan2(a.y - b.y, a.x - b.x);
  const head = [ang + 2.6, ang - 2.6].map((t) => `${(a.x + Math.cos(t) * 26).toFixed(1)},${(a.y + Math.sin(t) * 26).toFixed(1)}`);
  const mid = arrowPts[2];
  const dash = -frame * 1.5;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* readability scrims */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 700, background: "linear-gradient(180deg, rgba(7,11,14,0.96) 0%, rgba(7,11,14,0.84) 52%, rgba(7,11,14,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(0deg, rgba(7,11,14,0.97) 0%, rgba(7,11,14,0.85) 50%, rgba(7,11,14,0) 100%)" }} />

      {/* kicker + tag */}
      <div style={{ position: "absolute", left: 64, top: 192, fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: P.readingAmber }}>
        ● AUDIRA · ASAP &amp; ISPA
      </div>
      <div style={{ position: "absolute", right: 56, top: 184, border: `2px solid ${P.readingAmber}`, background: "rgba(10,12,16,0.86)", padding: "8px 16px", fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: "#fff" }}>
        AUDIRA OSINT // 01
      </div>

      {/* headline */}
      <div style={{ position: "absolute", left: 60, top: 262, fontFamily: FONT, fontWeight: 600, color: "#F2F5F6", lineHeight: 0.98, letterSpacing: -2 }}>
        <div style={{ fontSize: 168 }}>
          81 <span style={{ color: P.readingAmber }}>RIBU</span>
        </div>
        <div style={{ fontSize: 132 }}>KASUS ISPA</div>
        <div style={{ fontSize: 50, fontWeight: 500, letterSpacing: 0, marginTop: 22, color: "#D9DEE2" }}>Asapnya kiriman dari mana?</div>
      </div>

      {/* wind / smoke direction */}
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={P.readingAmber} strokeWidth={5} strokeDasharray="18 12" strokeDashoffset={dash} strokeLinecap="round" />
        <polyline points={`${head[0]} ${a.x.toFixed(1)},${a.y.toFixed(1)} ${head[1]}`} fill="none" stroke={P.readingAmber} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {/* leader lines */}
        <line x1={tk.x} y1={tk.y} x2={tk.x + 40} y2={tk.y - 40} stroke={P.readingAmber} strokeWidth={3} />
        <line x1={mk.x} y1={mk.y} x2={Math.min(1020, mk.x + 70)} y2={mk.y + 18} stroke="#FF8A3D" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: mid.x - 330, top: mid.y - 22, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: P.readingAmber, background: "rgba(7,11,14,0.7)", padding: "4px 10px" }}>
        ARAH ASAP · ANGIN TIMUR–TENGGARA
      </div>

      <Tag x={tk.x + 40} y={tk.y - 40} title="MIMIKA" sub={"TIMIKA · 4°32′S 136°53′E\nTITIK PANAS: MINIM"} color={P.readingAmber} />
      <Tag x={Math.min(1020, mk.x + 70)} y={mk.y + 12} title="MERAUKE" sub="8°29′S 140°24′E · SUMBER API" color="#FF8A3D" align="right" />

      {/* data panel (above the 380 px bottom UI zone) */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1352, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ background: "rgba(10,12,16,0.86)", borderLeft: `6px solid ${P.readingAmber}`, padding: "16px 24px" }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 76, color: "#fff", lineHeight: 1 }}>81.355</div>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 26, color: "#E6EAEE", marginTop: 8 }}>kasus ISPA kumulatif · 1 Jan–30 Okt 2026</div>
          <div style={{ fontFamily: MONO, fontSize: 19, color: "rgba(242,245,246,0.62)", marginTop: 8, letterSpacing: 1 }}>DINKES MIMIKA · BUKAN HANYA AKIBAT ASAP</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, color: "#E6EAEE", lineHeight: 1.7, textAlign: "right" }}>
          <div><span style={{ color: "#FF8A3D" }}>●</span> TITIK PANAS</div>
          <div><span style={{ color: "#A7AEB1" }}>●</span> ASAP</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ep01Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={WIDTH} height={HEIGHT} camera={{ fov: FOV, near: 0.1, far: 80, position: [0, 10, 8] }}>
        <Rig frame={frame} />
        <World frame={frame} />
        <Finish frame={frame} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} />
      </ThreeCanvas>
      <Overlay frame={frame} />
    </AbsoluteFill>
  );
};
