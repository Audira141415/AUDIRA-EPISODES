# STYLE_DECISION — EP02 Cara Kerja Kartu e-Toll / NFC

Style: BLUEPRINT
- Engine: Remotion 2D (kit mograph BLUEPRINT dari F:/AUDIRA-2D-SKILL-MOTION, dipasang di proyek starter AUDIRA-SKILL-MOTION)
- Tanggal: 2026-11-23
- approved: yes (pengguna memilih "BLUEPRINT (Recommended)" di gerbang style, 2026-11-23)

## Alasan
Topik "cara kerja": kartu dibelah ala gambar teknik, kumparan antena + chip diberi label callout, garis medan magnet 13,56 MHz dan panah energi bisa digambar langsung. Bahasa visual blueprint = "membongkar mesin", cocok untuk channel AUDIRA Explained.

## Alternatif yang ditolak
- SEMESTA (vektor flat kosmik): ramah penonton, tapi kurang terasa "teknis/bongkar mesin". Tidak dipilih pengguna.
- FLATLIFE (karakter kartun panggung): paling santai, kurang cocok untuk penjelasan fisika induksi. Tidak dipilih pengguna.

## Peringatan dari memori
- Kit 2D flat (TUBUH, EP33) gagal juri: lighting 3 (tanpa gradien/gloss/bayangan), motion 3 (kamera diam 33%).
- Perbaikan wajib di episode ini: gradien radial + glow pada medan/energi, bayangan kontak pada objek, lapisan parallax BG/MG/FG, drift kamera kontinu tiap adegan, HUD tidak bertumpuk.
