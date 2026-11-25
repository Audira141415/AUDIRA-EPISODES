// World state as a pure function of film time t (vo.wav seconds). Every key is a word or chapter
// anchor from timeline.json, never an absolute second.
import { CH, VO_END, clamp01, ramp, track, w } from "./tl.ts";

const c00 = "c00_hook", c01 = "c01_intro", c02 = "c02_halaman", c03 = "c03_khalifah", c04 = "c04_kubah";
const c05 = "c05_beton", c06 = "c06_fahd", c07 = "c07_terbesar", c08 = "c08_tersisa", c09 = "c09_payoff", c10 = "c10_cta";

export const A = {
  // hook + intro
  hDulu: w(c00, "dulu"), hTembok: w(c00, "tembok"), hRumah: w(c00, "rumah"), hTiang: w(c00, "tiang"), hTumbuh: w(c00, "tumbuh"), hJuta: w(c00, "juta"),
  iStart: CH[c01].start, iSejarah: w(c01, "sejarah"), iAudira: w(c01, "audira"), iEnd: CH[c01].end,
  // ch1
  c2: CH[c02].start, nol: w(c02, "nol"), rumahRumah: w(c02, "rumah-rumah"), seribu: w(c02, "seribu"), y17: w(c02, "17"), banjir: w(c02, "banjir"),
  umar: w(c02, "umar", 0), membeli: w(c02, "membeli", 0), merobohkan: w(c02, "merobohkannya"), tembok: w(c02, "tembok", 1), lampu: w(c02, "lampu"),
  bendungan: w(c02, "bendungan"), jadi: w(c02, "jadi"), utsman: w(c02, "utsman", 0), serambi: w(c02, "serambi"), riwaq: w(c02, "riwaq"),
  zubair: w(c02, "zubair"), tujuhRibu: w(c02, "tujuh"), mengubin: w(c02, "mengubin"), c2end: CH[c02].end,
  // ch2
  c3: CH[c03].start, walid: w(c03, "al-walid", 0), mesirSyam: w(c03, "syam"), marmer: w(c03, "marmer", 1), abbasiyah: w(c03, "abbasiyah"),
  y137: w(c03, "137"), menara1: w(c03, "menara", 0), mahdi: w(c03, "al-mahdi", 0), masalah: w(c03, "masalah"), tengah0: w(c03, "tengah", 0),
  qubais: w(c03, "qubais"), berani: w(c03, "berani"), dipindahkan: w(c03, "dipindahkan"), tengah1: w(c03, "tengah", 1), y167: w(c03, "167"),
  duaPuluhDelapan: w(c03, "delapan", 0), menara3: w(c03, "menara", 1), delapanRatus: w(c03, "delapan", 1), c3end: CH[c03].end,
  // ch3
  c4: CH[c04].start, y1400: w(c04, "1400"), kebakaran: w(c04, "kebakaran"), barquq: w(c04, "barquq"), y1570: w(c04, "1570-an"),
  miring: w(c04, "miring", 0), selim: w(c04, "selim", 0), dibongkar: w(c04, "dibongkar"), kubah: w(c04, "kubah-kubah", 0), pilar: w(c04, "pilar-pilar"),
  y1576: w(c04, "1576"), sinan: w(c04, "sinan"), mesir: w(c04, "mesir"), bertambah: w(c04, "bertambah"), wajah: w(c04, "wajahnya"),
  kubah2: w(c04, "kubah-kubah", 1), miring2: w(c04, "miring", 1), c4end: CH[c04].end,
  // ch4
  c5: CH[c05].start, y1928: w(c05, "1928"), listrik: w(c05, "listrik"), y1955: w(c05, "1955", 0), y1976: w(c05, "1976"), lantai3: w(c05, "lantai", 0),
  tujuhMenara: w(c05, "tujuh"), seratus: w(c05, "seratus"), jarang: w(c05, "jarang"), pasar: w(c05, "pasar"), bersai: w(c05, "bersa'i"),
  digabungkan: w(c05, "digabungkan"), jalurnya: w(c05, "jalurnya"), konferensi: w(c05, "konferensi"), menolak: w(c05, "menolak"), thassos: w(c05, "thassos"),
  c5end: CH[c05].end,
  // ch5
  c6: CH[c06].start, y1983: w(c06, "1983"), sementara: w(c06, "sementara"), atap: w(c06, "atap", 0), y1986: w(c06, "1986"), sembilan: w(c06, "sembilan", 0),
  y1988: w(c06, "1988"), ajyad: w(c06, "ajyad"), pintu: w(c06, "pintu", 0), eskalator: w(c06, "eskalator"), duaMenara: w(c06, "menara", 0),
  pelataran: w(c06, "pelataran"), luas356: w(c06, "enam", 1), kapasitas: w(c06, "kapasitasnya"), y1993: w(c06, "1993"), c6end: CH[c06].end,
  // ch6
  c7: CH[c07].start, y2008: w(c07, "2008"), y2011: w(c07, "2011"), properti: w(c07, "properti"), beton: w(c07, "beton"), y2015: w(c07, "2015", 0),
  crane: w(c07, "crane"), y2017: w(c07, "2017"), kaliLipat: w(c07, "kali"), jembatan: w(c07, "jembatan", 0), y2016: w(c07, "2016"),
  bongkarJembatan: w(c07, "dibongkar", 1), tiang84: w(c07, "tiang"), sembilanBelas: w(c07, "sembilan"), riwaqSaudi: w(c07, "riwaq"),
  seratusTujuh: w(c07, "tujuh"), c7end: CH[c07].end,
  // ch7
  c8: CH[c08].start, abbasi: w(c08, "abbasi", 0), utsmani: w(c08, "utsmani", 0), tiang95: w(c08, "tiang", 0), y167b: w(c08, "167"),
  dibongkar8: w(c08, "dibongkar"), kembali: w(c08, "kembali"), isra: w(c08, "isra'"), independent: w(c08, "independent"), alawi: w(c08, "al-alawi"),
  resmi: w(c08, "resmi"), hariIni: w(c08, "hari"), kubah8: w(c08, "kubah"), asli: w(c08, "asli"), c8end: CH[c08].end,
  // payoff + cta
  c9: CH[c09].start, p1: w(c09, "seribu"), p2: w(c09, "delapan"), p3: w(c09, "seratus"), p4: w(c09, "tiga", 0), p5: w(c09, "juta", 0),
  p13: w(c09, "belas"), lingkaran: w(c09, "lingkaran"), c9end: CH[c09].end,
  c10: CH[c10].start, komentar: w(c10, "komentar"), subscribe: w(c10, "subscribe"), zamzam: w(c10, "zamzam"), audiraEnd: w(c10, "audira"),
  voEnd: VO_END,
};

