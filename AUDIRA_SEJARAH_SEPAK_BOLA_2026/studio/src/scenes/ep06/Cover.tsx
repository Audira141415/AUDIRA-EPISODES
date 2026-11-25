// EP06 cover (VINTAGEFORGE): "13 Aturan Pertama" — Lahirnya sepak bola modern, 1863.
// A Victorian tavern table at night: the first FA rulebook lies open on an oak book-cradle as an
// engraved sepia manuscript ("LAWS OF THE GAME · 1863", legible numbered laws, an engraved plate of
// the 1863 goal: two posts, 8 yards apart, no tape or bar). An old lace-up leather ball, a quill in
// an inkwell, a candle and a pewter tankard sit around it; the panelled wall carries the
// Freemasons' Tavern plaque. Facts: SOURCE_REGISTER #1, #7-#10, #14, #42 (all HIGH).
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { GroundShadow } from "../../core/polish/Drei.tsx";
import { VINTAGE_PALETTE } from "../../kits/vintageforge/lib/palette";
import {
  ballBump,
  ballMap,
  featherTexture,
  flameTexture,
  glowTexture,
  leftPage,
  oakTexture,
  rightPage,
  tavernPlaque,
  wallTexture,
} from "./coverTextures.ts";

export const fellN = loadFell("normal", { weights: ["400"], subsets: ["latin"] });
export const fellI = loadFell("italic", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: PLAYFAIR } = loadPlayfair("normal", { weights: ["900"], subsets: ["latin"] });
export const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["600"], subsets: ["latin"] });

export const BG = "#120A05";
export const PITCH = "#5FD08A"; // series pitch-green, warmed toward the kit's verdigris
export const PARCH = VINTAGE_PALETTE.parchmentSepia;
export const GOLD = "#E2BE72";

export type V3 = [number, number, number];

// ---------- camera ----------
export const CAM_POS: V3 = [0, 2.14, 3.62];
export const CAM_TARGET: V3 = [0, 0.12, -0.42];
export const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...CAM_POS);
    camera.lookAt(...CAM_TARGET);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// ---------- book ----------
export const PW = 0.8; // page width (x)
export const PD = 1.08; // page depth (z), matches the 1024x1380 page canvas
export const PT = 0.055; // page block thickness at the edge
const curve = (u: number) => 0.045 * (1 - Math.exp(-u * 7)) - 0.012 * u * u;

/** Page block with a curved top (rises from the gutter), extruded along z. side=1 right, -1 left. */
const pageBlockGeo = (side: 1 | -1) => {
  const s = new THREE.Shape();
  s.moveTo(0, -PT);
  s.lineTo(side * PW, -PT);
  for (let i = 40; i >= 0; i--) {
    const u = i / 40;
    s.lineTo(side * PW * u, curve(u));
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: PD, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -PD / 2);
  g.computeVertexNormals();
  return g;
};

/** The printed page surface, following the same curve. */
const pageSurfaceGeo = (side: 1 | -1) => {
  const g = new THREE.PlaneGeometry(PW, PD, 48, 2);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + PW / 2; // 0..PW, 0 = left edge of the plane
    const u = side === 1 ? x / PW : 1 - x / PW; // distance from the gutter
    p.setX(i, side === 1 ? x : x - PW);
    p.setY(i, curve(u) + 0.0015);
  }
  g.computeVertexNormals();
  return g;
};

export const pageEdgeTexture = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t || typeof document === "undefined") return t ?? new THREE.Texture();
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#D9C9A2";
    ctx.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 3) {
      ctx.fillStyle = `rgba(120,90,50,${0.18 + ((y * 37) % 11) / 40})`;
      ctx.fillRect(0, y, 64, 1);
    }
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 8);
    return t;
  };
})();

