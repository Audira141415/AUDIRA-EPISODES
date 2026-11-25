// Coin schedule shared by world3d.js (browser, copied as assets/lib/gsched.js) and build-video.mjs (writes coins.json for mix.py).
// Pure: every time comes from scene keys K or word anchors A, so the real voice moves everything together.
export const fr = (x) => x - Math.floor(x);

export const COIN = { R: 0.06, H: 0.013 };
export const PT = 0.08; // plinth top

export function sched(A, K) {
  // hook cascade: coins already pouring at t=0 (flash-forward), rewound into the door at the end of s1
  const N1 = 150, c1 = [];
  for (let i = 0; i < N1; i++) c1.push([-1.7 + i * 0.034, 0.42 + 0.16 * fr(i * 0.618034 + 0.13)]);
  // s5 flood: NB coins sit in the coin box, the rest burst out when the door opens and rush on "meluap"
  const NB = 56, N2 = 420, c2 = [];
  const tO = A("s5:dibuka") + 0.2, tM = A("s5:meluap"), tE = A("s5:sen") + 0.3;
  for (let i = 0; i < N2; i++) {
    if (i < NB) { c2.push([-99, 0]); continue; }
    const u = (i - NB) / (N2 - NB);
    const t0 = u < 0.35 ? tO + (tM - tO) * (u / 0.35) : tM + (tE - tM) * Math.pow((u - 0.35) / 0.65, 0.9);
    c2.push([t0, 0.45 + 0.2 * fr(i * 0.618034 + 0.4)]);
  }
  // s8: every flood coin flies into seven perfect columns, level by level
  const COLS = 7, st = [], tS = A("s8:Kerusakan") + 0.2;
  for (let i = 0; i < N2; i++) { const c = i % COLS, h = Math.floor(i / COLS); st.push([tS + h * 0.034 + c * 0.05, 0.34, c, h]); }
  const hero = A("s8:Kalau") - 0.25;
  return { N1, c1, NB, N2, c2, COLS, st, hero, tR0: K.s1e, tR1: K.s1e + 0.9 };
}
