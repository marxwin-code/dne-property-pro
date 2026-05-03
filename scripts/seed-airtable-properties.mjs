/**
 * Loads `data/airtable-properties-seed.json` and creates rows in Airtable (batch API).
 * JSON keys must match table fields; `name` is the primary field (Single line text).
 * Requires: AIRTABLE_API_KEY, AIRTABLE_BASE_ID
 * Optional: AIRTABLE_PROPERTIES_TABLE_NAME (app default: properties_v2)
 *
 * Run: node scripts/seed-airtable-properties.mjs
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const table = process.env.AIRTABLE_PROPERTIES_TABLE_NAME || "properties_v2";

if (!apiKey || !baseId) {
  console.error("Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.");
  process.exit(1);
}

const seedPath = join(__dirname, "..", "data", "airtable-properties-seed.json");
const rows = JSON.parse(readFileSync(seedPath, "utf8"));

for (let i = 0; i < rows.length; i += 10) {
  const chunk = rows.slice(i, i + 10);
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      records: chunk.map((fields) => ({ fields }))
    })
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(res.status, text);
    process.exit(1);
  }
  console.log(`Inserted ${chunk.length} rows (${i + chunk.length}/${rows.length}).`);
}

console.log("Done.");
