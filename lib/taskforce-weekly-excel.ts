import ExcelJS from "exceljs";
import { invoiceExtractLog } from "@/lib/invoice-extract-log";

/**
 * Taskforce weekly import sheet — frozen layout (headers, order, widths, sheet name).
 * Do not change without a deliberate Taskforce template revision.
 */
export const TASKFORCE_WEEKLY_SHEET_NAME = "Invoices";

const TASKFORCE_WEEKLY_COLUMNS: ReadonlyArray<{ header: string; key: string; width: number }> = [
  { header: "Ledger", key: "ledger", width: 8 },
  { header: "Account Number", key: "accountNumber", width: 22 },
  { header: "GST Code", key: "gstCode", width: 10 },
  { header: "Amount (Inc GST)", key: "amountIncGst", width: 18 },
  { header: "Service", key: "service", width: 40 },
  { header: "Address", key: "address", width: 45 },
  { header: "Invoice Number", key: "invoiceNumber", width: 18 },
  { header: "HCA Reference", key: "hcaReference", width: 16 },
  { header: "Account number from RTA property list", key: "accountRtaList", width: 36 }
] as const;

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

export async function buildTaskforceWeeklyExcelBuffer(rows: TaskforceWeeklyExcelRow[]): Promise<
  { ok: true; buffer: Buffer } | { ok: false; error: string }
> {
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(TASKFORCE_WEEKLY_SHEET_NAME);
    ws.columns = [...TASKFORCE_WEEKLY_COLUMNS];
    for (const r of rows) {
      ws.addRow({
        ledger: r.ledger,
        accountNumber: r.accountNumber,
        gstCode: r.gstCode,
        amountIncGst: r.amountIncGst,
        service: r.service,
        address: r.address,
        invoiceNumber: r.invoiceNumber,
        hcaReference: r.hcaReference,
        accountRtaList: r.accountRtaList
      });
    }
    const buf = await wb.xlsx.writeBuffer();
    return { ok: true, buffer: Buffer.from(buf) };
  } catch (e) {
    invoiceExtractLog("error", "taskforce_excel_build_exception", { errorReason: String(e) });
    return { ok: false, error: "Failed to build Excel file." };
  }
}
