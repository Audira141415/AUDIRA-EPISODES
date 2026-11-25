// EP01 film, 3D layer: the cover's war-room map table, animated on the VO word clock.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { lathe } from "../../core/geometry/lathe.ts";
import { CHAMP } from "./worldData.ts";
import { proj } from "./geo.ts";
import { BG, CARD_H, CARD_W, MAP_YAW, MapSheet, SLAB_H, STEP, Table, Trophy, starGeo, NATIONS } from "./Cover.tsx";
import { plaqueTexture, tagTexture, GOLD } from "./coverTextures.ts";
import { ballTexture, infoCard, newsTexture, stamp } from "./filmTextures.ts";
import { T, seg, pop, win } from "./timing.ts";
import { camAt } from "./camera.ts";

type V3 = [number, number, number];
const TROPHY_POS: V3 = [1.5, 0, 1.5];

// ---------- camera ----------
const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, look } = camAt(t);
    camera.position.set(...pos);
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

/** Faces the live camera every frame (inside the rotated map group too). Cards shrink when the
 * camera comes close (screen size stays near the cover's), so close-ups never fill the frame. */
const FIT = 9.4;
const _v = new THREE.Vector3();
const Facing: React.FC<{ pos: V3; scale?: number; fitDist?: number; children: React.ReactNode }> = ({ pos, scale = 1, fitDist = FIT, children }) => {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.parent?.updateWorldMatrix(true, false);
    g.lookAt(camera.position);
    g.getWorldPosition(_v);
    const fit = Math.min(1, _v.distanceTo(camera.position) / fitDist);
    g.scale.setScalar(Math.max(scale * fit, 1e-4));
  });
  return (
    <group ref={ref} position={pos} visible={scale > 0.001}>
      {children}
    </group>
  );
};

const at = (lon: number, lat: number, y = 0): V3 => {
  const [x, z] = proj(lon, lat);
  return [x, y, z];
};

// ---------- nation state over time ----------
type NState = { lit: number; pin: number; stars: number[] };
const REVEAL: Record<string, { at: number; stars: number[] }> = {
  INGGRIS: { at: T.eng, stars: [T.eng + 1.0] },
  URUGUAY: { at: T.uru, stars: [T.dua1 - 0.2, T.dua1 - 0.05] },
  PRANCIS: { at: T.fra, stars: [T.dua1, T.dua1 + 0.15] },
  SPANYOL: { at: T.esp, stars: [T.esp + 0.55, T.kedua] },
  ARGENTINA: { at: T.arg, stars: [T.argTiga, T.argTiga + 0.12, T.argTiga + 0.24] },
  ITALIA: { at: T.ita, stars: [T.empat, T.empat + 0.12, T.empat + 0.24, T.empat + 0.36] },
  JERMAN: { at: T.ger, stars: [T.empat + 0.06, T.empat + 0.18, T.empat + 0.3, T.empat + 0.42] },
  BRASIL: { at: T.bra, stars: [T.lima, T.lima + 0.1, T.lima + 0.2, T.lima + 0.3, T.lima + 0.4] },
};
const nationState = (name: string, t: number): NState => {
  const r = REVEAL[name];
  // hook: cover state, then the board is cleared (3.6-4.2 s) and rebuilt nation by nation
  const clear = 1 - seg(t, T.hookEnd + 0.1, T.hookEnd + 0.7);
  const on = seg(t, r.at, r.at + 0.45);
  const lit = Math.max(clear, on);
  // during the count only the nation(s) being named keep a pin (less clutter in close shots);
  // all pins come back for the wide map at "Sekarang lihat petanya"
  const groupEnd: Record<string, number> = { INGGRIS: T.uru, URUGUAY: T.esp, PRANCIS: T.esp, SPANYOL: T.arg, ARGENTINA: T.ita, ITALIA: T.bra, JERMAN: T.bra, BRASIL: T.lihat };
  const away = seg(t, groupEnd[name] - 0.1, groupEnd[name] + 0.35) * (1 - seg(t, T.lihat + 0.2, T.lihat + 0.8));
  const pin = t < T.hookEnd + 0.8 ? clear : pop(t, r.at + 0.1, 0.45) * (1 - away);
  const stars = r.stars.map((s) => (t < T.hookEnd + 0.8 ? clear : pop(t, s, 0.3) * (1 - away)));
  return { lit, pin, stars };
};

