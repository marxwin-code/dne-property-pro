import { handleInvoiceExtractPost } from "@/lib/invoice-extract-post";

export const runtime = "nodejs";
/** Platform cap for PDF parse + Airtable + Excel (no external LLM). */
export const maxDuration = 10;

export async function POST(request: Request) {
  return handleInvoiceExtractPost(request);
}
