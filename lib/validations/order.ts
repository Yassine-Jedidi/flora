import * as z from "zod";

export const OrderSchema = z.object({
  fullName: z.string().min(3, {
    message: "Le nom doit contenir au moins 3 caractères.",
  }),
  phoneNumber: z.string().length(8, {
    message: "Le numéro de téléphone doit contenir exactement 8 chiffres.",
  }),
  governorate: z.string().min(1, {
    message: "Veuillez sélectionner un gouvernorat.",
  }),
  city: z.string().min(1, {
    message: "Veuillez sélectionner une ville/délégation.",
  }),
  detailedAddress: z.string().min(5, {
    message: "L'adresse doit être plus détaillée.",
  }),
});

export type OrderFormValues = z.infer<typeof OrderSchema>;
