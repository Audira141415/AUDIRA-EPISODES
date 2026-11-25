# HANDOFF — EP68 Bank Keju Credem (Sesi B s5, 2026-11-25)

## Selesai di s5
- Stills 13 frame dicek + poles: rak katedral F dibalik (sekarang lorong 2 rak 20 tingkat × 36 m terlihat), adegan E dibangun ulang (rumput depan dibuang supaya cutaway terowongan terlihat; dinding bata gudang malam, papan MAGAZZINO, siluet cemara, bulan, 4 lampu kerja terowongan, lentera lebih terang; truk dipindah ke 5.1,0,-0.4; mobil polisi boxy-sedan-70s tint navy + lightbar kedip; polisi di 4.4,0,1.15), FG D: brankas hitam diganti 2 roda bertumpuk.
- Kartu HUD: judul pakai warna `ink` gelap (kontras audit:layout), tahun (1953, 2009) tanpa titik ribuan dan tanpa hitung naik (`count.year`).
- OUTRO_SECONDS 3 → 2 (card 73.5–75.5, VO selesai 73.51); kartu €0 sampai 73.4. Gallery.tsx + Ep68Gallery dihapus.
- Cover topik `style/cover-topic.png` 1080×1920 (KejuFinal 61,2 dtk) + `cover_1080x1350.png`; STYLE_DECISION diperbarui.
- `docs/STORYBOARD.md` diretime ke detik VO; `docs/SHOTLIST.md` 17 baris, lint 0 RED (hanya yellow vo-cut + hook); `out/cues.json` ditulis.
- `npm run sfx` → `public/audio/sfx.wav` 75.5 s, 36 bunyi, −26.0 LUFS, TP −7.2.
- Draf r1: `npm run draft -- KejuPreview --frames=2s,9.5s,17s,24s,38s,47s,55s,61s,66s,70.5s` (hasil di `draft/`).

## Sisa
1. `draft/THEME_CHECK.md` (G22) untuk 10 frame di atas, record_score self, juri buta (F:/AUDIRA-SKILL-MOTION/qa/jury.md; kirim hanya DRAFT_SHEET.jpg, style/cover-reference.png, ceilings/reasons look.json, camera.json, kolom Frame|Detik|Kata VO) → record_score judge jury. Maks 2 putaran; terbaik ≥3.5 lanjut.
2. Handover newSession → Sesi C (gerbang acc tahap 9: contact sheet, skor, durasi 75,5 dtk, G18c).

---

# HANDOFF — EP68 Bank Keju Credem (Sesi B s3 → s4, 2026-11-24)

Style: FOODFORGE · 3D Remotion + R3F · channel FAKTADUNIA. Batasan: sentuh HANYA folder EP68; jangan edit SERIES.json seri, MASTER_INDEX.md, episode lain; jangan commit/ganti branch. Gerbang acc pengguna hanya sebelum render final (Sesi C). JANGAN render final.

## Selesai di s3 (tahap 7 bagian kode)
- `src/core/assets/AssetModel.tsx`: klon pakai `SkeletonUtils.clone` (sebelumnya karakter/sapi skinned menumpuk di origin). Galeri `out/gal/f1.png` dicek: semua 21 GLB oke; karakter GLB (farmer, clerk, villager, guard) T-pose → TIDAK dipakai, tokoh pakai `ToyPerson` (Maker = celemek + topi kain; penguji = jas putih). hand-lantern GLB terbaca seperti peti → tidak dipakai (lentera = bola emissive + pointLight).
- `src/episode/timeline.ts`: FILM_SECONDS 75.5, OUTRO 3, 16 SHOTS adegan A–F (detik VO), 29 CARDS (tone gold/red/blue/green, `stamp` = kartu gaya stempel).
- `src/episode/parts.tsx`: komponen sauna EP59 dihapus, palet C baru (cheese, caramel, paste, woodHoney, steel, brick, cream, cypress, copper, concrete, cobble, soil, night...).
- `src/episode/cheese.tsx`: Wheel (lathe cembung, rind clearcoat 0.9 + tekstur titik "PARMIGIANO REGGIANO" generik), WheelInstances (InstancedMesh ±6%), Rack (papan kayu + tiang + roda), Wedge (+kristal), CopperVat, Stamp (slam-in, oval/glow), Prosciutto, OilBottle.
- `src/episode/scenes.tsx`: SceneA brankas (dinding berlubang + pintu bundar berengsel buka 0.5–2.7 dtk, pelat kuningan AUDIRA, rak kiri-kanan, piramida roda, FG peti koin/safe/wedge), B alun-alun (classical-bank + rumah two-story-house tint, cemara, truk, roda menggelinding 18.6–21.2), C peternakan (barn, 2 sapi, churn tuang 25.6–27.4, bejana tembaga + curd linen, timbangan jarum) + ruang pematangan x 5.3–10.4 (rak, kalender BULAN 1→24, gembok koin 32.35), D meja kredit (troli, roda pindah ke meja 36.4, neraca seimbang 38.7, stempel N. 0184-27 43.08, prosciutto 44.4 + minyak 45.0, DITOLAK 47.04, kabur 48.6), E terowongan malam (cutaway tanah, pencuri jongkok + lentera, 5 roda menggelinding 52.5+, truk, polisi + sirene 57.6), F katedral (2 rak 20 tingkat × 36 m, shaft cahaya, papan "AUDIRA · RAK 68", roda di cradle, palu tok 65.42/65.71/66.0, cap bakar oval "UJI LOLOS" 66.73 + asap).
- `src/episode/KejuFilm.tsx` (pola SaunaFilm EP59: LOOK per adegan FOODFORGE, kartu krem + serif, DISPLAY ejaan Credem/Reggio/Parmigiano/Reggiano/Prosciutto/AUDIRA, AudiraSignature seed ep68-bank-keju tanpa prop handle). Root.tsx: `KejuPreview` + `KejuFinal` terdaftar. `npx tsc --noEmit` bersih untuk src/episode.
- Komposisi BELUM pernah dirender: posisi/skala tokoh & FG belum diverifikasi.

