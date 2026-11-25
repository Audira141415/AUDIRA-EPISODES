// EP052 film (NANOFORGE): "Minyak jelantah bisa diubah menjadi bahan bakar pesawat?"
// Audio Master Clock: every cut, beat and caption reads timeline.json (VO seconds).
// Worlds: kitchen wok (hook) -> molecular world (triglyceride vs alkane, oxygen) -> filter ->
// hydroprocessing reactor (H2 + catalyst pellets) -> molecular HDO (O leaves as H2O, chains cut and
// branched) -> distillation column -> SAF -> blend tank (max 50 %) -> airliner (not pure) ->
// refinery co-processing -> runway take-off -> cover world -> wok question -> AUDIRA outro.
// Deterministic: everything is a function of the frame; layouts use a fixed hash.

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig, FX_LAYER, Post, type Shot } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { Airliner, Bokeh, CoverScene, Env, MolMesh, PAL, SHOT as COVER_SHOT, Stream, hash, useKit, type Kit } from "./Cover.tsx";
import { buildAlkane, buildBranched, buildH2, buildTriglyceride, buildWater, LEN, type Mol } from "./molecules.ts";

// ---------------------------------------------------------------- clock
type Clip = { id: string; words: { w: string; s: number; e: number }[] };
const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
export const FILM_TOTAL = (TL as unknown as { total: number }).total;

const T = {
  bisa: W("l01", 5),
  tangki: W("l01", 8),
  tanya: W("l02", 0),
  konteks: SEC.KONTEKS[0],
  avtur: W("l03", 2),
  rantai: W("l03", 6),
  bedanya: W("l04", 0),
  oksigen: W("l04", 4),
  mek: SEC.MEKANISME[0],
  kotoran: W("l05", 4),
  air1: W("l05", 6),
  lalu: W("l06", 0),
  hidrogen: W("l06", 3),
  katalis: W("l06", 5),
  oks: W("l07", 0),
  air2: W("l07", 3),
  danCut: W("l07", 4),
  dipotong: W("l07", 6),
  dibentuk: W("l07", 8),
  mirip: W("l07", 11),
  terakhir: W("l08", 0),
  distilasi: W("l08", 4),
  reveal: SEC.REVEAL[0],
  saf: W("l09", 3),
  aturan: W("l10", 0),
  setengah: W("l10", 6),
  jalur: W("l10", 8),
  pesawat: W("l11", 0),
  murni: W("l11", 5),
  payoff: SEC.PAYOFF[0],
  minyakBumi: W("l12", 6),
  cilacap: W("l12", 10),
  danPes: W("l12", 11),
  agustus: W("l12", 17),
  outro: SEC.OUTRO[0],
  masa: W("l13", 7),
  tanya2: W("l14", 0),
  card: SEC.OUTRO[1] + 0.2,
};

// ---------------------------------------------------------------- helpers
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
type V3 = [number, number, number];
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
type Cam = { pos: V3; target: V3; fov?: number };
const lens = (c: Cam, o: Partial<Shot> = {}): Shot => {
  const d = Math.hypot(c.pos[0] - c.target[0], c.pos[1] - c.target[1], c.pos[2] - c.target[2]);
  return { pos: c.pos, target: c.target, fov: c.fov ?? 40, focus: d, aperture: 0.0012, maxBlur: 0.006, exposure: 1.05, ...o };
};
const camLerp = (a: Cam, b: Cam, k: number): Cam => ({ pos: mix3(a.pos, b.pos, k), target: mix3(a.target, b.target, k), fov: mix(a.fov ?? 40, b.fov ?? 40, k) });

// ---------------------------------------------------------------- shared 3D bits
/** View-independent gradient sky dome (bottom -> mid -> top). */
const Dome: React.FC<{ bottom: string; mid: string; top: string }> = ({ bottom, mid, top }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uB: { value: new THREE.Color() }, uM: { value: new THREE.Color() }, uT: { value: new THREE.Color() } },
        vertexShader: /* glsl */ `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `uniform vec3 uB; uniform vec3 uM; uniform vec3 uT; varying vec3 vP;
          void main(){ float y = vP.y; vec3 c = mix(uB, uM, smoothstep(-0.5, 0.05, y)); c = mix(c, uT, smoothstep(0.05, 0.6, y)); gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  (mat.uniforms.uB.value as THREE.Color).set(bottom);
  (mat.uniforms.uM.value as THREE.Color).set(mid);
  (mat.uniforms.uT.value as THREE.Color).set(top);
  return (
    <mesh scale={90}>
      <sphereGeometry args={[1, 48, 24]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};

const steel = (color = "#8b939c", rough = 0.38, metal = 0.85) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, side: THREE.DoubleSide });

/** Generic narrow-body airliner (no livery, no logos). Nose points +x, ~7.7 units long. */
const Airliner3D: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const g = useMemo(() => {
    // fuselage: lathe along y (tail -> nose), rotated so +y becomes +x
    const prof: [number, number][] = [
      [0.0, -4.05], [0.1, -4.0], [0.2, -3.75], [0.31, -3.35], [0.4, -2.8], [0.45, -2.2], [0.46, -1.0], [0.46, 2.3],
      [0.44, 2.75], [0.4, 3.05], [0.33, 3.3], [0.24, 3.48], [0.13, 3.6], [0.0, 3.66],
    ];
    const fus = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48);
    const wing = new THREE.Shape([new THREE.Vector2(0.95, 0), new THREE.Vector2(-0.75, 0), new THREE.Vector2(-2.0, 3.75), new THREE.Vector2(-1.5, 3.75)]);
    const stab = new THREE.Shape([new THREE.Vector2(-2.85, 0), new THREE.Vector2(-3.55, 0), new THREE.Vector2(-4.0, 1.35), new THREE.Vector2(-3.68, 1.35)]);
    const fin = new THREE.Shape([new THREE.Vector2(-2.55, 0.3), new THREE.Vector2(-3.75, 0.3), new THREE.Vector2(-4.1, 1.95), new THREE.Vector2(-3.6, 1.95)]);
    const winglet = new THREE.Shape([new THREE.Vector2(-1.5, 0), new THREE.Vector2(-2.0, 0), new THREE.Vector2(-2.2, 0.5), new THREE.Vector2(-2.0, 0.5)]);
    const ex = (s: THREE.Shape, d: number) => new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    const nac = new THREE.LatheGeometry(
      [[0.2, -0.55], [0.24, -0.45], [0.25, 0.2], [0.24, 0.4], [0.2, 0.45]].map(([r, y]) => new THREE.Vector2(r, y)),
      32,
    );
    // cabin windows: two instanced rows
    const winGeo = new THREE.SphereGeometry(1, 8, 6);
    const winMat = new THREE.MeshStandardMaterial({ color: "#0b1320", roughness: 0.15, metalness: 0.6 });
    const n = 30;
    const wins = new THREE.InstancedMesh(winGeo, winMat, n * 2);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++)
      for (const side of [0, 1]) {
        m4.compose(new THREE.Vector3(-2.15 + i * 0.16, 0.13, side ? 0.455 : -0.455), new THREE.Quaternion(), new THREE.Vector3(0.045, 0.06, 0.012));
        wins.setMatrixAt(i * 2 + side, m4);
      }
    return { fus, wing: ex(wing, 0.07), stab: ex(stab, 0.05), fin: ex(fin, 0.06), winglet: ex(winglet, 0.03), nac, wins };
  }, []);
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: dark ? "#1b2433" : "#e3e7ec", roughness: 0.3, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.15 }), [dark]);
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: dark ? "#121925" : "#a3abb5", roughness: 0.35, metalness: 0.7 }), [dark]);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0a1220", roughness: 0.05, metalness: 0.3, clearcoat: 1 }), []);
  return (
    <group>
      <mesh geometry={g.fus} material={paint} rotation={[0, 0, -Math.PI / 2]} castShadow />
      {dark ? null : <primitive object={g.wins} />}
      {/* cockpit windscreen */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={glass} position={[3.2, 0.2, s * 0.16]} rotation={[s * 0.35, s * -0.25, -0.75]}>
          <boxGeometry args={[0.24, 0.02, 0.2]} />
        </mesh>
      ))}
      {/* wings with slight dihedral + winglets (shape y -> world z) */}
      {[1, -1].map((s) => (
        <group key={s} position={[0, -0.22, 0]} rotation={[s * (Math.PI / 2 - 0.08), 0, 0]}>
          <mesh geometry={g.wing} material={paint} castShadow />
          <mesh geometry={g.winglet} material={paint} position={[0, 3.72, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          {/* engine on a pylon, under the wing */}
          <group position={[0.35, 1.35, s > 0 ? 0.42 : -0.42]}>
            <mesh material={grey} position={[-0.15, 0, s > 0 ? -0.2 : 0.2]}>
              <boxGeometry args={[0.7, 0.06, 0.25]} />
            </mesh>
            <mesh geometry={g.nac} material={paint} rotation={[0, 0, -Math.PI / 2]} castShadow />
            <mesh material={grey} position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.19, 0.19, 0.04, 24]} />
            </mesh>
          </group>
        </group>
      ))}
      {[1, -1].map((s) => (
        <mesh key={`s${s}`} geometry={g.stab} material={paint} position={[0, 0.14, 0]} rotation={[s * (Math.PI / 2 - 0.05), 0, 0]} />
      ))}
      <mesh geometry={g.fin} material={paint} position={[0, 0.0, -0.03]} />
    </group>
  );
};