// ---------- champion slab (dim -> gold) ----------
const DIM = new THREE.Color("#4B4A44");
const GOLDC = new THREE.Color("#D6A848");
const CODE: Record<string, string> = { INGGRIS: "ENG", PRANCIS: "FRA", SPANYOL: "ESP", JERMAN: "GER", ITALIA: "ITA", BRASIL: "BRA", URUGUAY: "URU", ARGENTINA: "ARG" };
const Champion: React.FC<{ code: string; lit: number; flash: number }> = ({ code, lit, flash }) => {
  const geo = useMemo(() => {
    const shapes = CHAMP[code].map((r) => new THREE.Shape(r.map(([lon, lat]) => {
      const [x, z] = proj(lon, lat);
      return new THREE.Vector2(x, -z);
    })));
    return new THREE.ExtrudeGeometry(shapes, { depth: SLAB_H, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
  }, [code]);
  const outline = useMemo(() => {
    const g = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: "#3A2206" });
    for (const r of CHAMP[code]) {
      const pts = r.map(([lon, lat]) => {
        const [x, z] = proj(lon, lat);
        return new THREE.Vector3(x, 0.004 + SLAB_H + 0.009, z);
      });
      g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    return g;
  }, [code]);
  const grain = useSurfaceGrain(23, 0.3, 40);
  const color = useMemo(() => DIM.clone().lerp(GOLDC, lit), [lit]);
  return (
    <>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004 - (1 - lit) * 0.02, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} emissive="#FFA030" emissiveIntensity={0.13 * lit + flash * 0.5} metalness={0.3 + 0.55 * lit} roughness={0.32} roughnessMap={grain} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <primitive object={outline} />
    </>
  );
};

// ---------- nation pin (rod + card + stars), grows from the territory ----------
const brass = <meshStandardMaterial color="#C99A4A" metalness={1} roughness={0.3} />;
const NationPin: React.FC<{ name: string; n: number; anchor: [number, number]; hover: [number, number]; h: number; st: NState }> = ({ name, n, anchor, hover, h, st }) => {
  const [ax, az] = proj(...anchor);
  const [hx, hz] = proj(...hover);
  const rod = useMemo(() => {
    const a = new THREE.Vector3(0, SLAB_H + 0.02, 0);
    const b = new THREE.Vector3(hx - ax, h - CARD_H / 2, hz - az);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.12;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.008, 8, false);
  }, [ax, az, hx, hz, h]);
  const tex = tagTexture(name, n);
  const p = Math.max(st.pin, 0);
  return (
    <group position={[ax, 0, az]} scale={Math.max(p, 1e-4)} visible={p > 0.002}>
      <mesh castShadow position={[0, SLAB_H + 0.02, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.03, 24]} />
        {brass}
      </mesh>
      <mesh geometry={rod} castShadow>
        {brass}
      </mesh>
      <Facing pos={[hx - ax, h, hz - az]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[CARD_W + 0.02, CARD_H + 0.02, 0.016]} radius={0.006} segments={2} />
          <meshStandardMaterial color="#B48A45" metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.0085]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial map={tex} roughness={0.5} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.22} />
        </mesh>
        {st.stars.map((s, i) => (
          <mesh key={i} geometry={starGeo} castShadow position={[(i - (n - 1) / 2) * STEP, CARD_H / 2 + 0.105 + (1 - Math.min(s, 1)) * 0.15, 0]} scale={Math.max(s, 1e-4)} visible={s > 0.002} rotation={[0, (1 - Math.min(s, 1)) * Math.PI, 0]}>
            <meshPhysicalMaterial color="#F4C35A" metalness={1} roughness={0.2} clearcoat={0.5} emissive="#7A4A08" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </Facing>
    </group>
  );
};

// ---------- floating info card (3D, faces camera) ----------
const Card: React.FC<{ pos: V3; tex: THREE.Texture; w: number; aspect: number; s: number }> = ({ pos, tex, w, aspect, s }) => (
  <Facing pos={pos} scale={s} fitDist={6.5}>
    <mesh>
      <RoundedBoxGeo args={[w + 0.02, w / aspect + 0.02, 0.016]} radius={0.006} segments={2} />
      <meshStandardMaterial color="#B48A45" metalness={1} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.0085]}>
      <planeGeometry args={[w, w / aspect]} />
      <meshStandardMaterial map={tex} roughness={0.5} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.22} />
    </mesh>
  </Facing>
);

