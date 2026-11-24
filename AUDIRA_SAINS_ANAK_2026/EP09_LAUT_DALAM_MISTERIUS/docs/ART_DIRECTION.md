# ART DIRECTION — EP09 Kenapa Laut Dalam Lebih Misterius dari Luar Angkasa

Style: ABYSSFORGE · Engine: Remotion 4 + React Three Fiber (3D) · 1080×1920 @ 60

## Konsep spasial
Satu sumbu dunia: **sumbu Y = kedalaman**. Film dibuka di luar angkasa (Bulan, astronaut, rover), lalu "jatuh" ke permukaan laut dan terus turun. Tiap babak narasi punya adegan sendiri dengan objek utama berbeda, tetapi arah gerak kamera konsisten: **turun** (kecuali outro yang naik kembali ke cahaya). Kedalaman selalu terbaca lewat meteran kedalaman di sisi kiri.

## Palet (ABYSS_PALETTE)
- Air: `surfaceTeal #0E4A6B` → `twilightBlue #06223A` → `midnightInk #020A14` → `abyssBlack #010409`.
- Cahaya hidup: `lumenCyan #38F6FF`, `lumenMagenta #FF3FD2`, `lumenViolet #8A5CFF`, `lureWhite #D8FFFB`.
- HUD: `hudCyan #6FF3FF` (angka), `hudAmber #FFC46B` (peringatan/tekanan), plat `rgba(2,10,20,0.72)`.
- Ruang angkasa (hook): hitam `#05070D` + bintang, Bulan abu bertekstur.

## Cahaya & material
- `<Finish profile=CYBER_NEON_VOID exposure 1.15 envIntensity 0.35 ao>`; glow hanya dari material emissive (lumen) agar bloom bersih.
- Zona cahaya: god-ray dari atas + directional teal. Zona senja: cahaya sisa biru redup. Zona tengah malam ke bawah: cahaya **hanya** dari makhluk bercahaya + lampu kapal selam.
- Kabut eksponensial berwarna air per kedalaman (pemisah lapisan BG/MG/FG); salju laut sebagai FG.

## Lapisan per frame
BG = warna air + kabut / bintang · MG = objek utama GLB (kapal, ikan, kapal selam, gunung karst) · FG = salju laut, plankton, gelembung · HUD = meteran kedalaman + kartu angka · Subtitle karaoke y = 1300.

## Tipografi
Font proyek (`FONT`, Manrope/Anton). Kartu angka besar 100–130 px, label 42–56 px, semua ≥ 36 px di 1080 lebar. Safe zone atas 236 px, bawah 380 px.

## Brand
- VO menyebut "Audira" di hook dan outro.
- Kapal riset di permukaan bertuliskan **AUDIRA** (papan di lambung) dan kapal selam membawa label AUDIRA.
- `AudiraSignature seed="sains-EP09-laut-dalam"` + `AudiraOutro` 3,2 dtk.

## Larangan
Tidak ada satu objek sepanjang film; tidak ada partikel sebagai subjek utama; tidak ada subtitle saja tanpa kartu data; angka di layar harus sama dengan `research/SOURCE_REGISTER.md`. Ilustrasi skala (palung vs Everest) diberi catatan "ilustrasi".
