# Source Register — Cara Kerja ChatGPT: Dari Token ke Jawaban

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Transformer: arsitektur berbasis attention saja, tanpa recurrence/konvolusi; 8 penulis; 28,4 BLEU (EN-DE), 41,8 BLEU (EN-FR) setelah 3,5 hari di 8 GPU | Attention Is All You Need, Vaswani dkk., arXiv 2017 (dikirim 12 Jun 2017) | https://arxiv.org/abs/1706.03762 | 2026-11-25 | HIGH |
| 2 | Subword units (byte pair encoding) untuk kata langka di penerjemahan mesin; pertama dikirim ke arXiv 31 Agu 2015, diterima ACL 2016 | Neural Machine Translation of Rare Words with Subword Units, Sennrich, Haddow, Birch, 2015/2016 | https://arxiv.org/abs/1508.07909 | 2026-11-25 | HIGH |
| 3 | GPT-3: model bahasa autoregresif 175 miliar parameter, uji few-shot tanpa gradient update | Language Models are Few-Shot Learners, Brown dkk., arXiv 2020 | https://arxiv.org/abs/2005.14165 | 2026-11-25 | HIGH |
| 4 | InstructGPT: fine-tuning dengan umpan balik manusia (RLHF); model 1,3 miliar parameter lebih disukai daripada GPT-3 175 miliar (100x lebih sedikit parameter) | Training language models to follow instructions with human feedback, Ouyang dkk., arXiv 2022 (4 Mar 2022) | https://arxiv.org/abs/2203.02155 | 2026-11-25 | HIGH |
| 5 | ChatGPT diperkenalkan 30 Nov 2022 sebagai research preview gratis; dilatih dengan RLHF seperti InstructGPT, pelatih manusia memerankan pengguna dan asisten; OpenAI mengakui jawaban kadang masuk akal tapi salah; alasannya: saat pelatihan RL tidak ada sumber kebenaran | Introducing ChatGPT, OpenAI, 30 Nov 2022 | https://openai.com/index/chatgpt/ | 2026-11-25 | HIGH |
| 6 | Perkiraan token (bahasa Inggris): 1 token ≈ 4 karakter ≈ 3/4 kata; 100 token ≈ 75 kata; hitungan token berbeda per model, encoding, dan bahasa (per 2026-11-25) | Understanding and counting tokens, OpenAI Help Center | https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them | 2026-11-25 | MEDIUM |
