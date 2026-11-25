// S3 — the DISASTERSIM earth block re-cut for a volcanic arc: oceanic slab (Indo-Australia) dives under the
// continental crust (Eurasia), carries water into the mantle wedge, the wedge partly melts, magma rises to
// the magma chamber under a procedural volcano. Times are film seconds (T).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DISASTER_PALETTE as P } from "../../kits/disastersim/lib/palette";
import { makeBasaltTexture, makeCrustTexture, makeMantleTexture } from "../../kits/disastersim/lib/materials";
import { BLOCK, clamp, COAST_X, lerp, seg, SLAB_THICK, slabTop, surfaceY } from "../../kits/disastersim/core/motion";
import { AssetModel } from "../../core/assets/AssetModel";
import { Label3D, Volcano } from "./Volcano";
import { BEAT } from "./timeline";

const D = BLOCK.halfD * 2;
const FRONT = BLOCK.halfD;
const CB = -1.5; // base of the continental crust
const VX = 3.0; // volcano x
const CH: [number, number] = [VX, -0.85]; // magma chamber centre on the cut face
const MELT: [number, number] = [2.85, -2.25];

const range = (a: number, b: number, step: number) => {
  const out: number[] = [];
  for (let x = a; x <= b + 1e-6; x += step) out.push(x);
  return out;
};
const extrude = (pts: [number, number][]) => {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: D, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -BLOCK.halfD);
  g.computeVertexNormals();
  return g;
};

const plaqueTexture = (text: string) => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#101A22";
  g.fillRect(0, 0, 1024, 128);
  g.fillStyle = P.lvlInfo;
  g.fillRect(0, 0, 14, 128);
  g.fillStyle = "#EAF4F8";
  g.font = "bold 84px Arial, sans-serif";
  g.textBaseline = "middle";
  g.fillText(text, 44, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Discs / blobs on the cut face (half-embedded spheres read as 3D). */
const Blob: React.FC<{ x: number; y: number; r: number; color: string; emissive?: number; o?: number }> = ({ x, y, r, color, emissive = 0, o = 1 }) =>
  o <= 0.01 || r <= 0.001 ? null : (
    <mesh position={[x, y, FRONT]} scale={[r, r, r * 0.6]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} roughness={0.35} transparent={o < 1} opacity={o} toneMapped={emissive < 0.5} />
    </mesh>
  );

const Chevrons: React.FC<{ T: number }> = ({ T }) => {
  const N = 9;
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const u = ((i / N + T * 0.06) % 1) * 7.2 - 3.6;
      const y = slabTop(u) - SLAB_THICK / 2;
      const dy = slabTop(u + 0.05) - slabTop(u - 0.05);
      o.position.set(u, y, FRONT + 0.012);
      o.rotation.set(0, 0, Math.atan2(dy, 0.1) - Math.PI / 2);
      o.scale.setScalar(Math.max(0.0001, Math.min(1, (u + 3.6) / 0.6, (3.6 - u) / 0.6)));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [T]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]}>
      <circleGeometry args={[0.11, 3]} />
      <meshBasicMaterial color="#DDE8F2" transparent opacity={0.7} toneMapped={false} />
    </instancedMesh>
  );
};

