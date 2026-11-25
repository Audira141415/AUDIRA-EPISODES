import json
m = json.load(open("PROJECT/qc/metrics.json"))
keys = ("lufs", "true_peak_dbfs", "vo_lufs", "music_lufs", "decode_errors", "freezes_over_2.5s", "wpm", "caption_words_with_voice_pct", "caption_onset_max_gap_s", "black_segments")
print({k: m[k] for k in keys}, m["video"]["width"], m["video"]["height"], m["video"]["r_frame_rate"], m["video"]["duration"])
