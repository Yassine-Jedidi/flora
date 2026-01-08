import * as z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  originalPrice: z.coerce.number().min(0.001, "Price must be at least 0.001"),
  discountedPrice: z.coerce.number().min(0.001).optional().or(z.literal(0)).transform(val => val === 0 ? undefined : val),
  categoryId: z.string().min(1, "Please select a category"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isFeatured: z.boolean(),
  isArchived: z.boolean(),
}).refine(data => {
  if (data.discountedPrice && data.discountedPrice >= data.originalPrice) {
    return false;
  }
  return true;
}, {
  message: "Discounted price must be less than original price",
  path: ["discountedPrice"],
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});