/** Rubber stamp lying on the map. */
const Stamp: React.FC<{ pos: V3; tex: THREE.Texture; w: number; aspect?: number; s: number; rot?: number }> = ({ pos, tex, w, aspect = 3, s, rot = 0 }) => (
  <mesh position={[pos[0], pos[1] + 0.012 + (1 - Math.min(1, s)) * 0.3, pos[2]]} rotation={[-Math.PI / 2, 0, rot - MAP_YAW]} scale={Math.max(s, 1e-4)} visible={s > 0.002}>
    <planeGeometry args={[w, w / aspect]} />
    <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
  </mesh>
);

// ---------- konteks: 84 -> 13 -> 8 tokens ----------
const GRID_C = at(-45, -48);
const COLS = 12, ROWS = 7, GAP = 0.068;
const Tokens: React.FC<{ t: number }> = ({ t }) => {
  // which of the 84 are finalists (13) and champions (8): fixed, evenly spread picks
  const role = useMemo(() => {
    const r = new Array(84).fill(0);
    [3, 9, 16, 22, 27, 33, 40, 47, 52, 58, 65, 71, 78].forEach((i, k) => (r[i] = k < 8 ? 2 : 1));
    return r;
  }, []);
  const out = 1 - seg(t, T.eng - 0.9, T.eng - 0.2);
  if (t < T.n84 - 0.2 || out <= 0) return null;
  return (
    <group>
      {role.map((ro, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        const x = GRID_C[0] + (c - (COLS - 1) / 2) * GAP;
        const z = GRID_C[2] + (r - (ROWS - 1) / 2) * GAP;
        const appear = pop(t, T.n84 + i * 0.012, 0.3);
        const cut13 = ro === 0 ? seg(t, T.n13, T.n13 + 0.5) : 0;
        const cut8 = ro === 1 ? seg(t, T.n8, T.n8 + 0.5) : 0;
        const gone = Math.max(cut13, cut8);
        const lift = (ro >= 1 ? seg(t, T.n13, T.n13 + 0.4) * 0.05 : 0) + (ro === 2 ? seg(t, T.n8, T.n8 + 0.4) * 0.06 : 0);
        const col = ro === 2 && t > T.n8 ? "#F0B94A" : ro >= 1 && t > T.n13 ? "#F3EEE2" : "#2BD46A";
        const s = appear * out * (1 - gone * 0.6);
        if (s <= 0.002) return null;
        return (
          <mesh key={i} position={[x, 0.02 + lift - gone * 0.015, z]} scale={[s, s * (1 - gone * 0.7), s]} castShadow>
            <cylinderGeometry args={[0.026, 0.028, 0.026, 20]} />
            <meshPhysicalMaterial color={col} metalness={ro === 2 && t > T.n8 ? 1 : 0.1} roughness={0.3} clearcoat={0.6} emissive={col} emissiveIntensity={gone > 0.5 ? 0 : ro === 2 && t > T.n8 ? 0.15 : 0.25} transparent opacity={1 - gone * 0.75} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- football ----------
const Ball: React.FC<{ pos: V3; r: number; spin: number; s?: number }> = ({ pos, r, spin, s = 1 }) => (
  <mesh position={[pos[0], pos[1] + r, pos[2]]} rotation={[spin, spin * 0.6, 0]} scale={Math.max(s, 1e-4)} castShadow>
    <sphereGeometry args={[r, 48, 32]} />
    <meshPhysicalMaterial map={ballTexture()} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.2} />
  </mesh>
);

// ---------- first trophy: generic gold cup on a square base (not a replica) ----------
const CUP: [number, number][] = [
  [0, 0.16], [0.07, 0.16], [0.05, 0.2], [0.035, 0.3], [0.04, 0.36], [0.1, 0.4], [0.15, 0.48], [0.165, 0.58], [0.15, 0.6], [0.14, 0.59], [0.13, 0.5], [0, 0.46],
];
const FirstCup: React.FC<{ pos: V3; scale: number; ghost?: number; wrap?: number }> = ({ pos, scale, ghost = 0, wrap = 0 }) => {
  const g = ghost > 0;
  const body = useMemo(() => lathe(CUP, g ? 12 : 64), [g]);
  return (
    <group position={pos} scale={Math.max(scale, 1e-4)} visible={scale > 0.002}>
      <mesh castShadow position={[0, 0.08, 0]}>
        {g ? <boxGeometry args={[0.2, 0.16, 0.2]} /> : <RoundedBoxGeo args={[0.2, 0.16, 0.2]} radius={0.02} segments={2} />}
        {g ? <meshBasicMaterial color="#E8B54A" wireframe transparent opacity={0.22 * ghost} /> : <meshPhysicalMaterial color="#2B2F36" roughness={0.3} clearcoat={0.8} />}
      </mesh>
      <mesh geometry={body} castShadow>
        {g ? <meshBasicMaterial color="#E8B54A" wireframe transparent opacity={0.3 * ghost} /> : <meshPhysicalMaterial color="#F0B94A" metalness={1} roughness={0.18} clearcoat={0.4} side={THREE.DoubleSide} />}
      </mesh>
      {wrap > 0 && (
        <mesh position={[0, 0.3, 0]} scale={[1, wrap, 1]}>
          <cylinderGeometry args={[0.15, 0.13, 0.42, 9, 1, true]} />
          <meshStandardMaterial map={newsTexture()} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const Plinth: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
      <RoundedBoxGeo args={[0.36, 0.12, 0.36]} radius={0.015} segments={2} />
      <meshPhysicalMaterial color="#2A1A12" roughness={0.45} clearcoat={0.5} />
    </mesh>
    <mesh castShadow position={[0, 0.125, 0]}>
      <RoundedBoxGeo args={[0.38, 0.012, 0.38]} radius={0.005} segments={2} />
      <meshStandardMaterial color="#B48A45" metalness={1} roughness={0.3} />
    </mesh>
  </group>
);

// ---------- Pickles: a toy collie (sable + white), built from rounded parts ----------
const Dog: React.FC<{ pos: V3; heading: number; s: number; t: number }> = ({ pos, heading, s, t }) => {
  // rough collie: sable/tan body, big white neck ruff, long narrow wedge muzzle, tipped ears, white legs + tail tip
  const fur = useSurfaceGrain(41, 0.45, 10);
  const coat = { ...POLISH.fabric, roughness: 0.9, sheen: 1, sheenRoughness: 0.35, roughnessMap: fur, bumpMap: fur, bumpScale: 2.5 };
  const sable = <meshPhysicalMaterial {...coat} color="#B06A2E" sheenColor="#F0B070" />;
  const dark = <meshPhysicalMaterial {...coat} color="#6E3E1A" sheenColor="#B07040" />;
  const white = <meshPhysicalMaterial {...coat} color="#F4EEE2" sheenColor="#FFFFFF" />;
  const headSable = <meshPhysicalMaterial {...coat} color="#8A4A1E" sheenColor="#D08848" />;
  const wag = Math.sin(t * 12) * 0.35;
  return (
    <group position={pos} rotation={[0, heading, 0]} scale={Math.max(s, 1e-4)} visible={s > 0.002}>
      {/* long body with a darker saddle */}
      <mesh castShadow position={[0, 0.19, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.85]}>
        <capsuleGeometry args={[0.08, 0.15, 8, 16]} />
        {sable}
      </mesh>
      <mesh castShadow position={[-0.03, 0.235, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.8, 1, 0.8]}>
        <capsuleGeometry args={[0.055, 0.1, 8, 16]} />
        {dark}
      </mesh>
      {/* white neck ruff (mane) */}
      <mesh castShadow position={[0.13, 0.25, 0]} rotation={[0, Math.PI / 2, 0.5]} scale={[1, 1, 0.8]}>
        <torusGeometry args={[0.045, 0.03, 12, 24]} />
        {white}
      </mesh>
      <mesh castShadow position={[0.15, 0.19, 0]} scale={[0.8, 1.1, 0.9]}>
        <sphereGeometry args={[0.06, 20, 14]} />
        {white}
      </mesh>
      {/* head: narrow, elongated, with a white blaze */}
      <group position={[0.19, 0.32, 0]} rotation={[0, 0, -0.12]}>
        <mesh castShadow scale={[1.15, 0.9, 0.8]}>
          <sphereGeometry args={[0.05, 20, 14]} />
          {headSable}
        </mesh>
        {/* long tapered muzzle in the coat colour, black nose tip */}
        <mesh castShadow position={[0.085, -0.014, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.8, 1, 0.72]}>
          <cylinderGeometry args={[0.013, 0.032, 0.115, 16]} />
          {headSable}
        </mesh>
        <mesh position={[0.145, -0.016, 0]}>
          <sphereGeometry args={[0.017, 14, 10]} />
          <meshPhysicalMaterial {...POLISH.glossyEye} color="#0B0908" />
        </mesh>
        {/* white chin + white blaze from forehead down the muzzle */}
        <mesh position={[0.075, -0.034, 0]} scale={[3.2, 0.45, 0.8]}>
          <sphereGeometry args={[0.02, 12, 8]} />
          {white}
        </mesh>
        <mesh position={[0.055, 0.028, 0]} rotation={[0, 0, -0.32]} scale={[4.2, 0.32, 0.45]}>
          <sphereGeometry args={[0.02, 12, 8]} />
          {white}
        </mesh>
        {[-1, 1].map((k) => (
          <group key={k}>
            <mesh position={[0.03, 0.012, k * 0.03]}>
              <sphereGeometry args={[0.008, 10, 8]} />
              <meshPhysicalMaterial {...POLISH.glossyEye} color="#15100d" />
            </mesh>
            {/* semi-erect ear with folded tip */}
            <mesh castShadow position={[-0.02, 0.055, k * 0.028]} rotation={[k * 0.2, 0, 0.15]}>
              <coneGeometry args={[0.018, 0.045, 10]} />
              {sable}
            </mesh>
            <mesh castShadow position={[0.0, 0.075, k * 0.03]} rotation={[0, 0, -1.1]}>
              <coneGeometry args={[0.012, 0.02, 8]} />
              {sable}
            </mesh>
          </group>
        ))}
      </group>
      {/* legs: white socks */}
      {[[0.09, 0.04], [0.09, -0.04], [-0.09, 0.04], [-0.09, -0.04]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.07, z]}>
          <capsuleGeometry args={[0.02, 0.11, 6, 10]} />
          {white}
        </mesh>
      ))}
      {/* bushy tail, white tip */}
      <group position={[-0.16, 0.17, 0]} rotation={[wag * 0.4, 0, 0.35]}>
        <mesh castShadow position={[0, -0.05, 0]}>
          <capsuleGeometry args={[0.03, 0.1, 6, 10]} />
          {sable}
        </mesh>
        <mesh castShadow position={[0, -0.13, 0]}>
          <sphereGeometry args={[0.032, 12, 10]} />
          {white}
        </mesh>
      </group>
    </group>
  );
};

// ---------- small markers ----------
const Ring: React.FC<{ pos: V3; r: number; sx?: number; s: number; color?: string }> = ({ pos, r, sx = 1, s, color = "#2BD46A" }) => (
  <mesh position={[pos[0], 0.03, pos[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[Math.max(s, 1e-4) * sx, Math.max(s, 1e-4), 1]} visible={s > 0.002}>
    <ringGeometry args={[r * 0.96, r, 96]} />
    <meshBasicMaterial color={color} transparent opacity={0.9 * Math.min(1, s)} toneMapped={false} side={THREE.DoubleSide} />
  </mesh>
);

const House: React.FC<{ pos: V3; s: number; hot?: number }> = ({ pos, s, hot = 0 }) => (
  <group position={pos} scale={Math.max(s, 1e-4) * (1 + hot * 0.4)} visible={s > 0.002}>
    <mesh castShadow position={[0, 0.07, 0]}>
      <RoundedBoxGeo args={[0.1, 0.08, 0.1]} radius={0.01} segments={2} />
      <meshPhysicalMaterial color={hot > 0.5 ? "#2BD46A" : "#F3EEE2"} roughness={0.4} clearcoat={0.5} emissive={hot > 0.5 ? "#2BD46A" : "#000"} emissiveIntensity={0.3} />
    </mesh>
    <mesh castShadow position={[0, 0.14, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[0.09, 0.07, 4]} />
      <meshStandardMaterial color="#B48A45" metalness={1} roughness={0.3} />
    </mesh>
  </group>
);

/** Arc between two map points (gold tube), drawn progressively. */
const Arc: React.FC<{ a: V3; b: V3; height: number; p: number }> = ({ a, b, height, p }) => {
  const curve = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const M = A.clone().lerp(B, 0.5);
    M.y += height;
    return new THREE.QuadraticBezierCurve3(A, M, B);
  }, [a, b, height]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.012, 8, false), [curve]);
  if (p <= 0.001) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * Math.min(1, p) / 6) * 6);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={GOLD} emissive="#FFB040" emissiveIntensity={1.2} metalness={0.6} roughness={0.3} />
    </mesh>
  );
};

const WarmPool: React.FC<{ k: number }> = ({ k }) => {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-0.6, 0, 1.6);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight position={[-1.2, 6.5, 5.0]} target={target} intensity={110 * k} angle={0.42} penumbra={1} decay={2} color="#FFC98A" />
    </>
  );
};

