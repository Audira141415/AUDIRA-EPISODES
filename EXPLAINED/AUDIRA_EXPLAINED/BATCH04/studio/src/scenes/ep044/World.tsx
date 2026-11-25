// AE-044 film world (PRECISION). One persistent studio: hero phone at the origin (back +z), operator
// server rack above-behind it, QR card to the right, a 2x2 phone lineup far right. Everything is a pure
// function of the VO clock `t` (seconds); geometry is seeded. Cover parts are reused from Cover.tsx.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { Slab } from "../../core/geometry/slab.ts";
import { circuitBoard, prng } from "../../core/materials/textures.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FONT } from "../../core/type/fonts.ts";
import {
  BG, BOUNDARY, CH, CHIP, CW, NX, NY, PCB, PCB_TOP, PH, SIM, TEAL, TOP,
  bezier, canvasTex, inGold, Passives, radialTex, simShape, simTextures, TextPlate,
} from "./Cover.tsx";
import { B, CHIP_WORLD, LINEUP_POS, QR_POS, RACK_POS, SEC, backOut, clamp01, inOut, mix, outCubic, ramp, smooth, type V3 } from "./timing.ts";

const v3 = (p: V3) => new THREE.Vector3(...p);
const GOLD_C = new THREE.Color("#e8c27a");
const TEAL_C = new THREE.Color(TEAL);

// ---------- shared textures ----------
const useCanvas = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, deps: unknown[] = []) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => canvasTex(w, h, draw), deps);

const font = (g: CanvasRenderingContext2D, weight: number | string, px: number, fam = FONT) => {
  g.font = `${weight} ${px}px ${fam}`;
};

// ---------- backdrop: graphite gradient sphere ----------
export const Backdrop: React.FC = () => {
  const tex = useCanvas(64, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#0c0e12");
    gr.addColorStop(0.38, "#1e232b");
    gr.addColorStop(0.52, "#2a3039");
    gr.addColorStop(0.7, "#14171c");
    gr.addColorStop(1, BG);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 512);
  });
  return (
    <mesh>
      <sphereGeometry args={[60, 32, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

export const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.12} color="#cfd8e6" />
    <directionalLight position={[4, 6, 6]} intensity={1.6} color="#ffffff" />
    <directionalLight position={[-5, 3, -4]} intensity={1.4} color="#9fc6ff" />
    <directionalLight position={[2, -4, 3]} intensity={0.35} color="#ffe9d0" />
    <directionalLight position={[-3, 1, 5]} intensity={0.5} color="#e8eef8" />
  </>
);

// ---------- phone ----------
type ScreenMode = "off" | "esim" | "face" | "lineupYes" | "lineupNo";

const useScreenTextures = () =>
  useMemo(() => {
    const W = 512, H = 1080;
    const base = (g: CanvasRenderingContext2D) => {
      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, "#10151c");
      gr.addColorStop(1, "#06080b");
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
    };
    const esim = canvasTex(W, H, (g) => {
      base(g);
      g.fillStyle = "#eef3f6";
      font(g, 600, 54);
      g.fillText("eSIM", 40, 190);
      g.fillStyle = "rgba(200,212,220,0.6)";
      font(g, 400, 24);
      g.fillText("Seluler", 40, 232);
      const row = (y: number, a: string, b: string, on: boolean) => {
        g.fillStyle = "rgba(255,255,255,0.06)";
        g.beginPath();
        g.roundRect(32, y, W - 64, 120, 26);
        g.fill();
        g.fillStyle = "#eef3f6";
        font(g, 600, 30);
        g.fillText(a, 60, y + 52);
        g.fillStyle = "rgba(200,212,220,0.65)";
        font(g, 400, 22);
        g.fillText(b, 60, y + 88);
        g.fillStyle = on ? TEAL : "rgba(255,255,255,0.18)";
        g.beginPath();
        g.roundRect(W - 150, y + 40, 86, 44, 22);
        g.fill();
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(on ? W - 86 : W - 128, y + 62, 17, 0, Math.PI * 2);
        g.fill();
      };
      row(300, "Profil 1", "Operator A · aktif", true);
      row(440, "Profil 2", "Operator B · nonaktif", false);
      g.strokeStyle = "rgba(79,240,216,0.6)";
      g.lineWidth = 3;
      g.setLineDash([12, 10]);
      g.beginPath();
      g.roundRect(32, 590, W - 64, 120, 26);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = TEAL;
      font(g, 500, 26);
      g.fillText("+ Tambah eSIM", 60, 660);
    });
    const face = canvasTex(W, H, (g) => {
      base(g);
      g.fillStyle = "#eef3f6";
      font(g, 600, 40);
      const cx = W / 2, cy = 520;
      // generic face icon (not a person): head ring, eyes, smile
      g.strokeStyle = "rgba(230,240,245,0.9)";
      g.lineWidth = 8;
      g.beginPath();
      g.ellipse(cx, cy, 120, 150, 0, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "rgba(230,240,245,0.9)";
      g.beginPath();
      g.arc(cx - 44, cy - 30, 12, 0, Math.PI * 2);
      g.arc(cx + 44, cy - 30, 12, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(cx, cy + 30, 50, 0.2 * Math.PI, 0.8 * Math.PI);
      g.stroke();
      // scan brackets
      g.strokeStyle = TEAL;
      g.lineWidth = 10;
      const r = 200;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        g.beginPath();
        g.moveTo(cx + sx * r, cy + sy * (r - 60));
        g.lineTo(cx + sx * r, cy + sy * r);
        g.lineTo(cx + sx * (r - 60), cy + sy * r);
        g.stroke();
      }
      g.fillStyle = "rgba(200,212,220,0.75)";
      font(g, 400, 26);
      g.textAlign = "center";
      g.fillText("Pelanggan baru", cx, 820);
    });
    const plain = (ok: boolean) =>
      canvasTex(W, H, (g) => {
        base(g);
        g.textAlign = "center";
        g.fillStyle = ok ? TEAL : "rgba(200,212,220,0.35)";
        font(g, 700, 120);
        g.fillText("eSIM", W / 2, 560);
        g.strokeStyle = ok ? TEAL : "rgba(255,110,90,0.85)";
        g.lineWidth = 16;
        g.beginPath();
        if (ok) {
          g.moveTo(W / 2 - 70, 700);
          g.lineTo(W / 2 - 15, 755);
          g.lineTo(W / 2 + 85, 640);
        } else {
          g.moveTo(W / 2 - 60, 640);
          g.lineTo(W / 2 + 60, 760);
          g.moveTo(W / 2 + 60, 640);
          g.lineTo(W / 2 - 60, 760);
        }
        g.stroke();
      });
    return { esim, face, yes: plain(true), no: plain(false) };
  }, []);

const frameRingGeo = (hw: number, hh: number, r: number, wall: number, h: number) => {
  const rr = (s: THREE.Path | THREE.Shape, x: number, y: number, r0: number) => {
    s.moveTo(-x + r0, -y);
    s.lineTo(x - r0, -y);
    s.quadraticCurveTo(x, -y, x, -y + r0);
    s.lineTo(x, y - r0);
    s.quadraticCurveTo(x, y, x - r0, y);
    s.lineTo(-x + r0, y);
    s.quadraticCurveTo(-x, y, -x, y - r0);
    s.lineTo(-x, -y + r0);
    s.quadraticCurveTo(-x, -y, -x + r0, -y);
  };
  const s = new THREE.Shape();
  rr(s, hw, hh, r);
  const hole = new THREE.Path();
  rr(hole, hw - wall, hh - wall, r - wall);
  s.holes.push(hole);
  return new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 10 });
};