/** Additive glow sphere on the FX layer. */
const Glow: React.FC<{ p: V3; r: number; color: string; a: number }> = ({ p, r, color, a }) =>
  a <= 0.001 ? null : (
    <mesh position={p} layers={FX_LAYER}>
      <sphereGeometry args={[r, 20, 14]} />
      <meshBasicMaterial color={color} transparent opacity={a} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );

const MolLights: React.FC<{ warm?: number }> = ({ warm = 1 }) => (
  <>
    <Env />
    <ambientLight color="#0d2448" intensity={0.6} />
    <directionalLight position={[3, 9, 7]} color="#dbe6ff" intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[-0.5, -3.2, 2.0]} color={PAL.gold} intensity={26 * warm} distance={9} decay={1.6} />
    <pointLight position={[0.5, 4.6, 2.5]} color={PAL.cyan} intensity={22} distance={9} decay={1.6} />
    <pointLight position={[-4, 1.0, -2.5]} color={PAL.teal} intensity={10} distance={8} />
    <pointLight position={[4.5, -1.5, -1.5]} color="#ff8a3d" intensity={8} distance={8} />
  </>
);

// ---------------------------------------------------------------- KITCHEN (hook, outro question)
const Wok: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * 3.05;
      pts.push(new THREE.Vector2(x, (x / 3) ** 2 - 0.07));
    }
    pts.push(new THREE.Vector2(3.14, 1.04));
    for (let i = 24; i >= 0; i--) {
      const x = (i / 24) * 3.0;
      pts.push(new THREE.Vector2(x, (x / 3) ** 2));
    }
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  const metal = useMemo(() => steel("#2f3338", 0.42, 0.85), []);
  const bubbles = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ a: hash(i + 3) * Math.PI * 2, r: Math.sqrt(hash(i + 9)) * 1.75, ph: hash(i + 21), s: 0.025 + hash(i + 40) * 0.05 })), []);
  return (
    <group>
      <mesh geometry={geo} material={metal} castShadow receiveShadow />
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={metal} position={[sx * 3.35, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.055, 12, 24, Math.PI]} />
        </mesh>
      ))}
      {/* used cooking oil: dark amber, slightly cloudy */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.94, 96]} />
        <meshPhysicalMaterial color="#6a3f0a" emissive="#3a1c02" emissiveIntensity={0.6} roughness={0.07} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.4} />
      </mesh>
      {bubbles.map((b, i) => {
        const cyc = (t * 0.9 + b.ph) % 1;
        const sc = Math.sin(cyc * Math.PI);
        return (
          <mesh key={i} position={[Math.cos(b.a) * b.r, 0.42, Math.sin(b.a) * b.r]} scale={b.s * (0.3 + sc)}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshPhysicalMaterial color="#c58a2a" roughness={0.05} clearcoat={1} transparent opacity={0.8} />
          </mesh>
        );
      })}
      {/* stove: counter, burner ring and blue flames */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#17140f" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={metal}>
        <torusGeometry args={[1.1, 0.09, 12, 48]} />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const fl = 0.85 + 0.15 * Math.sin(t * 13 + i * 1.7);
        return (
          <mesh key={i} position={[Math.cos(a) * 1.1, -0.38, Math.sin(a) * 1.1]} scale={[1, fl, 1]} layers={FX_LAYER}>
            <coneGeometry args={[0.07, 0.32, 8]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Plastic collection bottle half full of jelantah (outro question). */
const Bottle: React.FC = () => {
  const geo = useMemo(() => {
    const prof = [
      [0, 0], [0.62, 0], [0.68, 0.08], [0.68, 1.9], [0.5, 2.35], [0.24, 2.55], [0.24, 2.85], [0, 2.85],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(prof, 48);
  }, []);
  return (
    <group position={[4.2, -0.75, -0.6]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#e8eef2" roughness={0.18} transmission={0.6} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.63, 0.6, 1.2, 40]} />
        <meshPhysicalMaterial color="#6a3f0a" emissive="#3a1c02" emissiveIntensity={0.5} roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0, 2.92, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.16, 24]} />
        <meshStandardMaterial color="#d24a2a" roughness={0.5} />
      </mesh>
    </group>
  );
};

const KitchenWorld: React.FC<{ t: number; question?: boolean }> = ({ t, question }) => {
  // droplet lifts out of the oil from 1.8 s and rises toward the sky
  const rise = ss(1.7, T.tanya, t);
  const dropY = mix(0.42, 2.9, rise);
  const dropS = ss(1.6, 2.2, t);
  const planeK = clamp01((t - (T.tangki - 0.9)) / 2.4);
  const sky = ss(T.tangki - 1.0, T.tangki + 0.4, t);
  return (
    <>
      <Env />
      <Dome bottom="#0b0704" mid={sky > 0 && !question ? "#120d0b" : "#0d0906"} top={question ? "#0d1426" : `rgb(${Math.round(mix(14, 30, sky))},${Math.round(mix(12, 66, sky))},${Math.round(mix(10, 98, sky))})`} />
      <ambientLight color="#2a1a0c" intensity={0.5} />
      <directionalLight position={[-4, 8, 5]} color="#ffd9a8" intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, -0.2, 0]} color="#4f8cff" intensity={6} distance={4} />
      <pointLight position={[3, 3.5, 3]} color={PAL.gold} intensity={14} distance={10} decay={1.6} />
      <pointLight position={[-3, 4, -3]} color={PAL.cyan} intensity={6} distance={10} />
      <Wok t={t} />
      {question ? <Bottle /> : null}
      {!question && dropS > 0 ? (
        <group position={[0, dropY, 0]} scale={[0.32 * dropS, 0.32 * dropS * (1 + 0.25 * Math.sin(rise * Math.PI)), 0.32 * dropS]}>
          <mesh>
            <sphereGeometry args={[1, 48, 32]} />
            <meshPhysicalMaterial color="#c98a12" emissive="#7a4002" emissiveIntensity={0.8} roughness={0.05} clearcoat={1} transparent opacity={0.92} envMapIntensity={1.6} />
          </mesh>
          <Glow p={[0, 0, 0]} r={1.12} color={PAL.gold} a={0.07} />
        </group>
      ) : null}
      {!question && planeK > 0 && planeK < 1 ? (
        <group position={[mix(-16, 12, planeK), 9 + planeK * 2.5, -22]} rotation={[0, 0, 0.18]}>
          <Airliner3D dark />
        </group>
      ) : null}
    </>
  );
};

const kitchenShot = (t: number): Shot => {
  const a: Cam = { pos: [0, 7.0, 10.5], target: [0, 0.2, 0] };
  const b: Cam = { pos: [0.4, 4.4, 7.0], target: [0, 1.0, 0] };
  const c: Cam = { pos: [0.2, 2.6, 3.4], target: [0, 3.2, 0] };
  const d: Cam = { pos: [0, 2.9, 0.42], target: [0, 2.9, -1] };
  let cam: Cam;
  if (t < T.bisa) cam = camLerp(a, b, ss(0, T.bisa, t));
  else if (t < T.tanya) cam = camLerp(b, c, ss(T.bisa, T.tanya, t));
  else cam = camLerp(c, d, ss(T.tanya, T.tanya + 0.6, t));
  return lens(cam, { aperture: 0.002, maxBlur: 0.008 });
};

// ---------------------------------------------------------------- MOLECULAR WORLD
const TG_POS: V3 = [-1.55, -1.9, 0.6];
const TG_ROT: V3 = [0.22, -0.42, 0.06];

const useMolecules = () =>
  useMemo(() => {
    const tg = buildTriglyceride();
    const oIdx = tg.atoms.map((a, i) => (a.el === "O" ? i : -1)).filter((i) => i >= 0);
    // glycerol = atoms 0..2 and their hydrogens (leaves as propane after the oxygens are removed)
    const gly = new Set<number>([0, 1, 2]);
    for (const b of tg.bonds) {
      if (b.a <= 2 && tg.atoms[b.b].el === "H") gly.add(b.b);
      if (b.b <= 2 && tg.atoms[b.a].el === "H") gly.add(b.a);
    }
    const centroid = tg.atoms.reduce((s, a) => s.add(a.p), new THREE.Vector3()).multiplyScalar(1 / tg.atoms.length);
    return {
      tg,
      oIdx,
      oSet: new Set(oIdx),
      gly,
      noOGly: new Set([...oIdx, ...gly]),
      centroid,
      avtur: buildAlkane(12),
      c16: buildAlkane(16),
      c18: buildAlkane(18),
      c8: buildAlkane(8),
      c10: buildAlkane(10),
      iso8: buildBranched(8, 2),
      iso10: buildBranched(10, 3),
      water: buildWater(),
      h2: buildH2(),
      c12: buildAlkane(12),
      iso11: buildBranched(11, 4),
      c9: buildAlkane(9),
    };
  }, []);
type MolSet = ReturnType<typeof useMolecules>;

/** Additive halos on chosen atoms (e.g. the carbon wave or the oxygens). */
const AtomHalos: React.FC<{ mol: Mol; idx: number[]; amp: (i: number, k: number) => number; color: string; r: number }> = ({ mol, idx, amp, color, r }) => (
  <>
    {idx.map((ai, k) => {
      const p = mol.atoms[ai].p;
      return <Glow key={ai} p={[p.x, p.y, p.z]} r={r} color={color} a={amp(ai, k)} />;
    })}
  </>
);

/** HOOK tail + KONTEKS: triglyceride appears, avtur alkane for comparison, carbon wave, oxygen highlight. */
const MolIntro: React.FC<{ t: number; f: number; kit: Kit; M: MolSet }> = ({ t, f, kit, M }) => {
  const av = ss(T.avtur - 0.1, T.avtur + 0.5, t);
  const wave = (t - T.rantai) / 1.4; // carbon highlight sweeps along the chains
  const cIdxTG = useMemo(() => M.tg.atoms.map((a, i) => (a.el === "C" ? i : -1)).filter((i) => i >= 0), [M]);
  const cIdxAv = useMemo(() => M.avtur.atoms.map((a, i) => (a.el === "C" ? i : -1)).filter((i) => i >= 0), [M]);
  const waveAmp = (x: number) => (wave > -0.2 && wave < 1.3 ? Math.exp(-(((x - wave) / 0.12) ** 2)) * 0.3 : 0);
  const oAmp = ss(T.bedanya + 0.4, T.oksigen, t) * (0.35 + 0.15 * Math.sin(f * 0.25));
  const avOut = ss(T.bedanya, T.bedanya + 1.2, t);
  return (
    <>
      <MolLights />
      <Dome bottom="#1d0f03" mid="#04112a" top="#0b2d45" />
      <Bokeh f={f} />
      <group position={TG_POS} rotation={TG_ROT} scale={0.8}>
        <MolMesh mol={M.tg} kit={kit} warm />
        <AtomHalos mol={M.tg} idx={cIdxTG} r={0.26} color={PAL.amber} amp={(ai) => waveAmp(M.tg.atoms[ai].p.x / 6.2)} />
        <AtomHalos mol={M.tg} idx={M.oIdx} r={0.27} color="#ff3030" amp={() => oAmp * 0.6} />
      </group>
      {av > 0 ? (
        <group position={[-2.3 + avOut * 3, 1.3 + avOut * 3, 0.2]} rotation={[0.12, -0.22, 0.17]} scale={0.8 * av}>
          <MolMesh mol={M.avtur} kit={kit} />
          <AtomHalos mol={M.avtur} idx={cIdxAv} r={0.26} color={PAL.teal} amp={(ai) => waveAmp(M.avtur.atoms[ai].p.x / 4.0)} />
        </group>
      ) : null}
    </>
  );
};

const introShot = (t: number): Shot => {
  const a: Cam = { pos: [-1.0, -0.9, 5.0], target: [-0.9, -1.4, 0.4] };
  const b: Cam = { pos: [0.6, 0.2, 13.0], target: [0.1, -0.2, 0] };
  const c: Cam = { pos: [0.2, 0.0, 11.6], target: [0.0, -0.3, 0] };
  const d: Cam = { pos: [-1.1, -0.7, 5.6], target: [-1.75, -1.35, 0.5] };
  let cam: Cam;
  if (t < T.konteks) cam = camLerp(a, b, ss(T.tanya + 0.55, T.konteks + 0.4, t));
  else if (t < T.bedanya) cam = camLerp(b, c, ss(T.konteks, T.bedanya, t));
  else cam = camLerp(c, d, ss(T.bedanya, T.oksigen + 0.3, t));
  return lens(cam);
};

/** MEKANISME c+d: oxygen leaves as water, glycerol leaves; then the chains are cut and reshaped. */
const MolHDO: React.FC<{ t: number; f: number; kit: Kit; M: MolSet }> = ({ t, f, kit, M }) => {
  const r = ss(T.oks + 0.1, T.air2 + 0.5, t);
  const phase2 = t >= T.danCut;
  const cut = ss(T.dipotong, T.dipotong + 0.7, t);
  const reshaped = t >= T.dibentuk;
  const jetGlow = ss(T.mirip - 0.2, T.mirip + 0.5, t);
  const spark = Math.max(0, 1 - Math.abs(t - (T.dipotong + 0.15)) / 0.35);
  const reshapeFlash = Math.max(0, 1 - Math.abs(t - (T.dibentuk + 0.1)) / 0.35);
  return (
    <>
      <MolLights warm={phase2 ? 0.5 : 1} />
      <Dome bottom="#1a0e04" mid="#04112a" top="#0b2d45" />
      <Bokeh f={f} />
      {!phase2 ? (
        <group position={[-1.3, -1.0, 0]} rotation={TG_ROT} scale={0.85}>
          <MolMesh mol={M.tg} kit={kit} warm hide={r > 0.02 ? M.noOGly : undefined} />
          {/* glycerol drifting away (becomes propane in the reactor) */}
          {r > 0.02 ? (
            <group position={[-0.9 * r, -0.6 * r, 0.4 * r]}>
              <MolMesh mol={subMol(M.tg, M.gly)} kit={kit} />
            </group>
          ) : null}
          {/* each oxygen leaves and picks up two hydrogens: H2O */}
          {r > 0.02
            ? M.oIdx.map((oi, k) => {
                const p = M.tg.atoms[oi].p;
                const dir = new THREE.Vector3(0.5 + 0.35 * (k - 2.5), 1, 0.6).normalize();
                const q = p.clone().add(dir.multiplyScalar(r * (1.6 + k * 0.35)));
                const hk = ss(0.25, 0.6, r);
                return (
                  <group key={oi} position={q} rotation={[k, k * 0.7 + r * 2, 0.3 * k]}>
                    <mesh geometry={kit.sphere} material={kit.O} scale={0.15} />
                    {hk > 0 ? <MolMesh mol={M.water} kit={kit} scale={1} hide={new Set([0])} /> : null}
                    <Glow p={[0, 0, 0]} r={0.4} color="#ff4040" a={0.25 * (1 - r)} />
                  </group>
                );
              })
            : null}
        </group>
      ) : (
        <group>
          {/* three hydrocarbon chains (no oxygen), cut and reshaped */}
          {[
            { y: 1.35, z: -0.6, a: M.c8, b: M.c8, bi: M.iso8, iso: "b" as const },
            { y: 0.1, z: 0.3, a: M.c8, b: M.c10, bi: M.iso10, iso: "b" as const },
            { y: -1.2, z: 0.9, a: M.c8, b: M.c8, bi: M.iso8, iso: "a" as const },
          ].map((row, i) => {
            const gap = cut * 0.8;
            const x0 = -2.9;
            const pieceA = reshaped && row.iso === "a" ? row.bi : row.a;
            const pieceB = reshaped && row.iso === "b" ? row.bi : row.b;
            const bx = x0 + 8 * LEN.CC * Math.sin((55.5 * Math.PI) / 180) * 0.8 + gap;
            return (
              <group key={i} position={[0, row.y + Math.sin(f * 0.02 + i) * 0.04, row.z]} rotation={[0.12, -0.25, 0.04]}>
                <group position={[x0 - gap * 0.3, cut * 0.12 * (i - 1), 0]} rotation={[0, 0, cut * 0.06 * (i - 1)]} scale={0.8}>
                  <MolMesh mol={pieceA} kit={kit} />
                </group>
                <group position={[bx, -cut * 0.1, 0]} rotation={[0, 0, -cut * 0.05]} scale={0.8}>
                  <MolMesh mol={pieceB} kit={kit} />
                </group>
                <Glow p={[bx - 0.2 - gap * 0.5, 0.05, 0]} r={0.28} color="#fff1c2" a={0.45 * spark} />
                <Glow p={[row.iso === "a" ? x0 + 0.6 : bx + 0.8, 0.2, 0]} r={0.32} color={PAL.teal} a={0.4 * reshapeFlash} />
                <Glow p={[0.4, 0, 0]} r={0.01} color="#f6e7a8" a={0 * jetGlow} />
              </group>
            );
          })}
        </group>
      )}
    </>
  );
};

const subCache = new WeakMap<Mol, Map<string, Mol>>();
/** Sub-molecule containing only `keep` atoms (positions preserved). */
const subMol = (m: Mol, keep: Set<number>): Mol => {
  const key = [...keep].join(",");
  let byKey = subCache.get(m);
  if (!byKey) subCache.set(m, (byKey = new Map()));
  const hit = byKey.get(key);
  if (hit) return hit;
  const out = { atoms: [] as Mol["atoms"], bonds: [] as Mol["bonds"] } as Mol;
  const map = new Map<number, number>();
  m.atoms.forEach((a, i) => {
    if (keep.has(i)) {
      map.set(i, out.atoms.length);
      out.atoms.push(a);
    }
  });
  m.bonds.forEach((b) => {
    if (map.has(b.a) && map.has(b.b)) out.bonds.push({ a: map.get(b.a)!, b: map.get(b.b)!, order: b.order });
  });
  byKey.set(key, out);
  return out;
};

const hdoShot = (t: number): Shot => {
  const a: Cam = { pos: [0.4, 0.7, 12.0], target: [0.0, -0.1, 0] };
  const b: Cam = { pos: [0.1, 0.9, 10.2], target: [0.0, 0.2, 0] };
  const c: Cam = { pos: [-0.6, 0.6, 10.8], target: [0.2, 0.1, 0] };
  const d: Cam = { pos: [2.0, 1.1, 9.6], target: [0.4, 0.1, 0] };
  if (t < T.danCut) return lens(camLerp(a, b, ss(T.oks, T.danCut, t)));
  return lens(camLerp(c, d, ss(T.danCut, T.terakhir, t)));
};

/** REVEAL a: SAF = clear pale fuel full of short and branched hydrocarbons. */
const MolSAF: React.FC<{ t: number; f: number; kit: Kit; M: MolSet }> = ({ t, f, kit, M }) => {
  // dense, mostly parallel bundle of short and branched chains in the middle of a pale fuel drop
  const list = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        m: [M.c12, M.iso11, M.c9, M.iso10, M.c10, M.iso8][i % 6],
        p: [-1.6 + (hash(i + 70) - 0.5) * 1.2, -2.4 + (i % 6) * 0.95 + (hash(i + 80) - 0.5) * 0.3, i < 6 ? 0.5 : -0.9] as V3,
        r: [hash(i + 1) * 0.6, (hash(i + 2) - 0.5) * 0.6, 0.12 + (hash(i + 3) - 0.5) * 0.3] as V3,
      })),
    [M],
  );
  const k = ss(T.reveal - 0.2, T.saf, t);
  return (
    <>
      <MolLights warm={0.4} />
      <pointLight position={[0, 0, 4]} color="#fff3c4" intensity={20} distance={12} />
      <pointLight position={[0, -3, -3]} color="#ffd27a" intensity={14} distance={10} />
      <Dome bottom="#2a2008" mid="#122033" top="#1f4660" />
      <Bokeh f={f} />
      {/* the SAF drop: pale, clear shell */}
      <mesh position={[0, 0, -2.5]}>
        <sphereGeometry args={[4.6, 64, 48]} />
        <meshPhysicalMaterial color="#f6efc8" emissive="#3d3615" emissiveIntensity={0.6} roughness={0.05} clearcoat={1} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <Glow p={[0, 0, -2.5]} r={5.0} color="#f6e7a8" a={0.06} />
      {list.map((o, i) => (
        <group key={i} position={[o.p[0] + Math.sin(f * 0.012 + i) * 0.08, o.p[1] + Math.sin(f * 0.015 + i) * 0.08, o.p[2]]} rotation={[o.r[0] + f * 0.0015, o.r[1], o.r[2]]} scale={0.72 * k}>
          <MolMesh mol={o.m} kit={kit} />
        </group>
      ))}
      {Array.from({ length: 40 }, (_, i) => {
        const y = ((hash(i + 600) * 9 + f * 0.01) % 9) - 4.5;
        return <Glow key={`b${i}`} p={[(hash(i + 610) - 0.5) * 6, y, (hash(i + 620) - 0.5) * 3]} r={0.03 + hash(i + 630) * 0.04} color="#fff6d0" a={0.5} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- FILTER (pretreatment)
const FilterWorld: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lt = t - T.mek;
  const drops = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ x: (hash(i + 5) - 0.5) * 3.6, z: (hash(i + 6) - 0.5) * 3.6, ph: hash(i + 7), r: 0.06 + hash(i + 8) * 0.07 })), []);
  const dirt = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: (hash(i + 105) - 0.5) * 3.4, z: (hash(i + 106) - 0.5) * 3.4, d: hash(i + 107) * 1.6, r: 0.07 + hash(i + 108) * 0.09 })), []);
  const water = useMemo(() => Array.from({ length: 11 }, (_, i) => ({ x: (hash(i + 205) - 0.5) * 3.2, z: (hash(i + 206) - 0.5) * 3.2, d: 0.3 + hash(i + 207) * 1.9, r: 0.1 + hash(i + 208) * 0.09 })), []);
  const metal = useMemo(() => steel("#aab3bd", 0.3, 0.9), []);
  const hiDirt = ss(T.kotoran - 0.1, T.kotoran + 0.3, t);
  const hiWater = ss(T.air1 - 0.1, T.air1 + 0.3, t);
  return (
    <>
      <Env />
      <Dome bottom="#120a03" mid="#06101f" top="#0b2235" />
      <ambientLight color="#1b2a44" intensity={0.6} />
      <directionalLight position={[3, 8, 5]} color="#e6eeff" intensity={2.4} castShadow />
      <pointLight position={[0, 3, 2]} color={PAL.gold} intensity={16} distance={9} />
      <pointLight position={[-3, -1, 2]} color={PAL.cyan} intensity={8} distance={8} />
      {/* filter screen: ring + wire grid */}
      <mesh material={metal} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.25, 0.09, 14, 96]} />
      </mesh>
      {Array.from({ length: 19 }, (_, i) => {
        const u = -2.16 + i * 0.24;
        const half = Math.sqrt(Math.max(0, 2.25 ** 2 - u * u));
        return (
          <React.Fragment key={i}>
            <mesh material={metal} position={[u, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, half * 2, 6]} />
            </mesh>
            <mesh material={metal} position={[0, 0.005, u]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, half * 2, 6]} />
            </mesh>
          </React.Fragment>
        );
      })}
      {/* oil droplets pass through */}
      {drops.map((d, i) => {
        const y = 3.6 - (((lt * 0.55 + d.ph) % 1) * 7.6);
        return (
          <mesh key={i} position={[d.x, y, d.z]} scale={d.r}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial color="#d79a22" emissive="#6b3a04" emissiveIntensity={0.6} roughness={0.08} clearcoat={1} />
          </mesh>
        );
      })}
      {/* dirt and water are held back on the screen */}
      {dirt.map((d, i) => {
        const y = Math.max(0.1 + d.r * 0.6, 3.5 - (lt + d.d) * 3.2);
        return (
          <group key={i} position={[d.x, y, d.z]}>
            <mesh rotation={[i, i * 2, i * 3]} scale={d.r}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#3b2a1c" roughness={0.9} />
            </mesh>
            <Glow p={[0, 0, 0]} r={d.r * 2.2} color="#ff9a3c" a={0.35 * hiDirt * (1 - ss(T.kotoran + 0.8, T.air1 + 0.5, t))} />
          </group>
        );
      })}
      {water.map((d, i) => {
        const y = Math.max(0.1 + d.r * 0.8, 3.5 - (lt + d.d) * 3.0);
        return (
          <group key={i} position={[d.x, y, d.z]}>
            <mesh scale={[d.r, d.r * 0.8, d.r]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshPhysicalMaterial color="#6cc4ff" roughness={0.03} transmission={0.6} transparent opacity={0.85} clearcoat={1} />
            </mesh>
            <Glow p={[0, 0, 0]} r={d.r * 2} color="#5ab8ff" a={0.4 * hiWater} />
          </group>
        );
      })}
      <Glow p={[0, -2.8, 0]} r={2.6} color={PAL.gold} a={0.08} />
      {f < 0 ? null : null}
    </>
  );
};
const filterShot = (t: number) => lens(camLerp({ pos: [0, 3.6, 7.4], target: [0, 0.1, 0] }, { pos: [2.4, 2.2, 6.0], target: [0, 0.2, 0] }, ss(T.mek, T.lalu, t)));

