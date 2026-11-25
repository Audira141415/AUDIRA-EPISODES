// The stone wall of the nave holding the triptych window, the glass itself (shader), the floor,
// foreground columns, tinted light shafts and dust motes. Everything is driven by `t` and the
// story uniforms passed in from the film.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { makeShaftTexture, makeStoneTexture } from "../../kits/stainedglass/lib/materials";
import { mulberry32 } from "../../kits/stainedglass/core/motion";
import { GLASS_FRAG, GLASS_VERT, LANCETS, SILL, WIN } from "./glass";

export const FLOOR_Y = -4.7;

export type V4 = [number, number, number, number];
export type GlassState = {
  glow: number;
  storm: number;
  sun: number;
  water: number;
  flash: number;
  reveal: number;
  dim: number;
  bg: number;
  heart: number;
  isle1: number;
  isle2: number;
  pool: number;
  /** per character: x, y, scale, boat */
  ch: V4[];
  /** per character: facing, pose, highlight, talk */
  po: V4[];
};

const lancetPath = (cx: number, hw: number, spring: number, pad = 0) => {
  const s = new THREE.Path();
  const w = hw + pad;
  const R = 2 * hw + pad;
  const apexA = Math.acos(hw / R);
  s.moveTo(cx - w, SILL - pad);
  s.lineTo(cx + w, SILL - pad);
  s.lineTo(cx + w, spring);
  s.absarc(cx - hw, spring, R, 0, apexA, false);
  s.absarc(cx + hw, spring, R, Math.PI - apexA, Math.PI, false);
  s.lineTo(cx - w, SILL - pad);
  return s;
};

