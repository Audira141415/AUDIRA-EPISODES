# STORYBOARD — AE-073 Bagaimana Rumah Bisa Dicetak dengan Printer 3D? (SATISFYFORGE)

Audio master clock: `studio/src/scenes/ep073/timeline.json` (total 65,0 dtk). Semua batas shot di bawah diambil dari detik kata VO, bukan tebakan. Kode: `studio/src/scenes/ep073/Film.tsx` (kamera, state, HUD, caption) + `FilmWorld.tsx` (dunia 3D).

Layer tetap di semua shot:
- BG: cyclorama pastel peach-lilac.
- Midground: lokasi cetak (slab, gantry, dinding, silo), atau maket potongan dinding di atas plinth.
- Foreground: ember mortar dan cone (blur DOF di shot lebar).
- HUD: kicker kiri-atas (y 268), penghitung "LAPISAN NN" kanan-atas selama dinding dicetak, pill berpanah ke objek.
- Caption: karaoke per kata (kata aktif pink, bounce ≤1.04, jarak kata 22 px), kartu putih di atas batas 380 px bawah.

| # | Detik VO | Bagian | Visual | Kamera | Teks layar | SFX disarankan |
|---|---|---|---|---|---|---|
| H1 | 0,00–3,46 | HOOK | Makro nozzle memeras tali mortar di dinding lengkung (lapisan 15), lalu tarik mundur sampai gantry sebesar truk dan plat AUDIRA terlihat | Makro 1,45 m, el 14°, mengikuti kepala → tarik mundur ke 31 m, el 31° | pill "menyemprot" (dicoret) + "✓ diperas" | pop 0,6; whoosh 1,2 |
| H2 | 3,46–8,07 | HOOK | Close-up samping: tali baru tertumpuk di atas lapisan rapi (corduroy) | Dolly samping 2,7→2,3 m, orbit −42°→−18° | ikon pasta gigi, "lapis demi lapis" | click 3,46 |
| K1 | 8,07–11,15 | KONTEKS | Model 3D hologram lilac muncul di atas tapak kosong | Orbit lebar 22→20 m, el 38° | "model 3D" | riser 8,07 |
| K2 | 11,15–14,97 | KONTEKS | Model dipotong jadi 9 irisan yang merenggang; irisan teratas menyala, jalur kepala cetak pink tergambar dengan titik bergerak | Crane naik 23→20 m, el 34→38° | "lapisan tipis", "jalur kepala cetak" | glitch 11,4 |
| K3 | 14,97–17,15 | KONTEKS | Hologram memudar, slab fondasi dicor naik (beton basah lalu kering) | Orbit 23→21 m, el 30→26° | "fondasi: dicor biasa" | impact 15,1 |
| M1 | 17,15–20,17 | MEKANISME | Mixer berputar di pompa, gumpalan mortar mengalir di selang naik ke tiang | Dolly sepanjang selang dari pompa ke tiang, 10 m | "mortar khusus", "dipompa lewat selang" | whoosh 17,15 |
| M2 | 20,17–24,55 | MEKANISME | Makro lapisan pertama keluar dari nozzle di atas slab | Makro 1,8→1,55 m, el 16→12° | braket "1–4 cm" | pop 22,0 |
| M3 | 24,55–27,25 | MEKANISME | Time-lapse: kepala mengelilingi denah, dinding naik 5 lapis, gantry ikut naik | Orbit lebar 24→22 m, el 42° (bukan top-down) | "mengelilingi denah", "naik 1 lapis ↑" | click 25,93 |
| M4 | 27,25–32,22 | MEKANISME | Selang jadi tembus pandang: adonan cair biru mengalir; tali yang keluar langsung kaku | Orbit makro 6,4→5,8 m di sisi bebas tiang | "cair saat dipompa", "kaku setelah keluar" | — |
| M5 | 32,22–35,89 | MEKANISME | Dinding naik cepat; panah beban oranye menekan lapisan atas, lapisan bawah menahan; panel cetakan bayangan muncul lalu hilang | Samping rendah 4,6→4,0 m, el 7–9° | panah beban, "tanpa cetakan" | pop 34,47 |
| R1 | 35,89–38,13 | REVEAL | Maket potongan dinding di atas plinth pastel: rongga terlihat | Orbit 7,2→5,0 m, el 16→24° | "berongga" | whoosh 35,89 |
| R2 | 38,13–40,70 | REVEAL | Dua kulit menyala mint, penghubung zigzag menyala pink | Orbit 5,0→4,5 m | "kulit luar", "kulit dalam", "penghubung zigzag" | — |
| R3 | 40,70–46,14 | REVEAL | Busa insulasi kuning naik mengisi rongga, besi turun ke rongga, pipa kabel oranye dan pipa air biru | Orbit atas 5,0→5,4 m, el 40→46° | "insulasi", "besi", "kabel" | riser 41,98 |
| P1 | 46,14–49,10 | PAYOFF | Dinding selesai (36 lapis), gantry masih berdiri, pekerja kecil | Crane mundur 26→31 m | kartu "jam cetak ≠ rumah jadi" | — |
| P2 | 49,10–52,26 | PAYOFF | Orbit lebar rumah tanpa atap | Orbit 31→29 m | kartu "BECKUM, JERMAN", hitung 0→100 jam "waktu cetak dindingnya" | — |
| P3 | 52,26–56,48 | PAYOFF | Balok gantry naik parkir, atap logam standing seam turun, 3 jendela dipasang, kru pemasang (ToyPerson) | Orbit 26→24 m | "atap", "jendela", "dipasang pekerja" | impact 52,67 |
| O1 | 56,48–59,25 | OUTRO | Rumah utuh di dalam gantry | Orbit lebar 24→26 m | "dicetak: dinding", "dipasang: atap & jendela" | — |
| O2 | 59,25–61,20 | OUTRO | Kamera meluncur ke plat AUDIRA di balok gantry (≥1,9 dtk di layar) | Glide ke close-up 6,2 m, el 10° | — | — |
| Outro | 61,20–65,00 | OUTRO | Kartu AUDIRA `<Outro>` (shared) | — | — | whoosh 61,2 |

Patuh riset: proses digambar sebagai ekstrusi (tali diperas), tidak ada semprotan; tidak ada klaim "rumah jadi 24 jam"; Beckum = 100 jam untuk dinding saja; atap, jendela, dan instalasi dipasang manual. Tinggi lapis 3D dibesarkan supaya rusuk terbaca di HP; angka di layar tetap "1–4 cm" sesuai riset.
