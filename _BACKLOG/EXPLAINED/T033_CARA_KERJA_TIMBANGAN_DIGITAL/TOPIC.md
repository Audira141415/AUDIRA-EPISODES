---
channel: EXPLAINED
topicNo: "033"
title: "Cara Kerja Timbangan Digital"
hook: "Tidak ada pegas — timbanganmu mengukur seberapa jauh logam kecil melengkung"
styleCandidates: ["INNERWORKS (3D)", "PRECISION (2D)", "BONGKAR (2D)"]
source: channel-topics/audira-explained/topics.md
stage: drafted
researchedAt: "2026-11-26"
prioritas: 4
awet: ya   # prinsip fisika awet; aturan tera ulang bisa berubah
risiko: "Hook asli (tidak ada pegas, lendutan mikrometer) keliru: logam load cell adalah pegasnya dan lendutan beban penuh < 0,25–0,5 mm; angka lendutan dari satu datasheet; x128/24-bit khusus chip HX711; rule 15: timbangan dan chip tanpa merek/logo."
---

# Cara Kerja Timbangan Digital

- **Channel:** EXPLAINED · topik #033
- **Hook awal:** Tidak ada pegas — timbanganmu mengukur seberapa jauh logam kecil melengkung
- **Kandidat style (dari daftar topik, belum final):** INNERWORKS (3D), PRECISION (2D), BONGKAR (2D)

Folder benih. Belum ada riset, naskah, atau STATUS.json.

## Cara mulai produksi (sesi A)
1. Pindahkan folder ini ke folder seri yang sedang dikerjakan di root `F:\AUDIRA-EPISODES\`, beri nama `EPxx_<SLUG>`.
2. Jalankan `audira_episode_status` `action: "init"` di folder itu, lalu ikuti pipeline tahap 0.
3. Style final dipilih di tahap 3 dari skor motion memory; kandidat di atas hanya titik awal.
4. Setelah final, tandai baris #033 di `channel-topics/audira-explained/topics.md` dengan `[x] <SERI>/EPxx`.
