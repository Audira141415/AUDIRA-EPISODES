// Engraved inset vignette: a pilgrim sailing ship under sail, in an oval gold frame.
import React from "react";
import { INK } from "./engraving.ts";

export const ShipVignette: React.FC<{ width: number; caption: string }> = ({ width, caption }) => {
  const h = width * 0.78;
  return (
    <div style={{ width, display: "flex", flexDirection: "column", alignItems: "center", filter: "drop-shadow(0 6px 10px rgba(40,24,8,0.35))" }}>
      <svg width={width} height={h} viewBox="0 0 400 312">
        <defs>
          <pattern id="hz" width="6" height="5" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2.5" x2="6" y2="2.5" stroke={INK.sepia} strokeWidth="1.1" />
          </pattern>
          <pattern id="dg" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <line x1="0" y1="2.5" x2="5" y2="2.5" stroke={INK.sepia} strokeWidth="1.4" />
          </pattern>
          <pattern id="dk" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <line x1="0" y1="2" x2="4" y2="2" stroke={INK.iron} strokeWidth="2.2" />
          </pattern>
          <clipPath id="ov">
            <ellipse cx="200" cy="156" rx="182" ry="138" />
          </clipPath>
        </defs>
        <ellipse cx="200" cy="156" rx="196" ry="152" fill={INK.goldDeep} />
        <ellipse cx="200" cy="156" rx="190" ry="146" fill={INK.gold} />
        <ellipse cx="200" cy="156" rx="182" ry="138" fill={INK.paper} />
        <g clipPath="url(#ov)">
          {/* sky lines, thinning toward the horizon */}
          <rect x="0" y="0" width="400" height="120" fill="url(#hz)" opacity="0.55" />
          <rect x="0" y="120" width="400" height="80" fill="url(#hz)" opacity="0.22" />
          {/* distant coast */}
          <path d="M0 196 Q40 182 80 190 T160 188 L160 200 L0 200 Z" fill="url(#dg)" stroke={INK.sepia} strokeWidth="1.2" />
          {/* sea */}
          {Array.from({ length: 12 }).map((_, i) => {
            const y = 204 + i * 9;
            return <path key={i} d={`M0 ${y} q12 -${3 + i * 0.3} 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0`} fill="none" stroke={INK.sepia} strokeWidth={0.9 + i * 0.12} />;
          })}
          {/* hull */}
          <path d="M92 214 Q200 236 318 206 L304 232 Q200 252 108 236 Z" fill="url(#dk)" stroke={INK.iron} strokeWidth="2" />
          <path d="M96 216 Q200 238 314 208" fill="none" stroke={INK.gold} strokeWidth="2" />
          <path d="M300 208 L360 186" stroke={INK.iron} strokeWidth="2.4" />
          {/* masts */}
          <line x1="160" y1="222" x2="160" y2="70" stroke={INK.iron} strokeWidth="3" />
          <line x1="238" y1="216" x2="238" y2="54" stroke={INK.iron} strokeWidth="3" />
          <line x1="110" y1="220" x2="112" y2="120" stroke={INK.iron} strokeWidth="2.2" />
          {/* square sails, bellied */}
          <path d="M128 86 Q160 80 192 86 Q196 112 190 136 Q160 130 130 136 Q124 112 128 86 Z" fill="url(#dg)" stroke={INK.sepia} strokeWidth="1.8" />
          <path d="M124 142 Q160 136 196 142 Q202 172 194 198 Q160 192 126 198 Q118 172 124 142 Z" fill="url(#dg)" stroke={INK.sepia} strokeWidth="1.8" />
          <path d="M206 68 Q238 62 270 68 Q275 96 268 122 Q238 116 208 122 Q201 96 206 68 Z" fill="url(#dg)" stroke={INK.sepia} strokeWidth="1.8" />
          <path d="M202 128 Q238 122 276 128 Q282 160 274 190 Q238 184 204 190 Q196 160 202 128 Z" fill="url(#dg)" stroke={INK.sepia} strokeWidth="1.8" />
          <path d="M112 128 L96 206 L112 204 Z" fill="url(#dg)" stroke={INK.sepia} strokeWidth="1.5" />
          <path d="M300 206 L246 92 L246 200 Z" fill="url(#hz)" stroke={INK.sepia} strokeWidth="1.5" />
          {/* rigging */}
          <path d="M160 70 L96 214 M160 70 L238 54 M238 54 L358 186 M238 54 L300 208" stroke={INK.sepia} strokeWidth="0.9" fill="none" />
          {/* pennants */}
          <path d="M238 54 L238 40 L264 46 L238 52" fill={INK.terracotta} stroke={INK.iron} strokeWidth="1" />
          <path d="M160 70 L160 58 L182 63 L160 68" fill={INK.terracotta} stroke={INK.iron} strokeWidth="1" />
          {/* birds */}
          <path d="M300 82 q6 -6 12 0 q6 -6 12 0 M330 104 q4 -4 8 0 q4 -4 8 0" fill="none" stroke={INK.sepia} strokeWidth="1.4" />
        </g>
        <ellipse cx="200" cy="156" rx="182" ry="138" fill="none" stroke={INK.sepia} strokeWidth="2" />
      </svg>
      <div
        style={{
          marginTop: width * 0.02,
          padding: `${width * 0.012}px ${width * 0.05}px`,
          background: INK.paper,
          border: `2px solid ${INK.gold}`,
          outline: `1px solid ${INK.sepia}`,
          outlineOffset: 3,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: width * 0.068,
          letterSpacing: width * 0.006,
          color: INK.sepia,
          whiteSpace: "nowrap",
        }}
      >
        {caption}
      </div>
    </div>
  );
};