export type PhoneState = {
  lid: number; // 0 closed, 1 lifted away
  glow: number; // chip glow 0..1 (keep low in macro shots so the package reads)
  chipDrop: number; // 0 = hovering above the pad, 1 = soldered
  reflow: number; // solder flash 0..1
  ry: number; // extra yaw (pi = screen to camera)
  rz?: number;
  screen: ScreenMode;
  screenOn: number;
  scan: number; // face scan line 0..1, <0 hidden
  emptySlot: number; // dashed empty profile ghost
  stack: number; // profile stack rise 0..1
  active: [number, number]; // light of profile 1 and 2
  dim: number; // non-active profiles dim
  trayFlash: number;
  pos?: V3;
  scale?: number;
};

const PROFILE_NAMES = ["Operator A", "Operator B", "Operator C", "Operator D"];

const ProfileCard: React.FC<{ label: string; sub: string; light: number; dim: number; position: V3; opacity: number }> = ({ label, sub, light, dim, position, opacity }) => {
  const tex = useCanvas(512, 320, (g) => {
    g.clearRect(0, 0, 512, 320);
    g.fillStyle = "rgba(20,28,36,0.9)";
    g.beginPath();
    g.roundRect(4, 4, 504, 312, 36);
    g.fill();
    g.strokeStyle = "rgba(160,240,230,0.9)";
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = "#eef6f6";
    font(g, 600, 58);
    g.fillText(label, 36, 120);
    g.fillStyle = "rgba(200,220,225,0.8)";
    font(g, 400, 36);
    g.fillText(sub, 36, 186);
    g.fillStyle = "rgba(160,240,230,0.9)";
    g.fillRect(36, 236, 120, 10);
  }, [label, sub]);
  const c = new THREE.Color("#7e8a94").lerp(TEAL_C, light).multiplyScalar(mix(0.55 - dim * 0.3, 2.4, light));
  return (
    <group position={position} rotation={[-Math.PI / 2 + 0.0, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} layers={FX_LAYER}>
        <planeGeometry args={[0.28, 0.175]} />
        <meshBasicMaterial map={tex} color={c} transparent opacity={opacity} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const Phone: React.FC<{ s: PhoneState; f: number }> = ({ s, f }) => {
  const slab = useMemo(() => {
    const sl = new Slab();
    sl.update({ hw: PH.hw, hh: PH.hh, d: PH.d, rc: 0.2, reF: 0.035, reB: 0.05, seamZ: 0.0, seamDepth: 0.006, seamWidth: 0.02 });
    return sl;
  }, []);
  const lid = useMemo(() => {
    const sl = new Slab();
    sl.update({ hw: PH.hw - 0.004, hh: PH.hh - 0.004, d: 0.03, rc: 0.198, reF: 0.012, reB: 0.012 });
    return sl;
  }, []);
  const ring = useMemo(() => frameRingGeo(PH.hw, PH.hh, 0.2, 0.035, 0.07), []);
  const grain = useSurfaceGrain(31, 0.12, 4);
  const mats = useMemo(() => {
    const midplate = new THREE.MeshPhysicalMaterial({ color: "#2a2d33", metalness: 0.7, roughness: 0.48, roughnessMap: grain });
    const frame = new THREE.MeshPhysicalMaterial({ color: "#8e939b", metalness: 1, roughness: 0.26, clearcoat: 0.3 });
    const glassFront = new THREE.MeshPhysicalMaterial({ color: "#07080a", metalness: 0.1, roughness: 0.06, clearcoat: 1 });
    return { body: [midplate, frame, glassFront], frame };
  }, [grain]);
  const lidMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#39404b", metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, transparent: true }), []);
  const pcbTex = useMemo(() => {
    const t = circuitBoard(1024, 23);
    t.repeat.set(1.1, 1);
    return t;
  }, []);
  const batteryTex = useCanvas(512, 660, (g) => {
    g.fillStyle = "#1d2026";
    g.fillRect(0, 0, 512, 660);
    // graphite thermal sheet with fine diagonal texture
    g.strokeStyle = "rgba(255,255,255,0.025)";
    g.lineWidth = 2;
    for (let i = -660; i < 512; i += 9) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + 660, 660);
      g.stroke();
    }
    // printed label panel
    g.fillStyle = "#262a31";
    g.beginPath();
    g.roundRect(48, 190, 416, 300, 14);
    g.fill();
    g.strokeStyle = "rgba(170,180,190,0.35)";
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = "#b8c0c8";
    font(g, 500, 64);
    (g as unknown as { letterSpacing: string }).letterSpacing = "14px";
    g.textAlign = "center";
    g.fillText("AUDIRA", 256, 290);
    (g as unknown as { letterSpacing: string }).letterSpacing = "4px";
    g.fillStyle = "#7b848d";
    font(g, 400, 24);
    g.fillText("Li-ion", 256, 340);
    // abstract barcode + recycle-free generic marks
    const r = prng(55);
    let x = 120;
    while (x < 392) {
      const w = 2 + Math.floor(r() * 5);
      g.fillStyle = "#8a939c";
      g.fillRect(x, 380, w, 54);
      x += w + 2 + Math.floor(r() * 4);
    }
    g.fillStyle = "rgba(200,206,212,0.15)";
    g.fillRect(48, 560, 416, 6);
    g.fillRect(48, 100, 416, 6);
  });
  const chipTex = useCanvas(256, 214, (g) => {
    g.fillStyle = "#1b1d21";
    g.fillRect(0, 0, 256, 214);
    g.fillStyle = "rgba(190,196,204,0.75)";
    font(g, 500, 52);
    g.textAlign = "center";
    g.fillText("eUICC", 128, 118);
    g.fillStyle = "rgba(160,166,174,0.55)";
    font(g, 400, 24);
    g.fillText("MFF2", 128, 160);
    g.beginPath();
    g.arc(30, 30, 10, 0, Math.PI * 2);
    g.fill();
  });
  const halo = useMemo(() => radialTex("rgba(90,255,230,1)", "rgba(90,255,230,0)"), []);
  const scr = useScreenTextures();
  const screenMap = s.screen === "esim" ? scr.esim : s.screen === "face" ? scr.face : s.screen === "lineupYes" ? scr.yes : s.screen === "lineupNo" ? scr.no : null;
  const pulse = (f / 60) % 1;
  const shield = { color: "#c3c6cc", metalness: 1, roughness: 0.3 };
  const glowCol = new THREE.Color(TEAL).multiplyScalar(0.5 + 3.5 * s.glow);
  const [cx, cy, cz0] = CHIP.pos;
  const [w, h, d] = CHIP.size;
  const cz = cz0 + (1 - outCubic(s.chipDrop)) * 0.35;
  const lidK = inOut(s.lid);
  const reflowCol = new THREE.Color("#ff9a3c").multiplyScalar(3 * s.reflow);
  return (
    <group position={s.pos ?? [0, 0, 0]} rotation={[0, s.ry, s.rz ?? 0]} scale={s.scale ?? 1}>
      <mesh geometry={slab.geometry} material={mats.body} />
      <mesh geometry={ring} material={mats.frame} position={[0, 0, TOP - 0.004]} />
      {/* SIM tray on the left wall: closed, with ejector hole */}
      <group position={[-PH.hw - 0.001, 0.62, 0.0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[0.07, 0.46]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.0008]}>
          <planeGeometry args={[0.058, 0.448]} />
          <meshStandardMaterial color="#a7aeb7" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.17, 0.001]}>
          <circleGeometry args={[0.011, 20]} />
          <meshBasicMaterial color="#050506" />
        </mesh>
        {s.trayFlash > 0 ? (
          <mesh position={[0, 0, 0.002]} scale={[0.27, 1.36, 1]} layers={FX_LAYER}>
            <ringGeometry args={[0.235, 0.255, 4, 1, Math.PI / 4]} />
            <meshBasicMaterial color={new THREE.Color("#ffffff").multiplyScalar(2.5)} transparent opacity={s.trayFlash} toneMapped={false} depthWrite={false} />
          </mesh>
        ) : null}
      </group>
      {/* front screen (-z) */}
      {screenMap ? (
        <mesh position={[0, 0, -PH.d / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PH.hw * 2 - 0.12, PH.hh * 2 - 0.12]} />
          <meshBasicMaterial map={screenMap} color={new THREE.Color(1, 1, 1).multiplyScalar(0.25 + 0.75 * s.screenOn)} toneMapped={false} />
        </mesh>
      ) : null}
      {s.scan >= 0 && screenMap ? (
        <mesh position={[0, mix(0.55, -0.35, s.scan), -PH.d / 2 - 0.006]} rotation={[0, Math.PI, 0]} layers={FX_LAYER}>
          <planeGeometry args={[1.1, 0.012]} />
          <meshBasicMaterial color={new THREE.Color(TEAL).multiplyScalar(3)} transparent opacity={0.9} toneMapped={false} depthWrite={false} />
        </mesh>
      ) : null}
      {/* mainboard */}
      <mesh position={[...PCB.pos]}>
        <RoundedBoxGeo args={[...PCB.size]} radius={0.012} segments={2} />
        <meshPhysicalMaterial map={pcbTex} color="#5f6b66" roughness={0.42} metalness={0.25} clearcoat={0.35} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0.24, 0.84, PCB_TOP + 0.02]}>
        <RoundedBoxGeo args={[0.5, 0.42, 0.04]} radius={0.01} segments={2} />
        <meshPhysicalMaterial {...shield} />
      </mesh>
      <mesh position={[0.24, 0.39, PCB_TOP + 0.017]}>
        <RoundedBoxGeo args={[0.38, 0.24, 0.034]} radius={0.01} segments={2} />
        <meshPhysicalMaterial {...shield} roughness={0.36} />
      </mesh>
      <TextPlate text="MODEM" w={0.2} h={0.045} color="#5d636b" font={FONT} weight="600" spacing="4px" position={[0.24, 0.39, PCB_TOP + 0.0345]} opacity={0.8} />
      <Passives />
      {/* solder pads on the board (always there) */}
      {[-1, 1].map((sgn) =>
        [-0.032, -0.011, 0.011, 0.032].map((py) => (
          <mesh key={`p${sgn}${py}`} position={[cx + sgn * (w / 2 - 0.004), cy + py, PCB_TOP + 0.0015]}>
            <boxGeometry args={[0.028, 0.013, 0.003]} />
            <meshStandardMaterial color="#d6d8dc" metalness={1} roughness={0.25} emissive={reflowCol} />
          </mesh>
        )),
      )}
      {/* eUICC package: black epoxy, laser-marked top */}
      <mesh position={[cx, cy, cz]}>
        <RoundedBoxGeo args={[w, h, d]} radius={0.004} segments={2} />
        <meshPhysicalMaterial color="#1b1d21" roughness={0.34} clearcoat={0.6} clearcoatRoughness={0.25} metalness={0} />
      </mesh>
      <mesh position={[cx, cy, cz + d / 2 + 0.0006]}>
        <planeGeometry args={[w * 0.92, h * 0.92]} />
        <meshStandardMaterial map={chipTex} roughness={0.4} />
      </mesh>
      {/* glow: edge light + halo + pulse rings (scaled by glow) */}
      {s.glow > 0.01 ? (
        <>
          {[
            [0, h / 2 + 0.004, w + 0.016, 0.004],
            [0, -h / 2 - 0.004, w + 0.016, 0.004],
            [w / 2 + 0.004, 0, 0.004, h + 0.016],
            [-w / 2 - 0.004, 0, 0.004, h + 0.016],
          ].map(([ox, oy, sx, sy], i) => (
            <mesh key={i} position={[cx + ox, cy + oy, cz - d / 2 + 0.002]}>
              <boxGeometry args={[sx, sy, 0.004]} />
              <meshBasicMaterial color={glowCol} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[cx, cy, PCB_TOP + 0.003]} layers={FX_LAYER}>
            <planeGeometry args={[0.6, 0.6]} />
            <meshBasicMaterial map={halo} transparent opacity={0.3 * s.glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          {[0, 0.5].map((o) => {
            const p = (pulse + o) % 1;
            return (
              <mesh key={o} position={[cx, cy, PCB_TOP + 0.004]} layers={FX_LAYER}>
                <ringGeometry args={[0.09 + p * 0.3, 0.096 + p * 0.3, 64]} />
                <meshBasicMaterial color={TEAL} transparent opacity={(1 - p) * 0.55 * s.glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
            );
          })}
          <pointLight position={[cx, cy, cz + 0.25]} color={TEAL} intensity={1.6 * s.glow} distance={1.4} decay={2} />
        </>
      ) : null}
      {/* empty profile slot above the chip (dashed ghost) */}
      {s.emptySlot > 0.01 ? <EmptySlot position={[cx, cy + 0.2, cz0 + 0.08]} opacity={s.emptySlot} /> : null}
      {/* profile stack */}
      {s.stack > 0.01
        ? PROFILE_NAMES.map((n, i) => {
            const k = backOut(clamp01(s.stack * 1.6 - i * 0.2));
            const light = i === 0 ? s.active[0] : i === 1 ? s.active[1] * 0.75 : 0;
            return (
              <ProfileCard key={n} label={n} sub={i === 0 ? "nomormu" : "profil"} light={light} dim={s.dim} position={[cx + (3 - i) * 0.03 * k, cy + 0.02 + k * (0.06 + (3 - i) * 0.19), cz0 + 0.04 + k * (0.08 + (3 - i) * 0.03)]} opacity={clamp01(k)} />
            );
          })
        : null}
      {/* camera module */}
      <mesh position={[-0.37, 1.13, TOP + 0.07]}>
        <RoundedBoxGeo args={[0.46, 0.4, 0.14]} radius={0.04} segments={3} />
        <meshPhysicalMaterial color="#3a3e45" metalness={1} roughness={0.3} />
      </mesh>
      {[
        [-0.47, 1.22],
        [-0.27, 1.04],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, TOP + 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.072, 0.078, 0.03, 48]} />
            <meshPhysicalMaterial color="#9aa0a8" metalness={1} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.016, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.004, 48]} />
            <meshPhysicalMaterial color="#05070c" metalness={0.2} roughness={0.04} clearcoat={1} />
          </mesh>
        </group>
      ))}
      {/* battery with printed label (AUDIRA) and connector */}
      <mesh position={[0.02, -0.64, TOP + 0.036]}>
        <RoundedBoxGeo args={[1.22, 1.58, 0.07]} radius={0.03} segments={3} />
        <meshPhysicalMaterial color="#1c1f24" roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.35} roughnessMap={grain} />
      </mesh>
      <mesh position={[0.02, -0.64, TOP + 0.0715]}>
        <planeGeometry args={[1.14, 1.47]} />
        <meshPhysicalMaterial map={batteryTex} roughness={0.55} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      <mesh position={[0.32, 0.1, TOP + 0.075]}>
        <RoundedBoxGeo args={[0.16, 0.08, 0.02]} radius={0.006} segments={2} />
        <meshPhysicalMaterial color="#c3c6cc" metalness={1} roughness={0.32} />
      </mesh>
      {[-0.3, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.17, TOP + 0.068]}>
          <boxGeometry args={[0.1, 0.16, 0.006]} />
          <meshStandardMaterial color="#6e4419" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}
      {/* back glass: lifts straight up its normal, then slides away and fades */}
      {lidK < 0.999 ? (
        <group position={[mix(0, 1.9, smooth(ramp(lidK, 0.35, 1))), mix(0, 1.2, smooth(ramp(lidK, 0.35, 1))), TOP + 0.09 + mix(0, 0.7, outCubic(ramp(lidK, 0, 0.5)))]} rotation={[mix(0, -0.35, lidK), mix(0, 0.5, lidK), 0]}>
          <mesh geometry={lid.geometry} material={lidMat} material-opacity={1 - smooth(ramp(lidK, 0.55, 1))} />
          <TextPlate text="AUDIRA" w={0.62} h={0.11} color="#c8ced6" font={FONT} weight="300" spacing="22px" position={[0, -0.35, 0.017]} opacity={0.6 * (1 - smooth(ramp(lidK, 0.55, 1)))} />
          {/* camera window ring */}
          <mesh position={[-0.37, 1.13, 0.016]}>
            <ringGeometry args={[0.2, 0.235, 48]} />
            <meshStandardMaterial color="#9aa0a8" metalness={1} roughness={0.3} transparent opacity={1 - smooth(ramp(lidK, 0.55, 1))} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

const EmptySlot: React.FC<{ position: V3; opacity: number }> = ({ position, opacity }) => {
  const tex = useCanvas(512, 320, (g) => {
    g.clearRect(0, 0, 512, 320);
    g.strokeStyle = "rgba(220,235,240,0.9)";
    g.lineWidth = 7;
    g.setLineDash([22, 16]);
    g.beginPath();
    g.roundRect(8, 8, 496, 304, 36);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "rgba(220,235,240,0.85)";
    font(g, 600, 60);
    g.textAlign = "center";
    g.fillText("KOSONG", 256, 150);
    g.fillStyle = "rgba(200,212,220,0.7)";
    font(g, 400, 34);
    g.fillText("belum ada nomor", 256, 212);
  });
  return (
    <mesh position={position} layers={FX_LAYER}>
      <planeGeometry args={[0.22, 0.1375]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// ---------- SIM card (cover asset) with a dissolve amount ----------
export const SimCard: React.FC<{ pos: V3; rot: V3; scale: number; target: V3; f: number; flow: number }> = ({ pos, rot, scale, target, f, flow }) => {
  const tex = useMemo(() => simTextures(), []);
  const geo = useMemo(() => simShape(), []);
  const M = useMemo(() => new THREE.Matrix4().compose(v3(pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(scale, scale, scale)), [pos, rot, scale]);
  const frags = useMemo(() => {
    const r = prng(771);
    const list: { local: THREE.Vector3; k: number; rot: THREE.Euler; gold: boolean }[] = [];
    for (let j = 0; j < NY; j++)
      for (let i = BOUNDARY[j]; i < NX; i++) {
        const x = -SIM.w / 2 + (i + 0.5) * CW, y = -SIM.h / 2 + (j + 0.5) * CH;
        if (r() < 0.18) continue;
        list.push({ local: new THREE.Vector3(x, y, 0), k: i - BOUNDARY[j] + r() * 0.8, rot: new THREE.Euler(r() * 3, r() * 3, r() * 3), gold: inGold(x, y) });
      }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(CW * 0.92, CH * 0.92, SIM.d), new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.5 }), list.length);
    const gold = new THREE.Color("#d9b45f"), plastic = new THREE.Color("#e8e6e0");
    list.forEach((p, i) => im.setColorAt(i, p.gold ? gold : plastic));
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return { list, im };
  }, []);
  const start = new THREE.Vector3(SIM.w * 0.12, 0, 0).applyMatrix4(M);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const simQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
    const end = v3(target);
    const c1 = start.clone().lerp(end, 0.33).add(new THREE.Vector3(0, 0.25, 0.2));
    frags.list.forEach((p, i) => {
      const k = p.k;
      const base = p.local.clone().multiplyScalar(scale).applyMatrix4(new THREE.Matrix4().compose(v3(pos), simQ, new THREE.Vector3(1, 1, 1)));
      const tt = Math.min(0.16, k * 0.012);
      const along = bezier(start, c1, c1, end, tt).sub(start);
      const pp = base.add(along.multiplyScalar(Math.min(1, k * 0.35)));
      const spin = new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rot.x * k * 0.12, p.rot.y * k * 0.12, p.rot.z * k * 0.12));
      q.copy(simQ).multiply(spin);
      const sc = Math.max(0.35, 1 - k * 0.07) * scale;
      m.compose(pp, q, new THREE.Vector3(sc, sc, sc));
      frags.im.setMatrixAt(i, m);
    });
    frags.im.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <group position={pos} rotation={rot} scale={scale}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial map={tex.map} metalnessMap={tex.metal} roughnessMap={tex.rough} metalness={1} roughness={1} clearcoat={0.4} clearcoatRoughness={0.2} />
        </mesh>
      </group>
      {scale > 0.02 ? <primitive object={frags.im} /> : null}
      <Stream a={[start.x, start.y, start.z]} b={target} f={f} amount={flow} lift={0.6} seed={3301} count={300} />
    </>
  );
};

