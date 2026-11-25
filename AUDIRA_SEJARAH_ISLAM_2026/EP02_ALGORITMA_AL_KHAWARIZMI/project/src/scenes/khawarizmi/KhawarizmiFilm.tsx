// EP02 "Algoritma: Al-Khawarizmi" (Sejarah Islam), MANUSCRIPT style.
// One continuous candlelit desk in a Baghdad library, grown from the approved cover (the film's first
// frame). The locked voice is the clock: every camera key and event is a word of timeline.json (beats.ts).
// Hook: the Latin codex "Dixit algorizmi". Context: desk map Khwarazm -> Baghdad, the library.
// Main: the al-Jabr book, the balance (a term crosses to the other pan), the equation board (words,
// then symbols), uses (inheritance scroll, coins, a canal in the sand). Explanation: numerals in the
// sand, the lost Arabic original, the Latin copy, Algorizmi -> algorism -> algorithm. Payoff: no x,
// no +, no = (words only), then a gold thread: sand board -> Latin codex -> code -> phone feed.
// Outro: the shelves, an AUDIRA book spine, the outro card. No faces, no people, no Qur'anic text.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets";
import { FX_LAYER } from "../../core/render/Post";
import { RoundedBoxGeo } from "../../core/polish/Polish";
import { shotPlan, cameraAt, frame as toFrame, type Framing, type Move } from "../../core/camera/moves";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette";
import { makeFeatherTexture, makeGlowTexture, makeWoodTexture } from "../../kits/manuscript/lib/materials";
import { candleFlicker, mulberry32 } from "../../kits/manuscript/core/motion";
import { makeDiagramPage, makeIncipitPage, makeInitialD, makeInitialDNormal, makeSpineTexture, makeAudiraSpine, INITIAL_BOX, PAGE_H, PAGE_W } from "./textures";
import { KhawarizmiOverlay } from "./Overlay";
import { Captions } from "./Captions";
import { COVER as COVER_FRAMING } from "./cover";
import { EV } from "./beats";
import { TOTAL, prog, smooth, win } from "./time";
import { CamQ, RevealPlane, Tag3D } from "./labels";
import { AlJabrBook, ChainThread, CodeSlate, DeskMap, EquationBoard, LostBook, Phone, POS, Uses } from "./props";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { makeBrassTexture, makeDeskTexture, makeWallTexture } from "./surfaces";

export const KHAWARIZMI_COVER_SECONDS = 3;
export const KHAWARIZMI_FILM_SECONDS = TOTAL;

type V3 = [number, number, number];
const FPS = 60;
const fx = (o: THREE.Object3D) => o.layers.set(FX_LAYER);

// ---- lectern geometry (local page plane -> world) ----
export const LECTERN = { pos: [0, 0.56, -0.22] as V3, tilt: -0.55 };
const PAGE = { w: 0.62, h: 0.86 };
export const pageToWorld = (x: number, y: number, z = 0.05): V3 => {
  const c = Math.cos(LECTERN.tilt);
  const s = Math.sin(LECTERN.tilt);
  return [LECTERN.pos[0] + x, LECTERN.pos[1] + y * c - z * s, LECTERN.pos[2] + y * s + z * c];
};
/** Gold initial centre in lectern-local coordinates (left page offset -0.33). */
const INITIAL_LOCAL: [number, number] = [
  -0.33 + ((INITIAL_BOX.x + INITIAL_BOX.s / 2) / PAGE_W - 0.5) * PAGE.w,
  (0.5 - (INITIAL_BOX.y + INITIAL_BOX.s / 2) / PAGE_H) * PAGE.h,
];
const INITIAL_SIZE = (INITIAL_BOX.s / PAGE_W) * PAGE.w;

const SAND = { pos: [-0.55, 0, 0.72] as V3, rotY: 0.15 };
const AUDIRA_BOOK: V3 = [0.32, 1.06 + 0.19, -1.48];

