// EP050 film: "Bagaimana Bandara Menjaga Koper Tidak Tertukar?" — SATISFYFORGE.
// Every cut and beat comes from timeline.json (Audio Master Clock). Audio is muxed by the lead.
import React, { useLayoutEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../../core/render/Finish";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets";
import { FONT, fontReady } from "../../../core/type/fonts";
import { SATISFYFORGE_PALETTE as P } from "../../../kits/satisfyforge/lib/palette";
import { Outro } from "../../_shared/Outro";
import { Decor, LANE, makeSlatTexture, makeSweep } from "../parts";
import { CLIPS, CUT, CUT_TIMES, SEC, TIMELINE, W, camAt, clamp01, ease, win, type Key, type V3 } from "./clock";
import { StationBehind, StationCheckin, StationClaim, StationHook, StationPile, StationRecon, StationSorter, StationTag, StationWall, StationXray, heroHookPos, makeTex } from "./Stations";

const OUTRO_AT = SEC.OUTRO[1] + 0.2;

// ---------------- camera ----------------
const K = (t: number, p: V3, l: V3, fov = 36): Key => ({ t, p, l, fov });
const SHOTS: { a: number; keys: Key[] }[] = [
  { a: 0, keys: [K(0, [0.6, 8.5, 10.5], [0, 0, -1.2]), K(2.6, [1.6, 4.6, 7.4], [0, 0.3, -0.8])] },
  { a: CUT.checkin, keys: [K(CUT.checkin, [2.6, 2.4, 3.8], [-0.3, 0.85, -0.2]), K(W("l03", 4), [1.9, 2.3, 3.1], [-0.3, 0.9, -0.1]), K(W("l03", 8), [1.7, 2.3, 3.0], [0.2, 0.5, 0.5]), K(CUT.tag, [1.2, 2.1, 2.5], [0.3, 0.5, 0.6])] },
  {
    a: CUT.tag,
    keys: [
      K(CUT.tag, [0.5, 1.7, 1.4], [0.02, 0.42, 0.06], 34),
      K(W("l04", 3), [0.14, 1.15, 0.62], [0.02, 0.42, 0.06], 34),
      K(W("l04", 5), [0.12, 1.0, 0.72], [0.02, 0.42, 0.17], 34),
      K(W("l04", 9), [0.06, 1.02, 0.38], [0.02, 0.42, -0.09], 34),
      K(W("l05", 1), [0.08, 1.06, 0.42], [0.02, 0.42, -0.04], 34),
      K(W("l05", 4), [1.5, 1.9, 2.6], [0.05, 0.85, -0.5], 36),
      K(CUT.wall, [1.1, 1.9, 2.4], [0.0, 0.9, -0.55], 36),
    ],
  },
  { a: CUT.wall, keys: [K(CUT.wall, [1.3, 1.5, 1.6], [0, 0.75, -2.6], 38), K(CUT.behind, [0, 0.85, -2.3], [0, 0.8, -4.0], 40)] },
  { a: CUT.behind, keys: [K(CUT.behind, [-0.5, 1.0, 5.0], [0, 0.6, 2.6]), K(W("l06", 7), [1.8, 1.6, 1.8], [0, 0.75, -0.5]), K(CUT.xray, [1.6, 1.5, 0.9], [0, 0.95, -1.0])] },
  { a: CUT.xray, keys: [K(CUT.xray, [2.6, 1.9, 2.6], [0, 0.75, 0.2]), K(CUT.sorter, [2.3, 1.7, 0.6], [0, 0.8, -0.8])] },
  { a: CUT.sorter, keys: [K(CUT.sorter, [2.2, 6.4, 10.6], [-0.2, 0.2, 0.4], 36), K(CUT.recon, [1.4, 5.4, 9.2], [-0.4, 0.3, 0.8], 36)] },
  { a: CUT.recon, keys: [K(CUT.recon, [-1.2, 4.6, 8.8], [-0.7, 0.6, 0.9], 42), K(CUT.fail, [0.0, 4.2, 8.0], [-0.6, 0.6, 0.8], 42)] },
  { a: CUT.fail, keys: [K(CUT.fail, [2.2, 2.6, 4.0], [0.2, 0.6, 0.6], 38), K(CUT.pile, [1.5, 2.2, 3.3], [0.4, 0.6, 0.9], 38)] },
  { a: CUT.pile, keys: [K(CUT.pile, [1.2, 1.3, 1.6], [0, 0.35, -0.7], 38), K(W("l10", 13), [1.5, 2.4, 3.0], [0, 0.4, -0.4], 38), K(W("l10", 16), [1.4, 3.0, 3.8], [0, 0.3, -0.2], 38), K(CUT.claim, [0.5, 6.4, 6.0], [0, 0, 0.2], 40)] },
  { a: CUT.claim, keys: [K(CUT.claim, [2.4, 3.4, 6.0], [0.2, 0.5, 0.7]), K(W("l12", 0) - 0.3, [1.8, 2.9, 5.0], [0.4, 0.6, 0.9]), K(OUTRO_AT, [0, 6.0, 4.8], [0, 0, 0])] },
];
const shotIndex = (t: number) => {
  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].a) i = k;
  return i;
};

