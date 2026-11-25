// The AUDIRA sign post beside the path: a painted board whose letters are laid on in several
// jittered brush passes (seeded), plus a pointer board to the lighthouse ("MERCUSUAR").

import React, { useMemo } from "react";
import * as THREE from "three";
import { paintMaterial } from "../lib/paint.ts";
import { PAINT } from "../lib/palette.ts";
import { prng } from "../../../core/materials/textures.ts";
import { hillY, SIGN } from "../core/motion.ts";
import { RoundedBoxGeo } from "../../../core/polish/Polish.tsx";

function boardTexture(text: string, sub: string | null, w: number, h: number, seed: number, ground: string) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const rnd = prng(seed);
  g.fillStyle = ground;
  g.fillRect(0, 0, w, h);
  // ground brushwork: horizontal strokes of slightly different paint
  for (let k = 0; k < 140; k++) {
    const y = rnd() * h, x = rnd() * w, len = 60 + rnd() * 160;
    const l = rnd() < 0.5 ? 255 : 0;
    g.strokeStyle = `rgba(${l},${l},${l},${0.04 + rnd() * 0.06})`;
    g.lineWidth = 6 + rnd() * 14;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + len / 2, y + (rnd() - 0.5) * 8, x + len, y + (rnd() - 0.5) * 6);
    g.stroke();
  }
  // a painted frame line
  g.strokeStyle = "rgba(246,230,196,0.55)";
  g.lineWidth = h * 0.025;
  g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
  // letters: several offset passes give a loaded-brush edge
  const fs = sub ? h * 0.46 : h * 0.6;
  g.font = `900 ${fs}px Georgia, 'Times New Roman', serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const ty = sub ? h * 0.42 : h * 0.53;
  for (let pass = 0; pass < 7; pass++) {
    const dx = (rnd() - 0.5) * fs * 0.035, dy = (rnd() - 0.5) * fs * 0.035;
    g.fillStyle = pass < 5 ? `rgba(246,230,196,${0.32 + pass * 0.08})` : PAINT.signPaint;
    g.fillText(text, w / 2 + dx, ty + dy);
  }
  // dry-brush breaks across the letters
  for (let k = 0; k < 70; k++) {
    g.strokeStyle = `rgba(47,91,102,${0.15 + rnd() * 0.2})`;
    g.lineWidth = 1.5 + rnd() * 3;
    const y = ty - fs * 0.45 + rnd() * fs * 0.9, x = rnd() * w;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 30 + rnd() * 60, y + (rnd() - 0.5) * 3);
    g.stroke();
  }
  if (sub) {
    g.font = `700 ${h * 0.15}px Georgia, 'Times New Roman', serif`;
    g.fillStyle = "rgba(246,230,196,0.85)";
    g.fillText(sub, w / 2, h * 0.79);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export const Sign3D: React.FC = () => {
  const base = hillY(SIGN.x, SIGN.z) - 0.05;
  const m = useMemo(() => {
    const board = boardTexture("AUDIRA", "LUKISAN BUKIT", 1024, 420, 17, PAINT.signBoard);
    const arrow = boardTexture("MERCUSUAR", null, 768, 180, 29, "#7A3A2A");
    return {
      wood: paintMaterial({ color: PAINT.signWood, stroke: 14, bands: 4, rim: 0.7, outline: 0.4, seed: 5 }),
      board: (() => {
        const mm = paintMaterial({ color: "#ffffff", stroke: 12, bands: 4, breakup: 0.22, rim: 0.4, outline: 0.25 });
        mm.map = board;
        return mm;
      })(),
      arrow: (() => {
        const mm = paintMaterial({ color: "#ffffff", stroke: 12, bands: 4, breakup: 0.22, rim: 0.4, outline: 0.25 });
        mm.map = arrow;
        return mm;
      })(),
    };
  }, []);
  return (
    <group position={[SIGN.x, base, SIGN.z]} rotation={[0, -0.38, 0]}>
      <mesh position={[0, 0.5, 0]} material={m.wood} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.07, 1.0, 0.07]} radius={0.012} />
      </mesh>
      {/* main board */}
      <mesh position={[0, 0.78, 0.045]} material={m.wood} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.76, 0.34, 0.035]} radius={0.01} />
      </mesh>
      <mesh position={[0, 0.78, 0.064]} material={m.board}>
        <planeGeometry args={[0.72, 0.3]} />
      </mesh>
      {/* pointer to the lighthouse */}
      <group position={[0.06, 0.5, 0.04]} rotation={[0, 0, -0.06]}>
        <mesh position={[0.18, 0, 0]} material={m.wood} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.5, 0.12, 0.03]} radius={0.008} />
        </mesh>
        <mesh position={[0.18, 0, 0.017]} material={m.arrow}>
          <planeGeometry args={[0.47, 0.1]} />
        </mesh>
      </group>
    </group>
  );
};