// ---- camera: the cover framing is the film's opening pose; every key is a word time ----
export const COVER: Framing = COVER_FRAMING;
const F = (target: V3, az: number, el: number, dist: number, fov = 36): Partial<Framing> => ({ target, az, el, dist, fov });
const go = (to: Partial<Framing>, hold = false): Move => Object.assign(toFrame(to), { hold });
const SHOT = {
  incipit: F([-0.3, 0.74, -0.18], -9, 26, 2.35),
  map: F([POS.map[0] + 0.02, 0.0, POS.map[2]], -6, 63, 2.8),
  map2: F([POS.map[0] + 0.03, 0.0, POS.map[2] - 0.02], 4, 61, 2.65),
  shelves: F([-0.35, 1.32, -1.45], -14, 6, 2.3),
  shelves2: F([-0.15, 1.3, -1.45], -4, 8, 2.15),
  jabr: F([POS.jabrBook[0] - 0.05, 0.36, POS.jabrBook[2]], 12, 20, 1.65),
  jabr2: F([POS.jabrBook[0] - 0.05, 0.36, POS.jabrBook[2]], 4, 20, 1.5),
  balance: F([0.3, 0.34, 0.78], -48, 18, 2.05),
  balance2: F([0.3, 0.35, 0.78], -40, 15, 1.85),
  board: F([0.3, 0.2, 1.12], 0, 50, 2.35),
  board2: F([0.3, 0.18, 1.12], 4, 52, 2.2),
  uses: F([0.42, 0.05, 1.12], 0, 42, 3.8),
  sand: F([-0.56, 0.04, 0.74], -8, 60, 1.85),
  sand2: F([-0.56, 0.04, 0.74], 2, 62, 1.75),
  lost: F([-0.72, 0.06, 0.92], -18, 50, 2.45),
  spread: F([0, 0.6, -0.2], 0, 30, 4.75),
  dixit: F(pageToWorld(-0.33, 0.02), -4, 31, 2.05),
  morph: F([0, 0.86, -0.08], 0, 22, 2.75),
  morph2: F([0, 0.86, -0.08], 5, 22, 2.65),
  pay: F([0.45, 0.2, 1.12], -6, 50, 2.75),
  pay2: F([0.45, 0.18, 1.12], -2, 52, 2.6),
  pay3: F([0.42, 0.17, 1.12], 0, 53, 2.5),
  cSand: F([-0.55, 0.04, 0.72], -8, 60, 1.8),
  cSand2: F([-0.55, 0.04, 0.72], -4, 61, 1.7),
  cCodex: F(pageToWorld(-0.33, 0.04, 0.06), -6, 31, 2.05),
  cCodex2: F(pageToWorld(-0.33, 0.04, 0.06), -3, 31, 1.95),
  cSlate: F([POS.slate[0], 0.18, POS.slate[2]], 16, 18, 1.0),
  cSlate2: F([POS.slate[0], 0.18, POS.slate[2]], 22, 18, 0.94),
  cPhone: F([POS.phone[0], 0.02, POS.phone[2]], 28.6, 72, 0.46),
  cPhone2: F([POS.phone[0], 0.02, POS.phone[2]], 28.6, 74, 0.43),
  chain: F([0.18, 0.12, 0.42], -4, 66, 4.9, 40),
  chain2: F([0.18, 0.12, 0.42], -7, 52, 4.0, 40),
  outro: F([0.25, 1.2, -1.45], 6, 5, 2.1),
  spine: F([AUDIRA_BOOK[0], AUDIRA_BOOK[1] - 0.05, AUDIRA_BOOK[2]], 3, 6, 1.6),
};
const RIG = shotPlan(FPS, COVER, [
  { at: EV.hookEnd, move: go(SHOT.incipit, true) },
  { at: EV.khwarazm, move: go(SHOT.map) },
  { at: EV.kesembilan, move: go(SHOT.map2, true) },
  { at: EV.baghdad, move: go(SHOT.shelves) },
  { at: EV.khalifah, move: go(SHOT.shelves2, true) },
  { at: EV.menulis, move: go(SHOT.jabr) },
  { at: EV.aljabarWord, move: go(SHOT.jabr2, true) },
  { at: EV.dipindah, move: go(SHOT.balance) },
  { at: EV.seimbang, move: go(SHOT.balance2, true) },
  { at: EV.eqX, move: go(SHOT.board) },
  { at: EV.lima, move: go(SHOT.board2, true) },
  { at: EV.warisan, move: go(SHOT.uses, true) },
  { at: EV.mana, move: go(SHOT.sand) },
  { at: EV.angkaArab, move: go(SHOT.sand2, true) },
  { at: EV.teks + 0.3, move: go(SHOT.lost, true) },
  { at: EV.kalimat, move: go(SHOT.spread) },
  { at: EV.berkata, move: go(SHOT.dixit, true) },
  { at: EV.berarti, move: go(SHOT.morph) },
  { at: EV.algorithm, move: go(SHOT.morph2, true) },
  { at: EV.noX, move: go(SHOT.pay) },
  { at: EV.noSama, move: go(SHOT.pay2, true) },
  // payoff chain: one hero per named item, cut on its word (held keys either side of each cut)
  { at: EV.dari - 1 / 60, move: go(SHOT.pay3, true) },
  { at: EV.dari, move: go(SHOT.cSand, true) },
  { at: EV.naskah - 1 / 60, move: go(SHOT.cSand2, true) },
  { at: EV.naskah, move: go(SHOT.cCodex, true) },
  { at: EV.kode - 1 / 60, move: go(SHOT.cCodex2, true) },
  { at: EV.kode, move: go(SHOT.cSlate, true) },
  { at: EV.feed - 1 / 60, move: go(SHOT.cSlate2, true) },
  { at: EV.feed, move: go(SHOT.cPhone, true) },
  { at: EV.outStart - 1 / 60, move: go(SHOT.cPhone2, true) },
  // cut to the whole desk on "Jadi," (no labels), then one slow crane to the shelves
  { at: EV.outStart, move: go(SHOT.chain2, true) },
  { at: EV.sejarah, move: go(SHOT.outro) },
  { at: EV.audira, move: go(SHOT.spine, true) },
  { at: TOTAL, move: go({ dist: SHOT.spine.dist! * 0.95 }, true) },
]);
const LENS = { aperture: 0, maxBlur: 0, exposure: 0.9 };
const tmpObj = new THREE.Object3D();

const CameraDriver: React.FC<{ pos: V3; target: V3; fov: number; roll: number }> = ({ pos, target, fov, roll }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.fov = fov;
    c.near = 0.02;
    c.far = 30;
    c.up.set(0, 1, 0);
    c.lookAt(...target);
    if (roll) c.rotateZ(roll);
    c.updateProjectionMatrix();
    c.layers.enable(FX_LAYER);
  }, [camera, pos, target, fov, roll]);
  return null;
};

// ---- materials ----
const BRASS = { color: "#FFFFFF", metalness: 0.92, roughness: 0.34, map: makeBrassTexture() } as const;

/** The Latin codex on the lectern. The gold "D" is a raised, bevelled gold-leaf plate (normal map
 * from its blurred height, ink shadow under it, a travelling gleam on "Dixit"). */
