---
name: trading-terminal-motion
description: "Membangun animasi motion graphic antarmuka terminal trading, pasar finansial, crypto, saham, dan telemetri bursa kelas institusional (ala Bloomberg Terminal, TradingView Pro, Binance Depth). Menghasilkan grafik candlestick 2D/3D prosedural, order book depth wall, indikator RSI/MACD, ticker tape harga, PnL leverage counter, dan efek breakout/volatility. By AUDIRA (Agus Dwi R)."
license: Proprietary Commercial (AUDIRA)
metadata:
  author: AUDIRA (Agus Dwi R)
  version: "1.0.0"
  updated: "2026-11-06"
---

# Trading Terminal Motion — Institutional Financial & Crypto Market Engine

Author & Architect: **AUDIRA (Agus Dwi R)**  
Version: `1.0.0 Commercial Release`  
Engine: **world3d** (Three.js in HyperFrames, lihat BRIEF `F:/AUDIRA-EPISODES/shared/world3d/BRIEF.md`). Target Frameworks lama (hanya bila engine: remotion): Remotion (`@remotion/three`, SVG Canvas), GSAP, WebGL Three.js

---

## 1. Ikhtisar & Filosofi Visual

Skill ini didedikasikan untuk memproduksi video motion graphics keuangan, edukasi investasi, analisis teknikal crypto/forex/saham, dan konten viral market update yang berstandar terminal institusi finansial global (Bloomberg Terminal, TradingView, Reuters Eikon).

### Karakteristik Visual Utama:
1. **Dark Void Canvas (`#06080B` / `#0A0E14`):** Latar belakang terminal gelap kontras tinggi untuk memancarkan pendaran neon hijau dan merah tanpa polusi cahaya putih yang menyilaukan.
2. **Procedural Candlesticks:** Batang lilin bursa dengan sumbu atas-bawah (*high/low wicks*) presisi dan bodi tebal (*open/close*), berwarna hijau emerald (`#00E676`) untuk *bullish* dan merah scarlet (`#FF1744`) untuk *bearish*.
3. **Liquidity Depth Wall:** Dinding volume *Order Book* bertingkat (Bids vs Asks) yang bergerak reaktif terhadap arus beli dan jual.
4. **Institutional HUD Telemetry:** Ticker harga berjalan (*running price tape*), rasio leverage dinamis (10x, 25x, 50x), indikator osilator RSI (30 oversold / 70 overbought), serta indikator MACD histogram.
5. **Dynamic Camera & Impact:** Kamera panning horizontal mengikuti tren harga, *breakout snap-zoom* ketika menembus garis resistensi/support, dan *micro-shake* pada momen likuidasi atau flash crash.

---

## 2. Struktur Modul & Referensi

Skill ini membagi logika produksi grafik trading ke dalam 4 modul referensi:

| Modul | File Referensi | Deskripsi |
| :--- | :--- | :--- |
| **Candlestick Engine** | [`references/candlestick-engine.md`](references/candlestick-engine.md) | Formula matematika sumbu, open, high, low, close (OHLC), dan bar volume. |
| **Order Book Depth** | [`references/orderbook-depth.md`](references/orderbook-depth.md) | Algoritma dinding likuiditas bertingkat (Bids vs Asks step curve). |
| **Indicators & Telemetry**| [`references/indicators-telemetry.md`](references/indicators-telemetry.md) | RSI, MACD, Moving Averages (EMA 20/50/200), PnL Counter & Ticker Tape. |
| **Color Tokens & Theme** | [`references/color-tokens.md`](references/color-tokens.md) | Standar token warna terminal Bloomberg Dark, Cyber Crypto, dan Classic Wall St. |

---

## 3. Alur Kerja Produksi Video (Workflow)

1. **Analisis Narasi & Pasangan Aset (Pair):**
   - Tentukan simbol aset (misal: `BTC/USDT`, `ETH/USD`, `XAU/USD (Gold)`, `BBCA.JK`, `NASDAQ 100`).
   - Tentukan narasi pergerakan: *Bull Run Breakout*, *Market Crash & Liquidation*, *Consolidation & Accumulation*, atau *Fibonacci Golden Pocket Reversal*.
2. **Konfigurasi Data OHLC Deterministic:**
   - Gunakan seed atau generator tren deterministik berbasis `frame` agar animasi konsisten di setiap render Remotion (tanpa `Math.random()` liar).
3. **Penyusunan Lapisan Komposisi (Layering):**
   - *Layer 1 (Background):* Grid koordinat halus berjarak 40px dengan aksen garis harga horizontal.
   - *Layer 2 (Volume & Indicators):* Bar volume di 20% bawah layar dan kurva RSI di panel terpisah.
   - *Layer 3 (Candlesticks):* Rangkaian candle terbentuk dari kiri ke kanan dengan efek pendaran glow.
   - *Layer 4 (HUD Callouts):* Garis horizontal harga sekarang (*Current Price Line*) putus-putus dengan badge label harga berkedip.
   - *Layer 5 (Floating Metrics):* Kartu PnL (+342.8%), leverage badge, dan counter kapitalisasi pasar.
4. **Audio & Sound Design Sync:**
   - Detak ticker tape mekanik saat lilin baru tercetak.
   - Suara dentang bel bursa (*cash register ding*) saat target take-profit tersentuh.
   - Peringatan audio alarm red-alert lembut saat support jebol.
   - Normalisasi siaran patuh **EBU R128 (-14 LUFS)**.

---

## 4. Panduan Anti-Slop Finansial (Strict Rules)

- ❌ **Dilarang:** Menampilkan grafik garis acak berbentuk zig-zag tanpa logika OHLC atau tanpa label sumbu harga/waktu.
- ❌ **Dilarang:** Menggunakan warna hijau/merah yang buram atau bertabrakan dengan kontras rendah.
- ❌ **Dilarang:** Menaruh teks penting di luar safe-zone mobile 9:16 (area atas 236px (panel y) dan bawah 380px (caption/engagement) harus bebas dari angka harga krusial).
- ✅ **Wajib:** Setiap lonjakan harga harus didukung oleh lonjakan bar volume di bawahnya untuk realisme pasar finansial yang meyakinkan.
- ✅ **Wajib:** Lolos **The Mute Test** — penonton harus paham apakah aset sedang untung/rugi dan naik/turun bahkan ketika video ditonton tanpa suara.

