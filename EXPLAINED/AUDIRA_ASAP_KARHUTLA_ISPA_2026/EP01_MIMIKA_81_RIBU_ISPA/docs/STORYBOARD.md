# Storyboard — EP01 MIMIKA 81 RIBU ISPA (SATELLITEBRIEFING)

Durasi komposisi: 80,782 dtk (`timeline.total`; VO berakhir 76,78 dtk, Outro card mulai 76,98 dtk).
Semua detik di bawah dibaca dari `studio/src/scenes/ep01/timeline.json` (Audio Master Clock) lewat `clock.ts`.
Satu kamera kontinu (Hermite melalui key, tidak pernah berhenti; drift yaw 0,35°/dtk). Layer tetap: BG = citra satelit Papua bagian selatan (terrain + graticule), MG = asap/titik panas/objek data, FG = asap dekat lensa + pin, HUD = chip briefing, Caption = karaoke per kata (atas ±1300 px).

| Detik | Bagian | Visual | Gerak kamera | Layer | Teks layar | SFX |
|---|---|---|---|---|---|---|
| 0,0–4,1 | HOOK | Framing cover: Papua Selatan dari orbit, plume Merauke → Timika, titik panas, pelat AUDIRA OSINT di Laut Arafura | Dolly turun d 23,5 → 14, yaw berputar pelan | BG peta, MG asap+api, HUD headline | "81.355 KASUS ISPA · di Mimika · dihitung sejak Januari", tag MIMIKA | — (frame 0 = thumbnail) |
| 4,1–7,6 | HOOK | Headline mengecil; kartu nama Marselino Mameyao (ikon mikrofon) | Dolly lanjut ke Timika d 6,6 | HUD kartu | "Marselino Mameyao · PLT KADINKES MIMIKA", "BUKAN CUMA SOAL ASAP" | click 4,15; impact lembut 6,45 |
| 7,7–11,6 | KONTEKS | Timika tenggelam dalam kabut asap | Turun rendah d 4,2 di dalam asap | FG asap dekat lensa | "◷ SEJAK AKHIR SEP 2026", "TIMIKA · BERSELIMUT ASAP" | whoosh 7,7 |
| 11,6–14,9 | KONTEKS | Ikuti plume melawan angin ke Merauke; titik panas menyala | Pan panjang d 8,5 → 7,6 | MG api, HUD panah angin putus-putus | "TITIK PANAS: MINIM", "PAPUA SELATAN · MERAUKE · SUMBER API", "ARAH ASAP → TIMIKA" | whoosh 11,6 |
| 14,9–17,5 | KONTEKS | Kembali menunggang angin ke Timika; pesawat mainan berputar di cincin holding (ILUSTRASI) | Dolly cepat d 5,2 → 2,1 | MG pesawat + cincin, FG asap | "PESAWAT BERPUTAR · TAK BISA MENDARAT" | whoosh 14,9 |
| 17,5–18,7 | KONTEKS | Kota Timika mini, sekolah dengan jendela padam (ILUSTRASI) | Crane turun d 1,15 | MG rumah instanced + sekolah | "SEKOLAH LIBUR TATAP MUKA · BELAJAR DARI RUMAH" | pop 17,55 |
| 18,8–24,3 | PENGEMBANGAN | Zoom-through: naik menembus kabut ke papan data kaca di atas Laut Arafura; kurva 2026 tergambar | Crane naik + dolly ke papan d 13 → 10,5 | BG pegunungan berkabut, MG papan, HUD label | "Kasus ISPA kumulatif, Mimika", counter 0 → 63.856 "AKHIR AGU 2026" | riser 18,8; ping 22,9 |
| 24,3–28,6 | PENGEMBANGAN | Kurva lanjut ke 30 Okt; titik ±14 Okt 72.977 | Track kanan d 10,5 → 11,5 | idem | "30 OKT 2026 · 81.355 · kasus, bukan orang", "◀ MULAI 1 JANUARI" | ping 26,2 |
| 28,6–32,0 | PENGEMBANGAN | Kilas balik Agustus: asap & titik panas di peta hilang; pita abu "ASAP ±AKHIR SEP" muncul di kanan titik Agustus | Dolly mendekat ke titik Agustus d 10 | BG peta tanpa asap | "ASAP BELUM DATANG" | glitch lembut 30,9 |
| 32,0–35,9 | PENGEMBANGAN | Garis putus-putus 2025 tergambar, berakhir hampir sama tinggi | Tarik mundur d 12,5 | MG garis 2025 | "2025 · PERIODE SAMA · 61.758" | click 32,4 |
| 35,9–41,9 | PENJELASAN | Menembus papan (fade + dolly) ke menara "10 besar penyakit": 10 lempeng muncul berurutan, lempeng ISPA menyala amber | Dolly maju lalu orbit pelan d 7 → 6,3 | MG menara, BG pesisir | Kartu Marselino Mameyao; "10 BESAR PENYAKIT · MIMIKA", "ISPA · SELALU MASUK" | whoosh 35,9; pop 39,9 |
| 41,9–46,3 | PENJELASAN | Chip keluhan di kiri menara | Orbit | HUD chip | "BATUK", "FLU BIASA", "DEBU KEMARAU" | click 43,0 |
| 46,3–51,8 | PENJELASAN | Keluhan meredup, lempeng ISPA makin menyala; chip penyakit berat di kanan | Orbit | HUD chip oranye | "▲ DIPERBERAT ASAP", "ASMA", "TBC", "PNEUMONIA" | — |
| 51,8–56,0 | PENJELASAN | Panel tegas di atas, menara mengecil | Tarik mundur d 7,2 → 8,8 | HUD panel | "81.355 KASUS", "≠ 81.355 orang" (dicoret), "TIDAK SEMUANYA KARENA ASAP" | impact lembut 52,6 |
| 56,2–64,9 | PAYOFF | Kembali ke orbit Papua Selatan; cincin sumber api Merauke berdenyut; pelat AUDIRA OSINT terlihat | Crane naik ke orbit d 15 → 22 | BG peta penuh, HUD kartu | Kartu Johannes Rettob (ikon podium) "BUPATI MIMIKA"; "PERMINTAAN KE PUSAT ① Padamkan sumber api di Papua Selatan ② Perhatikan Papua setara Kalimantan"; "SUMBER API" | whoosh 56,2 |
| 64,9–67,4 | PAYOFF | Asap surut dari Timika, titik panas meredup | Dolly ke Timika d 8 | MG peta bersih | "◷ AWAL NOV 2026", "UDARA TIMIKA MEMBAIK · 3 NOV · ISPU 68 (SEDANG)" | chime 66,1 |
| 67,4–70,2 | PAYOFF | Titik panas Merauke menyala lebih banyak | Pan ke Merauke d 8,6 | MG api | "▲ TITIK PANAS NAIK LAGI · PAPUA SELATAN" | riser 67,4 |
| 70,2–72,8 | PAYOFF | Asap mulai mengalir lagi ke barat laut (belum sampai Timika) | Tarik mundur d 14 | HUD panah putus-putus | "ASAP BISA DATANG LAGI" | whoosh 70,3 |
| 72,9–76,9 | OUTRO | Orbit tinggi di atas Mimika, pelat AUDIRA di laut | Crane pelan d 13,5 | HUD kartu hijau | "Pakai masker · SAAT UDARA BERASAP", "Sesak? Ke puskesmas · SEGERA PERIKSAKAN" | pop 72,9; pop 74,6 |
| 76,98–80,78 | OUTRO | `<Outro>` kartu AUDIRA (lapisan teratas) | — | Outro card | AUDIRA · Created by Agus Dwi R. | chime 77,0 |

Catatan fakta di layar: 81.355 selalu "kasus" (kumulatif 1 Jan–30 Okt 2026); 63.856 (s.d. pekan 35 ≈ akhir Agustus), 72.977 (±14 Okt), 61.758 (periode sama 2025) dari Dinkes Mimika; ISPU 68 dari laman Pemkab Mimika. Chip "ILUSTRASI" tampil di semua adegan peta/pesawat/kota; disembunyikan di papan data dan menara.
