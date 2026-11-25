// EP07 cover — "BIKIN APLIKASI TANPA CODING" in ISOCRAFT: a giant see-through phone on a paper
// floor. Inside, a cashier app is being assembled like a machine (display, keypad, a claw placing
// the last key, a printer pushing out a receipt). A prompt bubble above feeds word tiles that turn
// into app blocks on their way into the phone's hopper. A small shop owner (ToyPerson) presses a key.
// Hand-inked look: banded toon shading + inverted-hull ink outlines + flat blue cast shadow.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt, type Pose } from "../../core/polish/Person.tsx";
import { ISOCRAFT_PALETTE as P } from "../../kits/isocraft/lib/palette.ts";
import { bubbleTexture, floorTexture, keyTexture, plateTexture, receiptTexture, screenTexture, tileTexture } from "./textures.ts";

const bangers = loadBangers("normal", { weights: ["400"], subsets: ["latin"] });
const barlow = loadBarlow("normal", { weights: ["700", "800"], subsets: ["latin"] });

type V3 = [number, number, number];
export const INK = P.inkBlack;
export const OUT = 0.026; // ink outline thickness (inverted hull), per motion memory

// ---- toon materials (3 flat bands, cached per colour) -----------------------------------------
let gradient: THREE.DataTexture | null = null;
export const bands = () => {
  if (gradient) return gradient;
  const d = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
};
const toonCache = new Map<string, THREE.MeshToonMaterial>();
export const toon = (color: string) => {
  let m = toonCache.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: bands() });
    toonCache.set(color, m);
  }
  return m;
};
export const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

/** Rounded box with a toon body and an ink outline shell. */
export const IBox: React.FC<{ args: V3; color: string; position?: V3; rotation?: V3; radius?: number; out?: number; children?: React.ReactNode }> = ({
  args,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  radius,
  out = OUT,
  children,
}) => {
  const r = radius ?? Math.min(...args) * 0.18;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={toon(color)} castShadow>
        <RoundedBoxGeo args={args} radius={r} />
      </mesh>
      <mesh material={inkMat}>
        <RoundedBoxGeo args={[args[0] + out * 2, args[1] + out * 2, args[2] + out * 2]} radius={r + out} />
      </mesh>
      {children}
    </group>
  );
};

/** Flat textured decal on the +z face of a box. */
export const Decal: React.FC<{ map: THREE.Texture; w: number; h: number; z: number; position?: [number, number]; opacity?: number }> = ({ map, w, h, z, position = [0, 0], opacity = 1 }) => (
  <mesh position={[position[0], position[1], z]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={map} toneMapped={false} transparent={opacity < 1} opacity={opacity} />
  </mesh>
);

// ---- phone -------------------------------------------------------------------------------------
export const W = 2.4;
export const H = 4.6;
export const D = 0.36;
export const KEYS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["C", "0", "="],
];
export const KEY_X = [-0.6, 0, 0.6];
export const KEY_Y = [2.36, 1.94, 1.52, 1.1];
const MISSING = { r: 1, c: 1 }; // key "5" is still being placed by the claw

