# Asset Candidates — Kenapa Manusia Punya Sidik Jari yang Berbeda-Beda

Dicari 2026-11-25 lewat `audira_search_assets`. Katalog tidak punya model tangan/jari/janin/sel: subjek utama perlu dibuat prosedural (mesh ujung jari + displacement garis) atau ilustrasi 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ujung jari menekan kaca, cap sidik jari | — | Tidak ada GLB tangan; ujung jari prosedural (kapsul + normal map garis) atau ilustrasi 2D |
| c01_intro | Dua tangan kembar, dua cap tidak cocok, untai DNA | — | Pencarian "twin" kosong; tangan siluet 2D, DNA helix prosedural (bukan visual utama) |
| c02 | Rahim, siluet janin, zoom ujung jari | — | Belum ada aset janin; ilustrasi 2D lembut lebih aman |
| c03 | Peta permukaan ujung jari, gelombang garis menyebar | — | Shader/garis animasi dari titik awal (reaksi-difusi); pusat visual episode |
| c04 | Sinyal WNT/EDAR/BMP di lapisan kulit | — | Diagram sel berlabel + pola belang Turing |
| c05 | Tiga jari, tiga pola (lengkung/sangkutan/pusaran) | — | Tiga pola 2D bersih + kartu HUD |
| c06 | Uji lab: jari di kaca akrilik; jari mengusap kain | research-microscope-77ce04 / prop; glassware-set-on-rack-963f2d / prop; lab-floor-tile-ad0da8 / building; lab-wall-solid-8bd631 / building; fabric-desk-screen-36a274 / prop | Kit research-lab-9b9b5d untuk set laboratorium; kain = permukaan tekstur |
| c07_payoff | Mozaik ribuan sidik jari jadi satu jari raksasa, label AUDIRA di kaca lab | research-microscope-77ce04 / prop | Mozaik pakai instancing tekstur sidik jari; label AUDIRA diukir di panel kaca |

Saran engine: 2D — subjek inti (garis sidik jari, janin, sinyal sel, tiga pola) tidak ada di katalog GLB dan paling terbaca sebagai diagram/ilustrasi beranimasi; hybrid (set lab GLB di c06) opsional.
