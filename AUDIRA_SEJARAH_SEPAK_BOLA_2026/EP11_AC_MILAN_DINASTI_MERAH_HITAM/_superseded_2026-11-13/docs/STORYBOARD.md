# Storyboard — EP11 AC Milan, Dinasti Merah-Hitam (MARBLEMUSEUM)

Format 9:16 1080×1920 @ 60. Safe zone: atas 180 px, bawah 380 px. Kamera terus bergerak (no slideshow), multi-plane (BG galeri marmer / midground trofi / foreground partikel debu emas / HUD / subtitle karaoke). Benang merah: trofi sebagai objek 3D utama, aksen hijau lapangan di HUD. Cover topik = frame hook (dirender setelah acc style).

| Beat | Dtk | VO (ringkas) | Visual | Kamera | HUD / Teks |
|---|---|---|---|---|---|
| Hook | 0–3 | "Tujuh trofi juara Eropa… Ini AUDIRA." | Aula marmer gelap; tujuh trofi emas Piala Eropa berjajar di pedestal, cahaya rim merah-hitam menyapu. | Dolly-in lambat menyusuri barisan trofi, berhenti di trofi ke-7. | Kartu kecil "SEJARAH SEPAK BOLA #11" (safe atas). Angka "7" berpendar. |
| Context | 4–17 | Lahir 1899, Herbert Kilpin, merah-api hitam-takut. | Pedestal tertua, plakat "1899"; kain merah-hitam terurai jadi jersey stilasi; siluet Kilpin (figur sketsa). | Kran naik dari plakat ke jersey berkibar. | Linimasa tipis "1899" di HUD hijau. |
| Main | 18–45 | Sacchi, pressing, trio Belanda, 2 Piala Eropa beruntun. | Lantai galeri berubah jadi papan taktik marmer; 3 bidak bernama Van Basten/Gullit/Rijkaard menekan serempak; 2 trofi (1989, 1990) muncul. | Kamera miring ke atas melihat formasi pressing, lalu swoop ke dua trofi. | Panah pressing berdenyut; label "1989 · 1990". |
| Explanation | 46–70 | Capello 58 tanpa kalah; Ancelotti, Maldini, Pirlo, Kaka; Athena 2007 2–1. | Deret ubin "58" menyala tanpa putus; tiga figur bernama; trofi ke-7 turun dari langit galeri; papan skor marmer "MILAN 2–1 LIVERPOOL · ATHENA 2007". | Tracking menyusuri 58 ubin, lalu push-in ke papan skor. | Counter "58" naik; nama pemain muncul-hilang; "Inzaghi ×2". |
| Payoff | 71–85 | Trofi ke-7; 7 bintang; San Siro; warisan. | Tujuh trofi lengkap kembali; kubah San Siro marmer di latar; debu emas; tulisan "AUDIRA" terukir di alas pedestal (brand dalam adegan). | Kamera naik melingkar (orbit) memperlihatkan seluruh galeri. | "7× Liga Champions" + "San Siro". AudiraSignature halus (safe zone). |
| Outro | 86–91 | "Ini AUDIRA… Episode berikutnya: Barcelona dan sihir tiki-taka." | Galeri meredup; kartu outro AUDIRA; teaser bola berpola tiki-taka muncul. | Pull-back ke kartu outro. | `<AudiraOutro code="SPORTFACTS">` + teaser EP12. |

## Catatan produksi
- Pemain = figur stilasi (ToyPerson/siluet/sketsa) + nama & nomor punggung; tanpa wajah realistis, tanpa logo klub/UEFA asli.
- Finish: environment reflections + AO + bloom + tone mapping; HDRI "warmStudio" untuk pantulan emas trofi.
- Subtitle karaoke per kata tersinkron VO (Audio Master Clock).
- Brand dalam adegan: "AUDIRA" terukir di alas pedestal (payoff) agar tak bisa di-crop.
