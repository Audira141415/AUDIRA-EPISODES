// EP77 Katakombe Paris — sets per scene (s7: PAPERWORLD skin via paper.tsx; geometry from the s6 CHRONICLE build). Layout notes: draft/FILM_LAYOUT_S4.md.
import React from "react";
import { DUSK, INK, NIGHT, ROOM_NIGHT } from "../kits/chronicle/looks.ts";
import type { Look } from "../kits/chronicle/Stage.tsx";
import { Figure, POSES, gait, idle, type Pose } from "../kits/chronicle/Figure.tsx";
import { Ground, Lantern, stone } from "../kits/chronicle/props.tsx";
import { Embers } from "../kits/chronicle/fx.tsx";
import { Candle } from "../film/fxextra.tsx";
import { Glb } from "../film/glb.tsx";
import type { SceneId } from "./timeline.ts";
import { paperLook } from "./paper.tsx";
import { Block, BoneWall, CutEarth, Plaque, Tunnel, boneMat, clothMat, cobble, darkMat, ease, hsh, lin, limestone, soilMat, windowMat, type V3 } from "./parts.tsx";

type P = { t: number };

// ------------------------------------------------------------------ looks
const TUNNEL: Look = {
  ...ROOM_NIGHT,
  key: { pos: [0, 10, -30], color: "#ffb46a", intensity: 0.35, shadow: { box: 14, at: [0, 0, -4], far: 80, bias: -0.0006 } },
  hemi: { sky: "#7a5a3e", ground: "#140c07", intensity: 0.5 },
  fill: { pos: [3, 4, 20], color: "#8a6a4a", intensity: 0.3 },
  fog: { color: "#1c130c", density: 0.055 },
  exposure: 1.12,
  bloom: { strength: 0.3, radius: 0.5, threshold: 0.8 },
};
const NIGHT_FOG: Look = { ...NIGHT, fog: { color: "#262c46", density: 0.03 }, hemi: { ...NIGHT.hemi, intensity: 0.7 } };
const NIGHT_STREET: Look = { ...NIGHT, fog: { color: "#1e2540", density: 0.018 }, hemi: { ...NIGHT.hemi, intensity: 0.65 } };
const DUSK_CUT: Look = { ...DUSK, hemi: { ...DUSK.hemi, intensity: 0.95 }, fog: { color: "#4f5674", density: 0.004 }, fill: { pos: [6, 4, 30], color: "#9a7a5a", intensity: 0.45 } };
const NIGHT_CUT: Look = { ...NIGHT, hemi: { ...NIGHT.hemi, intensity: 0.85 }, fog: { color: "#1b2440", density: 0.004 }, fill: { pos: [6, 4, 30], color: "#7a6a5a", intensity: 0.45 } };

// PAPERWORLD relight: each scene gets its own counter-colour (mint / cobalt / coral) against the warm candles.
const P_TUNNEL = paperLook(TUNNEL, { fill: "#8fc4d9", fillI: 1.1, hemi: 2.2 });
const P_OSSUARY = paperLook(TUNNEL, { fill: "#9dd1bb", fillI: 1.2, hemi: 2.4 });
const P_GATE = paperLook(TUNNEL, { fill: "#9eb2da", fillI: 1.2, hemi: 2.2 });
const P_DUSK = paperLook(DUSK_CUT, { fill: "#f0a892", fillI: 0.8, hemi: 1.5 });
const P_STREET = paperLook(NIGHT_STREET, { fill: "#f2d58e", fillI: 0.7, hemi: 1.8 });
const P_FOG = paperLook(NIGHT_FOG, { fill: "#f0a892", fillI: 0.7, hemi: 1.8 });
const P_CUT = paperLook(NIGHT_CUT, { fill: "#f2d58e", fillI: 0.8, hemi: 1.7 });

