// EP02 Audio Master Clock + camera path. Every beat is keyed to word times in timeline.json.
import * as THREE from "three";
import TL from "./timeline.json";

export type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
export const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
export const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;

// find a word by its text (lowercase, punctuation stripped), nth occurrence inside the clip
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}.]/gu, "").replace(/\.$/, "");
const find = (id: string, w: string, nth = 0) => {
  const c = CLIPS.find((x) => x.id === id);
  const hits = c ? c.words.filter((x) => norm(x.w) === w) : [];
  if (!hits[nth]) throw new Error(`timeline word ${id}:${w}#${nth} missing`);
  return hits[nth];
};
const W = (id: string, w: string, nth = 0) => find(id, w, nth).s;
const E = (id: string, w: string, nth = 0) => find(id, w, nth).e;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

export const T = {
  // hook
  num: W("hook", "6.700"),
  bukan: W("hook", "bukan"),
  kalimantan: W("hook", "kalimantan"),
  papua: W("hook", "papua"),
  // konteks
  itu: W("konteks", "itu"),
  bmkg: W("konteks", "bmkg"),
  okt11: W("konteks", "11"),
  kemarau: W("konteks", "kemarau"),
  elnino: W("konteks", "el"),
  merauke: W("konteks", "merauke"),
  seratus: W("konteks", "seratus"),
  hujanEnd: E("konteks", "hujan"),
  api: W("konteks", "api"),
  sepuluh: W("konteks", "sepuluh"),
  dulu: W("konteks", "dulu"),
  rawa: W("konteks", "rawa"),
  tahun: W("konteks", "tahun"),
  kering: W("konteks", "kering"),
  // pengembangan
  yonas: W("pengembangan", "yonas"),
  bbc: W("pengembangan", "bbc"),
  masyarakat: W("pengembangan", "masyarakat"),
  asapnya: W("pengembangan", "asapnya"),
  maluku: W("pengembangan", "maluku"),
  dinas: W("pengembangan", "dinas"),
  ispa: W("pengembangan", "ispa"),
  empat: W("pengembangan", "empat"),
  di1: W("pengembangan", "di", 1),
  puskesmas: W("pengembangan", "puskesmas"),
  meraukeP: W("pengembangan", "merauke"),
  tiga0: W("pengembangan", "30"),
  juli: W("pengembangan", "juli"),
  september: W("pengembangan", "september"),
  kemarau2: W("pengembangan", "kemarau"),
  debu: W("pengembangan", "debu"),
  asap2: W("pengembangan", "asap"),
  // penjelasan
  lalu: W("penjelasan", "lalu"),
  n63: W("penjelasan", "63"),
  n25: W("penjelasan", "25"),
  karena: W("penjelasan", "karena"),
  s63: W("penjelasan", "63", 1),
  sembilan: W("penjelasan", "sembilan"),
  s25: W("penjelasan", "25", 1),
  total: W("penjelasan", "total"),
  pemkab: W("penjelasan", "pemkab"),
  dan: W("penjelasan", "dan"),
  belum: W("penjelasan", "belum"),
  itu2: W("penjelasan", "itu"),
  satelit: W("penjelasan", "satelit"),
  // payoff
  okt31: W("payoff", "31"),
  kepala1: W("payoff", "kepala"),
  kepala2: W("payoff", "kepala", 1),
  terbang: W("payoff", "terbang"),
  meraukeF: W("payoff", "merauke"),
  asapF: W("payoff", "asap"),
  titikApi: W("payoff", "titik"),
  wilayah: W("payoff", "wilayah"),
  penyebab: W("payoff", "penyebab"),
  lalu6: W("payoff", "lalu"),
  nov6: W("payoff", "6"),
  naik: W("payoff", "naik"),
  n66: W("payoff", "66"),
  // outro
  apiO: W("outro", "api"),
  musim: W("outro", "musim"),
  banjir: W("outro", "banjir"),
  ikuti: W("outro", "ikuti"),
  ini: W("outro", "ini"),
};
export const OUTRO_AT = SEC.OUTRO[1] + 0.2;
// hard cuts hidden inside a smoke wipe
export const CUT1 = T.yonas - 0.18;
export const CUT2 = SEC.PAYOFF[0] - 0.03;

// ---------------------------------------------------------------- helicopter path (payoff)
const HA = new THREE.Vector3(-6.5, 2.3, 2.5);
const HB = new THREE.Vector3(-1.6, 2.5, -8.5);
export const HELI_T0 = CUT2 - 0.3;
export const HELI_T1 = T.asapF + 1.6;
export const heliPos = (t: number) => HA.clone().lerp(HB, (t - HELI_T0) / (HELI_T1 - HELI_T0));
export const HELI_DIR = HB.clone().sub(HA).normalize();

