export type BroadcastCameraMode = "continuous_jib" | "multi_cam_director";

export interface BroadcastForgeState {
  t: number;
  f: number;
  liveBadgePulse: number;
  tickerScrollPx: number;
  screenGlowIntensity: number;
  studioPanX: number;
  deskElevation: number;
  // Ultimate Forged Additions
  radarWave: number;
  waveformLevels: number[];
  marketDeltaPulse: number;
  stingerOpacity: number;
  activeCameraAngle: number; // 0: Wide Jib, 1: Anchor Close, 2: Screen OTS, 3: Dynamic Low
}

export const computeBroadcastForgeState = (
  f: number,
  cameraMode: BroadcastCameraMode = "continuous_jib"
): BroadcastForgeState => {
  const t = f / 60;

  // 1. Live badge pulsing (approx 1.5 Hz heartbeat)
  const liveBadgePulse = Math.sin(t * Math.PI * 3) * 0.4 + 0.6;

  // 2. Smooth marquee ticker translation (steady 2.8 px/frame)
  const tickerScrollPx = f * 2.8;

  // 3. Ambient glow pulse on curved video wall
  const screenGlowIntensity = 0.5 + Math.sin(t * 1.8) * 0.12;

  // 4. Subtle hydraulic pedestal breathing
  const studioPanX = Math.sin(t * 0.35) * 0.35;
  const deskElevation = Math.cos(t * 0.25) * 0.04;

  // 5. Radar wave expansion for video wall world map (0 to 1 looping)
  const radarWave = (t * 0.6) % 1.0;

  // 6. Audio waveform telemetry bars (deterministic simulation from 60fps clock)
  const waveformLevels = [
    0.3 + 0.7 * Math.abs(Math.sin(f * 0.15)),
    0.2 + 0.8 * Math.abs(Math.cos(f * 0.22)),
    0.4 + 0.6 * Math.abs(Math.sin(f * 0.18 + 1.2)),
    0.1 + 0.9 * Math.abs(Math.cos(f * 0.31 + 0.5)),
    0.3 + 0.7 * Math.abs(Math.sin(f * 0.25 + 2.1)),
    0.5 + 0.5 * Math.abs(Math.cos(f * 0.19 + 1.8)),
  ];

  // 7. Market ticker flash pulse
  const marketDeltaPulse = Math.sin(t * 4.0) * 0.3 + 0.7;

  // 8. Opening breaking news stinger flash (intense in first 12 frames, then settles)
  const stingerOpacity = Math.max(0, 1 - f / 18);

  // 9. Multi-camera director cut sequence (if multi-cam mode is active)
  // Shot 1 (0-3s): Wide Studio Establishing [0]
  // Shot 2 (3-7s): Anchor Close & Headline [1]
  // Shot 3 (7-10s): OTS Video Wall & Graphics [2]
  // Shot 4 (10-12s): Dynamic Sweeping Low-Angle Outro [3]
  let activeCameraAngle = 0;
  if (t < 3.0) {
    activeCameraAngle = 0;
  } else if (t < 7.0) {
    activeCameraAngle = 1;
  } else if (t < 10.0) {
    activeCameraAngle = 2;
  } else {
    activeCameraAngle = 3;
  }

  return {
    t,
    f,
    liveBadgePulse,
    tickerScrollPx,
    screenGlowIntensity,
    studioPanX,
    deskElevation,
    radarWave,
    waveformLevels,
    marketDeltaPulse,
    stingerOpacity,
    activeCameraAngle,
  };
};
