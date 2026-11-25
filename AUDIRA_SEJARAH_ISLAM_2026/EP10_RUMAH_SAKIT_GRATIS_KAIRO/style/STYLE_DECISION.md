# Style Decision — EP10 Rumah Sakit Gratis Kairo (Bimaristan al-Mansuri)

- **Episode:** sejarah-islam-EP10 (`EP10_RUMAH_SAKIT_GRATIS_KAIRO`), channel AUDIRA QISSAH
- **Style terpilih:** FELTCRAFT (diorama kain flanel dan wol yang dijahit tangan, cahaya hangat)
- **Engine:** Remotion + React Three Fiber (starter AUDIRA-SKILL-MOTION, kit `src/kits/feltcraft`, adegan `src/scenes/mansuri`)
- **Tanggal:** 2026-11-12 (style dipilih 2026-11-11)
- **approved:** yes (style, opsi utama dipilih pengguna 2026-11-11)
- **cover approved:** yes (cover approved by user 2026-11-12, "Ya, buat suara")

## Alasan

Kisah ini tentang perawatan: kasur, selimut, pakaian yang dibekalkan, dan pintu yang terbuka untuk semua orang. Flanel dan jahitan tangan terasa hangat dan "merawat", jadi cocok untuk rumah sakit wakaf yang memberi pakaian kepada pasien yang sembuh. Gaya diorama juga memudahkan aturan seri: tokoh hanya figur flanel kecil tanpa wajah, dan bangunan Mamluk (gerbang lengkung runcing dengan batu ablaq, kubah, menara) bisa tampil jelas sebagai maket.

Penyesuaian dari kit: rubah "Kopi" di cover kit **tidak dipakai** (tanpa karakter hewan kartun). Isinya hanya bangunan, bangsal, benda (guci obat, baju terlipat, gulungan benang) dan figur flanel kecil tanpa wajah. Pita kaligrafi di fasad adalah goresan jahitan abstrak, bukan teks Arab sungguhan.

## Alternatif yang ditampilkan (`_review/STYLE_OPTIONS_B2.jpg`)

| Opsi | Style | Status | Alasan tidak dipilih |
|---|---|---|---|
| 1 | **FELTCRAFT** (utama) | Dipilih | — |
| 2 | URBANFORGE | Ditolak | Maket arsitektur putih kuat untuk denah empat aula, tapi dingin dan teknis; sisi "gratis dan merawat" kurang terasa. |
| 3 | COLLAGE | Ditolak | Kolase kertas cocok untuk kutipan catatan sejarah, tapi kurang kedalaman 3D untuk gedung dan bangsal. |

## Cover

- `cover-reference.png`: quality bar kit FELTCRAFT (`F:\AUDIRA-SKILL-MOTION\references\quality-bar\feltcraft.png`).
- `cover-topic.png`: frame 0,3 dtk dari komposisi `MansuriCover` (= frame pembuka film), framing di `cover.json` (sumber: `project/src/scenes/mansuri/framing.ts`).
  Isi: gerbang Bimaristan al-Mansuri dari flanel pasir dengan lengkung runcing bervoussoir ablaq merah-krem, pita kaligrafi abstrak berjahit emas, pintu kayu terbuka, aula dalam yang diterangi lentera hangat. Dua figur flanel tanpa wajah dilihat dari belakang berjalan masuk berdampingan (satu bersorban putih-emas dan jubah merah, satu berjubah cokelat dengan tongkat). Di belakang: kubah berjahit, menara, sayap bangunan berjendela, siluet Kairo, langit kain biru senja dengan awan pompom dan matahari kancing. Latar depan: gulungan benang, guci obat, tumpukan baju terlipat. Judul "Rumah Sakit Gratis untuk Semua", kicker "SEJARAH ISLAM · EP10", sub "dari raja sampai budak", chip "KAIRO · 1285".
- Skor cover (self): 4,2 LOLOS (lighting 4, material 4, depth 4, composition 4, readability 5); ceiling audit lighting/material/depth/composition 5.

## Revisi cover di Stage B (2026-11-12)

Dua kelemahan cover diperbaiki atas permintaan lead: chip "KAIRO · 1285" yang menutup puncak menara dipindah ke kicker kartu judul ("SEJARAH ISLAM · EP10 · KAIRO 1285"), dan kepala figur berjubah cokelat kini jelas (leher, kepala bulat, kain lilit krem berjahit, selendang bahu). Lantai kini kain perca berjahit dan sayap bangunan punya garis ablaq. Framing tidak berubah (`cover.json`). Cover lama disimpan sebagai `cover-topic.v1-approved.png` / `cover.v1-approved.json`; cover baru perlu dilihat lagi oleh pengguna.
