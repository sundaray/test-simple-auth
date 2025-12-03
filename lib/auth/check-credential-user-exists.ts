import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkCredentialUserExists({
  email,
}: {
  email: string;
}): Promise<{ exists: boolean }> {
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

  return { exists: user.accounts.length > 0 };
}
