/**
 * Airtable **Leads** table — all field names lowercase (match base exactly).
 * Primary: `name`. Single select `ownership`: `yes` | `no`
 * Optional: `score`
 */
export type FullLeadForAirtable = {
  name: string;
  email: string;
  income: number;
  savings: number;
  /** Airtable single select: "yes" | "no" */
  ownership: string;
  location: string;
  score?: number;
};

export function toAirtableLeadFields(b: FullLeadForAirtable): Record<string, string | number> {
  const fields: Record<string, string | number> = {
    name: b.name || "",
    email: b.email || "",
    income: b.income,
    savings: b.savings,
    ownership: b.ownership,
    location: b.location || ""
  };
  if (b.score !== undefined && Number.isFinite(b.score)) {
    fields.score = Math.round(b.score);
  }
  return fields;
}

/** @deprecated Message-only contact — map into Leads without message column (use location to hold context). */
export type SimpleLeadForAirtable = {
  name: string;
  email: string;
  message: string;
};

export function toAirtableLegacyMessageLead(b: SimpleLeadForAirtable): Record<string, string | number> {
  return toAirtableLeadFields({
    name: b.name,
    email: b.email,
    income: 0,
    savings: 0,
    ownership: "no",
    location: b.message.trim() ? b.message.trim().slice(0, 500) : "Website inquiry"
  });
}