const cameraAt = (t: number) => {
  const s = shotIndex(t);
  let c = camAt(SHOTS[s].keys, t);
  let p = [...c.p] as V3;
  let l = [...c.l] as V3;
  if (s === 0) {
    // hook: crane down, then lock onto the hero bag
    const hp = heroHookPos(t);
    const k = ease(win(t, 2.5, 3.7));
    const fp: V3 = [hp.x + 1.3, hp.y + 1.45, hp.z + 2.1];
    const fl: V3 = [hp.x, hp.y + 0.5, hp.z - 0.3];
    p = p.map((v, i) => v + (fp[i] - v) * k) as V3;
    l = l.map((v, i) => v + (fl[i] - v) * k) as V3;
  }
  // never fully still: slow sway; a short shake on "tidak sempurna"
  const sway = Math.sin(t * 0.7) * 0.04;
  const sh = W("l09", 3);
  const shake = t > sh && t < sh + 0.5 ? Math.sin(t * 70) * 0.03 * (1 - (t - sh) / 0.5) : 0;
  p = [p[0] + sway + shake, p[1] + shake * 0.6, p[2]];
  c = { ...c, p, l };
  return c;
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const k = cameraAt(t);
    c.position.set(...k.p);
    c.fov = k.fov ?? 36;
    c.lookAt(...k.l);
    c.updateProjectionMatrix();
  });
  return null;
};

const useFonts = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("ep050 film fonts"));
  useLayoutEffect(() => {
    fontReady().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};

const World: React.FC<{ t: number }> = ({ t }) => {
  const sweep = useMemo(makeSweep, []);
  const tex = useMemo(() => makeTex(makeSlatTexture()), []);
  const s = shotIndex(t);
  return (
    <group>
      <mesh geometry={sweep} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <Decor t={t} />
      {s === 0 && <StationHook t={t} tex={tex} />}
      {s === 1 && <StationCheckin t={t} tex={tex} />}
      {s === 2 && <StationTag t={t} tex={tex} />}
      {s === 3 && <StationWall t={t} tex={tex} />}
      {s === 4 && <StationBehind t={t} tex={tex} />}
      {s === 5 && <StationXray t={t} tex={tex} />}
      {s === 6 && <StationSorter t={t} tex={tex} />}
      {s === 7 && <StationRecon t={t} tex={tex} />}
      {s === 8 && <StationSorter t={t} tex={tex} jam />}
      {s === 9 && <StationPile t={t} />}
      {s === 10 && <StationClaim t={t} tex={tex} />}
    </group>
  );
};

const Canvas3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const ok = useFonts();
  const cam = cameraAt(t);
  const focus = Math.hypot(cam.p[0] - cam.l[0], cam.p[1] - cam.l[1], cam.p[2] - cam.l[2]);
  return (
    <ThreeCanvas width={width} height={height} shadows={{ type: THREE.VSMShadowMap }} camera={{ position: [2, 6, 7], fov: 36, near: 0.03, far: 80 }}>
      <CameraRig t={t} />
      <hemisphereLight args={[P.sky2, P.ground, 0.6]} />
      <directionalLight
        position={[2.0, 8, 4.0]}
        intensity={1.6}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={8}
        shadow-camera-bottom={-10}
        shadow-camera-far={30}
        shadow-radius={14}
        shadow-blurSamples={16}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-4, 3, 5]} intensity={0.5} color="#FFE7F0" />
      {ok && <World t={t} />}
      <Finish frame={frame} background={P.sweepWall} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.82} envIntensity={0.25} focus={focus} aperture={0.0016} maxBlur={0.007} />
    </ThreeCanvas>
  );
};