export const LOOKS: Record<SceneId, Look> = {
  S1: P_TUNNEL, S2: P_DUSK, S3A: P_STREET, S3B: P_TUNNEL, S4A: P_FOG, S4B: P_CUT,
  S5A: P_FOG, S5B: P_STREET, S6: P_OSSUARY, S7A: P_GATE, S7B: P_OSSUARY, S8: P_CUT,
};

// ------------------------------------------------------------------ shared bits
const HERO = INK.hero, GRIEF = INK.grief, FOE = INK.foe, NEUTRAL = INK.neutral;
const Lamp: React.FC<{ pos: V3; power?: number }> = ({ pos, power = 1 }) => (
  <group position={pos}>
    <Glb name="colonial-lamp-post" pos={[0, 0, 0]} h={3.8} />
    <mesh position={[0, 3.35, 0]} material={windowMat} userData={{ noMask: true }}>
      <sphereGeometry args={[0.13, 10, 8]} />
    </mesh>
    <pointLight position={[0, 3.3, 0.3]} color="#ffb860" intensity={22 * power} distance={14} decay={1.5} />
  </group>
);
/** a hand lantern held at the right hand of a standing figure at `pos` facing `rotY` */
const HeldLantern: React.FC<{ pos: V3; rotY: number; t: number; power?: number }> = ({ pos, rotY, t, power = 1 }) => {
  const hx = Math.cos(rotY) * -0.3, hz = Math.sin(rotY) * 0.3;
  const p: V3 = [pos[0] + hx, pos[1] + 0.62, pos[2] + hz + 0.12];
  const f = 1 + 0.1 * Math.sin(t * 13) * Math.sin(t * 5.3);
  return (
    <group>
      <Glb name="hand-lantern" pos={[p[0], p[1] - 0.18, p[2]]} h={0.34} />
      <mesh position={[p[0], p[1], p[2]]} material={windowMat} userData={{ noMask: true }}>
        <sphereGeometry args={[0.06 * f, 8, 6]} />
      </mesh>
      <pointLight position={[p[0], p[1] + 0.1, p[2] + 0.2]} color="#ffae5c" intensity={9 * f * power} distance={9} decay={1.5} />
    </group>
  );
};
const swing = (t: number, seed: number): Pose => ({
  ...POSES.stand(), spine: 0.25 + 0.15 * Math.sin(t * 4 + seed), lean: 0.1,
  armR: { fwd: 1.6 + 1.0 * Math.sin(t * 4 + seed), out: 0.15, elbow: 0.4 }, armL: { fwd: 1.3 + 0.9 * Math.sin(t * 4 + seed), out: 0.05, elbow: 0.5 },
  legL: { fwd: 0.25, out: 0.1, knee: 0.2 }, legR: { fwd: -0.2, out: 0.1, knee: 0.1 },
});

// ------------------------------------------------------------------ S1 bone tunnel (hook)
const BoneTunnel: React.FC<P & { plaque?: boolean; bones?: boolean; z1?: number }> = ({ t, plaque = true, bones = true, z1 = -14 }) => (
  <group>
    <Tunnel z0={7} z1={z1} />
    {bones && <BoneWall x0={z1 + 0.4} x1={6.5} z={-1.28} h={1.6} rotY={Math.PI / 2} seed={2} />}
    {bones && <BoneWall x0={-6.5} x1={-z1 - 0.4} z={-1.28} h={1.6} rotY={-Math.PI / 2} seed={5} />}
    {plaque && <Plaque lines={["AUDIRA"]} pos={[0, 1.75, z1 + 0.06]} w={1.3} h={0.42} glow={0.3} />}
    {[3, -1, -5, -9, -12.5].map((z, i) => (
      <group key={i}>
        <Candle pos={[i % 2 ? -0.9 : 0.9, 0, z]} t={t} seed={i + 1} power={2.4} />
        <pointLight position={[0, 2.0, z]} color="#ffb46a" intensity={6} distance={7} decay={1.6} />
      </group>
    ))}
    <Embers t={t} box={[-1.1, 0.2, z1, 1.1, 2.2, 6]} color="#e8c89a" count={90} size={0.07} />
  </group>
);
const S1: React.FC<P> = ({ t }) => <BoneTunnel t={t} />;

