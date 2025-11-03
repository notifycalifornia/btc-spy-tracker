## Build APK and Install via USB (Windows)

This guide creates a debug APK, copies it to `artifacts/android/`, and shows how to move it to your Android phone over USB and install it by tapping.

### 1) Build the APK locally
- Open PowerShell in `C:\Users\admin\Desktop\BTC SPY TRACKER` and run:
```powershell
npm install
npm run build:apk:debug
```
- Output file will be created at:
```
artifacts\android\btc-spy-tracker-debug.apk
```

Notes:
- This is a debug APK (no Play Store signing). It is fine for direct install/testing.
- First run will generate the native Android project and download Gradle; it can take several minutes.

### 2) Enable installs from unknown sources on your phone
- Settings → Security → Install unknown apps → enable for your Files app (varies by device).

### 3) Copy the APK to your phone via USB
Option A: File Explorer (recommended)
- Connect your phone via USB (use "File Transfer/MTP" mode if prompted).
- In Windows Explorer, open your phone storage.
- Copy `artifacts\android\btc-spy-tracker-debug.apk` to `Download/` on the device.

Option B: ADB (alternative)
```powershell
adb devices        # ensure your device shows as "device"
adb push artifacts\android\btc-spy-tracker-debug.apk /sdcard/Download/
```

### 4) Install on the device
- On the phone, open Files/Downloads app.
- Tap `btc-spy-tracker-debug.apk` → Install.
- If prompted, allow installs from unknown sources.

### 5) Launch
- After install, find "BTC SPY Tracker" in your app drawer and open it.

### Optional: Uninstall/Update
- To update, rebuild and re-copy the new APK, then install again to replace.
- To uninstall: long-press the app icon → App info → Uninstall.