// ---------------------------------------------------------------- REACTOR (H2 + catalyst)
const ReactorWorld: React.FC<{ t: number; f: number; kit: Kit; M: MolSet }> = ({ t, f, kit, M }) => {
  const lt = t - T.lalu;
  const shell = useMemo(() => steel("#7d858e", 0.34, 0.9), []);
  const inner = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2f36", roughness: 0.6, metalness: 0.5, side: THREE.DoubleSide }), []);
  const pellets = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.07, 0.07, 0.16, 10);
    const mat = new THREE.MeshStandardMaterial({ color: "#8f9cab", roughness: 0.55, metalness: 0.15 });
    const n = 900;
    const mesh = new THREE.InstancedMesh(geo, mat, n);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < n; i++) {
      const rr = Math.sqrt(hash(i * 1.3 + 1)) * 1.3;
      const a = hash(i * 2.1 + 2) * Math.PI * 2;
      const y = -2.0 + hash(i * 3.7 + 3) * 3.4;
      q.setFromEuler(new THREE.Euler(hash(i + 4) * 6, hash(i + 5) * 6, hash(i + 6) * 6));
      m4.compose(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr), q, new THREE.Vector3(1, 1, 1));
      mesh.setMatrixAt(i, m4);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, []);
  const heat = ss(T.lalu + 0.2, T.lalu + 1.0, t);
  const h2In = ss(T.hidrogen - 0.3, T.hidrogen + 0.3, t);
  const kat = ss(T.katalis - 0.2, T.katalis + 0.3, t);
  return (
    <>
      <Env />
      <Dome bottom="#0d0805" mid="#081222" top="#0e2236" />
      <ambientLight color="#1b2638" intensity={0.7} />
      <directionalLight position={[5, 9, 7]} color="#eef3ff" intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, -0.4, 0.4]} color="#ff7a2a" intensity={14 * heat + 2} distance={5} />
      <pointLight position={[3, 1, 4]} color={PAL.cyan} intensity={8} distance={10} />
      {/* thick-walled vertical vessel, cut open toward the camera */}
      <group rotation={[0, -0.5, 0]}>
        <mesh material={shell} castShadow receiveShadow>
          <cylinderGeometry args={[1.55, 1.55, 6, 72, 1, true, Math.PI * 0.75, Math.PI * 1.5]} />
        </mesh>
        <mesh material={inner}>
          <cylinderGeometry args={[1.4, 1.4, 6, 72, 1, true, Math.PI * 0.75, Math.PI * 1.5]} />
        </mesh>
        {[3, -3].map((y) => (
          <mesh key={y} material={shell} position={[0, y, 0]} rotation={[y > 0 ? 0 : Math.PI, 0, 0]}>
            <sphereGeometry args={[1.55, 48, 16, Math.PI * 0.75, Math.PI * 1.5, 0, Math.PI / 2]} />
          </mesh>
        ))}
        {/* cut faces of the wall */}
        {[Math.PI * 0.75, Math.PI * 2.25].map((a, i) => (
          <mesh key={i} material={shell} position={[Math.sin(a) * 1.475, 0, Math.cos(a) * 1.475]} rotation={[0, a + Math.PI / 2, 0]}>
            <boxGeometry args={[0.15, 6, 0.02]} />
          </mesh>
        ))}
        {/* catalyst bed support grid */}
        <mesh material={shell} position={[0, -2.1, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 0.06, 48]} />
        </mesh>
      </group>
      <primitive object={pellets} />
      
      {/* inlet pipes: oil from the top, hydrogen from the side */}
      <mesh material={shell} position={[0, 4.4, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 1.6, 24]} />
      </mesh>
      <mesh material={shell} position={[-2.6, 2.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 2.4, 20]} />
      </mesh>
      {/* oil droplets trickle down through the bed */}
      {Array.from({ length: 26 }, (_, i) => {
        const y = 2.7 - (((lt * 0.45 + hash(i + 300)) % 1) * 5.2);
        const a = hash(i + 310) * 6.28;
        const rr = hash(i + 320) * 1.1;
        return (
          <mesh key={i} position={[Math.cos(a) * rr, y, Math.sin(a) * rr]} scale={0.08}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshPhysicalMaterial color="#d79a22" emissive="#6b3a04" emissiveIntensity={0.7} roughness={0.08} clearcoat={1} />
          </mesh>
        );
      })}
      {/* hydrogen molecules enter from the side pipe and flow down with the oil */}
      {Array.from({ length: 20 }, (_, i) => {
        const k = (lt * 0.5 + hash(i + 400)) % 1;
        const enter = clamp01(k * 3);
        const a = hash(i + 410) * 6.28;
        const rr = hash(i + 420) * 1.1;
        const x = mix(-3.6, Math.cos(a) * rr, enter);
        const y = k < 0.33 ? 2.4 : mix(2.4, -1.9, (k - 0.33) / 0.67);
        const z = mix(0, Math.sin(a) * rr, enter);
        return (
          <group key={i} position={[x, y, z]} rotation={[i, i * 1.7, f * 0.02 + i]} scale={1.3 * h2In}>
            <MolMesh mol={M.h2} kit={kit} />
          </group>
        );
      })}
      <Glow p={[0.2, 0.4, 0.9]} r={0.9} color={PAL.teal} a={0.18 * kat * (0.7 + 0.3 * Math.sin(f * 0.2))} />
    </>
  );
};
const reactorShot = (t: number) => lens(camLerp({ pos: [0.6, -1.4, 9.4], target: [0, -0.6, 0] }, { pos: [2.2, 2.0, 7.6], target: [0, 0.6, 0] }, ss(T.lalu, T.oks, t)));

