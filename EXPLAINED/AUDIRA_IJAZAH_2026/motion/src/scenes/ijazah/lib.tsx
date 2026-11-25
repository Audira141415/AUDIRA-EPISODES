// Plumbing shared by the three diploma-trial films: word anchors, karaoke captions, the brand outro. Look decisions stay in each film.

import React from "react";
import { Img, staticFile } from "remotion";
import * as THREE from "three";
import { sm } from "../shared/Cine.tsx";

export type Word = { text: string; start: number; end: number; scene: string };
export type TL = { duration: number; speech_end: number; scenes: { id: string; start: number; end: number }[]; words: Word[] };

const clean = (s: string) => s.replace(/[.,:;?!”"“]+$/, "").replace(/^[“"]/, "");

export const anchors = (tl: TL) => (spec: string) => {
  const [sc, rest] = spec.split(":");
  const [word, nth] = rest.split("#");
  const hit = tl.words.filter((w) => w.scene === sc && clean(w.text) === word)[(nth ? +nth : 1) - 1];
  if (!hit) throw new Error("anchor not found " + spec);
  return hit.start;
};
export const sceneT = (tl: TL) => Object.fromEntries(tl.scenes.map((s) => [s.id, s.start])) as Record<string, number>;

/** Same phrase rule as the SRT builder, so burned captions and subtitles match. */
export const groups = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const p = cur[cur.length - 1];
    const n = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (p && (p.scene !== w.scene || /[.?:;!”]$/.test(p.text) || (/,$/.test(p.text) && cur.length >= 2) || cur.length >= 6 || n > 30)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  out.push(cur);
  return out;
};

export const Captions: React.FC<{ tl: TL; t: number; box: React.CSSProperties; text: React.CSSProperties; active: string; ink: string }> = ({ tl, t, box, text, active, ink }) => {
  const G = React.useMemo(() => groups(tl.words), [tl]);
  const end = tl.speech_end + 0.3;
  if (t > end) return null;
  let g: Word[] | null = null;
  for (let i = 0; i < G.length; i++) {
    const a = G[i][0].start - 0.04;
    const b = i < G.length - 1 ? G[i + 1][0].start - 0.04 : end;
    if (t >= a && t < b) g = G[i];
  }
  if (!g) return null;
  const inT = sm(g[0].start - 0.04, g[0].start + 0.06, t);
  return (
    <div style={{ position: "absolute", left: 58, right: 112, top: 1290, height: 250, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: inT, transform: `translateY(${(1 - inT) * 10}px)`, ...box }}>
        {g.map((w, i) => {
          const on = t >= w.start && t < w.end + 0.03;
          const b = Math.max(0, 1 - (t - w.start) / 0.14);
          return <span key={i} style={{ ...text, display: "inline-block", marginRight: i < g!.length - 1 ? "0.26em" : 0, color: on ? active : ink, transform: `translateY(${on ? -5 * b : 0}px)` }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

export const Outro: React.FC<{ tl: TL; t: number; line: string }> = ({ tl, t, line }) => {
  const a = tl.speech_end + 0.25;
  if (t < a) return null;
  const k = sm(a, a + 0.35, t), l = sm(a + 0.15, a + 0.65, t);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0B3D2E", opacity: k, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 300, boxSizing: "border-box", zIndex: 20 }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 500, opacity: l, transform: `translateY(${(1 - l) * 24}px)` }} />
      <div style={{ marginTop: 44, fontFamily: "'PS Space Grotesk'", fontWeight: 600, fontSize: 44, color: "#fff", opacity: l }}>Created by Agus Dwi R.</div>
      <div style={{ marginTop: 16, fontFamily: "'PS Space Grotesk'", fontSize: 26, letterSpacing: "0.06em", color: "#A3E635", opacity: l }}>{line}</div>
    </div>
  );
};

/** Canvas label on a transparent plane. System fonts only: textures are drawn before web fonts are guaranteed. */
export const labelTex = (txt: string, color: string, font = "italic 700 120px Georgia", w = 768, h = 240, bg?: string) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = color; g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(txt, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

export const Label: React.FC<{ txt: string; color: string; w: number; pos: [number, number, number]; rot?: [number, number, number]; font?: string; op?: number; bg?: string }> = ({ txt, color, w, pos, rot, font, op = 1, bg }) => {
  const tex = React.useMemo(() => labelTex(txt, color, font, 768, 240, bg), [txt, color, font, bg]);
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[w, (w * 240) / 768]} />
      <meshBasicMaterial map={tex} transparent opacity={op} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

/** Overshoot pop in 0..1. */
export const pop = (a: number, t: number, d = 0.45) => {
  const x = Math.min(1, Math.max(0, (t - a) / d)) - 1;
  return t < a ? 0 : x * x * (2.3 * x + 1.3) + 1;
};
