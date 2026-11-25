# SOURCE_REGISTER — AE-055 "Bagaimana Komputer Pertama Bisa Melakukan Perhitungan?"

Tanggal akses semua sumber: 2026-11-08. Jalur akses: curl + ekstraksi teks Python (WebFetch rusak pada sesi ini). Britannica, army.mil, history.army.mil, dan americanhistory.si.edu menolak akses otomatis (HTTP 403), jadi tidak dipakai.

## Daftar sumber

| Kode | Judul | Penerbit | URL |
|---|---|---|---|
| S1 | ENIAC (History & Heritage) | Penn Engineering, University of Pennsylvania | https://www.engineering.upenn.edu/about/history-heritage/eniac/ |
| S2 | Birth of the Computer: ENIAC (exhibit captions) | Computer History Museum (CHM) | https://www.computerhistory.org/revolution/birth-of-the-computer/4/78 |
| S3 | Timeline of Computer History: 1946 | Computer History Museum | https://www.computerhistory.org/timeline/1946/ |
| S4 | ENIAC | Engineering and Technology History Wiki (IEEE History Center) | https://ethw.org/ENIAC |
| S5 | Milestones: Electronic Numerical Integrator and Computer, 1946 | ETHW / IEEE Milestone | https://ethw.org/Milestones:Electronic_Numerical_Integrator_and_Computer,_1946 |
| S6 | The Women Behind ENIAC | IEEE Spectrum (The Institute), 2022/2023 | https://spectrum.ieee.org/the-women-behind-eniac |
| S7 | The Modern History of Computing | Stanford Encyclopedia of Philosophy (Copeland) | https://plato.stanford.edu/entries/computing-history/ |
| S8 | Colossus | The National Museum of Computing (TNMOC), Bletchley Park | https://www.tnmoc.org/colossus |
| S9 | Colossus artifact caption | Computer History Museum | https://www.computerhistory.org/revolution/birth-of-the-computer/4/82 |
| S10 | ENIAC | Wikipedia (EN) — konteks; mengutip Goldstine, Burks, BRL Report 971 | https://en.wikipedia.org/wiki/ENIAC |
| S11 | Colossus computer | Wikipedia (EN) — konteks | https://en.wikipedia.org/wiki/Colossus_computer |

## Klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | ENIAC = Electronic Numerical Integrator and Computer, dibangun di Moore School, University of Pennsylvania, kontrak US Army, oleh J. Presper Eckert & John Mauchly | S1, S4, S5, S7 | 2026-11-08 | HIGH | |
| 2 | Pembangunan mulai 1943; selesai/beroperasi akhir 1945 | S3, S4, S5, S7 | 2026-11-08 | HIGH | "Completed in 1945" (S5, S7) |
| 3 | Diumumkan ke publik Februari 1946 (NYT 14/15 Feb; dedikasi formal 15 Feb 1946) | S1, S2, S4, S5 | 2026-11-08 | HIGH | Tanggal persis beda 1 hari antar sumber (14 vs 15 Feb). Aman: "Februari 1946" |
| 4 | Tujuan awal: menghitung tabel tembakan (firing/ballistic tables) artileri untuk Ballistic Research Laboratory | S1, S4, S7, S10 | 2026-11-08 | HIGH | |
| 5 | Tugas besar pertamanya (Des 1945) justru perhitungan reaksi termonuklir untuk proyek bom hidrogen (Los Alamos) | S4, S5, S10 | 2026-11-08 | HIGH | Sensitif; opsional |
| 6 | Sekitar 18.000 tabung vakum | S1, S2, S3, S5, S6 | 2026-11-08 | HIGH | Angka persis 17.468 hanya dari Wikipedia (S11 catatan kaki); tandai MED bila dipakai |
| 7 | Berat sekitar 30 ton (short ton; ≈27 ton metrik) | S1, S3, S5, S10 | 2026-11-08 | HIGH | Pakai "sekitar 27 ton" atau "sekitar 30 ton (ukuran AS)" |
| 8 | Daya listrik 150 kilowatt, dengan jalur listrik khusus | S1, S10 | 2026-11-08 | HIGH | |
| 9 | Ruangan sekitar 30 × 50 kaki (≈9 × 15 m); 40 panel tersusun bentuk U, panjang depan ~80 kaki (~24 m) | S1, S5 | 2026-11-08 | HIGH | ETHW S4 menyebut 20 × 40 kaki, CHM S3 ">1.000 sq ft", Wikipedia 300 sq ft (tapak mesin). Aman: "memenuhi satu ruangan besar" |
| 10 | Tinggi ~8 kaki (~2,5 m), panjang hampir 100 kaki (~30 m); didinginkan 80 blower udara | S5, S6 (2,5 m × 24 m) | 2026-11-08 | HIGH | Panjang 24–30 m tergantung cara ukur |
| 11 | Tabung vakum berfungsi sebagai saklar elektronik dengan mengatur aliran elektron | S1, S7 | 2026-11-08 | HIGH | |
| 12 | ENIAC menghitung dalam DESIMAL, bukan biner: 20 akumulator, masing-masing menyimpan bilangan desimal 10 digit | S1, S4, S10 | 2026-11-08 | HIGH | Membantah ide bank "angka biner" |
| 13 | Tiap digit disimpan di ring counter 10 posisi (10 flip-flop); penjumlahan = menghitung pulsa, carry saat counter "berputar balik" seperti roda mesin hitung mekanis | S10 | 2026-11-08 | MED | Hanya Wikipedia (rujukan Burks). Konsisten dengan S7 (roda 10 gigi Babbage sebagai analogi) |
| 14 | Kecepatan: 5.000 penjumlahan/pengurangan per detik (siklus 200 mikrodetik, clock 100 kHz) | S10 | 2026-11-08 | MED | Tidak menemukan sumber primer kedua yang bisa diakses. Alternatif aman (HIGH): "lebih dari 1.000 kali lebih cepat dari mesin sebelumnya" (S3) |
| 15 | ENIAC lebih dari 1.000 kali lebih cepat dari komputer elektromekanis sebelumnya | S3 | 2026-11-08 | MED | Satu sumber tepercaya (CHM) |
| 16 | Diprogram dengan kabel patch di plugboard dan saklar (panel-ke-panel), bukan program tersimpan | S1, S3, S4, S7, S10 | 2026-11-08 | HIGH | Inti reveal |
| 17 | Menyiapkan satu masalah ke mesin biasanya butuh berminggu-minggu | S10 | 2026-11-08 | MED | Ide bank "berhari-hari" lebih lemah; pakai "berhari-hari sampai berminggu-minggu" |
| 18 | Ada function table portabel berisi ~1.200 saklar putar 10 posisi masing-masing; total ~6.000 saklar & kabel di function table, akumulator, constant transmitter | S1, S10 | 2026-11-08 | HIGH | |
| 19 | Input/output via kartu berlubang IBM (card reader & card punch) | S1, S4, S10 | 2026-11-08 | HIGH | |
| 20 | Enam programmer perempuan: Kathleen McNulty, Jean Jennings, Betty (Frances) Snyder, Marlyn Wescoff, Frances Bilas, Ruth Lichterman | S1, S2, S6 | 2026-11-08 | HIGH | Nama menikah: Antonelli, Bartik, Holberton, Meltzer, Spence, Teitelbaum |
| 21 | Mereka awalnya "human computer" yang menghitung lintasan peluru untuk Angkatan Darat; nama mereka tidak dicantumkan dalam publikasi 1946 | S1, S6 | 2026-11-08 | HIGH | |
| 22 | Demonstrasi publik Feb 1946 dijalankan Marlyn Wescoff & Ruth Lichterman | S1 | 2026-11-08 | MED | Satu sumber |
| 23 | Masalah utama: keandalan tabung. Rata-rata satu tabung putus kira-kira tiap 1–2 hari | S2, S10 | 2026-11-08 | HIGH | |
| 24 | Solusi: tabung dijalankan jauh di bawah batas (Eckert: ~seperempat daya / di bawah tegangan maks), uji komponen ketat; kerusakan paling sering saat pemanasan/pendinginan | S1, S2, S10 | 2026-11-08 | HIGH | "Saat dinyalakan/dimatikan" dari S10 saja (MED) |
| 25 | Tim perawatan bisa menemukan & mengganti tabung rusak dalam ~15 menit | S2 | 2026-11-08 | MED | CHM; Wikipedia senada |
| 26 | Dipindah ke Aberdeen Proving Ground 1947, beroperasi sampai 2 Oktober 1955 | S1, S10 | 2026-11-08 | HIGH | |
| 27 | Colossus (Inggris): Mk1 bekerja di Bletchley Park awal 1944, Mk2 1 Juni 1944; untuk memecah sandi Lorenz ("Tunny") Jerman; dirancang Tommy Flowers | S7, S8, S11 | 2026-11-08 | HIGH | S7 menyebut Jan 1943 (tampak salah ketik); pakai TNMOC: akhir 1943/awal 1944 |
| 28 | Colossus ~1.600 tabung (Mk1), ~2.400 (Mk2); khusus kriptanalisis, juga diatur ulang dengan colokan & saklar | S7, S8 (2.500), S11 | 2026-11-08 | HIGH | |
| 29 | Colossus dirahasiakan sampai 1970-an, sehingga ENIAC lama dianggap komputer elektronik pertama | S7, S8, S9 | 2026-11-08 | HIGH | |
| 30 | Z3 Konrad Zuse (Berlin, 1941) = komputer digital terprogram pertama yang bekerja, tapi elektromekanis (relay) | S7, S11 | 2026-11-08 | HIGH | |
| 31 | Atanasoff–Berry Computer (Iowa State), ~300 tabung, tidak pernah bekerja andal, dihentikan 1942 | S7, S10 | 2026-11-08 | HIGH | |
| 32 | Biaya ~US$487.000–500.000 (1946) | S10 | 2026-11-08 | LOW/MED | Wikipedia saja; jangan dipakai |
| 33 | "ENIAC menghitung lebih banyak dalam 10 tahun daripada seluruh umat manusia sebelumnya" | S3 ("It was believed…") | 2026-11-08 | LOW | Klaim anekdot; jangan dipakai |
