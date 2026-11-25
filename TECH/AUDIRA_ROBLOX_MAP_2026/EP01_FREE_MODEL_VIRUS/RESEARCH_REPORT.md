# EP 01: Free model Toolbox bisa memuat virus

Seri AUDIRA, RAHASIA BIKIN MAP ROBLOX. Created by Agus Dwi R. Riset 8 November 2026. Style: GLITCHFORGE.

## Riset

### 5. Free model di Toolbox bisa membawa "virus"

**Hook:** Model gratis di Toolbox bisa terlihat berguna, padahal diam-diam memuat aset lain saat game berjalan.

**Fakta terverifikasi (*Toolbox*, *Creator Store*):**
- Creator Store berisi **jutaan aset** dari Roblox dan kreator independen: model, material, plugin, audio, dan lainnya.
- Dokumentasi resmi memperingatkan bahwa aset yang **"terlihat berguna" bisa memuat aset "virus" lain saat runtime**.
- Karena itu Creator Store **melarang**:
  - menyembunyikan fitur engine lewat LuaVM, `getfenv()` dan `setfenv()`;
  - memuat aset dari jauh lewat `require(assetId)`, `loadstring()`, `InsertService:LoadAsset()`, `AssetService:LoadAssetAsync()` dan `ModuleScript.LinkedSource`;
  - **kode yang diobfuscate**, karena kreator tidak bisa memastikan script hanya melakukan yang seharusnya;
  - script yang besar tanpa alasan.
- Halaman aset menampilkan **jumlah segitiga, vertex, dan script**.
- Tips resmi: klik kanan objek di Explorer, lalu pilih **Disable Scripts** untuk memakai aset tanpa menjalankan script-nya. Toolbox juga bisa difilter ke **kreator terverifikasi**.
- Batas distribusi per 30 hari: akun terverifikasi boleh 200 model, akun belum terverifikasi hanya 10. Untuk membagikan aset, akun wajib terverifikasi lewat cek usia atau ID pemerintah.

**Sudut viral:** "Sebelum ambil free model, cek dulu script-nya. Roblox sendiri menyebut ada yang bisa memuat 'virus'."

**Catatan:** Tidak menyebut kasus atau game tertentu. Ini edukasi keamanan berdasarkan aturan resmi.
