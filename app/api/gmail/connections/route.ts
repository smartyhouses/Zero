import { NextRequest, NextResponse } from "next/server";
import { googleConnection } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const connections = await db
      .select({
        id: googleConnection.id,
        email: googleConnection.email,
        name: googleConnection.name,
        picture: googleConnection.picture,
        createdAt: googleConnection.createdAt,
      })
      .from(googleConnection)
      .where(eq(googleConnection.userId, userId));

    console.log("Found connections:", connections);

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}
