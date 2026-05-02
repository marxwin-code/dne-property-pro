import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SaveLeadBody = {
  name?: string;
  email?: string;
  age?: number | null;
  income?: number | null;
  savings?: number | null;
  propertyOwnership?: string;
  interestProperty?: string;
  source?: string;
};

function toNumberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveLeadBody;
    if (!body.email?.trim() || !body.source?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email and source are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Leads";
    if (!apiKey || !baseId) {
      return NextResponse.json(
        { success: false, message: "Server configuration missing Airtable credentials." },
        { status: 503 }
      );
    }

    const fields: Record<string, string | number | null> = {
      Name: body.name?.trim() || "",
      Email: body.email.trim(),
      Age: toNumberOrNull(body.age),
      Income: toNumberOrNull(body.income),
      Savings: toNumberOrNull(body.savings),
      "Property Ownership": body.propertyOwnership?.trim() || "",
      "Interest Property": body.interestProperty?.trim() || "",
      Source: body.source.trim(),
      "Created Time": new Date().toISOString()
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          records: [{ fields }]
        })
      }
    );

    const data = (await response.json()) as { error?: { message?: string } };
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.error?.message || "Failed to save lead to Airtable."
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
