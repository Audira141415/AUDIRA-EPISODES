// AE-059 port: quay, container ship, mooring lines, bollards, fenders, quay crane, lamps.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, surfaceGrain } from "../../core/polish/Polish.tsx";
import { mulberry32 } from "../../kits/worldforge/noise.ts";
import { BOW_V, DECK, HULL_L, HULL_R, QUAY_TOP, QUAY_X, STERN_V, type V3 } from "./world.tsx";

const S = { castShadow: true, receiveShadow: true } as const;
const CX = (HULL_L + HULL_R) / 2;

// ── Quay ──────────────────────────────────────────────────────────────────────
export const Quay: React.FC = () => {
  const { concrete, coping, yellow } = useMemo(() => {
    const g = surfaceGrain(23, 256, 0.3, 30);
    return {
      // rain-wet concrete: low roughness so the lamps and sky streak across it
      concrete: new THREE.MeshPhysicalMaterial({ color: "#3a3b39", roughness: 0.55, roughnessMap: g, bumpMap: g, bumpScale: 0.2, clearcoat: 0.3, clearcoatRoughness: 0.35 }),
      coping: new THREE.MeshStandardMaterial({ color: "#6d6c66", roughness: 0.6, bumpMap: g, bumpScale: 0.2 }),
      yellow: new THREE.MeshStandardMaterial({ color: "#d9a51c", roughness: 0.45 }),
    };
  }, []);
  return (
    <group>
      <mesh material={concrete} position={[QUAY_X - 110, QUAY_TOP - 6, -120]} {...S}>
        <RoundedBoxGeo args={[220, 12, 420]} radius={0.3} segments={2} />
      </mesh>
      <mesh material={coping} position={[QUAY_X - 0.9, QUAY_TOP + 0.12, -120]} {...S}>
        <RoundedBoxGeo args={[1.8, 0.5, 420]} radius={0.12} segments={2} />
      </mesh>
      <mesh material={yellow} position={[QUAY_X - 2.4, QUAY_TOP + 0.02, -120]} receiveShadow>
        <boxGeometry args={[0.35, 0.05, 420]} />
      </mesh>
    </group>
  );
};

