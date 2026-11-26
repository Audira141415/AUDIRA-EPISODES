import fs from 'node:fs';
const R='F:/AUDIRA-EPISODES/QISSAH/';
const AI='\n\n⚠️ Video memakai suara & visual AI (Altered or Synthetic Content).';
function section(file, head){
  const L=fs.readFileSync(R+file,'utf8').replace(/\r/g,'').split('\n');
  let i=L.findIndex(l=>head?l.startsWith(head):/^##+ .*YouTube/.test(l)); const out=[];
  for(let j=i+1;j<L.length && !/^## /.test(L[j]);j++) out.push(L[j]); return out.join('\n');
}
function parse(file, head){
  const s=section(file,head);
  const title=(s.match(/^\**Judul\**:?\**:?\s*(.+)$/m)||[])[1].replace(/\*+/g,'').trim();
  let d=(s.match(/Deskripsi\**:?\**:?\s*([\s\S]*?)(?=\n\**(Tags|Pinned|Komentar pin|Pin|Thumbnail)\b)/)||[])[1]||'';
  d=d.split('\n').filter(l=>!/\[LINK_/.test(l)).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  const hashtags=(s.match(/^Hashtags:\s*(.+)$/m)||[])[1]; if(hashtags && !d.includes('#')) d+='\n\n'+hashtags.trim();
  const tags=((s.match(/^\**Tags\**:?\**:?\s*(.+)$/m)||[])[1]||'').replace(/\*+/g,'').trim();
  return {title, description:d+AI, tags};
}
const KI=(n,t,hook,surah,tags)=>({title:`${t} | Kisah dalam Al-Quran #Shorts`, description:`${hook}\n\nKisah ini diceritakan dalam ${surah}. Visual tokoh berupa siluet tanpa wajah, sesuai adab menggambarkan para nabi.\n\nSeri AUDIRA QISSAH — kisah-kisah dalam Al-Quran, disusun dari ayat dan tafsir.\nDiproduksi oleh Agus Dwi R. (AUDIRA). Koleksi lengkap: https://audira.my.id\n\n#QISSAH #KisahIslami #AUDIRA #SejarahIslam #Shorts`+AI, tags:`kisah nabi, kisah al quran, ${tags}, kisah islami, audira qissah`});
const M=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const out=M.map(e=>{ const meta = e.fixed ? {} : e.ki ? KI(...e.ki) : parse(e.caption, e.head); return {...e, ...meta, ki:undefined}; });
fs.writeFileSync(process.argv[3], JSON.stringify(out,null,1));
out.forEach((o,i)=>console.log(i+1, o.date, o.time, '|', o.title, '| desc', o.description.length, 'ch | tags', o.tags.length));
