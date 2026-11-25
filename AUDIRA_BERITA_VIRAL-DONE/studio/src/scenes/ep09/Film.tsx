// EP09 film (TOYDIORAMA): "Mundur, masih dapat pensiun?" — one continuous theatrical camera over
// the approved cover stage; the set is re-dressed beat by beat (filmWorld.tsx). HTML layers:
// cover headline (frame 0 = thumbnail), kickers, name cards, salary counter, karaoke captions, outro.
// Audio (VO + music + SFX) is muxed separately by the lead; no audio here.
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadLilita } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadMono } from "@remotion/google-fonts/DMMono";
import { Outro } from "../_shared/Outro.tsx";
import { BG, COVER_CAMERA, DISPLAY, MONO, Overlay } from "./Cover.tsx";
import { CLIPS, OUTRO_AT, SEC, T, seg, win, type Word } from "./clock.ts";
import { FilmWorld } from "./filmWorld.tsx";

const lilita = loadLilita("normal", { weights: ["400"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

const INK = "#1d130b";
const HONEY = "#ffc84a";
const PAPER = "#f4ecdc";

// ------------------------------------------------------------------ kickers (top-left, y >= 262)
const KICKERS: { a: number; b: number; text: string }[] = [
  { a: T.kamis, b: T.pakar - 0.1, text: "KAMIS · 12 NOVEMBER 2026" },
  { a: T.pakar, b: T.lalu + 0.6, text: "MENURUT PAKAR" },
  { a: T.aturan, b: T.gaji - 0.1, text: "UU NO. 7 TAHUN 1978 · PASAL 6" },
  { a: T.gaji, b: T.pasal7 - 0.1, text: "GAJI POKOK WAPRES" },
  { a: T.pasal7, b: T.pasal8 - 0.1, text: "UU 7/1978 · PASAL 7" },
  { a: T.pasal8, b: T.perpres - 0.1, text: "UU 7/1978 · PASAL 8" },
  { a: T.perpres, b: T.pengamanan - 0.1, text: "PERPRES 52/2014" },
  { a: T.pengamanan, b: T.kata - 0.1, text: "PP 59/2013 · PASPAMPRES" },
  { a: T.kata, b: T.tapi - 0.1, text: "SYARATNYA" },
  { a: T.tapi, b: SEC.PAYOFF[1] + 0.1, text: "PENDAPAT PAKAR" },
  { a: T.jadi, b: OUTRO_AT, text: "KESIMPULAN" },
];

const Kicker: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const cur = KICKERS.find((c) => t >= c.a - 0.05 && t < c.b);
  if (!cur) return null;
  const o = win(t, cur.a, cur.b, 0.25, 0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: 64 * k,
        top: 266 * k,
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 34 * k,
        letterSpacing: 3 * k,
        color: INK,
        background: "#e9c86f",
        padding: `${7 * k}px ${18 * k}px`,
        transform: `rotate(-1.2deg) translateX(${(1 - o) * -30 * k}px)`,
        opacity: o,
        boxShadow: `0 ${4 * k}px ${12 * k}px rgba(0,0,0,0.35)`,
      }}
    >
      {cur.text}
    </div>
  );
};

