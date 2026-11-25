# STYLE_DECISION — Pit Stop F1 1,80 Detik (`EP04`)

> ✅ Gerbang tahap 3. Cover = quality-bar penilaian skor.

- **Tanggal:** `2026-11-22`
- **Engine:** Remotion + R3F (3D)
- **Style terpilih:** `TOYDIORAMA` (dipilih pengguna 2026-11-22)
- **Alasan (awam, terkait topik):** Pit stop adalah koreografi kru yang selesai dalam 1,80 detik. Diorama mainan memperlihatkan semua kru sekaligus, tugas tiap orang bisa diperlambat, dan figur mainan tanpa wajah realistis atau logo tim.
- **Alternatif ditolak:** `CINESTORY`: lebih dramatis, tetapi belum punya skor di motion memory, jadi risikonya lebih tinggi. `BONGKAR`: kuat untuk urai roda dan ban 18 inci, tetapi berpusat pada satu objek dan kurang pas untuk kerja tim.
- **Cover referensi:** `cover-reference.png` (quality-bar TOYDIORAMA)
- **Cover topik:** `cover-topic-A.png` (overhead 3/4, seluruh kru terlihat) dan `cover-topic-B.png` (low 3/4 hero). Varian pilihan pengguna disalin menjadi `cover-topic.png`.
- **Aset:** katalog GLB tidak punya mobil F1, jadi mobil dibangun prosedural (livery generik teal + krem, tanpa logo atau nomor). GLB katalog: `service-bay-garage-aaf8e0`, `tire-ccf0eb`, `oil-drum-386c30`, `traffic-cone-c421e4`.
- **Kode:** `studio/src/scenes/ep04/` (`PitSet.tsx`, `Cover.tsx`, `Model.tsx`); komposisi `Ep04CoverA` dan `Ep04CoverB`.
- **approved:** `yes` (pengguna: "Acc cover A", 2026-11-22; cover-topic.png = varian A, komposisi Ep04CoverA)

## Parameter dari motion memory (`audira_style_memory get TOYDIORAMA`)
- Wajib diterapkan: Finish `DOCUMENTARY_WARM`, exposure 1, envIntensity 0.55; karakter `ToyPerson`/`POLISH` (rounded + fabric); kamera rendah dan dekat untuk 9:16; props latar depan di sepertiga bawah.
- Parameter terbaik: `finishProfile DOCUMENTARY_WARM`, `exposure 1`, `envIntensity 0.55`, `ao true`.
- Hindari: menumpuk banyak kartu atau props dalam satu frame, teks terpotong di tepi, dan teks kecil di bawah 34 px. Juri buta memberi 3,67 untuk komposisi dan keterbacaan pada episode berita.
