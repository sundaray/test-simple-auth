"use server";

import { signIn, signUp, signOut, forgotPassword, resetPassword } from "@/auth";
import { LucidAuthError } from "lucidauth/core/errors";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schema";

export async function signInWithGoogle() {
  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    console.error("Sign in with Google error ", error);
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof LucidAuthError) {
      console.log("Google sign-in error: ", error);
    }
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
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
      redirectTo: `/${next}`,
    });
  } catch (error) {
    console.log("Credential sign in error: ", error);
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof LucidAuthError) {
      switch (error.name) {
        case "AccountNotFoundError":
          return { error: "No account found with this email. Please sign up." };

        case "InvalidCredentialsError":
          return { error: "Invalid email or password." };
      }
    }
    return { error: "Something went wrong. Please try again." };
  }
}

// Sign Up Action
export async function signUpWithEmailAndPassword(data: unknown) {
  const parsed = signUpSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid input data" };
  }

  try {
    await signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof LucidAuthError) {
      switch (error.name) {
        case "AccountAlreadyExistsError":
          return {
            error: "An account with this email already exists. Please sign in.",
          };
      }
    }

    return { error: "Something went wrong. Please try again." };
  }
}

// Forgot Password Action
export async function forgotPasswordAction(email: string) {
  const parsed = forgotPasswordSchema.safeParse({ email });

  if (!parsed.success) {
    return { error: "Invalid email address" };
  }

  try {
    await forgotPassword(parsed.data.email);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    // This means forgot password processing failed. this is a true error.
    if (error instanceof LucidAuthError) {
      // For security, don't reveal if email exists or not
      console.error("Forgot password error:", error);
    }

    // Always show success message (for security)
    return { error: "Something went wrong. Please try again." };
  }
}

// Reset Password Action
export async function resetPasswordAction(token: string, newPassword: string) {
  const parsed = resetPasswordSchema.safeParse({
    password: newPassword,
    confirmPassword: newPassword,
  });

  if (!parsed.success) {
    return { error: "Invalid password" };
  }

  try {
    await resetPassword(token, parsed.data.password);
  } catch (error) {
    console.log("Reset password error: ", error);
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof LucidAuthError) {
      switch (error.name) {
        case "InvalidPasswordResetTokenError":
          return { error: "Invalid or expired reset link." };
      }
    }

    return { error: "Something went wrong. Please try again." };
  }
}
