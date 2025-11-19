import * as z from "zod";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string("Password is required."),
});

export const signUpSchema = z.object({
  name: z.string("Name is required."),
  email: z.email("Please enter a valid email address."),
  password: z.string("Password is required."),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
