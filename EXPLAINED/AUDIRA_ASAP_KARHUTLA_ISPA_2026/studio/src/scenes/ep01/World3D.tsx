// EP01 film 3D world: the cover's southern-New-Guinea tile plus the film props (holding plane,
// Timika town + school, the cumulative-cases board, the "10 besar penyakit" tower).
// Everything is driven by the time `t` (seconds) from the Audio Master Clock.
import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SATELLITEBRIEFING_PALETTE as P } from "../../kits/satellitebriefing/lib/palette.ts";
import {
  W, heightAt, buildTerrainGeometry, buildColorTexture, buildSmokeTexture, buildGlowTexture, buildPlateTexture,
} from "./terrain.ts";
import { prng } from "../../core/materials/textures.ts";
import { TIMIKA, MERAUKE, makePuffs, makeHotspots, makeTown, SCHOOL } from "./world.ts";
import {
  T, SEC, FOV, camAt, seg, win, smokeState, hotState, CHART, chartX, chartY, D26, D25, SMOKE_WEEK, TOWER,
} from "./clock.ts";

export const BG = "#070B0E";
export const AMBER = P.readingAmber;
export const FIRE = "#FF8A3D";
export const GHOST = "#9FB6CC";

// ---------------------------------------------------------------- camera rig
export const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, target } = camAt(t);
    const c = camera as THREE.PerspectiveCamera;
    c.fov = FOV;
    c.near = 0.02;
    c.far = 80;
    c.position.copy(pos);
    c.lookAt(target);
    c.updateProjectionMatrix();
    c.updateMatrixWorld(true);
  }, [camera, t]);
  return null;
};

