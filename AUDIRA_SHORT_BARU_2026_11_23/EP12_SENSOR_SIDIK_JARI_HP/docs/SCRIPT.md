# SCRIPT — EP12 Cara Kerja Sensor Sidik Jari di HP

Style: BONGKAR · Channel: AUDIRA Explained (@AudiraExplained) · 210 kata → estimasi 84–93 dtk di 135–150 WPM.
Teks ucapan (spoken) ada di `audio/vo.txt`; tampilan layar memakai bentuk display (HP, iPhone 5s, 2013, TEE, PIN, AUDIRA).

| Tahap | Teks (display) | Sumber |
|---|---|---|
| 1 Hook | Jarimu cuma nempel sedetik, HP langsung terbuka. Tapi HP-mu tidak pernah menyimpan foto sidik jarimu. Lalu, apa yang dia cocokkan? Ini AUDIRA Explained. | #16 |
| 2 Context | Sidik jari adalah pola punggung dan lembah kulit. Yang dicari sensor adalah titik khasnya, disebut minutiae: ujung garis, dan percabangan. | #1, #2 |
| 3 Development A — Kapasitif | Cara pertama: kapasitif, seperti Touch ID di iPhone 5s, tahun 2013. Ribuan kapasitor kecil merasakan punggung kulit yang menempel, sementara lembahnya menyisakan celah udara. Hasilnya, peta listrik. | #4, #5 |
| 3 Development B — Optik | Cara kedua: optik, di bawah layar. Layar menyala terang menyinari jarimu, lalu sensor memotret pantulannya. Cepat dan murah, tapi gambarnya cuma dua dimensi, jadi lebih mudah dikelabui. | #9, #10 |
| 3 Development C — Ultrasonik | Cara ketiga: ultrasonik, dipakai Galaxy S10, tahun 2019. Sensor menembakkan gelombang suara, membaca pantulannya, lalu membangun peta tiga dimensi, sampai ke pori-pori. Jari basah pun tetap terbaca. | #11, #14, #15 |
| 4 Explanation | Setelah dipindai, gambarnya dibuang. Yang disimpan cuma peta matematis terenkripsi, di chip terpisah: Secure Enclave di iPhone, atau TEE di Android. Tidak dikirim ke server, dan tidak bisa disusun ulang jadi sidik jari. | #16, #17 |
| 5 Visual Payoff | Seberapa aman? Peluang jari orang lain lolos, kurang dari satu banding lima puluh ribu. Gagal lima kali, HP minta PIN. Bahkan anak kembar identik, sidik jarinya tetap berbeda. | #19, #20, #21, #23 |
| 6 Outro | Jadi yang dicocokkan bukan foto, tapi rumus. Ikuti AUDIRA Explained untuk cara kerja teknologi lainnya. | — |

Brand di suara: "Audira Explained" di hook dan outro (teks VO ditulis "Audira" agar tidak dieja).
