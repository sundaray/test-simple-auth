"use client";

import { useUserSession } from "super-auth/react";

export default function ClientPage() {
  const session = useUserSession();

  console.log("User session in Client Component: ", session);
  return <h1 className="text-4xl mt-40">Welcome to your dashboard!</h1>;
}
