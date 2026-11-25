// EP02 ARSIP RUANG SIDANG (VINTAGEFORGE): a copperplate engraving of the court record, unrolled along one parchment. Sheets are abstract and carry no real name or layout.

import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { keys, sample } from "../../core/motion/track.ts";
import { Cine, sm, useClock } from "../shared/Cine.tsx";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { anchors, Captions, Label, Outro, pop, sceneT, type TL } from "./lib.tsx";
import tlData from "./tl/ep02.json";

const tl = tlData as TL;
export const SECONDS = tl.duration;
const INK = "#3A2413", PARCH = "#EBDDBC", RED = "#9C3B24", GOLD = "#8A6A24";
const ST = [0, 34, 70, 120, 156, 192, 228, 264];

const NOISE = `float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*n(p);p=p*2.03+vec2(5.,2.);a*=.5;}return s;}`;

// Tone from light, drawn as hatch lines that cross as it darkens. Lines live in screen space, like an engraver's plate.
const hatch = (paper: [number, number, number]) => new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: { px: { value: 1 } },
  vertexShader: "varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `varying vec3 vN;uniform float px;${NOISE}
  void main(){float l=abs(dot(normalize(vN),normalize(vec3(-.35,.35,.87))))*.95+.05;vec2 p=gl_FragCoord.xy/px;float w=fbm(p*.02)*6.;
  float a=sin((p.x+p.y+w)*1.4),b=sin((p.x-p.y+w)*1.4),c=sin((p.y+w)*1.9),k=0.;
  if(l<.72)k=max(k,smoothstep(.15,.7,a));if(l<.46)k=max(k,smoothstep(.15,.7,b));if(l<.24)k=max(k,smoothstep(0.,.6,c));
  gl_FragColor=vec4(mix(vec3(${paper.join(",")}),vec3(.2,.12,.06),k*.92),1.);}`,
});

const Mats = React.createContext<{ base: THREE.ShaderMaterial; red: THREE.ShaderMaterial }>(null as never);

const E: React.FC<{ geo: THREE.BufferGeometry; pos?: [number, number, number]; rot?: [number, number, number]; s?: number | [number, number, number]; red?: boolean }> = ({ geo, pos, rot, s = 1, red }) => {
  const M = React.useContext(Mats);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 34), [geo]);
  return (
    <group position={pos} rotation={rot} scale={s as number}>
      <mesh geometry={geo} material={red ? M.red : M.base} />
      <lineSegments geometry={edges}><lineBasicMaterial color={INK} toneMapped={false} /></lineSegments>
    </group>
  );
};

const gearGeo = (teeth: number, r: number) => {
  const s = new THREE.Shape();
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2, R = i % 2 ? r : r + 0.42;
    if (i === 0) s.moveTo(Math.cos(a0) * R, Math.sin(a0) * R); else s.lineTo(Math.cos(a0) * R, Math.sin(a0) * R);
    s.lineTo(Math.cos(a1) * R, Math.sin(a1) * R);
  }
  s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.22, 0, Math.PI * 2, true); s.holes.push(hole);
  return new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 12 });
};

const Parchment: React.FC<{ x: number }> = ({ x }) => {
  const m = useMemo(() => new THREE.ShaderMaterial({
    depthWrite: false, uniforms: { o: { value: 0 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vUv;uniform float o;${NOISE}void main(){vec2 u=vUv+vec2(o,0.);float g=fbm(u*vec2(30.,52.)),s=fbm(u*vec2(6.,10.)+3.);
    vec3 c=vec3(.90,.81,.62)*(.93+.14*g);c=mix(c,vec3(.62,.44,.25),smoothstep(.55,.82,s)*.28);float v=distance(vUv,vec2(.5));c*=1.-.42*smoothstep(.36,.78,v);gl_FragColor=vec4(c,1.);}`,
  }), []);
  m.uniforms.o.value = x * 0.004;
  return <mesh position={[x, 0, -30]} material={m}><planeGeometry args={[150, 190]} /></mesh>;
};

