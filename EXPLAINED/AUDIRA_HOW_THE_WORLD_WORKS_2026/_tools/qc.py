"""Measures one finished episode. Run from the episode folder. Prints JSON and writes PROJECT/qc/metrics.json."""
import json, re, subprocess, wave
import numpy as np


def run(a):
    return subprocess.run(a, capture_output=True, text=True, encoding="utf8", errors="ignore")


F = "FINAL_VIDEO.mp4"
pv = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_frames,pix_fmt,duration", "-of", "json", F]).stdout)["streams"][0]
pa = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name,sample_rate,duration", "-of", "json", F]).stdout)["streams"][0]
dec = run(["ffmpeg", "-v", "error", "-i", F, "-f", "null", "-"]).stderr.strip()
fr = run(["ffmpeg", "-hide_banner", "-nostats", "-i", F, "-vf", "freezedetect=n=0.0005:d=2.5,blackdetect=d=0.3:pix_th=0.04", "-an", "-f", "null", "-"]).stderr
eb = run(["ffmpeg", "-hide_banner", "-nostats", "-i", F, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"]).stderr
vo = run(["ffmpeg", "-hide_banner", "-nostats", "-i", "AUDIO/voiceover.wav", "-af", "ebur128", "-f", "null", "-"]).stderr
mu = run(["ffmpeg", "-hide_banner", "-nostats", "-i", "AUDIO/work/stem-music.wav", "-af", "ebur128", "-f", "null", "-"]).stderr
last = lambda s, k: float(re.findall(k + r":\s+(-?[\d.]+)", s)[-1])

# caption sync: is the voice sounding during the first part of each caption word?
T = json.load(open("timeline.json", encoding="utf8"))
with wave.open("AUDIO/voiceover.wav", "rb") as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)
win = int(.01 * sr)
rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same"))
thr = 300
hit, off = 0, []
for wd in T["words"]:
    a, b = int(wd["start"] * sr), int(wd["end"] * sr)
    seg = rms[a:max(a + win, b)]
    hit += float((seg > thr).mean()) > .5
    # onset distance: gap from caption start to nearest sounding sample within +/-0.4 s
    lo = max(0, a - int(.4 * sr))
    idx = np.where(rms[lo:a + int(.4 * sr)] > thr)[0]
    off.append(abs(idx + lo - a).min() / sr if len(idx) else .4)
srt = open("SUBTITLES/subtitles.srt", encoding="utf8").read()
m = {
    "video": pv, "audio": pa, "decode_errors": len(dec.splitlines()) if dec else 0,
    "freezes_over_2.5s": fr.count("freeze_start"), "black_segments": re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", fr),
    "lufs": last(eb, "I"), "lra": last(eb, "LRA"), "true_peak_dbfs": last(eb, "Peak"),
    "vo_lufs": last(vo, "I"), "music_lufs": last(mu, "I"),
    "words": len(T["words"]), "speech_s": T["speech_end"], "wpm": round(len(T["words"]) / T["speech_end"] * 60),
    "srt_cues": srt.count(" --> "), "srt_last": re.findall(r"--> (\S+)", srt)[-1],
    "caption_words_with_voice_pct": round(100 * hit / len(T["words"]), 1),
    "caption_onset_max_gap_s": round(float(max(off)), 3), "caption_onset_mean_gap_s": round(float(np.mean(off)), 3),
}
print(json.dumps(m, indent=1))
json.dump(m, open("PROJECT/qc/metrics.json", "w"), indent=1)
