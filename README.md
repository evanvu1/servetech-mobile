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

`services/analyzer.ts` exports `analyzeServe(videoUri, metadata, onProgress)`. Analysis runs entirely on-device — no backend, no upload:

- `assets/engine/engine.html` is a headless copy of ServeTech's browser-based analyzer (`pose-viewer.html` in the sibling `ServeTech` repo): MediaPipe pose + racquet detection, the same tuned `TUNE` heuristics, keyframe detection, and rubric scoring, stripped of all UI/canvas rendering and driven by `postMessage` instead of DOM controls.
- It's embedded as a string in `services/engineHtml.ts` (regenerate with `npm run build:engine` after editing `engine.html` — the WebView loads the string, not the `.html` file directly, to sidestep iOS/Android asset-resolution differences).
- `services/analyzerBridge.tsx` mounts one hidden `react-native-webview` at the app root (`app/_layout.tsx`) running that engine, and exposes `runEngineAnalysis()` as a promise-based API over `postMessage`.
- `services/analyzer.ts` reads the picked video as base64 (`expo-file-system`), hands it to the engine, and maps the raw checkpoint scores onto `AnalysisResult` using the coaching copy in `services/checkpointCopy.ts`.

**Keeping the engine in sync**: `engine.html`'s scoring/keyframe code (from `const LM = {` through the end of `analyzeServe`) is copied verbatim from `pose-viewer.html`. If the analyzer is retuned there, re-copy the same block here and run `npm run build:engine` — don't hand-edit the two independently.

**Known gaps / next steps**: there's no trim step in `add.tsx` yet — a full clip is passed straight through, which the analyzer can handle (it detects the serve within whatever it's given) but means longer clips take longer and the base64 handoff to the WebView gets larger. There's currently no persistence for saved analyses (`results.tsx`'s "Save Analysis" button doesn't write anywhere yet) — a backend, if one gets built, would exist for that (sync/history across devices), not for running the analysis itself.

The original Next.js frontend is preserved in Git commit `8918b8c` and branch `web-frontend-backup`.
