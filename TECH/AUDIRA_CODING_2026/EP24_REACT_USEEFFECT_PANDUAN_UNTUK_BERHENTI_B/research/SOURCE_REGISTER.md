# Source Register — React useEffect: Panduan untuk Berhenti Bikin Memory Leak

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Hooks (termasuk useEffect) tersedia di rilis stabil React 16.8, 6 Februari 2019 | React v16.8: The One With Hooks, Dan Abramov / React Blog, 2019 | https://legacy.reactjs.org/blog/2019/02/06/react-v16.8.0.html | 2026-11-25 | HIGH |
| 2 | Cleanup dijalankan dengan nilai lama sebelum setup diulang saat dependency berubah, dan sekali lagi setelah komponen dilepas dari DOM (unmount) | useEffect – API Reference, react.dev (Meta), 2024 | https://react.dev/reference/react/useEffect | 2026-11-25 | HIGH |
| 3 | Effect untuk sinkron dengan sistem di luar React; koneksi tanpa cleanup menumpuk saat pengguna berpindah layar; di development React me-remount tiap komponen sekali sehingga log "Connecting" tampil dua kali; fetch pakai flag ignore di cleanup agar respons basi tidak dipakai | Synchronizing with Effects, react.dev (Meta), 2024 | https://react.dev/learn/synchronizing-with-effects | 2026-11-25 | HIGH |
| 4 | Warning setState pada komponen yang sudah unmount dihapus; kasus umum (setState setelah await) bukan memory leak: komponen sudah unmount sehingga tidak terjadi apa-apa; leak asli = subscribe tanpa unsubscribe | Remove the warning for setState on unmounted components (PR #22114), Dan Abramov / facebook/react, 2021 | https://github.com/facebook/react/pull/22114 | 2026-11-25 | HIGH |
| 5 | React 18 mencatat "No warning about setState on unmounted components" di changelog 18.0.0 | CHANGELOG.md, facebook/react, 2022 | https://github.com/facebook/react/blob/main/CHANGELOG.md | 2026-11-25 | HIGH |
| 6 | React 18 dirilis 29 Maret 2022; Strict Mode baru mensimulasikan unmount lalu remount setiap komponen di development | React v18.0, React Team / react.dev Blog, 2022 | https://react.dev/blog/2022/03/29/react-v18 | 2026-11-25 | HIGH |
| 7 | AbortController.abort() membatalkan operasi async sebelum selesai, termasuk request fetch | AbortController: abort() method, MDN Web Docs (Mozilla), 2025 | https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort | 2026-11-25 | MEDIUM |
| 8 | Effect adalah "escape hatch" untuk menyinkronkan komponen dengan sistem eksternal; banyak kasus tidak butuh Effect | You Might Not Need an Effect, react.dev (Meta), 2024 | https://react.dev/learn/you-might-not-need-an-effect | 2026-11-25 | MEDIUM |
