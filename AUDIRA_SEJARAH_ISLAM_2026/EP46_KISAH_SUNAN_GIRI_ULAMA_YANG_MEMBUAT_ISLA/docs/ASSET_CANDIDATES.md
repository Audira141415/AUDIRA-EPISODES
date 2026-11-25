# Asset Candidates — Kisah Sunan Giri: Ulama yang Membuat Islam Menyebar Lewat Permainan Anak

> Dicari 2026-11-25 di katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`. Tokoh suci (Sunan Giri, Sunan Ampel, Nyai Ageng Pinatih) wajib siluet tanpa wajah: jangan pakai karakter GLB berwajah untuk mereka.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Anak-anak duduk melingkar main Cublak-cublak Suweng, bulan purnama | `village-child-bef09e` / character (character-anim), `neighborhood-child-8cc5ac` / character | Anak boleh berwajah (bukan tokoh suci); bulan dibuat shader/plane emisif |
| c01_intro | Peta Jawa Timur + pin Gresik, siluet ulama di pantai | `palm-sapling-ef7ae4` / prop | Peta 2D overlay; siluet ulama = plane/cutout hitam tanpa wajah |
| c02 | Laut malam, peti kayu terapung, kapal layar, lentera | `chest-padlock-7dc32e` / prop, `sailboat-3ee283` / vehicle (folder ultra), `hand-lantern-cdbe1a` / prop (attachment), `ship-anchor-c2b4f1` / prop | Hapus gembok peti di shader/scene; label "menurut babad" |
| c03 | Surau belajar, bukit hijau dengan pesantren beratap tumpang | `copper-dome-dwelling-dc8848` / building, `civic-dome-pavilion-97ea07` / building | Atap tumpang Jawa tidak ada di katalog: perlu model custom atau ilustrasi 2D |
| c04 | Gapura Giri Kedaton, peta Nusantara dengan jalur dakwah | `tam-tam-gong-dd318c` / prop | Gapura dan peta dibuat 2D/ilustrasi; HUD "1487" |
| c05 | Halaman desa sore, anak membentuk lingkaran Jamuran, kartu judul lagu | `village-child-bef09e` / character, `neighborhood-child-8cc5ac` / character | Klip Idle/Cheer; kartu judul = HUD |
| c06 | Subeng (anting) emas + kerikil di telapak, bulan menerangi desa | belum ada (subeng, kerikil) | Close-up dibuat 2D/ilustrasi |
| c07_payoff | Anak masa kini bermain di bawah purnama, bukit Giri saat fajar, outro | `village-child-bef09e` / character, `palm-sapling-ef7ae4` / prop | Outro card AUDIRA |

Saran engine: 2D — tokoh suci harus siluet, aset arsitektur Jawa abad 15 dan peta tidak tersedia di katalog GLB, sehingga ilustrasi berlapis WAYANGFORGE/BATIKFORGE lebih kuat; 3D hanya untuk adegan laut dan peti (hybrid opsional).
