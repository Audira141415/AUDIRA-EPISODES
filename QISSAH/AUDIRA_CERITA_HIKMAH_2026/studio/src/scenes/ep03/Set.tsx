// The tabletop clay farm: table, rolled grass slab, barn, house, shed, pen, coop, haystack, pond, trees, kennel, gate.
import React, { useMemo } from "react";
import * as THREE from "three";
import { C, clay, cyl, lump, slab } from "./clay";
import { M } from "./Cast";
import { BARN, COOP, GATE, HAY, HOUSE, KENNEL, LANTERN, PEN, POND, SHED, WILLOW, type V3, clamp, lerp } from "./layout";

const hashN = (n: number) => {
  const s = Math.sin(n * 91.7 + 17.3) * 43758.5453;
  return s - Math.floor(s);
};

/* ---------- painted backdrop card (gradient + clay sun / moon / clouds) ---------- */

const mixHex = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(k));
const skyAt = (dusk: number, night: number) => ({
  top: mixHex(mixHex("#7fb6d9", "#c97a6e", dusk).getStyle(), "#1d2650", night),
  mid: mixHex(mixHex("#f6d9a0", "#f4a26a", dusk).getStyle(), "#4b3f6e", night),
  low: mixHex(mixHex("#fbe8bf", "#ffc27a", dusk).getStyle(), "#7a5a78", night),
});

