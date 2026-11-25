# STYLE_DECISION — EP21 Bug Y2K (AUDIRA TECH, @AudiraTECH)

Style: TERMINAL
Engine: Remotion 2D (kit mograph TERMINAL dari audira-2d-motion, `engines/remotion-starter/src/styles/terminal/kit.tsx`)
Tanggal: 2026-11-23
approved: yes (pilihan pengguna di gerbang style, 2026-11-23)

## Alasan
Bug Y2K adalah cerita tentang kode, tanggal sistem, dan register memori. Layar terminal fosfor hijau (CRT, log diketik, jendela ALERT, bar blok, piksel dither) membuat penonton seolah membaca layar komputer tahun 1999 itu sendiri: jam sistem yang berganti ke 1900, kode COBOL `PIC 99`, register 32 bit yang meluap. Brand bisa ditanam di prompt (`audira@tech:~$`).

## Alternatif yang ditolak
- KLIPING (kolase potongan koran): kuat untuk kepanikan media 1999, tapi mekanisme teknis (2 digit, register 32 bit) sulit digambarkan dengan potongan kertas. Ditolak pengguna.
- PIKSEL (pixel art 8-bit): cocok nuansa retro, tapi terlalu "game" untuk topik infrastruktur bank/listrik. Ditolak pengguna.

## File
- `style/cover-reference.png` (salinan `ref-TERMINAL.png`, quality bar kit)
- `style/cover-topic.png` (cover topik, dirender dari film detik ±3.5)
- `style/_style_options.jpg` (sheet opsi yang ditunjukkan ke pengguna)
