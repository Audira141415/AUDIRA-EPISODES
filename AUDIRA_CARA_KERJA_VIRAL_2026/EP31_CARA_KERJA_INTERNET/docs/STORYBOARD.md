# STORYBOARD — Cara Kerja Internet (EP31)

**Style:** CIRCUITFORGE | **Engine:** Remotion + R3F | **Format:** 9:16 1080×1920 @ 60fps

**World layout:** Satu papan sirkuit kontinu horizontal. Kamera terbang rendah dari kiri (smartphone) ke kanan (data center), lalu kembali. Setiap beat = zona berbeda di papan.

| Scene | Waktu | BG | MG | FG | HUD | Kamera | Audio |
|---|---|---|---|---|---|---|---|
| S1 Hook | 0–3 dtk | PCB gelap, traces redup | Smartphone chip di tengah, jari menekan layar | Kapasitor SMD blur | "20 ROUTER · 50ms" chip label | Extreme close-up smartphone → zoom out cepat, reveal papan sirkuit luas | **SFX:** tap impact + whoosh zoom out |
| S2 Context | 4–15 dtk | PCB dengan trace menuju DNS chip besar | DNS server = prosesor besar dengan label "DNS", buku alamat hologram di atas | Resistor array blur | "DNS LOOKUP" → "142.250.185.78" muncul | Dolly maju ke DNS chip, orbit ringan | **SFX:** data ping, pop saat IP muncul |
| S3 Main 1 | 16–35 dtk | Traces bercabang, router chips berjajar | Paket data (kubus cyan berpendar) dipecah dari satu blok besar, melompat antar router chip | Via-hole dan solder joint | "PACKET #1 · 1500 B" label per paket, hop counter | Track lateral mengikuti paket, slight weave antar chip | **SFX:** whoosh per hop, chime paket terbentuk |
| S4 Main 2 | 36–50 dtk | Papan melebar jadi bentuk benua, kabel emas tebal di bawah | Kabel bawah laut (trace emas tebal) menghubungkan dua section board, paket bergerak cepat di dalam | Gelembung air kecil (efek bawah laut) | "550 KABEL · 1,4 JUTA KM" | Crane shot naik → reveal dua benua board, follow paket di kabel | **SFX:** riser build + deep hum kabel, impact saat sampai |
| S5 Explanation | 51–72 dtk | Data center zone: array chip teratur rapi | Server memproses → paket respons keluar lewat jalur berbeda, TCP menyusun ulang di sisi smartphone | Cooling fan blur, LED berkedip | "TCP REASSEMBLY" + progress bar | Reverse track: ikuti respons kembali ke smartphone, focus pull saat TCP rakit | **SFX:** pop tiap paket masuk urutan, chime reassembly selesai |
| S6 Payoff | 73–85 dtk | Semua traces menyala serentak, full board visible | Semua komponen aktif: seluruh perjalanan terlihat dari atas — smartphone → DNS → router → kabel → server → kembali | Partikel data di semua jalur | Angka recap: "20 HOP · 550 KABEL · 200.000 KM/S" | Top-down crane naik tinggi → reveal seluruh papan → zoom ke layar smartphone yang menampilkan halaman loaded | **SFX:** riser klimaks + impact resolusi |
| S7 Outro | 86–90 dtk | Fade gelap | Logo AUDIRA sebagai chip emas di tengah board | — | "Created by Agus Dwi R." | Slow push-in ke chip AUDIRA | **SFX:** chime outro |

## Transisi
- S1→S2: Zoom out dari smartphone reveal trace menuju DNS (kontinu, tanpa cut)
- S2→S3: Dolly lateral mengikuti paket keluar DNS
- S3→S4: Crane naik saat papan melebar jadi peta benua
- S4→S5: Follow paket masuk data center zone
- S5→S6: Crane terus naik ke top-down view
- S6→S7: Fade to dark, chip AUDIRA muncul

## Anti-PPT checklist
- [x] Kamera kontinu (tidak ada cut statis)
- [x] Multi-plane (BG/MG/FG/HUD/caption)
- [x] Safe zone 9:16: top 180px, bottom 380px clear
- [x] Caption karaoke sinkron VO
- [x] Brand AUDIRA di dalam dunia 3D (chip emas)
