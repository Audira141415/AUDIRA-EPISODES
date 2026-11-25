# SOURCE_REGISTER

Diriset 2026-11-09. Salinan teks sumber: `_research/b7/`.

## EP35 — Satu update, 8,5 juta komputer layar biru (CrowdStrike, 19 Juli 2024)
Sumber: https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages
- 19 Juli 2024, 04.09 UTC (11.09 WIB): CrowdStrike, perusahaan keamanan siber AS, mengirim update konfigurasi rusak untuk sensor Falcon di Windows.
- Berkas "Channel File 291" memicu pembacaan memori di luar batas → komputer crash (layar biru), bootloop atau masuk mode pemulihan.
- Pembaruan ditarik 05.27 UTC (78 menit kemudian); komputer yang menyala setelah itu aman.
- Microsoft: sekitar 8,5 juta perangkat terdampak, kurang dari 1% seluruh perangkat Windows. Disebut gangguan terbesar dalam sejarah teknologi informasi.
- Mac dan Linux tidak terdampak; mayoritas PC rumahan juga tidak (Falcon dipakai organisasi). CrowdStrike punya >24.000 pelanggan, termasuk hampir 60% perusahaan Fortune 500.
- Dampak: maskapai, bandara, bank, hotel, rumah sakit, bursa saham, siaran TV, layanan darurat. Delta membatalkan >1.200 penerbangan hari Jumat itu. Di Indonesia, sistem check-in AirAsia dan Citilink terganggu.
- Perbaikan harus manual satu per satu: masuk safe mode / Windows Recovery, hapus berkas C-00000291*.sys; perangkat ber-BitLocker butuh kunci pemulihan 48 digit per mesin.
- Bukan serangan siber (dikonfirmasi CEO George Kurtz).
- Kerugian: Parametrix memperkirakan ~US$5,4 miliar untuk 500 perusahaan terbesar AS (di luar Microsoft); kerugian global "puluhan miliar dolar".
- Catatan: bukan "sejarah negara" murni. Masuk batch ini sebagai bonus "reaksi berantai modern"; bisa dipindah ke seri AUDIRA EXPLAINED bila pengguna mau.
