# Research Report — Debugging 101: Cara Senior Developer Menemukan Bug Lebih Cepat

## Sumber utama

- Computer History Museum, "This Day in History: September 9" (#1): kisah ngengat Harvard Mark II.
- Python Software Foundation, The Python Tutorial "Errors and Exceptions" (#3): cara membaca pesan error dan traceback.
- Git project, dokumentasi `git-bisect` (#4): pencarian biner untuk menemukan commit penyebab bug.
- NIST Planning Report 02-3 (2002) (#6): skala biaya pengujian software yang kurang memadai di AS.
- Pendukung (MEDIUM): Wikipedia "Software bug" (#2), Wikipedia "Rubber duck debugging"/"The Pragmatic Programmer" (#5), Wikiquote Brian Kernighan (#7).
- Catatan: halaman Smithsonian NMAH (objek logbook) menolak akses otomatis (HTTP 403), jadi tidak dipakai. WebSearch/WebFetch error; riset via curl + Wikipedia API.

## Fakta terverifikasi

1. 9 September 1947, ngengat ditemukan terjepit di relay Harvard Mark II, ditempel di logbook dengan catatan "First actual case of bug being found" (#1).
2. Grace Hopper hadir dan mempopulerkan kisah itu lewat ceramahnya; ia bukan pencipta istilah "bug" (#1, #2).
3. Kata "bug" untuk cacat teknis sudah dipakai sejak 1870-an; Edison menulisnya dalam surat 1878 (#2).
4. Di Python, baris terakhir pesan error menunjukkan apa yang terjadi (tipe + pesan exception); traceback di atasnya menunjukkan konteks pemanggilan (#3).
5. `git bisect` memakai pencarian biner; contoh dokumentasi: 675 revisi tersisa ≈ 10 langkah (#4).
6. Rubber duck debugging = menjelaskan kode baris demi baris; nama berasal dari anekdot di The Pragmatic Programmer (Hunt & Thomas, 1999) (#5).
7. NIST 2002: biaya nasional AS akibat infrastruktur pengujian software yang kurang memadai diperkirakan US$22,2–59,5 miliar per tahun (#6).
8. Kernighan (1979): alat debugging paling efektif tetap pemikiran cermat ditambah print statement yang ditempatkan dengan bijak (#7).

## Perselisihan / Kontroversi

- **"Bug komputer pertama"**: mitos populer bahwa istilah "bug" lahir dari ngengat 1947 atau diciptakan Grace Hopper. Faktanya istilah sudah ada sejak 1870-an (Edison 1878); catatan logbook justru bercanda "kasus bug *sungguhan* pertama". Naskah menyebut Edison untuk meluruskan ini dan tidak menyebut Hopper sebagai penulis catatan (CHM: "one of the team members wrote").
- **Judul "Cara Senior Developer Menemukan Bug Lebih Cepat"**: tidak ditemukan studi terverifikasi yang mengukur senior vs junior lebih cepat sekian persen. Naskah menyajikan metode (baca error, bisect, rubber duck) tanpa klaim angka kecepatan. Judul boleh dipertahankan sebagai framing, tapi jangan tambahkan angka "X kali lebih cepat" di VO/caption.
- **Hook "Error message bukan musuh — itu petunjuk yang kamu abaikan"**: akurat sebagai pesan edukasi, didukung #3. Di VO dibuat lisan: "Tulisan merah di layar itu bukan musuh."
- **Angka NIST**: rentang US$22,2–59,5 miliar adalah estimasi biaya *infrastruktur pengujian yang kurang memadai* (2002), bukan biaya semua bug. VO memakai angka atas US$59,5 miliar dengan framing itu. Data berumur 24 tahun; tahun wajib tampil di HUD.
- Klaim populer "developer menghabiskan 50% waktu untuk debugging" (studi Cambridge 2013) tidak terverifikasi ke sumber primer dalam riset ini, jadi tidak dipakai.
- "Sepuluh langkah" di VO mengikuti contoh dokumentasi git (675 revisi ≈ 10 langkah), bukan klaim umum.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 9 SEP 1947 | Ngengat ditemukan di relay | #1 |
| HARVARD MARK II | Komputer tempat ngengat ditemukan | #1 |
| EDISON · 1878 | Kata "bug" sudah dipakai | #2 |
| BARIS TERAKHIR | Bagian error yang menunjukkan apa yang terjadi | #3 |
| 675 REVISI ≈ 10 LANGKAH | Contoh git bisect (pencarian biner) | #4 |
| THE PRAGMATIC PROGRAMMER · 1999 | Asal nama rubber duck debugging | #5 |
| US$59,5 MILIAR / TAHUN · NIST 2002 | Estimasi biaya pengujian software kurang memadai di AS | #6 |
| BRIAN KERNIGHAN · 1979 | Kutipan careful thought + print | #7 |

## Poin kunci

- Struktur tiga langkah mudah diingat: baca error, persempit lokasi (bisect), jelaskan kode (rubber duck).
- Hook: layar merah = petunjuk. Payoff: layar berubah hijau + checklist tiga langkah.
- Pembuka sejarah (ngengat 1947 + Edison 1878) memberi fakta jarang diketahui yang cocok dengan seri cara kerja.
- Rule 15: tanpa wajah Grace Hopper/Kernighan, tanpa logo Python/Git/NIST/penerbit; pakai name plate teks dan ilustrasi generik.
- Topik awet (metode tidak basi); angka NIST wajib diberi tahun.
