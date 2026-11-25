// EP02 cover (TIMEFORGE, own studio look, no <Finish>): a corridor of time in the pearl studio.
// Five era pedestals (1958, 1962, 1970, 1994, 2002) zig-zag away from camera along a pitch
// runner; each carries a stylised Brazil player of its era with that era's ball, and a glowing
// star on an arc above the corridor, tied to it by a light thread. The arc ends on a dashed
// ghost star for 2026 (no sixth title).
// Facts (HIGH rows, research/RESEARCH_REPORT.md): 5 titles 1958/1962/1970/1994/2002, final scores,
// key players, Brazil out in the 2026 round of 16 (1–2 Norway), 1958 final played in blue.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig, FX_LAYER, Post, type Shot } from "../../core/render/Post.tsx";
import { NEUTRAL_LOOK, Studio, type StudioLook } from "../../core/studio/Studio.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, SKIN_TONES, type PoseName } from "../../core/polish/Person.tsx";
import { INK, INK_SOFT, MANROPE, manropeReady } from "../../core/type/fonts.ts";
import { ballTexture, brandTexture, leatherBallTextures, modernBallTextures, glowTexture, pitchTexture, plaqueTexture } from "./coverTextures.ts";

type V3 = [number, number, number];

export const YELLOW = "#F6CF12";
export const GREEN = "#1E9A4C";
export const PITCH = "#2BD46A";
export const BLUE = "#1F4FB5";

// ---------- layout ----------
export const CAM_POS: V3 = [0, 24, 50];
export const CAM_TARGET: V3 = [0, 2.75, -2];
export const FOV = 17;
export const PED_W = 1.7;

export type Era = {
  year: string;
  name: string;
  line: string;
  shirt: string;
  shorts: string;
  ball: Parameters<typeof ballTexture>[0];
  pose: PoseName;
  skin: string;
  hairStyle: 0 | 3;
  ring: string;
};
export const ERAS: Era[] = [
  { year: "1958", name: "PELÉ", line: "1958 · 5–2", shirt: BLUE, shorts: "#f4f2ee", ball: "leather", pose: "stand", skin: SKIN_TONES[4], hairStyle: 0, ring: GREEN },
  { year: "1962", name: "GARRINCHA", line: "1962 · 3–1", shirt: YELLOW, shorts: BLUE, ball: "leatherLight", pose: "wave", skin: SKIN_TONES[3], hairStyle: 0, ring: BLUE },
  { year: "1970", name: "PELÉ", line: "1970 · 4–1", shirt: YELLOW, shorts: BLUE, ball: "telstar", pose: "cheer", skin: SKIN_TONES[4], hairStyle: 0, ring: GREEN },
  { year: "1994", name: "ROMÁRIO", line: "1994 · 0–0, pen.", shirt: YELLOW, shorts: BLUE, ball: "ninety4", pose: "stand", skin: SKIN_TONES[3], hairStyle: 0, ring: BLUE },
  { year: "2002", name: "RONALDO", line: "2002 · 2–0", shirt: YELLOW, shorts: BLUE, ball: "two002", pose: "cheer", skin: SKIN_TONES[2], hairStyle: 3, ring: GREEN },
];

export const PEDS: [number, number][] = [[-2.0, 3.5], [2.0, 0.9], [-2.0, -1.7], [2.0, -4.3], [-2.0, -6.9]];
export const pedestal = (i: number) => {
  const [x, z] = PEDS[i];
  return { x, z, h: 0.9 + i * 0.15 };
};

/** Screen point (1080×1920 px) → world point on the plane z = zPlane, through the cover camera. */
export const coverCam = () => {
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 1, 900);
  cam.position.set(...CAM_POS);
  cam.lookAt(...CAM_TARGET);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
};
const unproject = (sx: number, sy: number, zPlane: number): V3 => {
  const cam = coverCam();
  const p = new THREE.Vector3((sx / 1080) * 2 - 1, 1 - (sy / 1920) * 2, 0.5).unproject(cam);
  const d = p.sub(cam.position).normalize();
  const t = (zPlane - cam.position.z) / d.z;
  const w = cam.position.clone().add(d.multiplyScalar(t));
  return [w.x, w.y, w.z];
};
/** Screen point → world point on the horizontal plane y = yPlane. */
const toFloor = (sx: number, sy: number, yPlane: number): V3 => {
  const cam = coverCam();
  const p = new THREE.Vector3((sx / 1080) * 2 - 1, 1 - (sy / 1920) * 2, 0.5).unproject(cam);
  const d = p.sub(cam.position).normalize();
  const t = (yPlane - cam.position.y) / d.y;
  const w = cam.position.clone().add(d.multiplyScalar(t));
  return [w.x, w.y, w.z];
};
// five stars + the empty sixth on one arc above the corridor (screen-solved so the arc never
// touches the headline or the far players' heads)
const ARC_X = [150, 300, 450, 615, 775, 935];
export const starPos = (i: number): V3 => {
  const t = i / 5;
  return unproject(ARC_X[i], 628 - 92 * Math.sin(Math.PI * t), 0);
};