/** "present day" holds before chapter 1 (hook rewind/replay + intro). */
const hookTrack = (t: number, final: number, rewound: number, replayAt: number) =>
  track(t, [[A.hDulu, final], [A.hTembok + 0.3, rewound], [replayAt, rewound], [Math.min(replayAt + 2.2, A.hJuta), final]]);

/** Footprint index: 0 initial courtyard, 1 Umar, 2 Utsman, 3 Ibn Zubair, 4 al-Mansur, 5 al-Mahdi (off-centre), 6 final Abbasid/Ottoman. */
export function footprint(t: number): number {
  if (t < A.c2 - 0.4) return track(t, [[A.hDulu, 6], [A.hTembok + 0.4, 0], [A.hRumah, 0], [A.hTiang + 0.6, 3], [A.hTumbuh + 1.2, 6]]);
  return track(t, [
    [A.c2 - 0.4, 6], [A.c2 + 1.6, 0], [A.merobohkan, 0], [A.tembok, 1], [A.utsman, 1], [A.serambi + 0.6, 2],
    [A.zubair, 2], [A.tujuhRibu + 0.4, 3], [A.abbasiyah, 3], [A.y137 + 2.5, 4], [A.mahdi + 0.5, 4], [A.masalah, 5],
    [A.dipindahkan, 5], [A.tengah1 + 0.4, 6],
  ]);
}

/** Generic "was built at a, present before chapter 1" helper. */
const built = (t: number, a: number, dur = 3, replay = A.hTumbuh) => (t < A.c2 - 0.4 ? hookTrack(t, 1, 0, replay) : ramp(t, a, a + dur));

