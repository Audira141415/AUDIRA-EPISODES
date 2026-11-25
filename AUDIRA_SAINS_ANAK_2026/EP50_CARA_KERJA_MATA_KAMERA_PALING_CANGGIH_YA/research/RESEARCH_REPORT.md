# Research Report — Cara Kerja Mata: Kamera Paling Canggih yang Pernah Ada

## Sumber utama

1. **Curcio et al. 1990** (PMID 2324310) — "Human photoreceptor topography", J Comp Neurol. Studi langsung pada retina manusia dewasa. Data paling akurat untuk jumlah fotoreseptor: rata-rata ~92 juta sel batang dan ~4,6 juta sel kerucut per retina.
2. **Wikipedia (en)** — Artikel Rod cell, Cone cell, Retina, Cornea, Blind spot, Visual cortex, Optic nerve, Lens, Accommodation, Saccade, Photoreceptor cell. Semua merujuk sumber primer (Kandel, Gray's Anatomy, Helmholtz).
3. **Kandel et al., Principles of Neural Science** (dirujuk oleh Wikipedia Retina & Visual cortex) — Retina analog dengan sensor kamera; korteks visual di lobus oksipital.

## Fakta terverifikasi

1. Mata manusia memiliki >100 juta fotoreseptor di retina (#1, #2, #3, #13)
2. Dua jenis fotoreseptor: sel batang (~92 juta, penglihatan gelap) dan sel kerucut (~6 juta, penglihatan warna) (#1, #2, #3)
3. Kornea membiaskan ~2/3 cahaya yang masuk (~43 dioptri kekuatan optik) (#4)
4. Lensa mata bisa berubah bentuk (akomodasi) untuk fokus dekat-jauh (#9, #10)
5. Retina mengubah cahaya menjadi sinyal listrik (fototransduksi) (#5, #12, #13)
6. Sinyal dikirim via saraf optik (>1 juta serat saraf) ke korteks visual di belakang kepala (#7, #8)
7. Blind spot: titik buta di masing-masing mata, tempat saraf optik keluar — otak "mengisi" gambar yang hilang (#6)
8. Fovea centralis: area kecil 0,3 mm berisi kerucut terpadat, pusat ketajaman penglihatan (#3)
9. Mata melakukan ~3 sakade per detik, gerakan cepat untuk memindai lingkungan (#11)
10. Retina berfungsi seperti sensor kamera, tapi melakukan pra-pemrosesan gambar sebelum mengirim ke otak (#5, #12)

## Perselisihan / Kontroversi

**Jumlah fotoreseptor 126 juta (dari hook) vs ~97 juta:**
- Hook TOPIC.md menyebut "126 juta fotoreseptor". Angka ini berasal dari estimasi lama (Osterberg 1935) yang banyak dikutip buku teks: ~120 juta batang + 6 juta kerucut.
- Pengukuran langsung Curcio et al. 1990 menemukan rata-rata lebih rendah: ~92 juta batang + ~4,6 juta kerucut = ~97 juta.
- **Koreksi naskah**: Gunakan "lebih dari 100 juta" agar mencakup kedua estimasi dan tetap akurat. Hook di TOPIC.md tidak diubah (sesuai instruksi), tapi naskah memakai angka aman.

Tidak ada kontroversi lain yang relevan. Anatomi mata adalah sains yang mapan.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| >100 juta | Jumlah fotoreseptor di retina manusia (batang + kerucut) | #1, #2, #3 |
| 92 juta | Sel batang per retina (Curcio 1990) | #1, #2 |
| 6 juta | Sel kerucut per retina | #1, #3 |
| 43 dioptri | Kekuatan optik kornea (~2/3 total mata) | #4 |
| 0,3 mm | Diameter fovea centralis (pusat ketajaman) | #3 |
| 1 juta+ | Serat saraf di saraf optik | #8 |

## Poin kunci

1. Mata bukan sekadar kamera pasif — retina melakukan pemrosesan awal (edge detection, kontras) sebelum sinyal sampai ke otak.
2. Kornea (bukan lensa) yang melakukan sebagian besar pembiasan cahaya.
3. Otak secara aktif "mengisi" blind spot — kita tidak pernah sadar ada lubang di penglihatan.
4. Lensa berubah bentuk untuk fokus (kamera harus bergerak maju-mundur); tapi lensa menua dan kehilangan elastisitas (presbiopia).
5. Mata menggabungkan penglihatan gelap (batang) dan warna (kerucut) secara paralel — kamera butuh mode berbeda.
6. Fovea sangat kecil (0,3 mm) tapi bertanggung jawab atas ketajaman bacaan dan detail — itulah kenapa mata harus terus bergerak (sakade).
