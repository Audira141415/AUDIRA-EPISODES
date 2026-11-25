# Candlestick Engine Reference — Procedural OHLC & Volume

Dokumentasi kalkulasi matematika dan render lilin bursa (Candlestick) deterministik untuk Remotion dan React Three Fiber.

## 1. Struktur Data Lilin (Candle DTO)

```typescript
export interface CandleData {
  timeIndex: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

## 2. Logika Anatomi Lilin
- **Bullish (Naik):** `close >= open` -> Warna Emerald Green (`#00E676`).
- **Bearish (Turun):** `close < open` -> Warna Scarlet Red (`#FF1744`).
- **Real Body:** Kotak persegi panjang dari `min(open, close)` hingga `max(open, close)`.
- **Upper Wick:** Garis vertikal tipis (lebar 2px / silinder diameter 0.02) dari puncak bodi ke `high`.
- **Lower Wick:** Garis vertikal tipis dari dasar bodi ke `low`.

## 3. Rumus Normalisasi Koordinat Kanvas (Auto-Scaling)

Agar grafik selalu muat rapi di dalam bidang pandang kamera:
```typescript
const minPrice = Math.min(...candles.map(c => c.low));
const maxPrice = Math.max(...candles.map(c => c.high));
const priceRange = maxPrice - minPrice || 1;

export function priceToY(price: number, chartHeight: number, chartBottomY: number): number {
  return chartBottomY + ((price - minPrice) / priceRange) * chartHeight;
}
```

## 4. Volume Sub-Panel
- Volume bar ditempatkan di 20% area bawah grafik.
- Tinggi bar volume berbanding lurus dengan nilai `volume` terhadap `maxVolume`.
- Warna bar volume mewarisi warna lilin yang bersangkutan dengan opasitas 0.65.

