---
channel: EXPLAINED
topicNo: "036"
title: "Cara Kerja Barcode di Kemasan Belanja"
hook: "Garis hitam-putih itu menyimpan angka yang dibaca laser dalam sekejap"
styleCandidates: ["BONGKAR (2D)", "PRECISION (2D)", "CIRCUITFORGE (2D)"]
source: channel-topics/audira-explained/topics.md
stage: drafted
researchedAt: "2026-11-26"
prioritas: 4
awet: ya   # mekanisme EAN/GTIN awet; tren pemindai laser→kamera dan 1D→2D bisa bergeser
risiko: "Hook asli (dibaca laser) dikoreksi jadi laser atau kamera, isi barcode = GTIN bukan harga; 1974 dan kode Morse baru bersumber Wikipedia (MEDIUM); rule 15: semua barcode/kemasan fiktif, tanpa logo GS1/peritel, tanpa wajah penemu; jangan tampilkan nomor 899 lengkap 13 digit."
---

# Cara Kerja Barcode di Kemasan Belanja

- **Channel:** EXPLAINED · topik #036
- **Hook awal:** Garis hitam-putih itu menyimpan angka yang dibaca laser dalam sekejap
- **Kandidat style (dari daftar topik, belum final):** BONGKAR (2D), PRECISION (2D), CIRCUITFORGE (2D)

Folder benih. Belum ada riset, naskah, atau STATUS.json.

## Cara mulai produksi (sesi A)
1. Pindahkan folder ini ke folder seri yang sedang dikerjakan di root `F:\AUDIRA-EPISODES\`, beri nama `EPxx_<SLUG>`.
2. Jalankan `audira_episode_status` `action: "init"` di folder itu, lalu ikuti pipeline tahap 0.
3. Style final dipilih di tahap 3 dari skor motion memory; kandidat di atas hanya titik awal.
4. Setelah final, tandai baris #036 di `channel-topics/audira-explained/topics.md` dengan `[x] <SERI>/EPxx`.
