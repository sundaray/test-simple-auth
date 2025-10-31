import { callback } from "@/auth";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await callback.google(request);
}
