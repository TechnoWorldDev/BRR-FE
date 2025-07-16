import { z } from "zod";
import { RankingCategoryStatus } from "../types/models/RankingCategory";

// Ranking category statuses
export const rankingCategoryStatuses: RankingCategoryStatus[] = [
  "ACTIVE",
  "DELETED",
  "DRAFT"
];

// Ranking category type schema
export const rankingCategoryTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable()
});

// Entity schema (for related entities like City, Lifestyle, Brand, etc.)
export const entitySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
}).passthrough(); // passthrough allows additional properties

// Base schema for ranking category details
export const rankingCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters").nonempty("Name is required"),
  description: z.string().optional(),
  rankingCategoryTypeId: z.string({
    required_error: "Ranking category type is required"
  }),
  residenceLimitation: z.number().min(0, "Residence limitation must be a positive number"),
  rankingPrice: z.number().min(0, "Ranking price must be a positive number"),
  status: z.enum(rankingCategoryStatuses as [RankingCategoryStatus, ...RankingCategoryStatus[]], {
    required_error: "Status is required"
  }),
  featuredImageId: z.union([z.string(), z.instanceof(File)]).optional(),
  featuredImage: z.object({
    id: z.string(),
    originalFileName: z.string(),
    mimeType: z.string(),
    uploadStatus: z.string(),
    size: z.number()
  }).nullable().optional(),
  title: z.string().min(1, "Title should not be empty").max(255, "Title must be shorter than or equal to 255 characters"),
  entityId: z.string().optional(),
  entity: entitySchema.optional() // Dodajemo entity objekat
});

// Return type for the schema
export type RankingCategoryFormValues = z.infer<typeof rankingCategorySchema>;

// Initial values for a new ranking category
export const initialRankingCategoryValues: Partial<RankingCategoryFormValues> = {
  name: "",
  description: "",
  rankingCategoryTypeId: "",
  residenceLimitation: 0,
  rankingPrice: 0,
  status: "DRAFT",
  title: "",
  entityId: "",
  entity: undefined
};