// Station 4 (x = 48): Egypt pays for the kiswah (c05). An embroidered map on linen: the Nile and its
// delta in blue satin, French-knot villages of the waqf lighting up, gold threads running from the
// fields to Cairo, then the caravan with the mahmal (an object, no riders) crossing to Makkah.
// Schematic map, not survey-accurate.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Camel, PAL, Tag, ThreadPath, toTex, weaveTex, type V3 } from "./kit.tsx";
import { CH, ease, lerp, pop, SX, W } from "./tl.ts";

const C = "c05_mesir";

// board-local map coordinates (x right/east, z down/south), y on the board
const CAIRO: V3 = [-1.25, 0, -0.45];
const NILE: V3[] = [
  [-0.95, 0, 2.2],
  [-1.05, 0, 1.4],
  [-1.2, 0, 0.6],
  [-1.22, 0, 0.0],
  CAIRO,
];
const BRANCH_W: V3[] = [CAIRO, [-1.55, 0, -0.9], [-1.95, 0, -1.4], [-2.15, 0, -1.75]];
const BRANCH_E: V3[] = [CAIRO, [-1.0, 0, -0.95], [-0.75, 0, -1.4], [-0.55, 0, -1.75]];
const TINNIS: V3 = [-0.5, 0, -1.62];
const VILLAGES: V3[] = [
  [-1.32, 0, -0.72],
  [-1.12, 0, -0.78],
  [-1.42, 0, -0.95],
  [-1.2, 0, -1.05],
  [-1.6, 0, -1.15],
  [-0.95, 0, -1.15],
  [-1.38, 0, -1.3],
  [-1.75, 0, -1.4],
  [-1.05, 0, -1.4],
  [-1.5, 0, -1.55],
];
const MAKKAH: V3 = [2.55, 0, 1.45];
const ROUTE: V3[] = [CAIRO, [-0.6, 0, -0.55], [0.05, 0, -0.75], [0.75, 0, -0.95], [1.15, 0, -0.75], [1.55, 0, -0.1], [2.0, 0, 0.6], [2.4, 0, 1.15], MAKKAH];

