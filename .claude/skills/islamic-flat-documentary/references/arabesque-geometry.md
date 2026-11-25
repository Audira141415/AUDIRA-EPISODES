# Arabesque Geometry Reference — Sacred 8-Point Stars & Girih Tiles

Panduan pembuatan pola geometri Islam matematis menggunakan SVG dan kode prosedural kanvas.

## 1. Konstruksi Bintang 8 Sudut (Khatam / Rub el Hizb)
Bintang 8 sudut Islam terbentuk dari dua bujursangkar identik yang salah satunya diputar 45 derajat.

```typescript
export function generateRubElHizbPath(size: number, cx: number, cy: number): string {
  const r = size / 2;
  const points: [number, number][] = [];
  
  // 16 titik puncak dan lembah berselang-seling
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const currentR = i % 2 === 0 ? r : r * 0.7071; // r * cos(45°)
    points.push([cx + Math.cos(angle) * currentR, cy + Math.sin(angle) * currentR]);
  }
  
  return `M ${points.map(p => p.join(',')).join(' L ')} Z`;
}
```

## 2. Transisi Putaran Geometri (Girih Transition)
- Saat pergantian adegan, bintang 8 tengah membesar dari skala `0.0` ke `3.5` sambil berputar lambat `15 derajat`.
- Latar belakang adegan baru terungkap dari dalam rongga interior bintang (*stencil mask reveal*).
- Garis tepi emas berketebalan 2px tetap bersinar di tepian selama transisi.

