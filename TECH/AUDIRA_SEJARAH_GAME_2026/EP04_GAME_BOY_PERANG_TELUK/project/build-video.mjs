// EP04 GAME BOY PERANG TELUK / PRECISION. Apple-grade product film: one seamless studio sweep, an original grey handheld
// that melts and still runs. Panels are frosted Swiss spec cards that rise out of a soft blur. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#16171b", OR = "#ff6a2b", TEAL = "#1f9e90", WH = "#ffffff";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="meta"><span>SEJARAH GAME</span><span class="r">EP 04 &middot; PERANG TELUK</span></div>
  <div class="ttl">KENA BOM,<br><em>MASIH MAIN TETRIS</em></div>
  <div class="rows"><b class="rw" data-at="s1:meleleh" data-fx="lit"><s class="d o"></s>Terbakar &amp; meleleh</b><b class="rw" data-at="s1:dinyalakan" data-fx="lit"><s class="d g"></s>Masih menyala</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="meta"><span>KONSOL GENGGAM NINTENDO</span><span class="r">SPESIFIKASI</span></div>
  <div class="ttl sm">GAME BOY</div>
  <div class="spec"><div class="k">RILIS</div><div class="v" data-at="s2:dirilis" data-fx="lit">1989</div></div>
  <div class="spec"><div class="k">AMERIKA</div><div class="v sm" data-at="s2:paket" data-fx="lit">Satu paket dengan Tetris</div></div>
  <div class="spec"><div class="k">PEMILIK</div><div class="v sm" data-at="s2:Stephan" data-fx="lit">Stephan Scoggins, petugas medis</div></div>
  <div class="chips"><b class="chip" data-at="s2:Perang" data-fx="pop">Perang Teluk</b></div>
</div>
<div class="p dk" data-in="s3" data-out="s4">
  <div class="meta"><span>BARAK TERKENA BOM</span><span class="r">!</span></div>
  <div class="ttl sm">BAGIAN DEPAN<br><em>MELELEH PARAH</em></div>
  <div class="rows"><b class="rw" data-at="s3:bom" data-fx="lit"><s class="d o"></s>Barak terkena bom</b><b class="rw" data-at="s3:terbakar" data-fx="lit"><s class="d o"></s>Game Boy ikut terbakar</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="meta"><span>MASIH DALAM MASA TUGAS</span></div>
  <div class="ttl sm">DIKIRIM KE<br><em>NINTENDO POWER</em></div>
  <div class="rows"><b class="rw" data-at="s4:berharap" data-fx="lit"><s class="d t"></s>Berharap bisa diganti</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="meta"><span>MEJA TEKNISI</span><span class="r">UJI</span></div>
  <div class="ttl sm"><span class="strk" data-at="s5:tertolong" data-fx="lit">TIDAK TERTOLONG?</span></div>
  <div class="rows"><b class="rw" data-at="s5:menyala" data-fx="lit"><s class="d g"></s>Ternyata masih menyala</b><b class="rw" data-at="s5:Start" data-fx="lit"><s class="d g"></s>Start &amp; Select berfungsi</b><b class="rw" data-at="s5:kaset" data-fx="lit"><s class="d g"></s>Diuji dengan kaset Tetris</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="meta"><span>BALASAN MAJALAH</span></div>
  <div class="ttl sm">GAME BOY<br><em>PENGGANTI</em></div>
  <div class="rows"><b class="rw" data-at="s6:hadiah" data-fx="lit"><s class="d o"></s>Hadiah khusus Desert Storm</b><b class="rw" data-at="s6:edisi" data-fx="lit"><s class="d t"></s>Surat &amp; foto dimuat di edisi #26</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="meta"><span>TOKO NINTENDO &middot; NEW YORK</span></div>
  <div class="ttl sm">DIPAJANG SEBAGAI<br><em>BUKTI</em></div>
  <div class="rows"><b class="rw" data-at="s7:menyala" data-fx="lit"><s class="d g"></s>Terus menyala, dirawat berkala</b><b class="rw" data-at="s7:dikembalikan" data-fx="lit"><s class="d t"></s>2023: kembali ke kantor pusat Nintendo Amerika</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="meta"><span>SEJARAH GAME</span><span class="r">EP 04</span></div>
  <div class="ttl sm">KONSOL PALING<br><em>TANGGUH</em> DI DUNIA</div>
  <div class="rows"><b class="rw" data-at="s8:kena" data-fx="lit"><s class="d o"></s>Kena bom, tetap main Tetris</b><b class="rw q" data-at="s8:pertamamu" data-fx="lit">Konsol game pertamamu masih ada?</b></div>
