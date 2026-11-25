// EP45 Musa dan Api di Bukit Thur — scene cuts locked to VO word anchors (public/audio/vo-words.json, VO 91.30 s).
// Every number here is VO seconds (offset 0). Retime = edit this file only, then `npm run sfx` again.

export const VO_SECONDS = 91.3;
export const OUTRO_SECONDS = 3;
export const FILM_SECONDS = 94.6; // VO + 0.3 s tail + 3 s outro card

// Scene starts (anchor word in comment)
export const T = {
  s1: 0, //    "Malam itu gelap" 0.68
  s2: 8.2, //  "Musa baru saja" 8.33
  s3: 23.1, // "Musa berkata" 23.22
  s4: 37.1, // "Sesampainya" 37.24
  s5: 46.0, // "Lalu datang perintah" 46.18
  s6: 57.9, // "Kemudian tangannya" 58.08
  s7: 67.6, // "Malam itu Musa diutus" 67.80
  s8: 82.8, // "Ia naik" 82.93
  outro: 91.6,
  end: FILM_SECONDS,
} as const;

// Beat anchors inside scenes
export const A = {
  apiNyala: 4.4, //       "Lalu di lereng gunung, sebuah api"
  title: 3.0,
  madyan: 10.6, //        "di Madyan"
  dingin: 15.96, //       "Malam semakin dingin"
  tanpaApi: 20.34, //     "Tanpa api, tanpa jalan"
  tunggulah: 24.6, //     "tunggulah di sini"
  sesuluh: 28.6, //       "atau sesuluh api"
  mendaki: 33.38, //      "mendaki sendirian"
  thur: 35.4, //          "Bukit Thur"
  dipanggil: 38.4, //     "ia dipanggil dari arah pohon"
  terompah: 41.7, //      "Lepaskan kedua terompahmu"
  thuwa: 43.59, //        "lembah suci, Thuwa"
  lempar: 47.3, //        "lemparkan tongkatmu"
  ular: 49.44, //         "Tongkat itu berubah"
  mundur: 52.32, //       "Musa mundur"
  janganTakut: 54.27, //  "Jangan takut"
  kembali: 55.9, //       "dikembalikan seperti semula"
  bercahaya: 60.6, //     "keluar putih bercahaya"
  duaTanda: 63.61, //     "Dua tanda pertama"
  sembilan: 65.57, //     "sembilan mukjizat"
  diutus: 68.44, //       "diutus: pergilah kepada Firaun"
  istana: 69.6,
  berdoa: 73.64, //       "Musa berdoa"
  harun: 79.69, //        "Harun, saudaranya"
  naik: 83.08,
  turun: 86.18,
  kisah: 89.12,
} as const;

export const CUTS = [T.s2, T.s3, T.s4, A.terompah, T.s5, T.s6, T.s7, T.s8, T.outro];
