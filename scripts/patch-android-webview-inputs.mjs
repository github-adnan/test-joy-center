import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const androidRoot = "android/app/src/main";
const javaRoot = join(androidRoot, "java");
const manifestPath = join(androidRoot, "AndroidManifest.xml");

function findFile(dir, fileName) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(path, fileName);
      if (found) return found;
    } else if (entry.name === fileName) {
      return path;
    }
  }
  return null;
}

const activityPath = existsSync(javaRoot) ? findFile(javaRoot, "MainActivity.java") : null;

if (!activityPath) {
  throw new Error("Could not find generated Android MainActivity.java");
}

const mainActivity = `package app.lovable.paymenttester;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}
`;

writeFileSync(activityPath, mainActivity);

if (existsSync(manifestPath)) {
  const manifest = readFileSync(manifestPath, "utf8");
  const patched = manifest.includes("android:windowSoftInputMode")
    ? manifest.replace(/android:windowSoftInputMode="[^"]*"/, 'android:windowSoftInputMode="adjustResize|stateUnspecified"')
    : manifest.replace(/(<activity\b[^>]*)(>)/, '$1\n            android:windowSoftInputMode="adjustResize|stateUnspecified"$2');
  writeFileSync(manifestPath, patched);
}

if (existsSync(capacitorWebViewPath)) {
  const source = readFileSync(capacitorWebViewPath, "utf8");
  const dispatchKeyEventRegex = /    @Override\n    @SuppressWarnings\("deprecation"\)\n    public boolean dispatchKeyEvent\(KeyEvent event\) \{\n[\s\S]*?\n    \}\n(?=\})/;
  const safeDispatchKeyEvent = `    @Override
    @SuppressWarnings("deprecation")
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_MULTIPLE && bridge != null && bridge.getConfig().isInputCaptured()) {
            String characters = event.getCharacters();
            if (characters == null || characters.length() == 0) {
                return super.dispatchKeyEvent(event);
            }
            String encodedCharacters = org.json.JSONObject.quote(characters);
            evaluateJavascript(
                "if (document.activeElement && 'value' in document.activeElement) {" +
                    "var input = document.activeElement;" +
                    "input.value = input.value + " + encodedCharacters + ";" +
                    "input.dispatchEvent(new Event('input', { bubbles: true }));" +
                "}",
                null
            );
            return true;
        }
        return super.dispatchKeyEvent(event);
    }
`;

  if (!dispatchKeyEventRegex.test(source)) {
    throw new Error("Could not patch CapacitorWebView.dispatchKeyEvent");
  }

  writeFileSync(capacitorWebViewPath, source.replace(dispatchKeyEventRegex, safeDispatchKeyEvent));
}

console.log("✓ Android WebView input configuration sanitized");