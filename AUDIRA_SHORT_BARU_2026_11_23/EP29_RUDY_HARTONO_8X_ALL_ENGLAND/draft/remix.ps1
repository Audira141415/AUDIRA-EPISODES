# Remix audio EP29 sesuai G18 (VO loudnorm -16, SFX -10 dB, duck ratio 8), video stream copy.
$ep = 'F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP29_RUDY_HARTONO_8X_ALL_ENGLAND'
$env:TEMP = "$ep\draft\.tmp"; $env:TMP = $env:TEMP
New-Item -ItemType Directory -Force $env:TEMP | Out-Null
Set-Location $ep
$vo = 'project\public\audio\vo.wav'
$fx = 'project\public\audio\sfx.wav'
$graph = "[1:a]adelay=300:all=1,aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,aformat=channel_layouts=stereo,apad,asplit=2[vo][key];" +
         "[2:a]aresample=48000,aformat=channel_layouts=stereo,volume=-10dB,apad[fx];" +
         "[fx][key]sidechaincompress=threshold=0.015:ratio=8:attack=5:release=350[duck];" +
         "[vo][duck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
ffmpeg -hide_banner -loglevel error -y -i FINAL_VIDEO.mp4 -i $vo -i $fx -filter_complex $graph -map 0:v -map "[a]" -c:v copy -t 83.3 -c:a aac -b:a 320k -ar 48000 `
  -map_metadata -1 -metadata title="Rudy Hartono: 8x Juara All England" -metadata artist="AUDIRA (Agus Dwi R.)" `
  -metadata copyright="© 2026 AUDIRA - Agus Dwi R. All rights reserved." -metadata comment="AUDIRA-rudy-hartono-8x-all-england-EP29 | audira.my.id" `
  -metadata date="2026-11-23" -movflags +faststart+use_metadata_tags draft\FINAL_remix.mp4
"ffmpeg exit $LASTEXITCODE"
