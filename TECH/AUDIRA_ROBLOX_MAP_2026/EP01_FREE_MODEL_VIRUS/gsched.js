// GLITCHFORGE schedule for EP01: per-effect intensities as a pure function of t, re-rolled at a stepped 12 Hz.
// Shared by the 3D post pass (world3d.js) and the HUD text (inlined by build-video.mjs). Start clean, earn the corruption, snap back.
export function gstate(t, K, AT) {
  const st = Math.floor(t * 12);
  const h = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const r1 = h(st), r2 = h(st + 0.31), r3 = h(st + 0.67);
  const on = (p) => (r1 < p ? 0.5 + 0.5 * r2 : 0.1 * r2);
  const rp = (a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const w = (a, b) => (t >= a && t < b ? 1 : 0);
  let S = 0, T = 0, B = 0, M = 0, O = 0, L = 0;
  const mx = (s, tr, b, m, o) => { S = Math.max(S, s); T = Math.max(T, tr); B = Math.max(B, b); M = Math.max(M, m); O = Math.max(O, o); };
  // s1 hook: creeps in from "Tapi", one hard burst on "virus", a low hum to the cut
  const v = AT["s1:virus"], tp = AT["s1:Tapi"];
  if (w(tp, v)) { const c = rp(tp, v); mx(c * 0.45 * on(0.3 + 0.4 * c), c * 0.5 * on(0.25 + 0.3 * c), 0, 0, 0); }
  if (w(tp, tp + 0.45)) mx(0.55 + 0.2 * r2, 0.18 * on(0.5), 0, 0, 0);
  if (w(v, v + 0.6)) mx(0.75 + 0.25 * r2, 0.7 * on(0.8), 0.5 * on(0.7), 0.25 * r3, 0);
  if (w(v + 0.6, K.s1e)) mx(0.25 * on(0.4), 0.3 * on(0.3), 0, 0, 0);
  // glitch cuts between scenes; the last one is soft because the scripts are off by then
  for (const s of ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]) if (w(K[s] - 0.3, K[s] + 0.18)) { const k = s === "s8" ? 0.35 : 1; mx(0.8 * k, 0.7 * k * on(0.8), 0.45 * k * on(0.6), 0.2 * k, 0); }
  // s3: the waiting script wakes and reaches outside
  const wk = AT["s3:menunggu"], call = AT["s3:memanggil"], lu = AT["s3:luar"];
  if (w(wk, call)) { const c = rp(wk, call); mx(c * 0.35 * on(0.5), c * 0.4 * on(0.3), 0, 0, 0); }
  if (w(call, K.s3e)) { const c = rp(call, lu); mx((0.4 + 0.5 * c) * on(0.7), 0.6 * on(0.4 + 0.3 * c), 0.6 * c * on(0.6), 0.55 * c * c * (0.4 + 0.6 * on(0.6)), 0.5 * c * on(0.6)); }
  if (w(lu + 0.05, lu + 0.4)) L = 0.85 + 0.15 * r3;
  // s4: scrambled code
  const di = AT["s4:diacak"];
  if (w(di, di + 0.9)) mx(0.5 * on(0.7), 0.6 * on(0.6), 0.5 * on(0.5), 0, 0);
  // s5: unreadable code hums
  if (w(AT["s5:kodenya"], AT["s5:kreator"])) mx(0.3 * on(0.5), 0.25 * on(0.3), 0, 0, 0);
  // s6: suspicious tree
  const dc = AT["s6:dicurigai"];
  if (w(dc, dc + 0.55)) mx(0.7, 0.6 * on(0.7), 0.4 * on(0.6), 0.2, 0);
  // s7: low flicker until "Disable Scripts", then hard clean
  if (w(K.s7 + 0.2, AT["s7:Scripts"])) mx(0.15 * on(0.25), 0.15 * on(0.2), 0, 0, 0);
  // s8: one tiny stamp on the question
  const gr = AT["s8:gratis"];
  if (w(gr, gr + 0.25)) mx(0.5, 0.3, 0, 0, 0);
  return { seed: (st % 997) + 0.37, split: S, tear: T, block: B, mosh: M, sort: O, lost: L, hud: Math.max(S, T, B, L) };
}
