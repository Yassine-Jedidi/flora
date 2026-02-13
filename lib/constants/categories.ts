/**
 * Product category constants
 */

export const VALID_CATEGORIES = [
  "rings",
  "bracelets",
  "necklaces",
  "earrings",
  "packs",
] as const;

export type CategorySlug = (typeof VALID_CATEGORIES)[number];

export const isValidCategory = (
  category: string | undefined,
): category is CategorySlug => {
  return (
    !!category && (VALID_CATEGORIES as readonly string[]).includes(category)
  );
};
