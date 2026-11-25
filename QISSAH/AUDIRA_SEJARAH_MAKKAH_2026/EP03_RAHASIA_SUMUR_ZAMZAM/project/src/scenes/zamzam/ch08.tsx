// c08 "Tidak dijual ke luar negeri, diminum jutaan orang": a globe with export arcs that stop (red
// bars) before London, Kuala Lumpur and Jakarta; the single travel container; an X-ray scanner with
// a suitcase and the bottle silhouette; the 5 L ration in the hajj dormitory; then a field of cups
// that keeps growing for the 1447 H hajj figures.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { at, chapter, prog, smooth, easeOut } from "./time.ts";
import { Plinth, TextPlate, type V3 } from "./kit.tsx";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";

const C = "c08_ekspor";
export const T8 = {
  start: chapter(C).start,
  ban: at(C, "melarang Zamzam diekspor"),
  travel: at(C, "Jemaah haji dan umrah"),
  label: at(C, "Jadi air berlabel"),
  malaysia: at(C, "Di Malaysia"),
  indo: at(C, "Untuk jemaah Indonesia"),
  xray: at(C, "mesin sinar-X"),
  opened: at(C, "koper bisa dibongkar"),
  ration: at(C, "Sebagai gantinya"),
  free: at(C, "Sementara di Makkah"),
  hajj: at(C, "Di musim haji"),
  cups: at(C, "Itu lebih dari"),
  end: chapter(C).end,
};

const GLOBE_C: V3 = [0, 10, 0];
const GLOBE_R = 9;
/** Globe turned so Makkah faces the camera (+z). */
const MAKKAH = { lat: 21.4, lon: 39.8 };
export function onGlobe(lat: number, lon: number, lift = 0): V3 {
  const la = (lat * Math.PI) / 180, lo = ((lon - MAKKAH.lon) * Math.PI) / 180;
  const tilt = (MAKKAH.lat * Math.PI) / 180;
  const x = Math.cos(la) * Math.sin(lo), y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo);
  // tilt about x so Makkah's latitude comes to the equator of the view
  const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
  const r = GLOBE_R + lift;
  return [GLOBE_C[0] + x * r, GLOBE_C[1] + y * r, GLOBE_C[2] + z * r];
}
export const PLACES = [
  { id: "lon", name: "London", lat: 51.5, lon: -0.1 },
  { id: "kl", name: "Kuala Lumpur", lat: 3.1, lon: 101.7 },
  { id: "jkt", name: "Jakarta", lat: -6.2, lon: 106.8 },
  { id: "ist", name: "Istanbul", lat: 41.0, lon: 29.0 },
];

function arcPts(lat: number, lon: number, n = 40): V3[] {
  const a = new THREE.Vector3(...onGlobe(MAKKAH.lat, MAKKAH.lon)).sub(new THREE.Vector3(...GLOBE_C));
  const b = new THREE.Vector3(...onGlobe(lat, lon)).sub(new THREE.Vector3(...GLOBE_C));
  return Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1);
    const p = a.clone().lerp(b, u).normalize().multiplyScalar(GLOBE_R * (1 + 0.22 * Math.sin(u * Math.PI)));
    return [p.x + GLOBE_C[0], p.y + GLOBE_C[1], p.z + GLOBE_C[2]] as V3;
  });
}

export const CUPS_ORIGIN: V3 = [-44, 0, -14];

