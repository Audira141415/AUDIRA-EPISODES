# Brief riset batch 2 (EP06-10) — Sejarah Sepak Bola

Kamu peneliti fakta untuk video short 90 detik (bahasa Indonesia) seri "Sejarah Sepak Bola", channel AUDIRA Sport Facts. Hari ini 2026-11-12.

## Cara riset
- Tool WebSearch rusak. Pakai Bash + curl ke Wikipedia. API `api.php` sering kena rate limit; pakai wikitext mentah:
  `curl -s "https://en.wikipedia.org/w/index.php?title=<Judul>&action=raw" -A "research-bot/1.0" -o <scratch>/x.txt`
  (juga `id.wikipedia.org`). Cari judul: `https://en.wikipedia.org/w/api.php?action=opensearch&search=<kata>`.
- Baca dengan `python -X utf8` (Windows cp1252 crash tanpa -X utf8). File sementara di scratch/folder research episode, bukan root workspace; hapus setelah selesai.
- Silang-cek angka penting di ≥2 halaman/sumber (EN + ID, halaman pertandingan + halaman turnamen/pemain, rujukan primer yang dikutip Wikipedia bila bisa di-fetch). Tandai HIGH (≥2 sumber cocok) / MED (1 sumber). Jangan mengarang angka atau kutipan. Kutipan langsung hanya bila sumbernya jelas.
- Batch 1 sudah memakai fakta berikut sebagai poin utama; jangan jadikan angle utama lagi (boleh disebut sebagai jembatan): daftar 8 juara dunia, trofi Jules Rimet dicuri 1966/1983 + anjing Pickles, 5 bintang Brasil, Maracanazo & 1–7 hanya sekilas di EP02 (EP08/EP10 sekarang wajib lebih dalam: kronologi pertandingan, tokoh, dampak).

## Keluaran (bahasa Indonesia)
1. `<EP>/research/SOURCE_REGISTER.md` — tabel: fakta | angka | URL | tanggal akses | keyakinan.
2. `<EP>/research/RESEARCH_REPORT.md` — ringkasan inti, kronologi/tabel data, 5–8 kandidat hook (0–3 dtk), 3 angle cerita, daftar "JANGAN diklaim", ide visual singkat (objek 3D yang bisa jadi pusat adegan).
3. Laporan balik ringkas (maks 12 baris): 3 hook terbaik, fakta kunci HIGH, fakta MED yang perlu dicek manual.
