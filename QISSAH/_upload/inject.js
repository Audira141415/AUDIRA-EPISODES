window.__auUp = async (idx) => {
  const meta = await fetch('http://127.0.0.1:8765/meta.json').then(r=>r.json());
  const e = meta[idx];
  const rr = await fetch('http://127.0.0.1:8765/'+e.file.split('/').map(encodeURIComponent).join('/')); const rd=rr.body.getReader(); const parts=[]; let buf=[], bl=0; while(true){ const {done,value}=await rd.read(); if(done) break; buf.push(value); bl+=value.length; if(bl>16e6){ parts.push(new Blob(buf)); buf=[]; bl=0; } } if(buf.length) parts.push(new Blob(buf)); const blob=new Blob(parts,{type:'video/mp4'});
  const f = new File([blob], e.file.split('/').pop(), {type:'video/mp4'});
  const orig = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function(){ if(this.type==='file'){ const dt=new DataTransfer(); dt.items.add(f); this.files=dt.files; this.dispatchEvent(new Event('change',{bubbles:true})); HTMLInputElement.prototype.click=orig; return;} return orig.call(this); };
  const btn = [...document.querySelectorAll('button, ytcp-button')].find(b=>/select files/i.test(b.textContent));
  if(!btn){ const inp=document.querySelector('input[type=file]'); if(inp){inp.click();} else return 'no button/input'; } else btn.click();
  window.__auMeta = e;
  return {size: blob.size, title: e.title, date: e.date, time: e.time};
};
window.__auFill = async () => {
  const e = window.__auMeta; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for(let k=0;k<20 && document.querySelectorAll('ytcp-uploads-dialog #textbox[contenteditable]').length<2;k++) await sleep(500);
  const d = document.querySelector('ytcp-uploads-dialog'); if(!d) return 'no dialog';
  const tb = d.querySelectorAll('#textbox[contenteditable]'); if(tb.length<2) return 'no textbox '+tb.length;
  await sleep(1500);
  for (const [i,v] of [[0,e.title],[1,e.description]]) { tb[i].focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, v); }
  d.querySelector('#toggle-button')?.click(); await sleep(800);
  d.querySelector('[name=VIDEO_PAID_PRODUCT_PLACEMENT_NO]')?.click();
  d.querySelector('[name=VIDEO_HAS_ALTERED_CONTENT_YES]')?.click();
  d.querySelector('[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]')?.click();
  const ti = d.querySelector('#tags-container input');
  if (ti) { ti.focus(); ti.value = (Array.isArray(e.tags)?e.tags.join(','):e.tags) + ','; ti.dispatchEvent(new Event('input',{bubbles:true})); ti.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,bubbles:true})); }
  await sleep(500);
  const g = n => d.querySelector('[name='+n+']')?.getAttribute('aria-checked');
  return {ok: tb[0].innerText===e.title, desc: tb[1].innerText.length, chips: d.querySelectorAll('#tags-container ytcp-chip, #chip-bar ytcp-chip').length, alt: g('VIDEO_HAS_ALTERED_CONTENT_YES'), mfk: g('VIDEO_MADE_FOR_KIDS_NOT_MFK'), ppn: g('VIDEO_PAID_PRODUCT_PLACEMENT_NO')};
};
window.__auNext = async () => { const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const d=document.querySelector('ytcp-uploads-dialog'); for(let i=0;i<3;i++){ d.querySelector('#next-button').click(); await sleep(1200);} d.querySelector('#second-container-expand-button')?.click(); await sleep(800); return 'ok'; };
window.__auWait = async (maxMs=38000) => { const t0=Date.now(); let txt=''; while(Date.now()-t0<maxMs){ const d=[...document.querySelectorAll('ytcp-dialog, ytcp-video-share-dialog, ytcp-uploads-still-processing-dialog, tp-yt-paper-dialog')].filter(x=>x.offsetParent); txt=d.map(x=>x.innerText).join(' | ').replace(/\s+/g,' '); if(/Upload complete|Video published|Checks complete/i.test(txt)) break; await new Promise(r=>setTimeout(r,3000)); } const links=[...document.querySelectorAll('a')].map(a=>a.href).filter(h=>/youtu\.be|shorts\//.test(h)); return {done:/Upload complete|Checks complete|published/i.test(txt), pct:(txt.match(/Uploading \d+%/)||[''])[0], sched:(txt.match(/on (\d+ \w+ \d+ at [\d:]+)/)||[''])[1], links}; };
window.__auGo = async (idx) => { const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const u = await window.__auUp(idx); const f = await window.__auFill(); await window.__auNext(); return {u, f}; };
'injected';
window.__auRect = (el) => { const r=el.getBoundingClientRect(); const k=1568/innerWidth; return [Math.round((r.x+r.width/2)*k), Math.round((r.y+r.height/2)*k)]; };
window.__auPos = async (exp) => { const d=document.querySelector('ytcp-uploads-dialog'); const sc=d.querySelector('#schedule-radio-button, ytcp-visibility-scheduler, #second-container'); sc?.scrollIntoView({block:'start'}); await new Promise(r=>setTimeout(r,600));
  const trig=d.querySelector('#datepicker-trigger'); const time=[...d.querySelectorAll('input')].find(i=>/^\d\d:\d\d$/.test(i.value)); const p={trig:window.__auRect(trig), time:window.__auRect(time), sched:window.__auRect(d.querySelector('#done-button'))};
  if (exp) { const bad=Object.keys(exp).filter(k=>Math.abs(p[k][0]-exp[k][0])>12||Math.abs(p[k][1]-exp[k][1])>12); if(bad.length) throw new Error('pos mismatch '+JSON.stringify(p)); } return p; };
window.__auDateFocus = async () => { await new Promise(r=>setTimeout(r,500)); const inp=[...document.querySelectorAll('input')].find(i=>i.offsetParent && /\d{4}$/.test(i.value)); inp.focus(); inp.select(); return inp.value; };
window.__auCheck = (date, time) => { const d=document.querySelector('ytcp-uploads-dialog'); const v=[d.querySelector('#datepicker-trigger')?.innerText.trim(), [...d.querySelectorAll('input')].map(i=>i.value).filter(v=>/^\d\d:\d\d$/.test(v)).join()]; if(v[0]!==date||v[1]!==time) throw new Error('mismatch '+v); return v; };
'injected2';
