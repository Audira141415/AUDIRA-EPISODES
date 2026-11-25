# STORYBOARD — EP71 Baarle, Pintu Depan Menentukan Negaramu

Style: SATELLITEBRIEFING · Remotion + R3F · 9:16 · waktu = estimasi, dikunci ulang dari VO di Sesi B.

Multi-scene: 6 adegan berbeda (S1–S6), tiap pergantian babak VO = objek utama dan atmosfer berganti.

| Scene | Waktu | BG / MG / FG / HUD | Kamera | Audio |
|---|---|---|---|---|
| S1 Hook — "pintu depan" | 0–6,5 | BG panel emisif biru + grid. MG: kota Baarle relief dari atas, lalu satu rumah bata dengan pintu menyala amber (reticle). Garis batas putih putus-putus memotong rumah. FG: siluet tiang antena gelap berkap amber, papan "AUDIRA". HUD: header `● AUDIRA // BRIEFING BAARLE`, koordinat 51.44°N 4.93°E, chip `◌ SCANNING` → `◉ TARGET: PINTU`. | Descent logaritmik orbit → atap (2 dtk), pushIn ke pintu, sway ≤ 1,2. | Riser pendek saat descent, whoosh di akhir descent, pop saat reticle pintu kunci, pop chip. |
| S2 Context — peta tambal-sulam | 6,5–21 | BG panel emisif + kabut horizon. MG: peta kota near-nadir; batas NL (blok biru gelap) dan 22 kepingan Belgia menyala amber satu per satu (stagger), lalu 7 kepingan biru di dalamnya + 1 di sudut "Ginhoven". FG: siluet atap gelap lewat parallax. HUD: callout `22 · EKSKLAVE BELGIA`, lalu `7 + 1 · KEPINGAN BELANDA`, label "BELGIA" / "BELANDA" kecil di tepi. | Pull-out dari pintu ke peta (zoom-through reticle), truck pelan kiri → kanan, sway ≤ 1,2. | Whoosh di potongan, tick-pop per kepingan (dibatasi 6–8 pop, sisanya cluster), pop callout 22, pop callout 7+1. |
| S3 Development — 1198 → 1843 → 1995 | 21–43 | BG panel emisif bergeser ke amber redup (lapisan arsip). MG: lahan rawa/padang 1198 bertekstur; bidang "sewa" berkoin menyala amber dan dipisah dari tanah Breda (biru); stempel traktat 1843 (kartu dokumen 3D) mendarat; padang rumput netral 1995 berkedip lalu terkunci jadi kepingan ke-22. FG: siluet pagar/pohon gelap. HUD: callout `1198 · ADIPATI BRABANT`, `1843 · TRAKTAT MAASTRICHT`, `1995 · KEPINGAN KE-22`, garis waktu kecil di atas. | Descent ulang ke lahan (adegan baru), truck menyusuri garis waktu, pushIn ke padang 1995. | Whoosh potongan, thud stempel 1843, pop tiap tahun, impact kecil saat kepingan ke-22 terkunci. |
| S4 Explanation — rumah Loveren | 43–61 | BG panel emisif + grid. MG: satu rumah bata (GLB townhouse/brownstone) dibelah garis batas tepat di pintu; separuh kiri tint amber (B), kanan biru (NL); dua plat nomor `B · 2` dan `NL · 19` muncul di kedua sisi pintu. FG: siluet lampu jalan gelap berkap amber. HUD: chip `ATURAN PINTU DEPAN`, ikon panah "pintu → negara", label "JALAN LOVEREN". | Whip dari peta ke jalan, drone oblique 45° turun ke pintu, orbit pendek ±15° untuk menunjukkan dua sisi. | Whoosh potongan, pop chip aturan, pop × 2 untuk plat nomor (B lalu NL), riser pelan menuju "nomor 19". |
| S5 Payoff — meja kafe & toko | 61–83 | Babak A (61–71): MG teras kafe (GLB bistro table/chair, awning) dibelah garis; jam HUD sisi NL menunjukkan tutup, satu set meja+kursi bergeser melintasi garis ke sisi B. Babak B (71–83): MG toko (GLB corner shop) dibelah: pintu di NL, separuh belakang di B tertutup hatch merah `DITUTUP`; toko kedua berputar 180° sehingga pintu pindah sisi. FG: siluet pot/awning gelap. HUD: jam `NL TUTUP` vs `B BUKA`, callout `2020 · PANDEMI`, stempel `DITUTUP`. | Truck menyusuri teras, pushIn ke meja yang bergeser; cut via scan line ke toko, top-down 70° lalu orbit kecil saat toko berputar. | Whoosh potongan, gesek kursi (slide), pop jam, pop 2020, thud hatch DITUTUP, **riser + impact payoff** saat toko kedua selesai berputar ("supaya tetap buka"). |
| S6 Outro — kembali ke orbit | 83–88 (+ outro card ±3 dtk) | MG: pull-out dari toko → kota → seluruh tambal-sulam menyala amber/biru sekaligus (hero shot), scan line terakhir. FG: tiang antena gelap "AUDIRA". HUD: teks "1 KOTA · 2 NEGARA · 1 PINTU". Lalu outro card AUDIRA (Created by Agus Dwi R.). | Ascent logaritmik terbalik (rumah → orbit), sway ≤ 1,2, settle. | Whoosh panjang ascent, pop teks penutup, chime outro rendah. |

## Momen SFX ringkas (untuk `npm run sfx` dari SHOTLIST)

- Whoosh: tiap potongan S1→S2→S3→S4→S5A→S5B→S6.
- Pop: tiap callout angka (22, 7+1, 1198, 1843, 1995, 2/19, 2020) dan chip.
- Satu riser + satu impact payoff: S5B, "Toko lain memutar pintu masuknya, supaya tetap buka".

## Cover topik (Sesi B)

Pose akhir descent S1: kota relief dari atas, satu pintu amber dengan reticle, garis batas putih memotong rumah, judul "PINTU INI MENENTUKAN NEGARAMU" di sepertiga atas di atas laut gelap.
