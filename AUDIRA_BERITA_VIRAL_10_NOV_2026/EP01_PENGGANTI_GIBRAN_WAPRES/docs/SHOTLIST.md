# SHOTLIST — EP01 PENGGANTI GIBRAN WAPRES

**VO actual:** 75.70s speech · padded to 90s · 40 phrases  
**Total video:** 90s = 5400f @ 60 FPS  
**Source:** vo.timing.json (npm run vo)

---

## Scene Cuts (Audio Master Clock)

| Scene | VO range | Frame range | Durasi | Trigger |
|-------|----------|-------------|--------|---------|
| S1 HOOK | 0.00–6.00s | f 0–360 | 6s | Speech phrase 1–2 |
| S2 CONTEXT | 6.00–18.07s | f 360–1084 | 12s | "Pasal 8 UUD 1945..." |
| S3 NAMA | 18.07–46.28s | f 1084–2777 | 28s | "Saat ini, sepuluh nama..." |
| S4 HOAKS | 46.28–64.71s | f 2777–3883 | 18s | "Tapi awas! Tiga hoaks..." |
| S5 PAYOFF | 64.71–75.70s | f 3883–4542 | 11s | "Hitung mundur..." |
| S6 OUTRO | 75.70–90.00s | f 4542–5400 | 14s | Silence → outro card |

---

## Name Card Timing (S3, f 1084–2777)

Nama disebut sequentially selama 28s. Tiap nama ~2.8s = 168f.

| Nama | VO approx | Frame | Chip label |
|------|-----------|-------|-----------|
| Sufmi Dasco Ahmad | ~20s | f 1200 | SUFMI DASCO AHMAD · GERINDRA |
| Sugiono | ~22s | f 1320 | SUGIONO · GERINDRA |
| Puan Maharani | ~24s | f 1440 | PUAN MAHARANI · PDI-P |
| Agus Harimurti Yudhoyono | ~26s | f 1560 | AHY · DEMOKRAT |
| Dedi Mulyadi | ~28s | f 1680 | DEDI MULYADI · GOV. JABAR |
| Ahmad Muzani | ~31s | f 1860 | AHMAD MUZANI |
| Teddy Indra Wijaya | ~34s | f 2040 | TEDDY INDRA WIJAYA |
| Bahlil Lahadalia | ~37s | f 2220 | BAHLIL LAHADALIA |
| Pramono Anung | ~40s | f 2400 | PRAMONO ANUNG |
| Natalius Pigai | ~43s | f 2580 | NATALIUS PIGAI · MENTERI HAM |

---

## HOAKS Stamp Timing (S4, f 2777–3883)

| Hoaks | VO approx | Frame | Stamp |
|-------|-----------|-------|-------|
| AHY siap jadi Wapres | ~49s | f 2940 | ✗ HOAKS — VIDEO DIPOTONG |
| Dedi dipanggil Istana | ~56s | f 3360 | ✗ KELIRU |
| Video Prabowo 2026 | ~61s | f 3660 | ✗ DARI 2023! |

---

## SFX Cues

| Momen | Frame | SFX |
|-------|-------|-----|
| Opening stinger | f 0 | news_sting_flash (18 frame) |
| S1→S2 kamera cut | f 360 | whoosh_soft |
| S2→S3 kamera OTS | f 1084 | whoosh_medium |
| Tiap name card pop | per tabel atas | pop_card × 10 |
| S3→S4 kamera cut | f 2777 | whoosh_hard |
| Tiap HOAKS stamp | per tabel atas | impact_sting × 3 |
| S4→S5 kamera cut | f 3883 | whoosh_deep |
| Riser ke payoff | f 3883–4200 | riser_2s |
| Impact payoff | f 4200 | boom_impact |
| S5→S6 outro cut | f 4542 | whoosh_outro |

---

## Multi-Cam Director Code Sketch

```tsx
const t = frame / 60;

// S1 HOOK: jib descent
if (t < 6) return getBroadcastForgeCamera(frame); // continuous jib

// S2 CONTEXT: anchor MCU
if (t < 18.07) return { pos: [0, 1.6, 5.2], target: [0, 1.25, 0], fov: 40 };

// S3 NAMA: OTS ke wall
if (t < 46.28) return { pos: [-1.8, 1.5, 5.4], target: [0, 0.6, -2.2], fov: 44 };

// S4 HOAKS: anchor MCU ketat
if (t < 64.71) return { pos: [0, 1.6, 5.2], target: [0, 1.25, 0], fov: 38 };

// S5 PAYOFF: low angle
if (t < 75.70) return { pos: [0, 0.9, 6.4], target: [0, 1.4, 0], fov: 44 };

// S6 OUTRO
return { pos: [0, 1.65, 6.6], target: [0, 1.2, 0], fov: 42 };
```
