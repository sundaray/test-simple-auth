import { UserAccountNavClient } from "@/components/user-account-nav-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";

export async function UserAccountNav() {
  const user = null;

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
