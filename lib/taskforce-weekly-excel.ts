import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { invoiceExtractLog } from "@/lib/invoice-extract-log";

/** Resolved from repo root at runtime (Node / Next.js API route). */
export function getTaskforceWeeklyTemplatePath(): string {
  return path.join(process.cwd(), "lib", "invoice-templates", "taskforce", "template.xlsx");
}

/**
 * One data row: A–J per Taskforce import spec.
 * A Ledger, B Account Number, C GST Code, D Amount, E Service, F Address,
 * G Invoice Number, H HCA Reference, I Account number from RTA, J Notes
 */
export type TaskforceWeeklyExcelRow = {
  ledger: string;
  accountNumber: string;
  gstCode: string;
  amount: string | number;
  service: string;
  address: string;
  invoiceNumber: string;
  hcaReference: string;
  accountRtaList: string;
  notes: string;
};

/**
 * Loads template.xlsx, uses **first sheet only**, writes rows **2 … (1 + rows.length)** columns A–J.
 */
export async function buildTaskforceWeeklyExcelBuffer(
  rows: TaskforceWeeklyExcelRow[]
): Promise<{ ok: true; buffer: Buffer } | { ok: false; error: string }> {
  const templatePath = getTaskforceWeeklyTemplatePath();
  try {
    if (rows.length === 0) {
      return { ok: false, error: "No invoice rows to write to Excel." };
    }

    if (!fs.existsSync(templatePath)) {
      const msg = `Missing Taskforce Excel template at ${templatePath}. Run: npm run generate:taskforce-template`;
      invoiceExtractLog("error", "taskforce_template_missing", { templatePath });
      return { ok: false, error: msg };
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    const ws = wb.worksheets[0] ?? null;
    if (!ws) {
      return { ok: false, error: "Template workbook has no worksheets." };
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const r = ws.getRow(2 + i);
      const cells: (string | number)[] = [
        row.ledger,
        row.accountNumber,
        row.gstCode,
        row.amount,
        row.service,
        row.address,
        row.invoiceNumber,
        row.hcaReference,
        row.accountRtaList,
        row.notes
      ];
      for (let c = 0; c < cells.length; c++) {
        r.getCell(c + 1).value = cells[c];
      }
    }

    const buf = await wb.xlsx.writeBuffer();
    return { ok: true, buffer: Buffer.from(buf) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    invoiceExtractLog("error", "taskforce_excel_build_exception", {
      errorReason: msg,
      templatePath
    });
    return { ok: false, error: `Excel build failed: ${msg}` };
  }
}