const makePlaqueTexture = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#6E5A36";
  g.fillRect(0, 0, 512, 128);
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(255,230,170,0.35)");
  grad.addColorStop(1, "rgba(0,0,0,0.35)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = "rgba(30,20,8,0.8)";
  g.lineWidth = 6;
  g.strokeRect(10, 10, 492, 108);
  g.font = "600 58px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "rgba(25,16,6,0.9)";
  g.fillText("A U D I R A", 256, 68);
  g.fillStyle = "rgba(255,226,160,0.55)";
  g.fillText("A U D I R A", 256, 65);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const Cathedral: React.FC<{ t: number; s: GlassState }> = ({ t, s }) => {
  const uniforms = useMemo(
    () => ({
      uOrigin: { value: new THREE.Vector2(WIN.x0, WIN.y0) },
      uSize: { value: new THREE.Vector2(WIN.w, WIN.h) },
      uT: { value: 0 },
      uGlow: { value: 1 },
      uStorm: { value: 1 },
      uSun: { value: 0 },
      uWater: { value: -1 },
      uFlash: { value: 0 },
      uReveal: { value: 20 },
      uDim: { value: 1 },
      uBg: { value: 1 },
      uHeart: { value: 1 },
      uIsle1: { value: 0 },
      uIsle2: { value: 0 },
      uPoolAmt: { value: 0 },
      uCh: { value: Array.from({ length: 7 }, () => new THREE.Vector4()) },
      uPo: { value: Array.from({ length: 7 }, () => new THREE.Vector4()) },
    }),
    [],
  );
  const glass = useMemo(() => new THREE.ShaderMaterial({ vertexShader: GLASS_VERT, fragmentShader: GLASS_FRAG, uniforms }), [uniforms]);
  const poolMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GLASS_VERT,
        fragmentShader: GLASS_FRAG,
        uniforms,
        defines: { POOL: "" },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [uniforms],
  );
  useLayoutEffect(() => {
    const u = uniforms;
    u.uT.value = t;
    u.uGlow.value = s.glow;
    u.uStorm.value = s.storm;
    u.uSun.value = s.sun;
    u.uWater.value = s.water;
    u.uFlash.value = s.flash;
    u.uReveal.value = s.reveal;
    u.uDim.value = s.dim;
    u.uBg.value = s.bg;
    u.uHeart.value = s.heart;
    u.uIsle1.value = s.isle1;
    u.uIsle2.value = s.isle2;
    u.uPoolAmt.value = s.pool;
    s.ch.forEach((v, i) => u.uCh.value[i].set(...v));
    s.po.forEach((v, i) => u.uPo.value[i].set(...v));
  });

  const wall = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-14, FLOOR_Y);
    sh.lineTo(14, FLOOR_Y);
    sh.lineTo(14, 12);
    sh.lineTo(-14, 12);
    sh.closePath();
    LANCETS.forEach(([cx, hw, sp]) => sh.holes.push(lancetPath(cx, hw, sp)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 64 });
    const tex = makeStoneTexture(1010, 4, 8);
    tex.repeat.set(0.22, 0.22);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0, color: "#A89C88" });
    return { geo, mat };
  }, []);

  // moulding around each lancet (a raised stone roll)
  const mouldings = useMemo(
    () =>
      LANCETS.map(([cx, hw, sp]) => {
        const pts = lancetPath(cx, hw, sp, 0.1).getSpacedPoints(400).map((v) => new THREE.Vector3(v.x, v.y, 0));
        const curve = new THREE.CatmullRomCurve3(pts, false);
        return new THREE.TubeGeometry(curve, 400, 0.09, 10, false);
      }),
    [],
  );

  const floor = useMemo(() => {
    const tex = makeStoneTexture(1011, 3, 3, true);
    tex.repeat.set(5, 4);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.05, color: "#9C907E" });
  }, []);
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8E8474", roughness: 0.9 }), []);
  const shaft = useMemo(() => makeShaftTexture(), []);
  const plaque = useMemo(() => makePlaqueTexture(), []);

  const motes = useMemo(() => {
    const rnd = mulberry32(1012);
    const N = 520;
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 6, 6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFE2A8").multiplyScalar(1.4), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
      N,
    );
    mesh.frustumCulled = false;
    const seeds = Array.from({ length: N }, () => ({ u: rnd(), v: rnd(), s: 0.006 + rnd() * 0.012, ph: rnd() * 6.28 }));
    return { mesh, seeds };
  }, []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    motes.seeds.forEach((p, i) => {
      const along = (p.v + t * 0.01) % 1;
      const y = 4.5 - along * 8.5 + Math.sin(t * 0.5 + p.ph) * 0.12;
      const z = 0.8 + along * 6.5 + Math.cos(t * 0.4 + p.ph) * 0.1;
      const x = (p.u - 0.5) * 12 + Math.sin(t * 0.3 + p.ph * 2) * 0.1;
      const tw = 0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.1 + p.ph * 5), 2);
      tmp.position.set(x, y, z);
      tmp.scale.setScalar(p.s * tw * s.glow * (0.4 + 0.6 * s.sun + 0.3 * s.storm));
      tmp.updateMatrix();
      motes.mesh.setMatrixAt(i, tmp.matrix);
    });
    motes.mesh.instanceMatrix.needsUpdate = true;
  });

  const beam = -Math.atan2(6.5, 8.5);
  const shafts: [number, string, number][] = [
    [-4.7, "#5A6FD0", 0.08],
    [-0.4, "#E04A40", 0.1],
    [0.5, "#FFD27A", 0.08],
    [4.7, "#FFD88A", 0.16],
  ];

  return (
    <group>
      <ambientLight intensity={0.16} color="#C9B79C" />
      <hemisphereLight args={["#E9D8B8", "#2A2118", 0.2]} />
      {/* coloured spill from the glass onto the reveals, mouldings and columns */}
      <pointLight position={[4.7, 2.5, 1.6]} intensity={9 * s.glow} distance={9} decay={1.6} color="#FFC970" />
      <pointLight position={[0, 1.0, 1.6]} intensity={6 * s.glow} distance={8} decay={1.6} color="#E0453C" />
      <pointLight position={[-4.7, 2.5, 1.6]} intensity={5 * s.glow} distance={8} decay={1.6} color="#4C64C8" />
      <pointLight position={[0, 4.5, 1.4]} intensity={4 * s.glow} distance={6} decay={1.6} color="#F6C445" />
      <directionalLight position={[3, 6, 9]} intensity={0.25} color="#FFE7C2" />

      <mesh position={[WIN.x0 + WIN.w / 2, WIN.y0 + WIN.h / 2, 0.05]} material={glass}>
        <planeGeometry args={[WIN.w, WIN.h]} />
      </mesh>
      <mesh geometry={wall.geo} material={wall.mat} position={[0, 0, -0.05]} />
      {mouldings.map((g, i) => (
        <mesh key={i} geometry={g} material={stoneMat} position={[0, 0, 0.72]} />
      ))}
      {/* sill ledge and the small brass plaque carrying the workshop mark */}
      <mesh position={[0, SILL - 0.3, 0.95]} material={stoneMat}>
        <boxGeometry args={[14.2, 0.56, 0.7]} />
      </mesh>
      <mesh position={[0, SILL - 0.3, 1.31]}>
        <planeGeometry args={[2.2, 0.5]} />
        <meshStandardMaterial map={plaque} roughness={0.35} metalness={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 8]} material={floor}>
        <planeGeometry args={[30, 18]} />
      </mesh>
      {/* the window's colours pooled on the flagstones (same picture, no lead, additive) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.01, 6.2]} material={poolMat} scale={[1, -0.85, 1]}>
        <planeGeometry args={[WIN.w * 0.9, WIN.h]} />
      </mesh>
      <pointLight position={[0, SILL - 0.6, 2.2]} intensity={2.5 * s.pool + 0.6} distance={4} decay={1.5} color="#FFD9A0" />

      {shafts.map(([x, tint, o], i) => (
        <mesh key={i} position={[x, 0.0, 3.6]} rotation={[beam, 0, (x / 6) * 0.08]}>
          <planeGeometry args={[i === 3 ? 3.2 : 2.2, 11]} />
          <meshBasicMaterial map={shaft} color={tint} transparent opacity={o * s.glow} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <primitive object={motes.mesh} />

      {/* foreground columns frame the triptych (parallax on camera moves) */}
      {[-8.3, 8.3].map((x) => (
        <group key={x} position={[x, 0, 3.4]}>
          <mesh position={[0, 3, 0]} material={stoneMat}>
            <cylinderGeometry args={[0.55, 0.58, 16, 40]} />
          </mesh>
          <mesh position={[0, FLOOR_Y + 0.3, 0]} material={stoneMat}>
            <boxGeometry args={[1.5, 0.6, 1.5]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
