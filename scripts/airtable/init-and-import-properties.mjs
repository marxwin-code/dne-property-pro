/**
 * Initialize `Properties` (or AIRTABLE_CATALOG_TABLE_NAME) via Metadata API and upsert CSV rows by `property_id`.
 *
 * Requires: AIRTABLE_API_KEY (PAT with data.records:read/write + schema.bases:read/write), AIRTABLE_BASE_ID
 * Optional: AIRTABLE_CATALOG_TABLE_NAME (default: Properties), PROPERTY_CSV_PATH (override default CSV path)
 *
 * Usage:
 *   node --env-file=.env.local scripts/airtable/init-and-import-properties.mjs
 *   node scripts/airtable/init-and-import-properties.mjs --init-only
 *   node scripts/airtable/init-and-import-properties.mjs --import-only --csv data/property_data.csv
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const META = "https://api.airtable.com/v0/meta/bases";
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_CATALOG_TABLE_NAME?.trim() || "Properties";

function parseArgs() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--csv");
  const fromCli = i >= 0 && argv[i + 1] ? argv[i + 1] : null;
  const defaultCsv = join(root, "data", "property_data.csv");
  return {
    initOnly: argv.includes("--init-only"),
    importOnly: argv.includes("--import-only"),
    csvPath: fromCli ?? process.env.PROPERTY_CSV_PATH?.trim() ?? defaultCsv
  };
}

async function airtable(path, options = {}) {
  const url = path.startsWith("http") ? path : `https://api.airtable.com${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* leave null */
  }
  if (!res.ok) {
    const err = new Error(`Airtable ${res.status}: ${text.slice(0, 800)}`);
    err.status = res.status;
    err.body = json ?? text;
    throw err;
  }
  return json;
}

/** Metadata API: field definitions (primary = first field). */
function buildFieldsDefinition() {
  const sel = (name, choices) => ({
    name,
    type: "singleSelect",
    options: {
      choices: choices.map((c) => ({ name: c }))
    }
  });

  return [
    { name: "name", type: "singleLineText" },
    { name: "property_id", type: "singleLineText" },
    { name: "suburb", type: "singleLineText" },
    { name: "estate", type: "singleLineText" },
    { name: "lot_number", type: "singleLineText" },
    {
      name: "land_size",
      type: "number",
      options: { precision: 1 }
    },
    {
      name: "frontage",
      type: "number",
      options: { precision: 2 }
    },
    {
      name: "depth",
      type: "number",
      options: { precision: 2 }
    },
    {
      name: "land_price",
      type: "currency",
      options: { precision: 2, symbol: "$" }
    },
    { name: "title_date", type: "singleLineText" },
    { name: "house_design", type: "singleLineText" },
    {
      name: "house_size",
      type: "number",
      options: { precision: 0 }
    },
    {
      name: "build_price",
      type: "currency",
      options: { precision: 2, symbol: "$" }
    },
    { name: "facade", type: "singleLineText" },
    {
      name: "bedrooms",
      type: "number",
      options: { precision: 0 }
    },
    {
      name: "bathrooms",
      type: "number",
      options: { precision: 1 }
    },
    {
      name: "car_spaces",
      type: "number",
      options: { precision: 0 }
    },
    {
      name: "package_price",
      type: "currency",
      options: { precision: 2, symbol: "$" }
    },
    {
      name: "price",
      type: "currency",
      options: { precision: 2, symbol: "$" }
    },
    {
      name: "weekly_rent",
      type: "currency",
      options: { precision: 2, symbol: "$" }
    },
    sel("status", ["Available", "Sold", "Under Offer", "Pending"]),
    sel("region", ["West", "North", "South", "East", "South East", "Regional", "CBD"]),
    sel("property_type", ["House", "Apartment", "Townhouse"]),
    sel("price_band", ["cheap", "fair", "expensive"]),
    sel("risk_level", ["Low", "Medium", "High"]),
    {
      name: "yield_percent",
      type: "number",
      options: { precision: 2 }
    },
    {
      name: "investment_score",
      type: "number",
      options: { precision: 0 }
    },
    {
      name: "growth_score",
      type: "number",
      options: { precision: 1 }
    },
    {
      name: "distance_to_cbd",
      type: "number",
      options: { precision: 1 }
    },
    {
      name: "school_score",
      type: "number",
      options: { precision: 0 }
    },
    {
      name: "crime_rate",
      type: "number",
      options: { precision: 2 }
    },
    {
      name: "suburb_score",
      type: "number",
      options: { precision: 0 }
    },
    { name: "location", type: "singleLineText" },
    { name: "description", type: "multilineText" },
    { name: "image_url", type: "url" },
    { name: "image_main", type: "url" },
    { name: "image_floorplan", type: "url" },
    {
      name: "image_gallery",
      type: "multipleAttachments",
      options: {}
    }
  ];
}

async function listTables() {
  const data = await airtable(`${META}/${encodeURIComponent(baseId)}/tables`);
  return data.tables ?? [];
}

