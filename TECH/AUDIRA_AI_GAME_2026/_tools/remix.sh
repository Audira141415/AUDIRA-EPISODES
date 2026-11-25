#!/usr/bin/env bash
# Swap a new mix.wav under an already-rendered picture, then re-master. Run from an episode folder.
ffmpeg -y -loglevel error -i PROJECT/raw.mp4 -i PROJECT/HyperFrames_Remotion/assets/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a pcm_s16le -shortest PROJECT/raw-remix.mov
python /f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_AI_MOTION/_shared/tools/master.py PROJECT/raw-remix.mov FINAL_VIDEO.mp4
ffmpeg -y -loglevel error -i FINAL_VIDEO.mp4 -vn -ar 44100 -ac 2 -c:a pcm_s16le AUDIO/master_audio.wav
rm -f PROJECT/raw-remix.mov
