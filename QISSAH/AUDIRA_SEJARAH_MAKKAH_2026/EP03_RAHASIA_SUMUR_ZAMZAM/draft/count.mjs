import fs from "node:fs";
const j = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;
let tot = 0;
for (const c of j.chapters) { const w = wc(c.text); tot += w; console.log(c.id, w, (w/140*60).toFixed(0)+"s"); }
console.log("TOTAL", tot, (tot/140).toFixed(2)+" min");
for (const s of j.shorts) {
  let w = wc(s.hook) + wc(s.outro);
  if (s.reuseFrom) { const t = j.chapters.find(c=>c.id===s.reuse[0]).text; const a=t.indexOf(s.reuseFrom), b=t.indexOf(s.reuseTo)+s.reuseTo.length; w += wc(t.slice(a,b)); }
  console.log(s.id, "approx words", w, (w/140*60).toFixed(0)+"s");
}