// ---------- generic data stream along a cubic curve a -> b ----------
export const Stream: React.FC<{ a: V3; b: V3; f: number; amount: number; lift?: number; seed?: number; count?: number; tube?: boolean; side?: V3 }> = ({ a, b, f, amount, lift = 0.6, seed = 11, count = 260, tube = true, side = [0, 0, 0.6] }) => {
  const A = v3(a), D = v3(b);
  const P1 = A.clone().lerp(D, 0.3).add(new THREE.Vector3(0, lift, 0)).add(v3(side));
  const P2 = A.clone().lerp(D, 0.75).add(new THREE.Vector3(0, lift * 0.6, 0)).add(v3(side).multiplyScalar(1.4));
  const data = useMemo(() => {
    const r = prng(seed);
    const items = Array.from({ length: count }, () => ({ s: Math.pow(r(), 0.85), j: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5), size: 0.6 + r() * 0.8, speed: 0.6 + r() * 0.6 }));
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), count);
    items.forEach((_, i) => im.setColorAt(i, TEAL_C));
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.layers.set(FX_LAYER);
    im.frustumCulled = false;
    return { items, im };
  }, [seed, count]);
  const len = A.distanceTo(D);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    let n = 0;
    data.items.forEach((it) => {
      const s = (it.s + (f / 60) * 0.12 * it.speed) % 1;
      if (s > amount * 1.05) return;
      const t = 0.04 + s * 0.96;
      const spread = 0.05 * len * Math.sin(Math.PI * Math.min(1, s * 1.15)) * (1 - s * 0.7);
      const p = bezier(A, P1, P2, D, t).add(it.j.clone().multiplyScalar(spread));
      const size = (0.03 - s * 0.022) * it.size * Math.min(1.4, 0.5 + len * 0.15);
      q.setFromEuler(new THREE.Euler(it.j.x * 6 + s * 4, it.j.y * 6, it.j.z * 6));
      m.compose(p, q, new THREE.Vector3(size, size, size));
      data.im.setMatrixAt(n, m);
      c.copy(GOLD_C).lerp(TEAL_C, Math.min(1, s * 4)).multiplyScalar(0.8 + s * 3.2);
      data.im.setColorAt(n, c);
      n++;
    });
    data.im.count = n;
    data.im.instanceMatrix.needsUpdate = true;
    if (data.im.instanceColor) data.im.instanceColor.needsUpdate = true;
  });
  const tubeGeo = useMemo(() => {
    const pts = Array.from({ length: 48 }, (_, i) => bezier(A, P1, P2, D, 0.04 + (i / 47) * 0.96));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.008 + len * 0.002, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.join(), b.join(), lift]);
  if (amount <= 0.001) return null;
  return (
    <>
      <primitive object={data.im} />
      {tube ? (
        <mesh geometry={tubeGeo} layers={FX_LAYER}>
          <meshBasicMaterial color={TEAL} transparent opacity={0.14 * Math.min(1, amount * 2)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
    </>
  );
};

// ---------- server rack (generic operator server) ----------
export const ServerRack: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const leds = useMemo(() => {
    const r = prng(808);
    const n = 8 * 10;
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
    const m = new THREE.Matrix4();
    const base: { phase: number; col: THREE.Color }[] = [];
    for (let u = 0; u < 8; u++)
      for (let k = 0; k < 10; k++) {
        const i = u * 10 + k;
        m.compose(new THREE.Vector3(-0.42 + k * 0.035, 1.05 - u * 0.29, 0.402), new THREE.Quaternion(), new THREE.Vector3(0.016, 0.016, 0.006));
        im.setMatrixAt(i, m);
        const col = r() > 0.8 ? new THREE.Color("#ffb347") : TEAL_C.clone();
        base.push({ phase: r(), col });
        im.setColorAt(i, col);
      }
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    return { im, base };
  }, []);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    leds.base.forEach((b, i) => {
      const on = Math.sin((f / 60) * 7 + b.phase * 40) > -0.2 ? 1 : 0.15;
      leds.im.setColorAt(i, c.copy(b.col).multiplyScalar(on * 2.2));
    });
    if (leds.im.instanceColor) leds.im.instanceColor.needsUpdate = true;
  });
  const prep = smooth(ramp(t, B.profil1 - 0.2, B.profil1 + 0.8));
  const lit = ramp(t, B.server1 - 0.1, B.server1 + 0.3);
  return (
    <group position={RACK_POS} scale={0.85}>
      <mesh>
        <RoundedBoxGeo args={[1.15, 2.6, 0.8]} radius={0.03} segments={3} />
        <meshPhysicalMaterial color="#202329" metalness={0.8} roughness={0.42} />
      </mesh>
      {Array.from({ length: 8 }, (_, u) => (
        <mesh key={u} position={[0, 1.05 - u * 0.29, 0.37]}>
          <RoundedBoxGeo args={[1.02, 0.25, 0.06]} radius={0.012} segments={2} />
          <meshPhysicalMaterial color={u === 3 ? new THREE.Color("#b8bec6").lerp(TEAL_C, lit * 0.4) : "#9da3ab"} metalness={1} roughness={0.34} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, u) =>
        Array.from({ length: 6 }, (_, k) => (
          <mesh key={`${u}-${k}`} position={[0.12 + k * 0.06, 1.05 - u * 0.29, 0.402]}>
            <boxGeometry args={[0.035, 0.14, 0.004]} />
            <meshStandardMaterial color="#1a1c20" roughness={0.8} />
          </mesh>
        )),
      )}
      <primitive object={leds.im} />
      <TextPlate text="SERVER OPERATOR" w={1.0} h={0.11} color="#d7dde4" font={FONT} weight="600" spacing="8px" position={[0, 1.42, 0.41]} opacity={0.9} />
      {/* the prepared profile slides out of unit 3 */}
      {prep > 0.01 ? (
        <group position={[mix(0, 0.15, prep), 1.05 - 3 * 0.29, 0.42 + prep * 0.45]} rotation={[0.0, 0, 0]}>
          <ProfileStanding label="Profil" sub="nomormu · Operator A" light={0.4 + 0.6 * lit} opacity={prep} />
        </group>
      ) : null}
    </group>
  );
};

