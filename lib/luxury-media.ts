/** Default listing image when URL missing or load fails — https Unsplash (temporary test asset per product spec). */
export const PROPERTY_IMG_FALLBACK =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=88";

/** Hero first screen — luxury exterior / dusk contrast & lighting. */
export const HERO_LUXURY_EXTERIOR =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=88";

/** Demo / fallback listings — luxury modern, premium interior idiom, 16:9-friendly crops @ 1600px. */
export const LUXURY_LISTING_IMAGES = {
  exterior:
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=88",
  living:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=88",
  kitchen:
    "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1600&q=88",
  bedroom:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=88",
  architectural:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=88"
} as const;
