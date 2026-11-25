// Runs the audira_validate_social_captions check directly; the MCP tool is not exposed in this session.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const root = "F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_HOW_THE_WORLD_WORKS_2026/";
for (const [ep, keys] of [
  ["EP01_HOW_LIGHTNING_WORKS", ["petir", "graupel", "27.000", "guntur"]],
  ["EP02_HOW_VOLCANOES_ERUPT", ["magma", "gelembung", "piroklastik", "Hawaii"]],
  ["EP03_HOW_TSUNAMIS_WORK", ["tsunami", "765", "Sumatra", "pendangkalan"]],
  ["EP04_HOW_BRIDGES_WORK", ["jembatan", "Suramadu", "tekan", "fondasi"]],
  ["EP05_HOW_UNDERSEA_TUNNELS_WORK", ["terowongan", "TBM", "gasket", "Channel"]],
]) {
  const r = validateSocialCaptions({ episodeDir: root + ep, expectedKeywords: keys });
  console.log(ep, r.ok, JSON.stringify(r.errors), JSON.stringify(r.platforms["X/Twitter"]));
}
