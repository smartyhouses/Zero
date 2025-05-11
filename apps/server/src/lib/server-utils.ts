import { connection } from '@zero/db/schema';
import type { HonoContext } from '../ctx';
import { createDriver } from './driver';
import { and, eq } from 'drizzle-orm';

export const getActiveConnection = async (c: HonoContext) => {
  const { session, db } = c.var;
  if (!session?.user) throw new Error('Session Not Found');
  if (!session.activeConnection?.id) {
    const activeConnection = await db.query.connection.findFirst({
      where: and(eq(connection.userId, session.user.id)),
    });
    if (!activeConnection)
      throw new Error(`Active connection not found for user ${session.user.id}`);

    if (!activeConnection.refreshToken || !activeConnection.accessToken)
      throw new Error(
        'Active Connection is not properly authorized, please reconnect the connection',
      );
    return activeConnection;
  }

  const activeConnection = await db.query.connection.findFirst({
    where: and(
      eq(connection.userId, session.user.id),
      eq(connection.id, session.activeConnection.id),
    ),
  });

  if (!activeConnection) throw new Error('Active connection not found');

  if (!activeConnection.refreshToken || !activeConnection.accessToken)
    throw new Error(
      'Active Connection is not properly authorized, please reconnect the connection',
    );
  return activeConnection;
};

export const connectionToDriver = (
  activeConnection: typeof connection.$inferSelect,
  c: HonoContext,
) => {
  const driver = createDriver(
    activeConnection.providerId,
    {
      auth: {
        accessToken: activeConnection.accessToken,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        refreshToken: activeConnection.refreshToken!,
        email: activeConnection.email,
        // accountId: activeConnection.id,
        userId: activeConnection.userId,
      },
      c,
    },
    c,
  );
  return driver;
};
