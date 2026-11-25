# Research Report — Cara Kerja DNS: Dari Domain ke IP dalam 60 Detik

## Sumber utama

- Spesifikasi IETF: RFC 882 (1983), RFC 1034 dan RFC 1035 (1987) — #1, #2, #3.
- Data resmi IANA: daftar root server dan daftar TLD — #4, #5.
- Peta instance root-servers.org (RSSAC/operator root) — #6.
- Pendukung: Wikipedia (Root name server, Paul Mockapetris) dan blog Cloudflare — #7, #8, #9.

## Fakta terverifikasi

1. Komputer menghubungi server lewat alamat IP; DNS menerjemahkan nama domain ke alamat itu, dengan resolver yang bertanya ke name server (#1).
2. Resolver menyimpan jawaban di cache selama TTL; TTL adalah bilangan 32-bit dalam detik (#1, #2).
3. Kueri DNS memakai port 53, umumnya lewat UDP (#2).
4. Urutan resolusi iteratif: root → server TLD → server otoritatif domain (#1).
5. Ada 13 nama root server, a sampai m, dioperasikan 12 organisasi (#4).
6. Lewat anycast, 13 alamat root itu dilayani sekitar dua ribu instance: 2.029 situs operational per 2026-11-25 (#6), 1.954 per Des 2025 (#7).
7. Ada 1.435 TLD di daftar IANA per 24 Nov 2026 (#5).
8. DNS diusulkan Paul Mockapetris tahun 1983 (RFC 882/883) untuk menggantikan file HOSTS.TXT tunggal yang diambil dari SRI-NIC (#3, #8).
9. Resolver publik cepat rata-rata sekitar 14 ms (klaim Cloudflare 2018, #9).

## Perselisihan / Kontroversi

- **Judul tidak akurat:** "dalam 60 Detik" bisa dibaca sebagai lama proses DNS. Faktanya resolusi DNS berlangsung dalam hitungan milidetik (#9); 60 detik hanya durasi penjelasan. Naskah tidak menyebut angka 60 detik sebagai durasi lookup. Judul tidak diubah di backlog.
- **Hook tidak terverifikasi:** "hampir semua dev nggak paham" tidak punya data survei. Tidak dipakai di VO; hook diganti ke pengalaman pengguna mengetik alamat.
- "Setiap request butuh DNS" tidak mutlak: request ke alamat IP langsung atau jawaban yang sudah di-cache tidak memicu kueri baru (#1).
- Jumlah instance root berubah terus (1.954 Des 2025 vs 2.029 Nov 2026). VO memakai "sekitar dua ribu".
- Angka 14 ms adalah klaim vendor, bukan pengukuran independen. VO menyebut "rata-rata sekitar empat belas milidetik" untuk resolver publik cepat, tanpa nama merek (rule 15: tanpa logo).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 13 | nama root server a–m | #4 |
| 12 | organisasi operator root | #4 |
| ±2.000 | instance root via anycast (2.029 per 2026-11-25) | #6, #7 |
| 1.435 | jumlah TLD di daftar IANA | #5 |
| TTL | masa simpan jawaban di cache | #1, #2 |
| ±14 ms | rata-rata jawaban resolver publik cepat (klaim vendor) | #9 |
| 1983 | DNS diusulkan (RFC 882) | #3, #8 |
| Paul Mockapetris | perancang DNS (name plate, tanpa wajah) | #3, #8 |
| HOSTS.TXT | daftar nama tunggal sebelum DNS | #3 |
| Port 53 | port DNS (opsional di HUD) | #2 |

## Poin kunci

- Ceritakan perjalanan satu kueri sebagai estafet: cache lokal → resolver → root → TLD → otoritatif → IP kembali.
- Root tidak tahu jawaban akhir, hanya menunjuk ke level berikutnya; ini inti "terdistribusi".
- Cache + TTL menjelaskan kenapa lookup kedua jauh lebih cepat.
- Payoff sejarah: dari satu file HOSTS.TXT ke sistem global yang masih jalan 40+ tahun.
- Rule 15: Mockapetris hanya name plate teks; tidak ada logo ISP, Cloudflare, IANA, atau registrar.