export const SHOT: Shot = { pos: CAM_POS, target: CAM_TARGET, fov: FOV, focus: 56, aperture: 0.0012, maxBlur: 0.006, exposure: 1.0 };

export const LOOK: StudioLook = { ...NEUTRAL_LOOK, tint: [1.05, 1.0, 0.86], tintAmount: 0.75, keyAz: (24 * Math.PI) / 180, keyEl: (58 * Math.PI) / 180, keyIntensity: 2.2, envIntensity: 0.85 };

// ---------- star geometry ----------
const starShape = (R: number, r: number) => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    const x = rr * Math.cos(a), y = rr * Math.sin(a);
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
};

const faceCamera = (p: V3, tilt = 0, face: V3 = CAM_POS) => {
  const o = new THREE.Object3D();
  o.position.set(...p);
  o.lookAt(...face);
  o.rotateZ(tilt);
  return o.quaternion.clone();
};

export const Star: React.FC<{ pos: V3; tilt: number; halo: string; scale?: number; lit?: number; face?: V3 }> = ({ pos, tilt, halo, scale = 1, lit = 1, face = CAM_POS }) => {
  const body = useMemo(() => new THREE.Color("#b9bec0").lerp(new THREE.Color("#FFD43A"), Math.min(1, Math.max(0, lit))), [lit]);
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(starShape(0.42, 0.18), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 });
    g.center();
    return g;
  }, []);
  const q = faceCamera(pos, tilt, face);
  return (
    <group position={pos} quaternion={q} scale={scale * (0.82 + 0.18 * Math.min(1, lit))}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color={body} emissive="#FFB300" emissiveIntensity={0.55 * lit} metalness={0.7} roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, -0.25]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial map={glowTexture()} color={halo} transparent opacity={0.55 * lit} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.2]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial map={glowTexture()} color="#FFE07A" transparent opacity={0.65 * lit} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const GhostStar: React.FC<{ pos: V3; pulse?: number; face?: V3 }> = ({ pos, pulse = 0, face = CAM_POS }) => {
  const { geo, edges } = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(starShape(0.42, 0.18), { depth: 0.1, bevelEnabled: false });
    g.center();
    return { geo: g, edges: new THREE.EdgesGeometry(g) };
  }, []);
  const q = faceCamera(pos, 0.08, face);
  return (
    <group position={pos} quaternion={q} scale={1 + 0.25 * pulse}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.22} roughness={0.1} clearcoat={1} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={pulse > 0 ? new THREE.Color("#7d8487").lerp(new THREE.Color("#c0262b"), pulse) : "#7d8487"} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
};

/** Glowing ribbon through the five stars: green → yellow → blue. */
export const StarArc: React.FC<{ dotColor?: string }> = ({ dotColor = "#8b9295" }) => {
  const { geo, dots } = useMemo(() => {
    const pts = ERAS.map((_, i) => new THREE.Vector3(...starPos(i)));
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const g = new THREE.TubeGeometry(curve, 160, 0.045, 8, false);
    const cols: number[] = [];
    const a = new THREE.Color(PITCH), b = new THREE.Color("#FFD43A"), c = new THREE.Color("#3D7BFF");
    const pos = g.attributes.position;
    const n = 161, ring = pos.count / n;
    for (let k = 0; k < pos.count; k++) {
      const t = Math.floor(k / ring) / (n - 1);
      const col = t < 0.5 ? a.clone().lerp(b, t * 2) : b.clone().lerp(c, (t - 0.5) * 2);
      cols.push(col.r * 2.2, col.g * 2.2, col.b * 2.2);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    // dotted continuation to the empty sixth star
    const from = new THREE.Vector3(...starPos(4)), to = new THREE.Vector3(...starPos(5));
    const d: V3[] = [];
    for (let i = 1; i < 9; i++) {
      const p = from.clone().lerp(to, i / 9);
      p.y += Math.sin((i / 9) * Math.PI) * 0.35;
      d.push([p.x, p.y, p.z]);
    }
    return { geo: g, dots: d };
  }, []);
  return (
    <>
      <mesh geometry={geo} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <meshBasicMaterial vertexColors toneMapped={false} transparent opacity={0.85} />
      </mesh>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshBasicMaterial color={dotColor} toneMapped={dotColor === "#8b9295"} />
        </mesh>
      ))}
    </>
  );
};

