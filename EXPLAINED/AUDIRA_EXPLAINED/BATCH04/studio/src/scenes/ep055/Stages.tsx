// AE-055 film stages that live away from the room: the hero vacuum tube (switch without moving
// parts) and the decimal ring counters (10 positions 0-9, one lit, carry like an odometer).
// Plus the rolling function table with turning rotary switches. All deterministic from `t`.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { prng } from "../../core/materials/textures.ts";
import { word, clip } from "./timing.ts";

export const TUBE_STAGE: [number, number, number] = [40, 0, 0];
export const RING_STAGE: [number, number, number] = [80, 0, 0];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

// ---------------------------------------------------------------------------------------------
// Hero vacuum tube
/** Switch state of the hero tube: blinks off/on on "saklar listrik". */
export const tubeOn = (t: number) => {
  const s = word("l05", "saklar").s;
  const l = word("l05", "listrik").s;
  if (t >= s && t < s + 0.28) return 0;
  if (t >= l + 0.05 && t < l + 0.33) return 0;
  return 1;
};

export const TubeStage: React.FC<{ t: number }> = ({ t }) => {
  const on = tubeOn(t);
  const grain = useSurfaceGrain(81, 0.25, 4);
  const G = useMemo(() => {
    const prof = [
      [0.0, 0.0], [0.15, 0.0], [0.158, 0.02], [0.16, 0.5], [0.155, 0.56], [0.13, 0.64], [0.085, 0.69], [0.03, 0.71], [0.012, 0.735], [0.0, 0.74],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const envelope = new THREE.LatheGeometry(prof, 64);
    const helix: THREE.Vector3[] = [];
    for (let i = 0; i <= 600; i++) {
      const a = (i / 600) * Math.PI * 2 * 18;
      helix.push(new THREE.Vector3(Math.cos(a) * 0.045, 0.14 + (i / 600) * 0.36, Math.sin(a) * 0.045));
    }
    const grid = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 900, 0.0018, 5, false);
    return { envelope, grid };
  }, []);
  const M = useMemo(
    () => ({
      glass: new THREE.MeshPhysicalMaterial({ color: "#dcd6cc", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, side: THREE.DoubleSide, depthWrite: false }),
      plate: new THREE.MeshPhysicalMaterial({ color: "#3a3b3e", metalness: 0.85, roughness: 0.42, side: THREE.DoubleSide }),
      wire: new THREE.MeshPhysicalMaterial({ color: "#b9b6ae", metalness: 1, roughness: 0.25 }),
      base: new THREE.MeshPhysicalMaterial({ color: "#121110", ...POLISH.toyPlastic, roughness: 0.3, clearcoat: 0.8 }),
      pin: new THREE.MeshPhysicalMaterial({ color: "#a8a49b", metalness: 1, roughness: 0.2 }),
      cathode: new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.3, 0.35), toneMapped: false }),
      electron: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.9, 2.4), toneMapped: false }),
      floor: new THREE.MeshPhysicalMaterial({ color: "#141416", roughness: 0.35, metalness: 0.2, clearcoat: 0.6 }),
      getter: new THREE.MeshPhysicalMaterial({ color: "#c9c6c0", metalness: 1, roughness: 0.12 }),
    }),
    [],
  );
  useLayoutEffect(() => {
    M.plate.roughnessMap = grain;
    M.plate.needsUpdate = true;
  }, [M, grain]);
  const glow = on ? 1 : 0.08;
  M.cathode.color.setRGB(3.2 * glow, 1.3 * glow, 0.35 * glow);

  // Electrons: cathode -> plate, only while the switch is on.
  const N = 140;
  const electrons = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0045, 10, 8), M.electron, N);
    m.frustumCulled = false;
    m.layers.set(FX_LAYER);
    return m;
  }, [M]);
  const seeds = useMemo(() => {
    const r = prng(5555);
    return Array.from({ length: N }, () => ({ a: r() * Math.PI * 2, y: 0.16 + r() * 0.32, ph: r(), sp: 1.4 + r() * 1.2 }));
  }, []);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  seeds.forEach((s, i) => {
    const k = (t * s.sp + s.ph) % 1;
    const rr = 0.014 + k * 0.05;
    tmp.makeTranslation(Math.cos(s.a) * rr, s.y, Math.sin(s.a) * rr);
    electrons.setMatrixAt(i, tmp);
  });
  electrons.instanceMatrix.needsUpdate = true;
  electrons.count = on ? N : 0;

  return (
    <group position={TUBE_STAGE}>
      {/* plinth and backdrop */}
      <mesh position={[0, -0.02, 0]} material={M.floor} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.04, 64]} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0b0b0c" roughness={0.95} />
      </mesh>
      <group position={[0, 0.2, 0]} scale={1.9}>
        <mesh geometry={G.envelope} material={M.glass} renderOrder={3} />
        {/* bakelite base with pins */}
        <mesh position={[0, -0.04, 0]} material={M.base} castShadow>
          <cylinderGeometry args={[0.165, 0.17, 0.09, 48]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.09, -0.1, Math.sin((i / 8) * Math.PI * 2) * 0.09]} material={M.pin}>
            <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
          </mesh>
        ))}
        {/* mica spacers, plate (anode, cut open at the front), grid helix, cathode */}
        {[0.11, 0.54].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} material={M.getter}>
            <cylinderGeometry args={[0.13, 0.13, 0.006, 40]} />
          </mesh>
        ))}
        <mesh position={[0, 0.325, 0]} material={M.plate} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.38, 48, 1, true, Math.PI * 0.35, Math.PI * 1.3]} />
        </mesh>
        <mesh geometry={G.grid} material={M.wire} />
        <mesh position={[0, 0.325, 0]} material={M.cathode}>
          <cylinderGeometry args={[0.011, 0.011, 0.4, 12]} />
        </mesh>
        <mesh position={[0, 0.66, 0]} material={M.getter}>
          <sphereGeometry args={[0.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <primitive object={electrons} />
        <pointLight position={[0, 0.33, 0.02]} color="#ffa04a" intensity={on ? 2.2 : 0.05} distance={1.6} decay={2} />
      </group>
      {/* cold rim from the window side, soft warm key */}
      <spotLight position={[-2.2, 3.4, -1.6]} angle={0.5} penumbra={0.6} intensity={150} color="#dfe6ee" distance={9} decay={2} />
      <pointLight position={[1.4, 1.6, 1.6]} intensity={3.2} color="#ffe2b8" distance={6} decay={2} />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Ring counters
export type RingState = { d: [number, number, number]; pulses: number[]; carry: number; showCarry: boolean };

/** Digits [hundreds, tens, ones] and pulse/carry progress (0..1 along their wires), from VO time. */
export const ringState = (t: number): RingState => {
  const l6 = clip("l06");
  const st = word("l06", "dirangkai").s;
  const nol = word("l06", "nol").s;
  const sembilan = word("l06", "sembilan");
  if (t < clip("l07").start) {
    let ones = 0;
    if (t >= st && t < nol) ones = Math.min(9, Math.floor((t - st) / 0.42) + 1);
    if (t >= nol) ones = Math.min(9, Math.floor(((t - nol) / Math.max(0.3, sembilan.e - nol)) * 10));
    return { d: [0, 0, t < l6.start ? 0 : ones], pulses: [], carry: -1, showCarry: false };
  }
  if (t < clip("l08").start) {
    const k = Math.floor((t - clip("l07").start) / 0.3) % 10;
    return { d: [0, 0, k], pulses: [], carry: -1, showCarry: false };
  }
  // l08: start at 005, four pulses -> 009, fifth pulse wraps 9 -> 0 and sends a carry to tens.
  const pulseWord = word("l08", "pulsa").s;
  const wrap = word("l08", "sembilan").s;
  const satu = word("l08", "satu", 1).s; // "menyimpan satu"
  const travel = 0.45;
  const arrivals = [0, 1, 2, 3].map((i) => pulseWord + 0.45 + i * ((wrap - pulseWord - 0.6) / 4)).concat([wrap]);
  const passed = arrivals.filter((a) => t >= a).length;
  let ones = 5 + passed;
  let tens = 0;
  if (ones >= 10) ones = 0;
  const carryStart = wrap + 0.05;
  const carry = t >= carryStart && t < satu ? (t - carryStart) / (satu - carryStart) : -1;
  if (t >= satu) tens = 1;
  const pulses = arrivals.map((a) => (t >= a - travel && t < a ? (t - (a - travel)) / travel : -1)).filter((x) => x >= 0);
  return { d: [0, tens, ones], pulses, carry, showCarry: t >= carryStart };
};

const dialTexture = () => {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256);
  grd.addColorStop(0, "#1d1c1a");
  grd.addColorStop(1, "#0d0c0b");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(256, 256, 254, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#8d7a55";
  g.lineWidth = 5;
  g.beginPath();
  g.arc(256, 256, 168, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#e9dcc0";
  g.font = "bold 52px Georgia, 'Times New Roman', serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let d = 0; d < 10; d++) {
    const a = (d / 10) * Math.PI * 2;
    g.fillText(String(d), 256 + Math.sin(a) * 212, 256 - Math.cos(a) * 212);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const RING_R = 0.24;
export const RING_X = [-0.56, 0, 0.56];
export const RING_Y = 1.38;

export const RingStage: React.FC<{ t: number; wide: boolean }> = ({ t, wide }) => {
  const st = ringState(t);
  const dial = useMemo(dialTexture, []);
  const grain = useSurfaceGrain(83, 0.3, 5);
  const M = useMemo(
    () => ({
      panel: new THREE.MeshPhysicalMaterial({ color: "#2a2722", metalness: 0.6, roughness: 0.42, clearcoat: 0.25 }),
      dial: new THREE.MeshPhysicalMaterial({ map: dial, roughness: 0.35, clearcoat: 0.6, metalness: 0.1 }),
      bulbOff: new THREE.MeshPhysicalMaterial({ color: "#2b1711", roughness: 0.25, clearcoat: 1, metalness: 0 }),
      bulbOn: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.5, 0.12), toneMapped: false }),
      bezel: new THREE.MeshPhysicalMaterial({ color: "#b8975a", metalness: 0.95, roughness: 0.28 }),
      wire: new THREE.MeshPhysicalMaterial({ color: "#0d0d0e", roughness: 0.5, clearcoat: 0.5 }),
      pulse: new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 2.2, 1.0), toneMapped: false }),
      floor: new THREE.MeshPhysicalMaterial({ color: "#121214", roughness: 0.4, metalness: 0.2, clearcoat: 0.5 }),
    }),
    [dial],
  );
  useLayoutEffect(() => {
    M.panel.roughnessMap = grain;
    M.panel.needsUpdate = true;
  }, [M, grain]);
  const lampPos = (ring: number, d: number) => {
    const a = (d / 10) * Math.PI * 2;
    return new THREE.Vector3(RING_X[ring] + Math.sin(a) * RING_R * 0.5, RING_Y + Math.cos(a) * RING_R * 0.5, 0.05);
  };
  // Pulse wire into the ones ring (from the right) and the carry arc ones -> tens.
  const wires = useMemo(() => {
    const inCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.5, 0.7, 0.06), new THREE.Vector3(1.1, 0.95, 0.06), new THREE.Vector3(0.9, RING_Y - 0.05, 0.06), new THREE.Vector3(RING_X[2] + RING_R + 0.02, RING_Y, 0.06),
    ]);
    const carryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(RING_X[2], RING_Y + RING_R + 0.02, 0.06), new THREE.Vector3((RING_X[2] + RING_X[1]) / 2, RING_Y + RING_R + 0.16, 0.06), new THREE.Vector3(RING_X[1], RING_Y + RING_R + 0.02, 0.06),
    ]);
    return {
      inCurve, carryCurve,
      inGeo: new THREE.TubeGeometry(inCurve, 64, 0.008, 8, false),
      carryGeo: new THREE.TubeGeometry(carryCurve, 64, 0.006, 8, false),
    };
  }, []);
  const rings = wide ? [0, 1, 2] : [2];
  return (
    <group position={RING_STAGE}>
      <mesh position={[0, RING_Y, -0.06]} material={M.panel} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.1, 1.1, 0.1]} radius={0.02} />
      </mesh>
      {/* rivets */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-0.92 + (i % 6) * 0.368, RING_Y + (i < 6 ? 0.47 : -0.47), 0]} material={M.bezel}>
          <sphereGeometry args={[0.012, 10, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.5]} rotation={[-Math.PI / 2, 0, 0]} material={M.floor} receiveShadow>
        <planeGeometry args={[8, 6]} />
      </mesh>
      <mesh position={[0, 1.8, -1.6]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#0a0a0b" roughness={1} />
      </mesh>
      {rings.map((ri) => (
        <group key={ri}>
          <mesh position={[RING_X[ri], RING_Y, 0.005]} rotation={[Math.PI / 2, 0, 0]} material={M.bezel} castShadow>
            <cylinderGeometry args={[RING_R + 0.018, RING_R + 0.018, 0.03, 64]} />
          </mesh>
          <mesh position={[RING_X[ri], RING_Y, 0.022]} material={M.dial}>
            <circleGeometry args={[RING_R, 64]} />
          </mesh>
          {Array.from({ length: 10 }, (_, d) => {
            const p = lampPos(ri, d);
            const lit = st.d[ri] === d;
            return (
              <mesh key={d} position={p} material={lit ? M.bulbOn : M.bulbOff}>
                <sphereGeometry args={[0.019, 16, 12]} />
              </mesh>
            );
          })}
          <pointLight position={lampPos(ri, st.d[ri]).add(new THREE.Vector3(0, 0, 0.08))} color="#ff8a3a" intensity={0.1} distance={0.5} decay={2} />
        </group>
      ))}
      <mesh geometry={wires.inGeo} material={M.wire} />
      {wide && <mesh geometry={wires.carryGeo} material={M.wire} />}
      {st.pulses.map((k, i) => (
        <mesh key={i} position={wires.inCurve.getPointAt(Math.min(1, k))} material={M.pulse} layers-mask={1 << FX_LAYER}>
          <sphereGeometry args={[0.022, 12, 10]} />
        </mesh>
      ))}
      {wide && st.carry >= 0 && (
        <mesh position={wires.carryCurve.getPointAt(Math.min(1, st.carry))} material={M.pulse} layers-mask={1 << FX_LAYER}>
          <sphereGeometry args={[0.026, 12, 10]} />
        </mesh>
      )}
      {/* warm key from front-left, cool rim from above-behind, soft warm fill */}
      <spotLight position={[-1.4, 2.6, 2.4]} angle={0.6} penumbra={0.7} intensity={95} color="#ffd6a0" distance={8} decay={2} />
      <spotLight position={[0.9, 3.0, -1.0]} angle={0.7} penumbra={0.6} intensity={70} color="#cfd9e6" distance={6} decay={2} />
      <pointLight position={[1.0, 1.0, 1.6]} intensity={1.6} color="#ffd2a0" distance={4} decay={2} />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Rolling function table: 6 x 10 rotary switches (10 positions each) on casters.
export const FilmTable: React.FC<{ position: [number, number, number]; rotationY: number; t: number; turnFrom: number }> = ({ position, rotationY, t, turnFrom }) => {
  const W = 0.62, H = 1.05, D = 0.42;
  const grain = useSurfaceGrain(84, 0.3, 4);
  const M = useMemo(
    () => ({
      steel: new THREE.MeshPhysicalMaterial({ color: "#17191d", metalness: 0.55, roughness: 0.5, clearcoat: 0.15 }),
      edge: new THREE.MeshPhysicalMaterial({ color: "#24272c", metalness: 0.7, roughness: 0.38 }),
      knob: new THREE.MeshPhysicalMaterial({ color: "#0d0c0b", ...POLISH.toyPlastic, roughness: 0.3, clearcoat: 0.8 }),
      rubber: new THREE.MeshPhysicalMaterial({ color: "#0c0c0d", roughness: 0.6 }),
      pointer: new THREE.MeshStandardMaterial({ color: "#e2dccd", roughness: 0.5 }),
      ticks: new THREE.MeshStandardMaterial({ color: "#8d8778", roughness: 0.6 }),
    }),
    [],
  );
  useLayoutEffect(() => {
    M.steel.roughnessMap = grain;
    M.steel.needsUpdate = true;
  }, [M, grain]);
  const knobs = useMemo(() => {
    const r = prng(5501);
    const out: { x: number; y: number; base: number; turnAt: number; steps: number }[] = [];
    for (let row = 0; row < 10; row++)
      for (let col = 0; col < 6; col++)
        out.push({ x: -0.22 + col * 0.088, y: 0.36 + row * 0.072, base: Math.floor(r() * 10), turnAt: r() * 1.6, steps: 1 + Math.floor(r() * 3) });
    return out;
  }, []);
  const knobMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.026, 0.03, 0.035, 18), M.knob, knobs.length);
    const tickM = new THREE.Matrix4();
    knobs.forEach((k, i) => {
      tickM.compose(new THREE.Vector3(k.x, k.y, D / 2 + 0.018), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(0.9, 1, 0.9));
      m.setMatrixAt(i, tickM);
    });
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = true;
    return m;
  }, [knobs, M]);
  const ptrMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.pointer, knobs.length);
    m.frustumCulled = false;
    return m;
  }, [knobs, M]);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  knobs.forEach((k, i) => {
    const lt = t - turnFrom - k.turnAt;
    const turned = lt > 0 ? Math.min(k.steps, lt / 0.22) : 0;
    const a = ((k.base + ease(turned % 1) + Math.floor(turned)) / 10) * Math.PI * 2;
    tmp.compose(
      new THREE.Vector3(k.x + Math.sin(a) * 0.012, k.y + Math.cos(a) * 0.012, D / 2 + 0.037),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -a)),
      new THREE.Vector3(0.004, 0.022, 0.003),
    );
    ptrMesh.setMatrixAt(i, tmp);
  });
  ptrMesh.instanceMatrix.needsUpdate = true;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.12 + H / 2, 0]} material={M.steel} castShadow receiveShadow>
        <RoundedBoxGeo args={[W, H, D]} radius={0.018} />
      </mesh>
      <mesh position={[0, 0.14, 0]} material={M.edge} castShadow>
        <RoundedBoxGeo args={[W + 0.06, 0.05, D + 0.06]} radius={0.01} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (W / 2 - 0.04), 0.055, sz * (D / 2 - 0.04)]} rotation={[0, 0, Math.PI / 2]} material={M.rubber} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.035, 18]} />
        </mesh>
      ))}
      <primitive object={knobMesh} />
      <primitive object={ptrMesh} />
    </group>
  );
};
