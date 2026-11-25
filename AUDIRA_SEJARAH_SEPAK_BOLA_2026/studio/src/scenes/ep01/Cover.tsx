// EP01 cover (HISTORYMAP): war-room map table of the world. Only the 8 World Cup champion nations
// are lit (gold slabs), each with its titles as gold stars stacked above it (BRA 5, ITA 4, GER 4,
// ARG 3, URU 2, FRA 2, ESP 2, ENG 1 = 23). A generic gold globe trophy stands in the foreground.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { lathe } from "../../core/geometry/lathe.ts";
import { CHAMP } from "./worldData.ts";
import { MAP_CX, MAP_CZ, MAP_D, MAP_W, proj } from "./geo.ts";
import { DISPLAY, GOLD, GREEN, LABEL, mapTexture, plaqueTexture, tagTexture, woodTexture } from "./coverTextures.ts";

export const BG = "#07090C";
type V3 = [number, number, number];

// ---------- camera ----------
export const CAM: V3 = [0, 11.5, 9.0];
export const LOOK: V3 = [0, 0, -1.2];
const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const t = f / 60;
    camera.position.set(CAM[0] - t * 0.02, CAM[1] - t * 0.03, CAM[2] - t * 0.02);
    camera.lookAt(...LOOK);
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// ---------- fonts (Anton + Space Grotesk) before any canvas texture is drawn ----------
export const useFonts = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP01 cover fonts"));
  useLayoutEffect(() => {
    const faces = [
      new FontFace(DISPLAY, `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace(LABEL, `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")})`, { weight: "300 700" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => (document.fonts as unknown as { add(f: FontFace): void }).add(f));
        setReady(true);
        continueRender(handle);
      })
      .catch(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

// ---------- table + map ----------
export const Table: React.FC = () => {
  const wood = useMemo(() => {
    const t = woodTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.needsUpdate = true;
    return t;
  }, []);
  const grain = useSurfaceGrain(5, 0.25, 6);
  const W = MAP_W + 1.1, D = MAP_D + 1.1;
  const rim = 0.12;
  return (
    <group>
      <mesh receiveShadow position={[MAP_CX, -0.15, MAP_CZ]}>
        <RoundedBoxGeo args={[W, 0.3, D]} radius={0.06} segments={3} />
        <meshPhysicalMaterial map={wood} roughness={0.55} roughnessMap={grain} clearcoat={0.35} clearcoatRoughness={0.4} />
      </mesh>
      {/* brass frame around the map sheet */}
      {[
        [MAP_CX, MAP_CZ - MAP_D / 2 - rim / 2, MAP_W + rim * 2, rim],
        [MAP_CX, MAP_CZ + MAP_D / 2 + rim / 2, MAP_W + rim * 2, rim],
        [MAP_CX - MAP_W / 2 - rim / 2, MAP_CZ, rim, MAP_D],
        [MAP_CX + MAP_W / 2 + rim / 2, MAP_CZ, rim, MAP_D],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 0.025, z]}>
          <RoundedBoxGeo args={[w, 0.05, d]} radius={0.018} segments={2} />
          <meshStandardMaterial color="#B48A45" metalness={1} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
};

export const MapSheet: React.FC = () => {
  const grain = useSurfaceGrain(11, 0.18, 8);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[MAP_CX, 0.004, MAP_CZ]}>
      <planeGeometry args={[MAP_W, MAP_D]} />
      <meshPhysicalMaterial {...POLISH.paper} map={mapTexture()} roughnessMap={grain} roughness={0.8} />
    </mesh>
  );
};

// ---------- champion nations: raised gold territory slabs ----------
export const SLAB_H = 0.035;
const Champion: React.FC<{ code: string }> = ({ code }) => {
  const geo = useMemo(() => {
    const shapes = CHAMP[code].map((r) => new THREE.Shape(r.map(([lon, lat]) => {
      const [x, z] = proj(lon, lat);
      return new THREE.Vector2(x, -z);
    })));
    return new THREE.ExtrudeGeometry(shapes, { depth: SLAB_H, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
  }, [code]);
  // dark engraved outline on the slab top, so neighbours (France/Spain/Italy/Germany) stay separate
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
  return (
    <>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#D6A848" emissive="#FFA030" emissiveIntensity={0.13} metalness={0.85} roughness={0.32} roughnessMap={grain} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      <primitive object={outline} />
    </>
  );
};

// ---------- nation pins: rod from the territory to a hovering name card, title stars above ----------
export const starGeo = (() => {
  const s = new THREE.Shape();
  const R = 0.085;
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? R * 0.46 : R;
    if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 3 });
  g.center();
  return g;
})();

/** Turns its children to face the camera (works inside the rotated map group). */
const Facing: React.FC<{ pos: V3; children: React.ReactNode }> = ({ pos, children }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.parent?.updateWorldMatrix(true, false);
    g.lookAt(CAM[0], CAM[1], CAM[2]);
  }, []);
  return (
    <group ref={ref} position={pos}>
      {children}
    </group>
  );
};

