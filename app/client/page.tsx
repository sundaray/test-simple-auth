"use client";

import { useUserSession } from "super-auth/react";

export default function ClientPage() {
  const session = useUserSession();
  return <h1 className="text-4xl mt-40">Welcome to your dashboard!</h1>;
}