// ------------------------------------------------------------------ S2 / S8 cross-section of the city
const City: React.FC<P & { night?: boolean; cut?: boolean }> = ({ t, night, cut }) => (
  <group>
    <Glb name="townhouse-row-unit" pos={[-10, 0, -9]} h={8} />
    <Glb name="townhouse-row-unit" pos={[-5.6, 0, -9]} h={8.6} />
    <Glb name="brownstone-row-house" pos={[0.4, 0, -10]} h={12} />
    <Glb name="corner-tenement" pos={[8, 0, -12]} h={13} />
    {[-7.5, -1.5, 4.5].map((x, i) => <Lamp key={i} pos={[x, 0, -2.6]} power={night ? 1.4 : 0.7} />)}
    {night &&
      [-11, -9.2, -6.5, -4.7, -1.2, 0.4, 2.0].map((x, i) =>
        [3.2, 5.6].map((y, j) => (
          <mesh key={`${i}-${j}`} position={[x, y + (i % 2) * 0.3, -4.9]} material={windowMat} userData={{ noMask: true }}>
            <planeGeometry args={[0.55, 0.9]} />
          </mesh>
        )),
      )}
    {/* cut: ground only behind the section face (z < 0) so it never hides the cut earth from the camera */}
    <group position={[0, 0, cut ? -150.5 : 0]}>
      <Ground size={300} color="#1d1816" amp={0.6} />
    </group>
  </group>
);
const S2: React.FC<P> = ({ t }) => {
  const workers: [number, number, number][] = [[-2.2, -2.6, 2.2], [0.6, -2.9, -2.1], [2.4, -2.3, 1.9]];
  return (
    <group>
      <City t={t} cut />
      <group position={[0, 0, 0]}>
        <CutEarth chamber={[-6, 6, -7.5, -1.8]} zBack={-4.5} />
      </group>
      {workers.map(([x, z, ry], i) => (
        <Figure key={i} id={10 + i} outline={HERO} pos={[x, -7.5, z]} rotY={ry} pose={swing(t, i * 1.7)} look={{ hat: "caping", wear: "pants" }} t={t + i} />
      ))}
      <Glb name="mine-cart" pos={[4.2, -7.5, -1.8]} h={1.1} rotY={0.4} sil={{ id: 20, color: HERO, gain: 0.8 }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Block key={i} a={[-5 + (i % 3) * 0.62, -7.5 + Math.floor(i / 3) * 0.42, -2.4]} b={[-4.45 + (i % 3) * 0.62, -7.12 + Math.floor(i / 3) * 0.42, -1.9]} mat={limestone()} />
      ))}
      {[-4.5, 0, 4.5].map((x, i) => <pointLight key={i} position={[x, -5.2, -1.2]} color="#ffb46a" intensity={14} distance={9} decay={1.5} />)}
      <Glb name="hand-lantern" pos={[-0.8, -7.5, -1.4]} h={0.34} />
      <Embers t={t} box={[-5.5, -7.3, -4, 5.5, -2.2, 0]} color="#e8d2aa" count={110} size={0.08} />
    </group>
  );
};

