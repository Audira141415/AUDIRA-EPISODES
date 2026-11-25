// Runs the audira_validate_social_captions check directly on every episode of this series.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const root = "F:/AUDIRA-VIDEO-MOTION/AUDIRA_KISAH_ISLAM_2026/";
for (const [ep, keys] of [
  ["EP01_ASHABUL_KAHFI_309_TAHUN", ["Ashabul Kahfi", "309", "Ibnu Katsir", "18:25"]],
  ["EP02_YUNUS_TIGA_KEGELAPAN", ["Yunus", "21:87", "Tirmidzi", "Ibnu Mas'ud"]],
  ["EP03_PASUKAN_GAJAH_ABRAHAH", ["Abrahah", "Al-Fil", "570", "Abdul Muthalib"]],
  ["EP04_MUSA_MEMBELAH_LAUT", ["Musa", "Firaun", "26:63", "sekali-kali tidak"]],
  ["EP05_BAHTERA_NUH_950_TAHUN", ["Nuh", "950", "Judi", "papan dan pasak"]],
  ["EP06_IBRAHIM_API_JADI_DINGIN", ["Ibrahim", "21:69", "berhala", "dingin"]],
  ["EP07_SULAIMAN_SEMUT_HUDHUD", ["Sulaiman", "semut", "27:18", "Saba"]],
  ["EP08_YUSUF_TUJUH_SAPI", ["Yusuf", "sapi", "12:47", "14 tahun"]],
  ["EP09_MUSA_KHIDIR_TIGA_KEJADIAN", ["Khidir", "Bukhari 122", "perahu", "18:82"]],
  ["EP10_DZULQARNAIN_TEMBOK_BESI", ["Dzulqarnain", "tembaga", "18:96", "Koresh"]],
  ["EP11_QARUN_KUNCI_HARTA", ["Qarun", "28:76", "kunci", "ilmuku"]],
  ["EP12_HABIL_QABIL_GAGAK", ["gagak", "5:32", "Adam", "kurban"]],
  ["EP13_UNTA_NABI_SALEH", ["Tsamud", "unta", "UNESCO", "Nabath"]],
  ["EP14_THALUT_UJIAN_SUNGAI", ["Thalut", "Jalut", "2:249", "sungai"]],
  ["EP15_KEBUN_HANGUS_SEMALAM", ["kebun", "68:17", "Ibnu Katsir", "orang miskin"]],
  ["EP16_AYYUB_HENTAKAN_KAKI", ["Ayyub", "21:83", "38:42", "hentak"]],
  ["EP17_ASHABUL_UKHDUD_PEMUDA", ["pemuda", "Muslim", "Al-Buruj", "raja"]],
  ["EP18_SAPI_BETINA_BANI_ISRAIL", ["sapi", "2:67", "Al-Baqarah", "nyaris"]],
  ["EP19_HUD_ANGIN_KAUM_AD", ["Hud", "'Ad", "46:24", "tujuh malam"]],
  ["EP20_SYUAIB_TIMBANGAN_MADYAN", ["Syu'aib", "Madyan", "timbangan", "11:85"]],
  ["EP21_ZAKARIA_DOA_USIA_TUA", ["Zakaria", "Yahya", "19:4", "kecewa"]],
  ["EP22_ASHABUS_SABT_IKAN_SABTU", ["Sabat", "ikan", "7:164", "menasihati"]],
  ["EP23_LUQMAN_NASIHAT_ANAK", ["Luqman", "31:13", "biji sawi", "anakku"]],
  ["EP24_SERATUS_TAHUN_KELEDAI", ["seratus tahun", "keledai", "2:259", "Uzair"]],
  ["EP25_BENDUNGAN_SABA_BANJIR", ["Saba'", "Ma'rib", "34:15", "UNESCO"]],
  ["EP26_IBRAHIM_DEBAT_RAJA", ["Ibrahim", "2:258", "matahari", "barat"]],
  ["EP27_HAJAR_ZAMZAM_TUJUH_KALI", ["Hajar", "Zamzam", "Bukhari 3364", "Shafa"]],
  ["EP28_MUSA_PARA_PENYIHIR", ["penyihir", "20:67", "tongkat", "bersujud"]],
  ["EP29_MARYAM_POHON_KURMA", ["Maryam", "kurma", "19:25", "bersedih"]],
  ["EP30_DAUD_BESI_LUNAK", ["Daud", "besi", "34:10", "Bukhari 2072"]],
  ["EP31_IBRAHIM_EMPAT_BURUNG", ["Ibrahim", "burung", "2:260", "hatiku tenang"]],
  ["EP32_BAYI_MUSA_PETI_NIL", ["Musa", "sungai", "28:7", "peti"]],
  ["EP33_RATU_SABA_LANTAI_KACA", ["Saba", "kaca", "27:44", "singgasana"]],
  ["EP34_LELAKI_UJUNG_KOTA", ["ujung kota", "Yasin", "36:20", "kaumku"]],
  ["EP35_DUA_BELAS_MATA_AIR", ["dua belas", "mata air", "2:60", "Musa"]],
]) {
  const r = validateSocialCaptions({ episodeDir: root + ep, expectedKeywords: keys });
  console.log(ep, r.ok, JSON.stringify(r.errors));
}
