// ISLAMICDOCUMENTARY motion — Baitul Hikmah, Baghdad, as one 12 s beat. No figures, no faces.
//   0–12 s     the gilt girih star turns slowly in its niche
//   0.4–3.0 s  the wall's small inlaid stars light up from the centre outward
//   3.0–7.0 s  the gold dome and the minarets rise out of the sandstone floor
//   8.4–9.8 s  payoff: dawn — the key light warms and swells, star and dome glow
export interface IslamicDocumentaryState {
  starRotation: number;
  /** 0…1 how far the inlay has lit, from the niche centre outward (compare with a tile's radius). */
  inlay: number;
  domeReveal: number;
  minaretReveal: number;
  /** 0…1 payoff dawn. */
  dawn: number;
  /** Kept for older callers. */
  lightPulse: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => {
  const p = clamp01(x);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

export const computeIslamicDocumentaryState = (f: number): IslamicDocumentaryState => {
  const t = f / 60;
  const dawn = easeInOut((t - 8.4) / 1.4);
  return {
    starRotation: t * 0.22,
    inlay: easeOut((t - 0.4) / 2.6),
    domeReveal: easeInOut((t - 3.0) / 3.2),
    minaretReveal: easeOut((t - 3.6) / 3.4),
    dawn,
    lightPulse: 1 + dawn * 0.6,
  };
};