// ------------------------------------------------------------------ S3A Rue d'Enfer collapses
const Street: React.FC<P & { hole?: boolean }> = ({ t, hole }) => (
  <group>
    {[0, -6, -12, -18, -24, -30].map((z, i) => (
      <group key={i}>
        <Glb name={i % 2 ? "townhouse-row-unit" : "brownstone-row-house"} pos={[-7.2, 0, z]} h={i % 2 ? 8 : 10} rotY={Math.PI / 2} />
        <Glb name={i % 2 ? "brownstone-row-house" : "townhouse-row-unit"} pos={[7.2, 0, z]} h={i % 2 ? 10 : 8} rotY={-Math.PI / 2} />
      </group>
    ))}
    {[-2, -10, -18, -26].map((z, i) => <Lamp key={i} pos={[i % 2 ? 3.6 : -3.6, 0, z]} />)}
    {hole ? (
      <>
        <Block a={[-8, -0.3, -6]} b={[8, 0, 12]} mat={cobble()} cast={false} />
        <Block a={[-8, -0.3, -40]} b={[8, 0, -12]} mat={cobble()} cast={false} />
        <Block a={[-8, -0.3, -12]} b={[-3, 0, -6]} mat={cobble()} cast={false} />
        <Block a={[3, -0.3, -12]} b={[8, 0, -6]} mat={cobble()} cast={false} />
      </>
    ) : (
      <Block a={[-8, -0.3, -40]} b={[8, 0, 12]} mat={darkMat} cast={false} />
    )}
  </group>
);
const S3A: React.FC<P> = ({ t }) => {
  const k = ease(lin(t, 21.0, 23.0));
  const crack = lin(t, 20.4, 21.0);
  return (
    <group>
      <Street t={t} hole />
      {/* the road over the old quarry: cobbles (tagged crimson) that drop into the void */}
      <group position={[0, -5.2 * k, -9]} rotation={[0.35 * k, 0, 0.12 * k]}>
        <mesh material={limestone()} userData={{ sil: { id: 30, color: FOE, gain: 1.2 } }} castShadow receiveShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[6, 0.3, 6]} />
        </mesh>
        {crack > 0 && <Block a={[-3, 0.01, -0.03]} b={[3, 0.02, 0.03]} mat={darkMat} cast={false} />}
      </group>
      {/* the pit */}
      <Block a={[-3.2, -8, -12.2]} b={[3.2, -7.8, -5.8]} mat={soilMat} />
      <Block a={[-3.3, -8, -12.2]} b={[-3, -0.3, -5.8]} mat={limestone()} />
      <Block a={[3, -8, -12.2]} b={[3.3, -0.3, -5.8]} mat={limestone()} />
      <Block a={[-3.3, -8, -12.4]} b={[3.3, -0.3, -12]} mat={limestone()} />
      <Block a={[-3.3, -8, -6]} b={[3.3, -0.3, -5.7]} mat={limestone()} />
      {/* light in the pit so the collapse reads: warm lantern glow from the old quarry below + cold moon rim */}
      <pointLight position={[0, -4.5, -9]} color="#e0a868" intensity={70} distance={16} decay={1.3} />
      <pointLight position={[0, 4, -4]} color="#9fb4d8" intensity={30} distance={18} decay={1.4} />
      {k > 0.2 && <Glb name="collapse-rubble-mound" pos={[0, -7.8, -9]} h={2.4 * k} sil={{ id: 31, color: FOE, gain: 0.9 }} />}
      {t > 21 && <Embers t={t - 21} box={[-3, -3, -12, 3, 3, -6]} color="#b8b0a4" count={160} rise={0.8} size={0.12} />}
    </group>
  );
};

// ------------------------------------------------------------------ S3B inspection of the quarries
const S3B: React.FC<P> = ({ t }) => {
  const s = t - 24.4;
  const z = -12 + s * 1.35;
  return (
    <group>
      <BoneTunnel t={t} plaque={false} bones={false} z1={-16} />
      {[-4.2, -9.2].map((zz, i) => (
        <group key={i}>
          <Block a={[-1.3, 0, zz - 0.35]} b={[-0.75, 2.3, zz + 0.35]} mat={stone()} />
          <Block a={[0.75, 0, zz - 0.35]} b={[1.3, 2.3, zz + 0.35]} mat={stone()} />
        </group>
      ))}
      <Figure id={40} outline={HERO} pos={[0.1, 0, z]} rotY={0} pose={gait(s * 4.4, 0, { head: [0.1, 0] })} look={{ hat: "tricorne", wear: "coat" }} t={t} />
      <HeldLantern pos={[0.1, 0.25, z]} rotY={0} t={t} power={1.4} />
      <Figure id={41} outline={HERO} gain={0.7} pos={[-0.55, 0, -4.9]} rotY={Math.PI / 2} pose={idle(POSES.kneel(0.3), t, 3)} look={{ hat: "caping" }} t={t} />
    </group>
  );
};

