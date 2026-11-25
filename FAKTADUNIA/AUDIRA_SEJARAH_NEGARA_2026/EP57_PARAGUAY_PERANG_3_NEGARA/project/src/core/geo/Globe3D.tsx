// 3D wireframe globe for HistoryMap, SatelliteBriefing, and geopolitical kits.
//
// Data/tech aesthetic: latitude-longitude grid, animated pin markers, great-circle arcs.
// Deterministic — seeded stagger for pin pop-in, frame-based rotation.
//
//   <Globe3D frame={frame} fps={fps} radius={3}
//     highlightLatLng={[{ lat: -6.2, lng: 106.8, color: "#ff4444", label: "Jakarta" }]}
//     arcConnections={[{ from: { lat: 35.7, lng: 139.7 }, to: { lat: 40.7, lng: -74 }, color: "#44aaff" }]}
//   />

import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { clamp, smootherstep } from "../motion/easing.ts";
import { FONT } from "../type/fonts.ts";

export type LatLng = { lat: number; lng: number };
export type GlobePin = LatLng & { color?: string; label?: string };
export type GlobeArc = { from: LatLng; to: LatLng; color?: string };

export type Globe3DProps = {
  frame: number;
  fps: number;
  radius?: number;
  /** Auto-rotation speed in radians per second (0 to disable). */
  rotation?: number;
  color?: string;
  wireColor?: string;
  highlightLatLng?: readonly GlobePin[];
  arcConnections?: readonly GlobeArc[];
  /** Stagger delay between pin pop-ins, in seconds. */
  pinStagger?: number;
  /** Time in seconds when pins start appearing. */
  pinStartSec?: number;
  /** Duration of each pin's pop-in animation. */
  pinDurSec?: number;
  /** Number of arc segments (higher = smoother curves). */
  arcSegments?: number;
  /** Arc animation duration in seconds. */
  arcDurSec?: number;
  arcStartSec?: number;
  position?: readonly [number, number, number];
  seed?: number;
};

/** Convert latitude/longitude (degrees) to a 3D position on a sphere. */
export function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function greatCircleArc(from: LatLng, to: LatLng, radius: number, segments: number, altitude: number): THREE.Vector3[] {
  const a = latLngToVec3(from.lat, from.lng, radius);
  const b = latLngToVec3(to.lat, to.lng, radius);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3().lerpVectors(a, b, t).normalize();
    const lift = Math.sin(t * Math.PI) * altitude;
    p.multiplyScalar(radius + lift);
    points.push(p);
  }
  return points;
}

