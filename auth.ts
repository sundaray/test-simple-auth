import { initAuth } from "super-auth/next-js";
import { Google } from "super-auth/providers/google";

export const { signIn, signOut, handleCallback, getUserSession } = initAuth({
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
    }),
  ],
  callbacks: {
    onSignIn: async (userInfo) => {
      console.log("User Info: ", userInfo);
      return {
        name: "hemanta",
        email: "rawgrittt@gmail.com",
        role: "admin",
      };
    },
  },
});
