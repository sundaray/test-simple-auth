import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "lucidauth";

interface GoogleUserClaims {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function createGoogleUser(
  userClaims: GoogleUserClaims
): Promise<User> {
  const existingGoogleAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.provider, "google"),
      eq(accounts.providerAccountId, userClaims.sub)
    ),
    with: { user: true },
  });

  if (existingGoogleAccount) {
    return {
      id: existingGoogleAccount.user.id,
      email: existingGoogleAccount.user.email,
      name: existingGoogleAccount.user.name,
      image: existingGoogleAccount.user.picture,
    };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, userClaims.email),
  });

  if (existingUser) {
    await db.insert(accounts).values({
      userId: existingUser.id,
      provider: "google",
      providerAccountId: userClaims.sub,
    });

    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      image: existingUser.picture,
    };
  }

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
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    image: newUser.picture,
  };
}
