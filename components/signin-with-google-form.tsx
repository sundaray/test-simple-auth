"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/auth";

export function SignInWitjGoogleForm() {
  const [isPending, setIsPending] = useState(false);

  async function handleSignInWithGoogle() {
    await signIn.google();
  }
  return (
    <div>
      <Button
        variant="ghost"
        size="lg"
        onClick={handleSignInWithGoogle}
        disabled={isPending}
        className="h-10 w-full border hover:border-zinc-300 text-base text-zinc-700"
      >
        <Icons.google className="inline-block size-5" />
        Sign in with Google
      </Button>
    </div>
  );
}
