// EP03 SKEMA UJI ULANG (DRAFTFORGE): the question drawn as a test rig on blueprint. Lines draw on with each spoken clause; the sheet is an abstract outline, never a diploma copy.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { keys, sample } from "../../core/motion/track.ts";
import { DRAFT_PALETTE as P } from "../../kits/draftforge/lib/palette";
import { DraftingTable } from "../../kits/draftforge/world/DraftingTable";
import { DimensionLine } from "../../kits/draftforge/cad/DimensionLine";
import { Cine, lin, sm, useClock } from "../shared/Cine.tsx";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { anchors, Captions, Label, Outro, pop, sceneT, type TL } from "./lib.tsx";
import tlData from "./tl/ep03.json";

const tl = tlData as TL;
export const SECONDS = tl.duration;
const ST = [0, 40, 80, 120, 160, 200, 240, 280];

const Edges: React.FC<{ geo: THREE.BufferGeometry; p?: number; color?: string; pos?: [number, number, number]; rot?: [number, number, number]; s?: number | [number, number, number]; op?: number }> = ({ geo, p = 1, color = P.cadWhite, pos, rot, s = 1, op = 0.95 }) => {
  const e = useMemo(() => new THREE.EdgesGeometry(geo, 22), [geo]);
  useLayoutEffect(() => { e.setDrawRange(0, Math.floor((e.attributes.position.count * Math.min(1, Math.max(0, p))) / 2) * 2); }, [e, p]);
  return <lineSegments geometry={e} position={pos} rotation={rot} scale={s as number}><lineBasicMaterial color={color} transparent opacity={op} toneMapped={false} /></lineSegments>;
};

const Sheet: React.FC<{ G: THREE.BufferGeometry; L: THREE.BufferGeometry; p: number; pos?: [number, number, number]; color?: string; s?: number }> = ({ G, L, p, pos, color, s = 1 }) => (
  <group position={pos} scale={s}>
    <Edges geo={G} p={p * 1.4} color={color} />
    <lineSegments geometry={L} visible={p > 0.4}><lineBasicMaterial color={P.cadCyan} transparent opacity={Math.min(1, (p - 0.4) * 2) * 0.7} toneMapped={false} /></lineSegments>
  </group>
);

const stampStyle = (k: number, color: string, size = 96): React.CSSProperties => ({
  display: "inline-block", border: `7px solid ${color}`, color, fontFamily: `'${FONT.display}'`, fontSize: size, lineHeight: 1.08, padding: "4px 22px 6px",
  opacity: Math.min(1, k * 2), transform: `rotate(-3deg) scale(${1.55 - 0.55 * Math.min(1, k)})`, transformOrigin: "0 50%",
});
const Row: React.FC<{ a: number; t: number; k: string; v: string; c?: string }> = ({ a, t, k, v, c = P.dimensionGold }) => {
  const u = sm(a, a + 0.28, t);
  return <div style={{ display: "flex", gap: 16, alignItems: "baseline", opacity: u, transform: `translateX(${(1 - u) * 30}px)`, borderLeft: `5px solid ${c}`, background: "rgba(6,19,39,.86)", padding: "8px 14px", marginTop: 8 }}>
    <b style={{ flex: "none", fontFamily: `'${FONT.sans}'`, fontWeight: 700, fontSize: 30, color: c }}>{k}</b><span style={{ fontFamily: `'${FONT.sans}'`, fontSize: 33, lineHeight: 1.16, color: P.textPrimary }}>{v}</span>
  </div>;
};
const Tk: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontFamily: `'${FONT.sans}'`, fontWeight: 600, fontSize: 26, letterSpacing: "0.1em", color: P.dimensionGold, textTransform: "uppercase" }}>{children}</div>;

