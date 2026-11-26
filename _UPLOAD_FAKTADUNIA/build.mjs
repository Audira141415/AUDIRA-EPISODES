// Build hardlinks + meta.json + schedule for @AudiraFaktaDunia uploads (2026-11-26).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'F:/AUDIRA-EPISODES';
const SN = `${ROOT}/FAKTADUNIA/AUDIRA_SEJARAH_NEGARA_2026`;
const SB = `${ROOT}/AUDIRA_SHORT_BARU_2026_11_23`;
const OUT = `${ROOT}/_UPLOAD_FAKTADUNIA`;
const old = JSON.parse(fs.readFileSync(`${SN}/UPLOAD_YT_SCHEDULE.json`, 'utf8'));

const snEps = [23,24,25,26,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,68,69,71,72,73,74,75,76,77];
const sbEps = [3,4,15,16,17,18];

const pad = n => String(n).padStart(2, '0');
const dirOf = (base, n) => fs.readdirSync(base).find(d => d.startsWith(`EP${pad(n)}_`) && fs.statSync(`${base}/${d}`).isDirectory() && fs.readdirSync(`${base}/${d}`).some(f => /^FINAL.*\.mp4$/.test(f)));
const finalOf = dir => {
  const fs_ = fs.readdirSync(dir).filter(f => /^FINAL.*\.mp4$/.test(f));
  return fs_.find(f => /_tagged\.mp4$/.test(f)) || fs_[0];
};

function parseCaptions(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const sec = (t.split(/^## YouTube Shorts.*$/m)[1] || '').split(/^## /m)[0];
  const title = (sec.match(/\*\*Judul:\*\*\s*(.+)/) || [])[1]?.trim();
  const tags = (sec.match(/\*\*Tags:\*\*\s*(.+)/) || [])[1]?.trim();
  let desc = '';
  const m = sec.match(/\*\*Deskripsi:\*\*\s*\n([\s\S]*?)\n\*\*Tags:\*\*/);
  if (m) desc = m[1].trim();
  else {
    const d = (sec.match(/Deskripsi(?: SEO)?:\**\s*(.+)/) || [])[1]?.trim() || '';
    const h = (sec.match(/Hashtag:\s*(.+)/) || [])[1]?.trim() || '';
    desc = [d.replace(/\s*Subtitle: unggah SUBTITLES\.srt\.?/, ''), h].filter(Boolean).join('\n\n');
  }
  return { title, desc, tags };
}

const items = [];
for (const n of snEps) {
  const d = dirOf(SN, n);
  const o = old.find(x => x.ep === d);
  let meta = o ? { title: o.title, desc: o.desc.replace(/\r/g, ''), tags: o.tags } : parseCaptions(`${SN}/${d}/SOCIAL_CAPTIONS.md`);
  items.push({ src: `${SN}/${d}/${finalOf(`${SN}/${d}`)}`, ep: d, series: 'SN', ...meta });
}
const sbItems = sbEps.map(n => {
  const d = dirOf(SB, n);
  return { src: `${SB}/${d}/${finalOf(`${SB}/${d}`)}`, ep: d, series: 'SB', ...parseCaptions(`${SB}/${d}/SOCIAL_CAPTIONS.md`) };
});
// Sisipkan 6 episode SHORT_BARU tiap 4 slot di awal (hook kuat, variasi topik).
sbItems.forEach((it, i) => items.splice(1 + i * 4, 0, it));

// Slot WIB dari heatmap Studio: Sen–Jum 12:00 & 18:00, Sab–Min 10:00 & 18:00.
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const HARI = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
let day = new Date(Date.UTC(2026, 10, 27));
const slots = [];
while (slots.length < items.length) {
  const wd = day.getUTCDay();
  for (const hm of (wd === 0 || wd === 6) ? ['10:00', '18:00'] : ['12:00', '18:00']) {
    slots.push({ date: `${day.getUTCDate()} ${MON[day.getUTCMonth()]} ${day.getUTCFullYear()}`, hari: HARI[wd], time: hm });
  }
  day = new Date(day.getTime() + 864e5);
}

const meta = {};
const rows = [];
items.forEach((it, i) => {
  const no = i + 1;
  if (!it.title || !it.desc || !it.tags) throw new Error(`metadata kurang: ${it.ep}`);
  const title = /#shorts/i.test(it.title) ? it.title : `${it.title} #shorts`;
  if (title.length > 100) throw new Error(`judul > 100: ${it.ep}`);
  const name = `${pad(no)}_${it.series}_${it.ep}.mp4`;
  const dst = `${OUT}/${name}`;
  if (!fs.existsSync(dst)) fs.linkSync(it.src, dst);
  const s = slots[i];
  meta[no] = { file: name, title, desc: it.desc, tags: it.tags, date: s.date, time: s.time };
  rows.push(`| ${no} | ${name} | ${title.replace(/\|/g, '/')} | ${s.hari} ${s.date} ${s.time} |`);
});
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 1));
fs.writeFileSync(`${OUT}/schedule_rows.md`, rows.join('\n') + '\n');
console.log(items.length, 'items;', slots[items.length - 1]);
