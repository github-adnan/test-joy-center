// Builds a standalone SPA bundle for Capacitor (APK).
// Uses vite.config.apk.ts which bypasses TanStack Start's SSR pipeline and
// emits a true client-only bundle into ./dist-apk. Capacitor packs this
// folder into the APK as the offline web assets.
import { execSync } from "node:child_process";

console.log("→ Building APK SPA bundle (vite.config.apk.ts → dist-apk/)...");
execSync("bunx vite build --config vite.config.apk.ts", { stdio: "inherit" });
console.log("✓ APK bundle ready in ./dist-apk");
