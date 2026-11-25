#!/usr/bin/env bash
# G18 mix: VO loudnorm -16, SFX stem (-20 LUFS) volume=-10dB, sidechain duck ratio 8 / 5 ms / 350 ms / thr 0.015,
# master loudnorm -14 LUFS TP -1.5 + alimiter, then ownership metadata -> FINAL_VIDEO.mp4
set -e
cd "$(dirname "$0")/.."
ffmpeg -y -v error -i draft/video_noaudio.mp4 -i audio/vo.wav -i audio/sfx.wav -filter_complex \
"[1:a]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,apad=whole_dur=88.9,asplit=2[vo][vosc];\
[2:a]aresample=48000,volume=-10dB[sfx];\
[sfx][vosc]sidechaincompress=ratio=8:attack=5:release=350:threshold=0.015[sfxd];\
[vo][sfxd]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false,aresample=48000[a]" \
-map 0:v -map "[a]" -c:a pcm_s16le -vn -t 88.9 draft/mix1.wav
I=$(ffmpeg -hide_banner -nostats -i draft/mix1.wav -af ebur128 -f null - 2>&1 | grep -A2 "Integrated loudness" | grep "I:" | awk '{print $2}')
G=$(python -c "print(-14.0-($I))")
echo "pass1 I=$I gain=$G"
ffmpeg -y -v error -i draft/video_noaudio.mp4 -i draft/mix1.wav -filter_complex "[1:a]volume=${G}dB,alimiter=limit=0.84:level=false:attack=1:release=50,aresample=48000[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -t 88.9 draft/mixed.mp4
rm -f draft/mix1.wav
ffmpeg -y -v error -i draft/mixed.mp4 -c copy -map_metadata -1 \
 -metadata title="Cara Kerja PLTA: Air Jatuh Jadi Listrik" \
 -metadata artist="AUDIRA (Agus Dwi R.)" \
 -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." \
 -metadata comment="AUDIRA-cara-kerja-plta-EP13 | audira.my.id" \
 -metadata date="2026-11-23" -movflags +faststart+use_metadata_tags FINAL_VIDEO.mp4
rm -f draft/mixed.mp4
ffmpeg -hide_banner -nostats -i FINAL_VIDEO.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -14 | grep -E "I:|Peak:"
