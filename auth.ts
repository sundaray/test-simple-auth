import { superAuth } from "super-auth/next-js";
import { Google } from "super-auth/providers/google";
import { Credential } from "super-auth/providers/credential";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { EmailVerificationTemplate } from "@/components/email-verification-template";
import { PasswordResetTemplate } from "@/components/password-reset-template";
import { PasswordChangeConfirmationTemplate } from "@/components/password-change-confirmation-template";

export const { signIn, signUp, signOut, getUserSession, handler } = superAuth({
  baseUrl: process.env.BASE_URL!,
  session: {
    secret: process.env.SESSION_SECRET!,
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      onSignUp: {
        // Check if user with credenial account exists
        checkUserExists: async (email) => {
          // Step 1: Find user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          // If user doesn't exist at all, return false
          if (!user) {
            return false;
          }

          // Step 2: Check if this user has a credential account
          const credentialAccount = await db.query.accounts.findFirst({
            where: and(
              eq(accounts.userId, user.id),
              eq(accounts.provider, "credential")
            ),
          });

          // Return true only if credential account exists
          if (credentialAccount) {
            return true;
          }
          return false;
        },
        // Send verification email
        sendVerificationEmail: async ({ email, url }) => {
          try {
            await resend.emails.send({
              from: "auth@hemantasundaray.com",
              to: [email],
              subject: "Verify your email address",
              react: EmailVerificationTemplate({
                email,
                verificationUrl: url,
              }),
            });
          } catch (error) {
            console.log("Send verification email error: ", error);
          }
        },
        // Create user after email verification
        createUser: async ({ email, hashedPassword, ...rest }) => {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          let userId: string;

          // User exists (via Google), just link the new credential account
          if (existingUser) {
            userId = existingUser.id;

            // Mark email as verified in the suers table
            await db
              .update(users)
              .set({ emailVerified: true })
              .where(eq(users.id, userId));
          } else {
            // brand new user
            const [newUser] = await db
              .insert(users)
              .values({ email, emailVerified: true })
              .returning();
            userId = newUser.id;
          }

          // Create the credential account
          await db.insert(accounts).values({
            userId,
            provider: "credential",
            passwordHash: hashedPassword,
          });
        },
        redirects: {
          emailVerificationSuccess: "/signin?verified=true",
          emailVerificationError: "/",
        },
      },
      onSignIn: async ({ email }) => {
        // Step 1: Check if user exists by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        // If user doesn't exist at all, return null
        if (!user) {
          return null;
        }

        // Step 2: Now check if this user has a credential account
        const credentialAccount = await db.query.accounts.findFirst({
          where: and(
            eq(accounts.userId, user.id),
            eq(accounts.provider, "credential")
          ),
        });

        // If no credential account exists, return null
        if (!credentialAccount) {
          return null;
        }

        // Step 3: Return user data with password hash
        return {
          email: user.email,
          name: user.name,
          picture: user.picture,
          hashedPassword: credentialAccount.passwordHash,
        };
      },

      onPasswordReset: {
        checkUserExists: async ({ email }) => {
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            with: {
              accounts: {
                where: eq(accounts.provider, "credential"),
              },
            },
          });

          if (!user) {
            return { exists: false };
          }
          return { exists: true, passwordHash: user?.accounts[0].passwordHash };
        },
        sendPasswordResetEmail: async ({ email, url }) => {
          await resend.emails.send({
            from: "auth@hemantasundaray.com",
            to: [email],
            subject: "Reset your password",
            react: PasswordResetTemplate({
              email,
              resetUrl: url,
            }),
          });
        },
        sendPasswordChangeEmail: async ({ email }) => {
          await resend.emails.send({
            from: "auth@hemantasundaray.com",
            to: [email],
            subject: "Password changed successfully",
            react: PasswordChangeConfirmationTemplate({
              email,
            }),
          });
        },
        updatePassword: async ({ email, hashedPassword }) => {
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) return;

          // Update the password in the accounts table
          await db
            .update(accounts)
            .set({ passwordHash: hashedPassword })
            .where(
              and(
                eq(accounts.userId, user.id),
                eq(accounts.provider, "credential")
              )
            );
        },
        redirects: {
          checkEmail: "/",
          resetForm: "/reset-password",
          resetPasswordSuccess: "/",
          resetPasswordError: "/",
        },
      },
    }),
  ],
});
