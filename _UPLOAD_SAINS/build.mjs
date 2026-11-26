// Hardlink + meta.json untuk upload @AudiraSains (2026-11-26). Slot: Sen–Jum 13:00 & 19:00, Sab–Min 10:00 & 19:00 WIB.
import fs from 'node:fs';
const ROOT = 'F:/AUDIRA-EPISODES';
const OUT = `${ROOT}/_UPLOAD_SAINS`;
const S = `${ROOT}/AUDIRA_SAINS_ANAK_2026`;
const list = [
  ['EP01_KENAPA_LANGIT_BIRU', '27 Nov 2026', '13:00'],
  ['EP02_JARI_KERIPUT_DI_AIR', '27 Nov 2026', '19:00'],
  ['EP03_KENAPA_ES_MENGAPUNG', '28 Nov 2026', '10:00'],
  ['EP04_KENAPA_GUNUNG_MELETUS', '28 Nov 2026', '19:00'],
  ['EP05_SISI_BULAN_YANG_SAMA', '29 Nov 2026', '10:00'],
  ['EP06_LUBANG_HITAM_TIDAK_MENYEDOT', '29 Nov 2026', '19:00'],
  ['EP07_SISTEM_IMUN_TENTARA_TUBUH', '30 Nov 2026', '13:00'],
  ['EP08_CARA_KERJA_PETIR', '30 Nov 2026', '19:00'],
  ['EP09_LAUT_DALAM_MISTERIUS', '1 Dec 2026', '13:00'],
  ['EP10_KUCING_MENDARAT_KAKI', '1 Dec 2026', '19:00'],
];
function parse(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const sec = (t.split(/^## YouTube Shorts.*$/m)[1] || '').split(/^## /m)[0];
  const title = (sec.match(/\*\*Judul[^*]*\*\*\s*(.+)/) || [])[1]?.trim();
  const tags = (sec.match(/\*\*Tags[^*]*\*\*\s*(.+)/) || [])[1]?.trim();
  let desc = (sec.match(/\*\*Deskripsi[^*]*\*\*\s*\n([\s\S]*?)\n\*\*Tags/) || [])[1]?.trim();
  if (!desc) {
    const d = (sec.match(/^Deskripsi(?: SEO)?:\s*(.+)$/m) || [])[1]?.trim();
    const src = (sec.match(/^Sumber:\s*(.+)$/m) || [])[1]?.trim();
    const h = (sec.match(/^(?:Hashtag[^:]*|Tags):\s*(#.+)$/m) || [])[1]?.trim();
    if (d) desc = [d, src && 'Sumber: ' + src, 'Seri Sains "Kenapa" dari AUDIRA Sains (@AudiraSains). Created by Agus Dwi R.', h].filter(Boolean).join('\n\n');
  }
  return { title, desc, tags };
}
const meta = {};
list.forEach(([ep, dt, tm], i) => {
  const n = i + 1, dir = `${S}/${ep}`;
  const finals = fs.readdirSync(dir).filter(f => /^FINAL.*\.mp4$/.test(f)).sort();
  const src = `${dir}/${finals.find(f => /_tagged/.test(f)) || finals[0]}`;
  const p = parse(`${dir}/SOCIAL_CAPTIONS.md`);
  if (!p.title || !p.desc || !p.tags) throw new Error('metadata kurang: ' + ep + JSON.stringify(p).slice(0, 200));
  const t = /#shorts/i.test(p.title) ? p.title : `${p.title} #shorts`;
  const g = p.tags.replace(/,\s*$/, '');
  if (t.length > 100 || p.desc.length > 5000 || g.length > 500) throw new Error('terlalu panjang: ' + ep);
  const name = `${String(n).padStart(2, '0')}_${ep}.mp4`;
  if (!fs.existsSync(`${OUT}/${name}`)) fs.linkSync(src, `${OUT}/${name}`);
  meta[n] = { file: name, t, d: p.desc, g, dt, tm };
});
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 1));
fs.writeFileSync(`${OUT}/M.js`, 'window.M=' + JSON.stringify(meta) + ';Object.keys(M).length');
for (const [k, v] of Object.entries(meta)) console.log(k, v.dt, v.tm, '|', v.t, '| desc', v.d.length, '| tags', v.g.length);
