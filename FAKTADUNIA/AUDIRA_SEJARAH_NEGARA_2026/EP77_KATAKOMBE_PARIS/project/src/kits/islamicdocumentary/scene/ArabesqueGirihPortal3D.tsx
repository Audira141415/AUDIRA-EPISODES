import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { computeIslamicDocumentaryState } from "../core/motion";
import { ISLAMICDOCUMENTARY_PALETTE as C } from "../lib/palette";
import { archPoints, GILT, GLAZED_TILE, starShape } from "../lib/materials";

/** Niche geometry: wall at z = WALL_Z, arch span 2.2, springing at 1.9. */
export const WALL_Z = -0.7;
const W = 2.2;
const SPRING = 1.9;
const R = 1.7;
/** Centre of the girih star inside the niche. */
export const STAR_Y = 2.25;

/** Lapis tiled wall with a gilt pointed-arch frame, a deep niche, inlaid small stars and the turning girih star. */
export const ArabesqueGirihPortal3D: React.FC<{ f: number }> = ({ f }) => {
  const state = computeIslamicDocumentaryState(f);
  const glaze = useSurfaceGrain(43, 0.12, 4);

  const geo = useMemo(() => {
    // U-shaped band (open at the floor): outer outline left → right, then the inner outline back
    const outer = new THREE.Shape([...archPoints(W + 0.26, SPRING, R + 0.13), ...archPoints(W, SPRING, R).reverse()]);
    const frame = new THREE.ExtrudeGeometry(outer, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 4 });
    const niche = new THREE.ShapeGeometry(new THREE.Shape(archPoints(W, SPRING, R)));
    const big = new THREE.ExtrudeGeometry(starShape(0.82, 0.62), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3 });
    big.translate(0, 0, -0.035);
    const ring = new THREE.ExtrudeGeometry(
      (() => {
        const s = starShape(0.98, 0.86);
        s.holes.push(new THREE.Path(starShape(0.92, 0.8).getPoints()));
        return s;
      })(),
      { depth: 0.05, bevelEnabled: false },
    );
    const core = new THREE.CylinderGeometry(0.4, 0.4, 0.06, 8);
    core.rotateX(Math.PI / 2);
    const small = new THREE.ExtrudeGeometry(starShape(0.085, 0.06), { depth: 0.02, bevelEnabled: false });
    return { frame, niche, big, ring, core, small };
  }, []);

  // Inlaid small stars on the wall, outside the niche
  const inlay = useMemo(() => {
    const out: { x: number; y: number; d: number }[] = [];
    for (let ix = -6; ix <= 6; ix++) {
      for (let iy = 0; iy <= 12; iy++) {
        const x = ix * 0.3 + (iy % 2 ? 0.15 : 0);
        const y = 0.25 + iy * 0.3;
        if (Math.abs(x) < W / 2 + 0.25 && y < 3.7) continue; // keep the niche and frame clear
        out.push({ x, y, d: Math.hypot(x, y - STAR_Y) });
      }
    }
    return out;
  }, []);
  const maxD = 4.2;
  const glow = state.dawn;

  return (
    <group>
      {/* Lapis tiled wall */}
      <mesh position={[0, 2.2, WALL_Z - 0.15]} receiveShadow>
        <RoundedBoxGeo args={[4.2, 4.4, 0.3]} radius={0.03} />
        <meshPhysicalMaterial color={C.lapisLazuli} {...GLAZED_TILE} roughnessMap={glaze} bumpMap={glaze} bumpScale={0.25} />
      </mesh>
      {/* Deep niche: darker lapis behind the arch */}
      <mesh geometry={geo.niche} position={[0, 0, WALL_Z + 0.005]} receiveShadow>
        <meshPhysicalMaterial color="#0f2442" {...GLAZED_TILE} />
      </mesh>
      {/* Gilt arch frame */}
      <mesh geometry={geo.frame} position={[0, 0, WALL_Z]} castShadow>
        <meshPhysicalMaterial color={C.royalGold} {...GILT} />
      </mesh>

      {/* Inlaid stars light from the centre outward */}
      {inlay.map((s, i) => {
        const on = state.inlay * maxD >= s.d ? 1 : 0;
        return (
          <mesh key={i} geometry={geo.small} position={[s.x, s.y, WALL_Z + 0.005]} rotation={[0, 0, Math.PI / 8]}>
            <meshPhysicalMaterial color={on ? C.royalGold : "#24406a"} {...GILT} metalness={on ? 0.9 : 0.2} emissive={C.royalGold} emissiveIntensity={on * (0.05 + glow * 0.35)} />
          </mesh>
        );
      })}

      {/* The girih star in the niche */}
      <group position={[0, STAR_Y, WALL_Z + 0.16]} rotation={[0, 0, state.starRotation]}>
        <mesh geometry={geo.ring} position={[0, 0, -0.06]} rotation={[0, 0, -state.starRotation * 2]} castShadow>
          <meshPhysicalMaterial color={C.royalGold} {...GILT} />
        </mesh>
        <mesh geometry={geo.big} castShadow>
          <meshPhysicalMaterial color={C.royalGold} {...GILT} emissive={C.royalGold} emissiveIntensity={0.04 + glow * 0.45} />
        </mesh>
        <mesh geometry={geo.core} position={[0, 0, 0.04]}>
          <meshPhysicalMaterial color={C.khalifahEmerald} {...GLAZED_TILE} emissive={C.khalifahEmerald} emissiveIntensity={glow * 0.5} />
        </mesh>
      </group>
    </group>
  );
};
