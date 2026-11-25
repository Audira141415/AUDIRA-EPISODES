// Runs the audira_validate_social_captions check directly; the MCP tool is not exposed in this session.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const root = "F:/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_GAMING_MMRORPG/";
for (const [ep, keys] of [
  ["EP01_MIR4", ["MIR4", "Darksteel", "DRACO", "WEMIX"]],
  ["EP02_ROHAN2", ["ROHAN", "RUBY", "sRUBY", "RUBYx"]],
  ["EP03_BIG_TIME", ["Big Time", "Hourglass", "Open Loot", "BIGTIME"]],
  ["EP04_NINE_CHRONICLES", ["Nine Chronicles", "NCG", "WNCG", "Arena"]],
  ["EP05_PIXELS", ["Pixels", "PIXEL", "Ronin", "Speck"]],
]) {
  const r = validateSocialCaptions({ episodeDir: root + ep, expectedKeywords: keys });
  console.log(ep, r.ok, JSON.stringify(r.errors), JSON.stringify(r.platforms["X/Twitter"]));
}