const mapTexture = () => {
  const W0 = 1400;
  const H0 = 920;
  const c = document.createElement("canvas");
  c.width = W0;
  c.height = H0;
  const g = c.getContext("2d")!;
  g.fillStyle = "#DCCDB0";
  g.fillRect(0, 0, W0, H0);
  for (let y = 0; y < H0; y += 4) {
    g.fillStyle = `rgba(0,0,0,${0.03 + ((y * 7) % 5) * 0.006})`;
    g.fillRect(0, y, W0, 1);
  }
  // woven grain over the whole board
  for (let y = 0; y < H0; y += 6)
    for (let x = (y / 6) % 2 ? 0 : 6; x < W0; x += 12) {
      g.fillStyle = "rgba(255,248,232,0.10)";
      g.fillRect(x, y, 6, 3);
      g.fillStyle = "rgba(60,40,20,0.08)";
      g.fillRect(x + 6, y + 3, 6, 3);
    }
  // stitched desert contour lines
  g.strokeStyle = "rgba(120,90,55,0.35)";
  g.lineWidth = 2;
  g.setLineDash([10, 7]);
  for (let k = 0; k < 9; k++) {
    g.beginPath();
    for (let x = 0; x <= W0; x += 20) {
      const y = 120 + k * 95 + Math.sin(x * 0.006 + k) * 26 + Math.sin(x * 0.017 + k * 2) * 9;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.setLineDash([]);
  const px = (p: V3) => [((p[0] + 3.5) / 7) * W0, ((p[2] + 2.3) / 4.6) * H0] as const;
  // Mediterranean along the top
  g.fillStyle = "#6E8FA8";
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(W0, 0);
  g.lineTo(W0, px([0, 0, -2.0])[1]);
  g.bezierCurveTo(...px([1.2, 0, -1.7]), ...px([0.0, 0, -1.55]), ...px([-0.5, 0, -1.72]));
  g.bezierCurveTo(...px([-1.2, 0, -1.95]), ...px([-2.2, 0, -1.8]), ...px([-3.5, 0, -1.65]));
  g.closePath();
  g.fill();
  // Red Sea, Gulf of Suez and Gulf of Aqaba
  g.beginPath();
  g.moveTo(...px([0.0, 0, -0.85]));
  g.lineTo(...px([0.55, 0, -0.1]));
  g.lineTo(...px([0.85, 0, -0.95]));
  g.lineTo(...px([1.0, 0, -0.9]));
  g.lineTo(...px([0.8, 0, 0.1]));
  g.lineTo(...px([2.2, 0, 2.3]));
  g.lineTo(...px([1.7, 0, 2.3]));
  g.lineTo(...px([0.5, 0, 0.3]));
  g.closePath();
  g.fill();
  // stitched coast outline
  g.strokeStyle = "#5A4630";
  g.lineWidth = 3;
  g.setLineDash([12, 8]);
  g.stroke();
  g.setLineDash([]);
  // delta fields: green felt patches
  g.fillStyle = "rgba(90,120,70,0.55)";
  g.beginPath();
  g.moveTo(...px(CAIRO));
  g.lineTo(...px([-2.3, 0, -1.72]));
  g.lineTo(...px([-0.45, 0, -1.72]));
  g.closePath();
  g.fill();
  g.fillStyle = "rgba(90,120,70,0.4)";
  for (let i = 0; i < 4; i++) {
    const a = px([-1.1 - i * 0.03, 0, 1.6 - i * 0.6]);
    g.fillRect(a[0] - 18, a[1] - 40, 36, 80);
  }
  return toTex(c, [1, 1]);
};

export const Station4: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(4);
  const map = useMemo(() => mapTexture(), []);
  const linenM = useMemo(() => {
    const l = weaveTex("#5A4A3C", 191, [14, 18], 8);
    return new THREE.MeshStandardMaterial({ map: l.map, bumpMap: l.bump, bumpScale: 0.6, roughness: 0.95 });
  }, []);
  const nile = useMemo(() => new THREE.MeshPhysicalMaterial({ color: PAL.nile, roughness: 0.4, sheen: 1, sheenColor: "#9CC6F0" }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.2 }), []);
  const route = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7A2A1E", roughness: 0.8 }), []);
  const knotOff = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8DCC2", roughness: 0.9 }), []);
  const tTinnis = W(C, "tinnis");
  const tFew = W(C, "beberapa");
  const tTen = W(C, "sepuluh");
  const tFund = W(C, "membiayai");
  const tCairo = W(C, "khoronfish");
  const tCaravan = W(C, "kafilah");
  const tArrive = W(C, "bendera");
  const villageAt = (i: number) => (i < 3 ? tFew + i * 0.3 : lerp(tTen - 1.2, tTen + 0.6, (i - 3) / 6));
  const along = ease(t, tCaravan - 0.3, tArrive - tCaravan + 0.5);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(ROUTE.map((p) => new THREE.Vector3(...p))), []);
  const at = (u: number) => curve.getPointAt(Math.min(0.999, Math.max(0, u)));
  const head = at(along);
  const ahead = at(along + 0.01);
  const yaw = Math.atan2(-(ahead.z - head.z), ahead.x - head.x);
  const camels = [0, 0.035, 0.07];
  return (
    <group position={[O, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[12.02, 16]} />
        <primitive object={linenM} attach="material" />
      </mesh>
      {/* map board */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 0.03, 4.8]} />
        <meshStandardMaterial color="#7A5A3A" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.036, 0]} receiveShadow>
        <planeGeometry args={[7, 4.6]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
      <group position={[0, 0.05, 0]}>
        <ThreadPath pts={NILE.map((p) => [p[0], 0.01, p[2]] as V3)} r={0.028} material={nile} grow={ease(t, CH(C).start, 3)} />
        <ThreadPath pts={BRANCH_W.map((p) => [p[0], 0.01, p[2]] as V3)} r={0.02} material={nile} grow={ease(t, CH(C).start + 1.5, 2)} />
        <ThreadPath pts={BRANCH_E.map((p) => [p[0], 0.01, p[2]] as V3)} r={0.02} material={nile} grow={ease(t, CH(C).start + 1.5, 2)} />
        {/* Tinnis */}
        <mesh position={[TINNIS[0], 0.03, TINNIS[2]]} scale={pop(t, tTinnis, 0.5)} castShadow>
          <sphereGeometry args={[0.055, 16, 12]} />
          <primitive object={gold} attach="material" />
        </mesh>
        {/* waqf villages */}
        {VILLAGES.map((p, i) => {
          const k = pop(t, villageAt(i), 0.5);
          const lit = ease(t, tFund + i * 0.08, 0.5) * (i < 3 ? 1 : ease(t, tTen, 0.5));
          return (
            <group key={i}>
              <mesh position={[p[0], 0.03, p[2]]} scale={k} castShadow>
                <sphereGeometry args={[0.042, 14, 10]} />
                <primitive object={lit > 0.5 ? gold : knotOff} attach="material" />
              </mesh>
              {/* gold thread from the field to Cairo */}
              {k > 0.5 && <ThreadPath pts={[[p[0], 0.02, p[2]], [lerp(p[0], CAIRO[0], 0.5), 0.05, lerp(p[2], CAIRO[2], 0.5)], [CAIRO[0], 0.02, CAIRO[2]]]} r={0.006} material={gold} grow={ease(t, Math.max(tFund, villageAt(i)) + 0.3, 1.2)} />}
            </group>
          );
        })}
        {/* Cairo workshop: a felt block with a gold door */}
        <group position={[CAIRO[0], 0, CAIRO[2]]} scale={pop(t, tCairo, 0.6)}>
          <mesh position={[0, 0.09, 0]} castShadow>
            <boxGeometry args={[0.28, 0.18, 0.2]} />
            <meshStandardMaterial color="#B98F64" roughness={1} />
          </mesh>
          <mesh position={[0, 0.07, 0.102]}>
            <boxGeometry args={[0.07, 0.12, 0.005]} />
            <primitive object={gold} attach="material" />
          </mesh>
        </group>
        <mesh position={[CAIRO[0], 0.03, CAIRO[2]]} castShadow>
          <sphereGeometry args={[0.06, 16, 12]} />
          <primitive object={gold} attach="material" />
        </mesh>
        {/* Makkah: a small gold knot */}
        <mesh position={[MAKKAH[0], 0.03, MAKKAH[2]]} scale={pop(t, tCaravan, 0.5)} castShadow>
          <sphereGeometry args={[0.07, 16, 12]} />
          <primitive object={gold} attach="material" />
        </mesh>
        {/* stitched route, then the caravan along it */}
        <ThreadPath pts={ROUTE.map((p) => [p[0], 0.012, p[2]] as V3)} r={0.008} material={route} grow={ease(t, tCaravan - 1.2, 1.6)} />
        {t > tCaravan - 0.4 &&
          camels.map((d, i) => {
            const p = at(along - d);
            return <Camel key={i} pos={[p.x, 0.0, p.z]} rotY={yaw} t={t + i * 0.3} walk={along < 0.995 ? 1 : 0} scale={0.42} mahmal={i === 0} />;
          })}
      </group>
      {/* callouts */}
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["Tinnis", "kota tenun · masa Abbasiyah"]} t={t} at={tTinnis} until={W(C, "sekitar")} w={1.25} />
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["± 750 H · As-Shalih Isma'il", "desa wakaf di Qalyubiyah"]} t={t} at={W(C, "mamluk")} until={W(C, "sulaiman")} w={1.35} accent />
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["947 H / 1540 M · Sulaiman", "± sepuluh desa"]} t={t} at={W(C, "sulaiman")} until={W(C, "muhammad")} w={1.35} accent />
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["Muhammad Ali Pasha", "dibiayai kas negara"]} t={t} at={W(C, "muhammad")} until={tCairo} w={1.3} />
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["Khoronfish, Kairo · 1817", "Dar al-Kiswa"]} t={t} at={tCairo} until={W(C, "baibars")} w={1.35} accent />
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["mahmal pertama tercatat", "Sultan Baibars"]} t={t} at={W(C, "baibars")} until={W(C, "jubair")} w={1.35} />
      <Tag pos={[-2.5, 0.06, 1.1]} lines={["1184 · Ibnu Jubair", "unta, genderang, bendera"]} t={t} at={W(C, "jubair")} until={CH(C).end + 3} w={1.35} />
      <Tag pos={[MAKKAH[0] - 0.2, 0.08, MAKKAH[2] + 0.55]} lines={["Makkah"]} t={t} at={tCaravan} until={CH(C).end + 3} w={0.75} accent />
      <Tag pos={[CAIRO[0] + 0.2, 0.08, CAIRO[2] + 0.55]} lines={["Kairo"]} t={t} at={W(C, "mesir")} until={CH(C).end + 3} w={0.7} />
    </group>
  );
};
