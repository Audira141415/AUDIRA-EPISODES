// Intro: the maquette changes era before our eyes; the AUDIRA museum plaque; the five themes; title.
import { CH, ramp, W } from "../tl.ts";
import type { ChapterDef } from "../types.ts";
import { PLAQUE, hubHeight } from "../hub.tsx";
import { H, K } from "./common.tsx";

const C = "c01_intro";
const py = hubHeight(PLAQUE[0], PLAQUE[2]);

export const ch01: ChapterDef = {
  id: C,
  card: { num: "", title: "", tag: "" },
  keys: () => [
    K(CH(C).start + 0.6, [0.6, 5.4, 15], [0.3, 1.6, -2], 38),
    K(W(C, "berubah"), [3.2, 4.6, 12.5], [0.3, 1.4, -2], 38),
    K(W(C, "tahun") + 0.6, [-2.6, 4.4, 12], [0.35, 3.0, -2.8], 38),
    K(W(C, "Audira") - 0.6, [1.6, py + 0.62, PLAQUE[2] + 1.7], [PLAQUE[0], py + 0.16, PLAQUE[2]], 34),
    K(W(C, "perubahan") + 0.4, [1.35, py + 0.7, PLAQUE[2] + 1.85], [PLAQUE[0] - 0.05, py + 0.16, PLAQUE[2]], 34),
    K(W(C, "lembahnya"), [0.5, 11, 9], [0, 0, -1], 40),
    K(W(C, "lautnya"), [4.5, 4.2, 7], [11, 0.6, -1], 40),
    K(W(C, "menaranya") + 0.2, [0.7, 2.0, 6.5], [0.35, 4.0, -3.1], 42),
    K(W(C, "Inilah"), [0.5, 4.6, 15], [0.4, 3.1, -1.6], 38),
    K(CH(C).end + 0.6, [0.3, 5.2, 16.2], [0.4, 3.0, -1.6], 38),
  ],
  callouts: () => [
    { a: W(C, "Audira") - 0.3, b: W(C, "Dari") - 0.2, kicker: "MAKET LEMBAH MAKKAH", title: "Dulu dan kini", sub: "lembah · banjir · air · laut · menara", pos: "tl" },
    { a: W(C, "Inilah") - 0.2, b: CH(C).end + 0.9, kicker: "SEJARAH MAKKAH · EP05", title: "MAKKAH YANG TAK KAMU KENAL", pos: "tc", big: true },
  ],
  hub: (t) => {
    const a = ramp(t, W(C, "berubah"), W(C, "pelan") + 0.6); // early -> Ottoman, slowly
    const b = ramp(t, W(C, "dalam"), W(C, "tahun") + 1.0); // Ottoman -> modern, quickly
    return H(a + b, a, b, 1 - 0.85 * b, b);
  },
};
