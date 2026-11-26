# SHOTLIST — EP18 Kisah Bilal bin Rabah
# VO Master Clock: 87.68s | Film 91.0s | 5460 frames @ 60fps
Style: PAPERWORLD — diorama kertas berlapis 2D SVG, gurun Hijaz krem-terakota, siluet tanpa wajah dari belakang, bayangan jatuh panjang
Hook: batu kertas berlapis menekan jubah gading, huruf AHAD meledak tepat di kata
Offset: 0

| # | Waktu | Objek | Aksi | Kamera | Teks layar | Beat |
|---|-------|-------|------|--------|------------|------|
| 1 | 0.0–5.6 | batu kertas berlapis, jubah gading telentang, matahari kertas | batu turun menekan, debu kertas | low makro push cepat | AHAD | Hook |
| 2 | 5.6–14.7 | lembah Makkah pop-up, kitab terbuka bercap AUDIRA | kota kertas naik, kitab terbuka | aerial crane turun ke lembah | BILAL BIN RABAH · ±580 | Context |
| 3 | 14.7–18.2 | siluet majikan terakota, jubah gading kecil | majikan menunjuk | low angle ke majikan | UMAYYAH BIN KHALAF | Context |
| 4 | 18.2–28.2 | lembah oranye, jubah gading di pasir, batu | dua siluet menggeser batu, matahari naik | wide crane turun mengikuti batu | JAM PALING TERIK · TINGGALKAN / MATI | Development |
| 5 | 28.2–32.8 | batu berlapis dari samping, jari terangkat | cincin gelombang emas tiap kata Ahad | track samping | AHAD AHAD · YANG MAHA ESA | Development |
| 6 | 32.8–39.2 | tebing sore, siluet bertongkat di jalan setapak | lelaki berhenti melihat ke bawah | dolly ke kanan | WARAQAH BIN NAUFAL | Development |
| 7 | 39.2–44.55 | gerbang rumah, dua siluet | figur gading berpindah ke sisi Abu Bakar | pan mengikuti pertukaran | ABU BAKAR · DITUKAR · MERDEKA | Explanation |
| 8 | 44.55–51.45 | mata rantai karton, serpih emas | rantai putus, serpih terbang | push ke rantai lalu tarik mundur | KUTIPAN UMAR · BUKHARI 3754 | Explanation |
| 9 | 51.45–54.8 | kampung Madinah kertas subuh, warga siluet | warga keluar rumah mencari | truck melewati atap | MADINAH · BAGAIMANA MEMANGGIL SALAT? | Explanation |
| 10 | 54.8–58.8 | siluet gading di tempat tinggi dari belakang, fajar | cincin suara melebar, jendela menyala | orbit naik dari belakang | BUKHARI 604 | Explanation |
| 11 | 58.8–65.3 | ruang lampu gantung, dua siluet duduk | mimpi diajarkan ke Bilal | pan lateral | MIMPI ABDULLAH BIN ZAID · LEBIH LANTANG | Build-up |
| 12 | 65.3–73.85 | Ka'bah kubus hitam di lembah, siluet kecil di atap | cincin suara raksasa menyapu lembah | tilt naik + pull-back | 630 · AZAN · IBNU KATSIR | Payoff |
| 13 | 73.85–77.85 | jejak kaki emas di bukit kertas | jejak menyala satu per satu | follow jejak | BUKHARI 1149 | Refleksi |
| 14 | 77.85–81.3 | kota Damaskus kertas | lampu kota menyala | dolly lateral | ±640 DAMASKUS | Refleksi |
| 15 | 81.3–88.0 | bola bumi kertas, menara menyala beruntun | cincin suara melintas lengkung bumi | pull-back jauh | 5× SEHARI · AUDIRA QISSAH | Refleksi |
| 16 | 88.0–91.0 | outro card AUDIRA | kartu outro masuk | static card | - | Outro |

Callout lengkap (32) ada di `project/src/ep18/timing.ts` CALLOUTS; kolom Teks layar hanya callout utama.

## Audio cues
- Scratch kertas di tiap potongan adegan (pan kiri/kanan bergantian).
- Pop untuk tiap callout (waktu dari `project/src/ep18/timing.ts` CALLOUTS) lewat `project/sfx/cues/ep18.py`.
- Satu riser + satu impact di payoff 70.64 (kata "azan" di atas Ka'bah, callout AZAN).
- Tanpa rekaman azan (adab): hanya cincin suara visual + chime lembut.
- Stem −28 LUFS (EP18 Svalbard G18c: −26 hanya 11 LU di bawah VO), di-duck di bawah VO saat render final (G18).
