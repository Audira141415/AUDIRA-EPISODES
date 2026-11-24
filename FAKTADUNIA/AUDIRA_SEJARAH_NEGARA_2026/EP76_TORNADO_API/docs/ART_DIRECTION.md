# ART_DIRECTION — EP76 Tornado Api

Style: DISASTERSIM
Engine: Remotion 4 + React Three Fiber (3D), 1080×1920 @ 60 final, 540×960 @ 30 preview.

## Mood
Simulasi bencana yang tenang dan jujur secara fisika. Bukan film horor: api terang dan terbaca, korban tidak pernah diperlihatkan (rule 15, tanpa wajah, tanpa nama).

## Palet
- Malam hutan: langit #1B1F2A → horizon jingga #C8552A, kabut asap #3A2E2A.
- Api: inti #FFF1B0, tengah #FF9A2E, tepi #E2401E (emisif, toneMapped off, bloom halus).
- Asap: #4A4440 → #8A817A, semi transparan.
- Lab: void #0B141C, plinth #16212B, grid #24394A; udara panas oranye #FF7A2E, inflow biru #5EC8FF.
- Tokyo 1923: sore merah-sepia #8E3B24, langit asap #5A4034, kayu machiya #6B4A33.
- Outro: pagi abu-biru #6C8199, matahari pucat, hutan hangus #2B2621.

## Finish
`<Finish>` / FilmScene: COLOR_PROFILES.DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO aktif. Rim light biru tiap adegan, foreground GLB di tiap adegan (pelajaran EP04: jangan gelap abu-abu).

## Bahasa visual
- Pusaran api = LatheGeometry berpilin + ShaderMaterial emisif (noise api bergerak ke atas, berputar) + selubung asap (lathe kedua, transparan). Bukan Points/LineSegments.
- Objek konkret = GLB katalog (pinus, rumah, tiang listrik, pikap ranger, machiya, kura, torii, gerobak sapi).
- Lab penjelas (hanya adegan S4): plinth bulat, panah tabung udara naik (oranye) dan inflow (biru), cincin putar yang menyempit, ToyPerson penari es berputar.

## HUD
- Tag bab kiri atas di y = 262 (di bawah slot AudiraSignature atas), "● AUDIRA FAKTA DUNIA // <BAB>".
- Maks satu kartu data per adegan, top 330, angka ≥ 72 px, keterangan ≥ 36 px.
- Subtitle karaoke y = 1300, 4 kata, aktif #FFC14E.
- Label 3D in-scene ≥ 60 px dari tepi frame dan ≥ 28 px tinggi teks. Brand in-scene: label "AUDIRA FAKTA DUNIA" di S6.
