# Research Report — Cara Kerja Mesin Cuci: Kenapa Diputar Bolak-balik

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: mesin cuci generik, tanpa merek/logo, tanpa wajah orang nyata).

## Sumber utama

- **Jurnal**: van der Weg, JAMP 2020 (#1, #2) menjelaskan langsung alasan pembalikan arah tabung, rpm cuci, dan lubang tabung; Roberts dkk., ANZIAM J 2019 (#3) memodelkan gerak pakaian (diangkat sirip, jatuh, kecepatan kritis).
- **Paten**: US8381343B2 (#4) memuat pola pengurai konvensional maju 5 dtk, berhenti, mundur 5 dtk; US20110099730A1 (#5) memuat gerakan tabung rolling/tumbling/swing dan sirip pengangkat.
- Pendukung MEDIUM: Wikipedia en "Washing machine" (#6) untuk mesin bukaan atas dan rpm peras; Wikipedia id "Mesin cuci" (#7) untuk jenis mesin di Indonesia.
- Catatan: SNI/BSN dan IEC 60456 tidak berhasil dibuka (mesin pencari error, situs berbasis JS); tidak dipakai.

## Fakta terverifikasi

1. Mencuci = gabungan suhu, deterjen, waktu, dan aksi mekanis; keempatnya bisa saling menutup kekurangan (#2, #3).
2. Noda lepas terutama saat kain yang jatuh membentur tabung: aliran air yang terperas keluar dari kain menyeret noda (#2).
3. Di mesin bukaan depan, sirip di dinding tabung mengangkat pakaian, lalu pakaian lepas dan jatuh ke dasar (#3, #5).
4. Putaran saat mencuci pelan: tipikal 40–50 rpm (#3), rentang umum 25–60 rpm (#1); tabung 48 cm optimum ±41 rpm (#1).
5. Bila putaran terlalu cepat (ω²r ≥ g), pakaian menempel di dinding dan tidak jatuh (#3). Untuk tabung 48 cm, batas ini dihitung dari rumus #3 sekitar 61 rpm (hitungan turunan, bukan angka tertulis); sejalan dengan rentang 25–60 rpm di #1.
6. Arah tabung dibalik beberapa kali selama mencuci; pembalikan menata ulang cucian dan mengurai lilitan yang terbentuk saat putaran satu arah, sehingga cucian lebih merata bersih (#1, #3, #6).
7. Pola pengurai konvensional: ±40–45 rpm maju 5 dtk, berhenti 5 dtk, mundur 5 dtk, berhenti 5 dtk, diulang (#4).
8. Mesin bukaan atas: pengaduk dibalik berkala, karena gerak searah terus hanya membuat air ikut berputar bersama keranjang (#6).
9. Saat memeras, tabung berputar sangat cepat (umumnya 1.000–1.600 rpm) dan air terlempar keluar lewat lubang oleh gaya sentrifugal (#1, #6); putaran lebih cepat bisa membuat pakaian lebih kusut/lecek (#6).
10. Tabung komersial punya 900–4.000 lubang berdiameter 2–4 mm (#1).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "ada alasan kenapa pakaian tidak kusut" ambigu. Dalam bahasa Indonesia "kusut" bisa berarti *melilit/kusut-menggumpal* atau *lecek/berkerut*. Sumber (#1, #4) hanya mendukung arti pertama: pembalikan arah mengurai lilitan dan meratakan cucian. Tidak ada sumber yang menyatakan putaran bolak-balik mencegah baju lecek/berkerut; lecek justru lebih banyak dipengaruhi putaran peras yang kencang (#6). Alasan kedua yang terverifikasi: di mesin bukaan atas, gerak searah membuat air ikut berputar sehingga tidak ada gesekan (#6). Hook naskah dikoreksi jadi "bukan supaya baju tidak lecek, tapi supaya tidak saling melilit".
- **Pola 5 detik** (#4) disebut paten sebagai pola *konvensional* proses pengurai; durasi tiap mesin berbeda. VO menyebutnya "pola klasik", bukan aturan semua mesin.
- **Angka ±60 rpm** adalah batas atas rentang di #1 dan hitungan turunan dari rumus #3, bukan spesifikasi mesin tertentu. VO memakai "sekitar enam puluh".
- **Mesin bukaan atas di Indonesia** umumnya memakai pulsator (piringan di dasar), bukan agitator tiang. Sumber #6 (MEDIUM) menyebut impeller/wash plate punya fungsi sama dengan agitator; klaim "air ikut berpusing" untuk pulsator belum ada sumber HIGH. Cek ulang sebelum produksi.
- **Twin tub paling banyak dipakai** (#7) hanya dari Wikipedia id tanpa data pasar; tidak dipakai di VO.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 4 faktor | Suhu, deterjen, waktu, gerakan | 2 |
| 40–50 rpm | Putaran tabung tipikal saat mencuci | 3 |
| ±60 rpm | Batas atas putaran cuci; lebih cepat, baju menempel di dinding | 1, 3 |
| 5 dtk maju / 5 dtk mundur | Pola pengurai konvensional (dengan jeda 5 dtk) | 4 |
| 1.000+ rpm | Putaran peras mesin modern (umumnya 1.000–1.600 rpm) | 6 |
| 900–4.000 lubang | Lubang 2–4 mm di dinding tabung (opsional, adegan peras) | 1 |

## Poin kunci

- Gerakan bolak-balik punya dua alasan terverifikasi: mengurai lilitan cucian dan meratakan cucian (bukaan depan), serta menjaga air tetap bergolak, bukan ikut berputar (bukaan atas).
- Putaran cuci sengaja pelan supaya baju terangkat lalu jatuh; benturan inilah yang memeras noda keluar.
- Lecek bukan dicegah oleh bolak-balik; lecek lebih terkait putaran peras yang kencang.
- Visual inti: penampang tabung dengan sirip, lintasan baju jatuh, panah arah putaran yang berbalik, lilitan baju yang terurai.
