# AUDIO PLAN — EP05

## Suara (setelah naskah disetujui)
- Cartesia sonic-3, bahasa id. Narator **Risa** `6a3fe952-63f8-4c99-865a-44887175ea26` (speed 0.88–0.95); Kura-kura **Galang** `04b567df-2923-4b0c-896b-4b7df0a07e1a` (0.85–0.9, pelan dan hangat, makin pelan saat tenggelam); Kalajengking **Andi** `a053f6bc-7df4-40de-96d4-de026bc47ce8` (1.05 licik; 0.88–0.92 saat menyesal).
- Request: `EP05_KURA_KALAJENGKING/voiceover.json`.

## Musik (numpy, `studio/src/scenes/ep05/mix.py`)
- Petikan senar mirip guzheng (Karplus-Strong), pentatonik D gong, 60 BPM, frasa jarang.
- Seruling napas (mirip xiao) sebagai drone lembut di D.
- Penyeberangan: motif kedua lebih ringan di atas motif pertama.
- Dari "tepat di tengah sungai" sampai sengatan: melodi berhenti, drone rendah + denyut naik.
- Bawah air: sub drone 55 Hz, musik di-low-pass (teredam).
- Hikmah: motif resolusi kembali sampai outro.
- Musik turun ~45% di bawah setiap baris (siap untuk suara); bed -24.0 LUFS.

## Ambience
Aliran sungai (noise tersaring, stereo), angin di pinus, burung jauh di tepi (bagian awal), gemuruh bawah air; ambience atas air hilang saat kamera menyelam dan kembali saat naik.

## SFX cue
| cue | waktu kunci | SFX |
|---|---|---|
| stempel judul | 3.4 dtk | click-soft |
| pan ke tepi | s2a | whoosh |
| ke kalajengking | s2b | whoosh-short |
| "Apa?" | s3a | pop |
| kura-kura berbalik | s5c | whoosh-short |
| masuk air | akhir s5d | cipratan (noise) |
| kayuhan | s6 | swish noise berulang |
| menjelang sengatan | sampai "menyengat" (s7a) | riser |
| sengatan | "menyengat" | impact-bass-1 |
| menyelam | s8a | whoosh-cinematic + gelembung (pop pendek) |
| naik ke permukaan | setelah s8f | whoosh |
| hikmah | s9c | chime |
| "naik" / "turun" | s9f | sparkle / whoosh-short |
| stempel penutup | setelah s9f | click-soft |
| outro | 3.2 dtk terakhir | ping |
