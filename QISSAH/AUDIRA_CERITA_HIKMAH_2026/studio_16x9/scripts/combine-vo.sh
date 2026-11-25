#!/usr/bin/env bash
# Voice on top: vo.wav (-16 LUFS) + music/SFX bed ducked under speech -> full.wav (fed to render-final --vo).
# usage: bash scripts/combine-vo.sh ep02 [bedGainDb]
set -e
A=public/audio/$1; G=${2:--5}
ffmpeg -y -v error -i $A/mix.wav -i $A/vo.wav -filter_complex \
 "[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=${G}dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]" \
 -map "[m]" -ar 48000 -ac 2 $A/full.wav
