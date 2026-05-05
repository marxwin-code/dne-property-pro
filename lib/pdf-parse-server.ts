import { createRequire } from "node:module";
import type PdfParse from "pdf-parse";

const require = createRequire(import.meta.url);

/**
 * pdf-parse root `index.js` runs a debug `readFileSync` when `!module.parent`, which is true
 * under Next/Turbopack — build fails with ENOENT on `./test/data/05-versions-space.pdf`.
 * The implementation lives in `lib/pdf-parse.js` and has no side effects at load time.
 */
const pdfParse: typeof PdfParse = require("pdf-parse/lib/pdf-parse.js");

export default pdfParse;
