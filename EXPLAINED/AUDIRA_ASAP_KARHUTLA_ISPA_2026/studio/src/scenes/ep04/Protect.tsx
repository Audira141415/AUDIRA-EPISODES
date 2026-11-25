// EP04 film — PAYOFF holograms: N95 vs cloth mask under a PM2.5 stream (x-ray translucent so the
// particles that get through stay visible), and the clean room for a balita (closed window, air
// purifier, AC on recirculation, an empty crib; no child depicted). Smoke waits outside the glass.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { makeGlow } from "../../kits/anatomix/lib/materials";
import { prng } from "../../kits/anatomix/core/motion";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { CUT, T, clamp, easeOut, seg } from "./clock";

const AMBER = "#FF9A4D";

// ---------------------------------------------------------------- masks
export const MASKS = { n95: [-0.42, 0.08, 0] as [number, number, number], cloth: [0.55, 0.05, 0] as [number, number, number] };
const NP = 70;

const pleats = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#9DB7D6";
  g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    const grd = g.createLinearGradient(0, y, 0, y + 64);
    grd.addColorStop(0, "rgba(255,255,255,0.25)");
    grd.addColorStop(0.7, "rgba(0,0,0,0.0)");
    grd.addColorStop(1, "rgba(0,0,0,0.3)");
    g.fillStyle = grd;
    g.fillRect(0, y, 256, 64);
  }
  // woven threads
  g.strokeStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 256; i += 4) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const Masks: React.FC<{ t: number; fade: number; dim: number }> = ({ t, fade, dim }) => {
  const glow = useMemo(() => makeGlow(), []);
  const grain = useSurfaceGrain(23, 0.25, 4);
  const cloth = useMemo(() => pleats(), []);
  const n95Geo = useMemo(() => new THREE.SphereGeometry(1, 64, 40, 0, Math.PI), []);
  const seamV = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 21 }, (_, i) => { const a = 0.1 + (i / 20) * (Math.PI - 0.2); return new THREE.Vector3(0, 0.3 * Math.cos(a), 0.165 * Math.sin(a) + 0.004); })), 40, 0.007, 6, false), []);
  const seamH = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 21 }, (_, i) => { const b = 0.1 + (i / 20) * (Math.PI - 0.2); return new THREE.Vector3(0.42 * Math.cos(b), -0.05, 0.162 * Math.sin(b) + 0.004); })), 40, 0.005, 6, false), []);
  const straps = useMemo(() => [0.13, -0.11].map((y) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.42, y * 0.7, 0.0), new THREE.Vector3(-0.47, y, -0.14), new THREE.Vector3(-0.3, y + 0.03, -0.36), new THREE.Vector3(0, y + 0.04, -0.42), new THREE.Vector3(0.3, y + 0.03, -0.36), new THREE.Vector3(0.47, y, -0.14), new THREE.Vector3(0.42, y * 0.7, 0.0)]), 64, 0.01, 6, false)), []);
  const clothGeo = useMemo(() => new THREE.CylinderGeometry(0.62, 0.62, 0.5, 48, 6, true, -0.62, 1.24), []);
  const flow = useMemo(() => {
    const r = prng(9595);
    return Array.from({ length: NP }, () => ({ x: (r() - 0.5) * 0.7, y: (r() - 0.5) * 0.52, u0: r(), sp: 0.28 + r() * 0.16, s: 0.012 + r() * 0.012, fine: r() < 0.7, hot: r() < 0.6 }));
  }, []);
  const partMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true }), NP * 2);
    const c = new THREE.Color();
    for (let i = 0; i < NP * 2; i++) {
      const q = flow[i % NP];
      c.set(q.hot ? "#F08A3C" : "#B3A498");
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.frustumCulled = false;
    return m;
  }, [flow]);
  useMemo(() => {
    const o = new THREE.Object3D();
    const on = seg(t, T.orang - 0.4, T.orang + 0.6);
    [MASKS.n95, MASKS.cloth].forEach((m, k) => {
      flow.forEach((q, i) => {
        const u = (q.u0 + t * q.sp) % 1;
        let z = 1.9 - u * 3.4;
        // N95 seal: everything stops on the shell (and stays a moment); cloth: fine particles pass
        const surf = 0.12 * Math.sqrt(Math.max(0, 1 - (q.x / 0.42) ** 2 - (q.y / 0.3) ** 2)) + 0.02;
        const clothSurf = 0.06;
        if (k === 0) z = Math.max(z, surf);
        else if (!q.fine) z = Math.max(z, clothSurf);
        o.position.set(m[0] + q.x * (k === 0 ? 0.9 : 1.05), m[1] + q.y, m[2] + z);
        o.scale.setScalar(q.s * on * (z < 1.7 ? 1 : (1.9 - z) / 0.2));
        o.updateMatrix();
        partMesh.setMatrixAt(k * NP + i, o.matrix);
      });
    });
    partMesh.instanceMatrix.needsUpdate = true;
    (partMesh.material as THREE.MeshBasicMaterial).opacity = fade * (1 - 0.6 * dim);
  }, [t, flow, partMesh, fade, dim]);
  if (fade < 0.005) return null;
  const vis = fade * (1 - 0.55 * dim);
  const build = easeOut(seg(t, CUT.mask, CUT.mask + 0.9));
  const sealOn = seg(t, T.n95 + 0.2, T.n95 + 0.8);
  const leak = seg(t, T.kain + 0.2, T.halus);
  return (
    <group scale={[1, Math.max(0.02, build), 1]}>
      {/* N95: cup shell + seal + straps */}
      <group position={MASKS.n95} rotation={[0.1, 2.45, 0]}>
        <mesh geometry={n95Geo} scale={[0.42, 0.3, 0.165]}>
          <meshPhysicalMaterial {...POLISH.fabric} color="#EEF1F2" roughnessMap={grain} bumpMap={grain} bumpScale={0.6} transparent opacity={0.9 * vis} side={THREE.FrontSide} />
        </mesh>
        <mesh geometry={n95Geo} scale={[0.415, 0.295, 0.158]}>
          <meshPhysicalMaterial {...POLISH.fabric} color="#AEB8BC" transparent opacity={0.95 * vis} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, 0, 0.0]} scale={[0.42, 0.3, 0.7]}>
          <torusGeometry args={[1, 0.04, 16, 96]} />
          <meshPhysicalMaterial {...POLISH.fabric} color={sealOn > 0.5 ? "#9FF5EC" : "#DDE3E5"} emissive={P.holo} emissiveIntensity={0.6 * sealOn} transparent opacity={vis} />
        </mesh>
        {/* fold seams: vertical centre ridge + horizontal fold */}
        <mesh geometry={seamV}>
          <meshPhysicalMaterial {...POLISH.fabric} color="#C3CACD" transparent opacity={vis} />
        </mesh>
        <mesh geometry={seamH}>
          <meshPhysicalMaterial {...POLISH.fabric} color="#CDD3D6" transparent opacity={vis} />
        </mesh>
        {/* metal nose clip */}
        <mesh position={[0, 0.25, 0.1]} rotation={[-0.7, 0, 0]}>
          <RoundedBoxGeo args={[0.17, 0.022, 0.018]} radius={0.007} />
          <meshPhysicalMaterial color="#B9C1C6" metalness={0.8} roughness={0.3} transparent opacity={vis} />
        </mesh>
        {/* elastic head straps */}
        {straps.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#E3B94A" transparent opacity={vis} />
          </mesh>
        ))}
        <sprite position={[0, 0, 0.1]} scale={[1.3, 1.3, 1]}>
          <spriteMaterial map={glow} color={P.holo} transparent opacity={0.25 * sealOn * vis} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      {/* cloth mask: curved pleated panel + ear loops */}
      <group position={[MASKS.cloth[0], MASKS.cloth[1], MASKS.cloth[2] - 0.56]}>
        <mesh geometry={clothGeo}>
          <meshPhysicalMaterial {...POLISH.fabric} map={cloth} transparent opacity={0.6 * vis} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.37, 0, 0.47]} rotation={[0, sd * 0.6, 0]} scale={[0.14, 0.2, 1]}>
            <torusGeometry args={[1, 0.05, 6, 32, Math.PI]} />
            <meshBasicMaterial color="#8FA9C6" transparent opacity={0.8 * vis} />
          </mesh>
        ))}
      </group>
      {/* leak glow behind the cloth mask */}
      <sprite position={[MASKS.cloth[0], MASKS.cloth[1], -0.7]} scale={[1.1, 0.9, 1]}>
        <spriteMaterial map={glow} color={AMBER} transparent opacity={0.45 * leak * vis} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <primitive object={partMesh} />
    </group>
  );
};

