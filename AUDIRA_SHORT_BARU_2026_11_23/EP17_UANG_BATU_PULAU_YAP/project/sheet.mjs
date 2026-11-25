// usage: node sheet.mjs <dir> <out.jpg> [cols] [w]
import sharp from "sharp"; import fs from "fs"; import path from "path";
const [dir, dest, colsA = "5", wA = "240"] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
const cols = +colsA, w = +wA, h = Math.round(w * 16 / 9), rows = Math.ceil(files.length / cols);
const comp = [];
for (let i = 0; i < files.length; i++) comp.push({ input: await sharp(path.join(dir, files[i])).resize(w, h).toBuffer(), left: (i % cols) * w, top: Math.floor(i / cols) * h });
await sharp({ create: { width: cols * w, height: rows * h, channels: 3, background: "#000" } }).composite(comp).jpeg({ quality: 82 }).toFile(dest);
console.log(dest, files.length);