// ---------------------------------------------------------------- chart geometry helpers
/** Flat ribbon through a polyline in the board plane; 6 vertices per sample segment (drawRange reveal). */
const sampleLine = (data: [number, number][], step = 0.03) => {
  const pts: [number, number, number][] = []; // [x, y, week]
  for (let i = 0; i < data.length - 1; i++) {
    const [w0, v0] = data[i], [w1, v1] = data[i + 1];
    const x0 = chartX(w0), y0 = chartY(v0), x1 = chartX(w1), y1 = chartY(v1);
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, w0 + ((w1 - w0) * k) / n]);
  }
  const [wl, vl] = data[data.length - 1];
  pts.push([chartX(wl), chartY(vl), wl]);
  return pts;
};
const ribbonGeo = (pts: [number, number, number][], width: number, dashed = false) => {
  const pos: number[] = [];
  const weeks: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    if (dashed && Math.floor(i / 2) % 2 === 1) continue;
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const l = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = (-(y1 - y0) / l) * width * 0.5, ny = ((x1 - x0) / l) * width * 0.5;
    pos.push(x0 - nx, y0 - ny, 0, x1 - nx, y1 - ny, 0, x1 + nx, y1 + ny, 0, x0 - nx, y0 - ny, 0, x1 + nx, y1 + ny, 0, x0 + nx, y0 + ny, 0);
    weeks.push(pts[i + 1][2]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return { g, weeks };
};
const areaGeo = (pts: [number, number, number][]) => {
  const pos: number[] = [];
  const weeks: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    pos.push(x0, 0, 0, x1, 0, 0, x1, y1, 0, x0, 0, 0, x1, y1, 0, x0, y0, 0);
    weeks.push(pts[i + 1][2]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return { g, weeks };
};
const countUpTo = (weeks: number[], w: number) => {
  let n = 0;
  while (n < weeks.length && weeks[n] <= w + 1e-6) n++;
  return n;
};

/** Reveal of each curve, in weeks. */
export const reveal26 = (t: number) => 35 * seg(t, T.agu1 - 0.1, T.agu1 + 1.4) + 8.3 * seg(t, T.okt - 0.1, T.okt + 1.8);
export const reveal25 = (t: number) => 35 * seg(t, T.tahunLalu - 0.1, T.tahunLalu + 1.6);
export const chartOpacity = (t: number) => win(t, T.angka + 0.5, SEC.PENJELASAN[0] + 0.9, 0.8, 0.9);

const Board: React.FC<{ t: number }> = ({ t }) => {
  const op = chartOpacity(t);
  const l26 = useMemo(() => ribbonGeo(sampleLine(D26), 0.036), []);
  const a26 = useMemo(() => areaGeo(sampleLine(D26)), []);
  const l25 = useMemo(() => ribbonGeo(sampleLine(D25, 0.025), 0.026, true), []);
  const r26 = reveal26(t), r25 = reveal25(t);
  l26.g.setDrawRange(0, countUpTo(l26.weeks, r26) * 6);
  a26.g.setDrawRange(0, countUpTo(a26.weeks, r26) * 6);
  l25.g.setDrawRange(0, countUpTo(l25.weeks, r25) * 6);
  if (op <= 0.001) return null;
  const band = seg(t, T.asapBelum - 0.5, T.asapBelum + 0.4);
  const xs = chartX(SMOKE_WEEK), xe = chartX(CHART.weeks);
  const tipW = Math.max(0.0001, r26);
  const tipV = tipW <= 35 ? (63856 * tipW) / 35 : 63856 + ((81355 - 63856) * (tipW - 35)) / 8.3;
  const s = 0.94 + 0.06 * op;
  return (
    <group position={[CHART.x, CHART.y, CHART.z]} scale={[s, s, s]}>
      {/* glass backing */}
      <mesh position={[0, CHART.h / 2 + 0.05, -0.03]} renderOrder={20}>
        <planeGeometry args={[CHART.w + 0.5, CHART.h + 0.55]} />
        <meshBasicMaterial color="#081016" transparent opacity={0.8 * op} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, chartY(i * 20000), -0.02]} renderOrder={21}>
          <planeGeometry args={[CHART.w, i === 0 ? 0.014 : 0.006]} />
          <meshBasicMaterial color={i === 0 ? "#cfd8dc" : P.claimBlue} transparent opacity={(i === 0 ? 0.8 : 0.55) * op} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {/* frame corners */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
        <group key={i} position={[(sx * (CHART.w + 0.5)) / 2, CHART.h / 2 + 0.05 + (sy * (CHART.h + 0.55)) / 2, -0.01]}>
          <mesh position={[-sx * 0.08, 0, 0]} renderOrder={22}>
            <planeGeometry args={[0.16, 0.014]} />
            <meshBasicMaterial color={AMBER} transparent opacity={op} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, -sy * 0.08, 0]} renderOrder={22}>
            <planeGeometry args={[0.014, 0.16]} />
            <meshBasicMaterial color={AMBER} transparent opacity={op} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* smoke period band (late September onward) */}
      <mesh position={[(xs + xe) / 2, CHART.h / 2, -0.015]} renderOrder={23}>
        <planeGeometry args={[xe - xs, CHART.h]} />
        <meshBasicMaterial color="#8f979b" transparent opacity={0.26 * band * op} depthWrite={false} />
      </mesh>
      <mesh position={[xs, CHART.h / 2, -0.012]} renderOrder={23}>
        <planeGeometry args={[0.008, CHART.h]} />
        <meshBasicMaterial color="#d7dde0" transparent opacity={0.7 * band * op} depthWrite={false} />
      </mesh>
      <mesh geometry={a26.g} renderOrder={24}>
        <meshBasicMaterial color={AMBER} transparent opacity={0.16 * op} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh geometry={l25.g} renderOrder={25}>
        <meshBasicMaterial color={GHOST} transparent opacity={0.95 * op} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh geometry={l26.g} renderOrder={26}>
        <meshBasicMaterial color={AMBER} transparent opacity={op} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* data points */}
      {D26.slice(1).map(([w, v], i) => (
        <mesh key={i} position={[chartX(w), chartY(v), 0.01]} scale={r26 >= w - 0.05 ? 1 : 0.0001} renderOrder={27}>
          <circleGeometry args={[0.05, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={op} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[chartX(35), chartY(61758), 0.01]} scale={r25 >= 34.9 ? 1 : 0.0001} renderOrder={27}>
        <circleGeometry args={[0.042, 24]} />
        <meshBasicMaterial color={GHOST} transparent opacity={op} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* playhead while the 2026 curve draws */}
      <mesh position={[chartX(tipW), chartY(tipV) / 2, 0.005]} renderOrder={26}>
        <planeGeometry args={[0.008, Math.max(0.001, chartY(tipV))]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.55 * op * (r26 > 0.2 && r26 < 43.2 ? 1 : 0)} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- "10 besar" tower
export const SLAB_DY = 0.115;
export const ISPA_SLAB = 7;
const Tower: React.FC<{ t: number }> = ({ t }) => {
  const grain = useSurfaceGrain(31, 0.18, 2);
  const vis = win(t, T.kata - 1.2, SEC.PAYOFF[0] + 1.6, 0.8, 1.2);
  if (vis <= 0.001) return null;
  const glow = seg(t, T.sepuluh - 0.2, T.sepuluh + 0.5);
  const smoky = seg(t, T.asapD, T.memperberat + 0.6);
  return (
    <group position={[TOWER.x, TOWER.y, TOWER.z]} rotation={[0, t * 0.05, 0]}>
      {/* plinth on the ground + spine */}
      <mesh position={[0, -0.02, 0]} scale={[vis, 1, vis]}>
        <cylinderGeometry args={[0.5, 0.56, 0.04, 48]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#1b252b" roughnessMap={grain} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.25, 8]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.5 * vis} toneMapped={false} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const appear = seg(t, T.ispa - 0.2 + i * 0.1, T.ispa + 0.35 + i * 0.1) * vis;
        const isIspa = i === ISPA_SLAB;
        const w = isIspa ? 0.84 + 0.08 * glow : 0.7 - Math.abs(i - 4.5) * 0.012;
        const x = isIspa ? 0.06 * glow : 0;
        return (
          <mesh key={i} position={[x, 0.08 + i * SLAB_DY, 0]} scale={[Math.max(0.001, appear), Math.max(0.001, appear), Math.max(0.001, appear)]}>
            <RoundedBoxGeo args={[w, 0.07, 0.42]} radius={0.018} />
            <meshPhysicalMaterial
              {...POLISH.toyPlastic}
              color={isIspa ? AMBER : i % 2 ? "#56636a" : "#4A5358"}
              emissive={isIspa ? "#ff9d2a" : "#000000"}
              emissiveIntensity={isIspa ? 0.25 + 0.35 * glow + 0.2 * smoky : 0}
              roughnessMap={grain}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- holding plane (illustration)
const Plane: React.FC<{ t: number }> = ({ t }) => {
  const vis = win(t, T.pesawat - 1.2, SEC.KONTEKS[1] + 0.6, 0.6, 0.6);
  if (vis <= 0.001) return null;
  const [tx, tz] = W(TIMIKA[0] + 0.02, TIMIKA[1] + 0.01);
  const a = t * 1.25;
  const R = 0.3;
  const y = 0.34;
  const x = tx + Math.cos(a) * R, z = tz + Math.sin(a) * R;
  const heading = -a - Math.PI; // tangent of the circle
  return (
    <>
      <mesh position={[tx, y, tz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R - 0.004, R + 0.004, 96]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.55 * vis} toneMapped={false} depthWrite={false} />
      </mesh>
      <group position={[x, y, z]} rotation={[0, heading, 0]} scale={1.7 * vis}>
        <group rotation={[0.45, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.008, 0.07, 6, 12]} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#eef1f3" />
          </mesh>
          <mesh position={[0.004, 0, 0]}>
            <RoundedBoxGeo args={[0.02, 0.003, 0.09]} radius={0.0012} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#dfe4e8" />
          </mesh>
          <mesh position={[-0.038, 0.008, 0]}>
            <RoundedBoxGeo args={[0.012, 0.016, 0.003]} radius={0.001} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={AMBER} />
          </mesh>
          <mesh position={[-0.038, 0.002, 0]}>
            <RoundedBoxGeo args={[0.01, 0.002, 0.032]} radius={0.0008} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#dfe4e8" />
          </mesh>
          <mesh position={[0.004, 0, 0.046]}>
            <sphereGeometry args={[0.003, 8, 6]} />
            <meshBasicMaterial color="#5dff8a" toneMapped={false} />
          </mesh>
          <mesh position={[0.004, 0, -0.046]}>
            <sphereGeometry args={[0.003, 8, 6]} />
            <meshBasicMaterial color="#ff4040" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </>
  );
};
export const planeScreenPos = (t: number) => {
  const [tx, tz] = W(TIMIKA[0] + 0.02, TIMIKA[1] + 0.01);
  const a = t * 1.25;
  return [tx + Math.cos(a) * 0.3, 0.34, tz + Math.sin(a) * 0.3] as [number, number, number];
};

// ---------------------------------------------------------------- Timika town + school (illustration)
const Town: React.FC<{ t: number }> = ({ t }) => {
  const houses = useMemo(() => makeTown(), []);
  const meshes = useMemo(() => {
    const body = new THREE.InstancedMesh(
      new RoundedBoxGeometry(1, 1, 1, 2, 0.12),
      new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#ffffff" }),
      houses.length,
    );
    const roof = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.75, 0.6, 4),
      new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#ffffff" }),
      houses.length,
    );
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const walls = ["#cfc8b8", "#b9b2a2", "#d9d3c6", "#a9b0a6"].map((c) => new THREE.Color(c));
    const roofs = ["#7a4b35", "#5b6a72", "#8a5a3c", "#6e7a5e"].map((c) => new THREE.Color(c));
    houses.forEach((h, i) => {
      const lon = h.x + 138.4, lat = -h.z - 6.4;
      const gy = Math.max(0, heightAt(lon, lat));
      q.setFromEuler(e.set(0, h.rot, 0));
      m.compose(new THREE.Vector3(h.x, gy + h.h / 2, h.z), q, new THREE.Vector3(h.w, h.h, h.d));
      body.setMatrixAt(i, m);
      body.setColorAt(i, walls[Math.floor(h.tone * 4)]);
      q.setFromEuler(e.set(0, h.rot + Math.PI / 4, 0));
      m.compose(new THREE.Vector3(h.x, gy + h.h + 0.005, h.z), q, new THREE.Vector3(h.w, 0.016, h.d));
      roof.setMatrixAt(i, m);
      roof.setColorAt(i, roofs[Math.floor(h.tone * 7) % 4]);
    });
    return { body, roof };
  }, [houses]);
  const lon = SCHOOL.x + 138.4, lat = -SCHOOL.z - 6.4;
  const gy = Math.max(0, heightAt(lon, lat));
  const closed = seg(t, T.sekolah, T.sekolah + 0.6);
  const [rx, rz] = W(TIMIKA[0] + 0.07, TIMIKA[1] + 0.05);
  const ry = Math.max(0, heightAt(TIMIKA[0] + 0.07, TIMIKA[1] + 0.05));
  return (
    <>
      <primitive object={meshes.body} />
      <primitive object={meshes.roof} />
      {/* runway (Mozes Kilangin) */}
      <mesh position={[rx, ry + 0.002, rz]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[0.16, 0.012]} />
        <meshStandardMaterial color="#2a2f33" roughness={0.9} />
      </mesh>
      <group position={[SCHOOL.x, gy, SCHOOL.z]} rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.11, 0.07]} />
          <meshStandardMaterial color="#7d7458" roughness={1} />
        </mesh>
        <mesh position={[0, 0.0125, -0.012]}>
          <RoundedBoxGeo args={[0.075, 0.025, 0.026]} radius={0.002} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#e6dfcf" />
        </mesh>
        <mesh position={[0, 0.0275, -0.012]}>
          <RoundedBoxGeo args={[0.08, 0.005, 0.031]} radius={0.0015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#9b3b2c" />
        </mesh>
        {/* windows go dark when classes move home */}
        {[-0.026, -0.009, 0.009, 0.026].map((x, i) => (
          <mesh key={i} position={[x, 0.013, 0.0012]}>
            <planeGeometry args={[0.009, 0.008]} />
            <meshBasicMaterial color={new THREE.Color("#ffd27a").lerp(new THREE.Color("#1a1e22"), closed)} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0.045, 0.022, 0.022]}>
          <cylinderGeometry args={[0.0008, 0.0008, 0.044, 6]} />
          <meshStandardMaterial color="#d0d4d6" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.0525, 0.04, 0.022]}>
          <planeGeometry args={[0.014, 0.009]} />
          <meshBasicMaterial color="#d8343a" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
};

// ---------------------------------------------------------------- the world
export const World3D: React.FC<{ t: number }> = ({ t }) => {
  const { cam, pos: camPos, d } = camAt(t);
  const terrain = useMemo(() => buildTerrainGeometry(), []);
  const colorMap = useMemo(() => buildColorTexture(), []);
  const smokeTex = useMemo(() => [buildSmokeTexture(1), buildSmokeTexture(2), buildSmokeTexture(3)], []);
  const glowTex = useMemo(() => buildGlowTexture(), []);
  const plateTex = useMemo(() => buildPlateTexture(), []);
  const puffs = useMemo(() => makePuffs(), []);
  const hot = useMemo(() => makeHotspots(), []);

  const smokeMeshes = useMemo(() => {
    const LAYERS = [
      { opacity: 0.3, tex: smokeTex[0] },
      { opacity: 0.21, tex: smokeTex[1] },
      { opacity: 0.15, tex: smokeTex[2] },
      { opacity: 0.085, tex: smokeTex[0] },
    ];
    return LAYERS.map((L, li) => {
      const list = puffs.filter((p) => p.layer === li);
      const mat = new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, opacity: L.opacity, depthWrite: false, color: "#ffffff" });
      const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, list.length);
      mesh.frustumCulled = false;
      mesh.renderOrder = 5 + li;
      const cold = new THREE.Color("#8f979b"), warm = new THREE.Color("#b08e74");
      list.forEach((p, i) => mesh.setColorAt(i, cold.clone().lerp(warm, p.warm * 0.8)));
      const m = new THREE.Matrix4();
      list.forEach((p, i) => {
        const [x, z] = W(p.lon, p.lat);
        m.makeTranslation(x, p.h, z);
        mesh.setMatrixAt(i, m);
      });
      return { mesh, list };
    });
  }, [puffs, smokeTex]);

  const towerPuffs = useMemo(() => {
    const r = prng(5150);
    const list = Array.from({ length: 34 }, () => ({ a: r() * Math.PI * 2, r: 0.35 + r() * 0.45, y: 0.05 + r() * 1.25, size: 0.35 + r() * 0.45, delay: r() * 0.6 }));
    const mat = new THREE.MeshBasicMaterial({ map: smokeTex[1], transparent: true, opacity: 0.34, depthWrite: false, color: "#a39a90" });
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, list.length);
    mesh.frustumCulled = false;
    mesh.renderOrder = 9;
    const m = new THREE.Matrix4().makeScale(0.0001, 0.0001, 1);
    list.forEach((_, i) => mesh.setMatrixAt(i, m));
    return { mesh, list };
  }, [smokeTex]);
  const { amt, flow, src } = smokeState(t);
  const q = cam.quaternion.clone();
  const m4 = new THREE.Matrix4(), rz = new THREE.Quaternion(), p3 = new THREE.Vector3(), sc = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (const { mesh, list } of smokeMeshes) {
    list.forEach((p, i) => {
      const drift = t * 0.12 * p.speed;
      const [x, z] = W(p.lon - drift * 0.7, p.lat + drift * 0.7);
      p3.set(x, heightAt(p.lon, p.lat) * 0.6 + p.h, z);
      const flowVis = Math.max(0, Math.min(1, (flow - p.t) / 0.1 + 1));
      let vis = flowVis * (p.t < 0.3 ? src : amt);
      // thin out puffs that would sit right in front of the lens
      const near = p3.distanceTo(camPos);
      if (near < 1.7) vis *= Math.max(0, (near - 0.35) / 1.35);
      rz.setFromAxisAngle(zAxis, p.rot + t * 0.06);
      const s = Math.max(0.0001, p.size * Math.sqrt(Math.max(0, vis)));
      sc.set(s, s, 1);
      m4.compose(p3, q.clone().multiply(rz), sc);
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
      glow.setMatrixAt(i, m);
    });
    return { core, glow };
  }, [hot, glowTex]);
  const hs = hotState(t);
  // August flashback: no fires yet on the map
  const aug = 1 - 0.97 * win(t, T.agu2 - 0.2, T.dan + 0.6, 0.7, 0.8);
  const hv = hs * aug;
  hot.forEach((p, i) => {
    const [x, z] = W(p.lon, p.lat);
    const on = Math.max(0, Math.min(1, (hv - p.rank) * 8 + 1));
    const flick = 0.85 + 0.15 * Math.sin(t * 13.5 + p.ph);
    const s = Math.max(0.0001, 0.2 * p.s * flick * on * (hs > 1 ? 1 + (hs - 1) * 0.5 : 1));
    m4.compose(new THREE.Vector3(x, heightAt(p.lon, p.lat) + 0.03, z), q, new THREE.Vector3(s, s, 1));
    hotMeshes.glow.setMatrixAt(i, m4);
    const c = Math.max(0.0001, on);
    m4.compose(new THREE.Vector3(x, heightAt(p.lon, p.lat) + 0.02, z), new THREE.Quaternion(), new THREE.Vector3(c, c, c));
    hotMeshes.core.setMatrixAt(i, m4);
  });
  hotMeshes.glow.instanceMatrix.needsUpdate = true;
  hotMeshes.core.instanceMatrix.needsUpdate = true;

  const [tx, tz] = W(...TIMIKA);
  const th = heightAt(...TIMIKA);
  const [mx, mz] = W(...MERAUKE);
  const mh = heightAt(...MERAUKE);
  const pulse = 1 + 0.08 * Math.sin(t * 6);
  const srcPulse = 1 + 0.25 * win(t, T.meminta, T.awalNov, 0.4, 0.6) * (0.5 + 0.5 * Math.sin(t * 8));
  const [px, pz] = W(136.3, -8.45);
  const pin = Math.max(0.12, Math.min(1, (d - 1.4) / 5));

  // thin smoke wrapping the "10 besar" tower from "Asap datang belakangan"
  const towerVis = win(t, T.kata - 1.2, SEC.PAYOFF[0] + 1.6, 0.8, 1.2);
  const roll = seg(t, T.asapD - 0.3, T.memperberat + 1.2);
  towerPuffs.list.forEach((p, i) => {
    const arrive = Math.max(0, Math.min(1, roll * 1.6 - p.delay));
    const ang = p.a + t * 0.12;
    const r = p.r + (1 - arrive) * 1.4;
    p3.set(TOWER.x + Math.cos(ang) * r, TOWER.y + p.y + Math.sin(t * 0.7 + p.a) * 0.03, TOWER.z + Math.sin(ang) * r * 0.8);
    rz.setFromAxisAngle(zAxis, p.a * 3 + t * 0.08);
    const s = Math.max(0.0001, p.size * arrive * towerVis);
    m4.compose(p3, q.clone().multiply(rz), sc.set(s, s, 1));
    towerPuffs.mesh.setMatrixAt(i, m4);
  });
  towerPuffs.mesh.instanceMatrix.needsUpdate = true;

  return (
    <>
      <primitive object={towerPuffs.mesh} />
      <fog attach="fog" args={[BG, 17, 34]} />
      <hemisphereLight args={["#9fc3e6", "#1a1410", 0.8]} />
      <directionalLight position={[-7, 6.5, -4]} intensity={2.9} color="#FFE7C4" />
      <directionalLight position={[5, 3, 6]} intensity={0.35} color="#90CAF9" />

      <mesh geometry={terrain}>
        <meshStandardMaterial map={colorMap} roughness={0.93} metalness={0} />
      </mesh>

      {/* in-world AUDIRA plate stamped on the Arafura Sea */}
      <mesh position={[px, 0.01, pz]} rotation={[-Math.PI / 2, 0, -0.04]}>
        <planeGeometry args={[2.4, 0.6]} />
        <meshBasicMaterial map={plateTex} transparent toneMapped={false} />
      </mesh>

      <mesh position={[mx, mh + 0.03, mz]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[pulse * srcPulse, pulse * srcPulse, 1]}>
        <ringGeometry args={[0.32, 0.36, 4]} />
        <meshBasicMaterial color={FIRE} toneMapped={false} transparent opacity={0.9} />
      </mesh>

      <group position={[tx, th, tz]} scale={[pin, pin, pin]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[pulse, pulse, 1]}>
          <ringGeometry args={[0.24, 0.28, 4]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.07, 24]} />
          <meshBasicMaterial color={P.vectorWhite} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.7, 8]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.055, 20, 16]} />
          <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.6} roughness={0.25} clearcoat={0.8} />
        </mesh>
      </group>

      <Town t={t} />
      <Plane t={t} />
      <Tower t={t} />
      <Board t={t} />

      <primitive object={hotMeshes.core} />
      <primitive object={hotMeshes.glow} />
      {smokeMeshes.map(({ mesh }, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </>
  );
};
