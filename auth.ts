import { initAuth } from "super-auth/next-js";
import { Google } from "super-auth/providers/google";
import { Credential } from "super-auth/providers/credential";

export const { signIn, signOut, getUserSession, handlers } = initAuth({
  baseUrl: "process.env.BASE_URL!",
  session: {
    secret: process.env.SESSION_SECRET!,
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_UI!,
      onAuthenticated: async (userClaims) => {
        console.log("Google user claims: ", userClaims);
        return { email: "hemanta@gmail.com", role: "admin" };
      },
    }),
    Credential({
      onSignUp: () => {},
      onSignIn: () => {
        return null;
      },
      emailVerification: {
        path: "/api/auth/verify-email",
        onError: "/",
        onSuccess: "/",
        sendVerificationEmail(params) {},
        onEmailVerified(data) {},
      },
    }),
  ],
});
