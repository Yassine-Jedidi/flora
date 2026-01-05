import * as z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  categoryId: z.string().min(1, "Please select a category"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});
