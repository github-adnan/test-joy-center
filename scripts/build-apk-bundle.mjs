// Builds a static SPA bundle for Capacitor (APK) from the TanStack Start app.
// TanStack Start emits an SSR build (dist/server + dist/client). For an
// offline APK we copy the client assets and synthesize a simple index.html
// that boots the client entry. Capacitor packs ./dist-apk into the APK.
//
// Run via: bun run build:apk

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  writeFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const OUT = "dist-apk";
const CANDIDATES = [".output/public", "dist/client", "dist/public"];

console.log("→ Running production build...");
execSync("bun run build", { stdio: "inherit" });

const CLIENT_DIR = CANDIDATES.find((p) => existsSync(p));
if (!CLIENT_DIR) {
  console.error(`✗ No client bundle found. Tried: ${CANDIDATES.join(", ")}`);
  process.exit(1);
}
console.log(`→ Using client bundle: ${CLIENT_DIR}`);

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

// If the client bundle already has an index.html, we're done.
const idx = join(OUT, "index.html");
if (existsSync(idx)) {
  console.log(`✓ APK bundle ready in ./${OUT} (existing index.html).`);
  process.exit(0);
}

// Otherwise synthesize a SPA shell that loads the client entry + CSS.
const assetsDir = join(OUT, "assets");
if (!existsSync(assetsDir)) {
  console.error("✗ No assets/ folder in client bundle — cannot synthesize index.html.");
  process.exit(1);
}
const assets = readdirSync(assetsDir);

// Vite typically emits the main client entry as `index-*.js`. Pick the
// smallest such file (the entry stub) — larger index-*.js files are usually
// route chunks. Fall back to the first index-*.js.
const entryCandidates = assets
  .filter((f) => /^index-.*\.js$/.test(f))
  .map((f) => ({ f, size: statSync(join(assetsDir, f)).size }))
  .sort((a, b) => a.size - b.size);
const entry = entryCandidates[0]?.f;
if (!entry) {
  console.error("✗ Could not locate a client entry (index-*.js) in assets/.");
  process.exit(1);
}
const css = assets.find((f) => /\.css$/.test(f));

writeFileSync(
  idx,
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Payment Tester</title>
    ${css ? `<link rel="stylesheet" href="/assets/${css}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${entry}"></script>
  </body>
</html>
`,
);

console.log(`✓ APK bundle ready in ./${OUT}`);
console.log(`  Entry:  /assets/${entry}`);
if (css) console.log(`  Styles: /assets/${css}`);
