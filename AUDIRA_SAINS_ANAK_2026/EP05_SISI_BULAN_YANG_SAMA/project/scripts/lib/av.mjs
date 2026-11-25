// Small ffmpeg-based measurements shared by sync-check and qa-gate.
// Cut detection and the onset/startle logic are adapted from javascript-animation-skills'
// soundtrack/sync-check.mjs (MIT, iart.ai).
//
// probe() uses MediaBunny (35× faster than ffprobe, zero subprocess).
// Analysis functions (frameStats, silences, loudness, blackAndFreeze) stay ffmpeg.

import { spawnSync } from "node:child_process";
import { probe as mbProbe } from "./media.mjs";

const run = (cmd, args, binary = false) => {
  const r = spawnSync(cmd, args, { encoding: binary ? "buffer" : "utf8", maxBuffer: 1 << 30 });
  if (r.error) throw new Error(`${cmd} not found: install ffmpeg and put it on PATH`);
  return r;
};

// MediaBunny → ffprobe codec name mapping (MP4 internal names differ from ffprobe names)
const VCODEC = { avc: "h264", hevc: "h265", vp9: "vp9", av1: "av1" };
const ACODEC = { mp4a: "aac", opus: "opus", vorbis: "vorbis", flac: "flac", mp3: "mp3" };
// AVC profile param → common pix_fmt (MediaBunny can't read pixel format directly)
const pixFmtFromParam = (p) => !p ? "unknown" : /^avc1\.(42|4d|58)/.test(p) ? "yuv420p" : /^avc1\.64/.test(p) ? "yuv420p" : "yuv420p";

/** Probe via MediaBunny (async).  Returns the same shape as the old ffprobe version. */
export async function probe(file) {
  const p = await mbProbe(file);
  const v = p.video ? { codec_type: "video", codec_name: VCODEC[p.video.codec_name] ?? p.video.codec_name, width: p.video.width, height: p.video.height, r_frame_rate: p.video.r_frame_rate, pix_fmt: pixFmtFromParam(p.video.codec_param) } : null;
  const a = p.audio ? { codec_type: "audio", codec_name: ACODEC[p.audio.codec_name] ?? p.audio.codec_name, sample_rate: p.audio.sample_rate, channels: p.audio.channels } : null;
  return { video: v, audio: a, fps: p.fps, duration: p.duration, tags: p.tags };
}

/** Sync fallback for callers that cannot be made async yet. */
export function probeSync(file) {
  const r = run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels:format=duration:format_tags", "-of", "json", file]);
  if (r.status !== 0) throw new Error(r.stderr || `ffprobe failed on ${file}`);
  const j = JSON.parse(r.stdout);
  const v = j.streams.find((s) => s.codec_type === "video"), a = j.streams.find((s) => s.codec_type === "audio");
  const [fn, fd] = (v?.r_frame_rate ?? "0/1").split("/").map(Number);
  return { video: v, audio: a, fps: fd ? fn / fd : 0, duration: Number(j.format.duration), tags: j.format.tags ?? {} };
}

/** 64×64 gray frames → per-frame detail (local contrast) and motion (diff to previous). */
export function frameStats(file, S = 64) {
  const raw = run("ffmpeg", ["-v", "error", "-i", file, "-vf", `scale=${S}:${S},format=gray`, "-f", "rawvideo", "-"], true).stdout;
  const n = raw.length / (S * S), detail = [], motion = [0];
  for (let i = 0; i < n; i++) {
    const f = raw.subarray(i * S * S, (i + 1) * S * S);
    let d = 0; for (let k = 1; k < f.length; k++) d += Math.abs(f[k] - f[k - 1]);
    detail.push(d / f.length);
    if (i) { const g = raw.subarray((i - 1) * S * S, i * S * S); let m = 0; for (let k = 0; k < f.length; k++) m += Math.abs(f[k] - g[k]); motion.push(m / f.length); }
  }
  return { n, detail, motion };
}

/** Fallback when no shot list is given: dips toward blank + single-frame motion spikes. */
export function detectCuts(file, fps) {
  const { n, detail, motion } = frameStats(file);
  const blank = Math.min(...detail), maxD = Math.max(...detail), cuts = [];
  for (let i = 2; i < n - 2; i++) {
    if (detail[i] < blank + (maxD - blank) * 0.12 && detail[i] <= detail[i - 1] && detail[i] <= detail[i + 1] && detail[i] < detail[i - 2])
      if (!cuts.length || i / fps - cuts.at(-1).t > 0.5) cuts.push({ t: i / fps, kind: "dip" });
  }
  const mean = motion.reduce((a, b) => a + b, 0) / motion.length;
  for (let i = 1; i < n; i++) if (motion[i] > mean * 8 && !cuts.some((c) => Math.abs(c.t - i / fps) < 0.5)) cuts.push({ t: i / fps, kind: "hard" });
  return cuts.sort((a, b) => a.t - b.t);
}