const Phone: React.FC<{ f: number; tex: Tex }> = ({ f, tex }) => {
  const spin = f * 0.05;
  const press = 0.05; // pressed key depth
  const belt = (f * 0.004) % 0.42;
  return (
    <group>
      {/* back shell + inner tray */}
      <IBox args={[W, H, 0.12]} color={P.bodyCoral} position={[0, H / 2, -D / 2 + 0.06]} radius={0.22} />
      <mesh position={[0, H / 2, -D / 2 + 0.125]}>
        <planeGeometry args={[W - 0.36, H - 0.5]} />
        <meshBasicMaterial color="#EFE8D8" toneMapped={false} />
      </mesh>
      {/* inner circuit traces on the tray */}
      {[0.6, 0.95, 2.95, 3.2].map((y, i) => (
        <mesh key={i} position={[(i % 2 ? 0.25 : -0.2), y, -D / 2 + 0.13]}>
          <planeGeometry args={[1.5, 0.025]} />
          <meshBasicMaterial color={P.shadowBlue} toneMapped={false} />
        </mesh>
      ))}
      {/* side rails, top rail, chin */}
      <IBox args={[0.18, H, D]} color={P.bodyCoral} position={[-W / 2 + 0.09, H / 2, 0]} radius={0.08} />
      <IBox args={[0.18, H, D]} color={P.bodyCoral} position={[W / 2 - 0.09, H / 2, 0]} radius={0.08} />
      <IBox args={[W, 0.2, D]} color={P.bodyCoral} position={[0, H - 0.1, 0]} radius={0.08} />
      <IBox args={[W, 0.36, D]} color={P.bodyCoral} position={[0, 0.18, 0]} radius={0.1}>
        {/* AUDIRA plate on the chin */}
        <IBox args={[0.9, 0.2, 0.04]} color={INK} position={[-0.5, 0.0, D / 2 + 0.01]} radius={0.03} out={0.012} />
        <Decal map={tex.audira} w={0.84} h={0.16} z={D / 2 + 0.035} position={[-0.5, 0]} />
        {/* receipt slot */}
        <IBox args={[0.62, 0.07, 0.04]} color={INK} position={[0.45, 0.02, D / 2 + 0.005]} radius={0.02} out={0.01} />
      </IBox>
      {/* side button + camera dot */}
      <IBox args={[0.06, 0.5, 0.14]} color={P.metalSteel} position={[W / 2 + 0.03, 3.4, 0]} radius={0.025} out={0.014} />

      {/* display module */}
      <IBox args={[1.9, 0.98, 0.14]} color={P.accentYellow} position={[0, 3.78, -0.04]} radius={0.06}>
        <Decal map={tex.screen} w={1.72} h={0.82} z={0.075} />
      </IBox>

      {/* assembly line between display and keypad: a small belt carrying blocks to the claw */}
      <IBox args={[1.5, 0.08, 0.26]} color={INK} position={[-0.15, 2.82, -0.02]} radius={0.03} out={0.01} />
      {[0, 1, 2, 3].map((i) => {
        const x = -0.82 + i * 0.42 + belt;
        const c = [P.bodyMint, "#FFFFFF", P.accentYellow, P.bodyCoral][i];
        return x < 0.5 ? <IBox key={i} args={[0.2, 0.2, 0.2]} color={c} position={[x, 2.97, -0.02]} radius={0.04} out={0.016} /> : null;
      })}
      {/* gears driving the belt */}
      {[[-0.95, 2.82, 0.16, 1], [0.68, 2.82, 0.13, -1.3]].map(([x, y, r, s], i) => (
        <group key={i} position={[x, y, 0.05]} rotation={[Math.PI / 2, spin * s, 0]}>
          <mesh material={toon(P.metalSteel)}>
            <cylinderGeometry args={[r, r, 0.08, 10]} />
          </mesh>
          <mesh material={inkMat}>
            <cylinderGeometry args={[r + 0.02, r + 0.02, 0.1, 10]} />
          </mesh>
        </group>
      ))}

      {/* keypad */}
      {KEYS.map((row, r) =>
        row.map((k, c) => {
          if (r === MISSING.r && c === MISSING.c) {
            return (
              <mesh key={k} position={[KEY_X[c], KEY_Y[r], -0.05]}>
                <planeGeometry args={[0.5, 0.34]} />
                <meshBasicMaterial color={P.shadowBlue} toneMapped={false} />
              </mesh>
            );
          }
          const pressed = r === 3 && c === 2;
          const z = pressed ? -press : 0;
          const bg = k === "=" ? P.accentYellow : k === "C" ? P.bodyCoral : r === 3 ? P.bodyMint : "#FFFFFF";
          return (
            <IBox key={k} args={[0.5, 0.34, 0.16]} color={bg} position={[KEY_X[c], KEY_Y[r], z]} radius={0.06} out={0.018}>
              <Decal map={tex.keys[k]} w={0.42} h={0.28} z={0.082} />
            </IBox>
          );
        }),
      )}

      {/* claw placing the "5" key */}
      <group position={[0.0, 2.6, 0.06]}>
        <IBox args={[0.06, 0.34, 0.06]} color={P.metalSteel} position={[0, 0.17, 0]} radius={0.02} out={0.012} />
        <IBox args={[0.42, 0.06, 0.08]} color={P.metalSteel} position={[0, 0.0, 0]} radius={0.02} out={0.012} />
        <IBox args={[0.05, 0.16, 0.08]} color={P.metalSteel} position={[-0.21, -0.08, 0]} radius={0.02} out={0.012} />
        <IBox args={[0.05, 0.16, 0.08]} color={P.metalSteel} position={[0.21, -0.08, 0]} radius={0.02} out={0.012} />
        <IBox args={[0.38, 0.28, 0.16]} color="#FFFFFF" position={[0, -0.2, 0.04]} radius={0.05} out={0.018} rotation={[0, 0, 0.12]}>
          <Decal map={tex.keys["5"]} w={0.32} h={0.24} z={0.082} />
        </IBox>
      </group>

      {/* receipt printer */}
      <IBox args={[1.5, 0.34, 0.2]} color={P.metalSteel} position={[0.2, 0.6, -0.04]} radius={0.06}>
        <IBox args={[0.7, 0.06, 0.04]} color={INK} position={[0.25, 0.04, 0.1]} radius={0.02} out={0.01} />
      </IBox>

      {/* glass front (see-through) with ink edge and highlight streaks */}
      <mesh position={[0, H / 2 + 0.08, D / 2]}>
        <planeGeometry args={[W - 0.36, H - 0.56]} />
        <meshBasicMaterial color="#D8ECF7" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </mesh>
      {[[-0.55, 3.55, 0.12], [-0.3, 1.5, 0.06]].map(([x, y, w], i) => (
        <mesh key={i} position={[x, y, D / 2 + 0.005]} rotation={[0, 0, 0.62]}>
          <planeGeometry args={[w, 1.1]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {/* hopper on top */}
      <group position={[0.55, H + 0.18, 0]}>
        <mesh material={toon(P.metalSteel)}>
          <cylinderGeometry args={[0.36, 0.16, 0.36, 20, 1, true]} />
        </mesh>
        <mesh material={inkMat}>
          <cylinderGeometry args={[0.39, 0.18, 0.39, 20, 1, true]} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.33, 0.39, 32]} />
          <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

// ---- receipt: a curved paper strip from the chin slot onto the floor --------------------------
export const Receipt: React.FC<{ map: THREE.Texture }> = ({ map }) => {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0.2, 0.18),
      new THREE.Vector3(0, 0.22, 0.42),
      new THREE.Vector3(0, 0.08, 0.66),
      new THREE.Vector3(0, 0.012, 0.95),
      new THREE.Vector3(0, 0.012, 1.45),
      new THREE.Vector3(0, 0.07, 1.78),
      new THREE.Vector3(0, 0.2, 1.86),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.3);
    const seg = 80;
    const w = 0.27;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= seg; i++) {
      const p = curve.getPoint(i / seg);
      pos.push(-w, p.y, p.z, w, p.y, p.z);
      uv.push(0, 1 - i / seg, 1, 1 - i / seg);
      if (i < seg) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group position={[0.45, 0, 0]}>
      <mesh geometry={geo} castShadow>
        <meshToonMaterial map={map} gradientMap={bands()} side={THREE.DoubleSide} />
      </mesh>
      {/* ink edges */}
      <mesh geometry={geo} scale={[1.06, 1, 1]} position={[0, -0.006, 0]}>
        <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ---- prompt bubble + word tiles turning into blocks -------------------------------------------
export const Bubble: React.FC<{ f: number; tex: Tex }> = ({ f, tex }) => {
  const bob = Math.sin(f / 40) * 0.04;
  return (
    <group position={[0, bob, 0]}>
      <IBox args={[3.1, 1.12, 0.22]} color="#FFFFFF" radius={0.2}>
        <Decal map={tex.bubble} w={2.86} h={1.0} z={0.112} />
      </IBox>
      {/* tail */}
      <group position={[1.1, -0.66, 0]} rotation={[0, 0, 0.6]}>
        <mesh material={toon("#FFFFFF")}>
          <coneGeometry args={[0.17, 0.42, 3]} />
        </mesh>
        <mesh material={inkMat} scale={1.15}>
          <coneGeometry args={[0.17, 0.42, 3]} />
        </mesh>
      </group>
    </group>
  );
};

/** Dashed ink arrow along a curve, ending in a cone. */
export const DashArrow: React.FC<{ pts: V3[] }> = ({ pts }) => {
  const { dashes, tip, dir } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const n = 11;
    const ds: { geo: THREE.TubeGeometry }[] = [];
    for (let i = 0; i < n; i++) {
      const a = i / n;
      const b = a + 0.55 / n;
      const sub = Array.from({ length: 6 }, (_, k) => curve.getPoint(a + ((b - a) * k) / 5));
      ds.push({ geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sub), 8, 0.035, 6, false) });
    }
    return { dashes: ds, tip: curve.getPoint(1), dir: curve.getTangent(1) };
  }, [pts]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), [dir]);
  return (
    <group>
      {dashes.map((d, i) => (
        <mesh key={i} geometry={d.geo}>
          <meshBasicMaterial color={INK} />
        </mesh>
      ))}
      <mesh position={tip} quaternion={q}>
        <coneGeometry args={[0.12, 0.26, 12]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
};

// ---- warung props ------------------------------------------------------------------------------
export const Shelf: React.FC = () => (
  <group>
    <IBox args={[1.6, 0.1, 0.6]} color="#C98F5A" position={[0, 0.9, 0]} radius={0.03} />
    <IBox args={[1.6, 0.1, 0.6]} color="#C98F5A" position={[0, 0.02, 0]} radius={0.03} />
    <IBox args={[0.08, 1.8, 0.6]} color="#A8713F" position={[-0.78, 0.9, 0]} radius={0.03} />
    <IBox args={[0.08, 1.8, 0.6]} color="#A8713F" position={[0.78, 0.9, 0]} radius={0.03} />
    <IBox args={[1.6, 0.1, 0.6]} color="#C98F5A" position={[0, 1.78, 0]} radius={0.03} />
    {/* goods */}
    {[[-0.5, P.bodyCoral], [-0.15, P.accentYellow], [0.2, P.bodyMint], [0.52, "#FFFFFF"]].map(([x, c], i) => (
      <IBox key={i} args={[0.28, 0.5 - (i % 2) * 0.12, 0.34]} color={c as string} position={[x as number, 0.95 + 0.25 - (i % 2) * 0.06, 0]} radius={0.04} out={0.018} />
    ))}
    {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
      <group key={i} position={[x, 0.07, 0]}>
        <mesh material={toon(i % 2 ? "#7FC4D8" : P.bodyMint)} position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.44, 14]} />
        </mesh>
        <mesh material={inkMat} position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.1, 0.11, 0.47, 14]} />
        </mesh>
        <mesh material={toon(P.bodyCoral)} position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 10]} />
        </mesh>
      </group>
    ))}
  </group>
);