export const Book: React.FC = () => {
  const blockL = useMemo(() => pageBlockGeo(-1), []);
  const blockR = useMemo(() => pageBlockGeo(1), []);
  const surfL = useMemo(() => pageSurfaceGeo(-1), []);
  const surfR = useMemo(() => pageSurfaceGeo(1), []);
  const leatherGrain = useSurfaceGrain(1863, 0.35, 5);
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ map: pageEdgeTexture(), roughness: 0.9 }), []);
  const lp = leftPage();
  const rp = rightPage();
  return (
    <group>
      {/* leather boards */}
      <mesh position={[0, -PT - 0.014, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PW * 2 + 0.07, 0.028, PD + 0.06]} radius={0.012} />
        <meshPhysicalMaterial color="#4A1A12" roughness={0.62} clearcoat={0.2} clearcoatRoughness={0.5} bumpMap={leatherGrain} bumpScale={0.6} />
      </mesh>
      {/* gilt tooling line on the board edge */}
      <mesh position={[0, -PT - 0.014, PD / 2 + 0.031]}>
        <boxGeometry args={[PW * 2 + 0.03, 0.006, 0.002]} />
        <meshStandardMaterial color="#C9A55A" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh geometry={blockL} material={edgeMat} castShadow receiveShadow />
      <mesh geometry={blockR} material={edgeMat} castShadow receiveShadow />
      <mesh geometry={surfL} receiveShadow>
        <meshPhysicalMaterial {...POLISH.paper} map={lp} color="#FFFFFF" />
      </mesh>
      <mesh geometry={surfR} receiveShadow>
        <meshPhysicalMaterial {...POLISH.paper} map={rp} color="#FFFFFF" />
      </mesh>
    </group>
  );
};

// Book sits on a wooden cradle tilted toward the camera.
export const TILT = 0.3;
export const BOOK_NEAR_Z = 0.3;
export const LIP = 0.11;
export const BookOnCradle: React.FC<{ oak: THREE.Material; brassPlate: THREE.Material }> = ({ oak, brassPlate }) => {
  const depth = PD + 0.06;
  const wedge = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(depth * Math.cos(TILT), 0);
    s.lineTo(depth * Math.cos(TILT), LIP + depth * Math.sin(TILT) - 0.004);
    s.lineTo(0, LIP - 0.004);
    s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.3, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
    g.translate(0, 0, -0.65);
    g.rotateY(Math.PI / 2); // shape x -> -z
    return g;
  }, [depth]);
  return (
    <group>
      <mesh geometry={wedge} material={oak} position={[0, 0, BOOK_NEAR_Z]} castShadow receiveShadow />
      {/* Freemasons' Tavern brass plate on the cradle front (fact #1) */}
      <group position={[0, LIP * 0.5, BOOK_NEAR_Z + 0.013]}>
        <mesh material={brassPlate}>
          <RoundedBoxGeo args={[0.6, 0.1, 0.008]} radius={0.003} segments={2} />
        </mesh>
        <mesh position={[0, 0, 0.0045]}>
          <planeGeometry args={[0.58, 0.113 * 0.58 / 0.66]} />
          <meshStandardMaterial map={tavernPlaque()} metalness={0.7} roughness={0.36} />
        </mesh>
      </group>
      {/* front lip rail */}
      <mesh material={oak} position={[0, LIP + 0.02, BOOK_NEAR_Z + 0.01]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.36, 0.05, 0.035]} radius={0.01} />
      </mesh>
      <group position={[0, LIP, BOOK_NEAR_Z]} rotation={[TILT, 0, 0]}>
        <group position={[0, PT + 0.028, -depth / 2]}>
          <Book />
        </group>
      </group>
    </group>
  );
};

// ---------- leather lace-up ball ----------
export const BALL_R = 0.19;
export const ballGeo = () => {
  const g = new THREE.SphereGeometry(BALL_R, 160, 112);
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    const fr = (u * 6) % 1;
    const puff = Math.pow(Math.abs(Math.sin(Math.PI * fr)), 0.4);
    const pole = Math.abs(Math.sin(Math.PI * v)); // seams converge at the poles
    const k = 0.972 + 0.028 * puff * (0.4 + 0.6 * pole);
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
};
export const Ball: React.FC<{ pos: V3 }> = ({ pos }) => {
  const geo = useMemo(ballGeo, []);
  return (
    <group position={pos} rotation={[-0.55, 0.35, 0.15]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial map={ballMap()} bumpMap={ballBump()} bumpScale={1.4} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.45} sheen={0.2} sheenColor="#E8C9A0" />
      </mesh>
    </group>
  );
};