// ---------- pedestal ----------
export const Pedestal: React.FC<{ i: number; empty?: boolean; satin?: boolean }> = ({ i, empty, satin = false }) => {
  const { x, z, h } = pedestal(i);
  const era = ERAS[i];
  const grain = useSurfaceGrain(31 + i, 0.12, 3);
  const year = empty ? "2026" : era.year;
  const plaque = plaqueTexture(year, empty ? "#9aa0a2" : era.ring, empty);
  const ring = empty ? "#b9bec0" : era.ring;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <RoundedBoxGeo args={[PED_W, h, PED_W]} radius={satin ? 0.15 : 0.08} segments={satin ? 6 : 4} />
        {satin ? (
          <meshPhysicalMaterial color="#efebe3" roughness={0.34} roughnessMap={grain} clearcoat={0.22} clearcoatRoughness={0.12} sheen={0.35} sheenRoughness={0.4} sheenColor="#fff4dc" />
        ) : (
          <meshPhysicalMaterial color="#ecebe6" roughness={0.42} roughnessMap={grain} clearcoat={0.45} clearcoatRoughness={0.25} />
        )}
      </mesh>
      {satin ? (
        // film only: darker satin-steel skirt at the base, a value step that reads the pedestal as solid
        <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
          <RoundedBoxGeo args={[PED_W + 0.08, 0.14, PED_W + 0.08]} radius={0.05} segments={3} />
          <meshPhysicalMaterial color="#8f8b84" metalness={0.6} roughness={0.32} clearcoat={0.3} />
        </mesh>
      ) : null}
      {/* glowing inlay ring on the top edge */}
      <mesh position={[0, h + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.82, 96]} />
        <meshBasicMaterial color={new THREE.Color(ring).multiplyScalar(1.6)} toneMapped={false} />
      </mesh>
      {/* engraved front plaque, facing the camera axis */}
      <mesh position={[0, h * 0.5, PED_W / 2 + 0.003]}>
        <planeGeometry args={[Math.min(h * 0.92, 1.6), Math.min(h * 0.92, 1.6)]} />
        <meshPhysicalMaterial map={plaque} roughness={0.5} clearcoat={0.3} />
      </mesh>
    </group>
  );
};

export const Ball: React.FC<{ pos: V3; skin: Era["ball"]; r?: number; detail?: boolean }> = ({ pos, skin, r = 0.26, detail = false }) => {
  const leather = skin.startsWith("leather");
  if (detail && !leather && (skin === "ninety4" || skin === "two002")) {
    const tx = modernBallTextures(skin);
    return (
      <mesh castShadow receiveShadow position={pos} rotation={[0.35, 0.6, 0.1]}>
        <sphereGeometry args={[r, 64, 48]} />
        <meshPhysicalMaterial map={tx.map} bumpMap={tx.bump} bumpScale={1.4} roughness={0.32} clearcoat={0.85} clearcoatRoughness={0.12} />
      </mesh>
    );
  }
  if (detail && leather) {
    // film close-ups: stitched 18-panel leather with a lace slit, pressed seams via bump map
    const tx = leatherBallTextures(skin === "leatherLight");
    return (
      <mesh castShadow receiveShadow position={pos} rotation={[0.25, 2.2, 0.15]}>
        <sphereGeometry args={[r, 64, 48]} />
        <meshPhysicalMaterial map={tx.map} bumpMap={tx.bump} bumpScale={2.2} roughness={0.55} roughnessMap={tx.bump} clearcoat={0.35} clearcoatRoughness={0.35} sheen={0.25} sheenRoughness={0.5} sheenColor="#ffe2b8" />
      </mesh>
    );
  }
  return (
    <mesh castShadow receiveShadow position={pos} rotation={[0.4, 0.9, 0.2]}>
      <sphereGeometry args={[r, 48, 32]} />
      <meshPhysicalMaterial map={ballTexture(skin)} {...(leather ? { roughness: 0.62, clearcoat: 0.25, clearcoatRoughness: 0.5 } : { roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15 })} />
    </mesh>
  );
};