export function worldState(t: number) {
  const pre = t < A.c2 - 0.4; // hook + intro = today
  const fp = footprint(t);
  const domes = pre ? hookTrack(t, 1, 0, A.hTumbuh + 0.4) : ramp(t, A.kubah, A.kubah + 9);
  const s1 = built(t, A.lantai3 - 0.6, 3.5, A.hTumbuh + 0.2);
  const s1Clear = pre ? hookTrack(t, 1, 0, A.hTumbuh) : ramp(t, A.y1955, A.lantai3);
  const fahdClear = pre ? hookTrack(t, 1, 0, A.hTumbuh + 0.4) : ramp(t, A.y1983, A.y1983 + 4);
  const s3Clear = pre ? hookTrack(t, 1, 0, A.hTumbuh + 0.8) : ramp(t, A.properti - 1.5, A.properti + 4.5);
  return {
    t,
    pre,
    fp,
    wall: clamp01(fp - 0.55) * (1 - ramp(fp, 5.6, 6)),
    umarLamps: pre ? 0 : ramp(t, A.lampu, A.lampu + 1.2) * (1 - ramp(t, A.c3 + 20, A.c3 + 24)),
    flood: pre ? 0 : track(t, [[A.banjir - 0.6, 0], [A.banjir + 4.5, 1], [A.bendungan, 1], [A.bendungan + 3.5, 0]]),
    dam: pre ? 0 : ramp(t, A.bendungan, A.bendungan + 1.8) * (1 - ramp(t, A.c3 + 40, A.c3 + 44)),
    mataf: pre
      ? hookTrack(t, 1.55, 0, A.hTumbuh)
      : track(t, [[A.mengubin - 0.4, 0], [A.mengubin + 2, 0.6], [A.marmer, 0.6], [A.marmer + 2, 0.78], [A.thassos, 0.78], [A.thassos + 2.5, 1.55]]),
    matafWhite: pre ? 1 : ramp(t, A.marmer, A.marmer + 2) * 0.6 + ramp(t, A.thassos, A.thassos + 2.5) * 0.4,
    arcade: clamp01(fp - 1.35) / 0.65 > 1 ? 1 : clamp01((fp - 1.35) / 0.65),
    columnsMarble: pre ? 1 : ramp(t, A.walid, A.mesirSyam + 1),
    domes,
    flatLift: pre ? 0 : ramp(t, A.dibongkar, A.kubah - 0.2),
    fire: pre ? 0 : track(t, [[A.kebakaran - 0.3, 0], [A.kebakaran + 1.5, 1], [A.barquq, 1], [A.barquq + 3, 0]]),
    tilt: pre ? 0 : track(t, [[A.miring, 0], [A.miring + 2, 1], [A.dibongkar, 1], [A.dibongkar + 2, 0]]),
    piers: pre ? 1 : ramp(t, A.pilar, A.pilar + 2.5),
    centreOff: pre ? 0 : track(t, [[A.masalah - 0.5, 0], [A.masalah + 0.6, 1], [A.dipindahkan, 1], [A.tengah1 + 0.4, 0]]) * ramp(t, A.c3, A.c3 + 1),
    centreMark: pre ? 0 : track(t, [[A.masalah - 0.6, 0], [A.masalah, 1], [A.y167, 1], [A.y167 + 1.5, 0]]),
    wadi: pre ? 0 : track(t, [[A.mahdi, 0], [A.berani - 1, 1], [A.duaPuluhDelapan, 1], [A.duaPuluhDelapan + 2, 0]]),
    wadiShift: pre ? 1 : ramp(t, A.dipindahkan, A.dipindahkan + 3),
    hillMark: pre ? 0 : track(t, [[A.qubais - 0.5, 0], [A.qubais + 0.5, 1], [A.berani + 1, 1], [A.berani + 2.5, 0]]),
    oldMinarets: pre ? 0 : (ramp(t, A.menara1, A.menara1 + 2) + ramp(t, A.menara3, A.menara3 + 2.5) * 3) / 4 * (1 - ramp(t, A.tujuhMenara - 1.5, A.tujuhMenara)),
    oldMinaretCount: pre ? 0 : (t < A.menara3 ? 1 : 4),
    elecLamps: pre ? 1 : ramp(t, A.listrik, A.listrik + 2),
    s1Clear,
    s1,
    s1Minarets: built(t, A.tujuhMenara - 0.2, 3, A.hTumbuh + 0.6),
    market: pre ? 0 : (1 - ramp(t, A.digabungkan, A.digabungkan + 2.5)),
    masa: built(t, A.digabungkan + 0.5, 3, A.hTumbuh + 0.4),
    masaDivider: pre ? 0 : track(t, [[A.jalurnya, 0], [A.jalurnya + 1, 1], [A.konferensi, 1], [A.konferensi + 1.5, 0]]),
    keepOttoman: pre ? 0 : track(t, [[A.menolak - 0.4, 0], [A.menolak + 0.6, 1], [A.thassos - 0.5, 1], [A.thassos + 0.5, 0]]),
    fahdClear,
    prayerLot: pre ? 0 : track(t, [[A.sementara - 0.5, 0], [A.sementara + 0.8, 1], [A.y1988 - 0.5, 1], [A.y1988 + 1, 0]]),
    roofMarble: pre ? 1 : ramp(t, A.y1986, A.y1986 + 2),
    roofPeople: pre ? 0.6 : ramp(t, A.sembilan, A.sembilan + 2.5) * (1 - ramp(t, A.c7, A.c7 + 4)) + ramp(t, A.c9, A.c9 + 3) * 0.6,
    fahd: built(t, A.y1988, 4, A.hTumbuh + 0.5),
    cooling: pre ? 0 : track(t, [[A.ajyad - 0.6, 0], [A.ajyad + 0.6, 1], [A.pintu + 1, 1], [A.pintu + 3, 0]]),
    escalators: built(t, A.eskalator - 0.3, 2, A.hTumbuh + 0.6),
    escFlow: pre ? 0.4 : track(t, [[A.eskalator, 0], [A.eskalator + 1, 1], [A.duaMenara + 2, 1], [A.duaMenara + 5, 0.3]]),
    fahdMinarets: built(t, A.duaMenara - 0.2, 2.5, A.hTumbuh + 0.8),
    plaza: built(t, A.pelataran - 0.3, 3, A.hTumbuh + 0.8),
    s3Zone: pre ? 0 : track(t, [[A.y2008 - 0.5, 0], [A.y2008 + 1, 1], [A.properti + 4, 1], [A.properti + 6, 0]]),
    s3Clear,
    s3: built(t, A.beton - 1.2, 5, A.hTumbuh + 1.0),
    s3Minarets: built(t, A.y2015 - 0.5, 3, A.hTumbuh + 1.2),
    masaWide: pre ? 1 : ramp(t, A.kaliLipat - 0.4, A.kaliLipat + 2.5),
    bridge: pre ? 0 : ramp(t, A.jembatan - 0.4, A.jembatan + 1.6),
    bridgeGone: pre ? 0 : ramp(t, A.bongkarJembatan, A.tiang84 + 6),
    riwaqSaudi: built(t, A.riwaqSaudi - 0.3, 3.5, A.hTumbuh + 0.9),
    tawaf: pre ? 1 : t < A.c5 ? 0.25 : t < A.c6 ? 0.5 : t < A.c7 ? 0.7 : 1,
    // ch7 heritage catalogue
    tags: pre ? 0 : track(t, [[A.tiang95 - 0.4, 0], [A.tiang95 + 0.8, 1], [A.c8end, 1], [A.c8end + 2, 0]]),
    oldest: pre ? 0 : track(t, [[A.y167b - 0.3, 0], [A.y167b + 0.6, 1], [A.dibongkar8, 1], [A.dibongkar8 + 1, 0]]),
    catalogue: pre ? 0 : track(t, [[A.dibongkar8 - 0.2, 0], [A.dibongkar8 + 2.6, 1], [A.kembali + 2.2, 1], [A.isra - 0.2, 0]]),
    israCol: pre ? 1 : ramp(t, A.isra - 0.4, A.isra + 2.6),
    riwaqLabels: pre ? 0 : track(t, [[A.abbasi - 0.6, 0], [A.abbasi + 0.4, 1], [A.tiang95 - 1.2, 1], [A.tiang95 - 0.2, 0]]),
    // payoff ring highlights (0..1 per era, cumulative)
    ring: [
      pre ? 0 : track(t, [[A.p1 - 0.3, 0], [A.p1 + 0.5, 1], [A.c9end + 3, 1], [A.c9end + 6, 0]]),
      pre ? 0 : track(t, [[A.p2 - 0.3, 0], [A.p2 + 0.5, 1], [A.c9end + 3, 1], [A.c9end + 6, 0]]),
      pre ? 0 : track(t, [[A.p3 - 0.3, 0], [A.p3 + 0.5, 1], [A.c9end + 3, 1], [A.c9end + 6, 0]]),
      pre ? 0 : track(t, [[A.p4 - 0.3, 0], [A.p4 + 0.5, 1], [A.c9end + 3, 1], [A.c9end + 6, 0]]),
      pre ? 0 : track(t, [[A.p5 - 0.3, 0], [A.p5 + 0.5, 1], [A.c9end + 3, 1], [A.c9end + 6, 0]]),
    ],
    minaretGlow: pre ? 0 : track(t, [[A.p13 - 0.3, 0], [A.p13 + 0.6, 1], [A.lingkaran, 1], [A.lingkaran + 2, 0]]),
    initRing: pre ? 0 : Math.max(track(t, [[A.seribu - 0.3, 0], [A.seribu + 0.6, 1], [A.y17, 1], [A.y17 + 1, 0]]), 0),
    hookPulse: t < A.c2 ? track(t, [[A.hJuta - 0.4, 0], [A.hJuta + 0.4, 1], [A.hJuta + 2.5, 0.3]]) : 0,
    plaque: 1,
  };
}

export type WorldState = ReturnType<typeof worldState>;
