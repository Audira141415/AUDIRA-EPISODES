# Research Report — Docker Bukan Magic: Cara Kerja Container yang Sebenarnya

Diriset 2026-11-25. Rule 15: tanpa logo organisasi (Docker, Linux Foundation, OCI) dan tanpa wajah orang nyata; semua visual berupa diagram dan teks.

## Sumber utama
Dokumentasi resmi Docker (#1, #5, #7), man-pages kernel Linux (#2, #3, #4), situs Open Container Initiative (#6). Detail di `SOURCE_REGISTER.md`.

## Fakta terverifikasi
1. Container adalah proses biasa dengan tampilan sistem sendiri (proses, jaringan, filesystem); bukan mesin virtual (#1).
2. Container berbagi kernel mesin host, tidak boot OS sendiri, start ±1 detik (#1).
3. Kernel Linux punya 8 tipe namespace: Cgroup, IPC, Network, Mount, PID, Time, User, UTS (#2).
4. `docker run` membuat satu set namespace dan control group untuk container (#7).
5. Proses pertama di PID namespace baru mendapat PID 1; PID yang sama bisa ada di namespace berbeda (#4).
6. cgroups membatasi, menghitung, dan mengontrol CPU dan memori kelompok proses (#3).
7. Image berupa layer read-only (lowerdir); container menambah layer writable (upperdir); digabung OverlayFS menjadi tampilan merged (#5).
8. Menghapus container menghapus apa yang ditulisnya (#1).
9. OCI diluncurkan 22 Juni 2015; Docker menyumbangkan runC; spesifikasi: runtime, image, distribution (#6).
10. Keamanan kernel (namespace dan cgroup) termasuk empat area utama keamanan Docker (#7).

## Perselisihan / Kontroversi
- Judul/hook TOPIC.md akurat secara substansi. Hook "buta di production" bersifat opini; di naskah dilunakkan jadi "penting dipahami sebelum production".
- "Container = proses biasa" adalah penyederhanaan: di Docker Desktop (Windows/macOS) container berjalan di dalam VM Linux, jadi "berbagi kernel host" berlaku pada kernel Linux di VM itu. Tidak dinarasikan; pertimbangkan catatan visual bila diperlukan.
- "Dibohongi supaya merasa sendirian" adalah metafora, bukan istilah teknis.
- Jumlah tipe namespace bisa berubah antar versi kernel (8 per man-pages 6.19, Feb 2026).
- Docker bukan satu-satunya runtime; Docker memakai runC yang disumbangkan ke OCI.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ±1 detik | waktu start container | 1 |
| 8 | jenis namespace Linux | 2 |
| PID 1 | proses pertama di namespace | 4 |
| CPU + memori | yang dibatasi cgroup | 3 |
| OverlayFS: lowerdir/upperdir/merged | layer image vs container | 5 |
| 22 Juni 2015 | peluncuran OCI | 6 |
| runC | runtime yang disumbangkan Docker | 6 |

## Poin kunci
- Container = proses + namespace (apa yang dilihat) + cgroup (berapa jatahnya) + layer filesystem (apa isinya).
- Satu kernel dibagi semua container; itu sumber kecepatan sekaligus pertimbangan keamanan.
- Visual kuat: kaca transparan namespace, bar cgroup, tumpukan layer; mudah dibuat tanpa logo.
