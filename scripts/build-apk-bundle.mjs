// Builds a static SPA bundle for Capacitor (APK) from the TanStack Start app.
// TanStack Start normally outputs an SSR bundle for Cloudflare Workers; for an
// offline APK we need a plain client-side folder with an index.html that
// boots the React app. This script takes the client assets emitted by Vite
// and writes a minimal index.html that loads them, then drops the result in
// ./dist-apk for Capacitor to copy into the native project.
//
// Run via: bun run build:apk

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync, rmSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "dist-apk";
const CANDIDATES = [
  ".output/public",
  "dist/client",
  "dist/public",
  ".vinxi/build/client",
  "dist",
];

console.log("→ Running production build...");
execSync("bun run build", { stdio: "inherit" });

let CLIENT_DIR = CANDIDATES.find((p) => existsSync(p) && readdirSync(p).some((e) => e.endsWith(".html") || e === "assets" || e === "_build"));
if (!CLIENT_DIR) {
  console.error(`✗ Could not find a client bundle. Tried: ${CANDIDATES.join(", ")}`);
  process.exit(1);
}

console.log(`→ Preparing ${OUT}/`);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

function copyRecursive(src, dest) {
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) {
      mkdirSync(d, { recursive: true });
      copyRecursive(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}
copyRecursive(CLIENT_DIR, OUT);

// Find the client entry JS emitted by Vite (hashed filename in _build/assets or similar).
// We look for a file referenced as the client entry in the assets folder.
function findEntry(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      const found = findEntry(p);
      if (found) return found;
    } else if (/client.*\.js$/.test(entry) || /entry.*\.js$/.test(entry) || /main.*\.js$/.test(entry)) {
      return p.replace(OUT, "").replaceAll("\\", "/");
    }
  }
  return null;
}

// Simpler: look for an existing index.html in the output and use it as-is.
const idx = join(OUT, "index.html");
if (!existsSync(idx)) {
  console.warn("⚠ No index.html in build output — generating a minimal shell.");
  // Look for any JS file under _build or assets to use as entry
  const candidates = [];
  function scan(d) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) scan(p);
      else if (e.endsWith(".js")) candidates.push(p.replace(OUT, "").replaceAll("\\", "/"));
    }
  }
  scan(OUT);
  const entry = candidates.find((p) => /client|entry|main/i.test(p)) || candidates[0];
  if (!entry) {
    console.error("✗ No JS bundle found in output.");
    process.exit(1);
  }
  writeFileSync(
    idx,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Payment Tester</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entry}"></script>
  </body>
</html>
`,
  );
}

console.log(`✓ APK bundle ready in ./${OUT}`);
console.log("  Next: npx cap sync android && open android/ to build the APK.");
