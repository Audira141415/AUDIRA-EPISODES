// Motion memory from the starter scripts: every render that uses a style is measured and recorded,
// so improvement does not depend on anyone remembering to call audira_style_memory.
//
// Where things are found:
//   hub      $AUDIRA_HUB, else F:/AUDIRA-ALL-SKILL (motion-memory/ + mcp-server/src/style-memory.js)
//   episode  nearest folder above the working directory with STATUS.json or style/STYLE_DECISION.md
//   style    STATUS.json data.style, else STYLE_DECISION.md, else the composition id (InnerworksPreview -> INNERWORKS)
//   label    STATUS.json data.memoryEpisode, else <series>-EP<NN> from the folder names, else kit-lab-<date>
// Turn off with AUDIRA_MEMORY=off. When the hub cannot be reached the record goes to
// <episode or cwd>/out/memory-pending.jsonl and is replayed on the next successful write.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const today = () => new Date().toISOString().slice(0, 10);

// Deliberately flat looks: the audit skips the flat-plane rule for these.
export const FLAT_STYLES = new Set(["RISOFORGE", "UKIYOFORGE", "COMICFORGE", "PIXELSTORY", "INKSTORY", "CHALKCRAFT", "TOONFORGE",
  "WATERCOLOR", "SKETCHFORGE", "MANUSCRIPT", "HISTORYMAP", "ISLAMICDOCUMENTARY", "WAYANGFORGE", "TEXTVOYAGE", "RETROWAVE",
  "ARCADECRT", "GLITCHFORGE", "DRAFTFORGE", "TRADINGTERMINAL", "SATELLITEBRIEFING"]);

export function hubRoot() {
  const c = [process.env.AUDIRA_HUB, "F:/AUDIRA-ALL-SKILL"].filter(Boolean);
  return c.find((d) => fs.existsSync(path.join(d, "mcp-server/src/style-memory.js"))) ?? null;
}

let mod = null;
async function memoryModule() {
  if (mod) return mod;
  const hub = hubRoot();
  if (!hub) return null;
  mod = await import(pathToFileURL(path.join(hub, "mcp-server/src/style-memory.js")).href);
  return mod;
}

function knownStyles() {
  const hub = hubRoot();
  const dirs = [hub && path.join(hub, "motion-memory/styles")].filter(Boolean);
  const kits = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../kits");
  const set = new Set();
  for (const d of dirs) if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith(".json")) set.add(f.slice(0, -5));
  if (fs.existsSync(kits)) for (const k of fs.readdirSync(kits)) set.add(k.toUpperCase());
  for (const k of ["src/kits", "../src/kits"]) if (fs.existsSync(k)) for (const d of fs.readdirSync(k)) set.add(d.toUpperCase());
  set.delete("GLOBAL");
  return set;
}

/** Same rule as style-memory.js episodeLabel: AUDIRA_SEJARAH_NEGARA_2026/EP27_MALI -> sejarah-negara-EP27 */
export function episodeLabel(dir) {
  const parts = path.resolve(dir).replace(/\\/g, "/").split("/").filter(Boolean);
  const m = (parts.at(-1) || "").match(/^EP0*(\d+)/i);
  if (!m) return null;
  const tokens = (parts.at(-2) || "").split("_").filter((t) => !/^\d{4}$/.test(t));
  if (tokens.length > 1) tokens.shift();
  return `${tokens.join("-").toLowerCase() || "episode"}-EP${m[1].padStart(2, "0")}`;
}

/** The chosen style in a STYLE_DECISION.md: lines that say "terpilih / dipilih / style:" first, then the first style named. */
export function styleFromText(text, styles = knownStyles()) {
  const lines = String(text).split("\n");
  const chosen = lines.filter((l) => /terpilih|dipilih|pilihan|chosen|selected|^\s*[-*]?\s*\**style\**\s*:/i.test(l) && !/ditolak|rejected|alternatif/i.test(l));
  for (const block of [chosen.join("\n"), text]) {
    for (const w of block.match(/\b[A-Z][A-Z0-9]{3,}\b/g) || []) if (styles.has(w)) return w;
  }
  return null;
}

/** Style from a composition id: InnerworksPreview, ToyDioramaWideFinal, FilmNoirPreview -> kit name. */
export function styleFromComp(comp, styles = knownStyles()) {
  if (!comp) return null;
  const base = comp.replace(/(Wide)?(Preview|Final|Draft|Cover|Still)$/i, "").replace(/Wide$/i, "").toUpperCase();
  return styles.has(base) ? base : null;
}

/** Nearest episode folder at or above `from` (the project folder sits inside it). */
export function findEpisode(from = process.cwd()) {
  let d = path.resolve(from);
  for (let i = 0; i < 5; i++) {
    const status = path.join(d, "STATUS.json"), decision = path.join(d, "style", "STYLE_DECISION.md");
    if (fs.existsSync(status) || fs.existsSync(decision)) {
      let st = {};
      try { st = JSON.parse(fs.readFileSync(status, "utf8")); } catch {}
      let style = st.data?.style ? String(st.data.style).toUpperCase().replace(/[^A-Z0-9]/g, "") : null;
      if (!style && fs.existsSync(decision)) style = styleFromText(fs.readFileSync(decision, "utf8"));
      return { dir: d.replace(/\\/g, "/"), style, label: st.data?.memoryEpisode || episodeLabel(d) || path.basename(d).toLowerCase(), hasStatus: fs.existsSync(status) };
    }
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

/** Style + label for this run: explicit options win, then the episode, then the composition id. */
export function context({ style, comp, label, from } = {}) {
  const ep = findEpisode(from);
  const s = (style && String(style).toUpperCase().replace(/[^A-Z0-9]/g, "")) || ep?.style || styleFromComp(comp);
  return { style: s || null, label: label || ep?.label || `kit-lab-${today()}`, episode: ep };
}

function pendingFile(ctx) {
  return path.join(ctx.episode?.dir ?? process.cwd(), "out", "memory-pending.jsonl");
}

/** Write one record (record_run / record_score / append_lesson). Never throws: a render must not fail on memory. */
export async function remember(args, ctx) {
  if (process.env.AUDIRA_MEMORY === "off" || !args.style) return { ok: false, skipped: true };
  try {
    const m = await memoryModule();
    if (!m) throw new Error("motion memory hub not found (set AUDIRA_HUB)");
    const pf = pendingFile(ctx ?? {});
    if (fs.existsSync(pf)) { // replay records that could not be written earlier
      const lines = fs.readFileSync(pf, "utf8").split("\n").filter(Boolean);
      fs.rmSync(pf);
      for (const l of lines) { try { m.styleMemory(hubRoot(), JSON.parse(l)); } catch {} }
    }
    const r = m.styleMemory(hubRoot(), args);
    if (!r.ok) throw new Error(r.error);
    return r;
  } catch (e) {
    try {
      const pf = pendingFile(ctx ?? {});
      fs.mkdirSync(path.dirname(pf), { recursive: true });
      fs.appendFileSync(pf, JSON.stringify(args) + "\n");
    } catch {}
    console.error(`(motion memory: not recorded, ${e.message}; queued in out/memory-pending.jsonl)`);
    return { ok: false, error: e.message };
  }
}

/** Records of this episode in memory, for the render gate. */
export async function records(style, label) {
  const m = await memoryModule();
  if (!m?.episodeRecords) return null;
  return m.episodeRecords(hubRoot(), style, label);
}
