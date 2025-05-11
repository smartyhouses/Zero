import { env, WorkerEntrypoint } from 'cloudflare:workers';
import { mailtoHandler } from './routes/mailto-handler';
import type { HonoContext, HonoVariables } from './ctx';
import { routePartykitRequest } from 'partyserver';
import { partyserverMiddleware } from 'hono-party';
import { trpcServer } from '@hono/trpc-server';
import { DurableMailbox } from './lib/party';
import { chatHandler } from './routes/chat';
import { createAuth } from './lib/auth';
import { createDb } from '@zero/db';
import { appRouter } from './trpc';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

export { DurableMailbox };

const api = new Hono<{ Variables: HonoVariables; Bindings: Env }>()
  .use(
    '*',
    cors({
      origin: (_, c: HonoContext) => env.NEXT_PUBLIC_APP_URL,
      credentials: true,
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .use('*', async (c, next) => {
    const db = createDb(env.HYPERDRIVE.connectionString);
    c.set('db', db);
    const auth = createAuth(c);
    c.set('auth', auth);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    c.set('session', session);
    await next();
  })
  .post('/chat', async (c) => chatHandler(c))
  .get('/mailto-handler', async (c) => mailtoHandler(c))
  .on(['GET', 'POST'], '/auth/*', (c) => c.var.auth.handler(c.req.raw))
  .use(
    trpcServer({
      endpoint: '/api/trpc',
      router: appRouter,
      createContext: (_, c) => ({ c, session: c.var.session, db: c.var.db }),
      allowMethodOverride: true,
      onError: (opts) => {
        console.error('Error in TRPC handler:', opts.error);
      },
    }),
  )
  .onError(async (err, c) => {
    if (err instanceof Response) return err;
    console.error('Error in Hono handler:', err);
    return c.json(
      {
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      500,
    );
  });

const app = new Hono<{ Variables: HonoVariables; Bindings: Env }>()
  .route('/api', api)
  .get('/health', (c) => c.json({ message: 'Zero Server is Up!' }))
  .get('/', (c) => {
    return c.redirect(`${env.NEXT_PUBLIC_APP_URL}`);
  })
  .use(
    '*',
    partyserverMiddleware({
      onError(error) {
        console.log('Error in party middleware:', error);
      },
      options: {
        prefix: 'zero',
      },
    }),
  );

export default class extends WorkerEntrypoint {
  fetch(request: Request): Response | Promise<Response> {
    if (request.url.includes('/zero/durable-mailbox')) {
      return routePartykitRequest(request, env as any, {
        prefix: 'zero',
      }) as Promise<Response>;
    }
    return app.fetch(request);
  }

  public notifyUser({ email }: { email: string }) {
    const durableObject = env.DURABLE_MAILBOX.idFromString(`${email}:general`);
    if (env.DURABLE_MAILBOX.get(durableObject)) {
      const stub = env.DURABLE_MAILBOX.get(durableObject);
      if (stub) stub.broadcast(`HELLO ${email}`);
    }
  }
}