// ---------------------------------------------------------------- clean room
export const ROOM = {
  y0: -1.9,
  w: 2.0,
  d: 1.6,
  h: 1.15,
  window: [0.2, -1.9 + 0.62, -0.8] as [number, number, number],
  purifier: [0.68, -1.9 + 0.28, -0.42] as [number, number, number],
  ac: [-0.9, -1.9 + 0.95, -0.15] as [number, number, number],
  crib: [-0.05, -1.9, 0.25] as [number, number, number],
};

const Glass: React.FC<{ args: [number, number, number]; position: [number, number, number]; opacity: number; tint?: string }> = ({ args, position, opacity, tint = "#BFF7F0" }) => {
  const [a0, a1, a2] = args;
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(a0, a1, a2)), [a0, a1, a2]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={args} />
        <meshPhysicalMaterial color={tint} roughness={0.15} clearcoat={1} transparent opacity={0.13 * opacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={P.holoSoft} transparent opacity={0.85 * opacity} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

export const Room: React.FC<{ t: number; fade: number; warn: number }> = ({ t, fade, warn }) => {
  const glow = useMemo(() => makeGlow(), []);
  const grain = useSurfaceGrain(52, 0.2, 3);
  const smoke = useMemo(() => {
    const r = prng(808);
    return Array.from({ length: 26 }, () => ({ x: (r() - 0.5) * 3.4, y: -1.8 + r() * 1.7, z: -1.0 - r() * 1.6, s: 0.6 + r() * 1.1, o: 0.12 + r() * 0.14, hot: r() < 0.45, ph: r() * 6.28 }));
  }, []);
  const motes = useMemo(() => {
    const r = prng(1717);
    return Array.from({ length: 22 }, () => ({ a: r() * 6.28, rad: 0.25 + r() * 0.3, y: r() * 0.4, sp: 0.4 + r() * 0.3 }));
  }, []);
  if (fade < 0.005) return null;
  const build = easeOut(seg(t, CUT.room, CUT.room + 1.0));
  const { y0, w, d, h } = ROOM;
  const winOn = seg(t, T.jendela - 0.1, T.jendela + 0.5);
  const purOn = seg(t, T.penyaring - 0.1, T.penyaring + 0.5);
  const acOn = seg(t, T.ac - 0.1, T.ac + 0.5);
  const wx = ROOM.window;
  const ww = 0.72;
  const wh = 0.5;
  const fanRot = t * 9;
  return (
    <group scale={[1, Math.max(0.02, build), 1]}>
      {/* floor */}
      <mesh position={[0, y0 + 0.03, 0]}>
        <RoundedBoxGeo args={[w, 0.06, d]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#CDB596" roughnessMap={grain} roughness={0.6} transparent opacity={fade} />
      </mesh>
      {/* back wall with window opening (4 glass blocks around it) */}
      <Glass args={[(w / 2 + wx[0] - ww / 2), h, 0.05]} position={[(-w / 2 + (w / 2 + wx[0] - ww / 2) / 2), y0 + h / 2, -d / 2]} opacity={fade} />
      <Glass args={[(w / 2 - wx[0] - ww / 2), h, 0.05]} position={[(w / 2 - (w / 2 - wx[0] - ww / 2) / 2), y0 + h / 2, -d / 2]} opacity={fade} />
      <Glass args={[ww, wx[1] - wh / 2 - y0, 0.05]} position={[wx[0], (y0 + wx[1] - wh / 2) / 2, -d / 2]} opacity={fade} />
      <Glass args={[ww, y0 + h - (wx[1] + wh / 2), 0.05]} position={[wx[0], (wx[1] + wh / 2 + y0 + h) / 2, -d / 2]} opacity={fade} />
      {/* left wall */}
      <Glass args={[0.05, h, d]} position={[-w / 2, y0 + h / 2, 0]} opacity={fade} />
      {/* window: frame + closed panes */}
      <group position={wx}>
        {[
          [0, wh / 2, ww, 0.04],
          [0, -wh / 2, ww, 0.04],
          [-ww / 2, 0, 0.04, wh],
          [ww / 2, 0, 0.04, wh],
          [0, 0, 0.03, wh],
        ].map(([x, y, a, b], i) => (
          <mesh key={i} position={[x, y, 0.01]}>
            <RoundedBoxGeo args={[a + 0.02, b + 0.02, 0.07]} radius={0.01} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color="#F2F4F3" transparent opacity={fade} />
          </mesh>
        ))}
        <mesh>
          <planeGeometry args={[ww, wh]} />
          <meshPhysicalMaterial color="#9FD8E8" roughness={0.05} clearcoat={1} transparent opacity={0.3 * fade} depthWrite={false} />
        </mesh>
        <sprite position={[0, 0, 0.05]} scale={[1.2, 0.9, 1]}>
          <spriteMaterial map={glow} color={P.holo} transparent opacity={0.4 * winOn * fade} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      {/* smoke waiting outside */}
      {smoke.map((s, i) => (
        <sprite key={i} position={[s.x + Math.sin(t * 0.3 + s.ph) * 0.1, s.y + Math.sin(t * 0.2 + s.ph) * 0.05, s.z]} scale={[s.s, s.s * 0.75, 1]}>
          <spriteMaterial map={glow} color={s.hot ? "#B8692F" : "#7B6F67"} transparent opacity={s.o * fade} depthWrite={false} />
        </sprite>
      ))}
      {/* air purifier */}
      <group position={ROOM.purifier}>
        <mesh>
          <RoundedBoxGeo args={[0.3, 0.56, 0.3]} radius={0.05} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#F4F6F6" transparent opacity={fade} />
        </mesh>
        <mesh position={[0, 0.12, 0.152]} rotation={[0, 0, fanRot]}>
          <ringGeometry args={[0.04, 0.1, 6, 1]} />
          <meshBasicMaterial color={P.holo} transparent opacity={(0.4 + 0.6 * purOn) * fade} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0.152]}>
          <planeGeometry args={[0.2, 0.18]} />
          <meshBasicMaterial color="#C9D3D5" transparent opacity={fade} />
        </mesh>
        <sprite position={[0, 0.12, 0.2]} scale={[0.7, 0.7, 1]}>
          <spriteMaterial map={glow} color={P.holo} transparent opacity={0.5 * purOn * fade} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      {/* AC unit on the left wall + recirculation loop */}
      <group position={ROOM.ac} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <RoundedBoxGeo args={[0.62, 0.2, 0.16]} radius={0.04} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#F4F6F6" transparent opacity={fade} />
        </mesh>
        <mesh position={[0, -0.07, 0.081]}>
          <planeGeometry args={[0.5, 0.03]} />
          <meshBasicMaterial color={P.holo} transparent opacity={(0.3 + 0.7 * acOn) * fade} toneMapped={false} />
        </mesh>
      </group>
      <group position={[-0.35, y0 + 0.62, -0.15]} rotation={[0, 0, 0]}>
        <mesh rotation={[0, 0, 0.3]}>
          <torusGeometry args={[0.42, 0.012, 8, 96, Math.PI * 1.7 * acOn]} />
          <meshBasicMaterial color={P.holoSoft} transparent opacity={0.85 * acOn * fade} toneMapped={false} />
        </mesh>
        {[0, 1, 2].map((k) => {
          const a = 0.3 + ((t * 0.9 + k / 3) % 1) * Math.PI * 1.7;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0]} rotation={[0, 0, a]}>
              <coneGeometry args={[0.035, 0.08, 12]} />
              <meshBasicMaterial color={P.holoSoft} transparent opacity={acOn * fade} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {/* clean-air motes circulating inside */}
      {motes.map((m, i) => {
        const a = m.a + t * m.sp;
        return (
          <mesh key={i} position={[-0.1 + Math.cos(a) * m.rad * 1.6, y0 + 0.35 + m.y + Math.sin(a * 0.7) * 0.05, Math.sin(a) * m.rad]}>
            <sphereGeometry args={[0.012, 8, 6]} />
            <meshBasicMaterial color={P.holoSoft} transparent opacity={0.7 * fade * clamp(purOn + acOn)} toneMapped={false} />
          </mesh>
        );
      })}
      {/* empty crib (signals a balita without showing one) */}
      <group position={ROOM.crib}>
        <mesh position={[0, 0.26, 0]}>
          <RoundedBoxGeo args={[0.66, 0.08, 0.4]} radius={0.03} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#F6E7D9" transparent opacity={fade} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <RoundedBoxGeo args={[0.7, 0.04, 0.44]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#E7D2B8" transparent opacity={fade} />
        </mesh>
        {[-0.34, 0.34].map((x) =>
          [-0.21, 0.21].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.24, z]}>
              <RoundedBoxGeo args={[0.04, 0.48, 0.04]} radius={0.012} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color="#E7D2B8" transparent opacity={fade} />
            </mesh>
          )),
        )}
        {[-0.21, 0.21].map((z) => (
          <group key={z}>
            <mesh position={[0, 0.46, z]}>
              <RoundedBoxGeo args={[0.7, 0.035, 0.035]} radius={0.01} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color="#E7D2B8" transparent opacity={fade} />
            </mesh>
            {Array.from({ length: 7 }, (_, i) => (
              <mesh key={i} position={[-0.27 + i * 0.09, 0.36, z]}>
                <cylinderGeometry args={[0.009, 0.009, 0.18, 8]} />
                <meshPhysicalMaterial {...POLISH.toyPlastic} color="#E7D2B8" transparent opacity={fade} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {/* warning wash */}
      <sprite position={[0, y0 + 0.6, 0.2]} scale={[3.2, 2.2, 1]}>
        <spriteMaterial map={glow} color={AMBER} transparent opacity={0.28 * warn * fade * (0.75 + 0.25 * Math.sin(t * 5))} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
};
