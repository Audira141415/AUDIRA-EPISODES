// Sign or verify a finished video (AUDIRA digital signature, Ed25519; see scripts/lib/sign.mjs).
//   npm run sign -- <final.mp4> [--title=… --id=AUDIRA-<slug>-EP01 --date=YYYY-MM-DD] [--c2pa]
//   npm run verify -- <final.mp4> [--json]
//   npm run sign -- --keygen          create the AUDIRA key pair (once per machine) and print the public key
// Signing writes the tag "audira_signature" into the MP4 (stream copy) and <file>.sig.json next to it.
// --c2pa also embeds C2PA Content Credentials (scripts/lib/c2pa.mjs) after the Ed25519 signature.
// Exit codes: verify 0 = VALID, 2 = UNTRUSTED, 1 = anything else.

import { embedSignature, loadKey, signFile, signingDir, verifyFile } from "./lib/sign.mjs";

const args = process.argv.slice(2);
const flag = (k) => args.includes(`--${k}`);
const opt = (k) => (args.find((a) => a.startsWith(`--${k}=`)) ?? "").split("=").slice(1).join("=") || undefined;
const file = args.find((a) => !a.startsWith("--"));
const mode = flag("verify") || process.env.npm_lifecycle_event === "verify" ? "verify" : "sign";

if (flag("keygen")) {
  const k = loadKey({ create: true });
  console.log(`key id ${k.keyId}\nprivate ${k.keyFile}  (never share or commit; back it up offline)\npublic  ${k.pubFile}`);
  console.log(`Publish the public key in the hub: assets/brand/audira-signing-keys.json`);
  process.exit(0);
}
if (!file) {
  console.error("usage: npm run sign -- <file.mp4> [--title=… --id=… --date=…] [--c2pa]  |  npm run verify -- <file.mp4>");
  process.exit(1);
}

if (mode === "verify") {
  const r = await verifyFile(file);
  if (flag("json")) console.log(JSON.stringify(r, null, 2));
  else {
    const p = r.payload;
    console.log(`${r.status}${r.signer ? `  signed by ${r.signer}` : ""}${r.from ? `  (${r.from})` : ""}`);
    if (p) console.log(`  title "${p.title}"  id ${p.id ?? "—"}  date ${p.date}  key ${p.keyId}  signed ${p.signedAt}`);
    if (r.changed) console.log(`  changed streams: ${r.changed.join(", ")} (re-encoded or edited after signing)`);
    if (r.reason) console.log(`  ${r.reason}`);
    if (r.status === "UNTRUSTED") console.log(`  key ${p.keyId} is not in the trusted AUDIRA key list`);
  }
  process.exit(r.status === "VALID" ? 0 : r.status === "UNTRUSTED" ? 2 : 1);
}

const signed = await signFile(file, { title: opt("title"), id: opt("id"), date: opt("date") });
embedSignature(file, signed);
const check = await verifyFile(file, { sidecar: false });
console.log(`signed ${file}\n  key ${signed.payload.keyId} (${signingDir()})  streams ${signed.payload.streams.length}  check: ${check.status}`);
if (check.status !== "VALID" && check.status !== "UNTRUSTED") process.exit(1);

if (flag("c2pa")) {
  const { embedC2pa } = await import("./lib/c2pa.mjs");
  const r = embedC2pa(file, signed.payload);
  console.log(r.ok ? `  c2pa: ${r.message}` : `  c2pa skipped: ${r.message}`);
  const after = await verifyFile(file, { sidecar: false });
  console.log(`  after c2pa, Ed25519 check: ${after.status}`);
  if (r.ok && after.status !== "VALID" && after.status !== "UNTRUSTED") process.exit(1);
}
