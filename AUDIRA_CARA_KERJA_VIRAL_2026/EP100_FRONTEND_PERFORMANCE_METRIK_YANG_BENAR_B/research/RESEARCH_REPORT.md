# Research Report — Frontend Performance: Metrik yang Benar-Benar Penting

## Sumber utama
Dokumentasi web.dev (Google) untuk Web Vitals, LCP, INP, CLS, FID; Google Search Central; Web Almanac 2024 (HTTP Archive). Detail di `SOURCE_REGISTER.md` (8 sumber: 7 HIGH, 1 MEDIUM).

## Fakta terverifikasi
1. Tiga CWV: LCP ≤ 2,5 dtk, INP ≤ 200 ms, CLS ≤ 0,1 (#1).
2. Lolos bila ketiganya memenuhi target di persentil ke-75 page load (#1, #2).
3. INP menggantikan FID pada 12 Maret 2024 (#2, #1).
4. Dukungan FID berakhir 9 September 2024; ambang FID lama 100 ms (#3).
5. INP: baik ≤ 200 ms, perlu perbaikan ≤ 500 ms, buruk > 500 ms (#4).
6. CLS buruk bila > 0,25; layout shift = elemen berubah posisi antar frame (#5).
7. LCP terurai jadi empat subpart: TTFB, resource load delay, resource load duration, element render delay (#6).
8. Google: CWV baik dianjurkan untuk Search dan selaras dengan sistem peringkat inti (#7).
9. 2024: 43% situs seluler CWV baik dengan INP (#8).

## Perselisihan / Kontroversi
- **Judul/hook tidak akurat**: judul menyebut FID. FID sudah bukan Core Web Vital sejak 12 Maret 2024, diganti INP. Naskah memakai LCP, INP, CLS dan menyebut FID sebagai metrik lama.
- Hook "bukan cuma SEO, itu UX" wajar, tapi Google hanya menyebut "selaras dengan" sistem peringkat; besarnya bobot ranking tidak dirinci. Naskah tidak mengklaim bobot.
- Angka 43% adalah data HTTP Archive 2024, bisa basi.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2,5 detik | batas baik LCP | 1, 6 |
| 200 ms / 500 ms | batas baik / buruk INP | 1, 4 |
| 0,1 | batas baik CLS | 1, 5 |
| 12 Maret 2024 | INP gantikan FID | 2 |
| 9 September 2024 | dukungan FID berakhir | 3 |
| persentil ke-75 | dasar penilaian | 1, 2 |
| 43% | situs seluler CWV baik, 2024 | 8 |

## Poin kunci
- Metrik berubah: FID pensiun, INP penggantinya.
- Ukur dengan data pengguna asli, bukan hanya lab.
- Tiga aspek: muat, respons, stabil.
