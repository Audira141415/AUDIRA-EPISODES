# ART DIRECTION — EP70 Danau Nyos, Danau yang Membunuh dalam Semalam
Style: TERRARIUM — toples kaca berpenampang di ruang gelap hangat

## Gagasan

Satu toples kaca di atas meja kayu gelap adalah Danau Nyos: dindingnya memotong kawah sehingga penonton melihat ke dalam air, ke lapisan CO₂ yang tidak pernah terlihat oleh warga. Di sekeliling alas toples, di atas meja yang sama, terbentang lembah miniatur dengan empat desa. Semua adegan hidup di meja ini; kamera bergerak kontinu dari toples ke lembah dan kembali.

## Look

- **Stage:** ruang gelap hangat (tanpa kubah langit kit), latar #120d0a dengan bokeh bola kecil jauh di belakang (meshBasicMaterial + DOF, bukan sprite).
- **Floor:** meja kayu walnut dengan serat kayu; lembah miniatur dipahat dari tanah/lumut di atas meja, satu sisi turun ke arah kamera.
- **Toples:** silinder kaca bening tebal (transmission), leher sempit + gabus. Di dalamnya: dinding kawah batu basal, air atas biru jernih, air dasar gelap hijau-tinta, garis batas lapisan (termoklin) tipis berkilau.
- **Lighting rig:** key hangat 3200 K dari kiri atas (cahaya lentera), rim light dingin biru dari belakang toples untuk memisahkan kaca dari latar, glow magma merah redup dari bawah alas toples.
- **Fog:** kabut tipis hangat di jauh untuk kedalaman; kabut CO₂ (s5–s6) adalah lapisan transparan putih kebiruan yang mengalir rendah, berbeda dari kabut atmosfer.
- **Finish:** `<Finish profile="DOCUMENTARY_WARM" exposure={1} envIntensity={0.55} ao />` (motion memory TERRARIUM).

## Material

| Objek | Material | Detail |
|---|---|---|
| Toples kaca | MeshPhysicalMaterial transmission 1, thickness 0.4, ior 1.5, roughness 0.04, clearcoat 1 | Pantulan environment di tepi, sedikit tint hijau di bagian tebal; goresan halus (roughnessMap) |
| Air atas | MeshPhysicalMaterial transmission 0.9, warna #3d8fb0, roughness 0.1 | Permukaan beriak pelan (normal map seeded) |
| Air dasar (jenuh CO₂) | MeshStandard emissive rendah #0f3a33, opacity 0.85 | Gelembung mikro (instanced spheres) tertahan di batas lapisan |
| Air merah (s6) | warna lerp ke #8a3b22 (karat besi) | Partikel besi tersuspensi kecil, bukan darah: warna karat, bukan merah terang |
| Dinding kawah | Basalt kasar, bump tinggi, roughness 0.9 | Lumut hijau zaitun di bibir kawah |
| Gabus | Kayu gabus berpori, roughness 1, sheen 0.2 | Retak kecil, tali rami melilit leher |
| Pondok desa (GLB) | `polish="matte"`, jerami hangat | Jendela emissive kuning #ffb45a 1.2 → 0 saat padam |
| Pipa degassing | Logam abu kusam, metalness 0.7, roughness 0.45 | Pelampung oranye di permukaan |
| Plakat brand | Kuningan tergores, metalness 1, roughness 0.3 | Ukiran "AUDIRA · DANAU NYOS 1986" di alas toples |

## Palet

| Token | Hex | Kegunaan |
|---|---|---|
| room | #120d0a | latar ruang gelap |
| wood | #4a2f1e | meja walnut |
| lakeTop | #3d8fb0 | air atas tenang |
| lakeDeep | #0f3a33 | air dasar jenuh CO₂ |
| co2 | #cfe3ea | kabut CO₂ (opacity 0.25–0.45) |
| magma | #c2401c | glow magma di bawah alas |
| lamp | #ffb45a | lampu jendela, key light |
| rust | #8a3b22 | danau berubah merah (s6) |
| dawn | #f2b866 | cahaya pagi payoff (s7) |
| hud | #f4efe6 | teks HUD di papan gelap |

## Tipografi (9:16)

- Kartu angka HUD: Inter Tight Bold 120–140 px, angka tabular; sub-line 48 px (bukan 40 px Courier: terlalu kecil di HP, pelajaran EP04).
- Chip lokasi/tanggal: Inter SemiBold 52 px, papan gelap rgba(18,13,10,0.78) + garis aksen #3d8fb0.
- Label 3D di adegan (nama desa): 44 px setara layar, maks 4 label sekaligus dan tidak menumpuk dengan kartu HUD.
- Karaoke VO: y = 1300, 64 px, jarak kata ≥ 0,4 em, bounce kata aktif ≤ 1,04.
- Safe zone: atas 236 px bersih, bawah 380 px bersih.

## Cahaya per adegan

| Adegan | Mood |
|---|---|
| A Hook (s1) | Malam biru dingin, permukaan danau memantulkan bulan; key hangat redup |
| B Penampang (s2) | Rim biru kuat di kaca, glow magma merah di dasar mulai terlihat |
| C Tekanan (s3) | Glow magma naik, gelembung berkilau; kontras naik menjelang gabus lepas |
| D Erupsi (s4) | Kilatan putih busa singkat (≤ 0,14 dtk, peak ≤ 0,4), lalu gelap biru-abu |
| E Aliran gas (s5) | Cahaya bulan menyamping supaya pita kabut CO₂ terbaca sebagai volume |
| F Desa (s6) | Lampu jendela hangat padam satu per satu; fajar pucat oranye pada air merah |
| G Payoff (s7) | Golden hour #f2b866 dari kanan, air kembali biru, air mancur berkilau |
| H Outro (s8) | Pull-back, kehangatan dipertahankan, lalu outro card |

## Penggambaran (aturan keras)

- **Tanpa visual korban**: tidak ada manusia atau ternak tergeletak, tidak ada tubuh, tidak ada wajah. Ternak hanya tampil berdiri di kejauhan sebelum kabut datang (s6), lalu tidak diperlihatkan lagi.
- Korban digambarkan secara simbolik: lampu rumah yang padam, kartu angka yang tenang dan diam (tanpa efek glitch/getar pada angka korban).
- Warna merah danau = karat besi (#8a3b22), bukan merah darah terang.
- Tidak ada wajah orang nyata, logo organisasi, atau bendera dipakai sebagai dekorasi.
- Kabut CO₂ sebenarnya tidak berwarna: label kecil "CO₂ (tak terlihat)" muncul sekali di s5 supaya visualisasi tidak menyesatkan.
- Pemicu erupsi ditampilkan sebagai "?" — tidak ada adegan longsor/letusan yang menyiratkan penyebab pasti.