// ---------------------------------------------------------------- camera keyframes
type Key = { t: number; p: [number, number, number]; q: [number, number, number] };
const heliKey = (t: number, off: [number, number, number]): Key => {
  const h = heliPos(t);
  return { t, p: [h.x + off[0], h.y + off[1], h.z + off[2]], q: [h.x + HELI_DIR.x * 0.3, h.y - 0.05, h.z + HELI_DIR.z * 0.3] };
};
const SEGS: Key[][] = [
  [
    { t: 0, p: [-0.3, 4.6, 6.8], q: [1.6, 0, -4.2] },
    { t: T.kalimantan, p: [0.3, 4.2, 4.6], q: [2.3, 0, -6.4] },
    { t: T.papua + 0.4, p: [-0.6, 8.4, 8.6], q: [-2.0, 0, -7.5] },
    { t: T.okt11, p: [-1.6, 10.2, 6.0], q: [-2.6, 0, -8.0] },
    { t: T.merauke, p: [-4.6, 6.2, 0.2], q: [-2.5, 0, -6.1] },
    { t: T.sepuluh + 0.2, p: [-0.8, 11.5, 6.0], q: [2.0, 0, -7.5] },
    { t: T.rawa + 0.4, p: [1.1, 5.4, 6.0], q: [2.8, 0, -0.9] },
    { t: CUT1 + 0.2, p: [2.2, 4.7, 5.1], q: [2.9, 0, -0.8] },
  ],
  [
    { t: CUT1 - 0.2, p: [-0.75, 0.78, 3.7], q: [-1.3, 0.16, 0.9] },
    { t: T.masyarakat, p: [-1.6, 0.72, 3.55], q: [-1.1, 0.16, 0.9] },
    { t: T.asapnya + 0.5, p: [-1.4, 1.9, 3.8], q: [-1.8, 0.3, 0.4] },
    { t: T.maluku, p: [1.2, 8.6, 3.0], q: [-5.0, 0, -8.5] },
    { t: T.empat, p: [-1.0, 12.5, 5.5], q: [-3.0, 0, -9.0] },
    { t: T.meraukeP, p: [-0.7, 3.9, 0.4], q: [-2.7, 0.5, -5.4] },
    { t: T.kemarau2, p: [-4.9, 3.7, -0.4], q: [-2.7, 0.5, -5.4] },
    { t: T.lalu + 0.3, p: [-4.0, 4.6, -1.0], q: [-2.5, 0.5, -6.0] },
    { t: T.n25 + 0.2, p: [3.0, 15.5, -4.8], q: [3.0, 0, -8.6] },
    { t: T.s63 + 0.6, p: [3.05, 4.4, -6.4], q: [3.0, 0, -8.6] },
    { t: T.s25 - 0.1, p: [3.1, 5.0, -6.2], q: [3.0, 0, -8.6] },
    { t: T.total + 0.3, p: [3.0, 25.5, -1.6], q: [3.0, 0, -6.0] },
    { t: T.dan + 0.2, p: [3.0, 25.8, -1.3], q: [3.0, 0, -6.1] },
    { t: T.itu2, p: [2.8, 14.0, -2.4], q: [2.6, 0, -9.2] },
    { t: CUT2 + 0.2, p: [2.6, 6.2, -6.2], q: [2.6, 0, -9.4] },
  ],
  [
    heliKey(CUT2 - 0.2, [3.4, 2.8, 3.2]),
    heliKey(T.kepala2, [3.8, 3.0, 0.4]),
    heliKey(T.terbang + 0.4, [2.6, 3.2, -2.4]),
    heliKey(T.asapF, [1.2, 5.2, 1.6]),
    { t: T.wilayah - 0.4, p: [2.0, 12.0, -2.0], q: [7.0, 0, -12.0] },
    { t: T.penyebab + 1.0, p: [2.9, 10.4, -3.6], q: [7.0, 0, -12.2] },
    { t: T.naik + 0.6, p: [-0.5, 17.0, 7.0], q: [2.0, 0, -11.0] },
    { t: T.musim + 0.4, p: [-3.0, 11.0, 4.5], q: [-2.0, 0, -8.0] },
    { t: T.ikuti + 0.8, p: [-2.6, 8.5, 1.8], q: [-2.7, 0, -6.4] },
    { t: OUTRO_AT, p: [-2.3, 6.6, 0.2], q: [-2.7, 0, -6.0] },
    { t: TOTAL + 0.5, p: [-2.2, 6.3, -0.2], q: [-2.7, 0, -6.0] },
  ],
];
const SEG_START = [0, CUT1, CUT2];

type V = [number, number, number];
const hermite = (keys: Key[], t: number, k: "p" | "q"): V => {
  const n = keys.length;
  if (t <= keys[0].t) return keys[0][k];
  if (t >= keys[n - 1].t) return keys[n - 1][k];
  let i = 0;
  while (i < n - 2 && t >= keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const dt = b.t - a.t;
  const vel = (j: number): V => {
    const lo = keys[Math.max(0, j - 1)], hi = keys[Math.min(n - 1, j + 1)];
    const d = hi.t - lo.t;
    const f = j === 0 || j === n - 1 ? 0.5 : 1;
    return [0, 1, 2].map((c) => ((hi[k][c] - lo[k][c]) / d) * f) as V;
  };
  const m0 = vel(i), m1 = vel(i + 1);
  const u = (t - a.t) / dt, u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  return [0, 1, 2].map((c) => h00 * a[k][c] + h10 * dt * m0[c] + h01 * b[k][c] + h11 * dt * m1[c]) as V;
};

export const FOV = 44;
export const camPose = (t: number) => {
  let s = 0;
  for (let i = 0; i < SEG_START.length; i++) if (t >= SEG_START[i]) s = i;
  const keys = SEGS[s];
  const p = hermite(keys, t, "p"), q = hermite(keys, t, "q");
  // gentle drone sway (deterministic)
  const sx = Math.sin(t * 0.7) * 0.05 + Math.sin(t * 1.9 + 1.2) * 0.015;
  const sy = Math.sin(t * 0.9 + 0.4) * 0.03;
  return {
    pos: new THREE.Vector3(p[0] + sx, p[1] + sy, p[2]),
    target: new THREE.Vector3(q[0] + sx * 0.6, q[1], q[2]),
  };
};

export const projector = (t: number, w: number, h: number) => {
  const { pos, target } = camPose(t);
  const c = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 300);
  c.position.copy(pos);
  c.lookAt(target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  // returns position in 1080-wide design space
  return (v: THREE.Vector3) => {
    const p = v.clone().project(c);
    const k = 1080 / w;
    return { x: ((p.x + 1) / 2) * w * k, y: ((1 - p.y) / 2) * h * k, behind: p.z > 1 };
  };
};
