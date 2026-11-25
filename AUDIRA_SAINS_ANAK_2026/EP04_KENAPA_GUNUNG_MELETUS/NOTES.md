# NOTES — Kenapa Gunung Meletus? (`EP04`, seri Sains "Kenapa", @AudiraSains)

> Tahap 10–11. Style DISASTERSIM, engine Remotion + R3F. Final: `FINAL_EP04_GUNUNG_MELETUS.mp4` (80,5 dtk, 1080×1920 @ 60).

## Skor
- Draf: **diterima 3.83 setelah 2 putaran** (putaran 1 juri 3.83, putaran 2 juri 3.17; draf terbaik dipakai, tanpa poles ke-3, sesuai keputusan pengguna 2026-11-23).
- Final (contact sheet 8 frame dari MP4 final, `draft/FINAL_SHEET.jpg`): self 3.83, **juri buta 3.83 LOLOS** (lighting 4, material 4, depth 4, composition 4, motion 4, readability 3).
- Deliver check: GREEN. Satu yellow: `<AudiraSignature handle={channelHandle}>` berupa ekspresi sehingga tidak dicek statis; nilainya @AudiraSains dari data channel, signature terverifikasi VALID.

## Yang berhasil (worked)
- Multi-scene 8 adegan mengikuti detik VO: Krakatau → globe Cincin Api → cutaway lempeng/magma → kaleng soda → Hawaii vs Merapi → Tambora/salju → pos PVMBG → outro sawah.
- Cutaway bumi berlapis (lempeng Indo-Australia menyusup, dapur magma glow) paling kuat untuk lighting dan depth.
- Callout kinetik angka (1883, 45–52% vs 52–63%, Juni 1816, ±0,4–0,7 °C) dan skala status PVMBG 4 warna terbaca jelas.
- Audio G18: gap VO di atas SFX 17,2 LU.

## Yang gagal (failed) + perbaikan (fix)
- Readability juri 3: header HUD frame globe dan Tambora bertabrakan dengan signature AUDIRA kecil; kartu teks bertumpuk (bar silika + label, dua kartu Tambora) menutupi subjek. Fix: sisakan jalur kosong signature di bawah chip header; maksimal satu kartu data di atas subjek per adegan.
- Material: kerucut gunung low-poly abu matte terlihat plastik di 3 adegan, dan framing kerucut di Hawaii/PVMBG mirip. Fix: beri kerucut tekstur batuan/aliran lava dan variasikan sudut kamera.
- Draf putaran 2 (setelah poles S2/S3/S4b/S5a) justru turun ke 3.17: poles tanpa cek kontras teks bisa memperburuk.

## Teknis
- Offset VO: 0. VO terkunci `project/public/audio/vo.wav` 76,63 dtk (200 kata), outro card 77,5–80,5 dtk.
- Parameter render: `node scripts/render-final.mjs --comp=GunungFinal --out=out/FINAL_EP04_GUNUNG_MELETUS.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --gl=vulkan --encoder=nvenc` (4830 frame, 12 part, 4 sekaligus, concurrency 2).
- Audio: VO −15,8 LUFS, SFX ter-duck −33,0 LUFS, master −13,7 LUFS, true peak −2 dBFS.
- Metadata kepemilikan + signature Ed25519 VALID (`AUDIRA-kenapa-gunung-meletus-EP04 | audira.my.id`).
- Kamera (klip 42–60 dtk): skor 5, deadPct 0, medianSpeed 0,08.

## Review terjadwal
Jam upload acuan: Kamis 26 Nov 2026 19.00 WIB (default slot pertama; bila upload diundur, ubah dengan `update_scheduled_task`, jangan buat task baru).
- `review-kenapa-gunung-meletus-24h` — Jumat 27 Nov 2026 19.00 WIB
- `review-kenapa-gunung-meletus-72h` — Minggu 29 Nov 2026 19.00 WIB
- `review-kenapa-gunung-meletus-7d` — Kamis 3 Des 2026 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka; bila tertutup, jalan saat aplikasi dibuka lagi.

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
