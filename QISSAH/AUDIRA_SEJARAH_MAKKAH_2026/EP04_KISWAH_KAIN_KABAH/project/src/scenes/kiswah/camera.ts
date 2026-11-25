// Camera path for the long film. Every key is anchored to a chapter time or a word time of the
// locked voice. A key orbits a look target: D = distance, el/az in degrees. Between stations the
// camera glides along the runner with a raised arc. Framing is authored once; FormatFov converts the
// fov for 16:9, and shorts pull back a little (shortPull) so callout tags stay inside 9:16.
import { bandX0 } from "./ch00.tsx";
import { bandX7 } from "./ch07.tsx";
import { CH, smoother, SX, TOTAL, VO_END, W } from "./tl.ts";

type K = { t: number; l: [number, number, number]; D: number; el: number; az: number; fov?: number };
const k = (t: number, st: number, l: [number, number, number], D: number, el: number, az: number, fov = 34): K => ({ t, l: [SX(st) + l[0], l[1], l[2]], D, el, az, fov });

const H = "c00_hook";
const I = "c01_intro";
const c2 = "c02_tubba";
const c3 = "c03_jahiliah";
const c4 = "c04_warna";
const c5 = "c05_mesir";
const c6 = "c06_1927";
const c7 = "c07_pabrik";
const c8 = "c08_ganti";
const c9 = "c09_payoff";
const S = (id: string) => CH(id).start + 1.6;

