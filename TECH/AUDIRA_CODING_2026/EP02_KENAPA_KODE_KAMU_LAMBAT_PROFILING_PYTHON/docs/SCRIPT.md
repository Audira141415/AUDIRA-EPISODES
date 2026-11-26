# Naskah — Kenapa Kode Kamu Lambat: Profiling Python dari Nol

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **16** · estimasi **7 dtk**
- Visual: Layar terbelah: potongan kode Python di kiri, jam pasir berputar di kanan; callout HUD "97%" muncul saat VO menyebut angka.

> Kode kamu lambat, dan tebakanmu soal penyebabnya kemungkinan besar salah. Di AUDIRA, kita buktikan pakai profiling.

## c01_intro — Intro

- Kata: **28** · estimasi **12 dtk**
- Visual: Kursor menyorot satu baris kode yang tampak lambat, lalu kamera mundur: bagian itu cuma noktah kecil di peta fungsi. HUD: "1974" dan "97%/3%".

> Banyak programmer langsung mengoptimasi bagian yang terasa lambat. Padahal Donald Knuth menulis tahun 1974: lupakan efisiensi kecil sekitar 97 persen waktu, tapi jangan lewatkan 3 persen yang kritis.

## c02 — Bab 1 - Ukur dulu dengan timeit

- Kata: **24** · estimasi **10 dtk**
- Visual: Stopwatch digital menjalankan satu potongan kode lima kali berturut-turut; lima batang hasil, satu disorot sebagai yang terbaik. HUD: "5x".

> Langkah pertama, ukur dulu. Modul timeit menjalankan kodenya berulang kali, secara bawaan lima kali, dan melaporkan yang terbaik. Timeit juga mematikan garbage collector sementara.

## c03 — Bab 2 - Profiler deterministik

- Kata: **29** · estimasi **12 dtk**
- Visual: Pohon pemanggilan fungsi; setiap panah panggil dan kembali berkedip satu per satu seperti sensor di setiap simpul. HUD: "profiling.tracing".

> Lalu cari penyebabnya. Profiler deterministik mencatat setiap pemanggilan dan pengembalian fungsi, jadi cakupannya lengkap. Konsekuensinya, overhead-nya lebih tinggi. Di Python 3.15, bentuk modernnya bernama profiling.tracing, dan cProfile menjadi alias.

## c04 — Bab 3 - Sampling Tachyon

- Kata: **31** · estimasi **13 dtk**
- Visual: Kamera pengintai di luar kotak program memotret tumpukan panggilan tiap interval; foto-foto menumpuk menjadi flame graph. HUD: "Python 3.15".

> Alternatifnya sampling. Python 3.15 punya Tachyon, profiler statistik yang mengintip tumpukan panggilan secara berkala dari luar proses. Overhead-nya hampir nol, dan ia bisa menempel ke program yang sedang jalan tanpa restart.

## c05 — Bab 4 - Seberapa akurat

- Kata: **22** · estimasi **9 dtk**
- Visual: Grafik batang fungsi dengan garis galat kecil di ujung batang; satu batang 5 persen dengan rentang kecil. HUD: "10 kHz", "10 detik", "5% ± 0,5%".

> Seberapa akurat? Dengan sampling 10 kilohertz selama 10 detik, fungsi yang muncul 5 persen punya margin kesalahan sekitar plus minus 0,5 persen.

## c06 — Penjelasan - Alat lain

- Kata: **31** · estimasi **13 dtk**
- Visual: Dua panel alat: py-spy menempel ke proses yang jalan dan menghasilkan flame graph; Scalene menandai baris kode dan balok memori. HUD: "Rust", "per baris".

> Belum pakai 3.15? Ada py-spy, ditulis dengan Rust, yang bisa menempel ke proses yang sedang jalan dan menghasilkan flame graph. Ada juga Scalene, yang menunjuk sampai baris kode, termasuk pemakaian memori.

## c07_payoff — Payoff + outro

- Kata: **19** · estimasi **8 dtk**
- Visual: Flame graph, satu balok melebar disorot, lalu mengecil setelah diperbaiki; kartu outro AUDIRA.

> Jadi urutannya: ukur dengan timeit, temukan biang lambat dengan profiler, baru perbaiki. Berhenti menebak. Ikuti AUDIRA untuk seri berikutnya.

## Opsi hook lain

1. Kamu sudah habis berjam-jam mengoptimasi, tapi bagian yang kamu ubah ternyata bukan masalahnya.
2. Nebak bagian mana yang lambat itu mahal. Ada cara yang gratis.

## Total

- **200 kata** ≈ **83 dtk**
