# ASSET MANIFEST — EP01 PENGGANTI GIBRAN WAPRES

**Style:** BROADCASTFORGE | **Engine:** Remotion + R3F

---

## Kit Components (built-in, tidak perlu download)

| Komponen | File | Dipakai di |
|----------|------|-----------|
| Studio 3D | `kits/broadcastforge/scene/VirtualNewsStudio3D.tsx` | Semua scene |
| LED curved wall | `kits/broadcastforge/scene/BroadcastCurvedScreen3D.tsx` | Semua scene |
| Lower third + ticker | `kits/broadcastforge/scene/LowerThirdTicker3D.tsx` | S1–S6 |
| Camera rig | `kits/broadcastforge/camera/rig.ts` | Multi-cam |
| HUD overlay | `kits/broadcastforge/camera/Overlay.tsx` | Semua scene |
| Motion state | `kits/broadcastforge/core/motion.ts` | Semua scene |
| Palette | `kits/broadcastforge/lib/palette.ts` | Semua scene |
| Materials | `kits/broadcastforge/lib/materials.ts` | Semua scene |

## GLB Assets

| Asset | ID | Path | Dipakai di |
|-------|-----|------|-----------|
| Desk monitor | `desk-monitor-32cfce` | `public/models/polyfork/desk-monitor-32cfce.glb` | S1–S5 (anchor desk wings) |

*Anchor dibuat prosedural: `<ToyPerson seed={42} outfit="formal" pose="stand" expression="neutral" />`*

## Brand Assets

| Asset | Path | Dipakai di |
|-------|------|-----------|
| Outro card | `shared/assets/brand/audira-outro-card.svg` | S6 |
| Signature | `src/brand/AudiraSignature.tsx` (copy dari `assets/brand/`) | Semua scene (lapisan terakhir) |

## Fonts (dari core/type/displayFonts.ts)

| Font | Peran | Dipakai di |
|------|-------|-----------|
| Anton (DISPLAY.condensed) | LIVE bug, channel name, BREAKING NEWS, headline, HOAKS stamp | S1–S5 |
| Space Grotesk (DISPLAY.grotesk) | Clock, location, ticker, name card labels | S1–S5 |
| Manrope (DISPLAY.body) | Sub-headline, detail teks | S2–S4 |

## Overlay Props (BroadcastForgeOverlay)

```tsx
<BroadcastForgeOverlay
  channelName="AUDIRA NEWS"
  category="BREAKING NEWS"
  headline="SIAPA PENGGANTI GIBRAN?"
  subHeadline="Prabowo ajukan 2 nama ke MPR · Pelantikan 2 Des 2026"
  location="JAKARTA // BREAKING"
  clock="15:20 WIB"
  tickerItems={[
    "POSISI WAKIL PRESIDEN KOSONG SETELAH GIBRAN MUNDUR",
    "10 NAMA BEREDAR SEBAGAI CALON WAPRES BARU",
    "MPR JADWALKAN PELANTIKAN 2 DESEMBER 2026",
    "CEK FAKTA: 3 HOAKS VIRAL TERBONGKAR",
    "KEPUTUSAN ADA DI TANGAN PRESIDEN PRABOWO",
  ]}
  showPipCorrespondent={false}
/>
```

## Custom HUD (di dalam episode, bukan dari kit)

| HUD | Timing | Visual |
|-----|--------|--------|
| Pasal 8 chip | f=240–600 | Chip putih "PASAL 8 UUD 1945", border cyan, y=500px |
| 60 Hari chip | f=300–660 | Chip amber "MAKS 60 HARI", y=650px |
| T-11 hari | f=180–900 | Top right counter cyan, animate countdown |
| 10 Kandidat label | f=960–2700 | Label merah-putih "10 KANDIDAT BEREDAR", y=300px |
| Name cards (×10) | f=960–2700 | Pop sequential 180f/nama, LED wall BG |
| CEK FAKTA banner | f=2760–4200 | Full LED wall, merah #D32F2F, Anton 96px |
| HOAKS stamp | f tiap hoaks | Merah bold, pop 24 frame, impact SFX |
| Countdown "11" | f=4260–5100 | Cyan digit besar di LED wall |
| 2 DES 2026 | f=4260–5100 | Headline y=960px, Anton 72px |
