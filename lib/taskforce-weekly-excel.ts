import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { invoiceExtractLog } from "@/lib/invoice-extract-log";

/**
 * Taskforce weekly import sheet name in template.xlsx — must match generated template.
 */
export const TASKFORCE_WEEKLY_SHEET_NAME = "Invoices";

/** Resolved from repo root at runtime (Node / Next.js API route). */
export function getTaskforceWeeklyTemplatePath(): string {
  return path.join(process.cwd(), "lib", "invoice-templates", "taskforce", "template.xlsx");
}

export type TaskforceWeeklyExcelRow = {
  ledger: string;
  accountNumber: string;
  gstCode: string;
  amountIncGst: string | number;
  service: string;
  address: string;
  invoiceNumber: string;
  hcaReference: string;
  accountRtaList: string;
};

/**
 * Loads frozen Taskforce template from disk, appends data rows, returns .xlsx buffer.
 */
export async function buildTaskforceWeeklyExcelBuffer(rows: TaskforceWeeklyExcelRow[]): Promise<
  { ok: true; buffer: Buffer } | { ok: false; error: string }
> {
  const templatePath = getTaskforceWeeklyTemplatePath();
  try {
    if (!fs.existsSync(templatePath)) {
      const msg = `Missing Taskforce Excel template at ${templatePath}. Run: node scripts/generate-taskforce-template.mjs`;
      invoiceExtractLog("error", "taskforce_template_missing", { templatePath });
      return { ok: false, error: msg };
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    const ws =
      wb.getWorksheet(TASKFORCE_WEEKLY_SHEET_NAME) ??
      wb.worksheets[0] ??
      null;
    if (!ws) {
      return { ok: false, error: "Template workbook has no worksheets." };
    }

    for (const r of rows) {
      ws.addRow([
        r.ledger,
        r.accountNumber,
        r.gstCode,
        r.amountIncGst,
        r.service,
        r.address,
        r.invoiceNumber,
        r.hcaReference,
        r.accountRtaList
      ]);
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
