import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createCredentialUser({
  email,
  hashedPassword,
}: {
  email: string;
  hashedPassword: string;
  [key: string]: unknown;
}): Promise<void> {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId));
  } else {
    const [newUser] = await db
      .insert(users)
      .values({ email, emailVerified: true })
      .returning();
    userId = newUser.id;
  }

  await db.insert(accounts).values({
    userId,
    provider: "credential",
    passwordHash: hashedPassword,
  });
}
