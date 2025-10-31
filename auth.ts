import { initAuth } from "simple-next-auth";

export const { signIn, signOut, callback } = initAuth({
  session: {
    secret: "peonyiXItO1FDE3rNLVNI6S9U725x+gVIwCpXYjaxhrtlKvX/DoYvlRdG/biL47p",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: {
    google: {
      clientId:
        "1057649156345-5knm0r85qrhhumkt8smqmmg9kj84olvd.apps.googleusercontent.com",
      clientSecret: "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",
      redirectUri: "http://localhost:3000/api/auth/callback/google",
      scopes: ["openid", "email", "profile"],
    },
  },
});
