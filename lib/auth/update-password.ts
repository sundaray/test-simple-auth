import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function updatePassword({
  email,
  hashedPassword,
}: {
  email: string;
  hashedPassword: string;
}) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) return;

  // Update the password in the accounts table
  await db
    .update(accounts)
    .set({ passwordHash: hashedPassword })
    .where(
      and(eq(accounts.userId, user.id), eq(accounts.provider, "credential"))
    );
}
