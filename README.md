# ServeTech Mobile

Native iOS and Android frontend built with Expo, React Native, TypeScript, and Expo Router.

## Run

```bash
npm install
npm start
```

Scan the terminal QR code with Expo Go on a physical device connected to the same network.

- iOS Simulator: install Xcode, open Simulator, then press `i` in the Expo terminal or run `npm run ios`.
- Android Emulator: start an Android Virtual Device, then press `a` in the Expo terminal or run `npm run android`.

## Analyzer integration

`services/analyzer.ts` exports `analyzeServe(videoUri, metadata, onProgress)`. It currently simulates a multi-stage analysis and returns `data/mockAnalysis.ts`. Replace the implementation with the analyzer API upload and job polling while preserving the public function contract.

The original Next.js frontend is preserved in Git commit `8918b8c` and branch `web-frontend-backup`.
