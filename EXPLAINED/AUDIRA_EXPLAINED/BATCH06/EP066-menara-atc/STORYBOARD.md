# STORYBOARD — AE-066 Menara ATC (GLASSCRAFT)

Kode: `studio/src/scenes/ep066/Film.tsx` (kamera `camAt`, state dunia `worldAt`), dunia 3D `FilmWorld.tsx`.
Semua detik mengikuti `timeline.json` (VO). Total komposisi 65,0 dtk; `<Outro>` mulai 61,20.
Layer tetap: BG langit senja biru + lampu kota (FX) → MG menara, landasan, taxiway, pesawat → FG lampu taxiway/stop bar → HUD kaca buram (pill, papan strip, radar, kartu) → caption karaoke (dasar 400 px dari bawah).

| # | Detik VO | Bagian | Visual | Kamera | Teks layar | SFX disarankan |
|---|---|---|---|---|---|---|
| 1 | 0,00–2,98 | HOOK | Pesawat AUDIRA 66 berhenti menghadap kamera di balik stop bar merah; marka kuning dua garis utuh + dua putus | Dolly-in rendah di depan stop bar | caption | impact 0,05 |
| 2 | 2,98–6,21 | HOOK | Lepas dari stop bar, menara dan seluruh bandara terbuka | Crane naik-mundur cepat ke komposisi cover | caption | whoosh 3,0 |
| 3 | 6,21–8,88 | KONTEKS | Dalam kabin: tiga pengendali (ToyPerson) duduk di konsol melingkar, monitor radar/ADS-B, jendela ke landasan | Dolly lambat dari belakang kabin | caption | glint 6,0 (transisi kaca) |
| 4 | 8,88–16,98 | KONTEKS | Papan strip kaca: strip besar "AUDIRA 66" pindah lajur DELIVERY (8,88) → GROUND (11,59) → TOWER (14,96); di belakang, orbit luar kabin dengan label "AUDIRA TWR" | Orbit pelan di luar kabin | "Papan strip penerbangan", nama lajur + peran (Izin rute / Taxiway / Landasan), status strip | pop 8,9; click 11,6; click 15,0 |
| 5 | 16,98–19,73 | MEKANISME | Close-up wajah pengendali; pill frasa standar radio muncul satu per satu | Arc pendek di depan pengendali | "FRASA STANDAR RADIO", Line up and wait / Cleared for takeoff / Cleared to land | pop 17,3 |
| 6 | 19,73–23,35 | MEKANISME | Stop bar padam, lead-on hijau menyala; pesawat masuk landasan lalu diam di garis tengah | Track samping tinggi mengikuti belokan | "Line up and wait — masuk landasan, lalu diam" | whoosh 19,7 |
| 7 | 23,35–27,18 | MEKANISME | Pesawat diam; pada "cleared for takeoff" (25,97) akselerasi dan lepas landas | Kamera rendah di tepi landasan, pan mengikuti | pill hijau "Cleared for takeoff — baru boleh terbang" | riser 24,8 → impact 26,0 |
| 8 | 27,18–31,34 | MEKANISME | Pesawat menanjak; panel radar Approach zoom-through: ikon pesawat berbaris di jalur pendekatan, garis jarak muncul pada "jarak" (tanpa angka) | Chase belakang-samping lalu radar | "Approach · LAYAR RADAR", callsign AUDIRA xx, "jarak antarpesawat dijaga" | whoosh 28,2; click 29,8 |
| 9 | 31,34–33,79 | REVEAL | Taxiway malam dari atas, pesawat AUDIRA 27 menunggu di persimpangan | Crane turun | "Lampu lalu lintas taxiway" | glint 31,3 |
| 10 | 33,79–36,17 | REVEAL | Lampu tepi biru menyala lebih terang, lalu garis tengah hijau | Dolly maju di atas taxiway | "Tepi: biru", "Garis tengah: hijau" | pop 33,9; pop 34,8 |
| 11 | 36,17–41,06 | REVEAL | Stop bar merah melintang menyala terang; AUDIRA 27 tiba dan berhenti | Arc rendah di samping stop bar | "Stop bar: merah — melintang di taxiway" | impact 38,8 |
| 12 | 41,06–46,33 | REVEAL | Pesawat menunggu di depan merah; "izin lisan" diberi tapi tetap diam; stop bar padam → lead-on hijau, pesawat bergerak | Dolly depan pesawat menembus barisan merah | "Merah = jangan melintas", "Izin lisan ✓ — tetap tunggu merah padam", "Padam → lampu hijau" | click 44,4; whoosh 45,3 |
| 13 | 46,33–51,63 | PAYOFF | Dua pesawat terbang beriringan dilihat dari atas; pusaran helix dari ujung sayap memanjang ke belakang dan turun; braket jarak diperlebar | Chase top-down miring, dolly turun | 3D: "Pusaran udara", "Jarak lebih jauh" (tanpa angka) | glint 46,3; riser 47,6; pop 50,7 |
| 14 | 51,63–57,08 | PAYOFF | Bandara malam dari jauh, menara di tengah | Crane maju-turun | Kartu kaca: "DI INDONESIA — Satu lembaga pemandu: AirNav Indonesia" (teks biasa, tanpa logo) | impact 55,7 |
| 15 | 57,08–61,20 | OUTRO | Orbit kabin kaca dari luar; label "AUDIRA TWR" di badan kabin; kata kaca "izin" | Orbit naik | "izin" | glint 57,1; pop 59,2 |
| 16 | 61,20–65,00 | OUTRO | Kartu AUDIRA (`_shared/Outro.tsx`) | — | logo + Created by Agus Dwi R. | whoosh 61,2 |

Catatan klaim: hanya isi naskah/riset. Tidak ada angka separasi, tidak ada logo maskapai/AirNav, callsign fiktif "AUDIRA xx". Lead-on hijau hanya menyala saat stop bar padam (riset [13]). Lampu tepi landasan putih, taxiway biru (riset [11][12]).
