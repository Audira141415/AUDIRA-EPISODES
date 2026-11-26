// Hardlink + meta.json untuk upload @AudiraTECH (2026-11-26).
// #0 = draf Doom yang sudah ada di Studio (judul draf "43 SEJARAH GAME EP05 DOOM WINDOWS 95"), #1-#6 = file baru.
import fs from 'node:fs';
const ROOT = 'F:/AUDIRA-EPISODES';
const OUT = `${ROOT}/_UPLOAD_TECH`;
const SB = `${ROOT}/AUDIRA_SHORT_BARU_2026_11_23`;
const list = [
  [`${ROOT}/TECH/AUDIRA_SEJARAH_GAME_2026/EP05_DOOM_WINDOWS_95`, null, '7 Dec 2026', '12:00'],
  [`${SB}/EP05_PLAYSTATION_DARI_NINTENDO`, '01_SB_EP05_PLAYSTATION_DARI_NINTENDO.mp4', '7 Dec 2026', '17:00'],
  [`${SB}/EP06_EASTER_EGG_PERTAMA_GAME`, '02_SB_EP06_EASTER_EGG_PERTAMA_GAME.mp4', '8 Dec 2026', '12:00'],
  [`${SB}/EP19_FLAPPY_BIRD_DIHAPUS`, '03_SB_EP19_FLAPPY_BIRD_DIHAPUS.mp4', '8 Dec 2026', '17:00'],
  [`${SB}/EP20_ANGRY_BIRDS_GAME_KE52`, '04_SB_EP20_ANGRY_BIRDS_GAME_KE52.mp4', '9 Dec 2026', '12:00'],
  [`${SB}/EP21_BUG_Y2K_TAHUN_2000`, '05_SB_EP21_BUG_Y2K_TAHUN_2000.mp4', '9 Dec 2026', '17:00'],
  [`${SB}/EP22_DEMAM_TAMAGOTCHI_1996`, '06_SB_EP22_DEMAM_TAMAGOTCHI_1996.mp4', '10 Dec 2026', '12:00'],
];
function parse(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const sec = (t.split(/^## YouTube Shorts.*$/m)[1] || '').split(/^## /m)[0];
  const title = (sec.match(/\*\*Judul:\*\*\s*(.+)/) || [])[1]?.trim();
  const tags = (sec.match(/\*\*Tags:\*\*\s*(.+)/) || [])[1]?.trim();
  let desc;
  const m = sec.match(/\*\*Deskripsi:\*\*\s*\n([\s\S]*?)\n\*\*Tags:\*\*/);
  if (m) desc = m[1].trim();
  else {
    const d = (sec.match(/Deskripsi(?: SEO)?:\**\s*(.+)/) || [])[1]?.trim() || '';
    const h = (sec.match(/^(#\S+(?:\s+#\S+)*)\s*$/m) || [])[1] || '';
    desc = [d, 'AUDIRA TECH. Created by Agus Dwi R.', h].filter(Boolean).join('\n\n');
  }
  return { title, desc, tags };
}
const meta = {};
list.forEach(([dir, name, dt, tm], i) => {
  const src = `${dir}/${fs.readdirSync(dir).find(f => /^FINAL.*\.mp4$/.test(f))}`;
  const p = parse(`${dir}/SOCIAL_CAPTIONS.md`);
  if (!p.title || !p.desc || !p.tags) throw new Error('metadata kurang: ' + dir);
  const t = /#shorts/i.test(p.title) ? p.title : `${p.title} #shorts`;
  if (t.length > 100 || p.desc.length > 5000) throw new Error('terlalu panjang: ' + dir);
  if (name && !fs.existsSync(`${OUT}/${name}`)) fs.linkSync(src, `${OUT}/${name}`);
  meta[i] = { file: name, t, d: p.desc, g: p.tags.replace(/,\s*$/, ''), dt, tm };
});
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 1));
for (const [k, v] of Object.entries(meta)) console.log(k, v.dt, v.tm, '|', v.t, '| desc', v.d.length, '| tags', v.g.length);
