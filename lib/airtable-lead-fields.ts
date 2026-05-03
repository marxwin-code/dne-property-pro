/**
 * Airtable **Leads** table (simple inquiries only) — field names must be lowercase and
 * match the base exactly: `name`, `email`, `message`.
 *
 * Do not send income/savings/ownership here; those belong to `risk_reports` / other tables.
 * `toAirtableLeadFields` builds the API `fields` object only from canonical server-side data
 * (never raw client passthrough).
 */
export type SimpleLeadForAirtable = {
  name: string;
  email: string;
  message: string;
};

export function toAirtableLeadFields(b: SimpleLeadForAirtable): Record<string, string> {
  return {
    name: b.name || "",
    email: b.email || "",
    message: b.message || ""
  };
}
