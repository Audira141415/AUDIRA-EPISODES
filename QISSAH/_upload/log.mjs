import fs from 'node:fs';
const m = JSON.parse(fs.readFileSync('F:/AUDIRA-EPISODES/QISSAH/_upload/meta.json','utf8'));
const [i, link] = process.argv.slice(2); const e = m[+i];
fs.appendFileSync('F:/AUDIRA-EPISODES/QISSAH/_upload/UPLOAD_LOG.md', `| ${i} | ${e.title.replace(/\|/g,'\|')} | ${e.date} ${e.time} | ${link} |\n`);
