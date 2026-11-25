// EP048 Audio Master Clock: every beat is read from timeline.json word times (VO seconds).
import TL from "./timeline.json";

type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
export const TIMELINE = TL as unknown as { total: number; sections: Record<string, [number, number]>; clips: Clip[] };
export const SEC = TIMELINE.sections;

/** Start of the first word in clip `id` that begins with `prefix` (case-insensitive). */
export const ws = (id: string, prefix: string) => {
  const c = TIMELINE.clips.find((q) => q.id === id)!;
  const w = c.words.find((q) => q.w.toLowerCase().startsWith(prefix.toLowerCase()))!;
  return w.s;
};
export const clipStart = (id: string) => TIMELINE.clips.find((q) => q.id === id)!.start;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const ramp = (a: number, b: number, x: number) => clamp((x - a) / (b - a));

// ---- key beats ----
export const B = {
  seratus: ws("l01", "seratus"),
  tapi: clipStart("l02"),
  jam: ws("l02", "berjam"),
  konteks: SEC.KONTEKS[0],
  banyak: ws("l03", "banyak"),
  dikerjakan: ws("l03", "dikerjakan"),
  mek: SEC.MEKANISME[0],
  lembaran: ws("l04", "lembaran"),
  dipres: ws("l04", "dipres"),
  panel: ws("l04", "panel"),
  robot: ws("l05", "robot"),
  mengelas: ws("l05", "mengelas"),
  bodi: ws("l06", "bodi"),
  dicelup: ws("l06", "dicelup"),
  listrik: ws("l06", "listrik"),
  dilapisi: ws("l06", "dilapisi"),
  warna: ws("l06", "warna"),
  lalu6: ws("l06", "lalu"),
  dipanggang: ws("l06", "dipanggang"),
  reveal: SEC.REVEAL[0],
  pintu: ws("l07", "pintu"),
  lalu7: ws("l07", "lalu"),
  bodi7: ws("l07", "bodi"),
  disatukan: ws("l07", "disatukan"),
  mesin: ws("l07", "mesin"),
  pekerja: clipStart("l08"),
  memasang: ws("l08", "memasang"),
  ribuan8: ws("l08", "ribuan"),
  yang8: ws("l08", "yang"),
  datang: ws("l08", "datang"),
  waktu: ws("l08", "waktu"),
  payoff: SEC.PAYOFF[0],
  mobil9: ws("l09", "mobil"),
  disiram: ws("l09", "disiram"),
  diuji: ws("l09", "diuji"),
  kalau: clipStart("l10"),
  menarik: ws("l10", "menarik"),
  andon: ws("l10", "andon"),
  henti: ws("l10", "menghentikan"),
  outro: SEC.OUTRO[0],
  audira: ws("l12", "audira"),
  card: SEC.OUTRO[1] + 0.2,
  total: TIMELINE.total,
};

// ---- per-mechanism timing (all pure functions of t) ----
const V = 0.6; // flow line speed, m/s (stylised)
const vel = (t: number) => {
  // the line stops when the andon is pulled, then resumes in the outro
  const stop = 1 - smooth(B.henti, B.henti + 0.45, t);
  const go = smooth(B.outro + 0.5, B.outro + 1.5, t);
  return V * Math.max(stop, go);
};

const weldPts = (side: number, x0: number, x1: number, n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => {
    const k = i / Math.max(1, n - 1);
    const y = 1.0 + ((i * 0.37 + seed) % 1) * 0.95;
    return { x: lerp(x0, x1, k), y, z: side * 0.88 };
  });
const ARM_PTS = [weldPts(1, 0.1, 1.0, 9, 0.2), weldPts(1, -1.5, -0.6, 9, 0.6), weldPts(-1, -1.0, 0.6, 9, 0.1)];
const WELD0 = (B.robot + B.mengelas) / 2;
const DWELL = 0.3;

