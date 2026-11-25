// SHOTLIST.md parser and linter: catch a slideshow, a weak hook or a cut that chops the
// narration before any scene code is written. Adapted from huashu-art-motion's storyboard_lint
// (MIT, alchaincyf) for AUDIRA rules: Anti-PPT, hook 0–3 s, brand in scene, outro card, VO clock.
//
// Format (Indonesian or English headers both work):
//   Style: INNERWORKS — mesin jet dibelah
//   Hook: kipas raksasa menyedot burung kertas
//   Offset: 0.3          (optional: VO starts this many seconds into the film)
//
//   | # | Waktu    | Objek          | Aksi                        | Kamera   | Teks layar | Beat |
//   |---|----------|----------------|-----------------------------|----------|------------|------|
//   | 1 | 0.0–2.8  | kipas jet      | berputar, menyedot udara    | dolly-in | 3 AM       | Hook |
//   ...
//   | 9 | 72.4–75.5| outro AUDIRA   | monolit naik, credit muncul | pull-out |            | Outro|
//
// Times are film seconds: "a–b", "a-b", "m:ss.s–m:ss.s". Only the first table with time, object
// and action columns is read; tables inside ``` fences are ignored.

import { classifyCut } from "./vo-timing.mjs";

const COLS = {
  time: /^(waktu|time|timecode|detik|durasi waktu|tc)$/,
  object: /^(objek|object|subjek|subject|apa|isi frame|di frame)$/,
  action: /^(aksi|action|gerak|motion|apa yang terjadi|kejadian)$/,
  camera: /^(kamera|camera|cam|lensa)$/,
  text: /^(teks layar|teks|text|on-screen text|ost|overlay|tulisan)$/,
  beat: /^(beat|tahap|stage|bagian|section)$/,
};

// object column holding only layout words = nothing physical on screen
const ABSTRACT = /^(judul|sub ?judul|title|teks|text|tulisan|kata|kalimat|kutipan|quote|poin|bullet|daftar|list|subtitle|caption|label|kartu|card|slide|ikon|icon|logo saja|latar|latar belakang|background|bg|layar|screen|layar hitam|black|hitam|putih|kosong|blank|empty|gradasi|gradient|warna|color|partikel|particles|efek|effect|grafik|infografis|konten|content|informasi|info)$/;
const EMPTY_SCENE = /^(layar hitam|black|hitam|putih|kosong|blank|empty|gradasi|gradient|latar|background|bg|warna|color)$/;
const TEXTY = /(judul|title|teks|text|tulisan|kalimat|kutipan|quote|tipografi|typography|poin|bullet|daftar|subtitle|caption|angka besar)/;
// action column holding only "it appears" verbs = nothing happens
const WEAK = /^(muncul|tampil|ditampilkan|menampilkan|terlihat|ada|diam|tetap|statis|fade ?in|fade ?out|memudar|masuk|keluar|appear|appears|show|shows|display|displayed|pop ?up|slide ?in|slide ?out|stay|static|idle|hold)$/;
const ACT_FILLER = /\b(lalu|kemudian|dan|dengan|perlahan|pelan|cepat|satu per satu|bergantian|secara|di layar|ke layar|on screen|slowly|then|and|one by one)\b|[,.;:/+&()\-–—]/g;

const CAM_STATIC = /^(|-|—|diam|static|still|locked|lock|statis|tanpa gerak|fixed|none|tidak ada)$/;
const CAM_IN = /(dolly[ -]?in|push[ -]?in|^push$|zoom[ -]?in|maju|mendekat|dorong|crash ?zoom|snap ?zoom|dive)/;
const CAM_ACCENT = /(crash ?zoom|snap ?zoom|whip|smash|shake|guncang|sentak)/;

const BRAND = /audira/i;
const OUTRO = /(outro|credit|kredit|closing|penutup|end ?card)/i;

const parseTime = (s) => {
  s = s.trim().replace(/\s*(s|dtk|detik)$/i, "");
  const m = /^(?:(\d+):)?(\d+(?:[.,]\d+)?)$/.exec(s);
  if (!m) return NaN;
  return (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2].replace(",", "."));
};

