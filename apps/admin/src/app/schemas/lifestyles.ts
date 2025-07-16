import { z } from "zod";

export const lifestyleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
});

export type LifestyleFormValues = z.infer<typeof lifestyleSchema>;

export const initialLifestyleValues: LifestyleFormValues = {
  name: "",
};
