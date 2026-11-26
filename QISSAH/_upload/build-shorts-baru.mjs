// Meta Short QISSAH dari AUDIRA_SHORT_BARU_2026_11_23 (sesi s7). Path file relatif ke F:/AUDIRA-EPISODES (jalankan serve.mjs dengan AU_ROOT=F:/AUDIRA-EPISODES).
import fs from 'node:fs';
const B='AUDIRA_SHORT_BARU_2026_11_23/';
const AI='\n\n⚠️ Video memakai suara & visual AI (Altered or Synthetic Content).';
const L=[
 ['2026-12-14','EP07_HIDANGAN_DARI_LANGIT','FINAL_VIDEO.mp4'],
 ['2026-12-15','EP08_NABI_ILYAS_BERHALA_BAAL','FINAL_VIDEO.mp4'],
 ['2026-12-16','EP23_ISMAIL_PERINTAH_QURBAN','FINAL_VIDEO.mp4'],
 ['2026-12-17','EP24_SULAIMAN_WAFAT_BERSANDAR_TONGKAT','FINAL_EP24_SULAIMAN_tagged.mp4'],
 ['2026-12-18','EP25_TIGA_ORANG_TERJEBAK_GUA','FINAL_VIDEO.mp4'],
 ['2026-12-19','EP26_PEMBUNUH_100_JIWA_BERTAUBAT','FINAL_EP26_PEMBUNUH_100_JIWA_BERTAUBAT.mp4'],
];
const out=L.map(([date,dir,mp4])=>{
  const t=fs.readFileSync('F:/AUDIRA-EPISODES/'+B+dir+'/SOCIAL_CAPTIONS.md','utf8').replace(/\r/g,'').split('\n');
  let i=t.findIndex(l=>/^##+ .*YouTube/.test(l)); const s=[];
  for(let j=i+1;j<t.length&&!/^## /.test(t[j]);j++) s.push(t[j]);
  let title='',tags=''; const d=[];
  for(const l of s){
    if(/^\**Judul\**:/.test(l)) title=l.replace(/^\**Judul\**:\**\s*/,'').replace(/\*+/g,'').trim();
    else if(/^\**Tags\**:/.test(l)) tags=l.replace(/^\**Tags\**:\**\s*/,'').replace(/\*+/g,'').trim();
    else if(/^(Teks cover|Komentar pin|Subtitle|Thumbnail|Pin)\b/i.test(l)) continue;
    else d.push(l.replace(/^\**Deskripsi\**:\**\s*/,''));
  }
  const description=d.join('\n').replace(/\n{3,}/g,'\n\n').trim()+AI;
  return {date,time:'11:30',file:B+dir+'/'+mp4,title,description,tags};
});
fs.writeFileSync('F:/AUDIRA-EPISODES/QISSAH/_upload/meta.json',JSON.stringify(out,null,1));
out.forEach((o,i)=>console.log(i,o.date,o.time,'|',o.title,'| desc',o.description.length,'| tags',o.tags.length,'| exists',fs.existsSync('F:/AUDIRA-EPISODES/'+o.file)));
