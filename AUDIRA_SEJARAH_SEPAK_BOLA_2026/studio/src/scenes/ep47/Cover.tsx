// EP47 cover — Grande Torino, Superga 1949 (WORLDFORGE). Superga hill in late-afternoon mist above
// the Turin plain, the basilica on the summit (catalog GLB), the Alps in haze behind; on the near
// ridge a stone memorial with 18 candles, a granata scarf and a 1949 leather ball. Respectful:
// no aircraft, fire or victims.

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";
import { FX_LAYER, Stage, type Look, type ShadowBox, type Shot } from "../../kits/worldforge/Stage.tsx";
import { SkyDome, useSkyEnvironment, type SkyColors } from "../../kits/worldforge/Sky.tsx";
import { gridGeometry } from "../../kits/worldforge/terrainMesh.ts";
import { inside } from "../../kits/worldforge/heightfield.ts";
import { makeTerrainMaterial } from "../../kits/worldforge/surface.ts";
import { box, cyl, sphere } from "../../kits/worldforge/geo.ts";
import { fbm, mulberry32 } from "../../kits/worldforge/noise.ts";
import { GlbLive } from "./GlbLive.tsx";
import { CAM_POS, CAM_TARGET, FACE_YAW, FWD, MEMORIAL, RIGHT, SUMMIT, SUN, getTerrain } from "./world.ts";
import { PITCH_C } from "./set.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });
const { fontFamily: PLAYFAIR } = loadPlayfair("italic", { weights: ["600"] });

export const GRANATA = "#7a1a2a";
export const GOLD = "#f2c46d";
export const PITCH = "#3ad47a";
export const CREAM = "#f6efe2";

export const SKY: SkyColors = { zenith: "#56709a", horizon: "#f0c99c", glow: "#ff9a50", halo: "#fff0d8", ground: "#6d6a52", sunDisk: 0 };
const S = { castShadow: true, receiveShadow: true } as const;

// ── Terrain ──────────────────────────────────────────────────────────────────
export const Terrain: React.FC = React.memo(() => {
  const meshes = useMemo(() => {
    const t = getTerrain();
    const { material } = makeTerrainMaterial();
    const near = new Mesh(gridGeometry(t.near), material);
    const ng = t.near.grid;
    const far = new Mesh(gridGeometry({ ...t.far, skip: (x0, z0, x1, z1) => inside(ng, x0, z0, 2) && inside(ng, x1, z1, 2) }), material);
    for (const m of [near, far]) m.receiveShadow = true;
    return [near, far];
  }, []);
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
});

// ── Trees on the flanks, town on the plain ───────────────────────────────────
const m4 = new Matrix4(), q = new Quaternion(), up = new Vector3(0, 1, 0);
export const Scatter: React.FC = React.memo(() => {
  const { trees, town } = useMemo(() => {
    const t = getTerrain();
    const rnd = mulberry32(4549);
    // trees: cones on Superga's wooded flanks and on the slope below the overlook
    const treeMat = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.92 });
    const trees = new InstancedMesh(cyl(0, 1, 1, 7), treeMat, 1400);
    let n = 0;
    const greens = ["#3c4f25", "#4a5d2a", "#33471f", "#56662f"].map((c) => new Color(c));
    for (let i = 0; i < 6000 && n < 1400; i++) {
      const a = rnd() * Math.PI * 2, r = 46 + rnd() * 210;
      const x = SUMMIT.x + Math.cos(a) * r, z = SUMMIT.z + Math.sin(a) * r;
      const h = t.heightAt(x, z);
      if (h < 18 || h > 104) continue;
      if (Math.hypot(x - MEMORIAL.x, z - MEMORIAL.z) < 40) continue;
      if (fbm(x / 60, z / 60, 2) < -0.25) continue; // clearings
      const th = 8 + rnd() * 7, tr = 2.6 + rnd() * 1.8;
      m4.compose(new Vector3(x, h + th / 2 - 0.5, z), q.setFromAxisAngle(up, rnd() * 6.28), new Vector3(tr, th, tr));
      trees.setMatrixAt(n, m4);
      trees.setColorAt(n, greens[Math.floor(rnd() * greens.length)]);
      n++;
    }
    trees.count = n;
    trees.castShadow = true;
    trees.receiveShadow = true;
    // town: low blocks on the plain beyond the hill
    const townMat = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.85 });
    const town = new InstancedMesh(box(1, 1, 1, 0.06), townMat, 900);
    const tones = ["#d9c7a6", "#cfa77f", "#b9795a", "#e3d6bf", "#c4b08c"].map((c) => new Color(c));
    let k = 0;
    for (let i = 0; i < 8000 && k < 900; i++) {
      const a = rnd() * Math.PI * 2, r = 300 + Math.pow(rnd(), 0.7) * 1100;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (x * FWD.x + z * FWD.z < 60) continue; // only beyond the hill, never between camera and summit
      const h = t.heightAt(x, z);
      if (h > 16) continue;
      if (fbm(x / 260 + 7, z / 260, 3) < -0.05) continue; // districts, not a carpet
      const w = 7 + rnd() * 10, d = 7 + rnd() * 10, bh = 4 + rnd() * rnd() * 20;
      const rot = Math.round(rnd() * 3) * 0.4, tone = tones[Math.floor(rnd() * tones.length)];
      // keep the film's pitch + avenue clear (checked after every rnd() so the cover town is unchanged)
      const px = x - PITCH_C.x, pz = z - PITCH_C.z, along = px * RIGHT.x + pz * RIGHT.z;
      if (along > -320 && along < 400 && Math.abs(px * FWD.x + pz * FWD.z) < 150) continue;
      m4.compose(new Vector3(x, h + bh / 2 - 0.6, z), q.setFromAxisAngle(up, rot), new Vector3(w, bh, d));
      town.setMatrixAt(k, m4);
      town.setColorAt(k, tone);
      k++;
    }
    town.count = k;
    town.receiveShadow = true;
    return { trees, town };
  }, []);
  return (
    <>
      <primitive object={trees} />
      <primitive object={town} />
    </>
  );
});

