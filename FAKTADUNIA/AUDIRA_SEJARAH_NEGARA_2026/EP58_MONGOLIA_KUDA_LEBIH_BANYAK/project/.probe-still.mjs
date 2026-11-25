import "./scripts/lib/tmpdir.mjs";
import path from "node:path"; import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const u = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl: u, id: "MongoliaPreview" });
for (const s of process.argv.slice(2)) {
  await renderStill({ composition, serveUrl: u, output: path.resolve(`out/dbg/f${s}.png`), frame: Math.round(+s*30), chromiumOptions:{gl:"angle"}, timeoutInMilliseconds:180000,
    onBrowserLog: (l) => console.log("LOG", l.type, String(l.text).slice(0,300)) });
  console.log("done", s);
}
fs.rmSync(u,{recursive:true,force:true}); process.exit(0);
