// Runs the audira_validate_social_captions check directly; the MCP tool is not exposed in this session.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const root = "F:/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_GAMING_BUSINESS_2026/";
for (const [ep, keys] of [
  ["EP01_ROBLOX_CREATOR_ECONOMY", ["Roblox", "DevEx", "1.440", "Grow a Garden"]],
  ["EP02_FORTNITE_CREATOR_ECONOMY", ["Fortnite", "UEFN", "Engagement Pool", "40%"]],
  ["EP03_ESPORTS_PROFESSIONAL", ["Esports World Cup", "Mobile Legends", "Whitemon", "M7"]],
  ["EP04_MINECRAFT_CREATOR_BUSINESS", ["Minecraft", "Marketplace", "295", "Partner"]],
  ["EP05_CS2_DIGITAL_ASSET_ECONOMY", ["CS2", "Workshop", "442", "Pricempire"]],
]) {
  const r = validateSocialCaptions({ episodeDir: root + ep, expectedKeywords: keys });
  console.log(ep, r.ok, JSON.stringify(r.errors), JSON.stringify(r.platforms["X/Twitter"]));
}
