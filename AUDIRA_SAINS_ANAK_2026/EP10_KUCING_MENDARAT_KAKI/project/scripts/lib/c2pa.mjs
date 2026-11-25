// C2PA Content Credentials for finished videos, embedded with c2patool (contentauth/c2pa-rs).
//
// The manifest says who made the film (AUDIRA, Agus Dwi R.), that it was created with software and
// trained algorithmic media (AI voice-over / AI-assisted visuals: platforms that read C2PA show their
// AI label from this), the copyright notice, and links the AUDIRA Ed25519 signature (key id).
// It is signed with the same AUDIRA Ed25519 key through a certificate chain made on this machine
// (AUDIRA root CA -> AUDIRA signing certificate, in the signing folder). Viewers will show the signer
// as "AUDIRA" but not trusted until the root is in a public trust list; the Ed25519 signature
// (scripts/lib/sign.mjs) and the archived master remain the proof of authorship.
//
// c2patool is looked up in C2PATOOL, F:\AUDIRA-KEYS\bin, %USERPROFILE%\.audira\bin, then PATH.
// Without it, embedC2pa() returns { ok: false } and the caller carries on.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadKey, signingDir } from "./sign.mjs";
import { replaceFile } from "./media.mjs";

const exe = process.platform === "win32" ? ".exe" : "";

export function findC2paTool() {
  const cands = [process.env.C2PATOOL, `F:/AUDIRA-KEYS/bin/c2patool${exe}`, path.join(os.homedir(), ".audira", "bin", `c2patool${exe}`)].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return c;
  const r = spawnSync("c2patool", ["--version"], { encoding: "utf8" });
  return r.status === 0 ? "c2patool" : null;
}

const openssl = (args, input) => {
  const r = spawnSync("openssl", args, { encoding: "utf8", input });
  if (r.status !== 0) throw new Error(`openssl ${args[0]} failed: ${r.stderr.trim()}`);
  return r.stdout;
};

/** Certificate chain for C2PA signing (created once, never overwritten). */
export function ensureCertChain() {
  const dir = signingDir();
  const key = loadKey({ create: true });
  const rootKey = path.join(dir, "c2pa-root-ed25519.key"), rootCrt = path.join(dir, "c2pa-root.crt");
  const signCrt = path.join(dir, "c2pa-sign.crt"), chain = path.join(dir, "c2pa-chain.pem");
  if (fs.existsSync(chain)) return { chain, privateKey: key.keyFile };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "audira-c2pa-"));
  try {
    if (!fs.existsSync(rootKey)) openssl(["genpkey", "-algorithm", "ed25519", "-out", rootKey]);
    const rootExt = path.join(tmp, "root.cnf");
    fs.writeFileSync(rootExt, "[req]\ndistinguished_name=dn\nx509_extensions=v3\n[dn]\n[v3]\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\n");
    openssl(["req", "-x509", "-new", "-key", rootKey, "-subj", "/CN=AUDIRA Root CA/O=AUDIRA/C=ID", "-days", "3650", "-config", rootExt, "-out", rootCrt]);
    const csr = path.join(tmp, "sign.csr");
    openssl(["req", "-new", "-key", key.keyFile, "-subj", "/CN=AUDIRA/O=AUDIRA (Agus Dwi R.)/C=ID", "-out", csr]);
    const ext = path.join(tmp, "sign.ext");
    fs.writeFileSync(ext, "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=emailProtection\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n");
    openssl(["x509", "-req", "-in", csr, "-CA", rootCrt, "-CAkey", rootKey, "-CAcreateserial", "-days", "1825", "-extfile", ext, "-out", signCrt]);
    fs.writeFileSync(chain, fs.readFileSync(signCrt, "utf8") + fs.readFileSync(rootCrt, "utf8"));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return { chain, privateKey: key.keyFile };
}

/** The manifest definition c2patool signs. `p` is the Ed25519 payload of the same file. */
export function manifestFor(p, { ai = true } = {}) {
  const year = (p.date || "").slice(0, 4) || String(new Date().getFullYear()); // det-ok: delivery metadata
  return {
    claim_generator_info: [{ name: "AUDIRA Motion", version: "4.4" }],
    title: p.title,
    format: "video/mp4",
    assertions: [
      {
        label: "c2pa.actions",
        data: {
          actions: [
            {
              action: "c2pa.created",
              softwareAgent: "AUDIRA Motion (Remotion + React Three Fiber)",
              ...(ai ? { digitalSourceType: "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia" } : {}),
            },
          ],
        },
      },
      {
        label: "stds.schema-org.CreativeWork",
        data: {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          author: [{ "@type": "Organization", name: "AUDIRA" }, { "@type": "Person", name: "Agus Dwi R." }],
          copyrightNotice: p.copyright || `© ${year} AUDIRA - Agus Dwi R. All rights reserved.`,
          identifier: p.id || undefined,
          dateCreated: p.date,
        },
      },
      {
        label: "my.audira.signature",
        data: { alg: "Ed25519", keyId: p.keyId, streams: p.streams, verify: "npm run verify -- <file>" },
      },
    ],
  };
}

/** Embed Content Credentials into `file` (in place). Returns { ok, message }. */
export function embedC2pa(file, payload, opts = {}) {
  const tool = findC2paTool();
  if (!tool) return { ok: false, message: "c2patool not installed (%USERPROFILE%\\.audira\\bin\\c2patool.exe)" };
  let certs;
  try { certs = ensureCertChain(); } catch (e) { return { ok: false, message: e.message }; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "audira-c2pa-"));
  const manifest = path.join(dir, "manifest.json");
  fs.writeFileSync(manifest, JSON.stringify({ ...manifestFor(payload, opts), alg: "ed25519", private_key: certs.privateKey, sign_cert: certs.chain }, null, 2));
  const out = file.replace(/(\.\w+)$/, ".c2pa$1");
  const r = spawnSync(tool, [file, "-m", manifest, "-o", out, "-f"], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  if (r.status !== 0 || !fs.existsSync(out)) {
    try { fs.unlinkSync(out); } catch {}
    return { ok: false, message: `c2patool failed: ${(r.stderr || r.stdout).trim().split("\n").slice(-2).join(" ")}` };
  }
  replaceFile(out, file);
  return { ok: true, message: "Content Credentials embedded (signer AUDIRA, AI-generated source type)" };
}

/** Read the Content Credentials back: { present, title, signer, validation } (null when no tool). */
export function readC2pa(file) {
  const tool = findC2paTool();
  if (!tool) return null;
  const r = spawnSync(tool, [file], { encoding: "utf8", maxBuffer: 1 << 24 });
  if (r.status !== 0) return { present: false, error: (r.stderr || "").trim().split("\n").pop() };
  let j;
  try { j = JSON.parse(r.stdout); } catch { return { present: false, error: "unreadable c2patool output" }; }
  const m = j.manifests?.[j.active_manifest] ?? {};
  const statuses = (j.validation_status ?? []).map((s) => s.code);
  return { present: true, title: m.title, signer: m.signature_info?.issuer ?? m.signature_info?.common_name ?? null, state: j.validation_state ?? null, statuses };
}
