#!/usr/bin/env bash
# bash _tools/finish-viral.sh <EP folder> <E0x> [concurrency]: renders the final picture, muxes the mix, masters to -14 LUFS, runs QC. Run from AUDIRA_IJAZAH_2026.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_IJAZAH_2026
EP=$1; ID=$2; C=${3:-4}
export TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp'
cd "$ROOT/motion"
npx remotion render "${ID}Final" "../$EP/PROJECT/raw.mp4" --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency="$C" --muted --image-format=jpeg --jpeg-quality=95 2>&1 | tail -1 | cut -c1-120
cd "$ROOT/$EP"
ffmpeg -y -loglevel error -i PROJECT/raw.mp4 -i AUDIO/mix.wav -map 0:v -map 1:a -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -color_range tv -colorspace bt709 -c:v libx264 -crf 18 -preset medium -c:a pcm_s16le -shortest PROJECT/raw-mux.mov
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw-mux.mov FINAL_VIDEO.mp4
rm -f PROJECT/raw-mux.mov
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vf scale=540:960 -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 96k PREVIEW.mp4
python ../_tools/qc.py
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 FINAL_VIDEO.mp4)
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vf "fps=12/$d,scale=240:-1,tile=6x2" -frames:v 1 PROJECT/qc/final-sheet.jpg
ls -la FINAL_VIDEO.mp4 PREVIEW.mp4
