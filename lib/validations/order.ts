import * as z from "zod";

export const OrderSchema = z.object({
  fullName: z.string().min(3, {
    message: "Name must contain at least 3 characters.",
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
  detailedAddress: z.string().min(3, {
    message: "Address must be more detailed.",
  }),
  saveAddress: z.boolean().optional(),
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

// Schema for the checkout form (excludes derived cart data)
export const CheckoutFormSchema = OrderSchema.omit({
  items: true,
  totalPrice: true,
});

export type OrderFormValues = z.infer<typeof OrderSchema>;
export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;
