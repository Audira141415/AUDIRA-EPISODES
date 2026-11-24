// VOXELVERSE overlay — a small pixel-type title plate on the 1080 × 1920 layout canvas (16:9: 1920 × 1080).
// Laid out in layout pixels via useFormat() and scaled to the render size by <OverlayLayer>.
// Text ≥ 36 px, inside the safe area (short: y 180…1540). `f` is a film frame on the 60 fps clock.
import React from "react";
import { useFormat } from "../../../core/film/format.ts";
import { DISPLAY } from "../../../core/type/displayFonts.ts";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Wraps any overlay at layout size and scales it to the render size (same contract as FilmScene `overlay`). */
export const OverlayLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fmt = useFormat();
  return (
    <div style={{ position: "absolute", inset: 0, width: fmt.layout.width, height: fmt.layout.height, transform: `scale(${fmt.scale})`, transformOrigin: "0 0", pointerEvents: "none" }}>
      {children}
    </div>
  );
};

export const VoxelverseOverlay: React.FC<{ f: number; title?: string; body?: string; mark?: string }> = ({
  f,
  title = "VOXELVERSE",
  body = "Satu jalan kota, disusun dari kubus.",
  mark = "SENJA · HUJAN",
}) => {
  const fmt = useFormat();
  const side = fmt.isWide ? fmt.safe.left : 72;
  const top = fmt.safe.top + 24;
  const a = ease((f - 30) / 60);
  const b = ease((f - 70) / 60);
  return (
    <div style={{ position: "absolute", left: side, top, opacity: a, transform: `translateY(${(1 - a) * -18}px)` }}>
      <div style={{ display: "inline-block", padding: "24px 30px 26px", background: "rgba(22,30,31,0.82)", borderLeft: "8px solid #f2a33a" }}>
        <div style={{ fontFamily: DISPLAY.pixel, fontWeight: 700, fontSize: 64, lineHeight: 1, letterSpacing: 2, color: "#ffcf86" }}>{title}</div>
        <div style={{ marginTop: 16, fontFamily: DISPLAY.body, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: "#e6d9bf", opacity: b }}>{body}</div>
        <div style={{ marginTop: 14, fontFamily: DISPLAY.grotesk, fontWeight: 600, fontSize: 36, letterSpacing: 4, color: "#86aca6", opacity: b }}>{mark}</div>
      </div>
    </div>
  );
};
