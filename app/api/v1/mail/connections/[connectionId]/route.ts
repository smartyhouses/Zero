import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { connectionId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await db
      .delete(connection)
      .where(and(eq(connection.id, params.connectionId), eq(connection.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete connection:", error);
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}
