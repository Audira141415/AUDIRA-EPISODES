# Research Report — EP03 SERANGAN SIBER BANK

Tanggal riset: 2026-11-10. Nomor [n] merujuk `SOURCE_REGISTER.md`. Keyakinan: HIGH / MED / LOW (LOW jangan dipakai di naskah).

## Ringkasan

Sejak 9–10 November 2026 warganet ramai membagikan tangkapan dashboard FortiGuard Labs: "jutaan serangan siber ke Indonesia dalam sehari, bank paling diincar". Media memuat angka berbeda-beda: 1,2 juta (sektor keuangan, 24 jam s.d. Senin malam), 2,1 juta (seluruh Indonesia, 24 jam per Selasa), 3,2 juta (sektor keuangan, sepekan), 7,3 juta (seluruh Indonesia, sepekan). OJK sudah berkoordinasi dengan IT bank sejak Jumat 6 Nov dan mengirim surat panduan; BSSN menyiagakan 151 tim tanggap insiden di perbankan. Namun pakar Vaksincom dan BSSN sendiri menegaskan: angka dashboard adalah **upaya yang tercatat/diblokir**, bukan bank yang dibobol, dan rata-rata harian setahun terakhir tidak melonjak.

**Kenapa viral:** angka jutaan terdengar menakutkan; menyentuh uang nasabah; ada insiden bank di Malaysia, Jepang, Prancis, Singapura; angka yang berbeda-beda di tiap media membingungkan publik.

**Sudut terkuat:** explainer "membaca angka": apa arti "serangan" di peta ancaman, kenapa angkanya beda-beda, dan apa yang perlu dilakukan nasabah.

## Fakta kunci

| Fakta | Isi / angka | Periode | Sumber data | Keyakinan | Sumber |
|---|---|---|---|---|---|
| Sektor keuangan | >1,2 juta upaya serangan | 24 jam s.d. Senin 9 Nov malam | FortiGuard Labs | HIGH (dikutip ≥2 media; aslinya The Star) | [1][4] |
| Sektor teknologi / pemerintah | 434.000 / 163.000 | idem | FortiGuard | HIGH | [1][4] |
| Total Indonesia | 2,1 juta serangan; ±25 per detik; 140 insiden aktif | 24 jam per Selasa 10 Nov | Dashboard FortiGuard (real-time) | MED (snapshot dashboard, berubah tiap saat) | [2] |
| Sektor keuangan (snapshot lain) | 906.000; teknologi 409.000; pemerintah 168.000; pendidikan 55.000 | 24 jam per 10 Nov | FortiGuard | MED | [2] |
| Sepekan | 7,3 juta ke Indonesia, ±12/detik; keuangan 3,2 juta; teknologi 1,4 juta; pemerintah 741.000 | sepekan s.d. ±10 Nov | FortiGuard | MED | [3] |
| Negara teratas | Turki 37 juta, AS 31 juta, Taiwan 15 juta, Kanada 13 juta, Jerman 9,1 juta (24 jam) | 10 Nov | FortiGuard | MED | [2] |
| Peringkat Kaspersky | Indonesia ke-32 paling diserang | 9 Nov | Kaspersky | MED | [1][4] |
| Respons OJK | Koordinasi IT bank sejak Jumat 6 Nov; surat panduan teknis: perhatian ekstra transaksi signifikan, tunda transaksi tak wajar untuk verifikasi, wajib pentest, simulasi, audit TI | 6–10 Nov | Dian Ediana Rae, Kepala Eksekutif Pengawas Perbankan OJK | HIGH | [1][2][4] |
| Respons BSSN | 151 tim tanggap insiden siber sektor perbankan; 202 notifikasi potensi bahaya ke unit tanggap perbankan sepanjang 2026; dashboard komersial = catatan aktivitas otomatis, bukan jumlah pembobolan | 10 Nov | Jubir BSSN Prabaswari | HIGH | [3] |
| Pakar | Alfons Tanujaya (Vaksincom): "Itu upaya yang diblokir, bukan bank yang dibobol." Rata-rata Nov 2025: 110,7 ribu/hari; 1–7 Nov 2026: 116.400/hari (tidak ada lonjakan berarti) | 10 Nov | Vaksincom | MED (dari Instagram pakar via CNBC) | [2] |
| Konteks luar negeri | Ransomware ganggu kliring antarbank di Jepang dan Prancis; penipuan rekayasa sosial di Malaysia dan Singapura | Nov 2026 | BSSN via Kompas.id | MED (detail insiden tidak dirinci) | [3][2] |

**Kenapa angkanya beda:** periode (24 jam vs sepekan), cakupan (sektor keuangan vs seluruh Indonesia), dan waktu snapshot dashboard real-time. Angka 1,2 juta dan 2,1 juta **bukan saling bertentangan**: yang satu sektor keuangan per Senin malam, yang lain total Indonesia per Selasa.

**Hitungan turunan (tandai "perkiraan"):** 2,1 juta/24 jam ≈ 24 per detik (cocok dengan "25 per detik" [2]); 7,3 juta/7 hari ≈ 1,04 juta/hari ≈ 12 per detik (cocok [3]). Rata-rata versi Vaksincom (116 ribu/hari) jauh lebih rendah: kemungkinan metode/sumber hitung berbeda. Jangan dibandingkan langsung di naskah.

## Sudut hook

1. "Dua juta serangan siber sehari ke Indonesia. Kedengarannya horor. Tapi angka ini bukan jumlah bank yang jebol."
2. "Satu berita bilang 1,2 juta, yang lain 2,1 juta, yang lain 7,3 juta. Semuanya benar. Kok bisa?"
3. Tips nasabah: OTP jangan dibagi, waspada link APK, cek notifikasi transaksi.

## Ide visual

- Peta ancaman bergaya dashboard (CYBERFORGE / SATELLITEBRIEFING): busur serangan menuju Indonesia, lalu "dinding" firewall memantulkannya → menegaskan "diblokir".
- Tiga kotak angka dengan label periode + cakupan untuk membedah 1,2 / 2,1 / 7,3 juta.
- Bar chart sektor: keuangan vs teknologi vs pemerintah.
- Tokoh bernama: Dian Ediana Rae (OJK), Prabaswari (Jubir BSSN), Alfons Tanujaya (Vaksincom).

## Risiko

- Jangan menakut-nakuti (memicu panik/rush); jangan juga meremehkan, karena insiden nyata ada di negara tetangga.
- Angka dashboard berubah tiap jam; selalu sertakan "per tanggal X".
- Jangan tampilkan logo bank tertentu seolah jadi korban.

## JANGAN DIKLAIM

- "Bank di Indonesia dibobol 2 juta kali" / "bank sudah jebol". Angka = upaya serangan yang tercatat/diblokir.
- "Serangan siber melonjak tajam" tanpa pembanding; Vaksincom menyebut tidak ada lonjakan berarti dalam setahun.
- Nama bank korban, kerugian rupiah, atau kebocoran data di Indonesia (tidak ada laporan terverifikasi).
- "Indonesia paling diserang di dunia" (Kaspersky: peringkat 32; FortiGuard: Turki dan AS jauh di atas).
- Angka 2,2 juta (judul Feedberry soal Komdigi) dan 243 serangan sektor kesehatan (kemungkinan salah ketik di CNBC) belum diverifikasi.
