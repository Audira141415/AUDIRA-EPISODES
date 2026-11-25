// EP21 one-off: finish render-final.mjs after its tagged-file rename failed (EPERM).
// Signs FINAL_VIDEO.mp4 (Ed25519 + C2PA, awaited) and runs the final visual audit for motion memory.
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const out = path.resolve(process.argv[2] ?? "../FINAL_VIDEO.mp4");
const { signFile, embedSignature, verifyFile } = await import("./lib/sign.mjs");
const signed = await signFile(out);
embedSignature(out, signed);
const { embedC2pa } = await import("./lib/c2pa.mjs");
const c = embedC2pa(out, signed.payload);
console.log(`signature: Ed25519 key ${signed.payload.keyId}, ${(await verifyFile(out, { sidecar: false })).status}${c.ok ? ", C2PA embedded" : ` (C2PA skipped: ${c.message})`}`);

const look = path.join(path.dirname(out), `${path.parse(out).name}.look.json`);
const r = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "visual-audit.mjs"),
  `--video=${out}`, "--comp=Y2KFinal", "--source=render:final", "--stage=final", `--json=${look}`], { encoding: "utf8" });
console.log((r.stdout || "").trim().split("\n").slice(-6).join("\n"));
if (r.status !== 0 && r.status !== 1) console.error(String(r.stderr || "").trim().split("\n")[0]);