const ProfileStanding: React.FC<{ label: string; sub: string; light: number; opacity: number }> = ({ label, sub, light, opacity }) => {
  const tex = useCanvas(640, 400, (g) => {
    g.clearRect(0, 0, 640, 400);
    g.fillStyle = "rgba(16,26,32,0.92)";
    g.beginPath();
    g.roundRect(4, 4, 632, 392, 40);
    g.fill();
    g.strokeStyle = "rgba(160,240,230,0.95)";
    g.lineWidth = 7;
    g.stroke();
    g.fillStyle = "#eef6f6";
    font(g, 600, 78);
    g.fillText(label, 44, 150);
    g.fillStyle = "rgba(200,220,225,0.85)";
    font(g, 400, 40);
    g.fillText(sub, 44, 230);
    g.fillStyle = "rgba(160,240,230,0.9)";
    g.fillRect(44, 300, 160, 12);
  }, [label, sub]);
  return (
    <mesh layers={FX_LAYER}>
      <planeGeometry args={[0.64, 0.4]} />
      <meshBasicMaterial map={tex} color={new THREE.Color(1, 1, 1).multiplyScalar(0.8 + light * 0.9)} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// ---------- QR card (illustrative pattern, not a real code) ----------
export const QRCard: React.FC<{ t: number }> = ({ t }) => {
  const tex = useCanvas(512, 512, (g) => {
    const N = 29, px = 512 / (N + 4);
    g.fillStyle = "#f4f5f2";
    g.fillRect(0, 0, 512, 512);
    const r = prng(2929);
    const finder = (x: number, y: number) => x < 8 && y < 8 ? [x, y] : x >= N - 8 && y < 8 ? [x - (N - 7), y] : x < 8 && y >= N - 8 ? [x, y - (N - 7)] : null;
    g.fillStyle = "#121315";
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const fd = finder(x, y);
        let on: boolean;
        if (fd) {
          const [fx, fy] = fd;
          if (fx > 6 || fy > 6 || fx < 0 || fy < 0) on = false;
          else on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
        } else on = r() > 0.52;
        if (on) g.fillRect((x + 2) * px, (y + 2) * px, px + 0.5, px + 0.5);
      }
  });
  const scan = ramp(t, B.pindai1 - 0.2, B.tidak1);
  const tilt = Math.sin(t * 0.7) * 0.05;
  const split = smooth(ramp(t, B.hanya1, B.alamat + 0.3));
  return (
    <group position={QR_POS} rotation={[0.05, -0.12 + tilt, 0]}>
      <mesh position={[0, 0, -0.012]}>
        <RoundedBoxGeo args={[0.86, 1.06, 0.02]} radius={0.008} segments={2} />
        <meshPhysicalMaterial color="#e9e8e3" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.08, 0.0]} scale={1 - split * 0.12}>
        <planeGeometry args={[0.74, 0.74]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      <TextPlate text="Pindai untuk pasang eSIM" w={0.7} h={0.06} color="#3a3d42" font={FONT} weight="500" spacing="1px" position={[0, -0.39, 0.002]} opacity={1} />
      {scan > 0 && scan < 1 ? (
        <mesh position={[0, mix(0.45, -0.29, scan), 0.01]} layers={FX_LAYER}>
          <planeGeometry args={[0.8, 0.012]} />
          <meshBasicMaterial color={new THREE.Color(TEAL).multiplyScalar(3)} toneMapped={false} transparent opacity={0.95} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------- handshake shields + locked packet ----------
const shieldGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.13);
  s.quadraticCurveTo(0.06, 0.1, 0.1, 0.1);
  s.lineTo(0.1, 0.0);
  s.quadraticCurveTo(0.1, -0.09, 0, -0.14);
  s.quadraticCurveTo(-0.1, -0.09, -0.1, 0.0);
  s.lineTo(-0.1, 0.1);
  s.quadraticCurveTo(-0.06, 0.1, 0, 0.13);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3 });
  g.translate(0, 0, -0.015);
  return g;
})();

