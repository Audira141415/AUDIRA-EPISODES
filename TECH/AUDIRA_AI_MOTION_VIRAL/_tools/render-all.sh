#!/usr/bin/env bash
# Renders the silent previews, then gives EP05 a review sheet made of real frames from the other four.
set -e
ROOT=/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION_VIRAL
cd "$ROOT"
for e in EP01_SATU_FOTO EP02_MOTION_TRANSFER EP03_MOBIL_TRANSFORM EP04_HEWAN_BICARA; do bash _tools/render.sh "$e" 4; done
ffmpeg -y -loglevel error -ss 12 -i EP01_SATU_FOTO/PREVIEW.mp4 -ss 30 -i EP02_MOTION_TRANSFER/PREVIEW.mp4 -ss 54 -i EP03_MOBIL_TRANSFORM/PREVIEW.mp4 -ss 3 -i EP04_HEWAN_BICARA/PREVIEW.mp4 -ss 48 -i EP01_SATU_FOTO/PREVIEW.mp4 -ss 60 -i EP02_MOTION_TRANSFER/PREVIEW.mp4 -ss 14 -i EP03_MOBIL_TRANSFORM/PREVIEW.mp4 -ss 60 -i EP04_HEWAN_BICARA/PREVIEW.mp4 -ss 70 -i EP03_MOBIL_TRANSFORM/PREVIEW.mp4 -filter_complex "[0:v]trim=end_frame=1,scale=360:-1[a];[1:v]trim=end_frame=1,scale=360:-1[b];[2:v]trim=end_frame=1,scale=360:-1[c];[3:v]trim=end_frame=1,scale=360:-1[d];[4:v]trim=end_frame=1,scale=360:-1[e];[5:v]trim=end_frame=1,scale=360:-1[f];[6:v]trim=end_frame=1,scale=360:-1[g];[7:v]trim=end_frame=1,scale=360:-1[h];[8:v]trim=end_frame=1,scale=360:-1[i];[a][b][c][d][e][f][g][h][i]xstack=inputs=9:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h3|w0_h0+h3|w0+w1_h0+h3[o]" -map "[o]" -frames:v 1 -q:v 3 EP05_MOTION_GRAPHICS/PROJECT/HyperFrames_Remotion/assets/img/review.jpg
bash _tools/render.sh EP05_MOTION_GRAPHICS 4
python _tools/qc-preview.py
