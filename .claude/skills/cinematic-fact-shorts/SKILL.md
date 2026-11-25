---
name: cinematic-fact-shorts
description: "High-retention 9:16 vertical cinematic fact shorts, pop-on-word captions, hook pacing, countdown telemetry, and viral storytelling. By AUDIRA (Agus Dwi R)."
version: "4.1.0"
author: "AUDIRA (Agus Dwi R)"
website: "https://audira.my.id/"
license: "Proprietary Commercial"
category: "short-form-video"
engine: "Remotion + R3F (default since 2026-11-17); world3d only when the user forces it"
style_code: "KINETICTYPOGRAPHY + OPENSHORTS"
---

# Cinematic Fact Shorts Skill — AUDIRA (Agus Dwi R)

Specialized motion skill for high-retention short-form video (YouTube Shorts, TikTok, Instagram Reels) delivering mind-bending facts, historical mysteries, scientific discoveries, and curious anomalies.

## 1. Video Architecture & Retention Psychology

1. **The 3-Second Hook Rule**:
   - Frame 0–90 (Seconds 0–3): Visual shock + provocative question + rapid camera zoom.
   - Example visual hook: A countdown meter racing down to zero, or a classified stamp slamming down.
2. **Safe Zones for 9:16 Vertical (1080 × 1920)**:
   - Top: panel y 236px (profile/UI).
   - Bottom 380px: Reserved for TikTok/Reels caption box, sound disc, and engagement buttons. Caption y 1300.
   - Active Visual Core: Center `1080 × 1304px` region (236–1540).
3. **Word-by-Word Kinetic Subtitles**:
   - Single-word or 2-word bursts in the center screen.
   - Active spoken word scales up (`scale: 1.04` max — world3d BRIEF limit) with accent color (Electric Yellow `#FFDF00` or Neon Lime `#39FF14`).
   - Heavy drop shadow + dark stroke (`-webkit-text-stroke: 4px black`) to guarantee legibility on any background.
4. **Pacing & Beat Matching**:
   - Shot duration: Never hold a single static camera for more than 2.2 seconds.
   - Cut transitions: Hard whip pan, flash zoom, or sound-synced glitch cut every 60–75 frames.

## 2. Color Palette & Hook Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `VIRAL_YELLOW` | `#FFDE00` | Subtitle highlight word, shocking fact hook |
| `NEON_LIME` | `#00FF66` | Verified fact check badge, positive statistic |
| `DANGER_RED` | `#FF003C` | Mystery danger indicator, classified countdown |
| `CINEMATIC_BLACK` | `#08080A` | Vignette outer edge, letterbox boundary |
| `CLEAN_WHITE` | `#FFFFFF` | Base typography, subtitle text |
| `ROYAL_PURPLE` | `#7928CA` | Cosmic / mystery accent glow |

## 3. Kinetic Patterns

- **Word Pop Zoom**: Word snaps into view with a clamped spring (`stiffness: 250, damping: 15, overshootClamping: true`), active-word scale ≤ 1.04.
- **Circular Time Progress Bar**: Subtle ring around the perimeter or top bar ticking down, locking audience completion instinct.
- **Side-by-Side Split Comparative**: Top 50% vs Bottom 50% screen comparison (e.g. Earth vs Jupiter scale).
- **Redaction Reveal**: Black censorship tape peeling or burning off to reveal secret data.

## 4. Remotion 9:16 Kinetic Subtitle Component

> Contoh Remotion — hanya bila engine: remotion; untuk world3d terjemahkan ke world3d.js (fungsi murni dari t)

```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const WordPop: React.FC<{
  word: string;
  isHighlighted: boolean;
}> = ({ word, isHighlighted }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6, overshootClamping: true },
  });

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `scale(${isHighlighted ? 1 + 0.04 * pop : 1})`,
        color: isHighlighted ? '#FFDE00' : '#FFFFFF',
        fontFamily: 'Montserrat, Inter, sans-serif',
        fontWeight: 900,
        fontSize: 54,
        textTransform: 'uppercase',
        textShadow: '0 4px 18px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,1)',
        margin: '0 8px',
      }}
    >
      {word}
    </span>
  );
};
```

## 5. Anti-Slop Enforcement
- ❌ DILARANG menempatkan teks penting di 380px bagian bawah (akan tertutup caption UI TikTok/Reels).
- ❌ DILARANG menyajikan blok teks paragraf panjang yang membuat penonton malas membaca.
- ✅ WAJIB menyertakan efek suara (SFX) risers, whoosh, dan impact braam pada setiap pergantian adegan hook.

