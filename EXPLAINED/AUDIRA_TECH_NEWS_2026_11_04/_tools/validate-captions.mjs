// Runs the audira_validate_social_captions check directly; the MCP tool is not exposed in this session.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const root = "F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_TECH_NEWS_2026_11_04/";
for (const [ep, keys] of [
  ["EP01_BINANCE_CYBER_ATTACK", ["Binance", "TraderTraitor", "Elliptic", "Korea Utara"]],
  ["EP02_IHSG_MARKET_CRISIS", ["IHSG", "4.904,29", "MSCI", "Panin"]],
]) {
  console.log(ep, JSON.stringify(validateSocialCaptions({ episodeDir: root + ep, expectedKeywords: keys }), null, 1));
}
