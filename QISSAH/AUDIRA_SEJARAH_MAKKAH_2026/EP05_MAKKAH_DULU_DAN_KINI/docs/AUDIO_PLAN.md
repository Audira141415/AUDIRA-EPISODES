# Audio Plan — EP05 MAKKAH DULU DAN KINI

## Sumber
| Berkas | Isi | Catatan |
|---|---|---|
| `audio/vo.wav` → `project/public/audio/vo.wav` | Narasi Cartesia Galang, 48 kHz mono, −16 LUFS | Master clock, terkunci (tidak diubah) |
| `project/public/audio/bed.wav` | Musik + ambience + SFX tanpa suara, 729,434 dtk, 48 kHz stereo, −26 LUFS | `src/scenes/makkah/mix.py` |
| `project/public/audio/full.wav` | bed (−5 dB, sidechain di bawah VO) + VO | Untuk `render:final --vo` |
| `project/public/audio/short01_vo.wav`, `short02_vo.wav` | hook clip + potongan vo.wav per kata + outro clip, jeda 0,4 dtk, −16 LUFS (terukur −15,9) | `src/scenes/makkah/shorts.py` |
| `project/public/audio/short0N_bed.wav`, `short0N_full.wav` | Bed short dipotong dari bed panjang sesuai jam dunia tiap segmen, lalu digabung dengan cara yang sama | `mix.py` |

## Identitas musik episode ini
- **Maqam Hijaz pada D:** drone pelan D2, A2, dan D3 dengan swell 37 dtk sebagai "tarikan napas" pelat tembaga.
- **Ney sintetis** (sinus + harmonik + napas ber-band, vibrato 5,2 Hz) memainkan satu frase di setiap pintu bab, 1,1 dtk sebelum awal bab, bergantian kiri dan kanan.
- **Petikan mirip qanun** (aditif, decay per harmonik): enam nada jarang di awal tiap bab.
- **Daf** sangat pelan, hanya di Bab 5 (66 bpm, laut) dan Bab 7 (72 bpm, kota).
- Tidak ada vokal atau nyanyian. End screen berisi frase ney penuh di atas drone, lalu fade 1,5 dtk.

## Ambience per dunia
- Hook: air.
- Bab 1: angin lembah.
- Bab 2: arus air.
- Bab 3: hujan + air.
- Bab 4: gemericik saluran.
- Bab 5: ombak + angin.
- Bab 6: angin.
- Bab 7: dengung kota.
- End screen: angin tipis.

## SFX (`shared/assets/sfx/`)
- `whoosh-cinematic` 1,3 dtk sebelum tiap bab (perpindahan set), gain 0,16.
- `chime` di awal tiap bab (kartu bab), gain 0,09.
- `impact-bass-1` di detik 0,6 (hook), gain 0,22. Pada short, impact yang sama dipasang di awal hook.
- `riser` sebelum menara naik (Bab 6) dan sebelum penutup, gain 0,08.

## Mixing
- Bed dinormalisasi ke −26 LUFS, lalu `volume=-5dB` dan `sidechaincompress` (threshold 0,02, ratio 4, attack 20, release 450) dengan VO sebagai sidechain, kemudian amix tanpa normalisasi.
- **Hasil terukur:**
  - `full.wav` −16,3 LUFS dengan puncak −4,3 dBFS.
  - Bed pada detik 300–360 sekitar −28 LUFS sebelum −5 dB, yaitu sekitar 17 dB di bawah suara sebelum ducking.
  - End screen (bed saja) sekitar −27 LUFS efektif.
- Saat final, master tetap dinormalisasi ke −14 LUFS dengan true peak < −1 dBFS (tahap 9).
