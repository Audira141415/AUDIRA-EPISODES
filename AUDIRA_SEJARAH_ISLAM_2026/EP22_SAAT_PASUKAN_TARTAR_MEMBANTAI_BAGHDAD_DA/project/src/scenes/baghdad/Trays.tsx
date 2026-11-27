// Off-sheet trays on the east side of the table: Letters (s3), Carpet (s6), book Dock (s7).
// One clear 3D subject per beat: two scrolls + a red wax seal that cracks, a woven carpet that
// rolls itself up, books falling into a river that turns black and then blue again.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { CUE } from "./cues.ts";
import { CARPET, DOCK, LETTER } from "./geo.ts";
import { easeInCubic, easeOutBack, lin, mix, ss } from "./timing.ts";

const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const Tray: React.FC<{ w: number; d: number; color?: string }> = ({ w, d, color = "#4a2f1c" }) => (
  <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={[w, 0.06, d]} radius={0.02} />
    <meshStandardMaterial color={color} roughness={0.5} />
  </mesh>
);

// ---- s3 letters ----------------------------------------------------------------------------
export const LANTERN: [number, number, number] = [LETTER[0] + 0.95, 0, LETTER[1] - 0.55];
export const CANDLE_LIGHT: [number, number, number] = [LANTERN[0], 0.34, LANTERN[2]];
export const candleIntensity = (t: number) => (2.4 + Math.sin(t * 13) * 0.25 + Math.sin(t * 29) * 0.15) * ss(23.2, 24.6, t) * (1 - ss(34.2, 35.2, t));

const Flame: React.FC<{ t: number; at: [number, number, number] }> = ({ t, at }) => {
  const f = 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 31 + 1) * 0.05;
  return (
    <group position={at} scale={[1, f, 1]}>
      <mesh>
        <sphereGeometry args={[0.022, 12, 10]} />
        <meshBasicMaterial color="#fff2c0" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <coneGeometry args={[0.02, 0.06, 12]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Wax seal: two half discs that split apart on "menolak". */
const Seal: React.FC<{ crack: number }> = ({ crack }) => (
  <group>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * crack * 0.07, 0, s * crack * 0.02]} rotation={[0, 0, s * crack * -0.35]}>
        <mesh rotation={[0, s > 0 ? 0 : Math.PI, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.185, 0.05, 32, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial color="#b0221a" roughness={0.35} clearcoat={0.7} emissive="#5a0a07" emissiveIntensity={0.35} />
        </mesh>
        {/* stamped gold ring so the half discs read as one broken wax seal */}
        <mesh rotation={[0, s > 0 ? 0 : Math.PI, 0]} position={[0, 0.028, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#E8B84A" metalness={0.7} roughness={0.3} emissive="#E8B84A" emissiveIntensity={0.25} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Gold arrow of help from the west: slides in on "menolong", stops short and fades on "tidak pernah datang". */
const HelpArrow: React.FC<{ t: number }> = ({ t }) => {
  const k = ss(CUE.menolong - 0.2, CUE.menolong + 0.8, t);
  const fade = 1 - ss(CUE.takDatang, CUE.takDatang + 1.0, t);
  if (k <= 0.01 || fade <= 0.01) return null;
  const x = mix(-1.55, -0.85, k);
  const mat = <meshStandardMaterial color="#E8B84A" emissive="#E8B84A" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} transparent opacity={fade} />;
  return (
    <group position={[x, 0.12, 0.35]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 12]} />
        {mat}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.08]}>
        <coneGeometry args={[0.1, 0.2, 16]} />
        {mat}
      </mesh>
    </group>
  );
};

export const Letters: React.FC<{ t: number }> = ({ t }) => {
  const open = easeOutBack(lin(CUE.pesan - 0.4, CUE.pesan + 0.6, t));
  const crack = easeOutBack(lin(CUE.menolak, CUE.menolak + 0.45, t));
  return (
    <group>
      <group position={[LETTER[0], 0, LETTER[1]]}>
        <Tray w={3.0} d={2.0} />
        {/* Mongol scroll (east) faces the caliph's scroll (west) */}
        <group position={[0.55, 0.06, -0.05]} rotation={[0, -0.25, 0]} scale={[1, 1, Math.max(0.2, open)]}>
          <AssetModel id="campaign-map-scroll-d4a382" size={0.85} ground tint="#E2CFA0" />
        </group>
        <group position={[-0.6, 0.06, 0.05]} rotation={[0, 0.3, 0]}>
          <AssetModel id="spell-scroll-29d32d" size={0.7} ground tint="#E6D3A8" />
        </group>
        <group position={[0.05, 0.1, 0.42]}>
          <Seal crack={crack} />
        </group>
        <HelpArrow t={t} />
      </group>
      <AssetModel id="table-candle-lantern-a7b5af" size={0.45} ground position={[LANTERN[0], 0.06, LANTERN[2]]} />
      <Flame t={t} at={[CANDLE_LIGHT[0], 0.27, CANDLE_LIGHT[2]]} />
    </group>
  );
};

// ---- s6 carpet --------------------------------------------------------------------------------
let RUG_TEX: THREE.CanvasTexture | null = null;
const rugTexture = () => {
  if (RUG_TEX) return RUG_TEX;
  const W = 512, H = 768;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#7d1a17"; g.fillRect(0, 0, W, H);
  // borders
  for (const [m, col] of [[0, "#d6a64a"], [18, "#1d2a44"], [44, "#d6a64a"], [52, "#7d1a17"]] as [number, string][]) {
    g.fillStyle = col; g.fillRect(m, m, W - 2 * m, H - 2 * m);
  }
  // central medallion + geometric lattice (girih-like, no figures, no script)
  g.save(); g.translate(W / 2, H / 2);
  for (let r = 150; r > 20; r -= 26) {
    g.fillStyle = r % 52 < 26 ? "#d6a64a" : "#1d2a44";
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.72 : r;
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 1.25);
    }
    g.closePath(); g.fill();
  }
  g.restore();
  g.strokeStyle = "rgba(214,166,74,0.55)"; g.lineWidth = 3;
  for (let y = 90; y < H - 80; y += 60) for (let x = 90; x < W - 80; x += 60) {
    if (Math.hypot(x - W / 2, (y - H / 2) / 1.25) < 170) continue;
    g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 18, y); g.lineTo(x, y + 18); g.lineTo(x - 18, y); g.closePath(); g.stroke();
  }
  // wool texture
  const r = prng(6301);
  for (let n = 0; n < 9000; n++) {
    g.fillStyle = `rgba(${r() < 0.5 ? "0,0,0" : "255,230,190"},${0.04 + r() * 0.05})`;
    g.fillRect(r() * W, r() * H, 2, 2);
  }
  RUG_TEX = new THREE.CanvasTexture(cv);
  RUG_TEX.colorSpace = THREE.SRGBColorSpace;
  RUG_TEX.anisotropy = 8;
  return RUG_TEX;
};

