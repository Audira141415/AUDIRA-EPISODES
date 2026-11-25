# AUDIO PLAN — EP06 Jessica (draf tanpa suara)

## Pemeran suara (setelah naskah disetujui)
- Narator: Risa `6a3fe952-63f8-4c99-865a-44887175ea26`, speed 0.86-0.97.
- Budi: Galang `04b567df-2923-4b0c-896b-4b7df0a07e1a`, speed 0.88-1.1 (1.1 hanya saat membentak).
- Jessica: Risa, speed 1.05-1.1, kalimat pendek seperti anak; 0.98-1.0 untuk bisikan di ambulans dan "Iya, Pa. Lain kali saja...".
- Tidak perlu suara ketiga (laporan tetangga diganti narasi).

## Musik (`mix.py`, numpy)
- Ninabobo kotak musik D mayor, 3/4, 66 bpm, dengan pad senar lembut (I-IV-V-I): identitas Jessica.
- Berhenti di tengah frasa saat Budi membentak; diganti satu akor pad dingin.
- Montase dua minggu: ninabobo lebih lambat dan tipis.
- Sore: hanya ambience. Setelah suara keras: hening total.
- Duka: drone pad D minor rendah.
- Membaca: ninabobo kembali pelan (tempo 0,82) dan ragu, lalu penuh sampai outro.
- Level musik ~-27 dB RMS, turun ~5 dB di bawah setiap baris dialog (dari waktu klip). Mix total -24,6 LUFS, puncak -8,6 dBFS.

## Ambience
- Malam: jangkrik, room tone, detak jam di ruang kerja.
- Montase: burung siang bergantian dengan malam.
- Sore: udara hangat; sirene jauh teredam saat ambulans; angin malam di akhir.

## SFX
| Kapan | SFX |
|---|---|
| s1b + 0,3 dtk | whoosh-cinematic (dinding terbuka) |
| peri muncul | sparkle + chime |
| bentakan | click-soft |
| montase / sore | whoosh-short |
| suara keras (di luar layar) | impact-bass-1 dengan low-pass kuat, lalu hening |
| peri padam | ping sangat pelan |
| duka | whoosh-cinematic redup |
| balik halaman | derau kertas sintetis (3x) |
| warna kembali / sujud | sparkle |
| peri terbang | chime |
| sebelum hikmah | riser redup |
| outro | chime |

## Setelah suara disetujui
Buat VO Cartesia, bangun timeline asli, jalankan `mix.py` lagi (semua cue mengikuti timeline), lalu campur suara di atas mix (suara ~-16 LUFS, musik/SFX ~15 dB di bawah).
