import * as z from "zod";

// Base address fields used in the form UI
export const AddressSchema = z.object({
  fullName: z
    .string()
    .min(3, {
      message: "Name must contain at least 3 characters.",
    })
    .max(50, {
      message: "Name cannot exceed 50 characters.",
    }),
  phoneNumber: z
    .string()
    .length(8, {
      message: "Phone number must be exactly 8 digits.",
    })
    .regex(/^\d+$/, {
      message: "Phone number must contain only digits.",
    }),
  governorate: z.string().min(1, {
    message: "Please select a governorate.",
  }),
  city: z.string().min(1, {
    message: "Please select a city/delegation.",
  }),
  detailedAddress: z
    .string()
    .min(3, {
      message: "Address must be more detailed.",
    })
    .max(150, {
      message: "Address cannot exceed 150 characters.",
    }),
  saveAddress: z.boolean().optional(),
});

// Full order schema including cart items and total (for the server action)
export const OrderSchema = AddressSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, { message: "Product ID is required." }),
        quantity: z
          .number()
          .int()
          .positive({ message: "Quantity must be at least 1." }),
        price: z.number().positive({ message: "Price must be positive." }),
      }),
    )
    .min(1, { message: "Cart cannot be empty." }),
  totalPrice: z.number().positive({ message: "Total price must be positive." }),
});

export type AddressValues = z.infer<typeof AddressSchema>;
export type OrderValues = z.infer<typeof OrderSchema>;