export type Tex = ReturnType<typeof buildTextures>;
export const buildTextures = () => {
  const keys: Record<string, THREE.Texture> = {};
  KEYS.flat().forEach((k) => {
    const bg = k === "=" ? P.accentYellow : k === "C" ? P.bodyCoral : ["C", "0", "="].includes(k) ? P.bodyMint : "#FFFFFF";
    keys[k] = keyTexture(k, bg);
  });
  return {
    keys,
    screen: screenTexture(),
    bubble: bubbleTexture(),
    receipt: receiptTexture(),
    floor: floorTexture(),
    audira: plateTexture("AUDIRA", INK, P.accentYellow, 512, 96, 74),
    tiles: {
      tombol: tileTexture("tombol", "#FFFFFF"),
      total: tileTexture("total", "#FFFFFF"),
      struk: tileTexture("struk", "#FFFFFF"),
    },
  };
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const tex = useMemo(buildTextures, []);
  useMemo(() => {
    tex.floor.wrapS = tex.floor.wrapT = THREE.RepeatWrapping;
    tex.floor.repeat.set(6, 6);
  }, [tex]);
  const PHONE_ROT = 0.42;

  // shop owner pressing the "=" key: right arm forward and up
  const base = poseAt("stand", f, 4);
  const pose: Pose = { ...base, rs: [-1.5, 0.15, -0.05], re: -0.25, ls: [0.1, 0, 0.18], le: -0.5, head: [-0.05, -0.55, 0], spine: [0.05, -0.2, 0] };

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[-4, 10, 6]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[6, 3, 4]} intensity={0.6} />

      {/* paper floor + flat blue cast shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial map={tex.floor} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial color={P.shadowBlue} opacity={0.75} />
      </mesh>

      {/* paper diorama slab under the phone */}
      <group rotation={[0, PHONE_ROT, 0]}>
        <IBox args={[5.4, 0.2, 4.0]} color="#E9DFC8" position={[0, -0.1, 0.55]} radius={0.06} />
      </group>
      <group rotation={[0, PHONE_ROT, 0]}>
        <Phone f={f} tex={tex} />
        <Receipt map={tex.receipt} />
        {/* shop owner at the phone's left side, pressing the bottom-left keys through the glass */}
        <ToyPerson f={f} seed={4} poseOverride={pose} outfit="casual" position={[-1.6, 0, 0.8]} heading={2.2} scale={1.6} look={{ top: "#2f6fde", bottom: "#262b33", hairStyle: 0 }} />
        {/* loose blocks and coins on the floor */}
        <IBox args={[0.3, 0.3, 0.3]} color={P.bodyMint} position={[1.55, 0.15, 1.1]} rotation={[0, 0.5, 0]} radius={0.05} />
        <IBox args={[0.26, 0.26, 0.26]} color={P.accentYellow} position={[1.85, 0.13, 0.6]} rotation={[0, 0.2, 0]} radius={0.05} />
        {[0, 1, 2].map((i) => (
          <group key={i} position={[-0.6, 0.04 + i * 0.075, 1.6]}>
            <mesh material={toon(P.accentYellow)}>
              <cylinderGeometry args={[0.17, 0.17, 0.06, 24]} />
            </mesh>
            <mesh material={inkMat}>
              <cylinderGeometry args={[0.19, 0.19, 0.075, 24]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* warung shelf behind */}
      <group position={[-3.6, -0.2, -1.1]} rotation={[0, PHONE_ROT, 0]}>
        <Shelf />
      </group>

      {/* prompt bubble at the phone's upper left, feeding the hopper */}
      <group position={[-1.54, 5.42, 1.39]} rotation={[0, 0.785, 0]}>
        <Bubble f={f} tex={tex} />
      </group>
      <DashArrow pts={[[-0.22, 5.12, 0.32], [0.15, 5.4, 0.05], [0.5, 5.12, -0.22]]} />
      {/* word tile turns into app blocks on the way in */}
      <group position={[-0.08, 5.62, 0.24]} rotation={[0, 0.785, 0.18]}>
        <IBox args={[0.62, 0.27, 0.05]} color="#FFFFFF" radius={0.04} out={0.016}>
          <Decal map={tex.tiles.tombol} w={0.58} h={0.24} z={0.028} />
        </IBox>
      </group>
      <group position={[0.4, 5.62, -0.02]} rotation={[0.2, 0.785, -0.4]}>
        <IBox args={[0.36, 0.24, 0.16]} color={P.bodyMint} radius={0.05} out={0.016} />
      </group>
    </>
  );
};

export const Ep07Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP07 fonts"));
  useEffect(() => {
    Promise.all([bangers.waitUntilDone(), barlow.waitUntilDone()])
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  // near-isometric: long lens from a 45° azimuth, ~32° elevation
  const target = new THREE.Vector3(-0.1, 4.1, 0.65);
  const dir = new THREE.Vector3(1, 0.86, 1).normalize();
  const cam = target.clone().add(dir.multiplyScalar(48));

  return (
    <AbsoluteFill style={{ background: P.paperWarm }}>
      {ready && (
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ position: [cam.x, cam.y, cam.z], fov: 14.5, near: 1, far: 200 }}
          onCreated={({ camera }) => camera.lookAt(target)}
        >
          <Scene f={f} />
          <Finish frame={frame} background={P.paperWarm} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} ao={false} exposure={1} envIntensity={0.25} />
        </ThreeCanvas>
      )}
      {/* headline */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 262 }}>
        <div
          style={{
            display: "inline-block",
            border: `5px solid ${INK}`,
            background: P.accentYellow,
            padding: "8px 20px 6px",
            borderRadius: 10,
            boxShadow: `6px 6px 0 ${INK}`,
            fontFamily: "'Barlow Condensed'",
            fontWeight: 800,
            fontSize: 38,
            letterSpacing: 4,
            color: INK,
          }}
        >
          AUDIRA AI TUTORIAL
        </div>
        <div
          style={{
            fontFamily: "'Bangers'",
            fontSize: 138,
            lineHeight: 0.98,
            marginTop: 22,
            letterSpacing: 2,
            color: "#FFFFFF",
            WebkitTextStroke: `10px ${INK}`,
            paintOrder: "stroke fill",
            textShadow: `8px 8px 0 ${INK}`,
            transform: "skewX(-6deg)",
          }}
        >
          BIKIN APLIKASI
          <br />
          <span style={{ color: P.bodyCoral }}>TANPA CODING</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