export const Shield: React.FC<{ position: V3; ok: number; scale: number }> = ({ position, ok, scale }) => (
  <group position={position} scale={scale} rotation={[0, 0.25, 0]}>
    <mesh geometry={shieldGeo}>
      <meshPhysicalMaterial color={new THREE.Color("#c9ced6").lerp(TEAL_C, ok * 0.6)} metalness={1} roughness={0.25} clearcoat={0.5} emissive={new THREE.Color(TEAL).multiplyScalar(ok * 0.6)} />
    </mesh>
    {ok > 0.02 ? (
      <mesh position={[0, 0, 0.03]} layers={FX_LAYER}>
        <torusGeometry args={[0.2, 0.006, 8, 48, Math.PI * 2 * ok]} />
        <meshBasicMaterial color={new THREE.Color(TEAL).multiplyScalar(3)} toneMapped={false} />
      </mesh>
    ) : null}
  </group>
);

export const LockedPacket: React.FC<{ position: V3; open: number; scale: number; opacity?: number }> = ({ position, open, scale }) => (
  <group position={position} scale={scale}>
    <mesh>
      <RoundedBoxGeo args={[0.3, 0.3, 0.3]} radius={0.05} segments={3} />
      <meshPhysicalMaterial color="#1a3b40" roughness={0.12} metalness={0.1} clearcoat={1} transparent opacity={0.85} emissive={new THREE.Color(TEAL).multiplyScalar(0.25 + open * 1.2)} />
    </mesh>
    {/* padlock: body + shackle that lifts and turns when it opens */}
    <group position={[0, -0.02, 0.17]}>
      <mesh>
        <RoundedBoxGeo args={[0.15, 0.12, 0.05]} radius={0.015} segments={2} />
        <meshPhysicalMaterial color="#d9b45f" metalness={1} roughness={0.28} />
      </mesh>
      <group position={[0.04 * open, 0.06 + 0.05 * open, 0]} rotation={[0, open * 1.2, 0]}>
        <mesh position={[-0.04 * open, 0, 0]}>
          <torusGeometry args={[0.045, 0.012, 10, 24, Math.PI]} />
          <meshPhysicalMaterial color="#c3c6cc" metalness={1} roughness={0.25} />
        </mesh>
      </group>
      <mesh position={[0, -0.01, 0.026]}>
        <circleGeometry args={[0.014, 16]} />
        <meshBasicMaterial color="#1b1d21" />
      </mesh>
    </group>
  </group>
);