/** RMS envelope at 100 Hz (10 ms hops), mono 12 kHz. */
export function envelope(file) {
  const SR = 12000, pcm = run("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"], true).stdout;
  const hop = SR / 100, nH = Math.floor(pcm.length / 2 / hop), env = new Float64Array(nH);
  for (let h = 0; h < nH; h++) {
    let e = 0; for (let k = 0; k < hop; k++) { const v = pcm.readInt16LE((h * hop + k) * 2) / 32768; e += v * v; }
    env[h] = Math.sqrt(e / hop);
  }
  return env;
}

/** Strong audio onsets (seconds): energy rises that stand out within ±1 s. */
export function strongOnsets(env) {
  const flux = Array.from(env, (e, i) => Math.max(0, e - (env[i - 1] || 0))), on = [];
  for (let i = 1; i < flux.length - 1; i++) {
    const a = Math.max(0, i - 50), b = Math.min(flux.length, i + 50);
    let mean = 0; for (let k = a; k < b; k++) mean += flux[k]; mean /= b - a;
    if (flux[i] > mean * 3 && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1] && flux[i] > 0.002) {
      const last = on.at(-1);
      if (!last || i / 100 - last.start > 0.12) on.push({ start: i / 100, t: i / 100, s: flux[i] });
      else if (flux[i] > last.s) { last.t = i / 100; last.s = flux[i]; }
    }
  }
  return on.filter((o) => {
    const nb = on.filter((p) => Math.abs(p.t - o.t) <= 1).map((p) => p.s).sort((x, y) => x - y);
    return o.s >= nb[Math.floor(nb.length * 0.3)];
  }).map((o) => o.t);
}

/** Loudness jump (dB) into time t vs. the music before it; > 6 dB reads as a startle. */
export function loudnessJump(env, t) {
  const rms = (t0, t1) => {
    const a = Math.max(0, Math.round(t0 * 100)), b = Math.min(env.length, Math.round(t1 * 100));
    let e = 0; for (let i = a; i < b; i++) e += env[i] * env[i];
    return Math.sqrt(e / Math.max(1, b - a)) + 1e-6;
  };
  const before = rms(t - 1, t), wins = [1, 2, 3, 4].map((k) => rms(t - k, t - k + 1)), loud = Math.max(...wins), srt = [...wins].sort((a, b) => a - b);
  // coming out of a deliberate break, compare with the level before the break
  const ref = 20 * Math.log10(before / loud) < -10 ? loud : Math.max(before, (srt[1] + srt[2]) / 2);
  return 20 * Math.log10(rms(t, t + 0.3) / ref);
}

/** Pauses in the file's audio (silencedetect). */
export function silences(file, noiseDb = -35, minDur = 0.2) {
  const log = run("ffmpeg", ["-v", "info", "-i", file, "-vn", "-af", `silencedetect=n=${noiseDb}dB:d=${minDur}`, "-f", "null", "-"]).stderr;
  const s = [...log.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => Number(m[1]));
  const e = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return s.map((x, i) => ({ start: Math.max(0, x), end: e[i] ?? Infinity }));
}

/** Integrated loudness and true peak (ebur128). */
export function loudness(file) {
  const log = run("ffmpeg", ["-nostats", "-i", file, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr;
  const s = log.slice(log.lastIndexOf("Summary"));
  return { I: Number(/I:\s+(-?[\d.]+) LUFS/.exec(s)?.[1]), peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(s)?.[1]) };
}

/** Black stretches and frozen stretches in one decode pass at quarter size. */
export function blackAndFreeze(file, freezeSec = 2) {
  const log = run("ffmpeg", ["-v", "info", "-i", file, "-an", "-vf", `scale=270:-2,blackdetect=d=0.1:pix_th=0.10,freezedetect=n=-60dB:d=${freezeSec}`, "-f", "null", "-"]).stderr;
  const black = [...log.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => ({ start: +m[1], end: +m[2] }));
  const fs = [...log.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => +m[1]);
  const fe = [...log.matchAll(/freeze_end: ([\d.]+)/g)].map((m) => +m[1]);
  return { black, freeze: fs.map((s, i) => ({ start: s, end: fe[i] ?? Infinity })) };
}
