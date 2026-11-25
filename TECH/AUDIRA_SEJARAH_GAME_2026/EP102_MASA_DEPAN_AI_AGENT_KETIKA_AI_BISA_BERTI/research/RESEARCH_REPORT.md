# Research Report — Masa Depan AI Agent

Riset 2026-11-25. WebFetch gagal; dipakai arXiv API dan curl ke halaman resmi.

## Sumber utama
- arXiv: OSWorld (#1), ReAct (#2), Toolformer (#3).
- Rilis resmi Anthropic (#4, #7) dan OpenAI (#5, #6).

## Fakta terverifikasi
1. ReAct (Okt 2022) menggabungkan penalaran dan aksi bergantian (#2).
2. Toolformer (Feb 2023): model memilih sendiri API yang dipanggil (#3).
3. 22 Okt 2024: computer use beta publik; Anthropic menyebutnya eksperimental dan rawan salah (#4).
4. OSWorld: 369 tugas; manusia >72,36%, model terbaik saat itu 12,24% (#1).
5. Claude 3.5 Sonnet 14,9% OSWorld (screenshot-only), 22,0% dengan lebih banyak langkah (#4).
6. 23 Jan 2025: Operator + CUA, 38,1% OSWorld (#5, #6).
7. Operator meminta persetujuan sebelum aksi signifikan dan menyerahkan kendali untuk input sensitif (#5, #6).
8. 25 Nov 2024: MCP dibuka sebagai standar terbuka (#7).

## Perselisihan / Kontroversi
- **Koreksi judul/hook:** "bertindak sendiri tanpa instruksi" / "tanpa kamu suruh" tidak akurat. Semua agen di sumber menerima tugas dari pengguna dan dirancang meminta persetujuan untuk aksi berisiko. Naskah memakai framing "bertindak sendiri, tapi tetap diberi tugas dan disetujui". Judul di TOPIC.md tidak diubah.
- Perbandingan skor lintas rilis tidak apple-to-apple: 12,24% (makalah OSWorld) memakai model berbeda dari 14,9% (Anthropic, screenshot-only) dan 38,1% (OpenAI). Naskah menyebut sumber tiap angka.
- Skor benchmark cepat usang; per Jan 2025. Cek ulang bila ada rilis baru sebelum produksi. Operator sudah dilebur ke ChatGPT agent (Juli 2025).
- Bagian "masa depan" adalah analisis, bukan fakta sumber; ditandai sebagai analisis AUDIRA.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2022 ReAct | makalah penalaran + aksi | 2 |
| 2023 Toolformer | model belajar memakai alat | 3 |
| 22 Okt 2024 | computer use beta publik | 4 |
| 369 tugas | benchmark OSWorld | 1 |
| 72,36% vs 12,24% | manusia vs model terbaik OSWorld | 1 |
| 14,9% | Claude 3.5 Sonnet, OSWorld | 4 |
| 25 Nov 2024 | MCP dibuka | 7 |
| 23 Jan 2025 / 38,1% | Operator, skor OSWorld CUA | 5, 6 |

## Poin kunci
- Kejutan: manusia 72% vs AI 12% di tugas komputer biasa (per makalah 2024).
- Lompatan cepat: 12% ke 38% dalam sekitar 9 bulan (angka beda model, bukan satu garis ukur).
- Agen tetap meminta persetujuan: kendali ada di manusia.
- Visual: tanpa logo perusahaan dan tanpa wajah orang nyata (aturan TECH); pakai robot generik.
