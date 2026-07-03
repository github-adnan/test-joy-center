import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.paymenttester",
  appName: "Payment Tester",
  webDir: "dist-apk",
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
