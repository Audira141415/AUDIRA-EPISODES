# Research Report — React useEffect: Panduan untuk Berhenti Bikin Memory Leak

## Sumber utama

- Dokumentasi resmi react.dev: referensi useEffect (#2), Synchronizing with Effects (#3), You Might Not Need an Effect (#8).
- Repositori facebook/react: PR #22114 oleh Dan Abramov (#4) dan CHANGELOG 18.0.0 (#5).
- Blog resmi React: rilis 16.8 (#1) dan rilis 18.0 (#6).
- MDN Web Docs untuk AbortController (#7).

## Fakta terverifikasi

1. Hooks, termasuk useEffect, masuk rilis stabil di React 16.8 pada 6 Februari 2019 (#1).
2. Fungsi yang dikembalikan dari useEffect adalah cleanup. React menjalankannya sebelum setup diulang karena dependency berubah, lalu sekali lagi saat komponen unmount (#2).
3. Koneksi atau langganan yang tidak ditutup di cleanup akan menumpuk setiap kali pengguna kembali ke layar yang sama (#3).
4. Di development, Strict Mode sengaja me-mount, unmount, lalu mount ulang komponen sekali. Log setup yang muncul dua kali tanpa log pemutusan menandakan cleanup belum ada (#3, #6).
5. Untuk fetch, cleanup bisa memakai flag `ignore` agar respons basi tidak dipakai (#3), atau `AbortController.abort()` untuk membatalkan request (#7).
6. Warning "setState on an unmounted component" dihapus di React 18 (rilis 29 Maret 2022) karena sebagian besar pemicunya false positive (#4, #5, #6).
7. setState setelah komponen unmount tidak melakukan apa-apa. Memory leak sebenarnya berasal dari subscribe tanpa unsubscribe (#4).
8. Effect adalah escape hatch untuk sistem eksternal. Banyak logika tidak butuh Effect sama sekali (#8).

## Perselisihan / Kontroversi

- **Hook di TOPIC.md kurang akurat.** Hook "Komponen yang unmount tapi masih update state itu mimpi buruk" mengikuti pemahaman era React 17. Sejak React 18, setState pada komponen yang sudah unmount adalah no-op dan warning-nya dihapus karena lebih sering salah alarm (#4, #5). Koreksi: masalah nyata adalah timer, listener, dan langganan yang tetap hidup setelah unmount karena cleanup tidak ditulis. Naskah memakai sudut ini. Judul tidak diubah; frasa "memory leak" tetap sah untuk langganan yang tidak ditutup (#4).
- Pola `isMounted` (useRef) yang sering diajarkan tutorial lama disebut tim React sebagai workaround yang membuat kode lebih buruk (#4). Naskah tidak menganjurkannya.
- Fakta versi (React 18/19) bisa bergeser di rilis berikutnya; angka versi di naskah ditulis sebagai fakta sejarah, bukan "versi terbaru".

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| React 16.8 · 2019 | Hooks dan useEffect rilis stabil | #1 |
| React 18 · Maret 2022 | Warning setState unmounted dihapus; Strict Mode remount | #5, #6 |
| PR #22114 | PR penghapusan warning | #4 |
| 2× | Log "Connecting" tampil dua kali di development (Strict Mode) | #3 |
| clearInterval / removeEventListener / abort() | Pasangan cleanup | #3, #7 |

## Poin kunci

- Setiap setup di useEffect butuh pasangan pembersih di return.
- Cleanup jalan sebelum efek diulang dan saat unmount, bukan hanya saat unmount.
- setState setelah unmount bukan musuhnya sejak React 18; langganan yang lupa ditutup itu musuhnya.
- Strict Mode double-mount adalah alat deteksi, bukan bug.
- Topik awet: konsep cleanup stabil sejak 2019; hanya detail versi yang perlu dicek ulang saat produksi.
