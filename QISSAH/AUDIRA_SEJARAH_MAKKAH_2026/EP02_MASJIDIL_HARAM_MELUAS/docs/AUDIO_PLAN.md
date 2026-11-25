# Audio Plan — EP02 MASJIDIL HARAM MELUAS

**Master clock:** `audio/vo.wav` (Cartesia Galang `04b567df…`, `id`, −16 LUFS, terkunci). Film 718,39 dtk (VO berakhir 698,39 dtk + end screen 20 dtk).

**Bed (tanpa suara manusia, tanpa nyanyian):** `project/src/scenes/haram/mix.py` (numpy/scipy) menulis `public/audio/bed.wav` sepanjang film.
- Identitas episode: drone D hangat (fundamental + kuint + oktaf) yang akarnya bergeser per bab (D → G → C → F → G → A → C → D) dan meluncur ±3 dtk di pergantian bab; ambience udara halaman (noise band-pass 180–900 Hz).
- Petikan mirip qanun pada tangga D–F–G–A–C (tanpa mikrotone) dengan jawaban oktaf. Kepadatannya tumbuh bersama masjid (0,35/dtk di Bab 1 → 0,95/dtk di Bab 6 → 1,2/dtk di payoff) dan diredam di Bab 7 serta ±16 dtk di sekitar kalimat crane 2015.
- Nada napas mirip ney (sinus + vibrato + napas band-pass) di pembuka dan di setiap kartu bab.
- Perkusi: drum bingkai sangat pelan (70 BPM) hanya di hook dan payoff.
- Reverb ruang (IR noise eksponensial 2,8–3,5 dtk), fade akhir 3 dtk.

**SFX (`shared/assets/sfx/`):** `whoosh-cinematic` (0,16) sebelum tiap kartu Bab 1–7; `impact-bass-1` (0,12) pada "juta" di hook; `chime` (0,07) pada tiap angka payoff (±1.500, ±28.000, ±160.000, ±356.000, >1 juta); `riser` (0,05) sebelum penutup.

**Mix:** `vo.wav` disalin ke `public/audio/vo.wav`; bed −5 dB lalu `sidechaincompress` (threshold 0,02, ratio 4, attack 20 ms, release 450 ms) dengan suara sebagai sidechain; suara di atas (`amix normalize=0`, suara di-`apad` agar panjang = bed). Hasil `public/audio/full.wav`: −16,3 LUFS integrated, peak −4,3 dBFS, 718,39 dtk. Bed sendiri −23,2 LUFS (±12 dB di bawah suara sebelum ducking, lebih dalam saat suara aktif).

**Short:** `src/scenes/haram/shorts.py` merangkai klip hook → kalimat-kalimat yang dipakai ulang, dipotong dari `vo.wav` pada waktu kata (jeda 0,32 dtk antar-lompatan, 0,45 dtk antarbagian) → klip outro, lalu loudnorm dua-pass ke −16 LUFS → `public/audio/short01_vo.wav` (78,48 dtk) dan `short02_vo.wav` (51,37 dtk). `mix.py` membuat bed sendiri per short (identitas sama, jam sendiri) → `short01_full.wav` (82,08 dtk, −16,1 LUFS) dan `short02_full.wav` (54,97 dtk, −16,2 LUFS).

**Final (belum dijalankan):** `render:final --vo=public/audio/full.wav` (long) dan `short0N_full.wav` (short), lalu normalisasi −14 LUFS / true peak < −1 dBFS di tahap final.
