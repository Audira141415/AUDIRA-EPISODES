/**
 * HyperFrames Scene Component Template — AUDIRA TECH
 * Renders a technical documentary scene with underlying AI video footage,
 * animated SVG HUD leader lines, live telemetry readouts, and kinetic subtitles.
 */

export interface HudCalloutProps {
  x: number;
  y: number;
  label: string;
  subLabel?: string;
  strokeColor?: string;
  delay?: number;
}

export interface SceneConfig {
  id: string;
  durationSeconds: number;
  videoSrc: string;
  audioVoiceoverSrc?: string;
  hudCallouts: HudCalloutProps[];
  telemetryMetrics?: {
    label: string;
    value: string;
    unit?: string;
  }[];
  subtitleText?: string;
}

/**
 * HTML / CSS Generator for HyperFrames Standalone Render Engine
 */
export function renderHyperFramesScene(scene: SceneConfig): string {
  const { id, durationSeconds, videoSrc, hudCallouts, telemetryMetrics, subtitleText } = scene;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0">
  <title>AUDIRA TECH - ${id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background-color: #0A0D14;
      font-family: 'JetBrains Mono', 'Segoe UI', monospace;
      color: #FFFFFF;
      position: relative;
    }
    
    /* Layer 0: Base AI Video Footage */
    .video-canvas-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    /* Cinematic Vignette Overlay */
    .vignette-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, transparent 40%, rgba(10, 13, 20, 0.7) 100%);
      pointer-events: none;
      z-index: 2;
    }

    /* Layer 1: Engineering HUD Layer */
    .hud-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
      pointer-events: none;
    }

    .top-telemetry-badge {
      position: absolute;
      top: 160px; /* Safe Zone > 15% */
      left: 60px;
      background: rgba(10, 13, 20, 0.85);
      border: 1px solid rgba(0, 242, 254, 0.5);
      padding: 12px 20px;
      border-radius: 4px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 20px rgba(0, 242, 254, 0.2);
    }

    .telemetry-title {
      font-size: 14px;
      color: #00F2FE;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .telemetry-value {
      font-size: 24px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      margin-top: 4px;
    }

    /* Layer 2: Safe-Zone Kinetic Subtitles */
    .subtitles-container {
      position: absolute;
      bottom: 240px; /* Safe Zone < 80% */
      left: 60px;
      right: 60px;
      text-align: center;
      z-index: 4;
    }

    .subtitle-pill {
      display: inline-block;
      background: rgba(10, 13, 20, 0.88);
      border-left: 3px solid #00F2FE;
      padding: 16px 28px;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.4;
      border-radius: 6px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }
  </style>
</head>
<body>
  <!-- Video Background -->
  <video class="video-canvas-layer" src="${videoSrc}" autoplay loop muted playsinline></video>
  <div class="vignette-overlay"></div>

  <!-- HUD Graphic Elements -->
  <div class="hud-layer">
    ${telemetryMetrics && telemetryMetrics.length > 0 ? `
    <div class="top-telemetry-badge">
      <div class="telemetry-title">${telemetryMetrics[0].label}</div>
      <div class="telemetry-value">${telemetryMetrics[0].value} <span style="font-size: 16px; color: #8892B0;">${telemetryMetrics[0].unit || ''}</span></div>
    </div>` : ''}

    <svg width="1080" height="1920" style="position: absolute; top: 0; left: 0;">
      <defs>
        <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00F2FE" flood-opacity="0.8"/>
        </filter>
      </defs>
      ${hudCallouts.map(callout => `
        <circle cx="${callout.x}" cy="${callout.y}" r="5" fill="#00F2FE" filter="url(#hud-glow)" />
        <circle cx="${callout.x}" cy="${callout.y}" r="12" fill="none" stroke="#00F2FE" stroke-width="1.5" opacity="0.6" />
        <polyline points="${callout.x},${callout.y} ${callout.x + 80},${callout.y - 60} ${callout.x + 300},${callout.y - 60}"
                  fill="none" stroke="#00F2FE" stroke-width="2" filter="url(#hud-glow)" />
        <text x="${callout.x + 90}" y="${callout.y - 70}" fill="#FFFFFF" font-size="18" font-weight="700" letter-spacing="1">
          ${callout.label}
        </text>
        ${callout.subLabel ? `
        <text x="${callout.x + 90}" y="${callout.y - 45}" fill="#00F2FE" font-size="14" opacity="0.85">
          ${callout.subLabel}
        </text>` : ''}
      `).join('\n')}
    </svg>
  </div>

  <!-- Subtitle Text -->
  ${subtitleText ? `
  <div class="subtitles-container">
    <div class="subtitle-pill">${subtitleText}</div>
  </div>` : ''}
</body>
</html>
  `;
}

