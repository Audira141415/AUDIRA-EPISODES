# STORYBOARD — EP01 PENGGANTI GIBRAN WAPRES

**Style:** BROADCASTFORGE | **Durasi:** ~87 dtk | **FPS:** 60

---

| Scene | Waktu | BG / MG / FG / HUD | Kamera | Audio |
|-------|-------|---------------------|--------|-------|
| **S1 HOOK** | 0–3s | **BG:** LED wall gelap, scanline sweep aktif. **MG:** Anchor ToyPerson di desk, LIVE bug merah berdenyut. **FG:** LowerThird "BREAKING NEWS / GIBRAN MUNDUR DARI JABATAN WAPRES". **HUD:** Top bar "AUDIRA NEWS ● 15:20 WIB", ticker mulai scroll "POSISI WAKIL PRESIDEN KOSONG ●" | Jib descent: `[0,3.4,8.6]` → `[0,1.65,6.6]`, fov 46→42 selama 3.5s | Opening stinger flash merah (18 frame). Whoosh masuk. VO hook mulai. |
| **S2 CONTEXT** | 4–15s | **BG:** LED wall panel: grafik Pasal 8 UUD 1945 (teks besar) + bar "60 HARI". **MG:** Anchor gestur tangan ke wall. **FG:** HUD chip callout "PASAL 8 UUD 1945" di y≈500px + "MAKS 60 HARI" di y≈650px. **HUD:** Countdown chip "T-11 HARI" di top right. | Anchor MCU `[0,1.6,5.2]` target `[0,1.25,0]` fov 40 | VO §Context. Pop SFX tiap HUD chip muncul. |
| **S3 NAMA** | 16–45s | **BG:** LED wall: 10 name card berurutan muncul satu per satu (teks putih, latar broadcastNavy, cyan border). **MG:** Anchor over-the-shoulder. **FG:** "10 KANDIDAT BEREDAR" label di y≈300px. Name chip kecil muncul FG tiap nama disebut. **HUD:** Ticker update "DARI GERINDRA: SUFMI DASCO, SUGIONO ● PDI-P: PUAN MAHARANI ●..." | OTS ke wall `[-1.8,1.5,5.4]` target `[0,0.6,-2.2]` fov 44; whoosh saat cut | VO §Main Dev. Pop SFX tiap name card. Whoosh kamera cut ke OTS. |
| **S4 HOAKS** | 46–70s | **BG:** LED wall: "⚠ CEK FAKTA" merah besar + background merah gelap. **MG:** Anchor pose tegas. **FG:** HUD card sequence: [1/3] "AHY SIAP JADI WAPRES → HOAKS" stamp merah → [2/3] "DEDI DIPANGGIL ISTANA → KELIRU" → [3/3] "VIDEO PRABOWO 2026 → DARI 2023!". **HUD:** Counter "1/3 → 2/3 → 3/3" di top right. | Anchor MCU ketat `[0,1.6,5.2]` fov 38; kamera stabil, tegas | VO §Hoaks. Impact SFX tiap HOAKS stamp (bukan suara kartun — gunakan news sting pendek). |
| **S5 PAYOFF** | 71–85s | **BG:** LED wall: countdown digital "11" besar cyan + "HARI MENUJU 2 DES 2026" + tanda tanya "???" silhuet posisi wapres. **MG:** Anchor mundur, wide shot studio. **FG:** Big HUD "2 DESEMBER 2026" di tengah y≈960px. **HUD:** Countdown semua aktif. | Low angle `[0,0.9,6.4]` target `[0,1.4,0]` fov 44 → slow pull back | VO §Payoff. Riser SFX (2s) → impact/boom saat "siapa?". |
| **S6 OUTRO** | 86–90s | AUDIRA outro card SVG (audira-outro-card.svg). AudiraSignature fade out. | Cut ke logo, full frame | VO outro "Pantau terus hanya di AUDIRA." Fade music. |

---

## Kinetic HUD Callout — Wajib (Rule Hukum 4)

| Momen VO | Callout Visual | Waktu |
|----------|---------------|-------|
| "60 hari" | HUD chip "MAKS 60 HARI" pop di y=650px | ~6s |
| "dua Desember 2026" | Chip "2 DES 2026" merah di y=500px | ~11s |
| "sepuluh nama" | Label "10 KANDIDAT BEREDAR" muncul | ~16s |
| tiap nama disebut | Name card pop di LED wall | 16–45s |
| "AHY / Dedi / video Prabowo" | HOAKS stamp sequential | 46–70s |
| "sebelas hari" | "11" countdown besar di LED wall | ~71s |

---

## Mute Test

Tanpa suara, penonton harus tahu:
1. Ini breaking news soal Wapres kosong ✓ (BREAKING NEWS lower third)
2. Ada 10 nama yang beredar ✓ (name cards di LED wall)
3. Ada 3 hoaks ✓ (HOAKS stamp + CEK FAKTA banner)
4. Jadwal 2 Desember 2026 ✓ (HUD countdown)
