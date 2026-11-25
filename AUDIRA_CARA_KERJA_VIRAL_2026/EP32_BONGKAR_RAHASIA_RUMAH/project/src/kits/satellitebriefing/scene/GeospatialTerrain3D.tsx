import React from "react";
import * as THREE from "three";
import { SATELLITEBRIEFING_PALETTE } from "../lib/palette";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../../core/polish/Polish";
import { AssetModel } from "../../../core/assets/AssetModel.tsx";


/** Horizon haze band: a far backdrop with a blue glow band, like atmosphere seen from orbit. */
const HazeBand: React.FC = () => {
  const tex = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#070B0E");
    grad.addColorStop(0.42, "#0a1a30");
    grad.addColorStop(0.5, "#123560");
    grad.addColorStop(0.58, "#0a1a30");
    grad.addColorStop(1, "#081626");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.6, -6]}>
      <planeGeometry args={[60, 10]} />
      <meshBasicMaterial map={tex} fog={false} toneMapped={false} />
    </mesh>
  );
};

/** Fallback mast when the GLB cannot load: a lattice pole with a dish. */
const MastBlock: React.FC = () => (
  <group>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.035, 0.5, 8]} />
      <meshPhysicalMaterial color="#8A949A" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0, 0.5, 0]} rotation={[0.6, 0, 0]} castShadow>
      <sphereGeometry args={[0.09, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#C9CFD3" {...POLISH.toyPlastic} side={2} />
    </mesh>
  </group>
);

/** Fallback hull when the GLB cannot load. */
const HullBlock: React.FC = () => (
  <mesh position={[0, 0.04, 0]} castShadow>
    <RoundedBoxGeo args={[0.45, 0.08, 0.14]} />
    <meshPhysicalMaterial color="#8A949A" {...POLISH.toyPlastic} />
  </mesh>
);

export const GeospatialTerrain3D: React.FC<{ f: number }> = ({ f }) => {
  const grain = useSurfaceGrain(38, 0.32, 5);
  return (
    <group>
      {/* BG: horizon haze band */}
      <HazeBand />

      {/* Deep Ocean Bathymetry Base */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial
          color="#081626"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Midground relief: two raised peninsulas + a third ridge for depth */}
      <mesh position={[-0.9, 0.3, -0.4]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.6, 0.9, 1.8]} radius={0.04} />
        <meshPhysicalMaterial color="#454F57" {...POLISH.stone} roughnessMap={grain} bumpMap={grain} bumpScale={1.0} />
      </mesh>
      {/* stepped ledge on the main peninsula for more height relief */}
      <mesh position={[-1.1, 0.78, -0.65]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.9, 0.42, 0.7]} radius={0.03} />
        <meshPhysicalMaterial color="#5E6A72" {...POLISH.stone} roughnessMap={grain} bumpMap={grain} bumpScale={0.8} />
      </mesh>
      <mesh position={[1.1, 0.15, 0.55]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.8, 0.6, 1.2]} radius={0.04} />
        <meshPhysicalMaterial color="#475158" {...POLISH.stone} roughnessMap={grain} bumpMap={grain} bumpScale={0.8} />
      </mesh>
      {/* third ridge: background depth element */}
      <mesh position={[-2.4, 0.22, -1.1]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.4, 0.72, 0.9]} radius={0.04} />
        <meshPhysicalMaterial color="#5A6268" {...POLISH.stone} roughnessMap={grain} bumpMap={grain} bumpScale={0.7} />
      </mesh>
      {/* warm sandy top caps: sunlit plateau surfaces (warmer than cool sides) */}
      <mesh position={[-0.9, 0.756, -0.4]} receiveShadow>
        <RoundedBoxGeo args={[2.56, 0.02, 1.76]} radius={0.008} />
        <meshPhysicalMaterial color="#C3CDD4" emissive="#C3CDD4" emissiveIntensity={0.3} {...POLISH.stone} roughnessMap={grain} bumpMap={grain} bumpScale={1.6} />
      </mesh>
      <mesh position={[-1.1, 1.0, -0.65]} receiveShadow>
        <RoundedBoxGeo args={[0.86, 0.02, 0.66]} radius={0.006} />
        <meshPhysicalMaterial color="#BAC4CB" {...POLISH.stone} roughnessMap={grain} />
      </mesh>
      <mesh position={[1.1, 0.456, 0.55]} receiveShadow>
        <RoundedBoxGeo args={[1.76, 0.02, 1.16]} radius={0.008} />
        <meshPhysicalMaterial color="#B3BDC4" emissive="#B3BDC4" emissiveIntensity={0.3} {...POLISH.stone} roughnessMap={grain} bumpMap={grain} bumpScale={1.6} />
      </mesh>
      <mesh position={[-2.4, 0.616, -1.1]} receiveShadow>
        <RoundedBoxGeo args={[1.36, 0.02, 0.86]} radius={0.006} />
        <meshPhysicalMaterial color="#ADB7BE" {...POLISH.stone} roughnessMap={grain} />
      </mesh>

      {/* Real assets: a radar mast on the main peninsula, a vessel crossing the strait */}
      <AssetModel
        id="radar-aerial-mast-f88914"
        size={0.75}
        ground
        tint="#9AA4AA"
        roughness={0.55}
        metalness={0.3}
        position={[-1.6, 0.765, -0.95]}
        fallback={<MastBlock />}
      />
      <group position={[-1.2 + ((f / 60) * 0.09), -0.15, 1.45]}>
        <AssetModel
          id="hanga-roa-fishing-boat-f09534"
          size={0.42}
          ground
          tint="#C9CFD3"
          roughness={0.5}
          rotation={[0, Math.PI / 2, 0]}
          fallback={<HullBlock />}
        />
        {/* wake */}
        <mesh position={[-0.32, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 0.05]} />
          <meshBasicMaterial color="#F2F5F6" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Georeferenced Coordinate Grid Lines — emissive */}
      {[-2, -1, 0, 1, 2].map((g) => (
        <React.Fragment key={g}>
          <mesh position={[g, -0.02, 0]}>
            <boxGeometry args={[0.012, 0.01, 6.0]} />
            <meshStandardMaterial
              color={SATELLITEBRIEFING_PALETTE.claimBlue}
              emissive={SATELLITEBRIEFING_PALETTE.claimBlue}
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0, -0.02, g]}>
            <boxGeometry args={[6.0, 0.01, 0.012]} />
            <meshStandardMaterial
              color={SATELLITEBRIEFING_PALETTE.claimBlue}
              emissive={SATELLITEBRIEFING_PALETTE.claimBlue}
              emissiveIntensity={0.6}
            />
          </mesh>
        </React.Fragment>
      ))}

      {/* atmospheric fog layers */}
      <fog attach="fog" args={["#0a1626", 10, 34]} />
    </group>
  );
};
