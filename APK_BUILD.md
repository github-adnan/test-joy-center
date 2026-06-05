# Building an offline APK with Capacitor

This project is wrapped with [Capacitor](https://capacitorjs.com/) so you can
ship the web app as an installable Android APK. All payment-testing state is
stored in `localStorage`, so the app works fully offline once installed.

> You don't need Android Studio on your own machine — you can build the APK
> on a free CI service (Codemagic, Ionic Appflow, GitHub Actions, etc.) or
> ask a friend with Android Studio to run the final `gradlew` command. The
> steps below get you everything *up to* that final native build.

---

## Prerequisites on your machine

- Node.js 20+ and Bun (or npm/pnpm — substitute commands as needed)
- A terminal

That's it. No Android Studio required for the project setup steps.

---

## 1. Install dependencies

Already done in this repo, but for reference:

```bash
bun install
bun add -d @capacitor/core @capacitor/cli @capacitor/android
```

---

## 2. Build the offline web bundle

```bash
bun run build:apk
```

This runs the production build and copies the static client assets into
`./dist-apk/` — the folder Capacitor packages into the APK.

---

## 3. Generate the native Android project (one-time)

```bash
npx cap add android
```

This creates an `./android/` folder containing a real Gradle/Android project.
Commit it to git so future builds reuse it.

After any future `bun run build:apk`, sync the latest web assets into the
native project with:

```bash
npx cap sync android
```

---

## 4. Build the APK

You have three options — pick whichever you can access:

### Option A — Codemagic (free, no local Android tools)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Sign in at https://codemagic.io with that account.
3. Add this repo as a new app, pick **Flutter/React Native/Capacitor → Android**.
4. In the workflow editor set the build command to:
   ```
   bun install && bun run build:apk && npx cap sync android && cd android && ./gradlew assembleDebug
   ```
5. Set the artifact path to `android/app/build/outputs/apk/debug/*.apk`.
6. Start the build. When it finishes, download the `.apk` from the artifacts tab.

Free tier gives 500 build minutes/month — plenty for a small app.

### Option B — Ionic Appflow (built for Capacitor)

1. Sign up at https://ionic.io/appflow (free hobby tier).
2. Connect your git repo.
3. Choose **Android → Debug build**. Appflow installs the Android SDK
   automatically and produces a downloadable APK.

### Option C — GitHub Actions

Create `.github/workflows/android.yml`:

```yaml
name: Build APK
on: [workflow_dispatch, push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: "21" }
      - uses: android-actions/setup-android@v3
      - run: bun install
      - run: bun run build:apk
      - run: npx cap sync android
      - run: cd android && chmod +x gradlew && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: app-debug.apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

Push, open the **Actions** tab on GitHub, wait ~5 min, download the APK
from the run's Artifacts section.

---

## 5. Install on your phone

1. Transfer the `.apk` to your Android device (USB, Drive, email).
2. On the phone, tap the file. Android will ask you to allow installs from
   this source — accept once.
3. Open **Payment Tester** from your app drawer.

That's it. Everything runs locally — no internet required.

---

## Updating the app later

After any code change:

```bash
bun run build:apk
npx cap sync android
# rebuild the APK via your chosen CI (Codemagic/Appflow/Actions)
```

---

## Customising

- **App name / icon / package id**: edit `capacitor.config.ts` (`appName`,
  `appId`). For icons, drop a 1024×1024 PNG and run a tool like
  [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets).
- **Splash screen / status bar colour**: see Capacitor docs.
- **Signed release APK** (vs the debug APK above): replace
  `assembleDebug` with `assembleRelease` and configure a signing key —
  Capacitor docs walk through this.
