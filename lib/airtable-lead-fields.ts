/**
 * Maps canonical lead data → Airtable column names (must match your Base exactly).
 *
 * Defaults are lowercase: name, email, income, savings, ownership, location, score.
 * Override via env if your table uses different spellings (use exact casing only when needed).
 *
 * Env (each optional): AIRTABLE_LEADS_FIELD_NAME, _EMAIL, _INCOME, _SAVINGS,
 * _OWNERSHIP, _LOCATION, _SCORE
 *
 * By default env values are **normalized to lowercase** so `"Email"` env typos
 * become `email` and stop UNKNOWN_FIELD errors when the Base column is lowercase.
 * Set `AIRTABLE_LEADS_FIELD_NAMES_CASE_SENSITIVE=true` to use env strings exactly (for bases
 * that genuinely use mixed-case field names).
 */
function resolveFieldKey(envVar: string, fallbackLowercase: string): string {
  const raw = process.env[envVar]?.trim();
  const chosen = raw || fallbackLowercase;
  if (process.env.AIRTABLE_LEADS_FIELD_NAMES_CASE_SENSITIVE === "true") {
    return chosen;
  }
  return chosen.toLowerCase();
}

export const airtableLeadsFieldNames = {
  name: resolveFieldKey("AIRTABLE_LEADS_FIELD_NAME", "name"),
  email: resolveFieldKey("AIRTABLE_LEADS_FIELD_EMAIL", "email"),
  income: resolveFieldKey("AIRTABLE_LEADS_FIELD_INCOME", "income"),
  savings: resolveFieldKey("AIRTABLE_LEADS_FIELD_SAVINGS", "savings"),
  ownership: resolveFieldKey("AIRTABLE_LEADS_FIELD_OWNERSHIP", "ownership"),
  location: resolveFieldKey("AIRTABLE_LEADS_FIELD_LOCATION", "location"),
  score: resolveFieldKey("AIRTABLE_LEADS_FIELD_SCORE", "score")
} as const;

export type LeadBodyForAirtable = {
  name: string;
  email: string;
  income: number | null;
  savings: number | null;
  ownership: string;
  location: string;
  score: number | null;
};

/** Build the `fields` object for Airtable create — one key per column, no legacy PascalCase. */
export function toAirtableLeadFields(b: LeadBodyForAirtable): Record<string, string | number | null> {
  const k = airtableLeadsFieldNames;
  return {
    [k.name]: b.name,
    [k.email]: b.email,
    [k.income]: b.income,
    [k.savings]: b.savings,
    [k.ownership]: b.ownership,
    [k.location]: b.location,
    [k.score]: b.score
  };
}
