# ART DIRECTION — EP68 Bank Keju Credem
Style: FOODFORGE

## Engine & finish
- Remotion + React Three Fiber (3D), kit `src/kits/foodforge`. `<Finish>` profil DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.45, AO aktif (best memori FOODFORGE).
- Kulit roda keju: MeshPhysicalMaterial kuning jerami `#D9A441`, tepi lebih gelap karamel `#A8692A`, clearcoat 0.9, clearcoatRoughness 0.25, bump bintik halus + tulisan titik di sisi roda (tekstur kanvas prosedural, generik "PARMIGIANO REGGIANO", tanpa logo DOP). Potongan dalam (wedge): kuning pucat `#F1D78A`, butir kristal kecil (instanced, glossy).
- Roda = profil lathe dengan sisi cembung dan tepi membulat, BUKAN silinder polos; tiap roda beda sedikit rotasi/warna (instanced, variasi ±6%).
- Rak gudang: kayu cemara madu `#B9814E` dengan serat + bump; tiang logam abu hangat. Brankas: baja gelap `#3A3F44` metalness 1 roughness 0.35, memantulkan env.

## Mood & palet
- Hangat, mewah, sedikit jenaka ("keju = emas"). Cahaya kunci kuning-oranye dari atas rak, rim light hangat di tepi roda (memori: warm rim light wajib).
- Palet: emas keju `#E2B04A`, karamel `#A8692A`, kayu madu `#B9814E`, baja `#3A3F44`, merah bata Italia `#B5523B`, krem dinding `#F3E6CC`, hijau cemara `#3F5E3A`. Malam pencurian: biru-ungu menengah `#3E4470` + senter kuning (bukan hitam pekat; memori: navy/hitam = void datar).
- Uap susu / kabut gudang = bola transparan opacity ≤ 0,25, depthWrite off.

## Tokoh
- Pembuat keju (farmer GLB atau ToyPerson) WAJIB: rambut, alis + mata dicat, celemek putih, topi kain. Pegawai bank: rambut, kemeja + rompi. Penguji keju (battitore): jas putih, palu kecil. Pencuri: siluet bertopi + senter, tetap diberi mata (bukan manekin). Tidak ada wajah orang nyata.
- Tokoh di luar pita subtitle (y 1280–1470), skala tidak menutupi roda hero.

## Komposisi 9:16
- Top safe 236 px bersih; kartu HUD y 260–720; subtitle karaoke y 1300; bawah 380 px bersih.
- FG bawah 20% selalu penuh prop: roda kecil, wedge keju, kain linen, palu, milk churn, buku besar, tumpukan koin.
- Satu subjek terang per frame. Label tidak boleh terpotong frame.

## HUD
- Kartu krem `rgba(255,246,226,0.94)` tinta coklat tua `#3B2414`, garis aksen atas emas `#E2B04A`; serif tebal 88–120 px untuk angka, counter 0.35 dtk. Tiap angka/tahun di VO punya kartu (Hukum 4).
- Chip kecil: "BUKAN EMAS", "NO. SERI 0184-27", "TENOR 24 BULAN", stempel merah "DITOLAK" (prosciutto & botol minyak), "TERTANGKAP".

## Brand di dunia 3D
- Pelat kuningan bertulisan "AUDIRA" di pintu brankas (hook) + papan kayu stensil "AUDIRA · RAK 68" di ujung rak katedral (payoff). `AudiraSignature` lapisan terakhir.

## Larangan
- Logo Credem, logo Consorzio, cap DOP asli, wajah orang nyata.
- Partikel titik / garis / kubus polos sebagai visual utama.
- Satu lokasi sepanjang film (wajib 6 adegan berbeda, lihat STORYBOARD).
