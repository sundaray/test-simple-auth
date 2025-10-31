import { initAuth } from "simple-next-auth";

export const { signIn } = initAuth({
  session: {
    secret: "hellaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaao",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: {
    google: {
      clientId: "hello",
      clientSecret: "secret",
      redirectUri: "http://localhost:3000/api/auth/callback/google",
      scopes: ["openid", "email", "profile"],
    },
  },
});
