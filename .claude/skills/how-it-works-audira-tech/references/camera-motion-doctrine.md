# Camera Motion Doctrine & Vector Continuity — AUDIRA TECH

Video dokumenter teknik AI sering kali terasa seperti kumpulan klip acak yang ditempel jika arah gerak kamera saling bertabrakan (*disorienting vector clash*). Dokumen ini menetapkan standar **Motion Doctrine** dan **Vector Ledger** untuk menjaga kesinambungan momentum kamera.

---

## 🧭 1. Prinsip Kekekalan Momentum Kamera (Vector Conservation)

Ketika Scene N berakhir dengan kamera bergerak ke arah tertentu, Scene N+1 harus:
1. **Mewarisi arah vektor tersebut** (misal: lanjutan gerakan push-in yang lebih dalam), ATAU
2. **Melakukan cut netral pada sumbu ortogonal** (misal: beralih ke orthographic cross-section diam), ATAU
3. **Menggunakan elemen penyapu (whip-pan / particle burst)** sebagai transisi logis.

### Larangan Keras:
- Dilarang keras melakukan cut dari **kamera orbit ke kiri cepat** langsung ke **kamera orbit ke kanan cepat** pada objek yang sama dalam hitungan milidetik (*vector whiplash*).
- Dilarang membalikkan arah sumbu z secara tiba-tiba (Scene N: zoom in cepat menembus casing → Scene N+1: zoom out menjauh dari objek).

---

## 📊 2. Matriks Vektor Pasangan (Vector Ledger)

Gunakan tabel pasangan transisi kamera berikut saat menyusun storyboard:

| Exit Vector (Scene N) | Rekomendasi Entry Vector (Scene N+1) | Efek Psikologis bagi Pemirsa |
|---|---|---|
| **Dolly In / Push-Forward** | **Macro Probe Push-In** (lanjutan tembus ke dalam komponen) | Penonton merasa "masuk" ke dalam jantung mesin tanpa jeda. |
| **Orbital Left-to-Right** | **Slight Orbital Left-to-Right** atau **Static Tracking** | Aliran pandangan mata tetap stabil di sisi kanan layar. |
| **Exploded Burst (Mekar ke Luar)** | **Hover Micro-Float** (komponen mengambang tenang) | Memberi jeda mata untuk membaca anotasi HUD perakitan. |
| **Crane Down (Menukik ke Bawah)** | **Vertical Tilt Down** ke fondasi/bagian bawah mesin | Mengikuti hukum gravitasi dan aliran material. |
| **Static Locked-off Shot** | **Any Slow Initiating Movement** (pan pelan atau zoom halus) | Perpindahan dari diagram statis ke demonstrasi hidup. |

---

## ⚓ 3. Jangkar Spasial (Spatial Anchoring)

Di format vertikal 9:16, area fokus manusia sangat sempit.
1. **The 30% Golden Sphere:** Pusat aksi mekanis terpenting harus selalu berada di dalam lingkaran imajiner radius 30% dari titik tengah layar (center coordinates: `X=540, Y=960`).
2. **Rule of Horizon Locking:** Pada shot rotasi orbit, garis cakrawala atau sumbu utama mesin tidak boleh bergoyang miring lebih dari 5 derajat, kecuali disengaja untuk dramatisasi sudut pandang mekanik (*Dutch angle*).

---

## 📝 4. Format Catatan Vektor di Storyboard

Setiap entri storyboard wajib mencatat **Camera Entry**, **Camera Action**, dan **Camera Exit**:

```markdown
### Scene 04: Rotor Assembly Spin
- Durasi: 5.5 detik
- Entry Vector: Dolly In [Z: +20% speed] dari Scene 03
- Motion: Sumbu kamera melayang maju sambil orbit halus 15° ke kanan mengelilingi stator
- Exit Vector: Dolly In berlanjut [Z: +40% speed] menuju inti koil tembaga (Matching Scene 05)
```

