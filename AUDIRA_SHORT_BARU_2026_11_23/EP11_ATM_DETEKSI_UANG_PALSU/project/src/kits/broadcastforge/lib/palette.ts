export const BROADCASTFORGE_PALETTE = {
  studioVoid: "#070A0F",
  floorGloss: "#0F1722",
  breakingRed: "#D32F2F",
  liveAmber: "#FFA000",
  broadcastNavy: "#0B2545",
  screenBlue: "#1E88E5",
  cyanAccent: "#00E5FF",
  headlineWhite: "#FFFFFF",
  tickerText: "#ECEFF4",
  plateDark: "rgba(12, 18, 28, 0.92)",
} as const;

export type BroadcastForgePaletteKey = keyof typeof BROADCASTFORGE_PALETTE;
