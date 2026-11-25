// AE-044 film: "Bagaimana eSIM menggantikan kartu SIM fisik?" (PRECISION, ~65 s).
// Every cut and beat comes from timeline.json via timing.ts. No audio here (lead muxes VO/music/SFX).

import React, { useEffect, useLayoutEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { fontReady } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { BG, GRADE, INTER, MONO, TEAL } from "./Cover.tsx";
import {
  B, CHIP_WORLD, HOOK_ROT, HOOK_SIM, QR_POS, TRAY_W, RACK_POS, SEC, TIMELINE, backOut, clamp01, mix, outCubic, project, ramp, shotAt, smooth, type V3,
} from "./timing.ts";
import { Backdrop, Lights, Lineup, LockedPacket, Phone, type PhoneState, QRCard, ServerRack, Shield, SimCard, Stream } from "./World.tsx";

const RACK_OUT: V3 = [RACK_POS[0] + 0.13, RACK_POS[1] + 0.85 * (1.05 - 3 * 0.29), RACK_POS[2] + 0.85 * 0.8];

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const pose = shotAt(t);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.fov = pose.fov;
    c.near = 0.03;
    c.far = 120;
    c.up.set(0, 1, 0);
    c.lookAt(...pose.target);
    c.layers.enable(FX_LAYER);
    c.updateProjectionMatrix();
  });
  return null;
};

const phoneState = (t: number): PhoneState => {
  const s: PhoneState = {
    lid: 0, glow: 0, chipDrop: 1, reflow: 0, ry: 0, screen: "off", screenOn: 0, scan: -1, emptySlot: 0, stack: 0, active: [0, 0], dim: 0, trayFlash: 0,
  };
  // HOOK: tray stays shut, flashes when "baki" is said
  s.trayFlash = t < SEC.KONTEKS[0] ? Math.max(0, 1 - Math.abs(t - B.hookSimTray - 0.2) / 0.6) : 0;
  // KONTEKS: back glass lifts on "Itulah eSIM"
  s.lid = ramp(t, B.itulah + 0.1, B.chipnya - 0.4);
  if (t >= B.chipnya) s.lid = 1;
  // chip placed + soldered on "disolder", empty on "kosong"
  if (t >= B.chipnya && t < SEC.MEKANISME[0]) {
    s.chipDrop = ramp(t, B.chipnya + 0.3, B.disolder + 0.15);
    s.reflow = Math.max(0, 1 - Math.abs(t - B.disolder - 0.35) / 0.7);
    s.emptySlot = smooth(ramp(t, B.kosong - 0.25, B.kosong + 0.25));
    s.glow = 0.05;
  } else if (t >= SEC.KONTEKS[0]) {
    s.glow = 0.35;
  }
  // MEKANISME wide/follow: chip glows while fetching, padlock opens inside it
  if (t >= B.ponsel2 && t < SEC.REVEAL[0]) s.glow = 0.5 + 0.5 * ramp(t, B.masukChip, B.masukChip + 0.5);
  // REVEAL: stacked profiles, only 1-2 active; macro so halo stays low
  if (t >= SEC.REVEAL[0] && t < SEC.PAYOFF[0]) {
    s.glow = 0.12;
    s.stack = ramp(t, SEC.REVEAL[0] + 0.1, B.beberapa + 0.9);
    s.dim = ramp(t, B.hanya2 - 0.2, B.hanya2 + 0.2);
    s.active = [ramp(t, B.satu2 - 0.1, B.satu2 + 0.25), ramp(t, B.dua - 0.1, B.dua + 0.25)];
  }
  // PAYOFF: phone turns to its screen
  if (t >= SEC.PAYOFF[0] && t < SEC.OUTRO[0]) {
    s.ry = mix(0, Math.PI, smooth(ramp(t, SEC.PAYOFF[0], SEC.PAYOFF[0] + 1.1)));
    s.screen = t < B.sejak2 ? "esim" : "face";
    s.screenOn = t < B.sejak2 ? ramp(t, SEC.PAYOFF[0] + 0.6, SEC.PAYOFF[0] + 1.2) : 1;
    s.scan = t >= B.sejak2 ? ((t - B.pelanggan) / 1.1 + 10) % 1 : -1;
  }
  // OUTRO: hero, the number lives on in the chip
  if (t >= SEC.OUTRO[0]) {
    s.glow = 0.6 + 0.4 * ramp(t, B.nomormu2 - 0.2, B.nomormu2 + 0.4);
    s.stack = ramp(t, B.nomormu2 - 0.4, B.nomormu2 + 0.3);
    s.active = [1, 0];
    s.dim = 1;
  }
  return s;
};

