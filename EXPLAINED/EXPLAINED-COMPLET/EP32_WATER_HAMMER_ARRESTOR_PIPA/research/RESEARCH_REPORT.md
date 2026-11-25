# Research Report — EP32 Water Hammer Arrestor Pipa

Tanggal: 2026-11-13. Fakta bernomor merujuk `SOURCE_REGISTER.md`.

## Ringkasan inti

Water hammer (palu air) adalah lonjakan tekanan saat air yang mengalir dihentikan mendadak, biasanya oleh katup yang menutup cepat (#1). Air hampir tidak bisa dimampatkan (#4), jadi momentum kolom air berubah menjadi gelombang tekanan yang merambat lebih dari seribu meter per detik dan memantul bolak-balik di pipa, terdengar sebagai dentuman di dinding (#2, #5). Di rumah, pemicunya mesin cuci, mesin cuci piring, dan kloset (#2).

Besarnya bisa dihitung dengan persamaan Joukowsky: untuk setiap 1 m/s aliran yang dihentikan seketika, tekanan naik sekitar 14 bar (#6, hasil hitung). Lonjakan berkali-kali lipat tekanan normal ini mempercepat kerusakan katup, pemanas air, dan sambungan (#7, #8).

Water hammer arrestor adalah tabung kecil yang dipasang dekat katup (#13). Di dalamnya ada bantalan udara atau nitrogen bertekanan yang dipisah permanen dari air oleh piston ber-O-ring, diafragma, atau bellows (#9, #10, #12). Saat aliran berhenti, air masuk ke tabung dan memampatkan bantalan itu, sehingga momentum habis perlahan dan tidak menjadi dentuman (#9).

Pemisah permanen penting karena ruang udara dari sepotong pipa tegak lama-lama kehilangan udaranya dan dinilai tidak cukup melindungi (#14). Versi rumah tangga hanya setinggi sekitar 10 cm (#11).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1. Mengalir | Kolom air bergerak membawa momentum | #3 |
| 2. Katup menutup cepat | Katup mesin cuci/solenoid menutup dalam puluhan milidetik | #2, #19 |
| 3. Lonjakan | Air tak termampatkan; momentum jadi tekanan (Joukowsky) | #4, #6 |
| 4. Gelombang | Merambat >1000 m/s, memantul bolak-balik, terdengar dentuman | #2, #5 |
| 5. Arrestor menerima | Air terdorong masuk tabung, mendorong piston | #9, #10 |
| 6. Bantalan udara | Udara/nitrogen tersegel termampatkan, menyerap momentum | #9, #11, #12 |
| 7. Tenang | Aliran melambat tanpa dentuman; piston kembali | #9 |

## Sejarah singkat

- Istilah Prancis/Italia berasal dari pompa hidram ("pukulan domba jantan") (#18).
- Teori: von Kries 1883, Zhukovsky dan Frizell 1898, Allievi 1902 (#17).
- Standar arrestor modern: ASSE 1010, diwajibkan kode plumbing AS dan Kanada (#15).

## Miskonsepsi yang dibantah

- "Dentuman di pipa itu karena pipa longgar atau ada udara." Penyebab utamanya air yang berhenti mendadak (#1, #2). Dipakai sebagai hook.
- "Cukup sisakan pipa berisi udara." Ruang udara biasa kehilangan udaranya; kode Kanada menilainya tidak memadai (#14).
- "Bunyinya cuma mengganggu." Lonjakan berulang memperpendek umur katup, pemanas air, dan sambungan (#8).

## Angka untuk visual payoff

- Sekitar 14 bar per 1 m/s aliran yang dihentikan seketika (#6, sebut "sekitar"/"menurut hitungan").
- Gelombang lebih dari 1000 m/s (#5).
- Tabung ±10 cm melawan lonjakan itu (#11).

## Catatan naskah

- **Jangan disebut pasti:** "lima kali tekanan kerja" (#7, satu sumber), volume 1,4 inci³, "piston paling banyak dipakai" (klaim pabrikan).
- **Tidak dipakai:** contoh 437 psi (satuan imperial, satu sumber), sejarah teori, PLTA/surge tank (melebar).
- **Pelafalan:** water hammer → "woter hemer"; arrestor → "arestor".
- **Batas episode:** tidak membahas leher angsa/P-trap (EP39) atau dispenser (EP19).
- **Ide visual 3D kasar:** potongan pipa transparan di balik dinding; air sebagai "kereta" partikel biru; katup menutup, partikel memadat, cincin gelombang merah melesat dan memantul; tabung arrestor dipotong melintang, piston naik menekan bantalan udara bercahaya; angka "±14 bar" muncul di manometer.
