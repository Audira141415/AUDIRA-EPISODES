# AUDIO PLAN — EP07

## Suara (dikunci, Cartesia sonic-3, id)
- Narator: Risa `6a3fe952`. Jack: Galang `04b567df`. Bobby: Andi `a053f6bc` (isi catatan dibaca pelan, speed 0,86–0,88).
- `public/audio/ep07/vo.wav` -16 LUFS. Lead menggabungkan suara dengan mix lewat `scripts/combine-vo.sh`.

## Musik (numpy, `src/scenes/ep07/mix.py`)
- Trio jazz noir larut malam di D minor, 63 BPM: electric piano bertremolo (Dm9, Bbmaj7, Gm9, A7b9), upright bass walking, brush snare, dan horn bersordin untuk ratapan.
- Bagian:
  - hook: chord jarang
  - s2: trio lengkap, makin tegang
  - s2f–s2j: tritone yang ditahan + detak jantung, lalu musik berhenti saat peluit
  - s4: bass + brush pelan
  - catatan (s6): Rhodes + horn sendu
  - hikmah: horn, lalu resolusi ke Dmaj9 saat lampu hijau
- Level: musik ~-27 dB RMS, mix keseluruhan -24,7 LUFS, true peak -3,4 dBTP. Musik turun ~8 dB di bawah setiap baris suara.

## Ambience
- Hujan kota (noise pita), di dalam mobil diganti hujan teredam di atap, tetesan di kaca/logam, guntur jauh dua kali.
- Mesin mobil dengan rpm mengikuti tiap shot mengemudi (idle, ngebut sampai 3.900 rpm, melambat, pulang pelan, langsam di lampu merah).

## Cue SFX
- impact bass saat membuka di lampu merah dan saat lampu merah s2h.
- klik relai saat kuning dan merah.
- whoosh saat cerita mundur dan saat mobil menerobos.
- peluit lalu lintas sintetis (2 tiupan dengan getar bola).
- ban basah saat menepi, pintu dibuka/dibanting dua kali.
- goresan pena di buku tilang, engkol jendela, kertas diselipkan dan dibuka.
- riser sebelum catatan, ping di pos kosong, klik lampu hijau, chime di outro.
