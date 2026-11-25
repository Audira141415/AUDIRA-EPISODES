// Station 7 (x = 84): the change ritual (c08). The maquette on white marble wears the black kiswah.
// Side by side the new cloth unrolls from the roof over the old one, then the old cloth drops away
// below, so the cube is never uncovered; the door curtain comes last. Then the calendar moves to
// 1 Muharram, the lower edge is raised with a white cotton band ("ihram"), and an old piece is cut
// and kept in a glass case with an AUDIRA archive tag (the one in-world brand mark).
import React, { useMemo } from "react";
import * as THREE from "three";
import { KAABA, kiswahTex, PAL, silkMat, Spool, Tag, toTex, weaveTex } from "./kit.tsx";
import { CH, clamp, ease, lerp, pop, SX, W } from "./tl.ts";

const C = "c08_ganti";

const marbleTex = () => {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#EEEAE2";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "rgba(140,135,128,0.35)";
  g.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    let x = (i * 97) % S;
    let y = 0;
    g.moveTo(x, y);
    while (y < S) {
      x += Math.sin(y * 0.05 + i) * 6;
      y += 8;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return toTex(c, [3, 3]);
};

/** One face of the kiswah as a plane: `cover` unrolls from the top, `drop` lets it fall below. */
const Face: React.FC<{ side: number; mat: THREE.Material; cover: number; drop: number; off: number; bottom: number }> = ({ side, mat, cover, drop, off, bottom }) => {
  const { w, d, h } = KAABA;
  if (cover <= 0.001 || drop >= 0.999) return null;
  const len = side % 2 === 0 ? w : d;
  const full = h * (1 - bottom);
  const hh = full * cover * (1 - drop);
  const top = 0.04 + h - drop * full; // the dropping cloth slides down as it falls
  const y = top - hh / 2;
  const n = side % 2 === 0 ? d / 2 + off : w / 2 + off;
  const pos: [number, number, number] = side === 0 ? [0, y, n] : side === 1 ? [n, y, 0] : side === 2 ? [0, y, -n] : [-n, y, 0];
  return (
    <mesh position={pos} rotation={[0, (side * Math.PI) / 2, 0]} castShadow receiveShadow>
      <planeGeometry args={[len + off * 2, Math.max(0.001, hh)]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};

export const Station7: React.FC<{ t: number }> = ({ t }) => {
  const O = SX(7);
  const marble = useMemo(() => marbleTex(), []);
  const stone = useMemo(() => weaveTex(PAL.stone, 221, [2, 2], 12), []);
  const kis = useMemo(() => {
    const tex = kiswahTex();
    return new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.5, sheen: 1, sheenRoughness: 0.35, sheenColor: "#5A4E5C", side: THREE.DoubleSide });
  }, []);
  const kisNew = useMemo(() => {
    const tex = kiswahTex();
    return new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.45, sheen: 1, sheenRoughness: 0.3, sheenColor: "#6A5E6C", side: THREE.DoubleSide });
  }, []);
  const cottonW = useMemo(() => silkMat("#F2EEE6", weaveTex("#F2EEE6", 223, [4, 1], 6)), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: PAL.gold, metalness: 1, roughness: 0.2 }), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.02, metalness: 0, transparent: true, opacity: 0.16, clearcoat: 1 }), []);
  const blackPiece = useMemo(() => silkMat("#141214", weaveTex("#141214", 225, [1, 1], 6)), []);

  const sisi = (n: number) => W(C, "sisi", n);
  const sides = [
    { up: W(C, "dinaikkan") - 0.4, drop: W(C, "jatuh") },
    { up: sisi(2) - 0.6, drop: sisi(2) + 1.0 },
    { up: sisi(3) + 0.1, drop: W(C, "empat") + 0.6 },
    { up: W(C, "empat") - 0.2, drop: W(C, "penutup") },
  ];
  const tDoor = W(C, "tirai");
  const tRaise = W(C, "dinaikkan", 1);
  const raise = ease(t, tRaise, 1.6) * (3 / 14);
  const white = ease(t, W(C, "putih"), 1.0);
  const tCut = W(C, "dipotongpotong");
  const tGift = W(C, "dihadiahkan");
  const cut = ease(t, tCut - 0.3, 0.8);
  const intoCase = ease(t, tGift, 1.6);
  const { w, d, h } = KAABA;
  return (
    <group position={[O, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <circleGeometry args={[5.4, 128]} />
        <meshStandardMaterial map={marble} roughness={0.35} />
      </mesh>
      {/* the maquette: stone core, old kiswah, new kiswah */}
      <group rotation={[0, -0.42, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[w + 0.1, 0.04, d + 0.1]} />
          <meshStandardMaterial color="#B9B3AA" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04 + h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial map={stone.map} roughness={0.95} />
        </mesh>
        {/* roof */}
        <mesh position={[0, 0.04 + h + 0.004, 0]} receiveShadow>
          <boxGeometry args={[w + 0.02, 0.008, d + 0.02]} />
          <meshStandardMaterial color="#2A2628" roughness={0.8} />
        </mesh>
        {sides.map((s, i) => (
          <React.Fragment key={i}>
            <Face side={i} mat={kis} cover={1} drop={ease(t, s.drop, 1.0)} off={0.006} bottom={0} />
            <Face side={i} mat={kisNew} cover={ease(t, s.up, 1.6)} drop={0} off={0.014} bottom={raise} />
          </React.Fragment>
        ))}
        {/* door curtain: last and hardest */}
        {t > tDoor - 0.3 && (
          <mesh position={[-w * 0.18, 0.04 + h * 0.5, d / 2 + 0.02]} scale={[1, ease(t, tDoor - 0.3, 1.0), 1]} castShadow>
            <boxGeometry args={[0.22, 0.42, 0.008]} />
            <primitive object={gold} attach="material" />
          </mesh>
        )}
        {/* "ihram": white cotton band under the raised edge */}
        {white > 0.001 &&
          [0, 1, 2, 3].map((side) => {
            const len = side % 2 === 0 ? w : d;
            const bh = h * (2 / 14) * white;
            const n = (side % 2 === 0 ? d / 2 : w / 2) + 0.018;
            const y = 0.04 + h * (3 / 14) - bh / 2 + 0.01;
            const pos: [number, number, number] = side === 0 ? [0, y, n] : side === 1 ? [n, y, 0] : side === 2 ? [0, y, -n] : [-n, y, 0];
            return (
              <mesh key={side} position={pos} rotation={[0, (side * Math.PI) / 2, 0]} castShadow>
                <planeGeometry args={[len + 0.04, bh]} />
                <primitive object={cottonW} attach="material" />
              </mesh>
            );
          })}
        {/* Hajar Aswad corner mark */}
        <mesh position={[-w / 2 - 0.025, 0.04 + h * 0.14, d / 2 + 0.025]} rotation={[0, -Math.PI / 4, 0]}>
          <torusGeometry args={[0.04, 0.012, 10, 24]} />
          <meshStandardMaterial color="#D6D8DC" metalness={1} roughness={0.25} />
        </mesh>
      </group>
      {/* an old piece cut into six, one goes into the glass case */}
      <group position={[2.0, 0.01, 1.2]} rotation={[0, -0.3, 0]}>
        {Array.from({ length: 6 }, (_, i) => {
          const cx = (i % 3) - 1;
          const cz = Math.floor(i / 3) - 0.5;
          const spread = cut * 0.06;
          const moving = i === 4 ? intoCase : 0;
          const gx = lerp(cx * (0.3 + spread), -4.1, moving);
          const gz = lerp(cz * (0.3 + spread), -0.1, moving);
          const gy = lerp(0.006, 0.22, moving) + Math.sin(Math.PI * moving) * 0.5;
          return (
            <mesh key={i} position={[t < tCut - 0.3 ? cx * 0.3 : gx, gy, t < tCut - 0.3 ? cz * 0.3 : gz]} castShadow receiveShadow>
              <boxGeometry args={[0.3 - 0.004 * cut, 0.008, 0.3 - 0.004 * cut]} />
              <primitive object={blackPiece} attach="material" />
            </mesh>
          );
        })}
        {/* scissors */}
        {t > tCut - 1.2 && t < tGift + 1 && (
          <group position={[0.55, 0.03, -0.3]} rotation={[0, 0.6, 0]} scale={pop(t, tCut - 1.2, 0.5)}>
            {[1, -1].map((sgn) => (
              <mesh key={sgn} rotation={[0, sgn * (0.35 - cut * 0.33), 0]} position={[0.12, 0, 0]} castShadow>
                <boxGeometry args={[0.32, 0.01, 0.02]} />
                <meshStandardMaterial color="#D9DDE3" metalness={1} roughness={0.2} />
              </mesh>
            ))}
            <mesh position={[-0.06, 0, 0]} castShadow>
              <torusGeometry args={[0.035, 0.01, 8, 20]} />
              <meshStandardMaterial color="#2A2628" roughness={0.5} />
            </mesh>
          </group>
        )}
      </group>
      {/* glass case on a beech plinth */}
      <group position={[-2.1, 0, 1.15]}>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.2, 0.5]} />
          <meshStandardMaterial color={PAL.beech} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.58, 0.44, 0.48]} />
          <primitive object={glass} attach="material" />
        </mesh>
        {[
          [-0.29, -0.24],
          [0.29, -0.24],
          [-0.29, 0.24],
          [0.29, 0.24],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.42, z]}>
            <boxGeometry args={[0.012, 0.44, 0.012]} />
            <meshStandardMaterial color={PAL.brass} metalness={1} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <Spool pos={[2.9, 0, -1.2]} color="#141214" />
      <Spool pos={[-2.9, 0, -1.0]} color={PAL.gold} rotY={0.5} />
      {/* callouts */}
      <Tag pos={[1.15, 0.05, 1.0]} lines={["sisi baru di atas sisi lama", "lalu kain lama jatuh"]} t={t} at={W(C, "setiap")} until={W(C, "bagian")} w={1.35} />
      <Tag pos={[1.15, 0.05, 1.0]} lines={["terakhir: tirai pintu"]} t={t} at={tDoor} until={W(C, "sampai")} w={1.1} accent />
      <Tag pos={[-1.15, 0.05, 1.0]} lines={["s.d. 2021", "9 Dzulhijjah · hari Arafah"]} t={t} at={W(C, "sampai")} until={W(C, "muharram")} w={1.3} />
      <Tag pos={[-1.15, 0.05, 1.0]} lines={["sejak 2022", "malam 1 Muharram"]} t={t} at={W(C, "muharram")} until={W(C, "menjelang")} w={1.3} accent />
      <Tag pos={[1.15, 0.05, 1.0]} lines={["dinaikkan 3 m", "kain katun putih 2 m"]} t={t} at={tRaise} until={W(C, "lalu", 2)} w={1.3} />
      <Tag pos={[-1.15, 0.05, 1.0]} lines={["“ihram Ka'bah”", "bukan ihram ibadah"]} t={t} at={W(C, "ihram")} until={W(C, "lalu", 2)} w={1.3} accent />
      <Tag pos={[1.15, 0.05, 1.0]} lines={["dipotong-potong", "dihadiahkan"]} t={t} at={tCut} until={W(C, "umar")} w={1.2} />
      <Tag pos={[-1.4, 0.05, 1.95]} lines={["ARSIP AUDIRA", "potongan kiswah"]} t={t} at={tGift + 1.2} until={CH(C).end + 3} w={1.05} accent />
      <Tag pos={[1.15, 0.05, 1.0]} lines={["Umar bin Khattab", "dibagikan ke jamaah haji"]} t={t} at={W(C, "umar")} until={CH(C).end + 3} w={1.35} />
      {void clamp}
    </group>
  );
};
