import * as z from "zod";

export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty")
    .max(500, "Post content cannot exceed 500 characters"),
});

export type PostValues = z.infer<typeof postSchema>;