// Bollard: cast-iron post with a flared head (lathe profile).
const bollardGeo = (() => {
  let g: THREE.LatheGeometry | null = null;
  return () =>
    (g ??= new THREE.LatheGeometry(
      [
        [0, 0],
        [0.62, 0],
        [0.62, 0.12],
        [0.38, 0.2],
        [0.33, 0.75],
        [0.42, 0.95],
        [0.56, 1.05],
        [0.56, 1.18],
        [0.3, 1.24],
        [0, 1.25],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      40,
    ));
})();

export const bollardPos = (z: number): V3 => [QUAY_X - 1.6, QUAY_TOP, z];

export const Bollards: React.FC<{ zs: number[]; big?: number[] }> = ({ zs, big = [] }) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#16181a", roughness: 0.35, metalness: 0.6, clearcoat: 0.6 }), []);
  const cap = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4a019", roughness: 0.5 }), []);
  return (
    <>
      {zs.map((z) => (
        <group key={z} position={bollardPos(z)} scale={big.includes(z) ? 1.9 : 1.3}>
          <mesh geometry={bollardGeo()} material={mat} {...S} />
          <mesh material={cap} position={[0, 1.2, 0]} {...S}>
            <cylinderGeometry args={[0.57, 0.57, 0.08, 32]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// Cell fenders: black rubber cylinder bolted to the quay face, steel frontal panel against the hull.
export const Fenders: React.FC<{ zs: number[] }> = ({ zs }) => {
  const rubber = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0d0e0f", roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.5 }), []);
  const panel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b2f33", roughness: 0.5, metalness: 0.4 }), []);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c99a1c", roughness: 0.5 }), []);
  const gap = HULL_L - QUAY_X; // 3.5 m
  return (
    <>
      {zs.map((z) => (
        <group key={z} position={[QUAY_X, 2.2, z]}>
          <mesh material={rubber} rotation={[0, 0, Math.PI / 2]} position={[gap * 0.42, 0, 0]} {...S}>
            <cylinderGeometry args={[1.35, 1.6, gap * 0.84, 28]} />
          </mesh>
          <mesh material={panel} position={[gap - 0.28, 0, 0]} {...S}>
            <RoundedBoxGeo args={[0.42, 4.2, 3.2]} radius={0.1} />
          </mesh>
          <mesh material={edge} position={[gap - 0.28, 2.15, 0]}>
            <boxGeometry args={[0.44, 0.16, 3.22]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// ── Ship ──────────────────────────────────────────────────────────────────────
const hullShape = (e: number) => {
  const s = new THREE.Shape();
  const L = HULL_L - e, R = HULL_R + e, a = STERN_V - e, b = BOW_V + e;
  s.moveTo(L + 1.2, a);
  s.lineTo(L, a + 4);
  s.lineTo(L, b - 40);
  s.bezierCurveTo(L, b - 16, CX - 6, b - 2, CX, b);
  s.bezierCurveTo(CX + 6, b - 2, R, b - 16, R, b - 40);
  s.lineTo(R, a + 4);
  s.lineTo(R - 1.2, a);
  s.lineTo(L + 1.2, a);
  return s;
};

const nameTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, 1024, 256);
  x.fillStyle = "#f2f0ea";
  x.textAlign = "center";
  x.font = "700 132px Manrope, sans-serif";
  (x as unknown as { letterSpacing: string }).letterSpacing = "18px";
  x.fillText("AUDIRA", 512, 140);
  x.font = "600 54px Manrope, sans-serif";
  (x as unknown as { letterSpacing: string }).letterSpacing = "14px";
  x.fillText("EXPLAINED", 512, 220);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const CONTAINER_COLORS = ["#7d2e22", "#24506e", "#bfb9ab", "#2f5f52", "#a8552a", "#4b5058", "#6a2630", "#20394d", "#8b7b4e", "#a33a2a"];

/** Corrugated steel side: vertical ribs + a darker frame at the edges (multiplies the instance colour). */
const ribTexture = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 64;
  const x = c.getContext("2d")!;
  for (let i = 0; i < 512; i++) {
    const r = 0.5 + 0.5 * Math.cos((i / 512) * Math.PI * 2 * 44);
    const v = Math.round(255 * (0.72 + 0.26 * r));
    x.fillStyle = `rgb(${v},${v},${v})`;
    x.fillRect(i, 0, 1, 64);
  }
  x.fillStyle = "rgba(20,20,20,0.75)";
  x.fillRect(0, 0, 512, 4);
  x.fillRect(0, 60, 512, 4);
  x.fillRect(0, 0, 5, 64);
  x.fillRect(507, 0, 5, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const Containers: React.FC = () => {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(2.44, 2.59, 12.19, 1, 1, 1);
    const grain = surfaceGrain(91, 256, 0.35, 1);
    const rib = ribTexture();
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, clearcoat: 0.2, roughness: 0.55, color: "#ffffff", map: rib, bumpMap: rib, bumpScale: 0.6 });
    void grain;
    const rnd = mulberry32(5959);
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const o = new THREE.Object3D();
    const bays: { v: number; rows: number }[] = [];
    for (let v = STERN_V + 26; v < 160; v += 12.9) bays.push({ v, rows: 10 });
    for (let v = 182; v < 200; v += 12.9) bays.push({ v, rows: 8 });
    
    for (const b of bays) {
      const base = 4 + Math.floor(rnd() * 3);
      for (let r = 0; r < b.rows; r++) {
        const u = CX + (r - (b.rows - 1) / 2) * 2.56;
        const tiers = Math.max(2, base + (rnd() < 0.3 ? -1 - Math.floor(rnd() * 2) : 0) - (b.rows < 10 ? 1 : 0));
        for (let k = 0; k < tiers; k++) {
          o.position.set(u, DECK + 1.6 + 1.3 + k * 2.62, -b.v);
          o.rotation.set(0, 0, 0);
          o.updateMatrix();
          mats.push(o.matrix.clone());
          const cc = new THREE.Color(CONTAINER_COLORS[Math.floor(rnd() * CONTAINER_COLORS.length)]);
          cc.multiplyScalar(0.8 + rnd() * 0.35);
          cols.push(cc);
        }
      }
    }
    const m = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((mm, i) => {
      m.setMatrixAt(i, mm);
      m.setColorAt(i, cols[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
};

export const Ship: React.FC<{ heave: number; detail?: boolean }> = ({ heave, detail = false }) => {
  const m = useMemo(() => {
    return {
      hull: new THREE.MeshPhysicalMaterial({ color: "#33618a", roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, bumpMap: surfaceGrain(62, 256, 0.4, 70), bumpScale: 0.035 }),
      deck: new THREE.MeshStandardMaterial({ color: "#3a4a44", roughness: 0.7 }),
      boot: new THREE.MeshStandardMaterial({ color: "#8e2a1f", roughness: 0.6 }),
      white: new THREE.MeshPhysicalMaterial({ color: "#d8d8d2", roughness: 0.5, clearcoat: 0.3 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#0b1116", roughness: 0.08, metalness: 0.3 }),
      warm: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffc47a").multiplyScalar(2.2), toneMapped: false }),
      funnel: new THREE.MeshStandardMaterial({ color: "#d4d2cc", roughness: 0.55 }),
      black: new THREE.MeshStandardMaterial({ color: "#121416", roughness: 0.6 }),
      name: new THREE.MeshBasicMaterial({ map: nameTexture(), transparent: true, toneMapped: true, color: "#bdbdb6" }),
      hatch: new THREE.MeshStandardMaterial({ color: "#2b3a36", roughness: 0.6 }),
    };
  }, []);
  const hullGeo = useMemo(() => new THREE.ExtrudeGeometry(hullShape(0), { depth: DECK + 7, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.25, bevelSegments: 2, curveSegments: 32 }), []);
  const fcGeo = useMemo(() => {
    const pts = hullShape(0).getPoints(24).filter((p) => p.y >= 192);
    return new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 3.2, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 2 });
  }, []);
  const sheerGeo = useMemo(() => new THREE.ExtrudeGeometry(hullShape(0.3), { depth: 0.7, bevelEnabled: false, curveSegments: 32 }), []);
  const bootGeo = useMemo(() => new THREE.ExtrudeGeometry(hullShape(0.06), { depth: 1.3, bevelEnabled: false, curveSegments: 32 }), []);
  // the bridge stands forward (big container ships carry it forward to see over the stacks)
  const BR = 168;
  return (
    <group position={[0, heave, 0]}>
      <mesh geometry={hullGeo} material={[m.deck, m.hull]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} {...S} />
      <mesh geometry={bootGeo} material={[m.boot, m.boot]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} />
      {/* raised forecastle at the bow, white sheer stripe, foremast with a light */}
      <mesh geometry={fcGeo} material={[m.white, m.hull]} rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK - 0.1, 0]} {...S} />
      <mesh geometry={sheerGeo} material={[m.white, m.white]} rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK - 1.4, 0]} />
      <mesh material={m.funnel} position={[CX, DECK + 9, -204]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 12, 10]} />
      </mesh>
      <mesh material={m.warm} position={[CX, DECK + 15.2, -204]}>
        <sphereGeometry args={[0.45, 12, 8]} />
      </mesh>
      {/* name board on the transom, facing aft */}
      <mesh material={m.name} position={[CX, 5.6, -STERN_V + 0.32]}>
        <planeGeometry args={[17, 4.25]} />
      </mesh>
      {/* ship name on the port bow, facing the quay */}
      <mesh material={m.name} position={[HULL_L - 0.32, 4.4, -201]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[15, 3.75]} />
      </mesh>
      {/* large ship name amidships on the quay side */}
      <mesh material={m.name} position={[HULL_L - 0.32, 4.3, -118]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[24, 6]} />
      </mesh>
      {/* hatch coamings under the stacks */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} material={m.hatch} position={[CX, DECK + 0.8, -(STERN_V + 26 + i * 12.9)]} {...S}>
          <RoundedBoxGeo args={[26, 1.6, 12.4]} radius={0.15} segments={2} />
        </mesh>
      ))}
      <Containers />
      {/* engine casing + funnel aft */}
      <mesh material={m.funnel} position={[CX, DECK + 3.5, -(STERN_V + 13)]} {...S}>
        <RoundedBoxGeo args={[18, 7, 9]} radius={0.5} />
      </mesh>
      <mesh material={m.funnel} position={[CX + 2, DECK + 11, -(STERN_V + 14)]} {...S}>
        <RoundedBoxGeo args={[5, 9, 6.5]} radius={1.2} />
      </mesh>
      <mesh material={m.boot} position={[CX + 2, DECK + 14.2, -(STERN_V + 14)]} {...S}>
        <RoundedBoxGeo args={[5.1, 1.4, 6.6]} radius={0.5} />
      </mesh>
      <mesh material={m.black} position={[CX + 2, DECK + 15.5, -(STERN_V + 14)]} {...S}>
        <RoundedBoxGeo args={[5.1, 1.2, 6.6]} radius={0.5} />
      </mesh>
      {detail && (
        // engine casing detail (film only): windows, doors and a deck band so it is not a blank box
        <group position={[CX, DECK + 3.5, -(STERN_V + 13)]}>
          <mesh material={m.black} position={[0, 1.2, 0]}>
            <boxGeometry args={[18.25, 0.3, 9.25]} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} material={m.glass} position={[sd * 9.06, 2.2, 0]} rotation={[0, (sd * Math.PI) / 2, 0]}>
              <planeGeometry args={[7, 0.9]} />
            </mesh>
          ))}
          <mesh material={m.glass} position={[0, 2.2, 4.56]}>
            <planeGeometry args={[15, 0.9]} />
          </mesh>
          {[-5.5, 5.5].map((x) => (
            <mesh key={x} material={m.hatch} position={[x, -1.6, 4.56]}>
              <planeGeometry args={[1.3, 2.4]} />
            </mesh>
          ))}
          <mesh material={m.warm} position={[2, 2.2, 4.58]}>
            <planeGeometry args={[1.8, 0.7]} />
          </mesh>
        </group>
      )}
      {/* bridge: accommodation tower, wheelhouse with wings */}
      <group position={[CX, DECK, -BR]}>
        <mesh material={m.white} position={[0, 12, 0]} {...S}>
          <RoundedBoxGeo args={[22, 24, 10]} radius={0.4} />
        </mesh>
        <mesh material={m.white} position={[0, 25.2, 0]} {...S}>
          <RoundedBoxGeo args={[33, 2.6, 9]} radius={0.3} />
        </mesh>
        <mesh material={m.glass} position={[0, 25.4, 4.55]}>
          <boxGeometry args={[30, 1.3, 0.1]} />
        </mesh>
        {Array.from({ length: 7 }, (_, k) => (
          <group key={k} position={[0, 3.2 + k * 3, 5.02]}>
            <mesh material={m.glass}>
              <boxGeometry args={[19, 1.0, 0.08]} />
            </mesh>
            {[-7.5, -4, 1.5, 5.5].map((x, i) =>
              (k * 7 + i * 3) % 4 === 0 ? (
                <mesh key={i} material={m.warm} position={[x, 0, 0.03]}>
                  <planeGeometry args={[2.2, 0.85]} />
                </mesh>
              ) : null,
            )}
          </group>
        ))}
        {/* port side (faces the quay): cabin window rows + wheelhouse glazing */}
        {Array.from({ length: 7 }, (_, k) => (
          <group key={`p${k}`} position={[-11.03, 3.2 + k * 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh material={m.glass}>
              <planeGeometry args={[8.4, 1.0]} />
            </mesh>
            {[-2.6, 0.4, 2.8].map((x, i) =>
              (k * 5 + i * 2) % 3 === 0 ? (
                <mesh key={i} material={m.warm} position={[x, 0, 0.02]}>
                  <planeGeometry args={[1.8, 0.8]} />
                </mesh>
              ) : null,
            )}
          </group>
        ))}
        <mesh material={m.glass} position={[-16.55, 25.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[8, 1.3]} />
        </mesh>
        <mesh material={m.black} position={[0, 29, -1]} {...S}>
          <boxGeometry args={[0.5, 6, 0.5]} />
        </mesh>
        {detail && <BridgeDetail glass={m.glass} warm={m.warm} white={m.white} black={m.black} />}
      </group>
    </group>
  );
};

/** Film-only detail for the accommodation tower (the cover keeps the plain block): deck bands per
 *  floor, forward-facing windows, open walkways on both sides, wheelhouse front glazing, radar mast
 *  and an orange lifeboat, so the bridge reads as a ship's superstructure instead of a white box. */
const BridgeDetail: React.FC<{ glass: THREE.Material; warm: THREE.Material; white: THREE.Material; black: THREE.Material }> = ({ glass, warm, white, black }) => {
  const band = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5d6266", roughness: 0.6 }), []);
  const orange = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#e0641c" }), []);
  const rail = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9c8c2", roughness: 0.5 }), []);
  return (
    <group>
      {Array.from({ length: 7 }, (_, k) => (
        <group key={k}>
          {/* deck band at each floor */}
          <mesh material={band} position={[0, 1.6 + k * 3 + 1.5, 0]}>
            <boxGeometry args={[22.3, 0.35, 10.3]} />
          </mesh>
          {/* forward face window row */}
          <mesh material={glass} position={[0, 3.2 + k * 3, -5.03]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[19, 1.0]} />
          </mesh>
          {[-6.5, -2, 3, 7].map((x, i) =>
            (k * 3 + i * 5) % 4 === 1 ? (
              <mesh key={i} material={warm} position={[x, 3.2 + k * 3, -5.06]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[2.2, 0.85]} />
              </mesh>
            ) : null,
          )}
          {/* open walkways with rails on both sides, every other floor */}
          {k % 2 === 1 &&
            [-1, 1].map((sd) => (
              <group key={sd} position={[sd * 11.9, 1.6 + k * 3 + 1.3, 0]}>
                <mesh material={white}>
                  <boxGeometry args={[1.8, 0.25, 10]} />
                </mesh>
                <mesh material={rail} position={[sd * 0.85, 0.55, 0]}>
                  <boxGeometry args={[0.08, 1.0, 10]} />
                </mesh>
              </group>
            ))}
        </group>
      ))}
      {/* wheelhouse front glazing, slanted */}
      <mesh material={glass} position={[0, 25.4, -4.58]} rotation={[0.18, Math.PI, 0]}>
        <planeGeometry args={[30, 1.5]} />
      </mesh>
      {/* radar mast + scanner */}
      <mesh material={white} position={[0, 28.2, 1]}>
        <boxGeometry args={[6, 0.4, 3]} />
      </mesh>
      <mesh material={black} position={[0, 30.8, 1]}>
        <boxGeometry args={[5.5, 0.3, 0.5]} />
      </mesh>
      {/* lifeboats in davits on both sides */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 12.6, 10.5, 0.5]}>
          <mesh material={orange} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.75]}>
            <capsuleGeometry args={[1.25, 5.5, 6, 16]} />
          </mesh>
          <mesh material={white} position={[0, 1.0, 0]}>
            <boxGeometry args={[2.2, 0.35, 6.2]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ── Mooring lines ────────────────────────────────────────────────────────────
/** Fairlead on the ship's port side at deck edge (v = distance from z = 0 forward). */
export const fairlead = (v: number, heave: number): V3 => [HULL_L + 0.2, DECK - 0.6 + heave, -v];

export type Line = { v: number; z: number; color: string };

export const MooringLines: React.FC<{ lines: Line[]; heave: number }> = ({ lines, heave }) => {
  const mats = useMemo(() => new Map<string, THREE.Material>(), []);
  const mat = (c: string) => {
    let x = mats.get(c);
    if (!x) mats.set(c, (x = new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: c, roughness: 0.75 })));
    return x;
  };
  const geos = useMemo(
    () =>
      lines.map((l) => {
        const a = new THREE.Vector3(...fairlead(l.v, heave));
        const bp = new THREE.Vector3(...[QUAY_X - 1.6, QUAY_TOP + 1.25, l.z]);
        const mid = a.clone().lerp(bp, 0.5);
        mid.y -= 0.25 + a.distanceTo(bp) * 0.006; // taut: almost no sag
        const curve = new THREE.QuadraticBezierCurve3(a, mid, bp);
        return new THREE.TubeGeometry(curve, 48, 0.24, 8, false);
      }),
    [lines, heave],
  );
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat(lines[i].color)} castShadow />
      ))}
    </>
  );
};

