# STYLE_DECISION — Kenapa Jari Keriput Saat Lama di Air (EP02)

Style: NANOFORGE
engine: remotion (Remotion + React Three Fiber, 3D)

- **Tanggal:** 2026-11-24 (G21: ganti style, menggantikan keputusan ANATOMIX 2026-11-23)
- **Engine:** Remotion + R3F (3D)
- **Style terpilih:** `NANOFORGE`
- **Alasan (awam, terkait topik):** Ceritanya adalah perjalanan ke dalam ujung jari: saraf yang menyala, pembuluh darah yang menyempit, dan lapisan kulit yang melipat. NANOFORGE menampilkan dunia mikro yang basah dan bercahaya (membran transparan, rim cyan/ruby/emas, partikel melayang), jadi penonton seperti "masuk" ke dalam jari. Tangan utuh hanya muncul sebagai siluet kaca di awal dan akhir.
- **Kenapa ANATOMIX diganti:** dua putaran juri buta gagal (r1 3,00; r2 3,17: material 2). Tangan, ban, dan mikroskop GLB terbaca sebagai plastik matte di lab teal yang datar.
- **Alternatif ditolak:**
  - `TERRARIUM` (juri 3,93, gold sains-anak-EP04): bahasa visual ekosistem dalam kaca; cerita saraf dan pembuluh tidak punya tempat di sana. Cadangan pertama bila NANOFORGE gagal.
  - `CLAYWORLD` (juri final 3,17): skor lebih rendah; plastisin justru memperkuat kesan "plastik" yang membuat ANATOMIX gagal. Cadangan kedua.
- **Cover referensi:** `cover-reference.png` (F:/AUDIRA-ALL-SKILL/assets/style-covers/nanoforge.png)
- **Cover topik:** `cover-topic.png` (frame hook film, 1080×1920)
- **Hero:** ujung jari prosedural bermembran transparan dengan saraf emas + pembuluh ruby di dalamnya. GLB nyata tetap dipakai sebagai pendukung: tangan `base-hand-e3398a` (siluet kaca, hook & outro), ban `tire-ccf0eb`, kelereng `glass-marble-4772bb`, mikroskop `research-microscope-77ce04` (chrome).
- **approved:** `no` (gerbang style dihapus 2026-11-23; acc pengguna hanya di render final)

## Parameter dari motion memory (`audira_style_memory get NANOFORGE`)
- Finish `CINEMA_TEAL_ORANGE`, exposure 1, envIntensity 0.55, ao=true, background `#02050f`, HDRI studio (benda chrome/kaca).
- Rim cyan / magenta / emas yang mengikuti kamera; bola-tongkat glossy (O merah, H putih) untuk molekul air.
- Hindari: ruang kosong (isi frame dengan sel, molekul, partikel), label HUD tertutup objek 3D, panel + label 3D di objek yang sama, count-up yang belum selesai saat VO menyebut angka.
