import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.paymenttester",
  appName: "Payment Tester",
  // Folder Capacitor copies into the native APK as the offline web bundle.
  // We populate it with `bun run build:apk` (see package.json).
  webDir: "dist-apk",
  android: {
    allowMixedContent: false,
  },
};

export default config;
