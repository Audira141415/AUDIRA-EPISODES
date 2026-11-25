// Planner: RawStory (+ optional voice-over line timings) → Plan (absolute times, resolved sets, moods, cast, map
// points, camera beats, overlays, captions). Pure TS — runs in node (make.mjs) and in the browser.

import { findPlaces, type Place } from "./gazetteer.ts";
import { parseNaskah, type RawScene, type RawStory } from "./parse.ts";
import type { Action, Beat, CostumeSpec, Group, MapPoint, MoodId, Overlay, Plan, PlanScene, Region, SetId, Shot, Word } from "./types.ts";

const INK = { hero: "#ffb547", ally: "#5fe0d2", foe: "#ff4b3a", grief: "#b98cff", neutral: "#f3e3c6" };


// ------------------------------------------------------------------ cast
const NUM: Record<string, number> = { satu: 1, seorang: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10, beberapa: 4, banyak: 14, puluhan: 16, ratusan: 24, ribuan: 30 };

const ACTIONS: [RegExp, Action][] = [
  [/tolak pinggang|kacak pinggang|berkacak/, "akimbo"],
  [/berlari|lari|kabur|mengungsi|melarikan/, "run"],
  [/berjalan|jalan|melangkah|menyusul|datang|pergi/, "walk"],
  [/menunjuk/, "point"],
  [/meneropong/, "telescope"],
  [/berdoa|doa|menadah/, "pray"],
  [/sujud|bersujud|menyembah|menghadap/, "bow"],
  [/berlutut|bersimpuh|jongkok/, "kneel"],
  [/menulis|mencatat/, "write"],
  [/duduk|bersila/, "sit"],
  [/berjaga|jaga|siaga|mengawal/, "guard"],
  [/berbaris|baris/, "march"],
  [/mengangkat|menyerang|bertempur|berperang|mengacungkan|melawan/, "raise"],
  [/berunding|berbicara|bicara|berdebat|bercakap/, "talk"],
  [/menatap|melihat|memandang|mengamati/, "look"],
  [/membawa|memikul|menjunjung/, "carry"],
  [/berdiri/, "stand"],
];

type RoleRule = [RegExp, (era: number) => CostumeSpec, Action?];
const ROLES: RoleRule[] = [
  [/perwira|opsir|jenderal|jendral|gubernur|residen|kapten|laksamana|komandan|admiral|kolonel|mayor|de kock|daendels|raffles|speelman|coen/, (e) => ({ hat: e < 1790 ? "tricorne" : "bicorne", wear: "coat" }), "stand"],
  [/serdadu|tentara|kompeni|marsose|infanteri|pasukan belanda|prajurit belanda|garnisun|voc/, (e) => ({ hat: e < 1790 ? "tricorne" : "shako", wear: "coat", itemR: "musket" }), "guard"],
  [/ulama|kyai|kiai|syekh|imam|wali/, () => ({ hat: "turban", wear: "robe" })],
  [/peziarah|haji|santri/, () => ({ hat: "peci", wear: "sarong" })],
  [/pangeran|raja|sultan|sunan|susuhunan|karaeng|arung|bangsawan|adipati|bupati|patih|tumenggung|panglima|datu/, () => ({ hat: "destar", wear: "sarong", keris: true })],
  [/laskar|pengikut|pejuang|prajurit|pasukan|gerilyawan|pendekar|pengawal/, () => ({ hat: "destar", wear: "sarong", itemR: "spear" })],
  [/perempuan|wanita|ibu|istri|putri|ratu|permaisuri|gadis|nyai/, () => ({ body: "f", hat: "bun", wear: "kain" })],
  [/anak|bocah/, () => ({ hat: "none", scale: 0.62, headScale: 1.25 })],
  [/pelaut|awak|kelasi|nakhoda|pendayung/, () => ({ hat: "none", wear: "pants" })],
  [/penulis|juru tulis|sekretaris|pedagang belanda|saudagar belanda/, () => ({ hat: "none", wear: "coat" })],
  [/warga|rakyat|penduduk|petani|nelayan|orang|pedagang|kuli|budak|pekerja/, () => ({ hat: "caping", wear: "sarong" })],
];

