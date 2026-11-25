# Asset Candidates — Cara Kerja CRISPR: Menggunting dan Menempel DNA Seperti Dokumen

Dicari 2026-11-25 lewat `audira_search_assets`. Kata kunci `dna`, `virus`, `scissors`: 0 hasil di katalog → objek molekuler dibuat prosedural (heliks dari mesh tabung/kapsul ber-material PBR, bukan Points/LineSegments).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Heliks DNA "dokumen", satu basa merah, gunting molekul | — | Heliks prosedural (instanced capsule + tube); gunting Cas9 = model prosedural bentuk "clam" dua lobus. Belum ada GLB. |
| c01_intro | Bakteri + virus (bakteriofag), arsip potongan DNA | — | Bakteri kapsul prosedural; fag = ikosahedron + ekor. Belum ada GLB. |
| c02 | Laboratorium, siluet dua ilmuwan, mikroskop | `senior-scientist-631736` (character), `research-microscope-77ce04` (prop), `sample-tube-rack-3a32bd` (prop) | Ilmuwan dipakai sebagai siluet tanpa wajah (tokoh nyata). Kit `research-lab-9b9b5d`. |
| c03 | Cas9 + RNA pemandu menyusuri DNA, potongan | — | Prosedural; HUD "20 huruf" + kolom cari ala editor teks. |
| c04 | Ujung DNA putus, mesin perbaikan, cetakan DNA baru | — | Prosedural; animasi sambung + segmen warna baru masuk. |
| c05 | Medali Nobel, sel darah sabit berubah bulat, klinik | `doctor-d49de0` (character), `research-microscope-77ce04` (prop) | Medali & sel darah prosedural (torus/disk). Kit `hospital-kit-2ebfcb` untuk latar klinik. |
| c06 | Salah potong (off-target), pohon keluarga, "2018 · bayi kembar" | — | Tanpa wajah orang nyata; pohon keluarga = node bercahaya. |
| c07_payoff | Hero shot DNA utuh, outro card AUDIRA | — | `shared/assets/brand/audira-outro-card.svg`. |

Saran engine: hybrid — dunia molekul (DNA, Cas9, sel) paling jelas sebagai 3D R3F prosedural ber-material PBR (NANOFORGE/INNERWORKS), tapi katalog GLB tidak punya aset molekul, jadi callout HUD + analogi "cari-potong-tempel" ala editor dokumen lebih baik ditumpuk sebagai lapisan 2D.