// ---------------------------------------------------------------- DISTILLATION COLUMN
const ColumnWorld: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.terakhir;
  const shell = useMemo(() => steel("#848c95", 0.34, 0.9), []);
  const tray = useMemo(() => steel("#5a626b", 0.45, 0.8), []);
  const jet = ss(T.distilasi - 0.4, T.distilasi + 0.3, t);
  const outs = [
    { y: 4.4, color: "#cfe3ff", tag: 0 },
    { y: 0.4, color: "#f3e7a1", tag: 1 },
    { y: -3.8, color: "#c98a2a", tag: 2 },
  ];
  return (
    <>
      <Env />
      <Dome bottom="#0d0805" mid="#081222" top="#0e2236" />
      <ambientLight color="#1b2638" intensity={0.7} />
      <directionalLight position={[6, 10, 8]} color="#eef3ff" intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, -4.5, 1]} color="#ff7a2a" intensity={10} distance={6} />
      <pointLight position={[2.5, 0.4, 2]} color="#fff1b0" intensity={10 + 18 * jet} distance={7} />
      <group rotation={[0, -0.6, 0]}>
        <mesh material={shell} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 1.05, 11, 64, 1, true, Math.PI * 0.8, Math.PI * 1.4]} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} material={tray} position={[0, -4.6 + i * 1.02, 0]}>
            <cylinderGeometry args={[0.98, 0.98, 0.05, 48, 1, false, 0, Math.PI * 1.75]} />
          </mesh>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={`l${i}`} position={[0, -4.55 + i * 1.02, 0]}>
            <cylinderGeometry args={[0.96, 0.96, 0.05, 48, 1, false, 0, Math.PI * 1.75]} />
            <meshPhysicalMaterial color={i < 3 ? "#b0741c" : i < 7 ? "#e6d27a" : "#d7e6f0"} roughness={0.1} clearcoat={1} emissive={i >= 3 && i < 7 ? "#5a4a10" : "#000"} emissiveIntensity={jet} />
          </mesh>
        ))}
      </group>
      {/* rising vapour */}
      {Array.from({ length: 60 }, (_, i) => {
        const k = (lt * 0.25 + hash(i + 500)) % 1;
        const a = hash(i + 510) * 6.28;
        const rr = hash(i + 520) * 0.8;
        return (
          <mesh key={i} position={[Math.cos(a) * rr, -5 + k * 10, Math.sin(a) * rr]} scale={0.04 + 0.03 * hash(i + 530)} layers={FX_LAYER}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#e8f4ff" transparent opacity={0.5 * Math.sin(k * Math.PI)} toneMapped={false} />
          </mesh>
        );
      })}
      {/* side draws: light top, jet middle, heavy bottom */}
      {outs.map((o) => (
        <group key={o.y}>
          <mesh material={shell} position={[2.0, o.y, 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 2.2, 20]} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => {
            const k = (lt * 0.6 + i / 8) % 1;
            return <Glow key={i} p={[1.1 + k * 2.4, o.y, 0.3]} r={o.tag === 1 ? 0.13 : 0.09} color={o.color} a={o.tag === 1 ? 0.35 + 0.6 * jet : 0.4} />;
          })}
        </group>
      ))}
    </>
  );
};
const columnShot = (t: number) => lens(camLerp({ pos: [3.4, -4.4, 9.5], target: [0.4, -3.4, 0] }, { pos: [4.4, 1.4, 9.0], target: [1.1, 0.5, 0] }, ss(T.terakhir, T.distilasi + 0.4, t)));