## Sisa langkah Sesi B (s4)
1. Stills: `npm run stills -- out/s 2s,9s,13s,17s,24s,30s,38s,46s,52s,56s,61s,66s,70s KejuPreview` → lihat sebagai satu contact sheet kecil, poles (FG bawah 20% penuh prop, label tidak terpotong, tokoh tidak menutupi roda hero, ToyPerson skala 0.62 cek tinggi, kamera tidak menembus dinding A/D/F). Setelah adegan jadi: hapus `src/episode/Gallery.tsx` + entri `Ep68Gallery` di Root.tsx.
2. Cover topik: `npm run cover -- KejuPreview --episode=..` (±61 dtk katedral) → `style/cover-topic.png`; update STYLE_DECISION.
3. Retime `docs/STORYBOARD.md` ke detik VO (tabel timing di HANDOFF lama/`timeline.ts` SHOTS); tulis `docs/SHOTLIST.md` format EP59 + lint `node scripts/shotlist-lint.mjs ../docs/SHOTLIST.md --timing=public/audio/vo.timing.json --script=../docs/SCRIPT.md`; `npm run sfx`. Semua docs baris `Style: FOODFORGE`.
4. Tahap 8: `draft/THEME_CHECK.md` (G22), `npm run draft -- KejuPreview --frames=2s,9.5s,17s,24s,38s,47s,55s,61s,66s,70.5s`, record_score self (FOODFORGE, episode sejarah-negara-EP68, ceilings + camera), juri buta subagen (F:/AUDIRA-SKILL-MOTION/qa/jury.md + draft/DRAFT_SHEET.jpg + style/cover-reference.png) → record_score judge jury. LOLOS ≥3.8 tanpa aspek <3; maks 2 putaran; terbaik ≥3.5 → lanjut.
5. Akhir B: handover newSession → Sesi C (gerbang acc tahap 9).

## Timing VO (kata kunci, detik)
A 0–11 (brankas 1.67, keju 3.71, bukan emas 4.92, uang tunai 6.53, €325 juta 8.76–10.11) · B 11–22 (Kredem 12.20, Rejio Emilia 13.31, 1953 16.58–17.51, roda keju 18.78, jaminan 20.85) · C 22–33.4 (40 kg 23.71, 550 L 25.74, 12 bulan 29.23, 2 tahun 30.46, tertahan 32.38) · D 33.4–49.9 (bank masuk 33.93, menitipkan 35.82, 80% 38.73, 24 bulan 40.99, nomor seri 43.08, Proshuto 44.41, minyak 45.06, ditolak 47.04, dicuri 48.64) · E 49.9–58.8 (2009 51.83, terowongan 53.36, 570 roda 55.12, tertangkap 57.68) · F 58.8–72.5 (500.000 roda 59.69, katedral 62.06, bulan ke-12 63.73, palu 65.42, cap bakar 66.73, tidak rugi 69.86) · outro 72.5–75.5 (VO "Audira" 73.16).
