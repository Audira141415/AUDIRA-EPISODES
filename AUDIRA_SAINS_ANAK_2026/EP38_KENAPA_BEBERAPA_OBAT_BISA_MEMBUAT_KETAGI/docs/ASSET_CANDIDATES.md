# Asset Candidates — Kenapa Beberapa Obat Bisa Membuat Ketagihan

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Otak anatomi + tombol hadiah | — | Tidak ada GLB otak di katalog (hasil "brain" hanya koral). Buat otak prosedural/ilustrasi 2D atau model eksternal berlisensi. |
| c01_intro | Anak makan es krim, main game, berpelukan | character dari `character-anim` (belum dicari spesifik) | Pakai `<AssetCharacter>` clip Cheer/Wave. |
| c02 | Lab penelitian, mikroskop, grafik batang | research-microscope-77ce04 / prop; lab-floor-tile-ad0da8 / building; chemical-spill-kit-3c71d9 / prop | Tikus: tidak ada GLB tikus (pencarian "rat mouse" nihil) → ilustrasi 2D. |
| c03 | Sinaps, molekul, reseptor, transporter | — | Diagram 2D/2.5D kustom; bukan partikel abstrak — bentuk kunci & gembok yang jelas. |
| c04 | Mikrofon raksasa, kenop volume | vintage-microphone-stand-c5ba82 / prop | Kenop volume & telinga: ilustrasi. |
| c05 | Tiga area otak + pedal rem | — | Diagram berlabel HUD. |
| c06 | Dokter, botol obat resep | doctor-d49de0 / character (clip Point); medicine-cabinet-a9f13d / prop | Botol obat: belum ada GLB pil. |
| c07_payoff | Globe, counter 64 juta, outro | classroom-globe-16a96e / prop | Outro card AUDIRA standar. |

Saran engine: hybrid — tidak ada GLB otak/sinaps/tikus di katalog, jadi inti penjelasan (sinaps, area otak) lebih jelas sebagai diagram 2D/2.5D bergaya ANATOMIX/BEDAH, dengan adegan 3D GLB (lab, dokter, mikrofon, globe) untuk c02, c04, c06, c07.
