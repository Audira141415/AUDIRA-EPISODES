// AUDIRA closing card (Monolit AMD kit, stacked-reversed SVG + "Created by Agus Dwi R.").
// Place as the top layer; it fades in over `start`..`start+0.6` s and holds to the end.
// Never retype "AUDIRA" in a font: the logo is the outlined SVG from public/brand.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

export const Outro: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps - start;
  if (t < 0) return null;
  const k = width / 1080; // scale for 540 preview / 1080 final
  const fade = interpolate(t, [0, 0.6], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const rise = interpolate(t, [0.15, 1.0], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const credit = interpolate(t, [0.6, 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(t, [0, 4], [1.0, 1.04]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 42%, #11543f 0%, #0B3D2E 55%, #072a20 100%)`, opacity: fade, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translateY(${(rise - 60) * k}px) scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 420 * k }} />
        <div style={{ marginTop: 56 * k, opacity: credit, fontFamily: "Manrope, sans-serif", fontWeight: 500, fontSize: 34 * k, letterSpacing: 2 * k, color: "#E8F5EF" }}>
          Created by Agus Dwi R.
        </div>
        <div style={{ marginTop: 18 * k, width: 64 * k, height: 4 * k, borderRadius: 2 * k, background: "#FF6A3D", opacity: credit }} />
      </div>
    </AbsoluteFill>
  );
};