const Codex: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(
    () => ({ left: makeIncipitPage(), right: makeDiagramPage(), d: makeInitialD(), dn: makeInitialDNormal(), lectern: makeDeskTexture(8) }),
    [],
  );
  const dix = smooth(prog(t, EV.dixit - 0.2, EV.dixit + 0.5)) * (1 - smooth(prog(t, EV.lamalama, EV.lamalama + 1)));
  const sweep = prog(t, EV.dixit - 0.1, EV.berkata + 0.6);
  const chain = win(t, EV.naskah - 0.2, EV.outStart + 0.6, 0.4);
  const gleam = 0.18 + 0.12 * Math.sin(t * 1.3) + 0.35 * dix;
  return (
    <group>
      <mesh position={[0, 0.24, -0.34]} rotation={[LECTERN.tilt, 0, 0]} castShadow>
        <RoundedBoxGeo args={[0.9, 0.52, 0.06]} />
        <meshStandardMaterial map={tex.lectern} roughness={0.6} />
      </mesh>
      <group position={LECTERN.pos} rotation={[LECTERN.tilt, 0, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[1.56, 1.04, 0.045]} radius={0.01} />
          <meshStandardMaterial map={tex.lectern} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.54, 0.045]} castShadow>
          <RoundedBoxGeo args={[1.56, 0.045, 0.07]} radius={0.01} />
          <meshStandardMaterial map={tex.lectern} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.028]} castShadow>
          <RoundedBoxGeo args={[1.4, 0.94, 0.014]} radius={0.005} />
          <meshPhysicalMaterial color="#5A1A12" roughness={0.55} sheen={0.4} sheenColor="#A0503A" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.33, 0, 0.043]} rotation={[0, side * -0.07, 0]} castShadow>
            <boxGeometry args={[0.63, 0.87, 0.024]} />
            <meshStandardMaterial color="#DCC69A" roughness={0.92} />
          </mesh>
        ))}
        <group rotation={[0, 0.07, 0]}>
          <mesh position={[-0.33, 0, 0.0565]} receiveShadow>
            <planeGeometry args={[PAGE.w, PAGE.h]} />
            <meshPhysicalMaterial map={tex.left} roughness={0.88} sheen={0.15} sheenRoughness={0.8} />
          </mesh>
          {/* ink shadow under the raised gold plate */}
          <mesh position={[INITIAL_LOCAL[0] + 0.004, INITIAL_LOCAL[1] - 0.005, 0.0575]}>
            <planeGeometry args={[INITIAL_SIZE * 0.97, INITIAL_SIZE * 0.97]} />
            <meshBasicMaterial color="#0A0603" alphaMap={tex.d} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <mesh position={[INITIAL_LOCAL[0], INITIAL_LOCAL[1], 0.0605]}>
            <planeGeometry args={[INITIAL_SIZE * 0.97, INITIAL_SIZE * 0.97]} />
            <meshPhysicalMaterial
              color="#E2AE3E"
              alphaMap={tex.d}
              transparent
              alphaTest={0.35}
              metalness={1}
              roughness={0.24}
              normalMap={tex.dn}
              normalScale={new THREE.Vector2(2.2, 2.2)}
              envMapIntensity={3.2}
              clearcoat={0.6}
              clearcoatRoughness={0.2}
              emissive="#7A4A0E"
              emissiveIntensity={gleam}
            />
          </mesh>
        </group>
        {/* travelling gleam over the gold initial ("Dixit") */}
        <pointLight position={[INITIAL_LOCAL[0] - 0.2 + 0.4 * sweep, INITIAL_LOCAL[1] + 0.12, 0.3]} intensity={0.35 + 1.4 * dix} distance={1.1} decay={1.5} color="#FFE6B8" />
        <group rotation={[0, -0.07, 0]}>
          <mesh position={[0.33, 0, 0.0565]} receiveShadow>
            <planeGeometry args={[PAGE.w, PAGE.h]} />
            <meshPhysicalMaterial map={tex.right} roughness={0.88} sheen={0.15} sheenRoughness={0.8} />
          </mesh>
        </group>
        <mesh position={[0.02, -0.5, 0.06]} rotation={[0, 0, 0.08]}>
          <planeGeometry args={[0.025, 0.2]} />
          <meshStandardMaterial color={P.rubricRed} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 0.1, 0.6]} intensity={1.6 * chain} distance={1.6} color="#FFD08A" />
      </group>
      {/* explanation tags on the codex */}
      <Tag3D anchor={pageToWorld(0.33, 0.44, 0.06)} lift={0.08} h={0.15} text="salinan Latin" sub="abad ke-13" vis={win(t, EV.latin - 0.1, EV.dixit + 0.2)} />
      <Tag3D anchor={pageToWorld(-0.33, -0.2, 0.06)} lift={0.02} h={0.06} text="Al-Khawarizmi berkata" style="ink" thread={false} vis={win(t, EV.berkata - 0.1, EV.lamalama + 0.2)} />
      {[
        { w: "Algorizmi", a: EV.lamalama - 0.1, b: EV.berarti + 0.05 },
        { w: "algorism", a: EV.berarti, b: EV.algorithm - 0.05 },
        { w: "algorithm", a: EV.algorithm - 0.1, b: EV.diBuku - 0.6 },
      ].map((m) => (
        <Tag3D key={m.w} anchor={[0, 1.06, -0.12]} lift={0.04} h={0.12} text={m.w} style={m.w === "algorithm" ? "gold" : "parchment"} thread={false} vis={win(t, m.a, m.b, 0.3)} />
      ))}
      <Tag3D anchor={pageToWorld(-0.33, 0.45, 0.06)} lift={0.03} h={0.05} text="naskah Latin" thread={false} vis={win(t, EV.naskah - 0.05, EV.kode - 0.15, 0.2)} />
    </group>
  );
};