export const Player: React.FC<{ i: number; f: number; detail?: boolean }> = ({ i, f, detail = false }) => {
  const { x, z, h } = pedestal(i);
  const e = ERAS[i];
  const heading = Math.atan2(CAM_POS[0] - x, CAM_POS[2] - z) + (i % 2 ? -0.35 : 0.35);
  const look = useMemo(
    () => ({ skin: e.skin, hair: "#1b1411", top: e.shirt, bottom: e.shorts, outfit: "casual" as const, hairStyle: e.hairStyle, build: 1.04, height: 1 }),
    [e],
  );
  const side = i % 2 ? -1 : 1;
  return (
    <>
      <ToyPerson f={f} seed={7 + i * 5} pose={e.pose} look={look} position={[x - side * 0.15, h, z - 0.1]} heading={heading} scale={1.9} />
      <Ball pos={[x + side * 0.55, h + 0.26, z + 0.45]} skin={e.ball} detail={detail} />
    </>
  );
};

/** Generic stylised gold cup on a small plinth at the end of the corridor (not a trophy replica). */
export const Cup: React.FC<{ pos: V3; cupK?: number }> = ({ pos, cupK = 1 }) => {
  const ghost = useMemo(() => {
    const pts: [number, number][] = [[0.62, 0], [0.42, 0.34], [0.13, 0.62], [0.12, 0.9], [0.42, 1.25], [0.7, 1.9], [0.6, 1.92]];
    return new THREE.EdgesGeometry(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 12), 1);
  }, []);
  const geo = useMemo(() => {
    const pts: [number, number][] = [
      [0, 0], [0.62, 0], [0.62, 0.12], [0.5, 0.16], [0.42, 0.34], [0.2, 0.42], [0.13, 0.62], [0.12, 0.9], [0.2, 1.05],
      [0.42, 1.25], [0.62, 1.55], [0.7, 1.9], [0.68, 2.05], [0.62, 2.05], [0.6, 1.92], [0.0, 1.92],
    ];
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 96);
  }, []);
  const handle = useMemo(() => new THREE.TorusGeometry(0.34, 0.06, 16, 48, Math.PI * 1.1), []);
  const gold = { color: "#E3B23C", metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.1 };
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <RoundedBoxGeo args={[1.5, 0.7, 1.5]} radius={0.06} segments={3} />
        <meshPhysicalMaterial color="#1f2426" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      {/* AUDIRA engraving on the plinth front */}
      <mesh position={[0, 0.36, 0.753]}>
        <planeGeometry args={[1.36, 0.34]} />
        <meshPhysicalMaterial map={brandTexture()} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.704, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.56, 0.6, 96]} />
        <meshBasicMaterial color={new THREE.Color(PITCH).multiplyScalar(1.5)} toneMapped={false} />
      </mesh>
      {cupK < 1 ? (
        <lineSegments geometry={ghost} position={[0, 0.7, 0]} scale={0.9}>
          <lineBasicMaterial color="#8b9295" transparent opacity={0.45 * (1 - cupK)} />
        </lineSegments>
      ) : null}
      <group position={[0, 0.7 + 2.4 * (1 - cupK), 0]} scale={0.9 * Math.max(0.001, cupK)} visible={cupK > 0.002}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshPhysicalMaterial {...gold} side={THREE.DoubleSide} />
        </mesh>
        {[1, -1].map((k) => (
          <mesh key={k} geometry={handle} castShadow position={[k * 0.66, 1.5, 0]} rotation={[0, 0, k === 1 ? -Math.PI * 0.55 : Math.PI * 0.45]}>
            <meshPhysicalMaterial {...gold} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const PitchRunner: React.FC = () => {
  const tex = useMemo(() => {
    const t = pitchTexture().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1.6);
    t.needsUpdate = true;
    return t;
  }, []);
  const grain = useSurfaceGrain(12, 0.2, 8);
  return (
    <group position={[0, 0.03, 2.1]}>
      <mesh receiveShadow castShadow>
        <RoundedBoxGeo args={[1.6, 0.06, 23.8]} radius={0.025} segments={2} />
        <meshPhysicalMaterial color="#2a8a4a" {...POLISH.fabric} sheen={0.3} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.031, 0]}>
        <planeGeometry args={[1.6, 23.8]} />
        <meshPhysicalMaterial map={tex} roughnessMap={grain} {...POLISH.fabric} sheen={0.25} color="#d6e6d9" />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Studio look={LOOK} plinth={{ top: 0, r: 90, h: 1, ring: false }} shadow={{ left: -18, right: 18, top: 22, bottom: -22, near: 4, far: 80 }} />
    <PitchRunner />
    {ERAS.map((_, i) => (
      <React.Fragment key={i}>
        <Pedestal i={i} />
        <Player i={i} f={f} />
        <Star pos={starPos(i)} tilt={(i % 2 ? -1 : 1) * 0.12} halo={i % 2 ? "#3D7BFF" : PITCH} />
      </React.Fragment>
    ))}
    <GhostStar pos={starPos(5)} />
    {/* foreground: an out-of-focus modern ball on the studio floor */}
    <Ball pos={toFloor(905, 1760, 0.85)} skin="telstar" r={0.85} />
    <Cup pos={[0, 0, -10.6]} />
    <StarArc />
    <CameraRig shot={SHOT} />
    <Post shot={SHOT} frame={Math.round(f)} aoRadius={0.45} />
  </>
);

// ---------- HTML overlay ----------
export const project = (p: V3) => {
  const v = new THREE.Vector3(...p).project(coverCam());
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920] as const;
};

