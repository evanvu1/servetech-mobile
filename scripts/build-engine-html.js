// Regenerates services/engineHtml.ts from assets/engine/engine.html.
// Run this after editing engine.html — the WebView loads the TS string
// export, not the .html file directly (keeps iOS/Android asset resolution
// out of the picture entirely).
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "assets/engine/engine.html"), "utf8");
const out =
  "// Auto-generated from assets/engine/engine.html — do not hand-edit.\n" +
  "// Regenerate with: node scripts/build-engine-html.js\n" +
  "export const ENGINE_HTML = " + JSON.stringify(html) + ";\n";

fs.writeFileSync(path.join(root, "services/engineHtml.ts"), out);
console.log(`wrote services/engineHtml.ts (${out.length} bytes)`);
