# Research & Technical Verification Checklist — AUDIRA TECH

Video dokumenter teknik AUDIRA TECH bertumpu pada integritas sains 100%. Tidak boleh ada satu pun mekanisme yang dikarang hanya demi estetika animasi.

---

## 🏛️ 1. Hirarki Sumber Bukti (Source Hierarchy)

1. **Tier 1 (Sumber Primer - Otoritas Tertinggi):**
   - Whitepaper resmi dan manual servis teknis OEM (Original Equipment Manufacturer).
   - Lembar data teknis komponen (*datasheets*, semikonduktor, metalurgi).
   - Paten teknik resmi (Google Patents / USPTO / WIPO).
2. **Tier 2 (Lembaga Standar & Ilmiah):**
   - Badan regulasi & standar teknik: IEEE, SAE, ASME, ISO, NIST, NASA.
   - Jurnal ilmiah peer-reviewed (ScienceDirect, Nature, Springer, IEEE Xplore).
3. **Tier 3 (Platform Analisis Keteknikan Kredibel):**
   - Laboratorium teardown profesional (misal: iFixit, TechInsights, Munro Live).
   - Publikasi teknik mendalam (EE Times, AnandTech, IEEE Spectrum).
4. **Tier 4 (Sumber Sekunder Populer - Hanya untuk Referensi Awal):**
   - Artikel sains umum, blog teknologi, video YouTube umum. *(Tidak boleh menjadi satu-satunya dasar untuk klaim mekanis kritis).*

---

## 📋 2. Claim Ledger (Buku Besar Klaim Teknis)

Setiap episode wajib mencantumkan tabel Claim Ledger sebelum naskah ditulis:

| Claim ID | Pernyataan Teknis Mekanis | Subjek / Komponen | Sumber & Referensi (URL/Dokumen) | Tingkat Keyakinan (High/Med/Low) | Perlakuan Visual On-Screen |
|---|---|---|---|---|---|
| **C-01** | *Kompresor inverter mengatur kecepatan rotasi motor BLDC menggunakan modulasi lebar pulsa (PWM).* | Kompresor Refrigerator | Mitsubishi Electric Technical Review | **HIGH** | Animasi perubahan frekuensi pulsa PWM + grafik gelombang tegangan. |
| **C-02** | *Refrigeran R600a (isobutana) mendidih pada suhu -11.7°C pada tekanan atmosfer.* | Jalur Evaporator | ASHRAE Handbook - Fundamentals | **HIGH** | Label HUD suhu boiling point & simulasi partikel cair ke gas. |

---

## 🔍 3. Pertanyaan Kunci Audit Kebenaran Sains

Sebelum naskah dan prompt visual disetujui, tanyakan:
- [ ] Apakah urutan sebab-akibat (*causal chain*) sudah tepat? (Jangan tertukar antara sebab dan akibat).
- [ ] Apakah analogi yang digunakan menyesatkan? (Analogi boleh digunakan untuk memudahkan pemahaman, namun harus dipertegas mekanisme aslinya).
- [ ] Apakah model/versi komponen digeneralisasi berlebihan? (Contoh: Menjelaskan layar OLED tapi menggambarkan panel backlight LCD).
- [ ] Apakah skala visual mikro akurat secara proporsional?
- [ ] Jika ada data yang tidak pasti atau bervariasi antar pabrikan, apakah dinyatakan sebagai kisaran (*range*) alih-alih angka mutlak?

