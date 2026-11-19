# ASSET_MANIFEST — Cara Kerja Internet (EP31)

## Aset 3D (GLB dari Polyfork)
| ID | Nama | Tipe | Tri | Scene | Penggunaan |
|---|---|---|---|---|---|
| smartphone-5f05e5 | Smartphone | ultra | 102 | S1, S5, S6 | Titik awal dan akhir perjalanan data |
| small-server-rack-8ae0a4 | Small Server Rack | prop | 708 | S4, S5 | Data center server array |
| laptop-e775ba | Laptop | prop | 626 | S6 | Device alternatif di payoff |

Penggunaan: `<AssetModel id="smartphone-5f05e5" assetType="ultra" />`

## Aset Prosedural (dibuat di R3F)
| Objek | Metode | Scene |
|---|---|---|
| PCB board | BoxGeometry + solder mask material | Semua |
| Traces (jalur tembaga) | TubeGeometry / ExtrudeGeometry, gold material, emissive saat aktif | Semua |
| Router chip | RoundedBoxGeo + gold pins (cylinder array) + heat spreader | S3 |
| DNS chip | RoundedBoxGeo besar + label hologram | S2 |
| Data packet | Emissive sphere/cube, animasi path-follow di trace | S1–S6 |
| Kabel bawah laut | CylinderGeometry tebal + sheath material | S4 |
| Kapasitor SMD | CylinderGeometry kecil + metallic cap | BG/FG filler |
| Resistor | RoundedBoxGeo kecil + color band | BG/FG filler |
| Via hole | CylinderGeometry tembus board | Detail board |
| Chip AUDIRA (outro) | RoundedBoxGeo + gold engraving | S7 |

## Brand Assets
| File | Lokasi | Scene |
|---|---|---|
| AudiraSignature.tsx | src/brand/ (dari assets/brand/) | Overlay semua scene |
| audira-outro-card.svg | shared/assets/brand/ | S7 outro |

## Audio
| File | Sumber | Scene |
|---|---|---|
| vo.wav | Cartesia TTS | Semua (Audio Master Clock) |
| sfx.wav | npm run sfx (prosedural) | Semua |
