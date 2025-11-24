"use server";

import { signIn, signUp, signOut, forgotPassword, resetPassword } from "@/auth";
import { SuperAuthError } from "super-auth/core/errors";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schema";

export async function signInWithGoogleAction() {
  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof SuperAuthError) {
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
      redirectTo: `/${next}`,
    });
  } catch (error) {
    console.log("Credential sign in error: ", error);
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof SuperAuthError) {
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

    if (error instanceof SuperAuthError) {
      switch (error.name) {
        case "AccountAlreadyExistsError":
          return { error: "An account with this email already exists." };
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
    // This will redirect to /check-email
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof SuperAuthError) {
      // For security, don't reveal if email exists or not
      console.error("Forgot password error:", error);
    }

    // Always show success message (for security)
    return { error: null };
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
    // This will redirect to /signin?password-reset=success
  } catch (error) {
    console.log("Reset password error: ", error);
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof SuperAuthError) {
      switch (error.name) {
        case "InvalidPasswordResetTokenError":
          return { error: "Invalid or expired reset link." };
        case "VerifyPasswordResetTokenError":
          return { error: "Invalid or expired reset link." };
        case "PasswordResetTokenAlreadyUsedError":
          return { error: "This reset link has already been used." };
        case "UserNotFoundError":
          return { error: "User not found." };
      }
    }

    return { error: "Something went wrong. Please try again." };
  }
}
