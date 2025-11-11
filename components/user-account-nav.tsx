import { UserAccountNavClient } from "@/components/user-account-nav-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getUserSession } from "@/auth";

export async function UserAccountNav() {
  const user = await getUserSession();

  return (
    <div className="hidden md:block">
      {user ? (
        <UserAccountNavClient user={user} />
      ) : (
        <Link
          href="/signin"
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