// ── Quay furniture: ship-to-shore crane, lamp masts, stacked boxes ────────────
export const Crane: React.FC<{ z: number }> = ({ z }) => {
  const m = useMemo(() => ({ red: new THREE.MeshStandardMaterial({ color: "#a63a26", roughness: 0.55, metalness: 0.2 }), white: new THREE.MeshStandardMaterial({ color: "#c9c7c0", roughness: 0.6 }) }), []);
  const legX = [QUAY_X - 4, QUAY_X - 34];
  return (
    <group position={[0, QUAY_TOP, z]}>
      {legX.flatMap((x) =>
        [-9, 9].map((dz) => (
          <mesh key={`${x}${dz}`} material={m.red} position={[x, 19, dz]} {...S}>
            <boxGeometry args={[1.4, 38, 1.4]} />
          </mesh>
        )),
      )}
      {[-9, 9].map((dz) => (
        <mesh key={dz} material={m.red} position={[QUAY_X - 19, 30, dz]} {...S}>
          <boxGeometry args={[31, 1.6, 1.6]} />
        </mesh>
      ))}
      {/* boom out over the water and back-reach over the quay */}
      {[-3.2, 3.2].map((dz) => (
        <mesh key={dz} material={m.red} position={[QUAY_X + 6, 39, dz]} {...S}>
          <boxGeometry args={[96, 1.8, 1.2]} />
        </mesh>
      ))}
      <mesh material={m.white} position={[QUAY_X - 14, 37, 0]} {...S}>
        <boxGeometry args={[7, 4, 8]} />
      </mesh>
      {[-3.2, 3.2].map((dz) => (
        <mesh key={dz} material={m.red} position={[QUAY_X - 12, 48, dz]} {...S}>
          <boxGeometry args={[1.2, 18, 1.2]} />
        </mesh>
      ))}
    </group>
  );
};

