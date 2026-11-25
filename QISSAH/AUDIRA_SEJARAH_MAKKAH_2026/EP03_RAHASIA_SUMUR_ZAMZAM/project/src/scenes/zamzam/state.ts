// Time → state of the hero cutaway, from word anchors (c00, c04 basement part, c05, c06 start, c09).

import { at, chapter, prog, smooth, window01 } from "./time.ts";
import { HERO_DEFAULT, type HeroState } from "./World.tsx";
import { L } from "./layout.ts";
import { T4 } from "./ch04.tsx";

const A = "c05_anatomi";
export const T5 = {
  start: chapter(A).start,
  hand: at(A, "digali dengan tangan"),
  alluvium: at(A, "Sekitar tiga belas"),
  diorite: at(A, "tujuh belas meter"),
  weathered: at(A, "lapisan batuan lapuk"),
  koshak: at(A, "Menurut catatan Yahya"),
  opening: at(A, "bukaan terbesarnya"),
  source: at(A, "Dari mana airnya"),
  recharge: at(A, "Akuifer itu diisi"),
  quota: at(A, "airnya dijatah"),
  pump: at(A, "Pompa menarik"),
  sensor: at(A, "Sensor memantau"),
  threshold: at(A, "Kalau muka air"),
  tunnel: at(A, "terowongan drainase"),
  stopped: at(A, "proyek itu dihentikan"),
  found: at(A, "fondasi gedung"),
  end: chapter(A).end,
};
const H0 = { sensor: at("c00_hook", "diawasi sensor"), closed: at("c00_hook", "sampai tertutup") };
const P9 = { sensor: at("c09_penutup", "dijaga sensor"), rules: at("c09_penutup", "dilindungi sampai") };
const C6 = chapter("c06_perjalanan");
const KUDAI = at("c06_perjalanan", "ke kawasan Kudai");

export function heroState(t: number): HeroState {
  const s: HeroState = { ...HERO_DEFAULT };
  // c04 basement story: lowered (open entrance, visitors) → room 2 → sealed → glass room
  if (t > T4.lowered - 1 && t < T4.end + 1) {
    s.seal = smooth(prog(t, T4.seal + 0.8, T4.seal + 3));
    s.visitors = smooth(prog(t, T4.visitors - 0.5, T4.visitors + 0.8)) * (1 - smooth(prog(t, T4.seal + 0.3, T4.seal + 1.5)));
    s.room2 = smooth(prog(t, T4.room2 + 0.5, T4.room2 + 1.6));
    s.glass = smooth(prog(t, T4.glass, T4.glass + 1.6));
  }
  // hook: the entrance closes on "sampai tertutup"
  if (t < chapter("c01_intro").start) s.seal = smooth(prog(t, H0.closed - 1.2, H0.closed + 0.6));
  s.museum = window01(t, T4.museum - 0.4, T5.start + 3, 1.0);

  // c05 anatomy
  s.opening = window01(t, T5.opening, T5.source + 0.5, 0.8);
  s.rain = window01(t, T5.recharge - 0.3, T5.quota + 0.5, 1.0);
  s.sensor = Math.max(window01(t, T5.sensor - 0.4, T5.end, 0.6), window01(t, H0.sensor - 0.3, H0.sensor + 4, 0.5), window01(t, P9.sensor - 0.3, P9.sensor + 4, 0.5));
  const dip = smooth(prog(t, T5.threshold + 0.4, T5.threshold + 2.6)) * (1 - smooth(prog(t, T5.threshold + 6.5, T5.tunnel - 0.5)));
  const tunnelDrop = smooth(prog(t, T5.tunnel + 1.5, T5.tunnel + 4.5)) * (1 - smooth(prog(t, T5.stopped + 0.5, T5.found)));
  s.water = L.waterLevel - 1.9 * dip - 3.0 * tunnelDrop;
  s.pumpOn = dip > 0.92 || tunnelDrop > 0.5 ? 0 : 1;
  s.tunnel = window01(t, T5.tunnel + 0.3, T5.end + 1, 0.8);
  s.tunnelStop = smooth(prog(t, T5.stopped, T5.stopped + 0.8));
  const fnd = Math.max(window01(t, T5.found - 0.3, T5.end + 1.5, 1.2), window01(t, P9.rules - 0.3, P9.rules + 4, 0.8));
  s.buildings = fnd;
  s.table = Math.max(window01(t, T5.tunnel, T5.end + 1.5, 0.8), fnd);
  // c06: the drop leaves the well
  if (t > C6.start - 0.5 && t < KUDAI + 0.5) s.drop = smooth(prog(t, C6.start + 0.5, KUDAI));
  return s;
}
