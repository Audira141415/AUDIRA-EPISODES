// Import first in render scripts: points the OS temp folder (Remotion bundle, Chrome profile, frame
// cache) at RENDER_TMPDIR when it is set, so a full 1080p render cannot fill a small system drive.
// Unset = the OS default. Example (Windows, once per machine): setx RENDER_TMPDIR F:\render-tmp
import fs from "node:fs";

const dir = process.env.RENDER_TMPDIR;
if (dir) {
  fs.mkdirSync(dir, { recursive: true });
  process.env.TEMP = process.env.TMP = process.env.TMPDIR = dir;
}
