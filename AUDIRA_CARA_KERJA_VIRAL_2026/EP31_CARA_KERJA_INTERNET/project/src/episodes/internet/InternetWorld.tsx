import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { CIRCUIT_PALETTE } from "../../kits/circuitforge/lib/palette";
import { MicrochipBga } from "../../kits/circuitforge/pcb/MicrochipBga";
import { seg, ease, lerp, pulseProgress } from "../../kits/circuitforge/core/motion";
import { AssetModel } from "../../core/assets/AssetModel";

function DepthFog() {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2("#040e08", 0.018);
    return () => { scene.fog = null; };
  }, [scene]);
  return null;
}

interface Props {
  f: number;
}

const PHONE_X = -20;
const DNS_X = -10;
const ROUTER_X = 0;
const SERVER_X = 18;

const FS = {
  hook: 0, context: 390, main1: 1270, main2: 2408,
  explain: 3344, payoff: 4246, outro: 4744, end: 5100,
};

export const InternetWorld: React.FC<Props> = ({ f }) => {
  const journeyProgress = seg(f, FS.hook, FS.payoff, ease.macroGlide);
  const packetX = lerp(PHONE_X, SERVER_X, journeyProgress);
  const payoffGlow = seg(f, FS.payoff, FS.payoff + 120, ease.smooth);
  const ledBlink = Math.sin(f * 0.1) > 0;

  return (
    <group>
      <DepthFog />

      {/* ── FOREGROUND DUST PARTICLES (depth cue) ── */}
      {Array.from({ length: 12 }, (_, i) => {
        const px = lerp(-22, 22, ((i * 0.37 + f * 0.0003) % 1));
        const py = 1.0 + Math.sin(f * 0.02 + i * 2) * 0.6;
        const pz = lerp(-6, 6, ((i * 0.53 + f * 0.0001) % 1));
        return (
          <mesh key={`dust-${i}`} position={[px, py, pz]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={CIRCUIT_PALETTE.enigGold} emissive={CIRCUIT_PALETTE.enigGold} emissiveIntensity={0.3} transparent opacity={0.45} />
          </mesh>
        );
      })}

      {/* ── PCB SUBSTRATE ── */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[48, 0.3, 16]} />
        <meshStandardMaterial color={CIRCUIT_PALETTE.solderMaskDark} roughness={0.6} metalness={0.15} />
      </mesh>

      {/* ── MAIN DATA BUS TRACES ── */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[44, 0.02, 0.4]} />
        <meshStandardMaterial
          color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.35} metalness={0.8}
          emissive={CIRCUIT_PALETTE.electronAmber} emissiveIntensity={0.22 + payoffGlow * 0.4}
        />
      </mesh>
      {[-1.5, 1.5].map((z, i) => (
        <mesh key={`bus-${i}`} position={[0, 0.01, z]}>
          <boxGeometry args={[40, 0.02, 0.2]} />
          <meshStandardMaterial
            color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.35} metalness={0.8}
            emissive={CIRCUIT_PALETTE.clockCyan} emissiveIntensity={0.18 + payoffGlow * 0.3}
          />
        </mesh>
      ))}

      {/* Diagonal feed traces at each zone */}
      {[PHONE_X, DNS_X, ROUTER_X, SERVER_X].map((x, i) => (
        <mesh key={`diag-${i}`} position={[x, 0.01, 0.8]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[2, 0.02, 0.18]} />
          <meshStandardMaterial color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.35} metalness={0.8} emissive={CIRCUIT_PALETTE.copperTraceBevel} emissiveIntensity={0.12} />
        </mesh>
      ))}

      {/* ── ZONE A: SMARTPHONE ── */}
      <group position={[PHONE_X, 0, 0]}>
        <AssetModel id="smartphone-5f05e5" size={2.5} ground fallback={<PhoneChipFallback />} />
        {f < FS.context && (
          <mesh position={[0, 1.8, 0]}>
            <planeGeometry args={[0.8, 1.4]} />
            <meshStandardMaterial
              color={CIRCUIT_PALETTE.siliconDie} emissive={CIRCUIT_PALETTE.clockCyan}
              emissiveIntensity={seg(f, 0, 60, ease.smooth) * 0.15} transparent
              opacity={0.7} side={THREE.DoubleSide}
            />
          </mesh>
        )}
        <mesh position={[0, 0.02, -2.5]}>
          <boxGeometry args={[3, 0.01, 0.04]} />
          <meshStandardMaterial color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* ── ZONE B: DNS RESOLVER ── */}
      <group position={[DNS_X, 0, 0]}>
        <MicrochipBga />
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[2, 0.04, 2]} />
          <meshStandardMaterial
            color="#1a2744" roughness={0.3} metalness={0.7}
            emissive={CIRCUIT_PALETTE.clockCyan}
            emissiveIntensity={f >= FS.context && f < FS.main1 ? 0.15 : 0}
          />
        </mesh>
        {[-1, 0, 1].map((z, i) => (
          <mesh key={`dns-led-${i}`} position={[2, 0.1, z]}>
            <cylinderGeometry args={[0.06, 0.06, 0.06, 12]} />
            <meshBasicMaterial color={f >= FS.context + i * 60 ? CIRCUIT_PALETTE.powerGreen : "#064e3b"} />
          </mesh>
        ))}
      </group>

      {/* ── ZONE C: ROUTER ARRAY ── */}
      <group position={[ROUTER_X, 0, 0]}>
        {[-3, 0, 3].map((z, i) => (
          <group key={`router-${i}`} position={[0, 0, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial color={CIRCUIT_PALETTE.solderMaskDark} roughness={0.5} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.26, 0]} castShadow>
              <boxGeometry args={[1.4, 0.1, 1.4]} />
              <meshStandardMaterial color={CIRCUIT_PALETTE.siliconDie} roughness={0.2} metalness={0.85} />
            </mesh>
            <mesh position={[1.2, 0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.05, 12]} />
              <meshBasicMaterial color={f >= FS.main1 + i * 90 ? CIRCUIT_PALETTE.electronAmber : "#3b2000"} />
            </mesh>
            {z < 3 && (
              <mesh position={[0, 0.01, 1.5]}>
                <boxGeometry args={[0.15, 0.02, 1]} />
                <meshStandardMaterial color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.35} metalness={0.8} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* ── ZONE D: SUBMARINE CABLE ── */}
      <group position={[9, 0, 0]}>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[14, 0.03, 0.6]} />
          <meshStandardMaterial
            color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.3} metalness={0.85}
            emissive={CIRCUIT_PALETTE.clockCyan}
            emissiveIntensity={0.1 + (f >= FS.main2 ? seg(f, FS.main2, FS.main2 + 180, ease.smooth) * 0.25 : 0)}
          />
        </mesh>
        {[-0.5, 0.5].map((z, i) => (
          <mesh key={`shield-${i}`} position={[0, 0.01, z]}>
            <boxGeometry args={[14, 0.02, 0.12]} />
            <meshStandardMaterial color={CIRCUIT_PALETTE.tinSolder} roughness={0.3} metalness={0.9} emissive={CIRCUIT_PALETTE.tinSolder} emissiveIntensity={0.08} />
          </mesh>
        ))}
        {[-5, -1, 3].map((x, i) => (
          <group key={`repeater-${i}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.6, 0.12, 0.8]} />
              <meshStandardMaterial color="#334155" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
              <meshBasicMaterial color={f >= FS.main2 + i * 100 ? CIRCUIT_PALETTE.powerGreen : "#064e3b"} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── ZONE E: DATA CENTER ── */}
      <group position={[SERVER_X, 0, 0]}>
        <AssetModel id="small-server-rack-8ae0a4" size={3} ground fallback={<ServerChipFallback />} />
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[2.8, 0.04, 2.8]} />
          <meshStandardMaterial
            color={CIRCUIT_PALETTE.siliconDie} roughness={0.2} metalness={0.85}
            emissive={CIRCUIT_PALETTE.electronAmber}
            emissiveIntensity={f >= FS.explain ? seg(f, FS.explain, FS.explain + 120, ease.smooth) * 0.2 : 0}
          />
        </mesh>
        {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
          <mesh key={`srv-led-${i}`} position={[2, 0.1, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 12]} />
            <meshBasicMaterial color={f >= FS.explain + i * 60 ? CIRCUIT_PALETTE.powerGreen : "#064e3b"} />
          </mesh>
        ))}
      </group>

      {/* ── AUDIRA BRAND CHIP ── */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[2.5, 0.18, 1.5]} />
          <meshStandardMaterial color={CIRCUIT_PALETTE.solderMaskDark} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[2, 0.08, 1]} />
          <meshStandardMaterial color={CIRCUIT_PALETTE.enigGold} roughness={0.15} metalness={0.95} emissive={CIRCUIT_PALETTE.enigGold} emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* ── DATA PACKET (animated) ── */}
      <group position={[0, 0.06, 0]}>
        <mesh position={[packetX, 0, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.5]} />
          <meshStandardMaterial color={CIRCUIT_PALETTE.clockCyan} emissive={CIRCUIT_PALETTE.clockCyan} emissiveIntensity={lerp(0.4, 1.2, Math.min(1, journeyProgress * 3))} toneMapped={false} />
        </mesh>
        <pointLight position={[packetX, 0.5, 0]} intensity={lerp(0.5, 1.5, Math.min(1, journeyProgress * 3))} color={CIRCUIT_PALETTE.clockCyan} distance={6} decay={2} />
        {[0.6, 1.2, 1.8].map((offset, i) => (
          <mesh key={`trail-${i}`} position={[packetX - offset, 0, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.3]} />
            <meshBasicMaterial
              color={CIRCUIT_PALETTE.electronAmber} blending={THREE.AdditiveBlending}
              transparent opacity={0.7 - i * 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Split packets at router zone (S3-S5) */}
      {f >= FS.main1 && f < FS.payoff && [-3, 0, 3].map((z, i) => {
        const sp = seg(f, FS.main1 + i * 30, FS.main2, ease.smooth);
        return (
          <mesh key={`split-${i}`} position={[lerp(ROUTER_X, SERVER_X, sp), 0.06, z * 0.4]}>
            <boxGeometry args={[0.6, 0.04, 0.3]} />
            <meshBasicMaterial color={CIRCUIT_PALETTE.clockCyan} blending={THREE.AdditiveBlending} transparent opacity={0.6} />
          </mesh>
        );
      })}

      {/* ── AMBIENT ELECTRON PULSES (background life) ── */}
      {[0, 1, 2].map((i) => {
        const pp = pulseProgress(f, 0.012, i * 0.33);
        return (
          <mesh key={`ambient-${i}`} position={[lerp(-22, 22, pp), 0.04, 1.5 * (i === 1 ? -1 : 1)]}>
            <boxGeometry args={[0.5, 0.03, 0.22]} />
            <meshBasicMaterial color={CIRCUIT_PALETTE.electronAmber} blending={THREE.AdditiveBlending} transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* ── DECORATIVE SMT CAPACITORS ── */}
      {[
        [-16, 3], [-14, -4], [-6, 5], [-4, -3],
        [4, 4], [6, -5], [12, 3], [14, -4], [20, 5], [22, -3],
      ].map(([x, z], i) => (
        <group key={`cap-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.4, 0.14, 0.25]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#c2a68c" : "#475569"} roughness={0.4} />
          </mesh>
          <mesh position={[-0.21, 0.06, 0]}>
            <boxGeometry args={[0.06, 0.15, 0.26]} />
            <meshStandardMaterial color={CIRCUIT_PALETTE.tinSolder} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.21, 0.06, 0]}>
            <boxGeometry args={[0.06, 0.15, 0.26]} />
            <meshStandardMaterial color={CIRCUIT_PALETTE.tinSolder} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ENIG Gold Test Pads */}
      {[-22, -18, -12, -8, -4, 4, 8, 12, 16, 22].map((x, i) => (
        <mesh key={`pad-${i}`} position={[x, 0.02, i % 2 === 0 ? -6 : 6]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
          <meshStandardMaterial color={CIRCUIT_PALETTE.enigGold} roughness={0.2} metalness={0.92} emissive={CIRCUIT_PALETTE.enigGold} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Via holes */}
      {[-15, -5, 5, 15].map((x, i) => (
        <group key={`via-${i}`} position={[x, 0, i % 2 === 0 ? 2 : -2]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.32, 16]} />
            <meshStandardMaterial color={CIRCUIT_PALETTE.copperTraceBevel} roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshStandardMaterial color={CIRCUIT_PALETTE.enigGold} roughness={0.2} metalness={0.92} />
          </mesh>
        </group>
      ))}

      {/* ── ACCENT LIGHTS for tonal range ── */}
      <ambientLight intensity={0.28} />
      <pointLight position={[PHONE_X, 4, 3]} intensity={1.2} color={CIRCUIT_PALETTE.clockCyan} distance={20} decay={2} />
      <pointLight position={[SERVER_X, 4, -3]} intensity={1.8} color={CIRCUIT_PALETTE.electronAmber} distance={20} decay={2} />
      <pointLight position={[ROUTER_X, 5, 0]} intensity={1.2} color="#ffffff" distance={24} decay={2} />
      <pointLight position={[DNS_X, 3, -2]} intensity={1.0} color={CIRCUIT_PALETTE.powerGreen} distance={16} decay={2} />
      <pointLight position={[8, 3, 2]} intensity={1.0} color={CIRCUIT_PALETTE.enigGold} distance={16} decay={2} />

      {/* Power LED */}
      <group position={[-23, 0.08, -7]}>
        <mesh>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshStandardMaterial color="#334155" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshBasicMaterial color={ledBlink ? CIRCUIT_PALETTE.powerGreen : "#064e3b"} />
        </mesh>
      </group>
    </group>
  );
};

const PhoneChipFallback: React.FC = () => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <boxGeometry args={[1.5, 0.2, 2.8]} />
      <meshStandardMaterial color={CIRCUIT_PALETTE.solderMaskDark} roughness={0.5} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.26, 0]} castShadow>
      <boxGeometry args={[1.2, 0.08, 2.4]} />
      <meshStandardMaterial color={CIRCUIT_PALETTE.siliconDie} roughness={0.4} metalness={0.7} />
    </mesh>
  </group>
);

const ServerChipFallback: React.FC = () => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <boxGeometry args={[3, 0.3, 3]} />
      <meshStandardMaterial color={CIRCUIT_PALETTE.solderMaskDark} roughness={0.5} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.32, 0]} castShadow>
      <boxGeometry args={[2.4, 0.14, 2.4]} />
      <meshStandardMaterial color={CIRCUIT_PALETTE.siliconDie} roughness={0.18} metalness={0.88} />
    </mesh>
    {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
      <mesh key={i} position={[x, 0.46, 0]}>
        <boxGeometry args={[0.08, 0.2, 2.2]} />
        <meshStandardMaterial color={CIRCUIT_PALETTE.tinSolder} roughness={0.3} metalness={0.9} />
      </mesh>
    ))}
  </group>
);
