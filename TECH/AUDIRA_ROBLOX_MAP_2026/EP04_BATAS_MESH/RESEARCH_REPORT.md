# EP 04: Batas 20.000 segitiga dan collision fidelity

Seri AUDIRA, RAHASIA BIKIN MAP ROBLOX. Created by Agus Dwi R. Riset 8 November 2026. Style: DRAFTFORGE.

## Riset

### 3. Batas tersembunyi model 3D di Roblox

**Hook:** Model 3D sebagus apa pun ditolak Roblox kalau segitiganya lebih dari 20 ribu.

**Fakta terverifikasi (*General specifications*, *Texture specifications*, *Meshes*):**
- Satu mesh **tidak boleh melebihi 20.000 segitiga**.
- Resolusi tekstur maksimal **4096×4096** (4K). Engine memuat versi kualitas rendah dulu, lalu naik sesuai kemampuan perangkat.
- Saran resmi ukuran tekstur:
  - objek 5×5 stud: 256×256;
  - objek 10×10 stud: 512×512;
  - objek 20×20 stud: 1024×1024.
- Material bawaan Part memakai tekstur **1024×1024 per 8×8 stud**. Material Terrain memakai **512×512 per 8×8 stud**.
- Detail mesh otomatis turun sesuai jarak dari kamera: **di bawah 250 stud tertinggi**, **250–500 stud sedang**, **500 stud ke atas terendah**.
- Bentuk tabrakan bisa dipilih: **Box, Hull, Default, PreciseConvexDecomposition**, atau **Tunable** dengan slider. Bentuk tabrakan paling presisi pun tidak 1:1 dengan tampilan, dan paling berat dihitung.

**Sudut viral:** "Kenapa kadang karakter nabrak udara di dekat pohon? Karena bentuk tabrakannya beda dengan bentuk yang kamu lihat."

**Catatan:** Klaim "nabrak udara" harus disajikan sebagai penjelasan konsep collision fidelity, bukan kasus game tertentu.
