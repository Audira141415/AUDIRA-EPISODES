# Handover — Cara Kerja Benda (2026-11-12)

- Doing: 5 subagents build silent HyperFrames films per `_tools/BRIEF_COMMON.md` (no MP4): project/world3d.js, build-video.mjs, mix.py, style/cover-topic.png, draft/contact-sheet.jpg.
- Done: research, style gate (user: "Yes, main styles"), scripts in EP*/project/script-lines.json, estimated timelines.
- Next: collect covers into _review/COVERS_TOPIK.jpg + _review/REVIEW_SCRIPTS.md (python _tools/review-scripts.py), cover + script gate; then `bash _tools/voice-draft.sh`, draft scoring + blind jury, draft gate, `bash _tools/final.sh`, captions, docs.
- If a subagent died: check which EP*/project/world3d.js / style/cover-topic.png exist and resume that episode only.

- 2026-11-12: covers + scripts approved; running `bash _tools/voice-draft.sh > _tools/voice-draft.log` (TTS + rebuild + draft/contact-sheet.jpg). Next: check sheets on real timing, self-score + blind jury, draft gate.
- 2026-11-12: VO locked (EP04 tempo 0.93). Jury round 2 (draft): EP01 3.67, EP02 3.33, EP03 3.67, EP04 3.67, EP05 3.67 — all PERLU POLES (composition/motion 3). Waiting for user: polish round 3 or approve drafts as is.
- 2026-11-12: user approved drafts (jury override). Running `bash _tools/final.sh EP01_MICROWAVE EP02_KULKAS EP03_KUNCI_GEMBOK EP04_LIFT_TIDAK_JATUH EP05_RICE_COOKER > _tools/final.log`. EP06 folder is from another session: do not touch.
