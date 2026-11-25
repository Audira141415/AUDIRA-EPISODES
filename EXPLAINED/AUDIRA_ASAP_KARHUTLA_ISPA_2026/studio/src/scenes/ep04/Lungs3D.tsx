// EP04 cover — hologram toddler lungs: glowing-rim shell (not flesh), bronchial tree, alveolar tips,
// PM2.5 smoke particles drawn in through the trachea and lodged in the bronchioles, smoke haze above,
// an in-world "AUDIRA MED" scan band, and foreground bokeh. Everything is a pure function of t.
import React, { useMemo } from "react";
import * as THREE from "three";
import { makeGlow } from "../../kits/anatomix/lib/materials";
import { prng } from "../../kits/anatomix/core/motion";
import { lungify, MOUTH, TREE, TRACHEA_TOP, CARINA, LUNG_SCALE, LUNG_Y } from "./lungModel";

const HOLO = new THREE.Color("#3FE0D0");
const HOLO_SOFT = new THREE.Color("#9FF5EC");
const SMOKE_HOT = new THREE.Color("#F08A3C");
const SMOKE_GREY = new THREE.Color("#A39488");

const holoMaterial = (color: THREE.Color, rim: number, base: number, opacity: number, contour = 1) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uRim: { value: rim },
      uBase: { value: base },
      uOpacity: { value: opacity },
      uContour: { value: contour },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vY = (modelMatrix * vec4(position, 1.0)).y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uRim; uniform float uBase; uniform float uOpacity; uniform float uContour;
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){
        vec3 n = normalize(vN + vec3(1e-5));
        float f = 1.0 - abs(dot(n, normalize(vV + vec3(1e-5))));
        f = pow(clamp(f, 0.0, 1.0), 2.4);
        float contour = smoothstep(0.965, 1.0, abs(sin(vY * 15.0))) * uContour;
        float scan = 0.5 + 0.5 * sin(vY * 160.0);
        vec3 col = uColor * (uBase + f * uRim + contour * 0.55 + scan * 0.03);
        float a = clamp(uBase * 0.7 + f * 0.95 + contour * 0.28, 0.0, 1.0) * uOpacity;
        gl_FragColor = vec4(col, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

/** Text band texture for the in-world scan ring. */
const bandTexture = () => {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 2048, 64);
  g.font = "700 38px Consolas, 'JetBrains Mono', monospace";
  g.fillStyle = "rgba(159,245,236,1)";
  g.textBaseline = "middle";
  const s = "AUDIRA MED  ·  PULMO SCAN  ·  PM2.5  ·  ";
  let x = 0;
  while (x < 2048) {
    g.fillText(s, x, 34);
    x += g.measureText(s).width;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const pathPoint = (pts: THREE.Vector3[], lens: number[], total: number, u: number, out: THREE.Vector3) => {
  let d = u * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) return out.copy(pts[i]).lerp(pts[i + 1], Math.min(1, d / lens[i]));
    d -= lens[i];
  }
  return out.copy(pts[pts.length - 1]);
};

const FLOW = 260;

export const Lungs3D: React.FC<{ t: number }> = ({ t }) => {
  const glow = useMemo(() => makeGlow(), []);
  const band = useMemo(() => bandTexture(), []);

  const lobes = useMemo(
    () =>
      ([-1, 1] as const).map((side) => {
        const g = new THREE.SphereGeometry(1, 96, 72);
        const p = g.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i);
          const w = lungify(v, side);
          p.setXYZ(i, w.x, w.y, w.z);
        }
        g.computeVertexNormals();
        return g;
      }),
    [],
  );
  const shellMat = useMemo(() => holoMaterial(HOLO, 1.25, 0.05, 0.85), []);
  const innerMat = useMemo(() => holoMaterial(HOLO_SOFT, 0.5, 0.025, 0.35, 0), []);
  const airwayMat = useMemo(() => holoMaterial(HOLO_SOFT, 1.1, 0.22, 1, 0), []);

  const tubes = useMemo(
    () =>
      TREE.branches.map((b) => {
        const curve = new THREE.CatmullRomCurve3([b.a, b.m, b.b]);
        return new THREE.TubeGeometry(curve, 8, b.r, 10, false);
      }),
    [],
  );

  // trachea cartilage rings
  const rings = useMemo(() => Array.from({ length: 7 }, (_, i) => TRACHEA_TOP.clone().lerp(CARINA, (i + 0.5) / 7.5)), []);

  // alveolar clusters + PM2.5 deposits (static instanced meshes, built before first draw)
  const { alveoli, deposits } = useMemo(() => {
    const r = prng(9044);
    const o = new THREE.Object3D();
    const alv = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 14, 10),
      new THREE.MeshPhysicalMaterial({ color: "#7FE9DF", roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.26, emissive: "#3FE0D0", emissiveIntensity: 0.35, depthWrite: false }),
      TREE.leaves.length * 6,
    );
    let k = 0;
    TREE.leaves.forEach((l) => {
      for (let j = 0; j < 6; j++) {
        o.position.set(l.p.x + (r() - 0.5) * 0.11, l.p.y + (r() - 0.5) * 0.11, l.p.z + (r() - 0.5) * 0.11);
        o.scale.setScalar(0.018 + r() * 0.016);
        o.updateMatrix();
        alv.setMatrixAt(k++, o.matrix);
      }
    });
    alv.instanceMatrix.needsUpdate = true;

    const dusty = TREE.leaves.filter((l) => l.dusty);
    const per = 9;
    const dep = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: "#ffffff" }), dusty.length * per);
    const c = new THREE.Color();
    k = 0;
    dusty.forEach((l) => {
      for (let j = 0; j < per; j++) {
        o.position.set(l.p.x + (r() - 0.5) * 0.09, l.p.y + (r() - 0.5) * 0.09, l.p.z + (r() - 0.5) * 0.09);
        o.scale.setScalar(0.011 + r() * 0.012);
        o.rotation.set(r() * 3, r() * 3, 0);
        o.updateMatrix();
        dep.setMatrixAt(k, o.matrix);
        c.copy(SMOKE_GREY).lerp(SMOKE_HOT, r() * 0.9).multiplyScalar(0.95);
        dep.setColorAt(k, c);
        k++;
      }
    });
    dep.instanceMatrix.needsUpdate = true;
    if (dep.instanceColor) dep.instanceColor.needsUpdate = true;
    return { alveoli: alv, deposits: dep };
  }, []);

  // inhaled particles riding mouth -> trachea -> bronchi -> bronchiole
  const flowData = useMemo(() => {
    const r = prng(2525);
    const paths = TREE.leaves.map((l) => {
      const pts = [...l.path];
      const lens = pts.slice(1).map((p, i) => p.distanceTo(pts[i]));
      return { pts, lens, total: lens.reduce((a, b) => a + b, 0) };
    });
    const parts = Array.from({ length: FLOW }, () => ({
      path: Math.floor(r() * paths.length),
      u0: r(),
      sp: 0.05 + r() * 0.05,
      jx: (r() - 0.5) * 0.05,
      jz: (r() - 0.5) * 0.05,
      s: 0.012 + r() * 0.014,
      c: r(),
    }));
    const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: "#ffffff" }), FLOW);
    const c = new THREE.Color();
    parts.forEach((p, i) => {
      c.copy(SMOKE_GREY).lerp(SMOKE_HOT, p.c);
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    return { paths, parts, mesh };
  }, []);

  useMemo(() => {
    const { paths, parts, mesh } = flowData;
    const o = new THREE.Object3D();
    const v = new THREE.Vector3();
    parts.forEach((p, i) => {
      const P = paths[p.path];
      // ease so particles bunch up as they slow in the narrow airways
      const u = Math.pow((p.u0 + t * p.sp) % 1, 0.8);
      pathPoint(P.pts, P.lens, P.total, u, v);
      const spread = u < 0.25 ? 3.5 * (0.25 - u) : 0;
      o.position.set(v.x + p.jx * (1 + spread * 4), v.y, v.z + p.jz * (1 + spread * 4));
      o.scale.setScalar(p.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [flowData, t]);

  // smoke haze drifting down into the airway
  const haze = useMemo(() => {
    const r = prng(777);
    return Array.from({ length: 22 }, () => ({
      x: (r() - 0.5) * 2.2,
      y: 1.45 + r() * 0.9,
      z: -0.6 + r() * 1.0,
      s: 0.7 + r() * 1.3,
      o: 0.1 + r() * 0.14,
      hot: r() < 0.35,
      ph: r() * 6.28,
    }));
  }, []);
  const bokeh = useMemo(() => {
    const r = prng(1313);
    return Array.from({ length: 9 }, () => ({ x: (r() - 0.5) * 2.6, y: -1.4 + r() * 3.2, z: 2.6 + r() * 1.6, s: 0.12 + r() * 0.2, hot: r() < 0.6 }));
  }, []);

  const breathe = 1 + 0.012 * Math.sin(t * 2.4);

  return (
    <group position={[0, LUNG_Y, 0]} scale={LUNG_SCALE}>
      {/* lobes: outer shell + faint inner layer */}
      <group scale={[breathe, breathe, breathe]}>
        {lobes.map((g, i) => (
          <group key={i}>
            <mesh geometry={g} material={shellMat} />
            <mesh geometry={g} material={innerMat} scale={0.93} />
          </group>
        ))}
      </group>

      {/* airways */}
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} material={airwayMat} />
      ))}
      {rings.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.082, 0.009, 8, 40]} />
          <meshBasicMaterial color={HOLO_SOFT} transparent opacity={0.55} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
      <primitive object={alveoli} />
      <primitive object={deposits} />
      <primitive object={flowData.mesh} />

      {/* deposit glow at dusty bronchioles */}
      {TREE.leaves
        .filter((l) => l.dusty)
        .map((l, i) => (
          <sprite key={i} position={l.p} scale={[0.22, 0.22, 1]}>
            <spriteMaterial map={glow} color={SMOKE_HOT} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        ))}

      {/* smoke haze above the airway */}
      {haze.map((h, i) => (
        <sprite key={i} position={[h.x + Math.sin(t * 0.4 + h.ph) * 0.05, h.y - ((t * 0.08) % 0.3), h.z]} scale={[h.s, h.s * 0.8, 1]}>
          <spriteMaterial map={glow} color={h.hot ? "#C7703A" : "#6E625A"} transparent opacity={h.o} depthWrite={false} />
        </sprite>
      ))}
      <sprite position={[MOUTH.x, MOUTH.y - 0.75, MOUTH.z]} scale={[1.1, 1.4, 1]}>
        <spriteMaterial map={glow} color="#E07A35" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* in-world brand: scan band around the lungs */}
      <mesh position={[0, -0.8, 0]} rotation={[0, -t * 0.12 + 0.6, 0]}>
        <cylinderGeometry args={[1.42, 1.42, 0.075, 128, 1, true]} />
        <meshBasicMaterial map={band} color={HOLO_SOFT} transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.425, 128]} />
        <meshBasicMaterial color={HOLO} transparent opacity={0.6} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* foreground bokeh (out of focus smoke specks) */}
      {bokeh.map((b, i) => (
        <sprite key={i} position={[b.x, b.y, b.z]} scale={[b.s, b.s, 1]}>
          <spriteMaterial map={glow} color={b.hot ? "#E8833A" : "#9FF5EC"} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
};
