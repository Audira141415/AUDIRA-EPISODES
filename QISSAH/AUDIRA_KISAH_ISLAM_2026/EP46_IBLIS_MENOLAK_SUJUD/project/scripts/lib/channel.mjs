// Channel handle for the moving signature (rule 08: the handle comes from the series' channel, never
// typed by hand). Resolves the episode's channel from the folders around the project, writes it to
// src/brand/channel.json (read by <AudiraSignature>), and checks every <AudiraSignature> in src/.
//
// Sources, all compared (a handle that disagrees with another is an error, not a silent pick):
//   1. CHANNEL.json of the channel folder the series sits in (<WS>/<KODE>/<SERIES>)
//   2. CHANNEL_BRAND/<KODE>/ACCOUNT.json whose `series` lists this series folder
//   3. SERIES.json account.handle
//   4. only when 1-3 give nothing: CHANNEL_BRAND/<SERIES.json account.code>/ACCOUNT.json handle

import fs from "node:fs";
import path from "node:path";

const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };

function ancestors(dir, n = 8) {
  const out = [];
  let d = path.resolve(dir);
  for (let i = 0; i < n; i++) { out.push(d); const up = path.dirname(d); if (up === d) break; d = up; }
  return out;
}

/** Every channel in <WS>/CHANNEL_BRAND/<KODE>/ACCOUNT.json that has a handle: { KODE: { name, handle } }. */
export function allChannels(projectDir = process.cwd()) {
  const ws = ancestors(projectDir).find((d) => fs.existsSync(path.join(d, "CHANNEL_BRAND")));
  const out = {};
  if (!ws) return out;
  for (const dir of fs.readdirSync(path.join(ws, "CHANNEL_BRAND")).sort()) {
    const acc = readJson(path.join(ws, "CHANNEL_BRAND", dir, "ACCOUNT.json"));
    if (acc?.handle) out[acc.code ?? dir] = { name: acc.name ?? acc.code ?? dir, handle: acc.handle };
  }
  return out;
}

/** { handle, name, code, channels, sources: [{from, handle, code}], problem } for the project in `projectDir`. */
export function resolveChannel(projectDir = process.cwd()) {
  const r = resolveSeriesChannel(projectDir);
  r.channels = allChannels(projectDir);
  return r;
}

function resolveSeriesChannel(projectDir) {
  const dirs = ancestors(projectDir);
  const seriesDir = dirs.find((d) => fs.existsSync(path.join(d, "SERIES.json")));
  const chanDir = dirs.slice(seriesDir ? dirs.indexOf(seriesDir) + 1 : 0).find((d) => fs.existsSync(path.join(d, "CHANNEL.json")));
  if (!seriesDir && !chanDir) return { handle: "", code: "", sources: [], problem: "no SERIES.json or channel folder (CHANNEL.json) above this project" };
  const series = seriesDir ? readJson(path.join(seriesDir, "SERIES.json")) ?? {} : {};
  // without SERIES.json (older series), the series is the folder right under the channel folder
  const seriesName = seriesDir ? path.basename(seriesDir) : path.basename(dirs[dirs.indexOf(chanDir) - 1] ?? "");
  const ws = dirs.find((d) => fs.existsSync(path.join(d, "CHANNEL_BRAND")));
  const sources = [];

  if (chanDir) {
    const c = readJson(path.join(chanDir, "CHANNEL.json")) ?? {};
    if (c.handle) sources.push({ from: `${path.basename(chanDir)}/CHANNEL.json`, handle: c.handle, code: c.code ?? path.basename(chanDir), name: c.name });
  }
  if (ws) {
    for (const code of fs.readdirSync(path.join(ws, "CHANNEL_BRAND"))) {
      const acc = readJson(path.join(ws, "CHANNEL_BRAND", code, "ACCOUNT.json"));
      if (acc?.handle && (acc.series ?? []).some((s) => (s.folder ?? s) === seriesName))
        sources.push({ from: `CHANNEL_BRAND/${code}/ACCOUNT.json (series list)`, handle: acc.handle, code: acc.code ?? code, name: acc.name });
    }
  }
  if (series.account?.handle) sources.push({ from: "SERIES.json account.handle", handle: series.account.handle, code: series.account.code ?? "", name: series.account.name });
  if (!sources.length && ws && series.account?.code) {
    const acc = readJson(path.join(ws, "CHANNEL_BRAND", series.account.code, "ACCOUNT.json"));
    if (acc?.handle) sources.push({ from: `CHANNEL_BRAND/${series.account.code}/ACCOUNT.json (SERIES.json account.code)`, handle: acc.handle, code: series.account.code, name: acc.name });
  }

  const distinct = [...new Set(sources.map((s) => s.handle.toLowerCase()))];
  if (!distinct.length) return { handle: "", code: "", sources, problem: `no channel handle for ${seriesName}: set SERIES.json account.handle, or list the series in CHANNEL_BRAND/<KODE>/ACCOUNT.json` };
  if (distinct.length > 1) return { handle: "", code: "", sources, problem: `channel handles disagree for ${seriesName}: ${sources.map((s) => `${s.handle} (${s.from})`).join(", ")}` };
  // channel name for the outro card: the first source that has one (CHANNEL.json / ACCOUNT.json first)
  const name = sources.find((s) => s.name)?.name ?? "";
  return { handle: sources[0].handle, code: sources[0].code, name, sources, problem: null };
}

const CHANNEL_FILE = path.join("src", "brand", "channel.json");

