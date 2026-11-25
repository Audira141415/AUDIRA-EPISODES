import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../../core/polish/Polish";
import { FX_LAYER } from "../../../core/render/Post";
import {
  BALL_R, BALL_ROUTE, BRASS_R, BUCKET, DOMINO, FLAG, FLAG_UP, MARBLE_R, PULLEY, SEESAW, SHELF_Y,
  ballState, brassPos, bucketDrop, bucketSwing, dominoAngle, dominoX, flagY, marbleState, pulleyAngle, seesawTilt,
} from "../core/chain";
import { clamp01, easeOutCubic } from "../core/motion";
import { CHAINREACTION_PALETTE as P } from "../lib/palette";
import { bannerTexture, dominoFace } from "../lib/materials";

const Rope: React.FC<{ a: [number, number, number]; b: [number, number, number]; r?: number }> = ({ a, b, r = 0.005 }) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), len = va.distanceTo(vb);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, len, 6]} />
      <meshPhysicalMaterial color={P.rope} {...POLISH.fabric} />
    </mesh>
  );
};

const Domino: React.FC<{ i: number; m: number }> = ({ i, m }) => {
  const { h, w, depth } = DOMINO;
  const face = dominoFace(100 + i, P.pip);
  const color = P.dominoes[i % P.dominoes.length];
  return (
    // pivot on the leading bottom edge; +z rotation tips the top toward −x
    <group position={[dominoX(i) - w / 2, SHELF_Y, 0]} rotation={[0, 0, dominoAngle(i, m)]}>
      <group position={[w / 2, h / 2, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[w, h, depth]} radius={0.007} />
          <meshPhysicalMaterial color={color} {...POLISH.toyPlastic} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[(s * w) / 2 + s * 0.0012, 0, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
            <planeGeometry args={[depth * 0.86, h * 0.9]} />
            <meshBasicMaterial map={face} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Ball: React.FC<{ x: number; y: number; rot: number; r: number; kind: "marble" | "steel" | "brass" }> = ({ x, y, rot, r, kind }) => (
  <mesh position={[x, y, 0]} rotation={[0, 0, rot]} castShadow>
    <sphereGeometry args={[r, 40, 40]} />
    {kind === "marble" ? (
      <meshPhysicalMaterial color={P.marble} roughness={0.05} clearcoat={1} clearcoatRoughness={0.02} transmission={0.25} thickness={0.05} ior={1.5} />
    ) : (
      <meshPhysicalMaterial color={kind === "steel" ? P.steel : P.brass} metalness={1} roughness={kind === "steel" ? 0.12 : 0.24} />
    )}
  </mesh>
);

const Seesaw: React.FC<{ m: number }> = ({ m }) => {
  const prism = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.09, 0);
    s.lineTo(0.09, 0);
    s.lineTo(0, SEESAW.py);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 });
    g.translate(0, 0, -0.06);
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={prism} position={[SEESAW.px, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.dominoes[4]} {...POLISH.toyPlastic} />
      </mesh>
      <group position={[SEESAW.px, SEESAW.py, 0]} rotation={[0, 0, -seesawTilt(m)]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[SEESAW.half * 2, SEESAW.thick, 0.13]} radius={0.008} />
          <meshPhysicalMaterial color={P.dominoes[0]} {...POLISH.toyPlastic} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.15, 16]} />
          <meshStandardMaterial color={P.steel} metalness={1} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

/** Cloth banner on a rod: unfurls as the carriage reaches the top, then flutters. */
const Banner: React.FC<{ m: number; y: number }> = ({ m, y }) => {
  const W = 0.56, H = 0.25, SX = 22, SY = 6;
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H, SX, SY), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const tex = bannerTexture("AUDIRA", P.flag, P.flagText);
  const open = easeOutCubic(clamp01((m - (FLAG_UP - 0.35)) / 0.55));
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      const u = (bx + W / 2) / W; // 0 at the rod, 1 at the free edge
      const x = (bx + W / 2) * (0.18 + 0.82 * open);
      const z = Math.sin(u * 7 - m * 6.5) * 0.022 * u + (1 - open) * Math.sin(u * 18) * 0.03 * u;
      pos.setXYZ(i, x, by - (1 - open) * u * 0.05, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <group position={[PULLEY.postX + 0.05, y - H / 2 + 0.02, 0.07]}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial map={tex} side={THREE.DoubleSide} {...POLISH.fabric} />
      </mesh>
      <mesh position={[W / 2 - 0.02, H / 2 + 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, W + 0.1, 10]} />
        <meshStandardMaterial color={P.brass} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

const PulleyRig: React.FC<{ m: number }> = ({ m }) => {
  const drop = bucketDrop(m), fy = flagY(m);
  const bucketTop = BUCKET.mouthY - drop + 0.1;
  return (
    <group>
      {/* post and arm */}
      <mesh position={[PULLEY.postX, 1.16, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.06, 2.32, 0.06]} radius={0.01} />
        <meshPhysicalMaterial color={P.bracket} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[(PULLEY.postX + PULLEY.x) / 2, PULLEY.y, -0.04]} castShadow>
        <boxGeometry args={[PULLEY.postX - PULLEY.x + 0.04, 0.03, 0.02]} />
        <meshStandardMaterial color={P.bracket} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* wheel with spokes so its turn reads */}
      <group position={[PULLEY.x, PULLEY.y, 0]} rotation={[0, 0, pulleyAngle(m)]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[PULLEY.r, PULLEY.r, 0.03, 40]} />
          <meshStandardMaterial color={P.brass} metalness={1} roughness={0.28} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0, 0.017]} rotation={[0, 0, (k * Math.PI) / 3]}>
            <boxGeometry args={[PULLEY.r * 1.8, 0.012, 0.004]} />
            <meshStandardMaterial color={P.bracket} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <Rope a={[BUCKET.x, PULLEY.y, 0]} b={[BUCKET.x, bucketTop, 0]} />
      <Rope a={[FLAG.x, PULLEY.y, 0]} b={[FLAG.x, fy + 0.04, 0]} />
      {/* bucket */}
      <group position={[BUCKET.x, BUCKET.mouthY - drop, 0]} rotation={[0, 0, bucketSwing(m)]}>
        <mesh position={[0, -BUCKET.h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[BUCKET.r, BUCKET.r * 0.82, BUCKET.h, 32, 1, true]} />
          <meshPhysicalMaterial color={P.bucket} metalness={0.8} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -BUCKET.h, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[BUCKET.r * 0.82, 32]} />
          <meshStandardMaterial color={P.bucket} metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.0, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[BUCKET.r, 0.006, 8, 40, Math.PI]} />
          <meshStandardMaterial color={P.steel} metalness={1} roughness={0.3} />
        </mesh>
      </group>
      {/* flag carriage on the post front */}
      <mesh position={[PULLEY.postX - 0.01, fy, 0.045]} castShadow>
        <RoundedBoxGeo args={[0.09, 0.07, 0.035]} radius={0.008} />
        <meshPhysicalMaterial color={P.dominoes[1]} {...POLISH.toyPlastic} />
      </mesh>
      <Banner m={m} y={fy} />
    </group>
  );
};

