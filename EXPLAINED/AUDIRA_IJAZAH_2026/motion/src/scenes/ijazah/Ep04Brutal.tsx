// EP04 RUANG PANAS (BRUTALFORGE): objects argue instead of people. Gavel, bubbles, meter, finger, clock, two mittens. Colour cuts happen once per scene, so nothing strobes.

import React, { useMemo } from "react";
import * as THREE from "three";
import { keys, sample } from "../../core/motion/track.ts";
import { Cine, sm, useClock } from "../shared/Cine.tsx";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { anchors, Captions, Outro, pop, sceneT, type TL } from "./lib.tsx";
import tlData from "./tl/ep04.json";

const tl = tlData as TL;
export const SECONDS = tl.duration;
const INK = "#0B0C10", Y = "#FFE600", C = "#00F0FF", G_ = "#25F482", PK = "#FF3864", W = "#FFFFFF";
const BG = [Y, W, C, PK, Y, G_, W, C];

const extr = (s: THREE.Shape, d = 0.6) => { const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 14 }); g.translate(0, 0, -d / 2); return g; };
const rr = (w: number, h: number, r: number, x = 0, y = 0) => {
  const s = new THREE.Shape(), l = x - w / 2, b = y - h / 2;
  s.moveTo(l + r, b); s.lineTo(l + w - r, b); s.quadraticCurveTo(l + w, b, l + w, b + r); s.lineTo(l + w, b + h - r); s.quadraticCurveTo(l + w, b + h, l + w - r, b + h);
  s.lineTo(l + r, b + h); s.quadraticCurveTo(l, b + h, l, b + h - r); s.lineTo(l, b + r); s.quadraticCurveTo(l, b, l + r, b);
  return s;
};
const bubble = (w: number, h: number, dir: number) => {
  const s = rr(w, h, 0.5), g = new THREE.ShapeGeometry(s); g.dispose();
  const t = new THREE.Shape(); t.moveTo(dir * 0.4, -h / 2 + 0.1); t.lineTo(dir * 1.7, -h / 2 + 0.1); t.lineTo(dir * 1.9, -h / 2 - 1.3); t.closePath();
  return [extr(s), extr(t)];
};
const finger = () => {
  const s = new THREE.Shape();
  s.moveTo(-1.5, -3.2); s.lineTo(1.5, -3.2); s.lineTo(1.6, -0.6); s.quadraticCurveTo(1.6, 0.5, 0.6, 0.5); s.lineTo(0.6, 3.6); s.quadraticCurveTo(0, 4.5, -0.6, 3.6);
  s.lineTo(-0.6, 0.5); s.quadraticCurveTo(-1.6, 0.5, -1.6, -0.6); s.closePath();
  return extr(s);
};
const mitten = () => {
  const s = new THREE.Shape();
  s.moveTo(-3.4, -0.9); s.lineTo(1, -0.9); s.quadraticCurveTo(2.6, -0.8, 2.6, 0); s.quadraticCurveTo(2.6, 0.9, 1, 0.9); s.lineTo(0.4, 0.9); s.quadraticCurveTo(0.6, 2, -0.2, 2); s.quadraticCurveTo(-0.9, 1.8, -0.8, 0.9); s.lineTo(-3.4, 0.9); s.closePath();
  return extr(s);
};

const Pop: React.FC<{ geo: THREE.BufferGeometry | THREE.BufferGeometry[]; color: string; at?: [number, number, number]; rot?: number; s?: number | [number, number, number]; sh?: number }> = ({ geo, color, at, rot = 0, s = 1, sh = 0.32 }) => {
  const gs = Array.isArray(geo) ? geo : [geo];
  const sx = Array.isArray(s) ? s[0] : s;
  return (
    <group position={at} rotation={[0, 0, rot]} scale={s as number}>
      {gs.map((g, i) => <mesh key={`s${i}`} geometry={g} position={[sh / sx, -sh / sx, -0.9]}><meshBasicMaterial color={INK} toneMapped={false} /></mesh>)}
      {gs.map((g, i) => <mesh key={`o${i}`} geometry={g} scale={1.05} position={[0, 0, -0.1]}><meshBasicMaterial color={INK} toneMapped={false} /></mesh>)}
      {gs.map((g, i) => <mesh key={`c${i}`} geometry={g}><meshBasicMaterial color={color} side={THREE.DoubleSide} toneMapped={false} /></mesh>)}
    </group>
  );
};

