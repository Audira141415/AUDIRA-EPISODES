# Source Register — Frontend Performance: Metrik yang Benar-Benar Penting (LCP, INP, CLS)

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Core Web Vitals = LCP (≤ 2,5 detik), INP (≤ 200 ms), CLS (≤ 0,1); lolos bila memenuhi target di persentil ke-75 untuk ketiganya; FID digantikan INP sebagai CWV stabil pada 2024 | Web Vitals, web.dev (Google), diperbarui | https://web.dev/articles/vitals | 2026-11-25 | HIGH |
| 2 | INP resmi menggantikan FID pada 12 Maret (2024); skor CWV dinilai di persentil ke-75 dari semua page load | Interaction to Next Paint becomes a Core Web Vital on March 12, Jeremy Wagner & Rick Viscomi, web.dev, 2024 | https://web.dev/blog/inp-cwv-march-12 | 2026-11-25 | HIGH |
| 3 | FID bukan lagi CWV; dukungan FID berakhir 9 September 2024; ambang FID lama 100 ms | First Input Delay (FID), Philip Walton, web.dev | https://web.dev/articles/fid | 2026-11-25 | HIGH |
| 4 | INP: ≤ 200 ms baik, 200–500 ms perlu perbaikan, > 500 ms buruk; interaksi terburuk yang dilaporkan | Interaction to Next Paint (INP), web.dev | https://web.dev/articles/inp | 2026-11-25 | HIGH |
| 5 | CLS baik ≤ 0,1, buruk > 0,25; CLS = burst layout shift terbesar; elemen berpindah posisi antar frame | Cumulative Layout Shift (CLS), web.dev | https://web.dev/articles/cls | 2026-11-25 | HIGH |
| 6 | LCP baik ≤ 2,5 detik; LCP terdiri 4 subpart: TTFB (~40%), resource load delay (<10%), resource load duration (~40%), element render delay (<10%) | Largest Contentful Paint (LCP) dan Optimize LCP, web.dev | https://web.dev/articles/optimize-lcp | 2026-11-25 | HIGH |
| 7 | Google menganjurkan CWV baik untuk sukses di Search; "selaras dengan apa yang ingin dihargai sistem peringkat inti" | Understanding Core Web Vitals and Google search results, Google Search Central | https://developers.google.com/search/docs/appearance/core-web-vitals | 2026-11-25 | HIGH |
| 8 | 2024: 43% situs seluler punya CWV baik (dengan INP); 48% dengan FID | Web Almanac 2024, Performance chapter, HTTP Archive, 2024 | https://almanac.httparchive.org/en/2024/performance | 2026-11-25 | MEDIUM |
