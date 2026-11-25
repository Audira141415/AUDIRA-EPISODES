// HTML layers over the 3D window: title card, word-by-word captions with speaker labels, the hikmah
// card, and the AUDIRA outro. Captions live in the bottom ~22 % band, inside a 5 % action-safe margin.
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { CLIPS, E, OUTRO, T, TOTAL, sm, type Clip } from "./story";

const SPEAKER: Record<string, { name: string; color: string }> = {
  narator: { name: "Narator", color: "#E8C77A" },
  cinta: { name: "Cinta", color: "#FF7A6E" },
  kekayaan: { name: "Kekayaan", color: "#F6C445" },
  kegembiraan: { name: "Kegembiraan", color: "#FFA04A" },
  kecantikan: { name: "Kecantikan", color: "#FF93BC" },
  kesedihan: { name: "Kesedihan", color: "#8FAEFF" },
  waktu: { name: "Waktu", color: "#DCE3EC" },
  penduduk: { name: "Penduduk pulau", color: "#86DCA2" },
};
const HIKMAH = new Set(["s10a", "s10b", "s10c", "s10d", "s10e", "s10f"]);
const NO_CAPTION = new Set(["s1c", ...HIKMAH]);

const Words: React.FC<{ c: Clip; t: number; active: string; past: string; future: string }> = ({ c, t, active, past, future }) => (
  <>
    {c.words.map((w, i) => {
      const on = t >= w.s - 0.04 && t < (c.words[i + 1]?.s ?? w.e + 0.3);
      const done = t >= w.e;
      const lift = on ? sm(w.s - 0.04, w.s + 0.08, t) : 0;
      return (
        <React.Fragment key={i}>
          <span style={{ color: on ? active : done ? past : future, display: "inline-block", transform: `translateY(${-lift * 3}px)` }}>{w.w}</span>
          {i < c.words.length - 1 ? " " : ""}
        </React.Fragment>
      );
    })}
  </>
);

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1080;
  const c = CLIPS.find((k) => t >= k.start - 0.15 && t <= k.end + 0.35);
  if (!c || NO_CAPTION.has(c.id) || t > OUTRO) return null;
  const sp = SPEAKER[c.who];
  const op = sm(c.start - 0.15, c.start + 0.05, t) * (1 - sm(c.end + 0.15, c.end + 0.35, t));
  return (
    <div style={{ position: "absolute", left: 96 * s, right: 96 * s, bottom: 54 * s, display: "flex", flexDirection: "column", alignItems: "center", opacity: op }}>
      <div style={{ fontFamily: "Cinzel", fontWeight: 700, fontSize: 19 * s, letterSpacing: 5 * s, color: sp.color, marginBottom: 6 * s, textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.9)` }}>
        ◆ {sp.name.toUpperCase()} ◆
      </div>
      <div
        style={{
          fontFamily: "EB Garamond",
          fontWeight: 600,
          fontSize: 42 * s,
          lineHeight: 1.22,
          textAlign: "center",
          maxWidth: 1380 * s,
          textShadow: `0 ${2 * s}px ${10 * s}px rgba(0,0,0,0.95), 0 0 ${3 * s}px rgba(0,0,0,0.9)`,
        }}
      >
        <Words c={c} t={t} active={sp.color} past="#FFF4E2" future="rgba(255,244,226,0.55)" />
      </div>
    </div>
  );
};

/** The hikmah: each lesson line gets its own engraved card, bigger than a caption. */
export const HikmahCard: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1080;
  const c = CLIPS.find((k) => HIKMAH.has(k.id) && t >= k.start - 0.3 && t <= k.end + 0.5);
  if (!c) return null;
  const key = c.id === "s10e" || c.id === "s10f";
  const op = sm(c.start - 0.3, c.start + 0.1, t) * (1 - sm(c.end + 0.25, c.end + 0.5, t));
  const rise = (1 - sm(c.start - 0.3, c.start + 0.3, t)) * 14;
  return (
    <div style={{ position: "absolute", left: 96 * s, right: 96 * s, bottom: 58 * s, display: "flex", flexDirection: "column", alignItems: "center", opacity: op, transform: `translateY(${rise * s}px)` }}>
      <div style={{ fontFamily: "Cinzel", fontWeight: 700, fontSize: 18 * s, letterSpacing: 9 * s, color: "#F2CF7A", marginBottom: 10 * s, textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,0.9)` }}>
        ✦ HIKMAH ✦
      </div>
      <div
        style={{
          fontFamily: "Cormorant Garamond",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: (key ? 62 : 56) * s,
          lineHeight: 1.12,
          textAlign: "center",
          maxWidth: 1500 * s,
          textShadow: `0 0 ${22 * s}px rgba(255,190,90,${key ? 0.5 : 0.3}), 0 ${3 * s}px ${14 * s}px rgba(0,0,0,0.95)`,
        }}
      >
        <Words c={c} t={t} active="#F6C445" past="#FFF4DE" future="rgba(255,244,222,0.5)" />
      </div>
      <div style={{ width: 380 * s, height: 2 * s, marginTop: 14 * s, background: "linear-gradient(90deg, rgba(242,207,122,0), #F2CF7A, rgba(242,207,122,0))" }} />
    </div>
  );
};