// ------------------------------------------------------------------ S4A Saints-Innocents cemetery
const Graves: React.FC<{ x0: number; x1: number; z0: number; z1: number; seed: number; id0: number; rise?: number }> = ({ x0, x1, z0, z1, seed, id0, rise = 1 }) => {
  const items: { p: V3; kind: number; r: number }[] = [];
  let n = 0;
  for (let z = z0; z > z1; z -= 2.1)
    for (let x = x0; x < x1; x += 1.7) {
      const h = hsh(n * 7.1 + seed);
      if (h < 0.12) { n++; continue; }
      items.push({ p: [x + (hsh(n + 3) - 0.5) * 0.6, 0, z + (hsh(n + 9) - 0.5) * 0.5], kind: h < 0.5 ? 0 : h < 0.8 ? 1 : 2, r: (hsh(n + 4) - 0.5) * 0.4 });
      n++;
    }
  const names = ["grave-cross", "carved-grave-stele", "grave-mound"];
  const hs = [1.4, 1.0, 0.5];
  return (
    <>
      {items.map((g, i) => (
        <Glb key={i} name={names[g.kind]} pos={[g.p[0], g.p[1] - (1 - rise) * hs[g.kind], g.p[2]]} h={hs[g.kind]} rotY={g.r} sil={{ id: id0 + i, color: GRIEF, gain: 0.75 }} />
      ))}
    </>
  );
};
const S4A: React.FC<P> = ({ t }) => (
  <group>
    <Ground size={300} color="#1a1a1e" amp={0.4} />
    <Glb name="arched-cemetery-gate" pos={[0, 0, -2]} h={4.2} />
    {[-4.2, -8.2, 4.2, 8.2].map((x, i) => <Glb key={i} name="cemetery-fieldstone-wall-run" pos={[x, 0, -2]} h={1.5} />)}
    <Graves x0={-7} x1={7.5} z0={-5} z1={-20} seed={4} id0={100} />
    <Glb name="parish-church" pos={[2, 0, -32]} h={18} />
    <Lantern pos={[-2.6, 0, -1.4]} t={t} seed={2} />
    <Lantern pos={[2.6, 0, -1.4]} t={t} seed={3} />
    <Embers t={t} box={[-8, 0.2, -20, 8, 3, 2]} color="#c9c4e0" count={80} rise={0.05} size={0.07} />
  </group>
);