/** Brass balance: the subtracted term (-4x²) moves to the other pan, then both sides balance. */
const Balance: React.FC<{ pos: V3; t: number }> = ({ pos, t }) => {
  const arm = 0.3;
  const mv = smooth(prog(t, EV.dipindah - 0.1, EV.seberangEnd + 0.5));
  const settleT = Math.max(0, t - EV.seimbang);
  const before = -0.12;
  const during = 0.1;
  let tilt: number;
  if (t < EV.dipindah) tilt = before + 0.012 * Math.sin(t * 1.4);
  else if (t < EV.seimbang) tilt = before + (during - before) * smooth(prog(t, EV.dipindah, EV.seberangEnd + 0.6));
  else tilt = during * Math.exp(-settleT * 1.6) * Math.cos(settleT * 5.2);
  const panPos = (s: number): V3 => [s * arm * Math.cos(tilt), 0.58 + s * arm * Math.sin(tilt) - 0.305, 0];
  const L = panPos(-1);
  const R = panPos(1);
  // the moving group (4 squares): from the right pan to the left pan along an arc
  const mp: V3 = [R[0] + (L[0] - R[0]) * mv, R[1] + (L[1] - R[1]) * mv + Math.sin(mv * Math.PI) * 0.22, 0];
  const landed = mv > 0.98;
  const cube = (key: string, p: V3, color: string) => (
    <mesh key={key} position={p} castShadow>
      <RoundedBoxGeo args={[0.038, 0.038, 0.038]} radius={0.005} />
      <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.5} />
    </mesh>
  );
  const blue = "#2E3E6E";
  const red = "#8A2A1E";
  const tagsA = win(t, EV.suku - 0.1, EV.dipindah + 0.2, 0.3);
  const tagsB = win(t, EV.seimbang - 0.1, EV.eqX + 0.3, 0.3);
  const world = (p: V3): V3 => [pos[0] + p[0], pos[1] + p[1], pos[2] + p[2]];
  return (
    <group>
      <group position={pos}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.04, 40]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.018, 0.56, 16]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.025, 20, 14]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
        {/* pointer needle shows the balance */}
        <mesh position={[0, 0.66, 0]} rotation={[0, 0, tilt]}>
          <coneGeometry args={[0.008, 0.11, 8]} />
          <meshStandardMaterial color="#D8B060" metalness={0.95} roughness={0.2} />
        </mesh>
        <group position={[0, 0.58, 0]} rotation={[0, 0, tilt]}>
          <mesh castShadow>
            <boxGeometry args={[arm * 2, 0.014, 0.014]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * arm, 0, 0]} rotation={[0, 0, -tilt]}>
              {[0, 1, 2].map((k) => {
                const a = (k / 3) * Math.PI * 2;
                const r = 0.075;
                const dx = Math.cos(a) * r;
                const dz = Math.sin(a) * r;
                const len = Math.hypot(0.3, r);
                return (
                  <mesh key={k} position={[dx / 2, -0.15, dz / 2]} rotation={[Math.atan2(dz, 0.3), 0, -Math.atan2(dx, 0.3)]}>
                    <cylinderGeometry args={[0.0018, 0.0018, len, 5]} />
                    <meshStandardMaterial {...BRASS} />
                  </mesh>
                );
              })}
              <mesh position={[0, -0.305, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.085, 0.06, 0.02, 36, 1, true]} />
                <meshStandardMaterial {...BRASS} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, -0.312, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.06, 32]} />
                <meshStandardMaterial {...BRASS} />
              </mesh>
              {s < 0
                ? cube("x2", [0, -0.283, 0], blue)
                : /* 40x: a bundle of brass rods ("akar") */
                  Array.from({ length: 10 }, (_, i) => (
                    <mesh key={i} position={[-0.04 + (i % 5) * 0.02, -0.292 + Math.floor(i / 5) * 0.012, -0.015 + Math.floor(i / 5) * 0.02]} rotation={[Math.PI / 2, 0, 0.1]} castShadow>
                      <cylinderGeometry args={[0.005, 0.005, 0.07, 8]} />
                      <meshStandardMaterial color="#C9A45C" metalness={0.8} roughness={0.3} />
                    </mesh>
                  ))}
            </group>
          ))}
        </group>
        {/* the moving term: 4 squares, red while subtracted, blue once it lands on the other side */}
        <group position={[mp[0], mp[1] + 0.022, mp[2] + (landed ? 0 : 0.03)]}>
          {[
            [-0.021, 0, -0.021],
            [0.021, 0, -0.021],
            [-0.021, 0, 0.021],
            [0.021, 0, 0.021],
          ].map((o, i) => cube(`m${i}`, [o[0], landed ? o[1] + 0.0 : o[1], o[2]], landed ? blue : red))}
        </group>
      </group>
      <Tag3D anchor={world([L[0], L[1] + 0.03, 0])} lift={0.16} h={0.07} text="x²" sub="kuadrat" vis={tagsA} />
      <Tag3D anchor={world([R[0], R[1] + 0.03, 0])} lift={0.16} h={0.07} text="40x − 4x²" sub="akar · kuadrat" vis={tagsA} />
      <Tag3D anchor={world([L[0], L[1] + 0.05, 0])} lift={0.16} h={0.07} text="5x²" style="gold" vis={tagsB} />
      <Tag3D anchor={world([R[0], R[1] + 0.03, 0])} lift={0.16} h={0.07} text="40x" style="gold" vis={tagsB} />
    </group>
  );
};