let KEYS: K[] | null = null;
const keys = (): K[] => {
  if (KEYS) return KEYS;
  const bx = (t: number) => bandX0(t);
  const list: K[] = [
    // c00 hook: macro on the needle, the colour cards, the pile, the caravan that does not arrive
    k(0, 0, [bx(1) - 0.05, 0, 0.2], 1.7, 42, 18),
    k(W(H, "ton"), 0, [bx(W(H, "ton")), 0, 0.15], 2.0, 44, 14),
    k(W(H, "bukan"), 0, [bx(W(H, "bukan")) - 0.1, 0, 0.0], 2.4, 46, 8),
    k(W(H, "dulu"), 0, [0.25, 0, 0.75], 3.0, 50, 0),
    k(W(H, "hijau"), 0, [0.35, 0, 0.8], 3.2, 50, -4),
    k(W(H, "ditumpuk"), 0, [1.45, 0.05, 0.9], 2.6, 44, -12),
    k(W(H, "membebani"), 0, [1.6, 0.1, 0.9], 2.4, 40, -16),
    k(W(H, "mesir"), 0, [-1.0, 0.05, 1.5], 3.0, 40, 15),
    k(W(H, "gurun"), 0, [-0.75, 0.05, 1.5], 2.8, 38, 12),
    k(W(H, "kirimannya"), 0, [-0.85, 0.05, 1.55], 2.6, 40, 8),
    k(W(H, "makkah"), 0, [-0.9, 0, 1.5], 3.1, 52, 4),
    // c01 intro: rise over the band, then look down the runner
    k(CH(I).start + 0.5, 0, [0.2, 0, 0.2], 4.5, 50, 0),
    k(W(I, "kiswah"), 0, [0.2, 0, -0.4], 4.0, 55, -3),
    k(W(I, "bahan"), 0, [0.6, 0, 0.2], 5.5, 40, -15),
    k(CH(I).end, 0, [2.6, 0, 0.2], 6.5, 32, -30),
    // c02 Yemen
    k(S(c2), 1, [0, 0.5, 0.3], 6.5, 30, 20),
    k(W(c2, "ishaq"), 1, [-0.4, 0.4, 0.5], 5.5, 30, 15),
    k(W(c2, "tubba"), 1, [0.4, 0.4, 0.5], 5.3, 30, -10),
    k(W(c2, "ia"), 1, [0, 0.6, -0.3], 6.2, 24, 0),
    k(W(c2, "menariknya"), 1, [-0.3, 0.5, 0.4], 4.6, 28, 20),
    k(W(c2, "khasaf"), 1, [-0.3, 0.5, 0.4], 4.1, 28, 30),
    k(W(c2, "maafir"), 1, [-0.3, 0.5, 0.4], 4.0, 28, 5),
    k(W(c2, "bergaris"), 1, [-0.2, 0.5, 0.4], 4.2, 28, -20),
    k(W(c2, "pintu"), 1, [0.3, 0.4, 0.6], 4.0, 28, -25),
    k(W(c2, "perhatikan"), 1, [0, 0.4, 0.6], 4.8, 34, -5),
    k(CH(c2).end, 1, [0, 0.4, 0.6], 5.6, 38, 2),
    // c03 strata
    k(S(c3), 2, [0, 0.2, 0.3], 5.6, 40, 15),
    k(W(c3, "ditumpuk"), 2, [0, 0.25, 0.2], 4.2, 30, 25),
    k(W(c3, "dicopot"), 2, [0.2, 0.3, 0.2], 4.6, 28, 10),
    k(W(c3, "qushay"), 2, [-0.4, 0.1, 0.8], 4.8, 45, 10),
    k(W(c3, "giliran"), 2, [0.3, 0.1, 0.8], 4.4, 45, -10),
    k(W(c3, "aisyah"), 2, [1.5, 0, -0.3], 4.0, 50, -10),
    k(W(c3, "fathu"), 2, [0.5, 0.3, 0.4], 5.0, 35, 0),
    k(W(c3, "uniknya"), 2, [-0.5, 0.3, 0.5], 4.4, 30, 20),
    k(W(c3, "terbakar"), 2, [0.2, 0.3, 0.3], 3.8, 32, 10),
    k(CH(c3).end, 2, [0.2, 0.3, 0.4], 4.4, 35, 0),
    // c04 colours
    k(S(c4), 3, [0, 0.6, 0.4], 5.6, 30, 0),
    k(W(c4, "qabathi"), 3, [0, 0.6, 0.4], 5.0, 30, 15),
    k(W(c4, "utsman"), 3, [0, 0.6, 0.4], 5.2, 30, -10),
    k(W(c4, "tumpukan"), 3, [0.6, 0.6, 0.1], 5.0, 30, -25),
    k(W(c4, "berat"), 3, [0.9, 0.6, 0], 4.4, 28, -35),
    k(W(c4, "mencopot"), 3, [0.3, 0.7, 0.2], 5.2, 30, -15),
    k(W(c4, "merah"), 3, [0, 0.6, 0.4], 4.6, 28, 10),
    k(W(c4, "nama"), 3, [0, 0.6, 0.4], 5.0, 30, 25),
    k(W(c4, "hijau"), 3, [0, 0.6, 0.4], 4.4, 28, 5),
    k(W(c4, "hitam", 2), 3, [0, 0.6, 0.4], 4.0, 25, -5),
    k(CH(c4).end, 3, [0, 0.6, 0.4], 4.6, 28, -8),
    // c05 Nile map
    k(S(c5), 4, [0, 0, 0.1], 8.5, 62, 0),
    k(W(c5, "tinnis"), 4, [-1.1, 0, -0.9], 5.0, 58, 10),
    k(W(c5, "qalyubiyah"), 4, [-1.3, 0, -1.0], 4.2, 60, 5),
    k(W(c5, "membiayai"), 4, [-1.3, 0, -0.9], 4.0, 62, 0),
    k(W(c5, "sepuluh"), 4, [-1.3, 0, -0.9], 4.6, 58, -4),
    k(W(c5, "khoronfish"), 4, [-1.2, 0, -0.4], 3.8, 52, 15),
    k(W(c5, "kafilah"), 4, [-0.3, 0, -0.4], 5.5, 55, 10),
    k(W(c5, "baibars"), 4, [1.3, 0, 0.0], 5.5, 55, 0),
    k(CH(c5).end, 4, [2.0, 0, 0.9], 5.0, 55, -10),
    // c06 1927
    k(S(c6), 5, [-2.2, 0.1, -0.3], 4.6, 40, 20),
    k(W(c6, "berakhir"), 5, [-2.2, 0.1, -0.4], 4.4, 42, 10),
    k(W(c6, "tahun", 0), 5, [0, 0.05, -0.8], 4.6, 50, 0),
    k(W(c6, "darurat"), 5, [0, 0.05, -0.2], 4.4, 48, -5),
    k(W(c6, "terpasang"), 5, [0, 0.05, -0.5], 4.4, 52, 5),
    k(W(c6, "ajyad"), 5, [2.0, 0.1, 0.2], 4.4, 40, -15),
    k(W(c6, "belas"), 5, [2.3, 0.1, 0.4], 3.8, 45, -20),
    k(W(c6, "mei"), 5, [1.3, 0.1, 0.4], 4.8, 42, -5),
    k(W(c6, "kembali"), 5, [-1.6, 0.1, 1.0], 4.2, 45, 10),
    k(W(c6, "balik"), 5, [-2.2, 0.1, 1.1], 4.2, 45, 15),
    k(CH(c6).end, 5, [0, 0.1, 0.3], 6.5, 42, 0),
    // c07 factory
    k(S(c7), 6, [0, 0.2, -0.2], 6.5, 38, 0),
    k(W(c7, "sutra"), 6, [-2.2, 0.4, -1.0], 3.6, 30, 15),
    k(W(c7, "jacquard"), 6, [0.1, 0.7, -1.6], 4.0, 15, 0),
    k(W(c7, "sablon"), 6, [-0.5, 0, 0.15], 2.8, 45, 10),
    k(W(c7, "disulam"), 6, [bandX7(W(c7, "disulam") + 1), 0, 0.15], 2.4, 42, 15),
    k(W(c7, "delapan", 1) - 0.4, 6, [2.0, 0.4, -1.0], 4.0, 32, -10),
    k(W(c7, "murni"), 6, [1.9, 0.3, -0.6], 4.4, 35, -15),
    k(W(c7, "ya"), 6, [-1.75, 0.17, 1.25], 2.6, 28, 25),
    k(W(c7, "sebenarnya") + 1.6, 6, [-1.7, 0.2, 1.2], 2.4, 30, 18),
    k(W(c7, "timbul"), 6, [bandX7(W(c7, "timbul")), 0, 0.15], 2.0, 40, 10),
    k(W(c7, "hasilnya"), 6, [2.55, 0.5, 1.05], 4.0, 25, -25),
    k(W(c7, "ditambah"), 6, [2.55, 0.5, 1.05], 3.8, 25, -15),
    k(W(c7, "beratnya"), 6, [1.8, 0.4, 1.1], 4.6, 32, -10),
    k(CH(c7).end, 6, [0.5, 0.3, 0.6], 6.5, 40, 0),
    // c08 change ritual
    k(S(c8), 7, [0, 0.55, 0.3], 5.6, 28, 15),
    k(W(c8, "setiap"), 7, [0, 0.55, 0.3], 4.6, 28, 25),
    k(W(c8, "jatuh"), 7, [0, 0.55, 0.3], 4.4, 26, 35),
    k(W(c8, "empat"), 7, [0, 0.55, 0.3], 4.6, 28, 5),
    k(W(c8, "tirai"), 7, [-0.2, 0.5, 0.4], 3.6, 24, -5),
    k(W(c8, "sampai"), 7, [-0.6, 0.4, 0.8], 5.0, 32, -10),
    k(W(c8, "menjelang"), 7, [0, 0.3, 0.3], 4.0, 18, 20),
    k(W(c8, "ihram"), 7, [0, 0.3, 0.3], 4.2, 20, -10),
    k(W(c8, "lalu", 2), 7, [1.7, 0.05, 1.0], 3.4, 45, -10),
    k(W(c8, "dihadiahkan"), 7, [0, 0.2, 1.0], 5.5, 38, 0),
    k(W(c8, "umar"), 7, [-1.9, 0.4, 1.1], 3.2, 30, 15),
    k(CH(c8).end, 7, [-1.0, 0.4, 0.8], 4.8, 34, 5),
    // c09 payoff: fly back over the whole runner to the band, layers of history land
    k(CH(c9).start + 0.4, 7, [0, 0.4, 0.3], 7.0, 45, 0),
    k(W(c9, "lapisan"), 3, [6, 0, 0], 30, 50, 0),
    k(W(c9, "anyaman"), 0, [-1.7, 0.1, 0.95], 3.0, 45, 15),
    k(W(c9, "darurat"), 0, [-1.6, 0.1, 0.95], 3.2, 45, 8),
    k(W(c9, "kerja"), 0, [0.5, 0, 0.2], 3.0, 45, 10),
    k(W(c9, "menurutmu"), 0, [0.2, 0, 0.4], 4.6, 50, 0),
    // end screen: quiet, slow push over the band
    k(VO_END, 0, [0.2, 0, 0.3], 5.6, 55, 0),
    k(TOTAL, 0, [0.4, 0, 0.3], 5.2, 58, -3),
  ];
  list.sort((a, b) => a.t - b.t);
  KEYS = list;
  return list;
};

