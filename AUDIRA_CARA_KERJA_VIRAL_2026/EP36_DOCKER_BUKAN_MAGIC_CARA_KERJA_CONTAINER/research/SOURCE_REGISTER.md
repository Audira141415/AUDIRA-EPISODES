# Source Register — Docker Bukan Magic: Cara Kerja Container yang Sebenarnya

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Container = proses biasa dengan tampilan sistem sendiri; semua container berbagi kernel mesin; start ±1 detik; menghapus container menghapus yang ditulisnya | "What is a container?", Docker Docs (Michael Irwin), 2026 | https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/ | 2026-11-25 | HIGH |
| 2 | Kernel Linux punya 8 tipe namespace (Cgroup, IPC, Network, Mount, PID, Time, User, UTS) | namespaces(7), Linux man-pages 6.19, 2026 | https://man7.org/linux/man-pages/man7/namespaces.7.html | 2026-11-25 | HIGH |
| 3 | cgroups membatasi, menghitung, dan mengontrol sumber daya (CPU, memori) kelompok proses | cgroups(7), Linux man-pages, 2026 | https://man7.org/linux/man-pages/man7/cgroups.7.html | 2026-11-25 | HIGH |
| 4 | Proses pertama di PID namespace baru mendapat PID 1; PID sama bisa ada di namespace berbeda | pid_namespaces(7), Linux man-pages, 2026 | https://man7.org/linux/man-pages/man7/pid_namespaces.7.html | 2026-11-25 | HIGH |
| 5 | Layer image read-only (lowerdir), layer container writable (upperdir), digabung lewat OverlayFS (merged) | "OverlayFS storage driver", Docker Docs, 2026 | https://docs.docker.com/engine/storage/drivers/overlayfs-driver/ | 2026-11-25 | HIGH |
| 6 | OCI diluncurkan 22 Juni 2015 oleh Docker, CoreOS, dan lainnya; Docker menyumbangkan runC; ada spesifikasi runtime, image, distribution | "About the Open Container Initiative", Linux Foundation, 2026 | https://opencontainers.org/about/overview/ | 2026-11-25 | MEDIUM |
| 7 | `docker run` membuat satu set namespace dan control group; keamanan kernel jadi salah satu area utama keamanan Docker | "Docker Engine security", Docker Docs, 2025 | https://docs.docker.com/engine/security/ | 2026-11-25 | MEDIUM |
