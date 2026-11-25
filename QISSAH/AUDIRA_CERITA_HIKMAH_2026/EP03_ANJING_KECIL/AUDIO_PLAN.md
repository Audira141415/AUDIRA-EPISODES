# AUDIO PLAN — EP03 Anjing Kecil

## Pemeran suara (Cartesia sonic-3, id), maksimal 3 suara
| Tokoh | Suara | Speed |
|---|---|---|
| Narator | Risa 6a3fe952 | 0.86–0.95 |
| Anak anjing | Risa 6a3fe952 | 1.08 |
| Kuda | Galang 04b567df | 0.93 (berat) |
| Ayam | Galang 04b567df | 1.14 (cerewet) |
| Anjing tua | Galang 04b567df | 0.88 (pelan, bijak) |
| Sapi | Andi a053f6bc | 0.95 |
| Domba | Andi a053f6bc | 1.04 |
| Kucing | Andi a053f6bc | 1.10 |
| Pemilik ladang | Andi a053f6bc | 0.95 |

Label pembicara di caption menjelaskan siapa yang bicara walau suaranya sama.

## Musik (numpy, `mix.py`)
- **Sore di peternakan** (0:00–1:22): "band peternakan": ukulele dipetik, melodi marimba kayu, bass tuba, G mayor 96 bpm.
- **Kolam** (1:22–2:03): kotak musik + pad lembut, E minor 66 bpm, jarang.
- **Harapan** (2:03–2:19): pad C mayor dengan arpeggio kotak musik yang naik.
- **Pelukan** (2:19–2:45): band riang 112 bpm.
- **Hikmah & outro** (2:45–akhir): pad tenang, petikan bass, kotak musik; akor G mayor di outro.
- Musik turun ~5 dB di bawah setiap baris (ducking dari waktu klip) dan naik di jeda. Bed saat ini -22.9 LUFS terintegrasi, ada ruang untuk suara.

## Ambience
Burung (siang, memudar saat senja), angin pita sempit, air kolam (adegan kolam), jangkrik (malam).

## Cue SFX
whoosh-cinematic (pembuka, ke kolam, ke malam); pop (judul, tiap hewan menggembung, mendarat di pelukan); whoosh-short (tiap hewan baru, anak anjing berlari); click-soft (telur baru, langkah kaki stop-motion); whoosh (tikus); impact-bass-1 ("semua sepakat"); ping (anjing tua bangun); riser + chime (nasihat terakhir); sparkle (lompat ke pelukan, outro); chime (kartu hikmah).

## Setelah naskah disetujui
Bangun suara dari `voiceover.json`, ganti `timeline.json` dengan waktu nyata (film menyesuaikan sendiri), jalankan ulang `mix.py`, letakkan suara ~-16 LUFS di atas bed, master -14 LUFS.
