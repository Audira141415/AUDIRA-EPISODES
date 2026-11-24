// MediaBunny wrapper — replaces ffprobe for metadata reads and ffmpeg for
// metadata-only remux (stream copy) and video segment concat.  Analysis filters (ebur128,
// silence detect, scene detect, raw pixel decode) and audio mixing stay in ffmpeg.
//
// Every function is async.  Callers that were synchronous need `await`.

import fs from "node:fs";
import {
  Input, Output, Conversion, EncodedPacketSink, EncodedVideoPacketSource,
  Mp4InputFormat, Mp4OutputFormat, MovOutputFormat,
  WebMInputFormat, MatroskaInputFormat,
  WaveInputFormat, Mp3InputFormat, FlacInputFormat, OggInputFormat,
  AdtsInputFormat,
  FilePathSource, FilePathTarget,
} from "mediabunny";

const VIDEO_FORMATS = [new Mp4InputFormat(), new WebMInputFormat(), new MatroskaInputFormat()];
const AUDIO_FORMATS = [new WaveInputFormat(), new Mp3InputFormat(), new FlacInputFormat(), new OggInputFormat(), new AdtsInputFormat()];
const ALL = [...VIDEO_FORMATS, ...AUDIO_FORMATS];

function inputFor(file) {
  return new Input({ source: new FilePathSource(file), formats: ALL });
}

/** Full probe: codec, dimensions, fps, duration, sample rate, channels, tags. */
export async function probe(file) {
  const input = inputFor(file);
  try {
    const duration = await input.computeDuration();
    const vt = await input.getPrimaryVideoTrack().catch(() => null);
    const at = await input.getPrimaryAudioTrack().catch(() => null);

    let video = null;
    if (vt) {
      const fpsM = await vt.computeFrameRateMetrics().catch(() => null);
      video = {
        codec_name: await vt.getCodec(),
        codec_param: await vt.getCodecParameterString().catch(() => null),
        width: await vt.getDisplayWidth(),
        height: await vt.getDisplayHeight(),
        r_frame_rate: fpsM ? `${fpsM.bestGuessFrameRate}/1` : "0/1",
      };
    }
    let audio = null;
    if (at) {
      audio = {
        codec_name: await at.getCodec(),
        sample_rate: String(await at.getSampleRate()),
        channels: await at.getNumberOfChannels(),
      };
    }
    const fpsNum = video ? parseFloat(video.r_frame_rate) : 0;
    const { raw, ...standard } = await input.getMetadataTags().catch(() => ({ raw: {} }));
    const tags = {};
    if (raw) for (const [k, v] of Object.entries(raw)) tags[k.replace(/^©/, "").toLowerCase()] = v;
    for (const [k, v] of Object.entries(standard)) if (v != null) tags[k] = typeof v === "object" && v instanceof Date ? v.toISOString().slice(0, 10) : String(v);

    return { video, audio, fps: fpsNum, duration, tags };
  } finally {
    await input.dispose();
  }
}

// MediaBunny codec ids → ffprobe codec_name, so ffprobe-era checks (`codec_name === "h264"`) keep working.
const FFPROBE_CODEC = {
  avc: "h264", hevc: "hevc", vp8: "vp8", vp9: "vp9", av1: "av1", prores: "prores",
  aac: "aac", opus: "opus", mp3: "mp3", vorbis: "vorbis", flac: "flac", ac3: "ac3", eac3: "eac3", dts: "dts", truehd: "truehd",
  "pcm-s16": "pcm_s16le", "pcm-s16be": "pcm_s16be", "pcm-s24": "pcm_s24le", "pcm-s24be": "pcm_s24be",
  "pcm-s32": "pcm_s32le", "pcm-s32be": "pcm_s32be", "pcm-f32": "pcm_f32le", "pcm-f32be": "pcm_f32be",
  "pcm-f64": "pcm_f64le", "pcm-f64be": "pcm_f64be", "pcm-u8": "pcm_u8", "pcm-s8": "pcm_s8", ulaw: "pcm_mulaw", alaw: "pcm_alaw",
};

/**
 * Drop-in for `ffprobe -show_streams -show_format -of json`: `{ streams: [...], format: { duration } }` with the
 * ffprobe field names QA scripts read (codec_type, codec_name, width, height, r_frame_rate, sample_rate, channels,
 * duration; nb_frames when `countFrames` is set). Numbers that ffprobe prints as strings stay strings.
 */
export async function probeStreams(file, { countFrames = false } = {}) {
  const input = inputFor(file);
  try {
    const streams = [];
    for (const t of await input.getTracks()) {
      const codec = await t.getCodec();
      const s = { index: streams.length, codec_type: t.type, codec_name: FFPROBE_CODEC[codec] ?? codec, duration: String(await t.computeDuration()) };
      if (t.isVideoTrack()) {
        const fpsM = await t.computeFrameRateMetrics().catch(() => null);
        s.width = await t.getDisplayWidth();
        s.height = await t.getDisplayHeight();
        s.r_frame_rate = fpsM ? `${fpsM.bestGuessFrameRate}/1` : "0/1";
        if (countFrames) s.nb_frames = String((await t.computePacketStats()).packetCount);
      } else if (t.isAudioTrack()) {
        s.sample_rate = String(await t.getSampleRate());
        s.channels = await t.getNumberOfChannels();
      }
      streams.push(s);
    }
    return { streams, format: { duration: String(await input.computeDuration()) } };
  } finally {
    await input.dispose();
  }
}

