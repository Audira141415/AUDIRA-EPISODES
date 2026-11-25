// EP02 SAMBUNG MESH. Terminal-at-night: AUDIRA forest and tosca, lime on connection, orange for key and errors. Panels glitch in as console windows, the type is mono-first. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";
import { TY } from "../_tools/fx.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TOSCA = "#00B894", LIME = "#A3E635", ORG = "#FF6A3D", BG = "#04171A";
const D = "'Space Grotesk',sans-serif", M = "'IBM Plex Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="big"><b class="ct" data-from="0" data-to="925" data-a="s1:Sembilan" data-d="1.8">0</b><span>SKILL</span></div>
  <div class="tag or" data-at="s1:penuh" data-fx="up">memori Claude penuh duluan</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="w"><i>audira-skill-mesh</i><div class="v">server MCP</div></div>
  <div class="ln" data-at="s2:colokan"><em>MCP</em> colokan standar ke alat luar</div>
  <div class="ln" data-at="s2:mencari"><em>1</em> cari skill</div>
  <div class="ln" data-at="s2:memuat"><em>2</em> muat yang dibutuhkan saja</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">LANGKAH 1 / 3</div>
  <div class="w"><i>PowerShell</i><div class="cm"><span class="pr">&gt;</span><span class="ty" data-t="s3:folder" data-c="26">cd ~</span></div>
  <div class="cm"><span class="pr">&gt;</span><span class="ty" data-t="s3:clone" data-c="40">git clone --depth 1 https://github.com/Audira141415/AUDIRA-ALL-SKILL</span></div>
  <div class="out" data-at="s3:Ukurannya" data-fx="fade">&plusmn;140 MB</div></div>
  <div class="tag" data-at="s3:Pastikan" data-fx="up">butuh Git + Node.js</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">LANGKAH 2 / 3</div>
  <div class="w"><i>PowerShell</i><div class="cm"><span class="pr">&gt;</span><span class="ty" data-t="s4:Masuk" data-c="40">cd AUDIRA-ALL-SKILL/mcp-server</span></div>
  <div class="cm"><span class="pr">&gt;</span><span class="ty" data-t="s4:npm" data-c="26">npm install</span></div>
  <div class="out" data-at="s4:Jangan" data-fx="fade">added 95 packages</div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">LANGKAH 3 / 3</div>
  <div class="w"><i>PowerShell</i><div class="cm tall"><span class="pr">&gt;</span><span class="ty" data-t="s5:claude" data-c="30">claude mcp add --scope user audira-skill-mesh node $HOME/AUDIRA-ALL-SKILL/mcp-server/src/index.js -e CARTESIA_API_KEY=KUNCI_KAMU</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st or">SOAL KUNCI</div>
  <div class="w ok"><i>JALAN</i><div class="cm small">... node $HOME/.../index.js <b>-e CARTESIA_API_KEY=...</b></div></div>
  <div class="w no" data-at="s6:Ditaruh" data-fx="up"><i>GAGAL DI POWERSHELL</i><div class="cm small">... audira-skill-mesh <b>-e CARTESIA_API_KEY=...</b> -- node ...</div><div class="out r">error: missing required argument 'commandOrUrl'</div></div>
  <div class="tag or" data-at="s6:jangan" data-fx="up">jangan tampilkan kunci di layar</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">CEK</div>
  <div class="w"><i>PowerShell</i><div class="cm"><span class="pr">&gt;</span><span class="ty" data-t="s7:Cek" data-c="26">claude mcp list</span></div>
  <div class="out g" data-at="s7:connected" data-fx="fade">audira-skill-mesh: &#10004; Connected</div></div>
  <div class="w" data-at="s7:jalankan"><i>Claude Code, sesi baru</i><div class="cm"><span class="ty" data-t="s7:jalankan" data-c="26">jalankan audira_status</span></div>
  <div class="out g" data-at="s7:online" data-fx="fade">status: ONLINE &middot; 925 skill</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h">TERSAMBUNG.</div>
  <div class="tag" data-at="s8:episode" data-fx="up">Berikutnya, EP 3: dipakai sampai jadi film</div>
