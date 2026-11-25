// Cut-vs-sound measurements behind sync-check.mjs and qa-gate.mjs.

import fs from "node:fs";
import { probe, detectCuts, envelope, strongOnsets, loudnessJump, silences } from "./av.mjs";
import { loadVoTiming, classifyCut } from "./vo-timing.mjs";
import { parseShotlist, cutsOf } from "./shotlist.mjs";

export function syncCheck(file, o = {}) {
  const p = probe(file);
  if (!p.audio) return { error: `${file} has no audio stream` };
  let offset = o.offset, cuts, source;
  if (o.shotlist) {
    const sl = parseShotlist(fs.readFileSync(o.shotlist, "utf8"));
    cuts = cutsOf(sl).map((t) => ({ t, kind: "shot" }));
    offset ??= Number(sl.header.offset ?? 0) || 0;
    source = o.shotlist;
  } else if (o.cues) {
    const j = JSON.parse(fs.readFileSync(o.cues, "utf8"));
    cuts = (Array.isArray(j) ? j : j.cuts).map((t) => ({ t: Number(t), kind: "cue" }));
    offset ??= Number(j.offset ?? 0) || 0;
    source = o.cues;
  } else {
    cuts = detectCuts(file, p.fps);
    source = "detected";
  }
  offset ??= 0;
  const vo = o.timing || o.words ? loadVoTiming(o.timing, o.words) : null;
  const env = envelope(file);
  const onsets = o.beat ? strongOnsets(env) : [];
  const tol = (o.tol ?? 100) / 1000;

  const rows = cuts.filter((c) => c.t >= 0.5 && c.t <= p.duration - 0.3).map((c) => {
    const row = { t: +c.t.toFixed(3), kind: c.kind, issues: [] };
    if (vo) {
      const v = classifyCut(c.t - offset, vo);
      row.vo = v.kind;
      if (v.level !== "ok") row.issues.push({ level: v.level, msg: v.detail });
    }
    row.jump = +loudnessJump(env, c.t).toFixed(1);
    if (row.jump > 6) row.issues.push({ level: "fail", msg: `STARTLE: +${row.jump} dB jump into the cut (duck the music or soften the hit)` });
    if (o.beat) {
      const near = onsets.reduce((b, t) => (Math.abs(t - c.t) < Math.abs(b - c.t) ? t : b), Infinity);
      row.beat = Number.isFinite(near) ? Math.round((near - c.t) * 1000) : null;
      if (row.beat === null || Math.abs(row.beat) > tol * 1000) row.issues.push({ level: "warn", msg: `OFF-BEAT: nearest strong onset ${row.beat ?? "none"} ms` });
    }
    return row;
  });

  // VO drift: match the timing file's pauses (shifted by offset) to pauses measured in the MP4
  let drift = null;
  if (vo?.pauses.length) {
    const got = silences(file, -35, 0.15), deltas = [];
    for (const want of vo.pauses) {
      if (want.end - want.start < 0.3) continue;
      const ws = want.start + offset;
      const m = got.find((g) => Math.abs(g.start - ws) < 0.4);
      if (m) deltas.push(m.start - ws);
    }
    deltas.sort((a, b) => a - b);
    drift = deltas.length >= 5
      ? { matched: deltas.length, of: vo.pauses.length, median: +(deltas[deltas.length >> 1] * 1000).toFixed(0) }
      : { matched: deltas.length, of: vo.pauses.length, median: null };
  }
  return { file, source, offset, fps: p.fps, duration: p.duration, rows, drift };
}