// ---------- lineup: not every phone supports eSIM ----------
export const Lineup: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const cells: { p: V3; ok: boolean; k: number }[] = [
    { p: [-0.56, 0.95, 0], ok: true, k: 0 },
    { p: [0.56, 0.95, 0], ok: false, k: 1 },
    { p: [-0.56, -1.0, 0], ok: false, k: 2 },
    { p: [0.56, -1.0, 0], ok: true, k: 3 },
  ];
  const reveal = (k: number) => ramp(t, B.tidak2 + k * 0.28, B.tidak2 + k * 0.28 + 0.35);
  const base: Omit<PhoneState, "screen" | "pos" | "scale"> = { lid: 1, glow: 0, chipDrop: 1, reflow: 0, ry: Math.PI, screenOn: 1, scan: -1, emptySlot: 0, stack: 0, active: [0, 0], dim: 0, trayFlash: 0 };
  return (
    <group position={LINEUP_POS}>
      {cells.map((c) => {
        const r = reveal(c.k);
        return (
          <Phone
            key={c.k}
            f={f}
            s={{ ...base, screen: r > 0 ? (c.ok ? "lineupYes" : "lineupNo") : "off", screenOn: r, pos: [c.p[0], c.p[1], c.p[2] + Math.sin(t * 1.3 + c.k) * 0.02], scale: 0.58 }}
          />
        );
      })}
    </group>
  );
};

export const chipWorld = (): V3 => CHIP_WORLD;
export { SEC };
