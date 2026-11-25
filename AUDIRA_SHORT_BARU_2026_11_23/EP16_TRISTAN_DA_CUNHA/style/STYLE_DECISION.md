# STYLE_DECISION — EP16 Tristan da Cunha

Style: HISTORYMAP
- **Tanggal:** 2026-11-23
- **Engine:** Remotion 2D murni (SVG/DOM, tanpa R3F)
- **Style terpilih:** HISTORYMAP
- **Alasan (awam, terkait topik):** inti cerita adalah jarak — 2.437 km ke tetangga terdekat, kapal dari Cape Town, rute evakuasi 1961 ke Inggris dan pulang 1963. Peta laut bergaya kartografi dokumenter paling jelas menunjukkan jarak dan rute itu.
- **Alternatif ditolak:** PAPERWORLD — hangat dan diorama, tapi data jarak kurang terbaca dan sudah dipakai EP04/EP08 batch ini; WATERCOLOR — paling emosional, tapi lemah untuk angka jarak dan rute.
- **Cover referensi:** `cover-reference.png`
- **Cover topik:** `cover-topic.png`
- **approved:** yes (pengguna memilih "HISTORYMAP (Recommended)", 2026-11-23)

## Parameter dari motion memory (`audira_style_memory get HISTORYMAP`)
- Wajib: label/stempel sebagai kartu screen-space pada plat gelap dengan border-left merah, di-clamp dalam frame; satu prop + satu kartu per momen; signature jauh dari judul/kicker; tag peta ±1,6× lebih besar; potong caption di tanda baca/akhir frasa (tanpa yatim 1 kata); peta tetap kaya detail (garis lintang/bujur, label laut, kompas); kolam cahaya hangat di bawah peta setelah hook; waktu animasi berbasis anchor kata VO.
- Hindari: frame padat banyak label sekaligus; kamera dua beat berurutan identik; tekstur peta monoton.