// ------------------------------------------------------------------ S4B the cellar wall gives way (1780)
const S4B: React.FC<P> = ({ t }) => {
  const burst = ease(lin(t, 39.55, 40.9));
  const crack = lin(t, 38.4, 39.5);
  const bricks: { p: V3; i: number }[] = [];
  for (let y = 0; y < 7; y++) for (let z = 0; z < 10; z++) bricks.push({ p: [-0.5, -3.4 + 0.2 + y * 0.4, -4.4 + z * 0.44 + (y % 2) * 0.2], i: y * 10 + z });
  return (
    <group>
      <CutEarth chamber={[-0.5, 5, -3.4, -0.6]} zBack={-4.6} />
      <Glb name="corner-tenement" pos={[3.2, 0, -10]} h={12} />
      <Glb name="cemetery-fieldstone-wall-run" pos={[-1.2, 0, -3]} h={1.5} rotY={Math.PI / 2} />
      <Glb name="cemetery-fieldstone-wall-run" pos={[-1.2, 0, -7]} h={1.5} rotY={Math.PI / 2} />
      <Graves x0={-9} x1={-2.5} z0={-1.5} z1={-12} seed={8} id0={200} />
      <Lamp pos={[1.2, 0, -2]} />
      {/* the cellar: barrels, a lamp */}
      <pointLight position={[3, -1.4, -1.5]} color="#ffb46a" intensity={10} distance={8} decay={1.5} />
      {[3.6, 4.3].map((x, i) => (
        <mesh key={i} position={[x, -2.95, -3.6]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.9, 14]} />
          <meshStandardMaterial color="#3a2618" roughness={0.9} />
        </mesh>
      ))}
      {/* the wall shared with the cemetery soil: bricks tremble, then burst inward (+x) */}
      {bricks.map((b) => {
        const j = hsh(b.i * 1.7);
        const loose = j > 0.25 && b.p[1] < -1.0;
        const fly = loose ? burst : 0;
        const tremble = crack * (1 - burst) * 0.02 * Math.sin(t * 60 + b.i);
        return (
          <mesh
            key={b.i}
            position={[b.p[0] + 0.1 + fly * (1.2 + j * 2.2) + tremble, b.p[1] - fly * fly * (b.p[1] + 3.2) * 0.9, b.p[2] + fly * (j - 0.5) * 1.2]}
            rotation={[fly * j * 2, fly * (j - 0.5) * 3, fly * j * 1.5]}
            material={limestone()}
            castShadow
            userData={{ sil: { id: 300 + b.i, color: crack > 0 ? FOE : null, gain: 0.8 } }}
          >
            <boxGeometry args={[0.2, 0.38, 0.42]} />
          </mesh>
        );
      })}
      {/* grave soil pours in */}
      {burst > 0 && (
        <mesh position={[-0.4 + burst * 0.9, -3.4, -2.2]} scale={[1.6 * burst, 1.1 * burst, 2.1]} material={soilMat} castShadow>
          <sphereGeometry args={[1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      )}
      {t > 39.5 && <Embers t={t - 39.5} box={[-0.4, -3.3, -4.4, 3, -0.8, -0.2]} color="#9a8a78" count={140} size={0.1} rise={0.4} />}
    </group>
  );
};

// ------------------------------------------------------------------ S5A blessing of the quarry (7 April 1786)
const S5A: React.FC<P> = ({ t }) => {
  const pointing = t > 49.4;
  return (
    <group>
      <Ground size={300} color="#1c1a1c" amp={0.4} />
      <Glb name="crypt-well-head" pos={[0, 0, -3]} h={1.5} sil={{ id: 50, color: GRIEF, gain: 0.8 }} />
      <mesh position={[0, 1.2, -3]} material={darkMat}>
        <cylinderGeometry args={[0.7, 0.7, 0.05, 20]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Candle key={i} pos={[Math.cos(a) * 1.7, 0, -3 + Math.sin(a) * 1.7]} t={t} seed={i + 3} power={3} />;
      })}
      <Figure id={51} outline={NEUTRAL} pos={[1.7, 0, -1.9]} rotY={-0.9} pose={idle(pointing ? POSES.point("R", 0.1) : POSES.raiseFist(), t, 1)} look={{ wear: "robe", hat: "none" }} t={t} />
      {[[-1.6, 0.4], [-0.6, 0.9], [0.5, 0.9], [-1.1, 1.8], [0.1, 1.9], [1.2, 1.7]].map(([x, z], i) => (
        <Figure key={i} id={52 + i} outline={null} pos={[x, 0, z]} rotY={Math.PI + (x * -0.12)} pose={idle(i % 2 ? POSES.pray() : POSES.kneel(0.35), t, i)} look={{ wear: i % 3 ? "coat" : "robe", hat: i % 2 ? "tricorne" : "none" }} t={t + i} />
      ))}
      <Glb name="parish-church" pos={[-3, 0, -18]} h={15} />
      <Lantern pos={[-2.8, 0, -3.5]} t={t} seed={5} />
    </group>
  );
};

