/**
 * Leads table field names are **lowercase** and must match the Airtable base:
 * name, email, income, savings, ownership, location, (optional) score
 *
 * `toAirtableLeadFields` always uses these exact API keys (no client passthrough).
 */
export type LeadBodyForAirtable = {
  name: string;
  email: string;
  income: number;
  savings: number;
  ownership: string;
  location: string;
  /** Omitted from the Airtable request when null (add a `score` column if you send it). */
  score: number | null;
};

/**
 * Build the `fields` object: `name` ← data.name, `email` ← data.email, etc.
 * Numbers are never null (Airtable is happier with 0 than null for numeric fields).
 */
export function toAirtableLeadFields(b: LeadBodyForAirtable): Record<string, string | number> {
  const fields: Record<string, string | number> = {
    name: b.name.trim() || "Lead",
    email: b.email.trim(),
    income: b.income,
    savings: b.savings,
    ownership: b.ownership,
    location: b.location
  };
  if (b.score != null && Number.isFinite(b.score)) {
    fields.score = b.score;
  }
  return fields;
}
