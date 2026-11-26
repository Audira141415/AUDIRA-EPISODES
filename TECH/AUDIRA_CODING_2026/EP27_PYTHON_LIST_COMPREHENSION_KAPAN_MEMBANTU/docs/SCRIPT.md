# Naskah — Python List Comprehension: Kapan Membantu dan Kapan Menyiksa

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **17** · estimasi **7 dtk**
- Visual: Layar IDE gelap. Empat baris for loop Python muncul satu per satu, lalu menyusut menjadi satu baris panjang. Baris itu berkedip merah — rekan kerja muncul dengan ekspresi bingung (siluet, tanpa wajah).

> {4|Empat} baris kode Python jadi satu baris. Tapi kalau salah pakai, satu baris itu bikin semua orang bingung.

## c01_intro — Intro

- Kata: **26** · estimasi **11 dtk** · mulai ±0:07
- Visual: Logo Python berputar, timeline 2000–2026 muncul. Teks "List Comprehension" muncul besar. Transisi ke split screen: kode elegan vs kode berantakan.

> Namanya list comprehension. Lahir di Python {2.0|dua titik nol}, tahun {2000|dua ribu}. Jadi senjata favorit programmer. Di {AUDIRA|Audira}, kita bedah kapan dia berguna dan kapan menyiksa.

## c02 — Cara Kerja Dasar

- Kata: **26** · estimasi **11 dtk** · mulai ±0:18
- Visual: Animasi diagram: list masukan `[1, 2, 3, ...]` mengalir lewat "mesin" comprehension, keluar sebagai list baru. Split panel: 4 baris for loop di kiri menyusut jadi 1 baris di kanan. HUD callout: **4 baris → 1 baris**.

> Prinsipnya sederhana. Ambil list, proses tiap elemen, hasilkan list baru. Satu baris. For loop biasa butuh {4|empat} baris untuk hal yang sama. List comprehension? Cukup satu.

## c03 — Kenapa Lebih Cepat

- Kata: **42** · estimasi **18 dtk** · mulai ±0:29
- Visual: Diagram dua jalur: jalur kiri "FOR LOOP" melewati kotak "cari .append() di dictionary" tiap iterasi (lambat, merah). Jalur kanan "LIST COMP" langsung ke kotak "LIST_APPEND bytecode" (cepat, hijau). HUD callout: **3,47 dtk vs 0,54 dtk** dan **6x lebih cepat**. Speedometer animasi.

> Kenapa lebih cepat? List comprehension pakai bytecode khusus: {LIST_APPEND|LIST APPEND}. For loop harus cari method append lewat dictionary tiap putaran. Benchmark Python Wiki: for loop biasa butuh {3,47|tiga koma empat tujuh} detik, comprehension mendekati {0,54|nol koma lima empat}. Hampir {6x|enam kali} lipat.

## c04 — Kapan Jadi Masalah

- Kata: **29** · estimasi **12 dtk** · mulai ±0:47
- Visual: Baris kode list comprehension mulai pendek, lalu bertambah panjang melewati garis batas 79 karakter (garis merah vertikal). Nested 3 tingkat muncul — baris meledak ke kanan, layar harus scroll. HUD callout: **79 karakter** (batas PEP 8). Ikon peringatan berkedip.

> Tapi ada jebakan. {PEP 8|PEP delapan}, panduan gaya resmi Python, batasi baris maksimal {79|tujuh puluh sembilan} karakter. List comprehension bersarang {3|tiga} tingkat bisa meledak sampai {200|dua ratus} karakter. Mustahil dibaca.

## c05 — Aturan Emas

- Kata: **25** · estimasi **11 dtk** · mulai ±0:59
- Visual: Flowchart keputusan animasi: "Berapa for?" → "1 for + 1 if" → centang hijau "Pakai comprehension". "2+ for / efek samping" → silang merah "Pakai for loop". Di bawah: penggaris horizontal dengan batas "bisa dibaca tanpa scroll". Checklist muncul satu per satu.

> Aturan emasnya: satu for, satu if — pakai comprehension. {2|Dua} for bersarang atau efek samping? Pakai for loop biasa. Kalau harus scroll ke kanan, sudah kebanyakan.

## c06 — Jebakan Nested

- Kata: **17** · estimasi **7 dtk** · mulai ±1:10
- Visual: Panel kode nested comprehension untuk transpose matriks — kelihatan ringkas. Time-lapse 3 bulan: kalender berputar. Programmer sama kembali, menatap kode dengan bingung (siluet). Teks overlay: "3 bulan kemudian..."

> Kesalahan umum: nested comprehension untuk matriks. Kelihatan pintar, tapi {3|tiga} bulan kemudian kamu sendiri bingung kode buatanmu.

## c07_payoff — Payoff dan Penutup

- Kata: **21** · estimasi **9 dtk** · mulai ±1:17
- Visual: Split screen akhir: kiri = for loop rapi dan terbaca, kanan = list comprehension ringkas dan terbaca. Keduanya bersinar hijau. Zoom out ke layar laptop, lalu transisi ke outro card AUDIRA (`audira-outro-card.svg`).

> List comprehension itu alat, bukan gaya hidup. Pakai di tempat yang tepat, kode jadi pendek, cepat, dan tetap bisa dibaca. {AUDIRA|Audira}.

## Opsi hook lain

1. "Python punya fitur yang bikin kode enam kali lebih cepat. Tapi juga enam kali lebih susah dibaca."
2. "Semua programmer Python pakai list comprehension. Tapi separuhnya pakai di tempat yang salah."

## Total

- **203 kata** ≈ **81–90 dtk** @135–150 WPM.