// ── Mist sheets in the valley (FX layer: skipped by GTAO/DOF) ─────────────────
const mistTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const img = g.createImageData(512, 512);
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      const v = 0.5 + 0.5 * fbm(x / 70, y / 70, 5);
      const k = (y * 512 + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255;
      img.data[k + 3] = Math.max(0, Math.min(255, (v - 0.25) * 330));
    }
  g.putImageData(img, 0, 0);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(5, 5);
  return t;
};
/** `rise` lifts every sheet (world units), `thick` scales their opacity (film only; cover uses the defaults). */
export const Mist: React.FC<{ rise?: number; thick?: number }> = ({ rise = 0, thick = 1 }) => {
  const sheets = useMemo(() => {
    const tex = mistTexture();
    return [
      { y: 28, o: 0.22, c: "#f0d6b8" },
      { y: 58, o: 0.14, c: "#f3dcc0" },
      { y: 97, o: 0.24, c: "#f7e1c4" },
    ].map((s, i) => {
      const m = new MeshBasicMaterial({ color: s.c, map: tex, transparent: true, opacity: s.o, depthWrite: false, fog: false, side: DoubleSide });
      const mesh = new Mesh(new PlaneGeometry(3600, 3600), m);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = i * 0.7;
      mesh.position.set(0, s.y, 0);
      mesh.layers.set(FX_LAYER);
      mesh.renderOrder = 2 + i;
      return { mesh, y: s.y, o: s.o };
    });
  }, []);
  for (const s of sheets) {
    s.mesh.position.y = s.y + rise;
    (s.mesh.material as MeshBasicMaterial).opacity = Math.min(0.95, s.o * thick);
  }
  return (
    <>
      {sheets.map((s, i) => (
        <primitive key={i} object={s.mesh} />
      ))}
    </>
  );
};

// ── Basilica di Superga (catalog GLB, cream stone) ───────────────────────────
const tintStone = (m: MeshStandardMaterial) => {
  const l = m.color ? (m.color.r + m.color.g + m.color.b) / 3 : 0.7;
  m.map = null;
  m.color = new Color("#e8dcc4").multiplyScalar(0.72 + 0.4 * Math.min(1, l));
  m.roughness = 0.86;
  m.metalness = 0;
  m.needsUpdate = true;
};
export const Basilica: React.FC = () => {
  const y = getTerrain().heightAt(SUMMIT.x, SUMMIT.z);
  return <GlbLive id="domed-church-dcbe85" position={[SUMMIT.x, y - 0.4, SUMMIT.z]} rotation={[0, FACE_YAW + 0.55, 0]} height={54} tint={tintStone} />;
};