export const LampMast: React.FC<{ pos: V3; h?: number }> = ({ pos, h = 24 }) => {
  const pole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3d40", roughness: 0.5, metalness: 0.5 }), []);
  const lamp = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb860").multiplyScalar(4), toneMapped: false }), []);
  return (
    <group position={pos}>
      <mesh material={pole} position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, h, 12]} />
      </mesh>
      <mesh material={lamp} position={[0, h + 0.2, 0]}>
        <boxGeometry args={[2.4, 0.5, 1.2]} />
      </mesh>
      <pointLight color="#ffb05a" intensity={2600} distance={90} decay={2} position={[0.5, h - 1, 0]} />
    </group>
  );
};

export const QuayStacks: React.FC = () => {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(12.19, 2.59, 2.44);
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 });
    const rnd = mulberry32(331);
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const o = new THREE.Object3D();
    for (let bx = 0; bx < 4; bx++)
      for (let row = 0; row < 26; row++) {
        const h = 1 + Math.floor(rnd() * 4);
        for (let k = 0; k < h; k++) {
          o.position.set(QUAY_X - 52 - bx * 14, QUAY_TOP + 1.3 + k * 2.6, -40 - row * 2.7 - Math.floor(row / 6) * 6);
          o.updateMatrix();
          mats.push(o.matrix.clone());
          cols.push(new THREE.Color(CONTAINER_COLORS[Math.floor(rnd() * CONTAINER_COLORS.length)]).multiplyScalar(0.7 + rnd() * 0.3));
        }
      }
    const m = new THREE.InstancedMesh(geo, mat, mats.length);
    mats.forEach((mm, i) => {
      m.setMatrixAt(i, mm);
      m.setColorAt(i, cols[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
};
