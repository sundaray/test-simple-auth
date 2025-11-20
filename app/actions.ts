"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "super-auth/core/errors";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signInSchema, signUpSchema } from "@/lib/schema";

export async function signInWithGoogleAction() {
  try {
    await signIn("google", {
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log("Google sign-in error: ", error);
    }
    if (isRedirectError(error)) {
      throw error;
    }
  }
}

export async function signOutAction() {
  await signOut();
}

export async function signInWithEmailAndPassword(next: string, data: unknown) {
  const parsed = signInSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid input data" };
  }

  try {
    await signIn("credential", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: next,
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;

    if (error instanceof AuthError) {
      switch (error.name) {
        case "InvalidCredentialsError":
          return { error: "Invalid email or password." };
        case "AccountNotFoundError":
          return { error: "No account found with this email." };
        case "VerifyEmailError":
          return { error: "Please verify your email address." };
        default:
          return { error: error.message };
      }
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}

// New Sign Up Action
export async function signUpWithEmailAndPassword(data: unknown) {
  const parsed = signUpSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid input data" };
  }

  try {
    // TODO: Implement your library's signUp method here
    // await auth.signUp({ ...parsed.data });
    console.log("Sign up data:", parsed.data);
    return { error: "Sign up not implemented yet." };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: "Something went wrong." };
  }
}