const RW = 1.3, RL = 2.0;
/** Carpet that rolls up from its far end (x = +RL/2) toward the near end. roll 0..1. */
const Carpet: React.FC<{ roll: number }> = ({ roll }) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(RL, RW, 160, 6);
    g.rotateX(-Math.PI / 2);
    g.userData.base = (g.attributes.position.array as Float32Array).slice();
    return g;
  }, []);
  const tex = useMemo(() => rugTexture(), []);
  const base = geom.userData.base as Float32Array;
  const p = geom.attributes.position as THREE.BufferAttribute;
  const rad = 0.06;
  const front = RL / 2 - roll * RL * 0.78; // where the roll currently sits
  for (let n = 0; n < p.count; n++) {
    const x = base[n * 3], z = base[n * 3 + 2];
    if (x <= front) p.setXYZ(n, x, 0.012, z);
    else {
      // wrapped length s, spiral radius shrinks slightly per turn
      const s = x - front;
      const r = rad + 0.004 * (s / (Math.PI * 2 * rad));
      const th = s / r;
      p.setXYZ(n, front + Math.sin(th) * r, 0.012 + r - Math.cos(th) * r, z);
    }
  }
  p.needsUpdate = true;
  geom.computeVertexNormals();
  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshPhysicalMaterial map={tex} roughness={0.95} sheen={0.6} sheenRoughness={0.6} sheenColor="#ffcf9a" side={THREE.DoubleSide} />
    </mesh>
  );
};

export const CarpetTray: React.FC<{ t: number }> = ({ t }) => {
  const roll = ss(CUE.karpet - 0.2, 65.6, t);
  return (
    <group position={[CARPET[0], 0, CARPET[1]]}>
      <Tray w={3.0} d={2.0} color="#3a2416" />
      <group position={[0.1, 0.06, -0.05]}>
        <Carpet roll={roll} />
      </group>
      {/* folded black banner beside the carpet */}
      <group position={[-1.05, 0.06, 0.62]} rotation={[0, 0.3, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.012 + i * 0.022, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.5 - i * 0.03, 0.02, 0.32 - i * 0.02]} radius={0.008} />
            <meshPhysicalMaterial color="#141414" roughness={0.75} sheen={0.8} sheenRoughness={0.4} sheenColor="#9a9a9a" />
          </mesh>
        ))}
        <mesh position={[0, 0.085, 0]} castShadow>
          <coneGeometry args={[0.03, 0.08, 12]} />
          <meshStandardMaterial color="#d8b25a" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

