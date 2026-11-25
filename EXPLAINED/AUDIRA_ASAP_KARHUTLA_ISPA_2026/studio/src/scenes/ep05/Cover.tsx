// EP05 cover — "ASAP TAK KENAL BATAS" (HISTORYMAP). Paper map on a dark map table: smoke from
// Sumsel, Jambi and Bengkulu feed a Riau haze blanket; branches cross the dashed sea border to Malaysia and Singapore.
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";
import {
  BORDER_JOHOR, BORDER_MAIN, JAMBI, KL, MAP_H, MAP_W, PAL, PEKANBARU, SINGAPORE, SUMSEL,
  getWorld, v3, wx, wz,
} from "./world.ts";

const PITCH = 0.78; // camera looks down ~45°

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const push = frame * 0.004;
  const target = new THREE.Vector3(wx(102.85), 0, wz(0.95));
  const d = 11.8 - push;
  cam.fov = 38;
  cam.near = 0.1;
  cam.far = 60;
  cam.position.set(target.x - 0.25, target.y + d * Math.sin(PITCH), target.z + d * Math.cos(PITCH));
  cam.lookAt(target);
  cam.updateProjectionMatrix();
  return null;
};

// ---------- textures ----------
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
const radial = (rgb: string, a: number) =>
  canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(0.45, `rgba(${rgb},${a * 0.45})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

// ---------- table + map ----------
const Table: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex(1024, 1024, (c) => {
        c.fillStyle = "#2a2018";
        c.fillRect(0, 0, 1024, 1024);
        const rnd = prng(31);
        for (let i = 0; i < 260; i++) {
          const y = rnd() * 1024;
          c.strokeStyle = `rgba(${rnd() < 0.5 ? "12,8,5" : "70,52,36"},${0.08 + rnd() * 0.18})`;
          c.lineWidth = 1 + rnd() * 5;
          c.beginPath();
          c.moveTo(0, y);
          for (let x = 0; x <= 1024; x += 64) c.lineTo(x, y + Math.sin(x * 0.004 + i) * 6);
          c.stroke();
        }
      }),
    [],
  );
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial map={tex} roughness={0.55} clearcoat={0.35} clearcoatRoughness={0.4} />
    </mesh>
  );
};

const PaperMap: React.FC = () => {
  const { tex, geo } = getWorld();
  const grain = useSurfaceGrain(55, 0.3, 6);
  return (
    <group>
      {/* mounting board under the paper */}
      <mesh position={[0, -0.018, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[MAP_W + 0.16, 0.024, MAP_H + 0.16]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.paper} color="#3b2f25" />
      </mesh>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} />
      </mesh>
    </group>
  );
};

// ---------- border dashes (raised) ----------
const BorderDashes: React.FC<{ pts: [number, number][]; dash: number; gap: number; w: number }> = ({ pts, dash, gap, w }) => {
  const mats = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => new THREE.Vector3(wx(lo), 0, wz(la))), false, "centripetal");
    const len = curve.getLength();
    const n = Math.floor(len / (dash + gap));
    return Array.from({ length: n }, (_, i) => {
      const t = ((i + 0.5) * (dash + gap)) / len;
      const p = curve.getPointAt(Math.min(1, t));
      const d = curve.getTangentAt(Math.min(1, t));
      return { p, rot: Math.atan2(-d.z, d.x) };
    });
  }, [pts, dash, gap]);
  return (
    <group>
      {mats.map(({ p, rot }, i) => (
        <mesh key={i} position={[p.x, 0.014, p.z]} rotation={[0, rot, 0]} castShadow>
          <RoundedBoxGeo args={[dash, 0.016, w]} radius={0.006} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={PAL.border} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- smoke (soft billboard puffs, three density layers) ----------
// Facts: BMKG [18] Pekanbaru smoke came from Sumsel, Jambi and Bengkulu; BBC [1] Malaysia's haze from
// "Sumatra and Kalimantan". So the feeders converge into a broad Riau haze blanket, and the Malaysia and
// Singapore branches leave from that blanket (plus a faint Kalimantan inflow), not as one line from Sumsel.
type LL = [number, number];
const FEEDERS: LL[][] = [
  [[105.0, -3.35], [104.4, -2.6], [103.8, -1.8], [103.1, -0.95], [102.35, -0.2], [101.75, 0.45]], // Sumsel
  [[103.55, -1.6], [103.0, -1.15], [102.4, -0.55], [101.9, 0.2]], // Jambi
  [[102.3, -3.65], [101.95, -2.5], [101.65, -1.2], [101.5, 0.15]], // Bengkulu
];
const BRANCH_MY: LL[] = [[101.25, 1.45], [101.55, 2.0], [101.85, 2.5], [102.0, 2.85]];
const BRANCH_SG: LL[] = [[102.55, 1.0], [103.05, 1.05], [103.45, 1.17], [103.7, 1.28]];
const BRANCH_KAL: LL[] = [[107.4, 0.55], [106.5, 0.95], [105.5, 1.35], [104.65, 1.62]];
const BLANKET = { c: [101.75, 0.8] as LL, rx: 1.05, ry: 0.95 };

const routeCurve = (route: LL[], lift: number) =>
  new THREE.CatmullRomCurve3(route.map(([lo, la]) => v3(lo, la, lift)), false, "centripetal");

const puffTexture = () =>
  canvasTex(256, 256, (c) => {
    const rnd = prng(808);
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 46;
      const x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, r = 40 + rnd() * 48;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.32)");
      g.addColorStop(0.6, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 256);
    }
  });

type Puff = { p: THREE.Vector3; s: number; rot: number; shade: number };
const buildPuffs = (frame: number, layer: number): Puff[] => {
  const rnd = prng(1000 + layer * 17);
  const out: Puff[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const sizeK = [1.7, 2.6, 3.8][layer];
  const lift = [0.08, 0.16, 0.26][layer];
  const stream = (route: LL[], n: number, w0: number, w1: number, shade0: number, shade1: number, tMax = 1) => {
    const curve = routeCurve(route, lift);
    for (let i = 0; i < n; i++) {
      const t = ((rnd() + frame * 0.0012) % 1) * tMax;
      const p = curve.getPointAt(t);
      const side = new THREE.Vector3().crossVectors(curve.getTangentAt(t), up).normalize();
      const w = w0 + (w1 - w0) * t;
      p.addScaledVector(side, (rnd() - 0.5) * 2 * w * 0.6);
      p.y += rnd() * 0.05 * (layer + 1);
      out.push({ p, s: w * sizeK * (0.7 + rnd() * 0.6), rot: rnd() * 6.28, shade: shade0 + (shade1 - shade0) * t + (rnd() - 0.5) * 0.15 });
    }
  };
  const n = [1, 0.6, 0.3][layer];
  stream(FEEDERS[0], Math.round(150 * n), 0.07, 0.2, 0.15, 0.5);
  stream(FEEDERS[1], Math.round(70 * n), 0.06, 0.15, 0.2, 0.5);
  stream(FEEDERS[2], Math.round(80 * n), 0.06, 0.16, 0.25, 0.5);
  for (let i = 0; i < Math.round(170 * n); i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
    const lon = BLANKET.c[0] + Math.cos(a) * r * BLANKET.rx + Math.sin(frame * 0.02 + i) * 0.02;
    const lat = BLANKET.c[1] + Math.sin(a) * r * BLANKET.ry;
    out.push({ p: v3(lon, lat, lift + rnd() * 0.06), s: 0.3 * sizeK * (0.7 + rnd() * 0.6), rot: rnd() * 6.28, shade: 0.45 + rnd() * 0.25 });
  }
  stream(BRANCH_MY, Math.round(70 * n), 0.2, 0.1, 0.55, 0.8, 0.86);
  stream(BRANCH_SG, Math.round(60 * n), 0.16, 0.08, 0.55, 0.8, 0.84);
  stream(BRANCH_KAL, Math.round(40 * n), 0.1, 0.1, 0.75, 0.85, 0.9);
  return out;
};

const MAXP = 700;
const PuffLayer: React.FC<{ frame: number; layer: number }> = ({ frame, layer }) => {
  const tex = useMemo(() => puffTexture(), []);
  const puffs = useMemo(() => buildPuffs(frame, layer), [frame, layer]);
  const mesh = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: false, opacity: [0.85, 0.5, 0.26][layer],
    });
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, MAXP);
    m.renderOrder = 3 + layer * 0.1;
    m.frustumCulled = false;
    const col = new THREE.Color("#3f3933");
    for (let i = 0; i < MAXP; i++) m.setColorAt(i, col);
    m.instanceColor!.needsUpdate = true;
    return m;
  }, [tex, layer]);
  useMemo(() => {
    const o = new THREE.Object3D();
    const dark = new THREE.Color("#3f3933"), light = new THREE.Color("#e2ddd4");
    const col = new THREE.Color();
    mesh.count = Math.min(MAXP, puffs.length);
    for (let i = 0; i < mesh.count; i++) {
      const pf = puffs[i];
      o.position.copy(pf.p);
      o.rotation.set(-PITCH * 0.95, 0, 0);
      o.rotateZ(pf.rot);
      o.scale.set(pf.s, pf.s, pf.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, col.copy(dark).lerp(light, Math.min(1, Math.max(0, pf.shade + layer * 0.12))));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
  }, [mesh, puffs, layer]);
  return <primitive object={mesh} />;
};

const SmokeArrow: React.FC<{ frame: number }> = ({ frame }) => {
  const heads = useMemo(
    () =>
      ([[BRANCH_MY, 0.42], [BRANCH_SG, 0.34], [BRANCH_KAL, 0.26]] as [LL[], number][]).map(([r, size]) => {
        const c = routeCurve(r, 0.08);
        const p = c.getPointAt(1);
        const d = c.getTangentAt(0.95);
        return { p, rot: Math.atan2(-d.z, d.x), size };
      }),
    [],
  );
  const headGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.5, 0); s.lineTo(-0.5, 0.5); s.lineTo(-0.28, 0); s.lineTo(-0.5, -0.5); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 4 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return (
    <group>
      {heads.map((h, i) => (
        <group key={i} position={[h.p.x, h.p.y - 0.02, h.p.z]} rotation={[0, h.rot, 0]} scale={h.size}>
          <mesh geometry={headGeo} castShadow>
            <meshPhysicalMaterial {...POLISH.clay} color={i === 2 ? "#6d665e" : "#4a433c"} />
          </mesh>
        </group>
      ))}
      <PuffLayer frame={frame} layer={0} />
      <PuffLayer frame={frame} layer={1} />
      <PuffLayer frame={frame} layer={2} />
    </group>
  );
};

// Faint haze over Riau and the Strait of Malacca (very low opacity, large).
const Haze: React.FC<{ frame: number }> = ({ frame }) => {
  const tex = useMemo(() => radial("150,142,132", 0.5), []);
  const spots: [number, number, number][] = [
    [101.6, 0.9, 2.4], [102.6, 0.3, 2.0], [101.3, 2.3, 2.0], [102.4, 1.9, 1.8], [100.6, 1.4, 1.6], [103.4, 1.3, 1.6],
  ];
  return (
    <group>
      {spots.map(([lo, la, s], i) => {
        const p = v3(lo + Math.sin(frame * 0.02 + i) * 0.03, la, 0.32);
        return (
          <mesh key={i} position={p} rotation={[-PITCH * 0.95, 0, 0]} renderOrder={2}>
            <planeGeometry args={[s * 1.5, s]} />
            <meshBasicMaterial map={tex} transparent depthWrite={false} depthTest={false} opacity={0.42} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- fires ----------
const Fires: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = useMemo(() => radial("255,110,30", 0.9), []);
  const spots = useMemo(() => {
    const rnd = prng(404);
    const g = (c: [number, number], n: number, s: number) =>
      Array.from({ length: n }, () => [c[0] + (rnd() - 0.5) * s * 1.6, c[1] + (rnd() - 0.5) * s] as [number, number]);
    return [...g(SUMSEL, 9, 0.9), ...g(JAMBI, 6, 0.6), ...g([102.45, -3.55], 3, 0.4)].map((ll, i) => ({ p: v3(ll[0], ll[1], 0), k: 0.7 + rnd() * 0.6, i }));
  }, []);
  return (
    <group>
      {spots.map(({ p, k, i }) => {
        const fl = 1 + Math.sin(frame * 0.9 + i * 1.7) * 0.12;
        return (
          <group key={i} position={p}>
            <mesh position={[0, 0.045 * k * fl, 0]}>
              <coneGeometry args={[0.03 * k, 0.1 * k * fl, 10]} />
              <meshStandardMaterial color="#ff7a2a" emissive={PAL.fire} emissiveIntensity={4} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.03 * k, 0]}>
              <sphereGeometry args={[0.018 * k, 12, 10]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffc04a" emissiveIntensity={5} toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} renderOrder={4}>
              <planeGeometry args={[0.42 * k, 0.42 * k]} />
              <meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------- paper tags (3D, tilted to camera, cream halo) ----------
type TagSpec = { at: [number, number]; off: [number, number]; lift: number; title: string; sub?: string; w: number; accent?: string; big?: boolean };
const Tag: React.FC<TagSpec> = ({ at, off, lift, title, sub, w, accent, big }) => {
  const H = sub ? (big ? 0.82 : 0.42) : 0.34;
  const tex = useMemo(() => {
    const cw = 1024, ch = Math.round(1024 * (H / w));
    return canvasTex(cw, ch, (c) => {
      const pad = 26;
      // cream halo
      c.shadowColor = "rgba(244,234,210,0.95)";
      c.shadowBlur = 30;
      rr(c, pad, pad, cw - 2 * pad, ch - 2 * pad, 26);
      c.fillStyle = PAL.cream;
      c.fill();
      c.shadowBlur = 0;
      c.lineWidth = 6;
      c.strokeStyle = PAL.ink;
      rr(c, pad + 14, pad + 14, cw - 2 * pad - 28, ch - 2 * pad - 28, 16);
      c.stroke();
      c.fillStyle = PAL.ink;
      c.textAlign = "center";
      c.textBaseline = "middle";
      let titleSize = sub ? (big ? ch * 0.24 : ch * 0.3) : ch * 0.5;
      c.font = `600 ${titleSize}px ${FONT}`;
      (c as unknown as { letterSpacing: string }).letterSpacing = `${titleSize * 0.08}px`;
      while (c.measureText(title).width > cw - 2 * pad - 110) {
        titleSize *= 0.95;
        c.font = `600 ${titleSize}px ${FONT}`;
      }
      (c as unknown as { letterSpacing: string }).letterSpacing = `${titleSize * 0.08}px`;
      c.fillText(title, cw / 2, sub ? ch * (big ? 0.27 : 0.36) : ch / 2 + 2);
      if (sub) {
        const bh = ch * (big ? 0.4 : 0.3), by = ch * (big ? 0.46 : 0.52);
        c.fillStyle = accent ?? PAL.border;
        rr(c, pad + 40, by, cw - 2 * pad - 80, bh, 10);
        c.fill();
        c.fillStyle = "#fff6e6";
        let ss = bh * 0.66;
        c.font = `600 ${ss}px ${FONT}`;
        (c as unknown as { letterSpacing: string }).letterSpacing = `${ss * 0.04}px`;
        while (c.measureText(sub).width > cw - 2 * pad - 90) {
          ss *= 0.95;
          c.font = `600 ${ss}px ${FONT}`;
        }
        (c as unknown as { letterSpacing: string }).letterSpacing = `${ss * 0.04}px`;
        c.fillText(sub, cw / 2, by + bh / 2 + 2);
      }
    });
  }, [title, sub, w, H, accent, big]);
  const base = v3(at[0], at[1], 0);
  const pos = v3(at[0] + off[0], at[1] + off[1], lift);
  return (
    <group>
      {/* pin and stem from the place to the tag */}
      <mesh position={[base.x, base.y + 0.03, base.z]} castShadow>
        <sphereGeometry args={[0.035, 18, 14]} />
        <meshPhysicalMaterial color="#b8892f" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh
        position={[(base.x + pos.x) / 2, (base.y + pos.y - H * 0.35) / 2, (base.z + pos.z) / 2]}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(pos.x - base.x, pos.y - H * 0.35 - base.y, pos.z - base.z).normalize(),
        )}
        castShadow
      >
        <cylinderGeometry args={[0.006, 0.006, new THREE.Vector3(pos.x - base.x, pos.y - H * 0.35 - base.y, pos.z - base.z).length(), 6]} />
        <meshStandardMaterial color="#3a2f26" />
      </mesh>
      <mesh position={pos} rotation={[-PITCH * 0.72, 0, 0]} castShadow renderOrder={6}>
        <planeGeometry args={[w, H]} />
        <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const AtlasTag: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex(1024, 512, (c) => {
        c.fillStyle = "#c9a46a";
        c.beginPath();
        c.moveTo(150, 20); c.lineTo(1000, 20); c.lineTo(1000, 492); c.lineTo(150, 492); c.lineTo(20, 256); c.closePath();
        c.fill();
        c.strokeStyle = "rgba(60,40,20,0.8)";
        c.lineWidth = 8;
        c.setLineDash([18, 12]);
        c.beginPath();
        c.moveTo(165, 48); c.lineTo(972, 48); c.lineTo(972, 464); c.lineTo(165, 464); c.lineTo(52, 256); c.closePath();
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = "#1b1510";
        c.beginPath(); c.arc(130, 256, 34, 0, Math.PI * 2); c.fill();
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#2a1d12";
        c.font = `600 150px ${FONT}`;
        (c as unknown as { letterSpacing: string }).letterSpacing = "18px";
        c.fillText("AUDIRA", 590, 200);
        c.font = `500 74px ${FONT}`;
        (c as unknown as { letterSpacing: string }).letterSpacing = "30px";
        c.fillText("ATLAS", 590, 345);
      }),
    [],
  );
  const p = v3(105.15, -1.55, 0.2);
  return (
    <mesh position={p} rotation={[-0.62, 0.08, 0.06]} castShadow>
      <planeGeometry args={[1.05, 0.525]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.05} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------- scene ----------
const Scene: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <CameraRig frame={frame} />
    <ambientLight intensity={0.35} color="#ffe9cf" />
    <hemisphereLight args={["#fff1dc", "#2a2018", 0.45]} />
    <directionalLight
      position={[-4.5, 8, 3.5]}
      intensity={2.4}
      color="#ffe6c4"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-5}
      shadow-camera-right={5}
      shadow-camera-top={5}
      shadow-camera-bottom={-5}
    />
    <directionalLight position={[5, 3, -2]} intensity={0.45} color="#9fb8d6" />
    <pointLight position={[wx(104.6), 0.6, wz(-2.6)]} intensity={1.6} distance={2.6} color="#ff7a30" />
    <Table />
    <PaperMap />
    <BorderDashes pts={BORDER_MAIN} dash={0.07} gap={0.05} w={0.026} />
    <BorderDashes pts={BORDER_JOHOR} dash={0.04} gap={0.03} w={0.018} />
    <Fires frame={frame} />
    <SmokeArrow frame={frame} />
    <Haze frame={frame} />
    <Tag at={PEKANBARU} off={[-0.95, -1.3]} lift={0.36} title="PEKANBARU" sub="56 HARI BERASAP" w={1.6} big />
    <Tag at={SUMSEL} off={[-0.25, -1.0]} lift={0.22} title="SUMSEL" sub="TITIK API" w={0.72} accent="#c2410c" />
    <Tag at={JAMBI} off={[-0.95, -0.35]} lift={0.2} title="JAMBI" sub="TITIK API" w={0.66} accent="#c2410c" />
    <Tag at={KL} off={[-0.85, 0.1]} lift={0.26} title="MALAYSIA" w={1.2} />
    <Tag at={SINGAPORE} off={[0.75, 0.55]} lift={0.26} title="SINGAPURA" w={1.25} />
    <Tag at={[102.26, -3.8]} off={[-1.0, 0.75]} lift={0.18} title="BENGKULU" w={0.8} />
    <Tag at={[105.6, 1.25]} off={[-0.05, -0.5]} lift={0.2} title="DARI KALIMANTAN" w={1.0} />
    <AtlasTag />
    <Finish frame={frame} background={PAL.table} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} />
  </>
);

const Overlay: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 820,
        background: "linear-gradient(180deg, rgba(14,11,9,0.92) 0%, rgba(14,11,9,0.86) 66%, rgba(14,11,9,0) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, top: 200, color: "#f08a4b", fontSize: 30, fontWeight: 600, letterSpacing: 7 }}>
      AUDIRA · ASAP & ISPA
    </div>
    <div style={{ position: "absolute", left: 66, top: 262, color: "#f4ead2", fontSize: 138, fontWeight: 600, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
      ASAP TAK
      <br />
      KENAL BATAS
    </div>
    <div style={{ position: "absolute", left: 72, top: 552, width: 900, color: "#d9cdb4", fontSize: 34, fontWeight: 500, lineHeight: 1.3 }}>
      Asap karhutla menyelimuti Pekanbaru 56 hari, lalu menyeberang ke Malaysia dan Singapura
    </div>
    <div
      style={{
        position: "absolute", left: 60, top: 1466, display: "flex", gap: 30, alignItems: "center",
        padding: "16px 26px", background: "rgba(20,16,12,0.78)", borderRadius: 14, color: "#efe4cc", fontSize: 27, fontWeight: 500,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 18, height: 18, borderRadius: 9, background: "#ff6a24", boxShadow: "0 0 12px #ff6a24" }} />
        titik api
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 46, height: 12, borderRadius: 6, background: "#6f6861" }} />
        arah asap
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 50, height: 0, borderTop: "6px dashed #c0393e" }} />
        batas negara
      </span>
    </div>
  </div>
);

export const Ep05Cover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage3D background={PAL.table} overlay={() => <Overlay />}>
      <Scene frame={frame} />
    </Stage3D>
  );
};
