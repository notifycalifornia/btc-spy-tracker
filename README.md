## BTC SPY Tracker (Android)

Dark-mode Android app showing live BTC/USD, ETH/USD, and SPY/USD prices with charts. Screens auto-rotate between tickers every N seconds (default 3s), and data refreshes every 10s including pre/post-market.

### Features
- Dark UI optimized for landscape
- Auto-rotation between BTC, ETH, and SPY
- Change rotation interval (2–15s)
- 10s data refresh cadence
- Uses Yahoo Finance chart API with pre/post market data

### Requirements
- Node.js 18+
- npm or yarn
- Android device or emulator

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run start
   ```
   - Press `a` in the terminal to launch on Android, or scan the QR with Expo Go.

### Install and run via USB on Android (Windows)
1. Enable Developer Options on your phone:
   - Settings → About phone → Tap "Build number" 7 times → Developer options → Enable "USB debugging".
2. Install Android platform tools (ADB):
   - Install Android Studio or download platform-tools; ensure `adb` is on PATH.
3. Connect phone via USB and authorize debugging on the device.
4. Verify device is detected:
   ```bash
   adb devices
   ```
   You should see your device listed as "device".
5. Run the app on your phone:
   - Development build (recommended):
     ```bash
     npx expo run:android
     ```
     This installs a native dev build over USB and launches it.
   - Or start Metro and open in Expo Go:
     ```bash
     npm run start
     ```
     Then press `a` or open the app by scanning the QR code in Expo Go.

### Notes
- Data source: Yahoo Finance public chart endpoint (`query1.finance.yahoo.com`) with `includePrePost=true`.
- No API key required. Availability may vary by region/network.
- Rotation interval control is in the top-right ⏱ button.

### Project Structure
- `src/App.tsx` – app shell, rotation logic, settings, refresh
- `src/api/yahoo.ts` – data fetching/parsing
- `src/components/PriceChart.tsx` – Victory chart (dark theme)