const Sheet: React.FC<{ txt: string; pos: [number, number, number]; rot?: [number, number, number]; s?: number; G: THREE.BufferGeometry }> = ({ txt, pos, rot, s = 1, G }) => (
  <group position={pos} rotation={rot} scale={s}>
    <E geo={G} />
    <Label txt={txt} color={INK} w={2.5} pos={[0, 1.15, 0.05]} font="italic 700 170px Georgia" />
    {[0.25, -0.1, -0.45, -0.8].map((y, i) => <mesh key={i} position={[-0.12 * (i % 2), y, 0.05]}><planeGeometry args={[i % 2 ? 1.7 : 2.1, 0.07]} /><meshBasicMaterial color={INK} toneMapped={false} /></mesh>)}
    <mesh position={[0.82, -1.45, 0.05]}><circleGeometry args={[0.28, 24]} /><meshBasicMaterial color={RED} toneMapped={false} /></mesh>
  </group>
);

const House: React.FC<{ w: number; h: number; G: Record<string, THREE.BufferGeometry>; pos: [number, number, number]; k: number }> = ({ w, h, G, pos, k }) => (
  <group position={pos} scale={[1, Math.max(0.001, k), 1]}>
    <E geo={G.box} pos={[0, h / 2, 0]} s={[w, h, 3]} />
    <E geo={G.roof} pos={[0, h + 0.75, 0]} rot={[0, Math.PI / 4, 0]} s={[w * 0.74, 1.5, 2.4]} />
    <E geo={G.box} pos={[0, 0.7, 1.55]} s={[0.9, 1.4, 0.1]} red />
    {Array.from({ length: Math.floor(w) }, (_, i) => <E key={i} geo={G.box} pos={[-w / 2 + 0.75 + i, h - 0.8, 1.55]} s={[0.42, 0.6, 0.08]} />)}
  </group>
);

const Rows: React.FC<{ items: [string, number][]; t: number }> = ({ items, t }) => (
  <>{items.map(([x, a], i) => {
    const k = sm(a, a + 0.3, t);
    return <div key={i} style={{ opacity: k, transform: `translateX(${(1 - k) * 34}px)`, fontFamily: "Georgia, serif", fontSize: 44, lineHeight: 1.18, color: INK, borderBottom: `2px solid ${INK}55`, padding: "6px 2px 8px" }}>{x}</div>;
  })}</>
);

