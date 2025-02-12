import { googleConnection } from "@/db/schema";
import { createDriver } from "../mail/driver";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export const GET = async (
  { headers }: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
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

  const res = await driver.get(id);
  return new Response(JSON.stringify(res));
};
