// Station 2 (x = 24): the piled cloths before Islam (c03). A cutaway of cloth layers like rock
// strata, tribal thread bundles for the shared cost, a lunar ring of 12 knots for 'Asyura, then the
// incense, a small flame on the top layer and the striped Yemeni cloth that replaces it.
// No figures: the Prophet's ﷺ presence is only a warm light on the cloth.
import React, { useMemo } from "react";
import * as THREE from "three";
import { PAL, silkMat, Spool, stripeTex, Tag, weaveTex } from "./kit.tsx";
import { CH, clamp, ease, lerp, pop, SX, W } from "./tl.ts";

const C = "c03_jahiliah";
const LAYERS = ["#6B4A2E", "#A88B5E", "#7A2A1E", "#C9B28A", "#3B4A6E", "#8A6A3E", "#5A3A28", "#B5763A", "#2F3F2E", "#8C6A54", "#6E1430", "#D2BE96", "#4A3A2E", "#9C7346"];

export const Station2: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(2);
  const linen = useMemo(() => weaveTex(PAL.linen, 81, [14, 18], 8), []);
  const mats = useMemo(() => LAYERS.map((c, i) => silkMat(c, weaveTex(c, 90 + i, [2, 1], 6))), []);
  const stripe = useMemo(() => silkMat("#ffffff", stripeTex()), []);
  const tPile = W(C, "ditumpuk");
  const tLapis = W(C, "lapis", 1);
  const tOff = W(C, "dicopot");
  // layers arrive: 4 at "ditumpuk", the rest up to "berat"
  const tBerat = W(C, "berat");
  const arrive = (i: number) => (i < 4 ? tPile - 0.6 + i * 0.35 : lerp(tLapis - 0.6, tBerat, (i - 4) / (LAYERS.length - 5)));
  const removed = (i: number) => (i >= 8 ? ease(t, tOff + (i - 8) * 0.12, 1.0) : 0);
  const tFire = W(C, "terbakar");
  const tNew = W(C, "yaman");
  const topBurn = ease(t, tNew - 1.2, 1.0); // the burnt top layer lifts away as the new cloth comes
  const bundles = ["#7A2A1E", "#C99A4A", "#2F3F6E", "#3E7D4F", "#8A6A3E", "#E5D6B4"];
  const tUrun = W(C, "urunan");
  const tGilir = W(C, "setahun");
  const flip = ease(t, W(C, "setahun", 1), 0.5);
  const moonOn = ease(t, W(C, "asyura"), 0.6);
  const glow = ease(t, W(C, "fathu"), 1.2) * (1 - ease(t, W(C, "uniknya"), 1.5));
  const nH = 0.026;
  const smokeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#B8B2AA", roughness: 1, transparent: true, opacity: 0.45 }), []);
  const bundleMats = useMemo(() => ["#7A2A1E", "#C99A4A", "#2F3F6E", "#3E7D4F", "#8A6A3E", "#E5D6B4"].map((c, i) => silkMat(c, weaveTex(c, 120 + i, [1, 4], 4))), []);

  return (
    <group position={[O, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[12.02, 16]} />
        <meshStandardMaterial map={linen.map} bumpMap={linen.bump} bumpScale={0.6} roughness={0.9} />
      </mesh>
      {/* the strata block */}
      <group position={[0, 0.005, 0]} rotation={[0, -0.3, 0]}>
        {LAYERS.map((_, i) => {
          const k = ease(t, arrive(i), 0.5);
          const r = removed(i);
          if (k <= 0.001 || r >= 0.999) return null;
          const y = 0.013 + i * nH + (1 - k) * 0.6 + r * 1.4;
          const burnt = i === 7 ? topBurn : 0;
          return (
            <mesh key={i} position={[Math.sin(i * 1.9) * 0.02 + r * 0.6, y + burnt * 1.2, Math.cos(i * 1.3) * 0.015]} rotation={[0, Math.sin(i * 2.3) * 0.05, r * 0.4]} castShadow receiveShadow>
              <boxGeometry args={[1.3, 0.022, 0.8]} />
              <primitive object={mats[i]} attach="material" />
            </mesh>
          );
        })}
        {/* the striped Yemeni cloth that replaces the burnt one */}
        {t > tNew - 0.9 && (
          <mesh position={[0, 0.013 + 7 * nH + (1 - ease(t, tNew - 0.9, 0.9)) * 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.34, 0.024, 0.84]} />
            <primitive object={stripe} attach="material" />
          </mesh>
        )}
        {/* small flame on the top layer's corner, briefly */}
        {t > tFire - 0.2 && t < tNew && (
          <group position={[0.58, 0.013 + 8 * nH, 0.34]} scale={pop(t, tFire - 0.2, 0.4) * (1 - ease(t, tNew - 1.6, 0.6))}>
            <mesh position={[0, 0.06 + Math.sin(t * 13) * 0.004, 0]}>
              <coneGeometry args={[0.03, 0.12, 12]} />
              <meshStandardMaterial color="#FF9A3C" emissive="#FF7A1C" emissiveIntensity={2.2} />
            </mesh>
            <pointLight intensity={1.2} distance={1.2} color="#FF9A50" position={[0, 0.1, 0]} />
          </group>
        )}
      </group>
      {/* brass censer with rising smoke threads */}
      <group position={[-1.05, 0, 0.6]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.06, 0.14, 20]} />
          <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.07, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.3} />
        </mesh>
        {t > W(C, "uniknya") &&
          [0, 1, 2].flatMap((k) => {
            const a = clamp((t - W(C, "uniknya") - k * 0.4) / 6);
            const fade = 1 - ease(t, tNew + 1, 1.5);
            return Array.from({ length: 16 }, (_, j) => {
              const u = j / 15;
              return (
                <mesh key={`${k}-${j}`} position={[Math.sin(u * 7 + t * 1.3 + k) * 0.05 * u + u * 0.25, 0.22 + u * 0.9 * a, Math.cos(u * 5 + k) * 0.04 * u]} scale={(0.012 + u * 0.02) * fade}>
                  <sphereGeometry args={[1, 10, 8]} />
                  <primitive object={smokeMat} attach="material" />
                </mesh>
              );
            });
          })}
      </group>
      {/* thread bundles of the tribes: shared cost, then alternating years */}
      {bundles.map((c, i) => {
        const k = ease(t, tUrun - 0.4 + i * 0.18, 0.7);
        const a = (i / bundles.length) * Math.PI - Math.PI * 0.1;
        const x = lerp(Math.cos(a) * 2.0, Math.cos(a) * 1.05, k);
        const z = lerp(1.6, 0.95, k);
        return (
          <mesh key={i} position={[x, 0.05, z]} rotation={[0, a, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.16, 16]} />
            <primitive object={bundleMats[i]} attach="material" />
          </mesh>
        );
      })}
      {t > tGilir - 0.5 && (
        <group position={[1.35, 0.06, 0.85]} rotation={[Math.PI * flip + 0.35, 0, 0]} scale={pop(t, tGilir - 0.5, 0.5)}>
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.02, 32]} />
            <meshStandardMaterial attach="material-0" color="#6E5A44" roughness={0.6} />
            <meshStandardMaterial attach="material-1" color={PAL.gold} metalness={1} roughness={0.25} />
            <meshStandardMaterial attach="material-2" color="#3E7D4F" roughness={0.6} />
          </mesh>
        </group>
      )}
      {/* lunar ring: 12 months as knots, one lit for 'Asyura */}
      <group position={[1.7, 0.02, -0.6]}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const on = i === 0 ? moonOn : 0;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.42, 0.03 + on * 0.03, Math.sin(a) * 0.42]} scale={1 + on * 0.6} castShadow>
              <sphereGeometry args={[0.035, 14, 10]} />
              <meshStandardMaterial color={on > 0.5 ? PAL.gold : "#CFC2A8"} metalness={on > 0.5 ? 1 : 0} roughness={on > 0.5 ? 0.25 : 0.9} />
            </mesh>
          );
        })}
      </group>
      {/* the warm light of Fathu Makkah on the cloth (no figure) */}
      <pointLight position={[0, 1.4, 0.4]} intensity={4 * glow} distance={4} decay={1.4} color="#FFE6B8" />
      <Spool pos={[-2.4, 0, -0.8]} color="#7A2A1E" />
      <Spool pos={[2.6, 0, 1.1]} color="#2F3F6E" rotY={0.4} />
      {/* callouts */}
      <Tag pos={[-1.25, 0.05, 1.15]} lines={["masa jahiliah", "kiswah ditumpuk"]} t={t} at={W(C, "jahiliah")} until={W(C, "qushay")} w={1.1} />
      <Tag pos={[-1.25, 0.05, 1.15]} lines={["Qushay bin Kilab", "Quraisy urunan"]} t={t} at={W(C, "qushay")} until={W(C, "belakangan")} w={1.1} />
      <Tag pos={[-1.25, 0.05, 1.15]} lines={["Abu Rabi'ah: “Al-'Adl”", "setahun sendiri, setahun Quraisy"]} t={t} at={W(C, "giliran")} until={W(C, "jejaknya")} w={1.35} accent />
      <Tag pos={[1.7, 0.05, 0.05]} lines={["'Asyura", "HR. Al-Bukhari 1592"]} t={t} at={W(C, "asyura")} until={W(C, "fathu")} w={1.0} />
      <Tag pos={[0, 0.05, 1.2]} lines={["Fathu Makkah", "8 H · 630 M"]} t={t} at={W(C, "fathu")} until={W(C, "uniknya")} w={1.1} accent />
      <Tag pos={[1.6, 0.05, 0.05]} lines={["HR. Al-Bukhari 4280"]} t={t} at={W(C, "menyebutnya")} until={W(C, "uniknya")} w={1.0} />
      <Tag pos={[-1.25, 0.05, 1.15]} lines={["riwayat Sa'id bin Al-Musayyib", "terbakar oleh dupa"]} t={t} at={W(C, "riwayat")} until={W(C, "penggantinya")} w={1.35} />
      <Tag pos={[0.9, 0.05, 1.2]} lines={["riwayat Al-Waqidi", "kain dari Yaman"]} t={t} at={W(C, "alwaqidi")} until={CH(C).end + 3} w={1.15} accent />
    </group>
  );
};
