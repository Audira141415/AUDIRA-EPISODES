# STORYBOARD — EP07 Bikin Aplikasi Tanpa Coding Pakai Canvas di Gemini (ISOCRAFT)

Durasi komposisi: 90,2 dtk (`timeline.total`), VO 0,57–86,0 dtk, outro card mulai 86,2 dtk.
Dunia: satu diorama kertas warung (HP raksasa tembus pandang dari cover) + set "Canvas workshop" di samping.
Layer: BG lantai kertas + rak warung · MG HP/mesin, pemilik warung (ToyPerson) · FG panel UI komik, kursor · HUD headline/nomor langkah/kartu peringatan · caption karaoke (bawah ≤1525 px).
Kamera: rig orbit lensa panjang (fov 20–30), selalu bergerak; kunci di `studio/src/scenes/ep07/camera.ts`.

| Detik | Bagian | Visual | Kamera | Teks layar | SFX (dtk) |
|---|---|---|---|---|---|
| 0,0–3,85 | Hook | HP raksasa masih kosong (slot tombol biru putus-putus, layar "?"), pemilik warung menatap ke atas sambil memegang dagu; kartu "</>" dicoret | Pull-back dari pemilik ke seluruh HP | WARUNGMU BUTUH · APLIKASI KASIR? / TAPI TIDAK BISA CODING? | impact 0,0 · glitch 2,9 |
| 3,9–5,95 | Hook | Close-up pelat AUDIRA di dagu HP (≥2 dtk) | Slide samping, dolly halus | AUDIRA AI TUTORIAL · EP 7 / KITA RAKIT PAKAI CANVAS | whoosh 3,9 |
| 5,95–8,1 | Hook | Gelembung PROMPT muncul di atas HP, panah putus-putus ke corong | Crane naik ke corong | (lanjutan) | — |
| 8,15–10,75 | Konteks | Set "Canvas workshop": papan CANVAS · ruang kerja · satu perintah | Dolly-in dari jauh | APA ITU CANVAS? / RUANG KERJA DI GEMINI | whoosh 8,15 |
| 10,75–20,6 | Konteks | Hasil muncul tepat di katanya: DOKUMEN 13,5 · SLIDE 14,5 · KUIS 15,1 · INFOGRAFIS 15,8 (batang tumbuh) · HALAMAN WEB 16,8 · APLIKASI 18,5 | Truck kiri→kanan, push-in ke HP mini | DARI SATU PERINTAH / JADI DOKUMEN, SAMPAI APLIKASI (s.d. 13,3) + label 3D | pop 13,54 · pop 18,5 |
| 20,85–36,6 | Langkah 1–3 | Panel chat generik: URL diketik "gemini.google.com"; klik "+ Add Files" 24,84 → menu (Upload files / Canvas) → klik "Canvas" 26,24 → chip Canvas; prompt diketik per kata 29,9–35,4 | BG: orbit lambat mengelilingi HP kosong | Langkah 1 Buka gemini.google.com · 2 Klik Add Files → Canvas · 3 Tulis perintah sejelas mungkin | click 24,84 · click 26,24 |
| 36,22–38,3 | Langkah 4 | Klik kirim → 4 ubin kata (barang, harga, tombol, total) terbang ke corong dan berubah jadi balok; layar, sabuk, tombol jatuh satu per satu, capit memasang tombol "5" 37,95 | Push-in ke mesin | 4 Kirim, tunggu dirakit | riser 36,22 · impact 37,95 |
| 38,35–43,6 | Langkah 5 | Panel Canvas: tab Preview aktif, aplikasi kasir contoh; kursor klik "+ Tambah" 41,56 dan 42,36, TOTAL naik Rp15.000 → Rp21.000 | BG orbit | 5 Coba di tab Preview | — |
| 43,65–45,45 | Penjelasan | Zoom-through kaca HP masuk ke roda gigi dan sabuk | Dolly cepat menembus kaca | ISI MESINNYA · MAU LIHAT DALAMNYA? | whoosh 43,65 |
| 45,5–53,25 | Penjelasan | Klik "Code" 45,86 → kode diketik; badge error merah 48,99; klik "Show console" 50,07 → laci console "Error: harga is not defined" | BG orbit dekat mesin | 6 Code (kanan atas) · 7 Ada error? Show console | glitch 50,07 |
| 53,3–60,55 | Penjelasan | Kembali ke Preview; klik "Select & ask" 55,27; tandai tombol Tambah 56,5–57,1 (kotak putus-putus); kotak "UBAH BAGIAN INI" mengetik "tombolnya dibuat lebih besar" | BG orbit | 8 Select & ask | — |
| 60,6–65,55 | Penjelasan | Tombol HP membesar 61,05; pemilik menekan "=" 63,55 dan 64,35; struk tercetak 64,1 | Dolly ke pemilik + keypad | APLIKASI DIPERBARUI · TES LAGI LANGSUNG! | — |
| 65,6–71,45 | Payoff | Panel Canvas (tombol sudah besar): klik "Share & export" 66,81 → "Share" 68,61 → dialog BAGIKAN APLIKASIMU → "Copy link" 70,37 → ✓ Tautan disalin | BG orbit lebar | 9 Share & export → Share | click 66,81 |
| 71,5–76,45 | Payoff | Kaca pembesar 3D menyapu struk TOTAL | Top-down condong, dolly | Kartu ⚠ TETAP TES SENDIRI: Buatan AI bisa salah. Cek hitungan uangnya. | impact 71,62 |
| 76,5–81,3 | Payoff | Kotak kardus DATA PELANGGAN + rambu larangan merah muncul 77,05 | Orbit pelan | Kartu ⚠ JAGA PRIVASI: Jangan simpan data pelanggan sensitif di aplikasi coba-coba. | — |
| 81,35–86,2 | Outro | Wide seluruh warung, HP lengkap, pelat AUDIRA | Crane naik | EPISODE DEPAN · Ngobrol dengan Gemini lewat kamera | — |
| 86,2–90,2 | Outro | `<Outro>` AUDIRA card (lapisan teratas) | — | logo + Created by Agus Dwi R. | — |

Catatan: semua label tombol memakai nama Inggris persis naskah ("Add Files", "Canvas", "Preview", "Code", "Show console", "Select & ask", "Share & export", "Share"). Harga di aplikasi kasir adalah data contoh (ditandai "(contoh)"), bukan klaim. Panel UI generik, tanpa logo produk nyata.