// ------------------------------------------------------------------ S5B the night convoy
const S5B: React.FC<P> = ({ t }) => {
  const s = t - 52;
  const lead = -14 + 1.6 * s;
  return (
    <group>
      <Ground size={300} color="#161418" amp={0.3} />
      {[-30, -24, -18, -12, -6, 0, 6].map((x, i) => (
        <Glb key={i} name={i % 2 ? "townhouse-row-unit" : "brownstone-row-house"} pos={[x, 0, -9]} h={i % 2 ? 8 : 10.5} />
      ))}
      {[-26, -18, -10, -2].map((x, i) => <Lamp key={i} pos={[x, 0, -3.6]} power={0.8} />)}
      {[0, 1, 2].map((i) => {
        const x = lead - i * 6.2;
        return (
          <group key={i}>
            <Glb name="four-wheel-wagon" pos={[x, 0, 0]} h={2.0} rotY={Math.PI / 2} />
            <mesh position={[x, 1.45, 0]} material={clothMat} castShadow userData={{ sil: { id: 60 + i, color: GRIEF, gain: 1.4 } }}>
              <boxGeometry args={[3.6, 0.9, 1.35]} />
            </mesh>
            <Glb name="draft-horse" pos={[x + 3.6, 0, 0]} h={1.75} rotY={Math.PI / 2} />
            <Figure id={70 + i} outline={NEUTRAL} pos={[x + 1.2, 0, 1.4]} rotY={Math.PI / 2} pose={gait(s * 7.2 + i, 0, {})} look={{ hat: "tricorne", wear: "coat", itemR: "torch" }} t={t + i} />
            <pointLight position={[x + 1.4, 2.1, 1.9]} color="#ff9a4a" intensity={10} distance={9} decay={1.5} />
          </group>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------ S6 the ossuary gallery (1786–1814)
const S6: React.FC<P> = ({ t }) => {
  const prog = 0.18 + 0.82 * ease(lin(t, 58.4, 66.5));
  const walk = lin(t, 59.8, 63.2);
  const x = -1.5 + 1.7 * ease(walk);
  const pointing = t > 63.2;
  return (
    <group>
      <Block a={[-10, -0.3, -2.4]} b={[10, 0, 6]} mat={limestone()} cast={false} />
      <Block a={[-10, 0, -2.6]} b={[10, 3.2, -2.0]} mat={stone()} />
      <Block a={[-10, 2.3, -2.6]} b={[10, 3.4, 0.6]} mat={limestone()} cast={false} />
      <BoneWall x0={-8} x1={8} z={-1.6} h={1.95} progress={prog} seed={7} />
      <Figure id={80} outline={HERO} pos={[x, 0, -0.3]} rotY={walk > 0 && walk < 1 ? Math.PI / 2 : pointing ? -2.6 : 0.4} pose={pointing ? idle(POSES.point("R", -0.2), t, 2) : walk > 0 && walk < 1 ? gait(t * 4.2, 0) : idle(POSES.stand(), t, 2)} look={{ hat: "bicorne", wear: "coat" }} t={t} />
      <HeldLantern pos={[x, 0.25, -0.3]} rotY={0} t={t} power={1.6} />
      {[-5.5, -2.5, 1.5, 4.5].map((cx, i) => <Candle key={i} pos={[cx, 0, -1.0]} t={t} seed={i + 9} power={2.2} />)}
      {[-6, -1, 4].map((cx, i) => <pointLight key={i} position={[cx, 2.0, 0.6]} color="#ffb46a" intensity={7} distance={7} decay={1.6} />)}
      <Embers t={t} box={[-6, 0.2, -1.4, 6, 2.2, 2]} color="#e8c89a" count={80} size={0.06} />
    </group>
  );
};

// ------------------------------------------------------------------ S7A the gate inscription
const S7A: React.FC<P> = ({ t }) => (
  <group>
    <Tunnel z0={6} z1={-14} w={3.6} h={3.7} endWall />
    <Block a={[-1.6, 0, -4.4]} b={[-1.0, 2.6, -3.7]} mat={stone()} />
    <Block a={[1.0, 0, -4.4]} b={[1.6, 2.6, -3.7]} mat={stone()} />
    <Block a={[-1.6, 2.6, -4.4]} b={[1.6, 3.4, -3.7]} mat={stone()} />
    <Plaque lines={["ARRÊTE ! C'EST ICI", "L'EMPIRE DE LA MORT"]} pos={[0, 3.0, -3.64]} w={2.6} h={0.62} glow={0.22} />
    <BoneWall x0={-1.0} x1={1.0} z={-11} h={1.8} seed={11} />
    <BoneWall x0={-11} x1={-4.6} z={-1.75} h={1.6} rotY={Math.PI / 2} seed={12} />
    <BoneWall x0={4.6} x1={11} z={-1.75} h={1.6} rotY={-Math.PI / 2} seed={13} />
    <Lantern pos={[-1.45, 0, -3.2]} t={t} seed={7} />
    <Lantern pos={[1.45, 0, -3.2]} t={t} seed={8} />
    <pointLight position={[0, 2.2, -8]} color="#ff9a4a" intensity={5} distance={8} decay={1.6} />
  </group>
);

// ------------------------------------------------------------------ S7B the spiral stair (131 steps)
const S7B: React.FC<P> = ({ t }) => {
  const s = t - 75.2;
  return (
    <group>
      <Glb name="spiral-stair-shaft" pos={[0, -9, 0]} h={9} />
      {/* rough shaft wall around the stair, open toward the camera's path */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <Block key={i} a={[Math.cos(a) * 7.2 - 0.9, -10, Math.sin(a) * 7.2 - 0.9]} b={[Math.cos(a) * 7.2 + 0.9, 3, Math.sin(a) * 7.2 + 0.9]} mat={limestone()} cast={false} />;
      })}
      <Block a={[-8, -10.3, -8]} b={[8, -10, 8]} mat={limestone()} cast={false} />
      {Array.from({ length: 6 }, (_, i) => {
        const u = (s * 0.55 + i * 1.15) % 6.9;
        const a = u * 1.25 + i * 0.4;
        const y = -0.3 - u * 1.25;
        const r = 2.0;
        return (
          <Figure key={i} id={90 + i} outline={NEUTRAL} gain={0.8} pos={[Math.cos(a) * r, y, Math.sin(a) * r]} rotY={-a} pose={gait(s * 4 + i, 0, {})} look={{ wear: i % 2 ? "coat" : "pants", hat: "none", body: i % 3 ? "m" : "f" }} t={t + i} />
        );
      })}
      {[-1, -4, -7].map((y, i) => <pointLight key={i} position={[0, y, 0]} color="#ffb46a" intensity={12} distance={9} decay={1.5} />)}
      {[0, 1, 2, 3].map((i) => <Candle key={i} pos={[Math.cos(i * 1.6) * 3.6, -10, Math.sin(i * 1.6) * 3.6]} t={t} seed={i + 20} power={2} />)}
    </group>
  );
};

// ------------------------------------------------------------------ S8 the city of light over the silent kingdom
const S8: React.FC<P> = ({ t }) => (
  <group>
    <City t={t} night />
    <CutEarth chamber={[-6, 6, -7.5, -1.8]} zBack={-4.5} />
    <BoneWall x0={-5.6} x1={5.6} z={-4.4} h={1.9} pos={[0, -7.5, 0]} seed={21} />
    <Plaque lines={["AUDIRA"]} pos={[0, -4.6, -4.44]} w={1.7} h={0.52} glow={0.35} />
    {[-4, 0, 4].map((x, i) => <Lantern key={i} pos={[x, -7.5, -2.6]} t={t} seed={i + 30} />)}
    <Figure id={95} outline={NEUTRAL} pos={[-2.2, -7.5, -2.0]} rotY={0.3} pose={idle(POSES.lookUp(), t, 4)} look={{ wear: "coat" }} t={t} />
    <mesh position={[0, -7.49, -2]} material={boneMat} visible={false}>
      <boxGeometry args={[0.01, 0.01, 0.01]} />
    </mesh>
  </group>
);

export const SCENES: Record<SceneId, React.FC<P>> = { S1, S2, S3A, S3B, S4A, S4B, S5A, S5B, S6, S7A, S7B, S8 };
