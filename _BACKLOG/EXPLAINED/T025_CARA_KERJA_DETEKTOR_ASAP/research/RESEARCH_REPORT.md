# Research Report — Cara Kerja Detektor Asap

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/merek nyata, netral).

## Sumber utama

- **NFPA Research** "Smoke Alarms in US Home Fires" (McGree, Juni 2024): statistik efektivitas alarm 2018–2022 (#1).
- **U.S. Fire Administration (FEMA)**: tipe alarm, perawatan (tes bulanan, baterai, ganti 10 tahun), penempatan (#2).
- **U.S. NRC** Backgrounder on Smoke Detectors dan **U.S. EPA RadTown**: prinsip ionisasi, jumlah dan keamanan americium-241 (#3, #4).
- **NIST** Supplementary Q&A (2007): perbandingan respons ionisasi vs fotolistrik pada api menyala vs membara (#5).
- Pendukung MEDIUM: Wikipedia "Smoke detector" dan "Americium-241" (#6, #7).

## Fakta terverifikasi

1. Detektor asap tidak "mencium" bau; ia mendeteksi partikel asap lewat cahaya (fotolistrik) atau gangguan arus ion (ionisasi) (#2, #3, #6).
2. Fotolistrik: LED dan sensor cahaya tidak segaris; partikel asap menghamburkan cahaya ke sensor lalu alarm berbunyi (#6).
3. Ionisasi: americium-241 memancarkan partikel alfa yang mengionisasi udara; dua pelat/elektroda membuat arus kecil stabil; asap mengganggu arus dan memicu alarm (#3, #4).
4. Sebagian besar unit memakai americium-241 satu mikrokuri atau kurang; partikel alfa hanya menempuh beberapa inci (beberapa sentimeter), tertahan lapisan foil/keramik dan casing; dosis dari dua unit di rumah < 0,002 milirem/tahun (#3, #4).
5. Jangan mengutak-atik/membongkar detektor karena bisa merusak pelindung sumber (#4).
6. Fotolistrik umumnya lebih dulu merespons api membara; ionisasi umumnya lebih dulu merespons api menyala (rata-rata 147 ± 92 dtk lebih dulu di uji NBS/NIST) (#5).
7. USFA menyarankan memasang keduanya atau alarm sensor ganda (#2).
8. Data AS 2018–2022: tingkat kematian ≈ 60% lebih rendah dengan alarm yang berfungsi; 59% (hampir 3 dari 5) kematian terjadi di rumah tanpa alarm atau dengan alarm yang tidak bekerja (#1).
9. Penyebab paling umum alarm gagal: sumber daya hilang atau mati (baterai dicabut, baterai habis) (#1).
10. Perawatan: tes sebulan sekali, baterai 9 volt diganti minimal setahun sekali, seluruh alarm diganti tiap 10 tahun; jangan mencabut baterai saat alarm berbunyi karena memasak (#2).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Alat seukuran piring kecil ini bisa *mencium* asap *sebelum kamu melihat api*" dilebihkan di tiga bagian.
  1. "Mencium" keliru secara teknis: detektor tidak punya sensor bau, ia mendeteksi partikel (#3, #6). Dipakai sebagai twist di intro ("tidak punya hidung").
  2. "Sebelum kamu melihat api" tidak selalu benar: berlaku untuk api membara yang berasap lama sebelum menyala (#5), tetapi pada api menyala cepat asap dan api muncul hampir bersamaan, dan pada uji NIST alarm membara pun bisa butuh puluhan menit. Dikoreksi menjadi "sering sebelum apinya membesar".
  3. "Seukuran piring kecil" tidak bersumber dan cenderung kebesaran; diganti "sebesar telapak tangan" (deskriptif, tanpa angka di layar).
  Hook baru: "Benda sebesar telapak tangan di langit-langit ini bisa menangkap asap, sering sebelum apinya membesar."
- **Data hanya AS**: statistik 60% dan 3 dari 5 berasal dari NFPA (AS, 2018–2022). Tidak ditemukan data setara untuk Indonesia; VO menyebut "di Amerika" agar tidak terkesan data lokal.
- **Ionisasi vs fotolistrik**: industri dan sebagian badan pernah memperdebatkan mana yang lebih baik; naskah memakai posisi netral NIST + USFA (masing-masing unggul di jenis api berbeda, pasang keduanya/sensor ganda), tanpa menyebut merek.
- **Radioaktif**: risiko dosis sangat kecil selama alat utuh (#3, #4). Naskah sengaja tidak menjelaskan cara membongkar atau mengeluarkan sumber; hanya pesan "selama tidak dibongkar, aman". Cara pembuangan detektor bekas di Indonesia belum diriset (bila perlu, cek aturan BAPETEN sebelum produksi; tidak dinarasikan).
- **Waktu paruh 432,6 tahun** (#7, MEDIUM) tidak dipakai di VO.
- **Baterai**: aturan "setahun sekali" hanya untuk baterai 9 volt/cadangan; alarm baterai lithium 10 tahun tidak perlu ganti baterai (#2). VO menyebut "baterai sembilan volt" spesifik.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ≤ 1 mikrokuri | Am-241 di detektor ionisasi (umumnya) | 3 |
| Beberapa cm | Jangkauan partikel alfa di udara (NRC: "a few inches") | 3 |
| < 0,002 milirem/tahun | Dosis dari 2 unit di rumah (studi NRC 2001), opsional | 3 |
| ±60% lebih rendah | Tingkat kematian dengan alarm berfungsi, AS 2018–2022 | 1 |
| 3 dari 5 (59%) | Kematian di rumah tanpa alarm/alarm tidak bekerja, AS 2018–2022 | 1 |
| 1×/bulan | Tes tombol alarm | 2 |
| 1×/tahun | Ganti baterai 9 volt | 2 |
| 10 tahun | Ganti seluruh alarm | 2 |

## Poin kunci

- Twist sains: alat "pencium asap" sebenarnya tidak mencium, ia memakai cahaya atau arus ion.
- Dua mekanisme = dua adegan cutaway yang sangat visual (sinar terhambur vs arus ion terputus).
- Am-241 disampaikan faktual dan menenangkan, tanpa instruksi membongkar.
- Payoff = rutinitas keselamatan (tes bulanan, baterai, ganti 10 tahun, jangan cabut baterai saat memasak).
- Rule 15: detektor generik tanpa merek; tokoh siluet tanpa wajah.