/** Duration in seconds. */
export async function duration(file) {
  const input = inputFor(file);
  try {
    return await input.computeDuration();
  } finally {
    await input.dispose();
  }
}

/** Number of video packets (one per frame in a Remotion H.264 segment); 0 if missing or unreadable. */
export async function frameCount(file) {
  const input = inputFor(file);
  try {
    const vt = await input.getPrimaryVideoTrack();
    if (!vt) return 0;
    return (await vt.computePacketStats()).packetCount;
  } catch {
    return 0;
  } finally {
    await input.dispose();
  }
}

/**
 * Join video-only MP4 segments into one MP4 without re-encoding (replaces ffmpeg -f concat -c copy).
 * Packets are copied in decode order; each segment's timestamps are shifted to start where the previous
 * one ended. Segments must share codec and encoder settings (one render). Audio tracks are ignored.
 *
 * @param {string[]} files  segment MP4s in play order
 * @param {string} dst      output MP4 (fast start)
 * @returns {Promise<{ packets: number, duration: number }>}
 */
export async function concatSegments(files, dst) {
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new FilePathTarget(dst) });
  let source = null, offset = 0, packets = 0;
  try {
    for (const file of files) {
      const input = new Input({ source: new FilePathSource(file), formats: [new Mp4InputFormat()] });
      try {
        const vt = await input.getPrimaryVideoTrack();
        if (!vt) throw new Error(`${file}: no video track`);
        let meta;
        if (!source) {
          const fps = (await vt.computeFrameRateMetrics().catch(() => null))?.bestGuessFrameRate;
          source = new EncodedVideoPacketSource(await vt.getCodec());
          output.addVideoTrack(source, fps ? { frameRate: fps } : {});
          await output.start();
          meta = { decoderConfig: await vt.getDecoderConfig() };
        }
        const first = await vt.getFirstTimestamp();
        let end = first;
        for await (const p of new EncodedPacketSink(vt).packets()) {
          end = Math.max(end, p.timestamp + p.duration);
          await source.add(p.clone({ timestamp: offset + p.timestamp - first }), meta);
          meta = undefined;
          packets++;
        }
        offset += end - first;
      } finally {
        await input.dispose();
      }
    }
    if (!source) throw new Error("concatSegments: no segments");
    await output.finalize();
  } catch (e) {
    await output.cancel().catch(() => {});
    throw e;
  }
  return { packets, duration: offset };
}

/** Width and height of the primary video track. */
export async function size(file) {
  const input = inputFor(file);
  try {
    const vt = await input.getPrimaryVideoTrack();
    return { width: await vt.getDisplayWidth(), height: await vt.getDisplayHeight() };
  } finally {
    await input.dispose();
  }
}

/** Metadata tags (flat object, keys lowercased). */
export async function readTags(file) {
  const input = inputFor(file);
  try {
    const d = await input.computeDuration();
    const { raw, ...standard } = await input.getMetadataTags().catch(() => ({ raw: {} }));
    const tags = {};
    if (raw) for (const [k, v] of Object.entries(raw)) tags[k.replace(/^©/, "").toLowerCase()] = v;
    for (const [k, v] of Object.entries(standard)) if (v != null) tags[k] = typeof v === "object" && v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
    return { tags, duration: d };
  } finally {
    await input.dispose();
  }
}

/**
 * Remux (stream copy) with new standard metadata tags.  Does NOT support custom
 * tags like audira_signature — use ffmpeg for those.
 *
 * @param {string} src  input MP4
 * @param {string} dst  output MP4
 * @param {{ title?: string, artist?: string, comment?: string, date?: string, copyright?: string }} meta
 */
export async function remuxWithMeta(src, dst, meta) {
  const input = new Input({ source: new FilePathSource(src), formats: [new Mp4InputFormat()] });
  const output = new Output({ format: new Mp4OutputFormat(), target: new FilePathTarget(dst) });
  const conversion = await Conversion.init({ input, output });
  const tags = {};
  if (meta.title) tags.title = meta.title;
  if (meta.artist) tags.artist = meta.artist;
  if (meta.comment) tags.comment = meta.comment;
  if (meta.date) tags.date = meta.date instanceof Date ? meta.date : new Date(meta.date);
  const raw = {};
  if (meta.copyright) raw["©cpy"] = meta.copyright;
  if (Object.keys(raw).length) tags.raw = raw;
  if (Object.keys(tags).length) output.setMetadataTags(tags);
  try {
    await conversion.execute();
  } finally {
    // Release the read handle on src: on Windows an open handle makes the later rename over src fail with EPERM.
    await input.dispose();
  }
}

/**
 * Replace dst with src (rename), safe on Windows: delete dst first, then rename, retrying while
 * another process (antivirus, indexer, a viewer) still holds either file. Up to `tries` × `waitMs`.
 */
export function replaceFile(src, dst, { tries = 20, waitMs = 1000 } = {}) {
  for (let i = 1; ; i++) {
    try {
      if (fs.existsSync(dst)) fs.unlinkSync(dst);
      fs.renameSync(src, dst);
      return;
    } catch (e) {
      if (!["EPERM", "EBUSY", "EACCES"].includes(e.code)) throw e;
      // Rename can be refused while a reader (antivirus, indexer) holds src; a copy still works then.
      if (fs.existsSync(src) && !fs.existsSync(dst)) {
        try {
          fs.copyFileSync(src, dst);
          try { fs.unlinkSync(src); } catch {}
          return;
        } catch {}
      }
      if (i >= tries) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
    }
  }
}
