---
channel: EXPLAINED
topicNo: "022"
title: "Cara Kerja Meteran Listrik Token"
hook: "Angka 20 digit yang kamu ketik ternyata kunci terenkripsi yang hanya cocok untuk meteranmu"
styleCandidates: ["INNERWORKS (3D)", "CIRCUITFORGE (2D)", "BONGKAR (2D)"]
source: channel-topics/audira-explained/topics.md
stage: drafted
researchedAt: "2026-11-26"
prioritas: 4
awet: ya   # mekanisme token awet; tarif per kWh cepat basi
risiko: "Hook asli menyebut token sebagai kunci (dikoreksi: pesan terenkripsi, kuncinya di dalam meteran); penggunaan STS oleh meteran PLN belum terkonfirmasi sumber resmi; tarif per triwulan III 2026 cepat basi; rule 15: meteran/struk generik tanpa logo PLN atau merek, tanpa detail teknis yang memudahkan pembobolan."
---

# Cara Kerja Meteran Listrik Token

- **Channel:** EXPLAINED · topik #022
- **Hook awal:** Angka 20 digit yang kamu ketik ternyata kunci terenkripsi yang hanya cocok untuk meteranmu
- **Kandidat style (dari daftar topik, belum final):** INNERWORKS (3D), CIRCUITFORGE (2D), BONGKAR (2D)

Folder benih. Belum ada riset, naskah, atau STATUS.json.

## Cara mulai produksi (sesi A)
1. Pindahkan folder ini ke folder seri yang sedang dikerjakan di root `F:\AUDIRA-EPISODES\`, beri nama `EPxx_<SLUG>`.
2. Jalankan `audira_episode_status` `action: "init"` di folder itu, lalu ikuti pipeline tahap 0.
3. Style final dipilih di tahap 3 dari skor motion memory; kandidat di atas hanya titik awal.
4. Setelah final, tandai baris #022 di `channel-topics/audira-explained/topics.md` dengan `[x] <SERI>/EPxx`.
