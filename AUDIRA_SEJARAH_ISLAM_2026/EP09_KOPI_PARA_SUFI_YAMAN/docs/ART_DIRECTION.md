# Art Direction — EP09 Kopi Para Sufi Yaman (FOODFORGE)

## Konsep
Iklan makanan makro yang bercerita: seluruh sejarah kopi para sufi dimainkan di atas satu meja walnut gelap. Cangkir finjan berbintik di nampan kuningan adalah tokoh utama (cover = frame pembuka). Di sekelilingnya ada lima "stasiun" diorama: peta Laut Merah, zawiyah malam, meja dewan 1511, ubin kata, dan peta Jawa. Antar stasiun dipotong (cut) di jeda napas, di dalam stasiun kamera terus bergerak.

## Palet
- Latar studio `#120A06`, dinding dengan kolam cahaya hangat `#94522A`, bokeh `#FFB15C`.
- Kayu walnut berminyak (tekstur prosedural, clearcoat 0,35).
- Kopi `#1A0B05`, crema `#8A5A2E`, biji sangrai `#3A1C0E` / `#1E0D05`, buah kopi `#B3211B`.
- Glasir finjan krem `#EADBC2` berbintik besi, pita `#7A3E1E`; kuningan `#C8963E`; tanah liat `#A2432A`.
- Perkamen `#E2CDA3` dengan laut teal teh `rgba(58,92,96)`; lilin segel merah `#9E1B16`, segel Kairo hijau `#2E5B3A`.
- HUD: plate `#1B0E07`, krem `#FFF1DC`, aksen amber `#F0A04B`.

## Cahaya
Key tungsten hangat dari depan-kanan (bayangan), rim hangat dari belakang untuk uap dan tepi glasir, kicker dingin kecil dari kiri, spot sempit di cangkir hero (subjek selalu nilai paling terang). Tiap stasiun punya spot sendiri (dengan bayangan). Lampu minyak dan api karung sebagai practical (glow di FX layer, bukan tulisan). `<Finish>` DOCUMENTARY_WARM, exposure 0,9, environment 0,45 dengan HDRI warmStudio, AO aktif.

## Material
Polish.tsx: kain (jubah, tikar, karung), clay (bejana, pot), paper (peta, dekret, perkamen). Makanan dan keramik clearcoat 0,6–1,0. Tekstur seeded: grain permukaan, serat kertas, bintik glasir, plester dinding.

## Tokoh dan adab
Tidak ada wajah. Para sufi = figur duduk berjubah kecil dengan peci/serban, kepala polos tanpa fitur, kebanyakan dilihat dari belakang. Ahli fikih dan dokter hanya lewat benda (buku polos tanpa tulisan, lumpang kuningan). Khair Beg dan sultan tidak digambarkan; hanya dekret dan segel. Tidak ada Nabi, malaikat, Ka'bah, atau teks Al-Qur'an; goresan dekret abstrak. Api hanya membakar karung biji, tidak ada orang. Legenda Kaldi hanya kambing kayu mainan yang rebah saat narator menyebut "legenda".

## Tipografi
Judul dan chip: Anton (≥ 40 px). Caption karaoke: Manrope 600 54 px pada plate gelap 94%. Label peta dan ubin: serif (Georgia) dalam tekstur. Semua teks di x 60–1020, di bawah 180 px atas dan di atas 380 px bawah.

## Brand
AUDIRA di dunia 3D: peti kayu "AUDIRA · KOPI JAWA · 1711" (tidak emissive). `<AudiraSignature seed="sejarah-islam-ep09" />` (handle dari channel.json) mulai 4,5 dtk. `<AudiraOutro />` 3,4 dtk terakhir.
