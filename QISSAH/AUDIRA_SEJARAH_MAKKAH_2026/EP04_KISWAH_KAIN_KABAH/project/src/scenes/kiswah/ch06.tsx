// Station 5 (x = 60): 1927, when Makkah wove its own (c06). A beech workbench: the mahmal's route
// thread ends (1926, shown only as a date and a cut thread, no violence), a stitched countdown of
// ten days in Dzulhijjah, the emergency black wool cloth unrolling over canvas, a crate from India
// opening on twelve small hand looms, and the parcel from Cairo that goes back in 1962.
import React, { useMemo } from "react";
import * as THREE from "three";
import { feltTex, Mahmal, PAL, silkMat, Spool, Tag, ThreadPath, toTex, weaveTex, type V3 } from "./kit.tsx";
import { CH, clamp, ease, lerp, pop, SX, W } from "./tl.ts";

const C = "c06_1927";

const dayTex = (n: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#EDE3CF";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#8A5A2B";
  g.lineWidth = 4;
  g.setLineDash([9, 6]);
  g.strokeRect(8, 8, 112, 112);
  g.fillStyle = "#2A1A12";
  g.font = "bold 64px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 64, 68);
  return toTex(c);
};

const Loom: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => {
  if (s <= 0.001) return null;
  return (
    <group position={pos} scale={s}>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.09, 0]} castShadow>
          <boxGeometry args={[0.018, 0.18, 0.018]} />
          <meshStandardMaterial color="#8A6440" roughness={0.7} />
        </mesh>
      ))}
      {[0.02, 0.17].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.2, 0.016, 0.02]} />
          <meshStandardMaterial color="#8A6440" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.07 + i * 0.0175, 0.095, 0]}>
          <boxGeometry args={[0.003, 0.15, 0.003]} />
          <meshStandardMaterial color="#EDE3CF" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export const Station5: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(5);
  const wood = useMemo(() => weaveTex(PAL.beech, 181, [2, 6], 32), []);
  const floorM = useMemo(() => {
    const l = weaveTex("#4A3A30", 193, [14, 18], 8);
    return new THREE.MeshStandardMaterial({ map: l.map, bumpMap: l.bump, bumpScale: 0.6, roughness: 0.95 });
  }, []);
  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => dayTex(i + 1)), []);
  const wool = useMemo(() => {
    const f = feltTex(PAL.wool, 183, [4, 2]);
    return new THREE.MeshStandardMaterial({ map: f.map, bumpMap: f.bump, bumpScale: 1, roughness: 1 });
  }, []);
  const canvasM = useMemo(() => silkMat("#CDBB94", weaveTex("#CDBB94", 185, [6, 3], 6)), []);
  const red = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7A2A1E", roughness: 0.8 }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.2 }), []);
  const crate = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9C7346", roughness: 0.85 }), []);
  const parcelM = useMemo(() => silkMat("#141214", weaveTex("#141214", 187, [2, 2], 6)), []);

  const tEnd = W(C, "berakhir");
  const tDays0 = W(C, "awal");
  const tSet = W(C, "terpasang");
  const tRoll = W(C, "darurat");
  const tIndia = W(C, "india");
  const tLooms = W(C, "belas");
  const tBack = W(C, "balik");
  const tAgain = W(C, "kembali");
  const daysDone = Math.floor(clamp((t - tDays0) / (tSet - tDays0)) * 10 + 1e-6);
  const unroll = ease(t, tRoll - 0.2, 3.2);
  const lid = ease(t, tIndia - 0.2, 0.8);
  // the parcel from Cairo: arrives again at "kembali", goes back at "balik"
  const parcelX = lerp(-3.1, -1.95, ease(t, tAgain - 0.6, 1.4)) - ease(t, tBack - 0.6, 1.4) * 1.6;
  const parcelOn = t > tAgain - 0.6 && t < tBack + 1.5;
  return (
    <group position={[O, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[12.02, 16]} />
        <primitive object={floorM} attach="material" />
      </mesh>
      {/* workbench top */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 0.05, 5.0]} />
        <meshStandardMaterial map={wood.map} bumpMap={wood.bump} bumpScale={0.4} roughness={0.55} />
      </mesh>
      <group position={[0, 0.05, 0]}>
        {/* the mahmal route from the left: cut at 1926 */}
        <ThreadPath pts={[[-4.0, 0.01, -0.9], [-3.2, 0.012, -0.8], [-2.55, 0.012, -0.85]]} r={0.008} material={red} />
        {t < tEnd + 2 && <Mahmal pos={[-2.4, 0, -0.85]} scale={0.6 * (1 - ease(t, tEnd, 1.2))} rotY={0.3} />}
        {t > tEnd && (
          <mesh position={[-2.5, 0.02, -0.85]} scale={pop(t, tEnd, 0.4)} castShadow>
            <sphereGeometry args={[0.035, 12, 10]} />
            <primitive object={red} attach="material" />
          </mesh>
        )}
        {/* ten-day countdown, Dzulhijjah 1345 H */}
        {days.map((tex, i) => {
          const k = pop(t, tDays0 - 0.8 + i * 0.08, 0.4);
          const done = i < daysDone;
          const last = i === 9 && t >= tSet;
          return (
            <group key={i} position={[-1.3 + i * 0.26, 0.005, -1.15]} scale={k}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[0.22, 0.22]} />
                <meshStandardMaterial map={tex} roughness={0.9} />
              </mesh>
              {done &&
                [0.7, -0.7].map((r) => (
                  <mesh key={r} position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, r]}>
                    <boxGeometry args={[0.24, 0.016, 0.008]} />
                    <primitive object={last ? gold : red} attach="material" />
                  </mesh>
                ))}
            </group>
          );
        })}
        {/* emergency kiswah: canvas then black wool unrolling across the bench */}
        {unroll > 0.001 && (
          <group position={[-1.3, 0, 0.15]}>
            <mesh position={[(2.6 * unroll) / 2, 0.006, 0]} receiveShadow>
              <boxGeometry args={[2.6 * unroll, 0.006, 1.0]} />
              <primitive object={canvasM} attach="material" />
            </mesh>
            <mesh position={[(2.56 * unroll) / 2, 0.016, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.56 * unroll, 0.012, 0.94]} />
              <primitive object={wool} attach="material" />
            </mesh>
            <mesh position={[2.6 * unroll, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.07 * (1 - unroll * 0.6) + 0.02, 0.07 * (1 - unroll * 0.6) + 0.02, 1.0, 24]} />
              <primitive object={wool} attach="material" />
            </mesh>
          </group>
        )}
        {/* crate from India and twelve hand looms */}
        <group position={[2.35, 0, -0.35]}>
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.32, 0.65]} />
            <primitive object={crate} attach="material" />
          </mesh>
          <group position={[0, 0.32, -0.325]} rotation={[-lid * 1.9, 0, 0]}>
            <mesh position={[0, 0.01, 0.325]} castShadow>
              <boxGeometry args={[0.92, 0.03, 0.67]} />
              <primitive object={crate} attach="material" />
            </mesh>
          </group>
          <Tag pos={[0, 0.17, 0.33]} lines={["INDIA"]} t={t} at={W(C, "ajyad") - 1} w={0.5} stand={false} tilt={0} />
          {Array.from({ length: 12 }, (_, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const k = ease(t, tLooms - 0.2 + i * 0.12, 0.6);
            return <Loom key={i} pos={[-0.66 + col * 0.44 + 0.0, lerp(0.15, 0.0, k), 0.75 + row * 0.34]} s={k} />;
          })}
        </group>
        {/* the parcel from Cairo: the later return, then the 1962 send-back */}
        {parcelOn && (
          <mesh position={[parcelX, 0.08, 1.45]} castShadow>
            <boxGeometry args={[0.36, 0.16, 0.28]} />
            <primitive object={parcelM} attach="material" />
          </mesh>
        )}
        <ThreadPath pts={[[-4.0, 0.01, 1.45], [-2.6, 0.012, 1.45], [-1.6, 0.012, 1.45]]} r={0.007} material={red} grow={ease(t, tAgain - 1.0, 1.0)} />
      </group>
      <Spool pos={[3.4, 0.05, 1.4]} color={PAL.wool} />
      <Spool pos={[-3.5, 0.05, 0.2]} color="#CDBB94" rotY={0.4} />
      {/* callouts */}
      <Tag pos={[-2.35, 0.1, -0.05]} lines={["Juni 1926", "insiden mahmal"]} t={t} at={W(C, "juni")} until={W(C, "tahun", 0)} w={1.05} />
      <Tag pos={[-2.35, 0.1, -0.05]} lines={["pengiriman mahmal", "berakhir"]} t={t} at={tEnd} until={W(C, "pemerintah")} w={1.05} accent />
      <Tag pos={[0.0, 0.1, -0.55]} lines={["Dzulhijjah 1345 H", "tinggal beberapa hari"]} t={t} at={W(C, "dzulhijjah")} until={tRoll} w={1.25} accent />
      <Tag pos={[0.0, 0.1, 1.05]} lines={["kiswah darurat", "wol hitam + kanvas"]} t={t} at={tRoll + 0.4} until={tSet} w={1.2} />
      <Tag pos={[0.0, 0.1, 1.05]} lines={["10 Dzulhijjah 1345 H", "± Juni 1927"]} t={t} at={tSet} until={W(C, "ajyad")} w={1.25} accent />
      <Tag pos={[1.0, 0.1, 1.15]} lines={["Ajyad, Makkah"]} t={t} at={W(C, "ajyad")} until={tIndia} w={0.95} />
      <Tag pos={[1.0, 0.1, 1.15]} lines={["dari India", "12 alat tenun · 60 pekerja"]} t={t} at={tIndia} until={W(C, "mei")} w={1.3} />
      <Tag pos={[1.0, 0.1, 1.15]} lines={["± Mei 1928", "kiswah pertama rumah produksi"]} t={t} at={W(C, "mei")} until={W(C, "sepuluh", 1)} w={1.35} accent />
      <Tag pos={[-1.2, 0.1, 1.15]} lines={["± sepuluh tahun", "lalu kiriman Mesir kembali"]} t={t} at={W(C, "sepuluh", 1)} until={W(C, "sampai")} w={1.3} />
      <Tag pos={[-1.2, 0.1, 1.15]} lines={["1962", "kiswah dari Kairo dikirim balik"]} t={t} at={W(C, "sampai")} until={W(C, "sepenuhnya")} w={1.35} />
      <Tag pos={[-1.2, 0.1, 1.15]} lines={["sejak itu: dibuat di Makkah"]} t={t} at={W(C, "sepenuhnya")} until={CH(C).end + 3} w={1.35} accent />
    </group>
  );
};
