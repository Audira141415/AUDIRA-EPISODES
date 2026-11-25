# Brief riset Batch 6 AUDIRA EXPLAINED

Tujuan: fakta terverifikasi untuk satu video explainer 60 detik (~140 kata VO, Bahasa Indonesia, audiens umum Indonesia).

Tulis di folder episode-mu:
- `research/SOURCE_REGISTER.md`: tabel `# | Klaim | Sumber (judul, penerbit, URL) | Tanggal akses | Tingkat (HIGH = ≥2 sumber tepercaya / MED = 1 sumber tepercaya / LOW) | Catatan`.
- `research/RESEARCH_REPORT.md`: ringkasan mekanisme inti berurutan (5–8 langkah), 3–5 fakta paling menarik yang aman dipakai di naskah, daftar "JANGAN DIKLAIM" (mitos, klaim absolut, angka yang tidak bisa diverifikasi), dan saran visual akurat (komponen apa yang benar-benar ada, bentuknya, warnanya) supaya animasi 3D tidak menggambarkan hal yang salah secara teknis.

Aturan:
- Utamakan sumber resmi: operator/lembaga (MRT Jakarta, Korlantas/Polri, BIG, BMKG, PAM Jaya/PDAM, Kemenhub), jurnal/universitas, produsen, standar. Media berita besar boleh sebagai pendukung. Wikipedia boleh untuk konteks, bukan satu-satunya sumber angka.
- Minimal 2 sumber untuk setiap klaim mekanisme utama. Klaim satu sumber tandai MED.
- Jangan mengarang angka, kutipan, nama, atau tanggal. Kalau tidak ketemu, tulis "tidak terverifikasi".
- Cek tanggal: data lama tandai tahunnya.
- Jalur riset yang terbukti jalan di mesin ini: WebFetch; Google News RSS via curl (`https://news.google.com/rss/search?q=...&hl=id&gl=ID&ceid=ID:id`); Wikipedia EN/ID; Python urllib untuk detik/CNN/BBC. WebSearch sering error; kalau error pindah jalur, jangan berhenti. Jangan bypass TLS.
- Jangan menulis naskah. Jangan sentuh folder episode lain.
- Selesai: laporkan singkat (≤10 baris) fakta inti + klaim yang gagal diverifikasi.
- Sumber Indonesia relevan bila ada (Kemenhub, AirNav Indonesia, Kementerian PU/PUPR, KLHK, BNPB/BPBD, SNI, PAL Jaya, Dinas Damkar), selain standar internasional (ICAO, FAA, NFPA, ISO, produsen).
- WebFetch dan WebSearch mungkin tidak tersedia; pakai curl ke Google News RSS, DuckDuckGo HTML (`https://html.duckduckgo.com/html/?q=...`), Wikipedia API, dan pdftotext untuk PDF.