// ---------- tankard ----------
export const Tankard: React.FC<{ pos: V3; pewter: THREE.Material }> = ({ pos, pewter }) => {
  const foam = useSurfaceGrain(77, 0.6, 3);
  const body = useMemo(() => {
    const pts: [number, number][] = [
      [0, 0],
      [0.125, 0],
      [0.13, 0.012],
      [0.118, 0.03],
      [0.108, 0.2],
      [0.112, 0.255],
      [0.104, 0.262],
      [0.098, 0.25],
      [0.1, 0.03],
      [0, 0.03],
    ];
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 64);
  }, []);
  return (
    <group position={pos} rotation={[0, -0.35, 0]}>
      <mesh geometry={body} material={pewter} castShadow receiveShadow />
      {[0.06, 0.2].map((y) => (
        <mesh key={y} material={pewter} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.109, 0.006, 8, 64]} />
        </mesh>
      ))}
      <mesh material={pewter} position={[0.115, 0.14, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.075, 0.016, 12, 40, Math.PI]} />
      </mesh>
      {/* ale + foam */}
      <mesh position={[0, 0.226, 0]} scale={[1, 0.28, 1]}>
        <sphereGeometry args={[0.099, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#CDBB98" bumpMap={foam} bumpScale={1.5} />
      </mesh>
    </group>
  );
};

// ---------- candle ----------
export const Candle: React.FC<{ pos: V3; brass: THREE.Material }> = ({ pos, brass }) => {
  const dish = useMemo(() => {
    const pts: [number, number][] = [
      [0, 0],
      [0.12, 0],
      [0.13, 0.02],
      [0.11, 0.025],
      [0.04, 0.03],
      [0.035, 0.07],
      [0.045, 0.08],
      [0.0, 0.08],
    ];
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 64);
  }, []);
  const wax = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F0E2C2", roughness: 0.45, sheen: 0.5, sheenColor: new THREE.Color("#FFE9C4"), emissive: new THREE.Color("#5A2A08"), emissiveIntensity: 0.25 }), []);
  const H = 0.24;
  return (
    <group position={pos}>
      <mesh geometry={dish} material={brass} castShadow receiveShadow />
      {/* tall brass stem so the flame clears the book */}
      <mesh material={brass} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.03, 0.5, 32]} />
      </mesh>
      <mesh material={brass} position={[0, 0.56, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.04, 0.03, 40]} />
      </mesh>
      <group position={[0, 0.5, 0]}>
      <mesh material={wax} position={[0, 0.08 + H / 2, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.034, H, 40]} />
      </mesh>
      {[
        [0.031, 0.27, 0.008, 0.04],
        [-0.016, 0.285, 0.028, 0.03],
        [0.005, 0.24, -0.031, 0.05],
      ].map(([x, y, z, l], i) => (
        <mesh key={i} material={wax} position={[x, y, z]} scale={[0.6, l / 0.012, 0.6]}>
          <sphereGeometry args={[0.012, 12, 12]} />
        </mesh>
      ))}
      <mesh position={[0, 0.08 + H + 0.012, 0]}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.025, 6]} />
        <meshStandardMaterial color="#1A1008" />
      </mesh>
      <sprite position={[0, 0.08 + H + 0.065, 0]} scale={[0.06, 0.14, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={flameTexture()} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite position={[0, 0.08 + H + 0.045, 0]} scale={[0.5, 0.5, 1]} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={glowTexture()} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <pointLight position={[0, 0.08 + H + 0.06, 0]} intensity={2.4} distance={4.5} decay={1.6} color="#FFB868" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.002} />
      </group>
    </group>
  );
};