export const K = {
  flowDisp: (t: number) => {
    let d = 0;
    const dt = 1 / 60;
    for (let s = 0; s < t; s += dt) d += vel(s) * Math.min(dt, t - s);
    return d;
  },
  showChevrons: (t: number) => t >= B.konteks - 0.5,
  press: (t: number) => {
    const inShot = t >= B.mek - 0.3 && t < B.robot;
    if (!inShot) {
      const c = (t % 5) / 5;
      const ramY = 2.7 - Math.sin(Math.min(1, c * 2) * Math.PI) * 1.2;
      return { ramY, blank: -1, panel: -1, scrap: -1 };
    }
    const hit = B.dipres + 0.45;
    const down = smooth(B.dipres, hit, t) * (1 - smooth(hit + 0.2, hit + 0.75, t));
    const ramY = lerp(2.7, 1.47, down);
    const blank = t < hit ? smooth(B.lembaran - 0.3, B.lembaran + 0.6, t) : -1;
    const out = hit + 0.8;
    const panel = t < hit ? -1 : smooth(out, B.panel + 0.4, t);
    const scrap = t < hit ? -1 : (t - hit) / 0.7;
    return { ramY, blank, panel, scrap };
  },
  inWeldShot: (t: number) => t >= B.robot && t < B.bodi,
  weld: (t: number) => {
    const arms = ARM_PTS.map((pts, a) => {
      const local = t - WELD0 - a * 0.1;
      if (local < 0 || local > pts.length * DWELL) {
        const p = pts[0];
        const idle = Math.sin(t * 1.3 + a) * 0.15;
        return { x: p.x + idle, y: p.y + 0.5, z: p.z * 1.5, age: -1, burst: 0 };
      }
      const i = Math.min(pts.length - 1, Math.floor(local / DWELL));
      const f = local - i * DWELL;
      const prev = pts[Math.max(0, i - 1)];
      const p = pts[i];
      const m = smooth(0, 0.12, f);
      return { x: lerp(prev.x, p.x, m), y: lerp(prev.y, p.y, m), z: p.z, age: f - 0.12, burst: i };
    });
    const dots: { x: number; y: number; z: number; age: number }[] = [];
    ARM_PTS.forEach((pts, a) =>
      pts.forEach((p, i) => {
        const fire = WELD0 + a * 0.1 + i * DWELL + 0.12;
        dots.push({ x: p.x, y: p.y, z: p.z * 1.02, age: t - fire });
      }),
    );
    return { arms, dots };
  },
  ed: (t: number) => ({
    charge: smooth(B.dicelup + 0.6, B.listrik - 0.2, t) * (1 - smooth(B.listrik + 0.5, B.dilapisi - 0.1, t)),
    coated: t > B.dicelup + 0.9,
  }),
  edX: (t: number) => {
    const a = -20.5 - 2.6;
    const keys: [number, number][] = [
      [B.bodi - 0.1, a],
      [B.dicelup + 0.8, -20.5 + 2.8],
      [B.listrik + 0.3, -11.5 - 2.8],
      [B.dilapisi, -11.5 + 2.4],
    ];
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], smooth(keys[i - 1][0], keys[i][0], t));
    return keys[keys.length - 1][1];
  },
  paint: (t: number) => {
    const PX = -5;
    const carX = lerp(PX, 1.4, smooth(B.lalu6, SEC.MEKANISME[1] + 0.4, t));
    const k = smooth(B.dilapisi, B.lalu6 - 0.15, t);
    return { carX, front: carX + lerp(-2.5, 2.6, k), nozzleX: carX + lerp(-2.2, 2.2, k), spray: t > B.dilapisi - 0.1 && t < B.lalu6 ? 1 : 0 };
  },
  doors: (t: number) => smooth(B.pintu, B.lalu7 - 0.2, t),
  marry: (t: number) => ({
    bodyY: lerp(2.5, 0.62, smooth(B.bodi7 - 0.3, B.mesin, t)),
    agvX: lerp(7, 0, smooth(B.lalu7 - 0.2, B.disatukan, t)),
    liftY: lerp(0.32, 0.88, smooth(B.disatukan, B.mesin + 0.1, t)),
  }),
  parts: (t: number) => ({
    wheel: smooth(B.memasang - 0.2, B.memasang + 0.5, t),
    glass: smooth(B.ribuan8, B.yang8, t),
    cartX: lerp(-9, 0, 1 - Math.pow(1 - ramp(B.yang8 - 0.2, B.waktu, t), 3)),
  }),
  shower: (t: number) => smooth(B.mobil9, B.disiram, t) * (1 - smooth(B.diuji - 0.4, B.diuji, t)),
  roller: (t: number) => ({ spin: Math.pow(Math.max(0, t - B.diuji + 0.2), 2) * 7 }),
  andon: (t: number) => {
    const active = t >= B.kalau - 0.2 && t < B.outro + 1.5;
    const pull = smooth(B.menarik, B.menarik + 0.35, t) * (1 - smooth(B.henti + 0.3, B.henti + 0.8, t));
    const level = t >= B.outro + 0.8 ? 0 : t >= B.henti ? 2 : t >= B.menarik + 0.35 ? 1 : 0;
    return { active, pull, level };
  },
  path: (t: number) => (t >= B.tapi && t < SEC.KONTEKS[0] ? smooth(B.tapi + 0.5, B.jam + 0.6, t) : 0),
};
