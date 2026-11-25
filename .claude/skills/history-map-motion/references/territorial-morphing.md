# Territorial Morphing Reference — Dynamic Border Shifts & Color Flood

Panduan teknis pembuatan animasi perubahan batas wilayah teritorial sejarah.

## 1. Mekanisme Perluasan Wilayah (Color Flood)
Ketika sebuah faksi merebut suatu wilayah:
1. Garis batas terluar lawan berkedip (*flash border* 100ms).
2. Garis batas ditembus oleh ujung panah manuver.
3. Shading warna faksi baru meluas dari titik invasi menyebar ke seluruh poligon provinsi dengan efek masker radial (*radial dissolve/wipe*).
4. Label teks nama faksi lama memudar (*fade out*), digantikan oleh label nama faksi baru.

## 2. Palet Identitas Faksi Sejarah Standar
- **Kekaisaran Romawi / Imperium Barat:** Crimson Red (`#8B1E1E`) + Gold Border (`#D4AF37`).
- **Kekaisaran Mongol / Stepa:** Ochre Khaki (`#C49A45`) + Iron Blue (`#2A4D69`).
- **Kekhalifahan Islam / Dinasti Timur Tengah:** Deep Emerald Green (`#136F45`) + Gold Leaf (`#E0B858`).
- **Dinasti Tiongkok (Han/Tang/Ming):** Imperial Vermilion (`#B32D29`) + Jade Teal (`#286E66`).
- **Wilayah Netral / Buffer Zone:** Slate Dark Grey (`#2F3640`) bergaris arsir diagonal.

