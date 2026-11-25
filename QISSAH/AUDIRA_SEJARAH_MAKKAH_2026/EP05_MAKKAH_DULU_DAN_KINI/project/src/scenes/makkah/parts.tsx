// Shared 3D pieces for the EP05 film: engraved labels, water, flow lines, ropes, rain, ripples.
import React, { useMemo } from "react";
import * as THREE from "three";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { INK, rng } from "./engraving.ts";

type V3 = [number, number, number];
/** Ref callback: put an object on the FX layer only (skipped by AO / DoF passes). */
export const fx = (o: THREE.Object3D | null) => {
  if (o) o.layers.set(FX_LAYER);
};
const SERIF = "Georgia, 'Times New Roman', serif";

// ---------------------------------------------------------------- engraved label (billboard)
const labelCache = new Map<string, { tex: THREE.Texture; aspect: number }>();
function labelTexture(title: string, sub?: string, tone: "paper" | "ink" | "gold" = "paper") {
  const key = `${tone}|${title}|${sub ?? ""}`;
  const hit = labelCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const T = 64, S = 40, pad = 34;
  g.font = `700 ${T}px ${SERIF}`;
  const w1 = g.measureText(title).width;
  g.font = `italic 400 ${S}px ${SERIF}`;
  const w2 = sub ? g.measureText(sub).width : 0;
  const W = Math.ceil(Math.max(w1, w2) + pad * 2);
  const H = Math.ceil(pad * 1.4 + T + (sub ? S * 1.35 : 0) + pad * 0.6);
  c.width = W;
  c.height = H;
  const bg = tone === "ink" ? INK.sepia : tone === "gold" ? "#d9bd7d" : "#f1e6cc";
  const fg = tone === "ink" ? INK.paper : INK.iron;
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = tone === "ink" ? INK.gold : INK.sepia;
  g.lineWidth = 5;
  g.strokeRect(5, 5, W - 10, H - 10);
  g.lineWidth = 2;
  g.strokeRect(14, 14, W - 28, H - 28);
  g.fillStyle = fg;
  g.textBaseline = "top";
  g.font = `700 ${T}px ${SERIF}`;
  g.fillText(title, (W - w1) / 2, pad * 0.95);
  if (sub) {
    g.font = `italic 400 ${S}px ${SERIF}`;
    g.fillStyle = tone === "ink" ? "#e6cf9a" : INK.sepia;
    g.fillText(sub, (W - w2) / 2, pad * 0.95 + T * 1.12);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const out = { tex, aspect: W / H };
  labelCache.set(key, out);
  return out;
}

/** Billboard label with a thin leader line down to its anchor. `o` = opacity 0..1. */
export const Label3D: React.FC<{ at: V3; lift?: number; h?: number; title: string; sub?: string; o: number; tone?: "paper" | "ink" | "gold" }> = ({
  at,
  lift = 0.6,
  h = 0.32,
  title,
  sub,
  o,
  tone = "paper",
}) => {
  const { tex, aspect } = labelTexture(title, sub, tone);
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, sizeAttenuation: false }), [tex]);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]);
    const m = new THREE.LineBasicMaterial({ color: INK.sepia, transparent: true, depthTest: false });
    const l = new THREE.Line(g, m);
    l.layers.set(FX_LAYER);
    l.renderOrder = 998;
    return l;
  }, []);
  if (o <= 0.001) return null;
  mat.opacity = o;
  (line.material as THREE.LineBasicMaterial).opacity = o * 0.9;
  const s = 0.75 + 0.25 * o;
  // constant on-screen size (sizeAttenuation off): about 4-5% of the frame height
  const hs = 0.042 * Math.min(1.35, Math.max(0.85, h / 0.3));
  line.scale.set(1, lift, 1);
  return (
    <group position={at}>
      <primitive object={line} />
      <sprite material={mat} position={[0, lift, 0]} scale={[hs * aspect * s, hs * s, 1]} renderOrder={999} ref={fx} />
    </group>
  );
};

