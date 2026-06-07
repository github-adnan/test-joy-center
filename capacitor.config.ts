import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "app.lovable.paymenttester",
  appName: "Payment Tester",
  initialFocus: true,
  // Folder Capacitor copies into the native APK as the offline web bundle.
  // We populate it with `bun run build:apk` (see package.json).
  webDir: "dist-apk",
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
