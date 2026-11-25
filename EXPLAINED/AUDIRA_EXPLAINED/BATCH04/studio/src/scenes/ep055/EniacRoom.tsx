// AE-055 ENIAC room (FILMNOIR): a 1940s hall of tall black accumulator panels lined up in a U,
// glass vacuum tubes glowing amber, neon decimal digit columns (0-9, one lit per column: ENIAC
// counted in decimal, never binary), patch cables sagging between sockets, a slatted window at the
// end throwing venetian-blind light down the corridor, and faceless silhouette operators.
// Deterministic: every value comes from the film clock `f` (60 fps) or a seeded prng.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, type Pose } from "./SilhouettePerson.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { prng } from "../../core/materials/textures.ts";

export const NOIR = {
  void: "#050506",
  steel: "#17191d",
  steelEdge: "#24272c",
  floor: "#2a2b2e",
  wall: "#1b1c1e",
  tube: "#ffb260",
  neon: "#ff6a2a",
  moon: "#dfe6ee",
  brass: "#b89a62",
};

// ---------------------------------------------------------------------------------------------
// Layout
const PANEL_W = 0.6;
const PANEL_H = 2.5;
const PANEL_D = 0.5;
const STEP = 0.64;
const ROW_X = 1.33; // panel centre |x|; fronts at |x| = ROW_X - PANEL_D/2
export const STEP_Z = STEP;
export const FRONT_X = ROW_X - PANEL_D / 2;
const BACK_Z = -9.9;
export const WINDOW = { x0: -0.95, x1: 0.95, y0: 2.75, y1: 3.85, z: -10.35 };
export const SPOT_POS: [number, number, number] = [0.25, 6.6, -17.5];

type PanelT = { m: THREE.Matrix4; seed: number; label: string };

/** Room options. Defaults reproduce the approved cover exactly. */
export type RoomCfg = {
  sideCount: number; // panels per side row (cover 21; film 18 + 4 at the back = 40, as in the research)
  zStart: number; // z of the first (nearest) side panel
  audiraSide: number; // right-row index carrying the AUDIRA brass plates
  power: number; // 0..1 share of filaments/neons lit, far end first (power-on wave)
  mirrorColor: string;
  floorOpacity: number;
  ceiling: boolean;
  spotX: number;
  spotI: number;
  shadowSize: number;
  coverOperators: boolean;
  foregroundCable: boolean;
  shaftI: number;
  plateLight: number; // warm light on the AUDIRA plate (film close-up)
  skipCable: number; // right-row index whose socket cables the film draws itself (-1 none)
};
export const COVER_ROOM: RoomCfg = {
  sideCount: 21, zStart: 4.2, audiraSide: 5, power: 1, mirrorColor: "#2e2e2e", floorOpacity: 0.86, ceiling: true,
  spotX: 0.25, spotI: 780, shadowSize: 2048, coverOperators: true, foregroundCable: true, shaftI: 0.2, plateLight: 0, skipCable: -1,
};
/** z of a right-row panel centre (film close-ups). */
export const rightPanelZ = (cfg: RoomCfg, i: number) => cfg.zStart - i * STEP;
export const SOCKET_X = (k: number) => -0.18 + k * 0.09;
export const SOCKET_Y = 1.14;

const panels = (SIDE_COUNT: number, Z_START: number, audiraSide: number): PanelT[] => {
  const out: PanelT[] = [];
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  let n = 1;
  for (let i = 0; i < SIDE_COUNT; i++) {
    const z = Z_START - i * STEP;
    q.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
    out.push({ m: new THREE.Matrix4().compose(new THREE.Vector3(-ROW_X, 0, z), q.clone(), s), seed: 100 + i, label: `ACCUMULATOR ${n++}` });
    q.setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0));
    out.push({ m: new THREE.Matrix4().compose(new THREE.Vector3(ROW_X, 0, z), q.clone(), s), seed: 300 + i, label: i === audiraSide ? "AUDIRA" : i % 5 === 2 ? "FUNCTION TABLE" : `ACCUMULATOR ${n++}` });
  }
  q.identity();
  [-0.96, -0.32, 0.32, 0.96].forEach((x, i) =>
    out.push({ m: new THREE.Matrix4().compose(new THREE.Vector3(x, 0, BACK_Z), q.clone(), s), seed: 600 + i, label: i === 1 ? "AUDIRA" : "MASTER PROGRAMMER" }),
  );
  return out;
};

