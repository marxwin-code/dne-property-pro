import { en, type SiteText } from "./text-en";
import { zh } from "./text-zh";

export type Lang = "en" | "zh";

/** Single site-wide copy tree — mirror `en` / `zh` structures exactly. */
export const text = {
  en,
  zh
} as const;

export type { SiteText };
