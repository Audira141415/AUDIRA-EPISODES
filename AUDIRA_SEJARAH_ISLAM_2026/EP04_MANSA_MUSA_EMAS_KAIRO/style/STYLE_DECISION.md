# Style Decision — EP04 Mansa Musa: Emas di Kairo

- **Episode:** sejarah-islam-EP04 (`EP04_MANSA_MUSA_EMAS_KAIRO`)
- **Style terpilih:** HD2D (sprite pixel 2D di dalam diorama 3D tilt-shift, lentera 2400K)
- **Engine:** Remotion + React Three Fiber (starter AUDIRA-SKILL-MOTION, kit `src/kits/hd2d`)
- **Tanggal:** 2026-11-11
- **approved:** yes (style, dipilih pengguna 2026-11-11, opsi utama)
- **cover approved:** yes (cover approved by user 2026-11-11, "Ya, buat suara")

## Alasan

Kisah Mansa Musa terasa seperti petualangan RPG: kafilah raja menyeberangi Sahara, singgah di kota besar, membagikan emas, lalu pulang kehabisan bekal. HD-2D membuat dunia itu terasa seperti diorama miniatur yang hangat, sementara semua tokoh tampil sebagai sprite pixel kecil tanpa wajah (dari belakang atau berbalut sorban). Cocok dengan aturan seri: tidak ada potret autentik Mansa Musa, jadi tidak boleh mengarang wajah.

## Alternatif yang ditampilkan (`_review/STYLE_OPTIONS.jpg`)

| Opsi | Style | Status | Alasan tidak dipilih |
|---|---|---|---|
| 1 | **HD2D** (utama) | Dipilih | — |
| 2 | TRADINGTERMINAL | Ditolak | Kuat untuk grafik harga emas, tapi terlalu modern dan dingin untuk kisah 1324; kafilah, Kairo, dan haji sulit tampil. |
| 3 | WATERCOLOR | Ditolak | Lembut dan bercerita, tapi kurang daya kejut untuk hook "harga emas jatuh" dan kurang kedalaman 3D. |

## Cover

- `cover-reference.png`: quality bar kit HD2D (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\hd2d.png`).
- `cover-topic.png`: frame 0,3 dtk dari komposisi `MansaMusaCover` (= frame pembuka film), framing di `cover.json`.
  Isi: pasar malam Kairo 1324 dalam diorama HD-2D. Timbangan kuningan di tengah jalan; koin emas berjatuhan ke piring emas yang justru terangkat, piring dirham perak di bawah. Di belakang, gerbang kota bergaya ablaq Mamluk yang menyala, kafilah unta pixel bermuatan emas dan jamaah dari belakang (tanpa wajah), untaian lentera, kubah dan menara di langit senja. Judul: "HARGA EMAS KAIRO JATUH", label "SEJARAH ISLAM · EP04", chip "KAIRO · 1324".
- Skor cover (self): 4,2 LOLOS (lighting 4, material 4, depth 4, composition 4, readability 5), ceiling audit semua 5.