</div>`;

const css = `
.p{background:rgba(255,255,255,.84);border:1px solid rgba(255,255,255,.9);border-radius:28px;padding:26px 34px 30px;box-shadow:0 24px 60px rgba(20,20,30,.18),inset 0 1px 0 rgba(255,255,255,1);backdrop-filter:blur(14px)}
.p.dk{background:rgba(22,18,16,.78);border-color:rgba(255,160,100,.35)}
.p.dk .ttl,.p.dk .rw{color:#fff}.p.dk .meta{color:#ffb38a}
.meta{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:23px;letter-spacing:.14em;color:#6b6d75;margin-bottom:12px}
.meta .r{color:${OR}}
.ttl{font-family:'Inter',sans-serif;font-weight:800;font-size:86px;line-height:1.0;letter-spacing:-.025em;color:${INK}}
.ttl.sm{font-size:70px}
.ttl em{font-style:normal;color:${OR}}
.rows{display:flex;flex-direction:column;gap:8px;margin-top:18px}
.rw{display:block;font-family:'Inter',sans-serif;font-weight:600;font-size:38px;line-height:1.18;color:${INK}}
.rw.q{color:${OR};font-weight:700}
.d{display:inline-block;width:16px;height:16px;border-radius:50%;margin-right:16px;vertical-align:4px}
.d.o{background:${OR}}.d.g{background:#7fa83a}.d.t{background:${TEAL}}
.spec{display:flex;align-items:baseline;gap:22px;border-top:1px solid rgba(20,20,30,.12);padding:12px 0 6px;margin-top:6px}
.spec .k{width:170px;flex:none;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;letter-spacing:.12em;color:#8a8c94}
.spec .v{font-family:'Inter',sans-serif;font-weight:800;font-size:58px;color:${INK};letter-spacing:-.02em}
.spec .v.sm{font-size:36px;font-weight:600;letter-spacing:0}
.chips{margin-top:12px}
.chip{display:inline-block;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;color:#fff;background:${INK};border-radius:999px;padding:8px 22px}
.strk{display:inline-block}
#chip{font-family:'JetBrains Mono',monospace;font-size:19px;color:#fff;letter-spacing:.08em;background:rgba(20,20,24,.5);padding:5px 12px;border-radius:8px}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: "#e9e6e0", vig: 0.16, grain: 0.035, capfloor: 0, html, css, chipFont: "'JetBrains Mono',monospace", chipColor: "#fff", sig: "EP04_GAME_BOY_PERANG_TELUK",
  extraAt: ["s1:dinyalakan", "s1:meleleh", "s1:Tetris", "s3:bom", "s3:terbakar", "s3:parah", "s3:Bagian", "s4:mengirim", "s4:konsol", "s4:majalah", "s4:Power", "s4:berharap", "s4:diganti",
    "s5:menyala", "s5:Tetris", "s5:kaset", "s5:menilai", "s5:tertolong", "s5:Tombol", "s5:Start", "s5:Select", "s5:masih",
    "s2:Salah", "s2:Stephan", "s2:dijual", "s2:dirilis", "s6:mengirim", "s6:pengganti", "s6:hadiah", "s6:Storm", "s6:Surat", "s6:edisi",
    "s7:konsol", "s7:Tahun", "s7:dipajang", "s7:toko", "s7:York", "s7:ketangguhannya", "s7:berkala", "s7:dikembalikan", "s7:kantor",
    "s8:tetap", "s8:Konsol#2", "s8:Ikuti", "s8:AUDIRA", "s8:tangguh"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{y:46,opacity:0,filter:'blur(10px)'},{y:0,opacity:1,filter:'blur(0px)',duration:.55,ease:'power3.out'},a-.1);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-28,opacity:0,filter:'blur(8px)',duration:.3,ease:'power2.in'},b-.3)`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.3},{opacity:1,duration:.3,ease:'power2.out'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Inter',sans-serif;font-weight:700;font-size:56px;line-height:1.16;color:${WH};background:rgba(18,18,22,.80);border-radius:22px;padding:12px 28px 15px;box-shadow:0 14px 40px rgba(0,0,0,.25)}
.w{display:inline-block;margin:0 .1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WH}",scale:1},{color:"${OR}",scale:1.04,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WH}",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Game Boy Perang Teluk", "#e9e6e0");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
