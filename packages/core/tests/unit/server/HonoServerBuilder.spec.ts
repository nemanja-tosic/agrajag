import { Hono } from 'hono';
import { expect } from 'chai';
import { HonoServerBuilder } from '../../../src/server/HonoServerBuilder.js';
import { ForbiddenError } from '../../../src/server/HttpError.js';
import type { EndpointSchema } from '../../../src/endpoints/Endpoints.js';
import type { ResourceDefinition } from '../../../src/resources/ResourceDefinition.js';

// Regression for the fatal body-parse bug: `await c.req.json()` used to run
// inside `new Promise(async resolve => …)` executors, where a rejection does
// not propagate — a body-less or malformed-JSON POST/PATCH became an
// unhandledRejection that killed the whole process (and the route hung).
describe('HonoServerBuilder body parsing', () => {
  const stubSchema = {} as ResourceDefinition;
  const stubEndpointSchema = () => ({}) as EndpointSchema;

  const buildApp = () => {
    const builder = new HonoServerBuilder(new Hono());
    builder.addPost(
      stubSchema,
      stubEndpointSchema,
      '/things',
      (body, _params, respond) =>
        respond({ body: { data: { type: 'things', id: '1' } }, status: 201 }),
    );
    builder.addPatch(
      stubSchema,
      stubEndpointSchema,
      '/things/:id',
      (body, _params, respond) =>
        respond({
          body: { data: { type: 'things', id: String(body ? 1 : 0) } },
          status: 200,
        }),
    );
    return builder.build();
  };

  it('responds 400 to a body-less POST instead of dying with an unhandled rejection', async () => {
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => void rejections.push(reason);
    process.on('unhandledRejection', onRejection);
    try {
      // pre-fix: this await never resolved (mocha timeout) and the rejection
      // escaped to the process
      const response = await buildApp().request('/things', { method: 'POST' });
      expect(response.status).to.equal(400);
      await new Promise(resolve => setImmediate(resolve));
      expect(rejections).to.have.length(0);
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });

  it('responds 400 to malformed JSON on PATCH', async () => {
    const response = await buildApp().request('/things/1', {
      method: 'PATCH',
      body: '{not json',
      headers: { 'content-type': 'application/json' },
    });
    expect(response.status).to.equal(400);
  });

  it('still parses valid JSON bodies', async () => {
    const response = await buildApp().request('/things', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
      headers: { 'content-type': 'application/json' },
    });
    expect(response.status).to.equal(201);
    expect(await response.json()).to.deep.equal({
      data: { type: 'things', id: '1' },
    });
  });

  it('adds Hono variables to resolver context', async () => {
    type Variables = {
      requestId: string;
      user: { sub: string };
    };
    const app = new Hono<{ Variables: Variables }>();
    app.use('*', async (c, next) => {
      c.set('requestId', 'request-1');
      c.set('user', { sub: 'user-1' });
      await next();
    });
    const builder = new HonoServerBuilder(app as unknown as Hono);
    builder.addGet(
      stubSchema,
      stubEndpointSchema,
      '/things',
      (params, respond) => {
        const resolverParams = params as typeof params & {
          context?: Variables;
          user?: Variables['user'];
        };

        return respond({
          body: {
            data: {
              type: 'context',
              id: `${resolverParams.context?.requestId}:${resolverParams.user?.sub}`,
            },
          },
          status: 200,
        });
      },
    );

    const response = await builder.build().request('/things');

    expect(response.status).to.equal(200);
    expect(await response.json()).to.deep.equal({
      data: {
        type: 'context',
        id: 'request-1:user-1',
      },
    });
  });
});

describe('HonoServerBuilder include parsing', () => {
  const stubSchema = {} as ResourceDefinition;
  const stubEndpointSchema = () => ({}) as EndpointSchema;

  const captureInclude = () => {
    const captured: { include?: unknown } = {};
    const builder = new HonoServerBuilder(new Hono());
    builder.addGet(stubSchema, stubEndpointSchema, '/things', async (params, respond) => {
      captured.include = (params as { include?: unknown }).include;
      await respond({ body: { data: [] }, status: 200 });
    });
    return { app: builder.build(), captured };
  };

  it('normalizes a single-value include to a one-element array', async () => {
    const { app, captured } = captureInclude();
    await app.request('/things?include=matches');
    expect(captured.include).to.deep.equal(['matches']);
  });

  it('keeps comma-joined includes as an array', async () => {
    const { app, captured } = captureInclude();
    await app.request('/things?include=a,b');
    expect(captured.include).to.deep.equal(['a', 'b']);
  });

  it('leaves an absent include undefined', async () => {
    const { app, captured } = captureInclude();
    await app.request('/things');
    expect(captured.include).to.equal(undefined);
  });
});

describe('HonoServerBuilder handler rejection', () => {
  const stubSchema = {} as ResourceDefinition;
  const stubEndpointSchema = () => ({}) as EndpointSchema;

  const buildThrowingApp = (error: Error) => {
    const builder = new HonoServerBuilder(new Hono());
    builder.addGet(stubSchema, stubEndpointSchema, '/things', async () => {
      throw error;
    });
    builder.addPost(
      stubSchema,
      stubEndpointSchema,
      '/things',
      async () => {
        throw error;
      },
    );
    return builder.build();
  };

  it('responds 500 when a GET handler rejects before calling respond', async () => {
    const app = buildThrowingApp(new Error('boom'));
    const res = await app.request('/things');
    expect(res.status).to.equal(500);
    const body = (await res.json()) as { errors: { status: string }[] };
    expect(body.errors[0].status).to.equal('500');
  });

  it('responds 500 when a POST handler rejects before calling respond', async () => {
    const app = buildThrowingApp(new Error('boom'));
    const res = await app.request('/things', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: {} }),
    });
    expect(res.status).to.equal(500);
  });

  it('maps a typed HttpError thrown by a handler to its status', async () => {
    const app = buildThrowingApp(new ForbiddenError('not yours'));
    const res = await app.request('/things');
    expect(res.status).to.equal(403);
    const body = (await res.json()) as { errors: { detail: string }[] };
    expect(body.errors[0].detail).to.equal('not yours');
  });
});
