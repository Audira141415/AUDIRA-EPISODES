---
channel: EXPLAINED
topicNo: "079"
title: "Cara Kerja Skala Gempa: Beda Magnitudo dan Intensitas"
hook: "Gempa magnitudo 7 bukan sedikit lebih kuat dari 6 — energinya sekitar 32 kali"
styleCandidates: ["DATAPHYSICAL (2D)", "SCALEFORGE (3D)", "DISASTERSIM (3D)"]
source: channel-topics/audira-explained/topics.md
stage: drafted
researchedAt: "2026-11-27"
prioritas: 4
awet: ya   # formula fisika dan definisi skala tidak berubah; contoh gempa (Aceh, Palu, Cianjur) stabil
risiko: "Hook '32 kali' benar (energi, 10^1.5), tapi VO wajib bedakan dari guncangan; SIG-BMKG tidak terkonfirmasi — BMKG saat ini pakai MMI; sumber kebanyakan MEDIUM (Wikipedia mengutip paper standar), coba buka USGS sebelum produksi; magnitudo BMKG vs USGS beda 0,1–0,2 unit (wajar); rule 15: tanpa logo BMKG/USGS, netral."
---

# Cara Kerja Skala Gempa: Beda Magnitudo dan Intensitas

- **Channel:** EXPLAINED · topik #079
- **Hook awal:** Gempa magnitudo 7 bukan sedikit lebih kuat dari 6 — energinya sekitar 32 kali
- **Kandidat style (dari daftar topik, belum final):** DATAPHYSICAL (2D), SCALEFORGE (3D), DISASTERSIM (3D)

Folder benih. Belum ada riset, naskah, atau STATUS.json.

## Cara mulai produksi (sesi A)
1. Pindahkan folder ini ke folder seri yang sedang dikerjakan di root `F:\AUDIRA-EPISODES\`, beri nama `EPxx_<SLUG>`.
2. Jalankan `audira_episode_status` `action: "init"` di folder itu, lalu ikuti pipeline tahap 0.
3. Style final dipilih di tahap 3 dari skor motion memory; kandidat di atas hanya titik awal.
4. Setelah final, tandai baris #079 di `channel-topics/audira-explained/topics.md` dengan `[x] <SERI>/EPxx`.