// ---------------- HUD ----------------
const STEP = (t: number) => {
  if (t < CUT.checkin) return "KOK BISA?";
  if (t < CUT.tag) return "01 · CHECK-IN";
  if (t < W("l05", 0) - 0.1) return "02 · TAG BAGASI";
  if (t < CUT.wall) return "03 · DATA";
  if (t < CUT.xray) return "04 · PEMINDAI";
  if (t < CUT.sorter) return "05 · SINAR-X";
  if (t < CUT.recon) return "06 · SORTIR";
  if (t < CUT.fail) return "07 · REKONSILIASI";
  if (t < CUT.pile) return "TIDAK SEMPURNA";
  if (t < CUT.claim) return "DATA 2025";
  return "TANDA TERIMA";
};

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const clip = CLIPS.find((c) => t >= c.words[0].s - 0.15 && t <= c.words[c.words.length - 1].e + 0.25);
  if (!clip || t > OUTRO_AT) return null;
  // phrases of up to 5 words
  const groups: (typeof clip.words)[] = [];
  for (let i = 0; i < clip.words.length; i += 5) groups.push(clip.words.slice(i, i + 5));
  if (groups.length > 1 && groups[groups.length - 1].length < 2) groups[groups.length - 2].push(...groups.pop()!);
  let g = groups[0];
  for (const gg of groups) if (t >= gg[0].s - 0.1) g = gg;
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, bottom: 410 * s, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 30 * s, padding: `${16 * s}px ${22 * s}px`, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${4 * s}px ${6 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(120,90,160,0.2)` }}>
        {g.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.08;
          const b = on ? 1 + 0.08 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span
              key={i}
              style={{
                fontSize: 50 * s,
                fontWeight: 600,
                lineHeight: 1.15,
                padding: `${2 * s}px ${12 * s}px`,
                borderRadius: 999,
                color: on ? "#FFFFFF" : P.ink,
                background: on ? P.hudAccent : "transparent",
                transform: `scale(${b}) translateY(${on ? -3 * s : 0}px)`,
                display: "inline-block",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const { width } = useVideoConfig();
  const s = width / 1080;
  const steps = 7;
  const stepN = (() => {
    const m = /^0(\d)/.exec(STEP(t));
    return m ? Number(m[1]) : t >= CUT.fail ? 7 : 0;
  })();
  const flash = Math.max(0, ...CUT_TIMES.map((c) => 1 - Math.abs(t - c) / 0.16));
  const zoomThrough = 1 - Math.abs(t - CUT.behind) / 0.22;
  const cnt0 = W("l10", 7);
  const cnt1 = W("l10", 10) + 0.2;
  const showCnt = t > W("l10", 6) - 0.2 && t < CUT.claim;
  const n = Math.round(24 * ease(win(t, cnt0, cnt1)));
  const transit = t > W("l10", 16);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: `'${FONT}', sans-serif`, color: P.ink }}>
      <div style={{ position: "absolute", top: 196 * s, left: 60 * s, right: 60 * s, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.88)", padding: `${10 * s}px ${20 * s}px`, borderRadius: 999, fontSize: 24 * s, letterSpacing: 4 * s, fontWeight: 600, color: P.hudAccent }}>● {STEP(t)}</div>
          <div style={{ display: "flex", gap: 8 * s, marginTop: 14 * s, marginLeft: 6 * s }}>
            {Array.from({ length: steps }, (_, i) => (
              <div key={i} style={{ width: (i + 1 === stepN ? 44 : 16) * s, height: 10 * s, borderRadius: 5 * s, background: i < stepN ? [LANE.pink, LANE.butter, LANE.mint, P.sky, P.lilac, LANE.pink, LANE.mint][i] : "rgba(75,63,92,0.15)" }} />
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.85)", border: `${2 * s}px solid ${P.hudAccent}`, padding: `${8 * s}px ${16 * s}px`, borderRadius: 999, fontWeight: 600, fontSize: 19 * s, letterSpacing: 2 * s }}>AUDIRA EXPLAINED</div>
      </div>
      {showCnt && (
        <div style={{ position: "absolute", top: 330 * s, left: 60 * s, right: 60 * s, textAlign: "center", opacity: ease(win(t, W("l10", 6) - 0.2, W("l10", 6) + 0.2)) }}>
          <div style={{ fontSize: 132 * s, fontWeight: 600, letterSpacing: -4 * s, lineHeight: 1 }}>±{n} JUTA</div>
          <div style={{ fontSize: 30 * s, fontWeight: 500, marginTop: 10 * s, color: "rgba(75,63,92,0.75)" }}>koper bermasalah di seluruh dunia · 2025 · SITA</div>
          {transit && (
            <div style={{ display: "inline-block", marginTop: 16 * s, background: "#FF8A7A", color: "#fff", borderRadius: 999, padding: `${8 * s}px ${22 * s}px`, fontSize: 30 * s, fontWeight: 600, transform: `scale(${0.8 + 0.2 * ease(win(t, W("l10", 16), W("l10", 16) + 0.3))})` }}>
              kebanyakan saat TRANSIT
            </div>
          )}
        </div>
      )}
      <Captions t={t} s={s} />
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#FFF6F0", opacity: flash * 0.75 }} />}
      {zoomThrough > 0 && <div style={{ position: "absolute", inset: 0, background: "#8C78B8", opacity: zoomThrough }} />}
    </div>
  );
};

export const Ep050Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: P.sweepWall }}>
      {t < OUTRO_AT + 0.7 && <Canvas3D />}
      <Hud t={t} />
      <Outro start={OUTRO_AT} />
    </div>
  );
};

export const FILM_SECONDS = TIMELINE.total;
