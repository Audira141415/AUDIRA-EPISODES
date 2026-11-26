# Research Report — Kenapa Kereta Tidak Bisa Mengerem Mendadak

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata, tidak mengangkat kecelakaan tertentu).

## Sumber utama

- **Operation Lifesaver, Inc.** (AS): jarak henti kereta barang, bobot lokomotif dan rangkaian, hak jalan kereta (#1). Situs FRA (railroads.dot.gov) menolak akses otomatis (HTTP 403), jadi angka FRA tidak dipakai langsung.
- **UU 23/2007 Perkeretaapian Pasal 124** dan **UU 22/2009 LLAJ Pasal 114 + 296**, teks resmi PDF JDIH BPK (#2, #3).
- **Yuan dkk. 2021, Urban Rail Transit (Springer, open access)**: model gesek dan adhesi roda-rel (#4).
- **The Highway Code (GOV.UK)**: jarak henti tipikal mobil sebagai pembanding (#5).
- Pendukung MEDIUM: rilis KAI via ANTARA (#6, #7, #8), Kompas.com (#10), Wikipedia "Adhesion railway" (#9), hitungan sendiri (#11).

## Fakta terverifikasi

1. Kereta barang rata-rata di 55 mph (≈88 km/jam) butuh lebih dari 1 mil (≈1,6 km) untuk berhenti (#1).
2. Kereta penumpang di 120 km/jam: jarak pengereman ideal 800–1.200 m (rilis KAI, #6).
3. Lokomotif rata-rata ≈ 200 ton; rangkaian kereta bisa sampai 6.000 ton; rasio mobil : kereta ≈ kaleng minuman : mobil (#1).
4. Koefisien gesek/adhesi baja-baja di rel umumnya 0,35–0,5, bisa turun sampai 0,05 dalam kondisi ekstrem (#9); adhesi turun saat kondisi lembap (contoh parameter model 0,31 sangat kering → 0,14 lembap) dan saat kecepatan selip naik, sehingga roda yang terkunci justru mencengkeram lebih lemah (#4).
5. Mobil 80 km/jam: jarak henti tipikal 53 m (15 m berpikir + 38 m rem); 96 km/jam: 73 m (#5).
6. UU 23/2007 Pasal 124: di perpotongan sebidang, pemakai jalan wajib mendahulukan perjalanan kereta api (#2).
7. UU 22/2009 Pasal 114: pengemudi wajib berhenti saat sinyal berbunyi / palang mulai menutup / ada isyarat lain, mendahulukan kereta api, dan memberi hak utama ke kendaraan yang lebih dulu melintasi rel; Pasal 296: pelanggaran huruf a, kurungan ≤ 3 bulan atau denda ≤ Rp750.000 (#3, #10).
8. Januari–22 Juni 2026: 118 dari 134 kecelakaan di perlintasan sebidang (88%) dipicu tindakan menerobos (data KAI, #7).
9. Hitungan sendiri (#11): perlambatan rata-rata kereta barang ≤ ±0,19 m/s², kereta penumpang ±0,46–0,69 m/s², mobil ±6,5 m/s²; jarak henti kereta barang > 20× mobil.

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "butuh ratusan meter" meremehkan. Kereta penumpang di 120 km/jam saja butuh 800–1.200 m (#6), kereta barang di ≈88 km/jam lebih dari 1,6 km (#1). Hook dikoreksi jadi "**bisa butuh lebih dari satu kilometer** untuk benar-benar berhenti".
- **Pasal hak utama**: brief menyebut "UU LLAJ Pasal 114" sebagai pasal hak utama; teks resminya memang Pasal 114 (berhenti + mendahulukan kereta). Kalimat "pemakai jalan wajib mendahulukan perjalanan kereta api" ada di **UU 23/2007 Pasal 124**, bukan 114. Keduanya terverifikasi di PDF JDIH BPK.
- **"Baja-baja licin"**: koefisien baja-baja di rel (0,35–0,5, #9) tidak serendah yang sering dikira; yang membuat kereta lambat berhenti adalah kombinasi bobot sangat besar per titik kontak kecil, adhesi yang anjlok saat basah/terkontaminasi, dan batas rem agar roda tidak terkunci. Naskah memakai "jauh lebih licin daripada ban karet di aspal" tanpa angka koefisien ban (tidak ada sumber HIGH yang dibuka untuk ban-aspal). Bila produser ingin angka, cari sumber koefisien ban-aspal dulu.
- **Angka 800–1.200 m** berasal dari rilis KAI (PR Wire) di ANTARA, bukan regulasi/teknis DJKA. Cari dokumen teknis DJKA/Permenhub atau buku Perka sebelum produksi; bila tidak ada, label HUD "menurut KAI".
- **Angka OLI berbasis AS** (kereta barang Amerika, lebih panjang dan berat dari rangkaian di Indonesia). Label HUD "kereta barang AS (Operation Lifesaver)".
- **Pembanding mobil** dari Highway Code Inggris (kondisi umum, bukan uji Indonesia); kecepatan tidak persis sama (80 vs 88 km/jam), maka rasio ditulis "lebih dari 20 kali" dan diberi label hitungan.
- **Rule 15**: tidak menyebut atau memvisualkan kecelakaan tertentu (misal insiden Bekasi Timur / Siantar yang muncul di hasil pencarian). Data 118/134 (#7) hanya cadangan untuk caption, tidak di VO.
- **FRA**: halaman FRA tidak bisa dibuka (403), klaim "FRA" di brief diwakili Operation Lifesaver (mitra FRA).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| > 1 km | Hook: jarak henti kereta bisa lebih dari satu kilometer | 1, 6 |
| ±200 ton | Bobot lokomotif rata-rata | 1 |
| 6.000 ton | Bobot rangkaian kereta (maks, AS) | 1 |
| 0,35–0,5 → 0,05 | Koefisien gesek baja-baja di rel, kondisi ekstrem | 9 |
| 120 km/jam → 800–1.200 m | Jarak pengereman kereta (menurut KAI) | 6 |
| 88 km/jam (55 mph) → > 1,6 km | Kereta barang rata-rata AS | 1 |
| 53 m | Jarak henti mobil 80 km/jam (Highway Code) | 5 |
| > 20× | Rasio jarak henti kereta barang vs mobil (hitungan) | 11 |
| UU 22/2009 Pasal 114 | Wajib berhenti saat sinyal berbunyi / palang menutup, dahulukan kereta | 3 |
| UU 23/2007 Pasal 124 | Pemakai jalan wajib mendahulukan perjalanan kereta api | 2 |
| ≤ 3 bulan / Rp750.000 | Sanksi Pasal 296 UU LLAJ (opsional HUD) | 3 |

## Poin kunci

- Tiga penyebab jadi tiga adegan: kereta tidak bisa menghindar (terkunci di rel), bobot raksasa, cengkeraman baja-baja terbatas.
- Payoff visual: bar jarak henti mobil (53 m) vs kereta (>1,6 km) yang memanjang keluar layar.
- Pesan keselamatan wajib di akhir: berhenti saat sinyal/palang, jangan menerobos, kereta punya hak utama (Pasal 114 LLAJ, Pasal 124 Perkeretaapian). Tanpa instruksi berbahaya.
- Netral: tidak menyalahkan pihak tertentu, tanpa logo KAI/operator, tanpa kecelakaan spesifik.