const ATTRS: [RegExp, (c: CostumeSpec) => void][] = [
  [/sorban|serban|turban/, (c) => { c.hat = "turban"; }],
  [/peci|kopiah|songkok/, (c) => { c.hat = "peci"; }],
  [/destar|ikat kepala|passapu|udeng/, (c) => { c.hat = "destar"; }],
  [/blangkon/, (c) => { c.hat = "blangkon"; }],
  [/caping/, (c) => { c.hat = "caping"; }],
  [/shako/, (c) => { c.hat = "shako"; }],
  [/bicorne|topi perwira/, (c) => { c.hat = "bicorne"; }],
  [/tricorne|topi laken|topi segitiga/, (c) => { c.hat = "tricorne"; }],
  [/sanggul|konde/, (c) => { c.hat = "bun"; }],
  [/rambut/, (c) => { c.hat = "hair"; }],
  [/tanpa topi|gundul/, (c) => { c.hat = "none"; }],
  [/jubah/, (c) => { c.wear = "robe"; }],
  [/sarung/, (c) => { c.wear = "sarong"; }],
  [/kain|jarik|kebaya/, (c) => { c.wear = "kain"; }],
  [/jas|seragam/, (c) => { c.wear = "coat"; }],
  [/celana/, (c) => { c.wear = "pants"; }],
  [/senapan|bedil|musket|senjata api/, (c) => { c.itemR = "musket"; }],
  [/tombak/, (c) => { c.itemR = "spear"; }],
  [/obor/, (c) => { c.itemR = "torch"; }],
  [/teropong/, (c) => { c.itemR = "telescope"; }],
  [/bendera|panji/, (c) => { c.itemL = "flag"; }],
  [/dayung/, (c) => { c.itemR = "paddle"; }],
  [/keris/, (c) => { c.keris = true; }],
  [/buntelan|bawaan|karung|bekal/, (c) => { c.load = "back"; }],
  [/di kepala|menjunjung/, (c) => { c.load = "head"; }],
];

const COLORS: [RegExp, string][] = [
  [/emas|kuning|utama|gold/, INK.hero], [/cyan|biru|sekutu|kawan/, INK.ally], [/merah|musuh|lawan/, INK.foe],
  [/ungu|korban|duka/, INK.grief], [/gading|putih|netral/, INK.neutral],
];