const World3D: React.FC<{ t: number; f: number; frame: number }> = ({ t, f, frame }) => {
  const shot = shotAt(t).name;
  const ps = phoneState(t);
  if (shot === "hook") {
    ps.ry = HOOK_ROT[1];
    ps.rz = HOOK_ROT[2];
  }
  const showPhone = shot !== "lineup" && shot !== "qr" && shot !== "server";
  // hook card: streams into the closed tray wall
  const hookFlow = ramp(t, 0.2, 1.4);
  // outro card: dissolves fully on "hilang"
  const outroGone = smooth(ramp(t, B.hilang - 0.5, B.hilang + 0.6));
  // fetch path (rack -> chip)
  const fetch = ramp(t, B.menjemput - 0.3, B.menjemput + 0.9);
  const pkt = outCubic(ramp(t, B.profil3 - 0.1, B.masukChip + 0.05));
  const open = smooth(ramp(t, B.masukChip + 0.05, B.masukChip + 0.6));
  const A = new THREE.Vector3(...RACK_OUT), D = new THREE.Vector3(...CHIP_WORLD);
  const P1 = A.clone().lerp(D, 0.3).add(new THREE.Vector3(0.6, 0.6, 0.84));
  const P2 = A.clone().lerp(D, 0.75).add(new THREE.Vector3(0.36, 0.36, 1.18));
  const bez = (k: number) => {
    const u = 1 - k;
    return A.clone().multiplyScalar(u * u * u).add(P1.clone().multiplyScalar(3 * u * u * k)).add(P2.clone().multiplyScalar(3 * u * k * k)).add(D.clone().multiplyScalar(k * k * k));
  };
  const pktPos = bez(pkt);
  // handshake: shields leave each end, meet mid-path and swap
  const hs = ramp(t, B.chip2 - 0.1, B.sertifikat + 0.3);
  const ok = ramp(t, B.sertifikat, B.sertifikat + 0.6);
  const shieldA = bez(mix(0.95, 0.55, smooth(clamp01(hs * 1.4))) - smooth(ramp(hs, 0.72, 1)) * 0.2);
  const shieldB = bez(mix(0.05, 0.45, smooth(clamp01(hs * 1.4))) + smooth(ramp(hs, 0.72, 1)) * 0.2);
  const shieldFade = 1 - ramp(t, B.profil3 - 0.6, B.profil3);
  return (
    <>
      <CameraRig t={t} />
      <Backdrop />
      <Lights />
      {showPhone || shot === "server" ? <Phone s={ps} f={f} /> : null}
      {shot === "hook" ? <SimCard pos={HOOK_SIM} rot={[0.15, 0.35, -0.2]} scale={0.75} target={TRAY_W} f={f} flow={hookFlow} /> : null}
      {shot === "outro" && outroGone < 0.999 ? (
        <SimCard pos={[-1.05, 1.45, 1.45]} rot={[0.12, 0.28, -0.22]} scale={0.8 * (1 - outroGone)} target={CHIP_WORLD} f={f} flow={1 - ramp(t, B.hilang + 0.6, B.nomormu2)} />
      ) : null}
      {shot === "server" || shot === "wide" || shot === "follow" ? <ServerRack t={t} f={f} /> : null}
      {shot === "qr" ? <QRCard t={t} /> : null}
      {(shot === "wide" || shot === "follow") ? (
        <>
          <Stream a={RACK_OUT} b={CHIP_WORLD} f={f} amount={fetch * (1 - ramp(t, B.profil3, B.profil3 + 0.6) * 0.6)} lift={0.6} side={[0.0, 0.0, 0.84]} seed={77} count={220} />
          {shieldFade > 0.01 && hs > 0 ? (
            <>
              <Shield position={[shieldA.x, shieldA.y, shieldA.z]} ok={ok} scale={3.2 * shieldFade} />
              <Shield position={[shieldB.x, shieldB.y, shieldB.z]} ok={ok} scale={3.2 * shieldFade} />
            </>
          ) : null}
          {t >= B.profil3 - 0.2 && open < 0.999 ? (
            <LockedPacket position={[pktPos.x, pktPos.y, pktPos.z + 0.05]} open={open} scale={mix(1.4, 0.35, pkt) * (1 - open * 0.8)} />
          ) : null}
        </>
      ) : null}
      {shot === "lineup" ? <Lineup t={t} f={f} /> : null}
      <Finish frame={frame} background={BG} profile={GRADE} exposure={1.08} envIntensity={0.5} hdri="studio" envRotation={0.8} aoRadius={0.08} />
    </>
  );
};

