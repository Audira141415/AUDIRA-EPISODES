// YouTube Studio draft auto-fill + schedule (AUDIRA Explained). Expects window.__AUD = [{k,title,desc,tags,date,time}].
// Run: window.__run() -> results in window.__res, window.__done. Each video is checked before Schedule is clicked.
(() => {
  const S = ms => new Promise(r => setTimeout(r, ms));
  const D = () => document.querySelector('ytcp-uploads-dialog');
  const fmt = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const setTB = (el, t) => { el.focus(); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('insertText', false, t); };
  const closeShare = () => [...document.querySelectorAll('ytcp-button, button')].find(b => b.offsetParent && b.innerText.trim() === 'Close')?.click();
  const norm = s => s.trim().toLowerCase().replace(/[_-]/g, ' ');
  const open = async k => {
    const r = [...document.querySelectorAll('ytcp-video-row')].find(r => norm(r.querySelector('#video-title')?.textContent || '').startsWith(k));
    const b = r && [...r.querySelectorAll('ytcp-button, button')].find(b => b.innerText.trim() === 'Edit draft');
    if (!b) return false; b.click();
    for (let i = 0; i < 20; i++) { await S(700); if (D()?.querySelectorAll('#textbox').length >= 2) return true; }
    return false;
  };
  const pickTime = async t => { const it = [...document.querySelectorAll('tp-yt-paper-item, [role=option]')].filter(e => e.offsetParent && e.innerText.trim() === t); if (!it.length) return; it[0].scrollIntoView(); it[0].click(); await S(600); };
  const trig = () => D().querySelector('ytcp-datetime-picker #datepicker-trigger');
  // Typing a date does not stick: click the day in the scrollable calendar (starts at Nov 2026).
  const pickDate = async iso => {
    let cal = null;
    for (let i = 0; i < 6 && !cal; i++) { cal = [...document.querySelectorAll('ytcp-scrollable-calendar')].find(e => e.offsetParent); if (!cal) { trig().click(); await S(900); } }
    if (!cal) return;
    const days = [...cal.querySelectorAll('span.calendar-day')].filter(s => !s.className.includes('invisible'));
    const [y, m, d] = iso.split('-').map(Number); let mi = -1, prev = 99, tg = null;
    for (const s of days) { const n = +s.innerText.trim(); if (n < prev) mi++; prev = n; if (2026 + Math.floor((10 + mi) / 12) === y && (10 + mi) % 12 === m - 1 && n === d) { tg = s; break; } }
    if (tg) { tg.scrollIntoView({ block: 'center' }); tg.click(); await S(700); }
  };
  const tz = async () => {
    const b = D().querySelector('#timezone-select-button') || [...D().querySelectorAll('ytcp-visibility-scheduler ytcp-dropdown-trigger, ytcp-visibility-scheduler ytcp-text-dropdown-trigger')].find(e => !e.id.includes('datepicker'));
    if (!b) return; b.click(); await S(800);
    [...document.querySelectorAll('tp-yt-paper-item, [role=option]')].find(e => e.offsetParent && e.innerText.trim().startsWith('(GMT+0700)'))?.click(); await S(600);
  };
  const one = async c => {
    if (!await open(c.k)) return c.k + ' cannot open';
    const dlg = D(); const tbs = dlg.querySelectorAll('#textbox');
    setTB(tbs[0], c.title); await S(400); setTB(tbs[1], c.desc); await S(400);
    dlg.querySelector('[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]').click();
    const tg = dlg.querySelector('#toggle-button'); if (tg.innerText.includes('Show more')) tg.click(); await S(1200);
    const ti = dlg.querySelector('#tags-container input'); ti.focus(); ti.value = c.tags;
    ti.dispatchEvent(new Event('input', { bubbles: true })); ti.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true })); await S(300);
    dlg.querySelector('[name=VIDEO_HAS_ALTERED_CONTENT_YES]').click(); await S(400);
    if (tbs[0].innerText !== c.title || tbs[1].innerText.length < 50) return { k: c.k, abort: 'details' };
    for (let i = 0; i < 3; i++) { dlg.querySelector('#next-button').click(); await S(1500); }
    const sec = [...dlg.querySelectorAll('ytcp-video-visibility-select *')].find(e => e.offsetParent && e.innerText?.trim().startsWith('Schedule\n') && e.querySelector('ytcp-icon-button, [aria-label*=expand i]'));
    sec?.querySelector('ytcp-icon-button, [aria-label*=expand i]')?.click(); await S(1500);
    const p = dlg.querySelector('ytcp-datetime-picker'); if (!p?.offsetParent) return c.k + ' schedule not expanded';
    for (let i = 0; i < 4 && trig().innerText.trim() !== fmt(c.date); i++) { await pickDate(c.date); await S(500); }
    const t = p.querySelector('#time-of-day-container input');
    for (let i = 0; i < 3 && t.value !== c.time; i++) { t.click(); await S(700); await pickTime(c.time); }
    for (let i = 0; i < 3 && !dlg.querySelector('ytcp-visibility-scheduler').innerText.includes('0700'); i++) await tz();
    const st = { date: trig().innerText.trim(), time: t.value, tz: dlg.querySelector('ytcp-visibility-scheduler').innerText.includes('0700') };
    if (st.date !== fmt(c.date) || st.time !== c.time || !st.tz) return { k: c.k, abort: true, ...st };
    dlg.querySelector('#done-button').click();
    let m = null;
    for (let i = 0; i < 10 && !m; i++) { await S(800); const msg = [...document.querySelectorAll('ytcp-video-share-dialog, tp-yt-paper-dialog')].map(d => d.offsetParent ? d.innerText : '').join(' ').replace(/\s+/g, ' '); m = msg.match(/public on (.+? at \d\d:\d\d)/); }
    closeShare(); await S(1500); closeShare(); await S(1000);
    return { k: c.k, when: m?.[1] || '?' };
  };
  window.__run = async () => {
    window.__res = []; window.__done = false;
    for (const c of window.__AUD) {
      let r; try { r = await one(c); } catch (e) { r = c.k + ' ERR ' + e.message; }
      window.__res.push(r); if (typeof r === 'string' || r.abort) break;
    }
    window.__done = true;
  };
})();

