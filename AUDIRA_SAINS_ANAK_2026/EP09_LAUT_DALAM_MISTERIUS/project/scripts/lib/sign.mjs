// AUDIRA digital signature for finished videos (Ed25519, Node crypto, no dependencies).
//
// What is signed: the SHA-256 of every audio and video stream (ffmpeg -f streamhash, packets as
// stored), together with the owner, title, episode and date. Stream hashes do not change when the
// container or its metadata is rewritten, and change as soon as a single picture or sound sample is
// edited or the file is re-encoded. The signature is written into the MP4 as the metadata tag
// "audira_signature" and next to it as <file>.sig.json.
//
// Keys live outside every repository, off the system drive (C: can be wiped or reinstalled):
//   AUDIRA_SIGNING_DIR if set, else F:\AUDIRA-KEYS\signing when it exists, else %USERPROFILE%\.audira\signing.
//   Backup copy on another physical disk: E:\AUDIRA-KEYS-BACKUP\signing (see F:\AUDIRA-KEYS\README.md).
//   audira-ed25519.key   private key, PKCS#8 PEM. Never commit or share it; back it up offline.
//   audira-ed25519.pub   public key, SPKI PEM. Publish it (hub assets/brand/audira-signing-keys.json).
// A signature only proves authorship when its key id is in the trusted key list.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readTags, replaceFile } from "./media.mjs";

export const TAG = "audira_signature";
export const OWNER = "AUDIRA (Agus Dwi R.)";

const PRIMARY_DIR = "F:/AUDIRA-KEYS/signing";
export const signingDir = () =>
  process.env.AUDIRA_SIGNING_DIR || (fs.existsSync(PRIMARY_DIR) ? PRIMARY_DIR : path.join(os.homedir(), ".audira", "signing"));
const keyFile = () => path.join(signingDir(), "audira-ed25519.key");
const pubFile = () => path.join(signingDir(), "audira-ed25519.pub");

export const keyIdOf = (publicKey) =>
  crypto.createHash("sha256").update(publicKey.export({ type: "spki", format: "der" })).digest("hex").slice(0, 16);

/** Load the signing key; create it on first use (never overwrites an existing key). */
export function loadKey({ create = false } = {}) {
  if (!fs.existsSync(keyFile())) {
    if (!create) return null;
    fs.mkdirSync(signingDir(), { recursive: true });
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
    fs.writeFileSync(keyFile(), privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600, flag: "wx" });
    fs.writeFileSync(pubFile(), publicKey.export({ type: "spki", format: "pem" }), { flag: "wx" });
  }
  const privateKey = crypto.createPrivateKey(fs.readFileSync(keyFile()));
  const publicKey = crypto.createPublicKey(privateKey);
  return { privateKey, publicKey, keyId: keyIdOf(publicKey), keyFile: keyFile(), pubFile: pubFile() };
}

/** Per-stream SHA-256 of the media packets: ["0,v,SHA256=…", "1,a,SHA256=…"]. */
export function streamHashes(file) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-map", "0:v?", "-map", "0:a?", "-c", "copy", "-f", "streamhash", "-hash", "sha256", "-"], { encoding: "utf8", maxBuffer: 1 << 20 });
  if (r.status !== 0) throw new Error(`ffmpeg streamhash failed: ${r.stderr.trim().split("\n").pop()}`);
  return r.stdout.trim().split(/\r?\n/).filter(Boolean);
}

/** Async probeTags via MediaBunny. */
export async function probeTags(file) {
  return readTags(file);
}