async function createPropertiesTable() {
  const body = {
    name: tableName,
    fields: buildFieldsDefinition()
  };
  const created = await airtable(`${META}/${encodeURIComponent(baseId)}/tables`, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return created;
}

async function getTableSchema(tableId) {
  return airtable(`${META}/${encodeURIComponent(baseId)}/tables/${encodeURIComponent(tableId)}`);
}

function normalizeHeader(h) {
  return String(h ?? "")
    .trim()
    .replace(/^\ufeff/, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function parseNum(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const s = String(raw).trim();
  if (!s) return null;
  const n = parseFloat(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function splitGallery(raw) {
  if (!raw || !String(raw).trim()) return [];
  return String(raw)
    .split(/[|\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((u) => (u.startsWith("http://") ? `https://${u.slice(7)}` : u))
    .filter((u) => u.startsWith("https://"));
}

function normalizeRiskLevel(raw) {
  if (!raw || !String(raw).trim()) return null;
  const t = String(raw).trim().toLowerCase();
  if (t === "low") return "Low";
  if (t === "medium") return "Medium";
  if (t === "high") return "High";
  return String(raw).trim();
}

function normalizePriceBand(raw) {
  if (!raw || !String(raw).trim()) return null;
  const t = String(raw).trim().toLowerCase();
  if (t === "cheap" || t === "fair" || t === "expensive") return t;
  return null;
}

const STATUS_OPTIONS = ["Available", "Sold", "Under Offer", "Pending"];
const REGION_OPTIONS = ["West", "North", "South", "East", "South East", "Regional", "CBD"];
const PROPERTY_TYPE_OPTIONS = ["House", "Apartment", "Townhouse"];

function matchSingleSelect(raw, allowed) {
  if (!raw || !String(raw).trim()) return null;
  const s = String(raw).trim();
  const hit = allowed.find((a) => a.toLowerCase() === s.toLowerCase());
  return hit ?? null;
}

/**
 * Map one CSV row (object with normalized keys) → Airtable record fields.
 */
function rowToFields(row) {
  const g = (k) => row[normalizeHeader(k)] ?? row[k];

  const fields = {};

  const property_id = String(g("property_id") ?? "").trim();
  if (!property_id) return null;

  const name = String(g("name") ?? "").trim();
  if (name) fields.name = name;

  fields.property_id = property_id;

  const setStr = (field, ...keys) => {
    for (const key of keys) {
      const v = g(key);
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        fields[field] = String(v).trim();
        return;
      }
    }
  };

  const setNum = (field, ...keys) => {
    for (const key of keys) {
      const v = parseNum(g(key));
      if (v !== null) {
        fields[field] = v;
        return;
      }
    }
  };

  setStr("suburb", "suburb");
  setStr("estate", "estate");
  setStr("lot_number", "lot_number", "lot");
  setNum("land_size", "land_size");
  setNum("frontage", "frontage");
  setNum("depth", "depth");
  setNum("land_price", "land_price");
  setStr("title_date", "title_date");
  setStr("house_design", "house_design");
  setNum("house_size", "house_size");
  setNum("build_price", "build_price");
  setStr("facade", "facade");
  setNum("bedrooms", "bedrooms");
  setNum("bathrooms", "bathrooms");
  setNum("car_spaces", "car_spaces");
  setNum("package_price", "package_price");
  setNum("price", "price");
  setNum("weekly_rent", "weekly_rent");

  const st = matchSingleSelect(g("status"), STATUS_OPTIONS);
  if (st) fields.status = st;

  const reg = matchSingleSelect(g("region"), REGION_OPTIONS);
  if (reg) fields.region = reg;

  const ptRaw = g("property_type") ?? g("type");
  const pt = matchSingleSelect(ptRaw, PROPERTY_TYPE_OPTIONS);
  if (pt) fields.property_type = pt;

  const pb = normalizePriceBand(g("price_band"));
  if (pb) fields.price_band = pb;

  const rk = normalizeRiskLevel(g("risk_level"));
  if (rk) fields.risk_level = rk;

  setNum("yield_percent", "yield_percent");
  setNum("investment_score", "investment_score");
  setNum("growth_score", "growth_score");
  setNum("distance_to_cbd", "distance_to_cbd");
  setNum("school_score", "school_score");
  setNum("crime_rate", "crime_rate");
  setNum("suburb_score", "suburb_score");
  setStr("location", "location");
  setStr("description", "description");

  const mainImg = String(g("image_main") ?? g("image_url") ?? "").trim();
  const floorImg = String(g("image_floorplan") ?? "").trim();
  if (mainImg) {
    fields.image_main = mainImg.startsWith("http://") ? `https://${mainImg.slice(7)}` : mainImg;
    fields.image_url = fields.image_main;
  }
  if (floorImg) {
    fields.image_floorplan = floorImg.startsWith("http://") ? `https://${floorImg.slice(7)}` : floorImg;
  }

  const gal = splitGallery(g("image_gallery"));
  if (gal.length) fields.image_gallery = gal.map((url) => ({ url }));

  if (!fields.name) fields.name = `Property ${property_id}`;

  return fields;
}

async function fetchAllPropertyIds() {
  const byPid = new Map();
  let offset = "";
  const pathBase = `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;

  for (;;) {
    const q = new URLSearchParams();
    q.set("pageSize", "100");
    q.set("fields[]", "property_id");
    if (offset) q.set("offset", offset);
    const data = await airtable(`${pathBase}?${q}`);
    for (const rec of data.records ?? []) {
      const pid = rec.fields?.property_id;
      if (typeof pid === "string" && pid.trim()) byPid.set(pid.trim(), rec.id);
    }
    if (!data.offset) break;
    offset = data.offset;
  }
  return byPid;
}

async function upsertRows(rows) {
  const idByPid = await fetchAllPropertyIds();
  const toCreate = [];
  const toUpdate = [];

  /** Last row wins for duplicate property_id in CSV */
  const lastByPid = new Map();
  for (const row of rows) {
    const fields = rowToFields(row);
    if (!fields?.property_id) continue;
    lastByPid.set(fields.property_id, fields);
  }

  for (const fields of lastByPid.values()) {
    const pid = fields.property_id;
    const existingId = idByPid.get(pid);
    if (existingId) toUpdate.push({ id: existingId, fields });
    else toCreate.push({ fields });
  }

  const recordsUrl = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;

  let created = 0;
  let updated = 0;

  for (let i = 0; i < toCreate.length; i += 10) {
    const chunk = toCreate.slice(i, i + 10);
    const res = await fetch(recordsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records: chunk })
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(text);
      throw new Error(`Batch create failed: ${res.status}`);
    }
    created += chunk.length;
    const json = JSON.parse(text);
    for (const rec of json.records ?? []) {
      const pid = rec.fields?.property_id;
      if (typeof pid === "string" && pid.trim()) idByPid.set(pid.trim(), rec.id);
    }
  }

  for (let i = 0; i < toUpdate.length; i += 10) {
    const chunk = toUpdate.slice(i, i + 10);
    const res = await fetch(recordsUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records: chunk.map(({ id, fields }) => ({ id, fields }))
      })
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(text);
      throw new Error(`Batch update failed: ${res.status}`);
    }
    updated += chunk.length;
  }

  return { created, updated, totalProcessed: created + updated };
}

function printSchema(tableMeta) {
  console.log("\n--- Table schema (fields + types) ---\n");
  const fields = tableMeta.fields ?? [];
  for (const f of fields) {
    const opts = f.options ? JSON.stringify(f.options).slice(0, 120) : "";
    console.log(`  ${f.name}: ${f.type}${opts ? `  (${opts}${opts.length >= 120 ? "…" : ""})` : ""}`);
  }
  console.log(`\nTotal fields: ${fields.length}\n`);
}

async function fetchOneExampleRecord() {
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}?maxRecords=1`;
  const data = await airtable(url);
  const rec = data.records?.[0];
  return rec ?? null;
}

async function main() {
  const args = parseArgs();

  if (!apiKey || !baseId) {
    console.error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID.");
    process.exit(1);
  }

  let tableId = null;
  let tableMeta = null;

  if (!args.importOnly) {
    const tables = await listTables();
    const existing = tables.find((t) => t.name === tableName);
    if (existing) {
      console.log(`Table "${tableName}" already exists (id ${existing.id}). Skipping Metadata API create.`);
      tableId = existing.id;
      tableMeta = await getTableSchema(tableId);
    } else {
      console.log(`Creating table "${tableName}" via Metadata API…`);
      const created = await createPropertiesTable();
      tableId = created.id;
      tableMeta = created;
      console.log(`Created table id=${tableId}`);
    }
    printSchema(tableMeta);
  } else {
    const tables = await listTables();
    const existing = tables.find((t) => t.name === tableName);
    if (!existing) {
      console.error(`Table "${tableName}" not found; run without --import-only first.`);
      process.exit(1);
    }
    tableId = existing.id;
    tableMeta = await getTableSchema(tableId);
    printSchema(tableMeta);
  }

  if (args.initOnly) {
    console.log("--init-only: done.");
    process.exit(0);
  }

  if (!existsSync(args.csvPath)) {
    console.error(`CSV not found: ${args.csvPath}`);
    console.error("Copy data/property_data.csv.example to data/property_data.csv and fill, or pass --csv PATH.");
    process.exit(1);
  }

  const raw = readFileSync(args.csvPath, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
  });

  const normalizedRows = rows.map((row) => {
    const o = {};
    for (const [k, v] of Object.entries(row)) {
      o[normalizeHeader(k)] = v;
    }
    return o;
  });

  console.log(`Importing ${normalizedRows.length} CSV row(s) into "${tableName}" (upsert by property_id)…`);
  const { created, updated, totalProcessed } = await upsertRows(normalizedRows);

  console.log("\n--- Import summary ---");
  console.log(`  Rows in CSV: ${normalizedRows.length}`);
  console.log(`  Records created: ${created}`);
  console.log(`  Records updated (upsert): ${updated}`);
  console.log(`  Total writes: ${totalProcessed}`);

  const example = await fetchOneExampleRecord();
  console.log("\n--- Example record (full JSON) ---\n");
  console.log(example ? JSON.stringify(example, null, 2) : "  (no records yet)");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
