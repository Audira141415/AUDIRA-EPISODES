# STORYBOARD — Samiri dan Anak Sapi Emas (`EP42`)

Style: CHRONICLE

> Waktu = estimasi 200 kata; dikunci ulang ke detik VO Cartesia di sesi B (Audio Master Clock). 7 adegan berbeda, kamera gerak kontinu, multi-plane.

**World layout:**
- **Main stage:** set baru `gurun` (perkemahan Sinai: dune, tenda GLB, unta GLB, obor, altar batu di tengah) dibangun di `project/src/film/sets.tsx` episode ini (bukan memaksa set Nusantara kit; Hukum 5).
- **Chapter stations:** `thur` (lereng Bukit Thur, batu, cahaya puncak), `tungku` (close-up tungku lebur), `gurun` (altar patung), `gurun kosong` (Samiri terasing), `laut` (pantai, abu hanyut; turunan `pantai` tanpa palem kelapa).
- **Between stations:** potong + whoosh di tiap babak; di dalam babak kamera dolly/crane kontinu (core/camera moves).
- **Station visibility:** satu set per adegan, `{t < x && <Scene/>}` per babak (Hukum 3).

**Planes in every shot:**
- **BG:** langit gradasi per mood, Bukit Thur / dune jauh / laut.
- **MG:** patung emas, tungku, kerumunan siluet, tenda.
- **FG:** tiang tenda, obor, bara, pasir tertiup (occluder blur).
- **HUD:** stempel tanggal, angka bergulir, kartu ayat, name tag tokoh.
- **Subtitles:** karaoke kit y 1300, kata kunci emas.

| # | Time (VO locked) | Set | Aksi visual (mute-readable) | Gerak kamera | Audio |
|---|---|---|---|---|---|
| c00 Hook | 0:00–0:05 | gurun malam | Patung anak sapi emas berkilau di altar batu bertulis AUDIRA QISSAH; puluhan siluet sujud mengelilinginya; obor; ring gelombang suara "lenguhan" dari patung. HUD: `QS TAHA 20:88` | low-angle dolly-in ke patung dari balik kerumunan | whoosh masuk, dengung lenguhan rendah, impact kecil di "bersujud" |
| c01 Context | 0:05–0:20 | thur fajar | Siluet Musa (kontur emas) dari belakang mendaki lereng menuju cahaya puncak; stempel `BUKIT THUR`; angka bergulir `30 → 40 MALAM`; potong ke kemah: siluet Harun (kontur cyan) berdiri di depan tenda, name tag `NABI HARUN` | crane naik mengikuti pendakian, lalu track samping di kemah | whoosh di potongan, pop saat angka, tick tiap tambah malam |
| c02 Main | 0:20–0:40 | tungku → gurun | Tangan siluet melempar gelang/koin emas ke wadah; tungku batu menyala, emas cair menetes; patung anak sapi muncul dari cahaya; kerumunan mulai sujud; kartu `QS 7:148 — tidak bisa berbicara, tidak menunjukkan jalan`; name tag `SAMIRI` (kontur merah) | macro push di tungku, lalu orbit setengah lingkar ke patung | api menderu, desis logam, pop teks, lenguhan |
| c03 Explanation | 0:40–1:02 | gurun senja | Harun (cyan) berdiri di depan kerumunan, kerumunan memunggunginya menghadap patung; kartu kutipan `QS 20:90`; Musa (emas) datang dari arah bukit; dua lempeng lauh batu jatuh ke pasir dan debu memercik; dua siluet berhadapan dari jauh | wide statis-drift → push lambat → tilt turun ke lauh | angin gurun, riser kecil saat Musa datang, impact saat lauh jatuh |
| c04 Samiri | 1:02–1:14 | gurun kosong siang | Samiri (merah) menggenggam pasir dari jejak kaki lalu melemparnya; potong: Samiri sendirian di gurun luas, lingkaran jarak kosong di sekitarnya; kartu besar `LĀ MISĀS — "JANGAN SENTUH AKU"` (QS 20:97) | top-down tinggi menjauh (pull-out) memperlihatkan kesendirian | sunyi, angin tipis, satu nada rendah |
| c05 Payoff | 1:14–1:22 | gurun api → laut | Patung dilalap api besar, emas meleleh, abu membubung; potong ke pantai: abu kelabu ditebar ke ombak dan hanyut | crane naik bersama abu lalu turun ke ombak | riser → impact payoff di "dibakar", ombak |
| c06 Outro | 1:22–1:28 | laut fajar | Laut tenang keemasan, ayat `QS 20:98 — Tuhanmu hanyalah Allah`, lalu outro card AUDIRA (2–3 dtk terakhir) | drift pelan ke horizon | ambient lembut, swell outro |
