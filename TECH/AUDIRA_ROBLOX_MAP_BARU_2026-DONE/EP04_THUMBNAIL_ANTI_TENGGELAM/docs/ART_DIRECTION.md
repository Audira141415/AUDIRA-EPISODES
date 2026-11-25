# Art Direction — EP04 (ARCADECRT)

## Dunia
- Arcade tengah malam di atas air hitam yang memantulkan cahaya.
- Metafora "tenggelam" dibuat harfiah: thumbnail yang gagal (bawaan, clickbait, tidak sesuai isi) benar-benar tenggelam ke air. Yang benar naik dan menyala.

## TV utama
- Satu TV CRT besar di atas plinth bertepi neon cyan.
- Kabinetnya rounded toy-plastic biru tua. Layarnya memakai shader CRT dari kit: barrel, scanline, RGB fringe.
- Badge "AUDIRA | CH-04" di bezel menjadi brand di dalam dunia 3D. Badge ini terlihat di hook, context, main, payoff, dan outro.

## Karakter
- Avatar blocky `BlockAvatar`, skala 0,82: kulit kuning, torso biru dengan emissive cyan, kaki hijau.
- Avatar punya peran aktif di tiap bagian: lari keluar layar, menunjuk, melambai, bersorak, mengetik, berpikir, menekan tombol.
- Pose dan sudut dipilih supaya kedua kaki terbaca terpisah. Hook memakai pose "run" dari sudut 3/4 samping, dan tidak ada pose menghadap depan dengan kaki menempel.

## Palet
| Peran | Warna |
|---|---|
| Ruangan | #07060F |
| Magenta | #FF2E88 |
| Cyan | #2EF2FF |
| Kuning | #FFD23F |
| Oranye | #FF8A1F |
| Hijau fosfor | #5CFF7A |

Thumbnail yang "kalah" diabu-abukan: desaturasi 80–100%, kecerahan 0,4–0,6.

## Cahaya
- Ambient maksimal 0,16.
- Semua yang terang adalah emitter (layar, pad, batang, tag) dengan halo aditif.
- Spot kunci yang hangat mengikuti avatar.
- Point light cyan dan magenta dipakai sebagai rim.

## Finish
- Profil `CYBER_NEON_VOID`, exposure 1, envIntensity 0,55, AO menyala. Ini parameter terbaik di memori ARCADECRT.
- Kabut gelap pada jarak 26–56 unit.

## Tipografi
- Bungee untuk headline dan caption.
- VT323 untuk kicker.
- Arial Black untuk teks di tekstur kanvas 3D.

## Konten layar
- Semua thumbnail dikarang sendiri: pulau langit, obby lava, tycoon, balapan, menara, pets, "ROBUX! PLAY NOW", dan placeholder bawaan.
- Tidak ada logo atau UI asli Roblox.