// Local (panel space, front face at z = PANEL_D/2) instance transforms, combined with a panel matrix.
const place = (pm: THREE.Matrix4, x: number, y: number, z: number, rx = 0, sc: [number, number, number] = [1, 1, 1]) =>
  new THREE.Matrix4().multiplyMatrices(
    pm,
    new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new THREE.Vector3(...sc)),
  );

const FRONT = PANEL_D / 2;

// Instanced helper: matrices + optional colours, all set before the first draw.
const Instanced: React.FC<{
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mats: THREE.Matrix4[];
  colors?: THREE.Color[];
  cast?: boolean;
  receive?: boolean;
  count?: number;
}> = ({ geometry, material, mats, colors, cast = false, receive = false, count }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, mats.length);
    mats.forEach((mx, i) => m.setMatrixAt(i, mx));
    if (colors) colors.forEach((c, i) => m.setColorAt(i, c));
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = cast;
    m.receiveShadow = receive;
    m.frustumCulled = false;
    return m;
  }, [geometry, material, mats, colors, cast, receive]);
  // Only the draw count changes per frame; matrices and colours were set before the first draw.
  mesh.count = Math.max(0, Math.min(mats.length, count ?? mats.length));
  return <primitive object={mesh} />;
};

const labelTexture = (text: string, brass: boolean) => {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = brass ? "#a88a55" : "#2a2c30";
  g.fillRect(0, 0, 512, 96);
  g.strokeStyle = brass ? "#e2c88c" : "#55585e";
  g.lineWidth = 6;
  g.strokeRect(8, 8, 496, 80);
  g.fillStyle = brass ? "#1a140a" : "#d8d4c8";
  g.font = brass ? "bold 64px Georgia, 'Times New Roman', serif" : "bold 40px 'Courier New', monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 52);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// Sagging patch cable between two world points.
const cableGeo = (a: THREE.Vector3, b: THREE.Vector3, sag: number, r = 0.012) => {
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= sag;
  const curve = new THREE.CatmullRomCurve3([a, a.clone().lerp(mid, 0.5).add(new THREE.Vector3(0, -sag * 0.35, 0)), mid, b.clone().lerp(mid, 0.5).add(new THREE.Vector3(0, -sag * 0.35, 0)), b]);
  return new THREE.TubeGeometry(curve, 48, r, 8, false);
};

// ---------------------------------------------------------------------------------------------
export const EniacRoom: React.FC<{ f: number; cfg?: Partial<RoomCfg>; children?: React.ReactNode }> = ({ f, cfg: cfgIn, children }) => {
  const cfg: RoomCfg = { ...COVER_ROOM, ...cfgIn };
  const SIDE_COUNT = cfg.sideCount;
  const list = useMemo(() => panels(cfg.sideCount, cfg.zStart, cfg.audiraSide), [cfg.sideCount, cfg.zStart, cfg.audiraSide]);
  const grain = useSurfaceGrain(55, 0.3, 6);
  const floorGrain = useSurfaceGrain(56, 0.45, 18);

  // Materials
  const M = useMemo(() => {
    const steel = new THREE.MeshPhysicalMaterial({ color: NOIR.steel, metalness: 0.55, roughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.45 });
    const steelEdge = new THREE.MeshPhysicalMaterial({ color: NOIR.steelEdge, metalness: 0.7, roughness: 0.38 });
    const recess = new THREE.MeshStandardMaterial({ color: "#0a0a0b", roughness: 0.9 });
    const glass = new THREE.MeshPhysicalMaterial({ color: "#c9c3b8", roughness: 0.08, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false });
    const filament = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 0.72, 0.2), toneMapped: false });
    const neonOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.0, 0.3), toneMapped: false });
    const neonOff = new THREE.MeshStandardMaterial({ color: "#1c0f0b", roughness: 0.55, metalness: 0, envMapIntensity: 0.3 });
    const bakelite = new THREE.MeshPhysicalMaterial({ color: "#0d0c0b", ...POLISH.toyPlastic, roughness: 0.32, clearcoat: 0.8 });
    const socket = new THREE.MeshPhysicalMaterial({ color: "#8d8a83", metalness: 0.9, roughness: 0.3 });
    const rubber = new THREE.MeshPhysicalMaterial({ color: "#0c0c0d", roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.4 });
    const wall = new THREE.MeshStandardMaterial({ color: NOIR.wall, roughness: 0.92 });
    return { steel, steelEdge, recess, glass, filament, neonOn, neonOff, bakelite, socket, rubber, wall };
  }, []);
  useLayoutEffect(() => {
    M.steel.roughnessMap = grain;
    M.steel.needsUpdate = true;
  }, [M, grain]);

  const G = useMemo(
    () => ({
      tubeGlass: new THREE.CapsuleGeometry(0.026, 0.085, 6, 14),
      filament: new THREE.CylinderGeometry(0.007, 0.007, 0.07, 6),
      neon: new THREE.SphereGeometry(0.0115, 10, 8),
      knob: new THREE.CylinderGeometry(0.026, 0.03, 0.035, 18),
      socket: new THREE.CylinderGeometry(0.018, 0.018, 0.02, 14),
      plug: new THREE.CylinderGeometry(0.022, 0.026, 0.07, 14),
      bar: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );

  // Instances for every panel front.
  const inst = useMemo(() => {
    const tubes: THREE.Matrix4[] = [];
    const fils: THREE.Matrix4[] = [];
    const filCols: THREE.Color[] = [];
    const on: THREE.Matrix4[] = [];
    const off: THREE.Matrix4[] = [];
    const knobs: THREE.Matrix4[] = [];
    const sockets: THREE.Matrix4[] = [];
    const recesses: THREE.Matrix4[] = [];
    const rails: THREE.Matrix4[] = [];
    for (const p of list) {
      const r = prng(p.seed * 31 + 7);
      for (let k = 0; k < 3; k++) r();
      // tube rack window 0.32..1.05
      recesses.push(place(p.m, 0, 0.69, FRONT + 0.003, 0, [0.5, 0.74, 0.01]));
      recesses.push(place(p.m, 0, 2.03, FRONT + 0.003, 0, [0.5, 0.56, 0.01]));
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 6; col++) {
          const x = -0.2 + col * 0.08;
          const y = 0.42 + row * 0.18;
          tubes.push(place(p.m, x, y, FRONT + 0.035));
          fils.push(place(p.m, x, y - 0.005, FRONT + 0.035));
          const v = 0.45 + r() * 0.75;
          filCols.push(new THREE.Color(v, v, v));
        }
      // rack shelves
      for (let row = 0; row < 5; row++) rails.push(place(p.m, 0, 0.32 + row * 0.18, FRONT + 0.03, 0, [0.52, 0.012, 0.06]));
      // knobs (rotary switches) and sockets
      for (let k = 0; k < 6; k++) {
        knobs.push(place(p.m, -0.2 + k * 0.08, 1.42, FRONT + 0.018, Math.PI / 2));
        knobs.push(place(p.m, -0.2 + k * 0.08, 1.28, FRONT + 0.018, Math.PI / 2));
      }
      for (let k = 0; k < 5; k++) sockets.push(place(p.m, -0.18 + k * 0.09, 1.14, FRONT + 0.01, Math.PI / 2));
      // decimal neon display: 10 digit columns x 10 positions (0-9), exactly one lit per column
      for (let col = 0; col < 10; col++) {
        const digit = Math.floor(r() * 10);
        for (let d = 0; d < 10; d++) {
          const mx = place(p.m, -0.207 + col * 0.046, 1.8 + d * 0.05, FRONT + 0.012);
          (d === digit ? on : off).push(mx);
        }
      }
    }
    // Sort filaments and lit neons far end first, so `count` gives a power-on wave from the window.
    const zOf = (m: THREE.Matrix4) => m.elements[14];
    const order = fils.map((_, i) => i).sort((a, b) => zOf(fils[a]) - zOf(fils[b]));
    const filsS = order.map((i) => fils[i]);
    const colsS = order.map((i) => filCols[i]);
    const onS = [...on].sort((a, b) => zOf(a) - zOf(b));
    return { tubes, fils: filsS, filCols: colsS, on: onS, off, knobs, sockets, recesses, rails };
  }, [list]);

  // Patch cables: socket to socket across neighbouring panels, plus long drops to the digit tray.
  const cables = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    const plugs: THREE.Matrix4[] = [];
    const sideRows = [list.filter((_, i) => i < SIDE_COUNT * 2 && i % 2 === 0), list.filter((_, i) => i < SIDE_COUNT * 2 && i % 2 === 1), list.slice(SIDE_COUNT * 2)];
    sideRows.forEach((row, ri) =>
      row.forEach((p, i) => {
        const r = prng(p.seed * 17 + 3);
        r();
        const next = row[i + 1];
        const sa = Math.floor(r() * 5);
        const a = new THREE.Vector3(-0.18 + sa * 0.09, 1.14, FRONT + 0.06).applyMatrix4(p.m);
        const skip = ri === 1 && i === cfg.skipCable;
        if (next && r() < 0.8 && !skip) {
          const sb = Math.floor(r() * 5);
          const b = new THREE.Vector3(-0.18 + sb * 0.09, 1.14, FRONT + 0.06).applyMatrix4(next.m);
          out.push(cableGeo(a, b, 0.32 + r() * 0.35));
          plugs.push(place(p.m, -0.18 + sa * 0.09, 1.14, FRONT + 0.045, Math.PI / 2));
          plugs.push(place(next.m, -0.18 + sb * 0.09, 1.14, FRONT + 0.045, Math.PI / 2));
        }
        if ((r() < 0.55 || ri === 2) && !skip) {
          const sc = (sa + 2) % 5;
          const c0 = new THREE.Vector3(-0.18 + sc * 0.09, 1.14, FRONT + 0.06).applyMatrix4(p.m);
          const c1 = new THREE.Vector3(0.12 - r() * 0.24, 0.2, FRONT + 0.1).applyMatrix4(p.m);
          out.push(cableGeo(c0, c1, 0.12 + r() * 0.1, 0.011));
          plugs.push(place(p.m, -0.18 + sc * 0.09, 1.14, FRONT + 0.045, Math.PI / 2));
        }
      }),
    );
    // Foreground: a heavy loose cable draped across the near floor.
    if (cfg.foregroundCable) out.push(cableGeo(new THREE.Vector3(-1.05, 1.0, 2.0), new THREE.Vector3(0.6, 0.03, 3.4), 0.6, 0.02));
    return { out, plugs };
  }, [list, SIDE_COUNT, cfg.foregroundCable, cfg.skipCable]);

  // Labels on panel headers
  const labels = useMemo(
    () => list.map((p) => ({ p, tex: labelTexture(p.label, p.label === "AUDIRA") })),
    [list],
  );

  // Floor mirror (dim reflection under a lit, mostly opaque linoleum layer).
  const { size } = useThree();
  const mirror = useMemo(() => {
    const m = new Reflector(new THREE.PlaneGeometry(3.6, 13.2), {
      textureWidth: Math.round(size.width * 0.6),
      textureHeight: Math.round(size.height * 0.6),
      color: new THREE.Color(cfg.mirrorColor),
      clipBias: 0.002,
      multisample: 4,
    });
    // Reflector renders the mirrored view with shadow updates switched off; on a single still that
    // nested render can run before the shadow map exists (mirror shows unshadowed light). Force it.
    const orig = m.onBeforeRender.bind(m);
    m.onBeforeRender = (renderer, ...rest) => {
      renderer.shadowMap.needsUpdate = true;
      orig(renderer, ...rest);
    };
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, -0.001, -3.7);
    return m;
  }, [size.width, size.height, cfg.mirrorColor]);

  // Light shafts through each blind gap (additive, FX layer).
  const shafts = useMemo(() => {
    const S = new THREE.Vector3(cfg.spotX, SPOT_POS[1], SPOT_POS[2]);
    const gaps: number[] = [];
    const n = 11;
    for (let i = 0; i < n; i++) gaps.push(WINDOW.y0 + ((i + 0.5) / n) * (WINDOW.y1 - WINDOW.y0));
    const toFloor = (x: number, y: number) => {
      const w = new THREE.Vector3(x, y, WINDOW.z);
      const t = S.y / (S.y - y);
      return S.clone().add(w.clone().sub(S).multiplyScalar(t));
    };
    return gaps.map((y) => {
      const a0 = new THREE.Vector3(WINDOW.x0, y, WINDOW.z), a1 = new THREE.Vector3(WINDOW.x1, y, WINDOW.z);
      const b0 = toFloor(WINDOW.x0, y), b1 = toFloor(WINDOW.x1, y);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute([...a0.toArray(), ...a1.toArray(), ...b1.toArray(), ...b0.toArray()], 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      return g;
    });
  }, [cfg.spotX]);
  useLayoutEffect(() => () => shafts.forEach((g) => g.dispose()), [shafts]);
  const shaftMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uI: { value: COVER_ROOM.shaftI } },
        vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader:
          "varying vec2 vUv; uniform float uI; void main(){ float fall=pow(1.0-vUv.y,1.6); float edge=smoothstep(0.0,0.12,vUv.x)*smoothstep(1.0,0.88,vUv.x); gl_FragColor=vec4(vec3(0.86,0.9,0.95)*uI*fall*edge,1.0);}",
      }),
    [],
  );

  // Operators: faceless dark silhouettes, one patching a cable at the far end.
  const dark = { skin: "#0a0a0b", hair: "#060606", top: "#101012", bottom: "#0c0c0d", hairStyle: 1 as const, outfit: "casual" as const, cap: "#000", build: 0.95, height: 1 };
  const reach: Pose = useMemo(() => {
    const b = poseAt("stand", f, 4);
    return { ...b, rs: [-2.35, 0, -0.18], re: -0.35, head: [-0.18, 0.1, 0] };
  }, [f]);
  const reach2: Pose = useMemo(() => {
    const b = poseAt("stand", f, 9);
    return { ...b, ls: [-1.4, 0, 0.25], le: -0.6, head: [0.1, 0, 0] };
  }, [f]);

  shaftMat.uniforms.uI.value = cfg.shaftI * Math.min(1, cfg.spotI / 780);
  const nFil = Math.round(inst.fils.length * cfg.power);
  const nOn = Math.round(inst.on.length * cfg.power);

  // Gentle filament breathing for later film use (cover reads frame 15).
  const glow = 0.95 + Math.sin(f * 0.07) * 0.03;
  M.filament.color.setRGB(1.7 * glow, 0.72 * glow, 0.2 * glow);

  return (
    <group>
      {/* Panel bodies */}
      {list.map((p, i) => {
        const pos = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
        p.m.decompose(pos, q, s);
        const e = new THREE.Euler().setFromQuaternion(q);
        return (
          <group key={i} position={pos} rotation={e}>
            <mesh position={[0, PANEL_H / 2, 0]} material={M.steel} castShadow receiveShadow>
              <RoundedBoxGeo args={[PANEL_W, PANEL_H, PANEL_D]} radius={0.015} />
            </mesh>
            {/* header plate */}
            <mesh position={[0, 2.38, FRONT + 0.006]}>
              <planeGeometry args={[p.label === "AUDIRA" ? 0.5 : 0.46, p.label === "AUDIRA" ? 0.094 : 0.086]} />
              <meshPhysicalMaterial map={labels[i].tex} metalness={p.label === "AUDIRA" ? 0.75 : 0.2} roughness={0.38} clearcoat={0.5} />
            </mesh>
            {p.label === "AUDIRA" && (
              <mesh position={[0, 1.6, FRONT + 0.008]}>
                <planeGeometry args={[0.5, 0.094]} />
                <meshPhysicalMaterial map={labels[i].tex} metalness={0.75} roughness={0.32} clearcoat={0.6} />
              </mesh>
            )}
            {/* digit tray */}
            <mesh position={[0, 0.13, FRONT + 0.05]} material={M.steelEdge} castShadow receiveShadow>
              <RoundedBoxGeo args={[STEP, 0.14, 0.12]} radius={0.01} />
            </mesh>
            {/* plinth */}
            <mesh position={[0, 0.03, 0.02]} material={M.recess}>
              <boxGeometry args={[PANEL_W, 0.06, PANEL_D]} />
            </mesh>
          </group>
        );
      })}

      <Instanced geometry={G.bar} material={M.recess} mats={inst.recesses} receive />
      <Instanced geometry={G.bar} material={M.steelEdge} mats={inst.rails} cast receive />
      <Instanced geometry={G.tubeGlass} material={M.glass} mats={inst.tubes} />
      <Instanced geometry={G.filament} material={M.filament} mats={inst.fils} colors={inst.filCols} count={nFil} />
      <Instanced geometry={G.neon} material={M.neonOn} mats={inst.on} count={nOn} />
      <Instanced geometry={G.neon} material={M.neonOff} mats={inst.off} />
      <Instanced geometry={G.knob} material={M.bakelite} mats={inst.knobs} cast />
      <Instanced geometry={G.socket} material={M.socket} mats={inst.sockets} />
      <Instanced geometry={G.plug} material={M.rubber} mats={cables.plugs} cast />
      {cables.out.map((g, i) => (
        <mesh key={i} geometry={g} material={M.rubber} castShadow receiveShadow />
      ))}

      {/* Warm spill from the tube racks onto the floor */}
      {[-0.8, -4, -7.5].map((z, i) => (
        <React.Fragment key={i}>
          <pointLight position={[-0.5, 0.3, z]} color={NOIR.tube} intensity={0.55} distance={3.2} decay={2} />
          <pointLight position={[0.5, 0.3, z - 1.2]} color={NOIR.tube} intensity={0.55} distance={3.2} decay={2} />
        </React.Fragment>
      ))}

      {/* Room shell */}
      <primitive object={mirror} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[6, 26]} />
        <meshPhysicalMaterial color={NOIR.floor} roughness={0.42} roughnessMap={floorGrain} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.25} transparent opacity={cfg.floorOpacity} />
      </mesh>
      <mesh position={[-1.75, 2.1, -1.2]} rotation={[0, Math.PI / 2, 0]} material={M.wall} receiveShadow castShadow>
        <planeGeometry args={[18.3, 4.2]} />
      </mesh>
      <mesh position={[1.75, 2.1, -1.2]} rotation={[0, -Math.PI / 2, 0]} material={M.wall} receiveShadow castShadow>
        <planeGeometry args={[18.3, 4.2]} />
      </mesh>
      <mesh position={[0, 4.2, -1.2]} rotation={[Math.PI / 2, 0, 0]} material={M.wall} castShadow visible={cfg.ceiling}>
        <planeGeometry args={[6, 18.3]} />
      </mesh>
      {/* Back wall with the window opening */}
      {[
        [0, (WINDOW.y0) / 2, 3.6, WINDOW.y0],
        [0, (WINDOW.y1 + 4.2) / 2, 3.6, 4.2 - WINDOW.y1],
        [(-1.8 + WINDOW.x0) / 2, (WINDOW.y0 + WINDOW.y1) / 2, WINDOW.x0 + 1.8, WINDOW.y1 - WINDOW.y0],
        [(1.8 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, 1.8 - WINDOW.x1, WINDOW.y1 - WINDOW.y0],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, WINDOW.z - 0.08]} material={M.wall} castShadow receiveShadow>
          <boxGeometry args={[w, h, 0.16]} />
        </mesh>
      ))}
      {/* Window: mullions + venetian blind slats + bright sky card behind */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, WINDOW.y0 + (i / 8) * (WINDOW.y1 - WINDOW.y0), WINDOW.z + 0.02]} rotation={[-0.75, 0, 0]} castShadow>
          <boxGeometry args={[WINDOW.x1 - WINDOW.x0, 0.085, 0.004]} />
          <meshStandardMaterial color="#8c8f94" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, (WINDOW.y0 + WINDOW.y1) / 2, WINDOW.z - 0.04]} castShadow>
        <boxGeometry args={[0.04, WINDOW.y1 - WINDOW.y0, 0.05]} />
        <meshStandardMaterial color="#0b0b0c" />
      </mesh>
      <mesh position={[0, (WINDOW.y0 + WINDOW.y1) / 2, WINDOW.z - 0.9]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial color={new THREE.Color(1.6, 1.68, 1.8)} toneMapped={false} />
      </mesh>

      {/* Key light: cold daylight through the blinds */}
      <SpotKey x={cfg.spotX} intensity={cfg.spotI} size={cfg.shadowSize} />

      {/* Haze shafts */}
      {shafts.map((g, i) => (
        <mesh key={i} geometry={g} material={shaftMat} layers-mask={1 << FX_LAYER} renderOrder={5} />
      ))}

      {/* Pendant lamps (1940s enamel shades, dim) */}
      {[1.2, -3.4, -7.6].map((z, i) => (
        <group key={i} position={[0, 3.8, z]} visible={cfg.ceiling}>
          <mesh position={[0, 0.35, 0]} material={M.rubber}>
            <cylinderGeometry args={[0.006, 0.006, 0.8, 6]} />
          </mesh>
          <mesh material={M.steelEdge} castShadow>
            <coneGeometry args={[0.26, 0.2, 28, 1, true]} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.055, 16, 12]} />
            <meshBasicMaterial color={new THREE.Color(2.4, 1.7, 1.0)} toneMapped={false} />
          </mesh>
          
        </group>
      ))}


      {cfg.plateLight > 0 && (
        <pointLight position={[FRONT_X - 0.45, 1.75, rightPanelZ(cfg, cfg.audiraSide) + 0.25]} color="#ffd9a0" intensity={cfg.plateLight} distance={1.6} decay={2} />
      )}
      {children}
      {/* Silhouette operators (no faces: everything near-black, backlit) */}
      {cfg.coverOperators && <ToyPerson f={f} seed={4} look={dark} position={[0.32, 0, -9.05]} heading={Math.PI} scale={1.62} poseOverride={reach} />}
      {cfg.coverOperators && <ToyPerson f={f} seed={9} look={{ ...dark, hairStyle: 0 }} position={[0.62, 0, -5.2]} heading={Math.PI / 2 + 0.25} scale={1.7} poseOverride={reach2} />}
    </group>
  );
};

