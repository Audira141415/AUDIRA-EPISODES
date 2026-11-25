# ART DIRECTION — EP01 PENGGANTI GIBRAN WAPRES

**Style:** BROADCASTFORGE (#82)  
**Engine:** Remotion + R3F  
**Format:** 9:16 (1080×1920) @ 60 FPS  
**Durasi:** ~87 detik  

---

## Visual Identity Episode Ini

Breaking news political studio. AUDIRA NEWS. Nuansa dark navy + cyan + breaking red. Layar LED melengkung di belakang anchor memperlihatkan grafik politk dan data kandidat bergiliran. Mood: tegang, otoritatif, informatif.

Pembeda dari episode sebelumnya:
- LED wall menampilkan 10 name card kandidat berurutan (bukan peta atau data bar)
- "CEK FAKTA" banner merah besar di Scene 4 — first use
- HUD countdown digital ke 2 Desember 2026 di Scene 5

---

## Finish & Post

```json
{
  "finishProfile": "CYBER_NEON_VOID",
  "exposure": 1.0,
  "envIntensity": 0.45,
  "hdri": "studio",
  "ao": true,
  "background": "#070A0F"
}
```

## Palette

| Token | Hex | Dipakai di |
|-------|-----|-----------|
| studioVoid | #070A0F | Background studio, fog |
| breakingRed | #D32F2F | LIVE bug, BREAKING NEWS, HOAKS stamp |
| cyanAccent | #00E5FF | LED strips, scanline, countdown |
| broadcastNavy | #0B2545 | Desk, LED wall body |
| liveAmber | #FFA000 | Ticker FLASH, location |
| headlineWhite | #FFFFFF | Headline utama |

## Camera Multi-Cam

- S1 Hook: Jib descent high `[0,3.4,8.6]` → anchor two-shot `[0,1.65,6.6]` selama 3.5s
- S2 Context: Anchor MCU `[0,1.6,5.2]` fov 40
- S3 Nama: Over-the-shoulder ke wall `[-1.8,1.5,5.4]` target `[0,0.6,-2.2]` fov 44
- S4 Hoaks: Anchor MCU ketat `[0,1.6,5.2]` fov 38
- S5 Payoff: Low angle `[0,0.9,6.4]` target `[0,1.4,0]` fov 44 → wide
- S6 Outro: Cut ke logo AUDIRA

## Depth Layers (per KIT.md)

- **Layer 1 (BG):** Curved LED wall z≈−2.2 — grafik kandidat / CEK FAKTA / countdown
- **Layer 2 (MG):** Anchor ToyPerson + desk riser
- **Layer 3 (FG):** LowerThirdTicker3D + HUD overlay + name chips

## Safe Zone

- Top safe: y ≥ 180px (top bar LIVE + clock)
- Bottom safe: y ≤ 1540px (ticker akhir)
- Subtitle karaoke VO: y = 1300px

## Rule 15 Compliance

- Tanpa wajah/foto orang nyata — name plates hanya teks
- Tanpa logo partai asli — label partai hanya teks sans-serif
- Angka on-screen: 60 hari, 10 nama, 2 Desember 2026, T-11 hari (semua dari SOURCE_REGISTER)
- Konten netral — tidak memihak kandidat manapun

## Anti-Reupload

- `<AudiraSignature seed="pengganti-gibran-wapres" handle="@audira" />`
- Nama AUDIRA di HUD news channel bug sejak frame 0
- VO menyebut "AUDIRA" di outro
- Metadata MP4: title, artist, copyright, comment sesuai pipeline poin 2.4
