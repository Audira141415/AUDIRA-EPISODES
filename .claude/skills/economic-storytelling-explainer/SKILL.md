---
name: economic-storytelling-explainer
description: "Cinematic macroeconomic, financial flow, GDP growth, currency valuation, and trade route explainer motion graphics. By AUDIRA (Agus Dwi R)."
version: "4.1.0"
author: "AUDIRA (Agus Dwi R)"
website: "https://audira.my.id/"
license: "Proprietary Commercial"
category: "economic-journalism"
engine: "Remotion + R3F (default since 2026-11-17); world3d only when the user forces it"
style_code: "TRADINGTERMINAL + DATAPHYSICAL"
---

# Economic Storytelling Explainer Skill — AUDIRA (Agus Dwi R)

Specialized motion skill for visual economic journalism: explaining interest rate cycles, inflation shocks, supply chain choke points, currency reserves, national debt ceilings, and global trade corridors.

## 1. Visual DNA & Data Physicalization Rules

1. **Concrete Tangible Metaphors (Never Vague Abstract Blobs)**:
   - Money is shown as physical pallets of cash, gold bullion blocks, or ledger records with exact denomination markings.
   - Inflation is illustrated via purchasing power shrinking (e.g. buying a basket of groceries in 1980 vs. 2026), not meaningless floating circles.
2. **Dual-Layer Information Architecture**:
   - Background: Dark macro economic atmosphere (`#0A0E17` obsidian or financial slate) with subdued world trade grids.
   - Foreground: Laser-sharp HUD telemetry, dynamic ticker bars, and high-contrast statistical callouts (`JetBrains Mono` numbers, `Inter` / `Cinzel` titles).
3. **Flow Dynamics**:
   - Capital flows shown with concrete carriers (GLB cargo ships, containers, trucks) moving along trade routes (Strait of Malacca, Suez Canal, Panama Canal); light streams are an accent only.
   - Carrier count, speed and route line thickness correspond directly to trade volume (e.g., $1.2 Trillion / year).

## 2. Color Palette & Financial Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `BULL_EMERALD` | `#00E676` | Economic growth, surplus, liquidity inflow, positive yield |
| `BEAR_CRIMSON` | `#FF1744` | Deficit, contraction, inflation spike, asset devaluation |
| `SOVEREIGN_GOLD` | `#FFD700` | Central bank gold reserves, sovereign wealth, treasury bonds |
| `WALL_ST_NAVY` | `#0B132B` | Financial institution backdrop, institutional grounding |
| `LEDGER_SILVER` | `#CFD8DC` | Balance sheet gridlines, metric axis lines, neutral labels |
| `CURRENCY_CYAN` | `#00F0FF` | Digital payment rails, FX swaps, interbank clearing |

## 3. Kinetic Patterns

- **Interest Rate Seesaw & Lever**: Central bank discount rate knob rotating, tilting the see-saw between equity valuation and bond yields.
- **Supply Chain Bottleneck Simulation**: Flow of cargo containers constricting through a narrowed channel, causing price meters downstream to escalate rapidly.
- **Devaluation Waterfall**: Currency purchasing power bar progressively sliced away year-by-year with exact consumer basket costs.
- **Debt Ceiling Rising Gauge**: High-tension dial gauge creeping into red danger zone with flashing audit warning markers.

## 4. Remotion Implementation Pattern

> Contoh Remotion — hanya bila engine: remotion; untuk world3d terjemahkan ke world3d.js (fungsi murni dari t)

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const EconomicMetricBar: React.FC<{
  label: string;
  value: string;
  deltaPercent: number;
  progress: number;
}> = ({ label, value, deltaPercent, progress }) => {
  const isPositive = deltaPercent >= 0;
  const accentColor = isPositive ? '#00E676' : '#FF1744';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '14px 20px',
        background: 'rgba(11, 19, 43, 0.85)',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 4,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#90A4AE', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>{label}</span>
        <span style={{ color: accentColor, fontWeight: 700 }}>
          {isPositive ? `+${deltaPercent.toFixed(1)}%` : `${deltaPercent.toFixed(1)}%`}
        </span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>
        {value}
      </div>
      <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, progress * 100)}%`,
            background: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
      </div>
    </div>
  );
};
```

## 5. Anti-Slop Enforcement
- ❌ DILARANG menggunakan grafik garis acak tanpa label sumbu X (Tahun/Bulan) dan sumbu Y (Persentase/Milyar USD).
- ❌ DILARANG membuat analogi abstrak yang membingungkan penonton tanpa korelasi langsung ke topik narasi.
- ✅ WAJIB menampilkan sumber data resmi di dalam safe zone, y ≤ 1540 px (e.g. `Source: Federal Reserve / World Bank / BPS / IMF Database`).

