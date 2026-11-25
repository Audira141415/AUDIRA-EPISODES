// Fallback to the validator source when the MCP tool is unavailable.
import { validateSocialCaptions } from "file:///F:/AUDIRA-ALL-SKILL/mcp-server/src/social-captions.js";
const r = validateSocialCaptions({ episodeDir: "F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_IJAZAH_2026/EP01_SELEMBAR_KERTAS", expectedKeywords: ["Roy Suryo", "PN Jakarta Timur", "Times New Roman", "6.770"] });
console.log(JSON.stringify(r, null, 1));
