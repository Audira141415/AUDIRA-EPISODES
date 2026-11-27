# Research Report — Cara Kerja Survei Opini: Membaca Margin of Error

> Riset backlog 2026-11-27. Fokus: cara MEMBACA angka survei. Rumus dasar margin of error dan cara kerja hitung cepat dibahas di topik saudara T066; di sini rumus hanya dipakai untuk hitungan sendiri berlabel.

## Sumber utama

- Pew Research Center, "5 key things to know about the margin of error in election polls" (Andrew Mercer, 2016): definisi, margin per pilihan vs margin selisih, subkelompok, design effect, galat non-sampling (#1–#4).
- AAPOR, "Margin of Sampling Error/Credibility Interval" (PDF): poin persen bukan persen, 95 dari 100, hanya survei probabilitas, sampel 1.000 vs 2.000, subkelompok 200 → ±6,9, tidak ada margin keseluruhan yang terukur (#5).
- AAPOR, "Best Practices for Survey Research": pengaruh wording dan konteks pertanyaan (#6).
- Peraturan KPU 9/2022 (PDF via JDIH BPK) + laman status JDIH BPK: kewajiban lembaga survei pemilu (#7, #8).
- Wikipedia "Margin of error" (MEDIUM) untuk rumus 0,98/√n, dipakai di hitungan sendiri (#9, #10).

## Fakta terverifikasi

1. Margin of error ±3 pada kepercayaan 95%: bila survei diulang 100 kali, sekitar 95 kali hasilnya dalam 3 poin dari nilai populasi; sekitar 5 kali di luar (#1, #5).
2. Satuan margin of error adalah poin persen, bukan persen dari hasil (#5).
3. Margin of error yang dilaporkan berlaku untuk angka tiap pilihan, bukan untuk selisih; margin selisih dua pilihan kira-kira dua kali lipat (±3 → ±6) (#2). Hitungan sendiri untuk ilustrasi 46 vs 42, n = 1.000: ±5,8 (#10, #11).
4. Selisih antar dua survei juga punya margin besar (contoh Pew: perubahan 3 poin, margin ±8) (#2).
5. Subkelompok punya margin lebih besar: 200 responden → ±6,9 (#5); 160 → ±8 per pilihan, ±16 untuk selisih (#3).
6. Margin terbesar saat proporsi 50%; angka itu yang biasa dilaporkan (#5).
7. Menggandakan sampel 1.000 → 2.000 hanya mengurangi margin sekitar 1 poin (#5; hitungan sendiri ±3,1 → ±2,2, #10).
8. Pembobotan memperbesar margin (design effect) (#4).
9. Galat non-sampling (wording, cakupan/kerangka sampel, nonresponse, ketidakjujuran responden, model pemilih) tidak tercakup margin of error dan tidak bisa dihitung seperti galat sampling (#4, #5, #6).
10. Margin of sampling error hanya sah untuk survei probabilitas; survei online opt-in memakai "credibility interval" yang bergantung asumsi (#5).
11. Di Indonesia (PKPU 9/2022, status berlaku per 2026-11-27): lembaga survei pemilu wajib berbadan hukum, independen, sumber dana jelas, terdaftar di KPU; melaporkan metodologi, sumber dana (diaudit), jumlah responden, tanggal, dan wilayah; dilarang mengumumkan hasil di masa tenang; wajib menyatakan hasilnya bukan hasil resmi KPU (#7, #8).

## Perselisihan / Kontroversi

- **Koreksi hook.** Hook TOPIC.md menulis "plus minus 3%". Menurut AAPOR (#5) satuan yang benar adalah poin persen, dan menulis "3%" itu sendiri bagian dari salah paham. Naskah memakai "plus minus tiga ... bukan tiga persen, tapi tiga poin persen".
- **"Sering disalahpahami"**: tidak ada sumber yang meranking salah paham "paling umum". Yang bersumber: Pew (#2) menyebut laporan "di luar margin of error" sering salah karena margin selisih ≈ 2× margin individual, dan Pew menyebut aturan praktis ini "lebih bernuansa dari kelihatannya"; AAPOR (#5) menekankan poin persen vs persen. Naskah tidak mengklaim "paling umum"; c04 hanya berkata "jebakannya ada di selisih".
- **"Dua kali lipat" itu pendekatan.** Pew menulis "generally about twice". Persis 2× hanya bila dua pilihan menguasai hampir 100% dan masing-masing dekat 50%; dengan banyak pilihan atau suara ragu besar, margin selisih sedikit di bawah 2× (ilustrasi 46/42: ±5,8, bukan ±6,2). VO memakai "kira-kira" dan "sekitar".
- **"Bukan jaminan" di hook**: didukung #1/#5 (5 dari 100 meleset) dan #4 (galat non-sampling).
- **Netral politik**: semua angka contoh (A 46, B 42, sampel 1.000, subkelompok 200 anak muda) adalah ILUSTRASI, tanpa nama calon, partai, atau lembaga survei. Contoh Pew (Partai Republik/Demokrat) tidak dipakai di visual.
- **Regulasi**: PKPU 9/2022 berstatus berlaku di JDIH BPK per 2026-11-27, tanpa catatan pencabutan/perubahan. Dasar hukumnya UU 7/2017 dan UU Pilkada; bila UU Pemilu direvisi sebelum produksi, cek ulang. VO hanya menyebut kewajiban lapor, tanpa nomor pasal.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ±3 POIN (bukan 3%) | Satuan margin of error | #5 |
| 95 dari 100 | Tingkat kepercayaan 95%; 5 dari 100 meleset | #1, #5 |
| 46 ±3 → 43–49 | Rentang satu pilihan (ILUSTRASI) | #2, #11 |
| A 46 vs B 42, beda 4 | Selisih (ILUSTRASI) | #11 |
| selisih ≈ 2× margin, ±6 | Aturan Pew | #2 |
| ±5,8 | Margin selisih ilustrasi, hitungan sendiri | #10 |
| 1.000 orang → ±3,1 | Sampel ilustrasi, hitungan sendiri | #10 |
| 200 orang → ±6,9 | Subkelompok | #5, #10 |
| PKPU 9/2022 | Wajib lapor metodologi, sumber dana, jumlah responden | #7, #8 |

## Poin kunci

- Margin of error = rentang untuk tiap angka, dalam poin persen, pada kepercayaan 95%.
- Unggul lebih dari margin belum tentu unggul: margin selisih ≈ 2×.
- Angka subkelompok jauh lebih goyah.
- Margin of error tidak menghitung galat non-sampling; cek metodologi, sumber dana, dan jumlah responden (wajib dilaporkan lembaga survei pemilu di Indonesia).
- Payoff: tiga pertanyaan checklist (poin? angka yang mana? survei seperti apa?) menutup loop hook.
