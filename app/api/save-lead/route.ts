import { NextResponse } from "next/server";
import { toAirtableLeadFields, type LeadBodyForAirtable } from "@/lib/airtable-lead-fields";
import { withRetry } from "@/lib/retry";

export const runtime = "nodejs";

/** Body accepted from clients — must map to lowercase Airtable columns: name, email, income, savings, ownership, location. */
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

function toNumberOrZero(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (local && local.length > 0) {
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Lead";
}

function buildCanonicalLead(body: SaveLeadBody): LeadBodyForAirtable {
  const email = body.email?.trim() || "";
  const nameRaw = body.name?.trim() || "";
  return {
    name: nameRaw || nameFromEmail(email),
    email,
    income: toNumberOrZero(body.income),
    savings: toNumberOrZero(body.savings),
    ownership: (body.ownership ?? body.propertyOwnership ?? "").trim() || "—",
    location: body.location?.trim() || "—",
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

    const canonical = buildCanonicalLead(body);
    const fields = toAirtableLeadFields(canonical);
    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;

    const airtablePayload = { records: [{ fields }] };
    console.log("Airtable payload:", airtablePayload);

    const data = await withRetry(
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

    console.log("[save-lead] Airtable create OK for", body.email.trim(), data);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[save-lead]", e);
    const raw = e instanceof Error ? e.message : "Something went wrong, please try again";
    const msg =
      /Unknown field name|UNKNOWN_FIELD_NAME|INVALID_VALUE_FOR_COLUMN/i.test(raw) && raw.length < 400
        ? `Airtable rejected the row: ${raw}. Check that your Leads table has lowercase fields: name, email, income, savings, ownership, location, and optionally score.`
        : raw;
    return NextResponse.json({ success: false, message: msg }, { status: 502 });
  }
}
