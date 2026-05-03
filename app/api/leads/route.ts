import { NextResponse } from "next/server";
import { toAirtableLeadFields, type FullLeadForAirtable } from "@/lib/airtable-lead-fields";
import { insertLeadRecord } from "@/lib/airtable-insert-lead";

export const runtime = "nodejs";

const USER_FAIL = "Failed to submit. Please try again.";

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

function isFinitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function normalizeOwnership(raw: unknown): "yes" | "no" {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (s === "yes" || s === "true") return "yes";
  return "no";
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
  }

  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!email || !name) {
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
  }

  if (!isFinitePositive(body.income) || !isFiniteNonNegative(body.savings)) {
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
  }

  const lead: FullLeadForAirtable = {
    name,
    email,
    income: body.income as number,
    savings: body.savings as number,
    ownership: normalizeOwnership(body.ownership),
    location: typeof body.location === "string" ? body.location.trim() : "",
    score:
      body.score !== undefined && typeof body.score === "number" && Number.isFinite(body.score)
        ? Math.round(body.score)
        : undefined
  };

  const fields = toAirtableLeadFields(lead);

  try {
    await insertLeadRecord(fields);
  } catch (e) {
    console.error("[api/leads] Airtable error", e);
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