export const GunungEarthBlock: React.FC<{ T: number }> = ({ T }) => {
  const tex = useMemo(() => ({ crust: makeCrustTexture(), basalt: makeBasaltTexture(), mantle: makeMantleTexture(), plaque: plaqueTexture("AUDIRA GEOLAB") }), []);
  const geo = useMemo(() => {
    const land = range(0, 4, 0.05).map((x) => [x, surfaceY(x)] as [number, number]);
    const bottom = range(0, 4, 0.05)
      .reverse()
      .map((x) => [x, Math.max(slabTop(x), CB)] as [number, number]);
    const xw = 1.2;
    const wedge: [number, number][] = [[xw, CB], [4, CB], ...range(xw, 4, 0.1).reverse().map((x) => [x, slabTop(x)] as [number, number])];
    const slabFwd = range(-4, 4, 0.1).map((x) => [x, slabTop(x)] as [number, number]);
    const slabBot = range(-4, 4, 0.1).map((x) => [x, slabTop(x) - SLAB_THICK] as [number, number]);
    const skin = new THREE.PlaneGeometry(4, D, 100, 8);
    skin.rotateX(-Math.PI / 2);
    skin.translate(2, 0, 0);
    const pos = skin.attributes.position as THREE.BufferAttribute;
    const cols: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = surfaceY(x);
      pos.setY(i, y + 0.004);
      if (y < -0.05) c.set("#56606A");
      else if (y < 0.12) c.set(P.sand);
      else c.set(P.land).lerp(new THREE.Color("#4F7444"), clamp((y - 0.3) / 0.6));
      cols.push(c.r, c.g, c.b);
    }
    skin.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    skin.computeVertexNormals();
    const conduit = new THREE.CatmullRomCurve3([
      new THREE.Vector3(CH[0], CH[1] + 0.15, FRONT + 0.008),
      new THREE.Vector3(CH[0] + 0.03, -0.3, FRONT + 0.008),
      new THREE.Vector3(CH[0], surfaceY(CH[0]) - 0.02, FRONT + 0.008),
    ]);
    return {
      crust: extrude([...land, ...bottom]),
      wedge: extrude(wedge),
      slab: extrude([...slabFwd, ...slabBot.slice().reverse()]),
      mantle: extrude([...slabBot, [4, BLOCK.bottom], [-4, BLOCK.bottom]]),
      skin,
      conduit: new THREE.TubeGeometry(conduit, 32, 0.045, 8, false),
    };
  }, []);

  // --- beats ---
  const water = seg(T, BEAT.air, BEAT.air + 0.6);
  const melt = seg(T, BEAT.meleleh, BEAT.meleleh + 1.6);
  const rise = clamp((T - BEAT.magmaNaik) / 2.2);
  const chamber = seg(T, BEAT.magmaNaik + 0.8, BEAT.dapur + 0.4);
  const pulse = 0.85 + 0.15 * Math.sin(T * 5);
  const lab = (a: number, b: number) => seg(T, a, a + 0.5) * (1 - seg(T, b - 0.4, b));

  return (
    <group>
      {/* plinth + brand plaque + lab grid */}
      <mesh position={[0, BLOCK.bottom - 0.16, 0]} receiveShadow>
        <boxGeometry args={[8.6, 0.32, D + 0.6]} />
        <meshStandardMaterial color={P.plinth} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[1.0, BLOCK.bottom - 0.16, FRONT + 0.301]}>
        <planeGeometry args={[2.56, 0.32]} />
        <meshBasicMaterial map={tex.plaque} toneMapped={false} />
      </mesh>
      <gridHelper args={[60, 60, P.grid, P.grid]} position={[0, BLOCK.bottom - 0.33, 0]} />

      {/* sea over the ocean side (cut face shows the water column) */}
      <mesh position={[(BLOCK.x0 + COAST_X) / 2, -0.45, 0]}>
        <boxGeometry args={[COAST_X - BLOCK.x0, 0.9, D]} />
        <meshStandardMaterial color={P.sea} roughness={0.15} metalness={0.1} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh geometry={geo.mantle}>
        <meshStandardMaterial attach="material-0" map={tex.mantle} emissiveMap={tex.mantle} emissive="#FFFFFF" emissiveIntensity={0.26} roughness={0.8} />
        <meshStandardMaterial attach="material-1" color={P.mantleDeep} emissive={P.mantleHot} emissiveIntensity={0.22} roughness={0.8} />
      </mesh>
      <mesh geometry={geo.wedge}>
        <meshStandardMaterial attach="material-0" map={tex.mantle} emissiveMap={tex.mantle} emissive="#FFFFFF" emissiveIntensity={0.22 + 0.25 * melt} roughness={0.8} />
        <meshStandardMaterial attach="material-1" color={P.mantleDeep} emissive={P.mantleHot} emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
      <mesh geometry={geo.slab} castShadow receiveShadow>
        <meshStandardMaterial attach="material-0" map={tex.basalt} roughness={0.75} />
        <meshStandardMaterial attach="material-1" color={P.basaltTop} roughness={0.85} />
      </mesh>
      <mesh geometry={geo.crust} castShadow receiveShadow>
        <meshStandardMaterial attach="material-0" map={tex.crust} roughness={0.85} />
        <meshStandardMaterial attach="material-1" color={P.granite} roughness={0.9} />
      </mesh>
      <mesh geometry={geo.skin} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.9} />
      </mesh>

      {/* volcano on the arc + a little life on the land */}
      <Volcano radius={0.85} height={0.95} seed={3} green={0.55} position={[VX, surfaceY(VX) - 0.03, 0]} glow={chamber * 0.8} />
      <group position={[2.25, surfaceY(2.25), 0.9]}>
        <AssetModel id="palm-tree-a307da" size={0.45} ground />
      </group>
      <group position={[2.5, surfaceY(2.5), -1.1]}>
        <AssetModel id="palm-tree-a307da" size={0.38} ground rotation={[0, 1.4, 0]} />
      </group>

      <Chevrons T={T} />

      {/* water released from the slab (from 27.4 s) */}
      {range(0, 9, 1).map((i) => {
        const x = 1.6 + i * 0.16;
        const start = BEAT.air + i * 0.12;
        const k = clamp((T - start) / 2.2);
        const y0 = slabTop(x) + 0.06;
        const fade = 1 - seg(T, BEAT.meleleh + 1.2, BEAT.meleleh + 2.2);
        return <Blob key={`w${i}`} x={x + 0.1 * Math.sin(i * 2.3 + T)} y={y0 + k * 0.45} r={0.055 * seg(T, start, start + 0.3)} color="#5EC8FF" emissive={0.6} o={water * fade} />;
      })}

      {/* partial melt in the mantle wedge (from 29.7 s) */}
      <Blob x={MELT[0]} y={MELT[1]} r={(0.12 + 0.24 * melt) * pulse} color="#FF9A3C" emissive={1.6} o={melt * 0.95} />
      <Blob x={MELT[0] - 0.22} y={MELT[1] + 0.06} r={0.12 * melt} color="#FFB45A" emissive={1.4} o={melt * 0.85} />

      {/* magma rises (from 33.9 s) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const k = clamp(rise * 1.6 - i * 0.18);
        if (k <= 0 || k >= 1) return null;
        const x = lerp(MELT[0], CH[0], k) + 0.06 * Math.sin(k * 9 + i);
        const y = lerp(MELT[1] + 0.2, CH[1] - 0.1, k);
        return <Blob key={`m${i}`} x={x} y={y} r={0.09} color="#FF8A30" emissive={1.5} />;
      })}

      {/* magma chamber + conduit on the cut face */}
      <mesh position={[CH[0], CH[1], FRONT]} scale={[0.5 * (0.35 + 0.65 * chamber), 0.22 * (0.35 + 0.65 * chamber), 0.12]} visible={chamber > 0.01}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#FF7A28" emissive="#FF6A1E" emissiveIntensity={1.2 * pulse} toneMapped={false} />
      </mesh>
      <mesh geometry={geo.conduit} visible={chamber > 0.3}>
        <meshStandardMaterial color="#FF8A30" emissive="#FF6A1E" emissiveIntensity={0.9 * chamber} toneMapped={false} />
      </mesh>
      {chamber > 0.01 && <pointLight position={[CH[0], CH[1], FRONT + 0.6]} color="#FF7A2E" intensity={2.5 * chamber} distance={3} />}

      {/* labels (max two at a time) */}
      <Label3D text="LEMPENG INDO-AUSTRALIA" accent={P.basalt} position={[-1.9, -1.55, FRONT + 0.1]} h={0.5} o={lab(BEAT.menyusup, BEAT.air)} />
      <Label3D text="LEMPENG EURASIA" accent={P.sediment} position={[0.6, 1.15, FRONT + 0.1]} h={0.5} o={lab(BEAT.menyusup + 0.6, BEAT.air)} />
      <Label3D text="AIR DARI LEMPENG" accent="#5EC8FF" position={[0.2, -2.15, FRONT + 0.1]} h={0.42} o={lab(BEAT.air + 0.3, BEAT.meleleh)} />
      <Label3D text="MANTEL MELELEH" accent={P.mantleHot} position={[0.6, -2.85, FRONT + 0.1]} h={0.42} o={lab(BEAT.meleleh + 0.4, BEAT.magmaNaik)} />
      <Label3D text="DAPUR MAGMA" accent="#FF8A30" position={[1.3, -0.95, FRONT + 0.1]} h={0.42} o={lab(BEAT.dapur - 0.6, 40)} />
    </group>
  );
};