// ------------------------------------------------------------------ name cards (paper cards, no faces)
const NameCard: React.FC<{ t: number; k: number; a: number; b: number; name: string; role: string; ilustrasi?: boolean }> = ({ t, k, a, b, name, role, ilustrasi }) => {
  const o = win(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 64 * k, top: 336 * k, opacity: o, transform: `translateY(${(1 - o) * 20 * k}px) rotate(0.8deg)` }}>
      <div style={{ background: PAPER, padding: `${16 * k}px ${26 * k}px ${18 * k}px`, borderLeft: `${10 * k}px solid #8a1f23`, boxShadow: `0 ${6 * k}px ${18 * k}px rgba(0,0,0,0.4)` }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 50 * k, color: INK, lineHeight: 1.0 }}>{name}</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34 * k, color: "#4a2e17", marginTop: 8 * k, letterSpacing: 1.5 * k }}>{role}</div>
      </div>
      {ilustrasi && (
        <div style={{ display: "inline-block", marginTop: 10 * k, fontFamily: MONO, fontWeight: 500, fontSize: 34 * k, color: "#fff", background: "#b8321f", padding: `${4 * k}px ${12 * k}px`, letterSpacing: 2 * k }}>
          ILUSTRASI
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ salary counter
const Counter: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = win(t, T.rp - 0.35, T.pasal7 - 0.2, 0.3, 0.3);
  if (o <= 0) return null;
  const v = 20.16 * seg(t, T.rp, T.rp + 0.9);
  const txt = v.toFixed(2).replace(".", ",");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 350 * k, textAlign: "center", opacity: o, transform: `scale(${0.94 + 0.06 * o})` }}>
      <div style={{ display: "inline-block", background: PAPER, padding: `${14 * k}px ${34 * k}px ${18 * k}px`, boxShadow: `0 ${8 * k}px ${22 * k}px rgba(0,0,0,0.45)`, transform: "rotate(-1deg)" }}>
        <div style={{ fontFamily: DISPLAY, color: INK, lineHeight: 1 }}>
          <span style={{ fontSize: 112 * k }}>Rp{txt}</span>
          <span style={{ fontSize: 56 * k }}> juta</span>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36 * k, color: "#8a1f23", marginTop: 6 * k }}>PER BULAN · GAJI POKOK WAPRES</div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34 * k, color: "#3b2708", marginTop: 8 * k }}>4 × gaji pokok tertinggi pejabat</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ karaoke captions (from timeline.json)
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    const groups: Word[][] = [];
    let cur: Word[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.?:!]$/.test(w.w);
      const last = i === c.words.length - 1;
      if (last || cur.length >= 6 || (punct && cur.length >= 2)) {
        groups.push(cur);
        cur = [];
      }
    });
    // never leave one word alone: merge into a neighbour
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length === 1 && groups.length > 1) {
        if (i > 0) groups[i - 1].push(...groups[i]);
        else groups[1].unshift(...groups[i]);
        groups.splice(i, 1);
        i--;
      }
    }
    groups.forEach((g, i) => {
      const next = groups[i + 1];
      out.push({ words: g, a: g[0].s, b: next ? next[0].s : g[g.length - 1].e + 0.35 });
    });
  }
  return out;
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a - 0.04 && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  const split = n > 4 ? Math.ceil(n / 2) : n;
  const lines = n > 4 ? [ch.words.slice(0, split), ch.words.slice(split)] : [ch.words];
  // first caption waits for the lower cover tag to peel away (hook)
  const o = seg(t, ch.a - 0.04, ch.a + 0.1) * seg(t, 0.3, 0.6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300 * k, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ position: "relative", background: "rgba(244,236,220,0.96)", padding: `${14 * k}px ${26 * k}px`, boxShadow: `0 ${6 * k}px ${18 * k}px rgba(0,0,0,0.45)`, maxWidth: 1000 * k }}>
        <div style={{ position: "absolute", left: -14 * k, top: -12 * k, width: 90 * k, height: 26 * k, background: "rgba(159,201,194,0.85)", transform: "rotate(-14deg)" }} />
        {lines.map((line, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 24 * k, marginTop: li ? 6 * k : 0 }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < Math.max(w.e, w.s + 0.12);
              const done = t >= w.e;
              const pop = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.12) * Math.PI * 0.5) : 1;
              return (
                <span
                  key={wi}
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 58 * k,
                    lineHeight: 1.15,
                    color: active || done ? INK : "#5a4a3a",
                    background: active ? HONEY : "transparent",
                    padding: `0 ${6 * k}px`,
                    borderRadius: 6 * k,
                    transform: `scale(${pop})`,
                    display: "inline-block",
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const [handle] = useState(() => delayRender("EP09 film fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([lilita.waitUntilDone(), mono.waitUntilDone()]).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const headline = 1 - seg(t, T.hilang - 0.1, T.hilang + 0.5);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 60 }}>
          <FilmWorld t={t} />
        </ThreeCanvas>
      )}
      {headline > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: headline, transform: `scale(${k})`, transformOrigin: "0 0", width: 1080, height: 1920 }}>
          <Overlay />
        </div>
      )}
      <Kicker t={t} k={k} />
      <NameCard t={t} k={k} a={T.gibran - 0.1} b={T.pakar - 0.2} name="GIBRAN RAKABUMING RAKA" role="WAKIL PRESIDEN" ilustrasi />
      <NameCard t={t} k={k} a={T.mahfud - 0.1} b={SEC.PAYOFF[1] + 0.15} name="MAHFUD MD" role="PAKAR HUKUM TATA NEGARA" />
      <Counter t={t} k={k} />
      <Captions t={t} k={k} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
