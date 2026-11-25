# Order Book Depth Reference — Liquidity Wall Stepping

Dokumentasi pembuatan kurva kedalaman pasar (Market Depth Chart) untuk visualisasi pertempuran antara pembeli (*bids*) dan penjual (*asks*).

## 1. Konsep Kedalaman Pasar
- **Sisi Kiri (Bids / Pembeli):** Area hijau bertingkat menumpuk dari harga tertinggi ke bawah. Menunjukkan dinding likuiditas support.
- **Sisi Kanan (Asks / Penjual):** Area merah bertingkat menumpuk dari harga terendah ke atas. Menunjukkan dinding likuiditas resistensi.
- **Titik Tengah (Spread):** Celah harga antara penawar tertinggi dan penjual terendah.

## 2. Algoritma Kurva Bertingkat (Step-Curve Generation)
```typescript
export interface DepthPoint {
  price: number;
  cumulativeVolume: number;
}

export function generateDepthCurve(points: DepthPoint[], side: 'bid' | 'ask') {
  // Menghasilkan koordinat polyline berbentuk tangga ortogonal (orthogonal step lines)
  // Menghindari garis diagonal mulus karena order book bursa bertingkat diskret per tick size
}
```

## 3. Efek Visual & Animasi
- Shading gradasi vertikal: Warna solid di garis tepi atas, memudar transparan ke dasar kanvas.
- Pulse denyut likuiditas: Ketika pesanan besar masuk (*whale order*), dinding menaik drastis dengan kilatan cahaya aksen.