// ---------- inkwell + quill ----------
/** Vane outline as real geometry (so contact shadows/AO follow the feather, not a quad). */
export const makeFeatherGeo = () => {
  const W = 0.09, H = 0.3;
  const s = new THREE.Shape();
  s.moveTo(0, -H / 2);
  s.bezierCurveTo(W * 0.62, -H * 0.3, W * 0.55, H * 0.3, 0, H / 2);
  s.bezierCurveTo(-W * 0.55, H * 0.3, -W * 0.62, -H * 0.3, 0, -H / 2);
  const g = new THREE.ShapeGeometry(s, 24);
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W + 0.5, p.getY(i) / H + 0.5);
  return g;
};
export const Inkwell: React.FC<{ pos: V3; brass: THREE.Material }> = ({ pos, brass }) => {
  const featherGeo = useMemo(makeFeatherGeo, []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1C2420", roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 }), []);
  return (
    <group position={pos}>
      <mesh material={glass} position={[0, 0.045, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.13, 0.09, 0.13]} radius={0.02} />
      </mesh>
      <mesh material={brass} position={[0, 0.098, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.02, 32]} />
      </mesh>
      {/* quill leaning back to the right */}
      <group position={[0, 0.1, 0]} rotation={[-0.3, 0, 0.8]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.004, 0.003, 0.2, 8]} />
          <meshStandardMaterial color="#EDE2C8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.25, 0]} rotation={[0, -0.25, 0]}>
          <primitive object={featherGeo} attach="geometry" />
          <meshStandardMaterial map={featherTexture()} transparent alphaTest={0.25} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- tavern background ----------
export const Backdrop: React.FC<{ pewter: THREE.Material; brass: THREE.Material }> = ({ pewter, brass }) => {
  const wallTex = useMemo(() => {
    const t = wallTexture();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(1, 1);
    return t;
  }, []);
  const bottleGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#20361F", roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2 }), []);
  const amber = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5A2E0E", roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2 }), []);
  const bottle = useMemo(() => {
    const pts: [number, number][] = [
      [0, 0],
      [0.055, 0],
      [0.06, 0.02],
      [0.06, 0.2],
      [0.045, 0.25],
      [0.018, 0.29],
      [0.016, 0.36],
      [0.02, 0.37],
      [0, 0.37],
    ];
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 32);
  }, []);
  const shelfWood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A2212", roughness: 0.7 }), []);
  return (
    <group>
      {/* panelled wall */}
      <mesh position={[0, 1.0, -1.7]} receiveShadow>
        <planeGeometry args={[5.2, 2.6]} />
        <meshStandardMaterial map={wallTex} roughness={0.75} />
      </mesh>
      {/* shelf with bottles and pewter plates */}
      <mesh material={shelfWood} position={[0, 1.18, -1.58]} castShadow receiveShadow>
        <RoundedBoxGeo args={[3.2, 0.04, 0.22]} radius={0.01} />
      </mesh>
      {[-1.25, -1.1, -0.92, 0.95, 1.12, 1.3].map((x, i) => (
        <mesh key={x} geometry={bottle} material={i % 3 === 1 ? amber : bottleGlass} position={[x, 1.2, -1.58]} scale={0.9 + (i % 2) * 0.15} castShadow />
      ))}
      {[-0.6, 0.62].map((x) => (
        <mesh key={x} material={pewter} position={[x, 1.36, -1.66]} rotation={[0.12, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.012, 48]} />
        </mesh>
      ))}
      {/* floor beyond the table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1A0E07" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ---------- scene ----------
export const Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog("#140A05", 3.6, 8);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  const oakTex = useMemo(() => {
    const t = oakTexture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.2, 1.3);
    return t;
  }, []);
  const oakGrain = useSurfaceGrain(1872, 0.3, 6);
  const tableMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: oakTex, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4, bumpMap: oakGrain, bumpScale: 0.4 }), [oakTex, oakGrain]);
  const cradleMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: oakTex, color: "#C89A6A", roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.35 }), [oakTex]);
  const pewter = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#A8A49A", metalness: 0.85, roughness: 0.32, envMapIntensity: 1.4 }), []);
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: VINTAGE_PALETTE.agedGold, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.5 }), []);

  const profile = useMemo(() => ({ ...COLOR_PROFILES.VINTAGE_SEPIA_FILM, chromaticAberration: 0.0012 }), []);

  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.06} color="#FFE2C0" />
      <hemisphereLight args={["#FFE6C4", "#20100A", 0.22]} />
      {/* key: warm lamp from upper left front, soft shadows across the table */}
      <spotLight position={[-1.6, 2.6, 1.6]} angle={0.55} penumbra={0.9} intensity={26} decay={1.5} distance={8} color="#FFDDB0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-radius={6} />
      {/* page fill so the engraving reads */}
      <spotLight position={[0.2, 2.2, 1.4]} angle={0.42} penumbra={1} intensity={8} decay={1.5} distance={6} color="#FFF0D8" />
      {/* warm wall wash (sconces off-frame) so the panelling and shelf read as a room */}
      <pointLight position={[-1.3, 1.5, -1.2]} intensity={2.6} distance={2.6} decay={1.4} color="#FFB870" />
      <pointLight position={[1.4, 1.6, -1.25]} intensity={2.0} distance={2.6} decay={1.4} color="#FFC888" />
      {/* cool moonlight rim from a window off right, separates objects from the wall */}
      <directionalLight position={[2.5, 1.8, -1.2]} intensity={0.55} color="#9FB4D8" />

      {/* oak table */}
      <mesh material={tableMat} position={[0, -0.04, 0.05]} castShadow receiveShadow>
        <RoundedBoxGeo args={[3.6, 0.08, 3.5]} radius={0.02} />
      </mesh>

      <BookOnCradle oak={cradleMat} brassPlate={brass} />
      <Ball pos={[-0.5, BALL_R * 0.98, 0.86]} />
      <Tankard pos={[0.47, 0, 0.7]} pewter={pewter} />
      <Candle pos={[0.74, 0, -0.95]} brass={brass} />
      <Inkwell pos={[0.08, 0, 1.0]} brass={brass} />
      <GroundShadow scale={3.4} opacity={0.7} blur={2.4} far={0.8} />

      <Backdrop pewter={pewter} brass={brass} />

      <Finish frame={frame} background={BG} profile={profile} exposure={0.82} envIntensity={0.25} hdri="warmStudio" ao />
    </>
  );
};

// ---------- HTML overlay ----------
export const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(18,10,5,0.92) 0%, rgba(18,10,5,0.78) 20%, rgba(18,10,5,0.0) 33%, rgba(18,10,5,0) 82%, rgba(18,10,5,0.55) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", fontFamily: OSWALD, fontWeight: 600, fontSize: 34, letterSpacing: 7, color: PITCH }}>
      SEJARAH SEPAK BOLA #06
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 246, textAlign: "center", fontFamily: PLAYFAIR, fontWeight: 900, lineHeight: 0.98, textShadow: "0 6px 26px rgba(0,0,0,0.75)" }}>
      <div style={{ fontSize: 148, color: GOLD, letterSpacing: 0 }}>13 ATURAN</div>
      <div style={{ fontSize: 112, color: PARCH, letterSpacing: 4 }}>PERTAMA</div>
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 520, textAlign: "center", fontFamily: fellI.fontFamily, fontStyle: "italic", fontSize: 44, color: PARCH, textShadow: "0 3px 14px rgba(0,0,0,0.85)" }}>
      lahir di sebuah tavern London, 1863
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Page textures are drawn with IM Fell English: wait for the font before building them.
  const [handle] = useState(() => delayRender("ep06 cover fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      fellN.waitUntilDone(),
      fellI.waitUntilDone(),
      document.fonts.load("110px 'IM Fell English'"),
      document.fonts.load("italic 58px 'IM Fell English'"),
    ])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready ? (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: 44, near: 0.05, far: 30 }}>
          <Scene frame={frame} />
        </ThreeCanvas>
      ) : null}
      <Overlay />
    </AbsoluteFill>
  );
};
