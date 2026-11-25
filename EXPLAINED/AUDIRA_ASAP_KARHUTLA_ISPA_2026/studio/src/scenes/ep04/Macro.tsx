// EP04 film — macro scale: one human hair (~60 µm, cuticle scales) above a drifting cluster of PM2.5
// smoke particles (2,5 µm) at true relative size (hair diameter = 24 particle diameters).
import React, { useMemo } from "react";
import * as THREE from "three";
import { makeGlow } from "../../kits/anatomix/lib/materials";
import { prng } from "../../kits/anatomix/core/motion";
import { HAIR } from "./camera";

const cuticle = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 1024, 256);
  const r = prng(616);
  // overlapping scale edges (like roof tiles) running along the hair
  for (let row = 0; row < 9; row++) {
    let x = -40 + r() * 30;
    while (x < 1064) {
      const w = 70 + r() * 50;
      const y = row * 30 + (r() - 0.5) * 8;
      const grd = g.createLinearGradient(x, 0, x + w, 0);
      grd.addColorStop(0, "rgba(40,40,40,0.0)");
      grd.addColorStop(0.85, "rgba(200,200,200,0.55)");
      grd.addColorStop(1, "rgba(20,20,20,0.9)");
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + w * 0.9, y - 6, x + w * 1.05, y + 14, x + w, y + 34);
      g.lineTo(x, y + 34);
      g.closePath();
      g.fill();
      x += w * (0.75 + r() * 0.2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 3);
  return tex;
};

const N = 46;

export const HairMacro: React.FC<{ t: number; fade: number }> = ({ t, fade }) => {
  const tex = useMemo(() => cuticle(), []);
  const glow = useMemo(() => makeGlow(), []);
  const parts = useMemo(() => {
    const r = prng(2525);
    return Array.from({ length: N }, (_, i) => ({
      p: i === 0 ? [0, 0, 0] : [(r() - 0.5) * 1.9, (r() - 0.5) * 0.75, (r() - 0.5) * 0.9],
      s: i === 0 ? 1 : 0.55 + r() * 0.6,
      ph: r() * 6.28,
      hot: r() < 0.55,
      rot: r() * 6,
    }));
  }, []);
  const partGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    const r = prng(77);
    const bumps = Array.from({ length: 6 }, () => new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize());
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      let k = 1;
      bumps.forEach((b) => (k += 0.12 * Math.max(0, v.dot(b) - 0.55)));
      v.multiplyScalar(k);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  if (fade < 0.005) return null;
  const R = HAIR.r;
  const P = 0.0375; // particle radius (diameter 0.075 = hair diameter / 24)
  const c = HAIR.cluster;
  return (
    <group>
      <group position={[0, HAIR.y, 0]} rotation={[0.18, 0, HAIR.tilt]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[R, R * 0.97, 16, 96, 1, false]} />
          <meshPhysicalMaterial color="#5A3F2C" map={tex} bumpMap={tex} bumpScale={1.4} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.6} sheenColor={new THREE.Color("#C9A27C")} transparent={fade < 1} opacity={fade} />
        </mesh>
      </group>
      {parts.map((q, i) => {
        const x = c[0] + q.p[0] + (i ? Math.sin(t * 0.35 + q.ph) * 0.03 : 0);
        const y = c[1] + q.p[1] + (i ? Math.sin(t * 0.5 + q.ph * 1.3) * 0.025 : 0);
        const z = c[2] + q.p[2];
        const s = P * q.s;
        return (
          <group key={i} position={[x, y, z]}>
            <mesh geometry={partGeo} scale={s} rotation={[q.rot, q.rot * 0.7, 0]}>
              <meshStandardMaterial color={i === 0 ? "#FFB27A" : q.hot ? "#D9874A" : "#8E8178"} emissive={i === 0 ? "#FF7A2A" : q.hot ? "#7A3A12" : "#2a2420"} emissiveIntensity={i === 0 ? 1.1 : 0.6} roughness={0.8} transparent={fade < 1} opacity={fade} />
            </mesh>
            <sprite scale={[s * (i === 0 ? 6 : 3.5), s * (i === 0 ? 6 : 3.5), 1]}>
              <spriteMaterial map={glow} color={i === 0 ? "#FF9A4D" : "#B8693A"} transparent opacity={(i === 0 ? 0.7 : 0.35) * fade} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
};

/** World position of the hero particle (for HUD rulers). */
export const HERO: [number, number, number] = [HAIR.cluster[0], HAIR.cluster[1], HAIR.cluster[2]];
