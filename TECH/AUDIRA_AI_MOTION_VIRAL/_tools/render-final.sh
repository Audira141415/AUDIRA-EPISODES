#!/usr/bin/env bash
# Voice already built: renders every FINAL_VIDEO.mp4, measures it, cuts a frame sheet from the MP4, then rewrites the docs.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
cd "$ROOT"
for e in EP01_SATU_FOTO EP02_MOTION_TRANSFER EP03_MOBIL_TRANSFORM EP04_HEWAN_BICARA EP05_MOTION_GRAPHICS; do
  bash _tools/render.sh "$e" 4
  (cd "$e" && ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav && python ../_tools/qc.py > PROJECT/qc/qc.log)
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$e/FINAL_VIDEO.mp4")
  ffmpeg -y -loglevel error -i "$e/FINAL_VIDEO.mp4" -vf "fps=8/$d,scale=270:-1,tile=8x1" -frames:v 1 -update 1 "_tools/sheets/final-$e.jpg"
done
ffmpeg -y -loglevel error -i _tools/sheets/final-EP01_SATU_FOTO.jpg -i _tools/sheets/final-EP02_MOTION_TRANSFER.jpg -i _tools/sheets/final-EP03_MOBIL_TRANSFORM.jpg -i _tools/sheets/final-EP04_HEWAN_BICARA.jpg -i _tools/sheets/final-EP05_MOTION_GRAPHICS.jpg -filter_complex vstack=inputs=5 -update 1 _tools/sheets/final-all.jpg
python _tools/write-docs.py
for e in EP0*; do python -c "import json;m=json.load(open('$e/PROJECT/qc/metrics.json'));print('$e',m['lufs'],m['true_peak_dbfs'],m['vo_lufs'],m['music_lufs'],m['speech_s'],m['wpm'],m['caption_words_with_voice_pct'],m['caption_onset_max_gap_s'],m['freezes_over_2.5s'],len(m['black_segments']),m['decode_errors'],m['video']['nb_frames'])"; done
