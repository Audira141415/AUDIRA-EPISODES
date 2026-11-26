# Naskah — React useEffect: Panduan untuk Berhenti Bikin Memory Leak

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **11** · estimasi **5 dtk**
- Visual: jendela browser bergaya generik, komponen kartu menghilang dari layar, tapi ikon jam di belakangnya tetap berdetak dan angka penghitung terus naik. HUD: "unmount ✓ · timer: masih jalan".

> Komponenmu sudah hilang dari layar, tapi timer-nya masih berdetak di belakang.

## c01_intro — Intro

- Kata: **20** · estimasi **8 dtk**
- Visual: garis waktu 2019, chip HUD "React 16.8 · 2019", lalu empat ikon keluar dari kotak komponen: jam (timer), antena (langganan data), telinga (event listener), panah jaringan (fetch).

> Sejak React 16.8 tahun 2019, kita pakai useEffect untuk urusan di luar React: timer, langganan data, event listener, dan fetch.

## c02 — Efek tidak berhenti sendiri

- Kata: **25** · estimasi **10 dtk**
- Visual: kode setInterval menyala; komponen dicopot dari pohon komponen, jam tetap berdetak. Tiap kali halaman dibuka lagi, satu jam baru menumpuk (counter HUD 1 → 2 → 3 → 4), memori naik di grafik kecil.

> Masalahnya, efek itu tidak berhenti sendiri. Kalau kamu pasang setInterval lalu komponennya unmount, intervalnya tetap berdetak. Tiap halaman dibuka lagi, muncul satu timer baru. Menumpuk.

## c03 — Cleanup di return

- Kata: **26** · estimasi **11 dtk**
- Visual: blok kode useEffect dibelah, baris `return () => {...}` disorot. Diagram siklus: setup → dependency berubah → cleanup → setup lagi → unmount → cleanup terakhir. HUD "cleanup = fungsi di return".

> Obatnya ada di return. Fungsi yang kamu kembalikan dari useEffect disebut cleanup. React menjalankannya sebelum efek diulang karena dependency berubah, dan sekali lagi saat komponen dicopot.

## c04 — Pasangan setup dan pembersih

- Kata: **25** · estimasi **10 dtk**
- Visual: papan pasangan seperti colokan dan stopkontak: setInterval ↔ clearInterval, addEventListener ↔ removeEventListener, subscribe ↔ unsubscribe, fetch ↔ abort(). Tiap pasangan mengunci dengan bunyi klik.

> Isinya pasangan dari setup. Pasang setInterval, cleanup memanggil clearInterval. Pasang addEventListener, cleanup memanggil removeEventListener. Buka langganan, cleanup menutupnya. Untuk fetch, pakai AbortController lalu panggil abort.

## c05 — Warning yang dihapus

- Kata: **31** · estimasi **13 dtk**
- Visual: konsol merah berisi warning setState pada komponen unmount, lalu dicoret dan memudar. Chip HUD "React 18 · Maret 2022 · warning dihapus". Ikon alarm palsu (false positive).

> Lalu bagaimana dengan peringatan setState pada komponen yang sudah unmount? React 18, rilis Maret 2022, menghapusnya. Alasannya, peringatan itu lebih sering salah alarm. Set state setelah unmount sebenarnya tidak berbuat apa-apa.

## c06 — Strict Mode sebagai detektor

- Kata: **34** · estimasi **14 dtk**
- Visual: panel konsol development: komponen di-mount, dicopot, di-mount ulang; log "Connecting…" muncul 2× tanpa "Disconnected". HUD "Strict Mode · dev only · mount → unmount → mount". Lalu versi dengan cleanup: log berpasangan rapi.

> Kebocoran yang asli datang dari langganan yang lupa ditutup. Karena itu, Strict Mode di development sengaja memasang, mencopot, lalu memasang ulang komponen sekali. Kalau log koneksimu muncul dua kali tanpa pemutusan, cleanup-mu belum ada.

## c07_payoff — Payoff + outro

- Kata: **24** · estimasi **10 dtk**
- Visual: semua jam yang menumpuk berhenti satu per satu, grafik memori turun rata. Kartu aturan besar "Setiap setup → satu pembersih". Outro card AUDIRA.

> Aturannya cuma satu: setiap setup butuh pasangan pembersihnya. Tulis return-nya dulu, baru efeknya. Simpan video ini, dan ikuti AUDIRA untuk cara kerja kode berikutnya.

## Opsi hook lain

1. Pindah halaman sepuluh kali, dan sekarang ada sepuluh timer yang jalan bareng.
2. Warning yang kamu takutkan itu sudah dihapus sejak React 18. Masalahnya ada di tempat lain.

## Total

- **196 kata** ≈ **78–87 dtk** @135–150 WPM