export const CARD_W = 1.0;
export const CARD_H = (CARD_W * 200) / 640;
export const STEP = 0.19;
const brass = <meshStandardMaterial color="#C99A4A" metalness={1} roughness={0.3} />;
const NationPin: React.FC<{ name: string; n: number; anchor: [number, number]; hover: [number, number]; h: number }> = ({ name, n, anchor, hover, h }) => {
  const [ax, az] = proj(...anchor);
  const [hx, hz] = proj(...hover);
  const rod = useMemo(() => {
    const a = new THREE.Vector3(ax, SLAB_H + 0.02, az);
    const b = new THREE.Vector3(hx, h - CARD_H / 2, hz);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.12;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.008, 8, false);
  }, [ax, az, hx, hz, h]);
  const tex = tagTexture(name, n);
  return (
    <group>
      <mesh castShadow position={[ax, SLAB_H + 0.02, az]}>
        <cylinderGeometry args={[0.03, 0.04, 0.03, 24]} />
        {brass}
      </mesh>
      <mesh geometry={rod} castShadow>
        {brass}
      </mesh>
      <Facing pos={[hx, h, hz]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[CARD_W + 0.02, CARD_H + 0.02, 0.016]} radius={0.006} segments={2} />
          <meshStandardMaterial color="#B48A45" metalness={1} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.0085]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial map={tex} roughness={0.5} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.22} />
        </mesh>
        {Array.from({ length: n }, (_, i) => (
          <mesh key={i} geometry={starGeo} castShadow position={[(i - (n - 1) / 2) * STEP, CARD_H / 2 + 0.105, 0]}>
            <meshPhysicalMaterial color="#F4C35A" metalness={1} roughness={0.2} clearcoat={0.5} emissive="#7A4A08" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </Facing>
    </group>
  );
};

// ---------- generic gold globe trophy (not a replica) ----------
const BODY: [number, number][] = [
  [0, 0], [0.3, 0], [0.31, 0.02], [0.3, 0.05], [0.27, 0.06], [0.27, 0.19], [0.24, 0.2], [0.2, 0.23],
  [0.13, 0.3], [0.095, 0.38], [0.085, 0.46], [0.1, 0.55], [0.13, 0.63], [0.15, 0.68], [0.12, 0.71], [0.08, 0.73], [0, 0.73],
];
export const Trophy: React.FC<{ pos: V3; scale: number }> = ({ pos, scale }) => {
  const body = useMemo(() => lathe(BODY, 96), []);
  const arms = useMemo(
    () =>
      [0, 1, 2].map((k) => {
        const a = (k * Math.PI * 2) / 3 + 0.4;
        const pts = [
          [0.2, 0.2], [0.19, 0.3], [0.2, 0.44], [0.22, 0.56], [0.2, 0.68], [0.14, 0.78],
        ].map(([r, y], i) => {
          const tw = a + i * 0.16; // gentle twist upward
          return new THREE.Vector3(Math.cos(tw) * r, y, Math.sin(tw) * r);
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.026, 12, false);
      }),
    [],
  );
  const gold = <meshPhysicalMaterial color="#F0B94A" metalness={1} roughness={0.16} clearcoat={0.4} clearcoatRoughness={0.1} />;
  return (
    <group position={pos} scale={scale}>
      <mesh geometry={body} castShadow receiveShadow>
        {gold}
      </mesh>
      {arms.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          {gold}
        </mesh>
      ))}
      {/* two pitch-green bands on the base */}
      {[0.095, 0.155].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[0.276, 0.276, 0.034, 96]} />
          <meshPhysicalMaterial color="#14653A" roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} metalness={0.1} />
        </mesh>
      ))}
      {/* the globe */}
      <mesh position={[0, 0.93, 0]} castShadow>
        <sphereGeometry args={[0.21, 64, 48]} />
        {gold}
      </mesh>
      {[-0.12, -0.04, 0.04, 0.12].map((y) => (
        <mesh key={y} position={[0, 0.93 + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.sqrt(0.21 * 0.21 - y * y) + 0.002, 0.004, 8, 96]} />
          <meshStandardMaterial color="#9A6A1C" metalness={1} roughness={0.4} />
        </mesh>
      ))}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
        <mesh key={a} position={[0, 0.93, 0]} rotation={[0, a, 0]}>
          <torusGeometry args={[0.212, 0.004, 8, 96]} />
          <meshStandardMaterial color="#9A6A1C" metalness={1} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- data (research HIGH rows: 8 nations, 23 titles) ----------
