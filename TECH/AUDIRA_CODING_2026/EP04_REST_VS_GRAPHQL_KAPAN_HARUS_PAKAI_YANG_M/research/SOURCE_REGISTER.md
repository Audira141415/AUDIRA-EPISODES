# Source Register — REST vs GraphQL: Kapan Harus Pakai yang Mana

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Facebook mulai membangun ulang aplikasi mobile native pada 2012 dan butuh API data News Feed; GraphQL dikembangkan untuk itu | GraphQL: A data query language, Lee Byron, Meta Engineering, 2015 | https://engineering.fb.com/2015/09/14/core-data/graphql-a-data-query-language/ | 2026-11-25 | HIGH |
| 2 | Pada 2015 Facebook mulai membuka GraphQL (spesifikasi, implementasi acuan, komunitas); layanan RESTful dapat butuh beberapa round-trip, boros di jaringan seluler | GraphQL: A data query language, Lee Byron, Meta Engineering, 2015 | https://engineering.fb.com/2015/09/14/core-data/graphql-a-data-query-language/ | 2026-11-25 | HIGH |
| 3 | REST dirumuskan di disertasi Roy Fielding, Bab 5 "Representational State Transfer (REST)", 2000 | Architectural Styles and the Design of Network-based Software Architectures, Roy T. Fielding, UC Irvine, 2000 | https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm | 2026-11-25 | HIGH |
| 4 | GraphQL dibuat 2012, open source oleh Facebook 2015; GraphQL Foundation berdiri 2019 di bawah Linux Foundation | What is the GraphQL Foundation?, graphql.org | https://graphql.org/foundation/ | 2026-11-25 | HIGH |
| 5 | GraphQL diekspos di satu endpoint, umumnya berakhiran /graphql; permintaan lewat POST | Serving over HTTP, graphql.org | https://graphql.org/learn/serving-over-http/ | 2026-11-25 | HIGH |
| 6 | Di API berbasis endpoint, URL adalah pengenal unik global untuk cache HTTP; GraphQL tidak punya primitif seperti itu sehingga API sebaiknya mengekspos ID unik | Caching, graphql.org | https://graphql.org/learn/caching/ | 2026-11-25 | HIGH |
| 7 | Hasil query GraphQL berbentuk sama dengan query; server tahu persis field yang diminta klien | Queries, graphql.org | https://graphql.org/learn/queries/ | 2026-11-25 | HIGH |
| 8 | GraphQL API GitHub: 5.000 poin per jam per pengguna; satu panggilan maks 500.000 node; first/last 1–100 | Rate limits and query limits for the GraphQL API, GitHub Docs (dibaca 2026-11-25) | https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api | 2026-11-25 | HIGH |
| 9 | REST API GitHub: 5.000 permintaan per jam pengguna terautentikasi; 60 per jam tanpa autentikasi | Rate limits for the REST API, GitHub Docs (dibaca 2026-11-25) | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-11-25 | HIGH |
| 10 | REST = kumpulan batasan desain arsitektur untuk sistem terdistribusi yang efisien dan skalabel | REST, MDN Web Docs Glossary | https://developer.mozilla.org/en-US/docs/Glossary/REST | 2026-11-25 | MEDIUM |
