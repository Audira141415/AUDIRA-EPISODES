# SHOTLIST — EP31 Cara Kerja Internet

- Style: CIRCUITFORGE
- Hook: paket data cyan melesat dari chip smartphone melewati PCB raksasa
- Offset: 0

Engine: Remotion + R3F | VO: 81.04 s | Total: 85 s (4 s outro pad)

## World Layout

One continuous PCB board (48 × 16 units) with 5 functional zones along x-axis.
Camera tracks left-to-right following a data packet's journey.

| Zone | X pos | Element |
|------|-------|---------|
| A — Smartphone | −20 | Phone GLB + screen glow + tap pulse |
| B — DNS | −10 | BGA chip + lookup LEDs |
| C — Routers | 0 | 3× router chips + hop traces |
| D — Submarine Cable | 2–16 | Long fiber trace + repeater stations |
| E — Server | 18 | Server rack GLB + processing LEDs |
| Brand | 0, z=−5 | AUDIRA gold chip |

Copper traces connect all zones (main data bus at z=0, secondary at z=±1.5).

## Shot List

| # | Waktu | Objek | Aksi | Kamera | Teks | Beat |
|---|-------|-------|------|--------|------|------|
| 1 | 0.0–3.0 | smartphone chip, layar menyala | jari menekan layar, paket data cyan terbentuk | macro hold, push-in | | Hook |
| 2 | 3.0–6.5 | paket data, copper trace | paket data melesat keluar dari chip smartphone ke jalur tembaga | macro tracking | | Hook |
| 3 | 6.5–14.0 | DNS resolver chip BGA | chip DNS menyala, 3 LED lookup hidup berurutan, alamat IP muncul | truck right, orbit | DNS LOOKUP | Context |
| 4 | 14.0–21.0 | DNS chip, jalur tembaga ke router | paket data melanjutkan perjalanan dari DNS ke array router | orbit, track right | | Context |
| 5 | 21.0–30.0 | 3 router chip silikon | paket membelah jadi 3, melompat antar router, LED hop menyala | track lateral, crane up | HOP 1-18 | Main |
| 6 | 30.0–40.0 | router array dari atas, trace menyebar | ketiga paket terpisah melewati jalur berbeda menuju kabel laut | crane high angle | | Main |
| 7 | 40.0–48.0 | kabel fiber submarine, repeater station | paket data menyelam ke kabel bawah laut, fiber trace menyala cyan | dolly along cable | 200,000 km/s | Main |
| 8 | 48.0–55.5 | ujung kabel, server rack data center | paket tiba di data center, LED server hidup berurutan | dolly forward | | Main |
| 9 | 55.5–63.0 | server chip heat sink, LED pemrosesan | server memproses paket, reassembly TCP, data dikompilasi | orbit server | TCP REASSEMBLY | Explanation |
| 10 | 63.0–70.5 | server chip dari sudut tinggi | halaman web terbentuk dari potongan data, paket balasan dikirim | orbit high angle | | Explanation |
| 11 | 70.5–78.0 | seluruh PCB board 48 unit, semua trace | semua jalur tembaga menyala serentak amber+cyan, full circuit aktif | reveal pull-back | FULL CIRCUIT | Payoff |
| 12 | 78.0–80.0 | PCB board top-down, chip AUDIRA emas | kamera mendarat di tampak atas, chip brand AUDIRA berkilau | settle top-down | AUDIRA | Payoff |
| 13 | 80.0–85.0 | outro AUDIRA monolit, credit | outro card AUDIRA muncul, semua LED berkedip pelan | settle hold | Created by Agus Dwi R. | Outro |

## Camera Rig (shotPlan beats)

```
Start: target [-20, 0.3, 0], az -15, el 25, dist 4, fov 30 (macro on phone)
 1.5 s  pushIn(0.8)                    — zoom on tap
 3.5 s  frame az -5, el 18, dist 2.8   — tight on data emit
 8.0 s  frame target [-10, ...] dist 6  — truck to DNS
15.0 s  orbit(-30)                      — DNS orbital
23.0 s  frame target [0, ...] dist 7    — track to routers
32.0 s  crane(18, 0.5)                  — rise over hop paths
42.0 s  frame target [8, ...] dist 4.5  — dolly along cable
50.0 s  frame target [18, ...] dist 6   — arrive at server
58.0 s  orbit(28)                       — server orbital
66.0 s  frame el 35, dist 5.5           — high angle server
72.0 s  reveal(3.0, 22)                 — pull back
78.0 s  framingFrom [0,30,10] → [0,0,0] — full board top-down
80.0 s  settle                          — land
85.0 s  settle                          — hold for outro
```
