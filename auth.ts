import { lucidAuth } from "lucidauth/next-js";
import { Google } from "lucidauth/providers/google";
import { Credential } from "lucidauth/providers/credential";
import { updatePassword } from "./lib/auth/update-password";
import { sendPasswordResetEmail } from "./lib/auth/send-password-reset-email";
import { sendPasswordUpdateEmail } from "./lib/auth/send-password-update-email";
import { sendVerificationEmail } from "./lib/auth/send-verification-email";
import { createCredentialUser } from "./lib/auth/create-credential-user";
import { createGoogleUser } from "./lib/auth/create-google-user";
import { checkCredentialUserExists } from "./lib/auth/check-credential-user-exists";
import { getCredentialUser } from "./lib/auth/get-credential-user";

export const {
  signIn,
  signUp,
  signOut,
  getUserSession,
  forgotPassword,
  resetPassword,
  extendUserSessionMiddleware,
  handler,
} = lucidAuth({
  baseUrl: process.env.BASE_URL!,
  session: {
    secret: process.env.SESSION_SECRET!,
    maxAge: 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
      onAuthentication: {
        createGoogleUser,
        redirects: {
          error: "/",
        },
      },
    }),
    Credential({
      onSignUp: {
        checkCredentialUserExists,
        sendVerificationEmail,
        createCredentialUser,
        redirects: {
          signUpSuccess: "/signup/check-email",
          emailVerificationSuccess: "/signup/success",
          emailVerificationError: "/signup/error",
        },
      },
      onSignIn: {
        getCredentialUser,
      },
      onPasswordReset: {
        checkCredentialUserExists,
        sendPasswordResetEmail,
        updatePassword,
        sendPasswordUpdateEmail,
        redirects: {
          forgotPasswordSuccess: "/forgot-password/check-email",
          tokenVerificationSuccess: "/reset-password",
          tokenVerificationError: "/forgot-password/error",
          resetPasswordSuccess: "/reset-password/success",
        },
      },
    }),
  ],
});
