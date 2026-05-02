import { NextResponse } from "next/server";
import { withRetry } from "@/lib/retry";

export const runtime = "nodejs";

/** Body accepted from clients — only lowercase fields are sent to Airtable. */
type SaveLeadBody = {
  name?: string;
  email?: string;
  income?: number | null;
  savings?: number | null;
  ownership?: string;
  location?: string;
  score?: number | null;
  /** Ignored for Airtable (backward compat) */
  age?: number | null;
  leadLevel?: string;
  recommendedProperties?: string;
  source?: string;
  propertyOwnership?: string;
};

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

/** Airtable field names — must match base columns (all lowercase). */
function buildAirtableFields(body: SaveLeadBody): Record<string, string | number | null> {
  return {
    name: body.name?.trim() || "",
    email: body.email?.trim() || "",
    income: toNumberOrNull(body.income),
    savings: toNumberOrNull(body.savings),
    ownership: (body.ownership ?? body.propertyOwnership ?? "").trim() || "",
    location: body.location?.trim() || "",
    score: toNumberOrNull(body.score)
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveLeadBody;
    if (!body.email?.trim()) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Leads";

    if (!apiKey || !baseId) {
      console.error("[save-lead] Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID.");
      return NextResponse.json(
        { success: false, message: "Server configuration missing Airtable credentials." },
        { status: 503 }
      );
    }

    const fields = buildAirtableFields(body);
    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;

    const data = await withRetry(
      async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            records: [{ fields }]
          })
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

    console.log("[save-lead] Airtable create OK for", body.email.trim(), data);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[save-lead]", e);
    const msg = e instanceof Error ? e.message : "Something went wrong, please try again";
    return NextResponse.json({ success: false, message: msg }, { status: 502 });
  }
}
