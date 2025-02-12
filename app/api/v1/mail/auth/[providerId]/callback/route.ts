import { NextRequest, NextResponse } from "next/server";
import { createDriver } from "@/app/api/driver";
import { connection } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/email?error=missing_params`,
    );
  }

  const { providerId } = await params;

  const driver = createDriver(providerId, {});

  try {
    const { tokens } = await driver.getTokens(code);
    if (!tokens.access_token) {
      console.error("Token exchange failed:", tokens);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/email?error=token_exchange_failed`,
      );
    }

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/email?error=token_exchange_failed`,
      );
    }
    const userInfo = await driver.getUserInfo({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
    });

    await db.insert(connection).values({
      providerId,
      id: crypto.randomUUID(),
      userId: state,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: driver.getScope(),
      expiresAt: new Date(Date.now() + 360000 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connect-emails?success=true`);
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/email?error=callback_failed`,
    );
  }
}