/** Sync fallback for callers that cannot be made async. */
export function probeTagsSync(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:format_tags", "-of", "json", file], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffprobe failed on ${file}`);
  const j = JSON.parse(r.stdout).format ?? {};
  const tags = Object.fromEntries(Object.entries(j.tags ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  return { tags, duration: Number(j.duration) };
}

/** JSON with sorted keys, so the signed bytes never depend on property order. */
export function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}

const b64u = (buf) => Buffer.from(buf).toString("base64url");

/** Build and sign the payload for a file. Does not modify the file. */
export async function signFile(file, meta = {}) {
  const key = loadKey({ create: true });
  const { tags, duration } = await probeTags(file);
  const payload = {
    v: 1,
    alg: "Ed25519",
    owner: meta.owner || tags.artist || OWNER,
    title: meta.title || tags.title || path.basename(file),
    id: meta.id || tags.comment || null,
    copyright: meta.copyright || tags.copyright || null,
    date: meta.date || tags.date || new Date().toISOString().slice(0, 10), // det-ok: signing time, not a frame
    signedAt: new Date().toISOString(), // det-ok: signing time, not a frame
    duration: Math.round(duration * 1000) / 1000,
    streams: streamHashes(file),
    keyId: key.keyId,
    publicKey: b64u(key.publicKey.export({ type: "spki", format: "der" })),
  };
  const sig = crypto.sign(null, Buffer.from(canonical(payload)), key.privateKey);
  return { payload, sig: b64u(sig) };
}

/** Write the signature into the MP4 (stream copy, no re-encode) and as <file>.sig.json. */
export function embedSignature(file, signed) {
  const tmp = file.replace(/(\.\w+)$/, ".signing$1");
  const value = b64u(Buffer.from(JSON.stringify(signed)));
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-map", "0", "-c", "copy", "-map_metadata", "0",
    "-metadata", `${TAG}=${value}`, "-movflags", "+faststart+use_metadata_tags", tmp], { encoding: "utf8" });
  if (r.status !== 0) { try { fs.unlinkSync(tmp); } catch {} throw new Error(`ffmpeg could not write the signature: ${r.stderr.trim()}`); }
  replaceFile(tmp, file);
  fs.writeFileSync(`${file}.sig.json`, JSON.stringify(signed, null, 2) + "\n");
}

/** Trusted AUDIRA keys: the hub list plus the local public key. */
export function trustedKeys() {
  const ids = new Map();
  const hubs = [process.env.AUDIRA_HUB, "F:/AUDIRA-ALL-SKILL"].filter(Boolean);
  for (const h of hubs) {
    const f = path.join(h, "assets", "brand", "audira-signing-keys.json");
    if (fs.existsSync(f)) for (const k of JSON.parse(fs.readFileSync(f, "utf8")).keys ?? []) ids.set(k.keyId, k.owner);
  }
  if (fs.existsSync(pubFile())) ids.set(keyIdOf(crypto.createPublicKey(fs.readFileSync(pubFile()))), OWNER);
  return ids;
}

/**
 * Verify a file. Status:
 *   VALID      signature correct, streams unchanged, key is a trusted AUDIRA key
 *   UNTRUSTED  signature and streams correct, but signed by a key that is not in the trusted list
 *   TAMPERED   signature correct, but the picture or sound differs from what was signed
 *   INVALID    the signature does not match its payload (forged or corrupted)
 *   UNSIGNED   no signature in the file and no .sig.json next to it
 */
export async function verifyFile(file, { sidecar = true } = {}) {
  const { tags } = await probeTags(file);
  let signed = null, from = null;
  if (tags[TAG]) {
    try { signed = JSON.parse(Buffer.from(tags[TAG], "base64url").toString("utf8")); from = "metadata"; } catch { return { status: "INVALID", reason: "unreadable signature tag" }; }
  } else if (sidecar && fs.existsSync(`${file}.sig.json`)) {
    signed = JSON.parse(fs.readFileSync(`${file}.sig.json`, "utf8"));
    from = "sidecar";
  }
  if (!signed) return { status: "UNSIGNED" };
  const { payload, sig } = signed;
  let ok = false;
  try {
    const pub = crypto.createPublicKey({ key: Buffer.from(payload.publicKey, "base64url"), format: "der", type: "spki" });
    ok = keyIdOf(pub) === payload.keyId && crypto.verify(null, Buffer.from(canonical(payload)), pub, Buffer.from(sig, "base64url"));
  } catch { ok = false; }
  if (!ok) return { status: "INVALID", from, reason: "signature does not match the signed data", payload };
  const now = streamHashes(file);
  const changed = payload.streams.filter((s) => !now.includes(s));
  if (changed.length || now.length !== payload.streams.length) return { status: "TAMPERED", from, payload, changed: changed.map((s) => s.split(",").slice(0, 2).join(",")) };
  const trusted = trustedKeys();
  return { status: trusted.has(payload.keyId) ? "VALID" : "UNTRUSTED", from, payload, signer: trusted.get(payload.keyId) ?? null };
}
