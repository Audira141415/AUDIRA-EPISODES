// Runs the audira_validate_social_captions check directly; the MCP tool is not exposed in this session.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const root = "F:/AUDIRA-VIDEO-MOTION/FAKTADUNIA/AUDIRA_SEJARAH_NEGARA_2026/";
for (const [ep, keys] of [
  ["EP01_ZANZIBAR_38_MENIT", ["Zanzibar", "38", "1896", "Khalid"]],
  ["EP02_PERANG_EMU_AUSTRALIA", ["emu", "Meredith", "1932", "9.860"]],
  ["EP03_DAGEN_H_SWEDIA", ["Dagen H", "Swedia", "04.50", "83%"]],
  ["EP04_ALASKA_DIJUAL_RUSIA", ["Alaska", "Seward", "7,2 juta", "1867"]],
  ["EP05_BOLIVIA_ANGKATAN_LAUT", ["Bolivia", "Titicaca", "1879", "3.812"]],
  ["EP06_SAMOA_HAPUS_SATU_HARI", ["Samoa", "2011", "1892", "Jumat"]],
  ["EP07_LIECHTENSTEIN_80_JADI_81", ["Liechtenstein", "81", "1866", "1868"]],
  ["EP08_PULAU_HANS_PERANG_WISKI", ["Hans", "Denmark", "1.280", "2022"]],
  ["EP09_ONODA_29_TAHUN", ["Onoda", "Lubang", "1974", "Nakamura"]],
  ["EP10_VATIKAN_GARDA_SWISS", ["Garda Swiss", "1506", "1527", "147"]],
  ["EP11_PULAU_RUN_DITUKAR_MANHATTAN", ["Run", "Manhattan", "Breda", "1667"]],
  ["EP12_NAURU_KAYA_LALU_BANGKRUT", ["Nauru", "fosfat", "2006", "Naoero"]],
  ["EP13_TURKI_GANTI_ALFABET", ["Turki", "1928", "29 huruf", "Atatürk"]],
  ["EP14_BRASILIA_41_BULAN", ["Brasília", "41 bulan", "1960", "Kubitschek"]],
  ["EP15_PENGUIN_JENDERAL_NORWEGIA", ["Nils Olav", "penguin", "2008", "mayor jenderal"]],
  ["EP16_INDONESIA_KELUAR_PBB", ["Indonesia", "PBB", "1965", "CONEFO"]],
  ["EP17_BHUTAN_TV_1999", ["Bhutan", "1999", "1989", "BBS"]],
  ["EP18_SPANYOL_LAGU_TANPA_LIRIK", ["Spanyol", "Marcha Real", "lirik", "1761"]],
  ["EP19_SWISS_BUNKER_NUKLIR", ["Swiss", "bunker", "114%", "1963"]],
  ["EP20_SELANDIA_BARU_HAK_PILIH", ["Selandia Baru", "1893", "Kate Sheppard", "petisi"]],
  ["EP21_PERANG_BABI_1859", ["babi", "1859", "San Juan", "Inggris"]],
  ["EP22_BELGIA_589_HARI", ["Belgia", "589", "Kamboja", "2010"]],
  ["EP23_TEMBOK_BERLIN_SALAH_UCAP", ["Tembok Berlin", "1989", "Schabowski", "segera"]],
  ["EP24_NEPAL_BENDERA", ["Nepal", "bendera", "1962", "konstitusi"]],
  ["EP25_BANGKOK_NAMA_PANJANG", ["Bangkok", "168", "Krung Thep", "Guinness"]],
  ["EP26_PULAU_PHEASANT", ["Pheasant", "Prancis", "Spanyol", "1659"]],
  ["EP27_BIR_TAWIL", ["Bir Tawil", "Mesir", "Sudan", "Halaib"]],
  ["EP28_PERANG_COD_ISLANDIA", ["Islandia", "Inggris", "200 mil", "NATO"]],
  ["EP29_KALENDER_ETIOPIA", ["Etiopia", "13 bulan", "Pagumen", "11 September"]],
  ["EP30_UTANG_HAITI", ["Haiti", "Prancis", "150 juta franc", "1825"]],
]) {
  const r = validateSocialCaptions({ episodeDir: root + ep, expectedKeywords: keys });
  console.log(ep, r.ok, JSON.stringify(r.errors), JSON.stringify(r.platforms["X/Twitter"]));
}
