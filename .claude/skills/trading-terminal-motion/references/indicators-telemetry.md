# Indicators & Telemetry Reference — HUD Overlays & Metrics

Panduan teknis indikator analisis finansial dan panel instrumen HUD untuk video gerak bertema pasar saham dan kripto.

## 1. Indikator Teknikal Esensial

### A. Exponential Moving Average (EMA)
- **EMA 20 (Garis Cepat):** Warna Amber Neon (`#FFB300`).
- **EMA 50 (Garis Sedang):** Warna Cyan Neon (`#00E5FF`).
- **EMA 200 (Garis Tren Makro):** Warna Ungu Violet (`#7C4DFF`).
- **Golden Cross Effect:** Ketika EMA 20 memotong ke atas EMA 50, munculkan partikel kilatan dan lingkaran pendaran.

### B. Relative Strength Index (RSI)
- Panel terpisah dengan skala 0 hingga 100.
- Garis batas atas 70 (Overbought / Jenuh Beli) bergaris putus-putus merah.
- Garis batas bawah 30 (Oversold / Jenuh Jual) bergaris putus-putus hijau.

### C. Live Ticker Tape
- Bar horizontal di paling atas atau paling bawah layar.
- Bergerak mengalir ke kiri (scrolling marquee) menampilkan pasangan mata uang: `BTC/USDT $94,250 +4.2%  ▲ | ETH/USDT $3,420 +2.8% ▲ | SOL/USDT $195 -1.1% ▼`.

## 2. Floating PnL & Leverage Cards
- Kartu mengambang di samping aksi candle dengan *blur glassmorphism* gelap.
- Menampilkan:
  - Posisi: `LONG` (Hijau) atau `SHORT` (Merah).
  - Leverage: `[ 20x LEVERAGE ]`.
  - PnL Bersih: Font monospaced besar dengan tanda tambah/minus tebal.

