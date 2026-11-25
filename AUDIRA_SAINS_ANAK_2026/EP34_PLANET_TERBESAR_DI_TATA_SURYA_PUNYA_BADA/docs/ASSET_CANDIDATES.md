# Asset Candidates — Planet Terbesar di Tata Surya Punya Badai yang Sudah Berlangsung 400 Tahun

Dicari 2026-11-25 lewat `audira_search_assets` (kueri: planet, telescope, satellite spacecraft, topik antariksa). Katalog tidak punya GLB planet, Jupiter, Bumi, atau teleskop.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Pusaran Bintik Merah close-up + Bumi kecil | belum ada GLB (planet) | Bola + shader awan bergaris/pusaran (tekstur prosedural atau peta warna Jupiter berlisensi bebas NASA) |
| c01_intro | Jupiter utuh + Bumi kelereng, wadah berisi bola-bola Bumi | belum ada GLB (planet) | Sphere PBR bertekstur; instanced sphere untuk "1.000 Bumi" (objek bertekstur Bumi, bukan Points polos) |
| c02 | Peta datar Jupiter, panah angin, speedometer HUD | — | 2D HUD di atas tekstur Jupiter equirectangular |
| c03 | Meja astronom abad ke-17, teleskop kuno, buku catatan | belum ada GLB (telescope) | Siluet tanpa wajah; teleskop bisa dimodel sederhana atau ilustrasi 2D cutout |
| c04 | Garis waktu 1665–1713–1831–2024 | — | Kartu HUD 3D/2D |
| c05 | Oval menyusut bertumpuk + Voyager + Hubble | `comm-satellite-fdc2cd` / prop | Pengganti wahana (Voyager/Hubble) sementara; lebih baik siluet wahana generik |
| c06 | Badai Bumi vs Jupiter, potongan atmosfer, wahana Juno | `comm-satellite-fdc2cd` / prop | Potongan melintang = mesh lapisan bertekstur; Juno = satelit generik |
| c06 | Ilmuwan pengamat (opsional) | `astronaut-scientist-47d733` / character | Klip Point untuk menunjuk penggaris kedalaman |
| c07_payoff | Bumi di atas Bintik Merah, hero shot | belum ada GLB (planet) | Sama dengan c00, rim light keemasan + outro AUDIRA |

Saran engine: 3D — subjek utama planet berskala (perbandingan Bumi vs badai, potongan kedalaman) paling kuat dengan R3F sphere bertekstur + HUD; GLB katalog minim untuk antariksa, jadi planet dibangun sebagai sphere PBR bertekstur, bukan aset katalog.