// ---- s7 book dock -----------------------------------------------------------------------------
/** River colour: blue, black on "menghitam / tinta", blue again on "gambaran sastra". */
const inkAt = (t: number) => ss(CUE.menghitam, CUE.tinta + 0.5, t) * (1 - ss(CUE.sastra, CUE.sastra + 1.2, t));
const BOOKS = [
  { x: -0.55, z: 0.1, t0: CUE.konon - 0.15, c: "#6b3b22" },
  { x: -0.2, z: -0.05, t0: CUE.konon + 0.2, c: "#4a2d1a" },
  { x: 0.15, z: 0.12, t0: CUE.konon + 0.5, c: "#7a4a2a" },
  { x: 0.5, z: -0.02, t0: CUE.konon + 0.8, c: "#5a2f1c" },
];
const SHELVES = [
  { id: "bookshelf-5e881a", x: -0.75, t0: CUE.perpus2 },
  { id: "alcove-bookcase-83894d", x: 0, t0: CUE.perpus2 + 0.45 },
  { id: "bookshelf-5e881a", x: 0.75, t0: CUE.perpus2 + 0.9 },
];
export const Dock: React.FC<{ t: number }> = ({ t }) => {
  const ink = inkAt(t);
  const water = new THREE.Color("#2f6a98").lerp(new THREE.Color("#141b2e"), ink);
  return (
    <group position={[DOCK[0], 0, DOCK[1]]}>
      <Tray w={3.0} d={2.4} color="#3a2618" />
      {/* river channel along the near side */}
      <mesh position={[0, 0.062, 0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.9, 0.9, 1, 1]} />
        <meshPhysicalMaterial color={water} roughness={0.42} clearcoat={0.25} clearcoatRoughness={0.5} emissive={ink > 0.5 ? "#000000" : "#16354f"} emissiveIntensity={0.3 * (1 - ink)} />
      </mesh>
      {/* ink plume spreading from the books */}
      {ink > 0.01 ? (
        <mesh position={[0, 0.066, 0.35]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.3 + ink * 1.1, 0.3 + ink * 0.25, 1]}>
          <circleGeometry args={[1, 40]} />
          <meshBasicMaterial color="#10162a" transparent opacity={0.7 * ink} depthWrite={false} />
        </mesh>
      ) : null}
      {/* dock planks */}
      {[-0.4, 0, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.09, -0.15]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.36, 0.04, 0.22]} radius={0.01} />
          <meshStandardMaterial color="#8a5f3a" roughness={0.75} />
        </mesh>
      ))}
      {/* books fall from the dock into the river, then float */}
      {BOOKS.map((b, i) => {
        const k = easeInCubic(lin(b.t0, b.t0 + 0.55, t));
        if (k <= 0 && t < b.t0) {
          return (
            <group key={i} position={[b.x, 0.13 + i * 0.0, -0.15]} rotation={[0, i * 0.4, 0]}>
              <AssetModel id="lefthand-item-30f012" size={0.2} ground tint={b.c} />
            </group>
          );
        }
        const back = ss(CUE.perpus2 + i * 0.3, CUE.perpus2 + i * 0.3 + 1.0, t); // rises back to the shelf
        const y = mix(mix(0.13, 0.07, k) + Math.sin(t * 2 + i) * 0.004, 0.9 + i * 0.05, back);
        const z = mix(mix(-0.15, 0.3 + b.z, k), -0.75, back);
        return (
          <group key={i} position={[mix(b.x, SHELVES[Math.min(2, i)].x, back), y, z]} rotation={[k * 1.2 * (1 - back), i * 0.4 + k * 0.6, k * 0.3 * (1 - back)]}>
            <AssetModel id="lefthand-item-30f012" size={0.2} ground tint={b.c} />
          </group>
        );
      })}
      {/* shelves behind the dock light up one by one on "perpustakaan" */}
      {SHELVES.map((s, i) => {
        const k = ss(s.t0, s.t0 + 0.5, t);
        return (
          <group key={i} position={[s.x, 0.06, -0.85]}>
            <AssetModel id={s.id} size={0.95} ground tint="#7a5232" emissive="#ffd9a8" emissiveIntensity={0.04 + k * 0.1} />
            {k > 0.01 ? <pointLight position={[0, 0.5, 0.35]} color="#ffe2b8" intensity={k * 0.6} distance={1.6} decay={2} /> : null}
          </group>
        );
      })}
      {/* "ILMU TIDAK PADAM": one lamp flares at the payoff */}
      <PayoffLamp t={t} />
    </group>
  );
};

const PayoffLamp: React.FC<{ t: number }> = ({ t }) => {
  const k = easeOutBack(lin(CUE.padam - 0.2, CUE.padam + 0.4, t)) * (1 - ss(80.6, 81.4, t));
  if (k <= 0.01) return null;
  return (
    <group position={[0, 1.25, -0.6]}>
      <mesh scale={k}>
        <sphereGeometry args={[0.05, 20, 14]} />
        <meshBasicMaterial color="#FFE6A8" toneMapped={false} />
      </mesh>
      <pointLight color="#fff0d6" intensity={k * 1.3} distance={4} decay={2} />
    </group>
  );
};