const Cups: React.FC<{ n: number }> = ({ n }) => {
  const N = 2400;
  const mesh = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.22, 0.17, 0.45, 12);
    const mat = new THREE.MeshPhysicalMaterial({ color: "#8fd8f0", roughness: 0.15, clearcoat: 0.8, emissive: "#1d7ea3", emissiveIntensity: 0.15 });
    const im = new THREE.InstancedMesh(g, mat, N);
    im.castShadow = true;
    im.frustumCulled = false;
    return im;
  }, []);
  useLayoutEffect(() => {
    const m4 = new THREE.Matrix4();
    // spiral outwards from the centre
    for (let i = 0; i < N; i++) {
      const a = i * 2.39996, r = Math.sqrt(i) * 0.62;
      const s = i < n ? 1 : 0;
      m4.makeScale(s, s, s).setPosition(CUPS_ORIGIN[0] + Math.cos(a) * r, 0.23, CUPS_ORIGIN[2] + Math.sin(a) * r * 0.8);
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [mesh, n]);
  return <primitive object={mesh} />;
};

export const Export: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(
    () => ({
      ocean: new THREE.MeshPhysicalMaterial({ color: "#7fb4c6", roughness: 0.45, clearcoat: 0.4 }),
      grid: new THREE.MeshBasicMaterial({ color: "#e8f6fb", wireframe: true, transparent: true, opacity: 0.55 }),
      arc: new THREE.MeshStandardMaterial({ color: "#39c6f2", emissive: "#39c6f2", emissiveIntensity: 1.2 }),
      stop: new THREE.MeshStandardMaterial({ color: "#e2483d", emissive: "#b8261b", emissiveIntensity: 0.8 }),
      dot: new THREE.MeshStandardMaterial({ color: "#ef7a43", emissive: "#b8481c", emissiveIntensity: 0.6 }),
      place: new THREE.MeshStandardMaterial({ color: "#1d2326" }),
      stand: new THREE.MeshPhysicalMaterial({ color: "#c9b48a", metalness: 0.8, roughness: 0.3 }),
      scanner: new THREE.MeshPhysicalMaterial({ color: "#e9ecee", roughness: 0.35, clearcoat: 0.4 }),
      belt: new THREE.MeshStandardMaterial({ color: "#2b2f33", roughness: 0.8 }),
      case: new THREE.MeshPhysicalMaterial({ color: "#2f6f8f", roughness: 0.45, clearcoat: 0.5 }),
      bottle: new THREE.MeshPhysicalMaterial({ color: "#d9f0fa", roughness: 0.1, transparent: true, opacity: 0.85 }),
      jug: new THREE.MeshPhysicalMaterial({ color: "#e7f6ff", roughness: 0.12, transparent: true, opacity: 0.85 }),
      table: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#b89a74" }),
    }),
    [],
  );
  const xrayTex = useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const c = document.createElement("canvas");
    c.width = 512; c.height = 320;
    const g = c.getContext("2d")!;
    g.fillStyle = "#081a2a"; g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "#3aa0ff"; g.lineWidth = 8; g.strokeRect(70, 70, 372, 190);
    g.fillStyle = "rgba(58,160,255,0.25)"; g.fillRect(70, 70, 372, 190);
    g.fillStyle = "#ff9a3c";
    g.beginPath(); g.roundRect(300, 110, 70, 130, 18); g.fill();
    g.fillRect(320, 92, 30, 22);
    g.fillStyle = "#7fd0ff"; g.fillRect(120, 120, 120, 40); g.fillRect(120, 180, 90, 50);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const ban = smooth(prog(t, T8.ban, T8.ban + 2.5));
  const stops = smooth(prog(t, T8.ban + 2.0, T8.ban + 3.5));
  const travel = smooth(prog(t, T8.travel, T8.travel + 1.2));
  const kl = smooth(prog(t, T8.malaysia, T8.malaysia + 1));
  const caseX = 30 + 14 * smooth(prog(t, T8.indo + 0.5, T8.xray + 0.8)) + 6 * smooth(prog(t, T8.opened - 1, T8.opened + 0.3));
  const lid = smooth(prog(t, T8.opened, T8.opened + 1.2));
  const screen = smooth(prog(t, T8.xray - 0.2, T8.xray + 0.8));
  const ration = smooth(prog(t, T8.ration, T8.ration + 1.4));
  const cupsN = Math.floor(2400 * easeOut(prog(t, T8.free + 0.5, T8.cups + 3)));
  const spin = (t - T8.start) * 0.02;

  return (
    <group>
      <Plinth w={160} d={64} h={3.5} top="#ddd8cd" side="#8f8a80" seed={61} front={16} />
      {/* globe */}
      <mesh position={[0, 0.6, -0.5]} material={m.stand} castShadow>
        <cylinderGeometry args={[2.2, 2.8, 1.2, 32]} />
      </mesh>
      <mesh position={[0, 2.0, -0.5]} material={m.stand}>
        <cylinderGeometry args={[0.15, 0.15, 2.4, 8]} />
      </mesh>
      <group>
        <mesh position={GLOBE_C} material={m.ocean} castShadow receiveShadow>
          <sphereGeometry args={[GLOBE_R, 64, 40]} />
        </mesh>
        <mesh position={GLOBE_C} material={m.grid} rotation={[0, spin, 0]} layers={FX_LAYER}>
          <sphereGeometry args={[GLOBE_R + 0.03, 24, 12]} />
        </mesh>
        <mesh position={onGlobe(MAKKAH.lat, MAKKAH.lon, 0.1)} material={m.dot}>
          <sphereGeometry args={[0.45, 16, 12]} />
        </mesh>
        {PLACES.map((pl) => {
          const pts = arcPts(pl.lat, pl.lon);
          const reach = Math.floor(pts.length * 0.62 * ban);
          const big = pl.id === "kl" ? 1 + kl * 0.6 : 1;
          return (
            <group key={pl.id}>
              <mesh position={onGlobe(pl.lat, pl.lon, 0.05)} material={m.place}>
                <sphereGeometry args={[0.22, 12, 10]} />
              </mesh>
              {pts.slice(0, reach).map((p, i) =>
                i % 2 ? null : (
                  <mesh key={i} position={p} material={m.arc}>
                    <sphereGeometry args={[0.13, 8, 6]} />
                  </mesh>
                ),
              )}
              {stops > 0.01 && reach > 2 ? (
                <mesh position={pts[reach - 1]} material={m.stop} scale={stops * big}>
                  <boxGeometry args={[1.2, 0.26, 0.26]} />
                </mesh>
              ) : null}
            </group>
          );
        })}
      </group>

      {/* the travel container a pilgrim may carry */}
      <group position={[-15, 0, -1]} scale={travel}>
        <mesh position={[0, 0.5, 0]} material={m.stand}>
          <cylinderGeometry args={[1.2, 1.4, 1.0, 24]} />
        </mesh>
        <mesh position={[0, 2.0, 0]} material={m.jug} castShadow>
          <RoundedBoxGeo args={[1.2, 2.0, 0.9]} radius={0.2} />
        </mesh>
      </group>

      {/* X-ray scanner with conveyor */}
      <group position={[44, 0, -2]}>
        <mesh position={[0, 0.8, 0]} material={m.belt}>
          <boxGeometry args={[22, 0.4, 2.6]} />
        </mesh>
        <mesh position={[0, 2.6, 0]} material={m.scanner} castShadow receiveShadow>
          <RoundedBoxGeo args={[6, 4.2, 3.8]} radius={0.3} />
        </mesh>
        <mesh position={[0, 2.0, 1.92]} material={m.belt}>
          <planeGeometry args={[4.2, 1.8]} />
        </mesh>
        {/* monitor */}
        <mesh position={[-5.5, 4.4, 0.4]} rotation={[0, 0.4, 0]} scale={[1, Math.max(0.01, screen), 1]}>
          <boxGeometry args={[4.2, 2.6, 0.15]} />
          <meshStandardMaterial attach="material-4" map={xrayTex} emissive="#ffffff" emissiveMap={xrayTex} emissiveIntensity={0.9} />
          <meshStandardMaterial attach="material-0" color="#30343a" />
          <meshStandardMaterial attach="material-1" color="#30343a" />
          <meshStandardMaterial attach="material-2" color="#30343a" />
          <meshStandardMaterial attach="material-3" color="#30343a" />
          <meshStandardMaterial attach="material-5" color="#30343a" />
        </mesh>
        <mesh position={[-5.5, 2.2, 0.2]} material={m.stand}>
          <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        </mesh>
      </group>
      {/* suitcase on the belt; its lid opens after the scan */}
      <group position={[caseX, 1.0, -2]}>
        <mesh position={[0, 0.5, 0]} material={m.case} castShadow>
          <RoundedBoxGeo args={[2.6, 1.0, 1.7]} radius={0.15} />
        </mesh>
        <group position={[0, 1.0, -0.85]} rotation={[-lid * 1.6, 0, 0]}>
          <mesh position={[0, 0.12, 0.85]} material={m.case}>
            <RoundedBoxGeo args={[2.6, 0.25, 1.7]} radius={0.1} />
          </mesh>
        </group>
        <mesh position={[0.6, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} material={m.bottle} scale={lid}>
          <capsuleGeometry args={[0.22, 0.6, 6, 12]} />
        </mesh>
      </group>

      {/* the 5 L ration on a dormitory table */}
      <group position={[62, 0, -2]} scale={ration * 1.7}>
        <mesh position={[0, 1.0, 0]} material={m.table} castShadow receiveShadow>
          <RoundedBoxGeo args={[5, 0.3, 3]} radius={0.08} />
        </mesh>
        {[-2.2, 2.2].map((x) => [-1.2, 1.2].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.5, z]} material={m.table}>
            <boxGeometry args={[0.2, 1.0, 0.2]} />
          </mesh>
        )))}
        <mesh position={[0, 1.95, 0]} material={m.jug} castShadow>
          <RoundedBoxGeo args={[1.3, 1.6, 1.0]} radius={0.2} />
        </mesh>
        <TextPlate text="5 L" p={[0, 1.95, 0.52]} w={0.8} h={0.5} bg="#0b3d2e" fg="#ffffff" font={200} />
      </group>

      {/* field of cups (Masjidil Haram, hajj 1447 H) */}
      <Cups n={cupsN} />
    </group>
  );
};
