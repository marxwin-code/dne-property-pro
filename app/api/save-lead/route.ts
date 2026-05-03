import { NextResponse } from "next/server";
import { toAirtableLeadFields } from "@/lib/airtable-lead-fields";
import { withRetry } from "@/lib/retry";

export const runtime = "nodejs";

/**
 * Simple Leads POST — only `name`, `email`, `message` map to the Leads table.
 * Do not block user success on Airtable failure (log and return success for UX).
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Submission failed. Please try again later." },
      { status: 400 }
    );
  }

  console.log(raw);

  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Submission failed. Please try again later." },
      { status: 400 }
    );
  }

  const record = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    email,
    message: typeof body.message === "string" ? body.message.trim().slice(0, 8000) : ""
  };

  const fields = toAirtableLeadFields(record);
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || "Leads";

  if (!apiKey || !baseId) {
    console.error("Leads Airtable error", new Error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID"));
    return NextResponse.json({ success: true });
  }

  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;
  const airtablePayload = { records: [{ fields }] };
  console.log("Airtable payload:", airtablePayload);

  try {
    await withRetry(
      async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(airtablePayload)
        });
        const json = (await response.json()) as { error?: { message?: string } };
        if (!response.ok) {
          const err = new Error(json.error?.message || `Airtable ${response.status}`);
          (err as Error & { status?: number }).status = response.status;
          throw err;
        }
        return json;
      },
      { attempts: 3, baseDelayMs: 500, label: "save-lead-airtable" }
    );
  } catch (e) {
    console.error("Leads Airtable error", e);
  }

  return NextResponse.json({ success: true });
}
