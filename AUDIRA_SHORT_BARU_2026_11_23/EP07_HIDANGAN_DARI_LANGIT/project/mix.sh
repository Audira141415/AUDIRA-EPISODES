# G18 mix: VO loudnorm -16, SFX stem (-18.9 LUFS) volume -11dB + sidechain duck (ratio 8, attack 5, release 350, threshold 0.015), master -14 LUFS TP<-1 (two-pass)
set -e
cd "$(dirname "$0")/.."
ffmpeg -y -loglevel error -i audio/vo.wav -i audio/sfx.wav -filter_complex \
"[0:a]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,apad=whole_dur=85[vo];[vo]asplit=2[voa][vosc];\
[1:a]aresample=48000,volume=-11dB[sfx];[sfx][vosc]sidechaincompress=threshold=0.015:ratio=8:attack=5:release=350[duck];\
[voa][duck]amix=inputs=2:normalize=0:duration=longest[mix]" -map "[mix]" -c:a pcm_s24le -ar 48000 draft/mix_raw.wav
J=$(ffmpeg -hide_banner -i draft/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -y -loglevel error -i draft/mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -t 85 -c:a pcm_s24le draft/mix.wav
ffmpeg -y -loglevel error -i draft/video_noaudio.mp4 -i draft/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest \
 -map_metadata -1 -metadata title="Hidangan dari Langit — Kisah Hawariyyun & Nabi Isa AS" -metadata artist="AUDIRA (Agus Dwi R.)" \
 -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-hidangan-dari-langit-EP07 | audira.my.id" \
 -metadata date="2026-11-23" -movflags +faststart+use_metadata_tags FINAL_VIDEO.mp4
ffmpeg -hide_banner -nostats -i FINAL_VIDEO.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"