const Big: React.FC<{ k: number; size?: number; color?: string; children: React.ReactNode; rot?: number }> = ({ k, size = 118, color = INK, children, rot = -2 }) => (
  <div style={{ fontFamily: `'${FONT.display}'`, fontSize: size, lineHeight: 1.06, color, WebkitTextStroke: color === INK ? undefined : `8px ${INK}`, paintOrder: "stroke", opacity: k > 0 ? 1 : 0, transform: `rotate(${rot}deg) scale(${Math.max(0.01, k)})`, transformOrigin: "0 50%" }}>{children}</div>
);
const Tag: React.FC<{ children: React.ReactNode; bg?: string; k?: number }> = ({ children, bg = INK, k = 1 }) => (
  <div style={{ display: "inline-block", background: bg, color: bg === INK ? W : INK, fontFamily: `'${FONT.sans}'`, fontWeight: 700, fontSize: 32, padding: "6px 14px", border: `4px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, marginBottom: 14, opacity: k > 0 ? 1 : 0, transform: `scale(${Math.max(0.01, k)})`, transformOrigin: "0 50%" }}>{children}</div>
);

export const Film: React.FC = () => {
  const { t } = useClock();
  const at = useMemo(() => anchors(tl), []), K = useMemo(() => sceneT(tl), []);
  const GEO = useMemo(() => ({
    head: extr(rr(5.6, 2.6, 0.3), 1.4), band: extr(rr(0.5, 2.8, 0.05), 1.5), stick: extr(rr(0.8, 7, 0.2), 0.6), block: extr(rr(6.2, 1, 0.2), 1.2),
    b1: bubble(6.2, 2.6, -1), b2: bubble(6.2, 2.6, 1), finger: finger(), mitten: mitten(), mitten2: mitten().scale(-1, 1, 1), bar: extr(rr(1.1, 1, 0.08)), plate: extr(rr(10, 6.4, 0.5), 0.5),
    disc: extr(new THREE.Shape().absarc(0, 0, 4, 0, Math.PI * 2, false), 0.5), hand: extr(rr(0.34, 3.2, 0.12), 0.2), dot: new THREE.CircleGeometry(0.34, 16),
  }), []);
  const scene = tl.scenes.filter((s) => t >= s.start - 0.05).length;
  const idx = Math.min(BG.length - 1, Math.max(0, scene - 1));
  const hit = (a: number, g = 1) => (t < a ? 0 : Math.exp(-(t - a) * 7) * Math.cos((t - a) * 34) * g);

  const slam1 = at("s1:ditegur"), slam2 = at("s2:Hakim"), slam3 = at("s5:skors");
  const swing = (a: number) => (t < a - 0.25 ? 0.9 : t < a ? 0.9 * (1 - (t - a + 0.25) / 0.25) : hit(a, 0.18));
  const shake = hit(slam1, 0.12) + hit(slam2, 0.1) + hit(slam3, 0.26) + hit(at("s6:berteriak"), 0.12);
  const CAM = useMemo(() => keys(
    [0, 0, 0.5, 24, 0, 0.5, 0, 34], [K.s2 - 0.05, 0, 0.5, 22, 0, 0.5, 0, 34], [K.s2 + 0.35, 40, 0.2, 23, 40, 0.2, 0, 34], [K.s3 - 0.05, 40, 0.2, 21, 40, 0.2, 0, 34],
    [K.s3 + 0.35, 80, 0, 24, 80, 0, 0, 34], [K.s4 - 0.05, 80, 0, 22, 80, 0, 0, 34], [K.s4 + 0.35, 120, 0, 23, 120, 0, 0, 34], [K.s5 - 0.05, 120, 0, 20, 120, 0, 0, 34],
    [K.s5 + 0.3, 160, 0, 25, 160, 0, 0, 34], [K.s6 - 0.05, 160, 0, 22, 160, 0, 0, 34], [K.s6 + 0.35, 200, 0, 22, 200, 0, 0, 34], [K.s7 - 0.05, 200, 0, 19, 200, 0, 0, 34],
    [K.s7 + 0.35, 240, 0, 25, 240, 0, 0, 34], [K.s8 - 0.05, 240, 0, 22, 240, 0, 0, 34], [K.s8 + 0.35, 280, 0, 24, 280, 0, 0, 34], [tl.duration, 280, 0, 20, 280, 0, 0, 34],
  ), [K]);
  const c = sample(CAM, t);
  const cam = [c[0] + Math.sin(t * 61) * shake, c[1] + Math.sin(t * 47) * shake * 0.7, c[2] * 1.8, c[3], c[4], c[5], c[6]];

  const Gavel = (x: number, y: number, a: number, s = 1) => (
    <group position={[x, y, 0]} rotation={[0, 0, swing(a)]} scale={s}>
      <Pop geo={GEO.stick} color="#C47A2C" at={[2.8, -1.6, -0.2]} rot={1.45} />
      <Pop geo={GEO.head} color="#8A4B14" at={[-1.5, 1.1, 0.2]} rot={-0.12} />
      <Pop geo={GEO.band} color={Y} at={[-2.9, 1.25, 0.6]} rot={-0.12} sh={0} /><Pop geo={GEO.band} color={Y} at={[-0.1, 0.92, 0.6]} rot={-0.12} sh={0} />
    </group>
  );
  const meter = [0.6, 1.5, 2.6, 3.8, 5.1, 6.6, 7.9];
  const lev = sm(at("s4:Suara") - 0.3, at("s4:dikeluarkan"), t) * 0.7 + sm(at("s4:dikeluarkan"), at("s4:nadanya"), t) * 0.3;
  const fng = pop(at("s6:berteriak"), t, 0.3);
  const xk = pop(at("s6:telunjuk"), t, 0.25);
  const hours = sm(K.s7 + 0.6, at("s7:Di#2") - 0.2, t);
  const shakeHands = sm(at("s8:bersalaman") - 0.3, at("s8:bersalaman") + 0.5, t);
  const pump = t > at("s8:bersalaman") + 0.4 && t < at("s8:Panasnya") ? Math.sin(t * 11) * 0.3 : 0;

  const hd: Record<number, React.ReactNode> = {
    1: <Big k={pop(0.05, t)} size={100} rot={-1.5}>SIDANG IJAZAH MEMANAS! HAKIM TEGUR JOKOWI, REFLY DEBAT JAKSA</Big>,
    2: <><Tag k={pop(at("s2:Pertama"), t)} bg={INK}>TEGURAN 1: SAKSI</Tag><Big k={pop(at("s2:Hakim"), t)} size={90}>"MOHON DIJAWAB SAJA PERTANYAANNYA"</Big></>,
    3: <><Tag k={pop(K.s3, t)} bg={W}>GILIRAN KUBU ROY</Tag><Big k={pop(at("s3:Refly#2"), t)} size={104} color={Y}>"JANGAN MENGGANGGU"</Big></>,
    4: <><Tag k={pop(at("s4:Jaksa"), t)} bg={C}>JAKSA: LEWAT MAJELIS</Tag><br /><Tag k={pop(at("s4:Refly"), t)} bg={Y}>REFLY: KELUARKAN SAJA</Tag><br /><Tag k={pop(at("s4:Jaksa#2"), t)} bg={C}>JAKSA: PERINGATKAN NADANYA</Tag></>,
    5: <Big k={pop(slam3, t, 0.2)} size={230} color={PK} rot={-4}>SKORS!</Big>,
    6: <><Tag k={pop(K.s6, t)} bg={INK}>TEGURAN 2: PENASIHAT HUKUM</Tag><Big k={pop(at("s6:Hakim"), t)} size={92}>"JANGAN PAKAI TELUNJUK"</Big></>,
    7: <><Tag k={pop(K.s7, t)} bg={Y}>SIDANG ROY: 09.00 - 16.30</Tag><br /><Tag k={pop(at("s7:hakim"), t)} bg={PK}>ROY MENOLAK KETERANGAN SAKSI: DICATAT</Tag></>,
    8: <><Tag k={pop(K.s8, t)} bg={W}>AKHIR SIDANG</Tag><Big k={pop(at("s8:Hakim"), t)} size={112} color={Y}>BELUM ADA PUTUSAN</Big></>,
  };
  const overlay = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 56, top: 184 }}><div style={{ display: "inline-block", background: INK, color: W, fontFamily: `'${FONT.sans}'`, fontWeight: 600, fontSize: 22, padding: "4px 12px" }}>ILUSTRASI · SIDANG MASIH BERJALAN</div></div>
      <div style={{ position: "absolute", left: 56, right: 110, top: 236 }}>{hd[scene]}</div>
      <Captions tl={tl} t={t} box={{ background: W, border: `5px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, padding: "10px 16px 14px" }} text={{ fontFamily: `'${FONT.display}'`, fontSize: 60, lineHeight: 1.14 }} active={PK} ink={INK} />
      <Outro tl={tl} t={t} line="KASUS IJAZAH · SIDANG MEMANAS" />
    </div>
  );
  return (
    <Cine bg={BG[idx]} cam={cam} bloom={[0, 0.1, 1]} far={120} overlay={overlay}>
      <group position={[c[0], 0, -6]}>{Array.from({ length: 22 }, (_, i) => <mesh key={i} position={[(i - 10.5) * 1.5, 0, 0]}><planeGeometry args={[0.05, 40]} /><meshBasicMaterial color={INK} transparent opacity={0.14} /></mesh>)}</group>
      {/* s1: one gavel, two blocks */}
      <group position={[0, -0.6, 0]}>
        {Gavel(0.2, 1.6, slam1)}
        <Pop geo={GEO.block} color={C} at={[-3, -2.8, 0]} s={0.82} /><Pop geo={GEO.block} color={PK} at={[3, -2.8, 0]} s={0.82} />
      </group>
      {/* s2 */}
      <group position={[40, -0.6, 0]}>
        {Gavel(2.2, 2.4, slam2, 0.86)}
        <group scale={Math.max(0.01, pop(at("s2:bukan"), t))} position={[-2.6, -1.8, 0]}><Pop geo={GEO.b2} color={Y} /></group>
      </group>
      {/* s3: two bubbles face each other */}
      <group position={[80, 0, 0]}>
        <group position={[-2.8, -1.8 + 3 * 0, 0]} scale={Math.max(0.01, pop(at("s3:Jokowi"), t))}><Pop geo={GEO.b2} color={W} s={0.76} /></group>
        <group position={[2.6, 1.6, 0]} scale={Math.max(0.01, pop(at("s3:Refly#2"), t))}><Pop geo={GEO.b1} color={PK} s={0.76} /></group>
      </group>
      {/* s4: loudness meter */}
      <group position={[120, -4.2, 0]}>
        {meter.map((h, i) => {
          const on = lev * meter.length > i ? 1 : 0.1;
          const hh = h * (0.16 + 0.84 * on);
          return <Pop key={i} geo={GEO.bar} color={i > 4 ? PK : i > 2 ? Y : G_} at={[-4.8 + i * 1.6, hh / 2, 0]} s={[1, hh, 1]} sh={0.22} />;
        })}
      </group>
      {/* s5 */}
      <group position={[160, -0.8, 0]}>
        {Gavel(0.2, 1.4, slam3, 1.1)}
        <Pop geo={GEO.block} color={W} at={[-0.4, -3.1, 0]} s={1.5} />
      </group>
      {/* s6: a finger, then a hard cross */}
      <group position={[200, -0.4, 0]}>
        <group scale={Math.max(0.01, fng)} rotation={[0, 0, -0.5 + Math.sin(t * 8) * 0.05 * (xk > 0 ? 0 : 1)]} position={[-0.3, -0.6, 0]}><Pop geo={GEO.finger} color="#F7C59F" s={0.9} /></group>
        {xk > 0 ? <group position={[-0.3, -0.2, 2]} scale={xk}><Pop geo={GEO.stick} color={PK} rot={0.8} /><Pop geo={GEO.stick} color={PK} rot={-0.8} /></group> : null}
      </group>
      {/* s7: court clock runs 09.00 to 16.30 */}
      <group position={[240, 0, 0]}>
        <Pop geo={GEO.disc} color={W} s={0.98} />
        {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[Math.sin((i / 12) * 6.283) * 3.3, Math.cos((i / 12) * 6.283) * 3.3, 0.4]}><circleGeometry args={[0.15, 12]} /><meshBasicMaterial color={INK} toneMapped={false} /></mesh>)}
        <group position={[0, 0, 0.5]} rotation={[0, 0, -((9 + hours * 7.5) / 12) * 6.283]}><mesh geometry={GEO.hand} position={[0, 1.2, 0]}><meshBasicMaterial color={PK} toneMapped={false} /></mesh></group>
      </group>
      {/* s8: two mittens meet, then the verdict plate stays empty */}
      <group position={[280, 0, 0]}>
        <group position={[-5.6 + shakeHands * 3.3, pump, 0]}><Pop geo={GEO.mitten} color={C} /></group>
        <group position={[5.6 - shakeHands * 3.3, pump, 0.1]}><Pop geo={GEO.mitten2} color={Y} /></group>
      </group>
    </Cine>
  );
};
