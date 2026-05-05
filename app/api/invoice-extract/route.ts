import { NextResponse } from "next/server";
import { handleInvoiceExtractPost } from "@/lib/invoice-extract-post";

export const runtime = "nodejs";
/** Platform cap for batch PDF parse + Airtable + Excel (no external LLM). */
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    return await handleInvoiceExtractPost(request);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[invoice-extract] route fatal:", message);
    return NextResponse.json({ success: false, error: message }, { status: 422 });
  }
}
