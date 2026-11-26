# Source Register — SSH Key Setup Sekali untuk Seumur Hidup

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis/penerbit, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | SSH diciptakan 1995 oleh Tatu Ylonen setelah serangan password-sniffing di Helsinki University of Technology | Secure Shell, Wikipedia, 2026 | https://en.wikipedia.org/wiki/Secure_Shell | 2026-11-25 | HIGH |
| 2 | Ed25519 dirancang oleh Daniel J. Bernstein dkk., dipublikasikan 26 September 2011, kunci 256-bit setara keamanan RSA ~3000-bit | EdDSA, Wikipedia, 2026 (berdasarkan RFC 8032 dan paper asli Bernstein et al. 2011) | https://en.wikipedia.org/wiki/EdDSA | 2026-11-25 | HIGH |
| 3 | GitHub merekomendasikan Ed25519; perintah: `ssh-keygen -t ed25519 -C "email"`. Kunci tersimpan di `~/.ssh/id_ed25519` | Generating a new SSH key, GitHub Docs, 2026 | https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent | 2026-11-25 | HIGH |
| 4 | GitHub menghapus autentikasi password untuk operasi Git pada 13 Agustus 2021, digantikan token dan SSH key | Token authentication requirements for Git operations, GitHub Blog, 2020 (diperbarui 2022) | https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/ | 2026-11-25 | HIGH |
| 5 | ssh-keygen menghasilkan pasangan kunci publik-privat; default RSA 3072-bit, Ed25519 256-bit; DSA deprecated sejak 2013 | ssh-keygen, Wikipedia, 2026 | https://en.wikipedia.org/wiki/Ssh-keygen | 2026-11-25 | MED |
| 6 | OpenSSH dikembangkan oleh OpenBSD Project, tersedia dengan lisensi BSD, versi terbaru 10.6 (Oktober 2026) | OpenSSH, openssh.org, 2026 | https://www.openssh.org/ | 2026-11-25 | MED |
| 7 | Ed25519 distandarkan di RFC 8032 (IETF, Januari 2017) dan FIPS 186-5 (NIST, Februari 2023); nonce deterministik mencegah kebocoran kunci ala PlayStation 3 | EdDSA, Wikipedia, 2026 | https://en.wikipedia.org/wiki/EdDSA | 2026-11-25 | MED |

## Level
- **HIGH**: sumber primer (dokumentasi resmi, RFC, data resmi penerbit, jurnal peer-reviewed)
- **MED**: sumber sekunder terpercaya (ensiklopedia, Wikipedia dengan kutipan, media besar)
- **LOW**: sumber tersier atau tanpa kutipan (blog, forum, media sosial) — hindari di naskah

## Perselisihan / Kontroversi
| Klaim | Posisi A (sumber) | Posisi B (sumber) | Sikap naskah |
|---|---|---|---|
| RSA masih aman vs sudah usang | RSA 3072-bit tetap aman untuk saat ini (NIST SP 800-57) | Ed25519 lebih cepat dan lebih tahan side-channel (Bernstein et al. 2011) | Netral: RSA masih bisa dipakai tapi Ed25519 lebih direkomendasikan untuk setup baru |

## Musik/SFX (sumber + lisensi)
| Aset | Sumber | Lisensi/atribusi |
|---|---|---|
| SFX prosedural | npm run sfx (AUDIRA pipeline) | Dibuat otomatis |