const gridGeo = (radius: number): THREE.BufferGeometry => {
  const points: number[] = [];
  const seg = 64;
  // Latitude lines every 30 degrees
  for (let lat = -60; lat <= 60; lat += 30) {
    const phi = (90 - lat) * (Math.PI / 180);
    const r = radius * 1.001;
    for (let i = 0; i <= seg; i++) {
      const theta = (i / seg) * Math.PI * 2;
      points.push(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    }
  }
  // Longitude lines every 30 degrees
  for (let lng = 0; lng < 360; lng += 30) {
    const theta = (lng + 180) * (Math.PI / 180);
    const r = radius * 1.001;
    for (let i = 0; i <= seg; i++) {
      const phi = (i / seg) * Math.PI;
      points.push(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geo;
};

const ArcLine: React.FC<{
  geo: THREE.BufferGeometry;
  color: string;
  progress: number;
  totalSegments: number;
}> = ({ geo, color, progress, totalSegments }) => {
  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
    return new THREE.Line(geo, mat);
  }, [geo, color]);

  const drawRange = Math.floor(progress * (totalSegments + 1));
  lineObj.geometry.setDrawRange(0, drawRange);

  if (progress <= 0) return null;
  return <primitive object={lineObj} />;
};

export const Globe3D: React.FC<Globe3DProps> = ({
  frame,
  fps,
  radius = 3,
  rotation = 0.15,
  color = "#0a1628",
  wireColor = "#2a4a7a",
  highlightLatLng = [],
  arcConnections = [],
  pinStagger = 0.15,
  pinStartSec = 0.5,
  pinDurSec = 0.4,
  arcSegments = 48,
  arcDurSec = 0.8,
  arcStartSec = 0,
  position = [0, 0, 0],
  seed = 1,
}) => {
  const t = frame / fps;
  const yRot = t * rotation;

  const grid = useMemo(() => gridGeo(radius), [radius]);
  const gridLine = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: wireColor, transparent: true, opacity: 0.4 });
    return new THREE.LineSegments(grid, mat);
  }, [grid, wireColor]);

  const pins = useMemo(() => {
    // Deterministic stagger order based on seed
    let s = (seed * 2654435761) >>> 0;
    return highlightLatLng.map((pin, i) => {
      s = (s * 1664525 + 1013904223) >>> 0;
      const order = (s >>> 0) / 4294967296;
      return { ...pin, staggerOffset: order * pinStagger * highlightLatLng.length };
    });
  }, [highlightLatLng, seed, pinStagger]);

  const arcGeometries = useMemo(() => {
    const dist = (a: LatLng, b: LatLng) => {
      const v1 = latLngToVec3(a.lat, a.lng, 1);
      const v2 = latLngToVec3(b.lat, b.lng, 1);
      return v1.angleTo(v2);
    };
    return arcConnections.map((arc) => {
      const altitude = dist(arc.from, arc.to) * radius * 0.35;
      const pts = greatCircleArc(arc.from, arc.to, radius, arcSegments, altitude);
      return new THREE.BufferGeometry().setFromPoints(pts);
    });
  }, [arcConnections, radius, arcSegments]);

  return (
    <group position={[...position]} rotation={[0, yRot, 0]}>
      {/* Solid sphere */}
      <mesh>
        <sphereGeometry args={[radius, 48, 36]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} transparent opacity={0.92} />
      </mesh>

      {/* Wireframe grid */}
      <primitive object={gridLine} />

      {/* Pin markers */}
      {pins.map((pin, i) => {
        const pos = latLngToVec3(pin.lat, pin.lng, radius);
        const pinStart = pinStartSec + pin.staggerOffset;
        const progress = smootherstep(clamp((t - pinStart) / pinDurSec));
        if (progress <= 0) return null;

        const pinColor = pin.color ?? "#ff4444";
        const pinHeight = 0.3 * radius / 3;
        const scale = progress;
        const dir = pos.clone().normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

        return (
          <group key={i} position={[pos.x, pos.y, pos.z]} quaternion={quat} scale={scale}>
            {/* Pin stem */}
            <mesh position={[0, pinHeight / 2, 0]}>
              <cylinderGeometry args={[0.015 * radius / 3, 0.015 * radius / 3, pinHeight, 8]} />
              <meshStandardMaterial color={pinColor} />
            </mesh>
            {/* Pin head */}
            <mesh position={[0, pinHeight + 0.06 * radius / 3, 0]}>
              <sphereGeometry args={[0.06 * radius / 3, 12, 10]} />
              <meshStandardMaterial color={pinColor} emissive={pinColor} emissiveIntensity={0.4} />
            </mesh>
            {/* Label */}
            {pin.label && (
              <Text
                position={[0, pinHeight + 0.2 * radius / 3, 0]}
                fontSize={0.12 * radius / 3}
                color="#ffffff"
                anchorX="center"
                anchorY="bottom"
                font={FONT}
              >
                {pin.label}
              </Text>
            )}
          </group>
        );
      })}

      {/* Arc connections */}
      {arcGeometries.map((geo, i) => (
        <ArcLine
          key={i}
          geo={geo}
          color={arcConnections[i].color ?? "#44aaff"}
          progress={smootherstep(clamp((t - arcStartSec - i * 0.2) / arcDurSec))}
          totalSegments={arcSegments}
        />
      ))}
    </group>
  );
};
