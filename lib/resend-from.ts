/**
 * Outbound `from` must use a domain **verified in Resend**.
 * Add **mail.depropertypro.com** at https://resend.com/domains and complete DNS (SPF/DKIM).
 *
 * Optional env override (full RFC5322 form):
 * `RESEND_FROM_ADDRESS=D&E Property Pro <info@mail.depropertypro.com>`
 */
export const RESEND_FROM =
  process.env.RESEND_FROM_ADDRESS?.trim() ||
  "D&E Property Pro <info@mail.depropertypro.com>";

/**
 * Customer replies — keep your main inbox on the apex domain if MX points there.
 * Optional: `RESEND_REPLY_TO_ADDRESS=info@depropertypro.com`
 */
export const RESEND_REPLY_TO =
  process.env.RESEND_REPLY_TO_ADDRESS?.trim() || "info@depropertypro.com";
