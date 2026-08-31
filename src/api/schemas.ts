import { z } from "zod";

const refRangeSchema = z.object({ min: z.number(), max: z.number() });

const measurementSchema = z.object({
  value: z.number(),
  unit: z.string().default(""),
  ref_range: refRangeSchema.optional(),
});

const medicalReportSchema = z.object({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  date: z.string().optional(),
  measurements: z.array(z.tuple([z.string(), measurementSchema])).default([]),
});

export const healthDataSchema = z.object({
  reports: z.array(medicalReportSchema).default([]),
});

export const uploadedFileMetadataSchema = z.object({
  path: z.string(),
  name: z.string(),
});