export const Film: React.FC = () => {
  const { t } = useClock();
  const at = useMemo(() => anchors(tl), []), K = useMemo(() => sceneT(tl), []);
  const G = useMemo(() => {
    const lines: number[] = [];
    [0.9, 0.45, 0, -0.45, -0.9].forEach((y, i) => lines.push(-1.1, y, 0.04, i % 2 ? 0.6 : 1.1, y, 0.04));
    const L = new THREE.BufferGeometry(); L.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    return {
      sheet: new THREE.BoxGeometry(3.4, 4.6, 0.08), L, box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 24),
      cone: new THREE.CylinderGeometry(0.35, 0.8, 1, 18), arrow: new THREE.ConeGeometry(0.5, 1.2, 4), tor: new THREE.TorusGeometry(1, 0.1, 8, 40),
    };
  }, []);
  const cells = useMemo(() => { const g = new THREE.InstancedMesh(new THREE.BoxGeometry(0.48, 0.48, 0.1), new THREE.MeshBasicMaterial({ toneMapped: false }), 180); g.frustumCulled = false; return g; }, []);
  const tc = useMemo(() => new THREE.Color(), []), dm = useMemo(() => new THREE.Object3D(), []);
  const seed = (i: number) => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };

  // Compression map: most cells stay calm; a sweep reveals uneven blocks. Abstract, not the real analysis.
  const sweep = lin(at("s4:Error"), at("s4:Jokowi"), t);
  useLayoutEffect(() => {
    for (let i = 0; i < 180; i++) {
      const x = i % 12, y = Math.floor(i / 12);
      const k = lin(0, 0.1, sweep - (y / 15) * 0.8);
      const hot = seed(i) > 0.86 ? 1 : 0;
      dm.position.set((x - 5.5) * 0.56, (7 - y) * 0.56, 0); dm.scale.setScalar(1); dm.updateMatrix(); cells.setMatrixAt(i, dm.matrix);
      cells.setColorAt(i, tc.set(P.gridMajor).lerp(tc.clone().set(hot ? P.dimensionGold : P.cadCyan), k * (hot ? 1 : 0.28 + seed(i + 9) * 0.3)));
    }
    cells.instanceMatrix.needsUpdate = true; if (cells.instanceColor) cells.instanceColor.needsUpdate = true;
  }, [sweep, cells, dm, tc]);

  const CAM = useMemo(() => keys(
    [0, 0, 1.6, 22, 0, 1.2, 0, 32], [K.s2 - 0.1, 0, 1.6, 20, 0, 1.2, 0, 32],
    [K.s2 + 0.9, ST[1], 4, 31, ST[1], 0.8, 0, 32], [K.s3 - 0.1, ST[1], 5, 29, ST[1], 0.8, 0, 32],
    [K.s3 + 0.9, ST[2], 5, 30, ST[2], 2, 0, 32], [K.s4 - 0.1, ST[2] + 0.5, 6, 28, ST[2] + 0.5, 2, 0, 32],
    [K.s4 + 0.9, ST[3], 2, 23, ST[3], 0.6, 0, 32], [K.s5 - 0.1, ST[3], 3, 20, ST[3], 0.6, 0, 32],
    [K.s5 + 0.9, ST[4], 7, 30, ST[4], 2.3, 0, 32], [K.s6 - 0.1, ST[4], 7, 28, ST[4], 2.3, 0, 32],
    [K.s6 + 0.9, ST[5], 9, 31, ST[5], 0.5, 0, 32], [K.s7 - 0.1, ST[5] + 1, 8, 30, ST[5] + 1, 0.5, 0, 32],
    [K.s7 + 0.9, ST[6], 2, 21, ST[6], 1, 0, 32], [K.s8 - 0.1, ST[6], 2, 19, ST[6], 1, 0, 32],
    [K.s8 + 0.9, ST[7], 8, 34, ST[7], 2.5, 0, 32], [tl.duration, ST[7], 7, 28, ST[7], 2.5, 0, 32],
  ), [K]);
  const cam0 = sample(CAM, t);
  const cam = [cam0[0], cam0[1] + 5, cam0[2] * 1.45, cam0[3], cam0[4], cam0[5], cam0[6]];

  const scene = tl.scenes.filter((s) => t >= s.start - 0.15).length;
  const keb = pop(at("s1:keberatan"), t, 0.22);
  const hd: Record<number, React.ReactNode> = {
    1: <><div style={{ fontFamily: `'${FONT.display}'`, fontSize: 86, lineHeight: 1.04, color: P.textPrimary }}>JOKOWI TOLAK UJI IJAZAH ULANG DI LABFOR! APA ALASANNYA?</div><div style={{ marginTop: 18, ...stampStyle(keb, P.stampCrimson, 76) }}>"SAYA KEBERATAN"</div></>,
    2: <><Tk>Pertanyaan Refly Harun</Tk><div style={{ fontFamily: `'${FONT.sans}'`, fontWeight: 600, fontSize: 48, lineHeight: 1.12, color: P.textPrimary, marginTop: 8 }}><span style={{ color: P.dimensionGold, opacity: sm(at("s2:Apabila"), at("s2:Apabila") + 0.25, t) }}>APABILA</span> hakim memerintahkan, uji labfor ulang: <span style={{ color: P.cadCyan }}>fisik vs file digital</span></div></>,
    3: <><Tk>Jawaban Jokowi</Tk><Row a={at("s3:Ijazah")} t={t} k="1" v="Sudah diuji Labfor Polri" /><Row a={at("s3:dokumen")} t={t} k="2" v="Dokumen pribadi, tak mau ditenteng" /></>,
    4: <><Tk>Kenapa dikejar kubu Roy</Tk><Row a={at("s4:file")} t={t} k="DASAR" v="Analisis berbasis file digital" /><Row a={at("s4:Error")} t={t} k="ELA" v="Mencari beda kompresi gambar" c={P.cadCyan} /><Row a={at("s4:Jokowi")} t={t} k="SAKSI" v="Tak meneliti kesamaannya" c={P.cadWhite} /></>,
    5: <><Tk>Beban pembuktian, kata Jokowi</Tk><div style={{ marginTop: 12, ...stampStyle(pop(at("s5:Yang"), t, 0.22), P.dimensionGold, 72) }}>YANG MENUDUH, MEMBUKTIKAN</div></>,
    6: <><Tk>Bareskrim, Mei 2025</Tk><Row a={at("s6:identik")} t={t} k="IDENTIK" v="Dengan tiga pembanding" c={P.cadCyan} /><Row a={at("s6:Roy")} t={t} k="ROY" v="Ragu, minta uji independen" c={P.stampCrimson} /></>,
    7: <><Tk>Usai sidang</Tk><div style={{ fontFamily: `'${FONT.sans}'`, fontWeight: 700, fontSize: 68, lineHeight: 1.08, color: P.textPrimary, marginTop: 8 }}>"Masa diuji-uji, sudah selesai."</div></>,
    8: <><Tk>Status 5 Nov 2026</Tk><div style={{ fontFamily: `'${FONT.display}'`, fontSize: 96, lineHeight: 1.04, color: P.textPrimary, marginTop: 6 }}>PERINTAH HAKIM: <span style={{ color: P.dimensionGold }}>BELUM ADA</span></div><Row a={at("s8:Kubu")} t={t} k="ROY" v="Akan terus meminta pengujian" c={P.stampCrimson} /></>,
  };
  const pk = sm(tl.scenes[scene - 1]?.start - 0.15, tl.scenes[scene - 1]?.start + 0.2, t);
  const overlay = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 56, top: 186, fontFamily: `'${FONT.sans}'`, fontSize: 22, letterSpacing: "0.05em", color: P.textMuted }}>SKEMA ILUSTRASI · SIDANG MASIH BERJALAN</div>
      <div style={{ position: "absolute", left: 56, right: 110, top: 226, opacity: pk, clipPath: `inset(0 ${(1 - pk) * 100}% 0 0)` }}>{hd[scene]}</div>
      <Captions tl={tl} t={t} box={{ background: "rgba(6,19,39,.94)", border: `2px solid ${P.cadCyan}`, padding: "10px 18px 14px" }} text={{ fontFamily: `'${FONT.sans}'`, fontWeight: 700, fontSize: 52, lineHeight: 1.12 }} active={P.dimensionGold} ink={P.textPrimary} />
      <Outro tl={tl} t={t} line="KASUS IJAZAH · UJI ULANG LABFOR" />
    </div>
  );

  const s2a = lin(K.s2 + 0.2, at("s2:ijazah") + 0.6, t), s2b = lin(at("s2:file"), at("s2:file") + 1.4, t);
  const scope = lin(K.s3 + 0.2, at("s3:Labfor") + 0.6, t), lock = lin(at("s3:dokumen"), at("s3:dokumen") + 1, t);
  const burden = sm(at("s5:Yang") - 0.1, at("s5:Yang") + 0.8, t);
  const align = sm(at("s6:tiga") - 0.2, at("s6:tiga") + 0.9, t);
  const indep = lin(at("s6:independen"), at("s6:independen") + 1.1, t);
  const pressT = at("s7:sudah");
  const press = t < pressT ? 1 - sm(K.s7, pressT, t) * 1 : Math.min(1, (t - pressT - 0.12) * 1.1);
  return (
    <Cine bg={P.blueprintDark} cam={cam} bloom={[0.45, 0.35, 0.72]} far={320} overlay={overlay}>
      <group position={[cam[0], -2.2, 0]}><DraftingTable size={150} divisions={150} /></group>
      {/* s1 */}
      <group position={[ST[0], 0, 0]}>
        <Sheet G={G.sheet} L={G.L} p={lin(0, 1.8, t)} pos={[0, 1.2, 0]} s={1.25} />
        <DimensionLine start={[-2.1, -1.8, 0]} end={[2.1, -1.8, 0]} offset={[0, -0.4, 0]} progress={lin(1, 2.2, t)} />
      </group>
      {/* s2: analog sheet and digital grid, joined by the conditional test */}
      <group position={[ST[1], 0, 0]}>
        <Sheet G={G.sheet} L={G.L} p={s2a} pos={[-3.4, 2.4, 0]} s={0.95} />
        <group position={[3.4, 2.4, 0]}>
          {Array.from({ length: 48 }, (_, i) => <Edges key={i} geo={G.box} p={s2b * 2 - i / 48} color={P.cadCyan} pos={[((i % 6) - 2.5) * 0.52, (3.5 - Math.floor(i / 6)) * 0.56, 0]} s={[0.46, 0.5, 0.06]} />)}
        </group>
        <DimensionLine start={[-1.7, -0.2, 0]} end={[1.7, -0.2, 0]} offset={[0, -0.5, 0]} progress={lin(at("s2:dibandingkan"), at("s2:dibandingkan") + 0.9, t)} />
        <Label txt="FISIK" color={P.cadWhite} w={3} pos={[-3.4, -1.6, 0]} font="700 110px Arial" op={s2a} />
        <Label txt="DIGITAL" color={P.cadCyan} w={3} pos={[3.4, -1.6, 0]} font="700 110px Arial" op={s2b} />
      </group>
      {/* s3: microscope on one side, a locked folder on the other */}
      <group position={[ST[2], 0, 0]}>
        <group position={[-3.6, -2, 0]}>
          <Edges geo={G.box} p={scope * 3} pos={[0, 0.2, 0]} s={[3.2, 0.4, 2.4]} /><Edges geo={G.cyl} p={scope * 3 - 0.6} pos={[-1, 2.2, -0.5]} s={[0.25, 4, 0.25]} />
          <Edges geo={G.cone} p={scope * 3 - 1} pos={[0.1, 3.3, 0]} rot={[0, 0, 0.3]} s={[0.8, 3.4, 0.8]} color={P.cadCyan} /><Edges geo={G.box} p={scope * 3 - 1.4} pos={[0.2, 0.9, 0]} s={[2.2, 0.1, 1.5]} color={P.dimensionGold} />
          <Label txt="LABFOR POLRI" color={P.cadWhite} w={4.4} pos={[0, -0.9, 0]} font="700 88px Arial" op={scope} />
        </group>
        <group position={[3.6, -2, 0]}>
          <Edges geo={G.box} p={lock * 2} pos={[0, 2, 0]} s={[3.6, 3.8, 0.3]} /><Edges geo={G.box} p={lock * 2} pos={[-1, 4.1, 0]} s={[1.6, 0.5, 0.3]} />
          <Edges geo={G.box} p={lock * 2 - 0.7} pos={[0, 1.8, 0.3]} s={[1.3, 1.1, 0.3]} color={P.stampCrimson} /><Edges geo={G.tor} p={lock * 2 - 1} pos={[0, 2.7, 0.3]} s={0.42} color={P.stampCrimson} />
          <Label txt="DOKUMEN PRIBADI" color={P.cadWhite} w={4.6} pos={[0, -0.9, 0]} font="700 74px Arial" op={lock} />
        </group>
      </group>
      {/* s4: compression map */}
      <group position={[ST[3], -0.6, 0]} scale={0.95}><primitive object={cells} /><Edges geo={G.box} p={lin(K.s4, K.s4 + 0.8, t)} color={P.cadCyan} s={[7, 8.6, 0.06]} pos={[0, 0.3, 0]} /></group>
      {/* s5: the burden moves across the beam */}
      <group position={[ST[4], 0, 0]}>
        <Edges geo={G.box} pos={[0, 0, 0]} s={[12, 0.35, 1.6]} p={lin(K.s5, K.s5 + 1, t)} />
        <Edges geo={G.arrow} pos={[0, -1, 0]} s={[1.6, 1.4, 1.6]} color={P.cadCyan} p={lin(K.s5 + 0.3, K.s5 + 1.3, t)} />
        <Edges geo={G.box} pos={[3.8 - burden * 7.6, 1.4, 0]} s={[2.4, 2.4, 2.4]} color={P.dimensionGold} />
        <Label txt="BUKTI" color={P.dimensionGold} w={2.1} pos={[3.8 - burden * 7.6, 1.4, 1.25]} font="700 150px Arial" />
        <Label txt="MENUDUH" color={P.cadWhite} w={4.2} pos={[-3.8, 3.5, 0]} font="700 110px Arial" op={burden} />
      </group>
      {/* s6: three reference sheets register onto the tested one; a ghost lab appears for the request */}
      <group position={[ST[5], 0, 0]}>
        <Sheet G={G.sheet} L={G.L} p={lin(K.s6, K.s6 + 1, t)} pos={[0, 2, 0]} />
        {[-1, 0, 1].map((i) => <Sheet key={i} G={G.sheet} L={G.L} color={P.cadCyan} p={align > 0 ? 1 : 0} pos={[i * 5 * (1 - align), 2 + (i === 0 ? 6 * (1 - align) : 0), 0.15 + (i + 1) * 0.1]} />)}
        <Label txt="IDENTIK (BARESKRIM)" color={P.cadCyan} w={6.6} pos={[0, -1, 0]} font="700 68px Arial" op={sm(at("s6:identik"), at("s6:identik") + 0.3, t)} />
        <Edges geo={G.box} pos={[0, -4.2, 0]} s={[7, 3, 2]} color={P.stampCrimson} p={indep} op={0.8} />
        <Label txt="UJI INDEPENDEN?" color={P.stampCrimson} w={6} pos={[0, -4.2, 1.1]} font="700 72px Arial" op={indep} />
      </group>
      {/* s7: a rubber stamp comes down */}
      <group position={[ST[6], 0, 0]}>
        <Sheet G={G.sheet} L={G.L} p={1} pos={[0, -0.6, 0]} />
        <group position={[0, 2 + press * 3.6, 0.3]}><Edges geo={G.box} pos={[0, 0, 0]} s={[3, 0.5, 1.4]} color={P.dimensionGold} /><Edges geo={G.cyl} pos={[0, 1.2, 0]} s={[0.4, 2, 0.4]} color={P.dimensionGold} /></group>
        <Label txt="SELESAI?" color={P.stampCrimson} w={3} pos={[0, -0.8, 0.2]} rot={[0, 0, -0.1]} font="700 150px Arial" op={t > pressT + 0.05 ? 1 : 0} />
      </group>
      {/* s8: an order field left blank, with a dashed gavel outline */}
      <group position={[ST[7], 0, 0]}>
        <Edges geo={G.box} pos={[0, 0, 0]} s={[11, 5.2, 0.12]} p={lin(K.s8, K.s8 + 1, t)} />
        <Label txt="PERINTAH HAKIM" color={P.textMuted} w={7} pos={[0, 1.2, 0.1]} font="700 74px Arial" op={sm(K.s8 + 0.5, K.s8 + 1, t)} />
        <Edges geo={G.box} pos={[0, -0.6, 0]} s={[8.4, 1.5, 0.05]} color={P.dimensionGold} p={lin(at("s8:apabila"), at("s8:apabila") + 0.8, t)} />
        <group position={[2.6, 5, 0]} scale={0.9} rotation={[0, 0, -0.45 + Math.sin(t * 0.7) * 0.03]}>
          <Edges geo={G.box} s={[4.6, 1.8, 1.6]} color={P.cadDim} op={0.8} /><Edges geo={G.cyl} pos={[0, -2.6, 0]} s={[0.3, 3.8, 0.3]} color={P.cadDim} op={0.8} />
        </group>
      </group>
    </Cine>
  );
};