// ---------------------------------------------------------------- water
const waterMats = new Map<string, THREE.MeshStandardMaterial & { userData: { u: { uTime: { value: number } } } }>();
export function waterMaterial(color = "#6f8f84", opacity = 0.8) {
  const key = color + opacity;
  const hit = waterMats.get(key);
  if (hit) return hit;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.18, metalness: 0.35, transparent: true, opacity, depthWrite: false }) as THREE.MeshStandardMaterial & {
    userData: { u: { uTime: { value: number } } };
  };
  const u = { uTime: { value: 0 } };
  m.userData.u = u;
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = u.uTime;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWP2;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvWP2 = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWP2;\nuniform float uTime;")
      .replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
{
  float wv = vWP2.z * 14.0 + sin(vWP2.x * 3.1 + uTime * 1.7) * 0.9 + sin(vWP2.x * 7.3 - uTime * 2.3) * 0.35;
  float d = abs(fract(wv) - 0.5) * 2.0;
  float aa = max(fwidth(wv) * 2.0, 1e-4);
  float line = 1.0 - smoothstep(0.18 - aa, 0.18 + aa, d);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.12, 0.2, 0.18), line * 0.55);
  float glint = smoothstep(0.92, 1.0, sin(vWP2.x * 11.0 + vWP2.z * 9.0 + uTime * 3.0));
  gl_FragColor.rgb += glint * 0.12;
}`,
      );
  };
  m.customProgramCacheKey = () => "engraved-water";
  waterMats.set(key, m);
  return m;
}

export const WaterPlane: React.FC<{ y: number; size?: [number, number]; at?: [number, number]; t: number; color?: string; opacity?: number }> = ({
  y,
  size = [40, 30],
  at = [0, 0],
  t,
  color,
  opacity,
}) => {
  const m = waterMaterial(color, opacity);
  m.userData.u.uTime.value = t;
  return (
    <mesh position={[at[0], y, at[1]]} rotation={[-Math.PI / 2, 0, 0]} material={m} renderOrder={2}>
      <planeGeometry args={size} />
    </mesh>
  );
};

// ---------------------------------------------------------------- flowing gold lines (tubes with a moving dash)
const flowMat = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: { uTime: { value: 0 }, uReveal: { value: 1 }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `varying vec2 vUv; uniform float uTime, uReveal, uOpacity; uniform vec3 uColor;
      void main(){
        if (vUv.x > uReveal) discard;
        float dash = smoothstep(0.0, 0.25, fract(vUv.x * 9.0 - uTime * 0.9)) * (1.0 - smoothstep(0.55, 0.8, fract(vUv.x * 9.0 - uTime * 0.9)));
        float a = (0.55 + 0.45 * dash) * uOpacity;
        vec3 c = mix(uColor * 0.62, uColor * 1.08, dash);
        gl_FragColor = vec4(c, a);
      }`,
  });

export const FlowLine: React.FC<{ pts: V3[]; r?: number; t: number; reveal: number; o?: number; color?: string; xray?: boolean }> = ({ pts, r = 0.025, t, reveal, o = 1, color = "#e8c26a", xray = false }) => {
  const { geo, mat } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return { geo: new THREE.TubeGeometry(curve, Math.max(24, pts.length * 6), r, 6, false), mat: flowMat(color) };
  }, [JSON.stringify(pts), r, color]);
  if (reveal <= 0.001 || o <= 0.001) return null;
  mat.uniforms.uTime.value = t;
  mat.uniforms.uReveal.value = reveal;
  mat.uniforms.uOpacity.value = o;
  mat.depthTest = !xray;
  return <mesh geometry={geo} material={mat} ref={fx} renderOrder={xray ? 990 : 5} />;
};

// ---------------------------------------------------------------- rope / ruler segment that draws itself
export const Rope: React.FC<{ a: V3; b: V3; p: number; r?: number; color?: string }> = ({ a, b, p, r = 0.008, color = INK.gold }) => {
  if (p <= 0.001) return null;
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const end = A.clone().lerp(B, p);
  const mid = A.clone().add(end).multiplyScalar(0.5);
  const len = A.distanceTo(end);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <group>
      <mesh position={mid} quaternion={q} castShadow>
        <cylinderGeometry args={[r, r, len, 8]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[r * 2.4, 10, 8]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- rain (engraved strokes)
export const Rain: React.FC<{ t: number; o: number; center?: V3; spread?: number; height?: number; n?: number }> = ({ t, o, center = [0, 0, 0], spread = 14, height = 9, n = 900 }) => {
  const { geo, seeds, mat } = useMemo(() => {
    const r = rng(41);
    const seeds = Array.from({ length: n }, () => [r() * 2 - 1, r() * 2 - 1, r(), 0.6 + r() * 0.6]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    const mat = new THREE.LineBasicMaterial({ color: INK.sepia, transparent: true, depthWrite: false });
    return { geo, seeds, mat };
  }, [n]);
  if (o <= 0.001) return null;
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) {
    const [sx, sz, ph, sp] = seeds[i];
    const y = height - (((t * 6 * sp + ph * height) % height) + height) % height;
    const x = center[0] + sx * spread, z = center[2] + sz * spread;
    p.setXYZ(i * 2, x, center[1] + y, z);
    p.setXYZ(i * 2 + 1, x - 0.05, center[1] + y - 0.45, z + 0.02);
  }
  p.needsUpdate = true;
  mat.opacity = 0.55 * o;
  return <lineSegments geometry={geo} material={mat} ref={fx} frustumCulled={false} />;
};

// ---------------------------------------------------------------- ripple ring
export const Ripple: React.FC<{ at: V3; t: number; o: number; r?: number }> = ({ at, t, o, r = 0.06 }) => {
  if (o <= 0.001) return null;
  const k = (t * 0.8) % 1;
  return (
    <group position={at}>
      {[0, 0.5].map((off, i) => {
        const kk = (k + off) % 1;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + kk * 1.6}>
            <ringGeometry args={[r * 0.82, r, 28]} />
            <meshBasicMaterial color="#f6e7bf" transparent opacity={o * (1 - kk) * 0.85} depthWrite={false} />
          </mesh>
        );
      })}
      <mesh>
        <sphereGeometry args={[r * 0.28, 10, 8]} />
        <meshBasicMaterial color="#fff3cf" transparent opacity={o} />
      </mesh>
    </group>
  );
};