export const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1080;
  const op = sm(T.s1c - 0.4, T.s1c + 0.2, t) * (1 - sm(T.s2a - 1.4, T.s2a - 0.7, t));
  if (op <= 0) return null;
  const spread = 12 + 4 * sm(T.s1c - 0.4, T.s2a - 0.7, t);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 52 * s, display: "flex", flexDirection: "column", alignItems: "center", opacity: op }}>
      <div style={{ fontFamily: "Cinzel", fontWeight: 700, fontSize: 30 * s, letterSpacing: spread * s, color: "#F2CF7A", textShadow: `0 ${2 * s}px ${10 * s}px rgba(0,0,0,0.9)` }}>✦ CERITA HIKMAH ✦</div>
      <div style={{ fontFamily: "Cinzel", fontWeight: 700, fontSize: 104 * s, lineHeight: 1.0, marginTop: 6 * s, color: "#FFF4DE", letterSpacing: 3 * s, textShadow: `0 0 ${24 * s}px rgba(255,190,90,0.45), 0 ${4 * s}px ${18 * s}px rgba(0,0,0,0.95)` }}>
        Cinta <span style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontWeight: 600, fontSize: 92 * s, color: "#F2CF7A" }}>dan</span> Waktu
      </div>
    </div>
  );
};

export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const s = height / 1080;
  const op = sm(OUTRO, OUTRO + 0.6, t);
  if (op <= 0) return null;
  const k = sm(OUTRO + 0.2, TOTAL - 0.4, t);
  return (
    <AbsoluteFill style={{ background: "#0B3D2E", opacity: op, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 300 * s, transform: `scale(${0.96 + 0.04 * k})` }} />
      <div style={{ marginTop: 34 * s, fontFamily: "EB Garamond", fontWeight: 500, fontSize: 30 * s, letterSpacing: 2 * s, color: "#EAF3EE", opacity: sm(OUTRO + 0.5, OUTRO + 1.1, t) }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};

/** dark band under captions so the words stay readable over bright glass */
export const CaptionBand: React.FC<{ t: number }> = ({ t }) => {
  const any = CLIPS.some((k) => t >= k.start - 0.4 && t <= k.end + 0.6) || (t > T.s1c - 0.5 && t < E.s1c + 2);
  const op = any ? 1 : 0.6;
  return <AbsoluteFill style={{ opacity: op, background: "linear-gradient(to top, rgba(8,6,4,0.86) 0%, rgba(8,6,4,0.5) 15%, rgba(8,6,4,0) 29%)" }} />;
};
