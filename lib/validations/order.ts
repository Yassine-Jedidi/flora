import * as z from "zod";

export const OrderSchema = z.object({
  fullName: z.string().min(3, {
    message: "Name must contain at least 3 characters.",
  }),
  phoneNumber: z.string().length(8, {
    message: "Phone number must be exactly 8 digits.",
  }).regex(/^\d+$/, {
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
  quantity: z.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
});

export type OrderFormValues = z.infer<typeof OrderSchema>;
