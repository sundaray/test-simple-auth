import { SignInWitjGoogleForm } from "@/components/signin-with-google-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn() {
  return (
    <div className="mx-auto my-36 max-w-[440px] px-4">
      <h2 className="text-center text-4xl font-bold tracking-tight text-zinc-900">
        Welcome
      </h2>
      <p className="mt-4 mb-8 text-center text-zinc-700">
        Sign in to your account
      </p>
      <SignInWitjGoogleForm />
    </div>
  );
}