const SpotKey: React.FC<{ x: number; intensity: number; size: number }> = ({ x, intensity, size }) => {
  const light = useMemo(() => {
    const l = new THREE.SpotLight(NOIR.moon, 780, 45, 0.15, 0.12, 1.4);
    l.position.set(...SPOT_POS);
    l.castShadow = true;
    l.shadow.mapSize.set(size, size);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.02;
    l.shadow.camera.near = 2;
    l.shadow.camera.far = 40;
    l.target.position.set(0, 3.3, -10.35);
    return l;
  }, [size]);
  light.position.x = x;
  light.intensity = intensity;
  light.visible = intensity > 0.5;
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

// Rolling function table (for the film; not on the cover, it hid the operator): a portable rack of 10-position rotary switches on casters.
export const FunctionTable: React.FC<{
  position: [number, number, number];
  rotationY: number;
  M: { steel: THREE.Material; steelEdge: THREE.Material; bakelite: THREE.Material; recess: THREE.Material; rubber: THREE.Material };
  G: { knob: THREE.BufferGeometry; bar: THREE.BufferGeometry };
}> = ({ position, rotationY, M, G }) => {
  const W = 0.62, H = 1.05, D = 0.42;
  const knobs = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const pointers: THREE.Matrix4[] = [];
    const r = prng(5501);
    for (let row = 0; row < 10; row++)
      for (let col = 0; col < 6; col++) {
        const x = -0.22 + col * 0.088, y = 0.36 + row * 0.072;
        const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, D / 2 + 0.018), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(0.9, 1, 0.9));
        out.push(m);
        const a = (Math.floor(r() * 10) / 10) * Math.PI * 2;
        pointers.push(new THREE.Matrix4().compose(new THREE.Vector3(x + Math.sin(a) * 0.012, y + Math.cos(a) * 0.012, D / 2 + 0.037), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -a)), new THREE.Vector3(0.004, 0.022, 0.003)));
      }
    return { out, pointers };
  }, []);
  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8d2c4", roughness: 0.5 }), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.12 + H / 2, 0]} material={M.steel} castShadow receiveShadow>
        <RoundedBoxGeo args={[W, H, D]} radius={0.018} />
      </mesh>
      <mesh position={[0, 0.12 + 0.02, 0]} material={M.steelEdge} castShadow>
        <RoundedBoxGeo args={[W + 0.06, 0.05, D + 0.06]} radius={0.01} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <group key={i} position={[sx * (W / 2 - 0.04), 0.055, sz * (D / 2 - 0.04)]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={M.rubber} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.035, 18]} />
          </mesh>
        </group>
      ))}
      <Instanced geometry={G.knob} material={M.bakelite} mats={knobs.out} cast />
      <Instanced geometry={G.bar} material={white} mats={knobs.pointers} />
    </group>
  );
};
