/**
 * Writes lib/invoice-templates/taskforce/template.xlsx (header row only).
 * Run from repo root: node scripts/generate-taskforce-template.mjs
 */
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "lib", "invoice-templates", "taskforce", "template.xlsx");

fs.mkdirSync(path.dirname(out), { recursive: true });

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Invoices");
const headers = [
  "Ledger",
  "Account Number",
  "GST Code",
  "Amount (Inc GST)",
  "Service",
  "Address",
  "Invoice Number",
  "HCA Reference",
  "Account number from RTA property list"
];
ws.addRow(headers);
headers.forEach((_, i) => {
  const col = ws.getColumn(i + 1);
  col.width = [8, 22, 10, 18, 40, 45, 18, 16, 36][i] ?? 12;
});

await wb.xlsx.writeFile(out);
console.log("Wrote", out);
