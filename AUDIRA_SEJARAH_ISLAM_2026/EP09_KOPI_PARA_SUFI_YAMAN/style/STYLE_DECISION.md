# Style Decision — EP09 Kopi Para Sufi Yaman

- **Episode:** sejarah-islam-EP09 (`EP09_KOPI_PARA_SUFI_YAMAN`), channel AUDIRA QISSAH
- **Style terpilih:** FOODFORGE (iklan makanan makro: meja walnut gelap, uap backlit, biji jatuh slow motion, kilau clearcoat)
- **Engine:** Remotion + React Three Fiber (starter AUDIRA-SKILL-MOTION, kit `src/kits/foodforge`, scene `src/scenes/qahwa`)
- **Tanggal:** 2026-11-11 (style dipilih), cover dibuat 2026-11-12
- **approved:** yes (style, dipilih pengguna 2026-11-11, opsi utama)
- **cover approved:** yes (cover approved by user 2026-11-12, "Ya, buat suara"; naskah juga disetujui)

## Alasan

Kisah ini tentang satu minuman: secangkir kopi yang "diadili" di Makkah tahun 1511. FOODFORGE membuat cangkir kopi itu jadi tokoh utama yang menggugah: uap panas, biji sangrai berjatuhan pelan, kilau kopi hitam. Semua tokoh sejarah (para sufi, mufti Aden, Khair Beg, sultan) cukup hadir lewat benda: bejana tanah liat merah, mangkuk kecil, tasbih, lampu minyak, dekret bersegel. Cocok dengan aturan seri: tanpa wajah, tanpa penggambaran Nabi atau malaikat.

## Alternatif yang ditampilkan (`_review/STYLE_OPTIONS_B2.jpg`)

| Opsi | Style | Status | Alasan tidak dipilih |
|---|---|---|---|
| 1 | **FOODFORGE** (utama) | Dipilih | — |
| 2 | TERRARIUM | Ditolak | Kuat untuk tanaman kopi yang tumbuh (bibit Jawa 1696/1699), tapi kisah intinya minuman dan sidangnya, bukan tanamannya; cangkir, uap, dan dekret sulit jadi tokoh utama di dalam toples kaca. |

## Cover

- `cover-reference.png`: quality bar kit FOODFORGE (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\foodforge.png`).
- `cover-topic.png`: frame 0,3 dtk dari komposisi `QahwaCover` (= frame pembuka film), framing di `cover.json` (`src/scenes/qahwa/framing.ts` `COVER`).
  Isi: finjan tanah liat berglasir krem berbintik besi berisi kopi hitam di atas nampan kuningan, uap backlit naik; tujuh biji kopi sangrai (dengan alur tengah) melayang slow motion di atasnya. Midground: bejana tanah liat merah besar (kiri), lampu minyak kuningan menyala (kanan), gulungan dekret bersegel lilin merah dengan goresan kaligrafi abstrak (bukan teks asli). Foreground: buah kopi merah dan biji sangrai. Judul "KOPI PERNAH DIADILI", label "SEJARAH ISLAM · EP09", chip "Makkah · 1511".
- Skor cover (self): 4,2 LOLOS (lighting 4, material 4, depth 4, composition 4, readability 5); ceiling audit lighting/material/depth/composition semua 5.