export const Film: React.FC = () => {
  const { t } = useClock();
  const { width } = useVideoConfig();
  const at = useMemo(() => anchors(tl), []), K = useMemo(() => sceneT(tl), []);
  const M = useMemo(() => ({ base: hatch([0.97, 0.91, 0.77]), red: hatch([0.72, 0.36, 0.22]) }), []);
  M.base.uniforms.px.value = M.red.uniforms.px.value = (width / 1080) * 1.9;
  const G = useMemo(() => ({
    sheet: new THREE.BoxGeometry(3.1, 4.3, 0.06), box: new THREE.BoxGeometry(1, 1, 1), roof: new THREE.ConeGeometry(1, 1, 4),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 28), gear1: gearGeo(18, 3.1), gear2: gearGeo(12, 2.05),
    ring: new THREE.TorusGeometry(2, 0.2, 12, 56), trunk: new THREE.CylinderGeometry(0.5, 0.75, 6, 12), crown: new THREE.IcosahedronGeometry(3.4, 1),
    page: new THREE.BoxGeometry(6, 0.5, 8), feather: new THREE.ConeGeometry(0.42, 6, 10),
  }), []);

  const up = sm(at("s1:mengangkat") - 0.2, at("s1:mengangkat") + 0.7, t);
  const pol = pop(at("s2:SMA"), t), bag = pop(at("s2:SD"), t);
  const lid = sm(at("s2:SMA") - 0.1, at("s2:SMA") + 0.5, t);
  const b = ["s3:SD", "s3:SMP", "s3:SMA", "s3:Fakultas"].map((a) => pop(at(a) - 0.1, t, 0.55));
  const g1 = pop(at("s4:Ujian"), t), g2 = pop(at("s4:Ijazah"), t), g3 = pop(at("s4:Wisuda"), t);
  const yrs = [["2005", "s5:2005", 0], ["2010", "s5:2005", 0.35], ["2012", "s5:2005", 0.7], ["2014", "s5:2019", -0.7], ["2019", "s5:2019", 0]] as const;
  const glass = [at("s6:bawah"), at("s6:watermark"), at("s6:fotonya")];
  const gi = t < glass[1] ? 0 : t < glass[2] ? 1 : 2;
  const spots: [number, number][] = [[-0.3, 1.3], [1.5, 4.4], [-1.6, 6.3]];
  const gl = sm(glass[gi] - 0.45, glass[gi], t);
  const prev = spots[Math.max(0, gi - 1)], cur = spots[gi];
  const gx = prev[0] + (cur[0] - prev[0]) * gl, gy = prev[1] + (cur[1] - prev[1]) * gl;
  const a1 = pop(at("s7:tanpa") - 0.1, t), a2 = pop(at("s7:mengizinkan") - 0.1, t);
  const quill = sm(K.s8, K.s8 + 1, t);
  const shelf = sm(at("s8:mencatatnya"), at("s8:mencatatnya") + 0.5, t);

  const CAM = useMemo(() => keys(
    [0, 0, 7.5, 27, 0, 5.8, 0, 32], [K.s1 + 5, 0.3, 7.4, 28, 0.1, 6.2, 0, 32], [K.s2 - 0.1, 2, 7.6, 28, 1.8, 6.2, 0, 32],
    [K.s2 + 0.9, ST[1], 8, 27, ST[1], 5, 0, 32], [K.s3 - 0.1, ST[1] + 0.8, 7.5, 25, ST[1] + 0.7, 5, 0, 32],
    [K.s3 + 0.9, ST[2] - 4, 7, 29, ST[2] - 4, 4.6, 0, 32], [at("s3:SD") + 0.1, ST[2] - 3, 7, 29, ST[2] - 3, 4.6, 0, 32], [at("s3:SMP"), ST[2] - 2, 7.2, 29, ST[2] - 2, 4.7, 0, 32], [at("s3:SMA") + 0.2, ST[2] + 9, 7.5, 30, ST[2] + 9, 5, 0, 32],
    [at("s3:Fakultas") + 0.3, ST[2] + 20, 8.5, 32, ST[2] + 20, 6, 0, 32], [K.s4 - 0.1, ST[2] + 23, 8.8, 33, ST[2] + 23, 6, 0, 32],
    [K.s4 + 0.9, ST[3], 5, 30, ST[3], 2.2, 0, 32], [K.s5 - 0.1, ST[3] + 1, 5.5, 28, ST[3] + 1, 2.2, 0, 32],
    [K.s5 + 0.9, ST[4], 9, 34, ST[4], 5.6, 0, 32], [K.s6 - 0.1, ST[4] + 1.6, 9, 33, ST[4] + 1.6, 6, 0, 32],
    [K.s6 + 0.9, ST[5], 6, 26, ST[5], 3.8, 0, 32], [K.s7 - 0.1, ST[5], 6, 24, ST[5], 3.8, 0, 32],
    [K.s7 + 0.9, ST[6], 7.5, 30, ST[6], 5.4, 0, 32], [K.s8 - 0.1, ST[6] + 1, 7.5, 28, ST[6] + 1, 5.4, 0, 32],
    [K.s8 + 0.9, ST[7], 26, 19, ST[7], 1.6, 0, 32], [tl.duration, ST[7], 25, 16, ST[7], 1.4, 0, 32],
  ), [at, K]);
  const cam0 = sample(CAM, t);
  const cam = [cam0[0], cam0[1], cam0[2] * 2, cam0[3], cam0[4], cam0[5], cam0[6]];

  const scene = tl.scenes.filter((s) => t >= s.start - 0.15).length;
  const head: Record<number, React.ReactNode> = {
    1: <><div style={{ fontFamily: `'${FONT.display}'`, fontSize: 88, lineHeight: 1.04, color: INK }}>JOKOWI AKHIRNYA TUNJUKKAN IJAZAH SD HINGGA S1</div><div style={{ marginTop: 10, fontFamily: `'${FONT.serif}'`, fontStyle: "italic", fontSize: 46, color: RED }}>Ini fakta di ruang sidang</div></>,
    2: <><Tk>Status dokumen</Tk><Rows t={t} items={[["SMA & S1: di tangan jaksa", at("s2:SMA")], ["SD & SMP: dibawa sendiri", at("s2:SD")]]} /></>,
    3: <><Tk>Keterangan di bawah sumpah</Tk><Rows t={t} items={[["SD Negeri 111 Surakarta", at("s3:SD")], ["SMP Negeri 1", at("s3:SMP")], ["SMA Negeri 6", at("s3:SMA")], ["Fak. Kehutanan UGM, 1980", at("s3:Fakultas")]]} /></>,
    4: <><Tk>Tiga tanggal, 1985</Tk><Rows t={t} items={[["23 Okt: ujian skripsi", at("s4:Ujian")], ["5 Nov: ijazah terbit", at("s4:Ijazah")], ["19 Nov: wisuda", at("s4:Wisuda")]]} /></>,
    5: <><Tk>Menurut keterangan Jokowi</Tk><Rows t={t} items={[["Judul skripsi diajukan 3 kali", at("s5:Judul")], ["Ditunjukkan ke KPU: Solo 2005 & 2010, Jakarta 2012, Pilpres 2014 & 2019", at("s5:ditunjukkan")]]} /></>,
    6: <><Tk>Bantahan Roy Suryo</Tk><Rows t={t} items={[["Beda dengan 15 Des 2025?", at("s6:beda")], ["Kertas, watermark, foto", at("s6:bawah")]]} /></>,
    7: <><Tk>Masih diperdebatkan</Tk><Rows t={t} items={[["Refly: tanpa izin hakim", at("s7:tanpa")], ["BBC, Kompas: hakim mengizinkan", at("s7:mengizinkan")]]} /></>,
    8: <><Tk>Status 5 Nov 2026</Tk><div style={{ fontFamily: `'${FONT.display}'`, fontSize: 104, lineHeight: 1.04, color: INK, opacity: sm(at("s8:Hakim"), at("s8:Hakim") + 0.3, t) }}>BELUM ADA <span style={{ color: RED }}>PUTUSAN</span></div></>,
  };
  const pk = sm(tl.scenes[scene - 1]?.start - 0.15, tl.scenes[scene - 1]?.start + 0.25, t);
  const overlay = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 56, top: 186, fontFamily: `'${FONT.sans}'`, fontWeight: 600, fontSize: 22, color: INK, opacity: 0.8 }}>ILUSTRASI UKIRAN · SIDANG MASIH BERJALAN</div>
      <div style={{ position: "absolute", left: 56, right: 110, top: 226, opacity: pk, transform: `translateY(${(1 - pk) * -18}px)` }}>{head[scene]}</div>
      <Captions tl={tl} t={t} box={{ background: "#F3E8CC", border: `3px solid ${INK}`, padding: "10px 18px 14px" }} text={{ fontFamily: "Georgia, serif", fontSize: 50, lineHeight: 1.16 }} active={RED} ink={INK} />
      <Outro tl={tl} t={t} line="KASUS IJAZAH · FAKTA RUANG SIDANG" />
    </div>
  );

  return (
    <Mats.Provider value={M}>
      <Cine bg="#E0CEA2" cam={cam} bloom={[0, 0.1, 1]} far={260} overlay={overlay}>
        <Parchment x={cam[0]} />
        {/* s1: four sheets lift from one baseline */}
        <group position={[ST[0], 0, 0]}>
          <E geo={G.box} pos={[0, 0.3, 0]} s={[15, 0.6, 5]} />
          <E geo={G.box} pos={[0, 0.95, 0]} s={[12, 0.7, 3.4]} />
          {["SD", "SMP", "SMA", "S1"].map((x, i) => <Sheet key={x} G={G.sheet} txt={x} pos={[(i - 1.5) * 3.4, 1.4 + 1 + up * (4 + Math.abs(i - 1.5) * -0.5), 0.6]} rot={[0, 0, (1.5 - i) * 0.07 * up]} s={0.85 + 0.15 * up} />)}
        </group>
        {/* s2: chest for the seized pair, satchel for the rest */}
        <group position={[ST[1], 0, 0]}>
          <group position={[-3.6, 0, 0]}>
            <E geo={G.box} pos={[0, 1.4, 0]} s={[5, 2.8, 3.4]} />
            <group position={[0, 2.8, -1.7]} rotation={[-1.75 * lid, 0, 0]}><E geo={G.box} pos={[0, 0.25, 1.7]} s={[5.1, 0.5, 3.5]} /></group>
            {[-1.6, 1.6].map((x) => <E key={x} geo={G.box} pos={[x, 1.4, 1.75]} s={[0.3, 2.9, 0.1]} red />)}
            <Sheet G={G.sheet} txt="SMA" pos={[-1.1, 3.2 + pol * 2, 0]} s={0.86} />
            <Sheet G={G.sheet} txt="S1" pos={[1.1, 3.2 + pol * 2, 0]} s={0.86} />
          </group>
          <group position={[3.8, 0, 0]}>
            <E geo={G.box} pos={[0, 1.3, 0]} s={[4.6, 2.6, 1.7]} />
            <E geo={G.ring} pos={[0, 2.9, 0]} s={[0.55, 0.55, 0.55]} />
            <Sheet G={G.sheet} txt="SD" pos={[-1, 2.8 + bag * 2.4, 0]} s={0.82} />
            <Sheet G={G.sheet} txt="SMP" pos={[1, 2.8 + bag * 2.4, 0]} s={0.82} />
          </group>
        </group>
        {/* s3: the road from Solo to Yogyakarta */}
        <group position={[ST[2], 0, 0]}>
          <E geo={G.box} pos={[10, 0.1, 3]} s={[50, 0.2, 2.2]} />
          <House G={G} w={5} h={3} pos={[-3, 0, -0.4]} k={b[0]} />
          <House G={G} w={7} h={4.4} pos={[9, 0, -0.4]} k={b[1]} />
          <group scale={[1, 1, 1]}><House G={G} w={8} h={5.6} pos={[21, 0, -0.4]} k={b[2]} /></group>
          <group position={[33, 0, 0]} scale={Math.max(0.001, b[3]) * 0.8}>
            <E geo={G.trunk} pos={[0, 3, -0.4]} /><E geo={G.crown} pos={[0, 8, -0.4]} />
            <E geo={G.trunk} pos={[-5, 2.2, -2]} s={0.74} /><E geo={G.crown} pos={[-5, 6, -2]} s={0.72} />
            <E geo={G.trunk} pos={[5, 2.2, -2]} s={0.74} /><E geo={G.crown} pos={[5, 6, -2]} s={0.72} />
          </group>
        </group>
        {/* s4: three dates meshed like one mechanism */}
        <group position={[ST[3], 1.4, 0]}>
          {[[-3.6, 3.5, G.gear1, g1, 1, "23 OKT"], [2.2, 0.3, G.gear2, g2, -1.5, "5 NOV"], [-1.2, -3.8, G.gear2, g3, 1.5, "19 NOV"]].map(([x, y, g, k, dir, lb], i) => (
            <group key={i} position={[x as number, y as number, 0]} scale={Math.max(0.001, k as number)}>
              <group rotation={[0, 0, (t * 0.5) * (dir as number)]}><E geo={g as THREE.BufferGeometry} /></group>
              <Label txt={lb as string} color={INK} w={3.3} pos={[0, 0, 0.7]} font="700 150px Georgia" bg="#EBDDBC" />
            </group>
          ))}
        </group>
        {/* s5: rising columns, one per election the witness listed */}
        <group position={[ST[4], 0, 0]}>
          {t < at("s5:ditunjukkan") ? ["1", "2", "3"].map((x, i) => <Sheet key={x} G={G.sheet} txt={x} pos={[(i - 1) * 4.4, 5, 3]} s={Math.max(0.001, pop(at("s5:tiga") + i * 0.12, t) * 1.1)} />) : null}
          <E geo={G.box} pos={[0, 0.2, 0]} s={[17.4, 0.4, 6]} />
          {yrs.map(([y, a, off], i) => {
            const k = pop(at(a) + off, t, 0.5), h = 2.6 + i * 1.7;
            return <group key={y} position={[-6.8 + i * 3.4, 0.4, 0]} scale={[1, Math.max(0.001, k), 1]}>
              <E geo={G.cyl} pos={[0, h / 2, 0]} s={[1.3, h, 1.3]} /><E geo={G.box} pos={[0, h + 0.2, 0]} s={[3.2, 0.4, 3.2]} />
              <Label txt={y} color={INK} w={3.3} pos={[0, h + 1, 0.2]} font="700 170px Georgia" />
            </group>;
          })}
        </group>
        {/* s6: magnifier on the disputed details */}
        <group position={[ST[5], 0, 0]}>
          <group position={[0, 4.6, 0]} scale={2.1}><Sheet G={G.sheet} txt="?" pos={[0, 0, 0]} /></group>
          <group position={[gx, gy, 2.2]}>
            <mesh geometry={G.ring}><meshBasicMaterial color={INK} toneMapped={false} /></mesh>
            <mesh position={[1.9, -2.3, 0]} rotation={[0, 0, 0.7]}><boxGeometry args={[0.42, 3, 0.2]} /><meshBasicMaterial color={INK} toneMapped={false} /></mesh>
          </group>
        </group>
        {/* s7: a signpost that points both ways */}
        <group position={[ST[6], 0, 0]}>
          <E geo={G.cyl} pos={[0, 5, 0]} s={[0.36, 10, 0.36]} /><E geo={G.box} pos={[0, 0.2, 0]} s={[7, 0.4, 5]} />
          <group position={[-3.5, 8, 0.45]} scale={[Math.max(0.001, a1), 1, 1]}><E geo={G.box} s={[7.6, 1.9, 0.26]} red /><Label txt="TANPA IZIN" color="#fff" w={6.8} pos={[0, 0, 0.16]} font="700 96px Georgia" /></group>
          <group position={[3.5, 5.3, 0.45]} scale={[Math.max(0.001, a2), 1, 1]}><E geo={G.box} s={[7.6, 1.9, 0.26]} /><Label txt="DIIZINKAN" color={INK} w={6.8} pos={[0, 0, 0.16]} font="700 96px Georgia" /></group>
        </group>
        {/* s8: the open ledger with nothing written on the verdict page */}
        <group position={[ST[7], 0, 0]}>
          <group rotation={[0.1, 0, 0.05]} position={[-3, 0.6, 0]}><E geo={G.page} /></group>
          <group rotation={[0.1, 0, -0.05]} position={[3, 0.6, 0]}><E geo={G.page} /></group>
          <mesh position={[-3, 0.98, 0.25]} rotation={[-1.47, 0.05, 0.05]}><planeGeometry args={[5.5, 7.4]} /><meshBasicMaterial color="#F3E8CC" toneMapped={false} /></mesh>
          <mesh position={[3, 0.98, 0.25]} rotation={[-1.47, -0.05, -0.05]}><planeGeometry args={[5.5, 7.4]} /><meshBasicMaterial color="#F3E8CC" toneMapped={false} /></mesh>
          <Label txt="KETERANGAN DITOLAK" color={INK} w={4.7} pos={[-3, 1.08, 0.3]} rot={[-1.47, 0, 0]} font="italic 700 50px Georgia" op={shelf} />
          <Label txt="PUTUSAN: ......" color={GOLD} w={4.7} pos={[3, 1.08, 0.3]} rot={[-1.47, 0, 0]} font="italic 700 62px Georgia" op={sm(at("s8:Hakim"), at("s8:Hakim") + 0.4, t)} />
          <group position={[7.6 - quill * 0.5, 5.2 - quill * 0.3 + Math.sin(t * 0.9) * 0.1, 1]} rotation={[0, 0, -0.62]}><E geo={G.feather} red /></group>
        </group>
      </Cine>
    </Mats.Provider>
  );
};

const Tk: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontFamily: `'${FONT.sans}'`, fontWeight: 700, fontSize: 28, letterSpacing: "0.04em", color: RED, textTransform: "uppercase", marginBottom: 4 }}>{children}</div>;
void PARCH;
