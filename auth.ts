import { initAuth } from "super-auth/next-js";
import { Google } from "super-auth/providers/google";

export const { signIn, signOut, getUserSession, handlers } = initAuth({
  baseUrl: "http://localhost:3000",
  session: {
    secret: "/kO4UMWvUOsoWiLACBlhykZ4TlPXT/mk7Qhwfg6zWrk=",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Google({
      clientId:
        "1057649156345-5knm0r85qrhhumkt8smqmmg9kj84olvd.apps.googleusercontent.com",
      clientSecret: "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",
      redirectUri: "http://localhost:3000/api/auth/callback/google",
      onAuthenticated: async () => {
        return { email: "hemanta@gmail.com", role: "admin" };
      },
    }),
  ],
});