// ---------------------------------------------------------------- BLEND TANK (max 50 %)
const TankWorld: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const shell = useMemo(() => steel("#8a929b", 0.3, 0.9), []);
  const tankLabel = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 160;
    const g = c.getContext("2d")!;
    g.fillStyle = "rgba(10,18,30,0.82)";
    g.fillRect(0, 0, 1024, 160);
    g.strokeStyle = "#7ff3ff";
    g.lineWidth = 6;
    g.strokeRect(10, 10, 1004, 140);
    g.fillStyle = "#e9fbff";
    g.font = `600 92px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 512, 84);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);
  const fossil = ss(T.aturan, T.aturan + 1.4, t);
  const sf = ss(T.aturan + 1.3, T.setengah, t);
  const mark = ss(T.setengah - 0.2, T.setengah + 0.3, t);
  const H = 4.6;
  const hF = Math.max(0.01, (H / 2) * fossil);
  const hS = Math.max(0.01, (H / 2) * sf);
  return (
    <>
      <Env />
      <Dome bottom="#0d0805" mid="#081222" top="#10263a" />
      <ambientLight color="#1b2638" intensity={0.7} />
      <directionalLight position={[5, 9, 7]} color="#eef3ff" intensity={2.6} castShadow />
      <pointLight position={[0, 0, 3]} color="#fff1b0" intensity={12} distance={8} />
      <pointLight position={[-3, 2, -2]} color={PAL.cyan} intensity={8} distance={8} />
      <group position={[-1.0, 0, 0]} rotation={[0, -0.4, 0]}>
        <mesh material={shell}>
          <cylinderGeometry args={[1.7, 1.7, H, 72, 1, true, Math.PI * 0.7, Math.PI * 1.6]} />
        </mesh>
        <mesh material={shell} position={[0, -H / 2, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 0.08, 72]} />
        </mesh>
        {/* fossil jet fuel (bottom) and SAF (top) */}
        <mesh position={[0, -H / 2 + hF / 2, 0]}>
          <cylinderGeometry args={[1.62, 1.62, hF, 72]} />
          <meshPhysicalMaterial color="#c9a24e" emissive="#3a2a08" emissiveIntensity={0.5} roughness={0.08} clearcoat={1} />
        </mesh>
        {sf > 0.01 ? (
          <mesh position={[0, -H / 2 + hF + hS / 2, 0]}>
            <cylinderGeometry args={[1.62, 1.62, hS, 72]} />
            <meshPhysicalMaterial color="#f4ecc4" emissive="#4a4420" emissiveIntensity={0.5} roughness={0.06} clearcoat={1} />
          </mesh>
        ) : null}
        {/* stencilled AUDIRA plate wrapped on the tank shell (part of the world, not an overlay) */}
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[1.715, 1.715, 0.62, 48, 1, true, Math.PI * 1.97, Math.PI * 0.3]} />
          <meshStandardMaterial map={tankLabel} transparent roughness={0.5} metalness={0.3} side={THREE.FrontSide} />
        </mesh>
        {/* 50 % limit marker */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} layers={FX_LAYER}>
          <torusGeometry args={[1.76, 0.03, 8, 96]} />
          <meshBasicMaterial color="#7ff3ff" transparent opacity={mark} toneMapped={false} />
        </mesh>
      </group>
      <Glow p={[-1.0, 0, 0]} r={2.2} color="#7ff3ff" a={0.06 * mark * (0.7 + 0.3 * Math.sin(f * 0.2))} />
    </>
  );
};
const tankShot = (t: number) => lens(camLerp({ pos: [-0.6, -1.6, 3.2], target: [-1.0, -1.9, 0] }, { pos: [1.4, 1.1, 11.8], target: [0.2, 0.1, 0] }, ss(T.aturan, T.aturan + 2.2, t)));

// ---------------------------------------------------------------- AIRLINER (not pure)
const PlaneWorld: React.FC<{ t: number }> = ({ t }) => {
  const k = ss(T.pesawat, T.payoff, t);
  return (
    <>
      <Env />
      <Dome bottom="#06090f" mid="#0b1a2e" top="#1d3b55" />
      <ambientLight color="#1b2638" intensity={0.8} />
      <directionalLight position={[-6, 8, 6]} color="#eef3ff" intensity={2.8} castShadow />
      <pointLight position={[4, -2, 4]} color={PAL.cyan} intensity={10} distance={14} />
      <group position={[0, 1.1 + k * 0.3, 0]} rotation={[0.08, -0.55 + k * 0.25, 0.04]}>
        <Airliner3D />
      </group>
    </>
  );
};
const planeShot = (t: number) => lens(camLerp({ pos: [3, 1.0, 13.5], target: [0, 1.2, 0] }, { pos: [5.5, 2.4, 11.5], target: [0, 1.4, 0] }, ss(T.pesawat, T.payoff, t)));

// ---------------------------------------------------------------- REFINERY (co-processing)
const RefineryWorld: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lt = t - T.payoff;
  const metal = useMemo(() => steel("#7a828c", 0.4, 0.8), []);
  const dark = useMemo(() => steel("#3c434b", 0.5, 0.7), []);
  const white = useMemo(() => steel("#c9ced4", 0.35, 0.4), []);
  const gold = ss(T.payoff + 1.2, T.minyakBumi, t);
  const towers: [number, number, number, number][] = [
    [-3.0, -2.5, 0.55, 7.5], [-1.4, -3.6, 0.8, 9.5], [0.6, -2.6, 0.5, 6.5], [4.8, -4.8, 0.45, 8], [7.0, -3.2, 0.6, 7],
  ];
  const tanks: [number, number, number][] = [[-7, 2.6, 1.6], [-3.6, 4.6, 1.4], [8.5, 2.2, 1.7]];
  const spheres: [number, number, number][] = [[2.6, -7.5, 1.3], [5.6, -7.8, 1.3], [-6.5, -6.5, 1.1]];
  // night lights scattered over the structures
  const lamps = useMemo(() => Array.from({ length: 70 }, (_, i) => [(hash(i + 900) - 0.5) * 22, 0.4 + hash(i + 910) * 8.5, -2 - hash(i + 920) * 8] as V3), []);
  return (
    <>
      <Env />
      <Dome bottom="#06080c" mid="#101e33" top="#22405e" />
      <ambientLight color="#1b2638" intensity={0.8} />
      <directionalLight position={[-8, 12, 6]} color="#cfe0ff" intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 2, 3]} color={PAL.gold} intensity={12} distance={12} />
      <pointLight position={[3, 7, -4]} color="#ffb070" intensity={14} distance={16} />
      <pointLight position={[-7, 8, -6]} color="#ff8a2a" intensity={10} distance={10} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#14181d" roughness={0.9} />
      </mesh>
      {/* distillation towers with platforms and lights */}
      {towers.map(([x, z, r, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={metal} position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[r, r, h, 32]} />
          </mesh>
          <mesh material={metal} position={[0, h, 0]}>
            <sphereGeometry args={[r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {Array.from({ length: Math.floor(h / 1.5) }, (_, j) => (
            <React.Fragment key={j}>
              <mesh material={dark} position={[0, 1.1 + j * 1.5, 0]}>
                <cylinderGeometry args={[r + 0.28, r + 0.28, 0.05, 32, 1, false, 0, Math.PI * 1.3]} />
              </mesh>
              <Glow p={[r + 0.3, 1.25 + j * 1.5, 0.15]} r={0.06} color="#ffd27a" a={0.95} />
            </React.Fragment>
          ))}
        </group>
      ))}
      {/* storage tanks and spherical tanks on legs */}
      {tanks.map(([x, z, r], i) => (
        <mesh key={i} material={white} position={[x, 0.7, z]} castShadow receiveShadow>
          <cylinderGeometry args={[r, r, 1.4, 40]} />
        </mesh>
      ))}
      {spheres.map(([x, z, r], i) => (
        <group key={`s${i}`} position={[x, 0, z]}>
          <mesh material={white} position={[0, r + 0.8, 0]} castShadow>
            <sphereGeometry args={[r, 32, 20]} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <mesh key={k} material={dark} position={[Math.cos(k * 1.047) * r * 0.85, (r + 0.8) / 2, Math.sin(k * 1.047) * r * 0.85]}>
              <cylinderGeometry args={[0.05, 0.05, r + 0.8, 6]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* pipe rack: posts, beams and a bundle of parallel pipes */}
      <group position={[0, 0, -0.6]}>
        {Array.from({ length: 9 }, (_, i) => (
          <React.Fragment key={i}>
            <mesh material={dark} position={[-8 + i * 2, 1.0, -0.6]}>
              <boxGeometry args={[0.12, 2.0, 0.12]} />
            </mesh>
            <mesh material={dark} position={[-8 + i * 2, 1.0, 0.6]}>
              <boxGeometry args={[0.12, 2.0, 0.12]} />
            </mesh>
            <mesh material={dark} position={[-8 + i * 2, 1.95, 0]}>
              <boxGeometry args={[0.12, 0.1, 1.4]} />
            </mesh>
          </React.Fragment>
        ))}
        {[-0.45, -0.15, 0.15, 0.45].map((z, i) => (
          <mesh key={z} material={i % 2 ? metal : white} position={[0, 2.12, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 17, 12]} />
          </mesh>
        ))}
      </group>
      {lamps.map((p, i) => (
        <Glow key={`l${i}`} p={p} r={0.05} color={i % 3 ? "#ffd27a" : "#fff4dc"} a={0.6 + 0.3 * Math.sin(f * 0.05 + i)} />
      ))}
      {/* flare stack */}
      <mesh material={dark} position={[-7, 4.5, -6]}>
        <cylinderGeometry args={[0.12, 0.16, 9, 12]} />
      </mesh>
      <mesh position={[-7, 9.4, -6]} scale={[1, 1 + 0.15 * Math.sin(f * 0.3), 1]} layers={FX_LAYER}>
        <coneGeometry args={[0.3, 1.1, 12]} />
        <meshBasicMaterial color="#ff8a2a" transparent opacity={0.9} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* big crude/feed line and the small used-cooking-oil line merging into one unit */}
      <mesh material={dark} position={[-1.5, 0.5, 2.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 9, 24]} />
      </mesh>
      <mesh material={metal} position={[-1.2, 0.5, 3.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3.4, 16]} />
      </mesh>
      <mesh material={metal} position={[3.6, 1.4, 2.2]} castShadow>
        <boxGeometry args={[1.8, 2.8, 1.8]} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const k = (lt * 0.35 + i / 14) % 1;
        return <Glow key={i} p={[-6 + k * 8.8, 0.5, 2.2]} r={0.22} color="#5a3a12" a={0.5} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const k = (lt * 0.5 + i / 6) % 1;
        return <Glow key={`g${i}`} p={[-1.2, 0.5, 5.6 - k * 3.4]} r={0.1} color={PAL.amber} a={0.95 * gold} />;
      })}
    </>
  );
};
const refineryShot = (t: number) => lens(camLerp({ pos: [-10, 10, 19], target: [0, 1.5, 0] }, { pos: [-7, 7.5, 16], target: [0.5, 1.4, 1.0] }, ss(T.payoff, T.danPes, t)));

// ---------------------------------------------------------------- RUNWAY (take-off)
const planeX = (t: number) => {
  const lt = t - T.danPes;
  return -8 + 1.6 * lt + 1.1 * lt * lt;
};
const RunwayWorld: React.FC<{ t: number }> = ({ t }) => {
  const lift = ss(T.agustus - 0.8, T.outro, t);
  const x = planeX(t);
  return (
    <>
      <Env />
      <Dome bottom="#2a1508" mid="#b25a2a" top="#1b2f52" />
      <ambientLight color="#3a2a28" intensity={0.9} />
      <directionalLight position={[30, 6, 10]} color="#ffc48a" intensity={2.8} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 200]} />
        <meshStandardMaterial color="#1a1a17" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[400, 6]} />
        <meshStandardMaterial color="#34363a" roughness={0.8} />
      </mesh>
      {Array.from({ length: 60 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-60 + i * 3, 0.02, 0]}>
          <planeGeometry args={[1.4, 0.12]} />
          <meshBasicMaterial color="#e8e2d6" />
        </mesh>
      ))}
      {Array.from({ length: 50 }, (_, i) => (
        <React.Fragment key={`e${i}`}>
          <Glow p={[-60 + i * 4, 0.08, 3.1]} r={0.08} color="#ffe2a6" a={0.9} />
          <Glow p={[-60 + i * 4, 0.08, -3.1]} r={0.08} color="#ffe2a6" a={0.9} />
        </React.Fragment>
      ))}
      <group position={[x, 1.05 + lift * 4.2, 0]} rotation={[0, 0, lift * 0.2]}>
        <Airliner3D />
      </group>
    </>
  );
};
const runwayShot = (t: number) => {
  const x = planeX(t);
  const lift = ss(T.agustus - 0.8, T.outro, t);
  const k = ss(T.danPes, T.outro, t);
  return lens({ pos: [x - mix(10, 5, k), 1.6 + lift * 2.4, mix(22, 25, k)], target: [x + 1.0, 2.6 + lift * 3.6, 0] });
};

// ---------------------------------------------------------------- shot table
type ShotDef = { id: string; a: number; b: number };
const SHOTS: ShotDef[] = [
  { id: "kitchen", a: 0, b: T.tanya + 0.6 },
  { id: "molIntro", a: T.tanya + 0.6, b: T.mek },
  { id: "filter", a: T.mek, b: T.lalu },
  { id: "reactor", a: T.lalu, b: T.oks },
  { id: "molHDO", a: T.oks, b: T.terakhir },
  { id: "column", a: T.terakhir, b: T.reveal },
  { id: "saf", a: T.reveal, b: T.aturan },
  { id: "tank", a: T.aturan, b: T.pesawat },
  { id: "plane", a: T.pesawat, b: T.payoff },
  { id: "refinery", a: T.payoff, b: T.danPes },
  { id: "runway", a: T.danPes, b: T.outro },
  { id: "cover", a: T.outro, b: T.tanya2 },
  { id: "question", a: T.tanya2, b: 999 },
];
const shotAt = (t: number) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];

const coverShot = (t: number): Shot => {
  const k = ss(T.outro, T.tanya2, t);
  const a: Cam = { pos: [0.3, 0.2, 10.5], target: [0, -0.3, 0] };
  const b: Cam = { pos: COVER_SHOT.pos as V3, target: COVER_SHOT.target as V3 };
  return { ...COVER_SHOT, ...lens(camLerp(a, b, k), { exposure: COVER_SHOT.exposure }) };
};
const questionShot = (t: number) => lens(camLerp({ pos: [4.0, 6.5, 12.5], target: [1.8, 0.4, 0] }, { pos: [3.4, 5.4, 10.8], target: [2.0, 0.7, 0] }, ss(T.tanya2, T.card, t)), { aperture: 0.002, maxBlur: 0.008 });

/** Meaningful world changes: the camera pushes into the subject (molecule, oil drop, jet-fuel draw,
 * SAF liquid) and the next world opens from the same colour, starting close and pulling back. */
const DIVES = [
  { cut: T.mek, color: "#f5a524" }, // ester oxygen -> oil drops at the filter
  { cut: T.oks, color: "#f5a524" }, // oil drop in the catalyst bed -> molecules
  { cut: T.reveal, color: "#f3e7a1" }, // jet-fuel draw of the column -> SAF drop
  { cut: T.aturan, color: "#f4ecc4" }, // SAF liquid -> liquid in the blend tank
];
const diveCam = (t: number, s: Shot): Shot => {
  for (const d of DIVES) {
    const kin = ss(d.cut - 0.45, d.cut, t);
    if (t < d.cut && kin > 0) {
      const pos = mix3(s.pos, mix3(s.target, s.pos, 0.08), kin * 0.95);
      return { ...s, pos, focus: Math.max(0.3, s.focus * (1 - 0.9 * kin)) };
    }
    const kout = ss(d.cut, d.cut + 0.6, t);
    if (t >= d.cut && kout < 1) {
      const pos = mix3(mix3(s.target, s.pos, 0.15), s.pos, kout);
      return { ...s, pos };
    }
  }
  return s;
};

const World: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const kit = useKit();
  const M = useMolecules();
  const s = shotAt(t);
  if (s.id === "cover") return <CoverScene f={f} shot={coverShot(t)} />;
  let shot: Shot;
  let body: React.ReactNode;
  switch (s.id) {
    case "kitchen":
      shot = kitchenShot(t);
      body = <KitchenWorld t={t} />;
      break;
    case "molIntro":
      shot = introShot(t);
      body = <MolIntro t={t} f={f} kit={kit} M={M} />;
      break;
    case "filter":
      shot = filterShot(t);
      body = <FilterWorld t={t} f={f} />;
      break;
    case "reactor":
      shot = reactorShot(t);
      body = <ReactorWorld t={t} f={f} kit={kit} M={M} />;
      break;
    case "molHDO":
      shot = hdoShot(t);
      body = <MolHDO t={t} f={f} kit={kit} M={M} />;
      break;
    case "column":
      shot = columnShot(t);
      body = <ColumnWorld t={t} />;
      break;
    case "saf":
      shot = lens(camLerp({ pos: [0, 0, 11], target: [0, 0, 0] }, { pos: [0.6, 0.4, 8.6], target: [0, 0.2, 0] }, ss(T.reveal, T.aturan, t)));
      body = <MolSAF t={t} f={f} kit={kit} M={M} />;
      break;
    case "tank":
      shot = tankShot(t);
      body = <TankWorld t={t} f={f} />;
      break;
    case "plane":
      shot = planeShot(t);
      body = <PlaneWorld t={t} />;
      break;
    case "refinery":
      shot = refineryShot(t);
      body = <RefineryWorld t={t} f={f} />;
      break;
    case "runway":
      shot = runwayShot(t);
      body = <RunwayWorld t={t} />;
      break;
    default:
      shot = questionShot(t);
      body = <KitchenWorld t={t} question />;
  }
  shot = diveCam(t, shot);
  return (
    <>
      <CameraRig shot={shot} near={0.1} far={300} />
      {body}
      <Stream f={s.id === "saf" ? f : -99999} />
      <Post shot={shot} frame={f} ao aoRadius={0.18} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} />
    </>
  );
};

// ---------------------------------------------------------------- 2D overlay
const MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";

const Tag: React.FC<{ x: number; y: number; k: number; title: string; sub?: string; color?: string; align?: "left" | "right" }> = ({ x, y, k, title, sub, color = "#9ff3ff", align = "left" }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, textAlign: align, textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>
      <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 3, color, fontWeight: 600 }}>{title}</div>
      {sub ? <div style={{ fontFamily: FONT, fontSize: 30, color: "rgba(255,255,255,0.88)", marginTop: 4 }}>{sub}</div> : null}
    </div>
  );

const Big: React.FC<{ k: number; top: number; text: string; sub?: string; color?: string; size?: number }> = ({ k, top, text, sub, color = "#7ff3ff", size = 150 }) =>
  k <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: k, transform: `scale(${0.9 + 0.1 * k})`, textShadow: "0 6px 40px rgba(0,0,0,0.9)" }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: size, letterSpacing: -3, color, lineHeight: 1 }}>{text}</div>
      {sub ? <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 3, color: "rgba(255,255,255,0.85)", marginTop: 18 }}>{sub}</div> : null}
    </div>
  );

/** Karaoke caption: phrases of up to 5 words from timeline.json; active word glows teal with a micro-bounce. */
const PHRASES = (() => {
  const out: { words: { w: string; s: number; e: number }[]; a: number; b: number }[] = [];
  for (const c of CLIPS) {
    const n = c.words.length;
    const groups = Math.ceil(n / 5);
    const per = Math.ceil(n / groups);
    for (let g = 0; g < groups; g++) {
      const words = c.words.slice(g * per, (g + 1) * per);
      if (words.length) out.push({ words, a: words[0].s - 0.12, b: words[words.length - 1].e + 0.25 });
    }
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
})();

const Caption: React.FC<{ t: number }> = ({ t }) => {
  const ph = PHRASES.find((p) => t >= p.a && t < p.b);
  if (!ph || t >= T.card) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 420, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "18px 30px", borderRadius: 18, background: "rgba(2,8,20,0.62)", border: "1.5px solid rgba(0,245,212,0.35)", boxShadow: "0 0 30px rgba(0,245,212,0.12)", display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 4 }}>
        {ph.words.map((w, i) => {
          const active = t >= w.s && (i === ph.words.length - 1 || t < ph.words[i + 1].s);
          const said = t >= w.s;
          const pop = active ? Math.max(0, 1 - (t - w.s) / 0.18) : 0;
          return (
            <span key={i} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 52, color: active ? "#5ff5e0" : said ? "#ffffff" : "rgba(255,255,255,0.55)", transform: `translateY(${-6 * pop}px) scale(${1 + 0.08 * pop})`, display: "inline-block", textShadow: active ? "0 0 18px rgba(0,245,212,0.55)" : "none" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const s = shotAt(t).id;
  const on = (a: number, b: number, fade = 0.3) => ss(a, a + fade, t) * (1 - ss(b - fade, b, t));
  const hud = s === "molIntro" || s === "molHDO" || s === "saf" ? "MAG 2.000.000×" : s === "filter" || s === "reactor" || s === "column" || s === "tank" ? "SKALA PROSES" : "";
  // flash at world changes
  const cuts = SHOTS.map((x) => x.a).filter((a) => a > 0);
  const flash = cuts.filter((c) => !DIVES.some((d) => d.cut === c)).reduce((m, c) => Math.max(m, 1 - Math.abs(t - c) / 0.18), 0);
  const dv = DIVES.map((d) => ({ d, k: ss(d.cut - 0.32, d.cut, t) * (1 - ss(d.cut + 0.05, d.cut + 0.5, t)) })).sort((a, b) => b.k - a.k)[0];
  const dive = ss(T.tanya + 0.25, T.tanya + 0.6, t) * (1 - ss(T.tanya + 0.6, T.tanya + 1.0, t));
  return (
    <AbsoluteFill style={{ color: "#fff", pointerEvents: "none" }}>
      {hud ? (
        <div style={{ position: "absolute", left: 64, top: 196, fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: "rgba(160,235,245,0.85)" }}>
          {hud}
          {hud.startsWith("MAG") ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div style={{ width: 82, height: 3, background: "rgba(220,245,250,0.9)" }} />
              <span style={{ fontSize: 20 }}>5 Å</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* KONTEKS */}
      <Tag x={64} y={760} k={on(T.konteks + 0.2, T.bedanya)} title="JELANTAH" sub="trigliserida" color="#ffd27a" />
      <Tag x={600} y={300} k={on(T.avtur, T.bedanya + 0.4)} title="AVTUR" sub="rantai C–H" />
      <Tag x={640} y={380} k={on(T.oksigen - 0.3, T.mek)} title="O = OKSIGEN" sub="ada di jelantah" color="#ff7a7a" />
      {/* MEKANISME */}
      <Tag x={64} y={300} k={on(T.mek + 0.1, T.lalu)} title="1 · SARING" color="#ffd27a" />
      <Tag x={640} y={600} k={on(T.kotoran, T.lalu)} title="KOTORAN" color="#ffb070" />
      <Tag x={640} y={700} k={on(T.air1, T.lalu)} title="AIR" color="#8fd3ff" />
      <Tag x={64} y={300} k={on(T.lalu + 0.1, T.oks)} title="2 · DIPANASKAN" sub="+ hidrogen + katalis" color="#ffb070" />
      <Tag x={64} y={560} k={on(T.hidrogen, T.oks)} title="H₂" sub="hidrogen" />
      <Tag x={720} y={880} k={on(T.katalis, T.oks)} title="KATALIS" sub="butiran pelet" />
      <Tag x={64} y={300} k={on(T.oks + 0.1, T.danCut)} title="3 · O LEPAS" sub="menjadi air (H₂O)" color="#ff7a7a" />
      <Tag x={64} y={300} k={on(T.danCut + 0.1, T.terakhir)} title="4 · DIPOTONG + DIBENTUK ULANG" />
      <Tag x={64} y={1180} k={on(T.mirip - 0.1, T.terakhir)} title="≈ AVTUR" sub="rantai lebih pendek, ada cabang" color="#f3e7a1" />
      <Tag x={64} y={300} k={on(T.terakhir + 0.1, T.reveal)} title="5 · DISTILASI" />
      <Tag x={640} y={560} k={on(T.terakhir + 0.6, T.reveal)} title="FRAKSI RINGAN" color="#cfe3ff" />
      <Tag x={640} y={880} k={on(T.distilasi - 0.3, T.reveal)} title="FRAKSI AVTUR" color="#f3e7a1" />
      <Tag x={640} y={1180} k={on(T.terakhir + 0.6, T.reveal)} title="FRAKSI BERAT" color="#e0a24a" />
      {/* REVEAL */}
      <Big k={on(T.saf - 0.15, T.aturan)} top={330} text="SAF" sub="SUSTAINABLE AVIATION FUEL" />
      <Tag x={64} y={300} k={on(T.aturan + 0.1, T.pesawat)} title="ATURAN CAMPURAN" sub="ASTM D7566 · jalur HEFA" />
      <Tag x={850} y={1150} k={on(T.aturan + 0.6, T.pesawat)} title="AVTUR FOSIL" sub="bagian bawah" color="#e0c070" />
      <Tag x={850} y={700} k={on(T.aturan + 1.6, T.pesawat)} title="SAF" sub="bagian atas" color="#f4ecc4" />
      {(() => {
        const k = on(T.setengah - 0.1, T.pesawat);
        return k > 0.01 ? (
          <div style={{ position: "absolute", left: 600, top: 950, opacity: k, display: "flex", whiteSpace: "nowrap", alignItems: "center", textShadow: "0 4px 24px rgba(0,0,0,0.9)" }}>
            <div style={{ width: 90 * k, height: 3, background: "#7ff3ff", boxShadow: "0 0 12px #7ff3ff", marginRight: 16 }} />
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 70, color: "#7ff3ff", lineHeight: 1, letterSpacing: -2 }}>MAKS 50%</div>
              <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: "rgba(255,255,255,0.85)", marginTop: 8 }}>SAF DALAM CAMPURAN</div>
            </div>
          </div>
        ) : null;
      })()}
      {(() => {
        const k = on(T.pesawat + 0.2, T.payoff);
        const strike = ss(T.murni - 0.1, T.murni + 0.3, t);
        return k > 0.01 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", opacity: k, textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
            <div style={{ position: "relative", display: "inline-block", fontFamily: FONT, fontWeight: 600, fontSize: 78, color: "#ffd27a" }}>
              100% jelantah
              <div style={{ position: "absolute", left: -10, top: "52%", height: 8, width: `${strike * 104}%`, background: "#ff4a4a", borderRadius: 4 }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 3, marginTop: 14, color: "#9ff3ff", opacity: strike }}>CAMPURAN SAF + AVTUR</div>
          </div>
        ) : null;
      })()}
      {/* PAYOFF */}
      <Tag x={64} y={300} k={on(T.payoff + 0.2, T.danPes)} title="INDONESIA" sub="diolah bersama minyak bumi" color="#ffd27a" />
      <Tag x={600} y={980} k={on(T.minyakBumi - 0.2, T.danPes)} title="MINYAK BUMI" color="#c8b8a0" />
      <Tag x={120} y={1120} k={on(T.payoff + 1.2, T.danPes)} title="JELANTAH" sub="porsi kecil (≤5%)" color="#ffd27a" />
      <Tag x={64} y={420} k={on(T.cilacap - 0.1, T.danPes)} title="KILANG CILACAP" color="#9ff3ff" />
      <Big k={on(T.agustus - 0.2, T.outro)} top={300} text="AGUSTUS 2025" size={92} sub="PENERBANGAN KOMERSIAL PERTAMA" color="#ffffff" />
      {/* OUTRO */}
      {s === "cover" ? (
        <div style={{ opacity: ss(T.outro, T.outro + 0.5, t) }}>
          <Airliner />
          <Tag x={600} y={1160} k={1} title="JELANTAH" sub="bukan sampah" color="#ffd27a" />
          <Tag x={600} y={560} k={ss(T.masa - 0.8, T.masa, t)} title="BAHAN BAKAR" sub="masa depan" />
        </div>
      ) : null}

      {/* transition fills sit under the caption so the words stay readable */}
      {dv && dv.k > 0.001 ? <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, #fffbe8 0%, ${dv.d.color} ${Math.round(30 + 30 * dv.k)}%, rgba(0,0,0,0) ${Math.round(40 + 60 * dv.k)}%)`, opacity: Math.min(1, dv.k * 1.15) }} /> : null}
      <Caption t={t} />
      {/* transition light: dive into the droplet + quick flash at world changes */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #fff3c4 0%, #f5a524 45%, rgba(245,165,36,0) 80%)", opacity: Math.min(1, dive * 1.1) }} />
      <AbsoluteFill style={{ background: "#e9fbff", opacity: flash * 0.22, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

export const Ep052Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60; // 60 fps film clock
  return (
    <AbsoluteFill>
      <Stage3D background={PAL.void} overlay={() => <Overlay t={t} />}>
        <World t={t} f={f} />
      </Stage3D>
      <Outro start={T.card} />
    </AbsoluteFill>
  );
};