export const tagBox = (muted: boolean, left: boolean): React.CSSProperties => ({
  position: "absolute",
  textAlign: left ? "right" : "left",
  fontFamily: MANROPE,
  whiteSpace: "nowrap",
  padding: "7px 14px 9px",
  background: muted ? "rgba(244,242,238,0.7)" : "rgba(250,249,246,0.88)",
  [left ? "borderRight" : "borderLeft"]: `4px solid ${muted ? "#b9bec0" : PITCH}`,
  borderRadius: 6,
  boxShadow: "0 6px 18px rgba(31,36,38,0.10)",
});

export const TagBody: React.FC<{ name: string; line: string; muted?: boolean }> = ({ name, line, muted }) => (
  <>
    <div style={{ fontSize: 29, fontWeight: 600, letterSpacing: "0.06em", color: muted ? INK_SOFT : INK, lineHeight: 1.1 }}>{name}</div>
    <div style={{ fontSize: 26, fontWeight: 500, color: muted ? "#80878a" : INK_SOFT, lineHeight: 1.2 }}>{line}</div>
  </>
);

/** Name card beside each player, on the outer side (left column → card to the left). */
const Tag: React.FC<{ i: number; name: string; line: string }> = ({ i, name, line }) => {
  const { x, z, h } = pedestal(i);
  const left = x < 0;
  const [sx, sy] = project([x, h + 1.15, z]);
  // rough card width (Manrope 30/26 px) so cards never leave the frame
  const est = Math.max(name.length * 21, line.length * 13.5) + 32;
  return (
    <div style={{ ...tagBox(false, left), top: sy - 40, ...(left ? { right: Math.min(1080 - sx + 60, 1080 - 36 - est) } : { left: Math.min(sx + 60, 1080 - 36 - est) }) }}>
      <TagBody name={name} line={line} />
    </div>
  );
};

export const Overlay: React.FC<{ headK?: number; tagK?: number }> = ({ headK = 1, tagK = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", fontFamily: MANROPE, opacity: headK }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(243,241,236,0.92) 0%, rgba(243,241,236,0.75) 20%, rgba(243,241,236,0) 30%)",
      }}
    />
    <div style={{ position: "absolute", top: 192, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.38em", paddingLeft: "0.38em", color: GREEN }}>SEJARAH SEPAK BOLA #02</div>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, color: INK }}>
        <span style={{ fontSize: 224, fontWeight: 200, lineHeight: 0.82, letterSpacing: "-0.04em" }}>5</span>
        <div style={{ textAlign: "left", fontWeight: 600, fontSize: 96, lineHeight: 0.98, letterSpacing: "-0.01em" }}>
          <div>BINTANG</div>
          <div style={{ color: GREEN }}>BRASIL</div>
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 38, fontWeight: 300, color: INK_SOFT }}>dan kenapa belum ada yang keenam</div>
    </div>
    <div style={{ position: "absolute", inset: 0, opacity: tagK }}>
    {ERAS.map((e, i) => (
      <Tag key={i} i={i} name={e.name} line={e.line} />
    ))}
    {(() => {
      const [sx, sy] = project(starPos(5));
      return (
        <div style={{ ...tagBox(true, true), top: sy + 52, right: 1080 - sx - 40 }}>
          <TagBody name="2026" line="gugur di 16 besar" muted />
        </div>
      );
    })()}
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [handle] = useState(() => delayRender("Manrope for EP02 cover"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: "#e9e6e0" }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: FOV, near: 1, far: 900, position: CAM_POS }}
          >
            <Scene f={f} />
          </ThreeCanvas>
          <Overlay />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