window.__AUD = [{"k":"layar hp mu ","title":"Layar HP-mu Merasakan Listrik Tubuhmu — Cara Kerja Layar Sentuh Kapasitif","desc":"Layar HP-mu tidak merasakan tekanan jarimu. Ia merasakan listrik di tubuhmu. Hampir semua ponsel sekarang memakai layar sentuh kapasitif. Bagaimana cara kerjanya?\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-10","time":"7:00 PM"},{"k":"sprinkler ge","title":"Sprinkler Gedung Tidak Menyala Serentak — Fakta vs Film","desc":"Di film, satu sprinkler menyala lalu seluruh gedung basah kuyup. Di dunia nyata, biasanya hanya kepala di atas api yang menyemprot. Bagaimana cara kerja katup kecil ini?\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-11","time":"12:00 PM"},{"k":"penjelasan s","title":"Penjelasan Sayap Pesawat yang Kamu Pelajari di Sekolah Itu Keliru","desc":"Versi yang sering diajarkan: udara di atas sayap menempuh jalan lebih panjang, jadi harus lebih cepat supaya tiba bersamaan. Ternyata itu keliru.\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-11","time":"7:00 PM"},{"k":"dispenser ga","title":"Dispenser Galon Bawah — Bagaimana Air Naik Tanpa Gravitasi?","desc":"Di dispenser galon bawah, air galonmu harus melawan gravitasi. Yang mengangkatnya sebuah pompa kecil. Bagaimana cara kerjanya?\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-12","time":"12:00 PM"},{"k":"lampu led pu","title":"Lampu LED Putih Sebenarnya Lampu Biru yang Menyamar","desc":"Lampu LED putih di rumahmu sebenarnya lampu biru. Lapisan fosfor kuning di atas chip biru mengubah campuran cahayanya jadi putih. Tanpa fosfor, kamarmu biru semua.\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-12","time":"7:00 PM"},{"k":"benjolan di ","title":"Benjolan di Kabel Charger Laptop Itu Bukan Hiasan — Ini Isinya","desc":"Benjolan silinder di kabel charger laptopmu isinya cincin keramik ferit. Fungsinya menyerap noise elektromagnetik supaya kabelmu tidak jadi antena gangguan.\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-13","time":"12:00 PM"},{"k":"cara pesawat","title":"Cara Pesawat Tahu Kecepatannya Sendiri — Tabung Pitot EP26","desc":"Pesawat tidak punya spidometer di roda. Kecepatannya dibaca dari tabung kecil yang menghadap angin — namanya tabung pitot.\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-15","time":"7:00 PM"},{"k":"kenapa kapal","title":"Kenapa Kapal Besar Punya Benjolan di Bawah Hidung?","desc":"Benjolan bulat di bawah haluan kapal besar bukan cacat desain. Namanya bulbous bow — dan justru itu yang bikin kapal lebih hemat bahan bakar.\n\nSeri: Cara Kerja Benda · AUDIRA Explained\nDiproduksi oleh Agus Dwi R.\nKoleksi lengkap: https://audira.my.id","tags":"cara kerja benda, AUDIRA Explained, fakta unik, sains sehari-hari, teknologi, edukasi, AUDIRA, shorts","date":"2026-12-16","time":"12:00 PM"}];
window.__run();
"started batch 1 of 8 items"