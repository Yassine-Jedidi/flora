import * as z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  originalPrice: z.union([z.number(), z.string(), z.undefined(), z.null()])
    .transform((val) => (val === "" || val === null ? undefined : Number(val)))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), "Invalid price")
    .optional(),
  discountedPrice: z.coerce.number().min(0.001, "Sale price is required"),
  categoryId: z.string().min(1, "Please select a category"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isLive: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});
