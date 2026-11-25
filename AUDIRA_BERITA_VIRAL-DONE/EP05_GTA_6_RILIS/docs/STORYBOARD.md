# Storyboard: EP05 GTA 6 Rilis (CIRCUITFORGE)

Composition `Ep05Preview` / `Ep05Final`, 79.74 s (VO 75.74 s + outro card from 75.94 s). Times come from `studio/src/scenes/ep05/timeline.json`. Code: `studio/src/scenes/ep05/Film.tsx` (camera, HUD, captions) and `filmWorld.tsx` (3D set pieces).

The whole film is one continuous macro world: the SSD board from the approved cover. A hero NAND stack labeled "212 GB" stands with dark NAND "city blocks" around it, and a sunset glow sits at the far edge. Set pieces rise out of the board on a stage in front of the hero, then sink back into it, so the camera never cuts. It cranes, dollies and orbits between them.

Layers in every shot:
- BG: sunset sky, skyline and fog.
- MG: NAND blocks and the hero stack.
- FG: copper traces, passives and data packets.
- HUD: kicker, title and pills.
- Captions: karaoke, top at about 1290 px.

| # | Time (s) | Script section | Visual | Camera | Screen text | Suggested SFX |
|---|---|---|---|---|---|---|
| 1 | 0.0–7.2 | HOOK | Cover frame (frame 0 = thumbnail). The hero stack fills from layer 10 to 13, the active seam flares white, and cyan/amber packets race along the traces. | Slow push-in on the hero (z 6.4 → 4.9) | "212 GB / UNTUK SATU GAME" (shrinks at "Itu ukuran…"), pill "PRE-LOAD SEJAK 10 NOV" | low riser into 0.1, ping on "10" |
| 2 | 7.2–14.4 | KONTEKS | 10 epoxy date chips (10–19 Nov, with weekdays) rise out of the board in a 5×2 grid. Day 10 lights cyan and day 19 lights pink. | Crane up + tilt down onto the grid | "GTA 6", "RILIS: KAMIS, 19 NOV 2026", pills PS5 / Xbox Series X\|S | whoosh 7.3, click 10.1 |
| 3 | 14.4–18.2 | KONTEKS | Pre-load wave: chips 11→19 light amber one by one. A glowing download arrow appears over day 10. | Slow truck right | "PRE-LOAD · 9 HARI LEBIH AWAL", label "UNDUH: BISA" on day 10 | pop 14.4, ping 16.8 |
| 4 | 18.2–20.8 | KONTEKS | A gold padlock drops onto day 19 (download ≠ play). | Dolly in on day 19 | label "MAIN: 19 NOV" with lock icon | click 18.2 |
| 5 | 20.9–27.3 | PENGEMBANGAN | The chips sink. A 20-slot "usable space" column rises. Amber slabs fill 12 slots (212 GB), and a pink ring marks the half-way line. No exact GB figure is shown. | Dolly back to eye level, slow orbit left | "KENAPA DIUNDUH DULUAN?", "212 GB" at the fill top, "> SEPARUH" on the ring, pill "Xbox Series S · ruang yang bisa dipakai" | whoosh 20.9, riser 22.9–24.8 |
| 6 | 27.3–31.3 | PENGEMBANGAN | The column sinks. 14 download lanes fan into a single network gate chip. Packets slow, pile up and turn red, and the gate LED blinks red. | Crane up over the funnel | "JUTAAN UNDUHAN, HARI YANG SAMA", red "JARINGAN TERSENDAT", chip "ILUSTRASI" | glitch 30.0 |
| 7 | 31.3–32.6 | PENGEMBANGAN | The jam clears: packets turn cyan again and flow fast. | Slow drift | "PRE-LOAD = BEBAN DIBAGI" | whoosh 31.3 |
| 8 | 32.7–45.4 | PENJELASAN | One pre-order tower grows slab by slab with each figure. | Low 3/4 view, camera rises with the tower | "ANTUSIASME DALAM UANG", source pill "Sensor Tower · firma riset", counters "7,71 JUTA pre-order digital", "≈ US$751 JUTA", "> Rp13 TRILIUN" | ping 37.0, 40.1, 42.2 |
| 9 | 45.4–51.4 | PENJELASAN | The top 5 slabs hop to a second tower. The two towers get caps: cyan "74% PlayStation" and green "26% Xbox". A red ESTIMASI stamp slams in. | Orbit left | "74% DI PLAYSTATION", stamp "ESTIMASI · Sensor Tower · bukan penjualan resmi" | whoosh 45.4, impact 47.4 (light) |
| 10 | 51.4–57.5 | PENJELASAN | The towers hold, with the Take-Two card in a silkscreen-green plaque style. No logo, no person. | Continue orbit | "TAKE-TWO / induk Rockstar / pesanan awal: jauh di atas perkiraan internal" | pop 51.9 |
| 11 | 57.6–62.8 | PAYOFF | The towers sink, and a metal-stand price tag rises with the hero visible behind it. | Eye-level dolly | tag "Rp1,19 juta · EDISI STANDAR · DIGITAL PS5 · PlayStation Store Indonesia", title "HARGA DI INDONESIA" | chime 60.9 |
| 12 | 62.8–66.4 | PAYOFF | The tag slides out and a generic game case (no artwork) opens. Left side: empty dashed disc ring "TANPA CAKRAM". Right side: a "KODE UNDUH" card. | Slow pan | "VERSI FISIK / TANPA CAKRAM", pill "isinya: kode unduhan" | whoosh 62.8, click 64.1 |
| 13 | 66.4–68.2 | PAYOFF | The case sinks, revealing an empty chip footprint on the board, silkscreened "PC ?" with a pink pulse outline. | Tilt down, top-down | "VERSI PC? / BELUM DIUMUMKAN" | glitch 66.9 (soft) |
| 14 | 68.3–75.9 | OUTRO | Back to the full hero. The "AUDIRA · NVMe · REV 1.0 · 212 GB" silkscreen sits on the board in front of the hero at about 1150 px (about 7 s on screen). | Rise over the board toward the hero | "RUANG 212 GB SUDAH SIAP?", pill "TULIS KONSOLMU DI KOMENTAR" | riser 74.9 |
| 15 | 75.9–79.7 | OUTRO | AUDIRA outro card (`_shared/Outro.tsx`) | — | — | chime 76.0 |

Notes:
- Screen numbers come only from SCRIPT/HIGH research or are labelled as Sensor Tower estimates: 212 GB, 10/19 Nov, 7,71 juta, US$751 juta, > Rp13 triliun, 74%/26%, Rp1,19 juta.
- The Series S usable GB figure is not shown, only "> SEPARUH".
- There are no GTA, Rockstar, PlayStation or Xbox logos, art or characters. Names appear as plain text only.
- The moving AUDIRA signature is added by Root.tsx.
