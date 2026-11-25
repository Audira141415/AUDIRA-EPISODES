// FILM16 set: a kitchen corner in late afternoon. A real window opening in the back wall lets the sun
// in, so the mullions throw their shadow across the table; light shafts, dust in the beam, a breathing
// curtain and a halation halo round the bright window (16mm stock blooms red around highlights).

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "../../../core/film/craft.ts";
import { useSurfaceGrain } from "../../../core/polish/Polish.tsx";
import { GroundShadow } from "../../../core/polish/Drei.tsx";
import { FILM16_PALETTE as P } from "../lib/palette.ts";

export const TABLE_Y = 0.75;
export const WINDOW = { x: 0.35, y: 1.62, w: 1.0, h: 1.2, z: -1.2 };

/** Back wall with a window opening (four slabs round the hole). */
const Wall: React.FC = () => {
  const grain = useSurfaceGrain(5, 0.4, 5);
  const { x, y, w, h, z } = WINDOW;
  const W = 7, H = 4, T = 0.12;
  const slab = (cx: number, cy: number, sw: number, sh: number, k: string) => (
    <mesh key={k} position={[cx, cy, z]} receiveShadow castShadow>
      <boxGeometry args={[sw, sh, T]} />
      <meshStandardMaterial color={P.wall} roughness={0.95} roughnessMap={grain} bumpMap={grain} bumpScale={0.4} />
    </mesh>
  );
  const left = x - w / 2, right = x + w / 2, bottom = y - h / 2, top = y + h / 2;
  return (
    <group>
      {slab((-W / 2 + left) / 2, H / 2, left + W / 2, H, "l")}
      {slab((W / 2 + right) / 2, H / 2, W / 2 - right, H, "r")}
      {slab(x, bottom / 2, w, bottom, "b")}
      {slab(x, (H + top) / 2, w, H - top, "t")}
      {/* side wall, in shade */}
      <mesh position={[-2.2, H / 2, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[4, H]} />
        <meshStandardMaterial color={P.wallShade} roughness={1} />
      </mesh>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#5B4636" roughness={0.9} />
      </mesh>
    </group>
  );
};

/** Window frame, sill, the bright garden outside and the halation halo. */
const Window: React.FC<{ halo: number }> = ({ halo }) => {
  const { x, y, w, h, z } = WINDOW;
  const outside = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 320;
    const g = c.getContext("2d")!;
    const sky = g.createLinearGradient(0, 0, 0, 320);
    sky.addColorStop(0, "#FFF6E2");
    sky.addColorStop(0.55, "#FFE2B0");
    sky.addColorStop(1, "#C9B37A");
    g.fillStyle = sky;
    g.fillRect(0, 0, 256, 320);
    // out-of-focus leaves: soft green blobs
    const r = mulberry32(8);
    g.filter = "blur(10px)";
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(${90 + r() * 40},${120 + r() * 40},${60 + r() * 30},${0.35 + r() * 0.4})`;
      g.beginPath();
      g.arc(r() * 256, 150 + r() * 170, 14 + r() * 30, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const bar = (px: number, py: number, bw: number, bh: number, k: string) => (
    <mesh key={k} position={[px, py, z + 0.02]} castShadow>
      <boxGeometry args={[bw, bh, 0.05]} />
      <meshStandardMaterial color="#E9E0CC" roughness={0.7} />
    </mesh>
  );
  return (
    <group>
      <mesh position={[x, y, z - 0.6]}>
        <planeGeometry args={[w * 2.2, h * 2.2]} />
        <meshBasicMaterial map={outside} toneMapped={false} color={new THREE.Color(1.6, 1.5, 1.35)} />
      </mesh>
      {/* halation: the stock's red glow bleeding round the brightest edge */}
      <mesh position={[x, y, z + 0.07]}>
        <planeGeometry args={[w * 1.25, h * 1.2]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uC: { value: new THREE.Color(P.halation) }, uK: { value: halo } }}
          vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
          fragmentShader={`uniform vec3 uC; uniform float uK; varying vec2 vUv;
            void main(){ vec2 d = abs(vUv-0.5)*2.0; float e = max(d.x*1.0, d.y*1.0);
            float ring = smoothstep(0.7, 0.86, e) * (1.0 - smoothstep(0.86, 1.0, e));
            gl_FragColor = vec4(uC * ring * 0.2 * uK, 1.0); }`}
        />
      </mesh>
      {bar(x, y, 0.04, h, "v")}
      {bar(x, y + 0.1, w, 0.04, "h")}
      {bar(x - w / 2 + 0.03, y, 0.06, h, "fl")}
      {bar(x + w / 2 - 0.03, y, 0.06, h, "fr")}
      {bar(x, y + h / 2 - 0.03, w, 0.06, "ft")}
      <mesh position={[x, y - h / 2 - 0.02, z + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.2, 0.05, 0.28]} />
        <meshStandardMaterial color="#E4D9C3" roughness={0.8} />
      </mesh>
      {/* a pot of basil on the sill, a silhouette against the light */}
      <group position={[x + 0.3, y - h / 2 + 0.01, z + 0.12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.1, 24]} />
          <meshStandardMaterial color="#A65A3A" roughness={0.9} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[Math.sin(i * 2.4) * 0.05, 0.1 + (i % 3) * 0.04, Math.cos(i * 2.4) * 0.04]} rotation={[0.4 * Math.sin(i), i, 0.6]} castShadow>
            <sphereGeometry args={[0.035, 12, 8]} />
            <meshStandardMaterial color={P.leaf} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Curtain: a cloth panel with a slow breath of air from the open window. */
const Curtain: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(0.42, 1.45, 24, 36), []);
  const base = useMemo(() => (geo.getAttribute("position") as THREE.BufferAttribute).array.slice(), [geo]);
  useLayoutEffect(() => {
    const p = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const hang = (0.725 - y) / 1.45; // 0 at the rail, 1 at the hem
      const folds = Math.sin(x * 38) * 0.025;
      const breath = Math.sin(t * 1.1 + y * 2.2) * 0.04 * hang + Math.sin(t * 0.47 + x * 6) * 0.015 * hang;
      p.setZ(i, folds + breath);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  }, [t, geo, base]);
  return (
    <mesh ref={ref} geometry={geo} position={[WINDOW.x - WINDOW.w / 2 + 0.12, WINDOW.y + 0.02, WINDOW.z + 0.16]} castShadow>
      <meshPhysicalMaterial color={P.curtain} roughness={0.9} sheen={1} sheenColor="#fff4dc" transmission={0.25} thickness={0.02} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Two soft light shafts from the window onto the table, and dust drifting inside them. */
const Beam: React.FC<{ t: number; strength: number }> = ({ t, strength }) => {
  const dust = useMemo(() => {
    const r = mulberry32(77);
    return Array.from({ length: 220 }, () => ({ u: r(), v: r(), w: r(), s: 0.4 + r() * 0.8, ph: r() * 6.28 }));
  }, []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  useLayoutEffect(() => {
    // dust lives in the beam: a slanted box from the window down to the table
    const arr = new Float32Array(dust.length * 3);
    dust.forEach((d, i) => {
      const a = (d.u + t * 0.012 * d.s) % 1;
      const x = WINDOW.x - 0.2 + a * -0.9 + Math.sin(t * 0.3 * d.s + d.ph) * 0.04;
      const y = WINDOW.y + 0.25 - a * 0.85 + d.v * 0.5 + Math.sin(t * 0.21 + d.ph) * 0.03;
      const z = WINDOW.z + 0.3 + a * 1.3 + d.w * 0.35;
      arr.set([x, y, z], i * 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }, [t, dust, geo]);
  const shaft = (k: number, dx: number) => (
    <mesh key={k} position={[WINDOW.x - 0.45 + dx, WINDOW.y - 0.3, WINDOW.z + 0.75]} rotation={[-0.62, 0.62, 0.05]}>
      <planeGeometry args={[0.36, 2.0]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        uniforms={{ uC: { value: new THREE.Color(P.sun) }, uK: { value: strength * (k ? 0.6 : 1) } }}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
        fragmentShader={`uniform vec3 uC; uniform float uK; varying vec2 vUv;
          void main(){ float edge = smoothstep(0.0,0.35,vUv.x)*smoothstep(1.0,0.65,vUv.x);
          float fall = smoothstep(0.0,0.4,vUv.y)*(0.35+0.65*vUv.y);
          gl_FragColor = vec4(uC*edge*fall*0.11*uK, 1.0); }`}
      />
    </mesh>
  );
  return (
    <group>
      {shaft(0, 0)}
      {shaft(1, 0.42)}
      <points geometry={geo}>
        <pointsMaterial color="#FFE9C4" size={0.006} transparent opacity={0.85 * strength} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

/** Table with a cloth runner, a notebook and a pencil. */
const Table: React.FC = () => {
  const grain = useSurfaceGrain(13, 0.35, 3);
  return (
    <group>
      <mesh position={[0, TABLE_Y - 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 1.4]} />
        <meshStandardMaterial color={P.woodLight} roughness={0.55} roughnessMap={grain} bumpMap={grain} bumpScale={0.5} />
      </mesh>
      {[[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (TABLE_Y - 0.05) / 2, z]} castShadow>
          <boxGeometry args={[0.07, TABLE_Y - 0.05, 0.07]} />
          <meshStandardMaterial color={P.wood} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, TABLE_Y + 0.002, 0.05]} rotation={[-Math.PI / 2, 0, 0.08]} receiveShadow>
        <planeGeometry args={[0.7, 1.6]} />
        <meshStandardMaterial color={P.cloth} roughness={1} />
      </mesh>
      <group position={[0.72, TABLE_Y + 0.008, 0.28]} rotation={[0, -0.35, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.014, 0.32]} />
          <meshStandardMaterial color="#7A2E24" roughness={0.7} />
        </mesh>
        <mesh position={[0.02, 0.008, 0]} receiveShadow>
          <boxGeometry args={[0.22, 0.004, 0.3]} />
          <meshStandardMaterial color="#F1E8D4" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.016, 0.02]} rotation={[0, 0.9, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.2, 6]} />
          <meshStandardMaterial color="#E3B23C" roughness={0.6} />
        </mesh>
      </group>
      <GroundShadow y={TABLE_Y + 0.004} scale={2.2} opacity={0.5} blur={2} far={0.6} />
    </group>
  );
};

export const Kitchen3D: React.FC<{ t: number; beam: number; halo: number }> = ({ t, beam, halo }) => (
  <group>
    <Wall />
    <Window halo={halo} />
    <Curtain t={t} />
    <Table />
    <Beam t={t} strength={beam} />
  </group>
);
