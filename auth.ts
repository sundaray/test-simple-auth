import { superAuth } from "super-auth/next-js";
import { Google } from "super-auth/providers/google";
import { Credential } from "super-auth/providers/credential";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const { signIn, signOut, getUserSession, handlers } = superAuth({
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
        // Step 1: Check if THIS specific Google account is already linked
        const existingGoogleAccount = await db.query.accounts.findFirst({
          where: and(
            eq(accounts.provider, "google"),
            eq(accounts.providerAccountId, userClaims.sub)
          ),
          with: { user: true },
        });

        if (existingGoogleAccount) {
          // Scenario 1: Google account exists - sign in
          return {
            userId: existingGoogleAccount.user.id,
            email: existingGoogleAccount.user.email,
            name: existingGoogleAccount.user.name,
            picture: existingGoogleAccount.user.picture,
            provider: "google",
          };
        }

        // Step 2: Check if user exists by email
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, userClaims.email),
        });

        if (existingUser) {
          // Scenario 2: User exists, but Google account doesn't
          // Create a Google account
          await db.insert(accounts).values({
            userId: existingUser.id,
            provider: "google",
            providerAccountId: userClaims.sub,
          });

          // Auto-upgrade email verification if Google confirms it
          if (userClaims.email_verified && !existingUser.emailVerified) {
            await db
              .update(users)
              .set({ emailVerified: true })
              .where(eq(users.id, existingUser.id));
          }

          return {
            userId: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            picture: existingUser.picture,
            provider: "google",
          };
        }

        // Step 3: No user exists - create both user AND account
        const [newUser] = await db
          .insert(users)
          .values({
            email: userClaims.email,
            emailVerified: userClaims.email_verified ?? false,
            name: userClaims.name ?? null,
            picture: userClaims.picture ?? null,
          })
          .returning();

        await db.insert(accounts).values({
          userId: newUser.id,
          provider: "google",
          providerAccountId: userClaims.sub,
        });

        return {
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          picture: newUser.picture,
          provider: "google",
        };
      },
    }),
    Credential({
      onSignUp: () => {},
      onSignIn: async ({ email }) => {
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
          with: {
            accounts: {
              where: eq(accounts.provider, "credential"),
              columns: {
                passwordHash: true,
              },
            },
          },
        });

        if (!user || !user.accounts[0].passwordHash) {
          return null;
        }

        const credentialAccount = user.accounts[0];

        return {
          email: user.email,
          name: user.name,
          picture: user.picture,
          hashedPassword: credentialAccount.passwordHash,
        };
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
