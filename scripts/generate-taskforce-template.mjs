/**
 * Writes lib/invoice-templates/taskforce/template.xlsx (row 1 headers; data from row 2).
 * Run from repo root: npm run generate:taskforce-template
 */
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "lib", "invoice-templates", "taskforce", "template.xlsx");

fs.mkdirSync(path.dirname(out), { recursive: true });

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Sheet1");
const headers = [
  "Ledger",
  "Account Number",
  "GST Code",
  "Amount",
  "Service",
  "Address",
  "Invoice Number",
  "HCA Reference",
  "Account number from RTA property list",
  "Notes"
];
ws.addRow(headers);
const widths = [8, 28, 10, 14, 48, 48, 18, 16, 40, 12];
widths.forEach((w, i) => {
  ws.getColumn(i + 1).width = w;
});

await wb.xlsx.writeFile(out);
console.log("Wrote", out);