</div>`;

const css = `
#chip{color:${TOSCA};font-size:24px;letter-spacing:.1em}
.big{display:flex;align-items:baseline;gap:18px;color:#fff;font-family:${D};font-weight:700}.big b{font-size:210px;line-height:.95;letter-spacing:-.04em;font-variant-numeric:tabular-nums;color:${LIME}}.big span{font-size:66px;color:#fff}
.h{font-family:${D};font-weight:700;font-size:112px;line-height:1;letter-spacing:-.03em;color:${LIME}}
.tag{display:inline-block;margin-top:16px;font-family:${D};font-weight:700;font-size:44px;line-height:1.12;background:${TOSCA};color:#04171A;padding:10px 18px}.tag.or{background:${ORG};color:#fff}
.st{display:inline-block;font-family:${M};font-weight:700;font-size:30px;color:${LIME};border:2px solid ${LIME};padding:4px 12px;margin-bottom:12px}.st.or{color:${ORG};border-color:${ORG}}
.w{background:rgba(3,14,16,.9);border:2px solid ${TOSCA};margin-bottom:14px;padding:0 0 16px}.w i{display:block;font-style:normal;font-family:${M};font-weight:600;font-size:26px;background:${TOSCA};color:#04171A;padding:5px 14px;margin-bottom:12px}
.w.ok{border-color:${LIME}}.w.ok i{background:${LIME}}.w.no{border-color:${ORG}}.w.no i{background:${ORG};color:#fff}
.v{font-family:${D};font-weight:700;font-size:64px;color:#fff;padding:0 18px}
.cm{font-family:${M};font-weight:500;font-size:37px;line-height:1.28;color:#E9FFF6;padding:3px 18px;overflow-wrap:anywhere;min-height:47px}.cm.tall{font-size:40px}.cm.small{font-size:32px}.cm b{color:${LIME};font-weight:700}.w.no .cm b{color:${ORG}}
.pr{color:${LIME};margin-right:12px}
.out{font-family:${M};font-size:32px;color:#9fd8c6;padding:6px 18px 0}.out.g{color:${LIME};font-weight:700;font-size:36px}.out.r{color:#ffb9a3;font-size:27px}
.ln{display:flex;gap:18px;align-items:baseline;background:rgba(3,14,16,.82);font-family:${D};font-weight:500;font-size:44px;line-height:1.14;color:#fff;padding:10px 18px;margin-bottom:8px}.ln em{flex:none;font-style:normal;font-family:${M};font-weight:700;color:${LIME}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "2", series: "PASANG AUDIRA &middot; EP 2 DARI 3", bg: BG, vig: .5, grain: .05, capfloor: .38, html, css, chipFont: M, chipColor: TOSCA, chip: "AUDIRA MOTION &middot; EP 2/3",
  extraAt: ["s1:penuh", "s1:Sembilan", "s2:mencari", "s3:clone", "s4:npm", "s4:Jangan", "s5:claude", "s6:jangan", "s7:connected", "s7:online"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-26},{opacity:1,x:0,duration:.08,ease:'none'},a-.08);tl.to(p,{x:9,duration:.04,ease:'none'},a);tl.to(p,{x:0,duration:.05,ease:'none'},a+.04);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:26,duration:.09,ease:'none'},b-.1)`,
  hud: TY,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;line-height:1.24;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:54px;color:#d6eee6;text-shadow:0 2px 12px #000,0 0 4px #000}
.w{display:inline-block;padding:0 2px}`,
(id, w) => `tl.set("#${id}",{color:"${LIME}"},${w.start.toFixed(3)});tl.fromTo("#${id}",{scale:1},{scale:1.1,duration:.08,yoyo:true,repeat:1},${w.start.toFixed(3)});tl.set("#${id}",{color:"#d6eee6"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14,opacity:0},{y:0,opacity:1,duration:.1,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Sambung Mesh", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