const rad = (d: number) => (d * Math.PI) / 180;
const mix = (a: number, b: number, x: number) => a + (b - a) * x;

export type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number; D: number };

export const cameraAt = (t: number, pull = 1): Cam => {
  const L = keys();
  let i = 0;
  while (i < L.length - 2 && t >= L[i + 1].t) i++;
  const a = L[i];
  const b = L[i + 1];
  const x = smoother(Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-3, b.t - a.t))));
  const l: [number, number, number] = [mix(a.l[0], b.l[0], x), mix(a.l[1], b.l[1], x), mix(a.l[2], b.l[2], x)];
  const far = Math.abs(b.l[0] - a.l[0]) > 4;
  const arc = far ? Math.sin(Math.PI * x) : 0;
  // continuous slow drift so no shot is ever frozen
  const D = mix(a.D, b.D, x) * (1 + arc * 0.5) * pull * (1 + Math.sin(t * 0.21) * 0.015);
  const el = rad(mix(a.el, b.el, x) + arc * 14 + Math.sin(t * 0.17) * 1.2);
  const az = rad(mix(a.az, b.az, x) + Math.sin(t * 0.13) * 2.5);
  const pos: [number, number, number] = [l[0] + D * Math.sin(az) * Math.cos(el), l[1] + D * Math.sin(el), l[2] + D * Math.cos(az) * Math.cos(el)];
  return { pos, look: l, fov: mix(a.fov ?? 34, b.fov ?? 34, x), D };
};
