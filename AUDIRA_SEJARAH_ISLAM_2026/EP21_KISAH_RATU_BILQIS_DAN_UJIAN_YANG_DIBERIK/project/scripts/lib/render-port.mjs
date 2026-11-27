// Render port range: Remotion's local file server starts at port 3000 by default, where Remotion Studio,
// dev servers and other apps often sit. AUDIRA renders use 47300-47399 instead (rarely used by other apps).
// AUDIRA_RENDER_PORTS="<from>-<to>" overrides the range.
// Each Node process (render-final.mjs --jobs=N starts N) takes the first free port in the range. Two
// processes can pick the same port at the same moment; Remotion then fails with "is not available",
// and withRenderPort retries on the next free port.
import net from "node:net";

export function portRange() {
  const m = /^(\d+)\s*-\s*(\d+)$/.exec(process.env.AUDIRA_RENDER_PORTS ?? "");
  const [from, to] = m ? [Number(m[1]), Number(m[2])] : [47300, 47399];
  return from >= 1024 && to <= 65535 && from <= to ? { from, to } : { from: 47300, to: 47399 };
}

// Same hosts Remotion tests; a host this machine lacks (no IPv6 loopback) does not count as busy.
const HOSTS = ["::1", "127.0.0.1", "0.0.0.0"];
const freeOn = (port, host) => new Promise((resolve) => {
  const s = net.createServer();
  s.unref();
  s.once("error", (e) => resolve(e.code === "EADDRNOTAVAIL" || e.code === "EAFNOSUPPORT"));
  s.listen({ port, host }, () => s.close(() => resolve(true)));
});

/** First port in the range that is free on every host, skipping ports in `skip`. */
export async function renderPort(skip = new Set()) {
  const { from, to } = portRange();
  for (let p = from; p <= to; p++) {
    if (skip.has(p)) continue;
    let ok = true;
    for (const h of HOSTS) if (!(await freeOn(p, h))) { ok = false; break; }
    if (ok) return p;
  }
  throw new Error(`no free render port in ${from}-${to} (AUDIRA_RENDER_PORTS)`);
}

let shown = false;
const portTaken = (e) => /port \d+ to be used for the HTTP server, but it is not available|EADDRINUSE/i.test(String(e?.stack ?? e));

/** Run fn(port) with a free render port; when another process took it first, retry on the next one. */
export async function withRenderPort(fn) {
  const tried = new Set();
  for (;;) {
    const port = await renderPort(tried);
    // stderr: render-final workers report progress on stdout as bare numbers
    if (!shown) { shown = true; console.error(`render port ${port} (range ${portRange().from}-${portRange().to})`); }
    try {
      return await fn(port);
    } catch (e) {
      if (!portTaken(e)) throw e;
      tried.add(port);
    }
  }
}
