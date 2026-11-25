# Art Direction — Musa dan Api di Bukit Thur (`PAPERWORLD`)

Style: PAPERWORLD  <!-- G21: ID style aktif (sama dengan STATUS.json data.style). Ganti style = tulis ulang file ini. -->

## Idea
Satu diorama kertas gurun–gunung pada satu malam: kamera berjalan dari perkemahan keluarga di dataran, naik jalan setapak ke lereng Bukit Thur, sampai ke pohon bercahaya di tepi lembah Thuwa. Api adalah benda pembawa (carrier) yang terlihat di setiap adegan dan menuntun kamera, lalu berubah makna: dari api penghangat menjadi cahaya risalah.

## Look
- **Stage:** diorama kertas berlapis di atas papan gelap. Langit = kartu biru malam bergradasi dengan bintang lubang tusuk (cahaya tembus dari belakang). Bulan sabit kertas digantung benang. Gunung = 4–5 lapis kartu siluet (PaperHill) dari indigo ke ungu tua, makin jauh makin pucat oleh haze.
- **Floors and stations:** pasir kertas krem-oker bertekstur serat dengan lipatan bukit pasir; jalan setapak batu kertas zig-zag naik lereng; lembah Thuwa = cekungan kartu hijau zaitun gelap dengan rumput potong.
- **Lighting:** key = sumber api (pointLight oranye 2200–2600 K, shadow on) yang selalu bermotivasi; fill biru bulan dingin dari kanan atas (intensitas rendah); rim pucat di tepi kartu siluet. Grade DOCUMENTARY_WARM, exposure 0,9–1,0, envIntensity 0,25, AO on, bloom halus hanya pada api/pohon/tangan.
- **Light by chapter:**
  - Hook: gelap pekat biru, satu titik api oranye kecil di lereng (kontras maksimal).
  - Context: cahaya bulan dingin, angin (pasir kertas beterbangan), tenda + ternak tanpa api.
  - Main (pendakian): lentera kecil Musa + api di atas makin besar; bayangan panjang ke bawah lereng.
  - Lembah Thuwa: pohon menyala putih-emas dari dalam (emissive) tanpa terbakar; cahaya menimpa tanah suci, bayangan memendek.
  - Tanda (tongkat/tangan): pool cahaya sempit (spot) di tanah; tangan memancarkan putih kebiruan bersih.
  - Payoff (diutus): fajar ungu-emas mulai di cakrawala arah Mesir; siluet istana/piramida kertas jauh.
  - Outro: kembali ke api di lereng, kamera menarik mundur ke wide penuh.

## Materials
- **Musa (figur kertas):** puppet kertas siluet berjubah cokelat tanah + selendang krem, kepala tertutup tudung; TIDAK ada wajah (kepala kartu polos, selalu dari belakang/samping siluet atau di luar frame). Lipatan jubah sebagai hinge, tepi potong pucat, serat.
- **Pohon di lembah (hero):** pohon kertas berduri (bentuk semak akasia) dari 3 lapis kartu; daun = potongan kertas tipis translusen yang menyala dari dalam (emissive emas-putih, bloom), tidak hangus.
- **Api di lereng (carrier):** GLB `campfire-4390aa` untuk kayu + lidah api kertas berlapis (3–4 kartu oranye/kuning, berayun) + pointLight. Dari jauh hanya titik.
- **Tongkat → ular:** tongkat = batang kertas cokelat bergaris serat. Ular = rantai segmen kertas (Cut S.path) bersisik cetak, berliku sinus, tidak berwajah seram (adab, anak-anak juga menonton).
- **Tangan bercahaya:** close-up lengan bersarung jubah + tangan kartu krem; keluar dari lipatan jubah memancarkan putih (emissive + bloom), tanpa wajah di frame.
- **Terompah:** sepasang sandal kertas kulit cokelat dengan tali, diletakkan di pasir kertas (close-up).
- **Close-up detail:** lentera tangan (`hand-lantern-cdbe1a`), tenda (`canvas-ridge-tent-f0df0d`), domba/kambing (`sheep-base`, `goat-base`), unta (`camel-base`), semak (`creosote-bush-5b17d5`, `bare-thorn-bush-91a238`), batu (`basalt-boulder-a1929c`). Semua GLB diberi material `paperFace` (grain + serat) supaya menyatu dengan dunia kertas.

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| night | #141B3A | langit, latar gelap |
| indigo | #2B3166 | lapis gunung jauh |
| plum | #4A2F5C | lapis gunung dekat, fajar |
| sand | #D9B98A | pasir kertas |
| ochre | #B07A3E | jalan batu, tongkat, terompah |
| fire | #FF8A2A | api, key light |
| ember | #FFC861 | inti api, aksen HUD |
| holy | #FFF4D6 | pohon bercahaya, tangan |
| olive | #4E5B33 | lembah Thuwa |
| ivory | #F7EBD6 | haze BG/MG, kartu HUD |

## Typography (bundled)
- **HUD/callout:** Anton (judul kartu, angka "9", nama tempat), tinggi ≥ 56 px.
- **Kutipan ayat (terjemahan makna):** Lora Italic 44–48 px di pita kertas ivory, sumber surat:ayat 34 px.
- **Caption karaoke:** pill gelap di y 1300, kata aktif ember #FFC861, jarak kata ≥ 0,4 em, bounce ≤ 1,04.

## HUD callouts (wajib, Hukum 4)
Pita kertas sobek (ivory, bayangan jatuh) di zona atas y 236–520: `QS AL-QASAS : 29` · `BUKIT THUR` · `LEMBAH SUCI THUWA · QS TAHA : 12` · `TANDA 1 · TONGKAT` · `TANDA 2 · TANGAN` · stempel besar `9 MUKJIZAT · QS AN-NAML : 12` · `QS TAHA : 24` · `HARUN · PENDAMPING`. Kata AUDIRA di dunia: cap kertas pada kotak perbekalan di perkemahan + papan kartu di outro.

## Aturan penggambaran (adab)
- Musa: tanpa wajah, siluet atau dari belakang. Keluarga: siluet kecil di dekat tenda, tanpa wajah.
- Panggilan Allah TIDAK divisualkan sebagai sosok, suara, atau wajah: hanya cahaya dari pohon + pita teks terjemahan makna ayat.
- Firaun tidak digambarkan; hanya istana/piramida kertas jauh sebagai arah tujuan.
- Harun: siluet kedua yang muncul samar di fajar (tanpa wajah).
- Ular tidak dibuat menyeramkan berlebihan (tanpa taring/darah).
