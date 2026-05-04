import { handleInvoiceExtractPost } from "@/lib/invoice-extract-post";

export const runtime = "nodejs";
/** Platform cap for batch PDF parse + Airtable + Excel (no external LLM). */
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleInvoiceExtractPost(request);
}
