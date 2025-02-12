import { googleConnection } from "@/db/schema";
import { NextRequest } from "next/server";
import { createDriver } from "./driver";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export const GET = async ({ headers, nextUrl }: NextRequest) => {
  const searchParams = nextUrl.searchParams;
  const session = await auth.api.getSession({ headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  // Updated to use googleConnection table
  const [connection] = await db
    .select()
    .from(googleConnection)
    .where(eq(googleConnection.userId, session.user.id));

  if (!connection?.accessToken || !connection.refreshToken)
    return new Response("Unauthorized, reconnect", { status: 402 });

  const driver = createDriver("google", {
    // Assuming "google" is the provider ID
    auth: {
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
    },
  });

  if (!searchParams.has("folder")) return new Response("Bad Request", { status: 400 });

  return new Response(
    JSON.stringify(
      await driver.list(
        searchParams.get("folder")!,
        searchParams.get("q") ?? undefined,
        Number(searchParams.get("max")) ? +searchParams.get("max")! : undefined,
        searchParams.get("labelIds") ? searchParams.get("labelIds")!.split(",") : undefined,
      ),
    ),
  );
};
