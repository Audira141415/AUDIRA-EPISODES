# SHOTLIST — EP46 Iblis Menolak Sujud
# VO Master Clock: 80.76s | Film 83.8s | 5028 frames @ 60fps
Style: PAPERWORLD — diorama kertas berlapis, api kertas jingga vs tanah kraft, pilar cahaya tanpa wajah, bayangan jatuh panjang
Hook: barisan pilar cahaya menunduk, satu api kertas tegak, cap DOSA PERTAMA: SOMBONG
Offset: 0

| # | Waktu | Objek | Aksi | Kamera | Teks layar | Beat |
|---|-------|-------|------|--------|------------|------|
| 1 | 0.0–5.0 | barisan pilar cahaya, api kertas tegak di kanan | pilar menunduk berurutan, api tetap tegak, bayangan api memanjang | wide push-in pelan ke api | BUKAN MENCURI · BUKAN MEMBUNUH | Hook |
| 2 | 5.0–8.85 | api kertas tegak, bayangan panjang | api berkobar, cap merah jatuh | medium push-in ke api | DOSA PERTAMA: SOMBONG | Hook |
| 3 | 8.85–20.45 | bumi kertas biru-hijau, pohon kertas, pilar cahaya | pilar cahaya turun dari langit ke bumi, awan kertas bergeser | wide crane turun langit ke bumi | KHALIFAH DI BUMI | Context |
| 4 | 20.45–27.0 | gundukan tanah liat kraft bercahaya, 5 kartu ikon nama | tanah naik berlapis, kartu pohon/bintang/sungai/burung/gunung mengorbit | macro orbit pelan mengikuti kartu | NAMA-NAMA SELURUHNYA | Development |
| 5 | 27.0–37.5 | barisan pilar cahaya, gundukan tanah, api di tepi kanan | pilar melengkung sujud berurutan, api tetap tegak dengan pool jingga | low side dolly lateral lalu ke api | KECUALI IBLIS | Development |
| 6 | 37.5–49.25 | timbangan kertas: wadah api vs wadah tanah | lengan timbangan miring, api berkobar, panel kutipan masuk | medium push-in ke timbangan + tilt | API vs TANAH | Explanation |
| 7 | 49.25–53.2 | jam pasir kertas berlabel AUDIRA, api kecil | pasir emas jatuh, langit senja ungu | close-up rotasi pelan mengelilingi jam pasir | DITANGGUHKAN | Explanation |
| 8 | 53.2–60.8 | jalan kertas, figur manusia siluet tanpa wajah, 4 bayangan api | bayangan merayap dari depan/belakang/kanan/kiri, chip arah muncul, kerumunan muncul | top-down miring, zoom-out pelan | SUMPAH IBLIS | Explanation |
| 9 | 60.8–69.24 | jalan bercabang dua, gundukan tanah, api di cabang kiri, pita cahaya | pita-pita cahaya kalimat turun ke tanah | wide crane naik bersama cahaya | DUA JALAN | Build-up |
| 10 | 69.24–75.2 | tanah bercahaya naik, api mengecil jadi bayangan | cahaya tobat meledak naik, api jatuh | low side crane naik, cahaya memenuhi frame | TOBAT DITERIMA | Payoff |
| 11 | 75.2–80.9 | lentera hati kertas di atas bumi kertas, pita AUDIRA QISSAH | lentera menyala, cahaya hangat menyebar | wide pull-out lebar | HATI YANG MERASA LEBIH BAIK | Refleksi |
| 12 | 80.9–83.8 | outro card AUDIRA | kartu outro masuk | static card | - | Outro |

Callout lengkap (23, berurutan di dalam tiap shot) ada di `project/src/ep46/timing.ts` CALLOUTS; kolom Teks layar hanya callout utama.

## Audio cues
- Whoosh/scratch kertas di tiap potongan adegan (5.0, 8.85, 20.45, 27.0, 37.5, 49.25, 53.2, 60.8, 75.2).
- Pop untuk tiap callout (23 callout, waktu dari `project/src/ep46/timing.ts` CALLOUTS) lewat `project/sfx/cues/ep46.py`.
- Riser 66.8–69.24, impact 69.24 (jeda VO sebelum "Allah menerima tobatnya") (payoff).
- Stem −26 LUFS, di-duck di bawah VO saat render final (G18).