// ── Memorial on the overlook ─────────────────────────────────────────────────
const plaqueTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#cbbd9f";
  g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 2600; i++) {
    const x = (i * 7919) % 1024, y = (i * 104729) % 512, v = (i * 31) % 40;
    g.fillStyle = `rgba(${90 + v},${80 + v},${60 + v},0.18)`;
    g.fillRect(x, y, 2 + (i % 3), 2);
  }
  g.strokeStyle = "rgba(70,58,40,0.55)";
  g.lineWidth = 6;
  g.strokeRect(34, 34, 956, 444);
  const engrave = (text: string, y: number, size: number, spacing = 0) => {
    g.font = `bold ${size}px Georgia, 'Times New Roman', serif`;
    g.textAlign = "center";
    (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
    g.fillStyle = "rgba(255,248,230,0.55)";
    g.fillText(text, 514, y + 3);
    g.fillStyle = "#2e2216";
    g.fillText(text, 512, y);
  };
  engrave("GRANDE TORINO", 190, 96, 3);
  engrave("4 · V · 1949", 310, 84, 10);
  engrave("AUDIRA", 428, 58, 16);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const scarfTexture = () => {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = GRANATA;
  g.fillRect(0, 0, 2048, 160);
  g.fillStyle = "#f3ece0";
  g.fillRect(0, 16, 2048, 10);
  g.fillRect(0, 134, 2048, 10);
  g.font = "bold 78px Arial Black, Arial, sans-serif";
  g.textBaseline = "middle";
  for (let x = 40; x < 2048; x += 680) g.fillText("TORINO", x, 82);
  for (let x = 0; x < 2048; x += 4) {
    g.fillStyle = `rgba(0,0,0,${0.06 + ((x * 13) % 7) * 0.012})`;
    g.fillRect(x, 0, 2, 160);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = RepeatWrapping;
  return t;
};

/** Knitted scarf lying in a soft S on the grass, a fold lifting it here and there. */
const scarfGeometry = () => {
  const N = 90, W = 1.45;
  const P = (t: number) => new Vector3(-5.4 + 9.0 * t, 0.07 + 0.3 * Math.max(0, Math.sin(t * Math.PI * 2.6 + 0.6)) ** 3, 2.6 + 0.7 * Math.sin(t * Math.PI * 1.5));
  const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2);
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = P(t), d = P(Math.min(1, t + 0.01)).sub(P(Math.max(0, t - 0.01)));
    const side = new Vector3(-d.z, 0, d.x).normalize().multiplyScalar(W / 2);
    const tilt = 0.12 * Math.sin(t * 9);
    pos.set([p.x + side.x, p.y + tilt, p.z + side.z], i * 6);
    pos.set([p.x - side.x, p.y - tilt * 0.5, p.z - side.z], i * 6 + 3);
    uv.set([t * 1.6, 0, t * 1.6, 1], i * 4);
  }
  const idx: number[] = [];
  for (let i = 0; i < N; i++) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("uv", new BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

const ballTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#7a4a26";
  g.fillRect(0, 0, 1024, 512);
  // twelve leather panels (meridian strips), darker seams, a lace patch
  for (let i = 0; i < 12; i++) {
    const x = (i / 12) * 1024;
    g.fillStyle = i % 2 ? "rgba(40,20,8,0.12)" : "rgba(255,220,170,0.08)";
    g.fillRect(x, 0, 1024 / 12, 512);
    g.fillStyle = "rgba(30,14,4,0.7)";
    g.fillRect(x - 2, 0, 4, 512);
  }
  g.fillStyle = "rgba(30,14,4,0.75)";
  g.fillRect(0, 170, 1024, 4);
  g.fillRect(0, 338, 1024, 4);
  g.strokeStyle = "#e9d8b4";
  g.lineWidth = 6;
  for (let k = 0; k < 6; k++) {
    g.beginPath();
    g.moveTo(470, 210 + k * 18);
    g.lineTo(554, 210 + k * 18);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
};

/** `lit` = candles burning (0..18, fractional = the next flame growing); the cover shows all 18. */
export const Memorial: React.FC<{ lit?: number }> = React.memo(({ lit = 18 }) => {
  const parts = useMemo(() => {
    const rnd = mulberry32(1949);
    const candles = Array.from({ length: 18 }, (_, i) => {
      const row = i < 10 ? 0 : 1;
      const j = row ? i - 10 : i, cnt = row ? 8 : 10;
      const a = Math.PI * (0.14 + (0.72 * (j + 0.5)) / cnt);
      const r = row ? 3.7 : 2.9;
      return { x: Math.cos(a) * r * 1.15, z: -1.4 + Math.sin(a) * r, h: 0.45 + rnd() * 0.4 };
    });
    return {
      candles,
      plaque: new MeshStandardMaterial({ map: plaqueTexture(), roughness: 0.82 }),
      stone: new MeshStandardMaterial({ color: "#b9aa8b", roughness: 0.9 }),
      wax: new MeshStandardMaterial({ color: "#f3e8d2", roughness: 0.55, emissive: new Color("#ffb060"), emissiveIntensity: 0.12 }),
      flame: new MeshBasicMaterial({ color: new Color(7, 3.6, 1.3) }),
      scarf: new MeshStandardMaterial({ map: scarfTexture(), roughness: 0.95, side: DoubleSide }),
      scarfGeo: scarfGeometry(),
      ball: new MeshStandardMaterial({ map: ballTexture(), roughness: 0.62 }),
    };
  }, []);
  const y = getTerrain().heightAt(MEMORIAL.x, MEMORIAL.z);
  return (
    <group position={[MEMORIAL.x, y, MEMORIAL.z]} rotation={[0, FACE_YAW, 0]}>
      {/* stone slab, slightly leaning back, with its engraved face */}
      <group position={[0, 0, -1.6]} rotation={[-0.1, 0.06, 0]}>
        <mesh geometry={box(6.6, 0.6, 1.5, 0.12)} material={parts.stone} position={[0, 0.35, 0]} {...S} />
        <mesh geometry={box(5.9, 2.9, 0.55, 0.1)} material={parts.stone} position={[0, 2.0, 0]} {...S} />
        <mesh position={[0, 2.0, 0.285]} material={parts.plaque} receiveShadow>
          <planeGeometry args={[5.55, 2.65]} />
        </mesh>
      </group>
      {parts.candles.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh geometry={cyl(0.17, 0.19, c.h, 18)} material={parts.wax} position={[0, c.h / 2, 0]} {...S} />
          {lit > i && <mesh geometry={sphere(0.1, 12, 8)} material={parts.flame} position={[0, c.h + 0.16, 0]} scale={[0.8 * Math.min(1, lit - i), 2 * Math.min(1, lit - i), 0.8 * Math.min(1, lit - i)]} />}
        </group>
      ))}
      <pointLight position={[0, 1.3, 0.6]} color="#ffb260" intensity={(40 * Math.min(18, lit)) / 18} distance={16} decay={2} />
      <mesh geometry={parts.scarfGeo} material={parts.scarf} {...S} />
      <mesh geometry={sphere(0.8, 48, 24)} material={parts.ball} position={[4.7, 0.8, 1.0]} rotation={[0.3, 0.9, 0.2]} {...S} />
    </group>
  );
});

