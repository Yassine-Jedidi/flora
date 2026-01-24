import * as z from "zod";

export const PackItemSchema = z.object({
  itemId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const PackSchema = z.object({
  name: z.string().min(2, "Pack name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  originalPrice: z.union([z.number(), z.string(), z.undefined(), z.null()])
    .transform((val) => (val === "" || val === null ? undefined : Number(val)))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), "Invalid price")
    .optional(),
  discountedPrice: z.coerce.number().min(0.001, "Sale price is required"),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.coerce.number().int().optional(),
  images: z.array(z.string()).optional(),
  itemImages: z.record(z.string(), z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isLive: z.boolean().default(true),
  packItems: z.array(PackItemSchema).min(1, "At least one product is required in the pack"),
});

export type PackFormValues = z.infer<typeof PackSchema>;
export type PackItemFormValues = z.infer<typeof PackItemSchema>;