// ---------- HUD ----------
const Tag: React.FC<{ x: number; y: number; text: string; sub?: string; k: number; o: number; align?: "left" | "right"; accent?: boolean }> = ({ x, y, text, sub, k, o, align = "left", accent }) => (
  <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? x : undefined, top: y, opacity: o, transform: `translateY(${(1 - o) * 14 * k}px)`, fontFamily: MONO, textAlign: align, whiteSpace: "nowrap" }}>
    <div style={{ fontSize: 40 * k, color: accent ? TEAL : "#eef3f6", letterSpacing: "0.04em" }}>{text}</div>
    {sub ? <div style={{ fontSize: 28 * k, color: "rgba(200,212,220,0.78)", letterSpacing: "0.05em", marginTop: 6 * k }}>{sub}</div> : null}
  </div>
);

const Leader: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; o: number; k: number }> = ({ from, to, o, k }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={from.x} cy={from.y} r={7 * k} fill="none" stroke="rgba(230,240,245,0.9)" strokeWidth={2 * k} />
      <polyline points={`${from.x},${from.y} ${mix(from.x, to.x, 0.3)},${to.y} ${to.x},${to.y}`} fill="none" stroke="rgba(230,240,245,0.6)" strokeWidth={1.6 * k} />
    </svg>
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  const pad = 72 * k;
  const shot = shotAt(t).name;
  const fadeIn = (a: number, d = 0.35) => smooth(ramp(t, a, a + d));
  const win = (a: number, b: number, d = 0.3) => Math.min(fadeIn(a, d), 1 - smooth(ramp(t, b - d, b)));
  const P = (p: V3) => project(t, p, W, H);
  const els: React.ReactNode[] = [];
  if (shot === "hook") {
    const tray = P(TRAY_W);
    const o = win(0.5, SEC.KONTEKS[0]);
    els.push(<Leader key="l1" from={tray} to={{ x: pad, y: tray.y + 260 * k }} o={o} k={k} />);
    els.push(<Tag key="t1" x={pad} y={tray.y + 270 * k} text="baki SIM" sub="tetap tertutup" k={k} o={o} />);
  }
  if (shot === "open") {
    const o = win(B.esimTitle - 0.1, B.chipnya, 0.25);
    const s = backOut(clamp01((t - B.esimTitle + 0.1) / 0.45));
    els.push(
      <div key="esim" style={{ position: "absolute", left: 0, right: 0, top: 250 * k, textAlign: "center", opacity: o, transform: `scale(${0.85 + 0.15 * s})`, fontFamily: INTER, fontWeight: 800, fontSize: 210 * k, letterSpacing: "-0.04em", color: TEAL, textShadow: `0 0 ${40 * k}px rgba(79,240,216,0.35)` }}>
        eSIM
      </div>,
    );
  }
  if (shot === "chipMacro") {
    const chip = P([CHIP_WORLD[0], CHIP_WORLD[1] - 0.05, CHIP_WORLD[2]]);
    const o = win(B.disolder - 0.2, SEC.MEKANISME[0]);
    els.push(<Leader key="lc" from={chip} to={{ x: pad, y: H * 0.64 }} o={o} k={k} />);
    els.push(<Tag key="tc" x={pad} y={H * 0.64 + 10 * k} text="chip eUICC" sub="disolder ke papan" k={k} o={o} />);
    els.push(<Tag key="tp" x={pad} y={H * 0.64 + 100 * k} text="sejak pabrik" k={k} o={win(B.pabrik - 0.1, SEC.MEKANISME[0])} accent />);
  }
  if (shot === "server") {
    const o = win(B.profil1 - 0.1, B.qr);
    els.push(<Tag key="sv" x={pad} y={H * 0.6} text="operator menyiapkan" sub="profil nomormu di server" k={k} o={o} />);
  }
  if (shot === "qr") {
    const qrTop = P([QR_POS[0], QR_POS[1] + 0.6, QR_POS[2]]);
    const no = win(B.tidak1 - 0.1, B.hanya1 + 0.2);
    els.push(
      <div key="no" style={{ position: "absolute", left: 0, right: 0, top: qrTop.y - 150 * k, textAlign: "center", opacity: no, fontFamily: MONO, fontSize: 46 * k, color: "#ff7a66" }}>
        <span style={{ textDecoration: "line-through", textDecorationThickness: 4 * k }}>0812-••••-••••</span>
        <div style={{ fontSize: 26 * k, color: "rgba(255,190,180,0.9)", marginTop: 8 * k }}>bukan nomor HP</div>
      </div>,
    );
    const lpa = win(B.hanya1, B.ponsel2 + 0.3);
    const a = fadeIn(B.alamat - 0.05), c = fadeIn(B.kode - 0.05);
    const y0 = H * 0.66;
    els.push(
      <div key="lpa" style={{ position: "absolute", left: pad, right: pad, top: y0, opacity: lpa, fontFamily: MONO, textAlign: "center" }}>
        <div style={{ fontSize: 40 * k, color: "#eef3f6", letterSpacing: "0.01em" }}>
          LPA:1$<span style={{ color: TEAL, opacity: 0.4 + 0.6 * a }}>smdp.operator…</span>$<span style={{ color: "#ffd27a", opacity: 0.4 + 0.6 * c }}>KODE</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 28 * k, marginTop: 18 * k }}>
          <div style={{ opacity: a, transform: `translateY(${(1 - a) * 12 * k}px)`, border: `${2 * k}px solid ${TEAL}`, color: TEAL, borderRadius: 999, padding: `${10 * k}px ${24 * k}px`, fontSize: 32 * k }}>alamat server</div>
          <div style={{ opacity: c, transform: `translateY(${(1 - c) * 12 * k}px)`, border: `${2 * k}px solid #ffd27a`, color: "#ffd27a", borderRadius: 999, padding: `${10 * k}px ${24 * k}px`, fontSize: 32 * k }}>kode pesanan</div>
        </div>
      </div>,
    );
  }
  if (shot === "wide") {
    const rack = P([RACK_POS[0] + 0.6, RACK_POS[1] + 0.9, RACK_POS[2]]);
    const chip = P(CHIP_WORLD);
    els.push(<Tag key="w1" x={W - rack.x - 40 * k < pad ? pad : pad} y={200 * k} text="server operator" sub="SM-DP+" k={k} o={win(B.ponsel2, B.profil3 - 0.2)} align="right" />);
    els.push(<Leader key="wl" from={chip} to={{ x: W - pad, y: H * 0.45 - 6 * k }} o={win(B.ponsel2 + 0.2, B.profil3 - 0.2)} k={k} />);
    els.push(<Tag key="w2" x={pad} y={H * 0.45} text="ponsel menjemput profil" k={k} o={win(B.ponsel2 + 0.2, B.chip2)} align="right" />);
    els.push(<Tag key="w3" x={pad} y={H * 0.45} text="cek sertifikat ⇄" sub="chip ↔ server" k={k} o={win(B.chip2, B.profil3 - 0.2)} align="right" accent />);
  }
  if (shot === "follow") {
    els.push(<Tag key="f1" x={pad} y={H * 0.6} text="profil terenkripsi" sub="gembok baru terbuka di dalam chip" k={k} o={win(B.terenkripsi - 0.3, SEC.REVEAL[0])} accent />);
  }
  if (shot === "stack") {
    els.push(<Tag key="s1" x={pad} y={H * 0.63} text="beberapa profil" sub="dalam satu chip" k={k} o={win(B.beberapa - 0.2, B.hanya2 + 0.1)} />);
    els.push(<Tag key="s2" x={pad} y={H * 0.63} text="aktif: 1–2 saja" sub="sisanya tersimpan" k={k} o={win(B.hanya2 + 0.1, SEC.PAYOFF[0])} accent />);
  }
  if (shot === "screen") {
    const o = win(SEC.PAYOFF[0] + 0.3, B.sejak2);
    els.push(<Tag key="id" x={pad} y={196 * k} text="INDONESIA" k={k} o={o} />);
    const st = backOut(clamp01((t - B.imbauan + 0.1) / 0.45));
    els.push(
      <div key="stamp" style={{ position: "absolute", right: pad, top: 250 * k, opacity: win(B.imbauan - 0.1, B.sejak2), transform: `rotate(-6deg) scale(${0.7 + 0.3 * st})`, border: `${4 * k}px solid ${TEAL}`, color: TEAL, padding: `${10 * k}px ${22 * k}px`, borderRadius: 14 * k, fontFamily: INTER, fontWeight: 800, fontSize: 48 * k, letterSpacing: "0.02em" }}>
        IMBAUAN
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24 * k, color: "#eef3f6", opacity: fadeIn(B.belum2 - 0.1) }}>belum wajib</div>
      </div>,
    );
  }
  if (shot === "face") {
    els.push(<Tag key="f1" x={pad} y={196 * k} text="sejak Juli 2026" sub="pelanggan baru" k={k} o={win(B.sejak2, B.dan3)} accent />);
    els.push(<Tag key="f2" x={pad} y={196 * k} text="daftar: pindai wajah" k={k} o={win(B.wajah - 0.2, B.dan3)} align="right" />);
  }
  if (shot === "lineup") {
    els.push(<Tag key="l1" x={pad} y={196 * k} text="tidak semua ponsel" sub="mendukung eSIM" k={k} o={win(B.tidak2 - 0.2, SEC.OUTRO[0])} />);
  }
  if (shot === "outro") {
    const chip = P(CHIP_WORLD);
    const o = win(B.nomormu2 - 0.1, B.outroCard);
    els.push(<Leader key="ol" from={chip} to={{ x: pad, y: chip.y + 220 * k }} o={o} k={k} />);
    els.push(<Tag key="ot" x={pad} y={chip.y + 230 * k} text="nomormu tetap ada" sub="di dalam chip" k={k} o={o} accent />);
  }
  // kicker
  const kick = 1 - smooth(ramp(t, 2.5, 3.2)) + smooth(ramp(t, B.ini - 0.2, B.ini + 0.3));
  els.push(
    <div key="kick" style={{ position: "absolute", top: 256 * k, left: pad, right: pad, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 24 * k, letterSpacing: "0.28em", color: "rgba(226,232,240,0.78)", opacity: clamp01(kick) * (t < B.outroCard ? 1 : 0) * (shot === "hook" || shot === "outro" ? 1 : 0) }}>
      <span>AUDIRA EXPLAINED</span>
      <span style={{ color: TEAL }}>AE-044</span>
    </div>,
  );
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{els}</AbsoluteFill>;
};

