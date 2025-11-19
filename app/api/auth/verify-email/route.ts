import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await handlers.verifyEmail(request);
}