const splitTop = (s: string) => {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if ((ch === "," || ch === ";") && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};

export const parseCast = (tokoh: string, era: number): Group[] => {
  const groups: Group[] = [];
  for (const part0 of splitTop(tokoh)) {
    let part = part0;
    let color: string | null = null;
    const eq = /=\s*([^=]+)$/.exec(part);
    if (eq) {
      const c = COLORS.find(([re]) => re.test(eq[1].toLowerCase()));
      color = c ? c[1] : null;
      part = part.slice(0, eq.index).trim();
    }
    const attrs = [...part.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(", ");
    part = part.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    const m = /^(\d+|[a-z]+)\s+(.*)$/i.exec(part);
    let count = 1, rest = part;
    if (m) {
      const n = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : NUM[m[1].toLowerCase()];
      if (n) { count = n; rest = m[2]; }
    }
    const low = (rest + " " + attrs).toLowerCase();
    let action: Action | null = null;
    let actionWord = "";
    for (const [re, a] of ACTIONS) {
      const mm = re.exec(rest.toLowerCase());
      if (mm) { action = a; actionWord = mm[0]; break; }
    }
    const role = ROLES.find(([re]) => re.test(low));
    const costume: CostumeSpec = role ? role[1](era) : { hat: "destar", wear: "sarong" };
    for (const [re, f] of ATTRS) if (re.test(attrs.toLowerCase())) f(costume);
    if (!action) action = role?.[2] ?? "stand";
    let name = rest;
    if (actionWord) name = name.replace(new RegExp(actionWord, "i"), "").trim();
    groups.push({ count: Math.max(1, Math.min(40, count)), name, costume, action, color, lead: false });
  }
  const lead = groups.find((g) => g.count === 1 && g.color) ?? groups.find((g) => g.count === 1) ?? groups[0];
  if (lead) lead.lead = true;
  return groups;
};

// ------------------------------------------------------------------ set + mood
const SET_RULES: [RegExp, SetId][] = [
  // EP42 (Sinai): new sets, checked before the Nusantara ones
  [/tungku|lebur|peleburan/, "tungku"],
  [/bukit thur|lereng|puncak/, "thur"],
  [/laut|ombak|samudra/, "laut"],
  [/gurun|padang pasir|perkemahan sinai|kemah sinai/, "gurun"],
  [/makam|kuburan|nisan|pusara|astana/, "makam"],
  [/pendopo|balairung|istana|keraton|kraton|aula|singgasana|karesidenan|balai|ruang sidang|loji/, "balai"],
  [/kamar|ruang|bilik|penjara|sel |pengasingan/, "kamar"],
  [/geladak|di atas kapal|dek kapal|haluan/, "dek"],
  [/pelabuhan|dermaga|bandar|syahbandar/, "pelabuhan"],
  [/benteng|kubu|bastion/, "benteng"],
  [/hutan|rimba|perbukitan|bukit|gua|goa|lembah|sungai/, "hutan"],
  [/desa|kampung|rumah|dusun|permukiman|pemukiman/, "desa"],
  [/pantai|pesisir|tepi laut/, "pantai"],
  [/medan|perang|kemah|perkemahan|lapangan|alun|sawah|padang/, "medan"],
];
const MOOD_RULES: [RegExp, MoodId][] = [
  [/terbakar|kebakaran|api|membara|meletus|letusan/, "api"],
  [/malam|tengah malam|gelap|lilin/, "malam"],
  [/senja|sore|petang|matahari terbenam/, "senja"],
  [/fajar|subuh|pagi/, "pagi"],
  [/siang|terik/, "siang"],
];

const resolvePlace = (sc: RawScene, text: string) => {
  const spec = sc.spec.toLowerCase();
  const set: SetId = SET_RULES.find(([re]) => re.test(spec))?.[1] ?? SET_RULES.find(([re]) => re.test(text.toLowerCase()))?.[1] ?? "medan";
  let mood: MoodId = MOOD_RULES.find(([re]) => re.test(spec))?.[1] ?? "senja";
  const interior = set === "balai" || set === "kamar";
  if (interior) mood = mood === "malam" || mood === "api" ? "dalam-malam" : "dalam-siang";
  const EXTRAS = ["patung", "lauh", "bakar", "sendiri", "abu", "unta", "tenda", "emas", "jejak"];
  return {
    extras: EXTRAS.filter((x) => spec.includes(x)),
    set, mood,
    fire: /terbakar|kebakaran|api|membara/.test(spec),
    rain: /hujan|badai/.test(spec),
    fog: /kabut|berkabut/.test(spec),
    candle: /lilin|pelita|lampu minyak/.test(spec) || (interior && mood === "dalam-malam"),
    volcano: /meletus|letusan|gunung api/.test(spec),
  };
};

// ------------------------------------------------------------------ overlays
const parseNumber = (s: string) => parseFloat(s.replace(/\./g, "").replace(",", "."));
const parseCount = (t: string) => {
  const [main, label] = t.split(/,(.+)/).map((x) => x?.trim());
  const m = /([\d.,]+)\s*(?:→|->|ke)\s*([\d.,]+)\s*(.*)/.exec(main) ?? /([\d.,]+)\s*(.*)/.exec(main);
  if (!m) return null;
  if (m.length === 4) return { from: parseNumber(m[1]), to: parseNumber(m[2]), unit: m[3]?.trim() ?? "", label };
  return { from: 0, to: parseNumber(m[1]), unit: (m as RegExpExecArray)[2]?.trim() ?? "", label };
};
const splitDash = (t: string) => {
  const m = /\s+[—–-]\s+/.exec(t);
  return m ? [t.slice(0, m.index).trim(), t.slice(m.index + m[0].length).trim()] : [t.trim(), ""];
};

// ------------------------------------------------------------------ timing
export type LineTime = { a: number; b: number; words?: { w: string; t: number }[] };
const WPS = 2.55;
const paceLines = (story: RawStory): LineTime[][] => {
  let t = 0.5;
  return story.scenes.map((sc, si) => {
    if (si > 0) t += 0.35;
    const isMap = sc.kind === "PETA" || sc.kind === "RUTE";
    const start = t;
    const out = sc.lines.map((l) => {
      const n = l.words.length;
      const d = Math.max(1.05, n / WPS + 0.12);
      const a = t, b = t + d;
      t = b + (/[.?!]$/.test(l.text) ? 0.42 : 0.18);
      return { a, b };
    });
    if (sc.kind === "PENUTUP") t += 0.2;
    // map scenes need time to travel
    const min = sc.kind === "RUTE" ? 4.4 : isMap ? 3.0 : 0;
    if (t - start < min) t = start + min;
    return out;
  });
};

// ------------------------------------------------------------------ main
export const planStory = (src: string, opts: { id: string; times?: LineTime[][]; audio?: string } = { id: "story" }): Plan => {
  const story = parseNaskah(src);
  const warnings: string[] = [];
  const times = opts.times ?? paceLines(story);
  const allText = story.scenes.map((s) => s.lines.map((l) => l.text).join(" ") + " " + s.tags.map((t) => t.text).join(" ")).join(" ");
  const yearM = /\b(1[0-9]{3}|20[0-9]{2})\b/.exec(allText);
  const year = yearM ? parseInt(yearM[1], 10) : null;
  const era = year ?? 1800;

  // scene boundaries: from just before the first line to just before the next scene's first line
  const firstA = (i: number) => times[i]?.[0]?.a;
  const scenes: PlanScene[] = [];
  const words: Word[] = [];
  const sources: string[] = [];
  let prevB = 0;
  story.scenes.forEach((sc, i) => {
    const lt = times[i];
    const lineStart = lt[0]?.a ?? prevB + 0.2;
    const a = i === 0 ? 0 : prevB;
    let nextA = Infinity;
    for (let j = i + 1; j < story.scenes.length; j++) { const f = firstA(j); if (f !== undefined) { nextA = f; break; } }
    const lastB = lt.length ? lt[lt.length - 1].b : lineStart + 1;
    let b = Number.isFinite(nextA) ? Math.max(lastB + 0.15, nextA - 0.3) : lastB + 0.8;
    if (sc.kind === "PENUTUP") b = Math.max(b, a + 4.2);
    const minDur = sc.kind === "RUTE" ? 4.4 : sc.kind === "PETA" ? 3.0 : 1.6;
    if (b - a < minDur && !opts.times) b = a + minDur;
    prevB = b;

    // captions
    sc.lines.forEach((l, li) => {
      const T = lt[li];
      if (T.words && T.words.length === l.words.length) l.words.forEach((w, k) => words.push({ w: w.w, t: T.words![k].t, key: w.key }));
      else {
        const tot = l.words.reduce((s, w) => s + 0.6 + w.w.length * 0.08, 0);
        let acc = 0;
        l.words.forEach((w) => { words.push({ w: w.w, t: T.a + ((T.b - T.a) * acc) / tot, key: w.key }); acc += 0.6 + w.w.length * 0.08; });
      }
    });

    // overlays
    const overlays: Overlay[] = [];
    const lineA = (k: number) => (lt[Math.min(k, lt.length - 1)]?.a ?? a + 0.3);
    for (const tg of sc.tags) {
      const at = tg.line === 0 ? a + 0.25 : lineA(tg.line) - 0.1;
      if (tg.kind === "TANGGAL") {
        const [top, big] = tg.text.includes("/") ? tg.text.split("/").map((x) => x.trim()) : ["", tg.text.trim()];
        overlays.push({ kind: "date", a: at, b: Math.min(at + 3.4, b - 0.1), top: top.toUpperCase(), big: big.toUpperCase() });
      } else if (tg.kind === "NAMA") {
        const [name, role] = splitDash(tg.text);
        overlays.push({ kind: "name", a: at + 0.15, b: Math.min(at + 3.8, b - 0.1), name, role: role || undefined });
      } else if (tg.kind === "ANGKA") {
        const c = parseCount(tg.text);
        if (c) overlays.push({ kind: "count", a: at, b: b - 0.1, from: c.from, to: c.to, roll: [at + 0.3, at + 1.7], unit: c.unit, label: c.label });
        else warnings.push(`ANGKA tidak terbaca: "${tg.text}"`);
      } else if (tg.kind === "SUMBER") {
        const [text, src] = splitDash(tg.text);
        if (sc.kind === "PENUTUP") sources.push(...tg.text.split(/;\s*/).map((x) => x.trim()).filter(Boolean));
        else {
          overlays.push({ kind: "cite", a: at + 0.2, b: b - 0.15, text: src ? text : "", src: src || text });
          if (src) sources.push(src);
        }
      }
    }

    const text = sc.lines.map((l) => l.text).join(" ");
    if (sc.kind === "PENUTUP") {
      // the closing card lists the sources written under [PENUTUP]; without them, every cited source in the film
      const own = sc.tags.filter((tg) => tg.kind === "SUMBER").flatMap((tg) => tg.text.split(/;\s*/).map((x) => x.trim()).filter(Boolean));
      scenes.push({ a, b, kind: "end", overlays: [...overlays.filter((o) => o.kind !== "cite"), { kind: "end", a: a + 0.2, b, title: sc.spec, sources: own.length ? own : [...new Set(sources)] }] });
      return;
    }
    let kind = sc.kind;
    if (kind === "AUTO") {
      // untagged paragraph: a place named in it → map, otherwise a location from its words
      const pl = findPlaces(text).filter((p) => p.kind !== "sea");
      kind = pl.length && !SET_RULES.some(([re]) => re.test(text.toLowerCase())) ? "PETA" : "TEMPAT";
      if (kind === "TEMPAT") sc.spec = text;
    }
    if (kind === "PETA" || kind === "RUTE") {
      let places: Place[] = findPlaces(sc.spec);
      if (!places.length) places = findPlaces(text);
      if (!places.length) warnings.push(`Peta tanpa nama tempat yang dikenal: "${sc.spec}"`);
      const route = kind === "RUTE" || /→|->/.test(sc.spec);
      const points: MapPoint[] = places.map((p) => ({ name: p.name, lon: p.lon, lat: p.lat, volcano: p.kind === "volcano" }));
      scenes.push({
        a, b, kind: "map", overlays,
        map: { points, route, rings: /cincin|gelombang|dentum/.test(sc.spec.toLowerCase()), erupt: /meletus|letusan/.test(sc.spec.toLowerCase()), mode: route ? "route" : points.length > 1 ? "fit" : "close" },
      });
      return;
    }
    const pl = resolvePlace(sc, text);
    const groups = sc.tokoh ? parseCast(sc.tokoh, era) : [];
    if (!groups.length) warnings.push(`Adegan tanpa TOKOH (dipakai figuran otomatis): "${sc.spec.slice(0, 40)}"`);
    // camera beats: one per line, merged when lines are short
    const solo = groups.length > 0 && groups.every((g) => g.count === 1);
    const cycle: Shot[] = solo ? ["wide", "medium", "close", "low", "medium"] : ["wide", "medium", "group", "close", "wide"];
    const beats: Beat[] = [];
    lt.forEach((T, k) => {
      const ba = k === 0 ? a : T.a - 0.15;
      if (beats.length && ba - beats[beats.length - 1].a < 1.7) return;
      if (beats.length) beats[beats.length - 1].b = ba;
      beats.push({ a: ba, b, shot: cycle[beats.length % cycle.length] });
    });
    if (!beats.length) beats.push({ a, b, shot: "wide" });
    // a counter needs the top of the frame clear: keep that beat wide
    for (const o of overlays) if (o.kind === "count") { const bt = beats.find((x) => o.a >= x.a && o.a < x.b); if (bt) bt.shot = "wide"; }
    scenes.push({ a, b, kind: "place", overlays, place: { ...pl, groups, beats, seed: i + 1 } });
  });

  // relief regions: each map scene gets its own (fine coastlines even when a film's places are far apart), and one
  // region spans every map point for the end card
  const regionFor = (pts: MapPoint[], key: string, minW: number, minH: number, padW: number, padH: number): Region => {
    let lon0 = Math.min(...pts.map((p) => p.lon)), lon1 = Math.max(...pts.map((p) => p.lon));
    let lat0 = Math.min(...pts.map((p) => p.lat)), lat1 = Math.max(...pts.map((p) => p.lat));
    const cx = (lon0 + lon1) / 2, cy = (lat0 + lat1) / 2;
    const w = Math.max(minW, lon1 - lon0 + padW), h = Math.max(minH, lat1 - lat0 + padH);
    lon0 = Math.max(86.5, cx - w / 2); lon1 = Math.min(159.5, cx + w / 2);
    lat0 = Math.max(-47, cy - h / 2); lat1 = Math.min(47, cy + h / 2);
    const area = (lon1 - lon0) * 43.24 * (lat1 - lat0) * 44;
    const cell = Math.max(0.6, Math.sqrt(area / 1.3e6));
    return { lon0, lon1, lat0, lat1, cell: Math.round(cell * 100) / 100, key: `${opts.id}-${key}-${lon0.toFixed(1)}-${lat1.toFixed(1)}` };
  };
  scenes.forEach((s, i) => { if (s.map && s.map.points.length) s.map.region = regionFor(s.map.points, `m${i}`, 18, 12, 12, 9); });
  const pts = scenes.flatMap((s) => s.map?.points ?? []);
  const region: Region | null = pts.length ? regionFor(pts, "all", 24, 16, 16, 12) : null;
  const duration = Math.ceil((scenes[scenes.length - 1]?.b ?? 5) * 10) / 10;
  return { id: opts.id, title: story.title, series: story.series, duration, year, region, scenes, words, audio: opts.audio, warnings };
};