// ---------- the scene ----------
export const FilmScene: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const ESP = at(-3.6, 40.2, 0.04), NJ = at(-74.1, 40.8, 0.0);
  const LONDON = at(-0.6, 51.2), RIO = at(-43.2, -22.9);
  const states = useMemo(() => Object.fromEntries(NATIONS.map((n) => [n.name, nationState(n.name, t)])), [t]);
  // konteks: Uruguay 1930 ring
  const uruRing = win(t, T.uruguay - 0.2, T.n84 + 0.3, 0.3, 0.4);
  // final 2026 vignette in New Jersey
  const finalOn = win(t, T.juli, T.arg + 0.2, 0.4, 0.5);
  const arcP = seg(t, T.juli - 0.1, T.menang + 0.4) * (1 - seg(t, T.arg, T.arg + 0.5));
  // penjelasan
  const contRing = win(t, T.benua, T.tuan, 0.5, 0.5);
  const noFinal = (a: number) => pop(t, a, 0.35) * (1 - seg(t, T.tuan - 0.2, T.tuan + 0.3));
  const hosts = (i: number) => pop(t, T.tuan + 0.15 + i * 0.1, 0.3) * (1 - seg(t, T.drama, T.drama + 0.6));
  const hot1998 = seg(t, T.terakhir, T.terakhir + 0.4);
  // payoff: first cup in London, Pickles, Rio 1983, current trophy since 1974
  const londonOn = t > T.drama - 0.2 && t < T.kini + 1;
  const cupLondon = t < T.dicuri1 + 0.2 ? pop(t, T.pertama - 0.3, 0.4) : 1 - seg(t, T.dicuri1 + 0.2, T.dicuri1 + 0.7);
  const cupFound = pop(t, T.ditemukan + 0.1, 0.4);
  const dog = pop(t, T.ditemukan, 0.45);
  const cupRio = 1 - seg(t, T.dicuri2 + 0.1, T.dicuri2 + 0.6);
  const ghost = seg(t, T.dicuri2 + 0.4, T.dicuri2 + 1.0);
  const trophyGlow = seg(t, T.kini, T.kini + 0.6) * (1 - seg(t, T.audira, T.audira + 0.5));
  const nextBra = win(t, T.berikut, T.outroCard + 1, 0.4, 0.3);
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={0.18} color="#C8D4E6" />
      <hemisphereLight args={["#BFD0E8", "#0A0705", 0.3]} />
      <spotLight
        position={[-2.2, 10, 3.0]}
        intensity={240}
        angle={0.55}
        penumbra={0.85}
        decay={2}
        color="#FFE1B0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      <directionalLight position={[4, 5, -5]} intensity={0.9} color="#8FB4E0" />
      <WarmPool k={seg(t, T.hookEnd, T.hookEnd + 1.0)} />
      <pointLight position={[2.6, 2.4, 2.4]} intensity={3 + trophyGlow * 6} distance={5} color="#FFD79A" />

      <group rotation={[0, MAP_YAW, 0]}>
        <Table />
        <MapSheet />
        {NATIONS.map((n) => (
          <Champion key={n.name} code={CODE[n.name]} lit={states[n.name].lit} flash={n.name === "BRASIL" ? win(t, T.berikut, T.outroCard + 1, 0.4, 0.3) * 0.6 : 0} />
        ))}
        {NATIONS.map((n) => (
          <NationPin key={n.name} {...n} st={states[n.name]} />
        ))}

        {/* KONTEKS: Uruguay 1930, then 84 -> 13 -> 8 */}
        <Ring pos={at(-56.2, -34.9)} r={0.22} s={uruRing} />
        <Card pos={at(-56.2, -34.9, 0.42)} tex={infoCard("uru1930", "1930 · URUGUAY", "Piala Dunia pertama")} w={0.95} aspect={3} s={pop(t, T.uruguay, 0.4) * (1 - seg(t, T.n84 - 0.1, T.n84 + 0.3))} />
        <Tokens t={t} />

        {/* PENGEMBANGAN: final 2026 in New Jersey */}
        <Arc a={ESP} b={[NJ[0], 0.05, NJ[2]]} height={0.9} p={arcP} />
        {finalOn > 0.001 && (
          <group>
            <Ring pos={NJ} r={0.2} s={finalOn} color="#E8B54A" />
            <ToyPerson f={f} seed={7} pose={t > T.ferran ? "cheer" : "stand"} position={[NJ[0] + 0.12, 0.005, NJ[2] + 0.05]} heading={0.9} scale={0.42 * finalOn} look={{ top: "#C8102E", bottom: "#1B2A57", outfit: "casual", hairStyle: 0, hair: "#2a1c14" }} />
            <Ball pos={[NJ[0] - 0.12, 0.005, NJ[2] + 0.12]} r={0.05} spin={t * 3} s={finalOn} />
            <Card pos={at(-74.1, 40.8, 0.72)} tex={infoCard("final26", "SPANYOL 1–0 ARGENTINA", "Final 2026 · perpanjangan waktu")} w={1.15} aspect={3} s={pop(t, T.menang - 0.1, 0.4) * finalOn} />
          </group>
        )}
        {/* Jerman: 3 of 4 as West Germany */}
        <Card pos={at(4, 22, 0.5)} tex={infoCard("jerbar", "3 SEBAGAI JERMAN BARAT", "1954 · 1974 · 1990")} w={1.1} aspect={3} s={pop(t, T.jerBarat - 0.3, 0.4) * (1 - seg(t, T.puncak, T.puncak + 0.4))} />

        {/* PENJELASAN: two continents, no final for the rest, host champions */}
        <Ring pos={at(8, 48)} r={0.75} sx={1.25} s={contRing} />
        <Ring pos={at(-58, -22)} r={1.25} sx={0.85} s={contRing} />
        <Stamp pos={at(20, 5)} tex={stamp("afr", "✕ AFRIKA")} w={1.1} s={noFinal(T.afrika)} rot={0.1} />
        <Stamp pos={at(56, 22)} tex={stamp("asia", "✕ ASIA")} w={0.85} s={noFinal(T.asia)} rot={-0.08} />
        <Stamp pos={at(-100, 42)} tex={stamp("amut", "✕ AMERIKA UTARA")} w={1.4} s={noFinal(T.amut)} rot={0.06} />
        {[[-56.2, -34.9], [12.5, 41.9], [-1.5, 52.5], [10, 50.5], [-60, -34], [2.4, 46.6]].map(([lon, lat], i) => (
          <House key={i} pos={at(lon, lat, SLAB_H)} s={hosts(i)} hot={i === 5 ? hot1998 : 0} />
        ))}

        {/* PAYOFF: London 1966 + Pickles; Rio 1983 */}
        {londonOn && (
          <group>
            <Plinth pos={LONDON} />
            <FirstCup pos={[LONDON[0], 0.13, LONDON[2]]} scale={0.75 * Math.max(0, cupLondon)} />
            <Dog pos={[LONDON[0] + 0.62, 0.01, LONDON[2] + 0.25]} heading={2.75} s={dog} t={t} />
            <FirstCup pos={[LONDON[0] + 0.4, 0.01, LONDON[2] - 0.14]} scale={0.6 * cupFound} wrap={1} />
          </group>
        )}
        {t > T.pickles + 0.5 && t < T.kini + 1.5 && (
          <group>
            <Plinth pos={RIO} />
            <FirstCup pos={[RIO[0], 0.13, RIO[2]]} scale={0.75 * Math.max(cupRio, 0)} />
            <FirstCup pos={[RIO[0], 0.13, RIO[2]]} scale={0.75} ghost={ghost} />
          </group>
        )}
        {/* OUTRO teaser ring around Brazil */}
        <Ring pos={at(-52, -11)} r={0.6} s={nextBra} />
      </group>

      <Trophy pos={TROPHY_POS} scale={1.8} />
      <mesh position={[1.42, 0.062, 2.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.215]} />
        <meshStandardMaterial map={plaqueTexture()} metalness={0.7} roughness={0.35} />
      </mesh>
      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} hdri="warmStudio" />
    </>
  );
};