// anchor = point on the territory; hover = where the card floats (chosen in screen space, see notes).
export const NATIONS: { name: string; n: number; anchor: [number, number]; hover: [number, number]; h: number }[] = [
  { name: "INGGRIS", n: 1, anchor: [-1.6, 52.6], hover: [-24.3, 67.6], h: 0.55 },
  { name: "PRANCIS", n: 2, anchor: [2.4, 46.6], hover: [-41.2, 50.4], h: 0.55 },
  { name: "SPANYOL", n: 2, anchor: [-3.6, 40.2], hover: [-42.0, 27.2], h: 0.55 },
  { name: "JERMAN", n: 4, anchor: [10.4, 51.2], hover: [41.5, 38.0], h: 0.55 },
  { name: "ITALIA", n: 4, anchor: [13.2, 42.6], hover: [27.3, 13.7], h: 0.55 },
  { name: "BRASIL", n: 5, anchor: [-50, -9], hover: [-26.3, -14.1], h: 0.4 },
  { name: "URUGUAY", n: 2, anchor: [-55.9, -32.7], hover: [-31.8, -41.9], h: 0.4 },
  { name: "ARGENTINA", n: 3, anchor: [-65.5, -31], hover: [-90.5, -22.0], h: 0.4 },
];
export const MAP_YAW = 0.5; // table seen from its south-east corner: Europe above South America in 9:16

const Scene: React.FC<{ f: number }> = ({ f }) => {
  return (
    <>
      <CameraRig f={f} />
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
      <pointLight position={[2.6, 2.4, 2.4]} intensity={3} distance={5} color="#FFD79A" />

      <group rotation={[0, MAP_YAW, 0]}>
        <Table />
        <MapSheet />
        {Object.keys(CHAMP).map((c) => (
          <Champion key={c} code={c} />
        ))}
        {NATIONS.map((n) => (
          <NationPin key={n.name} {...n} />
        ))}
      </group>
      <Trophy pos={[1.5, 0.0, 1.5]} scale={1.8} />
      {/* AUDIRA brass plaque in front of the trophy */}
      <mesh position={[1.42, 0.062, 2.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.215]} />
        <meshStandardMaterial map={plaqueTexture()} metalness={0.7} roughness={0.35} />
      </mesh>
      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} hdri="warmStudio" />
    </>
  );
};

// ---------- HTML overlay ----------
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(7,9,12,0.95) 0%, rgba(7,9,12,0.86) 22%, rgba(7,9,12,0.0) 36%, rgba(7,9,12,0) 78%, rgba(7,9,12,0.6) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 70, top: 196, display: "flex", alignItems: "center", gap: 16, fontFamily: `"${LABEL}"`, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GREEN }}>
      <span style={{ width: 16, height: 16, background: GREEN, display: "inline-block" }} />
      SEJARAH SEPAK BOLA #01
    </div>
    <div style={{ position: "absolute", left: 64, top: 262, fontFamily: `"${DISPLAY}"`, color: "#F4EFE3", lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
      <div style={{ fontSize: 150, letterSpacing: 1 }}>
        CUMA <span style={{ color: GOLD }}>8</span> NEGARA
      </div>
      <div style={{ marginTop: 14, fontFamily: `"${LABEL}"`, fontWeight: 600, fontSize: 46, letterSpacing: 1, color: "#E9E2D2" }}>
        juara dunia 1930–2026 · <span style={{ color: GOLD }}>23 gelar</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ready = useFonts();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM, fov: 34, near: 0.1, far: 80 }}>
          <Scene f={f} />
        </ThreeCanvas>
      )}
      {ready && <Overlay />}
    </AbsoluteFill>
  );
};