export function parseShotlist(md) {
  const lines = md.replace(/```[\s\S]*?```/g, (b) => b.replace(/[^\n]/g, "")).split(/\r?\n/);
  const header = {};
  for (const l of lines) {
    const m = /^\s*[-*]?\s*\**\s*(style|gaya|hook|palet|palette|offset|vo)\s*\**\s*[:：]\s*(.+?)\s*$/i.exec(l);
    if (m) {
      const k = m[1].toLowerCase();
      header[k === "gaya" ? "style" : k === "palette" ? "palet" : k] ??= m[2];
    }
  }
  let cols = null, shots = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l.startsWith("|")) { if (cols && shots.length) break; continue; }
    const cells = l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (!cols) {
      const map = {};
      cells.forEach((c, k) => {
        const key = c.toLowerCase().replace(/[*_`]/g, "").trim();
        for (const [name, re] of Object.entries(COLS)) if (re.test(key) && map[name] === undefined) map[name] = k;
      });
      if (map.time !== undefined && map.object !== undefined && map.action !== undefined) cols = map;
      continue;
    }
    if (/^:?-{2,}/.test(cells[0] ?? "")) continue; // separator row
    const cell = (n) => (cols[n] === undefined ? "" : (cells[cols[n]] ?? "").replace(/[*_`]/g, "").trim());
    const [a, b] = cell("time").split(/\s*[–—-]\s*(?=\d)/);
    shots.push({
      n: shots.length + 1,
      line: i + 1,
      from: parseTime(a ?? ""),
      to: parseTime(b ?? ""),
      object: cell("object"),
      action: cell("action"),
      camera: cell("camera"),
      text: cell("text"),
      beat: cell("beat"),
      rawTime: cell("time"),
    });
  }
  return { header, shots, hasCamera: cols?.camera !== undefined, hasText: cols?.text !== undefined, found: !!cols };
}

