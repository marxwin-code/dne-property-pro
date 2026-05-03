import { NextResponse } from "next/server";
import { toAirtableLegacyMessageLead } from "@/lib/airtable-lead-fields";
import { insertLeadRecord } from "@/lib/airtable-insert-lead";

export const runtime = "nodejs";

const USER_FAIL = "Failed to submit. Please try again.";

/**
 * Legacy POST — message-only inquiries mapped into Leads (`location` holds message snippet).
 * Prefer POST /api/leads with full snake_case fields for new integrations.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
  }

  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
  }

  const record = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    email,
    message: typeof body.message === "string" ? body.message.trim().slice(0, 8000) : ""
  };

  const fields = toAirtableLegacyMessageLead(record);

  try {
    await insertLeadRecord(fields);
  } catch (e) {
    console.error("[save-lead] Airtable error", e);
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
