# STORYBOARD — AE-048 Bagaimana Pabrik Mobil Bisa Memproduksi Ribuan Mobil? (BUILDFORGE)

Audio Master Clock: `studio/src/scenes/ep048/timeline.json` (total 58,741 dtk). Semua cut = detik kata VO (`clock.ts`).
Komposisi: `Ep048Preview` (540×960@30) / `Ep048Final` (1080×1920@60). Kode: `studio/src/scenes/ep048/{Film.tsx, world.ts, clock.ts}`.
Dunia: pabrik tanpa atap (cut-away) dari cover yang disetujui; satu jalur lurus sepanjang +x:
press → body shop → tangki ED → booth cat → oven → perakitan (pintu, marriage, part) → shower → roller → gerbang keluar "AUDIRA".
Layer: BG langit + dinding rendah, MG jalur + mobil, FG robot/pekerja/rak part, HUD label tahap (kiri atas) + chip, caption karaoke (bawah, di atas 380 px).

| # | Detik VO | Bagian | Visual | Kamera | Teks layar | SFX |
|---|---|---|---|---|---|---|
| 1 | 0,00–6,56 | HOOK | Gerbang keluar bertuliskan AUDIRA ASSEMBLY LINE 01; deretan mobil jadi bergerak keluar ke arah kamera | dolly-in rendah di sumbu jalur | cincin takt "1 mobil keluar" → "±100 DETIK" di "seratus" (5,67) | riser 0,0; click 5,67 |
| 2 | 6,56–9,90 | HOOK | Crane naik memperlihatkan seluruh jalur; garis oranye di lantai menjalar dari press ke gerbang (1 mobil = seluruh jalur) | crane up + mundur (wide) | "1 MOBIL DIBUAT: BERJAM-JAM" | whoosh 6,56 |
| 3 | 9,90–12,42 | KONTEKS | Mobil di berbagai tahap (rangka, bodi ED, bodi cat) bergerak bersamaan; chevron mint mengalir di lantai | tracking sejajar jalur | "SATU JALUR BERGERAK", "banyak mobil · dikerjakan bersamaan" | whoosh 9,90 |
| 4 | 12,42–16,23 | KONTEKS | Area oven–perakitan, banyak mobil sekaligus | tracking tinggi | sama | — |
| 5 | 16,23–20,06 | MEKANISME | Press portal: lembaran baja masuk, ram turun di "dipres" (+0,45), panel sisi bodi keluar, potongan sisa jatuh; papan AUDIRA di crown press | dolly-in samping | 01 PRESS PANEL | whoosh 16,23; impact 18,13 |
| 6 | 20,06–23,24 | MEKANISME | Body-in-white abu baja polos; 3 robot oranye dengan gun las C; titik las menyala lalu mendingin, percikan singkat per titik | orbit pelan | 02 LAS BODI, "ribuan titik las" | glitch/zap 20,45 |
| 7 | 23,24–26,09 | MEKANISME | Bodi digantung, dicelup ke tangki ED; busur listrik biru di permukaan; keluar abu-abu doff | pan mengikuti bodi | 03 CELUP ANTIKARAT, "cat antikarat · bermuatan listrik" | whoosh 23,64 |
| 8 | 26,09–29,14 | MEKANISME | Booth cat: robot putih bell rotary, front warna menyapu dari abu ke biru; bodi masuk terowongan oven bercahaya oranye | dolly mengikuti bodi | 04 CAT WARNA + OVEN, "dipanggang di oven" | whoosh 26,09 |
| 9 | 29,14–31,99 | REVEAL | Bodi tercat; 4 pintu dilepas ke rak pintu di kedua sisi | dolly-in | 05 PINTU DILEPAS | pop 30,48 |
| 10 | 31,99–35,23 | REVEAL | Marriage: bodi turun dari hanger, AGV membawa mesin + suspensi naik dari bawah, bertemu di "mesin" | rendah, low-angle | 06 BODI + MESIN & SUSPENSI | impact 33,81 |
| 11 | 35,23–39,89 | REVEAL | Pekerja memasang roda, robot memasang kaca depan, troli kotak part (kartu kanban) tiba tepat saat "waktu" | dolly-in tinggi | 07 PART TEPAT WAKTU, "kotak part datang tepat waktu" | click 38,92 |
| 12 | 39,89–43,11 | PAYOFF | Mobil utuh di booth shower, semburan air dari cincin pipa | dolly-in | 08 UJI KEBOCORAN | (ambience air) |
| 13 | 43,11–44,57 | PAYOFF | Roda berputar di atas rol baja | sangat rendah | 09 UJI DI ATAS ROLLER | — |
| 14 | 44,57–49,79 | PAYOFF | Pekerja menarik tali andon (47,07), papan andon pos 4 kuning lalu merah (48,31), jalur berhenti | slow push | 10 TALI ANDON, "LINI BERHENTI" | pop 47,42; impact 48,31 |
| 15 | 49,79–54,94 | OUTRO | Jalur jalan lagi, crane naik memperlihatkan ritme mobil keluar | crane up | "ritme, bukan terburu-buru" | — |
| 16 | 54,94–58,74 | OUTRO | Kartu AUDIRA (`_shared/Outro.tsx`) | — | logo + Created by Agus Dwi R. | — |

Catatan klaim: "±100 detik" = takt (jarak antar-mobil keluar), bukan waktu membuat satu mobil; tidak ada angka part/robot di layar; andon: "lini berhenti" sesuai naskah. Tanpa logo merek nyata, pekerja tanpa wajah.
