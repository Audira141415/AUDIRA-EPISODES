// EP037 TOYDIORAMA building blocks: rounded matte-plastic boxes, taped paper tags, canvas textures.
// Everything is static or a pure function of `f` (60 fps normalised frame).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type V3 = [number, number, number];

export const P = {
  // stage + theatre (kit palette)
  floor: "#3A291E",
  floorLight: "#4E3628",
  trim: "#22160F",
  dowel: "#C8A165",
  velvet: "#6E1B24",
  velvetDark: "#4A1018",
  footlight: "#FFAB40",
  // dusk road
  asphalt: "#2B2F36",
  asphaltEdge: "#3A3F47",
  grass: "#3E6B4E",
  grassDark: "#2C5040",
  // bus livery (generic, no operator branding)
  busCream: "#F2E8D5",
  busTeal: "#1F6F78",
  busCoral: "#D95D39",
  busHoney: "#E5A93C",
  glass: "#1B2A3A",
  tyre: "#1A1D21",
  hub: "#B9BEC4",
  cut: "#E98A5B",
  cutInner: "#5A2E22",
  // interior
  carpet: "#2F5061",
  seat: "#B8432F",
  seatCover: "#F4EFEA",
  cubicle: "#EDE6DA",
  tile: "#BFD8DF",
  porcelain: "#FBFAF7",
  door: "#2F8C8A",
  pipe: "#8C949C",
  tank: "#C9CED3",
  // paper
  paper: "#FAF6EE",
  kraft: "#E3C9A0",
  ink: "#181A1B",
  tape: "#E6C875",
};

/** Matte plastic / soft clay rounded box (kit rule: roughness 0.70-0.85, metalness <= 0.05). */
export const RBox: React.FC<{
  size: V3;
  r?: number;
  color: string;
  position?: V3;
  rotation?: V3;
  rough?: number;
  emissive?: string;
  emissiveIntensity?: number;
  cast?: boolean;
  receive?: boolean;
  opacity?: number;
}> = ({ size, r = 0.04, color, position, rotation, rough = 0.76, emissive, emissiveIntensity = 0, cast = true, receive = true, opacity }) => {
  const geo = useMemo(() => {
    const rr = Math.min(r, Math.min(...size) / 2 - 1e-4);
    return new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.max(rr, 0.001));
  }, [size[0], size[1], size[2], r]);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow={cast} receiveShadow={receive}>
      <meshStandardMaterial
        color={color}
        roughness={rough}
        metalness={0.03}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
};

export const Cyl: React.FC<{
  r: number;
  r2?: number;
  h: number;
  color: string;
  position?: V3;
  rotation?: V3;
  rough?: number;
  seg?: number;
  emissive?: string;
  emissiveIntensity?: number;
}> = ({ r, r2, h, color, position, rotation, rough = 0.76, seg = 28, emissive, emissiveIntensity = 0 }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <cylinderGeometry args={[r, r2 ?? r, h, seg]} />
    <meshStandardMaterial color={color} roughness={rough} metalness={0.03} emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity} />
  </mesh>
);

/** Canvas texture helper (runs once per mount; deterministic content). */
export const useCanvasTexture = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, deps: unknown[] = []) =>
  useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    if (ctx) draw(ctx);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

/** Kraft paper tag with washi tape, a tiny pin and a string down to its target. */
export const PaperTag: React.FC<{
  text: string;
  sub?: string;
  font: string;
  position: V3;
  rotY: number;
  tilt: number;
  /** string end in the PARENT space (the tag hangs from it). */
  target?: V3;
  w?: number;
}> = ({ text, sub, font, position, rotY, tilt, target, w = 1.0 }) => {
  const h = w * 0.46;
  const tex = useCanvasTexture(
    640,
    294,
    (ctx) => {
      ctx.fillStyle = P.paper;
      ctx.fillRect(0, 0, 640, 294);
      // paper fibre speckle (seeded)
      let s = 7;
      const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(120,90,50,${0.04 + rnd() * 0.06})`;
        ctx.fillRect(rnd() * 640, rnd() * 294, 1 + rnd() * 2, 1 + rnd() * 2);
      }
      ctx.strokeStyle = "rgba(60,40,20,0.18)";
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 620, 274);
      ctx.fillStyle = P.busCoral;
      ctx.font = `600 30px ${font}`;
      ctx.fillText(sub ?? "", 44, 78);
      ctx.fillStyle = P.ink;
      let px = 128;
      ctx.font = `${px}px 'Lilita One', ${font}`;
      const tw = ctx.measureText(text).width;
      if (tw > 560) {
        px = Math.floor((px * 560) / tw);
        ctx.font = `${px}px 'Lilita One', ${font}`;
      }
      ctx.fillText(text, 40, 222);
      // hand-drawn underline
      ctx.strokeStyle = P.busCoral;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(44, 248);
      ctx.quadraticCurveTo(250, 238, 470, 252);
      ctx.stroke();
    },
    [text, sub, font],
  );
  let stringTo: V3 | null = null;
  if (target) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, tilt)).invert();
    const v = new THREE.Vector3(target[0] - position[0], target[1] - position[1], target[2] - position[2]).applyQuaternion(q);
    stringTo = [v.x, v.y, v.z];
  }
  return (
    <group position={position} rotation={[0, rotY, tilt]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.015]} />
        <meshStandardMaterial color={P.paper} roughness={0.92} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.0085]}>
        <planeGeometry args={[w * 0.995, h * 0.99]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />
      </mesh>
      {/* washi tape strip */}
      <mesh position={[-w * 0.08, h * 0.47, 0.014]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[w * 0.42, h * 0.26, 0.004]} />
        <meshStandardMaterial color={P.tape} transparent opacity={0.82} roughness={0.7} />
      </mesh>
      {stringTo ? (
        <StringLine from={[0, stringTo[1] > 0 ? h / 2 : -h / 2, 0]} to={stringTo} />
      ) : null}
    </group>
  );
};

const StringLine: React.FC<{ from: V3; to: V3 }> = ({ from, to }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return (
    <group>
      <mesh position={mid} quaternion={q} castShadow>
        <cylinderGeometry args={[0.008, 0.008, len, 6]} />
        <meshStandardMaterial color="#F1E3C4" roughness={0.9} />
      </mesh>
      <mesh position={b}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={P.busCoral} roughness={0.6} />
      </mesh>
    </group>
  );
};