/** Brass astrolabe lying on the desk. */
const Astrolabe: React.FC<{ pos: V3; rot: V3 }> = ({ pos, rot }) => (
  <group position={pos} rotation={rot}>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[0.15, 0.15, 0.012, 64]} />
      <meshStandardMaterial {...BRASS} roughness={0.38} />
    </mesh>
    <mesh position={[0, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.15, 0.012, 12, 64]} />
      <meshStandardMaterial {...BRASS} roughness={0.26} />
    </mesh>
    {[0.11, 0.075].map((r) => (
      <mesh key={r} position={[0, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.0035, 8, 64]} />
        <meshStandardMaterial color="#D8B060" metalness={0.95} roughness={0.2} />
      </mesh>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[0, 0.01, 0]} rotation={[0, (i * Math.PI) / 8, 0]}>
        <boxGeometry args={[0.28, 0.003, 0.004]} />
        <meshStandardMaterial color="#D8B060" metalness={0.95} roughness={0.2} />
      </mesh>
    ))}
    <mesh position={[0, 0.0, -0.17]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.025, 0.006, 8, 24]} />
      <meshStandardMaterial {...BRASS} />
    </mesh>
  </group>
);


const sandCanvas = (lines: boolean) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(31);
  g.fillStyle = "#C9A774";
  g.fillRect(0, 0, 512, 320);
  for (let i = 0; i < 16000; i++) {
    const v = rnd();
    g.fillStyle = v > 0.5 ? `rgba(255,240,210,${rnd() * 0.35})` : `rgba(80,52,25,${rnd() * 0.4})`;
    g.fillRect(rnd() * 512, rnd() * 320, 1.5, 1.5);
  }
  // little ridges of dragged sand
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(90,60,30,${0.12 + rnd() * 0.12})`;
    g.lineWidth = 1;
    const y = rnd() * 320;
    const x = rnd() * 512;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 20, y + (rnd() - 0.5) * 8, x + 40 + rnd() * 30, y);
    g.stroke();
  }
  if (lines) {
    g.strokeStyle = "rgba(95,65,35,0.55)";
    g.lineWidth = 7;
    g.lineCap = "round";
    for (let r = 0; r < 3; r++) {
      g.beginPath();
      for (let x = 60; x < 450; x += 6) g.lineTo(x, 80 + r * 80 + Math.sin(x * 0.05 + r) * 10);
      g.stroke();
    }
  } else {
    // swept: soft parallel strokes of the palm
    for (let y = 10; y < 320; y += 14) {
      g.strokeStyle = `rgba(255,240,210,${0.05 + rnd() * 0.05})`;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(512, y + 6);
      g.stroke();
    }
  }
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};
const grooveCanvas = (kind: "digits" | "canal") => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 180;
  const g = c.getContext("2d")!;
  if (kind === "digits") {
    g.font = "700 132px Georgia, 'Times New Roman', serif";
    g.textBaseline = "middle";
    const s = "1 2 3 4 5 6 7 8 9";
    g.fillStyle = "rgba(255,244,220,0.55)";
    g.fillText(s, 26, 98);
    g.fillStyle = "rgba(78,50,22,0.85)";
    g.fillText(s, 20, 92);
  } else {
    g.lineCap = "round";
    const path = () => {
      g.beginPath();
      for (let x = 20; x <= 1004; x += 8) g.lineTo(x, 90 + Math.sin(x * 0.012) * 34);
    };
    g.strokeStyle = "rgba(78,50,22,0.85)";
    g.lineWidth = 46;
    path();
    g.stroke();
    g.strokeStyle = "rgba(60,110,160,0.95)";
    g.lineWidth = 26;
    path();
    g.stroke();
    g.strokeStyle = "rgba(200,230,255,0.6)";
    g.lineWidth = 5;
    path();
    g.stroke();
  }
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};

/** Sand board (takht): a canal is dug, the sand is swept, the nine numerals are written. */
const SandBoard: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => ({ sand: sandCanvas(true), swept: sandCanvas(false), digits: grooveCanvas("digits"), canal: grooveCanvas("canal") }), []);
  const wood = useMemo(() => makeWoodTexture(14, "#5A3820"), []);
  const kCanal = prog(t, EV.menggali - 0.1, EV.kanalEnd + 0.25);
  const sweptK = smooth(prog(t, EV.buku, EV.buku + 0.8));
  const kDig = prog(t, EV.angkaIndia - 0.15, EV.angkaArab + 0.35);
  const chain = win(t, EV.papan - 0.2, EV.outStart + 0.6, 0.4);
  // stylus tip follows the writing head (plane-local x)
  const writing = kCanal > 0 && kCanal < 1 ? { k: kCanal, y: -0.08 } : kDig > 0 && kDig < 1 ? { k: kDig, y: 0.06 } : null;
  const stylusVis = Math.max(win(t, EV.menggali - 0.5, EV.kanalEnd + 0.6, 0.3), win(t, EV.angkaIndia - 0.6, EV.angkaArab + 0.8, 0.3));
  const headX = writing ? -0.22 + 0.44 * writing.k : 0.24;
  const headY = writing ? writing.y + (writing.y > 0 ? 0.01 * Math.sin(writing.k * 60) : 0.035 * Math.sin((-0.22 + 0.44 * writing.k) * 26)) : 0;
  return (
    <group position={SAND.pos} rotation={[0, SAND.rotY, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.56, 0.04, 0.36]} radius={0.008} />
        <meshStandardMaterial map={wood} roughness={0.6} />
      </mesh>
      <group position={[0, 0.0415, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[0.5, 0.3]} />
          <meshStandardMaterial map={tex.sand} color="#C2AE92" roughness={1} />
        </mesh>
        <group position={[-0.23, -0.075, 0.0005]}>
          <RevealPlane tex={tex.canal} w={0.46} h={0.08} k={kCanal} renderOrder={1} />
        </group>
        {sweptK > 0.001 ? (
          <mesh position={[0, 0, 0.001]} renderOrder={2}>
            <planeGeometry args={[0.5, 0.3]} />
            <meshStandardMaterial map={tex.swept} color="#C2AE92" roughness={1} transparent opacity={sweptK} depthWrite={false} />
          </mesh>
        ) : null}
        <group position={[-0.23, 0.06, 0.0015]}>
          <RevealPlane tex={tex.digits} w={0.46} h={0.081} k={kDig} renderOrder={3} />
        </group>
        {stylusVis > 0.01 ? (
          <group position={[headX, headY, 0]} rotation={[0.5, -0.5, 0]}>
            <mesh position={[0.0, 0.0, 0.11]} castShadow>
              <cylinderGeometry args={[0.006, 0.0025, 0.22, 10]} />
              <meshStandardMaterial color="#6A4426" roughness={0.6} transparent opacity={stylusVis} />
            </mesh>
          </group>
        ) : null}
      </group>
      <pointLight position={[0, 0.3, 0]} intensity={1.2 * chain} distance={1.2} color="#FFD08A" />
      <Tag3D anchor={[0.12, 0.05, 0.08]} lift={0.14} h={0.07} parentYaw={SAND.rotY} text="kanal" vis={win(t, EV.menggali - 0.1, EV.mana)} />
      <Tag3D anchor={[-0.1, 0.05, -0.06]} lift={0.18} h={0.075} parentYaw={SAND.rotY} text="angka India" vis={win(t, EV.angkaIndia - 0.1, EV.teks)} />
      <Tag3D anchor={[0.14, 0.05, -0.06]} lift={0.34} h={0.075} parentYaw={SAND.rotY} text="angka Arab" sub="sebutan kini" style="gold" vis={win(t, EV.angkaArab - 0.1, EV.teks)} />
      <Tag3D anchor={[0, 0.05, -0.2]} lift={0.08} text="papan pasir" sub="Baghdad" h={0.045} thread={false} parentYaw={SAND.rotY} vis={win(t, EV.papan - 0.1, EV.naskah - 0.15, 0.2)} />
    </group>
  );
};

const InkAndQuill: React.FC<{ pos: V3 }> = ({ pos }) => {
  const feather = useMemo(() => makeFeatherTexture(), []);
  return (
    <group position={pos}>
      <mesh position={[0, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.062, 0.11, 32]} />
        <meshPhysicalMaterial color="#1A1410" roughness={0.12} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.111, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.03, 24]} />
        <meshStandardMaterial color="#050302" roughness={0.05} />
      </mesh>
      <group position={[0, 0.1, 0]} rotation={[0.35, 0.4, -0.38]}>
        <mesh position={[0, 0.22, 0]}>
          <planeGeometry args={[0.1, 0.42]} />
          <meshStandardMaterial map={feather} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

const CANDLES: { pos: V3; h: number; seed: number }[] = [
  { pos: [-0.86, 0, 0.36], h: 0.44, seed: 1 },
  { pos: [-1.08, 0, -0.18], h: 0.3, seed: 3 },
  { pos: [0.92, 0, -0.32], h: 0.36, seed: 2 },
  // front desk candle: warms the near wood and the writing board
  { pos: [1.28, 0, 0.98], h: 0.22, seed: 5 },
];

const Candles: React.FC<{ t: number }> = ({ t }) => {
  const glow = useMemo(() => makeGlowTexture(), []);
  return (
    <group>
      {CANDLES.map((c, i) => {
        const fl = candleFlicker(t, c.seed);
        const sway = Math.sin(t * 2.1 + c.seed) * 0.02;
        return (
          <group key={i} position={c.pos}>
            <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.11, 0.024, 32]} />
              <meshStandardMaterial {...BRASS} />
            </mesh>
            <mesh position={[0, 0.024 + c.h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.048, c.h, 28]} />
              <meshPhysicalMaterial color={P.candleWax} roughness={0.45} sheen={0.6} sheenColor="#FFE8C0" emissive="#5A3A10" emissiveIntensity={0.3} />
            </mesh>
            {[0.3, 2.2, 4.1].map((a, k) => (
              <mesh key={k} position={[Math.cos(a) * 0.045, 0.024 + c.h - 0.04 - k * 0.03, Math.sin(a) * 0.045]} scale={[1, 2.2, 1]}>
                <sphereGeometry args={[0.011, 10, 8]} />
                <meshStandardMaterial color={P.candleWax} roughness={0.4} />
              </mesh>
            ))}
            <group position={[0, 0.024 + c.h + 0.042, 0]} rotation={[0, 0, sway]}>
              <mesh scale={[1, 2.1 * fl, 1]} onUpdate={fx}>
                <sphereGeometry args={[0.015, 12, 10]} />
                <meshBasicMaterial color={P.candleFlame} toneMapped={false} />
              </mesh>
              <sprite scale={[0.42 * fl, 0.52 * fl, 1]} onUpdate={fx}>
                <spriteMaterial map={glow} color={P.candleAmber} transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
              </sprite>
              <pointLight color={P.candleAmber} intensity={(i === 0 ? 2.4 : i >= 3 ? 1.35 : 1.5) * fl} distance={5} decay={1.6} castShadow={i === 0} shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
            </group>
          </group>
        );
      })}
    </group>
  );
};


/** Library behind: shelves of codices, a hanging lantern, and one book spine stamped AUDIRA. */
const Library: React.FC<{ t: number }> = ({ t }) => {
  const glow = useMemo(() => makeGlowTexture(), []);
  const wood = useMemo(() => makeDeskTexture(21), []);
  const audira = useMemo(() => makeAudiraSpine(), []);
  const wall = useMemo(() => makeWallTexture(), []);
  const books = useMemo(() => {
    const rnd = mulberry32(77);
    const cols = ["#5A1A12", "#3A2A18", "#24315A", "#4A3A1A", "#2E4A3A", "#6A3A1A"];
    const out: { p: V3; s: V3; tex: THREE.Texture; r: number }[] = [];
    for (const shelfY of [0.62, 1.08, 1.54, 2.0]) {
      let x = -2.0;
      while (x < 2.0) {
        // keep a gap for the AUDIRA book
        if (shelfY === 1.08 && x > AUDIRA_BOOK[0] - 0.09 && x < AUDIRA_BOOK[0] + 0.05) {
          x = AUDIRA_BOOK[0] + 0.05;
          continue;
        }
        const w = 0.05 + rnd() * 0.05;
        const h = 0.26 + rnd() * 0.12;
        const lying = rnd() < 0.12;
        const col = cols[Math.floor(rnd() * cols.length)];
        if (lying && shelfY === 1.08 && x + 0.34 > AUDIRA_BOOK[0] - 0.09 && x < AUDIRA_BOOK[0] + 0.05) {
          x = AUDIRA_BOOK[0] + 0.05;
          continue;
        }
        if (lying) {
          const n = 2 + Math.floor(rnd() * 3);
          for (let k = 0; k < n; k++) out.push({ p: [x + 0.14, shelfY + 0.03 + k * 0.05, -1.48], s: [0.3, 0.045, 0.24], tex: makeSpineTexture(out.length, cols[k % cols.length]), r: 0 });
          x += 0.34;
        } else {
          out.push({ p: [x + w / 2, shelfY + h / 2, -1.48], s: [w, h, 0.24], tex: makeSpineTexture(out.length, col), r: (rnd() - 0.5) * 0.06 });
          x += w + 0.006;
        }
        if (rnd() < 0.05) x += 0.12;
      }
    }
    return out;
  }, []);
  const lf = candleFlicker(t, 9);
  const brand = win(t, EV.sejarah - 0.3, TOTAL + 1, 0.6);
  return (
    <group>
      <mesh position={[0, 1.6, -1.65]} receiveShadow>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial map={wall} color="#B89A80" roughness={0.95} />
      </mesh>
      {/* side walls of the reading room (same stone + tile band), so off-axis shots never fall into black */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 2.35, 1.6, 0.2]} rotation={[0, -sd * Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[4.2, 5]} />
          <meshStandardMaterial map={wall} color="#B89A80" roughness={0.95} />
        </mesh>
      ))}
      <pointLight position={[1.9, 1.5, 0.4]} intensity={0.45} distance={2.6} decay={1.5} color="#FFB870" />
      <pointLight position={[-1.9, 1.5, 0.4]} intensity={0.35} distance={2.6} decay={1.5} color="#FFB870" />
      {/* warm wash on the wall so the stone and tile band read behind the shelves */}
      <pointLight position={[-0.6, 2.3, -1.15]} intensity={0.55} distance={3.2} decay={1.5} color="#FFB870" />
      {[0.6, 1.06, 1.52, 1.98].map((y) => (
        <mesh key={y} position={[0, y, -1.5]} receiveShadow castShadow>
          <boxGeometry args={[4.4, 0.035, 0.34]} />
          <meshStandardMaterial map={wood} color="#9A7A60" roughness={0.7} />
        </mesh>
      ))}
      {[-1.25, 0, 1.25].map((x) => (
        <mesh key={x} position={[x, 1.4, -1.42]} castShadow>
          <boxGeometry args={[0.07, 2.4, 0.4]} />
          <meshStandardMaterial map={wood} color="#9A7A60" roughness={0.7} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={b.p} rotation={[0, 0, b.r]} castShadow receiveShadow>
          <RoundedBoxGeo args={b.s} radius={0.006} segments={2} />
          <meshStandardMaterial map={b.tex} roughness={0.7} />
        </mesh>
      ))}
      {/* the AUDIRA book: green leather, gold-stamped spine */}
      <mesh position={AUDIRA_BOOK} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.085, 0.38, 0.24]} radius={0.008} segments={2} />
        <meshPhysicalMaterial map={audira} roughness={0.45} sheen={0.4} sheenColor="#5A8A6A" clearcoat={0.3} emissive="#3A2A08" emissiveMap={audira} emissiveIntensity={0.12 + 0.4 * brand} />
      </mesh>
      <pointLight position={[AUDIRA_BOOK[0], AUDIRA_BOOK[1] + 0.1, AUDIRA_BOOK[2] + 0.5]} intensity={0.3 + 0.6 * brand} distance={1.4} color="#FFD08A" />
      {/* hanging brass lantern */}
      <group position={[0.62, 1.42, -0.95]} rotation={[0, 0.3 + Math.sin(t * 0.6) * 0.03, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 1.0, 4]} />
          <meshStandardMaterial color="#3A2A18" />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <coneGeometry args={[0.09, 0.12, 8]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.16, 8, 1, true]} />
          <meshStandardMaterial color="#FFC47A" emissive="#FF9A3C" emissiveIntensity={1.1 * lf} transparent opacity={0.8} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.072, -0.02, Math.sin((i / 8) * Math.PI * 2) * 0.072]}>
            <boxGeometry args={[0.008, 0.17, 0.008]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
        ))}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.08, 0.05, 0.03, 8]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
        <sprite scale={[0.7, 0.7, 1]} onUpdate={fx}>
          <spriteMaterial map={glow} color="#FFB060" transparent opacity={0.55 * lf} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <pointLight color="#FFB060" intensity={1.6 * lf} distance={3.2} decay={1.6} />
      </group>
      <Tag3D anchor={[-0.45, 1.56, -1.3]} lift={0.1} h={0.11} text="Baitul Hikmah" sub="pusat ilmu · Baghdad" style="gold" vis={win(t, EV.baitul + 0.6, EV.menulis - 0.6)} />
      <Tag3D anchor={[-0.1, 1.1, -1.3]} lift={0.03} h={0.07} text="masa Khalifah al-Ma'mun" style="ink" thread={false} vis={win(t, EV.khalifah - 0.1, EV.menulis - 0.6)} />
    </group>
  );
};

const Motes: React.FC<{ t: number }> = ({ t }) => {
  const glow = useMemo(() => makeGlowTexture(), []);
  const motes = useMemo(() => {
    const rnd = mulberry32(19);
    return Array.from({ length: 50 }, () => ({ x: (rnd() - 0.5) * 2.4, y: 0.4 + rnd() * 1.4, z: -0.9 + rnd() * 1.6, ph: rnd() * 6.28 }));
  }, []);
  return (
    <group>
      {motes.map((m, i) => (
        <sprite key={i} position={[m.x + Math.sin(t * 0.3 + m.ph) * 0.1, m.y + ((t * 0.03 + m.ph) % 0.4), m.z]} scale={[0.012, 0.012, 1]} onUpdate={fx}>
          <spriteMaterial map={glow} color="#FFE2B0" transparent opacity={0.45 + 0.35 * Math.sin(t * 1.7 + m.ph)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
};


const CHAIN_PTS: V3[] = [
  [SAND.pos[0], 0.12, SAND.pos[2]],
  [-0.35, 0.5, 0.25],
  [0, 0.86, -0.08],
  [0.4, 0.6, 0.1],
  [POS.slate[0], 0.32, POS.slate[2]],
  [0.35, 0.25, 0.45],
  [POS.phone[0], 0.06, POS.phone[2]],
];

export const KhawarizmiFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * FPS;
  const t = f / FPS;
  const desk = useMemo(() => makeDeskTexture(5), []);
  const shot = cameraAt(RIG, f, FPS, { lens: LENS, alive: { deg: 0.8 } });
  const camQ = useMemo(() => {
    tmpObj.position.set(...shot.pos);
    tmpObj.up.set(0, 1, 0);
    tmpObj.lookAt(...shot.target);
    // Object3D.lookAt points +z at the target; a camera looks down -z, so turn half around.
    tmpObj.rotateY(Math.PI);
    return tmpObj.quaternion.clone();
  }, [shot.pos[0], shot.pos[1], shot.pos[2], shot.target[0], shot.target[1], shot.target[2]]);

  return (
    <AbsoluteFill style={{ background: P.room }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0, 1.4, 2], fov: 36, near: 0.02, far: 30 }}>
        <CameraDriver pos={shot.pos} target={shot.target} fov={shot.fov} roll={shot.roll ?? 0} />
        <CamQ.Provider value={camQ}>
          <color attach="background" args={[P.room]} />
          <fog attach="fog" args={[P.room, 2.6, 7.5]} />
          <ambientLight intensity={0.16} color="#6A4A30" />
          <hemisphereLight args={["#7A5A3A", "#120A06", 0.28]} />
          <directionalLight position={[-3, 3, 2]} intensity={0.3} color="#C9B8A0" />
          <mesh position={[0, -0.05, 0.4]} receiveShadow>
            <RoundedBoxGeo args={[4.4, 0.1, 3.6]} radius={0.02} />
            <meshPhysicalMaterial map={desk} roughness={0.5} clearcoat={0.25} clearcoatRoughness={0.4} color="#F2C9A0" />
          </mesh>
          <Codex t={t} />
          <Balance pos={[0.3, 0, 0.78]} t={t} />
          <SandBoard t={t} />
          <Astrolabe pos={[-1.6, 0.008, -0.05]} rot={[0, 0.5, 0]} />
          <InkAndQuill pos={[1.3, 0, 0.62]} />
          <DeskMap t={t} />
          <AlJabrBook t={t} />
          <EquationBoard t={t} />
          <Uses t={t} />
          <LostBook t={t} />
          <CodeSlate t={t} />
          <Phone t={t} />
          <ChainThread t={t} pts={CHAIN_PTS} />
          <Candles t={t} />
          <Library t={t} />
          <Motes t={t} />
        </CamQ.Provider>
        <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.9} envIntensity={0.35} hdri="warmStudio" ao />
      </ThreeCanvas>
      <KhawarizmiOverlay t={t} />
      <Captions t={t} />
      <AudiraSignature seed="sejarah-islam-ep02" handle="@AUDIRAQISSAH" />
    </AbsoluteFill>
  );
};
