# Asset Candidates — Misteri Dark Matter: 27% Alam Semesta yang Tak Terlihat

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Lapangan galaksi meredup, irisan 5% menyala | prosedural (sprite galaksi + skybox bintang) | Tidak ada GLB galaksi di katalog; pakai tekstur/sprite galaksi berlayer, bukan Points polos |
| c01_intro | Bintang, planet, sepatu; pie chart 5/27/68 | comm-satellite-fdc2cd / prop; regolith-boulder-1f1f14 / prop | Planet = sphere PBR bertekstur; pie chart 3D sebagai DATAPHYSICAL card |
| c02 | Gugus Coma + name plate Zwicky | senior-scientist-631736 / character (siluet, clip Point) | Tanpa wajah asli; name plate teks |
| c03 | Galaksi spiral + kurva rotasi datar | starkeeper-6c3760 / character (opsional); field-console-a92adc / prop | Grafik kurva rotasi sebagai HUD |
| c04 | Komidi putar dengan penumpang | belum dicari (carousel tidak ditemukan di pencarian awal) | Cari "carousel"/"amusement" di tahap 7; alternatif: rakit dari prop taman |
| c05 | Tabrakan Gugus Peluru, gas pink vs massa biru | prosedural (volumetrik awan) | Warna mengikuti citra Chandra: pink = gas, biru = massa |
| c06 | Lensa gravitasi, cahaya melengkung | astronaut-scientist-47d733 / character (clip Point) | Efek distorsi shader di atas latar galaksi |
| c07_payoff | Jaring kosmik + outro AUDIRA | survey-flag-fa500f / prop (label AUDIRA di bendera) | Brand di dalam adegan lewat bendera/label HUD |

Saran engine: 3D — subjek ruang angkasa butuh kedalaman spasial (gugus, rotasi, lensa); objek galaksi prosedural bertekstur + karakter/prop GLB sebagai skala manusia, dengan HUD data 2D di atasnya.
