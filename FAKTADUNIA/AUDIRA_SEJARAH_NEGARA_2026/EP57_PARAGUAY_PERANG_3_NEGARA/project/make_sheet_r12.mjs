import sharp from "sharp";
const ep = "F:\\AUDIRA-EPISODES\\AUDIRA_BERITA_VIRAL_10_NOV_2026\\EP01_PENGGANTI_GIBRAN_WAPRES";
const out = ep + "\\\\draft";
const frames = ["s1_hook","s2_context","s3_kandidat","s4_hoaks","s5_payoff","s6_outro"];
const W = 360, H = 640;
const composites = [];
for (let i = 0; i < 6; i++) {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const src = out + "\\\\_r12_" + frames[i] + ".png";
  const img = await sharp(src).resize(W, H, { fit: "cover" }).toBuffer();
  composites.push({ input: img, left: col * W, top: row * H });
}
const dest = out + "\\\\_sheet_r12.jpg";
await sharp({ create: { width: W*3, height: H*2, channels: 3, background: "#000" } })
  .composite(composites).jpeg({ quality: 90 }).toFile(dest);
console.log("Done:", dest);
