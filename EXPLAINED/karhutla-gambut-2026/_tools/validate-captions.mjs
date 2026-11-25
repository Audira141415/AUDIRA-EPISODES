// Runs the audira_validate_social_captions check directly from the MCP server source.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const r = validateSocialCaptions({ episodeDir: "F:/AUDIRA-VIDEO-MOTION/EXPLAINED/karhutla-gambut-2026/EP01_API_BAWAH_TANAH", expectedKeywords: ["gambut", "Palangka Raya", "bara", "3.560"] });
console.log(JSON.stringify(r, null, 1));