/** Glowing route of the steel ball, drawn as far as the ball has travelled. */
const Trail: React.FC<{ m: number; boost: number }> = ({ m, boost }) => {
  const radial = 6;
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(BALL_ROUTE.map((p) => new THREE.Vector3(p.x, p.y, 0.072)));
    return new THREE.TubeGeometry(curve, BALL_ROUTE.length - 1, 0.006, radial, false);
  }, []);
  let done = 0;
  while (done < BALL_ROUTE.length - 1 && BALL_ROUTE[done + 1].m <= m) done++;
  geo.setDrawRange(0, done * radial * 6);
  return (
    <mesh geometry={geo} layers={FX_LAYER}>
      <meshBasicMaterial color={P.trail} transparent opacity={0.35 + 0.5 * boost} toneMapped={false} />
    </mesh>
  );
};

export const Machine3D: React.FC<{ m: number; trailBoost?: number }> = ({ m, trailBoost = 0 }) => {
  const mb = marbleState(m), b = ballState(m), br = brassPos(m);
  return (
    <group>
      {Array.from({ length: DOMINO.n }, (_, i) => (
        <Domino key={i} i={i} m={m} />
      ))}
      <Ball x={mb.x} y={mb.y} rot={mb.rot} r={MARBLE_R} kind="marble" />
      <Ball x={b.x} y={b.y} rot={b.rot} r={BALL_R} kind="steel" />
      <Ball x={br[0]} y={br[1]} rot={0} r={BRASS_R} kind="brass" />
      <Seesaw m={m} />
      <PulleyRig m={m} />
      <Trail m={m} boost={trailBoost} />
    </group>
  );
};