// ── Scene ────────────────────────────────────────────────────────────────────
export const SHADOW_BOX: ShadowBox = { min: [-240, 0, -90], max: [90, 200, 260], mapWidth: 4096, sun: SUN };

const Scene: React.FC<{ frame: number }> = ({ frame }) => {
  const env = useSkyEnvironment(SUN, SKY, 0.85);
  const shot: Shot = { pos: CAM_POS, target: CAM_TARGET, fov: 40, near: 0.5, far: 30000 };
  const look: Look = {
    sun: SUN,
    sunColor: "#ffc786",
    sunI: 5.4,
    exposure: 1.0,
    fog: { color: SKY.horizon, density: 0.00034 },
    background: SKY.horizon,
    environment: env,
    envIntensity: 0.55,
    ao: 0.8,
    bloom: 0.14,
    haze: 0,
    hazeFlow: 0,
    hazeColor: "#ffffff",
    vignette: 0.2,
  };
  return (
    <Stage shot={shot} look={look} shadowBox={SHADOW_BOX} frame={frame}>
      <SkyDome sun={SUN} colors={SKY} />
      <Terrain />
      <Scatter />
      <Basilica />
      <Memorial />
      <Mist />
    </Stage>
  );
};

// ── Text overlay ─────────────────────────────────────────────────────────────
const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(14,10,14,0.86) 0%, rgba(14,10,14,0.66) 22%, rgba(14,10,14,0.18) 36%, rgba(14,10,14,0) 44%, rgba(14,10,14,0) 80%, rgba(14,10,14,0.45) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2 }}>
        <div style={{ background: PITCH, color: "#0b1a10", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(10,8,10,0.92)", color: GOLD, padding: "8px 16px" }}>#47</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: CREAM, border: `2px solid ${GOLD}`, borderRadius: 8, padding: "6px 12px" }}>4 MEI 1949</div>
    </div>
    <div style={{ position: "absolute", left: 58, right: 58, top: 276, fontFamily: ANTON, color: CREAM, lineHeight: 0.98, textShadow: "0 8px 30px rgba(0,0,0,0.7)" }}>
      <div style={{ fontSize: 142, letterSpacing: 1 }}>TIM TERBAIK</div>
      <div style={{ fontSize: 142, letterSpacing: 1 }}>
        YANG <span style={{ color: GOLD }}>HILANG</span>
      </div>
      <div style={{ marginTop: 18, display: "inline-block", fontFamily: PLAYFAIR, fontStyle: "italic", fontWeight: 600, fontSize: 46, lineHeight: 1.2, color: CREAM, background: GRANATA, padding: "6px 22px 10px", borderRadius: 6 }}>
        Grande Torino: 5 scudetto beruntun
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: SKY.horizon }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true }} camera={{ fov: 40, near: 0.5, far: 30000, position: CAM_POS }}>
        <Scene frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
