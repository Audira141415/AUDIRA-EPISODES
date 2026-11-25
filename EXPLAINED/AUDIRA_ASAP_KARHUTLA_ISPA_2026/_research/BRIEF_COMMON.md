# Brief riset bersama — AUDIRA_ASAP_KARHUTLA_ISPA_2026

Tugas: riset berita viral karhutla + ISPA (Okt–Nov 2026) untuk satu episode video vertikal 90 detik. Hari ini 2026-11-10. Hanya riset; jangan buat naskah final, VO, atau render.

## Alat (sudah diuji)
- Headline + URL asli: `python F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_ASAP_KARHUTLA_ISPA_2026/_research/gn.py "<query>" [n] [regex]` (Google News RSS bahasa Indonesia, URL sudah di-decode). Tambah `when:30d` di query untuk berita baru.
- Isi artikel: Python urllib (`python -I -c ...`) lalu ambil teks paragraf, atau agen/WebFetch bila tersedia. WebSearch sering rusak; jangan bergantung padanya.
- Jangan menonaktifkan verifikasi TLS (diblokir). Situs yang gagal (ANTARA, Reuters, dll.) dicatat sebagai "tidak terbaca" di SOURCE_REGISTER.
- Simpan file sementara di `_research/` episode-mu sendiri, bukan di root.

## Aturan fakta
- Baca BADAN artikel, bukan cuma judul: judul berita bencana sering melebih-lebihkan.
- Angka dari sumber/periode berbeda (Kemenkes vs Dinkes, luas terbakar SiPongi vs satelit) jangan dibandingkan langsung; selalu tulis periode dan lembaga.
- Tiap klaim beri tingkat keyakinan: HIGH (≥2 sumber independen atau sumber resmi), MED (1 sumber kredibel), LOW (belum terverifikasi; jangan dipakai di naskah).
- Bila sumber mengatakan ISPA "bukan hanya karena asap", tulis itu. Jangan menyiratkan sebab-akibat yang tidak dikatakan sumber.
- Topik politis (PSN, korporasi, tuntutan aktivis): tulis siapa mengatakan apa, seimbangkan dengan tanggapan pemerintah/pihak tertuduh bila ada.
- Cari tokoh bernama yang bisa tampil di video (pejabat, dokter, warga) beserta kutipan pendek dan jabatan, karena video berita orang wajib menunjukkan siapa berkata apa.

## Output (tulis di folder episode, bahasa Indonesia)
1. `research/SOURCE_REGISTER.md`: tabel `# | Sumber | Judul | Tanggal | URL | Status (dibaca/tidak terbaca) | Dipakai untuk`.
2. `research/RESEARCH_REPORT.md`:
   - Ringkasan 3 kalimat + kenapa viral.
   - Fakta kunci (angka + periode + lembaga + keyakinan + nomor sumber).
   - Kronologi singkat.
   - Tokoh & kutipan (nama, jabatan, kutipan ≤15 kata, sumber).
   - Penjelasan sains/kesehatan yang relevan (misal PM2.5, kenapa balita rentan, gambut) bila sumber mendukung.
   - 3 kandidat hook 0–3 detik (berbasis fakta HIGH).
   - Kerangka 6 tahap (Hook, Context, Development, Explanation, Payoff, Outro) berupa poin, bukan naskah final.
   - Ide visual (peta, data, tokoh) dan saran 2 style AUDIRA yang cocok.
   - Celah/risiko: klaim yang belum terverifikasi, angka yang bertentangan.
3. Balas ke saya: 5–8 baris ringkasan (angka utama, jumlah sumber dibaca, risiko).
