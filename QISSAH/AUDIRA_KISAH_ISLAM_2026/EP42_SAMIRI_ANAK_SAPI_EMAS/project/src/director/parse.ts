// Naskah (script) parser — see FORMAT-NASKAH.md. Text in, a list of scenes out:
//   header   JUDUL: / SERI: / SUARA:
//   scene    [PETA] … | [RUTE] … | [TEMPAT] … TOKOH: … | [PENUTUP] …   (starts a new scene)
//   overlay  [TANGGAL] … | [NAMA] … | [ANGKA] … | [SUMBER] …         (attached to the next narration line)
//   line     anything else = one narration sentence; *kata* = keyword
// Untagged narration is allowed: each paragraph becomes an "auto" scene that the planner resolves.

export type RawTag = { kind: "TANGGAL" | "NAMA" | "ANGKA" | "SUMBER"; text: string; line: number };
export type RawLine = { text: string; words: { w: string; key: boolean }[] };
export type RawScene = { kind: "PETA" | "RUTE" | "TEMPAT" | "PENUTUP" | "AUTO"; spec: string; tokoh: string; tags: RawTag[]; lines: RawLine[] };
export type RawStory = { title: string; series?: string; voice?: string; scenes: RawScene[] };

const SCENE_TAGS = ["PETA", "RUTE", "TEMPAT", "PENUTUP"] as const;
const OVERLAY_TAGS = ["TANGGAL", "NAMA", "ANGKA", "SUMBER"] as const;

export const splitWords = (text: string) => {
  const out: { w: string; key: boolean }[] = [];
  // keep *multi word keys* together as keys
  const re = /\*([^*]+)\*([,.!?;:]*)|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[1] !== undefined) {
      const parts = m[1].trim().split(/\s+/);
      parts.forEach((p, i) => out.push({ w: p + (i === parts.length - 1 ? m![2] : ""), key: true }));
    } else out.push({ w: m[3], key: false });
  }
  return out;
};

export const parseNaskah = (src: string): RawStory => {
  const story: RawStory = { title: "", scenes: [] };
  let cur: RawScene | null = null;
  let pendingBlank = false;
  const ensure = () => {
    if (!cur) {
      cur = { kind: "AUTO", spec: "", tokoh: "", tags: [], lines: [] };
      story.scenes.push(cur);
    }
    return cur;
  };
  for (const rawLine of src.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    if (!line) { pendingBlank = true; continue; }
    if (line.startsWith("#") || line.startsWith("//")) continue;
    const head = /^(JUDUL|SERI|SUARA|DURASI)\s*:\s*(.*)$/i.exec(line);
    if (head && story.scenes.length === 0 && !cur) {
      const k = head[1].toUpperCase();
      if (k === "JUDUL") story.title = head[2];
      else if (k === "SERI") story.series = head[2];
      else if (k === "SUARA") story.voice = head[2];
      continue;
    }
    const tag = /^\[([A-Za-z]+)\]\s*(.*)$/.exec(line);
    if (tag) {
      const k = tag[1].toUpperCase();
      const rest = tag[2].trim();
      if ((SCENE_TAGS as readonly string[]).includes(k)) {
        let spec = rest, tokoh = "";
        const ti = rest.search(/TOKOH\s*:/i);
        if (ti >= 0) { spec = rest.slice(0, ti).trim().replace(/[.,;]\s*$/, ""); tokoh = rest.slice(ti).replace(/^TOKOH\s*:\s*/i, "").trim(); }
        cur = { kind: k as RawScene["kind"], spec, tokoh, tags: [], lines: [] };
        story.scenes.push(cur);
        pendingBlank = false;
        continue;
      }
      if ((OVERLAY_TAGS as readonly string[]).includes(k)) {
        const sc = ensure();
        sc.tags.push({ kind: k as RawTag["kind"], text: rest, line: sc.lines.length });
        continue;
      }
      // unknown tag: keep as a scene hint
      const sc = ensure();
      sc.spec = (sc.spec + " " + rest).trim();
      continue;
    }
    if (/^TOKOH\s*:/i.test(line)) {
      ensure().tokoh = line.replace(/^TOKOH\s*:\s*/i, "");
      continue;
    }
    // narration; a blank line inside an AUTO scene starts the next AUTO scene
    if (pendingBlank && cur && (cur as RawScene).kind === "AUTO" && (cur as RawScene).lines.length > 0) {
      cur = { kind: "AUTO", spec: "", tokoh: "", tags: [], lines: [] };
      story.scenes.push(cur);
    }
    pendingBlank = false;
    // one line may hold several sentences: split them so captions & beats stay short
    const sentences = line.split(/(?<=[.!?]["”']?)\s+(?=[A-Z*"“])/);
    for (const s of sentences) {
      const t = s.trim();
      if (t) ensure().lines.push({ text: t, words: splitWords(t) });
    }
  }
  return story;
};
