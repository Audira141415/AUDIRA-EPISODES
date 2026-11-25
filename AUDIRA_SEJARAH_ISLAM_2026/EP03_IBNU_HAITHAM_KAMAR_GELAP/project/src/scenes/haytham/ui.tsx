// EP03 2D layers: the cover titles (hook), noir evidence tags pinned to 3D points, the "KONON" stamp,
// karaoke captions on a dark plate, and the AUDIRA outro card. Laid out in 1080x1920 layout pixels.

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import * as THREE from "three";
import { FONT } from "../../core/type/fonts.ts";
import { useFormat } from "../../core/film/format.ts";
import type { Shot } from "../../core/render/Post.tsx";
import { prog, smooth, easeOut, window01, at, type Word } from "./time.ts";
import { PALETTE } from "./layout.ts";

export const SERIF = "HaythamSerif";
const MONO = "'Courier New', Courier, monospace";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fmt = useFormat();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: fmt.layout.width, height: fmt.layout.height, transform: `scale(${fmt.scale})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

/** The cover titles: readable on the first frame, gone once the hook question is answered. */
export const Titles: React.FC<{ t: number }> = ({ t }) => {
  const out = smooth(prog(t, at("karena") - 0.1, at("kamera", 1)));
  const a = (1 - out) * Math.min(1, 0.85 + t * 0.5);
  if (a <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 232, left: 72, right: 72, opacity: a, transform: `translateY(${-out * 30}px)` }}>
      <div style={{ fontFamily: MONO, fontSize: 34, letterSpacing: 7, color: PALETTE.tungsten, fontWeight: 700 }}>● SEJARAH ISLAM · EP03</div>
      <div style={{ marginTop: 26, fontFamily: `${SERIF}, 'Times New Roman', serif`, fontSize: 150, lineHeight: 0.92, color: "#F2EDE4", letterSpacing: 1, textShadow: "0 4px 30px rgba(0,0,0,0.95)" }}>
        Kamera itu
        <br />
        dulu <span style={{ color: PALETTE.tungsten, fontStyle: "italic" }}>kamar.</span>
      </div>
      <div style={{ marginTop: 26, width: 120, height: 3, background: PALETTE.tungsten, opacity: 0.8 }} />
      <div style={{ marginTop: 20, fontFamily: MONO, fontSize: 38, letterSpacing: 3, color: "rgba(226,232,240,0.88)" }}>IBNU AL-HAITSAM · KAMAR GELAP</div>
    </div>
  );
};

// ---------------------------------------------------------------- projection of 3D pins
const cam = new THREE.PerspectiveCamera(46, 9 / 16, 0.05, 100);
/** Layout-pixel position of a world point for the current shot, or null when behind the camera. */
export function project(shot: Shot, p: [number, number, number], W: number, H: number): [number, number] | null {
  cam.fov = shot.fov;
  cam.aspect = W / H;
  cam.position.set(...shot.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...shot.target);
  if (shot.roll) cam.rotateZ(shot.roll);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  if (v.z > 1 || v.z < -1) return null;
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
}

export type Tag = { text: string; a: number; b: number; x: number; y: number; pin?: [number, number, number]; strikeAt?: number; big?: boolean; sub?: string };

/** A noir evidence tag (typewriter on paper), with a thread pinned to a point of the 3D world. */
const TagCard: React.FC<{ tag: Tag; t: number; shot: Shot; W: number; H: number }> = ({ tag, t, shot, W, H }) => {
  const v = window01(t, tag.a, tag.b, 0.35);
  if (v <= 0.001) return null;
  const e = easeOut(prog(t, tag.a, tag.a + 0.45));
  const pin = tag.pin ? project(shot, tag.pin, W, H) : null;
  const strike = tag.strikeAt !== undefined ? smooth(prog(t, tag.strikeAt, tag.strikeAt + 0.35)) : 0;
  const fs = tag.big ? 56 : 44;
  const anchorX = tag.x, anchorY = tag.y;
  const pinOk = pin && pin[0] > 40 && pin[0] < W - 40 && pin[1] > 200 && pin[1] < H - 420;
  return (
    <>
      {pinOk && pin ? (
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: v * 0.9 }}>
          <line x1={anchorX} y1={anchorY + 40} x2={anchorX + (pin[0] - anchorX) * e} y2={anchorY + 40 + (pin[1] - anchorY - 40) * e} stroke={PALETTE.red} strokeWidth={3} />
          <circle cx={pin[0]} cy={pin[1]} r={10 * e} fill="none" stroke={PALETTE.red} strokeWidth={3} />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: anchorX,
          top: anchorY,
          transform: `translate(-50%, 0) translateY(${(1 - e) * 24}px) rotate(${tag.big ? -1.5 : -2.5}deg)`,
          opacity: v,
          background: PALETTE.paper,
          padding: tag.big ? "20px 30px 18px" : "14px 22px 12px",
          boxShadow: "0 14px 34px rgba(0,0,0,0.65), 0 2px 0 rgba(0,0,0,0.25)",
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        <div style={{ position: "absolute", top: -9, left: "50%", width: 18, height: 18, marginLeft: -9, borderRadius: 9, background: PALETTE.red, boxShadow: "0 2px 4px rgba(0,0,0,0.6)" }} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs, letterSpacing: tag.big ? 4 : 3, color: "#1a140e", whiteSpace: "nowrap", position: "relative" }}>
          {tag.text}
          {strike > 0 ? <div style={{ position: "absolute", left: -6, top: "50%", height: 3, width: `${strike * 104}%`, background: PALETTE.red, opacity: 0.85 }} /> : null}
        </div>
        {tag.sub ? <div style={{ marginTop: 6, fontFamily: MONO, fontSize: Math.max(36, fs * 0.72), fontWeight: 700, letterSpacing: 3, color: "#3a2a1c", whiteSpace: "nowrap" }}>{tag.sub}</div> : null}
      </div>
    </>
  );
};

export const Tags: React.FC<{ tags: Tag[]; t: number; shot: Shot }> = ({ tags, t, shot }) => {
  const fmt = useFormat();
  return (
    <>
      {tags.map((g, i) => (
        <TagCard key={i} tag={g} t={t} shot={shot} W={fmt.layout.width} H={fmt.layout.height} />
      ))}
    </>
  );
};

/** Red rubber stamp for the disputed tale. */
export const Stamp: React.FC<{ t: number; a: number; b: number; text: string; top?: number; right?: number; size?: number }> = ({ t, a, b, text, top = 250, right = 90, size = 84 }) => {
  const v = window01(t, a, b, 0.3);
  if (v <= 0.001) return null;
  const hit = prog(t, a, a + 0.22);
  const sc = 1.35 - 0.35 * easeOut(hit);
  return (
    <div style={{ position: "absolute", top, right, opacity: v * 0.92, transform: `rotate(-9deg) scale(${sc})`, transformOrigin: "center" }}>
      <div style={{ border: `7px solid ${PALETTE.red}`, padding: "10px 30px 6px", fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 10, color: PALETTE.red, background: "rgba(10,6,4,0.35)", boxShadow: "0 0 0 3px rgba(196,68,46,0.35) inset" }}>
        {text}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- karaoke captions
/**
 * Caption chunks: split at punctuation (clause ends) first, then split long clauses into balanced parts
 * of at most `maxChars`, so no chunk is a one-word orphan and no phrase is split across a clause end.
 */
const NO_BREAK_AFTER = new Set(["di", "ke", "dari", "pada", "yang", "dan", "sang", "satu", "seribu", "kamar", "camera", "sungai", "bahasa", "johannes", "ibnu", "khalifah", "rencana", "tujuh"]);
function chunks(words: Word[], maxChars: number): Word[][] {
  const clauses: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.,;:?!]$/.test(w.w)) {
      clauses.push(cur);
      cur = [];
    }
  }
  if (cur.length) clauses.push(cur);
  // glue a one-word clause to its neighbour ("Konon," + next words)
  const glued: Word[][] = [];
  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i];
    if (c.length === 1 && i + 1 < clauses.length) clauses[i + 1] = [...c, ...clauses[i + 1]];
    else if (c.length === 1 && glued.length) glued[glued.length - 1].push(...c);
    else glued.push(c);
  }
  const len = (ws: Word[]) => ws.reduce((a, w) => a + w.w.length + 1, -1);
  const out: Word[][] = [];
  for (const c of glued) {
    const n = Math.max(1, Math.ceil(len(c) / maxChars));
    if (n === 1 || c.length < 4) {
      out.push(c);
      continue;
    }
    // balanced split into n parts by characters, each part >= 2 words
    const target = len(c) / n;
    let part: Word[] = [];
    for (let i = 0; i < c.length; i++) {
      part.push(c[i]);
      const left = c.length - i - 1;
      if (len(part) >= target && part.length >= 2 && left >= 2 && !NO_BREAK_AFTER.has(c[i].w.toLowerCase())) {
        out.push(part);
        part = [];
      }
    }
    if (part.length) out.push(part);
  }
  return out;
}

/** 9:16 karaoke captions above the bottom 380 px, on a dark blurred plate; bounce <= 1.04, gap >= 0.4 em. */
export const Captions: React.FC<{ t: number; words: Word[] }> = ({ t, words }) => {
  const groups = React.useMemo(() => chunks(words, 26), [words]);
  const g = groups.find((c) => t >= c[0].s - 0.12 && t <= c[c.length - 1].e + 0.25);
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 380 + 46, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "block",
          textWrap: "balance",
          maxWidth: 900,
          padding: "14px 30px 16px",
          borderRadius: 18,
          background: "rgba(6,7,9,0.62)",
          backdropFilter: "blur(10px)",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 64,
          lineHeight: 1.14,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {g.map((w, i) => {
          const nextS = i + 1 < g.length ? g[i + 1].s : Infinity;
          const active = t >= w.s && t < Math.min(w.e + 0.05, nextS);
          const spoken = t >= w.s;
          const k = active ? Math.sin(Math.min(1, (t - w.s) / Math.max(0.08, w.e - w.s)) * Math.PI) : 0;
          return (
            <span key={i} style={{ display: "inline-block", margin: "0 0.21em", color: active ? "#FFD27A" : spoken ? "#F4EFE6" : "rgba(244,239,230,0.6)", transform: `scale(${1 + 0.04 * k})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Outro card over the last seconds: the AUDIRA card centred on #0B3D2E, with the creator credit. */
export const Outro: React.FC<{ v: number; t: number; at0: number }> = ({ v, t, at0 }) => {
  const fmt = useFormat();
  if (v <= 0.001) return null;
  const k = easeOut(prog(t, at0, at0 + 0.9));
  const s = fmt.scale;
  return (
    <AbsoluteFill style={{ opacity: v, background: "#0B3D2E", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 900 * s, height: "auto", transform: `scale(${0.96 + 0.04 * k})` }} />
      <div style={{ marginTop: 30 * s, fontFamily: FONT, fontWeight: 500, fontSize: 40 * s, letterSpacing: 3 * s, color: "rgba(240,236,226,0.9)", opacity: k }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};
