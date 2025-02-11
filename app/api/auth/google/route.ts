import { NextRequest, NextResponse } from "next/server";
import { googleConnection } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    const userId = session?.user?.id;

    if (!userId) {
      console.log("No userId found in session");
      return NextResponse.json(
        { error: "Not authenticated", session: session || null },
        { status: 401 },
      );
    }

    const SCOPES = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    // Create a new connection ID that we'll use to track this OAuth flow
    const connectionId = uuidv4();

    // Store initial connection record
    await db.insert(googleConnection).values({
      id: connectionId,
      userId: userId,
      email: session.user.email,
      accessToken: "",
      scope: SCOPES.join(" "),
      expiresAt: new Date(Date.now() + 3600 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: connectionId,
    })}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication error", details: (error as Error).message },
      { status: 500 },
    );
  }
}
