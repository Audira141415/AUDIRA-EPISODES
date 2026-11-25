# Art Direction — Samiri dan Anak Sapi Emas (`CHRONICLE`)

Style: CHRONICLE

## Idea
Satu gurun Sinai di kaki Bukit Thur: perkemahan Bani Israil yang gelap dan berdebu, di mana satu-satunya benda yang berkilau adalah patung anak sapi emas, lalu kilau itu dibakar dan hanyut ke laut.

## Look
- **Stage:** gurun pasir bergelombang (dune) warna oker gelap, perkemahan tenda kain, unta, obor. Bukit Thur batu tinggi di BG dengan cahaya di puncaknya. Laut di babak akhir.
- **Floors and stations:** pasir bertekstur fbm + jejak kaki; altar batu di tengah kemah untuk patung; tungku lebur dari batu; pantai pasir basah di babak laut.
- **Lighting:** backlight hangat (key keras dari −z) sehingga tokoh terbaca siluet hitam; rim emas pada patung; exposure ±0.82, envIntensity 0.25 untuk set terang, outline gain 2.2 halo 0.45 fog 0.016.
- **Light by chapter:** hook malam biru dingin + obor oranye; context fajar ungu dengan cahaya putih di puncak Thur; main oranye api tungku; explanation senja merah berdebu; Samiri siang pucat terik kosong; payoff api besar lalu abu kelabu di laut biru; outro fajar keemasan tenang.

## Materials
- **Patung anak sapi (GLB `cow-base`, diskala anak sapi):** emas PBR metalness 1, roughness 0.22, warna #d4a537, env reflection HDRI warmStudio, bloom tipis di tepi.
- **Perhiasan & emas cair:** GLB `gold-coin`, `gold-ingot` + tetesan emas emissive oranye #ffb347 di tungku.
- **Lauh Taurat:** GLB `slab-path-stone` diskala jadi dua lempeng batu, roughness 0.9, sisi terang terkena key.
- **Tenda & unta:** GLB `soldiers-tent`, `canvas-ridge-tent`, `camel-base`, material kain kusam #6a5c4a.
- **Close-up detail:** pasir tergenggam, jejak kaki, bara api, abu melayang, ombak membawa abu.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| primary | #d4a537 | emas patung, kontur Musa |
| secondary | #3fb8c9 | kontur Nabi Harun |
| accent | #c8362a | kontur Samiri, api |
| bg | #1a1622 | langit malam gurun |
| sand | #7a6650 | pasir |

## Typography (font bawaan kit CHRONICLE)
- **Chapter card / tanggal:** stempel besar kit (`[TANGGAL]`), mis. "BUKIT THUR / 40 MALAM".
- **Callout:** kartu angka bergulir `[ANGKA]` 30 → 40 malam; kartu ayat (QS 20:88, 7:148, 20:90, 20:97, 20:98) di panel gelap rgba(11,12,16,.74) + border kiri warna tokoh, ≥ 40 px.
- **Caption 9:16:** karaoke kit di y 1300, kata kunci emas, putus grup > 24 karakter.

## Depiction rules
- Tidak ada wajah Nabi Musa dan Nabi Harun: siluet hitam berkontur (Musa emas, Harun cyan), dari belakang atau samping jauh. Samiri juga siluet (kontur merah).
- Tidak ada adegan memukul; "kepala saudaranya dipegangnya" digambarkan dua siluet berhadapan dari jauh, tanpa close-up.
- Patung boleh tampil jelas sebagai objek, lalu dibakar dan abunya hanyut. Tidak ada kaligrafi lafaz Allah sebagai dekorasi; ayat hanya sebagai teks terjemahan.
- AUDIRA muncul di dunia 3D sekali: tulisan "AUDIRA QISSAH" tergores di altar batu patung (hook) + outro card + `AudiraSignature`.
