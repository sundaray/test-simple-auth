import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { User } from "lucidauth";

export async function getCredentialUser({
  email,
}: {
  email: string;
}): Promise<(User & { hashedPassword: string }) | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return null;
  }

  const credentialAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.userId, user.id),
      eq(accounts.provider, "credential")
    ),
  });

  if (!credentialAccount) {
    return null;
  }

  if (!credentialAccount.passwordHash) {
    return null;
  }

  return {
    email: user.email,
    name: user.name,
    image: user.picture,
    hashedPassword: credentialAccount.passwordHash,
  };
}
