// AUDIRA outro card — the closing credit of every film (CLAUDE.md, Identitas & Branding Contract):
// the AUDIRA logo, the channel the film is published on, and "Created by Agus Dwi R.".
//
// Place it in the film's root <AbsoluteFill>, after the scenes and before <AudiraSignature>:
//
//   <AudiraOutro />
//
// It draws itself only in the last `seconds` of the composition (default 3, the same as the signature's
// outroSeconds, so the signature fades out as the card fades in). Channel name and handle come from
// src/brand/channel.json (written by `npm run channel`, check-env and render:final from the series'
// channel, rule 08); do not type them. The card keeps a slow push-in so the last seconds never read as a
// frozen frame (qa:gate flags ≥ 2 s without motion). Works in 9:16 and 16:9: sizes come from the short side.
// A project with films for several channels marks each film with its channel code: <AudiraOutro code="TECH" />
// (name and handle then come from that channel's ACCOUNT.json, via channel.json; an unknown code stops the render).

import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { channelOf } from "./channelOf";

export const AUDIRA_CREATOR = "Agus Dwi R.";

export const AudiraOutro: React.FC<{
  /** Length of the card at the end of the film, in seconds. */
  seconds?: number;
  /** Channel code for this film when the project holds films for several channels (e.g. "TECH"). Default: the series' channel. */
  code?: string;
  /** Channel name. Default: src/brand/channel.json; do not type it by hand. */
  channel?: string;
  /** Channel handle. Default: src/brand/channel.json; do not type it by hand. */
  handle?: string;
  /** Card background (AUDIRA Hijau Hutan by default). */
  background?: string;
  /** Logo in public/ (official AUDIRA stacked logo, reversed for dark backgrounds). */
  logo?: string;
  /** Accent colour for the handle line. */
  accent?: string;
}> = ({
  seconds = 3,
  code,
  channel: channelProp,
  handle: handleProp,
  background = "#0B3D2E",
  logo = "brand/stacked-reversed.svg",
  accent = "#B8E04A",
}) => {
  const ch = channelOf(code);
  const channel = channelProp ?? (ch.name || undefined);
  const handle = handleProp ?? (ch.handle || undefined);
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const start = durationInFrames - Math.round(seconds * fps);
  if (frame < start) return null;

  const t = (frame - start) / fps;
  const ease = Easing.out(Easing.cubic);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const card = interpolate(t, [0, 0.45], [0, 1], { ...clamp, easing: ease });
  const logoIn = interpolate(t, [0.1, 0.7], [0, 1], { ...clamp, easing: ease });
  const chanIn = interpolate(t, [0.35, 0.9], [0, 1], { ...clamp, easing: ease });
  const creditIn = interpolate(t, [0.6, 1.15], [0, 1], { ...clamp, easing: ease });
  // continuous push-in over the whole card, so no two frames are identical
  const push = interpolate(t, [0, seconds], [0.97, 1.03], clamp);

  const short = Math.min(width, height);
  const u = short / 1080;
  const wide = width > height;
  const rise = (v: number) => `translateY(${(1 - v) * 26 * u}px)`;

  return (
    <AbsoluteFill style={{ background, opacity: card, pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${push})`,
          // 9:16: keep the block above the bottom 380 px UI band
          paddingBottom: wide ? 0 : 160 * u,
          fontFamily: "'Space Grotesk', Manrope, system-ui, sans-serif",
          color: "#EEF4F0",
          textAlign: "center",
        }}
      >
        <Img src={staticFile(logo)} style={{ width: (wide ? 400 : 520) * u, height: "auto", opacity: logoIn, transform: rise(logoIn) }} />
        {channel || handle ? (
          <div style={{ marginTop: 44 * u, opacity: chanIn, transform: rise(chanIn) }}>
            {channel ? <div style={{ fontSize: 46 * u, fontWeight: 700, letterSpacing: 1.5 * u }}>{channel}</div> : null}
            {handle ? <div style={{ marginTop: 8 * u, fontSize: 34 * u, fontWeight: 500, color: accent, letterSpacing: 1 * u }}>{handle}</div> : null}
          </div>
        ) : null}
        <div style={{ width: 120 * u, height: 2 * u, marginTop: 34 * u, background: "rgba(238,244,240,0.35)", opacity: creditIn }} />
        <div style={{ marginTop: 26 * u, fontSize: 36 * u, fontWeight: 500, letterSpacing: 1.5 * u, opacity: creditIn, transform: rise(creditIn) }}>
          Created by {AUDIRA_CREATOR}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
