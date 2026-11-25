// Delivery master: measure integrated loudness, apply gain + a true limiter so the file
// lands at the target without clipping, copy the video stream untouched, then verify.
//   node scripts/deliver.mjs <in.mp4> <out.mp4> [targetLUFS=-14] [ceilingDb=-2]
// (loudnorm alone can't stop AAC inter-sample overshoot; a limiter before the encoder can.)

import { spawnSync } from "node:child_process";
import { probeStreams } from "./lib/media.mjs";

const [input, output, targetArg = "-14", ceilArg = "-2"] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/deliver.mjs <in.mp4> <out.mp4> [targetLUFS] [ceilingDb]");
  process.exit(1);
}
const target = Number(targetArg);
let ceilDb = Number(ceilArg);
// G18e: the delivered master must measure -14 LUFS (+-1 LU) and true peak below -1 dBFS, or delivery fails.
// EP29 Rudy Hartono first shipped at -0.9 dBTP: AAC inter-sample overshoot passed the -2 dB limiter.
const MAX_TP = -1, MAX_LU_OFF = 1;

const ffmpeg = (args) => {
  const r = spawnSync("ffmpeg", args, { encoding: "utf8", maxBuffer: 1 << 28 }); // ebur128 logs of a 10+ min film exceed the 1 MB default
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stderr;
};

/** ebur128 prints its summary to stderr. */
const loudness = (file) => {
  const log = ffmpeg(["-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const s = log.slice(log.lastIndexOf("Summary"));
  return {
    I: Number(/I:\s+(-?[\d.]+) LUFS/.exec(s)?.[1]),
    peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(s)?.[1]),
  };
};

const before = loudness(input);
let gain = target - before.I + 0.4; // the limiter shaves a little; aim slightly high
let after;
// Peaky voices make the limiter eat more than expected, so measure and correct (max 8 passes).
for (let pass = 1; pass <= 8; pass++) {
  ffmpeg([
    "-v", "error", "-y", "-i", input, "-c:v", "copy",
    "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${(10 ** (ceilDb / 20)).toFixed(3)}:level=false:attack=2:release=80,aresample=48000`,
    "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", output,
  ]);
  after = loudness(output);
  const loudOk = Math.abs(after.I - target) <= 0.5, peakOk = after.peak < MAX_TP - 0.2;
  if (loudOk && peakOk) break;
  if (!peakOk) ceilDb -= 0.5; // G18e: AAC overshoot, pull the limiter down and encode again
  if (!loudOk) gain += 1.6 * (target - after.I); // the limiter absorbs part of every boost
}
const probe = await probeStreams(output, { countFrames: true }).then(({ streams }) => {
  const v = streams.find((s) => s.codec_type === "video");
  return v ? [v.codec_name, v.width, v.height, v.r_frame_rate, v.nb_frames].join(",") : "";
});
console.log(`in : ${before.I} LUFS, true peak ${before.peak} dBFS`);
console.log(`out: ${after.I} LUFS, true peak ${after.peak} dBFS (gain ${gain.toFixed(2)} dB)`);
console.log(`video: ${probe}`);
if (Math.abs(after.I - target) > 0.5) console.warn(`WARNING: integrated loudness ${after.I} LUFS is more than 0.5 LU from the ${target} LUFS target; report this honestly.`);

if (!(after.peak < MAX_TP) || !(Math.abs(after.I - target) <= MAX_LU_OFF)) {
  console.error(`ERROR G18e: master ${after.I} LUFS / true peak ${after.peak} dBFS. Wajib ${target} LUFS (+-${MAX_LU_OFF} LU) dan true peak < ${MAX_TP} dBFS. Final ini TIDAK boleh dikirim.`);
  process.exit(1);
}