// ---------- karaoke captions (phrases of <=5 words) ----------
type Chunk = { words: { w: string; s: number; e: number }[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  TIMELINE.clips.forEach((c) => {
    // split at punctuation first, then into balanced chunks of at most 4 words (one line each)
    const segs: Chunk["words"][] = [];
    let cur: Chunk["words"] = [];
    c.words.forEach((w) => {
      cur.push(w);
      if (/[,.]$/.test(w.w)) {
        segs.push(cur);
        cur = [];
      }
    });
    if (cur.length) segs.push(cur);
    // merge a lone trailing word into the previous segment when that keeps it <= 4
    const merged: Chunk["words"][] = [];
    segs.forEach((sg) => {
      const prev = merged[merged.length - 1];
      if (prev && (sg.length === 1 || prev.length === 1) && prev.length + sg.length <= 4) prev.push(...sg);
      else merged.push([...sg]);
    });
    merged.forEach((sg) => {
      const n = Math.ceil(sg.length / 4);
      const size = Math.ceil(sg.length / n);
      for (let k = 0; k < sg.length; k += size) {
        const words = sg.slice(k, k + size);
        out.push({ words, a: words[0].s - 0.08, b: 0 });
      }
    });
  });
  out.forEach((ch, i) => {
    const last = ch.words[ch.words.length - 1].e;
    const next = out[i + 1]?.a ?? Infinity;
    ch.b = Math.min(next, last + 0.6);
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  if (t >= B.outroCard) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const o = smooth(ramp(t, ch.a, ch.a + 0.12)) * (1 - smooth(ramp(t, ch.b - 0.12, ch.b)));
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, bottom: H - (1920 - 400) * k, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", gap: `${4 * k}px ${16 * k}px`, padding: `${14 * k}px ${26 * k}px`, borderRadius: 18 * k, background: "rgba(8,10,13,0.55)", border: `${1.5 * k}px solid rgba(255,255,255,0.08)`, fontFamily: INTER, fontWeight: 800, fontSize: Math.min(62, 1500 / Math.max(8, ch.words.map((w) => w.w).join(" ").length)) * k, letterSpacing: "-0.01em", lineHeight: 1.12 }}>
        {ch.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < w.e + 0.05;
          const done = t >= w.e + 0.05;
          const pop = active ? backOut(clamp01((t - w.s + 0.03) / 0.16)) : 1;
          return (
            <span key={i} style={{ color: active ? TEAL : done ? "#eef3f6" : "rgba(238,243,246,0.5)", transform: `translateY(${active ? (1 - pop) * 10 * k - 4 * k : 0}px) scale(${active ? 1.04 : 1})`, display: "inline-block", textShadow: active ? `0 0 ${18 * k}px rgba(79,240,216,0.45)` : "none" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Ep044Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP044 fonts for canvas text"));
  useEffect(() => {
    fontReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready ? (
        <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 32, near: 0.03, far: 120, position: [0, 0, 8] }}>
          <World3D t={t} f={f} frame={frame} />
        </ThreeCanvas>
      ) : null}
      <HUD t={t} />
      <Captions t={t} />
      <Outro start={B.outroCard} />
    </AbsoluteFill>
  );
};
