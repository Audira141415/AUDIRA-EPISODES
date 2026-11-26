// s4 sand tray: nine broken swords drop and stick in the sand one by one ("sembilan pedang patah"),
// then one intact Yemeni sword lands upright in the middle ("tinggal satu pedang Yaman").
// Geometry is the verified GLB prop/arming-sword-ab8738, normalised so the tip points down (-y).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { useGLB } from "./Models.tsx";
import { CUE } from "./cues.ts";
import { SAND } from "./geo.ts";
import { clamp01, easeInCubic, lin } from "./timing.ts";

const SAND_Y = 0.14;
const LEN = 1.0;
type Part = { geo: THREE.BufferGeometry; mat: THREE.Material };

const hash = (x: number) => {
  const s = Math.sin(x * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** Sword parts in a common frame: tip at y=0, hilt at y=LEN, blade on the y axis. */
const useSwordParts = (): Part[] | null => {
  const gltf = useGLB("prop/arming-sword-ab8738");
  return useMemo(() => {
    if (!gltf) return null;
    gltf.scene.updateMatrixWorld(true);
    const parts: Part[] = [];
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      parts.push({ geo: g, mat: Array.isArray(m.material) ? m.material[0] : m.material });
    });
    const box = new THREE.Box3();
    parts.forEach((p) => { p.geo.computeBoundingBox(); box.union(p.geo.boundingBox!); });
    // the guard is where the sword is widest; the tip is the far end from it
    let wMax = -1, gy = 0;
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
    for (const p of parts) {
      const a = p.geo.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const w = Math.max(Math.abs(a.getX(i) - cx), Math.abs(a.getZ(i) - cz));
        if (w > wMax) { wMax = w; gy = a.getY(i); }
      }
    }
    const tipUp = Math.abs(box.max.y - gy) > Math.abs(box.min.y - gy);
    const k = LEN / (box.max.y - box.min.y);
    const mtx = new THREE.Matrix4();
    if (tipUp) mtx.makeRotationZ(Math.PI);
    const tmp = new THREE.Box3();
    parts.forEach((p) => {
      p.geo.translate(-cx, 0, -cz);
      p.geo.applyMatrix4(mtx);
    });
    parts.forEach((p) => { p.geo.computeBoundingBox(); tmp.union(p.geo.boundingBox!); });
    parts.forEach((p) => {
      p.geo.translate(0, -tmp.min.y, 0);
      p.geo.scale(k, k, k);
      p.geo.computeVertexNormals();
    });
    return parts;
  }, [gltf]);
};

/** Broken copy: every vertex below the cut is clamped to a jagged edge at the cut. */
const breakParts = (parts: Part[], cut: number, seed: number): Part[] =>
  parts.map((p) => {
    const g = p.geo.clone();
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const y = a.getY(i);
      if (y < cut) {
        const x = a.getX(i), z = a.getZ(i);
        const jag = (hash(x * 53 + z * 31 + seed) - 0.5) * 0.06 + Math.sin(x * 140 + seed) * 0.012;
        a.setY(i, cut + jag);
      }
    }
    a.needsUpdate = true;
    g.computeVertexNormals();
    g.translate(0, -cut, 0);
    return { geo: g, mat: p.mat };
  });

const Sword: React.FC<{ parts: Part[]; position: [number, number, number]; rot: [number, number, number]; mat?: THREE.Material }> = ({ parts, position, rot, mat }) => (
  <group position={position} rotation={rot}>
    {parts.map((p, i) => (
      <mesh key={i} geometry={p.geo} material={mat ?? p.mat} castShadow receiveShadow />
    ))}
  </group>
);

const SandTray: React.FC = () => {
  const sand = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.42, 2.02, 60, 50);
    g.rotateX(-Math.PI / 2);
    const a = g.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i), z = a.getZ(i);
      a.setY(i, Math.sin(x * 9 + z * 2.5) * 0.008 + Math.sin(z * 13 - x * 4) * 0.005 + (hash(x * 9.1 + z * 7.7) - 0.5) * 0.004);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const wood = "#5a3a22";
  return (
    <group>
      <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[2.6, 0.06, 2.2]} radius={0.02} />
        <meshStandardMaterial color={wood} roughness={0.55} />
      </mesh>
      {[[0, 1.06, 2.6, 0.08], [0, -1.06, 2.6, 0.08], [1.26, 0, 0.08, 2.2], [-1.26, 0, 0.08, 2.2]].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.09, z]} castShadow receiveShadow>
          <RoundedBoxGeo args={[w, 0.18, d]} radius={0.015} />
          <meshStandardMaterial color={wood} roughness={0.5} />
        </mesh>
      ))}
      <mesh geometry={sand} position={[0, SAND_Y, 0]} receiveShadow>
        <meshStandardMaterial color="#cdb084" roughness={0.97} />
      </mesh>
    </group>
  );
};

export const Swords: React.FC<{ t: number }> = ({ t }) => {
  const parts = useSwordParts();
  const broken = useMemo(() => (parts ? Array.from({ length: 9 }, (_, i) => breakParts(parts, 0.2 + hash(i + 3) * 0.28, i * 7.3)) : null), [parts]);
  const shiny = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d9dde2", metalness: 0.9, roughness: 0.3, emissive: "#ffcf7a", emissiveIntensity: 0.06, clearcoat: 0.4 }), []);
  const yaman = lin(CUE.satu, CUE.satu + 0.45, t);
  return (
    <group position={[SAND[0], 0, SAND[1]]}>
      <SandTray />
      {broken
        ? broken.map((bp, i) => {
            const t0 = CUE.sembilan + i * 0.19;
            const k = easeInCubic(lin(t0, t0 + 0.24, t));
            if (t < t0) return null;
            const a = (i / 9) * Math.PI * 2 + 0.3;
            const r = 0.72;
            const sink = 0.07;
            const y = SAND_Y - sink + (1 - k) * 1.3;
            const settle = clamp01((t - t0 - 0.24) / 0.3);
            const wob = Math.sin(settle * Math.PI * 3) * (1 - settle) * 0.05 * (k >= 1 ? 1 : 0);
            return (
              <Sword key={i} parts={bp} position={[Math.cos(a) * r, y, Math.sin(a) * r]}
                rot={[Math.sin(a) * 0.13 + wob, hash(i * 5.1) * Math.PI * 2, -Math.cos(a) * 0.13]} />
            );
          })
        : null}
      {parts && t >= CUE.satu ? (
        <group>
          <Sword parts={parts} mat={shiny} position={[0, SAND_Y - 0.1 + (1 - easeInCubic(yaman)) * 1.4, 0]} rot={[0, 0.6, 0]} />
          <pointLight position={[0.25, 0.9, 0.35]} color="#ffe0a8" intensity={1.6 * yaman} distance={2.5} decay={2} />
        </group>
      ) : null}
    </group>
  );
};