const Backdrop: React.FC<{ dusk: number; night: number }> = ({ dusk, night }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uLow: { value: new THREE.Color() } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; varying vec2 vUv;
          float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
          void main(){ float y = vUv.y; vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.45, y)); c = mix(c, uTop, smoothstep(0.4, 1.0, y));
            float brush = sin(vUv.x * 60.0 + sin(vUv.y * 9.0) * 3.0) * 0.012 + (h(floor(vUv * vec2(300.0, 160.0))) - 0.5) * 0.02;
            gl_FragColor = vec4(c + brush, 1.0); }`,
        side: THREE.BackSide,
      }),
    [],
  );
  const s = skyAt(dusk, night);
  mat.uniforms.uTop.value.copy(s.top);
  mat.uniforms.uMid.value.copy(s.mid);
  mat.uniforms.uLow.value.copy(s.low);
  const sunY = lerp(7.5, 1.2, dusk) - night * 3;
  return (
    <group>
      {/* painted card wrapping all round the table */}
      <mesh material={mat} position={[0, 4.5, 0]}>
        <cylinderGeometry args={[15, 15, 18, 96, 1, true]} />
      </mesh>
      {/* clay sun sinking behind the hills */}
      {sunY > -1 ? <M g={lump(201, 0.03)} m={clay(dusk > 0.5 ? "#ff8a4c" : "#ffd26a", 0.6, 0.6, dusk > 0.5 ? "#ff7a3a" : "#ffcc55", 0.9)} p={[3.5, sunY, -13.6]} s={[1.3, 1.3, 0.25]} shadow={false} /> : null}
      {/* distant clay hills on the card */}
      {[[-7, -12.5, 4.5, "#8fb06a"], [1, -13.2, 5.5, "#7ea35d"], [8.5, -12.4, 4.2, "#94b671"]].map(([x, z, r, c], i) => (
        <M key={i} g={lump(205 + i, 0.04)} m={clay(c as string)} p={[x as number, -1.2, z as number]} s={[(r as number) * 1.4, r as number, 0.9]} shadow={false} />
      ))}
      {/* clouds by day, moon + stars by night */}
      {[[-6, 8.5, -13.4, 1.4], [5.5, 10.5, -13.3, 1.1], [-1, 11.5, -13.5, 0.9]].map(([x, y, z, k], i) => (
        <group key={i} position={[x, y, z]} scale={k}>
          {[-0.8, 0, 0.8, 0.3].map((dx, j) => (
            <M key={j} g={lump(210 + i * 4 + j, 0.06, 16)} m={clay(mixHex("#fffaf0", "#7b6f94", night).getStyle(), 0.8)} p={[dx, j === 3 ? 0.45 : 0, 0]} s={[0.7, 0.5, 0.2]} shadow={false} />
          ))}
        </group>
      ))}
      {night > 0.05 ? (
        <>
          <M g={lump(230, 0.03)} m={clay("#fff4cf", 0.5, 0.5, "#fff1c4", 1.1 * night)} p={[-4.5, 9.5, -13.5]} s={[0.9, 0.9, 0.2]} shadow={false} />
          {Array.from({ length: 34 }, (_, i) => (
            <M key={i} g={lump(240 + (i % 5), 0.1, 8)} m={clay("#fff6d5", 0, 0.5, "#fff3c8", 1.6 * night)} p={[(hashN(i) - 0.5) * 24, 6 + hashN(i + 50) * 9, -13.6 - hashN(i + 9) * 0.3]} s={0.06 + hashN(i + 3) * 0.06} shadow={false} />
          ))}
        </>
      ) : null}
    </group>
  );
};

/* ---------- buildings and props ---------- */

export const Roof: React.FC<{ w: number; d: number; pitch: number; color: string; y: number }> = ({ w, d, pitch, color, y }) => {
  const half = w / 2 / Math.cos(pitch);
  return (
    <group position={[0, y, 0]}>
      {[1, -1].map((sd) => (
        <group key={sd} rotation={[0, 0, sd * -pitch]}>
          <mesh geometry={slab(half + 0.12, 0.09, d + 0.25, 0.04)} material={clay(color, 1.2)} position={[(sd * (half + 0.12)) / 2, 0, 0]} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
};

const Gable: React.FC<{ w: number; h: number; z: number; color: string; y: number }> = ({ w, h, z, color, y }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    return g;
  }, [w, h]);
  return <mesh geometry={geo} material={clay(color)} position={[0, y, z - 0.04]} castShadow receiveShadow />;
};

const Window: React.FC<{ p: V3; glow: number; ry?: number }> = ({ p, glow, ry = 0 }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <mesh geometry={slab(0.42, 0.42, 0.06, 0.03)} material={clay(C.woodDark)} rotation={[Math.PI / 2, 0, 0]} />
    <mesh geometry={slab(0.32, 0.32, 0.04, 0.02)} material={clay(glow > 0.1 ? "#ffd27a" : "#3d4a5c", 0, 0.4, "#ffb54a", glow * 1.6)} position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} />
    <mesh geometry={slab(0.03, 0.34, 0.05, 0.01)} material={clay(C.woodDark)} position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} />
    <mesh geometry={slab(0.34, 0.03, 0.05, 0.01)} material={clay(C.woodDark)} position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);

const House: React.FC<{ glow: number }> = ({ glow }) => (
  <group position={HOUSE}>
    <mesh geometry={slab(3.0, 1.7, 1.9, 0.08)} material={clay(C.cream)} position={[0, 0.85, 0]} castShadow receiveShadow />
    <Gable w={3.0} h={1.0} z={0.95} color={C.cream} y={1.7} />
    <Gable w={3.0} h={1.0} z={-0.95} color={C.cream} y={1.7} />
    {/* roof runs along x: two slabs tilted around x */}
    {[1, -1].map((sd) => (
      <group key={sd} position={[0, 2.18, sd * 0.5]} rotation={[sd * 0.78, 0, 0]}>
        <mesh geometry={slab(3.4, 0.1, 1.5, 0.05)} material={clay("#b4553f", 1.3)} castShadow receiveShadow />
      </group>
    ))}
    <mesh geometry={slab(0.32, 0.8, 0.32, 0.04)} material={clay("#a9563f")} position={[0.9, 2.55, -0.25]} castShadow />
    <mesh geometry={slab(0.55, 0.95, 0.08, 0.04)} material={clay(C.woodDark)} position={[0, 0.48, 0.97]} castShadow />
    <M g={lump(260, 0.02, 10)} m={clay("#e2b04a", 0.3, 0.3)} p={[0.18, 0.5, 1.03]} s={0.035} />
    <Window p={[-0.95, 1.05, 0.97]} glow={glow} />
    <Window p={[0.95, 1.05, 0.97]} glow={glow} />
    <mesh geometry={slab(1.1, 0.06, 0.6, 0.03)} material={clay(C.wood)} position={[0, 0.03, 1.25]} receiveShadow />
    {/* flower boxes */}
    {[-0.95, 0.95].map((x, i) => (
      <group key={i} position={[x, 0.78, 1.05]}>
        <mesh geometry={slab(0.48, 0.1, 0.14, 0.03)} material={clay(C.wood)} castShadow />
        {[-0.16, -0.05, 0.06, 0.17].map((dx, j) => (
          <M key={j} g={lump(262 + j, 0.05, 10)} m={clay(["#e95f6a", "#f6c445", "#f29ac0", "#ffffff"][j], 0.4)} p={[dx, 0.08, 0]} s={0.045} />
        ))}
      </group>
    ))}
  </group>
);

const Barn: React.FC = () => (
  <group position={BARN} rotation={[0, 0.35, 0]}>
    <mesh geometry={slab(2.4, 1.9, 2.0, 0.08)} material={clay(C.barnRed)} position={[0, 0.95, 0]} castShadow receiveShadow />
    <Gable w={2.4} h={1.0} z={1.0} color={C.barnRed} y={1.9} />
    <Gable w={2.4} h={1.0} z={-1.0} color={C.barnRed} y={1.9} />
    {[1, -1].map((sd) => (
      <group key={sd} position={[sd * 0.6, 2.42, 0]} rotation={[0, 0, sd * -0.69]}>
        <mesh geometry={slab(1.7, 0.1, 2.3, 0.05)} material={clay(C.roof, 1.3)} castShadow receiveShadow />
      </group>
    ))}
    {/* big doors with white X trim */}
    {[1, -1].map((sd) => (
      <group key={sd} position={[sd * 0.36, 0.62, 1.02]}>
        <mesh geometry={slab(0.66, 1.2, 0.06, 0.03)} material={clay("#a63a2f")} rotation={[Math.PI / 2, 0, 0]} castShadow />
        {[0.95, -0.95].map((a, i) => (
          <mesh key={i} geometry={slab(0.07, 1.3, 0.05, 0.02)} material={clay(C.cream)} position={[0, 0, 0.04]} rotation={[Math.PI / 2, a * 0.5, 0]} />
        ))}
        <mesh geometry={slab(0.7, 0.07, 0.05, 0.02)} material={clay(C.cream)} position={[0, 0.6, 0.04]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    ))}
    <mesh geometry={slab(0.55, 0.45, 0.06, 0.03)} material={clay(C.woodDark)} position={[0, 2.15, 1.04]} rotation={[Math.PI / 2, 0, 0]} />
    <M g={lump(270, 0.1)} m={clay(C.hay, 1.6, 0.95)} p={[0, 2.0, 1.1]} s={[0.22, 0.1, 0.08]} />
  </group>
);

const Shed: React.FC = () => (
  <group position={SHED}>
    {[[-0.75, -0.3], [0.75, -0.3], [-0.75, 0.45], [0.75, 0.45]].map(([x, z], i) => (
      <mesh key={i} geometry={cyl(0.05, 0.06, z > 0 ? 1.3 : 1.6, 10)} material={clay(C.woodDark)} position={[x, z > 0 ? 0.65 : 0.8, z]} castShadow />
    ))}
    <group position={[0, 1.5, 0.08]} rotation={[0.35, 0, 0]}>
      <mesh geometry={slab(1.85, 0.08, 1.15, 0.04)} material={clay("#c59a52", 1.5)} castShadow receiveShadow />
    </group>
    {/* milk pail + cheese wheel + butter block */}
    <group position={[0.75, 0, 0.85]}>
      <mesh geometry={cyl(0.13, 0.1, 0.22, 20)} material={clay("#b9c2c6", 0.6, 0.45)} position={[0, 0.11, 0]} castShadow />
      <mesh geometry={cyl(0.115, 0.115, 0.02, 20)} material={clay("#fffaf0", 0.2, 0.5)} position={[0, 0.215, 0]} />
    </group>
    <group position={[-0.75, 0, 0.9]}>
      <mesh geometry={cyl(0.18, 0.18, 0.12, 24)} material={clay("#f2c14e", 0.8)} position={[0, 0.06, 0]} castShadow />
      <mesh geometry={slab(0.16, 0.09, 0.1, 0.02)} material={clay("#fbe48a", 0.6)} position={[0.28, 0.045, 0.05]} castShadow />
    </group>
  </group>
);

const Fence: React.FC<{ a: [number, number]; b: [number, number]; posts?: number; h?: number }> = ({ a, b, posts, h = 0.55 }) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = posts ?? Math.max(2, Math.round(len / 0.7) + 1);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const k = i / (n - 1);
        return <mesh key={i} geometry={cyl(0.045, 0.055, h, 8)} material={clay(C.wood)} position={[lerp(a[0], b[0], k), h / 2, lerp(a[1], b[1], k)]} rotation={[0, 0, (hashN(i + a[0] * 7) - 0.5) * 0.08]} castShadow receiveShadow />;
      })}
      {[h * 0.45, h * 0.82].map((y, i) => (
        <mesh key={i} geometry={slab(len, 0.06, 0.05, 0.02)} material={clay(C.wood)} position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, -ang, 0]} castShadow />
      ))}
    </group>
  );
};

const Pen: React.FC = () => {
  const [x, , z] = PEN;
  return (
    <group>
      <Fence a={[x - 1.2, z - 0.9]} b={[x + 1.2, z - 0.9]} />
      <Fence a={[x - 1.2, z + 0.9]} b={[x - 0.3, z + 0.9]} />
      <Fence a={[x + 0.25, z + 0.9]} b={[x + 1.2, z + 0.9]} />
      <Fence a={[x - 1.2, z - 0.9]} b={[x - 1.2, z + 0.9]} />
      <Fence a={[x + 1.2, z - 0.9]} b={[x + 1.2, z + 0.9]} />
      {/* knitted wool coat drying on the fence */}
      <group position={[x + 0.7, 0.42, z + 0.93]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} geometry={slab(0.42, 0.07, 0.04, 0.02)} material={clay(i % 2 ? "#e9dfcb" : "#d77a5a", 1.4)} position={[0, -i * 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow />
        ))}
      </group>
    </group>
  );
};

const Coop: React.FC = () => (
  <group position={COOP} rotation={[0, -0.5, 0]}>
    {[[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].map(([x, z], i) => (
      <mesh key={i} geometry={cyl(0.035, 0.035, 0.4, 8)} material={clay(C.woodDark)} position={[x, 0.2, z]} castShadow />
    ))}
    <mesh geometry={slab(0.8, 0.55, 0.65, 0.05)} material={clay("#e6c27a")} position={[0, 0.66, 0]} castShadow receiveShadow />
    {[1, -1].map((sd) => (
      <group key={sd} position={[sd * 0.22, 1.05, 0]} rotation={[0, 0, sd * -0.6]}>
        <mesh geometry={slab(0.56, 0.06, 0.8, 0.03)} material={clay(C.barnRed, 1.2)} castShadow />
      </group>
    ))}
    <mesh geometry={slab(0.24, 0.28, 0.05, 0.03)} material={clay(C.ink)} position={[0, 0.6, 0.33]} rotation={[Math.PI / 2, 0, 0]} />
    <group position={[0, 0.2, 0.62]} rotation={[0.55, 0, 0]}>
      <mesh geometry={slab(0.2, 0.03, 0.7, 0.01)} material={clay(C.wood)} castShadow />
    </group>
  </group>
);

const Nest: React.FC<{ eggs: number }> = ({ eggs }) => (
  <group>
    <mesh geometry={cyl(0.16, 0.12, 0.08, 18)} material={clay(C.hay, 1.6, 0.95)} position={[0, 0.04, 0]} castShadow receiveShadow />
    {Array.from({ length: eggs }, (_, i) => (
      <M key={i} g={lump(280 + i, 0.02, 14)} m={clay("#f6ead6", 0.3, 0.5)} p={[(i - (eggs - 1) / 2) * 0.07, 0.11, (i % 2) * 0.03]} s={[0.035, 0.045, 0.035]} />
    ))}
  </group>
);

const Haystack: React.FC = () => (
  <group position={HAY}>
    <M g={lump(290, 0.09)} m={clay(C.hay, 1.8, 0.95)} p={[0, 0.32, 0]} s={[0.75, 0.55, 0.6]} />
    <M g={lump(291, 0.09)} m={clay(C.hayDark, 1.8, 0.95)} p={[0.35, 0.18, 0.25]} s={[0.4, 0.3, 0.35]} />
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={i} geometry={cyl(0.008, 0.008, 0.28, 5)} material={clay(C.hay, 0.5)} position={[(hashN(i) - 0.5) * 1.4, 0.02, 0.45 + hashN(i + 5) * 0.4]} rotation={[Math.PI / 2, 0, hashN(i + 9) * 3]} />
    ))}
  </group>
);

const Tree: React.FC<{ p: V3; s?: number; seed: number; willow?: boolean }> = ({ p, s = 1, seed, willow }) => (
  <group position={p} scale={s}>
    <mesh geometry={cyl(0.1, 0.16, 1.4, 12)} material={clay(C.trunk, 1.3)} position={[0, 0.7, 0]} castShadow />
    {(willow
      ? [[0, 1.75, 0, 0.75], [-0.45, 1.5, 0.2, 0.55], [0.45, 1.55, -0.1, 0.55], [0.1, 1.35, 0.45, 0.5], [-0.2, 1.4, -0.4, 0.5]]
      : [[0, 1.8, 0, 0.7], [-0.4, 1.55, 0.15, 0.5], [0.42, 1.6, -0.1, 0.5], [0.05, 2.15, -0.05, 0.45]]
    ).map(([x, y, z, r], i) => (
      <M key={i} g={lump(seed + i, 0.07)} m={clay(i % 2 ? C.leafDark : C.leaf, 1.4)} p={[x, y, z]} s={[r, r * (willow ? 1.1 : 0.9), r]} />
    ))}
    {willow
      ? Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return <mesh key={i} geometry={cyl(0.05, 0.03, 0.8, 6)} material={clay(C.leaf, 1.2)} position={[Math.cos(a) * 0.62, 1.05, Math.sin(a) * 0.62]} rotation={[Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15]} castShadow />;
        })
      : null}
  </group>
);

const Pond: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = POND;
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={cyl(1.35, 1.35, 0.04, 40)} material={clay("#6f8f4a", 0.8)} position={[0, 0.005, 0]} scale={[1, 1, 0.78]} receiveShadow />
      <mesh geometry={cyl(1.2, 1.2, 0.05, 40)} material={clay(C.water, 0.25, 0.22)} position={[0, 0.02, 0]} scale={[1, 1, 0.75]} receiveShadow />
      <mesh geometry={cyl(0.7, 0.7, 0.052, 32)} material={clay(C.waterDeep, 0.2, 0.2)} position={[-0.15, 0.022, -0.05]} scale={[1, 1, 0.7]} receiveShadow />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + hashN(i) * 0.2;
        return <M key={i} g={lump(300 + (i % 7), 0.12, 12)} m={clay(i % 3 ? C.stone : "#a39a8c", 1)} p={[Math.cos(a) * 1.27, 0.04, Math.sin(a) * 0.98]} s={[0.12 + hashN(i + 2) * 0.06, 0.07, 0.1]} />;
      })}
      {/* lily pads + a flower, bobbing in stepped time */}
      {[[0.35, 0.2], [-0.5, -0.25], [0.1, -0.45]].map(([lx, lz], i) => (
        <group key={i} position={[lx, 0.05 + Math.sin(t * 1.3 + i) * 0.004, lz]} rotation={[0, i * 2 + Math.sin(t * 0.4 + i) * 0.1, 0]}>
          <mesh geometry={cyl(0.13, 0.13, 0.012, 16, )} material={clay("#5d9a45", 0.6)} receiveShadow />
          {i === 0 ? <M g={lump(310, 0.05, 12)} m={clay("#f6a9c4", 0.5)} p={[0.02, 0.03, 0]} s={[0.05, 0.035, 0.05]} /> : null}
        </group>
      ))}
      {/* reeds */}
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[-0.75 + i * 0.16, 0, -0.95 - hashN(i) * 0.12]} rotation={[0, 0, (hashN(i + 3) - 0.5) * 0.3]}>
          <mesh geometry={cyl(0.012, 0.018, 0.55, 6)} material={clay("#6c9440")} position={[0, 0.27, 0]} castShadow />
          {i % 2 ? <M g={capsuleTop} m={clay("#7a4a2a")} p={[0, 0.5, 0]} s={[0.025, 0.06, 0.025]} /> : null}
        </group>
      ))}
    </group>
  );
};
const capsuleTop = lump(320, 0.02, 10);

const Kennel: React.FC = () => (
  <group position={KENNEL} rotation={[0, 1.45, 0]}>
    <mesh geometry={slab(0.75, 0.55, 0.85, 0.05)} material={clay("#b98a54")} position={[0, 0.28, 0]} castShadow receiveShadow />
    {[1, -1].map((sd) => (
      <group key={sd} position={[sd * 0.2, 0.7, 0]} rotation={[0, 0, sd * -0.7]}>
        <mesh geometry={slab(0.56, 0.06, 0.95, 0.03)} material={clay(C.barnRed, 1.2)} castShadow />
      </group>
    ))}
    <Gable w={0.75} h={0.33} z={0.43} color="#b98a54" y={0.55} />
    <M g={lump(330, 0.02)} m={clay("#2a1f1a", 0)} p={[0, 0.24, 0.42]} s={[0.17, 0.2, 0.03]} shadow={false} />
    <M g={lump(331, 0.05, 14)} m={clay("#c9c3b5", 0.6)} p={[0.35, 0.03, 0.55]} s={[0.1, 0.03, 0.04]} />
  </group>
);

const Gate: React.FC<{ night: number }> = ({ night }) => (
  <group>
    <group position={GATE} rotation={[0, -0.25, 0]}>
      <mesh geometry={cyl(0.07, 0.08, 0.9, 10)} material={clay(C.woodDark)} position={[-0.6, 0.45, 0]} castShadow />
      <mesh geometry={cyl(0.07, 0.08, 0.9, 10)} material={clay(C.woodDark)} position={[0.6, 0.45, 0]} castShadow />
      <group position={[-0.55, 0, 0]} rotation={[0, -1.1, 0]}>
        {[0.25, 0.45, 0.65].map((y, i) => (
          <mesh key={i} geometry={slab(1.0, 0.06, 0.05, 0.02)} material={clay(C.wood)} position={[0.5, y, 0]} castShadow />
        ))}
        <mesh geometry={slab(1.1, 0.06, 0.05, 0.02)} material={clay(C.wood)} position={[0.5, 0.45, 0.02]} rotation={[0, 0, 0.4]} />
      </group>
    </group>
    {/* lantern post */}
    <group position={LANTERN}>
      <mesh geometry={cyl(0.04, 0.05, 1.45, 8)} material={clay(C.woodDark)} position={[0, 0.72, 0]} castShadow />
      <mesh geometry={slab(0.3, 0.04, 0.05, 0.02)} material={clay(C.woodDark)} position={[0.12, 1.4, 0]} />
      <group position={[0.24, 1.22, 0]}>
        <mesh geometry={cyl(0.07, 0.09, 0.2, 8)} material={clay("#ffe3a0", 0, 0.3, "#ffb347", 0.2 + night * 2.4)} />
        <mesh geometry={cyl(0.02, 0.1, 0.07, 8)} material={clay(C.ink)} position={[0, 0.13, 0]} />
      </group>
    </group>
  </group>
);

/* ---------- ground: table, rolled slab, path, tufts, flowers ---------- */

const Ground: React.FC = () => {
  const tufts = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({ x: (hashN(i * 2) - 0.5) * 13, z: (hashN(i * 2 + 1) - 0.5) * 11.5 - 0.5, r: 0.05 + hashN(i + 99) * 0.07, c: i % 3 })).filter(
        (p) => Math.hypot(p.x - POND[0], (p.z - POND[2]) * 1.25) > 1.6 && Math.hypot(p.x - HOUSE[0], p.z - HOUSE[2]) > 2 && Math.hypot(p.x - BARN[0], p.z - BARN[2]) > 1.8,
      ),
    [],
  );
  const pathPts = useMemo(() => {
    const out: V3[] = [];
    // stepping-stone path: gate -> centre -> house door
    const ctrl: [number, number][] = [[GATE[0] - 0.4, GATE[2] - 0.2], [3.0, 2.3], [1.4, 1.1], [0.9, -0.8], [0.9, -2.6], [0.9, -3.8]];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const [ax, az] = ctrl[i], [bx, bz] = ctrl[i + 1];
      const n = Math.max(2, Math.round(Math.hypot(bx - ax, bz - az) / 0.42));
      for (let k = 0; k < n; k++) out.push([lerp(ax, bx, k / n), 0, lerp(az, bz, k / n)]);
    }
    return out;
  }, []);
  return (
    <group>
      {/* table + the rolled clay slab */}
      <mesh geometry={slab(24, 0.5, 20, 0.15)} material={clay(C.table, 0.6, 0.6)} position={[0, -0.55, -0.5]} receiveShadow />
      <mesh geometry={slab(14.4, 0.32, 12.2, 0.3)} material={clay(C.grass, 1.2, 0.85)} position={[0, -0.16, -0.5]} castShadow receiveShadow />
      {/* bumpy grass mounds rolled by hand */}
      {[[-1.6, -0.2, 1.4], [3.4, 3.8, 1.2], [-5.6, -1.2, 1.1], [5.8, -3.4, 1.3], [-1.5, 4.6, 1.0]].map(([x, z, r], i) => (
        <M key={i} g={lump(340 + i, 0.05)} m={clay(i % 2 ? C.grassLight : C.grassDeep, 1.2)} p={[x, -0.05, z]} s={[r, 0.12, r * 0.8]} />
      ))}
      {pathPts.map((p, i) => (
        <M key={i} g={lump(360 + (i % 6), 0.08, 14)} m={clay(i % 4 ? C.path : "#ccab7b", 1.1)} p={[p[0] + (hashN(i) - 0.5) * 0.12, 0.0, p[2] + (hashN(i + 7) - 0.5) * 0.12]} s={[0.17, 0.035, 0.14]} />
      ))}
      {tufts.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          {[-1, 0, 1].map((k) => (
            <mesh key={k} geometry={cyl(0.004, p.r * 0.35, p.r * 2.4, 5)} material={clay(p.c === 0 ? C.grassDeep : C.grassLight, 0.5)} position={[k * p.r * 0.4, p.r * 1.1, 0]} rotation={[0, 0, k * 0.35]} castShadow />
          ))}
          {i % 5 === 0 ? <M g={lump(370 + (i % 4), 0.06, 10)} m={clay(["#f6c445", "#ffffff", "#e95f6a", "#9ec5f2"][i % 4], 0.4)} p={[0, p.r * 2.5, 0]} s={0.04} /> : null}
        </group>
      ))}
    </group>
  );
};

/* ---------- the whole set ---------- */

export const FarmSet: React.FC<{ t: number; dusk: number; night: number; eggs: number }> = ({ t, dusk, night, eggs }) => (
  <group>
    <Backdrop dusk={dusk} night={night} />
    <Ground />
    <House glow={ramp01(night)} />
    <Barn />
    <Shed />
    <Pen />
    <Coop />
    <group position={[COOP[0] - 0.1, 0, COOP[2] + 0.75]}>
      <Nest eggs={eggs} />
    </group>
    <Haystack />
    <Pond t={t} />
    <Tree p={WILLOW} seed={400} willow s={1.05} />
    <Tree p={[-6.0, 0, -1.6]} seed={410} s={1.1} />
    <Tree p={[6.0, 0, -0.9]} seed={420} s={0.95} />
    <Tree p={[3.2, 0, -5.2]} seed={430} s={0.85} />
    <Tree p={[-1.8, 0, -5.4]} seed={440} s={0.8} />
    <Kennel />
    <Gate night={night} />
    {/* back fence */}
    <Fence a={[-6.6, -6.0]} b={[-2.3, -6.0]} />
    <Fence a={[2.8, -6.0]} b={[6.6, -6.0]} />
    <Fence a={[6.6, -6.0]} b={[6.6, 2.5]} />
    <Fence a={[-6.6, -6.0]} b={[-6.6, 0.4]} />
  </group>
);
const ramp01 = (x: number) => clamp(x * 1.4 - 0.2);
