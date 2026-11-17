#!/usr/bin/env node
// Context guard (UserPromptSubmit hook). Every turn re-sends the whole conversation, so a long session
// costs far more than its work: 2026-11-12, one motion session ran 1,723 turns at ~480k tokens of
// context each (~800M tokens re-read). This hook reads the size of the last turn's context from the
// transcript and, above a threshold, tells Claude to write the episode handover and move to a new
// session (the AUDIRA brain, STATUS.json and motion memory let a new session resume in ~25k tokens).
//
//   settings.json: "hooks": { "UserPromptSubmit": [{ "hooks": [{ "type": "command",
//     "command": "node F:/AUDIRA-ALL-SKILL/scripts/hooks/context-guard.mjs" }] }] }
//   Thresholds (tokens): AUDIRA_CTX_WARN (default 200000), AUDIRA_CTX_STOP (default 350000).
// Never blocks the prompt and never fails the turn: on any error it prints nothing and exits 0.

import fs from "node:fs";

const WARN = Number(process.env.AUDIRA_CTX_WARN) || 200_000;
const STOP = Number(process.env.AUDIRA_CTX_STOP) || 350_000;
const TAIL = 4 * 1024 * 1024; // transcripts reach 80 MB; the last turn is near the end

function lastContext(file) {
  const size = fs.statSync(file).size;
  const fd = fs.openSync(file, "r");
  try {
    const len = Math.min(size, TAIL);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    const lines = buf.toString("utf8").split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i].includes('"usage"')) continue;
      try {
        const j = JSON.parse(lines[i]);
        const u = j.message?.role === "assistant" ? j.message.usage : null;
        if (u && !j.isSidechain) return (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
      } catch { /* partial first line */ }
    }
  } finally {
    fs.closeSync(fd);
  }
  return 0;
}

try {
  const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  const file = input.transcript_path;
  if (!file || !fs.existsSync(file)) process.exit(0);
  const ctx = lastContext(file);
  if (ctx < WARN) process.exit(0);
  const k = Math.round(ctx / 1000);
  const msg = ctx >= STOP
    ? `CONTEXT GUARD: konteks sesi ini ±${k} ribu token (batas ${Math.round(STOP / 1000)} ribu). Setiap giliran mengirim ulang seluruh konteks ini. ` +
      `Jangan memulai pekerjaan baru di sesi ini. Selesaikan hanya langkah yang sedang berjalan, tulis audira_episode_status action "handover" ` +
      `(doing, next, command/batchId, files) untuk setiap episode yang aktif, lalu minta pengguna membuka sesi baru di folder yang sama ` +
      `dan melanjutkan dengan: audira_episode_status get → audira_render_batch status → audira_project_layout check. ` +
      `Sampaikan ini ke pengguna dalam satu atau dua kalimat di awal jawaban.`
    : `CONTEXT GUARD: konteks sesi ini ±${k} ribu token (peringatan di ${Math.round(WARN / 1000)} ribu). ` +
      `Setelah gerbang atau langkah besar yang sedang dikerjakan selesai, tulis audira_episode_status action "handover" dan sarankan pengguna ` +
      `melanjutkan di sesi baru (satu sesi = satu episode). Sebutkan ini ke pengguna dalam satu kalimat di akhir jawaban.`;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: msg } }));
} catch {
  // never break the user's prompt
}
process.exit(0);