const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const norm = (s) => s.toLowerCase().replace(/["'“”‘’]/g, "").trim();
const isOutro = (s) => OUTRO.test(`${s.object} ${s.beat} ${s.action}`);
const textLed = (s) => TEXTY.test(norm(s.object)) || words(s.text) >= 7;

/**
 * @param {{header:object, shots:object[]}} sl
 * @param {{ vo?: ReturnType<import('./vo-timing.mjs').loadVoTiming>, offset?: number, script?: string }} opt
 * @returns {{ level:'fail'|'warn', shot?:number, code:string, msg:string }[]}
 */
export function lintShotlist(sl, opt = {}) {
  const out = [];
  const add = (level, code, msg, shot) => out.push({ level, code, msg, shot });
  const { header, shots } = sl;
  const kinetic = /textvoyage/i.test(header.style ?? "");

  if (!header.style) add("fail", "header", "missing `Style:` line (the style chosen at the style gate)");
  if (!header.hook) add("fail", "header", "missing `Hook:` line (what physically happens in the first 3 s)");
  if (!shots.length) { add("fail", "table", "no shot table found (needs time, object and action columns)"); return out; }

  for (const s of shots) {
    if (!Number.isFinite(s.from) || !Number.isFinite(s.to) || s.to <= s.from) {
      add("fail", "time", `unreadable time "${s.rawTime}" (use 7.1–17.4 or 0:07.1–0:17.4)`, s.n);
      continue;
    }
    const obj = norm(s.object), act = norm(s.action).replace(ACT_FILLER, " ").replace(/\s+/g, " ").trim();
    if (!obj) add("fail", "object", "object is empty: name the thing on screen", s.n);
    else if (EMPTY_SCENE.test(obj)) add("fail", "object", `"${s.object}" is an empty frame, not a subject`, s.n);
    else if (ABSTRACT.test(obj) && !kinetic) add("fail", "object", `"${s.object}" is a layout element; name the physical object`, s.n);
    if (!act) add("fail", "action", "action is empty: say what the object does", s.n);
    else if (act.split(" ").every((w) => WEAK.test(w)) || WEAK.test(act)) add("fail", "action", `"${s.action}" only says it appears; give it a verb with cause and effect`, s.n);

    const tw = words(s.text);
    if (tw > 10) add("fail", "text", `on-screen text is ${tw} words (max 6, hard limit 10): move it to VO/subtitle`, s.n);
    else if (tw > 6) add("warn", "text", `on-screen text is ${tw} words (aim ≤ 6)`, s.n);

    const d = s.to - s.from;
    if (!isOutro(s)) {
      if (d > 12) add("fail", "duration", `${d.toFixed(1)} s in one shot (> 12 s reads as a slide): split it or add a camera beat`, s.n);
      else if (d > 8) add("warn", "duration", `${d.toFixed(1)} s in one shot: make sure the camera or subject changes inside it`, s.n);
      else if (d < 0.8) add("warn", "duration", `${d.toFixed(2)} s is a flash; keep only if it is a deliberate accent`, s.n);
    }
    if (sl.hasCamera && CAM_STATIC.test(norm(s.camera)) && !isOutro(s)) add("warn", "camera", "static camera (Anti-PPT: keep the camera moving)", s.n);
  }

  const ok = shots.filter((s) => Number.isFinite(s.from) && Number.isFinite(s.to));
  // continuity
  if (ok[0] && ok[0].from > 0.05) add("fail", "time", `film starts at ${ok[0].from} s, not 0`, ok[0].n);
  for (let i = 1; i < ok.length; i++) {
    const gap = ok[i].from - ok[i - 1].to;
    if (gap > 0.05) add("warn", "time", `gap of ${gap.toFixed(2)} s after shot ${ok[i - 1].n}`, ok[i].n);
    if (gap < -0.05) add("warn", "time", `overlaps shot ${ok[i - 1].n} by ${(-gap).toFixed(2)} s`, ok[i].n);
  }

  // hook
  const first = ok[0];
  if (first) {
    if (!kinetic && textLed(first)) add("fail", "hook", "first shot is text-led: open on an object doing something", first.n);
    if (first.to - first.from > 4) add("warn", "hook", `nothing changes until ${first.to} s; the hook window is 0–3 s`, first.n);
  }

  // whole-film ratios
  const body = ok.filter((s) => !isOutro(s));
  if (!kinetic && body.length) {
    const tl = body.filter(textLed).length;
    if (tl / body.length > 0.3) add("fail", "text", `${tl}/${body.length} shots are text-led (max 30%)`);
  }
  if (sl.hasCamera && body.length >= 3) {
    const st = body.filter((s) => CAM_STATIC.test(norm(s.camera))).length;
    if (st / body.length > 0.2) add("fail", "camera", `${st}/${body.length} shots have a static camera (max 20%, Anti-PPT)`);
    for (let i = 2; i < body.length; i++) {
      const c = [body[i - 2], body[i - 1], body[i]].map((s) => norm(s.camera));
      if (c[0] && !CAM_STATIC.test(c[0]) && c[0] === c[1] && c[1] === c[2]) add("warn", "camera", `three shots in a row use "${body[i].camera}"`, body[i].n);
      else if (c.every((x) => CAM_IN.test(x))) add("warn", "camera", "three push-ins in a row; pull out or track sideways once", body[i].n);
    }
    const acc = body.filter((s) => CAM_ACCENT.test(norm(s.camera))).length;
    if (acc > body.length / 3) add("warn", "camera", `${acc}/${body.length} accent moves (crash zoom/whip/shake): accents stop reading as accents`);
  }

  // brand + outro
  const last = ok.at(-1);
  if (last && !isOutro(last) && !BRAND.test(`${last.object} ${last.action}`)) add("fail", "outro", "last shot is not the AUDIRA outro card", last.n);
  else if (last) {
    const d = last.to - last.from;
    if (d < 2 || d > 3.5) add("warn", "outro", `outro is ${d.toFixed(1)} s (brand contract: 2–3 s)`, last.n);
  }
  if (!body.some((s) => BRAND.test(`${s.object} ${s.action} ${s.text}`)))
    add("fail", "brand", "AUDIRA never appears inside a scene (HUD label, sign, object text) before the outro");

  // VO clock
  if (opt.vo) {
    const off = opt.offset ?? 0, vo = opt.vo;
    for (let i = 1; i < ok.length; i++) {
      const t = ok[i].from, c = classifyCut(t - off, vo);
      if (c.level !== "ok") add(c.level, "vo-cut", `cut at ${t.toFixed(2)} s (VO ${(t - off).toFixed(2)} s) ${c.detail}`, ok[i].n);
    }
    const speechEnd = vo.lastSpeech + off;
    const outro = ok.find(isOutro);
    if (outro && outro.from < speechEnd - 0.1) add("fail", "vo-end", `outro starts at ${outro.from} s but narration runs to ${speechEnd.toFixed(2)} s`, outro.n);
    if (last && last.to < speechEnd) add("fail", "vo-end", `shot list ends at ${last.to} s, before narration ends at ${speechEnd.toFixed(2)} s`);
    if (!/audira/i.test((vo.words ?? []).map((w) => w.text).join(" ")) && vo.words?.length)
      add("warn", "brand", "the VO word timing never says AUDIRA (brand in voice: hook or outro)");
  }

  // numbers on screen must be numbers the script says
  if (opt.script) {
    const script = opt.script.replace(/(\d)[.,](?=\d{3}\b)/g, "$1");
    for (const s of ok) {
      for (const n of s.text.match(/\d+(?:[.,]\d+)?/g) ?? []) {
        const plain = n.replace(/(\d)[.,](?=\d{3}\b)/g, "$1");
        const alt = plain.replace(",", ".");
        if (!script.includes(plain) && !script.includes(alt) && !script.includes(plain.replace(".", ",")))
          add("fail", "number", `on-screen number "${n}" is not in the script`, s.n);
      }
    }
  }
  return out;
}

/** Cut times (film seconds) for sync-check: every shot start except the first. */
export const cutsOf = (sl) => sl.shots.filter((s) => Number.isFinite(s.from)).slice(1).map((s) => s.from);
