#!/usr/bin/env node
// Download missing HDRI files from Poly Haven at 1k resolution.
// Usage: node scripts/download-hdri.mjs [--force]

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/hdri");

const HDRIS = [
  { file: "studio_small_09_1k.hdr", slug: "studio_small_09" },
  { file: "brown_photostudio_02_1k.hdr", slug: "brown_photostudio_02" },
  { file: "kloofendal_48d_partly_cloudy_puresky_1k.hdr", slug: "kloofendal_48d_partly_cloudy_puresky" },
  { file: "moonless_golf_1k.hdr", slug: "moonless_golf" },
  { file: "venice_sunset_1k.hdr", slug: "venice_sunset" },
  { file: "small_empty_room_3_1k.hdr", slug: "small_empty_room_3" },
  { file: "potsdamer_platz_1k.hdr", slug: "potsdamer_platz" },
  { file: "adams_place_bridge_1k.hdr", slug: "adams_place_bridge" },
];

const force = process.argv.includes("--force");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (e) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(e);
    });
  });
}

fs.mkdirSync(OUT, { recursive: true });

let downloaded = 0;
for (const { file, slug } of HDRIS) {
  const dest = path.join(OUT, file);
  if (!force && fs.existsSync(dest)) {
    console.log(`  skip  ${file} (exists)`);
    continue;
  }
  const url = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/${slug}_1k.hdr`;
  console.log(`  fetch ${file}`);
  try {
    await download(url, dest);
    const mb = (fs.statSync(dest).size / 1048576).toFixed(1);
    console.log(`  done  ${file} (${mb} MB)`);
    downloaded++;
  } catch (e) {
    console.error(`  FAIL  ${file}: ${e.message}`);
  }
}
console.log(`\n  ${downloaded} downloaded, ${HDRIS.length - downloaded} skipped`);
