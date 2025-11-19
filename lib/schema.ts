import * as z from "zod";

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

export const signUpSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(2, "Name must be at least 2 characters."),
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, "Password must be at least 8 characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