/** Writes src/brand/channel.json when the handle changed. Returns the resolved channel. */
export function writeChannel(projectDir = process.cwd()) {
  const ch = resolveChannel(projectDir);
  if (ch.problem) return ch;
  const file = path.join(projectDir, CHANNEL_FILE);
  // channels: every AUDIRA channel, so one project can hold films for several channels (<AudiraOutro code="TECH" />)
  const next = { handle: ch.handle, name: ch.name, code: ch.code, from: ch.sources.map((s) => s.from), channels: ch.channels };
  const prev = readJson(file);
  const key = (j) => JSON.stringify([j?.handle, j?.name, j?.code, j?.channels]);
  if (!prev || key(prev) !== key(next)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
    ch.written = true;
  }
  return ch;
}

function* sourceFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") yield* sourceFiles(p); }
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name) && !/(AudiraSignature|AudiraOutro)\.tsx$/.test(e.name)) yield p;
  }
}

// Brand marks that carry the channel: the moving signature (handle line) and the outro card (channel name,
// handle, "Created by Agus Dwi R."). Both read src/brand/channel.json; a typed prop must match the channel.
const PROP = (prop) => new RegExp(String.raw`\b${prop}\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["'${"`"}]([^"'${"`"}]*)["'${"`"}]\s*\}|\{([^}]*)\})`);

const MARKS = [
  { tag: "AudiraSignature", props: { handle: "handle" }, need: "moving signature on every film" },
  { tag: "AudiraOutro", props: { handle: "handle", channel: "name" }, need: "outro card with channel name and creator on every film" },
];

/** Checks every <AudiraSignature> and <AudiraOutro> in src/ against the channel. Returns [{level, msg}]. */
export function checkBrandMarks(projectDir = process.cwd()) {
  const ch = resolveChannel(projectDir);
  if (ch.problem) return [{ level: "fail", msg: `channel: ${ch.problem}` }];
  const src = path.join(projectDir, "src");
  if (!fs.existsSync(src)) return [{ level: "warn", msg: "no src/ folder: channel marks not checked" }];
  const rows = [];
  const file = readJson(path.join(projectDir, CHANNEL_FILE)) ?? {};
  const base = { handle: ch.handle, name: ch.name };
  const uses = Object.fromEntries(MARKS.map((m) => [m.tag, 0]));
  // comments are dropped first: a usage mentioned in a comment (or commented out) is not a mark on the film
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[\s;{}(),])\/\/.*$/gm, "$1");
  const texts = [...sourceFiles(src)].map((f) => [path.relative(projectDir, f).replaceAll("\\", "/"), strip(fs.readFileSync(f, "utf8"))]);
  for (const mark of MARKS) {
    for (const [rel, text] of texts) {
      for (const m of text.matchAll(new RegExp(String.raw`<${mark.tag}\b([^>]*?)\/?>`, "gs"))) {
        uses[mark.tag]++;
        // code="KODE": this film belongs to another channel than the series default (multi-channel project)
        let want = base, fileWant = file, label = "";
        const c = m[1].match(PROP("code"));
        if (c) {
          const code = c[1] ?? c[2] ?? c[3];
          if (code === undefined) { rows.push({ level: "warn", msg: `${rel}: <${mark.tag}>${label} code={${c[4].trim()}} is an expression, not checked (use a literal code, e.g. code="TECH")` }); continue; }
          const target = ch.channels[code];
          if (!target) { rows.push({ level: "fail", msg: `${rel}: <${mark.tag}>${label} code "${code}" is not a channel (known: ${Object.keys(ch.channels).join(", ")})` }); continue; }
          if (file.channels?.[code]?.handle !== target.handle || file.channels?.[code]?.name !== target.name) { rows.push({ level: "fail", msg: `${rel}: <${mark.tag}>${label} code "${code}" is missing or stale in src/brand/channel.json (run npm run channel)` }); continue; }
          want = target; fileWant = file.channels[code]; label = ` [${code}]`;
        }
        for (const [prop, key] of Object.entries(mark.props)) {
          if (!want[key]) { rows.push({ level: "fail", msg: `${rel}: <${mark.tag}>${label} needs the channel ${key}, but the channel data has none` }); continue; }
          const h = m[1].match(PROP(prop));
          if (!h) {
            const have = fileWant[key] ?? "";
            if (have.toLowerCase() === want[key].toLowerCase()) rows.push({ level: "ok", msg: `${rel}: <${mark.tag}>${label} ${prop} ${want[key]} from src/brand/channel.json` });
            else rows.push({ level: "fail", msg: `${rel}: <${mark.tag}>${label} has no ${prop} and src/brand/channel.json has "${have}" (want ${want[key]}; run npm run channel)` });
            continue;
          }
          const lit = h[1] ?? h[2] ?? h[3];
          if (lit === undefined) rows.push({ level: "warn", msg: `${rel}: <${mark.tag}>${label} ${prop}={${h[4].trim()}} is an expression, not checked (want ${want[key]}; leave ${prop} out to use the channel)` });
          else if (lit.toLowerCase() === want[key].toLowerCase()) rows.push({ level: "ok", msg: `${rel}: <${mark.tag}>${label} ${prop} ${lit}` });
          else rows.push({ level: "fail", msg: `${rel}: <${mark.tag}>${label} ${prop} "${lit}" does not match the channel ${want[key]} (${ch.sources[0].from}); remove the ${prop} prop so it comes from the channel` });
        }
      }
    }
    if (!uses[mark.tag]) rows.push({ level: "fail", msg: `no <${mark.tag}> in src/ (brand contract: ${mark.need})` });
  }
  return rows;
}

/** @deprecated name kept for older callers */
export const checkSignatureHandles = checkBrandMarks;
